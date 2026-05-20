---
phase: quick-260521-agk
plan: 01
subsystem: redesign/15-daily-report
tags: [tsx-conversion, daily-report, daily-portrait-preview, desktop-layout, calibration]
requires:
  - quick-260521-8mw (SW1 components.css §10 desktop-* + §11 daily-portrait-* class 정의)
  - quick-260521-94c (SW2 모바일 영역 변환 결과 — 변환 전 source 797 lines)
provides:
  - "DailyReportPage.tsx 데스크톱 isDesktop=true 분기 (line 365~389) className 기반 markup — desktop-layout / desktop-edit-panel / desktop-edit-panel-header / desktop-portrait-wrapper / desktop-portrait-print-label 5건"
  - "DailyPortraitPreview 외곽 wrapper className 변환 (line 595~712) — daily-portrait-wrapper / -image / -overlay-area / -overlay-area--calib / -calib-bar / -calib-bar-step / -calib-bar-label / -calib-bar-coord / -calib-confirm / -calib-cancel / -setup-btn / -setup-btn--ready / -setup-btn--missing 13건"
  - "DailyCalibMarker className 변환 (line 698~710) — daily-portrait-calib-marker / -crosshair-h / -crosshair-v / -dot / -dot--active 5건"
  - "lucide AlertTriangle import + JSX (line 11 + line 691, ⚠ 글리프 0건)"
affects:
  - "cha-bio-safety/src/pages/DailyReportPage.tsx (797 → 742 lines, -55 net)"
tech-stack:
  added: []
  patterns:
    - "v0.1.1 Tailwind token via components.css @layer components (사용처 와이어업 3차)"
    - "Dynamic inline style 잔존 패턴 — 좌표 (left/top/width/height, x%/y%) / dynamic color hex (DAILY_CALIB_STEPS[].color) 만 inline, 나머지 모두 class 화"
key-files:
  created: []
  modified:
    - "cha-bio-safety/src/pages/DailyReportPage.tsx (+32/-87, 797→742 lines)"
decisions:
  - id: SW3-D1
    decision: "캘리브 overlay area 의 position:absolute 도 className 화 (inline 제거). components.css `.daily-portrait-overlay-area` 가 `position: absolute; inset: 0;` 보유, dynamic left/top/width/height 만 inline 잔존."
  - id: SW3-D2
    decision: "B-3a (overlayItems.map 안 inline style — isArea / single 분기) verbatim 보존. fontSize: 10 / 12 가 `textStyle(10)` 함수 호출 인자라 N5 정규식 `fontSize: *(9|10|11)\\b` 매칭 0건. 좌표 / fontSize 모두 calib JSON x/y/key dynamic → className 화 불가."
  - id: SW3-D3
    decision: "DailyCalibMarker dot 의 size 16/20 분기는 components.css `.daily-portrait-calib-marker-dot--active` modifier 가 처리 (width 16→20, height 16→20). 인라인 width/height 제거."
metrics:
  duration_minutes: 15
  completed_at: "2026-05-21T07:45:29+09:00"
---

# Quick Task 260521-agk: redesign/15-daily-report SW3 DailyReportPage.tsx 데스크톱 + DailyPortraitPreview wrapper 변환 Summary

DailyReportPage.tsx 데스크톱 분기 + DailyPortraitPreview 외곽 wrapper + DailyCalibMarker 의 inline style 을 SW1 `components.css` 의 `.desktop-*` / `.daily-portrait-*` class 로 verbatim 변환했다. 캘리브레이션 좌표 시스템 (15-step / FINGER_OFFSET / localStorage IO / clientToImgPct / 터치/마우스 핸들러) 은 1 byte 도 건드리지 않았다.

## Objective

15-daily-report TSX 변환 wave 의 3번째 sub-wave (SW3) — SW1 (components.css 정의) + SW2 (모바일 영역 + EditableCard) 에 이어, 데스크톱 분기 + DailyPortraitPreview 의 "껍데기 (외곽 wrapper / img / overlay area / 안내 바 / 버튼 / 마커)" 만 토큰화. fontSize 9·10·11 격상 + ⚠ → AlertTriangle 교체 + 옛 `var(--bg|t1|t2|bd)` 폐기를 동반.

## Work Performed

