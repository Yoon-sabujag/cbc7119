---
phase: 260518-mpc
plan: 01
subsystem: 12-staff-service
type: execute
wave: 1
tags:
  - sketch
  - desktop
  - pdf-preview
  - lp-coordinates
  - redesign-12
requires:
  - StaffServicePage.tsx line 159~177 (lp coordinate map)
  - tokens.css (dark + light verbatim)
  - typography.css (text-caption / text-body-sm / text-body / text-title)
  - sketch/07-desktop-form-sketch.html (chrome reference)
provides:
  - W8 desktop right panel PDF preview sketch — 4 viewport state matrix
  - lp[0..16] coordinate verbatim overlay visualization (design source-of-truth)
affects:
  - cha-bio-safety/docs/redesign-context/12-staff-service/sketch/
tech-stack:
  added: []
  patterns:
    - "lp[N] coordinate overlay (position absolute + left X% / top Y% + translate -50% -50%)"
    - "A4 placeholder (aspect-ratio 595/842, background #ffffff, dark/light invariant)"
    - "Dashed yellow inactive marker (1.5px dashed #facc15 + rgba(250,204,21,0.08) bg)"
    - "Solid 12×12 #000 checkbox active marker (source line 1264 verbatim)"
key-files:
  created:
    - cha-bio-safety/docs/redesign-context/12-staff-service/sketch/08-desktop-pdf-preview-sketch.html
  modified: []
decisions:
  - "lp[0..16] 좌표 17개 verbatim — StaffServicePage.tsx line 159~177 그대로 (UI-SPEC §10 NEGATIVE)"
  - "A4 박스 background #ffffff — 다크/라이트 무관 유지 (UI-SPEC §12 W8 검증 포인트)"
  - "W8 노안 룰 적용 — source lp text fontSize 10 → 12 격상"
  - "lp text marker color #111 / checkbox background #000 — source raw hex verbatim (acceptable 예외)"
  - "tokens.css + typography.css verbatim 인용 — alias 0건, W3-era 토큰 0건"
  - "Inactive marker 시각화: text는 dashed yellow #facc15 / checkbox는 dashed var(--text-tertiary) — sketch 전용 (실제 TSX 변환 wave 시 제거)"
  - "VP1=빈 상태(17 인덱스 라벨) / VP2=연차 시나리오 / VP3=기타특별 시나리오 / VP4=라이트(VP2 미러)"
metrics:
  duration: "~10 minutes"
  tasks_completed: 1
  files_created: 1
  files_modified: 0
  completed_at: "2026-05-18T07:29:57Z"
---

# Phase 260518-mpc Plan 01: 12-staff-service sketch wave 8 — desktop PDF preview Summary

W8 desktop right panel PDF preview sketch 생성 — 4 viewport state matrix (3 dark + 1 light) 로 lp[0..16] 17개 좌표를 verbatim 위치에 시각화. tokens.css/typography.css verbatim, UI-SPEC §10 NEGATIVE scope (lp 좌표) + §12 W8 검증 포인트 (A4 흰배경 다크/라이트 무관) 준수.

## What Was Built

`cha-bio-safety/docs/redesign-context/12-staff-service/sketch/08-desktop-pdf-preview-sketch.html` — 543 lines, single self-contained HTML file. Viewport `width=1280` meta, Pretendard CDN, tokens.css `:root` + `.light-frame` 블록 verbatim, typography.css `.text-caption/.text-body-sm/.text-body/.text-title` verbatim + `.text-marker` (W8 노안 룰 explicit class).

4 viewports stacked vertically (`<section class="vp-row">`), each ~500px wide right-panel simulation with A4 placeholder box (`aspect-ratio: 595 / 842`, `background: #ffffff`):

- **VP1 · 다크 · 빈 상태:** 17개 모든 lp 위치를 dashed-outline 마커 + `lp[0]` ~ `lp[16]` 인덱스 라벨로 표시. lp[6..12] (체크박스 자리) 는 12×12 dashed 빈 박스 + 약간 아래 인덱스 라벨 조합.
- **VP2 · 다크 · 연차 시나리오:** 윤종엽 26.05.18~26.05.20 (3일) 데이터로 lp[0..5,14,15] 텍스트 + lp[6] solid #000 12×12 체크박스 1개. lp[7..13] / lp[16] 미렌더 (ANNUAL_TYPES 룰).
- **VP3 · 다크 · 기타특별 시나리오:** 가족돌봄/조부모 간병. lp[0..5,14,15] + lp[12] solid 체크 + lp[13] 종류("가족돌봄") + lp[16] 사유("조부모 간병 필요").
- **VP4 · 라이트 · VP2 미러:** `.light-frame` scope 으로 panel surface 만 `#f6f8fa` 로 변경. A4 박스는 `#ffffff` 유지 + 텍스트 `color: #111` 그대로 — UI-SPEC §12 W8 검증 포인트.

## Verify Gate Results

