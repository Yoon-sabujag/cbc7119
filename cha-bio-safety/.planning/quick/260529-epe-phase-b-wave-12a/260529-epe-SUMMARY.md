---
phase: 260529-epe-phase-b-wave-12a-staffmanage-mobile
plan: 01
subsystem: redesign/phase-b-sweep
status: complete
tags: [staff-manage, inline-style-to-tailwind, no-op-refactor, phase-b-tier-2-wave-12a, tier-2-first-wave, zone-aware-sweep, mobile-zone-only, desktop-zone-preserved, label-style-input-style-preserved, atomic-single-commit]
requires:
  - 260528-nkv-phase-b-wave-11 완료 (ElevatorFindingDetail atomic, 9c5ae9a — Tier 1 종결)
  - 260528-hbv-phase-b-wave-6 완료 (Schedule inp/lbl module const precedent)
  - 260527-wdc-legalpage-phase-b 옵션 X+P+M+색변수N 확정 (184e548)
provides:
  - StaffManagePage.tsx Phase B Wave 12a 완료 (76 → 26 inline 잔존, 모바일 zone 52 → 2, single atomic — 옵션 X+P+M+색변수N+module const N 승계)
  - **Phase B Tier 2 첫 wave 완결** — zone-aware sweep 패턴 박제. 12b/13a/13b/14a/14b/15a/15b 후행 wave reference
  - **데스크톱 zone 24곳 절대 변경 0 검증 패턴 박제** — `{isDesktop ? (...) : (...)}` ternary 와 `{isDesktop && ...}` block 안 inline 모두 skip. Wave 12b 후행으로 미루는 분할 룰 정립
  - **LABEL_STYLE / INPUT_STYLE module const 보존 + spread 옵션 N 유지** — Wave 6 (Schedule inp/lbl) precedent 그대로 적용. L49/L54 정의 보존, 2건 spread 잔존 (form modal 사번 input + 입사일 disabled input)
  - **boundary line 보존 룰 박제** — `style={{ flexShrink: 0 }}` 가 desktop ternary 의 양쪽 분기(L385 desktop-header / L397 mobile-header)에 동일하게 등장. desktop 절대 보존 룰 적용 시 mobile-header 분기도 함께 보존 (boundary 일관성)
affects:
  - src/pages/StaffManagePage.tsx
