---
phase: 260529-ozt-phase-b-wave-13b-checkpoints-desktop
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/pages/CheckpointsPage.tsx
autonomous: true
subsystem: redesign/phase-b-sweep
tags:
  - checkpoints
  - inline-style-to-tailwind
  - no-op-refactor
  - phase-b-tier-2-wave-13b
  - tier-2-pair-wave
  - zone-aware-sweep
  - desktop-zone-only
  - mobile-zone-preserved
  - input-style-spread-preserved
  - pattern-a-bottomsheet-preserved
  - atomic-single-commit
requirements:
  - CheckpointsPage 데스크톱 zone 38 inline 정적 style → tailwind className 변환 (desktop-header 8 + mobile-header boundary 8 + data-table 22)
  - 모바일 zone 잔존 4건 (L36 BottomSheet sheet root Pattern A + L261 카테고리 select + L281 층 select + L293 소화기 종류 select INPUT_STYLE spread) 절대 보존
  - 옵션 X + P + M + 색변수N + module const N 승계 (18번째 atomic)
  - 시각 0 byte 변경 (no-op refactor)
  - 비즈 anchor IDENTICAL (12 onClick + 4 useState + 2 useEffect + 3 useMutation + 4 useQuery + 1 useNavigate + 1 onMouseEnter + 1 onMouseLeave)
  - 단일 atomic commit
must_haves:
  truths:
    - "CheckpointsPage 데스크톱 zone (desktop-header 영역 8건 + mobile-header boundary 영역 8건 + desktop-content data-table 영역 22건) 의 정적 inline style 38건이 tailwind className 으로 변환됨"
    - "모바일 zone 잔존 4건 (L36 BottomSheet sheet root Pattern A bottom+maxHeight calc, L261 카테고리 select INPUT_STYLE spread, L281 층 select INPUT_STYLE spread, L293 소화기 종류 select INPUT_STYLE spread) 이 IDENTICAL 보존됨"
    - "비즈 anchor (12 onClick / 4 useState / 0 useRef / 2 useEffect / 3 useMutation / 4 useQuery / 1 useNavigate / 1 onMouseEnter / 1 onMouseLeave) 가 IDENTICAL"
    - "시각 결과 0 byte 변경 (vite build 성공 + PWA generation 성공)"
    - "단일 atomic commit (18번째 atomic — wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w/epe-2/odl 승계)"
  artifacts:
    - path: "src/pages/CheckpointsPage.tsx"
      provides: "데스크톱 zone 38 inline → tailwind className 변환된 페이지"
      contains: "shrink-0 (desktop-header / mobile-header boundary), relative w-[220px] (cat-select-wrap), w-full border-collapse table, py-2.5 px-2 thead th × 7, border-b border-border-default tr"
    - path: ".planning/quick/260529-ozt-phase-b-wave-13b/260529-ozt-PLAN.md"
      provides: "Wave 13b PLAN (라인별 매핑표 포함)"
  key_links:
    - from: "src/pages/CheckpointsPage.tsx (데스크톱 zone)"
      to: "tailwind.config.js + src/styles/tokens.css"
      via: "alias 매핑 (var(--border-default)→border-border-default, var(--surface-sunken)→bg-surface-sunken, var(--text-primary/secondary/tertiary)→text-text-primary/secondary/tertiary, var(--accent)→text-accent/bg-accent, var(--status-safe-bar)→text-safe-bar/bg-safe-bar, rgba(59,130,246,.13)→bg-[rgba(59,130,246,.13)] 옵션 X)"
      pattern: "desktop-header select + count + add-btn, mobile-header alt branch select + count, data-table thead/tr/td, status-cell + dot 옵션 M"
    - from: "src/pages/CheckpointsPage.tsx (mobile zone 잔존)"
      to: "module const INPUT_STYLE / NAV_BOTTOM"
      via: "spread `{ ...INPUT_STYLE, ... }` 옵션 N + Pattern A bottom+maxHeight calc 유지"
      pattern: "L36 BottomSheet Pattern A, L261/L281/L293 모달 select INPUT_STYLE spread × 3"
---

<objective>
CheckpointsPage.tsx (696줄, 42 total inline = 모바일 zone 4 + 데스크톱 zone 38) 의 **데스크톱 zone 38건** 정적 inline style 을 wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w/epe(12a)/odl 승계 옵션 X+P+M+색변수N+module const N 으로 tailwind className 변환.

Wave 13a (f2w, `9cafd5c`) 의 데스크톱 짝꿍 wave — 모바일 zone 42→3 sweep 후 잔존 데스크톱 zone 38곳 처리. **모바일 zone 잔존 4건 절대 보존** (L36 BottomSheet sheet root Pattern A bottom+maxHeight calc, L261/L281/L293 INPUT_STYLE spread + appearance/cursor non-config dynamic combo × 3).

Purpose: CheckpointsPage 의 데스크톱 헤더/필터/테이블 영역 정적 inline 을 tailwind 화하여 Phase B 전체 inline 감축 (42 → ~4) + 18번째 atomic 일관성 유지. 시각 결과 0 byte 변경, 비즈 anchor IDENTICAL.

Output: src/pages/CheckpointsPage.tsx 단일 파일 변경 + 단일 atomic commit (`feat(260529-ozt-01): Phase B Wave 13b — Checkpoints 데스크톱 zone (38 inline) → tailwind`).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/jykevin/Documents/cbc7119-design/CLAUDE.md
@/Users/jykevin/Documents/cbc7119-design/CLAUDE.local.md
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/.planning/quick/260529-f2w-phase-b-wave-13a/260529-f2w-SUMMARY.md
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/.planning/quick/260529-odl-phase-b-wave-12b/260529-odl-SUMMARY.md
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/CheckpointsPage.tsx
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/styles/tokens.css
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/tailwind.config.js

