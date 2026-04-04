# Phase 11: Desktop Layout Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-05
**Phase:** 11-desktop-layout-foundation
**Areas discussed:** 사이드바 구성, 레이아웃 및 반응형 전략, 멀티 패널 레이아웃, 데스크톱 테이블/카드

---

## 사이드바 구성

### 섹션 표시 방식

| Option | Description | Selected |
|--------|-------------|----------|
| 항상 펼침 | 모든 섹션과 메뉴가 항상 보임 | |
| 섹션 접힘/펼침 | 섹션 헤더 클릭으로 펼치기 | ✓ |
| 아이콘 + 레이블 | 섹션 구분 없이 아이콘+텍스트로 나열 | |

**User's choice:** 섹션 접힘/펼침
**Notes:** 없음

### 사이드바 너비

| Option | Description | Selected |
|--------|-------------|----------|
| 240px (컴팩트) | 콘텐츠 영역 최대화 | |
| 280px (표준) | 적당한 여유, 메뉴명 + 배지 표시 | ✓ |
| 접을 수 있게 | 아이콘만 보이는 좁은 모드(60px)로 접기 가능 | |

**User's choice:** 280px (표준)
**Notes:** 없음

### 사이드바 하단 정보

**User's choice:** (Freeform) 데스크톱은 관리자가 쓰는 PC에서 활용. 기본적으로 관리자가 로그인해서 사용.
**Notes:** 관리자 이름 + 로그아웃 정도면 충분

### 메뉴 구성

| Option | Description | Selected |
|--------|-------------|----------|
| 관리 중심 재구성 | 점검결과확인 > 문서관리 > 직원관리 > 시설관리 순으로 재배치 | ✓ |
| 모바일과 동일 구조 유지 | 기존 4개 섹션 그대로 | |
| Claude 재량 | 관리 용도에 맞게 적절히 구성 | |

**User's choice:** 관리 중심 재구성
**Notes:** 모바일은 점검과 조치에 초점, 데스크톱은 결과 확인/일지화/직원관리 등 관리에 초점

---

## 레이아웃 및 반응형 전략

### 브레이크포인트

| Option | Description | Selected |
|--------|-------------|----------|
| 1024px | 1024px 이상이면 데스크톱 (태블릿 가로 포함) | ✓ |
| 1280px | 1280px 이상이면 데스크톱 (PC 전용) | |
| Claude 재량 | 적절한 기준점 결정 | |

**User's choice:** 1024px
**Notes:** 없음

### 네비게이션 방식

| Option | Description | Selected |
|--------|-------------|----------|
| 사이드바 중심 | 좌측 영구 사이드바 + 간소한 상단 헤더. 업무 도구 스타일 | ✓ |
| 상단 드롭다운 + 사이드바 | keso.kr처럼 상단 메가메뉴 + 햄버거 사이드바 | |
| Claude 재량 | 관리 도구에 맞게 구성 | |

**User's choice:** 사이드바 중심
**Notes:** 사용자가 keso.kr 스타일 참고 이미지 제공. 논의 결과 keso.kr은 정보 전달 웹사이트 스타일이라 관리 도구에는 사이드바 중심이 적합하다고 합의.

---

## 멀티 패널 레이아웃

### 점검 결과 화면

**User's choice:** 목록 뷰(기본) + 도면 뷰(탭 전환)
**Notes:** 도면에 표시 가능한 항목은 유도등/소화기/소화전 정도. 자탐, 스프링클러, 제연설비 등은 위치 기반이 아니므로 카테고리별 테이블로 보여줘야 함. 사용자가 직접 이 점을 지적.

---

## 데스크톱 테이블/카드

| Option | Description | Selected |
|--------|-------------|----------|
| 테이블 중심 | 대부분 테이블, 대시보드만 카드형 | |
| 카드 + 테이블 혼합 | 요약은 카드, 상세 목록은 테이블 | ✓ |
| Claude 재량 | 페이지 성격에 맞게 구성 | |

**User's choice:** 카드 + 테이블 혼합
**Notes:** 없음

---

## Claude's Discretion

- 사이드바 섹션의 구체적인 메뉴 재배치 순서
- 간소화된 상단 헤더의 정확한 디자인
- 테이블 컬럼 구성 및 정렬 옵션
- 카드/테이블 세부 스타일링

## Deferred Ideas

None — discussion stayed within phase scope