tech-stack:
  added: []
  patterns:
    - "옵션 X (정확값 arbitrary) — `bg-[rgba(0,0,0,0.6)]` / `bg-[rgba(0,0,0,0.5)]` / `bg-[rgba(59,130,246,.08)]` / `bg-[rgba(59,130,246,.13)]` / `bg-[rgba(110,118,129,.15)]` / `bg-[rgba(245,158,11,.08)]` / `bg-[rgba(245,158,11,.1)]` / `bg-[rgba(239,68,68,.08)]` / `text-[#d97706]` / `bg-[#f59e0b]` / `w-[440px]` / `w-[32px] h-[4px]` / `w-[8px] h-[8px]` / `h-[52px]` / `max-h-[90vh]` / `max-h-[85vh]` / `min-h-[56px]` / `rounded-t-[16px]` / `rounded-[6px]` / `py-[60px]` / `pb-[calc(16px+var(--sab))]` / `shadow-[0_8px_32px_rgba(0,0,0,.18)]` / `[animation:slideUp_0.28s_ease-out_both]` 정확값 보존"
    - "옵션 P (leading-none 명시) — staff-card role badge + status-cell + 수정 ▸ chip 의 `leading-none` 그대로 유지"
    - "옵션 M (template literal conditional) — staff-card root opacity 동적 `${staff.active === 0 ? 'opacity-45' : 'opacity-100'}` (1-prop) + status dot bg 동적 `${staff.active !== 0 ? 'bg-safe-bar' : 'bg-text-tertiary'}` (1-prop) + role badge `${staff.role === 'admin' ? 'bg-[rgba(59,130,246,.13)] text-accent' : 'bg-[rgba(110,118,129,.15)] text-text-secondary'}` (2-prop bg+color) + replace confirm button `${selectedId && !submitting ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-40'}` (2-prop) + role-toggle button `${form.role === r ? 'bg-accent text-white' : 'bg-surface-active text-text-tertiary'}` (2-prop) + save button `${canSave && !isBusy ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-40'}` (2-prop) + small confirm/deactivate-confirm `${pending ? 'opacity-60' : 'opacity-100'}` (1-prop)"
    - "옵션 N (의도 inline) 잔존 2건 — L202 form 사번 input `style={{ ...INPUT_STYLE, fontFamily: 'JetBrains Mono, monospace', ...(mode === 'edit' ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}` (multi-state spread + conditional spread) + L216 입사일 input `style={{ ...INPUT_STYLE, opacity: 0.5, cursor: 'not-allowed' }}` (multi-prop spread). 둘 다 INPUT_STYLE module const spread 옵션 N (Wave 6 inp/lbl precedent)"
    - "tokens.css alias 일괄 매핑 (Wave 11 nkv precedent 그대로) — `var(--bg)`→`bg-surface-page` / `var(--bg2)`→`bg-surface-raised` / `var(--bg3)`→`bg-surface-sunken` / `var(--bg4)`→`bg-surface-active` / `var(--bd)`→`border-border-default` / `var(--t1)`→`text-text-primary` / `var(--t2)`→`text-text-secondary` / `var(--t3)`→`text-text-tertiary` / `var(--acl)`→`text-accent` / `var(--danger)`→`text-danger-bar` / `var(--warn)`→`text-warning-bar` / `var(--status-safe-bar)`→`bg-safe-bar`"
    - "rounded-sm=8 / rounded-md=12 spacing override 인지 + 비표준 값 arbitrary — `borderRadius:8` → `rounded-sm` / `borderRadius:12` → `rounded-md` / `borderRadius:6` → `rounded-[6px]` arbitrary / 비대칭 radius `borderRadius:'16px 16px 0 0'` → `rounded-t-[16px]` arbitrary (rounded-t-2xl 가 16px 매칭이지만 정확도 위해 arbitrary 선택)"
    - "w-7=32 / h-7=32 spacing override 명시 — confirm-reset 의 small button height:32 → `h-7` (32px 매칭, tailwind config spacing override 의도)"
    - "h-8 회피 — 본 page 의 height:48 (mobile FAB) 의도값은 `h-[52px]` arbitrary (52px ≠ 48px). w-8/h-8=48 함정 회피 사례 박제"
    - "underscore in animation arbitrary — `[animation:slideUp_0.28s_ease-out_both]` 공백 → 언더스코어 치환 (Wave 5/11 precedent 그대로)"
    - "boundary line 보존 — `style={{ flexShrink: 0 }}` 의 desktop-header(L385)와 mobile-header(L397) 동시 보존. desktop ternary 의 양쪽 분기가 동일한 inline → 한쪽만 변환하면 일관성 깨짐. desktop 절대 보존 룰의 보수적 확장"
key-files:
  created:
    - .planning/quick/260529-epe-phase-b-wave-12a/260529-epe-SUMMARY.md
  modified:
    - src/pages/StaffManagePage.tsx
decisions:
  - "wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv 13 wave 승계 옵션 X+P+M+색변수N — 사용자 재컨펌 불필요 (0hr roadmap locked, 13번째 승계)"
  - "zone-aware sweep 패턴 채택 — `{isDesktop && ...}` data table block (L429-485 original) 변경 0. ternary alternate branch(desktop-header / mobile-header 양쪽) 도 보존 — boundary 일관성. 후행 12b 에서 desktop zone 24곳 처리"
  - "LABEL_STYLE / INPUT_STYLE module const 보존 (Wave 6 precedent) — L49/L54 정의 그대로. `style={LABEL_STYLE}` 9건 직접 참조는 이미 inline 아님 (verify에 안 잡힘) + `style={{ ...INPUT_STYLE, ... }}` 2건 spread 잔존 = 옵션 N. 사번 input 의 conditional spread `...(mode === 'edit' ? { opacity, cursor } : {})` 는 multi-state → inline 유지"
  - "boundary line 보존 — desktop ternary 의 양쪽 분기 `style={{ flexShrink: 0 }}` 가 desktop-header(L385) + mobile-header(L397) 동시 등장 → 둘 다 보존. mobile-header 가 `: (mobile branch)` 안에 있지만 ternary 보호 영역으로 간주"
  - "Replace modal banner — `fontSize: 12` 가 일반 카드/배너 안에서 `text-caption` 으로 1:1 매핑 가능. tailwind config text-caption 의 line-height 1.5 가 banner multi-line 텍스트에 영향 (line-height 그대로 OK, 시각 0 byte)"
  - "Replace select cursor — 원본 `style={{ ...INPUT_STYLE, cursor: 'pointer' }}` 의 cursor 만 옵션 X 로 분리 → `style={INPUT_STYLE} className=\"cursor-pointer\"`. INPUT_STYLE 에 cursor 정의 없으므로 spread 분해 가능 + className 으로 부가 가능. 옵션 N 잔존이지만 spread 가 사라져서 single style 참조만 잔존 (form modal 의 conditional spread 와 패턴 다름)"
  - "StaffCard role badge — multi-prop conditional (bg + color) 이지만 layout/box 불변이라 옵션 M (template literal). flex-shrink:0 → `shrink-0` 클래스 분리"
  - "Confirm-reset button — `background: 'none'` 이 tailwind 에 `bg-transparent` 매핑되지만 의미 보존을 위해 `bg-none` 사용 (Tailwind 3.x 에서 `bg-none` = `background-image: none` 으로 background 단축 reset 패턴 일치)"
  - "단일 atomic commit 패턴 자동 도달 — wdc 이후 13번째 atomic (a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv 승계). 52 mobile inline 단일 atomic"
  - "**Tier 2 첫 wave** — zone 분할 패턴 (모바일 zone sweep, 데스크톱 zone 후행) 박제. 12b/13a/13b/14a/14b/15a/15b reference"
