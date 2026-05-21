import { Module } from '@nestjs/common';

import { CallsModule } from '../calls/calls.module';
import { IncidentsModule } from '../incidents/incidents.module';

import { IvrWebhookController } from './ivr-webhook.controller';

@Module({
  imports: [CallsModule, IncidentsModule],
  controllers: [IvrWebhookController],
})
export class WebhooksModule {}