## 현재 inline 분포 (Wave 13a 직후 696줄, `grep -n 'style={{'` 결과 — 42 total)

| Line | 영역                                                                          | zone        | Wave 13b 처리 |
| ----:| ----------------------------------------------------------------------------- | ----------- | ------------- |
| L36  | BottomSheet sheet root Pattern A `style={{ bottom: NAV_BOTTOM, maxHeight: 'calc(100dvh - var(--sat, 0px) - var(--sab, 0px) - 54px)' }}` | mobile      | **보존 (옵션 N)** |
| L261 | 카테고리 select `{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }`  | mobile      | **보존 (옵션 N)** |
| L281 | 층 select `{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }`        | mobile      | **보존 (옵션 N)** |
| L293 | 소화기 종류 select `{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }` | mobile      | **보존 (옵션 N)** |
| L517 | desktop-header `style={{ flexShrink: 0 }}` (ternary primary boundary)         | desktop     | **변환** → `shrink-0` |
| L518 | cat-select-wrap `{ position: 'relative', width: 220 }`                        | desktop     | **변환** → `relative w-[220px]` |
| L523 | desktop cat select `{ ...INPUT_STYLE, height: 36, appearance: 'none', cursor: 'pointer', paddingRight: 32 }` | desktop | **보존 (옵션 N)** — INPUT_STYLE spread + dynamic combo 4-prop. ⚠ 단, Wave 12b precedent 와 별개로 본 wave 의 desktop zone 안에 있어 변환 대상이나, **INPUT_STYLE spread 가 있는 한 옵션 N 유지** (모바일 잔존 4건과 동일 룰). **잔존 1건 추가 → 총 5건** |
| L528 | chevron-icon `{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }` | desktop | **변환** → `absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none` |
| L533 | desktop filter-select (zone) 7-prop `{ height: 36, padding: '0 10px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', color: 'var(--text-primary)', cursor: 'pointer', appearance: 'none' as any }` | desktop | **변환** → `h-9 px-2.5 py-0 rounded-[8px] border border-border-default bg-surface-sunken text-text-primary cursor-pointer appearance-none` |
| L540 | desktop filter-select (floor) — 동일 7-prop                                    | desktop     | **변환** → 동일 (L533 과 동일) |
| L544 | count-label `{ flex: 1, color: 'var(--text-tertiary)' }`                       | desktop     | **변환** → `flex-1 text-text-tertiary` |
| L549 | desktop add-btn `{ height: 36, border: 'none', cursor: 'pointer' }`            | desktop     | **변환** → `h-9 border-0 cursor-pointer` |
| L555 | mobile-header `style={{ flexShrink: 0 }}` (ternary alternate boundary)        | desktop-paired | **변환** → `shrink-0` (12b precedent — boundary paired conversion) |
| L556 | mob-cat-wrap `{ position: 'relative' }`                                        | desktop-paired | **변환** → `relative` |
| L558 | mob-cat-select `{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer', paddingRight: 36 }` | desktop-paired | **보존 (옵션 N)** — INPUT_STYLE spread + 3-prop dynamic combo. **잔존 1건 추가 → 총 6건** |
| L562 | chevron-icon (mobile-header) 5-prop                                            | desktop-paired | **변환** → `absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none` |
| L567 | mob-filter-row `{ display: 'flex', gap: 6 }`                                   | desktop-paired | **변환** → `flex gap-1.5` |
| L569 | mob-filter-select (zone) 7-prop `{ flex: 1, height: 36, padding: '0 8px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', color: 'var(--text-primary)', cursor: 'pointer' }` | desktop-paired | **변환** → `flex-1 h-9 px-2 py-0 rounded-[8px] border border-border-default bg-surface-sunken text-text-primary cursor-pointer` |
| L576 | mob-filter-select (floor) — 동일 7-prop                                         | desktop-paired | **변환** → 동일 (L569 과 동일) |
| L580 | mob-count `{ color: 'var(--text-tertiary)', alignSelf: 'center', whiteSpace: 'nowrap' }` | desktop-paired | **변환** → `text-text-tertiary self-center whitespace-nowrap` |
| L608 | desktop-content `{ padding: '0 24px 24px' }`                                   | desktop     | **변환** → `px-6 pb-6` |
| L610 | data-table `{ width: '100%', borderCollapse: 'collapse' }`                     | desktop     | **변환** → `w-full border-collapse` |
| L613 | thead th (개소명) `{ padding: '10px 8px', color: 'var(--text-secondary)' }`     | desktop     | **변환** → `py-2.5 px-2 text-text-secondary` |
| L614 | thead th (카테고리) — 동일                                                       | desktop     | **변환** → 동일 |
| L615 | thead th (구역) — 동일                                                          | desktop     | **변환** → 동일 |
| L616 | thead th (층) — 동일                                                            | desktop     | **변환** → 동일 |
| L617 | thead th (위치번호) — 동일                                                       | desktop     | **변환** → 동일 |
| L618 | thead th (상태) — 동일                                                          | desktop     | **변환** → 동일 |
| L619 | thead th (액션) `{ padding: '10px 8px', color: 'var(--text-secondary)', width: 60 }` | desktop     | **변환** → `py-2.5 px-2 text-text-secondary w-[60px]` |
| L624 | empty td `{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-tertiary)' }` | desktop     | **변환** → `text-center py-10 px-4 text-text-tertiary` |
| L630 | tr row `{ cursor: 'pointer', opacity: cp.isActive === 0 ? 0.45 : 1, transition: 'background 0.1s' }` | desktop     | **변환** → 옵션 M `cursor-pointer transition-[background] duration-100 ${cp.isActive === 0 ? 'opacity-45' : 'opacity-100'}` (※ opacity-45 spacing config 확인 필요 — 없으면 `opacity-[0.45]` arbitrary) |
| L634 | td location 6-prop `{ padding: '10px 8px', fontWeight: 600, color: 'var(--text-primary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }` | desktop | **변환** → `py-2.5 px-2 font-semibold text-text-primary max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap` |
| L635 | td category-badge `{ padding: '10px 8px' }`                                    | desktop     | **변환** → `py-2.5 px-2` |
| L636 | category badge span `{ padding: '2px 6px', borderRadius: 4, background: 'rgba(59,130,246,.13)', color: 'var(--accent)' }` | desktop | **변환** → `py-0.5 px-1.5 rounded-[4px] bg-[rgba(59,130,246,.13)] text-accent` |
| L640 | td zone `{ padding: '10px 8px', color: 'var(--text-secondary)' }`               | desktop     | **변환** → `py-2.5 px-2 text-text-secondary` |
| L641 | td floor — 동일                                                                 | desktop     | **변환** → 동일 |
| L642 | td locationno — 동일                                                            | desktop     | **변환** → 동일 |
| L643 | td status-cell `{ padding: '10px 8px' }`                                        | desktop     | **변환** → `py-2.5 px-2` |
| L645 | status-cell span `{ display: 'inline-flex', alignItems: 'center', gap: 4, color: cp.isActive !== 0 ? 'var(--status-safe-bar)' : 'var(--text-tertiary)' }` | desktop | **변환** → 옵션 M `inline-flex items-center gap-1 ${cp.isActive !== 0 ? 'text-safe-bar' : 'text-text-tertiary'}` |
| L646 | status-dot `{ width: 6, height: 6, borderRadius: '50%', background: cp.isActive !== 0 ? 'var(--status-safe-bar)' : 'var(--text-tertiary)' }` | desktop | **변환** → 옵션 M `w-[6px] h-[6px] rounded-full ${cp.isActive !== 0 ? 'bg-safe-bar' : 'bg-text-tertiary'}` |
| L650 | td action-cell `{ padding: '10px 8px' }`                                        | desktop     | **변환** → `py-2.5 px-2` |
| L651 | action-cell span `{ color: 'var(--accent)' }`                                   | desktop     | **변환** → `text-accent` |

