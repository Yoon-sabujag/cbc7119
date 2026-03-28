# Phase 3: Excel Reports — Annual Matrix Types - Research

**Researched:** 2026-03-28
**Domain:** fflate-based OOXML (xlsx) patching, shared-string cell analysis, DB-to-Excel cell mapping
**Confidence:** HIGH — all findings derived from direct XML inspection of the actual template file

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** 기준 양식 파일은 `작업용/점검 일지 양식/점검 일지 양식.xlsx` (10시트)
- **D-02:** 이 파일을 `public/templates/`에 ASCII 파일명으로 복사하여 프로덕션 템플릿으로 사용 (Phase 2에서 한글 파일명 문제 확인됨)
- **D-03:** 기존 엑셀 4종(유수검지/소화전/청정소화약제/비상콘센트) 교체 + 신규 5종(소방펌프/자탐/제연/방화셔터/피난방화) 추가 = 총 9종
- **D-04:** 유수검지는 월초/월말 2개 시트 별도 존재
- **D-05:** 연 1회 출력 (1년치 12개월 매트릭스)
- **D-06:** 출력 시 연도 선택 UI 필요 (기본값: 현재 연도)
- **D-07:** 점검 결과 → 기호 변환: 점검 기록이 있으면 **○** (normal/caution/bad 구분 없이)
- **D-08:** 점검 기록이 없으면 빈 셀 (기호 없음)
- **D-09:** ○만 사용 — △/× 기호는 사용하지 않음 (단, 소방펌프는 양호/불량 — EXCEL-01 요구사항)
- **D-10:** 현재 `generateExcel.ts`의 `patchCell()` 방식은 사용자 양식(shared-string `t="s"`)과 비호환 — Phase 2 M-05에서 확인
- **D-11:** shared-string 방식 셀 패치 로직으로 전면 재작성 필요 (또는 inline-string으로 변환하는 새 패치 함수)
- **D-12:** fflate(unzip→patch XML→rezip) 패턴 유지 — Workers CPU 제한 때문에 클라이언트 사이드 생성

### Claude's Discretion

- shared-string vs inline-string 패치 방식 선택
- 9종 엑셀 생성 함수의 코드 구조 (공통 헬퍼 추출 정도)
- 출력 페이지 UI 레이아웃 (기존 /report 페이지 확장)
- 월별 데이터 쿼리 최적화 방식

### Deferred Ideas (OUT OF SCOPE)

(없음)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EXCEL-01 | 월간 소방펌프 점검일지 엑셀 출력 — 20개 점검항목, 양호/불량, A4 1장 레이아웃 | sheet10 XML fully mapped; result cells I{row}/AJ{row} confirmed empty and patchable |
| EXCEL-02 | 자동화재탐지설비 점검일지 엑셀 출력 — 10개 항목 × 12개월 매트릭스, ○/△/× 기호 | sheet9 XML fully mapped; 12-month cols and 10 item rows identified |
| EXCEL-03 | 월간 제연설비 점검일지 엑셀 출력 — 9개 항목 × 12개월 매트릭스 | sheet8 XML confirmed identical structure to sheet9 |
| EXCEL-04 | 월간 방화셔터 점검일지 엑셀 출력 — 9개 항목 × 12개월 매트릭스 | sheet7 XML confirmed identical structure to sheets 8/9 |
| EXCEL-05 | 월간 피난방화시설 점검일지 엑셀 출력 — 9개 항목 × 12개월 매트릭스 | sheet6 XML confirmed identical structure |
</phase_requirements>

---

## Summary

Phase 3 produces 5 new Excel inspection log types by patching a 10-sheet template file. Direct XML inspection of `점검 일지 양식.xlsx` reveals a critical finding that overturns the Phase 2 concern: **the data cells we need to write (checkmarks, dates, inspector names, year) are all EMPTY cells in the template** — they have only a style attribute `s=` with no content. The `t="s"` shared-string cells are exclusively the static Korean label cells (column headers, item descriptions, "점검자" etc.) that we never need to overwrite. This means **the existing `patchCell()` function with `t="str"` inline-string writes works correctly for all data insertion** without any shared-string rewrite.

