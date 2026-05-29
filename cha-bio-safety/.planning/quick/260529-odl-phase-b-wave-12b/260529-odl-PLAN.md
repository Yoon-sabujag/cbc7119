---
phase: 260529-odl-phase-b-wave-12b-staffmanage-desktop
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/pages/StaffManagePage.tsx
autonomous: true
subsystem: redesign/phase-b-sweep
tags:
  - staff-manage
  - inline-style-to-tailwind
  - no-op-refactor
  - phase-b-tier-2-wave-12b
  - tier-2-pair-wave
  - zone-aware-sweep
  - desktop-zone-only
  - mobile-zone-preserved
  - label-style-input-style-preserved
  - atomic-single-commit
requirements:
  - StaffManagePage 데스크톱 zone 24 inline 정적 style → tailwind className 변환
  - 모바일 zone 잔존 3건 (BottomSheet sheet root + INPUT_STYLE spread × 2) 절대 보존
  - 옵션 X + P + M + 색변수N + module const N 승계 (17번째 atomic)
  - 시각 0 byte 변경 (no-op refactor)
  - 비즈 anchor IDENTICAL (18 onClick + 3 useState + 2 useEffect + 4 useMutation + 2 useQuery + 1 useNavigate)
  - 단일 atomic commit
must_haves:
  truths:
    - "StaffManagePage 데스크톱 zone (테이블 헤더/행/셀/상태 셀/액션 셀) 의 정적 inline style 24건이 tailwind className 으로 변환됨"
    - "모바일 zone 잔존 3건 (BottomSheet sheet root style L24, form 사번 input spread L210, 입사일 input spread L224) 이 IDENTICAL 보존됨"
    - "데스크톱 ternary 의 mobile-header (L405 `style={{ flexShrink: 0 }}`) boundary 가 변환되어 일관성 확보됨 (Wave 12a SUMMARY 의 boundary 보존 룰은 12a sweep 단계 한정 — 12b 에서는 desktop 분기 변환 시 짝꿍 mobile-header 도 동시 변환)"
    - "비즈 anchor (onClick / useState / useEffect / useMutation / useQuery / useNavigate) 가 IDENTICAL"
    - "시각 결과 0 byte 변경 (vite build 성공 + PWA generation 성공)"
  artifacts:
    - path: "src/pages/StaffManagePage.tsx"
      provides: "데스크톱 zone 24 inline → tailwind className 변환된 페이지"
      contains: "h-10 px-3 rounded-sm bg-accent (desktop add btn), border-collapse w-full table (data-table), p-2.5 thead th × 7, border-b border-border-default cursor-pointer tr"
    - path: ".planning/quick/260529-odl-phase-b-wave-12b/260529-odl-PLAN.md"
      provides: "Wave 12b PLAN (라인별 매핑표 포함)"
  key_links:
    - from: "src/pages/StaffManagePage.tsx (데스크톱 zone)"
      to: "tailwind.config.js + src/styles/tokens.css"
      via: "alias 매핑 (var(--bd)→border-border-default, var(--bg3)→bg-surface-sunken, var(--acl)→text-accent, var(--safe)→bg-safe-bar/text-safe-bar, var(--t1/t2/t3)→text-text-primary/secondary/tertiary, rgba(59,130,246,.13)→bg-[rgba(59,130,246,.13)] 옵션 X)"
      pattern: "data-table, thead th, tr row, role-badge, status-cell + dot"
    - from: "src/pages/StaffManagePage.tsx (mobile zone 잔존)"
      to: "module const INPUT_STYLE / LABEL_STYLE"
      via: "spread `{ ...INPUT_STYLE, ... }` 옵션 N 유지"
      pattern: "L210 사번 input + L224 입사일 input"
---

<objective>
StaffManagePage.tsx (524 줄, 27 total inline = 모바일 zone 3 + 데스크톱 zone 24) 의 **데스크톱 zone 24건** 정적 inline style 을 wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe 승계 옵션 X+P+M+색변수N+module const N 으로 tailwind className 변환.

