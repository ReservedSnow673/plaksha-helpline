# On-call (MVP)

## Severity

- **P1** — API down, SOS cannot create incidents, WS fanout stalled > 2 min
- **P2** — Escalation backlog, SMS/push provider errors > 5% for 10 min
- **P3** — Single-user auth issues, non-critical UI bugs

## First response

1. Check `GET /health/ready` and Render logs.
2. Check Redis connectivity (Upstash dashboard) and Postgres (Neon).
3. If queue lag: inspect Bull Board at `/admin/queues` (super-admin only).

## Provider outage

- **Twilio/Exotel down**: set banner on dashboard; SOS still creates incidents; SMS fallback may fail — document in status page.
- **Resend down**: magic links fail; switch to `EMAIL_PROVIDER=mock` only in dev — prod requires Resend recovery.

## Contacts

Maintain `docs/runbooks/contacts.local.md` (gitignored) with campus security lead and Plaksha IT admin.
