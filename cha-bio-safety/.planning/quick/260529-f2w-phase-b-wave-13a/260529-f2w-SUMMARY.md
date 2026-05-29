---
phase: 260529-f2w-phase-b-wave-13a-checkpoints-mobile
plan: 01
subsystem: redesign/phase-b-sweep
status: complete
tags: [checkpoints, inline-style-to-tailwind, no-op-refactor, phase-b-tier-2-wave-13a, tier-2-second-wave, zone-aware-sweep, mobile-zone-only, desktop-zone-preserved, label-style-input-style-skeleton-style-preserved, atomic-single-commit]
requires:
  - 260529-epe-phase-b-wave-12a 완료 (StaffManage 모바일 zone atomic, 1ca5c94 — Tier 2 첫 wave precedent)
  - 260528-hbv-phase-b-wave-6 완료 (Schedule inp/lbl module const precedent)
  - 260527-wdc-legalpage-phase-b 옵션 X+P+M+색변수N 확정 (184e548)
provides:
  - CheckpointsPage.tsx Phase B Wave 13a 완료 (80 → 41 inline 잔존, 모바일 zone 42 → 3, single atomic — 옵션 X+P+M+색변수N+module const N 승계)
  - **Phase B Tier 2 두 번째 wave 완결** — Wave 12a zone-aware sweep 패턴 14번째 atomic 자동 도달. 13b/14a/14b/15a/15b 후행 wave reference
  - **데스크톱 zone 38곳 절대 변경 0 검증 패턴** — `{isDesktop ? (...) : (...)}` ternary 의 desktop-header(8) + mobile-header boundary(8) + `{isDesktop && ...}` block data-table(22) 모두 skip. Wave 13b 후행으로 미루는 분할 룰 12a → 13a 연속 적용
  - **INPUT_STYLE / LABEL_STYLE / SKELETON_STYLE 3개 module const 보존 + INPUT_STYLE spread 옵션 N 3건 유지** — Wave 6 hbv (Schedule inp/lbl) + Wave 12a epe (StaffManage form) precedent 그대로. L61/L66/L414 정의 보존, 모달 select 3건 spread 잔존 (카테고리/층/소화기 종류 select 의 `appearance: 'none'` + `cursor: 'pointer'` 동적 combo)
  - **mobile-header boundary 보존 룰 12a → 13a 연속 적용** — desktop ternary 의 alternate branch(L554-582 mobile-header) 도 desktop zone 처리 책임 (Wave 13b 함께). 모바일/데스크톱 모두 동일 mobile-header inline 이 등장하지 않음 (이 page 는 mobile-header 도 desktop-only ternary 안에 있음)
affects:
  - src/pages/CheckpointsPage.tsx
