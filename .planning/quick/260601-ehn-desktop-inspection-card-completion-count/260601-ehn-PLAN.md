---
phase: quick-260601-ehn
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/pages/InspectionPage.tsx
autonomous: true
requirements: [DESKTOP-INSP-CARD-01]

must_haves:
  truths:
    - "데스크톱 점검 관리 뷰의 특별피난계단 카드가 '점검완료 50' + 초록(bg-safe-bar) 막대로 표시된다"
    - "데스크톱 카드의 완료 숫자/막대색이 모바일 카테고리 그리드와 모든 카테고리에서 동일하다(유도등 마커·DIV/컴프 반월 사이클 포함)"
    - "모바일 카테고리 그리드의 완료 숫자/막대색이 변경 전과 100% 동일하다(무회귀)"
    - "우측 내역/상세 패널과 불량/주의/이슈없음 배지는 기존 remediationApi.list 레코드 기준 그대로 유지된다"
  artifacts:
    - path: "cha-bio-safety/src/pages/InspectionPage.tsx"
      provides: "공유 per-category 완료 계산 함수 computeCategoryCounts + 모바일/데스크톱 동일 경로 사용"
      contains: "function computeCategoryCounts"
  key_links:
    - from: "모바일 그리드 (L5163 부근)"
      to: "computeCategoryCounts"
      via: "동일 함수 호출로 total/doneCnt 산출"
      pattern: "computeCategoryCounts"
    - from: "DesktopInspectionView groupCounts"
      to: "computeCategoryCounts"
      via: "부모가 props 로 전달한 allCheckpoints/scheduleItems/markerRecords/monthRecordDates/glMarkerCount 입력"
      pattern: "computeCategoryCounts"
---

<objective>
데스크톱 점검 관리 뷰(`DesktopInspectionView`)의 카테고리 카드 완료 집계(표시 숫자 + 막대 분모 + 막대 색)를 모바일 카테고리 그리드와 **완전 동일한 결과**로 정정한다.

문제: 데스크톱은 `remediationApi.list`(check_records 평면 목록)의 고유 위치 조합 수(`uniqueSites.size`)를 완료로 세고, 막대도 `getCatBarClass(레코드수, 고유위치수)` 처럼 단위가 다른 분자/분모를 넘긴다. 특별피난계단은 체크포인트 50개가 고유 위치 19개로 접혀 "점검완료 19" + 주황 막대(19/50≈38%)로 표시되고, 50개 모두 점검해도 절대 100%(초록)에 닿지 못한다.

해결: 모바일이 쓰는 per-category 완료 계산(`isCpCompleted` 단일 진실원천 → `computeCardCompletion` / 유도등 마커 / DIV·컴프 반월 사이클)을 **순수 공유 함수로 추출**해 모바일·데스크톱이 동일 경로를 쓰게 한다 → 구조적 드리프트 0.

Purpose: 사용자 확정 요구("데스크톱 카드를 모바일과 완전 일치"). 메모리 룰 — isCpCompleted 가 점검 완료 단일 진실원천, 새 화면/통계는 이 룰 강제.
Output: 모바일 무회귀 + 데스크톱 카드 정정 (특별피난계단 50/50 초록).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md

핵심 파일: `cha-bio-safety/src/pages/InspectionPage.tsx`

## 코드 사실 (이미 확인됨 — 추측 금지, 아래 인용을 진실로 사용)

### 1. 완료 단일 진실원천 (L36~42)
```ts
const isCpCompleted = (entry: MonthRecordEntry | undefined): boolean =>
  entry?.result === 'normal' ||
  entry?.result === 'caution' ||
  (entry?.result === 'bad' && entry?.status === 'resolved')
```

### 2. 막대 색 함수 (L113~120) — 변경 없음, 입력만 바로잡으면 됨
```ts
function getCatBarClass(total: number, doneCnt: number): string {
  if (total === 0) return ''
  const pct = (doneCnt / total) * 100
  if (pct === 0)   return 'bg-text-tertiary/40'
  if (pct < 50)    return 'bg-warning-bar'
  if (pct < 100)   return 'bg-accent'
  return 'bg-safe-bar'
}
```

