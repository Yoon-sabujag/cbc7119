---
phase: quick-260429-mao
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/utils/extinguisher.ts
  - src/pages/InspectionPage.tsx
  - src/pages/FloorPlanPage.tsx
autonomous: true
requirements: [QUICK-260429-mao]

must_haves:
  truths:
    - "신규 헬퍼 src/utils/extinguisher.ts 가 분말 소화기 교체 경고 단계 (warn/imminent/danger/null) 를 단일 source 로 계산한다"
    - "InspectionPage 의 인라인 replaceWarning 계산과 getReplaceStatus 함수가 모두 신규 헬퍼를 호출하도록 교체되며 기존 동작 (뱃지 색/텍스트, 정렬, 카운트) 은 변하지 않는다"
    - "FloorPlanPage 가 planType==='extinguisher' 일 때만 floor 별 소화기 데이터를 useQuery 로 fetch 하고, check_point_id → ReplaceWarning Map 을 구성한다"
    - "분말 마커 (fire_extinguisher, ext_powder20) 가 warn 시 #eab308/1.5px, imminent 시 #f97316/2px, danger 시 #ef4444/2.5px stroke 로 강조되고 danger 마커는 우상단 빨강 ! 배지 (12px, 흰 1.5px 테두리) 가 표시된다"
    - "분말 마커가 정상 (warning=null) 이거나 분말이 아닌 마커 (할로겐/K급/소화전/완강기/DIV/기타 planType 모든 마커) 는 외형이 변하지 않는다 (default stroke #fff/1.5px, ! 배지 없음)"
    - "마커 fill 색 (STATUS_COLOR — 점검 결과) 은 기존 그대로 유지되고 stroke/배지만 추가된다"
    - "danger ! 배지가 selected outline (2.5px solid #3b82f6) 과 시각적 충돌 없이 표시된다"
    - "npm run build 가 통과한다"

  artifacts:
    - path: "src/utils/extinguisher.ts"
      provides: "getReplaceWarning() 헬퍼 + REPLACE_WARNING_STROKE 매핑 + ReplaceWarning 타입"
      exports: ["getReplaceWarning", "REPLACE_WARNING_STROKE", "ReplaceWarning"]
    - path: "src/pages/InspectionPage.tsx"
      provides: "신규 헬퍼 import + 기존 inline 계산 2곳 (line 3289~3303 인라인, line 3493~3505 getReplaceStatus) 교체"
      contains: "import { getReplaceWarning } from '../utils/extinguisher'"
    - path: "src/pages/FloorPlanPage.tsx"
      provides: "planType=extinguisher 시 소화기 데이터 useQuery + cpIdToWarning Map + MarkerIcon prop 확장 (strokeColor/strokeWidth/dangerBadge) + 분말 마커 2종에 prop 전달"
      contains: "REPLACE_WARNING_STROKE"
      contains_2: "dangerBadge"

  key_links:
    - from: "src/pages/InspectionPage.tsx"
      to: "src/utils/extinguisher.ts"
      via: "import { getReplaceWarning }"
      pattern: "from '\\.\\./utils/extinguisher'"
    - from: "src/pages/FloorPlanPage.tsx"
      to: "src/utils/extinguisher.ts"
      via: "import { getReplaceWarning, REPLACE_WARNING_STROKE }"
      pattern: "from '\\.\\./utils/extinguisher'"
    - from: "src/pages/FloorPlanPage.tsx (useQuery)"
      to: "extinguisherApi.list({ floor })"
      via: "queryKey ['extinguishers', floor], enabled: planType==='extinguisher'"
      pattern: "extinguisherApi\\.list"
    - from: "FloorPlanPage 마커 렌더 루프 (line ~898~928)"
      to: "MarkerIcon (strokeColor/strokeWidth/dangerBadge props)"
      via: "분말 마커 (fire_extinguisher | ext_powder20) 일 때만 cpIdToWarning Map lookup → REPLACE_WARNING_STROKE 적용"
      pattern: "dangerBadge=\\{warning === 'danger'\\}"
---

<objective>
도면 페이지 (FloorPlanPage) 의 분말 소화기 마커 (fire_extinguisher, ext_powder20) 에 교체 연한 경고를 시각적으로 강조한다 — 사용자 승인 시안 A안 (.sketches/extinguisher-marker-warning.html).

stroke 색/두께만 변경하고 danger 시 우상단 ! 배지를 추가한다. 마커 fill (점검 결과 색) 은 그대로 유지.

