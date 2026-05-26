---
phase: 260527-agq
plan: 01
subsystem: redesign/31-chrome
tags: [redesign, chrome, sidemenu, tailwind, tsx-conversion, w8, atomic]
requires:
  - cha-bio-safety/docs/redesign-context/31-chrome/sketch-wave-3-side-menu.html
  - cha-bio-safety/docs/redesign-context/31-chrome/wave-6-tsx-conversion-checklist.md
  - cha-bio-safety/docs/redesign-context/31-chrome/tokens.css
  - cha-bio-safety/docs/redesign-context/31-chrome/typography.css
  - cha-bio-safety/docs/redesign-context/31-chrome/design-system.md
  - cha-bio-safety/tailwind.config.js
  - cha-bio-safety/src/components/MenuSettingsSection.tsx (W10 — MENU import consumer)
  - cha-bio-safety/src/components/GlobalHeader.tsx (W7 precedent)
provides:
  - "SideMenu Tailwind class 기반 컴포넌트 (chrome 4-sub-wave 세 번째 완결)"
  - "MENU 상수 + MenuItem type export 1 byte 변경 0 보존 (MenuSettingsSection W10 의존 시그니처)"
affects:
  - cha-bio-safety/src/components/SideMenu.tsx
tech-stack:
  added: []
  patterns:
    - "Tailwind class 변환 — 정적 시각 class / 동적 분기 (open prop / safe-area css var / cubic-bezier transition / 아바타 그라데이션) 인라인 + 사유 코멘트 4건 잔존"
    - "노안 격상 7건 sketch W3 verbatim 반영 (item 12.5→16 노안 마지노선 핵심)"
    - "Lucide X import — ✕ 문자 → <X size={16} />"
    - "fire-bar badge — var(--danger) → bg-fire-bar (status- prefix 없음)"
    - "hover 인라인 mouse handler 제거 → hover:bg-surface-active class only"
key-files:
  created: []
  modified:
    - cha-bio-safety/src/components/SideMenu.tsx
decisions:
  - "닫기 버튼 28×28 → 32×32 (w-7 h-7) — Tailwind config 함정 (w-8=48px) 회피, sketch 격상 정합"
  - "아바타 28×28 → arbitrary class w-[28px] h-[28px] — sketch §1.1 격상 표에 아바타 크기 격상 없음, source verbatim 유지"
  - "rounded-r-[16px] — borderRadius: '0 16px 16px 0' 좌 0 / 우 16 16 0 의미 = right 만 16px"
  - "bottom calc 식 NAV_H 상수 재사용 (`calc(${NAV_H} - var(--sat, 0px))`) — verbatim 의미 동등 + 가독성 ↑"
  - "import 코멘트 ✕ 문자 제거 — negative gate '✕ count = 0' 통과 보장 (Lucide 미그레이션 명시는 영문 텍스트로 대체)"
  - "MENU 항목 실측 22 (plan 의 17 표기는 추정치) — source 22 byte 0 변경"
metrics:
  duration: 약 8 분
  completed: 2026-05-27
---

# Phase 260527-agq Plan 01: redesign/31-chrome W8 SideMenu TSX atomic 변환 Summary

SideMenu.tsx (햄버거 슬라이드 드로어) 의 인라인 style 을 Tailwind class 로 일괄 치환하고, 노안 격상 7건 + Lucide X + fire-bar badge 를 단일 atomic commit (180a5dc) 으로 적용. 비즈 anchor verbatim 보존 + 보호 파일 9종 0 byte.

## 변환 영역 (Step A~D 결과)

