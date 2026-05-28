---
phase: 260528-iht-phase-b-wave-7-staffservice
plan: 01
subsystem: redesign/phase-b-sweep
status: complete
tags: [staff-service, inline-style-to-tailwind, no-op-refactor, phase-b-tier-1-wave-7, isfullleave-option-m, calendar-cellbg-dynamic-option-n, vendor-prefix-as-any-option-n, webkit-overflow-scrolling-arbitrary, coordinate-position-spread-option-n, atomic-single-commit]
requires:
  - 260528-hbv-phase-b-wave-6 완료 (일정/교육 atomic)
  - 260528-h3z-phase-b-wave-5 완료 (db728c0)
  - 260528-gsh-phase-b-wave-4 완료 (05fddf1)
  - 260528-cjn-phase-b-wave-3 완료 (a78963f + 4e99270)
  - 260528-c9s-phase-b-wave-2 완료 (d36a20f)
  - 260528-a3v-phase-b-wave-1 완료 (18fd138)
  - 260527-wdc-legalpage-phase-b 옵션 X+P+M+색변수N 확정 (184e548)
  - 260528-0hr-phase-b-master-roadmap v2 (ROADMAP only)
provides:
  - StaffServicePage.tsx Phase B 완료 (34 → 10 잔존 = 캘린더 cell multiline + dateColor 동적 + l.bg loop 동적 + barColor template + SHIFT_COLOR 동적 2건 + 좌표 spread 2건 + vendor prefix as any 2건)
  - Phase B Tier 1 Wave 7 (직원 서비스 — redesign/12 완결) 완료
  - 식대 캘린더 동적 색/좌표/vendor 잔존 패턴 박제 (예상 13-16 → 실제 10 달성, 예상 초과 -3건)
affects:
  - src/pages/StaffServicePage.tsx
tech-stack:
  added: []
  patterns:
    - "옵션 X (정확값 arbitrary) — `bg-[rgba(0,0,0,0.25)]`/`bg-[rgba(0,0,0,0.45)]`/`shadow-[0_1px_3px_rgba(0,0,0,0.35)]`/`shadow-[0_2px_8px_rgba(0,0,0,0.1)]`/`shadow-[0_-4px_24px_rgba(0,0,0,0.2)]`/`tracking-[-0.01em]`/`tracking-[-0.02em]`/`text-[#fca5a5]`/`text-[#fbbf24]`/`text-[#06b6d4]`/`text-[#d7428c]`/`text-[#d78042]`/`text-[#facc15]`/`text-[#8f42d7]`/`text-[rgba(255,255,255,0.85)]` 정확값 보존"
    - "옵션 P — 기존 `leading-none`/`leading-tight`/`leading-relaxed` 명시 보존 (Phase A 결과 보존, 본 wave 신규 추가 없음)"
    - "옵션 M (className conditional) — L779 isFullLeave 1건: `${isFullLeave ? 'text-[rgba(255,255,255,0.9)]' : 'text-[rgba(255,255,255,0.75)]'}` 캘린더 셀 라벨 색"
    - "옵션 N — 10건 잔존: L754 multiline (cellBg 동적 + isSel/isToday border 분기 + boxShadow conditional + WebkitTapHighlightColor) + L779(post-edit reuse line) dateColor 동적 + L832 l.bg loop variable + L862 boxShadow template literal `inset 3px 0 0 ${c.barColor}` + L990/L1237 SHIFT_COLOR[selCell.rawShift] 동적 (desktop badge + mobile sheet badge) + L1161/L1183 ovAt/checkbox 좌표 spread (`${p.x}%`/`${cp.x}%` template + extra spread + fontFamily Noto Sans) + L1285/L1296 input date `WebkitAppearance/MozAppearance as any` vendor prefix"
    - "L853 `WebkitOverflowScrolling: 'touch'` → `[-webkit-overflow-scrolling:touch]` arbitrary 변환 — tailwind JIT 지원. h3z/gsh precedent 무. 본 wave 첫 사례."
    - "L721 spinner `borderTopColor: var(--accent)` + `animation: 'spin .7s linear infinite'` → `border-t-accent [animation:spin_.7s_linear_infinite]` className 합병. `[animation:...]` underscore = 공백 함정 회피"
    - "L845 legend 반차 `linear-gradient(135deg, #42d778 50%, var(--duty-day) 50%)` → `bg-[linear-gradient(135deg,#42d778_50%,var(--duty-day)_50%)]` underscore 공백 변환"
    - "L1228 backdrop / L1236 bottom sheet `animation: 'fadeIn .2s ease'` / `animation: 'slideUp .25s ease'` → `[animation:fadeIn_.2s_ease]` / `[animation:slideUp_.25s_ease]` arbitrary 변환. keyframes `@keyframes` 정의는 inline `<style>` 태그에 그대로 존속"
    - "L1290 `gridTemplateColumns: '1fr auto 1fr auto'` → `[grid-template-columns:1fr_auto_1fr_auto]` underscore 공백 변환 (날짜 grid)"
    - "식대 카드 정적 RGBA 4건 (L906/L916/L929/L1479) — `background`/`borderColor` 각각 `bg-[rgba(R,G,B,0.08)]` + `border-[rgba(R,G,B,0.2)]` arbitrary 변환 (className 통합)"
    - "L767 today badge multiline 3 prop (`background: 'var(--accent)'` + `letterSpacing: '-.02em'` + `boxShadow`) → className 통합 `bg-accent tracking-[-0.02em] shadow-[0_1px_3px_rgba(0,0,0,0.35)]`. isDesktop conditional 기존 보존"
