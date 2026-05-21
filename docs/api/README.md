# HTTP API

Base path: `/v1`

## Health

- `GET /health` — liveness (no `/v1` prefix)
- `GET /health/ready` — Postgres + Redis checks

## Auth (Phase 1)

- `POST /auth/magic-link/initiate` — email magic link
- `POST /auth/magic-link/complete` — exchange token for JWT pair
- `POST /auth/refresh` — rotating refresh
- `POST /auth/logout`
- `GET /auth/me`

Microsoft OIDC routes exist but return stub until `MS_AUTH_ENABLED=true`.

## Incidents

- `POST /incidents` — create (SOS / manual)
- `GET /incidents` — cursor list with RBAC scope
- `GET /incidents/:id`
- `PATCH /incidents/:id/status`

## WebSocket

Connect with `Authorization: Bearer <access_token>`. Events defined in `@plaksha/shared-events`.

Regenerate OpenAPI (when generator script is wired):

```bash
pnpm --filter @plaksha/api docs:gen
```