### 3. 모바일 그리드 per-category 완료 계산 (L5163~5186, IIFE 안)
```tsx
const _n = new Date()
const _todayForCycle = `${_n.getFullYear()}-${String(_n.getMonth()+1).padStart(2,'0')}-${String(_n.getDate()).padStart(2,'0')}`
return CATEGORY_GROUPS.map((g, idx) => {
  const isGL    = g.categories.includes('유도등')
  const cps     = allCheckpoints.filter(cp => g.categories.includes(cp.category))
  const total   = isGL ? glMarkerCount : cps.length
  let doneCnt: number
  if (isGL) {
    const glSchedDone = scheduleItems.some(s =>
      s.category === 'inspect' && s.inspectionCategory === '유도등' && s.status === 'done')
    doneCnt = glSchedDone ? total : Object.keys(markerRecords).length
  } else {
    doneCnt = computeCardCompletion({ cps, monthRecordDates, today: _todayForCycle })
  }
  const allDone = total > 0 && doneCnt >= total
  ...
  const barClass = getCatBarClass(total, doneCnt)
  ...
})
```
즉 모바일 완료 계산에 필요한 입력 = `allCheckpoints, scheduleItems, markerRecords, monthRecordDates, glMarkerCount` + (cycle 분기용) today.

### 4. computeCardCompletion 시그니처 (utils/inspectionProgress.ts)
```ts
export function computeCardCompletion(options: {
  cps: CheckPoint[]
  monthRecordDates: Record<string, string[]>
  today?: string
}): number   // DIV/컴프만 반월 윈도우, 그 외 월 전체. 유도등은 호출자가 처리.
```
import 됨: `import { computeCardCompletion } from '../utils/inspectionProgress'` (L18)

### 5. 부모 InspectionPage 가 이미 보유한 상태 (데스크톱 분기 전에 전부 로드됨)
- `allCheckpoints` (L4669, getCheckpoints), `glMarkerCount` (L4670, listAll('guidelamp').length)
- `monthRecordDates` (L4682, loadTodayRecords 가 isCpCompleted 동일 기준으로 cp.id 별 날짜 적재)
- `markerRecords` (L4684), `scheduleItems` (L4698, useQuery schedule-month)
- 데스크톱 early return(L4971~4980)은 이 모든 hook/effect **이후**에 위치 → 데스크톱에서도 값이 채워져 있음. 추가 쿼리 불필요.

### 6. DesktopInspectionView 현재 시그니처 (L5730~5739)
```tsx
function DesktopInspectionView({
  categoryIdx, setCategoryIdx, recordId, setRecordId, dateFilter, setDateFilter,
}: { categoryIdx: number|null; setCategoryIdx: (i:number|null)=>void; recordId: string|null
   setRecordId: (id:string|null)=>void; dateFilter: number; setDateFilter: (d:number)=>void })
```

### 7. 데스크톱 groupCounts — 교체 대상 (L5757~5770)
```tsx
const groupCounts = useMemo(() => {
  return CATEGORY_GROUPS.map(g => {
    const matches = allRecords.filter(r => g.categories.includes(r.category))
    const uniqueSites = new Set(matches.map(r => `${r.zone}|${r.floor}|${r.location}|${r.category}`))
    return {
      total:    matches.length,            // ← 막대 분모 (잘못됨)
      completed: uniqueSites.size,          // ← 표시 숫자 + 막대 분자 (잘못됨)
      bad:      matches.filter(r => r.result === 'bad').length,      // ← 유지
      caution:  matches.filter(r => r.result === 'caution').length,  // ← 유지
      open:     matches.filter(r => r.status === 'open').length,     // ← 유지
    }
  })
}, [allRecords])
```
`allRecords = remediationApi.list(...)` (L5748~5754) — **우측 패널/배지용으로 그대로 유지**. bad/caution/open 집계는 이 레코드 기준 유지. total/completed 만 모바일 경로로 교체.

### 8. 데스크톱 카드 렌더 (L5825~5870) — completed/total/barClass 소비처
```tsx
const c = groupCounts[idx]
const barClass = getCatBarClass(c.total, c.completed)
...
{c.total > 0 && <div className={`... ${barClass}`} />}
...
{c.completed > 0 && <span className="... text-safe bg-safe-bg ...">✓ 점검완료 {c.completed}</span>}
```

### 9. 데스크톱 렌더 호출 (L4972~4979) — props 전달 지점
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: per-category 완료 계산을 순수 공유 함수 computeCategoryCounts 로 추출하고 모바일 그리드를 그 함수로 무회귀 치환</name>
  <files>cha-bio-safety/src/pages/InspectionPage.tsx</files>
  <action>
