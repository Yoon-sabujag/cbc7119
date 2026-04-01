# Phase 6: Remediation Tracking - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-02
**Phase:** 06-remediation-tracking
**Areas discussed:** 조치 목록 화면 구성, 조치 상세/상태 변경 플로우, 사진 첨부 방식, 대시보드 미조치 카운트 연동, API 설계, 라우트 설계

---

## 조치 목록 화면 구성

### 목록 표시 형태

| Option | Description | Selected |
|--------|-------------|----------|
| 카드 리스트 | 각 항목을 카드로 표시, 클릭으로 상세 진입 | ✓ |
| 테이블 형태 | 행/열 테이블로 압축 표시, 모바일 불편 | |
| Claude에게 일임 | 기존 앱 패턴에 맞게 Claude가 결정 | |

**User's choice:** 카드 리스트

### 필터 구성

| Option | Description | Selected |
|--------|-------------|----------|
| 상태 탭 + 카테고리 드롭다운 | 상단에 전체/미조치/완료 탭, 카테고리는 드롭다운 | ✓ |
| 탭만 (상태별) | 카테고리 필터 없음 | |
| Claude에게 일임 | UX에 맞게 Claude가 결정 | |

**User's choice:** 상태 탭 + 카테고리 드롭다운

### 기간 필터

| Option | Description | Selected |
|--------|-------------|----------|
| 최근 30일 기본 + 기간 선택 | 기본 30일, 7일/30일/90일/전체 버튼 | ✓ |
| 전체 표시 | 기간 필터 없음 | |
| Claude에게 일임 | Claude가 판단 | |

**User's choice:** 최근 30일 기본 + 기간 선택

### 상태 단계

| Option | Description | Selected |
|--------|-------------|----------|
| 3단계: 미조치/조치중/완료 | DB에 in_progress 추가 | |
| 2단계: 미조치/완료 | 현재 DB 그대로 (open/resolved) | ✓ |
| Claude에게 일임 | Claude가 판단 | |

**User's choice:** 2단계 — DB 변경 없음

### 카드 표시 정보

**User's choice (재선택):** 컴팩트 카드 + 메모 미리보기
- 카테고리 + 위치(동→층, 사용자 명시적 요청)
- 판정결과 배지 + 상태 배지
- 점검일
- 메모 첫 줄 미리보기
- 사진 썸네일 미포함 (상세에서 확인)

---

## 조치 상세/상태 변경 플로우

### 상세 화면 방식

| Option | Description | Selected |
|--------|-------------|----------|
| 전체 페이지 (라우트 이동) | /remediation/:recordId 라우트 이동 | ✓ |
| 모달/바텀시트 | 목록 위에 모달 오버레이 | |
| Claude에게 일임 | UX에 맞게 Claude가 결정 | |

**User's choice:** 전체 페이지 (라우트 이동)

### 조치 완료 시 필수 입력

| Option | Description | Selected |
|--------|-------------|----------|
| 메모 필수 + 사진 선택 | 조치 내용 메모는 필수, 사진은 선택적 | ✓ |
| 메모+사진 모두 필수 | 증거로 모두 필수 | |
| 모두 선택 | 비워도 완료 처리 가능 | |

**User's choice:** 메모 필수 + 사진 선택

### 상세 페이지 구성

점검 정보 + 점검 메모/사진(조치 전) + 조치 정보(조치 후) + 하단 조치 완료 버튼(미조치일 때만)

### 조치 완료 후 동작

| Option | Description | Selected |
|--------|-------------|----------|
| 토스트 + 목록으로 복귀 | '조치 완료' 토스트 후 /remediation 목록 복귀 | ✓ |
| 토스트 + 상세에 머무르기 | 완료 후 상세 페이지에 머물며 상태 변경 확인 | |
| Claude에게 일임 | Claude가 판단 | |

**User's choice:** 토스트 + 목록으로 복귀

---

## 사진 첨부 방식

### 업로드 방식

| Option | Description | Selected |
|--------|-------------|----------|
| 기존 패턴 동일하게 | 카메라/갤러리 → 압축 → R2. usePhotoUpload 재활용 | ✓ |
| 카메라만 | 현장 직접 촬영만 허용 | |
| Claude에게 일임 | Claude가 판단 | |

**User's choice:** 기존 패턴 동일하게

### 사진 수량

| Option | Description | Selected |
|--------|-------------|----------|
| 조치 후 사진 1장 | resolution_photo_key 컬럼 활용, DB 변경 없음 | ✓ |
| 조치 후 사진 다수 | JSON 배열로 변경, 마이그레이션 필요 | |
| Claude에게 일임 | Claude가 판단 | |

**User's choice:** 조치 후 사진 1장

---

## 대시보드 미조치 카운트 연동

| Option | Description | Selected |
|--------|-------------|----------|
| 대시보드 API 기존 값 활용 | stats.ts unresolved → BottomNav+SideMenu 전달 | ✓ |
| 별도 API 엔드포인트 | /api/remediation/count 신규 | |
| Claude에게 일임 | Claude가 판단 | |

**User's choice:** 대시보드 API 기존 값 활용

---

## API 설계

| Option | Description | Selected |
|--------|-------------|----------|
| 신규 /api/remediation 엔드포인트 | GET /api/remediation?status=&category=&days= | ✓ |
| 기존 records API 확장 | /api/inspections/records에 필터 추가 | |
| Claude에게 일임 | Claude가 판단 | |

**User's choice:** 신규 /api/remediation 엔드포인트

---

## 조치 대상 범위

| Option | Description | Selected |
|--------|-------------|----------|
| 불량+주의 모두 포함 | bad + caution 모두 조치 대상 | ✓ |
| 불량(bad)만 | 주의는 경미해서 제외 | |
| Claude에게 일임 | Claude가 판단 | |

**User's choice:** 불량+주의 모두 포함

---

## 라우트 설계

| Option | Description | Selected |
|--------|-------------|----------|
| /remediation/:recordId (NO_NAV_PATHS) | 하단 네비 숨김, 자체 헤더에 뒤로가기 | ✓ |
| /remediation/:recordId (BottomNav 유지) | 하단 네비+글로벌 헤더 모두 표시 | |
| Claude에게 일임 | Claude가 판단 | |

**User's choice:** /remediation/:recordId (NO_NAV_PATHS)

---

## Claude's Discretion

- 카드 리스트 정렬 방식
- 필터 드롭다운 카테고리 목록 소스
- 상세 페이지 레이아웃 세부 디자인

## Deferred Ideas

None
