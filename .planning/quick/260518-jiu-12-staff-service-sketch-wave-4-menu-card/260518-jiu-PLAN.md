---
phase: 260518-jiu-12-staff-service-sketch-wave-4-menu-card
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html
autonomous: true
requirements:
  - W4-MENU-CARDS
  - W4-PDF-DROPZONE
  - W4-STATE-VARIANTS
  - W4-NEGATIVE-GATES

must_haves:
  truths:
    - "사용자가 04-menu-cards-sketch.html 을 브라우저로 열면 4-frame matrix (mobile 다크 / mobile 라이트 / desktop 다크 / desktop 라이트) 가 동시에 보인다"
    - "각 frame 안에 식단 3종 카드 (중식 A / 중식 B / 석식) 가 grid 로 표시되고, 석식 카드는 2-col 풀폭 (gridColumn 1/3) 으로 렌더된다"
    - "각 frame 의 PDF 업로드 dropzone 이 시각적으로 mobile=컴팩트 1px solid border / desktop=2px dashed border + 48px padding 으로 차이가 분명히 보인다"
    - "frame 아래 mini-strip 에 8 state variant (dropzone idle/dragover/uploading/success/error + 식단 카드 skeleton/empty + 식당 미운영일 placeholder) 가 한눈에 비교된다"
    - "라이트 모드 frame 의 카테고리 hex 배경 (rgba 0.08) + border (rgba 0.20) 가 다크 모드와 동일 패턴으로 가독성 유지된다"
    - "grep verify 8 negative gate (9·10·11px 0건 / 이모지 0건 / fire 토큰 0건 / alias 0건 / OLD 카테고리 hex 0건 / NORMALIZED hex 3종 등장 / 4-frame 매트릭스 / 3 식단 카드 클래스 + 8 dropzone variant) 가 모두 PASS 한다"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html"
      provides: "W4 sketch — 식단 3종 카드 + PDF dropzone + 8 state variants, 4-frame matrix"
      contains: "data-theme=\"dark\", data-theme=\"light\", menu-lunch-a, menu-lunch-b, menu-dinner, dropzone, #06b6d4, #d7428c, #d78042"
  key_links:
    - from: "04-menu-cards-sketch.html :root + [data-theme=\"light\"] CSS blocks"
      to: "12-staff-service/tokens.css line 16~119 verbatim"
      via: "CSS custom properties (--surface-page, --text-primary, --border-default 등)"
      pattern: "--surface-page:\\s*#0a0d12"
    - from: ".menu-lunch-a / .menu-lunch-b / .menu-dinner card classes"
      to: "StaffServicePage.tsx line 864~893 menuSection markup (NORMALIZED hex)"
      via: "rgba(rgb, 0.08) bg + rgba(rgb, 0.20) border + 카테고리 hex 텍스트 코너 라벨"
      pattern: "rgba\\(6,\\s*182,\\s*212,\\s*0\\.08\\)"
    - from: ".dropzone mobile / .dropzone desktop"
      to: "StaffServicePage.tsx line 984~1018 uploadSection (mobile=1px solid 12px padding / desktop=2px dashed 48px padding)"
      via: "border-style + padding 변형"
      pattern: "2px dashed"
---

<objective>
W4 of the 12-staff-service redesign sketch series. Produce a single static HTML sketch file that visualizes the 식단 카드 3종 (중식 A / 중식 B / 석식) + PDF 업로드 dropzone region from `StaffServicePage.tsx` (lines 842~1018) using the NORMALIZED categorical hex set defined in UI-SPEC §3.6.

Purpose: Lock visual contract for the W4 region (typography 노안 격상 10/11px → 12/14px, leading-relaxed 본문, 4-frame mobile/desktop × dark/light matrix, 8 state variants) before TSX 변환 wave. No src/ touch — sketch only.

Output: One HTML file at `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html` matching the W2/W3 frame convention, with verbatim tokens.css block, no alias tokens, no fire variants, no OLD pre-normalization categorical hex outside tokens.css verbatim block.
</objective>

<execution_context>
This is a sketch-only quick task. Executor must:
- Use the Write tool to create the file in a single pass (never heredoc).
- NOT modify any TSX, ts, or src/ file. NOT modify any other sketch.
- After write, run the explicit grep verify gate checklist defined in `<verify>` below.
- Sketch HTML is static — no JS, no React, no build. Open in browser to visualize.
</execution_context>

<context>
@CLAUDE.md
@CLAUDE.local.md
@cha-bio-safety/docs/redesign-context/12-staff-service/UI-SPEC.md
@cha-bio-safety/docs/redesign-context/12-staff-service/tokens.css
@cha-bio-safety/docs/redesign-context/12-staff-service/typography.css
@cha-bio-safety/docs/redesign-context/12-staff-service/StaffServicePage.tsx
@cha-bio-safety/docs/redesign-context/12-staff-service/sketch/03-legend-summary-sketch.html
@cha-bio-safety/docs/redesign-context/12-staff-service/sketch/02-calendar-grid-sketch.html

<interfaces>
<!-- Verbatim CSS blocks the sketch MUST inline (tokens.css line 16~197) -->
<!-- Source: cha-bio-safety/docs/redesign-context/12-staff-service/tokens.css -->

