# Plaksha Universal Campus Helpline

Production-grade emergency response platform for Plaksha University: unifies fragmented department helplines into a single coordinated infrastructure with mobile SOS, IVR routing, realtime responder dispatch, escalation engine, and auditable incident lifecycle.

## Architecture

See [`docs/architecture/`](docs/architecture/) for the full system design. Quick map:

- `apps/api` — NestJS HTTP + WebSocket server
- `apps/worker` — NestJS standalone worker (BullMQ consumers, escalation engine, notification fanout)
- `apps/web` — Next.js 15 App Router dashboard (dispatchers, admins, analytics)
- `apps/mobile` — Expo SDK 52 + Expo Router (students, faculty, responders)
- `packages/shared-*` — Cross-cutting contracts (types, schemas, events, config, utils)
- `packages/ui-*` — Component libraries (web via shadcn/ui, mobile via NativeWind)
- `infra/` — Migrations, seeds, docker-compose, k6 scripts, Render blueprint

## Prerequisites

- Node.js >= 22
- pnpm >= 10
- Docker Desktop (for local Postgres + Redis)

## Quickstart

```bash
pnpm install
cp .env.example .env
pnpm infra:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Apps will be available at:

- API: <http://localhost:4000>
- Web: <http://localhost:3000>
- Mobile: scan the Expo QR from the terminal
- API docs (dev): <http://localhost:4000/docs>

With `EMAIL_PROVIDER=mock`, magic-link URLs are printed in the API process logs. Use an `@plaksha.edu.in` address from seeds:

| Role | Email |
|------|-------|
| Student | `student@plaksha.edu.in` |
| Dispatcher | `dispatcher@plaksha.edu.in` |
| Security responder | `responder.security@plaksha.edu.in` |
| Admin | `admin@plaksha.edu.in` |

Start Docker Desktop before `pnpm infra:up`. If containers fail to connect, ensure the Docker engine is running.

## Phased Build

The MVP ships in eight phases (see [`docs/architecture/roadmap.md`](docs/architecture/roadmap.md)). Phase 1 magic-link auth + Phase 5 mobile SOS are production-functional without Microsoft Entra or Twilio credentials. Phase 2 OIDC and Phase 6 IVR are adapter-pattern swap-ins gated by `MS_AUTH_ENABLED` and `IVR_PROVIDER` env vars.

## Documentation

- [`docs/architecture/`](docs/architecture/) — System design, ADRs, links
- [`docs/runbooks/`](docs/runbooks/) — On-call procedures, incident response, deploy/rollback
- [`docs/api/`](docs/api/) — OpenAPI spec output (regenerated via `pnpm --filter @plaksha/api docs:gen`)

## License

UNLICENSED — internal Plaksha University property.
