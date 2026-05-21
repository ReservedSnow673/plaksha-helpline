import { Body, Controller, Get, Param, Put } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import type { RequestPrincipal } from '../../common/types/request';

import { FeatureFlagsService } from './feature-flags.service';

@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(private readonly flags: FeatureFlagsService) {}

  @RequirePermissions('feature_flag.read')
  @Get()
  async list() {
    return { data: await this.flags.list() };
  }

  @RequirePermissions('feature_flag.write')
  @Put(':key')
  async set(
    @Param('key') key: string,
    @CurrentUser() actor: RequestPrincipal,
    @Body() body: { value: unknown },
  ) {
    return { data: await this.flags.set(key, body.value, actor.userId) };
  }
}
