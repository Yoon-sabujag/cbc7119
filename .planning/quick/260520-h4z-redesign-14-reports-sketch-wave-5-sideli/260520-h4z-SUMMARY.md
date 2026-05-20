---
phase: quick-260520-h4z
plan: 01
wave: 1
title: "redesign/14-reports sketch wave 5 — 데스크톱 좌측 sidelist 260px × 4 섹션 × 10 카드 (다크/라이트 1280px)"
completed: 2026-05-20
status: complete
commits:
  - bbf6bcb (sketch-wave-5-desktop-sidelist.html, 1 file +972 lines)
files_created:
  - cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-5-desktop-sidelist.html
files_modified: []
requirements:
  - QUICK-260520-h4z
verify_gate_result: PASS (19/19)
---

# redesign/14-reports sketch wave 5 SUMMARY

W5 = 데스크톱 좌측 sidelist (260px) 의 selected / hover / default row state 를 다크/라이트 양 테마로 분명히 시각화한 sketch HTML 1 file 산출. W4 (상단 toolbar) 와 W6 (ExcelPreview wrapper) 사이의 가교 wave. ReportsPage.tsx line 142~147 (DESKTOP_SECTIONS 4 entry) + line 249~295 (좌측 패널 markup) verbatim 매핑.

## Frame Matrix (4 frame)

| F | data-theme | selected row | hover demo | placeholder-preview reportType |
|---|---|---|---|---|
| 1 | dark | 섹션 A div-early '월초 유수검지 장치 점검표' (.sidelist-row--selected + title --selected) | 섹션 A div-late '월말 유수검지 장치 점검표' (.sidelist-row--hover + HOVER chip) | div-early |
| 2 | dark | 섹션 C 자탐 '자동화재탐지설비 점검일지' (.sidelist-row--selected + title --selected, 다른 섹션 active 시연) | (hover 0) | 자탐 |
| 3 | light | 섹션 A div-early '월초 유수검지 장치 점검표' (F1 mirror) | 섹션 A div-late '월말 유수검지 장치 점검표' (F1 mirror) | div-early |
| 4 | light | 섹션 C 자탐 '자동화재탐지설비 점검일지' (F2 mirror) | (hover 0) | 자탐 |

## DESKTOP_SECTIONS 4 섹션 × 10 row mapping

| 섹션 | 라벨 | row 수 | row title verbatim |
|---|---|---|---|
| A | 유수검지 장치 | 2 | 월초 유수검지 장치 점검표 / 월말 유수검지 장치 점검표 |
| B | 소화전 [dot] 가스 [dot] 비상콘센트 (라벨 가운뎃점 dot span × 2) | 3 | 월간 옥내소화전 점검일지 / 청정소화약제설비 점검일지 / 월간 비상콘센트 점검일지 |
| C | 연간 점검일지 | 4 | 월간 피난방화시설 점검일지 / 월간 방화셔터 점검일지 / 월간 제연설비 점검일지 / 자동화재탐지설비 점검일지 |
| D | 소방펌프 | 1 | 월간 소방펌프 점검일지 |

> 총 4 섹션 × 10 row × 4 frame = 40 row 인스턴스 노출. row sub 라인의 가운뎃점은 모두 dot-meta span 변환 (10 row × 1 dot × 4 frame = 40 dot span) + 섹션 B 라벨의 dot 2개 × 4 frame = 8 dot span = 총 dot-meta 46건 (target ≥40).

## W5 신규 CSS class 정의 (W7 변환 wave 가 인용할 verbatim 인덱스)

