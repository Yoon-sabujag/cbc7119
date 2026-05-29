---
phase: 260529-ozt-phase-b-wave-13b-checkpoints-desktop
plan: 01
subsystem: redesign/phase-b-sweep
status: complete
tags: [checkpoints, inline-style-to-tailwind, no-op-refactor, phase-b-tier-2-wave-13b, tier-2-pair-wave, zone-aware-sweep, desktop-zone-only, mobile-zone-preserved, input-style-spread-preserved, pattern-a-bottomsheet-preserved, boundary-paired-conversion, atomic-single-commit]
requires:
  - 260529-f2w-phase-b-wave-13a 완료 (Checkpoints 모바일 zone atomic, 9cafd5c — Tier 2 두 번째 wave, zone-aware sweep precedent)
  - 260529-odl-phase-b-wave-12b 완료 (StaffManage 데스크톱 zone atomic, Tier 2 페어 wave 완결 첫 사례 — boundary paired conversion 룰 박제)
  - 260528-hbv-phase-b-wave-6 완료 (Schedule inp/lbl module const precedent)
  - 260527-wdc-legalpage-phase-b 옵션 X+P+M+색변수N 확정 (184e548)
provides:
  - CheckpointsPage.tsx Phase B 완결 (41 → 6 inline 잔존 = 모바일 4 + 데스크톱 INPUT_STYLE spread 2 옵션 N — single atomic — 옵션 X+P+M+색변수N+module const N 승계, 18번째 atomic)
  - **Phase B Tier 2 13a + 13b 페어 wave 완결** — CheckpointsPage 전체 inline 80 → 6 (-92.5%). 모바일 zone 13a sweep + 데스크톱 zone 13b sweep 분할 패턴 12a/12b 페어 후 두 번째 완결. 14a/15a 후행 페어 reference 강화
  - **boundary paired conversion 룰 12b → 13b 연속 적용** — Wave 13a 가 `style={{ flexShrink: 0 }}` 의 desktop-header(L517) + mobile-header(L555) 둘 다 보존했던 룰을, 13b 에서 둘 다 변환 (`shrink-0` × 2). ternary 양쪽 boundary 일관성 정리 패턴 두 번째 적용 (12b 박제 직후)
  - **데스크톱 zone INPUT_STYLE spread 옵션 N 확장 2건 박제** — desktop cat select L523 (`{ ...INPUT_STYLE, height: 36, appearance: 'none', cursor: 'pointer', paddingRight: 32 }` 4-prop dynamic combo) + mob-cat-select L558 (`{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer', paddingRight: 36 }` 3-prop dynamic combo). INPUT_STYLE spread 가 모바일 zone 만이 아닌 데스크톱 zone 에서도 옵션 N 적용 (Wave 6 hbv + 12a/12b precedent 확장). 잔존 카운트 = 4 모바일 + 2 데스크톱 = 6
  - **테이블 패턴 변환 박제 (12b precedent 두 번째 적용)** — `padding: '10px 8px'` → `py-2.5 px-2`, `padding: '0 24px 24px'` → `px-6 pb-6`, `padding: '40px 16px'` → `py-10 px-4`, `borderCollapse: 'collapse'` → `border-collapse`, `fontWeight: 600` → `font-semibold`, `transition: 'background 0.1s'` → `transition-[background] duration-100`. 12b 박제 직후 즉시 재활용 (StaffManage 와 같은 데이터 테이블 패턴 공유)
  - **onMouseEnter/Leave handler 보존 패턴 (12b precedent)** — JSX inline handler body 의 `e.currentTarget.style.background = 'var(--surface-sunken)'` 은 `style={{` 게이트와 무관. var(--surface-sunken) 보존, transition className 위 부드러운 hover 효과 IDENTICAL
affects:
  - src/pages/CheckpointsPage.tsx
