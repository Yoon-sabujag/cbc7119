---
phase: 25-panel-monitoring
plan: 03
subsystem: ui
tags: [react, react-query, panel-monitoring, fire-alarm, pinch-zoom, deep-link, mobile]

# Dependency graph
requires: [25-01]
provides:
  - Expanded FireAlarmModal (mobile 화재수신반 페이지) — header 점검모드 toggle + live card + 48h events + 3-state form
  - alarmApi.resolve-wired 경보중 save (칩 소멸) vs fireAlarmApi.create 평상시 save
  - Mobile fullscreen zoom viewer (usePinchZoom, safe-area, body:fixed-free lock)
  - /inspection?panel=fire-alarm deep-link auto-open
affects: [25-04 fire-alarm-page, 25-05 desktop-inspection, 25-06 sw-push]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "3-state UI (normal/alarm/maint) derived from panelApi.getStatus().maint.enabled + alarmApi.getActive()"
    - "Save 2-branch: 경보중 alarmApi.resolve(id,{...}) for chip clearance, 평상시 fireAlarmApi.create; both invalidate fire-alarm-recent"
    - "Zoom viewer scroll-lock via SideMenu overflow+touchmove pattern, never body:position:fixed"

key-files:
  created: []
  modified:
    - cha-bio-safety/src/pages/InspectionPage.tsx

key-decisions:
  - "경보중 발생일시만 activeAlarm.detectedAt로 prefill; 발생장소/원인은 need-border 빈 상태 유지(현장 확인 강제)"
  - "maint state는 별도 query 없이 panel-status.maint.enabled 사용 (invalidate 키 ['panel-status','alarm-active']만 유지)"
  - "blink/firepulse는 index.css 기존 keyframe 인라인 style로 재사용 (DashboardPage 패턴 일치)"

requirements-completed: [PANEL-UI-02, PANEL-UI-04]

# Metrics
duration: ~25min
completed: 2026-07-01
---

# Phase 25 Plan 03: Mobile 화재수신반 페이지 (FireAlarmModal Expanded) Summary

**Expanded the existing FireAlarmModal in place into the full mobile 화재수신반 페이지 — header 점검모드 toggle (maint 409 confirm), live card (tap-to-zoom), 48h auto-detected events, and a 3-state form (평상시/경보중/점검모드) whose 경보중 save calls alarmApi.resolve (dashboard chip 소멸) not fireAlarmApi.create — plus a usePinchZoom fullscreen zoom viewer and /inspection?panel=fire-alarm deep-link auto-open.**

## Performance
- **Duration:** ~25 min
- **Completed:** 2026-07-01
- **Tasks:** 3
- **Files modified:** 1 (InspectionPage.tsx)

## Accomplishments
- **Chrome (Task 1):** Rewrote `FireAlarmModal` header to `gh` layout — `ChevronLeft` back (w-7=32px) + `BellRing` title + a single `role="switch"` 점검모드 toggle (`gh-maint`, BellOff + 32×18 switch track). Added three try/catch react-query hooks (`panel-status` 15s, `alarm-active` 15s, `alarm-events` 30s) degrading to 평상시 fallback, and derived `mode: normal | alarm | maint`. Built live-card (`LivePanelImage` + blink LIVE/화재 dot span + `Maximize2` fshint + live-status) and the 48h evt-card (fire/non/equip `badge2` variants + empty-state row).
- **3-state form + save branch (Task 2):** Added `maint-autonote` (점검모드 only, `RefreshCw`) and `panel-notice` (경보중 only, danger blink dot) banners above the live card. Form + formbar hidden in 점검모드; 경보중 gets an `AlertTriangle` fh header, 자동선택/자동 info tags, need-borders on 발생장소·발생원인, info border on 조치사항, and CTA "조치완료 후 저장". Save now branches: 경보중 -> `alarmApi.resolve(activeAlarm.id, {type, occurredAt, location, cause, action})` + invalidate `['alarm-active','fire-alarm-recent']` (chip 소멸); 평상시 -> `fireAlarmApi.create` + invalidate `['fire-alarm-recent']` (fixes the known missing-invalidate gap). Maint toggle catches 409 `active_alarm_requires_confirm` -> `window.confirm` -> retry `confirmAlarm:true`.
- **Zoom viewer + deep-link (Task 3):** Added an inline fullscreen `fsv` viewer opened from the live-card tap, using `usePinchZoom` (containerRef + transform + bind), pinned to `var(--sat)` / `calc(54px+safe-area)` (never bare 100vh), keeping the mobile 더블탭 hint text. Scroll-lock uses the SideMenu `body.style.overflow='hidden'` + non-passive touchmove pattern (excluding `#panel-zoom-frame`), never `body.position:fixed`. Added a top-level `useSearchParams`-style effect so `/inspection?panel=fire-alarm` auto-opens the modal (dashboard tap + SW push destination).

