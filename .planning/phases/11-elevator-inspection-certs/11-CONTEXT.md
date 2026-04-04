# Phase 11: Elevator Inspection Certs - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

승강기 법정검사 인증서/리포트를 호기별로 업로드하고 ElevatorPage에서 조회. 검사 결과(합격/조건부/불합격) 기록, 조건부합격 시 조치 요구사항 추적, 다음 검사 예정일 자동 계산 + 도래 알림 표시.

</domain>

<decisions>
## Implementation Decisions

### 인증서 업로드/조회
- **D-01:** 파일 유형: PDF + 이미지(사진/스캔) 모두 지원
- **D-02:** 인앱 뷰어로 미리보기 + 새 탭 열기 버튼 제공
- **D-03:** 관리자만 인증서 업로드 가능
- **D-04:** 호기별로 인증서 관리 (검사 기록 레코드에 첨부)

### 검사 기록 관리
- **D-05:** 검사 유형: 정기검사/수시검사/정밀안전검사 3종 (설치검사는 이미 완료된 기존 건물이라 제외)
- **D-06:** 검사 결과: 합격(pass)/조건부합격(conditional)/불합격(fail) 3단계
- **D-07:** 검사일은 재단시설팀 통보 → SchedulePage에서 등록하는 방식 (Phase 10 법적점검과 동일 패턴)
- **D-08:** 기존 ElevatorPage의 annual 탭 + elevator_inspections 테이블 활용 — type 필드를 free text → enum으로 변경, overall → result(pass/conditional/fail)로 변경

### 조건부합격 조치 관리
- **D-09:** Phase 10 지적사항/조치 패턴과 동일하게 구현 — 조치 요구사항 등록 → 조치 내용+사진 기록 → 완료 처리
- **D-10:** 별도 테이블 필요: elevator_inspection_findings (legal_findings 패턴 재활용)
- **D-11:** 전체 직원이 조치 기록, 관리자가 편집/정리

### 다음 검사일 추적 + 알림
- **D-12:** 마지막 검사일 + 호기 타입별 주기로 다음 검사 예정일 자동 계산
- **D-13:** 검사주기: 승객용/에스컬레이터=1년, 화물용/소형화물용(dumbwaiter)=2년, 설치 25년 경과=6개월
- **D-14:** 도래 30일 전부터 승강기 목록 + 대시보드에 경고 배지 표시
- **D-15:** 수시/정밀안전검사를 받으면 정기검사 주기가 해당 검사일부터 리셋

### Claude's Discretion
- 인앱 뷰어 구현 방식 (기존 PdfFloorPlan 컴포넌트 재활용 vs 새 뷰어)
- 검사 예정일 경고 배지의 시각적 디자인
- elevator_inspections 테이블 마이그레이션 전략 (ALTER vs 새 테이블)
- 대시보드 경고 표시 위치 및 형태

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 기존 ElevatorPage
- `cha-bio-safety/src/pages/ElevatorPage.tsx` — annual 탭, ElevatorInspection 타입, 인증서 첨부 UI (lines 33-45, 453-510)
- `cha-bio-safety/functions/api/elevators/inspections.ts` — 검사 기록 CRUD API
- `cha-bio-safety/functions/api/elevators/[elevatorId]/inspections/[inspectionId]/cert.ts` — 인증서 첨부 PUT API

### 조치 관리 패턴 (Phase 10)
- `cha-bio-safety/src/pages/LegalFindingsPage.tsx` — 지적사항+조치 카드 리스트 패턴
- `cha-bio-safety/src/pages/LegalFindingDetailPage.tsx` — 지적 상세 + 조치 기록 UI 패턴
- `cha-bio-safety/functions/api/legal/[id]/findings/index.ts` — 지적사항 CRUD API 패턴
- `cha-bio-safety/functions/api/legal/[id]/findings/[fid]/resolve.ts` — 조치 완료 API 패턴

### R2 업로드
- `cha-bio-safety/src/utils/imageUtils.ts` — 이미지 압축
- `cha-bio-safety/src/utils/api.ts` — legalApi 패턴 참고 (api.patch 등)

### 승강기 호기 정보
- `cha-bio-safety/src/pages/ElevatorPage.tsx` — EV_FLOORS 상수 (호기별 운행층), 타입 정의 (passenger/cargo/dumbwaiter/escalator)

### 법령 참조
- 승강기안전관리법 시행규칙 제54조 — 정기검사 주기 (1년/2년/6개월 호기 타입별)

### Requirements
- `.planning/REQUIREMENTS.md` — ELEV-02

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ElevatorPage.tsx` annual 탭: 검사 기록 카드 + 인증서 첨부 버튼 이미 존재
- `elevator_inspections` 테이블: id, elevator_id, inspect_date, type, overall, action_needed, memo, certificate_key
- `cert.ts` API: 인증서 첨부 PUT 엔드포인트
- `LegalFindingsPage/DetailPage`: 조치 요구사항 등록/조치 패턴 재활용 가능
- `usePhotoUpload` + `imageUtils`: 사진 촬영/압축/R2 업로드

### Established Patterns
- 인라인 스타일 + CSS 변수
- React Query 캐싱
- toast 알림
- R2 키 형식: {feature}/{parentId}/{type}/{timestamp}

### Integration Points
- ElevatorPage annual 탭 확장 (기존 UI 개선)
- elevator_inspections 테이블 스키마 변경 (type enum화, result 컬럼)
- elevator_inspection_findings 신규 테이블 (조건부합격 조치)
- 대시보드 경고 배지 (DashboardPage에 검사 도래 알림)

</code_context>

<specifics>
## Specific Ideas

- 검사일은 SchedulePage에서 등록 → ElevatorPage에서 이력 관리 (Phase 10 법적점검 패턴과 동일)
- 조건부합격 조치 관리는 legal_findings 패턴 그대로 재활용
- 검사주기 자동 계산은 호기 타입(passenger=1년, cargo/dumbwaiter=2년)과 마지막 검사일 기반
- 수시/정밀안전검사 후 정기검사 주기 리셋 로직 반영 필요

</specifics>

<deferred>
## Deferred Ideas

- 검사기관 통보 연동 (외부 시스템 연동은 현재 범위 밖)
- 푸시 알림 (PWA 푸시 미구현 상태 — 인앱 배지만 구현)

</deferred>

---

*Phase: 11-elevator-inspection-certs*
*Context gathered: 2026-04-05*
