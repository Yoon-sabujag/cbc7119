---
slug: multiday-schedule-missing
status: fixing
trigger: 다일짜리 (multi-day) 월간 점검 일정이 첫날에만 대시보드 '오늘 일정'에 노출되고 후속일에 누락됨
created: 2026-05-18
updated: 2026-05-18
---

# Debug Session: multiday-schedule-missing

## Symptoms

- **Expected:** 5/13~5/18 (주말 제외 4일 연속) 소방 상반기 종합정밀점검 일정이 매일 (5/13, 5/14, 5/15, 5/18) 대시보드 "오늘 일정" 영역에 표시되어야 함
- **Actual:** 첫날 5/13 에만 표시됐고 후속일 5/14, 5/15, 5/18 에는 표시 안 됨
- **Error messages:** 없음 (UI 표시 누락, 콘솔 에러 보고 없음)
- **Timeline:** 5/13 정상 → 5/14 부터 누락. 오늘 (5/18) 도 안 나옴
- **Reproduction:** 월간 점검 계획에 다일짜리 (multi-day) 점검을 등록 → 첫날 대시보드는 OK → 후속일 대시보드 접속 시 누락
- **Scope:** 단일 점검 (1일짜리) 은 정상 작동. 문제는 multi-day 일정 한정.
- **Platform:** 전 플랫폼 (서버 SQL 버그)

## Current Focus

- **hypothesis:** **CONFIRMED** — 1순위. schedule_items 는 multi-day 일정을 단일 row + (date, end_date) 로 저장. 대시보드 "오늘 일정" SELECT 가 `WHERE date = ?` 로 시작일만 매칭. 후속일 누락.
- **next_action:** stats.ts 의 3 개 start-date-only SELECT 를 `(date <= ? AND COALESCE(end_date, date) >= ?)` 패턴으로 통일 + 주말/공휴일 자동 제외 적용
- **specialist_hint:** cloudflare-d1-sqlite

## Evidence

- timestamp: 2026-05-18 (schema)
  - schedule_items 컬럼 (migrations/0001_init.sql:56 + 0044_schedule_end_date.sql:2)
  - 핵심: `date TEXT NOT NULL` (시작일) + `end_date TEXT` (다일짜리만 set, 단일은 NULL)
  - 0044 주석: "schedule_items에 종료일 컬럼 추가 (법적점검 등 다일간 일정)"

- timestamp: 2026-05-18 (write path — SchedulePage)
  - src/pages/SchedulePage.tsx:735-748 — "멀티데이 일정은 항상 단일 항목 + end_date 로 저장" 주석
  - hasRange ? { end_date: endDate } : {} — body 에 end_date 만 추가
  - functions/api/schedule/index.ts:87-100 — INSERT 1 row, end_date 컬럼에 단순 저장
  - => alt hypothesis A (split insert) 기각. 단일 row + end_date 저장이 의도된 스키마.

- timestamp: 2026-05-18 (read paths — 일관성 분석)
  - GET /api/schedule?date=  (functions/api/schedule/index.ts:14-15):
    `(date=? OR (end_date IS NOT NULL AND date<=? AND end_date>=?))` ✅ 범위 처리 OK
  - GET /api/schedule?month= (functions/api/schedule/index.ts:17-18):
    `(date LIKE ? OR (end_date IS NOT NULL AND date<=? AND end_date>=?))` ✅ 범위 처리 OK
  - SchedulePage matchesDate (src/pages/SchedulePage.tsx:154-162):
    클라이언트 측 범위 + 주말·공휴일 제외 ✅
  - dashboard monthScheduleDates (functions/api/dashboard/stats.ts:420-463):
    `WHERE date <= ? AND COALESCE(end_date, date) >= ?` + 주말·공휴일 제외 ✅
    (이미 캘린더 dot 용으로는 fix 되어 있음)
  - **dashboard "오늘 일정" (functions/api/dashboard/stats.ts:155-161): ❌ `WHERE date = ?` 만**
  - dashboard inspTot 서브쿼리 (stats.ts:165-172): ❌ `WHERE date=?` 만
  - dashboard todayCats (stats.ts:184-187): ❌ `WHERE date=?` 만
  - dashboard calcStreakDays (stats.ts:61-66): `WHERE date BETWEEN ? AND ?` — multi-day 첫날만 hit 되지만 streak 는 inspect 카테고리 grouping 이라 후속일 표시 누락은 별개. 일단 보류.

- timestamp: 2026-05-18 (timezone 가설 검증)
  - stats.ts:151 `todayKST()` 사용 → KST 일자 문자열. SchedulePage 와 동일 기준. KST 오프셋 이슈는 없음.
  - 5/13 (수) ~ 5/18 (월) 범위 입력 시: 주말 5/16(토), 5/17(일) 자동 제외 → 표시 대상 5/13/14/15/18 = 사용자 expected 와 일치.
  - => alt hypothesis B (timezone) 기각.

- timestamp: 2026-05-18 (cache 가설 검증)
  - React Query staleTime 30s, 다일 다른 세션도 동일 증상 — 서버 응답 자체가 누락. cache 무관.
  - => alt hypothesis C (cache) 기각.

## Eliminated

- alt hypothesis A — split insert: 의도된 스키마가 "단일 row + end_date". split 아님.
- alt hypothesis B — timezone: todayKST() 일관 사용, 후속일 모두 누락이라 timezone 경계와 무관.
- alt hypothesis C — cache: 서버 SELECT 자체가 후속일을 못 잡음. staleTime 만료/강제 새로고침과 무관.

## Resolution

- **root_cause:**
  `functions/api/dashboard/stats.ts` 의 "오늘 일정" / `inspTot` / `todayCats` 3 개 SELECT 가 `WHERE date = ?` 로 시작일만 매칭. multi-day 일정 (date + end_date) 의 후속일을 못 찾음. 다른 모든 read path (schedule API, SchedulePage matchesDate, monthScheduleDates) 는 이미 범위 처리되어 있고 이 3 개만 누락.

- **fix:**
  3 개 SELECT 를 `(date <= ? AND COALESCE(end_date, date) >= ?)` 패턴으로 변경.
  "오늘 일정" SELECT 결과에는 주말·공휴일 자동 제외 룰 적용 (SchedulePage matchesDate / monthScheduleDates 와 동일):
  - 단일 일자 (end_date NULL): 사용자가 명시한 거니까 주말/공휴일도 표시
  - multi-day range 안의 day: 주말·공휴일 제외
  - JS 측에서 holidays 테이블 조회 후 필터. SQL 은 raw row 가져옴.

- **verification:**
  - 오늘 (5/18 월) 대시보드 접속 시 "소방 상반기 종합정밀점검" 표시 확인
  - 단일 일자 일정 (회의 등) 정상 표시 유지 확인
  - 주말 5/16/17 에 표시 안 됨 (range 안이지만 자동 제외) — 별도 검증 어렵지만 5/18 표시되면 코드 룰 일관성 OK

- **files_changed:**
  - functions/api/dashboard/stats.ts (3 개 SELECT + 주말/공휴일 필터)