Wave 12a (epe, `1ca5c94`) 의 데스크톱 짝꿍 wave — 모바일 zone 52→2 sweep 후 잔존 데스크톱 zone 24곳 처리. **모바일 zone 잔존 3건 절대 보존** (L24 BottomSheet sheet root Pattern A bottom+maxHeight calc, L210 사번 input INPUT_STYLE spread + conditional, L224 입사일 input INPUT_STYLE spread + opacity/cursor).

Purpose: StaffManagePage 의 데스크톱 테이블 영역 정적 inline 을 tailwind 화하여 Phase B 전체 inline 감축 (27 → ~3) + 17번째 atomic 일관성 유지. 시각 결과 0 byte 변경, 비즈 anchor IDENTICAL.

Output: src/pages/StaffManagePage.tsx 단일 파일 변경 + 단일 atomic commit (`feat(260529-odl-01): Phase B Wave 12b — StaffManage 데스크톱 zone (24 inline) → tailwind`).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/jykevin/Documents/cbc7119-design/CLAUDE.md
@/Users/jykevin/Documents/cbc7119-design/CLAUDE.local.md
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/.planning/quick/260529-epe-phase-b-wave-12a/260529-epe-SUMMARY.md
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/StaffManagePage.tsx
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/styles/tokens.css
@/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/tailwind.config.js

## 현재 inline 분포 (Wave 12a 직후, `grep -n 'style={{'` 결과)

| Line | 영역                            | zone     | Wave 12b 처리 |
| ----:| ------------------------------- | -------- | ------------- |
| L24  | BottomSheet sheet root (Pattern A `bottom: NAV_BOTTOM` + `maxHeight: calc(100dvh - var(--sat) - var(--sab) - 54px)`) | mobile   | **보존 (옵션 N)** |
| L210 | form 사번 input (`{ ...INPUT_STYLE, fontFamily, ...conditional(mode==='edit') }`) | mobile   | **보존 (옵션 N)** |
| L224 | 입사일 input (`{ ...INPUT_STYLE, opacity: 0.5, cursor: 'not-allowed' }`) | mobile   | **보존 (옵션 N)** |
| L393 | desktop-header `style={{ flexShrink: 0 }}` (boundary) | desktop  | **변환** → `shrink-0` |
| L399 | desktop add btn `style={{ border: 'none', cursor: 'pointer' }}` | desktop  | **변환** → `border-0 cursor-pointer` |
| L405 | mobile-header `style={{ flexShrink: 0 }}` (ternary alternate, boundary) | mobile-but-paired | **변환** → `shrink-0` (12b 에서는 desktop 짝꿍 변환 시 같이) |
| L427 | desktop-content `style={{ padding: '0 24px 24px' }}` | desktop  | **변환** → `px-6 pb-6` |
| L428 | data-table `style={{ width: '100%', borderCollapse: 'collapse' }}` | desktop  | **변환** → `w-full border-collapse` |
| L431-L436 | thead th × 6 `style={{ padding: '10px 8px' }}` | desktop  | **변환** → `py-2.5 px-2` |
| L437 | thead 액션 th `style={{ padding: '10px 8px', width: 60 }}` | desktop  | **변환** → `py-2.5 px-2 w-[60px]` |
| L442 | state-empty td `style={{ padding: '40px 16px' }}` | desktop  | **변환** → `py-10 px-4` |
| L448 | tr row `style={{ borderBottom: '1px solid var(--bd)', cursor: 'pointer', opacity: conditional, transition: 'background 0.1s' }}` | desktop  | **변환** → `border-b border-border-default cursor-pointer transition-[background] duration-100 ${active===0 ? 'opacity-50' : 'opacity-100'}` |
| L452 | name td `style={{ padding: '10px 8px', fontWeight: 600 }}` | desktop  | **변환** → `py-2.5 px-2 font-semibold` |
| L453 | id td `style={{ padding: '10px 8px' }}` | desktop  | **변환** → `py-2.5 px-2` |
| L454 | title td `style={{ padding: '10px 8px' }}` | desktop  | **변환** → `py-2.5 px-2` |
| L455 | role td `style={{ padding: '10px 8px' }}` | desktop  | **변환** → `py-2.5 px-2` |
| L456-L459 | role badge span `style={{ background: conditional, color: conditional }}` (3 lines 펼친 inline) | desktop  | **변환** → 옵션 M template literal `${role==='admin' ? 'bg-[rgba(59,130,246,.13)] text-accent' : 'bg-[rgba(110,118,129,.15)] text-text-secondary'}` |
| L463 | phone td `style={{ padding: '10px 8px' }}` | desktop  | **변환** → `py-2.5 px-2` |
| L464 | status td `style={{ padding: '10px 8px' }}` | desktop  | **변환** → `py-2.5 px-2` |
| L465-L467 | status-cell span `style={{ color: conditional(safe vs t3) }}` | desktop  | **변환** → 옵션 M `${active!==0 ? 'text-safe-bar' : 'text-text-tertiary'}` |
| L468 | status-dot `style={{ background: conditional(safe vs t3) }}` | desktop  | **변환** → 옵션 M `${active!==0 ? 'bg-safe-bar' : 'bg-text-tertiary'}` |
| L472 | action td `style={{ padding: '10px 8px' }}` | desktop  | **변환** → `py-2.5 px-2` |

