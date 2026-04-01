# Phase 6: Remediation Tracking - Research

**Researched:** 2026-04-01
**Domain:** React SPA feature (list + detail pages), Cloudflare Pages Functions API, React Query, R2 photo upload
**Confidence:** HIGH — entire stack and DB schema are local source, verified by direct code inspection

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**조치 목록 화면 (RemediationPage)**
- D-01: 컴팩트 카드 리스트 — 카테고리+위치(동→층 순서), 판정결과 배지(불량/주의), 점검일, 메모 첫 줄 미리보기, 상태(미조치/완료). 사진 썸네일은 카드에 미포함 (상세에서 확인)
- D-02: 필터: 상단 상태 탭 (전체/미조치/완료) + 카테고리 드롭다운
- D-03: 기간: 기본 30일, 버튼으로 7일/30일/90일/전체 전환
- D-04: 조치 대상: 불량(bad) + 주의(caution) 모두 포함 (현재 stats.ts 쿼리와 동일)
- D-05: 상태 2단계: 미조치(open) / 완료(resolved). DB 변경 없음. '조치중(in_progress)' 불필요

**조치 상세 페이지**
- D-06: 전체 페이지 라우트 이동: /remediation/:recordId
- D-07: NO_NAV_PATHS에 포함 (하단 네비 숨김). 자체 헤더에 뒤로가기 버튼으로 /remediation 목록 복귀
- D-08: 상세 구성: 점검 정보(카테고리, 위치(동→층), 점검일, 점검자, 판정결과) + 점검 메모+사진(조치 전) + 조치 정보(조치 후, 완료 항목만) + 하단 '조치 완료' 버튼(미조치 항목만)
- D-09: 조치 완료 시 필수 입력: 메모 필수 + 사진 선택적
- D-10: 조치 완료 후 동작: '조치 완료' 토스트 표시 → /remediation 목록으로 복귀 (목록 자동 새로고침)

**사진 첨부**
- D-11: 기존 점검 사진 업로드 패턴과 동일 (카메라/갤러리 선택 → 압축 → R2 업로드). usePhotoUpload 훅 + imageUtils 재활용
- D-12: 조치 후 사진 1장 (resolution_photo_key). 조치 전 사진은 점검 시 photo_key 활용. DB 변경 없음
- D-13: R2 키: remediation/{recordId}/{timestamp} 형식

**API**
- D-14: 신규 /api/remediation 엔드포인트: GET /api/remediation?status=open&category=소화기&days=30 — 미조치/완료 필터, 카테고리 필터, 기간 필터 지원
- D-15: 기존 resolve.ts API (POST /api/inspections/records/:recordId/resolve) 활용하여 상태 변경. 별도 API 불필요

**대시보드 미조치 카운트 연동**
- D-16: 대시보드 API 기존 unresolved 값(stats.ts)을 BottomNav 조치 탭 배지 + SideMenu 조치 관리 배지에 전달. 추가 API 불필요
- D-17: Phase 5에서 제거한 하드코딩 배지를 실시간 count로 교체

### Claude's Discretion
- 카드 리스트 정렬 방식 (최신순 기본)
- 필터 드롭다운 카테고리 목록 (DB check_points 테이블에서 동적 조회 vs 하드코딩)
- 상세 페이지 레이아웃 세부 디자인 (기존 앱 스타일과 일관성 유지)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REM-01 | 불량/주의 판정된 점검 개소를 목록으로 조회할 수 있다 | New GET /api/remediation endpoint; RemediationPage list view; check_records WHERE result IN ('bad','caution') |
| REM-02 | 각 항목에 조치 메모를 작성하고 상태를 변경할 수 있다 | Existing POST /api/inspections/records/:recordId/resolve fully handles this; detail page form |
| REM-03 | 조치 전/후 사진을 첨부할 수 있다 (R2) | photo_key (inspection) + resolution_photo_key (resolution) already in schema (migration 0013); usePhotoUpload hook reuse |
| REM-04 | 카테고리/상태/기간별로 필터링/검색할 수 있다 | GET /api/remediation query params: status, category, days; frontend tab+dropdown+period buttons |

</phase_requirements>

---

## Summary

Phase 6 implements the remediation tracking feature: a list page showing all bad/caution inspection records, and a detail page for completing remediation with memo and photo. The DB schema is already complete (migration 0012 added `status`, `resolution_memo`, `resolution_photo_key`, `resolved_at`, `resolved_by` to `check_records`; migration 0013 added `resolution_photo_key`). No new migrations are needed.

