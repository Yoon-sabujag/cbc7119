---
phase: quick-260520-fzl
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-3-mobile-card-list.html
autonomous: true
requirements:
  - REQ-14R-W3-card-list-10
  - REQ-14R-W3-footer
  - REQ-14R-W3-dual-frame
tags:
  - redesign
  - 14-reports
  - sketch
  - wave-3
  - mobile

must_haves:
  truths:
    - "단일 sketch HTML 파일 1개가 평면(flat sibling)으로 14-reports/ 폴더에 존재"
    - "다크/라이트 393px dual frame 가 side-by-side 로 배치"
    - "각 frame 안에 REPORT_CARDS 10종이 W2 카드 markup verbatim mirror 로 반복"
    - "각 카드의 sub 라인 가운뎃점이 dot span 으로 표현됨 (텍스트 ' · ' 0건)"
    - "각 카드의 다운로드 버튼이 lucide Download size=14 인라인 SVG + bg-safe-bar solid"
    - "footer 안내 'A4 용지 자동 맞춤' 텍스트 verbatim 노출 (frame 당 1건, 총 2건)"
    - "W2 7건 + 추가 1건 = 메모리 룰 8건이 sketch 상단 comment 박제"
    - "W4 진입 전 OQ 3건이 sketch 안 §OPEN QUESTIONS 섹션에 default 명시"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-3-mobile-card-list.html"
      provides: "W3 sketch — 모바일 카드 그리드 10종 + footer (다크/라이트 dual frame)"
      contains: "REPORT_CARDS 10 titles verbatim / footer 카피 verbatim / dot-meta span / lucide Download / OQ 3건"
  key_links:
    - from: "sketch-wave-3-mobile-card-list.html"
      to: "sketch-wave-2-mobile-header-card.html"
      via: "card markup verbatim mirror (W2 의 .report-card / .report-card-head / .report-card-sub / .report-card-btn 패턴 1:1 복제)"
      pattern: "class=\"report-card\""
    - from: "sketch-wave-3-mobile-card-list.html"
      to: "ReportsPage.tsx line 12~23"
      via: "REPORT_CARDS 10 entry title/sub verbatim 인용"
      pattern: "월초 유수검지|월말 유수검지|옥내소화전|청정소화약제|비상콘센트|피난방화|방화셔터|제연설비|자동화재탐지|소방펌프"
    - from: "sketch-wave-3-mobile-card-list.html"
      to: "ReportsPage.tsx line 379~381"
      via: "footer 카피 '다운로드 후 엑셀에서 인쇄 (A4 용지 자동 맞춤 설정됨)' verbatim"
      pattern: "A4 용지 자동 맞춤 설정됨"
---

<objective>
redesign/14-reports sketch wave 3 — 모바일 카드 그리드 10종 + footer 안내를 다크/라이트 393px dual frame 으로 1개 HTML 파일에 시각화한다.

Purpose: W2 에서 컨펌받은 단일 카드 패턴 (헤더 + DIV early 카드 1종) 을 REPORT_CARDS 10 entry 전체에 확장하고, footer 안내까지 포함해 모바일 페이지 전체의 카드 리스트 + 정적 안내 영역을 W4 (데스크톱) 진입 전 사용자에게 마지막으로 컨펌받는 단계. W2 가 "패턴 1종 컨펌"이었다면 W3 는 "10종 반복 + footer 통합 컨펌".

Output: 평면 배치 sketch HTML 1개 파일.
  cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-3-mobile-card-list.html
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
## W1 인덱스 (LOCKED 5건 + 메모리 룰 10건 박제 출처)
@cha-bio-safety/docs/redesign-context/14-reports/wave-1-index.md

## W2 sketch (mirror 대상 — markup/CSS/메모리 룰 박제 verbatim 인용)
@cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-2-mobile-header-card.html

## design-system v0.1.1 (§1.1 노안 / §2.7 typography / §6.4 그라데이션 폐기 / §7.1 lucide)
@cha-bio-safety/docs/redesign-context/14-reports/design-system.md

## 토큰 verbatim (다크/라이트 + spacing + radius)
@cha-bio-safety/docs/redesign-context/14-reports/tokens.css

## source TSX (REPORT_CARDS 10 entry + 모바일 컴포넌트 + footer verbatim)
@cha-bio-safety/src/pages/ReportsPage.tsx

