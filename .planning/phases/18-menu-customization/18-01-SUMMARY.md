---
phase: 18
plan: 01
subsystem: menu-customization
tags: [types, schema, side-menu, divider-model, migration]
dependency_graph:
  requires: []
  provides: [SideMenuEntry, MenuConfig, DEFAULT_SIDE_MENU, migrateLegacyMenuConfig, SideMenu-read-only]
  affects: [cha-bio-safety/src/utils/api.ts, cha-bio-safety/src/components/SideMenu.tsx, cha-bio-safety/src/pages/AdminPage.tsx]
tech_stack:
  added: []
  patterns: [divider-model flat list, union type discriminant, legacy migration helper]
key_files:
  created: []
  modified:
    - cha-bio-safety/src/utils/api.ts
    - cha-bio-safety/src/components/SideMenu.tsx
    - cha-bio-safety/src/pages/AdminPage.tsx
decisions:
  - "DEFAULT_SIDE_MENU mirrors existing MENU constant sections as flat divider+item list (D-15)"
  - "migrateLegacyMenuConfig uses DEFAULT_SIDE_MENU structure as divider backbone, overlays user visible prefs (D-16)"
  - "AdminPage.tsx MenuSettingsTab wrapped legacy config via migrateLegacyMenuConfig to fix TS error (Rule 1 auto-fix)"
metrics:
  duration: "~4 minutes"
  completed: "2026-04-08"
  tasks_completed: 2
  files_modified: 3
---

# Phase 18 Plan 01: Menu Config Types + SideMenu Read-Only Renderer Summary

**One-liner:** Divider-model MenuConfig schema added to api.ts with DEFAULT_SIDE_MENU + legacy migration, SideMenu rewritten as stateless read-only renderer over flat SideMenuEntry[].

## What Was Built

### Task 1 — api.ts: MenuConfig types + defaults + migration
- `SideMenuEntry` union type: `{ type:'item'; path; visible }` | `{ type:'divider'; id; title }`
- `MenuConfig` interface: `{ sideMenu: SideMenuEntry[] }`
- `DEFAULT_SIDE_MENU` constant: 5 dividers + 17 items in flat order matching existing MENU sections
- `migrateLegacyMenuConfig(raw)` helper: detects new schema (passthrough), converts legacy `Record<path,{visible,order}>` by overlaying user prefs on DEFAULT_SIDE_MENU backbone
- `settingsApi.getMenu()` now returns `Promise<MenuConfig>` with auto-migration on read
- `settingsApi.saveMenu()` now accepts typed `MenuConfig`

### Task 2 — SideMenu.tsx: read-only flat-list renderer
- Removed `editMode`, `editConfig`, `saving` state (D-03)
- Removed `useQueryClient` import (no longer needed in SideMenu)
- Added `ITEM_META: Record<string, MenuItem>` lookup derived from MENU constant
- Replaced `appliedMenu` useMemo with `appliedEntries: SideMenuEntry[]` consuming flat list (D-05)
- Render loop: divider entries → section heading div; item entries → filter hidden/role-gated, render clickable rows with badge support
- No edit ternary, no edit branch, no "메뉴 편집" button
- File reduced from 263 lines to 193 lines (< 200 target)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed AdminPage.tsx TS error from newly typed settingsApi.saveMenu**
- **Found during:** Task 2 verification (full tsc run)
- **Issue:** `AdminPage.tsx` line 737 called `settingsApi.saveMenu(config)` where `config` was `Record<string,{visible,order}>` — now rejected by typed `MenuConfig` parameter
- **Fix:** Added `migrateLegacyMenuConfig` import to AdminPage.tsx, wrapped `config` with `migrateLegacyMenuConfig(config)` in `mutationFn`
- **Files modified:** `cha-bio-safety/src/pages/AdminPage.tsx`
- **Commit:** `36858ef`

## Commits

| Hash | Message |
|------|---------|
| `974292e` | feat(18-01): add SideMenuEntry/MenuConfig types + DEFAULT_SIDE_MENU + migrateLegacyMenuConfig to api.ts |
| `36858ef` | feat(18-01): rewrite SideMenu as read-only flat SideMenuEntry[] renderer (D-03, D-05) |

## Known Stubs

None — SideMenu renders from server config via `settingsApi.getMenu()`. When no config exists on server, `appliedEntries` is `[]` (empty list). Plan 02 (MenuSettingsSection) will initialize the draft from DEFAULT_SIDE_MENU and provide the save path. Until Plan 02 is deployed, users will see an empty SideMenu if no prior config is saved. This is expected transient state — not a stub.

## Threat Flags

None — no new network endpoints, auth paths, or file access patterns introduced.

## Self-Check: PASSED

- [x] `cha-bio-safety/src/utils/api.ts` modified — exists
- [x] `cha-bio-safety/src/components/SideMenu.tsx` modified — exists
- [x] `cha-bio-safety/src/pages/AdminPage.tsx` modified — exists
- [x] Commit `974292e` exists in git log
- [x] Commit `36858ef` exists in git log
- [x] `npx tsc --noEmit` → clean (0 errors)
- [x] `grep -c "editMode" SideMenu.tsx` → 0
- [x] SideMenu.tsx line count: 193 (< 200)