tech-stack:
  added: []
  patterns:
    - "옵션 X (정확값 arbitrary) — `bg-[rgba(0,0,0,0.6)]` / `bg-[rgba(0,0,0,0.5)]` / `bg-[rgba(59,130,246,0.13)]` / `bg-[rgba(239,68,68,0.08)]` / `w-[440px]` / `w-[32px]` / `w-[8px] h-[8px]` / `h-[52px]` / `max-h-[90vh]` / `max-h-[85vh]` / `rounded-t-[16px]` / `rounded-[12px]` / `rounded-[8px]` / `rounded-[4px]` / `rounded-[2px]` / `px-[5px]` / `pb-[calc(16px+var(--sab))]` / `shadow-[0_8px_32px_rgba(0,0,0,0.18)]` / `[animation:slideUp_0.28s_ease-out_both]` 정확값 보존"
    - "옵션 P (leading-none 명시) — cp-cat-badge + cp-meta + cp-action chip 의 `leading-none` 그대로 유지 (text-caption lh:1.5 작은 컨테이너 내 패딩 방지)"
    - "옵션 M (template literal conditional) — zone btn 2-prop bg+color 동적 `${form.zone === z ? 'bg-accent text-white' : 'bg-surface-active text-text-tertiary'}` + btn-save 2-prop cursor+opacity `${canSave && !isBusy ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-40'}` + btn-deactivate-confirm 1-prop opacity `${deactivateMutation.isPending ? 'opacity-60' : 'opacity-100'}` + cp-card root 1-prop opacity `${cp.isActive === 0 ? 'cp-card inactive opacity-45' : 'cp-card opacity-100'}` + cp-dot 1-prop bg `${cp.isActive !== 0 ? 'bg-safe-bar' : 'bg-text-tertiary'}`"
    - "옵션 N (의도 inline) 잔존 3건 — L253/L274/L286 모달 select 모두 `style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }}` (INPUT_STYLE spread + 2-prop non-config dynamic combo). Wave 12a precedent: form 사번 input/입사일 input 의 spread 패턴 동일"
    - "tokens.css alias 일괄 매핑 (Wave 11/12a precedent 그대로) — `var(--bg2)`→`bg-surface-raised` / `var(--bg3)`→`bg-surface-sunken` / `var(--bd)`→`border-border-default` / `var(--bd2)`→`bg-border-strong` / `var(--t1)`→`text-text-primary` / `var(--t2)`→`text-text-secondary` / `var(--t3)`→`text-text-tertiary` / `var(--accent)`→`text-accent` & `bg-accent` / `var(--status-danger)`→`text-danger-bar` & `bg-danger-bar` / `var(--status-safe-bar)`→`bg-safe-bar` / `var(--surface-active)`→`bg-surface-active` / `var(--surface-sunken)`→`bg-surface-sunken` / `var(--surface-page)`→`bg-surface-page` / `var(--text-primary/secondary/tertiary)`→`text-text-primary/secondary/tertiary` / `var(--border-default)`→`border-border-default`"
    - "w-8/h-8=48 spacing override 회피 — height:36 → `h-9` (h-9=36 OK), height:44 → `h-11` (h-11=44 OK), height:40 → `h-10` (h-10=40 OK), minHeight:48 → `min-h-12` (h-12=48 OK), height:52 (mobile FAB) → `h-[52px]` arbitrary 유지 (Wave 12a precedent 그대로)"
    - "비대칭 / 비표준 radius arbitrary — borderRadius:'16px 16px 0 0' → `rounded-t-[16px]` / borderRadius:12 → `rounded-[12px]` arbitrary (rounded-md spacing override 충돌 회피, Wave 12a 와 다른 보수적 접근) / borderRadius:8 → `rounded-[8px]` / borderRadius:4 → `rounded-[4px]` / borderRadius:2 → `rounded-[2px]` (handle bar)"
    - "underscore in animation arbitrary — `[animation:slideUp_0.28s_ease-out_both]` 공백 → 언더스코어 치환 (Wave 5/11/12a precedent 그대로)"
    - "boundary line 보존 — desktop ternary 의 양쪽 분기(L516 desktop-header + L554 mobile-header)에 동일한 `style={{ flexShrink: 0 }}` 가 등장 → 양쪽 모두 보존 (12a 룰 그대로 13a 적용). mobile-header 가 boundary 로 desktop zone 분류"
key-files:
  created:
    - .planning/quick/260529-f2w-phase-b-wave-13a/260529-f2w-SUMMARY.md
  modified:
    - src/pages/CheckpointsPage.tsx
decisions:
  - "wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe 14 wave 승계 옵션 X+P+M+색변수N — 사용자 재컨펌 불필요 (0hr roadmap locked, 14번째 승계)"
  - "zone-aware sweep 12a → 13a 연속 적용 — `{isDesktop ? (desktop-header) : (mobile-header)}` ternary 의 양쪽 분기 모두 보존 (boundary 일관성). `{isDesktop && data-table}` block 안 22건 모두 보존. `{!isDesktop && card-list/empty}` block + `{!isDesktop && mobile-fab}` block 안 변환. 후행 13b 에서 desktop zone 38곳 처리"
  - "INPUT_STYLE / LABEL_STYLE / SKELETON_STYLE module const 보존 (Wave 6 + 12a precedent) — L61/L66/L414 정의 그대로. `style={LABEL_STYLE}` 13건 / `style={INPUT_STYLE}` 9건 / `style={SKELETON_STYLE}` 3건 직접 참조는 이미 inline 아님 (verify에 안 잡힘) + `style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }}` 3건 spread 잔존 = 옵션 N. 카테고리/층/소화기 종류 select 의 `appearance: 'none'` + `cursor: 'pointer'` 가 INPUT_STYLE 에 없는 동적 prop combo → inline 유지"
  - "rounded-[12px] / rounded-[8px] arbitrary 채택 — Wave 12a 는 `rounded-md` 매핑 사용했으나 본 wave 는 정확값 보장을 위해 arbitrary 선택 (tailwind config spacing override 변경 위험 회피). 시각 0 byte 결과 동일, 코드 가독성만 다름"
  - "cp-cat-badge px-[5px] arbitrary — padding:'2px 5px' 의 5px 가 tailwind config spacing 에 없음 (px-1=4 / px-1.5=6 / px-[5px] arbitrary). py-0.5 (=2px) 는 config 일치"
  - "비대칭 radius rounded-t-[16px] — borderRadius:'16px 16px 0 0' 의 비대칭은 rounded-t-2xl(=16px) 도 매칭 가능하나 정확도 위해 arbitrary 선택 (Wave 12a 와 동일 보수적 접근)"
  - "단일 atomic commit 패턴 자동 도달 — wdc 이후 14번째 atomic (a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe 승계). 42 mobile inline 단일 atomic"
  - "**Tier 2 두 번째 wave** — zone 분할 패턴 14번째 atomic 자동 도달. 13b/14a/14b/15a/15b reference 강화"
