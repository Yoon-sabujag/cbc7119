---
phase: 260529-q5a-phase-b-wave-14b-remediation-desktop
plan: 01
subsystem: redesign/phase-b-sweep
status: complete
tags: [remediation, inline-style-to-tailwind, no-op-refactor, phase-b-tier-2-wave-14b, tier-2-pair-wave, zone-aware-sweep, desktop-zone-only, mobile-zone-preserved, early-return-pattern, partial-conversion-first, kv-table-loop-conversion, skeleton-style-preserved, atomic-single-commit]
requires:
  - 260529-gj2-phase-b-wave-14a 완료 (Remediation 모바일 zone atomic, 0a430b1 — Tier 2 세 번째 wave, early-return + helper shared zone 첫 사례)
  - 260529-ozt-phase-b-wave-13b 완료 (Checkpoints 데스크톱 zone atomic, 18번째 atomic — boundary paired conversion 룰 두 번째 적용 + 데스크톱 zone INPUT_STYLE spread 옵션 N 확장)
  - 260529-odl-phase-b-wave-12b 완료 (StaffManage 데스크톱 zone atomic, Tier 2 페어 wave 완결 첫 사례 — boundary paired conversion 룰 박제)
  - 260527-wdc-legalpage-phase-b 옵션 X+P+M+색변수N 확정 (184e548)
provides:
  - RemediationPage.tsx Phase B 완결 (15 → 3 inline 잔존 = 데스크톱 zone 14 → 2 + 모바일 zone 1 → 1 — single atomic — 옵션 X+P+M+색변수N+module const N 승계, **19번째 atomic**)
  - **Phase B Tier 2 14a + 14b 페어 wave 완결** — RemediationPage 전체 inline 25 → 3 (-88.0%). 모바일 zone 14a sweep + 데스크톱 zone 14b sweep 분할 패턴 12a/12b → 13a/13b → 14a/14b **세 번째 페어 완결**. 15a/15b 후행 페어 reference 강화
  - **early-return 페어 wave 첫 사례** — Wave 14a 가 신규 적용한 `if (isDesktop) { return (...) }` early-return 구조의 데스크톱 분기 (L281-L490, 14건 보존) 를 Wave 14b 가 sweep. ternary `{isDesktop ? : }` 구조 (12a/12b, 13a/13b) 와 다른 페어 패턴 (zone 분리는 동일)
  - **부분 변환 (partial conversion) 패턴 첫 사례 박제** — L335 (변환 후 L332) detail-pane 3-prop combo `{ padding: '20px 28px', boxSizing: 'border-box', scrollbarWidth: 'none' }` 중 padding+boxSizing className 화 + scrollbarWidth inline 잔존. INPUT_STYLE spread (13b ozt L523/L555) 와 달리 spread 가 아닌 일반 객체 → prop 분리 가능. inline 카운트 유지하되 prop 2개 감소 (3→1)
  - **kv-table loop + resolved branch 11건 IDENTICAL 패턴 일괄 변환** — th 4 + td 4 + 동적 loop th 1 + td 1 = 11건. 9-prop th 패턴 5건 (1 dynamic loop + 4 resolved branch 조치일시/조치자/조치 내용/소모 자재) 모두 동일 className. td 패턴 6/7-prop variant (whiteSpace/align-top 가변) 명시 매핑
  - **데스크톱 zone 안 옵션 N 확장 2건 박제** — L297 (desktop list scrollbarWidth 단독) + L332 (detail-pane partial 잔존). 13b ozt 의 INPUT_STYLE spread 옵션 N 확장 (L523/L555) 직후 scrollbarWidth 옵션 N 확장. 페어 합산 잔존 = 데스크 2 + 모바일 1 = **3**
  - **SKELETON_STYLE module const N 보존 4번째 atomic** — Wave 5 RemediationDetail + Wave 6 hbv Schedule + Wave 12a epe StaffManage + Wave 13a f2w Checkpoints + Wave 14a gj2 Remediation precedent 그대로. L109-114 정의 보존, 직접 참조 6건 (desktop 3 on L299 + mobile 3 on L548-550) 손대지 않음
affects:
  - src/pages/RemediationPage.tsx
