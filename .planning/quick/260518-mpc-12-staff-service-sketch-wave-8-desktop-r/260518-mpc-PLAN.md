---
phase: 260518-mpc
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/12-staff-service/sketch/08-desktop-pdf-preview-sketch.html
autonomous: true
requirements:
  - W8-DESKTOP-PDF-PREVIEW
must_haves:
  truths:
    - "Sketch HTML 파일이 정확한 경로에 생성된다 (cha-bio-safety/docs/redesign-context/12-staff-service/sketch/08-desktop-pdf-preview-sketch.html)"
    - "유효한 HTML5 문서로 브라우저에서 열린다"
    - "4개의 viewport (VP1 빈 상태 / VP2 연차 / VP3 기타특별 / VP4 라이트) 가 한 페이지에 stack 으로 표시된다"
    - "각 viewport 의 A4 placeholder 가 흰 배경 (#ffffff) + 595/842 비율로 렌더된다 (다크/라이트 무관)"
    - "lp[0..16] 17개 좌표 각각이 source verbatim x/y % 위치에 박스 마커로 시각화된다"
    - "VP1 에서 17개 모든 lp 위치가 dashed outline 박스 + 인덱스 라벨 (lp[0]~lp[16]) 로 표시된다"
    - "VP2 (연차) 에서 lp[0,1,2,3,4,5,14,15] 가 텍스트로 채워지고 lp[6] 가 solid 검정 12×12 체크박스로 표시된다"
    - "VP3 (기타특별) 에서 lp[12] 체크박스 + lp[13] 기타특별 종류 + lp[16] 사유가 채워진다"
    - "VP4 라이트 모드에서 컨테이너만 라이트 surface 로 변하고 A4 박스는 흰색 유지 (UI-SPEC §12 W8 검증 포인트)"
    - "tokens.css / typography.css 의 토큰 정의를 verbatim 인용한다 (alias 0건)"
    - "이모지 0건 / 9·10·11px font-size 0건 (source lp text 10 → 12 격상) / status-fire·text-fire·bg-fire 0건"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/12-staff-service/sketch/08-desktop-pdf-preview-sketch.html"
      provides: "W8 desktop right panel PDF preview sketch with 4 viewport states"
      contains: "lp[0] through lp[16] markers at verbatim coordinates from StaffServicePage.tsx line 159~177"
  key_links:
    - from: "08-desktop-pdf-preview-sketch.html"
      to: "StaffServicePage.tsx line 159~177 (lp coordinate map)"
      via: "verbatim x%/y% positions in inline left/top styles"
      pattern: "left:\\s*80\\.34%|left:\\s*43\\.70%|left:\\s*23\\.44%"
    - from: "08-desktop-pdf-preview-sketch.html :root tokens"
      to: "tokens.css verbatim"
      via: "CSS custom properties — no alias mapping"
      pattern: "--surface-raised:\\s*#1a1f27"
    - from: "08-desktop-pdf-preview-sketch.html .text-caption etc."
      to: "typography.css verbatim"
      via: "global utility classes (text-caption / text-body-sm / text-body / text-title)"
      pattern: "\\.text-caption\\s*\\{"
---

<objective>
W8 of the 12-staff-service redesign series. Produce the final desktop layout sketch covering the right panel (PDF preview + lp[0..16] coordinate overlay visualization).

Purpose: Visually validate the lp[0..16] coordinate map in design context, while preserving UI-SPEC §10 NEGATIVE scope (17 lp coordinates verbatim, never altered). This sketch is the design source-of-truth for the TSX conversion wave that follows W6/W7/W8.

Output: `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/08-desktop-pdf-preview-sketch.html` — single HTML file, 4 viewport stack, no src/ touches.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
# Project rules
@CLAUDE.md
@CLAUDE.local.md

# UI spec — read §4.3 (mobile column reference), §5.7 (right PDF preview panel — exact HTML structure), §10.1 (NEGATIVE scope — lp coordinates / font / checkbox / 595px / template path), §12 W8 row
@cha-bio-safety/docs/redesign-context/12-staff-service/UI-SPEC.md

# Token source — verbatim copy required (NO alias mapping)
@cha-bio-safety/docs/redesign-context/12-staff-service/tokens.css
@cha-bio-safety/docs/redesign-context/12-staff-service/typography.css

