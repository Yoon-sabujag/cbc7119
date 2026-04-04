# Phase 11: Elevator Inspection Certs - Research

**Researched:** 2026-04-05
**Domain:** Cloudflare D1 schema migration, R2 file upload/view, React inline UI extension, next-date calculation logic
**Confidence:** HIGH

## Summary

Phase 11 extends the existing `elevator_inspections` table and `ElevatorPage.tsx` annual tab to support:
1. Three inspection types (정기/수시/정밀안전검사) with a result enum (pass/conditional/fail)
2. Certificate/report file attachment via R2 (PDF and images) — already partially implemented
3. Conditional-pass findings management (새 테이블 `elevator_inspection_findings`) mirroring the `legal_findings` pattern from Phase 10
4. Next-inspection-date auto-calculation per elevator type + 30-day warning badges on ElevatorPage list and DashboardPage

The codebase already has a `certificate_key` column (migration 0037) and upload UI in the annual tab. The primary work is: (a) DB migration to add `inspect_type` enum and `result` alias column, (b) a new `elevator_inspection_findings` table, (c) extending the annual tab UI for conditional findings, and (d) next-date calculation and warning badge logic.

**Primary recommendation:** Reuse the `legal_findings` / `legal_findings_detail` pattern verbatim — same table shape, same API file structure, same page pattern. The only custom logic is the inspection-cycle calculation.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** 파일 유형: PDF + 이미지(사진/스캔) 모두 지원
- **D-02:** 인앱 뷰어로 미리보기 + 새 탭 열기 버튼 제공
- **D-03:** 관리자만 인증서 업로드 가능
- **D-04:** 호기별로 인증서 관리 (검사 기록 레코드에 첨부)
- **D-05:** 검사 유형: 정기검사/수시검사/정밀안전검사 3종
- **D-06:** 검사 결과: 합격(pass)/조건부합격(conditional)/불합격(fail) 3단계
- **D-07:** 검사일은 재단시설팀 통보 → SchedulePage에서 등록하는 방식 (Phase 10 법적점검과 동일 패턴)
- **D-08:** 기존 ElevatorPage의 annual 탭 + elevator_inspections 테이블 활용 — type 필드를 free text → enum으로 변경, overall → result(pass/conditional/fail)로 변경
- **D-09:** Phase 10 지적사항/조치 패턴과 동일하게 구현
- **D-10:** 별도 테이블 필요: elevator_inspection_findings (legal_findings 패턴 재활용)
- **D-11:** 전체 직원이 조치 기록, 관리자가 편집/정리
- **D-12:** 마지막 검사일 + 호기 타입별 주기로 다음 검사 예정일 자동 계산
- **D-13:** 검사주기: 승객용/에스컬레이터=1년, 화물용/소형화물용(dumbwaiter)=2년, 설치 25년 경과=6개월
- **D-14:** 도래 30일 전부터 승강기 목록 + 대시보드에 경고 배지 표시
- **D-15:** 수시/정밀안전검사를 받으면 정기검사 주기가 해당 검사일부터 리셋

### Claude's Discretion
- 인앱 뷰어 구현 방식 (기존 PdfFloorPlan 컴포넌트 재활용 vs 새 뷰어)
- 검사 예정일 경고 배지의 시각적 디자인
- elevator_inspections 테이블 마이그레이션 전략 (ALTER vs 새 테이블)
- 대시보드 경고 표시 위치 및 형태

