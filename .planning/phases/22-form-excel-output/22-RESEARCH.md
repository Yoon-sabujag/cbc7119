# Phase 22: 업무수행기록표 Form + Excel Output - Research

**Researched:** 2026-04-10
**Domain:** D1 schema migration, Cloudflare Pages Functions API, React form page, fflate xlsx patching
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Schema (D1)**
- D-01: 새 마이그레이션 `0047_work_logs.sql`, 테이블 `work_logs`
- D-02: 컬럼 목록 (id, year_month UNIQUE, year, month, manager_name, fire_content, fire_result, fire_action, escape_content, escape_result, escape_action, gas_content, etc_content, updated_by, updated_at) — 화기취급감독 result/action 컬럼 없음
- D-03: 별도 인덱스 불필요 (UNIQUE 자동 인덱스로 충분)
- D-04: TEXT NOT NULL + empty-string default (NULL vs empty 구분 불필요)

**Page Structure**
- D-05: 라우트 `/worklog`, 컴포넌트 `src/pages/WorkLogPage.tsx`
- D-06: 상단 월 선택기 (이전/현재/다음 월 화살표 + month picker), 기본값 = 현재 월
- D-07: 월 변경 시 get → preview fallback 플로우
- D-08: 폼 5개 카드 섹션 (기본정보, 소방시설, 피난방화시설, 화기취급감독, 기타사항)
- D-09: 하단 고정 푸터 2개 버튼 (저장, 엑셀 출력)
- D-10: 자동저장 없음 — 명시적 저장 버튼만
- D-11: "수정됨" 표시 (로드값 ≠ 현재값일 때)

**Permissions**
- D-12: 읽기 — 인증된 모든 staff
- D-13: 쓰기 PUT — admin only (`requireAdmin` 패턴)
- D-14: 엑셀 출력 클라이언트사이드 (서버 엔드포인트 불필요)
- D-15: 일반 staff — 저장/출력 버튼 비활성화 또는 숨김

**Auto-Prefill Logic**
- D-16: manager_name = 첫 번째 admin (appointed_at ASC)
- D-17: fire_content 정적 상수 + fire_action = remediation 카테고리 IN ('소화기','소화전','스프링클러','소방펌프') 집계 + fire_result = fire_action 비어있으면 'ok'
- D-18: escape 동일 패턴, category IN ('방화셔터','방화문','유도등')
- D-19: gas_content 정적 상수, result/action 항상 빈 값
- D-20: etc_content = schedule_items WHERE inspection_category='소방' AND 해당 월, title ASC
- D-21: 집계 기간 Asia/Seoul 해당 월 1일~말일
- D-22: remediation 카테고리 이름 일치 여부 RESEARCH에서 확인 필요

**Excel Generation**
- D-23: `generateWorkLogExcel(yearMonth, data)` in `src/utils/generateExcel.ts` (append)
- D-24: 템플릿 `public/templates/worklog_template.xlsx` (작성법 시트 포함 채로 배포 수용)
- D-25: 패치 셀 목록 (C4, E4, G4/K4/M4, U4, C10, C14, C17, C24, Y12/Y14/Y19/Y21/Y26/Y28/Y33/Y35, AA10/AA14/AA17/AA24)
- D-26: √ 문자 = U+221A
- D-27: 스타일 보존, 값만 교체 — `patchCell` 재사용
- D-28: 다중 라인 = &#10; 줄바꿈, wrapText 필요시 스타일 패치
- D-29: 파일명 `소방안전관리자_업무수행기록표_${year}년_${month}월.xlsx`

**API Routes**
- D-35: `functions/api/work-logs/index.ts`, `[yearMonth].ts`, `[yearMonth]/preview.ts`
- D-36: `{ success, data }` / `{ success, error }` 응답 형식
- D-37: year_month 검증 `/^\d{4}-(0[1-9]|1[0-2])$/`

**SideMenu**
- D-33/D-34: `문서 관리` 섹션에 `{ label: '업무 수행 기록표', path: '/worklog', badge: 0, soon: false }` 추가 — SideMenu + DesktopSidebar + DEFAULT_SIDE_MENU 3곳 패치

### Claude's Discretion
- Form 카드 스타일 세부 (spacing, color)
- "양호/불량" toggle UI 형태
- 월 picker 위젯 구현
- Toast 문구 한글 카피
- 저장 중 disabled 상태 표시
- "수정됨" 배지 디자인
- remediation 카테고리 매핑 구현 세부

