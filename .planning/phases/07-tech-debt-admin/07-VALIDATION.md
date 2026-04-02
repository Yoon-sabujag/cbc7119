---
phase: 7
slug: tech-debt-admin
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-02
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification (no test framework configured in project) |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run dev:api` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run dev:api`
- **Before `/gsd:verify-work`:** Full build must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | TECH-01 | build | `npm run build` | ✅ | ⬜ pending |
| 07-02-01 | 02 | 2 | ADMIN-01 | build+api | `npm run build` | ✅ | ⬜ pending |
| 07-02-02 | 02 | 2 | ADMIN-02 | build+api | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin role-guard redirect | ADMIN-01 | Browser-only route guard | Login as assistant, navigate to /admin, verify redirect to /dashboard |
| Staff CRUD operations | ADMIN-01 | Requires D1 database | Use wrangler dev, add/edit/deactivate staff via admin UI |
| Checkpoint CRUD operations | ADMIN-02 | Requires D1 database | Use wrangler dev, add/edit/deactivate checkpoints via admin UI |
| Dynamic staff name loading | TECH-01 | Requires D1 database | Verify dashboard shows staff names from DB, not hardcoded |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