The primary new work is: (1) a new `GET /api/remediation` endpoint, (2) a full implementation of `RemediationPage.tsx` (currently a placeholder), (3) a new `RemediationDetailPage.tsx` with the resolve form, and (4) wiring the existing dashboard `unresolved` count through to BottomNav and SideMenu badges.

The existing `POST /api/inspections/records/:recordId/resolve` is already production-ready and handles the state change. The `usePhotoUpload` hook and `compressImage` utility are defined inside `InspectionPage.tsx` — for the detail page they should either be extracted to a shared utility file or copied locally (same pattern, well-understood).

**Primary recommendation:** Extract `usePhotoUpload` and `PhotoButton` from InspectionPage into `src/hooks/usePhotoUpload.ts` + `src/components/PhotoButton.tsx` before building the detail page. This avoids code duplication and is the correct refactor since the phase explicitly calls for reuse.

---

## Standard Stack

### Core (already in project, no new installs needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | Component rendering | Project standard |
| React Router DOM | 6.26.2 | /remediation/:recordId route | Project standard |
| @tanstack/react-query | 5.59.0 | Data fetching, cache invalidation | Project standard |
| react-hot-toast | 2.4.1 | "조치 완료" toast notification | Project standard |
| Cloudflare Pages Functions | — | GET /api/remediation handler | Project standard |
| Cloudflare D1 | — | check_records + check_points queries | Project standard |
| Cloudflare R2 | — | resolution photo storage | Project standard |

### No New Dependencies

This phase requires zero new package installations. All libraries are already present.

---

## Architecture Patterns

### Recommended Project Structure (new files only)

```
src/
├── hooks/
│   └── usePhotoUpload.ts        # Extract from InspectionPage.tsx (new shared hook)
├── components/
│   └── PhotoButton.tsx          # Extract from InspectionPage.tsx (new shared component)
├── pages/
│   ├── RemediationPage.tsx      # Replace placeholder — list view
│   └── RemediationDetailPage.tsx # New — detail + resolve form
functions/api/
└── remediation/
    └── index.ts                 # New — GET /api/remediation
```

### Pattern 1: New API Endpoint — GET /api/remediation

**What:** Cloudflare Pages Function returning check_records JOIN check_points with filters applied via query params.

**SQL pattern (mirrors stats.ts unresolved query):**
```typescript
// Source: cha-bio-safety/functions/api/dashboard/stats.ts lines 74-79
// stats.ts uses:
//   WHERE result IN ('bad','caution') AND (status IS NULL OR status = 'open')
//   AND date(checked_at) >= date('now','+9 hours','-30 days')

// New endpoint extends this with:
// - status filter (all / open / resolved)
// - category filter (JOIN check_points for category)
// - days filter (7 / 30 / 90 / all-time)
// - JOIN staff for inspector name
// - ORDER BY checked_at DESC
```

**Full query shape:**
```sql
SELECT
  r.id, r.result, r.memo, r.photo_key,
  r.status, r.resolution_memo, r.resolution_photo_key,
  r.resolved_at, r.resolved_by,
  r.checked_at, r.staff_id,
  cp.category, cp.location, cp.floor, cp.zone,
  s.name AS staff_name
FROM check_records r
JOIN check_points cp ON cp.id = r.checkpoint_id
LEFT JOIN staff s ON s.id = r.staff_id
WHERE r.result IN ('bad','caution')
  [AND (r.status IS NULL OR r.status = 'open') | AND r.status = 'resolved']
  [AND cp.category = ?]
  [AND date(r.checked_at) >= date('now','+9 hours','-? days')]
ORDER BY r.checked_at DESC
```

**Response shape:**
```typescript
// Source: established project pattern (api.ts req<T>)
{ success: true, data: RemediationRecord[] }

interface RemediationRecord {
  id: string
  result: 'bad' | 'caution'
  memo: string | null
  photoKey: string | null
  status: 'open' | 'resolved'
  resolutionMemo: string | null
  resolutionPhotoKey: string | null
  resolvedAt: string | null
  resolvedBy: string | null
  checkedAt: string
  staffId: string
  staffName: string | null
  category: string
  location: string
  floor: string
  zone: string
}
```

### Pattern 2: RemediationPage List View

**What:** Filter state (tab + category + days) → React Query fetch → card list render.

