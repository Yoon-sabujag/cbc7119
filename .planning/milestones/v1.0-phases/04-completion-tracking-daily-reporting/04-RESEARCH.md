# Phase 4: Completion Tracking & Daily Reporting - Research

**Researched:** 2026-03-30
**Domain:** Excel generation (fflate XML), schedule-inspection linkage, dashboard completion display, Korean holiday detection
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### 일일업무일지 출력 (EXCEL-06)
- **D-01:** 일별 1장 다운로드 + 월별 누적 다운로드 둘 다 지원. UI에서 날짜/월 토글로 전환.
- **D-02:** 일별 파일명: `방재업무일지(dd일).xlsx`, 월별 파일명: `일일업무일지(mm월).xlsx`
- **D-03:** 월별 누적 파일은 오늘까지만 시트 생성 (미래 날짜 제외)
- **D-04:** 별도 `/daily-report` 페이지 신설. 특이사항 입력 UI + 날짜/월 선택 + 미리보기 + 다운로드 배치.
- **D-05:** 특이사항은 `daily_notes` 전용 테이블에 DB 저장. 스키마: `daily_notes(id, date, content, created_by, created_at, updated_at)`. 날짜별 1건.
- **D-06:** 양식 시트(Sheet1)만 추출하여 `public/templates/daily_report_template.xlsx`로 템플릿화. 작성법 시트는 코드 로직에 반영.
- **D-07:** 월별 누적 파일은 템플릿 시트를 fflate XML 복제로 N개 시트 생성. 시트명 = 날짜(1일, 2일, ...).