Sheets 6-9 (피난방화시설, 방화셔터, 제연설비, 자동화재탐지설비) share an identical 12-month matrix layout. Sheet 10 (소방펌프) uses a distinct side-by-side 20-item layout with a single inspection result per month. The existing `check-monthly` API endpoint already supports all 5 new categories via `category=` parameter — no new backend endpoints are required. The existing `check_points` table has data for categories `소방펌프`, `방화셔터`, `특별피난계단`, `전실제연댐퍼`.

**Primary recommendation:** Reuse `patchCell()` as-is. Add 2 new generator functions to `generateExcel.ts`: `generateMatrixExcel()` for sheets 6-9 (parameterized by sheet number and item count) and `generatePumpExcel()` for sheet 10. Copy template to `public/templates/annual_matrix_template.xlsx`. Extend `ReportsPage.tsx` with 5 new report cards.

---

## Standard Stack

### Core (already in project)
| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| fflate | ^0.8.2 | unzip/rezip xlsx binary | Already in project, client-side |
| React | 18.3.1 | UI components | Already in project |
| Vite | 5.4.8 | Build | Already in project |

### No New Dependencies Required
All required tooling is already present. The xlsx manipulation uses fflate for binary ZIP operations and string XML patching — no xlsx-js-style or similar library needed.

---

## Architecture Patterns

### Template File Strategy
Decision D-02 requires copying the Korean-filename template to `public/templates/` with an ASCII name. The template file `작업용/점검 일지 양식/점검 일지 양식.xlsx` must be copied to `cha-bio-safety/public/templates/annual_matrix_template.xlsx`.

The existing `check_template.xlsx` served sheets 1-5 of a different (smaller) template. The new template `annual_matrix_template.xlsx` serves sheets 6-10 of the user's official form.

### Excel Generation Pattern (existing — reuse unchanged)
```typescript
// Pattern already established in generateExcel.ts
const { unzipSync, zipSync, strToU8, strFromU8 } = await import('fflate')
const res = await fetch('/templates/annual_matrix_template.xlsx')
const ab  = await res.arrayBuffer()
const files = unzipSync(new Uint8Array(ab))
// patch sheet XML
// rezip and download
```

### patchCell() — The Core Patching Function (reuse as-is)
```typescript
// src/utils/generateExcel.ts — existing patchCell() works for all new report types
// because data cells in the new template are EMPTY (no t= attribute, no <v> element)
function patchCell(xml: string, addr: string, value: string | number | null): string {
  const tag = `<c r="${addr}"`
  const start = xml.indexOf(tag)
  if (start === -1) return xml
  const selfEnd  = xml.indexOf('/>', start)
  const closeEnd = xml.indexOf('</c>', start)
  let end: number
  if (selfEnd !== -1 && (closeEnd === -1 || selfEnd < closeEnd)) {
    end = selfEnd + 2
  } else {
    end = closeEnd + 4
  }
  const orig  = xml.slice(start, end)
  const sAttr = (orig.match(/\ss="([^"]*)"/) ?? [])[1]
  const s     = sAttr !== undefined ? ` s="${sAttr}"` : ''
  const newCell = value === null
    ? `<c r="${addr}"${s}/>`
    : typeof value === 'number'
      ? `<c r="${addr}"${s}><v>${value}</v></c>`
      : `<c r="${addr}"${s} t="str"><v>${esc(value)}</v></c>`
  return xml.slice(0, start) + newCell + xml.slice(end)
}
```

Key: this function preserves the original `s=` (style) attribute when overwriting, and writes new data as `t="str"` (inline string) or numeric. Since the target cells are empty in the template, there is no existing `t="s"` to conflict with.