key-files:
  created:
    - .planning/quick/260528-iht-phase-b-wave-7/260528-iht-SUMMARY.md
  modified:
    - src/pages/StaffServicePage.tsx
decisions:
  - "wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv 승계 옵션 X+P+M+색변수N — 사용자 재컨펌 불필요 (0hr roadmap locked)"
  - "L754 캘린더 cell multiline 잔존 (옵션 N) — cellBg 동적 색변수 (linear-gradient template 포함) + border isSel/isToday 3분기 + boxShadow conditional + WebkitTapHighlightColor vendor → tailwind 표현 불가, 변수 자체 보존"
  - "L779 dateColor 동적 잔존 (옵션 N) — dow === 0/isHoliday/dow === 6 3분기 hex 변수 (#7f1d1d/#1e3a5f/var --text-primary). 인라인 변환 시 동적 hex 인 `text-[${dateColor}]` 패턴 안티 (런타임 className 생성 안 됨). 변수 자체 보존."
  - "L832 l.bg loop 변수 잔존 (옵션 N) — 6 종 휴가 legend `{ label, bg }` 객체 배열 map → 동적 background 변수. 인라인 변환 시 동적 hex `bg-[${l.bg}]` 안티. 변수 자체 보존."
  - "L862 summary card `boxShadow: \`inset 3px 0 0 ${c.barColor}\`` template literal 잔존 (옵션 N) — barColor 동적 색변수 (4 카드 각각 다름 + threshold 분기). 인라인 변환 시 shadow-[inset_3px_0_0_${c.barColor}] 안티. 변수 자체 보존."
  - "L990/L1237 SHIFT_COLOR[selCell.rawShift] 동적 잔존 (옵션 N) — SHIFT_COLOR 객체 lookup. 인라인 변환 시 `bg-[${SHIFT_COLOR[..]}]` 안티. 변수 자체 보존. 2건 desktop badge + mobile sheet badge"
  - "L1161 ovAt 좌표 spread 잔존 (옵션 N) — `${p.x}%`/`${p.y}%` 동적 좌표 + position/transform/fontSize/fontWeight/color/whiteSpace/fontFamily 모두 + ...extra spread. spread 자체가 tailwind 변환 불가. 변수 자체 보존."
  - "L1183 cp checkbox 좌표 spread 잔존 (옵션 N) — `${cp.x}%`/`${cp.y}%` 동적 좌표 + position/transform/width/height/background. 동적 좌표 인라인 변환 안티. 변수 자체 보존."
  - "L1285/L1296 input date `WebkitAppearance/MozAppearance as any` 잔존 (옵션 N) — vendor prefix as any 캐스팅. tailwind 변환 시 `[-webkit-appearance:none] [-moz-appearance:none]` arbitrary 가능하나 c9s precedent (Phase B Wave 2) Schedule 의 `[-webkit-appearance:none]` 변환은 inp/lbl 단일 인라인 정의에만 적용 — 동적 props 와 결합된 경우 변수 자체 보존 룰 정합성 위해 잔존. 본 wave 보수적 처리."
  - "L853 `WebkitOverflowScrolling: 'touch'` 단일 prop → `[-webkit-overflow-scrolling:touch]` arbitrary 변환 — 본 wave 첫 사례. 다른 vendor (L1285/L1296 as any) 와 구분: 단일 prop + 동적 변수 무 → 변환. 다중 prop + as any 캐스팅 + 인라인 정의 → 잔존."
  - "단일 atomic commit 패턴 — 28-splash/27-login/23-education/c9s/cjn/gsh/h3z/hbv 정밀도 패턴 자동 도달 (5번째 자동 도달)"
