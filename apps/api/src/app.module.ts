import './env';
import { loadConfig } from '@plaksha/shared-config';
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import { AdaptersModule } from './adapters/adapters.module';
import { CorrelationInterceptor } from './common/interceptors/correlation.interceptor';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './db/database.module';
import { AdminModule } from './modules/admin/admin.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { CallsModule } from './modules/calls/calls.module';
import { ChatModule } from './modules/chat/chat.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { EscalationModule } from './modules/escalation/escalation.module';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module';
import { HealthModule } from './modules/health/health.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OutboxModule } from './modules/outbox/outbox.module';
import { RespondersModule } from './modules/responders/responders.module';
import { UsersModule } from './modules/users/users.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: loadConfig().logLevel,
        transport:
          loadConfig().nodeEnv === 'development'
            ? { target: 'pino-pretty', options: { singleLine: true, colorize: true } }
            : undefined,
        redact: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token'],
        serializers: {
          req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            remoteAddress: req.remoteAddress,
          }),
          res: (res) => ({ statusCode: res.statusCode }),
        },
      },
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: loadConfig().ops.rateLimitDefaultPerMin },
    ]),
    ConfigModule,
    DatabaseModule,
    AdaptersModule,
    HealthModule,
    AuthModule,
    UsersModule,
    DepartmentsModule,
    IncidentsModule,
    AssignmentsModule,
    RespondersModule,
    EscalationModule,
    NotificationsModule,
    ChatModule,
    CallsModule,
    AuditModule,
    AnalyticsModule,
    FeatureFlagsModule,
    AdminModule,
    WebsocketModule,
    WebhooksModule,
    OutboxModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_INTERCEPTOR, useClass: CorrelationInterceptor },
  ],
})
export class AppModule {}
