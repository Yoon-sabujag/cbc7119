---
phase: quick-260428-lha
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/pages/FloorPlanPage.tsx
autonomous: false
requirements:
  - QUICK-260428-LHA  # FloorPlanPage SH 마커 단독 저장 → paired BC 누락 재발 방지
must_haves:
  truths:
    - "평면도 hydrant(소화전) 마커를 탭하면 같은 location_no 의 비상콘센트 CP 가 같은 모달에 자동 노출된다"
    - "사용자가 '저장' 버튼 한 번 누르면 SH 와 paired BC 가 모두 저장된다 (BC 가 존재하는 경우)"
    - "BC 가 없는 SH 마커(매핑 없음)는 종전처럼 SH 단독 저장된다"
    - "hydrant 외 카테고리 마커(소화기/유도등) 모달은 paired UI 가 추가되지 않고 종전 동작 유지"
    - "취소/저장 버튼 영역의 위치·라벨·동작은 변하지 않는다"
    - "build (npm run build, cha-bio-safety/) 가 타입/번들 에러 없이 통과한다"
  artifacts:
    - path: "cha-bio-safety/src/pages/FloorPlanPage.tsx"
      provides: "SH 마커 인라인 점검 모달에 paired BC 섹션 + 페어 저장 핸들러"
      contains: "pairedBC"
    - path: "cha-bio-safety/src/pages/FloorPlanPage.tsx"
      provides: "BC 결과/메모/사진 state 및 reset"
      contains: "bcResult"
  key_links:
    - from: "FloorPlanPage 인라인 점검 모달 저장 onClick"
      to: "inspectionApi.submitRecord (SH then BC)"
      via: "직렬 await — SH 성공 후 BC photo upload + submitRecord"
      pattern: "submitRecord.*\\n[\\s\\S]*submitRecord"
    - from: "selected (FloorPlanMarker, hydrant)"
      to: "pairedBC (CheckPoint, category=비상콘센트, 같은 floor+locationNo)"
      via: "useEffect: hydrant 마커 선택 시 inspectionApi.getCheckpoints(floor) 로 같은 floor 의 BC 조회"
      pattern: "marker_type.*indoor_hydrant"
---

<objective>
디버그 세션 `hydrant-count-mismatch` 의 fix B-1 적용. FloorPlanPage 의 평면도 인라인 점검 모달이 hydrant(소화전) 마커일 때, 같은 floor + 같은 location_no 의 비상콘센트(BC) CP 를 함께 입력·저장하도록 InspectionPage 페어 모달 패턴을 평면도에도 도입한다.

Purpose: 4-27 박보융이 평면도에서 SH 마커 탭 → 단독 저장 → paired BC 누락 → 카드 153/154 사고의 재발 방지. InspectionPage 페어 모달과 평면도 모달의 동작 정합성 회복.

Output: hydrant 마커 점검 모달 본문이 InspectionPage 페어 모달과 동일한 구조(상단 SH 섹션 / divider / 하단 BC 섹션). 저장 버튼 한 번에 SH+BC 둘 다 직렬 저장. 취소/저장 버튼 영역은 절대 손대지 않음.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@CLAUDE.md
@.planning/STATE.md
@.planning/debug/hydrant-count-mismatch.md
@cha-bio-safety/src/pages/FloorPlanPage.tsx
@cha-bio-safety/src/pages/InspectionPage.tsx
@cha-bio-safety/src/types/index.ts
@cha-bio-safety/src/hooks/usePhotoUpload.ts

<interfaces>
<!-- 핵심 타입과 패턴. executor 는 이 정의를 따라 구현하면 됨. -->

From cha-bio-safety/src/types/index.ts:
```typescript
export type CheckResult = 'normal'|'caution'|'bad'|'unresolved'|'missing'
export interface CheckPoint {
  id: string; qrCode: string; floor: Floor; zone: BuildingZone;
  location: string; category: string; description?: string;
  locationNo?: string; defaultResult?: CheckResult; guideLightTotal?: number
}
```

From cha-bio-safety/src/hooks/usePhotoUpload.ts:
```typescript
export function usePhotoUpload(): {
  // .blob, .preview, .upload(): Promise<string|null>, .reset(), .uploading 등 — 기존 사용처 동일
}
```

