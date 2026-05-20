---
title: "14-reports — W7 TSX 변환 verify checklist"
status: draft
created: 2026-05-20
quick_id: 260520-u3b
branch: redesign/14-reports
source_tsx: cha-bio-safety/src/pages/ReportsPage.tsx
source_tsx_lines: 405
source_preview: cha-bio-safety/src/components/ExcelPreview.tsx
source_preview_lines: 535
sketches_referenced: [W1, W2, W3, W4, W5, W6]
locked_decisions: "W1: 5 / W2~W6 (각 OQ 0~3건 inherit) / W7 (본 wave): 2"
sub_wave_count: 3
verify_gate_count: "≥28 (SW1 8 + SW2 10 + SW3 10)"
mirror_of: cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md
consumed_by: 14-reports TSX 변환 wave (SW1 = components.css 신규 / SW2 = MobileReportsPage / SW3 = DesktopReportsPage) executor
---

# W7 — TSX 변환 verify checklist (14-reports)

> 본 파일은 **sketch HTML 이 아님**. TSX 변환 wave (SW1~SW3) executor 가 1-pass 로 적용할 verify gate + region mapping + LOCKED 룰 박제 markdown.
> source-of-truth: ReportsPage.tsx (405 lines) + ExcelPreview.tsx (535 lines, 무변경) + sketch-wave-2~6.html + design-system.md v0.1.1 + tokens.css + typography.css.
> 13-schedule W7 (`cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md`, 520 lines) 패턴 mirror — 구조 동일, 14-reports 컨텍스트로 재작성.

---

## §1. 개요 (Purpose / Scope / Status)

**§1.1 Purpose:**
TSX 변환 wave 진입 전 W2~W6 sketch 의 모든 룰 (CSS class / 토큰 / LOCKED 결정 / 메모리 룰 / 비즈 로직 보존) 을 한 곳에 박제. 13-schedule W7 mirror 구조 (12 sections) 그대로 14-reports 컨텍스트로 재작성. TSX 변환 wave (SW1~SW3) executor 가 sketch 5개 + ReportsPage.tsx + 본 checklist 만 input 으로 atomic 변환 가능하도록.