InspectionPage 의 inline replaceWarning 계산과 getReplaceStatus() 가 동일 로직을 갖고 있어 헬퍼 함수로 추출 후 양쪽에서 공유 — single source of truth.

Purpose: 현장에서 도면을 볼 때 교체 임박/초과 분말 소화기를 한눈에 식별. 5월 법정점검 실전 검증에 도움.
Output: 새 utility 파일 1개 + InspectionPage/FloorPlanPage 수정. 단일 atomic 커밋.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@./CLAUDE.md
@.planning/STATE.md

<!-- 작업 메인 파일들 — executor 가 직접 읽어 구체 패턴 파악 -->
@src/pages/FloorPlanPage.tsx
@src/pages/InspectionPage.tsx
@src/utils/api.ts

<!-- 사용자 승인 시안 — A안 디자인 참조 -->
@.sketches/extinguisher-marker-warning.html

<interfaces>
<!-- executor 가 코드베이스 탐색 없이 바로 사용할 수 있도록 발췌 -->

From src/utils/api.ts (이미 존재 — 신규 추가하지 말 것):

```typescript
export interface ExtinguisherDetail {
  mgmt_no: string
  zone: string
  floor: string
  location: string
  type: string
  approval_no: string | null
  manufactured_at: string | null
  manufacturer: string | null
  prefix_code: string | null
  seal_no: string | null
  serial_no: string | null
  note: string | null
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
  list: (params?: { floor?: string; zone?: string; type?: string; q?: string }) => { ... },
  create: (data: { ... }) => ...,
}
// 주의: list() 응답 items[] 는 ExtinguisherDetail 에 { seq_no, cp_id } 가 추가된 형태.
// cp_id 가 floorplan_markers.check_point_id 와 매칭됨.
```

From src/pages/FloorPlanPage.tsx (line 93~195) 기존 MarkerIcon 시그니처:

```typescript
function MarkerIcon({ markerType, color, size = 20 }: {
  markerType: string | null; color: string; size?: number
}) { /* switch (markerType) { ... } */ }
```

From src/pages/FloorPlanPage.tsx (line 1, 3, 5) 기존 import 패턴:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { floorPlanMarkerApi, inspectionApi, extinguisherApi, scheduleApi, api,
         type FloorPlanMarker, type ExtinguisherDetail } from '../utils/api'
```

extinguisherApi 는 이미 import 되어 있음 — 추가 import 불필요.

From src/pages/FloorPlanPage.tsx (line 344~) 기존 useQuery 패턴 (참고용):

```typescript
const markersQuery = useQuery({
  queryKey: ['floorplan-markers', floor, planType],
  queryFn: () => floorPlanMarkerApi.list(floor, planType),
  // ...
})
```

From src/pages/InspectionPage.tsx 교체 대상 2곳:

1) line 3289~3303 (소화기 상세정보 카드 inline 계산):
```typescript
let replaceWarning: 'danger' | 'imminent' | 'warn' | null = null
if (extDetail.type?.includes('분말') && extDetail.manufactured_at) {
  const [y, m] = extDetail.manufactured_at.split('-').map(Number)
  if (y && m) {
    const expiry = new Date(y + 10, m - 1)
    const imm = new Date(expiry); imm.setMonth(imm.getMonth() - 6)
    const warn = new Date(expiry); warn.setFullYear(warn.getFullYear() - 1)
    const now = new Date()
    if (now >= expiry) replaceWarning = 'danger'
    else if (now >= imm) replaceWarning = 'imminent'
    else if (now >= warn) replaceWarning = 'warn'
  }
}
```

2) line 3493~3505 (소화기 리스트 페이지 — 카운트/필터/정렬 source):
```typescript
function getReplaceStatus(item: any): 'danger' | 'imminent' | 'warn' | null {
  if (!item.type?.includes('분말') || !item.manufactured_at) return null
  const [y, m] = item.manufactured_at.split('-').map(Number)
  if (!y || !m) return null
  const expiry = new Date(y + 10, m - 1)
  const imm = new Date(expiry); imm.setMonth(imm.getMonth() - 6)
  const warn = new Date(expiry); warn.setFullYear(warn.getFullYear() - 1)
  const now = new Date()
  if (now >= expiry) return 'danger'
  if (now >= imm) return 'imminent'
  if (now >= warn) return 'warn'
  return null
}
```

두 계산 로직 완전히 동일 — getReplaceWarning(type, manufactured_at) 로 통일.

From src/pages/FloorPlanPage.tsx (line 897~928) 기존 마커 렌더 루프:

```tsx
{imgLoaded && markers.map(m => {
  const color = STATUS_COLOR[getMarkerStatus(m)] ?? STATUS_COLOR.normal
  const isDragging = dragId === m.id && dragPos
  const xPct = isDragging ? dragPos.x_pct : m.x_pct
  const yPct = isDragging ? dragPos.y_pct : m.y_pct
  const px = imgRect.offX + (xPct / 100) * imgRect.w
  const py = imgRect.offY + (yPct / 100) * imgRect.h
  return (
    <div key={m.id} onClick={...} ... style={{
      position: 'absolute', left: px, top: py,
      transform: `translate(-50%, -50%) scale(${...})`,
      // outline: selected 시 '2.5px solid #3b82f6'
      ...
    }}>
      <MarkerIcon markerType={m.marker_type} color={color} size={13} />
    </div>
  )
})}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: 헬퍼 추출 + InspectionPage 교체 + FloorPlanPage 마커 강조 적용</name>
  <files>src/utils/extinguisher.ts, src/pages/InspectionPage.tsx, src/pages/FloorPlanPage.tsx</files>
  <action>
