---
phase: 260423-htx
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/components/InspectionRevisitPopup.tsx          # 신규 — 공통 팝업 컴포넌트
  - cha-bio-safety/src/hooks/useInspectionRevisitPopup.ts              # 신규 — 판정/트리거 훅
  - cha-bio-safety/src/pages/InspectionPage.tsx                        # 9개 모달 팝업 호출 통일
  - cha-bio-safety/src/pages/FloorPlanPage.tsx                         # 마커 → 점검 입력 진입 시 팝업 연결
  - cha-bio-safety/functions/api/inspections/records.ts                # staff 이름 JOIN 추가
autonomous: false   # 프로덕션 배포 후 수동 검증 체크포인트 포함
requirements:
  - REVISIT-POPUP-01  # 일반 점검 완료 개소 재진입 시 팝업 통일

must_haves:
  truths:
    - "일반 점검 카테고리(CCTV·화재수신반 제외)에서 '이번 달 schedule_items 기간 내 기록이 존재하는 정상 개소'에 재진입하면, '소화기 방식 부분 오버레이' 팝업 (가)가 뜨고 '[checked_at 포맷]에 [점검자이름]이 이미 점검한 개소입니다' 문구 + '확인' 버튼이 표시된다."
    - "같은 조건에서 '주의/불량 + status=open(미조치)' 개소에 재진입하면 팝업 (나)가 뜨고 '[checked_at 포맷]에 [점검자이름]에 의해 조치 대기중인 개소입니다. 조치 내용을 입력하시겠습니까?' 문구 + '이동' / '취소' 버튼이 표시된다."
    - "팝업 (나)에서 '이동' 버튼을 누르면 `/remediation/{recordId}` 로 이동한다."
    - "팝업 (나)에서 '취소' 버튼을 누르면 팝업만 닫히고 점검 모달에 잔류한다 (페이지 이동 없음)."
    - "팝업 (가)에서 '확인' 을 누르면 팝업만 닫히고 재점검이 가능해진다 (저장 로직은 1단계 DB 규칙 — UNIQUE 있으면 덮어쓰기, 없으면 추가 — 그대로 유지)."
    - "같은 달 한 개소에 정상 기록과 미조치 기록이 섞여 있으면 (나)가 우선 표시된다."
    - "CCTV·화재수신반 모달에서는 재진입 팝업이 절대 뜨지 않는다."
    - "'접근불가' 개소는 팝업 없이 기존 자동 스킵 동작을 유지한다."
    - "schedule_items 에 등록된 이번 달 점검 기간 밖의 check_records 기록은 '완료'로 판정되지 않아 팝업이 뜨지 않는다 (달이 바뀌어도 자연스럽게 리셋)."
    - "트리거는 QR 진입, 스와이프 이동, 탭 선택, FloorPlan 마커 선택 → '점검 기록 입력' 경로 모두에서 동일하게 작동한다."
  artifacts:
    - path: "cha-bio-safety/src/components/InspectionRevisitPopup.tsx"
      provides: "공통 재진입 팝업 컴포넌트 — variant: 'completed' | 'pending-action'"
      min_lines: 60
    - path: "cha-bio-safety/src/hooks/useInspectionRevisitPopup.ts"
      provides: "훅 — 주어진 checkpointId/month-records/recordMeta/schedule_items 로부터 팝업 variant와 표시여부 판정"
      min_lines: 50
    - path: "cha-bio-safety/src/pages/InspectionPage.tsx"
      provides: "9개 카테고리 모달(DIV·Compressor·Stairwell·Baeyeon·PowerPanel·ParkingGate·Damper·Inspection generic·유도등 포함)이 공통 컴포넌트/훅 사용하도록 통일"
      contains: "InspectionRevisitPopup"
    - path: "cha-bio-safety/functions/api/inspections/records.ts"
      provides: "check_records 응답에 staff_name (JOIN staff) 포함"
      contains: "JOIN staff"
  key_links:
    - from: "src/pages/InspectionPage.tsx (9 modals)"
      to: "src/components/InspectionRevisitPopup.tsx"
      via: "import + JSX 호출 in render"
      pattern: "InspectionRevisitPopup"
    - from: "src/pages/InspectionPage.tsx"
      to: "src/hooks/useInspectionRevisitPopup.ts"
      via: "import + useEffect가 pickerIdx/selectedCP 변경 시 훅 판정"
      pattern: "useInspectionRevisitPopup"
    - from: "src/pages/FloorPlanPage.tsx"
      to: "src/components/InspectionRevisitPopup.tsx + useInspectionRevisitPopup"
      via: "'점검 기록 입력' 버튼 클릭 시 훅으로 판정 후 필요 시 팝업 렌더"
      pattern: "InspectionRevisitPopup"
    - from: "src/hooks/useInspectionRevisitPopup.ts"
      to: "scheduleApi.getByMonth + inspectionApi.getMonthRecords"
      via: "인자로 넘어온 schedule_items / monthRecords / recordMeta 소비 (데이터는 상위에서 주입)"
      pattern: "schedule.*inspectionCategory"
    - from: "팝업 (나) '이동' 버튼"
      to: "/remediation/{recordId}"
      via: "useNavigate('/remediation/' + recordId)"
      pattern: "navigate\\(.*remediation"
---

<objective>
일반 점검 카테고리의 '완료 개소 재진입 팝업' 동작을 통일한다.

