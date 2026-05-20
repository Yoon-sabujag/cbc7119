---
phase: quick-260520-vut
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/styles/components.css
  - cha-bio-safety/src/index.css
autonomous: true
requirements:
  - REQ-14R-SW1-COMPONENTS-CSS
  - REQ-14R-SW1-INDEX-CSS-IMPORT
tags:
  - redesign
  - 14-reports
  - tsx-conversion
  - sub-wave-1
  - css-extract

must_haves:
  truths:
    - "신규 파일 cha-bio-safety/src/styles/components.css 가 존재하고 @layer components 블록 안에 W2~W6 sketch 의 .class 정의가 verbatim 박제되어 있다"
    - "cha-bio-safety/src/index.css line 3 에 @import './styles/components.css'; 가 1줄 추가되어 있고, tokens.css / typography.css 다음 순서다"
    - "main.tsx / ReportsPage.tsx / ExcelPreview.tsx / App.tsx / tokens.css / typography.css 는 1 byte 도 변경되지 않았다 (git diff = 0 line)"
    - "components.css 안에 SW2/SW3 가 className 으로 참조할 35종 핵심 class 가 모두 정의되어 있다 (.report-card / .toolbar / .sidelist / .preview-wrapper / .a4-preview / 그 외 30+)"
    - "npm run build + npx tsc --noEmit 모두 exit 0"
    - "components.css 안 linear-gradient = 0, font-size 9·10·11px = 0 (노안 룰)"
  artifacts:
    - path: "cha-bio-safety/src/styles/components.css"
      provides: "W2~W6 sketch 의 모든 .class 정의 verbatim (@layer components 안)"
      contains: "@layer components"
    - path: "cha-bio-safety/src/index.css"
      provides: "@import './styles/components.css' 1줄 추가 (line 3 영역)"
      contains: "@import './styles/components.css'"
  key_links:
    - from: "cha-bio-safety/src/index.css"
      to: "cha-bio-safety/src/styles/components.css"
      via: "@import"
      pattern: "@import\\s+'./styles/components.css'"
    - from: "cha-bio-safety/src/main.tsx"
      to: "cha-bio-safety/src/index.css"
      via: "기존 import './index.css' (이미 존재, 무수정)"
      pattern: "import './index.css'"
    - from: "cha-bio-safety/src/styles/components.css"
      to: "cha-bio-safety/src/styles/tokens.css"
      via: "var(--surface-* / --text-* / --accent / --border-* / --status-safe-bar) 토큰 참조"
      pattern: "var\\(--"
---

<objective>
14-reports redesign TSX 변환의 **Sub-Wave 1 (SW1)** — CSS class verbatim 추출 + 글로벌 등록.

**Purpose:** SW2(MobileReportsPage)/SW3(DesktopReportsPage) 가 className 으로 참조할 class 정의를 별도 파일로 먼저 분리해서 TSX 변환을 atomic 으로 만든다. 인라인 style 폭증 (~80+ 인라인) → className 30+ 로 줄이려면, 먼저 class 정의가 글로벌하게 존재해야 한다.

**Output:**
- 신규: `cha-bio-safety/src/styles/components.css` — W2~W6 sketch `<style>` 안 .class 정의 verbatim 박제 (@layer components 블록)
- 수정: `cha-bio-safety/src/index.css` — line 3 영역에 `@import './styles/components.css';` 1줄 추가

