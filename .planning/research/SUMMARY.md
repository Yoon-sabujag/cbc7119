# Project Research Summary

**Project:** CHA Bio Complex Fire Safety Management System — Milestone 2
**Domain:** Korean Building Fire Safety Facility Management PWA (Cloudflare-native, edge-first)
**Researched:** 2026-03-28
**Confidence:** HIGH (stack and architecture derived from direct codebase inspection; features derived from first-party design documents and regulatory knowledge)

## Executive Summary

This is a completion milestone for an existing, partially-built internal PWA used by a 4-person fire safety team at CHA Bio Complex (Pangyo, Seongnam). The system is architected as a React 18 SPA deployed on Cloudflare Pages with Pages Functions as the API layer, D1 (SQLite) for persistence, and R2 for file storage. The core stack is already validated and working in production for 4 of 10 planned report types. The remaining work is entirely additive: 6 more Excel report types, legal inspection tracking (fire and elevator), admin settings, and three lightweight operational features (training tracking, meal tracking, and schedule-record linkage). No new architectural patterns are required — every remaining feature fits the established file-system routing, D1 query, and client-side Excel generation pattern.

The single most important technical decision for this milestone is the Excel generation strategy. The existing approach — `fflate` to unzip an `.xlsx` template, direct XML cell patching, then rezip for browser download — is the correct and only viable approach given the Cloudflare Workers edge runtime. Moving Excel generation server-side would require Node.js-dependent libraries that are incompatible with the Workers isolate, and would risk exceeding CPU time limits for multi-sheet workbooks. The `xlsx-js-style` package (installed but unused) should be removed to reduce bundle size. All 6 new report types must follow the same client-side template patching pattern already established for the first 4 types.

The primary risks are deployment-related, not architectural. A known 504 error on `wrangler pages deploy` must be diagnosed and resolved before any new feature work can be shipped to production. D1 schema drift between local and remote environments is the next highest risk, particularly as 5+ new migrations are needed this milestone. Both risks have clear, actionable mitigations documented in PITFALLS.md.

---

## Key Findings

### Recommended Stack

The existing stack requires no new technology bets. The only dependency changes are: add `fflate@^0.8.2` as an explicit dependency (currently dynamically imported, which risks tree-shaking surprises) and remove `xlsx-js-style` (~400KB bundle savings, zero functionality impact). All new features — legal inspection management, elevator inspection schedules, admin settings, training tracking, meal tracking — are implemented using the existing Hono-free Pages Functions pattern, D1 prepared statements, and TanStack Query on the client.

**Core technologies:**
- `fflate` (^0.8.2): ZIP/unzip for `.xlsx` template manipulation — the only edge-compatible Excel generation approach for this project
- Cloudflare Pages Functions (file-system routing): API layer — already established for 15+ endpoints, do not introduce Hono
- Cloudflare D1 (SQLite): Persistent data store — needs 5+ new migrations for remaining features
- Cloudflare R2: Document/photo storage — reuse existing upload pattern for legal inspection documents
- TanStack Query: Client-side data fetching and caching — extend existing queries, add legal inspection due-date alerts to dashboard stats endpoint

### Expected Features

All remaining features are well-specified in the first-party design document and are additive to existing infrastructure.

**Must have (table stakes — legally required):**
- Excel inspection log output for 6 remaining types (소방펌프, 자탐, 제연, 방화셔터, 피난방화시설, 일일업무일지) — Korean fire safety law mandates written records
- Legal fire safety inspection management (법적 점검 관리) — bi-annual statutory inspections with deficiency tracking
- Elevator legal inspection and annual schedule management (승강기 실데이터 연동) — required by 승강기 안전관리법 for 17 units

**Should have (operational completeness):**
- Admin settings (관리자 설정) — user management, checkpoint enable/disable, system config; required before long-term maintainability
- Schedule-to-record linkage (점검 일정 ↔ 점검 기록 연결) — closes accuracy gap in dashboard completion stats

**Build if time allows:**
- Training/continuing education tracking (보수교육 일정 관리) — low complexity, regulatory relevance; `trainings` table already designed
- Meal tracking (식사 이용 기록) — low complexity, team-requested; `meals` table already designed

**Defer permanently (this milestone):**
- AI daily report auto-writing — 4단계 feature, out of scope
- Web Push (VAPID) notifications — 4-person system, in-app banners are sufficient
- Mobile offline support — explicitly out of scope
- Multi-building/tenant support, OAuth, email/SMS alerts, complex role matrix

### Architecture Approach

