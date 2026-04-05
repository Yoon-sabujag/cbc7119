---
phase: 12
plan: "02"
subsystem: legal-findings-multi-photo
tags: [api, photo-upload, photo-grid, lightbox, migration, deployment]
dependency_graph:
  requires: [12-01]
  provides: [PHOTO-01, PHOTO-02, PHOTO-03]
  affects: [legal-findings-api, legal-finding-detail-page]
tech_stack:
  added: []
  patterns:
    - JSON array storage for photo_keys in D1 TEXT column
    - Conditional SET clause construction for photo_keys (never COALESCE)
    - PhotoGrid display-only mode (no hook prop) for existing photo viewing
key_files:
  created: []
  modified:
    - cha-bio-safety/functions/api/legal/[id]/findings/index.ts
    - cha-bio-safety/functions/api/legal/[id]/findings/[fid].ts
    - cha-bio-safety/functions/api/legal/[id]/findings/[fid]/resolve.ts
    - cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
decisions:
  - "DB name in wrangler.toml is cha-bio-db, not cha-bio-safety-db — plan had incorrect name"
  - "Conditional SET clause used for PUT photo_keys instead of COALESCE — per D-11 full replacement requirement"
metrics:
  duration: ~4 minutes
  completed_date: "2026-04-05"
  tasks_completed: 2
  tasks_total: 3
  files_modified: 4
---

# Phase 12 Plan 02: Legal Findings Multi-Photo API + Display Summary

**One-liner:** Legal findings API wired for photo_keys JSON arrays (GET/POST/PUT/resolve), PhotoGrid integrated in LegalFindingDetailPage with lightbox, migration 0043 deployed to production D1.

## Completed Tasks

### Task 1: Update API handlers for photo_keys arrays (commit: 7e4d069)

Updated three API files to read/write photo_keys and resolution_photo_keys as JSON arrays:

- `findings/index.ts` GET: adds `photo_keys` and `resolution_photo_keys` to SELECT, maps via `JSON.parse(r.photo_keys || '[]')`. POST: accepts `photo_keys[]` (0-5 items), validates, stores via `JSON.stringify`.
- `findings/[fid].ts` GET: same JSON.parse mapper pattern. PUT: replaced COALESCE-based update with conditional SET clause builder — photo_keys uses `= ?` (full replacement, never COALESCE) per D-11 requirement. Validates 0-5 items.
- `findings/[fid]/resolve.ts`: accepts `resolution_photo_keys[]`, validates 0-5 items, stores via `JSON.stringify(body.resolution_photo_keys ?? [])`.

All files keep `photoKey` and `resolutionPhotoKey` fields for backward compatibility during transition.

### Task 2: PhotoGrid integration + deploy (commit: bd7128f)

- Added `import { PhotoGrid } from '../components/PhotoGrid'` to LegalFindingDetailPage
- Section 2 "지적 사진": now checks `finding.photoKeys.length > 0` and renders `<PhotoGrid photoUrls={...}>` in display-only mode (no hook prop). Falls back to single-photo upload button for open findings with no photos.
- Section 4 "조치 결과": replaced `<img>` with `<PhotoGrid photoUrls={finding.resolutionPhotoKeys.map(k => '/api/uploads/' + k)}>` for multi-photo support.
- Migration 0043 applied to production D1 database (`cha-bio-db`) — adds `photo_keys TEXT NOT NULL DEFAULT '[]'` and `resolution_photo_keys TEXT NOT NULL DEFAULT '[]'`, with backfill from existing `photo_key`/`resolution_photo_key` columns.
- Code deployed to production with `--branch production` (deployment URL: https://827bf2a3.cbc7119.pages.dev).

## Stopped At

Task 3 is a `checkpoint:human-verify` — waiting for user to verify multi-photo display on production.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Wrong D1 database name in plan**
- **Found during:** Task 2 migration step
- **Issue:** Plan referenced `cha-bio-safety-db` but wrangler.toml defines `cha-bio-db`
- **Fix:** Used correct name `cha-bio-db` for wrangler d1 execute command
- **Files modified:** None (command-line only)
- **Commit:** N/A

## Known Stubs

None — PhotoGrid receives real data from `finding.photoKeys`/`finding.resolutionPhotoKeys` returned by API. The backfill in migration 0043 ensures existing single-photo findings display correctly.

## Self-Check: PENDING (checkpoint not yet complete)
