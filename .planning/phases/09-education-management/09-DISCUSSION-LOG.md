# Phase 9: Education Management - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.

**Date:** 2026-04-03
**Phase:** 09-education-management
**Areas discussed:** 페이지 구조, 교육 일정 관리 방식, 이수 기록 + 인증서, D-day 표시, DB 스키마, SideMenu 배치, 수정/삭제 권한

---

## 페이지 구조

| Option | Description | Selected |
|--------|-------------|----------|
| 리스트형 단일 페이지 | 교육 카드 리스트, 탭 없음 | ✓ |
| 탭 2개 (예정/이수) | 예정과 이수 완료 분리 | |
| 달력형 | 월간 달력에 교육 일정 표시 | |

**User's choice:** 리스트형 단일 페이지

---

## 교육 일정 관리 방식

**User's choice:** 자동 주기 계산
**Notes:** 사용자가 법적 교육 주기 설명: "선임된지 6개월 이내에 실무 교육을 받아야하고, 첫 실무 교육을 받은 날짜가 기준일이 되어서 그후 2년 마다 실무교육을 받아야해." 수동 일정 등록 불필요 — appointed_at + 이수일로 자동 산출.

---

## 이수 기록 + 인증서

| Option | Description | Selected |
|--------|-------------|----------|
| 이수일 + 인증서 파일 | R2 업로드 포함 | |
| 이수일만 | 인증서 없이 이수일만 기록 | ✓ |

**User's choice:** 이수일만

---

## D-day 표시

| Option | Description | Selected |
|--------|-------------|----------|
| 교육 페이지만 | 보수교육 페이지에서만 D-day | ✓ |
| 대시보드 + 교육페이지 | 대시보드에도 경고 카드 | |

**User's choice:** 교육 페이지만

---

## DB 스키마

| Option | Description | Selected |
|--------|-------------|----------|
| 이수 이력 테이블 | education_records: staff_id + completed_at + type | ✓ |
| staff 컬럼 추가 | staff.last_education_at만 | |

**User's choice:** 이수 이력 테이블

---

## SideMenu 배치

| Option | Description | Selected |
|--------|-------------|----------|
| 근무·복지 | 근무표, 연차, 식사 기록과 같은 섹션 | ✓ |
| 시스템 | 건물 도면, 승강기, 법적 점검과 같은 섹션 | |

**User's choice:** 근무·복지

---

## 수정/삭제 권한

| Option | Description | Selected |
|--------|-------------|----------|
| admin만 | 관리자만 등록/수정 | |
| 본인도 수정 가능 | 본인 교육 이수일은 본인이 수정 가능 | ✓ |

**User's choice:** 본인도 수정 가능

---

## Claude's Discretion

- 카드 디자인, D-day 경고 색상, 이수 입력 UI 형태, 교육 유형 자동 판정

## Deferred Ideas

- EDU-02 인증서 R2 업로드 — v1.2
- 대시보드 D-day 경고 카드
