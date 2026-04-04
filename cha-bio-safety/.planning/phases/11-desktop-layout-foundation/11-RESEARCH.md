# Phase 11: Desktop Layout Foundation - Research

**Researched:** 2026-04-05
**Domain:** React SPA 반응형 레이아웃 — 모바일 전용 PWA에 데스크톱 사이드바 레이아웃 추가
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** 모바일 = 현장 점검/조치 중심, 데스크톱 = 관리(결과 확인, 일지화, 직원 관리) 중심
- **D-02:** 데스크톱은 관리자가 쓰는 PC에서 활용. 기본적으로 관리자가 로그인해서 사용
- **D-03:** 사이드바 280px 고정 너비, 섹션 접힘/펼침 방식
- **D-04:** 관리 중심으로 섹션 재구성 (모바일의 "주요 기능/점검관리/근무복지/시스템" 4개 섹션을 관리 업무 흐름에 맞게 재배치). 예시: 점검현황 > 문서관리 > 직원관리 > 시설관리
- **D-05:** 하단에 관리자 이름 + 로그아웃 버튼
- **D-06:** 사이드바 중심 네비게이션 (업무용 관리 도구 스타일: Notion, Linear 등)
- **D-07:** 상단 헤더는 간소화 — 앱 로고 + 설정 버튼 정도만. keso.kr 식 드롭다운 메가메뉴 아님
- **D-08:** 모바일의 BottomNav/GlobalHeader/SideMenu 드로어는 데스크톱에서 숨김
- **D-09:** 브레이크포인트 1024px — 이상이면 데스크톱(사이드바), 미만이면 모바일(기존 레이아웃)
- **D-10:** `html { overflow: hidden }` 글로벌 CSS를 모바일 전용으로 범위 제한 (데스크톱 스크롤 차단 해제)
- **D-11:** 기본은 목록/테이블 뷰 — 카테고리별 요약 테이블, 행 클릭 시 개별 항목 아코디언 펼침
- **D-12:** 도면 뷰는 탭 전환 — 위치 기반 항목(유도등, 소화기, 소화전)만 도면에 마커 표시
- **D-13:** 층별 필터 탭 (B2, B1, 1F, 2F, 3F, 전체)
- **D-14:** 멀티 패널(2분할) 적용: 문서목록+미리보기, 조치목록+상세내용
- **D-15:** 단일 패널(넓게) 적용: 근무표(캘린더), 승강기 관리(테이블), 관리자 설정, 대시보드
- **D-16:** 점검 결과는 탭 전환 방식(목록 뷰 / 도면 뷰)이므로 멀티 패널 아님
- **D-17:** 요약 데이터는 카드형 (대시보드 KPI 등)
- **D-18:** 상세 목록은 테이블형 (넓은 화면 활용)

### Claude's Discretion

- 사이드바 섹션의 구체적인 메뉴 재배치 순서
- 간소화된 상단 헤더의 정확한 디자인
- 테이블 컬럼 구성 및 정렬 옵션
- 카드 디자인 (그림자, 라운딩, 간격 등)
- 아코디언 애니메이션 및 전환 효과
- 도면 뷰 ↔ 목록 뷰 탭 전환 UI

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LAYOUT-01 | 사용자가 PC(1920x1080)에서 영구 사이드바로 모든 메뉴에 접근할 수 있다 | DesktopSidebar 컴포넌트 + useIsDesktop 훅 패턴으로 구현 가능. SideMenu의 MENU 상수 재사용. |
| LAYOUT-02 | 사용자가 PC에서 넓은 테이블/카드 레이아웃으로 데이터를 확인할 수 있다 | overflow:hidden 해제 + BottomNav 숨김/phantom gap 제거로 데스크톱 스크롤 활성화. 각 페이지는 컨테이너 너비에 자연 적응. |
| LAYOUT-03 | 사용자가 도면과 점검 목록을 나란히 볼 수 있다 (멀티 패널) | CSS Grid/Flexbox 2분할 패널. 기존 FloorPlanPage 컴포넌트 재사용. |
| LAYOUT-04 | 모바일 레이아웃이 기존과 동일하게 유지된다 | breakpoint 1024px 조건 분기 — 미만이면 기존 모바일 렌더링 그대로. |

</phase_requirements>

---

## Summary

Phase 11은 기존 모바일 전용 PWA에 1024px 이상 데스크톱 레이아웃을 추가하는 작업이다. 백엔드 변경은 없고, 레이아웃 셸(App.tsx Layout 함수)만 수정한다. 핵심 작업은 세 가지다: (1) 글로벌 CSS `html { overflow: hidden }` 모바일 전용으로 범위 제한, (2) `useIsDesktop` 훅 + `DesktopSidebar` 컴포넌트 신규 생성, (3) App.tsx Layout 함수에서 isDesktop 분기로 모바일/데스크톱 렌더 경로 분리.

기존 코드 분석 결과, SideMenu.tsx에 이미 17개 메뉴 전체(4개 섹션)를 담은 `MENU` 상수가 있어 DesktopSidebar에서 재사용 가능하다. BottomNav는 `position: fixed; bottom: 0; height: calc(54px + var(--sab, 34px))`로 고정되어 있으며, 데스크톱에서 숨기면 Layout의 `paddingBottom: 'calc(54px + var(--sab, 34px))'` 인라인 스타일이 phantom gap을 만드는 것을 반드시 함께 제거해야 한다. SettingsPanel은 현재 `bottom: 'calc(54px + var(--sab, 34px) - var(--sat, 0px))'`로 BottomNav 위에 위치하도록 되어 있어 데스크톱에서 이 값도 조정이 필요하다.

**Primary recommendation:** `useIsDesktop` 훅(matchMedia 1024px)을 먼저 만들고, App.tsx Layout에서 분기 추가, DesktopSidebar 신규 생성 순으로 진행. CSS overflow 수정을 가장 먼저 적용해야 이후 검증이 가능하다.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 18 | 18.3.1 | 컴포넌트 렌더링 | 기존 스택 |
| React Router DOM | 6.26.2 | 라우팅 | 기존 스택 |
| Zustand | 5.0.0 | 상태 관리 | 기존 스택 |
| CSS Custom Properties | native | 테마 변수 (--bg, --t1 등) | 기존 스택, 전체 앱에서 이미 사용 중 |

### 신규 의존성 없음

Phase 11은 새로운 npm 패키지를 추가하지 않는다. 모든 기능은 기존 스택과 브라우저 네이티브 API(`window.matchMedia`)로 구현된다.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| matchMedia + useState | Tailwind lg: 클래스 | Tailwind는 CSS 클래스 분기용이고, JS 렌더 분기(DesktopSidebar vs BottomNav 토글)는 matchMedia가 필요 |
| 인라인 스타일 유지 | CSS Modules | 기존 코드 전체가 인라인 스타일 패턴. 혼용하면 일관성 깨짐 |

---

## Architecture Patterns

### Recommended Project Structure (additions only)

```
src/
├── components/
│   ├── DesktopSidebar.tsx    # NEW — 280px 고정 좌측 사이드바 (>= 1024px 전용)
│   ├── GlobalHeader.tsx      # MODIFY — 데스크톱에서 햄버거 버튼 숨김
│   ├── SettingsPanel.tsx     # MODIFY — bottom 위치 데스크톱 대응
│   └── SideMenu.tsx          # MODIFY (minor) — MENU 상수만 export 추가
├── hooks/
│   └── useIsDesktop.ts       # NEW — matchMedia(min-width: 1024px) boolean 훅
└── index.css                 # MODIFY — html overflow:hidden 모바일 전용으로 범위 제한
```

### Pattern 1: useIsDesktop 훅

**What:** `window.matchMedia('(min-width: 1024px)')` 리스너를 React 훅으로 래핑. SSR 안전성 포함.

**When to use:** App.tsx Layout 함수에서만 사용. 개별 페이지는 isDesktop을 알 필요 없음 — 컨테이너 너비에 자연 적응.

**Example:**

```typescript
// src/hooks/useIsDesktop.ts
import { useState, useEffect } from 'react'

export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 1024px)').matches
      : false
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}
```

### Pattern 2: Layout 함수 분기 구조

**What:** App.tsx의 `Layout` 함수가 `isDesktop` 기반으로 모바일/데스크톱 렌더 경로 분리. 페이지 컴포넌트는 그대로.

**When to use:** 레이아웃 셸 관심사만. 페이지 내부 로직은 건드리지 않음.

**Example:**

```typescript
// App.tsx — Layout function (결정 사항 반영)
function Layout() {
  const isDesktop = useIsDesktop()
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()
  const showNav = isAuthenticated
    && !NO_NAV_PATHS.includes(location.pathname)
    && !location.pathname.match(/^\/remediation\/.+/)
    && !location.pathname.match(/^\/legal\/.+/)
  const [sideOpen, setSideOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  // ... dashData, unresolvedCount 기존 로직 유지

  return (
    <div style={{
      display: 'flex',
      height: '100dvh',
      overflow: isDesktop ? 'hidden' : undefined,
    }}>
      {/* 데스크톱: 280px 고정 사이드바 */}
      {isDesktop && showNav && (
        <DesktopSidebar
          unresolvedCount={unresolvedCount}
          onSettingsOpen={() => setSettingsOpen(true)}
        />
      )}

      {/* 콘텐츠 영역 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        paddingTop: 'var(--sat, 0px)',
      }}>
        {/* 모바일 전용: GlobalHeader + SideMenu */}
        {!isDesktop && showNav && (
          <GlobalHeader
            title={isDashboard ? dateOnly : pageTitle}
            onMenuOpen={() => setSideOpen(true)}
            rightSlot={isDashboard ? dashboardRightSlot : undefined}
          />
        )}
        {!isDesktop && showNav && (
          <SideMenu open={sideOpen} onClose={() => setSideOpen(false)} unresolvedCount={unresolvedCount} />
        )}

        {/* 데스크톱: 간소화된 헤더 (설정 버튼만) */}
        {isDesktop && showNav && (
          <header style={{
            height: 48, display: 'flex', alignItems: 'center',
            padding: '0 16px', background: 'var(--bg2)',
            borderBottom: '1px solid var(--bd)', flexShrink: 0,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', flex: 1 }}>
              {isDashboard ? '대시보드' : pageTitle}
            </span>
            <button onClick={() => setSettingsOpen(true)} style={{ /* 기존 설정 버튼 스타일 */ }}>
              {/* 설정 아이콘 */}
            </button>
          </header>
        )}

        {/* 설정 패널 — 모바일/데스크톱 공통 */}
        <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} isDesktop={isDesktop} />

        {/* 페이지 콘텐츠 */}
        <main style={{
          flex: 1,
          overflow: 'auto',
          // 모바일: BottomNav 높이만큼 padding. 데스크톱: 0
          paddingBottom: (!isDesktop && showNav) ? 'calc(54px + var(--sab, 34px))' : 0,
        }}>
          <Suspense fallback={<Loader />}>
            <Routes>...</Routes>
          </Suspense>
        </main>

        {/* 모바일 전용: BottomNav */}
        {!isDesktop && showNav && <BottomNav unresolvedCount={unresolvedCount} />}
      </div>
    </div>
  )
}
```

### Pattern 3: DesktopSidebar 컴포넌트

**What:** 280px 고정 좌측 사이드바. 섹션 접힘/펼침. 하단 사용자 카드 + 로그아웃. SideMenu의 MENU 상수 재사용.

**Key design decisions (D-03, D-04, D-05):**
- 280px 고정 너비 (`flexShrink: 0`)
- 섹션 헤더 클릭 시 토글 (기본값: 모두 열림)
- 하단에 `staff.name` + `staff.title` + 로그아웃 버튼

**Example structure:**

```typescript
// src/components/DesktopSidebar.tsx
// MENU 상수는 SideMenu.tsx에서 export 추가 후 import
// 또는 별도 constants 파일로 분리

// 섹션 재배치 순서 (D-04, Claude's Discretion):
const DESKTOP_MENU = [
  { section: '점검 현황', items: [
    { label: '대시보드',    path: '/dashboard' },
    { label: '소방 점검',   path: '/inspection' },
    { label: '조치 관리',   path: '/remediation' },
  ]},
  { section: '문서 관리', items: [
    { label: '점검 일지 출력', path: '/reports' },
    { label: '일일업무일지',   path: '/daily-report' },
    { label: '월간 점검 계획', path: '/schedule' },
  ]},
  { section: '직원 관리', items: [
    { label: '근무표',        path: '/workshift' },
    { label: '연차 및 식사',  path: '/staff-service' },
    { label: '보수교육',      path: '/education' },
  ]},
  { section: '시설 관리', items: [
    { label: '건물 도면',   path: '/floorplan' },
    { label: '승강기 관리', path: '/elevator' },
    { label: '법적 점검',   path: '/legal' },
    { label: 'DIV 압력 관리', path: '/div' },
    { label: 'QR 코드 출력', path: '/qr-print' },
    { label: '관리자 설정', path: '/admin', role: 'admin' },
  ]},
]
```

### Pattern 4: CSS overflow 수정 (가장 먼저 적용)

**What:** `src/index.css`의 `html { overflow: hidden }` 을 모바일 전용으로 범위 제한.

**Current state (line 40-45 of index.css):**
```css
html {
  height: 100%;
  overflow: hidden;  /* ← 이것이 데스크톱 스크롤 전체 차단 */
  margin: 0;
  background: #161b22;
}
```

**Fix:**
```css
html {
  height: 100%;
  margin: 0;
  background: #161b22;
}

@media (max-width: 1023px) {
  html {
    overflow: hidden;
  }
}
```

**Why this breakpoint:** D-09에서 1024px 기준 확정. 1023px 이하 = 모바일, 1024px 이상 = 데스크톱.

### Pattern 5: SettingsPanel 데스크톱 대응

**What:** 현재 SettingsPanel은 `bottom: 'calc(54px + var(--sab, 34px) - var(--sat, 0px))'`로 BottomNav 위에 위치. 데스크톱에서 BottomNav가 없으므로 bottom: 0 또는 top: 48px로 변경 필요.

**Fix:** `isDesktop` prop 추가 또는 내부에서 `useIsDesktop` 직접 호출.

```typescript
// SettingsPanel.tsx 수정
// bottom 계산을 isDesktop 기반으로 분기
bottom: isDesktop ? 0 : 'calc(54px + var(--sab, 34px) - var(--sat, 0px))',
top: isDesktop ? 48 : 'var(--sat, 0px)',
```

### Anti-Patterns to Avoid

- **페이지별 데스크톱/모바일 복제:** 22개 페이지를 각각 복제하지 말 것. Layout 셸에서만 분기.
- **isDesktop을 개별 페이지에 prop drilling:** 레이아웃 관심사는 Layout 함수에서만.
- **BottomNav만 숨기고 paddingBottom 유지:** phantom gap 발생. 반드시 함께 제거.
- **overflow: hidden 제거 시 body도 함께 제거:** body는 `overscroll-behavior: none` 유지 (iOS bounce 방지). html만 모바일 범위로 제한.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 반응형 분기 | 복잡한 context/provider | matchMedia + useState (useIsDesktop 훅) | 1개 훅 30줄로 충분 |
| 사이드바 메뉴 데이터 | 새로운 메뉴 배열 작성 | SideMenu.tsx의 MENU 상수를 재정렬하여 재사용 | 이미 17개 메뉴 완성. 재배치만 필요 |
| 사이드바 active 상태 | 수동 active 추적 | `useLocation()` + `pathname.startsWith(item.path)` | React Router에서 그대로 재사용 |

**Key insight:** 이 phase는 신규 구현보다 기존 코드의 재배치와 조건 분기가 핵심. 복잡한 라이브러리나 새 패턴이 필요 없다.

---

## Common Pitfalls

### Pitfall 1: html overflow:hidden — 데스크톱 스크롤 전체 차단

**What goes wrong:** `src/index.css` line 40-45에 `html { overflow: hidden }` 이 글로벌로 적용. 데스크톱에서 어느 페이지도 스크롤 불가.

**Why it happens:** 모바일 PWA iOS bounce scroll 방지를 위해 전역으로 설정. 개발 시 모바일 에뮬레이터로만 테스트해서 발견 못함.

**How to avoid:** Phase 내 첫 번째 변경사항으로 `@media (max-width: 1023px)` 블록으로 범위 제한. `body { overscroll-behavior: none }`은 그대로 유지 (iOS 대응).

**Warning signs:** 데스크톱에서 콘텐츠가 viewport 높이에서 잘리고 스크롤바 없음.

### Pitfall 2: BottomNav 숨김 후 phantom gap

**What goes wrong:** Layout의 `paddingBottom: showNav ? 'calc(54px + var(--sab, 34px))' : 0` 이 BottomNav 숨김과 동기화 안 됨. 데스크톱에서 하단에 88px 공백 발생.

**Why it happens:** 현재 App.tsx line 121: `paddingBottom: showNav ? 'calc(54px + var(--sab, 34px))' : 0`. showNav 조건에 `&& !isDesktop` 추가 필요.

**How to avoid:** paddingBottom 조건을 `(!isDesktop && showNav)`으로 변경. BottomNav 렌더 조건과 동일한 논리 사용.

