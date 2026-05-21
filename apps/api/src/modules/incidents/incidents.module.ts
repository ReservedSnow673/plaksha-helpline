import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ChatThread } from '../../db/models/chat-thread.model';
import { Incident } from '../../db/models/incident.model';
import { IncidentAssignment } from '../../db/models/incident-assignment.model';
import { IncidentEvent } from '../../db/models/incident-event.model';
import { OutboxEvent } from '../../db/models/outbox-event.model';
import { User } from '../../db/models/user.model';
import { AuditModule } from '../audit/audit.module';
import { DepartmentsModule } from '../departments/departments.module';
import { EscalationModule } from '../escalation/escalation.module';
import { OutboxModule } from '../outbox/outbox.module';

import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { LifecycleService } from './lifecycle.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Incident,
      IncidentEvent,
      IncidentAssignment,
      ChatThread,
      OutboxEvent,
      User,
    ]),
    AuditModule,
    DepartmentsModule,
    OutboxModule,
    forwardRef(() => EscalationModule),
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService, LifecycleService],
  exports: [IncidentsService, LifecycleService],
})
export class IncidentsModule {}