**왜 필요한가?**
- 현재 `InspectionPage.tsx` 안에 같은 목적의 dup-alert 로직이 세 곳에 서로 다른 스타일로 복붙되어 있다 (DivModal 1236, CompressorModal 1619, InspectionModal 2807).
- 나머지 5개 모달(Stairwell/Baeyeon/PowerPanel/ParkingGate/Damper)은 아예 팝업이 없다.
- 판정 기준도 제각각: DIV는 "같은 사이클", Compressor는 "이번 달 comp_inspections", 제네릭 InspectionModal은 "monthRecords 전체". 사용자가 합의한 **"해당 월 schedule_items 점검 기간 내 기록"** 기준은 아직 어디에도 없다.
- 주의/불량 미조치 개소 재진입 시 조치 페이지로 유도하는 플로우가 없어서 사용자가 이미 본인이 주의/불량을 남긴 개소에 다시 들어가 덮어쓰기/추가 저장을 하는 사고가 발생할 수 있다.

**범위:**
- 대상 카테고리: 소화전, 소화기, 유도등, 청정소화약제, 방화셔터, 완강기, 소방펌프, DIV, 컴프레셔, 전실제연댐퍼, 연결송수관, 특별피난계단, 주차장비, 회전문, 소방용전원공급반, 배연창, 도면(FloorPlan) 진입.
- 제외: CCTV, 화재수신반 (CctvModal·FireAlarmModal 은 건드리지 않는다).
- 완료 판정 = 이번 달 `schedule_items` 중 `category='inspect'` + `inspectionCategory` 가 해당 카테고리에 매핑되는 일정의 `date ~ (endDate ?? date)` 기간 안에 해당 checkpoint 의 `check_records` 가 있는지.
- 우선순위: 기간 내 정상 기록 + 기간 내 주의/불량 미조치 기록이 공존하면 (나) 우선.

**출력물:**
- 공통 팝업 컴포넌트 + 판정 훅.
- InspectionPage 9개 모달 호출 통일.
- FloorPlanPage 진입 경로 연결.
- records.ts staff JOIN.

**운영 관찰 모드 준수:** 범위 밖 리팩토링 금지. 각 모달 내부의 저장 로직/입력 폼/트렌드뷰/전용 UI 는 전혀 건드리지 않는다. 팝업 호출/판정 부분만 교체.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@cha-bio-safety/.planning/STATE.md
@cha-bio-safety/CLAUDE.md

<!-- 기존 dup-alert 코드 위치 (교체 대상) -->
<!--
- src/pages/InspectionPage.tsx
  - Line 166:  StairwellModal         (팝업 없음 — 신규 추가)
  - Line 376:  CctvModal              (제외 — 건드리지 말 것)
  - Line 542:  BaeyeonModal           (팝업 없음 — 신규 추가)
  - Line 977:  DivModal               (기존 dup-alert 라인 1032/1236/1261-1270 교체)
  - Line 1551: CompressorModal        (기존 dup-alert 라인 1586/1619/1703-1712 교체)
  - Line 1880: PowerPanelModal        (팝업 없음 — 신규 추가)
  - Line 2055: ParkingGateModal       (팝업 없음 — 신규 추가)
  - Line 2234: DamperModal            (팝업 없음 — 신규 추가)
  - Line 2647: InspectionModal        (제네릭: 소화전/소화기/유도등/청정/방화셔터/완강기/소방펌프 — 기존 dup-alert 라인 2680/2795/2807-2812/3119-3130 교체)
  - Line 4215: FireAlarmModal         (제외 — 건드리지 말 것)
- src/pages/FloorPlanPage.tsx:909 — '점검 기록 입력' 버튼 클릭 시점에서 훅 판정
-->

<interfaces>
<!-- 상위 InspectionPage 메인 컴포넌트가 이미 들고 있는 state (기존 코드 3509-3745 참고) -->
```typescript
// src/pages/InspectionPage.tsx 의 main export 내부
type RecordMeta = {
  recordId:           string
  status:             'open' | 'resolved'
  memo?:              string
  photoKey?:          string
  checkedAt?:         string
  resolutionMemo?:    string
  resolutionPhotoKey?:string
  resolvedAt?:        string
  resolvedBy?:        string
}
const monthRecords:  Record<string, CheckResult>     // cpId → 이번 달 최신 result
const recordMeta:    Record<string, RecordMeta>      // cpId → 메타 (recordId, status, checkedAt 등)
```

```typescript
// src/utils/api.ts 기존 API
scheduleApi.getByMonth(month: string) => Promise<ScheduleItem[]>
inspectionApi.getMonthRecords(month: string) => Promise<any[]>

// src/types/index.ts
export interface ScheduleItem {
  id: string; title: string; date: string; endDate?: string;
  category: ScheduleCategory;             // 'inspect' 일 때만 대상
  status: ScheduleStatus;
  inspectionCategory?: string;            // 예: '소화기', '소화전', '특별피난계단'
  memo?: string;
}

// 카테고리 alias (기존 InspectionPage.tsx 4336)
const SCHED_ALIAS: Record<string, string> = { '방화문': '특별피난계단' }
```

```typescript
// 라우팅 (src/App.tsx 기존)
// /remediation/:recordId → RemediationDetailPage
// 이동: useNavigate()('/remediation/' + recordId)
```

