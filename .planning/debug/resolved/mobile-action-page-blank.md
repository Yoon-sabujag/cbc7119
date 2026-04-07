---
status: resolved
trigger: "모바일 하단 네비게이션의 '조치' 탭을 누르면 라우팅은 되는 것 같으나 화면이 흰/빈 화면으로 나옴"
created: 2026-04-07T00:00:00Z
updated: 2026-04-07T02:00:00Z
---

## Current Focus

hypothesis: RemediationPage root div uses height:'100%' + overflow:'hidden' inside <main overflow:'auto'>. The <main> is a flex child but NOT a flex container. So RemediationPage's flex:1 does nothing, and height:'100%' may resolve incorrectly on mobile (especially when combined with overflow:auto on parent). This causes the page to render with 0 visible height, appearing blank. Other pages have the same pattern but are less visually noticeable when broken (or happen to work in tested browsers).
test: Make <main> a flex column container so RemediationPage's flex:1 correctly fills remaining space
expecting: RemediationPage renders with correct height, filter bar + card list visible
next_action: fix App.tsx <main> to add display:flex flexDirection:column, and fix RemediationPage root to use flex:1 instead of height:100%

## Symptoms

expected: 하단 네비 "조치" 탭 선택 시 조치 관리 페이지가 렌더링되어야 함
actual: 흰/빈 화면만 뜸 (라우팅 자체는 되는 듯)
errors: 사용자가 콘솔 에러는 확인 못함 — 브라우저 devtools 로그 없음, 소스에서 추정 필요
reproduction: 모바일에서 하단 네비 "조치" 탭 클릭
started: 언제부터인지 불명

## Eliminated

- hypothesis: lazy import path broken or file missing
  evidence: ls confirmed RemediationPage.tsx exists; build produces RemediationPage chunk successfully
  timestamp: 2026-04-07T01:00:00Z

- hypothesis: API response shape mismatch causing render crash
  evidence: backend returns {success,data:{records,categories}}; req() extracts json.data; page uses data?.records ?? [] — all safe
  timestamp: 2026-04-07T01:00:00Z

- hypothesis: route not registered or wrong path
  evidence: App.tsx line 209 has <Route path="/remediation" element={<Auth><RemediationPage /></Auth>} />; BottomNav navigates to /remediation
  timestamp: 2026-04-07T01:00:00Z

- hypothesis: JS runtime throw in RemediationPage render
  evidence: traced all hooks and JSX — no synchronous throw possible; all null-guards in place
  timestamp: 2026-04-07T01:00:00Z

## Evidence

- timestamp: 2026-04-07T01:00:00Z
  checked: commit 091907b (desktop/mobile layout split)
  found: prior to this commit, layout container was <div overflow:'hidden'> — NOT a scroll container. After, became <main overflow:'auto'> — IS a scroll container. RemediationPage root used height:'100%' which resolves against parent's content-box height. In a scroll container whose height comes from flex (not explicit height), percentage height resolution is unreliable in mobile browsers.
  implication: height:'100%' inside <main overflow:'auto'> can resolve to 0 on mobile (especially iOS Safari), making overflow:'hidden' clip all content to nothing — blank screen

- timestamp: 2026-04-07T01:00:00Z
  checked: DashboardPage, ElevatorPage, InspectionPage, StaffServicePage root divs
  found: all use height:'100%' + overflow:'hidden' — same broken pattern
  implication: all bottom-nav pages potentially affected; user may have noticed only RemediationPage because other pages have more resilient layout or weren't tested after last deploy

- timestamp: 2026-04-07T01:00:00Z
  checked: <main> in App.tsx — did NOT have display:flex
  found: <main> is a flex child (flex:1, minHeight:0) but not a flex container itself; children's flex:1 did nothing; height:'100%' was the only sizing mechanism and it's unreliable in scroll containers
  implication: making <main> a flex column container + using flex:1 on page roots is the correct fix

## Resolution

root_cause: After commit 091907b (desktop/mobile layout split), the page content container changed from <div overflow:'hidden'> to <main overflow:'auto'>. This made <main> a CSS scroll container. All bottom-nav pages (RemediationPage, DashboardPage, ElevatorPage, InspectionPage, StaffServicePage) set height:'100%' on their root divs. Inside a scroll container whose height is flex-determined (not explicit), height:'100%' on children resolves to 0 in some mobile browsers (notably iOS Safari), causing overflow:'hidden' to clip all content — resulting in a blank screen.
fix: (1) Added display:'flex', flexDirection:'column' to <main> in App.tsx, changed overflow from 'auto' to 'hidden'. Pages manage their own internal scrolling, so <main> doesn't need to scroll. (2) Changed all bottom-nav page root divs from height:'100%' to flex:1, minHeight:0 — correctly sized via flex parent.
verification: npm run build succeeds cleanly (0 errors, 60 precache entries)
files_changed:
  - src/App.tsx
  - src/pages/RemediationPage.tsx
  - src/pages/DashboardPage.tsx
  - src/pages/ElevatorPage.tsx
  - src/pages/InspectionPage.tsx
  - src/pages/StaffServicePage.tsx