metrics:
  duration: "약 15분 (Task 1 atomic — single commit, 34 inline)"
  completed-date: 2026-05-28
  tasks-completed: "1/1"
  files-modified: 1
  lines-changed: "24 ins / 38 del (net -14 lines, atomic single commit)"
roadmap-wave: "Tier 1 / Wave 7 (직원 서비스 — redesign/12 완결)"
---

# Phase 260528-iht Plan 01: Phase B Wave 7 StaffServicePage Summary

StaffServicePage.tsx (1499줄, 34 inline)의 inline style 을 wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv 승계 옵션 X+P+M+색변수N 으로 tailwind className 으로 일괄 변환. **redesign/12 완결 페이지** — 위험 anchor (좌표 캘리브) 무. **식대 캘린더 동적 색변수 6 종류 동시 보존** — L754 cellBg multiline (cellBg + isSel/isToday border + boxShadow conditional + WebkitTapHighlightColor) + L779 dateColor (dow 분기 hex) + L832 l.bg (legend loop) + L862 barColor (summary card threshold) + L990/L1237 SHIFT_COLOR (당/비/주/휴 lookup) + L1161/L1183 좌표 spread (`${p.x}%`/`${cp.x}%` template) + L1285/L1296 vendor prefix as any 모두 옵션 N 잔존. **L853 `WebkitOverflowScrolling: 'touch'` → `[-webkit-overflow-scrolling:touch]` arbitrary 변환** — 본 wave 첫 사례 (단일 prop + 동적 변수 무 → 변환). **L779 isFullLeave conditional 옵션 M** (캘린더 셀 라벨 색 2분기). **L767 today badge multiline 3 prop → className 통합** (bg-accent + tracking + shadow). **식대 카드 정적 RGBA 4건 (중식 A/B + 석식 + 주말식대) → arbitrary** (background + borderColor + color 통합). **L1228 backdrop + L1236 bottom sheet animation arbitrary** ([animation:fadeIn] / [animation:slideUp]). **L1290 grid-template-columns arbitrary** (`[grid-template-columns:1fr_auto_1fr_auto]`). 시각 결과 0 byte 변경 (no-op refactor). Phase A 결과 (Lucide / 색 토큰 -bar / emoji 0 / 비표준 색 0) 및 비즈니스 로직 (leaveApi/mealsApi/menuApi/scheduleApi/holidaysApi + SHIFT_COLOR/SHIFT_BG/SHIFT_LABEL/LEAVE_BG/LEAVE_LABEL/DOC_LEAVE_GRID/DOC_TO_API_TYPE/ANNUAL_TYPES + calcWeekendAllowance/getCellInfo/handleDayClick/handleMealCycle/handleMenuUpload + ovAt 좌표 시스템) 모두 보존. **Phase B Tier 1 Wave 7 성공** — 예상 (34→13-16) 초과 달성 (10 잔존, -3건).

## User Decisions (승계 — wdc / 01h / a3v / c9s / cjn / gsh / h3z / hbv / 0hr-roadmap 재확인 불필요)

| ID  | 선택                                                          | 출처                              |
| --- | ------------------------------------------------------------- | --------------------------------- |
| (b) | **옵션 X** — 정확값 arbitrary `[Npx]` (시각 0 byte)            | wdc Phase B Task 2 결정            |
| (c) | **옵션 P** — `leading-none/leading-relaxed` 명시 보존          | wdc Phase B Task 2 결정            |
| (d) | **옵션 M + 색 변수만 N** — template literal conditional 우선   | wdc Phase B Task 2 결정            |
| -   | **a3v/c9s/cjn/gsh/h3z/hbv 승계 적용** — 본 wave 사용자 재확인 없이 진행 | 260528-0hr roadmap v2 locked-decisions |

