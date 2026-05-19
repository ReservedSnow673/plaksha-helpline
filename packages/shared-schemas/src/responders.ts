import { z } from 'zod';

import { LatSchema, LngSchema } from './primitives';

export const ResponderStatusSchema = z.enum(['AVAILABLE', 'BUSY', 'OFFLINE', 'ON_BREAK']);

export const UpdateResponderStatusSchema = z.object({
  status: ResponderStatusSchema,
  isOnDuty: z.boolean(),
});
export type UpdateResponderStatusInput = z.infer<typeof UpdateResponderStatusSchema>;

export const UpdateResponderLocationSchema = z.object({
  lat: LatSchema,
  lng: LngSchema,
  accuracyM: z.number().positive().max(10000).nullable().optional(),
});
export type UpdateResponderLocationInput = z.infer<typeof UpdateResponderLocationSchema>;