metrics:
  duration: "약 15분 (Task 1 atomic — single commit, 42 mobile inline sweep)"
  completed-date: 2026-05-29
  tasks-completed: "1/1"
  files-modified: 1
  lines-changed: "40 insertions / 48 deletions (net -8 lines, atomic single commit)"
roadmap-wave: "Tier 2 / Wave 13a (Checkpoints 모바일 zone — Tier 2 두 번째 wave)"
---

# Phase 260529-f2w Plan 01: Phase B Wave 13a CheckpointsPage 모바일 zone Summary

CheckpointsPage.tsx (696줄, 80 total inline = 모바일 zone 42 + 데스크톱 zone 38) 의 **모바일 zone 42건** 정적 inline style 을 wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe 승계 옵션 X+P+M+색변수N+module const N 으로 tailwind className 변환. **데스크톱 zone 38곳 절대 변경 0** (Wave 13b 후행). **단일 atomic commit**. **80 → 41 잔존** (-39건 -48.8%): 모바일 zone 42 → 3 (-39건, INPUT_STYLE spread 옵션 N 3건 잔존) + 데스크톱 zone 38 → 38 (보존). 시각 결과 0 byte 변경 (no-op refactor). Phase A 결과 (Lucide / 색 토큰 -bar / emoji 보존 / 비표준 색 0) 및 비즈니스 로직 (12 onClick + 4 useState + 2 useEffect + 3 useMutation + 4 useQuery + 1 useNavigate 모두 보존) 모두 IDENTICAL. **Phase B Tier 2 Wave 13a 성공** — 예상 (~41-43 잔존) 정확 달성 (41 잔존). **Tier 2 두 번째 wave** — zone-aware sweep 패턴 14번째 atomic 자동 도달, 13b/14a/14b/15a/15b reference 강화.

## User Decisions (승계 — wdc / 01h / a3v / c9s / cjn / gsh / h3z / hbv / iht / irl / jey / jxo / nkv / epe / 0hr-roadmap 재확인 불필요)

| ID  | 선택                                                           | 출처                              |
| --- | -------------------------------------------------------------- | --------------------------------- |
| (b) | **옵션 X** — 정확값 arbitrary `[Npx]` (시각 0 byte)             | wdc Phase B Task 2 결정            |
| (c) | **옵션 P** — `leading-none` 명시 보존                           | wdc Phase B Task 2 결정            |
| (d) | **옵션 M + 색 변수만 N** — template literal conditional 우선    | wdc Phase B Task 2 결정            |
| -   | **a3v~epe 14 wave 승계 적용** — 본 wave 재확인 없이             | 260528-0hr roadmap v2 locked-decisions |
| -   | **module-scope const N (LABEL_STYLE / INPUT_STYLE / SKELETON_STYLE)** | Wave 6 hbv (Schedule inp/lbl) precedent + Wave 12a epe (StaffManage form) precedent |
| -   | **zone-aware sweep — 모바일 zone 만, 데스크톱 zone 38 보존**     | Wave 12a 분할 패턴 13a 연속 적용  |

## Before / After 카운트

