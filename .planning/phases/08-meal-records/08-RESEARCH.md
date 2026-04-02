# Phase 8: Meal Records - Research

**Researched:** 2026-04-02
**Domain:** 식사 기록 (Meal Tracking) — D1 SQLite, React, shiftCalc integration
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**페이지 구조**
- D-01: 탭 2개 — 식사 기록 / 메뉴표. AdminPage와 동일 탭 패턴
- D-02: /meal은 NO_NAV_PATHS에 이미 포함. 자체 헤더(← 뒤로가기) + 탭 바
- D-03: 메뉴표 탭은 "준비 중" placeholder (MEAL-03/04 보류)

**식사 기록 방식 (MEAL-01)**
- D-04: 달력형 UI — 연차 달력과 유사한 월간 그리드
- D-05: 역발상 입력 — 기본=제공 식수 전부 소비, 안 먹은 끼니만 기록
- D-06: 탭 인터랙션 — 날짜 1탭=미식 1끼, 2탭=미식 2끼, 3탭=리셋(미식 0)
- D-07: 미식 표시 — 날짜 셀 우상단에 숫자(①, ②). 미식 0이면 표시 없음

**식사 제공 규칙 (근무표 연동)**
- D-08: 평일 주간 근무: 중식 1끼
- D-09: 평일 당직 근무: 중식 + 석식 2끼
- D-10: 토요일 당직: 중식 1끼
- D-11: 일요일 당직: 제공 없음 (0끼)
- D-12: 전일 연차/공가(1.0일): 제공 없음
- D-13: 반차/공가(0.5일): 중식 1끼
- D-14: 비번: 제공 없음

**주말 식대 계산**
- D-15: 토요일 당직: 미제공 석식 → 5,500원
- D-16: 일요일 당직: 미제공 중식+석식 → 11,000원 (5,500원 × 2)
- D-17: 식사를 하지 않았다고 추가 식대 지급 없음 — 주말 당직 여부로만 결정

**월별 통계 (MEAL-02)**
- D-18: 달력 상단 요약 카드: 제공 식수 / 실제 식수 / 미식 / 주말 식대
- D-19: 본인 통계만 조회 (다른 직원 조회 불가)
- D-20: 제공 식수 = 근무표(shiftCalc) + 연차(leave 테이블) 기반 자동 계산

**근무표/연차 연동**
- D-21: shiftCalc의 getMonthlySchedule()로 주간/당직/비번 판정
- D-22: leave 테이블에서 승인된 연차/공가 조회 → 전일(1.0)이면 식수 차감, 반차(0.5)이면 중식 1끼만

**DB 스키마**
- D-23: meal_records 테이블: staff_id + date + skipped_meals(0/1/2). 미식 0이면 행 없음(또는 0). 탭 횟수와 직접 대응
- D-24: 마이그레이션 1개: 0035_meal_records.sql (또는 다음 번호)

**Scope Adjustments**
- MEAL-03 보류: 주간 메뉴표 관리 — 데스크톱 버전에서 드래그앤드롭 PDF 업로드 + pdf.js 클라이언트 추출로 구현
- MEAL-04 보류: PDF 텍스트 추출 — MEAL-03와 함께 데스크톱 버전에서 구현
- 스낵 메뉴 제외: PDF의 SNACK 섹션은 파싱 대상에서 제외

### Claude's Discretion
- 달력 셀 크기 및 레이아웃 (기존 연차 달력 참고)
- 요약 카드 디자인 (기존 앱 스타일과 일관성)
- shiftCalc 연동의 구체적 API 설계 (클라이언트 계산 vs 서버 계산)
- 주말 식대 표시 위치/형태

