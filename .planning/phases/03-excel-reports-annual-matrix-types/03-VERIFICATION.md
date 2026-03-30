---
phase: 03-excel-reports-annual-matrix-types
verified: 2026-03-31T12:00:00Z
status: gaps_found
score: 3/4 must-haves verified
gaps:
  - truth: "자동화재탐지설비 점검일지를 출력하면 10개 항목 x 12개월 매트릭스에 기호가 채워진 엑셀 파일이 다운로드된다"
    status: failed
    reason: "MATRIX_CONFIG maps '자탐' to category='소방용전원공급반' but migration 0027 adds checkpoint with category='자동화재탐지설비'. The check-monthly API filters by category, so the 자탐 report fetches data from the wrong DB category. The report will pull 소방용전원공급반 inspection records instead of 자동화재탐지설비 records."
    artifacts:
      - path: "cha-bio-safety/src/pages/ReportsPage.tsx"
        issue: "Line 26: MATRIX_CONFIG['자탐'].category is '소방용전원공급반' — should be '자동화재탐지설비'"
    missing:
      - "Fix MATRIX_CONFIG['자탐'].category from '소방용전원공급반' to '자동화재탐지설비' in ReportsPage.tsx line 26"
human_verification:
  - test: "Download all 5 new Excel reports and open in Excel/Numbers"
    expected: "Files open without repair dialogs, Korean text displays correctly, layout matches official form"
    why_human: "Excel rendering fidelity and visual layout correctness cannot be verified programmatically"
  - test: "Download matrix reports for a year with check records and verify data"
    expected: "Months with inspections show circle marks, months without show blank cells, inspector names filled"
    why_human: "Requires running dev server, having test data in DB, and visual verification of cell contents"
  - test: "Download pump report and verify multi-sheet output"
    expected: "One sheet per month with records, each sheet has year/month header and circle marks in I/AJ columns"
    why_human: "Requires running dev server and visual inspection of multi-sheet workbook"
---

# Phase 3: Excel Reports -- Annual Matrix Types Verification Report

**Phase Goal:** 법정 요구 5종 연간 매트릭스 점검일지를 현장 양식과 동일한 레이아웃으로 즉시 출력할 수 있다
**Verified:** 2026-03-31
**Status:** gaps_found
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 소방펌프 점검일지를 출력하면 20개 점검항목과 양호/불량 기호가 기재된 엑셀 파일이 다운로드된다 | VERIFIED | `generatePumpExcel()` at line 503 fetches sheet10 template, writes circle marks to I/AJ columns for 20 items across PUMP_RESULT_ROWS. ReportsPage.tsx line 60-64 calls it with correct category='소방펌프'. Design changed from per-month to multi-sheet (one tab per month with records) which is a reasonable improvement. |
| 2 | 자탐/제연/방화셔터/피난방화시설 각각의 점검일지를 출력하면 매트릭스에 기호가 채워진 엑셀 파일이 다운로드된다 | FAILED | `generateMatrixExcel()` at line 406 is correctly implemented for matrix output. However, MATRIX_CONFIG in ReportsPage.tsx line 26 maps '자탐' to category='소방용전원공급반' instead of '자동화재탐지설비'. The 자탐 report queries wrong DB category, producing incorrect data. The other 3 types (제연/방화셔터/피난방화) have correct category mappings. |
| 3 | 출력된 엑셀 파일이 Excel/Numbers에서 열릴 때 레이아웃 손상이나 깨진 문자가 없다 | ? UNCERTAIN | Template file exists (69,578 bytes). `pageSetup r:id` stripping applied per research pitfalls. Cannot verify rendering fidelity without running app and opening files in Excel. |
| 4 | 각 점검일지는 점검 기록 DB 데이터를 기반으로 자동 채워진다 (수동 입력 불필요) | VERIFIED | check-monthly API (functions/api/reports/check-monthly.ts) queries D1 DB with real SQL joins across check_points, check_records, and staff tables. ReportsPage.tsx fetches this API and passes data to generator functions. No hardcoded data. |

**Score:** 3/4 truths verified (1 failed due to category mismatch, 1 needs human verification for visual fidelity)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `cha-bio-safety/public/templates/annual_matrix_template.xlsx` | 10-sheet template for annual matrix reports | VERIFIED | Exists, 69,578 bytes |
| `cha-bio-safety/migrations/0027_자탐_checkpoint.sql` | DB migration adding 자동화재탐지설비 checkpoint | VERIFIED | Inserts cp-fire-detect-01 with category='자동화재탐지설비' |
| `cha-bio-safety/src/utils/generateExcel.ts` | generateMatrixExcel and generatePumpExcel functions | VERIFIED | Both exported at lines 406 and 503 respectively |
| `cha-bio-safety/src/pages/ReportsPage.tsx` | Complete reports page with 10 report types | VERIFIED (with issue) | 10 report cards present, MATRIX_CONFIG has category mismatch for 자탐 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| ReportsPage.tsx | generateMatrixExcel | import + call on click | WIRED | Line 4 imports, line 59 calls with MATRIX_CONFIG params |
| ReportsPage.tsx | generatePumpExcel | import + call on click | WIRED | Line 4 imports, line 64 calls with (year, data) |
| ReportsPage.tsx | /api/reports/check-monthly | api.get with category | WIRED | Lines 45-46 and 61-63 fetch with year+category params |
| generateMatrixExcel | annual_matrix_template.xlsx | fetch in function | WIRED | Line 416 fetches '/templates/annual_matrix_template.xlsx' |
| generatePumpExcel | annual_matrix_template.xlsx | fetch in function | WIRED | Line 509 fetches '/templates/annual_matrix_template.xlsx' |
| check-monthly API | D1 database | SQL query with category filter | WIRED | Lines 10-27 query check_points JOIN check_records JOIN staff |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| ReportsPage.tsx (matrix) | data from api.get | /api/reports/check-monthly?category=X | Yes -- SQL query joins check_points/check_records/staff | FLOWING (for 피난방화/방화셔터/제연) |
| ReportsPage.tsx (자탐) | data from api.get | /api/reports/check-monthly?category=소방용전원공급반 | WRONG CATEGORY -- queries 소방용전원공급반 instead of 자동화재탐지설비 | DISCONNECTED |
| ReportsPage.tsx (pump) | data from api.get | /api/reports/check-monthly?category=소방펌프 | Yes -- SQL query with category filter | FLOWING |

