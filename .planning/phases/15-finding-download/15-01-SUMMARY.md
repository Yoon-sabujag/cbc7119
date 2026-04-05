---
phase: 15-finding-download
plan: "01"
subsystem: legal-findings
tags: [download, ios-pwa, html-report, base64, window-open]
dependency_graph:
  requires: []
  provides: [findingDownload-utils, admin-download-button]
  affects: [LegalFindingDetailPage]
tech_stack:
  added: []
  patterns: [window.open-before-async, Promise.allSettled-parallel, FileReader-base64]
key_files:
  created:
    - cha-bio-safety/src/utils/findingDownload.ts
  modified:
    - cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
decisions:
  - "window.open('', '_blank') called synchronously before async photo fetch — required for iOS PWA popup bypass"
  - "FileReader.readAsDataURL chosen over manual btoa/Uint8Array — handles all image MIME types correctly"
  - "Promise.allSettled for parallel photo fetch — partial failure does not block report generation"
metrics:
  duration: "2m"
  completed_date: "2026-04-05"
  tasks_completed: 2
  files_modified: 2
---

# Phase 15 Plan 01: Finding Download Utility + Admin Button Summary

**One-liner:** iOS-safe HTML report generator with base64 photos via synchronous window.open + parallel Promise.allSettled fetch, admin-only button in LegalFindingDetailPage header.

---

## What Was Built

### findingDownload.ts utility module (`cha-bio-safety/src/utils/findingDownload.ts`)

Four exported functions:

1. **`fetchAsBase64(url)`** — Fetches any URL and converts to `data:image/...;base64,...` via FileReader. Returns `null` on any error (no throw). Handles all MIME types without manual content-type detection.

2. **`buildReportHtml(finding, photosHtml)`** — Generates a complete HTML5 document with A4 print CSS (`@page { size: A4; margin: 20mm }`), `-webkit-print-color-adjust: exact` for iOS, Korean metadata table, and an inline print button hidden via `@media print`.

3. **`openFindingReport(finding)`** — Calls `window.open('', '_blank')` synchronously first (popup-safe pattern per D-08 research), shows "로딩 중..." placeholder, then fetches all `photoKeys` and `resolutionPhotoKeys` in parallel via `Promise.allSettled`. Builds and writes final HTML to the opened window.

4. **`buildMetaTxt(finding)`** — Returns plain-text metadata for use in Plan 02's ZIP bundle.

### Admin download button in LegalFindingDetailPage

- Positioned `absolute; right: 12` in the page header, mirroring the existing back button (`left: 12`)
- Only renders when `staff?.role === 'admin' && finding` — invisible to non-admin users
- Disabled with opacity 0.5 during download (`downloading` state)
- Uses inline SVG download arrow icon (no external dependency)

---

## Compliance Verification

| Rule | Status |
|------|--------|
| No `<a download>` anywhere (D-08) | PASS — only in comment |
| `window.open('', '_blank')` called synchronously before await | PASS |
| `Promise.allSettled` for parallel fetch | PASS |
| `@page { size: A4` in generated HTML | PASS |
| Admin-only button render guard | PASS |
| TypeScript compilation | PASS (0 errors) |
| Production build | PASS (`built in 9.08s`) |

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Commits

| Task | Commit | Files |
|------|--------|-------|
| Task 1: findingDownload.ts | `201eaa3` | `src/utils/findingDownload.ts` (+189 lines) |
| Task 2: LegalFindingDetailPage download button | `2349a70` | `src/pages/LegalFindingDetailPage.tsx` (+39 lines) |

---

## Known Stubs

None. All four exported functions are fully implemented with real logic. The download button is wired to `openFindingReport(finding)`.

---

## Self-Check: PASSED