The architecture is a Cloudflare-native edge application with strict separation: React SPA handles all UI and Excel generation in the browser; Pages Functions handle only data queries returning JSON; D1 and R2 are the only persistence layers. This separation is intentional and must not be violated — Excel generation must never move server-side. Every new feature follows the same five-step pattern: new D1 migration → new `functions/api/` handler file → new TanStack Query hook → new React page/component → new entry in `ReportsPage.tsx` if Excel output is involved.

**Major components:**
1. React SPA (`src/`) — UI, local state, all binary file manipulation (Excel generation via `generateExcel.ts`)
2. `functions/_middleware.ts` — JWT verification and CORS on every `/api/*` request; sets `ctx.data.staffId` for downstream handlers
3. `functions/api/**/*.ts` — pure data handlers: D1 queries, R2 operations, JSON responses following `{ success, data?, error? }` envelope
4. D1 database — persistent data; never accessed directly by the client; currently at migration 0023
5. R2 bucket — photo and document blob storage; accessed via upload/read endpoints only
6. `public/templates/*.xlsx` — Excel form templates served as static assets; fetched client-side by `generateExcel.ts`

### Critical Pitfalls

1. **Excel generation moved server-side** — Do not move `fflate` + XML patching into a Worker function. Workers have 30-second CPU limits; xlsx unzip/patch/rezip reliably exceeds this for multi-sheet workbooks. All 6 new report types must follow the client-side pattern in `generateExcel.ts`.

2. **504 deployment errors (build timeout vs. runtime timeout conflation)** — The known 504 must be diagnosed before feature shipping begins. Build-time 504s (Cloudflare Pages build runner >20 minutes) and runtime 504s (Worker CPU/wall-clock limit) require completely different fixes. Check build logs vs. Worker invocation logs separately. Do not mix D1 migration apply steps into the Pages build step.

3. **D1 local-vs-remote schema drift** — Never edit a migration file after it has been applied to any environment. Before every deploy, run `wrangler d1 migrations list --remote` vs. `--local` and resolve any discrepancy. Apply migrations one at a time with smoke testing between each. D1 has no rollback.

4. **R2 binary template read corruption** — When reading `.xlsx` template files, always use `await r2Object.arrayBuffer()`. Using `.text()` or `.json()` silently mangles binary ZIP data; the generated file opens in Excel showing "corrupt file" or garbage, with HTTP 200 returned (no error detectable without testing the download).

5. **PWA service worker cache poisoning after deployment** — Ensure `sw.js` is served with `Cache-Control: no-cache` via Cloudflare Pages `_headers` file. Without this, the 4 users (who may keep the PWA open across shifts) receive broken UI after deployments. Add a "new version available" banner using the Workbox `waitingWorker` event.

---

## Implications for Roadmap

Based on the dependency graph in ARCHITECTURE.md and the feature priorities in FEATURES.md, the recommended phase structure is:

### Phase 1: Deployment Unblock and Infrastructure Baseline
**Rationale:** The known 504 error on `wrangler pages deploy` blocks shipping anything. This phase must come first — it is a prerequisite for all subsequent phases. It also establishes the GitHub remote (currently not created) and validates the full deploy pipeline. Additionally, removing `xlsx-js-style` and making `fflate` an explicit dependency should happen here as housekeeping before new Excel work begins.
**Delivers:** Working deployment pipeline; confirmed production infrastructure; clean dependency baseline
**Addresses:** Cloudflare Pages 504 fix (STACK.md Decision 4); deployment pipeline setup (ARCHITECTURE.md)
**Avoids:** Pitfall 2 (build vs. runtime 504 conflation), Pitfall 5 (binding misconfiguration), Pitfall 7 (PWA cache poisoning), Pitfall 11 (preview env sharing production D1)

### Phase 2: Excel Report Output — 5 Annual Matrix Types
**Rationale:** The highest daily-use, legally required features. The 5 annual matrix types (소방펌프, 자탐, 제연, 방화셔터, 피난방화시설) share the same 12-month column structure — implement one template engine pattern and reuse across all 5. This grouping maximizes implementation efficiency. Template files must be derived from the reference `.xlsx` files in `점검 항목/` before coding begins.
**Delivers:** 5 new downloadable Excel inspection logs that satisfy legal documentation requirements
**Uses:** Existing `fflate` + XML patching pattern in `generateExcel.ts`; 5 new API endpoints in `functions/api/reports/`
**Avoids:** Pitfall 1 (Node.js libraries in Workers), Pitfall 4 (R2 binary corruption), Pitfall 10 (SheetJS CE style loss)
**Note:** Inspect template sheet indices before coding: `unzip -l 소방설비_월간점검일지_2026.xlsx | grep worksheet`

