# Phase 24: 소화기 자산-위치 분리 - Pattern Map

**Mapped:** 2026-04-30
**Files analyzed:** 16 (5 new, 11 modified)
**Analogs found:** 16 / 16 (every new file has a strong analog already in `cha-bio-safety/`)

---

## File Classification

| New / Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `cha-bio-safety/migrations/0079_extinguisher_asset_split.sql` | migration (DDL + backfill) | batch | `cha-bio-safety/migrations/0078_marker_description_sync.sql` | exact (ALTER + UPDATE in single file) |
| `cha-bio-safety/functions/api/extinguishers/[id].ts` | controller (PUT ≤3 + DELETE) | request-response, transaction | `cha-bio-safety/functions/api/check-points/[id].ts` (PUT) + `cha-bio-safety/functions/api/floorplan-markers/[id].ts` (DELETE batch) | exact (per verb) |
| `cha-bio-safety/functions/api/extinguishers/[id]/assign.ts` | controller (POST) | request-response, transaction | `cha-bio-safety/functions/api/floorplan-markers/[id].ts` onRequestDelete (validate + run UPDATE) | role-match |
| `cha-bio-safety/functions/api/extinguishers/[id]/unassign.ts` | controller (POST) | request-response, transaction | same as assign | role-match |
| `cha-bio-safety/functions/api/extinguishers/[id]/swap.ts` | controller (POST, atomic batch) | request-response, transaction | `cha-bio-safety/functions/api/floorplan-markers/[id].ts` lines 64-71 (env.DB.batch) | exact (D1 batch atomic) |
| `cha-bio-safety/functions/api/extinguishers/[id]/dispose.ts` | controller (POST, soft-delete) | request-response | `cha-bio-safety/functions/api/check-points/[id].ts` (willDeactivate cascade idea, but soft) | role-match |
| `cha-bio-safety/functions/api/extinguishers/index.ts` (extend) | controller (GET list + filters) | request-response, query-builder | self (existing file — extend in place) | exact |
| `cha-bio-safety/functions/api/extinguishers/create.ts` (extend) | controller (POST create) | request-response, batch INSERT | self (existing file — add `skip_marker` mode) | exact |
| `cha-bio-safety/functions/api/inspections/[sessionId]/records.ts` (extend) | controller (POST INSERT/UPDATE) | request-response, transactional snapshot | self (existing file — add ext_id snapshot SELECT before INSERT) | exact |
| `cha-bio-safety/src/utils/api.ts` (extend) | client API wrapper | request-response | self (existing `extinguisherApi` namespace — extend) | exact |
| `cha-bio-safety/src/pages/ExtinguishersListPage.tsx` | page (list + filters + modals) | CRUD via React Query | `cha-bio-safety/src/pages/RemediationPage.tsx` + `cha-bio-safety/src/pages/InspectionPage.tsx` ExtinguisherListOverlay (lines 3465-3637) | exact (RemediationPage filter bar + cards + desktop split + ExtinguisherListOverlay shape) |
| `cha-bio-safety/src/pages/FloorPlanPage.tsx` (modify) | page (marker editor + inspection) | event-driven, request-response | self | exact |
| `cha-bio-safety/src/pages/InspectionPage.tsx` (modify) | page (category-grouped checkpoints) | request-response | self (existing header + extDetail card) | exact |
| `cha-bio-safety/src/components/SideMenu.tsx` (modify) | nav data | static config | self (Phase 21 `/documents` addition pattern at line 39) | exact |
| `cha-bio-safety/src/components/DesktopSidebar.tsx` (modify) | nav data | static config | self (DESKTOP_SECTIONS lines 8-13) | exact |
| `cha-bio-safety/src/App.tsx` (modify) | route registration | static config | self (existing Routes block lines 220-249) | exact |

---

## Pattern Assignments

### `migrations/0079_extinguisher_asset_split.sql` (migration, batch DDL+UPDATE)

**Analog:** `cha-bio-safety/migrations/0078_marker_description_sync.sql` (ALTER + UPDATE + TRIGGER in one file). Also `migrations/0072_floor_plan_markers_description.sql` for plain ALTER.

**File header convention** (from `0078`, lines 1-8):
```sql
-- Migration 0078: floor_plan_markers.description 을 check_points.description 과 자동 동기화
--
-- 1) 기존 24개 마커 description 일회 동기화 (cp.description 그대로 복사)
-- 2) AFTER UPDATE 트리거 생성 — 향후 cp.description 변경 시 자동 동기화
--
-- 도면 페이지의 isAccessBlocked 체크가 selected.description (= marker description) 을
-- 보기 때문에, cp.description 의 '접근불가' 라벨이 마커에도 반영되어야 팝업이 뜬다.
```

**ALTER pattern** (from `0072`, line 14):
```sql
ALTER TABLE floor_plan_markers ADD COLUMN description TEXT;
```

**Backfill UPDATE pattern** (from `0078`, lines 9-14):
```sql
UPDATE floor_plan_markers
SET description = (SELECT description FROM check_points WHERE id = floor_plan_markers.check_point_id),
    updated_at = datetime('now')
WHERE check_point_id IS NOT NULL
  AND description IS DISTINCT FROM (SELECT description FROM check_points WHERE id = floor_plan_markers.check_point_id);
```

**Index naming convention** (from existing `0035_extinguishers.sql`, lines 22-23):
```sql
CREATE INDEX idx_extinguishers_cp ON extinguishers(check_point_id);
CREATE INDEX idx_extinguishers_mgmt ON extinguishers(mgmt_no);
```
→ For Phase 24, follow the `idx_<table>_<columns>` style: `idx_extinguishers_status`, `idx_extinguishers_cp_active`, `idx_check_records_ext`. Use `IF NOT EXISTS` (already proven in `0073_add_telemetry_events.sql` line 17).

