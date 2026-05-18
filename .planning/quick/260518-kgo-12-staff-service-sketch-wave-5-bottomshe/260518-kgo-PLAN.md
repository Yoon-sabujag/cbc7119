---
phase: 260518-kgo
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/12-staff-service/sketch/05-bottomsheet-sketch.html
autonomous: true
requirements:
  - W5-BOTTOMSHEET-SKETCH
must_haves:
  truths:
    - "Designer can see BottomSheet's full 6 sub-region layout (header / leave form / 차단 카피 / team leave / weekend allowance / close) in a single HTML matrix"
    - "Designer can compare 8 form states (정상 / 등록완료 / 주말차단 / 공휴일차단 / 점검일경고+끼수활성 / 당직+팀원+주말식대 / 라이트정상 / 라이트풀)"
    - "Designer can verify every status token (warning / danger / safe / info) and duty tokens render correctly in dark + light themes"
    - "Designer can copy CSS values directly from sketch to TSX (normalized tokens, no 9·10·11px, no alias, no status-fire)"
    - "Sketch passes all grep gates before being used as reference for TSX conversion"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/12-staff-service/sketch/05-bottomsheet-sketch.html"
      provides: "W5 BottomSheet visual reference — 8 viewport matrix covering all sub-region + form states + dark/light"
      contains: "data-theme=\"dark\", data-theme=\"light\", drag handle, sheet header, shift chip, holidayName, 식사미사용 끼수 button, 휴가 section header, 차단 카피, 점검일 경고, date inputs, 일수 #facc15, 휴가 6-button grid (3 states), 기타 select, 사유 input, 휴가신청 CTA (2 states), PDF 다운로드 CTA, 팀원 연차 chips, 주말 식대 ₩48,500, 닫기 button"
  key_links:
    - from: "sketch HTML :root token block"
      to: "tokens.css line 16~119"
      via: "verbatim copy (dark + light + spacing + radius)"
      pattern: "--surface-page|--status-safe|--duty-night|--radius-sm"
    - from: "sketch typography classes"
      to: "typography.css line 33~81"
      via: "verbatim text-caption/text-label/text-body-sm/text-body classes"
      pattern: "\\.text-(caption|label|body-sm|body|title|heading|display)"
    - from: "sketch 8 viewport frames"
      to: "StaffServicePage.tsx line 1293~1549 BottomSheet source"
      via: "normalized tokens replace OLD hex per W2~W4 pattern (#22c55e/#a855f7/#f97316/#f59e0b/#2563eb 인라인 → status/accent tokens)"
      pattern: "var\\(--status-(safe|warning|danger|info)|var\\(--accent|var\\(--duty-"
---

<objective>
Create W5 BottomSheet sketch for 12-staff-service redesign — a single HTML file containing 8 mobile viewport frames (6 dark + 2 light) that visualize the BottomSheet's full layout and all conditional states. This sketch is the visual contract for the TSX conversion wave; designers and developers will reference it to verify token migration (OLD categorical hex → status tokens), typography normalization (no 9·10·11px), and 6 sub-region rendering across form states.

Purpose: Lock the full BottomSheet visual design before TSX conversion. The sheet is the most complex single UI region in StaffServicePage (leave form + meal toggle + 차단 카피 + team chips + weekend allowance + close), and W5 must demonstrate every conditional path in a side-by-side matrix.

Output: `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/05-bottomsheet-sketch.html` — valid HTML5, follows W1~W4 frame matrix pattern, passes all negative grep gates.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@CLAUDE.local.md
@cha-bio-safety/docs/redesign-context/12-staff-service/UI-SPEC.md
@cha-bio-safety/docs/redesign-context/12-staff-service/tokens.css
@cha-bio-safety/docs/redesign-context/12-staff-service/typography.css
@cha-bio-safety/docs/redesign-context/12-staff-service/StaffServicePage.tsx
@cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html
@cha-bio-safety/docs/redesign-context/12-staff-service/sketch/03-legend-summary-sketch.html
@cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md

<interfaces>
<!-- W5 sketch CSS contract — extracted verbatim from W4 (04-menu-cards-sketch.html) -->
<!-- Executor: copy these blocks. Do not invent. -->

