# Creates 20 backdated commits (IST) from 2026-05-18 16:00 to 2026-05-22 10:00.
# Uses GIT_AUTHOR_DATE / GIT_COMMITTER_DATE only (does not change git config).

$ErrorActionPreference = 'Stop'
Set-Location 'D:\ILGC Project'

function Invoke-Git {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'SilentlyContinue'
    & git @Args
    $code = $LASTEXITCODE
    $ErrorActionPreference = $prev
    if ($code -ne 0) { throw "git $($Args -join ' ') failed with exit $code" }
}

function Invoke-DatedCommit {
    param(
        [string]$DateIso,
        [string]$Message,
        [string[]]$Paths
    )
    if (-not $Paths -or $Paths.Count -eq 0) {
        throw "No paths staged for commit: $Message"
    }
    foreach ($p in $Paths) {
        if (Test-Path $p) {
            Invoke-Git add -- $p
        }
    }
    $staged = @(Invoke-Git diff --cached --name-only)
    if (-not $staged) {
        Write-Warning "Skip empty commit: $Message"
        return
    }
    $env:GIT_AUTHOR_DATE = $DateIso
    $env:GIT_COMMITTER_DATE = $DateIso
    Invoke-Git commit -m $Message
    Remove-Item Env:GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
    Remove-Item Env:GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
    Write-Host "[$DateIso] $Message ($((@($staged)).Count) files)"
}

$start = [DateTimeOffset]::Parse('2026-05-18T16:00:00+05:30')
$end = [DateTimeOffset]::Parse('2026-05-22T10:00:00+05:30')
$spanSec = [int]($end - $start).TotalSeconds
$rng = [System.Random]::new()
$dates = 1..20 | ForEach-Object {
    $start.AddSeconds($rng.Next(0, $spanSec))
} | Sort-Object
$isoDates = $dates | ForEach-Object { $_.ToString('yyyy-MM-ddTHH:mm:ssK') }

$i = 0

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
chore: scaffold plaksha helpline monorepo

Initialize pnpm workspace, Turborepo pipeline, formatting hooks, and project README.
'@ -Paths @(
    'package.json', 'pnpm-workspace.yaml', 'pnpm-lock.yaml', 'turbo.json',
    'README.md', '.gitignore', '.prettierrc.json', '.prettierignore',
    'commitlint.config.cjs', '.husky', '.env.example'
)

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
chore: add shared TypeScript and ESLint config packages

Workspace-wide compiler options and lint presets for Nest, Next, and Expo apps.
'@ -Paths @('packages/tsconfig', 'packages/eslint-config')

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
feat(shared): add domain types and realtime event contracts

Shared TypeScript types and WebSocket room/event names for all apps.
'@ -Paths @('packages/shared-types', 'packages/shared-events')

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
feat(shared): add Zod schemas and utility helpers

API validation schemas plus phone, geo, time, and idempotency utilities.
'@ -Paths @('packages/shared-schemas', 'packages/shared-utils')

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
feat(shared): add environment config loader

Centralized env schema and loader consumed by API and worker processes.
'@ -Paths @('packages/shared-config')

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
feat(ui): add shared web and mobile UI primitives

Reusable button, card, badge, and SOS components for dashboard and Expo apps.
'@ -Paths @('packages/ui-web', 'packages/ui-mobile')

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
infra: add local Docker Compose for Postgres and Redis

Developer stack with Postgres on host port 5433 and Redis for queues and sockets.
'@ -Paths @('infra/docker', 'infra/docker/postgres-init.sql')

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
infra: add core database migrations

Extensions, users, departments, and responder profile tables.
'@ -Paths @(
    'infra/migrations/20260101000000-init-extensions.cjs',
    'infra/migrations/20260101000100-init-users.cjs',
    'infra/migrations/20260101000200-init-departments.cjs',
    'infra/migrations/20260101000300-init-responders.cjs'
)

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
infra: add incident and escalation schema migrations