### Phase 3: Excel Report Output — Daily Work Log
**Rationale:** The daily work report (일일업무일지) is structurally different from the annual matrix types — it requires a complex server-side JOIN across `schedule_items`, `check_records`, `elevator_faults`, and shift data. Implementing it separately from Phase 2 avoids entangling the simpler reports with the more complex data-assembly logic. The shift calculation currently lives client-side in `shiftCalc.ts` and must be made available server-side for the API endpoint.
**Delivers:** Auto-populated daily work report Excel download; eliminates ~10-15 minutes of daily manual data entry
**Uses:** New `GET /api/reports/daily-log?date=YYYY-MM-DD` endpoint with multi-table JOIN
**Implements:** D-1 differentiator (daily work report auto-population)

### Phase 4: Legal Fire Safety Inspection Management
**Rationale:** Second legally required feature set. Independent of the Excel report phases — no shared dependencies. Two new D1 tables (`legal_inspections`, `legal_inspection_issues`) and new API routes. The deficiency tracking sub-feature is the most complex part; keep it as a simple status-column checklist (no state machine) for the 4-person team.
**Delivers:** Bi-annual statutory inspection scheduling, result and document management, deficiency tracking with dashboard alerts
**Uses:** New D1 migration (0024/0025); existing R2 upload pattern for document attachments; TanStack Query dashboard stats extension for 30-day due-date alerts
**Avoids:** Pitfall 3 (D1 schema drift), Pitfall 6 (missing indexes)

### Phase 5: Elevator Legal Inspection and Annual Schedule Management
**Rationale:** Third legally required feature set. Builds on the existing `elevator_inspections` table and `/api/elevators/inspections` endpoint — less new infrastructure than Phase 4. The annual schedule management requires one new table (`elevator_inspection_schedule`). The Excel output for 17-unit legal inspection records adds complexity; treat it as a separate deliverable within this phase.
**Delivers:** Per-elevator legal inspection records, annual schedule tracking with due-date alerts, inspection log Excel export
**Uses:** New migration (0026: `elevator_inspection_schedule`); extends existing elevator API; follows same Excel generation pattern
**Avoids:** Pitfall 3 (D1 schema drift), Pitfall 6 (missing indexes on new tables)

### Phase 6: Admin Settings and Facility Management
**Rationale:** Required before long-term maintainability but not blocking any other feature. Minimum viable scope: password reset (admin resets any account), checkpoint soft-delete (active flag only — never hard delete to preserve historical records), and basic system settings (key-value table). Do not build a full CRUD facility registration wizard.
**Delivers:** Maintainable system post-deployment; user and checkpoint management
**Uses:** Existing `staff` and `check_points` tables; role check (`ctx.data.role === 'admin'`) already available from JWT payload; new `system_settings` key-value table

### Phase 7: Operational Features (Training, Meal Tracking, Schedule Linkage)
**Rationale:** Lower priority, low complexity, no blocking dependencies. These three features can be done in any internal order. Training tracking and meal tracking each require one new D1 migration and one new React page. Schedule-to-record linkage requires logic changes to inspection submission flow and schedule display — deliver last to avoid touching core inspection flow before it is stable.
**Delivers:** Training/education deadline tracking; monthly meal expense reconciliation; accurate dashboard completion stats via schedule-record auto-matching
**Uses:** Pre-designed `trainings` and `meals` tables; auto-match logic on [month + year + category] key

### Phase Ordering Rationale

- Phase 1 is a hard prerequisite: nothing ships without a working deployment pipeline.
- Phases 2-3 are grouped by the Excel report domain and executed before feature phases because they are highest daily-use and legally required.
- Phases 4-5 (legal inspections) come after Excel reports because they are independent and slightly lower daily frequency.
- Phase 6 (admin) is deferred intentionally — it is not needed for feature functionality, only for long-term maintenance.
- Phase 7 features are explicitly lowest priority per the FEATURES.md MVP recommendation and carry no blocking dependencies.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Deployment unblock):** The exact 504 cause is unknown. Run diagnostic sequence (bundle size check, Worker invocation logs, build logs) before selecting a fix. Do not assume the cause.
- **Phase 3 (Daily work log):** The shift calculation currently lives entirely client-side in `shiftCalc.ts`. Verify whether it can be queried from D1 directly or must be replicated server-side before designing the API endpoint.
- **Phase 5 (Elevator inspections):** Confirm with the team whether per-elevator or per-type (escalator vs. elevator) inspection schedules are needed — 17 units with different types and schedules could drive significant UI complexity if not scoped carefully at the outset.

