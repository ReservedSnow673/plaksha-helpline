import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { CallRecord } from '../../db/models/call-record.model';
import { SmsRecord } from '../../db/models/sms-record.model';

import { CallsController } from './calls.controller';
import { CallsService } from './calls.service';

@Module({
  imports: [SequelizeModule.forFeature([CallRecord, SmsRecord])],
  controllers: [CallsController],
  providers: [CallsService],
  exports: [CallsService],
})
export class CallsModule {}