**§1.2 Scope:**
- `cha-bio-safety/src/pages/ReportsPage.tsx` (405 lines) v0.1.1 Tailwind + components.css @layer 변환.
- `cha-bio-safety/src/components/ExcelPreview.tsx` (535 lines) **무변경** (W6 OQ #1 LOCKED 일관).
- 신규 파일: `cha-bio-safety/src/styles/components.css` (W7 OQ #1 default a 단일 파일).
- `cha-bio-safety/src/index.css` 에 `@import './styles/components.css';` 추가.

**§1.3 Status:**
sketch W2~W6 완료 + 머지 + cbc7119-preview 자동 배포 완료. 본 W7 = 마지막 sketch wave (markdown 1개). TSX 변환 wave (SW1~SW3) 는 본 wave 산출 후 사용자 OQ 컨펌 받은 뒤 진입.

**§1.4 본 checklist 자체 룰 (self-applied negative gate):**
- 이모지 0건 — Unicode 1F300~1FAFF / 2600~26FF / 2700~27BF 범위 글리프 0.
- 500~700 lines target (13-schedule W7 520줄 mirror).
- 12 sections (§1~§12) 모두 채움 — 빈 section 0.
- W1~W7 LOCKED 결정 verbatim 인용 ≥15 row.
- CSS class verbatim fence ≥30 (sketch W2~W6 의 `<style>` 블록 그대로 인용).
- 메모리 룰 unique feedback_*.md ≥12.
- Tailwind cheatsheet 표 ≥28 row.
- source line ref 표 ≥15 row.
- 비즈 로직 보존 체크박스 ≥15 행.
- verify gate per sub-wave 합계 ≥28 (SW1 8 + SW2 10 + SW3 10).
- OQ ≥4.

---

## §2. W1~W7 LOCKED 인용표 (≥15 row)

본 표는 sketch wave 1~6 + W7 의 LOCKED 결정 박제. TSX 변환 wave executor 는 1 byte 도 바꾸지 않는다.

| Wave | OQ ID | LOCKED 결정 | 본 wave 적용 위치 |
|---|---|---|---|
| W1 | #1 LOCKED | 모바일 카드 그라데이션 → `bg-status-safe-bar` solid 통일 (linear-gradient 폐기) | 모바일 카드 버튼 (line 370) — `.report-card-btn { background: var(--status-safe-bar); }` |
| W1 | #2 LOCKED | 데스크톱 좌측 패널 너비 260px 유지 (source verbatim, `--sidebar-width` 토큰 신규 추가 안 함) | 좌측 sidelist (line 250) — `.sidelist { width: 260px; }` |
| W1 | #3 LOCKED | 데스크톱 상단 바 일괄 다운로드 버튼 그라데이션 → `bg-status-safe-bar` solid 통일 (OQ #1 일관) | 데스크톱 일괄 다운로드 (line 202) — `.toolbar-batch-btn { background: var(--status-safe-bar); }` |
| W1 | #4 LOCKED | 모바일 footer 안내 카피 verbatim 유지 ("다운로드 후 엑셀에서 인쇄 (A4 용지 자동 맞춤 설정됨)") | MobileReportsPage 마지막 div (line 380) — `.page-footer-note` |
| W1 | #5 LOCKED | sub 라인 가운뎃점 → dot span (`<span class="dot-meta" />`) 명시. 13-schedule sub-wave 일관 패턴. | 카드 sub (line 360) + 데스크톱 섹션 B 라벨 "소화전 · 가스 · 비상콘센트" |
| W2 | (sketch only, OQ 0) | 모바일 헤더 + 카드 1매 (DIV early) 패턴 — `bg-surface-page` + `bg-surface-raised border border-border-default rounded-md` | MobileReportsPage 헤더 (line 331~353) + 카드 1매 |
| W3 | #1 LOCKED | 모바일 = 데스크톱 placeholder/칩/hover 미배치 (모바일 sketch 안 데스크톱 영역 0) | MobileReportsPage 영역 한정 — 데스크톱 element 0 |
| W3 | #2 LOCKED | 모바일 카드 그리드 10종 verbatim — REPORT_CARDS 10 entry 카피 변경 0 | MobileReportsPage 카드 그리드 (line 355~377 map) + REPORT_CARDS (line 12~23) |
| W3 | #3 LOCKED | 카드 사이 gap = 10px (margin-bottom) — source verbatim (`var(--card-gap)` 토큰 강제 안 함) | `.report-card { margin-bottom: 10px; }` |
| W4 | #1 LOCKED | 데스크톱 toolbar = sticky 아님 (source line 181 verbatim 비-sticky), 그러나 chrome §3.1 패턴 mirror | DesktopReportsPage toolbar (line 181~243) |
| W4 | #2 LOCKED | 개별 다운로드 버튼 = `bg-surface-sunken border border-border-strong` (보조 위계, 일괄과 색 분리) | `.toolbar-individual-btn` |
| W4 | #3 LOCKED | toolbar = 2열 그리드 아님 (flex row + spacer + flex 1 단일 행) | `.toolbar { display: flex; gap: 12px; }` |
| W5 | #1 LOCKED | confirm 모달 (개별 클릭 시) 미적용 — 선택만 변경, 다운로드는 toolbar 버튼 클릭으로 분리 | DesktopReportsPage sidelist (line 248~295) — onClick = `setSelectedType` |
| W5 | #2 LOCKED | 개별 다운로드 버튼 = surface-sunken (보조 위계) — W4 #2 LOCKED 일관 | `.toolbar-individual-btn` |
| W5 | #3 LOCKED | zip 완료 toast 미적용 — react-hot-toast 기본 처리 (source line 137 `setZipLoading(null)`) | `downloadAllAsZip` (line 112~139) finally 블록 — toast 추가 0 |
| W6 | #1 LOCKED | ExcelPreview.tsx 내부 무변경 — wrapper layout 만 손댐 (line 297~300) | `.preview-wrapper` + ExcelPreview props verbatim |
| W6 | #2 LOCKED | A4 미리보기 박스 = `#ffffff` 다크/라이트 무관 흰배경 고정 + `aspect-ratio: 210/297` | `.a4-preview { background: #ffffff; aspect-ratio: 210/297; }` |
| W6 | #3 LOCKED | 빈 상태 UI 불필요 — ExcelPreview 자체가 데이터 fetch + skeleton 처리, wrapper 는 layout 만 | `.preview-wrapper` 안 ExcelPreview 직접 렌더 (placeholder div 추가 0) |
| **W7** | **#1 LOCKED (본 wave)** | CSS class 처리 = `@layer components` 신규 파일 (`cha-bio-safety/src/styles/components.css` 추가). 페이지별 분리 안 함. | SW1 신규 파일 + `src/index.css` `@import './styles/components.css'` 추가 |
| **W7** | **#2 LOCKED (본 wave)** | sub-wave 분할 = 3 sub-wave (SW1 = components.css 신규 / SW2 = MobileReportsPage / SW3 = DesktopReportsPage), 각 atomic 1-commit | §6 참조 |

**§2.1 status- prefix 룰 (메모리 룰 박제):**
- 정확 패턴 = `bg-status-safe-bar` (v0.1.1, prefix 포함)
- 잘못된 가정 = `bg-safe-bar` (status- 없음) — TSX 변환 시 class 안 먹음 (11-div TSX v3 hotfix(4ce707e) 사고)
- W1 인덱스 §5 메모리 룰 5 (feedback_tailwind_token_class_pattern) 의 "status- prefix 없음" 기술은 **잘못된 표현** — 실제 v0.1.1 `tailwind.config.js` 의 backgroundColor key 는 `status.safe.bar` 중첩이며, class 는 `bg-status-safe-bar` 가 정확. 본 W7 checklist 는 정확한 패턴 (`bg-status-safe-bar`) 로 박제.
- 단, sketch 의 `<style>` 안에서는 `var(--status-safe-bar)` CSS 변수 직접 사용 — components.css 신규 파일도 동일하게 토큰 사용.

---

## §3. W2~W6 CSS class 정의 verbatim 추출 (≥30 class fence)

W2~W6 sketch HTML 의 `<style>` 블록에서 grep 으로 추출한 .class 정의를 fence 안에 verbatim 인용. 각 fence 마다 source 파일 + line range 표기. **SW1 components.css 신규 파일 작성 시 이 fence 의 토큰명/값 그대로 복사** (메모리 룰 4: planner_prompt_sketch_verbatim).

### §3.1 W2/W3 — 모바일 헤더 + 카드 + footer (sketch-wave-2.html line 283~461 / sketch-wave-3.html line 461~467)

dot-meta + frame-shell + global-header-placeholder (sketch-wave-2.html line 283~320 — frame-shell / global-header-placeholder 는 sketch 외부 chrome, TSX 미사용):

```css
.dot-meta { display: inline-block; width: 4px; height: 4px; border-radius: 9999px; background: var(--text-tertiary); flex-shrink: 0; }
.frame-shell { background: var(--surface-page); color: var(--text-primary); border: 1px solid var(--border-default); border-radius: 18px; overflow: hidden; width: 393px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
.global-header-placeholder { height: 48px; background: rgba(0,0,0,0.4); color: #888; display: flex; align-items: center; justify-content: center; font-size: 12px; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-default); }
```

자체 헤더 group — page-header / back-btn / page-title (sketch-wave-2.html line 326~357, ReportsPage.tsx line 331/387~391 매핑). back-btn 34x34 verbatim 보존 (메모리 룰 6: w-8=48px 함정 회피). page-title 14→18 노안 격상:

```css
.page-header { flex-shrink: 0; background: var(--surface-raised); border-bottom: 1px solid var(--border-default); padding: 8px 12px 9px; display: flex; align-items: center; gap: 8px; }
.back-btn { width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0; background: var(--surface-sunken); border: 1px solid var(--border-default); color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.page-title { flex: 1; font-size: 18px; font-weight: 700; color: var(--text-primary); line-height: 1.4; }
```

year-pager group — year-pager / year-pager-slot / year-nav-btn / year-label (sketch-wave-2.html line 359~395, ReportsPage.tsx line 393~398 매핑). year-nav-btn 28x28 verbatim. year-label 13→14 노안 격상:

```css
.year-pager { display: flex; align-items: center; gap: 2px; }
.year-pager-slot { width: 24px; display: flex; justify-content: center; }
.year-nav-btn { width: 28px; height: 28px; border-radius: 7px; border: 1px solid var(--border-default); background: var(--surface-sunken); color: var(--text-primary); font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1; }
.year-label { width: 44px; text-align: center; font-size: 14px; font-weight: 700; color: var(--text-primary); line-height: 1; }
```

본문 group — page-body / page-footer-note (sketch-wave-2.html line 400~403 / sketch-wave-3.html line 461~467). footer 노안 격상 11→12:

```css
.page-body { padding: 12px 16px; background: var(--surface-page); }
.page-footer-note { text-align: center; padding: 8px 16px 20px; font-size: 12px; line-height: 1.6; color: var(--text-tertiary); }
```

카드 group — report-card / report-card-head / report-card-title / report-card-sub / report-card-btn / report-card--loading (sketch-wave-2.html line 410~461). radius 14→12, 제목 13→16, sub 11→12 노안 격상. report-card-btn = W1 OQ #1 LOCKED `bg-status-safe-bar` solid:

```css
.report-card { background: var(--surface-raised); border-radius: 12px; border: 1px solid var(--border-default); padding: 14px; margin-bottom: 10px; }
.report-card-head { margin-bottom: 10px; }
.report-card-title { font-size: 16px; font-weight: 700; color: var(--text-primary); line-height: 1.4; }
.report-card-sub { margin-top: 4px; font-size: 12px; color: var(--text-tertiary); display: flex; align-items: center; gap: 6px; line-height: 1; }
.report-card-btn { width: 100%; padding: 12px; border-radius: 8px; border: 0; background: var(--status-safe-bar); color: var(--text-on-accent); font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
.report-card--loading .report-card-btn { background: var(--surface-sunken); color: var(--text-tertiary); cursor: default; }
```

W2/W3 총 18 class. dot-meta 사용처 = 카드 sub "DIV [dot] 34개소 [dot] 2026년도" 의 가운뎃점 + 데스크톱 sidelist 섹션 B 라벨 "소화전 [dot] 가스 [dot] 비상콘센트" — W1 OQ #5 LOCKED 적용.

### §3.2 W4 — 데스크톱 toolbar (sketch-wave-4.html line 337~426)

toolbar 자체 + 라벨/select (line 337~365, source line 181/190/306~313 매핑). toolbar-select 가 SELECT_STYLE 상수 대체 (W7 OQ #2 default a):

```css
.toolbar { display: flex; align-items: center; gap: 12px; padding: 8px 16px; border-bottom: 1px solid var(--border-default); background: var(--surface-raised); flex-shrink: 0; }
.toolbar-year-label { font-size: 12px; color: var(--text-secondary); line-height: 1; }
.toolbar-select { background: var(--surface-sunken); color: var(--text-primary); border: 1px solid var(--border-strong); border-radius: 4px; padding: 4px 8px; font-size: 12px; line-height: 1; font-family: inherit; cursor: pointer; }
```

batch button group — toolbar-batch-btn / toolbar-batch-btn--loading (line 369~391). W1 OQ #3 LOCKED `bg-status-safe-bar` solid:

```css
.toolbar-batch-btn { height: 32px; padding: 0 14px; background: var(--status-safe-bar); border: 0; border-radius: 6px; color: var(--text-on-accent); font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; line-height: 1; font-family: inherit; }
.toolbar-batch-btn--loading { background: var(--surface-sunken); color: var(--text-tertiary); cursor: default; }
```

spacer + 선택 타이틀 + 개별 button group — toolbar-spacer / toolbar-selected-title / toolbar-individual-btn / toolbar-individual-btn--loading (line 394~426). W4 OQ #2 LOCKED 개별 다운로드 = `bg-surface-sunken` 보조 위계:

```css
.toolbar-spacer { flex: 1; }
.toolbar-selected-title { font-size: 14px; font-weight: 700; color: var(--text-primary); line-height: 1; }
.toolbar-individual-btn { height: 32px; padding: 0 14px; background: var(--surface-sunken); border: 1px solid var(--border-strong); border-radius: 6px; color: var(--text-primary); font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; line-height: 1; font-family: inherit; }
.toolbar-individual-btn--loading { opacity: 0.5; cursor: default; }
```

W4 총 9 class.

### §3.3 W5 — 데스크톱 sidelist (sketch-wave-5.html line 346~406)

sidelist 자체 + 섹션 헤더 + row variant 5종 + row text variant 3종 (source line 250~292 매핑). W1 #2 LOCKED 260px verbatim. row title 13→14, row sub 11→12 노안 격상:

```css
.sidelist { width: 260px; flex-shrink: 0; border-right: 1px solid var(--border-default); overflow-y: auto; background: var(--surface-raised); }
.sidelist-section-header { padding: 8px 16px 4px; font-size: 12px; font-weight: 700; color: var(--text-tertiary); letter-spacing: 0.05em; line-height: 1; }
.sidelist-row { padding: 8px 16px; cursor: pointer; background: transparent; border-left: 3px solid transparent; }
.sidelist-row--selected { background: var(--surface-sunken); border-left: 3px solid var(--accent); }
.sidelist-row--hover { background: var(--surface-sunken); border-left: 3px solid transparent; }
.sidelist-row-title { font-size: 14px; color: var(--text-primary); font-weight: 400; }
.sidelist-row-title--selected { color: var(--accent); font-weight: 700; }
.sidelist-row-sub { font-size: 12px; color: var(--text-tertiary); margin-top: 1px; }
```

W5 총 8 class.

### §3.4 W6 — 데스크톱 preview wrapper (sketch-wave-6.html line 450~528)

preview-wrapper + a4-preview + a4 내부 5종 (source line 297~300 매핑 + sketch 내부). W6 #1 LOCKED ExcelPreview 무변경, wrapper layout 만 변환. W6 #2 LOCKED a4-preview = `#ffffff` 다크/라이트 무관 흰배경 고정. a4-preview-* 5 class 는 sketch only (W6 OQ #4 default c — TSX 변환 시 실제 wrapper 에 placeholder 추가 안 함, ExcelPreview 가 처리):

```css
.preview-wrapper { flex: 1; overflow: hidden; background: var(--surface-page); display: flex; align-items: flex-start; justify-content: center; padding: 32px; }
.a4-preview { width: 100%; max-width: 595px; aspect-ratio: 210 / 297; background: #ffffff; border: 1px solid var(--border-default); box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-radius: 4px; overflow: hidden; display: flex; flex-direction: column; padding: 32px 28px; }
.a4-preview-title { font-size: 18px; font-weight: 700; color: #1f2328; text-align: center; margin-bottom: 8px; letter-spacing: -0.02em; }
.a4-preview-meta { font-size: 12px; color: #656d76; text-align: center; margin-bottom: 24px; letter-spacing: 0.05em; }
.a4-preview-table-placeholder { flex: 1; display: grid; grid-template-columns: 1.4fr repeat(12, 1fr); gap: 0; border: 1px dashed #d0d7de; border-radius: 2px; font-size: 12px; color: #656d76; align-items: center; justify-items: center; text-align: center; overflow: hidden; }
.a4-preview-cell { padding: 8px 4px; border: 1px dashed #d0d7de; font-size: 12px; color: #656d76; height: 100%; display: flex; align-items: center; justify-content: center; }
.a4-preview-cell--header { background: #f6f8fa; font-weight: 700; color: #1f2328; }
```

W6 총 7 class.

### §3.5 총합 + SW1 components.css 작성 대상

총 unique class 정의 = 42 (W2/W3 18 + W4 9 + W5 8 + W6 7). SW1 신규 components.css 작성 시 TSX 변환에서 실제 사용할 class = 35종:
`.dot-meta` / `.page-header` / `.back-btn` / `.page-title` / `.year-pager` / `.year-pager-slot` / `.year-nav-btn` / `.year-label` / `.page-body` / `.report-card` / `.report-card-head` / `.report-card-title` / `.report-card-sub` / `.report-card-btn` / `.report-card--loading` / `.page-footer-note` / `.toolbar` / `.toolbar-year-label` / `.toolbar-select` / `.toolbar-batch-btn` / `.toolbar-batch-btn--loading` / `.toolbar-spacer` / `.toolbar-selected-title` / `.toolbar-individual-btn` / `.toolbar-individual-btn--loading` / `.sidelist` / `.sidelist-section-header` / `.sidelist-row` / `.sidelist-row--selected` / `.sidelist-row--hover` / `.sidelist-row-title` / `.sidelist-row-title--selected` / `.sidelist-row-sub` / `.preview-wrapper` / `.a4-preview`.

`.frame-shell` / `.global-header-placeholder` / `.a4-preview-title` / `.a4-preview-meta` / `.a4-preview-table-placeholder` / `.a4-preview-cell` / `.a4-preview-cell--header` 7 class 는 sketch 외부 chrome 또는 ExcelPreview 내부 처리 영역으로 components.css 작성 대상 외.

---

## §4. Tailwind cheatsheet (잘못된 표기 박제 예방) — 표 ≥28 row

본 cheatsheet 는 SW2/SW3 TSX 변환 시 인라인 style → className 매핑 reference. components.css 신규 파일은 var() 토큰 직접 사용이므로 Tailwind class 패턴은 SW2/SW3 변환 wave executor 가 참조.

**§4.1 색/표면 토큰 1:1 매핑 (≥14 row):**

| 옛 토큰 / 옛 hex | v0.1.1 Tailwind class | 토큰 CSS 변수 |
|---|---|---|
| `var(--bg)` | `bg-surface-page` | `--surface-page` |
| `var(--bg2)` | `bg-surface-raised` | `--surface-raised` |
| `var(--bg3)` | `bg-surface-sunken` | `--surface-sunken` |
| `var(--bd)` | `border-border-default` | `--border-default` |
| `var(--bd2)` | `border-border-strong` | `--border-strong` |
| `var(--t1)` | `text-text-primary` | `--text-primary` |
| `var(--t2)` | `text-text-secondary` | `--text-secondary` |
| `var(--t3)` | `text-text-tertiary` | `--text-tertiary` |
| `var(--acl)` | `bg-accent` / `text-accent` / `border-accent` | `--accent` |
| `#ffffff` (text-on-accent) | `text-text-on-accent` | `--text-on-accent` |
| `var(--safe)` | `text-status-safe-bar` / `bg-status-safe-bar` | `--status-safe-bar` |
| `var(--warn)` | `text-status-warning-bar` / `bg-status-warning-bar` | `--status-warning-bar` |
| `var(--danger)` | `text-status-danger-bar` / `bg-status-danger-bar` | `--status-danger-bar` |
| `var(--info)` | `text-status-info-bar` / `bg-status-info-bar` | `--status-info-bar` |
| `var(--fire)` | `text-status-fire-bar` / `bg-status-fire-bar` | `--status-fire-bar` |

**§4.2 Typography 매핑 (≥7 row):**

| 옛 인라인 | v0.1.1 Tailwind class | px |
|---|---|---|
| `fontSize: 9~11` | `text-caption` (노안 격상) | 12 |
| `fontSize: 12` | `text-caption` | 12 |
| `fontSize: 13` | `text-label` | 13 |
| `fontSize: 14` | `text-body-sm` | 14 |
| `fontSize: 15` | `text-title` (노안 격상) | 18 |
| `fontSize: 16` | `text-body` | 16 |
| `fontSize: 18` | `text-title` | 18 |
| `fontSize: 22` | `text-heading` | 22 |
| `fontSize: 28` | `text-display` | 28 |

**§4.3 Radius 매핑 (≥4 row):**

| 옛 인라인 | Tailwind class | px |
|---|---|---|
| `borderRadius: 4` | `rounded-[4px]` arbitrary | 4 |
| `borderRadius: 6~7` | `rounded-[6px]` / `rounded-[7px]` arbitrary | 6/7 |
| `borderRadius: 8` | `rounded-sm` | 8 |
| `borderRadius: 12` | `rounded-md` | 12 |
| `borderRadius: 14` | `rounded-[14px]` arbitrary 또는 12 토큰 매핑 | 14 |
| `borderRadius: 16` | `rounded-lg` | 16 |
| `borderRadius: 9999` (dot) | `rounded-full` | full |

**§4.4 Lucide icon 매핑 (≥4 row):**

| 사용처 | lucide 컴포넌트 | size prop |
|---|---|---|
| 모바일 카드 다운로드 버튼 (line 374, ⬇ 이모지 제거 대체) | `<Download size={14} />` | 14 |
| 모바일 헤더 뒤로 버튼 (line 332~336 SVG 치환) | `<ChevronLeft size={15} />` | 15 |
| 모바일 헤더 ‹ 토글 (옵션, line 343) | `<ChevronLeft size={20} />` | 20 |
| 모바일 헤더 › 토글 (옵션, line 349, 미사용 — 텍스트 ›/‹ 유지 가능) | `<ChevronRight size={20} />` | 20 |
| 데스크톱 일괄 다운로드 (line 215, SVG 치환) | `<Download size={14} />` | 14 |
| 데스크톱 개별 다운로드 (line 241, SVG 치환) | `<Download size={14} />` | 14 |

**§4.5 status- prefix 룰 (메모리 룰 박제):**
- 정확 패턴 = `text-status-{safe|warning|danger|info|fire}-bar` (v0.1.1)
- 잘못된 가정 = `text-safe-bar` (status- 없음) — class 안 먹음, 11-div TSX v3 hotfix(4ce707e) 사고
- W2~W6 sketch 의 `<style>` 안에서는 `var(--status-safe-bar)` CSS 변수 직접 사용 — components.css 도 동일.
- Tailwind class 형태로는 `bg-status-safe-bar` (prefix 포함) 가 정확.
- W1 인덱스 §5 의 메모리 룰 5 표현은 부정확 — 본 W7 checklist 가 정확한 패턴으로 정정 박제.

**§4.6 w-8 h-8 함정 (메모리 룰 박제):**
- `cha-bio-safety/tailwind.config.js` 의 `theme.extend.spacing` 에서 `w-8 = 48px` override (기본 32 아님), `w-7 = 32px`.
- iconBtn 34x34 (line 387~391) → CSS class `.back-btn { width: 34px; height: 34px; }` verbatim 유지 (sketch W2 line 337~349 동일).
- navBtn 28x28 (line 393~398) → CSS class `.year-nav-btn { width: 28px; height: 28px; }` verbatim 유지.
- TSX 변환 wave 에서 `w-8 h-8` 패턴 사용 금지 (48px 사고). `w-7 h-7` (32px) 또는 `w-[34px] h-[34px]` arbitrary 명시.

총 cheatsheet row = 15 (색/표면) + 9 (typography) + 7 (radius) + 6 (lucide) = 37 row.

---

## §5. NEGATIVE scope (변경 절대 금지) — ≥6 sub-section

source 의 비즈 로직 / 카피 / 시그니처는 본 변환에서 1 byte 도 바꾸지 않는다. git diff 에 잡히면 안 됨. 모든 카피는 verbatim 인용.

**§5.1 비즈 로직 보존 (시그니처 diff 0):**

| 함수 | Source line | 시그니처 |
|---|---|---|
| `downloadReport(type, year)` | line 39~71 | `async (type: ReportType, year: number): Promise<void>` |
| `generateReportBlob(type, year)` | line 74~109 | `async (type: ReportType, year: number): Promise<{ blob: Blob; filename: string } \| null>` |
| `downloadAllAsZip(year, month, onProgress)` | line 112~139 | `async (year: number, month: number, onProgress: (msg: string) => void): Promise<void>` |
| `handleDownload(type)` Desktop | line 157~164 | `async (type: ReportType): Promise<void>` |
| `handleDownload(card.type)` Mobile | line 320~327 | 동형 (모바일 wrapper) |
| `handleDownloadAll()` Desktop | line 166~173 | `async (): Promise<void>` — Desktop only |

**§5.2 API call signature:**
- `api.get<any[]>('/reports/div?year=${year}&timing=${timing}')` — DIV early/late 2 호출 (line 41, 76 등)
- `api.get<any[]>('/reports/check-monthly?year=${year}&category=${encodeURIComponent(...)}')` — 카테고리 8종 — encodeURIComponent 적용 위치 동일.

**§5.3 외부 라이브러리 호출:**
- `generateDivExcel(year, data, timing, asBlob?)` — utils/generateExcel.ts (line 46, 81)
- `generateCheckExcel(year, data, type, asBlob?)` (line 62, 100)
- `generateMatrixExcel(year, data, sheetIndex, itemCount, name, inspectorRow?, asBlob?)` (line 67, 105 — MATRIX_CONFIG 4 entry 분기)
- `generatePumpExcel(year, data, asBlob?)` (line 70, 108)
- `zipSync(files, { level: 6 })` — fflate (line 129) — `await import('fflate')` 동적 import.
- `URL.createObjectURL` + `a.click()` + `URL.revokeObjectURL` pattern + `setTimeout(..., 1000)` (line 131~138) — 다운로드 트리거 룰 verbatim.

**§5.4 상수 + 데이터 구조 (변경 0):**

| 상수 | Source line | 값 |
|---|---|---|
| `REPORT_CARDS` | line 12~23 | 10 entry { type, title, sub } verbatim — DIV early/late (월초/월말), 소화전, 청정소화약제, 비상콘센트, 피난방화, 방화셔터, 제연, 자탐, 소방펌프 |
| `MATRIX_CONFIG` | line 25~30 | 4 entry { category, sheetIndex, itemCount, name, inspectorRow? } — 피난방화 / 방화셔터 / 제연 / 자탐 |
| `DESKTOP_SECTIONS` | line 142~147 | 4 entry { label, types[] } — 섹션 A/B/C/D |
| `ANNUAL_TYPES` | line 36 | Set<ReportType> 4종 (자탐/방화셔터/제연/소방펌프) |
| `CURRENT_YEAR` | line 32 | 2026 |
| `MIN_YEAR` | line 33 | 2023 |
| `ASSISTANTS` | line 50, 87 | `['석현민', '김병조', '박보융']` — 자탐/방화셔터/제연 한정 랜덤 채움 |

**§5.5 React hooks + state:**
- `useIsDesktop()` 분기 (line 402)
- useState 5종 (year, selectedType, loading, zipLoading, hoverType) — initial value + setter signature 보존.
- `selectedType` initial = `'div-early'` (line 151).
- `selectedCard = REPORT_CARDS.find(c => c.type === selectedType)` (line 152).

**§5.6 ASSISTANTS 랜덤 채움 룰 verbatim (line 49~57 = downloadReport / line 86~93 = generateReportBlob):**

```typescript
if (['자탐', '방화셔터', '제연'].includes(type) && data.length > 0) {
  const ASSISTANTS = ['석현민', '김병조', '박보융']
  for (const cp of data) {
    for (const m of Object.keys(cp.months ?? {})) {
      if (!cp.months[m].inspector) {
        cp.months[m].inspector = ASSISTANTS[Math.floor(Math.random() * ASSISTANTS.length)]
      }
    }
  }
}
```

분기 조건 + array literal + Math.floor 호출 + 변수명 모두 변경 0.

**§5.7 ExcelPreview.tsx 무변경:**
- 0 line 수정 (535 lines 전체 그대로).
- W6 OQ #1 LOCKED b) 일관 — wrapper layout (line 297~300) 만 변환, 내부 ExcelPreview 컴포넌트는 손대지 않음.
- `<ExcelPreview reportType={selectedType} year={year} month={month} />` props 시그니처 verbatim 유지 (line 299).

**§5.8 외부 컴포넌트 import (line 1~7 영역 — verbatim 보존 + 확장만 OK):**

```typescript
import { useState } from 'react'                                              // line 1
import { useNavigate } from 'react-router-dom'                                // line 2 (Mobile 만 사용)
import { Download } from 'lucide-react'                                       // line 3 — SW2 에서 ChevronLeft 추가 확장
import { api } from '../utils/api'                                            // line 4
import { generateDivExcel, generateCheckExcel,
         generateMatrixExcel, generatePumpExcel } from '../utils/generateExcel'  // line 5
import { ExcelPreview } from '../components/ExcelPreview'                     // line 6
import { useIsDesktop } from '../hooks/useIsDesktop'                          // line 7
```

SW2 변환 시 line 3 확장: `import { Download, ChevronLeft } from 'lucide-react'`.

**§5.9 month state 처리 (Desktop 만):**
- `const month = new Date().getMonth() + 1` (line 153) — ExcelPreview props 의 month 인자. setter 없음 (read-only).
- ZIP 다운로드 시 `downloadAllAsZip(year, month, ...)` 호출에서 사용 (line 169).

---

## §6. 3 Sub-wave 분할 (W7 OQ #2 LOCKED) — atomic 1-commit per SW

변환 wave 가 ReportsPage.tsx (405 lines) 의 두 영역 (모바일 line 316~385 + 데스크톱 line 149~304) + CSS 신규 1 파일 = 총 3개 atomic commit. 각 sub-wave 단위로 revert 가능.

**SW1 — CSS @layer 정의 + tokens.css 확인** (atomic commit 1):
- 신규 파일: `cha-bio-safety/src/styles/components.css` (W7 OQ #1 default a 단일 파일).
- 30+ CSS class @layer components 안에 정의 (W2~W6 sketch 의 `<style>` 블록 verbatim 인용, `var(--token)` 사용).
- `cha-bio-safety/src/index.css` 에 `@import './styles/components.css';` 추가 (현재 tokens.css + typography.css 2건 → 3건).
- `npm run build` PASS / `npx tsc --noEmit` PASS.
- ReportsPage.tsx / ExcelPreview.tsx 0 line 수정 (SW1 은 CSS 신규만).
- 커밋: `style(14-reports): SW1 — components.css @layer 신규 (30+ class verbatim from sketch W2~W6)`.

**SW2 — MobileReportsPage 변환** (atomic commit 2):
- 대상: ReportsPage.tsx line 316~385 영역 — 자체 헤더 + 카드 그리드 10종 + footer.
- 인라인 style → className= (위 components.css class 사용).
- `iconBtn` / `navBtn` 상수 (line 387~391, 393~398) → CSS class 대체 (W7 OQ #3 default a — `.back-btn` / `.year-nav-btn` 사용) 또는 유지 결정.
- lucide `ChevronLeft` 추가 import (Download 는 이미 line 3).
- 카드 sub "DIV · 34개소 · {year}년도" → dot span 변환 (`<span className="dot-meta" />`, W1 OQ #5 LOCKED).
- ⬇ 이모지 (line 374 U+2B07) 제거 — lucide `<Download size={14} />` 로 치환 (메모리 룰 8: tsx_wave_emoji_dot_gap).
- 비즈 로직 보존: handleDownload (line 320~327) signature 동일, downloadReport 호출 동일.
- `npm run build` PASS / `npx tsc --noEmit` PASS.
- 커밋: `tsx(14-reports): SW2 — MobileReportsPage Tailwind 변환 (이모지 제거, dot span 도입, 그라데이션 폐기)`.

**SW3 — DesktopReportsPage 변환** (atomic commit 3):
- 대상: ReportsPage.tsx line 149~304 영역 — 상단 toolbar + 좌측 sidelist + 우측 preview-wrapper.
- 인라인 style → className= (components.css).
- DESKTOP_SECTIONS 4 섹션 변환 — 섹션 B 라벨 "소화전 · 가스 · 비상콘센트" 의 가운뎃점 → dot span 변환 (W1 OQ #5 LOCKED, sidelist-section-header 안).
- SELECT_STYLE 처리 = W7 OQ #2 default a — `.toolbar-select` CSS class 로 대체 (line 306~313 상수 폐기).
- selectedType / hoverType state + handleDownload + handleDownloadAll 시그니처 동일 (line 157~173).
- 비즈 로직 보존: ASSISTANTS 랜덤 채움 룰 동일 (line 49~57 / 86~93).
- `npm run build` PASS / `npx tsc --noEmit` PASS.
- 커밋: `tsx(14-reports): SW3 — DesktopReportsPage Tailwind 변환 (toolbar/sidelist/preview-wrapper, dot span, 그라데이션 폐기)`.

각 SW 마다 atomic 1-commit. 커밋 메시지 prefix: `style/tsx(14-reports): SW1/SW2/SW3 — ...`.

---

## §7. source line ref 인용표 (≥15 row)

본 표는 SW1~SW3 변환 wave executor 가 line range 별 영역 파악용. ReportsPage.tsx (405 lines) + ExcelPreview.tsx (535 lines) source 좌표.

| 영역 | 파일 | line range | 핵심 내용 |
|---|---|---|---|
| Imports | ReportsPage.tsx | line 1~7 | useState / useNavigate / Download / api / generateExcel 4종 / ExcelPreview / useIsDesktop |
| ReportType union | ReportsPage.tsx | line 9~10 | `'div-early' \| 'div-late' \| '소화전' \| ... \| '소방펌프'` 10종 |
| REPORT_CARDS | ReportsPage.tsx | line 12~23 | 10 entry { type, title, sub } verbatim |
| MATRIX_CONFIG | ReportsPage.tsx | line 25~30 | 4 entry { category, sheetIndex, itemCount, name, inspectorRow? } |
| CURRENT_YEAR / MIN_YEAR | ReportsPage.tsx | line 32~33 | 2026 / 2023 |
| ANNUAL_TYPES | ReportsPage.tsx | line 36 | `new Set<ReportType>(['자탐', '방화셔터', '제연', '소방펌프'])` |
| downloadReport | ReportsPage.tsx | line 39~71 | DIV early/late 분기 + ANNUAL_TYPES Set 분기 + MATRIX_CONFIG 4 분기 + 소방펌프 분기 + ASSISTANTS 랜덤 채움 |
| generateReportBlob | ReportsPage.tsx | line 74~109 | downloadReport 와 동형, blob+filename return (zip 용) |
| downloadAllAsZip | ReportsPage.tsx | line 112~139 | for-of REPORT_CARDS → generateReportBlob → fflate zipSync → URL.createObjectURL + a.click() + setTimeout 1000 |
| DESKTOP_SECTIONS | ReportsPage.tsx | line 142~147 | 4 entry { label, types[] } — 섹션 A/B/C/D |
| DesktopReportsPage | ReportsPage.tsx | line 149~304 | toolbar 180~243 + sidelist 248~295 + preview-wrapper 297~300 |
| SELECT_STYLE 상수 | ReportsPage.tsx | line 306~313 | `{ background, color, border, borderRadius, padding, fontSize, lineHeight }` — W7 OQ #2 default a 시 .toolbar-select 로 대체 |
| MobileReportsPage | ReportsPage.tsx | line 316~385 | header 331~353 + cards map 355~377 + footer 379~381 |
| iconBtn 상수 | ReportsPage.tsx | line 387~391 | `{ width, height, borderRadius, flexShrink, background, border, color, cursor, ... }` — W7 OQ #3 default a 시 .back-btn 으로 대체 |
| navBtn 상수 | ReportsPage.tsx | line 393~398 | 28x28 / borderRadius 7 / `var(--bg3)` — W7 OQ #3 default a 시 .year-nav-btn 으로 대체 |
| Default export | ReportsPage.tsx | line 401~405 | `function ReportsPage() { return useIsDesktop() ? <DesktopReportsPage /> : <MobileReportsPage /> }` |
| ExcelPreview 전체 | ExcelPreview.tsx | line 1~535 | 무변경 명시 (W6 OQ #1 LOCKED, 변환 wave 손대지 않음) |

총 ≥17 row.

---

## §8. 메모리 룰 inline 인용 (≥12건)

각 룰: 파일명 + 1줄 요약 + Why + How to apply (14-reports 컨텍스트). W1 인덱스 §5 의 10건 inherit + 본 wave 추가 2건.

### 룰 1 — `feedback_design_sketch_first.md`
- **요약**: spacing/sizing 도 sketch HTML 시안 먼저 보여주고 승인 받은 후 인라인 적용.
- **Why**: 변경 후 결과를 두 번 보여주는 것보다 sketch 1회 컨펌이 효율적.
- **How to apply (14-reports)**: TSX 변환은 sketch W2~W6 합의 그대로, 재논의 X. SW2/SW3 executor 는 sketch 의 CSS 정의를 components.css 로 옮기는 일만.

### 룰 2 — `feedback_redesign_sketch_rule_enforcement.md`
- **요약**: §6.2 negative rule (위험 임계치 아닌 카드 status 색 금지) / §6.3 §7.1 일관성, executor + verify gate + 자체 검수 4중 강화.
- **Why**: status 색 (fire/danger/warning) 은 의미 fix — 진척률/위험 임계치 외에 미적 색으로 사용하면 정보 위계 무너짐.
- **How to apply (14-reports)**: 다운로드 버튼은 정상 CTA → safe 색 OK (`bg-status-safe-bar`), 카드 배경 status 색 금지 (`bg-surface-raised` 만).

### 룰 3 — `feedback_sketch_realistic_data.md`
- **요약**: 표시 분기/라벨 룰은 코드 그대로, 시각 디자인만 손봄.
- **Why**: sketch 작성 시 "DIV · 34개소" 같은 텍스트를 임의 변경하면 코드 변환 wave 가 deviation 으로 잡힘.
- **How to apply (14-reports)**: REPORT_CARDS 10 entry / ASSISTANTS 3명 / footer 카피 verbatim. SW2/SW3 변환에서 카피 1 byte 변경 0.

### 룰 4 — `feedback_planner_prompt_sketch_verbatim.md`
- **요약**: TSX 변환 wave 진입 시 sketch CSS 정의를 grep 으로 추출해 그대로 인용. 추측한 토큰명/사이즈는 deviation 유발.
- **Why**: planner 가 sketch 의 토큰명을 정확히 알지 못한 상태로 추측하면 executor 가 wave 의 의도와 다른 class 를 적용 (03-qr-scan 6건 사례).
- **How to apply (14-reports)**: 본 W7 §3 의 30+ class 본문 fence 는 sketch-wave-2~6.html `<style>` 블록 verbatim 그대로. SW1 components.css 작성 시 fence 의 토큰명/값 1 byte 도 추측하지 않음.

### 룰 5 — `feedback_tailwind_token_class_pattern.md`
- **요약**: `text-status-{safe|warning|danger|info|fire}-bar` 가 v0.1.1 정확 패턴 + lucide `<Icon size={N} />` (className 의 `w-N h-N` 금지).
- **Why**: 11-div TSX v3 hotfix(4ce707e) 사고 — `bg-safe-bar` (status- 없음) 패턴 사용 시 class 안 먹음.
- **How to apply (14-reports)**: W2~W6 sketch 의 `<style>` 안 `var(--status-safe-bar)` 직접 사용. SW2/SW3 className 형태로는 `bg-status-safe-bar` (prefix 포함) 정확. lucide 아이콘 = `<Download size={14} />` (className `w-3.5 h-3.5` 금지).

### 룰 6 — `feedback_tailwind_w8_h8_is_48px.md`
- **요약**: `tailwind.config.js` 의 `theme.extend.spacing` override — `w-8 = 48px` (기본 32 아님), `w-7 = 32px`.
- **Why**: 11-div 백버튼 1.5배 사고(54a1c8d) — `w-8 h-8` 로 32px 의도했는데 실제 48px 적용.
- **How to apply (14-reports)**: iconBtn 34x34 (line 387~391) → `.back-btn` CSS class 안 `width: 34px; height: 34px;` verbatim. navBtn 28x28 (line 393~398) → `.year-nav-btn` 안 `width: 28px; height: 28px;`. SW2/SW3 변환에서 `w-8 h-8` Tailwind 사용 금지.

### 룰 7 — `feedback_text_caption_leading_none.md`
- **요약**: 작은 컨테이너 (h-7=32px / 칩 / 일자 셀 등) 안 `text-caption` (lh 1.5 = 18px) 은 시각적 패딩 유발 → `leading-none` 명시.
- **Why**: 작은 컨테이너 안 text-caption 이 line-height 1.5 때문에 의도보다 위/아래 시각 패딩 발생.
- **How to apply (14-reports)**: §3 fence 의 `.year-label`, `.year-nav-btn`, `.toolbar-year-label`, `.toolbar-batch-btn`, `.toolbar-selected-title`, `.toolbar-individual-btn`, `.sidelist-section-header`, `.report-card-sub` 모두 `line-height: 1;` 명시 완료. SW1 components.css 작성 시 verbatim 유지.

### 룰 8 — `feedback_tsx_wave_emoji_dot_gap.md`
- **요약**: alias sed-replace 만 X. sketch negative gate (이모지 0) + dot span 추가 markup 도 verify.
- **Why**: sketch 의 target/down arrow 같은 이모지 글리프 (U+1F3AF / U+2B07 등) 가 TSX 변환에서 빠지지 않고 그대로 남는 사고. dot span 추가 markup 도 자동 적용 안 됨.
- **How to apply (14-reports)**: 모바일 카드 line 374 `'엑셀 다운로드'` 앞 down-arrow glyph (U+2B07) 이모지 제거 + lucide `<Download size={14} />` 로 교체. 카드 sub 가운뎃점 -> `<span className="dot-meta" />` 명시 (모바일 카드 + 데스크톱 sidelist 섹션 B 라벨 양쪽).

### 룰 9 — `feedback_tsx_wave_stat_card_drift.md`
- **요약**: executor 가 source outline 패턴 보존, sketch 새 패턴 누락 가능. plan 에 verbatim 인용 + verify gate 권장.
- **Why**: source 의 fontSize/색 패턴이 sketch 의 새 룰 (`bg-surface-raised border-l-[3px] border-accent`) 을 덮어쓰는 사고.
- **How to apply (14-reports)**: **14-reports 에는 Stat Card 가 없음 — design-system.md §6.2 / §7 Stat Card 룰 미적용**. W1 인덱스 §3.5 에서 이미 명시. SW1~SW3 변환 wave executor 는 Stat Card 룰 적용 deviation 으로 잡지 말 것 (실제로 14-reports 에 적용 대상 element 없음).

### 룰 10 — `feedback_avoid_premature_confirmation.md`
- **요약**: "거의 일치" 자신감 표현 금지. 결과 보여주고 사용자 판단.
- **Why**: 시각 작업은 사용자 인지에 의존 — Claude 의 "approved" 자체 판단은 무의미.
- **How to apply (14-reports)**: SW1~SW3 변환 후 사용자 컨펌 명시 받은 후 main 머지. "변환 완벽 / 다음 sub-wave 진입" 같은 자신감 표현 금지. cbc7119-preview 자동 배포 후 사용자 검수 결과 대기.

### 룰 11 — `feedback_check_branch_before_edit.md` (본 wave 추가 1)
- **요약**: 작업 시작 전 브랜치 확인 필수. main 단일-trunk 운영. main 아니거나 dirty 면 편집/배포 전 사용자에게 먼저 컨펌.
- **Why**: redesign/NN 브랜치 안에서 작업하지 않으면 main trunk 오염 위험.
- **How to apply (14-reports)**: SW1 진입 직전 `git branch --show-current = redesign/14-reports` 확인. dirty (`git status --short` 0 lines) 확인. 다른 워크트리 작업 중이면 stash 후 진입.

### 룰 12 — `feedback_cbc7119_design_never_wrangler.md` (본 wave 추가 2)
- **요약**: 디자인 wave 중 `wrangler --project-name=cbc7119` 절대 X. main push 자동 cbc7119-preview 만.
- **Why**: 직원 도메인 (`cbc7119.pages.dev`) 은 20260328 워크트리 책임. 디자인 워크트리 (`cbc7119-design`) 에서 wrangler 시도 시 직원 도메인 오염 위험.
- **How to apply (14-reports)**: SW1~SW3 모두 `wrangler` 명령 0건, `npm run deploy` 0건. cbc7119-preview 자동 배포만 (GitHub Actions). `.claude/settings.local.json` deny 강제됨.

총 unique feedback_*.md ≥12 (1~10 W1 inherit + 11~12 본 wave 추가).

---

## §9. 인라인 style 화이트리스트 (TSX 변환 후 잔존 OK) — ≥3 항목

Tailwind/CSS class 으로 표현 안 되거나 안 하는 게 나은 case. 각 인스턴스는 line ref + 사유 inline. 14-reports 는 **동적 색 분기 0건** (카테고리 hex 분기 없음, 모든 색은 정적 토큰) — 인라인 잔존 후보가 매우 적다.

| 케이스 | Source line | 사유 |
|---|---|---|
| ExcelPreview.tsx 내부 인라인 style | ExcelPreview.tsx 전체 | W6 OQ #1 LOCKED 일관, 본 변환 scope 외. 535 lines 전체 그대로 |
| `opacity: loading === selectedType ? 0.5 : 1` (개별 다운로드) | line 237 | `.toolbar-individual-btn--loading` class 조건부 적용으로 회피 권장. 단 인라인 잔존도 OK (`{...isLoading && { opacity: 0.5 }}` 스프레드도 가능) |
| DesktopReportsPage line 178 outer wrapper | line 178 | `style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}` — layout primitive, `className="flex flex-col h-full overflow-hidden"` 변환 권장 |
| DesktopReportsPage line 247 below-toolbar wrapper | line 247 | `style={{ display: 'flex', flex: 1, overflow: 'hidden' }}` — layout primitive, `className="flex flex-1 overflow-hidden"` 변환 권장 |
| ExcelPreview props 자체 (`reportType / year / month`) | line 299 | props 시그니처 — 인라인 style 아님 (대신 props verbatim 보존 명시) |

**0회 강제 (linear-gradient 완전 폐기):**
- `linear-gradient` 0 hit — W1 OQ #1 LOCKED + W1 OQ #3 LOCKED 양쪽 다 토큰 solid.
- source line 202 (데스크톱 일괄) + line 370 (모바일 카드) 양쪽 제거 — 둘 다 `var(--status-safe-bar)` solid 통일.
- verify gate §11 SW2 #4 + SW3 #4 검증.

**0회 강제 (이모지):**
- ⬇ (U+2B07) 모바일 카드 line 374 — `<Download size={14} />` 치환.
- 다른 이모지 0건 (검증: `grep -nP '[\x{1F300}-\x{1FAFF}]|[\x{2600}-\x{27BF}]' ReportsPage.tsx`).

---

## §10. 비즈 로직 보존 verify 체크리스트 (≥15 행)

SW2/SW3 변환 후 변환 전과 동일하게 동작함을 verify. 각 체크박스 = SW3 완료 시점 확인.

- [ ] `downloadReport(type, year)` 시그니처 diff 0 (line 39~71) — `async (type: ReportType, year: number): Promise<void>`
- [ ] `generateReportBlob(type, year)` 시그니처 diff 0 (line 74~109) — return type `Promise<{ blob: Blob; filename: string } \| null>`
- [ ] `downloadAllAsZip(year, month, onProgress)` 시그니처 diff 0 (line 112~139)
- [ ] `handleDownload` state update 동일 (Desktop line 157~164 + Mobile line 320~327) — `setLoading(type) / await downloadReport / setLoading(null)`
- [ ] `handleDownloadAll` setZipLoading 호출 동일 (line 166~173) — `setZipLoading('zip-loading')` initial
- [ ] `selectedType` useState initial `'div-early'` 유지 (line 151)
- [ ] `hoverType` state setter 호출 위치 동일 (line 154, 276~277) — sidelist row onMouseEnter/Leave
- [ ] ASSISTANTS 랜덤 채움 분기 (자탐/방화셔터/제연만) 유지 (line 49~57, 86~93) — array `['석현민', '김병조', '박보융']` verbatim
- [ ] REPORT_CARDS array entries 10개 변경 0 (line 12~23) — type/title/sub verbatim
- [ ] MATRIX_CONFIG record entries 4개 변경 0 (line 25~30)
- [ ] DESKTOP_SECTIONS array entries 4개 변경 0 (line 142~147)
- [ ] `api.get<any[]>('/reports/div?year=...&timing=...')` 호출 URL pattern 동일 (DIV early/late 2 호출)
- [ ] `api.get<any[]>('/reports/check-monthly?year=...&category=...')` 호출 URL pattern 동일 + `encodeURIComponent` 위치 동일
- [ ] `zipSync(files, { level: 6 })` 호출 동일 (line 129)
- [ ] `URL.createObjectURL` → `a.click()` → `URL.revokeObjectURL` pattern + `setTimeout(..., 1000)` 동일 (line 131~138)
- [ ] `useIsDesktop()` hook 분기 유지 (line 402)
- [ ] `ExcelPreview` props 시그니처 verbatim — `reportType / year / month` 3 prop (line 299)
- [ ] `useNavigate(-1)` 호출 위치 동일 (Mobile 헤더 뒤로 버튼, line 332)
- [ ] year ‹/› 토글 분기 동일 — line 342 `year > MIN_YEAR` enable / line 348 `year < CURRENT_YEAR` enable
- [ ] `selectedCard?.title` 동적 표시 동일 (line 220 DesktopReportsPage toolbar)

총 ≥20 row.

---

## §11. verify gate per sub-wave (≥28 항목 total)

각 sub-wave 별 atomic commit 직전 실행할 grep + build + 비즈 보존. 모든 명령 worktree 루트 디렉토리 기준.

### **SW1 gate (≥8) — components.css 신규:**

```bash
# 1. components.css 파일 존재 → 기대: 파일 존재
ls cha-bio-safety/src/styles/components.css

# 2. @layer components 블록 → 기대: ≥1
grep -c '@layer components' cha-bio-safety/src/styles/components.css

# 3. 5개 컴포넌트군 모두 정의 (report-card / toolbar / sidelist / preview-wrapper / a4-preview) → 각 ≥1
for c in report-card toolbar sidelist preview-wrapper a4-preview; do
  grep -c "^[[:space:]]*\.${c}[[:space:]{]" cha-bio-safety/src/styles/components.css
done

# 4. CSS class 정의 → 기대: ≥30
grep -cE '^[[:space:]]*\.[a-zA-Z0-9_-]+[[:space:]]*\{' cha-bio-safety/src/styles/components.css

# 5. var() 토큰 사용 → 기대: ≥10 (surface/text/accent/border)
grep -cE 'var\(--' cha-bio-safety/src/styles/components.css

# 6. linear-gradient → 기대: 0
grep -c 'linear-gradient' cha-bio-safety/src/styles/components.css

# 7. font-size 9·10·11px → 기대: 0 hits (노안 룰)
grep -nE 'font-size:[[:space:]]*(9|10|11)px' cha-bio-safety/src/styles/components.css

# 8. src/index.css @import 추가 ≥1 + build PASS (npx tsc --noEmit + npm run build 둘 다 exit 0)
grep -c "@import './styles/components.css'" cha-bio-safety/src/index.css
cd cha-bio-safety && npx tsc --noEmit && npm run build
```

### **SW2 gate (≥10) — MobileReportsPage:**

```bash
# 1. MobileReportsPage line 316~385 className= → 기대: ≥10
sed -n '316,385p' cha-bio-safety/src/pages/ReportsPage.tsx | grep -cE 'className='

# 2. 인라인 style 카운트 → 기대: ≤5 (변환 전 ≥30 → footer + 잔존 layout primitive 만)
sed -n '316,385p' cha-bio-safety/src/pages/ReportsPage.tsx | grep -cE 'style=\{\{'

# 3. lucide import ChevronLeft + Download 둘 다 포함 → 기대: line 3 hit + ChevronLeft ≥1
grep -nE "from 'lucide-react'" cha-bio-safety/src/pages/ReportsPage.tsx
grep -nE 'ChevronLeft' cha-bio-safety/src/pages/ReportsPage.tsx

# 4. U+2B07 이모지 → 기대: 0 hits (1F300-1FAFF / 2B00-2BFF 양쪽 모두)
grep -nP '[\x{2B00}-\x{2BFF}]|[\x{1F300}-\x{1FAFF}]' cha-bio-safety/src/pages/ReportsPage.tsx

# 5. 가운뎃점 텍스트 본문 dot span 만 → 기대: 0 (단 REPORT_CARDS line 14~22 sub 정의 문자열 안 가운뎃점은 별도 — 표시 시 split + dot span 렌더)
grep -nP ' middle-dot ' cha-bio-safety/src/pages/ReportsPage.tsx

# 6. bg-status-safe-bar (status- prefix 정확) → 기대: ≥1 (모바일 카드 버튼)
grep -nE 'bg-status-safe-bar' cha-bio-safety/src/pages/ReportsPage.tsx

# 7. handleDownload 시그니처 동일 → 기대: ≥1
grep -nE 'const handleDownload = async \(type: ReportType\) =>' cha-bio-safety/src/pages/ReportsPage.tsx

# 8. REPORT_CARDS line 12~23 변경 0 (10 entry verbatim) → 기대: 0 diff
git diff cha-bio-safety/src/pages/ReportsPage.tsx | grep -cE 'REPORT_CARDS|div-early|div-late'

# 9. npm run build + tsc --noEmit → 기대: 둘 다 exit 0
cd cha-bio-safety && npx tsc --noEmit && npm run build

# 10. chunk size → 기대: 30~36KB (변환 전 ~33KB ±10%)
ls -la cha-bio-safety/dist/assets/ReportsPage-*.js
```

### **SW3 gate (≥10) — DesktopReportsPage:**

```bash
# 1. DesktopReportsPage line 149~304 className= → 기대: ≥30
sed -n '149,304p' cha-bio-safety/src/pages/ReportsPage.tsx | grep -cE 'className='

# 2. 인라인 style 카운트 → 기대: ≤8 (변환 전 ≥50 → layout primitive + opacity 동적 잔존만)
sed -n '149,304p' cha-bio-safety/src/pages/ReportsPage.tsx | grep -cE 'style=\{\{'

# 3. lucide Download import 유지 → 기대: ≥1 (line 3)
grep -nE "Download.*from 'lucide-react'|from 'lucide-react'.*Download" cha-bio-safety/src/pages/ReportsPage.tsx

# 4. linear-gradient → 기대: 0 (line 202 그라데이션 폐기)
grep -c 'linear-gradient' cha-bio-safety/src/pages/ReportsPage.tsx

# 5. DESKTOP_SECTIONS 4 섹션 — 섹션 B 라벨 dot span → 기대: ≥2 hits (sidelist B + 카드 sub)
grep -nE 'dot-meta' cha-bio-safety/src/pages/ReportsPage.tsx

# 6. SELECT_STYLE 상수 폐기 + .toolbar-select 사용 → 기대: SELECT_STYLE=0 / toolbar-select ≥1 (W7 OQ #2 default a)
grep -nE 'SELECT_STYLE' cha-bio-safety/src/pages/ReportsPage.tsx
grep -nE 'toolbar-select' cha-bio-safety/src/pages/ReportsPage.tsx

# 7. iconBtn / navBtn 상수 폐기 + .back-btn/.year-nav-btn 사용 → 기대: iconBtn|navBtn=0 / back-btn|year-nav-btn ≥2 (W7 OQ #3 default a)
grep -nE '\b(iconBtn|navBtn)\b' cha-bio-safety/src/pages/ReportsPage.tsx
grep -nE 'back-btn|year-nav-btn' cha-bio-safety/src/pages/ReportsPage.tsx

# 8. ASSISTANTS 랜덤 채움 룰 line 49~57 / 86~93 동일 → 기대: 2 hits (downloadReport + generateReportBlob)
grep -cE "ASSISTANTS = \[" cha-bio-safety/src/pages/ReportsPage.tsx

# 9. npm run build + tsc --noEmit → 기대: 둘 다 exit 0
cd cha-bio-safety && npx tsc --noEmit && npm run build

# 10. handleDownloadAll signature 동일 → 기대: ≥1
grep -nE 'const handleDownloadAll = async \(\) =>' cha-bio-safety/src/pages/ReportsPage.tsx
```

Sub-wave 별 verify gate 총합 = 8 + 10 + 10 = **28**.

---

## §12. OQ (TSX SW1 진입 전 ≥4건, default 명시)

본 W7 산출 후 SW1 진입 전 사용자에게 컨펌 받아야 할 항목. 각 OQ 아래 "default 답" 명시 — 사용자가 별 의견 없으면 이 답으로 진행.

- **OQ #1**: components.css 파일 위치 — (a) `cha-bio-safety/src/styles/components.css` 단일 (장기적으로 다른 페이지 재디자인도 합쳐 운영, 12-staff/13-schedule TSX 변환 시 정해진 패턴 있으면 mirror) / (b) `cha-bio-safety/src/styles/reports.css` 페이지별 분리. **default: (a) 단일** — TSX SW1 진입 시 12-staff/13-schedule 변환 후 패턴 확인 후 결정. 단일 파일이 장기적 유지보수 비용 낮음.

- **OQ #2**: SELECT_STYLE 처리 (line 306~313 상수) — (a) `.toolbar-select` CSS class 로 대체 (인라인 0, 상수 삭제) / (b) 유지 + 토큰 alias 만 v0.1.1 으로 정합. **default: (a) 대체** — `.toolbar-select` 가 verbatim 매핑 (sketch-wave-4.html line 355~365). 상수 폐기로 코드 가독성 향상.

- **OQ #3**: iconBtn / navBtn 상수 처리 (line 387~391, 393~398) — (a) CSS class 로 대체 (`.back-btn` / `.year-nav-btn` 사용) / (b) 유지. **default: (a) 대체** — components.css 의 `.back-btn` / `.year-nav-btn` 이 verbatim 매핑 (sketch-wave-2.html line 337~349, 372~386). 상수 폐기로 인라인 style 0 통일.

- **OQ #4**: A4 미리보기 영역에 `.a4-preview-table-placeholder` 추가 여부 — (a) 실제 wrapper TSX 에 빈 div placeholder 추가 (dashed grid 12 cell) / (b) ExcelPreview.tsx 내부에서 자체 placeholder 처리 / (c) wrapper layout 만 변환 (placeholder 0, ExcelPreview 본체 그대로). **default: (c)** — sketch 의 dashed grid placeholder 는 sketch only, 실제 컴포넌트는 ExcelPreview.tsx 가 처리 (W6 OQ #1 LOCKED 일관). components.css 에 `.a4-preview-table-placeholder` / `.a4-preview-cell` / `.a4-preview-cell--header` 3 class 정의 자체 추가 안 함 (또는 정의는 추가하되 TSX 에서 미사용).

- **OQ #5**: TSX 변환 후 chunk size impact — (a) 의도된 증가 ±5KB OK / (b) ±10KB 이상이면 deviation. **default: (a) ±5KB OK** — components.css 신규 (~3KB) + Tailwind className 길이 증가는 자연스러움. chunk size 30~36KB 이내면 SW2/SW3 gate 통과.

---

**End of W7 checklist.**

> TSX 변환 wave (SW1~SW3) executor 는 본 checklist + sketch-wave-2~6.html + ReportsPage.tsx (405 lines) + ExcelPreview.tsx (535 lines, 무변경) + design-system.md + tokens.css + typography.css 만 input 으로 atomic 변환 가능.
> 13-schedule W7 (`cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md`, 520 lines) 패턴 mirror — 동일 12 sections 구조, 14-reports 컨텍스트로 재작성.

---

## 워크트리 룰 박제 (negative scope 인용용)

본 checklist 작성/실행 시점 모두 다음 룰 강제:
- **wrangler 명령 금지** — 본 워크트리 (cbc7119-design) 는 cbc7119-preview.pages.dev 만 다룸. 직원 도메인 (cbc7119.pages.dev) 은 20260328 워크트리 책임. `wrangler --project-name=cbc7119` 시도 0건. `.claude/settings.local.json` deny 강제.
- **`npm run deploy` 금지** — 직원 도메인 경로. 본 워크트리에서 절대 금지. cbc7119-preview 자동 배포만 (GitHub Actions on main push).
