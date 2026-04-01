# Phase 5: Navigation Restructuring - Research

**Researched:** 2026-04-01
**Domain:** React Router DOM 6 + React component refactor (BottomNav, SideMenu, Layout)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** BottomNav 탭 순서: 대시보드 | 점검 | QR스캔 | 조치 | 승강기 (5탭 유지, 더보기 제거, 조치 신규, 승강기 유지)
- **D-02:** 조치 탭 라벨: "조치", 아이콘: 공구/렌치 스타일 SVG (기존 탭 아이콘과 일관된 stroke 스타일)
- **D-03:** 조치 탭 미조치 건수 빨간 배지 — Phase 6 API 연동 전까지는 배지 미표시 (Phase 5에서 배지 렌더링 없음)
- **D-04:** SideMenu 4섹션: 주요 기능 / 점검 관리 / 근무·복지 / 시스템 (항목 명세 포함)
- **D-05:** 준비중 항목: 회색 텍스트 + '준비중' 배지, 클릭 불가
- **D-06:** 모든 하드코딩 배지 제거 (소방 점검 badge:3, 미조치 항목 badge:2)
- **D-07:** 로그아웃: SideMenu 하단 사용자 카드에 유지
- **D-08:** MorePage.tsx 완전 삭제 (파일, import, lazy 로딩 모두 제거)
- **D-09:** /more 경로 → /dashboard 리디렉션 (`<Navigate to="/dashboard" replace />`)
- **D-10:** 글로벌 헤더 컴포넌트 신규 생성: 왼쪽 햄버거 버튼 + 중앙 페이지 제목
- **D-11:** BottomNav 표시되는 페이지에만 글로벌 헤더 표시 (NO_NAV_PATHS 페이지는 기존 자체 헤더 유지)
- **D-12:** DashboardPage, ElevatorPage, InspectionPage의 개별 헤더+SideMenu 마운트를 글로벌 헤더로 완전 대체
- **D-13:** InspectionPage: 글로벌 헤더(햄버거+제목) 사용, 자체 뒤로가기 버튼 제거
- **D-14:** SideMenu는 Layout 레벨에서 한 번만 마운트
- **D-15:** /remediation에 빈 상태 페이지: 글로벌 헤더 + '조치 관리' 제목 + '준비 중입니다' 메시지

### Claude's Discretion

- 조치 탭 아이콘의 구체적 SVG path (기존 탭 아이콘 stroke 스타일과 일관성 유지)
- 글로벌 헤더 높이/스타일 (기존 DashboardPage 헤더 패턴 참고)
- SideMenu 내 텍스트 아이콘 추가 여부 (현재 텍스트만, MorePage는 이모지 사용)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NAV-01 | BottomNav에서 더보기를 제거하고 조치 메뉴를 신규 추가, 승강기를 더보기 자리로 이동 | D-01: 승강기 유지. 더보기 제거, 조치 추가. ITEMS 배열 수정으로 구현. NavKey 타입 변경 필요 |
| NAV-02 | SideMenu(햄버거)에 더보기 항목을 통합하고 용도별로 재정리 | D-04: MENU 배열을 4섹션으로 교체. 준비중 항목 패턴은 MorePage.tsx에서 확인됨 |
| NAV-03 | MorePage(/more) 제거 및 라우트 정리 | D-08/D-09: MorePage.tsx 삭제, /more → /dashboard Navigate. App.tsx 라우트 교체 |
</phase_requirements>

---

## Summary

Phase 5는 순수한 프론트엔드 컴포넌트 리팩터링 phase다. 새로운 API 엔드포인트나 DB 마이그레이션이 없다. 변경 대상은 6개 파일 (수정 5 + 신규 2 + 삭제 1) 이며, 모두 기존 코드베이스 패턴을 그대로 따른다.

