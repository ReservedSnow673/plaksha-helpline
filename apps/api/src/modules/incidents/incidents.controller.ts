import {
  CancelIncidentSchema,
  CreateIncidentSchema,
  ListIncidentsQuerySchema,
  UpdateIncidentStatusSchema,
  type CreateIncidentInput,
  type ListIncidentsQuery,
} from '@plaksha/shared-schemas';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ZodBody, ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { RequestPrincipal } from '../../common/types/request';

import { IncidentsService } from './incidents.service';

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidents: IncidentsService) {}

  @RequirePermissions('incident.create')
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  @Post()
  async create(
    @Req() req: Request,
    @CurrentUser() actor: RequestPrincipal,
    @Body(ZodBody(CreateIncidentSchema)) input: CreateIncidentInput,
  ) {
    const incident = await this.incidents.create(
      input,
      {
        id: actor.userId,
        role: actor.role,
        departmentId: actor.departmentId,
        ip: req.ip ?? null,
        userAgent: req.headers['user-agent'] ?? null,
      },
      req.ip ?? null,
    );
    return { data: incident };
  }

  @Get()
  async list(
    @CurrentUser() actor: RequestPrincipal,
    @Query(new ZodValidationPipe(ListIncidentsQuerySchema)) query: ListIncidentsQuery,
  ) {
    const result = await this.incidents.list(query, { role: actor.role, departmentId: actor.departmentId });
    return { data: { items: result.items, cursor: result.cursor } };
  }

  @Get('mine')
  async listMine(
    @CurrentUser() actor: RequestPrincipal,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const result = await this.incidents.listForReporter(actor.userId, {
      limit: limit ? Number(limit) : 50,
      cursor,
    });
    return { data: { items: result.items, cursor: result.cursor } };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return { data: await this.incidents.findById(id) };
  }

  @Get(':id/timeline')
  async timeline(@Param('id') id: string) {
    return { data: await this.incidents.timeline(id) };
  }

  @Get(':id/events')
  async eventsAfter(
    @Param('id') id: string,
    @Query('afterSequence') afterSequence?: string,
  ) {
    const after = afterSequence ? Number(afterSequence) : 0;
    return { data: await this.incidents.eventsAfterSequence(id, after) };
  }

  @RequirePermissions('incident.update.status')
  @Patch(':id/status')
  async updateStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @CurrentUser() actor: RequestPrincipal,
    @Body(ZodBody(UpdateIncidentStatusSchema))
    input: { to: never; reason?: string },
  ) {
    const incident = await this.incidents.transitionStatus(id, input.to, input.reason, {
      id: actor.userId,
      role: actor.role,
      departmentId: actor.departmentId,
      ip: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return { data: incident };
  }

  @RequirePermissions('incident.cancel.own')
  @Post(':id/cancel')
  async cancel(
    @Req() req: Request,
    @Param('id') id: string,
    @CurrentUser() actor: RequestPrincipal,
    @Body(ZodBody(CancelIncidentSchema)) input: { reason?: string },
  ) {
    const incident = await this.incidents.cancel(id, input.reason, {
      id: actor.userId,
      role: actor.role,
      departmentId: actor.departmentId,
      ip: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return { data: incident };
  }
}