**Section divider style** (from `0078` lines 9, 16):
```sql
-- ── 1) 일회 동기화 ──────────────────────────────────────
-- ── 2) 자동 동기화 트리거 ──────────────────────────────
```
→ Use the same `── N) Title ────` style for the four sections of `0079` (status add / extinguisher_id add / indexes / backfill).

---

### `functions/api/extinguishers/[id].ts` (controller, PUT + DELETE)

**Analog (PUT branch):** `cha-bio-safety/functions/api/check-points/[id].ts` lines 1-81.

**Imports + handler signature** (from `check-points/[id].ts` lines 1-7):
```typescript
import type { Env } from '../../_middleware'

// ── CheckPoint 수정 ───────────────────────────────────────

export const onRequestPut: PagesFunction<Env> = async (ctx) => {
  const { request, env, params } = ctx
  const data = ctx as any
```
→ For Phase 24 the path is one level deeper (`functions/api/extinguishers/[id].ts` → `import type { Env } from '../../_middleware'`) — same depth as `check-points/[id].ts`. Use the same import.

**Existence-then-update pattern** (from `check-points/[id].ts` lines 19-21):
```typescript
const existing = await env.DB.prepare('SELECT id FROM check_points WHERE id = ?1').bind(id).first()
if (!existing)
  return Response.json({ success: false, error: '점검포인트를 찾을 수 없습니다' }, { status: 404 })
```

**≤3-field validation pattern** (RESEARCH.md §Pattern 3 + project convention norm):
```typescript
const norm = (v: any) => (v === '' || v === undefined) ? null : v
const fields = ['type','prefix_code','seal_no','serial_no','approval_no','manufactured_at','manufacturer'] as const
let changed = 0
for (const f of fields) {
  if (norm((body as any)[f]) !== norm((existing as any)[f])) changed++
}
if (changed > 3) return Response.json({success:false, error:'한 번에 최대 3개 필드까지만 변경 가능합니다'}, {status:400})
```

**Dynamic SET-clause pattern** (from `floorplan-markers/[id].ts` lines 16-37):
```typescript
const sets: string[] = []
const binds: unknown[] = []
if (body.x_pct != null) { sets.push('x_pct=?'); binds.push(body.x_pct) }
// …
if (sets.length === 0) {
  return Response.json({ success: false, error: '수정할 항목이 없습니다' }, { status: 400 })
}
sets.push("updated_at=datetime('now','+9 hours')")
binds.push(id)
await env.DB.prepare(
  `UPDATE floor_plan_markers SET ${sets.join(', ')} WHERE id=?`
).bind(...binds).run()
return Response.json({ success: true })
```
→ Adapt to `extinguishers` table.

**Analog (DELETE branch):** `cha-bio-safety/functions/api/floorplan-markers/[id].ts` lines 49-77.

**Hard-delete with guards pattern** (custom for Phase 24 — uses the same handler shape):
```typescript
export const onRequestDelete: PagesFunction<Env> = async ({ params, env }) => {
  const id = parseInt(params.id as string, 10)
  if (!Number.isFinite(id)) return Response.json({success:false, error:'잘못된 ID'}, {status:400})

  // 가드 1: 매핑된 자산은 삭제 금지
  const ext = await env.DB.prepare('SELECT id, check_point_id FROM extinguishers WHERE id=?').bind(id).first<{id:number;check_point_id:string|null}>()
  if (!ext) return Response.json({success:false, error:'자산 없음'}, {status:404})
  if (ext.check_point_id) return Response.json({success:false, error:'매핑된 자산은 삭제할 수 없습니다 — 먼저 분리하세요'}, {status:409})

  // 가드 2: 점검 기록이 있으면 삭제 금지 (폐기로 유도)
  const recCount = await env.DB.prepare('SELECT COUNT(*) as c FROM check_records WHERE extinguisher_id=?').bind(id).first<{c:number}>()
  if ((recCount?.c ?? 0) > 0) return Response.json({success:false, error:'점검 기록이 있는 자산은 삭제할 수 없습니다 — 폐기를 사용하세요'}, {status:409})

  await env.DB.prepare('DELETE FROM extinguishers WHERE id=?').bind(id).run()
  return Response.json({success:true})
}
```

**Error handling pattern** (from `check-points/[id].ts` lines 77-80):
```typescript
} catch (e) {
  console.error('check-point update error:', e)
  return Response.json({ success: false, error: '서버 오류가 발생했습니다' }, { status: 500 })
}
```

---

### `functions/api/extinguishers/[id]/assign.ts` (controller, POST)

**Analog:** `cha-bio-safety/functions/api/floorplan-markers/[id].ts` lines 49-77 (param validate → existence check → DB write).

**Full pattern** (RESEARCH.md §Example 2 — already proven against project style):
```typescript
import type { Env } from '../../../_middleware'

export const onRequestPost: PagesFunction<Env> = async ({ params, request, env }) => {
  const id = parseInt(params.id as string, 10)
  if (!Number.isFinite(id)) return Response.json({ success:false, error:'잘못된 자산 ID' }, { status:400 })

  const { check_point_id } = await request.json<{ check_point_id: string }>()
  if (!check_point_id) return Response.json({ success:false, error:'check_point_id 필수' }, { status:400 })

  // 1) 자산 상태 검증
  const ext = await env.DB.prepare('SELECT id, check_point_id, status FROM extinguishers WHERE id=?')
    .bind(id).first<{ id:number; check_point_id:string|null; status:string }>()
  if (!ext) return Response.json({ success:false, error:'자산 없음' }, { status:404 })
  if (ext.status === '폐기') return Response.json({ success:false, error:'폐기된 자산은 매핑할 수 없습니다' }, { status:409 })
  if (ext.check_point_id) return Response.json({ success:false, error:'이미 매핑된 자산입니다 — 먼저 분리하세요' }, { status:409 })

  // 2) 위치 충돌 검증
  const occupant = await env.DB.prepare(
    "SELECT id FROM extinguishers WHERE check_point_id=? AND status='active'"
  ).bind(check_point_id).first<{ id:number }>()
  if (occupant) {
    return Response.json({
      success:false,
      error:'해당 위치에 이미 매핑된 자산이 있습니다',
      data: { occupantId: occupant.id, hint: 'swap' }
    }, { status:409 })
  }

  // 3) check_points 존재 검증
  const cp = await env.DB.prepare('SELECT id FROM check_points WHERE id=? AND is_active=1').bind(check_point_id).first()
  if (!cp) return Response.json({ success:false, error:'점검 개소 없음' }, { status:404 })

  // 4) UPDATE — updated_at은 KST (+9h) 컨벤션
  await env.DB.prepare("UPDATE extinguishers SET check_point_id=?, updated_at=datetime('now','+9 hours') WHERE id=?")
    .bind(check_point_id, id).run()

  return Response.json({ success:true })
}
```

