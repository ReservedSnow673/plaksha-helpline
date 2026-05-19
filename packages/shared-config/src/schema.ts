import { z } from 'zod';

const boolean = z
  .union([z.boolean(), z.string()])
  .transform((v) => (typeof v === 'boolean' ? v : v.toLowerCase() === 'true'));

const number = z.union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/)]).transform(Number);

const hex64 = z
  .string()
  .min(32, 'Must be at least 32 chars')
  .max(128, 'Must be at most 128 chars');

const url = z.string().url();

export const ConfigSchema = z.object({
  // Runtime
  nodeEnv: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // URLs
  appBaseUrl: url,
  webBaseUrl: url,
  apiBaseUrl: url,
  wsBaseUrl: z.string().regex(/^wss?:\/\//),

  // Institutional
  allowedInstitutionalDomain: z.string().min(3),
  corsAllowedOrigins: z
    .string()
    .transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean)),

  // Database
  database: z.object({
    url: z.string().min(10),
    ssl: z.enum(['require', 'disable', 'allow', 'prefer', 'verify-full']).default('disable'),
    poolMax: number.default(20),
    poolMin: number.default(2),
  }),

  // Redis
  redis: z.object({
    url: z.string().min(10),
  }),

  // Crypto
  crypto: z.object({
    jwtAccessSecret: hex64,
    jwtRefreshSecret: hex64,
    encryptionKey: hex64,
    magicLinkPepper: hex64,
    webhookSharedSecret: hex64,
  }),

  // Tokens
  tokens: z.object({
    accessTtlSeconds: number.default(900),
    refreshTtlSeconds: number.default(2592000),
    magicLinkTtlMinutes: number.default(15),
  }),

  // Email
  email: z.object({
    provider: z.enum(['mock', 'resend']).default('mock'),
    resendApiKey: z.string().optional(),
    resendFrom: z.string().default('Plaksha Helpline <helpline@plaksha.edu.in>'),
  }),

  // Push
  push: z.object({
    expoAccessToken: z.string().optional(),
  }),

  // Microsoft Entra (Phase 2)
  msAuth: z.object({
    enabled: boolean.default(false),
    tenantId: z.string().optional(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    redirectUri: z.string().optional(),
  }),

  // IVR
  ivr: z.object({
    provider: z.enum(['mock', 'twilio', 'exotel']).default('mock'),
    enabled: boolean.default(false),
    recordingEnabled: boolean.default(false),
    recordingConsentRequired: boolean.default(true),
    twilioAccountSid: z.string().optional(),
    twilioAuthToken: z.string().optional(),
    twilioPhoneNumber: z.string().optional(),
    twilioWebhookSigningKey: z.string().optional(),
    exotelSid: z.string().optional(),
    exotelApiKey: z.string().optional(),
    exotelApiToken: z.string().optional(),
    exotelNumber: z.string().optional(),
  }),

  // Storage
  storage: z.object({
    provider: z.enum(['mock', 'r2', 's3']).default('mock'),
    r2AccountId: z.string().optional(),
    r2AccessKeyId: z.string().optional(),
    r2SecretAccessKey: z.string().optional(),
    r2Bucket: z.string().optional(),
  }),

  // Observability
  observability: z.object({
    sentryDsn: z.string().optional(),
    logtailToken: z.string().optional(),
  }),

  // Operational
  ops: z.object({
    escalationTimerMultiplier: number.default(1.0),
    rateLimitAuthPerMin: number.default(5),
    rateLimitSosPerMin: number.default(3),
    rateLimitDefaultPerMin: number.default(60),
    retentionIncidentsDays: number.default(365),
    retentionChatDays: number.default(90),
    retentionAuditDays: number.default(730),
  }),
});

export type AppConfig = z.infer<typeof ConfigSchema>;
