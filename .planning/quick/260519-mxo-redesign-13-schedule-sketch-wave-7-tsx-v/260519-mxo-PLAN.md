---
phase: 260519-mxo
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md
autonomous: true
requirements:
  - REDESIGN-13-W7-CHECKLIST
must_haves:
  truths:
    - "단일 markdown 파일 wave-7-tsx-conversion-checklist.md 가 13-schedule 디렉토리에 존재한다"
    - "checklist 가 §1~§12 12개 section 을 모두 포함하며 빈 section 이 없다"
    - "TSX 변환 wave 진입 전 executor 가 본 문서만 읽어도 deviation 없이 진행 가능한 LOCKED 룰이 verbatim 인용되어 있다"
    - "W1~W6 sketch + SchedulePage.tsx source 검증 후 작성되어 추측 표현이 없다"
    - "메모리 룰 5건 (feedback_tailwind_token_class_pattern.md / feedback_tailwind_w8_h8_is_48px.md / feedback_planner_prompt_sketch_verbatim.md / feedback_tsx_wave_emoji_dot_gap.md / feedback_text_caption_leading_none.md) 이 inline 으로 인용되어 있다"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md"
      provides: "13-schedule TSX 변환 wave 진입 전 LOCKED 룰 통합 가이드"
      min_lines: 400
      contains: "§1 Scope / §2 NEGATIVE scope / §3 Region 매핑 / §4 Verify gates / §5 Tailwind cheatsheet / §6 Sub-task 분할 / §7 비-trivial 변환 케이스 / §8 W1~W6 LOCKED 인용표 / §9 비즈 로직 verify / §10 인라인 style 화이트리스트 / §11 검수 흐름 / §12 Open Questions"
  key_links:
    - from: "wave-7-tsx-conversion-checklist.md §3 Region 매핑"
      to: "SchedulePage.tsx source line refs"
      via: "표 형식 — Region / source line / sketch wave 3열"
      pattern: "line [0-9]+~[0-9]+"
    - from: "wave-7-tsx-conversion-checklist.md §8"
      to: "W1~W6 sketch LOCKED 결정"
      via: "OQ ID + 결정 + 적용 위치 verbatim 인용"
      pattern: "W[1-6] \\| #[1-3]"
    - from: "wave-7-tsx-conversion-checklist.md §5"
      to: "옛 alias var() → v0.1.1 class 매핑"
      via: "cheatsheet 표 (≥12 row)"
      pattern: "var\\(--(bg|bd|t1|acl|c-)"
---

<objective>
13-schedule redesign 의 Wave 7 (단일 markdown 작성) — TSX 변환 wave 진입 전 LOCKED 룰 통합 가이드 문서를 생성한다.

Purpose:
- SchedulePage.tsx (1062줄) 를 v0.1.1 Tailwind 토큰 class 로 재작성하는 TSX 변환 wave 가 executor 에게 deviation 없이 전달되도록, W1~W6 sketch + source 의 모든 LOCKED 결정 / 비즈 로직 / verify gate / 인라인 style 화이트리스트 / sub-task 분할 권고 / open question 을 12 section markdown 한 장에 통합한다.
- 12-staff service W10 (`cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md`, 436줄) 패턴 mirror — 구조 동일, 13-schedule 컨텍스트로 재작성.

Output:
- `cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md` (≥400줄, 12 sections, 추측 0).
- TSX 변환 wave (Wave 8 예정) 의 PLAN.md 가 본 문서를 `@file` 참조로 끌어와 LOCKED 룰을 verbatim 인용할 수 있다.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@./CLAUDE.md
@./CLAUDE.local.md

# Source — verbatim 검증 대상 (수정 절대 금지)
@cha-bio-safety/docs/redesign-context/13-schedule/SchedulePage.tsx
@cha-bio-safety/docs/redesign-context/13-schedule/design-system.md
@cha-bio-safety/docs/redesign-context/13-schedule/tokens.css
@cha-bio-safety/docs/redesign-context/13-schedule/typography.css

