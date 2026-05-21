import {
  CreateDepartmentSchema,
  UpdateDepartmentSchema,
  type CreateDepartmentInput,
  type UpdateDepartmentInput,
} from '@plaksha/shared-schemas';
import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ZodBody } from '../../common/pipes/zod-validation.pipe';
import type { RequestPrincipal } from '../../common/types/request';

import { DepartmentsService } from './departments.service';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departments: DepartmentsService) {}

  @Get()
  async list() {
    return { data: await this.departments.list() };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return { data: await this.departments.findById(id) };
  }

  @RequirePermissions('department.write')
  @Post()
  async create(
    @Req() req: Request,
    @CurrentUser() actor: RequestPrincipal,
    @Body(ZodBody(CreateDepartmentSchema)) input: CreateDepartmentInput,
  ) {
    const dept = await this.departments.create(input, {
      id: actor.userId,
      role: actor.role,
      ip: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return { data: dept };
  }

  @RequirePermissions('department.write')
  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @CurrentUser() actor: RequestPrincipal,
    @Body(ZodBody(UpdateDepartmentSchema)) input: UpdateDepartmentInput,
  ) {
    const dept = await this.departments.update(id, input, {
      id: actor.userId,
      role: actor.role,
      ip: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return { data: dept };
  }
}
