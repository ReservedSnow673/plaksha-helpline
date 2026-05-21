import { AssignUserRoleSchema, UpdateUserStatusSchema } from '@plaksha/shared-schemas';
import { Body, Controller, Get, Param, Patch, Query, Req } from '@nestjs/common';
import type { Request } from 'express';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ZodBody } from '../../common/pipes/zod-validation.pipe';
import type { RequestPrincipal } from '../../common/types/request';

import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async me(@CurrentUser() principal: RequestPrincipal) {
    const user = await this.users.findById(principal.userId);
    return { data: user };
  }

  @RequirePermissions('user.read.any')
  @Get()
  async list(
    @Query('search') search?: string,
    @Query('role') role?: never,
    @Query('departmentId') departmentId?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const result = await this.users.list({
      search,
      role: role as never,
      departmentId,
      limit: limit ? Number(limit) : undefined,
      cursor,
    });
    return { data: { items: result.items, cursor: result.cursor } };
  }

  @RequirePermissions('user.read.any')
  @Get(':id')
  async get(@Param('id') id: string) {
    return { data: await this.users.findById(id) };
  }

  @RequirePermissions('user.role.assign')
  @Patch(':id/role')
  async assignRole(
    @Req() req: Request,
    @Param('id') id: string,
    @CurrentUser() actor: RequestPrincipal,
    @Body(ZodBody(AssignUserRoleSchema)) input: { role: never; departmentId?: string | null },
  ) {
    const user = await this.users.assignRole(id, input.role, input.departmentId ?? null, {
      id: actor.userId,
      role: actor.role,
      ip: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return { data: user };
  }

  @RequirePermissions('user.write')
  @Patch(':id/status')
  async updateStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @CurrentUser() actor: RequestPrincipal,
    @Body(ZodBody(UpdateUserStatusSchema)) input: { status: never; reason?: string },
  ) {
    const user = await this.users.updateStatus(id, input.status, input.reason, {
      id: actor.userId,
      role: actor.role,
      ip: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return { data: user };
  }
}
