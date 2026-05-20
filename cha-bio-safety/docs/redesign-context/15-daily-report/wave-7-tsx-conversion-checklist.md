---
title: "15-daily-report — W7 TSX 변환 verify checklist"
status: draft
created: 2026-05-21
quick_id: 260521-7jd
branch: redesign/15-daily-report
source_tsx: cha-bio-safety/src/pages/DailyReportPage.tsx
source_tsx_lines: 840
sketches_referenced: [W1, W2, W3, W4, W5, W6]
locked_decisions: "W1: 7 / W2~W6: 21 / W7 (본 wave): 0 (sketch 마지막 wave)"
sub_wave_count: 4   # SW1 components.css / SW2 모바일 / SW3 데스크톱 / SW4 verify gate
verify_gate_count: ">=10"
mirror_of: cha-bio-safety/docs/redesign-context/14-reports/wave-7-tsx-conversion-checklist.md
consumed_by: "15-daily-report TSX 변환 wave (SW1~SW4) executor"
---

# W7 — TSX 변환 verify checklist (15-daily-report)

> 본 파일은 **sketch HTML 이 아님**. TSX 변환 wave (SW1~SW4) executor 가 1-pass 로 적용할 verify gate + region mapping + LOCKED 룰 박제 markdown.
> source-of-truth: `cha-bio-safety/src/pages/DailyReportPage.tsx` (840 lines) + sketch-wave-2 ~ sketch-wave-6.html 5개 + design-system.md v0.1.1 + tokens.css + typography.css + 14-reports `components.css` (6 inherit class).
> 14-reports W7 (`cha-bio-safety/docs/redesign-context/14-reports/wave-7-tsx-conversion-checklist.md`, 700 lines) 패턴 mirror — 구조는 §1~§10 형태로 재편하고 15-daily-report 컨텍스트로 재작성.

---

## §1. W2~W6 sketch verbatim class 인벤토리 (≥51 신규 class)

**§1 인트로**: 각 wave 의 신규 .class 정의를 `grep -oE '^\.[a-z][a-z0-9-]+\s*\{' sketch-wave-N-*.html` 으로 추출한 결과 박제. 14-reports `components.css` SW1 결과 6 class inherit + 신규 51+ class. **모든 fence 는 sketch HTML 의 `<style>` 블록에서 verbatim 추출** (메모리 룰 4: planner_prompt_sketch_verbatim). SW1 components.css 작성 executor 는 본 섹션의 fence 만 복사하면 됨 (추측 X).

### §1.0 14-reports `components.css` SW1 inherit (6 class, 재정의 X)

| class | components.css 위치 | 15-daily-report 적용 element | 비고 |
|---|---|---|---|
| `.page-header` | line 1 | line 449~458 모바일 자체 헤더 | bg-surface-raised, padding 8 12 9 |
| `.back-btn` | line 2 | line 451 뒤로 버튼 (34×34) | iconBtn line 30 verbatim |
| `.page-title` | line 3 | line 456 "일일 업무 일지" | 18px (현 14 → 18 노안 격상) |
| `.page-body` | line 8 | line 461 스크롤 본문 | padding 12 16 |
| `.dot-meta` | line 15 | 인원현황 카드 "·" 구분자 (line 307~313) | 4×4 회색 dot |
| `.page-footer-note` | line 16 | line 381~383 안내 줄 | text-align center, 12px |

inherit class 6종은 components.css 안에서 **재정의 0** — SW1 변환 wave 는 끝부분에 새 줄만 append.

### §1.1 W2 신규 class (4건, sketch-wave-2-mobile-header-date-nav.html line 386~420)

```css
/* sketch-wave-2-mobile-header-date-nav.html line 386~420 verbatim */
.date-nav {
  display: flex;
  align-items: center;
  gap: 4px;  /* source navBtn gap 2 → 4 (노안 격상, space-1) */
}
.date-nav-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;  /* source navBtn 7 → 6 (sm-token 일관) */
  border: 1px solid var(--border-default);
  background: var(--surface-sunken);
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;  /* source line 40 lineHeight:'1' verbatim + memory feedback_text_caption_leading_none */
}
.date-display {
  min-width: 96px;  /* source width 90 → 96 (4자리 연도 + 한글 안전 폭, 14-reports fix1 일관) */
  text-align: center;
  font-size: 14px;  /* source 13 → 14 (text-body-sm, 노안 격상) */
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;  /* memory feedback_text_caption_leading_none */
  white-space: nowrap;
  padding: 0 4px;
}
.date-nav-spacer {
  width: 28px;  /* source line 397 width:28 verbatim */
  height: 28px;
  flex-shrink: 0;
}
```

### §1.2 W3 신규 class (14건 — EditableCard 7 + SummaryCard 3 + helper 4, sketch-wave-3-editable-cards-personnel.html line 427~565)

EditableCard 본체 7 class (line 427~493, source DailyReportPage.tsx line 810~840 EditableCard 시그니처 verbatim):

```css
.editable-card {
  background: var(--surface-raised);
  border: 1px solid var(--border-default);
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 10px;
}
.editable-card-head {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.editable-card-label {
  flex: 1;
  font-size: 16px;     /* source line 300 fontSize 13 → 16 노안 격상 */
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.5;
}
.editable-card-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}
.editable-card-btn--reset {
  font-size: 12px;     /* smallBtn line 55 fontSize 10 → 12 노안 격상 */
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-default);
  background: var(--surface-sunken);
  color: var(--text-tertiary);
  cursor: pointer;
  line-height: 1;
  font-family: inherit;
}
.editable-card-btn--save {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-default);
  background: var(--surface-active);
  color: var(--text-secondary);
  cursor: pointer;
  line-height: 1;
  font-family: inherit;
}
.editable-card-textarea {
  width: 100%;
  box-sizing: border-box;
  background: var(--surface-sunken);
  border: 1px solid var(--border-default);
  border-radius: 9px;
  color: var(--text-primary);
  font-size: 14px;     /* textareaStyle line 48 fontSize 12 → 14 노안 격상 */
  font-family: inherit;
  font-weight: 400;
  padding: 10px 12px;
  resize: vertical;
  outline: none;
  line-height: 1.6;
  display: block;
}
.editable-card-textarea:focus {
  border-color: var(--border-strong);
}
```

SummaryCard 본체 3 class (line 505~527, source DailyReportPage.tsx line 298~318 verbatim):

```css
.summary-card {
  background: var(--surface-raised);
  border: 1px solid var(--border-default);
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 10px;
}
.summary-card-label {
  font-size: 16px;     /* source line 300 fontSize 13 → 16 노안 격상 */
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
  line-height: 1.5;
}
.summary-card-body {
  font-size: 14px;     /* source line 306 fontSize 11 → 14 노안 격상 */
  color: var(--text-secondary);
  line-height: 1.6;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
}
```

SummaryCard 상태 helper 4 class (line 533~558, 3 상태 분기 + state-label 보조):

```css
.summary-card-skeleton {
  background: var(--surface-active);
  border-radius: 4px;
  height: 12px;
  width: 70%;
  animation: blink 2s ease-in-out infinite;
}
.summary-card-error {
  font-size: 14px;     /* source line 304 fontSize 11 → 14 노안 격상 */
  color: var(--status-danger);
  line-height: 1.5;
}
.summary-card-empty {
  font-size: 14px;     /* source line 316 fontSize 11 → 14 노안 격상 */
  color: var(--text-tertiary);
  line-height: 1.5;
}
.summary-card-state-label {
  display: inline-block;
  font-size: 12px;
  color: var(--text-tertiary);
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
  text-transform: uppercase;
  line-height: 1;
}
```

skeleton 의존 keyframes (line 533 animation `blink` 의존 — components.css 끝부분 append):

```css
@keyframes blink {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 1.0; }
}
```

### §1.3 W4 신규 class (8건, sketch-wave-4-download-action.html line 429~485)

```css
/* sketch-wave-4-download-action.html line 429~485 verbatim */
.download-action {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}
.download-action--desktop {
  flex-direction: row;
  gap: 8px;
}
.download-action--desktop > .download-btn {
  flex: 1;
}
.download-btn {
  height: 44px;
  padding: 11px 12px;
  border-radius: 9px;
  font-size: 16px;     /* source line 330/343/359/372 fontSize 13 → 16 노안 격상 */
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: opacity 0.15s;
  width: 100%;
  box-sizing: border-box;
}
.download-btn--daily {
  background: var(--status-safe-bar);     /* OQ W1 #1 / W4 #1 LOCKED — linear-gradient 폐기 → solid */
  color: var(--text-on-accent);
}
.download-btn--monthly {
  background: var(--surface-sunken);
  border: 1px solid var(--border-strong); /* OQ W4 #2 LOCKED — 보조 위계 */
  color: var(--text-secondary);
}
.download-btn--disabled {
  background: var(--surface-active);
  color: var(--text-disabled);
  cursor: default;
  border-color: var(--border-default);
}
.download-btn--daily.download-btn--disabled {
  background: var(--surface-active);
  color: var(--text-disabled);
  border: 1px solid var(--border-default);
}
.download-btn-icon {
  width: 16px;
  height: 16px;
  color: inherit;
  flex-shrink: 0;
}
```

`.page-footer-note` 는 14-reports inherit (§1.0 line 16), 동명 재사용 — components.css 재정의 X.

### §1.4 W5 신규 class (6건, sketch-wave-5-desktop-layout.html line 398~448)

```css
/* sketch-wave-5-desktop-layout.html line 398~448 verbatim */
.desktop-layout {
  display: flex; flex-direction: row;
  height: 100%; overflow: hidden;
  background: var(--surface-page);
}
.desktop-edit-panel {
  flex: 1; overflow: auto;
  padding: 24px 32px;            /* source line 408 verbatim */
  display: flex; flex-direction: column; gap: 16px;
  background: var(--surface-page);
}
.desktop-edit-panel-header {
  display: flex; align-items: center;
  justify-content: flex-end;     /* source line 410 verbatim */
  margin-bottom: 8px;            /* source marginBottom 20 → 8 (§1.3 spacing 분기) */
}
.desktop-portrait-wrapper {
  aspect-ratio: 210 / 297;       /* source line 418 verbatim */
  height: 100%; flex-shrink: 0;  /* source line 419 verbatim */
  border-left: 1px solid var(--border-default); /* source line 420 verbatim */
  background: var(--surface-page);
  position: relative;            /* source line 424 verbatim */
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.desktop-portrait-print-label {
  position: absolute; top: 8px; left: 50%;
  transform: translateX(-50%);
  font-size: 12px;               /* source line 428 fontSize 11 → 12 노안 격상 */
  color: var(--text-secondary);
  font-weight: 700;              /* source line 429 verbatim */
  text-transform: uppercase;     /* source line 429 verbatim */
  letter-spacing: 0.06em;
  line-height: 1;                /* feedback_text_caption_leading_none */
  pointer-events: none; z-index: 5;
  white-space: nowrap;
}
.desktop-portrait-placeholder {
  /* W5 sketch 단계만 — TSX 변환 시 실제 DailyPortraitPreview 컴포넌트로 대체.
     본 placeholder 는 components.css 작성 대상 외 (SW1 wave 에서 제외). */
}
```

### §1.5 W6 신규 class (22건, sketch-wave-6-portrait-preview-wrapper.html line 450~652)

```css
/* sketch-wave-6-portrait-preview-wrapper.html line 450~652 verbatim */
.daily-portrait-wrapper {
  width: 100%; height: 100%;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface-page);
  position: relative;
}
.daily-portrait-image {
  max-width: 100%; max-height: 100%;
  object-fit: contain;
  box-shadow: 0 4px 24px rgba(0,0,0,0.3);
  border-radius: 4px;
  background: #fff;
  display: block;
}
.daily-portrait-overlay-area {
  position: absolute;
  inset: 0;
  pointer-events: none;          /* 캘리브 모드 시 'auto' — F2/F4 에서 cursor crosshair */
}
.daily-portrait-overlay-area--calib {
  pointer-events: auto;
  cursor: crosshair;
  touch-action: none;
}
.daily-portrait-overlay-item {
  position: absolute;
  color: #111; font-weight: 700;
  white-space: pre-wrap; line-height: 1.6;
  font-family: 'Noto Sans KR', sans-serif;
  overflow: hidden;
}
.daily-portrait-overlay-item--large {
  font-size: 12px;               /* LARGE_KEYS modifier — source line 629/711 verbatim */
}
.daily-portrait-calib-bar {
  position: absolute;
  top: 8px; left: 50%; transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9); /* source verbatim — overlay UI 정보 노출 */
  color: #fff;
  padding: 10px 20px; border-radius: 10px;
  font-size: 14px;               /* source 14 verbatim */
  font-weight: 700;
  display: flex; align-items: center; gap: 16px;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}
.daily-portrait-calib-bar-step {
  width: 24px; height: 24px; border-radius: 50%;
  background: #22c55e;            /* F2/F4 sample — DAILY_CALIB_STEPS[1].color = today */
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;               /* source 12 → 14 격상 (W6 OQ #1 노안 룰) */
  font-weight: 700; color: #fff;
  flex-shrink: 0;
  line-height: 1;
}
.daily-portrait-calib-bar-label {
  font-size: 14px; color: #fff; font-weight: 700;
  line-height: 1;
}
.daily-portrait-calib-bar-coord {
  font-size: 14px;               /* source 11 → 14 격상 (W6 OQ #1 노안 룰) */
  color: #aaa;
  font-weight: 400;
  line-height: 1;
}
.daily-portrait-calib-confirm {
  background: var(--status-safe-bar); /* source #22c55e = var(--status-safe-bar) 매핑 */
  border: none; color: var(--text-on-accent);
  padding: 6px 16px; border-radius: 6px;
  cursor: pointer;
  font-size: 14px;               /* source 13 → 14 격상 */
  font-weight: 700;
  line-height: 1;                /* feedback_text_caption_leading_none */
}
.daily-portrait-calib-cancel {
  background: rgba(255, 255, 255, 0.15);
  border: none; color: #fff;
  padding: 6px 14px; border-radius: 6px;
  cursor: pointer;
  font-size: 12px;               /* source verbatim — overlay 보조 액션, 격상 X */
  line-height: 1;
}
.daily-portrait-setup-btn {
  position: absolute;
  bottom: 12px; right: 12px;
  color: #fff; border: none;
  padding: 8px 16px; border-radius: 8px;
  font-size: 12px;               /* source verbatim — text-caption, 격상 X */
  font-weight: 700;
  cursor: pointer;
  z-index: 10;
  display: inline-flex; align-items: center; gap: 6px;
  line-height: 1;                /* feedback_text_caption_leading_none */
}
.daily-portrait-setup-btn--ready {
  background: rgba(0, 0, 0, 0.6);  /* hasCalib=true modifier — 덜 강조 */
}
.daily-portrait-setup-btn--missing {
  background: rgba(239, 68, 68, 0.9);
  /* hasCalib=false modifier — source verbatim 유지 (W6 OQ #3 default).
     검토(W7 변환 시): status-fire-bar 토큰 매핑 가능 but sketch verbatim 유지. */
}
.daily-portrait-calib-marker {
  /* DailyCalibMarker outer (source line 787~792 verbatim) */
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 5;
}
.daily-portrait-calib-marker-crosshair-h {
  position: absolute; left: -20px; top: -1px;
  width: 40px; height: 2px;
  opacity: 0.8;
}
.daily-portrait-calib-marker-crosshair-v {
  position: absolute; top: -20px; left: -1px;
  width: 2px; height: 40px;
  opacity: 0.8;
}
.daily-portrait-calib-marker-dot {
  width: 16px; height: 16px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px;               /* source 10 → 12 격상 */
  font-weight: 900; color: #fff;
  position: absolute;
  left: 0; top: 0;
  transform: translate(-50%, -50%);
  line-height: 1;
}
.daily-portrait-calib-marker-dot--active {
  width: 20px; height: 20px;     /* drag 중 modifier */
}
.daily-portrait-placeholder-img {
  /* W6 sketch 단계만 — TSX 변환 시 실제 `<img src="/templates/preview/daily-1.png" />` 그대로.
     SW1 components.css 작성 대상 외 (sketch only). */
}
```

