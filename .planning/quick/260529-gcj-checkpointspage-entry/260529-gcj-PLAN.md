---
phase: 260529-gcj-checkpointspage-entry
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/utils/checkpointRegistry.ts
  - cha-bio-safety/src/pages/CheckpointsPage.tsx
autonomous: true
requirements: []
tags: [checkpoints, registry, refactor, fire-shutter]

must_haves:
  truths:
    - "데스크톱 /checkpoints 페이지에서 '개소 추가' 모달의 카테고리=방화셔터 선택 시, 기존 generic 폼 대신 registry-기반 새 폼이 렌더링된다."
    - "방화셔터 폼은 office/research/basement 3개 구역 + 각 구역별 실제 DB 룰에 맞는 층 옵션만 보여준다 (8-1F/4F/M 같은 비-방화셔터 층 미노출)."
    - "방화셔터 폼은 구역+층 선택 후 '저장' 클릭 시 id=`CP-{FLOOR}-{SEQ}-FS`, qr_code=id, location_no=`{FLOOR_WITH_F}-{SEQ}` 패턴으로 check_points 에 INSERT 한다."
    - "방화셔터 외 다른 18개 카테고리(소화기/유도등/DIV 등) 선택 시 기존 generic CheckPointModalContent 폼이 그대로 렌더링되어 회귀가 없다."
    - "mode='edit' 진입 시에는 카테고리 무관 기존 CheckPointModalContent 가 그대로 렌더링된다 (이번 wave 는 add 만)."
    - "next seq 계산이 문자열 sort 가 아닌 숫자 sort 로 동작하여 'B1F-10' 다음이 'B1F-11' 로 부여된다."
    - "`cd cha-bio-safety && npm run build` 가 TypeScript/Vite 에러 없이 통과한다."
  artifacts:
    - path: "cha-bio-safety/src/utils/checkpointRegistry.ts"
      provides: "CategoryRegistryEntry 타입 + CATEGORY_REGISTRY 객체 (방화셔터 entry 1개)"
      exports: ["CategoryRegistryEntry", "CATEGORY_REGISTRY"]
      min_lines: 50
    - path: "cha-bio-safety/src/pages/CheckpointsPage.tsx"
      provides: "RegistryDrivenForm 컴포넌트 + 카테고리=방화셔터 분기"
      contains: "RegistryDrivenForm"
  key_links:
    - from: "cha-bio-safety/src/pages/CheckpointsPage.tsx"
      to: "cha-bio-safety/src/utils/checkpointRegistry.ts"
      via: "import { CATEGORY_REGISTRY } from '../utils/checkpointRegistry'"
      pattern: "from '../utils/checkpointRegistry'"
    - from: "RegistryDrivenForm"
      to: "checkPointApi.create"
      via: "useMutation -> POST /api/check-points with registry-generated id/qrCode/locationNo"
      pattern: "checkPointApi\\.create"
    - from: "CheckpointsPage modal switch (around line 690)"
      to: "RegistryDrivenForm or CheckPointModalContent"
      via: "modal.mode === 'add' && form.category in CATEGORY_REGISTRY 분기"
      pattern: "CATEGORY_REGISTRY\\["
---

<objective>
CheckpointsPage 의 '개소 추가' 흐름을 카테고리별 데이터-주도 폼으로 점진 분리한다. 첫 번째 카테고리로 **방화셔터** 를 빼낸다.

Purpose:
- 현재 CheckPointModalContent 한 곳에 19개 카테고리의 룰을 분기 없이 하드코딩한 상태 (legacy 'common' zone, 8-1F/M 같은 비-방화셔터 층 노출, `cp_${Date.now()}` 형식 위반 id, 문자열 sort 함정). 카테고리별 실제 DB 룰을 데이터로 분리해야 신규 개소 등록의 정합성을 회복할 수 있다.
- 방화셔터로 정합 패턴이 확인되면 이후 wave 에서 다른 카테고리(DIV/컴프/유도등/소화전 등)를 같은 entry 형식으로 옮길 수 있다.

Scope (이번 wave 한정):
- 레지스트리 모듈 신설 + 방화셔터 entry 1건
- CheckpointsPage 에 분기 1개 (mode='add' && category='방화셔터' → 새 폼)
- 다른 카테고리/edit 모드는 기존 동작 그대로 보존

