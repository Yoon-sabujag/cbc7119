# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## mobile-action-page-blank — Bottom-nav pages blank on mobile after layout container changed to scroll container
- **Date:** 2026-04-07
- **Error patterns:** blank screen, 흰 화면, 빈 화면, height 100%, overflow hidden, flex child, mobile, iOS Safari, RemediationPage, bottom-nav, scroll container
- **Root cause:** After a layout refactor changed the page content container from `<div overflow:'hidden'>` to `<main overflow:'auto'>`, the container became a CSS scroll container. All bottom-nav pages set `height:'100%'` on their root divs, which resolves to 0 inside a scroll container whose height is flex-determined (not explicit) on some mobile browsers (iOS Safari). The resulting `overflow:'hidden'` clipped all content to nothing — blank screen.
- **Fix:** (1) Added `display:'flex'`, `flexDirection:'column'` to `<main>` in App.tsx and changed overflow from `'auto'` to `'hidden'` so `<main>` is a proper flex container rather than a scroll container. (2) Changed all bottom-nav page root divs from `height:'100%'` to `flex:1, minHeight:0` so they size correctly via flex parent.
- **Files changed:** src/App.tsx, src/pages/RemediationPage.tsx, src/pages/DashboardPage.tsx, src/pages/ElevatorPage.tsx, src/pages/InspectionPage.tsx, src/pages/StaffServicePage.tsx
---