## 워크트리 룰 (wrangler 금지 / npm run deploy 금지)
@CLAUDE.local.md

<interfaces>
<!-- W3 sketch 가 의존하는 W2 의 모든 패턴 verbatim (executor 는 W2 를 다시 읽지 않아도 됨) -->

### REPORT_CARDS 10 entry verbatim (ReportsPage.tsx line 12~23)
```ts
const REPORT_CARDS: { type: ReportType; title: string; sub: string }[] = [
  { type: 'div-early',   title: '월초 유수검지 장치 점검표',  sub: 'DIV · 34개소' },
  { type: 'div-late',    title: '월말 유수검지 장치 점검표',  sub: 'DIV · 34개소' },
  { type: '소화전',      title: '월간 옥내소화전 점검일지',   sub: '소화전 · 각 층' },
  { type: '청정소화약제', title: '청정소화약제설비 점검일지', sub: '가스소화 · 3개소' },
  { type: '비상콘센트',  title: '월간 비상콘센트 점검일지',   sub: '비상콘센트 · 8개소' },
  { type: '피난방화',    title: '월간 피난방화시설 점검일지', sub: '피난방화 · 연간' },
  { type: '방화셔터',    title: '월간 방화셔터 점검일지',     sub: '방화셔터 · 연간' },
  { type: '제연',        title: '월간 제연설비 점검일지',     sub: '제연설비 · 연간' },
  { type: '자탐',        title: '자동화재탐지설비 점검일지',  sub: '자탐설비 · 연간' },
  { type: '소방펌프',    title: '월간 소방펌프 점검일지',     sub: '소방펌프 · 월간' },
]
```

### sub 라인 dot 분해 매핑 (sketch 변환 — text ' · ' 0건, dot span 2건 per card)
| # | type | sub 원문 | dot 분해 (sketch) |
|---|---|---|---|
| 1 | div-early   | DIV · 34개소     | DIV [dot] 34개소 [dot] 2026년도 |
| 2 | div-late    | DIV · 34개소     | DIV [dot] 34개소 [dot] 2026년도 |
| 3 | 소화전      | 소화전 · 각 층     | 소화전 [dot] 각 층 [dot] 2026년도 |
| 4 | 청정소화약제 | 가스소화 · 3개소  | 가스소화 [dot] 3개소 [dot] 2026년도 |
| 5 | 비상콘센트  | 비상콘센트 · 8개소 | 비상콘센트 [dot] 8개소 [dot] 2026년도 |
| 6 | 피난방화    | 피난방화 · 연간    | 피난방화 [dot] 연간 [dot] 2026년도 |
| 7 | 방화셔터    | 방화셔터 · 연간    | 방화셔터 [dot] 연간 [dot] 2026년도 |
| 8 | 제연        | 제연설비 · 연간    | 제연설비 [dot] 연간 [dot] 2026년도 |
| 9 | 자탐        | 자탐설비 · 연간    | 자탐설비 [dot] 연간 [dot] 2026년도 |
| 10| 소방펌프    | 소방펌프 · 월간    | 소방펌프 [dot] 월간 [dot] 2026년도 |

`[dot]` = `<span class="dot-meta"></span>` (W2 verbatim, CSS 정의 4×4 rounded-full bg:--text-tertiary).

### W2 카드 1종 markup (verbatim mirror 대상)
```html
<article class="report-card">
  <div class="report-card-head">
    <div class="report-card-title">{TITLE}</div>
    <div class="report-card-sub">
      {SEG1}<span class="dot-meta"></span>{SEG2}<span class="dot-meta"></span>2026년도
    </div>
  </div>
  <button class="report-card-btn" aria-label="엑셀 다운로드">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
    엑셀 다운로드
  </button>
</article>
```

10종 모두 enabled variant 만 (loading variant 는 W2 에서 시연 완료, W3 는 카드 그리드 검증이 주 목적 — 10×2 loading 반복 = 시각 잡음).

### 헤더 markup (W2 verbatim, frame 당 1건)
```html
<header class="page-header">
  <button class="back-btn" aria-label="뒤로">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  </button>
  <span class="page-title">점검 일지 출력</span>
  <div class="year-pager">
    <div class="year-pager-slot">
      <button class="year-nav-btn" aria-label="이전 연도">‹</button>
    </div>
    <span class="year-label">2026년</span>
    <div class="year-pager-slot">
      <!-- (없음 — 2026 = CURRENT_YEAR 라 › 미노출) -->
    </div>
  </div>
</header>
```

