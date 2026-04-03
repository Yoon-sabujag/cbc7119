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
| **Framework** | Manual verification (no test framework configured in project) |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npx wrangler pages dev dist --d1 DB=cha-bio-safety-db` |
| **Estimated runtime** | ~15 seconds (build) |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | LEGAL-01 | build + migration | `npm run build` | ❌ W0 | ⬜ pending |
| 10-01-02 | 01 | 1 | LEGAL-01 | API smoke | `curl /api/legal/inspections` | ❌ W0 | ⬜ pending |
| 10-01-03 | 01 | 1 | LEGAL-02 | API smoke | `curl /api/legal/:id/findings` | ❌ W0 | ⬜ pending |
| 10-02-01 | 02 | 2 | LEGAL-01 | build + render | `npm run build` | ❌ W0 | ⬜ pending |
| 10-02-02 | 02 | 2 | LEGAL-02 | build + render | `npm run build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Migration file `0038_legal_findings.sql` — schema validation via D1 apply
- [ ] Build passes with new pages and API files

*Existing infrastructure covers framework needs — no new test framework required.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PDF upload to R2 | LEGAL-01 | Requires R2 binding + file input | Upload PDF via BottomSheet, verify R2 key |
| Photo capture + compression | LEGAL-02 | Camera API requires device | Take photo, verify compressed upload |
| Role-based access control | LEGAL-01 | Requires auth context | Login as assistant, verify admin-only actions disabled |
| 지적사항 status transition | LEGAL-02 | Requires multi-step interaction | Create finding → add resolution → mark resolved |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
