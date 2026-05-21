# Deploy and rollback

## Staging

1. Merge to `main` — GitHub Actions runs lint, typecheck, test, build.
2. Render auto-deploys `plaksha-api` and `plaksha-worker` from blueprint.
3. Vercel preview/production for `apps/web` links to staging API URL.

## Production promotion

1. Confirm migrations: `pnpm db:migrate` against production `DATABASE_URL` (from secure runner).
2. Promote Vercel deployment; set `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_WS_BASE_URL`.
3. Watch `/health/ready` and Better Stack / Sentry for 15 minutes.

## Rollback

1. **Web**: Vercel instant rollback to previous deployment.
2. **API/worker**: Render rollback to previous deploy; if migration was destructive, restore Neon PITR instead of re-running old code on new schema.
3. **Redis**: no rollback needed; queues are ephemeral.

## Secrets rotation

Rotate `JWT_*`, `ENCRYPTION_KEY`, and `WEBHOOK_SHARED_SECRET` in Render/Vercel together; force logout via session table truncate only if theft suspected.
