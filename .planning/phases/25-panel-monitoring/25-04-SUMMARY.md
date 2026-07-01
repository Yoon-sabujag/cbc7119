---
phase: 25-panel-monitoring
plan: 04
subsystem: ui
tags: [react, react-query, panel-monitoring, alarm, fullscreen-takeover, push-destination, routing]

# Dependency graph
requires: [25-01]
provides:
  - FireAlarmPage (/fire-alarm) 경보 풀스크린 takeover + ACK
  - /fire-alarm route registered + chrome-hidden on both mobile and desktop
affects: [25-06 sw-push]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Push-destination fullscreen route: fixed inset-0 pinned to safe-area, chrome hidden via BOTH no-nav lists"
    - "Optimistic ACK: alarmApi.ack wrapped try/catch so undeployed endpoint never blocks the navigate flow"
    - "getActive try/catch->null via react-query -> neutral 상황 종료 state instead of crash"

key-files:
  created:
    - cha-bio-safety/src/pages/FireAlarmPage.tsx
  modified:
    - cha-bio-safety/src/App.tsx

key-decisions:
  - "This plan owns ALL App.tsx edits for phase 25 (lazy + route + both no-nav lists); 25-03/25-05 stay InspectionPage-only to avoid file conflicts"
  - "/fire-alarm added to BOTH MOBILE_NO_NAV_PATHS and DESKTOP_NO_NAV_PATHS — forgetting desktop would leave the 280px sidebar over the takeover"
  - "Route mirrors /inspection with the Auth wrapper so push-tap unauth users are redirected to login"
  - "Scroll-lock uses overflow:hidden + touchmove block (SideMenu pattern), never body.position:fixed (safe-area regression guard)"

patterns-established:
  - "Fullscreen alarm takeover pinned top:var(--sat)/bottom:var(--sab), oversize text-[40px]/[30px] for lock-screen legibility"

requirements-completed: [PANEL-UI-03]

# Metrics
duration: ~8min
completed: 2026-07-01
---

# Phase 25 Plan 04: 경보 풀스크린 (FireAlarmPage) Summary

**A new `/fire-alarm` fullscreen takeover (fire=red+Flame / equip=green+Settings) that is the push-tap destination — '확인' ACK stops fire re-push and routes to 화재수신반, or closes equip to the dashboard — wired into App.tsx with the route hidden from chrome on both mobile and desktop.**

## Performance

- **Duration:** ~8 min
- **Completed:** 2026-07-01
- **Tasks:** 2
- **Files modified:** 2 (1 created, 1 modified)

## Accomplishments
- `FireAlarmPage.tsx` renders a full-bleed `fixed inset-0` stage pinned to the safe-area (`top:var(--sat)`/`bottom:var(--sab)`), with a dimmed `LivePanelImage` background and a radial wash overlay — fire branch blinks (`fawash 1.3s`) with a pulsing icon ring (`faring`), equip branch is static.
- fire variant: `Flame` (red `#ef4444`), "화재 발생", ACK note "확인을 눌러야 추가 푸시가 멈춥니다"; equip variant: `Settings` (green `#22c55e`), "설비 동작", "정보성 알림 · 확인 시 닫힘 (재발송 없음)". Copy verbatim from the Copywriting Contract.
- `확인` calls `alarmApi.ack(id)` optimistically (try/catch); fire then `navigate('/inspection?panel=fire-alarm')`, equip `navigate('/dashboard')`. Active alarm resolved via `alarmApi.getActive()` (`['alarm-active']`, try/catch->null, retry:false) with an optional `?id=` search-param override.
- Graceful degradation: no active alarm -> neutral "경보 없음 · 상황 종료" state with a 닫기 button; undeployed endpoint never crashes the tree.
- App.tsx (owned solely by this plan): lazy `FireAlarmPage`, `<Route path="/fire-alarm">` mirroring `/inspection` under `Auth`, and `'/fire-alarm'` added to BOTH `MOBILE_NO_NAV_PATHS` and `DESKTOP_NO_NAV_PATHS` so the mobile nav and the desktop 280px sidebar/header are both hidden.

## Task Commits

Each task committed atomically:

1. **Task 1: FireAlarmPage.tsx fire/equip takeover + ACK** - `ac71057e` (feat)
2. **Task 2: /fire-alarm route + no-nav (mobile + desktop)** - `a449e40a` (feat)

## Files Created/Modified
- `cha-bio-safety/src/pages/FireAlarmPage.tsx` - Fullscreen 경보 풀스크린 takeover with fire/equip states + ACK
- `cha-bio-safety/src/App.tsx` - Lazy import + `/fire-alarm` Auth route + no-nav registration in both platform lists

## Decisions Made
- Concentrated all phase-25 App.tsx edits here to keep 25-03/25-05 InspectionPage-only and avoid merge conflicts on App.tsx.
- Registered `/fire-alarm` in both no-nav arrays deliberately; the desktop sidebar is separate chrome and would otherwise overlap the takeover.
- Kept ACK optimistic and alarm queries try/catch-wrapped because the backend `/api/alarm/*` is intentionally undeployed on this design track.

## Deviations from Plan

None functional. The `LivePanelImage` background is rendered with `frameUpdatedAt={null}` (degrades to its own gray placeholder) exactly as the plan specified passing `undefined` for `snapshotKey`; on this design track there is no live frame, so the wash overlay carries the visual. No emoji or arrow characters used (ASCII `->` in Korean comments per the emoji-zero gate).

## Issues Encountered
None. `npx tsc --noEmit` clean; emoji-zero grep matches nothing on the new file; `'/fire-alarm'` literal count is 2 across the two no-nav arrays.

## User Setup Required
None. Backend `/api/alarm/*` remains undeployed on cbc7119-preview by design; the page degrades gracefully. Manual visual check on cbc7119-preview recommended: visit `/fire-alarm` (no nav/sidebar/header), confirm fire red+Flame / equip green+Settings, ACK routing, safe-area pinning.

## Next Phase Readiness
- 25-06 (SW push deep-link) can now target `/fire-alarm` as the `notificationclick` destination — the route and its ACK flow are live.
- InspectionPage.tsx and DashboardPage.tsx untouched; 25-03/25-05 remain free to own their InspectionPage edits.

## Self-Check: PASSED

---
*Phase: 25-panel-monitoring*
*Completed: 2026-07-01*