모바일 그리드(L5163~5186)의 per-category `total`/`doneCnt` 산출 로직을 모듈 최상위(컴포넌트 밖, 예: getCatBarClass 정의 L120 직후)에 순수 함수로 추출한다. 시그니처:

```ts
// 카테고리 1개의 완료 집계 — 모바일 그리드/데스크톱 카드 공유 단일 경로.
// 완료 단일 진실원천(isCpCompleted)을 따르는 computeCardCompletion / 유도등 마커 /
// DIV·컴프 반월 사이클을 그대로 캡슐화한다. 드리프트 0 보장.
function computeCategoryCounts(
  g: { categories: string[] },
  ctx: {
    allCheckpoints: CheckPoint[]
    scheduleItems: ScheduleItem[]
    markerRecords: Record<string, CheckResult>
    monthRecordDates: Record<string, string[]>
    glMarkerCount: number
    today: string
  }
): { total: number; doneCnt: number } {
  const isGL = g.categories.includes('유도등')
  const cps  = ctx.allCheckpoints.filter(cp => g.categories.includes(cp.category))
  const total = isGL ? ctx.glMarkerCount : cps.length
  let doneCnt: number
  if (isGL) {
    const glSchedDone = ctx.scheduleItems.some(s =>
      s.category === 'inspect' && s.inspectionCategory === '유도등' && s.status === 'done')
    doneCnt = glSchedDone ? total : Object.keys(ctx.markerRecords).length
  } else {
    doneCnt = computeCardCompletion({ cps, monthRecordDates: ctx.monthRecordDates, today: ctx.today })
  }
  return { total, doneCnt }
}
```

주의: `s.category`/`s.inspectionCategory` 타입은 기존 모바일 인라인 코드와 동일하게 동작해야 한다 — 만약 ScheduleItem 타입에 inspectionCategory 가 없어 tsc 오류가 나면, 기존 인라인이 통과하던 형태(예: `(s as any)` 가 아닌 그대로)를 그대로 복사한다. tsc 가 통과하던 원본 표현을 1:1 보존할 것. strict:false 프로젝트이므로 원본이 통과했다면 추출본도 통과한다.

그런 다음 모바일 그리드(L5163~5186)를 이 함수 호출로 치환한다. IIFE 의 `_todayForCycle` 계산은 유지(또는 함수 밖에서 한 번 계산)하고, 각 카테고리에서:
```tsx
const { total, doneCnt } = computeCategoryCounts(g, {
  allCheckpoints, scheduleItems, markerRecords, monthRecordDates, glMarkerCount,
  today: _todayForCycle,
})
const isGL = g.categories.includes('유도등')   // hasItems 분기에 여전히 필요하면 유지
```
이후 `total`/`doneCnt` 를 쓰는 나머지 줄(`allDone`, `hasItems`, `barClass = getCatBarClass(total, doneCnt)`, 표시 문자열 `${doneCnt}/${total}` 등)은 **그대로** 둔다. 즉 모바일 렌더 결과(숫자/색/✓완료/없음/N개 분기)는 한 글자도 안 바뀌어야 한다.

D-차원 무회귀가 핵심: 추출은 리팩터링일 뿐 모바일 동작 변경이 아니다.
  </action>
  <verify>
    <automated>cd cha-bio-safety && npx tsc --noEmit 2>&1 | tail -20</automated>
  </verify>
  <done>
- `function computeCategoryCounts` 가 모듈 최상위에 존재하고 isGL/markerRecords/computeCardCompletion 분기를 모두 포함.
- 모바일 그리드가 이 함수를 호출해 total/doneCnt 를 얻는다.
- 모바일 렌더의 barClass/표시 문자열/allDone/hasItems 로직은 변경 전과 의미적으로 동일(같은 입력→같은 출력).
- `npx tsc --noEmit` PASS.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: DesktopInspectionView 에 완료 계산 입력을 props 로 전달하고 groupCounts 의 total/completed/막대를 공유 함수 결과로 교체 (이슈 배지/우측 패널 유지)</name>
  <files>cha-bio-safety/src/pages/InspectionPage.tsx</files>
  <action>
