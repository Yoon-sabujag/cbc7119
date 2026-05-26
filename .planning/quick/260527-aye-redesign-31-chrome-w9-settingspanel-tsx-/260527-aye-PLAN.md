---
phase: quick-260527-aye
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/components/SettingsPanel.tsx
autonomous: true
requirements:
  - W9-SETTINGSPANEL-TSX-ATOMIC
must_haves:
  truths:
    - "SettingsPanel.tsx 가 v0.1.1 디자인 토큰 기반 Tailwind class 로 변환되어 라이트/다크 자동 분기된다 (legacy alias var(--bg*)/var(--bd*)/var(--t*)/var(--acl)/var(--danger)/var(--safe) 0)"
    - "8 내부 컴포넌트 (SectionHeader / usePersistedCollapse / Toggle / PermBadge / Row / ChangePasswordForm / NameEditModal / ProfileEditForm) 시그니처 + 비즈 로직 1 byte 변경 0"
    - "JSZip 백업/복원 비즈 (handleDbBackup/handleDbRestore/handleR2Backup/handleR2Restore) 1 byte 변경 0 — 안전 직결"
    - "NotificationPreferences 6 키 (daily_schedule/incomplete_schedule/unresolved_issue/education_reminder/event_15min/event_5min) default true verbatim"
    - "OQ #4 LOCKED — 프로필 그라데이션 (#2563eb 0%, #7c3aed 100%) 폐기 → bg-accent-active solid"
    - "OQ #6 LOCKED — admin 테스트 푸시 이모지 (⏳🔔) 제거 → Lucide Loader2 (animate-spin) / Send"
    - "W3-OQ #A LOCKED — ✕ 텍스트 글리프 → Lucide X (size 14)"
    - "W5 OQ #5-A LOCKED — Toggle on bg (#2563eb raw) → bg-accent-active"
    - "OQ #7 LOCKED — panel width 88% / maxWidth 320 보존"
    - "OQ #5 LOCKED — gear svg path + 4 DB/R2 svg path verbatim 인라인 유지"
    - "노안 격상 22건 (9/10/11px → 12/13px) verbatim 적용 — fontSize 9/10/11 0 hit"
    - "보호 파일 17건 git diff 0 byte (App.tsx + 4 source tsx W7/W8/W10 + 31-chrome/ 12 파일 + tokens.css + typography.css + tailwind.config.js)"
    - "TypeScript 컴파일 0 errors (npx tsc --noEmit)"
  artifacts:
    - path: "cha-bio-safety/src/components/SettingsPanel.tsx"
      provides: "SettingsPanel chrome 컴포넌트 — Tailwind class 기반 + 인라인 잔존 6 예외 + 비즈 100% 보존"
      contains: "export function SettingsPanel"
  key_links:
    - from: "SettingsPanel.tsx"
      to: "MenuSettingsSection (W10 변환됨)"
      via: "import { MenuSettingsSection } from './MenuSettingsSection'"
      pattern: "import.*MenuSettingsSection.*MenuSettingsSection"
    - from: "SettingsPanel.tsx"
      to: "utils/api"
      via: "authApi / pushApi / staffApi / NotificationPreferences"
      pattern: "from '../utils/api'"
    - from: "SettingsPanel.tsx"
      to: "lucide-react"
      via: "ChevronRight + X + Send + Loader2"
      pattern: "import { ChevronRight, X, Send, Loader2 } from 'lucide-react'"
    - from: "SettingsPanel.tsx"
      to: "JSZip"
      via: "handleR2Backup/handleR2Restore"
      pattern: "import JSZip from 'jszip'"
---

<objective>
redesign/31-chrome 의 W9 — `SettingsPanel.tsx` (894 라인, chrome 4 컴포넌트 중 가장 큼) 단일 atomic TSX 변환. chrome 변환의 **마지막** wave.

