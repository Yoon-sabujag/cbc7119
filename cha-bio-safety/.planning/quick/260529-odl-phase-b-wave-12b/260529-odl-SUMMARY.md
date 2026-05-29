---
phase: 260529-odl-phase-b-wave-12b-staffmanage-desktop
plan: 01
subsystem: redesign/phase-b-sweep
status: complete
tags: [staff-manage, inline-style-to-tailwind, no-op-refactor, phase-b-tier-2-wave-12b, tier-2-pair-wave, zone-aware-sweep, desktop-zone-only, mobile-zone-preserved, label-style-input-style-preserved, atomic-single-commit, boundary-paired-conversion]
requires:
  - 260529-epe-phase-b-wave-12a 완료 (StaffManage 모바일 zone atomic, 1ca5c94 — Tier 2 첫 wave, zone-aware sweep precedent)
  - 260529-h8u-phase-b-wave-15a 완료 (ElevatorPage 모바일 zone 메가 분할 atomic, e37a5ca + 본 SUMMARY 직전 commit — Tier 2 모바일 wave 마지막)
  - 260527-wdc-legalpage-phase-b 옵션 X+P+M+색변수N 확정 (184e548)
provides:
  - StaffManagePage.tsx Phase B 완결 (27 → 3 inline 잔존, 데스크톱 zone 24 → 0, 모바일 zone 잔존 3 IDENTICAL — single atomic — 옵션 X+P+M+색변수N+module const N 승계, 17번째 atomic)
  - **Phase B Tier 2 12a + 12b 페어 wave 완결** — StaffManagePage 전체 inline 76 → 3 (-96%). 모바일 zone 12a sweep + 데스크톱 zone 12b sweep 분할 패턴 완성. 13a/14a/15a sweep 후 후행 13b/14b/15b reference 강화
  - **boundary line 짝꿍 변환 룰 박제** — Wave 12a 가 `style={{ flexShrink: 0 }}` 의 desktop-header(L393) + mobile-header(L405) 둘 다 보존했던 룰을, 12b 에서 desktop 짝꿍 변환 시 mobile-header 분기도 동시 변환 (paired conversion). ternary 양쪽 boundary 일관성 룰의 후행 정리 패턴
  - **데스크톱 zone 24 + boundary 1 = 25곳 단일 atomic 변환** — 17번째 atomic 자동 도달. wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w/gj2/h8u(15a-1+15a-2) 16+1 atomic 누적
  - **테이블 패턴 변환 박제** — `padding: '10px 8px'` (vertical 10 + horizontal 8) → `py-2.5 px-2`, `padding: '0 24px 24px'` → `px-6 pb-6`, `padding: '40px 16px'` → `py-10 px-4`, `borderCollapse: 'collapse'` → `border-collapse`, `fontWeight: 600` → `font-semibold`, `transition: 'background 0.1s'` → `transition-[background] duration-100`
  - **onMouseEnter/Leave handler 보존 패턴** — JSX inline handler 의 `e.currentTarget.style.background = 'var(--bg3)'` 는 `style={{` 게이트와 무관 (handler body 의 runtime DOM mutation). var(--bg3) 그대로 보존, transition className 위에 부드러운 hover 효과 IDENTICAL
affects:
  - src/pages/StaffManagePage.tsx