세 파일을 한 task 로 묶어서 처리한다 — 헬퍼 추출 후 양쪽 사용처를 같은 커밋에 정리해야 일관성 보장 (헬퍼만 만들고 사용처를 안 바꾸면 dead code, 사용처를 먼저 바꾸면 헬퍼 미존재로 빌드 실패).

순서:

### Step 1 — src/utils/extinguisher.ts (신규 파일 작성)

```typescript
// 분말 소화기 교체 연한 경고 (제조 후 10년 만료 기준)
//   - warn:     만료 1년 전 도래 (교체 준비 필요)
//   - imminent: 만료 6개월 전 (교체 시급)
//   - danger:   연한 초과 (즉시 교체 필요)
//   - null:     해당 없음 (분말 아님 / 제조일 없음 / 아직 1년 이상 남음)
//
// InspectionPage 인라인 계산 + getReplaceStatus + FloorPlanPage 마커 강조
// 모두 이 single source 를 사용한다.

export type ReplaceWarning = 'warn' | 'imminent' | 'danger' | null

export function getReplaceWarning(
  type: string | undefined | null,
  manufacturedAt: string | undefined | null,
): ReplaceWarning {
  if (!type?.includes('분말') || !manufacturedAt) return null
  const [y, m] = manufacturedAt.split('-').map(Number)
  if (!y || !m) return null
  const expiry = new Date(y + 10, m - 1)
  const imm = new Date(expiry); imm.setMonth(imm.getMonth() - 6)
  const warn = new Date(expiry); warn.setFullYear(warn.getFullYear() - 1)
  const now = new Date()
  if (now >= expiry) return 'danger'
  if (now >= imm) return 'imminent'
  if (now >= warn) return 'warn'
  return null
}

// 마커 stroke 매핑 (시안 A안 — 사용자 승인됨)
export const REPLACE_WARNING_STROKE: Record<NonNullable<ReplaceWarning>, { color: string; width: number }> = {
  warn:     { color: '#eab308', width: 1.5 },
  imminent: { color: '#f97316', width: 2   },
  danger:   { color: '#ef4444', width: 2.5 },
}
```

### Step 2 — src/pages/InspectionPage.tsx (2곳 교체, 동작 무변화)

(a) 파일 상단 import 영역 (다른 utils import 옆) 에 추가:
```typescript
import { getReplaceWarning } from '../utils/extinguisher'
```

(b) line ~3289~3303 inline 계산 블록 교체:

기존:
```typescript
let replaceWarning: 'danger' | 'imminent' | 'warn' | null = null
if (extDetail.type?.includes('분말') && extDetail.manufactured_at) {
  const [y, m] = extDetail.manufactured_at.split('-').map(Number)
  if (y && m) {
    const expiry = new Date(y + 10, m - 1)
    const imm = new Date(expiry); imm.setMonth(imm.getMonth() - 6)
    const warn = new Date(expiry); warn.setFullYear(warn.getFullYear() - 1)
    const now = new Date()
    if (now >= expiry) replaceWarning = 'danger'
    else if (now >= imm) replaceWarning = 'imminent'
    else if (now >= warn) replaceWarning = 'warn'
  }
}
```

신규 (한 줄):
```typescript
const replaceWarning = getReplaceWarning(extDetail.type, extDetail.manufactured_at)
```