# Sketch wave 1~6 — LOCKED 결정 sources
@cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-1.html
@cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-2.html
@cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-3.html
@cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-4.html
@cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-5.html
@cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-6.html

# Mirror 참조 — 12-staff W10 (구조/길이 mirror, 컨텍스트는 별개)
@cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md

# Chrome 통일 reference
@cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: wave-7-tsx-conversion-checklist.md 생성 — 12 sections 통합 가이드</name>

  <files>
    cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md
  </files>

  <action>
**입력 검증 (작성 전 필수)**:
1. SchedulePage.tsx (1062줄) — line 154~162 matchesDate / line 170~181 dayCatMap / line 183~194 calDays / line 196~199 shiftMonth / line 206~210 handleStatus / line 212~220 handleDelete / line 222 catInfo / line 224~235 handlePlanDownload / line 240~292 캘린더 / line 294~299 공휴일 / line 300~405 일자 카드 / line 410~424 모달 trigger / line 437/477 엑셀 버튼 / line 442~464 데스크톱 헤더 / line 466~496 모바일 헤더 / line 498~643 MonthlyPlanPreview / line 647~963 AddModal / line 712~756 AddModal.handleSave / line 966~1042 EditModal / line 977~987 EditModal.handleSave 모두 verbatim 확인 (`grep -nE` 또는 Read offset/limit 로 검증, 추측 X).
2. tokens.css / typography.css → 옛 alias var() ↔ v0.1.1 토큰 class 매핑 정합성 (§5 cheatsheet 작성 시).
3. W1~W6 sketch HTML → LOCKED 결정 OQ ID 와 적용 위치 verbatim 추출.
4. 메모리 룰 5건 — 파일명 그대로 인용 (feedback_tailwind_token_class_pattern.md / feedback_tailwind_w8_h8_is_48px.md / feedback_planner_prompt_sketch_verbatim.md / feedback_tsx_wave_emoji_dot_gap.md / feedback_text_caption_leading_none.md).

**Write 도구로 markdown 1장 생성**.

**구조 — 12 sections, ≥400 줄, 빈 section 0**:

1. **§1 Scope (변환 범위)**
   - 파일: `src/pages/SchedulePage.tsx` (1062줄, snapshot = `cha-bio-safety/docs/redesign-context/13-schedule/SchedulePage.tsx` 동일)
   - 변환 후: v0.1.1 Tailwind 토큰 class (alias var() 폐기, status- prefix 0, 9·10·11px 0)
   - 목표: 비즈 로직 100% 보존 + UI/스타일링만 재작성

2. **§2 NEGATIVE scope (변경 절대 금지 — verbatim 인용 ≥15 항목)** — task_scope §2 의 verbatim 항목 전체 mirror:
   - React Query keys (`['schedule', curMonth]`, `['holidays']`)
   - useQuery 시그니처 verbatim (line 137~143 holidays, line 145~149 schedule)
   - scheduleApi 5 호출 사이트 (getByMonth/create/update/updateStatus/delete) — line 147/207/214/740/980
   - matchesDate 룰 (line 154~162) — endDate 없으면 단일, 있으면 start~end + 주말/공휴일 표시 제외
   - dayCatMap (line 170~181)
   - calDays 7×6 grid (line 183~194)
   - shiftMonth (line 196~199)
   - handleStatus done/!done 분기 + toast (line 206~210)
   - handleDelete try/catch + toast (line 212~220)
   - handlePlanDownload (line 224~235)
   - AddModal.handleSave 5 cat 분기 (line 712~756) — inspect/elevator/fire/task/event + finalTitle/finalInsCat
   - EditModal.handleSave (line 976~987)
   - 상수 set: SCHED_CATEGORIES 5 (line 81~87) / INSP_CATEGORIES 19 (line 35~62) / ELEV_SUBCATS 3 (line 63) / FIRE_SUBCATS 4 (line 64) / ELEV_AGENCY (line 69~73) / FIRE_AGENCY (line 74~78) / PLAN_PREVIEW_ROWS 21 (line 99~121) / WEEK_DAYS (line 96)
   - 외부 fetch `https://holidays.hyunbin.page/basic.json` (line 22, fetchHolidays)
   - 13 toast 카피 verbatim — line 209, 216, 218, 229, 231, 414, 424, 713, 719, 729, 752, 977, 983 (W6 §2 mirror)