Phases with well-documented patterns (can skip research-phase):
- **Phase 2 (Annual matrix Excel types):** Pattern is identical to the existing 4 report types. Inspect template sheet indices, then implement. No new research needed.
- **Phase 4 (Legal fire inspections):** Straightforward table + API + React page pattern. Design doc specifies the data model. Legal requirements are well-understood.
- **Phase 6 (Admin settings):** Simple role-gated CRUD. No new patterns.
- **Phase 7 (Training, meals, schedule linkage):** All three follow established patterns; tables already designed in schema.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | fflate + XML patching pattern verified by direct inspection of `generateExcel.ts` (504 lines, 4 working report types). Dependency changes are housekeeping only. |
| Features | HIGH | Derived from first-party design document, progress report, and actual reference `.xlsx` inspection forms. Korean regulatory context (소방시설법, 승강기 안전관리법) is MEDIUM — training data through Aug 2025; verify against 국가법령정보센터 before final implementation. |
| Architecture | HIGH | All architectural claims derived from direct codebase inspection of `functions/`, `src/utils/`, `package.json`, `wrangler.toml`, `_routes.json`. Confirmed: no Hono dependency despite PROJECT.md reference; file-system routing is the actual pattern. |
| Pitfalls | MEDIUM | Runtime behavior pitfalls (D1 local vs. remote, Workers CPU limits, R2 binary handling) based on training knowledge through Aug 2025. No live documentation verification was possible. Flag for spot-check against current Cloudflare docs before Phase 1 execution. |

**Overall confidence:** HIGH for feature scope and architecture; MEDIUM for specific Cloudflare runtime limits and D1 migration behavior (verify before Phase 1).

### Gaps to Address

- **504 exact cause unknown:** STACK.md Decision 4 documents a diagnostic sequence but cannot prescribe the fix without running it. Phase 1 must begin with diagnosis, not a fix attempt.
- **Template sheet indices not yet mapped:** The 6 new Excel templates require identifying which `xl/worksheets/sheetN.xml` corresponds to which report. This must be done before writing any Phase 2 generator code. Run `unzip -l` on reference files.
- **Korean regulatory cutoff:** Fire safety law and elevator safety law citations are from training data (Aug 2025 cutoff). Verify current regulation text at 국가법령정보센터 (law.go.kr) before Phase 4 and Phase 5 to confirm inspection frequency and reporting requirements have not changed.
- **Shift calculation server-side availability:** It is unclear whether the shift data can be served from D1 directly or must be derived from client-side `shiftCalc.ts` logic. Resolve before designing the daily work log API endpoint in Phase 3.
- **fflate version:** Currently dynamically imported inline; verify that `^0.8.2` is still the current stable branch at https://www.npmjs.com/package/fflate before pinning in Phase 1.

---

## Sources

### Primary (HIGH confidence)
- `/Users/jykevin/Documents/20260328/cha-bio-safety/` (codebase) — direct inspection of all API handlers, `generateExcel.ts`, `package.json`, `wrangler.toml`, `_routes.json`, `deploy.sh`
- `/Users/jykevin/Documents/20260328/cbio_fire_system_design.md` — first-party design specification
- `/Users/jykevin/Documents/20260328/cbio_fire_progress_report_20260328.md` — current implementation state
- `/Users/jykevin/Documents/20260328/점검 항목/` — actual Korean fire safety inspection forms in use
- `/Users/jykevin/Documents/20260328/.planning/PROJECT.md` — milestone requirements

### Secondary (MEDIUM confidence)
- Korean fire safety law (소방시설 설치 및 관리에 관한 법률) — inspection frequency and reporting requirements; training data through Aug 2025
- Korean elevator safety law (승강기 안전관리법) — annual inspection requirements for 17 units; training data through Aug 2025
- Cloudflare Workers runtime limits and D1 migration behavior — training data; verify at https://developers.cloudflare.com/workers/platform/limits/ and https://developers.cloudflare.com/d1/reference/migrations/

### Tertiary (LOW confidence, needs validation)
- SheetJS edge runtime compatibility — verify current recommended import path at https://docs.sheetjs.com/docs/getting-started/platforms/cloudflare
- Korean elevator public API (data.go.kr) — out of scope for this milestone; would require separate API key and returns aggregate national data, not per-building records

---
*Research completed: 2026-03-28*
*Ready for roadmap: yes*
