import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from '@plaksha/shared-schemas';
import type { Role } from '@plaksha/shared-types';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { ResourceNotFoundError } from '../../common/exceptions';
import { Department } from '../../db/models/department.model';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department) private readonly model: typeof Department,
    private readonly audit: AuditService,
  ) {}

  list(): Promise<Department[]> {
    return this.model.findAll({ order: [['nameEn', 'ASC']] });
  }

  async findById(id: string): Promise<Department> {
    const dept = await this.model.findByPk(id);
    if (!dept) throw new ResourceNotFoundError('Department', id);
    return dept;
  }

  async findByCode(code: string): Promise<Department | null> {
    return this.model.findOne({ where: { code: code as never } });
  }

  async create(
    input: CreateDepartmentInput,
    actor: { id: string; role: Role; ip: string | null; userAgent: string | null },
  ): Promise<Department> {
    const dept = await this.model.create(input as unknown as Department);
    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'department.created',
      resourceType: 'department',
      resourceId: dept.id,
      ip: actor.ip,
      userAgent: actor.userAgent,
      after: dept.toJSON() as unknown as Record<string, unknown>,
    });
    return dept;
  }

  async update(
    id: string,
    input: UpdateDepartmentInput,
    actor: { id: string; role: Role; ip: string | null; userAgent: string | null },
  ): Promise<Department> {
    const dept = await this.findById(id);
    const before = dept.toJSON();
    await dept.update(input);
    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'department.updated',
      resourceType: 'department',
      resourceId: dept.id,
      ip: actor.ip,
      userAgent: actor.userAgent,
      before: before as unknown as Record<string, unknown>,
      after: dept.toJSON() as unknown as Record<string, unknown>,
    });
    return dept;
  }
}