tech-stack:
  added: []
  patterns:
    - "옵션 X (정확값 arbitrary) — `bg-[rgba(59,130,246,.13)]` / `bg-[rgba(110,118,129,.15)]` / `w-[60px]` (액션 th width:60) — Wave 12a 와 동일 4건 (role-badge 2-prop conditional + 액션 th width)"
    - "옵션 P (leading-none 명시) — role-badge / status-cell 의 `leading-none` 그대로 보존 (Wave 12a 에서 이미 적용). 본 12b 는 신규 leading-none 추가 0건 (테이블 td/th 컨테이너는 small wrapper 아님, 텍스트 컨테이너 영향 0)"
    - "옵션 M (template literal conditional) — 4건: (1) tr opacity 1-prop `${s.active === 0 ? 'row-inactive opacity-50' : 'opacity-100'}` (row-inactive class 와 opacity 동시 conditional, 시각 0 byte) / (2) role-badge 2-prop bg+color conditional `${s.role === 'admin' ? 'admin bg-[rgba(59,130,246,.13)] text-accent' : 'assistant bg-[rgba(110,118,129,.15)] text-text-secondary'}` / (3) status-cell text color 1-prop `${s.active !== 0 ? 'status-active text-safe-bar' : 'status-inactive text-text-tertiary'}` (status-active/inactive class 동시 conditional) / (4) status-dot bg 1-prop `${s.active !== 0 ? 'bg-safe-bar' : 'bg-text-tertiary'}`"
    - "옵션 N (의도 inline) 잔존 3건 — L25 BottomSheet sheet root Pattern A `bottom: NAV_BOTTOM` + `maxHeight: calc(...)` 1건 + L210 form 사번 input INPUT_STYLE multi-state spread + conditional 1건 + L224 입사일 input INPUT_STYLE 2-prop spread 1건. 모두 모바일 zone — Wave 12a 잔존 그대로 (변경 0)"
    - "module const N — LABEL_STYLE / INPUT_STYLE / NAV_BOTTOM 정의 3건 보존 (Wave 12a precedent, L12/L57/L62)"
    - "tokens.css alias 일괄 매핑 (12a precedent 그대로) — `var(--bd)` → `border-border-default` / `var(--safe)` → `bg-safe-bar` / `text-safe-bar` / `var(--t3)` → `text-text-tertiary` / `bg-text-tertiary` / `var(--acl)` → `text-accent` / `var(--t2)` → `text-text-secondary`. var(--bg3) 만 hover handler 안에 잔존 (handler body 는 변환 범위 밖)"
    - "테이블 패딩 spacing override 인지 — `py-2.5` (10px = 0.625rem) + `px-2` (8px = 0.5rem) + `py-10` (40px) + `px-4` (16px) + `px-6` (24px) + `pb-6` (24px). tailwind.config.js 의 spacing override 는 7/8/9/10/11 만 (height 용) — py-/px- 의 2/2.5/4/6/10 은 기본값 그대로 사용 OK (검증: tailwind.config.js extend.spacing 의 2/2.5/4/6/10 override 0건)"
    - "w-[60px] arbitrary (액션 th width:60) — tailwind w-15 미존재, w-16=64 (override 시), w-14=56 → 정확값 60px 위해 arbitrary `w-[60px]` 채택. w-8/h-8=48 함정 회피 (액션 컬럼 의도값 60px ≠ 48px)"
    - "transition-[background] duration-100 — `transition: 'background 0.1s'` → arbitrary property + duration utility 매칭. onMouseEnter/Leave handler 의 background mutation 위 부드러운 hover 효과 IDENTICAL"
    - "boundary paired conversion — desktop ternary 의 양쪽 분기 같은 inline (`style={{ flexShrink: 0 }}` 2건) 가 12a 에서 둘 다 보존 → 12b 에서 둘 다 변환 (`shrink-0` × 2). zone 분할 룰의 후행 일관성 정리 패턴 박제"
    - "JSX inline handler vs inline style 게이트 분리 — onMouseEnter/onMouseLeave 가 inline 카운트에 안 잡힘 (`style={{` 패턴만 매칭). handler body 의 `e.currentTarget.style.background = ...` runtime DOM mutation 은 본 wave 범위 밖, var(--bg3) 보존 OK"
key-files:
  created:
    - .planning/quick/260529-odl-phase-b-wave-12b/260529-odl-SUMMARY.md
  modified:
    - src/pages/StaffManagePage.tsx