### Deferred Ideas (OUT OF SCOPE)
- 검사기관 통보 연동 (외부 시스템 연동은 현재 범위 밖)
- 푸시 알림 (PWA 푸시 미구현 상태 — 인앱 배지만 구현)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ELEV-02 | 승강기 법정검사 인증서/리포트를 업로드하고 조회할 수 있다 (R2) | D-01 through D-15 cover the full scope: schema migration, upload/view UI, conditional findings, next-date calculation, warning badges |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Tech stack locked: Cloudflare Pages + D1 + R2 + Workers. No new services.
- TypeScript 5.6.3, React 18.3.1, Zustand 5, React Query 5, Tailwind CSS 3 (via CSS variables, not class-based in pages)
- Inline styles + CSS variables (`var(--bg)`, `var(--t1)`, etc.) — NOT Tailwind classes in page components
- API handlers: `onRequestGet`, `onRequestPost`, `onRequestPut`, `onRequestDelete` exports in `functions/api/`
- Auth middleware: `functions/_middleware.ts` injects `staffId`, `role`, `name` via `ctx.data`
- `{ success: boolean; data?: T; error?: string }` response shape for all API endpoints
- No DELETE on inspection records (data integrity principle — use soft status instead)
- Korean UI text; toast for user feedback; `react-hot-toast`
- File upload: POST to `/api/uploads` (FormData), returns `{ success, data: { key } }`, then store `key` in DB
- R2 file access: GET `/api/uploads/{key}` (served by `functions/api/uploads/[[path]].ts`)
- Migrations numbered sequentially; next is `0040_elevator_inspection_certs.sql`

## Standard Stack

### Core (all already in project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React + React Query | 18.3.1 / 5.59.0 | UI + server state | Established project pattern |
| Cloudflare D1 (SQLite) | — | Persistent data | Project-wide DB binding |
| Cloudflare R2 | — | File storage | Existing upload infrastructure |
| date-fns | 4.1.0 | Date arithmetic for next-inspection calc | Already installed |
| react-hot-toast | 2.4.1 | User feedback | Project standard |

### No New Dependencies Required
All needed libraries are already installed. The in-app viewer reuses the existing `PdfFloorPlan` component (uses `pdfjs-dist`, already present) for PDF files. Image files are shown via `<img>` tag pointing at `/api/uploads/{key}`.

## Architecture Patterns

### Recommended File Layout (new files only)
```
cha-bio-safety/
├── migrations/
│   └── 0040_elevator_inspection_certs.sql   # schema changes
├── functions/api/elevators/
│   ├── inspections.ts                        # extend existing (type enum, result column)
│   ├── next-inspection.ts                    # GET — returns per-elevator next date + overdue flag
│   └── [elevatorId]/
│       └── inspections/
│           └── [inspectionId]/
│               ├── cert.ts                   # existing PUT endpoint (already done)
│               └── findings/
│                   ├── index.ts              # GET list + POST create (mirrors legal/[id]/findings/index.ts)
│                   └── [fid]/
│                       └── resolve.ts        # POST resolve (mirrors legal/[id]/findings/[fid]/resolve.ts)
└── src/
    ├── pages/
    │   ├── ElevatorPage.tsx                  # extend annual tab (findings panel, type selector, upload guard)
    │   └── ElevatorFindingDetailPage.tsx     # NEW — mirrors LegalFindingDetailPage.tsx
    └── utils/
        └── api.ts                            # add elevatorInspectionApi namespace
```

### Pattern 1: Schema Migration (ALTER approach — D-08 discretion)
**What:** ALTER existing `elevator_inspections` table (add columns, no data loss). SQLite ALTER TABLE ADD COLUMN is safe and supported by D1.
**When to use:** Preferred when existing rows are compatible with new defaults.

```sql
-- 0040_elevator_inspection_certs.sql
-- Extend elevator_inspections: add inspect_type enum + result alias
ALTER TABLE elevator_inspections ADD COLUMN inspect_type TEXT DEFAULT 'regular'
  CHECK(inspect_type IN ('regular','special','detailed'));
ALTER TABLE elevator_inspections ADD COLUMN result TEXT
  CHECK(result IN ('pass','conditional','fail'));

-- elevator_inspection_findings table (mirrors legal_findings)
CREATE TABLE IF NOT EXISTS elevator_inspection_findings (
  id                   TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  inspection_id        TEXT NOT NULL REFERENCES elevator_inspections(id),
  description          TEXT NOT NULL,
  location             TEXT,
  photo_key            TEXT,
  resolution_memo      TEXT,
  resolution_photo_key TEXT,
  status               TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','resolved')),
  resolved_at          TEXT,
  resolved_by          TEXT REFERENCES staff(id),
  created_by           TEXT NOT NULL REFERENCES staff(id),
  created_at           TEXT NOT NULL DEFAULT (datetime('now','+9 hours'))
);
CREATE INDEX idx_elev_findings_inspection ON elevator_inspection_findings(inspection_id, status);
```