이후 rwStyle[replaceWarning] 등 사용부는 그대로 둔다 (타입 호환 — 'danger'|'imminent'|'warn'|null 동일).

(c) line ~3493~3505 getReplaceStatus 함수 교체:

기존:
```typescript
function getReplaceStatus(item: any): 'danger' | 'imminent' | 'warn' | null {
  if (!item.type?.includes('분말') || !item.manufactured_at) return null
  const [y, m] = item.manufactured_at.split('-').map(Number)
  // ... (동일 로직)
}
```

신규 (헬퍼 위임):
```typescript
function getReplaceStatus(item: any): 'danger' | 'imminent' | 'warn' | null {
  return getReplaceWarning(item?.type, item?.manufactured_at)
}
```

함수 시그니처/이름은 유지 (line 3516~3520, 3616 등 기존 호출처 모두 그대로 동작).

### Step 3 — src/pages/FloorPlanPage.tsx 변경 (3 sub-step)

(a) 파일 상단 import 추가:
```typescript
import { getReplaceWarning, REPLACE_WARNING_STROKE, type ReplaceWarning } from '../utils/extinguisher'
```

(b) MarkerIcon 시그니처 확장 (line 93) — 기본값으로 기존 동작 보존:

기존:
```typescript
function MarkerIcon({ markerType, color, size = 20 }: {
  markerType: string | null; color: string; size?: number
}) {
  const s = size
  const hs = s / 2
  switch (markerType) { ... }
}
```

신규:
```typescript
function MarkerIcon({
  markerType, color, size = 20,
  strokeColor = '#fff', strokeWidth = 1.5, dangerBadge = false,
}: {
  markerType: string | null; color: string; size?: number;
  strokeColor?: string; strokeWidth?: number; dangerBadge?: boolean;
}) {
  const s = size
  const hs = s / 2

  // 분말 소화기 마커 (fire_extinguisher, ext_powder20) 만 strokeColor/strokeWidth 적용.
  // 다른 마커는 기존 stroke="#fff" strokeWidth={1.5} 등 하드코딩 그대로 유지.
  let svg: JSX.Element
  switch (markerType) {
    case 'fire_extinguisher': // ● 원 (분말3.3kg)
      svg = (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={hs} cy={hs} r={hs-1} fill={color} stroke={strokeColor} strokeWidth={strokeWidth}/>
        </svg>
      )
      break
    case 'ext_powder20': // ◎ 도넛 (분말20kg)
      // 외곽 stroke 만 prop 화. 안쪽 도넛 흰선은 시각 정체성이라 #fff/1.5 유지.
      svg = (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={hs} cy={hs} r={hs-1} fill={color} stroke={strokeColor} strokeWidth={strokeWidth}/>
          <circle cx={hs} cy={hs} r={hs*0.4} fill="none" stroke="#fff" strokeWidth={1.5}/>
        </svg>
      )
      break
    // ── 나머지 case 들은 기존 코드 그대로 (stroke="#fff" strokeWidth={1.5} 등 하드코딩 유지) ──
    case 'wall_exit':
      svg = <svg ...>...</svg>  // 기존 그대로
      break
    // ... (모든 기존 case 동일하게 유지, default 까지)
    default:
      svg = <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}><circle cx={hs} cy={hs} r={hs-1} fill={color} stroke="#fff" strokeWidth={1.5}/></svg>
  }

  if (!dangerBadge) return svg

  // danger 마커 — 우상단 ! 배지 (시안 A안)
  return (
    <div style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
      {svg}
      <div style={{
        position: 'absolute',
        top: -8,
        right: -8,
        width: 12,
        height: 12,
        background: '#ef4444',
        border: '1.5px solid #fff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 9,
        fontWeight: 900,
        color: '#fff',
        lineHeight: 1,
        pointerEvents: 'none',
      }}>!</div>
    </div>
  )
}
```

중요:
- switch 문 변환 시 기존 모든 case 의 SVG 내용은 그대로 보존 — 단지 return 을 변수 svg 에 할당하는 형태로 리팩터링. 이미 알려진 case 별 stroke="#fff" strokeWidth={1.5} 같은 하드코딩은 분말 2종 외에 그대로 둔다 (descending_lifeline 의 strokeWidth={2.5}, smoke_detector 의 stroke={color}, open_head 의 stroke={color} 등 의도된 값 보존).
- 분말 case 는 break 후 마지막의 dangerBadge 처리 통합 분기로 자연스럽게 흐름.
- pointerEvents: 'none' 으로 ! 배지 클릭 통과 — 기존 마커 클릭 동작 안 깨짐.

