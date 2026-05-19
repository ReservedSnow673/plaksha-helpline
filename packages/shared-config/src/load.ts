import { ConfigSchema, type AppConfig } from './schema';

let cached: AppConfig | null = null;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  if (cached) return cached;

  const parsed = ConfigSchema.safeParse({
    nodeEnv: env.NODE_ENV,
    logLevel: env.LOG_LEVEL,
    appBaseUrl: env.APP_BASE_URL,
    webBaseUrl: env.WEB_BASE_URL,
    apiBaseUrl: env.API_BASE_URL,
    wsBaseUrl: env.WS_BASE_URL,
    allowedInstitutionalDomain: env.ALLOWED_INSTITUTIONAL_DOMAIN,
    corsAllowedOrigins: env.CORS_ALLOWED_ORIGINS ?? '',
    database: {
      url: env.DATABASE_URL,
      ssl: env.DATABASE_SSL,
      poolMax: env.DATABASE_POOL_MAX,
      poolMin: env.DATABASE_POOL_MIN,
    },
    redis: {
      url: env.REDIS_URL,
    },
    crypto: {
      jwtAccessSecret: env.JWT_ACCESS_SECRET,
      jwtRefreshSecret: env.JWT_REFRESH_SECRET,
      encryptionKey: env.ENCRYPTION_KEY,
      magicLinkPepper: env.MAGIC_LINK_PEPPER,
      webhookSharedSecret: env.WEBHOOK_SHARED_SECRET,
    },
    tokens: {
      accessTtlSeconds: env.JWT_ACCESS_TTL_SECONDS,
      refreshTtlSeconds: env.JWT_REFRESH_TTL_SECONDS,
      magicLinkTtlMinutes: env.MAGIC_LINK_TTL_MINUTES,
    },
    email: {
      provider: env.EMAIL_PROVIDER,
      resendApiKey: env.RESEND_API_KEY,
      resendFrom: env.RESEND_FROM,
    },
    push: {
      expoAccessToken: env.EXPO_ACCESS_TOKEN,
    },
    msAuth: {
      enabled: env.MS_AUTH_ENABLED,
      tenantId: env.MS_TENANT_ID,
      clientId: env.MS_CLIENT_ID,
      clientSecret: env.MS_CLIENT_SECRET,
      redirectUri: env.MS_REDIRECT_URI,
    },
    ivr: {
      provider: env.IVR_PROVIDER,
      enabled: env.IVR_ENABLED,
      recordingEnabled: env.RECORDING_ENABLED,
      recordingConsentRequired: env.RECORDING_CONSENT_REQUIRED,
      twilioAccountSid: env.TWILIO_ACCOUNT_SID,
      twilioAuthToken: env.TWILIO_AUTH_TOKEN,
      twilioPhoneNumber: env.TWILIO_PHONE_NUMBER,
      twilioWebhookSigningKey: env.TWILIO_WEBHOOK_SIGNING_KEY,
      exotelSid: env.EXOTEL_SID,
      exotelApiKey: env.EXOTEL_API_KEY,
      exotelApiToken: env.EXOTEL_API_TOKEN,
      exotelNumber: env.EXOTEL_NUMBER,
    },
    storage: {
      provider: env.STORAGE_PROVIDER,
      r2AccountId: env.R2_ACCOUNT_ID,
      r2AccessKeyId: env.R2_ACCESS_KEY_ID,
      r2SecretAccessKey: env.R2_SECRET_ACCESS_KEY,
      r2Bucket: env.R2_BUCKET,
    },
    observability: {
      sentryDsn: env.SENTRY_DSN,
      logtailToken: env.LOGTAIL_TOKEN,
    },
    ops: {
      escalationTimerMultiplier: env.ESCALATION_TIMER_MULTIPLIER,
      rateLimitAuthPerMin: env.RATE_LIMIT_AUTH_PER_MIN,
      rateLimitSosPerMin: env.RATE_LIMIT_SOS_PER_MIN,
      rateLimitDefaultPerMin: env.RATE_LIMIT_DEFAULT_PER_MIN,
      retentionIncidentsDays: env.RETENTION_INCIDENTS_DAYS,
      retentionChatDays: env.RETENTION_CHAT_DAYS,
      retentionAuditDays: env.RETENTION_AUDIT_DAYS,
    },
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  cached = parsed.data;
  return cached;
}

export function resetConfigCache(): void {
  cached = null;
}
