# Phase 11: Desktop Layout Foundation - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

PC(1920x1080)에서 모든 페이지가 영구 사이드바 탐색으로 스크롤 가능하게 동작한다. 모바일 레이아웃은 기존과 동일하게 유지. 데스크톱은 관리자 전용 환경으로, 점검 결과 확인/문서 관리/직원 관리에 초점을 맞춘다.

</domain>

<decisions>
## Implementation Decisions

### 데스크톱 vs 모바일 역할 분리
- **D-01:** 모바일 = 현장 점검/조치 중심, 데스크톱 = 관리(결과 확인, 일지화, 직원 관리) 중심
- **D-02:** 데스크톱은 관리자가 쓰는 PC에서 활용. 기본적으로 관리자가 로그인해서 사용

### 사이드바 구성
- **D-03:** 280px 고정 너비, 섹션 접힘/펼침 방식
- **D-04:** 관리 중심으로 섹션 재구성 (모바일의 "주요 기능/점검관리/근무복지/시스템" 4개 섹션을 관리 업무 흐름에 맞게 재배치). 예시: 점검현황 > 문서관리 > 직원관리 > 시설관리
- **D-05:** 하단에 관리자 이름 + 로그아웃 버튼

### 네비게이션 방식
- **D-06:** 사이드바 중심 네비게이션 (업무용 관리 도구 스타일: Notion, Linear 등)
- **D-07:** 상단 헤더는 간소화 — 앱 로고 + 설정 버튼 정도만. keso.kr 식 드롭다운 메가메뉴 아님
- **D-08:** 모바일의 BottomNav/GlobalHeader/SideMenu 드로어는 데스크톱에서 숨김

### 반응형 전략
- **D-09:** 브레이크포인트 1024px — 이상이면 데스크톱(사이드바), 미만이면 모바일(기존 레이아웃)
- **D-10:** `html { overflow: hidden }` 글로벌 CSS를 모바일 전용으로 범위 제한 (데스크톱 스크롤 차단 해제)

### 점검 결과 화면
- **D-11:** 기본은 목록/테이블 뷰 — 카테고리별 요약 테이블(자탐, 소화전, 스프링클러 등), 행 클릭 시 개별 항목 아코디언 펼침
- **D-12:** 도면 뷰는 탭 전환 — 위치 기반 항목(유도등, 소화기, 소화전)만 도면에 마커 표시. 나머지 항목은 도면에 표시 불가하므로 목록 뷰로만 확인
- **D-13:** 층별 필터 탭 (B2, B1, 1F, 2F, 3F, 전체)

### 멀티 패널 적용 범위
- **D-14:** 멀티 패널(2분할) 적용: 문서목록+미리보기, 조치목록+상세내용
- **D-15:** 단일 패널(넓게) 적용: 근무표(캘린더), 승강기 관리(테이블), 관리자 설정, 대시보드
- **D-16:** 점검 결과는 탭 전환 방식(목록 뷰 / 도면 뷰)이므로 멀티 패널 아님

### 데이터 표시 스타일
- **D-17:** 요약 데이터는 카드형 (대시보드 KPI 등)
- **D-18:** 상세 목록은 테이블형 (넓은 화면 활용)

### Claude's Discretion
- 사이드바 섹션의 구체적인 메뉴 재배치 순서
- 간소화된 상단 헤더의 정확한 디자인
- 테이블 컬럼 구성 및 정렬 옵션
- 카드 디자인 (그림자, 라운딩, 간격 등)
- 아코디언 애니메이션 및 전환 효과
- 도면 뷰 ↔ 목록 뷰 탭 전환 UI

</decisions>

<canonical_refs>
## Canonical References

No external specs — requirements fully captured in decisions above

### Project context
- `.planning/PROJECT.md` — 프로젝트 전체 맥락, Core Value, Constraints
- `.planning/REQUIREMENTS.md` — LAYOUT-01~04 요구사항 정의
- `.planning/ROADMAP.md` — Phase 11 성공 기준
- `.planning/research/SUMMARY.md` — 리서치 종합 (overflow:hidden 이슈, BottomNav phantom gap 등)
- `.planning/research/ARCHITECTURE.md` — useIsDesktop 훅, DesktopSidebar 컴포넌트 설계
- `.planning/research/PITFALLS.md` — 데스크톱 레이아웃 함정 (overflow, paddingBottom 등)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SideMenu` (src/components/SideMenu.tsx): 4개 섹션 17개 메뉴 구조, 근무 정보 표시 로직 — 데스크톱 사이드바 메뉴 데이터로 재사용
- `GlobalHeader` (src/components/GlobalHeader.tsx): 상단 헤더 — 데스크톱에서는 간소화하여 재사용
- `BottomNav` (src/components/BottomNav.tsx): 5개 아이콘 탭 — 데스크톱에서는 숨김
- `SettingsPanel` (src/components/SettingsPanel.tsx): 설정 슬라이드 패널 — 데스크톱에서도 동일 사용

### Established Patterns
- CSS 변수 기반 테마 (`var(--bg)`, `var(--t1)` 등) — 데스크톱 전용 스타일도 같은 변수 체계 사용
- 인라인 스타일 + CSS 변수 조합 — 컴포넌트별 스타일 패턴 유지
- React Router DOM 6 — 라우팅 구조 유지
- Zustand + React Query — 상태 관리 패턴 유지

### Integration Points
- `App.tsx` Layout 함수: showNav 조건 분기에 데스크톱/모바일 레이아웃 전환 로직 추가
- `src/index.css` line 42: `overflow: hidden` 수정 필요 (모바일 전용으로 범위 제한)
- Layout의 `paddingBottom` 인라인 스타일: 데스크톱에서는 BottomNav 없으므로 0으로
- NO_NAV_PATHS 배열: 데스크톱에서도 사이드바 숨길 경로 검토 필요

</code_context>

<specifics>
## Specific Ideas

- 관리 도구 스타일 참고: Notion, Linear — 좌측 영구 사이드바 + 간소한 상단 헤더
- keso.kr 식 상단 드롭다운 메가메뉴는 채택하지 않음 (관리 도구에 부적합)
- 대시보드에서 카드형 KPI 4개를 가로 배치 (점검현황, 미조치, 승강기, 금일근무)
- 문서 관리 페이지에서 목록 + 미리보기 2분할

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-desktop-layout-foundation*
*Context gathered: 2026-04-05*