Out of scope (이번 wave 아님):
- 방화셔터 외 카테고리 entry 추가
- mode='edit' 의 registry 처리
- API (functions/api/check-points/index.ts) 검증 강화 — 현재 API 가 id/zone/floor non-empty 만 검증하므로 클라이언트가 올바른 패턴을 보내면 통과. registry 가 패턴을 강제하므로 API 수정 불필요.
- 배포 (사용자 명시 OK 시에만)

Output:
- `cha-bio-safety/src/utils/checkpointRegistry.ts` (신규)
- `cha-bio-safety/src/pages/CheckpointsPage.tsx` (수정 — RegistryDrivenForm 추가 + modal 분기)
- 빌드 통과 (`npm run build`)
- 사용자가 데스크톱 화면에서 직접 검증
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.planning/STATE.md

@cha-bio-safety/src/pages/CheckpointsPage.tsx
@cha-bio-safety/functions/api/check-points/index.ts
@cha-bio-safety/src/utils/api.ts

<branch_state>
- 현재 브랜치: `production` (main 아님). 작업은 production 위에서 그대로 진행.
- main 머지/배포는 사용자 명시 OK 시에만. 이 plan 의 task 는 코드 변경 + 빌드 검증까지만 수행.
- production-sync.md 업데이트는 사용자 검증 통과 후 별도 단계 (이 plan 외부).
</branch_state>

<interfaces>
<!-- 코드 탐색 없이 executor 가 바로 쓸 수 있도록 핵심 contract 박제 -->

From cha-bio-safety/src/utils/api.ts (line 293-298):
```typescript
export const checkPointApi = {
  list:       (category?: string) => api.get<CheckPointFull[]>(...),
  categories: () => api.get<string[]>('/check-points?categories=all'),
  create:     (data: CheckPointCreatePayload) => api.post<CheckPointFull>('/check-points', data),
  update:     (id: string, data: CheckPointUpdatePayload) => api.put<CheckPointFull>(`/check-points/${id}`, data),
}
```

From cha-bio-safety/src/types (CheckPointCreatePayload 추정 shape — 기존 호출부 line 171 참조):
```typescript
{
  id: string;                 // 예: 'CP-8F-1-FS'
  qrCode: string;             // 예: 'CP-8F-1-FS' (방화셔터는 id 와 동일)
  floor: string;              // 예: '8F', 'B1'
  zone: BuildingZone;         // 'office' | 'research' | 'basement'
  location: string;           // 자유 텍스트 (예: '투명 E/V 앞')
  category: string;           // '방화셔터'
  description?: string;
  locationNo?: string;        // 예: '8F-1', 'B1F-1'
}
```

From cha-bio-safety/functions/api/check-points/index.ts (POST 검증):
```typescript
if (!body.id?.trim() || !body.qrCode?.trim() || !body.floor || !body.zone
    || !body.location?.trim() || !body.category?.trim())
  return 400 '필수 항목을 모두 입력하세요'
```
→ id, qrCode, floor, zone, location, category 모두 non-empty 필수. registry 폼이 이 6개를 항상 채우면 400 안 남.

From cha-bio-safety/src/pages/CheckpointsPage.tsx 의 modal 렌더 (line 689-693):
```tsx
{modal.open && (
  <ModalWrapper onClose={...} title={modal.mode === 'add' ? '개소 추가' : '개소 수정'}>
    <CheckPointModalContent mode={modal.mode} cp={modal.target} onClose={...} />
  </ModalWrapper>
)}
```
→ 분기를 ModalWrapper **안** content 컴포넌트 선택 지점에서 한다. ModalWrapper 자체 (DesktopModal / BottomSheet) 는 건드리지 않음.

From CheckpointsPage.tsx line 60-68 (재사용할 스타일 상수 — RegistryDrivenForm 에서도 동일 룩 유지):
```typescript
const INPUT_STYLE = { height: 44, background: 'var(--bg3)', border: '1px solid var(--bd)',
  borderRadius: 8, padding: '0 12px', fontSize: 14, color: 'var(--t1)', width: '100%',
  boxSizing: 'border-box', outline: 'none' }
const LABEL_STYLE = { fontSize: 12, fontWeight: 700, color: 'var(--t2)',
  marginBottom: 6, display: 'block' }
```
→ RegistryDrivenForm 도 이 토큰을 그대로 사용해 디자인 회귀 0 유지.
</interfaces>

<registry_spec>
방화셔터 entry 의 LOCKED 룰 (사용자 사전 조사 결과):

