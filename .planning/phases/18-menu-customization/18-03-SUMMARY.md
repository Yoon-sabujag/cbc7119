---
phase: 18
plan: 03
subsystem: menu-settings-ui
tags: [MenuSettingsSection, SettingsPanel, BottomNav, SideMenu, editor, deploy]
dependency_graph:
  requires: [18-01, 18-02]
  provides: [MenuSettingsSection-component, SettingsPanel-integrated]
  affects:
    - cha-bio-safety/src/components/BottomNav.tsx
    - cha-bio-safety/src/components/MenuSettingsSection.tsx
    - cha-bio-safety/src/components/SettingsPanel.tsx
tech_stack:
  added: []
  patterns: [draft-state-pattern, accordion-editor, inline-section-move-picker, min-enforcement]
key_files:
  created:
    - cha-bio-safety/src/components/MenuSettingsSection.tsx
  modified:
    - cha-bio-safety/src/components/BottomNav.tsx
    - cha-bio-safety/src/components/SettingsPanel.tsx
decisions:
  - "BOTTOM_NAV_ITEMS exported from BottomNav.tsx as named export (was const ITEMS) — enables label lookup in MenuSettingsSection without duplication"
  - "MenuSettingsSection uses locally-redefined Row/Toggle/ArrowBtn matching SettingsPanel originals exactly (approach a from plan) — keeps SettingsPanel diff minimal"
  - "QR row in BottomNav editor renders 중앙 고정 badge with no arrows/toggle, aria-label for accessibility per D-12/D-13"
  - "Min-2 BottomNav enforcement is inline warning (not toast) with 3s auto-dismiss"
  - "Section-move picker rendered as absolutely-positioned bg2 card below item row, dismissed by clicking the same icon again"
metrics:
  duration: "~5 minutes"
  completed: "2026-04-07T08:31:00Z"
  tasks_completed: 2
  files_changed: 3
---

# Phase 18 Plan 03: MenuSettingsSection UI + SettingsPanel Integration Summary

**One-liner:** Full menu customization editor (BottomNav reorder/toggle + SideMenu accordion section editor) mounted in SettingsPanel, deployed to production at https://4019adf8.cbc7119.pages.dev.

---

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Export BOTTOM_NAV_ITEMS + create MenuSettingsSection | b4a518d | BottomNav.tsx, MenuSettingsSection.tsx (created, 534 lines) |
| 2 | Mount MenuSettingsSection in SettingsPanel + deploy | ee9da63 | SettingsPanel.tsx (+3 lines) |
| 3 | Manual UAT on production | — | checkpoint:human-verify — awaiting |

---

## What Was Built

### BottomNav.tsx — BOTTOM_NAV_ITEMS export
- Renamed `const ITEMS` → `export const BOTTOM_NAV_ITEMS` (no other changes)
- Updated 2 internal references: fallback return and `.filter()` call in `orderedItems` useMemo

### MenuSettingsSection.tsx (534 lines)
- **Local primitives:** Row (minHeight:44, bg3, borderRadius:9), Toggle (38×21, #2563eb/#bg4), ArrowBtn (28×44 touch wrapper, ▲▼ chars), SubHeader (9px uppercase)
- **State:** `draft` (structuredClone of serverConfig on load), `saving`, `expandedSection`, `editingTitleId/Value`, `confirmDeleteId`, `movePickerItemPath/SectionId`, `showMinWarning`
- **BottomNav editor:** sorted by order, QR row has 중앙 고정 badge + aria-label, other rows have up/down arrows + visibility toggle, min-2 enforcement with inline warning
- **SideMenu accordion editor:** per-section accordion (collapsed default), section row has order arrows + inline-editable title + item count badge + expand chevron + trash (empty only)
- **Item rows (expanded):** order arrows, label from MENU path lookup, section-move picker (absolutely positioned bg2 card), visibility toggle with sub-label when hidden
- **+ 새 섹션 추가:** dashed-border button at bottom, inserts new section + immediately opens title input
- **Footer:** 취소 (reset to server state) | 설정 저장 (full-width acl), plus 기본값으로 복원 reset
- **handleSave:** `settingsApi.saveMenu(draft)` → `qc.invalidateQueries(['menu-config'])` → success/error toasts

### SettingsPanel.tsx — Minimal integration
- Added 1 import line: `import { MenuSettingsSection } from './MenuSettingsSection'`
- Added 1 JSX line: `<MenuSettingsSection />` between 화면 section close and 계정 section open
- No other changes to existing sections

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Known Stubs

None — `settingsApi.saveMenu` wires to the live server endpoint. `settingsApi.getMenu()` returns live data normalized via `normalizeMenuConfig`. No mock/placeholder data.

---

## Threat Surface Scan

| Threat ID | Mitigation Applied |
|-----------|-------------------|
| T-18-08 | Draft sent as full MenuConfig to settingsApi.saveMenu; server normalizes on next getMenu via normalizeMenuConfig |
| T-18-09 | QR row has no toggle/arrows in editor; toggleBottomNavVisible guards `if (key === 'qr') return` |
| T-18-11 | Section titles render via `{section.title}` JSX expression — React escapes HTML; no dangerouslySetInnerHTML |

---

## Self-Check: PASSED

- [x] `cha-bio-safety/src/components/MenuSettingsSection.tsx` exists (534 lines)
- [x] `cha-bio-safety/src/components/BottomNav.tsx` — `export const BOTTOM_NAV_ITEMS` present, `const ITEMS:` absent
- [x] `cha-bio-safety/src/components/SettingsPanel.tsx` — import + `<MenuSettingsSection />` present at line 368
- [x] Commits b4a518d and ee9da63 exist in git log
- [x] `npm run build` passes (no TypeScript errors)
- [x] Production deploy succeeded: https://4019adf8.cbc7119.pages.dev
- [ ] Task 3 (UAT) — awaiting human verification