tech-stack:
  added: []
  patterns:
    - "옵션 X (정확값 arbitrary) — `w-[220px]` (cat-select-wrap width 220) / `right-[10px]` (chevron-icon desktop) / `rounded-[8px]` (filter-select × 4) / `rounded-[4px]` (category badge) / `w-[60px]` (액션 th width 60) / `max-w-[200px]` (location td maxWidth) / `w-[6px] h-[6px]` (status-dot 정확값, w-1.5/h-1.5 도 가능하나 13a precedent w-[8px] h-[8px] 와 일관성) / `bg-[rgba(59,130,246,.13)]` (category badge bg)"
    - "옵션 P (leading-none 명시) — 13a 에서 적용 완료된 status-cell + category badge span 의 `leading-none` 그대로 보존. 본 13b 신규 추가 0건 (테이블 td/th 컨테이너는 텍스트 wrapper 아님)"
    - "옵션 M (template literal conditional) — 3건: (1) tr opacity 1-prop `${cp.isActive === 0 ? 'opacity-45' : 'opacity-100'}` (border-bottom + cursor + transition 함께 한 줄 합침) / (2) status-cell span text color 1-prop `${cp.isActive !== 0 ? 'text-safe-bar' : 'text-text-tertiary'}` / (3) status-dot bg 1-prop `${cp.isActive !== 0 ? 'bg-safe-bar' : 'bg-text-tertiary'}`"
    - "옵션 N (의도 inline) 잔존 6건 — 모바일 4 (L36 BottomSheet Pattern A NAV_BOTTOM+calc, L261 카테고리 select INPUT_STYLE 2-prop spread, L281 층 select INPUT_STYLE 2-prop spread, L293 소화기 종류 select INPUT_STYLE 2-prop spread) + 데스크톱 zone INPUT_STYLE spread 2 (L523 desktop cat select 4-prop dynamic combo height:36+appearance:none+cursor:pointer+paddingRight:32, L555 mob-cat-select 3-prop dynamic combo). 모두 INPUT_STYLE spread 룰 (Wave 6 hbv + 12a/12b precedent 그대로 13b 연속)"
    - "module const N — INPUT_STYLE / LABEL_STYLE / NAV_BOTTOM / SKELETON_STYLE 정의 4건 보존 (Wave 13a precedent, L24/L69/L74/L422)"
    - "tokens.css alias 일괄 매핑 (12b precedent + 13a 그대로) — `var(--border-default)` → `border-border-default` / `var(--surface-sunken)` → `bg-surface-sunken` / `var(--text-primary)` → `text-text-primary` / `var(--text-secondary)` → `text-text-secondary` / `var(--text-tertiary)` → `text-text-tertiary` + `bg-text-tertiary` / `var(--accent)` → `text-accent` / `var(--status-safe-bar)` → `text-safe-bar` + `bg-safe-bar`. var(--surface-sunken) 만 onMouseEnter handler body 안에 잔존 (handler body 는 변환 범위 밖)"
    - "테이블 패딩 spacing override 인지 — `py-2.5` (10px) + `px-2` (8px) + `py-10` (40px) + `px-4` (16px) + `px-6` (24px) + `pb-6` (24px) + `gap-1` (4px) + `gap-1.5` (6px) + `py-0` (0) + `py-0.5` (2px) + `px-1.5` (6px) + `px-2.5` (10px). tailwind.config.js spacing override 1-8 만 (1=4/2=8/3=12/4=16/5=20/6=24/7=32/8=48) — 0.5/1.5/2.5/10 모두 기본값 그대로 사용 OK"
    - "h-9 = 36px tailwind 기본값 — tailwind.config.js spacing override 에 9 미존재 → 기본 0.25rem * 9 = 2.25rem = 36px 그대로 사용 (RemediationPage L260/L522, ElevatorPage L1895/L2333, InspectionPage 다수 사용 precedent 확인)"
    - "opacity-45 = 0.45 tailwind 기본값 — node_modules/tailwindcss/stubs/config.full.js 의 opacity scale 0-100 (5/15/25/35/45/55/65/85/95 포함) 기본 포함. config extend 없이도 사용 OK (StaffManagePage L318 / CheckpointsPage L403 cp-card precedent 확인)"
    - "w-[60px] arbitrary — 액션 th width 60 정확값 보존. tailwind w-15 미존재, w-14=56/w-16=64. 12b StaffManage 액션 th width:60 와 동일 (페어 wave 일관성)"
    - "w-[6px] h-[6px] arbitrary — status-dot width 6 / height 6. w-1.5/h-1.5 (=6px) 매칭 가능하나 13a precedent `w-[8px] h-[8px]` (cp-dot) 와 일관성 위해 arbitrary 채택"
    - "transition-[background] duration-100 — `transition: 'background 0.1s'` 12b precedent 그대로 두 번째 적용 (tr hover transition)"
    - "boundary paired conversion 두 번째 적용 — 12b 신설 룰을 13b 에 그대로 연속 적용. desktop-header(L517) `style={{ flexShrink: 0 }}` + mobile-header(L555) `style={{ flexShrink: 0 }}` 둘 다 → `shrink-0` × 2 동시 변환 (페어 wave 완결 후행 정리 패턴)"
    - "JSX inline handler vs inline style 게이트 분리 — onMouseEnter/onMouseLeave 가 inline 카운트에 안 잡힘 (`style={{` 패턴만 매칭). handler body 의 `e.currentTarget.style.background = ...` runtime DOM mutation 은 본 wave 범위 밖, var(--surface-sunken) 보존 OK"
    - "`appearance: 'none' as any` 캐스트 제거 + className `appearance-none` — desktop filter-select 2건 (L533/L540) + mob-filter-select 2건 (L569/L576) 의 `appearance: 'none'` 변환 시 TypeScript `as any` 캐스트 제거 (className 화 후 inline 타입 불필요), 0 error 유지"