**Note on `updated_at`:** Use `datetime('now','+9 hours')` to match `floorplan-markers/[id].ts` line 32 — the codebase mixes `datetime('now')` (older) and `datetime('now','+9 hours')` (newer KST-aware). Phase 24 should follow the newer KST convention.

---

### `functions/api/extinguishers/[id]/unassign.ts` (controller, POST)

**Analog:** Same as `assign.ts` (validate → UPDATE).

**Pattern:** Idempotent UPDATE setting `check_point_id=NULL`, status untouched.
```typescript
import type { Env } from '../../../_middleware'

export const onRequestPost: PagesFunction<Env> = async ({ params, env }) => {
  const id = parseInt(params.id as string, 10)
  if (!Number.isFinite(id)) return Response.json({ success:false, error:'잘못된 ID' }, { status:400 })

  const ext = await env.DB.prepare('SELECT id, check_point_id, status FROM extinguishers WHERE id=?').bind(id).first<{id:number;check_point_id:string|null;status:string}>()
  if (!ext) return Response.json({ success:false, error:'자산 없음' }, { status:404 })
  if (ext.check_point_id == null) return Response.json({ success:true, data:{ noop:true } })  // idempotent

  await env.DB.prepare("UPDATE extinguishers SET check_point_id=NULL, updated_at=datetime('now','+9 hours') WHERE id=?")
    .bind(id).run()
  return Response.json({ success:true })
}
```

---

### `functions/api/extinguishers/[id]/swap.ts` (controller, POST, atomic batch)

**Analog:** `cha-bio-safety/functions/api/floorplan-markers/[id].ts` lines 64-71 — D1 `env.DB.batch([...])` atomic transaction.

**D1 batch pattern (LOCKED — quoted from analog line 64-71):**
```typescript
// D1 batch 는 atomic — 한 statement 실패 시 전체 롤백 (Cloudflare 공식 트랜잭션 의미론).
await env.DB.batch([
  env.DB.prepare('DELETE FROM floor_plan_markers WHERE id=?').bind(id),
  env.DB.prepare('DELETE FROM extinguishers WHERE check_point_id=?').bind(cpId),
  env.DB.prepare('UPDATE check_points SET is_active=0 WHERE id=?').bind(cpId),
])
```

**Phase 24 swap (RESEARCH.md §Example 3 — adapts the batch pattern):**
```typescript
// 동일 시그니처 — 두 UPDATE atomic 처리
await env.DB.batch([
  env.DB.prepare("UPDATE extinguishers SET check_point_id=?, updated_at=datetime('now','+9 hours') WHERE id=?")
    .bind(b.check_point_id, a.id),
  env.DB.prepare("UPDATE extinguishers SET check_point_id=?, updated_at=datetime('now','+9 hours') WHERE id=?")
    .bind(a.check_point_id, b.id),
])
```

---

### `functions/api/extinguishers/[id]/dispose.ts` (controller, POST, soft-delete)

**Analog:** `cha-bio-safety/functions/api/check-points/[id].ts` lines 50-55 (willDeactivate cascade) — but Phase 24 keeps `extinguishers` row, only flips status.

**Idempotent dispose pattern:**
```typescript
import type { Env } from '../../../_middleware'

export const onRequestPost: PagesFunction<Env> = async ({ params, env }) => {
  const id = parseInt(params.id as string, 10)
  if (!Number.isFinite(id)) return Response.json({ success:false, error:'잘못된 ID' }, { status:400 })

  const ext = await env.DB.prepare('SELECT id, status FROM extinguishers WHERE id=?').bind(id).first<{id:number;status:string}>()
  if (!ext) return Response.json({ success:false, error:'자산 없음' }, { status:404 })
  if (ext.status === '폐기') return Response.json({ success:true, data:{ noop:true } })  // idempotent

  await env.DB.prepare("UPDATE extinguishers SET status='폐기', check_point_id=NULL, updated_at=datetime('now','+9 hours') WHERE id=?")
    .bind(id).run()
  return Response.json({ success:true })
}
```

**Critical:** `check_records` is NEVER deleted — already locked by codebase convention at `floorplan-markers/[id].ts` line 48 ("절대 금지: check_records 는 어떤 분기에서도 삭제하지 않는다"). Apply this comment verbatim in dispose.ts header.

---

### `functions/api/extinguishers/index.ts` (extend GET — add filters + JOIN)

**Analog:** Self (existing `cha-bio-safety/functions/api/extinguishers/index.ts` lines 1-44).

**Existing filter-builder pattern** (lines 9-17):
```typescript
let sql = `SELECT e.*, cp.id as cp_id FROM extinguishers e JOIN check_points cp ON e.check_point_id = cp.id WHERE 1=1`
const params: string[] = []

if (floor) { sql += ` AND e.floor = ?`; params.push(floor) }
if (zone) { sql += ` AND e.zone = ?`; params.push(zone) }
if (type) { sql += ` AND e.type = ?`; params.push(type) }
if (search) { sql += ` AND (e.serial_no LIKE ? OR e.mgmt_no LIKE ?)`; params.push(`%${search}%`, `%${search}%`) }

sql += ` ORDER BY e.seq_no ASC`
```

