---
phase: 18
plan: 02
subsystem: menu-customization
tags: [editor, divider-model, side-menu, draft-state, react-query]
dependency_graph:
  requires: [18-01]
  provides: [MenuSettingsSection]
  affects: [cha-bio-safety/src/components/SettingsPanel.tsx]
tech_stack:
  added: []
  patterns: [draft-state editor, inline confirmation, auto-dismiss timer, react-query mutation]
key_files:
  created:
    - cha-bio-safety/src/components/MenuSettingsSection.tsx
  modified: []
decisions:
  - "Draft state local until explicit 설정 저장 press — no auto-save (D-19)"
  - "Arrow buttons (ChevronUp/ChevronDown) instead of drag-and-drop — mobile stability (D-18)"
  - "Inline edit/delete confirmations within same row — no modals (D-17)"
  - "Empty divider title reverts silently — no toast (CONTEXT Claude's discretion)"
  - "newDividerId uses timestamp+rand instead of nanoid — no new dep"
metrics:
  duration: "~5 minutes"
  completed: "2026-04-08"
  tasks_completed: 1
  files_modified: 1
---

# Phase 18 Plan 02: MenuSettingsSection Editor Component Summary

**One-liner:** Self-contained divider-model SideMenu editor with local draft state, inline controls, and settingsApi persistence — ready to mount into SettingsPanel.

## What Was Built

### Task 1 — MenuSettingsSection.tsx: full divider-model editor

- `MenuSettingsSection` (named export) — top-level component, 375 lines, mountable anywhere
- `useQuery(['menu-config'])` to initialize draft from server; `useMutation` via `settingsApi.saveMenu`
- Draft initialized from `serverConfig.sideMenu` on mount; falls back to `DEFAULT_SIDE_MENU`
- `dirty` flag via `entriesEqual()` deep comparison — save button disabled when no changes
- **Move up/down:** `moveUp(idx)` / `moveDown(idx)` swap adjacent entries in draft
- **Item toggle:** `toggleVisible(idx)` flips `visible` for item entries; row opacity 0.4 + "숨김" badge when hidden
- **Divider rename:** tap title → replaces span with `DividerTitleInput` (autofocus, blur-to-commit, Enter/Escape handling, max 20 chars, empty title reverts silently)
- **Divider delete:** trash icon → `DeleteConfirmInline` replaces row controls; auto-dismiss via `useRef<number>` timer after 5s
- **Add divider:** appends `{ type:'divider', id: newDividerId(), title: '새 구분선' }` and immediately enters edit mode
- **Reset to defaults:** right-aligned ghost button → inline confirmation "기본 배치로 되돌릴까요?" → replaces draft with `DEFAULT_SIDE_MENU`
- **Save button:** full-width 40px, `var(--acl)` background, disabled+opacity-0.4 when clean or pending; loading label "저장 중…"
- All UI-SPEC spacing (10px row padding, 5px gap, 36px add button, 40px save button), colors (var(--bg3), var(--t2), var(--danger), #2563eb toggle), typography (9/10/12/13px, 400/700) applied
- All Korean copy from Copywriting Contract present verbatim
- All D-04 through D-19 decisions implemented

### Subcomponents (all within same file)

- `ArrowButton` — 32×32 touch target, opacity 0.25 + pointerEvents none when disabled
- `ToggleSmall` — 38×21px, mirrors SettingsPanel Toggle exactly (ON: #2563eb, OFF: var(--bg4), 17px thumb)
- `DividerTitleInput` — autofocus input with blur/Enter/Escape commit logic
- `DeleteConfirmInline` — "삭제할까요?" + 취소 + 삭제 buttons
- `PATH_LABEL` — IIFE builds Record<path,label> from MENU constant at module init time

## Deviations from Plan

None - plan executed exactly as written. The component code in the plan was adopted as-is and verified clean.

## Known Stubs

None — component is fully wired. It reads from `settingsApi.getMenu()` and writes via `settingsApi.saveMenu()`. Not yet mounted into SettingsPanel (that is Plan 03's responsibility).

## Threat Flags

None — no new network endpoints or auth paths. Component calls existing `/api/settings/menu` via existing `settingsApi`.

## Commits

| Hash | Message |
|------|---------|
| `f8662ef` | feat(18-02): create MenuSettingsSection divider-model editor component |

## Self-Check: PASSED

- [x] `cha-bio-safety/src/components/MenuSettingsSection.tsx` exists (375 lines > 250 minimum)
- [x] `export function MenuSettingsSection` present at line 39
- [x] `+ 구분선 추가` present at line 246
- [x] `기본값으로 초기화` present at line 268
- [x] `설정 저장` present at line 285
- [x] `삭제할까요?` present at line 364
- [x] `메뉴 설정이 저장되었습니다` present at line 71
- [x] `ChevronUp`, `ChevronDown`, `Trash2` imported and used
- [x] `DEFAULT_SIDE_MENU` referenced 3 times (import, init fallback, reset)
- [x] `npx tsc --noEmit` → clean (0 errors)
- [x] Commit `f8662ef` exists in git log