**State model:**
```typescript
const [statusTab, setStatusTab] = useState<'all' | 'open' | 'resolved'>('all')
const [categoryFilter, setCategoryFilter] = useState<string>('')  // '' = all
const [days, setDays] = useState<number>(30)  // 7 | 30 | 90 | 0 (=all)

const { data, isLoading } = useQuery({
  queryKey: ['remediation', statusTab, categoryFilter, days],
  queryFn: () => remediationApi.list({ status: statusTab, category: categoryFilter, days }),
  staleTime: 30_000,
})
```

**React Query cache key** must include all filter params so changing filter triggers fresh fetch.

**Card click** → `navigate('/remediation/' + record.id)` passing state or relying on detail page fetching its own data.

### Pattern 3: RemediationDetailPage

**Route:** `/remediation/:recordId` — lazy-loaded, added to App.tsx Routes.

**Data:** `useQuery(['remediation-detail', recordId], ...)` fetching `/api/remediation/:recordId` — OR the list API can serve single items if filtered by id. Simplest approach: re-use the GET /api/remediation endpoint with an additional `id` param, or add a separate `GET /api/remediation/:recordId` handler.

**Recommended:** Add `GET /api/remediation/:recordId` as a separate file `functions/api/remediation/[recordId].ts` — consistent with project file-routing pattern (cf. `functions/api/inspections/records/[recordId]/resolve.ts`).

**Resolve flow:**
```typescript
// 1. User fills memo (required), optionally picks photo
// 2. On submit:
const photoKey = photo.hasPhoto ? await photo.upload() : null
await api.post(`/api/inspections/records/${recordId}/resolve`, {
  resolution_memo: memo,
  resolution_photo_key: photoKey,  // null if no photo
})
// 3. Invalidate queries
queryClient.invalidateQueries({ queryKey: ['remediation'] })
queryClient.invalidateQueries({ queryKey: ['dashboard'] })
// 4. Toast + navigate back
toast.success('조치 완료')
navigate('/remediation')
```

**Source:** `cha-bio-safety/functions/api/inspections/records/[recordId]/resolve.ts` — the existing POST handler accepts `resolution_memo` + `resolution_photo_key`, sets `status='resolved'`, `resolved_by=staffId`, `resolved_at=datetime('now','+9 hours')`.

### Pattern 4: Badge Count Propagation (D-16, D-17)

**What:** Dashboard `unresolved` count from `data?.stats.unresolved` must be passed as a prop/context to BottomNav and SideMenu.

**Current state:** BottomNav and SideMenu receive no count props. SideMenu has `badge: 0` hardcoded in MENU array. BottomNav renders no badge at all on the remediation tab.

**Recommended approach — prop drilling from Layout:**

App.tsx `Layout` function already queries `['dashboard']` data implicitly via DashboardPage. The cleanest Phase 6 approach: lift the unresolved count query to `Layout` level (or a shared `useUnresolvedCount` hook), then pass as prop to BottomNav and SideMenu.

```typescript
// In Layout() — App.tsx
const { data: dashData } = useQuery({
  queryKey: ['dashboard'],
  queryFn: dashboardApi.getStats,
  staleTime: 30_000,
  refetchInterval: 30_000,
})
const unresolvedCount = dashData?.stats.unresolved ?? 0

// Pass to children:
<BottomNav unresolvedCount={unresolvedCount} />
<SideMenu open={sideOpen} onClose={...} unresolvedCount={unresolvedCount} />
```

**Note:** This does NOT double-fetch. React Query caches by key `['dashboard']`; DashboardPage uses the same key, so both consumers share one cached response.

**BottomNav badge render** (per existing badge pattern in SideMenu):
```typescript
// Inside the 'remediation' nav item render
{unresolvedCount > 0 && (
  <span style={{
    position: 'absolute', top: 0, right: 0,
    background: 'var(--danger)', color: '#fff',
    fontSize: 9, fontWeight: 700,
    padding: '1px 4px', borderRadius: 9,
    minWidth: 14, textAlign: 'center',
  }}>
    {unresolvedCount > 99 ? '99+' : unresolvedCount}
  </span>
)}
```

**SideMenu badge:** MENU array is currently a static constant. Must be made dynamic — convert `badge` for '조치 관리' item to be driven by `unresolvedCount` prop.

### Pattern 5: usePhotoUpload Extraction

