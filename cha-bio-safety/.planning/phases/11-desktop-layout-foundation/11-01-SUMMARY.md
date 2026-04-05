---
phase: 11-desktop-layout-foundation
plan: "01"
subsystem: frontend-layout
tags: [desktop, sidebar, layout, css, hooks]
dependency_graph:
  requires: []
  provides: [useIsDesktop, DesktopSidebar, MENU-export]
  affects: [App.tsx-layout-plan-02]
tech_stack:
  added: [lucide-react@0.454.0]
  patterns: [matchMedia-hook, inline-styles-css-vars, section-collapse-state]
key_files:
  created:
    - src/hooks/useIsDesktop.ts
    - src/components/DesktopSidebar.tsx
  modified:
    - src/index.css
    - src/components/SideMenu.tsx
    - package.json
decisions:
  - "lucide-react installed as missing dependency (per CLAUDE.md spec; not in package.json)"
  - "DesktopSidebar uses 3px transparent left border on non-active items to prevent layout shift on activation"
metrics:
  duration: "17 min"
  completed: "2026-04-05T01:00:54Z"
  tasks: 2
  files: 5
---

# Phase 11 Plan 01: Desktop Layout Foundation Building Blocks — Summary

CSS overflow scoped to mobile-only, useIsDesktop hook created with matchMedia(1024px), MENU constant exported from SideMenu, and DesktopSidebar implemented with 280px fixed width, 4 re-mapped sections, section collapse/expand, role-based nav filtering, unresolved badge, and user footer with logout.

---

## Tasks Completed

| # | Name | Commit | Key Files |
|---|------|--------|-----------|
| 1 | CSS overflow + useIsDesktop + MENU export | `6cfecde` | src/index.css, src/hooks/useIsDesktop.ts, src/components/SideMenu.tsx |
| 2 | DesktopSidebar component | `38220fd` | src/components/DesktopSidebar.tsx, package.json |

---

## Verification Results

- `grep "overflow: hidden" src/index.css` — only inside `@media (max-width: 1023px)` block
- `grep "@media (max-width: 1023px)" src/index.css` — present at line 46
- `grep "export function useIsDesktop" src/hooks/useIsDesktop.ts` — present at line 3
- `grep "export const MENU" src/components/SideMenu.tsx` — present at line 17
- `grep "export type MenuItem" src/components/SideMenu.tsx` — present at line 15
- `grep "export.*DesktopSidebar" src/components/DesktopSidebar.tsx` — present at line 20
- `grep "280" src/components/DesktopSidebar.tsx` — present at line 45
- `grep "import.*MENU" src/components/DesktopSidebar.tsx` — present at line 5
- `grep "LogOut" src/components/DesktopSidebar.tsx` — present at lines 3, 166
- 4 section labels confirmed: 점검 현황, 문서 관리, 직원 관리, 시설 관리
- `npx tsc --noEmit` — no new errors introduced (1 pre-existing error in ElevatorFindingDetailPage.tsx from other work)

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] lucide-react missing from package.json**
- **Found during:** Task 2
- **Issue:** CLAUDE.md lists lucide-react@0.454.0 as a key dependency; plan spec requires LogOut icon from lucide-react; package was not in package.json and not installed in node_modules
- **Fix:** `npm install lucide-react@0.454.0 --save` — added to dependencies in package.json
- **Files modified:** package.json, package-lock.json
- **Commit:** `38220fd`

---

## Deferred Issues

- Pre-existing TypeScript error in `src/pages/ElevatorFindingDetailPage.tsx` line 78: `resolved_date` property not in type — this is from an unstaged modification in another agent's work area; out of scope for this plan

---

## Known Stubs

None — all components are fully wired with real data from authStore and MENU constant.

---

## Key Decisions

1. **lucide-react installation:** The CLAUDE.md spec explicitly lists lucide-react as a key dependency at version 0.454.0. The plan's UI-SPEC requires LogOut from lucide-react. Installing it was the correct approach rather than using an inline SVG workaround.

2. **3px transparent border on inactive nav items:** Added `borderLeft: '3px solid transparent'` on inactive items to prevent layout shift when an item becomes active and gets a 3px left border. This ensures consistent item width across states.

3. **NavItem extracted as local function:** The individual nav item render logic was complex enough (hover state, badge, soon state, active state) to warrant a local `NavItem` function component with its own hover state management.

---

## Self-Check: PASSED

- FOUND: src/hooks/useIsDesktop.ts
- FOUND: src/components/DesktopSidebar.tsx
- FOUND: commit 6cfecde (Task 1)
- FOUND: commit 38220fd (Task 2)
