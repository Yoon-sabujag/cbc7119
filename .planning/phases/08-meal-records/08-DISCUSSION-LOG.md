# Phase 8: Meal Records - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-02
**Phase:** 08-meal-records
**Areas discussed:** 페이지 구조, 식사 기록 방식, 월별 통계 표시, 메뉴표 관리, 달력 UI 상세, 근무표 연동 방식, DB 스키마

---

## 페이지 구조

| Option | Description | Selected |
|--------|-------------|----------|
| 탭 2개 | 식사기록(기록+통계) / 메뉴표. AdminPage와 동일 탭 패턴 | ✓ |
| 탭 3개 | 식사기록 / 메뉴표 / 통계 각각 별도 탭 | |
| 단일 스크롤 | 한 페이지에 메뉴표 + 식사기록 + 통계 나열 | |

**User's choice:** 탭 2개

---

## 식사 기록 방식

| Option | Description | Selected |
|--------|-------------|----------|
| 날짜별 리스트 + 토글 | 최근 날짜 역순, 조식/중식/석식 토글 | |
| 달력형 | 월간 달력 뷰에서 날짜 선택 → 체크 | ✓ |
| 오늘만 기록 | 당일 식사만 기록, 과거 수정 불가 | |

**User's choice:** 달력형 — 역발상 입력
**Notes:** 매우 상세한 비즈니스 로직 제공:
- 평일 주간=중식1, 평일 당직=중식+석식2, 토요일 당직=중식1, 일요일 당직=0
- 전일연차/공가=0, 반차/공가(0.5)=중식1
- 기본=제공 식수 전부 소비, 안 먹은 끼니만 입력 (역발상)
- 날짜 탭: 1탭=1끼 미식, 2탭=2끼 미식, 3탭=리셋 (연차 달력 패턴)
- 주말 식대: 토 당직 5,500원(석식), 일 당직 11,000원(중식+석식) — 미식과 무관
- 근무표+연차 데이터 연동 필요

---

## 월별 통계 표시

| Option | Description | Selected |
|--------|-------------|----------|
| 달력 상단 요약 | 식사기록 탭 달력 위에 요약 카드 | ✓ |
| 별도 통계 섹션 | 하단 접이식 영역 | |
| Claude 판단 | | |

**User's choice:** 달력 상단 요약

---

## 통계 조회 범위

| Option | Description | Selected |
|--------|-------------|----------|
| 본인만 | 각자 본인 식사 기록만 조회 | ✓ |
| 관리자는 전체 | admin은 모든 직원 통계 조회 가능 | |

**User's choice:** 본인만

---

## 메뉴표 관리

**User's choice:** 데스크톱 버전에서 구현 — v1.1 제외
**Notes:** 사용자가 수동 입력은 비현실적이라고 판단. 드래그앤드롭 PDF 업로드 → pdf.js 클라이언트 추출 방식을 데스크톱 브라우저 전용으로 구현 예정. 현재는 메뉴표 탭 placeholder.

---

## 달력 UI 상세 — 미식 표시

| Option | Description | Selected |
|--------|-------------|----------|
| 숫자 표시 | 미식 1끼=①, 2끼=② 날짜 셀 우상단. 0이면 없음 | ✓ |
| 돈 배경색 | 미식 정도에 따라 색상 변화 | |
| Claude 판단 | | |

**User's choice:** 숫자 표시

---

## 근무표 연동 방식

| Option | Description | Selected |
|--------|-------------|----------|
| DB leave 테이블 조회 | 승인된 연차/공가 데이터로 식수 차감 | ✓ |
| shiftCalc만 사용 | 연차 미반영, 사용자가 직접 미식 처리 | |

**User's choice:** DB leave 테이블 조회

---

## DB 스키마

| Option | Description | Selected |
|--------|-------------|----------|
| 날짜+직원별 미식 횟수 | staff_id + date + skipped_meals(0/1/2). 간결 | ✓ |
| 끼니별 상태 저장 | staff_id + date + meal_type + attended. 정밀하나 행 3배 | |
| Claude 판단 | | |

**User's choice:** 날짜+직원별 미식 횟수

---

## Claude's Discretion

- 달력 셀 크기/레이아웃
- 요약 카드 디자인
- API 설계 (클라이언트 vs 서버 계산)
- 주말 식대 표시 위치/형태

## Deferred Ideas

- MEAL-03/04 메뉴표 관리 — 데스크톱 버전에서 PDF 드래그앤드롭 + 자동 추출
- 근무표+연차+식사 달력 통합 — 미래 과제
