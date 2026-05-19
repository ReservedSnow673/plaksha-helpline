import type { ISODateString, Priority, UUID } from './common';

export type NotificationChannel = 'PUSH' | 'SMS' | 'EMAIL' | 'WHATSAPP' | 'VOICE' | 'WS';
export type NotificationStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'SUPPRESSED';

export interface NotificationRecord {
  id: UUID;
  userId: UUID;
  channel: NotificationChannel;
  incidentId: UUID | null;
  payload: Record<string, unknown>;
  priority: Priority;
  status: NotificationStatus;
  providerMessageId: string | null;
  attemptCount: number;
  lastAttemptAt: ISODateString | null;
  deliveredAt: ISODateString | null;
  error: string | null;
  createdAt: ISODateString;
}

export interface DeviceRegistration {
  id: UUID;
  userId: UUID;
  expoPushToken: string;
  deviceId: string;
  platform: 'IOS' | 'ANDROID';
  appVersion: string;
  locale: string;
  lastSeenAt: ISODateString;
  pushEnabled: boolean;
}
