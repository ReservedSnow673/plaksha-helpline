import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { DeviceRegistration } from '../../db/models/device-registration.model';
import { Notification } from '../../db/models/notification.model';
import { User } from '../../db/models/user.model';

import { DevicesController } from './devices.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [SequelizeModule.forFeature([Notification, DeviceRegistration, User])],
  controllers: [DevicesController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
