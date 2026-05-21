import type {
  CreateIncidentInput,
  ListIncidentsQuery,
} from '@plaksha/shared-schemas';
import type {
  DepartmentCode,
  IncidentEventType,
  IncidentStatus,
  Role,
} from '@plaksha/shared-types';
import { defaultPriorityForCategory, generatePublicCode } from '@plaksha/shared-utils';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Op, type WhereOptions } from 'sequelize';
import type { Sequelize } from 'sequelize-typescript';

import { Rooms } from '@plaksha/shared-events';

import { ResourceNotFoundError } from '../../common/exceptions';
import { createRecord } from '../../common/types/sequelize-create';
import { ChatThread } from '../../db/models/chat-thread.model';
import { Incident } from '../../db/models/incident.model';
import { IncidentEvent } from '../../db/models/incident-event.model';
import { AuditService } from '../audit/audit.service';
import { DepartmentsService } from '../departments/departments.service';
import { EscalationService } from '../escalation/escalation.service';
import { OutboxService } from '../outbox/outbox.service';

import { LifecycleService } from './lifecycle.service';

interface ActorCtx {
  id: string;
  role: Role;
  departmentId: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class IncidentsService {
  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectModel(Incident) private readonly incidents: typeof Incident,
    @InjectModel(IncidentEvent) private readonly events: typeof IncidentEvent,
    @InjectModel(ChatThread) private readonly chatThreads: typeof ChatThread,
    private readonly lifecycle: LifecycleService,
    private readonly audit: AuditService,
    private readonly departments: DepartmentsService,
    private readonly outbox: OutboxService,
    @Inject(forwardRef(() => EscalationService)) private readonly escalation: EscalationService,
  ) {}

  async create(input: CreateIncidentInput, actor: ActorCtx | null, ip: string | null): Promise<Incident> {
    const priority =
      input.priority ?? defaultPriorityForCategory(input.category as DepartmentCode);
    const department = await this.departments.findByCode(input.category);
    return this.sequelize.transaction(async (tx) => {
      const incident = await createRecord<Incident>(
        this.incidents,
        {
          publicCode: generatePublicCode(),
          category: input.category as DepartmentCode,
          priority,
          status: 'CREATED',
          reportedByUserId: actor?.id ?? null,
          departmentId: department?.id ?? null,
          language: input.language,
          channel: input.channel,
          lat: input.lat ?? null,
          lng: input.lng ?? null,
          locationLabel: input.locationLabel ?? null,
          locationAccuracyM: input.locationAccuracyM ?? null,
          addressText: input.addressText ?? null,
          anonymous: input.anonymous,
          metadata: input.metadata ?? {},
        },
        { transaction: tx },
      );

      await createRecord(
        this.events,
        {
          incidentId: incident.id,
          eventType: 'incident.created',
          actorUserId: actor?.id ?? null,
          actorKind: actor ? 'USER' : 'SYSTEM',
          payload: { note: input.note ?? null, channel: input.channel },
          occurredAt: new Date(),
        },
        { transaction: tx },
      );

      await createRecord(
        this.chatThreads,
        { incidentId: incident.id, createdAt: new Date(), closedAt: null },
        { transaction: tx },
      );

      const rooms = [
        Rooms.adminOverview(),
        ...(incident.departmentId ? [Rooms.deptDispatch(incident.departmentId)] : []),
        ...(incident.reportedByUserId ? [Rooms.user(incident.reportedByUserId)] : []),
      ];
      await this.outbox.enqueue(
        {
          aggregateType: 'incident',
          aggregateId: incident.id,
          eventType: 'incident.created',
          payload: { incident: incident.toJSON() },
          rooms,
        },
        tx,
      );

      await this.audit.log({
        actorUserId: actor?.id ?? null,
        actorRole: actor?.role ?? null,
        action: 'incident.created',
        resourceType: 'incident',
        resourceId: incident.id,
        ip,
        userAgent: actor?.userAgent ?? null,
        after: incident.toJSON() as unknown as Record<string, unknown>,
        transaction: tx,
      });

      // Schedule escalation jobs outside the transaction commit boundary so failures
      // don't roll back the incident. Best-effort.
      tx.afterCommit(() => {
        this.escalation.scheduleForIncident(incident).catch(() => undefined);
      });

      return incident;
    });
  }

