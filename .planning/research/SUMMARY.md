# Project Research Summary

**Project:** CHA Bio Complex Fire Safety Management System
**Domain:** Fire Safety / Facility Management PWA — single building, 4-person internal team, Cloudflare-native edge stack
**Researched:** 2026-03-31 (v1.1 update; initial synthesis 2026-03-28 also incorporated)
**Confidence:** HIGH (stack/architecture derived from direct codebase inspection at migration 0032; features confirmed against Korean legal requirements; pitfalls cross-validated against project context)

---

## Executive Summary

This is a v1.1 milestone execution against a production PWA that shipped v1.0 complete. The system is a Cloudflare Pages + D1 + R2 application serving 4 fire safety personnel at CHA Bio Complex (Pangyo). v1.0 delivered 13 inspection categories, 10 Excel report types, QR scan workflow, shift scheduling, annual leave, elevator fault tracking, DIV pressure management, and daily work reports. The v1.1 work is entirely additive: 6 new DB migrations (0033–0038), 16 new API routes, 5 new React pages, and navigation restructuring — with zero architectural changes or rebuilds of existing features.

The recommended approach is to continue every established pattern without deviation. The `fflate` + XML template patching strategy for Excel is battle-tested across 4 report types and must not be replaced with ExcelJS or SheetJS for new types. All API routes follow Cloudflare Pages Functions file-system routing with named exports (no Hono). All new pages use TanStack Query for server state with no new Zustand stores. The 8 new feature areas each follow the identical pattern already proven in the codebase: DB migration → API handler file → React page → TanStack Query key. No new libraries are needed; only `xlsx-js-style` should be removed (unused, ~400KB) and `fflate` made an explicit dependency (currently an inline dynamic import).

The critical risks for v1.1 are: (1) a known deployment 504 that must be diagnosed and resolved before any new feature can ship — the fix depends entirely on whether it is a build-time timeout or a runtime timeout; (2) D1 local/remote schema drift if migration files are edited post-apply, especially with 6 new migrations pending; and (3) forgetting to update `NO_NAV_PATHS` in `App.tsx` when adding 4 new full-screen pages. The legal compliance urgency across 3 feature areas (소방시설법 연 2회 점검, 승강기 안전관리법 연 1회 검사, 소방안전관리자 2년 주기 교육) means regulatory consequences are real if these features are not delivered this milestone.

---

## Key Findings

### Recommended Stack

The existing stack requires only two dependency changes for v1.1: remove `xlsx-js-style` (installed but unused, ~400KB bundle waste) and explicitly declare `fflate@^0.8.2` as a direct dependency (currently used via inline dynamic import in production). No new frameworks, no new runtime dependencies. React 18 + Vite + Zustand + TanStack Query + Tailwind + Cloudflare D1/R2/Pages Functions is the complete runtime for all v1.1 features.

**Core technologies (no changes to these):**
- `fflate` (explicit dep, ^0.8.2): ZIP/unzip for `.xlsx` template patching — the only edge-runtime-compatible approach that preserves merged cells, Korean fonts, and government-mandated form layouts. ExcelJS uses Node.js streams (incompatible with Workers). SheetJS community edition has license ambiguity and template-fidelity issues.
- Cloudflare Pages Functions (file-system routing, named exports `onRequestGet` etc.): all 16 new API handlers follow this pattern. No Hono.
- D1 SQLite (migrations 0033–0038): 6 new additive tables covering meal records, cafeteria menus, education records, system settings, legal inspections + issues, and elevator annual schedules.
- TanStack Query: server state for all new pages; 9 new cache key namespaces. No new Zustand stores.
- `date-fns` + `date-fns-tz`: already handles all date arithmetic for Korean legal deadline calculations (Asia/Seoul timezone).

**Dependency changes:**
- Remove: `xlsx-js-style` (unused, saves ~400KB bundle)
- Add: `fflate@^0.8.2` (promotes existing dynamic import to explicit dep)

### Expected Features