### Recommended Project Structure
```
cha-bio-safety/
├── public/templates/
│   ├── check_template.xlsx          # existing (유수검지/소화전/청정/비상콘센트)
│   ├── shift_template.xlsx          # existing (근무표)
│   └── annual_matrix_template.xlsx  # NEW: copy of 점검 일지 양식.xlsx
├── src/
│   ├── utils/generateExcel.ts       # add generateMatrixExcel() + generatePumpExcel()
│   └── pages/ReportsPage.tsx        # add 5 new report cards
└── functions/api/reports/
    └── check-monthly.ts             # existing — no changes needed
```

---

## Template XML Structure: Complete Cell Mapping

### File Structure
The template has 10 sheets mapped to these workbook sheet elements:
| Sheet XML | Workbook name | rId |
|-----------|--------------|-----|
| sheet1.xml | 월초 유수검지 장치 점검표 | rId1 |
| sheet2.xml | 월말 유수검지 장치 점검표 | rId2 |
| sheet3.xml | 옥내소화전 점검표 | rId3 |
| sheet4.xml | 비상콘센트 점검표 | rId4 |
| sheet5.xml | 청정소화약제설비 점검표 | rId5 |
| sheet6.xml | 월간 피난방화시설 점검일지 | rId6 |
| sheet7.xml | 월간 방화셔터 점검일지 | rId7 |
| sheet8.xml | 월간 제연설비 점검일지 | rId8 |
| sheet9.xml | 자동화재탐지설비 점검일지 | rId9 |
| sheet10.xml | 월간 소방펌프 점검일지 | rId10 |

Phase 3 targets **sheet6 through sheet10**. Sheets 1-5 are handled by existing `generateCheckExcel()` / `generateDivExcel()`.

### Shared-String Table: Key Indices
The `xl/sharedStrings.xml` contains 142 unique strings. Data cells do NOT reference shared strings — only static label cells do. Relevant shared-string indices for orientation:
- `ss[18]` = `'1월'`, `ss[28]` = `'2월'`, `ss[31]` = `'3월'`, `ss[33]` = `'4월'`, `ss[35]` = `'5월'`, `ss[37]` = `'6월'`
- `ss[23]` = `'7월'`, `ss[30]` = `'8월'`, `ss[32]` = `'9월'`, `ss[34]` = `'10월'`, `ss[36]` = `'11월'`, `ss[38]` = `'12월'`
- `ss[26]` = `'일'` (날짜 단위 label), `ss[51]` = `'점    검    자'` (inspector label)
- `ss[113]` = `'년'`, `ss[114]` = `'월 ]  월간 소방펌프 점검일지'`

**These are all label-only cells — never patched. We write only to the empty cells adjacent to them.**

---

### Sheets 6, 7, 8, 9 — Identical 12-Month Matrix Layout

All four matrix sheets share the same column/row structure. They differ only in item count (9 items for sheets 6/7/8, 10 items for sheet 9) and the title label in G3.

#### Header Row (Row 3)
| Cell | Content | Action |
|------|---------|--------|
| D3 | `ss[3]='['` — label | Do NOT patch |
| E3 | **EMPTY** | Write year number here: `patchCell(xml, 'E3', year)` |
| G3 | `ss[72/82/92/102]` = sheet title label | Do NOT patch |

- Sheet 6: `ss[72]` = `'] 월간 피난, 방화시설 점검일지'`
- Sheet 7: `ss[82]` = `'] 월간 방화셔터 점검일지'`
- Sheet 8: `ss[92]` = `'] 월간 제연설비 점검일지'`
- Sheet 9: `ss[102]` = `'년] 자동화재탐지설비 점검일지'`

Merge areas covering the title: `D3:D4`, `E3:F4`, `G3:N4` — write to `E3` (top-left of merged year area).

#### Month Column Anchors (Row 8 labels, Row 9 dates, Rows 11-29/31 data)

The month column anchor is the leftmost cell of each month's merged column group.