**Current state:** `usePhotoUpload` hook and `PhotoButton` component are defined as local functions inside `InspectionPage.tsx` (lines 10-80). They are not exported and cannot be imported.

**Required refactor (before implementing detail page):**

1. Create `src/hooks/usePhotoUpload.ts` — move the hook, add named export
2. Create `src/components/PhotoButton.tsx` — move the component, add named export
3. Update `InspectionPage.tsx` to import from new locations
4. Use in `RemediationDetailPage.tsx`

The hook signature is:
```typescript
// Source: cha-bio-safety/src/pages/InspectionPage.tsx lines 10-59
export function usePhotoUpload() {
  // returns: { inputRef, photoPreview, uploading, pickPhoto, handleFile, removePhoto, upload, reset, hasPhoto }
}
```

The `upload()` function calls `POST /api/uploads` (multipart FormData) and returns the R2 key string. This is exactly the mechanism needed for `resolution_photo_key`.

**R2 key for remediation photos:** The upload endpoint at `functions/api/uploads/` determines R2 key format. The CONTEXT says to use `remediation/{recordId}/{timestamp}` — however, the existing upload endpoint likely auto-generates keys. Need to verify if the upload endpoint accepts a custom key prefix or always auto-generates.

### Pattern 6: App.tsx Changes

**Route to add:**
```typescript
// New lazy import
const RemediationDetailPage = lazy(() => import('./pages/RemediationDetailPage'))

// New route (inside Routes)
<Route path="/remediation/:recordId" element={<Auth><RemediationDetailPage /></Auth>} />
```

**NO_NAV_PATHS update** (add detail path):
```typescript
// Current: NO_NAV_PATHS includes '/remediation' is NOT listed (it shows nav)
// Add detail path:
const NO_NAV_PATHS = [
  '/', '/login', '/schedule', '/reports', '/workshift', '/leave',
  '/floorplan', '/div', '/qr-print', '/daily-report',
  '/meal', '/education', '/admin', '/legal-inspection',
  '/remediation/:recordId',  // ADD — detail page hides BottomNav
]
```

**Wait:** React Router's `NO_NAV_PATHS` check uses `pathname.includes()` or exact match. Current code uses `!NO_NAV_PATHS.includes(location.pathname)`. Since `/remediation/:recordId` will be a dynamic path like `/remediation/abc123`, the `includes()` check won't match the pattern string.

**Fix required:** Change NO_NAV_PATHS check to handle prefix matching for the detail route:
```typescript
// Replace:
const showNav = isAuthenticated && !NO_NAV_PATHS.includes(location.pathname)
// With:
const showNav = isAuthenticated && !NO_NAV_PATHS.some(p =>
  location.pathname === p || location.pathname.startsWith(p + '/')
)
// And add '/remediation' to NO_NAV_PATHS for sub-routes... 
```

**Simpler approach:** Keep `/remediation` NOT in NO_NAV_PATHS (list page shows nav). Add a separate startsWith check only for the detail path:
```typescript
const showNav = isAuthenticated
  && !NO_NAV_PATHS.includes(location.pathname)
  && !location.pathname.match(/^\/remediation\/.+/)
```

**PAGE_TITLES update:**
```typescript
const PAGE_TITLES: Record<string, string> = {
  // ... existing
  '/remediation': '조치 관리',  // already present
  // Detail page uses its own internal header (D-07), not GlobalHeader
}
```

### Anti-Patterns to Avoid

- **Querying photo URL directly from R2 key in frontend:** The existing pattern fetches photos via `/api/uploads/:key` (public endpoint). Always use the API route, not direct R2 URLs.
- **Allowing resolve on already-resolved records:** The detail page must check `status === 'open'` before showing the resolve button (D-08). The API also enforces this (though currently only implicitly via overwrite).
- **Hardcoding category list in filter dropdown:** Claude's discretion favors dynamic DB query — safer than hardcoding since check_points categories can change. Use a simple `SELECT DISTINCT category FROM check_points WHERE is_active=1 ORDER BY category` query, either as part of the list API response or as a separate lightweight endpoint.
- **Forgetting to invalidate both ['remediation'] and ['dashboard'] after resolve:** Failing to invalidate dashboard will leave stale badge counts.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Photo capture/compress/upload | Custom file upload flow | `usePhotoUpload` hook (extract from InspectionPage) | Already handles camera/gallery, blob URL management, FormData upload, loading state |
| Image compression | Canvas resize logic | `compressImage(file)` from `imageUtils.ts` | Already handles scale, JPEG quality, URL revocation |
| API request + auth | Custom fetch wrappers | `api.post()`, `api.get()` from `utils/api.ts` | Injects JWT, handles 401 auto-logout, normalizes response |
| Server state cache | Manual fetch + useState | `useQuery` / `useMutation` from React Query | Auto-dedup, stale-time, invalidation, loading states |
| Toast notifications | Custom alert/modal | `toast.success()` / `toast.error()` from react-hot-toast | Project standard, already styled |
| Status change API | New resolve endpoint | `POST /api/inspections/records/:recordId/resolve` | Already implemented, production-ready |