**Required Phase 24 changes** (RESEARCH.md §Example 5 — extension):
1. Change `JOIN` → `LEFT JOIN` so unmapped extinguishers (`check_point_id IS NULL`) appear in the list.
2. Add `cp.location, cp.floor, cp.zone, cp.qr_code` to the SELECT.
3. Add `?status=` and `?mapping=mapped|unmapped|disposed` query params.
4. Keep response shape `{items, stats, zones, floors, total}` (lines 34-43) — extend `items` rows with new `cp_*` fields and `status`. Frontend types in `src/utils/api.ts` `ExtinguisherListResponse` (lines 215-221) update accordingly.

---

### `functions/api/extinguishers/create.ts` (extend — add `skip_marker` mode)

**Analog:** Self (existing file lines 1-93). Existing `env.DB.batch([INSERT check_points, INSERT extinguishers])` pattern at lines 72-89 stays.

**Phase 24 mode addition:** Accept optional `skip_marker: true` from list-page registration. When true:
- Skip `check_points` INSERT.
- Skip mgmt_no/qr_code derivation (those are location-bound, not asset-bound).
- INSERT only into `extinguishers` with `check_point_id=NULL`, `status='active'`.
- Return `{ extinguisherId: nextSeq }` instead of `{ checkPointId, mgmtNo }`.

**Branching pattern** (from existing logic at line 19-21 — copy required-field check style):
```typescript
if (!body.floor || !body.zone || !body.location || !body.type)
  return Response.json({ success: false, error: '필수 항목 누락' }, { status: 400 })
```
→ For `skip_marker` branch, only `body.type` is required.

**Deprecation note:** RESEARCH.md A6 — keep existing marker+ext branch for now; the FloorPlan add-marker flow that calls it will be removed in Phase 24, but the endpoint stays for backward compat.

---

### `functions/api/inspections/[sessionId]/records.ts` (extend — add ext_id snapshot)

**Analog:** Self (existing file lines 1-52).

**Existing INSERT pattern** (lines 42-46):
```typescript
const id = nanoid()
await env.DB.prepare(
  `INSERT INTO check_records (id,session_id,checkpoint_id,staff_id,result,memo,photo_key,guide_light_type,floor_plan_marker_id,checked_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,datetime('now','+9 hours'),datetime('now','+9 hours'))`
).bind(id, sessionId, checkpointId, staffId, result, memo??null, photoKey??null, guide_light_type??null, floor_plan_marker_id??null).run()
```

**Phase 24 extension** (RESEARCH.md §Pitfall 5 — server-side resolves current ext_id ignoring client value):
```typescript
// 소화기 카테고리면 INSERT/UPDATE 직전에 현재 매핑된 active ext_id 를 SELECT 해서 스냅샷
let extinguisherId: number | null = null
if (cp?.category === '소화기') {
  const currentExt = await env.DB.prepare(
    "SELECT id FROM extinguishers WHERE check_point_id=? AND status='active' LIMIT 1"
  ).bind(checkpointId).first<{id:number}>()
  extinguisherId = currentExt?.id ?? null
}

// 그리고 INSERT 컬럼 + bind 에 extinguisher_id 추가:
//   `... ,floor_plan_marker_id,extinguisher_id,checked_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,datetime('now','+9 hours'),datetime('now','+9 hours'))`
//   .bind(id, sessionId, checkpointId, staffId, result, memo??null, photoKey??null, guide_light_type??null, floor_plan_marker_id??null, extinguisherId, ...)
```

---

### `src/utils/api.ts` (extend `extinguisherApi` namespace)

**Analog:** Self (existing namespace lines 200-241).

**Imports / interfaces convention** (lines 200-221):
```typescript
export interface ExtinguisherDetail {
  mgmt_no: string
  zone: string
  floor: string
  // …
}

export interface ExtinguisherListResponse {
  items: (ExtinguisherDetail & { seq_no: number; cp_id: string })[]
  stats: { type: string; cnt: number }[]
  zones: string[]
  floors: string[]
  total: number
}

export const extinguisherApi = {
  getDetail: (checkPointId: string) =>
    api.get<ExtinguisherDetail | null>(`/extinguishers/${checkPointId}`),
  list: (params?: { floor?: string; zone?: string; type?: string; q?: string }) => {
    const qs = new URLSearchParams()
    if (params?.floor) qs.set('floor', params.floor)
    // …
    return api.get<ExtinguisherListResponse>(`/extinguishers${q ? '?' + q : ''}`)
  },
  create: (data: { … }) => api.post<{ checkPointId: string; mgmtNo: string }>('/extinguishers/create', data),
}
```

**Phase 24 additions** (must follow same shape — RESEARCH.md §Component Responsibilities):
```typescript
// ExtinguisherListResponse 확장:
//   items 행에 status: 'active' | '폐기',
//                cp_location: string | null, cp_floor: string | null, cp_zone: string | null,
//                cp_qr_code: string | null 추가.
//   list 메서드 params 에 status?: string, mapping?: 'mapped'|'unmapped'|'disposed' 추가.

// 새 메서드 (api.put / api.post / api.delete 활용):
update:    (id: number, data: Partial<ExtinguisherDetail>) => api.put<void>(`/extinguishers/${id}`, data),
assign:    (id: number, checkPointId: string)             => api.post<void>(`/extinguishers/${id}/assign`,   { check_point_id: checkPointId }),
unassign:  (id: number)                                    => api.post<void>(`/extinguishers/${id}/unassign`, {}),
swap:      (id: number, otherId: number)                   => api.post<void>(`/extinguishers/${id}/swap`,     { other_extinguisher_id: otherId }),
dispose:   (id: number)                                    => api.post<void>(`/extinguishers/${id}/dispose`,  {}),
remove:    (id: number)                                    => api.delete<void>(`/extinguishers/${id}`),
```
→ Use `remove` (not `delete`) to match existing `documentsApi.remove` convention at line 522.

