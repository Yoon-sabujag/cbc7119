---
phase: 10
slug: legal-inspection
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-03
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification (no test framework configured) |
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

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 3-level navigation | LEGAL-01 | Browser routing | Navigate /legal → /legal/:id → /legal/:id/finding/:fid |
| Photo upload (finding) | LEGAL-02 | R2 + camera | Take photo of finding, verify R2 upload |
| PDF upload (report) | LEGAL-01 | R2 + file picker | Upload PDF report, verify downloadable |
| Resolution flow | LEGAL-02 | Full flow | Mark finding resolved with photo + memo |
| Permission gate | LEGAL-01 | Role-based | Admin can manage, assistant can record |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