---

## Common Pitfalls

### Pitfall 1: NO_NAV_PATHS Does Not Support Wildcards
**What goes wrong:** Adding `/remediation/:recordId` to NO_NAV_PATHS literally — the `includes()` check never matches dynamic paths like `/remediation/abc-123`.
**Why it happens:** NO_NAV_PATHS uses exact string matching via `Array.includes()`.
**How to avoid:** Use a regex match or `startsWith` check for the detail route. See Pattern 6 above for the correct code.
**Warning signs:** BottomNav appears on the detail page during testing.

### Pitfall 2: Double-Fetching Dashboard Stats
**What goes wrong:** Adding a new `useQuery(['dashboard'])` call in Layout causes an extra API hit on top of DashboardPage's own query.
**Why it happens:** Misunderstanding React Query deduplication behavior.
**How to avoid:** React Query deduplicates requests with the same key within the same staleTime window. A second `useQuery(['dashboard'])` in Layout will share the in-flight request and cached data — NO extra API call is made. This is the correct pattern.
**Warning signs:** None — this pattern is safe.

### Pitfall 3: Photo Upload Returns Null Silently
**What goes wrong:** `usePhotoUpload.upload()` returns `null` if `photoBlob` is null, but also if the upload API call fails. The difference is not surfaced to the user.
**Why it happens:** The existing hook has a single return path (`return json.success ? json.data!.key : null`).
**How to avoid:** In the resolve submit handler, check `photo.hasPhoto && photoKey === null` and show an error toast before attempting to call the resolve API.

### Pitfall 4: Status Field Inconsistency (NULL vs 'open')
**What goes wrong:** Old records before migration 0012 may have `status = NULL`. The DB default is `'open'` but existing records might have slipped through.
**Why it happens:** `DEFAULT 'open'` only applies to new inserts after the migration.
**How to avoid:** The resolve.ts API already handles this (it does a direct `UPDATE WHERE id=?` regardless of current status). The list query in the new endpoint must treat `NULL` as `'open'`: `WHERE (r.status IS NULL OR r.status = 'open')` for the open filter. This pattern is already used in stats.ts (lines 74-79) and should be copied exactly.

### Pitfall 5: SideMenu MENU Array Is a Module-Level Constant
**What goes wrong:** Badge count for '조치 관리' is hardcoded as `badge: 0` in a `const MENU = [...]` at module scope. It cannot be updated at runtime without a prop-based approach.
**Why it happens:** The current design baked badges into the static array for simplicity.
**How to avoid:** Pass `unresolvedCount` prop to SideMenu and apply it when rendering the '조치 관리' item specifically (match by path `/remediation`), rather than trying to mutate the MENU constant.

### Pitfall 6: Location Text Must Be "동→층" Order
**What goes wrong:** Rendering location as "B2층 사무동" instead of "사무동 B2층".
**Why it happens:** `zone` and `floor` fields are separate in check_points; natural alphabetical sort puts floor before zone.
**How to avoid:** Always render as `{buildingName(record.zone)} {record.floor}` — user made this an explicit requirement. Define a helper:
```typescript
const ZONE_LABEL: Record<string, string> = { office: '사무동', research: '연구동', common: '공용' }
// Usage: `${ZONE_LABEL[record.zone] ?? record.zone} ${record.floor}`
```

### Pitfall 7: R2 Key Format for Remediation Photos
**What goes wrong:** Expecting `remediation/{recordId}/{timestamp}` key to be set automatically by the upload endpoint, but the existing `/api/uploads` handler may auto-generate its own key format.
**Why it happens:** CONTEXT.md D-13 specifies the key format but the upload endpoint logic controls the actual key.
**How to avoid:** Read `functions/api/uploads/index.ts` (not yet read in this research) to confirm whether it accepts a custom key or auto-generates. If auto-generating, the key will differ from `remediation/{recordId}/{timestamp}` — this is fine as long as the returned key is stored in `resolution_photo_key`. The key format only matters for organization in R2, not for functionality.

