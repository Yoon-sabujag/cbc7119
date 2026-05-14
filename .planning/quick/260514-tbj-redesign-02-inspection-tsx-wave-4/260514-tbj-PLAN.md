---
phase: 260514-tbj-redesign-02-inspection-tsx-wave-4
plan: 01
type: execute
wave: 4
depends_on:
  - 260514-i4r-redesign-02-inspection-tsx                # Wave 1 본체 변환 (변환 패턴 + 인라인 화이트리스트)
  - 260514-pnr-wave-1-fix-photobutton-revisitpopup-acce  # Wave 1 fix (외부 컴포넌트 3종 lucide + v0.1.1)
  - 260514-sp7-redesign-02-inspection-tsx-wave-2-5       # Wave 2 본체 변환 (5 증상 피커 패턴 — 댐퍼 피커 신설 시 1:1 일관)
files_modified:
  - cha-bio-safety/src/pages/InspectionPage.tsx
autonomous: true
requirements:
  - REDESIGN-02-INSPECTION-TSX-WAVE4
tags:
  - redesign
  - inspection
  - tsx-conversion
  - design-tokens-v0.1.1
  - tailwind-only
  - baeyeon-modal
  - damper-modal
  - symptom-picker
  - dead-code-cleanup
  - wave4

must_haves:
  truths:
    - "BaeyeonModal(라인 653~879, ~227줄) 의 마크업/스타일이 4차 시안(`inspection-sketch-baeyeon-damper.html` 라인 419~544 — 배연창 Dark/Light 2 viewport) 과 1:1 매칭된다 — 헤더 lucide Square 회색(§6.3 표 색상 안 씀) / `.bar-section` 토큰화 / 결과 picker = `.result-picker` 패턴(pill + lucide outline + status outline+tinted bg, Wave 1 InspectionModal 결과 3종 버튼과 동일 디자인) / 닫기·저장 풋터(§6.4 그라디언트)"
    - "DamperModal(라인 2420~2871, ~452줄) 의 마크업/스타일이 4차 시안 라인 548~717(제연댐퍼 Dark/Light 2 viewport) 과 1:1 매칭된다 — 헤더 lucide Shield 회색 / 항목 선택 segmented / 계단전실 segmented + 장비(배기/급기팬) 칩 / 연결송수관 위치 segmented / stair 모드 2열 stair-tile + `.result-mini` pill picker / equip+yscp 모드 = `.result-picker` (BaeyeonModal 과 동일) / `is-init` (QR 진입 층) 2px fire 보더 유지 / 저장 CTA 동적 라벨(`계단전실 N 점검 저장` / `점검 기록 저장`) 보존"
    - "DamperModal 내부에 댐퍼 증상 피커가 신설된다 (Wave 2 sp7 패턴 1:1 일관) — equip 모드와 연결송수관 단일 폼 모드 양쪽에서 `result !== 'normal'` 일 때 표시. options=['기판 조작 불량','모터 기능 이상','직접 입력'], 컨테이너 `flex flex-wrap gap-1.5`, button inactive=`border-[1.5px] border-border-default bg-surface-raised text-text-secondary`, active=`border-[1.5px] border-accent bg-[rgba(59,130,246,0.12)] text-accent`, 공통 `flex-1 basis-0 min-w-0 px-2 py-2 rounded-md cursor-pointer text-label font-semibold text-center leading-tight transition-colors`. stair 모드(층별 일괄)는 메모 1건만 받는 구조이므로 증상 피커 표시 안 함."
    - "DamperModal 의 댐퍼 증상 피커 신설은 onSave 호출 시 memo 분기로 연결된다 (Wave 2 InspectionModal 패턴 그대로) — `damperSymptomPick === '직접 입력' ? memo.trim() : damperSymptomPick` 을 `handleSingleSave` 의 onSave 직전에 finalMemo 로 적용. stair 모드(handleStairSave)는 메모 그대로 전달."
    - "InspectionModal(라인 3661~3681) 의 댐퍼 증상 피커 dead code 가 제거된다 — `selectedGroup.categories.includes('연결송수관')` 분기가 모든 전실제연댐퍼/연결송수관 카테고리를 DamperModal 로 라우팅하므로 InspectionModal 의 `selectedCP?.category === '전실제연댐퍼'` 분기는 도달 불가. 라인 3661~3681 (21줄) 제거. 단 라인 3691 의 memo 라벨 분기 안의 `|| (selectedCP?.category === '전실제연댐퍼' && result !== 'normal' && damperSymptomPick === '직접 입력')` 도 함께 제거 — 도달 불가 dead branch."
    - "InspectionModal 상단의 useState `damperSymptomPick` 정의(라인 2912)와 finalMemo 분기(라인 3313~3314)도 dead code 가 되므로 함께 제거 — `damperSymptomPick` / `setDamperSymptomPick` 의 모든 사용처가 0건이 되면 useState 도 제거. (단, InspectionModal 의 나머지 4 피커(symptomPick/extSymptomPick/hydrantSymptomPick/shutterSymptomPick) 의 state·setter·옵션·memo 분기는 한 줄도 변경 금지.)"
    - "두 모달의 비즈니스 로직 100% 보존 — props 시그니처 / state 변수명 / useEffect reset 로직 / useMemo 도출(zoneCPs/availableFloors/floorCPs, stairNums/equipCPs/stairCPs/yscpId) / 핸들러(handleSave / handleStairSave / handleSingleSave) / useInspectionRevisitPopup 호출 시그니처 / onClose+onSave+initialCpId 시그니처 / KST timestamp / locationNo 처리 / 사진 업로드(usePhotoUpload + photo.upload + PhotoButton) 한 줄도 변경 금지. 단, 댐퍼 증상 피커 신설은 신규 state `damperSymptomPick`/`setDamperSymptomPick` 와 finalMemo 분기 추가(기능 추가) 만 허용."
    - "9 / 10 / 11px 폰트 사이즈 사용이 0건 (BaeyeonModal + DamperModal 영역 한정) — 모두 `text-caption(12px)` 이상 (Tailwind text-caption/label/body-sm/body/title 또는 12+ arbitrary value). 시안 spec 그대로 적용."
    - "두 모달 영역의 인라인 style={{...}} 의 금지 키 사용이 0건 — color / background / border / padding / margin / fontSize / fontWeight / borderRadius / display / flex* / gap. 화이트리스트 허용:  (a) transform/transition 의 enter 애니메이션(라인 754, 2619), (b) position:fixed + top:var(--sat) + bottom:NAV_BOTTOM 의 모달 외곽 컨테이너 위치(레이아웃 var() 의존), (c) `border-[1.5px]` arbitrary value, (d) `bg-[rgba(59,130,246,0.12)]` arbitrary value, (e) 그라디언트 CTA (§6.4 — Wave 1 i4r 와 동일 화이트리스트, linear-gradient(135deg,#1d4ed8,#0ea5e9))."
    - "Tailwind v0.1.1 토큰만 사용 — 옛 토큰(`var(--bg)`/`var(--bg2)`/`var(--bd)`/`var(--bd2)`/`var(--acl)`/`var(--t1)`/`var(--t2)`/`var(--t3)`/`var(--safe)`/`var(--warn)`/`var(--danger)`/`var(--fire)`) 사용이 0건 (두 모달 영역 한정. 라인 653~879 + 라인 2420~2871). 매핑: bg→surface-page, bg2→surface-raised, bg3→surface-sunken, bg4→surface-active, bd→border-default, bd2→border-strong, acl→accent, t1→text-text-primary, t2→text-text-secondary, t3→text-text-tertiary, safe/warn/danger/fire→status-safe/warning/danger/fire."
    - "결과 picker 디자인 일관성(§7.1) — 두 모달의 모든 결과 입력 UI(BaeyeonModal 의 단일 결과 / DamperModal 의 stair `.result-mini` + equip+yscp `.result-picker`) 는 모두 pill(rounded-pill) + lucide outline 아이콘(CheckCircle2 / AlertTriangle / XCircle) + status 색 outline + tinted bg 패턴으로 통일. INSPECT_RESULT_OPTIONS 의 `icon` 필드(✅⚠️❌) 이모지 사용 0건 — 시안 spec 권위."
    - "TypeScript 컴파일 에러 0개, npm run build 통과 — cbc7119 디자인 격리 리포 한정(원본 cha-bio-safety PWA 영향 0). 운영 PWA 푸시 / 점검 / 자료 0 영향."
    - "라이트/다크 두 테마 모두 정상 렌더 — tokens.css 의 모드별 정의(--surface-raised / --text-secondary / --accent / --border-default / --status-safe-bar / --status-warning-bar / --status-danger-bar / --status-fire-bar 등) 자동 분기. 시안 4 viewport(Dark/Light × 2 모달 = 4) 모두 일치."
  artifacts:
    - path: "cha-bio-safety/src/pages/InspectionPage.tsx"
      provides: "Wave 4 변환 완료된 BaeyeonModal + DamperModal + 댐퍼 증상 피커 신설 + dead code 청소(InspectionModal 의 도달 불가 댐퍼 피커 + damperSymptomPick state 제거). 비즈니스 로직 100% 보존(BaeyeonModal/DamperModal 본체). Wave 3 (Stairwell/Cctv) + Wave 5~ (DivModal/CompressorModal/PowerPanelModal/ParkingGateModal) 후속 트랙."
      min_lines: 5500
      contains: "BaeyeonModal, DamperModal, damperSymptomPick, '기판 조작 불량', '모터 기능 이상', INSPECT_RESULT_OPTIONS, CheckCircle2, AlertTriangle, XCircle, Square, Shield, Camera"
  key_links:
    - from: "InspectionPage.tsx BaeyeonModal + DamperModal"
      to: "tailwind.config.js (text-label/text-caption/text-body-sm/bg-surface-(raised|page)/text-text-(primary|secondary|tertiary|on-accent)/border-border-(default|strong)/bg-accent/text-(safe|warning|danger|fire)/bg-(safe|warning|danger|fire)-bg/border-(safe|warning|danger|fire)/rounded-(sm|md|pill))"
      via: "Tailwind utility 클래스"
      pattern: "text-(caption|label|body-sm)|bg-surface-(page|raised|sunken|active)|text-text-(primary|secondary|tertiary|on-accent)|border-border-(default|strong)|bg-accent|text-(safe|warning|danger|fire)|bg-(safe|warning|danger|fire)-bg|border-(safe|warning|danger|fire)|rounded-(sm|md|pill)"
    - from: "InspectionPage.tsx BaeyeonModal + DamperModal 헤더 + 결과 picker"
      to: "lucide-react (Square / Shield / CheckCircle2 / AlertTriangle / XCircle / Camera) + src/components/PhotoButton.tsx"
      via: "import 추가 (Wave 1 에서 이미 import 된 lucide 심볼 재사용 가능 — Square 만 신규 가능성 있음)"
      pattern: "import.*from\\s+['\"]lucide-react['\"]"
    - from: "InspectionPage.tsx DamperModal handleSingleSave"
      to: "댐퍼 증상 피커 memo 분기 (sp7 Wave 2 패턴 1:1)"
      via: "onSave 호출 시 finalMemo = damperSymptomPick === '직접 입력' ? memo.trim() : damperSymptomPick (단, item==='전실제연댐퍼' 의 equip 모드 + item==='연결송수관' 단일 폼 모드 + result !== 'normal' 일 때만 적용)"
      pattern: "damperSymptomPick === '직접 입력'.*memo\\.trim\\(\\)"
    - from: "InspectionPage.tsx InspectionModal (라인 2874~)"
      to: "도달 불가 dead branch 제거 — damperSymptomPick 사용처 0건화"
      via: "라인 2912 useState 정의 / 라인 3313~3314 finalMemo 분기 / 라인 3661~3681 JSX 블록 / 라인 3691 memo 라벨 OR 절 모두 제거"
      pattern: "damperSymptomPick|setDamperSymptomPick"
---

<objective>
InspectionPage TSX 변환 **Wave 4** — Wave 1(`260514-i4r`) / Wave 1 fix(`260514-pnr`) / Wave 2(`260514-sp7`) 이후 남은 **5 특수 모달 본문** 중 **BaeyeonModal(배연창)** 과 **DamperModal(전실제연댐퍼/연결송수관)** 두 모달을 4차 시안(`inspection-sketch-baeyeon-damper.html`, Rev 2) 단일 진실 소스 기준으로 v0.1.1 디자인 토큰 + Tailwind only 로 교체한다. 동시에 DamperModal 내부에 **댐퍼 증상 피커 신설**(Wave 2 sp7 패턴 1:1 일관) — 기능 추가 — 과 **dead code 청소**(InspectionModal 의 도달 불가 댐퍼 피커 + `damperSymptomPick` state 제거) 를 함께 수행한다.

