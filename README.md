# Plaksha Universal Campus Helpline

Centralized emergency response platform for Plaksha University. The system unifies department helplines into a single service for incident intake, responder dispatch, escalation, real-time coordination, and audit.

## Overview

The platform supports multiple intake channels (web, mobile SOS, and telephony adapters), role-based access for students, faculty, dispatchers, and responders, and operational tooling for administrators. Backend services use PostgreSQL for persistence, Redis for queues and WebSocket fan-out, and a transactional outbox for reliable event delivery.

## Capabilities

- Magic-link authentication for institutional email (`@plaksha.edu.in`)
- Incident lifecycle management with assignment and status tracking
- Real-time updates via WebSocket (Socket.IO)
- Escalation policies with scheduled background processing
- In-incident chat and multi-channel notifications
- Dispatcher dashboard with live map and incident views
- Mobile SOS and responder workflows (Expo)
- Audit logging and analytics endpoints
- Provider adapters for email, SMS, IVR, and push (configurable per environment)

## Repository structure

| Path | Description |
|------|-------------|
| `apps/api` | NestJS HTTP API and WebSocket gateway |
| `apps/worker` | Background workers (BullMQ): escalation, notifications, retention |
| `apps/web` | Next.js operations dashboard |
| `apps/mobile` | Expo mobile application |
| `packages/shared-*` | Shared types, schemas, events, configuration, utilities |
| `packages/ui-*` | Shared UI components (web and mobile) |
| `infra/` | Database migrations, seed data, Docker Compose, load tests |
| `docs/` | Architecture notes, API reference, operational runbooks |

## Requirements

- Node.js 22 or later
- pnpm 10 or later
- Docker Desktop (PostgreSQL and Redis for local development)

## Local development

```bash
pnpm install
cp .env.example .env
pnpm infra:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

### Service endpoints

| Service | URL |
|---------|-----|
| Web application | http://localhost:3000 |
| API | http://localhost:4000 |
| API documentation (development) | http://localhost:4000/docs |
| PostgreSQL (host) | `localhost:5433` |
| Redis | `localhost:6379` |

The web app proxies API requests through `/api` in development. See `apps/web/.env.local` and `.env.example` for environment variables.

### Authentication in development

Set `EMAIL_PROVIDER=mock` in `.env`. Sign-in links are written to the API process log instead of being sent by email. Use one of the seeded institutional accounts:

| Role | Email |
|------|-------|
| Student | `student@plaksha.edu.in` |
| Dispatcher | `dispatcher@plaksha.edu.in` |
| Security responder | `responder.security@plaksha.edu.in` |
| Administrator | `admin@plaksha.edu.in` |

Additional seed accounts are defined in `infra/seeders/`.

### Common commands

```bash
pnpm build          # Build all packages and applications
pnpm lint           # Lint the monorepo
pnpm typecheck      # Type-check the monorepo
pnpm test           # Run unit tests
pnpm infra:down     # Stop local Docker services
```

## Configuration

Copy `.env.example` to `.env` and adjust values for your environment. Key settings:

- `DATABASE_URL` — PostgreSQL connection string (default port `5433` in Docker Compose)
- `REDIS_URL` — Redis connection string
- `EMAIL_PROVIDER` — `mock` (development) or `resend` (production)
- `IVR_PROVIDER` — `mock`, `twilio`, or `exotel`
- `MS_AUTH_ENABLED` — Enable Microsoft Entra ID when credentials are available

Secrets must not be committed. `.env` is excluded from version control.

## Documentation

- [Architecture](docs/architecture/) — System design and delivery roadmap
- [Runbooks](docs/runbooks/) — Operations, deployment, and security checklists
- [API](docs/api/) — OpenAPI specification (`pnpm --filter @plaksha/api docs:gen`)

## Deployment

Production deployment targets are defined in `render.yaml` (API and worker) and `apps/web/vercel.json` (web). See [Deploy and rollback](docs/runbooks/deploy-rollback.md) for operational guidance.

## License

UNLICENSED — proprietary software of Plaksha University. All rights reserved.