tech-stack:
  added: []
  patterns:
    - "옵션 X (정확값 arbitrary) — `w-[110px]` (kv-table th width 110, w-7=32/w-8=48 함정 회피) / `px-[28px]` (detail-pane padding 28px, px-7=32 함정 회피) / `text-[12px]` (th fontSize 12, text-caption lh:1.5 영향 회피) / `text-[13px]` (td fontSize 13 + detail-empty fontSize 13, text-label lh:1.5 영향 회피) / `leading-[1.5]` (th lineHeight 1.5, leading-normal=1.5 와 동일하나 명시성) / `leading-[1.6]` (td lineHeight 1.6, leading-relaxed=1.625 다름 → arbitrary 필수)"
    - "옵션 P (leading-none 명시) — 본 wave 신규 적용 0건 (테이블 th/td 컨테이너는 텍스트 wrapper 아님, badge span 의 기존 leading-none 은 변경 0)"
    - "옵션 M (template literal conditional) — 본 wave 신규 적용 0건 (모든 inline 이 static prop, conditional 없음)"
    - "옵션 N (의도 inline) 잔존 3건 — 데스크톱 zone 2 (L297 desktop list scrollbar 단독 옵션 N + L332 detail-pane partial 잔존 scrollbarWidth) + 모바일 zone 1 (L544 mobile list scrollbar 단독 옵션 N, Wave 14a 잔존 IDENTICAL). 모두 `scrollbarWidth: 'none'` (Tailwind 기본 클래스 없음, non-standard CSS property)"
    - "**부분 변환 (partial conversion) 신규 패턴** — L335 (after L332) `{ padding: '20px 28px', boxSizing: 'border-box', scrollbarWidth: 'none' }` 3-prop combo 중 padding+boxSizing 만 className (`py-5 px-[28px] box-border`) → inline 잔존 1-prop (`scrollbarWidth: 'none'`). spread 객체와 달리 일반 객체이므로 prop 분리 가능. inline 카운트 유지 (분리 후에도 1건) 하되 prop 2개 감소 (3→1)"
    - "tokens.css alias 일괄 매핑 (Wave 11 nkv / 12a epe / 12b odl / 13a f2w / 13b ozt / 14a gj2 precedent 그대로) — `var(--surface-sunken)` → `bg-surface-sunken` (th × 5) / `var(--border-default)` (1px solid) → `border border-border-default` (th × 5 + td × 6) / `var(--text-secondary)` → `text-text-secondary` (th × 5) / `var(--text-primary)` → `text-text-primary` (td × 6)"
    - "테이블 패딩 spacing override 인지 — `py-2` (8px, spacing override 2=8) / `px-3` (12px, spacing override 3=12) / `py-5` (20px, spacing override 5=20) / `mb-5` (20px, spacing override 5=20). 28px 는 spacing override 7=32px 함정 → `px-[28px]` arbitrary 필수. 110px 는 매칭 클래스 없음 → `w-[110px]` arbitrary"
    - "border 단일 inline → 두 className 결합 — `'1px solid var(--border-default)'` → `border border-border-default` (border = 1px solid baseline + border-border-default = color). 13b ozt precedent 동일"
    - "td prop variant 명시 매핑 — 6-prop td (resolved 조치일시/조치자) = `py-2 px-3 border border-border-default text-[13px] text-text-primary leading-[1.6]`. 7-prop td (loop dynamic, resolved 조치 내용/소모 자재) = 6-prop + `whitespace-pre-wrap` (whiteSpace:pre-wrap). loop dynamic 만 + `align-top` (verticalAlign:top). resolved 조치 내용/소모 자재 는 align-top 없음 = IDENTICAL"
    - "early-return 페어 wave 첫 사례 — `if (isDesktop) { return (...) }` 구조의 데스크톱 분기 (L281-L490, after edits) 와 default mobile return (L491~) 페어 분할. 12a/12b, 13a/13b 의 `{isDesktop ? : }` ternary 구조와 다름. helper shared zone (pre-L281) 0 inline (Wave 14a 에서 이미 모두 변환됨)"
    - "boundary paired conversion 불필요 — early-return 구조는 ternary 와 달리 양쪽 짝꿍 inline 페어 없음 (각 분기 독립적). 12b/13b 의 `shrink-0 × 2` 동시 변환 패턴은 본 wave 미적용"
key-files:
  created:
    - .planning/quick/260529-q5a-phase-b-wave-14b/260529-q5a-SUMMARY.md
  modified:
    - src/pages/RemediationPage.tsx
