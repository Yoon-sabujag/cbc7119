---
phase: 11-elevator-inspection-certs
plan: "03"
subsystem: elevator
tags: [elevator, dashboard, inspection, warning-badges]
dependency_graph:
  requires: ["11-01"]
  provides: ["ElevatorPage list tab D-day badges", "dashboard elevInspDueSoon count"]
  affects: ["ElevatorPage.tsx", "DashboardPage.tsx", "dashboard/stats.ts", "types/index.ts"]
tech_stack:
  added: []
  patterns: ["useMemo for derived map", "date-fns addMonths/differenceInDays in Worker"]
key_files:
  created: []
  modified:
    - cha-bio-safety/src/pages/ElevatorPage.tsx
    - cha-bio-safety/src/types/index.ts
    - cha-bio-safety/functions/api/dashboard/stats.ts
    - cha-bio-safety/src/pages/DashboardPage.tsx
decisions:
  - "elevInspDueSoon counts no_record elevators as due (conservative approach per D-14)"
  - "Badge placed below 오늘 현황 grid as a row, not inside the 승강기 고장 tile (tile uses .map() on static array)"
metrics:
  duration_minutes: 30
  completed_date: "2026-04-04"
  tasks_completed: 2
  files_modified: 4
---

# Phase 11 Plan 03: Elevator Inspection Warning Badges Summary

**One-liner:** Next-inspection D-day warning badges on ElevatorPage list tab + elevInspDueSoon count badge on dashboard stats.

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | ElevatorPage list tab warning badges | d4e8f96 | ElevatorPage.tsx |
| 2 | Dashboard stats API + DashboardPage warning badge | 2d91446 | types/index.ts, stats.ts, DashboardPage.tsx |

---

## What Was Built

### Task 1: ElevatorPage list tab warning badges

Added `nextInspQuery` (React Query) at component level using `elevatorInspectionApi.getNextInspection()`. Built a `nextInspMap` via `useMemo` for O(1) lookup by `elevatorId`. Each elevator card in the list tab now renders:
- Orange **D-NN** badge when `status === 'due_soon'` (within 30 days)
- Red **검사 초과** badge when `status === 'overdue'`
- Blue **기록 없음** badge when `status === 'no_record'`

The status badge and inspection warning badges are stacked in a column on the right side of the card.

### Task 2: Dashboard stats API + DashboardPage warning badge

Updated `DashboardStats` interface to include `elevInspDueSoon: number`. In `dashboard/stats.ts`, added a SQL query that fetches `MAX(inspect_date)` grouped by elevator, then computes next inspection date in JS using the same `getCycleMonths` logic as `next-inspection.ts`. Elevators with no inspection record are counted conservatively as due.

Added an orange **검사도래 N** badge below the 오늘 현황 4-tile grid on DashboardPage, visible when `elevInspDueSoon > 0`.

---

## Deviations from Plan

### Auto-adjusted: Badge placement in DashboardPage

The plan suggested placing the badge near the `elevatorFault` counter inside the tile. The 4 stat tiles are rendered via `.map()` on a static array, making it impractical to inject JSX only into the 4th tile. Instead, the badge is rendered as a separate row below the grid — functionally equivalent and visually cleaner.

**Rule:** Rule 1 (auto-fix) — adjusted approach to match code structure.

---

## Known Stubs

None. All data is live from the `/api/elevators/next-inspection` and `/api/dashboard/stats` endpoints.

---

## Self-Check: PASSED

Files verified:
- `cha-bio-safety/src/pages/ElevatorPage.tsx` — FOUND
- `cha-bio-safety/src/types/index.ts` — FOUND
- `cha-bio-safety/functions/api/dashboard/stats.ts` — FOUND
- `cha-bio-safety/src/pages/DashboardPage.tsx` — FOUND

Commits verified:
- d4e8f96 — FOUND (feat(11-03): add next-inspection warning badges to ElevatorPage list tab)
- 2d91446 — FOUND (feat(11-03): add elevInspDueSoon to dashboard stats and DashboardPage)