- **id pattern**: `CP-{FLOOR}-{SEQ}-FS` (예: `CP-8F-1-FS`, `CP-B1-1-FS`)
- **qr_code**: id 와 동일
- **zones**: `['office', 'research', 'basement']` (3개 다 사용)
- **floorsByZone**:
  - office: `['8F', '7F', '6F', '5F', '3F', '2F']` (8-1F/4F/1F 없음)
  - research: `['8F', '7F', '6F', '5F', '3F', '2F', '1F']` (8-1F/4F 없음)
  - basement: `['B1', 'B2', 'B3', 'B4', 'B5']` (M 없음)
- **location_no pattern**: floor 가 'F' 로 안 끝나면 'F' 추가 + `-{SEQ}`
  - 'B1' → `B1F-1`
  - '8F' → `8F-1` (이미 F 끝나면 그대로)
- **location placeholder**: "투명 E/V 앞" (자유 텍스트)
- **requiresMarker**: false (도면 마커 없이 단독 cp 추가 OK)
- **pairCategory**: 없음
- **assetSeparated**: false (자산 테이블 없음 — check_points 만)
- **formFields**: 없음 (방화셔터 특화 추가 필드 없음)
- **nextSeqStrategy**: 같은 floor 의 기존 location_no 들에서 마지막 숫자만 정규식 추출 → max + 1 (문자열 sort 함정 회피)
</registry_spec>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: 레지스트리 모듈 신설 + 방화셔터 entry</name>
  <files>cha-bio-safety/src/utils/checkpointRegistry.ts</files>
  <behavior>
    - `CategoryRegistryEntry` 타입은 zones / floorsByZone / idPattern / qrPattern / locationNoPattern / locationPlaceholder / requiresMarker / pairCategory? / assetSeparated? / formFields? / nextSeqStrategy 필드를 가진다.
    - `CATEGORY_REGISTRY` 는 Record<string, CategoryRegistryEntry> 이며, '방화셔터' 키 1개만 존재.
    - 방화셔터 entry 의 floorsByZone 은 위 registry_spec 의 정확한 층 리스트만 포함 (8-1F/4F/M 등 누락 보장).
    - `idPattern('8F', 1)` === 'CP-8F-1-FS' / `idPattern('B1', 3)` === 'CP-B1-3-FS'.
    - `qrPattern('CP-8F-1-FS')` === 'CP-8F-1-FS' (identity).
    - `locationNoPattern('B1', 1)` === 'B1F-1' / `locationNoPattern('8F', 2)` === '8F-2' (이미 F 끝나면 중복 추가 X).
    - `nextSeqStrategy(['8F-1', '8F-2', '8F-10'])` === 11 (숫자 sort), `nextSeqStrategy([])` === 1.
  </behavior>
  <action>
신규 파일 `cha-bio-safety/src/utils/checkpointRegistry.ts` 를 작성한다.

구조:

```typescript
// 카테고리별 개소 추가 룰 레지스트리.
// CheckpointsPage 의 RegistryDrivenForm 이 이 데이터를 읽어 폼을 렌더링한다.
// 이번 wave 는 방화셔터만 등록. 후속 wave 에서 카테고리별로 점진 추가.

export interface CategoryRegistryEntry {
  /** 카테고리 키 (= CATEGORY_REGISTRY 의 key 와 동일, 안전성용). */
  category: string
  /** 사용 가능한 구역들. */
  zones: ReadonlyArray<'office' | 'research' | 'basement'>
  /** zone 별 허용 층 리스트 (UI select option). */
  floorsByZone: Record<string, ReadonlyArray<string>>
  /** check_points.id 패턴. */
  idPattern: (floor: string, seq: number) => string
  /** check_points.qr_code 패턴. 보통 idPattern 결과를 그대로. */
  qrPattern: (cpId: string) => string
  /** check_points.location_no 패턴. */
  locationNoPattern: (floor: string, seq: number) => string
  /** location 입력 placeholder. */
  locationPlaceholder: string
  /** 도면 마커 등록이 선행되어야 하는지 여부 (false 면 inline 추가 OK). */
  requiresMarker: boolean
  /** 짝꿍 카테고리 (DIV↔컴프 같은). 이번 wave 사용 X. */
  pairCategory?: string
  /** 자산 테이블(예: extinguishers) 별도 분리 여부. */
  assetSeparated?: boolean
  /** 카테고리 특화 추가 폼 필드 정의 (방화셔터엔 없음). */
  formFields?: Record<string, unknown>
  /**
   * 같은 floor 의 기존 location_no 리스트로부터 다음 seq 계산.
   * 문자열 sort 함정 회피: 마지막 숫자만 정규식 추출해 max + 1.
   * 빈 리스트면 1 반환.
   */
  nextSeqStrategy: (existingLocationNos: string[]) => number
}

/** 공용 next-seq: 마지막 숫자 그룹 정규식 추출 → max + 1. */
function maxNumericSuffixPlusOne(locationNos: string[]): number {
  let max = 0
  for (const ln of locationNos) {
    if (!ln) continue
    const m = ln.match(/(\d+)$/)
    if (m) {
      const n = parseInt(m[1], 10)
      if (n > max) max = n
    }
  }
  return max + 1
}

/** 방화셔터 entry. id `CP-{FLOOR}-{SEQ}-FS`, location_no `{FLOOR_F}-{SEQ}`. */
const FIRE_SHUTTER: CategoryRegistryEntry = {
  category: '방화셔터',
  zones: ['office', 'research', 'basement'],
  floorsByZone: {
    office:   ['8F', '7F', '6F', '5F', '3F', '2F'],
    research: ['8F', '7F', '6F', '5F', '3F', '2F', '1F'],
    basement: ['B1', 'B2', 'B3', 'B4', 'B5'],
  },
  idPattern: (floor, seq) => `CP-${floor}-${seq}-FS`,
  qrPattern: (cpId) => cpId,
  locationNoPattern: (floor, seq) => {
    const f = floor.endsWith('F') ? floor : `${floor}F`
    return `${f}-${seq}`
  },
  locationPlaceholder: '예: 투명 E/V 앞',
  requiresMarker: false,
  nextSeqStrategy: maxNumericSuffixPlusOne,
}

export const CATEGORY_REGISTRY: Record<string, CategoryRegistryEntry> = {
  '방화셔터': FIRE_SHUTTER,
}
```

