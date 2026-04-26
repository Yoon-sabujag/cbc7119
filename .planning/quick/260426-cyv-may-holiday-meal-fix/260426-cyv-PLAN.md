---
quick_id: 260426-cyv
slug: may-holiday-meal-fix
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/utils/holidays.ts        # NEW — 공통 fallback 공휴일 맵
  - cha-bio-safety/src/utils/shiftCalc.ts       # 라이브러리 + fallback 둘 다 체크
  - cha-bio-safety/src/utils/mealCalc.ts        # 시그니처 확장 (isHoliday, isPrevDayHoliday)
  - cha-bio-safety/src/pages/SchedulePage.tsx   # 자체 HOLIDAYS_FALLBACK 제거 → import
  - cha-bio-safety/src/pages/StaffServicePage.tsx # fallback 제거 + mealCalc 호출 5곳 보정
autonomous: false   # 마지막 deploy + 5월 캘린더 시각 검증 checkpoint 포함
requirements:
  - QUICK-260426-cyv  # 5/1 노동절 인식 + 평일공휴일/공휴일직후토요일 식대 보정

must_haves:
  truths:
    - "2026-05-01 (금) 캘린더가 SchedulePage / StaffServicePage 모두 '휴'/공휴일로 표시된다"
    - "2026-05-01 (금) 주간(주) 사이클인 직원이 라이브러리 fallback 상황에서도 '휴'로 변환된다"
    - "평일 공휴일에 당직(당)을 선 직원의 그날 제공식수가 0으로 떨어지고, 주말식대 11,000원이 잡힌다"
    - "공휴일 다음 날(토)에 당직(당)을 선 직원의 토요일 식대가 5,500원이 아니라 11,000원으로 잡힌다 (식당 문 닫음 → 점심도 외부)"
    - "기존 일요일 당직 11,000원 / 평일 토요일 당직 5,500원 / 평일 당직 0원 로직은 그대로 유지된다 (기존 케이스 회귀 없음)"
  artifacts:
    - path: cha-bio-safety/src/utils/holidays.ts
      provides: "HOLIDAYS_FALLBACK 단일 소스 (2026-05-01: 근로자의 날 포함)"
      exports: ["HOLIDAYS_FALLBACK", "isFallbackHoliday"]
    - path: cha-bio-safety/src/utils/shiftCalc.ts
      provides: "isKoreanHolidayOrWeekend (라이브러리 + fallback 둘 다 체크)"
    - path: cha-bio-safety/src/utils/mealCalc.ts
      provides: "calcProvidedMeals / calcWeekendAllowance (isHoliday, isPrevDayHoliday 옵션)"
  key_links:
    - from: cha-bio-safety/src/pages/SchedulePage.tsx
      to:   cha-bio-safety/src/utils/holidays.ts
      via:  "import { HOLIDAYS_FALLBACK } from '../utils/holidays'"
      pattern: "from '../utils/holidays'"
    - from: cha-bio-safety/src/pages/StaffServicePage.tsx
      to:   cha-bio-safety/src/utils/holidays.ts
      via:  "import { HOLIDAYS_FALLBACK } from '../utils/holidays'"
      pattern: "from '../utils/holidays'"
    - from: cha-bio-safety/src/utils/shiftCalc.ts
      to:   cha-bio-safety/src/utils/holidays.ts
      via:  "isFallbackHoliday(date) OR HOLIDAYS_FALLBACK lookup"
      pattern: "from './holidays'"
    - from: cha-bio-safety/src/pages/StaffServicePage.tsx (monthlySummary + calendarDays + selCell allowance)
      to:   cha-bio-safety/src/utils/mealCalc.ts
      via:  "calcProvidedMeals/calcWeekendAllowance(...) 에 isHoliday, isPrevDayHoliday 전달"
      pattern: "calcProvidedMeals\\(|calcWeekendAllowance\\("
---

<objective>
**5월 노동절(5/1) 공휴일 인식 버그 + 식대 계산 누락 보정.**

