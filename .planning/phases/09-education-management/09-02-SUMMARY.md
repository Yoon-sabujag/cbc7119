---
phase: 09-education-management
plan: "02"
subsystem: education-management
tags: [education, ui, react, date-fns, bottomsheet]
dependency_graph:
  requires: [09-01]
  provides: [education-ui, education-page-complete]
  affects: [App.tsx routing, SideMenu navigation]
tech_stack:
  added: [date-fns]
  patterns: [useQuery, useMutation, React Query cache invalidation, BottomSheet pattern, D-day calculation]
key_files:
  created: []
  modified:
    - cha-bio-safety/src/pages/EducationPage.tsx
decisions:
  - "calcNextDeadline: appointedAt+6mo for first completion, lastCompletion+2yr for subsequent — implements legal cycle per D-04/D-05/D-06"
  - "date-fns installed as missing dependency (listed in CLAUDE.md but not in package.json)"
  - "BottomSheet type auto-lock: initial locked when 0 records, refresher editable when >=1 records"
  - "Permission guard: canEdit = role===admin || staffId===currentStaffId"
metrics:
  duration_minutes: 7
  completed_date: "2026-04-02"
  tasks_completed: 1
  tasks_total: 2
  files_modified: 3
---

# Phase 09 Plan 02: Education Page UI Summary

Complete education management page (보수교육) replacing the placeholder with full staff cards, D-day badge system, and BottomSheet for completion record create/edit.

## What Was Built

`EducationPage.tsx` (555 lines) — Full implementation per UI-SPEC.md D-01 through D-13:

- **Staff education cards** with avatar (first char), name (16px 700), title (13px 400), last completion record, and next deadline
- **D-day badge system**: safe (D>30, green), warn (0-30, yellow), danger (<0, red "D+N 초과"); hidden for null `appointedAt`
- **선임일 미등록** state: replaces deadline row when `appointedAt` is null
- **calcNextDeadline function**: appointedAt+6mo for first completion (첫 실무교육), lastCompletion+2yr for subsequent (보수교육)
- **BottomSheet** (교육 이수 등록/수정): slideUp animation, drag handle, date input, type selector (auto-set + lock logic), record history list with inline 수정 button
- **Permission guard**: admin can edit all cards; assistant can only open their own card's BottomSheet
- **React Query mutations**: create + update with cache invalidation and toast notifications (success/error)
- **Skeleton loading**: 4 skeleton cards matching RemediationPage.tsx SKELETON_STYLE
- **Error state**: centered danger-color error message per UI-SPEC copywriting

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] date-fns not installed**
- **Found during:** Task 1 build verification
- **Issue:** `date-fns` listed in CLAUDE.md as `date-fns 4.1.0` dependency and explicitly required by plan, but not present in `package.json`
- **Fix:** `npm install date-fns` — installed version 4.1.0 as expected
- **Files modified:** `package.json`, `package-lock.json`
- **Commit:** a2e2b71

## Known Stubs

None. All data is wired through `educationApi.list()` and mutations to `/api/education`.

## Self-Check: PASSED

- EducationPage.tsx: FOUND (555 lines)
- commit a2e2b71: FOUND