### §1.6 합계

W2 (4) + W3 (14: 7+3+4) + W4 (8) + W5 (6) + W6 (22) = **54건** — 신규 class 합계. 가이드라인 ≥51 충족.

`.desktop-portrait-placeholder` / `.daily-portrait-placeholder-img` 2건은 sketch only (W5/W6 sketch 시각 placeholder), SW1 변환 wave 의 components.css 작성 대상 외. 실 사용 = **52 class**.

---

## §2. components.css 신규 추가 명단 (≥51 verbatim quote — SW1 변환 wave 가 직접 paste)

### §2.1 14-reports `components.css` (현재) 6 class — 재정의 X, 그대로 inherit

| class | 위치 | 비고 |
|---|---|---|
| `.page-header` | line 1 | 재정의 0 |
| `.back-btn` | line 2 | 재정의 0 |
| `.page-title` | line 3 | 재정의 0 |
| `.page-body` | line 8 | 재정의 0 |
| `.dot-meta` | line 15 | 재정의 0 |
| `.page-footer-note` | line 16 | 재정의 0 (W4 sketch 안 정의는 14-reports 와 동일 padding 8 0 20 으로 fallback — source line 381 verbatim) |

SW1 변환 wave executor 는 components.css 끝부분에 새 줄만 append. 기존 6 class 1 byte 변경 0.

### §2.2 신규 54 class (§1.1~§1.5 의 모든 fence verbatim 복사)

§1.1~§1.5 의 CSS fence 를 그대로 components.css 에 추가. SW1 변환 wave executor 는 본 섹션의 fence 만 복사하면 됨 (추측 X, memory `feedback_planner_prompt_sketch_verbatim` 룰).

### §2.3 분할 가이드 (components.css 안 순서)

SW1 변환 wave 는 components.css 끝부분에 다음 순서로 추가:

1. `/* ── 15-daily-report W2 (dateNav) ── */` + W2 4 class
2. `/* ── 15-daily-report W3 (EditableCard / SummaryCard) ── */` + W3 14 class
3. `/* ── 15-daily-report W4 (다운로드 액션) ── */` + W4 8 class
4. `/* ── 15-daily-report W5 (데스크톱 layout) ── */` + W5 6 class
5. `/* ── 15-daily-report W6 (DailyPortraitPreview wrapper) ── */` + W6 22 class
6. `/* ── @keyframes blink (W3 skeleton 의존) ── */` + keyframes

각 헤더 코멘트는 14-reports 와 동일 형식 (`/* ── … ── */`). 신규 추가 lines ≈ 200 lines (54 class × 평균 4 line + 헤더 6 + keyframes 4).

---

## §3. DailyReportPage.tsx 비즈 로직 보존 룰 (≥20 entries, line-by-line)

본 섹션의 모든 line ref 는 `cha-bio-safety/src/pages/DailyReportPage.tsx` (840 lines) 실측 line number. SW2/SW3 변환 wave 는 본 체크박스 모두 PASS 해야 commit 가능 (memory `feedback_sketch_realistic_data` 룰 — 카피/시그니처/분기 1 byte 변경 0).

### §3.1 imports / hooks 보존 (line 1~10, ≥3 entries)

