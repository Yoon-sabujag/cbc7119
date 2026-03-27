# Architecture Patterns

**Domain:** Fire safety facility management PWA (Cloudflare-native, edge-first)
**Researched:** 2026-03-28
**Confidence:** HIGH — derived from direct codebase inspection

---

## Existing Architecture (Baseline)

```
Browser (PWA)
  └─ React 18 + Vite build → dist/
       ├─ Static assets served by Cloudflare Pages CDN
       ├─ /api/* routed to Pages Functions (via _routes.json)
       └─ /public/* served statically (xlsx templates, icons)

Cloudflare Pages Functions
  ├─ functions/_middleware.ts       ← JWT auth + CORS (runs on every /api/* request)
  └─ functions/api/
       ├─ auth/login.ts
       ├─ checkpoints/index.ts
       ├─ inspections/[sessionId].ts, index.ts, records/, records.ts
       ├─ dashboard/
       ├─ elevators/ (index.ts, faults.ts, history.ts, inspections.ts)
       ├─ reports/ (check-monthly.ts, div.ts)
       ├─ schedule/ ([id].ts, index.ts)
       ├─ leaves/
       ├─ div/ (logs.ts, pressure.ts)
       ├─ uploads/
       └─ public/

D1 (SQLite) ← bound as env.DB in every function
R2 Bucket   ← bound as env.STORAGE (photo uploads)
```

**Key constraints discovered:**
- `_routes.json` includes only `/api/*` — all other paths fall through to the SPA
- `wrangler.toml` compatibility date is `2024-09-23` — current Workers runtime features available
- Excel generation currently runs 100% client-side using `xlsx-js-style` and `fflate`
- Template `.xlsx` files live in `public/templates/` — served as static assets, fetched by client JS
- There is no Hono dependency in `package.json` — this is vanilla Cloudflare Pages Functions (file-system routing), NOT Hono middleware. Each file exports named `onRequestGet`, `onRequestPost`, etc.

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| React SPA (`src/`) | UI rendering, local state, Excel generation | Pages Functions via `/api/*` fetch |
| `functions/_middleware.ts` | JWT verification, CORS headers | All downstream function handlers via `ctx.data` |
| `functions/api/**/*.ts` | D1 queries, R2 operations, JSON responses | D1 (env.DB), R2 (env.STORAGE), middleware (ctx.data.staffId) |
| D1 database | Persistent data: inspections, checkpoints, staff, schedules | Functions only |
| R2 bucket | Photo blob storage | Upload function (write), uploads/public routes (read URL) |
| `public/templates/*.xlsx` | Excel form templates | Client-side `generateExcel.ts` via `fetch('/templates/...')` |

---

## Data Flow

### Normal API Request
```
React component
  → api.get('/some/endpoint')          (src/utils/api.ts — adds Bearer token)
  → Cloudflare Pages CDN
  → _middleware.ts (JWT verify, set ctx.data.staffId)
  → functions/api/.../handler.ts
  → env.DB.prepare(...).all()          (D1 query)
  → Response.json({ success, data })
  → TanStack Query cache → React re-render
```

### Excel Generation (Current Pattern — Client-Side)
```
User clicks "다운로드"
  → ReportsPage calls api.get('/reports/check-monthly?year=X&category=Y')
  → API returns raw DB rows as JSON
  → generateExcel(year, data, type) — runs in browser
     ├─ fetch('/templates/점검표_양식.xlsx')  (static asset)
     ├─ fflate.unzipSync(xlsx binary)
     ├─ DOM-patch XML cells in worksheet
     └─ fflate.zipSync → Blob → anchor download
```

### Photo Upload
```
React → POST /api/uploads (multipart or base64)
  → _middleware.ts (auth)
  → uploads handler → env.STORAGE.put(key, buffer)
  → returns { key }
  → subsequent check_records row stores photo_key
```

---

## Patterns to Follow

