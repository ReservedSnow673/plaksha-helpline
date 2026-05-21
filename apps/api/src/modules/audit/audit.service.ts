import type { Role } from '@plaksha/shared-types';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { Transaction } from 'sequelize';

import { AuditLog } from '../../db/models/audit-log.model';

export interface AuditEntryInput {
  actorUserId: string | null;
  actorRole: Role | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  transaction?: Transaction;
}

@Injectable()
export class AuditService {
  constructor(@InjectModel(AuditLog) private readonly model: typeof AuditLog) {}

  async log(entry: AuditEntryInput): Promise<void> {
    await this.model.create(
      {
        actorUserId: entry.actorUserId,
        actorRole: entry.actorRole,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId ?? null,
        ip: entry.ip ?? null,
        userAgent: entry.userAgent ?? null,
        before: entry.before ?? null,
        after: entry.after ?? null,
        occurredAt: new Date(),
      } as AuditLog,
      { transaction: entry.transaction },
    );
  }
}