Incident lifecycle, assignments, escalation policies, and chat tables.
'@ -Paths @(
    'infra/migrations/20260101000400-init-incidents.cjs',
    'infra/migrations/20260101000500-init-escalation.cjs',
    'infra/migrations/20260101000600-init-chat.cjs'
)

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
infra: add notifications, audit, and seed data

Remaining migrations plus department, dev user, and escalation policy seeders.
'@ -Paths @(
    'infra/migrations/20260101000700-init-notifications.cjs',
    'infra/migrations/20260101000800-init-calls.cjs',
    'infra/migrations/20260101000900-init-audit-consent.cjs',
    'infra/migrations/20260101001000-init-flags-outbox.cjs',
    'infra/seeders'
)

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
feat(api): scaffold NestJS app with database layer

API bootstrap, Sequelize models, migrations CLI config, and shared middleware.
'@ -Paths @(
    'apps/api/package.json', 'apps/api/tsconfig.json', 'apps/api/nest-cli.json',
    'apps/api/jest.config.js', 'apps/api/.eslintrc.cjs',
    'apps/api/src/main.ts', 'apps/api/src/env.ts', 'apps/api/src/config',
    'apps/api/src/db', 'apps/api/src/common'
)

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
feat(api): add external provider adapters

Mock-first email, SMS, IVR, push, storage, and Redis adapters for local development.
'@ -Paths @('apps/api/src/adapters')

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
feat(api): implement magic-link auth and org admin APIs

Authentication, users, departments, audit logging, and health endpoints.
'@ -Paths @(
    'apps/api/src/modules/auth',
    'apps/api/src/modules/users',
    'apps/api/src/modules/departments',
    'apps/api/src/modules/audit',
    'apps/api/src/modules/health'
)

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
feat(api): implement incidents, assignments, and responders

Incident lifecycle, dispatcher assignment flows, and responder status APIs.
'@ -Paths @(
    'apps/api/src/modules/incidents',
    'apps/api/src/modules/assignments',
    'apps/api/src/modules/responders'
)

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
feat(api): add escalation engine and transactional outbox

Escalation policies, BullMQ scheduling, and outbox poller for reliable events.
'@ -Paths @(
    'apps/api/src/modules/escalation',
    'apps/api/src/modules/outbox'
)

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
feat(api): add chat, notifications, and realtime gateway

Incident chat threads, multi-channel notifications, and Socket.IO with Redis adapter.
'@ -Paths @(
    'apps/api/src/modules/chat',
    'apps/api/src/modules/notifications',
    'apps/api/src/modules/websocket'
)

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
feat(api): add IVR webhooks, analytics, and feature flags

Twilio-style IVR hooks, reporting endpoints, calls module, and app module wiring.
'@ -Paths @(
    'apps/api/src/modules/webhooks',
    'apps/api/src/modules/calls',
    'apps/api/src/modules/analytics',
    'apps/api/src/modules/feature-flags',
    'apps/api/src/modules/admin',
    'apps/api/src/app.module.ts'
)

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
feat(worker): add BullMQ background processors

Escalation, notification, outbox backstop, and retention workers on Redis.
'@ -Paths @('apps/worker')

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
feat(web): add Next.js dispatch dashboard

Sign-in, live board, incident tables, and API proxy for local development.
'@ -Paths @('apps/web')

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
feat(mobile): add Expo responder and SOS app

Magic-link auth, SOS reporting, offline queue, and responder screens.
'@ -Paths @('apps/mobile')

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
ci: add GitHub Actions pipeline and Dependabot

Lint, typecheck, test with Postgres/Redis services, and production build on main.
'@ -Paths @('.github')

Invoke-DatedCommit -DateIso $isoDates[$i++] -Message @'
docs: add architecture, runbooks, and deployment config

System docs, pilot runbooks, Render blueprint, and k6 load test scaffold.
'@ -Paths @('docs', 'render.yaml', 'infra/k6', 'scripts')

Write-Host ''
Write-Host 'Done. Commit timeline:'
Invoke-Git log --oneline --format='%h %ad %s' --date=format-local:'%Y-%m-%d %H:%M IST'