### footer markup (sketch 변환 — source line 379~381)
source verbatim:
```tsx
<div style={{ textAlign: 'center', fontSize: 11, color: 'var(--t3)', padding: '8px 0 20px' }}>
  다운로드 후 엑셀에서 인쇄 (A4 용지 자동 맞춤 설정됨)
</div>
```

sketch 변환:
```html
<!-- ③ footer 안내 — ReportsPage line 379~381 verbatim 카피 + 노안 격상 11 -> 12 -->
<div class="page-footer-note">
  다운로드 후 엑셀에서 인쇄 (A4 용지 자동 맞춤 설정됨)
</div>
```

CSS (W2 토큰 inherit + footer 전용 1개 selector 추가):
```css
.page-footer-note {
  text-align: center;
  padding: 8px 16px 20px;          /* 8/16/20 — source pt 8, px 추가 16 (가독), pb 20 verbatim */
  font-size: 12px;                  /* 노안 격상 11 -> 12 (text-caption, mig 룰 §4.2) */
  line-height: 1.6;                 /* 2줄 wrap 시 가독 — sub 의 leading-none 과 의도적 차별화 */
  color: var(--text-tertiary);      /* line 379: 'var(--t3)' */
}
```

### W2 CSS inheritance (W3 는 W2 의 모든 CSS 토큰 + selector 100% 재사용)
W2 의 다음 CSS 블록은 verbatim 복사:
- 다크 토큰 (line 69~122)
- 라이트 토큰 (line 127~172)
- spacing (line 177~213, 모바일 + 데스크톱 분기)
- radius (line 218~223)
- typography (.text-caption / .text-label / .text-body-sm / .text-body / .text-title / .text-heading / .text-display / .text-mono / .font-medium / .font-semibold / .leading-none)
- .dot-meta helper
- .page-bg-dark / .page-bg-light
- .frame-shell (393px)
- .global-header-placeholder (h-48px)
- .page-header / .back-btn / .page-title / .year-pager / .year-pager-slot / .year-nav-btn / .year-label
- .page-body (padding 12/16, bg surface-page)
- .report-card / .report-card-head / .report-card-title / .report-card-sub / .report-card-btn
- .variant-label
- tailwind.config script (frame 외 chrome 만 사용, frame 안은 모두 vanilla CSS class)

추가 신규 CSS 1건:
- .page-footer-note (위 정의)
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: sketch-wave-3-mobile-card-list.html 작성 (단일 파일 atomic)</name>
  <files>cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-3-mobile-card-list.html</files>
  <action>
W2 sketch (`sketch-wave-2-mobile-header-card.html`) 를 출발점으로 단일 HTML 파일을 평면(flat sibling) 배치로 작성한다.

# §A 파일 구조

1. `<!DOCTYPE html>` + `<html lang="ko" data-theme="dark">`
2. 상단 comment block — W3 정체성 + W1 LOCKED 5건 매트릭스 + W3 OQ 3건 default + 메모리 룰 8건 박제
3. `<head>` — meta + Pretendard CDN + Tailwind CDN + `<style>` 블록 (W2 verbatim + footer 1건 신규)
4. `<body class="page-bg-dark min-h-screen p-6">`
5. 외부 헤더 캡션 (W3 정체성 안내)
6. dual frame `<section>` — 다크 frame + 라이트 frame side-by-side
7. Notes block + W3 검토 포인트 + W4 진입 전 OQ 3건

# §B 상단 comment block (verbatim 작성)