**Error/auth handling:** All methods automatically inherit 401-auto-logout + ApiError throw via `req<T>` (lines 31-68). No additional code needed.

---

### `src/pages/ExtinguishersListPage.tsx` (NEW)

**Analog A (page shell + filter bar + card list + desktop split):** `cha-bio-safety/src/pages/RemediationPage.tsx` lines 114-567.

**Analog B (extinguisher-specific list with filter chips + card detail toggle):** `cha-bio-safety/src/pages/InspectionPage.tsx` ExtinguisherListOverlay function lines 3465-3637.

**Page imports + hooks pattern** (from RemediationPage lines 1-9):
```typescript
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { extinguisherApi } from '../utils/api'
import { useIsDesktop } from '../hooks/useIsDesktop'
import toast from 'react-hot-toast'
```
→ Phase 24 adds `useMutation, useQueryClient` for assign/unassign/swap/dispose/update/delete.

**Query pattern** (RemediationPage lines 126-135):
```typescript
const { data, isLoading, isError } = useQuery({
  queryKey: ['remediation', statusTab, categoryFilter, days],
  queryFn: () => remediationApi.list({ … }),
  staleTime: 30_000,
  refetchOnWindowFocus: true,
})
```

**Filter bar — status chip row** (RemediationPage lines 211-222):
```tsx
<div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--bd)', flexShrink: 0 }}>
  <div style={{ display: 'flex' }}>
    {STATUS_TABS.map(tab => (
      <button key={tab.key} onClick={() => setStatusTab(tab.key)}
        style={{ flex: 1, height: 44, border: 'none',
          background: statusTab === tab.key ? 'var(--bg4)' : 'transparent',
          color: statusTab === tab.key ? 'var(--t1)' : 'var(--t3)',
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          borderBottom: statusTab === tab.key ? '2px solid var(--acl)' : '2px solid transparent' }}>
        {tab.label}
      </button>
    ))}
  </div>
  {/* row 2: select dropdowns + period chips */}
</div>
```
→ Adapt for Phase 24: row 1 = `[전체|미배치|매핑|폐기]` (mapping-state filter); row 2 = zone/floor/type selects + search input.

**Card pattern (collapsed)** (RemediationPage lines 492-563):
```tsx
<div onClick={() => navigate('/remediation/' + record.id)}
  style={{
    background: 'var(--bg3)',
    border: '1px solid var(--bd)',
    borderRadius: 12,
    padding: 12,
    cursor: 'pointer',
    display: 'flex',
    gap: 10,
    borderLeft: record.result === 'bad' ? '2px solid var(--danger)' : '2px solid var(--warn)',
  }}>
  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
    {/* Line 1: title + status badge */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {record.category}
      </span>
      <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 6px', borderRadius: 5, flexShrink: 0, … }}>
        {/* badge */}
      </span>
    </div>
    {/* Line 2: location */}
    {/* Line 3: memo preview */}
    {/* Line 4: date + status chip */}
  </div>
</div>
```

**Card pattern (expanded detail toggle)** (InspectionPage ExtinguisherListOverlay lines 3596-3633) — 직접적 구현:
```tsx
<div
  key={item.seq_no}
  onClick={() => setSelectedItem(selectedItem?.seq_no === item.seq_no ? null : item)}
  style={{
    padding:'8px 10px', margin:'4px 0', borderRadius:10, cursor:'pointer',
    background: selectedItem?.seq_no === item.seq_no ? 'var(--bg3)' : 'var(--bg2)',
    border: rs === 'danger' ? '1px solid rgba(239,68,68,.4)' : … : '1px solid var(--bd)',
  }}
>
  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
    <span style={{ fontSize:12, fontWeight:700, color:'var(--t1)', minWidth:70 }}>{item.mgmt_no}</span>
    {/* … */}
  </div>
  {/* 펼침 상세 */}
  {selectedItem?.seq_no === item.seq_no && (
    <div style={{ marginTop:8, display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3px 12px', fontSize:11 }}>
      <div><span style={{ color:'var(--t3)' }}>제조업체 </span><span style={{ color:'var(--t1)', fontWeight:600 }}>{item.manufacturer ?? '-'}</span></div>
      {/* … 6 more fields */}
    </div>
  )}
</div>
```
→ Phase 24 adds an action-row inside the expanded detail (3 buttons per state matrix) — see UI-SPEC §Component Inventory item 1.

**Modal pattern (registration + info-edit):** `FloorPlanPage.tsx` editMarker modal lines 1346-1444. Already follows the project mold:
```tsx
<div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }} onClick={() => setEditMarker(false)}>
  <div style={{ width: '90%', maxWidth: 340, background: 'var(--bg2)', borderRadius: 16, padding: 20, border: '1px solid var(--bd2)', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', marginBottom: 16 }}>마커 수정</div>
    {/* field stack: label + input pairs */}
    <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6 }}>구역</div>
    {/* zone 3-button group */}
    <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
      {([{key:'research',label:'연구동'},{key:'office',label:'사무동'},{key:'common',label:'지하'}] as const).map(z => (
        <button key={z.key} onClick={() => setEditZone(z.key)}
          style={{
            flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            background: editZone === z.key ? 'var(--acl)' : 'var(--bg3)',
            color: editZone === z.key ? '#fff' : 'var(--t2)',
            border: editZone === z.key ? 'none' : '1px solid var(--bd)',
          }}
        >{z.label}</button>
      ))}
    </div>
    {/* save/cancel row */}
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={() => setEditMarker(false)} style={{ flex: 1, height: 42, borderRadius: 10, background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t2)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>취소</button>
      <button onClick={() => { … }}
        style={{ flex: 1, height: 42, borderRadius: 10, background: 'var(--acl)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>저장</button>
    </div>
  </div>
</div>
```

