# Architecture Patterns

**Domain:** Fire safety facility management PWA (Cloudflare-native, edge-first)
**Researched:** 2026-03-31 (v1.1 update — new feature integration)
**Confidence:** HIGH — derived from direct codebase inspection (migration 0032, 103 commits)

---

## Existing Architecture (Baseline — v1.0)

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
       ├─ dashboard/stats.ts
       ├─ elevators/ (index.ts, faults.ts, history.ts, inspections.ts)
       ├─ reports/ (check-monthly.ts, div.ts)
       ├─ schedule/ ([id].ts, index.ts)
       ├─ leaves/ ([id].ts, index.ts)
       ├─ div/ (logs.ts, pressure.ts)
       ├─ daily-report/ (index.ts, notes.ts)
       ├─ fire-alarm/ (index.ts)
       ├─ uploads/
       └─ public/

D1 (SQLite) ← bound as env.DB in every function
R2 Bucket   ← bound as env.STORAGE (photo uploads)
```

**Key constraints (confirmed from codebase):**
- No Hono — native Pages Functions file-system routing only, named exports (`onRequestGet`, `onRequestPost`, etc.)
- Excel generation is 100% client-side: `fflate` unzip → XML patch → rezip in browser
- JWT payload carries `staffId`, `staffName`, `role` — available in every handler as `(ctx.data as any).staffId`
- `check_records` already has `status`, `resolution_memo`, `resolved_at`, `resolved_by` columns (migration 0012)
- `streakDays` is hardcoded to `0` in `dashboard/stats.ts` — marked `// TODO`
- `STAFF_ROLES` is hardcoded in `DashboardPage.tsx` (line 14-19) — not DB-driven
- `BottomNav` ITEMS array is a static constant in `BottomNav.tsx` with exactly 5 entries

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| React SPA (`src/`) | UI rendering, local state, Excel generation | Pages Functions via `/api/*` fetch |
| `functions/_middleware.ts` | JWT verification, CORS headers | All downstream handlers via `ctx.data` |
| `functions/api/**/*.ts` | D1 queries, R2 operations, JSON responses | D1 (`env.DB`), R2 (`env.STORAGE`), `ctx.data.staffId/role` |
| D1 database | Persistent data: inspections, checkpoints, staff, schedules | Functions only |
| R2 bucket | Photo blob storage | Upload function (write), uploads/public routes (read) |
| `public/templates/*.xlsx` | Excel form templates | Client-side `generateExcel.ts` via `fetch('/templates/...')` |
| `src/utils/api.ts` | Centralized HTTP client, auth header injection | All page components |
| `src/stores/authStore.ts` | JWT + staff state persisted to localStorage | All components needing auth |

---

## Data Flow

### Normal API Request
```
React component
  → api.get('/some/endpoint')          (src/utils/api.ts — adds Bearer token)
  → Cloudflare Pages CDN
  → _middleware.ts (JWT verify, set ctx.data.staffId/role)
  → functions/api/.../handler.ts
  → env.DB.prepare(...).bind(...).all()
  → Response.json({ success: true, data: ... })
  → TanStack Query cache → React re-render
```

### Excel Generation (Client-Side, must stay client-side)
```
User clicks "다운로드"
  → ReportsPage calls api.get('/reports/check-monthly?...')
  → API returns raw DB rows as JSON
  → generateExcel(year, data, type) runs in browser
     ├─ fetch('/templates/점검표_양식.xlsx')  (static asset)
     ├─ fflate.unzipSync(xlsx binary)
     ├─ DOM-patch XML cells in worksheet
     └─ fflate.zipSync → Blob → anchor download
```

---

## New Feature Integration Map

### 1. BottomNav Restructuring

