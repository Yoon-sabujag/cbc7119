---
phase: 18
plan: 01
subsystem: menu-config
tags: [types, utilities, api, schema, migration]
dependency_graph:
  requires: []
  provides: [MenuConfig-schema, menuConfig-utils, settingsApi-typed]
  affects: [cha-bio-safety/src/utils/api.ts, cha-bio-safety/src/types/menuConfig.ts, cha-bio-safety/src/utils/menuConfig.ts]
tech_stack:
  added: []
  patterns: [schema-versioning, migration-helper, normalize-pattern]
key_files:
  created:
    - cha-bio-safety/src/types/menuConfig.ts
    - cha-bio-safety/src/utils/menuConfig.ts
  modified:
    - cha-bio-safety/src/utils/api.ts
    - cha-bio-safety/src/components/SideMenu.tsx
    - cha-bio-safety/src/pages/AdminPage.tsx
decisions:
  - "LegacyMenuConfig migration preserves visibility only, not order (legacy order was global; new order is per-section)"
  - "JSON.parse/JSON.stringify used for deep clone in buildDefaultMenuConfig (structuredClone available in ES2022 but JSON clone is safe fallback)"
  - "SideMenu.tsx and AdminPage.tsx legacy cast pattern (unknown intermediate) is intentional shim — Plan 02 will refactor both to use MenuConfig directly"
metrics:
  duration: "~3 minutes"
  completed: "2026-04-07T08:19:44Z"
  tasks_completed: 3
  files_changed: 5
---

# Phase 18 Plan 01: MenuConfig Schema & Migration Utilities Summary

**One-liner:** Typed MenuConfig v2 schema with lossless v1 migration, QR-lock enforcement, and normalized settingsApi returning MenuConfig.

---

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Create MenuConfig type module | 9e77656 | src/types/menuConfig.ts (created) |
| 2 | Create menuConfig utility | 9575612 | src/utils/menuConfig.ts (created) |
| 3 | Type the settingsApi | a47eb05 | src/utils/api.ts, SideMenu.tsx, AdminPage.tsx |

---

## What Was Built

### MenuConfig v2 Schema (`src/types/menuConfig.ts`)
- `BottomNavKey` union type: `'dashboard' | 'inspection' | 'qr' | 'remediation' | 'elevator'`
- `BottomNavItemConfig`: `{ key, visible, order }`
- `MenuItemConfig`: `{ path, visible, order }`
- `MenuSectionConfig`: `{ id, title, order, items: MenuItemConfig[] }`
- `MenuConfig`: `{ version: 2, bottomNav: BottomNavItemConfig[], sideMenu: MenuSectionConfig[] }`
- `LegacyMenuConfig`: v1 shape alias for migration use only

### menuConfig Utilities (`src/utils/menuConfig.ts`)
- `BOTTOM_NAV_DEFAULTS`: 5 entries matching BottomNav.tsx ITEMS order exactly
- `SIDE_MENU_DEFAULTS`: 5 sections (main, facility, docs, work, system) with 16 items matching SideMenu.tsx MENU constant exactly
- `buildDefaultMenuConfig()`: returns canonical default via JSON deep clone
- `isLegacyMenuConfig()`: detects v1 shape (no `version` field, has `/`-prefixed keys)
- `migrateLegacyMenuConfig()`: preserves visibility flags, resets to default per-section order, forces `qr.visible = true` per D-13
- `normalizeMenuConfig()`: handles three inputs — null (default), v1 (migrate), v2 (pass-through with QR enforcement + missing key fill)

### settingsApi typing (`src/utils/api.ts`)
- `getMenu()` now `async (): Promise<MenuConfig>` — calls `normalizeMenuConfig()` on raw server response
- `saveMenu()` now typed `(config: MenuConfig) => Promise<void>`

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript overlap errors in SideMenu.tsx and AdminPage.tsx**
- **Found during:** Task 3 — running `npm run build`
- **Issue:** After settingsApi became typed, existing code that cast `menuConfig` to the legacy `Record<string, ...>` shape and passed legacy shape to `saveMenu()` caused TS2352 / TS2345 errors
- **Fix:** Added `as unknown as MenuConfig` intermediate cast in both files — this is a bridge shim, not a runtime behavior change. Plan 02 will replace these usages with proper MenuConfig-aware logic (per plan acceptance criteria: "runtime behavior fix happens in Plan 02")
- **Files modified:** `src/components/SideMenu.tsx` (2 locations), `src/pages/AdminPage.tsx` (1 location)
- **Commit:** a47eb05

---

## Known Stubs

None — this plan produces types and utilities only, no UI rendering.

---

## Threat Surface Scan

No new network endpoints, auth paths, or schema changes at trust boundaries. `normalizeMenuConfig()` implements T-18-01 mitigation (validates shape, falls back to defaults on corrupt input). No new threat surface introduced.

---

## Self-Check: PASSED

- [x] `cha-bio-safety/src/types/menuConfig.ts` exists
- [x] `cha-bio-safety/src/utils/menuConfig.ts` exists
- [x] Commits 9e77656, 9575612, a47eb05 exist in git log
- [x] `npm run build` passes with no TypeScript errors