```html
<!--
  sketch-wave-3-mobile-card-list.html — redesign/14-reports W3
  작성: 2026-05-20 / quick 260520-fzl
  범위: 모바일 카드 그리드 10종 + footer 안내 (다크/라이트 393px dual frame)
  out of scope: 데스크톱 1280px frame (W4~W6 책임) / loading variant 카드 (W2 에서 시연 완료) /
                ReportsPage.tsx 코드 수정 / ExcelPreview.tsx / 다른 페이지
  참조: wave-1-index.md §3 verbatim, sketch-wave-2-mobile-header-card.html W2 markup mirror,
        ReportsPage.tsx line 12~23 (REPORT_CARDS) + line 379~381 (footer) verbatim

  W1 LOCKED 5건 적용 매트릭스:
    OQ #1 LOCKED — 모바일 다운로드 버튼 그라데이션 폐기 -> bg-safe-bar solid (적용 = O, 10 카드 × 2 frame)
    OQ #2 LOCKED — 데스크톱 좌측 260px 유지 (W5 scope, W3 미해당)
    OQ #3 LOCKED — 데스크톱 일괄 다운로드 그라데이션 폐기 (W4 scope, W3 미해당)
    OQ #4 LOCKED — 모바일 footer 안내 유지 (적용 = O, frame 당 1건)
    OQ #5 LOCKED — sub 라인 dot span 패턴 (적용 = O, 10 카드 × 2 dot × 2 frame = 40건)

  W3 OQ 3건 default (모두 미배치 시안):
    OQ #1 LOCKED-default: 데스크톱 1280px placeholder 미배치 (W4~W6 책임)
    OQ #2 LOCKED-default: 카드 진행률/완료 status 칩 미배치 (ReportsPage 는 점검 페이지 아님)
    OQ #3 LOCKED-default: 모바일 hover/press state 미배치 (모바일 hover 없음)

  W4 진입 전 OQ 3건 (default 답 채택 시 별 의견 없는 것으로 진행):
    OQ #1 default: 카드 그리드 sticky header 미적용 (헤더도 함께 스크롤 — source line 355 'overflowY: auto' 본문만 스크롤, 헤더 line 331 'flexShrink: 0' 은 layout 유지 보장이지 sticky 아님)
    OQ #2 default: footer 안내 inline (마지막 카드 다음, source verbatim — fixed 미적용)
    OQ #3 default: 모바일 카드 단일 컬럼 유지 (393px 폭에서 2열 압축 시 버튼 라벨 wrap 위험)

  ==========================================================
  메모리 룰 박제 (W2 7건 + W3 추가 1건 = 8건)
  ==========================================================

    1. feedback_design_sketch_first.md
       spacing/sizing 도 sketch 시안 먼저 보여주고 승인 받은 후 인라인 적용.
       -> 본 W3 가 W4 진입 전 카드 그리드 10종 + footer 의 마지막 컨펌 시안.

    2. feedback_sketch_realistic_data.md
       표시 분기/라벨 룰은 코드 그대로, 시각 디자인만 손봄.
       -> REPORT_CARDS 10 entry title/sub verbatim, footer 카피 verbatim.
         '월초 유수검지 장치 점검표' 등 임의 변경 0건.

    3. feedback_planner_prompt_sketch_verbatim.md
       sketch CSS 토큰/사이즈는 grep 으로 추출해 W7 변환 wave 에 그대로 인용.
       -> 본 sketch 의 모든 CSS class 명을 W7 checklist 안에 verbatim 인용 예정.

    4. feedback_tailwind_token_class_pattern.md
       text-fire-bar 패턴 사용 (status- prefix 없음).
       -> 다운로드 버튼 = bg-safe-bar (prefix 0건). 모드 자동 매핑.

    5. feedback_tailwind_w8_h8_is_48px.md
       메모리 룰: w-8 = 48px (기본 32 아님). w-7 = 32px.
       -> 본 sketch 는 W2 verbatim 패턴 — iconBtn 34x34 / navBtn 28x28 / dot 4x4 모두 inline 명시.

    6. feedback_tsx_wave_emoji_dot_gap.md
       sketch negative gate (이모지 0) + dot span 추가 markup 도 verify.
       -> 다운로드 ⬇ (U+2B07) 글리프 0건 / lucide Download SVG 인라인 / dot span 40건 (10 카드 × 2 dot × 2 frame).

    7. feedback_text_caption_leading_none.md
       작은 컨테이너 안 text-caption 의 lh:1.5 는 시각 패딩.
       -> sub 라인 = leading-none 명시. footer 안내는 leading 1.6 명시 (2줄 wrap 시 가독 의도).

    8. feedback_avoid_premature_confirmation.md (W3 추가)
       시각 작업에서 "거의 일치" 자신감 표현 금지.
       -> sketch 작성 완료 후 사용자 컨펌 받은 뒤 W4 진입. 자체 PASS 판단 0건.
  ==========================================================
-->
```