**What changes:**
- `src/components/BottomNav.tsx` — replace static `ITEMS` array (5 items) with new 5-item layout:
  - 대시보드 (unchanged)
  - 점검 (unchanged)
  - QR 스캔 (unchanged, center special button)
  - 조치 (NEW — replaces 승강기)
  - 햄버거/더보기 (renamed trigger, opens SideMenu — replaces 승강기 item or keeps icon)
- `src/App.tsx` — add `/remediation` to `NO_NAV_PATHS` exclusion list if remediation is a full-screen page; add routes for new pages
- `src/components/SideMenu.tsx` — move 승강기 관리 from BottomNav into SideMenu under "주요 기능" section (it is already listed there — just make it the only access point)

**No API changes needed.** Pure UI restructuring.

**Risk:** `NO_NAV_PATHS` in `App.tsx` currently lists paths that hide BottomNav. Any new full-screen page that should hide the nav must be added to this array. Forgetting this causes nav to appear on pages where it should not.

---

### 2. Remediation Tracking (조치 관리)

**Existing foundation:**
- `check_records` already has `status TEXT DEFAULT 'open'`, `resolution_memo TEXT`, `resolved_at TEXT`, `resolved_by TEXT` (migration 0012)
- `inspectionApi.resolveRecord()` already exists in `src/utils/api.ts`
- `GET /api/inspections/records?date=YYYY-MM-DD` returns `status`, `resolutionMemo`, `resolvedAt`, `resolvedBy`

**What is missing:**
- No dedicated page for listing ALL open/unresolved items across all dates
- No filter/sort UI for remediation items
- SideMenu has a `미조치 항목` link to `/unresolved` (hardcoded with badge=2) but the route does not exist in App.tsx

**New components needed:**
- `src/pages/RemediationPage.tsx` — list of `check_records` with `result IN ('bad','caution') AND status='open'`, grouped by date or category, with inline resolve action
- Route: `/remediation` (or `/unresolved` to match existing SideMenu link)

**New API endpoint needed:**
```
GET /api/inspections/unresolved
  → query: SELECT cr.*, cp.category, cp.location, cp.floor FROM check_records cr
           JOIN check_points cp ON cr.checkpoint_id = cp.id
           WHERE cr.result IN ('bad','caution') AND (cr.status IS NULL OR cr.status='open')
           ORDER BY cr.checked_at DESC
  → response: { success, data: UnresolvedRecord[] }
```

**New `api.ts` entry:**
```typescript
export const remediationApi = {
  listOpen: () => api.get<UnresolvedRecord[]>('/inspections/unresolved'),
  resolve:  (id: string, memo: string, photoKey?: string) =>
    inspectionApi.resolveRecord(id, memo, photoKey),  // reuse existing
}
```

**No new DB migration needed** — schema already supports this.

**Dashboard integration:** `stats.unresolved` already counts open records. After implementing the page, replace the hardcoded badge value in SideMenu with a live query result.

---

### 3. Meal Records (식사 이용 기록)

**New DB table (migration 0033):**
```sql
CREATE TABLE IF NOT EXISTS meal_records (
  id          TEXT PRIMARY KEY,
  staff_id    TEXT NOT NULL REFERENCES staff(id),
  date        TEXT NOT NULL,   -- YYYY-MM-DD
  meal_type   TEXT NOT NULL CHECK(meal_type IN ('breakfast','lunch','dinner')),
  used        INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_meal_records_unique ON meal_records(staff_id, date, meal_type);
CREATE INDEX IF NOT EXISTS idx_meal_records_date ON meal_records(date);
```

**New DB table for menu management (migration 0034):**
```sql
CREATE TABLE IF NOT EXISTS cafeteria_menus (
  id          TEXT PRIMARY KEY,
  week_start  TEXT NOT NULL,   -- ISO week Monday YYYY-MM-DD
  day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 1 AND 5),  -- 1=Mon
  meal_type   TEXT NOT NULL CHECK(meal_type IN ('breakfast','lunch','dinner')),
  menu_text   TEXT NOT NULL DEFAULT '',
  created_by  TEXT NOT NULL REFERENCES staff(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_cafeteria_menus_week ON cafeteria_menus(week_start);
```

