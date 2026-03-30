# Phase 4: Completion Tracking & Daily Reporting - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 04-completion-tracking-daily-reporting
**Areas discussed:** 일일업무일지 양식/내용, 일정↔점검 연결 방식, 대시보드 완료 표시, 데이터 수집, 특이사항 DB 스키마, 법정 공휴일 데이터, 엑셀 템플릿 처리

---

## 일일업무일지 양식/내용

### 출력 단위

| Option | Description | Selected |
|--------|-------------|----------|
| 일별 1장 다운로드 | 날짜 선택 → 해당일 방재업무일지 1장 xlsx | |
| 월별 누적 다운로드 | 월 선택 → 1일~말일 전체 시트 xlsx | |
| 둘 다 지원 | 일별 + 월별 모두 선택 가능, UI에서 토글 | ✓ |

**User's choice:** 둘 다 지원
**Notes:** 작성법 문서에 '평일의 경우 해당 날짜 시트만 있는 독립된 파일 다운로드' 명시

### 특이사항 처리

| Option | Description | Selected |
|--------|-------------|----------|
| 빈 칸으로 출력 | 특이사항 칸은 비워둔 채 출력, 엑셀에서 직접 작성 | |
| 입력 UI 제공 | 다운로드 전 텍스트 입력, DB 저장 후 엑셀에 반영 | ✓ |

**User's choice:** 입력 UI 제공
**Notes:** None

### 순찰 교대 로직

| Option | Description | Selected |
|--------|-------------|----------|
| 기준일 고정 | shiftCalc.ts 패턴, 기준일+짝/홀수 계산 | |
| DB에 순찰 기록 저장 | 매일 순찰 결과 DB 저장, 전일 조회로 교대 판단 | |

**User's choice:** Claude's Discretion — "어떤 방식이 나을지 니가 판단해봐"
**Notes:** 전월 1일 기준으로 이번달 1일 결정, 이후 전일 기준 교대. 평일/휴일 순찰 시간 다름.

### 공휴일 판정

| Option | Description | Selected |
|--------|-------------|----------|
| 토/일만 | 주말만 휴일 처리 | |
| 토/일 + 법정 공휴일 | 한국 법정 공휴일 데이터 포함 | ✓ |
| 토/일 + DB 휴일 설정 | 관리자가 DB에서 휴일 등록/수정 | |

**User's choice:** 토/일 + 법정 공휴일

### 미래 날짜 처리

| Option | Description | Selected |
|--------|-------------|----------|
| 오늘까지만 생성 | 월 중간 다운로드 시 1일~오늘까지만 시트 생성 | ✓ |
| 전체 날짜 예측 생성 | 미래 날짜도 예측 데이터로 생성 | |

**User's choice:** 오늘까지만 생성

### UI 위치

| Option | Description | Selected |
|--------|-------------|----------|
| 기존 /report 페이지 확장 | 점검일지 9종 아래에 섹션 추가 | |
| 별도 /daily-report 페이지 | 새 페이지로 분리 | ✓ |

**User's choice:** 별도 /daily-report 페이지

---

## 일정↔점검 연결 방식

### 연결 방식

| Option | Description | Selected |
|--------|-------------|----------|
| 날짜+카테고리 자동 매칭 | JOIN 기반, DB 스키마 변경 없음 | ✓ |
| FK 추가 (schedule_id) | check_records에 FK 추가, 마이그레이션 필요 | |
| 둘 다 적용 | 자동 매칭 + FK | |

**User's choice:** 날짜+카테고리 자동 매칭

### 완료 판정 기준

| Option | Description | Selected |
|--------|-------------|----------|
| 해당 카테고리 점검 기록 1건 이상 | 단순, 대시보드와 일관 | ✓ |
| 전체 개소 점검 완료율 기준 | 모든 활성 개소 점검 필요 | |
| 수동 완료 처리 | 사용자가 직접 완료 표시 | |

**User's choice:** 해당 카테고리 점검 기록 1건 이상

### 비점검 일정 완료

| Option | Description | Selected |
|--------|-------------|----------|
| 수동 완료만 | inspect 외 일정은 사용자가 직접 완료 처리 | ✓ |
| 카테고리별 개별 로직 | elevator는 고장 기록 연동 등 | |

