---
phase: 21
plan: 04
subsystem: frontend-shell
tags: [routing, menu, navigation, migration-fix]
requires: [21-01]
provides: [/documents-route, documents-menu-entry, menu-forward-merge]
affects:
  - cha-bio-safety/src/utils/api.ts
  - cha-bio-safety/src/components/SideMenu.tsx
  - cha-bio-safety/src/components/DesktopSidebar.tsx
  - cha-bio-safety/src/App.tsx
tech_added: []
patterns: [lazy-route, forward-merge-migration]
files_created: []
files_modified:
  - cha-bio-safety/src/utils/api.ts
  - cha-bio-safety/src/components/SideMenu.tsx
  - cha-bio-safety/src/components/DesktopSidebar.tsx
  - cha-bio-safety/src/App.tsx
decisions:
  - "migrateLegacyMenuConfig forward-merges missing DEFAULT_SIDE_MENU items so existing users pick up /documents without manual reset"
  - "/documents inserted at top of 문서 관리 section (before /daily-report) in all three menu surfaces"
requirements: [DOC-01, DOC-04]
metrics:
  duration_minutes: 4
  tasks_completed: 3
  files_touched: 4
completed: 2026-04-09
---

# Phase 21 Plan 04: Route & Menu Wiring Summary

Wired `/documents` route into the app shell across SideMenu, DesktopSidebar, DEFAULT_SIDE_MENU, and App.tsx — and fixed the Phase 18 migration gap so existing users with a saved `menu_config` automatically receive the new entry via forward-merge.

## Tasks

- **Task 1** — `cha-bio-safety/src/utils/api.ts`: added `{ type: 'item', path: '/documents', visible: true }` under the `d-docs` divider in `DEFAULT_SIDE_MENU`, and patched `migrateLegacyMenuConfig` so already-migrated configs get any missing DEFAULT_SIDE_MENU item paths appended. Commit: `f0357a0`.
- **Task 2** — `SideMenu.tsx` + `DesktopSidebar.tsx`: inserted `소방계획서/훈련자료` (`/documents`) at the top of the `문서 관리` section in both menu surfaces. Commit: `289f470`.
- **Task 3** — `App.tsx`: added lazy import `DocumentsPage`, `/documents` route under `<Auth>` wrapper, and `'/documents': '소방계획서/훈련자료'` PAGE_TITLES entry. Commit: `154a67b`.

## Verification

- `grep "path: '/documents'" cha-bio-safety/src/utils/api.ts` → 1 match
- `grep "existingPaths" cha-bio-safety/src/utils/api.ts` → present in migrate fn
- `grep "소방계획서/훈련자료" cha-bio-safety/src/components/SideMenu.tsx` → 1 match
- `grep "/documents" cha-bio-safety/src/components/DesktopSidebar.tsx` → 1 match
- `grep "DocumentsPage = lazy" cha-bio-safety/src/App.tsx` → 1 match
- `grep 'path="/documents"' cha-bio-safety/src/App.tsx` → 1 match
- `grep "'/documents': '소방계획서/훈련자료'" cha-bio-safety/src/App.tsx` → 1 match
- `npx tsc --noEmit` → exits 0 (after Task 1 and Task 2; `DocumentsPage` lazy import is dynamic and does not break tsc)

## Deviations from Plan

None — plan executed as written. All acceptance criteria satisfied.

## Known Stubs

- `DocumentsPage` lazy import references `./pages/DocumentsPage` which does not exist yet — will be created in Plan 21-05. Runtime navigation to `/documents` will fail until then. This is intentional per plan (Task 3 note) and does not block tsc.

## Self-Check: PASSED

- FOUND: cha-bio-safety/src/utils/api.ts (DEFAULT_SIDE_MENU /documents + forward-merge)
- FOUND: cha-bio-safety/src/components/SideMenu.tsx (소방계획서/훈련자료 entry)
- FOUND: cha-bio-safety/src/components/DesktopSidebar.tsx (/documents in 문서 관리 paths)
- FOUND: cha-bio-safety/src/App.tsx (lazy import + Route + PAGE_TITLES)
- FOUND commit: f0357a0
- FOUND commit: 289f470
- FOUND commit: 154a67b
