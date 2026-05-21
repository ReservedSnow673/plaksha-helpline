import { loadConfig, type AppConfig } from '@plaksha/shared-config';
import { Global, Module } from '@nestjs/common';

export const APP_CONFIG = Symbol('APP_CONFIG');

@Global()
@Module({
  providers: [
    {
      provide: APP_CONFIG,
      useFactory: (): AppConfig => loadConfig(),
    },
  ],
  exports: [APP_CONFIG],
})
export class ConfigModule {}
