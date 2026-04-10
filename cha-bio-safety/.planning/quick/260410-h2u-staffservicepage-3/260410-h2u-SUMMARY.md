---
phase: quick
plan: 260410-h2u
subsystem: staff-service
tags: [leave-request, excel, desktop-layout, 3-column]
key-files:
  created:
    - src/utils/generateLeaveRequest.ts
    - public/templates/leave_request_template.xlsx
    - public/templates/leave_request_preview.png
  modified:
    - src/pages/StaffServicePage.tsx
decisions:
  - Left column absorbs detailPanel + menuSection + uploadSection (previously in right col of 2-col layout)
  - Checkbox black fill via addBlackFillStyle helper that adds fill to styles.xml and creates new xf entry
  - Cell mapping verified from template shared strings metadata (sheet2 documents the mapping)
metrics:
  duration: 6m
  completed: 2026-04-10
  tasks: 2
  files: 4
---

# Quick Task 260410-h2u: StaffServicePage 3-Column + Leave Request Excel

Desktop StaffServicePage refactored to 3-column layout with fflate-based leave request Excel generation from template.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Copy template files and create generateLeaveRequest.ts | 58d51d6 | generateLeaveRequest.ts, leave_request_template.xlsx, leave_request_preview.png |
| 2 | Refactor desktop to 3-column layout with leave form | 8db68d9 | StaffServicePage.tsx |

## Implementation Details

### generateLeaveRequest.ts
- Exports `LeaveRequestData` interface and `generateLeaveRequest()` async function
- Follows same fflate unzip/patch/zip pattern as generateExcel.ts
- Cell mapping from template shared strings: I12 (name), AA11/AD11/AG11 (hire date), AA12/AD12/AG12 (birth date), H15/K15/O15 (start yy/mm/dd), U15/W15/Z15 (end yy/mm/dd), AC15 (total days), J32 (phone)
- Checkbox cells: D19 (annual), J19 (condolence), S19 (sick_work), AA19 (sick_personal), D21 (health), J21 (official), S21 (other_special)
- Black fill via `addBlackFillStyle()`: adds solid FF000000 fill to fills section, creates new xf with that fillId
- U36 gets totalDays for annual leave; H39 gets reason text for non-annual types
- AC21 gets otherReason text for other_special type

### StaffServicePage 3-Column Layout
- Left: calendarGrid + legendRow + summaryCards + detailPanel + menuSection + uploadSection
- Middle (280px fixed): 7 DOC_LEAVE_TYPES buttons, otherReason textarea (conditional), phone input, date range with totalDays display, download/print buttons
- Right: A4 preview image from leave_request_preview.png
- Header: "연차 및 식사 / 휴가신청서" (desktop only)
- Mobile layout completely untouched

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED
