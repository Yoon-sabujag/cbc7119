---
phase: "06"
plan: "02"
subsystem: remediation-tracking
status: checkpoint-pending
tags: [remediation, frontend, react, badges, navigation]
dependency_graph:
  requires: ["06-01"]
  provides: ["remediation-list-ui", "remediation-detail-ui", "badge-wiring"]
  affects: ["App.tsx", "BottomNav", "SideMenu", "navigation"]
tech_stack:
  added: []
  patterns: ["React Query cache invalidation", "regex NO_NAV_PATHS fix", "prop-driven badge count"]
key_files:
  created:
    - cha-bio-safety/src/pages/RemediationPage.tsx
    - cha-bio-safety/src/pages/RemediationDetailPage.tsx
  modified:
    - cha-bio-safety/src/App.tsx
    - cha-bio-safety/src/components/BottomNav.tsx
    - cha-bio-safety/src/components/SideMenu.tsx
decisions:
  - "date-fns not installed — used inline fmtDate() helper to avoid adding dependency"
  - "NO_NAV_PATHS uses regex match for /remediation/:recordId sub-routes instead of adding /remediation to array"
  - "Dashboard query placed in Layout component so BottomNav/SideMenu both consume unresolvedCount from single source"
metrics:
  duration: "4m 10s"
  completed_date: "2026-04-01"
  tasks_completed: 2
  tasks_total: 3
  files_created: 2
  files_modified: 3
---

# Phase 06 Plan 02: Remediation UI Pages Summary

**One-liner:** Filtered remediation card list with status/category/period controls, detail+resolve page with shared PhotoButton hook, and live unresolved badge wiring to BottomNav and SideMenu via Layout dashboard query.

---

## Tasks Completed

### Task 1: RemediationPage list view + App.tsx routing + badge wiring
**Commit:** 78b7c57
**Files:** RemediationPage.tsx, App.tsx, BottomNav.tsx, SideMenu.tsx

Replaced the placeholder RemediationPage with a full filtered list view. Status tabs (전체/미조치/완료), category dropdown, and period buttons (7/30/90/전체, default 30일) implemented as filter state driving React Query. Card layout shows category, dong→층 location via ZONE_LABEL mapping, memo first-line preview, date, and status chip. Result badge (불량/주의) color-coded using CSS variable tints.

App.tsx: added RemediationDetailPage lazy import and /remediation/:recordId route. Fixed showNav to use `location.pathname.match(/^\/remediation\/.+/)` so the list page keeps BottomNav visible while the detail page hides it. Added dashboard query in Layout with 30s staleTime and refetchInterval, passing `unresolvedCount` to both BottomNav and SideMenu.

BottomNav updated to accept `unresolvedCount` prop, renders absolute-positioned danger badge on remediation tab (99+ cap, JetBrains Mono font). SideMenu updated to accept `unresolvedCount` prop, replaces hardcoded badge 0 for /remediation item with live count.

### Task 2: RemediationDetailPage with resolve form
**Commit:** d5f3766
**Files:** RemediationDetailPage.tsx (new)

Full detail page with self-contained 48px header (back arrow, aria-label="목록으로 돌아가기", "조치 상세" title). Four sections: 점검 정보 (key-value rows), 점검 기록 (memo + photo), 조치 완료 (resolved items only), 조치 내용 입력 (open items only). Resolve form uses shared `usePhotoUpload` hook and `PhotoButton` component from Plan 01. Submission handler validates required memo, uploads optional photo, POSTs to /api/inspections/records/:recordId/resolve, then invalidates all three query keys (remediation, remediation-detail, dashboard) before toast.success + navigate('/remediation').

### Task 3: Visual verification (CHECKPOINT PENDING)
Status: Awaiting human verification on deployed app.

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] date-fns not installed in project**
- **Found during:** Task 1 (TypeScript compile error)
- **Issue:** Plan specified `import { format } from 'date-fns'` but date-fns is not in package.json or node_modules. CLAUDE.md lists it as a key dependency but it's not installed.
- **Fix:** Used inline `fmtDate()` helper function using native Date methods, consistent with DashboardPage.tsx pattern where dates are formatted with padStart.
- **Files modified:** RemediationPage.tsx, RemediationDetailPage.tsx
- **Commits:** 78b7c57, d5f3766

---

## Known Stubs

None. All data is wired to live API endpoints via React Query.

---

## Self-Check

### Files exist:
- cha-bio-safety/src/pages/RemediationPage.tsx: FOUND
- cha-bio-safety/src/pages/RemediationDetailPage.tsx: FOUND
- cha-bio-safety/src/components/BottomNav.tsx: FOUND (modified)
- cha-bio-safety/src/components/SideMenu.tsx: FOUND (modified)
- cha-bio-safety/src/App.tsx: FOUND (modified)

### Commits exist:
- 78b7c57 feat(06-02): implement remediation list page, routing, and badge wiring
- d5f3766 feat(06-02): implement RemediationDetailPage with resolve form

### TypeScript: npx tsc --noEmit exits 0 (no errors)

## Self-Check: PASSED
