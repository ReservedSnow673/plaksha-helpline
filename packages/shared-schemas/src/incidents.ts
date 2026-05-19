import { DEPARTMENT_CODES, INCIDENT_STATUSES } from '@plaksha/shared-types';
import { z } from 'zod';

import { LanguageSchema, LatSchema, LngSchema, PrioritySchema, UuidSchema } from './primitives';

export const IncidentCategorySchema = z.enum(
  DEPARTMENT_CODES as unknown as [string, ...string[]],
);

export const IncidentStatusSchema = z.enum(
  INCIDENT_STATUSES as unknown as [string, ...string[]],
);

export const IncidentChannelSchema = z.enum(['APP_SOS', 'IVR', 'WEB', 'SMS', 'MANUAL_DISPATCH']);

export const CreateIncidentSchema = z.object({
  category: IncidentCategorySchema,
  priority: PrioritySchema.optional(),
  channel: IncidentChannelSchema.default('APP_SOS'),
  language: LanguageSchema.default('en'),
  lat: LatSchema.optional(),
  lng: LngSchema.optional(),
  locationAccuracyM: z.number().positive().max(10000).optional(),
  locationLabel: z.string().max(200).optional(),
  addressText: z.string().max(500).optional(),
  anonymous: z.boolean().default(false),
  note: z.string().max(2000).optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type CreateIncidentInput = z.infer<typeof CreateIncidentSchema>;

export const UpdateIncidentStatusSchema = z.object({
  to: IncidentStatusSchema,
  reason: z.string().max(500).optional(),
});
export type UpdateIncidentStatusInput = z.infer<typeof UpdateIncidentStatusSchema>;

export const CancelIncidentSchema = z.object({
  reason: z.string().max(500).optional(),
});
export type CancelIncidentInput = z.infer<typeof CancelIncidentSchema>;

export const ListIncidentsQuerySchema = z.object({
  status: IncidentStatusSchema.optional(),
  departmentId: UuidSchema.optional(),
  category: IncidentCategorySchema.optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(64).optional(),
});
export type ListIncidentsQuery = z.infer<typeof ListIncidentsQuerySchema>;

export const ForceEscalateSchema = z.object({
  reason: z.string().max(500).optional(),
});