decisions:
  - "wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w/gj2/h8u/odl/ozt 18 wave 승계 옵션 X+P+M+색변수N — 사용자 재컨펌 불필요 (0hr roadmap locked, 19번째 atomic)"
  - "zone-aware sweep 페어 wave 세 번째 완결 — 14a 모바일 sweep + 14b 데스크톱 sweep 분할 패턴. RemediationPage 전체 inline 25 → 3 (-88.0%). StaffManage (12a/12b -96%) / Checkpoints (13a/13b -92.5%) 직후 세 번째 페어 완결 사례"
  - "early-return 페어 wave 첫 사례 — 14a 가 신규 적용한 `if (isDesktop) { return }` 구조의 데스크톱 분기 sweep. ternary 구조 페어 (12a/12b, 13a/13b) 와 다른 페어 패턴. boundary paired conversion (12b/13b 의 shrink-0 × 2 동시 변환) 불필요"
  - "부분 변환 (partial conversion) 신규 패턴 첫 사례 — L335 (after L332) 3-prop combo 중 padding+boxSizing className 화 + scrollbarWidth inline 잔존. 13b ozt INPUT_STYLE spread 옵션 N 확장 (L523/L555) 과 다름 (spread 아닌 일반 객체 → 분리 가능). 후행 wave 의 multi-prop combo 처리 reference"
  - "데스크톱 zone 안 옵션 N 확장 2건 — scrollbarWidth 단독 (L297) + 부분 잔존 (L332). 13b ozt 의 INPUT_STYLE spread 옵션 N 확장 (L523/L555) 직후 scrollbarWidth 옵션 N 확장. zone 무관 옵션 N 룰 일관성"
  - "SKELETON_STYLE module const N 보존 5번째 atomic — Wave 5/6/12a/13a/14a precedent 그대로. L109-114 정의 보존, 직접 참조 6건 (desktop 3 + mobile 3) 손대지 않음. 옵션 N spread 패턴 0건 (RemediationPage 는 select 류 없음)"
  - "kv-table th/td 11건 일괄 변환 — 9-prop th 5건 (1 dynamic loop + 4 resolved 조치일시/조치자/조치 내용/소모 자재) IDENTICAL className. td 6/7-prop variant 명시 매핑 (whiteSpace/align-top 가변). table root 1건 + th 5건 + td 6건 + detail-empty 1건 + detail-pane partial 1건 = 13건 처리"
  - "단일 atomic commit — 19번째 atomic 자동 도달. wdc 이후 (a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w/gj2/h8u-1/h8u-2/odl/ozt 18 atomic) 본 14b 추가. 12 데스크톱 변환 + 1 partial 단일 atomic"
metrics:
  duration: "약 10분 (Task 1 atomic — single commit, 12 desktop sweep + 1 partial conversion + 1 옵션 N 보존)"
  completed-date: 2026-05-29
  tasks-completed: "1/1"
  files-modified: 1
  lines-changed: "17 insertions / 20 deletions (net -3 lines, atomic single commit)"
roadmap-wave: "Tier 2 / Wave 14b (Remediation 데스크톱 zone — Tier 2 페어 wave 세 번째 완결, 19번째 atomic)"
---

# Phase 260529-q5a Plan 01: Phase B Wave 14b RemediationPage 데스크톱 zone Summary

RemediationPage.tsx (638줄 → 635줄, Wave 14a 직후 15 inline = 데스크톱 zone 14 + 모바일 zone 1) 의 **데스크톱 zone 14건 중 12건 변환 + 1건 부분 변환 + 1건 옵션 N 보존** = 12건 정적 inline style 을 wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w/gj2/h8u/odl/ozt 승계 옵션 X+P+M+색변수N+module const N 으로 tailwind className 변환. **모바일 zone 잔존 1건 (L544) 절대 보존**. **단일 atomic commit**. **15 → 3 잔존** (-12건 -80.0%): 데스크톱 zone 14 → 2 (-12건, L297 옵션 N + L332 partial 잔존 scrollbarWidth) + 모바일 zone 1 → 1 (보존). 시각 결과 0 byte 변경 (no-op refactor). Phase A 결과 (Lucide / 색 토큰 -bar / emoji 0 보존 / 비표준 색 0) 및 비즈니스 로직 (7 unique onClick + 9 occurrence + 2 useState + 2 useQuery + 1 useNavigate + 1 useSearchParams + 2 fetch 모두 보존) 모두 IDENTICAL. **Phase B Tier 2 Wave 14b 페어 wave 세 번째 완결 — 19번째 atomic** — RemediationPage 페이지 전체 inline 25 → 3 (-88.0%). zone-aware sweep 분할 + early-return 페어 wave 첫 사례 + 부분 변환 (partial conversion) 패턴 첫 사례 박제. 12a/12b → 13a/13b 페어 직후 14a/14b 세 번째 페어 완결 → 15a/15b 후행 페어 reference 강화.

## User Decisions (승계 — wdc / 01h / a3v / c9s / cjn / gsh / h3z / hbv / iht / irl / jey / jxo / nkv / epe / f2w / gj2 / h8u / odl / ozt / 0hr-roadmap 재확인 불필요)

