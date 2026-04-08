---
phase: 21-documents-page-ui
verified: 2026-04-09T00:00:00Z
status: passed
score: 5/5 success criteria verified
re_verification: false
---

# Phase 21: Documents Page UI — Verification Report

**Phase Goal:** 사용자가 문서 관리 페이지에서 소방계획서·소방훈련자료를 업로드(admin)·다운로드(전체)·연도별로 조회할 수 있다
**Verified:** 2026-04-09
**Status:** passed
**Mode:** Initial verification (no prior VERIFICATION.md)
**UAT:** User approved (승인) on https://59a8fd89.cbc7119.pages.dev

## Goal Achievement — Observable Truths

| # | Success Criterion | Status | Evidence |
|---|-------------------|--------|----------|
| 1 | SideMenu "문서 관리" → DocumentsPage route exists | VERIFIED | `SideMenu.tsx:32-33` (`{ label: '소방계획서/훈련자료', path: '/documents' }`), `DesktopSidebar.tsx:11` ('/documents' in 문서 관리 section), `App.tsx:43` (`lazy(() => import('./pages/DocumentsPage'))`), `App.tsx:234` (`<Route path="/documents" element={<Auth><DocumentsPage /></Auth>} />`), `App.tsx:88` page-title map entry |
| 2 | All staff tap-once download of latest (iOS PWA compatible) | VERIFIED | `DocumentSection.tsx:263-394` hero card with onClick→`handleDownload(latest)`; `downloadBlob.ts:42-72` implements fetch+Bearer→Blob→`<a download>` programmatic click with 3s revoke delay — mirrors proven `LegalFindingsPage` iOS 16.3+ pattern (D-13). Role-independent (no isAdmin gate on hero card click). |
| 3 | admin-only upload with year/title + direct R2 upload with progress + immediate list refresh | VERIFIED | `DocumentSection.tsx:40,118-163` — upload button rendered only when `useAuthStore(s=>s.staff?.role==='admin')`. `DocumentUploadForm.tsx:206-272` year dropdown (currentYear+1..2020), title input with auto-prefill (`:101-103`), file picker. `:122-130` calls `runMultipartUpload` with onProgress. `:131` `queryClient.invalidateQueries({queryKey:['documents',type]})` on success → list refresh. `multipartUpload.ts` orchestrates create/uploadPartRaw/complete (10MB parts sequential). Progress bar with %/MB·s/ETA at `:275-322`. |
| 4 | Year-by-year history selection for both types | VERIFIED | `DocumentSection.tsx:114-115` (`const latest = data[0]; const history = data.slice(1)`), `:397-514` 과거 이력 list renders each historical row as clickable (role=button, onClick→handleDownload). Server ordering `year DESC, uploaded_at DESC` (D-11) — trusted client-side. Both `plan` and `drill` share the same `DocumentSection` (D-05) via `DocumentsPage.tsx:62,77,80`. |
| 5 | Direct API call by non-admin blocked with 403 | VERIFIED | `_helpers.ts:42-48` `requireAdmin()` returns 403 when `ctx.data?.role !== 'admin'`. Applied in `[id].ts:47` (DELETE) and all multipart routes per Phase 20 D-18. Client mirror: `DocumentUploadForm.tsx:140-141` maps `ApiError.status===403` → '관리자만 업로드할 수 있습니다'. UAT note confirms assistant→403 observed. |

