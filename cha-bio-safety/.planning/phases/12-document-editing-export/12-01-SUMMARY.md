---
phase: 12-document-editing-export
plan: 01
subsystem: ui
tags: [react, tanstack-query, css-print, a4-preview, lucide-react, resize-observer]

# Dependency graph
requires:
  - phase: existing-reports
    provides: generateExcel functions, REPORT_CARDS, MATRIX_CONFIG, ReportsPage mobile layout
provides:
  - ExcelPreview component: ResizeObserver A4 landscape scale-to-fit with HTML table data rendering
  - DesktopReportsPage: 3-panel layout (tab row + left panel list + right A4 preview)
  - "@media print CSS: hides [data-no-print], resets excel-preview-inner transform, A4 landscape @page"
  - "data-no-print attributes on: DesktopSidebar root, desktop header in App.tsx, tab row, left panel, action buttons in ReportsPage"
affects: [12-02, printing, reports, desktop-layout]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ResizeObserver scale-to-fit: Math.min(w/A4_W, h/A4_H) * 0.95 on containerRef"
    - "Desktop/mobile branching: useIsDesktop() at top of page, early return for each variant"
    - "data-no-print attribute on all chrome elements for clean CSS print control"
    - "@keyframes injected once via document.createElement('style') in useEffect"

key-files:
  created:
    - src/components/ExcelPreview.tsx
  modified:
    - src/pages/ReportsPage.tsx
    - src/index.css
    - src/App.tsx
    - src/components/DesktopSidebar.tsx

key-decisions:
  - "HTML table preview is data-confirmation quality, not pixel-perfect Excel reproduction — per D-16 and RESEARCH open question"
  - "downloadReport() extracted as shared async function used by both desktop and mobile layouts"
  - "Month filter hidden for ANNUAL_TYPES (피난방화, 방화셔터, 제연, 자탐) since they show annual matrix"
  - "Spinner keyframes injected via single document.createElement('style') with ID guard to avoid duplicates"

patterns-established:
  - "ExcelPreview pattern: outer container full-size, inner A4 div scaled by ResizeObserver"
  - "3-panel desktop layout: tab row (44px) + flex body (left panel 280px + right flex:1)"

requirements-completed: [LAYOUT-02, LAYOUT-03, DOC-01, DOC-04]

# Metrics
duration: 25min
completed: 2026-04-05
---

# Phase 12 Plan 01: Document Editing & Export Summary

**Desktop 3-panel 점검일지 layout with ResizeObserver A4 HTML preview, @media print styles, and data-no-print attributes on all chrome elements**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-04-05T04:46:00Z
- **Completed:** 2026-04-05T05:11:46Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Created ExcelPreview component with ResizeObserver scale-to-fit rendering of A4 HTML tables (DIV and monthly check data)
- Added DesktopReportsPage 3-panel layout: tab row, left panel with year/month filter + item list + download/print buttons, right A4 preview panel
- Added @media print CSS block to index.css: hides [data-no-print], sets @page A4 landscape, removes scale transform from excel-preview-inner
- Added data-no-print to desktop header (App.tsx) and DesktopSidebar root div

## Task Commits

1. **Task 1: Create ExcelPreview component + DesktopReportsPage 3-panel layout** - `6cdbc54` (feat)
2. **Task 2: Add @media print styles and data-no-print to App shell** - `0b59c94` (feat)

## Files Created/Modified

- `/Users/jykevin/Documents/20260328/cha-bio-safety/src/components/ExcelPreview.tsx` — New: A4 landscape preview with ResizeObserver scale, useQuery data fetch, DIV/monthly HTML table renderers
- `/Users/jykevin/Documents/20260328/cha-bio-safety/src/pages/ReportsPage.tsx` — Modified: isDesktop branch (DesktopReportsPage / MobileReportsPage), shared downloadReport(), data-no-print attributes
- `/Users/jykevin/Documents/20260328/cha-bio-safety/src/index.css` — Modified: @media print block appended at end
- `/Users/jykevin/Documents/20260328/cha-bio-safety/src/App.tsx` — Modified: data-no-print on desktop header element
- `/Users/jykevin/Documents/20260328/cha-bio-safety/src/components/DesktopSidebar.tsx` — Modified: data-no-print on root div

## Decisions Made

- HTML table preview is data-confirmation quality, not pixel-perfect Excel reproduction — consistent with D-16 and RESEARCH assessment. Print via Excel download for precision output.
- downloadReport() extracted as a shared async function to avoid duplicating the complex download logic between desktop and mobile layouts.
- Month filter is hidden for ANNUAL_TYPES (피난방화, 방화셔터, 제연, 자탐) because those reports generate annual matrices regardless of month.
- Spinner @keyframes injected once via a style element with a unique ID to prevent duplication across multiple ExcelPreview instances.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing TypeScript error in src/main.tsx (`Promise.withResolvers` not in ES2022 lib) — out of scope, pre-existing, not caused by this plan. Logged for reference; all new code compiles without errors.

## Known Stubs

None. ExcelPreview fetches live data from existing /api/reports/div and /api/reports/check-monthly endpoints. Data renders if available, shows appropriate empty/error states otherwise.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- ExcelPreview and DesktopReportsPage fully functional for 점검일지 조회/출력
- @media print ready for Ctrl+P or print button use
- Mobile ReportsPage unchanged and still functional
- Next: Phase 12-02 can extend ExcelPreview for DailyReportPage 2-panel layout (D-12)

---
*Phase: 12-document-editing-export*
*Completed: 2026-04-05*
