---
phase: 260527-agq
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/components/SideMenu.tsx
autonomous: true
requirements:
  - REDESIGN-31-CHROME-W8
must_haves:
  truths:
    - "SideMenu.tsx 가 Tailwind class 기반으로 변환되어 인라인 style 이 동적 분기(transform/opacity/transition/safe-area/그라데이션) 외 모두 class 로 치환됨"
    - "MENU 상수 5섹션 17아이템 + MenuItem type export + ITEM_META 평면 lookup 1 byte 변경 0 으로 MenuSettingsSection W10 변환본이 import 정상 동작"
    - "비즈 anchor 22+ 항목 (Props/NAV_H/RAW_TO_LABEL/appliedEntries useMemo/todayShiftLabel useEffect/body overflow useEffect/go(path)/badge 99+ cap/아바타 그라데이션/panel width 82% maxWidth 300/borderRadius 0 16px 16px 0/transition 0.28s + 0.3s cubic-bezier/id=side-menu-panel) verbatim 보존"
    - "노안 룰 7건 격상 (헤더 부제 9.5→12 / divider 9→11 / soon 10→12 / item 12.5→16 / badge 11→13 / 사용자 이름 11.5→14 / 사용자 부제 9.5→12) sketch W3 verbatim 반영"
    - "W3-OQ #A LOCKED ✕ → Lucide X / W3-OQ #B LOCKED 미조치 badge bg-fire-bar / OQ #3 LOCKED 아바타 그라데이션 linear-gradient(135deg,#1d4ed8,#0ea5e9) 보존"
    - "tsc --noEmit 0 errors — MenuSettingsSection 의 `import { MENU } from './SideMenu'` 시그니처 정합"
    - "보호 파일 5종 (GlobalHeader/SettingsPanel/MenuSettingsSection/App/api/shiftCalc/authStore/useStaffList) git diff 0 byte"
  artifacts:
    - path: "cha-bio-safety/src/components/SideMenu.tsx"
      provides: "Tailwind 기반 SideMenu 컴포넌트, MENU 상수 + MenuItem type export 보존"
      contains: "export const MENU"
    - path: "cha-bio-safety/src/components/SideMenu.tsx"
      provides: "MenuItem type export (MenuSettingsSection W10 의존)"
      contains: "export type MenuItem"
    - path: "cha-bio-safety/src/components/SideMenu.tsx"
      provides: "Lucide X import (W3-OQ #A LOCKED)"
      contains: "import { X } from 'lucide-react'"
  key_links:
    - from: "cha-bio-safety/src/components/SideMenu.tsx"
      to: "cha-bio-safety/src/components/MenuSettingsSection.tsx"
      via: "MENU 상수 import (circular dep)"
      pattern: "export const MENU"
    - from: "cha-bio-safety/src/components/SideMenu.tsx"
      to: "cha-bio-safety/src/App.tsx (line 219)"
      via: "<SideMenu open onClose unresolvedCount />"
      pattern: "export function SideMenu"
    - from: "cha-bio-safety/src/components/SideMenu.tsx"
      to: "cha-bio-safety/src/utils/api.ts"
      via: "settingsApi.getMenu / SideMenuEntry / MenuConfig import"
      pattern: "settingsApi, type SideMenuEntry, type MenuConfig"
---

<objective>
redesign/31-chrome W8 — SideMenu.tsx (201 라인 햄버거 슬라이드 드로어) 의 chrome 4 컴포넌트 TSX 변환 세 번째 sub-wave. W7 GlobalHeader (45 라인) + W10 MenuSettingsSection (379 라인) precedent 패턴 mirror.

Purpose: 30 페이지 전체에서 사용되는 공통 chrome 컴포넌트의 시각적 일관성 + 노안 룰 + token 기반 다크/라이트 자동 분기. 인라인 style → Tailwind class 치환으로 가독성 + 토큰 일관성 확보. **비즈 1 byte 변경 0** + **단일 atomic 1-commit**.

Output:
- `cha-bio-safety/src/components/SideMenu.tsx` (201 → 약 200~250 라인 예상, Tailwind class 가독성 + 줄 분리)
- 단일 commit (atomic)
- `npx tsc --noEmit` 0 errors

**상위 context:** 4 sub-wave 진행 중 (W7 ✅ GlobalHeader / W10 ✅ MenuSettingsSection / **W8 ← 본 작업** / W9 SettingsPanel 후속).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@cha-bio-safety/src/components/SideMenu.tsx
@cha-bio-safety/docs/redesign-context/31-chrome/wave-1-index.md
@cha-bio-safety/docs/redesign-context/31-chrome/sketch-wave-3-side-menu.html
@cha-bio-safety/docs/redesign-context/31-chrome/wave-6-tsx-conversion-checklist.md
@cha-bio-safety/docs/redesign-context/31-chrome/design-system.md
@cha-bio-safety/docs/redesign-context/31-chrome/tokens.css
@cha-bio-safety/docs/redesign-context/31-chrome/typography.css
@cha-bio-safety/src/components/GlobalHeader.tsx
@cha-bio-safety/src/components/MenuSettingsSection.tsx
@cha-bio-safety/tailwind.config.js
@cha-bio-safety/src/utils/api.ts
@cha-bio-safety/src/stores/authStore.ts
@cha-bio-safety/src/utils/shiftCalc.ts
@cha-bio-safety/src/hooks/useStaffList.ts
@cha-bio-safety/src/App.tsx