**Marker-companion query pattern** (RemediationPage lines 117-121):
```typescript
const [searchParams, setSearchParams] = useSearchParams()
const statusTab = (searchParams.get('tab') as 'all' | 'open' | 'resolved') || 'all'
const setStatusTab = (tab: 'all' | 'open' | 'resolved') => {
  setSearchParams(prev => { prev.set('tab', tab); return prev }, { replace: true })
}
```
→ Phase 24 reads `fromMarker, zone, floor` query params on mount and shows the info banner.

**Toast pattern** (RemediationPage lines 35, 101, 103):
```typescript
toast.success('보고서 다운로드 완료')
toast.error('사진 다운로드 실패')
```

**Loading skeleton + empty state** (RemediationPage lines 107-112, 471-490):
```typescript
const SKELETON_STYLE: React.CSSProperties = {
  background: 'var(--bg3)',
  borderRadius: 12,
  height: 88,
  animation: 'blink 2s ease-in-out infinite',
}
// in JSX:
<style>{`@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }`}</style>
{isLoading && (<><div style={SKELETON_STYLE} /><div style={SKELETON_STYLE} /><div style={SKELETON_STYLE} /></>)}
{!isLoading && !isError && records.length === 0 && (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '60px 16px' }}>
    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>조치 항목 없음</div>
    <div style={{ fontSize: 12, color: 'var(--t2)', textAlign: 'center' }}>선택한 조건에 해당하는 …</div>
  </div>
)}
```

---

### `src/pages/FloorPlanPage.tsx` (modify)

**Analog:** Self.

**Marker-edit modal — fields to remove** (lines 1403-1418):
```tsx
{planType !== 'guidelamp' && (
  <>
    <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6 }}>점검 개소 연결</div>
    <select value={editCheckpointId ?? ''} onChange={e => setEditCheckpointId(e.target.value || null)}>
      <option value="">연결 안 함</option>
      {checkpoints.filter(...).map((cp: any) => (...))}
    </select>
    <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 14 }}>개소를 연결하면 …</div>
  </>
)}
```
→ Phase 24: REMOVE this section for `planType==='extinguisher'`. Replace with new action buttons (`소화기 배치` / `소화기 분리` / `정보 수정`) per UI-SPEC §Component Inventory item 5.

**Marker-add modal — branch to remove** (lines 1505-1599 — entire `addExtMode==='new'` block + `newExt` form):
- Lines 279-281 state declarations (`addExtMode`, `newExt`).
- Lines 811-845 submit branch handling new-ext create.
- Lines 1505-1599 modal JSX block.
All three locations need surgical removal. The `existing` branch stays for non-extinguisher plan types but for `extinguisher` it's also removed (마커는 매핑 옵션 없이 위치만).

**Legend row 2 (current)** (lines 1311-1340):
```tsx
<div style={rowStyle}>
  {['normal', 'caution', 'fault', 'resolved'].map(s => (
    <div key={s} style={itemStyle}>
      <div style={{ width: 9, height: 9, borderRadius: '50%', background: STATUS_COLOR[s] }} />
      <span style={labelStyle}>{{ normal: '정상', caution: '주의', fault: '불량', resolved: '완료' }[s]}</span>
    </div>
  ))}
  {planType === 'extinguisher' && (
    <>
      <div style={{ width: 1, height: 12, background: 'var(--bd)', margin: '0 2px', flexShrink: 0 }} />
      {/* warn/imminent/danger 도래/임박/초과 */}
    </>
  )}
</div>
```
→ Phase 24: append `미배치` (red ❓) entry between `완료` and the `extinguisher` divider — see UI-SPEC §빈 마커 spec. **DO NOT touch** the legend `padding: '1px 12px 26px'` and `minHeight: 100` (LOCKED per memory rule "Dashboard 그리드 1fr은 의도적" sibling rule about legend at commit `4f6b8c0`).

**Legend item style — reuse exactly** (lines 1276-1285):
```tsx
const itemStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }
const labelStyle: React.CSSProperties = { fontSize: 10.5, color: 'var(--t2)', fontWeight: 500, whiteSpace: 'nowrap' }
const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  gap: '6px 8px',
  width: '100%',
}
```

**MarkerIcon — for ❓ rendering** (lines 96-252) — already accepts `dangerBadge` prop and renders an overlay. Phase 24 adds a `placeholder: true` prop branch (or new `EmptyMarkerIcon`) that renders a red disk + white `❓` glyph per UI-SPEC §빈 마커 spec.

**useSearchParams pattern (NEW for FloorPlanPage)** — copy from `RemediationPage` lines 117-121 (verified). Use lazy init for `useState` to avoid the layer-flip pitfall (RESEARCH.md §Pitfall 6):
```typescript
const [searchParams] = useSearchParams()
const [floor, setFloor] = useState<string>(() => {
  const f = searchParams.get('floor')
  return (f && FLOORS.includes(f)) ? f : '8-1F'
})
```

---

### `src/pages/InspectionPage.tsx` (modify)

**Analog:** Self (existing extinguisher header + extDetail card).

**Header `+ 새로 등록` button — copy existing `리스트` button geometry at line 3196-3200:**
```tsx
{isExtinguisher && (
  <button onClick={() => setShowExtList(true)} style={{ height:30, padding:'0 12px', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--bd)', color:'var(--t2)', fontSize:11, fontWeight:600, cursor:'pointer' }}>
    리스트
  </button>
)}
```
→ Phase 24 adds a sibling button `+ 새로 등록` (acl-styled per UI-SPEC §1.7) → `navigate('/extinguishers')`.