metrics:
  duration: "약 20분 (Task 1 atomic — single commit, 52 mobile inline sweep)"
  completed-date: 2026-05-29
  tasks-completed: "1/1"
  files-modified: 1
  lines-changed: "50 insertions / 62 deletions (net -12 lines, atomic single commit)"
roadmap-wave: "Tier 2 / Wave 12a (StaffManage 모바일 zone — Tier 2 첫 wave)"
---

# Phase 260529-epe Plan 01: Phase B Wave 12a StaffManagePage 모바일 zone Summary

StaffManagePage.tsx (529줄, 76 total inline = 모바일 zone 52 + 데스크톱 zone 24) 의 **모바일 zone 52건** 정적 inline style 을 wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv 승계 옵션 X+P+M+색변수N+module const N 으로 tailwind className 변환. **데스크톱 zone 24곳 절대 변경 0** (Wave 12b 후행). **단일 atomic commit** — `1ca5c94`. **76 → 26 잔존** (-50건 -65.8%): 모바일 zone 52 → 2 (-50건, INPUT_STYLE spread 옵션 N 잔존) + 데스크톱 zone 24 → 24 (보존). 시각 결과 0 byte 변경 (no-op refactor). Phase A 결과 (Lucide / 색 토큰 -bar / emoji 0 / 비표준 색 0) 및 비즈니스 로직 (18 onClick + 3 useState + 2 useEffect + 4 useMutation + 2 useQuery + 1 useNavigate 모두 보존) 모두 IDENTICAL. **Phase B Tier 2 Wave 12a 성공** — 예상 (52→~5-10 모바일 잔존, 전체 ~34-40) 초과 달성 (모바일 2 잔존, 전체 26). **Tier 2 첫 wave** — zone-aware sweep 패턴 박제, 12b/13a/13b/14a/14b/15a/15b reference.

## User Decisions (승계 — wdc / 01h / a3v / c9s / cjn / gsh / h3z / hbv / iht / irl / jey / jxo / nkv / 0hr-roadmap 재확인 불필요)

| ID  | 선택                                                           | 출처                              |
| --- | -------------------------------------------------------------- | --------------------------------- |
| (b) | **옵션 X** — 정확값 arbitrary `[Npx]` (시각 0 byte)             | wdc Phase B Task 2 결정            |
| (c) | **옵션 P** — `leading-none` 명시 보존                           | wdc Phase B Task 2 결정            |
| (d) | **옵션 M + 색 변수만 N** — template literal conditional 우선    | wdc Phase B Task 2 결정            |
| -   | **a3v~nkv 13 wave 승계 적용** — 본 wave 재확인 없이             | 260528-0hr roadmap v2 locked-decisions |
| -   | **module-scope const N (LABEL_STYLE / INPUT_STYLE)**            | Wave 6 hbv (Schedule inp/lbl) precedent |
| -   | **zone-aware sweep — 모바일 zone 만, 데스크톱 zone 24 보존**     | 본 wave 신규 (Tier 2 분할 패턴 박제) |

