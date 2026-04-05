---
phase: 11-desktop-layout-foundation
verified: 2026-04-04T00:00:00Z
status: gaps_found
score: 3/4 must-haves verified
re_verification: false
gaps:
  - truth: "사용자가 도면과 점검 목록을 나란히 볼 수 있다 (멀티 패널)"
    status: failed
    reason: "멀티 패널 레이아웃이 어떤 페이지에도 구현되어 있지 않다. UI-SPEC은 이것을 Phase 12 책임으로 명시했고, DISCUSSION-LOG는 탭 전환 방식(목록 뷰/도면 뷰)으로 접근 방식을 변경했다. LAYOUT-03 요구사항이 Phase 11 Traceability에 Complete로 마킹되어 있지만, 실제 나란히(side-by-side) 보기 기능은 코드베이스에 없다."
    artifacts:
      - path: "src/pages/FloorPlanPage.tsx"
        issue: "column flex layout 사용 — side-by-side panel 없음"
      - path: "src/pages/InspectionPage.tsx"
        issue: "탭 전환 방식으로 구현 예정 (DISCUSSION-LOG D-16) — 멀티 패널 없음"
    missing:
      - "FloorPlanPage 또는 별도 페이지에 도면+점검목록 2분할 패널 구현 (OR REQUIREMENTS.md에서 LAYOUT-03을 Phase 12로 재배정하고 Phase 11 Complete 마킹 정정)"
human_verification:
  - test: "데스크톱 레이아웃 시각 검증 (Plan 02 Task 2 — 체크포인트 미완료)"
    expected: "PC 1024px+에서 280px 사이드바 + 48px 상단 헤더, BottomNav 없음, 메인 콘텐츠 스크롤 가능, 모바일 1023px-에서 기존 레이아웃 유지"
    why_human: "브라우저 시각 검증 필요. Plan 02 Summary에 'Task 2 is human-verify checkpoint — awaiting visual confirmation'으로 명시됨"
  - test: "SettingsPanel 데스크톱 위치 확인"
    expected: "설정 패널이 48px 슬림 헤더 아래에서 시작해야 하나, 코드는 top: 0으로 구현됨 — 패널이 헤더와 겹치는지 확인"
    why_human: "Plan spec는 isDesktop ? 48 : SAT를 요구하지만 실제 구현은 isDesktop ? 0 : SAT. 시각적 영향 확인 필요"
---

# Phase 11: Desktop Layout Foundation Verification Report

**Phase Goal:** PC(1920x1080)에서 모든 페이지가 사이드바 탐색으로 스크롤 가능하게 동작한다
**Verified:** 2026-04-04
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | 사용자가 PC(1024px 이상)에서 영구 사이드바로 모든 메뉴에 접근할 수 있다 | ✓ VERIFIED | DesktopSidebar.tsx 280px 고정, 16개 메뉴, App.tsx `isDesktop && showNav` 조건부 렌더, DESKTOP_NO_NAV_PATHS=['/', '/login'] — 인증 페이지에서 사이드바 표시 |
| 2 | 사용자가 PC에서 넓은 테이블/카드 레이아웃으로 데이터를 스크롤하여 확인할 수 있다 (하단 공백이나 잘림 없음) | ✓ VERIFIED | App.tsx `<main style={{ overflow: 'auto' }}>` + `paddingBottom: (!isDesktop && showNav) ? 'calc(54px + var(--sab, 34px))' : 0` — 데스크톱에서 phantom gap 없음, 스크롤 활성화 |
| 3 | 사용자가 도면과 점검 목록을 나란히 볼 수 있다 (멀티 패널) | ✗ FAILED | 코드베이스 어느 페이지에도 side-by-side 멀티 패널 없음. FloorPlanPage.tsx는 column flex. UI-SPEC "This phase scaffolds the shell. Specific multi-panel pages are Phase 12 responsibility." DISCUSSION-LOG: 점검 결과 화면은 탭 전환 방식으로 합의됨 |
| 4 | 모바일(767px 이하)에서 기존 BottomNav/헤더/드로어 방식이 기존과 동일하게 동작한다 | ✓ VERIFIED | App.tsx `!isDesktop && showNav` 가드로 GlobalHeader, SideMenu 드로어, BottomNav 모두 모바일에서만 렌더. index.css `@media (max-width: 1023px) { html { overflow: hidden; } }` — 모바일 overflow 보존 |