**New API routes:**
```
GET  /api/meals?year=YYYY&month=MM&staffId=optional  ← monthly view
POST /api/meals                                       ← log meal usage { date, meal_type }
DELETE /api/meals/[id]                                ← cancel same-day only

GET  /api/meals/menu?week=YYYY-MM-DD                  ← weekly menu
POST /api/meals/menu                                  ← admin: create/update menu entry
```

**New component:**
- `src/pages/MealPage.tsx` — calendar grid showing personal meal records + monthly count; tab for weekly menu display
- Route: `/meal`
- SideMenu `식당 메뉴` path (`/menu`) should be updated to `/meal` to match

**API additions to `src/utils/api.ts`:**
```typescript
export const mealApi = {
  getMonthly: (year: number, month: number, staffId?: string) =>
    api.get<MealRecord[]>(`/meals?year=${year}&month=${String(month).padStart(2,'0')}${staffId ? `&staffId=${staffId}` : ''}`),
  log: (date: string, meal_type: string) => api.post<{ id: string }>('/meals', { date, meal_type }),
  remove: (id: string) => api.delete<void>(`/meals/${id}`),
  getWeekMenu: (weekStart: string) => api.get<CafeteriaMenu[]>(`/meals/menu?week=${weekStart}`),
  saveMenu: (body: CafeteriaMenuInput) => api.post<void>('/meals/menu', body),
}
```

---

### 4. Education Management (보수교육 일정 관리)

**New DB table (migration 0035):**
```sql
CREATE TABLE IF NOT EXISTS education_records (
  id              TEXT PRIMARY KEY,
  staff_id        TEXT NOT NULL REFERENCES staff(id),
  title           TEXT NOT NULL,
  scheduled_date  TEXT NOT NULL,   -- YYYY-MM-DD
  completed_date  TEXT,
  provider        TEXT,            -- 교육 기관
  duration_hours  REAL,
  is_required     INTEGER NOT NULL DEFAULT 1,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK(status IN ('pending','completed','cancelled')),
  memo            TEXT,
  created_by      TEXT NOT NULL REFERENCES staff(id),
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_education_date ON education_records(staff_id, scheduled_date);
```

**New API routes:**
```
GET  /api/education?staffId=optional&year=YYYY
POST /api/education
PATCH /api/education/[id]    ← mark complete, update memo
DELETE /api/education/[id]   ← admin only, soft-cancel preferred
```

**New component:**
- `src/pages/EducationPage.tsx` — list of scheduled/completed trainings per staff member; admin can create records for any staff
- Route: `/education`
- Access: SideMenu under "근무·복지" section

**No calendar-specific library needed** — date-fns already in the project handles date arithmetic.

---

### 5. Admin Settings (관리자 설정)

