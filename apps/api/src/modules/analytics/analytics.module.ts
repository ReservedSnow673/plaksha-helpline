import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Incident } from '../../db/models/incident.model';
import { IncidentAssignment } from '../../db/models/incident-assignment.model';
import { IncidentEvent } from '../../db/models/incident-event.model';

import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [SequelizeModule.forFeature([Incident, IncidentEvent, IncidentAssignment])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