---

## Code Examples

### New API Endpoint Structure
```typescript
// Source: established pattern from functions/api/inspections/records.ts
// File: functions/api/remediation/index.ts
import type { Env } from '../../_middleware'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url      = new URL(request.url)
  const status   = url.searchParams.get('status')   // 'open' | 'resolved' | null
  const category = url.searchParams.get('category') // string | null
  const days     = parseInt(url.searchParams.get('days') ?? '30', 10)

  const conditions: string[] = [`r.result IN ('bad','caution')`]
  const bindings: unknown[] = []

  if (status === 'open')     { conditions.push(`(r.status IS NULL OR r.status = 'open')`) }
  if (status === 'resolved') { conditions.push(`r.status = 'resolved'`) }
  if (category)              { conditions.push(`cp.category = ?`); bindings.push(category) }
  if (days > 0)              { conditions.push(`date(r.checked_at) >= date('now','+9 hours','-${days} days')`) }

  const sql = `
    SELECT r.id, r.result, r.memo, r.photo_key,
           r.status, r.resolution_memo, r.resolution_photo_key,
           r.resolved_at, r.resolved_by, r.checked_at, r.staff_id,
           cp.category, cp.location, cp.floor, cp.zone,
           s.name AS staff_name
    FROM check_records r
    JOIN check_points cp ON cp.id = r.checkpoint_id
    LEFT JOIN staff s ON s.id = r.staff_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY r.checked_at DESC
  `

  const result = await env.DB.prepare(sql).bind(...bindings).all<Record<string, unknown>>()
  const rows = (result.results ?? []).map(r => ({
    id: r.id, result: r.result, memo: r.memo, photoKey: r.photo_key,
    status: r.status ?? 'open',
    resolutionMemo: r.resolution_memo, resolutionPhotoKey: r.resolution_photo_key,
    resolvedAt: r.resolved_at, resolvedBy: r.resolved_by,
    checkedAt: r.checked_at, staffId: r.staff_id, staffName: r.staff_name,
    category: r.category, location: r.location, floor: r.floor, zone: r.zone,
  }))

  return Response.json({ success: true, data: rows })
}
```

### React Query Usage in RemediationPage
```typescript
// Source: established pattern from DashboardPage.tsx
const { data, isLoading } = useQuery({
  queryKey: ['remediation', statusTab, categoryFilter, days],
  queryFn: () => remediationApi.list({ status: statusTab, category: categoryFilter, days }),
  staleTime: 30_000,
  refetchOnWindowFocus: true,
})
```

### Resolve Submit Handler
```typescript
// Source: pattern from InspectionPage.tsx + resolve.ts API
const handleResolve = async () => {
  if (!memo.trim()) { toast.error('조치 내용을 입력하세요'); return }
  try {
    setSubmitting(true)
    let photoKey: string | null = null
    if (photo.hasPhoto) {
      photoKey = await photo.upload()
      if (photoKey === null) { toast.error('사진 업로드 실패'); return }
    }
    await api.post(`/api/inspections/records/${recordId}/resolve`, {
      resolution_memo: memo.trim(),
      resolution_photo_key: photoKey,
    })
    queryClient.invalidateQueries({ queryKey: ['remediation'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    toast.success('조치 완료')
    navigate('/remediation')
  } catch {
    toast.error('조치 처리 실패')
  } finally {
    setSubmitting(false)
  }
}
```

### Dynamic Category List Query
```typescript
// Recommendation: Claude's Discretion — dynamic DB query
// As part of GET /api/remediation response, include categories:
const cats = await env.DB.prepare(
  `SELECT DISTINCT category FROM check_points WHERE is_active=1 ORDER BY category`
).all<{ category: string }>()

// Return in same response:
return Response.json({
  success: true,
  data: { records: rows, categories: cats.results?.map(r => r.category) ?? [] }
})
```

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| check_records had no resolution tracking | migration 0012 added status, resolution_memo, resolution_photo_key, resolved_at, resolved_by | Already applied at migration 0012 |
| RemediationPage was placeholder | Full implementation in this phase | Replace placeholder |

---

## Open Questions

