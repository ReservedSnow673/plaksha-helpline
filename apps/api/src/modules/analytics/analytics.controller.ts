import { Controller, Get } from '@nestjs/common';

import { RequirePermissions } from '../../common/decorators/permissions.decorator';

import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @RequirePermissions('analytics.read')
  @Get('response-times')
  async responseTimes() {
    return { data: await this.analytics.responseTimesByDepartment() };
  }

  @RequirePermissions('analytics.read')
  @Get('peak-hours')
  async peakHours() {
    return { data: await this.analytics.peakHours() };
  }

  @RequirePermissions('analytics.read')
  @Get('heatmap')
  async heatmap() {
    return { data: await this.analytics.incidentHeatmap() };
  }

  @RequirePermissions('analytics.read')
  @Get('escalation-frequency')
  async escalation() {
    return { data: await this.analytics.escalationFrequency() };
  }

  @RequirePermissions('analytics.read')
  @Get('responder-performance')
  async responderPerf() {
    return { data: await this.analytics.responderPerformance() };
  }
}
