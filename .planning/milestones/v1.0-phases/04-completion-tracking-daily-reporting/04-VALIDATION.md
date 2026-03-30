---
phase: 4
slug: completion-tracking-daily-reporting
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-30
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification (no automated test framework configured) |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run dev:api` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run dev:api`
- **Before `/gsd:verify-work`:** Full build must succeed
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | LINK-01 | build | `npm run build` | ✅ | ⬜ pending |
| 04-01-02 | 01 | 1 | LINK-02 | build | `npm run build` | ✅ | ⬜ pending |
| 04-02-01 | 02 | 2 | EXCEL-06 | build | `npm run build` | ✅ | ⬜ pending |
| 04-02-02 | 02 | 2 | EXCEL-06 | manual | Excel download + cell check | ❌ manual | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `public/templates/daily_report_template.xlsx` — extracted from reference xlsx Sheet1
- [ ] `migrations/0029_add_daily_notes.sql` — daily_notes table for special notes
- [ ] Verify `inspection_category` column exists in production D1

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Daily report Excel downloads with correct cell data | EXCEL-06 | Excel file content cannot be verified via CLI | Open downloaded xlsx, check date/shift/schedule cells match expected data |
| Dashboard schedule completion badge updates | LINK-02 | Visual UI verification | Login, complete a checkpoint, refresh dashboard, verify status change |
| Monthly cumulative file has correct sheet count | EXCEL-06 | Multi-sheet xlsx verification | Download monthly file, count sheets match days-up-to-today |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
