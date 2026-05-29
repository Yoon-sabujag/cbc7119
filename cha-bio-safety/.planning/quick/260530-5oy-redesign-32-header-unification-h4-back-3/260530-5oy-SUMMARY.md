---
phase: 260530-5oy-redesign-32-header-unification-h4-back-3
plan: "01"
subsystem: redesign/32-header-unification-h4
tags: [redesign, header-unification, mobile, WorkShiftPage, AnnualPlanPage, SchedulePage]
dependency_graph:
  requires: [H1, H1.5, H2, H3]
  provides: [H4-mobile-header-32]
  affects: [WorkShiftPage, AnnualPlanPage, SchedulePage]
tech_stack:
  added: []
  patterns: [h-12 container + w-7/h-7 back + h-7 action, inline-flex items-center for button-height alignment]
key_files:
  created: []
  modified:
    - src/pages/WorkShiftPage.tsx
    - src/pages/AnnualPlanPage.tsx
    - src/pages/SchedulePage.tsx
decisions:
  - "위치 조정 토글: py-[6px] → h-7 + inline-flex items-center (기존 items-center 없었으므로 h-7 단독 시 baseline 깨짐)"
  - "SchedulePage L579 back: 이미 w-7 h-7 표준 — 무수정 (verify gate 로만 확인)"
metrics:
  duration: "~5 minutes"
  completed: "2026-05-30T04:12:44+09:00"
  tasks_completed: 1
  files_modified: 3
---

# Phase 260530-5oy Plan 01: redesign/32-header-unification-h4 (H4) Summary

**One-liner:** 근무표·연간업무추진계획·일정 모바일 헤더 컨테이너(h-12) + back(w-7 h-7) + 액션버튼(h-7) 32px 통일 — 8 곳 정확 변경, 캘리브 좌표·데스크톱 분기 0 byte 변경.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | 3 페이지 모바일 헤더 컨테이너 + back + 액션 세로 32 통일 (단일 atomic, 8 곳) | f2ae71d | WorkShiftPage.tsx, AnnualPlanPage.tsx, SchedulePage.tsx |

## Changes Made

### WorkShiftPage.tsx (3 곳)
- L90 컨테이너 모바일 분기: `pt-2 px-3 pb-[9px] gap-2` → `h-12 px-3 gap-2`
- L95 back 버튼: `w-[34px] h-[34px]` → `w-7 h-7`
- L104 엑셀 저장: `h-[34px]` → `h-7`
- 데스크톱 분기 `h-[54px] px-5 gap-2.5` 0 byte 변경 (H5 wave 책임)

### AnnualPlanPage.tsx (3 곳)
- L132 컨테이너: `pt-2 px-3 pb-[9px] gap-2` → `h-12 px-3 gap-2`
- L135 back 버튼: `w-[34px] h-[34px]` → `w-7 h-7`
- L142 위치 조정 토글: `py-[6px]` → `h-7 inline-flex items-center` (items-center 추가 필수)
- yearPos 캘리브 좌표 시그니처 0 byte 변경

### SchedulePage.tsx (2 곳)
- L576 컨테이너: `pt-2 pb-[9px]` → `h-12`
- L587 엑셀 다운로드: `py-1.5` → `h-7`
- L579 back (w-7 h-7 기존 표준) 0 byte 변경

## Deviations from Plan

None — plan executed exactly as written.

## Preserved (0 byte)
- WorkShift 데스크톱 분기 `h-[54px] px-5 gap-2.5`
- AnnualPlan 캘리브 좌표 시그니처 (`yearPos.x/y`)
- SchedulePage L579 back (`w-7 h-7 flex-shrink-0 ...`)
- ChevronLeft size=15 (3 파일), strokeWidth=2 (Schedule), Download size=13
- text-text-secondary (3 파일 ChevronLeft className)
- 타이틀 텍스트 / 액션 텍스트 / conditional logic / onClick / disabled

## Known Stubs

None.

## Threat Flags

None — pure CSS class swap, no new network surface.

## Self-Check: PASSED

- f2ae71d exists: FOUND
- src/pages/WorkShiftPage.tsx modified: FOUND
- src/pages/AnnualPlanPage.tsx modified: FOUND
- src/pages/SchedulePage.tsx modified: FOUND
- Build: vite build PASS (14.89s, TypeScript 0 error)
- Grep gates: all 8 new patterns present, all old patterns removed
- yearPos preserved, desktop branch preserved, L579 back preserved
