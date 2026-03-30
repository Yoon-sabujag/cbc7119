---
phase: 03-excel-reports-annual-matrix-types
plan: 02
subsystem: ui-reports-page
tags: [react, reports, excel-download, matrix, pump]
dependency_graph:
  requires: [generateMatrixExcel, generatePumpExcel]
  provides: [ReportsPage-10-cards, pump-month-selector]
  affects: [src/pages/ReportsPage.tsx]
tech_stack:
  added: []
  patterns: [report-card-list, matrix-config-map, month-selector-ui]
key_files:
  created: []
  modified:
    - cha-bio-safety/src/pages/ReportsPage.tsx
decisions:
  - "MATRIX_CONFIG lookup map used to dispatch matrix types: avoids duplicating API call and generator call logic for each of the 4 types"
  - "Month selector renders only inside 소방펌프 card: conditional rendering within the REPORT_CARDS.map loop"
  - "handleDownload uses type-in-MATRIX_CONFIG guard before pump branch: correct dispatch order preserves existing check-monthly fallback for old types"
metrics:
  duration: "2 min"
  completed: "2026-03-28"
  tasks_completed: 1
  files_modified: 1
---

# Phase 3 Plan 2: Extend ReportsPage with 5 New Report Cards Summary

ReportsPage.tsx extended from 5 to 10 report cards: added 피난방화시설/방화셔터/제연설비/자동화재탐지설비 via `generateMatrixExcel` and 소방펌프 via `generatePumpExcel`, with inline month selector for the pump card.

---

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Extend ReportsPage with 5 new report cards | 274e279 | src/pages/ReportsPage.tsx |

---

## What Was Built

### ReportsPage.tsx — 10 report cards

- **ReportType union** extended: added `'피난방화' | '방화셔터' | '제연' | '자탐' | '소방펌프'`
- **REPORT_CARDS array** now has 10 entries (5 existing + 5 new)
- **MATRIX_CONFIG** lookup map: maps each matrix type to `{ category, sheetIndex, itemCount, name }` per plan spec
- **handleDownload** updated with two new branches:
  - `type in MATRIX_CONFIG` → fetches `/reports/check-monthly?year=Y&category=C` → calls `generateMatrixExcel(year, data, sheetIndex, itemCount, name)`
  - `type === '소방펌프'` → fetches `/reports/check-monthly?year=Y&category=소방펌프` → calls `generatePumpExcel(year, month, data)`
- **Month state** (`month`, `setMonth`) added for pump report
- **소방펌프 card** has inline month selector (‹/› arrows, same navBtn style as year selector)
- Subtitle for 소방펌프 card shows both year and month: `{year}년도 {month}월`

### Verification (Task 1)

```
npx tsc --noEmit → clean (no output) ✓
npm run build → built in 5.53s ✓
```

---

## Task 2: Checkpoint — Awaiting Human Verification

Task 2 is a `checkpoint:human-verify` gate. Human must verify all 5 new Excel downloads work correctly.

**Steps to verify:**
1. Start dev server: `cd cha-bio-safety && npm run dev` (and `npm run dev:api` in another terminal)
2. Navigate to `/report` page
3. Verify 10 report cards visible (5 existing + 5 new)
4. For each new report type, click download:
   - 피난방화시설 — yearly xlsx, E3=year, ○ marks in month columns
   - 방화셔터 — same structure, correct sheet title
   - 제연설비 — same structure
   - 자동화재탐지설비 — 10 item rows (row 29 also has data)
   - 소방펌프 — select month first, download, D3=year G3=month, I/AJ columns have ○
5. No Excel "repair" dialogs when opening files
6. Korean text displays correctly
7. Months with no records show blank cells

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Known Stubs

None. All 10 report types are wired to real API endpoints and generator functions. No hardcoded data or placeholders.

---

## Self-Check: PASSED

- FOUND: cha-bio-safety/src/pages/ReportsPage.tsx (modified, 140 lines)
- FOUND commit: 274e279 (Task 1)
- TypeScript: clean
- Build: success (5.53s)