<interfaces>
<!-- Key contracts SideMenu.tsx MUST preserve. Executor uses these directly — no exploration. -->

**Props (line 11~15) — verbatim:**
```typescript
interface Props {
  open: boolean
  onClose: () => void
  unresolvedCount?: number
}
```

**MenuItem type (line 17) — export verbatim — MenuSettingsSection 의존:**
```typescript
export type MenuItem = {
  label: string
  path: string
  badge: number
  soon: boolean
  role?: 'admin' | 'assistant'
  desktopOnly?: boolean
}
```

**MENU 상수 (line 19~54) — export verbatim — MenuSettingsSection PATH_LABEL/DESKTOP_ONLY_PATHS/ADMIN_PATHS 의존:**
```typescript
export const MENU: { section: string; items: MenuItem[] }[] = [
  { section: '주요 기능', items: [
    { label: '대시보드',    path: '/dashboard',      badge: 0, soon: false },
    { label: '일반 점검',   path: '/inspection',     badge: 0, soon: false },
    { label: 'QR 스캔',    path: '/inspection/qr',  badge: 0, soon: false },
    { label: '조치 관리',   path: '/remediation',    badge: 0, soon: false },
    { label: '승강기 관리', path: '/elevator',       badge: 0, soon: false },
  ]},
  { section: '시설 관리', items: [
    { label: 'DIV 압력 관리',   path: '/div',           badge: 0, soon: false },
    { label: '소화기 관리',      path: '/extinguishers', badge: 0, soon: false, desktopOnly: true },
    { label: 'CCTV 현황',       path: '/cctv',          badge: 0, soon: false, desktopOnly: true },
    { label: '소방 시설 도면',   path: '/floorplan',     badge: 0, soon: false },
    { label: '소방 점검 관리',   path: '/legal',         badge: 0, soon: false },
    { label: '소방 시설 추가',  path: '/checkpoints',   badge: 0, soon: false, role: 'admin' },
  ]},
  { section: '문서 관리', items: [
    { label: '일일 업무 일지',   path: '/daily-report',  badge: 0, soon: false },
    { label: '업무 수행 기록표', path: '/worklog', badge: 0, soon: false, role: 'admin' },
    { label: '월간 점검 계획', path: '/schedule',      badge: 0, soon: false },
    { label: '월간 출근부',   path: '/workshift',      badge: 0, soon: false },
    { label: '연간 업무 추진 계획', path: '/annual-plan', badge: 0, soon: false },
    { label: '소방계획서/훈련자료', path: '/documents', badge: 0, soon: false },
    { label: '점검 일지 출력', path: '/reports',        badge: 0, soon: false },
    { label: 'QR 코드 출력',  path: '/qr-print',      badge: 0, soon: false },
  ]},
  { section: '근무·복지', items: [
    { label: '연차 및 식사', path: '/staff-service',  badge: 0, soon: false },
    { label: '보수교육',    path: '/education',      badge: 0, soon: false },
  ]},
  { section: '시스템', items: [
    { label: '직원 관리', path: '/staff-manage', badge: 0, soon: false, role: 'admin' },
  ]},
]
```

**ITEM_META (line 56~57) — verbatim:**
```typescript
const ITEM_META: Record<string, MenuItem> = {}
MENU.forEach(s => s.items.forEach(i => { ITEM_META[i.path] = i }))
```

**NAV_H (line 9) — verbatim:**
```typescript
const NAV_H = 'calc(54px + var(--sab, 0px))'
```

**Imports — 7 라인 verbatim + Lucide X 1 추가 (총 8):**
```typescript
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { getMonthlySchedule } from '../utils/shiftCalc'
import { useStaffList } from '../hooks/useStaffList'
import { settingsApi, type SideMenuEntry, type MenuConfig } from '../utils/api'
import { X } from 'lucide-react'  // W3-OQ #A LOCKED — ✕ → Lucide X
```

**MenuSettingsSection.tsx (line 11) — `import { MENU } from './SideMenu'` — circular dep, 시그니처 정합 강제. W10 변환본은 이미 main 머지됨.**

