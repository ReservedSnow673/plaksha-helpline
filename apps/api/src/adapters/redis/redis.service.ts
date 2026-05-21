import type { AppConfig } from '@plaksha/shared-config';
import { Inject, Injectable, type OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

import { APP_CONFIG } from '../../config/config.module';

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis;
  readonly pubClient: Redis;
  readonly subClient: Redis;

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    this.client = new Redis(config.redis.url, { maxRetriesPerRequest: null, lazyConnect: false });
    this.pubClient = this.client.duplicate();
    this.subClient = this.client.duplicate();
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([
      this.client.quit().catch(() => undefined),
      this.pubClient.quit().catch(() => undefined),
      this.subClient.quit().catch(() => undefined),
    ]);
  }
}