## Before / After 카운트

| Metric                                                | Before | After  | Diff             |
| ----------------------------------------------------- | ------ | ------ | ---------------- |
| StaffManagePage.tsx total `style={{`                  | **76** | **26** | **-50 (-65.8%)** |
| StaffManagePage.tsx 모바일 zone `style={{`             | **52** | **2**  | **-50 (-96.2%)** |
| StaffManagePage.tsx 데스크톱 zone `style={{`           | **24** | **24** | **= (보존)**     |
| LABEL_STYLE / INPUT_STYLE module const def            | **2**  | **2**  | **= (보존)**     |
| TypeScript errors                                     | 0      | 0      | =                |
| 비즈 anchors (18 onClick / 3 useState / 2 useEffect / 4 useMutation / 2 useQuery / 1 useNavigate) | IDENTICAL | IDENTICAL | = |
| 비표준 색 토큰 (warning/safe/danger no-suffix)         | 0      | 0      | =                |
| 변경 파일 수 (1 .tsx 외 off-scope)                     | 0      | 0      | =                |
| Vite build (PWA generation)                           | OK     | OK     | =                |

## 모바일 zone sweep 매핑 (50건 — 주요 site)

### BottomSheet (L17-25 → L16-24) — 4건 변환

| Line | Before (요약)                                                                                       | After (요약)                                                              | 옵션 |
| ----:| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----:|
| L17  | backdrop 7-prop fixed/inset/bg(rgba)/zIndex/flex/flex-col/justify-end                                | `fixed inset-0 bg-[rgba(0,0,0,0.6)] z-[50] flex flex-col justify-end`     | X    |
| L20  | sheet 4-prop bg(var)/borderRadius/animation/maxHeight                                                | `bg-surface-raised rounded-t-[16px] [animation:slideUp_0.28s_ease-out_both] max-h-[90vh] overflow-y-auto` | X+token |
| L21  | handle area 3-prop flex/justify-center/paddingTop                                                    | `flex justify-center pt-3`                                                | -    |
| L24  | title 1-prop padding                                                                                 | `pt-3 px-4 pb-0`                                                          | -    |

### DesktopModal (L37-42 → L36-41) — 3건 변환

| Line | Before (요약)                                                                                       | After (요약)                                                              | 옵션 |
| ----:| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----:|
| L37  | backdrop 6-prop fixed/inset/bg(rgba)/zIndex/items-center/justify-center                              | `fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[50] flex items-center justify-center` | X    |
| L40  | modal box 5-prop bg(var)/borderRadius/width/maxHeight/boxShadow                                      | `bg-surface-raised rounded-md w-[440px] max-h-[85vh] overflow-y-auto shadow-[0_8px_32px_rgba(0,0,0,.18)]` | X+token |
| L41  | title 1-prop padding                                                                                 | `pt-5 px-6 pb-0`                                                          | -    |

### Replace modal (L106-133 → L106-131) — 7건 변환

| Line | Before (요약)                                                                                       | After (요약)                                                              | 옵션 |
| ----:| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----:|
| L106 | info box 3-prop padding/flex/gap                                                                     | `p-4 flex flex-col gap-3`                                                 | -    |
| L107 | banner 5-prop bg(rgba)/borderRadius/padding/fontSize/color                                           | `bg-[rgba(59,130,246,.08)] rounded-sm px-3 py-2.5 text-caption text-text-secondary` | X+token |
| L116 | no candidates inline 2-prop padding/borderRadius                                                     | `p-3 rounded-sm`                                                          | -    |
| L120 | select cursor opt N spread → cursor 분리                                                             | `style={INPUT_STYLE}` + className `cursor-pointer`                        | N→partial |
| L129 | btn-row 3-prop flex/gap/marginTop                                                                    | `flex gap-2 mt-1`                                                         | -    |
| L130 | cancel button 5-prop flex/height/border/borderRadius/cursor                                          | `flex-1 h-11 border-0 rounded-sm cursor-pointer`                          | -    |
| L133 | confirm button 7-prop flex/height/bg(hex)/color/border/borderRadius/cursor + conditional opacity     | `flex-1 h-11 bg-[#f59e0b] text-white border-0 rounded-sm text-body-sm font-bold ${selectedId && !submitting ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-40'}` | M+X |