검증 포인트:
- floor 리스트는 registry_spec 과 1:1 일치 (8-1F / 4F / M 모두 제외).
- nextSeqStrategy 의 정규식이 마지막 숫자만 잡도록 `(\d+)$` 사용.
- locationNoPattern 은 'B1' 처럼 F 안 끝나는 입력에만 'F' 를 붙임.

수정/추가 금지:
- 다른 카테고리 entry 추가 X (이번 wave 는 방화셔터만)
- CheckpointsPage.tsx 수정 X (Task 2 영역)
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && npx tsc --noEmit -p tsconfig.json 2>&amp;1 | grep -E "checkpointRegistry" | head -10; test -f src/utils/checkpointRegistry.ts &amp;&amp; grep -c "CATEGORY_REGISTRY" src/utils/checkpointRegistry.ts</automated>
  </verify>
  <done>
- 파일 cha-bio-safety/src/utils/checkpointRegistry.ts 존재
- `export interface CategoryRegistryEntry` 와 `export const CATEGORY_REGISTRY` 모두 존재
- 방화셔터 entry 1건만 등록 (Object.keys(CATEGORY_REGISTRY).length === 1)
- tsc --noEmit 가 이 파일에 대해 새 에러 0건
- floorsByZone.office 에 '8-1F' / '4F' / '1F' 없음, floorsByZone.basement 에 'M' 없음 (grep 으로 확인 가능)
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: CheckpointsPage 에 RegistryDrivenForm 컴포넌트 + 방화셔터 분기</name>
  <files>cha-bio-safety/src/pages/CheckpointsPage.tsx</files>
  <behavior>
    - 새 컴포넌트 `RegistryDrivenForm` 가 추가된다. props: `{ entry: CategoryRegistryEntry; onClose: () => void }`.
    - 폼은 INPUT_STYLE / LABEL_STYLE 기존 토큰을 그대로 사용 (디자인 토큰 변경 0).
    - 폼 필드: 카테고리(read-only 표시), 구역(3-button group, entry.zones 기준), 층(entry.floorsByZone[zone] select), 개소명(text input, placeholder=entry.locationPlaceholder), 설명(text input, 선택). 위치번호는 자동 생성이라 read-only 표시 (수정 가능한 input 대신 정보성 라벨).
    - 구역+층 선택 시 useQuery 로 `checkPointApi.list(entry.category)` 호출 → 같은 floor 의 location_no 들 추출 → entry.nextSeqStrategy 로 다음 seq 계산.
    - 저장 mutation: id = entry.idPattern(floor, seq), qrCode = entry.qrPattern(id), locationNo = entry.locationNoPattern(floor, seq), zone/floor/location/category 채워서 checkPointApi.create 호출.
    - canSave 게이트: location.trim() !== '' && zone !== '' && floor !== '' && seq !== null. 하나라도 미충족이면 저장 비활성.
    - 성공 시 toast '개소가 추가되었습니다' + qc.invalidateQueries(['check-points']) + onClose().
    - 실패 시 toast '저장에 실패했습니다. 입력값을 확인해 주세요'.
    - 기존 CheckPointModalContent 는 단 한 글자도 수정하지 않는다.
    - 모달 렌더 분기 (라인 ~690): mode === 'add' 이고 form.category (modal 외부로 끌어올린 임시 state) 가 CATEGORY_REGISTRY 에 있으면 RegistryDrivenForm, 그 외엔 CheckPointModalContent.
  </behavior>
  <action>