From cha-bio-safety/src/utils/api.ts:298:
```typescript
inspectionApi.getCheckpoints(floor?: string, zone?: string) => Promise<CheckPoint[]>
inspectionApi.submitRecord(sessionId: string, payload: { checkpointId: string; result: CheckResult; memo?: string; photoKey?: string; floor_plan_marker_id?: string; guide_light_type?: string }) => Promise<...>
```

InspectionPage 페어 패턴 참조 라인 (cha-bio-safety/src/pages/InspectionPage.tsx):
- 2795: `const bcPhoto = usePhotoUpload()`
- 2810-2811: `const [bcResult, setBcResult] = useState<CheckResult>('normal')`, `const [bcMemo, setBcMemo] = useState('')`
- 2980-2985: pairedBC useMemo — `floorCPs.find(cp => cp.category === '비상콘센트' && cp.locationNo === selectedCP.locationNo)`
- 3001-3003: CP 변경 시 `setBcResult('normal'); setBcMemo(''); bcPhoto.reset()` reset
- 3157-3161: SH 저장 후 paired BC 저장 — `await onSave(SH); if (pairedBC) { const bcPhotoKey = await bcPhoto.upload(); await onSave(pairedBC.id, bcResult, bcMemo, bcPhotoKey ?? undefined) }`
- 3406-3436: paired BC 렌더 — divider + 카테고리/위치/설명 박스 + 결과 3버튼 + 특이사항 textarea + PhotoButton

FloorPlanPage 현재 인라인 모달 (cha-bio-safety/src/pages/FloorPlanPage.tsx):
- 1459-1599: 인라인 점검 기록 모달 본체
- 1545-1595: 저장 버튼 (이 영역은 손대지 않음 — 본문 안 BC 섹션만 추가)
- 1574-1580: `inspectionApi.submitRecord(sid, { checkpointId: cpId, result, memo, photoKey, ...extra })` — 단일 호출
- 230-241: inspect* state 정의 위치 (bcResult/bcMemo 도 여기에 추가)
- 254: `const [checkpoints, setCheckpoints] = useState<any[]>([])` — 평면도가 메모리에 가진 같은 floor CP 캐시

마커 식별:
- planType 은 `'extinguisher'` 일 때 소화기·소화전 평면도. selected.marker_type === 'indoor_hydrant' 가 SH 마커.
- selected.check_point_id 가 SH CP id, selected.floor 가 층.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: pairedBC 식별 로직 + state/reset/저장 핸들러 추가</name>
  <files>cha-bio-safety/src/pages/FloorPlanPage.tsx</files>
  <action>
InspectionPage 페어 모달 패턴을 FloorPlanPage 인라인 점검 모달에 이식. **취소/저장 버튼 영역(1541-1595 의 div.style.display:'flex'.gap:8 블록)은 절대 손대지 말 것**. 본문 추가 + 저장 onClick 내부 로직만 확장.

1) **State 추가** (라인 230-241 근처, inspect* state 들과 같은 위치):
   ```typescript
   const inspectBcPhoto = usePhotoUpload()
   const [inspectBcResult, setInspectBcResult] = useState<'normal'|'caution'|'bad'>('normal')
   const [inspectBcMemo, setInspectBcMemo] = useState('')
   const [pairedBC, setPairedBC] = useState<any | null>(null)
   ```

2) **pairedBC 식별 useEffect 추가** (selected 가 바뀔 때 또는 inspectModal 이 열릴 때 평가):
   - 조건: `inspectModal === true && selected && planType === 'extinguisher' && selected.marker_type === 'indoor_hydrant' && selected.check_point_id`
   - 같은 층의 모든 CP 를 조회: `inspectionApi.getCheckpoints(selected.floor)` (이미 line 1562 의 유도등 분기에서 사용 중인 패턴 — 동일 함수 재사용 가능. 또는 line 254 의 `checkpoints` state 가 같은 층에 대해 이미 채워져 있으면 그것을 우선 사용해도 무방. 단, `checkpoints` 는 편집 모드에서만 채워지므로 일반 경로에서는 fetch 가 안전함).
   - SH CP 찾기: `all.find(cp => cp.id === selected.check_point_id)` → 그 CP 의 `locationNo` 추출.
   - BC CP 찾기: `all.find(cp => cp.category === '비상콘센트' && cp.locationNo === sh.locationNo)`.
   - 결과를 `setPairedBC(bc ?? null)`. 다른 카테고리(소화기/유도등)이거나 hydrant 가 아니거나 BC 가 없으면 항상 `setPairedBC(null)`.
   - 모달이 닫히거나 selected 가 null 이 되면 cleanup 으로 `setPairedBC(null); setInspectBcResult('normal'); setInspectBcMemo(''); inspectBcPhoto.reset()`.

