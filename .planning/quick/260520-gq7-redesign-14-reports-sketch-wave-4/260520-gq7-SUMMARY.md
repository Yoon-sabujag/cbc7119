---
phase: quick-260520-gq7
plan: 01
type: execute
wave: 1
status: complete
completed: 2026-05-20
tags:
  - redesign/14-reports
  - sketch
  - desktop
  - toolbar
requirements:
  - QUICK-260520-gq7-W4
---

# Quick 260520-gq7: redesign/14-reports W4 데스크톱 상단 바 sketch

## One-liner

ReportsPage.tsx `line 181~243` 데스크톱 상단 바를 W2/W3 CSS 패턴 inherit + W1 OQ #3 LOCKED (일괄 그라데이션 폐기 → safe-bar solid) 으로 변환한 1280px × 다크/라이트 × 평상시/loading 4 frame matrix sketch 1개.

---

## 1. 작성 산출물

| 경로                                                                                | 라인 수 | 비고 |
| ----------------------------------------------------------------------------------- | ------- | ---- |
| `cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-4-desktop-toolbar.html` | 819     | 평면 sibling — sketch-wave-2/3 와 동일 위치 패턴 |

---

## 2. Frame matrix 4건

| Frame | data-theme | toolbar 상태                          | 일괄 버튼               | 개별 버튼   | 하단 placeholder              |
| ----- | ---------- | ------------------------------------- | ----------------------- | ----------- | ----------------------------- |
| 1     | dark       | 평상시 (loading null, zipLoading null) | safe-bar solid + Download SVG + '일괄 다운로드' | surface-sunken + border-strong + '엑셀 다운로드' | sidelist 260px + ExcelPreview |
| 2     | dark       | 일괄 loading (zipLoading '생성 중... (3/10)') | surface-sunken + text-tertiary + disabled + SVG + '생성 중... (3/10)' | 평상시 (개별 state 독립) | 동일                          |
| 3     | light      | 평상시                                | safe-bar solid (#15803d) + SVG + '일괄 다운로드' | surface-sunken light + border-strong + '엑셀 다운로드' | 동일                          |
| 4     | light      | 일괄 loading                          | surface-sunken light + text-tertiary + SVG + '생성 중... (3/10)' | 평상시                  | 동일                          |

각 frame 1280px max-width `.frame-desktop` (W2/W3 frame-shell 데스크톱 변종), frame 간격 32px (`.frame-stack` flex column gap 32 — W2 section-gap mirror).

---

## 3. W2/W3 CSS class inherit 매핑표

| W4 신규 class                       | W2/W3 inherit source                          | 변경 사항                                                                  |
| ----------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------- |
| `.frame-desktop`                    | W3 line 402~411 `.frame-shell` (13-schedule)  | width 393 → max-width 1280, box-shadow + radius 18 유지                    |
| `.global-header-placeholder`        | W2 verbatim                                   | 변경 0건                                                                   |
| `.toolbar`                          | W2 `.page-header` 의 padding 8/12 + bg+border 패턴 | W4 신규: padding 8/16, gap 12, flex-shrink 0 — ReportsPage line 181~189 verbatim |
| `.toolbar-year-label`               | W2 `.year-label` 의 leading 1 패턴             | font 12 + text-secondary (source line 190 verbatim, W2 14 → 12 source 보존) |
| `.toolbar-select`                   | (W2/W3 미존재) — SELECT_STYLE line 306~313 verbatim | surface-sunken + border-strong + radius 4 + padding 4/8 + font 12          |
| `.toolbar-batch-btn`                | W2 `.report-card-btn` 의 safe-bar solid 패턴   | height 32 (source) / padding 0/14 / radius 6 — height 변경 보존            |
| `.toolbar-batch-btn--loading`       | W2 `.report-card--loading .report-card-btn`   | surface-sunken + text-tertiary + disabled — modifier 패턴 동일            |
| `.toolbar-spacer`                   | (W2/W3 미존재) — source line 218 verbatim       | flex 1 단일 div                                                            |
| `.toolbar-selected-title`           | W2 `.page-title` 의 fontWeight 700 패턴        | font 14 (source line 220 verbatim, W2 18 격상 미적용 — chrome 룰 §3 데스크톱 toolbar 별도) |
| `.toolbar-individual-btn`           | W2 `.back-btn` 의 surface-sunken + border 패턴 | height 32 / padding 0/14 / radius 6 + border-strong (source line 228 'bd2') |
| `.toolbar-individual-btn--loading`  | (W2/W3 미존재) — source line 237 verbatim       | opacity 0.5 + disabled — source 분기 1:1                                   |
| `.below-toolbar`                    | (W2/W3 미존재) — 신규                          | height 480 시연용 고정, flex 좌측 sidelist + 우측 preview                 |
| `.placeholder-sidelist`             | (W2/W3 미존재) — 신규                          | width 260px (W1 OQ #2 LOCKED), dashed border, JetBrains Mono 라벨          |
| `.placeholder-preview`              | (W2/W3 미존재) — 신규                          | flex 1, dashed border + margin 16, JetBrains Mono 라벨                     |
| `.variant-label`                    | W2/W3 verbatim                                | 변경 0건 — 12px JetBrains Mono uppercase                                   |
| `.frame-stack`                      | (W2/W3 미존재) — 신규                          | flex column gap 32 (section-gap), max-width 1280, mx-auto                  |

---

## 4. ReportsPage.tsx line 181~243 verbatim 매핑

| source line | source code (verbatim)                                                                | sketch class                       | 변경 사항                              |
| ----------- | ------------------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------- |
| 181~189     | outer div padding 8/16 + borderBottom var(--bd) + flex + gap 12 + flexShrink 0 + bg var(--bg2) | `.toolbar`                         | 1:1 verbatim                           |
| 190         | `<label style={{ fontSize: 12, color: 'var(--t2)' }}>연도</label>`                    | `.toolbar-year-label`              | 1:1 + leading-none 추가                |
| 191~195     | `<select value={year} ... style={SELECT_STYLE}>` (line 306~313 SELECT_STYLE)          | `.toolbar-select`                  | 1:1 verbatim (border-strong = bd2)     |
| 196~216     | `<button onClick={handleDownloadAll} disabled={!!zipLoading} style={{...}}>`         | `.toolbar-batch-btn[+--loading]`   | **W1 OQ #3 LOCKED 적용**: line 202 그라데이션 `linear-gradient(135deg,#1d4ed8,#2563eb)` 폐기 → `var(--status-safe-bar)` solid |
| 214         | `<Download size={13} />`                                                              | inline lucide SVG width 13 height 13 | 1:1 (size 13 source 보존 — W2/W3 size 14 와 다름) |
| 215         | `{zipLoading ?? '일괄 다운로드'}`                                                     | 텍스트 분기                        | Frame 1/3 = '일괄 다운로드', Frame 2/4 = '생성 중... (3/10)' (downloadAllAsZip setZipLoading 패턴) |
| 218         | `<div style={{ flex: 1 }} />`                                                         | `.toolbar-spacer`                  | 1:1 verbatim                           |
| 220         | `<span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{selectedCard?.title}</span>` | `.toolbar-selected-title`          | 1:1 + leading-none / 텍스트 = REPORT_CARDS[0].title verbatim '월초 유수검지 장치 점검표' |
| 221~243     | `<button onClick={() => handleDownload(selectedType)} disabled={loading === selectedType} style={{...}}>` | `.toolbar-individual-btn[+--loading]` | 1:1 verbatim — surface-sunken + border-strong + opacity 0.5 loading |
| 240         | `<Download size={13} />`                                                              | inline lucide SVG                  | 1:1                                    |
| 241         | `{loading === selectedType ? '생성 중...' : '엑셀 다운로드'}`                          | 텍스트 분기                        | 모든 4 frame 평상시 = '엑셀 다운로드' (개별 loading variant 는 W4 scope 외 — frame 2/4 도 개별 평상시) |

---

## 5. W1 LOCKED 5건 적용 매트릭스 (W4 관점)

| OQ #  | 결정                                                | 본 W4 적용 | 위치                                                              |
| ----- | --------------------------------------------------- | ---------- | ----------------------------------------------------------------- |
| #1    | 모바일 다운로드 그라데이션 폐기 → bg-safe-bar solid | **미해당** | W2 책임 (모바일 카드 버튼). W4 는 모바일 미포함.                  |
| #2    | 데스크톱 좌측 패널 260px 유지                       | **placeholder 명시** | `.placeholder-sidelist { width: 260px }` 4 frame 모두. W5 가 본격 구현. |
| #3    | 데스크톱 일괄 다운로드 그라데이션 폐기 → solid      | **본 wave 핵심 적용** | `.toolbar-batch-btn { background: var(--status-safe-bar) }` 4 frame 매트릭스 시연. |
| #4    | 모바일 footer 안내 유지                              | **미해당** | W3 책임 (모바일). 데스크톱 toolbar 에는 footer 영역 없음.         |
| #5    | sub 라인 dot span 패턴                              | **미해당** | toolbar 영역에 sub 라인 없음 (카드 sub 는 좌측 sidelist W5 책임). |

---

## 6. §6 verify gate 16건 통과 결과

### Negative (모두 0)

| Gate                                                | 결과      |
| --------------------------------------------------- | --------- |
| 1. ⬇ 이모지 0                                       | **0 PASS** |
| 2. linear-gradient 0                                | **0 PASS** |
| 3. text-status- / bg-status- prefix Tailwind 0      | **0 PASS** |
| 4. ' · ' 가운뎃점 텍스트 본문 0                      | **0 PASS** |
| 5. `\bw-8\b \bh-8\b` 유틸리티 class 0                | **0 PASS** |
| 6. 9·10·11px font-size 0                            | **0 PASS** |
| 7. 📄 ✅ ❌ ⚠️ 본문 0                                  | **0 PASS** |

### Positive

| Gate                                                                | 임계  | 실제 | 결과    |
| ------------------------------------------------------------------- | ----- | ---- | ------- |
| 8. lucide Download polyline ≥4                                      | ≥4    | 8    | PASS (4 frame × 2 button) |
| 9. `var(--status-safe-bar)` 일괄 ≥2                                 | ≥2    | 5    | PASS    |
| 10. `var(--surface-sunken)` ≥2                                      | ≥2    | 6    | PASS    |
| 11. `data-theme="dark"` / `data-theme="light"` ≥4                   | ≥4    | 9    | PASS (`:root,` + 4 frame + light root + light frame variant) |
| 12. feedback_* unique 메모리 룰 ≥7                                  | ≥7    | 10   | PASS    |
| 13. '월초 유수검지 장치 점검표' verbatim title ≥2                    | ≥2    | 6    | PASS (4 frame + 캡션/note) |
| 14. '일괄 다운로드' 또는 loading variant '생성 중... (3/10)' ≥4      | ≥4    | 23   | PASS    |
| 15. '엑셀 다운로드' 라벨 ≥2                                          | ≥2    | 9    | PASS    |
| 16. ExcelPreview / sidelist placeholder (W5/W6 책임 라벨) ≥2        | ≥2    | 13   | PASS (4 frame × 2 placeholder + note 인용) |

### Scope boundary

- `git diff cha-bio-safety/src cha-bio-safety/functions migrations scripts` → **0 line** (PASS)
- W2/W3 + wave-1-index.md untouched (`git diff` → empty PASS)
- wrangler / npm run deploy 명령 사용 0건

---

## 7. 메모리 룰 unique 10건 + 14-reports 컨텍스트 How

| #  | 메모리 룰                                              | How (본 sketch 적용)                                                                                              |
| -- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| 1  | feedback_design_sketch_first.md                         | W5 진입 전 데스크톱 상단 바 시안 컨펌 (코드 작성 0)                                                              |
| 2  | feedback_sketch_realistic_data.md                       | selected-title '월초 유수검지 장치 점검표' REPORT_CARDS[0].title verbatim. 라벨 '일괄 다운로드' / '엑셀 다운로드' / '생성 중... (3/10)' source 패턴 보존 |
| 3  | feedback_planner_prompt_sketch_verbatim.md              | `.toolbar-*` CSS class 명을 §7 W7 변환 wave 인용 인덱스에 verbatim 적시                                          |
| 4  | feedback_tailwind_token_class_pattern.md                | `var(--status-safe-bar)` / `var(--surface-sunken)` 직접 사용. `text-status-*` / `bg-status-*` prefix 0건         |
| 5  | feedback_tailwind_w8_h8_is_48px.md                      | height 32 인라인 명시 / w-8 h-8 유틸리티 사용 0건 / icon 13 inline                                              |
| 6  | feedback_tsx_wave_emoji_dot_gap.md                      | 다운로드 글리프 이모지 (U+2B07) 0건. lucide Download SVG 8회 인라인.                                            |
| 7  | feedback_text_caption_leading_none.md                   | year-label / select / batch-btn / individual-btn / selected-title 모두 height 32 컨테이너 → `line-height: 1` 명시 |
| 8  | feedback_avoid_premature_confirmation.md                | sketch 만 작성, "거의 일치" 자체 PASS 판단 0건. 사용자 컨펌 받은 뒤 W5 진입.                                    |
| 9  | feedback_cbc7119_design_never_wrangler.md               | wrangler 0건 / npm run deploy 0건 / main push 시 cbc7119-preview 자동 (직원 cbc7119 미접근)                     |
| 10 | feedback_tsx_wave_stat_card_drift.md                    | 14-reports = 점검 페이지 아님 → Stat Card 미적용. toolbar 영역에 outline 패턴 0건.                              |

---

## 8. W5 진입 전 OQ 3건 default 답

| OQ #  | 질문                                                  | default 답                                                                                  | 근거                                                                                                           |
| ----- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| #1    | 일괄 다운로드 클릭 시 confirm 모달 vs 즉시 시작        | **즉시 시작**                                                                                | source `handleDownloadAll` 는 confirm 없음, 로딩 라벨 ('생성 중... (3/10)') 로 진행 알림. confirm 추가 = 비즈 변경 위험. |
| #2    | 개별 다운로드 색                                       | **회색 (bg-surface-sunken) + border-strong 유지**                                            | 일괄 (safe-bar) 과 위계 구분. safe-bar 동일색은 두 버튼 평준화 위험.                                            |
| #3    | 일괄 다운로드 후 zip 완료 시 toast 알림                 | **toast 0**                                                                                  | source verbatim — browser native a.click() 만. 추후 UX 개선 검토 (별도 wave).                                  |

---

## 9. Atomic commit

산출 파일 1개만 commit (PLAN/SUMMARY/STATE 은 본 wave 안 commit 금지 — 제약 §1):

```bash
git add cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-4-desktop-toolbar.html
git commit -m "docs(14-reports): sketch wave 4 — 데스크톱 상단 바 (연도 + 일괄 + 선택 + 개별, 다크/라이트 1280px)"
```

(commit hash 는 §10 에 기록)

---

## 10. Self-Check

- [x] sketch-wave-4-desktop-toolbar.html 존재
- [x] 4 frame matrix (다크 평상시 / 다크 일괄 loading / 라이트 평상시 / 라이트 일괄 loading) 1280px
- [x] `.toolbar` / `.toolbar-year-label` / `.toolbar-select` / `.toolbar-batch-btn[+--loading]` / `.toolbar-spacer` / `.toolbar-selected-title` / `.toolbar-individual-btn[+--loading]` CSS class 정의 9건 모두 포함
- [x] W1 OQ #3 LOCKED 일괄 다운로드 safe-bar solid (그라데이션 0건)
- [x] 좌측 sidelist 260px placeholder + 우측 ExcelPreview placeholder ("W5 책임" / "W6 책임")
- [x] §6 verify gate 16건 (negative 7 + positive 9) 모두 통과
- [x] src/functions/migrations 변경 0건
- [x] W2/W3 + wave-1-index.md 변경 0건
- [x] wrangler / npm run deploy 명령 0건
- [x] 메모리 룰 unique ≥7건 (실제 10건) 박제

**Self-Check: PASSED**