Dark mode block (verbatim, MUST appear in :root, [data-theme="dark"]):
```css
--surface-page:    #0a0d12;
--surface-raised:  #1a1f27;
--surface-sunken:  #232a33;
--surface-active:  #2c333d;
--surface-overlay: rgba(0, 0, 0, 0.6);
--text-primary:    #e6edf3;
--text-secondary:  #adb6c0;
--text-tertiary:   #8b949e;
--text-disabled:   #5d646e;
--text-on-accent:  #ffffff;
--text-link:       #58a6ff;
--border-default:  rgba(255, 255, 255, 0.14);
--border-strong:   rgba(255, 255, 255, 0.22);
--border-focus:    #3b82f6;
--accent:          #3b82f6;
--accent-hover:    #60a5fa;
--accent-active:   #2563eb;
--status-safe:     #4ade80;
--status-warning:  #fbbf24;
--status-danger:   #f87171;
--status-info:     #38bdf8;
/* --status-fire 4종 변형 의도적 누락 (§3.4.1) — StaffServicePage 미사용 */
--status-safe-bar:    #22c55e;
--status-warning-bar: #f59e0b;
--status-danger-bar:  #ef4444;
--status-info-bar:    #0ea5e9;
--status-safe-bg:    rgba(34, 197, 94, 0.16);
--status-warning-bg: rgba(245, 158, 11, 0.16);
--status-danger-bg:  rgba(239, 68, 68, 0.16);
--status-info-bg:    rgba(14, 165, 233, 0.16);
--duty-day:    #f59e0b;
--duty-night:  #ef4444;
--duty-off:    #3b82f6;
--duty-leave:  #6b7280;
```

Light mode block (verbatim, MUST appear in [data-theme="light"]):
```css
--surface-page:    #ffffff;
--surface-raised:  #f6f8fa;
--surface-sunken:  #ebeef1;
--surface-active:  #d8dee4;
--surface-overlay: rgba(0, 0, 0, 0.5);
--text-primary:    #1f2328;
--text-secondary:  #4d5562;
--text-tertiary:   #656d76;
--text-disabled:   #afb8c1;
--text-on-accent:  #ffffff;
--text-link:       #0969da;
--border-default:  rgba(0, 0, 0, 0.14);
--border-strong:   rgba(0, 0, 0, 0.22);
--border-focus:    #1f6feb;
--accent:          #1f6feb;
--accent-hover:    #218bff;
--accent-active:   #0a52c4;
--status-safe:     #166534;
--status-warning:  #854d0e;
--status-danger:   #991b1b;
--status-info:     #075985;
--status-safe-bar:    #15803d;
--status-warning-bar: #b45309;
--status-danger-bar:  #b91c1c;
--status-info-bar:    #0369a1;
--status-safe-bg:    #dcfce7;
--status-warning-bg: #fef3c7;
--status-danger-bg:  #fee2e2;
--status-info-bg:    #e0f2fe;
--duty-day:    #b45309;
--duty-night:  #b91c1c;
--duty-off:    #1f6feb;
--duty-leave:  #6b7280;
```

Spacing + radius (테마 무관, verbatim tokens.css line 124~172):
```css
--space-1..8: 4..48px;
--card-padding: 14px (mobile) / 10px (desktop ≥768);
--card-padding-sm: 10px (mobile) / 8px (desktop);
--card-gap: 8px (mobile) / 6px (desktop);
--section-gap: 24px (mobile) / 32px (desktop);
--page-padding: 16px (mobile) / 24px (desktop);
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-pill: 99px;
```

NO alias block (--bg / --bg2 / --bg3 / --bd / --bd2 / --t1 / --t2 / --t3 / --acl / --c-day/night/off/leave) — DO NOT include lines 177~197 of tokens.css.

<!-- W4 카테고리 hex (NORMALIZED — UI-SPEC §3.6 + locked decision A) -->
중식 A코너 = #06b6d4 (식단 cyan — 별도 카테고리 토큰, 정규화 set 와 별개)
중식 B코너 = #d7428c (= 정규화 보건 hex 재사용)
석식      = #d78042 (= 정규화 경조 hex 재사용)

<!-- W4 source markup contract (StaffServicePage.tsx line 864~893 menuSection) -->
menuSection grid 컨테이너:
  display: grid; gridTemplateColumns: 1fr 1fr; gap: 8; padding: 8px 12px 0;

중식 A 카드 (source — 옛 hex / 옛 fontSize, 본 sketch 는 NORMALIZED):
  bg: rgba(6,182,212,0.08); border: 1px solid rgba(6,182,212,0.2); borderRadius: 12; padding: 10px 12px
  코너 라벨: fontSize: 10, fontWeight: 700, color: #06b6d4, marginBottom: 6   ← 10px → 12px 격상
  본문: fontSize: 11, color: var(--t2), lineHeight: 1.6, whiteSpace: pre-line ← 11px → 14px 격상 + leading-relaxed