**문제:**
1. `@hyunbinseo/holidays-kr` 라이브러리는 근로자의날(5/1)을 법정공휴일로 보지 않아, `shiftCalc.isKoreanHolidayOrWeekend`가 false 를 리턴 → 5/1 주간 사이클 직원이 '휴'로 안 떨어짐.
2. `SchedulePage` / `StaffServicePage` 의 fallback 맵에도 5/1 이 없음.
3. `mealCalc` 가 공휴일 정보를 모름:
   - 평일 공휴일 당직자에게 식대 0 + 주말식대 11,000원이 잡혀야 하는데 식당 2끼(평일 처리)로 잘못 카운트됨
   - 공휴일 직후 토요일은 식당이 점심도 안 열므로 그 토요일 당직자에게 5,500원이 아니라 11,000원이 잡혀야 함 (현재는 5,500원만)

**Purpose:** 5월 법정점검 실전 검증 시즌(2026-05)에 직원 식대 정산이 정확히 나가도록 한다. 운영 관찰 모드 — 신규 기능 아님, 기존 운영 정확도 보강.

**Output:**
- 공통 `utils/holidays.ts` (단일 fallback 소스, 5/1 노동절 추가)
- `shiftCalc.isKoreanHolidayOrWeekend` 가 fallback 도 체크
- `mealCalc` 두 함수에 `isHoliday`, `isPrevDayHoliday` 옵션 추가 (기본값 false → 100% 호환)
- `SchedulePage` / `StaffServicePage` 자체 fallback 제거 + StaffServicePage 의 mealCalc 호출 5곳 보정
- 프로덕션 배포 후 5월 화면 검증 완료
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@/Users/jykevin/Documents/20260328/CLAUDE.md
@/Users/jykevin/Documents/20260328/.planning/STATE.md
@/Users/jykevin/Documents/20260328/cha-bio-safety/src/utils/shiftCalc.ts
@/Users/jykevin/Documents/20260328/cha-bio-safety/src/utils/mealCalc.ts

# 호출부 컨텍스트 (이미 분석 완료, 다시 grep 할 필요 없음)
# - SchedulePage.tsx:21-70  자체 HOLIDAYS_FALLBACK (3년치, 5/1 없음)
#   line 194: const holidays = fetchedHolidays ?? HOLIDAYS_FALLBACK
# - StaffServicePage.tsx:42-72  자체 HOLIDAYS_FALLBACK (3년치, 5/1 없음)
#   line 399-412: holidayMap (DB 우선, 없으면 HOLIDAYS_FALLBACK)
#   line 624, 628: monthlySummary 안 calcProvidedMeals / calcWeekendAllowance
#   line 664: calendarDays 안 calcProvidedMeals
#   line 1060: selCell.rawShift 의 calcWeekendAllowance (모바일)
#   line 1707: selCell.rawShift 의 calcWeekendAllowance (데스크톱)

<interfaces>
# 기존 mealCalc 시그니처 (확장 대상)
```typescript
export function calcProvidedMeals(
  rawShift: RawShift,
  leaveType: string | undefined,
  dayOfWeek: number
): number

export function calcWeekendAllowance(
  rawShift: RawShift,
  dayOfWeek: number
): number
```