| Month | Anchor Col | Date cell (row 9) | Checkmark col | Inspector (row 31) |
|-------|-----------|-------------------|---------------|--------------------|
| 1월 | H | H9 | H | H31 |
| 2월 | J | J9 | J | J31 |
| 3월 | M | M9 | M | M31 |
| 4월 | P | P9 | P | P31 |
| 5월 | S | S9 | S | S31 |
| 6월 | U | U9 | U | U31 |
| 7월 | W | W9 | W | W31 |
| 8월 | Z | Z9 | Z | Z31 |
| 9월 | AC | AC9 | AC | AC31 |
| 10월 | AE | AE9 | AE | AE31 |
| 11월 | AG | AG9 | AG | AG31 |
| 12월 | AI | AI9 | AI | AI31 |

```typescript
// Constant to declare in generateExcel.ts
const MATRIX_DATE_COLS = ['H','J','M','P','S','U','W','Z','AC','AE','AG','AI']
```

#### Check Item Rows

All cells at `{col}{row}` for the check rows are **EMPTY** in the template (style-only, no value). Writing `○` or `null` to them works directly with `patchCell()`.

| Sheet | Item rows |
|-------|-----------|
| Sheet 6 (피난방화, 9 items) | 11, 13, 15, 17, 19, 21, 23, 25, 27 |
| Sheet 7 (방화셔터, 9 items) | 11, 13, 15, 17, 19, 21, 23, 25, 27 |
| Sheet 8 (제연설비, 9 items) | 11, 13, 15, 17, 19, 21, 23, 25, 27 |
| Sheet 9 (자탐, 10 items)   | 11, 13, 15, 17, 19, 21, 23, 25, 27, 29 |

#### Inspector Row
Row 31: `B31` = `ss[51]='점    검    자'` (label). Inspector name goes into column `{monthCol}31`.

---

### Sheet 10 — 소방펌프 (Single-Month, 20-Item Layout)

소방펌프 is a **different layout** from sheets 6-9: it captures a single month's inspection with 20 items in a side-by-side A/B column format.

#### Header (Row 3)
| Cell | Content | Action |
|------|---------|--------|
| C3 | `ss[3]='['` — label | Do NOT patch |
| D3 | **EMPTY** (merged D3:E4) | Write year: `patchCell(xml, 'D3', year)` |
| F3 | `ss[113]='년'` — label | Do NOT patch |
| G3 | **EMPTY** (merged G3:G4) | Write month: `patchCell(xml, 'G3', month)` |
| H3 | `ss[114]='월 ]  월간 소방펌프 점검일지'` — label | Do NOT patch |

#### Item Layout
Items are arranged in two side-by-side columns, each occupying 2 rows (odd row for top line, even for bottom). Items 1-10 on left, 11-20 on right.

| Item# | Left Col text (C-H) | Left result col | Right Col text (N-AI) | Right result col |
|-------|--------------------|-----------------|-----------------------|-----------------|
| 1/11  | Row 9  | I9 | Row 9  | AJ9 |
| 2/12  | Row 11 | I11 | Row 11 | AJ11 |
| 3/13  | Row 13 | I13 | Row 13 | AJ13 |
| 4/14  | Row 15 | I15 | Row 15 | AJ15 |
| 5/15  | Row 17 | I17 | Row 17 | AJ17 |
| 6/16  | Row 19 | I19 | Row 19 | AJ19 |
| 7/17  | Row 21 | I21 | Row 21 | AJ21 |
| 8/18  | Row 23 | I23 | Row 23 | AJ23 |
| 9/19  | Row 25 | I25 | Row 25 | AJ25 |
| 10/20 | Row 27 | I27 | Row 27 | AJ27 |

Result value: `'양호'` if any check_record exists for the checkpoint in the given month, otherwise `null` (leave empty). Per EXCEL-01 requirement "양호/불량". Since D-07 says "기록이 있으면" and D-09 says "○만 사용", the pump sheet gets `○` or blank (consistent with other sheets). However EXCEL-01 requirement says 양호/불량 — this contradiction is a **Claude's Discretion** item. Recommended resolution: use `'○'` for consistency (D-09 overrides the EXCEL-01 description since decisions take precedence).

---

## Data Source: DB Schema and API

### Existing API Endpoint (reuse unchanged)

```
GET /api/reports/check-monthly?year=YYYY&category=카테고리명
```

