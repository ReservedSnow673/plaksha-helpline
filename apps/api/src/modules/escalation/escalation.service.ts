import type { AppConfig } from '@plaksha/shared-config';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { APP_CONFIG } from '../../config/config.module';
import { Department } from '../../db/models/department.model';
import { EscalationLevel } from '../../db/models/escalation-level.model';
import { EscalationPolicy } from '../../db/models/escalation-policy.model';
import { EscalationRun } from '../../db/models/escalation-run.model';
import { Incident } from '../../db/models/incident.model';

import { EscalationQueueService } from './queue.service';

@Injectable()
export class EscalationService {
  private readonly logger = new Logger(EscalationService.name);

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    @InjectModel(EscalationPolicy) private readonly policies: typeof EscalationPolicy,
    @InjectModel(EscalationLevel) private readonly levels: typeof EscalationLevel,
    @InjectModel(EscalationRun) private readonly runs: typeof EscalationRun,
    @InjectModel(Department) private readonly departments: typeof Department,
    private readonly queue: EscalationQueueService,
  ) {}

  async scheduleForIncident(incident: Incident): Promise<void> {
    const policy = await this.resolvePolicy(incident);
    if (!policy) {
      this.logger.debug(`no escalation policy for incident=${incident.id}`);
      return;
    }
    const levels = await this.levels.findAll({
      where: { policyId: policy.id },
      order: [['levelIndex', 'ASC']],
    });
    const multiplier = this.config.ops.escalationTimerMultiplier;
    for (const level of levels) {
      const scheduledFor = new Date(
        Date.now() + Math.round(level.triggerAfterSeconds * multiplier) * 1000,
      );
      const run = await this.runs.create({
        incidentId: incident.id,
        policyId: policy.id,
        levelIndex: level.levelIndex,
        scheduledFor,
      } as EscalationRun);
      const jobId = `escalation:${incident.id}:${level.levelIndex}`;
      await this.queue.enqueue(
        { incidentId: incident.id, policyId: policy.id, levelIndex: level.levelIndex, scheduledFor: scheduledFor.toISOString(), runId: run.id },
        { delaySeconds: Math.max(0, Math.round((scheduledFor.getTime() - Date.now()) / 1000)), jobId },
      );
      await run.update({ jobId });
    }
  }

  async cancelPending(incidentId: string): Promise<void> {
    const pending = await this.runs.findAll({
      where: { incidentId, firedAt: { [Op.is]: null } },
    });
    for (const run of pending) {
      if (run.jobId) await this.queue.cancel(run.jobId).catch(() => undefined);
      await run.update({ firedAt: new Date(), outcome: 'SKIPPED_ALREADY_RESOLVED' });
    }
  }

  async forceEscalate(incidentId: string): Promise<void> {
    const next = await this.runs.findOne({
      where: { incidentId, firedAt: { [Op.is]: null } },
      order: [['levelIndex', 'ASC']],
    });
    if (!next || !next.jobId) return;
    await this.queue.cancel(next.jobId).catch(() => undefined);
    await this.queue.enqueue(
      {
        incidentId,
        policyId: next.policyId,
        levelIndex: next.levelIndex,
        scheduledFor: new Date().toISOString(),
        runId: next.id,
      },
      { delaySeconds: 0, jobId: `${next.jobId}:forced:${Date.now()}` },
    );
  }

  private async resolvePolicy(incident: Incident): Promise<EscalationPolicy | null> {
    if (!incident.departmentId) {
      return this.policies.findOne({ where: { departmentId: null, isActive: true } });
    }
    const dept = await this.departments.findByPk(incident.departmentId);
    if (dept?.escalationPolicyId) {
      const policy = await this.policies.findByPk(dept.escalationPolicyId);
      if (policy?.isActive) return policy;
    }
    return this.policies.findOne({
      where: { departmentId: incident.departmentId, isActive: true },
    });
  }
}
