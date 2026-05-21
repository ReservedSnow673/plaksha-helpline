import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';

import { WorkerRedisService } from '../services/worker-redis.service';
import { WORKER_CONCURRENCY, WORKER_QUEUES } from '../worker.constants';

export interface NotificationJobPayload {
  notificationId: string;
  channel: 'PUSH' | 'SMS' | 'EMAIL' | 'WS';
  attempt: number;
}

@Injectable()
export class NotificationProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationProcessor.name);
  private worker?: Worker<NotificationJobPayload>;
  private queue?: Queue<NotificationJobPayload>;

  constructor(private readonly redis: WorkerRedisService) {}

  async onModuleInit(): Promise<void> {
    const name = WORKER_QUEUES.NOTIFICATION;
    this.queue = new Queue<NotificationJobPayload>(name, { connection: this.redis.client });
    this.worker = new Worker<NotificationJobPayload>(
      name,
      async (job) => {
        this.logger.log(
          `Processing notification ${job.data.notificationId} via ${job.data.channel} (attempt ${job.data.attempt})`,
        );
        await this.redis.client.publish(
          'plaksha:notification:dispatch',
          JSON.stringify(job.data),
        );
        return { ok: true };
      },
      { connection: this.redis.client, concurrency: WORKER_CONCURRENCY.NOTIFICATION },
    );
    this.logger.log(`Notification worker listening on queue ${name}`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
    await this.queue?.close();
  }
}