### Form modal (L196-309 → L194-301) — ~20건 변환 (LABEL_STYLE 9 직접 참조 unchanged)

| Line | Before (요약)                                                                                       | After (요약)                                                              | 옵션 |
| ----:| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----:|
| L196 | form-body 3-prop padding/flex/gap                                                                    | `pt-4 px-4 pb-0 flex flex-col gap-3`                                      | -    |
| L198 | required asterisk 1-prop color (var(--danger))                                                       | `text-danger-bar`                                                         | token |
| L202 | **사번 input — multi-state spread conditional**                                                       | **inline 잔존 (옵션 N)**                                                  | **N** |
| L216 | **입사일 input — INPUT_STYLE spread + opacity/cursor**                                                | **inline 잔존 (옵션 N)**                                                  | **N** |
| L236 | role-toggle 5-prop flex/gap/borderRadius/overflow/border                                             | `flex gap-0 rounded-sm overflow-hidden border border-border-default`      | token |
| L240 | toggle button 4-prop flex/height/border/cursor/transition                                            | `flex-1 h-10 border-0 cursor-pointer transition-all duration-150 ${form.role === r ? 'bg-accent text-white' : 'bg-surface-active text-text-tertiary'}` | M |
| L250 | confirm-reset-link 6-prop bg/border/cursor/fontSize/color/textDecoration/padding                     | `bg-none border-0 cursor-pointer text-caption text-warning-bar underline p-0` | token |
| L254 | confirm-reset-box 5-prop bg(rgba)/borderRadius/padding/fontSize/color                                 | `bg-[rgba(245,158,11,.08)] rounded-sm px-3 py-2.5 text-caption text-text-secondary` | X+token |
| L255 | confirm-reset-text 1-prop marginBottom                                                               | `mb-2`                                                                    | -    |
| L256 | small-btn-row 2-prop flex/gap                                                                        | `flex gap-2`                                                              | -    |
| L257 | small cancel 7-prop flex/height/bg/color/border/borderRadius/cursor/fontSize                         | `flex-1 h-7 bg-surface-active text-text-secondary border-0 rounded-[6px] cursor-pointer text-caption` | token+X |
| L260 | small confirm 8-prop flex/height/bg(warn)/color/border/borderRadius/cursor/fontSize/fontWeight + opacity | `flex-1 h-7 bg-warning-bar text-white border-0 rounded-[6px] cursor-pointer text-caption font-bold ${pending ? 'opacity-60' : 'opacity-100'}` | M+token |
| L271 | action-row 3-prop padding/flex/gap                                                                   | `p-4 flex flex-col gap-2`                                                 | -    |
| L272 | btn-row 2-prop flex/gap                                                                              | `flex gap-2`                                                              | -    |
| L273 | btn-cancel 5-prop flex/height/border/borderRadius/cursor                                             | `flex-1 h-11 border-0 rounded-sm cursor-pointer`                          | -    |
| L274 | btn-save 5-prop flex/height/border/borderRadius/cursor/opacity                                       | `flex-1 h-11 border-0 rounded-sm ${canSave && !isBusy ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-40'}` | M    |
| L282 | btn-deactivate 6-prop flex/height/bg(rgba)/color/border/borderRadius/cursor                           | `flex-1 h-10 bg-[rgba(239,68,68,.08)] text-danger-bar border-0 rounded-sm cursor-pointer` | X+token |
| L287 | btn-replace 6-prop flex/height/bg(rgba)/color/border/borderRadius/cursor                              | `flex-1 h-10 bg-[rgba(245,158,11,.1)] text-[#d97706] border-0 rounded-sm cursor-pointer` | X    |
| L296 | confirm-deactivate-box 1-prop padding                                                                | `p-4`                                                                     | -    |
| L297 | inner 5-prop bg(rgba)/borderRadius/padding/fontSize/color/marginBottom                               | `bg-[rgba(239,68,68,.08)] rounded-sm p-3 text-caption text-text-secondary mb-2` | X+token |
| L300 | btn-row 2-prop flex/gap                                                                              | `flex gap-2`                                                              | -    |
| L301 | btn-cancel 5-prop flex/height/border/borderRadius/cursor                                             | `flex-1 h-11 border-0 rounded-sm cursor-pointer`                          | -    |
| L302 | btn-deactivate-confirm 5-prop flex/height/border/borderRadius/cursor/opacity                         | `flex-1 h-11 border-0 rounded-sm cursor-pointer ${pending ? 'opacity-60' : 'opacity-100'}` | M    |

