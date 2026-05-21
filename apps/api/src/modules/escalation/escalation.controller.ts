import {
  CreateEscalationPolicySchema,
  UpdateEscalationPolicySchema,
  type CreateEscalationPolicyInput,
  type UpdateEscalationPolicyInput,
} from '@plaksha/shared-schemas';
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ZodBody } from '../../common/pipes/zod-validation.pipe';
import { EscalationLevel } from '../../db/models/escalation-level.model';
import { EscalationPolicy } from '../../db/models/escalation-policy.model';

import { EscalationService } from './escalation.service';

@Controller('escalation-policies')
export class EscalationController {
  constructor(
    @InjectModel(EscalationPolicy) private readonly policies: typeof EscalationPolicy,
    @InjectModel(EscalationLevel) private readonly levels: typeof EscalationLevel,
    private readonly escalation: EscalationService,
  ) {}

  @RequirePermissions('escalation_policy.read')
  @Get()
  async list() {
    return {
      data: await this.policies.findAll({ include: [EscalationLevel], order: [['name', 'ASC']] }),
    };
  }

  @RequirePermissions('escalation_policy.read')
  @Get(':id')
  async get(@Param('id') id: string) {
    return { data: await this.policies.findByPk(id, { include: [EscalationLevel] }) };
  }

  @RequirePermissions('escalation_policy.write')
  @Post()
  async create(@Body(ZodBody(CreateEscalationPolicySchema)) input: CreateEscalationPolicyInput) {
    const policy = await this.policies.create({
      name: input.name,
      departmentId: input.departmentId ?? null,
      isActive: input.isActive,
    } as EscalationPolicy);
    await Promise.all(
      input.levels.map((lvl) =>
        this.levels.create({ policyId: policy.id, ...lvl } as EscalationLevel),
      ),
    );
    return { data: await this.policies.findByPk(policy.id, { include: [EscalationLevel] }) };
  }

  @RequirePermissions('escalation_policy.write')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ZodBody(UpdateEscalationPolicySchema)) input: UpdateEscalationPolicyInput,
  ) {
    const policy = await this.policies.findByPk(id);
    if (!policy) return { data: null };
    await policy.update({
      ...(input.name ? { name: input.name } : {}),
      ...(typeof input.isActive === 'boolean' ? { isActive: input.isActive } : {}),
      ...(input.departmentId !== undefined ? { departmentId: input.departmentId } : {}),
    });
    if (input.levels) {
      await this.levels.destroy({ where: { policyId: policy.id } });
      await Promise.all(
        input.levels.map((lvl) =>
          this.levels.create({ policyId: policy.id, ...lvl } as EscalationLevel),
        ),
      );
    }
    return { data: await this.policies.findByPk(policy.id, { include: [EscalationLevel] }) };
  }

  @RequirePermissions('incident.escalate')
  @Post(':incidentId/force-escalate')
  async forceEscalate(@Param('incidentId') incidentId: string) {
    await this.escalation.forceEscalate(incidentId);
    return { data: { ok: true } };
  }
}