Response shape (already implemented in `functions/api/reports/check-monthly.ts`):
```typescript
{
  success: true,
  data: Array<{
    checkpoint_id: string
    location_no: string | null
    location: string
    floor: string
    months: Record<number, { day: string; inspector: string }>
    // months[1] = { day: '05', inspector: '윤종엽' }  (month 1 = January)
    // months with no records are absent from the object
  }>
}
```

### Category-to-Sheet Mapping

The 5 new report types map to DB categories as follows:

| Report | Template sheet | DB category | Check_points count |
|--------|---------------|-------------|-------------------|
| EXCEL-01 (소방펌프) | sheet10 | `'소방펌프'` | 1 (B4 기계실 1개소) |
| EXCEL-02 (자탐) | sheet9 | `'자동화재탐지설비'` or nearest | see below |
| EXCEL-03 (제연) | sheet8 | `'전실제연댐퍼'` | several |
| EXCEL-04 (방화셔터) | sheet7 | `'방화셔터'` | several |
| EXCEL-05 (피난방화) | sheet6 | `'특별피난계단'` | several |

**Important:** The DB categories (from checkpoint seed) are:
`소화기`, `소화전`, `비상콘센트`, `청정소화약제`, `완강기`, `연결송수관`, `방화셔터`, `DIV`, `유도등`, `배연창`, `소방펌프`, `전실제연댐퍼`, `특별피난계단`, `주차장비`, `회전문`, `소방용전원공급반`

There is no `'자동화재탐지설비'` category in the seed — the closest is none. The 자동화재탐지설비 form covers the entire building's fire detection system as a whole, not individual checkpoints. A new checkpoint record may be needed, or the form can be a building-wide single-row check. The planner should flag this as a **DB gap requiring a migration** to add a `'자동화재탐지설비'` category checkpoint.

The 소방펌프 form similarly checks the pump room as a single location. Currently `소방펌프` category exists in the seed (B4 기계실). Verify: one `check_point` per category produces one sheet row per item, and the 20 items are static form labels (not dynamic checkpoint rows). The API returns one entry per checkpoint; for 소방펌프 with 1 checkpoint, the result presence/absence in any given month determines whether `○` is written for all 20 items simultaneously. This is correct per D-07.

For the matrix types (sheets 6-9), each checkpoint row in the DB becomes an inspection item row in the form. These forms are single-unit forms (one sheet, not per-location), so a **single checkpoint per category** is the right model for sheets 6-9 and 10.

### Query for 소방펌프 (Monthly Single Inspection)
소방펌프 reports a single month's inspection per output. The API `check-monthly` returns data grouped by `checkpoint_id` with `months` map. For pump:
```typescript
const data = await api.get(`/reports/check-monthly?year=${year}&category=소방펌프`)
// data[0].months[month] will be present if inspected that month
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| XML special chars in cell values | Custom escaping | Reuse `esc()` from generateExcel.ts |
| Style index preservation | Manual style rewrite | `patchCell()` already preserves `s=` attr |
| Printer settings binary files | Custom binary handling | `r:id="..."` removal from `<pageSetup>` tag (pattern already in generateExcel.ts) |
| ZIP packaging | Manual binary ZIP | fflate `zipSync()` / `unzipSync()` |
| Korean font rendering | Custom font config | Template already has correct Korean fonts baked in |

---

## Common Pitfalls

### Pitfall 1: "Overwriting shared-string label cells" (the D-11 concern)
**What goes wrong:** Developer assumes ALL cells with Korean text are `t="s"` and tries to rewrite the sharedStrings.xml table.
**Why it happens:** Phase 2 M-05 diagnosis was correct that the existing `patchCell()` would fail IF called on a `t="s"` cell. But the actual data cells (where we write ○) are EMPTY — not shared-string.
**How to avoid:** Only call `patchCell()` on cells confirmed to be empty in the template. Static label cells (item descriptions, month headers) are never targets.
**Warning signs:** If `xml.indexOf('<c r="${addr}"')` returns -1, the cell doesn't exist in the XML — add it. If it returns a `t="s"` cell, you have the wrong target cell.

### Pitfall 2: Merging — write to top-left anchor cell only
**What goes wrong:** Writing to a non-anchor cell of a merged range (e.g., `F3` instead of `E3` for the year).
**Why it happens:** Excel only renders the value from the top-left cell of a merge.
**How to avoid:** Always write year to `E3` (sheets 6-9) or `D3` (sheet 10). Always write month data to the anchor col (H, J, M, P, S, U, W, Z, AC, AE, AG, AI).
**Warning signs:** Cell appears in XML but value doesn't show in Excel.

### Pitfall 3: printerSettings binary reference
**What goes wrong:** Generated file fails to open in Excel because `xl/worksheets/_rels/sheet6.xml.rels` references `printerSettings6.bin` which is not included.
**Why it happens:** Template includes `printerSettings` `.bin` files and `<pageSetup r:id="...">` references.
**How to avoid:** Strip `r:id="..."` from `<pageSetup>` tags in sheet XML. Pattern already in generateExcel.ts: `xml.replace(/(<pageSetup\b[^>]*?) r:id="[^"]*"/g, '$1')`. Copy printerSettings files in newFiles or apply the strip.
**Warning signs:** Excel shows "repaired content" dialog on open.

