---
phase: 04-completion-tracking-daily-reporting
plan: 03
subsystem: api
tags: [dashboard, schedule, check_records, completion, react-query, typescript]

# Dependency graph
requires:
  - phase: 04-completion-tracking-daily-reporting
    provides: "schedule_items table with inspection_category, check_records + check_points tables"
provides:
  - "Per-schedule completion detection via check_records JOIN check_points with D-20 date-range attribution"
  - "DashboardScheduleItem type with completed boolean"
  - "Dashboard visual completion indicators (green tint + checkmark + StatusBadge override)"
  - "Non-inspect item manual completion via PATCH /api/schedule/:id"
affects: [daily-report, schedule-page, inspection-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "D-20 date-range attribution: next same-category schedule subquery determines attribution window for multi-day inspections"
    - "Async Promise.all mapping in Pages Function for per-item DB lookups"
    - "CATEGORY_ALIAS map reuse: inspection_category -> checkpoint category mapping"

key-files:
  created: []
  modified:
    - "cha-bio-safety/functions/api/dashboard/stats.ts"
    - "cha-bio-safety/src/pages/DashboardPage.tsx"
    - "cha-bio-safety/src/types/index.ts"
    - "cha-bio-safety/src/utils/api.ts"

key-decisions:
  - "DashboardScheduleItem added as separate type (not modifying ScheduleItem) to avoid breaking other consumers"
  - "scheduleApi.updateStatus (PATCH) used for manual completion - matches existing endpoint in [id].ts"
  - "D-20 date range: open-ended when no next schedule exists (checks records from schedule date onward)"

patterns-established:
  - "Completion check: inspect items use check_records JOIN check_points, non-inspect use status='done'"
  - "Date-range attribution: schedule date to next same-category schedule date (subquery per item)"

requirements-completed: [LINK-01, LINK-02]

# Metrics
duration: 3min
completed: 2026-03-30
---

# Phase 4 Plan 3: Completion Tracking & Daily Reporting Summary

**Dashboard inspection completion auto-linked to check_records via D-20 date-range JOIN, with green tint + checkmark indicators and non-inspect manual completion button**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-30T07:09:27Z
- **Completed:** 2026-03-30T07:12:49Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- stats.ts computes per-schedule `completed` boolean: inspect items JOIN check_records+check_points using D-20 date-range subquery (schedule date to next same-category schedule date); non-inspect items use `status === 'done'`
- `DashboardScheduleItem` type added to `src/types/index.ts` with `completed: boolean` field
- Dashboard `ScheduleRow` shows green background tint `rgba(34,197,94,.08)`, checkmark SVG, and `StatusBadge status='done'` override for completed items
- Non-inspect incomplete items show a `완료 처리` button that triggers PATCH to `/api/schedule/:id` and invalidates the dashboard query

## Task Commits

Each task was committed atomically:

1. **Task 1: stats.ts completion JOIN with date-range logic + types update** - `e86166b` (feat)
2. **Task 2: Dashboard UI completion indicators** - `227746e` (feat)

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified

- `cha-bio-safety/functions/api/dashboard/stats.ts` — Added inspection_category/memo to schedRows query; added async Promise.all with per-schedule D-20 date-range completion logic using CATEGORY_ALIAS; todaySchedule response now includes `completed` field
- `cha-bio-safety/src/types/index.ts` — Added `DashboardScheduleItem` interface with `completed: boolean`
- `cha-bio-safety/src/pages/DashboardPage.tsx` — Updated ScheduleRow to use DashboardScheduleItem; added green tint background, checkmark SVG, StatusBadge override, manual completion button; added handleManualComplete with confirm dialog and toast notifications
- `cha-bio-safety/src/utils/api.ts` — Updated dashboardApi.getStats return type to use `DashboardScheduleItem[]` for todaySchedule

## Decisions Made

- Used `DashboardScheduleItem` as a new separate type instead of extending `ScheduleItem` — avoids breaking SchedulePage and other callers of the existing type
- Used `scheduleApi.updateStatus` (PATCH) for manual completion — the `[id].ts` handler already supports PATCH for status updates
- D-20 open-ended range: when no next schedule exists, the query uses `date(cr.checked_at) >= ?` without upper bound — ensures multi-day inspections at end of month are still captured

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Updated dashboardApi return type in api.ts**
- **Found during:** Task 2 (Dashboard UI completion indicators)
- **Issue:** `dashboardApi.getStats` still declared `todaySchedule: ScheduleItem[]` — TypeScript would complain when consuming `completed` field from the response
- **Fix:** Updated the return type annotation to `DashboardScheduleItem[]`
- **Files modified:** `cha-bio-safety/src/utils/api.ts`
- **Verification:** `npm run build` succeeds with no type errors
- **Committed in:** 227746e (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical type annotation)
**Impact on plan:** Necessary for TypeScript correctness. No scope creep.

## Issues Encountered

None — plan executed cleanly.

## Known Stubs

- `streakDays: 0` in stats.ts (pre-existing `// TODO: 연속 달성일 계산`) — out of scope for this plan, does not affect completion tracking functionality

## Next Phase Readiness

- LINK-01 and LINK-02 fully implemented: schedule-to-inspection linkage is live, dashboard shows completion state
- Phase 4 Plan 3 (final plan) is complete — Phase 4 overall completion pending daily-report plans (04-01, 04-02)
- No blockers for subsequent plans

## Self-Check: PASSED

- FOUND: cha-bio-safety/functions/api/dashboard/stats.ts
- FOUND: cha-bio-safety/src/pages/DashboardPage.tsx
- FOUND: cha-bio-safety/src/types/index.ts
- FOUND: .planning/phases/04-completion-tracking-daily-reporting/04-03-SUMMARY.md
- FOUND: commit e86166b (task 1)
- FOUND: commit 227746e (task 2)

---
*Phase: 04-completion-tracking-daily-reporting*
*Completed: 2026-03-30*