**Score:** 3/4 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|---------|--------|---------|
| `src/hooks/useIsDesktop.ts` | matchMedia 기반 데스크톱 판별 훅 | ✓ VERIFIED | 15줄, `window.matchMedia('(min-width: 1024px)')`, addEventListener/removeEventListener 정리 포함 |
| `src/components/DesktopSidebar.tsx` | 280px 영구 사이드바 | ✓ VERIFIED | 249줄, `width: 280`, 4개 섹션(점검 현황/문서 관리/직원 관리/시설 관리), 섹션 토글, 역할 필터, 미조치 배지, 사용자 카드, LogOut |
| `src/index.css` | 모바일 전용 overflow:hidden | ✓ VERIFIED | `html` 블록에 overflow:hidden 없음, `@media (max-width: 1023px) { html { overflow: hidden; } }` line 46-50 |
| `src/App.tsx` | isDesktop 분기 Layout 함수 | ✓ VERIFIED | useIsDesktop import, MOBILE_NO_NAV_PATHS/DESKTOP_NO_NAV_PATHS 분리, DesktopSidebar 조건부 렌더, SettingsPanel isDesktop prop 전달 |
| `src/components/SettingsPanel.tsx` | 데스크톱 대응 bottom 위치 | ✓ VERIFIED (with deviation) | `isDesktop?: boolean` prop 존재, bottom: `isDesktop ? 0 : 'calc(...)'` — 단, Plan spec의 top: 48이 아닌 top: 0 구현 (하단 참고) |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `src/App.tsx` | `src/hooks/useIsDesktop.ts` | `import { useIsDesktop }` | ✓ WIRED | App.tsx line 12: `import { useIsDesktop } from './hooks/useIsDesktop'` |
| `src/App.tsx` | `src/components/DesktopSidebar.tsx` | `isDesktop && showNav && <DesktopSidebar>` | ✓ WIRED | App.tsx line 10 import + line 140-145 조건부 렌더 |
| `src/App.tsx` | `src/components/SettingsPanel.tsx` | `isDesktop` prop | ✓ WIRED | App.tsx line 206: `<SettingsPanel ... isDesktop={isDesktop && showNav} />` |
| `src/components/DesktopSidebar.tsx` | `src/components/SideMenu.tsx` | `import { MENU, MenuItem }` | ✓ WIRED | DesktopSidebar.tsx line 5: `import { MENU, MenuItem } from './SideMenu'` |
| `src/components/DesktopSidebar.tsx` | `src/stores/authStore` | `useAuthStore` | ✓ WIRED | DesktopSidebar.tsx line 4: `import { useAuthStore } from '../stores/authStore'`; line 23: `const { staff, logout } = useAuthStore()` |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|-------------|--------|-------------------|--------|
| `src/components/DesktopSidebar.tsx` | `staff` (name, role) | `useAuthStore()` → Zustand persist | Yes — JWT 로그인 후 localStorage에 저장 | ✓ FLOWING |
| `src/components/DesktopSidebar.tsx` | `unresolvedCount` | App.tsx `dashboardApi.getStats` → `/api/dashboard/stats` D1 쿼리 | Yes — React Query, staleTime 30s | ✓ FLOWING |
| `src/App.tsx` | `isDesktop` | `useIsDesktop()` → `window.matchMedia` | Yes — 실시간 브라우저 viewport 감지 | ✓ FLOWING |

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| 빌드 성공 | `npm run build` | "built in 8.83s" + PWA 생성 | ✓ PASS |
| TypeScript 에러 없음 | `npx tsc --noEmit` | 출력 없음 (에러 0) | ✓ PASS |
| useIsDesktop 훅 존재 | `grep "export function useIsDesktop" src/hooks/useIsDesktop.ts` | line 3 | ✓ PASS |
| MENU export 존재 | `grep "export const MENU" src/components/SideMenu.tsx` | line 17 | ✓ PASS |
| overflow:hidden 모바일 전용 | `grep -n "overflow: hidden" src/index.css` | line 48 (inside @media max-width: 1023px) | ✓ PASS |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| LAYOUT-01 | 11-01, 11-02 | PC에서 영구 사이드바로 모든 메뉴 접근 | ✓ SATISFIED | DesktopSidebar 280px, 16개 메뉴, DESKTOP_NO_NAV_PATHS=['/', '/login'] |
| LAYOUT-02 | 11-02 | PC에서 넓은 테이블/카드 레이아웃 데이터 확인 | ✓ SATISFIED | main `overflow: auto`, paddingBottom 데스크톱에서 0 — 스크롤 가능, phantom gap 없음 |
| LAYOUT-03 | 11-02 | 도면과 점검 목록을 나란히 볼 수 있다 (멀티 패널) | ✗ BLOCKED | 어느 페이지에도 side-by-side 패널 없음. UI-SPEC에서 Phase 12 책임으로 연기. REQUIREMENTS.md에 Complete로 잘못 마킹됨 |
| LAYOUT-04 | 11-01, 11-02 | 모바일 레이아웃 기존 동일 유지 | ✓ SATISFIED | `!isDesktop && showNav` 가드로 GlobalHeader/SideMenu/BottomNav 모바일 전용, CSS `@media (max-width: 1023px)` overflow 보존 |

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|---------|--------|
| `src/components/SettingsPanel.tsx` | 123 | `top: isDesktop ? 0 :` — Plan spec은 `isDesktop ? 48 :` 요구 | ⚠️ Warning | 데스크톱에서 설정 패널이 48px 슬림 헤더와 겹침 가능. 기능 차단은 아니나 시각적 오버랩 발생 가능 |
| `src/components/DesktopSidebar.tsx` | 9 (DESKTOP_SECTIONS) | `/meal` 경로가 DESKTOP_SECTIONS의 직원 관리 섹션에 없음 — SideMenu MENU에도 없음. OK (direct route 없음) | ℹ️ Info | 사용자 영향 없음 — `/meal`은 직접 라우팅 없이 `/staff-service` 로 통합됨 |

