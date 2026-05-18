---
phase: 260518-nvj-12-staff-service-sketch-wave-10-tsx-conv
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md
autonomous: true
requirements:
  - W10-checklist
must_haves:
  truths:
    - "Markdown checklist file 1개가 sketch/ 디렉토리 안에 존재 (10-tsx-conversion-checklist.md)"
    - "TSX 변환 wave executor 가 본 checklist + sketch 9개 + UI-SPEC + tokens/typography.css 만으로 atomic 변환 가능"
    - "NEGATIVE scope 10 items, region mapping 9개, verify gate 20+ 가 모두 명시되어 grep 으로 재현 가능"
    - "이 checklist 자체에 이모지 0건 (이모지 negative gate 자체 적용)"
    - "옛 alias → v0.1.1 토큰 매핑 cheatsheet 표 포함 (variable → Tailwind class 1:1)"
    - "인라인 style 예외 화이트리스트 명시 (PDF 좌표/카테고리 hex/gradient/animation/boxShadow)"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md"
      provides: "TSX conversion wave verify gate checklist"
      min_lines: 250
      contains: "Region-by-Region 변환 매핑"
  key_links:
    - from: "sketch/10-tsx-conversion-checklist.md"
      to: "src/pages/StaffServicePage.tsx"
      via: "grep verify gate 명령"
      pattern: "grep -nE"
    - from: "sketch/10-tsx-conversion-checklist.md"
      to: "UI-SPEC.md §10 NEGATIVE scope"
      via: "verbatim 인용"
      pattern: "NEGATIVE scope"
---

<objective>
W10 — TSX 변환 wave 가 따라야 할 verify gate + region mapping + NEGATIVE scope 를 박제한 단일 markdown checklist 파일 작성.

본 W10 은 sketch 가 아니라 **markdown checklist** (UI-SPEC §12 W10 row verbatim: `(sketch 아님) TSX 변환 wave 의 grep verify gate 목록`). W1~W9 sketch + UI-SPEC.md 의 모든 결정사항을 TSX executor 가 1-pass 로 적용 가능하도록 응축.

Purpose:
- TSX 변환 wave (별도 quick task) 의 source-of-truth checklist 역할
- 인라인 style 0건 / 옛 var() 0건 / 이모지 0건 / lg:px-* 0건 grep gate 박제
- 옛 alias → v0.1.1 토큰 1:1 매핑 cheatsheet 제공
- 9 region (app-chrome, calendar, legend, summary-cards, menu-cards, bottomsheet, desktop-3panel, desktop-form, desktop-pdf-preview) 별 source line → sketch reference → Tailwind class 변환 매핑

Output: `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md` (markdown, ≥250 줄, frontmatter 포함).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@cha-bio-safety/docs/redesign-context/12-staff-service/UI-SPEC.md
@cha-bio-safety/docs/redesign-context/12-staff-service/tokens.css
@cha-bio-safety/docs/redesign-context/12-staff-service/typography.css
@cha-bio-safety/docs/redesign-context/12-staff-service/StaffServicePage.tsx
@cha-bio-safety/docs/redesign-context/12-staff-service/sketch/01-mobile-shell-sketch.html
@cha-bio-safety/docs/redesign-context/12-staff-service/sketch/02-calendar-grid-sketch.html
@cha-bio-safety/docs/redesign-context/12-staff-service/sketch/03-legend-summary-sketch.html
@cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html
@cha-bio-safety/docs/redesign-context/12-staff-service/sketch/05-bottomsheet-sketch.html
@cha-bio-safety/docs/redesign-context/12-staff-service/sketch/06-desktop-3panel-sketch.html
@cha-bio-safety/docs/redesign-context/12-staff-service/sketch/07-desktop-form-sketch.html
@cha-bio-safety/docs/redesign-context/12-staff-service/sketch/08-desktop-pdf-preview-sketch.html
@cha-bio-safety/docs/redesign-context/12-staff-service/sketch/09-states-sketch.html
@CLAUDE.md
@CLAUDE.local.md

<interfaces>
<!-- W10 markdown checklist 의 의무 sections (frontmatter 후 본문 §1 ~ §12) -->
<!-- 모든 section 은 변환 wave executor 가 grep / copy-paste 으로 재현 가능해야 함 -->

§1. 목적 + Scope
§2. NEGATIVE scope (변경 금지) — UI-SPEC §10 verbatim 10 items
§3. Region-by-Region 변환 매핑 (sketch → TSX) — 9 region
§4. Verify gates (grep 명령 verbatim ≥20)
§5. Tailwind class 매핑 cheatsheet (옛 alias → v0.1.1)
§6. Region-별 hand-off (sub-task 분할 권장)
§7. 비-trivial 변환 케이스 (동적 분기, gradient, animation, boxShadow)
§8. Sub-task 별 verify checkpoint
§9. 비즈니스 로직 보존 verify (React Query keys, useMutation, toast 카피 등)
§10. 인라인 style 예외 화이트리스트 (PDF 좌표 lp[0..16], 카테고리 hex 동적, gradient 등)
§11. 변환 후 사용자 검수 흐름
§12. Open questions (변환 wave 시작 전 결정 필요)

