---
phase: 260529-gj2-phase-b-wave-14a-remediation-mobile
plan: 01
subsystem: redesign/phase-b-sweep
status: complete
tags: [remediation, inline-style-to-tailwind, no-op-refactor, phase-b-tier-2-wave-14a, tier-2-third-wave, zone-aware-sweep, mobile-zone-only, desktop-zone-preserved, early-return-pattern, helper-shared-zone, skeleton-style-preserved, atomic-single-commit]
requires:
  - 260529-f2w-phase-b-wave-13a 완료 (Checkpoints 모바일 zone atomic, 9cafd5c — Tier 2 두 번째 wave precedent)
  - 260529-epe-phase-b-wave-12a 완료 (StaffManage 모바일 zone atomic, 1ca5c94 — Tier 2 첫 wave precedent)
  - 260527-wdc-legalpage-phase-b 옵션 X+P+M+색변수N 확정 (184e548)
provides:
  - RemediationPage.tsx Phase B Wave 14a 완료 (25 → 15 inline 잔존, 모바일 zone 11 → 1, single atomic — 옵션 X+P+M+색변수N+module const N 승계)
  - **Phase B Tier 2 세 번째 wave 완결** — Wave 12a/13a zone-aware sweep 패턴 15번째 atomic 자동 도달. 14b/15a/15b 후행 wave reference
  - **early-return `if (isDesktop) { return }` 구조 첫 사례** — desktop view (L325-L537 originally / L281-L493 after edits) 절대 보존, default mobile return (L540~ originally / L495~ after edits) 만 변환. helper (renderCard/filterBar) pre-L325 shared zone 으로 분류 — 한 번 변환으로 양 view 모두 자동 적용 (의도된 부수효과)
  - **데스크톱 zone 14곳 절대 변경 0 검증 패턴** — kv-table th/td 11건 + scrollbar 1 + detail-empty fontSize 1 + detail-pane padding 1. Wave 14b 후행으로 미루는 분할 룰 12a → 13a → 14a 연속 적용 (3rd time)
  - **SKELETON_STYLE module const N 보존 + 직접 참조 6건 (desktop 3 + mobile 3) 손대지 않음** — Wave 5 RemediationDetail precedent + Wave 6 hbv Schedule + Wave 12a epe StaffManage + Wave 13a f2w Checkpoints precedent 그대로. L109-114 정의 보존
  - **scrollbarWidth 옵션 N 잔존 1건 (L547 mobile)** — Tailwind 미지원 CSS property. 데스크톱 L297 도 동일 패턴이나 desktop zone 보존 룰로 자동 유지
affects:
  - src/pages/RemediationPage.tsx