### Deferred Ideas (OUT OF SCOPE)
- MEAL-03 메뉴표 관리 — 데스크톱 버전에서 드래그앤드롭 PDF 업로드 → pdf.js 클라이언트 추출 → 요일/코스별 자동 파싱
- MEAL-04 PDF 텍스트 추출 — MEAL-03와 함께 구현
- 근무표+연차+식사 달력 통합 — 세 달력을 하나로 합치는 미래 과제
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MEAL-01 | 개인별 조식/중식/석식 식사 여부를 기록할 수 있다 | 달력 그리드 패턴(LeavePage), 탭 인터랙션(D-06), meal_records 스키마(D-23), API endpoint 설계 확인 |
| MEAL-02 | 월별 식사 통계(횟수, 금액)를 조회할 수 있다 | shiftCalc.getMonthlySchedule() 반환값, leave API 응답 구조, 제공 식수 계산 로직, 요약 카드 패턴 |
</phase_requirements>

---

## Summary

Phase 8은 기존 shiftCalc.ts(근무 패턴 계산)와 annual_leaves 테이블(연차)에서 제공 식수를 자동 계산하고, 사용자가 안 먹은 끼니(미식)만 달력에서 탭으로 기록하는 역발상 UI를 구현한다. DB 스키마는 단순(staff_id + date + skipped_meals 정수)하고, 클라이언트에서 shiftCalc를 직접 임포트하여 서버 왕복 없이 제공 식수를 계산할 수 있다.

UI 패턴은 이미 LeavePage.tsx와 AdminPage.tsx에 완성된 달력 그리드와 탭 바 코드가 존재하므로 재구현이 아닌 패턴 복제다. 탭 인터랙션(D-06)은 LeavePage의 날짜 클릭→유형 선택 방식과 다르게 단일 클릭 → 상태 사이클(0→1→2→0)로 구현해야 한다. 기존 연차 달력은 클릭 후 별도 버튼 패널이 나오는 2단계 방식이지만, 식사 달력은 날짜 셀 자체가 탭될 때마다 미식 카운터가 순환한다는 점이 핵심 차이다.

마이그레이션 번호는 현재 최신이 0034_staff_fields.sql이므로 0035_meal_records.sql로 확정된다.

**Primary recommendation:** 클라이언트 사이드 제공 식수 계산(shiftCalc import + leaveApi.list 결과 조합) + 서버 사이드 미식 기록 저장(meal_records 테이블). 서버에서 제공 식수를 계산하지 않아도 된다 — shiftCalc는 이미 프론트엔드 유틸리티이며 순수 함수다.

---

## Standard Stack

### Core (모두 기존 프로젝트에 설치됨)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | UI 렌더링 | 기존 스택 |
| @tanstack/react-query | 5.59.0 | 서버 상태, 캐싱, mutation | 기존 패턴 — leaveApi와 동일하게 적용 |
| Zustand (useAuthStore) | 5.0.0 | staffId/JWT 읽기 | 기존 패턴 |
| date-fns | 4.1.0 | 달력 날짜 계산 | 기존 스택 (LeavePage에서 직접 날짜 계산 사용) |
| react-hot-toast | 2.4.1 | 사용자 피드백 | 기존 패턴 |
| Cloudflare D1 (SQLite) | — | meal_records 저장 | 기존 DB |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shiftCalc.ts (내부) | — | 근무 유형 판정 | 제공 식수 계산 시 필수 |
| leaveApi (내부) | — | 연차/공가 조회 | 제공 식수 차감 계산 시 필수 |
| useStaffList hook (내부) | — | staffData 주입 to getMonthlySchedule | Phase 7 완료로 사용 가능 |

**Installation:** 신규 패키지 설치 없음 — 기존 스택으로 100% 구현 가능.

---

## Architecture Patterns

### Recommended Project Structure

```
cha-bio-safety/
├── src/pages/
│   └── MealPage.tsx                  # 신규 — 탭 2개: 식사 기록 / 메뉴표(준비중)
├── src/utils/
│   └── api.ts                        # mealApi 네임스페이스 추가
├── functions/api/
│   └── meal/
│       ├── index.ts                  # GET (조회) / POST (미식 기록 upsert)
│       └── [date].ts                 # DELETE (미식 0으로 리셋, 선택적)
├── migrations/
│   └── 0035_meal_records.sql         # meal_records 테이블 생성
```