파일 `cha-bio-safety/src/pages/CheckpointsPage.tsx` 수정.

**Step 1 — import 추가 (파일 상단, 기존 import 블록 끝):**
```typescript
import { CATEGORY_REGISTRY, type CategoryRegistryEntry } from '../utils/checkpointRegistry'
```

**Step 2 — RegistryDrivenForm 컴포넌트를 CheckPointModalContent 함수 정의 직전(line 95 직전)에 추가:**

핵심 구현 골격:

```tsx
function RegistryDrivenForm({ entry, onClose }: {
  entry: CategoryRegistryEntry; onClose: () => void
}) {
  const qc = useQueryClient()
  const [zone, setZone] = useState<string>('')
  const [floor, setFloor] = useState<string>('')
  const [location, setLocation] = useState<string>('')
  const [description, setDescription] = useState<string>('')

  // 같은 카테고리의 기존 cp 들 로드 → next seq 계산
  const { data: existing } = useQuery({
    queryKey: ['check-points', entry.category],
    queryFn: () => checkPointApi.list(entry.category),
    enabled: !!floor,
    staleTime: 30_000,
  })

  const nextSeq = (() => {
    if (!floor || !existing) return null
    const locationNos = existing
      .filter(c => c.floor === floor)
      .map(c => c.locationNo ?? '')
      .filter(Boolean)
    return entry.nextSeqStrategy(locationNos)
  })()

  const previewId  = floor && nextSeq !== null ? entry.idPattern(floor, nextSeq) : ''
  const previewLoc = floor && nextSeq !== null ? entry.locationNoPattern(floor, nextSeq) : ''

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!floor || nextSeq === null) throw new Error('floor/seq 미설정')
      const id = entry.idPattern(floor, nextSeq)
      const qrCode = entry.qrPattern(id)
      const locationNo = entry.locationNoPattern(floor, nextSeq)
      return checkPointApi.create({
        id, qrCode, floor, zone: zone as BuildingZone,
        location: location.trim(),
        category: entry.category,
        description: description.trim() || undefined,
        locationNo,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['check-points'] })
      qc.invalidateQueries({ queryKey: ['check-point-categories'] })
      toast.success('개소가 추가되었습니다')
      onClose()
    },
    onError: () => toast.error('저장에 실패했습니다. 입력값을 확인해 주세요'),
  })

  const canSave = location.trim() !== '' && zone !== '' && floor !== '' && nextSeq !== null
  const isBusy = createMutation.isPending

  return (
    <>
      <div className="form-body" style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={LABEL_STYLE}>카테고리</label>
          <div style={{ ...INPUT_STYLE, display: 'flex', alignItems: 'center', background: 'var(--bg2)' }}>
            {entry.category}
          </div>
        </div>
        <div>
          <label style={LABEL_STYLE}>구역 <span style={{ color: 'var(--status-danger)' }}>*</span></label>
          <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-default)' }}>
            {entry.zones.map(z => (
              <button key={z}
                onClick={() => { setZone(prev => prev === z ? '' : z); setFloor('') }}
                style={{ flex: 1, height: 36, border: 'none', cursor: 'pointer',
                  background: zone === z ? 'var(--accent)' : 'var(--surface-active)',
                  color: zone === z ? '#fff' : 'var(--text-tertiary)' }}>
                <span className="text-caption font-bold">{ZONE_LABEL[z] ?? z}</span>
              </button>
            ))}
          </div>
        </div>
        {zone && (
          <div>
            <label style={LABEL_STYLE}>층 <span style={{ color: 'var(--status-danger)' }}>*</span></label>
            <select style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }}
              value={floor} onChange={e => setFloor(e.target.value)}>
              <option value="">층 선택</option>
              {(entry.floorsByZone[zone] ?? []).map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label style={LABEL_STYLE}>개소명 <span style={{ color: 'var(--status-danger)' }}>*</span></label>
          <input style={INPUT_STYLE} value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder={entry.locationPlaceholder} />
        </div>
        <div>
          <label style={LABEL_STYLE}>설명</label>
          <input style={INPUT_STYLE} value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="메모 (선택)" />
        </div>
        {previewId && (
          <div style={{ fontSize: 12, color: 'var(--t2)', padding: '8px 12px', background: 'var(--bg3)', borderRadius: 8 }}>
            <div>ID: <strong style={{ color: 'var(--t1)' }}>{previewId}</strong></div>
            <div>위치번호: <strong style={{ color: 'var(--t1)' }}>{previewLoc}</strong></div>
          </div>
        )}
      </div>
      <div className="action-row" style={{ padding: 16, display: 'flex', gap: 8 }}>
        <button onClick={onClose}
          style={{ flex: 1, height: 44, background: 'var(--surface-active)', color: 'var(--text-secondary)', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          <span className="text-body-sm font-bold">취소</span>
        </button>
        <button onClick={() => canSave && !isBusy && createMutation.mutate()}
          disabled={!canSave || isBusy}
          style={{ flex: 1, height: 44, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8,
            cursor: canSave && !isBusy ? 'pointer' : 'not-allowed',
            opacity: canSave && !isBusy ? 1 : 0.4 }}>
          <span className="text-body-sm font-bold">저장</span>
        </button>
      </div>
    </>
  )
}
```