**New DB table (migration 0036):**
```sql
CREATE TABLE IF NOT EXISTS system_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_by  TEXT REFERENCES staff(id),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**New API routes:**
```
GET   /api/admin/settings         ← any authenticated user (read)
PATCH /api/admin/settings         ← admin role only
GET   /api/admin/users            ← list all staff (admin only)
PATCH /api/admin/users/[id]       ← update staff name/title/password (admin only)
```

**Role enforcement in handler (pattern):**
```typescript
export const onRequestPatch: PagesFunction<Env> = async ({ request, env, data }) => {
  const { role } = data as any
  if (role !== 'admin') return Response.json({ success: false, error: '권한 없음' }, { status: 403 })
  // ...
}
```

**New component:**
- `src/pages/AdminPage.tsx` — tabs: 사용자 관리 (name/title/password reset), 시스템 설정 (key-value entries)
- Route: `/admin`
- Access: SideMenu under "시스템" section, only rendered/accessible when `staff.role === 'admin'`

**Hardcoded `STAFF_ROLES` in `DashboardPage.tsx` (line 14-19) must be removed** and replaced with `staff.role` from the JWT/Zustand store. This is the "dynamic inspector names" part — not a separate feature, but fixing the hardcode.

---

### 6. Dynamic Inspector Names (점검자 이름 동적 로딩)

**Problem:** `DashboardPage.tsx` has a hardcoded `STAFF_ROLES` map with literal staff IDs. New staff or role changes require code edits.

**Solution (no new table needed):**
- `GET /api/auth/me` or reuse staff list from `GET /api/admin/users` (admin-only) or add `GET /api/staff` (any authenticated)
- Remove hardcoded `STAFF_ROLES` from `DashboardPage.tsx`
- Derive roles from `useAuthStore().staff.role` for the current user
- For inspector selection in inspection flows, query `/api/staff` to get all staff names

**New API route:**
```
GET /api/staff    ← returns id, name, role, title for all staff (any authenticated user)
                     mirrors the staff query already in dashboard/stats.ts onDutyStaff section
```

**Affected files:**
- `src/pages/DashboardPage.tsx` — remove `STAFF_ROLES` constant
- Any component that shows inspector names for reports

---

### 7. streakDays Calculation

**Problem:** `dashboard/stats.ts` returns `streakDays: 0` with a `// TODO` comment.

**Calculation logic (server-side, in dashboard/stats.ts):**
```sql
-- For each day going backward from yesterday, check if any inspect schedule was completed
-- A day "counts" if: at least one inspect schedule_item exists for that date
--   AND at least one check_record exists with result IN ('normal','caution')
--   for a checkpoint whose category matches the schedule's inspection_category
-- streak ends at first day with an inspect schedule that has NO completed records
```

**Implementation:** Add a helper function `calcStreakDays(env: D1Database, today: string): Promise<number>` in the dashboard stats handler or a shared `functions/utils/` module. Walk backward day-by-day (max 365 iterations, break on first incomplete day).

**No new table or migration needed.** Uses existing `schedule_items` and `check_records`.

---

### 8. Legal Inspection Management (법적 점검 관리)

**New DB tables (migration 0037):**
```sql
CREATE TABLE IF NOT EXISTS legal_inspections (
  id              TEXT PRIMARY KEY,
  type            TEXT NOT NULL,   -- '소방종합점검', '소방작동기능점검', '기타'
  scheduled_date  TEXT NOT NULL,   -- YYYY-MM-DD
  actual_date     TEXT,
  inspector_name  TEXT,            -- 외부 점검업체 담당자
  result          TEXT CHECK(result IN ('pass','conditional_pass','fail')),
  issue_count     INTEGER NOT NULL DEFAULT 0,
  document_key    TEXT,            -- R2 key for uploaded report PDF
  memo            TEXT,
  created_by      TEXT NOT NULL REFERENCES staff(id),
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS legal_inspection_issues (
  id              TEXT PRIMARY KEY,
  inspection_id   TEXT NOT NULL REFERENCES legal_inspections(id),
  description     TEXT NOT NULL,
  location        TEXT,
  due_date        TEXT,
  status          TEXT NOT NULL DEFAULT 'open'
                  CHECK(status IN ('open','resolved')),
  resolved_at     TEXT,
  resolved_by     TEXT REFERENCES staff(id),
  resolution_memo TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_legal_insp_date ON legal_inspections(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_legal_issues_insp ON legal_inspection_issues(inspection_id, status);
```

**New API routes:**
```
GET/POST   /api/legal-inspections
PATCH      /api/legal-inspections/[id]
GET/POST   /api/legal-inspections/[id]/issues
PATCH      /api/legal-inspections/issues/[id]
```

**New component:**
- `src/pages/LegalInspectionPage.tsx` — timeline view of past/upcoming legal inspections; issue tracker per inspection
- Route: `/legal-inspection`
- Access: SideMenu under "관리" section (replacing the `soon: true` placeholder in MorePage)