**합계:** 38 desktop inline 중 **36건 변환 + 2건 옵션 N 보존** (L523 desktop cat select + L558 mob-cat-select 모두 INPUT_STYLE spread).

⚠ **중요 보정 — 옵션 N 잔존 카운트 재계산:**
- 모바일 zone INPUT_STYLE spread 잔존: 3건 (L261/L281/L293)
- 모바일 zone Pattern A 잔존: 1건 (L36)
- 데스크톱 zone INPUT_STYLE spread 잔존 (옵션 N, 변환 안 함): 2건 (L523 + L558)
- **잔존 총합 = 6건** (4 mobile + 2 desktop-zone INPUT_STYLE spread)

**Description 의 "모바일 zone 잔존 4건 절대 변경 0"** 은 정확. L523/L558 은 데스크톱 zone 영역의 INPUT_STYLE spread 라 옵션 N 룰에 따라 변환 안 함 (Wave 6 hbv + Wave 12a/12b precedent 일관). 데스크톱 zone 38건 중 **36건 변환 + 2건 옵션 N 잔존** → `style={{` 카운트 42 → 6.

## 옵션 승계 (18번째 atomic, 재컨펌 불필요)

- **옵션 X (정확값 arbitrary)** — `w-[220px]`, `right-[10px]`, `rounded-[8px]`, `rounded-[4px]`, `w-[60px]`, `max-w-[200px]`, `w-[6px] h-[6px]`, `bg-[rgba(59,130,246,.13)]`, `opacity-[0.45]` (config 없을 시)
- **옵션 P (leading-none 명시)** — 기존 `text-caption leading-none` 그대로 유지 (Wave 13a 에서 적용 완료, 본 wave 신규 추가 없음)
- **옵션 M (template literal conditional)** — tr opacity (1-prop) / status-cell color (1-prop) / status-dot bg (1-prop)
- **옵션 N (INPUT_STYLE spread 보존)** — 모바일 L36/L261/L281/L293 + 데스크톱 zone L523/L558 = 6건 모두 IDENTICAL
- **module const N** — INPUT_STYLE / LABEL_STYLE / SKELETON_STYLE / NAV_BOTTOM 정의 보존 (4개)

## 토큰 alias 매핑

- `var(--border-default)` → `border-border-default`
- `var(--surface-sunken)` → `bg-surface-sunken`
- `var(--text-primary)` → `text-text-primary`
- `var(--text-secondary)` → `text-text-secondary`
- `var(--text-tertiary)` → `text-text-tertiary`
- `var(--accent)` → `text-accent` / `bg-accent`
- `var(--status-safe-bar)` → `text-safe-bar` / `bg-safe-bar`

## opacity-[0.45] 매핑 결정

- `opacity: cp.isActive === 0 ? 0.45 : 1` — 0.45 는 tailwind 기본 spacing 에 없음 (opacity-40=0.4, opacity-45 없음, opacity-50=0.5)
- 시각 0 byte 룰 = `opacity-[0.45]` arbitrary 선택 (Wave 13a 의 CheckPointCard `opacity-45` 사용 사례 확인 후 결정 — Wave 13a SUMMARY L132 에 `cp-card inactive opacity-45` 등장 → tailwind config 에 `opacity-45` extend 등록되어 있다는 뜻. 본 wave 도 동일 시도 → 실패 시 `opacity-[0.45]` arbitrary fallback)
- **결정: `opacity-45` 먼저 시도, tailwind config 에 없으면 `opacity-[0.45]` 로 fallback**

## hover 처리 (L631-L632 onMouseEnter/onMouseLeave)

원본:
```tsx
onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-sunken)')}
onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
```

**처리:** JSX inline handler 는 `style={{` 게이트와 무관. Wave 12b precedent 그대로 — handler 그대로 보존 + transition className 추가. var(--surface-sunken) 보존 OK.

