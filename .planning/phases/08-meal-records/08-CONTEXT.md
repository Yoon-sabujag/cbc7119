# Phase 8: Meal Records - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

팀원 식사 기록(미식 입력) + 월별 통계(제공 식수, 실제 식수, 미식, 주말 식대 계산). 근무표(shiftCalc) + 연차(leave 테이블) 연동으로 제공 식수 자동 계산. 메뉴표 관리(MEAL-03/04)는 데스크톱 버전에서 구현 — v1.1 제외.

</domain>

<decisions>
## Implementation Decisions

### 페이지 구조
- **D-01:** 탭 2개 — 식사 기록 / 메뉴표. AdminPage와 동일 탭 패턴
- **D-02:** /meal은 NO_NAV_PATHS에 이미 포함. 자체 헤더(← 뒤로가기) + 탭 바
- **D-03:** 메뉴표 탭은 "준비 중" placeholder (MEAL-03/04 보류)

### 식사 기록 방식 (MEAL-01)
- **D-04:** 달력형 UI — 연차 달력과 유사한 월간 그리드
- **D-05:** 역발상 입력 — 기본=제공 식수 전부 소비, 안 먹은 끼니만 기록
- **D-06:** 탭 인터랙션 — 날짜 1탭=미식 1끼, 2탭=미식 2끼, 3탭=리셋(미식 0)
- **D-07:** 미식 표시 — 날짜 셀 우상단에 숫자(①, ②). 미식 0이면 표시 없음

### 식사 제공 규칙 (근무표 연동)
- **D-08:** 평일 주간 근무: 중식 1끼
- **D-09:** 평일 당직 근무: 중식 + 석식 2끼
- **D-10:** 토요일 당직: 중식 1끼
- **D-11:** 일요일 당직: 제공 없음 (0끼)
- **D-12:** 전일 연차/공가(1.0일): 제공 없음
- **D-13:** 반차/공가(0.5일): 중식 1끼
- **D-14:** 비번: 제공 없음

### 주말 식대 계산
- **D-15:** 토요일 당직: 미제공 석식 → 5,500원
- **D-16:** 일요일 당직: 미제공 중식+석식 → 11,000원 (5,500원 × 2)
- **D-17:** 식사를 하지 않았다고 추가 식대 지급 없음 — 주말 당직 여부로만 결정

### 월별 통계 (MEAL-02)
- **D-18:** 달력 상단 요약 카드: 제공 식수 / 실제 식수 / 미식 / 주말 식대
- **D-19:** 본인 통계만 조회 (다른 직원 조회 불가)
- **D-20:** 제공 식수 = 근무표(shiftCalc) + 연차(leave 테이블) 기반 자동 계산

### 근무표/연차 연동
- **D-21:** shiftCalc의 getMonthlySchedule()로 주간/당직/비번 판정
- **D-22:** leave 테이블에서 승인된 연차/공가 조회 → 전일(1.0)이면 식수 차감, 반차(0.5)이면 중식 1끼만

### DB 스키마
- **D-23:** meal_records 테이블: staff_id + date + skipped_meals(0/1/2). 미식 0이면 행 없음(또는 0). 탭 횟수와 직접 대응
- **D-24:** 마이그레이션 1개: 0035_meal_records.sql (또는 다음 번호)

### Scope Adjustments
- **MEAL-03 보류:** 주간 메뉴표 관리 — 데스크톱 버전에서 드래그앤드롭 PDF 업로드 + pdf.js 클라이언트 추출로 구현
- **MEAL-04 보류:** PDF 텍스트 추출 — MEAL-03와 함께 데스크톱 버전에서 구현
- **스낵 메뉴 제외:** PDF의 SNACK 섹션은 파싱 대상에서 제외