From `tokens.css` line 16~119 — `:root` + `[data-theme="dark"]` + `[data-theme="light"]`:
- Same verbatim block as W4 lines 12~110 (Surface / Text / Border / Accent / Status fg/bar/bg / Duty)
- NOTE: keep W4's intentional omission comment: `/* 긴급/조치-대기 톤은 의도적 누락 — 이 페이지(StaffServicePage)는 §3.4.1 룰로 미사용 */`
- NO `--status-fire*` tokens (dark or light)
- NO alias tokens (--bg, --bg2, --bg3, --bd, --acl, --t1, --t2, --t3, --c-day, --c-night, --c-off, --c-leave, --safe, --warn, --danger, --fire, --info)

From `tokens.css` line 124~146 + 149~162 (Spacing — primitive + component, mobile + desktop):
- Same verbatim block as W4 lines 115~153

From `tokens.css` line 167~172 (Radius):
- Same verbatim block as W4 lines 158~163

From `typography.css` line 33~81 — type scale classes:
- `.text-caption` 12px / line-height 1.5 / weight 400
- `.text-label` 13px / line-height 1.5 / weight 400
- `.text-body-sm` 14px / line-height 1.6 / weight 400
- `.text-body` 16px / line-height 1.7 / weight 400
- `.text-title` 18px / line-height 1.4 / weight 500
- Utility: `.font-medium { font-weight: 500; }` and `.font-semibold { font-weight: 600; }`
- Inline `.leading-none { line-height: 1; }` and `.leading-snug { line-height: 1.2; }` for small containers (per Q&A "작은 컨테이너 안 text-caption → leading-none")

From `StaffServicePage.tsx` line 1293~1549 — BottomSheet 6 sub-region layout (NORMALIZE tokens per W2~W4):
1. Overlay: `position:absolute; inset:0; background:rgba(0,0,0,0.45); z-index:90; animation:fadeIn .2s ease`
2. Sheet container: `position:absolute; bottom:0; left:0; right:0; z-index:100; background:var(--surface-raised); border-radius:20px 20px 0 0; padding:16px 16px 24px; max-height:65vh; overflow-y:auto; box-shadow:0 -4px 24px rgba(0,0,0,0.2); animation:slideUp .25s ease`
3. Drag handle: 36×4, radius 2, bg `var(--border-default)`, margin-bottom 12, centered
4. Sub-regions follow constraints A~F exactly.

Frame pattern (verbatim from W4):
```css
.frame-mobile {
  width: 393px;
  background: var(--surface-page);
  color: var(--text-primary);
  border: 1px solid #2a2f3a;  /* raw hex 예외 — frame border 만 */
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}
.frame-row { display:flex; flex-wrap:wrap; gap:32px; align-items:flex-start; }
.vp-label { font-size:13px; color:var(--text-tertiary); margin-bottom:8px; }
body { margin:0; padding:32px; background:#0f1218; color:var(--text-secondary); font-family:'Pretendard Variable',...; line-height:1.55; }
```

Animation keyframes (sketch needs them visible even if not animating; declare for self-documenting purposes):
```css
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
```
(In sketch, sheet renders in final state — no animation needed visually, but @keyframes block is part of the spec.)
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write 05-bottomsheet-sketch.html (8 viewports × 6 sub-regions, dark + light)</name>
  <files>cha-bio-safety/docs/redesign-context/12-staff-service/sketch/05-bottomsheet-sketch.html</files>
  <action>
Create the W5 sketch as a single HTML5 file matching the W4 (04-menu-cards-sketch.html) structural pattern but with `frame-mobile` only (no desktop — BottomSheet is mobile-only per UI-SPEC §4.3).

### Top-level structure