```typescript
// 공통 컴포넌트 / 훅 계약 (이 계획에서 신규 작성할 contract)
// src/components/InspectionRevisitPopup.tsx
export type RevisitVariant = 'completed' | 'pending-action'
export interface InspectionRevisitPopupProps {
  variant: RevisitVariant
  checkedAt: string                       // ISO 또는 'YYYY-MM-DD HH:mm' 로컬
  inspectorName: string
  recordId?: string                       // variant='pending-action' 일 때 필요
  onClose: () => void                     // 팝업 닫기 (공통)
  // variant='pending-action' 일 때만 사용됨
  onGoToRemediation?: (recordId: string) => void
}

// src/hooks/useInspectionRevisitPopup.ts
export interface RevisitPopupState {
  show: boolean
  variant: RevisitVariant
  checkedAt: string
  inspectorName: string
  recordId?: string
}
export interface UseRevisitArgs {
  checkpointId: string | null | undefined
  category: string | null | undefined           // '소화기', 'DIV' 등 (팝업 대상 판정용)
  monthRecords: Record<string, any>             // cpId → { result, checkedAt?, staffName?, recordId?, status? }
  // monthRecords 는 record 상세를 담은 맵으로 확장 사용 (단순 result 맵이 아님 — 호출부에서 조합해서 넘김)
  scheduleItems: import('../types').ScheduleItem[]    // 이번 달 schedule_items (category==='inspect' 필터 전/후 무관)
  excludeCategories?: string[]                   // default: ['CCTV', '화재수신반']
}
export function useInspectionRevisitPopup(args: UseRevisitArgs): {
  popupState: RevisitPopupState | null
  dismiss: () => void
  // checkpointId 가 바뀔 때마다 내부적으로 재평가. 수동 트리거 필요 시:
  evaluate: () => void
}
```
</interfaces>

<!-- 참고: 일정 매칭은 기존 InspectionPage.tsx 4337-4344 구현을 재사용 -->
<!--
  const schedMatches = schedItems.filter(s => {
    if (s.category !== 'inspect') return false
    const ic = s.inspectionCategory ?? ''
    return cats.includes(ic) || cats.includes(SCHED_ALIAS[ic] ?? '')
  })
  → cats 대신 단일 category 비교로 축소 가능
-->
</context>

<tasks>

<task type="auto">
  <name>Task 1: 공통 팝업 컴포넌트 + 판정 훅 + staff JOIN API 확장</name>
  <files>
    cha-bio-safety/src/components/InspectionRevisitPopup.tsx,
    cha-bio-safety/src/hooks/useInspectionRevisitPopup.ts,
    cha-bio-safety/functions/api/inspections/records.ts
  </files>
  <action>
### 1) `src/components/InspectionRevisitPopup.tsx` (신규)

- `<interfaces>` 섹션의 `InspectionRevisitPopupProps` 그대로 구현.
- 스타일: **소화기 방식 부분 오버레이** 를 그대로 따른다. 기존 `InspectionPage.tsx` 3121-3130 의 inline 스타일 그대로 복사해서 출발점으로 삼는다 (절대 `position:fixed` 풀스크린 오버레이 쓰지 말 것 — 부모 `position:relative` 박스 안에서 `position:absolute; inset:0; zIndex:10` 로 뜨는 형태).
- 문구 (잠긴 결정 — 한 글자도 바꾸지 말 것):
  - `variant='completed'`:
    - "`${fmtDateTime(checkedAt)}`에 `${inspectorName}`이 이미 점검한 개소입니다."
    - 버튼 1개: "확인" → `onClose()`
  - `variant='pending-action'`:
    - "`${fmtDateTime(checkedAt)}`에 `${inspectorName}`에 의해 조치 대기중인 개소입니다. 조치 내용을 입력하시겠습니까?"
    - 버튼 2개: "이동" → `onGoToRemediation?.(recordId!)`, "취소" → `onClose()`
- `fmtDateTime` 은 컴포넌트 내부 util 로 두고 `YYYY-MM-DD HH:mm` 포맷 (KST 로컬) 으로 생성. 이미 `InspectionPage.tsx` 에 `fmtDateTime` 과 유사 유틸이 있을 수 있으나 **import 하지 말고** 이 파일 안에 자체 작성 (컴포넌트 독립성 유지).
- 아이콘 이모지는 기존 ⚠️ 유지. 색/폰트는 `var(--t1)/var(--t3)/var(--bg2)/var(--bd)/var(--acl)` CSS 변수 그대로.
- `variant='pending-action'` 의 '이동' 버튼은 `background:'var(--acl)'`, '취소' 는 `background:'var(--bg)', border:'1px solid var(--bd2)', color:'var(--t2)'` (취소 버튼 스타일은 InspectionPage 저장 하단 '닫기' 버튼 라인 3233 그대로 흉내).
- named export 로 컴포넌트 + `RevisitVariant` 타입 + props 타입 전부 export.

### 2) `src/hooks/useInspectionRevisitPopup.ts` (신규)