**Note on `overall` vs `result`:** The existing `overall` column has a CHECK constraint of `('normal','caution','bad','pass','conditional','fail')` (migration 0006 loosened this). Annual records already use `pass/conditional/fail` in `overall`. The new `result` column makes this explicit for annual records. Both columns coexist; the annual-type API writes both for backward compatibility.

### Pattern 2: Findings API (mirror of legal_findings)
**What:** File-based routing under `functions/api/elevators/[elevatorId]/inspections/[inspectionId]/findings/`
**Route signature:**
- `GET  /api/elevators/:eid/inspections/:iid/findings` → list findings for an inspection
- `POST /api/elevators/:eid/inspections/:iid/findings` → create finding (all roles)
- `POST /api/elevators/:eid/inspections/:iid/findings/:fid/resolve` → resolve (all roles)

The parent `inspection_id` comes from `params.inspectionId`. Pattern is identical to `legal/[id]/findings/index.ts`.

### Pattern 3: Next Inspection Date Calculation
**What:** Server-side calculation of next due date per elevator.
**Logic:**

```typescript
// Source: CONTEXT.md D-12, D-13, D-15
// Cycle rules:
//   passenger | escalator → 1 year
//   cargo | dumbwaiter   → 2 years
//   installed 25+ years ago → 6 months (overrides above)
//
// Last inspection = MAX(inspect_date) from elevator_inspections WHERE type='annual'
//   AND inspect_type IN ('regular','special','detailed')  -- D-15: all types reset cycle
//
// next_date = last_inspection_date + cycle
// due_soon  = next_date <= today + 30 days
// overdue   = next_date < today

function getCycleMonths(elevatorType: string, installYear: number, today: Date): number {
  const age = today.getFullYear() - installYear
  if (age >= 25) return 6
  if (elevatorType === 'passenger' || elevatorType === 'escalator') return 12
  return 24  // cargo, dumbwaiter
}
```

**API endpoint:** `GET /api/elevators/next-inspection` returns array of `{ elevator_id, last_date, next_date, due_soon, overdue }`. Consumed by ElevatorPage list tab and DashboardPage stats.

