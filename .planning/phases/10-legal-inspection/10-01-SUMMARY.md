---
phase: 10-legal-inspection
plan: 01
subsystem: api
tags: [cloudflare-d1, sqlite, typescript, legal-inspection, schedule-items]

requires:
  - phase: 09-education
    provides: staff table structure, API handler patterns, role-guard pattern

provides:
  - migration 0038 adding result/report_file_key to schedule_items + creating legal_findings table
  - 5 API handlers at /api/legal/* using schedule_items schema
  - LegalRound and LegalFinding TypeScript interfaces
  - legalApi client namespace with 8 methods
  - api.patch method added to base api object

affects: [10-02, any phase using schedule_items, any phase using legalApi]

tech-stack:
  added: []
  patterns:
    - "Legal round = schedule_items row with category='fire' and inspection_category in legal subcategories"
    - "LEFT JOIN legal_findings for aggregated finding counts in list/detail queries"
    - "COALESCE(?, field) pattern for partial UPDATE without overwriting nulls"
    - "Admin-only PATCH for result/report; all roles for finding CRUD and resolve"
    - "KST timestamps via datetime('now','+9 hours') in resolved_at"

key-files:
  created:
    - cha-bio-safety/migrations/0038_legal_findings.sql
  modified:
    - cha-bio-safety/src/types/index.ts
    - cha-bio-safety/src/utils/api.ts
    - cha-bio-safety/functions/api/legal/index.ts
    - cha-bio-safety/functions/api/legal/[id].ts
    - cha-bio-safety/functions/api/legal/[id]/findings/index.ts
    - cha-bio-safety/functions/api/legal/[id]/findings/[fid].ts
    - cha-bio-safety/functions/api/legal/[id]/findings/[fid]/resolve.ts

key-decisions:
  - "Legal rounds are NOT a separate table — they are schedule_items with category='fire' and inspectionCategory in ('소방 상반기 종합정밀점검', '소방 하반기 작동기능점검')"
  - "legal/index.ts is GET-only (no POST); schedule creation happens via SchedulePage"
  - "legal/[id].ts uses PATCH (not PUT) for result/report update; api.patch added to base api object"
  - "Incorrect import depth for [fid].ts and resolve.ts auto-fixed (Rule 1 bug)"

patterns-established:
  - "schedule_items + legal_findings LEFT JOIN pattern for aggregated counts"
  - "PagesFunction<Env> with ctx.data typed as any for staffId/role extraction"

requirements-completed: [LEGAL-01, LEGAL-02]

duration: 15min
completed: 2026-04-03
---

# Phase 10 Plan 01: Legal Inspection Backend Summary

**migration 0038 + 5 API handlers rewritten for schedule_items schema + LegalRound/LegalFinding types + legalApi client with api.patch**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-03T~15:40:00Z
- **Completed:** 2026-04-03T~15:55:00Z
- **Tasks:** 2
- **Files modified:** 8 (1 created, 7 modified/rewritten)

## Accomplishments
- Migration 0038: ALTER schedule_items (result, report_file_key) + CREATE legal_findings table with index
- 5 API endpoint files completely rewritten from old `legal_inspections` schema to `schedule_items + legal_findings` — zero old schema references remain
- LegalRound, LegalFinding, LegalInspectionResult, LegalFindingStatus types exported from types/index.ts
- api.patch method added to base api object; legalApi namespace with 8 methods exported from api.ts
- Build passes without TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: DB migration + Types + API client** - `3afa0cf` (feat)
2. **Task 2: Rewrite all 5 API endpoint files** - `e850c3f` (feat)

**Plan metadata:** (docs commit — next)

## Files Created/Modified
- `cha-bio-safety/migrations/0038_legal_findings.sql` — schedule_items ALTER + legal_findings CREATE TABLE + index
- `cha-bio-safety/src/types/index.ts` — appended LegalInspectionResult, LegalFindingStatus, LegalRound, LegalFinding interfaces
- `cha-bio-safety/src/utils/api.ts` — added api.patch method; appended legalApi namespace with 8 methods
- `cha-bio-safety/functions/api/legal/index.ts` — rewritten: GET only, schedule_items LEFT JOIN legal_findings, year filter
- `cha-bio-safety/functions/api/legal/[id].ts` — rewritten: GET single round + PATCH result/report (admin only)
- `cha-bio-safety/functions/api/legal/[id]/findings/index.ts` — rewritten: GET list with staff JOINs + POST (all roles)
- `cha-bio-safety/functions/api/legal/[id]/findings/[fid].ts` — rewritten: GET single + PUT update (admin only)
- `cha-bio-safety/functions/api/legal/[id]/findings/[fid]/resolve.ts` — rewritten: POST resolve with validation + KST timestamp

## Decisions Made
- Legal rounds use existing `schedule_items` rows (category='fire', inspectionCategory in legal subtypes) — no new table required
- `legal/index.ts` is GET-only; schedule creation is the SchedulePage's responsibility
- Used PATCH (not PUT) for partial result/report update on `[id].ts` to match REST semantics; added `api.patch` to base client

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed incorrect relative import paths for deeply nested files**
- **Found during:** Task 2 post-build TypeScript check
- **Issue:** `[fid].ts` used `'../../../../../_middleware'` (5 levels) instead of `'../../../../_middleware'` (4 levels); `resolve.ts` used `'../../../../../../_middleware'` (6 levels) instead of `'../../../../../_middleware'` (5 levels)
- **Fix:** Corrected both import paths to match actual directory depth; verified against existing pattern in `elevators/[elevatorId]/inspections/[inspectionId]/cert.ts`
- **Files modified:** `functions/api/legal/[id]/findings/[fid].ts`, `functions/api/legal/[id]/findings/[fid]/resolve.ts`
- **Verification:** `npm run build` passes with no TypeScript errors
- **Committed in:** `e850c3f` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** Required fix for build to pass. No scope creep.

## Issues Encountered
- TypeScript relative import path depth mismatch for the two deepest files — resolved inline (Rule 1) before committing Task 2.

## User Setup Required
None - no external service configuration required. Migration 0038 will be applied via `wrangler d1 migrations apply` on next deploy.

## Known Stubs
None — all API handlers wire directly to D1 queries. No placeholder/hardcoded data.

## Next Phase Readiness
- All backend data layer complete: migration, API endpoints, TypeScript types, client namespace
- Plan 10-02 (LegalInspectionPage UI) can import `legalApi` and `LegalRound`/`LegalFinding` types immediately
- Migration 0038 must be applied to production D1 before deploy (handled by CI/CD migrate step)

---
*Phase: 10-legal-inspection*
*Completed: 2026-04-03*

## Self-Check: PASSED

All 9 files confirmed present on disk. Both task commits (3afa0cf, e850c3f) confirmed in git log.
