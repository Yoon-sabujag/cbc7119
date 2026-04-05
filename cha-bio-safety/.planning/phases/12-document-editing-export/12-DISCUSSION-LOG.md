# Phase 12: Document Editing & Export - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-05
**Phase:** 12-document-editing-export
**Areas discussed:** 점검일지 데스크톱 뷰, 인쇄 스타일시트

---

## 점검일지 데스크톱 뷰

### 미리보기 필요 여부

| Option | Description | Selected |
|--------|-------------|----------|
| 목록 + 미리보기 2분할 | 선택하면 미리보기 표시 | ✓ |
| 목록만 + 바로 다운로드 | 현재처럼 카드 클릭 시 바로 엑셀 | |
| Claude 재량 | 적절히 구성 | |

**User's choice:** 목록 + 미리보기 2분할
**Notes:** 미리보기는 읽기 전용 (수정 불가)

### 미리보기 형식

**User's choice:** HTML 테이블
**Notes:** 사용자가 미리보기에서 수정 가능 여부 확인 → 읽기 전용으로 확정

### 레이아웃 방향

| Option | Description | Selected |
|--------|-------------|----------|
| 상하 2분할 | 상단 목록 + 하단 미리보기 | |
| 좌우 2분할 | 좌 목록 + 우 미리보기 | |
| 전체 화면 미리보기 | 선택 시 전체 화면 전환 | |

**User's choice:** (Freeform) 사용자가 직접 제안 — 가로형/세로형 문서에 따라 다른 레이아웃
**Notes:** 
- 실제 A4 용지를 화면에 대봤을 때 공간이 충분히 남음
- 가로형: ㄱ 좌우반전 3분할 (상단 대카테고리 탭, 좌측 항목 목록, 우측 미리보기)
- 세로형: 좌우 2분할 (좌측 편집/내용, 우측 미리보기)
- 미리보기는 A4 비율 고정 + scale fit, 스크롤 없이 전체 한눈에

### 카테고리 계층

**User's choice:** 대카테고리 탭에는 가로형 문서만. 유수검지/소화전/자탐 등은 항목 목록으로.
**Notes:** 소방계획서는 세로형이므로 대카테고리 탭에 포함하지 않음

---

## 인쇄 스타일시트

### 인쇄 방식

| Option | Description | Selected |
|--------|-------------|----------|
| 미리보기 영역만 인쇄 | 사이드바/헤더 숨기고 미리보기만 | |
| 엑셀 다운로드 후 인쇄 | 엑셀 파일 다운로드해서 인쇄 | |
| 둘 다 지원 | 브라우저 인쇄 + 엑셀 다운로드 모두 | ✓ |

**User's choice:** 둘 다 지원
**Notes:** HTML 미리보기 인쇄 품질이 엑셀과 차이가 크면 인쇄 기능 비활성화 가능. 테스트 후 판단.

---

## Claude's Discretion

- HTML 테이블 미리보기 세부 스타일링
- 대카테고리 탭 분류
- 연도/월 필터 UI
- @page 인쇄 설정

## Deferred Ideas

- DOC-02: 소방계획서 — 관리자와 상의 후 (2026-04-07 예정)
- DOC-03: 소방훈련 자료 — 관리자와 상의 후
