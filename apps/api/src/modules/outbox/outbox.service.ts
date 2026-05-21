import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, type Transaction } from 'sequelize';

import { OutboxEvent } from '../../db/models/outbox-event.model';

export interface OutboxEnvelope {
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: Record<string, unknown>;
  rooms: string[];
}

@Injectable()
export class OutboxService {
  constructor(@InjectModel(OutboxEvent) private readonly model: typeof OutboxEvent) {}

  async enqueue(envelope: OutboxEnvelope, transaction?: Transaction): Promise<OutboxEvent> {
    return this.model.create(envelope as unknown as OutboxEvent, { transaction });
  }

  async claimUnpublished(limit = 100): Promise<OutboxEvent[]> {
    return this.model.findAll({
      where: { publishedAt: { [Op.is]: null }, retries: { [Op.lt]: 10 } },
      order: [['createdAt', 'ASC']],
      limit,
    });
  }

  async markPublished(id: string): Promise<void> {
    await this.model.update({ publishedAt: new Date() }, { where: { id } });
  }

  async markFailed(id: string): Promise<void> {
    await this.model.increment('retries', { where: { id } });
  }
}
