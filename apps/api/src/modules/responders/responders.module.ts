import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ResponderProfile } from '../../db/models/responder-profile.model';
import { User } from '../../db/models/user.model';
import { AuditModule } from '../audit/audit.module';
import { OutboxModule } from '../outbox/outbox.module';

import { RespondersController } from './responders.controller';
import { RespondersService } from './responders.service';

@Module({
  imports: [SequelizeModule.forFeature([ResponderProfile, User]), AuditModule, OutboxModule],
  controllers: [RespondersController],
  providers: [RespondersService],
  exports: [RespondersService],
})
export class RespondersModule {}
