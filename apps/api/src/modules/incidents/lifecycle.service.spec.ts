import { InvalidTransitionError, isValidTransition } from '@plaksha/shared-types';

import { InvalidStateError } from '../../common/exceptions';

import { LifecycleService } from './lifecycle.service';

describe('LifecycleService', () => {
  const service = new LifecycleService();

  it('allows CREATED to ACKNOWLEDGED', () => {
    expect(() => service.ensure('CREATED', 'ACKNOWLEDGED')).not.toThrow();
  });

  it('rejects CREATED to RESOLVED', () => {
    expect(() => service.ensure('CREATED', 'RESOLVED')).toThrow(InvalidStateError);
    expect(isValidTransition('CREATED', 'RESOLVED')).toBe(false);
  });

  it('allows ARRIVED to RESOLVED', () => {
    expect(() => service.ensure('ARRIVED', 'RESOLVED')).not.toThrow();
  });

  it('blocks transitions from ARCHIVED', () => {
    expect(() => service.ensure('ARCHIVED', 'CLOSED')).toThrow(InvalidStateError);
    expect(new InvalidTransitionError('ARCHIVED', 'CLOSED').message).toContain('ARCHIVED');
  });
});
