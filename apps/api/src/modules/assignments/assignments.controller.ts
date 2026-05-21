import {
  AssignResponderSchema,
  RejectAssignmentSchema,
  UpdateEtaSchema,
  type AssignResponderInput,
  type RejectAssignmentInput,
  type UpdateEtaInput,
} from '@plaksha/shared-schemas';
import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ZodBody } from '../../common/pipes/zod-validation.pipe';
import type { RequestPrincipal } from '../../common/types/request';

import { AssignmentsService } from './assignments.service';

@Controller()
export class AssignmentsController {
  constructor(private readonly assignments: AssignmentsService) {}

  @RequirePermissions('incident.assign')
  @Post('incidents/:incidentId/assign')
  async offer(
    @Req() req: Request,
    @Param('incidentId') incidentId: string,
    @CurrentUser() actor: RequestPrincipal,
    @Body(ZodBody(AssignResponderSchema)) input: AssignResponderInput,
  ) {
    const result = await this.assignments.offer(incidentId, input.responderId, {
      id: actor.userId,
      role: actor.role,
      ip: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return { data: result };
  }

  @RequirePermissions('responder.assignment.accept')
  @Post('assignments/:id/accept')
  async accept(
    @Req() req: Request,
    @Param('id') id: string,
    @CurrentUser() actor: RequestPrincipal,
  ) {
    const result = await this.assignments.accept(id, {
      id: actor.userId,
      role: actor.role,
      ip: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return { data: result };
  }

  @RequirePermissions('responder.assignment.reject')
  @Post('assignments/:id/reject')
  async reject(
    @Req() req: Request,
    @Param('id') id: string,
    @CurrentUser() actor: RequestPrincipal,
    @Body(ZodBody(RejectAssignmentSchema)) input: RejectAssignmentInput,
  ) {
    const result = await this.assignments.reject(id, input.reason, {
      id: actor.userId,
      role: actor.role,
      ip: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return { data: result };
  }

  @RequirePermissions('responder.assignment.accept')
  @Patch('assignments/:id/eta')
  async eta(
    @Param('id') id: string,
    @CurrentUser() actor: RequestPrincipal,
    @Body(ZodBody(UpdateEtaSchema)) input: UpdateEtaInput,
  ) {
    const result = await this.assignments.updateEta(id, input.etaSeconds, {
      id: actor.userId,
      role: actor.role,
    });
    return { data: result };
  }

  @Get('me/assignments')
  async inbox(@CurrentUser() actor: RequestPrincipal) {
    return { data: await this.assignments.myAssignmentInbox(actor.userId) };
  }
}
