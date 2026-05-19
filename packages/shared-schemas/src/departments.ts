import { DEPARTMENT_CODES } from '@plaksha/shared-types';
import { z } from 'zod';

import { PrioritySchema, UuidSchema } from './primitives';

export const DepartmentCodeSchema = z.enum(
  DEPARTMENT_CODES as unknown as [string, ...string[]],
);

export const CreateDepartmentSchema = z.object({
  code: DepartmentCodeSchema,
  nameEn: z.string().min(2).max(100),
  nameHi: z.string().min(2).max(100),
  namePa: z.string().min(2).max(100),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  defaultPriority: PrioritySchema.default('P2'),
  escalationPolicyId: UuidSchema.nullable().optional(),
  isActive: z.boolean().default(true),
});
export type CreateDepartmentInput = z.infer<typeof CreateDepartmentSchema>;

export const UpdateDepartmentSchema = CreateDepartmentSchema.partial().omit({ code: true });
export type UpdateDepartmentInput = z.infer<typeof UpdateDepartmentSchema>;