**Step 3 — 모달 분기 (라인 ~688-693 부근, 기존 modal 렌더 블록):**

문제: 현재는 ModalWrapper 안에서 무조건 `<CheckPointModalContent ... />` 를 렌더. 카테고리를 알아야 분기가 가능한데, 카테고리는 CheckPointModalContent **내부 state** 라서 외부에서 못 본다.

해결: 모달이 열리면 사용자가 "카테고리 select" 에서 방화셔터를 고를 때까지는 일단 기존 CheckPointModalContent 를 보여주고, 별도로 "방화셔터 카테고리 전용 진입" 을 만든다 — 하지만 이번 wave 는 점진적 분리가 목표이므로 더 단순한 접근을 채택한다:

**채택 방안**: CheckpointsPage 컴포넌트 상위 state 에 임시 `regCategory: string` 을 추가하지 않고, **modal.mode === 'add' 인 경우에 한해 ModalWrapper 안에서 CheckPointModalContent 가 아닌 작은 라우터 컴포넌트** `AddCheckPointRouter` 를 렌더한다.

`AddCheckPointRouter` 는:
1. 카테고리 select 만 먼저 보여줌
2. 선택된 카테고리가 CATEGORY_REGISTRY 에 있으면 → `<RegistryDrivenForm entry={CATEGORY_REGISTRY[cat]} onClose={onClose} />` 렌더
3. 없으면 → 기존 흐름과 동일하게 `<CheckPointModalContent mode="add" cp={undefined} onClose={onClose} />` 렌더 (단, CheckPointModalContent 내부의 카테고리 select 도 살아있어서 자유롭게 변경 가능)

다만 이 분기 컴포넌트가 카테고리 select 를 따로 가지면 UX 가 어색해진다. 더 매끄러운 접근:

**더 매끄러운 채택 방안 (FINAL)**:
- CheckPointModalContent 는 손대지 않음
- modal 렌더 자리(라인 689-693)를 아래와 같이 교체:

```tsx
{modal.open && (
  <ModalWrapper onClose={() => setModal({ open: false, mode: 'add' })} title={modal.mode === 'add' ? '개소 추가' : '개소 수정'}>
    {modal.mode === 'add'
      ? <AddCheckPointRouter onClose={() => setModal({ open: false, mode: 'add' })} />
      : <CheckPointModalContent mode={modal.mode} cp={modal.target} onClose={() => setModal({ open: false, mode: 'add' })} />}
  </ModalWrapper>
)}
```

그리고 `AddCheckPointRouter` 컴포넌트 신설 (RegistryDrivenForm 바로 아래에 정의):