tech-stack:
  added: []
  patterns:
    - "옵션 X (정확값 arbitrary) — `text-[13px]` / `text-[12px]` / `duration-[130ms]` / `rounded-[2px]` 정확값 보존 (tailwind config 미스매치 / tokens.css alias 부재 케이스). `text-caption` lh:1.5 영향 회피 위해 `text-[Npx]` arbitrary 채택"
    - "옵션 P (leading-none 명시) — RemediationPage 자체에는 leading-none 신규 적용 없음 (모바일 zone 의 변환 대상 inline 들이 작은 컨테이너 안 라벨 케이스 X, 이미 leading-none 유지된 부분은 변경 0)"
    - "옵션 M (template literal conditional) — color/bg/border-color 2-3 prop conditional 5건: L183/L668 색바 bg `${record.status === 'open' ? 'bg-fire-bar' : 'bg-safe-bar'}` 양 view 동일 패턴 / L255/L556 STATUS_TABS 3-prop bg+text+border-b `${statusTab === tab.key ? 'bg-surface-active text-text-primary border-accent' : 'bg-transparent text-text-tertiary border-transparent'}` 양 view 동일 / L301/L605 PERIOD_BUTTONS 2-prop bg+text `${days === btn.value ? 'bg-surface-active text-text-primary' : 'bg-transparent text-text-tertiary'}` 양 view 동일 + L605 만 `transition-all duration-150` 추가 (L301 vs L605 transition prop 차이 명시 매핑)"
    - "옵션 N (의도 inline) 잔존 1건 — L547 mobile list scrollbar `style={{ scrollbarWidth: 'none' } as React.CSSProperties}` (Tailwind 기본 클래스 없음). desktop L297 도 동일 패턴이나 desktop zone 보존 룰로 자동 유지 (총 2건 page 전체)"
    - "tokens.css alias 일괄 매핑 (Wave 11/12a/13a precedent 그대로) — `var(--surface-raised)`→`bg-surface-raised` / `var(--surface-sunken)`→`bg-surface-sunken` / `var(--surface-active)`→`bg-surface-active` / `var(--text-primary)`→`text-text-primary` / `var(--text-tertiary)`→`text-text-tertiary` / `var(--accent)`→`border-accent` / `var(--border-strong)`→`border-border-strong` / `var(--status-fire-bar)`→`bg-fire-bar` / `var(--status-safe-bar)`→`bg-safe-bar`"
    - "w-8/h-8=48 spacing override 회피 — height:32 → `h-7` (h-7=32 spacing override) / height:36 → `h-9` (standard) / height:44 → `h-11` (standard). `feedback_tailwind_w8_h8_is_48px.md` anchor 적용"
    - "self-stretch 신규 패턴 — `alignSelf: 'stretch'` 의 tailwind 표준 클래스. L183/L668 색바 양 view 동일 적용"
    - "duration-[130ms] 신규 패턴 — `transition: 'color .13s'` 의 130ms 표현 (소수점 0 prefix 안전 회피, ms 명시). `transition-colors` 와 결합 (오직 color/bg/border-color 만 transition)"
    - "early-return zone 분할 — `if (isDesktop) { return }` 구조 첫 사례. desktop view L325-L537 절대 변경 0, default mobile return L540~ 변환. helper (pre-L325) 는 양 view 공용 = shared zone 으로 분류 (한 번 변환으로 양 view 적용, desktop view 의 `{filterBar}` 호출 site 에도 자동 영향 — 의도된 부수효과)"
key-files:
  created:
    - .planning/quick/260529-gj2-phase-b-wave-14a/260529-gj2-SUMMARY.md
  modified:
    - src/pages/RemediationPage.tsx
decisions:
  - "wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w 15 wave 승계 옵션 X+P+M+색변수N — 사용자 재컨펌 불필요 (0hr roadmap locked, 15번째 승계)"
  - "zone-aware sweep 12a → 13a → 14a 연속 적용 — `if (isDesktop) { return (...) }` early-return 구조의 데스크톱 분기 (L325-L537, kv-table+scrollbar+detail 14건) 전체 보존. helper (renderCard/filterBar) pre-L325 shared zone 분류 — 양 view 공용 inline 이 정의된 곳은 helper 안 (pre-L325) 한 곳에만 존재. 한 번 변환으로 양 view 자동 적용 (desktop view 의 `{filterBar}` 호출 site 도 영향 — 의도된 부수효과, desktop zone 보존 룰 위반 아님)"
  - "SKELETON_STYLE module const N 보존 (Wave 5 RemediationDetail precedent + Wave 6 hbv + Wave 12a epe + Wave 13a f2w precedent) — L109-114 정의 그대로. `style={SKELETON_STYLE}` 직접 참조 6건 (desktop list 3 + mobile list 3) 이미 inline 아님 (verify 에 안 잡힘, 손대지 말 것). spread 패턴 0건 (RemediationPage 는 select 류 없음 → 옵션 N spread 없음)"
  - "text-[13px] / text-[12px] arbitrary 채택 — tailwind config 의 `text-caption` (12px lh:1.5) / `text-body-sm` (13px) 대신 정확값 arbitrary 사용. 이유: text-caption 의 lh:1.5 가 작은 컨테이너 안에서 시각적 패딩으로 작용 → 시각 0 byte 보장 위해 arbitrary 채택. `feedback_text_caption_leading_none.md` anchor 적용"
  - "L301 vs L605 transition prop 차이 명시 매핑 — desktop helper (L301) = `transition: 'color .13s'` → `transition-colors duration-[130ms]`. mobile inline (L605) = `transition: 'all 0.15s'` → `transition-all duration-150` 추가. 두 inline 의 transition 거동 차이 보존 (시각 0 byte 룰 100%)"
  - "단일 atomic commit 패턴 자동 도달 — wdc 이후 15번째 atomic (a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w 승계). 11 mobile inline 단일 atomic"
  - "**Tier 2 세 번째 wave** — zone 분할 패턴 15번째 atomic 자동 도달. 14b/15a/15b reference 강화. early-return 구조 첫 사례 패턴 박제"