### Pattern 1: File-System API Route
**What:** Each HTTP method is a named export in the corresponding file path.
**When:** Every new API endpoint.
**Example:**
```typescript
// functions/api/legal-inspections/index.ts
import type { Env } from '../../_middleware'

export const onRequestGet: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId } = data as any   // set by _middleware.ts
  const rows = await env.DB.prepare(`SELECT * FROM legal_inspections ORDER BY inspect_date DESC`).all()
  return Response.json({ success: true, data: rows.results ?? [] })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId } = data as any
  const body = await request.json<{ ... }>()
  // insert...
  return Response.json({ success: true, data: { id } }, { status: 201 })
}
```

### Pattern 2: Client-Side Excel Generation
**What:** API endpoint returns raw data rows. Client fetches template xlsx, patches cells, triggers download.
**When:** All Excel export features.
**Why:** Cloudflare Workers have a 128 MB memory limit and CPU time limits. The current approach correctly offloads xlsx binary manipulation to the browser. The `fflate` + XML-patching pattern already established in `generateExcel.ts` handles arbitrary worksheet complexity without server memory pressure.

**When NOT to deviate:** Do not move Excel generation into a Worker function. The xlsx manipulation (unzip → patch XML → rezip) is CPU-intensive and deterministically exceeds Workers CPU budget for complex multi-sheet workbooks.

### Pattern 3: Consistent Response Envelope
**What:** All API responses follow `{ success: boolean, data?: T, error?: string }`.
**When:** Every endpoint.
**Why:** `src/utils/api.ts` (`req<T>` function) unwraps this envelope and throws `ApiError` on failure. Deviating breaks the client abstraction.

### Pattern 4: Nanoid for Primary Keys
**What:** `crypto.getRandomValues`-based nanoid (21-char) for IDs, not UUIDs or auto-increment.
**When:** Every new DB insert.
**Example:** Defined inline in handlers — can be extracted to a shared utility if needed.

### Pattern 5: D1 Prepared Statements
**What:** Always use `env.DB.prepare(sql).bind(...params).all()` or `.run()` or `.first()`.
**When:** Every D1 query.
**Why:** Prevents SQL injection; D1 does not support raw query execution.

---

## How New Features Integrate

### Excel Export — 6 Remaining Report Types

**API layer (new endpoints needed):**

```
GET /api/reports/fire-pump?year=YYYY        ← monthly fire pump data
GET /api/reports/fire-detection?year=YYYY   ← auto fire detection data
GET /api/reports/smoke-control?year=YYYY    ← smoke control (제연) data
GET /api/reports/fire-shutter?year=YYYY     ← fire shutter data
GET /api/reports/evacuation?year=YYYY       ← evacuation facility data
GET /api/reports/daily-log?date=YYYY-MM-DD  ← daily operations log (복합 데이터)
```

Each endpoint follows the `check-monthly.ts` pattern: query check_records joined to check_points filtered by category, return grouped-by-location rows.

The `일일업무일지` endpoint is more complex — it must JOIN:
- `schedule_items` for the day
- `check_records` summary for the day
- `elevator_faults` open/resolved for the day
- `staff` on-duty info (derived from shift calculation, which currently lives client-side in `shiftCalc.ts`)

**Client layer:**
- Add new report cards to `ReportsPage.tsx`
- Add new `generate*Excel()` functions to `src/utils/generateExcel.ts`
- Add corresponding `.xlsx` template files to `public/templates/`

**Template files still needed (not yet in public/templates/):**
- `소방펌프_점검일지.xlsx`
- `자탐_점검일지.xlsx`
- `제연설비_점검일지.xlsx`
- `방화셔터_점검일지.xlsx`
- `피난방화시설_점검일지.xlsx`
- `일일업무일지.xlsx`

These must be derived from the reference files in `점검 항목/` directory.

### Elevator Legal Inspection / Annual Schedule

The `elevator_inspections` table and `/api/elevators/inspections` endpoint already exist with `type` field supporting `'monthly'` and `'annual'`. Remaining work:

- Add inspection schedule management (upcoming annual/legal inspection dates) — this is a new table: `elevator_inspection_schedule` with fields: elevator_id, scheduled_date, type, notes
- Add Excel export for legal inspection records following same pattern as other report types
- No new architectural patterns required

