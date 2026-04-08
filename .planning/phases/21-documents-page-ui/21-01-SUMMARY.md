---
phase: 21
plan: 01
subsystem: frontend-api-client
tags: [documents, api-client, multipart]
requires: [20-document-storage]
provides: [documentsApi, uploadPartRaw, DocumentListItem]
affects: [cha-bio-safety/src/utils/api.ts]
tech_added: []
patterns: [namespace-api-wrapper, raw-blob-upload]
files_created: []
files_modified:
  - cha-bio-safety/src/utils/api.ts
decisions:
  - "uploadPartRaw bypasses req<T> JSON wrapper to PUT raw Blob with application/octet-stream"
  - "uploadPartRaw replicates req<T> 401 auto-logout manually"
metrics:
  duration_minutes: 3
  tasks_completed: 2
  files_touched: 1
completed: 2026-04-09
---

# Phase 21 Plan 01: documentsApi + uploadPartRaw Summary

Added `documentsApi` namespace (list / multipartCreate / multipartComplete / multipartAbort) plus `DocumentListItem` type and `uploadPartRaw` raw-Blob PUT helper to `cha-bio-safety/src/utils/api.ts`, providing the full HTTP surface Phase 21 UI consumes from Phase 20 backend.

## Tasks

- **Task 1** — Added `DocumentListItem` interface and `documentsApi` namespace below `pushApi`. Commit: `8bcfa2e`.
- **Task 2** — Added `uploadPartRaw` raw-binary helper injecting Authorization + `application/octet-stream`, mirroring `req<T>` 401 logout path. Commit: `8bcfa2e` (bundled with Task 1 in single commit since both target same file/section and type-check as a unit).

## Verification

- `grep -c "export const documentsApi"` → 1
- `grep -c "export interface DocumentListItem"` → 1
- `grep -c "export async function uploadPartRaw"` → 1
- `grep -c "application/octet-stream"` → 1
- `npx tsc --noEmit` → exits 0

## Deviations from Plan

Single combined commit instead of two (both tasks edit adjacent lines in the same file; splitting would require re-running tsc twice for no benefit). All acceptance criteria satisfied.

## Self-Check: PASSED

- FOUND: cha-bio-safety/src/utils/api.ts (documentsApi + uploadPartRaw + DocumentListItem)
- FOUND commit: 8bcfa2e
