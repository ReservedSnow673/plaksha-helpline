import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { OutboxEvent } from '../../db/models/outbox-event.model';

import { OutboxPoller } from './outbox.poller';
import { OutboxService } from './outbox.service';

@Module({
  imports: [SequelizeModule.forFeature([OutboxEvent])],
  providers: [OutboxService, OutboxPoller],
  exports: [OutboxService],
})
export class OutboxModule {}
