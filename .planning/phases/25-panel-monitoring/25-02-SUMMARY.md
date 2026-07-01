---
phase: 25-panel-monitoring
plan: 02
subsystem: dashboard
tags: [react, react-query, panel-monitoring, alarm, dashboard, graceful-degradation, live-frame]

# Dependency graph
requires: ['25-01']
provides:
  - Mobile dashboard 16:9 수신반 라이브 card (LivePanelImage, tap -> 화재수신반 페이지)
  - Mobile + desktop banner PanelStateChip (경보중 red blink / 점검모드 gray / 평상시 empty)
  - Desktop right-column shrink-0 라이브 위젯 (LIVE/화재 dot badge, live-cap, firepulse, click/dblclick zoom route)
  - Shared panel-state react-query (['panel-status'] + ['alarm-active']) with 평상시 fallback
affects: [25-03 fire-alarm-modal, 25-05 desktop-inspection]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Shared PanelStateChip module-level component reused across mobile + desktop banners with per-surface maintLabel prop"
    - "240ms click/dblclick disambiguation via useRef timer (single -> 일반점검, double -> zoom=1 route)"
    - "Panel/alarm react-query wrapped in try/catch returning null -> 평상시 graceful fallback (retry:false)"

key-files:
  created: []
  modified:
    - cha-bio-safety/src/pages/DashboardPage.tsx
    - cha-bio-safety/src/index.css

key-decisions:
  - "activeAlarm derives from ['alarm-active'] first, falls back to panelStatus.activeAlarm, then null — chip/widget both consume the same union"
  - "chipblink + firepulse keyframes added to index.css (blink/slideUp already existed) rather than inline arbitrary animate — keeps box-shadow pulse declarative and reusable"
  - "Desktop live widget forced shrink-0 as first right-column child so it never steals height from the flex-1 오늘 일정 card"
  - "Both mobile gridTemplateRows strings gained one auto track (5->6 children), keeping exactly one 1fr on 오늘 일정"

patterns-established:
  - "PanelStateChip is the single source for dashboard 경보/점검 state chips; desktop passes 점검모드 · 17:30 자동복구, mobile passes 점검 모드 · 알림 중지"

requirements-completed: [PANEL-UI-01, PANEL-UI-05]

# Metrics
duration: ~12min
completed: 2026-07-01
---

# Phase 25 Plan 02: Dashboard Live Card + State Chips Summary

**Mobile 16:9 수신반 라이브 card + right-aligned 경보/점검 chip and a desktop shrink-0 라이브 위젯 + banner chip, both driven by a shared panel-state react-query that degrades to 평상시 on the undeployed panel/alarm endpoints.**

## Performance

- **Duration:** ~12 min
- **Completed:** 2026-07-01
- **Tasks:** 2
- **Files modified:** 2 (DashboardPage.tsx, index.css)

## Accomplishments
- Added a shared panel-state query pair (`['panel-status']` via `panelApi.getStatus`, `['alarm-active']` via `alarmApi.getActive`), each wrapped in try/catch returning null with `retry:false`, deriving `activeAlarm` / `maintOn` / `frameUpdatedAt`.
- Introduced a module-level `PanelStateChip` component (danger gradient + `chipblink` box-shadow + white blink dot span + `Flame` for 경보중; `bg-surface-sunken` + gray dot span + `BellOff` for 점검모드; renders nothing 평상시). Reused verbatim in both the mobile and desktop banners with a per-surface `maintLabel`.
- Mobile: inserted a chrome-0 16:9 `LivePanelImage` card (`aspect-video min-h-[180px]`) between the 오늘 점검 대상 banner and 오늘 현황, tapping to `/inspection?panel=fire-alarm`; added one `auto` track to BOTH inline `gridTemplateRows` strings (5->6 children, one `1fr` preserved).
- Desktop: inserted a `shrink-0` 라이브 위젯 as the first right-column child (before 미니 캘린더) with a header (`BellRing` + 화재수신반 라이브 + 방재실 캡처), a `LivePanelImage` with LIVE/화재 dot-span overlay badge + Maximize2 "더블클릭 확대" hint, a `text-label` live-cap (정상 · 이상 없음 · {freshness} / 화재 발생 · {location} · {detectedAt}), and `firepulse` + `border-danger-bar` on 경보중. Single click routes to 일반점검, double click to `?zoom=1` via a 240ms `useRef` disambiguation timer.
- Added `chipblink` and `firepulse` keyframes to `src/index.css` (alongside existing `blink`/`slideUp`).

## Task Commits

1. **Task 1: Mobile 16:9 card + state chip + panel-state query** - `67bfc104` (feat)
2. **Task 2: Desktop 라이브 위젯 + banner chip** - `660cb23e` (feat)

## Files Created/Modified
- `cha-bio-safety/src/pages/DashboardPage.tsx` - panel-state query, PanelStateChip, mobile 16:9 card + grid track edit + mobile banner chip, desktop live widget + banner chip + click/dblclick handlers
- `cha-bio-safety/src/index.css` - chipblink + firepulse keyframes

## Decisions Made
- Kept a single `PanelStateChip` for both surfaces (DRY) parameterized only by the maint copy, since mobile ("점검 모드 · 알림 중지") and desktop ("점검모드 · 17:30 자동복구") differ solely in that label.
- Derived `activeAlarm` from the dedicated `['alarm-active']` query first, falling back to `panelStatus.activeAlarm`; both the `Alarm` and `AlarmSummary` shapes expose `location`/`detectedAt`, so the widget caption reads them without a cast.
- Added declarative keyframes to `index.css` rather than inline arbitrary `animate-[...]` so the box-shadow pulses (chipblink/firepulse) stay readable and reusable.

## Deviations from Plan

None functional. The desktop live widget renders the image flush (`border-y`) between header and caption rather than inside a padded sub-wrapper — visually cleaner for an edge-to-edge live feed and consistent with the Surface 5 card structure (header / live-pure / live-cap). No token or behavior change.

## Issues Encountered
None. `npx tsc --noEmit` clean; emoji-zero gate passes on all added lines (pre-existing `→` arrows at lines 22/206/285 are out of scope and untouched).

## User Setup Required
None. Backend `/api/panel/*` and `/api/alarm/*` remain intentionally undeployed on this design track (cbc7119-preview); all surfaces degrade to 평상시 (no chip, live img -> gray placeholder).

## Next Phase Readiness
- 25-03 (FireAlarmModal expand) and 25-05 (desktop 3-split + zoom overlay) can consume the same panel-state pattern; the desktop widget already routes dblclick to `?zoom=1` for 25-05 to auto-open its overlay.

## Self-Check: PASSED

---
*Phase: 25-panel-monitoring*
*Completed: 2026-07-01*
