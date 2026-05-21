import type { HealthStatus } from '@plaksha/shared-types';
import { Controller, Get, HttpCode } from '@nestjs/common';

import { Public } from '../../common/decorators/public.decorator';

import { HealthService } from './health.service';

@Controller()
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Public()
  @Get('health')
  @HttpCode(200)
  async liveness(): Promise<HealthStatus> {
    return {
      status: 'ok',
      uptimeSeconds: this.health.uptimeSeconds(),
      version: process.env.APP_VERSION ?? '0.1.0',
      commit: process.env.GIT_SHA,
      checks: { process: 'ok' },
    };
  }

  @Public()
  @Get('health/ready')
  async readiness(): Promise<HealthStatus> {
    const [db, redis] = await Promise.all([this.health.checkDatabase(), this.health.checkRedis()]);
    const ok = db === 'ok' && redis === 'ok';
    return {
      status: ok ? 'ok' : 'degraded',
      uptimeSeconds: this.health.uptimeSeconds(),
      version: process.env.APP_VERSION ?? '0.1.0',
      commit: process.env.GIT_SHA,
      checks: { database: db, redis },
    };
  }
}
