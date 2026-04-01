---
phase: 05-navigation-restructuring
plan: "01"
subsystem: navigation
tags: [navigation, bottom-nav, global-header, side-menu, routing]
dependency_graph:
  requires: []
  provides: [GlobalHeader, RemediationPage, updated-BottomNav, updated-App-routing]
  affects: [DashboardPage, InspectionPage, ElevatorPage]
tech_stack:
  added: []
  patterns: [layout-level-menu-state, pathname-title-map, lazy-import-routing]
key_files:
  created:
    - cha-bio-safety/src/components/GlobalHeader.tsx
    - cha-bio-safety/src/pages/RemediationPage.tsx
  modified:
    - cha-bio-safety/src/components/BottomNav.tsx
    - cha-bio-safety/src/App.tsx
  deleted:
    - cha-bio-safety/src/pages/MorePage.tsx
decisions:
  - "GlobalHeader and SideMenu state hoisted to Layout in App.tsx (single mount point, per D-10)"
  - "MorePage.tsx deleted entirely; /more redirects to /dashboard without Auth wrapper"
  - "RemediationPage contains no GlobalHeader (Layout renders it, preventing double header)"
metrics:
  duration: "158s"
  completed_date: "2026-04-01"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 2
  files_deleted: 1
---

# Phase 5 Plan 01: Navigation Foundation Summary

**One-liner:** GlobalHeader with hamburger-driven SideMenu hoisted to Layout level; BottomNav restructured with 조치 tab replacing 더보기; MorePage deleted and /more redirected to /dashboard.

---

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Create GlobalHeader, RemediationPage, update BottomNav | bdd7335 | GlobalHeader.tsx, RemediationPage.tsx, BottomNav.tsx |
| 2 | Update App.tsx Layout, delete MorePage, update routes | f443a83 | App.tsx, MorePage.tsx (deleted) |

---

## What Was Built

### GlobalHeader (`src/components/GlobalHeader.tsx`)
New component. Renders a 48px header bar with:
- Hamburger button (32x32px, `aria-label="메뉴 열기"`, `background: var(--bg3)`) that calls `onMenuOpen`
- Centered page title (13px/700 weight, `color: var(--t1)`)
- 32px right spacer to keep title visually centered
- Props: `title: string`, `onMenuOpen: () => void`

### RemediationPage (`src/pages/RemediationPage.tsx`)
New placeholder page. Renders full-height flex column centered on:
- Wrench SVG icon (48x48px, `color: var(--t3)`)
- "조치 관리" heading (16px/700, `color: var(--t1)`)
- "준비 중입니다" body text (13px, `color: var(--t2)`)
No GlobalHeader inside the page — Layout renders it.

### BottomNav (`src/components/BottomNav.tsx`)
Updated tab array. New order: 대시보드 | 점검 | QR스캔 | **조치** | 승강기
- Removed: `key: 'more'`, `label: '더보기'`, `path: '/more'`
- Added: `key: 'remediation'`, `label: '조치'`, `path: '/remediation'` at index 3
- Moved elevator to index 4 (last)
- `NavKey` type updated: `'more'` → `'remediation'`
- No badge on 조치 tab (Phase 6 will connect live unresolved count)

### App.tsx (`src/App.tsx`)
- Deleted `MorePage` lazy import
- Added `RemediationPage` lazy import
- Added `GlobalHeader` and `SideMenu` imports
- `Layout` now holds `sideOpen` state and renders `<GlobalHeader>` + `<SideMenu>` when `showNav`
- `PAGE_TITLES` map added for pathname → display title resolution
- Routes: `/remediation` → `<Auth><RemediationPage /></Auth>`; `/more` → `<Navigate to="/dashboard" replace />`
- `NO_NAV_PATHS` extended with `/meal`, `/education`, `/admin`, `/legal-inspection`

### MorePage.tsx — deleted
Removed from disk per D-08. All imports, lazy loads, and routes eliminated.

---

## Verification Results

- `npx tsc --noEmit`: exits 0 (no TypeScript errors)
- `npm run build`: Vite build succeeded in 6.22s, PWA service worker generated
- BottomNav ITEMS array order confirmed: dashboard[0], inspection[1], qr[2], remediation[3], elevator[4]
- `grep -c "MorePage" src/App.tsx`: 0
- `test ! -f src/pages/MorePage.tsx`: PASS

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Known Stubs

- `RemediationPage.tsx`: Intentional placeholder. "준비 중입니다" is the planned state for Phase 5. Phase 6 will implement the full조치 management workflow.

---

## Self-Check: PASSED

Files created/exist:
- cha-bio-safety/src/components/GlobalHeader.tsx: FOUND
- cha-bio-safety/src/pages/RemediationPage.tsx: FOUND

Files deleted:
- cha-bio-safety/src/pages/MorePage.tsx: CONFIRMED DELETED

Commits:
- bdd7335: FOUND
- f443a83: FOUND
