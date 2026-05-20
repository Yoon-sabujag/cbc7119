---
phase: quick-260520-i7u
plan: 01
subsystem: redesign/14-reports
wave: 6
type: execute-summary
tags: [sketch, desktop, 1280px, a4-preview, preview-wrapper, white-bg-locked]
commit: de6e56f
files_created:
  - cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-6-desktop-preview-wrapper.html
files_modified: []
src_modifications: 0
deploy_commands: 0
verify_gate: PASS (negative 8 / positive 9 — total 17)
metrics:
  duration_minutes: ~10
  task_count: 1
  file_count: 1
  line_count: 1002
---

# Phase quick-260520-i7u Plan 01: redesign/14-reports sketch wave 6 (ExcelPreview 래퍼) Summary

One-liner: ReportsPage.tsx 우측 ExcelPreview wrapper 영역 시안 — `.preview-wrapper` + `.a4-preview` (다크/라이트 무관 A4 흰배경 #ffffff 고정, aspect-ratio 210/297, max-width 595px) × 4 frame matrix.

## Objective vs Outcome

| 항목 | Plan 요구 | 실제 결과 |
| --- | --- | --- |
| 산출 파일 | sketch-wave-6-desktop-preview-wrapper.html 1건 (14-reports/ 평면 sibling) | 완료 (1002 lines) |
| Frame matrix | 4 frame (다크 div-early / 다크 자탐 / 라이트 div-early / 라이트 자탐) | 4건 모두 1280px frame 렌더링 |
| A4 흰배경 | background: #ffffff 고정 (다크/라이트 무관 / W5 OQ #2 LOCKED) | CSS 정의 1건 + 4 frame annotation comment + 2 doc 참조 = 총 7건 grep hit |
| A4 비율 | aspect-ratio: 210 / 297 | CSS 정의 + doc 참조 총 3건 grep hit |
| 좌측 sidelist 분리 | W5 책임 dashed placeholder + selected row hint 1줄 | placeholder-sidelist 4건 (frame 별 1건) + W5 책임 라벨 17건 |
| 상단 toolbar 분리 | W4 책임 dashed bar 1줄 placeholder | placeholder-toolbar 4건 + W4 책임 라벨 9건 |
| ExcelPreview.tsx 손대지 않음 | 0 변경 | git diff src/ = 0 |
| atomic 1-commit | docs(14-reports): sketch wave 6 — 우측 ExcelPreview 래퍼 영역 (A4 흰배경 고정, 다크/라이트 1280px) | commit de6e56f |

## Frame matrix 4건 정리

| Frame | Theme | Selected reportType | A4 title | A4 meta | placeholder-sidelist-row hint |
| --- | --- | --- | --- | --- | --- |
| 1 | dark | div-early | 월초 유수검지 장치 점검표 | 2026년도 / 월별 점검 결과 | 월초 유수검지 장치 점검표 (selected) |
| 2 | dark | 자탐 | 자동화재탐지설비 점검일지 | 2026년도 / 자탐 카테고리 점검 | 자동화재탐지설비 점검일지 (selected) |
| 3 | light | div-early | 월초 유수검지 장치 점검표 | 2026년도 / 월별 점검 결과 | 월초 유수검지 장치 점검표 (selected) |
| 4 | light | 자탐 | 자동화재탐지설비 점검일지 | 2026년도 / 자탐 카테고리 점검 | 자동화재탐지설비 점검일지 (selected) |

A4 안 placeholder 본문 row (시각만 시연, 실제 ExcelPreview render 데이터 흉내 X):
- F1/F3: DIV-1, DIV-2, DIV-3, DIV-4, DIV-5, DIV-6 (6 row × 12 빈 cell)
- F2/F4: 소방용전원공급반, 연기감지기, 열감지기, 발신기, 수신기, 경종 (6 row × 12 빈 cell)

## .preview-wrapper + .a4-preview CSS 정의 verbatim 인용

```css
/* 우측 ExcelPreview wrapper outer — ReportsPage.tsx line 297~300 verbatim 매핑.
   source 인라인 style: { flex: 1, overflow: 'hidden', background: 'var(--bg)' }
   → token 격상: var(--bg) → var(--surface-page) */
.preview-wrapper {
  flex: 1;
  overflow: hidden;
  background: var(--surface-page);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px;
}

/* A4 미리보기 박스 — 다크/라이트 무관 흰배경 고정 (W5 OQ #2 LOCKED).
   비율 210/297 (= A4 mm 비율). max-width 595px (= A4 width 72dpi 환산). */
.a4-preview {
  width: 100%;
  max-width: 595px;
  aspect-ratio: 210 / 297;
  background: #ffffff;                /* 다크/라이트 무관 고정 */
  border: 1px solid var(--border-default);
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 32px 28px;
}

.a4-preview-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2328;                    /* A4 흰배경 위 검정 텍스트 고정 */
  text-align: center;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.a4-preview-meta {
  font-size: 12px;
  color: #656d76;
  text-align: center;
  margin-bottom: 24px;
  letter-spacing: 0.05em;
}

.a4-preview-table-placeholder {
  flex: 1;
  display: grid;
  grid-template-columns: 1.4fr repeat(12, 1fr);
  gap: 0;
  border: 1px dashed #d0d7de;
  border-radius: 2px;
  font-size: 12px;
  color: #656d76;
  align-items: center;
  justify-items: center;
  text-align: center;
  overflow: hidden;
}

.a4-preview-cell {
  padding: 8px 4px;
  border: 1px dashed #d0d7de;
  font-size: 12px;
  color: #656d76;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.a4-preview-cell--header {
  background: #f6f8fa;
  font-weight: 700;
  color: #1f2328;
}
```

## §6 verify gate 결과 (negative 8 + positive 9 = 17 total PASS)

### Negative gate (모두 expect 0 — 최종 grep PASS)

| # | 룰 | grep 결과 | Status |
| --- | --- | --- | --- |
| G1 | 이모지 (다운로드/체크/X/경고/페이지/타겟 류) | 0 | PASS |
| G2 | linear-gradient (그라데이션) | 0 | PASS |
| G3 | Tailwind (text\|bg)-status- prefix | 0 | PASS |
| G4 | Tailwind w-8 utility class | 0 | PASS |
| G4b | Tailwind h-8 utility class | 0 | PASS |
| G5 | font-size 9/10/11px 본문 | 0 | PASS |
| G6 | '선택된 보고서 없음' 류 빈 상태 텍스트 (W5 OQ #3 LOCKED) | 0 | PASS |
| G7 | 본문 가운뎃점 (mid-dot) 문자 | 0 | PASS |

### Positive gate

| # | 룰 | grep 결과 | 임계 | Status |
| --- | --- | --- | --- | --- |
| P1 | `.preview-wrapper {` CSS 정의 | 1 | ≥1 | PASS |
| P2 | `.a4-preview {` CSS 정의 | 2 (.a4-preview + .a4-preview-title 등 prefix 매치) | ≥1 | PASS |
| P3 | `aspect-ratio: 210` 명시 | 3 | ≥1 | PASS |
| P4 | `background: #ffffff` (CSS def + 4 frame annotation + 2 doc) | 7 | ≥4 | PASS |
| P5 | '월초 유수검지 장치 점검표' verbatim (F1+F3 + doc) | 8 | ≥2 | PASS |
| P6 | '자동화재탐지설비 점검일지' verbatim (F2+F4 + doc) | 8 | ≥2 | PASS |
| P7 | unique feedback_*.md 메모리 룰 | 10 | ≥7 | PASS |
| P8 | variant-label uses | 7 | ≥4 | PASS |
| P9 | 'W4 책임' placeholder 라벨 | 9 | ≥4 | PASS |
| P10 | 'W5 책임' placeholder 라벨 | 17 | ≥4 | PASS |

### Src safety

| 항목 | 결과 | Status |
| --- | --- | --- |
| cha-bio-safety/src/ 변경 라인 수 | 0 | PASS |
| wrangler 명령 실행 | 0 | PASS (CLAUDE.local.md 룰) |
| npm run deploy 실행 | 0 | PASS (CLAUDE.local.md 룰) |

## W5 → W6 LOCKED OQ 3건 적용 결과

| OQ | LOCKED 답 | W6 적용 |
| --- | --- | --- |
| #1 ExcelPreview 영역 = 단순 미리보기 자리 (내부 그리드 오버레이는 ExcelPreview.tsx 본체 책임) | LOCKED | .preview-wrapper 는 layout (flex/padding/center)만 / 내부 그리드 오버레이는 dashed placeholder grid 만 시연. ExcelPreview.tsx 본체 0 수정. |
| #2 A4 흰배경 고정 (다크/라이트 자동 전환 X) | LOCKED | `.a4-preview { background: #ffffff }` CSS 정의 + 4 frame markup 안 `<!-- A4 흰배경 고정: background: #ffffff -->` annotation comment 박제. F1/F2 다크 모드, F3/F4 라이트 모드 모두 A4 영역만 흰배경 유지 시각 확인용. |
| #3 빈 상태 UI 불필요 (sidelist 항상 default selected) | LOCKED | 4 frame 모두 div-early 또는 자탐 selected 상태로만 시연. '선택된 보고서 없음' 류 텍스트 0건 (G6 PASS). |

## W7 진입 전 OQ 2건 default 답 (별 의견 없으면 채택)

| OQ | default 답 | 근거 |
| --- | --- | --- |
| #1 .preview-wrapper + .a4-preview CSS class 박제 위치? | **(a) @layer components 안에 정의** — src/styles/components.css 에 박제, ReportsPage.tsx 는 className 사용 (기존 인라인 style 제거) | feedback_planner_prompt_sketch_verbatim 룰 — sketch CSS 그대로 박제. 추측 토큰 0건. |
| #2 W7 변환 wave sub-wave 분할? | **3 sub-wave** — (1) CSS layer 정의 신규 7 class / (2) 모바일 컴포넌트 (W2/W3) / (3) 데스크톱 컴포넌트 (W4/W5/W6) | 단일 PR 폭 제한 + 각 sub-wave 별도 검수 / 머지. 모바일/데스크톱 분기 격리. |

## 메모리 룰 박제 결과 (10건 unique 인용)

| # | 룰 | W6 컨텍스트 |
| --- | --- | --- |
| 1 | feedback_design_sketch_first.md | W6 가 W7 진입 전 마지막 ExcelPreview wrapper 컨펌 시안. A4 비율/max-width/padding 모두 본 시안 컨펌 후 W7 박제. |
| 2 | feedback_sketch_realistic_data.md | A4 안 placeholder title 2종 (REPORT_CARDS[0].title / REPORT_CARDS[8].title) verbatim. meta/본문 row 라벨은 시각 시연용 dashed grid placeholder, 실제 render 데이터 흉내 X. |
| 3 | feedback_planner_prompt_sketch_verbatim.md | W6 신규 CSS class 7건 모두 task_scope §source verbatim 정의 — W7 checklist 에 verbatim 인용 예정. |
| 4 | feedback_tailwind_token_class_pattern.md | status- prefix 0건. utility w-8/h-8 0건. CSS 정의는 var(--surface-page)/var(--border-default)/var(--text-tertiary) 토큰 직접 참조. |
| 5 | feedback_tailwind_w8_h8_is_48px.md | utility class w-8/h-8 0건. 모든 사이즈 인라인 명시 (260/595/32/28/16/8/4 px). |
| 6 | feedback_text_caption_leading_none.md | .a4-preview-meta (12px) / variant-label (12px monospace) / .placeholder-toolbar / .placeholder-sidelist 라벨 (12px monospace) 모두 line-height 1.6 또는 1 명시. |
| 7 | feedback_tsx_wave_emoji_dot_gap.md | 이모지 0건 (G1 PASS). 본 wave 에는 sub 텍스트/가운뎃점 본문 자체가 없어 dot span 0건 (의도된 부재). |
| 8 | feedback_avoid_premature_confirmation.md | sketch 작성 후 자체 PASS 판단 0건. 사용자 시각 컨펌 명시 받은 뒤 W7 진입 예정. A4 비율 / A4 흰배경 룰 사용자 컨펌 필수. |
| 9 | feedback_cbc7119_design_never_wrangler.md | 산출은 docs/redesign-context/14-reports/sketch-wave-6-*.html 1건. wrangler 0건 / npm run deploy 0건. main push 자동 cbc7119-preview 만. |
| 10 | feedback_tsx_wave_stat_card_drift.md | .a4-preview 는 카드 아님 — A4 종이 시각 흉내내는 흰배경 박스. outline/value 16px/aspect-square 룰 모두 미해당. 단 aspect-ratio: 210/297 (A4 비율) 명시는 본 wave 핵심. |

## Deviations from Plan

None — plan executed exactly as written. 4 frame matrix, 7 신규 CSS class 정의, W5 OQ #1/#2/#3 LOCKED 모두 적용, W7 OQ 2건 default 답 박제, 메모리 룰 10건 인용, src/ 0 변경, atomic 1-commit 모두 plan §5/§6/§7/§8 의 success_criteria 와 100% 일치.

## Self-Check: PASSED

- [x] `cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-6-desktop-preview-wrapper.html` exists (1002 lines)
- [x] commit de6e56f exists on worktree branch
- [x] git diff src/ = 0 (ExcelPreview.tsx / ReportsPage.tsx / App.tsx 모두 0 변경)
- [x] §6 verify gate 17건 (negative 8 + positive 9) 모두 PASS
- [x] wrangler / npm run deploy 0건 실행
- [x] 본 SUMMARY.md 는 .planning/quick/260520-i7u-redesign-14-reports-sketch-wave-6-excelp/ 안에 작성 (commit 안 함 — 본 wave constraint)
