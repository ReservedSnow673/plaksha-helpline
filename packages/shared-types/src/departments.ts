import type { ISODateString, Priority, UUID } from './common';

export type DepartmentCode =
  | 'MEDICAL'
  | 'FIRE'
  | 'SECURITY'
  | 'WOMEN_SAFETY'
  | 'MENTAL_HEALTH'
  | 'MAINTENANCE'
  | 'ELECTRICAL'
  | 'CARPENTRY'
  | 'FACILITIES'
  | 'ESCORT'
  | 'ADMIN_ESCALATION';

export const DEPARTMENT_CODES: readonly DepartmentCode[] = [
  'MEDICAL',
  'FIRE',
  'SECURITY',
  'WOMEN_SAFETY',
  'MENTAL_HEALTH',
  'MAINTENANCE',
  'ELECTRICAL',
  'CARPENTRY',
  'FACILITIES',
  'ESCORT',
  'ADMIN_ESCALATION',
] as const;

export interface Department {
  id: UUID;
  code: DepartmentCode;
  nameEn: string;
  nameHi: string;
  namePa: string;
  colorHex: string;
  defaultPriority: Priority;
  escalationPolicyId: UUID | null;
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