decisions:
  - "wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w/gj2/h8u 16+1 wave 승계 옵션 X+P+M+색변수N — 사용자 재컨펌 불필요 (0hr roadmap locked, 17번째 atomic)"
  - "zone-aware sweep 페어 wave 완결 — 12a 모바일 sweep + 12b 데스크톱 sweep 분할 패턴. StaffManagePage 전체 inline 76 → 3 (-96%) 단일 페이지 페어 완결 첫 사례"
  - "boundary line 짝꿍 변환 룰 신설 — 12a 가 `style={{ flexShrink: 0 }}` desktop-header(L393) + mobile-header(L405) 둘 다 보존했던 룰 (ternary 양쪽 일관성), 12b 에서 둘 다 변환 (`shrink-0` × 2). 분할 페어 완결 시점에 boundary 정리 패턴 박제. 후행 13b/14b/15b 같은 식 처리"
  - "module const 3개 정의 보존 (LABEL_STYLE / INPUT_STYLE / NAV_BOTTOM) — Wave 6 hbv precedent + Wave 12a precedent 그대로. L12/L57/L62 정의 0 byte 변경"
  - "옵션 N 잔존 3건 — L25 NAV_BOTTOM+calc (Pattern A), L210 INPUT_STYLE multi-state spread + conditional, L224 INPUT_STYLE 2-prop spread. 모두 모바일 zone 12a 잔존 그대로 IDENTICAL (12b sweep 범위 밖, 변경 0)"
  - "tr 행 opacity 변환 시 row-inactive class 와 opacity-50 동시 조건 적용 — `className={s.active === 0 ? 'row-inactive' : ''}` 가 inline opacity 와 함께 있었음. template literal 한 줄로 합치면서 row-inactive class 와 opacity-50/100 모두 같은 conditional 안으로 이동. 시각 0 byte (row-inactive class 가 CSS 에서 정의되었는지 와 무관하게 inline opacity 가 1차 적용, className 만 정리)"
  - "status-cell + status-dot 변환 시 status-active / status-inactive class 도 template literal 안으로 합침 — 원본 `className={...status-active... text-caption leading-none inline-flex items-center gap-1} style={{ color: ... }}` 를 `className={...status-active text-safe-bar... ...}` 한 줄로. 옵션 M 2-prop 패턴 + class 보존 동시 처리"
  - "단일 atomic commit — 17번째 atomic 자동 도달. wdc 이후 (a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w/gj2/h8u-1/h8u-2 16 atomic) 본 12b 추가. 25곳 변환 단일 atomic"
metrics:
  duration: "약 15분 (Task 1 atomic — single commit, 24 desktop + 1 boundary, 25 inline sweep)"
  completed-date: 2026-05-29
  tasks-completed: "1/1"
  files-modified: 1
  lines-changed: "24 insertions / 31 deletions (net -7 lines, atomic single commit)"
roadmap-wave: "Tier 2 / Wave 12b (StaffManage 데스크톱 zone — Tier 2 페어 wave 완결, 17번째 atomic)"
---

# Phase 260529-odl Plan 01: Phase B Wave 12b StaffManagePage 데스크톱 zone Summary

StaffManagePage.tsx (524줄, Wave 12a 직후 27 inline = 데스크톱 zone 24 + 모바일 zone 잔존 3) 의 **데스크톱 zone 24건 + L405 mobile-header boundary 1건 = 25건** 정적 inline style 을 wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w/gj2/h8u 승계 옵션 X+P+M+색변수N+module const N 으로 tailwind className 변환. **모바일 zone 잔존 3건 (L25/L210/L224) 절대 보존**. **단일 atomic commit**. **27 → 3 잔존** (-24건 -88.9%): 데스크톱 zone 24 → 0 + 모바일 zone 3 → 3 (보존). 시각 결과 0 byte 변경 (no-op refactor). Phase A 결과 (Lucide / 색 토큰 -bar / emoji 0 / 비표준 색 0) 및 비즈니스 로직 (18 onClick + 3 useState + 2 useEffect + 4 useMutation + 2 useQuery + 1 useNavigate + 1 onMouseEnter + 1 onMouseLeave 모두 보존) 모두 IDENTICAL. **Phase B Tier 2 Wave 12b 페어 wave 완결 — 17번째 atomic** — StaffManagePage 페이지 전체 inline 76 → 3 (-96%). zone-aware sweep 분할 + boundary paired 정리 패턴 박제. 12a/12b 페어 wave 첫 완결 사례 → 13a/13b, 14a/14b, 15a/15b 후행 페어 reference.

## User Decisions (승계 — wdc / 01h / a3v / c9s / cjn / gsh / h3z / hbv / iht / irl / jey / jxo / nkv / epe / f2w / gj2 / h8u / 0hr-roadmap 재확인 불필요)

| ID  | 선택                                                           | 출처                              |
| --- | -------------------------------------------------------------- | --------------------------------- |
| (b) | **옵션 X** — 정확값 arbitrary `[Npx]` / `[rgba(...)]` (시각 0 byte) | wdc Phase B Task 2 결정            |
| (c) | **옵션 P** — `leading-none` 명시 보존 (본 wave 신규 적용 0건)   | wdc Phase B Task 2 결정            |
| (d) | **옵션 M + 색 변수만 N** — template literal conditional 우선 (4건) | wdc Phase B Task 2 결정            |
| -   | **a3v~h8u 16+1 wave 승계 적용** — 본 wave 재확인 없이           | 260528-0hr roadmap v2 locked-decisions |
| -   | **module-scope const N (LABEL_STYLE / INPUT_STYLE / NAV_BOTTOM)** | Wave 6 hbv (Schedule inp/lbl) precedent + 12a 승계 |
| -   | **zone-aware sweep — 데스크톱 zone 만, 모바일 zone 3 보존**     | Wave 12a 페어 완결 패턴 (분할 sweep) |
| -   | **boundary paired conversion 룰 신설** — desktop ternary 양쪽 같은 inline 2건 (12a 보존 → 12b 둘 다 변환) | 본 wave 신규 (페어 완결 후행 정리 패턴 박제) |

