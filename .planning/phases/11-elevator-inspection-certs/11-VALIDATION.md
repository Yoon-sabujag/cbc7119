---
phase: 11
slug: elevator-inspection-certs
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-05
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification (no test framework configured) |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npx wrangler pages dev dist --d1 DB=cha-bio-db` |
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
| 11-01-01 | 01 | 1 | ELEV-02 | build + migration | `npm run build` | ❌ W0 | ⬜ pending |
| 11-01-02 | 01 | 1 | ELEV-02 | API smoke | `curl /api/elevators/inspections` | ❌ W0 | ⬜ pending |
| 11-02-01 | 02 | 2 | ELEV-02 | build + render | `npm run build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Migration file `0040_elevator_inspection_certs.sql` — schema validation via D1 apply
- [ ] Build passes with modified ElevatorPage and new API files

*Existing infrastructure covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PDF/image upload to R2 | ELEV-02 | Requires R2 binding + file input | Upload PDF via cert button, verify R2 key |
| In-app PDF viewer | ELEV-02 | Requires visual confirmation | Open cert, verify PDF renders in-app |
| Next inspection date badge | ELEV-02 | Requires date calculation verification | Check badge shows correct date for each elevator type |
| Conditional finding flow | ELEV-02 | Requires multi-step interaction | Register conditional result → add finding → resolve |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
