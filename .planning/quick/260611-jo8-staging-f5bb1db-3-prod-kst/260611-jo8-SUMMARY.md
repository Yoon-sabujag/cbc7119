---
phase: 260611-jo8-staging-f5bb1db-3-prod-kst
plan: "01"
subsystem: frontend/photo-upload, frontend/schedule, frontend/inspection-session
tags: [stability, photo-vault, monthly-clamp, kst-session, staging-sync]
dependency_graph:
  requires: []
  provides: [STABILITY-PHOTO-GUARD, STABILITY-MONTH-CLAMP, STABILITY-KST-SESSION]
  affects: [InspectionPage, FloorPlanPage, LegalPage, SchedulePage, generateMonthlyPlan]
tech_stack:
  added: [photoVault.ts (IndexedDB photo vault)]
  patterns: [PhotoUploadFailedError throw-on-partial-fail, vaultScope per-hook, todayKstYmd KST date, monthEnd YMD clamp]
key_files:
  created:
    - cha-bio-safety/src/utils/photoVault.ts
  modified:
    - cha-bio-safety/src/components/FindingEditModal.tsx
    - cha-bio-safety/src/components/FindingFormSheet.tsx
    - cha-bio-safety/src/components/PhotoButton.tsx
    - cha-bio-safety/src/components/PhotoGrid.tsx
    - cha-bio-safety/src/components/PhotoSourceModal.tsx
    - cha-bio-safety/src/hooks/useMultiPhotoUpload.ts
    - cha-bio-safety/src/hooks/usePhotoUpload.ts
    - cha-bio-safety/src/pages/FloorPlanPage.tsx
    - cha-bio-safety/src/pages/InspectionPage.tsx
    - cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
    - cha-bio-safety/src/pages/LegalPage.tsx
    - cha-bio-safety/src/pages/SchedulePage.tsx
    - cha-bio-safety/src/utils/generateMonthlyPlan.ts
decisions:
  - "PhotoUploadFailedError throw pattern: partial upload failure blocks save and shows toast, not silent drop"
  - "IndexedDB vault (photoVault.ts) caches originals immediately on attach for retry after failure/navigation"
  - "vaultScope string per hook instance prevents cross-page vault key collisions"
  - "todayKstYmd() replaces new Date().toISOString().slice(0,10) for midnight-UTC-crossing safety"
  - "monthEnd YMD clamp in generateMonthlyPlan + SchedulePage MonthlyPlanPreview mirrors stats.ts pattern"
metrics:
  duration: "~15 min"
  completed: "2026-06-11"
  tasks_completed: 3
  files_changed: 14
---

# Phase 260611-jo8 Plan 01: 안정성 3종 prod 이관 Summary

**One-liner:** staging cbc7119-data f5bb1db 의 사진 업로드 실패 가드+IndexedDB 보관함, 월 경계 일정 YMD 클램프, KST 세션 날짜 귀속 3종을 prod cha-bio-safety 에 byte-동등 이관.

## What Was Done

### Task 1: patch A 적용 + photoVault 신규 생성
`git apply --directory=cha-bio-safety` 로 patch A 를 worktree 에 적용. 13파일 수정 + `src/utils/photoVault.ts` 신규 생성. `.rej` 0개, 종료코드 0.

### Task 2: LegalPage.tsx 수동 4지점 Edit
patch hunk 컨텍스트 불일치로 자동 적용 불가한 LegalPage.tsx 4지점을 수동 Edit:
- (a) import 에 `PhotoUploadFailedError` 추가
- (b) `useMultiPhotoUpload('legal-finding-resolution')` scope 인자 추가
- (c) `onError` 핸들러를 `PhotoUploadFailedError instanceof` 분기 처리로 확장
- (d) `PhotoSourceModal` 에 `restoreCount` + `onRestore` prop 추가

### Task 3: grep 전수 게이트 PASS + atomic commit
전체 grep 게이트 결과:
- 사진 실패 가드: InspectionPage 12 / FloorPlanPage 3 PASS
- usePhotoUpload scope: inspection 9+1+1 (InspectionPage), 1+1+1 (FloorPlanPage) PASS
- useMultiPhotoUpload scope: legal-finding 2, legal-finding-resolution 3 PASS
- todayKstYmd: FloorPlanPage 3, InspectionPage 2 PASS; toISOString().slice(0,10) FloorPlanPage 0 PASS
- restoreCount prop: 7곳 PASS
- LegalPage PhotoUploadFailedError: 2 PASS
- monthEnd 양쪽 파일 존재 PASS; padStart >= 1 PASS
- bcPhotoKey (L1941) < 첫 submitRecord (L1964) PASS
- RemediationDetailPage diff 미등장 PASS

**Commit:** `1dc8450` — 14파일 변경(소스 13 수정 + LegalPage 수정) + photoVault.ts 신규, 단일 atomic

## Deviations from Plan

None - plan executed exactly as written.

**Note:** patch 를 최초 main repo working tree(`/Users/jongyupyoon/Documents/20260328`)에 적용했다가 worktree 와 별개임을 인지하고 main repo 변경을 `git checkout --` 으로 복구한 후 worktree 에 재적용. 기능 결과에 영향 없음.

## Known Stubs

None.

## Threat Flags

None — 변경 범위는 프론트엔드 클라이언트 사이드 전용 (IndexedDB, React hooks, UI 컴포넌트). 새로운 네트워크 엔드포인트 / auth 경로 / 파일 접근 / 스키마 변경 없음.

## Self-Check

**Files exist:**
- `cha-bio-safety/src/utils/photoVault.ts` — FOUND (via git show HEAD)
- `cha-bio-safety/src/pages/LegalPage.tsx` — FOUND (modified in commit)

**Commit exists:**
- `1dc8450` — FOUND

## Self-Check: PASSED
