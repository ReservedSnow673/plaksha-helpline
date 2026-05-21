import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuditLog } from '../../db/models/audit-log.model';

import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

@Module({
  imports: [SequelizeModule.forFeature([AuditLog])],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