| class | 정의 요약 | source 매핑 |
|---|---|---|
| `.sidelist` | width 260, flex-shrink 0, border-right default, overflow-y auto, bg surface-raised | ReportsPage.tsx line 249~255 |
| `.sidelist-section-header` | padding 8/16/4, fontSize 12 (source 11→12 노안 격상), fontWeight 700, color text-tertiary, letter-spacing 0.05em, line-height 1 | line 258~265 |
| `.sidelist-row` | padding 8/16, border-left 3px transparent, bg transparent, cursor pointer | line 278~283 default state |
| `.sidelist-row--selected` | bg surface-sunken + border-left 3px var(--accent) | line 281~282 isSelected branch |
| `.sidelist-row--hover` | bg surface-sunken + border-left 3px transparent | line 281 isHover branch |
| `.sidelist-row-title` | fontSize 14 (source 13→14, text-body-sm), color text-primary, fontWeight 400 | line 285 default branch |
| `.sidelist-row-title--selected` | color var(--accent) + fontWeight 700 | line 285 isSelected branch |
| `.sidelist-row-sub` | fontSize 12 (source 11→12 노안 격상), color text-tertiary, marginTop 1 | line 288 |
| `.dot-meta` | inline-block 4×4, border-radius 9999px, bg text-tertiary, margin 0/6, vertical-align middle | W3 sketch-wave-3 line 288~296 verbatim mirror |

## verify gate ≥15 (19/19 PASS)

### Negative (6/6 PASS)
1. EMOJI=0 (target 0) — ⬇/📄/✅/❌/⚠️ 모두 0건 PASS
2. GRAD=0 (target 0) — linear-gradient 0건 PASS (Notes 안 '그라데이션 0건' 으로 한글 표기)
3. STATUS prefix=0 (target 0) — text-status-/bg-status- 0건 PASS
4. DOTTEXT body=0 (target 0) — 본문 ' · ' 가운뎃점 0건 PASS (Notes 안 dot span span 으로 변환)
5. W8 utility=0 (target 0) — class="w-8|h-8" 0건 PASS (인라인 px 값만 사용)
6. SMALLFONT=0 (target 0) — font-size: 9/10/11px 0건 PASS (모두 12px 상향)

### Positive (13/13 PASS)
7. SIDELIST css=1 (target ≥1) — `.sidelist {` 1건 PASS
8. SELROW=8 (target ≥4) — sidelist-row--selected 8건 (CSS 정의 1 + frame 안 row 사용 4 + title-selected variant 3) PASS
9. HOVROW=5 (target ≥2) — sidelist-row--hover 5건 (CSS 정의 1 + F1/F3 사용 4건 또는 hover 표기) PASS
10. SECA (유수검지 장치)=18 (target ≥4) — 4 frame 섹션 헤더 + 8 row title × 2 단어 매칭 = 18건 PASS
11. SECC (연간 점검일지)=9 (target ≥4) — 4 frame 섹션 헤더 + Notes 인용 = 9건 PASS
12. SECD (소방펌프)=18 (target ≥8) — 4 frame × (헤더+row+row sub × 3 occurrence) + Notes = 18건 PASS
13. DOTSPAN=46 (target ≥40) — class="dot-meta" 46건 (40 row sub + 8 섹션 B 라벨 + Notes 인용 = 46) PASS
14. MEMRULES unique=10 (target ≥7) — 10개 unique feedback_*.md PASS
15. W6 책임=8 (target ≥4) — placeholder-preview frame × 4 + Notes 인용 = 8건 PASS
16. W4 책임=8 (target ≥4) — placeholder-toolbar frame × 4 + 주석/Notes 인용 = 8건 PASS
17. FDARK=4 (target ≥2) — data-theme="dark" 4건 (root + F1/F2 + 변환 wave config) PASS
18. FLIGHT=3 (target ≥2) — data-theme="light" 3건 (F3/F4 + 변환 wave config) PASS
19. HCHIP=3 (target ≥3) — hover-demo-chip 3건 (CSS 정의 1 + F1/F3 사용 2 = 3) PASS

## 메모리 룰 박제 (10건 unique)