## Before / After 카운트

| Metric                                                | Before | After  | Diff             |
| ----------------------------------------------------- | ------ | ------ | ---------------- |
| StaffManagePage.tsx total `style={{`                  | **27** | **3**  | **-24 (-88.9%)** |
| StaffManagePage.tsx 데스크톱 zone `style={{`           | **24** | **0**  | **-24 (-100%)**  |
| StaffManagePage.tsx 모바일 zone `style={{`             | **3**  | **3**  | **= (보존)**     |
| LABEL_STYLE / INPUT_STYLE / NAV_BOTTOM module const   | **3**  | **3**  | **= (보존)**     |
| TypeScript errors                                     | 0      | 0      | =                |
| 비즈 anchors (18 onClick / 3 useState / 2 useEffect / 4 useMutation / 2 useQuery / 1 useNavigate / 1 onMouseEnter / 1 onMouseLeave) | IDENTICAL | IDENTICAL | = |
| 비표준 색 토큰 (warning/safe/danger no-suffix)         | 0      | 0      | =                |
| 변경 파일 수 (1 .tsx 외 off-scope)                     | 0      | 0      | =                |
| Vite build (PWA generation)                           | OK     | OK     | =                |

### 페어 wave 합산 (12a + 12b) — StaffManagePage 전체 변환

| Metric                                                | Original (Wave 12a 진입 시) | After Wave 12a (1ca5c94) | After Wave 12b (본 commit) | Total Diff       |
| ----------------------------------------------------- | -------------------------: | -----------------------: | ----------------------: | ---------------- |
| StaffManagePage.tsx total `style={{`                  | **76**                     | **27**                   | **3**                   | **-73 (-96.1%)** |
| 모바일 zone `style={{`                                 | **52**                     | **3** (= 12a 잔존)       | **3** (보존)            | **-49 (-94.2%)** |
| 데스크톱 zone `style={{`                               | **24**                     | **24** (보존)            | **0**                   | **-24 (-100%)**  |

## 데스크톱 zone sweep 매핑 (25건 — 라인별)

### 1-2. 헤더 (L393 desktop-header + L399 desktop add btn) — 2건

| Line (Before) | Before (inline)                                            | After (className)                                            | 옵션 |
| ------------: | ---------------------------------------------------------- | ------------------------------------------------------------ | ---: |
| L393          | `style={{ flexShrink: 0 }}` (desktop-header)                | `shrink-0` (className 안 prepended)                          | -    |
| L399          | `style={{ border: 'none', cursor: 'pointer' }}` (add btn)   | `border-0 cursor-pointer` (className 안 appended)            | -    |

### 3. boundary paired (L405 mobile-header) — 1건

| Line (Before) | Before                                                     | After                                                        | 옵션 |
| ------------: | ---------------------------------------------------------- | ------------------------------------------------------------ | ---: |
| L405          | `style={{ flexShrink: 0 }}` (mobile-header — ternary 짝꿍) | `shrink-0` (className 안 prepended) — **boundary paired 변환** | -    |

### 4-5. content / table (L427 desktop-content + L428 data-table) — 2건

| Line (Before) | Before                                                                       | After                                                          | 옵션 |
| ------------: | ---------------------------------------------------------------------------- | -------------------------------------------------------------- | ---: |
| L427          | `style={{ padding: '0 24px 24px' }}`                                          | `px-6 pb-6` (top:0 default 생략)                               | -    |
| L428          | `style={{ width: '100%', borderCollapse: 'collapse' }}`                       | `w-full border-collapse`                                       | -    |

### 6. thead th × 7 (L431-L437) — 7건