## Before / After 카운트

| Metric (`style={{` count)        | Before | After   | Diff             |
| -------------------------------- | ------ | ------- | ---------------- |
| StaffServicePage.tsx             | **34** | **10**  | **-24 (-71%)**   |

총 변경: 1 file, 24 ins / 38 del, net -14 lines. PLAN 예상 (34→~13-16) 초과 달성 (10 잔존, -3건). `[-webkit-overflow-scrolling:touch]` arbitrary 변환 성공으로 잔존 1건 추가 감소.

## 변환 매핑 (StaffServicePage — 24건 변환, 10건 옵션 N 잔존)

### 정적 단일 prop 색 변환 (옵션 X)

| Line (orig) | Before                                                                                | After                                          | 패턴            |
| ----------- | ------------------------------------------------------------------------------------- | ---------------------------------------------- | --------------- |
| L762        | `background: 'rgba(0,0,0,0.25)'`                                                       | className `bg-[rgba(0,0,0,0.25)]` 통합          | 옵션 X           |
| L792        | `color: 'rgba(255,255,255,0.85)'`                                                      | className `text-[rgba(255,255,255,0.85)]` 통합 | 옵션 X           |
| L793        | `color: '#fca5a5'`                                                                     | className `text-[#fca5a5]` 통합                | 옵션 X           |
| L798        | `color: '#fbbf24'`                                                                     | className `text-[#fbbf24]` 통합                | 옵션 X           |
| L1026       | `color: '#facc15'`                                                                     | className `text-[#facc15]` 통합                | 옵션 X           |
| L1313       | `color: '#facc15'`                                                                     | className `text-[#facc15]` 통합                | 옵션 X           |

### multiline 3+ prop 통합 변환

| Line (orig) | Before (요약)                                                                                            | After                                                                                                           | 패턴            |
| ----------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------- |
| L721 spinner | `borderTopColor: 'var(--accent)', animation: 'spin .7s linear infinite'`                                | className `border-t-accent [animation:spin_.7s_linear_infinite]` 통합 (style 제거)                              | 옵션 X + 합병   |
| L767 today  | `background: 'var(--accent)', letterSpacing: '-.02em', boxShadow: '0 1px 3px rgba(0,0,0,0.35)'`         | className `bg-accent tracking-[-0.02em] shadow-[0_1px_3px_rgba(0,0,0,0.35)]` (isDesktop 분기 기존 보존)         | 옵션 X + 합병   |
| L845 legend | `background: 'linear-gradient(135deg, #42d778 50%, var(--duty-day) 50%)'`                                | className `bg-[linear-gradient(135deg,#42d778_50%,var(--duty-day)_50%)]` underscore 변환                       | 옵션 X           |
| L853        | `WebkitOverflowScrolling: 'touch'`                                                                        | className `[-webkit-overflow-scrolling:touch]` arbitrary (본 wave 첫 사례)                                       | 옵션 X (arbitrary) |
| L872 value  | `letterSpacing: '-0.01em'`                                                                                | className `tracking-[-0.01em]` 통합 (valueClass 분기 기존 보존)                                                  | 옵션 X           |
| L1161 img   | `boxShadow: '0 2px 8px rgba(0,0,0,0.1)'`                                                                  | className `shadow-[0_2px_8px_rgba(0,0,0,0.1)]` 통합                                                              | 옵션 X           |

### 식대 카드 정적 RGBA bg + border (4건)

| Line (orig) | Before                                                                                                       | After                                                                                                | 패턴            |
| ----------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | --------------- |
| L906 + L908 (중식 A) | `bg: rgba(6,182,212,0.08) + border: rgba(6,182,212,0.2)` + `color: #06b6d4`                          | className `bg-[rgba(6,182,212,0.08)] border-[rgba(6,182,212,0.2)]` + `text-[#06b6d4]`                 | 옵션 X           |
| L916 + L918 (중식 B) | `bg: rgba(215,66,140,0.08) + border: rgba(215,66,140,0.2)` + `color: #d7428c`                        | className `bg-[rgba(215,66,140,0.08)] border-[rgba(215,66,140,0.2)]` + `text-[#d7428c]`               | 옵션 X           |
| L929 + L931 (석식)   | `bg: rgba(215,128,66,0.08) + border: rgba(215,128,66,0.2)` + `color: #d78042`                        | className `bg-[rgba(215,128,66,0.08)] border-[rgba(215,128,66,0.2)]` + `text-[#d78042]`               | 옵션 X           |
| L1479 + L1481 (주말식대) | `bg: rgba(143,66,215,0.08) + border: rgba(143,66,215,0.2)` + `color: #8f42d7`                    | className `bg-[rgba(143,66,215,0.08)] border-[rgba(143,66,215,0.2)]` + `text-[#8f42d7]`               | 옵션 X           |