| ID  | 선택                                                           | 출처                              |
| --- | -------------------------------------------------------------- | --------------------------------- |
| (b) | **옵션 X** — 정확값 arbitrary `[Npx]` (시각 0 byte)             | wdc Phase B Task 2 결정            |
| (c) | **옵션 P** — `leading-none` 명시 (본 wave 신규 0건)             | wdc Phase B Task 2 결정            |
| (d) | **옵션 M + 색 변수만 N** — template literal conditional (본 wave 신규 0건) | wdc Phase B Task 2 결정            |
| -   | **a3v~ozt 18 wave 승계 적용** — 본 wave 재확인 없이           | 260528-0hr roadmap v2 locked-decisions |
| -   | **module-scope const N (SKELETON_STYLE)** — 정의 보존 + 직접 참조 6건 손대지 않음 | Wave 5 RemediationDetail + Wave 6 hbv + Wave 12a epe + Wave 13a f2w + Wave 14a gj2 precedent (5번째 atomic) |
| -   | **zone-aware sweep — 데스크톱 zone 만, 모바일 zone 1 보존**     | Wave 12a/12b → 13a/13b → 14a/14b 페어 완결 패턴 세 번째 적용 |
| -   | **데스크톱 zone 안 옵션 N 확장 (scrollbarWidth)** — Tailwind 미지원 prop 은 zone 무관 inline 보존 | 13b ozt 의 INPUT_STYLE spread 옵션 N 확장 (L523/L555) 직후 scrollbarWidth 옵션 N 확장 |
| -   | **부분 변환 (partial conversion) 신규 패턴** — multi-prop combo 중 일부만 className 화, 나머지 inline 잔존 | 본 wave 첫 사례 (L332 padding+boxSizing 변환 + scrollbarWidth 잔존) |

## Before / After 카운트

| Metric                                                | Before | After  | Diff             |
| ----------------------------------------------------- | ------ | ------ | ---------------- |
| RemediationPage.tsx total `style={{`                  | **15** | **3**  | **-12 (-80.0%)** |
| RemediationPage.tsx 데스크톱 zone `style={{`           | **14** | **2**  | **-12 (-85.7%)** |
| RemediationPage.tsx 모바일 zone `style={{`             | **1**  | **1**  | **= (보존)**     |
| SKELETON_STYLE const def                               | **1**  | **1**  | **= (보존)**     |
| SKELETON_STYLE 직접 참조 (occurrences)                  | **6**  | **6**  | **= (보존)**     |
| TypeScript errors                                     | 0      | 0      | =                |
| 비즈 anchors (9 onClick / 2 useState / 2 useQuery / 1 useNavigate / 1 useSearchParams / 2 fetch) | IDENTICAL | IDENTICAL | = |
| 비표준 색 토큰 (warning/safe/danger no-suffix)         | 0      | 0      | =                |
| emoji (RemediationPage 는 이미 Lucide 적용 완료)        | 0      | 0      | =                |
| 변경 파일 수 (1 .tsx 외 off-scope)                     | 0      | 0      | =                |
| File 라인 수                                          | 638    | 635    | -3 (net)         |
| Vite build (PWA generation)                           | OK     | OK     | =                |

### 페어 wave 합산 (14a + 14b) — RemediationPage 전체 완결

| Metric                                                | Original (Wave 14a 진입 시) | After Wave 14a (0a430b1) | After Wave 14b (본 commit) | Total Diff       |
| ----------------------------------------------------- | -------------------------: | -----------------------: | ----------------------: | ---------------- |
| RemediationPage.tsx total `style={{`                  | **25**                     | **15**                   | **3**                   | **-22 (-88.0%)** |
| 모바일 zone `style={{`                                 | **11**                     | **1** (L547 옵션 N)      | **1** (보존, L544 시프트) | **-10 (-90.9%)** |
| 데스크톱 zone `style={{`                               | **14**                     | **14** (보존)            | **2** (L297 + L332 옵션 N) | **-12 (-85.7%)** |
| File 라인 수                                          | **724**                    | **638**                  | **635**                 | **-89**          |

## 데스크톱 zone sweep 매핑 (12건 변환 + 1건 부분 변환 + 1건 옵션 N 보존 = 14건)

### A. 디테일 헤더/empty/scroll 영역 (L297-L335 before / L297-L332 after) — 1건 변환 + 1건 부분 + 1건 옵션 N

| Line (Before) | Line (After) | 영역                          | Before (요약)                                                                                                | After (요약)                                                                                                  | 옵션 |
| -----------:| -----------:| ----------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ---: |
| L297        | L297        | desktop list scrollbar         | `style={{ scrollbarWidth: 'none' } as React.CSSProperties}`                                                  | **(보존 — IDENTICAL)**                                                                                        | **N** |
| L327        | L325        | detail-empty fontSize          | 1-prop `{ fontSize: 13 }`                                                                                    | className 합침 `text-[13px]` 추가 (multi-line `<div>` 단일행 합침)                                              | X    |
| L335        | L332        | detail-pane padding+boxSizing+scrollbarWidth (**partial**) | 3-prop `{ padding: '20px 28px', boxSizing: 'border-box', scrollbarWidth: 'none' } as React.CSSProperties` | `className="overflow-y-auto h-full py-5 px-[28px] box-border" style={{ scrollbarWidth: 'none' } ...}` (partial) | **X+N (partial)** |