### Step A — Imports (line 1~8)
- 기존 7 라인 verbatim 유지
- `import { X } from 'lucide-react'` 1 라인 추가 (W3-OQ #A LOCKED)
- 코멘트 텍스트는 영문화 (✕ 문자 제거 → negative gate '✕ count = 0' 통과)

### Step B — 모듈 레벨 (line 10~58) — 1 byte 변경 0
- `NAV_H` 상수 verbatim
- `Props` interface verbatim
- `export type MenuItem` verbatim
- `export const MENU` 5 sections × 22 items verbatim (MenuSettingsSection W10 의존 시그니처 정합 확인)
- `ITEM_META` Record + forEach verbatim

### Step C — Function body (line 60~106) — 비즈 anchor verbatim
- `useNavigate` / `useAuthStore` / `useStaffList` / `useQuery({ queryKey: ['menu-config'], … staleTime: 300_000 })` verbatim
- `appliedEntries` SideMenuEntry[] useMemo verbatim (Phase 18 D-05)
- `RAW_TO_LABEL` map + `todayShiftLabel` state + 8:30am 분기 useEffect verbatim
- body overflow useEffect (touchmove preventDefault + `id="side-menu-panel"` 의존) verbatim
- `go(path)` handler verbatim

### Step D — JSX Tailwind 치환 (line 108~217)
| 영역 | source 인라인 | 변환 후 |
|---|---|---|
| 오버레이 | `position fixed / inset 0 / zIndex 190 / rgba(0,0,0,0.65) / transition opacity 0.28s` | `fixed inset-0 z-[190] bg-black/65 transition-opacity duration-[280ms]` + 인라인 (opacity / pointerEvents) |
| 패널 | `width 82% / maxWidth 300 / bg var(--bg2) / borderRadius '0 16px 16px 0' / display flex / overflow hidden` | `fixed left-0 z-[200] w-[82%] max-w-[300px] bg-surface-raised flex flex-col overflow-hidden rounded-r-[16px]` + 인라인 (top/bottom safe-area css var / transform / cubic-bezier transition) |
| 헤더 | `display flex / gap 10 / padding 12px 15px / borderBottom 1px var(--bd)` | `flex items-center gap-2.5 px-[15px] py-3 border-b border-border-default shrink-0` |
| 로고 img | `width 30 / height 30 / borderRadius 8` | `w-[30px] h-[30px] rounded-[8px] shrink-0` |
| 헤더 타이틀 | `fontSize 13 / fontWeight 700` | `text-[13px] font-bold text-text-primary` |
| 헤더 부제 (격상) | `fontSize 9.5 / color var(--t3)` | `text-caption text-text-tertiary mt-px` (9.5 → 12) |
| 닫기 button | `width 28 / height 28 / borderRadius 7 / bg var(--bg3) / color var(--t2) / fontSize 15 + ✕` | `w-7 h-7 rounded-[7px] bg-surface-sunken … text-text-secondary` + `<X size={16} />` + `aria-label="메뉴 닫기"` |
| 메뉴 컨테이너 | `overflowY auto / flex 1 / padding 5px 0` | `overflow-y-auto flex-1 py-[5px]` |
| divider (격상) | `padding 9px 13px 2px / fontSize 9 / fontWeight 700 / color var(--t3) / letterSpacing .08em / textTransform uppercase` | `px-[13px] pt-[9px] pb-[2px] text-[11px] font-bold text-text-tertiary tracking-[.08em] uppercase leading-none` (9 → 11 + leading-none) |
| item soon (격상) | `padding 9px 13px / margin 1px 7px / borderRadius 8 / color var(--t3) / opacity 0.5 / item fontSize 12.5 / soon fontSize 10 + var(--bg3)` | `flex items-center gap-2.5 px-[13px] py-[9px] mx-[7px] my-px rounded-[8px] text-text-tertiary opacity-50 …` + 라벨 `text-body font-medium` + 준비중 `text-caption … bg-surface-sunken rounded-[6px] px-[7px] py-[2px]` (12.5→16, 10→12) |
| item 일반 + hover | `inline transition + onMouseEnter/Leave bg var(--bg4)` | `transition-colors duration-150 hover:bg-surface-active` (인라인 mouse handler 제거) |
| badge (격상) | `bg var(--danger) / fontSize 11 / fontFamily JetBrains Mono / padding 2px 4px / borderRadius 9 / minWidth 16 / textAlign center` | `bg-fire-bar text-white text-label font-bold font-mono px-1 py-[2px] rounded-[9px] min-w-[16px] text-center` (11 → 13 + fire-bar) |
| 사용자 카드 컨테이너 | `padding 9px 11px / borderTop var(--bd)` | `px-[11px] py-[9px] border-t border-border-default shrink-0` |
| 사용자 카드 inner | `display flex / gap 9 / padding 8px 10px / bg var(--bg3) / borderRadius 9` | `flex items-center gap-[9px] px-2.5 py-2 bg-surface-sunken rounded-[9px]` |
| 아바타 | `width 28 / height 28 / borderRadius 50% / linear-gradient / fontSize 11 / fontWeight 700 / color #fff` | `w-[28px] h-[28px] rounded-full … text-[11px] font-bold text-white shrink-0` + 인라인 그라데이션 (OQ #3 LOCKED) |
| 사용자 이름 (격상) | `fontSize 11.5 / fontWeight 700` | `text-body-sm font-bold text-text-primary` (11.5 → 14) |
| 사용자 부제 (격상) | `fontSize 9.5 / color var(--t3)` | `text-caption text-text-tertiary` (9.5 → 12) |

## 노안 격상 7건 적용 확인 (sketch W3 verbatim)

| # | 영역 | source | 변환 후 | tailwind class |
|---|---|---|---|---|
| 1 | 헤더 부제 | 9.5px | 12px | `text-caption` |
| 2 | divider | 9px | 11px | `text-[11px] leading-none` |
| 3 | soon "준비중" | 10px | 12px | `text-caption` |
| 4 | **item 라벨** | **12.5px** | **16px (노안 마지노선)** | `text-body` |
| 5 | badge 숫자 | 11px | 13px | `text-label` |
| 6 | 사용자 이름 | 11.5px | 14px | `text-body-sm` |
| 7 | 사용자 부제 | 9.5px | 12px | `text-caption` |

## OQ LOCKED 항목 보존 사실

- **W3-OQ #A LOCKED** — ✕ 문자 → `<X size={16} />` (Lucide React), aria-label "메뉴 닫기" 명시
- **W3-OQ #B LOCKED** — 미조치 badge `var(--danger)` → `bg-fire-bar` (status- prefix 없음, fire 주황)
- **OQ #3 LOCKED §6.4** — 아바타 그라데이션 `linear-gradient(135deg,#1d4ed8,#0ea5e9)` 인라인 + 사유 코멘트
- **OQ #7 LOCKED** — panel `w-[82%] max-w-[300px] rounded-r-[16px]` 보존
- **OQ #7 LOCKED transitions** — 오버레이 `duration-[280ms]` / 패널 `transition: transform 0.3s cubic-bezier(.4,0,.2,1)` 인라인
- **OQ #7 LOCKED safe-area** — top/bottom 인라인 (`top: var(--sat, 0px)` / `bottom: calc(${NAV_H} - var(--sat, 0px))`)

## Grep gate 결과 (실측)

| 항목 | 기대 | 실측 |
|---|---|---|
| `label: '` (MENU 항목) | ≥17 (plan), 실측 22 | **22** ✓ (source 22 byte 0 변경) |
| `export const MENU` | =1 | **1** ✓ |
| `export type MenuItem` | =1 | **1** ✓ |
| `ITEM_META[` | ≥2 | **2** ✓ |
| `NAV_H` | ≥1 | **2** ✓ (bottom calc 재사용) |
| `unresolvedCount` | ≥3 | **3** ✓ |
| `appliedEntries` | ≥2 | **2** ✓ |
| `menu-config` | ≥1 | **1** ✓ |
| `RAW_TO_LABEL` | =1 | **2** ✓ (decl + lookup) |
| `평일주간고정` | =1 | **1** ✓ |
| `getMinutes() < 30` | =1 | **1** ✓ |
| `getMonthlySchedule` | =1 | **2** ✓ (import + call) |
| `body.style.overflow` | ≥2 | **3** ✓ |
| `id="side-menu-panel"` | =1 | **1** ✓ |
| `bg-black/65` | =1 | **1** ✓ |
| `var(--sat` | ≥1 | **2** ✓ |
| `max-w-[300` | =1 | **1** ✓ |
| `1d4ed8,#0ea5e9` (아바타 그라데이션) | =1 | **1** ✓ |
| `99+` | =1 | **1** ✓ |
| `/remediation` | ≥1 | **2** ✓ |
| `preventDefault` | ≥1 | **1** ✓ |
| `touchmove` | ≥2 | **2** ✓ |
| `메뉴 닫기` (aria-label) | =1 | **1** ✓ |
| `bg-fire-bar` | =1 | **1** ✓ |
| `lucide-react` | =1 | **1** ✓ |

### Negative gate (status- 금지 / ✕ 0 / legacy alias 0 / mouse handler 0)

| 항목 | 기대 | 실측 |
|---|---|---|
| `bg-status-` | =0 | **0** ✓ (status- prefix 없음 강제) |
| `✕` (문자) | =0 | **0** ✓ (Lucide X 로 교체, 코멘트도 영문화) |
| legacy `var(--bg/--bd/--t/--danger)` | =0 | **0** ✓ |
| `onMouseEnter` / `onMouseLeave` | =0 | **0** ✓ (hover:bg-surface-active 로 치환) |

## 보호 파일 9종 diff 0 byte 확인

`git diff --stat HEAD~1..HEAD -- …` → 빈 출력 (변경 0):
- `cha-bio-safety/src/components/GlobalHeader.tsx`
- `cha-bio-safety/src/components/SettingsPanel.tsx`
- `cha-bio-safety/src/components/MenuSettingsSection.tsx` (W10 — `import { MENU } from './SideMenu'` 정상 resolve 확인 = tsc 0 errors)
- `cha-bio-safety/src/App.tsx`
- `cha-bio-safety/src/utils/api.ts`
- `cha-bio-safety/src/utils/shiftCalc.ts`
- `cha-bio-safety/src/stores/authStore.ts`
- `cha-bio-safety/src/hooks/useStaffList.ts`
- `cha-bio-safety/tailwind.config.js`

## Commit + 라인 수

| 항목 | 값 |
|---|---|
| commit hash | **180a5dc** |
| 파일 변경 | 1 file changed, +47 / -30 |
| source 라인 수 | 201 |
| 변환 후 라인 수 | **218** (+17, Tailwind class 가독성 / 줄 분리) |
| tsc --noEmit | **0 errors** |

## 다음 sub-wave 진입 가능 시그널

redesign/31-chrome chrome 4 컴포넌트 TSX 변환 진행 상황:
- W7 ✅ GlobalHeader (45 라인)
- W10 ✅ MenuSettingsSection (379 라인)
- **W8 ✅ SideMenu (201→218 라인) — 본 작업 완결 (180a5dc)**
- W9 ⏭ SettingsPanel (894 라인) — 다음 sub-wave 진입 가능

## Deviations from Plan

### Adjusted (no rule violation)

**1. [Notation] MENU 항목 실측 22 (plan 의 17 표기 보정)**
- **Found during:** Step B 검증
- **Issue:** plan 의 `=17` 그렙 기대는 추정치 (실제 5+6+8+2+1 = 22)
- **Fix:** source verbatim 22 항목 모두 보존 (1 byte 변경 0) — 의미 동등, gate 실측 22 보고
- **Impact:** 없음 — 비즈 시그니처 완전 보존

**2. [Comment hygiene] import 코멘트 ✕ 문자 제거**
- **Found during:** negative gate `grep -c '✕'` 첫 회 1 (line 8 코멘트)
- **Issue:** Plan 의 import 예시는 `// W3-OQ #A LOCKED — ✕ → Lucide X` 였으나 negative gate 강제는 `✕ count = 0`
- **Fix:** 코멘트를 `// W3-OQ #A LOCKED — close icon migrated to Lucide X` 로 영문화 → gate 0 통과
- **Impact:** 코멘트만 변경, JSX / 비즈 0

## Self-Check: PASSED

- File: `/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/components/SideMenu.tsx` — FOUND (218 lines)
- Commit: `180a5dc` — FOUND on `redesign/31-chrome`
- tsc --noEmit — 0 errors
- Grep gate 25 PASS / Negative gate 4 PASS
- Protected files 9종 — 0 byte diff
