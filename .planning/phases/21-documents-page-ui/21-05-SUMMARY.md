---
phase: 21
plan: 05
subsystem: documents-page-ui
tags: [react, ui, upload, responsive, react-query]
requires:
  - 21-01 (documentsApi surface)
  - 21-02 (downloadDocument util)
  - 21-03 (runMultipartUpload, formatBytes, formatEta)
  - 21-04 (route registration)
provides:
  - src/pages/DocumentsPage.tsx (route container)
  - src/components/DocumentSection.tsx (per-type list view)
  - src/components/DocumentUploadForm.tsx (upload form + progress)
affects:
  - cha-bio-safety/src/App.tsx (lazy import now resolves — build unblocked)
tech-stack:
  added: []
  patterns:
    - "Inline BottomSheet/Modal responsive branching via useIsDesktop()"
    - "React Query per-type cache key ['documents', type]"
    - "AbortController + beforeunload guard for multipart upload lifecycle"
    - "Client-side file validation with empty-MIME fallback for iOS .hwp/.zip"
key-files:
  created:
    - cha-bio-safety/src/components/DocumentSection.tsx
    - cha-bio-safety/src/components/DocumentUploadForm.tsx
    - cha-bio-safety/src/pages/DocumentsPage.tsx
  modified: []
key-decisions:
  - "Backdrop click on upload sheet/modal is a no-op; users must use 취소 button so the form's in-progress confirm guard fires (prevents accidental abort of in-flight uploads)"
  - "DocumentSection decides its own upload button shape via useIsDesktop() (mobile 40×40 icon / desktop accent pill) — parent provides layout only, not button styling"
  - "EXT_TO_MIME fallback mirrors server _helpers.ts exactly with empty string added to .hwp/.zip mimes whitelist for iOS Safari which emits file.type === ''"
requirements-completed: [DOC-01, DOC-02, DOC-03, DOC-04, DOC-05, DOC-06]
duration: ~15 min
completed: 2026-04-09
---

# Phase 21 Plan 05: Documents Page UI Summary

Built the user-facing `/documents` page as three new components: responsive DocumentsPage (mobile tab bar / desktop 2-column), DocumentSection (hero card + 과거 이력 list + admin upload button + 5 visual states), and DocumentUploadForm (year/title/file validation + multipart progress + abort/retry + beforeunload guard). This plan unblocks the full Vite build since Plan 21-04's lazy import at `./pages/DocumentsPage` now resolves.

## Tasks

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | DocumentSection.tsx — list view + download + admin upload trigger | `dba49e3` | src/components/DocumentSection.tsx (425 lines) |
| 2 | DocumentUploadForm.tsx — form + validation + multipart progress + abort/retry | `aa45843` | src/components/DocumentUploadForm.tsx (400 lines) |
| 3 | DocumentsPage.tsx — route container + BottomSheet/Modal shell | `8e2068c` | src/pages/DocumentsPage.tsx (162 lines) |

Total: 3 files, ~987 lines across 3 per-task commits.

## Verification

- `cd cha-bio-safety && npx tsc --noEmit` → exit 0
- `cd cha-bio-safety && npm run build` → success (87 modules, built in 9.39s, PWA precache 62 entries)
- All grep acceptance criteria from PLAN tasks 1/2/3 pass
- DocumentsPage lazy import in App.tsx now resolves — build previously failed with `TS2307: Cannot find module './pages/DocumentsPage'`

## Observable Behaviors Delivered

- **D-01..D-05 Layout:** Mobile tabs ↔ desktop 2-column at 1024px breakpoint
- **D-06..D-11 Hero + history:** Latest item as hero card with 최신 pill, remaining items as 과거 이력 list (hidden when ≤1 total)
- **D-12..D-14 Download:** Tap either card or row → downloadDocument() with per-row loading state + toast feedback
- **D-15 Admin gate:** Upload button rendered only when `staff.role === 'admin'`, no disabled state for assistants
- **D-16..D-17 Upload shell:** Mobile BottomSheet (slideUp 240ms), desktop centered Modal (fadeIn 180ms)
- **D-18..D-19 Form fields:** Year dropdown (currentYear+1..2020 desc), title auto-prefill on file select, file picker with dashed border style
- **D-20..D-23 Multipart orchestration:** runMultipartUpload with AbortController cancel, beforeunload guard on `isUploading`, invalidateQueries on success
- **D-24..D-25 Progress display:** 8px progress bar with 240ms transition, percent + MB/s + ETA using formatBytes/formatEta, "속도 계산 중…" when speedBps < 100KB/s
- **D-26 Error + retry:** Form stays open on error, retry button preserves form state (file/year/title all kept)
- **D-27 Cancel confirm:** window.confirm during upload, AbortError bypasses toast.error

## Empty-MIME Fallback (RESEARCH §iOS Safari)

The `.hwp` and `.zip` whitelist entries include `''` (empty string) so files from iOS Safari (which reports `file.type === ''` for unknown types) pass client validation. When `file.type` is empty at submit, contentType is resolved via `EXT_TO_MIME[ext]` so the server receives a valid non-empty MIME as required by `_helpers.ts`.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Self-Check: PASSED

- `[ -f cha-bio-safety/src/components/DocumentSection.tsx ]` → FOUND
- `[ -f cha-bio-safety/src/components/DocumentUploadForm.tsx ]` → FOUND
- `[ -f cha-bio-safety/src/pages/DocumentsPage.tsx ]` → FOUND
- `git log --grep="21-05"` → 3 feat commits (dba49e3, aa45843, 8e2068c)
- Full build succeeds

## Next

Phase 21 final plan: **21-06** (deploy + prod verify). Plan 21-05 was the implementation gate — route is now live in code and the full Vite build succeeds, so deploy is unblocked.