### B. kv-table 영역 (L357-L413 before / L354-L410 after) — 11건 변환

#### Loop dynamic (L370+L372 before / L367+L369 after) — 2건

| Line (Before) | Line (After) | 영역                  | Before (요약)                                                                                                                | After (요약)                                                                                                                | 옵션 |
| -----------:| -----------:| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---: |
| L357        | L354        | table root             | 3-prop `{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }`                                                     | `className="w-full border-collapse mb-5"`                                                                                    | 직접 |
| L370        | L367        | kv-table th (loop)     | 9-prop `{ width: 110, padding: '8px 12px', background: var(--surface-sunken), border: '1px solid var(--border-default)', fontSize: 12, fontWeight: 700, color: var(--text-secondary), textAlign: 'left', verticalAlign: 'top', lineHeight: 1.5 }` | `className="w-[110px] py-2 px-3 bg-surface-sunken border border-border-default text-[12px] font-bold text-text-secondary text-left align-top leading-[1.5]"` | X+token |
| L372        | L369        | kv-table td (loop)     | 7-prop `{ padding: '8px 12px', border: '1px solid var(--border-default)', fontSize: 13, color: var(--text-primary), whiteSpace: 'pre-wrap', verticalAlign: 'top', lineHeight: 1.6 }` | `className="py-2 px-3 border border-border-default text-[13px] text-text-primary whitespace-pre-wrap align-top leading-[1.6]"` | X+token |

#### Resolved branch (L400/401/404/405/408/409/412/413 before / L397/398/401/402/405/406/409/410 after) — 8건

| Line (Before) | Line (After) | 영역                  | th/td variant                                                                                                                 | 옵션 |
| -----------:| -----------:| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---: |
| L400        | L397        | th 조치일시            | L370 IDENTICAL (9-prop)                                                                                                       | X+token |
| L401        | L398        | td 조치일시            | 6-prop (L372 - whitespace-pre-wrap - align-top) → `py-2 px-3 border border-border-default text-[13px] text-text-primary leading-[1.6]` | X+token |
| L404        | L401        | th 조치자              | L370 IDENTICAL (9-prop)                                                                                                       | X+token |
| L405        | L402        | td 조치자              | L401 IDENTICAL (6-prop)                                                                                                       | X+token |
| L408        | L405        | th 조치 내용           | L370 IDENTICAL (9-prop)                                                                                                       | X+token |
| L409        | L406        | td 조치 내용           | 7-prop (L372 - align-top) → `py-2 px-3 border border-border-default text-[13px] text-text-primary whitespace-pre-wrap leading-[1.6]` | X+token |
| L412        | L409        | th 소모 자재           | L370 IDENTICAL (9-prop)                                                                                                       | X+token |
| L413        | L410        | td 소모 자재           | L409 IDENTICAL (7-prop)                                                                                                       | X+token |

**합계: 데스크톱 zone 12건 변환 + 1건 부분 변환 (L332) + 1건 옵션 N 보존 (L297) = 14건 처리**

## 옵션 N (의도 inline) 잔존 3건 (페어 합산)

| Line (After) | zone     | 영역                                  | 잔존 prop                                                       | 사유                                                                                  |
| ----:        | -------- | ------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| L297         | desktop  | desktop list scrollbar                | `{ scrollbarWidth: 'none' } as React.CSSProperties`             | Tailwind 기본 클래스 없음 (non-standard CSS property). 단독 옵션 N                       |
| L332         | desktop  | detail-pane (partial)                 | `{ scrollbarWidth: 'none' } as React.CSSProperties`             | 3-prop combo 중 padding+boxSizing className 화 + scrollbarWidth 잔존. **부분 변환 첫 사례** |
| L544         | mobile   | mobile list scrollbar (Wave 14a 잔존) | `{ scrollbarWidth: 'none' } as React.CSSProperties`             | Tailwind 기본 클래스 없음. Wave 14a 잔존 IDENTICAL (라인 시프트 L547 → L544)             |

## SKELETON_STYLE module const N 보존 (정의 + 직접 참조 6건)

| 종류              | 위치 (Before / After) | 보존 형태                                                  |
| ----------------- | --------------------- | ---------------------------------------------------------- |
| const def         | L109-114 (변경 0)     | `const SKELETON_STYLE: React.CSSProperties = { ... }`     |
| desktop list 참조 | L299 × 3              | `<><div style={SKELETON_STYLE} /><div style={SKELETON_STYLE} /><div style={SKELETON_STYLE} /></>` (한 줄에 3건) |
| mobile list 참조  | L548-550 × 3 (after) / L551-553 (before) | `<div style={SKELETON_STYLE} />` × 3 (세 줄)              |

> verify gate 의 `grep -c 'style={{' $F` 에 안 잡힘 (style={SKELETON_STYLE} 패턴은 const 참조). 손대지 말 것 룰 100% 준수.