### Claude's Discretion
- 달력 셀 크기 및 레이아웃 (기존 연차 달력 참고)
- 요약 카드 디자인 (기존 앱 스타일과 일관성)
- shiftCalc 연동의 구체적 API 설계 (클라이언트 계산 vs 서버 계산)
- 주말 식대 표시 위치/형태

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 근무표 연동
- `cha-bio-safety/src/utils/shiftCalc.ts` — getMonthlySchedule() 함수, 주간/당직/비번 판정 로직
- `cha-bio-safety/src/hooks/useStaffList.ts` — 직원 목록 동적 로딩 (Phase 7에서 생성)

### 연차 데이터
- `cha-bio-safety/functions/api/leaves/` — 연차/공가 API, leave 테이블 조회
- `cha-bio-safety/migrations/0031_leaves_expand_types.sql` — 연차 타입 확장 스키마

### 기존 달력 패턴
- `cha-bio-safety/src/pages/LeavePage.tsx` — 연차 달력 UI 패턴 참고 (탭 인터랙션)
- `cha-bio-safety/src/pages/SchedulePage.tsx` — 월간 캘린더 UI 패턴 참고

### Navigation
- `cha-bio-safety/src/components/SideMenu.tsx` — '식당 메뉴' soon:true (line 34), 활성화 필요
- `cha-bio-safety/src/App.tsx` — NO_NAV_PATHS에 /meal 포함 (line 51), 라우트 추가 필요

### 메뉴표 PDF 샘플
- `작업용/CBC Weekly MENU (03.30_04.04).pdf` — 실제 주간 메뉴표 PDF 샘플. 평일 중식 A/B코스+샐러드+PLUS+CORNER, 석식 단일+샐러드, 토요일 중식 단일. 스낵 제외

### Requirements
- `.planning/REQUIREMENTS.md` — MEAL-01, MEAL-02 (MEAL-03/04 보류)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `LeavePage.tsx`: 월간 달력 그리드 + 날짜 탭 인터랙션 — 식사 달력에 유사 패턴 재활용
- `shiftCalc.ts`: getMonthlySchedule() — 근무 유형(주간/당직/비번) 판정
- `useStaffList.ts`: 직원 목록 훅 (Phase 7)
- `AdminPage.tsx`: 탭 네비게이션 패턴

### Established Patterns
- 인라인 스타일 + CSS 변수 (var(--bg), var(--t1) 등)
- React Query 캐싱 (staleTime 30초)
- toast 알림 (react-hot-toast)
- NO_NAV_PATHS 페이지: 자체 헤더 + ← 뒤로가기

### Integration Points
- App.tsx: /meal 라우트 + lazy import 추가
- SideMenu.tsx: '식당 메뉴' soon:true → soon:false 전환, 라벨 변경 가능
- shiftCalc.ts: getMonthlySchedule() 결과로 일별 제공 식수 계산
- leave 테이블: 연차/공가로 식수 차감

</code_context>

<specifics>
## Specific Ideas

- 연차 달력처럼 날짜 탭 인터랙션 (사용자 명시적 요청)
- 먹은 식사가 아닌 안 먹은 식사(미식)를 기록하는 역발상 (사용자 명시적 요청)
- 주말 식대: 토요일 당직 5,500원, 일요일 당직 11,000원 — 미식 여부와 무관하게 당직 여부로만 결정 (사용자 명시적 확인)
- 근무표 + 연차 + 식사 달력 통합은 미래 과제 (사용자 언급, deferred)

</specifics>

<deferred>
## Deferred Ideas

- **MEAL-03 메뉴표 관리** — 데스크톱 버전에서 드래그앤드롭 PDF 업로드 → pdf.js 클라이언트 추출 → 요일/코스별 자동 파싱. 현재 MealPage 메뉴표 탭은 placeholder
- **MEAL-04 PDF 텍스트 추출** — MEAL-03와 함께 구현. PDF 구조: 평일 중식(A/B/샐러드/PLUS/CORNER) + 석식(단일/샐러드) + 토요일(단일코스). 스낵 제외
- **근무표+연차+식사 달력 통합** — 세 달력을 하나로 합치는 미래 과제. 현재 근무표 페이지는 관리자용으로 유지

</deferred>

---

*Phase: 08-meal-records*
*Context gathered: 2026-04-02*