**Purpose:**
- 디자인 시스템 v0.1.1 (§6.3 카테고리 아이콘 회색 통일 / §6.4 그라디언트 1종 / §7.1 결과 입력 일관성 / §7.3 result picker pill + lucide outline) 을 BaeyeonModal / DamperModal 에 적용
- Wave 2 sp7 의 5 증상 피커 패턴(`flex flex-wrap gap-1.5` + `flex-1 basis-0 min-w-0 px-2 py-2` + active=accent+tinted bg) 을 DamperModal 내부에 1:1 일관 적용 — **점검 자동화 5종 카테고리(유도등/소화기/소화전/방화셔터/전실제연댐퍼)** 메모리 룰 완성(현재 전실제연댐퍼는 InspectionModal 의 도달 불가 분기에만 있어 사실상 무효)
- dead code 청소 — DamperModal 로 항상 라우팅되는 카테고리의 InspectionModal 분기 21줄 + 관련 state·finalMemo 분기 제거 (코드 위생)
- Wave 5~ (DivModal / CompressorModal / PowerPanelModal / ParkingGateModal — 별도 sketch 트랙) 의 fixed reference point 확보

**Output:**
- 비즈니스 로직 100% 보존하면서 두 모달의 마크업/스타일이 시안과 1:1 매칭된 새 `InspectionPage.tsx`
- DamperModal 내부 댐퍼 증상 피커 신설 (Wave 2 패턴 1:1) — equip 모드 + 연결송수관 단일 폼 모드 양쪽에서 `result !== 'normal'` 시 표시. stair 모드(층별 일괄)는 표시 안 함.
- InspectionModal 의 도달 불가 dead code 4 곳 제거: (a) 라인 2912 `damperSymptomPick` useState, (b) 라인 3313~3314 finalMemo 분기, (c) 라인 3661~3681 JSX 블록, (d) 라인 3691 memo 라벨 OR 절

**Out of scope (다음 트랙):**
- StairwellModal / CctvModal (Wave 3, 4차 시안 `inspection-sketch-stairwell-cctv.html` 별도)
- DivModal / CompressorModal (Wave 5~, 시안 `inspection-sketch-div-comp-cycle.html` 별도)
- PowerPanelModal / ParkingGateModal (Wave 6~, 시안 `inspection-sketch-misc-modals.html` 별도)
- InspectionModal 나머지 본체(symptomPick/extSymptomPick/hydrantSymptomPick/shutterSymptomPick state·setter·옵션·memo 분기) — Wave 2 sp7 에서 이미 변환됨, 한 줄도 손대지 않음. **단** `damperSymptomPick` 만 dead code 라 제거.
- InspectionPage 메인 page render + DesktopInspectionView + InspectionModal 셸 — Wave 1 에서 이미 완료
- 공통 UI 컴포넌트 (PhotoButton / InspectionRevisitPopup / AccessBlockedPopup / DutyChip 등) 수정 금지
- API / hooks / utils / 외부 컴포넌트 수정 금지
- 다른 페이지 (.tsx) 수정 금지
- 운영 PWA(cha-bio-safety origin) 푸시·점검·자료 기능 영향 — cbc7119 디자인 격리 리포 한정 작업 (CLAUDE.md / 메모리 룰)

**Out of scope (디자인 spec):**
- BaeyeonModal / DamperModal 의 비즈니스 흐름(zone/floor/위치/계단전실/장비/연결송수관/yscpId 분기, useEffect reset 캐스케이드, useInspectionRevisitPopup 시그니처, handleStairSave 의 photoKey 1건 대표 부여 로직(`260505-cib` 메모리)) — 한 줄도 변경 금지. 디자인 변환과 댐퍼 증상 피커 신설만 허용.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md
@.planning/STATE.md

# Wave 1 본체 (변환 패턴 + 인라인 화이트리스트 + must_haves 형식 단일 진실 소스)
@.planning/quick/260514-i4r-redesign-02-inspection-tsx/260514-i4r-PLAN.md

# Wave 1 fix (외부 컴포넌트 3종 v0.1.1 화 — 토큰 매핑 표 재사용)
@.planning/quick/260514-pnr-wave-1-fix-photobutton-revisitpopup-acce/260514-pnr-PLAN.md

# Wave 2 (5 증상 피커 변환 — 댐퍼 증상 피커 신설 spec 권위)
@.planning/quick/260514-sp7-redesign-02-inspection-tsx-wave-2-5/260514-sp7-PLAN.md
@.planning/quick/260514-sp7-redesign-02-inspection-tsx-wave-2-5/260514-sp7-SUMMARY.md

# 디자인 시스템 v0.1.1 — §6.3 카테고리 아이콘 / §6.4 그라디언트 / §7.1 일관성 / §7.3 result picker
@cha-bio-safety/docs/design-system.md

# 4차 시안 HTML — Wave 4 의 마크업/색/구조 단일 진실 소스
@cha-bio-safety/docs/redesign-context/02-inspection/sketch/inspection-sketch-baeyeon-damper.html

# 5차 시안 HTML — 댐퍼 증상 피커 신설의 .symptom-picker 클래스 단일 진실 소스(라인 169~192)
@cha-bio-safety/docs/redesign-context/02-inspection/sketch/inspection-sketch-symptom-pickers.html

# audit
@cha-bio-safety/docs/redesign-context/02-inspection/sketch/inspection-audit-design-system.html

# 변환 대상 — 5582줄. BaeyeonModal: 라인 653~879. DamperModal: 라인 2420~2871. InspectionModal dead code: 라인 2912 / 3313~3314 / 3661~3681 / 3691
@cha-bio-safety/src/pages/InspectionPage.tsx

# 토큰 / Tailwind 카탈로그
@cha-bio-safety/src/styles/tokens.css
@cha-bio-safety/tailwind.config.js
</context>

<interfaces>
<!-- 이 변환이 의존하는 두 모달의 props/state/handler 시그니처. **변경 금지 marker** 가 붙은 항목은 한 줄도 손대면 안 됨. -->
<!-- 댐퍼 증상 피커 신설은 **신규 state + 신규 분기** — Wave 2 sp7 패턴 1:1 일관. -->

# ============================================================================
# 1. BaeyeonModal — props/state/handler (모두 변경 금지)
# ============================================================================

# Props (라인 653~661) — 변경 금지
{
  group:          typeof CATEGORY_GROUPS[0]
  allCheckpoints: CheckPoint[]
  records:        Record<string, CheckResult>
  monthRecords:   Record<string, MonthRecordEntry>
  scheduleItems:  ScheduleItem[]
  onClose:        () => void
  onSave:         (cpId: string, result: CheckResult, memo: string, photoKey?: string) => Promise<void>
}

# State (라인 662~672) — 변경 금지
const photo = usePhotoUpload()
const navigate = useNavigate()
const [zone,        setZone]        = useState<BYZone | null>(null)
const [selFloor,    setSelFloor]    = useState<Floor | null>(null)
const [selectedId,  setSelectedId]  = useState<string | null>(null)
const [result,      setResult]      = useState<CheckResult>('normal')
const [memo,        setMemo]        = useState('')
const [submitting,  setSubmitting]  = useState(false)
const [justSaved,   setJustSaved]   = useState(false)
const [submitError, setSubmitError] = useState<string | null>(null)
const [visible,     setVisible]     = useState(false)

# Derived (라인 676~690) — 변경 금지
zoneCPs, availableFloors, floorCPs, selectedCP

# useEffect reset 캐스케이드 (라인 692~718) — 변경 금지
prevFloor, prevZone, prevId (모두 useEffect 그대로)

# useInspectionRevisitPopup 호출 (라인 721~726) — 변경 금지
{ popupState, dismiss } = useInspectionRevisitPopup({
  checkpointId: selectedCP?.id ?? null,
  category:     '배연창',
  monthRecords,
  scheduleItems,
})

# handleSave (라인 728~740) — 변경 금지

# tabStyle / getPositionLabel (라인 742~751) — 디자인 함수.
# **디자인 변환 시 제거** — Tailwind 클래스로 교체. 단, 함수 시그니처가 외부로 노출되지 않으므로 안전.

# ============================================================================
# 2. DamperModal — props/state/handler (변경 금지 + 댐퍼 증상 피커 신규 추가)
# ============================================================================

# Props (라인 2420~2429) — 변경 금지
{
  group:          typeof CATEGORY_GROUPS[0]
  allCheckpoints: CheckPoint[]
  records:        Record<string, CheckResult>
  monthRecords:   Record<string, MonthRecordEntry>
  scheduleItems:  ScheduleItem[]
  onClose:        () => void
  onSave:         (cpId: string, result: CheckResult, memo: string, photoKey?: string) => Promise<void>
  initialCpId?:   string
}

# State (라인 2430~2452) — 변경 금지
const photo = usePhotoUpload()
const navigate = useNavigate()
const initCp = initialCpId ? allCheckpoints.find(cp => cp.id === initialCpId) : null
const initItem = ...
const initStair = ...
const initSubItem = ...
const [item,        setItem]        = useState<'전실제연댐퍼'|'연결송수관'|null>(initItem)
const [subItem,     setSubItem]     = useState<string|null>(initSubItem)
const [result,      setResult]      = useState<CheckResult>('normal')
const [selectedStair, setSelectedStair] = useState<string|null>(initStair)
const [selectedEquip, setSelectedEquip] = useState<string|null>(...)
const [floorResults,  setFloorResults]  = useState<Record<string, CheckResult>>({})
const [memo,        setMemo]        = useState('')
const [submitting,  setSubmitting]  = useState(false)
const [justSaved,   setJustSaved]   = useState(false)
const [submitError, setSubmitError] = useState<string|null>(null)
const [visible,     setVisible]     = useState(false)

# **신규 state (Wave 2 패턴 1:1)** — DamperModal 안에 추가
const [damperSymptomPick, setDamperSymptomPick] = useState<string>('기판 조작 불량')

# useEffect reset 캐스케이드 (라인 2456~2526) — 변경 금지
# **신규 reset** — item / subItem / selectedStair / selectedEquip 가 바뀌면
# damperSymptomPick 도 '기판 조작 불량' 으로 초기화 권장 (Wave 2 sp7 패턴과 일관 — symptomPick 류는 모달 단일 인스턴스라 reset 없이도 작동하지만, DamperModal 은 item 토글로 폼 바뀌므로 추가하는 게 안전)
# 구현 예: handleSingleSave 직전 reset, 또는 prevItem useEffect 안에 setDamperSymptomPick('기판 조작 불량') 추가

# Derived (라인 2477~2544) — 변경 금지
stairNums, equipCPs, stairCPs, JD_FLOOR_LABEL, yscpId, revisitCpId

# useInspectionRevisitPopup 호출 (라인 2545~2550) — 변경 금지

# handleStairSave (라인 2553~2577) — 변경 금지
# **주의:** `260505-cib` 메모리 — photoKey 1건 대표 부여(caution/bad 우선 → 첫 cp) 로직 한 줄도 변경 금지

# handleSingleSave (라인 2580~2593) — **댐퍼 증상 피커 신설로 인한 memo 분기 추가**
# 기존:
const handleSingleSave = async () => {
  const cpId = item === '연결송수관' ? yscpId : selectedEquip
  if (!cpId) return
  setSubmitting(true); setSubmitError(null)
  try {
    const photoKey = await photo.upload()
    await onSave(cpId, result, memo, photoKey ?? undefined)   // ← memo 그대로
    setJustSaved(true); setMemo(''); photo.reset()
  } catch (e: any) { ... } finally { setSubmitting(false) }
}
# 신규 (Wave 2 패턴 그대로):
const handleSingleSave = async () => {
  const cpId = item === '연결송수관' ? yscpId : selectedEquip
  if (!cpId) return
  setSubmitting(true); setSubmitError(null)
  try {
    const photoKey = await photo.upload()
    // 댐퍼 증상 피커 (item==='전실제연댐퍼' equip 모드 + item==='연결송수관' 단일 폼 모드 양쪽에서 result !== 'normal' 일 때만 적용)
    const finalMemo = result !== 'normal'
      ? (damperSymptomPick === '직접 입력' ? memo.trim() : damperSymptomPick)
      : memo
    await onSave(cpId, result, finalMemo, photoKey ?? undefined)
    setJustSaved(true); setMemo(''); photo.reset()
  } catch (e: any) { ... } finally { setSubmitting(false) }
}
# **주의:** stair 모드는 handleStairSave 가 처리 → 층별 일괄 입력이라 증상 피커 표시 안 함 (메모 1건만 받음). handleStairSave 는 손대지 않음.

