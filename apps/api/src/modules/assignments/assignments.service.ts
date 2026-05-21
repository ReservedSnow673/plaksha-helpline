import { Rooms } from '@plaksha/shared-events';
import type { Role } from '@plaksha/shared-types';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import type { Sequelize } from 'sequelize-typescript';

import { ResourceNotFoundError } from '../../common/exceptions';
import { Incident } from '../../db/models/incident.model';
import { IncidentAssignment } from '../../db/models/incident-assignment.model';
import { ResponderProfile } from '../../db/models/responder-profile.model';
import { User } from '../../db/models/user.model';
import { AuditService } from '../audit/audit.service';
import { IncidentsService } from '../incidents/incidents.service';
import { OutboxService } from '../outbox/outbox.service';

const OFFER_TIMEOUT_SECONDS = 60;

interface ActorCtx {
  id: string;
  role: Role;
  ip?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AssignmentsService {
  private readonly logger = new Logger(AssignmentsService.name);

  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectModel(IncidentAssignment) private readonly assignments: typeof IncidentAssignment,
    @InjectModel(Incident) private readonly incidents: typeof Incident,
    @InjectModel(ResponderProfile) private readonly responders: typeof ResponderProfile,
    @InjectModel(User) private readonly users: typeof User,
    private readonly incidentsService: IncidentsService,
    private readonly outbox: OutboxService,
    private readonly audit: AuditService,
  ) {}

  async offer(incidentId: string, responderUserId: string, actor: ActorCtx) {
    return this.sequelize.transaction(async (tx) => {
      const incident = await this.incidents.findByPk(incidentId, { transaction: tx, lock: tx.LOCK.UPDATE });
      if (!incident) throw new ResourceNotFoundError('Incident', incidentId);
      const responder = await this.users.findByPk(responderUserId, { transaction: tx });
      if (!responder || responder.role !== 'RESPONDER') {
        throw new BadRequestException('Target user is not a responder');
      }
      const existing = await this.assignments.findOne({
        where: { incidentId, status: { [Op.in]: ['OFFERED', 'ACCEPTED'] } },
        transaction: tx,
      });
      if (existing) await existing.update({ status: 'REASSIGNED' }, { transaction: tx });

      const assignment = await this.assignments.create(
        {
          incidentId,
          responderUserId,
          status: 'OFFERED',
          offeredAt: new Date(),
        } as IncidentAssignment,
        { transaction: tx },
      );

      await this.outbox.enqueue(
        {
          aggregateType: 'assignment',
          aggregateId: assignment.id,
          eventType: 'assignment.offered',
          payload: {
            assignment: assignment.toJSON(),
            incident: {
              id: incident.id,
              publicCode: incident.publicCode,
              category: incident.category,
              priority: incident.priority,
              lat: incident.lat,
              lng: incident.lng,
              locationLabel: incident.locationLabel,
            },
            deadlineSeconds: OFFER_TIMEOUT_SECONDS,
          },
          rooms: [Rooms.user(responderUserId), Rooms.adminOverview()],
        },
        tx,
      );

      await this.audit.log({
        actorUserId: actor.id,
        actorRole: actor.role,
        action: 'assignment.offered',
        resourceType: 'assignment',
        resourceId: assignment.id,
        after: assignment.toJSON() as unknown as Record<string, unknown>,
        transaction: tx,
      });
      return assignment;
    });
  }