### Pattern 1: 제공 식수 계산 (클라이언트 사이드)

**What:** shiftCalc.getMonthlySchedule()로 일별 RawShift를 얻고, leaveApi.list()로 연차 레코드를 받아 클라이언트에서 날짜별 제공 식수(0/1/2)를 계산.

**When to use:** 제공 식수는 DB에 저장하지 않음 — 항상 근무표+연차에서 파생되는 계산값이기 때문.

**Logic:**
```typescript
// Source: shiftCalc.ts (verified)
import { getMonthlySchedule, type RawShift } from '../utils/shiftCalc'
import { useStaffList } from '../hooks/useStaffList'

function calcProvidedMeals(
  rawShift: RawShift,
  leaveType: string | undefined,
  dayOfWeek: number // 0=일, 6=토
): number {
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
  // D-13: 반차/공가 0.5일 → 1 (주간 근무 중 반차)
  if (rawShift === '주' && (leaveType === 'half_am' || leaveType === 'half_pm' ||
      leaveType === 'official_half_am' || leaveType === 'official_half_pm')) return 1
  // D-08: 평일 주간 → 1
  if (rawShift === '주') return 1
  // 휴(공휴일에 주간이 휴로 변환) → 0
  return 0
}
```

### Pattern 2: 주말 식대 계산

**What:** 당직 여부만으로 결정. 미식 기록과 무관.

```typescript
function calcWeekendAllowance(
  rawShift: RawShift,
  dayOfWeek: number
): number {
  // D-15: 토요일 당직 → 5,500원
  if (rawShift === '당' && dayOfWeek === 6) return 5500
  // D-16: 일요일 당직 → 11,000원
  if (rawShift === '당' && dayOfWeek === 0) return 11000
  return 0
}
```

### Pattern 3: 달력 탭 인터랙션 (D-06 사이클)

**What:** 날짜 셀 탭 시 skipped_meals를 순환(0→1→2→0). LeavePage와 달리 별도 패널 없이 셀 직접 사이클.

```typescript
async function handleDayTap(ymd: string, providedMeals: number) {
  const current = mealMap[ymd]?.skippedMeals ?? 0
  // 제공 식수보다 미식이 많을 수 없음 — 순환 상한은 providedMeals
  const maxSkip = providedMeals
  if (maxSkip === 0) return  // 제공 없는 날은 탭 불가
  const next = (current + 1) > maxSkip ? 0 : current + 1
  await mealApi.upsert(ymd, next)
  qc.invalidateQueries({ queryKey: ['meal', year, month] })
}
```

**Key insight:** 제공 식수가 0인 날(비번, 일요일 당직, 전일연차)은 탭이 동작하지 않아야 한다. 제공 식수가 1인 날은 0→1→0으로 2단계, 제공 식수가 2인 날은 0→1→2→0으로 3단계 순환.

### Pattern 4: AdminPage 탭 바 패턴 (복제 대상)

**Source:** `AdminPage.tsx` lines 445-461 (verified)

```typescript
// AdminPage.tsx에서 확인된 탭 바 패턴
type MealTab = 'record' | 'menu'
const [activeTab, setActiveTab] = useState<MealTab>('record')

<div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--bd)', display: 'flex', flexShrink: 0 }}>
  {([
    { key: 'record' as MealTab, label: '식사 기록' },
    { key: 'menu'   as MealTab, label: '메뉴표' },
  ]).map(tab => (
    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
      style={{
        flex: 1, height: 44, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
        background: activeTab === tab.key ? 'var(--bg4)' : 'transparent',
        color:      activeTab === tab.key ? 'var(--t1)' : 'var(--t3)',
        borderBottom: activeTab === tab.key ? '2px solid var(--acl)' : '2px solid transparent',
      }}>
      {tab.label}
    </button>
  ))}
</div>
```