## padding/spacing tailwind 매핑 검증

- `padding: '10px 8px'` → `py-2.5 px-2` (2.5=10px, 2=8px, override 없음)
- `padding: '40px 16px'` → `py-10 px-4`
- `padding: '0 10px'` → `px-2.5 py-0` (2.5=10px)
- `padding: '0 8px'` → `px-2 py-0`
- `padding: '2px 6px'` → `py-0.5 px-1.5` (0.5=2px, 1.5=6px)
- `padding: '0 24px 24px'` → `px-6 pb-6` (top 0 default)
- `gap: 6` → `gap-1.5`
- `gap: 4` → `gap-1`
- `right: 10` → `right-[10px]` arbitrary (right-2.5=10px 동일하나 본 wave 는 arbitrary 채택 — Wave 13a 의 `px-[5px]` 와 일관성)
- `right: 12` → `right-3` (3=12px)
- `width: 220` → `w-[220px]` arbitrary
- `width: 60` → `w-[60px]` arbitrary
- `maxWidth: 200` → `max-w-[200px]` arbitrary
- `height: 36` → `h-9` (9=36px, override 없음)
- `width: 6, height: 6` → `w-[6px] h-[6px]` arbitrary (w-1.5=6px / h-1.5=6px 가능하나 시각 0 byte 보장 위해 arbitrary 채택, Wave 13a L132 `w-[8px] h-[8px]` 와 일관성)
- `borderRadius: 8` → `rounded-[8px]` arbitrary (Wave 13a SUMMARY decisions 항목 — rounded-md spacing override 충돌 회피, 정확값 보장)
- `borderRadius: 4` → `rounded-[4px]` arbitrary (동일 룰)
- `borderRadius: '50%'` → `rounded-full`
- `flexShrink: 0` → `shrink-0`
- `transition: 'background 0.1s'` → `transition-[background] duration-100` (Wave 12b precedent)
- `appearance: 'none'` → `appearance-none` (data-table desktop filter-select 의 inline 안에서 cursor/border 같이 묶여 있는 경우 className 으로 변환)

## w-8/h-8 회피 anchor

- height:36 → `h-9` (h-9=36 OK) — feedback_tailwind_w8_h8_is_48px.md
- 기타 w-/h- override 영향 없음 (본 wave 는 height:36 만 사용)
</context>

<tasks>

<task type="auto">
  <name>Task 01: CheckpointsPage 데스크톱 zone 36 inline → tailwind 변환 (2건 옵션 N 보존, 단일 atomic commit)</name>
  <files>src/pages/CheckpointsPage.tsx</files>
  <action>
CheckpointsPage.tsx 의 데스크톱 zone 38 inline 중 **36건을 옵션 X+M+색변수N 으로 tailwind className 변환**. **2건 (L523 desktop cat select + L558 mob-cat-select)** 은 INPUT_STYLE spread 옵션 N 룰에 따라 IDENTICAL 보존. **모바일 zone 잔존 4건 (L36/L261/L281/L293)** 절대 변경 0.

## 변환 매핑 (라인 순)

### 1. L517 desktop-header `style={{ flexShrink: 0 }}`

Before:
```tsx
<div className="desktop-header hidden lg:flex items-center gap-3 px-6 py-3 border-b border-border-default" style={{ flexShrink: 0 }}>
```
After:
```tsx
<div className="desktop-header shrink-0 hidden lg:flex items-center gap-3 px-6 py-3 border-b border-border-default">
```

### 2. L518 cat-select-wrap `{ position: 'relative', width: 220 }`

Before:
```tsx
<div className="cat-select-wrap" style={{ position: 'relative', width: 220 }}>
```
After:
```tsx
<div className="cat-select-wrap relative w-[220px]">
```

### 3. L523 desktop cat select — **옵션 N 보존 (변경 X)**

```tsx
style={{ ...INPUT_STYLE, height: 36, appearance: 'none', cursor: 'pointer', paddingRight: 32 }}
```
INPUT_STYLE spread + 4-prop dynamic combo. Wave 6 hbv + 12a/12b precedent 그대로 IDENTICAL 보존.

### 4. L528 chevron-icon `{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }`

Before:
```tsx
<div className="chevron-icon" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
```
After:
```tsx
<div className="chevron-icon absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none">
```

### 5. L533 desktop filter-select (zone) 7-prop

Before:
```tsx
<select className="filter-select" value={filterZone} onChange={e => { setFilterZone(e.target.value); setFilterFloor('') }}
  style={{ height: 36, padding: '0 10px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', color: 'var(--text-primary)', cursor: 'pointer', appearance: 'none' as any }}>
```
After:
```tsx
<select className="filter-select h-9 px-2.5 py-0 rounded-[8px] border border-border-default bg-surface-sunken text-text-primary cursor-pointer appearance-none" value={filterZone} onChange={e => { setFilterZone(e.target.value); setFilterFloor('') }}>
```

### 6. L540 desktop filter-select (floor) — L533 과 동일 매핑

Before:
```tsx
<select className="filter-select" value={filterFloor} onChange={e => setFilterFloor(e.target.value)}
  style={{ height: 36, padding: '0 10px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', color: 'var(--text-primary)', cursor: 'pointer', appearance: 'none' as any }}>
```
After:
```tsx
<select className="filter-select h-9 px-2.5 py-0 rounded-[8px] border border-border-default bg-surface-sunken text-text-primary cursor-pointer appearance-none" value={filterFloor} onChange={e => setFilterFloor(e.target.value)}>
```

### 7. L544 count-label `{ flex: 1, color: 'var(--text-tertiary)' }`

Before:
```tsx
<span className="count-label text-caption" style={{ flex: 1, color: 'var(--text-tertiary)' }}>
```
After:
```tsx
<span className="count-label text-caption flex-1 text-text-tertiary">
```