<!-- key 토큰 매핑 reference (tokens.css verbatim) -->
v0.1.1 Tailwind class 패턴 (memory: feedback_tailwind_token_class_pattern):
  - bg-surface-{page|raised|sunken|active|overlay}
  - text-text-{primary|secondary|tertiary|disabled|on-accent|link}
  - border-border-{default|strong|focus}
  - bg-accent / text-accent / border-accent (+ -hover / -active)
  - text-status-{safe|warning|danger|info|fire}
  - bg-status-{safe|warning|danger|info|fire}-bar (or -bg)
  - bg-duty-{day|night|off|leave}
  - rounded-{sm|md|lg|pill}
  - text-{caption|label|body-sm|body|title|heading|display}
  - lucide-react: <Icon size={N} /> (className w-N h-N 금지)
  - w-7 h-7 = 32px (백버튼 표준), w-8 h-8 = 48px (함정: memory)

옛 alias (TSX 안에 0건 요구):
  var(--bg|--bg2|--bg3|--bd|--bd2|--t1|--t2|--t3|--acl|--c-day|--c-night|--c-off|--c-leave)
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: W10 TSX conversion checklist markdown 작성</name>
  <files>cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md</files>
  <action>
**파일 생성** (Write tool — heredoc 금지):
경로: `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md`

**Frontmatter (YAML):**
```
---
title: "12-staff-service — W10 TSX 변환 verify checklist"
status: draft
created: 2026-05-18
source_tsx: cha-bio-safety/src/pages/StaffServicePage.tsx
source_lines: 1552
sketches_referenced: [W1, W2, W3, W4, W5, W6, W7, W8, W9]
verify_gate_count: 20+
---
```

**본문 구조 — 12 sections (≥250 줄):**

---

**§1. 목적 + Scope**

- W10 은 sketch 아님. TSX 변환 wave executor 가 1-pass 로 적용할 verify gate + region mapping 박제 markdown
- 변환 대상: `cha-bio-safety/src/pages/StaffServicePage.tsx` (현재 1552 lines)
- 변환 후 예상: 약 1200~1400 lines (옛 인라인 style 약 60건 제거 + Tailwind class 치환)
- 변환 wave executor 는 본 파일 + sketch HTML 9개 + UI-SPEC.md + tokens.css + typography.css 만 input 으로 읽고 atomic 변환
- 본 checklist 자체 룰: 이모지 0건, ≥250 lines (comprehensive), 모든 9 region 명시, grep 명령 verbatim ≥20

---

**§2. NEGATIVE scope (변경 금지) — UI-SPEC §10 verbatim 10 items**

표 형식 (각 항목: 영역 / source / 변경 금지 사유):

| 항목 | Source / 좌표 | 사유 |
|---|---|---|
| PDF 좌표 lp[0..16] | `src/utils/generateLeaveRequest.ts` 1:1 / `StaffServicePage.tsx` line 159~177 | 회사 양식 정합 |
| `calcLeaveQuota(staffId)` | `StaffServicePage.tsx` line 25~37 | 입사일 기반 quota 룰 |
| `HIRE_DATES` 4명 | line 18~23 | 데이터 그대로 |
| `calcProvidedMeals` / `calcWeekendAllowance` | `src/utils/mealCalc.ts` import | 식대 5500원/끼 + 공휴일직후토요일 보정 (memory: project_meal_calc_rules) |
| `HOLIDAYS_FALLBACK` | `src/utils/holidays.ts` import | 한국 공휴일 라이브러리 누락 보강 (memory: feedback_korean_holidays_library_gap) |
| `isBlocked(ymd)` 차단 룰 | (line locate via grep) | 팀원연차/소방점검/승강기검사 차단 |
| React Query keys | `['leaves' / 'leaves-year' / 'meals' / 'schedule' / 'holidays' / 'menu']` | 6 키 / staleTime / enabled 보존 |
| useMutation flows | `leaveApi.create/delete` / `mealApi.upsert` / `menuApi.create` | mutation 흐름 그대로 |
| 모바일/데스크톱 분기 | `useIsDesktop()` 훅 호출 | UX 자체 변경 금지 |
| PDF 식단표 분석 | `handleMenuUpload` 안 pdfjsLib 호출 | 알고리즘 그대로 |

추가 보존 항목 (UI-SPEC §10.1 verbatim):
- 오버레이 span 의 `font-size: 10` + `color: #111` + `font-family: 'Noto Sans KR'` 인라인
- 체크박스 사각형 `width: 12, height: 12, background: #000`
- A4 미리보기 `max-width: 595px`
- `/templates/leave_request_preview.png` 경로
- `getCellInfo` 우하단 텍스트 포맷 (`{성+휴가코드} {소검} {승검}`)

