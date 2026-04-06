---
phase: 13-finding-bottomsheet-restructure
plan: "01"
subsystem: legal-findings
tags: [ui, bottomsheet, location-input, combo-select, mobile-ux]
dependency_graph:
  requires: []
  provides: [FIND-02]
  affects: [LegalFindingsPage]
tech_stack:
  added: []
  patterns: [native-select-combo, conditional-text-input, preset-constants]
key_files:
  created: []
  modified:
    - cha-bio-safety/src/pages/LegalFindingsPage.tsx
decisions:
  - "ZONE_FLOOR_DETAILS is a flat list (same 13 presets for all zone/floor combos) — per D-03, no per-floor branching in first iteration"
  - "locationDetail default is '직접입력' so select starts visible with first option pre-selected"
  - "detailValue resolves to empty string exclusion via '|| undefined' to avoid blank location segments"
metrics:
  duration: "~15 min execution"
  completed: "2026-04-06"
  tasks_completed: 2
  files_modified: 1
---

# Phase 13 Plan 01: Finding BottomSheet Location Detail Combo Select Summary

**One-liner:** Native `<select>` with 13 preset location options (복도/계단실/화장실/EPS/TPS/기계실/전기실/주차장/로비/회의실/실험실/옥상) plus '직접입력' fallback text field replaces free-text locationDetail input in FindingBottomSheet.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add ZONE_FLOOR_DETAILS constant and replace free-text input with combo select | c834bbf | cha-bio-safety/src/pages/LegalFindingsPage.tsx |
| 2 | Deploy to production and verify | (no file change — deploy only) | — |

## What Was Built

- Added `ZONE_FLOOR_DETAILS` constant at module scope (after `FINDING_ITEMS`) with 13 preset location labels starting with '직접입력'
- Replaced the free-text `<input type="text">` for "위치 상세" with a native `<select>` rendering all 13 presets
- When '직접입력' is selected, a text input appears below the select (same pattern as FINDING_ITEMS custom item)
- Updated `mutationFn` location assembly: `detailValue` resolves to custom text (trimmed) when '직접입력', or the preset label otherwise
- CTA button text updated: '등록' → '지적사항 등록' per UI-SPEC copywriting contract
- Close button text updated: '취소' → '닫기' per UI-SPEC copywriting contract
- Build verified: `npm run build` exits 0, no TypeScript errors
- Production deployed to https://cbc7119.pages.dev (Cloudflare Pages, --branch production)

## Verification

- `npm run build` — PASSED (exit 0)
- `ZONE_FLOOR_DETAILS` constant exists at module scope with 13 items — CONFIRMED
- `useState('직접입력')` for locationDetail — CONFIRMED
- `useState('')` for customLocationDetail — CONFIRMED
- `<select value={locationDetail}>` renders ZONE_FLOOR_DETAILS options — CONFIRMED
- `locationDetail === '직접입력' && (` conditional text input — CONFIRMED
- `const detailValue = locationDetail === '직접입력' ? customLocationDetail.trim() : locationDetail` — CONFIRMED
- '지적사항 등록' as CTA text — CONFIRMED
- '닫기' as close button text — CONFIRMED
- Production deploy — SUCCESS (Deployment complete at https://f4970733.cbc7119.pages.dev)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. ZONE_FLOOR_DETAILS is fully wired to the select element and location assembly.

## Threat Flags

No new threat surface introduced. The `ZONE_FLOOR_DETAILS` constant is client-side UI convenience only; server-side location validation is unchanged per T-13-01 (accepted).

## Self-Check: PASSED

- File exists: cha-bio-safety/src/pages/LegalFindingsPage.tsx — FOUND
- Commit exists: c834bbf — FOUND (git log confirmed)
- Build: PASSED
- Deploy: SUCCESS