# §C `<head>` `<style>` 블록 (W2 verbatim + footer 1건 추가)

W2 sketch line 65~474 의 `<style>` 블록 전체를 verbatim 복사. 그 끝에 footer 1건 추가:

```css
/* ============================================================
 * Footer 안내 — ReportsPage.tsx line 379~381 verbatim 카피
 * (노안 격상: fontSize 11 -> 12, mig 룰 §4.2)
 * ============================================================ */
.page-footer-note {
  text-align: center;
  padding: 8px 16px 20px;            /* source 8/0/20 + px-4 가독 보강 */
  font-size: 12px;                   /* text-caption */
  line-height: 1.6;                  /* 2줄 wrap 시 가독, sub 의 leading-none 과 의도적 차별화 */
  color: var(--text-tertiary);       /* line 379: 'var(--t3)' */
}
```

tailwind.config script 도 W2 verbatim 복사 (frame 외부 chrome 만 사용).

# §D `<body>` 외부 헤더 캡션

```html
<header class="mb-6 max-w-[900px] mx-auto">
  <h1 class="text-heading text-white mb-2">14-reports sketch W3 — 모바일 카드 그리드 10종 + footer 안내</h1>
  <p class="text-label text-zinc-400">
    모바일 393px × 다크/라이트 dual frame. W2 단일 카드 패턴을 REPORT_CARDS 10종으로 확장 + footer 통합.
    ReportsPage.tsx line 12~23 (REPORT_CARDS 정의) + line 355~381 (모바일 본문 + footer) verbatim 매핑.
  </p>
</header>
```

# §E dual frame `<section>`

13-schedule/sketch-wave-1 + W2 mirror 패턴으로 flex 가로 배치:

```html
<section class="flex gap-8 flex-wrap items-start justify-center mb-12">
  <!-- ─── 다크 모바일 frame ─── -->
  <div>
    <div class="variant-label" style="color:#f6f8fa;">다크 모드 (393px 모바일)</div>
    <div data-theme="dark" class="frame-shell">
      <div class="global-header-placeholder">App GlobalHeader (h-12, /reports 는 자체 헤더 페이지)</div>
      <header class="page-header"> ... W2 verbatim ... </header>
      <div class="page-body">
        <!-- ① 카드 1: div-early -->
        <article class="report-card">
          <div class="report-card-head">
            <div class="report-card-title">월초 유수검지 장치 점검표</div>
            <div class="report-card-sub">DIV<span class="dot-meta"></span>34개소<span class="dot-meta"></span>2026년도</div>
          </div>
          <button class="report-card-btn" aria-label="엑셀 다운로드">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            엑셀 다운로드
          </button>
        </article>
        <!-- ② 카드 2: div-late (sub 만 다름) -->
        <article class="report-card">
          <div class="report-card-head">
            <div class="report-card-title">월말 유수검지 장치 점검표</div>
            <div class="report-card-sub">DIV<span class="dot-meta"></span>34개소<span class="dot-meta"></span>2026년도</div>
          </div>
          <button class="report-card-btn" aria-label="엑셀 다운로드"> ... 동일 SVG + '엑셀 다운로드' ... </button>
        </article>
        <!-- ③~⑩ 카드 3~10: 표 매핑대로 title/sub 만 치환, 나머지 동일 -->
        <!-- ... (총 10 article) ... -->
        <!-- ⑪ footer 안내 -->
        <div class="page-footer-note">
          다운로드 후 엑셀에서 인쇄 (A4 용지 자동 맞춤 설정됨)
        </div>
      </div>
    </div>
  </div>

  <!-- ─── 라이트 모바일 frame ─── -->
  <div>
    <div class="variant-label" style="color:#f6f8fa;">라이트 모드 (393px 모바일)</div>
    <div data-theme="light" class="frame-shell">
      <!-- 다크 frame 의 markup 1:1 mirror (data-theme="light" 만 차이) -->
      <!-- GlobalHeader placeholder + page-header + 10 article + footer 모두 동일 markup -->
    </div>
  </div>
</section>
```

10 카드 매핑 표 (executor 가 article 10개 작성 시 정확히 따를 것):

