---
phase: 10-legal-inspection
plan: "02"
subsystem: ui
tags: [react, legal-inspection, bottomsheet, photo-upload, react-query, cloudflare-pages]

# Dependency graph
requires:
  - phase: 10-01
    provides: legalApi client, LegalRound/LegalFinding types, backend API endpoints
provides:
  - LegalPage: inspection round list with status tab filter (URL ?tab=) + year filter
  - LegalFindingsPage: finding cards with admin result panel + BottomSheet registration
  - LegalFindingDetailPage: finding detail with resolution flow + photo upload
affects: [deployment, legal-inspection-feature]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Self-contained 48px header with back button (no global nav)
    - BottomSheet overlay for mobile data entry (fixed position, slideUp animation)
    - URL searchParams for tab state (restores on back navigation)
    - useState for secondary filter state (year)
    - useMutation for resolve flow with photo upload before API call
    - usePhotoUpload hook for R2 photo attachment

key-files:
  created:
    - cha-bio-safety/src/pages/LegalPage.tsx
    - cha-bio-safety/src/pages/LegalFindingsPage.tsx
    - cha-bio-safety/src/pages/LegalFindingDetailPage.tsx
  modified: []

key-decisions:
  - "Status tab for LegalPage uses URL ?tab= param (back navigation preserves filter state)"
  - "Year filter uses useState (secondary filter, not critical to preserve in URL)"
  - "Admin result sub-header shown inline on LegalFindingsPage (no modal)"
  - "Report PDF opens in new tab via window.open (no in-app viewer)"
  - "Before-photo (지적 사진) can be uploaded from detail page when finding is open and no photo exists"
  - "BottomSheet registration skips inline photo (user can add from detail page)"

patterns-established:
  - "NO_NAV pages: self-contained 48px header + back button (exact pattern from RemediationDetailPage)"
  - "KVRow/SectionHeader inline components for detail page layout"
  - "useMutation with async photo upload: upload photo → get key → call API in one mutation"

requirements-completed:
  - LEGAL-01
  - LEGAL-02

# Metrics
duration: 4min
completed: 2026-04-03
---

# Phase 10 Plan 02: Legal Inspection Frontend Summary

**Three legal inspection pages with round list + status filter, finding registration BottomSheet, admin result panel, and resolution flow with photo upload**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-03T15:45:17Z
- **Completed:** 2026-04-03T15:49:00Z
- **Tasks:** 2 auto-tasks completed (1 human-verify checkpoint pending)
- **Files modified:** 3

## Accomplishments
- LegalPage: round cards from schedule_items with 3-tab status filter (URL ?tab=) + year dropdown, result badges (적합/부적합/조건부적합/결과 미입력), left accent color by result, empty state
- LegalFindingsPage: finding cards sorted open-first, admin-only result select + PDF upload sub-header, "+ 지적사항 등록" BottomSheet with description/location fields, status badges (미조치/완료)
- LegalFindingDetailPage: KVRow detail layout (지적 정보 + 지적 사진 + 조치 내용/결과 sections), fixed CTA bar, memo validation, resolution photo upload via useMutation

## Task Commits

Each task was committed atomically:

1. **Task 1: LegalPage + LegalFindingsPage** - `cb37782` (feat)
2. **Task 2: LegalFindingDetailPage** - `5f39461` (feat)

**Plan metadata:** pending (will be committed after checkpoint)

## Files Created/Modified
- `cha-bio-safety/src/pages/LegalPage.tsx` - Round list with status/year filter, result badges, empty state
- `cha-bio-safety/src/pages/LegalFindingsPage.tsx` - Finding list with admin panel + BottomSheet registration
- `cha-bio-safety/src/pages/LegalFindingDetailPage.tsx` - Finding detail with resolve flow + photo upload

## Decisions Made
- Status tab uses URL `?tab=` param matching RemediationPage pattern (back navigation restores filter)
- Year filter uses `useState` — secondary filter, no need to persist in URL
- Admin sub-header on LegalFindingsPage is inline (sticky row below main header) — no modal needed
- PDF report opens `window.open(_blank)` per CONTEXT.md decision (no in-app PDF viewer)
- Before-photo (지적 사진) can be added from detail page when finding is open and has no photo
- BottomSheet skips inline photo to keep the flow simple; user can add from detail page

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all three pages wire real data via legalApi. No hardcoded/placeholder values visible to users.

## Next Phase Readiness
- All 3 legal inspection pages are fully functional replacements for placeholder stubs
- Routes already set up in App.tsx (`/legal`, `/legal/:id`, `/legal/:id/finding/:fid`)
- NO_NAV_PATHS already includes `/legal` in App.tsx
- Awaiting human visual verification (Task 3 checkpoint)

---
*Phase: 10-legal-inspection*
*Completed: 2026-04-03*
