# Phase 5: Navigation Restructuring - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-01
**Phase:** 05-navigation-restructuring
**Areas discussed:** BottomNav 탭 구성, SideMenu 섹션 재편, /more 라우트 처리, 햄버거 메뉴 접근성, InspectionPage 헤더, 조치 페이지 Placeholder

---

## BottomNav 탭 구성

### 탭 배치 순서

| Option | Description | Selected |
|--------|-------------|----------|
| 대시보드 \| 점검 \| QR \| 조치 \| 더보기 | 승강기를 햄버거로 이동, 더보기 탭을 햄버거 열기 트리거로 재활용 | |
| 대시보드 \| 점검 \| QR \| 조치 | 더보기 완전 제거, 4탭으로 축소. 햄버거는 헤더에서만 접근 | |
| 대시보드 \| 점검 \| QR \| 조치 \| 승강기 | 더보기만 제거하고 승강기 유지. 햄버거는 헤더로만 접근 | ✓ |

**User's choice:** 대시보드 | 점검 | QR | 조치 | 승강기
**Notes:** 햄버거는 헤더에서만 접근

### 조치 탭 배지

| Option | Description | Selected |
|--------|-------------|----------|
| 미조치 건수 배지 표시 | 조치 탭 아이콘 위에 빨간 숫자 배지. Phase 6에서 API 연동 시 실시간 업데이트 | ✓ |
| 배지 없이 아이콘만 | 미조치 건수는 대시보드와 조치 페이지 내에서 확인 | |

**User's choice:** 미조치 건수 배지 표시

### 조치 탭 라벨

| Option | Description | Selected |
|--------|-------------|----------|
| 조치 | 간결하고 다른 탭과 글자수 일관성 유지 | ✓ |
| 미조치 | 미조치 항목 관리에 초점 | |
| 이슈 | 불량/주의 개소를 '이슈'로 통칭 | |

**User's choice:** 조치

### 조치 탭 아이콘

| Option | Description | Selected |
|--------|-------------|----------|
| 공구/렌치 아이콘 | 수리/조치를 직관적으로 표현 | ✓ |
| 경고 삼각형 | 주의/경고 느낌의 삼각형 아이콘 | |
| Claude에게 일임 | 기존 탭 아이콘과 일관된 스타일로 Claude가 선택 | |

**User's choice:** 공구/렌치 아이콘

---

## SideMenu 섹션 재편

### 섹션 구성

| Option | Description | Selected |
|--------|-------------|----------|
| 4섹션 통합 | 주요기능 / 점검관리 / 근무·복지 / 시스템 | ✓ |
| 3섹션 간결 | 주요기능 / 기록관리 / 운영설정 | |
| Claude에게 일임 | MorePage 항목을 기존 SideMenu에 자연스럽게 통합 | |

**User's choice:** 4섹션 통합

### 준비중 항목 표시

| Option | Description | Selected |
|--------|-------------|----------|
| 회색 + '준비중' 배지 | 클릭 불가, 회색 텍스트 + 작은 라벨 | ✓ |
| 숨기기 | 준비중 항목은 SideMenu에 아예 표시하지 않음 | |
| 클릭 가능 + 안내 토스트 | 클릭하면 '준비 중입니다' 토스트 메시지 표시 | |

**User's choice:** 회색 + '준비중' 배지

### 배지 하드코딩 처리

| Option | Description | Selected |
|--------|-------------|----------|
| 하드코딩 제거 | 모든 하드코딩 배지 제거. Phase 6에서 조치 관리 API 연동 시 실제 값으로 교체 | ✓ |
| 실제 API 연동 | Phase 5에서 바로 check_records 테이블에서 미조치 건수 조회해서 표시 | |
| 좋을대로 | Claude가 Phase 5 범위에서 적절히 판단 | |

**User's choice:** 하드코딩 제거

### 로그아웃 위치

| Option | Description | Selected |
|--------|-------------|----------|
| SideMenu 하단 유지 | 현재처럼 SideMenu 하단 사용자 카드에 로그아웃 버튼 | ✓ |
| 시스템 섹션에 추가 | 시스템 섹션 하단에 로그아웃 메뉴 항목 추가 | |
| 둘 다 | SideMenu 하단 카드 + 시스템 섹션 양쪽에 배치 | |

**User's choice:** SideMenu 하단 유지

### 소방점검 배지 처리

| Option | Description | Selected |
|--------|-------------|----------|
| 하드코딩 제거 | 소방 점검 badge:3 하드코딩 제거 | ✓ |
| 실제 API 연동 | Phase 5에서 바로 미조치 건수 조회 표시 | |
| 좋을대로 | Claude가 판단 | |

