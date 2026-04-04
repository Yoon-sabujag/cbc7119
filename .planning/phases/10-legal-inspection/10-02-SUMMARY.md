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
  - "Round filtering uses title substring match instead of inspection_category — schedule_items store Korean title text"
  - "Tab label renamed from '미조치' to '진행 중' for round-level filter clarity"

patterns-established:
  - "NO_NAV pages: self-contained 48px header + back button (exact pattern from RemediationDetailPage)"
  - "KVRow/SectionHeader inline components for detail page layout"
  - "useMutation with async photo upload: upload photo → get key → call API in one mutation"

requirements-completed:
  - LEGAL-01
  - LEGAL-02

# Metrics
duration: ~120min (including checkpoint verification and post-checkpoint fixes)
completed: 2026-04-03
---

# Phase 10 Plan 02: Legal Inspection Frontend Summary

**Three legal inspection pages with round list + status filter, finding registration BottomSheet, admin result panel, and resolution flow with photo upload — all 12 verification steps confirmed by user**

## Performance

- **Duration:** ~120 min (including human verify checkpoint and post-checkpoint bug fixes)
- **Started:** 2026-04-03T15:45:17Z
- **Completed:** 2026-04-03T16:30:00Z (approx)
- **Tasks:** 3 (2 auto + 1 checkpoint, fully verified)
- **Files modified:** 3

## Accomplishments
- LegalPage: round cards from schedule_items with 3-tab status filter (URL ?tab=) + year dropdown, result badges (적합/부적합/조건부적합/결과 미입력), left accent color by result, empty state
- LegalFindingsPage: finding cards sorted open-first, admin-only result select + PDF upload sub-header, "+ 지적사항 등록" BottomSheet with description/location fields, status badges (미조치/완료)
- LegalFindingDetailPage: KVRow detail layout (지적 정보 + 지적 사진 + 조치 내용/결과 sections), fixed CTA bar, memo validation, resolution photo upload via useMutation

## Task Commits

Each task was committed atomically:

1. **Task 1: LegalPage + LegalFindingsPage** - `cb37782` (feat)
2. **Task 2: LegalFindingDetailPage** - `5f39461` (feat)
3. **Task 3: Visual verification checkpoint** - Approved by user (no code commit)
4. **Post-checkpoint fix: retry button on error state** - `99b135c` (fix)
5. **Post-checkpoint fix: filter legal rounds by title substring** - `cee441e` (fix)
6. **Post-checkpoint fix: rename '미조치' tab to '진행 중'** - `35d44ed` (fix)

**Plan metadata:** `3e04db1` (docs: complete legal inspection frontend plan — pre-checkpoint commit)

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

### Auto-fixed Issues (Post-Checkpoint)

**1. [Rule 1 - Bug] Round filter using wrong field (`inspection_category` vs `title`)**
- **Found during:** Task 3 checkpoint verification (rounds not appearing in list)
- **Issue:** LegalPage filtering used `inspection_category` field comparison; schedule_items rows store Korean display title text, not a normalized category enum, so all rounds were silently filtered out
- **Fix:** Changed filtering to use `title` substring matching (`title.includes('종합')` / `title.includes('작동')`)
- **Files modified:** `cha-bio-safety/src/pages/LegalPage.tsx`
- **Verification:** User confirmed rounds appeared after fix
- **Committed in:** `cee441e`

**2. [Rule 2 - Missing Critical] Missing retry action on error state**
- **Found during:** Task 3 checkpoint verification
- **Issue:** LegalPage error state displayed message with no way to retry — users on flaky mobile connections would be stuck without navigating away
- **Fix:** Added retry button that calls `queryClient.invalidateQueries` to trigger refetch
- **Files modified:** `cha-bio-safety/src/pages/LegalPage.tsx`
- **Committed in:** `99b135c`

**3. [Rule 1 - Bug] Tab label '미조치' misleading at round level**
- **Found during:** Task 3 checkpoint verification (Step 11 — filter tab testing)
- **Issue:** '미조치' (unresolved) implies individual finding status; at the round level the correct concept is "rounds with open findings" which maps better to '진행 중'
- **Fix:** Renamed tab label from '미조치' to '진행 중'
- **Files modified:** `cha-bio-safety/src/pages/LegalPage.tsx`
- **Committed in:** `35d44ed`

---

**Total deviations:** 3 auto-fixed post-checkpoint (2 bugs, 1 UX clarity fix)
**Impact on plan:** All fixes required for correct operation. No scope creep.

## Issues Encountered

- Round filtering was silently broken on first verification run because schedule_items title text was used instead of a normalized category enum — fixed immediately (Deviation 1 above)
- All 12 user verification steps passed after the 3 post-checkpoint fixes

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all three pages wire real data via legalApi. No hardcoded/placeholder values visible to users.

## Next Phase Readiness
- All 3 legal inspection pages are fully functional replacements for placeholder stubs
- Routes already set up in App.tsx (`/legal`, `/legal/:id`, `/legal/:id/finding/:fid`)
- NO_NAV_PATHS already includes `/legal` in App.tsx
- Human verification checkpoint fully passed (all 12 steps confirmed)
- Phase 10 complete (both plans 01 + 02 done) — LEGAL-01 and LEGAL-02 requirements satisfied
- v1.1 milestone fully complete; ready for production deployment via `npm run deploy -- --branch production`

---
*Phase: 10-legal-inspection*
*Completed: 2026-04-03*