| # | type | title | SEG1 | SEG2 |
|---|---|---|---|---|
| 1 | div-early    | 월초 유수검지 장치 점검표  | DIV       | 34개소 |
| 2 | div-late     | 월말 유수검지 장치 점검표  | DIV       | 34개소 |
| 3 | 소화전       | 월간 옥내소화전 점검일지   | 소화전     | 각 층 |
| 4 | 청정소화약제  | 청정소화약제설비 점검일지 | 가스소화   | 3개소 |
| 5 | 비상콘센트   | 월간 비상콘센트 점검일지   | 비상콘센트  | 8개소 |
| 6 | 피난방화     | 월간 피난방화시설 점검일지 | 피난방화   | 연간 |
| 7 | 방화셔터     | 월간 방화셔터 점검일지    | 방화셔터   | 연간 |
| 8 | 제연         | 월간 제연설비 점검일지    | 제연설비   | 연간 |
| 9 | 자탐         | 자동화재탐지설비 점검일지 | 자탐설비   | 연간 |
| 10| 소방펌프     | 월간 소방펌프 점검일지    | 소방펌프   | 월간 |

sub 라인 패턴: `{SEG1}<span class="dot-meta"></span>{SEG2}<span class="dot-meta"></span>2026년도`

다크 frame + 라이트 frame 두 곳 모두 동일 10 카드 + footer 1건. 총 카드 article 20개, footer 2건.

# §F Notes block + W3 검토 포인트 + W4 진입 전 OQ 3건

```html
<section class="max-w-[900px] mx-auto text-zinc-400 text-label" style="line-height:1.6;">
  <h2 class="text-title text-white mb-3">W3 검토 포인트</h2>
  <ul class="list-disc pl-5 space-y-1">
    <li>REPORT_CARDS 10 entry verbatim (ReportsPage.tsx line 12~23). title/sub 임의 변경 0건.</li>
    <li>각 카드 sub = <code class="text-zinc-200">{SEG1}[dot]{SEG2}[dot]2026년도</code> 패턴. 가운뎃점 텍스트 0건 / dot span 2건 per card.</li>
    <li>다운로드 버튼 = <code class="text-zinc-200">var(--status-safe-bar)</code> solid (W1 OQ #1 LOCKED).</li>
    <li>이모지 (U+2B07 ⬇ 등) 0건 / lucide Download size=14 인라인 SVG.</li>
    <li>footer = <code class="text-zinc-200">다운로드 후 엑셀에서 인쇄 (A4 용지 자동 맞춤 설정됨)</code> verbatim, frame 당 1건.</li>
    <li>footer 폰트 = 12px (text-caption) leading 1.6. sub 의 leading-none 과 의도적 차별화.</li>
    <li>loading variant 0건은 의도 — W2 에서 시연 완료, W3 는 그리드 검증 집중.</li>
    <li>모든 카드 markup 은 W2 카드 1종 패턴의 1:1 mirror.</li>
  </ul>

  <h2 class="text-title text-white mb-3 mt-6">W4 진입 전 OQ 3건 (default 답 채택 시 별 의견 없는 것으로 진행)</h2>
  <ul class="list-disc pl-5 space-y-1">
    <li>OQ #1 — 카드 그리드 sticky header 적용 여부. <strong class="text-zinc-200">default: 미적용</strong> (헤더도 함께 스크롤, source verbatim).</li>
    <li>OQ #2 — footer 안내 위치 (inline vs viewport bottom fixed). <strong class="text-zinc-200">default: inline</strong> (source verbatim, fixed 0건).</li>
    <li>OQ #3 — 모바일 카드 2열 그리드 가능 여부. <strong class="text-zinc-200">default: 단일 컬럼 유지</strong> (393px 폭 + 다운로드 버튼 라벨 wrap 위험).</li>
  </ul>
</section>
```

# §G 최종 점검 (executor 가 파일 저장 후 자체 실행)

executor 는 파일 저장 직후 `<verify>` 블록의 17건 verify gate 를 직접 bash 로 실행하고, 모든 결과를 SUMMARY 에 박제한다. PASS 17/17 미달 시 commit 진행 금지.

# §H 절대 금지 사항

