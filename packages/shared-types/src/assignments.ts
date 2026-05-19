import type { ISODateString, UUID } from './common';

export type AssignmentStatus =
  | 'OFFERED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'TIMED_OUT'
  | 'REASSIGNED'
  | 'COMPLETED';

export type ResponderStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'ON_BREAK';

export interface IncidentAssignment {
  id: UUID;
  incidentId: UUID;
  responderUserId: UUID;
  offeredAt: ISODateString;
  acceptedAt: ISODateString | null;
  rejectedAt: ISODateString | null;
  rejectionReason: string | null;
  enRouteAt: ISODateString | null;
  arrivedAt: ISODateString | null;
  completedAt: ISODateString | null;
  status: AssignmentStatus;
  etaSeconds: number | null;
  distanceM: number | null;
}

export interface ResponderProfile {
  userId: UUID;
  departmentId: UUID;
  isOnDuty: boolean;
  shiftStartedAt: ISODateString | null;
  currentLat: number | null;
  currentLng: number | null;
  locationUpdatedAt: ISODateString | null;
  currentGeohash: string | null;
  status: ResponderStatus;
  currentAssignmentId: UUID | null;
  vehicleInfo: Record<string, unknown> | null;
  skills: string[];
}
