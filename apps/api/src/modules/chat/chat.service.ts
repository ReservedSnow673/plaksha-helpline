import { Rooms } from '@plaksha/shared-events';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { ResourceNotFoundError } from '../../common/exceptions';
import { ChatMessage } from '../../db/models/chat-message.model';
import { ChatThread } from '../../db/models/chat-thread.model';
import { OutboxService } from '../outbox/outbox.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatThread) private readonly threads: typeof ChatThread,
    @InjectModel(ChatMessage) private readonly messages: typeof ChatMessage,
    private readonly outbox: OutboxService,
  ) {}

  async getThreadForIncident(incidentId: string): Promise<ChatThread> {
    const thread = await this.threads.findOne({ where: { incidentId } });
    if (!thread) throw new ResourceNotFoundError('Chat thread for incident', incidentId);
    return thread;
  }

  async listMessages(threadId: string, before?: string, limit = 50): Promise<ChatMessage[]> {
    return this.messages.findAll({
      where: { threadId, ...(before ? { createdAt: { [Op.lt]: new Date(before) } } : {}) },
      order: [['createdAt', 'ASC']],
      limit: Math.min(limit, 100),
    });
  }

  async send(opts: {
    threadId: string;
    senderUserId: string;
    body: string;
    clientMessageId: string;
  }): Promise<ChatMessage> {
    // Idempotency: same clientMessageId within the same thread returns the existing message.
    const existing = await this.messages.findOne({
      where: { threadId: opts.threadId, clientMessageId: opts.clientMessageId },
    });
    if (existing) return existing;

    const message = await this.messages.create({
      threadId: opts.threadId,
      senderUserId: opts.senderUserId,
      body: opts.body,
      clientMessageId: opts.clientMessageId,
      system: false,
    } as ChatMessage);

    const thread = await this.threads.findByPk(opts.threadId);
    await this.outbox.enqueue({
      aggregateType: 'chat',
      aggregateId: message.id,
      eventType: 'chat.message',
      payload: { message: message.toJSON() },
      rooms: thread ? [Rooms.incident(thread.incidentId)] : [],
    });
    return message;
  }
}