**User's choice:** 하드코딩 제거

---

## /more 라우트 처리

### 접근 시 동작

| Option | Description | Selected |
|--------|-------------|----------|
| /dashboard로 리디렉션 | 기존 북마크/링크 대응 | ✓ |
| 404 페이지 표시 | /more는 존재하지 않는 경로로 처리 | |
| Claude에게 일임 | Claude가 적절한 방식 선택 | |

**User's choice:** /dashboard로 리디렉션

### MorePage 코드 처리

| Option | Description | Selected |
|--------|-------------|----------|
| MorePage 코드 완전 삭제 | 파일, import, lazy 로딩 모두 제거 | ✓ |
| MorePage 코드 유지 (숨김 처리) | 코드는 남겨두고 라우트만 리디렉션으로 변경 | |

**User's choice:** MorePage 코드 완전 삭제

---

## 햄버거 메뉴 접근성

### 접근 방식

| Option | Description | Selected |
|--------|-------------|----------|
| 글로벌 헤더 컴포넌트 | App.tsx Layout에 공통 헤더 추가, 모든 인증 페이지에서 사용 가능 | ✓ |
| 각 페이지 헤더에 개별 추가 | 현재 패턴 유지 — 필요한 페이지에 각각 추가 | |
| BottomNav에 햄버거 통합 | BottomNav 마지막 탭을 햄버거 열기로 활용 | |

**User's choice:** 글로벌 헤더 컴포넌트

### 글로벌 헤더 구성

| Option | Description | Selected |
|--------|-------------|----------|
| 햄버거 + 페이지 제목 | 왼쪽 햄버거 버튼 + 중앙 페이지 제목 | ✓ |
| 햄버거만 | 최소한의 글로벌 헤더. 페이지 제목은 각 페이지에서 자체 처리 | |
| 햄버거 + 제목 + 알림 | 알림 아이콘 추가 | |
| Claude에게 일임 | DashboardPage 헤더 패턴 참고해서 Claude가 결정 | |

**User's choice:** 햄버거 + 페이지 제목

### 표시 범위

| Option | Description | Selected |
|--------|-------------|----------|
| BottomNav 있는 페이지만 | NO_NAV_PATHS 페이지는 자체 헤더 유지 | ✓ |
| 로그인 제외 전체 | 모든 인증 페이지에 헤더 표시 | |
| Claude에게 일임 | 페이지 특성에 따라 Claude가 판단 | |

**User's choice:** BottomNav 있는 페이지만

### 기존 페이지 헤더 정리

| Option | Description | Selected |
|--------|-------------|----------|
| 글로벌 헤더로 완전 대체 | DashboardPage/ElevatorPage/InspectionPage의 개별 헤더+SideMenu 제거 | ✓ |
| DashboardPage 헤더는 유지 | DashboardPage는 특수 헤더 유지, 나머지만 글로벌 헤더 사용 | |
| Claude에게 일임 | 페이지별 특성에 맞게 Claude가 판단 | |

**User's choice:** 글로벌 헤더로 완전 대체

---

## InspectionPage 헤더

**User concern:** 글로벌 헤더 + 점검 서브헤더로 화면이 너무 줄어들지 않을까
**User clarification:** 점검 항목별 뒤로가기가 실질적으로 닫기와 동일. 뒤로가기 자리에 햄버거를 넣으면 승강기 관리 페이지와 동일한 패턴.

**Decision:** InspectionPage도 글로벌 헤더(햄버거+제목) 사용, 자체 뒤로가기 버튼 제거, 점검 중 닫기는 기존 닫기 버튼 활용

---

## 조치 페이지 Placeholder

| Option | Description | Selected |
|--------|-------------|----------|
| 빈 상태 페이지 | 글로벌 헤더 + '조치 관리' 제목 + 중앙에 '준비 중입니다' 메시지 | ✓ |
| 미조치 건수 요약 + 준비중 | 미조치 건수를 DB에서 조회해 간단히 표시 + '상세 기능 준비 중' 안내 | |
| Claude에게 일임 | Phase 5 범위에 맞게 Claude가 결정 | |

**User's choice:** 빈 상태 페이지

---

## Claude's Discretion

- 조치 탭 아이콘의 구체적 SVG path
- 글로벌 헤더 높이/스타일
- SideMenu 내 텍스트 아이콘 추가 여부

## Deferred Ideas

None — discussion stayed within phase scope
