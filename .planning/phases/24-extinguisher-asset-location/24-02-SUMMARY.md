---
phase: 24-extinguisher-asset-location
plan: 02
status: complete
completed_at: 2026-04-30T22:43:00Z
subsystem: backend-api
tags:
  - api
  - extinguisher
  - backend
  - cloudflare-pages-functions
dependency_graph:
  requires:
    - 24-01 (migration: extinguishers.status + check_records.extinguisher_id columns)
  provides:
    - PUT /api/extinguishers/:id (<=3 field update rule)
    - DELETE /api/extinguishers/:id (guarded hard delete)
    - POST /api/extinguishers/:id/assign
    - POST /api/extinguishers/:id/unassign
    - POST /api/extinguishers/:id/swap
    - POST /api/extinguishers/:id/dispose
    - GET /api/extinguishers extended (LEFT JOIN, status/mapping filters, has_records)
    - POST /api/extinguishers/create skip_marker mode
    - extinguisher_id snapshot on check_records INSERT/UPDATE
    - floorplan-markers cascade unassign-only (no more DELETE extinguishers)
  affects:
    - Wave 3 plans: 03 (ExtinguishersListPage), 04 (FloorPlanPage), 05 (InspectionPage)
tech_stack:
  added: []
  patterns:
    - D1 batch atomic swap (env.DB.batch with 2 UPDATEs)
    - correlated subquery for has_records (LEFT JOIN + subquery)
    - server-side snapshot SELECT before INSERT (race condition mitigation)
    - <=3 field change rule enforced server-side via EDITABLE_FIELDS comparison
key_files:
  created:
    - cha-bio-safety/functions/api/extinguishers/[id].ts
    - cha-bio-safety/functions/api/extinguishers/[id]/assign.ts
    - cha-bio-safety/functions/api/extinguishers/[id]/unassign.ts
    - cha-bio-safety/functions/api/extinguishers/[id]/swap.ts
    - cha-bio-safety/functions/api/extinguishers/[id]/dispose.ts
  modified:
    - cha-bio-safety/functions/api/extinguishers/index.ts
    - cha-bio-safety/functions/api/extinguishers/create.ts
    - cha-bio-safety/functions/api/inspections/[sessionId]/records.ts
    - cha-bio-safety/functions/api/floorplan-markers/[id].ts
    - cha-bio-safety/src/utils/api.ts
decisions:
  - Server enforces <=3 field rule (not client) via EDITABLE_FIELDS whitelist + norm comparison
  - has_records correlated subquery added to GET list for deterministic card state machine in Wave 3
  - extinguisher_id snapshot fetched server-side (not from client body) to prevent race condition
  - floorplan-markers DELETE changed from cascade DELETE extinguishers to unassign-only (check_point_id=NULL)
  - skip_marker mode returns extinguisherId (numeric) instead of checkPointId (string) - union return type
metrics:
  duration_minutes: 25
  tasks_completed: 3
  files_created: 5
  files_modified: 5
  total_files: 10
---

# Phase 24 Plan 02: Backend API Endpoints Summary

**One-liner:** 6 new extinguisher action endpoints (assign/unassign/swap/dispose/PUT/DELETE) + GET extension with LEFT JOIN + records snapshot + cascade policy fix + extinguisherApi client expansion.

## What was built

### API Endpoint Table

| Method | Path | Body / Params | Guards | Response codes |
|--------|------|---------------|--------|----------------|
| PUT | `/api/extinguishers/:id` | `{ type?, prefix_code?, ... }` (≤3 fields changed) | <=3 field rule, 폐기 guard | 200/400/404/409/500 |
| DELETE | `/api/extinguishers/:id` | — | 미매핑 + 미점검 guard | 200/404/409/500 |
| POST | `/api/extinguishers/:id/assign` | `{ check_point_id: string }` | 폐기 guard, 이미매핑 guard, occupant 409+hint:'swap' | 200/400/404/409/500 |
| POST | `/api/extinguishers/:id/unassign` | — | idempotent (noop if already unmapped) | 200/400/404/500 |
| POST | `/api/extinguishers/:id/swap` | `{ other_extinguisher_id: number }` | 폐기 guard, 미매핑 guard, D1 batch atomic | 200/400/404/409/500 |
| POST | `/api/extinguishers/:id/dispose` | — | idempotent (noop if already 폐기) | 200/400/404/500 |
| GET | `/api/extinguishers` | `?status=, ?mapping=mapped|unmapped|disposed` | — | 200/500 |
| POST | `/api/extinguishers/create` | `{ skip_marker: true, type }` | type required | 200/400/500 |

### Modified Files

**`functions/api/inspections/[sessionId]/records.ts`**
- Added server-side `extinguisher_id` snapshot SELECT before INSERT (`CP-FE-*` checkpoints only)
- Same snapshot logic added to UPDATE path (re-entry inspection case)
- Client-supplied extinguisher_id ignored entirely (race condition prevention)

