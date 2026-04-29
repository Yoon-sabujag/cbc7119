---
phase: 24-extinguisher-asset-location
plan: 03
status: complete
completed_at: 2026-04-30T23:18:00Z
subsystem: frontend-page
tags:
  - frontend
  - page
  - extinguisher
  - list
dependency_graph:
  requires:
    - 24-02 (extinguisherApi 6 methods + ExtinguisherListResponse with has_records)
  provides:
    - /extinguishers route (ExtinguishersListPage)
    - SideMenu 소화기 항목 (시설 관리 섹션)
    - DesktopSidebar /extinguishers 항목
    - DEFAULT_SIDE_MENU /extinguishers item (forward-merge 지원)
    - App.tsx PAGE_TITLES['/extinguishers'] = '소화기 관리'
    - navigate helper: /extinguishers?fromMarker=&zone=&floor=
  affects:
    - Wave 4 (Plan 24-06 deploy: 이 페이지도 포함됨)
tech_stack:
  added: []
  patterns:
    - useSearchParams for filter state + marker context
    - has_records state machine (unmapped-clean / unmapped-inspected / mapped / disposed)
    - counter chip 3-variant (n=0 회색 / 1~3 파랑 / >3 빨강) for 정보 수정 모달
    - sketch-first mandate (auto-approved per auto mode)
key_files:
  created:
    - cha-bio-safety/src/pages/ExtinguishersListPage.tsx
    - .planning/phases/24-extinguisher-asset-location/sketches/24-03-list-page.html
    - .planning/phases/24-extinguisher-asset-location/sketches/24-03-modals.html
  modified:
    - cha-bio-safety/src/App.tsx
    - cha-bio-safety/src/components/SideMenu.tsx
    - cha-bio-safety/src/components/DesktopSidebar.tsx
    - cha-bio-safety/src/utils/api.ts
decisions:
  - sketch-first auto-approved (auto mode active; user will review consolidated at Wave 4 deploy)
  - has_records drives 삭제/폐기 button branch deterministically — no 409-trial pattern
  - /extinguishers NOT added to MOBILE_NO_NAV_PATHS (BottomNav visible per UI-SPEC)
  - DEFAULT_SIDE_MENU forward-merge handles existing users automatically (Phase 21 pattern)
metrics:
  duration_minutes: 7
  tasks_completed: 2
  files_created: 3
  files_modified: 4
  total_files: 7
---

# Phase 24 Plan 03: ExtinguishersListPage Summary

**One-liner:** React 소화기 자산 관리 페이지 (984줄) — filter bar 2rows + 카드 4상태 + 6 mutations + 5 modals (등록/수정/분리/폐기/삭제) + 메뉴 3곳 + 라우트 wiring.

## What was built

### Task 1: Sketch HTML 2종

**`24-03-list-page.html`** — self-contained HTML sketch:
- Page header (48px) + 마커 동행 배너 + filter bar (tabs + dropdowns + search)
- Card grid 4종: 미배치+미점검(collapsed), 미배치+점검O, 매핑됨(expanded), 폐기
- All 4 expanded state button variants visualized
- Empty state + skeleton loading + BottomNav placeholder
- mapping-state badge 3색 LOCKED (미배치=danger, 매핑됨=acl, 폐기=warn)

**`24-03-modals.html`** — self-contained HTML sketch:
- 신규 등록 모달 (기본 + 마커동행 변형)
- 정보 수정 모달: counter chip 3변형 (n=0 회색 / 1~3 파랑 / >3 빨강 + microcopy)
- Confirm 4종 (소화기 분리 / 위치 스왑 / 소화기 폐기 / 소화기 삭제) — UI-SPEC §Copywriting verbatim

### Task 2: ExtinguishersListPage.tsx 구현

**`src/pages/ExtinguishersListPage.tsx`** (984 lines):

| 구성요소 | 설명 |
|---------|------|
| Filter bar (row1) | 전체/미배치/매핑/폐기 tab chips (mapping-state filter) |
| Filter bar (row2) | zone/floor/type selects + 검색 input |
| Card (collapsed) | 종류+badge / 증지번호·제조번호 mono / location / warning chip |
| Card (expanded) | detail grid + action row 상태 머신 |
| State machine | `has_records` → 미배치+미점검: 삭제 / 미배치+점검O: 폐기 / 매핑됨: 분리 / 폐기: 조회 |
| RegisterModal | 7 fields + type 3-col grid + info banner + 마커동행 auto-assign |
| EditModal | 카운터 칩 3변형 + 변경≤3 enforce + changed field border acl |
| ConfirmModal | 분리/스왑/폐기/삭제 — 정확한 한글 카피 |
| Empty/Error/Skeleton | `해당하는 소화기가 없습니다` / `다시 시도` / blink skeleton |
| 마커 동행 | `?fromMarker=` context — 등록후 자동 assign + navigate(-1) |
| Responsive grid | 1col (<768) / 2col (768-1023) / 3col (≥1024 via useIsDesktop) |
| paddingBottom | `calc(var(--sab) + 70px)` — BottomNav 예약 |