**User's choice:** 수동 완료만

### 점검 완료율 계산 범위

**User's choice:** 일정일~다음 일정일 전날
**Notes:** DIV는 월 2회 각 2일 연속(총 4일), 소화전/비상콘센트는 월 1회 2일 연속, 소화기는 월 1회 3일 연속. 멀티데이 점검 패턴을 일정일~다음일정일 범위로 자연 처리. 현재 시스템에서 다른 날 추가 점검 시 해당 일정의 완료율에 반영되지 않는 문제가 있음 — 날짜 범위 기반 귀속으로 해결.

---

## 대시보드 완료 표시

### 완료 UI

| Option | Description | Selected |
|--------|-------------|----------|
| 체크마크 + 색상 | 완료=✓+초록, 미완료=기본 | ✓ |
| 진행률 바 | 점검 완료율 프로그레스바 | |
| 점검 완료 카운트 | '점검 12/34개소' 숫자 표시 | |

**User's choice:** 체크마크 + 색상

### 실시간 계산

| Option | Description | Selected |
|--------|-------------|----------|
| API 조회 시 계산 | 대시보드 로드 시 JOIN으로 계산 | ✓ |
| status 필드 업데이트 | 점검 완료 시 schedule_items.status 업데이트 | |

**User's choice:** 각종 점검일지 작성이나 일일업무보고 작성에 문제없는 방향 → API 조회 시 계산

---

## 데이터 수집

### 데이터 조합 방식

| Option | Description | Selected |
|--------|-------------|----------|
| 서버 API 1개로 통합 | GET /api/daily-report, shiftCalc 서버 복제 필요 | ✓ |
| 클라이언트에서 개별 fetch 후 조합 | 기존 API 활용, 신규 API 불필요 | |
| 하이브리드 | 인원현황=클라이언트, 나머지=서버 API | |

**User's choice:** 서버 API 1개로 통합

### 로직 위치

| Option | Description | Selected |
|--------|-------------|----------|
| 클라이언트 유틸리티 | src/utils/dailyReportCalc.ts | ✓ |
| 서버 측 | API에서 조건 판단까지 처리 | |

**User's choice:** 클라이언트 유틸리티

---

## 특이사항 DB 스키마

| Option | Description | Selected |
|--------|-------------|----------|
| daily_notes 전용 테이블 | daily_notes(id, date, content, created_by, created_at, updated_at) | ✓ |
| 기존 schedule_items 확장 | notes 필드 추가 | |
| 범용 memos 테이블 | memos(id, type, ref_date, content, ...) | |

**User's choice:** daily_notes 전용 테이블

---

## 법정 공휴일 데이터 관리

| Option | Description | Selected |
|--------|-------------|----------|
| 클라이언트 정적 데이터 | holidays.ts에 하드코딩 | |
| DB holidays 테이블 | 관리자 UI에서 관리 | |
| 외부 API | 공공데이터 API 활용 | |
| holidays-kr npm 패키지 | github.com/hyunbinseo/holidays-kr | ✓ |

**User's choice:** holidays-kr npm 패키지
**Notes:** 사용자가 이전에 이 라이브러리를 추천한 바 있음

---

## 엑셀 템플릿 처리

### 템플릿 처리

| Option | Description | Selected |
|--------|-------------|----------|
| 양식 시트만 추출해 템플릿화 | Sheet1만 추출, public/templates/daily_report_template.xlsx | ✓ |
| 전체 파일 그대로 사용 | 4시트 전체 유지 | |

**User's choice:** 양식 시트만 추출해 템플릿화

### 멀티시트 처리

| Option | Description | Selected |
|--------|-------------|----------|
| 템플릿 시트 복제해 N개 생성 | fflate XML 복제 + 시트명 변경 | ✓ |
| 날짜별 개별 파일 | 월별 누적 대신 개별 파일만 제공 | |

**User's choice:** 템플릿 시트 복제해 N개 생성

---

## Claude's Discretion

- 순찰 교대 기준일(REF_DATE) 결정 및 초기값 설정
- daily_report API 구체적 응답 스키마
- dailyReportCalc.ts 내부 구조
- Excel XML 멀티시트 복제 구현 방식
- 대시보드 stats API 리팩토링 범위

## Deferred Ideas

None — discussion stayed within phase scope
