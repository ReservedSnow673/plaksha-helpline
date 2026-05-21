import type { Role, UserStatus } from '@plaksha/shared-types';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { ResourceNotFoundError } from '../../common/exceptions';
import { ResponderProfile } from '../../db/models/responder-profile.model';
import { User } from '../../db/models/user.model';
import { createRecord } from '../../common/types/sequelize-create';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private readonly users: typeof User,
    @InjectModel(ResponderProfile) private readonly profiles: typeof ResponderProfile,
    private readonly audit: AuditService,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.users.findByPk(id);
    if (!user) throw new ResourceNotFoundError('User', id);
    return user;
  }

  async list(opts: { search?: string; role?: Role; departmentId?: string; limit?: number; cursor?: string }) {
    const limit = Math.min(opts.limit ?? 20, 100);
    const where: Record<string, unknown> = {};
    if (opts.role) where.role = opts.role;
    if (opts.departmentId) where.departmentId = opts.departmentId;
    if (opts.search) {
      where[Op.or as unknown as string] = [
        { email: { [Op.iLike]: `%${opts.search}%` } },
        { firstName: { [Op.iLike]: `%${opts.search}%` } },
        { lastName: { [Op.iLike]: `%${opts.search}%` } },
      ];
    }
    if (opts.cursor) where.createdAt = { [Op.lt]: new Date(opts.cursor) };
    const items = await this.users.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: limit + 1,
    });
    const hasMore = items.length > limit;
    const trimmed = hasMore ? items.slice(0, limit) : items;
    const last = trimmed[trimmed.length - 1];
    return {
      items: trimmed,
      cursor: hasMore && last ? last.createdAt.toISOString() : null,
    };
  }

  async assignRole(
    targetId: string,
    role: Role,
    departmentId: string | null,
    actor: { id: string; role: Role; ip: string | null; userAgent: string | null },
  ): Promise<User> {
    const user = await this.findById(targetId);
    const before = { role: user.role, departmentId: user.departmentId };
    const requiresDepartment = role === 'RESPONDER' || role === 'DISPATCHER';
    if (requiresDepartment && !departmentId) {
      throw new BadRequestException('departmentId required for this role');
    }
    await user.update({ role, departmentId });
    if (role === 'RESPONDER') {
      const profile = await this.profiles.findOne({ where: { userId: user.id } });
      if (!profile) {
        await createRecord<ResponderProfile>(
          this.profiles,
          {
          userId: user.id,
          departmentId: departmentId!,
          isOnDuty: false,
          status: 'OFFLINE',
          skills: [],
          },
        );
      } else if (profile.departmentId !== departmentId) {
        await profile.update({ departmentId: departmentId! });
      }
    }
    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'user.role.assigned',
      resourceType: 'user',
      resourceId: user.id,
      ip: actor.ip,
      userAgent: actor.userAgent,
      before,
      after: { role, departmentId },
    });
    return user;
  }

  async updateStatus(
    targetId: string,
    status: UserStatus,
    reason: string | undefined,
    actor: { id: string; role: Role; ip: string | null; userAgent: string | null },
  ): Promise<User> {
    const user = await this.findById(targetId);
    const before = { status: user.status };
    await user.update({ status });
    await this.audit.log({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'user.status.changed',
      resourceType: 'user',
      resourceId: user.id,
      ip: actor.ip,
      userAgent: actor.userAgent,
      before,
      after: { status, reason: reason ?? null },
    });
    return user;
  }
}