---

## Human Verification Required

### 1. 데스크톱 레이아웃 시각 검증 (Plan 02 Task 2 — 체크포인트 미완료)

**Test:** `npm run dev`로 개발 서버 시작 후 PC 브라우저 1024px+ 에서 접속, 로그인 후 다음 확인:
1. 좌측 280px 사이드바 표시 (4개 섹션: 점검 현황/문서 관리/직원 관리/시설 관리)
2. 상단 48px 간소화 헤더 표시 (페이지 타이틀 + 설정 버튼)
3. BottomNav 표시 안 됨
4. 메인 콘텐츠 영역 스크롤 가능
5. 사이드바 메뉴 클릭으로 페이지 이동 (5개 이상)
6. 1023px 이하로 브라우저 축소 시 기존 GlobalHeader + BottomNav 표시, 사이드바 숨김

**Expected:** Plan 02의 how-to-verify 체크리스트 전부 통과
**Why human:** 브라우저 시각 검증 필요. Plan 02 Task 2가 "blocking" human-verify checkpoint로 정의됨

### 2. SettingsPanel 상단 겹침 확인

**Test:** 데스크톱에서 설정 패널(톱니바퀴 버튼) 클릭 후 패널 상단이 48px 헤더 아래에서 시작하는지 확인
**Expected:** 패널 상단이 48px 헤더 아래에서 시작해야 함. 현재 코드(`top: 0`)는 헤더와 겹칠 수 있음
**Why human:** `top: 0` vs `top: 48` 차이가 실제 UI에서 문제가 되는지 시각적 확인 필요. 헤더가 `position: relative`라면 겹치지 않을 수 있음

---

## Gaps Summary

**LAYOUT-03 (멀티 패널) 미구현:** Phase 11의 4번 success criterion "사용자가 도면과 점검 목록을 나란히 볼 수 있다"는 코드베이스에 구현되지 않았다. UI-SPEC(line 247)은 이를 Phase 12 책임으로 명시했고, DISCUSSION-LOG는 점검 결과 화면의 접근 방식을 탭 전환으로 변경했다. Plan 02 success criteria도 "(LAYOUT-03 기반)"이라는 표현을 사용해 구조 scaffolding만을 완료했음을 시사한다.

두 가지 해결 방법:
1. FloorPlanPage(또는 InspectionPage)에 실제 side-by-side 2분할 패널 구현
2. LAYOUT-03 요구사항을 Phase 12로 재배정하고 REQUIREMENTS.md의 Complete 마킹을 수정 (설계 변경 반영)

**SettingsPanel top 값 편차:** Plan spec(`top: 48`)과 실제 구현(`top: 0`)이 다르다. 기능 차단은 아니지만 데스크톱에서 설정 패널이 48px 헤더와 겹칠 수 있다. 시각적 검증으로 확인 필요.

**Plan 02 Task 2 human checkpoint 미완료:** SUMMARY에 "Task 2 is human-verify checkpoint — awaiting visual confirmation"이 명시되어 있다. Phase 11의 시각적 검증이 공식적으로 완료되지 않았다.

---

_Verified: 2026-04-04_
_Verifier: Claude (gsd-verifier)_