### Pattern 5: API Endpoint — Upsert 패턴

**What:** POST /api/meal — skipped_meals가 0이면 행을 삭제(또는 0으로 유지), 양수이면 INSERT OR REPLACE.

```typescript
// functions/api/meal/index.ts
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId } = data as any
  const { date, skippedMeals } = await request.json<{ date: string; skippedMeals: number }>()

  if (skippedMeals === 0) {
    await env.DB.prepare(
      'DELETE FROM meal_records WHERE staff_id = ? AND date = ?'
    ).bind(staffId, date).run()
  } else {
    await env.DB.prepare(`
      INSERT INTO meal_records (staff_id, date, skipped_meals)
      VALUES (?, ?, ?)
      ON CONFLICT(staff_id, date) DO UPDATE SET skipped_meals = excluded.skipped_meals
    `).bind(staffId, date, skippedMeals).run()
  }
  return Response.json({ success: true })
}
```

### Pattern 6: 셀프 헤더 패턴 (NO_NAV_PATHS 페이지)

LeavePage.tsx와 AdminPage.tsx에서 확인된 공통 패턴:

```typescript
// 헤더: 높이 48px, bg2, borderBottom bd
<div style={{ height: 48, background: 'var(--bg2)', borderBottom: '1px solid var(--bd)',
              display: 'flex', alignItems: 'center', flexShrink: 0 }}>
  <button onClick={() => navigate(-1)}
    style={{ width: 44, height: 44, background: 'none', border: 'none',
             cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
             color: 'var(--t2)' }}>
    <IconChevronLeft size={20} color="var(--t2)" />
  </button>
  <span style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>
    식사 기록
  </span>
  <div style={{ width: 44 }} />
</div>
```

### Anti-Patterns to Avoid

- **서버에서 제공 식수 계산:** shiftCalc는 프론트엔드 유틸리티이고, 서버에서 복제하면 유지보수 이중화 발생. 클라이언트 계산이 정답.
- **skipped_meals를 boolean으로 저장:** 평일 당직은 2끼 제공이므로 0/1/2 정수가 필요. boolean 불가.
- **미식 기록 시 제공 식수 초과 허용:** 제공이 1끼인 날에 미식 2를 저장하는 것은 불합리. 탭 핸들러에서 providedMeals를 상한으로 사용해야 함.
- **leaveApi를 year 전체로 조회:** 월별 통계 계산 시 해당 월만 조회하면 충분. year 전체 조회는 불필요한 네트워크 비용.
- **LeavePage의 2단계 클릭 방식 복제:** LeavePage는 날짜 선택 후 별도 타입 버튼 패널이 나타남. MealPage는 탭마다 상태가 순환하는 단계 방식 — 구조가 다름.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 근무 유형 판정 | 별도 판정 로직 | shiftCalc.getMonthlySchedule() | 이미 검증된 3교대 계산, 공휴일 처리 포함 |
| 연차 조회 | 별도 leave 쿼리 | leaveApi.list(year, monthStr) | 기존 API, myLeaves 반환 구조 확인됨 |
| 달력 그리드 | 커스텀 캘린더 라이브러리 | LeavePage.tsx 패턴 복제 | CSS grid repeat(7,1fr) + startDow 오프셋 방식 완성 |
| 탭 바 UI | 커스텀 탭 컴포넌트 | AdminPage.tsx 탭 패턴 복제 | 동일한 스타일 변수 사용, 4줄 버튼 패턴 |
| toast 알림 | 커스텀 알림 | react-hot-toast | 기존 패턴 |

---

## DB Schema

### migration 0035_meal_records.sql

```sql
-- meal_records: 미식(안 먹은 끼니) 기록
-- skipped_meals: 0=전부 먹음(행 없거나 0), 1=1끼 안 먹음, 2=2끼 안 먹음
CREATE TABLE meal_records (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  staff_id     TEXT NOT NULL REFERENCES staff(id),
  date         TEXT NOT NULL,  -- YYYY-MM-DD
  skipped_meals INTEGER NOT NULL CHECK(skipped_meals IN (0, 1, 2)) DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(staff_id, date)
);

CREATE INDEX idx_meal_records_staff_month ON meal_records(staff_id, date);
```

