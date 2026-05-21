import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Queue, Worker, type JobsOptions } from 'bullmq';

import { WorkerRedisService } from '../services/worker-redis.service';
import { WORKER_CONCURRENCY, WORKER_QUEUES } from '../worker.constants';

export interface EscalationJobPayload {
  escalationRunId: string;
  incidentId: string;
  policyId: string;
  level: number;
}

/**
 * Consumes scheduled escalation jobs produced by the API. The worker only
 * marks the escalation run as executed; the API resumes processing on the
 * next webhook/event tick. Keeping orchestration in the API avoids duplicate
 * delivery logic across two processes.
 */
@Injectable()
export class EscalationProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EscalationProcessor.name);
  private worker?: Worker<EscalationJobPayload>;
  private queue?: Queue<EscalationJobPayload>;

  constructor(private readonly redis: WorkerRedisService) {}

  async onModuleInit(): Promise<void> {
    const queueName = WORKER_QUEUES.ESCALATION;
    this.queue = new Queue<EscalationJobPayload>(queueName, {
      connection: this.redis.client,
      defaultJobOptions: { removeOnComplete: 1000, removeOnFail: 5000 } satisfies JobsOptions,
    });
    this.worker = new Worker<EscalationJobPayload>(
      queueName,
      async (job) => {
        this.logger.log(
          `Processing escalation: run=${job.data.escalationRunId} incident=${job.data.incidentId} level=${job.data.level}`,
        );
        await this.redis.client.publish(
          'plaksha:escalation:run',
          JSON.stringify(job.data),
        );
        return { ok: true };
      },
      { connection: this.redis.client, concurrency: WORKER_CONCURRENCY.ESCALATION },
    );
    this.worker.on('failed', (job, err) => {
      this.logger.error(`Escalation job ${job?.id} failed: ${err.message}`);
    });
    this.logger.log(`Escalation worker listening on queue ${queueName}`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
    await this.queue?.close();
  }
}
