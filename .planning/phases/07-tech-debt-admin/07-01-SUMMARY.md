---
phase: 07-tech-debt-admin
plan: 01
subsystem: backend-api, frontend-hooks, routing
tags: [staff-api, check-points-api, tech-debt, hardcoding-removal, routing]
dependency_graph:
  requires: []
  provides: [staff-crud-api, checkpoint-crud-api, useStaffList-hook, admin-route]
  affects: [DashboardPage, SideMenu, WorkShiftPage, DailyReportPage, generateExcel]
tech_stack:
  added: []
  patterns: [React-Query-hook-for-staff, role-based-menu-filtering, optional-staffData-injection]
key_files:
  created:
    - cha-bio-safety/migrations/0034_staff_fields.sql
    - cha-bio-safety/functions/api/staff/index.ts
    - cha-bio-safety/functions/api/staff/[id].ts
    - cha-bio-safety/functions/api/staff/[id]/reset-password.ts
    - cha-bio-safety/functions/api/check-points/index.ts
    - cha-bio-safety/functions/api/check-points/[id].ts
    - cha-bio-safety/src/hooks/useStaffList.ts
    - cha-bio-safety/src/pages/AdminPage.tsx
  modified:
    - cha-bio-safety/src/utils/api.ts
    - cha-bio-safety/src/types/index.ts
    - cha-bio-safety/src/pages/DashboardPage.tsx
    - cha-bio-safety/src/utils/shiftCalc.ts
    - cha-bio-safety/src/components/SideMenu.tsx
    - cha-bio-safety/src/pages/WorkShiftPage.tsx
    - cha-bio-safety/src/utils/generateExcel.ts
    - cha-bio-safety/src/utils/dailyReportCalc.ts
    - cha-bio-safety/src/App.tsx
decisions:
  - "staff.active column default 1 — active staff shown by default without filter"
  - "SHIFT_OFFSETS preserved in shiftCalc.ts — shift logic is not staff data"
  - "dailyReportCalc.ts fallback STAFF array retained — backward compatible for DailyReportPage callers"
  - "generateShiftExcel accepts optional staffData param — forward compatible"
metrics:
  duration_minutes: 128
  completed_at: "2026-04-02T06:00:00Z"
  tasks_completed: 3
  tasks_total: 3
  files_created: 8
  files_modified: 9
---

# Phase 7 Plan 01: DB Migration + Staff/CheckPoint CRUD API + TECH-01 Summary

**One-liner:** Staff/CheckPoint CRUD API (5 endpoints) with migration, useStaffList hook, STAFF_ROLES/STAFF hardcoding fully removed via dynamic DB loading, /admin route with role-guard.

## What Was Built

### Task 1: DB Migration + API Infrastructure

- `0034_staff_fields.sql` — Adds `phone`, `email`, `appointed_at`, `active` columns to staff table
- `/api/staff` (GET all, POST create) — Staff list returns camelCase fields; POST admin-only, default password `plain:` + last 4 digits of staff ID
- `/api/staff/[id]` (GET single, PUT update) — Admin-only update with COALESCE partial update pattern
- `/api/staff/[id]/reset-password` (POST) — Admin-only; sets `plain:` + staffId.slice(-4)
- `/api/check-points` (GET with ?category filter or ?categories=all, POST create) — admin-only POST
- `/api/check-points/[id]` (PUT update) — admin-only
- `staffApi` and `checkPointApi` namespaces added to api.ts
- `StaffFull`, `StaffCreatePayload`, `StaffUpdatePayload`, `CheckPointFull`, `CheckPointCreatePayload`, `CheckPointUpdatePayload` types added

### Task 2: useStaffList + TECH-01 Hardcoding Removal

- `useStaffList.ts` — React Query hook with 5-minute staleTime calling `/api/staff`
- `DashboardPage.tsx` — Removed `STAFF_ROLES` constant; role lookup via `staffList.find(s => s.id === ...)?.role ?? 'assistant'`
- `shiftCalc.ts` — `getMonthlySchedule` now accepts optional `staffData` parameter; internal hardcoded STAFF array removed; falls back to `[]` when no data provided
- All callers updated: DashboardPage, SideMenu, WorkShiftPage pass staffForCalc
- `generateExcel.ts` — `generateShiftExcel` accepts optional staffData, forwards to getMonthlySchedule
- `dailyReportCalc.ts` — `buildPersonnel` and `buildDailyReportData` accept optional staffData; fallback to local STAFF for backward compatibility

### Task 3: /admin Route + SideMenu Role Guard + AdminPage Scaffold

- `App.tsx` — Added `const AdminPage = lazy(...)` + `<Route path="/admin" element={<Auth><AdminPage /></Auth>} />`; `/admin` was already in `NO_NAV_PATHS`
- `SideMenu.tsx` — Added `role?: 'admin' | 'assistant'` to `MenuItem` type; 관리자 설정 item: `soon: true → false`, `role: 'admin'`; rendering map now returns `null` for items where `item.role !== staff?.role`
- `AdminPage.tsx` — Role-guard scaffold: `useEffect` redirects assistants to `/dashboard`; renders "관리자 설정" header + placeholder text for Plan 02 implementation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing] Updated all getMonthlySchedule callers beyond DashboardPage/SideMenu**

- **Found during:** Task 2
- **Issue:** Plan specified updating SideMenu and DashboardPage callers but grep found WorkShiftPage, generateExcel.ts, and dailyReportCalc.ts also call getMonthlySchedule
- **Fix:** Updated WorkShiftPage to use useStaffList + pass staffForCalc; updated generateShiftExcel signature to accept optional staffData; updated buildDailyReportData/buildPersonnel to accept optional staffData with backward-compatible fallback to local STAFF array
- **Files modified:** WorkShiftPage.tsx, generateExcel.ts, dailyReportCalc.ts
- **Commits:** 33fcdde

**2. [Rule 1 - Bug] SideMenu map callback syntax fix**

- **Found during:** Task 3
- **Issue:** Changing `items.map(item => item.soon ?` to `items.map(item => { ... return item.soon ? (` left mismatched closing brackets
- **Fix:** Adjusted closing `})` to properly close the arrow function body
- **Files modified:** SideMenu.tsx
- **Commits:** 5574c69

## Known Stubs

- `AdminPage.tsx` renders "관리자 설정 페이지 (Plan 02에서 구현)" placeholder — intentional scaffold; Plan 02 implements the full UI

## Self-Check: PASSED

| Item | Status |
|------|--------|
| 0034_staff_fields.sql | FOUND |
| functions/api/staff/index.ts | FOUND |
| src/hooks/useStaffList.ts | FOUND |
| src/pages/AdminPage.tsx | FOUND |
| commit ad21d17 (Task 1) | FOUND |
| commit 33fcdde (Task 2) | FOUND |
| commit 5574c69 (Task 3) | FOUND |
| TypeScript compilation | PASSED (0 errors) |
| STAFF_ROLES removed | CONFIRMED (0 refs in src/) |