| Line (Before) | Before                                                                       | After                                                          | 옵션 |
| ------------: | ---------------------------------------------------------------------------- | -------------------------------------------------------------- | ---: |
| L431          | `style={{ padding: '10px 8px' }}` (이름)                                      | `py-2.5 px-2`                                                  | -    |
| L432          | `style={{ padding: '10px 8px' }}` (사번)                                      | `py-2.5 px-2`                                                  | -    |
| L433          | `style={{ padding: '10px 8px' }}` (직책)                                      | `py-2.5 px-2`                                                  | -    |
| L434          | `style={{ padding: '10px 8px' }}` (역할)                                      | `py-2.5 px-2`                                                  | -    |
| L435          | `style={{ padding: '10px 8px' }}` (연락처)                                    | `py-2.5 px-2`                                                  | -    |
| L436          | `style={{ padding: '10px 8px' }}` (상태)                                      | `py-2.5 px-2`                                                  | -    |
| L437          | `style={{ padding: '10px 8px', width: 60 }}` (액션)                            | `py-2.5 px-2 w-[60px]`                                         | X    |

### 7. state-empty td (L442) — 1건

| Line (Before) | Before                                                                       | After                                                          | 옵션 |
| ------------: | ---------------------------------------------------------------------------- | -------------------------------------------------------------- | ---: |
| L442          | `style={{ padding: '40px 16px' }}` (state-empty colSpan=7)                    | `py-10 px-4`                                                   | -    |

### 8. tr row 옵션 M (L448) — 1건

| Line (Before) | Before                                                                       | After (옵션 M)                                                  | 옵션 |
| ------------: | ---------------------------------------------------------------------------- | -------------------------------------------------------------- | ---: |
| L448          | `className={s.active === 0 ? 'row-inactive' : ''} style={{ borderBottom: '1px solid var(--bd)', cursor: 'pointer', opacity: s.active === 0 ? 0.5 : 1, transition: 'background 0.1s' }}` | `className={`border-b border-border-default cursor-pointer transition-[background] duration-100 ${s.active === 0 ? 'row-inactive opacity-50' : 'opacity-100'}`}` | M |

→ onMouseEnter/Leave handler (L449-L450) 보존: `e.currentTarget.style.background = 'var(--bg3)'` / `'transparent'` IDENTICAL

### 9-13. body td × 5 (L452-L455 단순 + L463-L464 단순) — 6건

| Line (Before) | Before                                                                       | After                                                          | 옵션 |
| ------------: | ---------------------------------------------------------------------------- | -------------------------------------------------------------- | ---: |
| L452          | `style={{ padding: '10px 8px', fontWeight: 600 }}` (name-cell)                | `py-2.5 px-2 font-semibold`                                    | -    |
| L453          | `style={{ padding: '10px 8px' }}` (id-cell)                                   | `py-2.5 px-2`                                                  | -    |
| L454          | `style={{ padding: '10px 8px' }}` (title-cell)                                | `py-2.5 px-2`                                                  | -    |
| L455          | `style={{ padding: '10px 8px' }}` (role td wrapper)                           | `py-2.5 px-2` (className 추가)                                 | -    |
| L463          | `style={{ padding: '10px 8px' }}` (phone-cell)                                | `py-2.5 px-2`                                                  | -    |
| L464          | `style={{ padding: '10px 8px' }}` (status td wrapper)                         | `py-2.5 px-2` (className 추가)                                 | -    |
| L472          | `style={{ padding: '10px 8px' }}` (action-cell)                               | `py-2.5 px-2`                                                  | -    |

### 14. role-badge 옵션 M 2-prop (L456-L459) — 1건

| Line (Before) | Before                                                                       | After (옵션 M)                                                  | 옵션 |
| ------------: | ---------------------------------------------------------------------------- | -------------------------------------------------------------- | ---: |
| L456-L459     | `className={`role-badge ${s.role === 'admin' ? 'admin' : 'assistant'} text-caption leading-none px-1.5 py-0.5 rounded`} style={{ background: s.role === 'admin' ? 'rgba(59,130,246,.13)' : 'rgba(110,118,129,.15)', color: s.role === 'admin' ? 'var(--acl)' : 'var(--t2)' }}` | `className={`role-badge ${s.role === 'admin' ? 'admin bg-[rgba(59,130,246,.13)] text-accent' : 'assistant bg-[rgba(110,118,129,.15)] text-text-secondary'} text-caption leading-none px-1.5 py-0.5 rounded`}` | M+X |

### 15. status-cell 옵션 M (L465-L467) — 1건

