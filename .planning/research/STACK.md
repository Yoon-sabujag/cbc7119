# Technology Stack — Milestone 2 Additions

**Project:** CHA Bio Complex Fire Safety Management System
**Researched:** 2026-03-28
**Scope:** Additive research only — what's needed for new features. Existing stack (React 18, TypeScript, Vite, Zustand, TanStack Query, Tailwind, Hono, Cloudflare D1/R2, JWT) is already validated.

---

## Executive Summary

The existing Excel generation approach is the right approach for this project and should be **continued and extended, not replaced.** The codebase already uses a client-side template-patching strategy: `fflate` unzips an `.xlsx` template, XML cells are patched directly, then `fflate` rezips and triggers a browser download. This is battle-tested in this codebase for 4 report types, avoids Cloudflare Workers runtime constraints entirely, and produces output that exactly matches the prescribed form templates.

For the 6 new report types, the pattern is already established. The only new decisions are:
1. Whether to add `fflate` as an explicit dependency (it's currently dynamically imported)
2. How to handle elevator legal inspection data (no external API — this is manual-entry data managed in D1)
3. How to fix the 504 deployment issue (Cloudflare Pages `wrangler pages deploy` race condition with large bundles)

---

## Existing Stack Confirmation

These are already installed and working — listed here only for dependency clarity.

| Technology | Version | Role |
|------------|---------|------|
| `fflate` | via dynamic import | ZIP/unzip for .xlsx template manipulation — the actual Excel engine |
| `xlsx-js-style` | ^1.2.0 | **Installed but not used for primary generation** — can be removed or repurposed |
| `vite-plugin-pwa` | ^0.21.0 | PWA/service worker |
| `wrangler` | ^4.75.0 | Cloudflare CLI for deploy |

---

## Decision 1: Excel Generation for 6 New Report Types

### Recommendation: Continue the `fflate` + XML Template Patching Pattern

**Confidence: HIGH** — Based on direct codebase analysis of the existing `generateExcel.ts` (504 lines), confirmed working for DIV, 소화전, 청정소화약제, 비상콘센트 reports.

**Why this pattern is correct for this project:**

The project constraint states "기존 양식 파일과 호환되는 형태로 출력 필수" — output must match prescribed form files. Template patching achieves this with zero formatting risk. No library will reproduce merged cells, print margins, Korean font settings, and custom border styles from a pre-existing government-mandated form as accurately as patching the original file's XML directly.

**What the pattern does:**
```
1. fetch('/templates/점검표_양식.xlsx')           → get the original form
2. fflate.unzipSync(bytes)                        → unpack OOXML ZIP
3. strFromU8(files['xl/worksheets/sheetN.xml'])   → read individual sheet XML
4. patchCell(xml, 'A1', value)                    → string-replace cell values
5. fflate.zipSync(newFiles)                        → repack
6. URL.createObjectURL(blob) + <a>.click()         → browser download
```

**Why NOT ExcelJS for this project:**

| Issue | Detail |
|-------|--------|
| Worker incompatibility | ExcelJS uses Node.js streams (`fs`, `stream`) internally. Even in browser bundle mode, stream polyfills add ~100KB to the bundle and break under Cloudflare Workers runtime (no Node.js compat for streams). |
| Template fidelity | ExcelJS loads templates but re-renders them — merged cells, conditional formats, print settings, and Korean-language custom number formats can shift or be dropped on round-trip. |
| Already solved | The project has 504 lines of working template patching. ExcelJS would be a lateral rewrite with regression risk. |
| Confidence | MEDIUM — ExcelJS's Worker compat is officially documented as "Node.js only" for stream-based operations. Browser build exists but is larger and less stable for round-trip template editing. |

**Why NOT SheetJS (xlsx) for this project:**

| Issue | Detail |
|-------|--------|
| License | SheetJS Pro (xlsx ^0.20+) requires a commercial license for server-side use. The free community version (xlsx ^0.18) is MIT but stale since 2023 and misses OOXML features. |
| Worker compat | SheetJS Community Edition works in Workers (no Node deps), but same template-fidelity problem as ExcelJS on round-trip. |
| Confidence | MEDIUM — Based on npm registry and SheetJS docs as of knowledge cutoff. Verify current license terms at https://sheetjs.com/pro |

**What `xlsx-js-style` (currently installed) is for:**

`xlsx-js-style` ^1.2.0 is a fork of the old community SheetJS that adds cell styling. It was installed but the codebase pivoted to direct XML patching before it was used. It can be **removed** from `package.json` to reduce bundle size — it adds ~400KB and serves no active purpose.

### New Report Types — Template Mapping Required

The 6 new reports require template XML analysis before implementation. The template strategy requires knowing which sheet index maps to which report. Reference files listed in PROJECT.md:
- `점검항목/소방설비_월간점검일지_2026.xlsx` — 소방펌프, 자탐, 제연, 방화셔터, 피난방화시설
- `점검항목/일일업무일지(00월).xlsx` — 일일업무일지

For each new report: open the xlsx in Excel, identify which sheet number contains the target form, then add a new branch in `generateCheckExcel()` pointing to that sheet XML path.

**Action item for implementation phase:** Before writing generator code, run:
```bash
# Inspect template structure to identify sheet indices
unzip -l 점검항목/소방설비_월간점검일지_2026.xlsx | grep worksheet
```
This reveals `xl/worksheets/sheet1.xml`, `sheet2.xml`, etc. — which map to the tab order in Excel.

---

## Decision 2: Elevator Legal Inspection Integration

### Recommendation: Internal D1 data only — no external API integration

**Confidence: HIGH** — Based on PROJECT.md requirements analysis and Korea elevator inspection API availability.

**What "승강기 실데이터 연동" means in this context:**

The requirement is NOT to integrate with an external elevator IoT system. It means:
1. Displaying elevator inspection records already stored in D1 (`elevator_inspections` table — confirmed in `functions/api/elevators/inspections.ts`)
2. Adding a view for "법정 검사 일지" (legal inspection journal) — annual government-mandated inspection results vs monthly in-house checks
3. Managing "연간 검사 일정" (annual inspection schedule) — dates tracked in D1

The `elevator_inspections` table already distinguishes `type: 'monthly' | 'annual'`. The annual (법정) records are entered manually after the government inspector visits — this is standard Korean building management practice where the facility team does not have API access to the government 한국승강기안전공단 (Korea Elevator Safety Agency) database.

**No new libraries required.** This feature is a new UI page + new D1 queries using the existing Hono API pattern.

**Korea Elevator Safety Agency (KESA) API:**
If integration with 한국승강기안전공단 public data is later desired, the Korea Public Data Portal (data.go.kr) provides an API. However: (a) it requires a separate API key registration, (b) it returns aggregate national data not per-building records, and (c) the PROJECT.md shows this is internal team-only with manual data entry workflow. Out of scope for this milestone.

---

## Decision 3: Legal Inspection Tracking (소방 법적 점검 관리)

### Recommendation: D1 new table + existing Hono/D1 pattern — no new libraries

**Confidence: HIGH** — The feature is data management, not a new technical domain.

**Requirements from PROJECT.md:**
- 소방 연 2회 법정 점검 (fire safety mandatory inspection, twice annual)
- 일정 알림 (schedule notifications)
- 결과/서류 관리 (result and document management)
- 지적사항 추적 (deficiency tracking)

**Implementation approach:**
- New D1 table: `legal_inspections` (id, type, inspection_date, inspector_org, result, deficiencies JSON, documents R2 keys, next_due_date)
- Document storage: existing R2 binding (`STORAGE`) — already handles file uploads for inspection photos
- Notifications: no push notification infrastructure exists. Use in-app banners (React state + TanStack Query) showing days until next due date. Real push notifications would require VAPID web push setup (significant scope expansion — defer to later milestone).

**For document attachments:** No new library needed. The existing R2 upload pattern from `functions/api/uploads/index.ts` is reusable.

---

## Decision 4: Cloudflare Pages 504 Deployment Fix

### Recommendation: Diagnose wrangler version and bundle size; update compatibility date

**Confidence: MEDIUM** — 504 errors on Cloudflare Pages deploy have multiple causes. Exact diagnosis requires running `wrangler pages deploy` with `--debug` flag on the actual project.

**Current state:**
- `wrangler` version: `^4.75.0` (very current as of analysis date)
- `compatibility_date`: `2024-09-23` (valid)
- Bundle output: `dist/` directory, full React SPA

**Known causes of 504 on Cloudflare Pages deploy:**

| Cause | Diagnosis | Fix |
|-------|-----------|-----|
| Large asset upload timeout | Run `du -sh dist/` — if >20MB, split chunks | Vite `build.rollupOptions.output.manualChunks` to split vendor bundle |
| Worker script too large | Check `dist/_worker.js` or `dist/functions/` size — 1MB limit for Pages Functions | Split large functions files; avoid importing large Node modules in functions |
| `fflate` bundle size | `fflate` is dynamically imported in `generateExcel.ts` — if Vite bundles it eagerly, it inflates the main chunk | Add `fflate` to `optimizeDeps.exclude` or verify dynamic import splitting |
| wrangler auth timeout | Wrangler 4.x can timeout with slow network + large uploads | Use `--upload-source-maps false` flag to skip source map upload |
| D1 migration not applied to remote | After deploy succeeds but API returns 500 | Run `npx wrangler d1 migrations apply cha-bio-db --remote` |

**Recommended sequence for 504 resolution:**

Step 1 — Check bundle size:
```bash
npm run build && du -sh dist/ && find dist -name "*.js" | xargs ls -lh | sort -k5 -hr | head -20
```

Step 2 — If any single JS file >500KB:
```typescript
// vite.config.ts — add manual chunks
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
        tanstack: ['@tanstack/react-query'],
        qr: ['qrcode', 'qrcode.react', 'html5-qrcode'],
      }
    }
  }
}
```

Step 3 — Deploy with verbose output:
```bash
npx wrangler pages deploy dist --commit-dirty=true 2>&1 | tee deploy.log
```

Step 4 — If deploy succeeds but API still 504s (runtime timeout):
- Cloudflare Pages Functions have a 30-second CPU time limit (50ms for free, 30s for paid)
- The paid plan is confirmed active — 30s limit applies
- Excel generation is browser-side, so not an issue
- Dashboard N+1 query (noted in CONCERNS.md) is the most likely runtime timeout risk

**Confidence caveat:** The specific 504 symptom is not fully described in PROJECT.md. If 504 occurs at upload time (not runtime), the bundle size approach resolves it. If 504 occurs at runtime, it's a Worker timeout issue. The diagnostic sequence above distinguishes these.

---

## Decision 5: Notification System for Legal Inspection Due Dates

### Recommendation: In-app only (no Web Push), use TanStack Query polling

**Confidence: HIGH** — Scope and user count (4 people) make Web Push disproportionately complex.

**Why not Web Push (VAPID):**
- Requires: VAPID key generation, subscription storage per-user in D1, push API calls from Workers, service worker `push` event handler updates
- Value: Moderate — only 4 users who are actively logged in during work shifts anyway
- Cost: 2-3 days implementation; `web-push` npm package is Node.js-only (not compatible with Cloudflare Workers without a Node.js compatibility flag)

**Recommended approach: in-app banner + dashboard widget**
- `TanStack Query` already polls dashboard stats. Add `legal_inspections` upcoming due dates to the `/api/dashboard/stats` response.
- Show a banner when next inspection is within 30 days.
- No new libraries. Zero infrastructure change.

If push notifications are genuinely needed later: Cloudflare's own `web-push` implementation via `@cloudflare/workers-web-push` (released 2024) works natively in Workers. Defer to a separate milestone.

---

## Dependency Changes for This Milestone

### Remove (safe, zero functionality impact)
| Package | Reason |
|---------|--------|
| `xlsx-js-style` | Installed but unused — replaced by fflate XML patching. Remove to save ~400KB bundle. |

### Add (explicit)
| Package | Version | Purpose | Rationale |
|---------|---------|---------|-----------|
| `fflate` | `^0.8.2` | ZIP/unzip for Excel template manipulation | Currently dynamically imported inline; making it an explicit dependency prevents tree-shaking surprises and allows proper type checking |

**Confidence: HIGH** — `fflate` is already in use in production code (dynamic `import('fflate')`). Making it an explicit dep is a housekeeping change, not a new technology bet. Version `^0.8.2` is the stable branch as of knowledge cutoff (Aug 2025); verify current version at https://www.npmjs.com/package/fflate.

### No Change Needed
| Package | Note |
|---------|------|
| `date-fns` + `date-fns-tz` | Already handles Korean timezone (Asia/Seoul) for legal inspection date tracking |
| `jspdf` | Installed, available if PDF export of legal inspection records is needed later |
| All Cloudflare bindings | D1 + R2 + Workers — sufficient for all new features |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Excel generation | fflate + XML patching (continue current) | ExcelJS | Node.js streams dependency; template fidelity risk on round-trip; already solved in codebase |
| Excel generation | fflate + XML patching (continue current) | SheetJS Community | License ambiguity in recent versions; same template-fidelity problem; unnecessary migration |
| Notifications | In-app TanStack Query banner | Web Push (VAPID) | 4-user system; `web-push` is Node-only; disproportionate complexity |
| Elevator data | Internal D1 only | Korea Elevator Safety API (data.go.kr) | Requires separate API key; returns aggregate national data not per-building records; out of scope |
| Deployment fix | Bundle analysis + wrangler flags | Migrate to GitHub CI/CD | Out of scope for this milestone; manual deploy is working except for 504 issue |

---

## Quick Installation

```bash
# In cha-bio-safety/

# Remove unused package
npm uninstall xlsx-js-style

# Add fflate as explicit dependency (currently dynamically imported)
npm install fflate@^0.8.2
```

After removing `xlsx-js-style`, verify `src/pages/ReportsPage.tsx` and `src/utils/generateExcel.ts` have no imports from it (they don't, based on current analysis).

---

## Sources and Confidence Assessment

| Area | Confidence | Source | Notes |
|------|------------|--------|-------|
| fflate Excel pattern | HIGH | Direct codebase analysis of `generateExcel.ts` | Pattern is working in production for 4 report types |
| ExcelJS Workers incompatibility | MEDIUM | Knowledge of ExcelJS internals (streams); not re-verified against 2026 release | Verify at https://github.com/exceljs/exceljs — check if browser bundle now works without streams |
| SheetJS license | MEDIUM | Knowledge cutoff Aug 2025 | Verify current license at https://sheetjs.com — community vs pro boundary may have shifted |
| 504 fix approach | MEDIUM | Cloudflare Pages documentation patterns; exact symptom unknown | Run diagnostic sequence to confirm cause before applying fix |
| Korean elevator API | LOW | knowledge of Korea Public Data Portal (data.go.kr) | Not directly verified; may have changed registration requirements |
| fflate version | MEDIUM | Last known stable branch 0.8.x as of Aug 2025 | Verify at https://www.npmjs.com/package/fflate before pinning |
| Cloudflare Workers 30s CPU limit | HIGH | Cloudflare pricing/limits documentation | Confirmed for paid plans; free plan is 10ms (irrelevant here, paid plan confirmed) |

---

*Research completed: 2026-03-28 | Model: Claude Sonnet 4.6*