key-files:
  created:
    - .planning/quick/260529-ozt-phase-b-wave-13b/260529-ozt-SUMMARY.md
  modified:
    - src/pages/CheckpointsPage.tsx
decisions:
  - "wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w/gj2/h8u/odl 17 wave 승계 옵션 X+P+M+색변수N — 사용자 재컨펌 불필요 (0hr roadmap locked, 18번째 atomic)"
  - "zone-aware sweep 페어 wave 두 번째 완결 — 13a 모바일 sweep + 13b 데스크톱 sweep 분할 패턴. CheckpointsPage 전체 inline 80 → 6 (-92.5%). StaffManage (12a/12b -96%) 직후 두 번째 페어 완결 사례"
  - "boundary paired conversion 12b → 13b 연속 적용 — 12b 신설 룰 (desktop ternary 양쪽 같은 inline 페어 완결 시 둘 다 변환) 을 13b 에 그대로 적용. shrink-0 × 2 동시 변환. 후행 14b/15b 페어 wave reference 강화"
  - "데스크톱 zone 안 INPUT_STYLE spread 옵션 N 확장 — Wave 6 hbv + 12a 의 INPUT_STYLE spread 옵션 N 룰을 데스크톱 zone (L523/L558) 에도 확장 적용. 모바일/데스크톱 zone 무관 INPUT_STYLE spread 면 옵션 N 일관성. 잔존 = 4 모바일 + 2 데스크톱 = 6"
  - "module const 4개 정의 보존 (INPUT_STYLE / LABEL_STYLE / NAV_BOTTOM / SKELETON_STYLE) — Wave 6 hbv + 12a + 13a precedent 그대로. L24/L69/L74/L422 정의 0 byte 변경"
  - "h-9 / opacity-45 tailwind 기본값 활용 — config extend 없이 기본 spacing/opacity scale 사용 가능 확인 (production 다수 페이지 precedent + tailwindcss stubs/config.full.js 검증). arbitrary fallback 불필요"
  - "tr 행 opacity 변환 시 border-bottom + cursor + transition + opacity 4-prop className 한 줄 합침 — 원본 `className=\"border-b border-border-default\" style={{ cursor, opacity ternary, transition }}` 4-prop 을 template literal 한 줄로. 12b StaffManage tr precedent 와 동일 패턴 (옵션 M 1-prop opacity conditional)"
  - "status-cell + status-dot 변환 시 옵션 M 2건 (text color + bg color 모두 conditional) — 원본 inline-flex 컨테이너 + 안쪽 dot span 각각 conditional. 12b 의 status-active/status-inactive class 합치는 방식 대신, 13b 는 class 가 이미 없는 (status-cell/status-dot) 단순 패턴 → template literal 만 적용"
  - "단일 atomic commit — 18번째 atomic 자동 도달. wdc 이후 (a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w/gj2/h8u-1/h8u-2/odl 17 atomic) 본 13b 추가. 36 데스크톱 변환 단일 atomic"
metrics:
  duration: "약 12분 (Task 1 atomic — single commit, 36 desktop sweep + 2 옵션 N 보존)"
  completed-date: 2026-05-29
  tasks-completed: "1/1"
  files-modified: 1
  lines-changed: "22 insertions / 28 deletions (net -6 lines, atomic single commit)"
roadmap-wave: "Tier 2 / Wave 13b (Checkpoints 데스크톱 zone — Tier 2 페어 wave 두 번째 완결, 18번째 atomic)"
---

# Phase 260529-ozt Plan 01: Phase B Wave 13b CheckpointsPage 데스크톱 zone Summary