# 신규/확장 타깃 시그니처
```typescript
// utils/holidays.ts (NEW)
export const HOLIDAYS_FALLBACK: Record<string, string>
export function isFallbackHoliday(date: Date): boolean

// utils/mealCalc.ts (확장 — 옵션 인자 추가, 기본값 false 로 호환성 유지)
export function calcProvidedMeals(
  rawShift: RawShift,
  leaveType: string | undefined,
  dayOfWeek: number,
  isHoliday?: boolean,         // NEW (기본 false)
  isPrevDayHoliday?: boolean   // NEW (기본 false) — 토요일에서만 의미 있음
): number

export function calcWeekendAllowance(
  rawShift: RawShift,
  dayOfWeek: number,
  isHoliday?: boolean,         // NEW (기본 false)
  isPrevDayHoliday?: boolean   // NEW (기본 false) — 토요일에서만 의미 있음
): number
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: 공통 holidays 모듈 신설 + shiftCalc/SchedulePage/StaffServicePage wiring</name>
  <files>
    cha-bio-safety/src/utils/holidays.ts (NEW)
    cha-bio-safety/src/utils/shiftCalc.ts
    cha-bio-safety/src/pages/SchedulePage.tsx
    cha-bio-safety/src/pages/StaffServicePage.tsx
  </files>
  <action>
**Step 1 — `cha-bio-safety/src/utils/holidays.ts` 신설:**

기존 `SchedulePage.tsx` 의 HOLIDAYS_FALLBACK 객체(라인 21-70)를 그대로 옮기되, **2026 섹션에 `'2026-05-01': '근로자의 날',` 한 줄을 추가**한다. 같은 파일에 헬퍼도 export:

```typescript
// cha-bio-safety/src/utils/holidays.ts
// 라이브러리(@hyunbinseo/holidays-kr)가 누락하는 케이스 + 외부 API 실패 시 fallback
// 외부 API: holidays.hyunbin.page (StaffServicePage 의 holidayApi 가 cron 으로 동기화)
//
// ⚠ 주의: 이 fallback 은 라이브러리/API 가 모두 누락하는 케이스 대비용이다.
//        새로운 공휴일이 발표되면 여기에 추가하면 모든 페이지가 동시에 보정된다.

export const HOLIDAYS_FALLBACK: Record<string, string> = {
  // ... (SchedulePage.tsx 21-70 의 객체를 그대로 복사)
  // 2026 섹션 맨 위에 추가:
  '2026-05-01': '근로자의 날',
  // ...
}