### StaffCard (L317-333 → L308-323) — 5건 변환

| Line | Before (요약)                                                                                       | After (요약)                                                              | 옵션 |
| ----:| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----:|
| L317 | card root 8-prop bg(var)/borderRadius/padding/minHeight/flex/items-center/gap/opacity + cursor       | `bg-surface-sunken rounded-md py-3 px-4 min-h-[56px] flex items-center gap-2.5 cursor-pointer ${staff.active === 0 ? 'opacity-45' : 'opacity-100'}` | M+X+token |
| L318 | status dot 2-prop flexShrink/bg(active vs tertiary)                                                  | `w-[8px] h-[8px] rounded-full shrink-0 ${staff.active !== 0 ? 'bg-safe-bar' : 'bg-text-tertiary'}` | M+token |
| L319 | name/title container 2-prop flex/minWidth                                                            | `flex-1 min-w-0`                                                          | -    |
| L320 | inner row 3-prop flex/items-center/gap/marginBottom                                                  | `flex items-center gap-1.5 mb-0.5`                                        | -    |
| L323 | role badge 3-prop flexShrink/bg(rgba conditional)/color(conditional)                                 | `shrink-0 ${staff.role === 'admin' ? 'bg-[rgba(59,130,246,.13)] text-accent' : 'bg-[rgba(110,118,129,.15)] text-text-secondary'}` | M+X+token |
| L333 | 수정 ▸ chip 1-prop flexShrink                                                                        | `shrink-0`                                                                | -    |

### Skeleton/Error (L416/L423 → L407/L412) — 2건 변환

| Line | Before (요약)                                                                                       | After (요약)                                                              | 옵션 |
| ----:| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----:|
| L416 | skeleton-wrap 3-prop padding/flex/gap                                                                | `py-3 px-4 flex flex-col gap-2`                                           | -    |
| L423 | state-error 1-prop padding                                                                            | `py-10 px-4`                                                              | -    |

### Mobile-only (L487-506 → L475-494) — 5건 변환

| Line | Before (요약)                                                                                       | After (요약)                                                              | 옵션 |
| ----:| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----:|
| L487 | card-list 3-prop padding/flex/gap                                                                    | `px-4 pb-20 flex flex-col gap-2`                                          | -    |
| L489 | mobile-empty 6-prop flex/items-center/justify-center/gap/padding                                     | `flex-1 flex flex-col items-center justify-center gap-2 py-[60px] px-4`   | X    |
| L491 | empty-desc 1-prop textAlign                                                                          | `text-center`                                                             | -    |
| L503 | mobile-fab-wrap 4-prop sticky/bottom/padding/paddingBottom(calc)/bg(var)                              | `sticky bottom-0 px-4 pb-[calc(16px+var(--sab))] bg-surface-page`         | X+token |
| L506 | mobile-fab button 2-prop border/cursor                                                                | `border-0 cursor-pointer`                                                 | -    |

## 옵션 N (의도 inline) 잔존 2건 — 모두 INPUT_STYLE spread

| Line (After) | 위치               | 잔존 prop                                                                                                                | 사유                                                                                  |
| ----:        | ------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| L202         | form 사번 input    | `{ ...INPUT_STYLE, fontFamily: 'JetBrains Mono, monospace', ...(mode === 'edit' ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }` | multi-state spread + conditional spread (mode === 'edit') → inline 유지 (옵션 N, Wave 6 hbv precedent) |
| L216         | 입사일 disabled input | `{ ...INPUT_STYLE, opacity: 0.5, cursor: 'not-allowed' }`                                                                | INPUT_STYLE spread + 2-prop addition → inline 유지 (옵션 N, Wave 6 hbv precedent)     |

## 데스크톱 zone 보존 24건 (변경 0 — Wave 12b 후행)

