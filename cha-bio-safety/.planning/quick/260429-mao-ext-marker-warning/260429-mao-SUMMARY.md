---
phase: quick-260429-mao
plan: 01
subsystem: floorplan-extinguisher
tags: [floorplan, extinguisher, ui, marker, replace-warning]
requires: [src/utils/api.ts (extinguisherApi.list, FloorPlanMarker), src/pages/FloorPlanPage.tsx, src/pages/InspectionPage.tsx]
provides: [getReplaceWarning helper, REPLACE_WARNING_STROKE mapping, ReplaceWarning type, MarkerIcon strokeColor/strokeWidth/dangerBadge props, cpIdToWarning Map in FloorPlanPage]
affects: [도면 페이지(FloorPlanPage) 분말 소화기 마커 시각 강조, InspectionPage 소화기 동작은 무변화]
tech-stack:
  added: []
  patterns: [single-source helper extraction, conditional useQuery via enabled flag, optional MarkerIcon props with backward-compatible defaults]
key-files:
  created:
    - src/utils/extinguisher.ts
  modified:
    - src/pages/InspectionPage.tsx
    - src/pages/FloorPlanPage.tsx
decisions:
  - 분말 소화기 교체 연한 강조는 시안 A안(stroke 색/두께 + danger ! 배지)으로 확정
  - InspectionPage 의 inline 계산 + getReplaceStatus 두 곳을 동일 헬퍼로 위임 (single source of truth)
  - MarkerIcon 의 다른 case 들은 strokeColor/strokeWidth prop 을 사용하지 않고 기존 하드코딩 유지 (외형 무변화 보장)
  - planType !== 'extinguisher' 일 때 useQuery(enabled:false) 로 불필요한 fetch 방지
metrics:
  duration: ~25 min
  completed: 2026-04-29
---

# Quick Task 260429-mao: 도면 분말 소화기 마커 연한 경고 강조 (A안) Summary

도면 페이지(FloorPlanPage) 의 분말 소화기 마커 (fire_extinguisher, ext_powder20) 가 제조 후 10년 만료를 기준으로 warn(1년 전)/imminent(6개월 전)/danger(연한 초과) 단계에 따라 stroke 색·두께를 강조하고 danger 시 우상단 ! 배지를 표시하도록 추가. InspectionPage 의 동일 계산 로직 두 곳을 신규 헬퍼로 통합해 single source of truth 확립.

## 변경 요약

### 1) 신규 파일 — `src/utils/extinguisher.ts`

- `getReplaceWarning(type, manufacturedAt)` — 분말 여부 + 제조일 기반으로 `'warn' | 'imminent' | 'danger' | null` 반환.
- `REPLACE_WARNING_STROKE` — 시안 A안 매핑:
  - warn: `#eab308`, 1.5px
  - imminent: `#f97316`, 2px
  - danger: `#ef4444`, 2.5px
- `ReplaceWarning` 타입 export.

### 2) `src/pages/InspectionPage.tsx`

- import 1줄 추가: `import { getReplaceWarning } from '../utils/extinguisher'`
- 라인 ~3289~3303 inline replaceWarning 계산 → 한 줄 헬퍼 호출로 교체. 이후 `rwStyle[replaceWarning]` 등 사용부 그대로.
- 라인 ~3493~3505 `getReplaceStatus()` → 헬퍼 위임 한 줄로 단순화. 함수 시그니처/이름 그대로 유지하여 카운트/필터/정렬 호출처(라인 3505~3520, 3616 등) 무수정.

### 3) `src/pages/FloorPlanPage.tsx`