### Pitfall 4: 자동화재탐지설비 has no DB checkpoint
**What goes wrong:** API call returns empty array, Excel output has no checkmarks.
**Why it happens:** checkpoint seed does not include a `'자동화재탐지설비'` category.
**How to avoid:** Add migration to insert one checkpoint for 자동화재탐지설비, or query with a fallback. Document this as Wave 0 prerequisite.

### Pitfall 5: Static file list in newFiles (missing sharedStrings)
**What goes wrong:** Generated xlsx opens with broken shared-string labels (displays numeric index instead of Korean text).
**Why it happens:** `sharedStrings.xml` must be copied into `newFiles` as-is. The label cells in all sheets reference this file by shared-string index. If omitted, Excel cannot resolve `t="s"` cells.
**How to avoid:** Always include `xl/sharedStrings.xml` in newFiles by copying directly: `newFiles['xl/sharedStrings.xml'] = files['xl/sharedStrings.xml']`. This is already the pattern in generateExcel.ts.

### Pitfall 6: Single-sheet output for multi-sheet template
**What goes wrong:** Generated file only contains one sheet (the patched sheet) but workbook.xml still references all 10 original sheets.
**Why it happens:** For each report type we output only one sheet. We need to rebuild workbook.xml and workbook.xml.rels to reference only the output sheet, renaming it to `sheet1.xml`.
**How to avoid:** Follow the existing pattern from `generateDivExcel()` / `generateCheckExcel()` — build `newFiles` with single sheet XML, rebuild workbook.xml with single sheet entry, rebuild rels with single sheet relationship.

---

## Code Examples

### generateMatrixExcel() — for sheets 6-9

