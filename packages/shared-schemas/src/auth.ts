import { z } from 'zod';

import { EmailSchema } from './primitives';

export const MagicLinkInitiateSchema = z.object({
  email: EmailSchema,
  deviceId: z.string().max(128).optional(),
  platform: z.enum(['IOS', 'ANDROID', 'WEB']).optional(),
});
export type MagicLinkInitiateInput = z.infer<typeof MagicLinkInitiateSchema>;

export const MagicLinkCompleteSchema = z.object({
  token: z.string().min(32).max(256),
  deviceId: z.string().max(128).optional(),
  platform: z.enum(['IOS', 'ANDROID', 'WEB']).optional(),
  appVersion: z.string().max(32).optional(),
});
export type MagicLinkCompleteInput = z.infer<typeof MagicLinkCompleteSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(32).max(256),
});
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;

export const OidcCallbackSchema = z.object({
  code: z.string().min(8),
  state: z.string().min(8),
});
export type OidcCallbackInput = z.infer<typeof OidcCallbackSchema>;

export const RegisterDeviceSchema = z.object({
  expoPushToken: z.string().min(16).max(256),
  deviceId: z.string().min(8).max(128),
  platform: z.enum(['IOS', 'ANDROID']),
  appVersion: z.string().max(32),
  locale: z.string().max(16).default('en'),
});
export type RegisterDeviceInput = z.infer<typeof RegisterDeviceSchema>;
