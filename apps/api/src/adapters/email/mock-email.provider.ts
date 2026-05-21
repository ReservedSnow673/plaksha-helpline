import { Logger } from '@nestjs/common';

import type { EmailMessage, EmailProvider } from './email.provider';

export class MockEmailProvider implements EmailProvider {
  private readonly logger = new Logger('MockEmailProvider');

  async send(message: EmailMessage): Promise<{ providerMessageId: string | null }> {
    const id = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.logger.log(
      `MOCK EMAIL to=${message.to} subject="${message.subject}" id=${id}\n${message.text ?? stripHtml(message.html).slice(0, 240)}`,
    );
    return { providerMessageId: id };
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