**A. props 추가.** `DesktopInspectionView` 시그니처(L5730~5739)에 완료 계산 입력 5개를 추가한다:
```tsx
function DesktopInspectionView({
  categoryIdx, setCategoryIdx, recordId, setRecordId, dateFilter, setDateFilter,
  allCheckpoints, scheduleItems, markerRecords, monthRecordDates, glMarkerCount,
}: {
  categoryIdx: number | null
  setCategoryIdx: (idx: number | null) => void
  recordId: string | null
  setRecordId: (id: string | null) => void
  dateFilter: number
  setDateFilter: (d: number) => void
  allCheckpoints: CheckPoint[]
  scheduleItems: ScheduleItem[]
  markerRecords: Record<string, CheckResult>
  monthRecordDates: Record<string, string[]>
  glMarkerCount: number
}) {
```

**B. 렌더 호출(L4972~4979)에서 부모 상태를 전달.** 부모 InspectionPage 는 이 5개 값을 이미 보유(allCheckpoints/glMarkerCount/markerRecords/monthRecordDates state, scheduleItems useQuery). early return 이 hook 이후이므로 값이 채워져 있다:
```tsx
return <DesktopInspectionView
  categoryIdx={desktopCategoryIdx}
  setCategoryIdx={setDesktopCategoryIdx}
  recordId={desktopRecordId}
  setRecordId={setDesktopRecordId}
  dateFilter={desktopDateFilter}
  setDateFilter={setDesktopDateFilter}
  allCheckpoints={allCheckpoints}
  scheduleItems={scheduleItems}
  markerRecords={markerRecords}
  monthRecordDates={monthRecordDates}
  glMarkerCount={glMarkerCount}
/>
```

**C. groupCounts 교체(L5757~5770).** total/completed 를 공유 함수로, bad/caution/open 은 기존 remediation 레코드 기준 유지:
```tsx
const groupCounts = useMemo(() => {
  const _n = new Date()
  const today = `${_n.getFullYear()}-${String(_n.getMonth()+1).padStart(2,'0')}-${String(_n.getDate()).padStart(2,'0')}`
  return CATEGORY_GROUPS.map(g => {
    const { total, doneCnt } = computeCategoryCounts(g, {
      allCheckpoints, scheduleItems, markerRecords, monthRecordDates, glMarkerCount, today,
    })
    const matches = allRecords.filter(r => g.categories.includes(r.category))
    return {
      total,                 // 막대 분모 = 모바일과 동일 (체크포인트/마커 단위)
      completed: doneCnt,    // 표시 숫자 + 막대 분자 = 모바일과 동일
      bad:      matches.filter(r => r.result === 'bad').length,      // 유지
      caution:  matches.filter(r => r.result === 'caution').length,  // 유지
      open:     matches.filter(r => r.status === 'open').length,     // 유지
    }
  })
}, [allRecords, allCheckpoints, scheduleItems, markerRecords, monthRecordDates, glMarkerCount])
```
deps 배열에 새 입력 5개를 반드시 추가(누락 시 stale).

**D. 카드 렌더(L5825~5870) 변경 없음.** `getCatBarClass(c.total, c.completed)` 는 이제 같은 단위(분모=total, 분자=doneCnt)를 받으므로 특별피난계단 50/50 → 100% → `bg-safe-bar`(초록), `✓ 점검완료 50` 으로 자동 정정된다. `c.completed > 0` 배지 조건과 표시 텍스트 마크업은 그대로 둔다(숫자만 50으로 바뀜). 우측 내역 목록(categoryRecords, L5773~5780)·상세 패널·불량/주의/이슈없음 배지는 손대지 않는다.

주의: `remediationApi.list` useQuery 와 `allRecords` 는 우측 패널/배지용으로 **삭제하지 말 것**. groupCounts 안에서 bad/caution/open 집계에 계속 쓰인다.
  </action>
  <verify>
    <automated>cd cha-bio-safety && npx tsc --noEmit 2>&1 | tail -20</automated>
  </verify>
  <done>
- DesktopInspectionView 가 allCheckpoints/scheduleItems/markerRecords/monthRecordDates/glMarkerCount props 를 받고, 부모 렌더 호출이 이를 전달.
- groupCounts.total = computeCategoryCounts(...).total, groupCounts.completed = ...doneCnt; bad/caution/open 은 allRecords 기준 유지.
- useMemo deps 에 새 입력 5개 포함.
- `remediationApi.list` / allRecords / 우측 패널 / 배지 로직 미변경.
- `npx tsc --noEmit` PASS.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: 빌드 + 정적 검증 (데스크톱 정정 + 모바일 무회귀)</name>
  <files>cha-bio-safety/src/pages/InspectionPage.tsx</files>
  <action>