1. feedback_design_sketch_first.md — W5 가 W6 진입 전 마지막 sidelist 컨펌 시안.
2. feedback_sketch_realistic_data.md — REPORT_CARDS 10 entry / DESKTOP_SECTIONS 4 entry 라벨 verbatim, 카피 변경 0.
3. feedback_planner_prompt_sketch_verbatim.md — .sidelist-* CSS class 전체 W7 checklist 에 verbatim 인용 예정.
4. feedback_tailwind_token_class_pattern.md — bg-surface-raised / bg-surface-sunken / border-l-[3px] / text-accent 패턴 사용. status- prefix 0건.
5. feedback_tailwind_w8_h8_is_48px.md — 본 sketch 는 utility w-8/h-8 0건. 260px/32px/4px/8px/16px 모두 인라인 명시.
6. feedback_text_caption_leading_none.md — .sidelist-section-header line-height: 1 명시 + leading-none class 부여.
7. feedback_tsx_wave_emoji_dot_gap.md — 이모지 0건 / 섹션 B 라벨 dot span 변환 / 10 row sub 모두 dot span 변환.
8. feedback_avoid_premature_confirmation.md — 자체 PASS 판단 0건. 사용자 컨펌 후 W6 진입.
9. feedback_cbc7119_design_never_wrangler.md — wrangler 0건 / npm run deploy 0건. main push 자동 cbc7119-preview 만.
10. feedback_tsx_wave_stat_card_drift.md — sidelist row 는 카드 아닌 list 항목. Stat Card outline 패턴 0건.

## W6 진입 전 OQ 3건 (default 답 채택 시 별 의견 없는 것으로 진행)

| # | 질문 | default 답 | 근거 |
|---|---|---|---|
| 1 | ExcelPreview 영역 그리드 오버레이 vs 단순 PNG 자리? | **단순 미리보기 PNG 자리** | 내부 그리드 오버레이는 ExcelPreview.tsx 본체 책임. W6 wrapper layout 만. |
| 2 | 미리보기 톤 다크/라이트 자동 전환 vs A4 흰배경 고정? | **A4 흰배경 고정** | 메모리 룰 reference_floorplan_png_algorithm + 12-staff-service W8 결정 inherit. |
| 3 | 빈 상태 UI (선택 안 됨)? | **빈 상태 표시 불필요** | sidelist 항상 default selected (useState&lt;ReportType&gt;('div-early') 초기값). |

## W1 LOCKED 5건 적용 매트릭스 (W5 관점)

| OQ # | 룰 | W5 적용 여부 | 결과 |
|---|---|---|---|
| 1 | 모바일 다운로드 버튼 그라데이션 폐기 → bg-safe-bar solid | 미해당 (W2 적용 완료) | sidelist scope 무관 |
| 2 | 데스크톱 좌측 패널 260px 유지 | **본 wave 의 핵심 적용** | .sidelist width: 260px verbatim |
| 3 | 데스크톱 일괄 다운로드 그라데이션 폐기 | 미해당 (W4 적용 완료) | toolbar scope 무관 |
| 4 | 모바일 footer 안내 유지 | 미해당 (W3 적용 완료) | 모바일 scope 무관 |
| 5 | sub 라인 dot span 패턴 | **본 wave 적용** | 섹션 B 라벨 + 10 row sub 모두 dot-meta span 변환 |

## 자체 검수 (memory feedback_avoid_premature_confirmation)

- "거의 일치" 자신감 표현 0건 — verify gate 19/19 PASS 는 자동화 검증 결과로만 표기, 시각 정확성 판단은 사용자 권한.
- W6 (ExcelPreview wrapper) 진입 전 사용자 컨펌 명시 필요.

## 다음 단계

1. 사용자 컨펌 대기 — W5 sketch 시각 확인 후 W6 진입 허가 받기.
2. 컨펌 후 새 `/clear` + `/gsd:quick` 시작 → `sketch-wave-6-desktop-preview-wrapper.html` (ExcelPreview 영역 wrapper layout, dashed PNG 자리 + 다크/라이트 dual frame).
3. W7 변환 wave 진입 시 본 SUMMARY 의 "W5 신규 CSS class 정의" 표를 sketch-wave-5-desktop-sidelist.html 의 verbatim CSS 정의와 함께 plan 안에 박제.

## Self-Check: PASSED

- Created file exists: cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-5-desktop-sidelist.html — FOUND
- Commit exists: bbf6bcb — FOUND (`git log --oneline` 확인)
- Verify gate 19/19 PASS
- Scope: 1 file modified (sketch only) — git status --short 확인
- No src/migrations/scripts/functions changes — confirmed
- No wrangler / npm run deploy commands — confirmed (CLAUDE.local.md 준수)
