export const PUSH_PROVIDER = Symbol('PUSH_PROVIDER');

export interface PushMessage {
  to: string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  priority?: 'default' | 'high';
  ttl?: number;
  channelId?: string;
  sound?: 'default' | null;
}

export interface PushTicket {
  to: string;
  status: 'ok' | 'error';
  ticketId?: string;
  error?: string;
}

export interface PushProvider {
  send(message: PushMessage): Promise<PushTicket[]>;
}
