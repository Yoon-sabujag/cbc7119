# Phase 12: Document Editing & Export - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

데스크톱에서 점검일지를 조회/미리보기/출력하고, 넓은 테이블/카드 레이아웃을 적용하며, 멀티 패널 구조를 구현한다. 소방계획서(DOC-02)와 소방훈련 자료(DOC-03)는 관리자와 상의 후 별도 진행 — 이번 discuss에서는 제외.

</domain>

<decisions>
## Implementation Decisions

### 문서 페이지 레이아웃 — 가로형 (점검일지)
- **D-01:** ㄱ 좌우반전 3분할 레이아웃 — 상단에 대카테고리 탭, 좌측에 항목 목록, 우측에 A4 가로 미리보기
- **D-02:** 대카테고리 탭에는 가로형 출력 문서만 포함 (점검일지 종류들)
- **D-03:** 항목 목록 — 해당 카테고리의 세부 항목 (유수검지, 소화전, 자탐, 제연 등)
- **D-04:** 미리보기는 A4 가로 비율 고정 + `transform: scale()`로 영역에 fit — 스크롤 없이 전체 한눈에 보임
- **D-05:** 사이드바, 카드 목록, 미리보기가 모두 한 화면에 보이게 구성

### 문서 페이지 레이아웃 — 세로형 (일일업무일지, 소방계획서 등)
- **D-06:** 좌우 2분할 — 좌측에 페이지 편집/내용, 우측에 A4 세로 미리보기
- **D-07:** 세로형 문서: 일일업무일지, 소방계획서, 보고서 등

### 미리보기 형식
- **D-08:** 엑셀 데이터를 HTML 테이블로 렌더링 (읽기 전용, 수정 불가)
- **D-09:** 점검일지는 점검 데이터 기반 자동 생성이므로 미리보기에서 편집 불필요

### 사이드바 메뉴 → 문서 타입 결정
- **D-10:** 사이드바 "문서 관리" 메뉴에서 선택한 항목에 따라 가로/세로 레이아웃 자동 결정
- **D-11:** "점검 일지 출력" → 가로형 3분할 페이지
- **D-12:** "일일업무일지" → 세로형 2분할 페이지
- **D-13:** "소방계획서" → 세로형 2분할 페이지 (Phase 12 후반, 관리자 상의 후)

### 출력 지원
- **D-14:** 인쇄(Ctrl+P / 인쇄 버튼) + 파일 저장(엑셀 다운로드) 둘 다 지원
- **D-15:** 인쇄 시 사이드바/헤더/목록 숨기고 미리보기 영역만 원본 크기로 출력
- **D-16:** HTML 미리보기 인쇄 품질이 엑셀과 차이 클 경우, 인쇄 기능은 나중에 비활성화 가능하도록 설계 — 엑셀 다운로드 후 인쇄로 유도
- **D-17:** 인쇄 스타일시트(`@media print`)로 사이드바/헤더/목록 `display: none` 처리

### 데이터 표시 (Phase 11에서 이관)
- **D-18:** LAYOUT-02 — 넓은 테이블/카드 레이아웃으로 데이터 확인 (데스크톱 전용)
- **D-19:** LAYOUT-03 — 멀티 패널 구조 (문서목록+미리보기)

### Claude's Discretion
- HTML 테이블 미리보기의 셀 병합/테두리/배경색 세부 스타일
- 대카테고리 탭의 구체적 항목 분류 (기존 ReportsPage REPORT_CARDS 기반)
- 항목 목록의 연도/월 필터 UI
- 인쇄 시 페이지 여백/방향 자동 설정 (`@page` 속성)

### Deferred (관리자 상의 후)
- DOC-02: 소방계획서 작성/편집
- DOC-03: 소방훈련용 자료(PPT) 작성

</decisions>

<canonical_refs>
## Canonical References

No external specs — requirements fully captured in decisions above

### Project context
- `.planning/PROJECT.md` — 프로젝트 전체 맥락
- `.planning/REQUIREMENTS.md` — LAYOUT-02, LAYOUT-03, DOC-01, DOC-04 요구사항
- `.planning/ROADMAP.md` — Phase 12 성공 기준
- `.planning/phases/11-desktop-layout-foundation/11-CONTEXT.md` — Phase 11 결정사항 (D-11~D-18)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ReportsPage.tsx`: 10종 점검일지 카드 목록 + 엑셀 다운로드 로직 — 대카테고리/항목 데이터 재사용
- `generateExcel.ts`: `generateDivExcel`, `generateCheckExcel`, `generateMatrixExcel`, `generatePumpExcel` — 엑셀 생성 유틸
- `DailyReportPage.tsx`: 일일업무일지 — 세로형 문서 참고
- `jspdf` 의존성: PDF 생성 가능 (필요 시)
- `xlsx-js-style`: 엑셀 스타일링 지원
- `useIsDesktop.ts`: 데스크톱/모바일 분기 훅 (Phase 11에서 생성)
- `DesktopSidebar.tsx`: 280px 사이드바 (Phase 11에서 생성)

### Established Patterns
- CSS 변수 기반 테마 (var(--bg), var(--t1) 등)
- 인라인 스타일 + CSS 변수 조합
- React Query로 데이터 페칭
- Zustand + localStorage persist

### Integration Points
- `App.tsx` Layout: 이미 데스크톱/모바일 분기 구현됨 — ReportsPage는 isDesktop 시 새 레이아웃 적용
- 기존 `/api/reports/*` 엔드포인트: 점검 데이터 조회 API 활용
- `REPORT_CARDS`, `MATRIX_CONFIG` 상수: 점검일지 종류/설정 데이터

</code_context>

<specifics>
## Specific Ideas

- 실제 A4 용지를 화면에 대봤을 때 사이드바 옆에도 공간이 많이 남음 → 3분할이 충분히 가능
- 가로형 미리보기는 transform: scale()로 축소하여 스크롤 없이 전체 표시
- 미리보기 HTML 품질이 엑셀과 차이가 크면 인쇄는 비활성화하고 엑셀 다운로드 후 인쇄로 유도 가능

</specifics>

<deferred>
## Deferred Ideas

- DOC-02: 소방계획서 작성/편집 — 관리자와 상의 후 Phase 12 후반 또는 별도 phase에서 진행 (2026-04-07 예정)
- DOC-03: 소방훈련용 자료(PPT) 작성 — 관리자와 상의 후 진행

</deferred>

---

*Phase: 12-document-editing-export*
*Context gathered: 2026-04-05*