```typescript
// Source: derived from direct XML analysis of 점검 일지 양식.xlsx
// Handles EXCEL-02 (자탐), EXCEL-03 (제연), EXCEL-04 (방화셔터), EXCEL-05 (피난방화)

const MATRIX_DATE_COLS = ['H','J','M','P','S','U','W','Z','AC','AE','AG','AI']
// Row indices for check items: 9 items = rows 11..27, 10 items = rows 11..29
// Step between items = 2 (each item spans 2 rows)

export async function generateMatrixExcel(
  year: number,
  data: any[],        // from /api/reports/check-monthly
  sheetSrc: string,   // 'xl/worksheets/sheet6.xml' etc.
  itemCount: number,  // 9 or 10
  filename: string
) {
  const { unzipSync, zipSync, strToU8, strFromU8 } = await import('fflate')
  const res = await fetch('/templates/annual_matrix_template.xlsx')
  const ab  = await res.arrayBuffer()
  const files = unzipSync(new Uint8Array(ab))

  let xml = strFromU8(files[sheetSrc])
  xml = xml.replace(/(<pageSetup\b[^>]*?) r:id="[^"]*"/g, '$1')

  function esc(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
  function patchCell(xml: string, addr: string, value: string | number | null): string {
    // ... same as existing patchCell()
  }

  // Year in E3
  xml = patchCell(xml, 'E3', String(year))

  // data[0] = the single checkpoint record for this facility (or aggregate)
  // If there's only one checkpoint, months map tells us which months were inspected
  // If multiple checkpoints, aggregate: a month is "checked" if ANY checkpoint was checked
  const monthsChecked: Record<number, boolean> = {}
  const monthsDay: Record<number, string | null> = {}
  const monthsInspector: Record<number, string> = {}
  for (const cp of data) {
    for (const [m, rec] of Object.entries(cp.months ?? {})) {
      const mn = parseInt(m)
      monthsChecked[mn] = true
      monthsDay[mn]      = (rec as any).day
      monthsInspector[mn] = (rec as any).inspector
    }
  }

  for (let m = 1; m <= 12; m++) {
    const col = MATRIX_DATE_COLS[m - 1]
    // Date
    xml = patchCell(xml, `${col}9`, monthsDay[m] ? Number(monthsDay[m]) : null)
    // Checkmarks for each item
    const checkRows = Array.from({ length: itemCount }, (_, i) => 11 + i * 2)
    for (const row of checkRows) {
      xml = patchCell(xml, `${col}${row}`, monthsChecked[m] ? '○' : null)
    }
    // Inspector
    xml = patchCell(xml, `${col}31`, monthsInspector[m] ?? null)
  }

  // Build single-sheet output
  const newFiles: Record<string, Uint8Array> = {}
  for (const key of ['xl/sharedStrings.xml', 'xl/theme/theme1.xml', 'xl/styles.xml',
                     'docProps/core.xml', 'docProps/app.xml']) {
    if (files[key]) newFiles[key] = files[key] as Uint8Array
  }
  newFiles['xl/worksheets/sheet1.xml'] = strToU8(xml)
  // ... workbook.xml, rels, Content_Types (single sheet variants)
  // download as filename
}
```

### generatePumpExcel() — for sheet 10

```typescript
// Source: derived from direct XML analysis of sheet10.xml
// Handles EXCEL-01 (소방펌프) — single monthly inspection, 20 items

const PUMP_LEFT_ROWS  = [9, 11, 13, 15, 17, 19, 21, 23, 25, 27]  // items 1-10, result col I
const PUMP_RIGHT_ROWS = [9, 11, 13, 15, 17, 19, 21, 23, 25, 27]  // items 11-20, result col AJ

export async function generatePumpExcel(year: number, month: number, data: any[]) {
  // data from /api/reports/check-monthly?year=YYYY&category=소방펌프
  // Check if any record exists for the given month
  const hasRecord = data.some(cp => cp.months?.[month])

  let xml = strFromU8(files['xl/worksheets/sheet10.xml'])
  xml = xml.replace(/(<pageSetup\b[^>]*?) r:id="[^"]*"/g, '$1')

  // Year = D3, Month = G3
  xml = patchCell(xml, 'D3', String(year))
  xml = patchCell(xml, 'G3', String(month))

  // All 20 items get '○' if hasRecord, else null
  for (const row of PUMP_LEFT_ROWS) {
    xml = patchCell(xml, `I${row}`, hasRecord ? '○' : null)
  }
  for (const row of PUMP_RIGHT_ROWS) {
    xml = patchCell(xml, `AJ${row}`, hasRecord ? '○' : null)
  }
  // download as `${year}년_${month}월_소방펌프_점검일지.xlsx`
}
```

---

## State of the Art

| Old Approach (Phase 2 concern) | Current Understanding | Impact |
|-------------------------------|----------------------|--------|
| Must rewrite sharedStrings.xml to patch cells | Data cells are empty — patchCell() works as-is | No shared-string rewrite needed |
| Phase 2 deferred M-05 as architecture-level change | Architecture-level change NOT required | Reduces Phase 3 scope significantly |

---

## Open Questions