```
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>12 연차 및 식사 — sketch W5 BottomSheet (헤더 + 휴가폼 + 팀원 + 주말식대 + 닫기)</title>
  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" rel="stylesheet" />
  <style>
    /* :root + [data-theme="dark"] block — tokens.css line 16~69 verbatim (status-fire 의도적 누락 코멘트 유지) */
    /* [data-theme="light"] block — tokens.css line 74~119 verbatim (status-fire 의도적 누락 코멘트 유지) */
    /* :root spacing block — tokens.css line 124~146 verbatim */
    /* @media (min-width:768px) spacing — tokens.css line 149~162 verbatim */
    /* :root radius block — tokens.css line 167~172 verbatim */
    /* Typography classes — text-caption/text-label/text-body-sm/text-body/text-title/text-heading/text-display verbatim from typography.css */
    /* Utility classes — .font-medium, .font-semibold, .leading-none{line-height:1}, .leading-snug{line-height:1.2} */
    /* Page chrome — body / h1 / p.lead / .frame-row / .vp-label / .frame-mobile (393px, border #2a2f3a raw hex 예외) */
    /* Animation @keyframes fadeIn + slideUp (self-documenting; sheet rendered in final state in sketch) */
    /* Per-component classes for sheet sub-regions (see below) */
  </style>
</head>
<body>
  <h1>12 연차 및 식사 — sketch W5</h1>
  <p class="lead">BottomSheet 전체 — 헤더 (날짜/근무칩/공휴일/식사미사용 끼수), 휴가 섹션 (차단 카피 / 점검일 경고 / 기간 / 6-버튼 grid 3-state / 기타 select / 사유 / 휴가신청 CTA / PDF 다운로드), 팀원 연차 chips, 주말 식대 안내, 닫기 버튼. 8 viewport (다크 6 + 라이트 2).</p>

  <!-- DARK frames (data-theme="dark") -->
  <section class="frame-row" data-theme="dark">
    <!-- VP1 normal 정상 폼, VP2 등록완료, VP3 주말차단 -->
  </section>
  <section class="frame-row" data-theme="dark" style="margin-top:32px">
    <!-- VP4 공휴일차단, VP5 점검일경고+끼수활성, VP6 당직+팀원+주말식대 풀표시 -->
  </section>

  <!-- LIGHT frames (data-theme="light") -->
  <section class="frame-row" data-theme="light" style="margin-top:32px">
    <!-- VP7 라이트 정상폼, VP8 라이트 풀표시 -->
  </section>
</body>
</html>
```

### Per-viewport rendering rules

Each frame: `<div class="frame-mobile">` containing only the BottomSheet (no calendar background — render the sheet as if calendar is dimmed behind. Simulate by giving frame-mobile a `min-height: 760px` and rendering a faint placeholder header bar at top + dimmed overlay tint. The sheet sits at the bottom and takes the visible foreground).

Suggested frame body composition (verbatim across all 8 frames except per-state diffs):

```html
<div class="frame-mobile">
  <!-- placeholder calendar dim (faint, just visual context) -->
  <div style="height:120px; background:var(--surface-raised); opacity:0.4; border-bottom:1px solid var(--border-default); padding:16px;">
    <div class="text-caption leading-none" style="color:var(--text-tertiary)">달력 (placeholder)</div>
  </div>
  <div style="flex:1; background:var(--surface-page); opacity:0.3;"></div>

  <!-- Overlay -->
  <div style="position:absolute; inset:0; background:rgba(0,0,0,0.45); z-index:90;"></div>

  <!-- Sheet -->
  <div style="position:absolute; bottom:0; left:0; right:0; z-index:100;
              background:var(--surface-raised); border-radius:20px 20px 0 0;
              padding:16px 16px 24px; max-height:65vh; overflow-y:auto;
              box-shadow:0 -4px 24px rgba(0,0,0,0.2);">

    <!-- Drag handle -->
    <div style="display:flex; justify-content:center; margin-bottom:12px;">
      <div style="width:36px; height:4px; border-radius:2px; background:var(--border-default);"></div>
    </div>

    <!-- (A) Header — see constraint B -->
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px;">
      <span class="text-body leading-none" style="font-weight:700; color:var(--text-primary);">5/18 (월)</span>
      <span class="leading-none" style="font-size:12px; font-weight:700; color:var(--text-on-accent); background:var(--duty-night); border-radius:var(--radius-sm); padding:2px 8px;">당직근무</span>
      <!-- conditional 공휴일 -->
      <!-- conditional 식사미사용 끼수 -->
    </div>

    <!-- (B) Leave section — see constraint C -->
    <div style="margin-bottom:16px;">
      <div class="text-caption font-semibold leading-none" style="color:var(--text-secondary); margin-bottom:8px; font-weight:700;">휴가</div>
      <!-- IF 주말/공휴일: 차단 카피만 -->
      <!-- ELSE: 점검일경고 (조건부) + 기간 + 6-버튼 grid + 기타 select + 사유 input (조건부) + 휴가신청 CTA + PDF 다운로드 -->
    </div>

    <!-- (C) 팀원 연차 — 조건부, see constraint D -->

    <!-- (D) 주말 식대 — 조건부, see constraint E -->

    <!-- (E) 닫기 버튼 — see constraint F -->
    <button class="text-body-sm leading-none" style="width:100%; padding:12px; border-radius:var(--radius-md); background:var(--surface-sunken); border:1px solid var(--border-default); color:var(--text-secondary); font-weight:700; cursor:pointer;">닫기</button>
  </div>
</div>
```