**Confirmed:** 현재 최신 마이그레이션은 `0034_staff_fields.sql` 이므로 `0035_meal_records.sql`이 올바른 다음 번호.

---

## shiftCalc Integration Reference

**Verified from `shiftCalc.ts` (source code read):**

```typescript
// getMonthlySchedule 반환 구조 (확인됨)
{
  daysInMonth: number,
  staffRows: {
    id: string
    name: string
    title: string
    shifts: RawShift[]  // 인덱스 = day - 1, 길이 = daysInMonth
  }[]
}
// RawShift = '당' | '비' | '주' | '휴'
```

**MealPage 사용 방법:**

```typescript
const { data: staffList } = useStaffList()
const staffForCalc = (staffList ?? []).map(s => ({ id: s.id, name: s.name, title: s.title }))
const { daysInMonth, staffRows } = getMonthlySchedule(year, month, staffForCalc)
const myRow = staffRows.find(r => r.id === staff?.id)
// myRow.shifts[dayIndex] → '당'|'비'|'주'|'휴'
```

**석현민(방재책임) 처리:** shiftCalc에서 staffId `2018042451`은 항상 평일='주'/공휴일·주말='휴' — 특별 케이스 없이 동일 calcProvidedMeals 로직으로 처리됨.

---

## leave 테이블 연동 Reference

**Verified from `functions/api/leaves/index.ts` (source code read):**

- GET `/api/leaves?year=YYYY&month=YYYY-MM` → `{ myLeaves, teamLeaves }` 반환
- myLeaves 구조: `{ id, staffId, date, type, year, createdAt }`
- 연차 타입 (0031_leaves_expand_types.sql 확인): `'full' | 'half' | 'half_am' | 'half_pm' | 'official_full' | 'official_half_am' | 'official_half_pm'`

**MealPage 사용:** leaveApi.list(year, monthStr)로 myLeaves만 필요. date → leaveType 맵으로 변환 후 calcProvidedMeals에 주입.

---

## Navigation Integration

**Verified from `App.tsx` line 51 (source code read):**
- NO_NAV_PATHS에 `/meal` 이미 포함 — 추가 불필요
- 라우트는 미등록: `/meal` route와 lazy import 추가 필요

**Verified from `SideMenu.tsx` line 34 (source code read):**
- `{ label: '식당 메뉴', path: '/meal', badge: 0, soon: true }` — `soon: true → soon: false`로 변경 필요

---

## 제공 식수 계산 로직 전체 정리

| RawShift | 요일 | leaveType | 제공 식수 | 주말 식대 |
|----------|------|-----------|-----------|-----------|
| '주' | 평일 | 없음 | 1 | 0 |
| '주' | 평일 | half_am / half_pm / official_half* | 1 | 0 |
| '주' | 평일 | full / official_full | 0 | 0 |
| '주' | 토/일 | — | 0 (→ '휴'로 변환됨) | 0 |
| '당' | 평일 | — | 2 | 0 |
| '당' | 토 | — | 1 | 5,500 |
| '당' | 일 | — | 0 | 11,000 |
| '비' | 모든 | — | 0 | 0 |
| '휴' | 모든 | — | 0 | 0 |

**Edge case:** 석현민은 토/일 근무가 없으므로 주말 식대 항상 0.

---

## 월별 통계 계산 (MEAL-02)

클라이언트에서 계산:

```typescript
const stats = useMemo(() => {
  let totalProvided = 0
  let totalSkipped  = 0
  let weekendAllowance = 0

  for (let d = 1; d <= daysInMonth; d++) {
    const date    = new Date(year, month - 1, d)
    const ymd     = localYMD(date)
    const dow     = date.getDay()
    const rawShift = myRow?.shifts[d - 1] ?? '휴'
    const leaveType = leaveMap[ymd]?.type

    const provided  = calcProvidedMeals(rawShift, leaveType, dow)
    const skipped   = mealMap[ymd]?.skippedMeals ?? 0

    totalProvided    += provided
    totalSkipped     += skipped
    weekendAllowance += calcWeekendAllowance(rawShift, dow)
  }

  return {
    provided:   totalProvided,
    actual:     totalProvided - totalSkipped,  // 실제 식수
    skipped:    totalSkipped,
    allowance:  weekendAllowance,
  }
}, [year, month, daysInMonth, myRow, leaveMap, mealMap])
```

---

## Common Pitfalls

### Pitfall 1: 제공 식수 0인 날 탭 허용
**What goes wrong:** 비번, 일요일 당직, 전일연차 날에 미식 기록이 생성됨
**Why it happens:** 탭 핸들러에서 providedMeals 체크를 빠뜨림
**How to avoid:** `if (providedMeals === 0) return` 가드를 탭 핸들러 최상단에 배치
**Warning signs:** skipped_meals > 0 인데 providedMeals = 0인 레코드 존재

### Pitfall 2: leaveType 'half' vs 'half_am'/'half_pm' 불일치
**What goes wrong:** 연차 타입 체크가 'half_am'/'half_pm'만 처리하는데 DB에 'half' 레거시 값이 남아있을 수 있음
**Why it happens:** migration 0031에서 `half` 타입도 CHECK에 포함됨 (`'full','half','half_am','half_pm',...`)
**How to avoid:** calcProvidedMeals에서 `leaveType?.startsWith('half')` 방식으로 처리하거나 모든 변형 열거
**Warning signs:** 반차인데 중식 제공 없다고 계산됨

### Pitfall 3: getMonthlySchedule에 staffData 미전달
**What goes wrong:** staffData가 undefined이면 `staff = []`가 되어 모든 직원의 shifts가 빈 배열
**Why it happens:** Phase 7 이전에는 SHIFT_OFFSETS 하드코딩으로 작동했으나 TECH-01 이후 staffData 주입 필수
**How to avoid:** useStaffList()가 로딩 중이면 스켈레톤 표시 후 데이터 도착 시 계산
**Warning signs:** 모든 날짜의 제공 식수가 0으로 표시됨

### Pitfall 4: 월 이동 시 캐시 불일치
**What goes wrong:** leaveApi와 mealApi의 React Query key가 다르게 설계되면 월 이동 후 데이터 갱신 안 됨
**Why it happens:** queryKey를 년도만으로 잡으면 월별 구분 불가
**How to avoid:** queryKey를 `['meal', year, month]`와 `['leaves', year, monthStr]`로 월 단위로 설계
**Warning signs:** 이전 달의 미식 데이터가 현재 달에 표시됨

### Pitfall 5: upsert vs insert-or-ignore
**What goes wrong:** skipped_meals를 UPDATE 없이 INSERT하면 같은 날 두 번 탭 시 409 Conflict 또는 중복 행 발생
**Why it happens:** SQLite에서 INSERT만 사용하면 UNIQUE 제약 위반
**How to avoid:** `INSERT ... ON CONFLICT(staff_id, date) DO UPDATE SET skipped_meals = excluded.skipped_meals` 패턴 사용 (Pattern 5 참고)

---

## Code Examples

### mealApi in api.ts (신규 추가)

```typescript
export const mealApi = {
  list: (year: number, month: string) =>
    api.get<{ records: { date: string; skippedMeals: number }[] }>(
      `/meal?year=${year}&month=${month}`
    ),
  upsert: (date: string, skippedMeals: number) =>
    api.post<void>('/meal', { date, skippedMeals }),
}
```

### GET /api/meal handler