핵심 구조 변경은 세 가지다. 첫째, BottomNav의 `더보기` 탭을 `조치` 탭으로 교체하고 NavKey 타입을 업데이트한다. 둘째, App.tsx Layout 컴포넌트에 `GlobalHeader`와 `SideMenu`를 한 번만 마운트하고 각 페이지에서 개별 마운트를 제거한다. 셋째, MorePage를 삭제하고 /more 라우트를 /dashboard 리디렉션으로 교체한다.

가장 큰 위험은 **DashboardPage의 SettingsPanel 연동**이다. DashboardPage는 `sideOpen` 외에 `settingsOpen` 상태도 사용하며, 헤더에서 설정 아이콘 버튼을 렌더링한다. GlobalHeader로 교체할 때 이 설정 버튼 처리 방식을 명확히 결정해야 한다. CONTEXT.md D-12는 "개별 헤더+SideMenu 마운트를 글로벌 헤더로 완전 대체"라고 명시하나, SettingsPanel 접근 경로(설정 버튼)는 DashboardPage 고유 기능이므로 GlobalHeader의 right slot 또는 DashboardPage 내부 처리로 남겨야 한다.

**Primary recommendation:** App.tsx Layout에서 SideMenu 상태(`sideOpen`)를 중앙 관리하고, GlobalHeader를 `showNav` 조건과 동일하게 조건부 렌더링한다. 각 페이지 헤더는 비-네비게이션 콘텐츠(탭바, 날짜/시간, 설정 버튼 등)만 유지한다.

---

## Standard Stack

### Core — 이미 설치됨, 추가 설치 불필요

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React Router DOM | 6.26.2 | `<Navigate>`, `useLocation`, `useNavigate` | 이미 사용 중; /more 리디렉션에 `<Navigate replace />` 사용 |
| React | 18.3.1 | `useState`, `lazy`, `Suspense` | 프레임워크 |
| Zustand | 5.0.0 | `useAuthStore` (SideMenu, Layout에서 인증 상태 접근) | 이미 사용 중 |

**Installation:** 없음 — 신규 의존성 불필요

---

## Architecture Patterns

### 현재 구조 이해

**App.tsx Layout 현재:**
```
Layout()
  └─ div (flex column)
       ├─ div (content area, paddingBottom when showNav)
       │    └─ Suspense > Routes (모든 페이지)
       └─ {showNav && <BottomNav />}
```

**변경 후 구조:**
```
Layout()
  useState: sideOpen
  └─ div (flex column)
       ├─ {showNav && <GlobalHeader title=... onMenuOpen=... />}
       ├─ {showNav && <SideMenu open={sideOpen} onClose={...} />}
       ├─ div (content area, paddingBottom when showNav)
       │    └─ Suspense > Routes
       └─ {showNav && <BottomNav />}
```

### Pattern 1: Layout-Level SideMenu 마운트

**What:** SideMenu와 GlobalHeader를 App.tsx의 Layout 함수 안에서 `showNav` 조건으로 렌더링

**When to use:** D-14 — "SideMenu는 Layout 레벨에서 한 번만 마운트"

**Example (App.tsx Layout 수정):**
```typescript
// src/App.tsx
function Layout() {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()
  const showNav = isAuthenticated && !NO_NAV_PATHS.includes(location.pathname)
  const [sideOpen, setSideOpen] = useState(false)

  const pageTitleFor = (pathname: string): string => {
    const map: Record<string, string> = {
      '/dashboard': '대시보드',
      '/inspection': '소방 점검',
      '/inspection/qr': 'QR 스캔',
      '/remediation': '조치 관리',
      '/elevator': '승강기 관리',
    }
    return map[pathname] ?? ''
  }

  return (
    <div style={{ width:'100%', flex:1, minHeight:0, display:'flex', flexDirection:'column', overflow:'hidden', paddingTop:'var(--sat, 0px)' }}>
      {showNav && <GlobalHeader title={pageTitleFor(location.pathname)} onMenuOpen={() => setSideOpen(true)} />}
      {showNav && <SideMenu open={sideOpen} onClose={() => setSideOpen(false)} />}
      <div style={{ flex:1, minHeight:0, overflow:'hidden', paddingBottom: showNav ? 'calc(54px + var(--sab, 34px))' : 0 }}>
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* ... */}
          </Routes>
        </Suspense>
      </div>
      {showNav && <BottomNav />}
    </div>
  )
}
```

