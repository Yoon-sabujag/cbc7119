---
phase: 21
plan: 02
subsystem: documents-ui
tags: [utility, download, auth, ios-pwa]
requires: [authStore, /api/documents/{id}]
provides: [downloadDocument, parseContentDispositionFilename]
affects: [cha-bio-safety/src/utils/downloadBlob.ts]
tech-stack:
  added: []
  patterns: [authenticated-blob-download, rfc5987-content-disposition]
key-files:
  created:
    - cha-bio-safety/src/utils/downloadBlob.ts
  modified: []
decisions:
  - "Verbatim snippet from 21-RESEARCH.md copied into downloadBlob.ts per plan"
metrics:
  duration: "~2m"
  tasks: 1
  files: 1
  completed: 2026-04-09
---

# Phase 21 Plan 02: downloadBlob utility Summary

Authenticated Blob download helper (`downloadDocument` + `parseContentDispositionFilename`) extracted as reusable utility, mirroring LegalFindingsPage iOS PWA pattern with 3s revoke delay.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create downloadBlob.ts | 2161b60 | cha-bio-safety/src/utils/downloadBlob.ts |

## Implementation Notes

- File content copied verbatim from plan `<action>` block
- `parseContentDispositionFilename` handles RFC 5987 `filename*=UTF-8''` (preferred), quoted `filename="..."`, and bare `filename=...` fallbacks
- `downloadDocument(id, fallback)` fetches `${BASE}/documents/${id}` with `Authorization: Bearer <token>` from `useAuthStore`
- 401 → `logout()` + redirect `/login`; other non-OK → throws `Error('다운로드 실패 (status)')`
- Programmatic `<a download>` click with `document.body.appendChild/removeChild`
- `setTimeout(() => URL.revokeObjectURL(url), 3000)` matches LegalFindingsPage.tsx:500 timing for iOS Files save sheet
- `tsc --noEmit` passed (no errors)

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- File exists: `cha-bio-safety/src/utils/downloadBlob.ts`
- `export async function downloadDocument`: present
- `export function parseContentDispositionFilename`: present
- `a.download = filename`: present
- `filename*` regex: present
- `setTimeout(... 3000)` revoke: present
- `npx tsc --noEmit`: exit 0

## Self-Check: PASSED

- FOUND: cha-bio-safety/src/utils/downloadBlob.ts
- FOUND commit: 2161b60