중식 B 카드 (source = #ec4899 / W4 = #d7428c):
  bg: rgba(215,66,140,0.08); border: 1px solid rgba(215,66,140,0.20)

석식 카드 (source = #f97316 / W4 = #d78042):
  bg: rgba(215,128,66,0.08); border: 1px solid rgba(215,128,66,0.20)
  gridColumn: 1 / 3 (풀폭)

<!-- W4 source markup contract (StaffServicePage.tsx line 984~1018 uploadSection) -->
uploadSection label:
  display: flex; alignItems: center; justifyContent: center
  padding: isDesktop ? '48px 0' : '12px 0'
  borderRadius: 12
  background: var(--bg2)          → 본 sketch: var(--surface-raised)
  border: isDesktop ? '2px dashed var(--bd)' : '1px solid var(--bd)'  → var(--border-default)
  color: var(--t2)                → var(--text-secondary)
  fontSize: 12, fontWeight: 600   → text-caption font-semibold leading-none
  hover dragover: borderColor var(--acl) → var(--accent)

라벨 텍스트:
  모바일: "식단표 PDF 업로드"
  데스크톱: "식단표 PDF 드래그앤드롭 또는 클릭하여 업로드"
</interfaces>

<frame_convention>
<!-- W2/W3 verbatim frame convention -->
- 페이지 외곽 body: background #0f1218 (raw hex 예외 — 페이지 외곽 only)
- frame border: 1px solid #2a2f3a (raw hex 예외 — frame border only)
- frame-mobile: width 393px; background var(--surface-page); border-radius 12px; overflow hidden
- frame-desktop: width 1024px (또는 1280) — UI-SPEC §3 desktop 분기 768+; 본 W4 는 1024 권장; padding 24px
- frame-row: display flex; flex-wrap wrap; gap 32px; align-items flex-start
- 각 frame 위 vp-label: "VP1 · 모바일 다크 · 393" / "VP2 · 모바일 라이트 · 393" / "VP3 · 데스크톱 다크 · 1024" / "VP4 · 데스크톱 라이트 · 1024"
- 모바일 frame 안에 menu-region 컨테이너: padding 8px 12px 0 (source line 865 verbatim)
- 데스크톱 frame 안에 menu-region 컨테이너: padding 8px 12px 0 (동일 — 좌측 panel layout 흉내; W6 의 3패널 frame 은 W6 에서 별도)
</frame_convention>

<negative_gates_for_verify>
1. font-size 9·10·11px 0건 (regex: `font-size:\s*(9|10|11)px` 0)
2. 이모지 0건 (이모지 정규식 매칭 0)
3. fire 토큰 변형 0건 (`--status-fire | --status-fire-bar | --status-fire-bg` 정의 0 / `text-fire | bg-fire | status-fire` 사용 0)
4. alias 토큰 0건 (`--bg | --bg2 | --bg3 | --bd | --bd2 | --t1 | --t2 | --t3 | --acl | --c-day | --c-night | --c-off | --c-leave` 정의 + 사용 모두 0)
5. OLD 카테고리 hex 0건 outside tokens.css verbatim — 즉 `#22c55e | #a855f7 | #f97316 | #ef4444 | #ec4899 | #6366f1` 가 dark/light :root 토큰 블록 (--status-* 정의) 안만 등장. menu / dropzone 마크업 / 새 클래스 정의 안에서는 0건.
6. NORMALIZED 카테고리 hex 3종 모두 등장: `#06b6d4` (중식 A), `#d7428c` (중식 B), `#d78042` (석식) 각 ≥ 1회
7. 4-frame 매트릭스 존재: `data-theme="dark"` ≥ 2회, `data-theme="light"` ≥ 2회, `.frame-mobile` ≥ 2회, `.frame-desktop` ≥ 2회 (또는 동등 클래스)
8. 3 식단 카드 클래스 각 1+ 등장 (예: `.menu-lunch-a`, `.menu-lunch-b`, `.menu-dinner`) AND 8 dropzone state variants 명시 (idle / dragover / uploading / success / error / skeleton / empty / 미운영일)
</negative_gates_for_verify>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write 04-menu-cards-sketch.html (4-frame 식단 + dropzone matrix + 8 state variants)</name>
  <files>cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html</files>
  <action>
Create a single static HTML5 sketch file matching the W2/W3 frame convention. Use the Write tool in one pass — never heredoc.

**File skeleton (top-down):**

1. `<!DOCTYPE html>` + `<html lang="ko">` + `<head>` with:
   - `<meta charset="UTF-8">` + `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
   - `<title>12 연차 및 식사 — sketch W4 식단 카드 + PDF 업로드 dropzone</title>`
   - Pretendard CDN link (same as W3 line 7)
   - `<style>` block containing:

2. **Verbatim tokens.css blocks** — Copy the 3 verbatim blocks from `<interfaces>` above (dark, light, spacing+radius). Use the same `/* === ... === */` section headers as 03-legend-summary-sketch.html. Do NOT include the alias block (tokens.css line 177~197).

3. **Sketch page chrome** (W3 line 168~204 verbatim adaptation):
   ```
   * { box-sizing: border-box; }
   body { margin:0; padding:32px; background:#0f1218; color:var(--text-secondary); font-family:'Pretendard Variable',...; line-height:1.55; }
   h1 { font-size:18px; color:var(--text-primary); margin:0 0 4px 0; font-weight:700; }
   p.lead { font-size:13px; color:var(--text-tertiary); margin:0 0 24px 0; max-width:860px; }
   .frame-row { display:flex; flex-wrap:wrap; gap:32px; align-items:flex-start; }
   .vp-label { font-size:13px; color:var(--text-tertiary); margin-bottom:8px; }
   .frame-mobile { width:393px; background:var(--surface-page); color:var(--text-primary); border:1px solid #2a2f3a; border-radius:12px; overflow:hidden; display:flex; flex-direction:column; position:relative; }
   .frame-desktop { width:1024px; background:var(--surface-page); color:var(--text-primary); border:1px solid #2a2f3a; border-radius:12px; overflow:hidden; display:flex; flex-direction:column; position:relative; }
   ```

4. **menu-region container** (mobile + desktop 공통 패턴 — source line 865):
   ```
   .menu-region { padding:8px 12px 0; background:var(--surface-page); display:grid; grid-template-columns:1fr 1fr; gap:8px; }
   .menu-region-desktop { padding:16px 24px 0; gap:12px; } /* desktop card-gap 6 +섹션 여유; UI-SPEC §3 desktop padding 24 */
   ```

5. **3 식단 카드 클래스** (NORMALIZED hex — locked decision A):
   ```
   .menu-card { border-radius:var(--radius-md); padding:10px 12px; }
   .menu-card .menu-label { font-size:12px; line-height:1; font-weight:700; margin-bottom:6px; }
   .menu-card .menu-body { font-size:14px; line-height:1.625; color:var(--text-secondary); white-space:pre-line; }

   .menu-lunch-a { background:rgba(6, 182, 212, 0.08); border:1px solid rgba(6, 182, 212, 0.20); }
   .menu-lunch-a .menu-label { color:#06b6d4; }

   .menu-lunch-b { background:rgba(215, 66, 140, 0.08); border:1px solid rgba(215, 66, 140, 0.20); }
   .menu-lunch-b .menu-label { color:#d7428c; }

   .menu-dinner { grid-column:1 / 3; background:rgba(215, 128, 66, 0.08); border:1px solid rgba(215, 128, 66, 0.20); }
   .menu-dinner .menu-label { color:#d78042; }
   ```

   - Label 크기 = text-caption 12px font-bold leading-none (source 10px → 12px 노안 격상)
   - Body 크기 = text-body-sm 14px leading-relaxed (1.625) text-secondary white-space pre-line (source 11px → 14px 노안 격상 + UI-SPEC §12 W4 leading-relaxed 강제)
   - Korean alpha syntax = `rgba(6, 182, 212, 0.08)` raw — locked decision B 의 spec-allowed exception

6. **menu-card skeleton (loading state)** — surface-sunken background + 3줄 회색 placeholder 라인:
   ```
   .menu-card-skeleton { background:var(--surface-sunken); border:1px solid var(--border-default); padding:10px 12px; border-radius:var(--radius-md); }
   .menu-card-skeleton .skeleton-line { background:var(--border-default); border-radius:4px; height:12px; margin-bottom:8px; }
   .menu-card-skeleton .skeleton-line:nth-child(1) { width:40%; }
   .menu-card-skeleton .skeleton-line:nth-child(2) { width:80%; }
   .menu-card-skeleton .skeleton-line:nth-child(3) { width:60%; margin-bottom:0; }
   ```

7. **menu-card empty state** — surface-raised + "등록된 메뉴 없음" text-tertiary 중앙 정렬:
   ```
   .menu-card-empty { background:var(--surface-raised); border:1px dashed var(--border-default); border-radius:var(--radius-md); padding:14px 12px; text-align:center; font-size:13px; line-height:1; color:var(--text-tertiary); }
   ```

8. **dropzone variants** (locked decision E):
   ```
   .dropzone { display:flex; align-items:center; justify-content:center; gap:8px; border-radius:var(--radius-md); background:var(--surface-raised); color:var(--text-secondary); font-size:12px; line-height:1; font-weight:600; text-align:center; cursor:pointer; transition:border-color 0.15s; }
   .dropzone-mobile  { padding:12px 0; border:1px solid var(--border-default); }
   .dropzone-desktop { padding:48px 0; border:2px dashed var(--border-default); }
   .dropzone-dragover { border-color:var(--accent); color:var(--accent); }
   .dropzone-uploading { color:var(--text-tertiary); }
   .dropzone-uploading .spinner { width:14px; height:14px; border-radius:50%; border:2px solid var(--border-default); border-top-color:var(--accent); display:inline-block; }
   .dropzone-success { border-color:var(--status-safe-bar); color:var(--status-safe); }
   .dropzone-error   { border-color:var(--status-danger-bar); color:var(--status-danger); }
   ```

   - 아이콘은 inline SVG (lucide Upload 아이콘 단순화: 화살표 + 가로선) size 14, currentColor stroke. 또는 dropzone-desktop variant 의 경우 inline SVG `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`
   - 성공 variant 안 체크 SVG (lucide Check):
     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
   - 에러 variant 옆 callout: `.toast-callout { margin-top:8px; padding:8px 12px; border-radius:var(--radius-sm); background:var(--status-danger-bg); border:1px solid var(--status-danger-bar); color:var(--status-danger); font-size:13px; line-height:1.4; }` + 텍스트 "PDF 파일만 업로드 가능합니다"

9. **menuSection 미운영일 placeholder** — 일요일/공휴일/공휴일직후토요일 (mealCalc 운영규칙 — source line 850~862):
   ```
   .menu-region-closed { padding:16px; background:var(--surface-raised); border:1px dashed var(--border-default); border-radius:var(--radius-md); text-align:center; font-size:13px; line-height:1.5; color:var(--text-tertiary); }
   ```
   - 텍스트: "식당 미운영일 (일요일 / 공휴일 / 공휴일 직후 토요일)"

10. **state-strip section** (frame matrix 아래):
    ```
    .state-section { margin-top:40px; max-width:1100px; }
    .state-section h2 { font-size:16px; color:var(--text-primary); margin:0 0 12px 0; font-weight:700; }
    .state-section p.state-lead { font-size:13px; color:var(--text-tertiary); margin:0 0 16px 0; }
    .state-grid { display:grid; grid-template-columns:repeat(2, minmax(280px, 1fr)); gap:16px; padding:16px; border-radius:12px; }
    .state-grid.dark { background:var(--surface-page); border:1px solid #2a2f3a; margin-bottom:16px; }
    .state-grid.light { background:#ffffff; border:1px solid #d0d7de; }
    .state-card-wrap { display:flex; flex-direction:column; gap:6px; }
    .state-card-wrap .annotation { font-size:12px; line-height:1.35; color:var(--text-secondary); font-weight:600; }
    ```

11. **rules box** (W3 verbatim 패턴):
    ```
    .rules { margin-top:40px; padding:16px 20px; background:rgba(255,255,255,0.03); border:1px solid var(--border-default); border-radius:8px; max-width:860px; }
    .rules h2 { font-size:16px; margin:0 0 6px 0; color:var(--text-primary); }
    .rules h3 { font-size:14px; margin:16px 0 6px 0; color:var(--text-primary); }
    .rules p { font-size:13px; color:var(--text-tertiary); margin:0 0 10px 0; }
    .rules ul, .rules ol { margin:0; padding-left:20px; font-size:13px; color:var(--text-secondary); }
    .rules li { margin-bottom:4px; }
    ```

12. **`<body>` content**:

    **a) Heading + lead** (W3 패턴):
    ```
    <h1>12 · 연차 및 식사 — sketch W4 식단 카드 + PDF 업로드</h1>
    <p class="lead">
      W4 검증 포인트 (UI-SPEC §12): 식단 3종 카드 (중식 A / 중식 B / 석식, NORMALIZED 카테고리 hex)
      + PDF 업로드 dropzone (모바일=컴팩트 1px solid / 데스크톱=2px dashed 48px padding)
      + leading-relaxed 14px 본문 (source 11px → 14px 노안 격상). 다크 + 라이트 + 모바일 + 데스크톱 4-frame matrix
      + 8 state variant (idle/dragover/uploading/success/error/skeleton/empty/미운영일) mini-strip.
    </p>
    ```

    **b) frame-row (4 frame — VP1~VP4)**:

    각 frame 은 다음 구조 (mobile dark 예시):
    ```
    <div>
      <div class="vp-label">VP1 · 모바일 다크 · 393</div>
      <div class="frame-mobile" data-theme="dark">
        <div class="menu-region">
          <div class="menu-card menu-lunch-a">
            <div class="menu-label">중식 A코너</div>
            <div class="menu-body">잡곡밥&#10;콩나물국&#10;돼지불고기&#10;계란말이&#10;김치</div>
          </div>
          <div class="menu-card menu-lunch-b">
            <div class="menu-label">중식 B코너</div>
            <div class="menu-body">현미밥&#10;된장찌개&#10;고등어구이&#10;시금치나물&#10;깍두기</div>
          </div>
          <div class="menu-card menu-dinner">
            <div class="menu-label">석식 메뉴</div>
            <div class="menu-body">백미밥&#10;미역국&#10;제육볶음&#10;감자조림&#10;배추김치</div>
          </div>
        </div>
        <div style="padding:14px 12px;">
          <div class="dropzone dropzone-mobile">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            식단표 PDF 업로드
          </div>
        </div>
      </div>
    </div>
    ```

    Light mobile = 동일 구조, `data-theme="light"`.

    Desktop dark (VP3):
    ```
    <div>
      <div class="vp-label">VP3 · 데스크톱 다크 · 1024</div>
      <div class="frame-desktop" data-theme="dark">
        <div class="menu-region menu-region-desktop">
          <!-- 3 카드 동일 구조 (gap 12, padding 24) -->
        </div>
        <div style="padding:16px 24px;">
          <div class="dropzone dropzone-desktop">
            <svg width="28" height="28" ...></svg>
            식단표 PDF 드래그앤드롭 또는 클릭하여 업로드
          </div>
        </div>
      </div>
    </div>
    ```

    Light desktop = VP4, `data-theme="light"`, 동일 구조.

    NOTE on Korean alpha hex: 카드 배경 `rgba(R, G, B, 0.08)` 은 spec-allowed exception (locked decision B) — inline 으로 사용하지 말고, 미리 정의된 `.menu-lunch-a/b/.menu-dinner` 클래스로 처리. CSS 변수에 묶지 말고 클래스 정의에 raw rgba 로 직접 작성.

    **c) 8 state variant section** (state-grid):

    state-section 안에 다크 + 라이트 grid 2개. 각 grid 안에 8 cell (state-card-wrap):
    1. dropzone idle (모바일) — `.dropzone-mobile` + annotation "idle — 기본 상태"
    2. dropzone idle (데스크톱) — `.dropzone-desktop` + annotation "idle — 데스크톱 드롭존 2px dashed"
    3. dropzone dragover — `.dropzone-mobile.dropzone-dragover` + 텍스트 "PDF 놓아주세요" + annotation "dragover — border-color: var(--accent)"
    4. dropzone uploading — `.dropzone-mobile.dropzone-uploading` + spinner + "업로드 중..." + annotation "uploading — toast 식단표 분석 중..."
    5. dropzone success — `.dropzone-mobile.dropzone-success` + check SVG + "업로드 완료" + annotation "success — border-color: status-safe-bar"
    6. dropzone error — `.dropzone-mobile.dropzone-error` + "업로드 실패" + 옆에 `.toast-callout` "PDF 파일만 업로드 가능합니다" + annotation "error — toast.error PDF 외 파일"
    7. menu-card skeleton — `.menu-card-skeleton` × 3줄 + annotation "skeleton — menuQuery loading"
    8. menu-card empty — `.menu-card-empty` "등록된 메뉴 없음" + annotation "empty — menuData null (현재 menuSection 미렌더, 단 시각 검증 위해 변환 후보 케이스로 시안)"

    (PLUS bonus variant 8.5 — `.menu-region-closed` "식당 미운영일 (일요일 / 공휴일 / 공휴일 직후 토요일)" + annotation "menuSection 미운영일 placeholder — mealCalc 룰. 현재 source = return null. W4 sketch 는 시각 검증 위해 placeholder 1종 추가.")

    → 다크 grid 8 cell + 라이트 grid 8 cell = state-strip 합계 16 cell. 둘 다 같은 8 variant 를 동일 순서로 배치.

    **d) rules box** (W3 패턴 — 7 섹션):

    제목 "적용 룰 — W4 식단 카드 + PDF 업로드"

    - 식단 카드 룰 (UI-SPEC §5.9):
      - 3 카드 2-col grid, 석식 = grid-column 1/3 풀폭
      - bg = rgba(카테고리 RGB, 0.08), border = 1px solid rgba(카테고리 RGB, 0.20), radius = var(--radius-md), padding = 10px 12px
      - 라벨: text-caption 12px font-bold leading-none + 카테고리 hex 색 (source 10px → 12px 노안 격상)
      - 본문: text-body-sm 14px leading-relaxed white-space pre-line text-secondary (source 11px → 14px + UI-SPEC §12 W4 leading-relaxed 강제)
      - 카테고리 hex 3종 — 중식 A #06b6d4 (식단 cyan, §3.6) / 중식 B #d7428c (= 정규화 보건 §3.5) / 석식 #d78042 (= 정규화 경조 §3.5). source 의 #ec4899 / #f97316 OLD hex 폐기.
      - 메뉴 항목 = source 의 ` / ` 구분 → 줄바꿈 (`white-space: pre-line` 패턴 유지)
      - 시간대별 표시 (source line 860~862): isLunch (08:00~13:00) → 중식 A+B / isDinner (13:00~18:30) → 석식 / 그 외 → menuSection 미렌더. W4 sketch 는 정상 시각화 위해 모든 3 카드 동시 표시.

    - PDF 업로드 dropzone 룰 (UI-SPEC §5.10):
      - 모바일: padding 12px 0, border 1px solid var(--border-default), 작은 버튼 형태
      - 데스크톱: padding 48px 0, border 2px dashed var(--border-default), 큰 드롭존
      - bg = var(--surface-raised), color = var(--text-secondary), font-size 12px font-semibold leading-none
      - hover/dragover: border-color var(--accent)
      - radius var(--radius-md) 12px
      - 라벨: 모바일 "식단표 PDF 업로드" / 데스크톱 "식단표 PDF 드래그앤드롭 또는 클릭하여 업로드"

    - state variant 룰 (UI-SPEC §6 state matrix):
      - idle / dragover / uploading / success / error / skeleton / empty / 미운영일 = 8 variant
      - dragover = border-color var(--accent) (source line 988)
      - uploading = toast "식단표 분석 중..." + spinner (source onChange={handleMenuUpload})
      - success = border-color status-safe-bar, 체크 아이콘
      - error = border-color status-danger-bar, toast "PDF 파일만 업로드 가능합니다"
      - skeleton = menuQuery loading (현재 source 는 return null, W4 시각 검증 위해 변환 후보 케이스 시안)
      - empty = menuData null (source 자체 미렌더)
      - 미운영일 = mealCalc 룰 (일요일/공휴일/공휴일직후토요일) → 자체 placeholder (변환 후보 시안, source 는 null)

    - typography 룰 (UI-SPEC §7.1 + 노안 룰):
      - 9·10·11px 0건
      - 라벨 12px text-caption font-bold leading-none (작은 컨테이너 안 caption 룰)
      - 본문 14px text-body-sm leading-relaxed (UI-SPEC §12 W4 검증 포인트)
      - dropzone 라벨 12px text-caption font-semibold leading-none

    - 색 룰 (§3.4.1 / §3.5 / §3.6):
      - 긴급/조치-대기 fire 변형 4종 (status-fire / status-fire-bar / status-fire-bg / text-fire) 0건 — §3.4.1 룰로 본 페이지 미사용
      - duty 4 토큰 — W4 미사용 (식단/dropzone 카테고리만)
      - 카테고리 hex 3종 (#06b6d4 / #d7428c / #d78042) — 식단 카드 bg/border/라벨에만 사용
      - status-safe / status-danger — dropzone success/error variant 에만 사용

    - source-of-truth 매핑 (TSX 변환 시):
      - StaffServicePage.tsx line 864~893 menuSection: 옛 hex (#ec4899 / #f97316) 두 곳 + fontSize 10/11 두 곳 + lineHeight 1.6 두 곳 → 본 sketch 의 NORMALIZED hex + 12/14px + leading 1.625 (relaxed) 로 교체
      - StaffServicePage.tsx line 984~1018 uploadSection: alias var(--bg2 / --bd / --acl / --t2) → var(--surface-raised / --border-default / --accent / --text-secondary) 교체
      - var(--bg2) (line 1006) → var(--surface-raised). border var(--bd) → var(--border-default). hover var(--acl) → var(--accent).

    - negative gate (verify grep — 본 sketch 검증):
      - 9·10·11px 0건
      - 이모지 0건
      - fire 변형 (--status-fire / text-fire / bg-fire) 0건 (§3.4.1)
      - alias 토큰 (--bg / --bg2 / --bg3 / --bd / --bd2 / --t1 / --t2 / --t3 / --acl / --c-day/night/off/leave) 0건
      - OLD 카테고리 hex (#22c55e / #a855f7 / #f97316 / #ef4444 / #ec4899 / #6366f1) — :root 토큰 정의 블록 안 예외 (단, --status-fire-bar 는 의도적 누락이므로 #f97316 도 0건 — light --status-fire 변형 없음). dark --status-safe-bar = #22c55e, dark --status-danger-bar = #ef4444 만 예외. dark --status-warning-bar = #f59e0b, dark --status-info-bar = #0ea5e9 도 예외.
      - NORMALIZED 카테고리 hex 3종 (#06b6d4 / #d7428c / #d78042) 각 ≥ 1회. (식단 W4 미사용 hex #42d778 / #8f42d7 / #d74242 / #4244d7 는 본 sketch 에서 미등장 — UI-SPEC §3.6 식단 카테고리는 3종만)
      - 4-frame 매트릭스 (dark mobile / light mobile / dark desktop / light desktop) — `data-theme="dark"` ≥ 2회, `data-theme="light"` ≥ 2회, `.frame-mobile` ≥ 2회, `.frame-desktop` ≥ 2회
      - 3 식단 카드 클래스 (.menu-lunch-a / .menu-lunch-b / .menu-dinner) 각 ≥ 1회 사용
      - 8 dropzone state variants — .dropzone-mobile / .dropzone-desktop / .dropzone-dragover / .dropzone-uploading / .dropzone-success / .dropzone-error / .menu-card-skeleton / .menu-card-empty / .menu-region-closed 각 ≥ 1회 (실제 8 + 미운영일 1 = 합계 9)

    - 다음 wave: W5 — 05-bottomsheet-sketch.html (BottomSheet 전체)

13. `</body></html>` 닫기.

**Implementation discipline:**
- Korean text in HTML body: 자연스럽게 (no romanization).
- Korean labels MUST exactly match locked decisions D: "중식 A코너" / "중식 B코너" / "석식 메뉴" / "식단표 PDF 업로드" / "식단표 PDF 드래그앤드롭 또는 클릭하여 업로드" / "PDF 파일만 업로드 가능합니다" / "업로드 중..." / "업로드 완료" / "등록된 메뉴 없음" / "식당 미운영일 (일요일 / 공휴일 / 공휴일 직후 토요일)".
- 이모지 절대 금지 (locked decision F + planner-skill rule). 모든 시각 강조는 SVG inline (lucide Upload / Check / Loader2 단순화 패턴) 또는 CSS 컬러 변형으로 처리.
- 줄바꿈은 `&#10;` HTML entity 또는 raw `\n` (CSS `white-space: pre-line` 으로 렌더). 본문 menu-body 안에 `&#10;` 사용 권장 (W2/W3 패턴과 일관성).
- alias 토큰 절대 금지 — 모든 CSS variable 참조는 `--surface-* / --text-* / --border-* / --accent / --status-* / --duty-*` 신 v0.1.1 이름.
- fire 변형 절대 금지 — `--status-fire*`, `text-fire`, `bg-fire`, `status-fire-bar` 등 일체 정의/사용 0건.
- Light mode `:root` 토큰 정의에서 `--status-fire` 라인 자체 누락 (W3 03-legend-summary-sketch.html line 44, 95 의 의도적 누락 코멘트 유지). dark `:root` 도 `--status-fire` 4종 일체 누락.

**Why this matters (post-write verification):**
- Source 의 옛 hex / 옛 fontSize 가 그대로 sketch 에 흘러들어가면 TSX 변환 wave 에서 v0.1.1 룰 위반 — sketch 가 single source-of-truth 역할을 못 함.
- planner-skill `feedback_planner_prompt_sketch_verbatim.md` + `feedback_redesign_sketch_rule_enforcement.md` 룰: sketch CSS 정의 verbatim 인용 강제 + negative gate 강제.
  </action>

  <verify>
    <automated>
test -f cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html && \
echo "─── Negative gate 1: 9/10/11px font-size ───" && \
test "$(grep -E 'font-size:\s*(9|10|11)px' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html | wc -l | tr -d ' ')" = "0" && \
echo "─── Negative gate 2: emoji ───" && \
test "$(LC_ALL=C grep -P '[\x{1F300}-\x{1F9FF}]|[\x{2600}-\x{27BF}]|[\x{1F000}-\x{1F02F}]' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html 2>/dev/null | wc -l | tr -d ' ')" = "0" && \
echo "─── Negative gate 3: fire 변형 ───" && \
test "$(grep -E '\-\-status-fire|text-fire|bg-fire' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html | wc -l | tr -d ' ')" = "0" && \
echo "─── Negative gate 4: alias tokens ───" && \
test "$(grep -E '\-\-(bg2?|bg3|bg4|bd2?|t1|t2|t3|acl|c-day|c-night|c-off|c-leave)\b' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html | wc -l | tr -d ' ')" = "0" && \
echo "─── Negative gate 5: OLD categorical hex outside tokens.css ───" && \
test "$(grep -vE '^\s*--status-(safe|warning|danger|info|fire)(-bar|-bg)?:|^\s*--duty-(day|night|off|leave):' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html | grep -E '#(22c55e|a855f7|f97316|ef4444|ec4899|6366f1)\b' | wc -l | tr -d ' ')" = "0" && \
echo "─── Positive gate 6: NORMALIZED hex 3종 each ≥ 1 ───" && \
test "$(grep -c '#06b6d4' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html)" -ge 1 && \
test "$(grep -c '#d7428c' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html)" -ge 1 && \
test "$(grep -c '#d78042' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html)" -ge 1 && \
echo "─── Positive gate 7: 4-frame matrix ───" && \
test "$(grep -c 'data-theme="dark"' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html)" -ge 2 && \
test "$(grep -c 'data-theme="light"' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html)" -ge 2 && \
test "$(grep -c 'frame-mobile' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html)" -ge 2 && \
test "$(grep -c 'frame-desktop' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html)" -ge 2 && \
echo "─── Positive gate 8: 3 menu card classes + 8+ dropzone variants ───" && \
test "$(grep -c 'menu-lunch-a' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html)" -ge 2 && \
test "$(grep -c 'menu-lunch-b' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html)" -ge 2 && \
test "$(grep -c 'menu-dinner' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html)" -ge 2 && \
test "$(grep -c 'dropzone-mobile' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html)" -ge 1 && \
test "$(grep -c 'dropzone-desktop' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html)" -ge 1 && \
test "$(grep -c 'dropzone-dragover' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html)" -ge 1 && \
test "$(grep -c 'dropzone-uploading' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html)" -ge 1 && \
test "$(grep -c 'dropzone-success' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html)" -ge 1 && \
test "$(grep -c 'dropzone-error' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html)" -ge 1 && \
test "$(grep -c 'menu-card-skeleton' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html)" -ge 1 && \
test "$(grep -c 'menu-card-empty' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html)" -ge 1 && \
test "$(grep -c 'menu-region-closed' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html)" -ge 1 && \
echo "─── Positive gate 9: NORMALIZED Korean labels ───" && \
grep -q '중식 A코너' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html && \
grep -q '중식 B코너' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html && \
grep -q '석식 메뉴' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html && \
grep -q '식단표 PDF 업로드' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html && \
grep -q '식단표 PDF 드래그앤드롭' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html && \
grep -q 'PDF 파일만 업로드 가능합니다' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html && \
echo "─── ALL GATES PASS ───"
    </automated>
  </verify>

  <done>
    - File exists at cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html
    - Valid HTML5 (DOCTYPE + html lang ko + head/body)
    - All 9 verify gates above PASS
    - Opens in browser showing:
      • 4 frames (mobile dark / mobile light / desktop dark / desktop light) side-by-side
      • Each frame: 3 식단 카드 grid (중식 A + B side-by-side, 석식 full-row) + dropzone (mobile=1px solid / desktop=2px dashed)
      • Below frames: state-strip with dark + light grid, each 8 state cells (+1 미운영일 bonus)
      • Rules box at bottom documenting decision A~F traceability
  </done>
</task>

</tasks>

<verification>
After the task, the executor MUST confirm:
1. All 9 verify gates in `<verify><automated>` PASS (chained `&&` — single failure aborts).
2. File opens in browser without console errors (sketch is static HTML — no JS).
3. Visual check: 4-frame matrix renders, light mode hex bg/border looks crisp (not washed out), desktop dropzone visibly larger than mobile.
4. Cross-reference UI-SPEC §5.9 + §5.10 + §12 W4 검증 포인트 (카테고리 색 / 라이트 모드 호환 / leading-relaxed 본문) — all 3 boxes ticked.
</verification>

<success_criteria>
- Single file output at the locked path.
- All 9 grep gates PASS.
- 4-frame matrix (mobile×desktop × dark×light) visually distinct.
- 8 state variants present in mini-strip (+1 미운영일 bonus = 9 visible cells per grid).
- NORMALIZED hex 3종 (#06b6d4 / #d7428c / #d78042) only — OLD pre-normalization hex (#ec4899 / #f97316 등) ZERO outside tokens.css :root verbatim block.
- Korean labels exactly match locked decisions D.
- No alias tokens (--bg / --bd / --t* / --acl / --c-*) anywhere.
- No fire variants (--status-fire / text-fire / bg-fire) anywhere.
- No emojis anywhere.
- No 9/10/11px font-size anywhere.
- src/ untouched.
</success_criteria>

<output>
After completion, no SUMMARY required (quick mode).
Final artifact: cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html
</output>
