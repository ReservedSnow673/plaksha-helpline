import { Controller, Get, Query } from '@nestjs/common';

import { RequirePermissions } from '../../common/decorators/permissions.decorator';

import { CallsService } from './calls.service';

@Controller('calls')
export class CallsController {
  constructor(private readonly calls: CallsService) {}

  @RequirePermissions('call.read')
  @Get()
  async list(@Query('limit') limit?: string) {
    return { data: await this.calls.list({ limit: limit ? Number(limit) : undefined }) };
  }
}