| Metric                                                | Before | After  | Diff             |
| ----------------------------------------------------- | ------ | ------ | ---------------- |
| CheckpointsPage.tsx total `style={{`                  | **80** | **41** | **-39 (-48.8%)** |
| CheckpointsPage.tsx 모바일 zone `style={{`             | **42** | **3**  | **-39 (-92.9%)** |
| CheckpointsPage.tsx 데스크톱 zone `style={{`           | **38** | **38** | **= (보존)**     |
| INPUT_STYLE / LABEL_STYLE / SKELETON_STYLE const def  | **3**  | **3**  | **= (보존)**     |
| TypeScript errors                                     | 0      | 0      | =                |
| 비즈 anchors (12 onClick / 4 useState / 2 useEffect / 3 useMutation / 4 useQuery / 1 useNavigate) | IDENTICAL | IDENTICAL | = |
| 비표준 색 토큰 (warning/safe/danger no-suffix)         | 0      | 0      | =                |
| emoji (▸ 등 보존)                                      | 1      | 1      | =                |
| 변경 파일 수 (1 .tsx 외 off-scope)                     | 0      | 0      | =                |
| Vite build (PWA generation)                           | OK     | OK     | =                |

## 모바일 zone sweep 매핑 (39건 — 주요 site)

### BottomSheet (L29-36 → L29-36) — 5건 변환

| Line | Before (요약)                                                                                       | After (요약)                                                              | 옵션 |
| ----:| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----:|
| L29  | backdrop 7-prop fixed/inset/bg(rgba)/zIndex/flex/flex-col/justify-end                                | `fixed inset-0 bg-[rgba(0,0,0,0.6)] z-[50] flex flex-col justify-end`     | X    |
| L32  | sheet 4-prop bg(var)/borderRadius(비대칭)/animation/maxHeight                                        | `bg-surface-raised rounded-t-[16px] [animation:slideUp_0.28s_ease-out_both] max-h-[90vh] overflow-y-auto` | X+token |
| L33  | handle area 3-prop flex/justify-center/paddingTop                                                    | `flex justify-center pt-3`                                                | -    |
| L34  | handle bar 4-prop width(32)/height(4)/bg(var)/borderRadius(2)                                        | `w-[32px] h-1 bg-border-strong rounded-[2px]`                             | X+token |
| L36  | title 4-prop fontSize/fontWeight/color/padding                                                       | `text-base font-bold text-text-primary px-4 pt-3 pb-0`                    | token |

### DesktopModal (L49-53 → L49-53) — 3건 변환

| Line | Before (요약)                                                                                       | After (요약)                                                              | 옵션 |
| ----:| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----:|
| L49  | backdrop 6-prop fixed/inset/bg(rgba)/zIndex/items-center/justify-center                              | `fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[50] flex items-center justify-center` | X    |
| L52  | modal box 6-prop bg(var)/borderRadius(12)/width(440)/maxHeight/overflow/boxShadow                    | `bg-surface-raised rounded-[12px] w-[440px] max-h-[85vh] overflow-y-auto shadow-[0_8px_32px_rgba(0,0,0,0.18)]` | X+token |
| L53  | title 4-prop fontSize/fontWeight/color/padding                                                       | `text-base font-bold text-text-primary px-6 pt-5 pb-0`                    | token |

### CheckPointModalContent (L250-387) — 16건 변환 (옵션 N spread 3건 잔존)

