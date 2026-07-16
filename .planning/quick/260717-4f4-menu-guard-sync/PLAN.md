---
id: 260717-4f4
slug: menu-guard-sync
status: in-progress
created: 2026-07-17
---

# 식단표 가드 4종 + 토요일 저장/식대 정상화 — staging 검증본 prod 이식

## 배경

식단표 밀림 전수 조사(260716) 후, staging(cbc7119-data)이 근본 수정 4종을 구현·라이브 E2E 검증 완료
(커밋 8a5f146+d16d84c+82875b5). 사용자 staging 도메인 확인 후 prod 이식 지시.
staging 은 별도 repo → cherry-pick 불가, **prod 소스 기준 재구현**. staging diff = `scratchpad/sd_*.diff`.

핵심: 로직 3파일(api/menu/mealCalc)은 prod=staging before 동일 → diff 그대로. StaffServicePage 는
파서 로직 동일하나 **menuSection 표시가 prod=인라인 style vs staging=Tailwind** → 의도만 재패치.

## 이식 항목

### A. `src/utils/mealCalc.ts` (돈 — 82875b5)
- `calcProvidedMeals`/`calcWeekendAllowance` 의 `isPrevDayHoliday` 파라미터 삭제.
- `if (dayOfWeek === 6 && isPrevDayHoliday) return 0/11000` 두 분기 제거 → 공휴일직후토 = 일반 토(제공1·5,500).
- JSDoc 정리. '그날 자체 공휴일→0/11000', '일요일 당직 11000' 유지.

### B. `src/utils/api.ts` (8a5f146)
- `menuApi.upsert(menus, pdfKey)` → `(menus, pdfKey, parserVersion?)`, body 에 `parser_version` 추가.

### C. `functions/api/menu/index.ts` (8a5f146 + d16d84c)
- body 타입에 `parser_version?: number` + **버전 게이트**: `MIN_PARSER_VERSION=2`, `pv<MIN` 이면 HTTP 426.
- 공휴일직후토 저장차단 제거: `prevDayYMD` 헬퍼 + `checkDates` 전날 추가 삭제, `dow===6` prevDay 차단 블록 삭제.

### D. `src/pages/StaffServicePage.tsx` (3커밋 통합)
1. `PARSER_VERSION = 2` 상수 (pdfjsLib workerSrc 다음, 주석 포함).
2. `prevYMD` 헬퍼 삭제(44-48).
3. 파서: `colRanges` 를 `weekdayCols` → **`dateCols` 전체**(토 포함), nextX 도 dateCols 기준. `extracted`(dow 포함)/`menus` 분리 + **구조 가드 3종 복원**: ①평일공란 `>=2` ②달력기준 `weekdayMenuCount < calendarWeekdays-1`(monday 계산 + holidayMap) ③헤더간격 1.8배(weekdayCols 기준).
4. upsert 호출에 `PARSER_VERSION` 3번째 인자(455).
5. 계산부 `isPrevDayHoliday` 제거 4곳: provided 합산(556-562), days 타입(582), days.push 초기값(589), provided 계산(598-605), selCell weekend allowance 호출.
6. `menuData` 표시 게이트: 공휴일직후토 숨김 블록(`dow===6` yest holiday) 삭제.
7. **menuSection 토 표시 하드닝(prod 인라인 재패치)**: 중식 게이트 `menu.lunch_a` → `(menu.lunch_a || menu.lunch_b)`, A코너를 `menu.lunch_a &&` 로 독립 렌더. **prod 는 `style={{ background: 'rgba(6, 182, 212, 0.08)', borderColor: ... }}` 인라인 유지**(staging Tailwind `bg-[rgba(...)]` 를 쓰지 말 것 — no-op).

### E. 데이터 (prod D1)
- `DELETE FROM holidays WHERE date='2026-07-17'` (제헌절 = 국경일, 쉬는 날 아님. stale).
- 2026 holidays 전체 감사 — 다른 stale 기념일 확인.

## 검증
- `npx tsc --noEmit` 0 오류 + `npm run build` 성공.
- 파일 간 정합: PARSER_VERSION(프론트)=2 ↔ MIN_PARSER_VERSION(백엔드)=2, upsert signature ↔ 호출 3인자.
- 어드버서리얼: staging diff 대비 누락/오적용 대조 (특히 인라인 재패치가 A/B 독립 렌더 + 게이트 정확한지).

## 배포
- 원자배포 1회: `wrangler pages deploy dist --project-name=cbc7119 --branch production` (백엔드 functions + 프론트 함께).
- holidays 삭제는 배포와 무관하게 D1 별도 실행.

## 범위 밖 (staging known-minor, 코드변경 안 함)
- 재업로드가 수기교정 토 행 덮어씀 = 평일과 동일 UPSERT semantics(의도).
- 게이트 426 시 R2 고아 PDF = 기존 4xx도 동일(관리자 전용).
- `thisYear` 하드코딩 연말경계 = 기존 이슈, 범위 밖.
