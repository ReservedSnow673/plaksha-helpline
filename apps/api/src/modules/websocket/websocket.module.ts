import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { EventsGateway } from './events.gateway';
import { FanoutSubscriber } from './fanout.subscriber';

@Module({
  imports: [AuthModule],
  providers: [EventsGateway, FanoutSubscriber],
  exports: [EventsGateway],
})
export class WebsocketModule {}