3. **§3 Region 매핑** (≥7 row 표):
   | Region | source line | sketch wave |
   |---|---|---|
   | page-shell + 모바일 헤더 | 466~496 | W1 + W6 |
   | 데스크톱 헤더 + 엑셀 버튼 | 442~464, 437, 477 | W1 + W6 |
   | 월 네비 + 캘린더 (7×6) | 240~292 | W1 |
   | 공휴일 라벨 | 294~299 | W1 |
   | 일자 카드 리스트 | 300~405 | W2 |
   | 미리보기 테이블 (desktop-only) | 498~643 | W3 |
   | AddModal | 647~963 | W4 |
   | EditModal | 966~1042 | W5 |
   | Toast 13종 사용처 | line list (위 §2) | W6 |

4. **§4 Verify gates (16 grep + build 2 = 18, 비즈 5 = 총 23 — 안전 마진 with task_scope 16~20 + build 2)**:
   - **Negative gates (8)** — 이모지 0 / 9·10·11px 0 / status- prefix 0 / linear-gradient 0 / 옛 alias var() 0 / "오늘" 본문 0 / raw category hex (dynamic 분기 외) 0 / w-8 h-8 confusion 회피 (close X 는 `w-7` 또는 `w-[32px]` 명시)
   - **Positive gates (5)** — v0.1.1 토큰 class 카운트 (bg-surface-* ≥10 / text-text-* ≥30 / border-border-* ≥10 / bg-accent ≥1 / bg-status-safe-bar ≥1 / text-status-(safe|warning|danger|info) ≥3) / SCHED_CATEGORIES 5 hex 등장 / typography 토큰 ≥30 / lucide import 6 (Download/Plus/ChevronLeft/X/CheckCircle2/AlertCircle) / leading-none|tight|relaxed 명시
   - **Build gates (2)** — `npx tsc --noEmit` 0 errors / `npm run build` PASS
   - **비즈 로직 verify (5)** — useQuery 2 hits / scheduleApi. 5 hits / toast.(success|error) 13 hits / external fetch 1 hit / matchesDate+dayCatMap+handlePlanDownload+generateMonthlyPlan 시그니처 diff = 0

   각 gate 에 `grep -nE` 명령어 verbatim 동봉.

5. **§5 Tailwind cheatsheet (≥12 row 표)** — task_scope §5 전체:
   | 옛 alias | v0.1.1 class | 토큰 CSS 변수 |
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
   | `var(--c-day)` | `bg-duty-day` | `--duty-day` |
   | `var(--c-night)` | `bg-duty-night` | `--duty-night` |
   | `var(--c-off)` | `bg-duty-off` | `--duty-off` |
   | `var(--c-leave)` | `bg-duty-leave` | `--duty-leave` |
   | inline `fontSize: 11px` | `text-caption` (12px) — upgrade | typography |
   | inline `fontSize: 13px` | `text-label` (13px) | typography |
   | inline `fontSize: 14px` | `text-body-sm` (14px) | typography |

6. **§6 Sub-task 분할 권고 (6 sub-wave, atomic commit 권장)**:
   - SW1: page-shell + 헤더 (자체 chrome) + 토큰 import + utility constants
   - SW2: 캘린더 grid (월 네비 + 7×6 + dot map + 공휴일)
   - SW3: 일자 카드 리스트 (상태 색 + 사이즈 + 액션 + FAB)
   - SW4: 미리보기 테이블 (desktop-only — 31×21 + cell-bg-* 6 클래스 환원)
   - SW5: AddModal (모달 chrome + 5 cat 분기 + 시작/종료일 + N일 미리보기 + CTA grid)
   - SW6: EditModal + 토스트 lucide 도입 + 최종 verify gate + build