# Source TSX — lp definition (line 154~177) + right panel render block (line 1225~1273)
@cha-bio-safety/docs/redesign-context/12-staff-service/StaffServicePage.tsx

# Prior sketch waves — chrome/frame/token pattern to mirror (W6 = 3-panel layout, W7 = center form)
@cha-bio-safety/docs/redesign-context/12-staff-service/sketch/06-desktop-3panel-sketch.html
@cha-bio-safety/docs/redesign-context/12-staff-service/sketch/07-desktop-form-sketch.html

<interfaces>
# Verbatim lp coordinate map (from StaffServicePage.tsx line 159~177).
# These 17 entries MUST appear in the sketch HTML at exact left:{x}% / top:{y}% positions.
# UI-SPEC §10.1 lists this as NEGATIVE scope — never modify.

const lp: Record<number, { x: number; y: number }> = {
  0:  { x: 80.34, y: 27.79 },  // 입사일
  1:  { x: 80.34, y: 32.07 },  // 생년월일
  2:  { x: 43.70, y: 31.81 },  // 성명
  3:  { x: 38.99, y: 37.66 },  // 기간시작
  4:  { x: 57.82, y: 37.66 },  // 기간종료
  5:  { x: 69.75, y: 37.66 },  // 기간 일수
  6:  { x: 23.44, y: 44.20 },  // 체크 연차
  7:  { x: 40.75, y: 43.88 },  // 체크 경조
  8:  { x: 56.60, y: 43.88 },  // 체크 병가공상
  9:  { x: 77.32, y: 43.88 },  // 체크 병가사상
  10: { x: 23.49, y: 48.79 },  // 체크 보건
  11: { x: 40.75, y: 48.79 },  // 체크 공가
  12: { x: 56.60, y: 48.79 },  // 체크 기타특별
  13: { x: 76.47, y: 48.78 },  // 기타특별 사유
  14: { x: 55.29, y: 60.83 },  // 연락처
  15: { x: 62.86, y: 69.77 },  // 신청일수
  16: { x: 55.38, y: 74.79 },  // 기타사항
}

# Right panel container (source StaffServicePage.tsx line 1226 — adapted per locked decisions A/B):
#   flex 1, min-width 0, overflow-y auto
#   background: var(--surface-raised)   ← W8 upgrade from source var(--bg2)
#   display flex, align-items flex-start, justify-content center
#   padding: var(--modal-padding)       ← W8 upgrade from source 16
#   position relative
#
# Inner A4 container (source line 1227):
#   position relative; width 100%; max-width 595px
#
# A4 placeholder box (replaces /templates/leave_request_preview.png — we can't fetch real PNG in sketch):
#   width 100%; aspect-ratio 595/842; background #ffffff (raw hex — A4 white, dark/light-invariant);
#   border-radius 4px; box-shadow 0 2px 8px rgba(0, 0, 0, 0.1);
#   inside: title "휴가신청서 양식 (preview placeholder)" + 8~10 회색 form field guide lines
#
# Text overlay marker (source line 1242 — fontSize 10 → 12 per W8 노안 룰):
#   position absolute; left {x}%; top {y}%;
#   transform translate(-50%, -50%);
#   font-size 12; font-weight 700; color #111 (raw hex — source verbatim);
#   white-space nowrap; font-family 'Noto Sans KR', sans-serif
#
# Checkbox marker (source line 1264 — verbatim):
#   position absolute; left {x}%; top {y}%;
#   transform translate(-50%, -50%);
#   width 12; height 12; background #000 (raw hex — source verbatim)
#
# Inactive marker (sketch-only visual — dashed outline for "사용자 입력 대기" state):
#   Text-box outline: 1.5px dashed #facc15 (raw yellow per UI-SPEC §14 OQ #4)
#                   + background rgba(250, 204, 21, 0.08)
#                   + label "lp[N]" inside (text-caption + leading-none)
#   Checkbox outline: 1.5px dashed var(--text-tertiary) — empty box, 12×12
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write 08-desktop-pdf-preview-sketch.html (4 viewport stack with lp[0..16] overlay)</name>
  <files>cha-bio-safety/docs/redesign-context/12-staff-service/sketch/08-desktop-pdf-preview-sketch.html</files>

  <action>
Create the single sketch HTML file at the path above. Mirror W7 chrome and tokenization exactly. Implementation outline:

**1. HTML head + chrome (mirror W7 lines 1~190 verbatim, adjusted title only):**
- `<meta name="viewport" content="width=1280" />`
- Title: "W8 — 12 staff-service desktop right panel PDF preview sketch"
- Same Pretendard CDN link.
- `:root` + `[data-theme="dark"]` block — verbatim from tokens.css (dark mode).
- `.light-frame` scoped block — verbatim from tokens.css (light mode).
- Spacing block (`--space-1` ~ `--space-8`, `--card-padding`, `--modal-padding` 등) — verbatim, including the `@media (min-width: 768px)` desktop override that sets `--modal-padding: 24px`.
- Radius block (`--radius-sm` 8, `--radius-md` 12, `--radius-lg` 16, `--radius-pill` 99).
- Page chrome `* { box-sizing: border-box; }`, body bg `#0f1419` (sketch wrapper raw — same as W7), padding 24, etc.

**2. Typography utilities (verbatim from typography.css):**
- `.text-caption { font-size: 12px; line-height: 1.5; font-weight: 400; }`
- `.text-body-sm { font-size: 14px; line-height: 1.6; font-weight: 400; }`
- `.text-body    { font-size: 16px; line-height: 1.7; font-weight: 400; }`
- `.text-title   { font-size: 18px; line-height: 1.4; font-weight: 500; }`
- Sketch may add a small `.text-marker { font-size: 12px; line-height: 1; font-weight: 700; }` rule for lp text markers — explicit per W8 노안 룰 (source 10 → 12).

**3. Viewport frame + right-panel container styles:**
- `.vp-frame` — width 500px (right-panel simulation), flex-shrink 0, border-radius `var(--radius-sm)`, overflow hidden, background `var(--surface-page)`, box-shadow `0 8px 24px rgba(0,0,0,0.3)`.
- `.vp-frame[data-theme="dark"]` border `1px solid #2a2f3a`.
- `.vp-frame.light-frame` border `1px solid #d0d7de`.
- `.right-panel` — flex 1, min-width 0, overflow-y auto, background `var(--surface-raised)`, display flex, align-items flex-start, justify-content center, padding `var(--modal-padding)`, position relative, min-height 720 (so the A4 has room).
- `.a4-wrap` — position relative, width 100%, max-width 595px.
- `.a4-box` — width 100%, aspect-ratio `595 / 842`, background `#ffffff` (raw hex inline or in class — required for grep gate "A4 흰 배경 ≥4"), border-radius 4, box-shadow `0 2px 8px rgba(0, 0, 0, 0.1)`, position relative, overflow hidden.
- `.a4-title` (inside placeholder) — text-caption + color `#555`, padding 16, font-weight 600.
- `.a4-guide-line` — height 1, background `#e5e7eb` (raw hex), margin-bottom 24 (8~10 lines stacked to mimic form rows).