```typescript
// functions/api/meal/index.ts — GET
export const onRequestGet: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId } = data as any
  const url   = new URL(request.url)
  const month = url.searchParams.get('month') // YYYY-MM

  const result = await env.DB.prepare(`
    SELECT date, skipped_meals as skippedMeals
    FROM meal_records
    WHERE staff_id = ? AND date LIKE ?
    ORDER BY date ASC
  `).bind(staffId, `${month}%`).all<{ date: string; skippedMeals: number }>()

  return Response.json({ success: true, data: { records: result.results ?? [] } })
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| LeavePage 2단계 입력 (클릭→패널) | MealPage 단일 탭 사이클 (0→1→2→0) | Phase 8 신규 | 더 빠른 모바일 인터랙션 |
| 제공 식수 DB 저장 | 클라이언트 계산(shiftCalc+leave) | Phase 8 설계 결정 | 단일 진실 소스, 중복 없음 |

---

## Open Questions

1. **'비번' 날 탭 피드백**
   - What we know: 제공 식수 0이면 탭 동작 안 함
   - What's unclear: 탭 시도 시 toast 안내 메시지가 필요한가? (ex. "비번일에는 식사 제공 없음")
   - Recommendation: 구현 시 토스트 없이 무반응이 자연스러움 — 달력 셀 디자인에서 비번 날은 회색/어두운 색으로 구분

2. **미래 날짜 기록 허용 여부**
   - What we know: 연차 달력은 미래 날짜 등록 가능
   - What's unclear: 오늘 이후 날짜에 미식 기록을 허용해야 하는가?
   - Recommendation: 허용 — 야간근무자는 다음날 식사를 미리 알 수 있음. 서버 validation 불필요

3. **leaveMap에서 date 키 형식**
   - What we know: annual_leaves.date는 'YYYY-MM-DD' TEXT 형식 (migration 확인)
   - What's unclear: 시간대 이슈 없는지 (shiftCalc의 localYMD 함수 사용 필요)
   - Recommendation: LeavePage.tsx의 localYMD 헬퍼 함수를 MealPage에도 복제 또는 별도 유틸로 추출

---

## Environment Availability

Step 2.6: SKIPPED — 신규 패키지 없음, 모든 의존성이 기존 프로젝트에 설치된 상태. Cloudflare D1 마이그레이션만 필요하며 wrangler CLI(기존 사용 중)로 처리됨.

---

## Validation Architecture

### Test Framework

이 프로젝트는 테스트 프레임워크가 설정되어 있지 않다 (package.json에 jest/vitest/playwright 없음, test 디렉토리 없음). nyquist_validation이 true이므로 Wave 0에서 테스트 인프라를 추가하거나, 순수 함수에 대한 브라우저 검증 전략을 사용해야 한다.

| Property | Value |
|----------|-------|
| Framework | 없음 (미설치) |
| Config file | 없음 |
| Quick run command | 미정 (Wave 0 결정 필요) |
| Full suite command | 미정 |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MEAL-01 | 날짜 탭 시 skipped_meals 0→1→2→0 순환 | unit (calcProvidedMeals) | 미정 | ❌ Wave 0 |
| MEAL-01 | 제공 식수 0인 날 탭 무반응 | unit (calcProvidedMeals guard) | 미정 | ❌ Wave 0 |
| MEAL-02 | 제공/실제/미식/주말식대 계산 정확성 | unit (stats 계산 함수) | 미정 | ❌ Wave 0 |
| MEAL-02 | 요약 카드 올바른 값 표시 | manual (UI 확인) | — | manual-only |

**주요 순수 함수 (단위 테스트 가능):**
- `calcProvidedMeals(rawShift, leaveType, dayOfWeek)` → 0/1/2 반환값 검증
- `calcWeekendAllowance(rawShift, dayOfWeek)` → 0/5500/11000 반환값 검증

### Sampling Rate

- **Per task commit:** 브라우저 개발 서버에서 수동 검증 (`npm run dev`)
- **Per wave merge:** 달력 UI 전체 흐름 수동 검증
- **Phase gate:** /meal 페이지 탭 인터랙션 + 통계 카드 숫자 확인 후 `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `calcProvidedMeals`, `calcWeekendAllowance` 순수 함수를 별도 유틸로 추출 → 단위 테스트 가능한 구조로
- [ ] 테스트 프레임워크 설치 여부: 프로젝트 규모(4인팀)를 감안하면 vitest 추가가 가장 경량