---

### 9. Elevator Legal Inspection (승강기 법정 검사)

**Existing foundation:**
- `elevator_inspections` table exists with `type IN ('monthly','annual')`
- `/api/elevators/inspections.ts` handles both types
- `ElevatorPage.tsx` already has `Tab = 'list' | 'fault' | 'inspect' | 'annual'` and modal `'annual_new'`

**What is missing — annual schedule table (migration 0038):**
```sql
CREATE TABLE IF NOT EXISTS elevator_annual_schedules (
  id              TEXT PRIMARY KEY,
  elevator_id     TEXT NOT NULL REFERENCES elevators(id),
  scheduled_date  TEXT NOT NULL,   -- YYYY-MM-DD (법정 검사 예정일)
  actual_date     TEXT,
  result          TEXT CHECK(result IN ('pass','conditional_pass','fail')),
  inspector_org   TEXT,            -- 검사기관
  next_due_date   TEXT,            -- 다음 법정 검사 만료일
  document_key    TEXT,            -- R2 key for 검사 결과 PDF
  memo            TEXT,
  created_by      TEXT NOT NULL REFERENCES staff(id),
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ev_annual_elevator ON elevator_annual_schedules(elevator_id, scheduled_date);
```

**New API routes:**
```
GET  /api/elevators/annual-schedules?elevatorId=optional
POST /api/elevators/annual-schedules
PATCH /api/elevators/annual-schedules/[id]
```

**Integration:** ElevatorPage already handles an `annual` tab — extend the existing modal `annual_new` to include legal inspection fields (inspector_org, next_due_date, document upload). No new page required — add to existing ElevatorPage tabs.

---

## New DB Migrations Required (v1.1)

| Migration | Table(s) | Trigger |
|-----------|----------|---------|
| 0033 | `meal_records` | Meal records feature |
| 0034 | `cafeteria_menus` | Meal menu management |
| 0035 | `education_records` | Education management |
| 0036 | `system_settings` | Admin settings |
| 0037 | `legal_inspections`, `legal_inspection_issues` | Legal inspection management |
| 0038 | `elevator_annual_schedules` | Elevator legal inspection |

**No migration needed for:** BottomNav restructuring, remediation page (schema exists), streakDays, dynamic staff names, inspector name fix.

---

## New API Routes Required (v1.1)

| Route | Method | Handler file | Purpose |
|-------|--------|--------------|---------|
| `/api/staff` | GET | `functions/api/staff/index.ts` | Dynamic staff list |
| `/api/inspections/unresolved` | GET | `functions/api/inspections/unresolved.ts` | Remediation list |
| `/api/meals` | GET, POST | `functions/api/meals/index.ts` | Meal records |
| `/api/meals/[id]` | DELETE | `functions/api/meals/[id].ts` | Cancel meal |
| `/api/meals/menu` | GET, POST | `functions/api/meals/menu.ts` | Cafeteria menu |
| `/api/education` | GET, POST | `functions/api/education/index.ts` | Education records |
| `/api/education/[id]` | PATCH, DELETE | `functions/api/education/[id].ts` | Update education |
| `/api/admin/settings` | GET, PATCH | `functions/api/admin/settings.ts` | System settings |
| `/api/admin/users` | GET | `functions/api/admin/users/index.ts` | User management |
| `/api/admin/users/[id]` | PATCH | `functions/api/admin/users/[id].ts` | Update staff |
| `/api/legal-inspections` | GET, POST | `functions/api/legal-inspections/index.ts` | Legal inspections |
| `/api/legal-inspections/[id]` | PATCH | `functions/api/legal-inspections/[id].ts` | Update inspection |
| `/api/legal-inspections/[id]/issues` | GET, POST | `functions/api/legal-inspections/[id]/issues.ts` | Issues per inspection |
| `/api/legal-inspections/issues/[id]` | PATCH | `functions/api/legal-inspections/issues/[id].ts` | Resolve issue |
| `/api/elevators/annual-schedules` | GET, POST | `functions/api/elevators/annual-schedules.ts` | Elevator legal schedule |
| `/api/elevators/annual-schedules/[id]` | PATCH | `functions/api/elevators/annual-schedules/[id].ts` | Update schedule |