metrics:
  duration: "약 10분 (Task 1 atomic — single commit, 11 mobile inline sweep, helper shared)"
  completed-date: 2026-05-29
  tasks-completed: "1/1"
  files-modified: 1
  lines-changed: "10 insertions / 96 deletions (net -86 lines, atomic single commit)"
roadmap-wave: "Tier 2 / Wave 14a (Remediation 모바일 zone — Tier 2 세 번째 wave)"
---

# Phase 260529-gj2 Plan 01: Phase B Wave 14a RemediationPage 모바일 zone Summary

RemediationPage.tsx (724줄 → 638줄, 25 total inline = 모바일 zone 11 + 데스크톱 zone 14) 의 **모바일 zone 11건** 정적 inline style 을 wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl/jey/jxo/nkv/epe/f2w 승계 옵션 X+P+M+색변수N+module const N 으로 tailwind className 변환. **데스크톱 zone 14곳 절대 변경 0** (Wave 14b 후행). **단일 atomic commit**. **25 → 15 잔존** (-10건 -40.0%): 모바일 zone 11 → 1 (-10건, scrollbarWidth 옵션 N 1건 잔존) + 데스크톱 zone 14 → 14 (보존). 시각 결과 0 byte 변경 (no-op refactor). Phase A 결과 (Lucide / 색 토큰 -bar / emoji 0 보존 / 비표준 색 0) 및 비즈니스 로직 (7 unique onClick + 9 occurrence + 2 useState + 2 useQuery + 1 useNavigate + 1 useSearchParams + 2 fetch 모두 보존) 모두 IDENTICAL. **Phase B Tier 2 Wave 14a 성공** — 예상 (~14-16 잔존) 정확 달성 (15 잔존). **Tier 2 세 번째 wave** — zone-aware sweep 패턴 15번째 atomic 자동 도달, early-return 구조 (`if (isDesktop) { return }`) 첫 사례 + helper shared zone (양 view 공용 변환) 첫 사례 패턴 박제.

## User Decisions (승계 — wdc / 01h / a3v / c9s / cjn / gsh / h3z / hbv / iht / irl / jey / jxo / nkv / epe / f2w / 0hr-roadmap 재확인 불필요)

| ID  | 선택                                                           | 출처                              |
| --- | -------------------------------------------------------------- | --------------------------------- |
| (b) | **옵션 X** — 정확값 arbitrary `[Npx]` (시각 0 byte)             | wdc Phase B Task 2 결정            |
| (c) | **옵션 P** — `leading-none` 명시 보존 (본 wave 신규 적용 0건)   | wdc Phase B Task 2 결정            |
| (d) | **옵션 M + 색 변수만 N** — template literal conditional 우선    | wdc Phase B Task 2 결정            |
| -   | **a3v~f2w 15 wave 승계 적용** — 본 wave 재확인 없이             | 260528-0hr roadmap v2 locked-decisions |
| -   | **module-scope const N (SKELETON_STYLE)** — 정의 보존 + 직접 참조 6건 손대지 않음 | Wave 5 RemediationDetail + Wave 6 hbv + Wave 12a epe + Wave 13a f2w precedent |
| -   | **zone-aware sweep — 모바일 zone 만, 데스크톱 zone 14 보존**     | Wave 12a/13a 분할 패턴 14a 연속 적용  |
| -   | **early-return zone 분할 — helper pre-L325 shared zone 양 view 자동 적용** | 본 wave 신규 패턴 (12a/13a `{isDesktop ? : }` ternary 와 다름) |