---

**§3. Region-by-Region 변환 매핑 (sketch → TSX)**

9 region 표 (각 region: source line / sketch ref / 변환 핵심 / 노안 룰 / state variants).

| Region key | Source line | Sketch ref | 변환 핵심 |
|---|---|---|---|
| `region.app-chrome` | 외곽 div (line locate via grep) | W1 + W6 | GlobalHeader 54px 자리 + BottomNav 모바일만. 인라인 padding → `p-4` (mobile) / `p-6` (desktop). bg → `bg-surface-page` |
| `region.calendar` | line 681~798 (calendarGrid JSX) | W2 + W6 | 7×6 grid. aspect-ratio: `aspect-square` (mobile) / `aspect-[1.2]` (desktop). duty color → `bg-duty-{night,off,day,leave}`. 셀 안 텍스트 → `text-caption leading-none`. 휴가 카테고리 hex (LEAVE_BG) 는 동적 → `style` 잔존 OK (§10) |
| `region.legend` | line 800~824 | W3 | 11 dots 가로. `dot pattern` (3px 색 동그라미, §8.3). text → `text-label leading-none` |
| `region.summary-cards` | line 826~840 | W3 | 4종 Stat Card (§6.3 위험 임계치 색 분기). 좌측 3px 색바 → `border-l-[3px] border-status-{safe,warning,danger,info}-bar`. 큰 숫자 → `text-display`. 라벨 → `text-label text-text-secondary` |
| `region.menu-cards` | line 842~1018 | W4 | 식단 3종 (중식 A/B/석식). 카테고리 hex (#42d778, #d78042 등) → `style` 인라인 OR Tailwind config 추가 후 class. PDF 업로드 dropzone → `region.menu-upload` 분리, 데스크톱 `py-12` / 모바일 `py-3` (§2.3 예외) |
| `region.bottomsheet` | line 1293~1549 | W5 | overlay → `bg-surface-overlay`. container max-h-[65vh] (예외). drag-handle 36×4. 헤더+휴가폼+팀원+주말식대+닫기. 입력 height `h-11` (mobile 44) / `h-10` (desktop 40 — `useIsDesktop`) |
| `region.desktop-3panel-skeleton` | line 1020~1276 | W6 | flex layout: 좌(달력+범례+요약+식단+업로드) / 중(280px 폼) / 우(595px PDF). border-r between. lg:* 는 layout 분기만 허용 |
| `region.desktop-center-form` | line 1041~1223 | W7 | 휴가신청서 폼 (DOC_LEAVE_GRID 7행). input height 40 (token 자동 분기). 액션 3종 버튼 (휴가 신청 / PDF 다운로드 / 인쇄). 비활성 = `disabled:opacity-50` |
| `region.desktop-pdf-preview` | line 1225~1273 | W8 | A4 max-w-[595px]. lp[0..16] overlay 17 instance — `style={{ left: %, top: % }}` 잔존 OK (§10) |

추가 명시: detailPanel dead code (UI-SPEC §14 OQ #2) — 변환 wave 에서 grep 으로 사용처 확인 후 제거 또는 보존 결정.

---

**§4. Verify gates — grep 명령 verbatim**

TSX 변환 wave executor 가 변환 완료 시점에 실행할 grep. 모든 명령 `cha-bio-safety/` 디렉토리 기준.

**Negative gates (각 명령 → 0 hits 요구):**

```bash
# 1. 인라인 style 0건 (예외 §10 화이트리스트 외)
grep -nE 'style=\{\{' cha-bio-safety/src/pages/StaffServicePage.tsx

# 2. 옛 alias 토큰 0건
grep -nE 'var\(--(bg|bg2|bg3|bd|bd2|t1|t2|t3|acl|c-day|c-night|c-off|c-leave)\)' cha-bio-safety/src/pages/StaffServicePage.tsx

# 3. 이모지 0건 (✓ U+2713 plain ASCII 는 검출 안 됨 — OK)
grep -nP '[\x{1F300}-\x{1FAFF}]|[\x{2600}-\x{27BF}]' cha-bio-safety/src/pages/StaffServicePage.tsx

# 4. lg:* spacing 분기 0건 (layout 분기만 허용, spacing 은 token auto-branch)
grep -nE 'lg:(px|py|p|gap|space|m|mx|my)-' cha-bio-safety/src/pages/StaffServicePage.tsx

# 5. 인라인 fontSize 0건
grep -nE 'fontSize:\s*[0-9]+' cha-bio-safety/src/pages/StaffServicePage.tsx

# 6. 9·10·11px hard-coded 0건 (단 PDF overlay font-size: 10 예외 — line ref 명시)
grep -vE '^\s*//' cha-bio-safety/src/pages/StaffServicePage.tsx | grep -nE '\b(9|10|11)px\b'

# 7. status- prefix 잘못된 패턴 0건 (text-fire-bar O / text-status-fire-bar X)
grep -nE 'text-status-fire|bg-status-fire(?!-)' cha-bio-safety/src/pages/StaffServicePage.tsx

# 8. lucide w-N h-N class 0건 (size prop 만 허용)
grep -nE '<(Calendar|ChevronLeft|ChevronRight|Check|X|Upload|Plus|Minus|Trash|FileText|Printer|Loader)[^>]*className="[^"]*w-\d' cha-bio-safety/src/pages/StaffServicePage.tsx

# 9. 옛 hex 인라인 0건 (단 PDF 좌표 / 동적 카테고리 hex 예외 — §10 화이트리스트)
grep -nE '#(22c55e|a855f7|f97316|ef4444|ec4899|6366f1|f59e0b|2563eb|3b82f6)' cha-bio-safety/src/pages/StaffServicePage.tsx
```

**Positive gates (각 명령 → ≥1 hit 요구):**

```bash
# 10. surface 토큰 사용
grep -nE 'bg-surface-(page|raised|sunken|active|overlay)' cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: ≥10 hits

# 11. text 토큰 사용
grep -nE 'text-text-(primary|secondary|tertiary|disabled|on-accent|link)' cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: ≥15 hits

# 12. border 토큰 사용
grep -nE 'border-border-(default|strong)' cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: ≥5 hits

# 13. status 색 사용
grep -nE 'text-status-(safe|warning|danger|info)|bg-status-(safe|warning|danger|info)' cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: ≥4 hits

# 14. duty 색 4종 모두 사용 (shift 칩)
grep -nE 'bg-duty-(night|off|day|leave)' cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: ≥4 hits (4 token 각 ≥1)

# 15. typography scale 사용
grep -nE 'text-(caption|label|body-sm|body|title|heading|display)' cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: ≥15 hits

# 16. leading-none 룰 적용 (작은 컨테이너 안 text-caption — memory: feedback_text_caption_leading_none)
grep -nE 'leading-(none|relaxed|snug|tight)' cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: ≥5 hits

# 17. lucide-react import
grep -nE "from 'lucide-react'" cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: ≥1 hits

# 18. rounded 4단 정규화
grep -nE 'rounded-(sm|md|lg|full)' cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: ≥5 hits

# 19. radius-pill (캡슐) 사용처 확인
grep -nE 'rounded-full|rounded-\[99' cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: ≥1 hits (칩/배지)

# 20. animate-* class (W9 state animation)
grep -nE 'animate-(spin|pulse|fade)' cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: ≥1 hits (spinner / loading)
```

**Build gates:**

```bash
# 21. TypeScript check
cd cha-bio-safety && npx tsc --noEmit
# 기대: exit 0

# 22. Vite build
cd cha-bio-safety && npm run build
# 기대: exit 0
```

---

**§5. Tailwind class 매핑 cheatsheet**

옛 var() / 옛 hex → v0.1.1 Tailwind class 1:1 매핑.

| 옛 토큰 / 옛 hex | v0.1.1 Tailwind class | 비고 |
|---|---|---|
| `var(--bg)` | `bg-surface-page` | 페이지 배경 |
| `var(--bg2)` | `bg-surface-raised` | 카드 |
| `var(--bg3)` | `bg-surface-sunken` | 입력, sub-card |
| `var(--bg4)` | `bg-surface-active` | 활성 상태 |
| `var(--bd)` | `border-border-default` | 1px border |
| `var(--bd2)` | `border-border-strong` | 강조 border |
| `var(--t1)` | `text-text-primary` | 본문 |
| `var(--t2)` | `text-text-secondary` | 보조 |
| `var(--t3)` | `text-text-tertiary` | meta |
| `var(--acl)` | `bg-accent` / `text-accent` / `border-accent` | 액션 |
| `var(--info)` | `text-status-info-bar` 또는 `bg-status-info-bar` | |
| `var(--safe)` | `text-status-safe-bar` 또는 `bg-status-safe-bar` | |
| `var(--warn)` | `text-status-warning-bar` 또는 `bg-status-warning-bar` | |
| `var(--danger)` | `text-status-danger-bar` 또는 `bg-status-danger-bar` | |
| `var(--fire)` | `text-status-fire-bar` 또는 `bg-status-fire-bar` | UI-SPEC §3.4.1 의 사용 없음 룰 — 본 페이지에서 0건 |
| `var(--c-day)` | `bg-duty-day` | 주간 |
| `var(--c-night)` | `bg-duty-night` | 당직 |
| `var(--c-off)` | `bg-duty-off` | 비번 |
| `var(--c-leave)` | `bg-duty-leave` | 휴 |
| `var(--radius-sm)` (8px) | `rounded-sm` | input, button, sub-card |
| `var(--radius-md)` (12px) | `rounded-md` | 표준 카드 |
| `var(--radius-lg)` (16px) | `rounded-lg` | 모달, 큰 panel |
| `var(--radius-pill)` (99px) | `rounded-full` 또는 `rounded-[99px]` | 캡슐 배지, 칩 |

**Spacing (4의 배수, 토큰 직접):**

| 옛 인라인 | Tailwind class | 사용처 |
|---|---|---|
| `padding: 4` | `p-1` (=4px) | 칩 안 |
| `padding: 8` | `p-2` (=8px) | 작은 카드 |
| `padding: 12` | `p-3` (=12px) | 카드 좌우 |
| `padding: 16` | `p-4` (=16px) | 페이지 패딩 (mobile) |
| `padding: 20` | `p-5` (=20px) | BottomSheet 상단 |
| `padding: 24` | `p-6` (=24px) | 데스크톱 페이지 |
| `gap: 4/8/12/16/24` | `gap-1/2/3/4/6` | flex/grid gap |

**Component spacing (자동 분기 — 모바일/데스크톱 token level):**

| 옛 인라인 | v0.1.1 토큰 | 모바일 / 데스크톱 |
|---|---|---|
| 카드 padding | `--card-padding` | 14 / 10 |
| 카드 내부 gap | `--card-gap` | 8 / 6 |
| 모달 padding | `--modal-padding` | 20 / 24 |
| 섹션 사이 | `--section-gap` | 24 / 32 |
| input height | `--input-height` | 44 / 40 |
| button height | `--button-height` | 44 / 40 |

⚠ **w-8 h-8 함정** (memory: feedback_tailwind_w8_h8_is_48px):
- tailwind.config.spacing override 에서 `w-8` = **48px** (기본 32 아님)
- 백버튼 32px 원하면 `w-7 h-7` 또는 명시 `w-[32px] h-[32px]`
- 변환 wave executor 는 `tailwind.config.js` 의 spacing 정의를 먼저 확인하고 class 선택

**Status / Duty / 카테고리 색 — 절대 섞지 말 것:**

- Status (의미 색): 점검 결과 안전/주의/위험, 진행률 임계치, 토스트 — `bg-status-{safe,warning,danger,info}-bar`
- Duty (근무 색): 주/당/비/휴 shift 칩 전용 — `bg-duty-{day,night,off,leave}`
- 카테고리 (휴가 11종): 동적 hex (`LEAVE_BG[lt]`) 인라인 style 잔존 (§10 화이트리스트)
- 식단 카테고리 (A/B/석식): `#42d778` 등 카테고리 hex 직접 또는 tailwind config 추가 후 class

---

**§6. Region-별 hand-off (sub-task 분할 권장)**

변환 wave 가 1552 lines atomic 1-shot 으로 끝나기엔 크므로 권장 sub-task:

1. **Sub-task 1 — 헬퍼/상수 (line 1~250):** import, HIRE_DATES, calcLeaveQuota, localYMD, prevYMD, SHIFT_LABEL, LEAVE_TYPES, SHIFT_BG, LEAVE_BG, LEAVE_LABEL, HALF_TYPES, ANNUAL_TYPES, DOC_LEAVE_GRID, DOC_TO_API_TYPE, lp[0..16] — 100% 그대로
2. **Sub-task 2 — state hooks (line 250~680):** useState/useEffect/useQuery 6개/useMutation 4개 — 100% 그대로
3. **Sub-task 3 — calendarGrid JSX (line 681~798):** W2/W6 적용 region.calendar
4. **Sub-task 4 — legend + summary (line 800~840):** W3 적용 region.legend + region.summary-cards
5. **Sub-task 5 — menu + upload (line 842~1018):** W4 적용 region.menu-cards + region.menu-upload
6. **Sub-task 6 — 데스크톱 분기 (line 1020~1278):** W6/W7/W8 적용 region.desktop-3panel + form + pdf-preview
7. **Sub-task 7 — 모바일 BottomSheet (line 1280~1549):** W5 적용 region.bottomsheet

또는 single atomic — 변환 wave executor 의 판단. atomic 시점에 grep gate 모두 PASS 필요.

---

**§7. 비-trivial 변환 케이스**

특별 처리 필요한 case (§10 인라인 style 예외 화이트리스트 와 연결):

1. **인라인 동적 분기** — `style={{ background: isToday ? '#3b82f6' : 'var(--bd)' }}` → Tailwind 의 className 분기:
   ```tsx
   className={`${isToday ? 'bg-accent' : 'bg-surface-sunken'}`}
   ```
2. **계산된 aspect-ratio** — `style={{ aspectRatio: isDesktop ? '1.2' : '1' }}` → 분기 또는 arbitrary:
   ```tsx
   className={isDesktop ? 'aspect-[1.2]' : 'aspect-square'}
   ```
3. **linear-gradient (반차 셀, half_am/half_pm)** — Tailwind 가 RGBA + 다중 stop 정확히 지원 안 함 → `style` 인라인 잔존 OK (§10 화이트리스트). 또는 tailwind config 의 `backgroundImage` 추가
4. **boxShadow (PDF 미리보기 카드)** — `shadow-md` 또는 arbitrary `shadow-[0_2px_8px_rgba(0,0,0,0.1)]`
5. **animation (spin, fadeIn, slideUp, shimmer)** — tailwind.config 의 `animation` config 또는 inline `<style>` jsx 잔존 OK
6. **lucide vs ✓ U+2713 plain text** — 둘 다 OK. ✓ plain 은 텍스트 노드, lucide `<Check size={16} />` 은 SVG. 결정은 변환 wave executor 가 case-by-case. 메모리 룰 (feedback_tsx_wave_emoji_dot_gap) 적용: 이모지 0건 grep 통과만 보장
7. **dot span 추가** (memory: feedback_tsx_wave_emoji_dot_gap) — sketch 의 3px 색 동그라미 패턴 (§8.3) — `<span className="inline-block w-[3px] h-[3px] rounded-full bg-status-{x}-bar" />` 같은 markup 추가 필요
8. **leading-none** (memory: feedback_text_caption_leading_none) — 작은 컨테이너 (h-8 등) 안 `text-caption` 은 lh 1.5 가 시각 패딩 유발 → `leading-none` 명시. 헤더 토글/배지/칩에 적용
9. **planner verbatim quote rule** (memory: feedback_planner_prompt_sketch_verbatim) — 변환 wave executor 가 sketch 의 CSS 정의를 grep 으로 추출해 그대로 인용. 추측한 토큰명/사이즈는 deviation 유발

---

**§8. Sub-task 별 verify checkpoint**

각 sub-task 완료 시점 grep 결과:
- Sub-task 3 완료: `region.calendar` 안 `style={{` 0건 (단 LEAVE_BG 동적 잔존 카운트 +1), `var(--c-*)` 0건
- Sub-task 4 완료: `region.legend` + `region.summary-cards` 안 옛 alias 0건
- Sub-task 5 완료: `region.menu-cards` 안 식단 카테고리 hex 외 인라인 style 0건
- Sub-task 6 완료: 데스크톱 분기 안 `lg:px-/py-/p-` 0건 (layout `lg:flex` 등만 잔존)
- Sub-task 7 완료: BottomSheet 안 인라인 style 0건 (overlay/handle/section all converted)
- 최종 atomic 완료: §4 의 verify gate 22개 모두 PASS

---

**§9. 비즈니스 로직 보존 verify**

변환 후 보존 확인 grep (각 명령 → 정확한 카운트 일치):

```bash
# useQuery 6 keys (각 ≥1)
grep -nE "useQuery\(\{[^}]*queryKey: \['(leaves|leaves-year|meals|schedule|holidays|menu)'" cha-bio-safety/src/pages/StaffServicePage.tsx

# useMutation 4 (leaveApi.create/delete, mealApi.upsert, menuApi.create)
grep -nE "useMutation\(|leaveApi\.(create|delete)|mealApi\.upsert|menuApi\.create" cha-bio-safety/src/pages/StaffServicePage.tsx

# toast.* 18 카피 (verbatim Korean)
grep -nE "toast\.(success|error|loading|dismiss)" cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: 변환 전과 동일 카운트 (수치 변환 wave 시작 시 grep 으로 baseline 확보)

# 필수 함수 호출 (각 ≥1)
grep -nE "calcLeaveQuota|calcProvidedMeals|calcWeekendAllowance|generateLeaveRequest|printLeaveRequest|handleMenuUpload" cha-bio-safety/src/pages/StaffServicePage.tsx

# lp[0..16] 좌표 17개
grep -nE 'lp\[(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16)\]' cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: ≥17 references

# isBlocked / DOC_LEAVE_GRID / DOC_TO_API_TYPE / HOLIDAYS_FALLBACK / HIRE_DATES / SHIFT_OFFSETS
grep -nE "isBlocked|DOC_LEAVE_GRID|DOC_TO_API_TYPE|HOLIDAYS_FALLBACK|HIRE_DATES|SHIFT_OFFSETS|getRawShift|SHIFT_COLOR" cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: 모두 잔존

# useIsDesktop() 분기
grep -nE "useIsDesktop\(\)|isDesktop" cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: 변환 전과 동일 카운트
```

---

**§10. 인라인 style 예외 화이트리스트**

Tailwind 으로 표현 안 되거나 안 하는 게 나은 case (style 잔존 OK). 각 인스턴스는 line ref + 사유 inline 명시.

| 케이스 | Source line (변환 전 기준) | 사유 |
|---|---|---|
| PDF preview lp[0..16] overlay | line 1225~1273 (17 instance) | 동적 좌표 `left: {%}, top: {%}` — Tailwind 불가 |
| PDF overlay span 의 `font-size: 10` + `color: #111` + `font-family: 'Noto Sans KR'` | (lp overlay 안) | UI-SPEC §10.1 NEGATIVE — 인쇄 정합성 |
| PDF 체크박스 사각형 `width: 12, height: 12, background: #000` | (lp overlay 안) | UI-SPEC §10.1 NEGATIVE — 인쇄 정합성 |
| 카테고리 hex 동적 셀 배경 | `background: LEAVE_BG[lt]` (line 681~798 안) | JS 변수 동적 hex — 정적 Tailwind 불가 |
| 식단 카드 카테고리 hex 배경 (#42d778 등) | line 842~1018 | 동적 카테고리 hex — 정적 class 불가능 시 잔존 |
| linear-gradient 반차 셀 (half_am/half_pm) | calendarGrid 안 | RGBA + multi-stop — Tailwind 가 정확히 지원 안 함 |
| spinner / fadeIn / slideUp / shimmer animation | (W9 적용 후) `<style>` jsx 잔존 OR tailwind.config animation | keyframe 정의 location 결정 by executor |
| BottomSheet drag handle width:36 height:4 | line 1280~ 안 (BottomSheet 헤더) | 표준 패턴 픽셀 — token 외 |
| BottomSheet max-h: 65vh | container | UI-SPEC §2.3 예외 — 기존 동작 보존 |
| 데스크톱 중앙 패널 폭 280px | desktop-3panel | UI-SPEC §2.3 예외 — 휴가신청서 폼 컬럼 |
| 데스크톱 우측 패널 max-w 595px | desktop-pdf-preview | A4 폭 — PDF 좌표 정합성 |
| PDF 업로드 라벨 세로 패딩 데스크톱 py-12 / 모바일 py-3 | menu-upload | UI-SPEC §2.3 예외 — 드롭존 vs 컴팩트 |

변환 wave executor 는 위 케이스 외 모든 인라인 style 제거. 새 예외 발견 시 본 §10 에 line ref 추가.

---

**§11. 변환 후 사용자 검수 흐름**

1. 변환 wave executor 가 atomic commit (또는 region 별 commit)
2. `npx tsc --noEmit` PASS — 0 errors
3. `npm run build` PASS — exit 0
4. §4 의 verify gate 22개 모두 PASS — 출력 capture 후 결과 보고
5. 사용자 검수:
   - 모바일 (393px frame) — Chrome DevTools 또는 실기기
   - 데스크톱 (1280px frame)
   - 다크 모드 + 라이트 모드 양 환경
   - 5 region 인터랙션 (달력 셀 클릭 / BottomSheet 열기 / 휴가 신청 폼 / PDF 미리보기 / 식단 업로드)
6. 사용자 컨펌 후 main 머지 (memory: project_redesign_workflow — redesign/12-staff-service 브랜치 → main)
7. cbc7119-preview.pages.dev 자동 배포 (GitHub Actions)
8. 직원 도메인 (cbc7119.pages.dev) 영향 0 — 본 워크트리는 디자인 격리 (memory: project_cbc7119_design_repo + reference_cbc7119_domain)
9. wrangler 명령 절대 금지 (memory: feedback_cbc7119_design_never_wrangler) — 디자인 wave 중 wrangler --project-name=cbc7119 시도 0건

---

**§12. Open questions (변환 wave 시작 전 결정 필요)**

체크박스 형식. 변환 wave executor 가 시작 전 사용자에게 컨펌.

- [ ] **OQ1**: 단일 atomic commit vs region 별 sub-task 7개 commit 분할 — 1552 lines 크기 고려. default: 단일 atomic 권장 (사용자 검수 단순), 단 sub-task 별 grep checkpoint 는 §8 따라 별도 확인
- [ ] **OQ2**: ✓ U+2713 plain text 유지 vs `<Check size={16} />` lucide 치환 — W9 sketch 의 ✓ U+2713 plain 패턴 유지가 무난. lucide 치환 시 변환 wave executor 가 명시
- [ ] **OQ3**: ANNUAL_TYPES 별도 정의 유지 vs API type 매핑 simplification — 비즈니스 로직 보존 (§9) 우선. 변경 안 함 권장
- [ ] **OQ4**: detailPanel dead code 처리 (UI-SPEC §14 OQ #2) — 데스크톱 분기에서 미렌더. grep 으로 사용처 확인 후:
  - 사용처 0 → 삭제 (코드 줄임)
  - 사용처 ≥1 → 보존 + line ref 명시
- [ ] **OQ5**: tailwind.config 에 새 animation keyframe 추가 vs `<style>` jsx 잔존 — W9 의 spin/fadeIn/slideUp/shimmer 4종. default: 새 animation 추가 (`tailwind.config.js` 의 `theme.extend.animation` + `keyframes`)
- [ ] **OQ6**: tailwind.config 에 식단 카테고리 hex (#42d778 등) 추가 vs `style` 인라인 잔존 — default: tailwind config 의 colors 추가 후 class 사용. 단 동적 분기는 §10 화이트리스트로 잔존

---

**End of W10 checklist.**

---

**Write tool 사용 규칙 (CRITICAL):**
- 본 markdown 파일 작성 시 반드시 Write tool 사용
- 절대 `Bash(cat << 'EOF')` heredoc 으로 작성하지 말 것 (planner critical rule)
- 이모지 0건 (Negative gate 자체 적용)
- 작성 후 grep 으로 self-verify:
  ```bash
  grep -nP '[\x{1F300}-\x{1FAFF}]|[\x{2600}-\x{27BF}]' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md
  # 기대: 0 hits
  wc -l cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md
  # 기대: ≥250 lines
  grep -c '^##\|^###' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md
  # 기대: ≥12 sections (§1~§12)
  grep -cE '^\| ' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md
  # 기대: ≥30 table rows (NEGATIVE 10 + region 9 + cheatsheet 30+ + 화이트리스트 12)
  grep -cE 'grep -[nEvc]' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md
  # 기대: ≥20 grep 명령 verbatim
  ```
  </action>

  <verify>
    <automated>
test -f cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md && \
LINES=$(wc -l < cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md) && \
[ "$LINES" -ge 250 ] && \
EMOJI=$(grep -cP '[\x{1F300}-\x{1FAFF}]|[\x{2600}-\x{27BF}]' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md || echo 0) && \
[ "$EMOJI" -eq 0 ] && \
SECTIONS=$(grep -cE '^\*\*§|^## §' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md) && \
[ "$SECTIONS" -ge 12 ] && \
GREP_CMDS=$(grep -cE 'grep -[nEvcP]' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md) && \
[ "$GREP_CMDS" -ge 20 ] && \
echo "PASS: lines=$LINES, emoji=$EMOJI, sections=$SECTIONS, grep_cmds=$GREP_CMDS"
    </automated>
  </verify>

  <done>
    - sketch/10-tsx-conversion-checklist.md 파일 존재
    - ≥250 lines (comprehensive)
    - 이모지 0건 (grep -cP unicode range 검출 0)
    - §1 ~ §12 모든 12 section 명시
    - grep 명령 verbatim ≥20개 포함
    - NEGATIVE scope 10 items, region mapping 9개, cheatsheet 표, 화이트리스트, open questions 모두 포함
    - tsc 와 build 검증 명령 포함 (§4 build gates)
    - 메모리 룰 reference (tailwind 토큰 패턴, w-8 h-8 함정, planner verbatim quote, tsx wave emoji/dot gap, leading-none) 모두 inline 인용
  </done>
</task>

</tasks>

<verification>
W10 markdown checklist 작성 완료 검증:

```bash
# 1. 파일 존재
test -f cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md

# 2. ≥250 lines
wc -l cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md

# 3. 이모지 0건 (self-applied negative gate)
grep -cP '[\x{1F300}-\x{1FAFF}]|[\x{2600}-\x{27BF}]' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md
# 기대: 0

# 4. 12 sections 명시
grep -cE '^\*\*§(1|2|3|4|5|6|7|8|9|10|11|12)\.' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md
# 기대: ≥12

# 5. grep 명령 verbatim ≥20
grep -cE 'grep -[nEvcP]' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md
# 기대: ≥20

# 6. 표 행 ≥30 (NEGATIVE 10 + region 9 + cheatsheet 30+ + 화이트리스트 12)
grep -cE '^\| ' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md
# 기대: ≥30

# 7. 9 region 모두 명시
grep -cE 'region\.(app-chrome|calendar|legend|summary-cards|menu-cards|bottomsheet|desktop-3panel|desktop-center-form|desktop-pdf-preview)' cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md
# 기대: ≥9
```
</verification>

<success_criteria>
- markdown 1개 파일 (10-tsx-conversion-checklist.md) 작성 완료, sketch/ 디렉토리 안
- ≥250 lines (comprehensive)
- 이모지 0건 (grep -cP unicode range 검출 0)
- §1 ~ §12 모든 12 section 명시 (목적/NEGATIVE/region mapping/verify gate/cheatsheet/sub-task/비-trivial/checkpoint/biz logic/화이트리스트/검수/OQ)
- grep 명령 verbatim ≥20개 (negative 9 + positive 11 + build 2)
- 9 region (app-chrome, calendar, legend, summary-cards, menu-cards, bottomsheet, desktop-3panel, desktop-center-form, desktop-pdf-preview) 모두 source line + sketch ref + 변환 핵심 명시
- 옛 alias → v0.1.1 토큰 1:1 매핑 cheatsheet 표 ≥1
- 인라인 style 예외 화이트리스트 ≥10 instances (PDF lp 좌표 17 instance 묶음 1 + 카테고리 hex + gradient + animation + boxShadow + 픽셀 예외 등)
- 메모리 룰 ≥5 inline 인용 (tailwind 토큰 패턴, w-8 h-8 함정, planner verbatim quote, tsx wave emoji/dot gap, leading-none)
- NEGATIVE scope 10 items UI-SPEC §10 verbatim 인용
- src/ 또는 다른 sketch 파일 수정 0건 (단일 파일 생성만)
</success_criteria>

<output>
After completion, no SUMMARY.md required (quick task). Single file artifact at:
`cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md`
</output>