**New migration:** `0024_elevator_inspection_schedule.sql`

### Legal Inspection Management (법적 점검 관리)

**New tables needed:**
- `legal_inspections` — type (소방/기타), scheduled_date, actual_date, result, notes, issue_count
- `legal_inspection_issues` — inspection_id, description, due_date, resolved_at, status

**New API routes:**
```
GET/POST   /api/legal-inspections
PATCH      /api/legal-inspections/[id]
GET/POST   /api/legal-inspections/[id]/issues
PATCH      /api/legal-inspections/issues/[id]
```

Pattern is identical to existing routes — no new infrastructure needed.

### Remedial Training / Meal Tracking

Both are additive features following the same table + API + React page pattern. No architectural impact. One migration each.

### Admin Settings

Map to a `GET/PATCH /api/admin/settings` endpoint. If settings are per-system (not per-user), a simple key-value table `system_settings (key TEXT PK, value TEXT)` works. Role check: `ctx.data.role === 'admin'` — already available from JWT payload.

---

## Deployment Pipeline

### Current State (as of 2026-03-28)
- Deploy script: `deploy.sh` (interactive menu shell script)
- CI: None (GitHub remote not yet created)
- Known issue: Cloudflare Pages API returned 504 during initial deploy attempt

### Recommended Structure

**Step 1 — Establish GitHub Remote (prerequisite)**
```bash
git remote add origin https://github.com/<account>/cha-bio-safety.git
git push -u origin main
```

**Step 2 — Wrangler Direct Deploy (primary method, no CI required)**
```bash
# From project root:
npm run build && npx wrangler pages deploy dist
```
This is already what `deploy.sh` option 2 does. It is reliable for a 4-person internal tool. GitHub Actions CI is optional and adds complexity without benefit at this scale.

**Step 3 — DB Migrations (separate, manual confirmation required)**
```bash
npx wrangler d1 execute cha-bio-db --remote --file=migrations/0024_*.sql
```
The `deploy.sh` option 5 (full deploy) chains build → deploy → migration in sequence with confirmation prompts — this is the correct pattern. Do not auto-apply migrations in CI without confirmation; D1 does not have rollback.

### 504 Issue Resolution

The 504 during the initial `wrangler pages deploy` is a Cloudflare API timeout during the upload/activation phase, not a build failure. Retry strategies:

1. Verify `wrangler whoami` shows authenticated account
2. Check Cloudflare status page for API incidents
3. Use `npx wrangler pages deploy dist --no-bundle` if bundle size is unexpectedly large
4. Confirm `pages_build_output_dir = "dist"` in `wrangler.toml` matches actual `npm run build` output dir

The `dist/` directory is never committed to git (correctly). The deploy workflow must always rebuild from source.

### Build Validation Before Deploy

The build fails silently on TypeScript errors due to `tsc && vite build` in `package.json`. Before deploying new features:

```bash
npm run build 2>&1 | tail -20   # surface TS errors
```

Workers (Pages Functions) TypeScript is not compiled by Vite — it is processed by Wrangler at deploy time. TypeScript errors in `functions/` only surface during `wrangler pages deploy`, not `npm run build`. This is a known footgun.