**Warning signs:** BottomNav 숨긴 후 데스크톱 페이지 하단에 빈 공간.

### Pitfall 3: SettingsPanel bottom 위치 오류

**What goes wrong:** SettingsPanel이 `bottom: 'calc(54px + var(--sab, 34px) - var(--sat, 0px))'`로 열림. 데스크톱에서 BottomNav 높이(88px)만큼 위에서 시작해서 화면 하단에 88px 공간 낭비.

**Why it happens:** SettingsPanel은 BottomNav 바로 위에 맞춰 설계됨. 현재 App.tsx line 120: `{isDashboard && showNav && <SettingsPanel .../>}` — isDashboard 조건도 수정 필요 (데스크톱에서는 모든 페이지에서 설정 열 수 있어야 함).

**How to avoid:** SettingsPanel에 `isDesktop` 인지 전달하거나 내부에서 `useIsDesktop()` 호출. bottom/top 위치 분기.

**Warning signs:** 데스크톱에서 설정 패널이 화면 최하단까지 안 내려오고 중간에 뜸.

### Pitfall 4: NO_NAV_PATHS 와 SettingsPanel 노출 범위

**What goes wrong:** 현재 App.tsx line 120: `{isDashboard && showNav && <SettingsPanel .../>}` — 대시보드에서만 설정 패널 열 수 있음. 데스크톱에서는 어느 페이지에서든 사이드바 상단 설정 버튼으로 접근 가능해야 함.

**How to avoid:** 데스크톱에서는 `showNav && <SettingsPanel .../>` 로 isDashboard 조건 제거. 사이드바의 설정 버튼 onClick에서 `setSettingsOpen(true)` 호출.

### Pitfall 5: SideMenu의 MENU 상수 export 미비

**What goes wrong:** SideMenu.tsx의 MENU 상수는 현재 파일 내부에만 있음 (`const MENU = ...`). DesktopSidebar에서 임포트 불가.

**How to avoid:** 두 가지 방법:
1. MENU 상수를 별도 파일(`src/constants/navigation.ts`)로 분리 후 양쪽에서 import
2. SideMenu.tsx에서 `export const MENU = ...`로 변경 후 DesktopSidebar에서 import

방법 1이 더 깔끔하나, 방법 2가 변경 범위가 더 작음. 플래너 판단.

---

## Code Examples

### useIsDesktop 훅 (검증된 패턴)

```typescript
// src/hooks/useIsDesktop.ts
import { useState, useEffect } from 'react'

export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 1024px)').matches
      : false
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}
```

### DesktopSidebar 기본 구조

```typescript
// src/components/DesktopSidebar.tsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

interface Props {
  unresolvedCount: number
  onSettingsOpen: () => void
}

export function DesktopSidebar({ unresolvedCount, onSettingsOpen }: Props) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { staff, logout } = useAuthStore()

  // 섹션 접힘/펼침 상태 (D-03)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const toggleSection = (section: string) =>
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }))

  return (
    <nav style={{
      width: 280,          // D-03: 280px 고정
      flexShrink: 0,
      height: '100dvh',
      background: 'var(--bg2)',
      borderRight: '1px solid var(--bd)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* 앱 로고 헤더 */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--bd)', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>차바이오컴플렉스</div>
        <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>소방안전 통합관리</div>
      </div>

      {/* 메뉴 목록 (스크롤 가능) */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {DESKTOP_MENU.map(({ section, items }) => (
          <div key={section}>
            <button
              onClick={() => toggleSection(section)}
              style={{
                width: '100%', background: 'none', border: 'none',
                padding: '8px 14px 3px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                {section}
              </span>
              <span style={{ fontSize: 10, color: 'var(--t3)', transform: collapsed[section] ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform 0.15s' }}>▾</span>
            </button>
            {!collapsed[section] && items.map(item => {
              if (item.role && staff?.role !== item.role) return null
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/')
              return (
                <div
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', margin: '1px 8px', borderRadius: 7,
                    cursor: 'pointer',
                    background: isActive ? 'var(--acl)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--t1)',
                    fontSize: 12.5, fontWeight: isActive ? 600 : 400,
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg4)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.path === '/remediation' && unresolvedCount > 0 && (
                    <span style={{ background: 'var(--danger)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 8 }}>
                      {unresolvedCount > 99 ? '99+' : unresolvedCount}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* D-05: 하단 사용자 카드 + 로그아웃 */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--bd)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', background: 'var(--bg3)', borderRadius: 9 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {staff?.name?.[0] ?? '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700 }}>{staff?.name}</div>
            <div style={{ fontSize: 9.5, color: 'var(--t3)' }}>{staff?.title}</div>
          </div>
          <button
            onClick={() => onSettingsOpen()}
            style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', padding: '4px' }}
            title="설정"
          >
            <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <button
            onClick={() => { logout(); navigate('/login') }}
            style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: 11 }}
          >
            로그아웃
          </button>
        </div>
      </div>
    </nav>
  )
}
```