- `<interfaces>` 의 `useInspectionRevisitPopup` 그대로 구현.
- 동작:
  - `checkpointId` 가 falsy 면 `popupState = null`.
  - `excludeCategories` 기본값 `['CCTV', '화재수신반']` — `category` 가 이 목록에 있으면 `popupState = null`.
  - `scheduleItems` 를 훅 내부에서 필터: `category === 'inspect'` 이고 `inspectionCategory` 가 현재 `category` 와 매칭 (SCHED_ALIAS `{'방화문':'특별피난계단'}` 역매핑 포함) 되는 일정만 뽑는다.
  - 해당 일정들의 `date ~ (endDate ?? date)` 중 **어떤 구간이라도** 현재 체크포인트의 `monthRecords[checkpointId]?.checkedAt` 날짜를 포함하면 "기간 내 기록" 으로 판정.
  - 일정이 하나도 없으면 (schedule_items 미등록) `popupState = null` (팝업 안 띄움 — 현장에서 일정 없으면 재진입 팝업을 띄울 근거가 없다).
  - 기간 내 기록이 존재할 때:
    - `monthRecords[checkpointId]` 의 `result` 가 `'caution' | 'bad'` 이고 `status === 'open'` 이면 → `variant='pending-action'`, `recordId` 세팅, 이 상태를 **최우선** 반환.
    - 그 외 (result === 'normal' 이거나 resolved) → `variant='completed'`.
  - 같은 체크포인트에 여러 기록이 섞여 있을 수 있으므로 호출부에서 넘길 때는 "가장 나쁜 상태" 를 우선시하도록 monthRecords 를 구성해서 넘긴다 (아래 Task 2 에서 처리).
- 내부에 `useState<RevisitPopupState | null>` + `useEffect`(deps: `checkpointId`, `category`, `JSON.stringify(scheduleItems)`, `JSON.stringify(monthRecords[checkpointId])` — 안전하게 얕게 비교할 것) 로 재평가. 동일 checkpointId 에 한 번만 자동 show 되도록 `useRef<string | null>` 로 lastShownCpRef 사용 (기존 InspectionModal 2805 의 `lastPopupCpRef` 패턴과 동일 — 이 패턴을 훅 안으로 끌어들인다).
- `dismiss()` 호출 시 `show=false` (즉 `popupState=null` 로 세팅). 재진입 시 다시 떠야 하므로 `lastShownCpRef` 는 건드리지 않되, 같은 cp 로 다시 들어올 때는 안 뜨는 게 기존 동작 — **그대로 유지**.
- `evaluate()` 는 외부에서 "QR 진입 직후 강제 재평가" 같은 수동 트리거가 필요할 때를 위한 escape hatch. 내부에서 `lastShownCpRef.current = null` 처리 후 같은 로직 재실행.

### 3) `functions/api/inspections/records.ts` — staff 이름 JOIN

현재 SELECT 문에 `r.staff_id` 만 있다. 문구에 필요한 `staff_name` 을 JOIN 으로 가져와서 응답에 포함.

- SELECT 에 `(SELECT s2.name FROM staff s2 WHERE s2.id = r.staff_id) AS staff_name` 추가 (이미 `inspection_sessions s` alias 를 쓰고 있으니 subquery 가 안전).
- 응답 매핑 (`rows.map`) 에 `staffName: r.staff_name` 추가.
- 타입/프론트 변경은 Task 2 에서. 이 Task 에서는 **API 응답만 확장**.

이 Task 는 **UI 를 건드리지 않는다**. 컴포넌트/훅 모두 아직 어느 페이지도 import 하지 않는 "순수 신규 파일". API 확장도 응답 필드 추가만 — 기존 소비자는 무시. 따라서 이 Task 만 배포해도 회귀 가능성 없음.
  </action>
  <verify>
    <automated>cd cha-bio-safety && npx tsc --noEmit 2>&1 | tail -30</automated>
    추가 수동: 다음 명령으로 파일 존재와 export 확인:
    - `grep -n "export" cha-bio-safety/src/components/InspectionRevisitPopup.tsx` → 최소 3개 export (컴포넌트 + 타입 2개)
    - `grep -n "export" cha-bio-safety/src/hooks/useInspectionRevisitPopup.ts` → 최소 2개 export (훅 함수 + UseRevisitArgs 타입)
    - `grep -n "staff_name" cha-bio-safety/functions/api/inspections/records.ts` → SELECT 와 매핑에 등장
  </verify>
  <done>
    - 3개 파일 추가/수정, TypeScript 컴파일 에러 0건.
    - 컴포넌트/훅 모두 named export 로 제공, 다른 파일에서 import 가능한 상태.
    - API 응답 `staffName` 필드가 month records 응답에 포함됨 (빈 문자열 허용 but null 은 `?? null` 처리).
  </done>
</task>

<task type="auto">
  <name>Task 2: InspectionPage 9개 모달 + FloorPlanPage 진입 경로를 공통 팝업/훅으로 통일</name>
  <files>
    cha-bio-safety/src/pages/InspectionPage.tsx,
    cha-bio-safety/src/pages/FloorPlanPage.tsx
  </files>
  <action>
**원칙:** 각 모달 내부의 저장 로직/입력 폼/라인 선택/트렌드뷰 등은 **절대 건드리지 않는다**. 오직 기존 dup-alert JSX 블록과 `showDupAlert` state 선언, 관련 `useEffect` 블록만 공통 훅+컴포넌트로 치환한다. 팝업이 없던 모달에는 최소 추가만.

### 공통: 메인 InspectionPage 에서 주입할 데이터 준비

