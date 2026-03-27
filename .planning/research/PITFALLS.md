# Domain Pitfalls

**Domain:** Cloudflare Pages + D1 + Workers PWA (Fire Safety Facility Management)
**Researched:** 2026-03-28
**Confidence:** MEDIUM — based on training knowledge through Aug 2025 + project-specific context. No live docs verification possible (network tools unavailable). Flag for validation before phase execution.

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or deployment failures.

---

### Pitfall 1: Excel Generation Using Node.js Libraries in Workers (Edge Runtime Incompatibility)

**What goes wrong:** Popular Excel libraries (`exceljs`, `xlsx`/`SheetJS` community fork, `xlsx-populate`) rely on Node.js built-ins (`Buffer`, `fs`, `stream`, `zlib`) or large WASM bundles that exceed Cloudflare Workers' 1 MB compressed script size limit or fail at runtime due to missing Node.js APIs.

**Why it happens:** Developers `npm install exceljs` locally, it works in development (Node.js environment), but Cloudflare Workers run the V8 isolate with a restricted subset of Node.js compatibility. Even with `nodejs_compat` flag enabled, stream-heavy or fs-dependent code fails. `exceljs` specifically uses `JSZip` with Node.js streams internally.

**Consequences:**
- Worker throws `ReferenceError: Buffer is not defined` or `TypeError: Cannot read property 'createReadStream'` at runtime
- The 1 MB compressed script limit causes build-time rejection if WASM is bundled
- Template-copy Excel generation (this project's approach) fails silently if the template `.xlsx` in R2 can't be read as a binary buffer properly

**Prevention:**
- Use `SheetJS` (the `xlsx` package from SheetJS.com, NOT the abandoned community fork) — it has an explicit `"cloudflare-workers"` build target. Import as `import * as XLSX from 'xlsx/xlsx.mjs'` for ESM Workers compatibility.
- Alternatively, generate OOXML XML directly and construct the `.xlsx` ZIP manually using the `fflate` library (pure JS, no Node deps, ~70KB). This is the most reliable edge-compatible approach.
- If the project uses template `.xlsx` files from R2 (current approach per PROJECT.md), test the R2 `get()` → `arrayBuffer()` → SheetJS parse pipeline explicitly in a Worker before building Excel logic on top of it.
- Set `nodejs_compat = true` in `wrangler.toml` as a safety net, but do not rely on it for heavy Node.js APIs.

**Detection (warning signs):**
- `npm run build` succeeds but Worker returns 500 on Excel endpoints
- `wrangler deploy` warning: "script size exceeds..."
- Local `wrangler dev` works but production fails (Node.js vs V8 isolate difference)

**Phase mapping:** Address in the phase that adds the 6 new Excel report types. Do NOT assume the existing 4-type Excel implementation works correctly in production until explicitly tested end-to-end on the deployed Worker.

---

### Pitfall 2: Cloudflare Pages 504 on Deployment — Build Timeout vs. Function Timeout Conflation

**What goes wrong:** The project already has known 504 deployment errors. There are two distinct 504 sources that are commonly confused:
1. **Build-time 504:** Cloudflare Pages build runner times out (20-minute hard limit). Triggered by large `node_modules`, slow TypeScript compilation, or Vite build steps that hit the limit.
2. **Runtime 504:** A Pages Function (Worker) takes longer than the 30-second CPU time limit or the 30-second wall-clock limit per request.

**Why it happens:** Both surface as "504" but require completely different fixes. Mixing up the cause leads to wasted debugging — e.g., optimizing the build when the actual issue is a D1 query without an index running at deploy-verification time.

**Consequences:**
- Deployment appears stuck or fails with generic 504 with no actionable error message in the dashboard
- D1 migration verification queries running during CI/CD can time out if migrations are large
- Vite SSG/prerender steps (if any) added to build can push over 20 minutes

**Prevention:**
- In Wrangler dashboard, distinguish build logs (Pages CI) from Function invocation logs (Workers Logs). They are in different UI tabs.
- Keep the Vite build lean: `vite build` should complete in under 5 minutes. Remove any `vite-plugin-pwa` precaching of large assets if build time grows.
- D1 migrations should never run automatically during the Pages build step — run them explicitly via `wrangler d1 migrations apply --remote` as a separate manual or CI step.
- Add explicit CPU time profiling to any Worker that loops over D1 results (e.g., generating a multi-sheet Excel report with hundreds of inspection records).

**Detection:**
- Build log ends abruptly at the 20-minute mark → build timeout
- Build succeeds, but the deployment verification request returns 504 → runtime timeout
- Worker logs show `Error: Script exceeded CPU time limit`

**Phase mapping:** Must be resolved before any new feature deployment. The 504 fix phase should explicitly diagnose which of the two causes is in play before attempting a fix.

---

### Pitfall 3: D1 Local vs. Production Schema Drift (Migration Mismatch)

**What goes wrong:** `wrangler d1 migrations apply` against `--local` and `--remote` can diverge. This project is at migration 0023. Common scenarios:
1. A migration was applied locally but never applied remotely (or vice versa)
2. A migration SQL file was edited after being applied locally, so remote applies the new version but local has the old schema
3. The `_cf_KV` internal migration tracking table gets out of sync between environments

**Why it happens:** D1's migration tracking stores applied migration filenames in an internal table. If a migration file is renamed or modified after apply, D1 won't re-apply it (same filename = already done), leaving the schema inconsistent. Developers editing migration files post-apply is the #1 cause.

**Consequences:**
- Production queries fail with `no such column` or `no such table` errors
- Data inserted locally cannot be queried in production due to schema column differences
- Rollback is manual — D1 has no built-in rollback command as of mid-2025

**Prevention:**
- **Never edit a migration file after it has been applied to any environment.** If a mistake is found, create a new migration (0024, 0025...) to correct it.
- Before deploying any phase, run `wrangler d1 migrations list --remote` and `wrangler d1 migrations list --local` and compare output. Any discrepancy must be resolved before code deploy.
- Keep a `db/schema-snapshot.sql` that is regenerated after each migration batch via `wrangler d1 execute --command ".schema" --remote > db/schema-snapshot.sql`. Diff it against local schema after each migration.
- For new migrations in this milestone, test against a separate `--local` DB clone before applying to production.

**Detection:**
- Production returns `SQLiteError: no such column: [column_name]` on a code path that works locally
- `wrangler d1 migrations list` shows different counts for local vs remote
- D1 dashboard shows applied_at timestamps that don't match expectations

**Phase mapping:** Every phase that adds D1 migrations must include an explicit migration validation step: apply to local, test locally, then apply to remote, then smoke-test in production. Never bundle migration apply with code deploy in the same step.

---

### Pitfall 4: R2 Binary Template Read Corruption for Excel Generation

**What goes wrong:** The project uses an Excel template-copy approach (per PROJECT.md: `점검항목/소방설비_월간점검일지_2026.xlsx` etc. as reference). If these `.xlsx` template files are stored in R2 and read back in a Worker, binary corruption can occur when the response body is not read as `arrayBuffer()` but accidentally as `text()` or `json()`.

**Why it happens:** Workers' `R2ObjectBody` must be consumed correctly. `await r2Object.text()` will mangle binary data. A common mistake is copy-pasting fetch response handling code that uses `.text()` or `.json()` for the R2 object body.

**Consequences:**
- SheetJS or fflate receives corrupted ZIP data → throws `Error: invalid signature` or produces a silently malformed `.xlsx`
- The generated file opens in Excel showing garbage or triggers Excel's "file is corrupt" repair dialog
- The issue is non-obvious because the Worker returns HTTP 200 with a file, it just won't open correctly

**Prevention:**
- Always: `const arrayBuffer = await r2Object.arrayBuffer()` then pass to `XLSX.read(arrayBuffer, { type: 'array' })`
- Add a checksum (MD5/CRC) verification step when uploading templates to R2 and when reading them back
- Consider embedding small templates as base64 constants in the Worker code instead of R2 reads, if templates are under ~200KB. This eliminates the R2 read failure mode entirely.

**Detection:**
- Generated `.xlsx` file size is unexpectedly small (text encoding is shorter than binary)
- Excel opens the file and shows "We found a problem with some content..."
- SheetJS throws on parse: `CFB: invalid signature`

**Phase mapping:** Excel report generation phases. Must be caught in integration testing before the phase is considered complete.

---

## Moderate Pitfalls

---

### Pitfall 5: Cloudflare Pages Functions — `wrangler.toml` Binding Scope Confusion

**What goes wrong:** D1 and R2 bindings declared in `wrangler.toml` for a Pages project must be under `[[d1_databases]]` and `[[r2_buckets]]` sections (not `[vars]`). A common mistake is declaring them at the wrong level or using the wrong binding name, causing `env.DB` to be `undefined` in the Worker function.

**Why it happens:** The Pages Functions wrangler config syntax differs slightly from a standalone Worker's `wrangler.toml`. The binding name in `wrangler.toml` must exactly match the property accessed in `env` (case-sensitive). Documentation examples sometimes differ between Pages Functions and standalone Workers.

**Consequences:**
- `TypeError: Cannot read properties of undefined (reading 'prepare')` at runtime
- Works in `wrangler dev` (local emulation may be more forgiving) but fails in production
- No build-time error — fails silently until the bound resource is accessed

**Prevention:**
- After any `wrangler.toml` change, explicitly log `console.log(Object.keys(env))` in a test endpoint to verify all bindings are present in production.
- Use TypeScript types: declare `interface Env { DB: D1Database; BUCKET: R2Bucket; }` and let type errors surface missing bindings at compile time.

**Detection:**
- Worker logs: `TypeError: env.DB is undefined` or similar
- Local dev works, production fails

**Phase mapping:** Deployment pipeline phase. Verify binding names as part of the deployment checklist.

---

### Pitfall 6: D1 Query Performance — Missing Indexes on Inspection Record Tables

**What goes wrong:** The inspection record tables (소방 점검 기록, DIV 압력 측정 등) will grow over time. D1 is SQLite under the hood — full table scans on unindexed columns are fine at 100 rows but become slow at 10,000+ rows. Workers have a 30-second wall-clock and 50ms CPU time limit (free) or 30 seconds (paid Bundled), so slow queries cause 504s.

**Why it happens:** SQLite performance issues are invisible during development with a small dataset. The project has 4 users recording daily inspections across 13 categories — a year of data could easily reach tens of thousands of rows.

**Consequences:**
- Excel report generation queries (which aggregate across date ranges) time out for annual reports
- Dashboard load times increase over months
- No error at low data volume — problem surfaces gradually in production

**Prevention:**
- Add indexes on: `inspection_records(checked_at)`, `inspection_records(category_id)`, `schedule(date)`, any foreign key columns that are queried with `WHERE`.
- Use `EXPLAIN QUERY PLAN` in D1 execute commands during development to verify index usage.
- For annual Excel reports, use date-range parameters and `LIMIT`/pagination rather than fetching all records at once.

**Detection:**
- Workers logs show increasing response times on report endpoints over weeks
- `EXPLAIN QUERY PLAN` shows `SCAN TABLE` instead of `SEARCH TABLE USING INDEX`

**Phase mapping:** Any migration phase adding inspection record tables, and the Excel report generation phase.

---

### Pitfall 7: PWA Service Worker Cache Poisoning After Deployment

**What goes wrong:** When a new version is deployed to Cloudflare Pages, existing users' PWA service workers may serve stale assets for hours or days. If an API response format changes between versions but the old UI is still cached, users see broken behavior with no error message.

**Why it happens:** Vite PWA plugin (Workbox) generates asset manifests with content hashes, but the service worker itself (`sw.js`) may be cached by the browser. If `Cache-Control: max-age` is too high on `sw.js`, browsers won't detect the update. Cloudflare Pages sets `Cache-Control: no-cache` on HTML by default but not always on the service worker file.

**Consequences:**
- User sees a broken UI after deployment, no clear error
- JWT token format changes or API schema changes silently break the cached UI
- Only affects users who have installed the PWA — fresh browser loads work fine

**Prevention:**
- Ensure `sw.js` is served with `Cache-Control: no-cache` — verify in Cloudflare Pages headers configuration (`_headers` file).
- Add a version bump mechanism: include a `__BUILD_TIMESTAMP__` in the Vite build and use it in the service worker cache name so cache busting is automatic.
- Implement a "new version available, tap to refresh" banner using Workbox's `waitingWorker` event — especially important for 4 users who might keep the PWA open all day.

**Detection:**
- User reports UI behaves oddly after a known deployment
- DevTools → Application → Service Workers shows "waiting to activate" state
- Network tab shows API calls returning 404 or unexpected response shapes

**Phase mapping:** Deployment pipeline phase. The `_headers` file and PWA update notification should be validated before any production deployment.

---

### Pitfall 8: Hono on Cloudflare Pages Functions — Route Mounting Path Mismatch

**What goes wrong:** Hono is used as the API framework (per PROJECT.md). When Hono is mounted in a Cloudflare Pages Functions file (e.g., `functions/api/[[path]].ts`), the base path must be set correctly: `app.basePath('/api')` or the catch-all route handler must strip the `/api` prefix. A mismatch causes all API routes to return 404.

**Why it happens:** Pages Functions catch-all routes (`[[path]]`) include the full path from the URL. If Hono's router doesn't account for the `/api` prefix, no routes match.

**Consequences:**
- All API endpoints return 404 in production (works locally because `wrangler dev` may handle path differently)
- Very confusing to debug because the function IS being invoked, just no routes match

**Prevention:**
- Use `app.basePath('/api')` in Hono and mount routes as `app.get('/records', ...)` (not `app.get('/api/records', ...)`)
- Or use Hono's `handle` export with the raw request and let the function file handle path stripping
- Verify the exact URL structure in a smoke test: hit `/api/health` after every deployment

**Detection:**
- All API calls return `{"error":"Not Found"}` from Hono's default 404 handler
- `wrangler dev` works, production returns 404

**Phase mapping:** Deployment pipeline fix phase. Add `/api/health` smoke test to deployment checklist.

---

## Minor Pitfalls

---

### Pitfall 9: D1 `--local` Uses SQLite WAL Mode, Production Uses Durable Objects Backed SQLite

**What goes wrong:** Subtle behavioral differences between local D1 (plain SQLite WAL file) and production D1 (Cloudflare's distributed SQLite). Specifically: local D1 supports `PRAGMA` statements, certain SQLite extensions, and has different transaction isolation semantics. Code that uses `PRAGMA foreign_keys = ON` locally may not have that setting in production.

**Prevention:** Never rely on PRAGMA settings in application code. Enforce constraints in the schema (NOT NULL, UNIQUE, FK constraints must be declared in the CREATE TABLE, not set via PRAGMA). Test any schema constraint relying on FK enforcement explicitly against the remote D1 instance.

**Phase mapping:** Any migration phase.

---

### Pitfall 10: Excel Column Width / Cell Style Loss When Using SheetJS Community Edition

**What goes wrong:** SheetJS CE (open source) does not support writing cell styles, column widths, or merged cells to `.xlsx` output. The Pro version does. If the existing 4 Excel report types were built with a styling workaround (e.g., raw XML manipulation), the same approach must be used for the 6 new report types — inconsistent approaches across Excel types create maintenance debt.

**Prevention:** Decide on a single Excel generation strategy for all 10 report types. If the existing 4 use raw OOXML XML building (the only reliable edge-compatible styled approach), document that pattern and use it for all 6 new types. Do not introduce a second approach mid-project.

**Detection:** Generated Excel files open without styles (all cells default width, no merged cells, no bold headers) despite the template having them.

**Phase mapping:** Excel report generation phase for the 6 new types.

---

### Pitfall 11: Cloudflare Pages Preview Deployments Sharing Production D1

**What goes wrong:** By default, Cloudflare Pages preview deployments (non-production branches) use the same D1 database bindings as production if the binding is set in the Pages project settings. Running integration tests or seeding test data on a preview URL can corrupt production data.

**Prevention:** In Pages project settings, set preview environment D1 bindings to a separate `d1-dev` database. Only the `production` environment binding points to the live D1. Document this explicitly in the deployment runbook.

**Detection:** Test data appears in the production dashboard. Inspection records created during testing show up for real users.

**Phase mapping:** Deployment pipeline phase.

---

### Pitfall 12: JWT Secret Rotation Without Active Session Invalidation

**What goes wrong:** The project uses JWT authentication (per PROJECT.md). If the JWT secret stored as a Cloudflare Worker environment variable is rotated (e.g., after a suspected compromise), all existing tokens become invalid immediately. For 4 users on 3-shift rotations, an unexpected logout in the middle of a night shift causes lost work and confusion.

**Prevention:** Store token expiry in the JWT payload (short-lived: 8 hours max, matching a shift). Implement a graceful re-auth flow in the PWA: if a 401 is received, show a login overlay rather than navigating away from the current form (inspection data in progress would be lost if the user is redirected away).

**Detection:** All users simultaneously log out after a Worker redeployment that changed `JWT_SECRET`.

**Phase mapping:** Deployment pipeline phase / auth hardening.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| 504 deployment fix | Build timeout vs. runtime timeout conflation (Pitfall 2) | Check build logs vs. Worker invocation logs separately before any fix attempt |
| 6 new Excel report types | Edge runtime library incompatibility (Pitfall 1) | Validate SheetJS or fflate works in Worker before writing business logic |
| 6 new Excel report types | R2 template binary read corruption (Pitfall 4) | Always use `.arrayBuffer()`, add a test for each template file |
| 6 new Excel report types | SheetJS CE style limitations (Pitfall 10) | Standardize on one approach for all 10 Excel types |
| D1 migrations (0024+) | Local vs. remote schema drift (Pitfall 3) | Run migration list diff before every deploy |
| D1 migrations (0024+) | PRAGMA / FK behavior differences (Pitfall 9) | Declare all constraints in schema DDL, not PRAGMA |
| D1 migrations (0024+) | Missing indexes on growing tables (Pitfall 6) | Add indexes in the same migration that creates the table |
| Deployment pipeline | D1 and R2 binding misconfiguration (Pitfall 5) | Verify bindings via log endpoint after each deploy |
| Deployment pipeline | Preview deployment sharing production D1 (Pitfall 11) | Separate dev/prod D1 bindings in Pages settings |
| Deployment pipeline | PWA cache poisoning on update (Pitfall 7) | Configure `_headers` for `sw.js`, add update notification UI |
| Deployment pipeline | Hono route path mismatch (Pitfall 8) | Add `/api/health` smoke test to deployment checklist |
| Auth / long-running sessions | JWT secret rotation breaking active shifts (Pitfall 12) | Short-lived tokens + graceful 401 overlay in PWA |

---

## Sources

- **Confidence: MEDIUM** — Training knowledge through Aug 2025. Cloudflare Workers/D1/Pages runtime behavior, SheetJS edge compatibility, and Workbox PWA patterns are based on training data and project-specific context from PROJECT.md. No live documentation verification was available during this research session.
- Cloudflare Workers runtime limits (CPU time, script size): https://developers.cloudflare.com/workers/platform/limits/ — verify current limits as they change periodically
- D1 migration system: https://developers.cloudflare.com/d1/reference/migrations/ — verify current migration tracking behavior
- SheetJS edge runtime compatibility: https://docs.sheetjs.com/docs/getting-started/platforms/cloudflare — verify current recommended import path for Workers
- Workbox service worker update flow: https://developers.google.com/web/tools/workbox/guides/advanced-recipes#offer_a_page_reload_for_users — verify with vite-plugin-pwa current docs