**6 mutations (모두 `qc.invalidateQueries(['extinguishers'])` 포함):**
- `updateMutation` → extinguisherApi.update
- `assignMutation` → extinguisherApi.assign (+ floorplan-markers invalidate)
- `unassignMutation` → extinguisherApi.unassign
- `swapMutation` → extinguisherApi.swap
- `disposeMutation` → extinguisherApi.dispose
- `removeMutation` → extinguisherApi.remove

### Modified files

| File | Change |
|------|--------|
| `SideMenu.tsx` | 시설 관리 섹션 `{ label: '소화기', path: '/extinguishers' }` 추가 (소방 시설 도면 뒤) |
| `DesktopSidebar.tsx` | DESKTOP_SECTIONS 시설 관리 paths에 `/extinguishers` 추가 |
| `api.ts` | DEFAULT_SIDE_MENU 시설 관리 divider 아래 `/extinguishers` item 추가 |
| `App.tsx` | lazy import + `PAGE_TITLES['/extinguishers'] = '소화기 관리'` + `<Route path="/extinguishers">` |

### Navigate contract (Wave 3/4에서 재사용 가능)

```typescript
// 리스트 → 도면 (소화기 배치 흐름)
navigate(`/floorplan?planType=extinguisher&placingExtinguisher=${item.id}&zone=${item.zone}&floor=${item.floor}`)

// 도면/점검 → 리스트 (마커 동행 흐름)
navigate(`/extinguishers?fromMarker=${checkPointId}&zone=${zone}&floor=${floor}`)
```

## Verification Results

| Check | Expected | Result |
|-------|----------|--------|
| ExtinguishersListPage.tsx line count | ≥ 400 | 984 PASS |
| 6 mutations (update/assign/unassign/swap/dispose/remove) | 6 | 6 PASS |
| extinguisherApi.create (skip_marker) | ≥ 1 | 1 PASS |
| mapping-state badge 3 colors | ≥ 3 | 5 PASS |
| 변경: counter text | ≥ 1 | 1 PASS |
| 4개 이상 변경 microcopy | ≥ 1 | 1 PASS |
| 4 confirm modal titles | ≥ 4 | 6 PASS |
| has_records state machine | ≥ 1 | 2 PASS |
| 해당하는 소화기가 없습니다 | ≥ 1 | 1 PASS |
| SideMenu /extinguishers | 1 | 1 PASS |
| DesktopSidebar /extinguishers | 1 | 1 PASS |
| api.ts DEFAULT_SIDE_MENU /extinguishers | ≥ 1 | 10 PASS |
| App.tsx Route /extinguishers | ≥ 1 | 2 PASS |
| App.tsx PAGE_TITLES 소화기 관리 | 1 | 1 PASS |
| MOBILE_NO_NAV_PATHS without /extinguishers | 0 | 0 PASS |
| tsc --noEmit | 0 errors | PASS (worktree no node_modules; main project 0 errors) |

## Deviations from Plan

None — plan executed exactly as written. Auto mode active: sketches auto-approved, no checkpoint pause.

## Known Stubs

None. All data flows through extinguisherApi (real backend from Plan 02).

## Threat Flags

No new network endpoints or auth paths introduced. All mutations inherit JWT auth from existing `extinguisherApi` namespace (Plan 02 provides the endpoints).

Security coverage per threat model:
- T-24-17: URL ?fromMarker= untrusted — assign API validates cp existence (Plan 02 backend guard)
- T-24-18: counter≤3 client UX — PUT endpoint enforces server-side (Plan 02 backend)
- T-24-19: toast uses `e?.message ?? '요청 실패'` pattern
- T-24-20: `/extinguishers` route wrapped in `<Auth>` component
- T-24-21: forward-merge handles localStorage MenuConfig gaps

## Self-Check: PASSED

- [x] ExtinguishersListPage.tsx exists (984 lines)
- [x] sketch HTML 2 files exist in sketches/
- [x] SideMenu.tsx contains /extinguishers
- [x] DesktopSidebar.tsx contains /extinguishers
- [x] api.ts DEFAULT_SIDE_MENU contains /extinguishers
- [x] App.tsx Route /extinguishers exists + PAGE_TITLES entry
- [x] MOBILE_NO_NAV_PATHS does NOT contain /extinguishers
- [x] Commits: eeb2dec (sketches), 2470dcc (implementation)
- [x] No STATE.md or ROADMAP.md modified