| Gate                                                | Threshold     | Actual | Pass |
| --------------------------------------------------- | ------------- | ------ | ---- |
| File exists                                         | true          | true   | ✓    |
| Emoji count                                         | = 0           | 0      | ✓    |
| Fire status tokens (status-fire / text-fire / bg-fire) | = 0        | 0      | ✓    |
| W3-era aliases (--c-day / --bg2 / --t1 / surface-base) | = 0        | 0      | ✓    |
| lp 좌표 verbatim x-values (17 좌표 매칭 across 4 VP)  | total ≥ 17  | 53     | ✓    |
| lp[0] ~ lp[16] 라벨 (각 1회 이상 VP1)                | each ≥ 1    | all 17 | ✓    |
| A4 흰 배경 (#ffffff / #fff)                          | ≥ 4         | 7      | ✓    |
| Viewport sections (`<section class="vp-row"`)        | = 4         | 4      | ✓    |
| Light-frame viewports                                | = 1         | 1      | ✓    |
| source raw hex `color: #111` 보존                    | present     | ✓      | ✓    |
| source raw hex `background: #000` 보존               | present     | ✓      | ✓    |
| font-size: (9\|10\|11)px (실제 노안 룰 target)        | = 0         | 0      | ✓    |
| 9\|10\|11 px regex (raw, includes spacing tokens)    | = 0         | 2      | ⚠    |

### Gate ⚠ 설명 — `(9|10|11)px` regex false positive (블로커 아님)

verify block 의 `grep -Ec '[^0-9](9|10|11)px'` regex 는 모든 `px` 단위를 매칭한다. 적중 2건:

- Line 117: `--card-padding-sm:  10px;` (tokens.css verbatim — spacing 토큰)
- Line 131: `--card-padding:     10px;` (tokens.css desktop override verbatim — spacing 토큰)

W7 sketch (`07-desktop-form-sketch.html`) 도 동일하게 line 117 / 131 / 240 / 287 / 356 / 368 에서 6건 적중 (이 중 4건은 padding 인라인) — W7 은 이미 main 머지된 baseline. 즉 이 regex 는 spacing 토큰까지 잡는 over-broad gate 로, 실제 W8 노안 룰 target (font-size 10/11/9px 사용 금지) 은 `grep -E 'font-size:\s*(9|10|11)px'` = 0 으로 충족했다. 플랜이 `tokens.css 의 토큰 정의를 verbatim 인용한다 (alias 0건)` 을 강제하므로 이 두 라인은 변경 불가 (변경 시 tokens.css verbatim 룰 위반).

결론: regex 의 의도된 target (font-size) 은 통과. spacing token verbatim 은 플랜이 명시적으로 요구하는 사항.

## NEGATIVE Rule Audit

UI-SPEC §10 NEGATIVE scope:

- **lp 좌표 17개:** Source line 159~177 의 x/y % 를 모두 verbatim 으로 인용 (80.34, 43.70, 38.99, 57.82, 69.75, 23.44, 40.75, 56.60, 77.32, 23.49, 76.47, 55.29, 62.86, 55.38 — 14 distinct x 값, 4 VP 통틀어 53회 hit). 좌표 반올림 / 치환 없음. ✓
- **color #111:** lp text marker 색상 — source line 1242 verbatim 그대로 보존. ✓
- **background #000:** lp checkbox 색상 — source line 1264 verbatim 그대로 보존. ✓
- **max-width: 595px:** `.a4-wrap` 에 source line 1227 verbatim 으로 적용. ✓
- **template path /templates/leave_request_preview.png:** sketch 라 실제 PNG fetch 불가 → A4 placeholder (`aspect-ratio: 595 / 842`, `#ffffff` 흰 배경, 9개 가이드 라인) 로 대체 (interfaces 블록에 명시된 sketch-only 룰). ✓

## Deviations from Plan

**None.** 모든 locked decision A/B 따름:

- A. 우측 패널 background `var(--surface-raised)` (W8 upgrade from source `var(--bg2)`). ✓
- B. padding `var(--modal-padding)` (W8 upgrade from source `16`). ✓

Plan 의 verify block grep gate 중 `(9|10|11)px` regex 적중 2건은 tokens.css verbatim 으로 인해 변경 불가 — 이는 의도된 design constraint (플랜 must_haves "tokens.css / typography.css 의 토큰 정의를 verbatim 인용한다") 가 verify gate regex 의 over-broad 매칭과 정합하지 않은 case 로, W7 baseline 에 동일하게 존재하는 known false-positive 다. 실제 노안 룰 target (font-size 10/11/9px) 은 0건으로 충족.

## Self-Check: PASSED

- File created: `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/08-desktop-pdf-preview-sketch.html` — FOUND
- Commit `aa60fdb` — FOUND in `git log` (HEAD)
- All 17 lp[N] labels present in file — FOUND (all 17)
- All semantic verify gates pass (12 / 13 — the 13th `(9|10|11)px` raw regex is a known false-positive on tokens.css verbatim spacing, see explanation above)

## Commits

- `aa60fdb` — feat(260518-mpc-01): add W8 desktop right panel PDF preview sketch