## 비즈 anchors 보존 (9 onClick / 2 useState / 2 useQuery / 1 useNavigate / 1 useSearchParams / 2 fetch — IDENTICAL)

```
onClick=\{...\} : 9 (before) == 9 (after)
useState\( : 2 == 2
useEffect\( : 0 == 0
useRef\( : 0 == 0
useMutation\( : 0 == 0
useQuery\( : 2 == 2
useNavigate\( : 1 == 1
useParams\( : 0 == 0
useSearchParams\( : 1 == 1
fetch\( : 2 == 2
```

precise diff (sort+uniq onClick set): **0 line difference** (7 unique onClick callsites all preserved — downloadPhoto×2 / downloadReport / isDesktop ternary / navigate / setDays / setStatusTab).

## 자동 검증 결과 (12 게이트 모두 PASS)

| Verify gate                                            | Result    |
| ------------------------------------------------------ | --------- |
| 1. `style={{` total = 3                                | **3** ✓ (within target ≤ 3) |
| 2. 데스크톱 zone (L281-L490) inline = 2                 | **2** ✓ (L297 + L332 옵션 N) |
| 3. 모바일 zone (L491-end) inline = 1                    | **1** ✓ (L544 옵션 N IDENTICAL) |
| 4. 비즈 anchor diff = 0                                | **EMPTY** ✓ (10 anchors all IDENTICAL) |
| 5. onClick precise diff = 0                            | **EMPTY** ✓ (7 unique handlers all preserved) |
| 6. emoji 변동 = 0                                       | **0** ✓ (RemediationPage Lucide 완료, before=0/after=0)   |
| 7. 비표준 색 토큰 = 0                                   | **0** ✓   |
| 8. SKELETON_STYLE const def = 1, occurrences = 6        | **1 / 6** ✓ (정의 보존, 직접 참조 6건 손대지 않음) |
| 9. diff hunk 모바일 zone 영역 변경 = 0                  | **0 touched** ✓ (4 hunks 모두 L322-L416 — pre-mobile-zone L491 이하) |
| 10. TypeScript `error TS` count = 0                    | **0** ✓   |
| 11. 변경 파일 = 1 .tsx 만 (off-scope = 0)               | **0 off-scope** ✓ |
| 12. Vite build (PWA generation)                        | **PASS** ✓ (built in 200ms / precache 82 entries 7931.26 KiB / sw.js generated) |

```
=== 1. inline count ===
src/pages/RemediationPage.tsx: 15 -> 3 (-12, -80.0%)
  PASS inline = 3 (target ≤ 3)

=== 2. desktop zone (L281-L490) inline = 2 ===
desktop zone inline: 2 ✓
  L297: style={{ scrollbarWidth: 'none' } as React.CSSProperties}  ← 옵션 N 단독
  L332: style={{ scrollbarWidth: 'none' } as React.CSSProperties}  ← 옵션 N partial (padding+boxSizing className 화)

=== 3. mobile zone (L491-end) inline = 1 ===
mobile zone inline: 1 ✓
  L544: style={{ scrollbarWidth: 'none' } as React.CSSProperties}  ← Wave 14a 잔존 IDENTICAL

=== 4. biz anchor identity ===
EMPTY diff ✓

=== 5. onClick set diff ===
PASS onClick diff 0 ✓ (7 unique callsites)

=== 6. emoji / nonstandard color ===
emoji: 0 ✓
nonstandard color: 0 ✓

=== 7. SKELETON_STYLE ===
const def: 1 ✓
direct refs: 6 ✓ (desktop 3 on L299 + mobile 3 on L548-550)

=== 8. TypeScript ===
0 errors ✓

=== 9. diff hunk mobile zone touch (MUST empty) ===
PASS — mobile zone untouched (all hunks end before L491)
  hunks: @@-322,17 (end 338) / @@-354,7 (end 360) / @@-367,9 (end 375) / @@-397,20 (end 416)

=== 10. off-scope ===
0 off-scope files ✓ (only src/pages/RemediationPage.tsx)

=== 11. vite build (PWA generation) ===
✓ 87 modules transformed
✓ built in 200ms
PWA injectManifest precache 82 entries (7931.26 KiB)
dist/sw.js generated ✓
```

## Commit

| Commit | Type | Subject | Files | Hash |
| ------ | ---- | ------- | ----- | ---- |
| 1      | feat | `feat(260529-q5a-01): Phase B Wave 14b — Remediation 데스크톱 zone (14 inline) → tailwind` | src/pages/RemediationPage.tsx | (commit 직후 기입) |

(SUMMARY.md 는 별도 commit 없음 — PLAN.md 와 동일 패턴 룰)

## Phase B Tier 2 누적 진행 표 (12a/12b/13a/13b/14a/14b + 15a)