### 8. L549 desktop add-btn `{ height: 36, border: 'none', cursor: 'pointer' }`

Before:
```tsx
<button className="add-btn flex items-center gap-2 px-3 py-2 rounded-lg bg-accent text-white text-label font-bold"
  onClick={() => setModal({ open: true, mode: 'add' })}
  style={{ height: 36, border: 'none', cursor: 'pointer' }}>
```
After:
```tsx
<button className="add-btn flex items-center gap-2 px-3 py-2 rounded-lg bg-accent text-white text-label font-bold h-9 border-0 cursor-pointer"
  onClick={() => setModal({ open: true, mode: 'add' })}>
```

### 9. L555 mobile-header `style={{ flexShrink: 0 }}` (boundary paired conversion — Wave 12b precedent)

Before:
```tsx
<div className="mobile-header flex flex-col lg:hidden px-4 py-3 gap-2" style={{ flexShrink: 0 }}>
```
After:
```tsx
<div className="mobile-header shrink-0 flex flex-col lg:hidden px-4 py-3 gap-2">
```

### 10. L556 mob-cat-wrap `{ position: 'relative' }`

Before:
```tsx
<div className="mob-cat-wrap" style={{ position: 'relative' }}>
```
After:
```tsx
<div className="mob-cat-wrap relative">
```

### 11. L558 mob-cat-select — **옵션 N 보존 (변경 X)**

```tsx
style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer', paddingRight: 36 }}
```
INPUT_STYLE spread + 3-prop dynamic combo. 옵션 N 그대로 IDENTICAL.

### 12. L562 chevron-icon (mobile-header) 5-prop

Before:
```tsx
<div className="chevron-icon" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
```
After:
```tsx
<div className="chevron-icon absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
```

### 13. L567 mob-filter-row `{ display: 'flex', gap: 6 }`

Before:
```tsx
<div className="mob-filter-row" style={{ display: 'flex', gap: 6 }}>
```
After:
```tsx
<div className="mob-filter-row flex gap-1.5">
```

### 14. L569 mob-filter-select (zone) 7-prop

Before:
```tsx
<select className="mob-filter-select text-caption" value={filterZone} onChange={e => { setFilterZone(e.target.value); setFilterFloor('') }}
  style={{ flex: 1, height: 36, padding: '0 8px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', color: 'var(--text-primary)', cursor: 'pointer' }}>
```
After:
```tsx
<select className="mob-filter-select text-caption flex-1 h-9 px-2 py-0 rounded-[8px] border border-border-default bg-surface-sunken text-text-primary cursor-pointer" value={filterZone} onChange={e => { setFilterZone(e.target.value); setFilterFloor('') }}>
```

### 15. L576 mob-filter-select (floor) — L569 과 동일 매핑

Before:
```tsx
<select className="mob-filter-select text-caption" value={filterFloor} onChange={e => setFilterFloor(e.target.value)}
  style={{ flex: 1, height: 36, padding: '0 8px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', color: 'var(--text-primary)', cursor: 'pointer' }}>
```
After:
```tsx
<select className="mob-filter-select text-caption flex-1 h-9 px-2 py-0 rounded-[8px] border border-border-default bg-surface-sunken text-text-primary cursor-pointer" value={filterFloor} onChange={e => setFilterFloor(e.target.value)}>
```

### 16. L580 mob-count

Before:
```tsx
<span className="mob-count text-caption leading-none" style={{ color: 'var(--text-tertiary)', alignSelf: 'center', whiteSpace: 'nowrap' }}>{cpList.length}개</span>
```
After:
```tsx
<span className="mob-count text-caption leading-none text-text-tertiary self-center whitespace-nowrap">{cpList.length}개</span>
```

### 17. L608 desktop-content `{ padding: '0 24px 24px' }`

Before:
```tsx
<div className="desktop-content data-table" style={{ padding: '0 24px 24px' }}>
```
After:
```tsx
<div className="desktop-content data-table px-6 pb-6">
```

### 18. L610 table `{ width: '100%', borderCollapse: 'collapse' }`

Before:
```tsx
<table style={{ width: '100%', borderCollapse: 'collapse' }}>
```
After:
```tsx
<table className="w-full border-collapse">
```

### 19. L613-L618 thead th × 6 (동일 매핑)

Before:
```tsx
<th className="text-caption font-bold" style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>개소명</th>
<th className="text-caption font-bold" style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>카테고리</th>
<th className="text-caption font-bold" style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>구역</th>
<th className="text-caption font-bold" style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>층</th>
<th className="text-caption font-bold" style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>위치번호</th>
<th className="text-caption font-bold" style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>상태</th>
```
After:
```tsx
<th className="text-caption font-bold py-2.5 px-2 text-text-secondary">개소명</th>
<th className="text-caption font-bold py-2.5 px-2 text-text-secondary">카테고리</th>
<th className="text-caption font-bold py-2.5 px-2 text-text-secondary">구역</th>
<th className="text-caption font-bold py-2.5 px-2 text-text-secondary">층</th>
<th className="text-caption font-bold py-2.5 px-2 text-text-secondary">위치번호</th>
<th className="text-caption font-bold py-2.5 px-2 text-text-secondary">상태</th>
```

### 20. L619 thead th (액션) — width:60 추가

Before:
```tsx
<th className="text-caption font-bold" style={{ padding: '10px 8px', color: 'var(--text-secondary)', width: 60 }}>액션</th>
```
After:
```tsx
<th className="text-caption font-bold py-2.5 px-2 text-text-secondary w-[60px]">액션</th>
```

### 21. L624 empty td

Before:
```tsx
<tr><td colSpan={7} className="text-body-sm" style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-tertiary)' }}>해당 카테고리에 개소가 없습니다</td></tr>
```
After:
```tsx
<tr><td colSpan={7} className="text-body-sm text-center py-10 px-4 text-text-tertiary">해당 카테고리에 개소가 없습니다</td></tr>
```