  async list(query: ListIncidentsQuery, actor: { role: Role; departmentId: string | null }) {
    const where: WhereOptions<Incident> = {};
    if (query.status) Object.assign(where, { status: query.status });
    if (query.category) Object.assign(where, { category: query.category });
    if (query.departmentId) Object.assign(where, { departmentId: query.departmentId });
    if (actor.role === 'RESPONDER' && actor.departmentId) {
      Object.assign(where, { departmentId: actor.departmentId });
    }
    if (query.cursor) Object.assign(where, { createdAt: { [Op.lt]: new Date(query.cursor) } });
    if (query.search) Object.assign(where, { publicCode: { [Op.iLike]: `%${query.search}%` } });

    const items = await this.incidents.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: query.limit + 1,
    });
    const hasMore = items.length > query.limit;
    const trimmed = hasMore ? items.slice(0, query.limit) : items;
    const last = trimmed[trimmed.length - 1];
    return { items: trimmed, cursor: hasMore && last ? last.createdAt.toISOString() : null };
  }

  async listForReporter(
    userId: string,
    opts: { limit?: number; cursor?: string },
  ): Promise<{ items: Incident[]; cursor: string | null }> {
    const limit = Math.min(Math.max(opts.limit ?? 50, 1), 100);
    const where: WhereOptions<Incident> = { reportedByUserId: userId };
    if (opts.cursor) Object.assign(where, { createdAt: { [Op.lt]: new Date(opts.cursor) } });
    const items = await this.incidents.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: limit + 1,
    });
    const hasMore = items.length > limit;
    const trimmed = hasMore ? items.slice(0, limit) : items;
    const last = trimmed[trimmed.length - 1];
    return { items: trimmed, cursor: hasMore && last ? last.createdAt.toISOString() : null };
  }

  async findById(id: string): Promise<Incident> {
    const incident = await this.incidents.findByPk(id);
    if (!incident) throw new ResourceNotFoundError('Incident', id);
    return incident;
  }

  async transitionStatus(
    id: string,
    to: IncidentStatus,
    reason: string | undefined,
    actor: ActorCtx,
  ): Promise<Incident> {
    return this.sequelize.transaction(async (tx) => {
      const incident = await this.incidents.findByPk(id, { transaction: tx, lock: tx.LOCK.UPDATE });
      if (!incident) throw new ResourceNotFoundError('Incident', id);
      this.lifecycle.ensure(incident.status, to);
      const before = { status: incident.status };
      const now = new Date();
      const patch: Partial<Incident> = { status: to };
      if (to === 'ACKNOWLEDGED' && !incident.acknowledgedAt) patch.acknowledgedAt = now;
      if (to === 'EN_ROUTE' && !incident.enRouteAt) patch.enRouteAt = now;
      if (to === 'ARRIVED' && !incident.arrivedAt) patch.arrivedAt = now;
      if (to === 'RESOLVED' && !incident.resolvedAt) patch.resolvedAt = now;
      if (to === 'CLOSED' && !incident.closedAt) patch.closedAt = now;
      if (to === 'ARCHIVED' && !incident.archivedAt) patch.archivedAt = now;
      await incident.update(patch, { transaction: tx });

      const eventType = statusToEventType(to);
      await createRecord(
        this.events,
        {
          incidentId: incident.id,
          eventType,
          actorUserId: actor.id,
          actorKind: 'USER',
          payload: { from: before.status, to, reason: reason ?? null },
          occurredAt: now,
        },
        { transaction: tx },
      );

      const rooms = [
        Rooms.adminOverview(),
        Rooms.incident(incident.id),
        ...(incident.departmentId ? [Rooms.deptDispatch(incident.departmentId)] : []),
        ...(incident.reportedByUserId ? [Rooms.user(incident.reportedByUserId)] : []),
      ];
      await this.outbox.enqueue(
        {
          aggregateType: 'incident',
          aggregateId: incident.id,
          eventType: 'incident.status_changed',
          payload: {
            incidentId: incident.id,
            publicCode: incident.publicCode,
            from: before.status,
            to,
            occurredAt: now.toISOString(),
            actorUserId: actor.id,
          },
          rooms,
        },
        tx,
      );

      await this.audit.log({
        actorUserId: actor.id,
        actorRole: actor.role,
        action: `incident.${to.toLowerCase()}`,
        resourceType: 'incident',
        resourceId: incident.id,
        ip: actor.ip ?? null,
        userAgent: actor.userAgent ?? null,
        before,
        after: { status: to },
        transaction: tx,
      });

      if (isTerminalAck(to)) {
        tx.afterCommit(() => {
          this.escalation.cancelPending(incident.id).catch(() => undefined);
        });
      }
      return incident;
    });
  }

  async cancel(id: string, reason: string | undefined, actor: ActorCtx): Promise<Incident> {
    return this.transitionStatus(id, 'CANCELLED', reason, actor);
  }

  async timeline(id: string): Promise<IncidentEvent[]> {
    const incident = await this.findById(id);
    return this.events.findAll({
      where: { incidentId: incident.id },
      order: [['sequence', 'ASC']],
    });
  }

  async eventsAfterSequence(id: string, afterSequence: number): Promise<IncidentEvent[]> {
    return this.events.findAll({
      where: { incidentId: id, sequence: { [Op.gt]: afterSequence } },
      order: [['sequence', 'ASC']],
      limit: 200,
    });
  }
}

function statusToEventType(to: IncidentStatus): IncidentEventType {
  const map: Record<IncidentStatus, IncidentEventType> = {
    CREATED: 'incident.created',
    ACKNOWLEDGED: 'incident.acknowledged',
    RESPONDER_ASSIGNED: 'incident.assigned',
    EN_ROUTE: 'incident.en_route',
    ARRIVED: 'incident.arrived',
    RESOLVED: 'incident.resolved',
    CLOSED: 'incident.closed',
    ARCHIVED: 'incident.archived',
    CANCELLED: 'incident.cancelled',
    FALSE_ALARM: 'incident.flagged_false_alarm',
  };
  return map[to];
}

function isTerminalAck(status: IncidentStatus): boolean {
  return ['ACKNOWLEDGED', 'RESOLVED', 'CLOSED', 'ARCHIVED', 'CANCELLED', 'FALSE_ALARM'].includes(status);
}