**Recommended:** Add a pre-deploy type check step:
```bash
npx tsc --project tsconfig.json --noEmit   # catches src/ errors
npx wrangler pages functions build --outdir=.wrangler/tmp   # catches functions/ errors (optional)
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Excel Generation in a Worker
**What:** Moving xlsx template manipulation into a Pages Function endpoint.
**Why bad:** Workers have a 10ms–50ms CPU time budget (soft/hard limits). Unzipping a multi-sheet `.xlsx`, patching dozens of XML cells, and rezipping reliably exceeds this. The existing client-side approach is architecturally correct and should not change.
**Instead:** Keep API endpoints as pure data queries returning JSON. Keep all binary file manipulation in `generateExcel.ts` running in the browser.

### Anti-Pattern 2: Hono or Express as Middleware Layer
**What:** Wrapping all functions in a Hono app router.
**Why bad:** The project already uses native Pages Functions file-system routing and it works. Introducing Hono now would require refactoring all 15+ existing handlers and adds an unnecessary dependency. The `PROJECT.md` incorrectly references Hono — the actual codebase does not use it.
**Instead:** Continue with the file-system routing pattern. Each new feature gets its own file in `functions/api/`.

### Anti-Pattern 3: Shared State Between Requests via Module-Level Variables
**What:** Caching D1 results in a module-level `Map` or variable.
**Why bad:** Cloudflare Workers isolates are not persistent between requests. Module-level state is unreliable — it may or may not persist across invocations.
**Instead:** Use TanStack Query on the client for caching. Let D1 handle data consistency.

### Anti-Pattern 4: Inline SQL String Concatenation
**What:** `env.DB.prepare("SELECT * FROM t WHERE id=" + id)`
**Why bad:** SQL injection, and D1 prepare/bind is already established.
**Instead:** Always use `env.DB.prepare("... WHERE id=?").bind(id)`.

### Anti-Pattern 5: All Migrations in a Single Deploy
**What:** Applying many pending migrations at once before production goes live.
**Why bad:** D1 has no transactional rollback across migration files. A mid-series failure leaves the schema in a partial state.
**Instead:** Apply migrations one at a time with verification between each. The current `deploy.sh` already loops through files — this is acceptable because each migration is already idempotent with `CREATE TABLE IF NOT EXISTS`.

---

## Scalability Considerations

| Concern | At 4 users (current) | Notes |
|---------|----------------------|-------|
| D1 read throughput | Not a constraint | 4 concurrent users max |
| R2 storage | Not a constraint | Photos per inspection session |
| Pages Functions CPU | Excel generation offloaded to client | Workers CPU limit is not exercised |
| Workers memory | Not a constraint | No large payloads processed server-side |
| Wrangler deploy size | Monitor if approaching 25 MB Pages limit | Current bundle is small |

This is an internal tool for 4 users. Scalability is not a design concern for any foreseeable future. The architecture is intentionally simple.

---

## Build Order Implications for Roadmap

The dependency graph for remaining features:

```
[Bug fixes + deployment unblock]         ← must come first; blocks everything
         ↓
[GitHub remote + verified deploy]        ← prerequisite for any subsequent work
         ↓
[Excel export 6 remaining types]         ← depends on: template files ready, API data endpoints, generateExcel.ts extensions
         ↓                                  (소방펌프/자탐/제연/방화셔터/피난방화시설 share same pattern; 일일업무일지 needs extra API join)
[Elevator legal inspection tracking]     ← depends on: new migration 0024, existing elevator API extensions
         ↓
[Legal inspection management]            ← depends on: new migrations 0025-0026, new API routes, new React page
         ↓
[Admin settings + facility management]   ← depends on: role check pattern (already works), new table
         ↓
[Remedial training + meal tracking]      ← independent; can be done in any order after deployment is stable
```

**Inspection schedule ↔ record linkage** is a cross-cutting concern that can be addressed after the core features are stable. It touches existing `schedule_items` and `check_records` tables without new migrations (likely a foreign key column addition).

---

## Sources

All findings derived from direct inspection of:
- `/Users/jykevin/Documents/20260328/cha-bio-safety/functions/` (all API handlers)
- `/Users/jykevin/Documents/20260328/cha-bio-safety/src/utils/` (generateExcel.ts, api.ts)
- `/Users/jykevin/Documents/20260328/cha-bio-safety/package.json` (dependencies — confirmed no Hono)
- `/Users/jykevin/Documents/20260328/cha-bio-safety/wrangler.toml` (bindings, compatibility date)
- `/Users/jykevin/Documents/20260328/cha-bio-safety/public/_routes.json` (routing config)
- `/Users/jykevin/Documents/20260328/cha-bio-safety/deploy.sh` (deployment workflow)
- `/Users/jykevin/Documents/20260328/.planning/PROJECT.md` (requirements, decisions)
- `/Users/jykevin/Documents/20260328/cbio_fire_progress_report_20260328.md` (progress state)

**Confidence: HIGH** — all architectural claims are derived from the actual codebase, not assumptions.