**합계:** 24 desktop inline + L405 mobile boundary(짝꿍) = 25건 변환. 모바일 잔존 3건 (L24/L210/L224) IDENTICAL.

## 옵션 승계 (17번째 atomic, 재컨펌 불필요)

- **옵션 X (정확값 arbitrary)** — `bg-[rgba(59,130,246,.13)]`, `bg-[rgba(110,118,129,.15)]`, `w-[60px]` 같은 정확값 보존
- **옵션 P (leading-none 명시)** — role-badge / status-cell 의 `leading-none` 그대로 (Wave 12a 에서 이미 적용됨, 12b 는 신규 leading-none 추가 없음)
- **옵션 M (template literal conditional)** — tr opacity / role-badge (bg + color 2-prop) / status-cell color / status-dot bg
- **옵션 N (모바일 잔존 보존)** — L24 / L210 / L224 모두 IDENTICAL
- **module const N** — LABEL_STYLE / INPUT_STYLE / NAV_BOTTOM 보존 (변경 없음, 모바일 zone 잔존 site)

## 토큰 alias 매핑

- `var(--bd)` (1px solid border) → `border-border-default`
- `var(--safe)` → `bg-safe-bar` / `text-safe-bar` (`safe-bar` = `'var(--status-safe-bar)'`)
- `var(--t3)` → `text-text-tertiary` / `bg-text-tertiary`
- `var(--acl)` → `text-accent`
- `var(--bg3)` → `bg-surface-sunken` (hover, **제거 결정** — 아래 참조)

## hover 처리 결정 (L449-L450 onMouseEnter/onMouseLeave)

원본:
```tsx
onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
```

**처리:** JSX inline handler 는 inline `style={{}}` 가 아니므로 grep 게이트에 안 잡힘 (`style={{` 패턴만 카운트). 다만 시각 0 byte 룰을 위해 가능한 옵션:
- **선택 (a) — onMouseEnter/Leave 보존 + style 만 변환**: `style={{ borderBottom, cursor, opacity, transition }}` 만 className 화하고 onMouseEnter/Leave 그대로 두기. hover 시 `currentTarget.style.background` 가 className `border-b` 위에 직접 set 되므로 동작 IDENTICAL. **이 옵션 채택.**

JSX handler 는 본 wave 범위 밖이므로 변경 0.

## padding: '10px 8px' 의 tailwind 매핑