**Must have (table stakes — legally required or daily-use blockers):**
- BottomNav/SideMenu restructuring — removes dead "더보기" menu end; adds direct 조치 tab; unblocks all new page navigation entries
- 조치 관리 (remediation tracking) — closed-loop for deficiencies: list/filter/resolve all open check records; migration 0012 schema already complete, zero new DB migration needed
- 법적 점검 관리 (legal inspection management) — 소방시설법 연 2회 statutory obligation, 15-day reporting deadline to fire department
- 승강기 법정검사 관리 (elevator annual inspection) — 승강기 안전관리법 1회/year per elevator (11 elevators, each with distinct expiry date)
- 보수교육 관리 (safety manager continuing education) — 2-year recertification cycle; license revocation risk if missed
- 식사 이용 기록 (meal usage records) — daily canteen check-in for monthly expense settlement
- 관리자 설정 (admin settings) — staff password/title management; role-guard pattern established here for later admin-gated routes
- 점검자 이름 동적 로딩 (dynamic inspector names) — remove hardcoded `STAFF_ROLES` map from DashboardPage.tsx (known anti-pattern at lines 14–19)

**Should have (differentiators):**
- D-day 알림 배너 (legal deadline countdown badges on dashboard) — proactive reminder for 소방 and 승강기 inspection due dates
- streakDays calculation — consecutive daily inspection completion metric (currently hardcoded to 0 with `// TODO` in `dashboard/stats.ts`)
- 대시보드 미조치 카운트 연동 — live unresolved count in SideMenu (currently hardcoded to 2)
- 보수교육 이수증 R2 첨부 — certificate PDF storage mirrors existing R2 upload pattern
- 식당 메뉴표 관리 (text only) — weekly menu management; image upload deferred to v1.2

**Defer to v1.2:**
- Web Push / VAPID notifications (iOS PWA push unreliable; 4-person scope does not justify VAPID infrastructure)
- AI report generation (separate milestone per PROJECT.md)
- Offline PWA inspection mode (explicitly excluded per PROJECT.md — "현재 네트워크 환경 충분")
- Multi-building support (single building by design)
- 법적 점검 지적사항 → 조치관리 통합 (implement each independently in v1.1; `source_type` integration in v1.2 to avoid query complexity)

### Architecture Approach

All v1.1 features integrate into the existing React SPA → Pages Functions → D1/R2 architecture without structural changes. The data flow is unchanged: React component calls `api.ts` (with Bearer token), `_middleware.ts` verifies JWT and sets `ctx.data.staffId/role`, handler queries D1 via prepared statements, returns `{ success, data? }` envelope, TanStack Query caches the response. Excel generation stays 100% client-side. No new Zustand stores. The `authStore` `staff.role` field (already in JWT) is sufficient for all role-based access — no new auth infrastructure needed.

**Key component changes for v1.1:**
1. `src/components/BottomNav.tsx` — replace static 5-item `ITEMS` array with new layout including 조치 tab (replaces 승강기 in nav)
2. `src/App.tsx` — add 5 new routes and update `NO_NAV_PATHS` (add `/meal`, `/education`, `/admin`, `/legal-inspection`; `/remediation` must NOT be in NO_NAV_PATHS)
3. `src/components/SideMenu.tsx` — replace hardcoded `badge: 2` on 미조치 with live count from TanStack Query `['dashboard']` cache; move 승강기 from BottomNav into SideMenu
4. `functions/api/**` — 16 new route handler files following named-export pattern; file paths use `[id].ts` bracket syntax (already established in `[sessionId].ts`)
5. `migrations/0033–0038.sql` — 6 additive migrations; each migration includes indexes on frequently-queried columns in the same file

**New DB migrations summary:**

| Migration | Table(s) | Feature |
|-----------|----------|---------|
| 0033 | `meal_records` | Meal check-in |
| 0034 | `cafeteria_menus` | Weekly menu management |
| 0035 | `education_records` | Training records |
| 0036 | `system_settings` | Admin settings |
| 0037 | `legal_inspections`, `legal_inspection_issues` | Legal inspection management |
| 0038 | `elevator_annual_schedules` | Elevator legal inspection |

No migration needed for: BottomNav restructuring, RemediationPage (schema exists since migration 0012), streakDays, dynamic staff names.

### Critical Pitfalls

1. **504 deployment has two distinct causes — must diagnose before fixing** — Build-time timeout (Cloudflare Pages CI >20-min limit) and runtime timeout (Worker CPU >30s) both surface as 504 but require completely different fixes. Diagnose by running `npm run build && du -sh dist/` and comparing Pages build logs vs. Worker invocation logs. Do not attempt a fix before confirming the cause.

