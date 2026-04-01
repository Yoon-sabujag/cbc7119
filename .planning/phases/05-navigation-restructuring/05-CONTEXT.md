# Phase 5: Navigation Restructuring - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

BottomNav에서 더보기 탭을 제거하고 조치 탭을 신규 추가하며, 승강기를 BottomNav에서 제거하고 햄버거 메뉴(SideMenu)로 이동한다. MorePage(/more)를 제거하고, 더보기에 있던 항목들을 SideMenu에 통합한다.

</domain>

<decisions>
## Implementation Decisions

### BottomNav 탭 구성
- **D-01:** BottomNav 5개 탭 → 4개 탭으로 변경: 대시보드 | 점검 | QR 스캔(중앙 특수 버튼) | 조치
- **D-02:** 승강기 탭을 BottomNav에서 제거하고 SideMenu '주요 기능' 섹션에서 접근
- **D-03:** 더보기 탭 완전 제거
- **D-04:** NavKey 타입에서 'elevator'와 'more' 제거, 'remediation' 추가

### 조치 탭
- **D-05:** 라벨: '조치', 아이콘: 렌치/공구 스타일 SVG (기존 BottomNav 아이콘과 동일한 strokeWidth 1.8 스타일)
- **D-06:** 경로: /remediation
- **D-07:** 조치 페이지 자체는 Phase 6에서 구현 — Phase 5에서는 빈 placeholder 페이지로 라우트만 연결

### SideMenu 메뉴 재구성
- **D-08:** 기존 3섹션 구조 유지하되 MorePage 항목 통합:
  - 주요 기능: 대시보드, 소방 점검, QR 스캔, DIV 트렌드, 승강기 관리
  - 점검 기록: 월간 점검 계획, 점검 일지 출력, 일일업무일지, 미조치 항목
  - 근무·복지: 근무표, 연차 관리, 식당 메뉴
- **D-09:** MorePage에만 있던 항목 추가 배치: QR 코드 출력 → 점검 기록 섹션, 건물 도면 → 주요 기능 섹션
- **D-10:** 미조치 항목 badge 하드코딩(2) 유지 — Phase 6에서 live count로 교체 예정

### /more 경로 처리
- **D-11:** /more 접근 시 /dashboard로 리디렉트 (Navigate replace)
- **D-12:** MorePage.tsx 파일과 lazy import 제거
- **D-13:** NO_NAV_PATHS 배열은 변경 없음 (MorePage는 NO_NAV_PATHS에 없었음)

### App.tsx 라우트 정리
- **D-14:** /remediation 라우트 추가 (Auth 래핑, placeholder 컴포넌트)
- **D-15:** /more 라우트를 Navigate to="/dashboard" replace로 변경
- **D-16:** NO_NAV_PATHS에 /remediation은 추가하지 않음 (BottomNav 표시 필요)

### Claude's Discretion
- 조치 탭 SVG 아이콘의 정확한 path 디자인
- BottomNav 4탭 간격 조정 (기존 5탭에서 4탭으로 변경 시 레이아웃)
- SideMenu 항목 순서 미세 조정

</decisions>

<canonical_refs>
## Canonical References

No external specs — requirements fully captured in decisions above and the following project files:

### Navigation requirements
- `.planning/REQUIREMENTS.md` — NAV-01, NAV-02, NAV-03 요구사항 정의
- `.planning/ROADMAP.md` §Phase 5 — 성공 기준 4개 항목

### Architecture notes
- `.planning/STATE.md` §Architecture Notes — NO_NAV_PATHS, SideMenu badge 하드코딩 관련 메모

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BottomNav.tsx`: ITEMS 배열 기반 탭 렌더링 — 배열 수정으로 탭 추가/제거 가능
- `SideMenu.tsx`: MENU 상수 배열로 섹션/항목 관리 — 항목 추가만으로 통합 가능
- `MorePage.tsx`: 제거 대상이지만, MENU_SECTIONS 구조를 SideMenu 통합 시 참조

### Established Patterns
- BottomNav: NavKey union 타입으로 탭 식별, useLocation으로 active 상태 감지
- SideMenu: section/items 구조의 MENU 상수, badge 숫자로 알림 표시
- App.tsx: lazy import + Auth 래핑 + NO_NAV_PATHS 패턴

### Integration Points
- `src/App.tsx`: 라우트 정의, lazy import, NO_NAV_PATHS
- `src/components/BottomNav.tsx`: ITEMS 배열, NavKey 타입
- `src/components/SideMenu.tsx`: MENU 상수
- `src/pages/MorePage.tsx`: 제거 대상
- RemediationPage placeholder: `src/pages/RemediationPage.tsx` 신규 생성

</code_context>

<specifics>
## Specific Ideas

- BottomNav가 5탭에서 4탭(대시보드, 점검, QR, 조치)으로 줄어들면 각 탭 터치 영역이 넓어져 모바일 사용성 향상
- SideMenu는 이미 MorePage의 상위 호환 — 프로필 카드와 로그아웃이 양쪽에 중복되므로 MorePage 제거가 자연스러움

</specifics>

<deferred>
## Deferred Ideas

- SideMenu 미조치 배지 하드코딩(2) → live count 교체: Phase 6
- 관리자가 햄버거 메뉴 항목 순서/표시를 설정: Phase 7 (ADMIN-03)
- 법적 점검 메뉴 'soon' 태그 제거 및 실제 연결: Phase 10
- 식사 기록 메뉴 'soon' 태그 제거 및 실제 연결: Phase 8
- 관리자 설정 메뉴 'soon' 태그 제거 및 실제 연결: Phase 7

</deferred>

---

*Phase: 05-navigation-restructuring*
*Context gathered: 2026-04-01*
