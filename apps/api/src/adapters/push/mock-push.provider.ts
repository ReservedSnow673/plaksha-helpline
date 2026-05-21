import { Logger } from '@nestjs/common';

import type { PushMessage, PushProvider, PushTicket } from './push.provider';

export class MockPushProvider implements PushProvider {
  private readonly logger = new Logger('MockPushProvider');

  async send(message: PushMessage): Promise<PushTicket[]> {
    this.logger.log(
      `MOCK PUSH title="${message.title}" body="${message.body}" recipients=${message.to.length}`,
    );
    return message.to.map((to) => ({ to, status: 'ok' as const, ticketId: `mock-${Date.now()}` }));
  }
}