## Before / After 카운트

| Metric                                                | Before | After  | Diff             |
| ----------------------------------------------------- | ------ | ------ | ---------------- |
| RemediationPage.tsx total `style={{`                  | **25** | **15** | **-10 (-40.0%)** |
| RemediationPage.tsx 모바일 zone `style={{`             | **11** | **1**  | **-10 (-90.9%)** |
| RemediationPage.tsx 데스크톱 zone `style={{`           | **14** | **14** | **= (보존)**     |
| SKELETON_STYLE const def                               | **1**  | **1**  | **= (보존)**     |
| TypeScript errors                                     | 0      | 0      | =                |
| 비즈 anchors (9 onClick / 2 useState / 2 useQuery / 1 useNavigate / 1 useSearchParams / 2 fetch) | IDENTICAL | IDENTICAL | = |
| 비표준 색 토큰 (warning/safe/danger no-suffix)         | 0      | 0      | =                |
| emoji 변동 (RemediationPage 는 이미 Lucide 적용 완료)    | 0      | 0      | =                |
| 변경 파일 수 (1 .tsx 외 off-scope)                     | 0      | 0      | =                |
| File 라인 수                                          | 724    | 638    | -86 (net)        |

## 모바일 zone sweep 매핑 (10건 변환 + 1건 옵션 N 잔존)

### Pre-L325 helpers (shared) — 5건 변환

renderCard (helper, L167-) + filterBar (helper, L244-) 안의 inline 정의 (한 곳에만 존재 — 양 view 공용 호출).

| Before Line | 위치                              | Before (요약)                                                                                       | After (요약)                                                              | 옵션 |
| ----------:| --------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----:|
| L183       | renderCard 색바                    | 2-prop bg(status conditional)+alignSelf                                                              | `w-1 rounded-[2px] shrink-0 self-stretch ${record.status === 'open' ? 'bg-fire-bar' : 'bg-safe-bar'}` | M+token |
| L247       | filterBar 외부 wrap                | 1-prop bg(var)                                                                                       | `shrink-0 border-b border-border-default bg-surface-raised` (병합)         | token |
| L255       | filterBar STATUS_TABS 버튼         | 8-prop flex/height/border/fontSize/fontWeight/cursor/transition/bg+color+borderBottom(3-conditional) | `flex-1 h-11 border-0 text-[13px] font-semibold cursor-pointer transition-colors duration-[130ms] border-b-2 ${statusTab === tab.key ? 'bg-surface-active text-text-primary border-accent' : 'bg-transparent text-text-tertiary border-transparent'}` | M+X+token |
| L280       | filterBar category select          | 9-prop flex/height/bg/border/borderRadius/color/fontSize/padding/cursor/minWidth                     | `flex-1 h-9 bg-surface-sunken border border-border-strong rounded-sm text-text-primary text-[12px] px-2 cursor-pointer min-w-0` | X+token |
| L301       | filterBar PERIOD_BUTTONS 버튼      | 9-prop height/padding/borderRadius/border/fontSize/fontWeight/cursor/whiteSpace/bg+color(2-cond)     | `h-7 px-3 rounded-sm border-0 text-[12px] font-bold cursor-pointer whitespace-nowrap ${days === btn.value ? 'bg-surface-active text-text-primary' : 'bg-transparent text-text-tertiary'}` | M+X+token |

### Post-L537 mobile-only — 5건 변환 + 1건 옵션 N 잔존

