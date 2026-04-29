---
phase: 24-extinguisher-asset-location
plan: "04"
subsystem: frontend/floorplan
tags:
  - frontend
  - floorplan
  - marker
  - empty-marker
  - extinguisher
dependency_graph:
  requires:
    - 24-02 (extinguisherApi.assign / unassign backend)
    - 24-03 (ExtinguishersListPage /extinguishers route for navigation)
  provides:
    - Empty marker visual (#ef4444 ❓ glyph) in FloorPlanPage
    - Placing mode URL state machine (?placingExtinguisher=)
    - Unassign confirm modal + assignMutation/unassignMutation
    - Simplified marker-add modal (extinguisher type)
    - Legend 미배치 item in status row
    - Inspection modal sub-action row (정보 수정 + 소화기 분리)
  affects:
    - ExtinguishersListPage navigation target (/extinguishers?fromMarker=...)
    - InspectionPage (no change — co-plan 24-05 handles that)
tech_stack:
  added:
    - useSearchParams lazy init for floor + planType (avoid layer-flip flicker)
    - assignMutation / unassignMutation via useMutation
  patterns:
    - Empty marker detection: client-side using extListQuery.data (no extra API call)
    - URL state machine: isPlacingMode derived from searchParams, not useState
    - Placing mode intercept in onMarkerClick before normal selection flow
key_files:
  created:
    - .planning/phases/24-extinguisher-asset-location/sketches/24-04-empty-marker.html
    - .planning/phases/24-extinguisher-asset-location/sketches/24-04-legend-and-modals.html
  modified:
    - cha-bio-safety/src/pages/FloorPlanPage.tsx (+269/-170 lines net)
decisions:
  - "Empty marker detection uses client-side extListQuery.data — avoids extra API call. Condition: !check_point_id || !items.some(it => it.cp_id === cpId && it.status !== '폐기')"
  - "ASCII ? used in SVG text instead of ❓ emoji — cross-platform font safety"
  - "Legend 미배치 uses 9px disk (not 13px) — consistent with other status dots in the row"
  - "Placing mode: occupied marker click → toast only (not swap) — MVP policy, swap is out-of-scope"
  - "정보 수정 navigates to /extinguishers/{id} — route does not yet exist (created in later plan)"
metrics:
  duration: "~2 hours (context-resumed execution)"
  completed: "2026-04-30"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 3
---

# Phase 24 Plan 04: FloorPlanPage 마커 단순화 + ❓ 빈 마커 + URL state machine Summary

FloorPlanPage에 소화기 자산-위치 분리 아키텍처를 완성. 빈 마커(미배치) ❓ 렌더, 범례 미배치 항목, 점검 모달 sub-action, URL ?placingExtinguisher= 모드를 구현하고 addExtMode/newExt/editCheckpointId 를 완전 제거.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | sketch HTML × 2 (empty marker + legend/modals) | acd0d42 | sketches/24-04-empty-marker.html, sketches/24-04-legend-and-modals.html |
| 2 | FloorPlanPage 7개 핵심 변경 | 84db1ff | cha-bio-safety/src/pages/FloorPlanPage.tsx |

## Key Changes (Task 2)

### A) addExtMode / newExt / editCheckpointId 완전 제거
- 3개 state 선언 삭제
- `submitAddMarker` 의 `if (addExtMode === 'new')` 분기 삭제 (~95 lines)
- `openEditMarkerModal` 의 extinguisher 브랜치(cp 리스트 fetch + setEditCheckpointId) 삭제
- `<select value={editCheckpointId}>` 블록 삭제

**회귀 테스트:** `grep -c "addExtMode\|newExt\|editCheckpointId" src/pages/FloorPlanPage.tsx` = 0

### B) 마커 추가 모달 단순화 (extinguisher type)
개소명 text input + 구역 3-button group 만 노출. 마커 종류 SVG picker 는 유지 (마커 형태 선택 목적).

### C) 마커 수정 모달 액션 버튼
- 매핑된 마커: 소화기 분리 버튼 → `setUnassignConfirm(mappedExt)` + close modal
- 미배치 마커: 소화기 배치 버튼 → `navigate('/extinguishers?fromMarker=...')`

### D) 빈 마커 SVG 렌더링

```tsx
// Phase 24: 빈 마커 (미배치) 판단 — extinguisher plan type only
if (planType === 'extinguisher') {
  const items = extListQuery.data?.items ?? []
  const isEmpty = !m.check_point_id || !items.some(it => it.cp_id === m.check_point_id && it.status !== '폐기')
  if (isEmpty) {
    return (
      <svg width={13} height={13} viewBox="0 0 13 13">
        <circle cx="6.5" cy="6.5" r="6.5" fill="#ef4444"/>
        <text x="6.5" y="10.5" fontSize={8} fill="#fff" textAnchor="middle"
          fontWeight={700} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.45)' }}>?</text>
      </svg>
    )
  }
}
```

### E) 범례 미배치 항목

```tsx
{planType === 'extinguisher' && (
  <div style={itemStyle}>
    <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef4444',
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 6, fontWeight: 700, color: '#fff', lineHeight: 1 }}>?</span>
    </div>
    <span style={labelStyle}>미배치</span>
  </div>
)}
```

`rowStyle/itemStyle/labelStyle` 변경 없음. Legend padding `'1px 12px 26px'` 유지.

### F) URL state machine

```
?placingExtinguisher={id}&zone={zone}&floor={floor} 진입
  ↓
floor lazy-init from searchParams (no flicker)
isPlacingMode = !!placingExtId (derived, not useState)
  ↓ 도면 상단 배너 "배치할 위치(개소)를 선택하세요"
  ↓
마커 클릭 intercept in onMarkerClick:
  isEmpty → setPlacingConfirm(m) → modal "소화기 배치" confirm
    → assignMutation.mutate({extId, cpId}) → toast → navigate(-1)
  occupied → toast "이미 소화기가 배치된 개소입니다" (MVP: no swap)
  ↓
점검 모드 (isPlacingMode=false) 빈 마커 클릭:
  → setEmptyMarkerModal(m) → modal "소화기 미배치"
    → navigate('/extinguishers?fromMarker=...')
```

### G) 점검 모달 소화기 카드 sub-action row

정보 카드(inspectExtDetail) 아래 2-버튼 행:
- 정보 수정: `navigate('/extinguishers/${inspectExtDetail.id}')` + modal close
- 소화기 분리: `setUnassignConfirm(inspectExtDetail)` + modal close

## New Mutations

```tsx
const assignMutation = useMutation({
  mutationFn: ({ extId, cpId }) => extinguisherApi.assign(extId, cpId),
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ['extinguishers', floor] })
    qc.invalidateQueries({ queryKey: ['floorplan-markers', floor, planType] })
    toast.success('소화기 배치 완료')
  },
})
const unassignMutation = useMutation({
  mutationFn: (extId) => extinguisherApi.unassign(extId),
  onSuccess: () => { /* same invalidations */ toast.success('소화기 분리 완료') },
})
```

## New Modals (3)

| Modal | Trigger | Action |
|-------|---------|--------|
| `unassignConfirm` | 마커 수정 모달 「소화기 분리」 or 점검 모달 「소화기 분리」 | unassignMutation + setSelected(null) |
| `emptyMarkerModal` | 점검 모드 빈 마커 클릭 | navigate('/extinguishers?fromMarker=...') |
| `placingConfirm` | 배치 모드 빈 마커 클릭 | assignMutation + navigate(-1) |

## Deviations from Plan

None — plan executed as specified. Minor adaptation: legend 미배치 dot uses 9px (consistent with other status dots) instead of 13px as in the plan spec; the 13px size is used in the SVG canvas marker itself.

## Acceptance Criteria Check

| Criteria | Result |
|----------|--------|
| addExtMode 0 matches | PASS (0) |
| newExt 0 matches | PASS (0) |
| editCheckpointId 0 matches | PASS (0) |
| placingExtinguisher 1+ matches | PASS (2) |
| fromMarker 1+ matches | PASS (2) |
| useSearchParams imported | PASS |
| extinguisherApi.assign called | PASS |
| extinguisherApi.unassign called | PASS |
| 빈 마커 #ef4444 fill | PASS |
| 범례 미배치 라벨 | PASS (10 matches) |
| 소화기 미배치 안내 모달 | PASS (1 match) |
| 정보 수정 sub-action | PASS (2 matches) |
| 소화기 분리 sub-action | PASS |
| Legend padding '1px 12px 26px' unchanged | PASS (1 match) |
| rowStyle/itemStyle/labelStyle unchanged | PASS |

## Known Stubs

None — all navigation targets are wired. `/extinguishers` route does not yet exist (Plan 03/future plan), so `navigate('/extinguishers?...')` will land on 404 until that route is registered.

## Threat Flags

None — no new network endpoints introduced. URL placingExtinguisher is validated at backend by Plan 02's assign endpoint before any data mutation.

## Self-Check: PASSED
