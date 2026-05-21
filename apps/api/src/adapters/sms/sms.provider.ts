export const SMS_PROVIDER = Symbol('SMS_PROVIDER');

export interface SmsMessage {
  to: string;
  from?: string;
  body: string;
}

export interface SmsProvider {
  send(message: SmsMessage): Promise<{ providerMessageId: string }>;
}