- `padding: '10px 8px'` = vertical 10px + horizontal 8px
- tailwind: `py-2.5` (10px = 0.625rem) + `px-2` (8px = 0.5rem)
- tailwind.config 기본 spacing: 2 = 8px, 2.5 = 10px (override 없음)
- 검증: `tailwind.config.js` extend.spacing 에 `2`, `2.5` override 없음 → 기본 사용 OK

## padding: '0 24px 24px' 매핑

- `padding: '0 24px 24px'` = top:0 / horizontal:24px / bottom:24px
- tailwind: `px-6` (24px) + `pb-6` (24px) — top 0 은 default 이므로 `pt-0` 생략 OK (parent flex 흐름 영향 없음, 검증 시 layout 0 byte)

## padding: '40px 16px' 매핑

- `padding: '40px 16px'` = vertical:40px + horizontal:16px
- tailwind: `py-10` (40px) + `px-4` (16px) — 둘 다 spacing override 없음 (확인: tailwind.config 의 spacing override 는 8, 7, 9, 10, 11 같은 h-/w- 만 변경. py-/px- 의 2.5, 4, 6, 10 은 기본값 그대로)

## fontWeight: 600 매핑

- `fontWeight: 600` → `font-semibold`

## transition: 'background 0.1s' 매핑

- `transition: 'background 0.1s'` → `transition-[background] duration-100`
- 단, 본 wave 에서는 onMouseEnter/Leave 가 직접 style.background 를 set 하므로 `transition` 가 있어야 부드러움. className `transition-[background] duration-100` 로 매핑.

## opacity conditional

- `opacity: s.active === 0 ? 0.5 : 1` → `${s.active === 0 ? 'opacity-50' : 'opacity-100'}`
- StaffCard mobile 의 0.45 와 다름 — desktop 은 0.5 그대로 (시각 0 byte 룰 = active 0 인 행이 mobile 은 45%, desktop 은 50% 가 source 그대로)
</context>

<tasks>

<task type="auto">
  <name>Task 01: StaffManagePage 데스크톱 zone 24 inline → tailwind 변환 (단일 atomic commit)</name>
  <files>src/pages/StaffManagePage.tsx</files>
  <action>
StaffManagePage.tsx 의 데스크톱 zone 24 inline (+ L405 mobile-header 짝꿍 boundary 1건) 을 옵션 X+P+M+색변수N 으로 tailwind className 변환. 모바일 zone 잔존 3건 (L24 / L210 / L224) IDENTICAL.

## 변환 매핑 (라인 순)

### 1. L393 desktop-header `style={{ flexShrink: 0 }}`

Before:
```tsx
<div className="desktop-header hidden lg:flex items-center px-6 py-3 border-b border-border-default" style={{ flexShrink: 0 }}>
```
After:
```tsx
<div className="desktop-header shrink-0 hidden lg:flex items-center px-6 py-3 border-b border-border-default">
```

### 2. L399 desktop add btn `style={{ border: 'none', cursor: 'pointer' }}`

Before:
```tsx
<button onClick={() => setModal({ open: true, mode: 'add' })}
  className="desktop-add-btn flex items-center gap-2 h-10 px-3 rounded-sm bg-accent text-white text-label font-bold"
  style={{ border: 'none', cursor: 'pointer' }}>
```
After:
```tsx
<button onClick={() => setModal({ open: true, mode: 'add' })}
  className="desktop-add-btn flex items-center gap-2 h-10 px-3 rounded-sm bg-accent text-white text-label font-bold border-0 cursor-pointer">
```

### 3. L405 mobile-header `style={{ flexShrink: 0 }}` (ternary alternate boundary 짝꿍)

Before:
```tsx
<div className="mobile-header flex lg:hidden items-center px-4 py-2" style={{ flexShrink: 0 }}>
```
After:
```tsx
<div className="mobile-header shrink-0 flex lg:hidden items-center px-4 py-2">
```

### 4. L427 desktop-content `style={{ padding: '0 24px 24px' }}`

Before:
```tsx
<div className="desktop-content" style={{ padding: '0 24px 24px' }}>
```
After:
```tsx
<div className="desktop-content px-6 pb-6">
```

