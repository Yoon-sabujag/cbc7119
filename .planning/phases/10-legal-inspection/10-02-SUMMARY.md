---
phase: 10-legal-inspection
plan: "02"
subsystem: legal-inspection-frontend
tags: [frontend, react, tanstack-query, bottomsheet, photo-upload, typescript]
dependency_graph:
  requires: [legal-inspection-api]
  provides: [legal-inspection-ui, legal-page, legal-findings-page, legal-finding-detail-page]
  affects: [src/pages/LegalPage.tsx, src/pages/LegalFindingsPage.tsx, src/pages/LegalFindingDetailPage.tsx]
tech_stack:
  added: []
  patterns: [inline-style-components, tanstack-query-invalidation, url-searchparam-tab, bottomsheet-modal, usePhotoUpload-hook, admin-role-guard]
key_files:
  created: []
  modified:
    - cha-bio-safety/src/pages/LegalPage.tsx
    - cha-bio-safety/src/pages/LegalFindingsPage.tsx
    - cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
decisions:
  - "3개 쿼리 invalidation (legal-finding-detail, legal-findings, legal-inspections) — 조치완료 후 전체 UI 즉시 갱신"
  - "LegalFindingsPage 회차 요약 스트립: listInspections 공유 쿼리에서 id로 찾기 (별도 GET /api/legal/:id 불필요)"
  - "BottomSheet 점검 등록: admin 전용 PDF upload는 document.getElementById 방식으로 input[type=file] 트리거"
metrics:
  duration_seconds: 1025
  tasks_completed: 2
  tasks_total: 3
  files_created: 0
  files_modified: 3
  completed_date: "2026-04-02"
---

# Phase 10 Plan 02: Legal Inspection Frontend UI Summary

**One-liner:** 법적 점검 3단계 UI — 회차 카드 리스트(admin PDF+등록), 지적사항 목록(URL탭 필터+사진등록), 지적 상세(조치완료+3중 invalidation+admin수정)

---

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | LegalPage + LegalFindingsPage UI | 5dc8549 | LegalPage.tsx, LegalFindingsPage.tsx |
| 2 | LegalFindingDetailPage | 6b49c86 | LegalFindingDetailPage.tsx |

---

## What Was Built

### LegalPage.tsx (/legal)
- Self-header (48px, rgba(22,27,34,0.97)) with navigate(-1) back, admin-only "+ 점검 등록" button (var(--acl), 14px/700)
- useQuery(['legal-inspections']) via legalApi.listInspections()
- Loading: 3 skeleton cards (blink animation, bg3, h:88, borderRadius:12)
- Empty state: "법적 점검 기록 없음" + 안내 문구
- Error state: "목록을 불러오지 못했습니다."
- LegalInspectionCard: TypeBadge (종합정밀/작동기능) + ResultBadge (적합/조건부/부적합) + agency + inspectedAt + "지적 N건 · N건 완료" + PDF button (보고서 열기, window.open)
- CreateInspectionSheet (admin only): 점검유형 2-option toggle, inspectedAt date, agency text, 결과 3-option toggle, memo textarea, PDF upload (accept=".pdf,application/pdf") → useMutation legalApi.createInspection → invalidateQueries(['legal-inspections'])

### LegalFindingsPage.tsx (/legal/:id)
- Self-header (48px) with navigate('/legal') back, all-staff "+ 지적 등록" button
- 회차 요약 스트립 (bg2, 56px): TypeBadge + inspectedAt + agency + ResultBadge (shared legalApi.listInspections query)
- 상태 필터 탭 (미조치/완료/전체): URL searchParam 'tab', 44px height, var(--acl) underline on active
- useQuery(['legal-findings', id]) via legalApi.listFindings(id)
- Client-side filter + sort: open first then resolved, within groups createdAt DESC
- FindingCard: description preview (2 lines overflow), location badge, StatusBadge, createdAt; left-border 2px (open=warn, resolved=safe)
- Empty states: 전체 탭 "지적사항 없음", 필터 탭 "해당 조건의 지적사항 없음"
- CreateFindingSheet (all staff): description textarea (required), location input (optional), usePhotoUpload photo button → useMutation legalApi.createFinding → invalidateQueries(['legal-findings', id], ['legal-inspections'])

### LegalFindingDetailPage.tsx (/legal/:id/finding/:fid)
- Self-header (48px) with navigate('/legal/:id') back, admin-only "수정" text link
- useQuery(['legal-finding-detail', fid]) via legalApi.getFinding(id, fid)
- Section 1 — 지적 내용: description (16px/700), location badge (rgba(255,255,255,0.05)), before-photo (maxHeight:240, objectFit:cover, borderRadius:8), createdBy+createdAt
- Section 2 — 조치 기록 (resolved only): resolutionMemo, after-photo, resolvedBy+resolvedAt
- Section 3 — 조치 입력 (open only): resolution memo textarea (bg3, minHeight:72), usePhotoUpload afterPhoto, fixed bottom CTA "조치완료로 변경" (48px, var(--acl))
- useMutation legalApi.resolveFinding → 3중 invalidation → toast.success('조치 완료로 변경되었습니다')
- 409 에러 처리: "이미 조치완료 상태입니다"
- EditFindingSheet (admin): description+location pre-filled → legalApi.updateFinding → invalidateQueries

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Known Stubs

None — all 3 pages are fully implemented.

---

## Self-Check: PASSED

Files modified/exist:
- cha-bio-safety/src/pages/LegalPage.tsx: FOUND (461 lines, legalApi.listInspections wired)
- cha-bio-safety/src/pages/LegalFindingsPage.tsx: FOUND (374 lines, legalApi.listFindings wired)
- cha-bio-safety/src/pages/LegalFindingDetailPage.tsx: FOUND (373 lines, legalApi.resolveFinding wired)

Commits:
- 5dc8549: FOUND (feat(10-02): LegalPage + LegalFindingsPage UI)
- 6b49c86: FOUND (feat(10-02): LegalFindingDetailPage)

Build: PASSED (npm run build succeeded)
