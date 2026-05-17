---
phase: 260517-ghz
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/pages/FloorPlanPage.tsx
autonomous: false
requirements:
  - 06-floorplan-modal-tsx-wave-1
tags:
  - redesign
  - 06-floorplan
  - modal-tsx-conversion
  - sketch-verbatim
  - v0.1.1-tokens

must_haves:
  truths:
    - 마커 선택 정보 popup (데스크톱 balloon + 모바일 sheet) 가 sketch className verbatim 으로 변환됨
    - inspectModal "점검 기록 입력" 가 sketch className verbatim 으로 변환됨 — 점검 결과 3택, 증상 피커, textarea+사진, paired BC 모두 포함
    - resolveModal "조치 입력" 가 sketch className verbatim 으로 변환됨 — 유도등 조치 피커/자재 input/그 외 textarea 모두 포함
    - actionButtons 안의 옛 var(--acl) + linear-gradient(135deg,#f59e0b,#ef4444) hex 도 단색 accent CTA 로 동기 변환됨
    - 모든 비즈니스 로직 (state/handler/useQuery/useMutation/photo hook/planType 분기/needSymptom/pairedBC/isAccessBlocked) 변경 0건
    - 변환 영역 안 옛 var() 토큰 (--bg/--bg2/--bg3/--bd/--bd2/--t1/--t2/--t3/--acl/--warn/--danger) 0건
    - 변환 영역 안 raw hex 색 (#22c55e/#eab308/#ef4444/#f59e0b/#3b82f6/rgba 채움) 0건 (단 MarkerIcon color prop 의 hex 인자, EXTINGUISHER stroke hex 는 out-of-scope 보존)
    - 변환 영역 안 이모지 ✕ 0건 — `<X size={16} />` 로 교체
    - 변환 영역 안 linear-gradient 0건
    - `npm --prefix cha-bio-safety run build` PASS
  artifacts:
    - path: cha-bio-safety/src/pages/FloorPlanPage.tsx
      provides: 마커 popup + inspectModal + resolveModal + actionButtons v0.1.1 토큰 변환
      contains: bg-surface-raised border border-border-default rounded-md
    - path: cha-bio-safety/src/pages/FloorPlanPage.tsx
      provides: lucide-react 추가 import
      contains: "X, CheckCircle2, AlertTriangle, XCircle"
  key_links:
    - from: cha-bio-safety/src/pages/FloorPlanPage.tsx (line ~1254 actionButtons)
      to: 단색 accent CTA
      via: className verbatim
      pattern: "bg-accent text-text-on-accent"
    - from: cha-bio-safety/src/pages/FloorPlanPage.tsx (line ~1300 데스크톱 balloon)
      to: floorplan-modals-sketch.html A3 viewport
      via: className verbatim
      pattern: "bg-surface-raised border border-border-default rounded-md"
    - from: cha-bio-safety/src/pages/FloorPlanPage.tsx (line ~1748 inspectModal wrapper)
      to: floorplan-modals-sketch.html B1/B2 viewport
      via: className verbatim
      pattern: "max-w-\\[340px\\] .* bg-surface-raised"
    - from: cha-bio-safety/src/pages/FloorPlanPage.tsx (line ~2040 resolveModal wrapper)
      to: floorplan-modals-sketch.html C1/C2 viewport
      via: className verbatim
      pattern: "max-w-\\[340px\\] .* bg-surface-raised"
---

<objective>
06 FloorPlanPage 의 3 모달 (마커 선택 정보 popup / inspectModal / resolveModal) + actionButtons 를 v0.1.1 토큰 + 02 inspection-unification chrome 룰 + 05 RemediationDetailPage 단색 accent CTA 패턴으로 sketch 1:1 verbatim 변환.

Purpose: redesign/06-floorplan-v2 브랜치에서 sketch HTML 작성 (Wave 0 = 260517-g0n) 다음 단계. 3 모달의 시각만 변환해 02/05 통일 룰과 일치시키고, 비즈니스 로직은 0 변경. 사용자 시각 검토 후 다음 wave (외부 popup InspectionRevisitPopup/AccessBlockedPopup, addModal/editMarker/unassignConfirm/emptyMarkerModal/placingConfirm 등) 진행.

Output: FloorPlanPage.tsx 의 line ~1254 (actionButtons) / ~1300~1387 (마커 popup) / ~1724~1948 (inspectModal) / ~2038~2162 (resolveModal) 영역에 v0.1.1 토큰 Tailwind className 적용 + lucide-react import 추가.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/quick/260517-g0n-06-floorplanpage-chrome-sketch-wave-1-in/260517-g0n-SUMMARY.md
@cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md
@cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html
@cha-bio-safety/src/pages/FloorPlanPage.tsx

<interfaces>
<!-- 변환 시 보존해야 하는 기존 시그니처 + 신규 import. -->

## 보존 (변환 금지)

기존 state/handler/photo hook/query:
```typescript
// FloorPlanPage 안에서 그대로 호출
selected, setSelected, inspectModal, setInspectModal, resolveModal, setResolveModal
inspectResult, setInspectResult, inspectMemo, setInspectMemo
inspectSymptomPick, setInspectSymptomPick, inspectSymptomCustom
inspectExtDetail, setInspectExtDetail, needSymptom, pairedBC
inspectBcResult, setInspectBcResult, inspectBcMemo, setInspectBcMemo
inspectSubmitting, setInspectSubmitting, isAccessBlocked
inspectPhoto, inspectBcPhoto, resolvePhoto  // usePhotoUpload hook 리턴
resolveActionPick, setResolveActionPick, resolveMemo, setResolveMemo
resolveMaterialName, setResolveMaterialName, resolveMaterialCount, setResolveMaterialCount
resolveSubmitting, setResolveSubmitting
canInspect, canResolve, editMode, editMarker, openEditMarkerModal
revisitPopup, setRevisitPopup, evalRevisit, openInspectModal
deleteMutation, unassignConfirm, setUnassignConfirm
isDesktop, getBalloonPos, BALLOON_W, BALLOON_GAP, containerRef
planType, floor, currentMarkerTypes, glType, MARKER_TO_GL
inspectionApi, extinguisherApi, api, qc, navigate, toast
PhotoButton, AccessBlockedPopup, MarkerIcon
statusColor (hex 변수), statusKey, statusLabel, markerLabel
```

## 신규 lucide-react import (line 5 기존 ChevronLeft 줄 옆에 추가)

```typescript
import { ChevronLeft, X, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
```

## sketch verbatim className 매핑 (소스: floorplan-modals-sketch.html)

### A. 마커 선택 정보 popup (data 출처: sketch A1/A2/A3)

**데스크톱 balloon wrapper** (FloorPlanPage.tsx line ~1301 outer div):
- 기존 `style={{ position:'absolute', left:..., top/bottom:..., width:BALLOON_W, ... }}` 에서 dynamic positioning 값만 inline style 유지
- 시각 토큰 부분만 className 으로 분리:
  - `className="bg-surface-raised border border-border-default rounded-md p-3.5 z-30"`
  - `style={{ position:'absolute', left:..., top/bottom:..., width: BALLOON_W, boxShadow:'0 8px 32px rgba(0,0,0,0.45)' }}`
  - (background/border/borderRadius/padding/zIndex 는 inline 에서 제거)

**arrow div** (line ~1318):
- `className="absolute balloon-arrow-bottom"` 또는 Tailwind 로 직접:
  - `bp.arrowDir === 'bottom'` (마커 아래 balloon): 화살표가 balloon 의 top 에서 위쪽을 가리킴
    - `className="absolute -top-2 border-l-[8px] border-r-[8px] border-l-transparent border-r-transparent border-b-[8px]"` + inline `style={{ borderBottomColor: 'var(--surface-raised)', left: 계산값, transform:'translateX(-8px)' }}`
  - `bp.arrowDir === 'top'` (마커 위 balloon): 화살표가 balloon 의 bottom 에서 아래쪽을 가리킴
    - `className="absolute -bottom-2 border-l-[8px] border-r-[8px] border-l-transparent border-r-transparent border-t-[8px]"` + inline `style={{ borderTopColor: 'var(--surface-raised)', left: 계산값, transform:'translateX(-8px)' }}`
- (left 계산값은 기존 식 그대로 유지)

**모바일 sheet wrapper** (FloorPlanPage.tsx line ~1355):
- `className="absolute bottom-0 left-0 right-0 bg-surface-raised border-t border-border-default rounded-t-lg px-4 pt-3 pb-5 z-30"`
- `style={{ boxShadow: '0 -8px 32px rgba(0,0,0,0.4)' }}`

**grab handle (모바일 only)** (line ~1364):
- `<div className="w-9 h-1 rounded-pill bg-border-default mx-auto mb-3.5" />`

**컨텐츠 row** (양쪽 데스크톱/모바일):
- 데스크톱 (line ~1328): `<div className="flex items-start gap-2.5 mb-3">`
- 모바일 (line ~1365): `<div className="flex items-start gap-3 mb-4">`

**상태 아이콘 박스**:
- statusKey (위 `getMarkerStatus()` 의 반환) 별로 className 분기. **새로 helper** 만들지 말고 모달 안에서 inline 분기:
  ```tsx
  const iconBoxCls =
    statusKey === 'normal'   ? 'bg-safe-bg border-[1.5px] border-safe' :
    statusKey === 'caution'  ? 'bg-warning-bg border-[1.5px] border-warning' :
    statusKey === 'bad' || statusKey === 'fault' ? 'bg-fire-bg border-[1.5px] border-fire' :
    statusKey === 'resolved' ? 'bg-info-bg border-[1.5px] border-info' :
                                 'bg-surface-sunken border border-border-default'  // uninspected
  ```
- **중요**: 메모리 룰 `feedback_inspection_unresolved_color` 미조치 = fire (주황) 톤. bad/fault → fire-bg/border-fire 매핑. danger 폐기.
- 데스크톱: `<div className={`w-9 h-9 rounded-sm flex-shrink-0 flex items-center justify-center ${iconBoxCls}`}>` + 기존 `<MarkerIcon markerType={selected.marker_type} color={statusColor} size={20} />` 호출 보존
- 모바일: `<div className={`w-10 h-10 rounded-sm flex-shrink-0 flex items-center justify-center ${iconBoxCls}`}>` + size={22}

**라벨 컨텐츠**:
- 데스크톱: `<div className="flex-1 min-w-0">`
  - 라벨 텍스트: `<div className="text-label font-bold text-text-primary mb-1">{markerLabel}</div>` (14px)
  - meta wrap: `<div className="flex flex-wrap gap-2 items-center">`
- 모바일: `<div className="flex-1 min-w-0">` (기존 flex:1 → min-w-0 추가)
  - 라벨 텍스트: `<div className="text-label font-bold text-text-primary mb-1">{markerLabel}</div>` (sketch A1/A2 14px 사용 — 데스크톱과 통일)
  - meta wrap: `<div className="flex flex-wrap gap-2 items-center">`

**meta 항목들** (양쪽 동일):
- floor: `<span className="text-caption text-text-tertiary leading-none">{floor}</span>`
- check_point_id: `<span className="text-caption text-text-tertiary leading-none">CP-... or ID: ...</span>` (기존 `ID: ` 접두 보존, sketch 는 ID 없는 형태도 있으므로 기존 텍스트 그대로)
- statusLabel: statusKey 별 text-color 분기 inline:
  ```tsx
  const statusTextCls =
    statusKey === 'normal'   ? 'text-safe' :
    statusKey === 'caution'  ? 'text-warning' :
    statusKey === 'bad' || statusKey === 'fault' ? 'text-fire' :
    statusKey === 'resolved' ? 'text-info' :
                                 'text-text-tertiary'  // uninspected
  ```
  - `<span className={`text-caption font-bold leading-none ${statusTextCls}`}>{statusLabel}</span>`
- last_inspected_at: `<span className="text-caption text-text-tertiary leading-none">최근 {selected.last_inspected_at.slice(0,10)}</span>`

**✕ close 버튼** (line ~1346, ~1383):
- `<button onClick={() => setSelected(null)} className="text-text-tertiary -mt-1 p-1" aria-label="닫기"><X size={16} /></button>`
- 이모지 ✕ 폐기

**actionButtons** (line ~1254, popup 안에서 `{actionButtons}` 로 호출됨 — popup 변환과 같은 작업단위로 처리):

기존 (변환 전):
```tsx
{canInspect && <button onClick={...} style={{ flex:1, height:46, borderRadius:12, background:'var(--acl)', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>점검 기록 입력</button>}
{canResolve && <button onClick={...} style={{ flex:1, height:46, borderRadius:12, background:'linear-gradient(135deg,#f59e0b,#ef4444)', ... }}>조치</button>}
{editMode && (<><button onClick={openEditMarkerModal} style={{...background:'var(--bg3)'...}}>수정</button><button onClick={...삭제} style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444'...}}><svg.../></button></>)}
```

변환 후 (sketch A1/A2 액션 버튼 + 룰 §2.4 mirror):
```tsx
<div className="flex gap-2">
  {canInspect && (
    <button onClick={...기존 로직 보존...}
      className="flex-1 h-input rounded-sm bg-accent text-text-on-accent text-label font-bold cursor-pointer">
      점검 기록 입력
    </button>
  )}
  {canResolve && (
    <button onClick={...기존 로직 보존...}
      className="flex-1 h-input rounded-sm bg-accent text-text-on-accent text-label font-bold cursor-pointer">
      조치
    </button>
  )}
  {editMode && (
    <>
      <button onClick={openEditMarkerModal}
        className="flex-1 h-input rounded-sm bg-surface-sunken border border-border-default text-text-secondary text-label font-semibold cursor-pointer">
        수정
      </button>
      <button onClick={() => { if (confirm('마커를 삭제하시겠습니까?')) deleteMutation.mutate(selected.id) }}
        className="w-input h-input rounded-sm bg-danger-bg border border-danger-bar/40 text-danger inline-flex items-center justify-center flex-shrink-0 cursor-pointer"
        aria-label="삭제">
        <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    </>
  )}
</div>
```
- 데스크톱 `isDesktop ? 38` 분기는 폐기 (h-input 통일) — sketch 도 분기 없음. 단 sketch 룰 §2.4 의 h-input(44px) 적용 시 데스크톱이 살짝 커지지만 sketch verbatim 따름.
- `w-input` 클래스가 tailwind config 에 없으면 `w-[44px] h-input` 으로 대체.

### B. inspectModal — 점검 기록 입력 (sketch B1/B2)

**AccessBlocked variant** (FloorPlanPage.tsx line ~1739-1743):
- 백드롭: `<div className="absolute inset-0 z-[50] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setInspectModal(false)}>`
- wrapper: `<div className="relative w-[90%] max-w-[340px] h-[290px] bg-surface-raised border border-border-default rounded-md" onClick={e => e.stopPropagation()}>`
- 내부 `<AccessBlockedPopup onConfirm={...} />` 그대로 호출 (popup 컴포넌트 자체는 out-of-scope)

**일반 variant 백드롭** (line ~1747):
- `<div className="absolute inset-0 z-[50] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setInspectModal(false)}>`

**모달 wrapper** (line ~1748):
- `<div className="relative w-[90%] max-w-[340px] max-h-[86vh] overflow-y-auto bg-surface-raised border border-border-default rounded-md p-5" onClick={e => e.stopPropagation()}>`

**헤더 영역** (line ~1749-1752):
- 타이틀: `<div className="text-body font-bold text-text-primary mb-1">점검 기록 입력</div>`
- meta: `<div className="text-caption text-text-tertiary mb-3.5">{location} · {floor}</div>`

**소화기 KV grid** (line ~1754-1767, `planType === 'extinguisher' && inspectExtDetail`):
- wrapper: `<div className="bg-surface-page border border-border-default rounded-sm px-3 py-2.5 mb-2">`
- grid: `<div className="grid grid-cols-2 gap-x-3 gap-y-1 text-caption">`
- 각 row: `<div><span className="text-text-tertiary">위치 </span><span className="text-text-primary font-semibold">{value}</span></div>` (8 row 기존 유지)

**소화기 액션 버튼 row** (line ~1769-1786):
- row: `<div className="flex gap-1.5 mb-3.5">`
- 정보 수정: `<button onClick={...} className="flex-1 h-8 rounded-sm bg-surface-sunken border border-border-default text-text-secondary text-caption font-semibold leading-none cursor-pointer">정보 수정</button>`
- 소화기 분리: `<button onClick={...} className="flex-1 h-8 rounded-sm bg-danger-bg border border-danger-bar/40 text-danger text-caption font-semibold leading-none cursor-pointer">소화기 분리</button>`
  - `border-danger-bar/40` 가 미지원이면 sketch 의 `border-danger-bar` 그대로 사용 (sketch verbatim)

**점검 결과 3택** (line ~1788-1798):
- 라벨: `<div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">점검 결과</div>`
- row: `<div className="flex gap-1.5 mb-3.5">`
- 각 버튼: 3개를 inspectResult 값 기반으로 매핑. 코드 패턴:
  ```tsx
  {([
    ['normal','정상', CheckCircle2, 'safe'],
    ['caution','주의', AlertTriangle, 'warning'],
    ['bad','불량', XCircle, 'danger'],
  ] as const).map(([val, label, Icon, tone]) => {
    const sel = inspectResult === val
    const cls = sel
      ? (tone === 'safe' ? 'border-[1.5px] border-safe bg-safe-bg text-safe'
         : tone === 'warning' ? 'border-[1.5px] border-warning bg-warning-bg text-warning'
         : 'border-[1.5px] border-danger bg-danger-bg text-danger')
      : 'border border-border-default bg-surface-page text-text-secondary'
    return (
      <button key={val} onClick={() => setInspectResult(val)}
        className={`flex-1 inline-flex items-center justify-center gap-1 px-1 py-2.5 rounded-sm text-caption font-bold cursor-pointer transition-colors ${cls}`}>
        <Icon size={14} />{label}
      </button>
    )
  })}
  ```
- 기존 `color + '22'` 알파 트릭, raw hex (#22c55e/#eab308/#ef4444) 완전 폐기.

**증상 피커** (line ~1800-1814, `planType === 'guidelamp' && inspectResult !== 'normal' && needSymptom` — 기존 needSymptom 조건 보존):
- 라벨: `<div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">증상</div>`
- row: `<div className="flex gap-1.5 mb-2.5">`
- 각 버튼:
  ```tsx
  {['점등 이상','예비전원 이상','직접 입력'].map(s => {
    const sel = inspectSymptomPick === s
    return (
      <button key={s} onClick={() => setInspectSymptomPick(s)}
        className={`flex-1 px-1 py-2.5 rounded-sm text-caption font-bold cursor-pointer transition-colors ${
          sel ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
              : 'border border-border-default bg-surface-page text-text-secondary'
        }`}>
        {s}
      </button>
    )
  })}
  ```
- 기존 `rgba(59,130,246,.12)` 폐기.

**특이사항 textarea + 사진** (line ~1816-1830):
- label row: `<div className="flex items-center justify-between mb-1.5">`
  - label: `<label className="text-caption font-semibold text-text-tertiary tracking-wider">{needSymptom && inspectSymptomPick === '직접 입력' ? '증상 상세 및 특이사항 (선택)' : '특이사항 (선택)'}</label>`
  - 사진 sub-label: `<span className="text-caption text-text-tertiary leading-none">점검 사진 (선택)</span>`
- row: `<div className="flex gap-2 items-start mb-3.5">`
- textarea: `<textarea value={inspectMemo} onChange={e => setInspectMemo(e.target.value)} placeholder="특이사항을 입력하세요" className="flex-1 rounded-sm bg-surface-page border border-border-default text-text-primary text-label p-2.5 resize-none outline-none box-border" style={{ height: 72, fontFamily: 'inherit' }} />`
  - sketch 의 `h-18 leading-relaxed` 토큰 미지원 가능 → inline style `height: 72` 보존 + `text-label` (line-height: 1.5) 으로 충분
- PhotoButton: `<PhotoButton hook={inspectPhoto} label="촬영" noCapture />` — 기존 호출 그대로 보존

**paired BC 섹션** (line ~1832-1870, `pairedBC` 있을 때만):
- divider: `<div className="h-px bg-border-default my-2.5" />`
- BC 카드: `<div className="bg-surface-page border border-border-default rounded-sm px-3 py-2 mb-2.5">`
  - category: `<div className="text-caption text-text-tertiary">{pairedBC.category}</div>`
  - location: `<div className="text-label font-bold text-text-primary mt-0.5">{pairedBC.location}</div>`
  - description (조건부): `<div className="text-caption text-text-tertiary mt-0.5">{pairedBC.description}</div>`
- BC 결과 3택: 위 §점검 결과와 동일 패턴 (state 만 inspectBcResult/setInspectBcResult 로 swap)
  - 라벨: `<div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">비상콘센트 점검 결과</div>`
  - row: `<div className="flex gap-1.5 mb-2.5">` (sketch B2 의 paired BC row gap-1.5)
- BC textarea + photo: 위 §특이사항 textarea 동일 패턴 (state inspectBcMemo / hook inspectBcPhoto 로 swap)
  - 라벨: `<label className="text-caption font-semibold text-text-tertiary tracking-wider">특이사항 (선택)</label>`
  - mb-3.5 wrapper

**하단 액션** (line ~1872-1944):
- row: `<div className="flex gap-2">`
- 취소: `<button onClick={() => setInspectModal(false)} className="flex-1 h-input rounded-sm bg-surface-sunken border border-border-default text-text-secondary text-label font-semibold cursor-pointer">취소</button>`
- 저장: 기존 onClick 핸들러 보존 + className 변환:
  ```tsx
  <button
    disabled={inspectSubmitting || inspectPhoto.uploading || inspectBcPhoto.uploading || isAccessBlocked}
    onClick={async () => { ...기존 핸들러 verbatim 보존... }}
    className="flex-1 h-input rounded-sm bg-accent text-text-on-accent text-label font-bold cursor-pointer disabled:opacity-50 disabled:bg-border-default disabled:text-text-disabled disabled:cursor-default">
    {(inspectPhoto.uploading || inspectBcPhoto.uploading) ? '사진 업로드 중...' : inspectSubmitting ? '저장 중...' : isAccessBlocked ? '접근 불가 개소' : '저장'}
  </button>
  ```
- 기존 `'var(--acl)'` / `'var(--bd2)'` / `'var(--t3)'` 인라인 폐기.

### C. resolveModal — 조치 입력 (sketch C1/C2)

**백드롭** (line ~2039):
- `<div className="absolute inset-0 z-[50] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setResolveModal(false)}>`

**모달 wrapper** (line ~2040):
- `<div className="relative w-[90%] max-w-[340px] max-h-[86vh] overflow-y-auto bg-surface-raised border border-border-default rounded-md p-5" onClick={e => e.stopPropagation()}>`

**헤더 영역** (line ~2041-2042):
- 타이틀: `<div className="text-body font-bold text-text-primary mb-1">조치 입력</div>`
- meta: `<div className="text-caption text-text-tertiary mb-1">{selected.label || '마커'} · {floor}</div>`

**지적 메모 배지** (line ~2043-2047, `selected.last_memo` 있을 때만):
- `<div className="text-caption text-warning bg-warning-bg border border-warning-bar/40 rounded-sm px-2.5 py-1.5 mb-3">지적: {selected.last_memo}</div>`
  - `border-warning-bar/40` 미지원 시 `border-warning-bar` 로 (sketch verbatim)

**유도등 분기** (`planType === 'guidelamp'`):

조치 피커 3택 (line ~2051-2060) — 증상 피커 동일 패턴 (accent 선택):
```tsx
<div className="flex gap-1.5 mb-2.5">
  {(['본체 교체','예비전원 교체','직접 입력'] as const).map(opt => {
    const sel = resolveActionPick === opt
    return (
      <button key={opt} onClick={() => setResolveActionPick(opt)}
        className={`flex-1 px-1 py-2.5 rounded-sm text-caption font-bold cursor-pointer transition-colors ${
          sel ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
              : 'border border-border-default bg-surface-page text-text-secondary'
        }`}>
        {opt}
      </button>
    )
  })}
</div>
```

직접 입력 textarea (line ~2063-2070, `resolveActionPick === '직접 입력'` 일 때만):
```tsx
<textarea
  value={resolveMemo}
  onChange={e => setResolveMemo(e.target.value)}
  placeholder="조치 내용을 입력하세요 (필수)"
  className="w-full rounded-sm bg-surface-page border border-border-default text-text-primary text-label p-2.5 resize-none outline-none box-border mb-2.5"
  style={{ height: 72, fontFamily: 'inherit' }}
/>
```

자재 라벨 row (line ~2073-2076):
```tsx
<div className="flex items-center justify-between mb-1.5">
  <label className="text-caption font-semibold text-text-tertiary tracking-wider">소모 자재</label>
  <span className="text-caption text-text-tertiary leading-none">조치 사진 (선택)</span>
</div>
```

자재 input + photo row (line ~2079-2101):
```tsx
<div className="flex gap-2 items-start mb-3.5">
  <div className="flex-1 min-w-0 flex flex-col gap-1" style={{ height: 72 }}>
    <input
      type="text"
      value={resolveMaterialName}
      onChange={e => setResolveMaterialName(e.target.value)}
      placeholder="자재명"
      className="flex-1 min-h-0 w-full px-2.5 rounded-sm bg-surface-page border border-border-default text-text-primary text-label outline-none box-border"
      style={{ fontFamily: 'inherit' }}
    />
    <div className="relative flex-1 min-h-0">
      <input
        type="number"
        min={0}
        value={resolveMaterialCount}
        onChange={e => setResolveMaterialCount(e.target.value)}
        placeholder="0"
        className="w-full h-full pl-2.5 pr-7 rounded-sm bg-surface-page border border-border-default text-text-primary text-label outline-none box-border"
        style={{ fontFamily: 'inherit' }}
      />
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-caption text-text-tertiary pointer-events-none">ea</span>
    </div>
  </div>
  <PhotoButton hook={resolvePhoto} label="촬영" noCapture />
</div>
```

**그 외 분기** (line ~2103-2118, `planType !== 'guidelamp'`):
```tsx
<div className="flex items-center justify-between mb-1.5">
  <label className="text-caption font-semibold text-text-tertiary tracking-wider">조치 내용 (필수)</label>
  <span className="text-caption text-text-tertiary leading-none">조치 사진 (선택)</span>
</div>
<div className="flex gap-2 items-start mb-3.5">
  <textarea
    value={resolveMemo}
    onChange={e => setResolveMemo(e.target.value)}
    placeholder="조치 내용을 입력하세요"
    className="flex-1 rounded-sm bg-surface-page border border-border-default text-text-primary text-label p-2.5 resize-none outline-none box-border"
    style={{ height: 72, fontFamily: 'inherit' }}
  />
  <PhotoButton hook={resolvePhoto} label="촬영" noCapture />
</div>
```

**하단 액션** (line ~2120-2160):
- 취소: 위 inspectModal 취소와 동일 className
- 조치 완료: 기존 onClick 핸들러 verbatim 보존 + className 변환:
  ```tsx
  <button
    disabled={resolveSubmitting || resolvePhoto.uploading}
    onClick={async () => { ...기존 핸들러 verbatim 보존... }}
    className="flex-1 h-input rounded-sm bg-accent text-text-on-accent text-label font-bold cursor-pointer disabled:opacity-50 disabled:bg-border-default disabled:text-text-disabled disabled:cursor-default">
    {resolvePhoto.uploading ? '사진 업로드 중...' : resolveSubmitting ? '저장 중...' : '조치 완료'}
  </button>
  ```
- 기존 `linear-gradient(135deg,#f59e0b,#ef4444)` 그라디언트 폐기 (sketch C1/C2 단색 accent mirror, 메모리 룰 `feedback_redesign_sketch_rule_enforcement` §6.2 negative rule).

## 변환 금지 영역 (Out-of-Scope — 변경 0건 검증)

이 PLAN 의 변환 범위 **밖**. 변경되면 안 되는 줄 (verify gate 에서 git diff 로 확인):

- line 1~272 (상수/타입/MarkerIcon SVG/STATUS_COLOR map)
- line 273~1253 (state declarations, useEffect, useQuery, useMutation, handler 함수들, 도면 캔버스 SVG/이미지 영역, 마커 SVG 렌더링)
- line 1389~1471 (범례 div — Row 1 마커 종류 / Row 2 점검 상태 + 미배치 + 분말 경고)
- line 1473~1585 (마커 수정 모달 — editMarker)
- line 1587~1689 (마커 추가 모달 — addModal)
- line 1691~1721 (재진입 팝업 — revisitPopup)
- line 1952~1974 (소화기 분리 확인 — unassignConfirm)
- line 1977~1998 (미배치 마커 안내 — emptyMarkerModal)
- line 2001~2036 (소화기 배치 확인 — placingConfirm)

actionButtons (line 1254~1293) 는 **변환 범위 안** (popup 안에서 직접 호출되어 모달 chrome 통일성 필수).

</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: FloorPlanPage.tsx 3 모달 + actionButtons sketch verbatim 변환</name>
  <files>cha-bio-safety/src/pages/FloorPlanPage.tsx</files>
  <action>
    **사전 검증**:
    1. `git branch --show-current` 가 `redesign/06-floorplan-v2` 인지 확인 (메모리 룰 `feedback_check_branch_before_edit`)
    2. `git status --short` 으로 dirty 한 modified 파일 없는지 확인 (untracked SUMMARY.md 는 OK)

    **변환 순서 (위에서 아래)**:

    **Step 1 — lucide-react import 보강 (line 5)**:
    - 기존: `import { ChevronLeft } from 'lucide-react'`
    - 변경: `import { ChevronLeft, X, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'`

    **Step 2 — actionButtons 변환 (line ~1254~1293)**:
    - 위 `<interfaces>` 의 ## A. actionButtons 변환 후 블록 verbatim 적용
    - 점검 기록 입력 / 조치 / 수정 / 삭제 4 버튼 모두 inline style 제거 → className
    - 점검 기록 입력 `var(--acl)` → `bg-accent text-text-on-accent`
    - 조치 `linear-gradient(135deg,#f59e0b,#ef4444)` → `bg-accent text-text-on-accent` (단색)
    - 수정 `var(--bg3) + border var(--bd) + var(--t1)` → `bg-surface-sunken border border-border-default text-text-secondary`
    - 삭제 `rgba(239,68,68,0.15) + border rgba(239,68,68,0.3) + #ef4444` → `bg-danger-bg border border-danger-bar/40 text-danger` (`/40` 미지원이면 `border-danger-bar`)
    - 모든 버튼 height 통일: `h-input` (sketch verbatim 룰 §2.4)
    - 삭제 버튼 size 는 `w-[44px] h-input` (또는 사용자 환경의 w-input alias)
    - onClick / disabled / 텍스트 / SVG path / confirm 호출 verbatim 보존

    **Step 3 — 마커 popup 데스크톱 balloon 변환 (line ~1300~1351)**:
    - outer div: className/style 분리 (위 `<interfaces>` ## A. 데스크톱 balloon wrapper)
    - arrow div: bp.arrowDir 분기 className/style 적용 (위 ## A. arrow div)
    - 컨텐츠 row: `<div className="flex items-start gap-2.5 mb-3">`
    - 아이콘 박스: iconBoxCls 인라인 helper 분기 적용 → 36x36 (`w-9 h-9 rounded-sm flex-shrink-0 flex items-center justify-center`)
    - MarkerIcon 호출 verbatim 보존 (color={statusColor} size={20})
    - 라벨 div: `text-label font-bold text-text-primary mb-1`
    - meta wrap: `flex flex-wrap gap-2 items-center`
    - meta span 들: 위 `<interfaces>` ## A. meta 항목들 verbatim
    - statusLabel: statusTextCls 인라인 helper 분기 → `text-caption font-bold leading-none ${cls}`
    - ✕ → `<button ...><X size={16} /></button>`
    - `{actionButtons}` 호출 verbatim 보존

    **Step 4 — 마커 popup 모바일 sheet 변환 (line ~1353~1387)**:
    - outer div: className/style 분리 (위 ## A. 모바일 sheet wrapper)
    - grab handle 추가: `<div className="w-9 h-1 rounded-pill bg-border-default mx-auto mb-3.5" />` (기존 라인 ~1364 의 div 변환)
    - 컨텐츠 row: `<div className="flex items-start gap-3 mb-4">`
    - 아이콘 박스: 40x40 (`w-10 h-10 rounded-sm flex-shrink-0 flex items-center justify-center`) + iconBoxCls
    - MarkerIcon: color={statusColor} size={22}
    - 라벨/meta/statusLabel: 데스크톱과 동일 className (단 데스크톱과 동일 text-label 14px 사용 — sketch A1/A2 verbatim)
    - ✕ → `<button ...><X size={16} /></button>`
    - `{actionButtons}` 호출 verbatim 보존

    **Step 5 — inspectModal AccessBlocked variant 변환 (line ~1737~1745)**:
    - 백드롭 + wrapper className 변환 (위 ## B. AccessBlocked variant)
    - `<AccessBlockedPopup onConfirm={...} />` 호출 verbatim 보존

    **Step 6 — inspectModal 일반 variant 변환 (line ~1747~1948)**:
    - 백드롭 + wrapper (위 ## B. 일반 variant 백드롭 + 모달 wrapper)
    - 헤더 / meta
    - 소화기 KV grid (분기 `planType === 'extinguisher' && inspectExtDetail` 유지)
    - 소화기 액션 버튼 row (정보 수정 / 소화기 분리)
    - 점검 결과 3택 (위 ## B. 점검 결과 3택 코드 패턴 verbatim)
    - 증상 피커 (분기 `needSymptom` 유지)
    - 특이사항 textarea + PhotoButton row
    - paired BC 섹션 (분기 `pairedBC` 유지) — divider / BC 카드 / BC 결과 / BC textarea+photo
    - 하단 액션 (취소 + 저장) — onClick handler verbatim 보존, className 만 교체

    **Step 7 — resolveModal 변환 (line ~2038~2162)**:
    - 백드롭 + wrapper
    - 헤더 / meta / 지적 메모 배지 (분기 `selected.last_memo` 유지)
    - 유도등 분기: 조치 피커 3택 + 직접 입력 textarea + 자재 input + photo
    - 그 외 분기: 조치 내용 textarea + photo
    - 하단 액션 (취소 + 조치 완료) — onClick handler verbatim 보존, gradient → 단색 accent, className 만 교체

    **변환 시 주의**:
    - 비즈니스 로직 (state set / onClick handler / useQuery / useMutation / api 호출 / inspectionApi/extinguisherApi/photo upload / qc.invalidateQueries / toast / navigate) **전혀 손대지 않음**. className/style 만 교체.
    - `planType === 'guidelamp' || selected.check_point_id` 같은 분기 조건 verbatim 보존.
    - `MARKER_TO_GL` map, `glType`, `needSymptom` 계산 verbatim 보존.
    - PhotoButton 호출 시그니처 (`hook={inspectPhoto} label="촬영" noCapture`) verbatim 보존.
    - 변환 영역 밖 (interfaces 의 ## 변환 금지 영역) 은 git diff 에서 변경 0줄.

    **검증 후 commit 1개**: `fix(260517-ghz-W1): 06 FloorPlanPage 3 모달 + actionButtons sketch verbatim 변환`
  </action>
  <verify>
    <automated>
      F=cha-bio-safety/src/pages/FloorPlanPage.tsx
      # 변환 영역만 추출해 검사: line 1254~2165 (actionButtons + 3 모달 영역)
      AREA=$(sed -n '1254,2165p' "$F")
      # 1) 옛 alias 토큰 0건 (var(--bg2/bg3/bd/bd2/t1/t2/t3/acl/warn/danger))
      ALIAS_BG2=$({ echo "$AREA" | grep -c 'var(--bg2)' || true; })
      ALIAS_BG3=$({ echo "$AREA" | grep -c 'var(--bg3)' || true; })
      ALIAS_BD=$({ echo "$AREA" | grep -c 'var(--bd)' || true; })
      ALIAS_BD2=$({ echo "$AREA" | grep -c 'var(--bd2)' || true; })
      ALIAS_T1=$({ echo "$AREA" | grep -c 'var(--t1)' || true; })
      ALIAS_T2=$({ echo "$AREA" | grep -c 'var(--t2)' || true; })
      ALIAS_T3=$({ echo "$AREA" | grep -c 'var(--t3)' || true; })
      ALIAS_ACL=$({ echo "$AREA" | grep -c 'var(--acl)' || true; })
      ALIAS_WARN=$({ echo "$AREA" | grep -c 'var(--warn' || true; })
      ALIAS_DANGER=$({ echo "$AREA" | grep -c 'var(--danger' || true; })
      echo "alias bg2=$ALIAS_BG2 bg3=$ALIAS_BG3 bd=$ALIAS_BD bd2=$ALIAS_BD2 t1=$ALIAS_T1 t2=$ALIAS_T2 t3=$ALIAS_T3 acl=$ALIAS_ACL warn=$ALIAS_WARN danger=$ALIAS_DANGER"
      [ "$ALIAS_BG2" -eq 0 ] && [ "$ALIAS_BG3" -eq 0 ] && [ "$ALIAS_BD" -eq 0 ] && [ "$ALIAS_BD2" -eq 0 ] && [ "$ALIAS_T1" -eq 0 ] && [ "$ALIAS_T2" -eq 0 ] && [ "$ALIAS_T3" -eq 0 ] && [ "$ALIAS_ACL" -eq 0 ] && [ "$ALIAS_WARN" -eq 0 ] && [ "$ALIAS_DANGER" -eq 0 ] || { echo "FAIL: 옛 alias 토큰 잔존"; exit 1; }

      # 2) raw hex 0건 (MarkerIcon stroke="#fff" 같은 SVG 내부는 변환 영역 밖이라 검사 안 함)
      HEX_22=$({ echo "$AREA" | grep -cE "'#22c55e'" || true; })
      HEX_EAB=$({ echo "$AREA" | grep -cE "'#eab308'" || true; })
      HEX_EF=$({ echo "$AREA" | grep -cE "'#ef4444'" || true; })
      HEX_F5=$({ echo "$AREA" | grep -cE "'#f59e0b'" || true; })
      RGBA=$({ echo "$AREA" | grep -cE 'rgba\(245,158' || true; })
      RGBA2=$({ echo "$AREA" | grep -cE 'rgba\(59,130,246' || true; })
      RGBA3=$({ echo "$AREA" | grep -cE 'rgba\(239,68,68,\.[0-9]' || true; })
      echo "hex 22=$HEX_22 eab=$HEX_EAB ef=$HEX_EF f5=$HEX_F5 rgba245=$RGBA rgba59=$RGBA2 rgba239=$RGBA3"
      [ "$HEX_22" -eq 0 ] && [ "$HEX_EAB" -eq 0 ] && [ "$HEX_EF" -eq 0 ] && [ "$HEX_F5" -eq 0 ] && [ "$RGBA" -eq 0 ] && [ "$RGBA2" -eq 0 ] && [ "$RGBA3" -eq 0 ] || { echo "FAIL: raw hex 잔존"; exit 1; }

      # 3) linear-gradient 0건
      GRAD=$({ echo "$AREA" | grep -c 'linear-gradient' || true; })
      echo "gradient=$GRAD"
      [ "$GRAD" -eq 0 ] || { echo "FAIL: linear-gradient 잔존"; exit 1; }

      # 4) 이모지 ✕ 0건 + 새 lucide X import
      EMOJI=$({ echo "$AREA" | grep -c '✕' || true; })
      LUCIDE_X=$(grep -c "from 'lucide-react'" "$F" | head -1)
      LUCIDE_HAS_X=$(grep "from 'lucide-react'" "$F" | grep -c ', X,')
      LUCIDE_HAS_CC=$(grep "from 'lucide-react'" "$F" | grep -c 'CheckCircle2')
      LUCIDE_HAS_AT=$(grep "from 'lucide-react'" "$F" | grep -c 'AlertTriangle')
      LUCIDE_HAS_XC=$(grep "from 'lucide-react'" "$F" | grep -c 'XCircle')
      echo "emoji=$EMOJI lucide_x=$LUCIDE_HAS_X cc=$LUCIDE_HAS_CC at=$LUCIDE_HAS_AT xc=$LUCIDE_HAS_XC"
      [ "$EMOJI" -eq 0 ] && [ "$LUCIDE_HAS_X" -ge 1 ] && [ "$LUCIDE_HAS_CC" -ge 1 ] && [ "$LUCIDE_HAS_AT" -ge 1 ] && [ "$LUCIDE_HAS_XC" -ge 1 ] || { echo "FAIL: 이모지 잔존 또는 lucide import 누락"; exit 1; }

      # 5) sketch verbatim 핵심 className 등장 확인 (최소 1회 이상)
      CLS_RAISED=$({ echo "$AREA" | grep -c 'bg-surface-raised border border-border-default rounded-md' || true; })
      CLS_ACCENT=$({ echo "$AREA" | grep -c 'bg-accent text-text-on-accent text-label font-bold' || true; })
      CLS_SAFE=$({ echo "$AREA" | grep -c 'border-\[1.5px\] border-safe bg-safe-bg text-safe' || true; })
      CLS_WARNING=$({ echo "$AREA" | grep -c 'border-\[1.5px\] border-warning bg-warning-bg text-warning' || true; })
      CLS_DANGER=$({ echo "$AREA" | grep -c 'border-\[1.5px\] border-danger bg-danger-bg text-danger' || true; })
      CLS_ACCENT_SEL=$({ echo "$AREA" | grep -c 'border-\[1.5px\] border-accent bg-accent text-text-on-accent' || true; })
      CLS_UNSEL=$({ echo "$AREA" | grep -c 'border border-border-default bg-surface-page text-text-secondary' || true; })
      echo "raised=$CLS_RAISED accent=$CLS_ACCENT safe=$CLS_SAFE warning=$CLS_WARNING danger=$CLS_DANGER accent-sel=$CLS_ACCENT_SEL unsel=$CLS_UNSEL"
      [ "$CLS_RAISED" -ge 3 ] && [ "$CLS_ACCENT" -ge 2 ] && [ "$CLS_SAFE" -ge 1 ] && [ "$CLS_WARNING" -ge 1 ] && [ "$CLS_DANGER" -ge 1 ] && [ "$CLS_ACCENT_SEL" -ge 1 ] && [ "$CLS_UNSEL" -ge 2 ] || { echo "FAIL: sketch verbatim className 누락"; exit 1; }

      # 6) 변환 금지 영역 (line 1389~1721 범례+editMarker+addModal+revisitPopup) 변경 0줄
      git diff --unified=0 "$F" -- | awk '/^@@/ {match($0, /\+([0-9]+)(,([0-9]+))?/, a); start=a[1]; cnt=a[3]==""?1:a[3]; end=start+cnt-1; if (start>=1389 && end<=1721) print "BAD-LINE: "$0; }' > /tmp/forbidden_diff.txt
      FORBIDDEN=$(wc -l < /tmp/forbidden_diff.txt)
      echo "forbidden-area-changes=$FORBIDDEN"
      [ "$FORBIDDEN" -eq 0 ] || { echo "FAIL: 변환 금지 영역 변경됨"; cat /tmp/forbidden_diff.txt; exit 1; }

      # 7) tsc + build PASS
      cd cha-bio-safety && npm run build 2>&1 | tail -20
    </automated>
  </verify>
  <done>
    - lucide-react import 에 X / CheckCircle2 / AlertTriangle / XCircle 4개 추가됨
    - actionButtons (line ~1254) inline style 모두 className 으로 변환됨, gradient 폐기 + 단색 accent
    - 마커 popup 데스크톱 balloon + 모바일 sheet sketch className verbatim 적용
    - inspectModal AccessBlocked variant + 일반 variant 전체 변환
    - resolveModal 유도등 분기 + 그 외 분기 전체 변환
    - 위 verify 의 모든 grep gate PASS (alias 0 / hex 0 / gradient 0 / emoji 0 / 핵심 className 등장 / 변환 금지 영역 0 변경)
    - npm run build PASS
    - git commit 1개 생성: `fix(260517-ghz-W1): 06 FloorPlanPage 3 모달 + actionButtons sketch verbatim 변환`
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: 브라우저 시각 검증 (3 모달 + actionButtons)</name>
  <what-built>
    redesign/06-floorplan-v2 브랜치에서 FloorPlanPage.tsx 의 3 모달 (마커 popup / inspectModal / resolveModal) + actionButtons 를 sketch HTML verbatim 으로 변환. v0.1.1 토큰 Tailwind className 적용. 옛 alias 토큰 / raw hex / linear-gradient / 이모지 ✕ 모두 폐기.
  </what-built>
  <how-to-verify>
    **1. 로컬 dev 서버 띄우기** (이미 떠 있으면 build 결과 새로고침으로 충분):
    ```bash
    cd cha-bio-safety && npm run dev
    ```

    **2. 도면 페이지 접근**:
    - 브라우저 (또는 PWA) 로 `/floorplan` 진입
    - 한 층 (예: 3F) + 도면 종류 (유도등 또는 소화기·소화전) 선택 후 마커 1개 탭

    **3. 마커 선택 popup 확인** (sketch A1/A2/A3 mirror):
    - 모바일: 하단 sheet 가 `bg-surface-raised` (회색) 톤 + 상단에 grab handle (얇은 가로 막대) + 좌측 상태 아이콘 박스 + 라벨 + ✕(lucide X 아이콘) + 하단 액션 버튼
    - 데스크톱: 마커 옆 balloon + 화살표가 surface-raised 색으로 가리킴
    - 상태 색 확인:
      - 정상 마커: 아이콘 박스 safe-bg + safe border (초록 톤), "정상" 라벨도 safe (초록)
      - 미조치 (bad/fault) 마커: 아이콘 박스 **fire-bg + fire border (주황 톤)** + "불량" 라벨도 fire (주황). danger (빨강) 가 **아님** — 이게 메모리 룰 `feedback_inspection_unresolved_color` 의 핵심
      - 미점검 (uninspected): 아이콘 박스 surface-sunken + 회색 border + "미점검" 라벨 tertiary 회색
    - actionButtons 확인:
      - 점검 기록 입력 버튼이 **단색 accent (파랑)** + `h-input` (44px)
      - 조치 버튼이 **단색 accent (파랑)** — 옛 주황→빨강 그라디언트 사라짐
      - 두 버튼 className 동일하게 보임

    **4. inspectModal 확인** ("점검 기록 입력" 클릭):
    - 모달 wrapper 가 `bg-surface-raised` (회색) + `rounded-md` (12px) + `p-5` (20px padding)
    - 타이틀 "점검 기록 입력" 이 16px font-bold
    - 점검 결과 3택 (정상 / 주의 / 불량):
      - 선택 시 status 페어 토큰 적용 (safe / warning / danger 1.5px border + bg)
      - 비선택은 `bg-surface-page` + `border-border-default` (어두운 톤, 박스 윤곽만)
      - 각 버튼에 lucide 아이콘 (CheckCircle2 / AlertTriangle / XCircle) 14px
    - 소화기 카테고리인 경우: 상단에 KV grid (위치/제조업체/...) + "정보 수정" / "소화기 분리" 작은 버튼 2개 (h-8 + leading-none — 글자 padding 도리)
    - 유도등 카테고리 + 비정상 선택 시: "증상" 라벨 + 3택 (점등 이상 / 예비전원 이상 / 직접 입력) accent 톤
    - 특이사항 textarea 가 `bg-surface-page` (모달 wrapper 보다 어둠) + textarea 옆 PhotoButton "촬영" placeholder
    - paired BC 있는 경우 (소화전 + 같은 location_no): divider 아래 BC 카드 + BC 점검 결과 3택 + BC 특이사항
    - 하단 액션:
      - 취소 = surface-sunken (어두운 회색)
      - 저장 = **단색 accent (파랑)**
      - 저장 중 / 사진 업로드 중 / 접근 불가 상태일 때 disabled (opacity 50 + border-default bg)

    **5. resolveModal 확인** (불량+미조치 마커 → "조치" 버튼 클릭):
    - 모달 wrapper 동일 (`bg-surface-raised border border-border-default rounded-md p-5`)
    - 타이틀 "조치 입력" 16px font-bold
    - 지적 메모 배지: `bg-warning-bg + border-warning-bar` (노란 카드) 안에 "지적: ..."
    - 유도등 분기:
      - 조치 피커 3택 (본체 교체 / 예비전원 교체 / 직접 입력) — 선택 시 accent
      - "직접 입력" 선택 시 textarea 노출
      - 자재명 + 개수 + ea suffix + PhotoButton 한 줄 (사진 박스 옆에 input 2단)
    - 그 외 분기 (감지기/스프링클러/소화기·소화전):
      - 조치 내용 textarea + PhotoButton 한 줄
    - 하단 액션:
      - 취소 = surface-sunken
      - 조치 완료 = **단색 accent (파랑)** — 옛 주황→빨강 그라디언트 사라짐

    **6. 비교 검증 (선택)**:
    - 02 InspectionPage 의 카테고리 모달 (예: 소화전) 옆에 06 FloorPlanPage 의 inspectModal 비교 → wrapper / 헤더 / 결과 3택 / 하단 액션 className 1:1 동일
    - 05 RemediationDetailPage 의 "조치 완료" 버튼 옆에 06 resolveModal "조치 완료" 비교 → 단색 accent + h-input 동일

    **7. 변경 안 됨 확인**:
    - 도면 캔버스 위 마커 SVG 자체 모양 / 색은 변경 없음 (MarkerIcon SVG out-of-scope)
    - 범례 (`Row 1` 마커 종류, `Row 2` 점검 상태 도트) 는 변경 없음 — 다음 wave 후보
    - 마커 추가 모달 / 마커 수정 모달 / 재진입 팝업 / 소화기 분리/배치 확인 모달 / 미배치 안내 모달 은 변경 없음 — 다음 wave 후보

    **검증 항목**:
    - [ ] 마커 popup (데스크톱+모바일) 시각 일치
    - [ ] popup 안 상태 색 5종 (normal/caution/bad·fault/resolved/uninspected) 모두 페어 토큰 적용
    - [ ] 미조치 (bad) 가 fire (주황) 톤 — danger (빨강) 아님
    - [ ] inspectModal 점검 결과 3택 (선택/비선택 + 아이콘) 시각 일치
    - [ ] inspectModal 소화기 분기 (KV grid + 정보수정/소화기분리) 시각 일치
    - [ ] inspectModal 유도등 증상 피커 (accent) + paired BC 섹션 시각 일치
    - [ ] resolveModal 지적 메모 배지 (warning) + 유도등 조치 피커 + 자재 input + 그 외 textarea 시각 일치
    - [ ] 모든 CTA (저장 / 조치 완료 / 점검 기록 입력 / 조치) 단색 accent — 그라디언트 0건
    - [ ] disabled 상태 (사진 업로드 중 / 저장 중) 시각 일관성
    - [ ] 이모지 ✕ → lucide X 변경 확인
    - [ ] 도면 캔버스 / 범례 / 다른 모달 (수정/추가/재진입/분리/배치) 변경 없음 확인
  </how-to-verify>
  <resume-signal>
    "approved" — 변환 결과 만족 + 다음 wave (외부 popup InspectionRevisitPopup/AccessBlockedPopup, addModal/editMarker/unassignConfirm/emptyMarkerModal/placingConfirm 등) 진행 OK
    or
    "fix: [구체 항목]" — 수정해야 할 시각/className 항목 (예: "fix: bad-status 가 still danger 빨강으로 보임", "fix: 자재 input ea suffix 위치 어긋남")
  </resume-signal>
</task>

</tasks>

<verification>
- Wave 1 변환 후 `cha-bio-safety && npm run build` PASS
- 변환 영역 안 옛 alias 토큰 / raw hex / linear-gradient / 이모지 ✕ 모두 0건 (grep gate)
- 변환 금지 영역 (line 1389~1721) git diff 0줄 변경
- 사용자 브라우저 시각 검토 PASS
</verification>

<success_criteria>
- FloorPlanPage.tsx 의 3 모달 (마커 popup / inspectModal / resolveModal) + actionButtons 가 sketch HTML 1:1 verbatim 으로 변환됨
- v0.1.1 토큰 + 02 inspection-unification chrome 룰 + 05 단색 accent CTA 패턴 적용
- 비즈니스 로직 변경 0건 (state/handler/useQuery/useMutation/photo hook/planType 분기/needSymptom/pairedBC/isAccessBlocked)
- 사용자가 브라우저 검토 후 "approved" — 다음 wave 진행 OK
</success_criteria>

<output>
After completion, create `.planning/quick/260517-ghz-06-floorplanpage-tsx-wave-1-popup-inspec/260517-ghz-SUMMARY.md` per `$HOME/.claude/get-shit-done/templates/summary.md`
</output>