| Line | Before (요약)                                                                                       | After (요약)                                                              | 옵션 |
| ----:| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----:|
| L250 | form-body 3-prop padding/flex/gap                                                                    | `form-body px-4 pt-4 pb-0 flex flex-col gap-3`                            | -    |
| L252 | required asterisk 1-prop color (var(--status-danger))                                                | `required-star text-danger-bar`                                           | token |
| L253 | **카테고리 select — INPUT_STYLE spread + appearance/cursor**                                          | **inline 잔존 (옵션 N)**                                                  | **N** |
| L260 | zone-row 5-prop flex/gap/borderRadius/overflow/border                                                | `zone-row flex gap-0 rounded-[8px] overflow-hidden border border-border-default` | X+token |
| L264 | zone btn 8-prop flex/height/border/cursor/transition/bg/color (conditional)                          | `flex-1 h-9 border-0 cursor-pointer transition-[all_0.15s] ${form.zone === z ? 'zone-btn active bg-accent text-white' : 'zone-btn inactive bg-surface-active text-text-tertiary'}` | M+token |
| L274 | **층 select — INPUT_STYLE spread + appearance/cursor**                                                | **inline 잔존 (옵션 N)**                                                  | **N** |
| L285 | required asterisk (소화기 종류) 1-prop color                                                          | `required-star text-danger-bar`                                           | token |
| L286 | **소화기 종류 select — INPUT_STYLE spread + appearance/cursor**                                       | **inline 잔존 (옵션 N)**                                                  | **N** |
| L335 | required asterisk (개소명) 1-prop color                                                               | `required-star text-danger-bar`                                           | token |
| L353 | action-row 3-prop padding/flex/gap                                                                   | `action-row p-4 flex flex-col gap-2`                                      | -    |
| L354 | action-btns 2-prop flex/gap                                                                          | `action-btns flex gap-2`                                                  | -    |
| L357 | btn-cancel 7-prop flex/height/bg/color/border/borderRadius/cursor                                    | `btn-cancel flex-1 h-11 bg-surface-active text-text-secondary border-0 rounded-[8px] cursor-pointer` | X+token |
| L362 | btn-save 7-prop flex/height/bg/color/border/borderRadius/cursor/opacity                              | `flex-1 h-11 bg-accent text-white border-0 rounded-[8px] ${canSave && !isBusy ? 'btn-save cursor-pointer opacity-100' : 'btn-save disabled cursor-not-allowed opacity-40'}` | M+token |
| L369 | btn-deactivate 7-prop width/height/bg(rgba)/color/border/borderRadius/cursor                         | `btn-deactivate w-full h-10 bg-[rgba(239,68,68,0.08)] text-danger-bar border-0 rounded-[8px] cursor-pointer` | X+token |
| L375 | deactivate-confirm-box 1-prop padding                                                                | `deactivate-confirm-box p-4`                                              | -    |
| L376 | inner banner 5-prop bg(rgba)/borderRadius/padding/color/marginBottom                                 | `bg-[rgba(239,68,68,0.08)] rounded-[8px] p-3 text-text-secondary mb-2`    | X+token |
| L379 | action-btns 2-prop flex/gap                                                                          | `action-btns flex gap-2`                                                  | -    |
| L382 | btn-cancel 7-prop flex/height/bg/color/border/borderRadius/cursor                                    | `btn-cancel flex-1 h-11 bg-surface-active text-text-secondary border-0 rounded-[8px] cursor-pointer` | X+token |
| L387 | btn-deactivate-confirm 7-prop flex/height/bg/color/border/borderRadius/cursor/opacity                | `btn-deactivate-confirm flex-1 h-11 bg-danger-bar text-white border-0 rounded-[8px] cursor-pointer ${deactivateMutation.isPending ? 'opacity-60' : 'opacity-100'}` | M+token |

### CheckPointCard (L402-415 → L398-411) — 8건 변환

| Line | Before (요약)                                                                                       | After (요약)                                                              | 옵션 |
| ----:| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----:|
| L402 | card root 8-prop bg(var)/borderRadius/padding/minHeight/flex/items-center/gap/opacity + cursor       | `${cp.isActive === 0 ? 'cp-card inactive opacity-45' : 'cp-card opacity-100'} bg-surface-sunken rounded-[12px] px-4 py-3 min-h-12 flex items-center gap-2.5 cursor-pointer` | M+X+token |
| L403 | cp-dot 2-prop flexShrink/bg (active vs tertiary)                                                      | `cp-dot w-[8px] h-[8px] rounded-full flex-shrink-0 ${cp.isActive !== 0 ? 'bg-safe-bar' : 'bg-text-tertiary'}` | M+token |
| L404 | cp-content 2-prop flex/minWidth                                                                       | `cp-content flex-1 min-w-0`                                               | -    |
| L405 | cp-top 4-prop flex/items-center/gap/marginBottom                                                      | `cp-top flex items-center gap-1.5 mb-0.5`                                 | -    |
| L406 | cp-location 4-prop color/overflow/textOverflow/whiteSpace                                             | `cp-location text-body-sm font-bold text-text-primary overflow-hidden text-ellipsis whitespace-nowrap` | token |
| L407 | cp-cat-badge 5-prop padding/borderRadius/bg(rgba)/color/flexShrink                                    | `cp-cat-badge text-caption leading-none px-[5px] py-0.5 rounded-[4px] bg-[rgba(59,130,246,0.13)] text-accent flex-shrink-0` | X+P+token |
| L411 | cp-meta 1-prop color                                                                                  | `cp-meta text-caption leading-none text-text-secondary`                   | P+token |
| L415 | cp-action 3-prop color/fontWeight/flexShrink                                                          | `cp-action text-caption leading-none text-accent font-bold flex-shrink-0` | P+token |

