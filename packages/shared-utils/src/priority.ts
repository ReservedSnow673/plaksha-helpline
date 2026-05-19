import type { DepartmentCode, Priority } from '@plaksha/shared-types';

const PRIORITY_BY_CATEGORY: Record<DepartmentCode, Priority> = {
  MEDICAL: 'P1',
  FIRE: 'P1',
  WOMEN_SAFETY: 'P1',
  SECURITY: 'P2',
  MENTAL_HEALTH: 'P2',
  ESCORT: 'P3',
  ELECTRICAL: 'P3',
  MAINTENANCE: 'P4',
  CARPENTRY: 'P4',
  FACILITIES: 'P4',
  ADMIN_ESCALATION: 'P3',
};

export function defaultPriorityForCategory(category: DepartmentCode): Priority {
  return PRIORITY_BY_CATEGORY[category];
}