3) **모달이 열리는 시점의 reset**: 라인 1444-1451 의 `setInspectModal(true)` 직전 블록과 `setInspected(true)` 류의 다른 진입점들에 BC state reset 코드도 추가 (`setInspectBcResult('normal'); setInspectBcMemo(''); inspectBcPhoto.reset()`). 정확한 위치는 기존 `setInspectResult('normal'); setInspectMemo(''); ...` 와 같은 곳.

4) **저장 onClick 확장** (라인 1545-1595 의 저장 버튼 onClick 내부):
   - 기존 `await inspectionApi.submitRecord(sid, { checkpointId: cpId, result: inspectResult, ... })` 호출 직후, **catch 블록 바깥**에서:
   ```typescript
   if (pairedBC) {
     const bcPhotoKey = await inspectBcPhoto.upload()
     await inspectionApi.submitRecord(sid, {
       checkpointId: pairedBC.id,
       result: inspectBcResult,
       memo: inspectBcMemo.trim() || undefined,
       photoKey: bcPhotoKey ?? undefined,
     })
   }
   ```
   - 위치: 기존 `await inspectionApi.submitRecord(sid, {...})` (라인 1574-1580) 바로 다음, `toast.success(...)` 이전.
   - SH 가 throw 하면 BC 호출은 자동 스킵 (try/catch 가 잡음). atomic 보장은 out-of-scope.
   - 저장 성공 후 `inspectBcPhoto.reset()` 추가 + `setInspectBcResult('normal'); setInspectBcMemo('')` 도 호출.
   - 저장 버튼의 `disabled` 조건에 `inspectBcPhoto.uploading` 도 OR 로 추가 (사진 업로드 중 더블탭 방지).

**주의 — 절대 하지 말 것**:
- 취소/저장 버튼 자체의 위치, 크기, 배경색, 라벨, 갯수 변경 (사용자 명시 요구).
- 다른 카테고리(소화기/유도등) 모달에 paired 섹션이 노출되도록 만드는 분기 누락. `planType === 'extinguisher' && selected.marker_type === 'indoor_hydrant'` 가 아닌 모든 경우는 `pairedBC === null` 이어야 함.
- 새 API 추가, 백엔드 변경, 스키마 변경.
- Tailwind 클래스 도입 — 기존 인라인 스타일 유지.
  </action>
  <verify>
    <automated>cd cha-bio-safety && npm run build</automated>
  </verify>
  <done>
- FloorPlanPage.tsx 에 `pairedBC`, `inspectBcResult`, `inspectBcMemo`, `inspectBcPhoto` state 가 존재하고 hydrant 마커일 때만 채워진다.
- 저장 버튼 onClick 이 SH 저장 후 `pairedBC` 가 있으면 BC 도 직렬로 저장한다.
- BC 가 null 이면 기존 단독 저장 동작 그대로.
- 취소/저장 버튼 마크업·스타일·갯수 변화 없음 (git diff 로 1541-1595 의 버튼 컨테이너 div 와 두 button 의 style/onClick 이외 변화 없음을 확인).
- `npm run build` (cha-bio-safety/ 안) 통과.
  </done>
</task>

<task type="auto">
  <name>Task 2: 인라인 모달 본문에 BC 섹션 렌더 (InspectionPage 페어 UI 동일)</name>
  <files>cha-bio-safety/src/pages/FloorPlanPage.tsx</files>
  <action>
InspectionPage:3406-3436 의 paired BC 렌더 블록을 FloorPlanPage 인라인 모달 본문(라인 1459-1599 모달 div 내부, **저장/취소 버튼 row(1541) 바로 위**)에 그대로 이식.

위치: 라인 1539-1540 의 `<PhotoButton hook={inspectPhoto} ... />` 닫는 div 직후, 라인 1541 의 `<div style={{ display: 'flex', gap: 8 }}>` (취소/저장 버튼 컨테이너) **직전**.