`export default function InspectionPage()` 본체 (3659~) 에서 이번 달 `schedule_items` 를 이미 로드하는 훅은 `InspectionSummaryCard` 안에만 있다 (line 4329). 메인에서도 필요하므로 메인 함수 안에 React Query 로 한 번 더 추가하되 같은 queryKey `['schedule-month', month]` 를 사용해서 캐시 재사용:

```typescript
const currentMonth = useMemo(() => {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`
}, [])
const { data: scheduleItems = [] } = useQuery({
  queryKey: ['schedule-month', currentMonth],
  queryFn: () => scheduleApi.getByMonth(currentMonth),
  staleTime: 60_000,
})
```

또한 현재 `recordMeta` 는 `loadTodayRecords` 에서 오늘 데이터만 채운다. Task 1 에서 API 가 `staffName` 을 돌려주므로, **이번 달 전체 기록** 의 메타도 같이 필요하다. `loadTodayRecords` 안의 `monthData` 처리 부분 (line 3736-3739) 에서 기존 `monthMap: Record<string, CheckResult>` 을 **`Record<string, { result; checkedAt; staffName; recordId; status }>` 형태로 확장**.
- 기존 `setMonthRecords(monthMap)` 타입이 바뀌므로 `const [monthRecords, setMonthRecords] = useState<...>` 선언 타입도 업데이트.
- 기존 소비자 감사: `grep -n "monthRecords" cha-bio-safety/src/pages/InspectionPage.tsx` — 모든 사용처에서 `monthRecords[cpId]` 가 truthy 체크용 (`if (monthRecords[cp.id])`) 로만 쓰이는지 확인. 대부분 truthy 체크지만 `InspectionModal` 내부 line 2795/2811 는 `monthRecords[currentSelCP.id]` 로 존재 여부만 체크하므로 객체여도 truthy. **단, result 값 자체를 쓰는 자리가 있으면 `monthRecords[cpId]?.result` 로 교체.** (수정 전에 grep 필수)
- `markerRecords` 는 기존대로 `Record<string, CheckResult>` 유지 (유도등 마커는 result 만 필요, 팝업 대상은 아니라 무영향).

### 모달별 작업

각 모달 props 에 `scheduleItems` 추가 주입. JSX 호출부 (line 4119~4184) 에서 `scheduleItems={scheduleItems}` 넘긴다. 또한 `monthRecords` 를 props 로 받지 않던 모달들에도 추가로 넘긴다.

모달 내부는 전부 같은 패턴으로 교체:

```typescript
// 기존 state 삭제:
//   const [showDupAlert, setShowDupAlert] = useState(false)
//   const dupAlertAppliedRef = useRef(false)
//   useEffect(() => { /* ... hasCycleRecord / hasThisMonth 판정 ... */ }, [...])

