import {
  UpdateResponderLocationSchema,
  UpdateResponderStatusSchema,
  type UpdateResponderLocationInput,
  type UpdateResponderStatusInput,
} from '@plaksha/shared-schemas';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ZodBody } from '../../common/pipes/zod-validation.pipe';
import type { RequestPrincipal } from '../../common/types/request';

import { RespondersService } from './responders.service';

@Controller()
export class RespondersController {
  constructor(private readonly responders: RespondersService) {}

  @RequirePermissions('responder.update_status')
  @Post('me/responder/status')
  async updateStatus(
    @CurrentUser() actor: RequestPrincipal,
    @Body(ZodBody(UpdateResponderStatusSchema)) input: UpdateResponderStatusInput,
  ) {
    const result = await this.responders.updateStatus(actor.userId, input.status, input.isOnDuty);
    return { data: result };
  }

  @RequirePermissions('responder.update_location')
  @Post('me/responder/location')
  async updateLocation(
    @CurrentUser() actor: RequestPrincipal,
    @Body(ZodBody(UpdateResponderLocationSchema)) input: UpdateResponderLocationInput,
  ) {
    const result = await this.responders.updateLocation(
      actor.userId,
      input.lat,
      input.lng,
      input.accuracyM ?? null,
    );
    return { data: result };
  }

  @RequirePermissions('incident.read.any')
  @Get('responders/on-duty')
  async onDuty(@Query('departmentId') departmentId?: string) {
    return { data: await this.responders.listOnDuty(departmentId) };
  }
}