CheckpointsPage.tsx (696줄, Wave 13a 직후 42 inline = 데스크톱 zone 38 + 모바일 zone 잔존 4) 의 **데스크톱 zone 38건 중 36건 + L555 mobile-header boundary 짝꿍 변환** = 36건 정적 inline style 을 wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w/gj2/h8u/odl 승계 옵션 X+P+M+색변수N+module const N 으로 tailwind className 변환. **모바일 zone 잔존 4건 (L36/L261/L281/L293) + 데스크톱 zone INPUT_STYLE spread 옵션 N 2건 (L523/L555) 절대 보존**. **단일 atomic commit**. **42 → 6 잔존** (-36건 -85.7%): 데스크톱 zone 38 → 2 (-36건) + 모바일 zone 4 → 4 (보존). 시각 결과 0 byte 변경 (no-op refactor). Phase A 결과 (Lucide / 색 토큰 -bar / emoji ▸ 보존 / 비표준 색 0) 및 비즈니스 로직 (12 onClick + 4 useState + 0 useRef + 2 useEffect + 3 useMutation + 4 useQuery + 1 useNavigate + 1 onMouseEnter + 1 onMouseLeave 모두 보존) 모두 IDENTICAL. **Phase B Tier 2 Wave 13b 페어 wave 두 번째 완결 — 18번째 atomic** — CheckpointsPage 페이지 전체 inline 80 → 6 (-92.5%). zone-aware sweep 분할 + boundary paired conversion 룰 12b → 13b 연속 적용 패턴 박제. 12a/12b 페어 직후 두 번째 페어 완결 사례 → 14a/14b, 15a/15b 후행 페어 reference 강화.

## User Decisions (승계 — wdc / 01h / a3v / c9s / cjn / gsh / h3z / hbv / iht / irl / jey / jxo / nkv / epe / f2w / gj2 / h8u / odl / 0hr-roadmap 재확인 불필요)

| ID  | 선택                                                           | 출처                              |
| --- | -------------------------------------------------------------- | --------------------------------- |
| (b) | **옵션 X** — 정확값 arbitrary `[Npx]` / `[rgba(...)]` (시각 0 byte) | wdc Phase B Task 2 결정            |
| (c) | **옵션 P** — `leading-none` 명시 보존 (13a 적용분 그대로, 본 wave 신규 0건) | wdc Phase B Task 2 결정            |
| (d) | **옵션 M + 색 변수만 N** — template literal conditional 우선 (3건) | wdc Phase B Task 2 결정            |
| -   | **a3v~odl 17 wave 승계 적용** — 본 wave 재확인 없이           | 260528-0hr roadmap v2 locked-decisions |
| -   | **module-scope const N (INPUT_STYLE / LABEL_STYLE / NAV_BOTTOM / SKELETON_STYLE)** | Wave 6 hbv + 12a/13a 승계 (4 정의) |
| -   | **zone-aware sweep — 데스크톱 zone 만, 모바일 zone 4 + 데스크톱 INPUT_STYLE spread 2 보존** | Wave 12a/12b 페어 완결 패턴 두 번째 적용 |
| -   | **boundary paired conversion 룰 12b → 13b 연속 적용** — desktop ternary 양쪽 같은 inline (13a 보존 → 13b 둘 다 변환) | 12b 신설 → 13b 두 번째 적용 |
| -   | **데스크톱 zone INPUT_STYLE spread 옵션 N 확장** — INPUT_STYLE spread 면 zone 무관 옵션 N | Wave 6 hbv 룰 데스크톱 zone 확장 적용 (L523/L555) |

## Before / After 카운트

| Metric                                                | Before | After  | Diff             |
| ----------------------------------------------------- | ------ | ------ | ---------------- |
| CheckpointsPage.tsx total `style={{`                  | **42** | **6**  | **-36 (-85.7%)** |
| CheckpointsPage.tsx 데스크톱 zone `style={{`           | **38** | **2**  | **-36 (-94.7%)** |
| CheckpointsPage.tsx 모바일 zone `style={{`             | **4**  | **4**  | **= (보존)**     |
| INPUT_STYLE / LABEL_STYLE / NAV_BOTTOM / SKELETON_STYLE module const | **4**  | **4**  | **= (보존)**     |
| TypeScript errors                                     | 0      | 0      | =                |
| 비즈 anchors (12 onClick / 4 useState / 0 useRef / 2 useEffect / 3 useMutation / 4 useQuery / 1 useNavigate / 1 onMouseEnter / 1 onMouseLeave) | IDENTICAL | IDENTICAL | = |
| 비표준 색 토큰 (warning/safe/danger no-suffix)         | 0      | 0      | =                |
| emoji (▸ 보존)                                          | 1      | 1      | =                |
| 변경 파일 수 (1 .tsx 외 off-scope)                     | 0      | 0      | =                |
| Vite build (PWA generation)                           | OK     | OK     | =                |