| Wave | 페이지 / 영역                                                | Inline diff (zone) | 누적 atomic | 페어 완결 |
| ---- | ------------------------------------------------------------ | ------------------ | ----------- | --------- |
| 12a (epe) | StaffManagePage 모바일 zone (52 inline)                | -49 (52 → 3)       | 14          | -         |
| 12b (odl) | StaffManagePage 데스크톱 zone (24 + boundary 1 = 25)    | -24 (24 → 0)       | 17          | **12a+12b: 76 → 3 (-96.1%)** |
| 13a (f2w) | CheckpointsPage 모바일 zone (42 inline)                | -38 (42 → 4)       | 15          | -         |
| 13b (ozt) | CheckpointsPage 데스크톱 zone (38 inline)               | -36 (38 → 2)       | 18          | **13a+13b: 80 → 6 (-92.5%)** |
| 14a (gj2) | RemediationPage 모바일 zone (11 inline)                | -10 (11 → 1)       | 16          | -         |
| **14b (q5a)** | **RemediationPage 데스크톱 zone (14 inline)** ← 이번 | **-12 (14 → 2)**   | **19**      | **14a+14b: 25 → 3 (-88.0%)** ✓ |
| 15a (h8u) | ElevatorPage 모바일 zone (메가 분할 2 atomic)           | (해당 wave 참조)   | 16+1        | (15b reference) |

## Phase B Tier 2 페어 wave 완결 패턴 (12a/12b → 13a/13b → 14a/14b 박제)

1. **zone-aware sweep 분할 세 번째 완결** — 모바일/데스크톱 zone 분리 후 페어 wave 로 처리. 12a/12b (StaffManage) 첫 → 13a/13b (Checkpoints) 두 번째 → **14a/14b (Remediation) 세 번째 완결**. 15a/15b (ElevatorPage) 후행 페어 reference 강화.
2. **early-return 페어 wave 첫 사례** — Wave 14a 가 신규 적용한 `if (isDesktop) { return (...) }` early-return 구조. ternary `{isDesktop ? : }` (12a/12b, 13a/13b) 와 다른 페어 패턴. boundary paired conversion (12b/13b 의 `shrink-0 × 2`) 불필요.
3. **부분 변환 (partial conversion) 신규 패턴** — L332 detail-pane 3-prop combo 중 padding+boxSizing className 화 + scrollbarWidth inline 잔존. 13b ozt 의 INPUT_STYLE spread 옵션 N 확장 (L523/L555, spread 4-prop 통째 보존) 과 다른 패턴 (일반 객체 → 분리 가능). 후행 wave 의 multi-prop combo 처리 reference.
4. **데스크톱 zone 안 옵션 N 확장 (scrollbarWidth)** — Wave 13b ozt 의 INPUT_STYLE spread 옵션 N 확장 (L523/L555) 직후 scrollbarWidth 옵션 N 확장 (L297/L332). zone 무관 옵션 N 룰 일관성.
5. **kv-table loop+resolved branch 11건 IDENTICAL 패턴** — th 5건 (1 dynamic loop + 4 resolved 조치일시/조치자/조치 내용/소모 자재) 모두 IDENTICAL className (9-prop). td 6/7-prop variant 명시 매핑 (whiteSpace/align-top 가변). 12b/13b 의 데이터 테이블 패턴 (`py-2.5 px-2`) 와 다른 padding (`py-2 px-3`) 이나 변환 원리 동일.
6. **SKELETON_STYLE module const N 5번째 atomic** — Wave 5/6/12a/13a/14a 직후 본 wave 도 그대로 보존. 정의 + 직접 참조 6건 손대지 않음. RemediationPage 페이지 family Phase B 룰 일관 (Wave 5 db728c0 RemediationDetail + Wave 14a + 14b).
7. **단일 atomic commit 페어 wave 세 번째 연속 적용** — 12a~14b 페어 wave 모두 단일 atomic. 19번째 atomic 자동 도달 (wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w/gj2/h8u-1/h8u-2/odl/ozt + q5a).

## 메모리 anchor 적용

