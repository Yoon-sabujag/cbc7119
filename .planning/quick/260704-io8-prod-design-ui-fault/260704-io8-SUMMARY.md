---
phase: quick-260704-io8
plan: 01
subsystem: panel-ui
tags: [panel, fire-alarm, prod-to-design, merge-events, fault-variant, live-card]
dependency_graph:
  requires: [e524b90a]  # 260702-1vw (design main HEAD at start)
  provides: [panelEvents.ts, PanelEventRow.tsx, FireAlarmHistoryPage.tsx, fault variant, Android live card fix]
  affects: [InspectionPage, DashboardPage, FireAlarmPage, App.tsx, api.ts, LivePanelImage]
tech_stack:
  added: []
  patterns: [prod-to-design-cp, ternary-wrapping, additive-props]
key_files:
  created:
    - cha-bio-safety/src/utils/panelEvents.ts
    - cha-bio-safety/src/components/PanelEventRow.tsx
    - cha-bio-safety/src/pages/FireAlarmHistoryPage.tsx
  modified:
    - cha-bio-safety/src/utils/api.ts
    - cha-bio-safety/src/App.tsx
    - cha-bio-safety/src/pages/InspectionPage.tsx
    - cha-bio-safety/src/components/panel/LivePanelImage.tsx
    - cha-bio-safety/src/pages/DashboardPage.tsx
    - cha-bio-safety/src/pages/FireAlarmPage.tsx
decisions:
  - "신규 3파일은 prod 원본 통짜 cp (drift 0, retype 없음)"
  - "DESKTOP_NO_NAV 가 아닌 DESKTOP_HEADER_HIDE 에 /fire-alarm-history 등록 (prod 실측 일치)"
  - "LivePanelImage 에 aspectClass/objectClass additive props — 기존 소비자 기본값으로 무영향"
  - "panelHistoryOpen ternary 로 기존 isPanel pane 전체를 else 브랜치로 감쌈"
metrics:
  duration: "~25min"
  completed: "2026-07-04"
  tasks: 4
  files: 9
---

# Phase quick-260704-io8 Plan 01: 화재수신반 prod→design UI 이관 Summary

**한 줄 요약:** prod 직접 진화된 화재수신반 UI(병합 이벤트 카드 + 전체 이력 페이지 + fault 풀스크린 + Android 라이브카드 fix)를 design/main 에 하이브리드 전략(신규 3파일 cp + 공유 6파일 의도 이식)으로 이관, `npm run build` 통과.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | api.ts fault 타입 + 신규 3파일 cp + App.tsx 라우트 | `2aec9355` | api.ts, panelEvents.ts(신규), PanelEventRow.tsx(신규), FireAlarmHistoryPage.tsx(신규), App.tsx |
| 2 | InspectionPage 병합 카드 + in-pane 전체 이력 | `4df43c86` | InspectionPage.tsx |
| 3 | DashboardPage 모바일 라이브카드 + LivePanelImage props | `54b769e2` | LivePanelImage.tsx, DashboardPage.tsx |
| 4 | FireAlarmPage fault variant + 최종 빌드 | `c4f3d0e6` | FireAlarmPage.tsx |

## Build Results

- Task 1 build: `npm run build` exit 0 (tsc+vite, 3346 modules)
- Task 2 build: `npm run build` exit 0
- Task 3 build: `npm run build` exit 0
- Task 4 build: `npm run build` exit 0 (final gate)

## Integrity Checks

- **functions/ 무변경:** `git status --short cha-bio-safety/functions` → 빈 출력
- **migrations/ 무변경:** `git status --short cha-bio-safety/migrations` → 빈 출력
- **FloorPlanPage.tsx 무변경:** `git status --short ...FloorPlanPage.tsx` → 빈 출력
- **mw4 iOS 그리드 무회귀:** `'auto auto auto auto minmax(125px, 1fr)'` 정확히 1회 존재 (DashboardPage.tsx)
- **데스크톱 오늘일정 h-[126px] 유지:** grep 2회 (컨테이너 + 주석)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. 신규 3파일은 prod 실데이터 의존이나 try/catch + 빈 배열 fallback 으로 API 미배포 시 graceful degrade.

## Threat Flags

None — src/ 전용 변경, 새 네트워크 엔드포인트/인증 경로 없음. /fire-alarm-history 는 기존 /fire-alarm 과 동일 인증 패턴(Auth wrapper) 사용.

## Self-Check

Files exist:
- cha-bio-safety/src/utils/panelEvents.ts: FOUND
- cha-bio-safety/src/components/PanelEventRow.tsx: FOUND
- cha-bio-safety/src/pages/FireAlarmHistoryPage.tsx: FOUND

Commits exist:
- 2aec9355: Task 1
- 4df43c86: Task 2
- 54b769e2: Task 3
- c4f3d0e6: Task 4

## Self-Check: PASSED