```tsx
function AddCheckPointRouter({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState<string>('')

  // registry 에 있으면 새 폼
  if (category && CATEGORY_REGISTRY[category]) {
    return (
      <>
        <div style={{ padding: '16px 16px 0' }}>
          <label style={LABEL_STYLE}>카테고리 <span style={{ color: 'var(--status-danger)' }}>*</span></label>
          <select style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }}
            value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">카테고리 선택</option>
            {CATEGORIES_FALLBACK.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <RegistryDrivenForm entry={CATEGORY_REGISTRY[category]} onClose={onClose} />
      </>
    )
  }

  // registry 에 없으면 기존 CheckPointModalContent 그대로 위임.
  // 단, 사용자가 위에서 카테고리를 선택해도 CheckPointModalContent 의 내부 select 와 동기화가 안 되니
  // 아예 상위 select 를 보이지 않고 CheckPointModalContent 가 자체 카테고리 select 를 갖도록 한다.
  // → 카테고리 = '' 인 초기 상태에서는 CheckPointModalContent 가 자기 select 를 보여주게 함.
  // → 사용자가 거기서 방화셔터를 고르면? 그건 CheckPointModalContent 내부라 router 에 안 들림.
  //
  // 이번 wave 는 점진적 분리이므로 다음 규칙으로 단순화:
  //  - AddCheckPointRouter 가 자체 카테고리 select 를 가짐
  //  - registry 에 있는 카테고리 → RegistryDrivenForm 으로 위임
  //  - 그 외 → CheckPointModalContent 에 `initialCategory` prop 으로 카테고리 전달 (아래 Step 4 참고)
  return <CheckPointModalContent mode="add" cp={undefined} onClose={onClose} initialCategory={category} />
}
```

**Step 4 — CheckPointModalContent 의 props 시그니처에 optional `initialCategory?: string` 추가 (router 가 선택한 카테고리를 모달이 받아 시작할 수 있도록):**

CheckPointModalContent 의 signature 를:
```tsx
function CheckPointModalContent({ mode, cp, onClose }: { mode: 'add' | 'edit'; cp?: CheckPointFull; onClose: () => void })
```
에서
```tsx
function CheckPointModalContent({ mode, cp, onClose, initialCategory }: { mode: 'add' | 'edit'; cp?: CheckPointFull; onClose: () => void; initialCategory?: string })
```
로 확장하고, 초기 form state 의 category 에 `initialCategory ?? ''` 를 채운다. 즉:

```tsx
const [form, setForm] = useState<CpFormState>(
  mode === 'edit' && cp
    ? { ...상동 }
    : { ...EMPTY_CP_FORM, category: initialCategory ?? '' }
)
```

이 외에 CheckPointModalContent 의 다른 코드는 단 한 줄도 수정하지 않는다.

**Step 5 — AddCheckPointRouter 의 select 가 위 case 에서 보이려면 항상 위에 select 를 띄우되, registry 분기에서는 select 가 두 번 안 보이도록 RegistryDrivenForm 의 카테고리 표시는 read-only 박스 (이미 구현됨)로 두는 게 자연스러움. router 의 select 가 source of truth.**

비-registry 카테고리 케이스에서는 router 의 select 를 숨기고 CheckPointModalContent 의 select 가 보이게 함 — 즉:

```tsx
function AddCheckPointRouter({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState<string>('')
  const isRegistry = category && !!CATEGORY_REGISTRY[category]

  if (isRegistry) {
    return (
      <>
        <div style={{ padding: '16px 16px 0' }}>
          <label style={LABEL_STYLE}>카테고리 <span style={{ color: 'var(--status-danger)' }}>*</span></label>
          <select style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }}
            value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">카테고리 선택</option>
            {CATEGORIES_FALLBACK.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <RegistryDrivenForm entry={CATEGORY_REGISTRY[category]} onClose={onClose} />
      </>
    )
  }

  // 비-registry: 위에 카테고리 select 한 번만 보이고, 선택 후 기존 모달 폼으로 전환.
  // 단순화: 초기에는 select 만 보여주고, 사용자가 카테고리를 고르면 CheckPointModalContent 로 위임.
  if (!category) {
    return (
      <div style={{ padding: '16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={LABEL_STYLE}>카테고리 <span style={{ color: 'var(--status-danger)' }}>*</span></label>
          <select style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }}
            value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">카테고리 선택</option>
            {CATEGORIES_FALLBACK.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ fontSize: 12, color: 'var(--t2)' }}>카테고리를 먼저 선택하세요.</div>
      </div>
    )
  }

  // 카테고리 선택됨 && registry 없음 → 기존 모달 폼에 initialCategory 전달
  return <CheckPointModalContent mode="add" cp={undefined} onClose={onClose} initialCategory={category} />
}
```

**검수 룰:**
- `CheckPointModalContent` 함수 본문은 props signature 1줄 + useState 초기값 1줄 외 변경 없음 (다른 18개 카테고리 회귀 0 보장).
- 디자인 토큰 (`var(--bg2)`, `var(--accent)` 등) 추가/변경 없음. 기존 INPUT_STYLE/LABEL_STYLE 만 재사용.
- 새 import: `CATEGORY_REGISTRY`, `CategoryRegistryEntry` 만. 다른 외부 라이브러리 추가 X.
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety &amp;&amp; npm run build 2>&amp;1 | tail -20</automated>
  </verify>
  <done>