### 5. L428 data-table `style={{ width: '100%', borderCollapse: 'collapse' }}`

Before:
```tsx
<table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
```
After:
```tsx
<table className="data-table w-full border-collapse">
```

### 6. L431-L436 thead th × 6 `style={{ padding: '10px 8px' }}`

각 줄에 `py-2.5 px-2` 추가:
```tsx
<th className="text-caption font-bold text-text-secondary py-2.5 px-2">이름</th>
<th className="text-caption font-bold text-text-secondary py-2.5 px-2">사번</th>
<th className="text-caption font-bold text-text-secondary py-2.5 px-2">직책</th>
<th className="text-caption font-bold text-text-secondary py-2.5 px-2">역할</th>
<th className="text-caption font-bold text-text-secondary py-2.5 px-2">연락처</th>
<th className="text-caption font-bold text-text-secondary py-2.5 px-2">상태</th>
```

### 7. L437 thead 액션 th `style={{ padding: '10px 8px', width: 60 }}`

Before:
```tsx
<th className="text-caption font-bold text-text-secondary" style={{ padding: '10px 8px', width: 60 }}>액션</th>
```
After:
```tsx
<th className="text-caption font-bold text-text-secondary py-2.5 px-2 w-[60px]">액션</th>
```

### 8. L442 state-empty td `style={{ padding: '40px 16px' }}`

Before:
```tsx
<tr><td colSpan={7} className="state-empty text-center text-body-sm text-text-tertiary" style={{ padding: '40px 16px' }}>등록된 직원이 없습니다</td></tr>
```
After:
```tsx
<tr><td colSpan={7} className="state-empty text-center text-body-sm text-text-tertiary py-10 px-4">등록된 직원이 없습니다</td></tr>
```

### 9. L444-L451 tr row 옵션 M

Before:
```tsx
<tr key={s.id}
  onClick={() => setModal({ open: true, mode: 'edit', target: s })}
  className={s.active === 0 ? 'row-inactive' : ''}
  style={{ borderBottom: '1px solid var(--bd)', cursor: 'pointer', opacity: s.active === 0 ? 0.5 : 1, transition: 'background 0.1s' }}
  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
>
```
After:
```tsx
<tr key={s.id}
  onClick={() => setModal({ open: true, mode: 'edit', target: s })}
  className={`border-b border-border-default cursor-pointer transition-[background] duration-100 ${s.active === 0 ? 'row-inactive opacity-50' : 'opacity-100'}`}
  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
>
```

(onMouseEnter/Leave 는 inline handler — `style={{` 게이트와 무관. var(--bg3) 보존 OK)

### 10. L452 name td `style={{ padding: '10px 8px', fontWeight: 600 }}`

Before:
```tsx
<td className="name-cell text-text-primary" style={{ padding: '10px 8px', fontWeight: 600 }}>{s.name}</td>
```
After:
```tsx
<td className="name-cell text-text-primary py-2.5 px-2 font-semibold">{s.name}</td>
```

### 11. L453 id td `style={{ padding: '10px 8px' }}`

Before:
```tsx
<td className="id-cell text-caption font-mono text-text-secondary" style={{ padding: '10px 8px' }}>{s.id}</td>
```
After:
```tsx
<td className="id-cell text-caption font-mono text-text-secondary py-2.5 px-2">{s.id}</td>
```

### 12. L454 title td

Before:
```tsx
<td className="title-cell text-text-secondary" style={{ padding: '10px 8px' }}>{s.title || '-'}</td>
```
After:
```tsx
<td className="title-cell text-text-secondary py-2.5 px-2">{s.title || '-'}</td>
```

### 13. L455 role td

Before:
```tsx
<td style={{ padding: '10px 8px' }}>
```
After:
```tsx
<td className="py-2.5 px-2">
```

### 14. L456-L459 role badge span 옵션 M (multi-prop conditional)