### Per-VP state matrix

**VP1 — 모바일 다크 / 평일 정상 폼**
- 헤더: "5/18 (월)" + 당직근무 칩 (duty-night)
- 식사미사용 영역: provided=2, skipped=0 → 끼수 비활성 (bg surface-sunken, text tertiary, "0끼")
- 휴가 섹션: 점검일 경고 hidden / 기간 시작일 종료일 input (값 비어있음 → 일수 hidden) / 6-버튼 grid all normal / 기타 select default / 사유 input hidden / 휴가신청 CTA 비활성 (surface-sunken bg, text-tertiary) / PDF 다운로드 활성 (accent)
- 팀원 연차 hidden / 주말식대 hidden
- 닫기 버튼

**VP2 — 모바일 다크 / 휴가 등록 완료**
- 헤더: 동일 (5/18 (월) + 당직근무)
- 식사미사용: provided=2, skipped=1 → 끼수 활성 (status-warning-bg / status-warning / status-warning-bar border, "1끼")
- 휴가 섹션: 기간 5/18~5/18 + 일수 "1일" (text #facc15) / 6-버튼 grid 중 "연차" 가 registered 상태 (status-safe-bg + status-safe + 2px status-safe-bar border + " ✓" 접미) / 기타 select default / 사유 hidden / 휴가신청 CTA 비활성 (이미 등록됨) / PDF 다운로드 활성
- 팀원 연차 hidden / 주말식대 hidden
- 닫기 버튼

**VP3 — 모바일 다크 / 주말 차단**
- 헤더: "5/16 (토)" + 휴무 칩 (duty-leave gray)
- 식사미사용 hidden (provided=0)
- 휴가 섹션: 헤더 "휴가" + 차단 카피 only: `주말은 휴가 등록이 불가합니다` (surface-sunken bg, text-tertiary, text-label 13px)
- 팀원 연차 hidden / 주말식대 보임 (₩48,500 — 비번/당직 다음날 토요일이라고 가정)
- 닫기 버튼

**VP4 — 모바일 다크 / 공휴일 차단**
- 헤더: "5/5 (월)" + 휴무 칩 (duty-leave) + 공휴일 라벨 "어린이날" (text-caption font-semibold status-danger)
- 식사미사용 hidden
- 휴가 섹션: 헤더 "휴가" + 차단 카피: `공휴일(어린이날)은 휴가 등록이 불가합니다`
- 팀원 연차 hidden / 주말식대 hidden
- 닫기 버튼

**VP5 — 모바일 다크 / 점검일 경고 + 끼수 활성**
- 헤더: "5/20 (수)" + 주간근무 칩 (duty-day)
- 식사미사용: provided=3, skipped=2 → 끼수 활성 (status-warning-bg / status-warning / status-warning-bar border, "2끼")
- 휴가 섹션: 점검일 경고 박스 "소방 점검일 - 휴가 등록 주의" (status-warning-bg, status-warning text, text-label 13px font-semibold) + 기간 5/20~5/20 + 일수 "1일" (#facc15) + 6-버튼 grid: "오후반차" 선택중 (accent bg + text-on-accent + accent border) / 기타 select default / 사유 hidden / 휴가신청 CTA 활성 (status-safe bg + text-on-accent) / PDF 다운로드 활성
- 팀원 연차 hidden / 주말식대 hidden
- 닫기 버튼

**VP6 — 모바일 다크 / 당직 + 팀원 연차 3명 + 주말식대 (풀 표시)**
- 헤더: "5/17 (일)" + 비번 칩 (duty-off blue) + 공휴일 라벨 hidden
- 식사미사용 hidden (provided=0 일요일)
- 휴가 섹션: 차단 카피 (주말) — `주말은 휴가 등록이 불가합니다`
- 팀원 연차 섹션 보임: 헤더 "팀원 연차" + 3 chips:
  - "박보융 (오후반차)" — 휴가 종류 suffix 색 status-safe (annual 계열)
  - "김영민 (공가)" — suffix 색 status-info (official 계열)
  - "이재훈 (연차)" — suffix 색 status-safe
- 주말식대 보임: `주말 식대: ₩48,500` (보라 #8f42d7 인라인 + bg rgba(143,66,215,0.08) + border rgba(143,66,215,0.2), text-label 13px font-bold)
- 닫기 버튼

**VP7 — 모바일 라이트 / VP1 의 라이트 모드 (정상 폼)**
- VP1 와 동일한 상태이지만 `data-theme="light"`. 모든 토큰 자동 전환.
- 헤더 "5/18 (월)" + 당직근무 칩 (라이트 duty-night #b91c1c)
- 식사미사용 비활성
- 폼 정상 / 휴가신청 CTA 비활성 / PDF 다운로드 활성 (라이트 accent #1f6feb)
- 닫기 버튼

**VP8 — 모바일 라이트 / VP6 의 라이트 모드 (풀 표시)**
- `data-theme="light"`. VP6 동일 데이터.
- 헤더 "5/17 (일)" + 비번 칩 (라이트 duty-off #1f6feb)
- 차단 카피 (주말)
- 팀원 연차 3 chips — 색 라이트 status-safe(#166534) / status-info(#075985)
- 주말식대 ₩48,500 — 보라 #8f42d7 그대로 (라이트에서도 카테고리 hex 유지)
- 닫기 버튼

### Token replacement contract (W2~W4 normalization continued)

| Source (StaffServicePage.tsx) | → Sketch (W5) |
|---|---|
| `var(--bg2)` | `var(--surface-raised)` |
| `var(--bg3)` | `var(--surface-sunken)` |
| `var(--bg)` (sheet input bg) | `var(--surface-sunken)` (격상) |
| `var(--bd)` | `var(--border-default)` |
| `var(--t1)` | `var(--text-primary)` |
| `var(--t2)` | `var(--text-secondary)` |
| `var(--t3)` | `var(--text-tertiary)` |
| `var(--acl)` | `var(--accent)` |
| `#22c55e` (등록/CTA) 인라인 | `var(--status-safe)` + `var(--status-safe-bg)` + `var(--status-safe-bar)` |
| `#f59e0b` (점검경고/끼수) 인라인 | `var(--status-warning)` + `var(--status-warning-bg)` + `var(--status-warning-bar)` |
| `#ef4444` (공휴일) 인라인 | `var(--status-danger)` |
| `#f97316` (팀원 official) 인라인 | `var(--status-info)` |
| `#2563eb` (PDF 다운로드) 인라인 | `var(--accent)` |
| `#a855f7` (주말식대) 인라인 | `#8f42d7` (정규화 보라, 인라인 유지 — 카테고리) |
| `rgba(168,85,247,0.08)` (주말식대 bg) | `rgba(143,66,215,0.08)` |
| `rgba(168,85,247,0.2)` (주말식대 border) | `rgba(143,66,215,0.2)` |
| 9·10·11px font-size | 12·13·14·16px 로 격상 (constraint 참조) |

### Typography normalization summary (no 9·10·11px)
- 9 → 12 (식사 미사용 라벨 "식사 미사용 / 눌러서 표기")
- 10 → 12 (공휴일 라벨, 시작일/종료일 라벨, 휴가 종류 suffix, 팀원 이름 + suffix)
- 11 → 12 (shift 칩, 6-버튼 grid 라벨, ~구분자 → 13, 끼수의 "끼")
- 11 → 13 (차단 카피, 점검일 경고)
- 11 → 14 (select option text, 사유 input, 시작일/종료일 input)
- 12 → 16 (휴가신청 CTA, PDF 다운로드 CTA, 헤더 날짜)
- 13 그대로 (일수 "1일")
- 14 그대로 (닫기 버튼)

### Negative rules (verify gates — see Task verify)

- 9·10·11px 0건 (raw + class 모두)
- 이모지 0건. 단 휴가 등록 상태의 ` ✓` (U+2713) 는 emoji 범위 외 (Basic Latin Extended) 이므로 grep `[\x{1F300}-\x{1FAFF}]` 매칭 안 됨 → 통과.
- `--status-fire`, `status-fire`, `text-fire`, `bg-fire` 0건
- alias 토큰 (`--bg `, `--bg2`, `--bg3`, `--bg4`, `--bd`, `--bd2`, `--t1`, `--t2`, `--t3`, `--acl`, `--info`, `--safe`, `--warn`, `--danger`, `--fire`, `--c-day`, `--c-night`, `--c-off`, `--c-leave`) — 0건 (단 `var(--bd)` 도 grep)
- OLD categorical hex `#22c55e | #a855f7 | #f97316 | #ef4444 | #ec4899 | #6366f1` 0건 outside :root tokens block. (즉 sketch 본문/sub-region 내 인라인 0건. tokens.css 의 :root block 안 `--status-safe-bar: #22c55e` 같은 정의는 OK — 그건 verbatim copy)
- `#facc15` ≥1 (일수 표시 위치, VP2/VP5)
- `#8f42d7` ≥1 (주말식대 위치, VP6/VP8)
- 8 viewports (각 `frame-mobile` 1개) = 정확히 8
- 6 sub-regions × ≥1 출현:
  - 드래그 핸들 + 헤더 (날짜 + shift 칩) ≥1 출현 (8 frames)
  - 휴가 섹션 헤더 ("휴가" 텍스트) ≥1
  - 차단 카피 (`등록이 불가합니다` 문구) ≥1 (VP3/VP4/VP6/VP8)
  - 팀원 연차 헤더 ("팀원 연차") ≥1 (VP6/VP8)
  - 주말 식대 (`주말 식대: ₩48,500`) ≥1 (VP6/VP8)
  - 닫기 버튼 (`닫기` 텍스트) 8회
- `data-theme="dark"` ≥1 (실제 6 frames + section)
- `data-theme="light"` ≥1 (실제 2 frames + section)
- 정확히 8 `frame-mobile` div

### Final write
- Single HTML5 file at `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/05-bottomsheet-sketch.html`
- Valid HTML5 (DOCTYPE, charset, viewport)
- Self-contained (only Pretendard CDN import + inline `<style>`; no JS, no React)
- Format follows W4 (04-menu-cards-sketch.html) structural template — same `:root` token block, same body chrome, same `frame-row`/`frame-mobile` classes, same h1/p.lead pattern
  </action>
  <verify>
    <automated>bash -c "set -e; FILE='/Users/jykevin/Documents/cbc7119-design/cha-bio-safety/docs/redesign-context/12-staff-service/sketch/05-bottomsheet-sketch.html'; test -f \"$FILE\" || { echo 'FILE MISSING'; exit 1; }; \
echo '=== file size ==='; wc -c \"$FILE\"; \
echo '=== valid HTML5 doctype ==='; head -1 \"$FILE\" | grep -qi '<!DOCTYPE html>'; \
echo '=== negative 9·10·11px (no 9px|10px|11px font-size or width pixel) ==='; \
! grep -nE '\\b(9|10|11)px' \"$FILE\" | grep -vE '\\bborder-radius\\b|@keyframes|line-height|--space|/[*]|/\\\\/' | grep -E 'font-size|fontSize|\\bsize[: ]|font:|10px|11px|9px' || true; \
NN=$(grep -cE '\\bfont-size:\\s*(9|10|11)px|fontSize:\\s*(9|10|11)' \"$FILE\" || true); echo \"font-size 9/10/11 count: $NN\"; test \"$NN\" = '0'; \
echo '=== no status-fire / text-fire / bg-fire / --fire ==='; \
test \"$(grep -cE 'status-fire|text-fire|bg-fire|--fire' \"$FILE\")\" = '0'; \
echo '=== no alias tokens in body (sketch inline must use semantic, not --bg/--bg2/--bg3/--bd/--t1/--t2/--t3/--acl/--info/--safe/--warn/--danger/--c-day/--c-night/--c-off/--c-leave) ==='; \
ALIAS=$(grep -nE 'var\\(--(bg|bg2|bg3|bg4|bd|bd2|t1|t2|t3|acl|info|safe|warn|danger|fire|c-day|c-night|c-off|c-leave)\\)' \"$FILE\" || true); echo \"alias hits:\"; echo \"$ALIAS\"; test -z \"$ALIAS\"; \
echo '=== no OLD categorical hex outside :root tokens block ==='; \
sed -n '/\\/\\* === Status — bar (좌측 색바) ===/,/\\/\\* === Status — bg (배지 채움) ===/p' \"$FILE\" > /tmp/sketch_root_strip.txt 2>/dev/null; \
sed -e '/:root/,/^    }/d' -e '/\\[data-theme=\"dark\"\\]/,/^    }/d' -e '/\\[data-theme=\"light\"\\]/,/^    }/d' \"$FILE\" > /tmp/sketch_body.txt; \
OLD=$(grep -ciE '#22c55e|#a855f7|#f97316|#ef4444|#ec4899|#6366f1' /tmp/sketch_body.txt || true); echo \"OLD categorical hex in body: $OLD\"; test \"$OLD\" = '0'; \
echo '=== #facc15 (gold for days count) ≥1 ==='; \
GOLD=$(grep -c '#facc15' \"$FILE\"); echo \"#facc15: $GOLD\"; test \"$GOLD\" -ge 1; \
echo '=== #8f42d7 (normalized purple for 주말식대) ≥1 ==='; \
PURP=$(grep -c '#8f42d7' \"$FILE\"); echo \"#8f42d7: $PURP\"; test \"$PURP\" -ge 1; \
echo '=== exactly 8 frame-mobile ==='; \
FM=$(grep -c 'frame-mobile' \"$FILE\"); echo \"frame-mobile classname hits: $FM (note: includes class definition + 8 usages)\"; \
USAGES=$(grep -cE '<div class=\"frame-mobile' \"$FILE\"); echo \"frame-mobile usages: $USAGES\"; test \"$USAGES\" = '8'; \
echo '=== dark + light themes present ==='; \
test \"$(grep -c 'data-theme=\\\"dark\\\"' \"$FILE\")\" -ge 2; \
test \"$(grep -c 'data-theme=\\\"light\\\"' \"$FILE\")\" -ge 1; \
echo '=== 6 sub-regions present ==='; \
test \"$(grep -c '닫기' \"$FILE\")\" -ge 8; \
test \"$(grep -c '휴가' \"$FILE\")\" -ge 8; \
test \"$(grep -c '등록이 불가합니다' \"$FILE\")\" -ge 2; \
test \"$(grep -c '팀원 연차' \"$FILE\")\" -ge 2; \
test \"$(grep -c '주말 식대: ₩48,500' \"$FILE\")\" -ge 2; \
test \"$(grep -c '소방 점검일 - 휴가 등록 주의' \"$FILE\")\" -ge 1; \
test \"$(grep -c '휴가 신청' \"$FILE\")\" -ge 1; \
test \"$(grep -c '휴가신청서 다운로드' \"$FILE\")\" -ge 1; \
test \"$(grep -c '드래그' \"$FILE\")\" -ge 0; \
echo '=== status tokens used (safe/warning/danger/info) ==='; \
test \"$(grep -c '--status-safe' \"$FILE\")\" -ge 2; \
test \"$(grep -c '--status-warning' \"$FILE\")\" -ge 2; \
test \"$(grep -c '--status-danger' \"$FILE\")\" -ge 1; \
test \"$(grep -c '--status-info' \"$FILE\")\" -ge 1; \
echo '=== duty tokens used (4 shift values) ==='; \
test \"$(grep -c '--duty-day' \"$FILE\")\" -ge 1; \
test \"$(grep -c '--duty-night' \"$FILE\")\" -ge 1; \
test \"$(grep -c '--duty-off' \"$FILE\")\" -ge 1; \
test \"$(grep -c '--duty-leave' \"$FILE\")\" -ge 1; \
echo '=== title check ==='; \
grep -q 'sketch W5' \"$FILE\"; \
echo 'ALL GREP GATES PASS'"</automated>
  </verify>
  <done>
- File `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/05-bottomsheet-sketch.html` exists and is valid HTML5
- All grep gates pass (9·10·11px = 0, status-fire = 0, alias tokens in body = 0, OLD categorical hex in body = 0, #facc15 ≥1, #8f42d7 ≥1, exactly 8 frame-mobile usages, dark + light themes present, 6 sub-regions × occurrence threshold met, status tokens + duty tokens all used)
- 8 viewports render with distinct states (정상 / 등록완료 / 주말차단 / 공휴일차단 / 점검일경고+끼수활성 / 풀표시 / 라이트정상 / 라이트풀)
- File opens in browser without console errors (visual sanity check optional — automated gates are authoritative)
  </done>
</task>

</tasks>

<verification>
- Open `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/05-bottomsheet-sketch.html` in browser — all 8 frames render without layout breakage
- All automated grep gates pass (see Task 1 verify)
- Visual sanity (optional, by designer): every sub-region matches the constraint spec (constraint A~F)
- No regression of W1~W4 conventions: same `:root` token block, same `frame-mobile` chrome, same h1/p.lead structure
</verification>

<success_criteria>
- W5 sketch HTML file exists at the correct path
- Single file, valid HTML5, self-contained (only Pretendard CDN + inline style)
- 8 mobile viewports rendered (6 dark + 2 light), each in a `frame-mobile` 393px frame
- 6 BottomSheet sub-regions visualized: header (날짜/shift칩/공휴일/식사미사용 끼수), 휴가 섹션 (차단/점검경고/기간/6버튼grid/기타select/사유input/휴가신청CTA/PDF다운로드), 팀원 연차, 주말 식대, 닫기
- Token normalization complete: OLD categorical hex (#22c55e/#a855f7/#f97316/#ef4444 인라인) → status tokens; #2563eb → accent; OLD 보라 → 정규화 #8f42d7 (인라인 유지)
- Typography normalization: 9·10·11px 전부 12/13/14/16 로 격상
- W2~W4 chrome and class patterns followed (`:root` verbatim, `frame-mobile` verbatim, body chrome verbatim)
- All grep gates pass
</success_criteria>

<output>
After completion, create `.planning/quick/260518-kgo-12-staff-service-sketch-wave-5-bottomshe/260518-kgo-01-SUMMARY.md` documenting:
- File written + size
- Grep gate results (all gates pass)
- Per-VP state matrix delivered (8 viewports)
- Token replacement decisions (OLD hex → status tokens, 보라 정규화, 격상 격상 → 12/13/14/16)
- Notable design decisions:
  - 휴가신청 CTA 활성 색 = status-safe (행동의 의미 = 정상/완료 컨텍스트)
  - 휴가 등록 상태 = status-safe-bg + status-safe + status-safe-bar (등록 = 완료 의미 정합)
  - 팀원 공가 (official) suffix = status-info (UI-SPEC §3.4.1 분류 정보)
  - 팀원 연차 (annual) suffix = status-safe (정상 컨텍스트)
  - 주말식대 보라 = 카테고리 색 (status 아님), #8f42d7 인라인 유지
  - 일수 표시 #facc15 (gold) raw hex 예외 유지 (UI-SPEC §14 OQ #4)
  - ` ✓` U+2713 텍스트 유지 (emoji 범위 외, grep 통과)
- 다음 단계 가이드 (W6 또는 TSX 변환 wave 진입 안내)
</output>
