import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Incident } from '../../db/models/incident.model';
import { IncidentAssignment } from '../../db/models/incident-assignment.model';
import { ResponderProfile } from '../../db/models/responder-profile.model';
import { User } from '../../db/models/user.model';
import { AuditModule } from '../audit/audit.module';
import { IncidentsModule } from '../incidents/incidents.module';
import { OutboxModule } from '../outbox/outbox.module';

import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';

@Module({
  imports: [
    SequelizeModule.forFeature([IncidentAssignment, Incident, ResponderProfile, User]),
    AuditModule,
    OutboxModule,
    forwardRef(() => IncidentsModule),
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