Before:
```tsx
<span className={`role-badge ${s.role === 'admin' ? 'admin' : 'assistant'} text-caption leading-none px-1.5 py-0.5 rounded`} style={{
  background: s.role === 'admin' ? 'rgba(59,130,246,.13)' : 'rgba(110,118,129,.15)',
  color: s.role === 'admin' ? 'var(--acl)' : 'var(--t2)',
}}>
  {s.role === 'admin' ? '관리자' : '보조자'}
</span>
```
After:
```tsx
<span className={`role-badge ${s.role === 'admin' ? 'admin bg-[rgba(59,130,246,.13)] text-accent' : 'assistant bg-[rgba(110,118,129,.15)] text-text-secondary'} text-caption leading-none px-1.5 py-0.5 rounded`}>
  {s.role === 'admin' ? '관리자' : '보조자'}
</span>
```

### 15. L463 phone td

Before:
```tsx
<td className="phone-cell text-caption text-text-secondary" style={{ padding: '10px 8px' }}>{s.phone || '-'}</td>
```
After:
```tsx
<td className="phone-cell text-caption text-text-secondary py-2.5 px-2">{s.phone || '-'}</td>
```

### 16. L464 status td

Before:
```tsx
<td style={{ padding: '10px 8px' }}>
```
After:
```tsx
<td className="py-2.5 px-2">
```

### 17. L465-L467 status-cell 옵션 M

Before:
```tsx
<span className={`status-cell ${s.active !== 0 ? 'status-active' : 'status-inactive'} text-caption leading-none inline-flex items-center gap-1`} style={{
  color: s.active !== 0 ? 'var(--safe)' : 'var(--t3)',
}}>
```
After:
```tsx
<span className={`status-cell ${s.active !== 0 ? 'status-active text-safe-bar' : 'status-inactive text-text-tertiary'} text-caption leading-none inline-flex items-center gap-1`}>
```

### 18. L468 status-dot 옵션 M

Before:
```tsx
<span className="status-dot w-[6px] h-[6px] rounded-full" style={{ background: s.active !== 0 ? 'var(--safe)' : 'var(--t3)' }} />
```
After:
```tsx
<span className={`status-dot w-[6px] h-[6px] rounded-full ${s.active !== 0 ? 'bg-safe-bar' : 'bg-text-tertiary'}`} />
```

### 19. L472 action td

Before:
```tsx
<td className="action-cell" style={{ padding: '10px 8px' }}>
```
After:
```tsx
<td className="action-cell py-2.5 px-2">
```

## 모바일 zone 잔존 3건 (IDENTICAL — 절대 보존)

- **L24** BottomSheet sheet root `style={{ bottom: NAV_BOTTOM, maxHeight: 'calc(100dvh - var(--sat, 0px) - var(--sab, 0px) - 54px)' }}` — Pattern A 옵션 N (NAV_BOTTOM const + calc)
- **L210** form 사번 input `style={{ ...INPUT_STYLE, fontFamily: 'JetBrains Mono, monospace', ...(mode === 'edit' ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}` — INPUT_STYLE spread + conditional spread 옵션 N
- **L224** 입사일 input `style={{ ...INPUT_STYLE, opacity: 0.5, cursor: 'not-allowed' }}` — INPUT_STYLE spread + 2-prop 옵션 N

## hover handler L449-L450 (보존)

```tsx
onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
```

JSX inline handler 는 `style={{` 게이트와 무관 (handler 안의 `currentTarget.style.background` 는 동적 DOM mutation). var(--bg3) 그대로 보존 — tr 의 transition-[background] duration-100 className 이 부드러운 hover 효과 유지.

## 자동 검증 (verify 후 commit)

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety
F=src/pages/StaffManagePage.tsx

# 1. inline 감축 (27 → ~3)
B=$(git show HEAD:$F | grep -c 'style={{')
A=$(grep -c 'style={{' $F)
echo "$F: $B → $A"
[ "$A" -le 4 ] && echo "  ✓ inline ≤ 4" || echo "  ✗ inline > 4"