### Pattern 4: In-App Certificate Viewer
**What:** When a `certificate_key` is present, show inline viewer. If PDF → reuse `PdfFloorPlan` component (already renders PDF via pdfjs-dist). If image → render `<img>` tag. Detect type from key suffix or MIME (key ends in `.pdf` vs `.jpg/.png`).
**Decision (Claude's Discretion):** Reuse `PdfFloorPlan` for PDF (already tested in project). Wrap in a fullscreen modal overlay (same pattern as `EvDetailModal`). Provide "새 탭 열기" button alongside viewer.

### Pattern 5: Upload Guard (D-03 — admin only)
**What:** The existing upload label in annual tab has no role check. Add `isAdmin` guard around the upload `<label>` — non-admins see a read-only placeholder when no cert is attached.

### Pattern 6: Warning Badge on ElevatorPage List
**What:** Fetch `next-inspection` data alongside `elevators`. In the list tab, show an orange badge "D-NN" or red "초과" on elevator cards where `due_soon` or `overdue` is true.

### Pattern 7: Warning on Dashboard
**What:** Extend `dashboard/stats.ts` to add `elevInspDueSoon: number` to `stats` object. Query: count elevators where computed next date ≤ today + 30 days. Display as a small orange badge near the elevator fault count on DashboardPage.

### Anti-Patterns to Avoid
- **Creating a new `elevator_annual_inspections` table:** D-08 explicitly says reuse existing `elevator_inspections` table. ALTER is sufficient.
- **Duplicating upload logic:** Use the existing `/api/uploads` POST endpoint + `/api/uploads/{key}` GET. Never write custom R2 logic.
- **Calling pdfjs-dist in a Worker function:** PDF rendering is client-side only; PdfFloorPlan is a React component. Server API only stores/retrieves the R2 key.
- **Hardcoding install years:** The `elevators` table must be checked for an `install_year` column. If absent, the 25-year rule cannot be applied; treat as not applicable and use type-based cycle only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF in-browser rendering | Custom PDF parser | `PdfFloorPlan` (pdfjs-dist) | Already in project, tested, handles CMap/fonts |
| File upload to R2 | Custom multipart handler | `/api/uploads` POST + R2 binding | Existing infrastructure in `functions/api/uploads/index.ts` |
| Date arithmetic | Manual month addition | `date-fns addMonths` | DST-safe, already installed |
| Findings CRUD | New custom pattern | Copy `legal_findings` API shape | Identical requirements, proven pattern |

## Runtime State Inventory

> Not applicable — this is a greenfield feature addition (new table + new UI), not a rename/refactor phase.

## Common Pitfalls

### Pitfall 1: elevator_inspections `overall` CHECK constraint
**What goes wrong:** The original migration 0002 defines `overall CHECK(overall IN ('normal','caution','bad'))`. If you INSERT with `overall='pass'` it will fail on a fresh DB. Migration 0006 (`0006_fix_overall.sql`) should have relaxed this, but needs verification before writing INSERT code.
**Why it happens:** Multiple migrations modified the same column.
**How to avoid:** Read `0006_fix_overall.sql` before writing INSERT. If still restrictive, add a new ALTER in migration 0040 to drop and recreate the constraint (SQLite workaround: rename table, recreate, copy data).
**Warning signs:** `CHECK constraint failed` error on POST /api/elevators/inspections.

### Pitfall 2: D-13 "25-year rule" requires install_year on elevators table
**What goes wrong:** The calculation `today.getFullYear() - installYear >= 25` requires an `install_year` field on the `elevators` table that may not exist.
**Why it happens:** The elevators table was created in migration 0001/0002 without install year.
**How to avoid:** Check migrations for `install_year` column. If absent, add it in migration 0040 with `ADD COLUMN install_year INTEGER` and seed with NULL. The 25-year rule activates only when `install_year IS NOT NULL`.
**Warning signs:** Calculation always falls back to type-based cycle even for old elevators.

### Pitfall 3: `type` field in existing annual records is `'annual'` (not `'regular'`/`'special'`/`'detailed'`)
**What goes wrong:** D-08 says change `type` enum, but existing records have `type='annual'`. The UI filter `WHERE type='annual'` in `fetchInspections` will break if you rename the enum.
**Why it happens:** Migration strategy conflict between old data and new enum.
**How to avoid:** Keep `type='annual'` as the existing value. The new `inspect_type` column (DEFAULT 'regular') holds the sub-type. Do NOT rename the `type` column values. The annual tab query stays `WHERE type='annual'`; the new `inspect_type` column adds granularity on top.
**Warning signs:** Annual tab shows 0 records after migration.

### Pitfall 4: File type detection for viewer
**What goes wrong:** R2 keys are stored as arbitrary strings (e.g. `elevators/certs/EV-01/1712345678/cert.pdf`). If the key doesn't have an extension, the viewer can't determine PDF vs image.
**Why it happens:** The existing upload endpoint generates keys with a random ID, potentially no extension.
**How to avoid:** Check `functions/api/uploads/index.ts` to confirm key format. The existing pattern for legal reports uses keys that preserve the original filename extension. Alternatively, detect by attempting PDF parse and falling back to `<img>`.
**Warning signs:** PDF displayed as broken image or vice versa.

### Pitfall 5: Dashboard stats query performance
**What goes wrong:** Adding a next-inspection calculation to `dashboard/stats.ts` (which runs on every page load + every 30s) could add multiple D1 queries.
**Why it happens:** Per-elevator date calculation requires querying `elevator_inspections` grouped by elevator.
**How to avoid:** Use a single aggregating query: `SELECT elevator_id, MAX(inspect_date) FROM elevator_inspections WHERE type='annual' GROUP BY elevator_id`. Join with `elevators` for type. Compute next date in JavaScript, not SQL. Keep to ≤2 additional D1 calls.

## Code Examples

### Next Inspection Calculation (verified against date-fns API)
```typescript
// Source: date-fns addMonths + isBefore API
import { addMonths, isBefore, differenceInDays } from 'date-fns'

function nextInspectionDate(lastDate: string, cycleMonths: number): Date {
  return addMonths(new Date(lastDate), cycleMonths)
}

function inspectionStatus(nextDate: Date, today: Date): 'ok' | 'due_soon' | 'overdue' {
  if (isBefore(nextDate, today)) return 'overdue'
  if (differenceInDays(nextDate, today) <= 30) return 'due_soon'
  return 'ok'
}
```

### API Client (elevatorInspectionApi to add to api.ts)
```typescript
// Pattern mirrors legalApi in src/utils/api.ts
export const elevatorInspectionApi = {
  getFindings: (elevatorId: string, inspectionId: string) =>
    api.get<ElevatorInspectionFinding[]>(
      `/elevators/${elevatorId}/inspections/${inspectionId}/findings`
    ),
  createFinding: (elevatorId: string, inspectionId: string, body: { description: string; location?: string }) =>
    api.post<{ id: string }>(
      `/elevators/${elevatorId}/inspections/${inspectionId}/findings`, body
    ),
  resolveFinding: (elevatorId: string, inspectionId: string, fid: string, body: { resolution_memo: string; resolution_photo_key?: string }) =>
    api.post<void>(
      `/elevators/${elevatorId}/inspections/${inspectionId}/findings/${fid}/resolve`, body
    ),
  getNextInspection: () =>
    api.get<{ elevatorId: string; nextDate: string; status: 'ok' | 'due_soon' | 'overdue' }[]>(
      '/elevators/next-inspection'
    ),
}
```

### Findings API Handler (findings/index.ts)
```typescript
// Source: mirrors functions/api/legal/[id]/findings/index.ts exactly
// Parent param: params.inspectionId (not params.id)
// Table: elevator_inspection_findings
// FK column: inspection_id (not schedule_item_id)
```

### Annual Tab — Conditional Findings Panel
```typescript
// When isExpanded && i.result === 'conditional':
// Show "조건부합격 조치 요구사항" section below existing detail grid
// Same card pattern as LegalFindingsPage.tsx (open findings list + 등록 BottomSheet)
// Admin: 조치 등록 button visible to all; but cert upload button gated behind isAdmin
```

### Certificate Viewer
```typescript
// In annual tab card: replace existing <a href target="_blank"> with inline viewer modal
// Detect PDF: certificateKey.toLowerCase().endsWith('.pdf')
// PDF → <PdfFloorPlan url={`/api/uploads/${certificateKey}`} scale={1} onReady={() => {}} />
//         + "새 탭 열기" <a> button
// Image → <img src={`/api/uploads/${certificateKey}`} style={{ maxWidth:'100%' }} />
//         + "새 탭 열기" <a> button
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `type='annual'` only in elevator_inspections | Add `inspect_type` sub-column ('regular'/'special'/'detailed') | Phase 11 migration 0040 | Existing rows keep `type='annual'`, new column defaults to 'regular' |
| `overall` stores both monthly and annual results | New `result` column explicitly for annual pass/conditional/fail | Phase 11 migration 0040 | Both columns coexist; write both for backward compat |
| Certificate upload: no admin guard | Admin-only upload (`isAdmin` check in UI) | Phase 11 | Non-admins see read-only indicator |

## Open Questions

1. **`elevators` table `install_year` column existence**
   - What we know: Not present in migration 0002 (original schema). Not added in 0003-0039.
   - What's unclear: Has it been added via an ad-hoc migration not tracked in git?
   - Recommendation: Add `install_year INTEGER` in migration 0040 with NULL default. Populate via admin or seed. Gate the 25-year rule on `install_year IS NOT NULL`.

2. **`overall` CHECK constraint in elevator_inspections**
   - What we know: Migration 0002 restricts to `('normal','caution','bad')`. Migration 0006 may have changed it.
   - What's unclear: Final state of the constraint in the live D1 database.
   - Recommendation: Read `0006_fix_overall.sql` first. If still restrictive, include a table recreation in migration 0040 (SQLite pattern: CREATE new + INSERT SELECT + DROP old + RENAME).

3. **R2 key format for uploads — extension preserved?**
   - What we know: `functions/api/uploads/index.ts` generates the key. Legal report upload in ElevatorPage.tsx line 500-503 does not inspect the key format.
   - What's unclear: Whether the key includes the original file extension.
   - Recommendation: Read `functions/api/uploads/index.ts` before building the viewer. If no extension in key, use content-type response header from R2 to determine rendering.

## Environment Availability

> Step 2.6: SKIPPED (no new external tools required — all dependencies are already deployed Cloudflare services and installed npm packages)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — project has no test framework configured |
| Config file | none |
| Quick run command | `npm run build` (TypeScript compilation as proxy for correctness) |
| Full suite command | `npm run build` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ELEV-02 | PDF/image upload and view per elevator | manual | — | N/A |
| ELEV-02 | Conditional findings CRUD | manual | — | N/A |
| ELEV-02 | Next inspection date calculation | manual | — | N/A |
| ELEV-02 | 30-day warning badge visible | manual | — | N/A |
| ELEV-02 | TypeScript compilation clean | smoke | `npm run build` | ✅ |

### Sampling Rate
- **Per task commit:** `cd /Users/jykevin/Documents/20260328/cha-bio-safety && npm run build`
- **Per wave merge:** `npm run build`
- **Phase gate:** Build green + manual smoke test before `/gsd:verify-work`

### Wave 0 Gaps
None — no test framework to set up. TypeScript build serves as compilation check.

## Sources

### Primary (HIGH confidence)
- Direct code read: `cha-bio-safety/src/pages/ElevatorPage.tsx` — annual tab UI, AnnualModal, upload flow, OVERALL_STYLE
- Direct code read: `cha-bio-safety/functions/api/elevators/inspections.ts` — existing CRUD API
- Direct code read: `cha-bio-safety/functions/api/elevators/[elevatorId]/inspections/[inspectionId]/cert.ts` — cert PUT
- Direct code read: `cha-bio-safety/migrations/0002_elevator.sql` — original schema
- Direct code read: `cha-bio-safety/migrations/0037_elev_cert_and_weekly_menu.sql` — certificate_key ADD COLUMN
- Direct code read: `cha-bio-safety/migrations/0038_legal_findings.sql` — legal_findings table as pattern
- Direct code read: `cha-bio-safety/functions/api/legal/[id]/findings/index.ts` — findings API pattern
- Direct code read: `cha-bio-safety/functions/api/legal/[id]/findings/[fid]/resolve.ts` — resolve API pattern
- Direct code read: `cha-bio-safety/src/pages/LegalFindingsPage.tsx` — findings list UI pattern
- Direct code read: `cha-bio-safety/src/pages/LegalFindingDetailPage.tsx` — finding detail + resolve UI
- Direct code read: `cha-bio-safety/src/utils/api.ts` — legalApi pattern + api.post/get helpers
- Direct code read: `cha-bio-safety/src/types/index.ts` — LegalFinding, LegalRound type shapes
- Direct code read: `cha-bio-safety/src/components/PdfFloorPlan.tsx` — existing PDF viewer
- Direct code read: `cha-bio-safety/functions/api/dashboard/stats.ts` — dashboard query pattern
- Direct code read: `CLAUDE.md` — tech stack constraints

### Secondary (MEDIUM confidence)
- 승강기안전관리법 시행규칙 제54조 — inspection cycle rules (passenger=1yr, cargo=2yr, 25yr=6mo); referenced in CONTEXT.md as canonical ref; not independently verified against current law text but per user decision D-13

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in project, no new deps
- Architecture: HIGH — patterns are direct copies of Phase 10 legal inspection implementation
- Pitfalls: HIGH — identified from direct schema and code inspection
- Inspection cycle logic: MEDIUM — law reference per user's CONTEXT.md; not re-verified against official text

**Research date:** 2026-04-05
**Valid until:** 2026-05-05 (stable stack, 30-day window)