/** 로컬 시간 기준 YYYY-MM-DD */
function localYMD(d: Date): string {
  const y  = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${dd}`
}

/** fallback 맵에 들어있는지 검사 (라이브러리/외부 API 보완용) */
export function isFallbackHoliday(date: Date): boolean {
  return !!HOLIDAYS_FALLBACK[localYMD(date)]
}
```

**Step 2 — `cha-bio-safety/src/utils/shiftCalc.ts` 수정:**

`isKoreanHolidayOrWeekend`(라인 6-12)를 라이브러리 + fallback 둘 다 체크하도록 변경. 기존 import 줄 바로 아래에 fallback import 추가:

```typescript
import { isHoliday as _isHolidayKr } from '@hyunbinseo/holidays-kr'
import { isFallbackHoliday } from './holidays'

export function isKoreanHolidayOrWeekend(date: Date): boolean {
  const dow = date.getDay()
  if (dow === 0 || dow === 6) return true
  // 1) 한국 법정공휴일 라이브러리
  try {
    if (_isHolidayKr(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0))) return true
  } catch { /* fall through */ }
  // 2) 라이브러리가 누락하는 케이스 (예: 근로자의 날) 는 fallback 으로 보완
  return isFallbackHoliday(date)
}
```

다른 부분(REF_DATE, calcRaw, getRawShift, getMonthlySchedule 등)은 손대지 말 것. 이 함수만 수정.

**Step 3 — `cha-bio-safety/src/pages/SchedulePage.tsx` 수정:**

- 라인 20-70 의 `const HOLIDAYS_FALLBACK: Record<string, string> = { ... }` 블록 **전체 삭제**
- 파일 상단 import 섹션에 추가:
  ```typescript
  import { HOLIDAYS_FALLBACK } from '../utils/holidays'
  ```
- 라인 194 `const holidays = fetchedHolidays ?? HOLIDAYS_FALLBACK` 는 그대로 (이름 동일하므로 동작 유지)
- 다른 변경 없음 (디자인/레이아웃 변경 금지)

**Step 4 — `cha-bio-safety/src/pages/StaffServicePage.tsx` 수정 (이 task 에서는 fallback import 만):**

- 라인 42-72 의 `const HOLIDAYS_FALLBACK: Record<string, string> = { ... }` 블록 **전체 삭제**
- import 섹션 (라인 9-13 근처) 에 추가:
  ```typescript
  import { HOLIDAYS_FALLBACK } from '../utils/holidays'
  ```
- 라인 410 `Object.entries(HOLIDAYS_FALLBACK).forEach(...)` 는 그대로 (동작 유지)
- mealCalc 호출부는 **Task 2 에서 처리** — 이번 task 에서는 손대지 말 것

**무관한 컨벤션 변경 / 리팩토링 / 디자인 변경 금지.** 인덴테이션 2-space 유지, 한글 주석 유지.
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && npm run build 2>&1 | tail -20</automated>
    <!-- 추가 grep 검증 -->
    1. `grep -c "HOLIDAYS_FALLBACK" cha-bio-safety/src/utils/holidays.ts` → 1 이상
    2. `grep -c "2026-05-01" cha-bio-safety/src/utils/holidays.ts` → 1 (근로자의 날)
    3. `grep -c "const HOLIDAYS_FALLBACK" cha-bio-safety/src/pages/SchedulePage.tsx` → 0 (삭제됨)
    4. `grep -c "const HOLIDAYS_FALLBACK" cha-bio-safety/src/pages/StaffServicePage.tsx` → 0 (삭제됨)
    5. `grep -c "from '../utils/holidays'" cha-bio-safety/src/pages/SchedulePage.tsx` → 1
    6. `grep -c "from '../utils/holidays'" cha-bio-safety/src/pages/StaffServicePage.tsx` → 1
    7. `grep -c "isFallbackHoliday" cha-bio-safety/src/utils/shiftCalc.ts` → 1 이상
  </verify>
  <done>
    - `npm run build` 가 type error 없이 통과
    - 위 grep 7개 모두 기대값 일치
    - holidays.ts 가 SchedulePage 의 기존 fallback 데이터 + `2026-05-01: 근로자의 날` 을 포함
    - shiftCalc 가 라이브러리 false 인 경우에도 fallback 체크 → 5/1 에 대해 true 반환
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: mealCalc 시그니처 확장 + StaffServicePage 호출부 5곳 보정</name>
  <files>
    cha-bio-safety/src/utils/mealCalc.ts
    cha-bio-safety/src/pages/StaffServicePage.tsx
  </files>
  <action>
**Step 1 — `cha-bio-safety/src/utils/mealCalc.ts` 시그니처 확장:**

식대 단가는 mealCalc 안에 5500/11000 리터럴로 명시되어 있고 — 그 패턴 유지. 두 함수 모두 옵션 인자 2개를 추가하고, 기본값 false 로 기존 호출자 100% 호환성 유지.

```typescript
import type { RawShift } from './shiftCalc'

/**
 * 일별 제공 식수 계산 (D-08 ~ D-14)
 * @param rawShift  근무 유형 ('당'|'비'|'주'|'휴')
 * @param leaveType 연차 유형 (undefined = 연차 없음)
 * @param dayOfWeek 0=일, 6=토
 * @param isHoliday        해당 날짜가 공휴일이면 true (식당 운영 X)
 * @param isPrevDayHoliday 전날이 공휴일이면 true — 토요일에서만 의미 있음
 *                         (식당이 공휴일 직후 토요일 점심도 운영 안 함)
 * @returns 0, 1, or 2
 */
export function calcProvidedMeals(
  rawShift: RawShift,
  leaveType: string | undefined,
  dayOfWeek: number,
  isHoliday: boolean = false,
  isPrevDayHoliday: boolean = false
): number {
  // 공휴일 / 공휴일 직후 토요일은 식당 운영 X → 모든 케이스에서 0
  // (가장 우선 — 전일연차/비번 등 다른 0 반환 케이스보다 위에 둘 필요는 없지만
  //  의미상 "식당이 안 열린다" 를 최상단에 두는 게 가독성에 좋음)
  if (isHoliday) return 0
  if (dayOfWeek === 6 && isPrevDayHoliday) return 0

  // D-12: 전일 연차/공가 → 0
  if (leaveType === 'full' || leaveType === 'official_full') return 0
  // D-14: 비번 → 0
  if (rawShift === '비') return 0
  // D-11: 일요일 당직 → 0
  if (rawShift === '당' && dayOfWeek === 0) return 0
  // D-10: 토요일 당직 → 1
  if (rawShift === '당' && dayOfWeek === 6) return 1
  // D-09: 평일 당직 → 2
  if (rawShift === '당') return 2
  // D-13: 반차/공가 0.5일 → 1
  if (rawShift === '주' && leaveType && (
    leaveType === 'half' || leaveType === 'half_am' || leaveType === 'half_pm' ||
    leaveType === 'official_half_am' || leaveType === 'official_half_pm'
  )) return 1
  // D-08: 평일 주간 → 1
  if (rawShift === '주') return 1
  // '휴' (공휴일) → 0
  return 0
}

/**
 * 주말/공휴일 식대 계산 (D-15 ~ D-17)
 * 미식 여부와 무관, 당직 여부만으로 결정. 단가: 5,500원/끼.
 *
 * - 평일 공휴일 당직: 11,000원 (점심+저녁 외부)
 * - 일요일 당직: 11,000원 (점심+저녁 외부)
 * - 공휴일 직후 토요일 당직: 11,000원 (식당 점심도 운영 X → 점심+저녁 외부)
 * - 일반 토요일 당직: 5,500원 (저녁만 외부, 점심은 식당)
 * - 그 외: 0
 */
export function calcWeekendAllowance(
  rawShift: RawShift,
  dayOfWeek: number,
  isHoliday: boolean = false,
  isPrevDayHoliday: boolean = false
): number {
  if (rawShift !== '당') return 0
  // 공휴일 당직: 평일/주말 가리지 않고 11,000원 (식당 운영 X)
  if (isHoliday) return 11000
  // 공휴일 직후 토요일 당직: 11,000원 (식당 점심도 운영 X)
  if (dayOfWeek === 6 && isPrevDayHoliday) return 11000
  // 기존 로직
  if (dayOfWeek === 6) return 5500   // D-15: 일반 토요일 당직
  if (dayOfWeek === 0) return 11000  // D-16: 일요일 당직
  return 0
}
```

**Step 2 — `cha-bio-safety/src/pages/StaffServicePage.tsx` 호출부 5곳 보정:**

`holidayMap` 은 라인 405 에 이미 정의되어 있음 (DB + fallback). 이걸 활용해서 `isHoliday` / `isPrevDayHoliday` 를 계산해 mealCalc 에 넘긴다.

전날 ymd 헬퍼 — `monthlySummary`/`calendarDays` 안에서 인라인으로 계산해도 되고 `localYMD(new Date(year, month, d-1))` 로 도출해도 됨. 다만 month 경계(1일)에서 전월로 넘어가야 하므로 Date 산술 권장:

```typescript
function prevYMD(date: Date): string {
  const p = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1)
  return localYMD(p)
}
```
이 헬퍼는 컴포넌트 함수 안 (`localYMD` 정의된 라인 38 근처) 이나 파일 모듈 레벨에 추가. 위치는 가독성 우선으로 컴포넌트 바깥 모듈 레벨(라인 38 `localYMD` 바로 아래)이 자연스러움.

**호출부 1 — `monthlySummary` (라인 612-637):**
```typescript
for (let d = 1; d <= daysInMonth; d++) {
  const date = new Date(year, month, d)
  const ymd = localYMD(date)
  const dow = date.getDay()
  const raw = getRawShift(staffId, date)
  const leaveType = myLeaveMap[ymd]?.type
  const isHoliday = !!holidayMap[ymd]
  const isPrevDayHoliday = !!holidayMap[prevYMD(date)]
  const provided = calcProvidedMeals(raw, leaveType, dow, isHoliday, isPrevDayHoliday)
  const skipped = mealMap[ymd] ?? 0
  totalProvided += provided
  totalSkipped += Math.min(skipped, provided)
  totalAllowance += calcWeekendAllowance(raw, dow, isHoliday, isPrevDayHoliday)
}
```
useMemo deps 배열에 `holidayMap` 추가:
```typescript
}, [year, month, staffId, myLeaveMap, mealMap, holidayMap])
```

**호출부 2 — `calendarDays` 의 `calcProvidedMeals` (라인 658-678 근처):**
```typescript
for (let d = 1; d <= lastDay.getDate(); d++) {
  const date = new Date(year, month, d)
  const ymd = localYMD(date)
  const dow = date.getDay()
  const raw = getRawShift(staffId, date)
  const myLeave = myLeaveMap[ymd] ?? null
  const isHoliday = !!holidayMap[ymd]
  const isPrevDayHoliday = !!holidayMap[prevYMD(date)]
  const provided = calcProvidedMeals(raw, myLeave?.type, dow, isHoliday, isPrevDayHoliday)
  days.push({
    date, ymd, day: d, dow,
    isToday: ymd === todayYMD,
    isHoliday,                          // 기존 !!holidayMap[ymd] 와 동일 — 위 변수 재사용
    holidayName: holidayMap[ymd] ?? '',
    isWeekend: dow === 0 || dow === 6,
    rawShift: raw,
    myLeave,
    teamLeaveList: teamLeaveMap[ymd] ?? [],
    skipped: mealMap[ymd] ?? 0,
    provided,
    hasInspect: inspectDates.has(ymd),
  })
}
```
useMemo deps 배열에 `holidayMap` 추가 (이미 들어있으면 그대로):
```typescript
}, [year, month, staffId, myLeaveMap, teamLeaveMap, mealMap, inspectDates, today, holidayMap])
```

**호출부 3 — 모바일 selCell allowance (라인 1060):**

`calendarDays` 가 만든 `selCell` 에는 `isHoliday` 만 있고 `isPrevDayHoliday` 는 없음. 두 가지 옵션:
- (A) `calendarDays` 가 push 하는 객체 타입에 `isPrevDayHoliday: boolean` 필드를 추가하고, 동일 변수를 push 시점에 같이 저장
- (B) selCell 에서 인라인으로 `holidayMap[prevYMD(selCell.date)]` 다시 계산

**(A) 권장.** 이미 selCell 에 `isHoliday` 필드 있으니 동일 패턴. 라인 646-652 의 days 배열 타입 정의에 `isPrevDayHoliday: boolean` 추가, 라인 654-656 의 빈 placeholder 도 `isPrevDayHoliday: false` 추가, 라인 665-677 push 객체에 `isPrevDayHoliday` 추가.

라인 1060 호출부:
```typescript
const allow = calcWeekendAllowance(selCell.rawShift, selCell.dow, selCell.isHoliday, selCell.isPrevDayHoliday)
```

**호출부 4 — 데스크톱 selCell allowance (라인 1707):**
```typescript
const allow = calcWeekendAllowance(selCell.rawShift, selCell.dow, selCell.isHoliday, selCell.isPrevDayHoliday)
```

**확인할 것:**
- 호출부 5곳 모두 보정됐는지: 라인 624 (monthlySummary calcProvidedMeals), 628 (monthlySummary calcWeekendAllowance), 664 (calendarDays calcProvidedMeals), 1060 (mobile selCell calcWeekendAllowance), 1707 (desktop selCell calcWeekendAllowance)
- 디자인/레이아웃/색상/금액 표시 형식은 변경 없음 (₩{allow.toLocaleString()} 그대로)
- 기존 useMemo deps 에서 누락된 `holidayMap` 만 추가, 다른 deps 건드리지 말 것
- placeholder days 의 `isHoliday: false, isPrevDayHoliday: false` 등 타입 일관성 유지
- `prevYMD` 헬퍼는 모듈 레벨 (localYMD 바로 아래) 에 한 번만 정의

**무관한 컨벤션 변경 / 리팩토링 / 디자인 변경 금지.**
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/20260328/cha-bio-safety && npm run build 2>&1 | tail -20</automated>
    <!-- 추가 grep 검증 -->
    1. `grep -c "isPrevDayHoliday" cha-bio-safety/src/utils/mealCalc.ts` → 4 이상 (param 2번 + 본문 2번 이상)
    2. `grep -c "isHoliday" cha-bio-safety/src/utils/mealCalc.ts` → 4 이상
    3. `grep -c "isPrevDayHoliday" cha-bio-safety/src/pages/StaffServicePage.tsx` → 5 이상 (계산+호출+selCell 필드)
    4. `grep -c "calcProvidedMeals\|calcWeekendAllowance" cha-bio-safety/src/pages/StaffServicePage.tsx` → 5 (호출부 변동 없음)
    5. `grep -c "function prevYMD" cha-bio-safety/src/pages/StaffServicePage.tsx` → 1
    6. mealCalc 단가 리터럴 회귀 확인: `grep -c "5500\|11000" cha-bio-safety/src/utils/mealCalc.ts` → 4 이상 (5500 1번, 11000 3번)

    **수동 빌드 확인 (사람):** 빌드 후 다음 케이스 머릿속 검증:
    - 5/1(금) 평일 공휴일 당직자: provided=0, allowance=11000 ✓
    - 5/2(토) 공휴일 직후 토요일 당직자: provided=0, allowance=11000 ✓
    - 5/9(토) 일반 토요일 당직자: provided=1, allowance=5500 ✓ (회귀 없음)
    - 5/10(일) 일요일 당직자: provided=0, allowance=11000 ✓ (회귀 없음)
    - 5/4(월) 평일 당직자: provided=2, allowance=0 ✓ (회귀 없음)
  </verify>
  <done>
    - `npm run build` 통과
    - mealCalc 두 함수가 isHoliday / isPrevDayHoliday 옵션을 받고 단가 5500/11000 리터럴 유지
    - StaffServicePage 의 mealCalc 호출 5곳 모두 holidayMap 기반으로 isHoliday/isPrevDayHoliday 전달
    - selCell 객체 타입에 isPrevDayHoliday: boolean 필드 추가됨
    - useMemo deps 에 holidayMap 추가됨 (monthlySummary, calendarDays)
    - 디자인/레이아웃 변경 없음
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: 프로덕션 배포 + 5월 캘린더/식대 시각 검증</name>
  <what-built>
    - utils/holidays.ts 신설 (5/1 노동절 fallback 포함)
    - shiftCalc.isKoreanHolidayOrWeekend 가 fallback 보강
    - mealCalc 두 함수에 isHoliday / isPrevDayHoliday 옵션 추가
    - SchedulePage / StaffServicePage 의 자체 fallback 제거 → 공통 import
    - StaffServicePage 의 mealCalc 호출 5곳 holidayMap 기반 보정
  </what-built>
  <how-to-verify>
**Step A — 배포 (Claude 자동 실행):**

```bash
cd /Users/jykevin/Documents/20260328/cha-bio-safety
npm run deploy -- --branch production --commit-message "fix(meal): may holiday recognition + meal calc"
```

⚠ `--branch production` 누락 시 Preview 로 감 (사용자 메모 feedback_deploy_branch.md).
⚠ 한글 커밋 메시지로 wrangler 가 거부하면 위와 같이 ASCII 로 `--commit-message` 별도 지정 (사용자 메모 feedback_wrangler_commit_utf8.md).
배포 URL 출력 확인. 사용자에게 PWA 캐시 때문에 앱 재설치/강제새로고침 필요할 수 있음 안내 (사용자 메모 feedback_pwa_cache_invalidation.md).

**Step B — 사용자 검증 (사람이 다음 케이스 확인):**

1. **`/schedule` 페이지 → 2026년 5월로 이동**
   - 5/1 (금) 셀이 빨간 공휴일로 표시되는가? (홀리데이 이름은 "근로자의 날" 이거나 외부 API 가 주는 이름)

2. **`/staff-service` (인사)페이지 → 본인 또는 5/1 당직 사이클 직원 → 2026년 5월**
   - 5/1 (금) 셀이 빨간색 + '휴' 라벨로 표시되는가? (해당 직원이 평소 5/1 에 '주' 사이클이었다면 이제 '휴' 로 변경되어야 함. 5/1 당직(당) 사이클이었다면 '당' 그대로지만 식대만 변경)
   - 5/1 셀 클릭 → 주말식대 카드에 ₩11,000 이 표시되는가? (당직 사이클일 때만)
   - 5/2 (토) 셀 클릭 → 그 직원이 토요일 당직이면 주말식대 ₩11,000 (5,500 아님) 표시되는가?
   - 월간 요약 카드: "주말식대 ₩XX,XXX" 가 기존 대비 5/1 + 5/2 보정분 만큼 (당직 직원이라면 +16,500원 또는 +11,000원, 케이스에 따라) 증가되었는가?

3. **회귀 확인:**
   - 5/9 (토) 일반 토요일 당직 → 식대 ₩5,500 그대로
   - 5/10 (일) 일요일 당직 → 식대 ₩11,000 그대로
   - 5/4 (월) 평일 당직 → 주말식대 0, 제공식수 2 그대로
   - 5/5 (화·어린이날) 당직 → 식대 ₩11,000, 제공식수 0 (어린이날도 평일공휴일이므로 같은 보정 적용됨)
   - 5/6 (수) 평일 → 변동 없음

4. **(선택) 5월 외 다른 월 검증:**
   - 6월 6일 (현충일·토요일) — 토요일이면서 공휴일. 기존 로직: 토요일 → 5,500. 새 로직: isHoliday=true → 11,000. **이게 의도한 동작인지** 사용자 최종 확인. (현충일 당직자가 식당 못 가니까 11,000 이 맞을 가능성 높음)

5. **PWA 캐시 안 풀리면:**
   - 사용자에게 모바일에서 앱 삭제 후 재설치 (또는 Safari/Chrome 에서 Cmd+Shift+R) 안내.
  </how-to-verify>
  <resume-signal>"approved" 또는 발견한 이슈 설명. 회귀가 발견되면 Task 1/2 의 어느 호출부가 빠졌는지 알려주면 즉시 수정.</resume-signal>
</task>

</tasks>

<verification>
**전체 PLAN 완료 조건:**
- [ ] `cha-bio-safety/src/utils/holidays.ts` 가 존재하고 `2026-05-01: 근로자의 날` 포함
- [ ] `shiftCalc.isKoreanHolidayOrWeekend` 가 라이브러리 + fallback 둘 다 체크
- [ ] `mealCalc` 두 함수 시그니처에 `isHoliday`, `isPrevDayHoliday` 옵션 추가됨 (기본값 false)
- [ ] SchedulePage 자체 HOLIDAYS_FALLBACK 삭제 + 공통 import
- [ ] StaffServicePage 자체 HOLIDAYS_FALLBACK 삭제 + 공통 import
- [ ] StaffServicePage 의 mealCalc 호출 5곳 모두 holidayMap 기반 인자 전달
- [ ] `npm run build` 통과 (type error / lint error 없음)
- [ ] `--branch production` 으로 배포됨
- [ ] 사용자가 5월 캘린더/식대를 시각적으로 검증 (5/1 휴 표시, 5/1·5/2 식대 보정, 회귀 케이스 정상)
</verification>

<success_criteria>
- 5/1 (근로자의 날) 이 SchedulePage / StaffServicePage 모두에서 공휴일로 인식됨
- 5/1 평일 공휴일 당직자에게 ₩11,000 주말식대 + 제공식수 0
- 5/2 공휴일 직후 토요일 당직자에게 ₩11,000 주말식대 + 제공식수 0
- 5/9 일반 토요일 당직 ₩5,500, 5/10 일요일 당직 ₩11,000, 5/4 평일 당직 ₩0 — 회귀 없음
- 디자인/레이아웃 변경 없음
- 5월 법정점검 시즌 식대 정산이 정확하게 산출됨
</success_criteria>

<output>
완료 후 `.planning/quick/260426-cyv-may-holiday-meal-fix/260426-cyv-SUMMARY.md` 생성:
- 변경된 파일 목록 (5개)
- 5/1 인식 + 식대 보정의 전후 비교 (예: 김OO 직원 2026-05 주말식대 ₩XX,XXX → ₩YY,YYY)
- 배포 URL
- PWA 재설치 안내 여부
- 회귀 테스트 결과 (5/9, 5/10, 5/4, 5/5, 6/6 케이스)
</output>
