import type { AppConfig } from '@plaksha/shared-config';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { APP_CONFIG } from '../config/config.module';

import {
  AuditLog,
  CallRecord,
  ChatMessage,
  ChatThread,
  ConsentRecord,
  Department,
  DeviceRegistration,
  EscalationLevel,
  EscalationPolicy,
  EscalationRun,
  FeatureFlag,
  Incident,
  IncidentAssignment,
  IncidentEvent,
  MagicLinkToken,
  Notification,
  OutboxEvent,
  ResponderProfile,
  Session,
  SmsRecord,
  User,
} from './models';

const models = [
  User,
  Session,
  MagicLinkToken,
  Department,
  ResponderProfile,
  Incident,
  IncidentEvent,
  IncidentAssignment,
  EscalationPolicy,
  EscalationLevel,
  EscalationRun,
  AuditLog,
  Notification,
  DeviceRegistration,
  ChatThread,
  ChatMessage,
  CallRecord,
  SmsRecord,
  ConsentRecord,
  FeatureFlag,
  OutboxEvent,
];

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => ({
        dialect: 'postgres' as const,
        uri: config.database.url,
        logging: false,
        autoLoadModels: false,
        synchronize: false,
        pool: { max: config.database.poolMax, min: config.database.poolMin, idle: 10_000 },
        dialectOptions:
          config.database.ssl === 'require'
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : {},
        models,
      }),
    }),
    SequelizeModule.forFeature(models),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
