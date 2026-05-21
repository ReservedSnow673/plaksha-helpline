import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ResponderProfile } from '../../db/models/responder-profile.model';
import { User } from '../../db/models/user.model';
import { AuditModule } from '../audit/audit.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [SequelizeModule.forFeature([User, ResponderProfile]), AuditModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
