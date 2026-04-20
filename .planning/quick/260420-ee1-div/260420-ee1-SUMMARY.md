---
phase: 260420-ee1
plan: 01
type: quick
tags: [desktop, div, layout, ui]
requires:
  - useIsDesktop 훅 (기존)
  - /api/div/pressure, /api/div/logs (기존, 변경 없음)
provides:
  - DIV 페이지 데스크톱 마스터-디테일 레이아웃
  - 전체 포인트 워스트케이스 상태 요약(pointStatusList)
  - 상단 알림 배너 + 좌측 매트릭스 + 우측 상세 패널
affects:
  - cha-bio-safety/src/pages/DivPage.tsx
tech-stack:
  added: []
  patterns:
    - useIsDesktop 분기 early-return (ElevatorPage 패턴 준용)
    - 기존 useQuery/useMemo/useState 훅 그대로 공유 (모바일·데스크톱 공통)
key-files:
  created: []
  modified:
    - cha-bio-safety/src/pages/DivPage.tsx
decisions:
  - "모바일 renderDivDetail 건드리지 않고, 데스크톱 전용 차트 헬퍼(renderDesktopPressureChart)를 복사해서 추가 — 바텀시트 오버레이 제거 + W=600 고정 버전"
  - "내부 탭은 기존 tab 상태 재사용 → useQuery enabled 자동 트리거, 별도 훅/state 만들지 않음"
metrics:
  tasks: 2
  files_changed: 1
  lines_added: 503
  lines_removed: 2
  duration_min: 15
  completed: "2026-04-20"
requirements:
  - QUICK-260420-ee1
---

# Quick Task 260420-ee1: DIV 페이지 데스크톱 마스터-디테일 레이아웃 Summary

One-liner: 1024px 이상 뷰포트에서 DIV 페이지를 상단 알림 배너 + 좌 매트릭스(층×DIV) + 우 상세 패널 3-영역 마스터-디테일 레이아웃으로 렌더, 모바일 회귀 0.

## What Shipped

**Task 1 — 좌측 매트릭스 + 상단 배너 (`e7d1d0a`)**
- `useIsDesktop` import + `isDesktop` 변수 선언.
- `pointStatusList` useMemo: 34개 DIV 포인트별로 직전 기록 대비 1차/2차/세팅압 status(ok/warn/danger)를 계산하고 가장 심한 것을 worstKind·pct와 함께 선택.
- 파생값 `dangerList`, `warnList`, `okCount`.
- `renderDesktopLayout` 함수: 헤더 + 이상/주의 카운트 배너(칩 클릭 → setSelDiv) + 좌측 14행 × 4열 매트릭스.
- 매트릭스 셀: 상태색 배경 + 최근 기록 라벨(`최근 MM월초/말`), 해당없음은 `—`, 선택 셀은 `var(--acl)` 2px 보더로 강조.
- 하단 범례(정상/주의/이상/해당없음).
- 기존 모바일 return 앞에 `if (isDesktop) return <>{renderDesktopLayout()}</>` 분기 삽입.

**Task 2 — 우측 상세 패널 (`eb0b442`)**
- `renderDesktopRightPanel` 두 경로:
  - `selDiv === null`: 3-카운터 카드(정상/주의/이상) + 배수/오일 3카드(평균 간격/최근일) + 이상·주의 포인트 리스트(행 클릭 → setSelDiv).
  - `selDiv !== null`: 제목 + 연도 네비(압력 탭 한정) + ✕ + 내부 탭(압력 트렌드/챔버배수/탱크배수/오일) + 탭 콘텐츠.
- `renderDesktopPressureChart`: 모바일 차트 로직을 복사하되 바텀시트 래퍼 제거, `W = 600` 고정, SVG는 `overflowX: auto`로 가로 스크롤. 수치 테이블 포함.
- `renderDesktopLogTimeline`: div_id 기준 날짜 배열로 `IntervalBar` + 최근 20건 날짜 리스트 렌더.
- `closeDetail` 로직은 기존 그대로 유지(모바일 점검→DIV 진입 `navigate(-1)` 호환).

## Files Modified

- `cha-bio-safety/src/pages/DivPage.tsx` (+503 / -2)

## Verification

- `cd cha-bio-safety && npx tsc --noEmit` 통과(에러 0). Task 1 커밋 직후와 Task 2 커밋 직후 각각 실행.
- 모바일 렌더 경로(`renderPressureTab`, `renderLogTab`, `renderDivDetail`, 메인 `return ( ... )` JSX)는 한 줄도 수정하지 않음 → 회귀 0.
- 데스크톱/모바일 공용 훅 재배치: `useIsDesktop`은 기존 `useState`/`useQuery`/`useMemo` 순서에 영향 주지 않도록 `selDiv` 선언 바로 아래 삽입.

## Deviations from Plan

None — 플랜 그대로 실행.

추가 사항:
- `renderDesktopPressureChart`의 `div: DivPoint` 파라미터는 현재 바디에서 직접 사용되지 않음(차트는 `selHistory`를 기반으로 그리고 `selHistory`는 `selDiv` 변경 시 재fetch됨). 시그니처 일관성 유지 및 향후 확장(차트 제목 주입 등) 여지 확보를 위해 파라미터는 유지하고 `void div`로 noUnusedParameters 친화 처리.

## Manual Verification To-do (사용자)

`wrangler deploy --branch production` 후:
1. <1024px 뷰: 기존 4개 탭 UI 그대로 표시, 셀 클릭 시 기존 바텀시트 열림.
2. ≥1024px 뷰:
   - 헤더 아래 상단 배너에 이상/주의 카운트 + 칩 표시. 모두 정상일 때 "모든 포인트 정상" 텍스트.
   - 좌측: 14행 × 4열(층/#1/#2/#3), 미존재 포인트는 회색 대시, 상태별 배경색.
   - 우측 초기: 3-카운터 + 배수/오일 3카드 + 이상/주의 리스트.
   - 셀/배너 칩/리스트 row 클릭 → 우측이 상세 뷰로 전환, 압력 트렌드 기본 탭 3단 차트 표시.
   - 내부 탭 전환 시 배수/오일 쿼리가 자동 트리거되어 IntervalBar 렌더.
   - ✕ 클릭 → 통계 뷰 복귀.
3. 브라우저 리사이즈(1024 경계) 시 레이아웃 즉시 전환, `selDiv`/`tab`/`year` state 유지.

## Commits

| Hash      | Message                                            |
| --------- | -------------------------------------------------- |
| `e7d1d0a` | feat: DIV 페이지 데스크톱 마스터-디테일 레이아웃 좌측+배너 |
| `eb0b442` | feat: DIV 데스크톱 우측 상세 패널 (압력 차트/배수 타임라인) |

## Self-Check: PASSED

- `cha-bio-safety/src/pages/DivPage.tsx` 존재 (1081 lines).
- 커밋 `e7d1d0a`, `eb0b442` 모두 `git log`에 존재.
- 타입체크 통과.
