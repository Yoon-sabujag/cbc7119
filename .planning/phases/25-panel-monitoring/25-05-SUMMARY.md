---
phase: 25-panel-monitoring
plan: 05
subsystem: ui
tags: [react, react-query, panel-monitoring, fire-alarm, desktop, pinch-zoom, deep-link, takeover-modal]

# Dependency graph
requires: [25-01, 25-03]
provides:
  - DesktopInspectionView 화재수신반 3분할 상세 pane (id-head 점검모드 토글 + biglive + 48h events + 3-state form)
  - 데스크톱 경보중 저장 = alarmApi.resolve (칩 소멸) vs 평상시 = fireAlarmApi.create
  - 데스크톱 경보 takeover 모달 (.alarm-modal, dash view only) + 줌 오버레이 (.zoom, usePinchZoom 2.2×)
  - useSearchParams 딥링크 (panel=fire-alarm -> 카테고리 자동선택 / zoom=1 -> 줌 오버레이)
affects: [25-06 sw-push]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "우측 pane 첫 분기 isPanel = CATEGORY_GROUPS[idx].categories.includes('화재수신반') -> fire-alarm detail pane before recordId/list branches"
    - "데스크톱 early-return 대비 useSearchParams effect 로 딥링크 자동열기 (모바일 FireAlarmModal 마운트 전에 return 되므로 필수)"
    - "renderPanelFields(isAlarm) 공용 5필드 렌더러 — 경보중 need-border/auto tag 데코만 분기"
    - "absolute inset-0 overlays 를 DesktopInspectionView 컨테이너(relative)에 pin (safe-area 불필요 — 데스크톱)"

key-files:
  created: []
  modified:
    - cha-bio-safety/src/pages/InspectionPage.tsx

key-decisions:
  - "경보중 '조치완료 후 저장' = alarmApi.resolve(activeAlarm.id,...) — 신규 create 아님 (그래야 /alarm/active 에서 빠져 대시보드 칩 소멸)"
  - "id-head 점검모드 토글이 '정상 라이브' pill 과 '전체화면' 버튼을 대체 (둘 다 미렌더) — 헤더 아래 red banner 없음, 경보는 live-red + draft-notice 로만 표시"
  - "takeover 모달은 dash view (categoryIdx === null) + activeAlarm + !alarmAcked 3조건 AND 로만 렌더; ack 은 로컬 state + alarmApi.ack 낙관적"
  - "줌 오버레이는 usePinchZoom({maxScale:2.2, doubleTapScale:2.2}) — 더블클릭/휠 2.2× 확대, '핀치 투 줌' 힌트 텍스트 제거 (CONTEXT/Surface 6)"

patterns-established:
  - "데스크톱 3분할 우측 pane 의 카테고리별 special-case 분기 (첫 분기로 삽입)"
  - "Semantic token classes + 데스크톱 live-status = text-body-sm(14px) (모바일 text-caption 과 구분)"

requirements-completed: [PANEL-UI-06, PANEL-UI-04]

# Metrics
duration: ~20min
completed: 2026-07-01
---

# Phase 25 Plan 05: 데스크톱 일반점검 3분할 화재수신반 상세 pane Summary

**DesktopInspectionView 우측 pane 에 화재수신반 첫 분기를 추가해 3분할 상세 pane 을 렌더 — id-head 점검모드 토글(정상라이브 pill + 전체화면 버튼 대체) + biglive(클릭 -> 줌) + 48h 이벤트 + 3-state 폼(경보중 alarmApi.resolve 로 칩 소멸 / 평상시 fireAlarmApi.create) + dash-view 전용 경보 takeover 모달 + usePinchZoom 2.2× 줌 오버레이(핀치 텍스트 제거), 그리고 데스크톱 early-return 을 우회하는 useSearchParams 딥링크(panel=fire-alarm 자동선택 / zoom=1 오버레이).**

## Performance
- **Duration:** ~20 min
- **Completed:** 2026-07-01
- **Tasks:** 3
- **Files modified:** 1 (InspectionPage.tsx, +429/-4)

