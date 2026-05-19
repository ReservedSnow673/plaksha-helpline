import { z } from 'zod';

export const UuidSchema = z.string().uuid();
export const EmailSchema = z.string().email().toLowerCase().trim();
export const PhoneE164Schema = z
  .string()
  .regex(/^\+[1-9]\d{6,14}$/, 'Phone must be E.164 format (e.g. +919876543210)');

export const LanguageSchema = z.enum(['en', 'hi', 'pa']);
export const PrioritySchema = z.enum(['P1', 'P2', 'P3', 'P4']);

export const LatSchema = z.number().min(-90).max(90);
export const LngSchema = z.number().min(-180).max(180);

export const PaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof PaginationSchema>;

export const IdempotencyKeySchema = z
  .string()
  .min(8)
  .max(128)
  .regex(/^[a-zA-Z0-9_\-:.]+$/, 'Invalid idempotency key characters');
