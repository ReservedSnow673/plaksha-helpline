import { describe, expect, it } from 'vitest';

import { INCIDENT_TRANSITIONS, isTerminal, isValidTransition, nextStatuses } from '../lifecycle';

describe('incident lifecycle', () => {
  it('defines transitions for every status', () => {
    const statuses = Object.keys(INCIDENT_TRANSITIONS);
    expect(statuses).toContain('CREATED');
    expect(statuses).toContain('ARCHIVED');
  });

  it('treats ARCHIVED as terminal', () => {
    expect(isTerminal('ARCHIVED')).toBe(true);
    expect(nextStatuses('ARCHIVED')).toEqual([]);
  });

  it('allows responder assignment from ACKNOWLEDGED', () => {
    expect(isValidTransition('ACKNOWLEDGED', 'RESPONDER_ASSIGNED')).toBe(true);
  });

  it('allows false alarm closure path', () => {
    expect(isValidTransition('CREATED', 'FALSE_ALARM')).toBe(true);
    expect(isValidTransition('FALSE_ALARM', 'CLOSED')).toBe(true);
  });
});
