# Phase 10: Legal Inspection - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.

**Date:** 2026-04-03
**Phase:** 10-legal-inspection
**Areas discussed:** 법적 점검 기록 방식, 지적사항 추적, 페이지 구조, DB 스키마, 라우팅, PDF 보관, 권한

---

## 법적 점검 기록 방식

**User's choice:** 상반기 종합정밀/하반기 작동기능 연 2회 점검, 지적사항 취합+조치 추적
**Notes:** "소방 법적 점검이 상반기 종합정밀점검, 하반기 작동기능점검 이 두가지에서 지적사항 나온것들을 기간내 취합해서 정리하고 지적 시 사진과 내용, 조치 후 사진과 내용을 다루는 페이지"

---

## 페이지 구조

| Option | Description | Selected |
|--------|-------------|----------|
| 점검회차 리스트 → 지적사항 | 3단계: 회차→지적목록→지적상세 | ✓ |
| 단일 리스트 | 회차 구분 없이 모든 지적사항 평면 리스트 | |

**User's choice:** 점검회차 리스트 → 지적사항

---

## 서류 R2

| Option | Description | Selected |
|--------|-------------|----------|
| 지적/조치 사진 + PDF 서류 | R2에 사진과 결과 보고서 PDF 모두 업로드 | ✓ |
| 사진만 | PDF 없이 사진만 | |
| 텍스트만 | R2 없이 텍스트 기록만 | |

**User's choice:** 사진 + PDF 서류

---

## 권한

**User's choice:** 역할별 분리
**Notes:** "점검이 진행되는동안 팔로업 하면서 작성하는 날것의 기록들이라 지적을 기록하고 조치 전/후 사진을 남기는 것은 전원이 해야 할것 같고, 그걸 가공해서 뭔가 다른걸 만드는 임무를 관리자가 해야 할거 같아"

---

## DB 스키마

| Option | Description | Selected |
|--------|-------------|----------|
| 2테이블 | legal_inspections + legal_findings 1:N | ✓ |
| 1테이블 | 단일 테이블에 모두 저장 | |

**User's choice:** 2테이블

---

## 라우팅

| Option | Description | Selected |
|--------|-------------|----------|
| 3단계 | /legal → /legal/:id → /legal/:id/finding/:fid | ✓ |
| 2단계 | /legal → /legal/:fid | |

**User's choice:** 3단계 라우팅

---

## PDF 보관

| Option | Description | Selected |
|--------|-------------|----------|
| 점검회차에 PDF 첨부 | report_file_key로 R2 보관, 관리자만 업로드 | ✓ |
| PDF 제외 | 텍스트만 | |
| v1.2 보류 | 데스크톱 버전에서 | |

**User's choice:** 점검회차에 PDF 첨부

---

## Claude's Discretion

- 카드 디자인, 정렬 방식, PDF 뷰어 방식, 위치 정보 입력

## Deferred Ideas

None
