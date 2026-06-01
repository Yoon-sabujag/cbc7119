---
phase: quick-260601-ehn
plan: "01"
subsystem: inspection
tags: [desktop, inspection, completion-count, refactor, bug-fix]
dependency_graph:
  requires: []
  provides: [computeCategoryCounts]
  affects: [DesktopInspectionView, mobile-category-grid]
tech_stack:
  added: []
  patterns: [shared-pure-function, single-source-of-truth]
key_files:
  modified:
    - cha-bio-safety/src/pages/InspectionPage.tsx
decisions:
  - "computeCategoryCounts 는 컴포넌트 밖 순수 함수로 정의해 모바일/데스크톱 양쪽이 동일 코드 경로를 공유"
  - "DesktopInspectionView 에 props 전달 방식 선택 — 부모가 이미 보유한 상태를 그대로 내려보내 추가 쿼리 없음"
  - "groupCounts 의 bad/caution/open 은 remediationApi.list(allRecords) 기준 유지 — 우측 내역 패널과 일관성"
metrics:
  duration: "~10min"
  completed: "2026-06-01"
  tasks_completed: 3
  files_modified: 1
---

# Phase quick-260601-ehn Plan 01: Desktop Inspection Card Completion Count Fix Summary

## One-liner

`computeCategoryCounts` 순수 함수 추출로 데스크톱 점검 카드 완료 집계(총개수·막대색)를 모바일 카테고리 그리드와 단일 코드 경로로 통일 — `isCpCompleted` 단일 진실원천 강제.

## What Was Done

### Problem
데스크톱 점검 관리 뷰(`DesktopInspectionView`)의 카테고리 카드가 `remediationApi.list` 레코드의 고유 위치 조합 수(`uniqueSites.size`)를 완료 수로 계산했다. 특별피난계단은 체크포인트 50개가 고유 위치 19개로 접혀 "점검완료 19" + 주황(38%) 막대로 표시됐고, 50개 모두 완료해도 절대 100%에 닿지 못했다.

### Solution
모바일 그리드의 인라인 per-category 완료 계산(유도등 마커·DIV/컴프 반월 사이클 포함)을 모듈 최상위 순수 함수 `computeCategoryCounts`로 추출하고, 모바일 그리드와 데스크톱 `groupCounts` 양쪽에서 동일 함수를 호출하도록 변경했다.

## Task Results

### Task 1 — computeCategoryCounts 추출 + 모바일 그리드 치환 (commit: 64e7200)
- `getCatBarClass` 직후(L125)에 `function computeCategoryCounts` 순수 함수 정의
- 유도등(glSchedDone → total or markerRecords 키 수), DIV/컴프(computeCardCompletion 반월 분기) 분기 캡슐화
- 모바일 카테고리 그리드(~L5202) 인라인 total/doneCnt 계산을 함수 호출로 치환
- `isGL` 변수는 `hasItems` 분기용으로 그대로 유지
- 렌더 결과(barClass/표시 문자열/allDone/hasItems) 의미적으로 동일 — 순수 리팩터링

### Task 2 — DesktopInspectionView props 추가 + groupCounts 교체 (commit: 637dfce)
- `DesktopInspectionView` props 시그니처에 5개 추가: `allCheckpoints / scheduleItems / markerRecords / monthRecordDates / glMarkerCount`
- 부모 early return 렌더 호출에서 5개 값 전달 (모든 hook이 early return 전에 실행됨)
- `groupCounts` useMemo: `total/completed` 를 `computeCategoryCounts` 결과로 교체
- `bad/caution/open` 은 `allRecords`(remediationApi.list) 기준 유지 — 우측 패널·배지 무변경
- useMemo deps 에 5개 추가 (`allCheckpoints, scheduleItems, markerRecords, monthRecordDates, glMarkerCount`)
- `uniqueSites` 기반 고유위치 계산 완전 제거

### Task 3 — 빌드 + 정적 검증 PASS
- `npx tsc --noEmit`: PASS (출력 없음)
- `npm run build`: PASS (87 modules, dist/sw.js 생성)
- `grep -n "computeCategoryCounts("` → L125(정의), L5202(모바일 그리드), L5790(데스크톱 groupCounts) — 2곳 호출 확인
- `grep -c "uniqueSites"` → 0 — 고유위치 계산 완전 제거 확인
- `getCatBarClass` 정의(L113~120) 미변경 확인

## Correctness Reasoning

### 특별피난계단 정정
- 이전: `total=records.length(가변)`, `completed=uniqueSites.size=19` → `getCatBarClass(레코드수, 19)` → 38% → 주황
- 이후: `total=cps.length=50`, `doneCnt=computeCardCompletion(50개 모두 당월 완료)=50` → `getCatBarClass(50,50)=100%` → `bg-safe-bar`(초록), 배지 `✓ 점검완료 50`

### 유도등
- `isGL=true`: `total=glMarkerCount`, `doneCnt = glSchedDone?total:markerRecords키수` — 모바일과 동일 식

### DIV / 컴프레셔
- `computeCardCompletion({ cps, monthRecordDates, today })` — 반월 윈도우 분기 — 모바일과 동일 식

### 모바일 무회귀
- `computeCategoryCounts` 의 isGL/유도등/DIV 분기는 기존 인라인 코드를 1:1 보존
- 렌더 이후 코드(barClass/allDone/hasItems/표시 문자열)는 한 줄도 변경하지 않음

## Deviations from Plan

None — 계획 그대로 실행됨.

## Known Stubs

없음.

## Threat Flags

없음 — 새로운 네트워크 엔드포인트, auth 경로, 스키마 변경 없음.

## Runtime Verification

런타임 시각 확인(특별피난계단 카드가 점검완료 50 + 초록으로 표시되는지)은 사용자 배포 검증 단계로 위임. 배포는 이 PLAN 범위 밖.

## Self-Check: PASSED

- `cha-bio-safety/src/pages/InspectionPage.tsx` 수정됨: FOUND
- commit 64e7200: FOUND (git log 확인)
- commit 637dfce: FOUND (git log 확인)
- `computeCategoryCounts` 호출 2곳: FOUND (L5202, L5790)
- `uniqueSites` 잔존 0: CONFIRMED
- tsc PASS: CONFIRMED
- build PASS: CONFIRMED
