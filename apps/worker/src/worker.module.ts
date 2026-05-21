import { Module, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { loadConfig, type AppConfig } from '@plaksha/shared-config';

import { EscalationProcessor } from './processors/escalation.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { OutboxPollerProcessor } from './processors/outbox.processor';
import { RetentionProcessor } from './processors/retention.processor';
import { WorkerRedisService } from './services/worker-redis.service';
import { WORKER_CONFIG } from './worker.constants';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: () => {
        const cfg = loadConfig();
        return {
          dialect: 'postgres' as const,
          uri: cfg.database.url,
          logging: false,
          autoLoadModels: false,
          synchronize: false,
          dialectOptions:
            cfg.database.ssl === 'require'
              ? { ssl: { require: true, rejectUnauthorized: false } }
              : {},
          pool: { max: cfg.database.poolMax, min: cfg.database.poolMin, idle: 10_000 },
          models: [],
        };
      },
    }),
  ],
  providers: [
    {
      provide: WORKER_CONFIG,
      useFactory: (): AppConfig => loadConfig(),
    },
    WorkerRedisService,
    EscalationProcessor,
    NotificationProcessor,
    OutboxPollerProcessor,
    RetentionProcessor,
  ],
})
export class WorkerModule implements OnModuleInit {
  private readonly logger = new Logger(WorkerModule.name);

  constructor(@Inject(WORKER_CONFIG) private readonly config: AppConfig) {}

  async onModuleInit(): Promise<void> {
    this.logger.log(`Worker module ready in ${this.config.nodeEnv} environment`);
  }
}
