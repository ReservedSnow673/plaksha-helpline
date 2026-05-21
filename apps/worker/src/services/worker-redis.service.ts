import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import IORedis, { type Redis } from 'ioredis';
import type { AppConfig } from '@plaksha/shared-config';

import { WORKER_CONFIG } from '../worker.constants';

@Injectable()
export class WorkerRedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkerRedisService.name);
  private _client?: Redis;

  constructor(@Inject(WORKER_CONFIG) private readonly config: AppConfig) {}

  async onModuleInit(): Promise<void> {
    this._client = new IORedis(this.config.redis.url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: false,
    });
    this._client.on('error', (err) => this.logger.error(`Redis error: ${err.message}`));
    this._client.on('connect', () => this.logger.log('Redis connected'));
  }

  async onModuleDestroy(): Promise<void> {
    if (this._client) {
      await this._client.quit();
    }
  }

  get client(): Redis {
    if (!this._client) {
      throw new Error('Worker Redis client not initialised');
    }
    return this._client;
  }
}