**Score: 5/5 success criteria verified**

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/pages/DocumentsPage.tsx` | Route container, tab mobile / 2-col desktop, upload shell | VERIFIED | 162 lines, both layouts wired, BottomSheet+Modal both render `DocumentUploadForm` |
| `src/components/DocumentSection.tsx` | Per-type list: hero + history + delete + upload btn | VERIFIED | 517 lines, React Query wired, admin delete button conditionally rendered |
| `src/components/DocumentUploadForm.tsx` | year/title/file + progress + cancel/retry + beforeunload | VERIFIED | 402 lines, all features present including 500MB cap and .pptx in ALLOWED |
| `src/utils/downloadBlob.ts` | Authenticated Blob download w/ Content-Disposition parse | VERIFIED | 72 lines, RFC 5987 filename* parsing + iOS-safe timing |
| `src/utils/multipartUpload.ts` | 10MB sequential orchestrator w/ 3s rolling speed | VERIFIED | create→parts→complete, abort signal wired |
| `src/utils/api.ts` documentsApi namespace | list/multipartCreate/Complete/Abort/remove + uploadPartRaw | VERIFIED | `api.ts:422-499`, `remove` added for DELETE endpoint |
| `functions/api/documents/[id].ts` | GET stream + DELETE (admin) | VERIFIED | GET with Content-Disposition UTF-8; DELETE soft-del D1 + hard-del R2 (best-effort) |
| `functions/api/documents/_helpers.ts` | allowed types incl .pptx, 500MB cap | VERIFIED | `.pptx` on line 10, `MAX_DOC_SIZE = 500 * 1024 * 1024` on line 16, `requireAdmin` on line 42 |
| `src/components/SideMenu.tsx` | 문서 관리 section entry | VERIFIED | `:32-33` |
| `src/components/DesktopSidebar.tsx` | /documents in 문서 관리 section | VERIFIED | `:11` |
| `src/App.tsx` | lazy route + page title map | VERIFIED | `:43,88,234` |

## Key Link Verification (Wiring + Data Flow)

| From | To | Via | Status |
|------|-----|-----|--------|
| SideMenu entry | DocumentsPage route | React Router `/documents` → lazy import | WIRED |
| DocumentsPage | DocumentSection × 2 types | Direct import + `type` prop | WIRED |
| DocumentSection | GET /api/documents?type | `useQuery(['documents',type], documentsApi.list)` | WIRED + data flows (D1-backed, not stub) |
| hero card onClick | downloadDocument | Direct call with Bearer token fetch | WIRED (Level 4 — real Blob stream) |
| history row onClick | downloadDocument | Same | WIRED |
| DocumentUploadForm | runMultipartUpload | `:122-130` | WIRED |
| runMultipartUpload | POST /documents/multipart/* | Via documentsApi + uploadPartRaw | WIRED (real part upload) |
| Upload success | queryClient.invalidateQueries | `:131` | WIRED → live list refresh (SC#3) |
| DocumentSection delete btn | DELETE /api/documents/{id} | `documentsApi.remove` → `[id].ts:46-79` | WIRED |
| Admin gate (client) | useAuthStore role | `DocumentSection.tsx:40` | WIRED |
| Admin gate (server) | requireAdmin in handlers | multipart/* + [id] DELETE | WIRED |

## Requirements Coverage

| Requirement | Source Plan | Status | Evidence |
|-------------|-------------|--------|----------|
| DOC-01: staff downloads latest 소방계획서 | 21-05 | SATISFIED | Hero card wired; UAT passed |
| DOC-02: admin uploads 소방계획서 with year/title | 21-05 | SATISFIED | Form + multipart; UAT passed |
| DOC-03: staff downloads past-year 소방계획서 | 21-05 | SATISFIED | History list wired |
| DOC-04: staff downloads latest 소방훈련자료 | 21-05 | SATISFIED | Same DocumentSection with type='drill' |
| DOC-05: admin uploads large (~130MB, actual ~250MB) 소방훈련자료 | 21-05 / 21-06 | SATISFIED | 500MB cap raised per user need; real 250MB .pptx UAT succeeded |
| DOC-06: staff downloads past-year 소방훈련자료 | 21-05 | SATISFIED | Same history path |
| DOC-07: R2 + D1 metadata (already Phase 20) | Phase 20 | SATISFIED | No regression — Phase 20 contract honored |

No orphaned requirements detected for Phase 21.

## Phase 20 API Contract Regression Check

All Phase 20 endpoints remain intact — Phase 21 **added** `DELETE /api/documents/{id}` to `[id].ts` alongside the existing `onRequestGet`. No existing GET/list/multipart signatures were altered:

- `_helpers.ts` preserved `validateFileType`, `buildR2Key`, `requireAdmin`, `MAX_DOC_SIZE`, `ALLOWED_FILE_TYPES` shape. `.pptx` **added** (backward compatible — any prior call with .pdf/.xlsx/.docx/.hwp/.zip still works). `MAX_DOC_SIZE` **raised** 200→500MB (backward compatible — all previously valid uploads still valid).
- `[id].ts` GET response shape unchanged (stream + Content-Type + Content-Length + Content-Disposition + Cache-Control).
- documentsApi client namespace is additive — `remove()` added, existing `list`/`multipartCreate`/`multipartComplete`/`multipartAbort` signatures unchanged.

No breaking changes.

## Scope Addition Review (D-23 → 500MB cap)

CONTEXT.md D-23 originally said "업로드 중 페이지 이탈 방지" — the "200MB 초과면 즉시 거부" appears in D-18 (form), not D-23. The 200MB cap decision was D-18's file field note. Phase 21 raised this to 500MB **with explicit user approval during UAT** because the real 소방훈련자료 is ~250MB. The raise is:

1. Documented in `_helpers.ts:15-16` comment ("raised from 200MB for large 소방훈련자료")
2. Mirrored client-side in `DocumentUploadForm.tsx:41` (`MAX_SIZE = 500 * 1024 * 1024`) with matching toast "파일 크기가 500MB를 초과합니다"
3. Validated by a **real** 250MB .pptx upload in UAT (not synthetic)
4. Captured as a known non-issue: iOS PWA Blob memory for >300MB is best-effort; user accepted the risk.

The scope addition does not contradict a locked CONTEXT decision — it **overrides** D-18's 200MB constraint with explicit user instruction, which is the correct path for mid-UAT requirement changes. Same pattern applies to `.pptx` (added to D-18's accept list) and admin delete (D-26 area — was deferred in CONTEXT §deferred "삭제 UI — v1.5+", now brought forward per user request).

## Smoke Test Cleanup Verification

CONTEXT required Phase 20 smoke test document to be cleaned up:

```
D1: id=1, filename='smoke-test.pdf', deleted_at='2026-04-08 22:13:31'
```

Verified via remote D1 query. `deleted_at` is set — soft-delete convention observed. R2 key was hard-deleted per 21-06 SUMMARY (`documents/plan/2026/ZREQdogaySV4meW8Uo7Pe_smoke-test.pdf` removed via wrangler). The list endpoint filters `deleted_at IS NULL` so the smoke-test doc no longer appears in user-facing lists. Cleanup complete — not just renamed.

## Anti-Pattern Scan

No TODO/FIXME/placeholder/stub patterns in Phase 21 files. No `return null` or empty handlers. All event handlers call real APIs. Inline hardcoded `[]` in state initializers are populated by React Query fetches before render (correctly identified as initial state, not stubs).

## Behavioral Spot-Checks

| Behavior | Check | Result |
| -------- | ----- | ------ |
| Smoke test cleanup | Remote D1 query for id=1 | PASS (deleted_at set) |
| .pptx whitelisted | grep `_helpers.ts` line 10 | PASS |
| 500MB cap backend | grep `_helpers.ts` line 16 | PASS |
| 500MB cap frontend | grep `DocumentUploadForm.tsx:41` | PASS |
| DELETE endpoint admin-gated | `[id].ts:47` requireAdmin first | PASS |
| Route protected by Auth wrapper | `App.tsx:234` `<Auth>` wraps | PASS |
| Invalidation on upload success | `DocumentUploadForm.tsx:131` | PASS |

Human UAT (20-item checklist + 3 scope-added validations) already executed by user with approval — no additional human verification items required.

## Gaps Summary

None. All five Success Criteria are directly observable in the codebase and each traces to a live, wired, data-flowing implementation. Requirements DOC-01..06 are satisfied, DOC-07 is unchanged from Phase 20. The Phase 20 API contract is preserved. The three mid-UAT scope additions are intentional, user-approved, and mechanically sound. The smoke test document from Phase 20 verification is properly cleaned up in both D1 (soft-delete) and R2 (hard-delete).

---

_Verified: 2026-04-09_
_Verifier: Claude (gsd-verifier)_