### Behavioral Spot-Checks

Step 7b: SKIPPED (requires running dev server with D1 database to test API endpoints and Excel generation)

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| EXCEL-01 | 03-01, 03-02 | 월간 소방펌프 점검일지 엑셀 출력 | SATISFIED | generatePumpExcel writes 20 items to I/AJ columns, ReportsPage wires download button |
| EXCEL-02 | 03-01, 03-02 | 자동화재탐지설비 점검일지 엑셀 출력 | BLOCKED | Migration adds correct category, but MATRIX_CONFIG queries wrong category ('소방용전원공급반' instead of '자동화재탐지설비'). Report will show wrong data. |
| EXCEL-03 | 03-01, 03-02 | 월간 제연설비 점검일지 엑셀 출력 | SATISFIED | MATRIX_CONFIG maps to '전실제연댐퍼', generateMatrixExcel handles 9-item sheet 8 |
| EXCEL-04 | 03-01, 03-02 | 월간 방화셔터 점검일지 엑셀 출력 | SATISFIED | MATRIX_CONFIG maps to '방화셔터', generateMatrixExcel handles 9-item sheet 7 |
| EXCEL-05 | 03-01, 03-02 | 월간 피난방화시설 점검일지 엑셀 출력 | SATISFIED | MATRIX_CONFIG maps to '특별피난계단', generateMatrixExcel handles 9-item sheet 6 |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| ReportsPage.tsx | 26 | Wrong category value '소방용전원공급반' for 자탐 report | Blocker | EXCEL-02 fetches wrong data from DB; report shows 소방용전원공급반 records instead of 자동화재탐지설비 |
| generateMatrixExcel | 479-482 | Outputs entire 10-sheet template (only 1 sheet patched) | Warning | Downloaded file includes all 10 template sheets; only the target sheet has data. File is larger than necessary and may confuse users seeing unmodified sheets. |
| ReportsPage.tsx | 49-57 | Hardcoded staff names for inspector randomization | Info | ASSISTANTS array ['석현민','김병조','박보융'] is hardcoded; if staff changes this must be updated manually |

### Human Verification Required

### 1. Excel File Layout Fidelity

**Test:** Download each of the 5 new report types and open in Excel and/or Numbers
**Expected:** Files open without "repair" dialogs; Korean text (item labels, headers) displays correctly; layout matches the official 점검 일지 양식
**Why human:** Visual rendering fidelity of Excel files cannot be verified programmatically

### 2. Circle Mark Placement Accuracy

**Test:** For a year with existing check records, download matrix reports and verify cell positions
**Expected:** Months with inspections show circle marks in correct column/row intersections; months without records show blank cells; date row shows inspection day number; inspector row shows inspector name
**Why human:** Requires running app with seeded DB data and manually inspecting cell positions in spreadsheet

### 3. Pump Report Multi-Sheet Output

**Test:** Download pump report for a year with multiple months of records
**Expected:** Workbook contains one tab per month (named "1월", "3월", etc.); each tab shows year in D3, month in G3, and circle marks in I/AJ columns for all 20 items
**Why human:** Requires running dev server and inspecting multi-sheet workbook structure

### Gaps Summary

**One blocker found:** The 자탐 (자동화재탐지설비) report has a category mismatch between the UI config and the database. `MATRIX_CONFIG['자탐'].category` in ReportsPage.tsx line 26 is set to `'소방용전원공급반'`, but the migration 0027 created the checkpoint with `category='자동화재탐지설비'`. When a user downloads the 자탐 report, the API query uses `WHERE cp.category = '소방용전원공급반'`, which returns 소방용전원공급반 checkpoint data instead of the intended 자동화재탐지설비 data.

**Fix required:** Change `MATRIX_CONFIG['자탐'].category` from `'소방용전원공급반'` to `'자동화재탐지설비'` in ReportsPage.tsx line 26. This is a one-line fix.

**Design deviation (non-blocking):** The pump report was redesigned from per-month output (with month selector) to multi-sheet output (all months with records in one workbook). This eliminated the need for a month selector UI. This is a reasonable design improvement -- users get all months at once instead of downloading one month at a time.

---

_Verified: 2026-03-31T12:00:00Z_
_Verifier: Claude (gsd-verifier)_
