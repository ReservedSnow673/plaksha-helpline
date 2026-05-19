import type { ISODateString, UUID } from './common';

export interface ChatThread {
  id: UUID;
  incidentId: UUID;
  createdAt: ISODateString;
  closedAt: ISODateString | null;
}

export interface ChatMessage {
  id: UUID;
  threadId: UUID;
  senderUserId: UUID | null;
  body: string;
  attachmentUrl: string | null;
  attachmentType: string | null;
  createdAt: ISODateString;
  readAt: ISODateString | null;
  system: boolean;
}