### Pattern 2: GlobalHeader 컴포넌트

**What:** `src/components/GlobalHeader.tsx` — 새 파일, ElevatorPage iconBtnSt 패턴 참고

**Key reference:** ElevatorPage.tsx lines 1253–1257 (iconBtnSt 정의):
```typescript
const iconBtnSt: React.CSSProperties = {
  width:34, height:34, borderRadius:8, flexShrink:0,
  background:'var(--bg3)', border:'1px solid var(--bd)',
  cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
}
```

**UI-SPEC 명세 (GlobalHeader):**
```typescript
// src/components/GlobalHeader.tsx
interface Props { title: string; onMenuOpen: () => void }

export function GlobalHeader({ title, onMenuOpen }: Props) {
  return (
    <header style={{
      flexShrink: 0, height: 48,
      display: 'flex', alignItems: 'center',
      padding: '0 12px', gap: 8,
      background: 'var(--bg2)', borderBottom: '1px solid var(--bd)',
    }}>
      <button
        aria-label="메뉴 열기"
        onClick={onMenuOpen}
        style={{ width:32, height:32, borderRadius:7, background:'var(--bg3)', border:'none', color:'var(--t2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
      >
        <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="var(--t2)" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <span style={{ fontSize:13, fontWeight:700, color:'var(--t1)' }}>{title}</span>
    </header>
  )
}
```

### Pattern 3: BottomNav ITEMS 배열 교체

**What:** NavKey 타입에서 `'more'` → `'remediation'`, ITEMS 배열에서 더보기 제거 후 조치 추가

**Current NavKey:** `'dashboard' | 'inspection' | 'qr' | 'elevator' | 'more'`
**Target NavKey:** `'dashboard' | 'inspection' | 'qr' | 'remediation' | 'elevator'`

**탭 순서 (D-01):** 대시보드(0) | 점검(1) | QR스캔(2) | 조치(3) | 승강기(4)

