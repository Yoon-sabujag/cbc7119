# Phase 15: Finding Download - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-06
**Phase:** 15-finding-download
**Areas discussed:** 건별 다운로드 포맷, 일괄 ZIP 구조, 다운로드 권한, iOS PWA 전략
**Mode:** --auto (all areas auto-selected with recommended defaults)

---

## 건별 다운로드 포맷

| Option | Description | Selected |
|--------|-------------|----------|
| HTML 새 탭 | 메타데이터+base64 사진을 HTML 페이지로 열어 인쇄/PDF 저장 | ✓ |
| 개별 파일 다운로드 | 사진 파일 + 텍스트 파일을 각각 다운로드 | |
| 단일 PDF 생성 | jsPDF로 PDF 생성 후 다운로드 | |

**User's choice:** [auto] HTML 새 탭 (recommended — iOS 호환, 추가 라이브러리 불필요)
**Notes:** Research에서 iOS PWA `<a download>` 미동작 확인, window.open + 공유시트 권장

---

## 일괄 ZIP 구조

| Option | Description | Selected |
|--------|-------------|----------|
| 컨텍스트 명명 폴더 | finding-001_위치/지적사진-1.jpg — self-documenting | ✓ |
| 플랫 구조 | 모든 파일 루트에 — 단순하지만 대량 시 혼란 | |
| 날짜 기반 폴더 | 20260405/finding-001/ — 날짜 우선 정렬 | |

**User's choice:** [auto] 컨텍스트 명명 폴더 (recommended — 연구 결과 자기 설명적 아카이브)
**Notes:** None

---

## 다운로드 권한

| Option | Description | Selected |
|--------|-------------|----------|
| 관리자만 | admin role만 다운로드 버튼 표시 — 보고서 작성 용도 | ✓ |
| 전체 직원 | 모든 직원 다운로드 가능 — 현장 공유 편의 | |

**User's choice:** [auto] 관리자만 (recommended — 보고서 작성 용도)
**Notes:** None

---

## iOS PWA 전략

| Option | Description | Selected |
|--------|-------------|----------|
| window.open + 공유시트 | 새 탭 열기 → iOS 공유시트로 저장 | ✓ |
| Service Worker 캐시 | SW에서 다운로드 인터셉트 — 복잡 | |

**User's choice:** [auto] window.open + 공유시트 (recommended — WebKit bug 167341 우회)
**Notes:** isStandalone() + isIOS() 감지 로직 이미 InstallPrompt.tsx에 존재

---

## Claude's Discretion

- HTML 보고서 레이아웃/스타일링
- ZIP 파일명 패턴
- 사진 fetch 병렬 처리
- 다운로드 진행률 표시 방식

## Deferred Ideas

None