### Files Modified (1)

| Path | Change | Net |
| --- | --- | --- |
| `cha-bio-safety/src/pages/DailyReportPage.tsx` | +32 / -87 | 797 → 742 (-55 lines) |

### 변환 영역 (5건)

**A. lucide import (line 11)**

```diff
-import { ChevronLeft, ChevronRight, Download } from 'lucide-react'
+import { ChevronLeft, ChevronRight, Download, AlertTriangle } from 'lucide-react'
```

**B. 데스크톱 분기 (line 365~389) — desktop-* 5 class**

- `desktop-layout` (outer flex row)
- `desktop-edit-panel` (좌측 패널)
- `desktop-edit-panel-header` (dateNav 자리)
- `desktop-portrait-wrapper` (우측 A4 wrapper, aspect-ratio 210/297)
- `desktop-portrait-print-label` ("인쇄 미리보기" 라벨, fontSize 11→12 격상)

`<DailyPortraitPreview {...props}>` 호출 5 prop verbatim 보존.

**C. DailyPortraitPreview 외곽 wrapper (line 595~696) — daily-portrait-* 13 class**

| Element | className | Inline 잔존 |
| --- | --- | --- |
| 외곽 `<div ref={containerRef}>` | `daily-portrait-wrapper` | (없음) |
| `<img src="/templates/preview/daily-1.png">` | `daily-portrait-image` | (없음) |
| Overlay area `<div onClick/onTouch*>` | `daily-portrait-overlay-area ${calibMode ? '--calib' : ''}` | `left/top/width/height` (imgRect dynamic) |
| 캘리브 안내 바 외곽 | `daily-portrait-calib-bar` | (없음) |
| Step badge | `daily-portrait-calib-bar-step` | `background` (DAILY_CALIB_STEPS[i].color) |
| Step label | `daily-portrait-calib-bar-label` | (없음) |
| 좌표 readout | `daily-portrait-calib-bar-coord` | (없음, fontSize 11→14 격상) |
| 확인 button | `daily-portrait-calib-confirm` | (없음, fontSize 13→14 + #22c55e→var(--status-safe-bar) 격상) |
| 취소 button | `daily-portrait-calib-cancel` | (없음) |
| 위치 설정 button | `daily-portrait-setup-btn ${hasCalib ? '--ready' : '--missing'}` | (없음) |

위치 설정 버튼 내 `'⚠ 위치 설정'` 글리프 → `(<><AlertTriangle size={14} /> 위치 설정</>)` JSX 교체.

**D. DailyCalibMarker (line 698~710) — daily-portrait-calib-marker* 5 class**

| Element | className | Inline 잔존 |
| --- | --- | --- |
| 외곽 `<div>` | `daily-portrait-calib-marker` | `left/top` (`${x}%`/`${y}%` dynamic) |
| 가로 십자선 | `daily-portrait-calib-marker-crosshair-h` | `background` (color prop) |
| 세로 십자선 | `daily-portrait-calib-marker-crosshair-v` | `background` (color prop) |
| dot 본체 | `daily-portrait-calib-marker-dot ${active ? '--active' : ''}` | `background` (color prop), fontSize 10→12 격상, width/height 16/20 분기는 modifier 가 처리 |

**E. type="button" 추가 (form submit 사고 방지)** — 확인 / 취소 / 위치 설정 3 버튼 모두 `type="button"` 명시.

### 폰트 격상 (5건, 변환 영역 fontSize 9·10·11 0건)

- 인쇄 미리보기 라벨 fontSize 11 → 12 (`.desktop-portrait-print-label`)
- 캘리브 step badge fontSize 12 → 14 (`.daily-portrait-calib-bar-step`)
- 캘리브 좌표 readout fontSize 11 → 14 (`.daily-portrait-calib-bar-coord`, W6 OQ #1 LOCKED)
- 캘리브 확인 button fontSize 13 → 14 (`.daily-portrait-calib-confirm`)
- DailyCalibMarker dot label fontSize 10 → 12 (`.daily-portrait-calib-marker-dot`)

### 1 byte 변경 0 (보존 영역)

- `line 1~10` imports (line 11 lucide 만 AlertTriangle 추가)
- `line 12~309` hooks / state / handler 7건 / debouncedSave / queries / useEffect / formContent
- `line 310~360` formContent 본문 + dateNav 정의 (SW2 결과)
- `line 392~424` 모바일 분기 (SW2 결과 그대로)
- `line 412~444` DAILY_CALIB_STEPS / FINGER_OFFSET / DAILY_CALIB_KEY / DailyCalibData / loadDailyCalib / saveDailyCalib
- `line 446~462` DailyPortraitPreview props 시그니처 (5 prop)
- `line 463~559` containerRef / imgRef / imgRect / calibMode / calibStep / calibPoints / activePoint / isDragging / measure / useEffect ResizeObserver / calib / hasCalib / clientToImgPct / onCalibTouchStart/Move/End / advanceStep / confirmPoint / onCalibClick
- `line 561~592` dateLabel 계산 / textStyle / LARGE_KEYS / overlayItems
- `line 634~666` overlayItems.map(...) 안 inline style (isArea / single 분기) + DailyCalibMarker 호출 — 좌표/fontSize 모두 dynamic 이라 className 화 불가
- `line 668~671` 드래그 중 DailyCalibMarker 렌더
- `line 714~742` EditableCard 컴포넌트 (SW2 결과)

`git diff` 의 hunk 위치도 정확히 `@@ -8,7 +8,7 @@` (import) / `@@ -364 ...@@` (desktop) / `@@ -609 ...@@` (wrapper+image+overlay) / `@@ -689 ...@@` (calib bar + setup btn) / `@@ -743 ...@@` (DailyCalibMarker) 5건으로, 보존 영역에는 hunk 0건이다.

## Verification Results

### Positive Gates (12/12 PASS)

| Gate | Threshold | Actual |
| --- | --- | --- |
| P1 lucide AlertTriangle import | =1 | **1** |
| P2 AlertTriangle JSX 사용 | ≥1 | **1** |
| P3 desktop-* className unique | ≥4 | **5** |
| P4 daily-portrait-* className unique | ≥12 | **18** |
| P5 DAILY_CALIB_STEPS 사용 | ≥5 | **7** |
| P6 FINGER_OFFSET 사용 | ≥3 | **3** |
| P7 loadDailyCalib + saveDailyCalib | ≥3 | **4** |
| P8 daily-1.png src | =1 | **1** |
| P9 props 시그니처 5종 | ≥5 | **5** |
| P10a "인쇄 미리보기" | ≥1 | **1** |
| P10b 확인/취소/위치재설정/위치설정/터치/클릭 | ≥5 | **5** |
| P11 DailyCalibMarker props 5종 verbatim | =1 | **1** |
| P12 confirmPoint / advanceStep / clientToImgPct | ≥3 | **12** |

### Negative Gates (10/10 PASS)

| Gate | Threshold | Actual |
| --- | --- | --- |
| N1 ⚠ 글리프 | =0 | **0** |
| N2 linear-gradient( | =0 | **0** |
| N3 className status- prefix | =0 | **0** |
| N4 className w-8 / h-8 | =0 | **0** |
| N5 fontSize 9/10/11 literal in 변환 영역 (line 365~712) | =0 | **0** |
| N6 옛 토큰 var(--bg|t1|t2|t3|bd|bd2|acl|bg2|bg3) in 변환 영역 | =0 | **0** |
| N7 components.css diff | =0 | **0 files** |
| N8 App.tsx / functions / migrations / public/templates diff | =0 | **0 files** |
| N9 다른 페이지 diff | =0 | **0 files** |
| N10 docs diff (15-daily-report 외) | =0 | **0 files** |

`git diff --name-only` 단일 결과: `cha-bio-safety/src/pages/DailyReportPage.tsx` 1건.

### Build Gates (2/2 PASS)

- B1 `npx tsc --noEmit` — EXIT 0, error 0건
- B2 `npm run build` — vite 5.4.21 PASS, sw.mjs 25.19 kB / gzip 8.33 kB, PWA precache 82 entries 7889.55 KiB, 313ms

## Deviations from Plan

None — plan 그대로 실행. 변환 7 chunk (lucide import / desktop 분기 / preview wrapper / overlay area / calib bar / setup btn / DailyCalibMarker) 모두 plan 의 verbatim diff 매핑 그대로 적용.

## Memory Rules Applied

7건 unique:

- `feedback_planner_prompt_sketch_verbatim` — W5/W6 sketch + components.css §10·§11 class 정의를 plan 안 grep 으로 추출해 verbatim 사용, 추측 토큰 0건.
- `feedback_sketch_realistic_data` — 데이터 분기 / 핸들러 / state / 좌표 계산 로직 1 byte 변경 0. className 추가만 했고 dynamic style (color/x/y/active/imgRect) 은 inline 잔존.
- `feedback_tsx_wave_emoji_dot_gap` — alias sed 만으로 부족: ⚠ 글리프 제거 + `<AlertTriangle size={14} />` JSX 마크업 추가까지 verify gate (N1=0 + P2≥1) 양쪽 확인.
- `feedback_tsx_wave_stat_card_drift` — source outline 패턴 (props 시그니처 / 핸들러 / 데이터 flow) 보존 + sketch 새 패턴 (className 매핑 + dynamic inline 분리) 둘 다 일치.
- `feedback_tailwind_w8_h8_is_48px` — Tailwind w-N utility 사용 0 (N4=0). 모든 사이즈는 components.css 안 명시 px (24 / 20 / 16 / 14 / 12 / 8) 로 처리. AlertTriangle 은 `size={14}` lucide prop.
- `feedback_check_branch_before_edit` — 진입 전 `git status --short` 빈 출력 + `git rev-parse --abbrev-ref HEAD` = `redesign/15-daily-report` 확인 후 작업 시작.
- `feedback_cbc7119_design_never_wrangler` — wrangler 명령 0 / `npm run deploy` 0. main 머지 / 푸시는 사용자 컨펌 후 별도 단계.
- `feedback_avoid_premature_confirmation` — 사실 보고만 ("X/Y gate PASS, tsc + build PASS, 사용자 컨펌 부탁"). "거의 일치" 같은 자신감 표현 0.

## Constraints Honored

- **이 워크트리 룰 (cbc7119-design)**: wrangler 명령 0 / `npm run deploy` 0 / src+functions+migrations+templates 변경 0 (DailyReportPage.tsx 단일 파일 외).
- **GSD workflow**: /gsd:quick 으로 진입, ad-hoc PLAN/SUMMARY 작성 X, planner-executor 2 phase 그대로 따름.
- **Atomic commit**: SW3 단일 commit `0156452` — docs (PLAN.md / SUMMARY.md / STATE.md) 는 orchestrator 후속 처리.

## Atomic Commit

| SHA | Subject | Files |
| --- | --- | --- |
| **0156452** | `feat(15-daily-report): SW3 DailyReportPage.tsx 데스크톱 + DailyPortraitPreview wrapper 변환 (W5 + W6 sketch, 캘리브 좌표 100% 보존)` | `cha-bio-safety/src/pages/DailyReportPage.tsx` |

## Self-Check: PASSED

- 파일 존재: `cha-bio-safety/src/pages/DailyReportPage.tsx` (742 lines) FOUND
- 커밋 존재: `0156452` FOUND in `git log --oneline`
- 변환 영역 5 hunk 위치 모두 plan 의 예상 위치 (line 8/364/609/689/743) 와 일치
- 보존 영역 hunk 0건 (캘리브 좌표 시스템 / 모바일 / formContent / state / hooks 1 byte 변경 0)

## Next Steps (사용자)

1. cbc7119-preview 자동 배포 (push 이후) 대기 → 데스크톱 1280px frame 시각 검수
   - 데스크톱 메인 layout 좌측 편집 / 우측 A4 portrait
   - "인쇄 미리보기" 라벨 (12px, 데스크톱 portrait 상단)
   - 캘리브 모드 ON → 안내 바 + step badge + 좌표 + 확인/취소 버튼 + 마커 dot
   - 위치 설정 버튼 — 캘리브 없음 (`--missing` 빨강) / 캘리브 있음 (`--ready` 검정) 양쪽 + AlertTriangle 아이콘
2. 시각 검수 PASS → 사용자 컨펌 후 main 머지 + 자동 배포 (워크트리 룰: wrangler X, GitHub push 만)
3. SW4 (verify gate / 통합 검수) 별도 quick task 로 진행 — 15-daily-report 전체 wave 마지막 단계