- React 의 `useMemo` import 추가 (기존엔 없었음).
- `getReplaceWarning, REPLACE_WARNING_STROKE, ReplaceWarning` import 추가.
- `MarkerIcon` 시그니처에 optional `strokeColor` (default `'#fff'`), `strokeWidth` (default `1.5`), `dangerBadge` (default `false`) 추가. switch 본체를 `return` 대신 `svg = ...; break` 형태로 변환하고, 분말 2종 case (`fire_extinguisher`, `ext_powder20`) 만 prop 을 사용. 그 외 case (wall_exit, ceiling_exit, stair/hallway/room/seat_corridor, smoke/heat_detector, closed/open/king_head, test_valve, ext_halogen, ext_kitchen_k, indoor_hydrant, descending_lifeline, div_marker, flame, default) 모두 기존 하드코딩 stroke 그대로 보존 — 외형 무변화 검증 끝남.
- 분말 20kg 도넛 안쪽 흰선은 시각 정체성이라 prop 화 X, `#fff/1.5` 유지.
- `dangerBadge` true 일 때 SVG 를 `position:relative` div 로 감싸고 우상단(-8/-8) 12×12 빨간 ! 배지 (흰 1.5px 테두리, fontSize 9, fontWeight 900, lineHeight 1, `pointerEvents: 'none'`) 추가.
- `extListQuery`: `useQuery(['extinguishers', floor], extinguisherApi.list({ floor }))`, `enabled: planType === 'extinguisher'`, `staleTime: 300_000`.
- `cpIdToWarning`: `useMemo` 로 `Map<string, NonNullable<ReplaceWarning>>` 구성. items 순회하여 `getReplaceWarning(it.type, it.manufactured_at)` 결과가 truthy 이고 `it.cp_id` 존재 시 매핑.
- 마커 렌더 루프(`{imgLoaded && markers.map(m => ...)}` line ~975~) 의 `<MarkerIcon ... />` 호출을 IIFE 로 감싸 `isPowder` 판정 → `cpIdToWarning.get(check_point_id)` lookup → `REPLACE_WARNING_STROKE[warning]` 또는 default 로 props 전달. `dangerBadge={warning === 'danger'}`.

## Verification

```text
✓ npm run build  → 통과 (FloorPlanPage 54.61 KB / InspectionPage 168.53 KB)
✓ grep -c "export function getReplaceWarning" src/utils/extinguisher.ts == 1
✓ grep -rn "getReplaceWarning" src/pages/   → InspectionPage 3건 (import + 2 호출), FloorPlanPage 2건 (import + useMemo)
✓ grep -n "dangerBadge" src/pages/FloorPlanPage.tsx → 5건 (주석 + 시그니처 default + 시그니처 type + 분기 + 호출)
✓ grep -rn "REPLACE_WARNING_STROKE" src/ → 3건 (utils 정의 + FloorPlanPage import + 사용)
✓ grep -c "queryKey: \['extinguishers'" src/pages/FloorPlanPage.tsx == 1
```

## Deviations from Plan

None — plan 그대로 실행. PLAN.md 의 Step 1~5 모두 준수했고 헬퍼 추출 + 양쪽 사용처 교체를 single atomic 커밋으로 묶음.

## Manual Verification (사용자 PWA 검증 — 배포 후)

- 도면 페이지 → 소화기·소화전 → 분말 마커 외형:
  - 정상 (warning=null) → 흰 stroke 1.5px (현재와 동일)
  - warn → 노랑 stroke 1.5px
  - imminent → 주황 stroke 2px
  - danger → 빨강 stroke 2.5px + 우상단 ! 배지
- 분말 외 마커 (할로겐/K급/소화전/완강기/DIV) 외형 동일
- 다른 planType (유도등/감지기/스프링클러) 모든 마커 외형 동일
- 마커 클릭/드래그/선택 outline (2.5px solid #3b82f6) 동작 동일 — ! 배지가 클릭 통과 (pointerEvents:none)
- InspectionPage 소화기 리스트 → danger/imminent/warn 카운트, 필터, 정렬, 뱃지 텍스트 동일
- InspectionPage 소화기 점검 모달 → 상세정보 카드의 replaceWarning 뱃지 동일

## Commit

```
5a2005d fix(quick-260429-mao): 도면 분말 소화기 마커 연한 경고 강조 (A안)
```

3 files changed, 158 insertions(+), 52 deletions(-)

## Self-Check: PASSED

- [x] src/utils/extinguisher.ts 존재
- [x] src/pages/InspectionPage.tsx import 추가 + 2 호출 교체
- [x] src/pages/FloorPlanPage.tsx import + MarkerIcon 확장 + useQuery + cpIdToWarning + 마커 렌더 루프 수정
- [x] 커밋 5a2005d 존재
- [x] npm run build 통과
- [x] grep 검증 5종 통과
