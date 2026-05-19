import type { IncidentStatus } from './incidents';

/**
 * Single source of truth for valid incident state transitions.
 * Any transition not in this map is rejected by the lifecycle service.
 */
export const INCIDENT_TRANSITIONS: Record<IncidentStatus, readonly IncidentStatus[]> = {
  CREATED: ['ACKNOWLEDGED', 'CANCELLED', 'FALSE_ALARM'],
  ACKNOWLEDGED: ['RESPONDER_ASSIGNED', 'CANCELLED', 'FALSE_ALARM'],
  RESPONDER_ASSIGNED: ['EN_ROUTE', 'ACKNOWLEDGED', 'CANCELLED', 'FALSE_ALARM'],
  EN_ROUTE: ['ARRIVED', 'RESPONDER_ASSIGNED', 'CANCELLED', 'FALSE_ALARM'],
  ARRIVED: ['RESOLVED', 'EN_ROUTE'],
  RESOLVED: ['CLOSED'],
  CLOSED: ['ARCHIVED'],
  ARCHIVED: [],
  CANCELLED: ['CLOSED'],
  FALSE_ALARM: ['CLOSED'],
} as const;

export const TERMINAL_STATUSES: readonly IncidentStatus[] = ['ARCHIVED'] as const;

export function isValidTransition(from: IncidentStatus, to: IncidentStatus): boolean {
  return INCIDENT_TRANSITIONS[from].includes(to);
}

export function isTerminal(status: IncidentStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function nextStatuses(from: IncidentStatus): readonly IncidentStatus[] {
  return INCIDENT_TRANSITIONS[from];
}

export class InvalidTransitionError extends Error {
  constructor(
    public readonly from: IncidentStatus,
    public readonly to: IncidentStatus,
  ) {
    super(`Invalid incident transition: ${from} -> ${to}`);
    this.name = 'InvalidTransitionError';
  }
}
