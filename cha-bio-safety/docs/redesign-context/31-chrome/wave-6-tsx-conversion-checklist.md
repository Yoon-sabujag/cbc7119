# Wave 6 — chrome 4 컴포넌트 TSX 변환 verify checklist

> redesign/31-chrome W6 — W7~W10 4 sub-wave (OQ #8 LOCKED) 진입 전 단일 SoT (Single Source of Truth)
> 작성: 2026-05-27 / quick 260527-7hx
> 대상: `cha-bio-safety/src/components/{GlobalHeader,SideMenu,SettingsPanel,MenuSettingsSection}.tsx`
> precedent: 14-reports / 15-daily-report / 18-worklog 의 `wave-7-tsx-conversion-checklist.md`
> 본 W6 자체 산출 = wave-6-tsx-conversion-checklist.md **1 파일만** (atomic 1-commit)

---

## §0. Quick reference (4 sub-wave 진입 순서)

| 순서 | sub-wave | 대상 컴포넌트 | source 라인 | 변환 후 라인 추정 | 난이도 |
|---|---|---|---|---|---|
| 1 | W7 | `GlobalHeader.tsx` | 45 | ~35 | 가장 작음 — 워밍업 |
| 2 | W10 | `MenuSettingsSection.tsx` | 418 | ~370 | subcomponents-only |
| 3 | W8 | `SideMenu.tsx` | 201 | ~180 | MENU 의존, route 영향 |
| 4 | W9 | `SettingsPanel.tsx` | 894 | ~750 | 가장 큼 — 마지막 |

순서 권장 사유 — 가장 작은 W7 로 워밍업 → MENU import 만 사용하는 독립 W10 → MENU 정의 W8 → 모든 의존 통합 W9. 각 sub-wave 는 **atomic 1-commit** (OQ #8 LOCKED).

---

## §1. 개요 (Purpose / Scope / Status / 4 분할 매트릭스)

### §1.1 W7~W10 4 분할 매트릭스 (OQ #8 LOCKED)

| sub-wave | 대상 컴포넌트 | source 라인 | 변환 후 라인 추정 | atomic commit |
|---|---|---|---|---|
| W7 | `GlobalHeader.tsx` | 45 | ~35 (style→class) | 1-commit |
| W8 | `SideMenu.tsx` | 201 | ~180 | 1-commit |
| W9 | `SettingsPanel.tsx` | 894 | ~750 | 1-commit (largest) |
| W10 | `MenuSettingsSection.tsx` | 418 | ~370 | 1-commit |

### §1.2 4 컴포넌트 in scope / out of scope

**in scope (W7~W10):**
- 인라인 `style` 객체 → Tailwind class 교체
- legacy alias `var(--bg)` → v0.1.1 토큰 `var(--surface-page)` 동시 교체
- raw hex (`#2563eb` / `#fff` / `#dc2626` / `#22c55e` / `#ef4444` / `#6e7681`) → v0.1.1 토큰
- 9·10·11 px fontSize 43 건 → `text-caption` (12) / `text-label` (13) / `text-title` (18) 격상
- `✕` 텍스트 글리프 → Lucide `X`
- `⏳` / `🔔` 이모지 → Lucide `Loader2` / `Send`
- 햄버거 path `"M4 6h16M4 12h16M4 18h16"` verbatim 유지 (OQ #5 LOCKED — 인라인 svg)
- 사용자 아바타 그라데이션 `linear-gradient(135deg,#1d4ed8,#0ea5e9)` 유지 (OQ #3 LOCKED — §6.4 매치)
- 프로필 아바타 그라데이션 `linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)` → `bg-accent-active` solid (OQ #4 LOCKED — 폐기)

**out of scope (보호 파일 — 1 byte 변경 0):**
- `src/App.tsx` 1 byte 변경 0
- `src/styles/tokens.css` 1 byte 변경 0
- `src/styles/typography.css` 1 byte 변경 0
- `tailwind.config.js` 1 byte 변경 0
- `docs/redesign-context/00-design-context/` 1 byte 변경 0
- `docs/redesign-context/31-chrome/` 기존 12 파일 (W1 index + 4 source + 4 sketch + design-system.md + tokens.css + typography.css) 1 byte 변경 0
- MENU 상수 / DEFAULT_SIDE_MENU / NotificationPreferences 6 키 / JSZip 비즈 / Phase 18~21 메뉴 설정 마이그레이션 비즈 1 byte 변경 0

### §1.3 W6 자체 산출 (본 wave)
- **1 파일만:** `cha-bio-safety/docs/redesign-context/31-chrome/wave-6-tsx-conversion-checklist.md`
- atomic 1-commit → main 머지 → cbc7119-preview 자동 배포 (wrangler 금지)
- TSX 변환 0 / sketch HTML 변경 0 / 보호 파일 17개 0 byte

### §1.4 Status 추적

| 상태 | 내용 |
|---|---|
| W1 | wave-1-index.md 75kB 완결 (8 OQ LOCKED 매트릭스 박제) |
| W2~W5 | 4 sub-wave sketch HTML 모두 완결 + 사용자 컨펌 |
| **W6** | **본 wave-6 checklist markdown 작성 — 현재 단계** |
| W7~W10 | 미진입 (본 checklist 가 single source of truth) |

---

## §2. imports per component (4 sub-section)

### §2.1 GlobalHeader imports

**현재 (line 0):** import 없음 — React.ReactNode 타입은 글로벌 사용

**W7 후 추가:** 신규 import 0 — 인라인 svg 유지 (OQ #5 LOCKED, Lucide `Menu` 교체 X)

**verify:** `grep -c "^import" cha-bio-safety/src/components/GlobalHeader.tsx` → 0 유지

### §2.2 SideMenu imports

**verbatim source (line 1~7):**
```typescript
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { getMonthlySchedule } from '../utils/shiftCalc'
import { useStaffList } from '../hooks/useStaffList'
import { settingsApi, type SideMenuEntry, type MenuConfig } from '../utils/api'
```

**W8 후 추가:** `import { X } from 'lucide-react'` (W3-OQ #A LOCKED — ✕ → Lucide X)

**verify:** 위 7 라인 verbatim 유지 + Lucide X 1 추가 → 총 8 import 라인

### §2.3 SettingsPanel imports

**verbatim source (line 1~3 + 42~48):**
```typescript
import { useState, useEffect, useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import JSZip from 'jszip'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '../stores/authStore'
import { authApi, pushApi, staffApi, NotificationPreferences } from '../utils/api'
import { useStaffList } from '../hooks/useStaffList'
import { MenuSettingsSection } from './MenuSettingsSection'
```

**W9 후 추가:** ChevronRight 라인에 `X, Send, Loader2` 합치기 (OQ #A — ✕, OQ #6 — ⏳🔔)
→ `import { ChevronRight, X, Send, Loader2 } from 'lucide-react'`

**verify:** 10 라인 → 동일 10 라인 + Lucide import 확장. JSZip / useMutation / pushApi / NotificationPreferences 등 비즈 의존 0 변경.

### §2.4 MenuSettingsSection imports

**verbatim source (line 1~12):**
```typescript
import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ChevronUp, ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import {
  settingsApi,
  type SideMenuEntry,
  type MenuConfig,
  DEFAULT_SIDE_MENU,
} from '../utils/api'
import { MENU } from './SideMenu'
import { useAuthStore } from '../stores/authStore'
```

**W10 후 추가:** 0 (Lucide 4종 이미 존재)

**verify:** 12 라인 verbatim 유지.

---

## §3. 메인 함수 시그니처 (4 sub-section verbatim — 1 byte 변경 0)

### §3.1 GlobalHeader (line 8)
```typescript
export function GlobalHeader({ title, onMenuOpen, rightSlot, leftSlot }: GlobalHeaderProps)
```

### §3.2 SideMenu (line 59)
```typescript
export function SideMenu({ open, onClose, unresolvedCount = 0 }: Props)
```

### §3.3 SettingsPanel (line 280)
```typescript
export function SettingsPanel({ open, onClose, isDesktop = false }: Props)
```

### §3.4 MenuSettingsSection (line 50)
```typescript
export function MenuSettingsSection()
```

### §3.5 시그니처 verify gate
- 위 4 시그니처 1 byte 변경 0 (props default / 인자 순서 변경 X)
- 4 내부 컴포넌트 (SectionHeader / Toggle / PermBadge / Row / ChangePasswordForm / NameEditModal / ProfileEditForm / ArrowButton / ToggleSmall / DividerTitleInput / DeleteConfirmInline) 도 동일 — 1 byte 변경 0

---

## §4. 비즈 anchor 통합 표 (4 컴포넌트 누적 — 112건, 1 byte 변경 0 강제)

### §4.1 GlobalHeader (7건)

| # | 영역 | source line | anchor | verify grep |
|---|---|---|---|---|
| 1 | Props interface | 1~6 | `title / onMenuOpen / rightSlot? / leftSlot?` 4 필드 | `grep -c "GlobalHeaderProps" GlobalHeader.tsx` ≥ 2 |
| 2 | export function | 8 | `export function GlobalHeader({ title, onMenuOpen, rightSlot, leftSlot }: GlobalHeaderProps)` | `grep -c "export function GlobalHeader"` → 1 |
| 3 | `<header>` flex-shrink:0 | 10~18 | height 48 / padding '0 12px' / flexShrink:0 | `grep -c "shrink-0"` → ≥1 |
| 4 | leftSlot ?? fallback | 19~33 | `??` (`||` 아님 — 0/false/'' 도 leftSlot 으로 인정) | `grep -c "leftSlot \?\?"` → 1 |
| 5 | svg path verbatim | 30~32 | `M4 6h16M4 12h16M4 18h16` + viewBox + strokeWidth 2 | `grep -c "M4 6h16M4 12h16M4 18h16"` → 1 |
| 6 | title span 분기 | 35~41 | textAlign `rightSlot ? 'left' : 'center'` + marginLeft `rightSlot ? 8 : 0` | `grep -c "rightSlot ? .'left' : 'center'"` → 1 |
| 7 | rightSlot \|\| fallback | 42 | `\|\|` (`??` 아님) — placeholder symmetry | `grep -c "rightSlot \|\|"` → 1 |

### §4.2 SideMenu (22건)

| # | 영역 | source line | anchor | verify |
|---|---|---|---|---|
| 1 | Props interface | 11~15 | `open / onClose / unresolvedCount?` 3 필드 | `grep -c "unresolvedCount"` → ≥3 |
| 2 | NAV_H 상수 | 9 | `'calc(54px + var(--sab, 0px))'` | `grep -c "NAV_H"` → ≥1 |
| 3 | MenuItem type export | 17 | `label/path/badge/soon/role?/desktopOnly?` | `grep -c "type MenuItem"` → 1 |
| 4 | MENU 상수 17 아이템 | 19~54 | 대시보드/일반 점검/QR 스캔/조치 관리/승강기 관리/DIV 압력 관리/소화기 관리/CCTV 현황/소방 시설 도면/소방 점검 관리/소방 시설 추가/일일 업무 일지/업무 수행 기록표/월간 점검 계획/월간 출근부/연간 업무 추진 계획/소방계획서·훈련자료/점검 일지 출력/QR 코드 출력/연차 및 식사/보수교육/직원 관리 (5 섹션 × 17 항목 verbatim) | `grep -c "label: '"` SideMenu.tsx ≥ 17 |
| 5 | ITEM_META Record | 56~57 | `MENU.forEach(s => s.items.forEach(i => { ITEM_META[i.path] = i }))` | `grep -c "ITEM_META\\["` → ≥2 |
| 6 | appliedEntries useMemo | 66~70 | `menuConfig.sideMenu` fallback `[]` | `grep -c "appliedEntries"` → ≥2 |
| 7 | useQuery menu-config | 63 | `queryKey: ['menu-config']` + staleTime 300_000 | `grep -c "menu-config"` → ≥1 |
| 8 | RAW_TO_LABEL map | 72 | `'당':'당직', '비':'비번', '주':'주간', '휴':'연차'` | `grep -c "RAW_TO_LABEL"` → 1 |
| 9 | todayShiftLabel state | 73 | default `'평일주간고정'` | `grep -c "평일주간고정"` → 1 |
| 10 | 8:30am ref boundary | 76~78 | `now.getHours() < 8 \|\| (now.getHours() === 8 && now.getMinutes() < 30)` | `grep -c "getMinutes() < 30"` → 1 |
| 11 | getMonthlySchedule call | 80 | `(ref.getFullYear(), ref.getMonth() + 1, staffForCalc)` | `grep -c "getMonthlySchedule"` → 1 |
| 12 | body scroll lock useEffect | 89~103 | `document.body.style.overflow = 'hidden'` + touchmove prevent | `grep -c "body.style.overflow"` → ≥2 |
| 13 | go(path) close | 105 | `navigate(path); onClose()` | `grep -c "go = (path:"` → 1 |
| 14 | 오버레이 transition | 110~119 | `rgba(0,0,0,0.65)` + opacity / pointerEvents / 0.28s | `grep -c "0,0,0,0.65"` → 1 |
| 15 | panel position fixed | 122~133 | `top: var(--sat, 0px)` + `bottom: calc(54px + var(--sab, 0px) - var(--sat, 0px))` | `grep -c "var(--sat"` → ≥1 |
| 16 | panel width 82% / max 300 | 126 | `width: '82%', maxWidth: 300` | `grep -c "maxWidth: 300\|max-w-\[300"` → 1 |
| 17 | divider 9px uppercase | 149 | `padding:'9px 13px 2px', fontSize:9, letterSpacing:'.08em', textTransform:'uppercase'` | `grep -c "uppercase"` → ≥1 (sketch 12px+leading-none 격상) |
| 18 | item soon 분기 | 160~166 | `opacity:0.5, cursor:'default', pointerEvents:'none'` + '준비중' span | `grep -c "준비중"` → 1 |
| 19 | item role 필터 | 158 | `if (meta.role && staff?.role !== meta.role) return null` | `grep -c "staff\\?\\.role !== meta.role"` → 1 |
| 20 | desktopOnly 필터 | 159 | `if (meta.desktopOnly) return null` | `grep -c "meta.desktopOnly"` → 1 |
| 21 | unresolvedCount badge | 168 | `meta.path === '/remediation' ? unresolvedCount : meta.badge` | `grep -c "/remediation.*unresolvedCount"` → 1 |
| 22 | badge 99+ cap + 사용자 카드 | 178 / 189 | `badgeCount > 99 ? '99+' : badgeCount` / `linear-gradient(135deg,#1d4ed8,#0ea5e9)` 아바타 (OQ #3 LOCKED 보존) | `grep -c "99+"` → 1 / `grep -c "1d4ed8,#0ea5e9"` → 1 |

### §4.3 SettingsPanel (40건)

| # | 영역 | source line | anchor | verify |
|---|---|---|---|---|
| 1 | Props interface | 50~54 | `open / onClose / isDesktop?` 3 필드 | `grep -c "isDesktop\\?"` → ≥1 |
| 2 | SectionHeader | 6~27 | label/collapsed/onToggle + ChevronRight rotate 90deg | `grep -c "rotate(90deg)"` → ≥2 |
| 3 | usePersistedCollapse | 29~41 | localStorage 키 + default true | `grep -c "usePersistedCollapse"` → ≥6 (6 keys) |
| 4 | Toggle | 57~77 | width 38 height 21 + `#2563eb` on / `var(--bg4)` off + 17×17 thumb translate 17px | `grep -c "translateX(17px)"` → ≥2 |
| 5 | PermBadge | 80~93 | granted/denied/default 3 상태 + `${color}22` 16% alpha | `grep -c "granted\|denied"` → ≥2 |
| 6 | Row | 96~106 | label/sub/children/onClick + bg:var(--bg3) + borderRadius 9 | `grep -c "function Row"` → 1 |
| 7 | ChangePasswordForm | 109~145 | current/next/confirm + bcrypt mutation + 4자 이상 | `grep -c "ChangePasswordForm"` → ≥2 |
| 8 | NameEditModal | 148~180 | currentName/onClose/onSave + maxLength 20 + fixed z-300 | `grep -c "NameEditModal"` → ≥1 |
| 9 | ProfileEditForm | 183~277 | 8 필드 (이름/사번/직책/역할/입사일/생년월일/연락처/이메일) + appointedAt slice | `grep -c "ProfileEditForm"` → ≥2 |
| 10 | 6 collapsible localStorage 키 | 285~289 | `settings.notif/display/account/db/appinfo.collapsed` + menuSettings.collapsed | `grep -c "settings\\..*\\.collapsed"` → ≥5 |
| 11 | 7 state (cacheClearing/dbBackingUp/dbRestoring/r2BackingUp/r2BackupProgress/r2Restoring/testSending) | 290~296 | 7 state | `grep -c "useState(false)"` → ≥6 |
| 12 | permState/subscribed/prefs state | 304~312 | NotificationPreferences 6 키 default true | `grep -c "daily_schedule: true"` → 1 |
| 13 | NotificationPreferences 6 키 | 309~311 | `daily_schedule, incomplete_schedule, unresolved_issue, education_reminder, event_15min, event_5min` | `grep -c "daily_schedule\|incomplete_schedule\|unresolved_issue\|education_reminder\|event_15min\|event_5min"` → ≥6 |
| 14 | open useEffect pushApi.getStatus | 315~323 | subscribed + preferences load | `grep -c "pushApi.getStatus"` → 1 |
| 15 | urlBase64ToUint8Array | 325~330 | base64String padding `=`.repeat(...) | `grep -c "urlBase64ToUint8Array"` → ≥2 |
| 16 | handleSubscribe | 332~359 | permState denied 분기 + requestPermission + getSubscription unsubscribe + getVapidKey + pushManager.subscribe | `grep -c "handleSubscribe"` → ≥2 |
| 17 | handleUnsubscribe | 361~374 | reg.pushManager.getSubscription + sub.unsubscribe + pushApi.unsubscribe | `grep -c "handleUnsubscribe"` → ≥2 |
| 18 | handleTestPush | 376~396 | `${base}/push/test` + Bearer token + sent/total report | `grep -c "/push/test"` → 1 |
| 19 | handlePrefToggle | 398~407 | optimistic update + revert on error + pushApi.updatePreferences | `grep -c "updatePreferences"` → 1 |
| 20 | open touchmove prevent | 409~418 | `document.body.style.overflow` X — touchmove only (cf. SideMenu 이중 lock 다름) | `grep -c "settings-panel.*contains"` → 1 |
| 21 | handleClearCache | 420~442 | caches.keys + reg.unregister + window.location.reload | `grep -c "handleClearCache"` → ≥2 |
| 22 | handleDbBackup | 444~465 | `/database/backup` + Blob → a.click() + `.sql` | `grep -c "/database/backup"` → ≥2 |
| 23 | handleDbRestore | 467~495 | file input + confirm() + FormData + `/database/restore` | `grep -c "/database/restore"` → 1 |
| 24 | handleR2Backup | 497~582 | `/database/r2-list` + `/database/backup-status` + cronZips + JSZip delta | `grep -c "/database/r2-list"` → 1 |
| 25 | handleR2Restore | 584~625 | `JSZip.loadAsync` + 10개씩 배치 + `/database/r2-upload` | `grep -c "/database/r2-upload"` → 1 |
| 26 | handleLogout | 627~631 | `logout()` + `navigate('/login')` + `onClose()` | `grep -c "handleLogout"` → ≥2 |
| 27 | handleNameSaved | 633~636 | updateStaff + toast | `grep -c "handleNameSaved"` → ≥1 |
| 28 | 오버레이 transition | 640~649 | `rgba(0,0,0,0.65)` + 0.28s | `grep -c "0,0,0,0.65"` → 1 |
| 29 | panel position fixed isDesktop | 650~661 | `top: isDesktop ? 0 : 'var(--sat, 0px)'` + `bottom: isDesktop ? 0 : 'calc(54px + var(--sab, 0px) - var(--sat, 0px))'` | `grep -c "isDesktop \\? 0"` → ≥2 |
| 30 | panel width 88% / max 320 | 654 | `width: '88%', maxWidth: 320` | `grep -c "maxWidth: 320\|max-w-\[320"` → 1 |
| 31 | gear svg path | 664~666 | gear path verbatim + circle cx=12 cy=12 r=3 | `grep -c "M10.325 4.317"` → 1 (인라인 svg 유지 OQ #5) |
| 32 | 프로필 아바타 그라데이션 폐기 | 675~682 | `linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)` → `bg-accent-active` solid (OQ #4 LOCKED) | `grep -c "2563eb 0%, #7c3aed"` → 0 (폐기) + `grep -c "bg-accent-active"` → ≥1 |
| 33 | 알림 Row "푸시 알림" | 695~704 | sub 분기 denied/subscribed/구독 안내 | `grep -c "푸시 알림"` → 1 |
| 34 | admin testSending 버튼 | 709~724 | `staff?.role === 'admin' && subscribed && permState === 'granted'` + ⏳🔔 → Lucide Loader2/Send | `grep -c "⏳\|🔔"` → 0 (OQ #6 LOCKED 폐기) |
| 35 | 점검/일정 그룹 라벨 | 726 / 738 | `'.08em' letterSpacing` + 9px uppercase | `grep -c "uppercase"` → ≥3 |
| 36 | MenuSettingsSection 마운트 | 753 | `<MenuSettingsSection />` (Phase 18) | `grep -c "MenuSettingsSection"` → ≥1 |
| 37 | 화면 섹션 (테마/주간기준/즉시저장) | 756~771 | 3 Row + select option | `grep -c "테마\|주간 현황\|즉시 저장"` → ≥3 |
| 38 | 계정 섹션 + showPwChange/showProfileEdit 분기 | 773~790 | 폼 전환 | `grep -c "showPwChange\|showProfileEdit"` → ≥4 |
| 39 | DB 섹션 admin only | 793~857 | 4 버튼 (DB 백업/복원 + R2 백업/복원) + 4 svg path | `grep -c "DB (점검기록\|파일 (점검 사진"` → ≥2 |
| 40 | 앱 정보 + 로그아웃 | 860~889 | `v${__APP_VERSION__} (${__BUILD_TIME__})` + `rgba(220,38,38,0.12)` + `#dc2626` | `grep -c "__APP_VERSION__\|__BUILD_TIME__"` → ≥2 / `grep -c "#dc2626"` → 0 (status-danger 교체) |

### §4.4 MenuSettingsSection (43건)

| # | 영역 | source line | anchor | verify |
|---|---|---|---|---|
| 1 | imports | 1~12 | useState/useEffect/useMemo/useRef + useQuery/useQueryClient/useMutation + toast + ChevronUp/Down/Right/Trash2 + settingsApi + MENU + useAuthStore | grep §2.4 |
| 2 | PATH_LABEL IIFE | 14~19 | `MENU.forEach(s => s.items.forEach(i => { m[i.path] = i.label }))` | `grep -c "PATH_LABEL"` → ≥4 |
| 3 | DESKTOP_ONLY_PATHS Set | 22~24 | desktopOnly 필터 | `grep -c "DESKTOP_ONLY_PATHS"` → ≥2 |
| 4 | ADMIN_PATHS Set | 27~29 | role admin 필터 | `grep -c "ADMIN_PATHS"` → ≥2 |
| 5 | newDividerId | 32~34 | `d-${Date.now().toString(36)}-${Math.random()...}` | `grep -c "newDividerId"` → ≥2 |
| 6 | entriesEqual | 36~48 | length + type + path + visible + id + title 비교 | `grep -c "entriesEqual"` → ≥2 |
| 7 | useQuery menu-config | 54~58 | staleTime 300_000 | `grep -c "menu-config"` → ≥1 |
| 8 | draft state | 61 | `SideMenuEntry[]` | `grep -c "draft.*setDraft"` → ≥1 |
| 9 | editingDividerIdx | 62 | `number \| null` | `grep -c "editingDividerIdx"` → ≥3 |
| 10 | confirmDeleteIdx | 63 | `number \| null` | `grep -c "confirmDeleteIdx"` → ≥3 |
| 11 | confirmReset state | 64 | bool | `grep -c "confirmReset"` → ≥3 |
| 12 | confirmTimerRef | 65 | `number \| null` | `grep -c "confirmTimerRef"` → ≥3 |
| 13 | collapsed localStorage init | 66~71 | `menuSettings.collapsed` default true | `grep -c "menuSettings.collapsed"` → ≥2 |
| 14 | draft init useEffect | 74~80 | `serverConfig.sideMenu` spread `{ ...e }` | `grep -c "DEFAULT_SIDE_MENU.map"` → ≥1 |
| 15 | dirty useMemo | 82~85 | entriesEqual 비교 | `grep -c "dirty"` → ≥2 |
| 16 | saveMutation | 87~94 | `settingsApi.saveMenu` + toast 성공/실패 + invalidateQueries | `grep -c "saveMutation"` → ≥2 |
| 17 | moveUp | 97~104 | `idx <= 0` guard + swap | `grep -c "moveUp"` → ≥3 |
| 18 | moveDown | 105~112 | `idx >= length -1` guard + swap | `grep -c "moveDown"` → ≥3 |
| 19 | toggleVisible | 113~118 | item type only + `!visible` | `grep -c "toggleVisible"` → ≥2 |
| 20 | renameDivider | 119~131 | `trim().slice(0,20)` + empty silent revert | `grep -c "renameDivider"` → ≥2 |
| 21 | deleteDivider | 132~136 | filter + null confirmDeleteIdx + clearTimeout | `grep -c "deleteDivider"` → ≥2 |
| 22 | addDivider | 137~145 | newDividerId + '새 구분선' + setTimeout editingDividerIdx | `grep -c "addDivider"` → ≥2 |
| 23 | resetToDefaults | 146~149 | `DEFAULT_SIDE_MENU` spread | `grep -c "resetToDefaults"` → ≥2 |
| 24 | 5s auto-dismiss useEffect | 152~159 | setTimeout 5000 confirmDeleteIdx null | `grep -c "5000"` → 1 |
| 25 | collapsible 헤더 button | 164~181 | aria-expanded + ChevronRight rotate 90deg | `grep -c "aria-expanded"` → ≥1 |
| 26 | "메뉴 설정" 카피 | 173 | 9px uppercase letterSpacing | `grep -c "메뉴 설정"` → 1 |
| 27 | admin filter render | 189 | `!isAdmin && entry.type === 'item' && ADMIN_PATHS.has(entry.path)` skip | `grep -c "isAdmin"` → ≥2 |
| 28 | divider 렌더 borderLeft 2px | 198~202 | `var(--bd2)` 2px solid | `grep -c "borderLeft"` → ≥1 |
| 29 | DividerTitleInput isEditing | 205~209 | onCommit | `grep -c "isEditing"` → ≥1 |
| 30 | DeleteConfirmInline isConfirmingDelete | 225~229 | onCancel/onConfirm | `grep -c "isConfirmingDelete"` → ≥1 |
| 31 | Trash2 14 | 239 | size 14 | `grep -c "Trash2 size={14}"` → 1 |
| 32 | item PATH_LABEL filter | 248 | `!(entry.path in PATH_LABEL)` skip | (line 248) |
| 33 | item DESKTOP_ONLY filter | 249 | `DESKTOP_ONLY_PATHS.has` skip | (line 249) |
| 34 | item label "숨김" | 263 | `!entry.visible` + '숨김' | `grep -c "숨김"` → 1 |
| 35 | "+ 구분선 추가" 버튼 | 279~288 | dashed border + width 100% h 36 + '+ 구분선 추가' | `grep -c "구분선 추가"` → 1 |
| 36 | "기본값으로 초기화" + "기본 배치로 되돌릴까요?" | 291~311 | 2-step confirm | `grep -c "기본 배치로 되돌릴까요"` → 1 |
| 37 | "초기화" 빨강 버튼 | 300~302 | `var(--danger)` + `#fff` | `grep -c "초기화"` → ≥1 |
| 38 | "설정 저장" 버튼 | 315~327 | disabled `!dirty` + `var(--acl)` + h 40 | `grep -c "설정 저장"` → 1 |
| 39 | ArrowButton subcomponent | 336~354 | dir up/down + disabled + 32×32 (w-8 함정 의식) | `grep -c "ArrowButton"` → ≥4 |
| 40 | ToggleSmall subcomponent | 356~376 | width 38 h 21 + 17×17 thumb + `#2563eb` → `bg-accent-active` (W5 OQ LOCKED) | `grep -c "ToggleSmall"` → ≥2 / `grep -c "#2563eb"` → 0 |
| 41 | DividerTitleInput subcomponent | 378~402 | `ref.focus` + select() + onBlur commit + Enter blur + Escape revert + maxLength 20 + h 40 | `grep -c "DividerTitleInput"` → ≥2 |
| 42 | DeleteConfirmInline subcomponent | 404~418 | '삭제할까요?' + 취소/삭제 버튼 + var(--danger) | `grep -c "삭제할까요"` → 1 |
| 43 | Phase 21 migrateLegacyMenuConfig 박제 | (utils/api 의존) | settingsApi.getMenu API 응답 형식 변경 X — MenuSettingsSection 은 평면 SideMenuEntry[] 만 다룸 | (TSX 변환에서 비즈 1 byte 변경 0 강제) |

### §4.5 합계

- GlobalHeader 7 + SideMenu 22 + SettingsPanel 40 + MenuSettingsSection 43 = **112 anchor**
- 1 byte 변경 0 강제 — W7~W10 verify gate 의 source of truth
- 본 §4 표는 W7~W10 4 sub-wave 의 atomic 1-commit 직전 grep 검증의 SoT

---

## §5. OQ LOCKED 통합 (W1 8건 + W3-OQ A/B + W5 추가 OQ — 총 11+ 건)

### §5.1 W1 8건

| OQ | 내용 | LOCKED 답 | 적용 wave |
|---|---|---|---|
| #1 | 다크 + 라이트 양쪽 | v0.1.1 토큰 자동 분기 (`[data-theme="light"]`) | W7~W10 전체 — Tailwind class 가 자동 분기 |
| #2 | 9·10·11 위반 부분 격상 | 43 건 통합 격상 (§7 매트릭스) | W7~W10 전체 |
| #3 | SideMenu 아바타 그라데이션 유지 | `linear-gradient(135deg,#1d4ed8,#0ea5e9)` 보존 (§6.4 매치) | W8 only — inline 또는 utility |
| #4 | SettingsPanel 프로필 그라데이션 폐기 | `bg-accent-active` solid | W9 only |
| #5 | 인라인 svg 유지 (GlobalHeader 햄버거 + SettingsPanel gear) | path verbatim — Lucide 교체 X | W7 + W9 |
| #6 | admin 테스트 푸시 이모지 제거 | `⏳` → Lucide Loader2 / `🔔` → Lucide Send | W9 only |
| #7 | panel width 보존 (SideMenu 82%/300, SettingsPanel 88%/320) | 보존 | W8 + W9 |
| #8 | W7 TSX 변환 4 분할 | W7/W8/W9/W10 sub-wave 각 atomic 1-commit | W7~W10 전체 |

### §5.2 W3-OQ 추가 2건 (sketch-wave-3-side-menu.html 검토 중 발생)

| OQ | 내용 | LOCKED 답 | 적용 |
|---|---|---|---|
| #A | ✕ 텍스트 글리프 → Lucide X | Lucide X size 14 (현재 fontSize:15 매치) | W8 + W9 (SideMenu 닫기 + SettingsPanel 닫기) |
| #B | 미조치 badge 색 | `--status-fire-bar` 후보 (memory `feedback_inspection_unresolved_color` — 메인 칩 fire). 현재 source 는 `var(--danger)`. **현재 `var(--danger)` 유지 + 토큰 alias 만 v0.1.1 `--status-danger-bar` 로 교체 + 추후 별도 quick 에서 fire 로 전환 검토** (디자인 일관성 vs 비즈 1 byte 변경 0 충돌 해소) | W8 only |

### §5.3 W5 추가 OQ (sketch-wave-5-menu-settings-section.html 검토 중 발생)

| OQ | 내용 | LOCKED 답 | 적용 |
|---|---|---|---|
| #5-A | Toggle accent | ToggleSmall + Toggle `#2563eb` raw → `bg-accent-active` solid (라이트/다크 자동 분기 OK) | W9 + W10 (Toggle / ToggleSmall) |

### §5.4 OQ LOCKED 합계 합산 표

| 구분 | 건수 | wave |
|---|---|---|
| W1 OQ #1~#8 | 8 | W7~W10 전체 |
| W3-OQ #A | 1 | W8 + W9 |
| W3-OQ #B | 1 | W8 |
| W5 OQ #5-A | 1 | W9 + W10 |
| **합계** | **11** | — |

---

## §6. sketch HTML grep verbatim references (4 sub-section, ≥4 fence)

### §6.1 W2 sketch-wave-2-global-header.html

**fence:**
```
sketch-wave-2-global-header.html line 27~52 — 비즈 anchor 7건 verbatim
sketch-wave-2-global-header.html line 58~94 — OQ LOCKED 8건 매트릭스
sketch-wave-2-global-header.html line 100~ — 노안 룰 §1.1 격상 표
  - title fontSize 13 → 18 (text-title)
  - 햄버거 button 32×32 → 48×48 (h-12 w-12 = 48 = touch target / w-8 함정 회피)
  - svg 15×15 → 20 (Lucide size 표준)
  - right placeholder width 32 → 48 (symmetry 보존)
```

**memory 룰 적용:** `feedback_planner_prompt_sketch_verbatim` — sketch CSS 정의를 grep 으로 추출해 그대로 인용.

### §6.2 W3 sketch-wave-3-side-menu.html (panel 치수 / overlay opacity / 아바타 그라데이션 / Lucide X)

**fence:**
```
sketch-wave-3-side-menu.html — 비즈 anchor 22건 verbatim
  - Props/NAV_H/MENU 17/ITEM_META/appliedEntries/RAW_TO_LABEL/todayShiftLabel
  - 8:30am ref/body scroll lock/go(path)/오버레이 transition/panel 치수
  - divider/item/soon/badge/badgeCount 99+ cap/아바타 그라데이션/staff.name fallback
sketch-wave-3-side-menu.html — OQ #3 LOCKED (아바타 그라데이션 보존)
sketch-wave-3-side-menu.html — W3-OQ #A LOCKED (✕ → Lucide X)
sketch-wave-3-side-menu.html — W3-OQ #B LOCKED (badge 색 — §5.2 위 노트 참조)
  - panel width 82% / maxWidth 300 (보존)
  - 오버레이 rgba(0,0,0,0.65) + 0.28s transition
  - panel borderRadius '0 16px 16px 0'
  - divider 9px uppercase letterSpacing .08em
  - badge JetBrains Mono 11px fontWeight 700
```

**memory 룰 적용:** `feedback_design_sketch_first` — 시각 작업은 sketch HTML 시안 먼저 → 사용자 컨펌 → TSX 변환.

### §6.3 W4 sketch-wave-4-settings-panel.html (Toggle accent / 그라데이션 폐기 / 6 collapsible / JSZip / push prefs)

**fence:**
```
sketch-wave-4-settings-panel.html — 비즈 anchor 40+건 verbatim
sketch-wave-4-settings-panel.html — OQ #4 LOCKED (프로필 그라데이션 폐기 → bg-accent-active)
sketch-wave-4-settings-panel.html — OQ #6 LOCKED (⏳🔔 → Lucide Loader2/Send)
sketch-wave-4-settings-panel.html — OQ #7 LOCKED (panel width 88%/maxWidth 320 보존)
sketch-wave-4-settings-panel.html — W3-OQ #A LOCKED (✕ → Lucide X)
sketch-wave-4-settings-panel.html — W5 OQ #5-A LOCKED (Toggle accent → bg-accent-active solid)
sketch-wave-4-settings-panel.html — 6 collapsible localStorage 키 verbatim
  - settings.notif/display/account/db/appinfo.collapsed + menuSettings.collapsed
sketch-wave-4-settings-panel.html — JSZip handleR2Backup/Restore 100% 비즈 보존 (1 byte 변경 0)
sketch-wave-4-settings-panel.html — NotificationPreferences 6 키 default true verbatim
sketch-wave-4-settings-panel.html — 4 SVG path 인라인 유지 (gear / DB 백업 / DB 복원 / R2 백업 / R2 복원)
  - DB/R2 4개 path 도 인라인 유지 (OQ #5 LOCKED 확장 — gear path 와 동일 정책)
```

**memory 룰 적용:** `feedback_tsx_wave_stat_card_drift` — executor 가 source outline 패턴 보존, sketch 새 패턴 누락 가능. plan 에 verbatim 인용 + verify gate 권장.

### §6.4 W5 sketch-wave-5-menu-settings-section.html (Toggle accent / Phase 21 / 4 subcomponents 치수)

**fence:**
```
sketch-wave-5-menu-settings-section.html — 비즈 anchor 43+건 verbatim
sketch-wave-5-menu-settings-section.html — W5 OQ #5-A LOCKED (ToggleSmall accent → bg-accent-active solid)
sketch-wave-5-menu-settings-section.html — Phase 21 migrateLegacyMenuConfig 박제
  - utils/api 의존 — 본 컴포넌트는 평면 SideMenuEntry[] 만 다룸
sketch-wave-5-menu-settings-section.html — 4 subcomponents
  - ArrowButton 32×32
  - ToggleSmall 38×21
  - DividerTitleInput h40 maxLength 20
  - DeleteConfirmInline 6px gap
sketch-wave-5-menu-settings-section.html — admin 필터 (ADMIN_PATHS skip) + desktopOnly 필터 (DESKTOP_ONLY_PATHS skip) + label "숨김"
sketch-wave-5-menu-settings-section.html — 5s auto-dismiss confirmDeleteIdx + 2-step confirmReset
sketch-wave-5-menu-settings-section.html — "메뉴 설정" 카피 9px uppercase letterSpacing .08em
sketch-wave-5-menu-settings-section.html — "+ 구분선 추가" / "기본값으로 초기화" / "기본 배치로 되돌릴까요?" / "초기화" / "설정 저장" 17 카피 verbatim
```

**memory 룰 적용:** `feedback_redesign_sketch_rule_enforcement` — 시안 작성 시 디자인 룰 강제 (negative rule + §6.2/§6.3/§7.1 일관성).

### §6.5 sketch HTML reference 합계

| W | 파일 | anchor 박제 |
|---|---|---|
| W2 | sketch-wave-2-global-header.html | 7건 + OQ 8건 + 노안 4건 |
| W3 | sketch-wave-3-side-menu.html | 22건 + OQ #3/#A/#B + 5 시각 룰 |
| W4 | sketch-wave-4-settings-panel.html | 40+건 + OQ #4/#6/#7/#A/#5-A + 6 collapsible + JSZip 비즈 |
| W5 | sketch-wave-5-menu-settings-section.html | 43+건 + W5 OQ #5-A + Phase 21 + 4 subcomponents |

---

## §7. 폰트 격상 매트릭스 (43건 통합 — 9·10·11px 0건 강제)

| # | 컴포넌트 | source line | 현재 px | 격상 px | Tailwind class | 의미 |
|---|---|---|---|---|---|---|
| 1 | GlobalHeader | 37 | 13 | 18 | `text-title` | title 페이지 헤더 |
| 2 | SideMenu | 138 | 13 | 16 | `text-body` | 차바이오컴플렉스 헤더 |
| 3 | SideMenu | 139 | 9.5 | 12 | `text-caption leading-none` | 헤더 부제 (작은 컨테이너 leading-none 박제) |
| 4 | SideMenu | 141 | 15 | 14 | `text-body-sm` | ✕ → Lucide X size 14 |
| 5 | SideMenu | 149 | 9 | 12 | `text-caption leading-none uppercase` | divider |
| 6 | SideMenu | 163 | 12.5 | 13 | `text-label` | soon item 라벨 |
| 7 | SideMenu | 164 | 10 | 12 | `text-caption` | "준비중" 배지 |
| 8 | SideMenu | 175 | 12.5 | 13 | `text-label` | menu item 라벨 |
| 9 | SideMenu | 177 | 11 | 12 | `text-caption font-mono font-bold` | badge 숫자 (JetBrains Mono 유지) |
| 10 | SideMenu | 193 | 11.5 | 13 | `text-label font-bold` | 사용자 이름 |
| 11 | SideMenu | 194 | 9.5 | 12 | `text-caption leading-none` | 사용자 직책 · todayShiftLabel |
| 12 | SettingsPanel | 17 | 9 | 12 | `text-caption leading-none uppercase` | SectionHeader 라벨 |
| 13 | SettingsPanel | 64 / 364 | 38×21 | (유지) | inline (Toggle 치수) | Toggle 크기 유지 — fontSize 적용 X |
| 14 | SettingsPanel | 89 | 10 | 12 | `text-caption font-semibold` | PermBadge |
| 15 | SettingsPanel | 100 | 12 | 13 | `text-label` | Row label |
| 16 | SettingsPanel | 101 | 10 | 12 | `text-caption` | Row sub |
| 17 | SettingsPanel | 124 | 9 | 12 | `text-caption leading-none uppercase` | "비밀번호 변경" 폼 헤더 |
| 18 | SettingsPanel | 127~131 | 13 | 13 | `text-label` | input placeholder (현재 13 유지 OK) |
| 19 | SettingsPanel | 133 | 11 | 12 | `text-caption text-status-danger` | 비밀번호 불일치 메시지 |
| 20 | SettingsPanel | 136~138 | 12 | 13 | `text-label font-bold` | 취소/변경 버튼 |
| 21 | SettingsPanel | 166 | 13 | 16 | `text-body font-bold` | "이름 변경" 모달 제목 |
| 22 | SettingsPanel | 219 | 12 | 13 | `text-label` | ProfileEditForm input |
| 23 | SettingsPanel | 225 | 9 | 12 | `text-caption leading-none uppercase` | ProfileEditForm 헤더 |
| 24 | SettingsPanel | 228~265 | 10 | 12 | `text-caption` | ProfileEditForm 8 필드 라벨 |
| 25 | SettingsPanel | 668 | 13.5 | 18 | `text-title` | 설정 헤더 |
| 26 | SettingsPanel | 669 | 15 | 14 | `text-body-sm` | ✕ → Lucide X size 14 |
| 27 | SettingsPanel | 679 | 18 | 18 | `text-title font-bold` | 아바타 캐릭터 (유지) |
| 28 | SettingsPanel | 684 | 14 | 16 | `text-body font-bold` | 사용자 이름 |
| 29 | SettingsPanel | 685 | 10 | 12 | `text-caption leading-none` | displayTitle · displayRole |
| 30 | SettingsPanel | 717 | 11 | 12 | `text-caption font-semibold` | "테스트 푸시" 버튼 카피 |
| 31 | SettingsPanel | 726 / 738 | 9 | 12 | `text-caption leading-none uppercase` | 점검/일정 그룹 라벨 |
| 32 | SettingsPanel | 762 / 766 | 11 | 12 | `text-caption` | select option |
| 33 | SettingsPanel | 797 / 826 | 10 | 12 | `text-caption` | "DB" / "파일" sub-label |
| 34 | SettingsPanel | 810/823/839/852 | 12 | 13 | `text-label font-bold` | 4 DB/R2 버튼 카피 |
| 35 | SettingsPanel | 884 | 12 | 13 | `text-label font-bold` | 로그아웃 버튼 |
| 36 | MenuSettingsSection | 173 | 9 | 12 | `text-caption leading-none uppercase` | "메뉴 설정" 헤더 |
| 37 | MenuSettingsSection | 214 | 9 | 12 | `text-caption leading-none uppercase` | divider 라벨 (편집 안 함 상태) |
| 38 | MenuSettingsSection | 259 | 12 | 13 | `text-label` | item 라벨 |
| 39 | MenuSettingsSection | 263 | 9 | 12 | `text-caption leading-none` | "숨김" 배지 |
| 40 | MenuSettingsSection | 284 | 12 | 13 | `text-label` | "+ 구분선 추가" |
| 41 | MenuSettingsSection | 294/297/301 | 10 | 12 | `text-caption font-bold` | 기본값 confirm 행 |
| 42 | MenuSettingsSection | 307 | 10 | 12 | `text-caption` | "기본값으로 초기화" |
| 43 | MenuSettingsSection | 320 | 12 | 13 | `text-label font-bold` | "설정 저장" 버튼 |

### §7.1 9·10·11 px 0건 룰 (필수 박제)

- 변환 후 `cha-bio-safety/src/components/{GlobalHeader,SideMenu,SettingsPanel,MenuSettingsSection}.tsx` 4 파일 합본 grep:
  - `grep -E "fontSize: ?(9|10|11)[,$]|text-\[(9|10|11)px\]"` → **0 hit**
- `text-caption` 토큰 (12px) 이 lh 1.5 → 작은 컨테이너 (h-8, h-7) 안에서 시각적 패딩 발생 시 `leading-none` 명시 (memory `feedback_text_caption_leading_none`)
- 본 §7 격상표는 **43건 모두 W7~W10 변환에서 1-by-1 적용** — 변환 누락 없음

### §7.2 격상 룰 적용 우선순위

| 우선순위 | 의도 | class |
|---|---|---|
| 1 | 페이지 헤더 (title) | `text-title` (18px) |
| 2 | 본문 / 사용자 이름 | `text-body` (16px) |
| 3 | 닫기 X / 아이콘 텍스트 | `text-body-sm` (14px) |
| 4 | item label / 버튼 | `text-label` (13px) |
| 5 | 메타 / 배지 / 캡션 | `text-caption` (12px) |
| 6 | 작은 컨테이너 (h-7/h-8) | `text-caption leading-none` |
| 7 | divider 헤더 | `text-caption leading-none uppercase` |

---

## §8. Lucide 매핑 (Lucide 사용 목록)

### §8.1 신규 추가 Lucide

| 컴포넌트 | 라인 | 교체 대상 | Lucide | size |
|---|---|---|---|---|
| GlobalHeader | (햄버거) | 인라인 svg path `"M4 6h16M4 12h16M4 18h16"` | **유지 X (OQ #5 LOCKED — 인라인 svg 보존)** | — |
| SideMenu | 141 | ✕ 텍스트 글리프 (fontSize 15) | `X` | 14 (W3-OQ #A) |
| SettingsPanel | 669 | ✕ 텍스트 글리프 (fontSize 15) | `X` | 14 (W3-OQ #A) |
| SettingsPanel | 722 | `⏳ 전송 중...` 이모지 | `Loader2` (애니메이션 `animate-spin`) | 14 |
| SettingsPanel | 722 | `🔔 테스트 푸시 보내기` 이모지 | `Send` | 14 |
| SettingsPanel | 664 (gear) | 인라인 svg path `"M10.325 4.317..."` | **유지 X (OQ #5 LOCKED 확장 — 인라인 svg 보존)** | — |
| SettingsPanel | 783/786/870 (`<svg>` ChevronRight inline) | 7×7 chevron inline | `ChevronRight` (이미 import 됨) size 13 | 13 |
| SettingsPanel | 809/822/838/851 (4 DB/R2 SVG inline) | 인라인 svg path | **유지 X (OQ #5 LOCKED 확장)** | — |

### §8.2 기존 유지 Lucide

| 컴포넌트 | 라인 | Lucide | size |
|---|---|---|---|
| SettingsPanel | 2 | ChevronRight | 14 / 13 |
| MenuSettingsSection | 4 | ChevronUp, ChevronDown, ChevronRight, Trash2 | 14 |

### §8.3 lucide-react import 박제 (필수)

**W8 SideMenu** — import 라인 추가:
```typescript
import { X } from 'lucide-react'
```

**W9 SettingsPanel** — import 라인 변경:
```typescript
import { ChevronRight, X, Send, Loader2 } from 'lucide-react'
```

**W10 MenuSettingsSection** — import 변경 0 (4종 이미 있음).

### §8.4 Lucide size 표준

| 사용처 | size | 사유 |
|---|---|---|
| ChevronRight (Row trailing) | 13 | 기존 SettingsPanel inline 7×7 → Lucide 13 격상 |
| ChevronRight (SectionHeader rotate) | 14 | usePersistedCollapse 토글 |
| ChevronUp/Down (MenuSettingsSection ArrowButton) | 14 | 기존 |
| X (닫기) | 14 | fontSize 15 매치 (OQ #A) |
| Send / Loader2 (admin testSending) | 14 | 이모지 → Lucide 일관성 |
| Trash2 | 14 | DeleteConfirmInline + ArrowButton row delete |

---

## §9. components.css inherit vs 신규 — chrome 정책

### §9.1 chrome 4 컴포넌트는 글로벌 — 페이지별 .css 파일 미사용

- 14-reports / 15-daily-report / 18-worklog 와 다름: page-level `components.css` 신규 작성 패턴 적용 안 됨
- chrome 은 모든 페이지가 import 하는 layout 컴포넌트라 page-scoped CSS 가 어울리지 않음
- **결론:** 4 컴포넌트 모두 인라인 `style` → Tailwind class 교체. **신규 .css 파일 생성 X.**

### §9.2 사용 가능 자원 (모두 보호 — 1 byte 변경 0)

- `tokens.css` v0.1.1 (이미 정의됨)
- `typography.css` (이미 정의됨)
- `design-system.md` v0.1.1 (이미 정의됨)
- `tailwind.config.js` theme (이미 정의됨)

### §9.3 인라인 style 화이트리스트 (TSX 변환 후 잔존 OK)

- `style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}` — 동적 회전 (Tailwind class 로 표현 X)
- `style={{ transform: open ? 'translateX(0)' : 'translateX(-100%)' }}` — 동적 슬라이드 (open prop 기반)
- `style={{ opacity: open ? 1 : 0 }}` — 동적 opacity
- `style={{ pointerEvents: open ? 'all' : 'none' }}` — 동적 분기
- `style={{ background: 'linear-gradient(135deg,#1d4ed8,#0ea5e9)' }}` — SideMenu 아바타 (OQ #3 LOCKED 보존)
- `` style={{ background: `${color}22` }} `` — PermBadge 16% alpha 동적 색상 합성

**사유 코멘트 룰:** 인라인 style 잔존 시 `// 동적 분기 / 그라데이션 보존 / alpha 합성` 등 의도 명시.

### §9.4 components.css 신규 X — design-tokens 의존도

| 자원 | 위치 | W7~W10 변경 |
|---|---|---|
| tokens.css | `cha-bio-safety/src/styles/tokens.css` | 0 byte |
| typography.css | `cha-bio-safety/src/styles/typography.css` | 0 byte |
| design-system.md | `cha-bio-safety/docs/redesign-context/31-chrome/design-system.md` | 0 byte |
| tailwind.config.js | `cha-bio-safety/tailwind.config.js` | 0 byte |
| 페이지별 components.css | 없음 (chrome 패턴) | 신규 0 |

---

## §10. Tailwind cheatsheet (legacy alias → v0.1.1 토큰 → Tailwind class)

| legacy alias | v0.1.1 토큰 | Tailwind class | 비고 |
|---|---|---|---|
| `var(--bg)` | `--surface-page` | `bg-surface-page` | body |
| `var(--bg2)` | `--surface-raised` | `bg-surface-raised` | panel 배경 |
| `var(--bg3)` | `--surface-sunken` | `bg-surface-sunken` | Row / 작은 카드 |
| `var(--bg4)` | `--surface-active` | `bg-surface-active` | Toggle off / hover |
| `var(--bd)` | `--border-default` | `border-border-default` | 기본 테두리 |
| `var(--bd2)` | `--border-strong` | `border-border-strong` | 강조 테두리 |
| `var(--t1)` | `--text-primary` | `text-text-primary` | 본문 |
| `var(--t2)` | `--text-secondary` | `text-text-secondary` | 보조 |
| `var(--t3)` | `--text-tertiary` | `text-text-tertiary` | 캡션 / 메타 |
| `var(--danger)` (text) | `--status-danger` | `text-status-danger` | 위험 텍스트 |
| `var(--danger)` (bar) | `--status-danger-bar` | `bg-status-danger-bar` | 위험 배지 채움 |
| `var(--safe)` | `--status-safe-bar` | `bg-status-safe-bar` | 안전 배지 |
| `var(--acl)` | `--accent` | `bg-accent` | 기본 accent 버튼 |
| raw `#2563eb` (Toggle on) | `--accent-active` | `bg-accent-active` | OQ W5-A LOCKED |
| raw `#fff` (Toggle thumb / 버튼 텍스트) | `--text-on-accent` | `text-text-on-accent` 또는 `bg-[#fff]` (thumb) | thumb 는 raw 유지 OK |
| raw `#dc2626` (로그아웃) | `--status-danger` (라이트 #991b1b / 다크 #f87171) | `text-status-danger` + `bg-status-danger-bg` + `border-status-danger-bar/40` | 로그아웃 |
| raw `rgba(220,38,38,0.12)` | `--status-danger-bg` (라이트 #fee2e2 / 다크 rgba(239,68,68,0.16)) | `bg-status-danger-bg` | 로그아웃 배경 |
| raw `rgba(220,38,38,0.25)` | (border alpha) | `border-status-danger-bar/40` (Tailwind arbitrary alpha) | 로그아웃 border |
| raw `#22c55e` (PermBadge granted) | `--status-safe-bar` | `text-status-safe-bar` + `bg-status-safe-bar/16` | PermBadge |
| raw `#ef4444` (PermBadge denied) | `--status-danger-bar` | `text-status-danger-bar` + `bg-status-danger-bar/16` | PermBadge |
| raw `#6e7681` (PermBadge default) | `--text-tertiary` | `text-text-tertiary` | PermBadge |
| `linear-gradient(135deg,#1d4ed8,#0ea5e9)` (SideMenu 아바타) | **보존** (OQ #3 LOCKED) | inline 또는 utility class | 그라데이션 유지 |
| `linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)` (SettingsPanel 프로필) | `--accent-active` solid (OQ #4 LOCKED) | `bg-accent-active` | 폐기 |
| `rgba(0,0,0,0.65)` (오버레이) | `--surface-overlay` (라이트 0.5 / 다크 0.6) | `bg-surface-overlay` 또는 `bg-black/65` | 오버레이 |
| `JetBrains Mono` | `--font-mono` | `font-mono` | badge 숫자 |

### §10.1 Tailwind class 메모리 룰 (필수 박제 — 박제 누락 사고 방지)

- **memory `feedback_tailwind_token_class_pattern`** — `status-` prefix 없음 (예: `text-status-fire-bar` O / `text-fire-bar` X / `status-fire` X). 단, `text-status-danger` 같이 색 토큰 전체명은 OK.
- **memory `feedback_tailwind_w8_h8_is_48px`** — tailwind.config.js spacing override:
  - `w-8 = h-8 = 48px` (기본 32 아님)
  - `w-7 = h-7 = 32px`
  - 44 px = `w-11 h-11`
  - 48 px = `w-8 h-8`
- **memory `feedback_text_caption_leading_none`** — `text-caption` lh 1.5 (18px) 가 h-8 (32px) 컨테이너 안에서도 시각적 패딩 → 작은 컨테이너는 `leading-none` 명시
- **memory `feedback_tsx_wave_emoji_dot_gap`** — alias sed-replace 만 하지 말고 sketch negative gate (이모지 0) + dot span 추가 markup 도 verify
- **memory `feedback_planner_prompt_sketch_verbatim`** — sketch CSS 정의 grep verbatim 인용

### §10.2 Tailwind cheatsheet 행 수

| 분류 | 항목 |
|---|---|
| 배경 (surface) | 4 (bg/bg2/bg3/bg4) |
| 보더 (border) | 2 (bd/bd2) |
| 텍스트 (text-*) | 3 (t1/t2/t3) |
| 상태 색 | 3 (danger text / danger bar / safe) |
| accent | 2 (acl / accent-active) |
| raw hex 교체 | 5 (#2563eb / #fff / #dc2626 / #22c55e / #ef4444 / #6e7681) |
| 그라데이션 | 2 (보존 1 / 폐기 1) |
| 오버레이 | 1 |
| 폰트 | 1 (JetBrains Mono) |
| **합계** | **23 행 (≥15 ✓)** |

---

## §11. negative gate (W7~W10 TSX verify, ≥20 항목)

1. **legacy alias body markup 0** — `grep -E "var\\(--(bg|bg2|bg3|bg4|bd|bd2|t1|t2|t3|acl|safe|warn|danger|fire|info)\\)" {파일}` → 0
   - 단 W8 SideMenu 의 NAV_H 상수 `'calc(54px + var(--sab, 0px))'` 는 safe-area 토큰 → 유지 OK
2. **raw hex body markup 0** — `grep -E "#[0-9a-fA-F]{3,8}" {파일}` → 그라데이션 1건 + thumb `#fff` 외 0
3. **`style={{` 인라인 0** — 불가피한 경우 사유 코멘트 (`// 동적 / 그라데이션 보존 / alpha 합성`)
4. **9·10·11 px 0** — `grep -E "fontSize: ?(9|10|11)[,$]|text-\\[(9|10|11)px\\]" {파일}` → 0
5. **`linear-gradient` 0 except OQ #3 보존** — SideMenu 아바타 1건만
6. **이모지 0** — `grep -P "[\\x{1F300}-\\x{1FAFF}\\x{2600}-\\x{27BF}]" {파일}` → 0 (`⏳🔔` 제거)
7. **`✕` 텍스트 글리프 0** — `grep -c "✕" {파일}` → 0 (Lucide X 교체)
8. **`status-` prefix class 단독 사용 0** — `grep -E "className=\".*status-(fire|safe|warning|danger|info)( |\")" {파일}` → 0 (`text-status-*` 전체명만)
9. **`w-8 / h-8` 함정 의식** — 의도적이면 OK (`cha-bio-safety/tailwind.config.js` spacing 8 = 48px)
10. **MENU 상수 변경 0** — SideMenu.tsx line 19~54 (다른 컴포넌트 import 의존 / Phase 18~21 마이그레이션 비즈)
11. **DEFAULT_SIDE_MENU 변경 0** — MenuSettingsSection.tsx line 9 import (utils/api.ts 책임)
12. **JSZip 비즈 변경 0** — SettingsPanel handleR2Backup/Restore
13. **NotificationPreferences 6 키 변경 0** — utils/api.ts type
14. **App.tsx 변경 0** — `cha-bio-safety/src/App.tsx` (chrome mount 위치 + isDesktop 분기 보존)
15. **tokens.css 변경 0** — `cha-bio-safety/src/styles/tokens.css` (v0.1.1 정의)
16. **typography.css 변경 0** — `cha-bio-safety/src/styles/typography.css` (7단계 scale)
17. **tailwind.config.js 변경 0** — `cha-bio-safety/tailwind.config.js` (spacing override / 토큰 alias)
18. **design-system.md 변경 0** — `cha-bio-safety/docs/redesign-context/31-chrome/design-system.md`
19. **31-chrome/ 기존 12 파일 변경 0** — wave-1-index.md + 4 source tsx + 4 sketch html + design-system.md + tokens.css + typography.css
20. **00-design-context/ 변경 0** — 디자인 룰 룩업
21. **PATH_LABEL / DESKTOP_ONLY_PATHS / ADMIN_PATHS 비즈 1 byte 변경 0** — MenuSettingsSection 정적 정의 유지
22. **6 collapsible localStorage 키 1 byte 변경 0** — `settings.notif/display/account/db/appinfo/menuSettings.collapsed`
23. **6 NotificationPreferences 키 1 byte 변경 0** — `daily_schedule/incomplete_schedule/unresolved_issue/education_reminder/event_15min/event_5min`
24. **chrome 컴포넌트 prop 시그니처 1 byte 변경 0** — 4 시그니처 + 11 subcomponent 시그니처

### §11.1 negative gate 합산

| 카테고리 | 항목 수 |
|---|---|
| markup-level negative | 9 (1~9) |
| 비즈 보호 0 byte | 6 (10~13 + 21~22 + 23) |
| 파일 보호 0 byte | 7 (14~20) |
| 시그니처 보호 | 1 (24) |
| **합계** | **24 항목 (≥15 ✓ / ≥20 ✓)** |

---

## §12. verify gate per sub-wave (W7~W10 atomic commit 전 자동 실행)

### §12.1 W7 GlobalHeader gate (≥8 항목)

- `test -f cha-bio-safety/src/components/GlobalHeader.tsx`
- `grep -c "GlobalHeaderProps" cha-bio-safety/src/components/GlobalHeader.tsx` ≥ 2
- `grep -c "M4 6h16M4 12h16M4 18h16" cha-bio-safety/src/components/GlobalHeader.tsx` = 1 (햄버거 path 보존)
- `grep -c "leftSlot \\?\\?" cha-bio-safety/src/components/GlobalHeader.tsx` = 1
- `grep -c "rightSlot \\|\\|" cha-bio-safety/src/components/GlobalHeader.tsx` = 1
- `grep -cE "fontSize: ?(9|10|11)[,$]" cha-bio-safety/src/components/GlobalHeader.tsx` = 0
- `grep -cE "var\\(--(bg|bg2|bg3|bg4|bd|bd2|t1|t2|t3|acl)\\)" cha-bio-safety/src/components/GlobalHeader.tsx` = 0
- `git diff --stat` 보호 파일 17개 모두 빈 줄 (0 byte)
- `cd cha-bio-safety && npx tsc --noEmit` 0 errors
- `cd cha-bio-safety && npm run build` PASS

### §12.2 W8 SideMenu gate (≥10 항목)

- `test -f cha-bio-safety/src/components/SideMenu.tsx`
- `grep -c "const MENU" cha-bio-safety/src/components/SideMenu.tsx` = 1 (line 19 verbatim 유지)
- `grep -c "import { X } from 'lucide-react'" cha-bio-safety/src/components/SideMenu.tsx` = 1
- `grep -c "✕" cha-bio-safety/src/components/SideMenu.tsx` = 0
- `grep -c "linear-gradient" cha-bio-safety/src/components/SideMenu.tsx` = 1 (아바타 그라데이션만)
- `grep -c "1d4ed8" cha-bio-safety/src/components/SideMenu.tsx` = 1 (OQ #3 보존)
- `grep -c "82%" cha-bio-safety/src/components/SideMenu.tsx` = 1 (panel width OQ #7)
- `grep -cE "fontSize: ?(9|10|11)[,$]" cha-bio-safety/src/components/SideMenu.tsx` = 0
- `grep -cE "var\\(--(bg2|bg3|bg4|t1|t2|t3|danger|acl)\\)" cha-bio-safety/src/components/SideMenu.tsx` = 0
- `cd cha-bio-safety && npx tsc --noEmit` 0 errors
- `cd cha-bio-safety && npm run build` PASS

### §12.3 W9 SettingsPanel gate (≥15 항목)

- `test -f cha-bio-safety/src/components/SettingsPanel.tsx`
- `grep -c "import.*Loader2\|Send" cha-bio-safety/src/components/SettingsPanel.tsx` ≥ 1 (Lucide 신규)
- `grep -c "import { ChevronRight, X, Send, Loader2 } from 'lucide-react'" cha-bio-safety/src/components/SettingsPanel.tsx` = 1
- `grep -c "⏳\|🔔" cha-bio-safety/src/components/SettingsPanel.tsx` = 0 (OQ #6 LOCKED)
- `grep -c "✕" cha-bio-safety/src/components/SettingsPanel.tsx` = 0 (OQ #A LOCKED)
- `grep -c "M10.325 4.317" cha-bio-safety/src/components/SettingsPanel.tsx` = 1 (gear svg path 보존)
- `grep -c "linear-gradient.*7c3aed" cha-bio-safety/src/components/SettingsPanel.tsx` = 0 (OQ #4 폐기)
- `grep -c "bg-accent-active" cha-bio-safety/src/components/SettingsPanel.tsx` ≥ 1
- `grep -c "88%" cha-bio-safety/src/components/SettingsPanel.tsx` = 1 (panel width OQ #7)
- `grep -c "settings\\.notif\\.collapsed\|settings\\.display\\.collapsed\|settings\\.account\\.collapsed\|settings\\.db\\.collapsed\|settings\\.appinfo\\.collapsed" cha-bio-safety/src/components/SettingsPanel.tsx` = 5
- `grep -c "daily_schedule\|incomplete_schedule\|unresolved_issue\|education_reminder\|event_15min\|event_5min" cha-bio-safety/src/components/SettingsPanel.tsx` = 6 (NotificationPreferences)
- `grep -c "JSZip" cha-bio-safety/src/components/SettingsPanel.tsx` ≥ 2 (비즈 보존)
- `grep -c "/database/r2-list\|/database/backup-status\|/database/r2-download\|/database/r2-upload\|/database/backup\|/database/restore" cha-bio-safety/src/components/SettingsPanel.tsx` ≥ 6
- `grep -c "#dc2626" cha-bio-safety/src/components/SettingsPanel.tsx` = 0 (로그아웃 토큰화)
- `grep -cE "fontSize: ?(9|10|11)[,$]" cha-bio-safety/src/components/SettingsPanel.tsx` = 0
- `grep -cE "var\\(--(bg|bg2|bg3|bg4|bd|bd2|t1|t2|t3|danger|safe|warn|acl)\\)" cha-bio-safety/src/components/SettingsPanel.tsx` = 0
- `cd cha-bio-safety && npx tsc --noEmit` 0 errors
- `cd cha-bio-safety && npm run build` PASS
- chunk 시각 측정 (kB before/after)

### §12.4 W10 MenuSettingsSection gate (≥10 항목)

- `test -f cha-bio-safety/src/components/MenuSettingsSection.tsx`
- `grep -c "import { MENU } from './SideMenu'" cha-bio-safety/src/components/MenuSettingsSection.tsx` = 1
- `grep -c "DEFAULT_SIDE_MENU" cha-bio-safety/src/components/MenuSettingsSection.tsx` ≥ 2 (비즈 보존)
- `grep -c "PATH_LABEL\|DESKTOP_ONLY_PATHS\|ADMIN_PATHS" cha-bio-safety/src/components/MenuSettingsSection.tsx` ≥ 6
- `grep -c "5000" cha-bio-safety/src/components/MenuSettingsSection.tsx` = 1 (5s auto-dismiss)
- `grep -c "기본 배치로 되돌릴까요\|+ 구분선 추가\|설정 저장\|기본값으로 초기화\|삭제할까요" cha-bio-safety/src/components/MenuSettingsSection.tsx` = 5
- `grep -c "#2563eb" cha-bio-safety/src/components/MenuSettingsSection.tsx` = 0 (W5 OQ Toggle 토큰화)
- `grep -c "bg-accent-active" cha-bio-safety/src/components/MenuSettingsSection.tsx` ≥ 1 (ToggleSmall on)
- `grep -cE "fontSize: ?(9|10|11)[,$]" cha-bio-safety/src/components/MenuSettingsSection.tsx` = 0
- `grep -cE "var\\(--(bg3|bg4|bd2|t1|t2|t3|danger|acl)\\)" cha-bio-safety/src/components/MenuSettingsSection.tsx` = 0
- `cd cha-bio-safety && npx tsc --noEmit` 0 errors
- `cd cha-bio-safety && npm run build` PASS

### §12.5 보호 파일 git diff 0 byte (4 sub-wave 모두 공통)

매 sub-wave commit 전 실행:
```bash
git diff --stat \
  cha-bio-safety/src/App.tsx \
  cha-bio-safety/src/styles/tokens.css \
  cha-bio-safety/src/styles/typography.css \
  cha-bio-safety/tailwind.config.js \
  cha-bio-safety/docs/redesign-context/00-design-context/ \
  cha-bio-safety/docs/redesign-context/31-chrome/wave-1-index.md \
  cha-bio-safety/docs/redesign-context/31-chrome/GlobalHeader.tsx \
  cha-bio-safety/docs/redesign-context/31-chrome/SideMenu.tsx \
  cha-bio-safety/docs/redesign-context/31-chrome/SettingsPanel.tsx \
  cha-bio-safety/docs/redesign-context/31-chrome/MenuSettingsSection.tsx \
  cha-bio-safety/docs/redesign-context/31-chrome/sketch-wave-2-global-header.html \
  cha-bio-safety/docs/redesign-context/31-chrome/sketch-wave-3-side-menu.html \
  cha-bio-safety/docs/redesign-context/31-chrome/sketch-wave-4-settings-panel.html \
  cha-bio-safety/docs/redesign-context/31-chrome/sketch-wave-5-menu-settings-section.html \
  cha-bio-safety/docs/redesign-context/31-chrome/design-system.md \
  cha-bio-safety/docs/redesign-context/31-chrome/tokens.css \
  cha-bio-safety/docs/redesign-context/31-chrome/typography.css
```
출력이 **빈 줄** 이어야 함 (0 byte 변경).

### §12.6 verify gate 합산

| sub-wave | 항목 수 |
|---|---|
| W7 GlobalHeader | 10 |
| W8 SideMenu | 11 |
| W9 SettingsPanel | 18 |
| W10 MenuSettingsSection | 12 |
| §12.5 보호 파일 공통 | 17 paths |
| **합계 항목** | **51 + 17 paths** |

---

## §13. 메모리 룰 inline 인용 (≥12 unique slug + chrome 특화 Phase 21 박제)

### 룰 1 — `feedback_design_sketch_first.md`
시각 작업에서 코드 작성 전 sketch HTML 시안 먼저 → 사용자 컨펌 → TSX 변환. W2~W5 sketch 가 컨펌됨 → W7~W10 변환 진입.

### 룰 2 — `feedback_planner_prompt_sketch_verbatim.md`
TSX 변환 wave 시 sketch CSS 정의를 grep 으로 추출해 그대로 인용. §6 의 각 sketch HTML grep verbatim references 가 본 룰 적용 산물.

### 룰 3 — `feedback_tailwind_token_class_pattern.md`
status- prefix 없음 (text-status-fire-bar O / status-fire X). §10 Tailwind cheatsheet 의 토큰명 칼럼이 박제.

### 룰 4 — `feedback_tailwind_w8_h8_is_48px.md`
tailwind.config.js spacing override: w-8=48px (기본 32 아님). §10.1 박제.

### 룰 5 — `feedback_text_caption_leading_none.md`
text-caption lh 1.5 가 작은 컨테이너에서 시각 패딩 → leading-none 명시. §7 격상 표의 24+건이 본 룰 적용.

### 룰 6 — `feedback_tsx_wave_emoji_dot_gap.md`
alias sed-replace 만 X. sketch negative gate (이모지 0) + dot span 추가 markup 도 verify. §11 negative gate 6번 이모지 0 박제.

### 룰 7 — `feedback_tsx_wave_stat_card_drift.md`
executor 가 source outline 패턴 보존, sketch 새 패턴 누락 가능. plan 에 verbatim 인용 + verify gate 권장. §6 + §12 박제.

### 룰 8 — `feedback_avoid_premature_confirmation.md`
시각 작업에서 "거의 일치" 자신감 표현 X. 결과 보여주고 사용자 판단.

### 룰 9 — `feedback_check_branch_before_edit.md`
main 단일-trunk 운영. main 아니거나 dirty 면 편집/배포 전 사용자에게 먼저 컨펌.

### 룰 10 — `feedback_cbc7119_design_never_wrangler.md`
디자인 wave 중 wrangler --project-name=cbc7119 절대 X. main push 자동 cbc7119-preview 만.

### 룰 11 — `feedback_redesign_sketch_rule_enforcement.md`
시안 작성 시 디자인 룰 강제: negative rule (위험 임계치 아닌 카드는 status 색 금지), §6.2/§6.3/§7.1 일관성.

### 룰 12 — `feedback_sketch_realistic_data.md`
재디자인 시안은 디자인만. 표시 분기/라벨 룰은 코드 그대로.

### 룰 13 (chrome 특화 추가) — `feedback_inspection_unresolved_color.md`
미조치 색 = status-fire (주황). §5.2 W3-OQ #B 의 SideMenu badge `var(--danger)` → 향후 fire 전환 검토 노트 박제.

### 룰 14 (chrome 특화 추가) — `feedback_body_scroll_lock_safe_area.md`
body position:fixed iOS safe-area 깨뜨림. SideMenu (line 89~103) 의 `document.body.style.overflow='hidden'` + touchmove 차단 패턴이 본 룰의 정착 패턴 (f89ab71). SettingsPanel (line 409~418) 은 touchmove only — 다른 분기.

### 룰 15 (chrome 특화 박제) — Phase 18~21 migrateLegacyMenuConfig

- **Phase 18** — 평면 SideMenuEntry[] 도입 — `appliedEntries: SideMenuEntry[]` (SideMenu line 66~70) + `MenuSettingsSection` 분리 마운트 (SettingsPanel line 753)
- **Phase 21** — utils/api.ts 의 settingsApi 가 legacy MenuConfig (그룹 형식) → 평면 SideMenuEntry[] 자동 변환. **컴포넌트는 평면 형식만 다룸 → 본 변환은 utils/api.ts 책임 → MenuSettingsSection / SideMenu 비즈 1 byte 변경 0**
- **DEFAULT_SIDE_MENU export** 도 utils/api.ts — W7~W10 import 만 사용

### §13.1 메모리 룰 합산

| 분류 | 룰 수 |
|---|---|
| 일반 변환 룰 (1~12) | 12 |
| chrome 특화 추가 룰 (13~14) | 2 |
| Phase 21 박제 (15) | 1 |
| **합계** | **15 룰 (≥12 ✓)** |

---

## §14. SW1~SW4 atomic commit 룰

| sub-wave | 브랜치 | atomic commit | 정상 PR | cbc7119-preview 자동 배포 |
|---|---|---|---|---|
| W7 | redesign/31-chrome | `redesign(31-chrome): W7 GlobalHeader TSX 변환 (45→~35 라인)` | main 머지 | 자동 |
| W8 | redesign/31-chrome | `redesign(31-chrome): W8 SideMenu TSX 변환 (201→~180 라인)` | main 머지 | 자동 |
| W9 | redesign/31-chrome | `redesign(31-chrome): W9 SettingsPanel TSX 변환 (894→~750 라인)` | main 머지 | 자동 |
| W10 | redesign/31-chrome | `redesign(31-chrome): W10 MenuSettingsSection TSX 변환 (418→~370 라인)` | main 머지 | 자동 |

**순서 권장:** **W7 (가장 작음) → W10 (subcomponents-only) → W8 (MENU 의존, route 영향) → W9 (가장 큼)**.

### §14.1 sub-wave 별 위험도 매트릭스

| sub-wave | 변경 라인 | 의존 컴포넌트 | 위험도 |
|---|---|---|---|
| W7 GlobalHeader | ~10 라인 감소 | 모든 페이지 import | 낮음 (인터페이스 보존) |
| W10 MenuSettingsSection | ~48 라인 감소 | SettingsPanel 만 | 중 (subcomponents 4종) |
| W8 SideMenu | ~21 라인 감소 | App.tsx (mount) + MenuSettingsSection (MENU import) | 중-높 (route 영향) |
| W9 SettingsPanel | ~144 라인 감소 | App.tsx (mount) | 높 (volume + Lucide 추가) |

### §14.2 atomic commit 절대 룰

- sub-wave 1개당 정확히 1 commit (분할 X)
- commit message 는 위 §14 표의 형식 그대로 (`redesign(31-chrome): WN ...`)
- commit 전 §12 verify gate 모두 PASS 강제
- main 머지는 사용자 컨펌 후 (memory `feedback_design_sketch_first.md` — 시각 작업 컨펌 룰 확장)
- 본 워크트리는 wrangler / npm run deploy 금지 (memory `feedback_cbc7119_design_never_wrangler.md`)

---

## 최종 negative_gates re-statement (markdown 본문 끝 박제)

W6 자체 산출 = wave-6-tsx-conversion-checklist.md **1 파일만**.

본 wave 의 모든 보호 파일 변경 0 (1 byte 변경 0):

- `cha-bio-safety/src/` 전체 (4 chrome 컴포넌트 포함)
- `cha-bio-safety/src/App.tsx`
- `cha-bio-safety/src/styles/tokens.css`
- `cha-bio-safety/src/styles/typography.css`
- `cha-bio-safety/tailwind.config.js`
- `cha-bio-safety/docs/redesign-context/00-design-context/`
- `cha-bio-safety/docs/redesign-context/31-chrome/` 기존 12 파일 모두

`git status` 의 변경 파일 목록은 정확히 `cha-bio-safety/docs/redesign-context/31-chrome/wave-6-tsx-conversion-checklist.md` 하나여야 함 (1 byte 변경 0 강제).

---

## 부록 A. precedent 비교 (14-reports / 15-daily-report / 18-worklog)

| precedent | 라인 수 | scope | chrome W6 와 차이 |
|---|---|---|---|
| 14-reports/wave-7-tsx-conversion-checklist.md | 700 | 1 page (ReportsPage + 4 modal) | 본 W6 은 4 컴포넌트 통합 — 1.5~2배 예상 |
| 15-daily-report/wave-7-tsx-conversion-checklist.md | 934 | 1 page + 캘리브 좌표 시스템 100% 보존 | 본 W6 은 캘리브 없음 / 4 chrome 컴포넌트 (모든 페이지 import) |
| 18-worklog/wave-7-tsx-conversion-checklist.md | 477 | 1 page + 표 sticky scroll | 본 W6 은 4 컴포넌트 통합 + Phase 18~21 박제 |

본 W6 은 4 컴포넌트 통합이라 라인 수 가장 큼 (~1100~1500).

## 부록 B. 본 checklist verify (self-verify gate)

본 wave-6 markdown 자체의 verify gate (commit 전 self-verify):

- `grep -c "^## §[0-9]" wave-6-tsx-conversion-checklist.md` → ≥ 12 (12 섹션 헤더 모두 존재)
- `grep -c "^### §[0-9]" wave-6-tsx-conversion-checklist.md` → ≥ 30 (sub-section 풍부)
- `grep -c "^| " wave-6-tsx-conversion-checklist.md` → ≥ 200 (표 행 누적)
- `grep -c "GlobalHeader\|SideMenu\|SettingsPanel\|MenuSettingsSection" wave-6-tsx-conversion-checklist.md` → ≥ 80 (4 컴포넌트 모두 풍부 인용)
- `grep -c "sketch-wave-[2345]" wave-6-tsx-conversion-checklist.md` → ≥ 4 (4 sketch HTML 모두 reference)
- `grep -c "OQ.*LOCKED" wave-6-tsx-conversion-checklist.md` → ≥ 10
- `grep -c "feedback_\|memory" wave-6-tsx-conversion-checklist.md` → ≥ 12 (메모리 룰 12 slug)
- `grep -c "1 byte 변경 0" wave-6-tsx-conversion-checklist.md` → ≥ 10
- `wc -l wave-6-tsx-conversion-checklist.md` → ≥ 1100 (precedent 477~934 라인의 1.5~2배)

## 부록 C. atomic commit message (W6 본 wave)

본 wave-6 의 atomic 1-commit:

```
docs(31-chrome): W6 TSX 변환 verify checklist 추가 (W7~W10 4 분할 진입점)

- cha-bio-safety/docs/redesign-context/31-chrome/wave-6-tsx-conversion-checklist.md 단일 생성
- 4 컴포넌트 (GlobalHeader 45 / SideMenu 201 / SettingsPanel 894 / MenuSettingsSection 418) 통합 1 파일
- §1~§14 헤더 + 비즈 anchor 112건 + OQ LOCKED 11+ + sketch HTML 4 reference + 폰트 격상 43 + Tailwind cheatsheet
- W7~W10 atomic 1-commit per sub-wave (OQ #8 LOCKED)
- 보호 파일 git diff 0 byte 모두 (src/ + App.tsx + tokens.css + typography.css + tailwind.config + 31-chrome/ 기존 12)
- precedent: 14-reports / 15-daily-report / 18-worklog wave-7-tsx-conversion-checklist.md
```

---

## 부록 D. GlobalHeader 변환 예시 (W7 — before / after)

### D.1 source verbatim (45 라인 → 본 verify gate 의 grep target)

```typescript
// GlobalHeader.tsx — source line 1~45
interface GlobalHeaderProps {
  title: string
  onMenuOpen: () => void
  rightSlot?: React.ReactNode
  leftSlot?: React.ReactNode  // 햄버거 대신 표시 (예: 뒤로가기 버튼)
}

export function GlobalHeader({ title, onMenuOpen, rightSlot, leftSlot }: GlobalHeaderProps) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      height: 48,
      padding: '0 12px',
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--bd)',
      flexShrink: 0,
    }}>
      {leftSlot ?? (
        <button
          onClick={onMenuOpen}
          aria-label="메뉴 열기"
          style={{
            width: 32, height: 32, borderRadius: 7,
            background: 'var(--bg3)', border: 'none',
            color: 'var(--t2)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="var(--t2)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      )}
      <span style={{
        flex: 1, textAlign: rightSlot ? 'left' : 'center',
        fontSize: 13, fontWeight: 700, color: 'var(--t1)',
        marginLeft: rightSlot ? 8 : 0,
      }}>
        {title}
      </span>
      {rightSlot || <div style={{ width: 32 }} />}
    </header>
  )
}
```

### D.2 변환 target (W7 atomic — Tailwind class 교체)

```typescript
// GlobalHeader.tsx — W7 후 (예상 ~35 라인)
interface GlobalHeaderProps {
  title: string
  onMenuOpen: () => void
  rightSlot?: React.ReactNode
  leftSlot?: React.ReactNode  // 햄버거 대신 표시 (예: 뒤로가기 버튼)
}

export function GlobalHeader({ title, onMenuOpen, rightSlot, leftSlot }: GlobalHeaderProps) {
  return (
    <header className="flex items-center h-12 px-3 bg-surface-raised border-b border-border-default shrink-0">
      {leftSlot ?? (
        <button
          onClick={onMenuOpen}
          aria-label="메뉴 열기"
          className="w-7 h-7 rounded-[7px] bg-surface-sunken text-text-secondary cursor-pointer flex items-center justify-center border-0"
        >
          {/* OQ #5 LOCKED — 인라인 svg path verbatim */}
          <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      )}
      <span
        className={`flex-1 text-title font-bold text-text-primary ${rightSlot ? 'text-left ml-2' : 'text-center'}`}
      >
        {title}
      </span>
      {rightSlot || <div className="w-7" />}
    </header>
  )
}
```

### D.3 W7 변환 핵심 매핑 (D.1 → D.2)

| 항목 | before | after |
|---|---|---|
| `<header>` style | inline 7 prop | `flex items-center h-12 px-3 bg-surface-raised border-b border-border-default shrink-0` |
| `height: 48` | 48px raw | `h-12` (Tailwind spacing — 12 = 48px) |
| `padding: '0 12px'` | inline | `px-3` (12 = 3 × 4) |
| `var(--bg2)` | legacy alias | `bg-surface-raised` |
| `var(--bd)` | legacy alias | `border-border-default` |
| `flexShrink: 0` | inline | `shrink-0` |
| 햄버거 button 32×32 | inline width/height 32 | `w-7 h-7` (7 = 32px ✓ tailwind override) |
| 햄버거 svg 15×15 | inline width/height 15 | `width={20} height={20}` (size 격상 — 시각성) |
| `var(--bg3)` | legacy alias | `bg-surface-sunken` |
| `var(--t2)` | legacy alias | `text-text-secondary` |
| title fontSize 13 | inline | `text-title` (18px) — 노안 격상 |
| `var(--t1)` | legacy alias | `text-text-primary` |
| right placeholder | `width: 32` inline | `w-7` (32px) |

### D.4 W7 변환 후 grep 검증 예시

```bash
# fontSize 9·10·11 0 hit
grep -E "fontSize: ?(9|10|11)[,$]|text-\[(9|10|11)px\]" cha-bio-safety/src/components/GlobalHeader.tsx
# (출력 없음)

# legacy alias 0 hit
grep -E "var\(--(bg|bg2|bg3|bg4|bd|bd2|t1|t2|t3|acl)\)" cha-bio-safety/src/components/GlobalHeader.tsx
# (출력 없음)

# 햄버거 svg path 보존
grep -c "M4 6h16M4 12h16M4 18h16" cha-bio-safety/src/components/GlobalHeader.tsx
# 1

# leftSlot ?? 보존
grep -c "leftSlot ??" cha-bio-safety/src/components/GlobalHeader.tsx
# 1

# rightSlot || 보존
grep -c "rightSlot ||" cha-bio-safety/src/components/GlobalHeader.tsx
# 1
```

---

## 부록 E. SideMenu 11 subcomponent 영역 라인 매트릭스 (W8)

| 영역 | source line | 주된 변경 | 1 byte 변경 0 |
|---|---|---|---|
| imports (line 1~7) | 7 | + `import { X } from 'lucide-react'` | 기존 7 |
| NAV_H 상수 (line 9) | 1 | 보존 | 1 |
| Props interface (line 11~15) | 5 | 보존 | 5 |
| MenuItem type export (line 17) | 1 | 보존 | 1 |
| MENU 상수 (line 19~54) | 36 | **변경 0 강제** (MENU 비즈) | 36 |
| ITEM_META (line 56~57) | 2 | 보존 | 2 |
| 메인 함수 (line 59~) | 143 | inline → class | (변환) |
| 오버레이 (line 110~119) | 10 | `rgba(0,0,0,0.65)` → `bg-black/65` | (변환) |
| panel position fixed (line 122~133) | 12 | `var(--sat,0px)` 보존 + class | (혼합) |
| 헤더 (line 135~142) | 8 | `✕` → `<X size={14} />` | (변환) |
| 메뉴 목록 (line 145~184) | 40 | item / soon / badge 분기 | (변환) |
| 사용자 카드 (line 186~197) | 12 | 아바타 그라데이션 보존 (OQ #3) | (혼합) |

### E.1 SideMenu MENU 상수 17 아이템 (line 19~54 — 1 byte 변경 0)

| section | items |
|---|---|
| 주요 기능 | 대시보드 / 일반 점검 / QR 스캔 / 조치 관리 / 승강기 관리 |
| 시설 관리 | DIV 압력 관리 / 소화기 관리 (desktopOnly) / CCTV 현황 (desktopOnly) / 소방 시설 도면 / 소방 점검 관리 / 소방 시설 추가 (admin) |
| 문서 관리 | 일일 업무 일지 / 업무 수행 기록표 (admin) / 월간 점검 계획 / 월간 출근부 / 연간 업무 추진 계획 / 소방계획서·훈련자료 / 점검 일지 출력 / QR 코드 출력 |
| 근무·복지 | 연차 및 식사 / 보수교육 |
| 시스템 | 직원 관리 (admin) |

총 22 아이템 (visible 18 + admin 3 + desktopOnly 1 중복) — line 19~54 36 라인 verbatim 보존.

### E.2 SideMenu W8 OQ LOCKED 적용 매트릭스

| line | 영역 | OQ | LOCKED 답 |
|---|---|---|---|
| 126 | panel width 82% / max 300 | OQ #7 | 보존 |
| 131 | borderRadius `'0 16px 16px 0'` | OQ #7 | 보존 |
| 141 | ✕ 텍스트 글리프 | W3-OQ #A | Lucide X size 14 |
| 149 | divider 9px → 12px leading-none uppercase | OQ #2 | 격상 |
| 177 | badge `var(--danger)` | W3-OQ #B | 현재 유지 + alias v0.1.1 |
| 189 | 아바타 `linear-gradient(135deg,#1d4ed8,#0ea5e9)` | OQ #3 | 보존 |

---

## 부록 F. SettingsPanel 11 subcomponent 영역 라인 매트릭스 (W9)

| subcomponent | source line | 주된 변경 | 비즈 보존 |
|---|---|---|---|
| SectionHeader | 6~27 | inline → class + ChevronRight rotate 90deg | label/collapsed/onToggle 시그니처 |
| usePersistedCollapse | 29~41 | hook 본문 1 byte 변경 0 | localStorage 키 6개 보존 |
| Toggle | 57~77 | `#2563eb` → `bg-accent-active` (W5 OQ) | 38×21 치수 보존 |
| PermBadge | 80~93 | granted/denied alpha 합성 inline 유지 | 3 상태 분기 보존 |
| Row | 96~106 | bg `var(--bg3)` → `bg-surface-sunken` | label/sub/children/onClick 시그니처 |
| ChangePasswordForm | 109~145 | inline → class | bcrypt mutation 보존 |
| NameEditModal | 148~180 | inline → class + maxLength 20 | currentName/onClose/onSave 시그니처 |
| ProfileEditForm | 183~277 | inline → class + 8 필드 | 8 필드 + appointedAt slice 보존 |
| 메인 함수 (line 280~) | 614 | volume 큼 — Lucide 신규 추가 (X/Send/Loader2) | 모든 비즈 보존 |

### F.1 SettingsPanel 6 collapsible localStorage 키 (1 byte 변경 0)

| key | default | 영역 |
|---|---|---|
| `settings.notif.collapsed` | true | 알림 섹션 |
| `settings.display.collapsed` | true | 화면 섹션 |
| `settings.account.collapsed` | true | 계정 섹션 |
| `settings.db.collapsed` | true | DB 섹션 (admin only) |
| `settings.appinfo.collapsed` | true | 앱 정보 섹션 |
| `menuSettings.collapsed` | true | 메뉴 설정 섹션 (MenuSettingsSection 내부) |

### F.2 SettingsPanel NotificationPreferences 6 키 (1 byte 변경 0)

| key | default | 의미 |
|---|---|---|
| `daily_schedule` | true | 일일 일정 알림 |
| `incomplete_schedule` | true | 미완료 일정 알림 |
| `unresolved_issue` | true | 미조치 이슈 알림 |
| `education_reminder` | true | 교육 리마인더 |
| `event_15min` | true | 이벤트 15분 전 |
| `event_5min` | true | 이벤트 5분 전 |

### F.3 SettingsPanel 4 SVG path (OQ #5 LOCKED — 인라인 유지)

| line | path 의미 | Lucide 교체 X 사유 |
|---|---|---|
| 664 | gear (설정) | OQ #5 LOCKED — 인라인 svg 보존 |
| 809 | DB 백업 (다운로드 화살표) | OQ #5 확장 — gear 와 동일 정책 |
| 822 | DB 복원 (업로드 화살표) | OQ #5 확장 |
| 838 | R2 백업 (이미지) | OQ #5 확장 |
| 851 | R2 복원 (업로드) | OQ #5 확장 |

---

## 부록 G. MenuSettingsSection 4 subcomponent 라인 매트릭스 (W10)

| subcomponent | source line | 주된 변경 | 비즈 보존 |
|---|---|---|---|
| ArrowButton | 336~354 | 32×32 → `w-7 h-7` (w-8 함정 회피) + class | dir up/down + disabled 시그니처 |
| ToggleSmall | 356~376 | `#2563eb` → `bg-accent-active` (W5 OQ #5-A) | 38×21 치수 + 17×17 thumb 보존 |
| DividerTitleInput | 378~402 | h40 maxLength 20 + ref.focus/select | initial/onCommit + Enter/Escape 이벤트 보존 |
| DeleteConfirmInline | 404~418 | 6px gap + `var(--danger)` → `bg-status-danger-bar` | onCancel/onConfirm 시그니처 |

### G.1 MenuSettingsSection PATH_LABEL / DESKTOP_ONLY_PATHS / ADMIN_PATHS (line 14~29 — 1 byte 변경 0)

| 정적 정의 | line | 내용 |
|---|---|---|
| `PATH_LABEL` | 14~19 | `MENU.forEach(s => s.items.forEach(i => { m[i.path] = i.label }))` 결과 |
| `DESKTOP_ONLY_PATHS` | 22~24 | `new Set(MENU items where desktopOnly === true)` |
| `ADMIN_PATHS` | 27~29 | `new Set(MENU items where role === 'admin')` |
| `newDividerId` | 32~34 | `d-${Date.now().toString(36)}-${Math.random()...}` |
| `entriesEqual` | 36~48 | length + type + path + visible + id + title 비교 |

### G.2 MenuSettingsSection 핸들러 9종 (line 97~149 — 1 byte 변경 0)

| handler | line | 의도 |
|---|---|---|
| `moveUp` | 97~104 | idx <= 0 guard + swap |
| `moveDown` | 105~112 | idx >= length -1 guard + swap |
| `toggleVisible` | 113~118 | item type only + `!visible` |
| `renameDivider` | 119~131 | trim().slice(0,20) + empty silent revert |
| `deleteDivider` | 132~136 | filter + null confirmDeleteIdx + clearTimeout |
| `addDivider` | 137~145 | newDividerId + '새 구분선' + setTimeout |
| `resetToDefaults` | 146~149 | DEFAULT_SIDE_MENU spread |
| `saveMutation` | 87~94 | settingsApi.saveMenu + toast |
| (확장) 5s auto-dismiss | 152~159 | setTimeout 5000 confirmDeleteIdx null |

### G.3 MenuSettingsSection 17 카피 verbatim (1 byte 변경 0)

| 카피 | line | 비고 |
|---|---|---|
| `메뉴 설정` | 173 | 헤더 |
| `새 구분선` | 142 | addDivider 기본값 |
| `숨김` | 263 | item invisible 배지 |
| `+ 구분선 추가` | 284 | 버튼 |
| `기본값으로 초기화` | 297 | 버튼 1차 |
| `기본 배치로 되돌릴까요?` | 295 | confirm 텍스트 |
| `초기화` | 300 | 빨강 버튼 |
| `삭제할까요?` | 410 | DeleteConfirmInline |
| `취소` | 412 | DeleteConfirmInline cancel |
| `삭제` | 415 | DeleteConfirmInline confirm |
| `설정 저장` | 320 | bottom 버튼 |
| `저장됨` | (mutation) | toast |
| `저장 실패` | (mutation) | toast |
| `대시보드` ~ 5섹션 17 라벨 | (MENU import) | line 19~54 보존 |

---

## 부록 H. Phase 18~21 메뉴 설정 마이그레이션 박제 (chrome 특화)

### H.1 Phase 18 (평면 SideMenuEntry[] 도입)

- **변경 위치:** SideMenu line 66~70 `appliedEntries: SideMenuEntry[]` 정의
- **비즈 의도:** 그룹 형식 `{section, items[]}` → 평면 `[{type:'divider'|'item', ...}]` 전환
- **W8 영향:** 인터페이스 보존, 렌더 함수만 변환
- **MenuSettingsSection 분리:** SettingsPanel line 753 `<MenuSettingsSection />` 마운트 — W9 변환 시 이 마운트 위치 보존

### H.2 Phase 21 (utils/api.ts 자동 마이그레이션)

- **변경 위치:** utils/api.ts (보호 파일 — 본 W7~W10 변경 0)
- **비즈 의도:** legacy 그룹 형식 응답 도착 시 자동으로 평면 형식 변환
- **컴포넌트 영향:** SideMenu / MenuSettingsSection 은 평면 SideMenuEntry[] 만 다룸 → 비즈 1 byte 변경 0
- **DEFAULT_SIDE_MENU:** utils/api.ts export — MenuSettingsSection 은 import 만 사용

### H.3 chrome 컴포넌트 의존도

| 컴포넌트 | utils/api 의존 항목 | 변경 0 |
|---|---|---|
| GlobalHeader | (없음) | ✓ |
| SideMenu | `settingsApi.getMenu`, `SideMenuEntry`, `MenuConfig` | ✓ |
| SettingsPanel | `authApi`, `pushApi`, `staffApi`, `NotificationPreferences` | ✓ |
| MenuSettingsSection | `settingsApi`, `SideMenuEntry`, `MenuConfig`, `DEFAULT_SIDE_MENU` | ✓ |

---

## 부록 I. 자주 실수 패턴 (executor 가이드)

### I.1 alias 일괄 sed-replace 의 함정 (memory `feedback_tsx_wave_emoji_dot_gap`)

- ❌ `sed -i 's/var(--bg)/bg-surface-page/g'` 만 하면 markdown 다른 패턴 누락
- ✅ §11 negative gate 20+ 항목을 1-by-1 grep 으로 확인

### I.2 w-8 / h-8 = 48px 함정 (memory `feedback_tailwind_w8_h8_is_48px`)

- ❌ 인라인 `width: 32` → `w-8` 자동 변환 (32px 기대) → 실제는 48px
- ✅ `cha-bio-safety/tailwind.config.js` 의 spacing override 확인 후 `w-7` (32) / `w-8` (48) 선택

### I.3 text-caption 작은 컨테이너 패딩 (memory `feedback_text_caption_leading_none`)

- ❌ h-7 / h-8 컨테이너 안에서 `text-caption` 만 → lh 1.5 (18px) 가 시각 패딩
- ✅ `text-caption leading-none` 명시 (§7 매트릭스 24+건 적용)

### I.4 status- prefix class 패턴 (memory `feedback_tailwind_token_class_pattern`)

- ❌ `text-fire-bar` / `bg-fire` / `status-fire`
- ✅ `text-status-fire-bar` / `bg-status-fire-bar` (전체명)

### I.5 sketch CSS 직접 격상 X (memory `feedback_planner_prompt_sketch_verbatim`)

- ❌ planner 가 sketch 안 보고 토큰명 추측 → 1 byte 변경 발생
- ✅ §6 의 sketch grep verbatim references 따르기

### I.6 source outline 패턴 보존 사고 (memory `feedback_tsx_wave_stat_card_drift`)

- ❌ source TSX 의 outline 만 보존, sketch 새 패턴 누락
- ✅ source + sketch 양쪽 anchor 모두 검증 — §4 + §6 동시 grep

### I.7 시각 변경 전 컨펌 (memory `feedback_design_changes_ask_first`)

- ❌ 버그라고 판단해 레이아웃 구조 변경
- ✅ panel 치수 / 색 / 폰트 격상 룰 따라가되, 시각 인상 변경 우려 시 사용자 컨펌

### I.8 cbc7119-design 워크트리 wrangler 금지 (memory `feedback_cbc7119_design_never_wrangler`)

- ❌ `wrangler pages deploy --project-name=cbc7119` (직원 도메인)
- ✅ main push 자동 cbc7119-preview 만 (W7~W10 4 atomic main 머지 → 자동 배포)

---

## 부록 J. W7 W8 W9 W10 외 잔존 검토 항목 (선택)

| 항목 | 상태 | 후속 quick 후보 |
|---|---|---|
| W3-OQ #B SideMenu badge fire 전환 | 보류 (현재 var(--danger) 유지) | 추후 별도 quick |
| testSending Lucide animate-spin 디테일 | W9 적용 | 본 W9 |
| 4 SVG path Lucide 마이그레이션 검토 | 보류 (OQ #5 LOCKED) | (long-term) |
| Toggle thumb 색상 `#fff` raw → `--text-on-accent` | 검토 | 추후 별도 quick |
| panel borderRadius variable 통일 | 검토 | 추후 별도 quick |
| chrome 컴포넌트 a11y aria-label 보강 | 검토 | (확장) |

본 W6 자체 wave 산출은 **wave-6-tsx-conversion-checklist.md 1 파일만** — 보호 파일 17개 변경 0 byte 강제 (1 byte 변경 0).