(c) FloorPlanPage 컴포넌트 본체 — useQuery 추가 + 마커 렌더 루프 수정:

(c-1) markersQuery 정의 근처 (line ~344) 다음에 소화기 데이터 useQuery 추가:

```typescript
// planType=extinguisher 일 때만 floor 별 소화기 데이터 fetch (마커 강조용)
const extListQuery = useQuery({
  queryKey: ['extinguishers', floor],
  queryFn: () => extinguisherApi.list({ floor }),
  enabled: planType === 'extinguisher',
  staleTime: 300_000, // 5분
})

// check_point_id → ReplaceWarning Map (분말 마커 강조용 lookup)
const cpIdToWarning = useMemo(() => {
  const map = new Map<string, NonNullable<ReplaceWarning>>()
  if (planType !== 'extinguisher') return map
  const items = extListQuery.data?.items ?? []
  for (const it of items) {
    const w = getReplaceWarning(it.type, it.manufactured_at)
    if (w && it.cp_id) map.set(it.cp_id, w)
  }
  return map
}, [extListQuery.data, planType])
```

useMemo 가 이미 import 되어 있는지 확인 후 없으면 React import 에 추가.

(c-2) 마커 렌더 루프 (line ~898~928) 수정:

기존:
```tsx
<MarkerIcon markerType={m.marker_type} color={color} size={13} />
```

신규 (분말 마커 strokeColor/strokeWidth/dangerBadge 전달):
```tsx
{(() => {
  const isPowder = m.marker_type === 'fire_extinguisher' || m.marker_type === 'ext_powder20'
  const warning = isPowder && m.check_point_id ? (cpIdToWarning.get(m.check_point_id) ?? null) : null
  const stroke = warning ? REPLACE_WARNING_STROKE[warning] : { color: '#fff', width: 1.5 }
  return (
    <MarkerIcon
      markerType={m.marker_type}
      color={color}
      size={13}
      strokeColor={stroke.color}
      strokeWidth={stroke.width}
      dangerBadge={warning === 'danger'}
    />
  )
})()}
```

selected outline 과 ! 배지 충돌 방지:
- 마커 컨테이너 div 의 `outlineOffset: 2` 가 이미 outline 을 마커 바깥으로 띄움.
- ! 배지는 SVG 우상단 -8/-8 absolute → outline 과 겹치는 영역에 위치하지만 dangerBadge 는 빨강 fill + 흰 테두리로 outline 위에 시각적으로 잘 식별됨.
- 만약 시각 충돌이 명확하면 dangerBadge wrapper 의 z-index 조정도 가능 (현재 inline-block + absolute 조합으로 자연스럽게 마커 div 의 zIndex 1/10/50 안에 묶여 따라감 — 추가 z-index 불필요).

기타 제약 재확인:
- 정상 분말 마커 (warning=null) → strokeColor='#fff', strokeWidth=1.5, dangerBadge=false → 외형 무변화
- 분말 외 마커 → MarkerIcon 의 다른 case 들은 강제 흰 stroke 유지
- 점검 결과 fill (color = STATUS_COLOR[getMarkerStatus(m)]) 그대로 사용
- planType 변경 시 enabled=false → useQuery refetch 안 함 (cache 유지)
- floor 변경 시 queryKey 바뀌어 재조회 (의도된 동작)
- 모바일/데스크톱 모두 동일 (SVG/inline style 만 사용 — useIsDesktop 분기 불필요)

### Step 4 — 빌드 + grep 검증

```bash
npm run build
```

TypeScript 빌드 통과 확인. 에러 시 즉시 수정.

```bash
grep -n "getReplaceWarning" src/utils/extinguisher.ts        # 1건 (export 정의)
grep -rn "getReplaceWarning" src/pages/                       # InspectionPage import + 2 호출, FloorPlanPage import + useMemo 내부 호출
grep -n "dangerBadge" src/pages/FloorPlanPage.tsx             # MarkerIcon 시그니처 + 조건 분기 + 마커 렌더 prop = 3건 이상
grep -n "REPLACE_WARNING_STROKE" src/pages/FloorPlanPage.tsx  # import + 마커 렌더 lookup = 2건
grep -c 'stroke="#fff"' src/pages/FloorPlanPage.tsx           # 분말 2종이 prop 화 됐으니 기존보다 2~3건 줄어듦 (다른 마커는 그대로)
```

