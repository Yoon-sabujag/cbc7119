# Phase 4: Completion Tracking & Daily Reporting - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

일일업무일지(방재업무일지) 엑셀 자동 조합 출력(EXCEL-06), 점검 계획 일정과 점검 기록의 자동 연결(LINK-01), 대시보드 오늘 일정의 완료/미완료 상태 실시간 표시(LINK-02)를 구현한다.

</domain>

<decisions>
## Implementation Decisions

### 일일업무일지 출력 (EXCEL-06)
- **D-01:** 일별 1장 다운로드 + 월별 누적 다운로드 둘 다 지원. UI에서 날짜/월 토글로 전환.
- **D-02:** 일별 파일명: `방재업무일지(dd일).xlsx`, 월별 파일명: `일일업무일지(mm월).xlsx`
- **D-03:** 월별 누적 파일은 오늘까지만 시트 생성 (미래 날짜 제외)
- **D-04:** 별도 `/daily-report` 페이지 신설. 특이사항 입력 UI + 날짜/월 선택 + 미리보기 + 다운로드 배치.
- **D-05:** 특이사항은 `daily_notes` 전용 테이블에 DB 저장. 스키마: `daily_notes(id, date, content, created_by, created_at, updated_at)`. 날짜별 1건.
- **D-06:** 양식 시트(Sheet1)만 추출하여 `public/templates/daily_report_template.xlsx`로 템플릿화. 작성법 시트는 코드 로직에 반영.
- **D-07:** 월별 누적 파일은 템플릿 시트를 fflate XML 복제로 N개 시트 생성. 시트명 = 날짜(1일, 2일, ...).