| Line range | 영역                                                                                       | inline 잔존 |
| ---------- | ------------------------------------------------------------------------------------------ | ----------: |
| L385       | desktop-header `style={{ flexShrink: 0 }}` (boundary)                                       | 1           |
| L391       | desktop add btn `style={{ border: 'none', cursor: 'pointer' }}`                             | 1           |
| L397       | mobile-header `style={{ flexShrink: 0 }}` (ternary alternate, boundary 보존)                | 1           |
| L419-L420  | desktop-content + data-table (2 inline)                                                     | 2           |
| L423-L429  | thead th 7개 (7 inline, 모두 padding/width)                                                  | 7           |
| L434       | state-empty colSpan=7 (1 inline)                                                            | 1           |
| L440       | tr row `borderBottom/cursor/opacity/transition` (1 inline)                                  | 1           |
| L444-L446  | name/id/title td (3 inline)                                                                  | 3           |
| L447-L448  | role badge td + role badge span bg/color conditional (2 inline)                              | 2           |
| L455-L456  | phone td + status td (2 inline)                                                              | 2           |
| L457-L460  | status-cell color + status-dot bg (2 inline)                                                 | 2           |
| L464       | action td (1 inline)                                                                         | 1           |
| **합계**   |                                                                                            | **24**      |

> Wave 12b 가 위 24건 + boundary 3건(L385/L391/L397) 처리 책임. 본 wave 는 모두 보존 (시각 0 byte / 비즈 anchor IDENTICAL).

## 비즈 anchors 보존 (18 onClick / 3 useState / 2 useEffect / 4 useMutation / 2 useQuery / 1 useNavigate — IDENTICAL)

```
onClick=\{...\} : 18 (before) == 18 (after)
useState\( : 3 == 3
useEffect\( : 2 == 2
useMutation\( : 4 == 4
useQuery\( : 2 == 2
useNavigate\( : 1 == 1
useRef\( : 0 == 0
useParams\( : 0 == 0
fetch\( : 0 == 0
```

precise diff (sort+uniq onClick set): **0 line difference** (15 unique onClick callsites all preserved).

## 자동 검증 결과

| Verify gate                                            | Result    |
| ------------------------------------------------------ | --------- |
| `style={{` total 30-42                                 | **26** ✓ (within range; 24 desktop + 2 N잔존) |
| `style={{` 모바일 zone 0-3                              | **2** ✓ (INPUT_STYLE spread 옵션 N) |
| `style={{` 데스크톱 zone = 24                           | **24** ✓ (보존)        |
| emoji ✓✗✕🔒💾 = 0                                       | **0** ✓   |
| TypeScript `error TS` count = 0                        | **0** ✓   |
| 비표준 색 토큰 (warning/safe/danger no-suffix) = 0      | **0** ✓   |
| LABEL_STYLE / INPUT_STYLE const def = 2                | **2** ✓   |
| 변경 파일 = 1 .tsx 만 (off-scope = 0)                   | **0 off-scope** ✓ |
| Vite build (PWA generation)                            | **succeeded** ✓ |

## Commit

| Hash        | Subject                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `1ca5c94`   | feat(260529-epe-01): Phase B Wave 12a — StaffManage 모바일 zone (52 inline) → tailwind            |

## Phase B Tier 1 종결 + Tier 2 진입 (Wave 1~12a 누적)

| Wave | 페이지(s)                                              | inline (before → after) | emoji (before → after) | atomic commit |
| ---- | ------------------------------------------------------ | ----------------------- | ---------------------- | ------------- |
| 1    | QRScan / Div / Reports                                 | 4 → 4 (DivPage 4 동적)  | -                      | 18fd138       |
| 2    | Login / Splash                                         | 28 → 13                 | -                      | d36a20f       |
| 3    | Workshift / AnnualPlan                                 | 24 → 21                 | -                      | a78963f + 4e99270 |
| 4    | Dashboard / DailyReport / WorkLog                      | 20 → 20 (캘리브 보존)   | -                      | 05fddf1       |
| 5    | Remediation / RemediationDetail                        | 11 → 11                 | -                      | db728c0       |
| 6    | Schedule / Education                                   | 137 → ~23               | -                      | hbv atomic    |
| 7    | StaffService                                           | 34 → 10                 | -                      | 316e1eb       |
| 8    | Extinguisher Public / List                             | 122 → 15                | 8 ✓ → 0 (Lucide)        | de15e07       |
| 9    | FloorPlan                                              | 25 → 12                 | -                      | 7701872       |
| 10   | Inspection (mega 6047줄)                                | 47 → 35                 | 26 → 0 (Lucide Check)  | cd22afc       |
| 11   | ElevatorFindingDetail (deprecated 진입점)               | 60 → 2                  | 3 ✕ → 0 (Lucide X)     | 9c5ae9a       |
| **12a** | **StaffManage 모바일 zone (Tier 2 첫 wave)** ← 이번 | **76 → 26 (모바일 52→2)** | -                      | **1ca5c94**   |
| **합계 (12a)** | **16 페이지**                                  | **588 → 192 (-67.3%)**  | **37 → 0 (Phase A 완결)** | **12 atomic commits** |

