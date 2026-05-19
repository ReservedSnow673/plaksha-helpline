import type { ISODateString, UUID } from './common';
import type { Role } from './rbac';

export type EscalationAction =
  | 'NOTIFY_ROLE'
  | 'NOTIFY_USER'
  | 'BROADCAST_DEPT'
  | 'REROUTE_DEPT'
  | 'PAGE_ADMIN'
  | 'AUTO_CALL_BACKUP';

export type EscalationOutcome =
  | 'FIRED'
  | 'SKIPPED_ALREADY_RESOLVED'
  | 'FIRED_AND_ACKED'
  | 'FIRED_AND_ESCALATED';

export interface EscalationPolicy {
  id: UUID;
  departmentId: UUID | null;
  name: string;
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface EscalationLevel {
  id: UUID;
  policyId: UUID;
  levelIndex: number;
  triggerAfterSeconds: number;
  action: EscalationAction;
  targetRole: Role | null;
  targetUserId: UUID | null;
  targetDepartmentId: UUID | null;
  requiresAck: boolean;
  ackDeadlineSeconds: number | null;
}

export interface EscalationRun {
  id: UUID;
  incidentId: UUID;
  policyId: UUID;
  levelIndex: number;
  scheduledFor: ISODateString;
  firedAt: ISODateString | null;
  outcome: EscalationOutcome | null;
  jobId: string | null;
}