### 순찰 교대 로직
- **D-08:** 기준일 고정 방식(shiftCalc.ts 패턴). 매월 1일은 전월 1일 기준으로 결정, 이후는 전일 기준 교대.
- **D-09:** 평일 저녁순찰: 22:00~23:00, 휴일 저녁순찰: 21:00~22:00, 야간순찰: 01:00~02:00. 저녁/야간이 하루씩 번갈아 기재.
- **D-10:** 공휴일 판정: 토/일 + 한국 법정 공휴일. `holidays-kr` npm 패키지 활용 (https://github.com/hyunbinseo/holidays-kr).

### 금일업무/명일업무 조건 로직
- **D-11:** 클라이언트 유틸리티 `src/utils/dailyReportCalc.ts`에 구현. 작성법 Sheet3(금일업무), Sheet4(명일업무)의 조건 로직을 코드화.
- **D-12:** 일상점검(매일), 순찰(교대), 월점검(schedule_items 기반 조건 판단), 업무/승강기/소방(schedule_items 기반) 항목을 조건에 따라 동적 생성.

### 인원현황
- **D-13:** shiftCalc.ts 기존 로직 활용. 총원(4), 현재원, 당직, 비번, 휴무, 연차, 반차, 교육/훈련, 결원, 주간근무자, 당직자 자동 계산.
- **D-14:** 연차/반차는 leaves 테이블 조회, 교육/훈련은 schedule_items 조회.

### 데이터 수집
- **D-15:** 서버 API 1개로 통합: `GET /api/daily-report?date=YYYY-MM-DD`. 응답에 schedule_items, elevator_faults, leaves, fire_schedules 포함.
- **D-16:** 클라이언트에서 API 데이터 + shiftCalc + dailyReportCalc 조합하여 Excel 생성.

### 일정↔점검 연결 (LINK-01)
- **D-17:** 날짜+카테고리 자동 매칭. schedule_items.date + inspection_category를 check_records의 checked_at + checkpoint.category로 JOIN. DB 스키마 변경 없음.
- **D-18:** 일정 완료 판정: 해당 카테고리 점검 기록 1건 이상이면 '완료'.
- **D-19:** inspect 외 일정(event, elevator, task 등)은 수동 완료만 지원.
- **D-20:** 점검 완료율 계산 범위: 일정일~다음 같은 카테고리 일정일 전날. 멀티데이 점검(DIV 월2회×2일, 소화전 2일, 소화기 3일) 자연 처리.

### 대시보드 완료 표시 (LINK-02)
- **D-21:** 체크마크 + 색상. 완료된 일정에 ✓ + 초록색 배경, 미완료는 기본색. 기존 StatusBadge 컴포넌트 활용.
- **D-22:** API 조회 시 실시간 계산. 대시보드 로드 시 check_records JOIN으로 완료 상태 계산. 별도 상태 필드 업데이트 불필요.

### Claude's Discretion
- 순찰 교대 기준일(REF_DATE) 결정 및 초기값 설정
- daily_report API의 구체적 응답 스키마
- dailyReportCalc.ts 내부 구조 및 함수 분할
- Excel XML 멀티시트 복제 구현 방식
- 대시보드 stats API 리팩토링 범위 (기존 로직 활용 vs 신규 엔드포인트)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 일일업무일지 양식 및 작성법
- `작업용/점검 일지 양식/일일업무일지(01월).xlsx` — 4시트 양식 파일. Sheet1=방재업무일지 양식, Sheet2=셀 위치 매핑, Sheet3=금일업무 조건 로직, Sheet4=명일업무 조건 로직
- `작업용/점검 일지 양식/점검 일지 작성법.md` — 항목 10에 일일업무일지 작성법: 월별 누적 관리, 일별 독립 파일 다운로드, 파일명 규칙

### 기존 Excel 생성 패턴
- `cha-bio-safety/src/utils/generateExcel.ts` — fflate 기반 xlsx 템플릿 패칭 패턴 (Phase 3에서 shared-string 인식 패치 구축됨)

### 근무표 계산
- `cha-bio-safety/src/utils/shiftCalc.ts` — 3교대 근무 계산 (당/비/주/휴), 기준일 패턴, 직원 4인 하드코딩

### 대시보드 및 일정 API
- `cha-bio-safety/functions/api/dashboard/stats.ts` — 기존 점검 완료율 계산 로직 (schedule_items ↔ check_records JOIN)
- `cha-bio-safety/functions/api/schedule/index.ts` — 일정 CRUD API
- `cha-bio-safety/functions/api/schedule/[id].ts` — 일정 상세/수정/삭제 API

### DB 스키마
- `cha-bio-safety/migrations/` — 기존 테이블 구조 (schedule_items, check_records, check_points, elevators, leaves 등)

### 공휴일 라이브러리
- https://github.com/hyunbinseo/holidays-kr — 한국 법정 공휴일 npm 패키지 (사용자 지정)

### Phase 3 발견 사항
- `.planning/phases/03-excel-reports-annual-matrix-types/03-CONTEXT.md` — shared-string 패치 방식, fflate 패턴, ○ 기호 규칙

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `shiftCalc.ts`: 3교대 근무 계산 — 인원현황 섹션에 직접 활용. getMonthlySchedule(), getRawShift() 함수.
- `generateExcel.ts`: fflate unzip→patch→rezip 패턴 — 일일업무일지 Excel 생성에 동일 패턴 적용.
- `StatusBadge` (src/components/ui/): 대시보드 일정 완료 상태 표시에 활용.
- `DutyChip` (src/components/ui/): 근무 타입 표시 칩 — 인원현황과 연관.
- `dashboardApi.getStats()`: 기존 점검 통계 API — 완료율 계산 로직 참고/확장.

### Established Patterns
- Excel 생성: 클라이언트 사이드 fflate 패턴 (Workers CPU 제한)
- API: `onRequestGet`/`onRequestPost` Pages Functions 패턴
- 상태관리: Zustand (authStore) + React Query (서버 데이터)
- 날짜 처리: todayKST() 유틸리티 (서버), Date 객체 직접 사용 (클라이언트)

### Integration Points
- `/daily-report` 라우트 추가: `src/App.tsx` 라우터 + `src/components/SideMenu.tsx` 네비게이션
- `GET /api/daily-report`: 새 Pages Function 엔드포인트 (`functions/api/daily-report/index.ts`)
- `daily_notes` 테이블: 새 마이그레이션 파일 필요
- `public/templates/daily_report_template.xlsx`: 양식 시트 추출 후 배치

</code_context>

<specifics>
## Specific Ideas

- 작성법 Sheet3의 금일업무 항목은 번호가 동적으로 증가함 (일상점검 1~3번 고정, 이후 월점검/업무/승강기/소방은 조건에 따라 번호 부여)
- 야간순찰/저녁순찰 교대는 전월 1일 기준으로 체인이 시작되며, 월 내에서는 전일 기준 교대. 평일/휴일에 따라 시간대가 다름.
- 멀티데이 점검 패턴: DIV(월2회×2일=4일), 소화전/비상콘센트(월1회×2일), 소화기(월1회×3일) — 완료율 계산 시 일정일~다음일정일 범위로 처리
- 현재 점검 진행율이 100% 미만인 상태에서 다른 날 추가 점검 시 해당 일정의 완료율에 반영되어야 함 (날짜 범위 기반 귀속)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-completion-tracking-daily-reporting*
*Context gathered: 2026-03-30*