| Before Line | 위치                              | Before (요약)                                                                                       | After (요약)                                                              | 옵션 |
| ----------:| --------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----:|
| L548       | mobile filter bar wrap             | 4-prop bg(var)+position(sticky)+top+zIndex                                                          | `shrink-0 border-b border-border-default bg-surface-raised sticky top-0 z-10` (병합) | token |
| L556       | mobile STATUS_TABS 버튼            | L255 와 IDENTICAL (mobile 분기 안)                                                                  | L255 와 동일 className 변환 (M+X+token)                                    | M+X+token |
| L581       | mobile category select             | L280 와 IDENTICAL (mobile 분기 안)                                                                  | L280 와 동일 className 변환 (X+token)                                       | X+token |
| L605       | mobile PERIOD_BUTTONS 버튼         | L301 + `transition: 'all 0.15s'` (10-prop)                                                          | L301 className + `transition-all duration-150` 추가                        | M+X+token |
| L629 → L547 (after) | mobile list scrollbar      | `style={{ scrollbarWidth: 'none' } as React.CSSProperties}`                                          | **inline 잔존 (옵션 N)** — Tailwind 기본 클래스 없음                        | **N** |
| L668       | mobile card 색바                   | 2-prop bg(status conditional)+alignSelf (L183 와 동일 패턴)                                          | L183 와 동일 className 변환                                                | M+token |

## 옵션 N (의도 inline) 잔존 1건

| Line (After) | 위치                  | 잔존 prop                                                                | 사유                                                                                  |
| ----:        | --------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| L547         | mobile list scrollbar | `{ scrollbarWidth: 'none' } as React.CSSProperties`                       | Tailwind 기본 클래스 없음 (non-standard CSS property). 데스크톱 L297 도 동일 패턴이나 desktop zone 보존 룰로 자동 유지 (총 page 전체 2건) |

## 데스크톱 zone 보존 14건 (변경 0 — Wave 14b 후행)

`if (isDesktop) { ... }` 블록 안 (원래 L325-L537 / 변환 후 L281-L493):

| Line (Before) | Line (After) | 영역                                                                                       | inline |
| -----------:| -----------:| ------------------------------------------------------------------------------------------ | -----: |
| L341        | L297        | desktop list scrollbar `{ scrollbarWidth: 'none' }`                                          | 1      |
| L371        | L327        | detail-empty `{ fontSize: 13 }`                                                              | 1      |
| L379        | L335        | detail-pane `{ padding: '20px 28px', boxSizing, scrollbarWidth }`                            | 1      |
| L401        | L357        | kv-table `{ width: '100%', borderCollapse, marginBottom: 20 }`                               | 1      |
| L414        | L370        | th (label, dynamic loop) 9-prop                                                              | 1      |
| L416        | L372        | td (value, dynamic loop) 7-prop                                                              | 1      |
| L444        | L400        | th 조치일시 (resolved branch)                                                                | 1      |
| L445        | L401        | td 조치일시                                                                                  | 1      |
| L448        | L404        | th 조치자                                                                                    | 1      |
| L449        | L405        | td 조치자                                                                                    | 1      |
| L452        | L408        | th 조치 내용                                                                                 | 1      |
| L453        | L409        | td 조치 내용                                                                                 | 1      |
| L456        | L412        | th 소모 자재                                                                                 | 1      |
| L457        | L413        | td 소모 자재                                                                                 | 1      |
| **합계**    |              |                                                                                            | **14** |

> Wave 14b 가 위 14건 처리 책임 (kv-table th/td 11건 + scrollbar 1 + detail-empty fontSize 1 + detail-pane padding 1). 본 wave 는 모두 보존 (시각 0 byte / 비즈 anchor IDENTICAL). diff hunk 분석으로 데스크톱 zone 영역 (원래 L325-L537) 의 +/- 라인 0건 확인 (shell loop overlap check, 출력 empty).