### Skeleton wrap (L593 → L587) — 1건 변환

| Line | Before (요약)                                                                                       | After (요약)                                                              | 옵션 |
| ----:| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----:|
| L593 | skeleton-wrap 3-prop padding/flex/gap                                                                | `skeleton-wrap px-4 py-3 flex flex-col gap-2`                             | -    |

### Mobile-only (L662-686 → L656-678) — 6건 변환

| Line | Before (요약)                                                                                       | After (요약)                                                              | 옵션 |
| ----:| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----:|
| L662 | card-list 3-prop padding/flex/gap                                                                    | `card-list px-4 pb-20 flex flex-col gap-2`                                | -    |
| L664 | empty wrap 6-prop flex/flex-col/items-center/justify-center/gap/padding                              | `flex-1 flex flex-col items-center justify-center gap-2 px-4 py-10`       | -    |
| L665 | empty title 1-prop color                                                                              | `text-body font-bold text-text-primary`                                   | token |
| L666 | empty desc 2-prop color/textAlign                                                                     | `text-caption text-text-secondary text-center`                            | token |
| L678 | mobile-fab-wrap 5-prop sticky/bottom/padding/paddingBottom(calc)/bg(var)                              | `mobile-fab-wrap sticky bottom-0 px-4 pb-[calc(16px+var(--sab))] bg-surface-page` | X+token |
| L681 | mobile-fab button 2-prop border/cursor                                                                | `border-0 cursor-pointer` (기존 className 병합)                            | -    |

## 옵션 N (의도 inline) 잔존 3건 — 모두 INPUT_STYLE spread

| Line (After) | 위치                  | 잔존 prop                                                                | 사유                                                                                  |
| ----:        | --------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| L253         | 카테고리 select       | `{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }`              | INPUT_STYLE spread + 2-prop non-config dynamic combo (appearance:none + cursor:pointer) → inline 유지 (옵션 N, Wave 6 hbv + 12a epe precedent) |
| L274         | 층 select             | `{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }`              | 동일 패턴 (옵션 N)                                                                    |
| L286         | 소화기 종류 select    | `{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }`              | 동일 패턴 (옵션 N)                                                                    |

## 데스크톱 zone 보존 38건 (변경 0 — Wave 13b 후행)

| Line range | 영역                                                                                       | inline 잔존 |
| ---------- | ------------------------------------------------------------------------------------------ | ----------: |
| L516       | desktop-header wrap `style={{ flexShrink: 0 }}` (boundary)                                  | 1           |
| L517       | cat-select-wrap `position: relative, width: 220`                                            | 1           |
| L522       | desktop cat select `{ ...INPUT_STYLE, height: 36, appearance: 'none', cursor: 'pointer', paddingRight: 32 }` | 1 |
| L527       | chevron-icon (desktop)                                                                      | 1           |
| L532       | desktop filter-select (zone)                                                                | 1           |
| L539       | desktop filter-select (floor)                                                               | 1           |
| L543       | desktop count-label                                                                         | 1           |
| L548       | desktop add-btn                                                                             | 1           |
| L554       | mobile-header wrap `style={{ flexShrink: 0 }}` (ternary alternate boundary)                 | 1           |
| L555       | mob-cat-wrap                                                                                | 1           |
| L557       | mob-cat-select INPUT_STYLE spread                                                           | 1           |
| L561       | chevron-icon (mobile-header)                                                                | 1           |
| L566       | mob-filter-row flex/gap                                                                     | 1           |
| L568       | mob-filter-select (zone)                                                                    | 1           |
| L575       | mob-filter-select (floor)                                                                   | 1           |
| L579       | mob-count                                                                                   | 1           |
| L607       | desktop-content data-table wrap                                                             | 1           |
| L609       | table 2-prop width/borderCollapse                                                            | 1           |
| L612-L618  | thead th 7개 (모두 padding/color/width)                                                      | 7           |
| L623       | empty td colSpan=7                                                                          | 1           |
| L629       | tr row cursor/opacity/transition                                                             | 1           |
| L633       | td location maxWidth/overflow/textOverflow/whiteSpace                                        | 1           |
| L634       | td category-badge padding                                                                    | 1           |
| L635       | category badge span padding/borderRadius/bg/color                                            | 1           |
| L639       | td zone color                                                                                | 1           |
| L640       | td floor color                                                                               | 1           |
| L641       | td locationno padding/color                                                                  | 1           |
| L642       | td status-cell padding                                                                       | 1           |
| L644       | status-cell span color (conditional)                                                         | 1           |
| L645       | status-dot width/height/borderRadius/bg                                                      | 1           |
| L649       | td action-cell padding                                                                       | 1           |
| L650       | action-cell span color                                                                       | 1           |
| **합계**   |                                                                                            | **38**      |