### Deferred Ideas (OUT OF SCOPE)
- 삭제 UI
- 작성 알림/리마인더
- PDF 출력
- 여러 관리자 선택 UI
- 화기취급감독/기타사항 자동 불량 판정 로직
- 월별 비교/통계 뷰
- 작성법 시트 제거한 clean 템플릿
- 서명 이미지 삽입
- 여러 수행자 기록
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| WORKLOG-01 | 사용자가 업무수행기록표 작성 폼에 대상 월·작성자·각 필드를 입력할 수 있다 | WorkLogPage.tsx with month picker + 5 card sections + save button |
| WORKLOG-02 | 사용자가 "엑셀 출력" 버튼을 탭하면 기존 양식 파일과 동일한 레이아웃의 .xlsx 파일이 다운로드된다 | generateWorkLogExcel() appended to generateExcel.ts, fflate patchCell pattern, worklog_template.xlsx |
| WORKLOG-03 | 작성한 업무수행기록표 데이터는 D1에 저장되어 이후 월별 조회/재출력이 가능하다 | 0047_work_logs.sql migration + PUT upsert API + GET read API |
</phase_requirements>

---

## Summary

Phase 22 builds a monthly-cadence form page and Excel export for the legal form "소방안전관리자 업무수행기록표." The implementation follows the DailyReportPage pattern almost exactly — month-picker navigation replaces day navigation, server-side preview aggregation replaces client-side calc, and explicit save replaces debounce auto-save. All patterns (fflate template patching, requireAdmin gate, namespace API client, 3-point menu patch) are already established and can be directly copied from Phase 21 and prior pages.

The most important technical finding from code inspection is a **category name mismatch** (D-22): the CONTEXT specifies `IN ('소화기','소화전','스프링클러','소방펌프')` for fire facilities, but the actual DB stores `'스프링클러헤드'` (not `'스프링클러'`). Similarly for escape facilities, `'방화문'` does not exist as a standalone category — door inspection is recorded under `'특별피난계단'`. The preview query must use the actual DB category names or a mapping table, otherwise `fire_action` will never capture sprinkler records and `escape_action` will never capture fire-door records.

The Excel template (`작업용/점검 일지 양식/소방안전관리자 업무 수행 기록표.xlsx`) exists and must be copied to `public/templates/worklog_template.xlsx`. The `patchCell` helper in `generateExcel.ts` already handles XML escaping, style-index preservation, and string/number cell types — no new patterns needed.

**Primary recommendation:** Implement in 4 waves: (0) test/schema setup, (1) backend API + migration, (2) WorkLogPage UI, (3) Excel generation + template copy + menu wiring.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| fflate | (bundled via vite) | xlsx ZIP manipulation (unzipSync/zipSync) | Already used in generateExcel.ts for all xlsx generation — no new dependency |
| Cloudflare D1 | platform | SQLite persistence via `env.DB` | Project-wide DB binding |
| @tanstack/react-query | 5.59.0 | Server state, useQuery/useMutation | Already used in all pages |
| Zustand | 5.0.0 | Auth state (role check) | useAuthStore for admin gating |
| react-hot-toast | 2.4.1 | Toast notifications | Project-wide pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | 4.1.0 | Month arithmetic, last-day-of-month | Computing `lastDayOfMonth` for C4/E4/G4 cell fill |
| date-fns-tz | 3.2.0 | KST timezone for aggregate date range | D-21: 해당 월 1일~말일 Asia/Seoul boundary |

**Installation:** No new packages required — all dependencies already present. [VERIFIED: package.json in cha-bio-safety]

---

## Architecture Patterns

### Recommended Project Structure (new files)

```
cha-bio-safety/
├── migrations/
│   └── 0047_work_logs.sql            # D-01: new table
├── functions/api/work-logs/
│   ├── index.ts                       # GET list (all staff)
│   ├── [yearMonth].ts                 # GET read / PUT upsert / DELETE stub
│   └── [yearMonth]/
│       └── preview.ts                 # GET preview (auto-aggregate)
├── src/
│   ├── pages/
│   │   └── WorkLogPage.tsx            # D-05
│   ├── utils/
│   │   ├── api.ts                     # + workLogApi namespace (D-38)
│   │   └── generateExcel.ts           # + generateWorkLogExcel (D-23)
│   ├── types/index.ts                 # + WorkLog, WorkLogPreview, WorkLogPayload
│   └── components/
│       ├── SideMenu.tsx               # + /worklog menu item (D-33)
│       └── DesktopSidebar.tsx         # + /worklog (D-34)
└── public/templates/
    └── worklog_template.xlsx          # copy from 작업용/
```

