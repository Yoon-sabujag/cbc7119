---
phase: 20-document-storage
plan: "01"
subsystem: documents
tags: [d1-migration, helpers, r2, documents, file-validation]
dependency_graph:
  requires: []
  provides:
    - cha-bio-safety/migrations/0046_documents.sql
    - cha-bio-safety/functions/api/documents/_helpers.ts
  affects:
    - cha-bio-safety/functions/api/documents/ (Plans 02, 03)
tech_stack:
  added: []
  patterns:
    - D1 SQLite CHECK constraint for enum enforcement (plan|drill)
    - Soft-delete column (deleted_at) reserved for future use
    - Covering index (type, year DESC, uploaded_at DESC) for list query pattern
    - Response-returning admin gate (requireAdmin returns Response|null)
    - MIME + extension dual-validation (D-22 pattern)
    - R2 key namespaced by type/year with nanoid prefix collision protection
key_files:
  created:
    - cha-bio-safety/migrations/0046_documents.sql
    - cha-bio-safety/functions/api/documents/_helpers.ts
  modified: []
decisions:
  - "Schema locked to D-02 column set; no extra columns, triggers, or seed data"
  - "requireAdmin returns Response (not throws) to allow early-return in handlers"
  - "buildR2Key uses module-local nanoid so callers never call nanoid directly for keys"
  - "MAX_DOC_SIZE = 200MB matches D-23 with future headroom"
metrics:
  duration: "~4 min"
  completed: "2026-04-09"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 0
---

# Phase 20 Plan 01: D1 Migration + Documents Helpers Summary

**One-liner:** D1 documents table (plan|drill CHECK, soft-delete, covering index) + shared helpers module (nanoid, file-type whitelist, R2 key builder, admin gate) for Plans 02/03.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create 0046_documents.sql migration | 3548d25 | cha-bio-safety/migrations/0046_documents.sql |
| 2 | Create shared helpers module | 324a366 | cha-bio-safety/functions/api/documents/_helpers.ts |

## Verification

- `grep -q "CHECK(type IN ('plan','drill'))"` — PASSED
- `grep -q "idx_documents_type_year_uploaded"` — PASSED
- `cd cha-bio-safety && npx tsc --noEmit` — PASSED (no errors)
- All acceptance criteria met for both tasks

## Exports from _helpers.ts

Plans 02 and 03 import from `'./_helpers'` (files directly under documents/) or `'../_helpers'` (files under documents/multipart/):

```typescript
import {
  requireAdmin, buildR2Key, validateFileType,
  MAX_DOC_SIZE, jsonError, jsonOk, isDocType,
  ALLOWED_FILE_TYPES, nanoid,
  type Env, type DocType
} from './_helpers'
```

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. This plan creates infrastructure only (migration + helpers), no UI or data rendering.

## Threat Flags

None. No new network endpoints introduced in this plan. The helpers module contains no I/O operations — pure validation and key-building functions only.

## Self-Check: PASSED

- `cha-bio-safety/migrations/0046_documents.sql` — FOUND
- `cha-bio-safety/functions/api/documents/_helpers.ts` — FOUND
- Commit 3548d25 — FOUND
- Commit 324a366 — FOUND
