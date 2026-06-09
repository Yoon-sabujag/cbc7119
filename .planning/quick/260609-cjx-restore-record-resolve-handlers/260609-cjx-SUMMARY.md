---
phase: quick-260609-cjx
plan: "01"
subsystem: inspections-api
tags: [hotfix, api, inspection, resolve, unresolve, delete, admin-gate]
dependency_graph:
  requires: []
  provides:
    - POST /api/inspections/records/:recordId/resolve
    - POST /api/inspections/records/:recordId/unresolve
    - DELETE /api/inspections/records/:recordId
  affects:
    - RemediationDetailPage.tsx
    - FloorPlanPage.tsx
    - src/utils/api.ts (resolveRecord, unresolveRecord, deleteRecord calls)
tech_stack:
  added: []
  patterns:
    - Cloudflare Pages file-based routing with bracket directories [recordId]/
    - PagesFunction<Env> with per-depth _middleware import
    - admin role gate (role !== 'admin' -> 403)
key_files:
  created:
    - cha-bio-safety/functions/api/inspections/records/[recordId]/resolve.ts
    - cha-bio-safety/functions/api/inspections/records/[recordId]/unresolve.ts
    - cha-bio-safety/functions/api/inspections/records/[recordId].ts
  modified: []
decisions:
  - "git add -f required: root .gitignore has 'inspections/' pattern; existing tracked files in that dir were all force-added, new files follow the same convention"
  - "import depth: resolve/unresolve use ../../../../_middleware (4 dirs up from [recordId]/); delete handler uses ../../../_middleware (3 dirs up from records/)"
metrics:
  duration: "~5 min"
  completed: "2026-06-09"
  tasks_completed: 1
  files_created: 3
  files_modified: 0
---

# Phase quick-260609-cjx Plan 01: Restore Record Resolve/Unresolve/Delete API Handlers Summary

## One-liner

Restored three untracked-and-lost Cloudflare Pages function handlers for inspection record resolve, unresolve, and delete; committed atomically so a future clone cannot drop them again.

## What Was Built

Three Cloudflare Pages function handlers were missing from the repository (never committed in
the original work session, dropped on re-clone). They back the frontend calls in
`RemediationDetailPage.tsx`, `FloorPlanPage.tsx`, and `utils/api.ts`:

| Route | File | Auth |
|---|---|---|
| `POST /api/inspections/records/:id/resolve` | `records/[recordId]/resolve.ts` | any logged-in staff |
| `POST /api/inspections/records/:id/unresolve` | `records/[recordId]/unresolve.ts` | admin only (403 otherwise) |
| `DELETE /api/inspections/records/:id` | `records/[recordId].ts` | admin only (403 otherwise) |

The resolve handler validates `resolution_memo` non-empty (400 if missing), looks up the record
(404 if not found), then UPDATEs `check_records` with status=resolved + KST timestamp.
The unresolve handler NULLs all resolution columns. The delete handler hard-deletes the row.

Existing `records.ts` (GET list) and new `records/` directory coexist — no conflict, zero
existing files modified.

## Verify Results

| Check | Result |
|---|---|
| FILES_OK (3 paths exist) | PASS |
| IMPORT_DEPTHS_OK (4 vs 3 `../`) | PASS |
| COEXIST_OK (records.ts + records/) | PASS |
| ADMIN_GATES_OK (role !== 'admin' in both) | PASS |
| TSC_OK (npx tsc --noEmit) | PASS |
| BUILD_OK (npm run build) | PASS |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] git add -f required for inspections/ gitignore pattern**
- **Found during:** Commit step
- **Issue:** Root `.gitignore` contains `inspections/` which matches the new files' paths. Plain `git add` exited with code 1.
- **Fix:** Used `git add -f` — identical to how all existing files under `functions/api/inspections/` were previously committed (verified via `git ls-files`). No `.gitignore` modification needed or made.
- **Files modified:** None — only the staging command changed.
- **Commit:** 6eb6973

## Known Stubs

None.

## Threat Flags

None — no new network endpoints beyond the three documented routes. Admin gates enforced on destructive operations per CLAUDE.md data-integrity principle.

## Self-Check: PASSED

- `cha-bio-safety/functions/api/inspections/records/[recordId]/resolve.ts` — present
- `cha-bio-safety/functions/api/inspections/records/[recordId]/unresolve.ts` — present
- `cha-bio-safety/functions/api/inspections/records/[recordId].ts` — present
- Commit `6eb6973` — verified in git log
- TSC + build both green
