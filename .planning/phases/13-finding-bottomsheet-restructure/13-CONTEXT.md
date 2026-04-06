# Phase 13: Finding BottomSheet Restructure - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

지적사항 등록 BottomSheet에서 공통 점검항목 선택과 구조화된 위치 입력(구역→층→상세위치 3단계 드롭다운)이 가능하도록 개선한다. 사진 첨부(Phase 12 PhotoGrid)는 이미 통합됨 — 이번 Phase에서는 위치 입력 구조화에 집중.

</domain>

<decisions>
## Implementation Decisions

### 상세위치 3단계 드롭다운
- **D-01:** 구역→층→상세위치 3단계 드롭다운 구조. 구역/층은 기존 chip 버튼 유지, 상세위치를 드롭다운으로 추가
- **D-02:** 상세위치 드롭다운은 콤보 방식 — 프리셋 목록 + '직접입력' 옵션. 층별로 다른 프리셋 제공
- **D-03:** 상세위치 프리셋 예시: 복도, 계단실, 화장실, EPS, TPS, 기계실, 전기실, 주차장 등 — 연구자가 건물 구조 기반으로 확정

### 점검항목 선택 UI
- **D-04:** 현재 FINDING_ITEMS 스크롤 리스트 + 직접입력 조합 유지 (이미 구현되어 있고 동작 확인됨)
- **D-05:** FINDING_ITEMS 목록 내용은 현재 18개 항목 기준 유지. 방재팀 피드백 시 업데이트

### 데이터 모델
- **D-06:** 기존 문자열 concat 방식 유지 — location은 "구역 층 상세위치" 문자열, description은 "항목 — 내용" 문자열
- **D-07:** DB 스키마 변경 없음 — legal_findings 테이블 그대로 사용

### Claude's Discretion
- 상세위치 프리셋 목록의 정확한 구성 (건물 도면/체크포인트 데이터 참조)
- 드롭다운 UI 스타일 (chip vs select vs custom dropdown)
- BottomSheet 내부 레이아웃 최적화
- 상세위치 직접입력 시 텍스트 필드 표시 방식

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 현재 구현 코드 (핵심)
- `cha-bio-safety/src/pages/LegalFindingsPage.tsx` — FindingBottomSheet 인라인 구현, ZONES/ZONE_FLOORS/FINDING_ITEMS 상수
- `cha-bio-safety/src/pages/LegalFindingDetailPage.tsx` — 지적사항 상세 표시 패턴

### Phase 12 출력물 (사진 인프라)
- `cha-bio-safety/src/hooks/useMultiPhotoUpload.ts` — 다중 사진 업로드 hook
- `cha-bio-safety/src/components/PhotoGrid.tsx` — 사진 그리드 + 라이트박스

### 위치 데이터 참조
- `cha-bio-safety/src/pages/InspectionPage.tsx` — ZONE_CONFIG, 층/구역 매칭 로직, 체크포인트 위치 구조 참조
- `cha-bio-safety/src/types/index.ts` — LegalFinding 인터페이스 (lines 90-107)

### API
- `cha-bio-safety/src/utils/api.ts` — legalApi.createFinding 시그니처
- `cha-bio-safety/functions/api/legal/[id]/findings/index.ts` — findings CRUD API

### Prior Context
- `.planning/phases/10-legal-inspection/10-CONTEXT.md` — 법적 점검 구조 결정
- `.planning/phases/12-multi-photo-infrastructure/12-CONTEXT.md` — 사진 인프라 결정

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ZONES` + `ZONE_FLOORS`: 4구역 + 층별 매핑 (LegalFindingsPage.tsx lines 40-52)
- `FINDING_ITEMS`: 18개 점검항목 + 직접입력 (LegalFindingsPage.tsx lines 54-61)
- `chipStyle()`: 활성/비활성 chip 스타일 함수 (재사용 가능)
- `useMultiPhotoUpload` + `PhotoGrid`: 이미 FindingBottomSheet에 통합됨
- `BottomSheet` (AdminPage.tsx): 드래그핸들 + 슬라이드업 패턴 참조

### Established Patterns
- 인라인 스타일 + CSS 변수
- chip 버튼으로 선택지 표현
- 스크롤 리스트로 다수 항목 선택
- location = 문자열 concat ("연구동 3F 복도")
- description = 항목 + 내용 concat ("소화전 — 압력 이상")

### Integration Points
- LegalFindingsPage.tsx: FindingBottomSheet 수정 (인라인)
- 상세위치 프리셋 데이터: 새 상수 추가 (ZONE_FLOOR_DETAILS 또는 유사)
- API/DB 변경 없음 — 프론트엔드만 수정

</code_context>

<specifics>
## Specific Ideas

- STATE.md 블로커: "Phase 13: FINDING_ITEMS 목록 (~25개 한국어 점검항목) 방재팀과 내용 확인 필요" — 현재 18개로 구현되어 있으며, 추후 피드백 반영
- 상세위치 프리셋은 InspectionPage의 체크포인트 위치 데이터나 건물 도면에서 추출 가능

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 13-finding-bottomsheet-restructure*
*Context gathered: 2026-04-06*