// 대체:
const { popupState, dismiss } = useInspectionRevisitPopup({
  checkpointId: currentPt?.id ?? null,     // 모달별로 currentPt / selectedCP / initialCpId 중 적절히
  category: '<모달 카테고리>',                 // 'DIV' | '컴프레셔' | '특별피난계단' | ...
  monthRecords,
  scheduleItems,
})
```

JSX 의 기존 dup-alert div 블록 (예: line 1261-1270, 1704-1712, 3120-3130) 를 아래로 교체:

```tsx
{popupState && (
  <InspectionRevisitPopup
    variant={popupState.variant}
    checkedAt={popupState.checkedAt}
    inspectorName={popupState.inspectorName}
    recordId={popupState.recordId}
    onClose={dismiss}
    onGoToRemediation={(recordId) => {
      dismiss()
      navigate('/remediation/' + recordId)   // useNavigate 를 모달에서도 사용 — 기존에 이미 사용 중이면 그대로, 아니면 import 추가
    }}
  />
)}
```

**중요:** `InspectionRevisitPopup` 는 **부분 오버레이** 이므로 `position:relative` 인 부모 박스 안에 렌더돼야 한다. 제네릭 `InspectionModal` 의 기존 위치(line 3120-3130) 가 이미 올바른 부모 (result-select 영역) 안에 있으므로 유지. 나머지 모달(DIV/Compressor 등) 은 현재 풀스크린 오버레이로 뜨고 있었는데, 통일 방침에 따라 **모달 본문 바로 아래 첫 번째 `<div style={{ flex:1, overflowY:'auto', padding:... }}>` 컨테이너에 `position:'relative'` 추가**하고 그 안에 렌더. 이렇게 하면 헤더/저장버튼은 덮지 않고 본문 스크롤 영역만 덮는 "소화기 방식 부분 오버레이" 스타일이 일관되게 적용된다.

#### 모달별 체크리스트

1. **DivModal** (line 977)
   - 기존 `showDupAlert` state(1032), dupAlertAppliedRef(1237), useEffect(1238-1248), JSX(1261-1270) 삭제.
   - 훅 호출: `category: 'DIV'`, `checkpointId: currentPt?.id`.
   - 본문 컨테이너에 `position:relative` 추가, JSX 블록 삽입.
   - `navigate` 는 이 모달에 없으면 `useNavigate` import 추가.

2. **CompressorModal** (line 1551)
   - 기존 `showDupAlert` state(1586), dupAlertAppliedRef(1620), useEffect(1621-1631), JSX(1704-1712) 삭제.
   - 훅 호출: `category: '컴프레셔'`, `checkpointId: currentPt?.id`.
   - 본문 컨테이너 position:relative + JSX 삽입.
   - **주의:** `mode='from-div'` 분기에서도 동작해야 하므로 z-index 무관하게 부분 오버레이 적용.

3. **InspectionModal** (line 2647) — 제네릭 (소화전/소화기/유도등/청정/방화셔터/완강기/소방펌프)
   - 기존 `showDupAlert` state(2680), useEffect 2788-2802 의 `if (monthRecords[initialCpId]) setShowDupAlert(true)` 와 2807-2812 전체, JSX(3122-3130) 를 공통 훅 + 컴포넌트로 교체.
   - **유도등 예외 유지:** 기존 2811 에 `if (!isGuideLight && monthRecords[...])` 로 유도등 제외. → 훅 인자 `category` 를 유도등인 경우 '유도등' 으로 넘기되, 마커 기반이라 checkpointId 가 `MARKER:...` 로 시작하면 훅 내부에서 감지해서 팝업 skip (훅에 `checkpointId?.startsWith('MARKER:')` 체크 추가) 하는 식으로 처리. **또는** 더 단순하게 `isGuideLight ? null : selectedCP?.id` 를 `checkpointId` 로 넘겨 유도등은 아예 후보에서 빠지게 한다 → 이 방법 채택.
   - 훅 호출: `category: group.categories[0]` (소화전 그룹이면 `'소화전'`, 비상콘센트 단독이면 `'비상콘센트'` — 판정은 주 카테고리 기준으로 충분), `checkpointId: isGuideLight ? null : (selectedCP?.id ?? null)`.
   - JSX 블록은 기존 3120-3131 자리에 그대로 (부모 `<div style={{ position:'relative' }}>` 유지).

4. **StairwellModal** (line 166) — **기존 팝업 없음, 신규 추가**
   - 현재 개소 선택 state 를 파악 (코드 읽어서 `selectedCp` / `currentCp` 류 변수 탐색 후 사용).
   - 훅 호출: `category: '특별피난계단'`, `checkpointId: <선택된 cp 의 id>`.
   - 모달 본문 컨테이너에 position:relative + JSX 삽입.
   - props 에 `scheduleItems`, `monthRecords` 추가.

5. **BaeyeonModal** (line 542) — **신규 추가**
   - 훅 호출: `category: '배연창'`, `checkpointId: <선택된 cp>`.

6. **PowerPanelModal** (line 1880) — **신규 추가**
   - 훅 호출: `category: '소방용전원공급반'`.

7. **ParkingGateModal** (line 2055) — **신규 추가**
   - 훅 호출: `category: '주차장비'` (그룹은 회전문 포함이지만 주 카테고리로 판정).

8. **DamperModal** (line 2234) — **신규 추가**
   - 훅 호출: `category` 는 선택된 cp 의 category 그대로 (`'전실제연댐퍼'` 또는 `'연결송수관'`).

9. **CctvModal (line 376), FireAlarmModal (line 4215)** — **건드리지 말 것.** 훅도 넘기지 말 것. 잠긴 결정: CCTV·화재수신반 제외.

### FloorPlanPage (line 909 근방)

`'점검 기록 입력'` 버튼(line 908-913) 을 누르면 현재는 바로 `setInspectModal(true)` 로 인라인 폼을 띄운다. 이 지점에서 판정 훅을 호출.

- 파일 상단에 이미 `scheduleApi` import 여부 확인 → 없으면 추가.
- 컴포넌트 body 에 이번 달 scheduleItems 와 해당 체크포인트의 month record 를 fetch (기존에 이미 `selected.last_result`, `selected.last_record_id`, `selected.last_inspected_at` 등을 마커 응답에 갖고 있으므로 **추가 API 호출 없이도** 판정 가능 — 이쪽이 간편). 대신 `staffName` 이 없다면 Task 1 에서 만든 records API 를 한 번 호출하거나, 마커 API 에 이미 있는지 확인: `grep -n "last_inspected_by\|staff" cha-bio-safety/functions/api/floorplan-markers/index.ts`. 없으면 **표시 문구용 staff 이름은 '—' 로 fallback**, 핵심 동작(이동 버튼)은 `selected.last_record_id` 만으로 충분하므로 기능에 지장 없음.
- 훅 호출 대신 이곳에서는 훅을 직접 불러와도 되고, 간단히 판정 util 만 뽑아서 호출해도 됨. 구현 단순화를 위해 **여기서는 훅 대신 `InspectionRevisitPopup` 컴포넌트만 조건부 렌더**로 처리하고, show/variant 판정은 버튼 onClick 안에서 인라인 계산:
  - `selected.check_point_id` 존재 + `selected.last_result` 존재 + `selected.last_inspected_at` 이 이번 달 + 이번 달 schedule_items 기간 내 → 다음 분기:
    - `last_result in ('bad','caution')` AND `last_status !== 'resolved'` → variant='pending-action', recordId=`selected.last_record_id`
    - else → variant='completed'
  - 아니면 기존 동작 (`setInspectModal(true)`).
- 팝업에서 '이동' → `navigate('/remediation/' + selected.last_record_id)`.
- 팝업에서 '확인'(completed) 또는 '취소'(pending-action) → 팝업 닫고 **사용자가 그래도 재점검 하고 싶으면** 다시 '점검 기록 입력' 버튼을 누르면 되는 자연스런 흐름으로 둔다 (자동으로 `setInspectModal(true)` 호출 금지 — 잠긴 결정의 "취소 → 페이지 잔류" 와 일관).
  - **예외:** variant='completed' 확인 시에는 잠긴 결정에 "재점검 가능" 이 명시돼 있으므로 `setInspectModal(true)` 를 허용할지 검토. 사용자 기대 흐름은 "팝업 닫기 → 사용자가 다시 버튼 눌러야 모달 뜸" 이 깔끔. **완료 팝업 확인 = 닫기만** 하고, 재점검은 사용자가 버튼을 한 번 더 눌러 직접 들어가는 방식 유지. (InspectionPage 내부 모달들도 같은 흐름 — 팝업 사라지면 이미 모달 안이니 그대로 점검 가능.)

### 호환성 감사 — 반드시 실행

```bash
grep -n "showDupAlert\|dupAlertApplied" cha-bio-safety/src/pages/InspectionPage.tsx
# 모든 선언과 참조가 이 Task 이후 0건이어야 함

