---
phase: 12-multi-photo-infrastructure
plan: "01"
subsystem: multi-photo
tags: [migration, hook, component, lightbox, typescript]
dependency_graph:
  requires: []
  provides: [migration-0043, useMultiPhotoUpload, PhotoGrid]
  affects: [legal_findings-schema, LegalFinding-type]
tech_stack:
  added: [yet-another-react-lightbox@^3.30.1]
  patterns: [Promise.allSettled parallel upload, AbortController cancellation, blob URL ref cleanup]
key_files:
  created:
    - cha-bio-safety/migrations/0043_multi_photo.sql
    - cha-bio-safety/src/hooks/useMultiPhotoUpload.ts
    - cha-bio-safety/src/components/PhotoGrid.tsx
  modified:
    - cha-bio-safety/src/types/index.ts
    - cha-bio-safety/package.json
    - cha-bio-safety/package-lock.json
decisions:
  - "Blob URL cleanup uses a previewUrls ref (updated via useEffect) rather than closure over slots, avoiding stale state at unmount"
  - "Promise.allSettled for parallel upload — partial failure does not block successful keys from being returned"
  - "No capture attribute on hidden file input — iOS does not support capture+multiple simultaneously (research D-07)"
metrics:
  duration_minutes: 3
  completed_date: "2026-04-05"
  tasks_completed: 2
  files_changed: 6
---

# Phase 12 Plan 01: Multi-Photo Infrastructure Summary

**One-liner:** D1 additive migration with JSON array backfill, parallel 5-slot upload hook with abort/cleanup, and thumbnail-grid lightbox component using yet-another-react-lightbox.

## What Was Built

### Task 1: Migration + Dependency + Type Update

- **`migrations/0043_multi_photo.sql`** — Additive migration that adds `photo_keys TEXT NOT NULL DEFAULT '[]'` and `resolution_photo_keys TEXT NOT NULL DEFAULT '[]'` to `legal_findings`. Backfills existing `photo_key`/`resolution_photo_key` values into JSON arrays using SQLite's built-in `json_array()` function. Safe for existing data — does not modify or drop old columns.
- **`yet-another-react-lightbox@^3.30.1`** installed — ~25 kB gzip, React 18 compatible (per research D-05).
- **`LegalFinding` interface** extended with `photoKeys: string[]` and `resolutionPhotoKeys: string[]` fields. Original `photoKey`/`resolutionPhotoKey` fields retained for backward compatibility during transition.

### Task 2: useMultiPhotoUpload Hook + PhotoGrid Component

- **`src/hooks/useMultiPhotoUpload.ts`** — Named export `useMultiPhotoUpload`. Manages up to 5 photo slots. Key behaviors:
  - `handleFiles`: compresses each file via `compressImage`, creates blob URLs, limits to remaining slot capacity
  - `uploadAll`: parallel upload using `Promise.allSettled` — partial failures set `slot.error` without blocking successful uploads; returns all R2 keys (already-uploaded + newly-uploaded)
  - `removeSlot(idx)`: revokes blob URL before removing from state
  - Unmount cleanup: blob URLs tracked in a `previewUrls` ref (updated via `useEffect`) to avoid stale closure at unmount; all pending uploads aborted via `AbortController`
  - `AbortController[]` stored in `useRef` (not state) to avoid re-renders

- **`src/components/PhotoGrid.tsx`** — Named export `PhotoGrid`. Supports two modes:
  - **Display mode** (`photoUrls` prop): renders resolved URLs as thumbnails, opens lightbox on click
  - **Upload mode** (`hook` prop): renders slot previews with remove badges and uploading overlays, add-slot placeholder button when `canAdd`
  - Hidden file input: `accept="image/*"`, `multiple`, no `capture` attribute (per D-07)
  - All styling uses inline style objects with CSS variables (`var(--bg2)`, `var(--bd2)`, `var(--danger)`, `var(--t3)`, `var(--bd)`)
  - Returns null when neither `photoUrls` nor `hook` has content

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `6afad0f` | feat(12-01): migration 0043 multi-photo columns + yet-another-react-lightbox + LegalFinding type update |
| 2 | `feabfbf` | feat(12-01): useMultiPhotoUpload hook + PhotoGrid component with lightbox |

## Deviations from Plan

None — plan executed exactly as written.

The `handleFiles` implementation uses a two-step approach (read `slots.length` at call time before compression) rather than a functional updater pattern, which is correct for the sequential `compressImage` loop. This matches the intent of the plan spec.

## Known Stubs

None — this plan creates infrastructure only. No UI rendering paths that reach users with empty data. PhotoGrid returns null when there is no content. The hook and component are consumed by downstream plans (Phase 13 BottomSheet, Phase 15 Download) that will wire in actual data.

## Self-Check: PASSED

- `cha-bio-safety/migrations/0043_multi_photo.sql` — EXISTS
- `cha-bio-safety/src/hooks/useMultiPhotoUpload.ts` — EXISTS (131 lines, > 80 min)
- `cha-bio-safety/src/components/PhotoGrid.tsx` — EXISTS (142 lines, > 60 min)
- `6afad0f` — FOUND in git log
- `feabfbf` — FOUND in git log
- `npx tsc --noEmit` — 0 errors
