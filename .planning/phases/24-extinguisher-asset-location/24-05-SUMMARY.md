---
phase: 24-extinguisher-asset-location
plan: 05
status: complete
completed_at: 2026-04-30T23:15:00Z
subsystem: frontend-inspection
tags:
  - frontend
  - inspection
  - extinguisher
dependency_graph:
  requires:
    - 24-02 (extinguisherApi.update / extinguisherApi.unassign client methods)
  provides:
    - InspectionPage + 새로 등록 header button (navigates to /extinguishers)
    - InspectionPage extDetail sub-action row (정보 수정 / 소화기 분리)
    - 정보 수정 modal (<=3 field counter + microcopy)
    - 분리 confirm modal (UI-SPEC verbatim copy)
  affects:
    - cha-bio-safety/src/pages/InspectionPage.tsx
    - cha-bio-safety/src/utils/api.ts (ExtinguisherDetail.id added)
    - cha-bio-safety/functions/api/extinguishers/[checkPointId].ts (SELECT id added)
tech_stack:
  added: []
  patterns:
    - useMutation + useQueryClient for optimistic invalidation
    - useEffect-driven form init from modal open state
    - inline IIFE render pattern (()=>{...})() for scoped extDetail card
key_files:
  created: []
  modified:
    - cha-bio-safety/src/pages/InspectionPage.tsx
    - cha-bio-safety/src/utils/api.ts
    - cha-bio-safety/functions/api/extinguishers/[checkPointId].ts
decisions:
  - ExtinguisherDetail.id added as optional field (needed by update/unassign mutations)
  - getDetail endpoint now SELECTs id column (deviation Rule 2 - missing critical field)
  - invalidateQueries(['extinguishers']) + direct extDetail refresh on mutation success
  - sub-action row shown only when extDetail.id != null (safe guard for unmapped state)
metrics:
  duration_minutes: 20
  tasks_completed: 2
  files_created: 0
  files_modified: 3
  total_files: 3
---

# Phase 24 Plan 05: InspectionPage Extinguisher Sub-actions Summary

**One-liner:** + 새로 등록 acl header button + 정보수정/분리 sub-action row + <=3 field counter modal + verbatim-copy confirm modal added to InspectionPage extinguisher category.

## What was built

### Task 1: + 새로 등록 header button (line ~3250)

Added inside `isExtinguisher` guard, left of the existing `리스트` button, wrapped in `<>`:

```tsx
<button onClick={() => navigate('/extinguishers')}
  style={{ height:32, padding:'0 12px', borderRadius:8, background:'var(--acl)',
    border:'none', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
  + 새로 등록
</button>
```

Geometry matches UI-SPEC §Component Inventory #7 exactly (acl bg / h32 / 0 12px padding / r8 / white / 700 weight).

### Task 2: extDetail sub-action row (lines 3376-3394)

Inserted inside extDetail card IIFE, after `replaceWarning` chip, before `note`:

```tsx
{extDetail.id != null && (
  <div style={{ display:'flex', gap:8, marginTop:8 }}>
    <button onClick={() => setEditExtModalOpen(extDetail)}
      style={{ flex:1, height:36, borderRadius:8, fontSize:12, fontWeight:700,
        background:'var(--bg3)', color:'var(--t1)', border:'1px solid var(--bd2)', cursor:'pointer' }}>
      정보 수정
    </button>
    <button onClick={() => setUnassignConfirmExt(extDetail)}
      style={{ flex:1, height:36, borderRadius:8, fontSize:12, fontWeight:700,
        background:'rgba(239,68,68,.08)', color:'var(--danger)', border:'1px solid rgba(239,68,68,.3)', cursor:'pointer' }}>
      소화기 분리
    </button>
  </div>
)}
```

### 정보 수정 modal counter chip code (lines ~3571-3578)

```tsx
const counterChip = (() => {
  if (changedCount === 0) return { bg:'var(--bg3)', color:'var(--t3)' }
  if (changedCount <= 3)  return { bg:'rgba(59,130,246,.15)', color:'var(--acl)' }
  return { bg:'rgba(239,68,68,.15)', color:'var(--danger)' }
})()
// ...
<span style={{ ... background:counterChip.bg, color:counterChip.color }}>
  변경: {changedCount} / 3
</span>
```

### 분리 confirm modal copy (lines ~3653-3657)

```tsx
<div style={{ fontSize:16, fontWeight:700, color:'var(--t1)', marginBottom:16 }}>소화기 분리</div>
<div style={{ fontSize:13, fontWeight:400, color:'var(--t2)', marginBottom:16 }}>
  「{unassignConfirmExt.cp_location ?? unassignConfirmExt.location ?? unassignConfirmExt.mgmt_no}」 위치에서 분리합니다. 자산은 미배치 상태로 유지됩니다.
</div>
```

### Mutation onSuccess invalidate targets

- `qcInspection.invalidateQueries({ queryKey: ['extinguishers'] })` — both updateExtMutation and unassignExtMutation
- `extinguisherApi.getDetail(selectedCP.id)` direct refresh — updateExtMutation only

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Field] ExtinguisherDetail.id was absent from getDetail endpoint**
- **Found during:** Task 2 implementation
- **Issue:** `getDetail` (`/api/extinguishers/:checkPointId`) SELECT did not include `id` column. The `ExtinguisherDetail` interface also had no `id` field. The mutations `extinguisherApi.update(id, ...)` and `extinguisherApi.unassign(id)` both require a numeric `id`, making the entire sub-action functionality non-functional.
- **Fix:** Added `id` to SELECT in `[checkPointId].ts`; added `id?: number` to `ExtinguisherDetail` interface in `api.ts`.
- **Files modified:** `functions/api/extinguishers/[checkPointId].ts`, `src/utils/api.ts`
- **Commit:** fca14bf

## Known Stubs

None. The modals call real API mutations (extinguisherApi.update / extinguisherApi.unassign). The `+ 새로 등록` button navigates to a real page (`/extinguishers` from Plan 03).

## Threat Flags

None. This plan adds no new network endpoints and no new trust boundaries. The mutations go to Plan 02 endpoints which enforce the <=3 field rule server-side.

## Self-Check: PASSED

- [x] `cha-bio-safety/src/pages/InspectionPage.tsx` modified (3 files changed)
- [x] commit cf55b10 — Task 1 (+ 새로 등록 button)
- [x] commit fca14bf — Task 2 (sub-action row + modals + deviation fix)
- [x] `+ 새로 등록` 1 match in InspectionPage
- [x] `navigate('/extinguishers')` 1 match
- [x] `extinguisherApi.update` + `extinguisherApi.unassign` 2+ matches (2 total)
- [x] `정보 수정` 6 matches, `소화기 분리` 4 matches
- [x] `변경: ` counter 1 match
- [x] `4개 이상 변경하려면` microcopy 1 match
- [x] `위치에서 분리합니다` + `자산은 미배치 상태로 유지됩니다` both present
- [x] `rgba(239,68,68,.08)` and `rgba(239,68,68,.3)` present (8 matches total)
- [x] `useQueryClient` + `invalidateQueries` 4 matches
- [x] tsc --noEmit: 0 InspectionPage or api.ts errors (only pre-existing missing node_modules errors in worktree)
- [x] Existing inspection flow (normal/caution/bad, photo, memo) unchanged — 150 matches for result values, 26 for photo/PhotoButton
- [x] setShowExtList / ExtinguisherListOverlay preserved (4 matches each)
- [x] No STATE.md or ROADMAP.md modified