**조치 탭 아이콘 SVG (UI-SPEC D-02, Claude's Discretion):**
```typescript
// 기어/렌치 SVG — stroke 스타일 일관성 유지 (strokeWidth 1.8, fill none)
icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.093c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.019.94-1.11l.894-.148c.424-.071.765-.384.93-.781.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
</svg>
```

**Active detection:** `/remediation`에서 조치 탭이 active가 되도록 `pathname.startsWith('/remediation')` 처리.

### Pattern 4: SideMenu 4섹션 MENU 배열

**What:** 기존 3섹션(주요 기능/점검 기록/근무·복지) → 4섹션(주요 기능/점검 관리/근무·복지/시스템)

**준비중 항목 처리:** 기존 MENU 타입에 `soon?: boolean` 추가 필요. 렌더링 시:
- `pointerEvents: 'none'` 또는 `cursor: 'default'`
- `opacity: 0.5`
- 배지: `<span style={{ fontSize:10, color:'var(--t3)', background:'var(--bg3)', borderRadius:6, padding:'2px 7px' }}>준비중</span>`

현재 SideMenu MENU 타입은 `badge: number` 필드만 있음 — `soon?: boolean` 필드 추가 필요.

**변경 후 MENU 배열 (D-04):**
```typescript
const MENU = [
  { section: '주요 기능', items: [
    { label: '대시보드',    path: '/dashboard',    badge: 0 },
    { label: '소방 점검',   path: '/inspection',   badge: 0 }, // D-06: badge 3→0
    { label: 'QR 스캔',    path: '/inspection/qr', badge: 0 },
    { label: '조치 관리',   path: '/remediation',  badge: 0 },
  ]},
  { section: '점검 관리', items: [
    { label: '월간 점검 계획', path: '/schedule',      badge: 0 },
    { label: '점검 일지 출력', path: '/reports',        badge: 0 },
    { label: '일일업무일지',   path: '/daily-report',   badge: 0 },
    { label: 'QR 코드 출력',  path: '/qr-print',       badge: 0 },
    { label: 'DIV 압력 관리', path: '/div',             badge: 0 },
  ]},
  { section: '근무·복지', items: [
    { label: '근무표',    path: '/workshift', badge: 0 },
    { label: '연차 관리', path: '/leave',     badge: 0 },
    { label: '식당 메뉴', path: '/menu',      badge: 0, soon: true },
  ]},
  { section: '시스템', items: [
    { label: '건물 도면',   path: '/floorplan', badge: 0 },
    { label: '승강기 관리', path: '/elevator',  badge: 0 },
    { label: '법적 점검',  path: '/legal',      badge: 0, soon: true },
    { label: '관리자 설정', path: '/admin',      badge: 0, soon: true },
  ]},
]
```

### Pattern 5: 각 페이지 헤더 정리

**DashboardPage:**
- 제거: `const [sideOpen, setSideOpen] = useState(false)`, `<SideMenu open={sideOpen} .../>` 마운트
- 제거: 헤더 내 햄버거 버튼 (`<button onClick={() => setSideOpen(true)} ...>`)
- 유지: `SettingsPanel` 연동 (`settingsOpen` 상태, 설정 아이콘 버튼) — 이는 GlobalHeader 우측 slot이 아닌 DashboardPage 헤더 우측에 남김
- 유지: 날짜/시간 표시, 관리자/보조자 DutyChip 행
- 결과: DashboardPage 헤더는 GlobalHeader 아래에 위치, 날짜/DutyChip/설정 버튼만 포함

**ElevatorPage:**
- 제거: `const [sideOpen, setSideOpen] = useState(false)`, `<SideMenu open={sideOpen} .../>` 마운트
- 제거: 헤더 내 햄버거 버튼 + 페이지 제목 (`"승강기 관리"` 텍스트)
- 유지: 탭 바 (`TABS.map(...)`)와 미해결 건수 배지 — 탭 UI는 ElevatorPage 고유 콘텐츠
- 유지: `unresolvedCount` 배지 span

**InspectionPage:**
- 현재 헤더: `fontSize:18, fontWeight:700` 제목 "소방 점검" + 동기화 시간
- 제거: 제목 "소방 점검" 텍스트 (GlobalHeader 제목으로 이동)
- 유지: 동기화 시간 표시 — 이는 점검 기능 고유 정보, GlobalHeader에 없으므로 InspectionPage 헤더에서 유지하거나 헤더 컨테이너 제거 후 페이지 내 별도 표시로 처리
- D-13: "자체 뒤로가기 버튼 제거" — InspectionPage에는 뒤로가기 버튼이 현재 없음(닫기 버튼이 모달/플로우에 있으므로 해당 없음)

### Pattern 6: RemediationPage placeholder

**What:** 신규 `src/pages/RemediationPage.tsx`

```typescript
// src/pages/RemediationPage.tsx
export default function RemediationPage() {
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg)', alignItems:'center', justifyContent:'center', gap:12 }}>
      <svg width={48} height={48} fill="none" viewBox="0 0 24 24" stroke="var(--t3)" strokeWidth={1.5}>
        {/* 렌치 아이콘 */}
      </svg>
      <div style={{ fontSize:16, fontWeight:700, color:'var(--t1)' }}>조치 관리</div>
      <div style={{ fontSize:13, color:'var(--t2)' }}>준비 중입니다</div>
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **각 페이지에서 SideMenu 재마운트:** Layout 레벨에서 한 번만. 페이지 컴포넌트에 SideMenu import 절대 금지 (D-14)
- **/remediation을 NO_NAV_PATHS에 추가:** 조치 탭이 BottomNav에 표시되어야 하므로 NO_NAV_PATHS 제외 (STATE.md 명시)
- **배지 하드코딩 복원:** D-06 — 소방 점검 badge:3, 미조치 항목 badge:2 모두 제거. Phase 6에서 API 연동
- **GlobalHeader를 NO_NAV_PATHS 페이지에 표시:** `showNav` 조건과 동일하게 처리

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| /more 리디렉션 | 커스텀 redirect 컴포넌트 | `<Navigate to="/dashboard" replace />` | React Router DOM 6 내장 |
| 슬라이드 애니메이션 | CSS keyframe animation | 기존 SideMenu translateX transition | 이미 구현됨, 건드리지 말 것 |
| safe-area 처리 | CSS 계산 로직 | `var(--sab)`, `var(--sat)` CSS 변수 | index.html 인라인 스크립트에서 초기화됨 |

**Key insight:** 이 phase는 기존 코드 패턴을 재사용하는 리팩터링이다. 새로운 UI 패턴을 발명하지 않는다.

---

## Common Pitfalls

### Pitfall 1: DashboardPage SettingsPanel 접근 경로 손실

**What goes wrong:** DashboardPage 헤더를 GlobalHeader로 완전히 제거하면 설정 아이콘 버튼이 사라진다.
**Why it happens:** CONTEXT.md D-12는 "개별 헤더+SideMenu 마운트를 글로벌 헤더로 완전 대체"라고 하지만, SettingsPanel 버튼은 네비게이션이 아닌 기능 버튼이다.
**How to avoid:** DashboardPage는 GlobalHeader(Layout 제공) 아래에 자체 "서브헤더"(날짜/DutyChip/설정 버튼 행)를 유지한다. 단, 햄버거 버튼과 페이지 제목은 제거.
**Warning signs:** SettingsPanel을 열 수 없게 되는 것.

### Pitfall 2: ElevatorPage 탭 바 레이아웃 깨짐

**What goes wrong:** ElevatorPage 헤더를 제거하면 탭 바(리스트/고장/점검/연간검사)가 사라지거나 GlobalHeader와 겹친다.
**Why it happens:** ElevatorPage 헤더는 상단 타이틀 행과 탭 바 행으로 구성. 타이틀 행만 제거하고 탭 바는 유지해야 한다.
**How to avoid:** ElevatorPage `<header>` 내부에서 첫 번째 `<div>` (햄버거 버튼 + 제목 + 미해결 배지)만 제거. `TABS.map` 행은 유지.
**Warning signs:** 탭 전환이 불가능해지거나 탭 바가 화면에서 보이지 않는 것.

### Pitfall 3: NO_NAV_PATHS `startsWith` vs 정확 일치

**What goes wrong:** `/inspection/qr`가 `/inspection`으로 시작하므로 BottomNav active 감지 로직에서 점검 탭이 QR 스캔 탭 대신 active 상태가 됨.
**Why it happens:** 현재 `BottomNav.tsx` active 감지: `pathname.startsWith(i.path)`. `/inspection/qr`는 `/inspection`으로도 startsWith match됨.
**How to avoid:** QR 탭 경로를 ITEMS 배열에서 앞에 위치시키거나, active 감지 로직에서 `/inspection/qr`를 먼저 체크. 현재 코드는 ITEMS 배열 순서대로 find하므로 QR (`/inspection/qr`) 항목이 점검(`/inspection`)보다 앞에 있어야 한다. 실제로 현재 ITEMS 배열은 dashboard→inspection→qr→elevator→more 순서이므로 `/inspection/qr`일 때 `inspection` 탭이 먼저 match됨. 이 버그가 현재 있거나 없는지 확인하고, 있다면 `pathname === i.path || (i.path !== '/inspection' && pathname.startsWith(i.path))` 로직으로 수정.
**Warning signs:** /inspection/qr 접속 시 '점검' 탭이 highlighted되고 'QR 스캔' 탭이 highlighted되지 않는 것.

### Pitfall 4: lazy import 삭제 누락

**What goes wrong:** MorePage lazy import를 App.tsx에서 제거하지 않으면 빌드 시 `./pages/MorePage`를 찾지 못해 오류 발생.
**Why it happens:** D-08 — MorePage.tsx 파일 자체를 삭제하므로 import reference도 함께 제거해야 한다.
**How to avoid:** App.tsx에서 `const MorePage = lazy(...)` 줄 삭제 + `/more` route 교체를 동일 편집 내에서 처리.

### Pitfall 5: InspectionPage 동기화 시간 표시 처리

**What goes wrong:** InspectionPage 헤더를 제거하면 동기화 시간(syncedAt) 표시가 없어진다.
**Why it happens:** 현재 헤더에 `syncedAt.toLocaleTimeString(...)` 표시 있음.
**How to avoid:** 동기화 시간 표시를 헤더에서 제거하고, 점검 현황 카드 내부 또는 기타 적절한 위치로 이동하거나 생략. D-13이 "자체 헤더 제거"를 요구하므로 전체 헤더 div 제거. 동기화 시간 처리는 Claude's Discretion 범위.

---

## Code Examples

### /more 라우트 리디렉션

```typescript
// App.tsx Route 교체 — 기존
<Route path="/more" element={<Auth><MorePage /></Auth>} />
// 변경 후
<Route path="/more" element={<Navigate to="/dashboard" replace />} />
```

### SideMenu 준비중 항목 타입 확장

```typescript
// 기존 MENU 항목 타입 (인터페이스 없이 inline)
{ label: '식당 메뉴', path: '/menu', badge: 0 }
// 변경 후 — soon 필드 추가
{ label: '식당 메뉴', path: '/menu', badge: 0, soon: true }

// 렌더링 시 soon 처리
<div
  key={item.path}
  onClick={() => !item.soon && go(item.path)}
  style={{
    ...,
    opacity: item.soon ? 0.5 : 1,
    cursor: item.soon ? 'default' : 'pointer',
    pointerEvents: item.soon ? 'none' : 'auto',
  }}
>
  <span style={{ fontSize:12.5, fontWeight:500, flex:1 }}>{item.label}</span>
  {item.soon && (
    <span style={{ fontSize:10, color:'var(--t3)', background:'var(--bg3)', borderRadius:6, padding:'2px 7px' }}>준비중</span>
  )}
</div>
```

### BottomNav NavKey 타입 및 조치 탭 추가

```typescript
// 기존
type NavKey = 'dashboard' | 'inspection' | 'qr' | 'elevator' | 'more'

// 변경 후
type NavKey = 'dashboard' | 'inspection' | 'qr' | 'remediation' | 'elevator'

// ITEMS 배열: 더보기 제거 후 조치 추가 (위치: 4번째, 승강기 앞)
{
  key: 'remediation', label: '조치', path: '/remediation',
  icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94..."/>
  </svg>,
},
```

---

## Runtime State Inventory

> Phase 5는 UI 컴포넌트 리팩터링이므로 런타임 상태 변경 없음.

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | None — DB 스키마 변경 없음 | None |
| Live service config | None — Cloudflare Pages 라우팅 변경 없음 | None |
| OS-registered state | None | None |
| Secrets/env vars | None — 신규 env var 없음 | None |
| Build artifacts | None — /more가 제거되어도 SPA이므로 서버 라우팅 무관 | None |

---

## Environment Availability

> Phase 5는 코드/컴포넌트 변경만 포함. 외부 서비스 의존성 없음.

Step 2.6: SKIPPED (no external dependencies — pure frontend component refactoring)

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | 없음 — 프로젝트에 테스트 프레임워크 미설치 |
| Config file | 없음 |
| Quick run command | `npm run build` (TypeScript 컴파일 오류 감지) |
| Full suite command | `npm run build` |

**Note:** 프로젝트에 Vitest/Jest 등 테스트 프레임워크가 설치되지 않았다 (package.json 확인). nyquist_validation이 활성화되어 있으나 테스트 인프라 자체가 없음. Phase 5 검증은 빌드 성공 + 브라우저 수동 확인으로 대체한다.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NAV-01 | BottomNav에 조치 탭 표시, /remediation 이동 | smoke (manual) | `npm run build` (TS 오류 없음 확인) | ❌ Wave 0 불필요 |
| NAV-02 | SideMenu 4섹션 구성, 준비중 항목 클릭 불가 | smoke (manual) | `npm run build` | ❌ Wave 0 불필요 |
| NAV-03 | /more → /dashboard 리디렉션, MorePage 삭제 | smoke (manual) | `npm run build` | ❌ Wave 0 불필요 |

### Wave 0 Gaps

None — 테스트 프레임워크 설치 없이 빌드 성공으로 기본 검증. UI 동작은 수동 확인.

---

## Open Questions

1. **DashboardPage 헤더 내 SettingsPanel 버튼 처리**
   - What we know: DashboardPage는 `sideOpen` + `settingsOpen` 두 상태를 가짐. GlobalHeader는 왼쪽 햄버거만 렌더링.
   - What's unclear: SettingsPanel 버튼(설정 아이콘)을 GlobalHeader right slot에 넣을지, DashboardPage 자체 서브헤더에 남길지.
   - Recommendation: DashboardPage만 자체 "서브헤더" 유지 (날짜/시간 + DutyChip + 설정 버튼). GlobalHeader는 hamburger + 제목만. 이렇게 하면 DashboardPage 헤더 = GlobalHeader(layout) + 서브헤더(page-specific)의 2단 구조가 됨. D-12 "완전 대체"는 SideMenu 마운트 제거와 햄버거 버튼 이전을 의미하는 것으로 해석.

2. **InspectionPage 동기화 시간 표시 위치**
   - What we know: 현재 헤더에서 `syncedAt` 표시. D-13은 헤더 제거를 요구.
   - What's unclear: 동기화 시간을 어디에 표시할지.
   - Recommendation: 헤더 전체 div 제거 후 동기화 시간은 페이지 본문 상단 "오늘 점검 현황" 카드 우측에 이동하거나 생략. 기능적 영향 없음.

---

## Sources

### Primary (HIGH confidence)

- `cha-bio-safety/src/components/BottomNav.tsx` — 현재 NavKey, ITEMS 배열, active 감지 로직 직접 확인
- `cha-bio-safety/src/components/SideMenu.tsx` — 현재 MENU 배열, 섹션 구조, 렌더링 패턴 직접 확인
- `cha-bio-safety/src/App.tsx` — Layout 함수, NO_NAV_PATHS, showNav 로직, lazy import 목록 직접 확인
- `cha-bio-safety/src/pages/MorePage.tsx` — 삭제 대상 파일, 준비중 배지 패턴, 섹션 구조 직접 확인
- `cha-bio-safety/src/pages/DashboardPage.tsx` — sideOpen 상태, settingsOpen 상태, 헤더 구조 직접 확인
- `cha-bio-safety/src/pages/ElevatorPage.tsx` — SideMenu 마운트, iconBtnSt 패턴, 헤더 구조 직접 확인
- `cha-bio-safety/src/pages/InspectionPage.tsx` — 헤더 구조, syncedAt 표시, SideMenu 마운트 없음 확인
- `.planning/phases/05-navigation-restructuring/05-CONTEXT.md` — D-01~D-15 결정사항
- `.planning/phases/05-navigation-restructuring/05-UI-SPEC.md` — 컴포넌트 명세, 스타일 토큰, 인터랙션 계약

### Secondary (MEDIUM confidence)

- `.planning/STATE.md` — NO_NAV_PATHS에 /remediation 추가 금지 명시 확인
- `.planning/REQUIREMENTS.md` — NAV-01~NAV-03 요구사항 원문 확인

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — 기존 코드 직접 확인, 신규 의존성 없음
- Architecture: HIGH — 모든 수정 대상 파일 직접 읽고 변경 범위 파악
- Pitfalls: HIGH — 실제 코드에서 확인된 구체적 위험 (SettingsPanel, ElevatorPage 탭바, NavKey startsWith 버그)

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stable — no external dependencies)