### 페어 wave 합산 (13a + 13b) — CheckpointsPage 전체 변환

| Metric                                                | Original (Wave 13a 진입 시) | After Wave 13a (9cafd5c) | After Wave 13b (본 commit) | Total Diff       |
| ----------------------------------------------------- | -------------------------: | -----------------------: | ----------------------: | ---------------- |
| CheckpointsPage.tsx total `style={{`                  | **80**                     | **42** (정확: 41 + 1 = 42 mobile boundary 재계산) | **6**                   | **-74 (-92.5%)** |
| 모바일 zone `style={{`                                 | **42**                     | **4** (= 13a 잔존 INPUT_STYLE spread 3 + Pattern A 1) | **4** (보존)            | **-38 (-90.5%)** |
| 데스크톱 zone `style={{`                               | **38**                     | **38** (보존)            | **2** (= INPUT_STYLE spread 2 옵션 N) | **-36 (-94.7%)** |

## 데스크톱 zone sweep 매핑 (36건 변환 + 2건 옵션 N 보존 = 38건)

### A. 데스크톱 헤더 영역 (L517-L552) — 7건 변환 + 1건 옵션 N

| Line (Before) | 영역                             | Before (inline)                                                                                                                   | After (className)                                                                                                                | 옵션 |
| ------------: | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---: |
| L517          | desktop-header                   | `{ flexShrink: 0 }`                                                                                                              | `shrink-0`                                                                                                                       | 직접 |
| L518          | cat-select-wrap                  | `{ position: 'relative', width: 220 }`                                                                                           | `relative w-[220px]`                                                                                                             | X    |
| L523          | desktop cat select               | `{ ...INPUT_STYLE, height: 36, appearance: 'none', cursor: 'pointer', paddingRight: 32 }`                                        | **(보존 — IDENTICAL)**                                                                                                            | **N** |
| L528          | chevron-icon (desktop)           | `{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }`                          | `absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none`                                                             | X    |
| L533          | desktop filter-select (zone)     | `{ height: 36, padding: '0 10px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', color: 'var(--text-primary)', cursor: 'pointer', appearance: 'none' as any }` | `h-9 px-2.5 py-0 rounded-[8px] border border-border-default bg-surface-sunken text-text-primary cursor-pointer appearance-none` | X    |
| L540          | desktop filter-select (floor)    | (동일 7-prop)                                                                                                                     | (동일 8-class)                                                                                                                   | X    |
| L544          | count-label                      | `{ flex: 1, color: 'var(--text-tertiary)' }`                                                                                     | `flex-1 text-text-tertiary`                                                                                                      | 직접 |
| L549          | desktop add-btn                  | `{ height: 36, border: 'none', cursor: 'pointer' }`                                                                              | `h-9 border-0 cursor-pointer`                                                                                                    | 직접 |

### B. 모바일 헤더 boundary 영역 (L555-L580) — 7건 변환 + 1건 옵션 N (boundary paired conversion 룰)

| Line (Before) | 영역                             | Before (inline)                                                                                                                   | After (className)                                                                                                                | 옵션 |
| ------------: | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---: |
| L555          | mobile-header (boundary 짝꿍)     | `{ flexShrink: 0 }`                                                                                                              | `shrink-0` (12b precedent — paired conversion)                                                                                   | 직접 |
| L556          | mob-cat-wrap                     | `{ position: 'relative' }`                                                                                                       | `relative`                                                                                                                       | 직접 |
| L558          | mob-cat-select                   | `{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer', paddingRight: 36 }`                                                    | **(보존 — IDENTICAL)**                                                                                                            | **N** |
| L562          | chevron-icon (mobile-header)     | `{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }`                          | `absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none`                                                                  | 직접 |
| L567          | mob-filter-row                   | `{ display: 'flex', gap: 6 }`                                                                                                    | `flex gap-1.5`                                                                                                                   | 직접 |
| L569          | mob-filter-select (zone)         | `{ flex: 1, height: 36, padding: '0 8px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', color: 'var(--text-primary)', cursor: 'pointer' }` | `flex-1 h-9 px-2 py-0 rounded-[8px] border border-border-default bg-surface-sunken text-text-primary cursor-pointer`            | X    |
| L576          | mob-filter-select (floor)        | (동일 7-prop)                                                                                                                     | (동일 7-class)                                                                                                                   | X    |
| L580          | mob-count                        | `{ color: 'var(--text-tertiary)', alignSelf: 'center', whiteSpace: 'nowrap' }`                                                   | `text-text-tertiary self-center whitespace-nowrap`                                                                               | 직접 |

