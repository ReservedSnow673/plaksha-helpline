import { ROLES } from '@plaksha/shared-types';
import { z } from 'zod';

import { UuidSchema } from './primitives';

export const EscalationActionSchema = z.enum([
  'NOTIFY_ROLE',
  'NOTIFY_USER',
  'BROADCAST_DEPT',
  'REROUTE_DEPT',
  'PAGE_ADMIN',
  'AUTO_CALL_BACKUP',
]);

export const EscalationLevelInputSchema = z.object({
  levelIndex: z.number().int().min(0).max(10),
  triggerAfterSeconds: z.number().int().min(0).max(7200),
  action: EscalationActionSchema,
  targetRole: z.enum(ROLES as unknown as [string, ...string[]]).nullable().optional(),
  targetUserId: UuidSchema.nullable().optional(),
  targetDepartmentId: UuidSchema.nullable().optional(),
  requiresAck: z.boolean().default(true),
  ackDeadlineSeconds: z.number().int().positive().max(7200).nullable().optional(),
});

export const CreateEscalationPolicySchema = z.object({
  departmentId: UuidSchema.nullable().optional(),
  name: z.string().min(2).max(100),
  isActive: z.boolean().default(true),
  levels: z.array(EscalationLevelInputSchema).min(1).max(10),
});
export type CreateEscalationPolicyInput = z.infer<typeof CreateEscalationPolicySchema>;

export const UpdateEscalationPolicySchema = CreateEscalationPolicySchema.partial();
export type UpdateEscalationPolicyInput = z.infer<typeof UpdateEscalationPolicySchema>;