**Note on `[id]` routing in Pages Functions:** Dynamic segments use bracket syntax in file paths (`[id].ts`). This is already established in `functions/api/inspections/[sessionId].ts`. The same convention applies to all new dynamic routes.

---

## New React Routes Required (v1.1)

Add to `App.tsx` Routes and `NO_NAV_PATHS`:

| Path | Component | BottomNav shown | Access level |
|------|-----------|-----------------|--------------|
| `/remediation` | `RemediationPage` | YES (조치 tab active) | All |
| `/meal` | `MealPage` | NO (full-screen) | All |
| `/education` | `EducationPage` | NO (full-screen) | All |
| `/admin` | `AdminPage` | NO (full-screen) | Admin only |
| `/legal-inspection` | `LegalInspectionPage` | NO (full-screen) | All |

**Current `NO_NAV_PATHS` list in App.tsx (line 44):**
```
['/', '/login', '/schedule', '/reports', '/workshift', '/leave', '/floorplan', '/div', '/qr-print', '/daily-report']
```
Add `/meal`, `/education`, `/admin`, `/legal-inspection` to this array.

`/remediation` must NOT be in `NO_NAV_PATHS` — it should show the BottomNav with 조치 tab highlighted as active.

---

## State Management Changes

**No new Zustand stores needed.** All new features use TanStack Query for server state.

**Potential addition to authStore:** After dynamic staff list is implemented, the `staff` object from JWT already has `role`. No change needed to the store itself — the hardcoded `STAFF_ROLES` map in DashboardPage needs to be deleted, not the store.

**TanStack Query key conventions for new features:**
```typescript
['unresolved']             // RemediationPage
['meals', year, month]     // MealPage monthly view
['cafeteria-menu', week]   // MealPage menu tab
['education', staffId]     // EducationPage
['admin-settings']         // AdminPage
['legal-inspections']      // LegalInspectionPage
['legal-issues', inspId]   // LegalInspectionPage issue list
['elevator-annual', evId]  // ElevatorPage annual tab
['staff-list']             // Any component needing staff dropdown
```

---

## Patterns to Follow

### Pattern 1: File-System API Route (unchanged)
Every new API endpoint is a new file in `functions/api/`. Named exports only. No Hono.

### Pattern 2: Client-Side Excel Generation (unchanged)
API returns JSON rows. Client fetches template, patches XML, triggers download. Never move xlsx work into Workers.

### Pattern 3: Consistent Response Envelope (unchanged)
`{ success: boolean, data?: T, error?: string }`. All new handlers must follow this.

### Pattern 4: nanoid Primary Keys (unchanged)
21-char IDs from `crypto.getRandomValues`. No auto-increment integers.

### Pattern 5: Role Guard in Admin Handlers (new for v1.1)
```typescript
const { role } = data as any
if (role !== 'admin') return Response.json({ success: false, error: '권한 없음' }, { status: 403 })
```
Apply to all `/api/admin/*` write endpoints and to any delete that should be admin-only.

### Pattern 6: SideMenu Badge from Live Query (new for v1.1)
The hardcoded `badge: 2` for `미조치 항목` in SideMenu must be replaced with a live count fetched from the same TanStack Query cache as the dashboard stats. Use `useQuery(['dashboard'])` and read `data?.stats?.unresolved` in SideMenu to show the real count.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Excel Generation in a Worker (unchanged)
CPU limits. Keep client-side.

### Anti-Pattern 2: Hono or Express (unchanged)
No need. Native file-system routing works.

