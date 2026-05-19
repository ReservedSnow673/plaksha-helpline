import type { ISODateString, Language, UUID } from './common';

export type CallProvider = 'TWILIO' | 'EXOTEL' | 'MOCK';
export type CallDirection = 'INBOUND' | 'OUTBOUND';
export type CallStatus =
  | 'RINGING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'NO_ANSWER'
  | 'FAILED'
  | 'BUSY'
  | 'CANCELLED';

export interface CallRecord {
  id: UUID;
  incidentId: UUID | null;
  provider: CallProvider;
  providerCallSid: string;
  direction: CallDirection;
  fromE164: string;
  toE164: string;
  language: Language | null;
  ivrPath: string[];
  startedAt: ISODateString;
  answeredAt: ISODateString | null;
  endedAt: ISODateString | null;
  durationSeconds: number | null;
  status: CallStatus;
  recordingUrl: string | null;
  recordingConsent: boolean;
}

export interface SmsRecord {
  id: UUID;
  incidentId: UUID | null;
  provider: CallProvider;
  providerMessageId: string;
  direction: CallDirection;
  fromE164: string;
  toE164: string;
  body: string;
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';
  createdAt: ISODateString;
}
