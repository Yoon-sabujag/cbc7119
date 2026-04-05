---
phase: 15-finding-download
plan: 02
subsystem: ui
tags: [react, fflate, zip, ios-pwa, legal-findings, download]

requires:
  - phase: 15-finding-download
    provides: findingDownload.ts utility with buildMetaTxt, openFindingReport exports

provides:
  - LegalFindingsPage admin sub-header with bulk ZIP download button
  - fflate.zipSync client-side ZIP: finding-NNN_위치/내용.txt + 지적사진/조치사진
  - window.open blob URL pattern (iOS PWA safe, D-08 compliant)
  - Production deployment at https://c2ba7414.cbc7119.pages.dev

affects:
  - 15-03 (if exists — depends on ZIP download working in production)

tech-stack:
  added: []
  patterns:
    - "Bulk ZIP via fflate.zipSync + window.open (not <a download>) for iOS PWA compatibility"
    - "Promise.allSettled for parallel photo fetch with partial failure tolerance"
    - "zipLoading: string | false state for progress feedback string vs disabled boolean"

key-files:
  created: []
  modified:
    - cha-bio-safety/src/pages/LegalFindingsPage.tsx

key-decisions:
  - "window.open(blobUrl, '_blank') not <a download> — iOS PWA requires window.open to trigger share sheet"
  - "Promise.allSettled for photo fetch — finding ZIP proceeds even if individual photos fail"
  - "finding-NNN_위치 folder structure with 내용.txt always present even when no photos"

patterns-established:
  - "ZIP download pattern: dynamic import fflate, build files Record<string, Uint8Array>, zipSync, window.open blob"

requirements-completed:
  - DL-02
  - DL-03

duration: 30min
completed: 2026-04-06
---

# Phase 15 Plan 02: Bulk ZIP Download for Legal Findings Summary

**Admin-only bulk ZIP download added to LegalFindingsPage: fflate client-side ZIP with finding-NNN_위치/내용.txt + photos structure, opened via window.open for iOS PWA compatibility — production verified.**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-04-05T17:10:00Z
- **Completed:** 2026-04-06T02:07:00Z
- **Tasks:** 3 of 3 complete (Task 3 = human verification — approved)
- **Files modified:** 1

## Accomplishments

### Task 1: Add bulk ZIP download to LegalFindingsPage
- Added `import { buildMetaTxt } from '../utils/findingDownload'`
- Added `zipLoading: string | false` state for progress feedback
- Added `handleZipDownload` async function with:
  - Dynamic `import('fflate')` for code splitting
  - Loop over findings creating `finding-NNN_위치/` folders
  - `内容.txt` always included via `buildMetaTxt(f)`
  - `Promise.allSettled` for 지적사진 + 조치사진 fetches (partial failure tolerant)
  - `zipSync(files, { level: 6 })` for synchronous ZIP creation
  - `window.open(url, '_blank')` — no `<a download>` (D-08 compliant, iOS PWA safe)
- Added `일괄 다운로드` button in admin sub-header (admin-only via existing `role === 'admin'` guard)

### Task 2: Build and deploy to production
- `npm run build` succeeded (9.04s, LegalFindingsPage-B_hugrxF.js: 16.32 kB)
- `npm run deploy -- --branch production` deployed to production
- Deployment URL: https://c2ba7414.cbc7119.pages.dev

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `1018aa2` | feat(15-02): add bulk ZIP download to LegalFindingsPage |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. The ZIP download is fully wired: `findings` data from React Query → `handleZipDownload` → fflate ZIP → window.open.

## Task 3: Production Verification — APPROVED

User approved production verification of both download features:
- 건별 다운로드 (LegalFindingDetailPage header icon) — verified working
- 일괄 다운로드 (LegalFindingsPage admin sub-header 일괄 다운로드 button) — verified working
- Production URL: https://c2ba7414.cbc7119.pages.dev

## Self-Check: PASSED

- [x] `cha-bio-safety/src/pages/LegalFindingsPage.tsx` modified and committed
- [x] Commit `1018aa2` exists
- [x] Build succeeded, deployment URL returned
- [x] No `<a download>` pattern in modified file
- [x] Task 3 production verification approved by user
