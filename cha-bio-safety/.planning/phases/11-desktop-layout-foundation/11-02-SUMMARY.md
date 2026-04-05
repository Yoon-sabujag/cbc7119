---
phase: 11-desktop-layout-foundation
plan: 02
subsystem: ui
tags: [react, layout, desktop, responsive, sidebar, settings]

# Dependency graph
requires:
  - phase: 11-01
    provides: useIsDesktop hook and DesktopSidebar component
provides:
  - App.tsx Layout function with desktop/mobile conditional rendering
  - DesktopSidebar integrated into Layout (isDesktop && showNav)
  - Separate MOBILE_NO_NAV_PATHS and DESKTOP_NO_NAV_PATHS constants
  - Expanded PAGE_TITLES covering all 18 routes
  - SettingsPanel isDesktop prop for correct bottom positioning on desktop
affects: [all pages, navigation, layout shell]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "isDesktop conditional rendering: {isDesktop && showNav && <DesktopSidebar />} / {!isDesktop && showNav && <BottomNav />}"
    - "DESKTOP_NO_NAV_PATHS=['/', '/login'] — minimal exclusion list for desktop"
    - "main tag with overflow: auto replaces nested div with overflow: hidden for desktop scroll"

key-files:
  created: []
  modified:
    - src/App.tsx
    - src/components/SettingsPanel.tsx

key-decisions:
  - "Split NO_NAV_PATHS into MOBILE_NO_NAV_PATHS (15 paths) and DESKTOP_NO_NAV_PATHS (['/', '/login']) so desktop shows sidebar on all authenticated pages"
  - "Use outer flex-row div (height: 100dvh, overflow: hidden) with sidebar + content column arrangement"
  - "main tag uses overflow: auto instead of parent div overflow: hidden to enable desktop page scrolling"
  - "SettingsPanel isDesktop prop controls top/bottom offsets: top 48px / bottom 0 on desktop vs SAT/BottomNav height on mobile"

patterns-established:
  - "Desktop layout: flex-row shell, DesktopSidebar 280px fixed, content column with slim 48px header"
  - "Mobile layout: unchanged — flex-col, GlobalHeader + SideMenu drawer + BottomNav"
  - "paddingBottom: (!isDesktop && showNav) ? 'calc(54px + var(--sab, 34px))' : 0 — phantom gap eliminated on desktop"

requirements-completed: [LAYOUT-01, LAYOUT-02, LAYOUT-03, LAYOUT-04]

# Metrics
duration: 20min
completed: 2026-04-05
---

# Phase 11 Plan 02: Desktop/Mobile Layout Split Summary

**App.tsx refactored with isDesktop-conditional rendering: DesktopSidebar + 48px slim header on desktop (1024px+), unchanged GlobalHeader + BottomNav on mobile**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-04-05T01:00:00Z
- **Completed:** 2026-04-05T01:19:11Z
- **Tasks:** 1 of 2 complete (Task 2 is human-verify checkpoint — awaiting visual confirmation)
- **Files modified:** 2

## Accomplishments

- Split NO_NAV_PATHS into MOBILE_NO_NAV_PATHS and DESKTOP_NO_NAV_PATHS, enabling sidebar on all authenticated pages on desktop
- Refactored Layout() to render DesktopSidebar + slim 48px header on desktop and preserve existing mobile nav unchanged
- Expanded PAGE_TITLES from 6 entries to 18, covering all authenticated routes for desktop header display
- Fixed main content area overflow from hidden wrapper div to `overflow: auto` on `<main>` tag, eliminating phantom bottom gap on desktop
- Added `isDesktop` prop to SettingsPanel with conditional top/bottom positioning (48px / 0 on desktop, SAT / BottomNav height on mobile)

## Task Commits

Each task was committed atomically:

1. **Task 1: App.tsx Layout 리팩터링 + SettingsPanel 수정** - `091907b` (feat)

**Plan metadata:** (pending — after checkpoint approval)

## Files Created/Modified

- `src/App.tsx` - Layout function refactored with isDesktop split; imports DesktopSidebar and useIsDesktop; MOBILE_NO_NAV_PATHS + DESKTOP_NO_NAV_PATHS + expanded PAGE_TITLES
- `src/components/SettingsPanel.tsx` - Added isDesktop?: boolean prop; top/bottom style values branch on isDesktop

## Decisions Made

- Desktop layout uses outer `display: flex` (flex-row) wrapper so DesktopSidebar sits left of content column. Mobile retains `flexDirection: column` pattern inside the content div.
- SettingsPanel is always rendered (no `isDashboard &&` gate removed) so settings are accessible from any page on desktop via the slim header gear button.
- `!isDesktop && showNav` guards preserve all three mobile-only elements (GlobalHeader, SideMenu, BottomNav) in a single consistent pattern.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — TypeScript build passed without errors on first attempt.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Desktop layout shell is complete. Task 2 (human-verify checkpoint) requires visual confirmation in browser at http://localhost:5173
- After checkpoint approval, STATE.md and ROADMAP.md will be updated and this plan will be marked complete
- Phase 11 Plan 03 (if it exists) can proceed after visual verification passes

## Self-Check: PASSED

- src/App.tsx: FOUND
- src/components/SettingsPanel.tsx: FOUND
- 11-02-SUMMARY.md: FOUND
- commit 091907b: FOUND

---
*Phase: 11-desktop-layout-foundation*
*Completed: 2026-04-05*
