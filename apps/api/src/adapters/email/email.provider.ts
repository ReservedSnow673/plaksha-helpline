export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  tags?: Record<string, string>;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<{ providerMessageId: string | null }>;
}
