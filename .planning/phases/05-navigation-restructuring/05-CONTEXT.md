# Phase 5: Navigation Restructuring - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

BottomNav/SideMenu 네비게이션 재편. 더보기 탭/페이지 제거, 조치 탭 신규 추가, 승강기 위치 유지, 햄버거 메뉴로 전체 항목 통합, 글로벌 헤더 도입.

</domain>

<decisions>
## Implementation Decisions

### BottomNav 탭 구성
- **D-01:** 탭 순서: 대시보드 | 점검 | QR스캔 | 조치 | 승강기 (5탭 유지, 더보기 제거 후 조치 추가, 승강기 유지)
- **D-02:** 조치 탭 라벨: "조치", 아이콘: 공구/렌치 스타일 SVG (기존 탭 아이콘과 일관된 stroke 스타일)
- **D-03:** 조치 탭에 미조치 건수 빨간 배지 표시 (Phase 6에서 API 연동 전까지는 배지 미표시 또는 0)

### SideMenu 섹션 재편
- **D-04:** 4섹션 구성: 주요 기능 / 점검 관리 / 근무·복지 / 시스템
  - 주요 기능: 대시보드, 소방 점검, QR 스캔, 조치 관리
  - 점검 관리: 월간 점검 계획, 점검 일지 출력, 일일업무일지, QR 코드 출력, DIV 압력 관리
  - 근무·복지: 근무표, 연차 관리, 식당 메뉴(준비중)
  - 시스템: 건물 도면, 승강기 관리, 법적 점검(준비중), 관리자 설정(준비중)
- **D-05:** 준비중 항목: 회색 텍스트 + '준비중' 배지, 클릭 불가
- **D-06:** 모든 하드코딩 배지 제거 (소방 점검 badge:3, 미조치 항목 badge:2). Phase 6에서 실제 API 연동
- **D-07:** 로그아웃: SideMenu 하단 사용자 카드에 유지 (MorePage 삭제 후 유일한 로그아웃 경로)

### /more 라우트 처리
- **D-08:** MorePage.tsx 완전 삭제 (파일, import, lazy 로딩 모두 제거)
- **D-09:** /more 경로 → /dashboard로 리디렉션 (`<Navigate to="/dashboard" replace />`)

### 글로벌 헤더 + 햄버거 접근성
- **D-10:** 글로벌 헤더 컴포넌트 신규 생성: 왼쪽 햄버거 버튼 + 중앙 페이지 제목
- **D-11:** BottomNav 표시되는 페이지에만 글로벌 헤더 표시 (NO_NAV_PATHS 페이지는 기존 자체 헤더 유지)
- **D-12:** DashboardPage, ElevatorPage, InspectionPage의 기존 개별 헤더+SideMenu 마운트를 글로벌 헤더로 완전 대체
- **D-13:** InspectionPage: 글로벌 헤더(햄버거+제목) 사용, 자체 뒤로가기 버튼 제거. 점검 단계에서 뒤로가기는 실질적으로 닫기와 동일하므로 기존 닫기 버튼으로 충분
- **D-14:** SideMenu는 Layout 레벨에서 한 번만 마운트 (각 페이지에서 개별 마운트 제거)

### 조치 페이지 Placeholder
- **D-15:** Phase 6 전까지 /remediation 경로에 빈 상태 페이지 표시: 글로벌 헤더 + '조치 관리' 제목 + 중앙에 '준비 중입니다' 메시지

### Claude's Discretion
- 조치 탭 아이콘의 구체적 SVG path (기존 탭 아이콘 stroke 스타일과 일관성 유지)
- 글로벌 헤더 높이/스타일 (기존 DashboardPage 헤더 패턴 참고)
- SideMenu 내 텍스트 아이콘 추가 여부 (현재 텍스트만, MorePage는 이모지 사용)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Navigation Components
- `cha-bio-safety/src/components/BottomNav.tsx` — 현재 5탭 BottomNav 구현 (수정 대상)
- `cha-bio-safety/src/components/SideMenu.tsx` — 현재 SideMenu 3섹션 구현 (수정 대상)

### Pages
- `cha-bio-safety/src/pages/MorePage.tsx` — 삭제 대상, 섹션/항목 구조 참고하여 SideMenu에 통합
- `cha-bio-safety/src/pages/DashboardPage.tsx` — 기존 헤더+SideMenu 마운트 제거 대상
- `cha-bio-safety/src/pages/ElevatorPage.tsx` — 기존 헤더+SideMenu 마운트 제거 대상
- `cha-bio-safety/src/pages/InspectionPage.tsx` — 기존 헤더 제거, 글로벌 헤더로 대체

### App Structure
- `cha-bio-safety/src/App.tsx` — 라우트 정의, Layout 컴포넌트, NO_NAV_PATHS 배열 (글로벌 헤더/SideMenu 마운트 위치)

### Requirements
- `.planning/REQUIREMENTS.md` — NAV-01, NAV-02, NAV-03 요구사항

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BottomNav.tsx`: ITEMS 배열 기반 탭 구성 — 배열 수정으로 탭 교체 가능
- `SideMenu.tsx`: MENU 배열 기반 섹션 구성 — 배열 수정으로 항목 통합 가능
- `App.tsx` Layout: showNav 로직 + NO_NAV_PATHS — 글로벌 헤더 조건부 렌더링에 동일 패턴 활용

### Established Patterns
- 인라인 스타일 + CSS 변수 (`var(--bg)`, `var(--t1)`, `var(--acl)` 등)
- SVG 아이콘 직접 사용 (lucide-react import 가능하나 BottomNav는 inline SVG 사용 중)
- lazy import + Suspense 로딩 패턴
- Zustand authStore로 인증 상태 관리

### Integration Points
- `App.tsx` Layout 컴포넌트: 글로벌 헤더 + SideMenu 마운트 위치
- `BottomNav` NavKey 타입: 'more' → 'remediation' 교체
- React Router: /more 리디렉션 추가, /remediation 라우트 추가
- NO_NAV_PATHS: /remediation은 추가하면 안 됨 (BottomNav 표시 필요)

</code_context>

<specifics>
## Specific Ideas

- 승강기 관리 페이지와 동일한 헤더 패턴으로 InspectionPage 통일 (사용자 요청)
- 점검 플로우에서 뒤로가기는 닫기와 효과가 동일하므로 별도 뒤로가기 불필요 (사용자 확인)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-navigation-restructuring*
*Context gathered: 2026-04-01*
