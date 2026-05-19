import type { UUID } from '@plaksha/shared-types';

export const Rooms = {
  user: (userId: UUID): string => `user:${userId}`,
  incident: (incidentId: UUID): string => `incident:${incidentId}`,
  deptDispatch: (departmentId: UUID): string => `dept:${departmentId}:dispatch`,
  deptOnDuty: (departmentId: UUID): string => `dept:${departmentId}:onduty`,
  adminOverview: (): string => 'admin:overview',
} as const;