### Step 5 — atomic 커밋

```bash
git add src/utils/extinguisher.ts src/pages/InspectionPage.tsx src/pages/FloorPlanPage.tsx
git commit -m "fix(quick-260429-mao): 도면 분말 소화기 마커 연한 경고 강조 (A안)"
```

배포는 사용자 별도 지시까지 보류 (git push / wrangler deploy 모두 X).
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>
    - src/utils/extinguisher.ts 가 존재하고 getReplaceWarning + REPLACE_WARNING_STROKE + ReplaceWarning 타입을 export
    - InspectionPage line ~3289~3303 inline 계산이 한 줄 헬퍼 호출로 교체됨
    - InspectionPage getReplaceStatus 가 헬퍼 위임으로 단순화됨 (시그니처/이름 유지)
    - FloorPlanPage MarkerIcon 이 strokeColor/strokeWidth/dangerBadge optional prop 을 받고, 분말 2종 (fire_extinguisher, ext_powder20) 에서 prop 사용. 다른 case 는 기존 하드코딩 stroke 유지
    - FloorPlanPage 가 planType==='extinguisher' 일 때 useQuery(['extinguishers', floor], extinguisherApi.list({ floor })) 로 데이터 fetch (staleTime: 300_000)
    - cpIdToWarning Map 이 useMemo 로 구성되어 마커 렌더 루프에서 lookup 됨
    - 분말 마커 렌더 시 warning 결과에 따라 stroke 변경 + danger 시 ! 배지 표시
    - npm run build 통과 — TypeScript 에러 0
    - grep 검증 5종 통과
    - 단일 atomic 커밋 생성 (메시지: "fix(quick-260429-mao): 도면 분말 소화기 마커 연한 경고 강조 (A안)")
  </done>
</task>

</tasks>

<verification>
## Automated

- `npm run build` exit 0
- `grep -n "getReplaceWarning" src/utils/extinguisher.ts` → export 정의 1건
- `grep -rn "getReplaceWarning" src/pages/` → InspectionPage 1 import + 2 호출, FloorPlanPage 1 import + 1 이상 호출
- `grep -n "dangerBadge" src/pages/FloorPlanPage.tsx` → 3건 이상 (시그니처/조건/prop 호출)
- `grep -n "REPLACE_WARNING_STROKE" src/pages/FloorPlanPage.tsx` → 2건 (import + lookup)
- `grep -n "queryKey: \\['extinguishers'" src/pages/FloorPlanPage.tsx` → 1건

## Manual (사용자 검증 — 배포 후)

배포는 사용자 별도 지시까지 보류. 배포 후 사용자 PWA 검증 항목:

- 도면 페이지 → planType=소화기 선택 → 분말 마커 외형 정상 (현재 데이터 기준 모두 흰 stroke; 만료 임박 데이터 있으면 노랑/주황/빨강 + ! 배지 표시)
- 분말 외 마커 (할로겐/K급/소화전/완강기/DIV) 외형 동일
- 다른 planType (유도등/감지기/스프링클러) 모든 마커 외형 동일
- 마커 클릭/드래그/선택 outline 동작 동일 — ! 배지가 클릭 통과
- InspectionPage 소화기 리스트 → 연한 도래/임박/초과 카운트, 필터, 정렬, 뱃지 색/텍스트 모두 기존과 동일
- InspectionPage 소화기 점검 모달 → 상세정보 카드의 replaceWarning 뱃지 (연한 초과/임박/도래) 동일
</verification>

<success_criteria>
- 시안 A안과 시각적으로 일치 (stroke 색 #eab308/#f97316/#ef4444, 두께 1.5/2/2.5, danger 우상단 12px ! 배지)
- 분말 외 모든 마커와 분말 정상 마커는 외형 변화 0
- InspectionPage 소화기 리스트 동작 무변화 (헬퍼 위임만)
- 헬퍼가 single source — InspectionPage 와 FloorPlanPage 가 같은 함수를 호출
- TypeScript 빌드 통과
- 단일 atomic 커밋 생성, push/배포 보류
</success_criteria>

<output>
완료 후 별도 SUMMARY.md 작성 불필요 — quick task 는 PROGRESS.md 또는 커밋 메시지로 충분.

다음 단계: 사용자가 배포 지시 시 `npm run deploy -- --branch production` (한글 커밋 메시지 거부 이슈 시 --commit-message 로 ASCII 별도 지정).
</output>
