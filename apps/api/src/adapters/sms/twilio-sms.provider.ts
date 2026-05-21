import type { AppConfig } from '@plaksha/shared-config';
import twilio from 'twilio';

import type { SmsMessage, SmsProvider } from './sms.provider';

export class TwilioSmsProvider implements SmsProvider {
  private readonly client: twilio.Twilio;
  private readonly from: string;

  constructor(config: AppConfig) {
    if (
      !config.ivr.twilioAccountSid ||
      !config.ivr.twilioAuthToken ||
      !config.ivr.twilioPhoneNumber
    ) {
      throw new Error('Twilio SMS provider requires TWILIO_* env vars');
    }
    this.client = twilio(config.ivr.twilioAccountSid, config.ivr.twilioAuthToken);
    this.from = config.ivr.twilioPhoneNumber;
  }

  async send(message: SmsMessage): Promise<{ providerMessageId: string }> {
    const result = await this.client.messages.create({
      to: message.to,
      from: message.from ?? this.from,
      body: message.body,
    });
    return { providerMessageId: result.sid };
  }
}
