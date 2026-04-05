# Phase 12: Multi-Photo Infrastructure - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-05
**Phase:** 12-multi-photo-infrastructure
**Areas discussed:** 사진 그리드 레이아웃, 카메라/갤러리 버튼, 마이그레이션 전략

---

## 적용 범위 (사전 질문)

**User's question:** "이게 어느 페이지에서를 말하는거야?"

**Clarification provided:** 현재 사진 업로드가 있는 5개 페이지 설명 후 범위 확인

**User's choice:** 법적 점검 지적사항 + 조치만 (소방점검/도면은 추후)

---

## 사진 그리드 레이아웃

| Option | Description | Selected |
|--------|-------------|----------|
| 가로 스크롤 행 | 72px 썸네일이 가로로 나열, 좌우 스크롤 (기존 PhotoButton 확장) | ✓ |
| 3열 그리드 | 3열 정사각형 그리드, 마지막 칸이 + 버튼 | |
| You decide | Claude 재량으로 적절하게 | |

**User's choice:** 가로 스크롤 행

| Option | Description | Selected |
|--------|-------------|----------|
| 마지막에 + 칸 | 썸네일 열 끝에 점선 + 버튼 칸 (기존 PhotoButton 스타일 유지) | ✓ |
| 상단 버튼 분리 | 사진추가 버튼은 썸네일 위에 별도 배치 | |
| You decide | Claude 재량 | |

**User's choice:** 마지막에 + 칸

---

## 카메라/갤러리 버튼

| Option | Description | Selected |
|--------|-------------|----------|
| 바로 갤러리 열기 | accept="image/*" 만 — iOS에서 카메라/사진 선택 시트 자동 표시 | ✓ |
| 카메라/갤러리 분리 | 카메라 촬영 버튼 + 갤러리 선택 버튼 두 개 | |
| You decide | Claude 재량 | |

**User's choice:** 바로 갤러리 열기

---

## 마이그레이션 전략

**User's question:** "이건 무슨 말이야?" — 기존 단일 photo_key → 다중 photo_keys 전환 개념 설명

**Clarification:** 기존 데이터 별로 없다는 확인

| Option | Description | Selected |
|--------|-------------|----------|
| 데이터 복사 후 전환 | migration에서 photo_key→photo_keys 복사, 이후 photo_keys만 사용 | ✓ |
| You decide | Claude 재량 | |

**User's choice:** 데이터 복사 후 전환

---

## Claude's Discretion

- useMultiPhotoUpload hook 내부 구현
- PhotoGrid 컴포넌트 세부 스타일
- 라이트박스 플러그인 설정
- 에러 처리

## Deferred Ideas

- 소방 점검/도면 다중 사진 — 별도 Phase
- 사진 업로드 진행률 — PHOTO-04
- 사진 드래그 정렬 — PHOTO-05