**`functions/api/extinguishers/index.ts`**
- `JOIN check_points` changed to `LEFT JOIN check_points` — unmapped assets now appear in list
- Added `cp.location, cp.floor, cp.zone, cp.qr_code` to SELECT
- Added `(SELECT COUNT(*) FROM check_records cr WHERE cr.extinguisher_id = e.id) > 0 AS has_records` correlated subquery
- Added `?status=` and `?mapping=` filter params

**`functions/api/floorplan-markers/[id].ts`**
- `isExtCascade` branch: `DELETE FROM extinguishers WHERE check_point_id=?` replaced with `UPDATE extinguishers SET check_point_id=NULL`
- check_records never deleted (preserved principle)

### `src/utils/api.ts` New Method Signatures

```typescript
extinguisherApi.update(id: number, data: Partial<Pick<ExtinguisherDetail, 'type'|'prefix_code'|'seal_no'|'serial_no'|'approval_no'|'manufactured_at'|'manufacturer'>>)
  => Promise<{ changed?: number; noop?: boolean }>

extinguisherApi.assign(id: number, checkPointId: string)
  => Promise<void>

extinguisherApi.unassign(id: number)
  => Promise<{ noop?: boolean }>

extinguisherApi.swap(id: number, otherId: number)
  => Promise<void>

extinguisherApi.dispose(id: number)
  => Promise<{ noop?: boolean }>

extinguisherApi.remove(id: number)
  => Promise<void>
```

### `ExtinguisherDetail` / `ExtinguisherListResponse` Interface Changes

```typescript
// ExtinguisherDetail: added
status?: 'active' | '폐기'
cp_location?: string | null
cp_floor?: string | null
cp_zone?: string | null
cp_qr_code?: string | null

// ExtinguisherListResponse.items: updated
items: (ExtinguisherDetail & { id: number; seq_no: number; cp_id: string | null; has_records?: number | boolean })[]
```

### Wave 3 Import-Ready Interface

Wave 3 plans can immediately call:
```typescript
import { extinguisherApi, ExtinguisherDetail, ExtinguisherListResponse } from '../utils/api'

// List all unmapped active assets:
extinguisherApi.list({ mapping: 'unmapped' })

// Card state machine: has_records determines 삭제 vs 폐기 button
const canDelete = !item.check_point_id && !item.has_records
const canDispose = !item.check_point_id && !!item.has_records

// Assign asset to map location:
extinguisherApi.assign(item.id, cpId)

// Swap two mapped assets:
extinguisherApi.swap(item.id, otherItem.id)
```

## Grep Gate Results

| Check | Expected | Result |
|-------|----------|--------|
| 4 action files exist with onRequestPost | 4 | PASS |
| swap.ts env.DB.batch count | ≥1 | 1 PASS |
| swap.ts UPDATE extinguishers x2 | ≥2 | 2 PASS |
| dispose.ts status='폐기' (non-comment) | ≥1 | 1 PASS |
| dispose.ts check_records comment verbatim | ≥1 | 1 PASS |
| assign.ts hint: 'swap' | 1 | PASS |
| datetime('+9 hours') in action files | ≥3 | 4 files PASS |
| [id].ts 한번에 최대 3개 message | 1 | PASS |
| [id].ts 점검 기록이 있는 자산 message | 1 | PASS |
| index.ts LEFT JOIN check_points | ≥1 | 1 PASS |
| index.ts has_records | ≥1 | 2 PASS |
| create.ts skip_marker | ≥1 | 3 PASS |
| records.ts extinguisher_id | ≥2 | 2 PASS |
| floorplan-markers DELETE FROM extinguishers = 0 | 0 | PASS |
| floorplan-markers UPDATE SET check_point_id=NULL | ≥1 | 1 PASS |

## Deviations from Plan

### Auto-fixed Issues

None.

### Notes

- `gitignore` pattern `inspections/` in `cha-bio-safety/.gitignore` caused `git add` to complain; `git add -f` was required for the already-tracked `functions/api/inspections/[sessionId]/records.ts`. The pattern is intended to ignore a local `inspections/` data directory, not the functions path.
- TypeScript `tsc --noEmit` cannot run in the worktree (no `node_modules`); verification done via grep gates. The pattern is identical to existing code and uses the same type signatures.

## Self-Check: PASSED

- [x] 4 new action endpoint files exist (assign.ts, unassign.ts, swap.ts, dispose.ts)
- [x] extinguishers/[id].ts created with onRequestPut + onRequestDelete
- [x] index.ts extended with LEFT JOIN + has_records + status/mapping filters
- [x] create.ts extended with skip_marker mode
- [x] records.ts extended with server-side extinguisher_id snapshot
- [x] floorplan-markers/[id].ts cascade changed from DELETE to unassign
- [x] src/utils/api.ts ExtinguisherDetail/ListResponse updated + 6 new methods added
- [x] 3 commits made: 74a189d, 3459cb4, 7e04d4b
- [x] No STATE.md or ROADMAP.md modified
- [x] No check_records DELETE in any branch