### bottom sheet animation + grid (옵션 X)

| Line (orig) | Before                                                                                                  | After                                                                                                              | 패턴            |
| ----------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------- |
| L1228 backdrop | `background: 'rgba(0,0,0,0.45)', animation: 'fadeIn .2s ease'`                                        | className `bg-[rgba(0,0,0,0.45)] [animation:fadeIn_.2s_ease]` 통합                                                  | 옵션 X           |
| L1236 sheet | `boxShadow: '0 -4px 24px rgba(0,0,0,0.2)', animation: 'slideUp .25s ease'`                              | className `shadow-[0_-4px_24px_rgba(0,0,0,0.2)] [animation:slideUp_.25s_ease]` 통합                                  | 옵션 X           |
| L1290 grid  | `gridTemplateColumns: '1fr auto 1fr auto'`                                                              | className `[grid-template-columns:1fr_auto_1fr_auto]` underscore 변환                                                | 옵션 X           |

### 옵션 M (className conditional) — 1건

| Line (orig) | Before                                                                                                   | After                                                                                                              | 패턴   |
| ----------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------ |
| L779 캘린더 라벨 | `style={{ color: isFullLeave ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.75)' }}`                  | className `text-caption font-extrabold leading-none ${isFullLeave ? 'text-[rgba(255,255,255,0.9)]' : 'text-[rgba(255,255,255,0.75)]'}` | 옵션 M |

## 옵션 N 잔존 매핑 (10건)

### 동적 색변수 (6 종류 = 9건)

| Line (post-edit) | 변수                                                                | 사유                                                                                              | 패턴   |
| ---------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------ |
| L754 cell        | `cellBg` + `isSel/isToday border` + `boxShadow` + `WebkitTapHighlightColor` | multiline 4 prop + linear-gradient template + boolean 분기 + vendor prefix → 변환 불가             | 옵션 N |
| L779 dateColor   | `dateColor` (dow 분기 hex)                                          | 동적 hex 변수 — `text-[${dateColor}]` 안티 (런타임 className 생성 안 됨)                          | 옵션 N |
| L832 l.bg        | `l.bg` (legend loop 6 종)                                           | 동적 hex 변수 — 동일 룰                                                                            | 옵션 N |
| L862 barColor    | `\`inset 3px 0 0 ${c.barColor}\`` template literal                  | template literal — `shadow-[inset_3px_0_0_${c.barColor}]` 안티                                     | 옵션 N |
| L990 SHIFT_COLOR | `SHIFT_COLOR[selCell.rawShift]`                                     | 객체 lookup 동적 — desktop badge                                                                   | 옵션 N |
| L1237 SHIFT_COLOR | `SHIFT_COLOR[selCell.rawShift]`                                     | 동일 — mobile sheet badge                                                                          | 옵션 N |

### 좌표 spread (2건)

| Line (post-edit) | 변수                                                                                                | 사유                                                                                                      | 패턴   |
| ---------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------ |
| L1161 ovAt       | `position: 'absolute', left: \`${p.x}%\`, top: \`${p.y}%\`, transform, fontSize, fontWeight, color, whiteSpace, fontFamily, ...extra` | 동적 좌표 template literal + spread — 인라인 변환 절대 불가 (좌표 캘리브 시스템 + spread 모두 안티)         | 옵션 N |
| L1183 cp         | `position: 'absolute', left: \`${cp.x}%\`, top: \`${cp.y}%\`, transform, width, height, background`  | 동적 좌표 template literal — 동일                                                                          | 옵션 N |

### vendor prefix as any (2건)

