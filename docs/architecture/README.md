# Plaksha Universal Campus Helpline — Architecture

Production MVP for centralized emergency intake, responder dispatch, escalation, and auditability on campus.

## System map

- **apps/api** — NestJS REST + Socket.IO gateway, provider webhooks, outbox poller
- **apps/worker** — BullMQ consumers (escalation, notifications, retention)
- **apps/web** — Next.js dispatcher/admin dashboard (Vercel)
- **apps/mobile** — Expo SOS + responder flows
- **packages/shared-*** — Types, Zod schemas, WS events, config loader
- **infra/** — Sequelize migrations, seeds, Docker Compose, k6 scripts

## Phase 1 without external creds

| Capability | Default | Flip when creds arrive |
|------------|---------|------------------------|
| Auth | Magic link (`EMAIL_PROVIDER=mock` logs link) | `MS_AUTH_ENABLED=true` + Entra app |
| IVR / SMS | `IVR_PROVIDER=mock` | `twilio` or `exotel` |
| Push | Expo (token optional) | `EXPO_ACCESS_TOKEN` |
| Email | Resend or mock | `RESEND_API_KEY` |

## Data model highlights

- **incidents** — denormalized `status` + append-only **incident_events**
- **event_outbox** — transactional outbox → Redis pub/sub → Socket.IO rooms
- **escalation_*** — policies, levels, scheduled BullMQ jobs, **escalation_runs** ledger
- **audit_logs** — immutable admin/security trail

See [roadmap.md](./roadmap.md) and [links.md](./links.md).
