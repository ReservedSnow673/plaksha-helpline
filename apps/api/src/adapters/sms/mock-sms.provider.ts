import { Logger } from '@nestjs/common';

import type { SmsMessage, SmsProvider } from './sms.provider';

export class MockSmsProvider implements SmsProvider {
  private readonly logger = new Logger('MockSmsProvider');

  async send(message: SmsMessage): Promise<{ providerMessageId: string }> {
    const id = `mock-sms-${Date.now()}`;
    this.logger.log(`MOCK SMS to=${message.to} body="${message.body.slice(0, 160)}" id=${id}`);
    return { providerMessageId: id };
  }
}