7. **§7 비-trivial 변환 케이스**:
   - dot map 분기 (line 170~181) — 모든 카테고리 매칭, SCHED_CATEGORIES[cat].color
   - 멀티데이 matchesDate (line 154~162) — start~end + 주말/공휴일 표시 제외
   - 카테고리 selected dynamic alpha hex `${c.color}22` — 인라인 style 허용 (§10 화이트리스트)
   - INSP_CATEGORIES 19 native `<select>` 유지 (W4 OQ #3 LOCKED a)
   - lucide 도입 위치 (Download / Plus / ChevronLeft / X / CheckCircle2 / AlertCircle)
   - 31×21 cell-bg-* 6 클래스 환원 (W3 sketch)
   - 자체 헤더 chrome 통일 (h-48 + bg-surface-raised + 백 버튼 32×32 rounded-[7px] + lucide ChevronLeft 15px stroke 1.5)

8. **§8 W1~W6 LOCKED 결정 인용표 (16 LOCKED, verbatim)** — task_scope §8 전체 표 그대로:
   - W1 #1: 라이트 dot `#94a3b8` slate-400 / 다크 `#e2e8f0`
   - W1 #2: 멀티데이 = dot 유지, band 추가 X
   - W1 #3: "오늘" 칩 제거, 월 네비 ‹ / 라벨 / › 만
   - W2 #1: 상태 칩 색 = source verbatim (예정=tertiary / 진행중=accent / 완료=safe / 지연=danger)
   - W2 #2: add CTA = FAB 우하단 56px 원형 accent bg
   - W2 #3: 멀티데이 범위 = 시간 자리 "5/12 ~ 5/15 (4일)"
   - W3 #1: 모바일 미리보기 미구현 (desktop 전용)
   - W3 #2: 미리보기 페이지 FAB 표시 안 함
   - W3 #3: 데스크톱 1280px cramped 그대로 (31일 폰트 12px)
   - W4 #1: AddModal BottomSheet maxHeight 90dvh source verbatim
   - W4 #2: AddModal+EditModal 저장 버튼 = `var(--accent)` solid (linear-gradient 폐기)
   - W4 #3: INSP_CATEGORIES 19종 = native `<select>` verbatim
   - W5: 카테고리 lock 메타 row 텍스트 "(카테고리는 수정 후에도 변경할 수 없습니다)" b 채택
   - W5: empty title = input border-danger + 빨간 인라인 에러 12px b 채택
   - W6 #1: 엑셀 버튼 = `var(--status-safe-bar)` solid (linear-gradient 폐기)
   - 노안: 헤더 15→18 / 저장 14→16 / close X 28→32 + 14→16 / fire grid 10→12

9. **§9 비즈 로직 보존 verify**:
   - useQuery 2 호출 verbatim (line 137~143 holidays / 145~149 schedule)
   - handleStatus / handleDelete / handlePlanDownload 카피 verbatim
   - matchesDate / dayCatMap / calDays / shiftMonth 룰 그대로
   - AddModal.handleSave 5 cat 분기 + hasRange ? { end_date } verbatim
   - EditModal.handleSave (line 976~987)
   - 외부 fetch URL (line 22)
   - generateMonthlyPlan(y, mo, holidays) 호출 시그니처 (line 228)

10. **§10 인라인 style 예외 화이트리스트 (≥4 위치)**:
    - 캘린더 today cell `borderColor: var(--accent)` 2px
    - 카테고리 cat selected `background: ${c.color}22`
    - 미리보기 테이블 31×21 cell — cell-bg-(sun|sat|hol|safe|today|today-last) 6 클래스 환원
    - AddModal cat picker 5 grid dynamic border/bg
    - AddModal elevator/fire sub picker (`#f97316`/`#ef4444` alpha 0.15/0.13)
    - 0회 강제: `linear-gradient` 0 / `style={{ background: 'linear-gradient(...)' }}` 0

11. **§11 검수 흐름 (워크트리 룰 inherit)**:
    - TSX 변환 후 `npm run dev` 로컬 검수 (선택)
    - main 머지 → cbc7119-preview.pages.dev 자동 배포 (GitHub Actions)
    - **wrangler 명령 절대 금지** (`.claude/settings.local.json` deny + `feedback_cbc7119_design_never_wrangler.md`)
    - **`npm run deploy` 금지**
    - sketch HTML 6장 + checklist md 1장 잔존 유지 OK (참조 자료)
    - 직원 도메인 (cbc7119.pages.dev) 영향 없음

12. **§12 Open Questions (TSX 변환 wave 진입 전 답변 도출, 4건)**:
    - OQ #1 atomic vs 6 sub-wave 분할 — 추천 b) sub-wave
    - OQ #2 lucide 도입 범위 — 추천 a) 모두 lucide
    - OQ #3 미리보기 desktop-only 분기 implementation — 추천 a) source `isDesktop &&` verbatim
    - OQ #4 INSP_CATEGORIES native select vs grid 칩 재확인 — W4 LOCKED a 유지

**메모리 룰 inline 5건 (체크리스트 본문에 박제)**:
- `feedback_tailwind_token_class_pattern.md` — status- prefix 없음, `text-fire-bar` O / `text-status-fire-bar` X, lucide size={N} prop
- `feedback_tailwind_w8_h8_is_48px.md` — w-8 = 48px (override), source 32×32 close X 는 `w-7 h-7` 또는 `w-[32px] h-[32px]`
- `feedback_planner_prompt_sketch_verbatim.md` — sketch CSS 정의를 grep 으로 추출해 그대로 인용. 추측한 토큰명 deviation 유발
- `feedback_tsx_wave_emoji_dot_gap.md` — alias sed-replace 만 X. sketch negative gate (이모지 0) + dot span 추가 markup 도 verify
- `feedback_text_caption_leading_none.md` — text-caption lh:1.5 (18px) 가 h-8 안에서도 시각적 패딩. 작은 컨테이너 → leading-none 명시

**Deviation 회피 강화 (메모리 `feedback_tsx_wave_stat_card_drift.md` 적용)**:
- W1 자체 헤더 chrome 통일 (source 와 다름)
- W2 FAB 56px (source 없음, sketch 새 패턴)
- W4+W6 저장/엑셀 버튼 토큰 solid (source linear-gradient 폐기)
- W6 토스트 lucide 도입 (source react-hot-toast 기본)
- 노안 격상 15→18 / 14→16 / 28→32

→ §8 LOCKED 인용표 + §7 비-trivial 케이스 + §5 cheatsheet 에서 verbatim 명시.
→ verify gate negative #4 (linear-gradient 0) + positive #9 (bg-status-safe-bar ≥1) + #12 (lucide import 6) 가 누락 검출.

**작성 톤**:
- 이모지 0
- 모호한 표현 회피 — 구체 line ref / 클래스명 / 카피 verbatim 강제
- 추측 0 — source 검증 후만 인용
- 한국어 본문 + 영어 코드/식별자 혼용 (소스 일관성)
  </action>

  <verify>
    <automated>test -f cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md && LINES=$(wc -l < cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md) && echo "LINES=$LINES" && [ "$LINES" -ge 400 ] && SECTIONS=$(grep -cE '^## §[0-9]+' cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md) && echo "SECTIONS=$SECTIONS" && [ "$SECTIONS" -ge 12 ] && NEG_ITEMS=$(grep -cE '(verbatim|line [0-9]+|toast\.)' cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md) && echo "NEG_ITEMS=$NEG_ITEMS" && [ "$NEG_ITEMS" -ge 15 ] && LOCKED_ROWS=$(grep -cE '^\| W[1-6]' cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md) && echo "LOCKED_ROWS=$LOCKED_ROWS" && [ "$LOCKED_ROWS" -ge 13 ] && CHEAT_ROWS=$(grep -cE 'var\(--' cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md) && echo "CHEAT_ROWS=$CHEAT_ROWS" && [ "$CHEAT_ROWS" -ge 12 ] && MEM=$(grep -cE 'feedback_(tailwind_token_class_pattern|tailwind_w8_h8_is_48px|planner_prompt_sketch_verbatim|tsx_wave_emoji_dot_gap|text_caption_leading_none)\.md' cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md) && echo "MEMORY_HITS=$MEM" && [ "$MEM" -ge 5 ] && SOURCE_LINES=$(grep -cE 'line [0-9]+' cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md) && echo "SOURCE_LINES=$SOURCE_LINES" && [ "$SOURCE_LINES" -ge 10 ] && W10_REF=$(grep -cE '12-staff|10-tsx-conversion-checklist' cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md) && [ "$W10_REF" -ge 1 ] && WRANGLER_DENY=$(grep -cE 'wrangler' cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md) && [ "$WRANGLER_DENY" -ge 1 ] && OQ_COUNT=$(grep -cE 'OQ #[1-4]' cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md) && [ "$OQ_COUNT" -ge 4 ] && INLINE_WL=$(grep -cE '인라인 style|화이트리스트' cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md) && [ "$INLINE_WL" -ge 1 ] && EMOJI=$(python3 -c "import re,sys; t=open('cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md').read(); m=re.findall(r'[\U0001F300-\U0001FAFF\U00002600-\U000027BF]', t); print(len(m))") && echo "EMOJI=$EMOJI" && [ "$EMOJI" = "0" ] && echo "ALL 14 GATES PASS"</automated>
  </verify>

  <done>
    - 파일 생성: `cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md`
    - 길이 ≥ 400 줄 (12-staff W10 436줄 mirror)
    - §1~§12 12 sections 모두 존재, 빈 section 0
    - NEGATIVE scope verbatim 항목 ≥15
    - Region 매핑 표 ≥7 row, line ref ≥10
    - Verify gates ≥16 + build 2 + 비즈 5
    - Tailwind cheatsheet ≥12 row
    - Sub-task ≥6 sub-wave
    - W1~W6 LOCKED 인용표 ≥13 row
    - 메모리 룰 5건 파일명 등장
    - 12-staff W10 참조 1회
    - Open Questions 4건
    - 인라인 style 화이트리스트 ≥4 위치
    - wrangler 금지 명시
    - 이모지 0 (Python regex 검증)
    - 추측/모호 표현 0 (line ref + verbatim 강제)
  </done>
</task>

</tasks>

<verification>
- `verify <automated>` 단일 명령 실행 → ALL 14 GATES PASS 출력 확인
- 본 plan 산출물은 markdown 1장. 추가 코드/배포 없음
- TSX 변환 wave (다음 wave) 의 PLAN.md 가 본 문서를 `@file` 인용 가능한지 path 검증 (절대 경로: `cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md`)
</verification>

<success_criteria>
- wave-7-tsx-conversion-checklist.md 생성 + 14 verify gate 통과
- TSX 변환 wave (Wave 8) executor 가 본 문서만 읽어도 sketch 6 wave + source 1062줄 의 LOCKED 룰 / 비즈 로직 / verify gate / open question 을 모두 확보 가능
- 워크트리 룰 inherit: wrangler 금지 / `npm run deploy` 금지 / cbc7119-preview 자동 배포만
- 메모리 룰 5건 inline 박제 — 같은 사고 (stat card drift / w-8 함정 / emoji 잔존 / status- prefix / leading-none 누락) 재발 방지
</success_criteria>

<output>
After completion, create `.planning/quick/260519-mxo-redesign-13-schedule-sketch-wave-7-tsx-v/260519-mxo-SUMMARY.md` summarizing:
- Generated file path + final line count
- 14 verify gate 결과
- Key LOCKED rule 통계 (W1~W6 OQ count + 메모리 룰 5건 인용 위치)
- 다음 wave (Wave 8 — TSX 변환) 진입 전 사용자 컨펌 필요 사항 (OQ #1~#4)
</output>