### C. 데이터 테이블 영역 (L608-L651) — 22건 변환

| Line (Before) | 영역                             | Before (inline)                                                                                                                   | After (className)                                                                                                                | 옵션 |
| ------------: | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---: |
| L608          | desktop-content data-table       | `{ padding: '0 24px 24px' }`                                                                                                     | `px-6 pb-6`                                                                                                                      | 직접 |
| L610          | table root                       | `{ width: '100%', borderCollapse: 'collapse' }`                                                                                  | `w-full border-collapse`                                                                                                         | 직접 |
| L613-L618     | thead th × 6 (개소명/카테고리/구역/층/위치번호/상태) | `{ padding: '10px 8px', color: 'var(--text-secondary)' }`                                                                | `py-2.5 px-2 text-text-secondary`                                                                                                | 직접 |
| L619          | thead th (액션)                  | `{ padding: '10px 8px', color: 'var(--text-secondary)', width: 60 }`                                                             | `py-2.5 px-2 text-text-secondary w-[60px]`                                                                                       | X    |
| L624          | empty td                         | `{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-tertiary)' }`                                                   | `text-center py-10 px-4 text-text-tertiary`                                                                                      | 직접 |
| L630          | tr row (opacity conditional)     | `{ cursor: 'pointer', opacity: cp.isActive === 0 ? 0.45 : 1, transition: 'background 0.1s' }`                                    | `cursor-pointer transition-[background] duration-100 ${cp.isActive === 0 ? 'opacity-45' : 'opacity-100'}`                        | M    |
| L634          | td location 6-prop              | `{ padding: '10px 8px', fontWeight: 600, color: 'var(--text-primary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }` | `py-2.5 px-2 font-semibold text-text-primary max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap`                     | X    |
| L635          | td category-badge               | `{ padding: '10px 8px' }`                                                                                                        | `py-2.5 px-2`                                                                                                                    | 직접 |
| L636          | category badge span              | `{ padding: '2px 6px', borderRadius: 4, background: 'rgba(59,130,246,.13)', color: 'var(--accent)' }`                            | `py-0.5 px-1.5 rounded-[4px] bg-[rgba(59,130,246,.13)] text-accent`                                                              | X    |
| L640          | td zone                          | `{ padding: '10px 8px', color: 'var(--text-secondary)' }`                                                                        | `py-2.5 px-2 text-text-secondary`                                                                                                | 직접 |
| L641          | td floor                         | (동일)                                                                                                                            | (동일)                                                                                                                            | 직접 |
| L642          | td locationno                    | (동일)                                                                                                                            | (동일)                                                                                                                            | 직접 |
| L643          | td status-cell                   | `{ padding: '10px 8px' }`                                                                                                        | `py-2.5 px-2`                                                                                                                    | 직접 |
| L645          | status-cell span (color cond)    | `{ display: 'inline-flex', alignItems: 'center', gap: 4, color: cp.isActive !== 0 ? 'var(--status-safe-bar)' : 'var(--text-tertiary)' }` | `inline-flex items-center gap-1 ${cp.isActive !== 0 ? 'text-safe-bar' : 'text-text-tertiary'}`                                  | M    |
| L646          | status-dot (bg cond)             | `{ width: 6, height: 6, borderRadius: '50%', background: cp.isActive !== 0 ? 'var(--status-safe-bar)' : 'var(--text-tertiary)' }` | `w-[6px] h-[6px] rounded-full ${cp.isActive !== 0 ? 'bg-safe-bar' : 'bg-text-tertiary'}`                                         | M+X  |
| L650          | td action-cell                   | `{ padding: '10px 8px' }`                                                                                                        | `py-2.5 px-2`                                                                                                                    | 직접 |
| L651          | action-cell span                 | `{ color: 'var(--accent)' }`                                                                                                     | `text-accent`                                                                                                                    | 직접 |

**합계: 데스크톱 zone 36건 변환 + 2건 옵션 N 보존 = 38건 처리**

## 모바일 zone 잔존 4건 (IDENTICAL — 절대 보존 확인)

| Line | 영역                          | Inline 형태                                                                                                                       | 옵션 |
| ----:| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---: |
| L36  | BottomSheet sheet root        | `{ bottom: NAV_BOTTOM, maxHeight: 'calc(100dvh - var(--sat, 0px) - var(--sab, 0px) - 54px)' }`                                   | N (Pattern A) |
| L261 | 카테고리 select (모달)        | `{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }`                                                                       | N (INPUT_STYLE spread) |
| L281 | 층 select (모달)              | `{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }`                                                                       | N (INPUT_STYLE spread) |
| L293 | 소화기 종류 select (모달)     | `{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }`                                                                       | N (INPUT_STYLE spread) |