**4. lp overlay marker styles:**
- `.lp-marker` base — position absolute, transform `translate(-50%, -50%)`, white-space nowrap, font-family `'Noto Sans KR', sans-serif`.
- `.lp-text-inactive` — outline `1.5px dashed #facc15` (raw yellow per UI-SPEC §14 OQ #4), background `rgba(250, 204, 21, 0.08)`, padding `2px 6px`, border-radius 3, font-size 12, font-weight 600, color `#111` (raw hex — source verbatim).
- `.lp-text-active` — font-size 12, font-weight 700, color `#111` (raw hex), no outline (real PDF text rendering).
- `.lp-check-inactive` — width 12, height 12, outline `1.5px dashed var(--text-tertiary)`, background transparent.
- `.lp-check-active` — width 12, height 12, background `#000` (raw hex — source line 1264 verbatim).

**5. Body markup — page heading + 4 viewport stack:**

```
<body>
  <header>
    <h1 class="text-title" style="font-weight: 700">W8 — desktop right panel: PDF preview + lp[0..16] overlay</h1>
    <p class="text-caption" style="color: #7d8a9c; max-width: 720px">
      4 viewport stack. 우측 패널만 확대 (W6 좌측/W7 중앙 sketch 참조).
      lp[0..16] 좌표 17개는 StaffServicePage.tsx line 159~177 verbatim — UI-SPEC §10 NEGATIVE scope.
    </p>
  </header>

  <div class="page-bg">
    <!-- VP1: 빈 상태 (다크) -->
    <section class="vp-row">
      <div class="vp-wrap">
        <div class="vp-frame" data-theme="dark">
          <div class="right-panel">
            <div class="a4-wrap">
              <div class="a4-box">
                <!-- a4-title + ~9 guide lines + 17 dashed lp markers with labels -->
              </div>
            </div>
          </div>
        </div>
        <p class="vp-caption">VP1 · 다크 · selCell 없음 — 17 lp 위치 인덱스 표시</p>
      </div>
    </section>

    <!-- VP2: 연차 채워짐 (다크) -->
    <section class="vp-row">
      <div class="vp-wrap">
        <div class="vp-frame" data-theme="dark">
          <div class="right-panel">
            <div class="a4-wrap">
              <div class="a4-box">
                <!-- a4-title + guide lines + active markers for lp[0,1,2,3,4,5,14,15] + checkbox at lp[6] -->
              </div>
            </div>
          </div>
        </div>
        <p class="vp-caption">VP2 · 다크 · 연차 시나리오 (윤종엽 26.05.18~26.05.20, 3일)</p>
      </div>
    </section>

    <!-- VP3: 기타특별 채워짐 (다크) -->
    <section class="vp-row">
      <div class="vp-wrap">
        <div class="vp-frame" data-theme="dark">
          <div class="right-panel">
            <div class="a4-wrap">
              <div class="a4-box">
                <!-- VP2 fields + checkbox at lp[12] + lp[13] 기타특별 종류 + lp[16] 사유 -->
              </div>
            </div>
          </div>
        </div>
        <p class="vp-caption">VP3 · 다크 · 기타특별 시나리오 (가족돌봄, 조부모 간병)</p>
      </div>
    </section>

    <!-- VP4: 라이트 (VP2 동일 데이터) -->
    <section class="vp-row">
      <div class="vp-wrap">
        <div class="vp-frame light-frame">
          <div class="right-panel">
            <div class="a4-wrap">
              <div class="a4-box">
                <!-- VP2 데이터 그대로 — A4 흰 배경 유지 verify point -->
              </div>
            </div>
          </div>
        </div>
        <p class="vp-caption">VP4 · 라이트 · VP2 동일 데이터 — A4 박스는 흰색 유지 (UI-SPEC §12 W8 검증)</p>
      </div>
    </section>
  </div>
</body>
```

**6. lp marker contents per viewport:**

VP1 — All 17 dashed-outline markers with label `lp[N]`:
- lp[0]~lp[5], lp[13], lp[14], lp[15], lp[16]: `.lp-text-inactive` with text `lp[0]` ~ `lp[16]`
- lp[6]~lp[12]: `.lp-check-inactive` (12×12 dashed empty box) — adjacent `<span class="lp-text-inactive">` slightly offset is OK or just position label below box; easiest = use the dashed-outline text variant for ALL 17 and let the checkbox-row labels read `lp[6]` 등. Both styles must be visible to confirm visual differentiation.
  - To avoid overlap, render BOTH for lp[6..12]: a small dashed empty checkbox at the exact x/y plus a label slightly below or to the right. Use inline `style="left: X%; top: (Y+1)%;"` for the label, so the dashed checkbox sits dead-center on the coordinate.

VP2 — active markers (per source line 1258~1268 with the locked sample data):
- `lp[0]` active text `22.05.10` (윤종엽 sid=2022051052 → hireDate 22.05.10)
- `lp[1]` active text `98.03.15` (생년월일 sample)
- `lp[2]` active text `윤종엽`
- `lp[3]` active text `26.05.18`
- `lp[4]` active text `26.05.20`
- `lp[5]` active text `3`
- `lp[6]` active checkbox (solid #000 12×12) — 연차 체크
- `lp[7]~lp[12]` NOT rendered (annual 시나리오)
- `lp[13]` NOT rendered (annual 시나리오)
- `lp[14]` active text `010-1234-5678`
- `lp[15]` active text `3`
- `lp[16]` NOT rendered (ANNUAL_TYPES 사유 미사용)

VP3 — 기타특별:
- `lp[0]` ~ `lp[5]`, `lp[14]`, `lp[15]` same as VP2
- `lp[6]~lp[11]` NOT rendered
- `lp[12]` active checkbox (solid #000 12×12)
- `lp[13]` active text `가족돌봄`
- `lp[16]` active text `조부모 간병 필요`

VP4 — same as VP2 but inside `.light-frame`. A4 box still `#ffffff`. All active text markers still `color: #111` (light/dark invariant — A4 인쇄 PDF 정합).

**7. Each lp marker — inline style for x/y verbatim:**

Example for lp[0] active text in VP2:
```
<span class="lp-marker lp-text-active" style="left: 80.34%; top: 27.79%">22.05.10</span>
```

Example for lp[0] inactive in VP1:
```
<span class="lp-marker lp-text-inactive" style="left: 80.34%; top: 27.79%">lp[0]</span>
```

Example for lp[6] active checkbox in VP2:
```
<div class="lp-marker lp-check-active" style="left: 23.44%; top: 44.20%"></div>
```

Example for lp[6] inactive in VP1 (box + label combo):
```
<div class="lp-marker lp-check-inactive" style="left: 23.44%; top: 44.20%"></div>
<span class="lp-marker lp-text-inactive" style="left: 23.44%; top: 46.50%">lp[6]</span>
```

(The label may be slightly offset on top for legibility but the dashed checkbox itself must sit at the verbatim y. The label offset is sketch-only; the active checkbox in VP2/VP3 uses verbatim y exactly.)

**8. NEGATIVE rule enforcement (self-check before save):**

Grep gates the executor must pass before finishing the task:
- `grep -v '^[[:space:]]*<!--' 08-desktop-pdf-preview-sketch.html | grep -Ec '[^0-9](9|10|11)px'` = 0 (no 9/10/11px font-size; the lp text marker is 12px per W8 노안 룰)
- No emoji codepoints (run `python3 -c "import sys, re; print(len(re.findall(r'[\U0001F300-\U0001FAFF\U00002600-\U000027BF]', open('...').read())))"` = 0)
- `grep -c 'status-fire\|text-fire\|bg-fire' file` = 0
- `grep -c '\-\-c-day\|\-\-c-night\|\-\-c-off\|\-\-bg2\|\-\-t1\|\-\-t2\|status-warning-fg\|surface-base' file` = 0 (no W3-era aliases)
- All 17 verbatim coordinates appear: `grep -c 'left: 80.34%\|left: 43.70%\|left: 38.99%\|left: 57.82%\|left: 69.75%\|left: 23.44%\|left: 40.75%\|left: 56.60%\|left: 77.32%\|left: 23.49%\|left: 76.47%\|left: 55.29%\|left: 62.86%\|left: 55.38%' file` ≥ 17 occurrences across viewports
- Labels `lp[0]` through `lp[16]` (17 distinct) appear at least once each in VP1
- A4 white bg (`#ffffff` or `#fff` inline in `.a4-box` or rule) appears ≥ 4 times (once per viewport)
- 4 `<section class="vp-row">` blocks present

**9. Notes:**
- Use Pretendard for body chrome but `'Noto Sans KR', sans-serif` for `.lp-marker` (source verbatim — PDF 정합 폰트).
- The A4 placeholder content (title text + guide lines) is purely decorative — focus is on lp positioning. Keep it minimal: 1 placeholder title + ~9 horizontal `<div class="a4-guide-line">` lines spaced via margin-bottom or absolute positioning. Do NOT mimic actual leave-request form text (that's the real PDF's job).
- The 4 viewports stack vertically (one per `<section class="vp-row">` with default flex-direction column on `.page-bg`). Each viewport is ~500px wide, ~720px tall (A4 ratio + padding).
- Do NOT touch any `src/` file, `functions/` file, or any sketch file outside `08-desktop-pdf-preview-sketch.html`. Single file write only.
  </action>

  <verify>
    <automated>test -f /Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/12-staff-service/sketch/08-desktop-pdf-preview-sketch.html && \
F=/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/12-staff-service/sketch/08-desktop-pdf-preview-sketch.html && \
echo "--- file exists OK ---" && \
echo "--- gate: no 9/10/11px (excluding HTML comments) ---" && \
test "$(grep -v '^[[:space:]]*<!--' "$F" | grep -Ec '[^0-9](9|10|11)px')" = "0" && \
echo "--- gate: no emoji ---" && \
test "$(python3 -c "import re,sys; print(len(re.findall(r'[\U0001F300-\U0001FAFF\U00002600-\U000027BF\U0001F600-\U0001F64F\U0001F680-\U0001F6FF]', open(sys.argv[1]).read())))" "$F")" = "0" && \
echo "--- gate: no fire tokens ---" && \
test "$(grep -c 'status-fire\|text-fire\|bg-fire' "$F")" = "0" && \
echo "--- gate: no W3-era aliases ---" && \
test "$(grep -c -- '--c-day\|--c-night\|--c-off\|--bg2\|--t1\|--t2\|surface-base' "$F")" = "0" && \
echo "--- gate: lp coordinates verbatim (17 x-values across viewports) ---" && \
grep -cE 'left: 80\.34%|left: 43\.70%|left: 38\.99%|left: 57\.82%|left: 69\.75%|left: 23\.44%|left: 40\.75%|left: 56\.60%|left: 77\.32%|left: 23\.49%|left: 76\.47%|left: 55\.29%|left: 62\.86%|left: 55\.38%' "$F" && \
echo "--- gate: lp[0]..lp[16] labels (each ≥1 in VP1) ---" && \
for i in 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16; do grep -q "lp\[$i\]" "$F" || { echo "MISSING lp[$i]"; exit 1; }; done && echo "all 17 labels found" && \
echo "--- gate: A4 white bg ≥4 ---" && \
test "$(grep -cE '#ffffff|#fff[^0-9a-fA-F]' "$F")" -ge "4" && \
echo "--- gate: 4 viewport sections ---" && \
test "$(grep -c '<section class="vp-row"' "$F")" = "4" && \
echo "--- gate: 1 light-frame viewport ---" && \
test "$(grep -c 'class="vp-frame light-frame"' "$F")" = "1" && \
echo "--- gate: source verbatim raw hex preserved ---" && \
grep -q "color: #111" "$F" && grep -q "background: #000\|background:#000" "$F" && \
echo "ALL VERIFY GATES PASS"</automated>
  </verify>

  <done>
- `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/08-desktop-pdf-preview-sketch.html` exists.
- Browser-renders as 4 stacked viewports (VP1 empty, VP2 annual, VP3 other_special, VP4 light annual).
- All 17 lp coordinates appear at verbatim x%/y% — no rounding or substitution.
- VP1 shows all 17 inactive markers with `lp[0]` through `lp[16]` labels.
- VP2/VP3 show source-faithful active markers + 12×12 solid #000 checkbox.
- VP4's A4 box renders white in light mode (panel surface changes, A4 box does not).
- All grep gates in the verify block pass.
  </done>
</task>

</tasks>

<verification>
After Task 1 completes, the executor must:

1. Run the verify-block grep gates and confirm all pass.
2. Open the file in a browser at width ≥1280 and visually confirm:
   - 4 distinct viewports stacked vertically with captions VP1/VP2/VP3/VP4.
   - Each viewport's A4 placeholder is white (even VP4 in light mode).
   - Markers fall inside the white A4 box (no overflow beyond placeholder bounds).
   - VP2 has exactly 1 solid checkbox (lp[6]); VP3 has exactly 1 solid checkbox (lp[12]).
   - All 17 dashed markers visible in VP1 with `lp[0]`...`lp[16]` labels.
3. Cross-check against W7 chrome — same body bg `#0f1419`, same `.vp-caption` styling, same Pretendard CDN link, same tokens.css `:root` block.

No `src/` or `functions/` changes. No other sketch files touched. No `wrangler` invocation.
</verification>

<success_criteria>
- Single file written: `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/08-desktop-pdf-preview-sketch.html`.
- HTML5 valid, opens in browser at 1280px viewport.
- All grep verification gates from the verify block pass with zero failures.
- 17 lp coordinates appear verbatim from `StaffServicePage.tsx` line 159~177.
- UI-SPEC §10 NEGATIVE scope (lp coordinates / `color: #111` / `background: #000` / `max-width: 595px`) preserved.
- UI-SPEC §12 W8 검증 포인트 (A4 흰 배경 다크/라이트 무관) demonstrated by VP2 vs VP4 contrast.
- tokens.css + typography.css verbatim copied; zero alias / zero W3-era token names.
- Zero emoji, zero 9/10/11px font-size, zero fire-status tokens.
</success_criteria>

<output>
After completion, create `.planning/quick/260518-mpc-12-staff-service-sketch-wave-8-desktop-r/260518-mpc-01-SUMMARY.md` summarizing:
- File created path
- Viewport count and theme split (3 dark + 1 light)
- lp coordinate count (17)
- Key grep gate results (pass/fail counts)
- Any deviations from locked decisions (should be none — flag if any)
</output>