2. **D1 local/remote schema drift** — Never edit a migration file after it has been applied to any environment. If a schema error is found, create a new migration to fix it. Before each phase deploy, run `wrangler d1 migrations list --remote` and `--local` and resolve any discrepancy. D1 has no rollback. This project goes from migration 0032 to 0038 in v1.1.

3. **`NO_NAV_PATHS` in App.tsx must be updated for every new full-screen page** — Forgetting this causes BottomNav to appear where it should not. Four new paths must be added: `/meal`, `/education`, `/admin`, `/legal-inspection`. `/remediation` must explicitly NOT be added (it shows BottomNav with 조치 tab active).

4. **`STAFF_ROLES` hardcode anti-pattern must not spread** — `DashboardPage.tsx` lines 14–19 contain hardcoded staff IDs. Remove when implementing dynamic staff names. Do not replicate in any new component. Use `staff.role` from the JWT/Zustand store or `/api/staff`.

5. **PWA service worker cache poisoning after deploy** — `sw.js` must be served with `Cache-Control: no-cache` via `_headers` file. Without this, the 4 users (who keep the PWA open across shifts) receive broken UI silently after deployments. Add a "new version available, tap to refresh" banner via Workbox `waitingWorker` event.

---

## Implications for Roadmap

Based on the dependency graph confirmed in ARCHITECTURE.md, the build order is constrained at the top (BottomNav → Remediation → cleanup → Admin) and then fans out to 4 parallel independent tracks.

### Phase 1: Foundation — Deployment Fix and Navigation Restructuring
**Rationale:** The known 504 blocks shipping anything. BottomNav restructuring is the zero-migration, zero-API entry point that establishes navigation for all new pages. Both must land together before any feature work is useful. Dependency housekeeping (remove `xlsx-js-style`, add explicit `fflate`) and PWA cache-control fix also belong here to prevent later regressions.
**Delivers:** Working deployment pipeline; restructured BottomNav with 조치 tab; SideMenu reorganization; clean dependency baseline; PWA `_headers` cache-control fix
**Addresses:** 504 deployment fix, BottomNav/SideMenu 재편, dependency housekeeping (STACK Decision 4)
**Avoids:** Pitfall 2 (diagnose 504 cause first, do not guess fix), Pitfall 7 (PWA cache poisoning), Pitfall 5 (binding verification after deploy)
**Research flag:** NONE — run diagnostic sequence first, then apply the appropriate fix

### Phase 2: Remediation Tracking (조치 관리)
**Rationale:** Schema exists since migration 0012. Zero new DB migrations. The `/unresolved` route is already referenced in SideMenu with a hardcoded badge. This closes the most critical v1.0 gap: inspection deficiencies had no resolution workflow. Requires Phase 1 BottomNav 조치 tab.
**Delivers:** RemediationPage listing all open `check_records` with `result IN ('bad','caution')`; filter by date/category/status; inline resolve with memo; live unresolved count replacing SideMenu hardcode
**Addresses:** 조치 관리 전체 (미조치 목록, 조치 등록, 상태 전환, 필터, 대시보드 카운트 연동)
**Avoids:** Pitfall 3 (confirm no migration needed; add backfill check for existing records with null status); Pitfall 6 (no new table, but existing `check_records` query needs index review)
**Research flag:** NONE — schema confirmed, all patterns established

### Phase 3: Tech Debt Removal and Admin Foundation
**Rationale:** streakDays (hardcoded 0) and dynamic staff names (hardcoded map) are low-effort fixes that remove known anti-patterns and establish the `/api/staff` endpoint used by several later features. Admin settings come here because the role-guard pattern (`if (role !== 'admin') return 403`) is established once and reused by all subsequent admin-gated write endpoints.
**Delivers:** Working streakDays dashboard count; `/api/staff` endpoint; `STAFF_ROLES` hardcode removed from DashboardPage; AdminPage with staff CRUD and system settings (migration 0036)
**Addresses:** 점검자 이름 동적 로딩, streakDays 계산, 관리자 설정
**Avoids:** Pitfall 3 (apply migration 0036 with checklist); Pitfall 6 (add `system_settings` key index in same migration)
**Research flag:** NONE — standard CRUD, established patterns