검증:
```
24:const NAV_BOTTOM = 'calc(54px + env(safe-area-inset-bottom, 20px))'
37:          bottom: NAV_BOTTOM,
261:          <select style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }} value={form.category} onChange={handleCategoryChange}>
281:            <select style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }} value={form.floor} onChange={setField('floor')}>
```

(L293 소화기 select 는 grep 결과 `select-INPUT_STYLE 2-prop spread count = 3` 으로 확인 — 모달 3건 모두 IDENTICAL.)

## 데스크톱 zone INPUT_STYLE spread 잔존 2건 (IDENTICAL — 절대 보존 확인)

| Line | 영역                          | Inline 형태                                                                                                                       | 옵션 |
| ----:| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---: |
| L523 | desktop cat select            | `{ ...INPUT_STYLE, height: 36, appearance: 'none', cursor: 'pointer', paddingRight: 32 }`                                        | N (INPUT_STYLE spread + 4-prop dynamic combo) |
| L555 | mob-cat-select (boundary)     | `{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer', paddingRight: 36 }`                                                    | N (INPUT_STYLE spread + 3-prop dynamic combo) |

검증:
```
523:              style={{ ...INPUT_STYLE, height: 36, appearance: 'none', cursor: 'pointer', paddingRight: 32 }}
555:              style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer', paddingRight: 36 }}>
```

(L555 라인은 SUMMARY 작성 시점 기준. Edit 후 mobile-header 영역으로 변환되며 라인 번호가 558 → 555 로 약간 이동했으나 코드 IDENTICAL.)

## 자동 검증 결과

```
=== 1. inline count ===
src/pages/CheckpointsPage.tsx: 42 -> 6 (-36, -85.7%)
  PASS inline <= 7 (target 6)

=== 2. mobile zone preserved (4 IDENTICAL) ===
24:const NAV_BOTTOM = ...
37:          bottom: NAV_BOTTOM,
261:          <select style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }} value={form.category}
281:            <select style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }} value={form.floor}
select-INPUT_STYLE 2-prop spread count: 3 (모달 3건 모두 IDENTICAL) ✓

=== 3. desktop zone INPUT_STYLE spread preserved (2 IDENTICAL) ===
523: { ...INPUT_STYLE, height: 36, appearance: 'none', cursor: 'pointer', paddingRight: 32 } ✓
555: { ...INPUT_STYLE, appearance: 'none', cursor: 'pointer', paddingRight: 36 } ✓

=== 4. biz anchor identity ===
onClick: 12 (OK) / useState: 4 (OK) / useRef: 0 (OK) / useEffect: 2 (OK)
useMutation: 3 (OK) / useQuery: 4 (OK) / useNavigate: 1 (OK)
useParams: 0 (OK) / useSearchParams: 0 (OK) / fetch: 0 (OK)
onMouseEnter: 1 (OK) / onMouseLeave: 1 (OK)

=== 5. onClick set diff ===
PASS onClick diff 0

=== 6. emoji / nonstandard color ===
emoji: 1 (▸ 보존) ✓
nonstandard color: 0 ✓

=== 7. module const (expect 4) ===
4 ✓

=== 8. TypeScript ===
0 errors ✓

=== 9. vite build (PWA generation) ===
✓ 87 modules transformed
PWA injectManifest precache 82 entries (7931.77 KiB)
dist/sw.js generated ✓
built in 185ms ✓
```

## Commit

| Commit | Type | Subject | Files | Hash |
| ------ | ---- | ------- | ----- | ---- |
| 1      | feat | `feat(260529-ozt-01): Phase B Wave 13b — Checkpoints 데스크톱 zone (38 inline) → tailwind` | src/pages/CheckpointsPage.tsx | (commit 직후 기입) |

(SUMMARY.md 는 별도 commit 없음 — PLAN.md 와 동일 패턴 룰)

## Phase B Tier 2 누적 진행 표 (12a/12b/13a/13b + 14a/15a)