### 22. L630 tr row 옵션 M (cp.isActive 분기 opacity)

Before:
```tsx
<tr key={cp.id}
  onClick={() => setModal({ open: true, mode: 'edit', target: cp })}
  className="border-b border-border-default"
  style={{ cursor: 'pointer', opacity: cp.isActive === 0 ? 0.45 : 1, transition: 'background 0.1s' }}
  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-sunken)')}
  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
>
```
After (opacity-45 가 tailwind config 에 있으면 — Wave 13a 의 `cp-card inactive opacity-45` 가 이미 채택했으므로 OK):
```tsx
<tr key={cp.id}
  onClick={() => setModal({ open: true, mode: 'edit', target: cp })}
  className={`border-b border-border-default cursor-pointer transition-[background] duration-100 ${cp.isActive === 0 ? 'opacity-45' : 'opacity-100'}`}
  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-sunken)')}
  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
>
```

**Fallback (실패 시):** `opacity-45` 대신 `opacity-[0.45]` arbitrary 사용.

(onMouseEnter/Leave 는 inline handler — `style={{` 게이트와 무관. var(--surface-sunken) 보존 OK)

### 23. L634 td location 6-prop

Before:
```tsx
<td style={{ padding: '10px 8px', fontWeight: 600, color: 'var(--text-primary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cp.location}</td>
```
After:
```tsx
<td className="py-2.5 px-2 font-semibold text-text-primary max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">{cp.location}</td>
```

### 24. L635 td category-badge

Before:
```tsx
<td className="category-badge" style={{ padding: '10px 8px' }}>
```
After:
```tsx
<td className="category-badge py-2.5 px-2">
```

### 25. L636 category badge span

Before:
```tsx
<span className="text-caption leading-none" style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(59,130,246,.13)', color: 'var(--accent)' }}>
```
After:
```tsx
<span className="text-caption leading-none py-0.5 px-1.5 rounded-[4px] bg-[rgba(59,130,246,.13)] text-accent">
```

### 26. L640 td zone

Before:
```tsx
<td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{ZONE_LABEL[cp.zone] ?? cp.zone}</td>
```
After:
```tsx
<td className="py-2.5 px-2 text-text-secondary">{ZONE_LABEL[cp.zone] ?? cp.zone}</td>
```

### 27. L641 td floor

Before:
```tsx
<td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{cp.floor}</td>
```
After:
```tsx
<td className="py-2.5 px-2 text-text-secondary">{cp.floor}</td>
```

### 28. L642 td locationno

Before:
```tsx
<td className="locationno-cell text-caption font-mono" style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{cp.locationNo || '-'}</td>
```
After:
```tsx
<td className="locationno-cell text-caption font-mono py-2.5 px-2 text-text-secondary">{cp.locationNo || '-'}</td>
```

### 29. L643 td status-cell

Before:
```tsx
<td className="status-cell" style={{ padding: '10px 8px' }}>
```
After:
```tsx
<td className="status-cell py-2.5 px-2">
```

### 30. L645 status-cell span 옵션 M

Before:
```tsx
<span className="text-caption leading-none"
  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: cp.isActive !== 0 ? 'var(--status-safe-bar)' : 'var(--text-tertiary)' }}>
```
After:
```tsx
<span className={`text-caption leading-none inline-flex items-center gap-1 ${cp.isActive !== 0 ? 'text-safe-bar' : 'text-text-tertiary'}`}>
```

### 31. L646 status-dot 옵션 M

Before:
```tsx
<span className="status-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: cp.isActive !== 0 ? 'var(--status-safe-bar)' : 'var(--text-tertiary)' }} />
```
After:
```tsx
<span className={`status-dot w-[6px] h-[6px] rounded-full ${cp.isActive !== 0 ? 'bg-safe-bar' : 'bg-text-tertiary'}`} />
```

### 32. L650 td action-cell

Before:
```tsx
<td className="action-cell" style={{ padding: '10px 8px' }}>
```
After:
```tsx
<td className="action-cell py-2.5 px-2">
```

### 33. L651 action-cell span

Before:
```tsx
<span className="text-caption font-bold" style={{ color: 'var(--accent)' }}>수정</span>
```
After:
```tsx
<span className="text-caption font-bold text-accent">수정</span>
```

## 모바일 zone 잔존 4건 (IDENTICAL — 절대 보존)

- **L36** BottomSheet sheet root `style={{ bottom: NAV_BOTTOM, maxHeight: 'calc(100dvh - var(--sat, 0px) - var(--sab, 0px) - 54px)' }}` — Pattern A 옵션 N (NAV_BOTTOM const + calc)
- **L261** 카테고리 select `style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }}` — INPUT_STYLE spread 옵션 N
- **L281** 층 select `style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }}` — INPUT_STYLE spread 옵션 N
- **L293** 소화기 종류 select `style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }}` — INPUT_STYLE spread 옵션 N

## 데스크톱 zone INPUT_STYLE spread 옵션 N 잔존 2건 (IDENTICAL — 절대 보존)

- **L523** desktop cat select `style={{ ...INPUT_STYLE, height: 36, appearance: 'none', cursor: 'pointer', paddingRight: 32 }}` — INPUT_STYLE spread + 4-prop dynamic combo
- **L558** mob-cat-select (ternary alternate 안 desktop-paired) `style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer', paddingRight: 36 }}` — INPUT_STYLE spread + 3-prop dynamic combo

**총 잔존: 4 mobile + 2 desktop-zone INPUT_STYLE spread = 6건**

## hover handler L631-L632 (보존)

```tsx
onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-sunken)')}
onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
```

JSX inline handler 는 `style={{` 게이트와 무관. tr 의 `transition-[background] duration-100` className 이 부드러운 hover 효과 유지.