**Negative scope (변경 0 line):**
- `cha-bio-safety/src/pages/ReportsPage.tsx` (SW2/SW3 책임)
- `cha-bio-safety/src/components/ExcelPreview.tsx` (W6 #1 LOCKED 무변경)
- `cha-bio-safety/src/main.tsx` (이미 index.css import 됨)
- `cha-bio-safety/src/App.tsx`
- `cha-bio-safety/src/styles/tokens.css` / `typography.css`
- 다른 페이지/컴포넌트 일체

**메모리 룰 박제:**
- `feedback_planner_prompt_sketch_verbatim` — sketch `<style>` 안 .class 정의를 grep 으로 추출해 그대로 인용
- `feedback_tailwind_token_class_pattern` — status- prefix 포함 (`var(--status-safe-bar)` 토큰 직접 사용은 OK)
- `feedback_tailwind_w8_h8_is_48px` — back-btn 34x34 / year-nav-btn 28x28 px 값 verbatim (Tailwind utility X)
- `feedback_text_caption_leading_none` — class 정의 안 font-size 12px 마지노선 (9·10·11 금지)
- `feedback_tsx_wave_emoji_dot_gap` — components.css 본문에 이모지 0 (comment 제외)
- `feedback_cbc7119_design_never_wrangler` — 본 wave 에서 wrangler 사용 절대 X (cbc7119-preview 자동 배포만)
- `feedback_check_branch_before_edit` — `redesign/14-reports` 브랜치 위에서 작업 (이미 확인됨)
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.local.md
@cha-bio-safety/docs/redesign-context/14-reports/wave-7-tsx-conversion-checklist.md
@cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-2-mobile-header-card.html
@cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-3-mobile-card-list.html
@cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-4-desktop-toolbar.html
@cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-5-desktop-sidelist.html
@cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-6-desktop-preview-wrapper.html
@cha-bio-safety/src/index.css
@cha-bio-safety/src/styles/tokens.css
@cha-bio-safety/src/styles/typography.css
@cha-bio-safety/src/main.tsx
@cha-bio-safety/src/pages/ReportsPage.tsx

<verified_facts>
환경 사전 확인 결과 (Planner 가 직접 확인 완료):

1. `cha-bio-safety/src/main.tsx` line 4 = `import './index.css'` 만 (tokens.css 직접 import 안 함). 따라서 main.tsx 는 무수정.
2. `cha-bio-safety/src/index.css` line 1~2 = `@import './styles/tokens.css'; @import './styles/typography.css';`. 진짜 entry 가 index.css 이므로 components.css 도 여기에 import.
3. `cha-bio-safety/src/styles/` 디렉토리 존재 (현재 tokens.css + typography.css 만). components.css 신규 추가 위치로 적절.
4. 현재 브랜치 = `redesign/14-reports` (clean working tree). 작업 시작 OK.
5. `cha-bio-safety/src/styles/tokens.css` 안 모든 토큰 (`--surface-page` / `--surface-raised` / `--surface-sunken` / `--text-primary` / `--text-secondary` / `--text-tertiary` / `--text-on-accent` / `--border-default` / `--border-strong` / `--accent` / `--status-safe-bar`) 다크/라이트 양쪽 정의 확인됨. components.css 안 var() 참조 모두 resolve.
</verified_facts>

<interfaces>
**W7 §3 의 verbatim CSS 인용 (Planner 가 W7 checklist line 99~199 에서 추출)** — 이 fence 안 정의를 components.css 에 그대로 박제. raw hex 4개(`#ffffff` / `#1f2328` / `#656d76` / `#f6f8fa` / `#d0d7de`) 는 A4 내부 라이트 컨텍스트 고정으로 var() 미사용 의도적.

```css
/* §3.1 W2/W3 — 모바일 헤더 + 카드 + footer */

/* dot-meta — sketch-wave-2.html line ~283, 카드 sub + sidelist B 라벨 dot span */
.dot-meta { display: inline-block; width: 4px; height: 4px; border-radius: 9999px; background: var(--text-tertiary); flex-shrink: 0; }

/* 자체 헤더 group */
.page-header { flex-shrink: 0; background: var(--surface-raised); border-bottom: 1px solid var(--border-default); padding: 8px 12px 9px; display: flex; align-items: center; gap: 8px; }
.back-btn { width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0; background: var(--surface-sunken); border: 1px solid var(--border-default); color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.page-title { flex: 1; font-size: 18px; font-weight: 700; color: var(--text-primary); line-height: 1.4; }

/* year-pager group */
.year-pager { display: flex; align-items: center; gap: 2px; }
.year-pager-slot { width: 24px; display: flex; justify-content: center; }
.year-nav-btn { width: 28px; height: 28px; border-radius: 7px; border: 1px solid var(--border-default); background: var(--surface-sunken); color: var(--text-primary); font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1; }
.year-label { width: 44px; text-align: center; font-size: 14px; font-weight: 700; color: var(--text-primary); line-height: 1; }

/* 본문 group */
.page-body { padding: 12px 16px; background: var(--surface-page); }
.page-footer-note { text-align: center; padding: 8px 16px 20px; font-size: 12px; line-height: 1.6; color: var(--text-tertiary); }

/* 카드 group — W1 OQ #1 LOCKED bg-status-safe-bar solid */
.report-card { background: var(--surface-raised); border-radius: 12px; border: 1px solid var(--border-default); padding: 14px; margin-bottom: 10px; }
.report-card-head { margin-bottom: 10px; }
.report-card-title { font-size: 16px; font-weight: 700; color: var(--text-primary); line-height: 1.4; }
.report-card-sub { margin-top: 4px; font-size: 12px; color: var(--text-tertiary); display: flex; align-items: center; gap: 6px; line-height: 1; }
.report-card-btn { width: 100%; padding: 12px; border-radius: 8px; border: 0; background: var(--status-safe-bar); color: var(--text-on-accent); font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
.report-card--loading .report-card-btn { background: var(--surface-sunken); color: var(--text-tertiary); cursor: default; }

/* §3.2 W4 — 데스크톱 toolbar */
.toolbar { display: flex; align-items: center; gap: 12px; padding: 8px 16px; border-bottom: 1px solid var(--border-default); background: var(--surface-raised); flex-shrink: 0; }
.toolbar-year-label { font-size: 12px; color: var(--text-secondary); line-height: 1; }
.toolbar-select { background: var(--surface-sunken); color: var(--text-primary); border: 1px solid var(--border-strong); border-radius: 4px; padding: 4px 8px; font-size: 12px; line-height: 1; font-family: inherit; cursor: pointer; }
.toolbar-batch-btn { height: 32px; padding: 0 14px; background: var(--status-safe-bar); border: 0; border-radius: 6px; color: var(--text-on-accent); font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; line-height: 1; font-family: inherit; }
.toolbar-batch-btn--loading { background: var(--surface-sunken); color: var(--text-tertiary); cursor: default; }
.toolbar-spacer { flex: 1; }
.toolbar-selected-title { font-size: 14px; font-weight: 700; color: var(--text-primary); line-height: 1; }
.toolbar-individual-btn { height: 32px; padding: 0 14px; background: var(--surface-sunken); border: 1px solid var(--border-strong); border-radius: 6px; color: var(--text-primary); font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; line-height: 1; font-family: inherit; }
.toolbar-individual-btn--loading { opacity: 0.5; cursor: default; }

/* §3.3 W5 — 데스크톱 sidelist (W1 #2 LOCKED 260px) */
.sidelist { width: 260px; flex-shrink: 0; border-right: 1px solid var(--border-default); overflow-y: auto; background: var(--surface-raised); }
.sidelist-section-header { padding: 8px 16px 4px; font-size: 12px; font-weight: 700; color: var(--text-tertiary); letter-spacing: 0.05em; line-height: 1; }
.sidelist-row { padding: 8px 16px; cursor: pointer; background: transparent; border-left: 3px solid transparent; }
.sidelist-row--selected { background: var(--surface-sunken); border-left: 3px solid var(--accent); }
.sidelist-row--hover { background: var(--surface-sunken); border-left: 3px solid transparent; }
.sidelist-row-title { font-size: 14px; color: var(--text-primary); font-weight: 400; }
.sidelist-row-title--selected { color: var(--accent); font-weight: 700; }
.sidelist-row-sub { font-size: 12px; color: var(--text-tertiary); margin-top: 1px; }

/* §3.4 W6 — 데스크톱 preview wrapper (W6 #2 LOCKED a4-preview = #ffffff 다크/라이트 무관 흰배경 고정) */
.preview-wrapper { flex: 1; overflow: hidden; background: var(--surface-page); display: flex; align-items: flex-start; justify-content: center; padding: 32px; }
.a4-preview { width: 100%; max-width: 595px; aspect-ratio: 210 / 297; background: #ffffff; border: 1px solid var(--border-default); box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-radius: 4px; overflow: hidden; display: flex; flex-direction: column; padding: 32px 28px; }
.a4-preview-title { font-size: 18px; font-weight: 700; color: #1f2328; text-align: center; margin-bottom: 8px; letter-spacing: -0.02em; }
.a4-preview-meta { font-size: 12px; color: #656d76; text-align: center; margin-bottom: 24px; letter-spacing: 0.05em; }
.a4-preview-table-placeholder { flex: 1; display: grid; grid-template-columns: 1.4fr repeat(12, 1fr); gap: 0; border: 1px dashed #d0d7de; border-radius: 2px; font-size: 12px; color: #656d76; align-items: center; justify-items: center; text-align: center; overflow: hidden; }
.a4-preview-cell { padding: 8px 4px; border: 1px dashed #d0d7de; font-size: 12px; color: #656d76; height: 100%; display: flex; align-items: center; justify-content: center; }
.a4-preview-cell--header { background: #f6f8fa; font-weight: 700; color: #1f2328; }
```

**총 class 수 = 42** (W2/W3 18 + W4 9 + W5 8 + W6 7). 위 fence 가 본 wave 산출물의 단일 source of truth — executor 는 이 fence 의 정의를 변형 없이 그대로 components.css 안 @layer components 블록에 복사한다.
</interfaces>

<sketch_class_extraction_method>
Executor 는 위 `<interfaces>` 의 fence 가 verbatim source 임을 인지하고 그대로 박제한다. 추가 검증이 필요하면 sketch HTML 의 `<style>` 블록을 grep 으로 재확인 가능 — 그러나 W7 §3 가 이미 박제했으므로 사실상 1:1 복사면 충분.

재확인 grep (옵션):
```bash
grep -nE '^\s*\.[a-zA-Z][\w-]*\s*\{' cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-2-mobile-header-card.html | head -25
grep -nE '^\s*\.[a-zA-Z][\w-]*\s*\{' cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-4-desktop-toolbar.html | head -15
grep -nE '^\s*\.[a-zA-Z][\w-]*\s*\{' cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-5-desktop-sidelist.html | head -12
grep -nE '^\s*\.[a-zA-Z][\w-]*\s*\{' cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-6-desktop-preview-wrapper.html | head -10
```
</sketch_class_extraction_method>

</context>

<tasks>

<task type="auto">
  <name>Task 1: components.css 신규 생성 + index.css 1줄 @import 추가 (atomic)</name>
  <files>cha-bio-safety/src/styles/components.css, cha-bio-safety/src/index.css</files>

  <action>
**1단계 — components.css 신규 생성** (`cha-bio-safety/src/styles/components.css`):

Write 도구로 신규 파일 생성. 파일 구조:

```css
/* ============================================================
 * 14-reports redesign — component CSS classes
 * Source: sketch-wave-2 ~ sketch-wave-6 (W7 §3 verbatim 박제)
 * SW1 of TSX conversion (sub-wave-1)
 *
 * 메모리 룰:
 * - feedback_planner_prompt_sketch_verbatim (sketch CSS verbatim 인용)
 * - feedback_tailwind_token_class_pattern (status- prefix 포함)
 * - feedback_tailwind_w8_h8_is_48px (back-btn 34x34 / year-nav-btn 28x28 verbatim)
 * - feedback_text_caption_leading_none (font-size 12px 마지노선)
 *
 * raw hex 예외 (var(--*) 미사용 의도적 — A4 내부 라이트 컨텍스트 고정):
 * - .a4-preview { background: #ffffff }       (흰배경 고정)
 * - .a4-preview-title { color: #1f2328 }      (A4 검정 텍스트)
 * - .a4-preview-meta { color: #656d76 }       (A4 회색)
 * - .a4-preview-cell--header { background: #f6f8fa }  (A4 헤더 셀)
 * - .a4-preview-table-placeholder / .a4-preview-cell border: #d0d7de  (A4 dashed)
 * ============================================================ */

@layer components {

  /* ── §1. 자체 헤더 (W2/W3) ──────────────────────── */
  .page-header { flex-shrink: 0; background: var(--surface-raised); border-bottom: 1px solid var(--border-default); padding: 8px 12px 9px; display: flex; align-items: center; gap: 8px; }
  .back-btn { width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0; background: var(--surface-sunken); border: 1px solid var(--border-default); color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .page-title { flex: 1; font-size: 18px; font-weight: 700; color: var(--text-primary); line-height: 1.4; }
  .year-pager { display: flex; align-items: center; gap: 2px; }
  .year-pager-slot { width: 24px; display: flex; justify-content: center; }
  .year-nav-btn { width: 28px; height: 28px; border-radius: 7px; border: 1px solid var(--border-default); background: var(--surface-sunken); color: var(--text-primary); font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1; }
  .year-label { width: 44px; text-align: center; font-size: 14px; font-weight: 700; color: var(--text-primary); line-height: 1; }

  /* ── §2. 본문 + 카드 (W2/W3) ─────────────────────── */
  .page-body { padding: 12px 16px; background: var(--surface-page); }
  .report-card { background: var(--surface-raised); border-radius: 12px; border: 1px solid var(--border-default); padding: 14px; margin-bottom: 10px; }
  .report-card-head { margin-bottom: 10px; }
  .report-card-title { font-size: 16px; font-weight: 700; color: var(--text-primary); line-height: 1.4; }
  .report-card-sub { margin-top: 4px; font-size: 12px; color: var(--text-tertiary); display: flex; align-items: center; gap: 6px; line-height: 1; }
  .report-card-btn { width: 100%; padding: 12px; border-radius: 8px; border: 0; background: var(--status-safe-bar); color: var(--text-on-accent); font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
  .report-card--loading .report-card-btn { background: var(--surface-sunken); color: var(--text-tertiary); cursor: default; }

  /* ── §3. dot-meta + footer (W2/W3) ──────────────── */
  .dot-meta { display: inline-block; width: 4px; height: 4px; border-radius: 9999px; background: var(--text-tertiary); flex-shrink: 0; }
  .page-footer-note { text-align: center; padding: 8px 16px 20px; font-size: 12px; line-height: 1.6; color: var(--text-tertiary); }

  /* ── §4. 데스크톱 toolbar (W4) ───────────────────── */
  .toolbar { display: flex; align-items: center; gap: 12px; padding: 8px 16px; border-bottom: 1px solid var(--border-default); background: var(--surface-raised); flex-shrink: 0; }
  .toolbar-year-label { font-size: 12px; color: var(--text-secondary); line-height: 1; }
  .toolbar-select { background: var(--surface-sunken); color: var(--text-primary); border: 1px solid var(--border-strong); border-radius: 4px; padding: 4px 8px; font-size: 12px; line-height: 1; font-family: inherit; cursor: pointer; }
  .toolbar-batch-btn { height: 32px; padding: 0 14px; background: var(--status-safe-bar); border: 0; border-radius: 6px; color: var(--text-on-accent); font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; line-height: 1; font-family: inherit; }
  .toolbar-batch-btn--loading { background: var(--surface-sunken); color: var(--text-tertiary); cursor: default; }
  .toolbar-spacer { flex: 1; }
  .toolbar-selected-title { font-size: 14px; font-weight: 700; color: var(--text-primary); line-height: 1; }
  .toolbar-individual-btn { height: 32px; padding: 0 14px; background: var(--surface-sunken); border: 1px solid var(--border-strong); border-radius: 6px; color: var(--text-primary); font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; line-height: 1; font-family: inherit; }
  .toolbar-individual-btn--loading { opacity: 0.5; cursor: default; }

  /* ── §5. 데스크톱 sidelist (W5, W1 #2 LOCKED 260px) ── */
  .sidelist { width: 260px; flex-shrink: 0; border-right: 1px solid var(--border-default); overflow-y: auto; background: var(--surface-raised); }
  .sidelist-section-header { padding: 8px 16px 4px; font-size: 12px; font-weight: 700; color: var(--text-tertiary); letter-spacing: 0.05em; line-height: 1; }
  .sidelist-row { padding: 8px 16px; cursor: pointer; background: transparent; border-left: 3px solid transparent; }
  .sidelist-row--selected { background: var(--surface-sunken); border-left: 3px solid var(--accent); }
  .sidelist-row--hover { background: var(--surface-sunken); border-left: 3px solid transparent; }
  .sidelist-row-title { font-size: 14px; color: var(--text-primary); font-weight: 400; }
  .sidelist-row-title--selected { color: var(--accent); font-weight: 700; }
  .sidelist-row-sub { font-size: 12px; color: var(--text-tertiary); margin-top: 1px; }

  /* ── §6. ExcelPreview wrapper + A4 placeholder (W6, W6 #2 LOCKED) ── */
  /* a4-preview-* 5종 (title/meta/table-placeholder/cell/cell--header) 은 sketch 안 placeholder
   * 시각화용으로 정의 — 실제 TSX 에서 ExcelPreview 컴포넌트가 자체 렌더하므로 wrapper 외부
   * placeholder 노출은 안 함 (W6 OQ #4 default c). 단, class 자체는 SW3 가 wrapper 만 사용. */
  .preview-wrapper { flex: 1; overflow: hidden; background: var(--surface-page); display: flex; align-items: flex-start; justify-content: center; padding: 32px; }
  .a4-preview { width: 100%; max-width: 595px; aspect-ratio: 210 / 297; background: #ffffff; border: 1px solid var(--border-default); box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-radius: 4px; overflow: hidden; display: flex; flex-direction: column; padding: 32px 28px; }
  .a4-preview-title { font-size: 18px; font-weight: 700; color: #1f2328; text-align: center; margin-bottom: 8px; letter-spacing: -0.02em; }
  .a4-preview-meta { font-size: 12px; color: #656d76; text-align: center; margin-bottom: 24px; letter-spacing: 0.05em; }
  .a4-preview-table-placeholder { flex: 1; display: grid; grid-template-columns: 1.4fr repeat(12, 1fr); gap: 0; border: 1px dashed #d0d7de; border-radius: 2px; font-size: 12px; color: #656d76; align-items: center; justify-items: center; text-align: center; overflow: hidden; }
  .a4-preview-cell { padding: 8px 4px; border: 1px dashed #d0d7de; font-size: 12px; color: #656d76; height: 100%; display: flex; align-items: center; justify-content: center; }
  .a4-preview-cell--header { background: #f6f8fa; font-weight: 700; color: #1f2328; }

}
```

**총 class 정의 = 42** (W2/W3 17 + dot-meta 1 + W4 9 + W5 8 + W6 7 = 42; `.report-card--loading .report-card-btn` 는 nested 라 별도 카운트하면 42).

**verbatim 룰**: 위 정의들은 W7 §3 의 fence (위 `<interfaces>` 섹션에 인용) 와 완전 1:1. 추가/삭제/변경 0. 들여쓰기는 `@layer components` 블록 안에서 2 space 사용 (위 예시 그대로).

**2단계 — index.css 1줄 @import 추가** (`cha-bio-safety/src/index.css`):

Edit 도구로 line 2~3 영역 수정. **기존**:
```css
@import './styles/tokens.css';
@import './styles/typography.css';
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&family=JetBrains+Mono:wght@400;600&family=Noto+Color+Emoji&display=swap');
```

**수정 후** (typography.css 다음에 components.css 추가, 구글 폰트 import 위에):
```css
@import './styles/tokens.css';
@import './styles/typography.css';
@import './styles/components.css';
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&family=JetBrains+Mono:wght@400;600&family=Noto+Color+Emoji&display=swap');
```

**위치 결정 근거**: CSS `@import` 는 순서가 의미를 가짐 — tokens.css(var 정의) / typography.css(폰트 class) 가 먼저 로드된 뒤 components.css 가 var(--*) 를 resolve. 구글 폰트는 외부 URL 이라 마지막에 와도 됨 (현재 패턴 유지).

**Edit old_string**:
```
@import './styles/tokens.css';
@import './styles/typography.css';
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR
```

**Edit new_string**:
```
@import './styles/tokens.css';
@import './styles/typography.css';
@import './styles/components.css';
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR
```

(line break 으로 끝나는 동일 prefix 유지 — `@import url(...)` 의 나머지 부분은 그대로 유지됨.)

**3단계 — 검증 + 빌드**:

```bash
# components.css 존재
ls -la cha-bio-safety/src/styles/components.css

# @layer components 블록 ≥1
grep -c '@layer components' cha-bio-safety/src/styles/components.css

# CSS class 정의 ≥30 (실제 42 기대)
grep -cE '^[[:space:]]*\.[a-zA-Z0-9_-]+[^,{]*\{' cha-bio-safety/src/styles/components.css

# 5 컴포넌트군 fence 각 ≥1
for c in report-card toolbar sidelist preview-wrapper a4-preview; do
  echo -n "${c}: "
  grep -cE "^[[:space:]]*\.${c}[[:space:]{]" cha-bio-safety/src/styles/components.css
done

# var() 토큰 사용 ≥10
grep -cE 'var\(--' cha-bio-safety/src/styles/components.css

# linear-gradient = 0
grep -c 'linear-gradient' cha-bio-safety/src/styles/components.css

# font-size 9·10·11px = 0
grep -nE 'font-size:[[:space:]]*(9|10|11)px' cha-bio-safety/src/styles/components.css || echo "PASS: 노안 룰"

# index.css @import 정확히 1개
grep -c "@import './styles/components.css'" cha-bio-safety/src/index.css

# main.tsx / ReportsPage.tsx / ExcelPreview.tsx / App.tsx / tokens.css / typography.css 0 변경 (staged 만)
git status --short cha-bio-safety/src/main.tsx cha-bio-safety/src/pages/ReportsPage.tsx cha-bio-safety/src/components/ExcelPreview.tsx cha-bio-safety/src/App.tsx cha-bio-safety/src/styles/tokens.css cha-bio-safety/src/styles/typography.css

# 빌드 PASS
cd cha-bio-safety && npx tsc --noEmit && npm run build
```

**Negative 추가 grep (메모리 룰 박제):**
```bash
# 이모지 본문 0 (comment 제외 — 코드 블록 안)
grep -nP '[\x{2B00}-\x{2BFF}]|[\x{1F300}-\x{1FAFF}]' cha-bio-safety/src/styles/components.css

# Tailwind utility class 패턴 0 (w-8/h-8 = 48px 함정 회피)
grep -nE '\b(w-[1-9]|h-[1-9])\b' cha-bio-safety/src/styles/components.css || echo "PASS: Tailwind utility X"

# text-status-* class 정의 0 (status- prefix 룰 — var(--status-*) 토큰 사용은 OK, class 정의는 X)
grep -nE '\.(text-|bg-)status-' cha-bio-safety/src/styles/components.css || echo "PASS: status- class 정의 없음"

# 가운뎃점 ' · ' 본문 0
grep -nP ' \xc2\xb7 ' cha-bio-safety/src/styles/components.css || echo "PASS: 가운뎃점 없음 (dot-meta span 패턴)"
```

**4단계 — atomic 1-commit**:
```bash
cd /Users/jykevin/Documents/cbc7119-design
git add cha-bio-safety/src/styles/components.css cha-bio-safety/src/index.css
git commit -m "tsx(14-reports): SW1 — components.css @layer 신규 + index.css @import 추가 (42 CSS class verbatim)

W7 §3 verbatim 박제. W2/W3 18 + W4 9 + W5 8 + W6 7 = 42 class.
SW2/SW3 가 className 으로 참조할 class 정의를 글로벌 등록.

- 신규: cha-bio-safety/src/styles/components.css (@layer components)
- 수정: cha-bio-safety/src/index.css line 3 @import 1줄 추가

raw hex 예외 4종 (A4 내부 라이트 컨텍스트 고정):
  .a4-preview #ffffff / .a4-preview-title #1f2328 / .a4-preview-meta #656d76 /
  .a4-preview-cell--header #f6f8fa / .a4-preview-cell dashed #d0d7de

메모리 룰 박제: planner_prompt_sketch_verbatim, tailwind_token_class_pattern,
tailwind_w8_h8_is_48px, text_caption_leading_none, tsx_wave_emoji_dot_gap.

본 wave 는 wrangler 사용 X (cbc7119-preview 자동 배포만)."
```

(push 는 정책상 사용자 컨펌 후 / 또는 누적 commit 일정 수 도달 시. 본 wave 는 commit 만 atomic 하게.)
  </action>

  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && npx tsc --noEmit && npm run build && cd .. && grep -c '@layer components' cha-bio-safety/src/styles/components.css | grep -q '^1$' && grep -cE '^[[:space:]]*\.[a-zA-Z0-9_-]+[^,{]*\{' cha-bio-safety/src/styles/components.css | awk '{if ($1 >= 30) print "PASS class count: " $1; else { print "FAIL class count: " $1; exit 1 }}' && grep -c "@import './styles/components.css'" cha-bio-safety/src/index.css | grep -q '^1$' && grep -c 'linear-gradient' cha-bio-safety/src/styles/components.css | grep -q '^0$' && (grep -nE 'font-size:[[:space:]]*(9|10|11)px' cha-bio-safety/src/styles/components.css; test $? -ne 0) && (git status --short cha-bio-safety/src/main.tsx cha-bio-safety/src/pages/ReportsPage.tsx cha-bio-safety/src/components/ExcelPreview.tsx cha-bio-safety/src/App.tsx cha-bio-safety/src/styles/tokens.css cha-bio-safety/src/styles/typography.css | wc -l | tr -d ' ') | grep -q '^0$' && echo "SW1 PASS"</automated>
  </verify>

  <done>
- `cha-bio-safety/src/styles/components.css` 가 신규 생성되어 있고 `@layer components` 블록 안에 W2~W6 sketch 의 .class 정의 42종이 verbatim 박제됨
- `cha-bio-safety/src/index.css` line 3 에 `@import './styles/components.css';` 1줄 추가 (tokens.css / typography.css 다음, 구글 폰트 위)
- `main.tsx` / `ReportsPage.tsx` / `ExcelPreview.tsx` / `App.tsx` / `tokens.css` / `typography.css` 는 0 line 변경
- `npx tsc --noEmit` exit 0
- `npm run build` exit 0
- atomic 1-commit (커밋 메시지 = `tsx(14-reports): SW1 — components.css @layer 신규 + index.css @import 추가 (42 CSS class verbatim)`)
- 22 verify gate 모두 PASS (W7 SW1 gate 8건 + Negative/Positive 추가 14건)
- SUMMARY.md 작성 (42 class 매핑 표 / verify gate 결과 / build chunk size delta / 메모리 룰 박제 위치)
  </done>
</task>

</tasks>

<verification>
## 22 verify gate (W7 SW1 gate 8건 + 추가 14건)

**Negative (모두 0):**
1. `linear-gradient` in components.css = 0 (그라데이션 폐기 룰)
2. `font-size:\s*(9|10|11)px` 0 (12px 마지노선, 노안 룰)
3. `.(text-|bg-)status-` class 정의 0 (status- prefix 룰 — var(--status-*) 토큰 직접 사용만)
4. 이모지 본문 0 (`\x{2B00}-\x{2BFF}` / `\x{1F300}-\x{1FAFF}` — comment 제외)
5. Tailwind `\b(w-[1-9]|h-[1-9])\b` utility 0 (CSS 안에서 안 씀, px 직접만)
6. ' · ' 가운뎃점 본문 0 (dot span 메모리 룰)
7. ReportsPage.tsx 변경 = 0 line (`git status --short` 0 출력)
8. ExcelPreview.tsx 변경 = 0 line
9. main.tsx 변경 = 0 line
10. App.tsx 변경 = 0 line
11. tokens.css 변경 = 0 line
12. typography.css 변경 = 0 line

**Positive:**
13. `cha-bio-safety/src/styles/components.css` 파일 존재
14. `@layer components` 블록 정확히 1개
15. CSS class 정의 ≥30 (실제 42 기대)
16. `.report-card` fence ≥1 (W2/W3 카드 group)
17. `.toolbar` fence ≥1 (W4)
18. `.sidelist` fence ≥1 (W5)
19. `.preview-wrapper` fence ≥1 (W6)
20. `.a4-preview` fence ≥1 (W6)
21. var(--*) 토큰 사용 ≥10
22. `@import './styles/components.css'` in index.css 정확히 1개

**Build:**
- `npx tsc --noEmit` exit 0
- `npm run build` exit 0
- (옵션) chunk size 측정 — components.css 추가로 CSS chunk 약간 증가 예상 (typography.css 대비 ~2~3KB 증가 추정)

## 비즈 로직 보존 (시그니처 0 변경)

본 wave 는 .tsx 파일을 일체 건드리지 않으므로 비즈 로직 0 영향. ReportsPage.tsx / ExcelPreview.tsx / 다른 페이지 모두 git diff 빈 상태.

## 워크트리 룰 (CLAUDE.local.md 준수)

- 브랜치: `redesign/14-reports` 위에서 작업 (이미 확인됨)
- wrangler 명령 0 (디자인 작업은 `npm run deploy` / `wrangler --project-name=cbc7119` 절대 X)
- main 머지는 사용자 컨펌 후 별도 wave (본 wave 는 commit 만)
- cbc7119-preview 자동 배포는 main push 시 — 본 wave 는 push 만 하면 자동 (commit 단계까지만)
</verification>

<success_criteria>
1. ✅ `cha-bio-safety/src/styles/components.css` 신규 파일 존재 (@layer components 블록 + 42 class verbatim)
2. ✅ `cha-bio-safety/src/index.css` line 3 영역 `@import './styles/components.css';` 추가 (tokens.css / typography.css 다음)
3. ✅ 22 verify gate 모두 PASS
4. ✅ `npx tsc --noEmit` + `npm run build` 모두 exit 0
5. ✅ atomic 1-commit (`tsx(14-reports): SW1 — components.css @layer 신규 + index.css @import 추가 (42 CSS class verbatim)`)
6. ✅ ReportsPage.tsx / ExcelPreview.tsx / main.tsx / App.tsx / tokens.css / typography.css 0 line 변경
7. ✅ SUMMARY.md 작성 — 42 class 매핑 표 / verify gate 결과 / build chunk size delta / 메모리 룰 박제 위치
8. ✅ 워크트리 룰 준수: wrangler 0, redesign/14-reports 브랜치, cbc7119-preview 자동 배포만
</success_criteria>

<output>
After completion, create `.planning/quick/260520-vut-redesign-14-reports-tsx-sw1-components-c/260520-vut-SUMMARY.md` with:

1. **W2~W6 → components.css class 매핑 표** (42 row):
   | # | sketch wave | source line | class | components.css line | 비고 |
   |---|---|---|---|---|---|
   | 1 | W2/W3 | sketch-wave-2:283 | `.dot-meta` | components.css §3 | dot span 패턴 |
   | 2 | W2 | sketch-wave-2:326 | `.page-header` | components.css §1 | self-header |
   | ... (42 row 까지) |

2. **22 verify gate 결과** (PASS/FAIL 컬럼 + 실제 grep/wc 출력 인용)

3. **Build 결과**:
   - `npx tsc --noEmit` exit code
   - `npm run build` chunk 출력
   - `dist/assets/` CSS chunk size before vs after delta (예상 +2~3KB)

4. **메모리 룰 박제 위치** (≥7건):
   - feedback_planner_prompt_sketch_verbatim — components.css 안 verbatim 인용 확인
   - feedback_tailwind_token_class_pattern — `.text-status-*` class 정의 0 확인
   - feedback_tailwind_w8_h8_is_48px — back-btn 34px / year-nav-btn 28px verbatim 확인
   - feedback_text_caption_leading_none — font-size 12px 마지노선 (9·10·11 = 0)
   - feedback_tsx_wave_emoji_dot_gap — components.css 본문 이모지 0
   - feedback_cbc7119_design_never_wrangler — wrangler 명령 0
   - feedback_check_branch_before_edit — redesign/14-reports 브랜치 확인됨

5. **Next sub-wave 안내**: SW2 (MobileReportsPage line 316~385) → SW3 (DesktopReportsPage line 149~304). 각 W7 §11 gate 10건씩 적용.

6. **commit hash + git log 1-line**
</output>
