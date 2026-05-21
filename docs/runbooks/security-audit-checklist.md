# Security audit checklist (MVP)

Run before pilot and after major releases.

## Auth

- [ ] Magic links expire (`MAGIC_LINK_TTL_MINUTES`)
- [ ] Refresh token rotation + theft path returns 401
- [ ] Institutional email domain enforced
- [ ] RBAC on all mutating routes

## API

- [ ] Rate limits on auth and SOS endpoints
- [ ] Helmet + CORS restricted to known origins
- [ ] Zod validation on all bodies
- [ ] Webhook HMAC when `IVR_ENABLED=true`

## Data

- [ ] Sensitive columns encrypted (phone hashes, not raw E.164 in logs)
- [ ] Audit log on admin actions
- [ ] Retention job scheduled (worker `RetentionProcessor`)

## Realtime

- [ ] WS auth requires valid JWT
- [ ] Room joins scoped to user/dept/incident

## Mobile / web

- [ ] Tokens in secure storage (mobile) / httpOnly preferred for web future
- [ ] No secrets in client bundles

## Compliance

- [ ] Recording consent prompt when `RECORDING_ENABLED=true`
- [ ] Privacy policy linked from SOS and IVR
