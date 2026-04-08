---
phase: 20-document-storage
plan: "03"
subsystem: documents
tags: [d1-list, r2-download, streaming, soft-delete, utf8-filename, production-deploy]
dependency_graph:
  requires:
    - cha-bio-safety/functions/api/documents/_helpers.ts (Plan 20-01)
    - cha-bio-safety/migrations/0046_documents.sql (Plan 20-01)
    - cha-bio-safety/functions/api/documents/multipart/*.ts (Plan 20-02)
  provides:
    - cha-bio-safety/functions/api/documents/index.ts (GET list)
    - cha-bio-safety/functions/api/documents/[id].ts (GET download)
    - Production D1 with documents table (migration 0046 applied)
    - Production Pages backend with all 6 document endpoints
  affects:
    - Phase 21 (document UI — list and download wired against these endpoints)
tech_stack:
  added: []
  patterns:
    - D1 LEFT JOIN staff for uploaded_by_name in list response
    - Soft-delete filter (WHERE deleted_at IS NULL) on every read query
    - ORDER BY year DESC, uploaded_at DESC for list (year filter changes to uploaded_at DESC only)
    - R2 obj.body ReadableStream direct passthrough to Response (no buffering)
    - Content-Disposition filename*=UTF-8''{encoded} for Korean filename support (D-14)
    - Cache-Control: private, max-age=3600 for authenticated binary downloads
key_files:
  created:
    - cha-bio-safety/functions/api/documents/index.ts
    - cha-bio-safety/functions/api/documents/[id].ts
  modified: []
decisions:
  - "No admin gate on list/download per D-19 — all authenticated staff can read"
  - "year filter is optional; when absent ORDER BY covers year DESC too"
  - "Two separate 404 paths for download: row not found vs R2 object not found"
  - "Cache-Control: private keeps responses out of shared caches; 1hr client-side cache reduces repeat downloads"
  - "Migration 0046 applied to production D1 before deploy — table exists at cha-bio-db"
metrics:
  duration: "~6 min"
  completed: "2026-04-08"
  tasks_completed: 3
  tasks_total: 4
  files_created: 2
  files_modified: 0
---

# Phase 20 Plan 03: List + Download Endpoints + Production Deploy Summary

**One-liner:** GET /api/documents list (staff JOIN, soft-delete filter, year/type params) and GET /api/documents/{id} streaming download (ReadableStream passthrough, UTF-8 Content-Disposition) deployed to production with migration 0046 applied.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Implement list endpoint | 9692b5b | cha-bio-safety/functions/api/documents/index.ts |
| 2 | Implement download endpoint (streaming) | 74c8d7d | cha-bio-safety/functions/api/documents/[id].ts |
| 3 | Apply migration + deploy to production | (no source change) | D1 migration 0046 applied remotely; Pages deployed |

## Verification

- `test -f cha-bio-safety/functions/api/documents/index.ts` — PASSED
- `grep -q "deleted_at IS NULL" index.ts` — PASSED
- `grep -q "year DESC, d.uploaded_at DESC" index.ts` — PASSED
- `grep -q "LEFT JOIN staff" index.ts` — PASSED
- `test -f "cha-bio-safety/functions/api/documents/[id].ts"` — PASSED
- `grep -q "filename*=UTF-8''" [id].ts` — PASSED
- `grep -q "STORAGE.get(row.r2_key)" [id].ts` — PASSED
- `npx tsc --noEmit` — PASSED (no errors in new files)
- Remote D1 `documents` table verified via `sqlite_master` query — PASSED (CHECK constraint plan|drill present)
- `curl /api/documents?type=plan` → 401 (not 404) — PASSED
- `curl POST /api/documents/multipart/create` → 401 — PASSED
- `curl /api/documents/1` → 401 — PASSED

## Production Deploy Details

- **Migration:** `0046_documents.sql` applied to `cha-bio-db` (remote) — 2 queries, 4 rows written
- **Build:** `npm run build` succeeded — 342 assets, 8.98s
- **Deploy:** `npx wrangler pages deploy dist --branch=production` → `https://843ab8e8.cbc7119.pages.dev`
- **All 6 document endpoints** return 401 on unauthenticated access (routing confirmed)

## Endpoint Contracts (complete Phase 20 backend)

| Method | Path | Auth | Response |
|--------|------|------|----------|
| POST | /api/documents/multipart/create | admin | `{ uploadId, key, partSize: 10485760 }` |
| PUT | /api/documents/multipart/upload-part?uploadId&key&partNumber | admin | `{ partNumber, etag }` |
| POST | /api/documents/multipart/complete | admin | 201 `{ id, key }` |
| POST | /api/documents/multipart/abort | admin | `{ aborted: true }` |
| GET | /api/documents?type=plan\|drill[&year=YYYY] | all staff | `{ data: [...] }` |
| GET | /api/documents/{id} | all staff | binary stream |

## Task 4: Checkpoint (Pending)

Task 4 is a `checkpoint:human-verify` — awaiting smoke test confirmation in browser DevTools.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All endpoints are fully wired to D1 and R2. No placeholder logic.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: open-read | functions/api/documents/index.ts | New GET endpoint — no admin gate (intentional per D-19); JWT auth enforced by middleware |
| threat_flag: open-read | functions/api/documents/[id].ts | New GET endpoint — no admin gate (intentional per D-19); JWT auth enforced by middleware; binary stream |

Both read endpoints are intentionally open to all authenticated staff per D-19. No unauthenticated access possible (middleware blocks at 401).

## Self-Check: PASSED

- `cha-bio-safety/functions/api/documents/index.ts` — FOUND
- `cha-bio-safety/functions/api/documents/[id].ts` — FOUND
- Commit 9692b5b — FOUND
- Commit 74c8d7d — FOUND
- Remote D1 documents table — VERIFIED (wrangler d1 execute confirmed)
- Production deploy — VERIFIED (401 responses on all routes)