- ReportsPage.tsx / ExcelPreview.tsx / 다른 페이지 수정 0건 (sketch 만)
- 데스크톱 1280px frame 배치 0건 (W4~W6 책임)
- status 칩 / hover state / loading variant 카드 0건
- wrangler 명령 0건 / `npm run deploy` 0건 (CLAUDE.local.md 룰)
- sketch/ 서브폴더 생성 0건 — flat sibling 만 (W1 LOCKED)
- heredoc (cat << EOF) 사용 0건 — Write 도구만 사용
  </action>
  <verify>
    <automated>
PLAN_PATH=cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-3-mobile-card-list.html
echo "── §6 verify gate (17건) ──"

# Negative gates (모두 0)
echo "1. ⬇ 글리프 (U+2B07): $(grep -F '⬇' $PLAN_PATH | wc -l) (expected 0)"
echo "2. linear-gradient: $(grep -F 'linear-gradient' $PLAN_PATH | wc -l) (expected 0)"
echo "3. status- prefix class: $(grep -E 'text-status-|bg-status-' $PLAN_PATH | wc -l) (expected 0)"
echo "4. 가운뎃점 텍스트 ' · ' (comment 제외): $(grep -F ' · ' $PLAN_PATH | grep -v '<!--' | grep -v 'card.sub' | wc -l) (expected 0)"
echo "5. w-8/h-8 alias (comment/메모리 룰 제외): $(grep -E '\bw-8\b|\bh-8\b' $PLAN_PATH | grep -v '<!--' | grep -v '메모리 룰' | wc -l) (expected 0)"
echo "6. 9·10·11px fontSize 본문: $(grep -E 'font-size:\s*1[01]px|text-\[1[01]px\]|fontSize:\s*1[01]' $PLAN_PATH | grep -v 'comment\|메모리\|source line\|11 ->\|11 -\>\|11px ->' | wc -l) (expected 0)"
echo "7. 본문 이모지 (📄 ✅ ❌ ⚠️ 등): $(grep -E '📄|✅|❌|⚠️|🎯' $PLAN_PATH | wc -l) (expected 0)"

# Positive gates
echo "8. ChevronLeft lucide path: $(grep -F 'm15 18-6-6 6-6' $PLAN_PATH | wc -l) (expected ≥2)"
echo "9. Download lucide path (M21 15v4): $(grep -F 'M21 15v4a2' $PLAN_PATH | wc -l) (expected ≥20)"
echo "10. dot-meta span: $(grep -c 'class=\"dot-meta\"' $PLAN_PATH) (expected ≥40)"
echo "11. status-safe-bar var: $(grep -F 'var(--status-safe-bar)' $PLAN_PATH | wc -l) (expected ≥2; class 안 .report-card-btn 정의 + body 사용)"
echo "12. report-card-title (text-body bold equivalent): $(grep -c 'class=\"report-card-title\"' $PLAN_PATH) (expected ≥20)"
echo "13. dual frame label (다크/라이트 variant-label): $(grep -E '다크 모드|라이트 모드' $PLAN_PATH | wc -l) (expected ≥2)"
echo "14. 메모리 룰 unique feedback_ slug: $(grep -oE 'feedback_[a-z_]+\.md' $PLAN_PATH | sort -u | wc -l) (expected ≥7)"
echo "15a. REPORT_CARDS title #1 (월초 유수검지): $(grep -c '월초 유수검지 장치 점검표' $PLAN_PATH) (expected ≥2)"
echo "15b. REPORT_CARDS title #10 (월간 소방펌프): $(grep -c '월간 소방펌프 점검일지' $PLAN_PATH) (expected ≥2)"
echo "15c. REPORT_CARDS title unique 10종: $(grep -oE '월초 유수검지 장치 점검표|월말 유수검지 장치 점검표|월간 옥내소화전 점검일지|청정소화약제설비 점검일지|월간 비상콘센트 점검일지|월간 피난방화시설 점검일지|월간 방화셔터 점검일지|월간 제연설비 점검일지|자동화재탐지설비 점검일지|월간 소방펌프 점검일지' $PLAN_PATH | sort -u | wc -l) (expected =10)"
echo "16. footer 카피 'A4 용지 자동 맞춤 설정됨': $(grep -c 'A4 용지 자동 맞춤 설정됨' $PLAN_PATH) (expected ≥2)"
echo "17. flat sibling 배치 (sketch/ 서브폴더 미생성): $(ls cha-bio-safety/docs/redesign-context/14-reports/sketch/ 2>/dev/null | wc -l) (expected 0)"