*(vitest 추가는 CLAUDE.md에 명시된 스택 외이므로 claude 재량으로 판단)*

---

## Sources

### Primary (HIGH confidence)
- `cha-bio-safety/src/utils/shiftCalc.ts` — getMonthlySchedule 반환 구조, RawShift 타입, 4명 staffId, 3교대 계산 로직 직접 확인
- `cha-bio-safety/functions/api/leaves/index.ts` — GET /api/leaves 쿼리 구조, myLeaves 응답 형식 직접 확인
- `cha-bio-safety/migrations/0031_leaves_expand_types.sql` — leaveType 열거값 직접 확인
- `cha-bio-safety/migrations/0034_staff_fields.sql` — 최신 마이그레이션 번호 확인 (→ 0035가 다음)
- `cha-bio-safety/src/pages/AdminPage.tsx` — 탭 바 패턴, 셀프 헤더 패턴 직접 확인
- `cha-bio-safety/src/pages/LeavePage.tsx` — 달력 그리드 패턴, 날짜 클릭 핸들러 직접 확인
- `cha-bio-safety/src/App.tsx` — NO_NAV_PATHS 배열(line 51), 라우트 목록 직접 확인
- `cha-bio-safety/src/components/SideMenu.tsx` — '식당 메뉴' soon:true 항목 직접 확인
- `cha-bio-safety/src/utils/api.ts` — API 패턴(req 함수, 네임스페이스 구조) 직접 확인
- `cha-bio-safety/src/types/index.ts` — LeaveType, Staff, RawShift 타입 직접 확인

### Secondary (MEDIUM confidence)
- `.planning/phases/08-meal-records/08-CONTEXT.md` — 모든 D- 결정사항 (사용자 명시적 결정)

---

## Project Constraints (from CLAUDE.md)

| Constraint | Impact on Phase 8 |
|-----------|-------------------|
| Cloudflare Pages + D1 + R2 고정 | meal_records는 D1에 저장. Workers API 핸들러 사용 |
| 추가 비용 $0 | 신규 서비스 없음, 기존 D1 테이블 추가만 |
| React 18.3.1, TypeScript 5.6.3 | MealPage.tsx는 tsx 파일, strict:false |
| 인라인 스타일 + CSS 변수 | var(--bg), var(--t1) 등 CSS 변수 사용. Tailwind className 금지 |
| 2-space indentation | 전체 코드에 2 스페이스 |
| 데이터 삭제 불가 원칙 | skipped_meals=0 행 삭제는 기록이 아니므로 허용됨 — 미식이 없다는 것은 원본 데이터가 없는 것과 동일 |
| React Query staleTime 30초 | mealApi.list query도 동일하게 적용 |
| camelCase API 응답 | skipped_meals → skippedMeals 변환 필요 (DB: snake_case, JS: camelCase) |
| pages/functions 파일 기반 라우팅 | functions/api/meal/index.ts 로 GET/POST, functions/api/meal/[date].ts는 불필요 (upsert 패턴이므로) |
| NO_NAV_PATHS 패턴 | /meal 이미 포함됨 — 셀프 헤더 구현 필수 |

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 기존 프로젝트 스택 그대로, 신규 패키지 없음
- Architecture: HIGH — 소스코드 직접 확인, 재사용 패턴 명확
- Pitfalls: HIGH — 실제 코드에서 발견된 엣지케이스(leaveType half, staffData 미전달, upsert 패턴)
- Calculation logic: HIGH — shiftCalc.ts와 leaves API 구조를 직접 읽어 검증

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (스택이 안정적, 30일 유효)
