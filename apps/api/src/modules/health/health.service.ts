import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import type { Sequelize } from 'sequelize-typescript';

import { RedisService } from '../../adapters/redis/redis.service';

@Injectable()
export class HealthService {
  private readonly startedAt = Date.now();

  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    private readonly redis: RedisService,
  ) {}

  uptimeSeconds(): number {
    return Math.round((Date.now() - this.startedAt) / 1000);
  }

  async checkDatabase(): Promise<'ok' | 'fail'> {
    try {
      await this.sequelize.authenticate();
      return 'ok';
    } catch {
      return 'fail';
    }
  }

  async checkRedis(): Promise<'ok' | 'fail'> {
    try {
      const pong = await this.redis.client.ping();
      return pong === 'PONG' ? 'ok' : 'fail';
    } catch {
      return 'fail';
    }
  }
}