추가 마크업 (조건부):
```jsx
{pairedBC && (
  <>
    <div style={{ height:1, background:'var(--bd)', margin:'10px 0' }} />
    <div style={{ background:'var(--bg2)', borderRadius:10, padding:'8px 12px', border:'1px solid var(--bd)', marginBottom:10 }}>
      <div style={{ fontSize:10, color:'var(--t3)' }}>{pairedBC.category}</div>
      <div style={{ fontSize:13, fontWeight:700, color:'var(--t1)', marginTop:1 }}>{pairedBC.location}</div>
      {pairedBC.description && <div style={{ fontSize:10, color:'var(--t3)', marginTop:2 }}>{pairedBC.description}</div>}
    </div>
    <div style={{ marginBottom:10 }}>
      <div style={{ fontSize:10, fontWeight:600, color:'var(--t3)', marginBottom:6, letterSpacing:'0.05em' }}>비상콘센트 점검 결과</div>
      <div style={{ display:'flex', gap:6 }}>
        {([['normal','정상','#22c55e'],['caution','주의','#eab308'],['bad','불량','#ef4444']] as const).map(([val, label, color]) => (
          <button key={val} onClick={() => setInspectBcResult(val)} style={{
            flex:1, padding:'10px 4px', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer',
            background: inspectBcResult === val ? color + '22' : 'var(--bg3)',
            color: inspectBcResult === val ? color : 'var(--t3)',
            border: inspectBcResult === val ? `2px solid ${color}` : '1px solid var(--bd)',
          }}>{label}</button>
        ))}
      </div>
    </div>
    <div style={{ marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
        <label style={{ fontSize:10, fontWeight:600, color:'var(--t3)', letterSpacing:'0.05em' }}>특이사항 (선택)</label>
        <span style={{ fontSize:10, color:'var(--t3)' }}>점검 사진 (선택)</span>
      </div>
      <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
        <textarea
          value={inspectBcMemo}
          onChange={e => setInspectBcMemo(e.target.value)}
          placeholder="특이사항을 입력하세요"
          style={{ flex:1, height:72, padding:'9px 11px', borderRadius:10, background:'var(--bg2)', border:'1px solid var(--bd2)', color:'var(--t1)', fontSize:12, resize:'none', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}
        />
        <PhotoButton hook={inspectBcPhoto} label="촬영" noCapture />
      </div>
    </div>
  </>
)}
```

**색상/스타일 일치 노트**:
- InspectionPage 의 `INSPECT_RESULT_OPTIONS` 는 import 가 아닌 local 상수 → 여기서는 인라인 모달이 이미 사용하는 동일한 `[['normal','정상','#22c55e'], ...]` 패턴(라인 1499) 을 그대로 차용해 일관성 유지. (사용자 명시: "InspectionPage 와 동일한 스타일" — InspectionPage 페어 BC 섹션도 같은 색 코드 사용 → 등가).
- 결과 버튼 가로 3개·divider 1px·텍스트 사이즈는 InspectionPage paired 섹션과 동일.
- `marginBottom` 만 살짝 조정 (10/14): 평면도 모달은 다른 모달보다 padding 이 좁으므로(20px) 시각적 균형용. 사용자가 비주얼 차이를 보면 정확히 InspectionPage 와 같은 값(`2px 0`, 0)을 원할 수 있으니 PR 시점에 시각 확인 후 미세조정 가능 (Task 3 체크포인트에서 사용자가 검수).

**주의**:
- 본문에 paired UI 만 추가 — 1541 줄 이후의 취소/저장 버튼 row 는 한 글자도 수정 금지.
- `pairedBC && (...)` 가드는 필수. hydrant 외 마커, BC 매핑 없는 SH 에서는 렌더되지 않음.
- BC 결과 버튼은 SH 결과 버튼(라인 1497-1507) 과 동일한 컬러 코드와 동일한 마크업 패턴 사용.
  </action>
  <verify>
    <automated>cd cha-bio-safety && npm run build</automated>
  </verify>
  <done>
- `pairedBC` 가 있을 때 모달 본문(저장 버튼 위)에 divider + BC 카테고리/위치/설명 박스 + 결과 3버튼 + 특이사항 textarea + PhotoButton 이 렌더된다.
- `pairedBC === null` 일 때 BC UI 가 DOM 에 없다.
- 취소/저장 버튼 row(1541-1595) 의 git diff 변화는 이전 Task 1 의 disabled 조건 추가 외 0.
- `npm run build` 통과.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: 사용자 프로덕션 배포 후 평면도 페어 저장 시연 검증</name>
  <what-built>
