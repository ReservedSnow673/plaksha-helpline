/** Nest injection token for worker-scoped AppConfig (avoids circular imports). */
export const WORKER_CONFIG = Symbol('WORKER_CONFIG');

/** BullMQ queue names — must match producers in apps/api. */
export const WORKER_QUEUES = {
  ESCALATION: 'escalation',
  NOTIFICATION: 'notifications',
} as const;

export const WORKER_CONCURRENCY = {
  ESCALATION: 5,
  NOTIFICATION: 10,
} as const;

/** Outbox backstop poller tuning (API runs the primary poller). */
export const OUTBOX_TICK_MS = 2_000;
export const OUTBOX_BATCH_SIZE = 50;
export const OUTBOX_BACKSTOP_LAG_SECONDS = 30;
