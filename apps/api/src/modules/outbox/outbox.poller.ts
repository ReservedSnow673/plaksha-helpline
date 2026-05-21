import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';

import { RedisService } from '../../adapters/redis/redis.service';

import { OutboxService } from './outbox.service';

const POLL_INTERVAL_MS = 250;
const REDIS_CHANNEL = 'plaksha:ws:fanout';

@Injectable()
export class OutboxPoller implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPoller.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly outbox: OutboxService,
    private readonly redis: RedisService,
  ) {}

  onModuleInit(): void {
    this.tick();
  }

  onModuleDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }

  private async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const batch = await this.outbox.claimUnpublished(200);
      if (batch.length > 0) {
        await Promise.all(
          batch.map(async (evt) => {
            try {
              await this.redis.pubClient.publish(
                REDIS_CHANNEL,
                JSON.stringify({
                  eventType: evt.eventType,
                  payload: evt.payload,
                  rooms: evt.rooms,
                  occurredAt: evt.createdAt.toISOString(),
                  outboxId: evt.id,
                }),
              );
              await this.outbox.markPublished(evt.id);
            } catch (err) {
              this.logger.error(`outbox publish failed id=${evt.id}: ${(err as Error).message}`);
              await this.outbox.markFailed(evt.id).catch(() => undefined);
            }
          }),
        );
      }
    } catch (err) {
      this.logger.error(`outbox poll cycle failed: ${(err as Error).message}`);
    } finally {
      this.running = false;
      this.timer = setTimeout(() => this.tick(), POLL_INTERVAL_MS);
    }
  }
}