- FloorPlanPage hydrant 마커 인라인 점검 모달에 paired BC 섹션 + 페어 저장 핸들러 추가.
- BC state/reset/직렬 저장 로직 (InspectionPage 페어 패턴 동일).
- 다른 카테고리/매핑 없는 마커는 종전 동작 유지.
  </what-built>
  <how-to-verify>
1. 사용자가 직접 wrangler 로 프로덕션 배포:
   ```bash
   cd cha-bio-safety && npm run build && npx wrangler pages deploy dist --project-name=cha-bio-safety --branch=production
   ```
   (`--branch=production` 누락 시 Preview 로 감 — 메모리 reference)
2. PWA 재설치 또는 강제 리로드 (서비스 워커 캐시 갱신 — 메모리 `feedback_pwa_cache_invalidation`).
3. 평면도 → "소화기·소화전" plan_type → 임의 층(예: 4F 또는 8-1F) 의 소화전 마커(indoor_hydrant) 탭.
   - 기대: "점검 기록 입력" 모달이 뜨고, 본문 하단(저장 버튼 바로 위)에 "비상콘센트" 카테고리/위치/설명 박스 + 결과 3버튼 + 특이사항 textarea + 사진 버튼이 노출.
4. SH 결과 = 정상, BC 결과 = 정상 선택 후 저장.
   - 기대: 토스트 "점검 기록 저장됨", 모달 닫힘.
5. `/inspection` 페이지 진입 → 소화전·비상콘센트 카드 카운트 확인 (기록 1건 추가됐을 때 +2 가 잡혀야 함; 단 동일 SH/BC 가 이미 같은 달 normal 로 저장돼 있으면 카드 변화는 없을 수 있음 — 이 경우 D1 조회로 두 record 모두 확인).
6. 다른 카테고리 검증: 평면도 → "유도등" plan_type → 임의 마커 탭 → BC 섹션이 **표시되지 않음** 확인.
7. 매핑 없는 SH 검증 (선택): BC 가 없는 층의 hydrant 마커가 있다면 탭 → BC 섹션 미표시 확인.
8. (선택) D1 직접 조회:
   ```sql
   SELECT checkpoint_id, result, checked_at, staff_id
   FROM check_records
   WHERE checked_at >= '2026-04-28T00:00:00'
     AND checkpoint_id IN ('CP-{floor}-{n}-SH','CP-{floor}-{n}-BC')
   ORDER BY checked_at DESC LIMIT 10;
   ```
   기대: 같은 staff_id, 같은 또는 직렬로 10초 이내 timestamp 의 SH+BC 기록 페어.
  </how-to-verify>
  <resume-signal>
"approved" — 평면도 페어 저장이 정상 작동하면 quick task 종료 (SUMMARY 작성).
"need fix: ..." — 시각/동작 이슈 보고 시 수정 후 재배포.
  </resume-signal>
</task>

</tasks>

<verification>
- npm run build (cha-bio-safety/) 통과.
- git diff 로 FloorPlanPage.tsx 외 다른 파일 변경 0 확인.
- git diff 로 라인 1541-1595 의 취소/저장 버튼 컨테이너 자체 마크업 변화는 disabled 속성 OR 추가 이외 없음.
- 사용자 프로덕션 시연 검증 (Task 3 체크포인트) 통과.
</verification>

<success_criteria>
- FloorPlanPage hydrant 마커 점검이 SH+BC 페어 저장으로 동작 (InspectionPage 페어 모달과 동일 UX).
- 다른 카테고리/매핑 없는 마커의 종전 동작에 회귀 없음.
- 취소/저장 버튼 영역 변경 없음 (사용자 명시 요구 충족).
- 같은 사고(평면도 SH 단독 저장으로 인한 BC 누락) 재발 가능성 차단.
</success_criteria>

<output>
After completion, create `.planning/quick/260428-lha-floorplanpage-paired-bc-modal/260428-lha-SUMMARY.md` covering:
- Files modified (FloorPlanPage.tsx 단일)
- Lines added/removed (rough)
- 패턴 출처 (InspectionPage 2795/2810/2980/3001/3134/3406 라인)
- Out-of-scope 재확인 (atomic 보장, fix B-2/C 미포함)
- 사용자 프로덕션 검증 결과
- (선택) FloorPlanPage 와 InspectionPage 의 페어 로직 중복 정리(공통 hook/util 화) 가 다음 정리 후보임을 메모.
</output>