## SKELETON_STYLE module const N 보존 (정의 + 직접 참조 6건)

| 종류              | 위치 (Before / After) | 보존 형태                                                  |
| ----------------- | --------------------- | ---------------------------------------------------------- |
| const def         | L109-114 (변경 0)     | `const SKELETON_STYLE: React.CSSProperties = { ... }`     |
| desktop list 참조 | L343 × 3 / L299 × 3   | `<div style={SKELETON_STYLE} />` (이미 inline 아님)         |
| mobile list 참조  | L633-635 × 3 / L551-553 × 3 | `<div style={SKELETON_STYLE} />` (이미 inline 아님) |

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

## 자동 검증 결과 (9 게이트 모두 PASS)

| Verify gate                                            | Result    |
| ------------------------------------------------------ | --------- |
| 1. `style={{` total 14-16                              | **15** ✓ (within range; 14 desktop + 1 N잔존) |
| 2. `style={{` 데스크톱 zone = 14                        | **14** ✓ (L281-L493 보존)        |
| 3. 비즈 anchor diff = 0                                | **EMPTY** ✓ (10 anchors all IDENTICAL) |
| 4. onClick precise diff = 0                            | **EMPTY** ✓ (7 unique handlers all preserved) |
| 5. emoji 변동 = 0                                       | **0** ✓ (RemediationPage Lucide 적용 완료, before=0/after=0)   |
| 6. 비표준 색 토큰 (warning/safe/danger no-suffix) = 0   | **0** ✓   |
| 7. SKELETON_STYLE const def = 1                        | **1** ✓ (정의 보존, 직접 참조 6건 손대지 않음) |
| 8. diff hunk 데스크톱 zone 영역 변경 = 0                | **0 touched** ✓ (8 hunks 모두 L179/242/277/298 (pre-L325) 또는 L543/578/602/664 (post-L537)) |
| 9. TypeScript `error TS` count = 0                     | **0** ✓   |
| 10. 변경 파일 = 1 .tsx 만 (off-scope = 0)               | **0 off-scope** ✓ |

## Commit

| Hash        | Subject                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `<TBD>`     | feat(260529-gj2-01): Phase B Wave 14a — Remediation 모바일 zone (11 inline) → tailwind            |

## Phase B Tier 1 종결 + Tier 2 진입 (Wave 1~14a 누적)

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
| **14a** | **Remediation 모바일 zone (Tier 2 세 번째 wave)** ← 이번 | **25 → 15 (모바일 11→1)** | -                    | **`<TBD>`**   |
| **합계 (14a)** | **18 페이지**                                  | **693 → 248 (-64.2%)**  | **37 → 0 (Phase A 완결)** | **14 atomic commits** |

### Tier 2 진행 — zone-aware sweep 패턴 15번째 atomic 자동 도달 + 새 패턴 박제

1. **early-return zone 분할 (신규 패턴 첫 사례)** — `if (isDesktop) { return (...) }` 구조의 데스크톱 분기 (L325-L537, 14건) 전체 보존, default mobile return (L540~) 만 변환. 12a/13a 의 `{isDesktop ? : }` ternary 구조와 다른 패턴
2. **helper shared zone (신규 패턴 첫 사례)** — renderCard (L167) + filterBar (L244) 안의 inline 정의는 pre-L325 한 곳에만 존재. desktop view 가 `{filterBar}` 로 호출 → 한 번 변환으로 양 view 자동 적용 (의도된 부수효과, desktop zone 보존 룰 위반 아님)
3. **데스크톱 zone 14곳 절대 변경 0** — Wave 14b 후행. kv-table th/td 11 + scrollbar 1 + detail-empty fontSize 1 + detail-pane padding 1. diff hunk 분석으로 데스크톱 영역 +/- 라인 0건 확인 (shell loop overlap check empty)
4. **SKELETON_STYLE module const N 적용 일관** — 정의 보존 (1 const def), 직접 참조 6건 (desktop 3 + mobile 3) 손대지 않음. 옵션 N spread 패턴 0건 (RemediationPage 는 select 류 없음)
5. **단일 atomic commit 패턴 15회 자동 도달** — Wave 1~13a + 14a 모두 atomic, 15번째 (Remediation 11+0) 까지 단일 atomic 적용
6. **시각 0 byte 룰 100% 유지** — 14 wave 모두 PWA build 성공 + 비즈 anchor IDENTICAL + 비표준 색 토큰 0
7. **L301 vs L605 transition prop 차이 명시 매핑** — desktop helper (L301) `transition: 'color .13s'` → `transition-colors duration-[130ms]` / mobile inline (L605) `transition: 'all 0.15s'` → `transition-all duration-150` 추가. 두 inline 의 transition 거동 차이 보존