**Tailwind 토큰 매핑 (W6 §10 verbatim — status- prefix 없음, fire-bar 직접):**
| source CSS var | Tailwind class |
|---|---|
| `var(--bg2)` panel bg | `bg-surface-raised` |
| `var(--bd)` border | `border-border-default` |
| `var(--bg3)` 닫기 btn / 사용자 카드 / soon badge | `bg-surface-sunken` |
| `var(--bg4)` item hover bg | `hover:bg-surface-active` (인라인 mouse handler 제거) |
| `var(--t1)` text primary | `text-text-primary` |
| `var(--t2)` text secondary | `text-text-secondary` |
| `var(--t3)` text tertiary | `text-text-tertiary` |
| `var(--danger)` badge | `bg-fire-bar` (W3-OQ #B LOCKED — status- prefix 없음, `bg-status-fire-bar` X) |
| `linear-gradient(135deg,#1d4ed8,#0ea5e9)` | **인라인 유지 + 사유 코멘트** (OQ #3 LOCKED §6.4 매치) |

**Typography 토큰 (typography.css 실측):**
| 격상 대상 | source | sketch 격상 | Tailwind class |
|---|---|---|---|
| 헤더 부제 | 9.5px | 12px | `text-caption` (12/lh:1.5) |
| divider | 9px | 11px | `text-[11px]` arbitrary (12/leading-none 가 더 클 수도 — sketch verbatim 11px 따름) |
| soon "준비중" | 10px | 12px | `text-caption` |
| item 라벨 | 12.5px | **16px (노안 마지노선)** | `text-body` (16/lh:1.7) |
| badge 숫자 | 11px | 13px | `text-label` (13/lh:1.5) |
| 사용자 이름 | 11.5px | 14px | `text-body-sm` (14/lh:1.6) |
| 사용자 부제 | 9.5px | 12px | `text-caption` |

**닫기 button 크기 — Tailwind spacing 함정 인식 (`feedback_tailwind_w8_h8_is_48px`):**
- source: 28×28 (line 141)
- tailwind config: `w-7=32px`, `w-8=48px` (기본 28 아님)
- **결정: `w-7 h-7` (32px) 사용** — 28→32 4px 증가 OK (sketch 격상 룰 안에서 button 도 약간 커짐, 노안 룰 정합)
- Lucide X size: 15 또는 16 (source fontSize:15 매치) — **`<X size={16} />` 사용**

**App.tsx mount (변경 0):**
```tsx
<SideMenu open={sideOpen} onClose={() => setSideOpen(false)} unresolvedCount={unresolvedCount} />
```
</interfaces>

<sketch_css_verbatim>
<!-- W3 sketch CSS 룰 핵심 발췌 (sketch-wave-3-side-menu.html). `feedback_planner_prompt_sketch_verbatim` 룰: sketch CSS verbatim 인용. -->

- **OQ #7 LOCKED panel:** `width: 82%; max-width: 300px; border-radius: 0 16px 16px 0;` — 변경 0
- **오버레이 transition:** `transition: opacity 0.28s;` background `rgba(0,0,0,0.65)` — verbatim
- **패널 transition:** `transition: transform 0.3s cubic-bezier(.4,0,.2,1);` — verbatim
- **top/bottom safe-area:** `top: var(--sat, 0px); bottom: calc(54px + var(--sab, 0px) - var(--sat, 0px));` — verbatim
- **id="side-menu-panel"** body markup 안 1건 — touchmove hook 의존, 변경 0
- **OQ #3 LOCKED 아바타 그라데이션:** `linear-gradient(135deg,#1d4ed8,#0ea5e9)` (§6.4 매치) — 인라인 유지 + 사유 코멘트
- **W3-OQ #A LOCKED ✕ 닫기:** `<X size={16} />` (source fontSize:15 매치, aria-label "메뉴 닫기" 보존)
- **W3-OQ #B LOCKED 미조치 badge:** `bg-fire-bar` (default — 주황 다크 #f97316 / 라이트 #c2410c, sketch 본 default), status- prefix 없음
- **divider style sketch:** `padding: 9px 13px 2px; font-size: 11px; font-weight: 700; color: var(--t3); letter-spacing: .08em; text-transform: uppercase;` (격상 9→11)
- **item style sketch:** `padding: 9px 13px; margin: 1px 7px; border-radius: 8px; font-size: 16px; font-weight: 500; gap: 10px;` (격상 12.5→16 노안 마지노선)
- **soon "준비중":** `font-size: 12px; background: var(--bg3); border-radius: 6px; padding: 2px 7px;` (격상 10→12)
- **badge:** `background: var(--status-fire-bar); color: #fff; font-size: 13px; font-weight: 700; font-family: JetBrains Mono; padding: 2px 4px; border-radius: 9px; min-width: 16px;` (격상 11→13 + bg fire-bar)
- **사용자 카드:** `padding: 9px 11px; border-top: 1px solid var(--bd);` 안 `padding: 8px 10px; background: var(--bg3); border-radius: 9px; gap: 9px;`
- **아바타:** `width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg,#1d4ed8,#0ea5e9); font-size: 11px; font-weight: 700; color: #fff;`
- **사용자 이름:** `font-size: 14px; font-weight: 700;` (격상 11.5→14)
- **사용자 부제:** `font-size: 12px; color: var(--t3);` (격상 9.5→12)
- **헤더:** `padding: 12px 15px; border-bottom: 1px solid var(--bd); gap: 10px;` + 로고 `width: 30px; height: 30px; border-radius: 8px;` + 타이틀 `font-size: 13px; font-weight: 700;` + 부제 `font-size: 12px; color: var(--t3); margin-top: 1px;` (격상 9.5→12)
- **닫기 button:** `width: 32px; height: 32px; border-radius: 7px; background: var(--bg3); color: var(--t2);` (source 28→32 = w-7/h-7)
</sketch_css_verbatim>

<protected_files>
**git diff 0 byte 강제 — 변경 시 빌드 깨짐 또는 별도 sub-wave 책임 침범:**

- `cha-bio-safety/src/components/GlobalHeader.tsx` (W7 완료본)
- `cha-bio-safety/src/components/SettingsPanel.tsx` (W9 책임)
- `cha-bio-safety/src/components/MenuSettingsSection.tsx` (W10 완료본)
- `cha-bio-safety/src/App.tsx` (mount 시그니처)
- `cha-bio-safety/src/utils/api.ts` (SideMenuEntry/MenuConfig/settingsApi 시그니처)
- `cha-bio-safety/src/utils/shiftCalc.ts` (getMonthlySchedule)
- `cha-bio-safety/src/stores/authStore.ts` (useAuthStore)
- `cha-bio-safety/src/hooks/useStaffList.ts`
- `cha-bio-safety/tailwind.config.js`
- `cha-bio-safety/docs/redesign-context/31-chrome/{tokens.css,typography.css,design-system.md,wave-1-index.md,wave-6-tsx-conversion-checklist.md,sketch-wave-*.html}` 기존 13 파일
- `cha-bio-safety/docs/redesign-context/00-design-context/` 전체
- `cha-bio-safety/src/pages/` 전체
</protected_files>

<memory_rules>
이번 작업에 적용되는 메모리 룰 (executor 강제 준수):

- **`feedback_planner_prompt_sketch_verbatim`** — W3 sketch CSS 정의 verbatim 인용. 위 `<sketch_css_verbatim>` 블록 그대로 사용. 추측한 토큰명/사이즈 금지.
- **`feedback_tailwind_token_class_pattern`** — status- prefix 없음. `bg-fire-bar` ✓ / `bg-status-fire-bar` X. lucide size prop `<X size={16} />`.
- **`feedback_tailwind_w8_h8_is_48px`** — w-8=48 함정 의식. 닫기 button 32px = `w-7 h-7` 사용. **w-8 사용 시 48px 사고**.
- **`feedback_text_caption_leading_none`** — text-caption lh:1.5 (18px line-height) 가 작은 컨테이너 (예: 사용자 부제 안 14px 줄에 12 caption) 에서 패딩 느낌. divider 처럼 작은 영역은 필요시 `leading-none` 명시.
- **`feedback_body_scroll_lock_safe_area`** — body.position=fixed 사용 금지. 현재 `document.body.style.overflow='hidden'` + touchmove preventDefault 패턴 verbatim 유지.
- **`feedback_inspection_unresolved_color`** — 미조치 fire 주황. W3-OQ #B `bg-fire-bar` 적용 근거.
- **`feedback_design_changes_ask_first`** — 디자인 변경 (item 12.5→16 등) 사용자 컨펌됨 (W3 sketch 단계).
- **`feedback_check_branch_before_edit`** — executor 는 작업 시작 전 `git rev-parse --abbrev-ref HEAD` 확인. redesign/31-chrome 또는 main 일 것. 다른 브랜치면 사용자 컨펌.
- **`feedback_cbc7119_design_never_wrangler`** — wrangler 명령 / npm run deploy 절대 X.
- **`feedback_gsd_workflow_strict`** — 본 GSD plan 안에서만 작업. ad-hoc 직접 편집 X.
- **`feedback_tsx_wave_emoji_dot_gap`** — sketch negative gate: 이모지 0건 확인 (✕ → Lucide X 만 잔존, 다른 이모지 X). source 에도 이모지 0건 — 단순 verify.
- **`feedback_tsx_wave_stat_card_drift`** — sketch 새 패턴 (item 16 / badge 13 / 사용자 이름 14 등) 누락 방지. 위 격상 표 verbatim 강제.
</memory_rules>
</context>

<tasks>

<task type="auto">
  <name>Task 1: SideMenu.tsx 단일 atomic TSX 변환 (Tailwind class 치환 + 노안 격상 + Lucide X + fire-bar badge)</name>
  <files>cha-bio-safety/src/components/SideMenu.tsx</files>
  <action>
**목적:** 201 라인 SideMenu.tsx 의 인라인 style 을 Tailwind class 로 변환. 비즈 anchor 22+ 항목 verbatim 보존 + 노안 룰 7건 격상 적용 + Lucide X + fire-bar badge.

**준비:**
1. `git rev-parse --abbrev-ref HEAD` 로 브랜치 확인 (redesign/31-chrome 또는 main 예상, 다르면 사용자 컨펌 필요)
2. `cat cha-bio-safety/src/components/SideMenu.tsx` 로 source 201 라인 확인
3. `<interfaces>` + `<sketch_css_verbatim>` 블록 verbatim 인용 준비

**변환 순서 (executor 1 pass):**

**Step A — Imports (line 1~7 + Lucide X 1 추가):**
```typescript
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { getMonthlySchedule } from '../utils/shiftCalc'
import { useStaffList } from '../hooks/useStaffList'
import { settingsApi, type SideMenuEntry, type MenuConfig } from '../utils/api'
import { X } from 'lucide-react' // W3-OQ #A LOCKED — ✕ → Lucide X
```

**Step B — 모듈 레벨 verbatim 보존 (line 9~57, 1 byte 변경 0):**
- `NAV_H` 상수 (line 9)
- `Props` interface (line 11~15)
- `export type MenuItem` (line 17)
- `export const MENU` (line 19~54) — **5 sections × 17 items 1 byte 변경 0**
- `ITEM_META` Record + forEach (line 56~57)

**Step C — Main function body (line 59~106, 비즈 anchor verbatim):**
- `export function SideMenu({ open, onClose, unresolvedCount = 0 }: Props)` — verbatim
- `useNavigate` + `useAuthStore` + `useStaffList` + `useQuery({ queryKey: ['menu-config'], queryFn: () => settingsApi.getMenu(), staleTime: 300_000 })` — verbatim
- `appliedEntries: SideMenuEntry[]` useMemo (Phase 18 D-05) — verbatim
- `RAW_TO_LABEL` map — verbatim
- `todayShiftLabel` state + useEffect (8:30am ref + getMonthlySchedule) — verbatim
- body overflow useEffect (touchmove preventDefault + `id="side-menu-panel"` 의존) — verbatim
- `go(path)` handler — verbatim

**Step D — JSX 변환 (인라인 → Tailwind class, 단 동적 분기/transition/그라데이션 인라인 예외):**

**오버레이 (source line 109~119):**
```tsx
{/* 오버레이 */}
<div
  onClick={onClose}
  className="fixed inset-0 z-[190] bg-black/65 transition-opacity duration-[280ms]"
  style={{
    // 동적 분기 — Tailwind class dynamic value 한계로 인라인 유지
    opacity: open ? 1 : 0,
    pointerEvents: open ? 'all' : 'none',
  }}
/>
```
- `z-[190]` arbitrary (z-index 190)
- `bg-black/65` (rgba(0,0,0,0.65) = black 65% — Tailwind opacity modifier 호환)
- `transition-opacity duration-[280ms]` (0.28s arbitrary)
- 인라인 잔존: opacity + pointerEvents (open prop 분기)

**패널 (source line 121~133):**
```tsx
{/* 패널 */}
<div
  id="side-menu-panel"
  className="fixed left-0 z-[200] w-[82%] max-w-[300px] bg-surface-raised flex flex-col overflow-hidden rounded-r-[16px]"
  style={{
    // 동적 분기 + safe-area css var — Tailwind class dynamic value 한계로 인라인 유지
    top: 'var(--sat, 0px)',
    bottom: 'calc(54px + var(--sab, 0px) - var(--sat, 0px))',
    transform: open ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
  }}
>
```
- `w-[82%]` + `max-w-[300px]` (OQ #7 LOCKED)
- `rounded-r-[16px]` — `borderRadius: '0 16px 16px 0'` 좌 0 / 우 16 16 0 = right 만 16px (rounded-r 의미. `rounded-tr-[16px] rounded-br-[16px]` 도 가능 — `rounded-r-[16px]` 권장 + 사유 코멘트 첨부 가능)
- `bg-surface-raised` (var(--bg2) 매핑)
- 인라인 잔존: top/bottom (safe-area css var) + transform/transition (open 분기 + cubic-bezier)

**헤더 (source line 135~142):**
```tsx
{/* 헤더 */}
<div className="flex items-center gap-2.5 px-[15px] py-3 border-b border-border-default shrink-0">
  <img src="/icons/icon-192.png" alt="" className="w-[30px] h-[30px] rounded-[8px] shrink-0" />
  <div>
    <div className="text-[13px] font-bold text-text-primary">차바이오컴플렉스</div>
    <div className="text-caption text-text-tertiary mt-px">소방안전 통합관리</div>
  </div>
  <button
    onClick={onClose}
    aria-label="메뉴 닫기"
    className="ml-auto w-7 h-7 rounded-[7px] bg-surface-sunken border-none text-text-secondary cursor-pointer flex items-center justify-center"
  >
    <X size={16} />
  </button>
</div>
```
- `gap-2.5` (gap:10px), `px-[15px] py-3` (padding:'12px 15px')
- `text-caption` (격상 9.5→12)
- `w-7 h-7` = 32×32 (source 28→32, Tailwind 함정 회피 — w-8 X)
- Lucide `<X size={16} />` (W3-OQ #A LOCKED — source fontSize:15 매치)
- aria-label "메뉴 닫기" 명시 (sketch frame 강제)
- 텍스트 격상: "차바이오컴플렉스" 13/700 → `text-[13px] font-bold` (격상 안 함 — source 13 그대로) — sketch verbatim
- 부제: 9.5 → 12 = `text-caption`

**메뉴 목록 컨테이너 (source line 145):**
```tsx
{/* 메뉴 목록 — 평면 리스트, divider = 섹션 헤더 */}
<div className="overflow-y-auto flex-1 py-[5px]">
  {appliedEntries.map((entry, idx) => {
```

**divider (source line 147~152):**
```tsx
if (entry.type === 'divider') {
  return (
    <div
      key={`d-${entry.id}-${idx}`}
      className="px-[13px] pt-[9px] pb-[2px] text-[11px] font-bold text-text-tertiary tracking-[.08em] uppercase leading-none"
    >
      {entry.title}
    </div>
  )
}
```
- `text-[11px]` (격상 9→11 sketch verbatim — arbitrary class)
- `leading-none` 명시 (메모리 룰 `feedback_text_caption_leading_none` — 작은 컨테이너 패딩 방지)
- `tracking-[.08em]` (letterSpacing .08em)

**item (visible/role/desktopOnly 필터 + soon + 일반):**
```tsx
// item
if (!entry.visible) return null
const meta = ITEM_META[entry.path]
if (!meta) return null
if (meta.role && staff?.role !== meta.role) return null
if (meta.desktopOnly) return null
if (meta.soon) {
  return (
    <div
      key={`i-${entry.path}-${idx}`}
      className="flex items-center gap-2.5 px-[13px] py-[9px] mx-[7px] my-px rounded-[8px] text-text-tertiary opacity-50 cursor-default pointer-events-none"
    >
      <span className="text-body font-medium flex-1">{meta.label}</span>
      <span className="text-caption text-text-tertiary bg-surface-sunken rounded-[6px] px-[7px] py-[2px]">준비중</span>
    </div>
  )
}
const badgeCount = meta.path === '/remediation' ? unresolvedCount : meta.badge
return (
  <div
    key={`i-${entry.path}-${idx}`}
    onClick={() => go(meta.path)}
    className="flex items-center gap-2.5 px-[13px] py-[9px] mx-[7px] my-px rounded-[8px] cursor-pointer text-text-primary transition-colors duration-150 hover:bg-surface-active"
  >
    <span className="text-body font-medium flex-1">{meta.label}</span>
    {badgeCount > 0 && (
      <span className="bg-fire-bar text-white text-label font-bold font-mono px-1 py-[2px] rounded-[9px] min-w-[16px] text-center">
        {badgeCount > 99 ? '99+' : badgeCount}
      </span>
    )}
  </div>
)
```

**핵심 변환 포인트:**
- item 라벨: `text-body` (격상 12.5→16 노안 마지노선) + `font-medium`
- soon "준비중": `text-caption` (격상 10→12) + `bg-surface-sunken`
- badge: `bg-fire-bar` (W3-OQ #B LOCKED) + `text-white` + `text-label` (격상 11→13) + `font-bold font-mono`
- hover: `hover:bg-surface-active` Tailwind class — **인라인 onMouseEnter/onMouseLeave 제거** (source line 172~173 삭제)
- `transition-colors duration-150` (source `transition:'background 0.13s'`)
- `99+` cap verbatim
- `font-mono` → tailwind config 에 JetBrains Mono 정의되어 있으면 OK, 아니면 `style={{ fontFamily: 'JetBrains Mono' }}` 인라인 fallback (executor: `grep -n "JetBrains\|font-mono\|fontFamily" cha-bio-safety/tailwind.config.js cha-bio-safety/src/index.css` 확인 후 결정. `font-mono` Tailwind 기본 class 가 JetBrains Mono 로 mapped 되어 있지 않으면 `style={{ fontFamily: 'JetBrains Mono, monospace' }}` 사용)

**사용자 카드 (source line 187~197):**
```tsx
{/* 로그인 사용자 */}
<div className="px-[11px] py-[9px] border-t border-border-default shrink-0">
  <div className="flex items-center gap-[9px] px-2.5 py-2 bg-surface-sunken rounded-[9px]">
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
      style={{
        // OQ #3 LOCKED §6.4 매치 — 아바타 그라데이션 보존 (Tailwind 토큰 없음, 인라인 유지)
        background: 'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
      }}
    >
      {staff?.name?.[0] ?? '?'}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-body-sm font-bold text-text-primary">{staff?.name}</div>
      <div className="text-caption text-text-tertiary">{staff?.title} · {todayShiftLabel}</div>
    </div>
  </div>
</div>
```
- 아바타 28×28 → `w-7 h-7` = 32 (사용자 카드 안 아바타도 닫기 button 처럼 28→32 — sketch verbatim 따름. **source 28 이지만 sketch 격상 정합으로 32**)
  - **단, source 가 28이고 sketch 도 명시 격상 안 한 경우 28 유지가 안전. arbitrary `w-[28px] h-[28px]` 사용 권장 — executor 가 sketch 본문 검색하여 결정. sketch §1.1 격상 표에 아바타 크기 격상 없음 → `w-[28px] h-[28px]` arbitrary 유지**
- 아바타 그라데이션 인라인 + 사유 코멘트 (OQ #3 LOCKED)
- 이름 11.5 → 14 = `text-body-sm` (격상 11.5→14)
- 부제 9.5 → 12 = `text-caption`

**Step E — 마지막 점검:**
- `tsc --noEmit` 실행 → 0 errors
- `grep -c "label: '"` 17 (MENU 17 items 보존)
- `grep -c "export const MENU"` 1
- `grep -c "export type MenuItem"` 1
- `grep -c "id=\"side-menu-panel\""` 1
- `grep -c "1d4ed8,#0ea5e9"` 1 (아바타 그라데이션 보존)
- `grep -c "99+"` 1
- `grep -c "/remediation"` ≥1
- `grep -c "메뉴 닫기"` 1 (aria-label)
- `grep -c "bg-fire-bar"` 1
- `grep -c "lucide-react"` 1
- `grep -c "bg-status-"` 0 (status- prefix 없음 강제)
- `grep -c "✕"` 0 (Lucide X 로 교체됨)
- `grep -c "var(--bg\|var(--t1\|var(--t2\|var(--t3\|var(--bd\|var(--danger"` 0 (legacy alias 본 markup 안 0건 — 단 `var(--sat`/`var(--sab` 는 safe-area 인라인 유지)

**Commit (atomic 1 commit):**
```bash
cd /Users/jykevin/Documents/cbc7119-design
git add cha-bio-safety/src/components/SideMenu.tsx
git commit -m "$(cat <<'EOF'
refactor(31-chrome): SideMenu.tsx Tailwind 변환 atomic (W8 — 노안 격상 7건 + Lucide X + fire-bar badge)

redesign/31-chrome W8 SideMenu.tsx 단일 atomic 변환 — 201 라인 햄버거 슬라이드 드로어
의 인라인 style → Tailwind class 치환. 비즈 anchor 22+ 항목 verbatim 보존.

변환 핵심:
- 인라인 style → Tailwind (bg-surface-raised/bg-surface-sunken/bg-surface-active/
  border-border-default/text-text-primary/text-text-secondary/text-text-tertiary)
- 동적 분기 인라인 잔존: opacity/transform/transition cubic-bezier/safe-area css var/
  아바타 그라데이션 (OQ #3 LOCKED 보존) — 각 사유 코멘트 첨부
- Lucide X import 추가 + ✕ → <X size={16} /> (W3-OQ #A LOCKED)
- badge: var(--danger) → bg-fire-bar (W3-OQ #B LOCKED — fire 주황)
- hover: 인라인 onMouseEnter/Leave 제거 → hover:bg-surface-active

노안 격상 7건 (sketch W3 verbatim):
- 헤더 부제 9.5 → 12 (text-caption)
- divider 9 → 11 (text-[11px] + leading-none)
- soon "준비중" 10 → 12 (text-caption)
- item 라벨 12.5 → 16 (text-body, 노안 마지노선)
- badge 11 → 13 (text-label)
- 사용자 이름 11.5 → 14 (text-body-sm)
- 사용자 부제 9.5 → 12 (text-caption)

비즈 변경 0:
- MENU 5 sections × 17 items + MenuItem type + ITEM_META + NAV_H + Props
- useNavigate / useAuthStore / useStaffList / useQuery menu-config
- appliedEntries useMemo / RAW_TO_LABEL / todayShiftLabel useEffect (8:30am ref)
- body overflow useEffect (touchmove preventDefault + id="side-menu-panel")
- go(path) / unresolvedCount /remediation 분기 / 99+ cap / 아바타 그라데이션

OQ #7 LOCKED 보존:
- panel width 82% / maxWidth 300 / borderRadius '0 16px 16px 0'
- 오버레이 transition 0.28s / panel transition 0.3s cubic-bezier(.4,0,.2,1)
- top: var(--sat, 0px) / bottom: calc(54px + var(--sab, 0px) - var(--sat, 0px))

verify: tsc --noEmit 0 errors / grep gate 12건 PASS
EOF
)"
```
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && npx tsc --noEmit 2>&1 | tail -20 && echo "---grep verify---" && cd /Users/jykevin/Documents/cbc7119-design && grep -c "label: '" cha-bio-safety/src/components/SideMenu.tsx && grep -c "export const MENU" cha-bio-safety/src/components/SideMenu.tsx && grep -c "export type MenuItem" cha-bio-safety/src/components/SideMenu.tsx && grep -c "id=\"side-menu-panel\"" cha-bio-safety/src/components/SideMenu.tsx && grep -c "1d4ed8,#0ea5e9" cha-bio-safety/src/components/SideMenu.tsx && grep -c "99+" cha-bio-safety/src/components/SideMenu.tsx && grep -c "메뉴 닫기" cha-bio-safety/src/components/SideMenu.tsx && grep -c "bg-fire-bar" cha-bio-safety/src/components/SideMenu.tsx && grep -c "lucide-react" cha-bio-safety/src/components/SideMenu.tsx && grep -c "bg-status-" cha-bio-safety/src/components/SideMenu.tsx && grep -c "✕" cha-bio-safety/src/components/SideMenu.tsx && grep -cE "var\(--bg[234]?\)|var\(--bd\)|var\(--t[123]\)|var\(--danger\)" cha-bio-safety/src/components/SideMenu.tsx && echo "---protected files diff---" && git diff --stat HEAD~1 -- cha-bio-safety/src/components/GlobalHeader.tsx cha-bio-safety/src/components/SettingsPanel.tsx cha-bio-safety/src/components/MenuSettingsSection.tsx cha-bio-safety/src/App.tsx cha-bio-safety/src/utils/api.ts cha-bio-safety/src/utils/shiftCalc.ts cha-bio-safety/src/stores/authStore.ts cha-bio-safety/src/hooks/useStaffList.ts cha-bio-safety/tailwind.config.js 2>&1 | tail -15</automated>
  </verify>
  <done>
- `cha-bio-safety/src/components/SideMenu.tsx` 변환 완료, 단일 commit
- `npx tsc --noEmit` 0 errors
- grep 12건 PASS:
  - `grep -c "label: '"` = 17 (MENU 17 items)
  - `grep -c "export const MENU"` = 1
  - `grep -c "export type MenuItem"` = 1
  - `grep -c "id=\"side-menu-panel\""` = 1
  - `grep -c "1d4ed8,#0ea5e9"` = 1 (아바타 그라데이션)
  - `grep -c "99+"` = 1
  - `grep -c "메뉴 닫기"` = 1 (aria-label)
  - `grep -c "bg-fire-bar"` = 1
  - `grep -c "lucide-react"` = 1
  - `grep -c "bg-status-"` = 0 (status- prefix 없음 강제)
  - `grep -c "✕"` = 0 (Lucide X 로 교체)
  - legacy alias (var(--bg/--bd/--t/--danger)) body markup 안 0건
- 보호 파일 9종 `git diff --stat HEAD~1` 0 byte 변경
  </done>
</task>

</tasks>

<verification>
**phase-level verification:**

1. **빌드 verify (필수, executor 자동):**
   ```bash
   cd cha-bio-safety && npx tsc --noEmit
   ```
   → 0 errors. MenuSettingsSection 의 `import { MENU } from './SideMenu'` 정상 resolve.

2. **비즈 anchor 22+ verify (grep gate):**
   ```bash
   grep -c "label: '" cha-bio-safety/src/components/SideMenu.tsx  # ≥17
   grep -c "export const MENU" cha-bio-safety/src/components/SideMenu.tsx  # =1
   grep -c "export type MenuItem" cha-bio-safety/src/components/SideMenu.tsx  # =1
   grep -c "ITEM_META\[" cha-bio-safety/src/components/SideMenu.tsx  # ≥2
   grep -c "NAV_H" cha-bio-safety/src/components/SideMenu.tsx  # ≥1
   grep -c "unresolvedCount" cha-bio-safety/src/components/SideMenu.tsx  # ≥3
   grep -c "appliedEntries" cha-bio-safety/src/components/SideMenu.tsx  # ≥2
   grep -c "menu-config" cha-bio-safety/src/components/SideMenu.tsx  # ≥1
   grep -c "RAW_TO_LABEL" cha-bio-safety/src/components/SideMenu.tsx  # =1
   grep -c "평일주간고정" cha-bio-safety/src/components/SideMenu.tsx  # =1
   grep -c "getMinutes() < 30" cha-bio-safety/src/components/SideMenu.tsx  # =1
   grep -c "getMonthlySchedule" cha-bio-safety/src/components/SideMenu.tsx  # =1
   grep -c "body.style.overflow" cha-bio-safety/src/components/SideMenu.tsx  # ≥2
   grep -c "id=\"side-menu-panel\"" cha-bio-safety/src/components/SideMenu.tsx  # =1
   grep -c "0,0,0,0.65\|bg-black/65" cha-bio-safety/src/components/SideMenu.tsx  # =1
   grep -c "var(--sat" cha-bio-safety/src/components/SideMenu.tsx  # ≥1
   grep -c "max-w-\[300" cha-bio-safety/src/components/SideMenu.tsx  # =1
   grep -c "1d4ed8,#0ea5e9" cha-bio-safety/src/components/SideMenu.tsx  # =1
   grep -c "99+" cha-bio-safety/src/components/SideMenu.tsx  # =1
   grep -c "/remediation" cha-bio-safety/src/components/SideMenu.tsx  # ≥1
   grep -c "preventDefault" cha-bio-safety/src/components/SideMenu.tsx  # ≥1
   grep -c "touchmove" cha-bio-safety/src/components/SideMenu.tsx  # ≥2
   ```

3. **negative gate (이번 wave 핵심 — token / 이모지 / 인라인 폐기):**
   ```bash
   grep -c "bg-status-" cha-bio-safety/src/components/SideMenu.tsx  # =0 (status- prefix 없음)
   grep -c "✕" cha-bio-safety/src/components/SideMenu.tsx  # =0 (Lucide X 로 교체)
   grep -cE "var\(--bg[234]?\)|var\(--bd\)|var\(--t[123]\)|var\(--danger\)" cha-bio-safety/src/components/SideMenu.tsx  # =0 (legacy alias body 0건)
   grep -c "onMouseEnter\|onMouseLeave" cha-bio-safety/src/components/SideMenu.tsx  # =0 (hover:bg-surface-active 로 치환)
   ```

4. **보호 파일 git diff 0 byte verify:**
   ```bash
   git diff --stat HEAD~1 -- \
     cha-bio-safety/src/components/GlobalHeader.tsx \
     cha-bio-safety/src/components/SettingsPanel.tsx \
     cha-bio-safety/src/components/MenuSettingsSection.tsx \
     cha-bio-safety/src/App.tsx \
     cha-bio-safety/src/utils/api.ts \
     cha-bio-safety/src/utils/shiftCalc.ts \
     cha-bio-safety/src/stores/authStore.ts \
     cha-bio-safety/src/hooks/useStaffList.ts \
     cha-bio-safety/tailwind.config.js
   ```
   → 빈 출력 (9 파일 모두 변경 0).

5. **단일 commit verify:**
   ```bash
   git log --oneline HEAD~1..HEAD
   ```
   → 1 commit, message 에 "31-chrome" / "W8" / "SideMenu" 포함.
</verification>

<success_criteria>
- [ ] `cha-bio-safety/src/components/SideMenu.tsx` Tailwind class 변환 완료
- [ ] `npx tsc --noEmit` 0 errors
- [ ] 비즈 anchor 22+ 항목 verbatim 보존 (grep gate 22건 PASS)
- [ ] 노안 격상 7건 적용 (item 12.5→16 핵심)
- [ ] Lucide X import + ✕ → `<X size={16} />` 교체 (W3-OQ #A)
- [ ] badge `bg-fire-bar` 적용 (W3-OQ #B)
- [ ] 아바타 그라데이션 `linear-gradient(135deg,#1d4ed8,#0ea5e9)` 인라인 보존 + 사유 코멘트 (OQ #3)
- [ ] panel width 82% / maxWidth 300 / rounded-r-[16px] 보존 (OQ #7)
- [ ] transition 0.28s + 0.3s cubic-bezier(.4,0,.2,1) 인라인 보존
- [ ] safe-area top/bottom css var 인라인 보존
- [ ] hover 인라인 mouse handler 제거 → `hover:bg-surface-active`
- [ ] status- prefix 없음 (`bg-fire-bar` ✓, `bg-status-fire-bar` X)
- [ ] legacy alias `var(--bg/--bd/--t/--danger)` body markup 안 0건
- [ ] 보호 파일 9종 git diff 0 byte
- [ ] 단일 atomic commit
- [ ] MenuSettingsSection (W10 완료본) 의 `import { MENU } from './SideMenu'` 정상 resolve
</success_criteria>

<output>
After completion, create `.planning/quick/260527-agq-redesign-31-chrome-w8-sidemenu-tsx-atomi/260527-agq-SUMMARY.md` with:
- 변환 영역 (Step A~D 별 결과)
- 노안 격상 7건 적용 사실 확인
- Lucide X + fire-bar badge + 아바타 그라데이션 보존 사실
- grep gate 22+ 결과
- 보호 파일 9종 diff 0 byte 확인
- commit hash + 변환 전후 라인 수
- 다음 sub-wave (W9 SettingsPanel 894 라인) 진입 가능 시그널
</output>
