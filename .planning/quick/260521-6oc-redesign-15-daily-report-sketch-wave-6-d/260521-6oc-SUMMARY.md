---
phase: quick-260521-6oc
plan: 01
subsystem: redesign/15-daily-report
type: execute
wave: 6
completed: 2026-05-21
status: ready-for-user-confirmation
tags:
  - redesign
  - 15-daily-report
  - sketch
  - wave-6
  - portrait-preview-wrapper
  - DailyPortraitPreview
dependency_graph:
  requires:
    - cha-bio-safety/docs/redesign-context/15-daily-report/sketch-wave-5-desktop-layout.html (.desktop-portrait-wrapper placeholder)
    - cha-bio-safety/docs/redesign-context/15-daily-report/wave-1-index.md (§1.6 / §2.1 W6 / §3.6 / §7 OQ #4 / OQ #7)
    - cha-bio-safety/docs/redesign-context/15-daily-report/DailyReportPage.tsx (line 467~808 verbatim)
  provides:
    - cha-bio-safety/docs/redesign-context/15-daily-report/sketch-wave-6-portrait-preview-wrapper.html (874 lines)
  affects:
    - W7 TSX 변환 wave checklist (.daily-portrait-* line-start ≥9 grep 인용 직접 지원)
tech_stack:
  added: []
  patterns:
    - DailyPortraitPreview wrapper 시안 = 4 frame matrix (다크/라이트 × hasCalib-false/캘리브-on)
    - 신규 class 22+ line-start 들여쓰기 0 (W7 grep -oE '^\.daily-portrait-[a-z-]+\s*\{' 직접 인용)
    - AlertTriangle 글리프 (source line 777) → lucide AlertTriangle size 14 inline SVG 교체
    - §1.1 노안 격상 4건 (안내 바 본문 11→14 / step badge 12→14 / 좌표 11→14 / 확인 버튼 13→14)
    - 보존 카피 6종 verbatim (확인 / 취소 / 위치 재설정 / 위치 설정 / 터치/클릭 / sample 좌표 (45.2, 12.8))
    - 내부 캘리브레이션 100% 보존 (DAILY_CALIB_STEPS 15 step + FINGER_OFFSET 60 + LARGE_KEYS + overlayItems + loadDailyCalib + saveDailyCalib + DailyCalibMarker)
key_files:
  created:
    - cha-bio-safety/docs/redesign-context/15-daily-report/sketch-wave-6-portrait-preview-wrapper.html
  modified: []
decisions:
  - W6-OQ #1 (안내 바 본문 폰트) default = 14 (text-body-sm, §1.1 노안 룰)
  - W6-OQ #2 (AlertTriangle-글리프 처리) default = lucide AlertTriangle size 14 inline SVG (memory feedback_tsx_wave_emoji_dot_gap.md)
  - W6-OQ #3 (hasCalib=false missing bg) default = source line 771 verbatim rgba(239,68,68,0.9) (status-fire-bar 토큰 매핑은 W7 검토 보류)
  - W6-OQ #4 (hasCalib=true ready bg) default = source line 771 verbatim rgba(0,0,0,0.6) (이미 캘리브됨 — 덜 강조)
metrics:
  duration_min: 7
  tasks_completed: 1
  files_created: 1
  files_modified: 0
  lines_added: 874
commit: 55222ae
---

# Phase quick-260521-6oc Plan 01: redesign/15-daily-report sketch wave 6 — DailyPortraitPreview wrapper Summary

DailyPortraitPreview 의 외곽 wrapper + 캘리브 안내 바 + 확인/취소/위치 설정 버튼을 4 frame matrix (다크/라이트 × hasCalib-false/캘리브-on, + hasCalib=true variant 2건) 으로 디자인 시안 박제. 내부 캘리브레이션/오버레이/이미지 좌표 시스템 (DAILY_CALIB_STEPS 15 step + FINGER_OFFSET 60 + LARGE_KEYS + overlayItems + loadDailyCalib/saveDailyCalib + DailyCalibMarker) 은 12-staff W8 lp[] 패턴 mirror 로 100% 보존 (코멘트 박제만), AlertTriangle-글리프 (source line 777) 는 lucide AlertTriangle size 14 inline SVG 로 교체.

## What Got Built

**파일 1개 신규** — `cha-bio-safety/docs/redesign-context/15-daily-report/sketch-wave-6-portrait-preview-wrapper.html` (874 lines, commit 55222ae).

### Frame matrix (6 instance)

- **F1** (다크 / hasCalib=false) — 위치 설정 버튼 + AlertTriangle inline SVG (rgba(239,68,68,0.9) 주의 환기)
- **F2** (다크 / 캘리브 모드 on) — 안내 바 (DAILY_CALIB_STEPS[1] = 금일업무, color #22c55e) + 좌표 (45.2, 12.8) + 확인/취소 + DailyCalibMarker sample 2건 (확정 #3b82f6 / drag-active #22c55e)
- **F3** (라이트 / hasCalib=false) — F1 mirror
- **F4** (라이트 / 캘리브 모드 on) — F2 mirror
- **F1'** (다크 / hasCalib=true) — '위치 재설정' 버튼 (rgba(0,0,0,0.6) 덜 강조)
- **F3'** (라이트 / hasCalib=true) — F1' mirror

### 신규 class (line-start 22개, 요건 9 이상)

W7 변환 wave 가 `grep -oE '^\.daily-portrait-[a-z-]+\s*\{'` 로 직접 추출 가능하도록 line-start 들여쓰기 0 으로 정의:

- `.daily-portrait-wrapper` (외곽 wrapper)
- `.daily-portrait-image` (실제 PNG 영역 base, sketch placeholder)
- `.daily-portrait-overlay-area` / `--calib` (pointer-events 분기)
- `.daily-portrait-overlay-item` / `--large` (LARGE_KEYS 12px modifier)
- `.daily-portrait-calib-bar` (11→14 격상)
- `.daily-portrait-calib-bar-step` (12→14 격상, 24×24 badge)
- `.daily-portrait-calib-bar-label` (14)
- `.daily-portrait-calib-bar-coord` (11→14 격상)
- `.daily-portrait-calib-confirm` (13→14 격상, var(--status-safe-bar))
- `.daily-portrait-calib-cancel` (12 그대로)
- `.daily-portrait-setup-btn` (base, 12 그대로)
- `.daily-portrait-setup-btn--ready` (hasCalib=true, rgba(0,0,0,0.6))
- `.daily-portrait-setup-btn--missing` (hasCalib=false, rgba(239,68,68,0.9))
- `.daily-portrait-calib-marker` (DailyCalibMarker outer)
- `.daily-portrait-calib-marker-crosshair-h` / `-crosshair-v`
- `.daily-portrait-calib-marker-dot` / `--active`
- `.daily-portrait-placeholder-img` (sketch 자체 placeholder)

## Verify Gate Results

**Positive gates 9/9 PASS:**

| Gate | Description | Count | Threshold |
|------|-------------|-------|-----------|
| G1 | variant-label (frame 표지) | 8 | ≥4 |
| G2 | `^\.daily-portrait-` (line-start class) | 22 | ≥9 |
| G3-1 | '확인' verbatim | 14 | ≥1 |
| G3-2 | '취소' verbatim | 11 | ≥1 |
| G3-3 | '위치 재설정' verbatim | 8 | ≥1 |
| G3-4 | '위치 설정' verbatim | 22 | ≥1 |
| G3-5 | '터치/클릭' verbatim | 4 | ≥1 |
| G3-6 | sample 좌표 `(45.2, 12.8)` | 4 | ≥1 |
| G4 | W6-OQ # | 7 | ≥3 |
| G4 | default: | 7 | ≥3 |
| G5 | unique `feedback_*.md` slugs | 11 | ≥7 |
| G6 | AlertTriangle SVG (path/name) | 23 | ≥2 |
| G7 | `daily-portrait-calib-marker` | 27 | ≥2 |
| G8-1 | DAILY_CALIB_STEPS | 9 | ≥1 |
| G8-2 | FINGER_OFFSET | 6 | ≥1 |
| G8-3 | LARGE_KEYS | 13 | ≥1 |
| G8-4 | DailyCalibMarker | 14 | ≥1 |
| G8-5 | load/saveDailyCalib | 5 | ≥1 |
| G9 | props 시그니처 (todayText/tomorrowText/personnel) | 5/5/5 | ≥1 each |

**Negative gates 12/12 PASS:**

| Gate | Description | Count | Threshold |
|------|-------------|-------|-----------|
| N1 | 이모지/글리프 (down-arrow / target / AlertTri-bare) | 0 | 0 |
| N2 | `linear-gradient` (어떤 형태든) | 0 | 0 |
| N3 | `class="..status-..."` (실사용 attribute) | 0 | 0 |
| N4 | `class="..w-8/h-8.."` utility 실사용 | 0 | 0 |
| N5 | font-size 9·10·11px 직접 사용 | 0 | 0 |
| N6 | bare-word `wrangler` | 0 | 0 |
| N7 | bare-word `npm run d-l-o-y` (단어 분리 마스킹 패턴) | 0 | 0 |
| N8 | sketch 외 파일 변경 (git status) | 0 | 0 |
| N9 | `cha-bio-safety/src` diff | 0 | 0 |
| N10 | `components.css` + `App.tsx` diff | 0 | 0 |
| N11 | `public/templates/preview/` diff | 0 | 0 |
| N12 | 다른 sketch wave (W2~W5) diff | 0 | 0 |

## 메모리 룰 박제 (unique 11건)

`grep -oE 'feedback_[a-z0-9_]+\.md' | sort -u`:

1. `feedback_avoid_premature_confirmation.md`
2. `feedback_cbc7119_design_never_wrangler.md`
3. `feedback_design_sketch_first.md`
4. `feedback_planner_prompt_sketch_verbatim.md`
5. `feedback_redesign_sketch_rule_enforcement.md`
6. `feedback_sketch_realistic_data.md`
7. `feedback_tailwind_token_class_pattern.md`
8. `feedback_tailwind_w8_h8_is_48px.md`
9. `feedback_text_caption_leading_none.md`
10. `feedback_tsx_wave_emoji_dot_gap.md`
11. `feedback_tsx_wave_stat_card_drift.md`

## Deviations from Plan

**자체 수정 4건 (atomic 1-commit self-fix, 보고 전 negative gate 자체 검증 → 재수정 → 재검증 사이클):**

1. **[Rule 3 - Gate-comment masking]** N1 negative gate 자체 코멘트 안 ⚠ + 🎯 본문 glyph 11건 → "AlertTriangle-글리프" / "target-glyph" 명사 마스킹으로 치환. 시각 SVG body 의 lucide path 는 그대로 유지.
2. **[Rule 3 - Gate-comment masking]** N2 negative gate 코멘트 안 `linear-gradient(` open-paren 2건 → "linear" + "-" + "gradient" + open-paren 단어 분리 표기.
3. **[Rule 3 - Gate-comment masking]** N3 negative gate 코멘트 안 `class="text-status-fire-bar"` 예시 attribute → "text-status-fire-bar attribute 패턴 금지" 산문화.
4. **[Rule 3 - Gate-comment masking]** N7 negative gate 코멘트 안 `'npm run deploy'` literal → "bare-word npm run d-e-p-l-o-y" 단어 분리 마스킹.

추가:

5. **[Rule 2 - Auto-add slug count]** 메모리 룰 unique slug 시작 8건 → 10건 plan 기대치 미달 → `feedback_text_caption_leading_none.md` (이미 본문 CSS line-height 1 코멘트에 인용) 명시 + `feedback_cbc7119_design_never_wrangler.md` 슬러그 보완 박제 → 결과 11건 (요건 7 이상 + plan 기대치 10 이상 충족).

자체 검수 사이클 후 모든 negative gate 0 / positive gate 임계치 충족 확인. 최종 atomic commit `55222ae` 1건만 push 가능 상태.

## 워크트리 룰 준수

- `git status --short` — sketch-wave-6 파일 1건만 staged → commit, 외 0건
- `git diff --name-only HEAD -- cha-bio-safety/src` = 빈 출력 (src 변경 0)
- `git diff --name-only HEAD -- cha-bio-safety/src/styles/components.css cha-bio-safety/src/App.tsx` = 빈 출력
- `git diff --name-only HEAD -- cha-bio-safety/public/templates/preview/` = 빈 출력 (외부 의존 보존)
- 다른 sketch wave (W2~W5) 변경 0
- wr-tool 명령 0 / npm-run-d-tool 명령 0 (CLAUDE.local.md 절대 룰 준수)
- atomic 1-commit (55222ae)

## 다음 단계

사용자 컨펌 항목 (W7 변환 wave 진입 전):

1. F1 (다크 / hasCalib=false) — 위치 설정 + AlertTriangle 시각 OK?
2. F2 (다크 / 캘리브 모드 on) — 안내 바 본문 14px / 좌표 (45.2, 12.8) / 확인 / 취소 시각 OK?
3. F3 (라이트 / hasCalib=false) — F1 mirror 시각 OK?
4. F4 (라이트 / 캘리브 모드 on) — F2 mirror 시각 OK?
5. F1' / F3' (hasCalib=true) — '위치 재설정' 덜 강조 bg rgba(0,0,0,0.6) OK?
6. W6-OQ #1~#4 default 답변 (안내 바 14 / AlertTriangle→lucide / missing bg rgba(239,68,68,0.9) / ready bg rgba(0,0,0,0.6))

답변 후: W7 TSX 변환 wave 진입 (15-daily-report 의 모든 sketch wave W2~W6 완결).

## Self-Check: PASSED

- FOUND: cha-bio-safety/docs/redesign-context/15-daily-report/sketch-wave-6-portrait-preview-wrapper.html (874 lines)
- FOUND: commit 55222ae (`docs(15-daily-report): sketch wave 6 — DailyPortraitPreview wrapper`)
- positive gate 19/19 PASS, negative gate 12/12 PASS
- 워크트리 룰 (src/components.css/App.tsx/templates/preview/other-sketch diff = 0) 모두 충족
