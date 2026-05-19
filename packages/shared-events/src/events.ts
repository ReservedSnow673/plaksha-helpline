import type {
  AssignmentStatus,
  ChatMessage,
  Incident,
  IncidentAssignment,
  IncidentEvent,
  IncidentStatus,
  ISODateString,
  ResponderProfile,
  ResponderStatus,
  UUID,
} from '@plaksha/shared-types';

export const WsEvent = {
  // Server -> client
  SessionReady: 'session.ready',
  Heartbeat: 'system.heartbeat',
  Degraded: 'system.degraded',

  IncidentCreated: 'incident.created',
  IncidentUpdated: 'incident.updated',
  IncidentStatusChanged: 'incident.status_changed',
  IncidentAssigned: 'incident.assigned',
  IncidentUnassigned: 'incident.unassigned',
  IncidentEscalated: 'incident.escalated',
  IncidentResolved: 'incident.resolved',
  IncidentClosed: 'incident.closed',

  AssignmentOffered: 'assignment.offered',
  AssignmentAccepted: 'assignment.accepted',
  AssignmentRejected: 'assignment.rejected',
  AssignmentTimedOut: 'assignment.timed_out',
  AssignmentEtaUpdated: 'assignment.eta_updated',

  ResponderLocationUpdated: 'responder.location_updated',
  ResponderStatusChanged: 'responder.status_changed',
  ResponderOnDuty: 'responder.on_duty',
  ResponderOffDuty: 'responder.off_duty',

  ChatMessage: 'chat.message',
  ChatTyping: 'chat.typing',
  ChatRead: 'chat.read',

  CallLinked: 'call.linked',
  CallEnded: 'call.ended',

  // Client -> server
  ClientLocation: 'client.location',
  ClientChatSend: 'client.chat.send',
  ClientChatTyping: 'client.chat.typing',
  ClientHeartbeat: 'client.heartbeat',
  ClientReplayRequest: 'client.replay.request',
} as const;

export type WsEventName = (typeof WsEvent)[keyof typeof WsEvent];

export interface WsEnvelope<TPayload = unknown> {
  event: WsEventName;
  payload: TPayload;
  sequence?: number;
  occurredAt: ISODateString;
}

export interface SessionReadyPayload {
  userId: UUID;
  rooms: string[];
  serverTime: ISODateString;
}

export interface IncidentCreatedPayload {
  incident: Incident;
}

export interface IncidentStatusChangedPayload {
  incidentId: UUID;
  publicCode: string;
  from: IncidentStatus;
  to: IncidentStatus;
  occurredAt: ISODateString;
  actorUserId: UUID | null;
}

export interface IncidentEventPayload {
  incidentId: UUID;
  event: IncidentEvent;
}

export interface AssignmentOfferedPayload {
  assignment: IncidentAssignment;
  incident: Pick<Incident, 'id' | 'publicCode' | 'category' | 'priority' | 'lat' | 'lng' | 'locationLabel'>;
  deadlineSeconds: number;
}

export interface AssignmentStatusPayload {
  assignmentId: UUID;
  incidentId: UUID;
  responderUserId: UUID;
  status: AssignmentStatus;
}

export interface ResponderLocationPayload {
  userId: UUID;
  lat: number;
  lng: number;
  accuracyM: number | null;
  updatedAt: ISODateString;
  geohash: string;
}

export interface ResponderStatusPayload {
  userId: UUID;
  status: ResponderStatus;
  isOnDuty: boolean;
}

export interface ChatMessagePayload {
  message: ChatMessage;
}

export interface ChatTypingPayload {
  threadId: UUID;
  userId: UUID;
  typing: boolean;
}

export interface HeartbeatPayload {
  serverTime: ISODateString;
}

export interface DegradedPayload {
  degraded: boolean;
  reason: string | null;
}

export interface ClientLocationPayload {
  lat: number;
  lng: number;
  accuracyM: number | null;
}

export interface ClientChatSendPayload {
  threadId: UUID;
  body: string;
  clientMessageId: string;
}

export interface ClientReplayRequestPayload {
  incidentId: UUID;
  afterSequence: number;
}
