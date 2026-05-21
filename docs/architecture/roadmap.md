# Delivery roadmap

## Phase 0 — Foundation (complete in repo)

Turborepo, strict TS, Docker Compose (Postgres 16 + Redis 7), migrations, seeds, CI, Render blueprint.

## Phase 1 — Auth + admin

Magic-link auth, RBAC, departments/users admin, audit on mutations, web sign-in.

## Phase 2 — Incidents + chat

State machine, assignments, chat threads, dispatcher UI.

## Phase 3 — Realtime

Socket.IO + Redis adapter, live board, mobile responder screens.

## Phase 4 — Escalation + notifications

BullMQ escalation engine, multi-channel notification hub (push/SMS/email/WS).

## Phase 5 — SOS + offline

Mobile SOS, offline queue, SMS/dial fallbacks.

## Phase 6 — IVR (gated)

Twilio/Exotel adapters, multilingual IVR tree, call-to-incident linking. **Requires India DLT + provider accounts.**

## Phase 7 — Analytics + hardening

Admin analytics, k6 load scripts, Sentry hooks, retention job, security checklist.

## Phase 8 — Pilot

50 users / 5 responders / 1 dispatcher for two weeks — see [../runbooks/pilot-launch.md](../runbooks/pilot-launch.md).
