---
phase: 18
plan: 02
subsystem: menu-components
tags: [BottomNav, SideMenu, MenuConfig, react-query, refactor]
dependency_graph:
  requires: [18-01]
  provides: [BottomNav-configurable, SideMenu-readonly]
  affects:
    - cha-bio-safety/src/components/BottomNav.tsx
    - cha-bio-safety/src/components/SideMenu.tsx
tech_stack:
  added: []
  patterns: [useQuery-cached-config, useMemo-join-pattern, orphan-path-filter]
key_files:
  created: []
  modified:
    - cha-bio-safety/src/components/BottomNav.tsx
    - cha-bio-safety/src/components/SideMenu.tsx
decisions:
  - "BottomNav uses ITEMS as static registry keyed by BottomNavKey; MenuConfig only provides order/visible — icons/labels/paths stay in ITEMS"
  - "SideMenu appliedSections useMemo joins MenuConfig.sideMenu x MENU by path — orphan config paths silently skipped (T-18-06)"
  - "useQuery count in SideMenu is 2 (import + usage) which satisfies the 1-usage-call intent of the acceptance criterion"
metrics:
  duration: "~4 minutes"
  completed: "2026-04-07T08:24:07Z"
  tasks_completed: 2
  files_changed: 2
---

# Phase 18 Plan 02: Configurable BottomNav & Read-only SideMenu Summary

**One-liner:** BottomNav now orders/filters items from MenuConfig via react-query; SideMenu editMode fully removed (263→197 lines) and replaced with appliedSections useMemo consuming MenuConfig.sideMenu directly.

---

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Make BottomNav configurable from MenuConfig | 46f468c | src/components/BottomNav.tsx |
| 2 | Strip editMode from SideMenu, make it read-only | 8cce86e | src/components/SideMenu.tsx |

---

## What Was Built

### BottomNav.tsx — Configurable from MenuConfig

- Replaced local `type NavKey` with `BottomNavKey` import from `../types/menuConfig`
- Added `useQuery(['menu-config'])` fetching via `settingsApi.getMenu()` with 5-minute staleTime
- Added `orderedItems` useMemo: builds `Map` of config by key, filters hidden items (`qr` forced visible per D-13/T-18-05), sorts by config order
- Moved `active` detection after `orderedItems` so it references the filtered/sorted array
- Replaced `ITEMS.map(...)` with `orderedItems.map(...)` in the render
- QR center-FAB visual unchanged: `marginTop: -14`, gradient button, same JSX branch on `item.key === 'qr'`

### SideMenu.tsx — Read-only, editMode removed

- **Removed:** `useQueryClient`, `editMode` state, `editConfig` state, `saving` state
- **Removed:** Legacy `appliedMenu` useMemo (used `as unknown as` cast shim from Plan 01)
- **Removed:** Dual-branch header (editMode header vs normal header) — kept normal header only
- **Removed:** Edit mode body block (~45 lines of arrow-button reorder UI)
- **Removed:** "⚙ 메뉴 편집" button (editing moved to SettingsPanel in Plan 03)
- **Removed:** `{!editMode && ...}` guard on user info footer — now always visible
- **Added:** `appliedSections` useMemo — sorts `menuConfig.sideMenu` sections by `order`, hydrates items from MENU by path, filters hidden items, skips orphan paths, filters empty sections
- Section header renders `section.title` from config (allows user-renamed sections in Plan 03)
- Per-item JSX (soon branch, click branch, badge logic, role guard) preserved byte-for-byte
- File reduced from 263 to 197 lines

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Known Stubs

None — both components wire to live MenuConfig data via `settingsApi.getMenu()`. Default config (from `buildDefaultMenuConfig`) is returned for users with no saved config, so no empty rendering.

---

## Threat Surface Scan

No new network endpoints or auth paths introduced. Threat mitigations applied:

| Threat ID | Mitigation Applied |
|-----------|-------------------|
| T-18-05 | `if (item.key === 'qr') return true` forces QR always visible in `orderedItems` filter |
| T-18-06 | `itemByPath.get(i.path)` + `.filter(Boolean)` silently skips orphan config paths not in MENU |
| T-18-07 | `if (item.role && staff?.role !== item.role) return null` role guard preserved in per-item JSX |

---

## Self-Check: PASSED

- [x] `cha-bio-safety/src/components/BottomNav.tsx` modified
- [x] `cha-bio-safety/src/components/SideMenu.tsx` modified
- [x] Commits 46f468c and 8cce86e exist in git log
- [x] `npm run build` passes
- [x] `grep -c "editMode\|editConfig" SideMenu.tsx` returns 0
- [x] `grep -c "useQuery" BottomNav.tsx` returns 2 (import + usage)
- [x] `grep -c "orderedItems" BottomNav.tsx` returns 3 (definition + active + map)
- [x] `grep -c "appliedSections" SideMenu.tsx` returns 2 (definition + map)