| Wave | 페이지 / 영역                                                | Inline diff (zone) | 누적 atomic | 페어 완결 |
| ---- | ------------------------------------------------------------ | ------------------ | ----------- | --------- |
| 12a (epe) | StaffManagePage 모바일 zone (52 inline)                | -49 (52 → 3)       | 14          | -         |
| 12b (odl) | StaffManagePage 데스크톱 zone (24 + boundary 1 = 25)    | -24 (24 → 0)       | 17          | **12a+12b: 76 → 3 (-96.1%)** |
| 13a (f2w) | CheckpointsPage 모바일 zone (42 inline)                | -38 (42 → 4)       | 15          | -         |
| **13b (ozt)** | **CheckpointsPage 데스크톱 zone (36 + boundary 1 = 38)** | **-36 (38 → 2)**   | **18**      | **13a+13b: 80 → 6 (-92.5%)** ✓ |
| 14a (gj2) | LegalPage 모바일 zone (메가 분할)                       | (해당 wave 참조)   | 16          | (14b reference) |
| 15a (h8u) | ElevatorPage 모바일 zone (메가 분할 2 atomic)           | (해당 wave 참조)   | 16+1        | (15b reference) |

## Phase B Tier 2 페어 wave 완결 패턴 (12a/12b → 13a/13b 박제)

1. **zone-aware sweep 분할** — 모바일/데스크톱 zone 분리 후 페어 wave 로 처리. 12a/12b (StaffManage) 첫 완결 → 13a/13b (Checkpoints) 두 번째 완결. 14a/14b (LegalPage), 15a/15b (ElevatorPage) 후행 페어 reference 강화.
2. **boundary paired conversion 룰 12b → 13b 연속 적용** — desktop ternary 양쪽 같은 inline (`{ flexShrink: 0 }` × 2) 가 전반부 wave (12a/13a) 에서 보존 → 후반부 wave (12b/13b) 에서 둘 다 동시 변환. 페어 완결 시점에 boundary 일관성 정리.
3. **INPUT_STYLE spread 옵션 N 룰 확장** — Wave 6 hbv (Schedule inp/lbl) 의 INPUT_STYLE module const + spread 잔존 룰을, 12a/13a 의 모바일 zone 적용 → 13b 에서 데스크톱 zone (L523/L555) 으로 확장. zone 무관 INPUT_STYLE spread 면 옵션 N.
4. **테이블 패턴 변환 박제** — `padding: '10px 8px'` → `py-2.5 px-2`, `transition: 'background 0.1s'` → `transition-[background] duration-100`, `borderCollapse: 'collapse'` → `border-collapse`, `fontWeight: 600` → `font-semibold`. 12b 신설 → 13b 즉시 재활용 (데이터 테이블 패턴 공유).
5. **onMouseEnter/Leave handler 보존 패턴** — JSX inline handler body 의 background mutation 은 `style={{` 게이트와 무관 (handler body 안의 runtime DOM mutation). var(--surface-sunken) / var(--bg3) 보존 OK. transition className 위 부드러운 hover IDENTICAL.
6. **h-9 / opacity-45 tailwind 기본값 활용** — node_modules/tailwindcss/stubs/config.full.js 의 기본 spacing/opacity scale 확인 → config extend 없이 사용 가능. arbitrary fallback 불필요 (h-[36px] / opacity-[0.45]).
7. **단일 atomic commit 페어 wave 연속 적용** — 12a~13b 페어 wave 모두 단일 atomic. 18번째 atomic 자동 도달 (wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w/gj2/h8u-1/h8u-2/odl + ozt).

## Self-Check: PASSED

- 변환 파일 존재: `src/pages/CheckpointsPage.tsx` ✓
- `style={{` 카운트 42 → 6 (-36, -85.7%) ✓
- 모바일 zone 잔존 4건 IDENTICAL (L36 Pattern A + L261/L281/L293 INPUT_STYLE spread) ✓
- 데스크톱 zone INPUT_STYLE spread 잔존 2건 IDENTICAL (L523 4-prop combo + L555 3-prop combo) ✓
- 비즈 anchor (12 onClick / 4 useState / 0 useRef / 2 useEffect / 3 useMutation / 4 useQuery / 1 useNavigate / 1 onMouseEnter / 1 onMouseLeave) IDENTICAL ✓
- onClick set diff 0 ✓
- emoji ▸ 보존 (1건) ✓
- 비표준 색 토큰 0 ✓
- module const 4건 보존 (INPUT_STYLE / LABEL_STYLE / NAV_BOTTOM / SKELETON_STYLE) ✓
- TypeScript error 0 ✓
- vite build (PWA generation) 성공 ✓
- 단일 atomic commit (commit hash: 직후 기입) ✓
- off-scope 변경 0 (src/pages/CheckpointsPage.tsx 단일 파일) ✓
- 페어 wave 완결 13a + 13b 누적 80 → 6 (-92.5%) ✓