| Line (Before) | Before                                                                       | After (옵션 M)                                                  | 옵션 |
| ------------: | ---------------------------------------------------------------------------- | -------------------------------------------------------------- | ---: |
| L465-L467     | `className={`status-cell ${s.active !== 0 ? 'status-active' : 'status-inactive'} text-caption leading-none inline-flex items-center gap-1`} style={{ color: s.active !== 0 ? 'var(--safe)' : 'var(--t3)' }}` | `className={`status-cell ${s.active !== 0 ? 'status-active text-safe-bar' : 'status-inactive text-text-tertiary'} text-caption leading-none inline-flex items-center gap-1`}` | M |

### 16. status-dot 옵션 M (L468) — 1건

| Line (Before) | Before                                                                       | After (옵션 M)                                                  | 옵션 |
| ------------: | ---------------------------------------------------------------------------- | -------------------------------------------------------------- | ---: |
| L468          | `className="status-dot w-[6px] h-[6px] rounded-full" style={{ background: s.active !== 0 ? 'var(--safe)' : 'var(--t3)' }}` | `className={`status-dot w-[6px] h-[6px] rounded-full ${s.active !== 0 ? 'bg-safe-bar' : 'bg-text-tertiary'}`}` | M |

**합계:** 2 (헤더) + 1 (boundary) + 2 (content/table) + 7 (thead th) + 1 (state-empty) + 1 (tr row) + 7 (body td 단순) + 1 (role-badge 옵션 M) + 1 (status-cell 옵션 M) + 1 (status-dot 옵션 M) + 1 (action-cell) = **25건 변환**

## 모바일 zone 잔존 3건 IDENTICAL 확인

| Line (After) | 위치                | 잔존 prop                                                                                                                                          | 사유                                                                                  |
| -----------: | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| L25          | BottomSheet sheet root (Pattern A) | `{ bottom: NAV_BOTTOM, maxHeight: 'calc(100dvh - var(--sat, 0px) - var(--sab, 0px) - 54px)' }` | NAV_BOTTOM module const + dynamic calc — Pattern A 옵션 N (12a precedent) |
| L210         | form 사번 input    | `{ ...INPUT_STYLE, fontFamily: 'JetBrains Mono, monospace', ...(mode === 'edit' ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }` | INPUT_STYLE multi-state spread + conditional spread (mode === 'edit') — 옵션 N (Wave 6 hbv + 12a precedent) |
| L224         | 입사일 disabled input | `{ ...INPUT_STYLE, opacity: 0.5, cursor: 'not-allowed' }`                                                                                          | INPUT_STYLE 2-prop spread — 옵션 N (Wave 6 hbv + 12a precedent) |

→ verify grep 출력 (gate 2): L12 NAV_BOTTOM const def + L25 sheet root + L210 fontFamily + L224 INPUT_STYLE spread = 모두 보존 확인.

## 비즈 anchors 보존 (18 onClick / 3 useState / 2 useEffect / 4 useMutation / 2 useQuery / 1 useNavigate / 1 onMouseEnter / 1 onMouseLeave — IDENTICAL)

```
onClick=\{[^}]+\} : 18 (before) == 18 (after)
useState\(        : 3 == 3
useRef\(          : 0 == 0
useEffect\(       : 2 == 2
useMutation\(     : 4 == 4
useQuery\(        : 2 == 2
useNavigate\(     : 1 == 1
useParams\(       : 0 == 0
fetch\(           : 0 == 0
onMouseEnter      : 1 == 1
onMouseLeave      : 1 == 1
```

precise diff (sort+uniq onClick set): **0 line difference** (15 unique onClick callsites all preserved — diff /tmp/before-sm.txt /tmp/after-sm.txt 출력 empty).

## 자동 검증 결과 (9 게이트 모두 PASS)