프로덕션 빌드와 정적 검증으로 회귀 없음을 확인한다.

1. `cd cha-bio-safety && npm run build` 가 PASS 하는지 확인.

2. 정적 회귀 검증 (모바일 그리드가 추출 후에도 동일 입력을 쓰는지):
   - 모바일 그리드와 데스크톱 groupCounts 가 **동일 함수** `computeCategoryCounts` 를 호출하는지 grep 으로 확인 (2곳 이상 호출).
   - `getCatBarClass` 정의(L113~120)는 변경되지 않았는지 확인.
   - 데스크톱에서 `uniqueSites` 기반 completed 계산이 완전히 제거됐는지 확인(잔존하면 안 됨).

3. 데스크톱 정정 결과를 코드 추론으로 명시(런타임 확인은 사용자 배포 후 몫):
   - 특별피난계단: total = cps.length = 50 (DB 검증 50개 체크포인트), doneCnt = computeCardCompletion(50개 모두 당월 완료 시) = 50 → getCatBarClass(50,50)=100%→`bg-safe-bar`, 배지 `✓ 점검완료 50`.
   - 유도등: total=glMarkerCount, doneCnt= glSchedDone?total:markerRecords 키 수 → 모바일과 동일 식.
   - DIV: computeCardCompletion 이 반월 윈도우 분기 → 모바일과 동일 식.

4. (선택) 로컬에서 데스크톱 폭으로 확인 가능하면 `npm run dev` 로 점검 관리 진입 → 특별피난계단 카드가 점검완료 50 + 초록인지, 동일 화면 모바일 폭에서 카테고리 그리드 숫자/색이 변경 전과 같은지 육안 확인. 환경상 불가하면 step 2~3 정적 검증으로 갈음하고 SUMMARY 에 "런타임 확인은 사용자 배포 검증 단계로 위임" 명시.

배포는 이 PLAN 범위 밖(사용자가 별도 확인). 코드 수정 + tsc + build 까지만.
  </action>
  <verify>
    <automated>cd cha-bio-safety && npx tsc --noEmit && npm run build 2>&1 | tail -8 && echo "=== shared-fn callers (expect >=2) ===" && grep -c "computeCategoryCounts(" src/pages/InspectionPage.tsx && echo "=== desktop uniqueSites removed (expect 0) ===" && grep -c "uniqueSites" src/pages/InspectionPage.tsx</automated>
  </verify>
  <done>
- `npx tsc --noEmit` PASS, `npm run build` PASS.
- `computeCategoryCounts(` 호출 2회 이상 (모바일 그리드 + 데스크톱 groupCounts).
- `uniqueSites` 잔존 0 (데스크톱 고유위치 기반 완료 계산 완전 제거).
- `getCatBarClass` 정의 미변경.
- SUMMARY 에 특별피난계단 50/50 초록 정정 + 모바일 무회귀 근거 기록, 런타임 시각 확인은 사용자 배포 검증으로 위임 명시.
  </done>
</task>

</tasks>

<verification>
- `cd cha-bio-safety && npx tsc --noEmit` PASS
- `cd cha-bio-safety && npm run build` PASS
- `grep -c "computeCategoryCounts(" cha-bio-safety/src/pages/InspectionPage.tsx` >= 2
- `grep -c "uniqueSites" cha-bio-safety/src/pages/InspectionPage.tsx` == 0
- 모바일 그리드 렌더 로직(allDone/hasItems/표시 문자열/barClass)이 추출 전과 의미적으로 동일 (무회귀)
- 데스크톱 우측 패널·불량/주의/이슈없음 배지는 remediationApi.list 기준 그대로
</verification>

<success_criteria>
- 데스크톱 점검 관리 카드의 completed(표시 숫자) / total(막대 분모) / 막대색이 모바일 카테고리 그리드와 모든 카테고리에서 동일 결과.
- 특별피난계단 데스크톱 카드 = "점검완료 50" + 초록(bg-safe-bar) 막대 (50개 당월 완료 기준).
- 유도등(마커 기반) / DIV·컴프(반월 사이클) 특수 케이스도 모바일과 일치.
- 모바일 화면 결과 100% 무회귀.
- tsc + build PASS. 배포는 범위 밖(사용자 별도 확인).
</success_criteria>

<output>
After completion, create `.planning/quick/260601-ehn-desktop-inspection-card-completion-count/260601-ehn-SUMMARY.md`
</output>