**소화기 정보 카드 sub-action row — insert in extDetail block at line 3318-3325** (after the replaceWarning chip, before the note):
```tsx
{/* 정보 수정 / 소화기 분리 — Phase 24 추가 */}
<div style={{ display:'flex', gap:8, marginTop:8 }}>
  <button onClick={openEditExtModal}
    style={{ flex:1, height:36, borderRadius:8, fontSize:12, fontWeight:700,
      background:'var(--bg3)', color:'var(--t1)', border:'1px solid var(--bd2)', cursor:'pointer' }}>
    정보 수정
  </button>
  <button onClick={openUnassignConfirm}
    style={{ flex:1, height:36, borderRadius:8, fontSize:12, fontWeight:700,
      background:'rgba(239,68,68,.08)', color:'var(--danger)', border:'1px solid rgba(239,68,68,.3)', cursor:'pointer' }}>
    소화기 분리
  </button>
</div>
```
Geometry comes from UI-SPEC §Component Inventory items 6-7.

---

### `src/components/SideMenu.tsx` (modify)

**Analog:** Self lines 27-32 (`시설 관리` section).

**Insert pattern — copy `소방계획서/훈련자료` Phase 21 addition at line 39:**
```typescript
{ section: '시설 관리', items: [
  { label: 'DIV 압력 관리',   path: '/div',        badge: 0, soon: false },
  { label: '소방 시설 도면',   path: '/floorplan',  badge: 0, soon: false },
  { label: '소화기',          path: '/extinguishers', badge: 0, soon: false },  // NEW Phase 24
  { label: '소방 점검 관리',   path: '/legal',      badge: 0, soon: false },
  { label: '소방 시설 추가',  path: '/checkpoints', badge: 0, soon: false, role: 'admin' },
]},
```

---

### `src/components/DesktopSidebar.tsx` (modify)

**Analog:** Self lines 8-13.

**Insert pattern — append to `시설 관리` paths array:**
```typescript
{ label: '시설 관리', paths: ['/div', '/legal', '/elevator', '/checkpoints', '/extinguishers'] },
```
→ Order can be tuned by planner; the auto-ordering happens because `findItem` on line 30 looks up MENU which has the new entry first.

---

### `src/utils/api.ts` `DEFAULT_SIDE_MENU` (modify, lines 374-400)

**Analog:** Self — Phase 21 `/documents` addition at line 389.

**Insert pattern:**
```typescript
{ type: 'divider', id: 'd-facility', title: '시설 관리' },
{ type: 'item', path: '/div',           visible: true },
{ type: 'item', path: '/floorplan',     visible: true },
{ type: 'item', path: '/extinguishers', visible: true },  // NEW Phase 24
{ type: 'item', path: '/legal',         visible: true },
{ type: 'item', path: '/checkpoints',   visible: true },
```

**Forward-merge pattern (no migration code needed)** — `migrateLegacyMenuConfig` lines 405-433 already handles new items via `existingPaths` set check at lines 411-419. Phase 21 verified pattern.

---

### `src/App.tsx` (modify)

**Analog:** Self lines 220-249, 63, 68-80.

**Add to MOBILE_NO_NAV_PATHS line 63** (decision: include `/extinguishers` only if it has its own header / no BottomNav):
```typescript
const MOBILE_NO_NAV_PATHS = ['/', '/login', '/schedule', '/reports', '/workshift', '/leave', '/floorplan', '/div', '/qr-print', '/daily-report', '/worklog', '/meal', '/education', '/legal', '/elevator/findings', '/annual-plan']
```
→ UI-SPEC §1 says ExtinguishersListPage shows BottomNav (`paddingBottom: calc(var(--sab) + 70px)`). Therefore DO NOT add `/extinguishers` to `MOBILE_NO_NAV_PATHS`.

**Add to PAGE_TITLES lines 68-80:**
```typescript
const PAGE_TITLES: Record<string, string> = {
  '/dashboard': '대시보드',
  '/inspection': '일반 점검',
  // …
  '/extinguishers': '소화기 관리',  // NEW Phase 24
}
```

**Add to Routes block lines 220-249:**
```tsx
<Route path="/extinguishers" element={<Auth><ExtinguishersListPage /></Auth>} />
```
→ Place between `/floorplan` (line 235) and `/checkpoints` (line 240) to mirror the SideMenu order.

---

## Shared Patterns

### Authentication / Authorization

**Source:** `cha-bio-safety/functions/_middleware.ts` lines 29-61 (already enforces JWT on every `/api/*` route except whitelisted PUBLIC).

**Apply to:** All new API handlers (`extinguishers/[id].ts`, `extinguishers/[id]/{assign,unassign,swap,dispose}.ts`).

**No new code required** — handlers receive `ctx.data.{staffId, role, name}` automatically. Use:
```typescript
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { staffId, role, name } = (ctx as any).data
  // …
}
```

**Admin gate pattern (when needed)** (from `check-points/[id].ts` lines 10-11):
```typescript
if (data.data?.role !== 'admin')
  return Response.json({ success: false, error: '권한이 없습니다' }, { status: 403 })
```
→ Phase 24: per CONTEXT, admin/assistant equal권한 가정 (RESEARCH.md A8). Skip the gate by default; planner re-checks before issuing PRs.

---

### Error Handling

**Source:** `cha-bio-safety/src/utils/api.ts` lines 6-8, 31-68 + `cha-bio-safety/functions/api/check-points/[id].ts` lines 77-80.

**Apply to:** All new API handlers + frontend mutations.

**Backend pattern:**
```typescript
try {
  // …
} catch (e) {
  console.error('extinguisher … error:', e)
  return Response.json({ success: false, error: '서버 오류가 발생했습니다' }, { status: 500 })
}
```

**Frontend pattern** (RemediationPage line 33-36 toast wrap):
```typescript
try {
  await extinguisherApi.assign(id, cpId)
  toast.success('배치 완료')
  qc.invalidateQueries({ queryKey: ['extinguishers'] })
} catch (e: any) {
  toast.error(e?.message ?? '요청 실패')
}
```

