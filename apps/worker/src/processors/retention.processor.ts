import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Sequelize, QueryTypes } from 'sequelize';
import { InjectConnection } from '@nestjs/sequelize';
import type { AppConfig } from '@plaksha/shared-config';

import { WORKER_CONFIG } from '../worker.constants';

function rowCount(result: unknown): number {
  if (Array.isArray(result) && typeof result[1] === 'number') {
    return result[1];
  }
  return 0;
}

/**
 * Nightly retention enforcement. Soft-deletes recordings beyond the configured
 * window and purges magic-link tokens that have expired.
 */
@Injectable()
export class RetentionProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RetentionProcessor.name);
  private interval?: NodeJS.Timeout;

  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    @Inject(WORKER_CONFIG) private readonly config: AppConfig,
  ) {}

  async onModuleInit(): Promise<void> {
    const intervalMs = 60 * 60 * 1000;
    this.interval = setInterval(() => {
      this.run().catch((err) =>
        this.logger.error(`Retention run failed: ${(err as Error).message}`),
      );
    }, intervalMs);
    this.run().catch(() => undefined);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.interval) clearInterval(this.interval);
  }

  private async run(): Promise<void> {
    const incidentsDays = this.config.ops.retentionIncidentsDays;
    const chatDays = this.config.ops.retentionChatDays;
    const auditDays = this.config.ops.retentionAuditDays;

    const recordingResult = await this.sequelize.query(
      `UPDATE call_records
          SET recording_url = NULL
        WHERE recording_url IS NOT NULL
          AND ended_at < NOW() - (:days || ' days')::interval`,
      { type: QueryTypes.UPDATE, replacements: { days: incidentsDays } },
    );

    const magicLinkResult = await this.sequelize.query(
      `DELETE FROM magic_link_tokens
        WHERE created_at < NOW() - INTERVAL '7 days'`,
      { type: QueryTypes.DELETE },
    );

    const chatResult = await this.sequelize.query(
      `DELETE FROM chat_messages
        WHERE created_at < NOW() - (:days || ' days')::interval
          AND thread_id IN (
            SELECT id FROM chat_threads WHERE closed_at IS NOT NULL
          )`,
      { type: QueryTypes.DELETE, replacements: { days: chatDays } },
    );

    const auditResult = await this.sequelize.query(
      `DELETE FROM audit_logs
        WHERE created_at < NOW() - (:days || ' days')::interval`,
      { type: QueryTypes.DELETE, replacements: { days: auditDays } },
    );

    this.logger.log(
      `Retention complete: recordings=${rowCount(recordingResult)} magic_links=${rowCount(magicLinkResult)} chat=${rowCount(chatResult)} audit=${rowCount(auditResult)}`,
    );
  }
}