- `cha-bio-safety/src/pages/CheckpointsPage.tsx` 에 `function RegistryDrivenForm` 와 `function AddCheckPointRouter` 모두 존재
- `import { CATEGORY_REGISTRY, type CategoryRegistryEntry } from '../utils/checkpointRegistry'` 존재
- modal 렌더 (기존 라인 689-693 부근) 가 `modal.mode === 'add' ? <AddCheckPointRouter .../> : <CheckPointModalContent .../>` 분기로 변경됨
- CheckPointModalContent props signature 에 `initialCategory?: string` 추가됨
- CheckPointModalContent 의 EMPTY_CP_FORM 초기화 부분이 `category: initialCategory ?? ''` 를 사용함
- `npm run build` 가 0 exit code 로 종료 (TypeScript / Vite 에러 없음)
- 빌드 산출물 `dist/` 가 생성됨
  </done>
</task>

</tasks>

<verification>
- Task 1, 2 의 `<automated>` 가 모두 통과해야 함.
- 빌드 통과 = TypeScript 와 Vite 양쪽 OK.
- 분기 패턴 grep 검증:
  ```bash
  grep -n "RegistryDrivenForm\|AddCheckPointRouter\|CATEGORY_REGISTRY" cha-bio-safety/src/pages/CheckpointsPage.tsx | head -10
  ```
  → 각각 최소 1회 이상 나와야 함.
- 회귀 방어 grep:
  ```bash
  # 다른 카테고리 케이스에서는 여전히 CheckPointModalContent 가 살아있어야 함
  grep -c "function CheckPointModalContent" cha-bio-safety/src/pages/CheckpointsPage.tsx
  # === 1 (지우지 않았음을 확인)
  ```
- 디자인 토큰 회귀 방어:
  ```bash
  # 신규 색상 hex 추가가 없는지
  git -C /Users/jykevin/Documents/20260328 diff cha-bio-safety/src/pages/CheckpointsPage.tsx | grep -E "^\+.*#[0-9a-fA-F]{3,6}" | head
  # → 결과 0줄 이어야 함 (기존 var(--*) 만 사용)
  ```
- 사용자 시각 검증 (이 plan 외부): 데스크톱에서 `/checkpoints` → '개소 추가' → 카테고리=방화셔터 → 구역/층 선택 → 미리보기 ID/위치번호 확인 → 개소명 입력 → 저장 → toast 확인 → 목록에 신규 항목 노출 확인.
</verification>

<success_criteria>
- [ ] `cha-bio-safety/src/utils/checkpointRegistry.ts` 가 신규 생성되고 `CATEGORY_REGISTRY['방화셔터']` 1개만 포함
- [ ] `cha-bio-safety/src/pages/CheckpointsPage.tsx` 가 `RegistryDrivenForm` + `AddCheckPointRouter` 컴포넌트를 가지며, modal 분기가 mode='add' 일 때 router 를 통해 렌더
- [ ] CheckPointModalContent 본체 로직 (validation/createMutation 등) 무변경 — props signature + EMPTY_CP_FORM 초기화 2줄만 수정
- [ ] `npm run build` 통과
- [ ] 인라인 스타일 + var(--*) 토큰 패턴 유지, 신규 hex 색상 0
- [ ] 코드 변경만, 배포/머지 task 없음
</success_criteria>

<output>
완료 후 `.planning/quick/260529-gcj-checkpointspage-entry/260529-gcj-SUMMARY.md` 작성.

SUMMARY 에 포함할 항목:
- 신설 파일: `cha-bio-safety/src/utils/checkpointRegistry.ts` (라인 수 + entry 갯수)
- 수정 파일: `cha-bio-safety/src/pages/CheckpointsPage.tsx` (추가된 컴포넌트, 변경 라인 범위)
- 빌드 결과 (성공/실패 + dist 출력 요약)
- 다음 wave 후보: DIV / 컴프 / 유도등 등 — 사용자가 데스크톱에서 방화셔터 entry 시각 검증 통과 후 진행
- 미완 / 알려진 함정: mode='edit' registry 처리 X, formFields 활용 entry 0건 (소화기 옮길 때 첫 사용)
- 사용자 검증 가이드 (시각 테스트 시나리오 4-5단계)
</output>