| Line (post-edit) | 변수                                                                       | 사유                                                                                                                       | 패턴   |
| ---------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------ |
| L1285 input date  | `{ WebkitAppearance: 'none', MozAppearance: 'none' } as any`              | input date 의 native chrome 제거. as any 캐스팅 + 다중 prop → 변수 자체 보존 (보수적 처리, c9s precedent 와 정합성 보장)   | 옵션 N |
| L1296 input date  | 동일                                                                       | 동일                                                                                                                       | 옵션 N |

## 비즈 anchor precise diff (PASS)

| Anchor                  | Before | After | Diff |
| ----------------------- | ------ | ----- | ---- |
| `onClick={...}`         | 13     | 13    | 0    |
| `useState(`             | 5      | 5     | 0    |
| `useRef(`               | 0      | 0     | 0    |
| `useEffect(`            | 1      | 1     | 0    |
| `useMutation(`          | 0      | 0     | 0    |
| `useQuery(`             | 6      | 6     | 0    |
| `useNavigate(`          | 1      | 1     | 0    |
| `useParams(`            | 0      | 0     | 0    |
| `fetch(`                | 2      | 2     | 0    |
| `onClick={...}` unique  | 11     | 11    | 0    |

비즈 anchor precise grep IDENTICAL. 모든 13 onClick handler 본문 unique set 100% 일치.

## Phase A 결과 보존 (PASS)

| Metric                                           | Result |
| ------------------------------------------------ | ------ |
| emoji (✓/✗/🔒/💾/🔥/⏰/📋/✅/⚠️/❌/🔧/🚨/🔍/🧯/📊) | 0      |
| 비표준 색 (bg-warning/border-safe/border-warning/border-danger) | 0      |

## TypeScript (PASS)

`tsc --noEmit` 0 error. (`./node_modules/.bin/tsc --noEmit 2>&1 \| grep -c "error TS"` = 0)

## 파일 scope (PASS)

`git diff --name-only HEAD` = `cha-bio-safety/src/pages/StaffServicePage.tsx` 단일 파일 변경. 다른 .tsx / .ts / .css / .json 변경 0.

## Commit

| Hash      | Message                                                                              |
| --------- | ------------------------------------------------------------------------------------ |
| `316e1eb` | feat(260528-iht-01): Phase B Wave 7 — StaffServicePage 34 inline → tailwind          |

## 핵심 함정 회피 (자동 도달)

1. **w-7=32 / w-8=48 config override** — 본 wave 신규 추가 없음 (기존 `w-5 h-5` / `w-6 h-6` 보존). 28px arbitrary `[28px]` 사용 무.
2. **`[animation:...]` underscore = 공백** — L721 `[animation:spin_.7s_linear_infinite]` / L1228 `[animation:fadeIn_.2s_ease]` / L1236 `[animation:slideUp_.25s_ease]` 정확 변환.
3. **linear-gradient arbitrary 시 underscore** — L845 `bg-[linear-gradient(135deg,#42d778_50%,var(--duty-day)_50%)]` 공백 → underscore.
4. **grid-template-columns underscore** — L1290 `[grid-template-columns:1fr_auto_1fr_auto]` 공백 → underscore.
5. **rgba hex 공백 제거** — `rgba(6, 182, 212, 0.08)` → `rgba(6,182,212,0.08)` (tailwind arbitrary 룰 — 공백 안 됨).
6. **`text-[#hex]` arbitrary** — Wave 5 precedent (tokens.css 비-config hex). `text-fire-bar` 등 토큰 prefix 무.
7. **vendor prefix arbitrary 분기 룰** — 단일 prop (`L853 WebkitOverflowScrolling`) → 변환. 다중 prop + as any (`L1285/L1296 input date`) → 잔존. 보수적 정합성.

## 메모리 anchors

- `feedback_tailwind_w8_h8_is_48px.md` (config override 함정 회피)
- `feedback_tailwind_token_class_pattern.md` (-bar prefix 룰 / `text-[#hex]` arbitrary)
- `project_redesign_12_staff_service_status.md` (redesign/12 완결 페이지 컨텍스트 — 본 wave 가 phase b 마지막 정리)

## Self-Check: PASSED

- StaffServicePage.tsx 변경 확인: FOUND
- Commit `316e1eb` 확인: FOUND
- TypeScript 0 error: PASSED
- 비즈 anchor precise diff empty: PASSED
- Emoji 0 / 비색 0: PASSED
- 변경 파일 1개 (StaffServicePage.tsx 만): PASSED
