---
phase: quick-260527-8gc
plan: 01
subsystem: chrome
tags:
  - redesign/31-chrome
  - W10
  - tsx-conversion
  - tailwind-class-only
  - MenuSettingsSection
  - atomic-1-commit
  - v0.1.1-semantic-tokens
dependency_graph:
  requires:
    - W7 GlobalHeader (완결, 패턴 precedent)
    - W5 sketch (LOCKED, OQ #B accent-active)
    - W6 checklist (43 anchor + 17 Korean copy)
    - Phase 21 DEFAULT_SIDE_MENU (forward-merge 의존, src/utils/api.ts)
  provides:
    - chrome 4 컴포넌트 TSX 변환의 2/4 단계 (W7 + W10)
    - MenuSettingsSection.tsx Tailwind class only 형태
  affects:
    - cha-bio-safety/src/components/MenuSettingsSection.tsx (live)
tech-stack:
  added: []
  patterns:
    - Tailwind class only (inline style 0)
    - v0.1.1 semantic 토큰 (text-text-*/bg-surface-*/bg-accent-active/text-text-on-accent)
    - W5-OQ #B Toggle 토큰화 (raw #2563eb → bg-accent-active, raw #fff knob → bg-text-on-accent)
    - 노안 격상 8건 (fontSize 9·10 → 12)
    - arbitrary class (w-[38px] h-[21px] / w-[17px] h-[17px] / rounded-[6px] / rounded-[9px] / translate-x-[17px] / tracking-[.08em])
    - ternary class 분기 (collapsed mb / Toggle on/off / ArrowButton disabled / Save dirty)
key-files:
  created: []
  modified:
    - cha-bio-safety/src/components/MenuSettingsSection.tsx
decisions:
  - W5-OQ #B LOCKED — Toggle on bg = bg-accent-active (var(--accent-active)) / knob = bg-text-on-accent (var(--text-on-accent)). raw #2563eb / #fff body 0
  - 32×32 ArrowButton / Trash = w-7 h-7 (tailwind.config '7':'32px' — w-8 = 48px 함정 회피)
  - status-danger 풀이름 사용 X — codebase convention 인 bg-danger / text-danger 채택 (tailwind.config: danger alias만 정의, status-danger 토큰 정의 0; memory feedback_tailwind_token_class_pattern 의 "status- prefix 없음" 룰 따름)
  - rounded-[9px] arbitrary 채택 (sketch verbatim 9px, tailwind sm=8 / md=12 사이 → arbitrary)
  - rounded-[6px] arbitrary 채택 (sketch verbatim 6px confirm buttons)
  - h-9 = 36px (+ 구분선 추가), h-10 = 40px (Save + DividerTitleInput) 의 tailwind 표준 4pt 매핑
  - text-label = 13px (DividerTitleInput fontSize 13 sketch verbatim, tailwind.config fontSize.label 매핑)
metrics:
  duration: ~25 분 (verify gate 포함)
  completed: 2026-05-27
---

# Phase quick-260527-8gc Plan 01: redesign/31-chrome W10 MenuSettingsSection TSX 변환 Summary

W7 GlobalHeader (완결) 의 Tailwind class only 패턴을 mirror — `cha-bio-safety/src/components/MenuSettingsSection.tsx` (418 → 379 라인) 단일 atomic 1-commit TSX 변환. 비즈 anchor 43건 + 17 Korean copy + Phase 21 DEFAULT_SIDE_MENU 의존 1 byte 변경 0, 노안 격상 8건 적용, W5-OQ #B LOCKED Toggle 토큰화 (raw #2563eb / #fff knob 폐기).

## What was done

### 변환 line count

| 항목 | before | after |
|------|--------|-------|
| MenuSettingsSection.tsx | 418 lines | 379 lines |
| 변경 stat | — | 1 file changed, 39 insertions(+), 78 deletions(-) |

순수 감소 = -39 lines (Tailwind class 가독성으로 redundant `style={{}}` 객체 제거).

### 8 노안 격상 매핑 결과 (실측 line — 변환 후 파일 기준)

| source line (before) | size before | 변환 후 line (after) | Tailwind class | 의미 |
|---|---|---|---|---|
| L173 | fontSize 9 | L176 | `text-caption leading-none font-bold text-text-tertiary tracking-[.08em] uppercase` | "메뉴 설정" SectionHeader |
| L214 | fontSize 9 | L224 | `text-caption leading-none font-bold text-text-secondary tracking-[.08em] uppercase ...` | divider title uppercase |
| L263 | fontSize 9 | L262 | `text-caption leading-none text-text-tertiary shrink-0` | "숨김" 라벨 |
| L294 | fontSize 10 | L278 | `text-caption leading-none text-text-secondary` | "기본 배치로 되돌릴까요?" |
| L297 | fontSize 10 | L281 | `bg-surface-active text-text-secondary border-none rounded-[6px] px-2 py-1 text-caption leading-none font-bold cursor-pointer` | reset 취소 button |
| L301 | fontSize 10 | L285 | `bg-danger text-text-on-accent border-none rounded-[6px] px-2 py-1 text-caption leading-none font-bold cursor-pointer` | reset 초기화 button |
| L307 | fontSize 10 | L290 | `bg-transparent border-none text-text-tertiary text-caption leading-none cursor-pointer p-0` | "기본값으로 초기화" link |
| L407 | fontSize 10 | L368 | `text-caption leading-none text-text-secondary` | "삭제할까요?" delete confirm |

모두 12px (lh:1.5) text-caption + leading-none 명시 (memory `feedback_text_caption_leading_none` 의 작은 컨테이너 안 leading-none 룰 적용).

### W5-OQ #B Toggle 토큰화 결과

| 항목 | source | 변환 후 |
|------|--------|--------|
| Toggle outer on | `background: '#2563eb'` | `bg-accent-active` |
| Toggle outer off | `background: 'var(--bg4)'` | `bg-surface-active` |
| Knob bg | `background: '#fff'` | `bg-text-on-accent` |
| Knob translate | `transform: on ? 'translateX(17px)' : 'translateX(0)'` | `${on ? 'translate-x-[17px]' : 'translate-x-0'}` |

검증 grep:
```
grep -c '#2563eb' MenuSettingsSection.tsx        # = 0 (raw 폐기) ✓
grep -c 'bg-accent-active' MenuSettingsSection.tsx  # = 1 (Toggle on) ✓
grep -c "'#fff'" MenuSettingsSection.tsx          # = 0 ✓
grep -c "bg-text-on-accent" MenuSettingsSection.tsx # = 1 (knob) ✓
grep -c "text-text-on-accent" MenuSettingsSection.tsx # = 4 (knob + 초기화/삭제/Save 텍스트)
```

### legacy alias 8종 → v0.1.1 semantic 토큰 치환 결과

| legacy alias | usage count (source) | 변환 후 Tailwind class | 변환 후 body match |
|---|---|---|---|
| `var(--t1)` | 2 (item-label + DividerTitleInput) | `text-text-primary` | 2 |
| `var(--t2)` | 5 (divider-title + reset prompt + 취소 button + reset link + delete prompt + delete 취소) | `text-text-secondary` | 7 (포함 surface-active text colors) |
| `var(--t3)` | 3 (section-label + hidden tag + reset default link) | `text-text-tertiary` | 4 (포함 ChevronRight color) |
| `var(--bg3)` | 3 (divider row + item row + DividerTitleInput) | `bg-surface-sunken` | 3 |
| `var(--bg4)` | 3 (Toggle off + reset 취소 + delete 취소) | `bg-surface-active` | 3 |
| `var(--bd2)` | 2 (divider border-left + "+ 구분선 추가" dashed) | `border-border-strong` | 2 |
| `var(--danger)` | 3 (Trash button + reset 초기화 button + delete 삭제 button) | `text-danger / bg-danger` | 3 (text-danger×1 + bg-danger×2) |
| `var(--acl)` | 2 (DividerTitleInput border + Save button bg) | `border-accent / bg-accent` | 2 (border-accent×1 + bg-accent×1) |

총 검증:
```
grep -cE 'var\(--(bg3|bg4|bd2|t1|t2|t3|danger|acl)\)' MenuSettingsSection.tsx  # = 0 ✓
```

### 4 subcomponent 시그니처 verbatim 유지 grep 결과

```
grep -c "function ArrowButton" MenuSettingsSection.tsx        # = 1 ✓
grep -c "function ToggleSmall" MenuSettingsSection.tsx        # = 1 ✓
grep -c "function DividerTitleInput" MenuSettingsSection.tsx  # = 1 ✓
grep -c "function DeleteConfirmInline" MenuSettingsSection.tsx # = 1 ✓
```

4 subcomponent 내부 비즈 (1 byte 변경 0):
- ArrowButton: `dir: 'up' | 'down'`, `disabled: boolean`, `onClick: () => void`, `Icon = dir === 'up' ? ChevronUp : ChevronDown`, aria-label '위로 이동' / '아래로 이동', `Icon size={14}`
- ToggleSmall: `on: boolean`, `onChange: () => void`, `ariaLabel: string`, `aria-pressed={on}`, knob 17×17
- DividerTitleInput: `useState(initial)`, `useRef<HTMLInputElement>`, `useEffect(() => { ref.current?.focus(); ref.current?.select() }, [])`, `maxLength={20}`, Enter blur / Escape revert, aria-label "구분선 제목"
- DeleteConfirmInline: `flex items-center gap-1.5`, "삭제할까요?" / 취소 / 삭제

### 비즈 anchor 43건 + 17 Korean copy 보존 sample grep 결과

| anchor | grep | result |
|---|---|---|
| MENU.forEach IIFE (PATH_LABEL) | `grep -c "MENU.forEach(s => s.items.forEach"` | 1 ✓ |
| DESKTOP_ONLY_PATHS | `grep -c "MENU.flatMap(s => s.items).filter(i => i.desktopOnly)"` | 1 ✓ |
| ADMIN_PATHS | `grep -c "MENU.flatMap(s => s.items).filter(i => i.role === 'admin')"` | 1 ✓ |
| settingsApi getMenu/saveMenu | `grep -c "settingsApi.getMenu\|settingsApi.saveMenu"` | 2 ✓ |
| queryKey ['menu-config'] | `grep -c "menu-config"` | 2 ✓ |
| DEFAULT_SIDE_MENU spread map | `grep -c "DEFAULT_SIDE_MENU.map(e => ({ ...e }))"` | 2 (draft init + resetToDefaults) ✓ |
| entriesEqual | `grep -c "entriesEqual"` | 2 (def + dirty useMemo) ✓ |
| newDividerId | `grep -c "newDividerId"` | 2 (def + call) ✓ |
| confirmTimerRef | `grep -c "confirmTimerRef"` | 5 ✓ |
| menuSettings.collapsed | `grep -c "menuSettings.collapsed"` | 2 ✓ |
| saveMutation.isPending | `grep -c "saveMutation.isPending"` | 3 ✓ |
| 저장 중… (U+2026) | `grep -c "저장 중…"` | 1 ✓ (L304) |
| 5000 (auto-dismiss ms) | `grep -c "5000"` | 1 ✓ |
| 메뉴 설정이 저장되었습니다 toast | grep | 1 ✓ |
| 저장에 실패했습니다 toast | grep | 1 ✓ |
| 17 Korean copy 5 unique 패턴 (기본 배치/+/설정 저장/기본값/삭제할까요) | regex | 6 (incl 1 comment) ✓ |
| 새 구분선 | grep | 1 ✓ |

### 보호 파일 22개 git diff 0 byte 확인

```
git diff --stat <17개 W6 §12.5 + 5 live 파일>
# 출력: 빈 줄 (EXIT=0)
```

22개 파일 1 byte 변경 0 확인:
- `src/App.tsx`, `src/styles/tokens.css`, `src/styles/typography.css`, `tailwind.config.js`
- `docs/redesign-context/00-design-context/` (디렉토리)
- `docs/redesign-context/31-chrome/`: `wave-1-index.md`, 4 sketch HTML (W2/3/4/5), 4 snapshot TSX (Global/Side/Settings/MenuSettings), `design-system.md`, `tokens.css`, `typography.css`
- live: `src/components/{GlobalHeader,SideMenu,SettingsPanel}.tsx`, `src/utils/api.ts`, `src/stores/authStore.ts`

### 빌드 결과

| 검사 | 결과 |
|------|------|
| `npx tsc --noEmit` | 0 errors (EXIT=0) ✓ |
| `npm run build` | PASS (✓ built in 14.71s, PWA injectManifest 82 entries) ✓ |
| chunk size warning | vendor 2818 kB (기존, 본 W10 무관) |

### atomic 1-commit hash

```
03d10f6 feat(redesign/31-chrome-W10): MenuSettingsSection.tsx Tailwind class only atomic 변환
```

- 1 file changed: `cha-bio-safety/src/components/MenuSettingsSection.tsx`
- +39 insertions, -78 deletions (net -39 lines)
- 보호 파일 22개 0 byte 변경
- W6 §1.1 OQ #8 LOCKED atomic 1-commit 룰 충족

### main 머지 컨펌 대기 상태

본 SUMMARY 작성 시점: `redesign/31-chrome` branch HEAD = `03d10f6`. main 머지는 **사용자 컨펌 후** (memory `feedback_deploy_test` 의 redesign 트랙 룰). `wrangler` / `npm run deploy` 실행 0 (memory `feedback_cbc7119_design_never_wrangler` 룰).

main 머지 시:
1. `git fetch && git checkout main && git merge --no-ff redesign/31-chrome -m "Merge redesign/31-chrome — W10 MenuSettingsSection TSX atomic 변환"`
2. `git push origin main`
3. GitHub Actions → cbc7119-preview.pages.dev 자동 배포

### chrome 4 컴포넌트 TSX 변환 진행 상황

| Wave | 컴포넌트 | 라인 (before → after) | 상태 |
|------|----------|----------------------|------|
| W7 | GlobalHeader.tsx | (precedent) | ✅ 완결 (이미 머지) |
| W8 | SideMenu.tsx | TBD | ⏳ 남음 |
| W9 | SettingsPanel.tsx | TBD | ⏳ 남음 |
| **W10** | **MenuSettingsSection.tsx** | **418 → 379** | **✅ 완결 (본 quick 03d10f6)** |

진행률 = 2/4 (50%). 남은 W8/W9 는 별도 quick 또는 phase 로 진행 예상.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Convention] `bg-status-danger` / `text-status-danger` → `bg-danger` / `text-danger`**
- **Found during:** Task 1 변환 시 tailwind.config 확인
- **Issue:** Plan 의 §C 치환 가이드는 `var(--danger) → text-status-danger / bg-status-danger` 사용을 제안 (Tailwind class 풀이름 OK 라고 명시), but tailwind.config 의 colors 정의에는 `danger / fire / warning / safe / info` alias만 있고 `status-danger` 토큰은 존재하지 않음. 또한 memory `feedback_tailwind_token_class_pattern` 의 "status- prefix 없음" 룰 + codebase 의 `text-danger / bg-danger` 사용 precedent (KoelsaHistorySection, AccessBlockedPopup, EducationPage, LegalFindingsPage 등) 와 일치.
- **Fix:** `bg-danger` (reset 초기화 + delete 삭제 button) + `text-danger` (Trash button) 사용.
- **Files modified:** `cha-bio-safety/src/components/MenuSettingsSection.tsx` (L242 Trash text-danger / L285 reset 초기화 bg-danger / L372 delete 삭제 bg-danger)
- **Commit:** 03d10f6
- **Plan negative_gate item 8 호환:** "status- prefix className 단독 사용 0" — `bg-danger` / `text-danger` 사용은 `status-` prefix 없음 → 룰 위반 0 (오히려 룰 준수)