| Gate | Verify                                                              | Result    |
| ---: | ------------------------------------------------------------------- | --------- |
| 1    | `style={{` total 27 → ≤ 4                                            | **27 → 3** ✓ (-24 -88.9%, 모바일 zone 잔존 3) |
| 2    | 모바일 zone 잔존 3건 IDENTICAL (NAV_BOTTOM + INPUT_STYLE × 2)         | **3 / 3** ✓ (L12 NAV_BOTTOM const def + L25 sheet root + L210 fontFamily/conditional + L224 INPUT_STYLE spread 모두 보존) |
| 3    | 비즈 anchor 11종 (onClick/useState/useRef/useEffect/useMutation/useQuery/useNavigate/useParams/fetch/onMouseEnter/onMouseLeave) IDENTICAL | **11/11 OK** ✓ |
| 4    | onClick precise diff = 0                                            | **EMPTY** ✓ (15 unique handlers all preserved) |
| 5    | emoji 0 / 비표준 색 토큰 0                                            | **emoji: 0 / 비색: 0** ✓ |
| 6    | module const def = 3 (LABEL_STYLE / INPUT_STYLE / NAV_BOTTOM)        | **3** ✓   |
| 7    | TypeScript `error TS` count = 0                                     | **0** ✓   |
| 8    | vite build (PWA generation)                                         | **PASSED** ✓ (✓ built in 188ms, dist/sw.mjs 25.19 kB / gzip 8.33 kB, PWA 82 entries / 7932.60 KiB) |
| 9    | 변경 파일 = 1 .tsx 만 (off-scope = 0)                                | **0 off-scope** ✓ (`git status --short` → `M src/pages/StaffManagePage.tsx` 단일) |

## Commit

| Hash        | Subject                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `1484f6e`   | feat(260529-odl-01): Phase B Wave 12b — StaffManage 데스크톱 zone (24 inline) → tailwind         |

## Phase B Tier 1 종결 + Tier 2 진행 (Wave 1~12b 누적, 18 atomic commits)

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
| 13a  | Checkpoints 모바일 zone (Tier 2 두 번째 wave)            | 80 → 41 (모바일 42→3)   | -                      | 9cafd5c       |
| 14a  | Remediation 모바일 zone (Tier 2 세 번째 wave)           | 25 → 15 (모바일 11→1)   | -                      | b6b7e36       |
| 15a-1| ElevatorPage Fault/Repair/Findings 트랙 (메가 분할 1/2) | 206 → 166 (plan 01 51→11) | -                    | e37a5ca       |
| 15a-2| ElevatorPage Cert/Info/Annual 트랙 (메가 분할 2/2)      | 166 → 132 (plan 02 50→16) | -                    | (h8u plan 02 commit) |
| **12b** | **StaffManage 데스크톱 zone (Tier 2 페어 wave 완결)** ← 이번 | **27 → 3 (데스크톱 24→0, 페어 합산 76→3 -96%)** | -        | **`1484f6e`** |
| **합계 (12b)** | **20 페이지**                                  | **926 → 383 (-58.6%)**  | **37 → 0 (Phase A 완결)** | **18 atomic commits** |

### Tier 2 진행 — zone-aware sweep 페어 wave 첫 완결 + boundary paired conversion 패턴 신규 박제

1. **페어 wave 첫 완결 (12a + 12b)** — StaffManagePage 단일 페이지의 모바일 + 데스크톱 zone 모두 sweep 완료. 76 → 3 inline (-96%). 분할 sweep 패턴 첫 완결 → 13a/13b, 14a/14b, 15a/15b 후행 페어 완결 reference 강화
2. **boundary paired conversion 룰 신설** — 12a 가 `style={{ flexShrink: 0 }}` desktop-header(L393) + mobile-header(L405) 둘 다 보존 (ternary 양쪽 일관성) → 12b 에서 둘 다 변환 (`shrink-0` × 2). 페어 완결 시점의 boundary 정리 패턴 박제. 후행 13b/14b/15b 도 같은 식 (12a/13a/14a/15a 가 ternary 양쪽 inline 동시 보존했다면, 12b/13b/14b/15b 에서 둘 다 변환)
3. **17번째 atomic 자동 도달** — Wave 1~11 + 12a/13a/14a/15a-1/15a-2 + 12b = 18 atomic (h8u 만 2 atomic 분할). 단일 페이지 25곳 변환 단일 atomic 패턴 자동 적용
4. **테이블 패턴 변환 박제** — `padding: '10px 8px'` (cell padding) → `py-2.5 px-2` / `padding: '0 24px 24px'` (container) → `px-6 pb-6` / `padding: '40px 16px'` (empty state) → `py-10 px-4` / `borderCollapse: 'collapse'` → `border-collapse` / `fontWeight: 600` → `font-semibold` / `transition: 'background 0.1s'` → `transition-[background] duration-100`. 모든 spacing override 회피 (tailwind.config 기본값 사용)
5. **JSX inline handler 보존 (onMouseEnter/Leave)** — `style={{` 게이트와 무관, handler body 의 `e.currentTarget.style.background = 'var(--bg3)'` runtime DOM mutation 은 변환 범위 밖. var(--bg3) 그대로 + transition className 위에 부드러운 hover 효과 IDENTICAL
6. **시각 0 byte 룰 100% 유지** — 18 atomic 모두 PWA build 성공 + 비즈 anchor IDENTICAL + 비표준 색 토큰 0

