import { RegisterDeviceSchema, type RegisterDeviceInput } from '@plaksha/shared-schemas';
import { Body, Controller, Post } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodBody } from '../../common/pipes/zod-validation.pipe';
import type { RequestPrincipal } from '../../common/types/request';

import { NotificationsService } from './notifications.service';

@Controller('me/devices')
export class DevicesController {
  constructor(private readonly notifications: NotificationsService) {}

  @Post()
  async register(
    @CurrentUser() actor: RequestPrincipal,
    @Body(ZodBody(RegisterDeviceSchema)) input: RegisterDeviceInput,
  ) {
    const device = await this.notifications.registerDevice({
      userId: actor.userId,
      expoPushToken: input.expoPushToken,
      deviceId: input.deviceId,
      platform: input.platform,
      appVersion: input.appVersion,
      locale: input.locale,
    });
    return { data: device };
  }
}
