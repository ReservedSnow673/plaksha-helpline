# Soft-launch pilot (Phase 8)

## Cohort

- 50 campus users (students/faculty mix)
- 5 responders (security + medical)
- 1 dispatcher (admin staff)

## Duration

Two weeks observation with daily 15-minute standup.

## Success metrics

| Metric | Target |
|--------|--------|
| SOS → ACK median | < 60s (campus Wi-Fi) |
| False alarm rate | < 10% of incidents |
| WS reconnect success | > 95% after app background |
| Critical bugs | 0 open P1 at end of week 2 |

## Runbook

1. Seed pilot users via `infra/seeds` or admin UI role assignment.
2. Train responders: on-duty toggle, accept/reject, ETA, maps handoff.
3. Train dispatcher: live board, force-escalate, audit tab.
4. Collect feedback form (Google Form or internal) — tag by module.
5. Week 2: review analytics tab; tune escalation timers via `ESCALATION_TIMER_MULTIPLIER`.

## Exit criteria for general rollout

- All P1/P2 issues closed or accepted with mitigation
- Microsoft Entra or continued magic-link policy signed off
- IVR provider path chosen (or explicit “app-only” launch)