1. **Upload endpoint key format**
   - What we know: CONTEXT D-13 specifies `remediation/{recordId}/{timestamp}` as the R2 key format
   - What's unclear: Whether `functions/api/uploads/index.ts` accepts a custom key prefix or auto-generates keys
   - Recommendation: Read uploads handler during planning/execution. If auto-generates, the key format will differ from D-13 spec but functionality is unaffected — the returned key is what gets stored. If custom prefix is supported, pass it during upload.

2. **Single-record detail API — index.ts extension vs new [recordId].ts file**
   - What we know: Detail page needs to fetch one record by ID
   - What's unclear: Whether to add `id` param to GET /api/remediation or create separate `functions/api/remediation/[recordId].ts`
   - Recommendation: Create separate `[recordId].ts` file — consistent with project routing pattern (`records/[recordId]/resolve.ts`) and avoids overloading the list endpoint.

3. **Photo display in detail page — pre-signed URL vs proxy**
   - What we know: R2 photos are served via `/api/uploads/:key` (PUBLIC_PREFIX in middleware)
   - What's unclear: Whether public access to uploaded files is already working or requires an additional route in the uploads handler
   - Recommendation: Verify by inspecting `functions/api/uploads/` directory structure during planning. The middleware PUBLIC_PREFIX `/api/uploads/` allows unauthenticated access — photo display should work as `<img src={/api/uploads/${photoKey}} />`.

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — this is a pure code change within the existing Cloudflare + React stack already deployed)

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no test config files found in project |
| Config file | None (no jest.config.*, vitest.config.*, pytest.ini) |
| Quick run command | `npm run build` (TypeScript compile check) |
| Full suite command | `npm run build` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REM-01 | GET /api/remediation returns bad/caution records | smoke | `npm run build` (type check) | ❌ Wave 0 |
| REM-02 | Resolve form submits to existing API, updates status | smoke | `npm run build` (type check) | ❌ Wave 0 |
| REM-03 | Photo upload completes and key stored | manual | Visual verification on device | manual-only |
| REM-04 | Filter params produce correct subset | smoke | `npm run build` (type check) | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run build`
- **Per wave merge:** `npm run build`
- **Phase gate:** Build green + manual smoke test on mobile before `/gsd:verify-work`

### Wave 0 Gaps
- No test framework is installed — TypeScript build serves as compile-time verification only
- Manual smoke testing required for: filter combinations, photo upload, badge count updates, resolve flow, navigation back from detail page

*(No automated test files to create — project has no test infrastructure)*

---

## Sources

### Primary (HIGH confidence)
- `/cha-bio-safety/migrations/0012_check_records_resolution.sql` — DB schema for resolution columns
- `/cha-bio-safety/migrations/0013_photo_keys.sql` — resolution_photo_key column confirmed
- `/cha-bio-safety/functions/api/inspections/records/[recordId]/resolve.ts` — resolve API full implementation
- `/cha-bio-safety/functions/api/dashboard/stats.ts` lines 74-79 — unresolved count query pattern
- `/cha-bio-safety/src/pages/InspectionPage.tsx` lines 10-80 — usePhotoUpload hook + PhotoButton component source
- `/cha-bio-safety/src/pages/RemediationPage.tsx` — confirmed placeholder state
- `/cha-bio-safety/src/components/BottomNav.tsx` — confirmed no badge rendering on remediation tab
- `/cha-bio-safety/src/components/SideMenu.tsx` — confirmed badge: 0 hardcoded, prop-less
- `/cha-bio-safety/src/App.tsx` — confirmed NO_NAV_PATHS, route structure, Layout component
- `/cha-bio-safety/src/utils/api.ts` — api.get/post patterns, dashboardApi shape
- `/cha-bio-safety/src/types/index.ts` — DashboardStats.unresolved confirmed

### Secondary (MEDIUM confidence)
- `.planning/phases/06-remediation-tracking/06-CONTEXT.md` — all locked decisions (D-01 through D-17)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in project, verified by package.json
- DB schema: HIGH — migration files read directly
- Existing API reuse: HIGH — resolve.ts and stats.ts read in full
- Architecture patterns: HIGH — based on direct code inspection of parallel implementations
- Photo upload pattern: HIGH — usePhotoUpload hook read in full from InspectionPage.tsx
- Badge propagation: HIGH — BottomNav and SideMenu source read; exact code changes identified
- App.tsx routing: HIGH — NO_NAV_PATHS pitfall confirmed by reading actual implementation

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stable stack, no fast-moving dependencies)
