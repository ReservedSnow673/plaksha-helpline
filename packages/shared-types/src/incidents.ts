import type { ISODateString, Language, Priority, UUID } from './common';
import type { DepartmentCode } from './departments';

export type IncidentStatus =
  | 'CREATED'
  | 'ACKNOWLEDGED'
  | 'RESPONDER_ASSIGNED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'ARCHIVED'
  | 'CANCELLED'
  | 'FALSE_ALARM';

export const INCIDENT_STATUSES: readonly IncidentStatus[] = [
  'CREATED',
  'ACKNOWLEDGED',
  'RESPONDER_ASSIGNED',
  'EN_ROUTE',
  'ARRIVED',
  'RESOLVED',
  'CLOSED',
  'ARCHIVED',
  'CANCELLED',
  'FALSE_ALARM',
] as const;

export type IncidentChannel = 'APP_SOS' | 'IVR' | 'WEB' | 'SMS' | 'MANUAL_DISPATCH';

export interface Incident {
  id: UUID;
  publicCode: string;
  category: DepartmentCode;
  priority: Priority;
  status: IncidentStatus;
  reportedByUserId: UUID | null;
  departmentId: UUID | null;
  language: Language;
  channel: IncidentChannel;
  lat: number | null;
  lng: number | null;
  locationLabel: string | null;
  locationAccuracyM: number | null;
  addressText: string | null;
  anonymous: boolean;
  metadata: Record<string, unknown>;
  createdAt: ISODateString;
  acknowledgedAt: ISODateString | null;
  firstResponderAssignedAt: ISODateString | null;
  enRouteAt: ISODateString | null;
  arrivedAt: ISODateString | null;
  resolvedAt: ISODateString | null;
  closedAt: ISODateString | null;
  archivedAt: ISODateString | null;
}

export type IncidentEventType =
  | 'incident.created'
  | 'incident.categorized'
  | 'incident.acknowledged'
  | 'incident.assigned'
  | 'incident.unassigned'
  | 'incident.en_route'
  | 'incident.arrived'
  | 'incident.resolved'
  | 'incident.closed'
  | 'incident.archived'
  | 'incident.cancelled'
  | 'incident.flagged_false_alarm'
  | 'incident.escalated'
  | 'incident.note_added'
  | 'incident.priority_changed'
  | 'incident.location_updated'
  | 'incident.attachment_added'
  | 'incident.call_linked'
  | 'incident.chat_opened'
  | 'incident.chat_closed';

export interface IncidentEvent {
  id: UUID;
  incidentId: UUID;
  eventType: IncidentEventType;
  actorUserId: UUID | null;
  actorKind: 'USER' | 'SYSTEM' | 'PROVIDER';
  payload: Record<string, unknown>;
  occurredAt: ISODateString;
  sequence: number;
}
