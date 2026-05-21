import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Sequelize, QueryTypes } from 'sequelize';
import { InjectConnection } from '@nestjs/sequelize';

import { WorkerRedisService } from '../services/worker-redis.service';
import { OUTBOX_BACKSTOP_LAG_SECONDS, OUTBOX_BATCH_SIZE, OUTBOX_TICK_MS } from '../worker.constants';

/**
 * Secondary outbox poller. The API runs the primary poller; this worker acts
 * as a backstop so events are still drained if the API has degraded. It only
 * picks up rows whose occurred_at is older than the lag threshold so it does
 * not race the API.
 */
@Injectable()
export class OutboxPollerProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPollerProcessor.name);
  private timer?: NodeJS.Timeout;
  private stopping = false;

  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    private readonly redis: WorkerRedisService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.schedule();
  }

  async onModuleDestroy(): Promise<void> {
    this.stopping = true;
    if (this.timer) clearTimeout(this.timer);
  }

  private schedule(): void {
    if (this.stopping) return;
    this.timer = setTimeout(() => {
      this.tick()
        .catch((err) => this.logger.error(`Outbox backstop tick failed: ${(err as Error).message}`))
        .finally(() => this.schedule());
    }, OUTBOX_TICK_MS * 5);
  }

  private async tick(): Promise<void> {
    const rows = (await this.sequelize.query(
      `SELECT id, aggregate_type, aggregate_id, event_type, payload, rooms
         FROM outbox_events
        WHERE published_at IS NULL
          AND created_at < NOW() - (:lag || ' seconds')::interval
        ORDER BY created_at ASC
        LIMIT :limit
        FOR UPDATE SKIP LOCKED`,
      {
        type: QueryTypes.SELECT,
        replacements: { limit: OUTBOX_BATCH_SIZE, lag: OUTBOX_BACKSTOP_LAG_SECONDS },
      },
    )) as Array<{
      id: string;
      aggregate_type: string;
      aggregate_id: string;
      event_type: string;
      payload: unknown;
      rooms: string[] | null;
    }>;

    if (rows.length === 0) return;

    for (const row of rows) {
      await this.redis.client.publish(
        'plaksha:outbox:event',
        JSON.stringify({
          id: row.id,
          aggregateType: row.aggregate_type,
          aggregateId: row.aggregate_id,
          eventType: row.event_type,
          payload: row.payload,
          rooms: row.rooms ?? [],
        }),
      );
      await this.sequelize.query(
        'UPDATE outbox_events SET published_at = NOW(), retries = retries + 1 WHERE id = :id AND published_at IS NULL',
        { type: QueryTypes.UPDATE, replacements: { id: row.id } },
      );
    }
    this.logger.warn(`Backstop drained ${rows.length} outbox events`);
  }
}
