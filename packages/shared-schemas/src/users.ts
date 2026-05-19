import { ROLES } from '@plaksha/shared-types';
import { z } from 'zod';

import { LanguageSchema, PhoneE164Schema, UuidSchema } from './primitives';

export const RoleSchema = z.enum(ROLES as unknown as [string, ...string[]]);
export const UserStatusSchema = z.enum(['ACTIVE', 'SUSPENDED', 'DELETED']);

export const UpdateUserProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phoneE164: PhoneE164Schema.optional(),
  preferredLanguage: LanguageSchema.optional(),
});
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;

export const AssignUserRoleSchema = z.object({
  role: RoleSchema,
  departmentId: UuidSchema.nullable().optional(),
});
export type AssignUserRoleInput = z.infer<typeof AssignUserRoleSchema>;

export const UpdateUserStatusSchema = z.object({
  status: UserStatusSchema,
  reason: z.string().max(500).optional(),
});
export type UpdateUserStatusInput = z.infer<typeof UpdateUserStatusSchema>;
