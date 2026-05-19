import { z } from 'zod';

import { UuidSchema } from './primitives';

export const AssignResponderSchema = z.object({
  responderId: UuidSchema,
  etaSeconds: z.number().int().min(0).max(7200).optional(),
});
export type AssignResponderInput = z.infer<typeof AssignResponderSchema>;

export const RejectAssignmentSchema = z.object({
  reason: z.string().max(500).optional(),
});
export type RejectAssignmentInput = z.infer<typeof RejectAssignmentSchema>;

export const UpdateEtaSchema = z.object({
  etaSeconds: z.number().int().min(0).max(7200),
});
export type UpdateEtaInput = z.infer<typeof UpdateEtaSchema>;