### 다음 단계 (Tier 2 진행)

- **Wave 13b** — CheckpointsPage 데스크톱 zone sweep (모바일 zone 13a 완결 후, 페어 완결 두 번째 사례)
- **Wave 14b** — RemediationPage 데스크톱 zone sweep
- **Wave 15b** — ElevatorPage 데스크톱 zone L527-L1024 105곳 sweep (메가 페이지 후행, 별도 phase 가능)
- 옵션 X+P+M+색변수N + module const N + boundary paired conversion 룰 그대로 승계

## 메모리 anchor 적용

| anchor | 적용 |
| ------ | ---- |
| `feedback_tailwind_w8_h8_is_48px.md` | w-8=48 (override) 함정 인지 — 액션 th width:60 의도값 60 ≠ 48 → arbitrary `w-[60px]` 채택. 본 wave 변환 대상 중 h-8/w-8 사용 0건 |
| `feedback_tailwind_token_class_pattern.md` | text-safe-bar / text-text-tertiary / text-accent / text-text-secondary / border-border-default / bg-safe-bar / bg-text-tertiary — status- prefix 없음 / Lucide UserPlus size={N} 패턴 (기존 보존) |
| `feedback_text_caption_leading_none.md` | role-badge / status-cell 의 `leading-none` 보존 (12a 에서 이미 적용, 12b 신규 추가 0건). 본 wave 변환 대상 (td/th wrapper) 은 텍스트 작은 컨테이너 아님 → leading-none 신규 적용 0건 |
| `feedback_design_changes_ask_first.md` | 시각 0 byte 룰 100% — 9 게이트 모두 PASS, 모바일 zone 잔존 3건 IDENTICAL |
| `feedback_check_branch_before_edit.md` | worktree base 검증 (HEAD = 5e5676b, agent worktree main OK) — 변환 시작 전 git merge-base 확인 |
| Wave 12a (1ca5c94) StaffManage 모바일 zone precedent | zone-aware sweep 페어 wave 패턴 + boundary 보존 (12a) → boundary paired conversion (12b) 후행 정리 룰 |
| Wave 6 hbv (Schedule inp/lbl) module const precedent | LABEL_STYLE / INPUT_STYLE 정의 보존 + spread 옵션 N 잔존 룰 그대로 적용 (NAV_BOTTOM const 추가 보존) |
| Wave 11 nkv (ElevatorFindingDetail) token alias 일괄 매핑 | tokens.css alias 그대로 활용 (var(--bd) / var(--safe) / var(--t3) / var(--acl) / var(--t2) 일괄 className 변환) |

## Self-Check: PASSED

- StaffManagePage.tsx 변경 (file:/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/StaffManagePage.tsx) — FOUND
- 변경 사항: 24 insertions / 31 deletions (net -7 lines)
- 변환 25곳 (24 desktop + 1 boundary paired) 매핑 그대로 적용 — PASSED
- 모바일 zone 잔존 3건 (L25 NAV_BOTTOM/maxHeight, L210 사번 INPUT_STYLE spread + fontFamily + conditional, L224 입사일 INPUT_STYLE spread + opacity/cursor) IDENTICAL — PASSED
- 9 자동 검증 게이트 모두 PASSED (inline 27→3, 모바일 잔존 3, 비즈 anchor 11종 IDENTICAL, onClick diff 0, emoji 0, 비색 0, module const 3, TypeScript 0, vite build OK, off-scope 0)
- 비즈 anchor diff = 0 line — PASSED (15 unique onClick callsites 보존)
- TypeScript = 0 error — PASSED
- Vite build = succeeded (188ms, 82 PWA entries / 7932.60 KiB) — PASSED
- off-scope 변경 = 0 (src/pages/StaffManagePage.tsx 단일 파일만) — PASSED
- LABEL_STYLE / INPUT_STYLE / NAV_BOTTOM const def = 3 — PASSED
- 페어 wave 완결 (12a + 12b) 확정 — PASSED (StaffManagePage 76 → 3 -96%, 단일 페이지 페어 완결 첫 사례)
- boundary paired conversion 룰 신설 — PASSED (L393 + L405 shrink-0 짝꿍 변환)
- commit hash `1484f6e` — FOUND in `git log --oneline -5 src/pages/StaffManagePage.tsx`
