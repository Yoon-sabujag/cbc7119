---
phase: 09-education-management
plan: 01
subsystem: api
tags: [cloudflare-d1, cloudflare-pages-functions, education-records, typescript]

# Dependency graph
requires: []
provides:
  - education_records D1 table with staff_id FK, education_type CHECK constraint, completed_at
  - GET /api/education endpoint returning all active staff with grouped education records
  - POST /api/education endpoint with admin-or-self permission check
  - PUT /api/education/:id endpoint with admin-or-self permission check (no DELETE)
  - EducationRecord and StaffEducation TypeScript interfaces in types/index.ts
  - educationApi client (list/create/update) in utils/api.ts
  - /education route registered in App.tsx with lazy EducationPage
  - 보수교육 SideMenu entry in 근무·복지 section
  - Placeholder EducationPage.tsx for Plan 02 to replace
affects: [09-education-management]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Active-staff + records grouped-by-staff-id pattern (same as meal/staff APIs)"
    - "Admin-or-self permission gate on write endpoints (role !== 'admin' && authStaffId !== record.staff_id)"
    - "No DELETE endpoint — 이수 이력 삭제 불가 원칙"

key-files:
  created:
    - cha-bio-safety/migrations/0036_education_records.sql
    - cha-bio-safety/functions/api/education/index.ts
    - cha-bio-safety/functions/api/education/[id].ts
    - cha-bio-safety/src/pages/EducationPage.tsx
  modified:
    - cha-bio-safety/src/types/index.ts
    - cha-bio-safety/src/utils/api.ts
    - cha-bio-safety/src/App.tsx
    - cha-bio-safety/src/components/SideMenu.tsx

key-decisions:
  - "No DELETE endpoint for education_records: 이수 이력은 법적 보존 대상 (D-09)"
  - "GET /api/education: all staff visible to all roles (D-11 — no role filter on read)"
  - "Write permission: admin OR record owner (D-10 — self-service allowed)"
  - "Migration number 0036: 0035 slot already occupied by both extinguishers and meal_records"

patterns-established:
  - "education API follows meal/staff pattern: camelCase response mapping, D1 .all() + .first()"

requirements-completed: [EDU-01, EDU-02]

# Metrics
duration: 15min
completed: 2026-04-02
---

# Phase 9 Plan 01: Education Management Backend + Wiring Summary

**education_records D1 table, three CRUD endpoints with admin-or-self auth, TypeScript contracts, API client, and /education route wired into SideMenu**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-02T22:29:00Z
- **Completed:** 2026-04-02T22:44:51Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Migration 0036 creates education_records table with staff_id FK, education_type CHECK (initial/refresher), completed_at, index on (staff_id, completed_at DESC)
- Three API endpoints: GET (all active staff + grouped records), POST (create with admin-or-self gate), PUT update completed_at (admin-or-self gate); no DELETE per D-09 principle
- TypeScript interfaces EducationRecord and StaffEducation exported from types/index.ts
- educationApi.list/create/update exported from utils/api.ts following mealApi pattern
- /education route registered in App.tsx (lazy) and 보수교육 item added to SideMenu 근무·복지 section
- Placeholder EducationPage.tsx ready for Plan 02 to replace with full UI

## Task Commits

1. **Task 1: DB migration + education CRUD API endpoints** - `8f2f5e6` (feat)
2. **Task 2: Type definitions, API client, routing, SideMenu wiring** - `98136cf` (feat)

## Files Created/Modified
- `cha-bio-safety/migrations/0036_education_records.sql` - education_records table schema + index
- `cha-bio-safety/functions/api/education/index.ts` - GET (staff + records) and POST (create with auth) handlers
- `cha-bio-safety/functions/api/education/[id].ts` - PUT (update completed_at with admin-or-self check)
- `cha-bio-safety/src/types/index.ts` - EducationRecord and StaffEducation interfaces added
- `cha-bio-safety/src/utils/api.ts` - educationApi (list/create/update) added after mealApi
- `cha-bio-safety/src/App.tsx` - EducationPage lazy import + /education Route
- `cha-bio-safety/src/components/SideMenu.tsx` - 보수교육 item in 근무·복지 section
- `cha-bio-safety/src/pages/EducationPage.tsx` - Placeholder page (준비중)

## Decisions Made
- No DELETE endpoint: 이수 이력 삭제 불가 원칙 (D-09) — compliance record preservation
- All staff can view all education records (D-11) — no role filter on GET
- Write operations require admin or self (D-10) — staff can self-record their own training
- Migration numbered 0036 because 0035 is already used by both extinguishers and meal_records

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs
- `cha-bio-safety/src/pages/EducationPage.tsx` — intentional placeholder returning "보수교육 (준비중)". Plan 02 (09-02) will replace with full EducationPage UI.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required. DB migration 0036 will be applied via CI/CD on next deploy.

## Next Phase Readiness
- All backend contracts established; Plan 02 (EducationPage UI) can build directly against these endpoints and types
- educationApi.list(), educationApi.create(), educationApi.update() ready for consumption
- /education route active and navigable via SideMenu

---
*Phase: 09-education-management*
*Completed: 2026-04-02*

## Self-Check: PASSED
- All 8 source files created/modified: FOUND
- SUMMARY.md: FOUND
- Task commits 8f2f5e6 and 98136cf: FOUND
- npm run build: PASSED (zero TypeScript errors)