  async accept(assignmentId: string, actor: ActorCtx) {
    return this.sequelize.transaction(async (tx) => {
      const assignment = await this.loadOwn(assignmentId, actor.id, tx);
      if (assignment.status !== 'OFFERED') {
        throw new BadRequestException(`Cannot accept assignment in status ${assignment.status}`);
      }
      const now = new Date();
      await assignment.update({ status: 'ACCEPTED', acceptedAt: now }, { transaction: tx });
      const incident = await this.incidents.findByPk(assignment.incidentId, { transaction: tx, lock: tx.LOCK.UPDATE });
      if (incident) {
        if (!incident.firstResponderAssignedAt) {
          await incident.update({ firstResponderAssignedAt: now, status: 'RESPONDER_ASSIGNED' }, { transaction: tx });
        }
      }
      await this.responders.update(
        { currentAssignmentId: assignment.id, status: 'BUSY' },
        { where: { userId: actor.id }, transaction: tx },
      );

      await this.outbox.enqueue(
        {
          aggregateType: 'assignment',
          aggregateId: assignment.id,
          eventType: 'assignment.accepted',
          payload: {
            assignmentId: assignment.id,
            incidentId: assignment.incidentId,
            responderUserId: assignment.responderUserId,
            status: 'ACCEPTED',
          },
          rooms: [
            Rooms.adminOverview(),
            Rooms.incident(assignment.incidentId),
            ...(incident?.departmentId ? [Rooms.deptDispatch(incident.departmentId)] : []),
          ],
        },
        tx,
      );

      await this.audit.log({
        actorUserId: actor.id,
        actorRole: actor.role,
        action: 'assignment.accepted',
        resourceType: 'assignment',
        resourceId: assignment.id,
        after: { status: 'ACCEPTED' },
        transaction: tx,
      });

      // Bubble incident status forward via the canonical lifecycle service so audit + outbox stays unified.
      tx.afterCommit(() => {
        if (incident && incident.status === 'CREATED') {
          this.incidentsService
            .transitionStatus(incident.id, 'ACKNOWLEDGED', 'auto-ack on first acceptance', {
              id: actor.id,
              role: actor.role,
              departmentId: incident.departmentId,
            })
            .catch((err) => this.logger.error(err));
        }
      });
      return assignment;
    });
  }

  async reject(assignmentId: string, reason: string | undefined, actor: ActorCtx) {
    return this.sequelize.transaction(async (tx) => {
      const assignment = await this.loadOwn(assignmentId, actor.id, tx);
      if (assignment.status !== 'OFFERED') {
        throw new BadRequestException(`Cannot reject assignment in status ${assignment.status}`);
      }
      await assignment.update(
        { status: 'REJECTED', rejectedAt: new Date(), rejectionReason: reason ?? null },
        { transaction: tx },
      );
      await this.outbox.enqueue(
        {
          aggregateType: 'assignment',
          aggregateId: assignment.id,
          eventType: 'assignment.rejected',
          payload: {
            assignmentId: assignment.id,
            incidentId: assignment.incidentId,
            responderUserId: assignment.responderUserId,
            status: 'REJECTED',
            reason: reason ?? null,
          },
          rooms: [Rooms.adminOverview()],
        },
        tx,
      );
      await this.audit.log({
        actorUserId: actor.id,
        actorRole: actor.role,
        action: 'assignment.rejected',
        resourceType: 'assignment',
        resourceId: assignment.id,
        after: { status: 'REJECTED', reason: reason ?? null },
        transaction: tx,
      });
      return assignment;
    });
  }

  async updateEta(assignmentId: string, etaSeconds: number, actor: ActorCtx) {
    const assignment = await this.loadOwn(assignmentId, actor.id);
    await assignment.update({ etaSeconds });
    await this.outbox.enqueue({
      aggregateType: 'assignment',
      aggregateId: assignment.id,
      eventType: 'assignment.eta_updated',
      payload: { assignmentId: assignment.id, incidentId: assignment.incidentId, etaSeconds },
      rooms: [Rooms.incident(assignment.incidentId), Rooms.adminOverview()],
    });
    return assignment;
  }

  async myAssignmentInbox(userId: string): Promise<IncidentAssignment[]> {
    return this.assignments.findAll({
      where: { responderUserId: userId, status: { [Op.in]: ['OFFERED', 'ACCEPTED'] } },
      order: [['offeredAt', 'DESC']],
      include: [{ model: Incident, as: 'incident' }],
    });
  }

  private async loadOwn(
    id: string,
    userId: string,
    transaction?: import('sequelize').Transaction,
  ): Promise<IncidentAssignment> {
    const assignment = await this.assignments.findByPk(id, { transaction });
    if (!assignment) throw new ResourceNotFoundError('Assignment', id);
    if (assignment.responderUserId !== userId) {
      throw new BadRequestException('Assignment does not belong to caller');
    }
    return assignment;
  }
}