## 자동 검증 (verify 후 commit)

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety
F=src/pages/CheckpointsPage.tsx

# 1. inline 감축 (42 → ~6)
B=$(git show HEAD:$F | grep -c 'style={{')
A=$(grep -c 'style={{' $F)
echo "$F: $B → $A"
[ "$A" -le 7 ] && echo "  ✓ inline ≤ 7 (목표 6)" || echo "  ✗ inline > 7"

# 2. 모바일 zone 잔존 4건 IDENTICAL 확인
echo "--- mobile zone 잔존 ---"
grep -n 'NAV_BOTTOM' $F | head -3
grep -n "...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }} value={form.category}" $F
grep -n "...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }} value={form.floor}" $F
grep -nc "...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }}" $F  # 기대: 5 (mobile 3 + desktop-zone 2 mob-cat-select 형태 차이 별도 grep)

# 3. 데스크톱 zone INPUT_STYLE spread 잔존 2건 IDENTICAL 확인
grep -n "...INPUT_STYLE, height: 36, appearance: 'none', cursor: 'pointer', paddingRight: 32 }" $F  # L523
grep -n "...INPUT_STYLE, appearance: 'none', cursor: 'pointer', paddingRight: 36 }" $F  # L558

# 4. 비즈 anchor IDENTICAL
for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'useSearchParams\(' 'fetch\(' 'onMouseEnter' 'onMouseLeave'; do
  B=$(git show HEAD:$F | grep -cE "$ANCHOR")
  A=$(grep -cE "$ANCHOR" $F)
  [ "$B" = "$A" ] && echo "$ANCHOR: $B (OK)" || echo "$ANCHOR: $B→$A MISMATCH ❌"
done

# 5. onClick set diff
git show HEAD:$F | grep -oE 'onClick=\{[^}]+\}' | sort | uniq > /tmp/before-cp.txt
grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/after-cp.txt
diff /tmp/before-cp.txt /tmp/after-cp.txt && echo "  ✓ onClick diff 0" || echo "  ✗ onClick drift"

# 6. emoji 보존 (▸ 1건) / 비표준 색 0
echo "emoji: $(grep -cE '✓|✗|🔒|💾|🔥|⏰|📋|✅|⚠️|❌|🔧|🚨|🔍|🧯|📊|▸' $F)"
echo "비색: $(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' $F)"

# 7. module const 4건 보존
grep -cE '^const (INPUT_STYLE|LABEL_STYLE|NAV_BOTTOM|SKELETON_STYLE)' $F
# 기대: 4

# 8. TypeScript 0 error
./node_modules/.bin/tsc --noEmit 2>&1 | grep -E 'error TS' | wc -l