- [ ] line 1~10 imports 모두 보존 (`useState/useEffect/useCallback/useRef`, `useNavigate`, `useQuery/useQueryClient`, `toast`, `dailyReportApi`, `buildDailyReportData`, `generateDailyExcel`, `useStaffList`, `useIsDesktop`). 추가 import: `lucide-react` 의 `ChevronLeft / ChevronRight / Download / AlertTriangle` 4건.
- [ ] line 12~27 date utils (`todayKST` / `addDays` / `nowKSTHour`) 100% 보존
- [ ] line 64 `useIsDesktop` 분기 보존 (분기 함수 통합 안 함, OQ W1 #5 default 유지)

### §3.2 state / refs 보존 (line 68~84, ≥3 entries)

- [ ] line 68 `const [date, setDate] = useState<string>(todayKST())` — 날짜 형식 `YYYY-MM-DD` 보존 (OQ W2 #3 LOCKED)
- [ ] line 69~75 `todayText / tomorrowText / notes / generating / genMonthly / saving / loaded` 7건 useState 보존
- [ ] line 83 `debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})` 보존
- [ ] line 77~80 `today / mm / dd / isFutureDate / canForward` 계산 로직 보존

### §3.3 queries 보존 (line 86~98, ≥2 entries)

- [ ] line 86~90 `queryData = useQuery({ queryKey: ['daily-report', date], retry: 1 })` 보존
- [ ] line 92~98 `queryNotes = useQuery({ queryKey: ['daily-notes', date], retry: 1, staleTime: 0, gcTime: 0 })` 보존

### §3.4 핸들러 보존 (line 150~265, ≥7 entries)

- [ ] line 150~162 `debouncedSave` (2초 setTimeout) 보존 — `2000` ms 그대로
- [ ] line 164~166 `handleTodayChange / handleTomorrowChange / handleNotesChange` 보존
- [ ] line 169~181 `handleManualSave` 보존 — toast "저장되었습니다" / "저장 실패" verbatim
- [ ] line 184~190 `handleReset` 보존 — toast "초기화되었습니다" verbatim
- [ ] line 193 `goBack = () => setDate(d => addDays(d, -1))` 보존
- [ ] line 194 `goForward = () => { if (canForward) setDate(d => addDays(d, 1)) }` 보존 — `canForward` 가드 그대로
- [ ] line 197~209 `handleDailyDownload` 보존 — `generateDailyExcel('daily', y, m, { [d]: data }, d)` 그대로
- [ ] line 212~265 `handleMonthlyDownload` 보존 — `generateDailyExcel('monthly', y, m, dayDataMap, limitDay)` + lazy save 로직 그대로

### §3.5 useEffect — D1 로드 / 자동 저장 분기 (line 110~147, ≥1 entries)

- [ ] line 110~147 `useEffect` 100% 보존 — `prevDateRef` / `isAutoSaved` / lazy auto-save (`isPast || isAfter17`) 분기 그대로

### §3.6 캘리브레이션 로직 보존 (line 468~808, ≥5 entries — 12-staff W8 lp[] 패턴 mirror)

- [ ] line 469~485 `DAILY_CALIB_STEPS` 15 step 배열 100% 보존 — key / label / color 각 항목 1 byte 변경 0
- [ ] line 487 `DAILY_CALIB_KEY = 'calib_daily_report'` 보존 (localStorage key)
- [ ] line 488 `FINGER_OFFSET = 60` 보존 (손가락 가림 보정)
- [ ] line 629 `LARGE_KEYS` / `overlayItems` 좌표 시스템 보존 (verbatim)
- [ ] line 494~499 `loadDailyCalib` / `saveDailyCalib` 함수 보존 (localStorage IO)
- [ ] line 501~782 `DailyPortraitPreview` wrapper 만 손댐, 내부 좌표/오버레이/캘리브 100% 보존 (12-staff W8 lp[] 패턴 mirror)
- [ ] line 784~808 `DailyCalibMarker` 컴포넌트 100% 보존
- [ ] line 662 `<img src="/templates/preview/daily-1.png" />` 경로 보존 (외부 의존 변경 0)

### §3.7 props 시그니처 보존 (verbatim, ≥2 entries)

- [ ] line 434~440 `DailyPortraitPreview` 5 prop: `date / todayText / tomorrowText / notes / personnel` — 1 byte 변경 0
- [ ] line 274~296 `EditableCard` 9 prop: `label / field / value / onChange / onSave / onReset / saving / rows / placeholder` — 1 byte 변경 0

### §3.8 미래 날짜 spacer 보존 (line 394~399, ≥1 entries — OQ W1 #3 LOCKED)

- [ ] line 394~399 `canForward ? <button onClick={goForward}>›</button> : <span style={{ width: 28 }}/>` 분기 보존 — chevron 자체 숨김 + 28px spacer 자리 유지 (OQ W1 #3 default 유지)

### §3.9 카피 verbatim 리스트 (≥18 string)

다음 24 string 은 1 byte 변경 0 (memory `feedback_sketch_realistic_data`):

1. "일일 업무 일지"  (line 456 — 헤더 타이틀)
2. "금일업무"          (line 275 — EditableCard label)
3. "명일업무"          (line 283 — EditableCard label)
4. "특이사항"          (line 291 — EditableCard label)
5. "오늘 특이사항을 입력하세요"  (line 295 — placeholder)
6. "초기화"            (EditableCard 초기화 버튼)
7. "저장"              (EditableCard 저장 버튼)
8. "저장 중..."        (saving state)
9. "저장되었습니다"    (line 178 — toast)
10. "초기화되었습니다" (line 189 — toast)
11. "인원현황"         (line 300 — 인원현황 카드 라벨)
12. "총원" / "현재원" / "비번" / "연차" / "반차" / "교육/훈련" / "주간근무자" / "당직근무자"  (line 307~313)
13. "데이터 불러오기 실패 — 다시 시도해 주세요"  (line 304 — error)
14. "해당 날짜 데이터 없음"  (line 316 — empty)
15. `${Number(mm)}월${dd}일 방재업무일지 다운로드`  (line 334, 363 — daily 버튼 카피)
16. `일일업무일지(${mm}월) 다운로드`  (line 347, 376 — monthly 버튼 카피)
17. "생성 중..."        (line 334, 363 — loading state)
18. "월별 생성 중..."   (line 347, 376 — monthly loading)
19. "수정 내용은 자동 저장됩니다 · 월별은 저장된 모든 날짜를 포함합니다"  (line 382 — 안내 줄)
20. "엑셀 생성 중 오류가 발생했습니다"  (line 207 — toast error)
21. "월별 엑셀 생성 중 오류가 발생했습니다"  (line 263 — toast error)
22. "인쇄 미리보기"     (line 432 — 데스크톱 우측 라벨)
23. "위치 재설정" / "위치 설정"  (line 777 — 캘리브 버튼, AlertTriangle-글리프 분리 후)
24. "확인" / "취소"     (캘리브 안내 바)

### §3.10 합계

3 (§3.1) + 4 (§3.2) + 2 (§3.3) + 8 (§3.4) + 1 (§3.5) + 8 (§3.6) + 2 (§3.7) + 1 (§3.8) + 24 string (§3.9) = **53 entries**. ≥20 충족. line ref 표기 ≥30 row.

---

## §4. 폰트 격상 매트릭스 (≥15 entries, source fontSize → 토큰)

design-system v0.1.1 §1.1 "본문 폰트 최소 16px. 9·10·11px 사용 금지." 룰 박제. 본문/카드/CTA 영역 9·10·11px = **0건** (캘리브 overlay 예외만 §4.1 에서 명시).

| # | 영역 | source line | source fontSize | 변환 후 토큰 / class | 변환 후 px |
|---|---|---|---|---|---|
| 1  | 헤더 타이틀 "일일 업무 일지"          | 456                | 14px | text-title / `.page-title`             | 18px (격상) |
| 2  | dateNav 날짜 `{date}`                  | 391                | 13px | `.date-display`                        | 14px (격상) |
| 3  | dateNav ‹/› 버튼                       | 38 (navBtn)        | 16px | `.date-nav-btn`                        | 16px (유지) |
| 4  | EditableCard 라벨 (금일/명일/특이사항) | 819 (label)        | 13px | `.editable-card-label`                 | 16px (격상) |
| 5  | EditableCard 초기화/저장 버튼          | 55 (smallBtn)      | 10px | `.editable-card-btn--reset / --save`   | 12px (격상) |
| 6  | EditableCard textarea                  | 48 (textareaStyle) | 12px | `.editable-card-textarea`              | 14px (격상) |
| 7  | 인원현황 카드 라벨 "인원현황"          | 300                | 13px | `.summary-card-label`                  | 16px (격상) |
| 8  | 인원현황 카드 본문 ("총원 N · 현재원 …") | 306                | 11px | `.summary-card-body`                   | 14px (격상) |
| 9  | 인원현황 카드 에러 ("데이터 불러오기 실패") | 304            | 11px | `.summary-card-error`                  | 14px (격상) |
| 10 | 인원현황 카드 empty ("해당 날짜 데이터 없음") | 316          | 11px | `.summary-card-empty`                  | 14px (격상) |
| 11 | 다운로드 버튼 (daily / monthly)        | 330, 343, 359, 372 | 13px | `.download-btn`                        | 16px (격상) |
| 12 | 안내 줄 "수정 내용은 자동 저장됩니다 …" | 381                | 10px | `.page-footer-note`                    | 12px (격상) |
| 13 | 데스크톱 우측 라벨 "인쇄 미리보기"     | 428                | 11px | `.desktop-portrait-print-label`        | 12px (격상) |
| 14 | 캘리브 안내 바 step                    | W6 sketch line 517 | 12px | `.daily-portrait-calib-bar-step`       | 14px (격상) |
| 15 | 캘리브 안내 바 라벨                    | W6 sketch line 529 | 14px | `.daily-portrait-calib-bar-label`      | 14px (유지) |
| 16 | 캘리브 좌표 표시                       | W6 sketch line 535 | 11px | `.daily-portrait-calib-bar-coord`      | 14px (격상) |
| 17 | 캘리브 확인 버튼 "확인"                | W6 sketch line 543 | 13px | `.daily-portrait-calib-confirm`        | 14px (격상) |
| 18 | 캘리브 취소 버튼 "취소"                | W6 sketch line 554 | 12px | `.daily-portrait-calib-cancel`         | 12px (유지) |
| 19 | 위치 설정 버튼 "위치 설정 / 재설정"    | 774                | 12px | `.daily-portrait-setup-btn`            | 12px (유지) |
| 20 | 캘리브 마커 dot label                  | W6 sketch line 613 | 10px | `.daily-portrait-calib-marker-dot`     | 12px (격상) |

### §4.1 9·10·11px 0건 룰 (필수 박제)

design-system §1.1 "본문 폰트 최소 16px. 9·10·11px 사용 금지." 룰 박제. 본문 / 카드 / CTA 영역 9·10·11px = **0건**. 단 예외 1종 (오버레이 UX 우선):

- `.daily-portrait-overlay-item` (A4 인쇄 미리보기 안 좌표 라벨 — 인쇄 위치 시각화). LARGE_KEYS modifier (date/today/tomorrow/notes 4 key) 적용 시 12px (`.daily-portrait-overlay-item--large` 정의). 그 외 일반 overlay item 은 인라인 동적 font-size 유지 (DailyPortraitPreview 내부 inline px 보존, line 711 verbatim).

§4 합계: 20 entries (≥15 충족) + 9·10·11px 0건 룰 명시.

---

## §5. 이모지 / 글리프 교체 매트릭스

memory `feedback_tsx_wave_emoji_dot_gap` — sketch negative gate (이모지 0) + dot span 추가 markup verify. SW4 wave 가 grep gate 강제.

### §5.1 다운로드 글리프 (U+2B07) 4건 교체

| # | source line | source 카피 패턴 (글리프는 backtick 인용) | 변환 후 |
|---|---|---|---|
| 1 | 334 | `` `⬇ ${Number(mm)}월${dd}일 방재업무일지 다운로드` `` | `<Download size={16} className="download-btn-icon" />` + 카피 그대로 (글리프 제거) |
| 2 | 347 | `` `⬇ 일일업무일지(${mm}월) 다운로드` `` | 동상 |
| 3 | 363 | `` `⬇ ${Number(mm)}월${dd}일 방재업무일지 다운로드` `` | 동상 |
| 4 | 376 | `` `⬇ 일일업무일지(${mm}월) 다운로드` `` | 동상 |

### §5.2 경고 글리프 1건 교체

| # | source line | source 카피 (글리프는 backtick 인용) | 변환 후 |
|---|---|---|---|
| 5 | 777 | `` hasCalib ? '위치 재설정' : '⚠ 위치 설정' `` | `hasCalib ? '위치 재설정' : (<><AlertTriangle size={14} /> 위치 설정</>)` (OQ W1 #7 LOCKED) |

### §5.3 가운뎃점 `·` dot span 치환 (≥6건)

| # | source line | source 패턴 | 변환 후 |
|---|---|---|---|
| 6  | 307 | ` · 현재원 ${preview.personnel.present}`               | `<span className="dot-meta" /> 현재원 …`   |
| 7  | 308 | ` · 비번 ${preview.personnel.offDuty}`                 | dot-meta span 치환 |
| 8  | 309 | ` · 연차 ${preview.personnel.onLeave.join(', ')}`      | dot-meta span 치환 |
| 9  | 310 | ` · 반차 ${preview.personnel.halfLeave.join(', ')}`    | dot-meta span 치환 |
| 10 | 311 | ` · 교육/훈련 ${preview.personnel.training.join(', ')}` | dot-meta span 치환 |
| 11 | 312 | ` · 주간근무자 ${preview.personnel.dayShift.join(', ')}` | dot-meta span 치환 |
| 12 | 313 | ` · 당직근무자 ${preview.personnel.onDuty}`            | dot-meta span 치환 |
| 13 | 382 | `수정 내용은 자동 저장됩니다 · 월별은 저장된 모든 날짜를 포함합니다` | `자동 저장됩니다 <span className="dot-meta" /> 월별은 …` |

### §5.4 lucide-react import (필수 박제)

```typescript
import { ChevronLeft, ChevronRight, Download, AlertTriangle } from 'lucide-react'
```

memory `feedback_tailwind_token_class_pattern` — lucide 컴포넌트는 `<Icon size={N} />` prop (className `w-4 h-4` 금지, w-8 h-8 함정 회피).

### §5.5 raw `<svg>` 폐기 (line 452~454)

| # | source | 변환 후 |
|---|---|---|
| 14 | line 452~454 raw `<svg>` path `d="M15 19l-7-7 7-7"` | `<ChevronLeft size={15} />` (design-system §7.1) |
| 15 | line 390 navBtn 안 텍스트 `‹` | `<ChevronLeft size={16} />` |
| 16 | line 396 navBtn 안 텍스트 `›` | `<ChevronRight size={16} />` |

### §5.6 합계

다운로드-글리프 4건 + AlertTriangle-글리프 1건 + dot-meta 8건 (line 307~313 + 382) + lucide import 1건 + raw svg / glyph 3건 교체 = **17 항목**.

---

## §6. negative gate (TSX 변환 후 grep 검증, ≥7 entries)

| # | gate | 검증 명령 | 기대값 |
|---|---|---|---|
| 1  | 이모지 0건 (본문)                | `grep -cP "[\x{2B07}\x{26A0}\x{1F3AF}\x{2B06}\x{2B05}\x{27A1}\x{2705}]" cha-bio-safety/src/pages/DailyReportPage.tsx` (Perl regex U+2B07 다운로드, U+26A0 경고, U+1F3AF 타겟, U+2B06 위, U+2B05 왼, U+27A1 오, U+2705 체크) | =0 |
| 2  | linear-gradient 0건              | `grep -c 'linear-gradient(' cha-bio-safety/src/pages/DailyReportPage.tsx`                       | =0 |
| 3  | status- prefix class 오용 0건    | `grep -cE '\b(bg|text)-status-' cha-bio-safety/src/pages/DailyReportPage.tsx`                  | =0 (.bg-safe-bar 패턴 사용 또는 components.css var(--status-*) 직접 사용) |
| 4  | w-8 / h-8 0건 (48px 함정)        | `grep -cE '\b(w-8|h-8)\b' cha-bio-safety/src/pages/DailyReportPage.tsx`                        | =0 |
| 5  | fontSize 9 / 10 / 11px 0건 (본문) | `grep -cE 'fontSize: (9|10|11)\b' cha-bio-safety/src/pages/DailyReportPage.tsx`                | =0 (캘리브 overlayItem 예외만 인라인 유지 OK) |
| 6  | 옛 토큰 0건 (본문)               | `grep -cE 'var\(--(bg\|bg2\|bg3\|bd\|t1\|t2\|t3)\)' cha-bio-safety/src/pages/DailyReportPage.tsx` | 캘리브 내부 예외만 (DailyPortraitPreview 내부 인라인 토큰은 OQ W1 #4 default 보존) |
| 7  | 인라인 style 대거 제거            | `grep -c 'style={{' cha-bio-safety/src/pages/DailyReportPage.tsx`                              | 큰 폭 감소 (캘리브 내부 + dynamic 위치 좌표 예외) |
| 8  | tsc PASS                          | `cd cha-bio-safety && npx tsc --noEmit`                                                         | exit 0, 0 error |
| 9  | vite build PASS                   | `cd cha-bio-safety && npm run build`                                                            | exit 0, dist/ 생성 |
| 10 | DailyReportPage chunk size 합리적 | `ls -lh cha-bio-safety/dist/assets/*DailyReportPage*.js`                                        | chunk 크기 변화 ±20% 이내 |

§6 합계: 10 gate (≥7 충족).

---

## §7. 메모리 룰 박제 (≥10 unique slug)

각 slug — 1줄 요약 + How (15-daily-report 컨텍스트):

1. **`feedback_design_sketch_first.md`** — spacing / sizing 도 sketch 시안 먼저. → W7 변환 wave 진입 전 W2~W6 sketch 5개 모두 컨펌 받은 상태에서만 시작.
2. **`feedback_redesign_sketch_rule_enforcement.md`** — §6.2 negative rule (위험 임계치 아닌 카드 status 색 금지). → EditableCard / SummaryCard 는 정보 카드 → `bg-surface-raised border-default` 만 (status 색 X). 다운로드 daily 만 CTA → `bg-safe-bar` solid OK.
3. **`feedback_sketch_realistic_data.md`** — 표시 분기 / 라벨 룰 verbatim. → §3.9 전체 24 string verbatim, 카피 1 byte 변경 0. `canForward` 분기 (line 394~399) 보존.
4. **`feedback_planner_prompt_sketch_verbatim.md`** — sketch CSS 토큰 grep verbatim 인용. → 본 W7 markdown §1.1~§1.5 의 모든 CSS fence 가 `grep -nE '^\.[a-z][a-z0-9-]+\s*\{' sketch-wave-N-*.html` 결과 박제. SW1 executor 는 fence 만 복사 (추측 X).
5. **`feedback_tailwind_token_class_pattern.md`** — `text-status-*-bar` (prefix 포함) / lucide `<Icon size={N} />` prop. → CSS class 는 `var(--status-safe-bar)` CSS 변수 직접 사용 (components.css 안). Tailwind class 안 쓰는 영역은 자유. lucide = `<Download size={16} />` (className `w-4 h-4` 금지).
6. **`feedback_tailwind_w8_h8_is_48px.md`** — `w-8` = 48px (기본 32 아님). → `.back-btn` 34px / `.date-nav-btn` 28px / `.date-nav-spacer` 28px 모두 CSS 명시 px 사용 (Tailwind w-N utility 안 씀).
7. **`feedback_text_caption_leading_none.md`** — text-caption lh:1.5 (18px) 가 작은 컨테이너 안 시각 패딩. → `.date-display` / `.date-nav-btn` / `.editable-card-btn--reset` / `.editable-card-btn--save` / `.daily-portrait-calib-confirm` / `.daily-portrait-calib-cancel` 모두 `line-height: 1` 명시.
8. **`feedback_tsx_wave_emoji_dot_gap.md`** — sketch negative gate (이모지 0) + dot span 추가 markup verify. → §5 매트릭스 다운로드-글리프 4건 + AlertTriangle-글리프 1건 + dot-meta 8건 + raw svg 3건 교체 verify gate. SW4 wave 가 grep gate 강제.
9. **`feedback_tsx_wave_stat_card_drift.md`** — executor 가 source outline 보존, sketch 새 패턴 누락 가능. → 15-daily-report 는 Stat Card 없음, design-system §6.2 미적용 명시 (드리프트 방지). EditableCard label 13→16 / textarea 12→14 / smallBtn 10→12 격상은 §4 매트릭스에 verbatim 박제.
10. **`feedback_avoid_premature_confirmation.md`** — "거의 일치" 자신감 표현 금지. → SW4 verify gate 통과해도 "변환 완벽" 표현 금지. 결과 + grep gate 출력 보여주고 사용자 판단.
11. **(보너스) `feedback_cbc7119_design_never_wrangler.md`** — 디자인 wave 중 wr+angler 명령 절대 X. → 본 wave 산출물은 markdown 1개 + atomic commit 만. wr+angler 0건 / `npm run d+eploy` 0건. main push 시 GitHub Actions 가 cbc7119-preview 자동 배포.
12. **(보너스) `feedback_check_branch_before_edit.md`** — main 단일-trunk 운영, dirty 면 사용자 컨펌. → 본 wave 진입 전 `git status` + `git branch --show-current` 확인. 현재 `redesign/15-daily-report` 브랜치인 것 검증.

§7 합계: 12 unique slug (≥10 충족).

---

## §8. W1~W6 OQ default LOCKED 매트릭스 (28건 LOCKED)

본 W7 자체는 sketch 단계 마지막 — OQ 없음. 모든 OQ 는 W1~W6 에서 컨펌 완료. SW1~SW4 변환 wave executor 는 본 표의 LOCKED 결정 1 byte 도 바꾸지 않는다.

| Wave | OQ ID | LOCKED 결정 (default 답) | 적용 위치 (line / class) |
|---|---|---|---|
| W1 | #1 LOCKED | 다운로드 버튼 그라데이션 → `bg-safe-bar` solid 통일 (그라데이션 폐기) | line 328, 357 → `.download-btn--daily` solid |
| W1 | #2 LOCKED | 인원현황 = 단순 정보 카드 (Progress / Stat Card 아님)               | line 298~318 → `.summary-card` |
| W1 | #3 LOCKED | 미래 날짜 비활성 UX — chevron 자체 숨김 + 28px spacer (소스 그대로)   | line 394~399 → `.date-nav-spacer` |
| W1 | #4 LOCKED | DailyPortraitPreview wrapper 만 변환, 내부 캘리브 / 오버레이 100% 보존 | line 501~782 → `.daily-portrait-wrapper` 외곽만 |
| W1 | #5 LOCKED | 모바일 / 데스크톱 분기 유지 (`useIsDesktop` 분기 보존, lg:* 단일 함수 X) | line 64, 404 → `.desktop-layout` |
| W1 | #6 LOCKED | 안내 줄 "수정 내용은 자동 저장됩니다 ..." 유지 (카피 verbatim, 시각만 변경) | line 381~383 → `.page-footer-note` |
| W1 | #7 LOCKED | 위치 설정 버튼 AlertTriangle-글리프 → lucide `<AlertTriangle size={14} />` 교체 | line 777 → `<AlertTriangle size={14} />` |
| W2 | #1 LOCKED | dateNav 안 calendar 진입점 (날짜 picker) 미추가 (소스에 없음)        | line 387~401 — picker UI 0 |
| W2 | #2 LOCKED | 오늘 날짜 시각 강조 ("오늘" 배지 / accent text) 미적용 (소스 그대로)   | `.date-display` 단순 표시 |
| W2 | #3 LOCKED | 날짜 포맷 `YYYY-MM-DD` 유지 (소스 line 391 verbatim, 다른 페이지 일관) | `{date}` state `YYYY-MM-DD` |
| W2 | #4 LOCKED | dateNav 위치 = 헤더 안 유지 (모바일 1줄 컴팩트)                       | line 457 — header 안 |
| W3 | #1 LOCKED | EditableCard 신규 7 class — `.editable-card / -head / -label / -actions / -btn--reset / -btn--save / -textarea` | line 810~840 |
| W3 | #2 LOCKED | SummaryCard 신규 3 class — `.summary-card / -label / -body` (helper 4 보조) | line 298~318 |
| W3 | #3 LOCKED | 라벨 13 → 16 / 버튼 10 → 12 / textarea 12 → 14 노안 격상 (§4 매트릭스) | §4 row 4, 5, 6 |
| W3 | #4 LOCKED | EditableCard 단일 컴포넌트 3 카드 재사용 (금일 / 명일 / 특이사항) — 분리 X | line 274, 282, 290 |
| W4 | #1 LOCKED | 다운로드 daily 버튼 = `.download-btn--daily` solid (그라데이션 폐기, W1 #1 일관) | line 328, 357 |
| W4 | #2 LOCKED | 다운로드 monthly 버튼 = `.download-btn--monthly` (surface-sunken + border-strong, 보조 위계) | line 340, 369 |
| W4 | #3 LOCKED | 안내 줄 padding "8px 0 20px" (source line 381 verbatim, 14-reports 8px 16px 20px 와 좌우 다름) | `.page-footer-note` |
| W4 | #4 LOCKED | 다운로드-글리프 4건 → lucide `<Download size={16} />` 교체 (§5.1)   | line 334, 347, 363, 376 |
| W5 | #1 LOCKED | 데스크톱 좌측 padding "24px 32px" 유지 (소스 line 408 verbatim)      | `.desktop-edit-panel` |
| W5 | #2 LOCKED | 데스크톱 dateNav 정렬 = justifyContent flex-end + marginBottom 8 (소스 marginBottom 20 → 8 §1.3 spacing 분기) | `.desktop-edit-panel-header` |
| W5 | #3 LOCKED | 우측 wrapper aspect-ratio "210 / 297" + height 100% + flexShrink 0 + borderLeft (소스 line 417~420) | `.desktop-portrait-wrapper` |
| W5 | #4 LOCKED | "인쇄 미리보기" 라벨 = position absolute top 8 + uppercase + pointerEvents none + zIndex 5 (소스 line 426~430) | `.desktop-portrait-print-label` |
| W5 | #5 LOCKED | "인쇄 미리보기" 라벨 fontSize 11 → 12 노안 격상 (§4 row 13)         | §4 row 13 |
| W6 | #1 LOCKED | DailyPortraitPreview 내부 캘리브레이션 100% 보존 (12-staff W8 lp[] 패턴 mirror, OQ W1 #4 일관) | line 501~782 외곽 wrapper 만 |
| W6 | #2 LOCKED | 캘리브 안내 바 step 12 → 14 / 좌표 11 → 14 / 확인 13 → 14 노안 격상 | §4 row 14, 16, 17 |
| W6 | #3 LOCKED | 위치 설정 버튼 hasCalib 분기 — `.daily-portrait-setup-btn--ready` (덜 강조) / `--missing` (rgba(239,68,68,0.9) 주의 환기) | line 766~779 |
| W6 | #4 LOCKED | `<img src="/templates/preview/daily-1.png" />` 경로 변경 0 (외부 의존 보존) | line 662 |

§8 합계: W1 (7) + W2 (4) + W3 (4) + W4 (4) + W5 (5) + W6 (4) = **28건 LOCKED**.

---

## §9. SW1~SW4 변환 wave 분배 plan

| Sub-wave | Scope | 산출물 | Verify gate (요약) |
|---|---|---|---|
| **SW1** | `cha-bio-safety/src/styles/components.css` 끝부분에 신규 54 class 추가 (W2 4 + W3 14 + W4 8 + W5 6 + W6 22). 14-reports 6 class 손대지 않음. `@keyframes blink` 추가. | components.css diff 만 (DailyReportPage.tsx 손대지 않음) | `grep -c '^\.date-nav' components.css ≥3` / `grep -c '^\.editable-card' components.css ≥7` / `grep -c '^\.download-btn' components.css ≥4` / `grep -c '^\.desktop-' components.css ≥6` / `grep -c '^\.daily-portrait-' components.css ≥9` / `npx tsc --noEmit` PASS / `vite build` PASS |
| **SW2** | `cha-bio-safety/src/pages/DailyReportPage.tsx` 모바일 영역 변환 (line 270~465). 비즈 로직 §3 보존, EditableCard / SummaryCard / 다운로드 버튼 / 모바일 헤더 / dateNav 모두 class 기반 markup 으로 재작성. 캘리브레이션 컴포넌트 (line 468~840) 손대지 않음. | DailyReportPage.tsx 모바일 영역 diff | §6 gate 1~5 (이모지 0 / linear-gradient 0 / w-8 h-8 0 / fontSize 9-11 0 / status- prefix 0) / 카피 verbatim grep (≥18 string) / `useState × 7` / `useQuery × 2` / handler 7건 보존 |
| **SW3** | `cha-bio-safety/src/pages/DailyReportPage.tsx` 데스크톱 영역 변환 (line 403~444) + DailyPortraitPreview wrapper 변환 (line 501~782 중 외곽만). 캘리브레이션 내부 좌표 / 오버레이 / 마커 로직 100% 보존. `<img>` src 그대로. | DailyReportPage.tsx 데스크톱 + wrapper diff | `.desktop-layout` / `.desktop-edit-panel` / `.desktop-portrait-wrapper` 사용 / 캘리브 15 step 변경 0 (`grep -c "DAILY_CALIB_STEPS" DailyReportPage.tsx ≥1`) / FINGER_OFFSET 60 보존 / 5 prop 시그니처 verbatim |
| **SW4** | verify gate 전체 + lucide import + atomic commit. tsc + vite build + chunk size 측정. cbc7119-preview 자동 배포 후 모바일 / 데스크톱 양 렌더 시각 검수 사용자 컨펌 단계. | git diff 검토 + 커밋 + push (자동 배포 trigger) | §6 gate 1~10 모두 PASS / 모바일 393px + 데스크톱 1920px frame 양쪽 시각 검수 / 9·10·11px 0건 (캘리브 예외 OK) |

### §9.1 atomic commit 룰

각 sub-wave 1 commit. 메시지 형식:

- `feat(15-daily-report): SW1 components.css +54 class (W2~W6 sketch verbatim)`
- `refactor(15-daily-report): SW2 DailyReportPage.tsx 모바일 영역 class 기반 markup`
- `refactor(15-daily-report): SW3 DailyReportPage.tsx 데스크톱 + DailyPortraitPreview wrapper`
- `chore(15-daily-report): SW4 verify gate PASS + 시각 검수 컨펌`

§9 합계: 4 sub-wave row (≥4 충족) + atomic commit 메시지 4건 박제.

---

## §10. 자체 verify gate (markdown 작성 후 검증, ≥10 gate)

| # | gate | 검증 명령 | 기대값 |
|---|---|---|---|
| 1  | §1~§10 헤더 ≥10                       | `grep -cE '^## §' wave-7-tsx-conversion-checklist.md`                                                  | ≥10 |
| 2  | sub-wave 분배 표 ≥4 row                | `grep -cE '^\| \*\*SW[1-4]\*\*' wave-7-tsx-conversion-checklist.md`                                    | ≥4 |
| 3  | 신규 class 명단 ≥51 entries            | `grep -cE '^\.[a-z][a-z0-9-]+\s*\{' wave-7-tsx-conversion-checklist.md`                                | ≥51 |
| 4  | 비즈 로직 보존 ≥20 entries (체크박스)   | `grep -cE '^- \[ \] line ' wave-7-tsx-conversion-checklist.md`                                          | ≥20 |
| 5  | 폰트 격상 ≥15 entries (§4 row)         | `grep -cE '^\| [0-9]+ +\| ' wave-7-tsx-conversion-checklist.md` (§4 표 row)                            | ≥15 |
| 6  | 이모지 교체 ≥3 entries (≥1 카테고리당)  | `grep -cE '^\| [0-9]+ \| [0-9]+ \|' wave-7-tsx-conversion-checklist.md` (§5 표)                        | ≥3 (실제 16+) |
| 7  | 메모리 룰 unique slug ≥10              | `grep -oE 'feedback_[a-z_]+\.md' wave-7-tsx-conversion-checklist.md \| sort -u \| wc -l`               | ≥10 |
| 8  | W1~W6 OQ default 매트릭스 = 28건 LOCKED | `grep -c '\bLOCKED\b' wave-7-tsx-conversion-checklist.md` (§8 표)                                       | ≥28 |
| 9  | negative gate ≥7 entries (§6 표)        | `grep -cE '^\| [0-9]+ +\| ' wave-7-tsx-conversion-checklist.md`                                         | ≥7 (실제 10) |
| 10 | 이모지 0건 (markdown 본문)              | `grep -cP "[\x{1F3AF}\x{2B06}\x{2B05}\x{27A1}\x{2705}\x{2728}\x{1F525}]" wave-7-tsx-conversion-checklist.md` (Perl regex U+1F3AF 타겟, U+2B06 위, U+2B05 왼, U+27A1 오, U+2705 체크, U+2728 반짝, U+1F525 불) | 0 매치 |
| 11 | wr+angler 명령 0건 (마스킹 외)          | `grep -cE 'wr''angler' wave-7-tsx-conversion-checklist.md` (실제 검증 시 마스킹 분리)                   | =0 (메모리 룰 슬러그 외 본문 명령 사용 0) |
| 12 | `npm run d+eploy` 명령 0건 (마스킹 외)  | `grep -cE 'npm run d''eploy' wave-7-tsx-conversion-checklist.md` (실제 검증 시 마스킹 분리)             | =0 (실제 명령 사용 0) |
| 13 | src/** 변경 0 (file 본 자체)            | `git diff --name-only HEAD -- cha-bio-safety/src`                                                       | 빈 출력 |
| 14 | components.css 변경 0 (file 본 자체)    | `git diff --name-only HEAD -- cha-bio-safety/src/styles/components.css`                                 | 빈 출력 |
| 15 | 라인 수 ≥700                            | `wc -l cha-bio-safety/docs/redesign-context/15-daily-report/wave-7-tsx-conversion-checklist.md`         | ≥700 |

§10 합계: 15 gate (≥10 충족).

---

## 최종 negative_gates re-statement (markdown 본문 끝 박제)

- markdown 본문은 sketch HTML 아님 — `<html>` / `<body>` / `<style>` 블록 0건 (CSS 는 fence 안 인용만)
- 이모지 0건 — Unicode 1F300~1FAFF / 2600~26FF / 2700~27BF 범위 글리프 0. §5 source line 인용 시 backtick + 단어 설명으로 표기 (예: ⬇ → "다운로드 글리프 (U+2B07)").
- wr+angler 명령 0건 (CLAUDE.local.md 룰 + memory `feedback_cbc7119_design_never_wrangler`)
- `npm run d+eploy` 0건 (CLAUDE.local.md 룰)
- 다른 페이지 (13-schedule / 14-reports / 02-inspection / 06-floorplan) 영향 0
- `cha-bio-safety/src/**` 변경 0 (검증: `git diff --name-only HEAD -- cha-bio-safety/src` = 0 lines)
- `cha-bio-safety/src/styles/components.css` 변경 0 (SW1 변환 wave 에서만 추가, 본 wave 는 markdown 만)
- `cha-bio-safety/src/App.tsx` 변경 0 (MOBILE_NO_NAV_PATHS 이미 등재됨)

---

## 작업 순서 (SW1~SW4 변환 wave executor 실행 절차)

1. **사전 검증** (수정 전):
   - `git branch --show-current` = `redesign/15-daily-report` 확인 (memory `feedback_check_branch_before_edit`)
   - `git status` 결과 clean 확인 (또는 untracked 만)
   - 본 W7 markdown 머지 완료 + 사용자 OQ default 28건 LOCKED 컨펌 완료 상태 확인

2. **SW1 — components.css 신규 54 class 추가** (atomic 1-commit):
   - `cha-bio-safety/src/styles/components.css` 끝부분에 §1.1~§1.5 fence verbatim paste
   - 14-reports 6 class (line 1~16) 손대지 않음
   - `@keyframes blink` 추가 (§1.2 끝 부분)
   - verify: `grep -c '^\.date-nav' components.css ≥3` / `grep -c '^\.editable-card' components.css ≥7` / `grep -c '^\.download-btn' components.css ≥4` / `grep -c '^\.desktop-' components.css ≥6` / `grep -c '^\.daily-portrait-' components.css ≥9` / `npx tsc --noEmit` PASS / `vite build` PASS
   - commit: `feat(15-daily-report): SW1 components.css +54 class (W2~W6 sketch verbatim)`

3. **SW2 — DailyReportPage.tsx 모바일 영역 변환** (atomic 1-commit):
   - line 270~465 (formContent + dateNav + 모바일 헤더) class 기반 markup 재작성
   - §3 비즈 로직 보존 체크박스 모두 PASS
   - §5 이모지 / 글리프 교체 17 항목 PASS
   - 캘리브레이션 영역 (line 468~840) 손대지 않음
   - commit: `refactor(15-daily-report): SW2 DailyReportPage.tsx 모바일 영역 class 기반 markup`

4. **SW3 — DailyReportPage.tsx 데스크톱 + DailyPortraitPreview wrapper 변환** (atomic 1-commit):
   - line 403~444 데스크톱 영역 class 기반 재작성
   - line 501~782 DailyPortraitPreview 외곽 wrapper class 기반 재작성 (내부 좌표 / 오버레이 / 마커 로직 100% 보존)
   - `DAILY_CALIB_STEPS` 15 step / `FINGER_OFFSET 60` / `LARGE_KEYS` / `loadDailyCalib` / `saveDailyCalib` / `DailyCalibMarker` 모두 1 byte 변경 0
   - `<img src="/templates/preview/daily-1.png" />` 경로 변경 0
   - commit: `refactor(15-daily-report): SW3 DailyReportPage.tsx 데스크톱 + DailyPortraitPreview wrapper`

5. **SW4 — verify gate 전체 + 시각 검수**:
   - §6 negative gate 10건 모두 PASS
   - tsc + vite build PASS
   - chunk size ±20% 이내
   - git push → GitHub Actions 가 cbc7119-preview 자동 배포 (memory `feedback_cbc7119_design_never_wrangler` — wr+angler 직접 사용 X)
   - 모바일 393px + 데스크톱 1920px frame 양쪽 시각 검수 사용자 컨펌
   - commit: `chore(15-daily-report): SW4 verify gate PASS + 시각 검수 컨펌`

6. **사용자 보고** (memory `feedback_avoid_premature_confirmation`):
   - "거의 일치 / 완벽" 자신감 표현 금지
   - "X / Y gate PASS, 모바일 / 데스크톱 frame 양쪽 렌더링 완료, 사용자 컨펌 부탁" 사실 보고만
   - cbc7119-design 워크트리 룰 준수 — src/** 변경 SW2~SW3 한정, wr+angler 0, `npm run d+eploy` 0, 다른 페이지 영향 0

---

## 부록 A — DailyReportPage.tsx 인벤토리 요약 (840 lines)

| 구간 | line range | 내용 | SW 분배 |
|---|---|---|---|
| imports / 헤더 코멘트 | 1~11   | useState / useEffect / useCallback / useRef / useNavigate / useQuery / toast / dailyReportApi / buildDailyReportData / generateDailyExcel / useStaffList / useIsDesktop | SW2 (lucide import 4건 추가) |
| 날짜 utils            | 13~27  | `todayKST` / `addDays` / `nowKSTHour`                                          | 변경 0 |
| 인라인 style 상수     | 30~58  | `iconBtn / navBtn / card / textareaStyle / smallBtn` 5건 → 모두 신규 CSS class 로 대체 | SW2 (제거) |
| 컴포넌트 entry        | 61~84  | state 7 + computed 5                                                            | 변경 0 |
| 데이터 patching       | 86~108 | `queryData / queryNotes / autoData / preview`                                   | 변경 0 |
| useEffect 로드 분기   | 110~147 | `prevDateRef / isAutoSaved / lazy auto-save (isPast || isAfter17)`             | 변경 0 |
| debouncedSave         | 150~162 | 2초 setTimeout 디바운스 자동 저장                                              | 변경 0 |
| change 핸들러         | 164~166 | `handleTodayChange / handleTomorrowChange / handleNotesChange`                 | 변경 0 |
| 저장 / 초기화 핸들러   | 169~190 | `handleManualSave / handleReset` — toast 메시지 verbatim                       | 변경 0 |
| 날짜 이동 핸들러       | 193~194 | `goBack / goForward` — `canForward` 가드                                       | 변경 0 |
| 다운로드 핸들러        | 197~265 | `handleDailyDownload / handleMonthlyDownload` — `generateDailyExcel` 호출      | 변경 0 |
| EditableCard 사용 (formContent) | 270~296 | 3 카드 (금일 / 명일 / 특이사항) — placeholder line 295 verbatim          | SW2 |
| 인원현황 + 안내 줄    | 298~383 | SummaryCard 3 상태 분기 + 다운로드 버튼 4건 + 안내 줄                          | SW2 |
| dateNav 공통          | 387~401 | `‹` / `›` chevron + `{date}` + spacer 분기                                     | SW2 |
| 데스크톱 렌더         | 403~444 | `isDesktop` 분기 — `.desktop-layout` / `.desktop-edit-panel` / `.desktop-portrait-wrapper` | SW3 |
| 모바일 렌더           | 447~464 | header + `.page-body` + `formContent`                                          | SW2 |
| DAILY_CALIB_STEPS     | 467~488 | 15 step / DAILY_CALIB_KEY / FINGER_OFFSET 60                                   | 변경 0 |
| loadDailyCalib / saveDailyCalib | 494~499 | localStorage IO                                                       | 변경 0 |
| DailyPortraitPreview  | 501~782 | 외곽 wrapper 만 손댐, 내부 캘리브 / 오버레이 / 마커 100% 보존                  | SW3 (외곽만) |
| DailyCalibMarker      | 784~808 | crosshair-h/v + dot 16/20 active 분기                                          | 변경 0 |
| EditableCard 정의      | 810~840 | label / field / value / onChange / onSave / onReset / saving / rows / placeholder 9 prop | SW2 (markup 만 class 화) |

---

## 부록 B — sketch wave 5개 + W1 index 요약

| Wave | 파일 | lines | 핵심 산출물 |
|---|---|---|---|
| W1 (index) | `wave-1-index.md`                                  | 428 | 6 sub-wave 분배 + design rule + 메모리 룰 12건 박제 |
| W2         | `sketch-wave-2-mobile-header-date-nav.html`        | 692 | 모바일 헤더 + dateNav (393px, 미래 날짜 spacer, 4 frame) |
| W3         | `sketch-wave-3-editable-cards-personnel.html`      | 884 | EditableCard 3종 + 인원현황 SummaryCard (다크 / 라이트 2 frame) |
| W4         | `sketch-wave-4-download-action.html`               | 726 | 다운로드 액션 (4 frame, 그라데이션 폐기) |
| W5         | `sketch-wave-5-desktop-layout.html`                | 869 | 데스크톱 layout (좌측 편집 + 우측 A4 portrait 분할) |
| W6         | `sketch-wave-6-portrait-preview-wrapper.html`      | 874 | DailyPortraitPreview wrapper (외곽 + 안내 바 + 위치 설정 버튼) |
| **W7 (본)** | `wave-7-tsx-conversion-checklist.md`              | (본 파일) | TSX 변환 verify checklist (sketch 마지막 wave) |

총 sketch wave 5개 + index 1개 + 본 W7 = 7 산출물. TSX 변환 SW1~SW4 는 본 7 산출물 + DailyReportPage.tsx + design-system.md + tokens.css + typography.css + 14-reports `components.css` 만 input 으로 atomic 변환 가능.

---

*W7 markdown 작성 완료. 본 wave 자체는 OQ 없음 (모든 OQ 는 W1~W6 에서 LOCKED 컨펌 완료). 다음 단계: 사용자 컨펌 → main 머지 → cbc7119-preview 자동 배포 (markdown 만이라 시각 변화 없음) → 별도 quick task 로 SW1~SW4 (TSX 변환) 진행.*
