# CHA Bio Complex 방재 시스템 — UI Kit

## 개요
방재 시스템의 핵심 화면을 고충실도로 재현한 인터랙티브 프로토타입입니다.
실제 코드베이스(`DashboardPage.tsx`, `InspectionPage.tsx`)에서 직접 추출한 시각 패턴을 사용합니다.

## 포함 화면
1. **로그인** — 직원 카드 그리드 + 사번/비밀번호 입력
2. **대시보드 (모바일)** — 근무자 칩, 통계 카드, 빠른 도구, 일정, 월간 현황
3. **대시보드 (데스크톱)** — 2열 레이아웃 (점검현황+빠른도구 | 캘린더+일정)
4. **점검 (모바일)** — 카테고리 그리드 → 구역/층/측정점 선택 → 결과 입력

## 컴포넌트
- `SharedComponents.jsx` — DutyChip, StatusBadge, Donut, RoleLabel, StatCard, ToolCard
- `DashboardMobile.jsx` — 모바일 대시보드 전체
- `DashboardDesktop.jsx` — 데스크톱 대시보드 전체
- `InspectionMobile.jsx` — 모바일 점검 플로우
- `LoginScreen.jsx` — 로그인 화면

## 사용
`index.html`을 열면 클릭 가능한 프로토타입이 표시됩니다.
화면 전환은 하단 네비게이션과 인라인 컨트롤로 이루어집니다.
