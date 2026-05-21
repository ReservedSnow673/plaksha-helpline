import type { AppConfig } from '@plaksha/shared-config';
import { Logger } from '@nestjs/common';
import { Resend } from 'resend';

import type { EmailMessage, EmailProvider } from './email.provider';

export class ResendEmailProvider implements EmailProvider {
  private readonly logger = new Logger('ResendEmailProvider');
  private readonly client: Resend;
  private readonly from: string;

  constructor(config: AppConfig) {
    if (!config.email.resendApiKey) throw new Error('RESEND_API_KEY missing');
    this.client = new Resend(config.email.resendApiKey);
    this.from = config.email.resendFrom;
  }

  async send(message: EmailMessage): Promise<{ providerMessageId: string | null }> {
    const result = await this.client.emails.send({
      from: this.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      tags: message.tags ? Object.entries(message.tags).map(([name, value]) => ({ name, value })) : undefined,
    });
    if (result.error) {
      this.logger.error(`Resend send failed: ${result.error.message}`);
      throw new Error(result.error.message);
    }
    return { providerMessageId: result.data?.id ?? null };
  }
}