### index.css overflow 수정

```css
/* index.css — html block 수정 */
html {
  height: 100%;
  /* overflow: hidden 제거 — 데스크톱 스크롤 허용 */
  margin: 0;
  background: #161b22;
}

/* 모바일 전용: iOS bounce 방지 */
@media (max-width: 1023px) {
  html {
    overflow: hidden;
  }
}
```

### 데스크톱 멀티 패널 레이아웃 (LAYOUT-03)

```typescript
// 2분할 패널 패턴 — FloorPlanPage 등에서 사용
// 사이드바(280px) + 콘텐츠 영역에서 추가 2분할
<div style={{
  display: 'flex',
  height: '100%',
  overflow: 'hidden',
}}>
  {/* 왼쪽 패널: 목록 */}
  <div style={{
    width: 360,
    flexShrink: 0,
    borderRight: '1px solid var(--bd)',
    overflowY: 'auto',
  }}>
    {/* 점검 목록 */}
  </div>

  {/* 오른쪽 패널: 도면/미리보기 */}
  <div style={{ flex: 1, overflow: 'auto' }}>
    {/* 도면 또는 문서 미리보기 */}
  </div>
</div>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `matchMedia` 직접 콜 | `matchMedia.addEventListener('change', ...)` | Chrome 70+ / 2018 | `addListener` deprecated. `addEventListener` 사용 필요 |
| `100vh` | `100dvh` (dynamic viewport height) | iOS Safari 15.4 / 2022 | 이미 index.css에서 body에 `100dvh` 사용 중 |

**Deprecated/outdated:**
- `matchMedia.addListener()`: deprecated. `matchMedia.addEventListener('change', handler)` 사용 (이미 위 예시에서 반영).

---

## Open Questions

1. **MENU 상수 분리 vs export**
   - What we know: SideMenu.tsx 내부에 `const MENU` 로 선언됨. DesktopSidebar에서 재사용 필요.
   - What's unclear: DESKTOP_MENU는 섹션 재배치가 필요하므로 어차피 새로 작성. SideMenu MENU 공유 vs 각자 독립 관리.
   - Recommendation: DESKTOP_MENU는 DesktopSidebar 내부에 독립적으로 선언. SideMenu MENU는 모바일용으로 그대로 유지. 메뉴 데이터 중복이지만 모바일/데스크톱 메뉴 구조가 달라 분리가 더 유연함.

2. **NO_NAV_PATHS 데스크톱 적용 범위**
   - What we know: `/schedule`, `/reports`, `/daily-report` 등이 NO_NAV_PATHS에 포함 (모바일에서 BottomNav 숨김).
   - What's unclear: 데스크톱에서도 이 경로들에서 사이드바를 숨겨야 하는가?
   - Recommendation: 데스크톱에서는 사이드바를 항상 표시. NO_NAV_PATHS는 모바일 전용 로직으로 처리. `showNav` 조건을 `isDesktop || (!NO_NAV_PATHS.includes(...))` 패턴으로 변경.

3. **`/inspection/qr` 경로 데스크톱 처리**
   - What we know: QR 스캔은 모바일 카메라 전용 기능. 데스크톱에서는 불필요.
   - What's unclear: 사이드바에서 QR 스캔 메뉴 표시 여부.
   - Recommendation: DESKTOP_MENU에서 QR 스캔 항목 제외. 소방 점검 경로에서만 접근 가능하게.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 11은 순수 프론트엔드 레이아웃 변경. 외부 도구, 서비스, 또는 새로운 런타임 의존성 없음. 기존 `npm run dev:front` 로 검증 가능.

---

## Validation Architecture

> 이 프로젝트에 테스트 프레임워크가 존재하지 않는다 (package.json에 test script 없음, jest/vitest/cypress 설정 파일 없음). Wave 0에서 테스트 인프라를 구축하는 것은 Phase 11 범위를 크게 초과하므로, 이 phase는 수동 브라우저 검증으로 품질 보증한다.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | 없음 (프로젝트에 테스트 프레임워크 미설치) |
| Config file | 없음 |
| Quick run command | `npm run build && npx wrangler pages dev dist --d1 DB=cha-bio-db` |
| Full suite command | 수동 브라우저 검증 (1920x1080 + 모바일 에뮬레이터) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LAYOUT-01 | PC에서 영구 사이드바로 모든 메뉴 접근 | manual | 브라우저 1920x1080 — 사이드바 표시 + 모든 링크 클릭 확인 | N/A |
| LAYOUT-02 | PC에서 넓은 테이블/카드 레이아웃 + 스크롤 | manual | 브라우저 1920x1080 — 각 페이지 스크롤 확인 | N/A |
| LAYOUT-03 | 도면과 점검 목록 나란히 표시 (멀티 패널) | manual | 브라우저 1920x1080 — FloorPlanPage 2분할 확인 | N/A |
| LAYOUT-04 | 모바일 레이아웃 기존과 동일 | manual | 브라우저 DevTools iPhone SE 에뮬레이터 — BottomNav + GlobalHeader 표시 확인 | N/A |

### Sampling Rate

- **Per task commit:** `npm run build` — TypeScript 컴파일 오류 없음 확인
- **Per wave merge:** 브라우저 1920x1080 + 모바일 에뮬레이터 양쪽 검증
- **Phase gate:** LAYOUT-01~04 수동 체크리스트 완료 후 `/gsd:verify-work`

### Wave 0 Gaps

없음 — 기존 테스트 인프라 부재를 감안하여 수동 검증으로 대체. Phase 11 범위는 레이아웃 셸이므로 수동 브라우저 검증이 실질적으로 가장 효과적.

수동 검증 체크리스트 (Wave 0 대신):
- [ ] 1920x1080 데스크톱 브라우저: 사이드바 280px 표시, BottomNav 미표시
- [ ] 1920x1080: 각 사이드바 링크 클릭 시 페이지 이동
- [ ] 1920x1080: 긴 콘텐츠 페이지 (inspection, schedule) 세로 스크롤 가능
- [ ] 767px 이하 모바일: BottomNav 표시, 사이드바 미표시, 기존 동작 유지
- [ ] 1023px: 모바일 레이아웃 (미만이면 모바일)
- [ ] 1024px: 데스크톱 레이아웃 (이상이면 데스크톱)
- [ ] iOS 에뮬레이터: 기존 safe-area, bounce 방지 동작 이상 없음

---

## Sources

### Primary (HIGH confidence)

- 직접 코드 검사: `src/App.tsx`, `src/index.css`, `src/components/BottomNav.tsx`, `src/components/SideMenu.tsx`, `src/components/GlobalHeader.tsx`, `src/components/SettingsPanel.tsx`
- `.planning/research/ARCHITECTURE.md` — useIsDesktop 훅 + DesktopSidebar 설계 패턴 (HIGH)
- `.planning/research/PITFALLS.md` — overflow:hidden, BottomNav phantom gap 함정 (HIGH)
- `.planning/research/SUMMARY.md` — 전체 v1.1 스택 및 아키텍처 요약 (HIGH)
- MDN — `Window.matchMedia()`: https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia

### Secondary (MEDIUM confidence)

- `.planning/phases/11-desktop-layout-foundation/11-CONTEXT.md` — 사용자 결정 사항 (D-01 ~ D-18)
- `.planning/REQUIREMENTS.md` — LAYOUT-01~04 요구사항 정의

### Tertiary (LOW confidence)

없음 — 모든 핵심 발견은 직접 코드 검사 또는 기존 HIGH 신뢰도 리서치 파일로 검증됨.

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — 기존 스택 그대로 사용, 신규 의존성 없음
- Architecture: HIGH — 직접 코드 검사로 현재 상태 완전히 파악. 기존 리서치 문서(ARCHITECTURE.md)와 일치
- Pitfalls: HIGH — 기존 PITFALLS.md + 직접 코드 검사로 확인 (overflow:hidden 위치, BottomNav height 값 등)

**Research date:** 2026-04-05
**Valid until:** 2026-05-05 (안정적인 React/CSS 패턴, 빠른 변동 없음)
