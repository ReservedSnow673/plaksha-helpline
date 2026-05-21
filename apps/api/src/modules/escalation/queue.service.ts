import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';

import { RedisService } from '../../adapters/redis/redis.service';

export const ESCALATION_QUEUE_NAME = 'escalation';

export interface EscalationJobData {
  incidentId: string;
  policyId: string;
  levelIndex: number;
  scheduledFor: string;
  runId: string;
}

@Injectable()
export class EscalationQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(EscalationQueueService.name);
  readonly queue: Queue<EscalationJobData>;

  constructor(redis: RedisService) {
    this.queue = new Queue<EscalationJobData>(ESCALATION_QUEUE_NAME, {
      connection: redis.client,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2_000 },
        removeOnComplete: { age: 24 * 3600, count: 1_000 },
        removeOnFail: { age: 7 * 24 * 3600 },
      },
    });
  }

  async enqueue(
    data: EscalationJobData,
    opts: { delaySeconds: number; jobId: string },
  ): Promise<void> {
    await this.queue.add('fire-level', data, { delay: opts.delaySeconds * 1000, jobId: opts.jobId });
    this.logger.debug(
      `escalation queued incident=${data.incidentId} level=${data.levelIndex} in=${opts.delaySeconds}s`,
    );
  }

  async cancel(jobId: string): Promise<void> {
    const job = await this.queue.getJob(jobId);
    if (job) await job.remove();
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}