**Standard response shape** (across the project — verify in every handler):
```
success: { success: true, data?: T }
error:   { success: false, error: string, data?: { occupantId?: number, hint?: 'swap' } }   // 4xx, 5xx
```

---

### Validation

**Source:** Project convention — manual checks in handler body.

**Apply to:** All new POST/PUT handlers.

**Pattern (from `floorplan-markers/[id].ts` lines 28-30 + RESEARCH.md §Pattern 3):**
```typescript
// 1) Required fields
if (!check_point_id) return Response.json({ success:false, error:'check_point_id 필수' }, { status:400 })

// 2) ID coercion (params come as string, ext IDs are numeric)
const id = parseInt(params.id as string, 10)
if (!Number.isFinite(id)) return Response.json({ success:false, error:'잘못된 ID' }, { status:400 })

// 3) Domain validation (≤3 fields, status, mapping conflict) — see [id].ts and assign.ts excerpts above
```

---

### Toast / Loading State

**Source:** All pages — `react-hot-toast` already mounted globally.

**Apply to:** All Phase 24 mutation success/error feedback.

**Copy exactly:** RemediationPage lines 33-36, 101-104. UI-SPEC §Copywriting locks the exact Korean strings.

---

### Modal Geometry

**Source:** `cha-bio-safety/src/pages/FloorPlanPage.tsx` lines 1346-1444 (`editMarker` modal) + InspectionPage `ResolutionDetailModal` lines 3641-3714.

**Apply to:** New 신규 등록 모달, 정보 수정 모달, confirm dialogs (assign / unassign / swap / dispose / delete) on ExtinguishersListPage + InspectionPage.

**Locked values:**
- Backdrop: `position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.6)'`. Click-outside closes.
- Wrapper: `width: '90%', maxWidth: 340 (or 360 per UI-SPEC), background: 'var(--bg2)', borderRadius: 16, padding: 20, border: '1px solid var(--bd2)', maxHeight: '80vh', overflowY: 'auto'`.
- Header: `fontSize: 15 (or 16 per UI-SPEC), fontWeight: 700, color: 'var(--t1)', marginBottom: 16`.
- Field label: `fontSize: 11, color: 'var(--t3)', marginBottom: 6`.
- Input: `padding: '10px 12px', borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t1)', fontSize: 13, marginBottom: 14, boxSizing: 'border-box'`.
- Save button: `flex: 1, height: 42, borderRadius: 10, background: 'var(--acl)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer'`.
- Cancel button: `flex: 1, height: 42, borderRadius: 10, background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--t2)', fontSize: 13, fontWeight: 600, cursor: 'pointer'`.

---

### React Query Mutation + Invalidate

**Source:** Throughout the project — see FloorPlanPage `updateMutation.mutate({…}, { onSuccess: () => { setEditMarker(false); setSelected(null); toast.success('마커 수정됨') } })` at lines 1424-1437.

**Apply to:** All Phase 24 modals/actions:
```typescript
const qc = useQueryClient()
const assignMutation = useMutation({
  mutationFn: ({ id, cpId }: { id: number; cpId: string }) => extinguisherApi.assign(id, cpId),
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ['extinguishers'] })
    qc.invalidateQueries({ queryKey: ['floorplan-markers'] })
    toast.success('배치 완료')
  },
  onError: (e: any) => toast.error(e?.message ?? '요청 실패'),
})
```

---

### KST Timestamp

**Source:** `cha-bio-safety/functions/api/floorplan-markers/[id].ts` line 32 — `datetime('now','+9 hours')`.

**Apply to:** All new UPDATE statements on `extinguishers` and INSERT/UPDATE on `check_records`.

**Forbidden:** Plain `datetime('now')` — older convention now phased out in newer migrations and handlers.

---

## No Analog Found

**None.** Every Phase 24 file has a strong existing analog in `cha-bio-safety/`. The phase introduces no new patterns, only data-model and UX evolution within established conventions.

---

## Metadata

**Analog search scope:**
- `cha-bio-safety/migrations/` (78 files; focused on 0035, 0072, 0073, 0078)
- `cha-bio-safety/functions/api/extinguishers/` (3 files)
- `cha-bio-safety/functions/api/floorplan-markers/` (2 files)
- `cha-bio-safety/functions/api/check-points/` (PUT analog)
- `cha-bio-safety/functions/api/inspections/[sessionId]/records.ts`
- `cha-bio-safety/functions/_middleware.ts`
- `cha-bio-safety/src/pages/RemediationPage.tsx` (567 lines; full read)
- `cha-bio-safety/src/pages/FloorPlanPage.tsx` (1978 lines; targeted reads at modal/legend regions)
- `cha-bio-safety/src/pages/InspectionPage.tsx` (5251 lines; targeted reads at ExtinguisherListOverlay + extDetail card)
- `cha-bio-safety/src/pages/LegalPage.tsx` (badge + filter bar reference)
- `cha-bio-safety/src/utils/api.ts` (full read; api.ts has all client patterns)
- `cha-bio-safety/src/components/SideMenu.tsx` + `DesktopSidebar.tsx` (full reads)
- `cha-bio-safety/src/App.tsx` (route + title patterns)

**Files scanned:** ~25
**Pattern extraction date:** 2026-04-30

**Cross-cutting verifications:**
- All new API handlers will inherit JWT auth via `_middleware.ts` (no extra code).
- Toast / React Query / Zustand are already global — no new imports needed at app level.
- The codebase already has both `datetime('now')` (older) and `datetime('now','+9 hours')` (newer KST). Phase 24 locks the newer convention.
- `check_records` deletion is forbidden across all branches (verified in `floorplan-markers/[id].ts` line 48 comment) — reaffirmed in dispose.ts header comment.