## Task Commits
1. **Task 1: FireAlarmModal chrome (header toggle + live + 48h events)** - `68d04c7d` (feat)
2. **Task 2: 3-state form + resolve/create save branch + maint 409 confirm** - `c793570e` (feat)
3. **Task 3: fullscreen zoom viewer + panel=fire-alarm deep-link** - `c2c3aadd` (feat)

## Files Created/Modified
- `cha-bio-safety/src/pages/InspectionPage.tsx` - Expanded FireAlarmModal (chrome + 3-state form + save branch), inline fullscreen zoom viewer, deep-link auto-open effect. Added imports: panelApi/alarmApi/type Alarm, LivePanelImage, freshnessLabel, usePinchZoom, lucide BellRing/BellOff/Maximize2/RefreshCw/Plus.

## Decisions Made
- Prefilled only 발생일시 from `activeAlarm.detectedAt` in 경보중; left 발생장소/발생원인 empty with need-borders to force field confirmation (matches "· 확인 필요" contract).
- Used `panel-status.maint.enabled` for maint state rather than a separate `getMaint` query, keeping invalidation keys to `['panel-status','alarm-active']`.
- Reused existing `blink`/`firepulse` keyframes (index.css) via inline `style` to match the DashboardPage dot-span convention, avoiding new CSS.

## Deviations from Plan
None functional. The plan referenced a distinct `['panel-status']`, `['alarm-active']`, `['alarm-events']` query set (implemented) and derived maint from `maint.enabled` — sourced from `status.maint.enabled` since `PanelStatus` already carries `maint` (25-01 shape), so no separate maint query was added. All copy is verbatim from the Copywriting Contract.

## Issues Encountered
None. `npx tsc --noEmit` clean project-wide after each task.

## User Setup Required
None. Backend `/api/panel/*` and `/api/alarm/*` are intentionally NOT deployed on this design track (cbc7119-preview); all queries degrade to 평상시 fallback. Manual visual verification on cbc7119-preview per state (평상시 / 경보중 / 점검모드) + zoom double-tap + deep-link remains for the user.

## Verification
- `cd cha-bio-safety && npx tsc --noEmit` — clean.
- grep present: `alarmApi.resolve`, `조치완료 후 저장`, `fire-alarm-recent`, `confirmAlarm`, `usePinchZoom`, `더블탭`, `role="switch"`, `최근 이벤트 (자동감지)`, `LivePanelImage`, `panel') === 'fire-alarm'`.
- grep absent: `body.position:fixed` / `body.style.position` (none).
- 경보중 save confirmed wired to `alarmApi.resolve`, NOT `fireAlarmApi.create`.
- Emoji/arrow-zero on all changed regions.
- Scope isolation: my 3 commits touch ONLY `InspectionPage.tsx`; zero `DesktopInspectionView` diff lines; `App.tsx` untouched.

## Self-Check: PASSED
- FireAlarmModal expanded region present at InspectionPage.tsx (verified by grep of all gate strings).
- Commits `68d04c7d`, `c793570e`, `c2c3aadd` exist in git log.

---
*Phase: 25-panel-monitoring*
*Completed: 2026-07-01*