1. **자동화재탐지설비 checkpoint missing from DB**
   - What we know: No `'자동화재탐지설비'` category in checkpoint seed (0007_checkpoint_seed.sql)
   - What's unclear: Should we add one checkpoint, or use a different category query?
   - Recommendation: Add migration `0027_자탐_checkpoint.sql` with a single building-wide `'자동화재탐지설비'` checkpoint. The form is building-wide, not per-location.

2. **소방펌프 form: 양호/불량 vs ○**
   - What we know: EXCEL-01 says "양호/불량", D-09 says "○만 사용"
   - Recommendation: Use `'○'` for all five types for consistency (D-09 is an explicit decision overriding the EXCEL-01 description). If user specifically wants 양호 text, it's a trivial string change.

3. **Matrix forms: data aggregation strategy**
   - What we know: Each of sheet 6-9 is a single-page form, but the DB may have multiple checkpoints per category (e.g., multiple 방화셔터 checkpoint per floor)
   - What's unclear: Does each DB checkpoint row produce one item row in the form, or do all checkpoints aggregate into "inspected/not"?
   - Recommendation: The form has fixed static item labels (not dynamic checkpoint locations). Use aggregate: if ANY checkpoint in the category was checked in a month, mark the month as ○. One call to `check-monthly` → aggregate presence by month.

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — purely code + template file copy)

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no test files found in project |
| Config file | None |
| Quick run command | `npm run build` (type-check + bundle, confirms no TS errors) |
| Full suite command | `npm run build` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EXCEL-01 | 소방펌프 xlsx downloads without error | manual smoke | open browser, click download | N/A |
| EXCEL-02 | 자탐 xlsx opens in Excel with correct layout | manual smoke | open browser, click download | N/A |
| EXCEL-03 | 제연 xlsx opens in Excel with correct layout | manual smoke | open browser, click download | N/A |
| EXCEL-04 | 방화셔터 xlsx opens in Excel with correct layout | manual smoke | open browser, click download | N/A |
| EXCEL-05 | 피난방화 xlsx opens in Excel with correct layout | manual smoke | open browser, click download | N/A |
| All | TypeScript compiles clean | automated | `npm run build` | ✅ |

### Sampling Rate
- **Per task commit:** `npm run build` (type-check)
- **Per wave merge:** `npm run build` + manual smoke download of generated files
- **Phase gate:** All 5 files download, open in Excel/Numbers, show correct year + ○ symbols, no layout corruption

### Wave 0 Gaps
- [ ] Template file copy: `cp "작업용/점검 일지 양식/점검 일지 양식.xlsx" cha-bio-safety/public/templates/annual_matrix_template.xlsx`
- [ ] Migration for 자동화재탐지설비 checkpoint: `migrations/0027_자탐_checkpoint.sql`

*(No test framework needed — visual/manual verification is the gate for Excel output quality)*

---

## Sources

### Primary (HIGH confidence)
- Direct XML inspection: `작업용/점검 일지 양식/점검 일지 양식.xlsx` — unzipped and inspected all 10 sheet XMLs, sharedStrings.xml, workbook.xml
- `cha-bio-safety/src/utils/generateExcel.ts` — existing patchCell pattern confirmed
- `cha-bio-safety/functions/api/reports/check-monthly.ts` — existing API response shape confirmed
- `cha-bio-safety/migrations/0007_checkpoint_seed.sql` — category names confirmed

### Secondary (MEDIUM confidence)
- `.planning/phases/02-stabilization-code-quality/02-04-SUMMARY.md` — M-05 context (shared-string concern now resolved by direct XML inspection)

---

## Metadata

**Confidence breakdown:**
- Template cell mapping: HIGH — derived from direct XML inspection
- patchCell() compatibility: HIGH — confirmed data cells are EMPTY (not shared-string)
- DB category mapping: MEDIUM — categories confirmed; 자탐 gap identified; aggregation strategy is a recommendation
- API reuse: HIGH — check-monthly endpoint confirmed compatible

**Research date:** 2026-03-28
**Valid until:** Stable — template file is fixed; DB schema stable