### 사용자 결정 변경 0

W5 sketch + W6 checklist + Plan 의 모든 LOCKED 결정 (8 노안 격상 / W5-OQ #B Toggle 토큰화 / w-7 32×32 / radius arbitrary) 그대로 적용. 새 디자인 결정 0.

## 메모리 박제 필요 사실

새 박제 룰 없음 (Plan 의 모든 결정이 이미 LOCKED, deviation 도 기존 memory `feedback_tailwind_token_class_pattern` 룰 적용에 불과).

다만 다음 사실이 차후 W8 / W9 변환에서 참조 가능:
- **codebase status alias convention** = `bg-danger` / `text-danger` (NOT `bg-status-danger` / `text-status-danger`) — tailwind.config + 6+ 컴포넌트 precedent. Plan-level "풀이름 OK" 권고 vs memory rule "status- prefix 없음" 충돌 시 → memory rule + codebase convention 우선.

## Threat Flags

신규 보안 surface 0 — MenuSettingsSection 은 TSX 변환만, settingsApi 시그니처 / authStore 사용 / localStorage 키 1 byte 변경 0. 기존 threat register T-W10-01 ~ T-W10-06 mitigation 모두 유지.

## Self-Check: PASSED

**파일 존재 확인:**
- `cha-bio-safety/src/components/MenuSettingsSection.tsx` ✓ FOUND (379 lines)

**커밋 확인:**
- `03d10f6 feat(redesign/31-chrome-W10): MenuSettingsSection.tsx Tailwind class only atomic 변환` ✓ FOUND in `git log --oneline`

**verify gate 자동 검사 PASS:**
- (A) imports/signatures: import MENU=1, DEFAULT_SIDE_MENU=3, PATH_LABEL/DESKTOP_ONLY/ADMIN=7 ✓
- (B) 비즈 anchor: 5000=1, menu-config=2, menuSettings.collapsed=2, 5 unique copy=6 (incl 1 comment), 메뉴 설정이 저장되었습니다=1, 저장에 실패했습니다=1, 새 구분선=1 ✓
- (C) subcomponents: ArrowButton=1, ToggleSmall=1, DividerTitleInput=1, DeleteConfirmInline=1 ✓
- (D) W5-OQ #B: #2563eb=0, bg-accent-active=1 ✓
- (E) negative gate: fontSize 9/10/11=0, text-[9/10/11px]=0, legacy alias=0, style={{=0, linear-gradient=0, ✕=0, emoji=0 ✓
- (F) w-7 h-7: =2 ✓ (ArrowButton + Trash)
- (G) line count: 379 (참고용)
- (H) tsc=0 errors, build PASS ✓
- (I) 보호 파일 22개 git diff: empty ✓

**negative_gate 23 항목 모두 PASS** — W6 §11 + §12.4 verify gate 모두 통과.