## Accomplishments
- **Task 1 — 분기 + id-head + biglive + events (54239357):** DesktopInspectionView 에 `isPanel = categoryIdx !== null && CATEGORY_GROUPS[categoryIdx].categories.includes('화재수신반')` 파생 + 우측 pane 첫 분기 삽입(`isPanel ? (...) : recordId && detail ? ...`). 로컬 panel/alarm/events 쿼리(try/catch -> 평상시 폴백), `panelMode` 파생, id-head(BellRing 타이틀 + ChevronLeft w-7=32 백 + 점검모드 토글 38×22 스위치), biglive(aspect-video rounded-t-[14px] + LivePanelImage + LIVE/화재 dot + live-status text-body-sm 14px + 클릭 -> `setPanelZoomOpen(true)`), evt-card(84×48 ethumb + badge2 감지중/설비동작/비화재보, 점검모드 조회 유지). **FLAG-1**: `useSearchParams` effect 로 `panel=fire-alarm` -> `setCategoryIdx(FIRE_ALARM_IDX=findIndex...)` + `setRecordId(null)`, `zoom=1` -> `setPanelZoomOpen(true)`.
- **Task 2 — 3-state 폼 + resolve/create (0634827c):** id-body 스택 순서대로 maint-autonote(점검모드 only, RefreshCw, biglive 위) / panel-notice(경보중 only, danger blink dot) + auto-draft form-card(.fh AlertTriangle '자동 생성 초안 — 보완 필요') / 수기 form-card(평상시 only, Plus '수동 기록 추가'). 공용 `renderPanelFields(isAlarm)` 로 5필드(구분/발생일시/장소/원인/조치) 렌더, 경보중은 need-border + 자동선택/자동 tag. 저장 2분기: 경보중 -> `alarmApi.resolve(activeAlarm.id,{type,occurredAt,location,cause,action})` + invalidate `['alarm-active','fire-alarm-recent']` (칩 소멸); 평상시 -> `fireAlarmApi.create` + invalidate `['fire-alarm-recent']`. maint 토글은 409 `active_alarm_requires_confirm` -> confirm -> `confirmAlarm:true` 재시도. 헤더 아래 red banner 없음.
- **Task 3 — takeover 모달 + 줌 오버레이 (311b5889):** `.alarm-modal absolute inset-0 z-[90]` (dash view + activeAlarm + !alarmAcked): radial red bg + `.am-card` 560px blur + Flame 44 faring + am-kind(24px)/am-loc(46px)/am-time(mono)/am-sub, foot `확인 (경보 인지)` -> ack / `화재수신반 페이지` -> pane open + ack, am-note verbatim('...20초 × 3회 재발송'). `.zoom absolute inset-0 z-[95]` (biglive 클릭): zoom-badge LIVE/화재 dot + zoom-close X + `zoom-frame aspect-video` + `usePinchZoom({maxScale:2.2, doubleTapScale:2.2})` wrapping LivePanelImage, **'핀치 투 줌' 텍스트 제거**. 컨테이너 root 에 `relative` 추가(overlay pin).

## Task Commits
1. **Task 1: 상세 pane 분기 + id-head + biglive + 48h events + FLAG-1 딥링크** - `54239357` (feat)
2. **Task 2: 3-state 폼 + resolve/create 저장 분기 + panel-notice + maint-autonote** - `0634827c` (feat)
3. **Task 3: 경보 takeover 모달 + 줌 오버레이 (usePinchZoom 2.2×, 힌트 텍스트 없음)** - `311b5889` (feat)

## Files Created/Modified
- `cha-bio-safety/src/pages/InspectionPage.tsx` - DesktopInspectionView 에 화재수신반 상세 pane(분기 + id-head + biglive + evt-card + 3-state form) + takeover 모달 + 줌 오버레이 + useSearchParams 딥링크 effect + renderPanelFields 헬퍼. 기존 imports 재사용(panelApi/alarmApi/type Alarm/LivePanelImage/freshnessLabel/usePinchZoom/BellRing/BellOff/Maximize2/AlertTriangle/RefreshCw/Flame/ChevronLeft/Plus/X), 신규 import: useSearchParams(react-router-dom).

## Decisions Made
- 경보중 저장을 resolve 로 고정(create 아님) — 25-01/25-03 의 resolve≠create 계약 준수, 대시보드 칩 소멸 보장.
- id-head 토글이 pill+전체화면 버튼을 대체(둘 다 미렌더), 헤더 아래 red banner 없음 — UI-SPEC Surface 6 Rules.
- 데스크톱은 InspectionPage 가 DesktopInspectionView 를 early-return 하므로 25-03 의 모바일 FireAlarmModal 딥링크 핸들러가 이 pane 을 열지 못함 -> DesktopInspectionView 내부에 자체 useSearchParams effect 필수(FLAG-1).
- renderPanelFields(isAlarm) 공용 헬퍼로 경보중/평상시 폼 필드 중복 제거, 상태(paType 등)는 공유.

## Deviations from Plan
None functional. 한 가지 게이트 조정: Task 3 초안 코멘트에 "핀치 투 줌"(제거 대상 문구) 을 그대로 적어 emoji/pinch-absent grep 게이트가 실패 -> 코멘트를 "줌 힌트 텍스트 없음" 으로 수정해 통과(동작 무변경). 모든 카피는 Copywriting Contract verbatim.

## Issues Encountered
None. `npx tsc --noEmit` 각 task 후 프로젝트 전역 clean.

## User Setup Required
None. 백엔드 `/api/panel/*`, `/api/alarm/*` 는 이 디자인 트랙(cbc7119-preview)에 의도적으로 미배포 -> 모든 쿼리 평상시 폴백. cbc7119-preview 데스크톱에서 화재수신반 선택 -> 3분할 pane(평상시/경보중/점검모드) + biglive 클릭 -> 줌 오버레이 + dash view 경보 takeover 시각 검수는 사용자 몫.

## Verification
- `cd cha-bio-safety && npx tsc --noEmit` — clean (각 task 후).
- grep present: `includes('화재수신반')`, `imode-switch`, `조치완료 후 저장`, `자동 생성 초안`, `수동 기록 추가`, `alarmApi.resolve`, `alarm-modal`, `확인 (경보 인지)`, `zoom-frame`, `zoom-close`, `usePinchZoom`, `useSearchParams`, `findIndex(g => g.categories.includes('화재수신반'))`, `setPanelZoomOpen(true)`.
- grep absent: `핀치 투 줌` (0건).
- Emoji/arrow-zero on all changed lines (· middot / × U+00D7 는 verbatim 카피, 이모지/화살표 아님).
- Scope: 커밋 3건 모두 InspectionPage.tsx 만 수정 (DashboardPage/App.tsx/FireAlarmPage 무변경).
- 25-03 모바일 FireAlarmModal 무회귀 (별도 함수 영역, diff 없음).

## Self-Check: PASSED