grep -n "monthRecords\[" cha-bio-safety/src/pages/InspectionPage.tsx
# monthRecords 타입 확장 후에도 기존 truthy 체크가 깨지지 않는지 확인
# 만약 monthRecords[cpId] 를 직접 CheckResult 처럼 쓰는 곳이 남아 있으면 ?.result 로 교체
```

### 건드리지 말 것

- 소화기 로직, 소화기 리스트 오버레이(line 3243 `showExtList`), 화재알림 모달, CCTV 모달, Resolution/Detail 모달, Desktop 전용 렌더, Summary Card.
- DIV 트렌드 서브뷰, 컴프레셔 drain 로그 표시 로직.
- 저장 API 호출/DB 기록/세션 생성 로직 일체.
  </action>
  <verify>
    <automated>
cd cha-bio-safety && npx tsc --noEmit 2>&1 | tail -30 && \
grep -c "showDupAlert\|dupAlertApplied" cha-bio-safety/src/pages/InspectionPage.tsx | grep -q "^0$" && echo "OK: dup-alert residue=0" || echo "FAIL: dup-alert residue remains"
    </automated>
    추가:
    - `grep -n "InspectionRevisitPopup" cha-bio-safety/src/pages/InspectionPage.tsx` → 최소 9회 (9개 모달).
    - `grep -n "useInspectionRevisitPopup" cha-bio-safety/src/pages/InspectionPage.tsx` → 최소 8회 (CctvModal, FireAlarmModal 제외).
    - `grep -n "InspectionRevisitPopup\|useInspectionRevisitPopup" cha-bio-safety/src/pages/FloorPlanPage.tsx` → 최소 1회.
    - CCTV·FireAlarm 모달 함수 본문 내부 (line 376-534, 4215 이후) 에는 `InspectionRevisitPopup` 이 등장하지 않아야 함.
  </verify>
  <done>
    - `npm run build` (또는 `npx tsc --noEmit`) 컴파일 에러 0.
    - 9개 모달 모두 공통 컴포넌트/훅 사용 (CCTV·화재수신반 제외).
    - 기존 dup-alert state/JSX 잔존 0건.
    - FloorPlan 마커 '점검 기록 입력' 경로에서도 팝업 판정이 동작.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: 프로덕션 배포 후 9개 카테고리 재진입 팝업 동작 검증</name>
  <what-built>
    공통 `InspectionRevisitPopup` + `useInspectionRevisitPopup` 훅을 InspectionPage 9개 카테고리 모달과 FloorPlanPage 마커 진입 경로에 적용. CCTV·화재수신반은 의도적으로 제외. 완료 판정 기준은 이번 달 schedule_items 점검 기간 내 기록 유무. 주의/불량 미조치(status=open) 개소는 조치 관리 페이지로 이동 유도.
  </what-built>
  <how-to-verify>
    **0. 프로덕션 배포**
    ```bash
    cd cha-bio-safety
    npm run deploy -- --branch production
    ```
    (로컬 dev 서버에서 테스트하지 말 것 — 사용자 메모 `feedback_deploy_test.md` 준수)

    **1. 선행 조건 셋업 (필요 시 테스트 데이터 준비)**
    - 이번 달 schedule_items 에 `category='inspect'`, `inspectionCategory='소화기'` (또는 테스트할 카테고리) 일정이 **오늘 날짜 포함 기간**으로 등록돼 있는지 확인. 없으면 일정 페이지(`/schedule`)에서 추가.
    - 미조치 개소 시나리오용으로 특정 개소에 '주의' 또는 '불량' 기록을 남겨 둔다 (아직 조치 안 한 상태).

    **2. 팝업 (가) — 완료 정상 개소 재진입 (최소 2개 카테고리에서 반복)**
    - 카테고리 A: 소화기(제네릭 InspectionModal 경로) 와 카테고리 B: DIV(DivModal 전용 경로) 두 곳에서 각각:
      1. 이번 달 점검 기간 내에 정상 저장된 개소를 하나 고른다.
      2. 그 개소의 QR 을 스캔하거나, 점검 모달에서 스와이프/피커로 이동해서 다시 진입.
      3. **기대:** 화면 **상단 헤더와 하단 저장버튼은 보이되** 본문 영역에 부분 오버레이가 뜨면서 "`YYYY-MM-DD HH:mm`에 `이름`이 이미 점검한 개소입니다." + '확인' 버튼 1개.
      4. 확인 버튼 누르면 오버레이 사라지고 점검 화면으로 돌아옴. 이 상태에서 저장하면 DB 규칙대로 UNIQUE 있으면 덮어쓰기 / 없으면 추가 기록됨.

    **3. 팝업 (나) — 미조치 개소 재진입**
    - 주의/불량 + 미조치(status=open) 인 개소에 같은 방식으로 재진입.
    - **기대:** "`YYYY-MM-DD HH:mm`에 `이름`에 의해 조치 대기중인 개소입니다. 조치 내용을 입력하시겠습니까?" + '이동' / '취소' 버튼.
    - '취소' → 팝업만 닫힘, 점검 화면 잔류. 저장 가능.
    - '이동' → `/remediation/{recordId}` 로 이동, 해당 개소 조치 상세 페이지가 열림.

    **4. 우선순위 — (가)+(나) 공존 시**
    - 같은 카테고리/개소에 정상 기록도 있고 미조치 기록도 있는 상태를 테스트 (두 번 점검해서 과거엔 정상, 최근엔 주의로 찍혀 미조치 상태). 재진입 시 **(나) 팝업이 뜨는지** 확인.

    **5. 제외 카테고리**
    - CCTV 모달, 화재수신반 모달에 재진입 — 팝업 절대 안 뜸.

    **6. 엣지 케이스**
    - '접근불가' 개소: 자동 스킵 — 팝업 없이 자연스럽게 건너감 (기존 동작 유지 확인).
    - schedule_items 일정을 이번 달에서 모두 제거 → 이미 저장된 기록이 있어도 팝업 안 뜸.
    - 이번 달 schedule_items 기간을 어제까지로 끝내 놓고, 오늘 저장된 기록이 있는 개소에 재진입 → **팝업 안 뜸** (기간 밖 기록은 완료로 안 침).

    **7. 진입 경로 커버리지**
    - QR 스캔 진입 → 팝업 뜸.
    - 점검 모달에서 스와이프(피커) 이동 → 팝업 뜸.
    - 점검 모달에서 직접 개소 탭 → 팝업 뜸.
    - FloorPlan 페이지에서 마커 선택 → '점검 기록 입력' 버튼 클릭 → 조건 맞으면 팝업 뜸.

    **8. 시각적 일관성**
    - 9개 모달 전부 **같은 스타일**(소화기 방식 부분 오버레이) — 이전처럼 DIV/Compressor 가 풀스크린 다크 오버레이로 뜨는 일이 없어야 함.

    문제 발견 시 어떤 모달/시나리오에서 어떻게 다른지 구체적으로 알려 주세요.
  </how-to-verify>
  <resume-signal>"approved" 또는 구체적 이슈 리포트</resume-signal>
</task>

</tasks>

<verification>
- TypeScript 컴파일: `cd cha-bio-safety && npx tsc --noEmit` → 에러 0.
- 빌드: `cd cha-bio-safety && npm run build` → 성공.
- 잔존 레거시 dup-alert 0건: `grep -c "showDupAlert" cha-bio-safety/src/pages/InspectionPage.tsx` → 0.
- 공통 컴포넌트 9회 이상 호출: `grep -c "InspectionRevisitPopup" cha-bio-safety/src/pages/InspectionPage.tsx` ≥ 9.
- 훅 8회 이상 호출: `grep -c "useInspectionRevisitPopup" cha-bio-safety/src/pages/InspectionPage.tsx` ≥ 8.
- API 응답 `staffName` 포함: `grep -n "staff_name" cha-bio-safety/functions/api/inspections/records.ts` → SELECT 와 매핑 둘 다 있음.
- CCTV·화재수신반 모달 본문에 `InspectionRevisitPopup` 미등장.
</verification>

<success_criteria>
- 사용자가 Task 3 체크포인트에서 "approved" 응답.
- 잠긴 결정의 문구/버튼/우선순위/제외 대상이 코드와 실동작 양쪽에서 모두 준수됨.
- 범위 밖 리팩토링 0건 (운영 관찰 모드 준수).
- `npm run deploy -- --branch production` 으로 프로덕션 배포 완료, Preview 로 가지 않았음 (`feedback_deploy_branch.md` 준수).
</success_criteria>

<output>
작업 완료 후 `.planning/quick/260423-htx-inspection-revisit-popup/260423-htx-SUMMARY.md` 작성.

SUMMARY 에 반드시 포함할 것:
- 변경된 파일 5개 목록과 각 파일의 diff 요약 라인 수.
- 9개 모달 중 어떤 모달이 "기존 팝업 교체" 였고 어떤 모달이 "신규 추가" 였는지 표.
- API 응답 형태 변경 전/후 (staffName 추가).
- 잠긴 결정 4단계(1단계 DB / 2단계 정책 / 3단계 UX / 4단계 엣지) 가 코드에 어떻게 반영됐는지 매핑 표.
- 발견된 예상 외 이슈(있다면)와 처리 방식.
- 프로덕션 배포 URL 과 배포 시각.
- 추가 제안 (있다면 — 예: staffName fallback 로직, schedule_items 미등록 상태에서의 UX 안내 등) — 본 작업 범위 밖이므로 메모로만 남기고 구현 금지.
</output>