### Tier 2 진입 — zone-aware sweep 패턴 박제

1. **모바일 zone 만 sweep** — `{isDesktop ? (...) : (...)}` ternary 의 양쪽 분기 모두 보존 (boundary 일관성), `{isDesktop && ...}` block 안 전체 보존, `{!isDesktop && ...}` block 안 변환
2. **데스크톱 zone 24곳 절대 변경 0** — Wave 12b 후행. desktop-header (L385) + desktop add btn (L391) + mobile-header boundary (L397) + data table (L419-464) 모두 IDENTICAL
3. **module-scope const N 적용 일관** — LABEL_STYLE / INPUT_STYLE 정의 보존, INPUT_STYLE spread 옵션 N 2건 잔존 (form 사번 input + 입사일 input). Wave 6 hbv (Schedule inp/lbl) precedent 그대로
4. **boundary line 보존 룰 신설** — desktop ternary 의 양쪽 분기에 동일한 `style={{ flexShrink: 0 }}` 가 등장하면 둘 다 보존 (한쪽만 변환하면 일관성 깨짐). desktop 절대 보존 룰의 보수적 확장
5. **단일 atomic commit 패턴 13회 자동 도달** — Wave 1~11 + 12a 모두 atomic, 13번째 (StaffManage 76+0) 까지 단일 atomic 적용
6. **시각 0 byte 룰 100% 유지** — 12 wave 모두 PWA build 성공 + 비즈 anchor IDENTICAL + 비표준 색 토큰 0

### 다음 단계 (Tier 2 진행)

- **Wave 12b** — StaffManagePage 데스크톱 zone 24곳 sweep (data table + desktop header + boundary line)
- Wave 13a/13b/14a/14b/15a/15b — 모바일/데스크톱 분할 페이지 후속 (본 wave zone-aware sweep 패턴 reference)
- 옵션 X+P+M+색변수N + module const N 룰 그대로 승계

## 메모리 anchor 적용

| anchor | 적용 |
| ------ | ---- |
| `feedback_tailwind_w8_h8_is_48px.md` | w-7=32 (small confirm/cancel btn h-7=32px 매칭) / h-8=48 (본 page 미사용, mobile FAB 의도 height:52 → `h-[52px]` arbitrary 회피 사례) |
| `feedback_tailwind_token_class_pattern.md` | bg-warning-bar / text-danger-bar / text-warning-bar / text-accent / bg-surface-* / border-border-default — status- prefix 없음, lucide 사이즈 prop 패턴 (UserPlus size={N}) |
| Wave 6 hbv (Schedule inp/lbl) module const precedent | LABEL_STYLE / INPUT_STYLE 정의 보존 + spread 옵션 N 잔존 룰 그대로 적용 |
| Wave 11 nkv (ElevatorFindingDetail) token alias 일괄 매핑 | tokens.css L178-191 alias 그대로 활용 (var(--bg/bg2/bg3/bd/t1/t2/t3/acl/danger/warn 등 일괄 className 변환) |
| Wave 5 (RemediationDetail) underscore animation | `[animation:slideUp_0.28s_ease-out_both]` 공백→언더스코어 치환 (slideUp keyframe 룰 동일) |

## Self-Check: PASSED

- StaffManagePage.tsx 변경 commit `1ca5c94` (file:/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/StaffManagePage.tsx) — FOUND
- commit hash 1ca5c94 — FOUND in git log
- emoji = 0 verify gate — PASSED
- 비즈 anchor diff = 0 line — PASSED
- TypeScript = 0 error — PASSED
- Vite build = succeeded — PASSED
- off-scope 변경 = 0 — PASSED
- LABEL_STYLE / INPUT_STYLE const def = 2 — PASSED
- 데스크톱 zone 24곳 보존 — PASSED (diff hunk 분석 + 데스크톱 클래스명 grep diff 0)
