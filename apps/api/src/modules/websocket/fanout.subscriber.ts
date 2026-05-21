import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';

import { RedisService } from '../../adapters/redis/redis.service';

import { EventsGateway } from './events.gateway';

const REDIS_CHANNEL = 'plaksha:ws:fanout';

interface FanoutEnvelope {
  eventType: string;
  payload: unknown;
  rooms: string[];
  occurredAt: string;
  outboxId: string;
}

@Injectable()
export class FanoutSubscriber implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FanoutSubscriber.name);

  constructor(
    private readonly redis: RedisService,
    private readonly gateway: EventsGateway,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.redis.subClient.subscribe(REDIS_CHANNEL);
    this.redis.subClient.on('message', (channel, raw) => {
      if (channel !== REDIS_CHANNEL) return;
      try {
        const envelope = JSON.parse(raw) as FanoutEnvelope;
        this.gateway.broadcast(envelope.rooms, envelope.eventType, {
          payload: envelope.payload,
          occurredAt: envelope.occurredAt,
          outboxId: envelope.outboxId,
        });
      } catch (err) {
        this.logger.error(`fanout parse failed: ${(err as Error).message}`);
      }
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.subClient.unsubscribe(REDIS_CHANNEL).catch(() => undefined);
  }
}