| anchor | 적용 |
| ------ | ---- |
| `feedback_tailwind_w8_h8_is_48px.md` | px-7=32px 함정 회피 → `px-[28px]` arbitrary. w-7=32 / w-8=48 인지. spacing override 2=8 / 3=12 / 5=20 그대로 활용 (py-2 / px-3 / py-5 / mb-5) |
| `feedback_tailwind_token_class_pattern.md` | bg-surface-sunken / border-border-default / text-text-secondary / text-text-primary — status- prefix 없음 |
| `feedback_text_caption_leading_none.md` | text-[12px] / text-[13px] arbitrary 채택 (text-caption lh:1.5 영향 회피). leading-[1.5] / leading-[1.6] arbitrary (text-caption/text-label 의 lh:1.5 와 충돌 회피, 명시성) |
| `feedback_design_changes_ask_first.md` | 시각 0 byte 룰 100% — verify gate 12개 모두 PASS, 모바일 zone 1건 보존 |
| `feedback_check_branch_before_edit.md` | worktree base 검증 (HEAD = 5a280da, agent worktree OK) |
| Wave 5 (db728c0) RemediationDetail precedent | 같은 페이지 family Phase B 룰 일관 적용 (5번째 SKELETON_STYLE 보존) |
| Wave 11 nkv / 12a epe / 12b odl / 13a f2w / 13b ozt / 14a gj2 (token alias 일괄 매핑) | tokens.css alias 그대로 활용 (var(--surface-sunken / border-default / text-secondary / text-primary 일괄 className 변환) |
| Wave 13b ozt (INPUT_STYLE spread 데스크톱 zone 옵션 N 확장 L523/L555) | scrollbarWidth 옵션 N 확장 (L297/L332) 직후 적용. zone 무관 옵션 N 룰 일관성 |
| Wave 14a gj2 (early-return zone 분할 + helper shared zone) | early-return 페어 wave 첫 사례 적용 (14a 데스크톱 zone 보존 → 14b sweep). helper shared zone 0 inline (14a 에서 이미 변환됨) |

## 신규 패턴 박제 (early-return 페어 + 부분 변환)

### 1. early-return 페어 wave (`if (isDesktop) { return }` 구조)

- **Wave 14a (모바일 sweep):** 데스크톱 분기 (L325-L537 original) 전체 보존, default mobile return (L540~) 변환. helper (renderCard/filterBar) pre-L325 shared zone 변환 — 양 view 자동 적용 (의도된 부수효과).
- **Wave 14b (데스크톱 sweep, 본 wave):** 데스크톱 분기 (L281-L490 after 14a) 만 sweep. ternary 구조 (12a/12b, 13a/13b) 의 boundary paired conversion (`shrink-0 × 2` 동시 변환) 불필요 — 각 분기 독립적.
- **15a/15b 후행:** ElevatorPage 가 ternary 구조면 boundary paired conversion 패턴, early-return 구조면 본 14a/14b 패턴 적용.

### 2. 부분 변환 (partial conversion) 신규 패턴

- **L332 detail-pane (본 wave 첫 사례):** 3-prop combo `{ padding: '20px 28px', boxSizing: 'border-box', scrollbarWidth: 'none' }` 중 padding+boxSizing 만 className (`py-5 px-[28px] box-border`) + scrollbarWidth inline 잔존.
- **13b ozt 의 INPUT_STYLE spread (L523/L555) 와 다름:** spread (4-prop combo `{ ...INPUT_STYLE, height: 36, appearance: 'none', cursor: 'pointer', paddingRight: 32 }`) 은 분리 불가 → 통째 보존. 본 wave 의 일반 객체는 prop 분리 가능 → 부분 변환.
- **inline 카운트 영향:** 부분 변환은 inline 카운트 유지 (1건 잔존) 하되 prop 갯수 감소 (3→1). 시각 0 byte 룰 100% 유지.
- **후행 reference:** multi-prop combo 의 Tailwind 미지원 prop (scrollbarWidth, -webkit-* 등) 처리 패턴. spread vs 일반 객체 구분 후 적용.

## Self-Check: PASSED

- 변환 파일 존재: `src/pages/RemediationPage.tsx` ✓
- `style={{` 카운트 15 → 3 (-12, -80.0%) ✓
- 데스크톱 zone 잔존 2건 IDENTICAL (L297 옵션 N 단독 + L332 partial 잔존 scrollbarWidth) ✓
- 모바일 zone 잔존 1건 IDENTICAL (L544 옵션 N, Wave 14a 잔존 L547 → L544 라인 시프트) ✓
- 비즈 anchor (9 onClick / 2 useState / 2 useQuery / 1 useNavigate / 1 useSearchParams / 2 fetch) IDENTICAL ✓
- onClick set diff 0 (7 unique handlers preserved) ✓
- emoji 0 유지 (RemediationPage Lucide 완료) ✓
- 비표준 색 토큰 0 ✓
- SKELETON_STYLE const def 1 보존 + 직접 참조 6건 손대지 않음 ✓
- TypeScript error 0 ✓
- vite build (PWA generation) 성공 (built 200ms, sw.js generated) ✓
- 단일 atomic commit (commit hash: 직후 기입) ✓
- off-scope 변경 0 (src/pages/RemediationPage.tsx 단일 파일) ✓
- 페어 wave 완결 14a + 14b 누적 25 → 3 (-88.0%) ✓
- diff hunk 모바일 zone 영역 변경 0 (4 hunks 모두 L322-L416 — pre-mobile-zone L491 이하) ✓