### 다음 단계 (Tier 2 진행)

- **Wave 14b** — RemediationPage 데스크톱 zone 14곳 sweep (kv-table th/td 11 + scrollbar 1 + detail-empty fontSize 1 + detail-pane padding 1)
- Wave 15a/15b — 모바일/데스크톱 분할 페이지 후속 (본 wave early-return + helper shared 패턴 reference 강화)
- 옵션 X+P+M+색변수N + module const N 룰 그대로 승계

## 메모리 anchor 적용

| anchor | 적용 |
| ------ | ---- |
| `feedback_tailwind_w8_h8_is_48px.md` | h-7=32 (PERIOD_BUTTONS) / h-9=36 (category select) / h-11=44 (STATUS_TABS) spacing override 인지 + standard. w-1 (4px) 색바 단순 케이스 |
| `feedback_tailwind_token_class_pattern.md` | bg-fire-bar / bg-safe-bar / bg-accent / border-accent / bg-surface-* / border-border-* / text-text-* — status- prefix 없음, lucide 사이즈 prop 패턴 (Inbox/AlertCircle/Download/Camera size={N}) Phase A 완결 보존 |
| `feedback_text_caption_leading_none.md` | text-[13px] / text-[12px] arbitrary 채택 (text-caption lh:1.5 작은 컨테이너 영향 회피). 본 wave 모바일 zone 의 변환 대상은 대부분 input/button 류 (라벨 케이스 X) → leading-none 신규 적용 0건 (이미 다른 곳에 적용된 leading-none 은 변경 0) |
| `feedback_design_changes_ask_first.md` | 시각 0 byte 룰 100% — verify gate 9개 모두 PASS, 데스크톱 zone 14건 보존 |
| `feedback_check_branch_before_edit.md` | worktree base 검증 (main HEAD = 34aca1d, agent worktree OK) |
| Wave 5 (db728c0) RemediationDetail precedent | 같은 페이지 family Phase B 룰 일관 적용 |
| Wave 11 nkv / 12a epe / 13a f2w (token alias 일괄 매핑) | tokens.css alias 그대로 활용 (var(--surface-* / text-* / border-* / status-* 등 일괄 className 변환) |
| Wave 6 hbv + 12a epe + 13a f2w (module const) precedent | SKELETON_STYLE 정의 보존 + 직접 참조 손대지 않음 룰 그대로 적용 (4번째 atomic) |

## Self-Check: PASSED

- RemediationPage.tsx 변경 (file:/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/src/pages/RemediationPage.tsx) — FOUND
- commit hash `<TBD>` — pending commit
- emoji 보존 (0건) verify gate — PASSED
- 비즈 anchor diff = 0 line — PASSED
- TypeScript = 0 error — PASSED
- off-scope 변경 = 0 — PASSED
- SKELETON_STYLE const def = 1 — PASSED
- 데스크톱 zone 14곳 보존 — PASSED (diff hunk 분석 + 데스크톱 영역 L325-L537 overlap check 출력 empty)
- 모바일 zone 11 → 1 (10 변환 + L547 옵션 N 잔존) — PASSED
