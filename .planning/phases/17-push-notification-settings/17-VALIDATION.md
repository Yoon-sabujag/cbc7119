---
phase: 17
slug: push-notification-settings
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-07
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual + curl/CLI verification (no test framework in project) |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run deploy -- --branch production` |
| **Estimated runtime** | ~30 seconds (build), ~60 seconds (deploy) |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run full deploy + manual verification
- **Before `/gsd-verify-work`:** Full deploy + all manual verifications green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 17-01-01 | 01 | 1 | NOTI-01 | build | `npm run build` | ⬜ pending |
| 17-01-02 | 01 | 1 | NOTI-01 | build | `npm run build` | ⬜ pending |
| 17-01-03 | 01 | 1 | NOTI-02/03 | build | `npm run build` | ⬜ pending |
| 17-02-01 | 02 | 2 | NOTI-01 | manual | deploy + test | ⬜ pending |
| 17-02-02 | 02 | 2 | NOTI-02/03 | manual | deploy + test | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework installation needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Push subscription flow | NOTI-01 | Requires browser Notification.requestPermission() | 1. Open settings 2. Toggle ON 3. Accept permission 4. Verify subscription saved in D1 |
| Push notification delivery | NOTI-02/03 | Requires Cron trigger + real push endpoint | 1. Trigger cron manually via wrangler 2. Check push received on device |
| Permission denied state | NOTI-01 | Requires browser permission block | 1. Block notifications in browser 2. Open settings 3. Verify toggles disabled |
| Notification preferences toggle | NOTI-02/03 | Requires E2E flow | 1. Subscribe 2. Toggle off specific type 3. Trigger cron 4. Verify only enabled types sent |

---

## Validation Sign-Off

- [ ] All tasks have build verify or manual verification
- [ ] Sampling continuity: build check after every task
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