# canSave (라인 2595~2597) — 변경 금지
# btnStyle / resultBtnStyle (라인 2599~2613) — 디자인 함수. **디자인 변환 시 제거** — Tailwind 클래스로 교체. 함수 시그니처 외부 노출 없음 → 안전.

# jdMode (라인 2616) — 변경 금지

# ============================================================================
# 3. InspectionModal dead code 제거 (도달 불가 분기)
# ============================================================================

# (a) 라인 2912 — useState 정의 제거
const [damperSymptomPick, setDamperSymptomPick] = useState<string>('기판 조작 불량')
# → 제거 (InspectionModal 안에서 더 이상 참조 없음)

# (b) 라인 3313~3314 — finalMemo 분기 제거
} else if (selectedCP?.category === '전실제연댐퍼' && result !== 'normal') {
  finalMemo = damperSymptomPick === '직접 입력' ? memo.trim() : damperSymptomPick
}
# → 제거 (라우팅상 InspectionModal 은 전실제연댐퍼 받지 않음 — DamperModal 로 라우팅됨)

# (c) 라인 3661~3681 — JSX 블록 제거 (21줄)
{/* 전실제연댐퍼: 증상 피커 */}
{selectedCP?.category === '전실제연댐퍼' && result !== 'normal' && (
  <div className="mt-2.5">
    <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">증상</div>
    <div className="flex flex-wrap gap-1.5">
      {['기판 조작 불량','모터 기능 이상','직접 입력'].map(s => {
        const active = damperSymptomPick === s
        return (
          <button key={s} onClick={() => setDamperSymptomPick(s)}
            className={`flex-1 basis-0 min-w-0 px-2 py-2 rounded-md cursor-pointer text-label font-semibold text-center leading-tight transition-colors ${
              active
                ? 'border-[1.5px] border-accent bg-[rgba(59,130,246,0.12)] text-accent'
                : 'border-[1.5px] border-border-default bg-surface-raised text-text-secondary'
            }`}>
            {s}
          </button>
        )
      })}
    </div>
  </div>
)}

# (d) 라인 3691 — memo 라벨 OR 절 제거
{(isGuideLight && result !== 'normal' && (selectedCP as any).locationNo !== 'audience_passage' && symptomPick === '직접 입력')
  || (isExtinguisher && result !== 'normal' && extSymptomPick === '직접 입력')
  || (selectedCP?.category === '소화전' && result !== 'normal' && hydrantSymptomPick === '직접 입력')
  || (selectedCP?.category === '방화셔터' && result !== 'normal' && shutterSymptomPick === '직접 입력')
  || (selectedCP?.category === '전실제연댐퍼' && result !== 'normal' && damperSymptomPick === '직접 입력')   ← 이 한 줄 제거
  ? '증상 상세 및 특이사항 (선택)' : '특이사항 (선택)'}

# ============================================================================
# 4. 시안 권위 spec — 4차 시안 (inspection-sketch-baeyeon-damper.html)
# ============================================================================

# 헤더 (.mh)
- padding: 12px 16px
- background: var(--bg)  → bg-surface-page
- border-bottom: 1px solid var(--bd)  → border-b border-border-default
- flex items-center gap-2 (8px)
- mh-icon: 18px lucide stroke, color t2 (text-text-secondary)
- mh-title: 16px font-bold (font-semibold OK) text-text-primary
- mh-sub: 12px text-text-tertiary ml-1

# Bar section (.bar-section) — 항목/계단전실/위치 선택 wrapper
- padding: 8px 14px
- background: var(--bg2)  → bg-surface-raised
- border-b border-border-default
- flex-shrink-0

# Bar label (.bar-label)
- text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider (Wave 1/2 와 동일 클래스)

# Segmented (.seg) — flex gap-2 flex-wrap. button: flex-1 basis-0 min-w-0, px-2 py-[9px] (또는 py-2), rounded-[9px] (또는 rounded-sm), border border-border-strong, bg-surface-page, text-text-secondary, text-label font-bold, whitespace-nowrap.
- is-active: border-[1.5px] border-accent bg-accent text-text-on-accent
- is-done: border-[1.5px] border-safe bg-safe-bg text-safe (옵션 — checkmark 표시용)
- done-mark span: text-caption ml-1 opacity-80

# Result picker (.result-picker) — pill + lucide outline + status outline+tinted bg
- flex gap-2. button: flex-1 px-2 py-[9px] rounded-pill, border-[1.5px] border-border-default, bg-surface-raised, text-text-tertiary, text-body-sm font-bold, whitespace-nowrap, inline-flex items-center justify-center gap-1.5
- ic icon: 16x16, flex-shrink-0
- is-safe:    border-safe bg-safe-bg text-safe
- is-warning: border-warning bg-warning-bg text-warning
- is-danger:  border-danger bg-danger-bg text-danger

# Floor chip row (.floor-row + .floor-chip) — overflow-x auto, gap-[5px] (또는 gap-1)
- floor-chip: flex-shrink-0 px-3.5 py-1.5 rounded-sm border border-border-strong bg-surface-page text-text-secondary text-label font-bold whitespace-nowrap
- is-active: border-[1.5px] border-accent bg-accent text-text-on-accent
- done-mark: text-[9px] ml-0.5 opacity-75

# Modal body (.modal-body)
- flex-1 overflow-y-auto p-3.5 (14px) flex flex-col gap-3.5 relative