> Wave 13b 가 위 38건 처리 책임. 본 wave 는 모두 보존 (시각 0 byte / 비즈 anchor IDENTICAL). diff hunk 분석으로 데스크톱 zone 영역(L516-548 / L554-582 / L606-658) 의 +/- 라인 0건 확인.

## 비즈 anchors 보존 (12 onClick / 4 useState / 2 useEffect / 3 useMutation / 4 useQuery / 1 useNavigate — IDENTICAL)

```
onClick=\{...\} : 12 (before) == 12 (after)
useState\( : 4 == 4
useEffect\( : 2 == 2
useMutation\( : 3 == 3
useQuery\( : 4 == 4
useNavigate\( : 1 == 1
useRef\( : 0 == 0
useParams\( : 0 == 0
fetch\( : 0 == 0
```

precise diff (sort+uniq onClick set): **0 line difference** (10 unique onClick callsites all preserved).

## 자동 검증 결과

| Verify gate                                            | Result    |
| ------------------------------------------------------ | --------- |
| `style={{` total 38-46                                 | **41** ✓ (within range; 38 desktop + 3 N잔존) |
| `style={{` 모바일 zone 0-5                              | **3** ✓ (INPUT_STYLE spread 옵션 N) |
| `style={{` 데스크톱 zone = 38                           | **38** ✓ (보존)        |
| diff hunk 데스크톱 zone 영역 변경 = 0                   | **0** ✓ (L516-548 / L554-582 / L606-658 hunk header 0건) |
| emoji ▸ 등 보존                                         | **1** ✓ (변동 0)   |
| TypeScript `error TS` count = 0                        | **0** ✓   |
| 비표준 색 토큰 (warning/safe/danger no-suffix) = 0      | **0** ✓   |
| INPUT_STYLE / LABEL_STYLE / SKELETON_STYLE const def = 3 | **3** ✓ |
| 변경 파일 = 1 .tsx 만 (off-scope = 0)                   | **0 off-scope** ✓ |
| Vite build (PWA generation)                            | **succeeded** ✓ |

## Commit

| Hash        | Subject                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `9cafd5c`   | feat(260529-f2w-01): Phase B Wave 13a — Checkpoints 모바일 zone (42 inline) → tailwind            |

## Phase B Tier 1 종결 + Tier 2 진입 (Wave 1~13a 누적)

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
| 12a  | StaffManage 모바일 zone (Tier 2 첫 wave)                | 76 → 26 (모바일 52→2)   | -                      | 1ca5c94       |
| **13a** | **Checkpoints 모바일 zone (Tier 2 두 번째 wave)** ← 이번 | **80 → 41 (모바일 42→3)** | -                      | **9cafd5c**   |
| **합계 (13a)** | **17 페이지**                                  | **668 → 233 (-65.1%)**  | **37 → 0 (Phase A 완결)** | **13 atomic commits** |

### Tier 2 진행 — zone-aware sweep 패턴 14번째 atomic 자동 도달