### Phase 4A: Meal Records (식사 이용 기록)
**Rationale:** Independent of Phases 4B–4D. Two new tables (migrations 0033–0034). Straightforward CRUD. Frequently requested by team. Can run in parallel with 4B–4D after Phase 3 admin auth is confirmed working.
**Delivers:** MealPage with personal daily check-in, monthly count per staff, weekly menu text view; admin menu management
**Addresses:** 식사 이용 기록, 식당 메뉴표 관리 (text only; image upload to v1.2)
**Avoids:** Pitfall 3 (migration checklist); Pitfall 6 (unique index `idx_meal_records_unique` on `(staff_id, date, meal_type)` prevents double-booking)
**Research flag:** NONE

### Phase 4B: Education Management (보수교육 관리)
**Rationale:** Independent of 4A/4C/4D. One new table (migration 0035). Legal consequence (license revocation) makes this high priority despite simple CRUD. R2 certificate upload mirrors the existing inspection photo upload pattern exactly.
**Delivers:** EducationPage with per-staff training schedule, completion status, R2 certificate PDF upload; D-30 expiry warning badge on dashboard
**Addresses:** 보수교육 일정 + 이수 기록, 만료 임박 경고, 이수증 R2 첨부
**Avoids:** Pitfall 3 (migration checklist); Pitfall 4 (R2 read as arrayBuffer for certificate downloads)
**Research flag:** NONE

### Phase 4C: Legal Inspection Management (법적 점검 관리)
**Rationale:** Independent of 4A/4B/4D. Two new tables (migration 0037). Highest legal consequence of all new features — 15-day reporting deadline to fire department for deficiency remediation plans. D-day dashboard banner is a high-value differentiator that also directly reduces operational risk.
**Delivers:** LegalInspectionPage with timeline view of past/upcoming 소방 legal inspections, per-inspection deficiency tracker, document upload; D-day countdown badge on dashboard
**Addresses:** 법적 점검 작동기능점검/종합점검 일정 등록, 결과 및 지적사항 기록, 서류 첨부, D-day 배너
**Avoids:** Pitfall 3 (migration checklist); intentionally NOT integrating with 조치관리 `source_type` yet (v1.2 work — per FEATURES.md phase warning)
**Research flag:** NONE — implement issues as standalone list, no cross-table `source_type` integration in this phase

### Phase 4D: Elevator Annual Schedule (승강기 법정검사)
**Rationale:** Independent of 4A/4B/4C. One new table (migration 0038). `ElevatorPage` already has an `annual` tab and `annual_new` modal — extend the existing UI rather than building a new page. 11 elevators with distinct inspection expiry dates; dashboard shows single aggregate badge.
**Delivers:** Extended ElevatorPage annual tab with legal inspection fields (inspector_org, next_due_date, document_key, result); elevator annual schedule records; D-30 expiry badge on dashboard
**Addresses:** 승강기 법정검사 기록, 만료 임박 경고 (승강기 안전관리법 연 1회; 25년+ 기기는 6개월)
**Avoids:** Pitfall 3 (migration checklist); dashboard shows "만료 임박 승강기 N대" single badge — do not show individual elevator alerts on dashboard (detail belongs in ElevatorPage)
**Research flag:** NONE

### Phase Ordering Rationale

- Phase 1 is a hard prerequisite: the 504 blocks all deployments; BottomNav establishes navigation entry points for every new page.
- Phase 2 must follow Phase 1: requires the 조치 BottomNav tab to exist; closes the most impactful v1.0 gap with zero migration cost.
- Phase 3 must follow Phase 2: `/api/staff` endpoint and admin role-guard pattern are reused by Phase 4A–4D features; removes anti-patterns before they can be inadvertently copied.
- Phases 4A–4D are fully independent after Phase 3 and can be planned or executed in parallel. Within the parallel track, Phases 4C and 4D (legal compliance) carry higher regulatory urgency than 4A and 4B.

### Research Flags

Phases needing deeper research during planning: **NONE** — all 8 feature areas are additions to established patterns. Architecture research was derived from direct codebase inspection at migration 0032 (HIGH confidence). No external API integrations, no new runtime dependencies, no novel patterns.