# Stair grid (.stair-grid) — grid-cols-2 gap-2
- .stair-col: flex flex-col gap-1.5
- .stair-tile: bg-surface-raised rounded-md (10px → rounded-[10px] 또는 rounded-md=12px 근사) px-[9px] pt-[9px] pb-[7px] border border-border-default
- .stair-tile.is-init: border-2 border-fire-bar  (현재 코드 #f97316 이므로 fire-bar = --status-fire-bar 와 동일)
- .floor-lbl: text-caption font-bold text-text-secondary mb-1.5
- .stair-tile.is-init .floor-lbl: text-fire-bar

# Result mini (.result-mini) — 미니 pill picker
- flex gap-1. button: flex-1 px-1 py-1.5 (5px 4px) rounded-pill text-caption font-bold border-[1.5px] border-border-default bg-surface-page text-text-tertiary whitespace-nowrap inline-flex items-center justify-center gap-[3px]
- ic: 12x12 flex-shrink-0
- is-safe / is-warning / is-danger: 위 result-picker 와 동일 패턴(축소판)

# Memo + Photo row (.memo-row)
- flex gap-2 items-start
- .memo-area: flex-1 h-[72px] px-3 py-2.5 rounded-md bg-surface-raised border border-border-default text-text-primary text-label resize-none font-sans outline-none box-border
- placeholder: text-text-tertiary
- .photo-btn (PhotoButton — 시안 spec): 72x72 rounded-md border border-border-default bg-surface-raised text-text-secondary text-caption font-semibold flex flex-col items-center justify-center gap-1 flex-shrink-0
  - photo-icon (Camera lucide): 22x22 text-text-secondary
- **현재 코드의 PhotoButton 컴포넌트는 그대로 사용** — `260514-pnr` 에서 lucide Camera + v0.1.1 토큰화 완료. 이번 변환에서 PhotoButton 자체는 건드리지 않음. 호출부만 변환.

# Alert success (.alert-success) — stair 모드의 "N/M층 이미 점검 완료" 배지
- bg-safe-bg border border-safe-border rounded-sm px-3 py-[9px] text-label text-safe flex items-center gap-1.5

# Footer bar (.footer-bar)
- px-3.5 pt-2.5 pb-3 bg-surface-raised border-t border-border-default flex-shrink-0 flex gap-2
- .btn-close-mini: px-[18px] py-3 rounded-md bg-surface-page border border-border-strong text-text-secondary text-label font-semibold
- .btn-save: flex-1 py-[13px] rounded-md border-none, bg-gradient-(§6.4 그라디언트 — 인라인 style 허용 화이트리스트), text-white text-body-sm font-bold, shadow.
  - linear-gradient(135deg, #1d4ed8, #0ea5e9) dark / linear-gradient(135deg, #1f6feb, #0369a1) light
  - **현재 코드와 동일** (라인 872, 2864) — 그대로 유지

# ============================================================================
# 5. 댐퍼 증상 피커 신설 spec (Wave 2 sp7 패턴 1:1)
# ============================================================================

# 표시 조건:
- (item === '전실제연댐퍼' && jdMode === 'equip' && selectedEquip && result !== 'normal')
- OR (item === '연결송수관' && subItem && result !== 'normal')
- stair 모드는 표시 안 함 (층별 일괄 — 메모 1건만)

# 위치:
- equip 모드: 결과 picker 와 메모 사이 (라인 2797 closing div 직후, 2799 메모 섹션 직전)
- 연결송수관 모드: 결과 picker 와 메모 사이 (라인 2839 closing div 직후, 2840 메모 섹션 직전)
- → 두 곳 모두 동일한 JSX 블록을 인라인 삽입 권장 (또는 helper 변수로 한 번 정의 후 두 곳에서 참조 — 가독성)

# 마크업 (Wave 2 sp7 변환 완료된 패턴 그대로):
{result !== 'normal' && (
  <div className="mt-2.5">
    <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">증상</div>
    <div className="flex flex-wrap gap-1.5">
      {['기판 조작 불량','모터 기능 이상','직접 입력'].map(s => {
        const active = damperSymptomPick === s
        return (
          <button key={s} onClick={() => setDamperSymptomPick(s)}
            className={`flex-1 basis-0 min-w-0 px-2 py-2 rounded-md cursor-pointer text-label font-semibold text-center leading-tight transition-colors ${
              active
                ? 'border-[1.5px] border-accent bg-[rgba(59,130,246,0.12)] text-accent'
                : 'border-[1.5px] border-border-default bg-surface-raised text-text-secondary'
            }`}>
            {s}
          </button>
        )
      })}
    </div>
  </div>
)}

# 메모 라벨 분기 (Wave 2 sp7 의 패턴과 동일 — DamperModal 안의 두 메모 섹션 모두 적용):
<label className="text-caption font-semibold text-text-tertiary tracking-wider">
  {result !== 'normal' && damperSymptomPick === '직접 입력' ? '증상 상세 및 특이사항 (선택)' : '특이사항 (선택)'}
</label>
# (현재는 모두 '특이사항 (선택)' 고정 — 변경 가벼움. equip+yscp 두 곳에 모두 적용)

# ============================================================================
# 6. 인라인 style 화이트리스트 (이번 변환 영역 한정 — 라인 653~879 + 2420~2871)
# ============================================================================

✅ 허용:
- 모달 외곽 컨테이너의 position/transform/transition 애니메이션
  style={{ position:'fixed', top:'var(--sat, 0px)', left:0, right:0, bottom:NAV_BOTTOM, zIndex:99, transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)' }}
  (background 은 className 으로 옮기지만 layout var()는 인라인 유지)
- `border-[1.5px]` Tailwind arbitrary value (Wave 2 패턴 그대로)
- `bg-[rgba(59,130,246,0.12)]` Tailwind arbitrary value (Wave 2 패턴 그대로)
- §6.4 그라디언트 CTA inline style (Wave 1 i4r 화이트리스트 — 라인 872, 2864 그대로 유지):
  style={{ background: submitting||photo.uploading||!canSave ? 'var(--bd2)' : 'linear-gradient(135deg,#1d4ed8,#0ea5e9)' }}
  → background 부분만 인라인. color/fontSize/fontWeight/border/padding/radius/flex 모두 Tailwind className 으로 전환.
  → 단, 'var(--bd2)' 는 v0.1.1 에서 'var(--border-strong)' 로 변경 권장(또는 className 으로 분기).

❌ 금지 (변환 후 0건):
- color/background(그라디언트 제외)/border/padding/margin/fontSize/fontWeight/borderRadius/display/flex*/gap 의 정적 인라인 값
- `var(--bg)`/`var(--bg2)`/`var(--bd)`/`var(--bd2)`/`var(--acl)`/`var(--t1)`/`var(--t2)`/`var(--t3)`/`var(--safe)`/`var(--warn)`/`var(--danger)`/`var(--fire)` 사용
- 9 / 10 / 11px 폰트 사이즈
- 이모지 ✅⚠️❌ (INSPECT_RESULT_OPTIONS.icon 사용 — lucide CheckCircle2 / AlertTriangle / XCircle 로 교체)
- 이모지 🛡️ (group.icon — lucide Shield 로 교체, BaeyeonModal 은 lucide Square)
</interfaces>

<conversion_strategy>
Wave 1 / Wave 2 패턴 그대로 (i4r/sp7 패턴) — 두 모달을 task 별로 분리:

1. **Task 1 (BaeyeonModal)**: 라인 653~879 의 ~227줄을 Read 1회 → Edit 다회(또는 단일 Read+Write 1회) 로 시안 spec 매칭. 디자인 변환만, 비즈니스 로직 100% 보존.

2. **Task 2 (DamperModal + 댐퍼 증상 피커 신설 + dead code 청소)**: 라인 2420~2871 의 ~452줄을 변환 + 댐퍼 증상 피커 신설(equip + 연결송수관 두 곳) + InspectionModal 의 dead code 4곳 제거.

3. **Task 3 (검증)**: grep gate + tsc + npm run build + diff stat 자기 검증.

**핵심 변환 룰:**
- INSPECT_RESULT_OPTIONS 의 `icon` 필드(✅⚠️❌) 는 **사용 안 함** — lucide CheckCircle2/AlertTriangle/XCircle 로 매핑 (Wave 1 i4r 변환 영역과 동일 패턴). INSPECT_RESULT_OPTIONS 자체 정의는 수정 금지 (전역 상수).
- 시안의 `is-active` segmented (단색 accent 배경 + text-on-accent) 는 BaeyeonModal/DamperModal 의 zone·floor·항목·계단전실·연결송수관 위치 segmented 에 적용. Wave 2 의 증상 피커 active(tinted bg + accent text) 와는 **다른 패턴** — 시안 권위.
- `is-done` segmented (safe outline + safe bg + safe text) 는 zone/항목 칩의 "모든 CP 완료" 표시(✓ 마크) 에 적용 가능. 현재 코드는 작은 ✓ span 만 표시 — done outline 전체 적용 여부는 시안 라인 498 참고: `<button class="is-done">연구동<span class="done-mark">✓</span></button>`. 시안 권위 따라 적용.
- DamperModal 의 stair 모드 `.result-mini` 는 pill + lucide outline 의 축소판 — `border-[1.5px]` + `bg-surface-page` + 12x12 lucide icon + text-caption.
- DamperModal 의 equip+yscp 모드 결과 picker 는 BaeyeonModal 과 동일한 `.result-picker` (pill + 16x16 lucide + text-body-sm).
- `is-init` 2px fire 보더(QR 진입 층) 는 그대로 유지 — `border-2 border-fire-bar` + floor-lbl `text-fire`.
</conversion_strategy>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: BaeyeonModal v0.1.1 토큰 + Tailwind 변환</name>
  <files>cha-bio-safety/src/pages/InspectionPage.tsx</files>
  <behavior>
변환 후 BaeyeonModal(라인 653~879 영역) 이 다음을 만족해야 한다:

- 4차 시안 라인 419~544(배연창 Dark/Light 2 viewport) 와 1:1 매칭:
  - 헤더: `flex items-center gap-2 px-4 py-3 bg-surface-page border-b border-border-default flex-shrink-0`, lucide `Square` 18x18 text-text-secondary, mh-title `text-body font-bold text-text-primary` ("배연창" — group.labels[0])
  - 구역 선택 / 층 선택 / 위치 선택 bar-section: `px-3.5 py-2 bg-surface-raised border-b border-border-default flex-shrink-0`
  - bar-label: `text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider`
  - segmented (zone, 위치): `flex gap-2 flex-wrap` + button `flex-1 basis-0 min-w-0 px-2 py-[9px] rounded-[9px] border border-border-strong bg-surface-page text-text-secondary text-label font-bold whitespace-nowrap transition-colors`, active `border-[1.5px] border-accent bg-accent text-text-on-accent`, is-done(`zCPs.every(records[cp.id])`) `border-[1.5px] border-safe bg-safe-bg text-safe` + checkmark span `text-caption ml-1 opacity-80`
  - floor chip: `flex-shrink-0 px-3.5 py-1.5 rounded-sm border border-border-strong bg-surface-page text-text-secondary text-label font-bold whitespace-nowrap transition-colors`, active `border-[1.5px] border-accent bg-accent text-text-on-accent`, done mark `text-[9px] ml-0.5 opacity-75`
  - floor row 컨테이너: `flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`
  - modal-body: `flex-1 overflow-y-auto p-3.5 flex flex-col gap-3 relative`
  - "구역 선택해 주세요" / "층 선택해 주세요" / "위치 선택해 주세요" empty placeholder: `flex-1 flex items-center justify-center text-text-tertiary text-label`
  - 결과 picker: `flex gap-2` + button `flex-1 px-2 py-[9px] rounded-pill border-[1.5px] border-border-default bg-surface-raised text-text-tertiary text-body-sm font-bold whitespace-nowrap inline-flex items-center justify-center gap-1.5 transition-colors`
    - active normal: `border-safe bg-safe-bg text-safe` + lucide CheckCircle2 16x16
    - active caution: `border-warning bg-warning-bg text-warning` + lucide AlertTriangle 16x16
    - active bad: `border-danger bg-danger-bg text-danger` + lucide XCircle 16x16
    - 이모지 ✅⚠️❌ 사용 0건 (INSPECT_RESULT_OPTIONS.icon 사용 안 함)
  - "이미 점검 완료" 배지: `bg-safe-bg border border-safe rounded-sm px-3 py-[9px] text-label text-safe flex items-center gap-1.5`
  - 메모 row: `flex gap-2 items-start`, textarea `flex-1 h-[72px] px-3 py-2.5 rounded-md bg-surface-raised border border-border-default text-text-primary text-label resize-none font-sans outline-none box-border placeholder:text-text-tertiary`
  - PhotoButton 호출은 그대로 — 컴포넌트 자체는 `260514-pnr` 에서 변환 완료
  - submitError / justSaved 배지: 각각 `bg-danger-bg border border-danger rounded-sm px-3 py-2 text-label text-danger` / `bg-safe-bg border border-safe rounded-sm px-3 py-2 text-label text-safe`
  - footer-bar: `flex gap-2 px-3.5 pt-2.5 pb-3 bg-surface-raised border-t border-border-default flex-shrink-0`
  - 닫기 버튼: `px-[18px] py-3 rounded-md bg-surface-page border border-border-strong text-text-secondary text-label font-semibold cursor-pointer`
  - 저장 CTA: `flex-1 py-[13px] rounded-md border-none text-white text-body-sm font-bold cursor-pointer transition-colors`, background inline §6.4 그라디언트(`linear-gradient(135deg,#1d4ed8,#0ea5e9)`) 또는 disabled `var(--border-strong)`. 라이트 테마는 tokens.css 의 background 자동 분기 — 단, 인라인 그라디언트는 라이트/다크 동일. (Wave 1 i4r 가 같은 패턴으로 처리 — 일관성).

- 비즈니스 로직 100% 보존 (Interfaces §1 참고):
  - props 시그니처 / state 변수명 / `usePhotoUpload` / `useNavigate` / `useInspectionRevisitPopup` 시그니처 한 줄도 변경 금지
  - useEffect reset 캐스케이드(prevFloor / prevZone / prevId) 한 줄도 변경 금지
  - handleSave 함수 본문 한 줄도 변경 금지
  - `tabStyle` / `getPositionLabel` helper 는 제거 가능 (className 으로 교체) — 단 `getPositionLabel` 의 로직(북측/동측 추출) 은 보존 (인라인 또는 helper 유지 모두 가능)
  - `INSPECT_RESULT_OPTIONS.map` 의 옵션 순회 그대로 — 단 `opt.icon`(이모지) 사용 안 하고 `opt.value` 분기로 lucide icon 매핑

- 인라인 style 금지 키 0건 (라인 653~879 한정 — 화이트리스트 제외):
  - 외곽 모달 컨테이너 position/transform/transition 화이트리스트
  - 저장 CTA background 인라인 화이트리스트 (그라디언트)
  - 그 외 정적 색/배경/패딩/폰트/radius/flex/gap 모두 Tailwind className

- 옛 토큰(`var(--bg)`, `var(--bg2)`, `var(--bd)`, `var(--bd2)`, `var(--acl)`, `var(--t1)`, `var(--t2)`, `var(--t3)`, `var(--safe)`, `var(--danger)`) 사용 0건 (BaeyeonModal 한정)
- 9/10/11px 폰트 사이즈 0건 (BaeyeonModal 한정)
- 이모지 ✅⚠️❌ / 🪟 0건 (BaeyeonModal 한정 — group.icon 도 lucide 컴포넌트로 매핑)

- TypeScript 컴파일 에러 0개
- /inspection 라우트 진입 → CATEGORY_GROUPS[9](배연창) 카드 탭 → BaeyeonModal 노출 → zone "연구동" → floor 선택 → 결과 선택 → 라이트/다크 spot check (시각 검증은 Task 3 에서 일괄)
  </behavior>
  <action>
**Step 1.1 — Read 로 BaeyeonModal 전체 영역 확인 (이미 읽음, 재확인용):**

```
Read /Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/InspectionPage.tsx offset=650 limit=235
```

확인:
- 라인 653~661: props 시그니처 (변경 금지)
- 라인 662~672: state (변경 금지)
- 라인 692~718: useEffect reset 캐스케이드 (변경 금지)
- 라인 721~726: useInspectionRevisitPopup (변경 금지)
- 라인 728~740: handleSave (변경 금지)
- 라인 742~748: tabStyle helper (제거 후 Tailwind 인라인)
- 라인 750~751: getPositionLabel helper (보존 — 로직은 살리되 함수 그대로 유지 가능)
- 라인 753~878: 외곽 컨테이너 + JSX (전부 변환)

**Step 1.2 — lucide-react import 추가:**

파일 상단의 lucide import 라인을 grep 후 `Square` 가 누락이면 추가:

```bash
grep -n "^import.*lucide-react" /Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/InspectionPage.tsx | head -2
```

`Square` 가 import 목록에 없으면 Edit 로 한 글자 추가. (대부분 Wave 1 에서 이미 다수 lucide import 됨 — `CheckCircle2`/`AlertTriangle`/`XCircle`/`Shield`/`Camera` 는 이미 있을 가능성 높음. 누락된 것만 추가.)

**Step 1.3 — BaeyeonModal 본문 일괄 변환 (Edit 다회 또는 Read+Write 1회 — diff 최소화 위해 Edit 권장):**

변환 대상 (라인 753~878 = ~126줄):
- 외곽 컨테이너 (라인 754): position/transform/transition 화이트리스트 인라인 유지 + background var(--bg) → Tailwind `bg-surface-page`. display/flexDirection 도 className.
  
  변환 전:
  ```tsx
  <div style={{ position:'fixed', top:'var(--sat, 0px)', left:0, right:0, bottom:NAV_BOTTOM, zIndex:99, background:'var(--bg)', display:'flex', flexDirection:'column', transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)' }}>
  ```
  변환 후:
  ```tsx
  <div className="fixed left-0 right-0 z-[99] bg-surface-page flex flex-col" style={{ top:'var(--sat, 0px)', bottom:NAV_BOTTOM, transform: visible ? 'translateY(0)' : 'translateY(100%)', transition:'transform 0.26s cubic-bezier(0.32,0.72,0,1)' }}>
  ```

- 헤더 (라인 756~762): bg-surface-raised → 시안에서는 `.mh` 가 `var(--bg)` 사용 (라인 78). **시안 권위 따라 `bg-surface-page` 적용**. group.icon (🪟) → lucide `<Square className="w-[18px] h-[18px] text-text-secondary flex-shrink-0" />` (또는 group 별 icon 매핑이 Wave 1 에서 이미 정의되었으면 그 컴포넌트 사용 — 카테고리 그룹의 icon 필드는 CATEGORY_GROUPS[9].icon 즉 '🪟' 이지만 Wave 1 매핑 표에는 SmokeVentIcon 이 적힘. **단, BaeyeonModal 자체 헤더는 시안에서 lucide Square 사용 — 헤더 한정**. CATEGORY_GROUPS 의 icon 필드는 페이지 측 카드용이고, 모달 헤더는 자체 lucide.

  변환 전:
  ```tsx
  <div style={{ padding:'10px 16px', background:'var(--bg2)', borderBottom:'1px solid var(--bd)', flexShrink:0, display:'flex', alignItems:'center', gap:10 }}>
    <span style={{ fontSize:22, lineHeight:1 }}>{group.icon}</span>
    <div style={{ flex:1 }}>
      <div style={{ fontSize:16, fontWeight:700, color:'var(--t1)' }}>{group.labels[0]}</div>
    </div>
  </div>
  ```
  변환 후:
  ```tsx
  <div className="flex items-center gap-2 px-4 py-3 bg-surface-page border-b border-border-default flex-shrink-0">
    <Square className="w-[18px] h-[18px] text-text-secondary flex-shrink-0" />
    <div className="flex-1">
      <div className="text-body font-bold text-text-primary">{group.labels[0]}</div>
    </div>
  </div>
  ```

- 구역 선택 bar-section (라인 765~778): bar-section 토큰화 + zone 칩 segmented (active=accent bg, is-done=safe outline).
  
  변환 후:
  ```tsx
  <div className="px-3.5 py-2 bg-surface-raised border-b border-border-default flex-shrink-0">
    <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">구역 선택</div>
    <div className="flex gap-2">
      {(['research','office'] as BYZone[]).map(z => {
        const zCPs    = allCheckpoints.filter(cp => cp.category === '배연창' && cp.locationNo?.startsWith(BY_LOC_NO[z]))
        const allDone = zCPs.length > 0 && zCPs.every(cp => records[cp.id])
        const isSel   = zone === z
        return (
          <button key={z} onClick={() => setZone(z)}
            className={`flex-1 basis-0 min-w-0 px-2 py-[9px] rounded-[9px] text-label font-bold whitespace-nowrap cursor-pointer transition-colors ${
              isSel
                ? 'border-[1.5px] border-accent bg-accent text-text-on-accent'
                : allDone
                  ? 'border-[1.5px] border-safe bg-safe-bg text-safe'
                  : 'border border-border-strong bg-surface-page text-text-secondary'
            }`}>
            {BY_ZONE_LABELS[z]}{allDone && <span className="text-caption ml-1 opacity-80">✓</span>}
          </button>
        )
      })}
    </div>
  </div>
  ```

- 층 선택 (라인 781~797): floor chip row.
- 위치 선택 (라인 800~815): segmented (zone 과 동일 패턴).
- 폼 영역 (라인 818~864): result picker (pill + lucide) + 메모 row + photo + 배지.
  - 결과 picker — 이모지 → lucide 매핑:
    ```tsx
    {INSPECT_RESULT_OPTIONS.map(opt => {
      const Icon = opt.value === 'normal' ? CheckCircle2 : opt.value === 'caution' ? AlertTriangle : XCircle
      const active = result === opt.value
      const stateCls = active
        ? opt.value === 'normal' ? 'border-safe bg-safe-bg text-safe'
          : opt.value === 'caution' ? 'border-warning bg-warning-bg text-warning'
          : 'border-danger bg-danger-bg text-danger'
        : 'border-border-default bg-surface-raised text-text-tertiary'
      return (
        <button key={opt.value} onClick={() => setResult(opt.value)}
          className={`flex-1 px-2 py-[9px] rounded-pill border-[1.5px] text-body-sm font-bold whitespace-nowrap inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${stateCls}`}>
          <Icon className="w-4 h-4 flex-shrink-0" />
          {opt.label}
        </button>
      )
    })}
    ```

- 풋터 (라인 867~876): 닫기 + 저장 CTA.

**Step 1.4 — Grep gate (BaeyeonModal 영역 한정 자기 검증):**

```bash
cd /Users/jykevin/Documents/cbc7119-design

# 옛 토큰 사용 0건
sed -n '653,880p' cha-bio-safety/src/pages/InspectionPage.tsx | grep -cE "var\(--bg\)|var\(--bg2\)|var\(--bd\)|var\(--bd2\)|var\(--acl\)|var\(--t1\)|var\(--t2\)|var\(--t3\)|var\(--safe\)|var\(--danger\)"
# → 0 (단, NAV_BOTTOM 매크로 자체에는 var() 가 들어가지만 매크로명만 등장하므로 매치 안 됨)

# 9/10/11px 폰트 0건
sed -n '653,880p' cha-bio-safety/src/pages/InspectionPage.tsx | grep -cE "fontSize:(9|10|11)\b|font-size: ?(9|10|11)px|text-\[(9|10|11)px\]"
# → 0

# 이모지 ✅⚠️❌ 0건 (BaeyeonModal 한정)
sed -n '653,880p' cha-bio-safety/src/pages/InspectionPage.tsx | grep -cE "[✅⚠️❌]"
# → 0  (단, ✓ checkmark 는 zone is-done 표시용으로 유지 가능)

# 비즈니스 로직 보존 — handleSave / useInspectionRevisitPopup / 5 useEffect / state
grep -c "const { popupState, dismiss } = useInspectionRevisitPopup" cha-bio-safety/src/pages/InspectionPage.tsx
# → 7~8 (BaeyeonModal 1건 + 다른 모달들)
grep -c "category:.*'배연창'" cha-bio-safety/src/pages/InspectionPage.tsx
# → 1
```
  </action>
  <verify>
    <automated>
cd /Users/jykevin/Documents/cbc7119-design && \
echo "=== 1. BaeyeonModal 영역 옛 토큰 0건 ===" && \
[ "$(sed -n '653,880p' cha-bio-safety/src/pages/InspectionPage.tsx | grep -cE 'var\(--bg2?\)|var\(--bd2?\)|var\(--acl\)|var\(--t[123]\)|var\(--safe\)|var\(--danger\)')" = "0" ] && echo "PASS" || (echo "FAIL: legacy tokens still present"; exit 1) && \
echo "=== 2. BaeyeonModal 영역 9/10/11px 폰트 0건 ===" && \
[ "$(sed -n '653,880p' cha-bio-safety/src/pages/InspectionPage.tsx | grep -cE 'fontSize:(9|10|11)\b|text-\[(9|10|11)px\]')" = "0" ] && echo "PASS" || (echo "FAIL: small fonts still present"; exit 1) && \
echo "=== 3. BaeyeonModal 영역 결과 이모지 ✅⚠️❌ 0건 ===" && \
[ "$(sed -n '653,880p' cha-bio-safety/src/pages/InspectionPage.tsx | grep -cE '✅|⚠️|❌')" = "0" ] && echo "PASS" || (echo "FAIL: emoji icons still present"; exit 1) && \
echo "=== 4. BaeyeonModal 비즈니스 로직 보존 (5 핵심 시그니처) ===" && \
grep -q "category: *'배연창'" cha-bio-safety/src/pages/InspectionPage.tsx && \
grep -q "BY_LOC_NO\[z\]" cha-bio-safety/src/pages/InspectionPage.tsx && \
grep -q "getPositionLabel\|cp.location.includes('북측')" cha-bio-safety/src/pages/InspectionPage.tsx && \
grep -q "selectedCP.id, result, memo, photoKey" cha-bio-safety/src/pages/InspectionPage.tsx && \
echo "PASS" || (echo "FAIL: BaeyeonModal business logic missing"; exit 1) && \
echo "=== 5. TypeScript compile ===" && \
(cd cha-bio-safety && npx tsc --noEmit) && echo "PASS"
    </automated>
  </verify>
  <done>
- BaeyeonModal 마크업/스타일이 4차 시안 (라인 419~544) 과 1:1 매칭
- 비즈니스 로직 100% 보존 (props/state/useEffect/handleSave/useInspectionRevisitPopup)
- 옛 토큰 / 9·10·11px 폰트 / 결과 이모지 0건 (이 영역 한정)
- tsc 통과
- atomic commit: `feat(260514-tbj): Wave 4 task 1 — BaeyeonModal v0.1.1 + Tailwind 변환`
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: DamperModal 변환 + 댐퍼 증상 피커 신설 + InspectionModal dead code 청소</name>
  <files>cha-bio-safety/src/pages/InspectionPage.tsx</files>
  <behavior>
변환 후 DamperModal(라인 2420~2871 영역) 이 다음을 만족해야 한다:

- 4차 시안 라인 548~717 (제연댐퍼 Dark/Light 2 viewport) 와 1:1 매칭:
  - 헤더: lucide `Shield` 18x18 text-text-secondary, mh-title "전실제연댐퍼" + mh-sub "· 연결송수관" (group.labels[0] + labels[1])
  - 항목 선택 bar-section: segmented (전실제연댐퍼/연결송수관, 둘 다 완료 시 is-done)
  - 계단전실 선택 bar-section: segmented + flex-wrap (2/4/5 등 stairNums + 배기/급기팬 equipCPs 칩)
  - 연결송수관 위치 선택 bar-section: segmented (allCheckpoints 의 연결송수관 위치)
  - modal-body: `flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-2.5 relative`
  - alert-success ("N/M층 이미 점검 완료"): `bg-safe-bg border border-safe rounded-sm px-3 py-1.5 text-label text-safe flex items-center gap-1.5`
  - stair-grid 2열 layout: `grid grid-cols-2 gap-2` + `.stair-col flex flex-col gap-1.5`
  - stair-tile: `bg-surface-raised rounded-[10px] px-[9px] pt-[9px] pb-[7px] border border-border-default`
  - stair-tile.is-init (QR 진입 층): `border-2 border-fire-bar`
  - floor-lbl: `text-caption font-bold text-text-secondary mb-1.5` (is-init 시 `text-fire-bar`)
  - .result-mini (stair 모드): `flex gap-1` + button `flex-1 px-1 py-1.5 rounded-pill border-[1.5px] text-caption font-bold whitespace-nowrap inline-flex items-center justify-center gap-[3px] cursor-pointer transition-colors`, active normal/caution/bad = safe/warning/danger outline+bg+text, inactive `border-border-default bg-surface-page text-text-tertiary`, lucide icon 12x12
  - equip 모드 결과 picker = BaeyeonModal 결과 picker 와 동일 (pill + lucide 16x16 + body-sm)
  - 연결송수관 단일 폼 결과 picker = 동일
  - 메모 row (3곳: stair / equip / yscp): textarea `flex-1 h-[72px] px-3 py-2.5 rounded-md bg-surface-raised border border-border-default text-text-primary text-label resize-none font-sans outline-none box-border placeholder:text-text-tertiary`
  - 풋터 동적 라벨: stair 모드 → `계단전실 ${selectedStair} 점검 저장`, 그 외 → `점검 기록 저장` (현재 코드 그대로)

- **댐퍼 증상 피커 신설** (Wave 2 sp7 패턴 1:1):
  - 신규 state `damperSymptomPick` (DamperModal 내부) — 기본값 `'기판 조작 불량'`
  - **표시 조건:** equip 모드(item==='전실제연댐퍼' && selectedEquip && result !== 'normal') + 연결송수관 모드(item==='연결송수관' && subItem && result !== 'normal') — 두 곳 모두
  - **stair 모드는 표시 안 함** (층별 일괄 → 단일 메모만)
  - 위치: 결과 picker 와 메모 사이
  - 마크업: Interfaces §5 spec 그대로 (`flex flex-wrap gap-1.5` + 3 옵션 button + active accent tinted bg / inactive surface-raised text-secondary)
  - 옵션: `['기판 조작 불량','모터 기능 이상','직접 입력']`
  - 메모 라벨 분기: `result !== 'normal' && damperSymptomPick === '직접 입력' ? '증상 상세 및 특이사항 (선택)' : '특이사항 (선택)'` (equip + yscp 두 메모 섹션 모두 적용)
  - **memo 분기 (handleSingleSave 안):**
    ```ts
    const finalMemo = result !== 'normal'
      ? (damperSymptomPick === '직접 입력' ? memo.trim() : damperSymptomPick)
      : memo
    await onSave(cpId, result, finalMemo, photoKey ?? undefined)
    ```
  - handleStairSave 는 손대지 않음 — stair 모드는 증상 피커 없음
  - useEffect reset: item / subItem / selectedEquip 가 바뀌면 `setDamperSymptomPick('기판 조작 불량')` 호출 (Interfaces §2 참고 — 기존 reset 캐스케이드 안에 한 줄 추가)

- **InspectionModal dead code 4곳 제거:**
  - (a) 라인 2912 `const [damperSymptomPick, setDamperSymptomPick] = useState<string>('기판 조작 불량')` 제거 (InspectionModal 안. DamperModal 의 동일 useState 는 신규)
  - (b) 라인 3313~3314 `} else if (selectedCP?.category === '전실제연댐퍼' && result !== 'normal') { finalMemo = damperSymptomPick === ... }` 제거 (InspectionModal 안)
  - (c) 라인 3661~3681 `{selectedCP?.category === '전실제연댐퍼' && result !== 'normal' && (...) }` JSX 블록 제거 (InspectionModal 안)
  - (d) 라인 3691 `|| (selectedCP?.category === '전실제연댐퍼' && result !== 'normal' && damperSymptomPick === '직접 입력')` 한 줄 제거 (InspectionModal 메모 라벨 OR 절)

- 비즈니스 로직 100% 보존 (Interfaces §2 참고):
  - props/state/useEffect reset 캐스케이드/derived/handleStairSave/canSave 한 줄도 변경 금지
  - **단** handleSingleSave 의 onSave 직전에 finalMemo 분기 추가 (위 spec)
  - **단** useEffect reset 캐스케이드 안에 setDamperSymptomPick('기판 조작 불량') 추가 (위 spec)
  - **단** `260505-cib` 메모리 — handleStairSave 의 photoKey 1건 대표 부여 로직 한 줄도 변경 금지
  - useInspectionRevisitPopup 시그니처 그대로
  - INSPECT_RESULT_OPTIONS 정의 자체 수정 금지 (전역 상수)
  - INSPECT_RESULT_OPTIONS.icon (이모지) 사용 안 함 — lucide 매핑 (BaeyeonModal 과 동일 패턴)

- 인라인 style 금지 키 0건 (DamperModal 영역 + InspectionModal dead code 제거 영역 한정):
  - 외곽 모달 컨테이너 position/transform/transition 화이트리스트
  - 저장 CTA background 그라디언트 화이트리스트
  - `border-[1.5px]` / `bg-[rgba(59,130,246,0.12)]` arbitrary value 화이트리스트
  - 그 외 정적 색/배경/패딩/폰트/radius/flex/gap 모두 Tailwind className

- 옛 토큰 사용 0건 (DamperModal 한정)
- 9/10/11px 폰트 사이즈 0건 (DamperModal 한정)
- 이모지 ✅⚠️❌ / 🛡️ 0건 (DamperModal 한정)

- TypeScript 컴파일 에러 0개
- /inspection 라우트 진입 → CATEGORY_GROUPS[2] (전실제연댐퍼+연결송수관) 탭 → DamperModal 노출 → 4 시나리오 spot check (stair / equip / yscp / 증상 피커 active)
  </behavior>
  <action>
**Step 2.1 — InspectionModal dead code 4곳 제거 (먼저 수행 — DamperModal 변환 전 청소):**

`grep` 으로 InspectionModal 안의 damperSymptomPick 사용처 확인:
```bash
grep -n "damperSymptomPick\|setDamperSymptomPick" cha-bio-safety/src/pages/InspectionPage.tsx
# 예상: 2912, 3313, 3314, 3667, 3669, 3691
```

Edit 1 (라인 2912 useState 정의 제거):
```
old_string:
  const [shutterSymptomPick, setShutterSymptomPick] = useState<string>('방화셔터 라인 표시 필요')
  const [damperSymptomPick, setDamperSymptomPick] = useState<string>('기판 조작 불량')

new_string:
  const [shutterSymptomPick, setShutterSymptomPick] = useState<string>('방화셔터 라인 표시 필요')
```
(앞 라인 컨텍스트는 InspectionPage 라인 2911 — Read 후 정확 매칭)

Edit 2 (라인 3313~3314 finalMemo 분기 제거):
```
old_string:
      } else if (selectedCP?.category === '전실제연댐퍼' && result !== 'normal') {
        finalMemo = damperSymptomPick === '직접 입력' ? memo.trim() : damperSymptomPick
      }
new_string:
      }
```
(앞 분기는 방화셔터 — `else if (selectedCP?.category === '방화셔터' && result !== 'normal') { finalMemo = shutterSymptomPick === ... }`. 그 뒤의 댐퍼 분기를 제거. 단 정확 매칭 위해 Read 로 라인 3310~3320 확인 후 진행)

Edit 3 (라인 3661~3681 JSX 블록 제거):
```
old_string:
            {/* 전실제연댐퍼: 증상 피커 */}
            {selectedCP?.category === '전실제연댐퍼' && result !== 'normal' && (
              <div className="mt-2.5">
                <div className="text-caption font-semibold text-text-tertiary mb-1.5 tracking-wider">증상</div>
                <div className="flex flex-wrap gap-1.5">
                  {['기판 조작 불량','모터 기능 이상','직접 입력'].map(s => {
                    const active = damperSymptomPick === s
                    return (
                      <button key={s} onClick={() => setDamperSymptomPick(s)}
                        className={`flex-1 basis-0 min-w-0 px-2 py-2 rounded-md cursor-pointer text-label font-semibold text-center leading-tight transition-colors ${
                          active
                            ? 'border-[1.5px] border-accent bg-[rgba(59,130,246,0.12)] text-accent'
                            : 'border-[1.5px] border-border-default bg-surface-raised text-text-secondary'
                        }`}>
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

new_string:
(빈 문자열 — 21줄 모두 제거)
```

Edit 4 (라인 3691 memo 라벨 OR 절 제거):
```
old_string:
                    || (selectedCP?.category === '방화셔터' && result !== 'normal' && shutterSymptomPick === '직접 입력')
                    || (selectedCP?.category === '전실제연댐퍼' && result !== 'normal' && damperSymptomPick === '직접 입력')
                    ? '증상 상세 및 특이사항 (선택)' : '특이사항 (선택)'}

new_string:
                    || (selectedCP?.category === '방화셔터' && result !== 'normal' && shutterSymptomPick === '직접 입력')
                    ? '증상 상세 및 특이사항 (선택)' : '특이사항 (선택)'}
```

Verify dead code 제거 완료:
```bash
grep -c "damperSymptomPick\|setDamperSymptomPick" cha-bio-safety/src/pages/InspectionPage.tsx
# → 0 (이 시점에서 DamperModal 신규 추가 전이므로 0)
```

**Step 2.2 — DamperModal 본문 변환 (라인 2420~2871) — 시안 1:1 매핑:**

Wave 2 sp7 의 sub-stepping 패턴 그대로:

(a) 외곽 컨테이너 (라인 2619): BaeyeonModal 과 동일하게 `className="fixed left-0 right-0 z-[99] bg-surface-page flex flex-col"` + position/transform/transition 인라인 화이트리스트.

(b) 헤더 (라인 2621~2628): lucide `Shield` + mh-title + mh-sub
```tsx
<div className="flex items-center gap-2 px-4 py-3 bg-surface-page border-b border-border-default flex-shrink-0">
  <Shield className="w-[18px] h-[18px] text-text-secondary flex-shrink-0" />
  <div className="flex-1">
    <div className="text-body font-bold text-text-primary">{group.labels[0]}</div>
    {group.labels.length > 1 && <div className="text-caption text-text-tertiary mt-0.5">{group.labels.slice(1).join(' · ')}</div>}
  </div>
</div>
```

(c) 항목 선택 bar-section (라인 2630~2645): segmented (전실제연댐퍼/연결송수관, 각각 모두 점검 완료 시 done outline)

(d) 계단전실 선택 bar-section (라인 2647~2671): segmented + 장비 칩
- 계단전실 칩(`stairNums.map`): `btnStyle(selectedStair === num)` 인라인 helper 제거 → Tailwind 클래스 분기로 교체
- 장비 칩(`equipCPs.length > 0 && equipCPs.map`): 별도 스타일(라인 2664) → Tailwind 클래스 분기 (active=accent, done=safe outline, default)

(e) 연결송수관 위치 선택 (라인 2673~2689): segmented 패턴

(f) 폼 영역 (라인 2691~2856):
- "항목을 선택해 주세요" empty: Tailwind 클래스
- stair 모드 (`jdMode === 'stair'`, 라인 2712~2776):
  - alert-success 배지 (라인 2715~2719)
  - 2열 stair-grid + stair-tile + result-mini (라인 2722~2759) — 시안 spec 정확 적용
    - is-init 검출(QR 진입 층): `initCp && cp.floor === initCp.floor` 분기 그대로 → border 2px fire / floor-lbl text-fire
    - result-mini 옵션 매핑:
      ```tsx
      {INSPECT_RESULT_OPTIONS.map(opt => {
        const Icon = opt.value === 'normal' ? CheckCircle2 : opt.value === 'caution' ? AlertTriangle : XCircle
        const active = curResult === opt.value
        const stateCls = active
          ? opt.value === 'normal' ? 'border-safe bg-safe-bg text-safe'
            : opt.value === 'caution' ? 'border-warning bg-warning-bg text-warning'
            : 'border-danger bg-danger-bg text-danger'
          : 'border-border-default bg-surface-page text-text-tertiary'
        return (
          <button key={opt.value} onClick={() => setFloorResults(prev => ({ ...prev, [cp.id]: opt.value }))}
            className={`flex-1 px-1 py-1.5 rounded-pill border-[1.5px] text-caption font-bold whitespace-nowrap inline-flex items-center justify-center gap-[3px] cursor-pointer transition-colors ${stateCls}`}>
            <Icon className="w-3 h-3 flex-shrink-0" />
            {opt.label}
          </button>
        )
      })}
      ```
  - 메모 row (라인 2762~2771)
  - submitError / justSaved 배지 (라인 2773~2774)

- equip 모드 (`jdMode === 'equip' && selectedEquip`, 라인 2779~2813):
  - eqDone 배지
  - 결과 picker (BaeyeonModal 과 동일)
  - **댐퍼 증상 피커 신설** — 결과 picker 직후, 메모 row 직전 삽입
  - 메모 row (메모 라벨 분기 추가)
  - submitError / justSaved 배지

- "계단전실을 선택해 주세요" empty (라인 2816~2818)
- "위치를 선택해 주세요" empty (라인 2820~2823)

- 연결송수관 단일 폼 (`item === '연결송수관' && subItem`, 라인 2824~2853):
  - 이미 점검 완료 배지
  - 결과 picker
  - **댐퍼 증상 피커 신설** — 결과 picker 직후, 메모 row 직전 삽입 (equip 모드와 동일)
  - 메모 row (메모 라벨 분기 추가)
  - submitError / justSaved 배지

(g) 풋터 (라인 2858~2868): 닫기 + 저장 CTA (BaeyeonModal 과 동일)

**Step 2.3 — DamperModal 안에 신규 state + handleSingleSave 수정:**

useState 추가 (예: 라인 2452 직후, visible 다음):
```tsx
const [visible,     setVisible]     = useState(false)
const [damperSymptomPick, setDamperSymptomPick] = useState<string>('기판 조작 불량')   // ← 신규
```

useEffect reset 캐스케이드 안에 reset 추가:
- prevItem useEffect (라인 2456~2465) 안의 reset block 끝에 `setDamperSymptomPick('기판 조작 불량')` 한 줄 추가
- prevSub useEffect (라인 2468~2474) 안에 동일
- prevEquip useEffect (라인 2519~2526) 안에 동일

handleSingleSave (라인 2580~2593) 수정:
```tsx
const handleSingleSave = async () => {
  const cpId = item === '연결송수관' ? yscpId : selectedEquip
  if (!cpId) return
  setSubmitting(true); setSubmitError(null)
  try {
    const photoKey = await photo.upload()
    const finalMemo = result !== 'normal'
      ? (damperSymptomPick === '직접 입력' ? memo.trim() : damperSymptomPick)
      : memo
    await onSave(cpId, result, finalMemo, photoKey ?? undefined)
    setJustSaved(true); setMemo(''); photo.reset()
  } catch (e: any) {
    setSubmitError(e.message ?? '저장 오류')
  } finally {
    setSubmitting(false)
  }
}
```

**Step 2.4 — Grep gate (자기 검증):**

```bash
cd /Users/jykevin/Documents/cbc7119-design

# DamperModal 영역 옛 토큰 0건
sed -n '2420,2871p' cha-bio-safety/src/pages/InspectionPage.tsx | grep -cE "var\(--bg2?\)|var\(--bd2?\)|var\(--acl\)|var\(--t[123]\)|var\(--safe\)|var\(--warn\)|var\(--danger\)|var\(--fire\)"
# → 0 (단 NAV_BOTTOM 매크로명 자체에 var() 없으므로 매치 안 됨)

# DamperModal 영역 9/10/11px 폰트 0건
sed -n '2420,2871p' cha-bio-safety/src/pages/InspectionPage.tsx | grep -cE "fontSize:(9|10|11)\b|text-\[(9|10|11)px\]"
# → 0

# DamperModal 영역 이모지 0건 (결과 아이콘)
sed -n '2420,2871p' cha-bio-safety/src/pages/InspectionPage.tsx | grep -cE "✅|⚠️|❌|🛡️"
# → 0 (단 ✓ checkmark 는 유지)

# 댐퍼 증상 피커 신설 확인 — DamperModal 안에 정확 1개의 useState + 정확 2개의 JSX 표시 (equip + yscp 두 곳에 같은 블록 인라인)
grep -c "const \[damperSymptomPick" cha-bio-safety/src/pages/InspectionPage.tsx
# → 1 (DamperModal 안. InspectionModal 의 옛 useState 는 Step 2.1 에서 제거됨)

grep -c "setDamperSymptomPick" cha-bio-safety/src/pages/InspectionPage.tsx
# → ≥3 (state setter 정의 1 + JSX onClick 호출 2: equip 모드 + yscp 모드. 또는 4 — useEffect reset 3건 안에 reset 호출까지 포함)

grep -c "'기판 조작 불량'" cha-bio-safety/src/pages/InspectionPage.tsx
# → ≥3 (state 기본값 1 + JSX 옵션 배열 2: equip + yscp 각 1개)

grep -c "'모터 기능 이상'" cha-bio-safety/src/pages/InspectionPage.tsx
# → 2 (JSX 옵션 배열 2: equip + yscp)

# damperSymptomPick === '직접 입력' 분기 (memo 라벨 + finalMemo) — handleSingleSave 1 + 메모 라벨 2(equip+yscp)
grep -c "damperSymptomPick === '직접 입력'" cha-bio-safety/src/pages/InspectionPage.tsx
# → ≥3

# InspectionModal 안의 옛 dead code 0건
sed -n '2870,3700p' cha-bio-safety/src/pages/InspectionPage.tsx | grep -cE "damperSymptomPick|setDamperSymptomPick"
# → 0 (InspectionModal 시작 2874~ 안에서 dead code 모두 제거)
# 단 InspectionModal 끝나는 위치(라인 약 5100+)까지의 범위라 sed range 더 넓혀도 OK
# 안전하게:
awk '/^function InspectionModal/,/^function InspectionPage/' cha-bio-safety/src/pages/InspectionPage.tsx | grep -cE "damperSymptomPick|setDamperSymptomPick"
# → 0

# 비즈니스 로직 보존 — handleStairSave photoKey 1건 대표 부여 로직(260505-cib 메모리)
grep -c "stairCPs.find(cp => {" cha-bio-safety/src/pages/InspectionPage.tsx
# → ≥1 (handleStairSave 안에 보존)
grep -c "photoTargetCp" cha-bio-safety/src/pages/InspectionPage.tsx
# → ≥3 (find 결과 변수 + 사용처 2)

# DAMP modal 비즈니스 로직 — stairNums / equipCPs / yscpId / canSave / jdMode 그대로
grep -c "const stairNums = useMemo" cha-bio-safety/src/pages/InspectionPage.tsx
# → 1
grep -c "const equipCPs = useMemo" cha-bio-safety/src/pages/InspectionPage.tsx
# → 1
grep -c "const jdMode = " cha-bio-safety/src/pages/InspectionPage.tsx
# → 1
```
  </action>
  <verify>
    <automated>
cd /Users/jykevin/Documents/cbc7119-design && \
echo "=== 1. DamperModal 영역 옛 토큰 0건 ===" && \
[ "$(sed -n '2420,2871p' cha-bio-safety/src/pages/InspectionPage.tsx | grep -cE 'var\(--bg2?\)|var\(--bd2?\)|var\(--acl\)|var\(--t[123]\)|var\(--safe\)|var\(--warn\)|var\(--danger\)|var\(--fire\)')" = "0" ] && echo "PASS" || (echo "FAIL: legacy tokens still present"; exit 1) && \
echo "=== 2. DamperModal 영역 9/10/11px 폰트 0건 ===" && \
[ "$(sed -n '2420,2871p' cha-bio-safety/src/pages/InspectionPage.tsx | grep -cE 'fontSize:(9|10|11)\b|text-\[(9|10|11)px\]')" = "0" ] && echo "PASS" || (echo "FAIL: small fonts still present"; exit 1) && \
echo "=== 3. DamperModal 영역 결과 이모지 0건 ===" && \
[ "$(sed -n '2420,2871p' cha-bio-safety/src/pages/InspectionPage.tsx | grep -cE '✅|⚠️|❌|🛡️')" = "0" ] && echo "PASS" || (echo "FAIL: emoji icons still present"; exit 1) && \
echo "=== 4. 댐퍼 증상 피커 신설 — useState 1건 (DamperModal 안) ===" && \
[ "$(grep -c 'const \[damperSymptomPick' cha-bio-safety/src/pages/InspectionPage.tsx)" = "1" ] && echo "PASS" || (echo "FAIL: damperSymptomPick state count != 1"; exit 1) && \
echo "=== 5. 댐퍼 증상 피커 옵션 2 곳에 표시 (equip + yscp) ===" && \
[ "$(grep -c \"'모터 기능 이상'\" cha-bio-safety/src/pages/InspectionPage.tsx)" = "2" ] && echo "PASS" || (echo "FAIL: damper symptom option count != 2 (equip + yscp 표시 위치 누락)"; exit 1) && \
echo "=== 6. InspectionModal 안의 damperSymptomPick dead code 제거 확인 ===" && \
[ "$(awk '/^function InspectionModal/,/^function InspectionPage/' cha-bio-safety/src/pages/InspectionPage.tsx | grep -cE 'damperSymptomPick|setDamperSymptomPick')" = "0" ] && echo "PASS" || (echo "FAIL: damperSymptomPick still present in InspectionModal"; exit 1) && \
echo "=== 7. DamperModal 비즈니스 로직 보존 (handleStairSave photoKey 1건 대표 부여 — 260505-cib 메모리) ===" && \
grep -q "photoTargetCp" cha-bio-safety/src/pages/InspectionPage.tsx && \
grep -q "stairCPs.find(cp => {" cha-bio-safety/src/pages/InspectionPage.tsx && \
grep -q "const stairNums = useMemo" cha-bio-safety/src/pages/InspectionPage.tsx && \
grep -q "const equipCPs = useMemo" cha-bio-safety/src/pages/InspectionPage.tsx && \
grep -q "const jdMode = " cha-bio-safety/src/pages/InspectionPage.tsx && \
echo "PASS" || (echo "FAIL: DamperModal business logic missing"; exit 1) && \
echo "=== 8. TypeScript compile ===" && \
(cd cha-bio-safety && npx tsc --noEmit) && echo "PASS"
    </automated>
  </verify>
  <done>
- DamperModal 마크업/스타일이 4차 시안 (라인 548~717) 과 1:1 매칭 (stair / equip / yscp 3 모드 모두)
- DamperModal 내부에 댐퍼 증상 피커 신설 (Wave 2 sp7 패턴 1:1) — equip + yscp 모드 양쪽에서 result !== 'normal' 시 표시. handleSingleSave 의 memo 분기 연결.
- InspectionModal 의 dead code 4곳 제거 (useState / finalMemo 분기 / JSX 블록 / memo 라벨 OR 절)
- 비즈니스 로직 100% 보존 (stairNums/equipCPs/yscpId/jdMode/handleStairSave photoKey 1건 대표 부여 로직)
- 옛 토큰 / 9·10·11px / 결과 이모지 0건 (DamperModal 한정)
- tsc 통과
- atomic commit: `feat(260514-tbj): Wave 4 task 2 — DamperModal v0.1.1 + 댐퍼 증상 피커 신설 + dead code 청소`
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: 시각 검증 + 전체 grep verify + npm run build</name>
  <files>cha-bio-safety/src/pages/InspectionPage.tsx</files>
  <behavior>
- Task 1 + Task 2 변환 영역 전체에 대해 통합 검증:
  - BaeyeonModal + DamperModal 영역 옛 토큰 0건
  - BaeyeonModal + DamperModal 영역 9/10/11px 폰트 0건
  - BaeyeonModal + DamperModal 영역 결과 이모지 ✅⚠️❌ 0건
  - 댐퍼 증상 피커 신설 — DamperModal 안에 1 useState + 2 JSX 표시(equip + yscp)
  - InspectionModal 안의 damperSymptomPick 사용처 0건 (dead code 제거 완료)
  - 비즈니스 로직 보존 — BaeyeonModal: handleSave / useInspectionRevisitPopup('배연창') / useEffect reset 캐스케이드 3건. DamperModal: handleStairSave photoKey 대표 부여(260505-cib) / handleSingleSave 의 finalMemo 분기 / canSave / stairNums / equipCPs / yscpId / jdMode.
- TypeScript 컴파일 0 에러 (`npx tsc --noEmit`)
- 프로덕션 빌드 통과 (`npm run build` — Vite + PWA injectManifest)
- diff stat 한정 확인: cha-bio-safety/src/pages/InspectionPage.tsx 만 변경. 다른 파일 변경 0건.
- /inspection 라우트 진입 → BaeyeonModal + DamperModal 4 시나리오 라이트/다크 spot check (수동 시각 검증):
  - BaeyeonModal: 연구동 → 8F → 위치 다중 선택 → 결과 정상/주의/불량 토글
  - DamperModal stair 모드: 전실제연댐퍼 → 계단전실 2 선택 → 6층 result-mini 각 토글 → "N/M층 이미 점검 완료" 배지
  - DamperModal equip 모드: 전실제연댐퍼 → 배기팬 칩 선택 → 결과 주의 → 댐퍼 증상 피커 노출 → "모터 기능 이상" 선택 → 활성 상태(accent border + tinted bg)
  - DamperModal yscp 모드: 연결송수관 → 북문 선택 → 결과 불량 → 댐퍼 증상 피커 노출 → "직접 입력" 선택 → 메모 라벨 "증상 상세 및 특이사항 (선택)" 으로 변경
- cbc7119 디자인 격리 리포 한정 작업 — 원본 cha-bio-safety PWA 영향 0 (운영 메모리 룰)
  </behavior>
  <action>
**Step 3.1 — 통합 grep gate:**

```bash
cd /Users/jykevin/Documents/cbc7119-design

echo "=== A. BaeyeonModal + DamperModal 영역 통합 ==="

# BaeyeonModal(653~879) + DamperModal(2420~2871) 영역 옛 토큰 0건
{
  sed -n '653,880p' cha-bio-safety/src/pages/InspectionPage.tsx
  sed -n '2420,2871p' cha-bio-safety/src/pages/InspectionPage.tsx
} | grep -cE "var\(--bg2?\)|var\(--bd2?\)|var\(--acl\)|var\(--t[123]\)|var\(--safe\)|var\(--warn\)|var\(--danger\)|var\(--fire\)"
# → 0

# 두 영역 9/10/11px 폰트 0건
{
  sed -n '653,880p' cha-bio-safety/src/pages/InspectionPage.tsx
  sed -n '2420,2871p' cha-bio-safety/src/pages/InspectionPage.tsx
} | grep -cE "fontSize:(9|10|11)\b|text-\[(9|10|11)px\]"
# → 0

# 두 영역 결과 이모지 0건
{
  sed -n '653,880p' cha-bio-safety/src/pages/InspectionPage.tsx
  sed -n '2420,2871p' cha-bio-safety/src/pages/InspectionPage.tsx
} | grep -cE "✅|⚠️|❌"
# → 0

echo "=== B. 댐퍼 증상 피커 신설 정합 ==="

# DamperModal 안 useState 1건
[ "$(grep -c 'const \[damperSymptomPick' cha-bio-safety/src/pages/InspectionPage.tsx)" = "1" ] && echo "useState=1 OK" || echo "FAIL"

# damper 옵션 라벨 — equip + yscp 두 곳 (정확 2)
[ "$(grep -c \"'모터 기능 이상'\" cha-bio-safety/src/pages/InspectionPage.tsx)" = "2" ] && echo "options=2 OK" || echo "FAIL"

echo "=== C. InspectionModal dead code 제거 확인 ==="

# InspectionModal 안의 damperSymptomPick 사용처 0건
[ "$(awk '/^function InspectionModal/,/^function InspectionPage/' cha-bio-safety/src/pages/InspectionPage.tsx | grep -cE 'damperSymptomPick|setDamperSymptomPick')" = "0" ] && echo "InspectionModal dead code=0 OK" || echo "FAIL"

echo "=== D. 비즈니스 로직 보존 — 5 시그니처 ==="

# BaeyeonModal
grep -q "category: *'배연창'" cha-bio-safety/src/pages/InspectionPage.tsx && echo "BaeyeonModal popup '배연창' OK"
grep -q "BY_LOC_NO\[z\]" cha-bio-safety/src/pages/InspectionPage.tsx && echo "BaeyeonModal BY_LOC_NO OK"

# DamperModal
grep -q "photoTargetCp" cha-bio-safety/src/pages/InspectionPage.tsx && echo "DamperModal photoTargetCp (260505-cib) OK"
grep -q "const stairNums = useMemo" cha-bio-safety/src/pages/InspectionPage.tsx && echo "DamperModal stairNums OK"
grep -q "const jdMode = " cha-bio-safety/src/pages/InspectionPage.tsx && echo "DamperModal jdMode OK"
grep -q "damperSymptomPick === '직접 입력'" cha-bio-safety/src/pages/InspectionPage.tsx && echo "DamperModal finalMemo branch OK"

# 5 카테고리 증상 피커 (Wave 2 sp7 + Wave 4 tbj 후) — symptomPick / extSymptomPick / hydrantSymptomPick / shutterSymptomPick 은 InspectionModal 안 그대로, damperSymptomPick 은 DamperModal 안에 정확히 1건
[ "$(grep -cE 'set(Symptom|ExtSymptom|HydrantSymptom|ShutterSymptom|DamperSymptom)Pick\(s\)' cha-bio-safety/src/pages/InspectionPage.tsx)" = "5" ] && echo "5 setter calls OK"
```

**Step 3.2 — TypeScript + Build 검증:**

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety
npx tsc --noEmit
# → 0 에러

npm run build 2>&1 | tail -30
# → ✓ built (PWA injectManifest 메시지)
```

**Step 3.3 — Diff stat 자기 검증:**

```bash
cd /Users/jykevin/Documents/cbc7119-design
git status --short
# → M cha-bio-safety/src/pages/InspectionPage.tsx (단일 파일만)

git diff --stat cha-bio-safety/src/pages/InspectionPage.tsx
# → 1 file changed, ~400~500 insertions(+), ~350~400 deletions(-) 예상
# (BaeyeonModal ~227줄 + DamperModal ~452줄 변환 + 댐퍼 피커 신설 + dead code 제거)
```

다른 파일 변경 발생 시 git checkout 으로 복원.

**Step 3.4 — 시각 검증 (수동 — 자동 검증 보완):**

`npm run dev` 또는 cbc7119 Pages 배포 후:
- /inspection 진입
- CATEGORY_GROUPS[9] 배연창 탭 → BaeyeonModal 노출 → 시안 라인 419~544 와 시각 일치 확인 (라이트/다크)
- CATEGORY_GROUPS[2] 전실제연댐퍼+연결송수관 탭 → DamperModal 노출
  - 전실제연댐퍼 + 계단전실 2 선택 → stair-tile result-mini × 6층 → 시안 라인 559~657 일치
  - 전실제연댐퍼 + 배기팬 칩 선택 → equip 모드 result picker + 댐퍼 증상 피커 노출 → 활성/비활성 시각 확인
  - 연결송수관 + 북문 선택 → yscp 모드 result picker + 댐퍼 증상 피커 노출 → 시안 라인 661~714 일치
  - "직접 입력" 선택 → 메모 라벨 "증상 상세 및 특이사항 (선택)" 변경 확인

cbc7119 디자인 격리 리포 한정 — 원본 PWA 영향 0 (사용자 컨펌 후 main 머지 + 배포).
  </action>
  <verify>
    <automated>
cd /Users/jykevin/Documents/cbc7119-design && \
echo "=== A. 두 영역 통합 옛 토큰 0건 ===" && \
[ "$({ sed -n '653,880p' cha-bio-safety/src/pages/InspectionPage.tsx; sed -n '2420,2871p' cha-bio-safety/src/pages/InspectionPage.tsx; } | grep -cE 'var\(--bg2?\)|var\(--bd2?\)|var\(--acl\)|var\(--t[123]\)|var\(--safe\)|var\(--warn\)|var\(--danger\)|var\(--fire\)')" = "0" ] && echo "PASS" || (echo "FAIL"; exit 1) && \
echo "=== B. 두 영역 9/10/11px 폰트 0건 ===" && \
[ "$({ sed -n '653,880p' cha-bio-safety/src/pages/InspectionPage.tsx; sed -n '2420,2871p' cha-bio-safety/src/pages/InspectionPage.tsx; } | grep -cE 'fontSize:(9|10|11)\b|text-\[(9|10|11)px\]')" = "0" ] && echo "PASS" || (echo "FAIL"; exit 1) && \
echo "=== C. 두 영역 결과 이모지 0건 ===" && \
[ "$({ sed -n '653,880p' cha-bio-safety/src/pages/InspectionPage.tsx; sed -n '2420,2871p' cha-bio-safety/src/pages/InspectionPage.tsx; } | grep -cE '✅|⚠️|❌')" = "0" ] && echo "PASS" || (echo "FAIL"; exit 1) && \
echo "=== D. 댐퍼 증상 피커 신설 정합 (useState=1, 옵션 표시=2) ===" && \
[ "$(grep -c 'const \[damperSymptomPick' cha-bio-safety/src/pages/InspectionPage.tsx)" = "1" ] && \
[ "$(grep -c \"'모터 기능 이상'\" cha-bio-safety/src/pages/InspectionPage.tsx)" = "2" ] && \
echo "PASS" || (echo "FAIL"; exit 1) && \
echo "=== E. InspectionModal 안의 damperSymptomPick 사용 0건 ===" && \
[ "$(awk '/^function InspectionModal/,/^function InspectionPage/' cha-bio-safety/src/pages/InspectionPage.tsx | grep -cE 'damperSymptomPick|setDamperSymptomPick')" = "0" ] && echo "PASS" || (echo "FAIL"; exit 1) && \
echo "=== F. 5 setter 호출 정합 (Wave 2 + tbj) ===" && \
[ "$(grep -cE 'set(Symptom|ExtSymptom|HydrantSymptom|ShutterSymptom|DamperSymptom)Pick\(s\)' cha-bio-safety/src/pages/InspectionPage.tsx)" = "5" ] && echo "PASS" || (echo "FAIL: 5 setters expected"; exit 1) && \
echo "=== G. 비즈니스 로직 보존 — 7 시그니처 ===" && \
grep -q "category: *'배연창'" cha-bio-safety/src/pages/InspectionPage.tsx && \
grep -q "BY_LOC_NO\[z\]" cha-bio-safety/src/pages/InspectionPage.tsx && \
grep -q "photoTargetCp" cha-bio-safety/src/pages/InspectionPage.tsx && \
grep -q "const stairNums = useMemo" cha-bio-safety/src/pages/InspectionPage.tsx && \
grep -q "const equipCPs = useMemo" cha-bio-safety/src/pages/InspectionPage.tsx && \
grep -q "const jdMode = " cha-bio-safety/src/pages/InspectionPage.tsx && \
grep -q "damperSymptomPick === '직접 입력'" cha-bio-safety/src/pages/InspectionPage.tsx && \
echo "PASS" || (echo "FAIL: business signatures missing"; exit 1) && \
echo "=== H. TypeScript compile ===" && \
(cd cha-bio-safety && npx tsc --noEmit) && echo "PASS" && \
echo "=== I. Production build ===" && \
(cd cha-bio-safety && npm run build > /tmp/tbj-build.log 2>&1) && echo "PASS" || (tail -40 /tmp/tbj-build.log; exit 1) && \
echo "=== J. Diff scope — 단일 파일 ===" && \
[ "$(git diff --name-only | wc -l | tr -d ' ')" = "1" ] && \
[ "$(git diff --name-only)" = "cha-bio-safety/src/pages/InspectionPage.tsx" ] && \
echo "PASS" || (echo "FAIL: diff scope exceeded"; git diff --name-only; exit 1)
    </automated>
  </verify>
  <done>
- 자동 grep gate 10건 모두 PASS
- tsc + npm run build 모두 통과
- diff 범위 단일 파일 한정 (cha-bio-safety/src/pages/InspectionPage.tsx)
- 시각 검증 (수동 — 사용자 컨펌)
- SUMMARY.md 작성
- atomic commit: `chore(260514-tbj): Wave 4 task 3 — verify gate + build pass`
  </done>
</task>

</tasks>

<verification>
**자동 검증 (Task 1 ~ Task 3 verify 블록 일괄):**
1. BaeyeonModal + DamperModal 영역 옛 토큰 0건
2. BaeyeonModal + DamperModal 영역 9/10/11px 폰트 0건
3. BaeyeonModal + DamperModal 영역 결과 이모지(✅⚠️❌) 0건
4. DamperModal 안 댐퍼 증상 피커 신설 정합 (useState=1, 옵션 표시=2 — equip+yscp)
5. InspectionModal 안의 damperSymptomPick 사용 0건 (dead code 제거 완료)
6. 5 카테고리 증상 피커 setter 호출 5건 그대로 (Wave 2 sp7 + Wave 4 tbj 후)
7. 비즈니스 로직 보존 — BaeyeonModal/DamperModal 의 7 핵심 시그니처(useInspectionRevisitPopup '배연창' / BY_LOC_NO / photoTargetCp(260505-cib) / stairNums / equipCPs / jdMode / damperSymptomPick finalMemo 분기)
8. tsc 0 에러
9. npm run build 통과
10. diff 범위 단일 파일 한정

**수동 검증 (사용자 시각 컨펌 후 main 머지 + 배포 — 디자인 브랜치 룰):**
- /inspection BaeyeonModal 라이트/다크 — 시안 라인 419~544 1:1 일치
- /inspection DamperModal stair 모드 — 시안 라인 559~657 1:1 일치 (계단전실 2열 + result-mini × 6층)
- /inspection DamperModal equip 모드 — 시안 라인 661~714 1:1 일치 + 댐퍼 증상 피커 active 상태 확인
- /inspection DamperModal yscp 모드 — 시안 1:1 + "직접 입력" 모드 메모 라벨 분기 확인
</verification>

<success_criteria>
- BaeyeonModal 마크업/스타일이 4차 시안(`inspection-sketch-baeyeon-damper.html` 라인 419~544) 과 1:1 매칭
- DamperModal 마크업/스타일이 4차 시안(라인 548~717) 과 1:1 매칭 (stair / equip / yscp 3 모드)
- DamperModal 내부 댐퍼 증상 피커 신설 (Wave 2 sp7 패턴 1:1) — equip+yscp 양쪽에서 result !== 'normal' 시 표시
- InspectionModal 안의 도달 불가 dead code 4곳 제거 (useState / finalMemo / JSX / memo 라벨 OR 절)
- BaeyeonModal/DamperModal 비즈니스 로직 100% 보존 (props / state / useEffect reset 캐스케이드 / handleSave / handleStairSave photoKey 1건 대표 부여 / useInspectionRevisitPopup / canSave / jdMode / stairNums / equipCPs / yscpId)
- BaeyeonModal + DamperModal 영역의 인라인 style 금지 키 + 9/10/11px 폰트 + 옛 토큰 + 결과 이모지 0건
- TypeScript 컴파일 + npm run build 통과
- 라이트/다크 양쪽 정상 렌더 (시안 4 viewport 일치)
- cbc7119 디자인 격리 리포 한정 — 원본 cha-bio-safety PWA 영향 0
- atomic git commit 3건 (task 별 — feat / feat / chore)
</success_criteria>

<output>
After completion, create `.planning/quick/260514-tbj-redesign-02-inspection-tsx-wave-4/260514-tbj-SUMMARY.md` documenting:
- 변경 줄 수 (diff stat: 1 file, ~400-500 +/- ~350-400 -)
- BaeyeonModal 시안 매핑 결과 (10여개 마크업 블록 1:1 매칭표)
- DamperModal 시안 매핑 결과 (stair / equip / yscp 3 모드 + 댐퍼 증상 피커 신설 표시)
- InspectionModal dead code 제거 4곳 (useState / finalMemo / JSX / memo 라벨)
- 비즈니스 로직 보존 grep gate 결과
- Wave 5~ 후속 트랙 안내 (DivModal/CompressorModal/PowerPanelModal/ParkingGateModal — 5차 sketch 별도)
- 점검·조치 자동화 5종 카테고리 메모리 룰 완성(현재 5/5 — 유도등/소화기/소화전/방화셔터/전실제연댐퍼 모두 증상 피커 활성화)
</output>
</content>
</invoke>