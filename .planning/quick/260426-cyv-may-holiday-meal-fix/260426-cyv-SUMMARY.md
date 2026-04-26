---
quick_id: 260426-cyv
slug: may-holiday-meal-fix
status: complete
date: 2026-04-26
commits:
  - task_1_hash: b429fc3
  - task_2_hash: 76a8aa5
  - docs_hash: 69d3ec2
files_changed:
  - cha-bio-safety/src/utils/holidays.ts (NEW)
  - cha-bio-safety/src/utils/shiftCalc.ts
  - cha-bio-safety/src/utils/mealCalc.ts
  - cha-bio-safety/src/pages/SchedulePage.tsx
  - cha-bio-safety/src/pages/StaffServicePage.tsx
build: passed
deployed: true
deploy_url: https://66de7c65.cbc7119.pages.dev
verified_by_user: 2026-04-26
---

# Phase Quick 260426-cyv: 5월 노동절 인식 + 식대 보정 Summary

## 무엇을 고쳤나

`@hyunbinseo/holidays-kr` 라이브러리가 근로자의 날(5/1)을 법정공휴일로 인식하지 않아 일정/식대 계산에서 누락되던 문제를 수정. 동시에 `mealCalc` 두 함수에 `isHoliday` / `isPrevDayHoliday` 옵션을 추가하여 평일 공휴일 당직자(식당 운영 X)와 공휴일 직후 토요일 당직자(식당 점심도 운영 X)의 식대가 정확히 ₩11,000 으로 잡히도록 보정. 두 페이지(SchedulePage / StaffServicePage)가 각자 들고 있던 동일 fallback 맵을 공통 `utils/holidays.ts` 로 통합하여 새 공휴일 추가 시 한 곳만 수정하면 되도록 단일 소스화.

## 새 함수 / 헬퍼 시그니처

- `utils/holidays.ts` (NEW) → `HOLIDAYS_FALLBACK: Record<string, string>`, `isFallbackHoliday(date: Date): boolean`
- `shiftCalc.isKoreanHolidayOrWeekend` → 라이브러리 false 인 경우 `isFallbackHoliday(date)` 로 보강
- `mealCalc.calcProvidedMeals(rawShift, leaveType, dow, isHoliday=false, isPrevDayHoliday=false)`
- `mealCalc.calcWeekendAllowance(rawShift, dow, isHoliday=false, isPrevDayHoliday=false)`
- `StaffServicePage.prevYMD(date: Date): string` (모듈 레벨 헬퍼, 월/연 경계 안전)

기존 호출자는 모두 옵션 인자 기본값 false 로 100% 호환 (운영 옵션만 변경).

## 회귀 테스트 mental walkthrough

| 케이스 | 전 | 후 | 결과 |
|---|---|---|---|
| 5/1 (금, 근로자의 날) 당직 | 제공 2, 식대 0 | 제공 0, 식대 11,000 | 보정 ✓ |
| 5/2 (토, 공휴일 직후) 당직 | 제공 1, 식대 5,500 | 제공 0, 식대 11,000 | 보정 ✓ |
| 5/9 (토, 일반) 당직 | 제공 1, 식대 5,500 | 제공 1, 식대 5,500 | 회귀 없음 ✓ |
| 5/10 (일) 당직 | 제공 0, 식대 11,000 | 제공 0, 식대 11,000 | 회귀 없음 ✓ |
| 5/4 (월, 평일) 당직 | 제공 2, 식대 0 | 제공 2, 식대 0 | 회귀 없음 ✓ |
| 5/5 (화, 어린이날) 당직 | 제공 2, 식대 0 (라이브러리는 인식하지만 mealCalc 가 모름) | 제공 0, 식대 11,000 | 보정 ✓ |

`shiftCalc.isKoreanHolidayOrWeekend` 도 5/1 에 대해 라이브러리 false → fallback true 로 폴백되므로, 5/1 주간 사이클 직원의 RawShift 가 '주' → '휴' 로 자동 변환됨.

## 호출부 보정 (5곳, 모두 holidayMap 기반)

