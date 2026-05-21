import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Department } from '../../db/models/department.model';
import { AuditModule } from '../audit/audit.module';

import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';

@Module({
  imports: [SequelizeModule.forFeature([Department]), AuditModule],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