# 2. 모바일 zone 잔존 3건 IDENTICAL 확인
grep -n 'NAV_BOTTOM' $F | head -3
grep -n "fontFamily: 'JetBrains Mono" $F
grep -n "opacity: 0.5, cursor: 'not-allowed'" $F

# 3. 비즈 anchor IDENTICAL
for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\(' 'onMouseEnter' 'onMouseLeave'; do
  B=$(git show HEAD:$F | grep -cE "$ANCHOR")
  A=$(grep -cE "$ANCHOR" $F)
  [ "$B" = "$A" ] && echo "$ANCHOR: $B (OK)" || echo "$ANCHOR: $B→$A MISMATCH ❌"
done

# 4. onClick set diff
git show HEAD:$F | grep -oE 'onClick=\{[^}]+\}' | sort | uniq > /tmp/before-sm.txt
grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/after-sm.txt
diff /tmp/before-sm.txt /tmp/after-sm.txt && echo "  ✓ onClick diff 0" || echo "  ✗ onClick drift"

# 5. emoji 0 / 비표준 색 0
echo "emoji: $(grep -cE '✓|✗|🔒|💾|🔥|⏰|📋|✅|⚠️|❌|🔧|🚨|🔍|🧯|📊' $F)"
echo "비색: $(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' $F)"

# 6. module const 보존
grep -cE '^const (LABEL_STYLE|INPUT_STYLE|NAV_BOTTOM)' $F
# 기대: 3 (LABEL_STYLE / INPUT_STYLE / NAV_BOTTOM)

# 7. TypeScript 0 error
./node_modules/.bin/tsc --noEmit 2>&1 | grep -E 'error TS' | wc -l

# 8. vite build (PWA)
npm run build 2>&1 | tail -5
```

## Commit

단일 atomic commit:
```bash
git add src/pages/StaffManagePage.tsx
git commit -m "feat(260529-odl-01): Phase B Wave 12b — StaffManage 데스크톱 zone (24 inline) → tailwind"
```

main 직접 작업 (cbc7119-design 워크트리 룰). push 는 사용자 컨펌 후.
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && F=src/pages/StaffManagePage.tsx && B=$(git show HEAD:$F | grep -c 'style={{') && A=$(grep -c 'style={{' $F) && echo "inline: $B → $A" && [ "$A" -le 4 ] && grep -q 'NAV_BOTTOM' $F && grep -q "fontFamily: 'JetBrains Mono" $F && grep -q "opacity: 0.5, cursor: 'not-allowed'" $F && ./node_modules/.bin/tsc --noEmit 2>&1 | grep -cE 'error TS' | grep -q '^0$' && echo "PASSED"</automated>
  </verify>
  <done>
- StaffManagePage.tsx `style={{` 카운트 ≤ 4 (목표 ~3; 모바일 zone 잔존 L24/L210/L224 = 3)
- 모바일 zone 잔존 3건 (L24 NAV_BOTTOM/maxHeight, L210 사번 INPUT_STYLE spread + fontFamily + conditional, L224 입사일 INPUT_STYLE spread + opacity/cursor) IDENTICAL
- 데스크톱 zone 24 inline 모두 className 변환 (L393, L399, L427, L428, L431-L437 × 7, L442, L448, L452-L455, L456-L459 옵션 M, L463-L464, L465-L467 옵션 M, L468 옵션 M, L472)
- L405 mobile-header `style={{ flexShrink: 0 }}` boundary 짝꿍 변환 (`shrink-0`)
- L449-L450 onMouseEnter/Leave handler 보존 (inline handler 는 게이트와 무관)
- 비즈 anchor IDENTICAL (18 onClick + 3 useState + 2 useEffect + 4 useMutation + 2 useQuery + 1 useNavigate + 2 onMouseEnter/Leave = 0 line diff)
- emoji = 0, 비표준 색 토큰 (warning/safe/danger no-suffix) = 0
- module const LABEL_STYLE / INPUT_STYLE / NAV_BOTTOM = 3 정의 보존
- TypeScript `error TS` = 0
- vite build (PWA) succeeded
- 단일 atomic commit `feat(260529-odl-01): Phase B Wave 12b — StaffManage 데스크톱 zone (24 inline) → tailwind`
- off-scope 변경 = 0 (src/pages/StaffManagePage.tsx 단일 파일만)
  </done>
</task>

</tasks>

<verification>
## 전체 phase 검증

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety
F=src/pages/StaffManagePage.tsx

# inline 감축
B=$(git show HEAD:$F | grep -c 'style={{')
A=$(grep -c 'style={{' $F)
echo "$F: $B → $A (목표: 27 → ~3)"

# 비즈 anchor IDENTICAL (mouse handlers 포함)
for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\(' 'onMouseEnter' 'onMouseLeave'; do
  B=$(git show HEAD:$F | grep -cE "$ANCHOR")
  A=$(grep -cE "$ANCHOR" $F)
  [ "$B" = "$A" ] && echo "$ANCHOR: $B (OK)" || echo "$ANCHOR: $B→$A MISMATCH ❌"
done

# precise onClick diff
git show HEAD:$F | grep -oE 'onClick=\{[^}]+\}' | sort | uniq > /tmp/before-sm.txt
grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/after-sm.txt
diff /tmp/before-sm.txt /tmp/after-sm.txt

# 모바일 잔존 3건 IDENTICAL
echo "--- mobile zone 잔존 확인 ---"
grep -n 'NAV_BOTTOM' $F
grep -n "fontFamily: 'JetBrains Mono" $F
grep -n "opacity: 0.5, cursor: 'not-allowed'" $F

# emoji / 비표준 색
echo "emoji: $(grep -cE '✓|✗|🔒|💾|🔥|⏰|📋|✅|⚠️|❌|🔧|🚨|🔍|🧯|📊' $F)"
echo "비색: $(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' $F)"

# module const
grep -cE '^const (LABEL_STYLE|INPUT_STYLE|NAV_BOTTOM)' $F  # 기대 3

# TypeScript
./node_modules/.bin/tsc --noEmit 2>&1 | grep -E 'error TS' | wc -l  # 기대 0

# vite build (PWA generation 포함)
npm run build 2>&1 | tail -10
```
</verification>

<success_criteria>
- `style={{` 카운트 27 → ~3 (-24건, -88.9%)
- 데스크톱 zone inline 24 → 0 + L405 mobile-header boundary 짝꿍 변환 1건 = 25건 className 화
- 모바일 zone 잔존 3건 (L24 / L210 / L224) IDENTICAL (옵션 N — INPUT_STYLE spread 2건 + Pattern A NAV_BOTTOM/maxHeight calc 1건)
- 비즈 anchor (18 onClick + 3 useState + 2 useEffect + 4 useMutation + 2 useQuery + 1 useNavigate + onMouseEnter/Leave) IDENTICAL = 0 line diff
- 시각 결과 0 byte 변경 (vite build 성공 + PWA generation 성공)
- TypeScript error = 0
- emoji = 0, 비표준 색 토큰 = 0
- module const LABEL_STYLE / INPUT_STYLE / NAV_BOTTOM = 3 정의 보존
- 단일 atomic commit (17번째 atomic — wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe 승계 + 본 12b)
- off-scope 변경 = 0 (src/pages/StaffManagePage.tsx 단일 파일)
</success_criteria>

<output>
After completion, create `.planning/quick/260529-odl-phase-b-wave-12b/260529-odl-SUMMARY.md` with:
- 24 desktop inline + 1 boundary 변환 매핑표 (Before/After/옵션)
- 모바일 잔존 3건 IDENTICAL 확인
- 비즈 anchor diff 0 line 증빙
- vite build / TypeScript 0 error 결과
- commit hash
- Phase B 누적 진행 표 (Wave 1~12b)
- Tier 2 진행 상태 업데이트 (12a/12b 종결, 13a~15b reference)
</output>