| 위치 | 함수 | 변경 |
|---|---|---|
| `monthlySummary` | calcProvidedMeals | isHoliday + isPrevDayHoliday 추가 |
| `monthlySummary` | calcWeekendAllowance | isHoliday + isPrevDayHoliday 추가 |
| `calendarDays` | calcProvidedMeals | isHoliday + isPrevDayHoliday 추가, push 객체에 isPrevDayHoliday 포함 |
| 모바일 selCell 모달 | calcWeekendAllowance | selCell.isHoliday, selCell.isPrevDayHoliday 전달 |
| 데스크톱 selCell 패널 | calcWeekendAllowance | selCell.isHoliday, selCell.isPrevDayHoliday 전달 |

selCell 객체 타입에 `isPrevDayHoliday: boolean` 필드 추가, useMemo deps 에 `holidayMap` 추가 (monthlySummary, calendarDays 둘 다).

## 디자인/레이아웃

변경 없음. ₩{allow.toLocaleString()} 표시 형식, 색상(#a855f7), 패딩, 보더 모두 그대로.

## 빌드 검증

`cd cha-bio-safety && npm run build` Task 1 / Task 2 양쪽 모두 type error 없이 통과 (각 ~10초).
PWA 서비스워커 67 entries, 5999 KiB precache.

## 배포 + 사용자 검증 시 확인할 케이스 (PLAN.md Task 3 Step B)

1. **`/schedule` → 2026년 5월**
   - 5/1 (금) 셀이 빨간 공휴일로 표시되는가? (홀리데이 이름은 "근로자의 날" 또는 외부 API 가 주는 이름)

2. **`/staff-service` (인사) → 본인 또는 5/1 당직 사이클 직원 → 2026년 5월**
   - 5/1 (금) 셀이 빨간색 + '휴' 라벨로 표시되는가? (평소 5/1 에 '주' 사이클이었다면 이제 '휴'. 당직 사이클이었다면 '당' 그대로지만 식대만 변경.)
   - 5/1 셀 클릭 → 주말식대 카드에 ₩11,000 표시되는가? (당직 사이클일 때만)
   - 5/2 (토) 셀 클릭 → 그 직원이 토요일 당직이면 주말식대 ₩11,000 (5,500 아님) 표시되는가?
   - 월간 요약 카드: "주말식대 ₩XX,XXX" 가 5/1 + 5/2 보정분 만큼 증가되었는가?

3. **회귀 확인:**
   - 5/9 (토) 일반 토요일 당직 → 식대 ₩5,500 그대로
   - 5/10 (일) 일요일 당직 → 식대 ₩11,000 그대로
   - 5/4 (월) 평일 당직 → 주말식대 0, 제공식수 2 그대로
   - 5/5 (화·어린이날) 당직 → 식대 ₩11,000, 제공식수 0 (어린이날도 평일공휴일이므로 같은 보정 적용됨)
   - 5/6 (수) 평일 → 변동 없음

4. **(선택) 5월 외:**
   - 6월 6일 (현충일·토요일) — 토요일이면서 공휴일. 새 로직: isHoliday=true → 11,000 (현충일 당직자가 식당 못 가니까 11,000 이 의도)

5. **PWA 캐시 안 풀리면:** 모바일 앱 재설치 또는 Cmd+Shift+R 강제새로고침.

## 다음 단계

orchestrator 가 main 머지 → `cd cha-bio-safety && npm run deploy -- --branch production --commit-message "fix(meal): may holiday recognition + meal calc"` → 사용자 시각 검증 (Task 3 Step B). 사용자 메모 — `--branch production` 누락 시 Preview 로 감, 한글 commit-message wrangler 가 거부 가능 → ASCII 별도 지정 필요.

## Self-Check: PASSED

- holidays.ts 신규 파일 존재 ✓
- Task 1 commit b429fc3 git log 에 존재 ✓
- Task 2 commit 76a8aa5 git log 에 존재 ✓
- 모든 호출부 5곳 새 시그니처로 호출 (grep 6개 라인 — import 1 + 호출 5) ✓
- 빌드 type error 0 ✓
