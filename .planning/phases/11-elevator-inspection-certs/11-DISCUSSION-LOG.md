# Phase 11: Elevator Inspection Certs - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-05
**Phase:** 11-elevator-inspection-certs
**Areas discussed:** 인증서 업로드/조회 흐름, 검사 기록 관리 방식, 인증서 만료/갱신 추적

---

## 인증서 업로드/조회 흐름

### 파일 유형
| Option | Description | Selected |
|--------|-------------|----------|
| PDF만 | 법정검사 인증서는 PDF 문서로 발급됨 | |
| PDF + 이미지 | PDF 원본 + 스캔/사진 모두 지원 | ✓ |
| 현재 방식 유지 | 이미지 업로드(카메라/갤러리) 그대로 + PDF 추가 | |

**User's choice:** PDF + 이미지

### 조회 방식
| Option | Description | Selected |
|--------|-------------|----------|
| 새 탭으로 열기 | 현재 방식 — /api/uploads/ 링크로 새 탭에서 열림 | |
| 인앱 뷰어 | 앱 내에서 PDF/이미지 미리보기 + 새 탭 열기 버튼 | ✓ |
| 현재 방식 충분 | 새 탭 열기로 충분, 변경 불필요 | |

**User's choice:** 인앱 뷰어

### 업로드 권한
| Option | Description | Selected |
|--------|-------------|----------|
| 관리자만 | 법정 문서라 관리자가 관리 | ✓ |
| 전체 직원 | 현장에서 바로 업로드 가능 | |

**User's choice:** 관리자만

### 관리 범위
| Option | Description | Selected |
|--------|-------------|----------|
| 호기별 | 각 승강기마다 별도 인증서 관리 (현재 DB 구조와 일치) | ✓ |
| 건물 전체 | 전체 승강기 일괄 검사 인증서 1장 | |

**User's choice:** 호기별

---

## 검사 기록 관리 방식

**법령 조사:** 승강기안전관리법 시행규칙 제54조 확인
- 정기검사: 승객용/에스컬레이터 1년, 화물용/dumbwaiter 2년, 25년 경과 6개월
- 수시검사: 변경/사고 시
- 정밀안전검사: 설치 후 15년 경과 시 3년마다

**User 확인사항:**
- 25년 경과 승강기: 없음
- 검사일 등록: 재단시설팀 통보 → SchedulePage에서 등록
- 검사 결과: 합격/조건부합격/불합격 3단계
- 조건부합격 시: 검사기관 조치 요구사항 + 사진 기록 필요

### 조건부합격 조치 패턴
| Option | Description | Selected |
|--------|-------------|----------|
| 동일 패턴 | Phase 10 지적사항/조치 패턴 재활용 (별도 테이블) | ✓ |
| 간단하게 | 메모 + 사진 1장만 (검사 레코드에 포함) | |

**User's choice:** Phase 10 동일 패턴

---

## 인증서 만료/갱신 추적

| Option | Description | Selected |
|--------|-------------|----------|
| 이력 조회만 | 호기별 검사 이력 목록만 보여줌 | |
| 다음 검사일 표시 | 자동 계산 + 목록에 표시 | |
| 다음 검사일 + 알림 | 자동 계산 + 도래 30일 전 경고 배지 | ✓ |

**User's choice:** 다음 검사일 + 알림

---

## Claude's Discretion

- 인앱 뷰어 구현 방식
- 경고 배지 디자인
- DB 마이그레이션 전략
- 대시보드 경고 위치

## Deferred Ideas

- 검사기관 통보 연동 (외부 시스템)
- 푸시 알림 (PWA 푸시 미구현)