Purpose:
- 인라인 `style={}` 마크업을 v0.1.1 디자인 토큰 기반 Tailwind class 로 교체 (가독성 + 라이트/다크 자동 분기)
- W4 sketch 에서 컨펌된 디자인 변경 (OQ #4 그라데이션 폐기 / OQ #6 이모지 제거 / W3-OQ #A ✕ → Lucide X / W5 OQ #5-A Toggle accent) 코드 반영
- 노안 격상 22건 (9/10/11 → 12/13) 통합 적용
- 비즈 anchor 40+ 항목 (JSZip 백업/Push notification/8 내부 컴포넌트/Profile 8 필드/6 collapsible localStorage) 1 byte 변경 0 강제

Output: `cha-bio-safety/src/components/SettingsPanel.tsx` 약 850~900 라인 — Tailwind class 가독성 + 인라인 6 예외 (사유 코멘트 첨부) + 비즈 100% 보존.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md

**작업 디렉토리:** `/Users/jykevin/Documents/cbc7119-design` (cbc7119-design 워크트리)
**현재 브랜치:** `redesign/31-chrome` (편집 OK, push 시 cbc7119-preview 자동 배포)
**금지:** `wrangler` 명령 / `npm run deploy` (CLAUDE.local.md ⚠ 워크트리 룰)
</execution_context>

<context>
# 정책
@CLAUDE.md
@CLAUDE.local.md

# 디자인 토큰 + 룰 (보호 — 변경 0)
@cha-bio-safety/docs/redesign-context/31-chrome/wave-1-index.md
@cha-bio-safety/docs/redesign-context/31-chrome/design-system.md
@cha-bio-safety/docs/redesign-context/31-chrome/tokens.css
@cha-bio-safety/docs/redesign-context/31-chrome/typography.css
@cha-bio-safety/tailwind.config.js

# W6 변환 체크리스트 — 1 byte 변경 0 SoT
@cha-bio-safety/docs/redesign-context/31-chrome/wave-6-tsx-conversion-checklist.md

# W4 sketch — verbatim CSS 인용 source (sketch-wave-4-settings-panel.html 2370 라인)
# 변환 작업 시 SettingsPanel section 별 .set-* class CSS 정의 grep 으로 verbatim 인용
@cha-bio-safety/docs/redesign-context/31-chrome/sketch-wave-4-settings-panel.html

# 변환 대상 (LIVE)
@cha-bio-safety/src/components/SettingsPanel.tsx

# Precedent — 같은 wave 내 mirror 패턴 (W7/W8/W10 완료, 변경 0)
@cha-bio-safety/src/components/GlobalHeader.tsx
@cha-bio-safety/src/components/SideMenu.tsx
@cha-bio-safety/src/components/MenuSettingsSection.tsx

# 비즈 의존 — 변경 0
@cha-bio-safety/src/utils/api.ts

<interfaces>
<!-- W9 후 SettingsPanel.tsx 가 export 해야 하는 시그니처 — 1 byte 변경 0 -->

From cha-bio-safety/src/components/SettingsPanel.tsx (line 50~54, 280):
```typescript
interface Props {
  open: boolean
  onClose: () => void
  isDesktop?: boolean
}

export function SettingsPanel({ open, onClose, isDesktop = false }: Props)
```

8 내부 컴포넌트 시그니처 verbatim (line 6, 29, 57, 80, 96, 109, 148, 183):
```typescript
function SectionHeader({ label, collapsed, onToggle }: { label: string; collapsed: boolean; onToggle: () => void })

function usePersistedCollapse(key: string, defaultCollapsed = true): [boolean, (v: boolean | ((c: boolean) => boolean)) => void]

function Toggle({ on, onChange, disabled }: { on: boolean; onChange?: (v: boolean) => void; disabled?: boolean })

function PermBadge({ perm }: { perm: NotificationPermission })

function Row({ label, sub, children, onClick }: { label: string; sub?: string; children?: React.ReactNode; onClick?: () => void })

function ChangePasswordForm({ onDone }: { onDone: () => void })

function NameEditModal({ currentName, onClose, onSave }: { currentName: string; onClose: () => void; onSave: (name: string) => void })

function ProfileEditForm({ onDone }: { onDone: () => void })
```

NotificationPreferences (from utils/api):
```typescript
type NotificationPreferences = {
  daily_schedule: boolean
  incomplete_schedule: boolean
  unresolved_issue: boolean
  education_reminder: boolean
  event_15min: boolean
  event_5min: boolean
}
```
</interfaces>

<sketch_css_verbatim>
<!-- W4 sketch-wave-4-settings-panel.html 의 핵심 CSS 정의 grep verbatim 인용 -->
<!-- executor 는 이 CSS 토큰을 source of truth 로 Tailwind class 매핑 -->

```css
/* SectionHeader */
.set-section-label {
  font-size: 11px;     /* 9 → 11 격상 — sketch 는 11px 도 격상 후보였으나 W6 §7 #12 = 12px 적용 (caption leading-none uppercase) */
  font-weight: 700;
  color: var(--text-tertiary);
  letter-spacing: .08em;
  text-transform: uppercase;
  line-height: 1;
}
.set-section-chevron--open { transform: rotate(90deg); }

/* Row */
.set-row {
  padding: 10px 12px;
  background: var(--surface-sunken);
  border-radius: var(--radius-md);    /* 9px */
  margin-bottom: 5px;
}
.set-row-label { font-size: 12px; font-weight: 500; color: var(--text-primary); line-height: 1.4; }
.set-row-sub   { font-size: 12px; color: var(--text-tertiary); margin-top: 1px; line-height: 1.4; }

/* PermBadge — 3 분기 (각 색 16% alpha bg + text 토큰) */
.perm-badge { font-size: 12px; line-height: 1; font-weight: 600; padding: 4px 8px; border-radius: var(--radius-pill); }
.perm-badge--granted { background: rgba(34, 197, 94, 0.16);  color: var(--status-safe-bar); }
.perm-badge--denied  { background: rgba(239, 68, 68, 0.16);  color: var(--status-danger-bar); }
.perm-badge--default { background: rgba(139, 148, 158, 0.16);color: var(--text-tertiary); }

/* Toggle — 38x21, on bg 토큰화 (W5 OQ #5-A LOCKED) */
.toggle      { width: 38px; height: 21px; border-radius: var(--toggle-radius); background: var(--surface-active); flex-shrink: 0; padding: 0; }
.toggle--on  { background: var(--accent-active); }
.toggle--disabled { opacity: 0.5; cursor: not-allowed; }
.toggle-dot  { position: absolute; top: 2px; left: 2px; width: 17px; height: 17px; border-radius: 50%; background: #fff; transition: transform 0.18s; transform: translateX(0); display: block; }
.toggle--on .toggle-dot { transform: translateX(17px); }

/* admin 테스트 푸시 button — OQ #6 LOCKED */
.set-test-push-btn {
  width: 100%; margin-bottom: 8px;
  background: var(--surface-active); color: var(--text-primary);
  border: 1px solid var(--border-strong); border-radius: var(--radius-sm);  /* 8px */
  padding: 9px 12px; font-size: 13px; line-height: 1; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.set-test-push-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.lucide-loader2 { animation: spin 1s linear infinite; }

/* sub-header (점검 / 일정 / 비밀번호 변경 / 개인정보 수정) */
.set-sub-header {
  font-size: 11px;          /* W6 §7 #31 = 12px caption leading-none uppercase */
  line-height: 1; color: var(--text-tertiary); font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase;
  margin-bottom: 8px;
}
.set-sub-header--pref        { margin-bottom: 4px; }
.set-sub-header--pref-second { margin-top: 10px; margin-bottom: 4px; }

/* prefs 박스 (notif expanded 영역) */
.set-prefs-box {
  margin-top: 8px; padding: 10px 12px 6px;
  background: var(--surface-sunken);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
}

/* select (화면 — 테마 / 주간 기준) */
.set-select {
  background: var(--surface-active); border: 1px solid var(--border-strong);
  color: var(--text-primary); font-size: 13px; line-height: 1;
  padding: 6px 10px; border-radius: var(--radius-sm); outline: none;
}

/* 폼 입력 (ChangePassword / Profile / NameEdit 공통) */
.form-input {
  height: 40px; background: var(--surface-sunken);
  border: 1px solid var(--border-default); border-radius: var(--radius-sm);
  padding: 0 12px; font-size: 13px; color: var(--text-primary);
}

/* SettingsPanel 컨테이너 */
.set-panel {
  width: 88%; max-width: 320px;
  background: var(--surface-raised);
  border-radius: 16px 0 0 16px;        /* OQ #7 LOCKED 보존 */
}
.set-overlay { background: var(--surface-overlay); }   /* 또는 bg-black/65 */

/* 헤더 — 'set-close-btn' (✕ → Lucide X size 14, OQ #A) */
.set-close-btn {
  width: 28px; height: 28px;          /* 32px → w-7 h-7 (W6 §10.1 / w-8 함정 의식) */
  border-radius: var(--radius-sm);
  background: var(--surface-sunken); color: var(--text-secondary);
}

/* 프로필 아바타 — OQ #4 LOCKED 그라데이션 폐기 */
.set-profile-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--accent-active);   /* solid (linear-gradient 폐기) */
  font-size: 18px; font-weight: 700; color: var(--text-on-accent);
}

/* 로그아웃 button — raw #dc2626 → 토큰 */
.set-logout-btn {
  width: 100%; height: 40px;
  background: var(--status-danger-bg);              /* 라이트 #fee2e2 / 다크 rgba(239,68,68,0.16) */
  color: var(--status-danger);                      /* 라이트 #991b1b / 다크 #f87171 */
  border: 1px solid rgba(--status-danger-bar, 0.4); /* Tailwind: border-status-danger-bar/40 */
  border-radius: var(--radius-md);
  font-size: 13px; font-weight: 700;                /* 12 → 13 격상 (label) */
}
```
</sketch_css_verbatim>
</context>

<memory_rules_inline>
**적용 메모리 룰 (12 unique, 사고 방지 핵심):**

1. `feedback_planner_prompt_sketch_verbatim` — sketch CSS 정의를 grep verbatim 인용 (위 `<sketch_css_verbatim>` 블록). 추측한 토큰명/사이즈 금지.
2. `feedback_tailwind_token_class_pattern` — `status-` prefix 없음. 예: `text-danger` ✓ / `bg-status-fire` X. 단 `text-status-danger-bar` 처럼 토큰 전체명은 OK.
3. `feedback_tailwind_w8_h8_is_48px` — tailwind.config.js spacing override: **w-8 = h-8 = 48px**, **w-7 = h-7 = 32px**. ✕ close 버튼은 `w-7 h-7` (32px).
4. `feedback_text_caption_leading_none` — `text-caption` lh 1.5 (18px) 가 h-7/h-8 컨테이너서 시각적 패딩. SectionHeader / sub-header / displayTitle·displayRole 등 **작은 컨테이너서 `leading-none` 명시**.
5. `feedback_tsx_wave_emoji_dot_gap` — OQ #6 LOCKED. `⏳🔔` 텍스트 → Lucide Loader2/Send. sketch negative gate (이모지 0) 자체 검수 필수.
6. `feedback_tsx_wave_stat_card_drift` — source outline 패턴 보존만 X. sketch 새 패턴 (그라데이션 폐기 / 격상 22건 / Toggle accent 토큰) 도 verbatim 적용. verify gate `grep -c "linear-gradient.*7c3aed" = 0` 필수.
7. `feedback_avoid_premature_confirmation` — "거의 일치" / "approved 주세요" 자제. 빌드 결과만 보고 + 사용자 판단 대기.
8. `feedback_cbc7119_design_never_wrangler` — wrangler 명령 자체 금지. main push 시 GitHub Actions 자동 배포 (cbc7119-preview).
9. `feedback_design_changes_ask_first` — 그라데이션 폐기 / 22 격상 디자인 변경은 W4 sketch 단계에서 컨펌됨 (OQ LOCKED). W9 는 코드 반영 phase.
10. `feedback_check_branch_before_edit` — 현재 브랜치 `redesign/31-chrome` 확인 후 작업.
11. `feedback_redesign_sketch_rule_enforcement` — sketch 룰 verbatim 적용 + verify gate + 자체 검수 4중 강화.
12. `feedback_gsd_workflow_strict` — /gsd:quick 진입 준수. ad-hoc PLAN 직접 작성 금지.
</memory_rules_inline>

<tasks>

<task type="auto">
  <name>Task 1: SettingsPanel.tsx 단일 atomic TSX 변환 (894 라인 → Tailwind class)</name>
  <files>cha-bio-safety/src/components/SettingsPanel.tsx</files>
  <action>
**작업 디렉토리:** `/Users/jykevin/Documents/cbc7119-design`
**현재 브랜치 확인 (편집 전 필수, memory `feedback_check_branch_before_edit`):**
```bash
git -C /Users/jykevin/Documents/cbc7119-design branch --show-current
# 출력 = redesign/31-chrome 확인 후 진행. 다르면 사용자 컨펌.
```

---

## 1. import 확장 (OQ #6 + W3-OQ #A — 이모지 + ✕ 교체용 Lucide 추가)

기존 line 2 verbatim 변경:
```typescript
import { ChevronRight } from 'lucide-react'
```
↓ 변경 후:
```typescript
import { ChevronRight, X, Send, Loader2 } from 'lucide-react'
```

다른 import (line 1, 3, 42~48) 1 byte 변경 0:
```typescript
import { useState, useEffect, useRef } from 'react'    // line 1 — useRef 미사용이어도 source verbatim 유지
import { ChevronRight, X, Send, Loader2 } from 'lucide-react'  // line 2 확장
import JSZip from 'jszip'                              // line 3 verbatim
// SectionHeader (line 6~27) / usePersistedCollapse (line 29~41) 변환 후에도 변경 0
import { useNavigate } from 'react-router-dom'         // line 42
import { useMutation, useQueryClient } from '@tanstack/react-query'  // line 43
import toast from 'react-hot-toast'                    // line 44
import { useAuthStore } from '../stores/authStore'    // line 45
import { authApi, pushApi, staffApi, NotificationPreferences } from '../utils/api'  // line 46 — staffApi 미사용 의심되지만 source verbatim
import { useStaffList } from '../hooks/useStaffList'  // line 47
import { MenuSettingsSection } from './MenuSettingsSection'  // line 48
```

**NOTE:** `useRef` / `staffApi` 가 본 컴포넌트에서 직접 미사용이어도 source verbatim 유지 (비즈 1 byte 변경 0 원칙). TypeScript `noUnusedLocals: false` (CLAUDE.md TypeScript 설정) 이므로 빌드 통과.

---

## 2. 8 내부 컴포넌트 변환 — 시그니처 verbatim + body Tailwind class 화

### 2.1 SectionHeader (line 6~27)

**source:**
```tsx
function SectionHeader({ label, collapsed, onToggle }: { label: string; collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-expanded={!collapsed}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', marginBottom: collapsed ? 0 : 6,
        padding: 0, background: 'none', border: 'none', cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <ChevronRight
        size={14}
        color="var(--t3)"
        style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.15s' }}
      />
    </button>
  )
}
```

**변환 (mirror W10 MenuSettingsSection line 164~176):**
```tsx
function SectionHeader({ label, collapsed, onToggle }: { label: string; collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-expanded={!collapsed}
      className={`flex items-center justify-between w-full p-0 bg-transparent border-none cursor-pointer ${collapsed ? '' : 'mb-1.5'}`}
    >
      {/* W6 §7 #12 — 9 → 12 격상 (caption leading-none uppercase) */}
      <span className="text-caption leading-none font-bold text-text-tertiary tracking-[.08em] uppercase">
        {label}
      </span>
      <ChevronRight
        size={14}
        className={`text-text-tertiary transition-transform duration-150 ${collapsed ? '' : 'rotate-90'}`}
      />
    </button>
  )
}
```

**verify:** `grep -c "function SectionHeader"` → 1, `grep -c "rotate-90"` → ≥1, `aria-expanded={!collapsed}` 보존.

### 2.2 usePersistedCollapse (line 29~41) — 비즈 hook, 1 byte 변경 0

source verbatim 유지 (style 인라인 0 — body 가 useState/useEffect/localStorage 만, markup 없음). 변경 0.

### 2.3 Toggle (line 57~77) — W5 OQ #5-A LOCKED Toggle accent

**source:**
```tsx
function Toggle({ on, onChange, disabled }: { on: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange?.(!on)}
      style={{
        width: 38, height: 21, borderRadius: 11, border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: on ? '#2563eb' : 'var(--bg4)',
        position: 'relative', transition: 'background 0.18s', flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: 2, width: 17, height: 17, borderRadius: '50%',
        background: '#fff', transition: 'transform 0.18s',
        transform: on ? 'translateX(17px)' : 'translateX(0)',
        display: 'block',
      }} />
    </button>
  )
}
```

**변환 (mirror W10 ToggleSmall line 328~341):**
```tsx
function Toggle({ on, onChange, disabled }: { on: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange?.(!on)}
      disabled={disabled}
      className={`relative w-[38px] h-[21px] rounded-full border-none shrink-0 p-0 transition-colors duration-200 ${
        on ? 'bg-accent-active' : 'bg-surface-active'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer opacity-100'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-[17px] h-[17px] rounded-full bg-white block transition-transform duration-200 ${
          on ? 'translate-x-[17px]' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
```

**NOTE:** Toggle 동그라미 `bg-white` 는 sketch 의 raw `#fff` 보존 (W6 §10 — thumb 토큰 미정의). `borderRadius: 11` → `rounded-full` (38x21 ellipse 효과 동일).
**verify:** `grep -c "#2563eb"` → 0, `grep -c "bg-accent-active"` → ≥1, `grep -c "translate-x-\[17px\]"` → ≥1.

### 2.4 PermBadge (line 80~93)

**source:** 인라인 `${color}22` (16% alpha 합성 — 동적 색상).

**변환:** 인라인 백그라운드 alpha 합성은 Tailwind class 한계 → **인라인 유지 + 사유 코멘트** (W6 §9.3 화이트리스트). text 색은 토큰 class 로 분리:

```tsx
function PermBadge({ perm }: { perm: NotificationPermission }) {
  // sketch §6.3 매트릭스 — 3 분기 (text 토큰 class + bg 는 16% alpha 인라인 합성)
  const map: Record<string, { text: string; textClass: string; bg: string }> = {
    granted: { text: '허용됨',      textClass: 'text-safe',           bg: 'rgba(34, 197, 94, 0.16)' },
    denied:  { text: '차단됨',      textClass: 'text-danger',         bg: 'rgba(239, 68, 68, 0.16)' },
    default: { text: '권한 미설정', textClass: 'text-text-tertiary',  bg: 'rgba(139, 148, 158, 0.16)' },
  }
  const { text, textClass, bg } = map[perm] || map.default
  return (
    <span
      // W6 §7 #14 — 10 → 12 격상 (caption + leading-none + font-semibold)
      className={`text-caption leading-none font-semibold px-[7px] py-[2px] rounded-[10px] ${textClass}`}
      // 동적 색상 16% alpha 합성 — Tailwind class 한계로 인라인 유지 (W6 §9.3 화이트리스트)
      style={{ background: bg }}
    >
      {text}
    </span>
  )
}
```

**NOTE:** Toggle/PermBadge 색 토큰 확인 — `tailwind.config.js` 에 `text-safe` / `text-danger` 클래스가 정의되어 있어야 함. **읽기 검증:**
```bash
grep -E "safe:|danger:" /Users/jykevin/Documents/cbc7119-design/cha-bio-safety/tailwind.config.js | head -10
```
만약 `text-safe` 가 직접 정의 안 되어 있으면 `text-[var(--status-safe-bar)]` arbitrary 로 fallback (W6 §10 cheatsheet 의 v0.1.1 토큰).
**verify:** `grep -c "function PermBadge"` → 1, `grep -c "granted\|denied"` → ≥2, `grep -c "rgba(34, 197, 94, 0.16)"` → 1.

### 2.5 Row (line 96~106)

**변환 (mirror sketch `.set-row` CSS):**
```tsx
function Row({ label, sub, children, onClick }: { label: string; sub?: string; children?: React.ReactNode; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2.5 bg-surface-sunken rounded-[9px] mb-[5px] ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div>
        {/* W6 §7 #15 — 12 → 13 격상 (label) */}
        <div className="text-label font-medium text-text-primary">{label}</div>
        {sub && (
          /* W6 §7 #16 — 10 → 12 격상 (caption) */
          <div className="text-caption text-text-tertiary mt-px">{sub}</div>
        )}
      </div>
      {children}
    </div>
  )
}
```

**verify:** `grep -c "function Row"` → 1, `padding 10px 12px` 가 `py-2.5 px-3` 으로 변환.

### 2.6 ChangePasswordForm (line 109~145)

**비즈 hook + mutation 100% 보존** (useMutation/authApi.changePassword/canSave/toast):

```tsx
function ChangePasswordForm({ onDone }: { onDone: () => void }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')

  const mutation = useMutation({
    mutationFn: () => authApi.changePassword({ currentPassword: current, newPassword: next }),
    onSuccess: () => { toast.success('비밀번호가 변경되었습니다'); onDone() },
    onError: (e: any) => toast.error(e?.message || '비밀번호 변경에 실패했습니다'),
  })

  const canSave = current.trim() !== '' && next.trim() !== '' && next === confirm && next.length >= 4

  return (
    <div className="px-[13px] py-3">
      {/* W6 §7 #17 — 9 → 12 격상 (caption leading-none uppercase) */}
      <div className="text-caption leading-none font-bold text-text-tertiary tracking-[.08em] uppercase mb-2">비밀번호 변경</div>
      <div className="flex flex-col gap-2">
        <input
          type="password" placeholder="현재 비밀번호" value={current} onChange={e => setCurrent(e.target.value)}
          className="h-10 w-full box-border bg-surface-sunken border border-border-default rounded-sm px-3 text-label text-text-primary outline-none"
        />
        <input
          type="password" placeholder="새 비밀번호 (4자 이상)" value={next} onChange={e => setNext(e.target.value)}
          className="h-10 w-full box-border bg-surface-sunken border border-border-default rounded-sm px-3 text-label text-text-primary outline-none"
        />
        <input
          type="password" placeholder="새 비밀번호 확인" value={confirm} onChange={e => setConfirm(e.target.value)}
          className={`h-10 w-full box-border bg-surface-sunken border rounded-sm px-3 text-label text-text-primary outline-none ${
            confirm && next !== confirm ? 'border-danger' : 'border-border-default'
          }`}
        />
        {confirm && next !== confirm && (
          /* W6 §7 #19 — 11 → 12 격상 (caption text-danger) */
          <div className="text-caption text-danger">비밀번호가 일치하지 않습니다</div>
        )}
        <div className="flex gap-2">
          <button
            onClick={onDone}
            className="flex-1 h-9 bg-surface-active text-text-secondary border-none rounded-sm cursor-pointer text-label font-bold"
          >
            취소
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!canSave || mutation.isPending}
            className={`flex-1 h-9 bg-accent text-text-on-accent border-none rounded-sm text-label font-bold ${
              canSave && !mutation.isPending ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-40'
            }`}
          >
            변경
          </button>
        </div>
      </div>
    </div>
  )
}
```

**NOTE:** `text-danger` / `border-danger` 가 tailwind.config 에 정의되어 있는지 확인. 없으면 `text-[var(--status-danger)]` / `border-[var(--status-danger)]` fallback (W6 §10).
**NOTE:** `bg-accent` 가 tailwind.config 에 정의 — W10 MenuSettingsSection line 302 에서 이미 사용. precedent 따라가면 안전.

### 2.7 NameEditModal (line 148~180)

**비즈 100% 보존 + 화면 z-300 fixed 인라인 유지 (modal portal):**

```tsx
function NameEditModal({ currentName, onClose, onSave }: { currentName: string; onClose: () => void; onSave: (name: string) => void }) {
  const [editName, setEditName] = useState(currentName)
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => authApi.updateProfile({ name: editName.trim() }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['staff-list'] })
      onSave(data.name); onClose()
    },
    onError: (e: any) => toast.error(e?.message || '이름 변경에 실패했습니다'),
  })

  const canSave = editName.trim() !== '' && editName.trim() !== currentName && editName.trim().length <= 20

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60">
      <div className="bg-surface-raised rounded-[14px] px-[18px] py-[20px] w-[280px] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {/* W6 §7 #21 — 13 → 16 격상 (text-body font-bold) */}
        <div className="text-body font-bold mb-[14px] text-text-primary">이름 변경</div>
        <input
          type="text" value={editName} onChange={e => setEditName(e.target.value)} maxLength={20}
          placeholder="이름 입력 (최대 20자)" autoFocus
          className="h-10 w-full box-border bg-surface-sunken border border-border-default rounded-sm px-3 text-label text-text-primary outline-none mb-3"
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-9 bg-surface-active text-text-secondary border-none rounded-sm cursor-pointer text-label font-bold"
          >
            취소
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!canSave || mutation.isPending}
            className={`flex-1 h-9 bg-accent text-text-on-accent border-none rounded-sm text-label font-bold ${
              canSave && !mutation.isPending ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-40'
            }`}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
```

**NOTE:** modal overlay rgba(0,0,0,0.6) → `bg-black/60` Tailwind 표준.

### 2.8 ProfileEditForm (line 183~277) — 8 필드

**비즈 100% 보존** (8 필드: 이름/사번/직책/역할/입사일/생년월일/연락처/이메일 + appointedAt slice + staff-list invalidate):

```tsx
function ProfileEditForm({ onDone }: { onDone: () => void }) {
  const { staff, updateStaff } = useAuthStore()
  const { data: staffList = [] } = useStaffList()
  const staffFull = staffList.find(s => s.id === staff?.id)
  const qc = useQueryClient()

  const [name, setName] = useState(staff?.name ?? '')
  const [phone, setPhone] = useState(staffFull?.phone ?? '')
  const [email, setEmail] = useState(staffFull?.email ?? '')
  const [birthDate, setBirthDate] = useState(staffFull?.birthDate ?? '')

  // staffFull 로드 후 초기값 반영 (비즈 1 byte 변경 0)
  useEffect(() => {
    if (staffFull) {
      setPhone(staffFull.phone ?? '')
      setEmail(staffFull.email ?? '')
      setBirthDate(staffFull.birthDate ?? '')
    }
  }, [staffFull])

  const mutation = useMutation({
    mutationFn: () => authApi.updateProfile({ phone, email, birthDate: birthDate || null }),
    onSuccess: (data) => {
      updateStaff({ name: data.name })
      // 5분 staleTime 으로 캐시된 staff-list 즉시 무효화 — 폼 재진입 시 최신 phone/email 반영
      qc.invalidateQueries({ queryKey: ['staff-list'] })
      toast.success('개인정보가 수정되었습니다')
      onDone()
    },
    onError: (e: any) => toast.error(e?.message || '수정에 실패했습니다'),
  })

  const canSave = true

  const INPUT_CLS = "h-[38px] w-full box-border bg-surface-sunken border border-border-default rounded-sm px-3 text-caption text-text-primary outline-none"
  const READONLY_CLS = "h-[38px] w-full box-border bg-surface-page border border-border-default rounded-sm px-3 text-caption text-text-tertiary outline-none"

  return (
    <div className="px-[13px] py-3">
      {/* W6 §7 #23 — 9 → 12 격상 (caption leading-none uppercase) */}
      <div className="text-caption leading-none font-bold text-text-tertiary tracking-[.08em] uppercase mb-2">개인정보 수정</div>
      <div className="flex flex-col gap-1.5">
        {/* W6 §7 #24 — 8 필드 라벨 10 → 12 격상 */}
        <div>
          <div className="text-caption text-text-tertiary mb-0.5">이름</div>
          <input value={name} readOnly className={READONLY_CLS} />
        </div>
        <div>
          <div className="text-caption text-text-tertiary mb-0.5">사번</div>
          <input value={staff?.id ?? ''} readOnly className={READONLY_CLS} />
        </div>
        <div>
          <div className="text-caption text-text-tertiary mb-0.5">직책</div>
          <input value={staff?.title ?? '-'} readOnly className={READONLY_CLS} />
        </div>
        <div>
          <div className="text-caption text-text-tertiary mb-0.5">역할</div>
          <input value={staff?.role === 'admin' ? '관리자' : '보조자'} readOnly className={READONLY_CLS} />
        </div>
        <div>
          <div className="text-caption text-text-tertiary mb-0.5">입사일</div>
          <input
            value={(() => {
              const p = (staff?.id ?? '').slice(0, 8)
              return /^[0-9]{8}$/.test(p) ? `${p.slice(0,4)}-${p.slice(4,6)}-${p.slice(6,8)}` : (staffFull?.appointedAt ?? '-')
            })()}
            readOnly className={READONLY_CLS}
          />
        </div>
        <div>
          <div className="text-caption text-text-tertiary mb-0.5">생년월일</div>
          <input
            type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
            className={INPUT_CLS}
            // type=date 의 native widget 정렬 보정 — Tailwind class 한계로 인라인 유지
            style={{ WebkitAppearance: 'none', appearance: 'none', minWidth: 0, textAlign: 'left' }}
          />
        </div>
        <div>
          <div className="text-caption text-text-tertiary mb-0.5">연락처</div>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000" className={INPUT_CLS} />
        </div>
        <div>
          <div className="text-caption text-text-tertiary mb-0.5">이메일</div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className={INPUT_CLS} />
        </div>
        <div className="flex gap-2 mt-1">
          <button
            onClick={onDone}
            className="flex-1 h-9 bg-surface-active text-text-secondary border-none rounded-sm cursor-pointer text-label font-bold"
          >
            취소
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!canSave || mutation.isPending}
            className={`flex-1 h-9 bg-accent text-text-on-accent border-none rounded-sm text-label font-bold ${
              canSave && !mutation.isPending ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-40'
            }`}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
```

**verify:** `grep -c "appointedAt"` → 1, `grep -c "type=\"date\""` 또는 `type="date"` 형식 1, 8 필드 라벨 verbatim (`이름/사번/직책/역할/입사일/생년월일/연락처/이메일`).

---

## 3. 메인 SettingsPanel (line 280~end) 변환

### 3.1 state 7개 + permState/subscribed/prefs 변경 0 (line 282~312)

useState 비즈 9개 (cacheClearing/dbBackingUp/dbRestoring/r2BackingUp/r2BackupProgress/r2Restoring/testSending + permState/subscribed/prefs) + 6 collapsible localStorage 키 **1 byte 변경 0 강제** (W6 anchor #10/#11/#12):

```typescript
const [notifCollapsed, setNotifCollapsed] = usePersistedCollapse('settings.notif.collapsed', true)
const [displayCollapsed, setDisplayCollapsed] = usePersistedCollapse('settings.display.collapsed', true)
const [accountCollapsed, setAccountCollapsed] = usePersistedCollapse('settings.account.collapsed', true)
const [dbCollapsed, setDbCollapsed] = usePersistedCollapse('settings.db.collapsed', true)
const [appInfoCollapsed, setAppInfoCollapsed] = usePersistedCollapse('settings.appinfo.collapsed', true)
// ...
const [prefs, setPrefs] = useState<NotificationPreferences>({
  daily_schedule: true, incomplete_schedule: true,
  unresolved_issue: true, education_reminder: true,
  event_15min: true, event_5min: true,
})
```

### 3.2 비즈 함수 13개 변경 0 (line 314~636)

- `useEffect(() => { ... pushApi.getStatus() ... }, [open])` (line 315~323)
- `urlBase64ToUint8Array` (line 325~330)
- `handleSubscribe` (line 332~359)
- `handleUnsubscribe` (line 361~374)
- `handleTestPush` (line 376~396) — `${base}/push/test` POST
- `handlePrefToggle` (line 398~407)
- `useEffect(() => { ... touchmove prevent ... }, [open])` (line 409~418)
- `handleClearCache` (line 420~442)
- `handleDbBackup` (line 444~465) — `/database/backup`
- `handleDbRestore` (line 467~495) — `/database/restore`
- `handleR2Backup` (line 497~582) — `/database/r2-list` + `/database/backup-status` + JSZip delta
- `handleR2Restore` (line 584~625) — `JSZip.loadAsync` + 10개씩 배치 `/database/r2-upload`
- `handleLogout` (line 627~631)
- `handleNameSaved` (line 633~636)

**13 함수 모두 비즈 1 byte 변경 0** — markup 0 영역이므로 source verbatim 복사.

### 3.3 return JSX 변환 (line 638~end)

**Overlay (line 640~649):**
```tsx
<div
  onClick={onClose}
  className="fixed inset-0 z-[190] bg-black/65 transition-opacity duration-[280ms]"
  style={{
    // 동적 분기 — open prop 따라 변경. Tailwind class dynamic value 한계로 인라인 유지 (W6 §9.3 화이트리스트)
    opacity: open ? 1 : 0,
    pointerEvents: open ? 'all' : 'none',
  }}
/>
```

**Panel (line 650~661) — OQ #7 LOCKED width 88% / maxWidth 320 보존:**
```tsx
<div
  id="settings-panel"
  className="fixed right-0 z-[200] w-[88%] max-w-[320px] bg-surface-raised overflow-y-auto rounded-l-[16px]"
  style={{
    // isDesktop 분기 + safe-area css var + cubic-bezier transition — Tailwind class 한계로 인라인 유지
    top: isDesktop ? 0 : 'var(--sat, 0px)',
    bottom: isDesktop ? 0 : 'calc(54px + var(--sab, 0px) - var(--sat, 0px))',
    transform: open ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
  }}
>
```

**헤더 (line 663~670) — gear svg path 인라인 유지 (OQ #5) + ✕ → Lucide X (W3-OQ #A):**
```tsx
<div className="flex items-center gap-2.5 px-[15px] py-3 border-b border-border-default shrink-0">
  {/* OQ #5 LOCKED — gear svg path verbatim 인라인 유지 (Lucide 교체 X) */}
  <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
  {/* W6 §7 #25 — 13.5 → 18 격상 (text-title font-bold) */}
  <span className="text-title font-bold text-text-primary">설정</span>
  {/* W3-OQ #A LOCKED — ✕ 텍스트 → Lucide X (size 14, w-7 h-7 = 32px) */}
  <button
    onClick={onClose}
    aria-label="설정 닫기"
    className="ml-auto w-7 h-7 rounded-[7px] bg-surface-sunken border-none text-text-secondary cursor-pointer flex items-center justify-center"
  >
    <X size={14} />
  </button>
</div>
```

**프로필 (line 672~688) — OQ #4 LOCKED 그라데이션 폐기:**
```tsx
<div className="px-[13px] pt-3.5 pb-2">
  <div className="flex items-center gap-3 mb-2.5">
    {/* OQ #4 LOCKED — linear-gradient(135deg, #2563eb 0%, #7c3aed 100%) 폐기 → bg-accent-active solid */}
    <div className="w-11 h-11 rounded-full shrink-0 bg-accent-active flex items-center justify-center text-[18px] font-bold text-text-on-accent">
      {avatarChar}
    </div>
    <div className="flex-1 min-w-0">
      {/* W6 §7 #28 — 14 → 16 격상 (text-body font-bold) */}
      <span className="text-body font-bold text-text-primary">{displayName}</span>
      {/* W6 §7 #29 — 10 → 12 격상 (caption leading-none) */}
      <div className="text-caption leading-none text-text-tertiary mt-px">{displayTitle} · {displayRole}</div>
    </div>
  </div>
</div>
```

**NOTE:** `w-11 h-11 = 44px` (tailwind.config spacing 11 = 44px 확인). `w-8 함정` — 만약 spacing 11 이 44 가 아니면 `w-[44px] h-[44px]` arbitrary fallback. 단 W10 ToggleSmall `w-[38px]` 패턴 따라가는 게 안전.

**알림 섹션 (line 690~750) — OQ #6 LOCKED 이모지 제거:**
```tsx
<div className="px-[13px] pt-3 pb-1.5">
  <SectionHeader label="알림" collapsed={notifCollapsed} onToggle={() => setNotifCollapsed(c => !c)} />
  <Row label="푸시 알림" sub={permState === 'denied' ? '브라우저 설정에서 알림을 허용해주세요' : subscribed ? '구독 중' : '구독하려면 토글을 켜세요'}>
    <div className="flex items-center gap-2">
      <PermBadge perm={permState} />
      <Toggle on={subscribed} onChange={v => v ? handleSubscribe() : handleUnsubscribe()} disabled={permState === 'denied'} />
    </div>
  </Row>

  {!notifCollapsed && (
    <div className="mt-2 pt-2 px-2.5 pb-1 bg-surface-sunken border border-border-strong rounded-[9px]">
      {/* admin 전용 테스트 푸시 버튼 — OQ #6 LOCKED 이모지 제거 + Lucide Send/Loader2 */}
      {staff?.role === 'admin' && subscribed && permState === 'granted' && (
        <button
          onClick={handleTestPush}
          disabled={testSending}
          className={`w-full mb-2 bg-surface-active text-text-primary border border-border-strong rounded-sm px-2.5 py-[7px] text-label font-semibold flex items-center justify-center gap-2 ${
            testSending ? 'cursor-not-allowed opacity-60' : 'cursor-pointer opacity-100'
          }`}
        >
          {testSending ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>전송 중...</span>
            </>
          ) : (
            <>
              <Send size={14} />
              <span>테스트 푸시 보내기</span>
            </>
          )}
        </button>
      )}
      {/* 점검 그룹 (W6 §7 #31 — 9 → 12 격상) */}
      <div className="text-caption leading-none font-bold text-text-tertiary tracking-[.08em] uppercase mb-1">점검</div>
      <Row label="금일 점검 일정" sub="매일 08:45">
        <Toggle on={prefs.daily_schedule} onChange={() => handlePrefToggle('daily_schedule')} disabled={!subscribed || permState === 'denied'} />
      </Row>
      <Row label="전일 미완료 점검" sub="매일 08:45">
        <Toggle on={prefs.incomplete_schedule} onChange={() => handlePrefToggle('incomplete_schedule')} disabled={!subscribed || permState === 'denied'} />
      </Row>
      <Row label="미조치 항목" sub="매일 08:45">
        <Toggle on={prefs.unresolved_issue} onChange={() => handlePrefToggle('unresolved_issue')} disabled={!subscribed || permState === 'denied'} />
      </Row>

      {/* 일정 그룹 */}
      <div className="text-caption leading-none font-bold text-text-tertiary tracking-[.08em] uppercase mt-2.5 mb-1">일정</div>
      <Row label="행사 15분 전 알림" sub="행사 시작 15분 전">
        <Toggle on={prefs.event_15min} onChange={() => handlePrefToggle('event_15min')} disabled={!subscribed || permState === 'denied'} />
      </Row>
      <Row label="행사 5분 전 알림" sub="행사 시작 5분 전">
        <Toggle on={prefs.event_5min} onChange={() => handlePrefToggle('event_5min')} disabled={!subscribed || permState === 'denied'} />
      </Row>
      <Row label="교육 D-60 알림" sub="교육일 60일 전">
        <Toggle on={prefs.education_reminder} onChange={() => handlePrefToggle('education_reminder')} disabled={!subscribed || permState === 'denied'} />
      </Row>
    </div>
  )}
</div>
```

**MenuSettingsSection (line 753) — 변경 0:**
```tsx
{/* 메뉴 설정 (Phase 18) — W10 변환됨 */}
<MenuSettingsSection />
```

**화면 섹션 (line 756~771):**
```tsx
<div className="px-[13px] pt-3 pb-1.5">
  <SectionHeader label="화면" collapsed={displayCollapsed} onToggle={() => setDisplayCollapsed(c => !c)} />
  {!displayCollapsed && <>
    <Row label="테마">
      <select className="bg-surface-active border border-border-strong text-text-primary text-label leading-none px-2.5 py-1.5 rounded-sm outline-none">
        <option>다크</option><option>라이트</option><option>시스템</option>
      </select>
    </Row>
    <Row label="주간 현황 기준">
      <select className="bg-surface-active border border-border-strong text-text-primary text-label leading-none px-2.5 py-1.5 rounded-sm outline-none">
        <option>이번 주</option><option>최근 7일</option>
      </select>
    </Row>
    <Row label="결과 즉시 저장"><Toggle on={true} /></Row>
  </>}
</div>
```

**계정 섹션 (line 773~790) — 폼 전환:**
```tsx
{showPwChange ? (
  <ChangePasswordForm onDone={() => setShowPwChange(false)} />
) : showProfileEdit ? (
  <ProfileEditForm onDone={() => setShowProfileEdit(false)} />
) : (
  <div className="px-[13px] pt-3 pb-1.5">
    <SectionHeader label="계정" collapsed={accountCollapsed} onToggle={() => setAccountCollapsed(c => !c)} />
    {!accountCollapsed && (<>
      <Row label="개인정보 수정" sub="연락처, 이메일, 생년월일" onClick={() => setShowProfileEdit(true)}>
        {/* OQ #5 LOCKED 확장 — chevron svg 인라인 유지 (path 보존) OR Lucide ChevronRight size 13 */}
        <ChevronRight size={13} className="text-text-tertiary" />
      </Row>
      <Row label="비밀번호 변경" onClick={() => setShowPwChange(true)}>
        <ChevronRight size={13} className="text-text-tertiary" />
      </Row>
    </>)}
  </div>
)}
```

**NOTE:** Row trailing chevron 은 source 가 `<svg width={13} height={13}>` 직접 inline (line 783/786/870). **OQ #5 LOCKED 확장 정책 (W6 §8.1)** 에 따라 4 DB/R2 svg 만 인라인 유지 + Row chevron 은 이미 import 된 Lucide `ChevronRight` 활용이 적절 (별도 inline svg 보다 코드 가독성 ↑). **단 `<svg width={13}>` 인라인 유지 정책 적용 가능 (OQ #5 LOCKED 확장 — sketch §6.3 4 SVG path 인라인 유지)** — executor 판단 OK. 권장: **Lucide ChevronRight size 13** (W6 §8.1 #525~526 명시 — "기존 ChevronRight import 사용").

**DB 섹션 (line 793~857) — admin only + 4 svg path 인라인 유지 (OQ #5 LOCKED 확장):**
```tsx
{staff?.role === 'admin' && (
  <div className="px-[13px] pt-3 pb-1.5">
    <SectionHeader label="데이터베이스" collapsed={dbCollapsed} onToggle={() => setDbCollapsed(c => !c)} />
    {!dbCollapsed && (<>
      {/* W6 §7 #33 — 10 → 12 격상 (caption) */}
      <div className="text-caption text-text-tertiary mb-1">DB (점검기록, 직원, 설정 등)</div>
      <div className="flex gap-2 mb-2.5">
        <button
          onClick={handleDbBackup}
          disabled={dbBackingUp}
          className={`flex-1 h-10 bg-surface-sunken border border-border-default rounded-[9px] text-label font-bold text-text-primary flex items-center justify-center gap-1.5 ${
            dbBackingUp ? 'cursor-default opacity-50' : 'cursor-pointer opacity-100'
          }`}
        >
          {/* OQ #5 LOCKED 확장 — DB 백업 svg path verbatim 인라인 유지 */}
          <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
          {dbBackingUp ? '백업 중...' : '백업'}
        </button>
        <button
          onClick={handleDbRestore}
          disabled={dbRestoring}
          className={`flex-1 h-10 bg-surface-sunken border border-border-default rounded-[9px] text-label font-bold text-text-primary flex items-center justify-center gap-1.5 ${
            dbRestoring ? 'cursor-default opacity-50' : 'cursor-pointer opacity-100'
          }`}
        >
          <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
          {dbRestoring ? '복원 중...' : '업로드'}
        </button>
      </div>
      <div className="text-caption text-text-tertiary mb-1">파일 (점검 사진 등)</div>
      <div className="flex gap-2">
        <button
          onClick={handleR2Backup}
          disabled={r2BackingUp}
          className={`flex-1 h-10 bg-surface-sunken border border-border-default rounded-[9px] text-label font-bold text-text-primary flex items-center justify-center gap-1.5 ${
            r2BackingUp ? 'cursor-default opacity-50' : 'cursor-pointer opacity-100'
          }`}
        >
          <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          {r2BackingUp ? (r2BackupProgress || '백업 중...') : '백업'}
        </button>
        <button
          onClick={handleR2Restore}
          disabled={r2Restoring}
          className={`flex-1 h-10 bg-surface-sunken border border-border-default rounded-[9px] text-label font-bold text-text-primary flex items-center justify-center gap-1.5 ${
            r2Restoring ? 'cursor-default opacity-50' : 'cursor-pointer opacity-100'
          }`}
        >
          <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
          {r2Restoring ? '복원 중...' : '업로드'}
        </button>
      </div>
    </>)}
  </div>
)}
```

**앱 정보 (line 860~875):**
```tsx
<div className="px-[13px] pt-3 pb-1.5">
  <SectionHeader label="앱 정보" collapsed={appInfoCollapsed} onToggle={() => setAppInfoCollapsed(c => !c)} />
  {!appInfoCollapsed && (
    <>
      <Row label="버전" sub={`v${__APP_VERSION__} (${__BUILD_TIME__})`} />
      <Row
        label={cacheClearing ? '초기화 중…' : '캐시 초기화'}
        sub="최신 리소스로 새로고침"
        onClick={cacheClearing ? undefined : handleClearCache}
      >
        <ChevronRight size={13} className="text-text-tertiary" />
      </Row>
      <Row label="차바이오컴플렉스 방재" sub="경기도 성남시 분당구 판교로 335" />
    </>
  )}
</div>
```

**로그아웃 (line 878~889) — raw #dc2626 → 토큰:**
```tsx
<div className="px-[13px] py-3">
  <button
    onClick={handleLogout}
    /* W6 §10 cheatsheet — rgba(220,38,38,0.12) → bg-status-danger-bg 또는 arbitrary alpha,
       #dc2626 → text-status-danger 또는 text-danger (tailwind 토큰 정의에 따라).
       border rgba(220,38,38,0.25) → border-status-danger-bar/40 arbitrary alpha */
    className="w-full h-10 bg-danger/10 text-danger border border-danger/25 rounded-[9px] text-label font-bold cursor-pointer"
  >
    로그아웃
  </button>
</div>
```

**NOTE 토큰 fallback:** tailwind.config 의 색 토큰 정의 확인:
```bash
grep -E "danger:|status-danger" /Users/jykevin/Documents/cbc7119-design/cha-bio-safety/tailwind.config.js | head -10
```
만약 `bg-danger` / `text-danger` 가 정의 안 되어 있으면:
- `bg-danger/10` → `bg-[rgba(220,38,38,0.12)]`
- `text-danger` → `text-[#dc2626]`
- `border-danger/25` → `border-[rgba(220,38,38,0.25)]`

**precedent:** W10 MenuSettingsSection line 285 `bg-danger text-text-on-accent` 사용 — `bg-danger` 가 tailwind.config 에 있음을 시사. precedent 따라가면 안전.

---

## 4. verify gate (commit 전 자동 실행)

### 4.1 자체 grep (W6 §12.3 — 15 항목)

```bash
cd /Users/jykevin/Documents/cbc7119-design

# (1) 파일 존재
test -f cha-bio-safety/src/components/SettingsPanel.tsx && echo "OK: file exists"

# (2) Lucide import 확장 (✕/이모지 교체용)
grep -c "import { ChevronRight, X, Send, Loader2 } from 'lucide-react'" cha-bio-safety/src/components/SettingsPanel.tsx
# expected: 1

# (3) 이모지 0 — OQ #6 LOCKED
grep -c "⏳\|🔔" cha-bio-safety/src/components/SettingsPanel.tsx
# expected: 0

# (4) ✕ 텍스트 글리프 0 — W3-OQ #A LOCKED
grep -c "✕" cha-bio-safety/src/components/SettingsPanel.tsx
# expected: 0

# (5) gear svg path 인라인 유지 — OQ #5 LOCKED
grep -c "M10.325 4.317" cha-bio-safety/src/components/SettingsPanel.tsx
# expected: 1

# (6) 프로필 그라데이션 폐기 — OQ #4 LOCKED
grep -c "linear-gradient.*7c3aed" cha-bio-safety/src/components/SettingsPanel.tsx
# expected: 0

# (7) bg-accent-active 확인 (프로필 solid + Toggle on)
grep -c "bg-accent-active" cha-bio-safety/src/components/SettingsPanel.tsx
# expected: ≥1 (최소 1, 권장 2 — 프로필 + Toggle on)

# (8) panel width 88% 보존 — OQ #7 LOCKED
grep -cE "w-\[88%\]|width: '88%'" cha-bio-safety/src/components/SettingsPanel.tsx
# expected: ≥1

# (9) 6 collapsible localStorage 키 — 1 byte 변경 0
grep -cE "settings\.notif\.collapsed|settings\.display\.collapsed|settings\.account\.collapsed|settings\.db\.collapsed|settings\.appinfo\.collapsed" cha-bio-safety/src/components/SettingsPanel.tsx
# expected: 5

# (10) NotificationPreferences 6 키 — 1 byte 변경 0
grep -cE "daily_schedule|incomplete_schedule|unresolved_issue|education_reminder|event_15min|event_5min" cha-bio-safety/src/components/SettingsPanel.tsx
# expected: ≥6 (각 키 최소 1번 — useState default + onChange handler 등)

# (11) JSZip 비즈 보존
grep -c "JSZip" cha-bio-safety/src/components/SettingsPanel.tsx
# expected: ≥2 (import + 사용 ≥2)

# (12) DB/R2 API endpoint 보존
grep -cE "/database/r2-list|/database/backup-status|/database/r2-download|/database/r2-upload|/database/backup|/database/restore|/push/test" cha-bio-safety/src/components/SettingsPanel.tsx
# expected: ≥7

# (13) #dc2626 raw 토큰화 (fallback: arbitrary 으로 두면 grep 1 OK)
# 토큰 class 우선. arbitrary fallback 시:
grep -c "#dc2626" cha-bio-safety/src/components/SettingsPanel.tsx
# expected: 0 (bg-danger/text-danger 사용) OR 1 (arbitrary text-[#dc2626] fallback)
# 둘 다 OK — 단 raw style 인라인 form 은 0 (`color: '#dc2626'` 또는 `background: '#dc2626'` 0)
grep -cE "color: '#dc2626'|background: '#dc2626'" cha-bio-safety/src/components/SettingsPanel.tsx
# expected: 0

# (14) 9·10·11 px 0 — W6 §7.1 LOCKED
grep -cE "fontSize: ?(9|10|11)[,$]|text-\[(9|10|11)px\]" cha-bio-safety/src/components/SettingsPanel.tsx
# expected: 0

# (15) legacy alias body markup 0
grep -cE "var\(--(bg|bg2|bg3|bg4|bd|bd2|t1|t2|t3|acl|safe|warn|danger|fire|info)\)" cha-bio-safety/src/components/SettingsPanel.tsx
# expected: 0
# 단 safe-area css var `var(--sat`, `var(--sab` 은 OK — 그건 safe-area 토큰

# 8 내부 컴포넌트 시그니처 보존 (≥1 각)
grep -cE "function SectionHeader|function Toggle|function PermBadge|function Row|function ChangePasswordForm|function NameEditModal|function ProfileEditForm|function usePersistedCollapse" cha-bio-safety/src/components/SettingsPanel.tsx
# expected: ≥8

# export 시그니처 보존
grep -c "export function SettingsPanel({ open, onClose, isDesktop = false }: Props)" cha-bio-safety/src/components/SettingsPanel.tsx
# expected: 1
```

**모든 grep 통과 시 PASS — 하나라도 unexpected 면 STOP + 사용자 보고.**

### 4.2 보호 파일 git diff 0 byte (17 파일)

```bash
cd /Users/jykevin/Documents/cbc7119-design
git diff --stat \
  cha-bio-safety/src/App.tsx \
  cha-bio-safety/src/components/GlobalHeader.tsx \
  cha-bio-safety/src/components/SideMenu.tsx \
  cha-bio-safety/src/components/MenuSettingsSection.tsx \
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
  cha-bio-safety/docs/redesign-context/31-chrome/typography.css \
  cha-bio-safety/src/utils/api.ts \
  cha-bio-safety/src/stores/authStore.ts \
  cha-bio-safety/src/hooks/useStaffList.ts
# expected: 빈 출력 (0 byte 변경)
```

### 4.3 TypeScript 컴파일 PASS

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && npx tsc --noEmit
# expected: 0 errors
```

만약 에러 발생:
- `unused import (useRef, staffApi)` — CLAUDE.md 의 `noUnusedLocals: false` 라 통과 예상. 만약 통과 안 하면 source 라인 보존 원칙대로 두되 빌드 결과만 보고.
- Tailwind class 매핑 누락 (`bg-danger` 등) — `text-[#dc2626]` arbitrary 로 fallback 후 retry.

### 4.4 (선택) 빌드 verify

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && npm run build
# expected: PASS — chunk size 변화 시각 측정 (변환 전후)
```

**시간 비용 큼** — tsc 통과 시 빌드 생략 가능. 단 chunk 측정 원하면 실행.

---

## 5. 인라인 잔존 6 예외 (사유 코멘트 첨부 필수)

W6 §9.3 화이트리스트 — 각 case 에 `//` 코멘트 명시:

1. **Overlay opacity / pointerEvents 동적 분기** — `style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none' }}` + `// 동적 분기 — Tailwind class dynamic value 한계`
2. **Panel transform/transition + safe-area** — `style={{ top: isDesktop ? 0 : 'var(--sat, 0px)', bottom: ..., transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)' }}` + `// isDesktop 분기 + safe-area css var + cubic-bezier transition`
3. **NameEditModal box-shadow** — `bg-black/60` Tailwind 가능 OR 미세 그림자는 `shadow-[0_8px_32px_rgba(0,0,0,0.4)]` arbitrary 시 인라인 0 가능. **권장 Tailwind arbitrary** — 인라인 예외 X.
4. **PermBadge 16% alpha background** — `style={{ background: bg }}` (rgba 값) + `// 동적 색상 16% alpha 합성 — Tailwind class 한계`
5. **type=date 의 native widget 정렬** — `style={{ WebkitAppearance: 'none', appearance: 'none', minWidth: 0, textAlign: 'left' }}` + `// type=date native widget 정렬 보정 — Tailwind class 한계`
6. **(이미 사용한 것 보면) usePersistedCollapse hook body** — markup 없음 / state만, 인라인 style 없음. 5개 예외만 실질적.

전체 인라인 `style={{` 개수 (예상):
```bash
grep -c "style={{" cha-bio-safety/src/components/SettingsPanel.tsx
# expected: 약 5~7 (전부 사유 코멘트 첨부)
```

---

## 6. atomic 1-commit

verify gate 모두 PASS 후 commit:

```bash
cd /Users/jykevin/Documents/cbc7119-design
git add cha-bio-safety/src/components/SettingsPanel.tsx
git commit -m "$(cat <<'EOF'
feat(31-chrome): W9 SettingsPanel.tsx Tailwind class atomic 변환

- 894 라인 SettingsPanel.tsx 단일 atomic TSX 변환 (chrome 변환 마지막)
- 8 내부 컴포넌트 (SectionHeader / usePersistedCollapse / Toggle / PermBadge /
  Row / ChangePasswordForm / NameEditModal / ProfileEditForm) 시그니처 + 비즈
  로직 1 byte 변경 0
- JSZip 백업/복원 비즈 (handleDbBackup/handleDbRestore/handleR2Backup/
  handleR2Restore) 1 byte 변경 0 — 안전 직결
- NotificationPreferences 6 키 default true verbatim
- OQ #4 LOCKED: 프로필 아바타 그라데이션 (linear-gradient(135deg, #2563eb 0%,
  #7c3aed 100%)) 폐기 → bg-accent-active solid
- OQ #6 LOCKED: admin 테스트 푸시 이모지 (⏳🔔) 제거 → Lucide Loader2
  (animate-spin) / Send
- W3-OQ #A LOCKED: ✕ 텍스트 글리프 → Lucide X (size 14)
- W5 OQ #5-A LOCKED: Toggle on bg #2563eb → bg-accent-active
- OQ #7 LOCKED: panel width 88% / maxWidth 320 보존
- OQ #5 LOCKED: gear svg path + 4 DB/R2 svg path verbatim 인라인 유지
- 노안 격상 22건 적용 (9/10/11px → 12/13px)
- legacy alias body markup 0 / raw hex body markup #dc2626 토큰화
- 6 collapsible localStorage 키 1 byte 변경 0
- 보호 파일 17건 git diff 0 byte
- npx tsc --noEmit 0 errors

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

**금지:** `wrangler` / `npm run deploy` (CLAUDE.local.md ⚠ 룰).
**push 정책 (memory `feedback_push_proactive`):** commit 후 사용자에게 push 권유 → 사용자 컨펌 후 `git push origin redesign/31-chrome`. main 머지 + cbc7119-preview 자동 배포는 사용자 결정.
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && npx tsc --noEmit 2>&1 | tail -20 && echo "---" && cd /Users/jykevin/Documents/cbc7119-design && grep -c "import { ChevronRight, X, Send, Loader2 } from 'lucide-react'" cha-bio-safety/src/components/SettingsPanel.tsx && grep -c "⏳\|🔔" cha-bio-safety/src/components/SettingsPanel.tsx && grep -c "✕" cha-bio-safety/src/components/SettingsPanel.tsx && grep -c "M10.325 4.317" cha-bio-safety/src/components/SettingsPanel.tsx && grep -c "linear-gradient.*7c3aed" cha-bio-safety/src/components/SettingsPanel.tsx && grep -c "bg-accent-active" cha-bio-safety/src/components/SettingsPanel.tsx && grep -cE "settings\.notif\.collapsed|settings\.display\.collapsed|settings\.account\.collapsed|settings\.db\.collapsed|settings\.appinfo\.collapsed" cha-bio-safety/src/components/SettingsPanel.tsx && grep -cE "daily_schedule|incomplete_schedule|unresolved_issue|education_reminder|event_15min|event_5min" cha-bio-safety/src/components/SettingsPanel.tsx && grep -c "JSZip" cha-bio-safety/src/components/SettingsPanel.tsx && grep -cE "fontSize: ?(9|10|11)[,$]" cha-bio-safety/src/components/SettingsPanel.tsx && grep -cE "var\(--(bg|bg2|bg3|bg4|bd|bd2|t1|t2|t3|acl|danger|safe|warn|fire|info)\)" cha-bio-safety/src/components/SettingsPanel.tsx && git -C /Users/jykevin/Documents/cbc7119-design diff --stat cha-bio-safety/src/App.tsx cha-bio-safety/src/components/GlobalHeader.tsx cha-bio-safety/src/components/SideMenu.tsx cha-bio-safety/src/components/MenuSettingsSection.tsx cha-bio-safety/src/styles/tokens.css cha-bio-safety/src/styles/typography.css cha-bio-safety/tailwind.config.js cha-bio-safety/docs/redesign-context/31-chrome/ cha-bio-safety/docs/redesign-context/00-design-context/ cha-bio-safety/src/utils/api.ts cha-bio-safety/src/stores/authStore.ts cha-bio-safety/src/hooks/useStaffList.ts</automated>
    
**Expected output (line-by-line):**
1. `tsc --noEmit` → 0 errors (마지막 줄 빈 줄 또는 "found 0 errors")
2. `Lucide import` → `1`
3. `이모지 grep` → `0`
4. `✕ grep` → `0`
5. `gear svg path` → `1`
6. `linear-gradient 7c3aed` → `0`
7. `bg-accent-active` → `≥1` (권장 2 — 프로필 + Toggle on)
8. `6 collapsible localStorage 키` → `5`
9. `NotificationPreferences 6 키` → `≥6`
10. `JSZip` → `≥2`
11. `fontSize 9/10/11` → `0`
12. `legacy alias var(--bg*) 등` → `0`
13. `git diff --stat 보호 파일` → 빈 출력 (0 byte 변경)
  </verify>
  <done>
- `cha-bio-safety/src/components/SettingsPanel.tsx` 약 850~900 라인, Tailwind class 가독성 + 인라인 잔존 5~7 예외 (모두 사유 코멘트)
- `npx tsc --noEmit` 0 errors
- 13개 verify grep 모두 expected output 일치
- 보호 파일 17건 `git diff --stat` 빈 출력
- 8 내부 컴포넌트 시그니처 + 13 비즈 함수 + JSZip + NotificationPreferences + 6 collapsible localStorage 키 1 byte 변경 0
- OQ #4/#6/#7/#5/W3-#A/W5-#5-A 6 LOCKED 모두 적용
- W6 §7 노안 격상 22건 적용 (9/10/11 → 12/13)
- atomic 1-commit on `redesign/31-chrome` 완료
  </done>
</task>

</tasks>

<verification>

## 단일 task atomic verify (commit 직전)

**14건 grep + 1 git diff + 1 tsc:**
1. `tsc --noEmit` 0 errors
2. Lucide import 라인 1 회 정확 `import { ChevronRight, X, Send, Loader2 } from 'lucide-react'`
3. 이모지 (⏳🔔) 0건
4. ✕ 텍스트 글리프 0건
5. gear svg path `M10.325 4.317` 1건 (OQ #5)
6. 프로필 그라데이션 `linear-gradient.*7c3aed` 0건 (OQ #4 폐기)
7. `bg-accent-active` ≥1건
8. panel width `88%` 또는 `w-[88%]` ≥1건 (OQ #7)
9. 6 collapsible localStorage 키 `settings.{notif,display,account,db,appinfo}.collapsed` = 5건
10. NotificationPreferences 6 키 ≥6건
11. JSZip ≥2건
12. DB/R2/push API endpoint ≥7건
13. `fontSize: 9|10|11` 0건 (W6 §7.1)
14. legacy alias body markup `var(--{bg,bg2,bg3,bg4,bd,bd2,t1,t2,t3,acl,danger,safe,...})` 0건
15. 보호 파일 17건 `git diff --stat` 빈 출력 (0 byte)

## 보호 파일 (17건 + utils 3건 = 20 보호 path)

- `cha-bio-safety/src/App.tsx`
- `cha-bio-safety/src/components/GlobalHeader.tsx` (W7)
- `cha-bio-safety/src/components/SideMenu.tsx` (W8)
- `cha-bio-safety/src/components/MenuSettingsSection.tsx` (W10)
- `cha-bio-safety/src/styles/tokens.css`
- `cha-bio-safety/src/styles/typography.css`
- `cha-bio-safety/tailwind.config.js`
- `cha-bio-safety/docs/redesign-context/00-design-context/`
- `cha-bio-safety/docs/redesign-context/31-chrome/` 12 파일 (wave-1-index.md / 4 .tsx / 4 sketch html / design-system.md / tokens.css / typography.css)
- `cha-bio-safety/src/utils/api.ts` (settingsApi/authApi/pushApi/staffApi 시그니처 + NotificationPreferences type)
- `cha-bio-safety/src/stores/authStore.ts`
- `cha-bio-safety/src/hooks/useStaffList.ts`

## 페이지 보호 (src/pages/ 전체 변경 0)

해당 task 가 chrome 컴포넌트만 다룸 — src/pages/ 어떤 파일도 수정 X.
</verification>

<success_criteria>

- `cha-bio-safety/src/components/SettingsPanel.tsx` 변환 완료, 약 850~900 라인
- `npx tsc --noEmit` 0 errors
- 15건 verify grep + 1 git diff 모두 expected output 일치
- 8 내부 컴포넌트 시그니처 + 13 비즈 함수 + JSZip 백업/복원 + NotificationPreferences 6 키 + 6 collapsible localStorage 키 1 byte 변경 0
- OQ #4 (그라데이션 폐기) / OQ #6 (이모지 제거) / W3-OQ #A (✕ → Lucide X) / W5 OQ #5-A (Toggle accent) / OQ #7 (panel width 보존) / OQ #5 (gear + DB/R2 svg path 유지) 6 LOCKED 적용
- W6 §7 노안 격상 22건 (9/10/11px → 12/13px) 적용
- legacy alias `var(--bg*)` / raw hex (#2563eb, #7c3aed, #dc2626 인라인 form) 0건
- 인라인 잔존 5~7 예외 (모두 사유 코멘트 첨부)
- 보호 파일 17~20건 git diff 0 byte
- atomic 1-commit on `redesign/31-chrome`
- chrome 4 컴포넌트 변환 완결 (W7 + W8 + W9 + W10)

</success_criteria>

<output>
After completion, create `.planning/quick/260527-aye-redesign-31-chrome-w9-settingspanel-tsx-/260527-aye-SUMMARY.md` documenting:
- 변환 전후 라인 수 + 인라인 잔존 예외 정확한 개수 + 각 예외 사유 위치 (line N)
- 15건 verify grep 결과 표
- 보호 파일 17~20건 git diff 결과
- chunk size 변화 (선택 — npm run build 실행 시)
- chrome 4 컴포넌트 (W7~W10) 변환 완결 박제

추후 사용자가 main 머지 + push 결정 시:
- `git push origin redesign/31-chrome` → GitHub Actions → cbc7119-preview 자동 배포
- 사용자 컨펌 후 main 머지 (redesign 작업 = 사용자 명시 컨펌 후 main 머지, memory `feedback_deploy_test`)
</output>
