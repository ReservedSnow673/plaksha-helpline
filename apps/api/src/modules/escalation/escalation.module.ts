import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Department } from '../../db/models/department.model';
import { EscalationLevel } from '../../db/models/escalation-level.model';
import { EscalationPolicy } from '../../db/models/escalation-policy.model';
import { EscalationRun } from '../../db/models/escalation-run.model';
import { AuditModule } from '../audit/audit.module';

import { EscalationController } from './escalation.controller';
import { EscalationService } from './escalation.service';
import { EscalationQueueService } from './queue.service';

@Module({
  imports: [
    SequelizeModule.forFeature([EscalationPolicy, EscalationLevel, EscalationRun, Department]),
    AuditModule,
  ],
  controllers: [EscalationController],
  providers: [EscalationService, EscalationQueueService],
  exports: [EscalationService, EscalationQueueService],
})
export class EscalationModule {}