### Pattern 1: D1 Upsert (ON CONFLICT DO UPDATE)

```typescript
// Source: established pattern from functions/api/daily-report/notes.ts
await ctx.env.DB.prepare(`
  INSERT INTO work_logs
    (year_month, year, month, manager_name, fire_content, fire_result, fire_action,
     escape_content, escape_result, escape_action, gas_content, etc_content,
     updated_by, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  ON CONFLICT(year_month) DO UPDATE SET
    manager_name=excluded.manager_name,
    fire_content=excluded.fire_content,
    fire_result=excluded.fire_result,
    fire_action=excluded.fire_action,
    escape_content=excluded.escape_content,
    escape_result=excluded.escape_result,
    escape_action=excluded.escape_action,
    gas_content=excluded.gas_content,
    etc_content=excluded.etc_content,
    updated_by=excluded.updated_by,
    updated_at=excluded.updated_at
`).bind(ym, year, month, body.manager_name, ...).run()
```
[VERIFIED: same pattern in functions/api/daily-report/notes.ts and documents APIs]

### Pattern 2: requireAdmin Early-Return Gate

```typescript
// Source: functions/api/documents/_helpers.ts (Phase 20 established pattern)
export function requireAdmin(ctx: { data?: { role?: string } }): Response | null {
  if (ctx.data?.role !== 'admin')
    return Response.json({ success: false, error: '관리자만 가능합니다' }, { status: 403 })
  return null
}
// In handler:
const denied = requireAdmin(ctx)
if (denied) return denied
```
[VERIFIED: functions/api/documents/_helpers.ts line 42-48]

### Pattern 3: fflate Template Patch (single-sheet, preserve original)

```typescript
// Source: generateDailyExcel in src/utils/generateExcel.ts (generateDailyExcel, mode 'daily')
const { unzipSync, zipSync, strToU8, strFromU8 } = await import('fflate')
const res   = await fetch('/templates/worklog_template.xlsx')
const ab    = await res.arrayBuffer()
const files = unzipSync(new Uint8Array(ab))  // files is Record<string, Uint8Array>

let xml = strFromU8(files['xl/worksheets/sheet1.xml'])
xml = xml.replace(/(<pageSetup\b[^>]*?) r:id="[^"]*"/g, '$1')  // printerSettings fix

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function patchCell(xml: string, addr: string, value: string | number | null): string {
  // ... (copy from existing patchCell in generateExcel.ts)
}

xml = patchCell(xml, 'C4', year)         // number cell
xml = patchCell(xml, 'U4', managerName)  // string cell
// ... all D-25 cells

files['xl/worksheets/sheet1.xml'] = strToU8(xml)
// Keep ALL other files intact (styles, sharedStrings, other sheets)
const zipped = zipSync(files, { level: 6 })
downloadBlob(createExcelBlob(zipped.buffer as ArrayBuffer), filename)
```
[VERIFIED: generateDailyExcel mode='daily' in src/utils/generateExcel.ts lines 818-833]

**Key difference from multi-sheet generators:** For worklog, the original `files` object (containing ALL sheets including 작성법) is mutated in-place — only `sheet1.xml` is replaced. This is simpler than the DIV/check generators that build `newFiles` from scratch. [VERIFIED: generateDailyExcel mode='daily' follows this pattern]

### Pattern 4: Month Picker Navigation

```typescript
// Source: DailyReportPage.tsx — adapt from day navigation to month navigation
function thisMonthKST(): string {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function addMonths(ym: string, n: number): string {
  const [y, m] = ym.split('-').map(Number)
  const dt = new Date(y, m - 1 + n, 1)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
}
```
[ASSUMED: based on DailyReportPage.tsx day-navigation pattern — month variant is straightforward]

### Pattern 5: SideMenu 3-Point Patch (Phase 21 Established)

Three files must all be updated simultaneously:
1. `src/components/SideMenu.tsx` — add to `MENU` '문서 관리' section
2. `src/components/DesktopSidebar.tsx` — add `/worklog` to `DESKTOP_SECTIONS[1].paths`
3. `src/utils/api.ts` — add `{ type: 'item', path: '/worklog', visible: true }` to `DEFAULT_SIDE_MENU` after `/documents`

The `migrateLegacyMenuConfig` forward-merge in api.ts already handles existing users automatically (Phase 21 fix). New `/worklog` path will appear for all users because `missing.length > 0` triggers append. [VERIFIED: api.ts lines 341-357]

### Anti-Patterns to Avoid

- **New xlsx library:** Do not add `xlsx-js-style` or any xlsx library — project constraint forbids new libraries. Use fflate-based patching only.
- **Server-side zip:** Do not generate xlsx in a Worker function — 128MB limit, and client-side is project convention (STATE.md).
- **Separate generateExcel file:** Do not create `generateWorkLogExcel.ts` — project convention is to append to the existing `generateExcel.ts`.
- **useEffect for form init without dependency guard:** Copy DailyReportPage's `prevDateRef` pattern to avoid re-initializing form on every render.
- **Mutation/state for non-auth staff:** If role is not admin, render form read-only but don't block page access entirely.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT auth check | Custom auth middleware | `ctx.data.role` from `_middleware.ts` | Already injected by global middleware |
| Admin gate | Role check inline in each handler | `requireAdmin()` from `_helpers.ts` | Returns Response or null — consistent 403 pattern |
| XML entity escape | Custom escaper | `esc()` in `patchCell` helper (already in generateExcel.ts) | Handles &, <, > — copy as local function |
| xlsx cell patching | Direct XML string building | `patchCell(xml, addr, value)` | Handles self-closing/close-end tag variants, preserves s= style index |
| Month arithmetic | Manual date math | `date-fns` addMonths + endOfMonth | Last day of month edge case (Feb 28/29) |
| API client request | fetch() directly | `api.get/put()` from `src/utils/api.ts` | Auth header injection, 401 logout, error normalization |

---

## Critical Finding: Category Name Mismatch (D-22)

**VERIFIED from migrations:** [VERIFIED: migrations/0009_checkpoint_fix.sql, 0011_fire_extinguishers.sql, seed.sql]

| CONTEXT D-17/D-18 expected | Actual DB category value | Match? |
|---------------------------|--------------------------|--------|
| `'소화기'` | `'소화기'` | YES |
| `'소화전'` | `'소화전'` | YES |
| `'스프링클러'` | `'스프링클러헤드'` | **NO — MISMATCH** |
| `'소방펌프'` | `'소방펌프'` | YES |
| `'방화셔터'` | `'방화셔터'` | YES |
| `'방화문'` | category does not exist; fire door inspection is under `'특별피난계단'` | **NO — MISSING** |
| `'유도등'` | `'유도등'` | YES |

**Action required in preview.ts:**
- For `fire_action`: use `category IN ('소화기', '소화전', '스프링클러헤드', '소방펌프')` (not `'스프링클러'`)
- For `escape_action`: use `category IN ('방화셔터', '특별피난계단', '유도등')` (not `'방화문'`) — or discuss with user whether to include `'특별피난계단'`

This is Claude's discretion (per CONTEXT): the mapping table implementation is the implementer's choice. The recommended approach is to use the verified DB category names directly in the SQL IN clause (no separate mapping table needed — simple inline substitution).

---

## Common Pitfalls

### Pitfall 1: printerSettings r:id Reference
**What goes wrong:** When `zipSync(files)` is called with a modified sheet that still references a printerSettings file (e.g., `r:id="rId1"` in `<pageSetup>`), Excel opens the file and shows a repair warning.
**Why it happens:** printerSettings1.xml is in the original xlsx but its relationship reference in the sheet XML breaks.
**How to avoid:** Apply the regex replacement before patching:
```typescript
xml = xml.replace(/(<pageSetup\b[^>]*?) r:id="[^"]*"/g, '$1')
```
[VERIFIED: used in generateDivExcel, generateDailyExcel]

### Pitfall 2: fflate Dynamic Import on First Call
**What goes wrong:** `await import('fflate')` on iOS PWA sometimes causes a brief delay; if the download is triggered by a button click, the async gap can prevent the download from associating with the user gesture.
**Why it happens:** iOS WebKit requires downloads to be initiated within the synchronous user gesture event.
**How to avoid:** Pre-warm fflate with a dummy import on page mount, or use `window.open()` — but since xlsx blob download uses `<a>.click()`, this is usually fine. The existing `downloadBlob` helper in `generateExcel.ts` handles this with the `<a>` element pattern. [VERIFIED: generateExcel.ts lines 111-120]
**Warning signs:** Download doesn't trigger on iOS; works on Android/desktop.

### Pitfall 3: year_month UNIQUE Constraint Failure
**What goes wrong:** If a concurrent PUT arrives while another is running (unlikely with 4-person team but possible), SQLite UNIQUE violation returns a 500.
**Why it happens:** The upsert `ON CONFLICT DO UPDATE` handles this correctly, but only if the binding includes ALL columns.
**How to avoid:** Use the full ON CONFLICT DO UPDATE pattern — not a separate INSERT + UPDATE.

### Pitfall 4: patchCell Miss on Non-Existent Cell Address
**What goes wrong:** `patchCell` returns `xml` unchanged if the cell address isn't found (e.g., Y12 in the template might be in a merged-cell ref but not a `<c r="Y12">` tag). The cell appears empty in the output.
**Why it happens:** Excel sometimes stores merged cell data only in the top-left cell; all other cells in the merge have no `<c>` tag.
**How to avoid:** The worklog template must be inspected to confirm that Y12, Y14, Y19, Y21 each have explicit `<c r="...">` tags. The PDF/PNG screenshots show checkboxes in those cells — inspect the actual xl/worksheets/sheet1.xml content before finalizing cell addresses. [ASSUMED: template structure not yet verified at XML level]
**Warning signs:** √ checkmarks don't appear in output even though patchCell is called.

### Pitfall 5: Multi-line Text Without wrapText
**What goes wrong:** `fire_action` and `etc_content` may contain `\n` (newline), which must be encoded as `&#10;` in the XML. But `&#10;` only renders as a line break if the cell style has `wrapText="1"`.
**Why it happens:** Excel ignores `&#10;` in cells without wrapText.
**How to avoid:** Before using `&#10;` for line breaks in `fire_action` content cells (AA10, AA14), verify the original template's style for those cells. If `wrapText` is absent, the style patch must be applied using `addShrinkStyle` or direct `<alignment wrapText="1"/>` injection. [ASSUMED: template wrapText status not yet confirmed at XML level]

### Pitfall 6: Cloudflare Pages Functions Dynamic Route Collision
**What goes wrong:** `[yearMonth].ts` and `[yearMonth]/preview.ts` might conflict because Pages Functions uses filesystem-based routing with directory-file collision.
**Why it happens:** A file `[yearMonth].ts` and a directory `[yearMonth]/` coexist at the same path level.
**How to avoid:** This is a known valid pattern in Cloudflare Pages Functions — `[yearMonth].ts` handles `/api/work-logs/:ym` and `[yearMonth]/preview.ts` handles `/api/work-logs/:ym/preview`. The existing `functions/api/daily-report/` + `notes.ts` sibling confirms the pattern works. [VERIFIED: functions/api/daily-report/index.ts and notes.ts coexist]

---

## Code Examples

### Migration 0047_work_logs.sql
```sql
-- Source: mirrors 0046_documents.sql style
-- Phase 22: work_logs table — monthly work performance records
CREATE TABLE IF NOT EXISTS work_logs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  year_month      TEXT NOT NULL UNIQUE,
  year            INTEGER NOT NULL,
  month           INTEGER NOT NULL,
  manager_name    TEXT NOT NULL DEFAULT '',
  fire_content    TEXT NOT NULL DEFAULT '',
  fire_result     TEXT NOT NULL DEFAULT 'ok',
  fire_action     TEXT NOT NULL DEFAULT '',
  escape_content  TEXT NOT NULL DEFAULT '',
  escape_result   TEXT NOT NULL DEFAULT 'ok',
  escape_action   TEXT NOT NULL DEFAULT '',
  gas_content     TEXT NOT NULL DEFAULT '',
  etc_content     TEXT NOT NULL DEFAULT '',
  updated_by      INTEGER NOT NULL REFERENCES staff(id),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Preview Endpoint — Corrected Category Names
```typescript
// Source: functions/api/daily-report/index.ts pattern + D-17/D-18 corrected for actual DB categories
// CRITICAL: use 'スプリンクラーヘッド' (스프링클러헤드) not '스프링클러'
//           use '특별피난계단' instead of '방화문'
const fireActions = await ctx.env.DB.prepare(`
  SELECT cp.category, cp.location, r.memo, r.resolution_memo
  FROM check_records r
  JOIN check_points cp ON cp.id = r.checkpoint_id
  WHERE r.status = 'resolved'
    AND r.result IN ('bad', 'caution')
    AND cp.category IN ('소화기', '소화전', '스프링클러헤드', '소방펌프')
    AND r.resolved_at >= ? AND r.resolved_at < ?
  ORDER BY r.resolved_at ASC
`).bind(startKST, endKST).all()

const escapeActions = await ctx.env.DB.prepare(`
  SELECT cp.category, cp.location, r.memo, r.resolution_memo
  FROM check_records r
  JOIN check_points cp ON cp.id = r.checkpoint_id
  WHERE r.status = 'resolved'
    AND r.result IN ('bad', 'caution')
    AND cp.category IN ('방화셔터', '특별피난계단', '유도등')
    AND r.resolved_at >= ? AND r.resolved_at < ?
  ORDER BY r.resolved_at ASC
`).bind(startKST, endKST).all()
```

### workLogApi Namespace
```typescript
// Source: api.ts namespace pattern (dailyReportApi, documentsApi)
export const workLogApi = {
  list:    () => api.get<WorkLogListItem[]>('/work-logs'),
  get:     (ym: string) => api.get<WorkLog | null>(`/work-logs/${ym}`),
  preview: (ym: string) => api.get<WorkLogPreview>(`/work-logs/${ym}/preview`),
  save:    (ym: string, body: WorkLogPayload) => api.put<WorkLog>(`/work-logs/${ym}`, body),
}
```

### WorkLog Type Definitions
```typescript
// Source: D-39 + types/index.ts pattern
export interface WorkLog {
  id: number
  year_month: string
  year: number
  month: number
  manager_name: string
  fire_content: string
  fire_result: 'ok' | 'bad'
  fire_action: string
  escape_content: string
  escape_result: 'ok' | 'bad'
  escape_action: string
  gas_content: string
  etc_content: string
  updated_by: number
  updated_at: string
}
export type WorkLogPayload = Omit<WorkLog, 'id' | 'updated_by' | 'updated_at' | 'year' | 'month' | 'year_month'>
export interface WorkLogPreview extends WorkLogPayload {}
export interface WorkLogListItem {
  id: number
  year_month: string
  updated_at: string
  updated_by_name: string | null
}
```

### generateWorkLogExcel Skeleton
```typescript
// Source: generateDailyExcel mode='daily' pattern in generateExcel.ts
export async function generateWorkLogExcel(yearMonth: string, data: WorkLogPayload): Promise<void> {
  const { unzipSync, zipSync, strToU8, strFromU8 } = await import('fflate')
  const [year, month] = yearMonth.split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()

  const res   = await fetch('/templates/worklog_template.xlsx')
  const ab    = await res.arrayBuffer()
  const files = unzipSync(new Uint8Array(ab))

  function esc(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
  function patchCell(xml: string, addr: string, value: string | number | null): string {
    // ... (same as existing patchCell helpers in generateExcel.ts)
  }

  let xml = strFromU8(files['xl/worksheets/sheet1.xml'])
  xml = xml.replace(/(<pageSetup\b[^>]*?) r:id="[^"]*"/g, '$1')

  // Header: year/month/lastDay
  xml = patchCell(xml, 'C4', year)
  xml = patchCell(xml, 'E4', month)
  xml = patchCell(xml, 'G4', lastDay)
  xml = patchCell(xml, 'K4', lastDay)
  xml = patchCell(xml, 'M4', lastDay)

  // Manager name
  xml = patchCell(xml, 'U4', data.manager_name || '')

  // Content fields
  xml = patchCell(xml, 'C10', data.fire_content)
  xml = patchCell(xml, 'C14', data.escape_content)
  xml = patchCell(xml, 'C17', data.gas_content)
  xml = patchCell(xml, 'C24', data.etc_content)

  // Result checkmarks (√ = U+221A)
  xml = patchCell(xml, 'Y12', data.fire_result === 'ok'  ? '\u221A' : '')
  xml = patchCell(xml, 'Y14', data.fire_result === 'bad' ? '\u221A' : '')
  xml = patchCell(xml, 'Y19', data.escape_result === 'ok'  ? '\u221A' : '')
  xml = patchCell(xml, 'Y21', data.escape_result === 'bad' ? '\u221A' : '')

  // Action content (multi-line)
  xml = patchCell(xml, 'AA10', data.fire_action.replace(/\n/g, '&#10;'))
  xml = patchCell(xml, 'AA14', data.escape_action.replace(/\n/g, '&#10;'))

  // Always-empty cells
  xml = patchCell(xml, 'Y26', '')
  xml = patchCell(xml, 'Y28', '')
  xml = patchCell(xml, 'Y33', '')
  xml = patchCell(xml, 'Y35', '')
  xml = patchCell(xml, 'AA17', '')
  xml = patchCell(xml, 'AA24', '')

  files['xl/worksheets/sheet1.xml'] = strToU8(xml)
  const zipped = zipSync(files, { level: 6 })
  const blob   = createExcelBlob(zipped.buffer as ArrayBuffer)
  downloadBlob(blob, `소방안전관리자_업무수행기록표_${year}년_${month}월.xlsx`)
}
```
[ASSUMED: cell address accuracy — must be verified against actual template xl/worksheets/sheet1.xml before implementation]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| xlsx-js-style cell building | fflate XML patching of template | Phase 15 (v1.2) | No new lib required; style preservation is automatic |
| Client-side preview calc | Server-side preview endpoint | Phase 21 (daily-report) | Consistent with DailyReportPage — server handles DB queries |
| Separate requireAdmin per file | Shared `requireAdmin()` from `_helpers.ts` | Phase 20 | Single source of truth for 403 response |
| migrateLegacyMenuConfig breaks on new items | Forward-merge for missing paths | Phase 21 fix | `/worklog` will auto-appear for existing users without any user action |

---

## Environment Availability

Step 2.6: SKIPPED — Phase 22 is purely code/config changes (D1 migration + Cloudflare Workers functions + React frontend). No external tools beyond the existing Cloudflare/npm toolchain required. Template file copy (`작업용/` → `public/templates/`) is a file system operation within the repo.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| wrangler (D1 migration) | 0047_work_logs.sql apply | YES | 4.75.0 | — |
| xlsx template source | D-24 template copy | YES — `작업용/点検일지 양식/소방안전관리자 업무 수행 기록표.xlsx` | — | — |

[VERIFIED: wrangler version from CLAUDE.md; template file from ls 작업용/]

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None configured — no pytest.ini, jest.config, vitest.config found in cha-bio-safety |
| Config file | none — see Wave 0 |
| Quick run command | `npm run build` (TypeScript compile acts as type check) |
| Full suite command | `npm run build` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WORKLOG-01 | WorkLogPage renders form + save works | manual smoke | deploy + manual browser test | ❌ Wave 0 |
| WORKLOG-02 | Excel output downloads valid .xlsx | manual smoke | deploy + manual download test | ❌ Wave 0 |
| WORKLOG-03 | work_logs D1 table persists data | manual smoke | deploy + API call test | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run build` (TypeScript compile — catches type errors)
- **Per wave merge:** `npm run build` — verify no TS errors
- **Phase gate:** Production deploy + manual browser walkthrough (WORKLOG-01/02/03 checklist)

### Wave 0 Gaps
- No test framework present in cha-bio-safety (no jest/vitest/playwright configured)
- All validation is via production deploy + manual browser test per project convention (MEMORY.md: "항상 프로덕션 배포 후 테스트")
- `npm run build` serves as the only automated validation gate

*(Automated unit/integration tests are out of scope for this project)*

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes (indirect) | JWT via `_middleware.ts` — already handles all `/api/` routes |
| V3 Session Management | no | JWT stateless, handled globally |
| V4 Access Control | yes | `requireAdmin()` on PUT/DELETE — D-13 |
| V5 Input Validation | yes | year_month regex `/^\d{4}-(0[1-9]|1[0-2])$/` on API entry — D-37 |
| V6 Cryptography | no | No crypto operations in this phase |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthorized write (non-admin saves record) | Elevation of Privilege | `requireAdmin()` returns 403 before any DB write |
| Malformed year_month in URL param | Tampering | Regex validation `/^\d{4}-(0[1-9]|1[0-2])$/` at handler entry — D-37 |
| XSS via stored text fields | Tampering | React renders text as text nodes (not innerHTML); Excel `esc()` escapes XML entities |
| SQL injection via text fields | Tampering | D1 `.bind()` parameterized queries — all string values bound, never interpolated |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | worklog_template.xlsx sheet1 has explicit `<c r="Y12">`, `<c r="Y14">`, `<c r="Y19">`, `<c r="Y21">` cell tags (not blank/merged with no tag) | Excel Generation / Pitfall 4 | √ checkmarks won't appear; need to add cells to sheet XML or use sharedStrings approach |
| A2 | AA10, AA14 cells in sheet1 have `wrapText="1"` in their style, so `&#10;` line breaks will render correctly | Excel Generation / Pitfall 5 | Multi-line action text renders as single line; need addShrinkStyle or wrapText patch |
| A3 | `'특별피난계단'` is the appropriate substitute for `'방화문'` in escape_action query (user accepts this mapping) | Critical Finding / D-18 | escape_action may miss or over-include records; user may prefer no substitution |
| A4 | Month picker: simple prev/next arrows + current month label is sufficient (no inline calendar needed) | Architecture / DailyReportPage pattern | UI may feel insufficient; user may expect a month/year grid picker |

**Notes on A1/A2:** These must be verified by the implementing agent by unzipping `worklog_template.xlsx` and inspecting `xl/worksheets/sheet1.xml` and `xl/styles.xml` before writing `generateWorkLogExcel`. This is a Wave 0 task.

---

## Open Questions

1. **방화문 category mapping (D-22 / A3)**
   - What we know: DB has `'특별피난계단'` for fire-door checkpoints; `'방화문'` category does not exist
   - What's unclear: Whether the business stakeholder wants `'특별피난계단'` records included in `escape_action`, or whether `escape_action` should simply be empty when there are no `'방화문'` records
   - Recommendation: Use `'특별피난계단'` as substitute (it covers the physical fire door inspection); add a code comment explaining the mapping

2. **Template cell structure for Y12/Y14 checkmarks (A1)**
   - What we know: The PDF shows √ checkboxes at those positions; exact XML structure unknown until template is opened
   - What's unclear: Are those cells merged? Do they have explicit `<c>` tags? Are checkmarks already in sharedStrings?
   - Recommendation: Wave 0 task — unzip template, grep for `r="Y12"`, confirm before writing patchCell calls

3. **Multiline wrapText for AA10/AA14 (A2)**
   - What we know: fire_action may contain multiple lines; `&#10;` only works with `wrapText="1"`
   - What's unclear: Whether the original template has wrapText on those cells
   - Recommendation: Wave 0 task — inspect styles.xml for the s= index of `<c r="AA10">` and verify `wrapText`

---

## Project Constraints (from CLAUDE.md)

| Constraint | Applies to Phase 22 |
|------------|---------------------|
| Cloudflare 생태계 고정 (Pages + D1 + R2 + Workers) | YES — D1 for work_logs, Pages Functions for API |
| 추가 비용 $0 | YES — no new services |
| PWA, iOS 16.3.1+ / Android 15+ / PC 1920x1080 | YES — WorkLogPage must be responsive (DailyReportPage is the reference) |
| 점검 기록 삭제 불가 원칙 | YES — no delete UI (D-32) |
| Excel output 기존 양식과 호환 | YES — fflate template patch preserves original format |
| xlsx-js-style 신규 라이브러리 추가 금지 | YES — fflate pattern only |
| TypeScript strict: false | YES — lenient typing acceptable |
| 인라인 스타일 + CSS 변수만 사용 | YES — Tailwind/CSS modules forbidden |
| 프로덕션 배포 후 테스트 (로컬 서버 X) | YES — deploy with `--branch production` |
| wrangler deploy에 `--branch=production` 필수 | YES |
| GSD workflow for file edits | YES |

---

## Sources

### Primary (HIGH confidence)
- `cha-bio-safety/src/utils/generateExcel.ts` — fflate patchCell pattern, generateDailyExcel, addShrinkStyle, getCellStyleIdx functions [VERIFIED: read lines 1-893]
- `cha-bio-safety/src/pages/DailyReportPage.tsx` — page structure, month navigation base, query+mutation pattern [VERIFIED: read lines 1-220]
- `cha-bio-safety/functions/api/documents/_helpers.ts` — requireAdmin, jsonOk, jsonError patterns [VERIFIED: read full file]
- `cha-bio-safety/functions/api/daily-report/index.ts` — DB query pattern, schedule/remediation join [VERIFIED: read full file]
- `cha-bio-safety/src/utils/api.ts` — DEFAULT_SIDE_MENU, migrateLegacyMenuConfig, namespace pattern [VERIFIED: read lines 1-370]
- `cha-bio-safety/src/types/index.ts` — RemediationRecord, ScheduleItem type shapes [VERIFIED: read lines 1-90]
- `cha-bio-safety/migrations/` — actual category values in check_points [VERIFIED: 0009_checkpoint_fix.sql, 0011_fire_extinguishers.sql, seed.sql]

### Secondary (MEDIUM confidence)
- `.planning/phases/22-form-excel-output/22-CONTEXT.md` — all implementation decisions locked by user discussion [VERIFIED: read full file]
- `cha-bio-safety/src/components/SideMenu.tsx` — MENU structure, Phase 21 `/documents` item [VERIFIED: grep lines 17-51]
- `cha-bio-safety/src/components/DesktopSidebar.tsx` — DESKTOP_SECTIONS [VERIFIED: grep line 11]

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already present in project
- Architecture patterns: HIGH — verified against existing code
- Category name mapping: HIGH — verified against migrations
- Template cell addresses: MEDIUM — based on CONTEXT cell map, but XML structure unverified
- wrapText/checkmark cell structure: LOW — requires template XML inspection

**Research date:** 2026-04-10
**Valid until:** 2026-05-10 (stable stack, 30 days)