### Anti-Pattern 3: Module-Level Cache in Workers (unchanged)
Workers isolates are not persistent. Use TanStack Query client-side.

### Anti-Pattern 4: Inline SQL String Concatenation (unchanged)
Always `prepare(sql).bind(params)`.

### Anti-Pattern 5: New Full-Screen Pages Without Updating NO_NAV_PATHS
Forgetting to add a new path to `NO_NAV_PATHS` in `App.tsx` causes BottomNav to appear on full-screen pages. Always update the array when adding a route that should hide the nav.

### Anti-Pattern 6: Hardcoding Role Checks as Staff IDs
The existing `STAFF_ROLES` map in `DashboardPage.tsx` is a known anti-pattern (line 14-19). Do not replicate this pattern in new components. Use `staff.role` from the JWT/Zustand store or from `/api/staff`.

---

## Build Order Implications for v1.1 Roadmap

The dependency graph for v1.1 features (arrows = "must come before"):

```
[BottomNav restructuring]              ← no deps; pure UI, safe to do first
         ↓
[RemediationPage + /api/inspections/unresolved]
  ← requires BottomNav to show 조치 tab; no DB migration
         ↓
[streakDays calculation in dashboard/stats.ts]
  ← no migration; touches existing tables
         ↓
[Dynamic staff names — /api/staff + remove hardcoded map]
  ← no migration; removes technical debt
         ↓
[Admin settings — migration 0036, /api/admin/*, AdminPage]
  ← needs dynamic staff API for user management tab
         ↓
[Meal records — migrations 0033-0034, /api/meals/*, MealPage]
  ← independent after admin auth is confirmed working
         ↓
[Education management — migration 0035, /api/education/*, EducationPage]
  ← independent; can run parallel with meal records
         ↓
[Legal inspection management — migration 0037, /api/legal-inspections/*, LegalInspectionPage]
  ← independent; can run parallel with education
         ↓
[Elevator annual schedule — migration 0038, /api/elevators/annual-schedules, ElevatorPage extension]
  ← independent; can run parallel with legal inspection
```

**Truly independent (can be done in any order after BottomNav):**
- Meal records
- Education management
- Legal inspection management
- Elevator annual schedule

**Must be in sequence:**
1. BottomNav restructuring (establishes nav structure everything else hangs from)
2. RemediationPage (depends on new 조치 BottomNav tab)
3. streakDays + dynamic staff names (cleanup work, establish patterns for later features)
4. Admin settings (admin auth pattern needed by some later admin-gated features)

**Parallel after step 4:**
- Meal + Education + Legal + Elevator annual (all independent, all follow same table+API+page pattern)

---

## Scalability Considerations

| Concern | At 4 users (current + v1.1) | Notes |
|---------|------------------------------|-------|
| D1 read throughput | Not a constraint | 4 concurrent users max |
| R2 storage | Not a constraint | PDFs/photos for legal inspections + meals |
| Workers CPU | Excel offloaded to client; new endpoints are simple CRUD | No concern |
| D1 schema complexity | 6 new migrations; all additive | No concern; D1 handles SQLite table count fine |
| Page bundle size | 5 new lazy-loaded pages | Vite code splitting keeps initial load fast |

---

## Sources

All findings derived from direct inspection of:
- `/Users/jykevin/Documents/20260328/cha-bio-safety/src/` (all pages, components, utils, types)
- `/Users/jykevin/Documents/20260328/cha-bio-safety/functions/` (all API handlers, middleware)
- `/Users/jykevin/Documents/20260328/cha-bio-safety/migrations/0001–0032.sql` (full schema)
- `/Users/jykevin/Documents/20260328/.planning/PROJECT.md` (v1.1 requirements)
- Previous ARCHITECTURE.md (v1.0 baseline, 2026-03-28)

**Confidence: HIGH** — all integration points derived from actual codebase state at migration 0032.