# 모두 PASS 시 commit
echo "── PASS 17/17 시 commit ──"
git add cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-3-mobile-card-list.html
git -c commit.gpgsign=false commit -m "docs(14-reports): sketch wave 3 — 모바일 카드 그리드 10종 + footer 안내 (다크/라이트 393px)"
    </automated>
  </verify>
  <done>
- 파일 cha-bio-safety/docs/redesign-context/14-reports/sketch-wave-3-mobile-card-list.html 존재
- §6 verify gate 17건 PASS 17/17
  - Negative 7건 (이모지/그라데이션/status- prefix/가운뎃점 텍스트/w-8 alias/9-11px 본문/본문 이모지) 모두 0
  - Positive 10건 (lucide path / dot-meta / status-safe-bar / 카드 title / dual frame / 메모리 룰 / 10종 REPORT_CARDS / footer) 모두 기대값 도달
- atomic 1-commit: `docs(14-reports): sketch wave 3 — 모바일 카드 그리드 10종 + footer 안내 (다크/라이트 393px)`
- ReportsPage.tsx / ExcelPreview.tsx / 다른 페이지 / wrangler / `npm run deploy` 변경 0건
  </done>
</task>

</tasks>

<verification>
1. `ls cha-bio-safety/docs/redesign-context/14-reports/` 결과에 `sketch-wave-3-mobile-card-list.html` 평면 포함
2. `ls cha-bio-safety/docs/redesign-context/14-reports/sketch/ 2>/dev/null | wc -l` = 0 (flat sibling 강제)
3. `git log -1 --oneline` 마지막 커밋이 본 wave SUMMARY 가 가리키는 commit 과 일치
4. `git diff --name-only HEAD~..HEAD` 결과에 `.planning/` SUMMARY + `sketch-wave-3-mobile-card-list.html` 2건만 (또는 SUMMARY 별도 commit 시 1건)
5. `git status -s` 결과에 cha-bio-safety/src/ / migrations/ / scripts/ 변경 0건
6. verify gate 17/17 PASS 결과가 SUMMARY 안에 숫자로 박제됨
</verification>

<success_criteria>
- sketch HTML 1개 파일이 평면 배치로 작성됨
- W2 카드 markup 패턴이 REPORT_CARDS 10종에 1:1 확장됨 (다크 + 라이트 frame 각각 10 article)
- sub 라인의 가운뎃점이 모두 dot-meta span 으로 변환됨 (총 40건 = 10 카드 × 2 dot × 2 frame)
- 다운로드 글리프 ⬇ 가 lucide Download 인라인 SVG 로 교체됨 (총 ≥20건)
- 그라데이션 0건 / bg-safe-bar solid 통일 (W1 OQ #1 LOCKED 적용)
- footer 안내가 frame 당 1건 등장 (총 2건, 카피 verbatim)
- 메모리 룰 8건이 상단 comment 에 박제됨
- W4 진입 전 OQ 3건이 sketch 하단 §OPEN QUESTIONS 에 default 답과 함께 명시됨
- atomic 1-commit 완료
- ReportsPage.tsx 등 src/ 변경 0건
- verify gate 17/17 PASS 결과 SUMMARY 에 박제
</success_criteria>

<output>
완료 후 SUMMARY 작성:
`.planning/quick/260520-fzl-redesign-14-reports-sketch-wave-3-10-foo/260520-fzl-SUMMARY.md`

SUMMARY 필수 박제 내용:
1. REPORT_CARDS 10종 verbatim 매핑 표 (# / type / title / sub 원문 / dot 분해)
2. W3 OQ 3건 default 적용 결과 (#1 데스크톱 placeholder 미배치 / #2 status 칩 미배치 / #3 hover state 미배치)
3. 메모리 룰 7건 (W2 inherit) + 1건 (W3 추가 = feedback_avoid_premature_confirmation) 박제 위치 (상단 comment 블록 line number)
4. §6 verify gate 17건 결과 (PASS/FAIL + 실제 카운트 숫자)
5. W4 진입 전 OQ 3건 추출 (sticky header / footer 위치 / 2열 그리드) + 각 default 답
6. atomic commit 해시 + 메시지
7. 다음 단계: W4 (데스크톱 상단바) — 사용자 컨펌 후 `/clear` + 새 `/gsd:quick` 시작
</output>
