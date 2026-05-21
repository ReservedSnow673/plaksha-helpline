import type { AppConfig } from '@plaksha/shared-config';
import { Global, Module, type Provider } from '@nestjs/common';

import { APP_CONFIG } from '../config/config.module';

import { EMAIL_PROVIDER } from './email/email.provider';
import { MockEmailProvider } from './email/mock-email.provider';
import { ResendEmailProvider } from './email/resend-email.provider';
import { IVR_PROVIDER } from './ivr/ivr.provider';
import { ExotelIvrProvider } from './ivr/exotel-ivr.provider';
import { MockIvrProvider } from './ivr/mock-ivr.provider';
import { TwilioIvrProvider } from './ivr/twilio-ivr.provider';
import { PUSH_PROVIDER } from './push/push.provider';
import { ExpoPushProvider } from './push/expo-push.provider';
import { MockPushProvider } from './push/mock-push.provider';
import { SMS_PROVIDER } from './sms/sms.provider';
import { MockSmsProvider } from './sms/mock-sms.provider';
import { TwilioSmsProvider } from './sms/twilio-sms.provider';
import { STORAGE_PROVIDER } from './storage/storage.provider';
import { MockStorageProvider } from './storage/mock-storage.provider';
import { R2StorageProvider } from './storage/r2-storage.provider';
import { RedisService } from './redis/redis.service';

const emailProvider: Provider = {
  provide: EMAIL_PROVIDER,
  inject: [APP_CONFIG],
  useFactory: (config: AppConfig) =>
    config.email.provider === 'resend'
      ? new ResendEmailProvider(config)
      : new MockEmailProvider(),
};

const smsProvider: Provider = {
  provide: SMS_PROVIDER,
  inject: [APP_CONFIG],
  useFactory: (config: AppConfig) =>
    config.ivr.provider === 'twilio' && config.ivr.enabled
      ? new TwilioSmsProvider(config)
      : new MockSmsProvider(),
};

const ivrProvider: Provider = {
  provide: IVR_PROVIDER,
  inject: [APP_CONFIG],
  useFactory: (config: AppConfig) => {
    if (!config.ivr.enabled) return new MockIvrProvider();
    if (config.ivr.provider === 'twilio') return new TwilioIvrProvider(config);
    if (config.ivr.provider === 'exotel') return new ExotelIvrProvider(config);
    return new MockIvrProvider();
  },
};

const pushProvider: Provider = {
  provide: PUSH_PROVIDER,
  inject: [APP_CONFIG],
  useFactory: (config: AppConfig) =>
    config.push.expoAccessToken ? new ExpoPushProvider(config) : new MockPushProvider(),
};

const storageProvider: Provider = {
  provide: STORAGE_PROVIDER,
  inject: [APP_CONFIG],
  useFactory: (config: AppConfig) =>
    config.storage.provider === 'r2' ? new R2StorageProvider(config) : new MockStorageProvider(),
};

@Global()
@Module({
  providers: [emailProvider, smsProvider, ivrProvider, pushProvider, storageProvider, RedisService],
  exports: [EMAIL_PROVIDER, SMS_PROVIDER, IVR_PROVIDER, PUSH_PROVIDER, STORAGE_PROVIDER, RedisService],
})
export class AdaptersModule {}
