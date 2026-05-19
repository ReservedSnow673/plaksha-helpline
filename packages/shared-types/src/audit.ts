import type { ISODateString, UUID } from './common';
import type { Role } from './rbac';

export interface AuditLogEntry {
  id: UUID;
  actorUserId: UUID | null;
  actorRole: Role | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  ip: string | null;
  userAgent: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  occurredAt: ISODateString;
}

export interface ConsentRecord {
  id: UUID;
  userId: UUID;
  consentType: 'RECORDING' | 'LOCATION_TRACKING' | 'DATA_PROCESSING';
  grantedAt: ISODateString | null;
  revokedAt: ISODateString | null;
  ip: string | null;
  policyVersion: string;
}