Phases with standard patterns (skip `/gsd:research-phase`):
- **All phases:** Follow existing file-system routing, D1 migration, TanStack Query, and React page patterns already proven in the codebase. The dependency graph and migration schemas are fully specified in ARCHITECTURE.md.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | fflate + XML patching verified by direct inspection of `generateExcel.ts` (504 lines, 4 working report types). ExcelJS/SheetJS alternatives: MEDIUM (runtime compat may have changed since Aug 2025 knowledge cutoff — verify before any future Excel library change). |
| Features | HIGH | Korean legal requirements verified against law.go.kr, kfsi.or.kr, keso.kr (MEDIUM-HIGH for regulatory specifics). PROJECT.md requirements are primary source (HIGH). 8 feature areas fully specified. |
| Architecture | HIGH | All integration points confirmed from actual source files: migrations 0001–0032, all pages, all functions, App.tsx routing, BottomNav.tsx, SideMenu.tsx. Migration schemas and API route lists derived from direct inspection. |
| Pitfalls | MEDIUM | Runtime behavior (D1 local vs. remote, Workers CPU limits, R2 binary handling, Workbox PWA) based on training knowledge through Aug 2025. No live documentation verification available. Flag specific Cloudflare limits for spot-check before Phase 1 execution. |

**Overall confidence:** HIGH

### Gaps to Address

- **504 exact cause unconfirmed**: STACK.md Decision 4 documents a diagnostic sequence (`npm run build && du -sh dist/`, build logs vs. Worker invocation logs) but the fix cannot be prescribed without running it. Phase 1 must begin with diagnosis, not a fix attempt.
- **fflate version**: Last confirmed stable branch is 0.8.x as of Aug 2025. Verify current version at https://www.npmjs.com/package/fflate before pinning in Phase 1.
- **D1 remote migration state**: Current local migration count is 0032. Remote state is not verified. Phase 1 checklist must include `wrangler d1 migrations list --remote` before any migration is applied.
- **법적 점검 지적사항 → 조치관리 통합**: Explicitly deferred to v1.2. Phase 4C implements legal inspection issues as a standalone list. The `source_type` field integration that would unify daily-inspection deficiencies with legal-inspection deficiencies adds query complexity that is not justified for a 4-person team in v1.1.
- **ExcelJS/SheetJS Workers compat (future reference)**: MEDIUM confidence. If a future milestone requires server-side Excel generation, re-verify against current docs at https://github.com/exceljs/exceljs and https://docs.sheetjs.com/docs/getting-started/platforms/cloudflare before committing.

---

## Sources

### Primary (HIGH confidence)
- `/Users/jykevin/Documents/20260328/cha-bio-safety/src/` — direct codebase inspection (all pages, components, utils, types)
- `/Users/jykevin/Documents/20260328/cha-bio-safety/functions/` — all API handlers and middleware
- `/Users/jykevin/Documents/20260328/cha-bio-safety/migrations/0001–0032.sql` — complete D1 schema
- `/Users/jykevin/Documents/20260328/.planning/PROJECT.md` — v1.1 requirements (primary source)
- law.go.kr 승강기 안전관리법 — elevator inspection interval (연 1회; 25년+ 기기 6개월)
- keso.kr / koelsa.or.kr — elevator inspection agency confirmation
- kfsi.or.kr — fire safety manager education cycle (최초 6개월 이내 + 2년 주기)

### Secondary (MEDIUM confidence)
- easylaw.go.kr — 소방시설 자체점검 의무 (연 2회, 15일 보고 기한)
- 119.busan.go.kr — 자체점검 결과보고서 서식 공지
- Cloudflare Workers runtime limits and D1 migration behavior (training knowledge Aug 2025) — verify at https://developers.cloudflare.com/workers/platform/limits/ and https://developers.cloudflare.com/d1/reference/migrations/
- Workbox service worker update patterns (training knowledge Aug 2025) — verify with current vite-plugin-pwa docs

### Tertiary (LOW confidence, needs validation)
- SheetJS Cloudflare Workers compatibility — verify current recommended import path at https://docs.sheetjs.com/docs/getting-started/platforms/cloudflare before any future Excel library change
- Korea Public Data Portal (data.go.kr) elevator API — confirmed out of scope; returns aggregate national data, not per-building records

---

*Research completed: 2026-03-31*
*Ready for roadmap: yes*
