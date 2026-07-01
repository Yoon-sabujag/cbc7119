---
phase: 25-panel-monitoring
plan: 01
subsystem: api
tags: [react, react-query, panel-monitoring, alarm, pinch-zoom, cache-bust, graceful-degradation]

# Dependency graph
requires: []
provides:
  - panelApi (getStatus/getMaint/setMaint/latestFrameUrl/snapshotUrl) in src/utils/api.ts
  - alarmApi (getActive/getEvents/ack/resolve) with resolve != create split
  - PanelStatus/Alarm/AlarmSummary/MaintState/AlarmEvent TS interfaces
  - LivePanelImage shared live-frame component (cache-bust + 204 placeholder)
  - freshnessLabel/watchdogLabel/parseKst helpers
  - usePinchZoom reusable hook (pinch/double-tap/wheel, FloorPlanPage untouched)
affects: [25-02 dashboard, 25-03 fire-alarm-modal, 25-04 fire-alarm-page, 25-05 desktop-inspection, 25-06 sw-push]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Live-frame <img src> builder keyed to frameUpdatedAt (not Date.now) → stable URL, no remount/flicker"
    - "Graceful-degradation contract: api methods throw normally, consumers wrap in react-query try/catch → 평상시 fallback"
    - "Zoom logic ported into self-contained hook without editing the deployed FloorPlanPage source"

key-files:
  created:
    - cha-bio-safety/src/components/panel/freshness.ts
    - cha-bio-safety/src/components/panel/LivePanelImage.tsx
    - cha-bio-safety/src/hooks/usePinchZoom.ts
  modified:
    - cha-bio-safety/src/utils/api.ts

key-decisions:
  - "alarmApi.resolve (in-place UPDATE + record 확정 + panel_alarm cleared) kept DISTINCT from fireAlarmApi.create (평상시 신규); one-line comment documents the split"
  - "Cache-bust ?t= derives from frameUpdatedAt not Date.now() so same frame keeps a stable URL (risk 9 flicker avoidance)"
  - "usePinchZoom ports FloorPlanPage pattern into a new hook rather than extracting in-place — deployed floorplan zoom must not regress"
  - "204/error both degrade to a gray 16:9 aspect-video placeholder; LivePanelImage renders chrome-0 image only, consumers overlay LIVE badge"

patterns-established:
  - "Panel media primitives live under src/components/panel/"
  - "Semantic token classes (bg-surface-sunken, text-text-tertiary, text-caption); zero emoji/arrows in new source"

requirements-completed: [PANEL-UI-07]

# Metrics
duration: ~15min
completed: 2026-07-01
---

# Phase 25 Plan 01: Foundation Primitives Summary

**panelApi/alarmApi API namespaces with resolve≠create split, a cache-bust LivePanelImage that degrades to a gray placeholder on 204/error, freshness label helpers, and a reusable usePinchZoom hook ported from FloorPlanPage without touching it.**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-07-01
- **Tasks:** 3
- **Files modified:** 4 (1 modified, 3 created)

## Accomplishments
- `panelApi` + `alarmApi` + five TS interfaces appended to `api.ts` after `workListApi`, matching the plain-object-delegating-to-`api`-verb pattern (no factory). `alarmApi.resolve` posts to `/alarm/${id}/resolve` (distinct from `fireAlarmApi.create`); `panelApi.latestFrameUrl` is a fetch-free `<img src>` builder with `?t=` cache-bust.
- `freshness.ts` (`parseKst`/`freshnessLabel`/`watchdogLabel`) returns 방금 / N초 전 / 지연 tone states and a 3분-초과 워치독 문구.
- `LivePanelImage` renders a cache-busted live frame keyed to `frameUpdatedAt` and degrades to a gray `aspect-video bg-surface-sunken` placeholder on 204/error without crashing; chrome-0 (no LIVE badge here).
- `usePinchZoom` hook exposes pinch (1x↔2.5x), single-touch pan, double-tap/double-click, wheel zoom, and `reset()`, returning `{ containerRef, scale, transform, reset, bind }`. FloorPlanPage.tsx is byte-for-byte unchanged.

## Task Commits

Each task committed atomically:

1. **Task 1: panelApi + alarmApi + interfaces in api.ts** - `98ea76d5` (feat)
2. **Task 2: freshness helpers + LivePanelImage component** - `ff2cc1ba` (feat)
3. **Task 3: usePinchZoom hook** - `75c0dc7b` (feat)

## Files Created/Modified
- `cha-bio-safety/src/utils/api.ts` - Appended panelApi/alarmApi namespaces + PanelStatus/Alarm/AlarmSummary/MaintState/AlarmEvent interfaces
- `cha-bio-safety/src/components/panel/freshness.ts` - parseKst + freshnessLabel + watchdogLabel helpers
- `cha-bio-safety/src/components/panel/LivePanelImage.tsx` - Shared live-frame image with cache-bust + 204/error placeholder
- `cha-bio-safety/src/hooks/usePinchZoom.ts` - Reusable pinch/double-tap/wheel zoom hook

## Decisions Made
- Kept the resolve/create semantic split explicit with an inline comment so later plans (25-03/05) do not mis-wire the 경보중 자동초안 저장 flow to the 평상시 신규 endpoint.
- Cache-bust key derives from `frameUpdatedAt`, not `Date.now()`, to keep the img URL stable across refetches carrying the same frame (avoids remount flicker, risk 9).
- Ported (copied) the FloorPlanPage zoom math into a new hook instead of extracting in-place, preserving the deployed floorplan zoom.

## Deviations from Plan

None functional. One tooling adjustment during Task 2: the emoji-zero verification gate (`\x{2190}-\x{21FF}`) also matches the `→` arrow character used in Korean explanatory comments. Replaced `→` with ASCII `->` in the two new files so the gate passes; no behavioral change.

## Issues Encountered
None beyond the arrow-character gate note above.

## User Setup Required
None - no external service configuration required. Backend `/api/panel/*` and `/api/alarm/*` are intentionally NOT deployed in this design track (cbc7119-preview); consumers degrade gracefully.

## Next Phase Readiness
- Waves 2 and 3 unblocked: 25-02 (dashboard live card/chip), 25-03 (FireAlarmModal + mobile fullscreen zoom), 25-04 (FireAlarmPage), 25-05 (desktop 3-split + zoom overlay), 25-06 (SW push deep-link) can all consume panelApi/alarmApi/LivePanelImage/freshness/usePinchZoom.
- `npx tsc --noEmit` clean across the whole project.

## Self-Check: PASSED

---
*Phase: 25-panel-monitoring*
*Completed: 2026-07-01*