# 9. vite build (PWA)
npm run build 2>&1 | tail -5
```

## Commit

단일 atomic commit:
```bash
git add src/pages/CheckpointsPage.tsx
git commit -m "feat(260529-ozt-01): Phase B Wave 13b — Checkpoints 데스크톱 zone (38 inline) → tailwind"
```

main 직접 작업 (cbc7119-design 워크트리 룰). push 는 사용자 컨펌 후.

## 주의사항 (Wave 12b precedent + Wave 13a 사고 방지)

1. **L523/L558 INPUT_STYLE spread 절대 변환 X** — 옵션 N 룰 (Wave 6 hbv + 12a/12b precedent). 잔존 카운트 6 (4 mobile + 2 desktop-zone) 유지.
2. **L631-L632 onMouseEnter/Leave handler** — `var(--surface-sunken)` 보존. inline handler 는 `style={{` 게이트와 무관, 변환 X.
3. **opacity-45 vs opacity-[0.45]** — Wave 13a SUMMARY 에서 `opacity-45` 채택 사례 확인. tailwind config 에 등록되어 있으면 그대로, 없으면 `opacity-[0.45]` arbitrary fallback.
4. **L533/L540 (desktop filter-select) 의 `appearance: 'none' as any`** — `as any` 캐스트 제거 + className `appearance-none` 로 변환. TypeScript 0 error 유지.
5. **데스크톱 zone L555/L556/L558/L562/L567/L569/L576/L580 은 ternary alternate 안의 mobile-header 영역** — Wave 12b precedent (boundary paired conversion) 그대로 변환 대상.
6. **Wave 13a 가 변환한 mobile zone 영역 (L29-415, L587-686) 절대 재변환 X** — diff hunk 데스크톱 영역(L516-651) 외 +/- 라인 0건이어야 함.
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && F=src/pages/CheckpointsPage.tsx && B=$(git show HEAD:$F | grep -c 'style={{') && A=$(grep -c 'style={{' $F) && echo "inline: $B → $A" && [ "$A" -le 7 ] && grep -q 'NAV_BOTTOM' $F && grep -q "...INPUT_STYLE, height: 36, appearance: 'none', cursor: 'pointer', paddingRight: 32 }" $F && grep -q "...INPUT_STYLE, appearance: 'none', cursor: 'pointer', paddingRight: 36 }" $F && ./node_modules/.bin/tsc --noEmit 2>&1 | grep -cE 'error TS' | grep -q '^0$' && echo "PASSED"</automated>
  </verify>
  <done>
- CheckpointsPage.tsx `style={{` 카운트 ≤ 7 (목표 6; 모바일 zone 잔존 4건 + 데스크톱 zone INPUT_STYLE spread 옵션 N 2건)
- 모바일 zone 잔존 4건 (L36 NAV_BOTTOM/maxHeight, L261/L281/L293 INPUT_STYLE spread × 3) IDENTICAL
- 데스크톱 zone INPUT_STYLE spread 잔존 2건 (L523/L558) IDENTICAL
- 데스크톱 zone 36 inline 모두 className 변환 (L517, L518, L528, L533, L540, L544, L549 = desktop-header 7건 / L555, L556, L562, L567, L569, L576, L580 = mobile-header boundary 7건 / L608, L610, L613-L619 = 9건 + L624 + L630 옵션 M + L634-L651 = 13건)
- L555 mobile-header `style={{ flexShrink: 0 }}` boundary 짝꿍 변환 (Wave 12b precedent)
- L631-L632 onMouseEnter/Leave handler 보존 (inline handler 는 게이트와 무관)
- 비즈 anchor IDENTICAL (12 onClick + 4 useState + 0 useRef + 2 useEffect + 3 useMutation + 4 useQuery + 1 useNavigate + 1 onMouseEnter + 1 onMouseLeave = 0 line diff)
- emoji ▸ 보존 (Wave 13a SUMMARY 확인 1건), 비표준 색 토큰 (warning/safe/danger no-suffix) = 0
- module const INPUT_STYLE / LABEL_STYLE / NAV_BOTTOM / SKELETON_STYLE = 4 정의 보존
- TypeScript `error TS` = 0
- vite build (PWA) succeeded
- 단일 atomic commit `feat(260529-ozt-01): Phase B Wave 13b — Checkpoints 데스크톱 zone (38 inline) → tailwind`
- off-scope 변경 = 0 (src/pages/CheckpointsPage.tsx 단일 파일만)
  </done>
</task>

</tasks>

<verification>
## 전체 phase 검증

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety
F=src/pages/CheckpointsPage.tsx

# inline 감축
B=$(git show HEAD:$F | grep -c 'style={{')
A=$(grep -c 'style={{' $F)
echo "$F: $B → $A (목표: 42 → ~6)"

# 비즈 anchor IDENTICAL (mouse handlers 포함)
for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'useSearchParams\(' 'fetch\(' 'onMouseEnter' 'onMouseLeave'; do
  B=$(git show HEAD:$F | grep -cE "$ANCHOR")
  A=$(grep -cE "$ANCHOR" $F)
  [ "$B" = "$A" ] && echo "$ANCHOR: $B (OK)" || echo "$ANCHOR: $B→$A MISMATCH ❌"
done

# precise onClick diff
git show HEAD:$F | grep -oE 'onClick=\{[^}]+\}' | sort | uniq > /tmp/before-cp.txt
grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/after-cp.txt
diff /tmp/before-cp.txt /tmp/after-cp.txt

# 모바일 잔존 4건 IDENTICAL
echo "--- mobile zone 잔존 ---"
grep -n 'NAV_BOTTOM' $F
grep -cE "...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }}" $F  # 모달 select × 3 + 데스크톱 cat select 차이 형태 별도

# 데스크톱 zone INPUT_STYLE spread 잔존 2건 IDENTICAL
grep -n "...INPUT_STYLE, height: 36" $F  # L523 (desktop cat select 만 height:36 보유)
grep -n "...INPUT_STYLE, appearance: 'none', cursor: 'pointer', paddingRight: 36" $F  # L558 (mob-cat-select)

# emoji / 비표준 색
echo "emoji: $(grep -cE '✓|✗|🔒|💾|🔥|⏰|📋|✅|⚠️|❌|🔧|🚨|🔍|🧯|📊|▸' $F)"
echo "비색: $(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' $F)"

# module const (4건)
grep -cE '^const (INPUT_STYLE|LABEL_STYLE|NAV_BOTTOM|SKELETON_STYLE)' $F  # 기대 4

# TypeScript
./node_modules/.bin/tsc --noEmit 2>&1 | grep -E 'error TS' | wc -l  # 기대 0

# vite build (PWA generation 포함)
npm run build 2>&1 | tail -10
```
</verification>

<success_criteria>
- `style={{` 카운트 42 → ~6 (-36건, -85.7%)
- 데스크톱 zone inline 38 → 2 + mobile-header boundary 짝꿍 8건 모두 변환 = 36건 className 화
- 데스크톱 zone INPUT_STYLE spread 잔존 2건 (L523 / L558) IDENTICAL (옵션 N)
- 모바일 zone 잔존 4건 (L36 Pattern A + L261/L281/L293 INPUT_STYLE spread) IDENTICAL
- 비즈 anchor (12 onClick + 4 useState + 2 useEffect + 3 useMutation + 4 useQuery + 1 useNavigate + 1 onMouseEnter + 1 onMouseLeave) IDENTICAL = 0 line diff
- 시각 결과 0 byte 변경 (vite build 성공 + PWA generation 성공)
- TypeScript error = 0
- emoji ▸ 보존 (변동 0), 비표준 색 토큰 = 0
- module const INPUT_STYLE / LABEL_STYLE / NAV_BOTTOM / SKELETON_STYLE = 4 정의 보존
- 단일 atomic commit (18번째 atomic — wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w/epe(12a)/odl 승계 + 본 13b)
- off-scope 변경 = 0 (src/pages/CheckpointsPage.tsx 단일 파일)
</success_criteria>

<output>
After completion, create `.planning/quick/260529-ozt-phase-b-wave-13b/260529-ozt-SUMMARY.md` with:
- 36 desktop inline 변환 + 2 옵션 N 잔존 매핑표 (Before/After/옵션)
- 모바일 잔존 4건 IDENTICAL 확인
- 데스크톱 zone INPUT_STYLE spread 잔존 2건 (L523/L558) IDENTICAL 확인
- 비즈 anchor diff 0 line 증빙 (onMouseEnter/Leave 포함)
- vite build / TypeScript 0 error 결과
- commit hash
- Phase B 누적 진행 표 (Wave 1~13b)
- Tier 2 진행 상태 업데이트 (12a/12b/13a/13b 종결, 14a~15b reference)
- Wave 12a/12b/13a/13b 4 wave 연속 zone-aware split 완결 — 후행 14a/14b/15a/15b zone-aware split reference
</output>