1. **모바일 zone 만 sweep** — `{isDesktop ? (desktop-header) : (mobile-header)}` ternary 의 양쪽 분기 모두 보존 (boundary 일관성), `{isDesktop && data-table}` block 안 전체 보존, `{!isDesktop && card-list}` block + `{!isDesktop && mobile-fab}` block 안 변환
2. **데스크톱 zone 38곳 절대 변경 0** — Wave 13b 후행. desktop-header (8) + mobile-header boundary (8) + data-table (22) 모두 IDENTICAL. diff hunk 분석으로 데스크톱 영역 +/- 라인 0건 확인
3. **module-scope const N 적용 일관** — INPUT_STYLE / LABEL_STYLE / SKELETON_STYLE 정의 보존 (3 const def), INPUT_STYLE spread 옵션 N 3건 잔존 (3개 모달 select 모두 `appearance:none + cursor:pointer` non-config dynamic combo). Wave 6 hbv + Wave 12a epe precedent 그대로
4. **boundary line 보존 룰 12a → 13a 연속 적용** — desktop ternary 의 양쪽 분기(L516 desktop-header + L554 mobile-header)에 동일한 `style={{ flexShrink: 0 }}` 등장 → 둘 다 보존
5. **단일 atomic commit 패턴 14회 자동 도달** — Wave 1~12a + 13a 모두 atomic, 14번째 (Checkpoints 80+0) 까지 단일 atomic 적용
6. **시각 0 byte 룰 100% 유지** — 13 wave 모두 PWA build 성공 + 비즈 anchor IDENTICAL + 비표준 색 토큰 0

### 다음 단계 (Tier 2 진행)

- **Wave 13b** — CheckpointsPage 데스크톱 zone 38곳 sweep (desktop-header 8 + mobile-header boundary 8 + data-table 22)
- Wave 14a/14b/15a/15b — 모바일/데스크톱 분할 페이지 후속 (본 wave zone-aware sweep 패턴 reference 강화)
- 옵션 X+P+M+색변수N + module const N 룰 그대로 승계

## 메모리 anchor 적용

| anchor | 적용 |
| ------ | ---- |
| `feedback_tailwind_w8_h8_is_48px.md` | h-9=36 (zone btn) / h-10=40 (btn-deactivate) / h-11=44 (btn-cancel/save) / min-h-12=48 (cp-card minHeight:48) / h-[52px] (mobile FAB) arbitrary. w-7=32 / w-8=48 spacing override 인지 + w-[32px] arbitrary (handle bar) 회피 |
| `feedback_tailwind_token_class_pattern.md` | text-danger-bar / bg-danger-bar / bg-safe-bar / text-accent / bg-accent / bg-surface-* / border-border-default / text-text-* — status- prefix 없음, lucide 사이즈 prop 패턴 (ChevronDown/Plus size={N}) |
| `feedback_text_caption_leading_none.md` | cp-cat-badge / cp-meta / cp-action 3곳 leading-none 명시 유지 (text-caption lh:1.5 작은 컨테이너 내 패딩 방지). p-0.5 (=2px) + px-[5px] (=5px) 작은 padding 컨테이너 케이스 |
| Wave 6 hbv + 12a epe (module const) precedent | INPUT_STYLE / LABEL_STYLE / SKELETON_STYLE 정의 보존 + spread 옵션 N 잔존 룰 그대로 적용 |
| Wave 11 nkv + 12a epe (token alias 일괄 매핑) | tokens.css L178-191 alias 그대로 활용 (var(--bg2/bg3/bd/bd2/t1/t2/t3/accent/status-danger/status-safe-bar/surface-active/surface-sunken 등 일괄 className 변환) |
| Wave 5 (RemediationDetail) underscore animation | `[animation:slideUp_0.28s_ease-out_both]` 공백→언더스코어 치환 (slideUp keyframe 룰 동일) |

## Self-Check: PASSED

- CheckpointsPage.tsx 변경 (file:/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/CheckpointsPage.tsx) — FOUND
- commit hash `9cafd5c` — FOUND in git log
- emoji 보존 (▸ 1건) verify gate — PASSED
- 비즈 anchor diff = 0 line — PASSED
- TypeScript = 0 error — PASSED
- Vite build = succeeded — PASSED
- off-scope 변경 = 0 — PASSED
- INPUT_STYLE / LABEL_STYLE / SKELETON_STYLE const def = 3 — PASSED
- 데스크톱 zone 38곳 보존 — PASSED (diff hunk 분석 + 데스크톱 영역 L516-548/L554-582/L606-658 hunk header 0건)
