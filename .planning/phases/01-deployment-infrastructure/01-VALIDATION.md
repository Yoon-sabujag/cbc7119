---
phase: 1
slug: deployment-infrastructure
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification (infrastructure phase — no unit tests) |
| **Config file** | none |
| **Quick run command** | `cd cha-bio-safety && npm run build` |
| **Full suite command** | `cd cha-bio-safety && npm run build && wrangler pages deploy dist --dry-run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build` (verify build succeeds)
- **After every plan wave:** Run full build + deployment verification
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | DEPLOY-01 | build | `npm run build` | ✅ | ⬜ pending |
| 01-01-02 | 01 | 1 | DEPLOY-01 | deploy | `wrangler pages deploy dist` | ✅ | ⬜ pending |
| 01-02-01 | 02 | 1 | DEPLOY-02 | manual | Browser check cbc7119.pages.dev | N/A | ⬜ pending |
| 01-03-01 | 03 | 1 | DEPLOY-03 | cli | `wrangler d1 migrations list --remote` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Production login flow | DEPLOY-02 | Requires live Cloudflare environment + real D1 data | Open cbc7119.pages.dev, login with test account, verify dashboard loads |
| Production inspection flow | DEPLOY-02 | Requires live environment | Navigate to inspection, select category, verify checkpoint list loads |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