#### 순찰 교대 로직
- **D-08:** 기준일 고정 방식(shiftCalc.ts 패턴). 매월 1일은 전월 1일 기준으로 결정, 이후는 전일 기준 교대.
- **D-09:** 평일 저녁순찰: 22:00~23:00, 휴일 저녁순찰: 21:00~22:00, 야간순찰: 01:00~02:00. 저녁/야간이 하루씩 번갈아 기재.
- **D-10:** 공휴일 판정: 토/일 + 한국 법정 공휴일. `holidays-kr` npm 패키지 활용 (https://github.com/hyunbinseo/holidays-kr).

#### 금일업무/명일업무 조건 로직
- **D-11:** 클라이언트 유틸리티 `src/utils/dailyReportCalc.ts`에 구현. 작성법 Sheet3(금일업무), Sheet4(명일업무)의 조건 로직을 코드화.
- **D-12:** 일상점검(매일), 순찰(교대), 월점검(schedule_items 기반 조건 판단), 업무/승강기/소방(schedule_items 기반) 항목을 조건에 따라 동적 생성.

#### 인원현황
- **D-13:** shiftCalc.ts 기존 로직 활용. 총원(4), 현재원, 당직, 비번, 휴무, 연차, 반차, 교육/훈련, 결원, 주간근무자, 당직자 자동 계산.
- **D-14:** 연차/반차는 leaves 테이블 조회, 교육/훈련은 schedule_items 조회.

#### 데이터 수집
- **D-15:** 서버 API 1개로 통합: `GET /api/daily-report?date=YYYY-MM-DD`. 응답에 schedule_items, elevator_faults, leaves, fire_schedules 포함.
- **D-16:** 클라이언트에서 API 데이터 + shiftCalc + dailyReportCalc 조합하여 Excel 생성.

#### 일정↔점검 연결 (LINK-01)
- **D-17:** 날짜+카테고리 자동 매칭. schedule_items.date + inspection_category를 check_records의 checked_at + checkpoint.category로 JOIN. DB 스키마 변경 없음.
- **D-18:** 일정 완료 판정: 해당 카테고리 점검 기록 1건 이상이면 '완료'.
- **D-19:** inspect 외 일정(event, elevator, task 등)은 수동 완료만 지원.
- **D-20:** 점검 완료율 계산 범위: 일정일~다음 같은 카테고리 일정일 전날. 멀티데이 점검(DIV 월2회×2일, 소화전 2일, 소화기 3일) 자연 처리.

#### 대시보드 완료 표시 (LINK-02)
- **D-21:** 체크마크 + 색상. 완료된 일정에 ✓ + 초록색 배경, 미완료는 기본색. 기존 StatusBadge 컴포넌트 활용.
- **D-22:** API 조회 시 실시간 계산. 대시보드 로드 시 check_records JOIN으로 완료 상태 계산. 별도 상태 필드 업데이트 불필요.

### Claude's Discretion
- 순찰 교대 기준일(REF_DATE) 결정 및 초기값 설정
- daily_report API의 구체적 응답 스키마
- dailyReportCalc.ts 내부 구조 및 함수 분할
- Excel XML 멀티시트 복제 구현 방식
- 대시보드 stats API 리팩토링 범위 (기존 로직 활용 vs 신규 엔드포인트)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EXCEL-06 | 일일업무일지(방재업무일지) 엑셀 출력 — 근무표/점검일정/승강기이력/소방일정 자동 기재 | fflate multi-sheet XML clone pattern, `@hyunbinseo/holidays-kr` for holiday detection, `shiftCalc.ts` reuse, `dailyReportCalc.ts` new utility |
| LINK-01 | 점검 계획 일정과 점검 기록을 자동으로 연결하여 일정별 완료 상태가 추적된다 | Existing `stats.ts` JOIN pattern; date-range window for multi-day inspections; no schema change needed |
| LINK-02 | 대시보드에서 오늘 일정의 완료/미완료 상태가 점검 기록 기반으로 자동 표시된다 | `todaySchedule` array already returned by stats API; add `completed` boolean per item; `StatusBadge` component reuse |
</phase_requirements>

---

## Summary

Phase 4 delivers three distinct but interconnected features: (1) generating the daily operations log (방재업무일지) as an `.xlsx` file with auto-filled personnel status, patrol assignments, and scheduled inspections; (2) linking inspection plan schedule entries to actual check records so completion is tracked automatically; and (3) surfacing that completion status on the dashboard's "today's schedule" card.

All three features build on patterns already proven in the codebase. The Excel generation follows the exact `fflate unzip→patch XML→rezip→download` flow used in `generateExcel.ts`. The schedule-to-inspection linkage extends the JOIN queries already written in `stats.ts` — no schema changes are needed. The dashboard display wraps the existing `todaySchedule` array with a computed `completed` boolean.

The single novel dependency is `@hyunbinseo/holidays-kr` (v3.2026.2) for Korean public holiday detection, which runs client-side and has zero external runtime cost.

**Primary recommendation:** Implement in three self-contained work streams — (A) DB migration + API for `daily_notes` table, (B) `dailyReportCalc.ts` + `DailyReportPage` + Excel generation, (C) `stats.ts` enhancement for per-schedule completion + dashboard UI update.

---

## Project Constraints (from CLAUDE.md)

- Tech stack locked to Cloudflare Pages + D1 + R2 + Workers — no new paid services
- Excel generation MUST stay client-side (Workers CPU limit, edge-runtime incompatibility with Node xlsx libs)
- TypeScript 5.6.3, React 18.3.1, fflate ^0.8.2 (already installed)
- No Prettier/ESLint configured — follow 2-space indent, single quotes, inline styles
- React component default exports for pages, named exports for utilities/hooks
- API handlers follow `onRequestGet`/`onRequestPost` Pages Functions convention
- D1 migrations numbered sequentially (`0028_*.sql`, `0029_*.sql`, ...)
- `strict: false` TypeScript — lenient types acceptable
- All user-visible strings in Korean

---

## Standard Stack

### Core (all already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| fflate | ^0.8.2 | Excel XML unzip/patch/rezip | Established project pattern; Workers-safe; no Node.js dependency |
| @tanstack/react-query | 5.59.0 | API data fetching/caching | Already used project-wide for all server state |
| date-fns | 4.1.0 | Date arithmetic (day-of-month, day-of-week) | Already in project dependencies |
| zustand | 5.0.0 | Auth state (staffId for API calls) | Established pattern |

### New Dependency
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @hyunbinseo/holidays-kr | 3.2026.2 | Korean public holiday detection for patrol scheduling | Client-side; required for D-10 holiday logic |

**Installation:**
```bash
cd cha-bio-safety && npm install @hyunbinseo/holidays-kr
```

**Version verification (confirmed 2026-03-30):**
- `@hyunbinseo/holidays-kr`: 3.2026.2 (published ~1 month ago, covers 2024–2026 holiday data)
- `fflate`: 0.8.2 (current stable, already installed)

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @hyunbinseo/holidays-kr | Custom holiday array | Package is maintained, zero-dep, ESM+CJS; custom array requires annual updates |
| Client-side Excel | Server-side Workers route | Workers CPU limit makes server-side generation risky for large files; established project decision |

---

## Architecture Patterns

### Recommended Project Structure — New Files

```
cha-bio-safety/
├── src/
│   ├── pages/
│   │   └── DailyReportPage.tsx       # NEW: /daily-report route
│   └── utils/
│       └── dailyReportCalc.ts        # NEW: business logic for report data assembly
├── functions/
│   └── api/
│       └── daily-report/
│           └── index.ts              # NEW: GET /api/daily-report?date=YYYY-MM-DD
│           └── notes.ts              # NEW: GET/POST /api/daily-report/notes?date=YYYY-MM-DD
├── migrations/
│   ├── 0028_daily_notes.sql          # NEW: daily_notes table
│   └── 0029_schedule_manual_done.sql # NEW: manual_completed column for non-inspect items
└── public/
    └── templates/
        └── daily_report_template.xlsx # NEW: extracted Sheet1 from 일일업무일지(01월).xlsx
```

### Pattern 1: fflate Multi-Sheet XML Clone (for monthly cumulative file)

**What:** Extract template sheet XML once, clone it N times (one per day up to today), update each clone with day-specific data, rebuild workbook.xml + rels + [Content_Types].xml.

**When to use:** D-07 monthly cumulative download with N sheets (시트명 = "1일", "2일", ...).

**Example (adapted from existing generateDivExcel pattern):**
```typescript
// Source: cha-bio-safety/src/utils/generateExcel.ts (generateDivExcel)
const { unzipSync, zipSync, strToU8, strFromU8 } = await import('fflate')
const res = await fetch('/templates/daily_report_template.xlsx')
const files = unzipSync(new Uint8Array(await res.arrayBuffer()))
const templateXml = strFromU8(files['xl/worksheets/sheet1.xml'])

const newFiles: Record<string, Uint8Array> = {}
// copy styles/sharedStrings/theme unchanged
for (const key of ['xl/sharedStrings.xml','xl/theme/theme1.xml','xl/styles.xml','docProps/core.xml','docProps/app.xml']) {
  if (files[key]) newFiles[key] = files[key] as Uint8Array
}

const sheets: { name: string; fn: string }[] = []
for (let day = 1; day <= todayDay; day++) {
  const fn = `dr${day}.xml`
  let xml = templateXml
  xml = xml.replace(/(<pageSetup\b[^>]*?) r:id="[^"]*"/g, '$1') // remove printerSettings ref
  xml = patchDailySheet(xml, { year, month, day, ...dayData[day] })
  newFiles[`xl/worksheets/${fn}`] = strToU8(xml)
  sheets.push({ name: `${day}일`, fn })
}
// rebuild workbook.xml, workbook.xml.rels, [Content_Types].xml exactly as in generateDivExcel
```

**Key constraint:** `printerSettings` references MUST be stripped from each sheet clone (`r:id="..."` removal), otherwise Excel opens with a repair prompt.

### Pattern 2: schedule-inspection completion JOIN (extending stats.ts)

**What:** For each `schedule_items` row with `category='inspect'`, determine if at least one `check_records` row exists in the date window for the matching `inspection_category`.

**When to use:** LINK-01 per-schedule completion, LINK-02 dashboard display.

**Example (adapted from existing stats.ts pattern):**
```typescript
// Source: cha-bio-safety/functions/api/dashboard/stats.ts
// Existing pattern: check_records JOIN check_points WHERE cp.category = inspection_category AND date(checked_at) BETWEEN start AND end
// Extension for per-schedule completion:
const schedules = await env.DB.prepare(`
  SELECT id, title, date, time, category, status, inspection_category
  FROM schedule_items WHERE date = ?
  ORDER BY CASE WHEN time IS NULL THEN 1 ELSE 0 END, time ASC
`).bind(today).all()

for (const sched of schedules.results) {
  let completed = false
  if (sched.category === 'inspect' && sched.inspection_category) {
    const cpCat = CATEGORY_ALIAS[sched.inspection_category] ?? sched.inspection_category
    const rec = await env.DB.prepare(`
      SELECT 1 FROM check_records cr
      JOIN check_points cp ON cr.checkpoint_id = cp.id
      WHERE cp.category = ? AND date(cr.checked_at) BETWEEN ? AND ?
      AND cr.result IN ('normal','caution') LIMIT 1
    `).bind(cpCat, sched.date, nextSameCategoryDate ?? sched.date).first()
    completed = !!rec
  } else {
    completed = sched.status === 'done'  // manual completion for non-inspect
  }
}
```

### Pattern 3: manual_completed column for non-inspect schedule items

**What:** LINK-01 D-19 requires manual completion support for `event`, `elevator`, `task` categories. The current `status` field already has a `'done'` value — we can reuse it via a PATCH endpoint.

**When to use:** User taps a non-inspect schedule item and marks it complete manually.

**Key finding:** The `schedule_items.status` column already has `CHECK(status IN ('pending','in_progress','done','overdue'))`. The existing `functions/api/schedule/[id].ts` (PATCH handler) can set `status='done'`. No new column needed.

### Pattern 4: @hyunbinseo/holidays-kr usage

**What:** Client-side detection of Korean public holidays for patrol time assignment.

```typescript
// Source: @hyunbinseo/holidays-kr README (verified 2026-03-30)
import { isHoliday } from '@hyunbinseo/holidays-kr'

function isKoreanHoliday(date: Date): boolean {
  const dow = date.getDay()
  if (dow === 0 || dow === 6) return true  // sat/sun always holiday
  // Create KST midnight for the date
  const kst = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
  try {
    return isHoliday(kst)
  } catch {
    return false  // RangeError if date outside package's 2-year window
  }
}
```

**Caveat:** `isHoliday` takes a `Date` object and is sensitive to timezone. Must pass KST midnight (`new Date(year, month-1, day)` local time, which is fine in browser). Throws `RangeError` for dates outside the package's 2-year coverage window — wrap in try/catch.

**Version coverage:** v3.2026.2 covers years 2025–2026. If the app is used in 2027 the package must be upgraded.

### Pattern 5: dailyReportCalc.ts — report data assembly

**What:** Pure client-side utility that takes API response + shiftCalc output and produces the structured data object for cell patching.

**Recommended function signature:**
```typescript
// src/utils/dailyReportCalc.ts
export interface DailyReportData {
  date: string            // YYYY-MM-DD
  personnel: PersonnelStatus
  patrol: PatrolEntry[]
  todayTasks: TaskEntry[]
  tomorrowTasks: TaskEntry[]
  notes: string
}

export function buildDailyReportData(
  date: string,
  apiData: DailyReportApiResponse,
  staffRows: ReturnType<typeof getMonthlySchedule>['staffRows']
): DailyReportData
```

### Anti-Patterns to Avoid
- **Server-side Excel generation:** Workers CPU limit; established project decision is client-only. Never generate Excel in a Pages Function.
- **Storing completion state in schedule_items.status for inspect items:** LINK-01 requires real-time derivation from check_records JOIN. Caching in status creates stale data.
- **Importing `isHoliday` without try/catch:** The function throws RangeError for out-of-range dates.
- **Using `t="s"` (shared-string) cells for patched values:** The existing `patchCell` function writes `t="str"` (inline string). If the daily_report template has `t="s"` cells at key positions, the shared-string patch function from Phase 3 must be used instead. Verify template cell types before coding.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Korean public holiday detection | Custom hardcoded date array | @hyunbinseo/holidays-kr | Handles substitution holidays, annually updated, zero-dep |
| 3-shift rotation calculation | New logic | Existing `shiftCalc.ts` `getRawShift()` / `getMonthlySchedule()` | Already battle-tested, hardcoded 4-staff offsets correct |
| Excel multi-sheet generation | New framework | fflate + existing workbook.xml template from `generateDivExcel` | Exact same pattern already proven for 34-sheet DIV file |
| Schedule completion status caching | Write `status='done'` on every inspect save | Real-time JOIN on check_records | Avoids sync bugs; D-22 explicitly says no separate status field |

---

## Common Pitfalls

### Pitfall 1: printerSettings reference in cloned sheet XML
**What goes wrong:** Excel opens the monthly cumulative file with "file is corrupted, do you want to repair?" dialog because cloned sheets reference `xl/printerSettings/printerSettingsN.xml` entries that don't exist in the rebuilt archive.
**Why it happens:** The template has `<pageSetup r:id="rId1"/>` which points to a printerSettings relationship. When cloning the sheet XML, the `r:id` attribute is copied but the printerSettings file and relationship are not.
**How to avoid:** Strip `r:id="..."` from `<pageSetup>` in every cloned sheet XML before writing:
```typescript
xml = xml.replace(/(<pageSetup\b[^>]*?) r:id="[^"]*"/g, '$1')
```
This is already done in `generateDivExcel` and `generateCheckExcel` — apply the same fix to daily report clones.

### Pitfall 2: shared-string cells in daily_report_template.xlsx
**What goes wrong:** `patchCell()` writes `t="str"` but the original cell has `t="s"` (shared-string index). Excel reads the new value as a shared-string index number, not as the written text — displaying garbage or empty cell.
**Why it happens:** User-provided `.xlsx` templates typically use shared strings. Phase 3 built a shared-string-aware patch. Daily report template likely has the same issue.
**How to avoid:** Before coding cell patches, inspect the template: `unzip -p daily_report_template.xlsx xl/worksheets/sheet1.xml | grep 't="s"'`. If shared-string cells exist at the target addresses, use the shared-string patch utility from Phase 3 (defined in `generateExcel.ts` — the `patchCellStyled` / `addShrinkStyle` approach handles this).

### Pitfall 3: inspection_category column missing in D1 remote
**What goes wrong:** `schedule_items.inspection_category` is referenced by both `stats.ts` and `schedule/index.ts` but there is NO migration file that adds this column. It was likely added to D1 directly via `wrangler d1 execute` during development. Remote production D1 may already have it, but local development/new environments won't if only running migration files.
**Why it happens:** The column exists in code queries and inserts but is absent from all 28 migration files (verified by grepping all `.sql` files — zero results for `inspection_category`).
**How to avoid:** Phase 4 Wave 0 should include a migration that adds `inspection_category` and `memo` columns to `schedule_items` with `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS`. Since D1 SQLite supports `ALTER TABLE ... ADD COLUMN`, use that pattern. This ensures the column is traceable in version control.

### Pitfall 4: @hyunbinseo/holidays-kr RangeError
**What goes wrong:** `isHoliday(date)` throws `RangeError` if the date is outside the package's 2-year coverage (v3.2026.2 covers 2025–2026). Any backfill of January 2024 data would crash.
**Why it happens:** The package is explicitly designed to throw on out-of-range dates to prevent silent incorrect results.
**How to avoid:** Always wrap in try/catch; fall back to `false` (treat as non-holiday) on error. Also note that `isHolidayE` covers an extended range (from 2022) if older date support is needed.

### Pitfall 5: todaySchedule missing `completed` field breaks dashboard TypeScript
**What goes wrong:** The `todaySchedule` items returned by `stats.ts` currently have `{ id, title, date, time, category, status }`. Adding `completed: boolean` to the API response requires updating the TypeScript type in `src/types/index.ts` and any consumer of `dashboardApi.getStats()`.
**Why it happens:** TypeScript's `strict: false` won't catch the missing field at compile time, but if `DashboardPage.tsx` accesses `.completed` before the type is updated, runtime `undefined` will cause the UI to always show "not completed".
**How to avoid:** Update `src/types/index.ts` `ScheduleItem` or dashboard stats type to include `completed?: boolean` as part of the same task that modifies `stats.ts`.

### Pitfall 6: Monthly cumulative file — today's date in KST vs UTC
**What goes wrong:** If the user downloads the monthly cumulative file near midnight, `new Date()` in browser is UTC. "Today" in UTC could be yesterday or today in KST (+9h). The file should only generate sheets up to today-in-KST.
**Why it happens:** Browser `new Date()` is local time (usually KST if the user is in Korea), but the API uses `todayKST()` on the server. The client must derive today's date consistently.
**How to avoid:** For "today's date in KST", use `new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))` or simply pass `date` param from the date picker (which the user already selected), so no ambiguity.

---

## Code Examples

### Multi-sheet workbook rebuild (workbook.xml, rels, [Content_Types].xml)
```typescript
// Source: cha-bio-safety/src/utils/generateExcel.ts lines 209-237
// This exact pattern generates N sheets — copy verbatim, change file prefix from 'ds' to 'dr'
const sheetsTag = sheets.map((s, i) =>
  `<sheet name="${esc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`
).join('')
newFiles['xl/workbook.xml'] = strToU8(`<?xml version="1.0" ...><sheets>${sheetsTag}</sheets></workbook>`)
// + workbook.xml.rels, [Content_Types].xml, _rels/.rels (see existing code for full XML strings)
```

### Schedule completion query for dashboard (adapted from stats.ts)
```typescript
// Source: cha-bio-safety/functions/api/dashboard/stats.ts lines 34-63
// Add 'completed' to todaySchedule by running a secondary query per inspect item
// Pattern already verified: check_records JOIN check_points WHERE category=? AND date(checked_at)=?
const rec = await env.DB.prepare(`
  SELECT 1 FROM check_records cr
  JOIN check_points cp ON cr.checkpoint_id = cp.id
  WHERE cp.category = ? AND date(cr.checked_at) = ?
    AND cr.result IN ('normal','caution') LIMIT 1
`).bind(cpCategory, today).first()
```

### patchCell function (inline string — current project standard)
```typescript
// Source: cha-bio-safety/src/utils/generateExcel.ts lines 125-146
function patchCell(xml: string, addr: string, value: string | number | null): string {
  const tag   = `<c r="${addr}"`
  const start = xml.indexOf(tag)
  if (start === -1) return xml
  // ... (self-closing vs close-tag detection)
  const s = (orig.match(/\ss="([^"]*)"/) ?? [])[1]  // preserve style index
  const newCell = value === null ? `<c r="${addr}"${s}/>` : ...
  return xml.slice(0, start) + newCell + xml.slice(end)
}
```

### D1 migration for daily_notes table
```sql
-- migrations/0028_daily_notes.sql
CREATE TABLE IF NOT EXISTS daily_notes (
  id          TEXT PRIMARY KEY,
  date        TEXT NOT NULL UNIQUE,  -- YYYY-MM-DD; 날짜별 1건
  content     TEXT NOT NULL DEFAULT '',
  created_by  TEXT NOT NULL REFERENCES staff(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_daily_notes_date ON daily_notes(date);
```

### D1 migration for missing inspection_category column
```sql
-- migrations/0029_schedule_inspection_category.sql
-- inspection_category was used in code but never added via migration
ALTER TABLE schedule_items ADD COLUMN inspection_category TEXT;
ALTER TABLE schedule_items ADD COLUMN memo TEXT;
-- These are no-ops if columns already exist in production D1 (SQLite allows re-adding)
-- Actually D1 will error if column exists; use defensive approach:
-- Run only if column does not exist (check via wrangler or use separate migration per env)
```

**Note on migration 0029:** SQLite does not support `ADD COLUMN IF NOT EXISTS`. The safe approach is: run the migration, and if D1 returns "duplicate column name" error, consider it a no-op. Alternatively, write a conditional migration using a D1 batch that checks `pragma table_info(schedule_items)` before altering.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| xlsx-js-style for Excel | fflate XML patching | Phase 2/3 (removed unused) | No xlsx-js-style — all Excel via fflate only |
| Manual completion status in schedule_items.status for inspect | Real-time check_records JOIN | Phase 4 (this phase) | No status field update needed on inspection save |

---

## Open Questions

1. **daily_report_template.xlsx cell mapping**
   - What we know: Sheet2 of `일일업무일지(01월).xlsx` contains cell position mapping; Sheet3/Sheet4 contain conditional logic for 금일/명일 업무
   - What's unclear: Exact cell addresses for each section (인원현황, 순찰, 금일업무, 명일업무, 특이사항) without opening the xlsx file
   - Recommendation: Wave 0 task — extract template sheet1 and inspect cell addresses in Sheet2 before coding `patchDailySheet`. The CONTEXT.md canonical ref points to `작업용/점검 일지 양식/일일업무일지(01월).xlsx`.

2. **inspection_category column in D1 production**
   - What we know: No migration file adds it; code uses it; production D1 is at migration 0027
   - What's unclear: Was it added to production D1 manually or does it already exist from a rolled-back migration?
   - Recommendation: Write migration 0029 as `ADD COLUMN` and test against local D1 first (`wrangler d1 execute --local`). If it errors "duplicate column", the column already exists in that environment and the migration is a no-op for prod.

3. **Patrol rotation REF_DATE for eveningPatrol/nightPatrol toggle**
   - What we know: D-09 specifies 저녁/야간 alternating per day; D-08 says monthly 1st uses prior month's 1st as reference
   - What's unclear: Which person patrols which type on which day — the exact REF_DATE and initial assignment for the 2-type rotation
   - Recommendation: Claude's discretion (CONTEXT.md). Align with the same `REF_DATE = new Date(2026, 2, 1)` used in `shiftCalc.ts`. Use `daysBetween(REF_DATE, date) % 2 === 0` to toggle between 저녁/야간. Document the initial value in `dailyReportCalc.ts` comments.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js / npm | Package install | ✓ | (project toolchain) | — |
| Cloudflare D1 (local) | Migration testing | ✓ | wrangler 4.75.0 | — |
| @hyunbinseo/holidays-kr | Holiday detection | ✓ (via npm) | 3.2026.2 | isHolidayE (extended) |
| fflate | Excel generation | ✓ | ^0.8.2 installed | — |
| daily_report_template.xlsx | Excel generation | Must be created | — | Extract Sheet1 from 작업용 file |

**Missing dependencies with no fallback:**
- `public/templates/daily_report_template.xlsx` — must be extracted from `작업용/점검 일지 양식/일일업무일지(01월).xlsx` Sheet1. This is a Wave 0 task before any Excel generation code can run.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no `pytest.ini`, `jest.config.*`, `vitest.config.*` in project |
| Config file | None |
| Quick run command | `npm run build` (TypeScript compile check) |
| Full suite command | `npm run build` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EXCEL-06 | daily_report_template.xlsx download triggers file dialog | manual | open `/daily-report` in browser and click download | ❌ Wave 0 |
| EXCEL-06 | 일별 파일명: `방재업무일지(dd일).xlsx` | manual | verify downloaded filename | ❌ Wave 0 |
| EXCEL-06 | 월별 파일은 오늘까지 시트만 생성 | manual | open xlsx, verify sheet count = today's day-of-month | ❌ Wave 0 |
| LINK-01 | inspect 일정 완료 판정 responds to check_records | smoke | `wrangler d1 execute --local --command "SELECT ..."` | ❌ Wave 0 |
| LINK-02 | dashboard todaySchedule includes `completed` boolean | build check | `npm run build` catches type errors | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run build` (TypeScript compile)
- **Per wave merge:** `npm run build` + manual browser smoke test on `/daily-report` and `/dashboard`
- **Phase gate:** All three requirements manually verified before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `public/templates/daily_report_template.xlsx` — extract Sheet1 from reference file; required before any Excel generation
- [ ] `migrations/0028_daily_notes.sql` — `daily_notes` table
- [ ] `migrations/0029_schedule_inspection_category.sql` — ensure `inspection_category` column is migration-tracked
- [ ] `npm install @hyunbinseo/holidays-kr` — new dependency install

---

## Sources

### Primary (HIGH confidence)
- `cha-bio-safety/src/utils/generateExcel.ts` — fflate multi-sheet pattern verified by direct code read
- `cha-bio-safety/functions/api/dashboard/stats.ts` — existing completion JOIN pattern, `todaySchedule` response shape
- `cha-bio-safety/src/utils/shiftCalc.ts` — 3-shift rotation logic, REF_DATE, STAFF array
- `cha-bio-safety/migrations/0001_init.sql` + `0014_annual_leaves.sql` — schedule_items schema, annual_leaves schema
- `/tmp/package/README.md` (from `npm pack @hyunbinseo/holidays-kr`) — `isHoliday`, `isHolidayE`, `getHolidayNames` API signatures verified
- `작업용/점검 일지 양식/점검 일지 작성법.md` — item 10: monthly/daily file naming rules verified

### Secondary (MEDIUM confidence)
- `@hyunbinseo/holidays-kr` npm registry info — v3.2026.2 published 2026-02-12, zero dependencies, covers 2025–2026

### Tertiary (LOW confidence — needs manual verification)
- Cell address mapping for `일일업무일지(01월).xlsx` Sheet1 — not yet opened/inspected; must be done in Wave 0 before coding patchCell calls

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified via direct file inspection and npm registry
- Architecture: HIGH — patterns directly reuse verified existing code; multi-sheet clone is exact analogue of generateDivExcel
- Pitfalls: HIGH — pitfall 1-3 verified by code grep; pitfall 4 verified from README; pitfalls 5-6 verified by type inspection
- Cell mapping for daily report template: LOW — xlsx file not opened; Wave 0 task required

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (stable libraries; @hyunbinseo/holidays-kr annual update cycle)
