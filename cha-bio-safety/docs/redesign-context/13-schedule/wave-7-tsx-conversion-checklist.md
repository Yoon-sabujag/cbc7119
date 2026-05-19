---
title: "13-schedule — W7 TSX 변환 verify checklist"
status: draft
created: 2026-05-19
source_tsx: cha-bio-safety/src/pages/SchedulePage.tsx
source_snapshot: cha-bio-safety/docs/redesign-context/13-schedule/SchedulePage.tsx
source_lines: 1062
sketches_referenced: [W1, W2, W3, W4, W5, W6]
locked_decisions: 16
verify_gate_count: 23
mirror_of: cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md
consumed_by: 13-schedule TSX 변환 wave (Wave 8 예정) executor
---

# W7 — TSX 변환 verify checklist (13-schedule)

> 본 파일은 **sketch HTML 이 아님**. TSX 변환 wave (Wave 8) executor 가 1-pass 로 적용할 verify gate + region mapping + LOCKED 룰 박제 markdown.
> source-of-truth: SchedulePage.tsx (1062 lines, snapshot) + sketch-wave-1~6.html + design-system.md v0.1.1 + tokens.css + typography.css.
> 12-staff-service W10 (`cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md`, 436 lines) 패턴 mirror — 구조 동일, 13-schedule 컨텍스트로 재작성.

---

## §1. Scope (변환 범위)

**§1.1 본 checklist 의 위치:**
- W7 은 sketch HTML 6개 (W1~W6) 와 같은 wave 시리즈의 마지막 산출물이지만 sketch 가 아닌 markdown checklist.
- TSX 변환 wave (Wave 8) executor 가 본 checklist + sketch 6개 + design-system.md + tokens.css + typography.css 만 input 으로 읽고 atomic 변환 가능해야 함.

**§1.2 변환 대상:**
- `cha-bio-safety/src/pages/SchedulePage.tsx` — 현재 1062 lines (snapshot = `cha-bio-safety/docs/redesign-context/13-schedule/SchedulePage.tsx` 동일 1062 lines).
- 변환 후 예상: 약 850~1000 lines (옛 인라인 style 약 80건 제거 + Tailwind class 치환 + dot span 등 markup 추가 + linear-gradient 폐기 + lucide 도입).

**§1.3 본 checklist 자체 룰 (self-applied negative gate):**
- 이모지 0건 — Unicode 1F300~1FAFF / 2600~27BF 범위 글리프 0.
- ≥400 lines (12-staff W10 436줄 mirror).
- 12 sections (§1~§12) 모두 채움 — 빈 section 0.
- source line ref ≥10건 명시 (`line N~M` 또는 `line N` 패턴).
- W1~W6 LOCKED 결정 16개 verbatim 인용 ≥13 row.
- 메모리 룰 5건 (feedback_*.md) 파일명 inline 인용.

**§1.4 변환 wave executor 가 따라야 할 메모리 룰 (모두 본 checklist 안에 inline 인용):**
- `feedback_tailwind_token_class_pattern.md` — status- prefix 없음 (`text-fire-bar` O / `text-status-fire-bar` X 는 잘못된 가정), 정확히는 `text-status-{safe|warning|danger|info|fire}-bar` 가 v0.1.1 패턴. lucide `<Icon size={N} />` (className 의 `w-N h-N` 금지).
- `feedback_tailwind_w8_h8_is_48px.md` — `tailwind.config.js` 의 `theme.extend.spacing` 에서 `w-7=32px` / `w-8=48px` override. 32px 백버튼 / close X 원하면 `w-7 h-7` 또는 `w-[32px] h-[32px]`.
- `feedback_planner_prompt_sketch_verbatim.md` — sketch CSS 정의를 grep 으로 추출해 그대로 인용. 추측한 토큰명/사이즈는 deviation 유발.
- `feedback_tsx_wave_emoji_dot_gap.md` — alias sed-replace 만 X. sketch negative gate (이모지 0) + dot span 추가 markup 도 verify.
- `feedback_text_caption_leading_none.md` — text-caption lh:1.5 (18px) 가 h-8 / h-7 / 칩 같은 작은 컨테이너 안에서도 시각적 패딩 유발. 헤더 토글/배지/칩에 `leading-none` 명시.

---

## §2. NEGATIVE scope (변경 절대 금지) — verbatim 인용 ≥15 항목

source 의 비즈 로직 / 카피 / 시그니처는 본 변환에서 1 byte 도 바꾸지 않는다. git diff 에 잡히면 안 됨. 모든 카피는 verbatim 인용.

| 항목 | Source 좌표 (snapshot 기준) | 사유 |
|---|---|---|
| React Query keys (`['schedule', curMonth]`, `['holidays']`) | line 138, 146 | 캐시 키 변경 시 staleTime / refetch 영향 |
| useQuery `holidays` 시그니처 verbatim | line 137~143 (queryFn=fetchHolidays, staleTime=7일, retry=1) | 외부 fetch 캐시 룰 |
| useQuery `schedule` 시그니처 verbatim | line 145~149 (queryFn=scheduleApi.getByMonth(curMonth), staleTime=10_000) | 일정 캐시 룰 |
| scheduleApi 5 호출 사이트 | line 147 (getByMonth) / line 207 (updateStatus) / line 214 (delete) / line 740 (create) / line 980 (update) | API 시그니처 변경 금지 |
| `matchesDate` 룰 verbatim | line 154~162 — 단일 일자는 표시 / 멀티데이는 주말+공휴일 표시 제외 | 핵심 비즈 로직 |
| `dotMap` 룰 verbatim | line 170~181 — 일자별 카테고리 매핑 + matchesDate 적용 | 캘린더 dot 분기 |
| `calDays` 7×6 grid 룰 verbatim | line 183~194 — 시작 dow padding + null padding | 캘린더 셀 배치 |
| `shiftMonth` 함수 verbatim | line 196~199 | 월 네비 |
| `handleStatus` toast 카피 verbatim | line 209 — `status === 'done' ? '완료 처리됐습니다' : '상태 변경됐습니다'` | 토스트 카피 |
| `handleDelete` try/catch + toast 카피 | line 212~220 — `'삭제됐습니다'` / `e?.message ?? '삭제 중 오류가 발생했습니다'` | 토스트 카피 |
| `handlePlanDownload` 호출 verbatim | line 224~235 — `generateMonthlyPlan(y, mo, holidays)` + `'엑셀이 다운로드됐습니다'` / `e?.message ?? '생성 중 오류'` | 외부 함수 시그니처 + 토스트 카피 |
| AddModal toast 카피 4건 | line 713 (`'날짜를 입력하세요'`), line 719 (`'점검 분류를 선택하세요'`), line 729 (`'제목을 입력하세요'`), line 752 (`'저장 실패'`) | 토스트 카피 |
| AddModal.handleSave 5 cat 분기 verbatim | line 712~756 — `inspect` / `elevator` / `fire` / `task` / `event` 분기 + `finalTitle` / `finalInsCat` 룰 + `hasRange ? { end_date: endDate } : {}` | 저장 분기 룰 |
| AddModal onSaved toast verbatim | line 414 — `'일정 추가됨'` | 토스트 카피 |
| EditModal toast 카피 verbatim | line 977 (`'제목을 입력하세요'`), line 983 (`'수정 실패'`), line 424 (`'수정됐습니다'`) | 토스트 카피 |
| EditModal.handleSave 시그니처 | line 976~987 — `scheduleApi.update(item.id, { title: title.trim(), date, time: time \|\| undefined, memo: memo \|\| undefined })` | 저장 시그니처 |
| `SCHED_CATEGORIES` 5종 hex | line 81~87 — `#3b82f6` 점검 / `#eab308` 업무 / `#e2e8f0` 행사 / `#f97316` 승강기 / `#ef4444` 소방 | 카테고리 색 (사용자 선택 hex) |
| `INSP_CATEGORIES` 19종 verbatim | line 35~39 | 점검 분류 native `<select>` 옵션 |
| `INSP_DEFAULTS` 19 entry verbatim | line 41~61 (title + memo 자동 채움) | 점검 분류 자동 입력 |
| `ELEV_SUBCATS` 3종 + `ELEV_AGENCY` map | line 63, 69~73 | 승강기 sub 분류 + 업체 자동 매핑 |
| `FIRE_SUBCATS` 4종 + `FIRE_AGENCY` map | line 64, 74~78 | 소방 sub 분류 + 업체 자동 매핑 |
| `WEEK_DAYS` 7종 | line 96 — `['일','월','화','수','목','금','토']` | 요일 헤더 |
| `PLAN_PREVIEW_ROWS` 21 row | line 99~121 | 월간 점검 계획 테이블 |
| `STATUS_LABEL` 4 status | line 89~94 (verbatim — 예정/진행중/완료/지연) | 상태 칩 라벨 + 색 (verbatim, 인용 cheatsheet §5.1) |
| 외부 fetch `https://holidays.hyunbin.page/basic.json` | line 22 (fetchHolidays) | 공휴일 라이브러리 fallback (memory: feedback_korean_holidays_library_gap.md) |
| `HOLIDAYS_FALLBACK` fallback | line 9 import + line 143 fallback | 한국 공휴일 라이브러리 누락 보강 (memory: feedback_korean_holidays_library_gap.md) |
| `generateMonthlyPlan(y, mo, holidays)` 호출 시그니처 | line 228 | 외부 엑셀 generator |
| `useIsDesktop()` 분기 | line 128, 432 (`if (isDesktop)`) | 모바일/데스크톱 분기 |

**§2.1 인라인 잔존 OK (§10 화이트리스트 — 변경 wave 에서 의도적 잔존):**

- 캘린더 today cell `borderColor: var(--accent)` 2px (line 273 — `border: isSel ? '2px solid #3b82f6'`).
- AddModal 카테고리 cat selected `background: ${c.color}22` (line 791) — JS 변수 동적 hex.
- AddModal elevator/fire sub picker `background: rgba(249,115,22,0.15)` / `rgba(239,68,68,0.13)` (line 852, 882) — alpha 보정.
- 미리보기 테이블 31×21 cell 동적 분기 (line 622~630) — `isWeekend ? ... : text && !row.daily ? rgba(34,197,94,0.1) : transparent` + today border.

---

## §3. Region-by-Region 변환 매핑 (sketch → TSX)

9 region — 변환 wave executor 는 region 단위로 sub-task 분할 권장 (§6 참조).

| Region key | Source line (변환 전 기준) | Sketch ref | 변환 핵심 |
|---|---|---|---|
| `region.page-shell` (모바일 헤더 + 외곽) | line 466~496 (mobile render) | W1 + W6 | 자체 헤더 chrome 통일 (`h-12` raised + 백 버튼 `w-7 h-7` rounded `lucide ChevronLeft` 15px stroke 1.5). 페이지 bg → `bg-surface-page`. 카드 → `bg-surface-raised`. 노안 격상: 헤더 14→18 (text-title). 인라인 padding `12px 16px 24px` → `p-3 px-4 pb-6` 또는 component spacing token. |
| `region.desktop-header` (액션 바 + 엑셀) | line 442~464, 437, 477 | W1 + W6 | 데스크톱 액션 바 우측 액션만. App.tsx 가 페이지 제목 표시. 엑셀 버튼 → W6 LOCKED b) `bg-status-safe-bar` solid (`linear-gradient(135deg,#15803d,#22c55e)` 폐기). lucide `<Download size={13} />`. 노안: 12→14 (text-body-sm). |
| `region.calendar` (월 네비 + 7×6 grid + dot) | line 240~292 | W1 | 월 네비 ‹ / 라벨 / › 만 (W1 OQ #3 LOCKED 제거 — "오늘" 칩 제거). 7×6 grid (`grid-cols-7`). 요일 헤더 `text-[10px]` → `text-caption leading-none`. 일자 셀 동적: today/sel/holiday/weekday dow 분기. dot 3개 max `<span className="w-1 h-1 rounded-full" style={{ background: catInfo(cat)?.color }} />` (W1 OQ #1 LOCKED — 라이트 event dot `#94a3b8` hardcode, 다크 `#e2e8f0`). |
| `region.holiday-label` (공휴일 라벨) | line 294~299 | W1 | 선택 일자가 공휴일이면 라벨 표시. `text-[11px]` → `text-caption` (12px) `text-status-danger-bar font-semibold` (노안 격상). |
| `region.day-cards` (일자 카드 리스트) | line 300~405 | W2 | 상태 칩 색 = W2 OQ #1 LOCKED a) verbatim (예정=text-tertiary / 진행중=accent / 완료=safe / 지연=danger). 카테고리 칩 `${cat?.color}22` 잔존 OK (§10). 멀티데이 = W2 OQ #3 LOCKED b) "5/12 ~ 5/15 (4일)" 시간 자리 텍스트 (제목 옆 칩 / 메타 row 칩 제거). FAB CTA = W2 OQ #2 LOCKED c) 우하단 fixed 56px 원형 `bg-accent` (헤더 inline + 풀폭 버튼 제거 — 단 source 의 데스크톱 헤더 `+ 추가` 버튼은 line 482~485 유지). 액션 버튼 3종 (완료 / 수정 / 삭제) — 완료 = `border-status-safe-bar bg-status-safe-bar/10 text-status-safe-bar`. |
| `region.preview-table` (월간 점검 계획, desktop-only) | line 498~643 | W3 | W3 OQ #1 LOCKED 모바일 미구현 — 데스크톱 전용 (`isDesktop && <MonthlyPlanPreview ... />`). W3 OQ #2 LOCKED b) FAB 표시 안 함. W3 OQ #3 LOCKED a) 1280px cramped 그대로 (31일 폰트 12px). 31×21 cell — `cell-bg-(sun\|sat\|hol\|safe\|today\|today-last)` 6 클래스 환원 또는 §10 인라인 잔존. today border `var(--accent)` 2px 잔존 OK (§10). |
| `region.add-modal` (AddModal) | line 647~963 | W4 | BottomSheet maxHeight 90dvh (W4 OQ #1 LOCKED a — source verbatim). 모달 chrome 통일 (`rounded-t-[20px]` mobile / `rounded-2xl` desktop + `bg-surface-raised`). close X `w-7 h-7` rounded `bg-surface-sunken` border + lucide `<X size={16} />` (노안 14→16). 5 cat 분기 + 시작/종료일 + N일 미리보기 + CTA grid (‹ / 저장 / ›). 저장 버튼 W4 OQ #2 LOCKED b) `bg-accent` solid (`linear-gradient(135deg,#1d4ed8,#2563eb)` 폐기), 노안 14→16. INSP_CATEGORIES 19종 = W4 OQ #3 LOCKED a) native `<select>` 유지. |
| `region.edit-modal` (EditModal) | line 966~1042 | W5 | AddModal chrome 100% mirror (W5 inherit). 카테고리 lock 메타 row 텍스트 = W5 LOCKED b 채택 — "(카테고리는 수정 후에도 변경할 수 없습니다)" 본문 메타 row. empty title 처리 = W5 LOCKED b 채택 — input `border-status-danger-bar` + 아래 작은 라벨 (12px) `'제목을 입력하세요'` (toast 카피 verbatim, line 977). 저장 버튼 = `bg-accent` solid (W4 mirror), 노안 14→16. |
| `region.toast` (13건 사용처) | (위 §2 line list) | W6 | toast.(success\|error) 13 hit verbatim 보존. 메시지 카피 1 byte 도 변경 금지. lucide 도입 위치 (CheckCircle2 / AlertCircle) — toast.success / toast.error 디폴트 아이콘은 react-hot-toast 가 자동 처리하므로 위 핸들러 카피만 그대로 유지. |

**§3.1 추가 처리:**
- 외곽 div (line 434, 468) — 자체 chrome 통일 후 source 의 `background:'var(--bg)'` → `bg-surface-page` 일관.
- 캘린더 컨테이너 `borderRadius:14` → `rounded-md` (12px) 또는 `rounded-[14px]` arbitrary — design-system.md radius 정의 따라 결정.

---

## §4. Verify gates — grep 명령 verbatim (23개)

TSX 변환 wave (Wave 8) executor 가 변환 완료 시점에 실행할 grep + build + 비즈 보존. 모든 명령 worktree 루트 디렉토리 기준.

**§4.1 Negative gates (8개 → 각 0 hits 요구):**

```bash
# 1. 이모지 0건 (단 U+2713 체크 글리프는 본 grep [2600-27BF] 범위에 포함되므로
#    TSX 안에서 사용 시 gate 통과 불가 → lucide <Check size={N} /> 치환 권장)
grep -nP '[\x{1F300}-\x{1FAFF}]|[\x{2600}-\x{27BF}]' cha-bio-safety/src/pages/SchedulePage.tsx

# 2. 9·10·11px 0건 (단 미리보기 테이블 §10 화이트리스트 예외 line ref 명시)
grep -vE '^\s*//' cha-bio-safety/src/pages/SchedulePage.tsx | grep -nE '\b(9|10|11)px\b|fontSize:\s*(9|10|11)\b'

# 3. status- prefix 잘못된 패턴 0건 (text-fire-bar / bg-fire-bar 패턴 X — memory: feedback_tailwind_token_class_pattern)
grep -nE '(text|bg|border)-fire-bar|(text|bg|border)-safe-bar|(text|bg|border)-warning-bar|(text|bg|border)-danger-bar(?![-a-z])|(text|bg|border)-info-bar' cha-bio-safety/src/pages/SchedulePage.tsx

# 4. linear-gradient 0건 (W4 OQ #2 LOCKED b + W6 OQ #1 LOCKED b — 저장/엑셀 버튼 solid 토큰)
grep -nE 'linear-gradient' cha-bio-safety/src/pages/SchedulePage.tsx

# 5. 옛 alias var() 0건
grep -nE 'var\(--(bg|bg2|bg3|bd|bd2|t1|t2|t3|acl|c-day|c-night|c-off|c-leave|safe|warn|danger|info|fire)\)' cha-bio-safety/src/pages/SchedulePage.tsx

# 6. 본문 "오늘" 텍스트 0건 (W1 OQ #3 LOCKED — "오늘" 칩 자체 제거)
#    단 line 351 `selDate === today ? '오늘' : ...` 의 비교 로직은 유지 (오늘 일자일 때 "오늘 일정" 라벨)
#    → 본 grep 은 칩 텍스트 0 만 검증, 비즈 로직은 §9 verify 에서 별도 확인
grep -nE '">오늘<|>오늘<\/' cha-bio-safety/src/pages/SchedulePage.tsx

# 7. 동적 분기 외 raw category hex 0건 (단 SCHED_CATEGORIES 5 hex 정의 line 82~86 / 인라인 동적 잔존 §10 예외)
grep -vE '^\s*//' cha-bio-safety/src/pages/SchedulePage.tsx | grep -nE '#(3b82f6|eab308|e2e8f0|f97316|ef4444|94a3b8|15803d|22c55e|1d4ed8|2563eb)\b'
# 기대: SCHED_CATEGORIES 정의 5 + AddModal/EditModal 동적 분기 외 0 → 잔존 line 정확히 명시

# 8. w-8 h-8 confusion 0건 (close X / 백 버튼 32px 원하면 w-7 h-7 — memory: feedback_tailwind_w8_h8_is_48px)
grep -nE '<(button|div)[^>]*className="[^"]*\bw-8\s+h-8\b' cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: 0 (32px 원하는 element 는 모두 w-7 h-7 또는 w-[32px] h-[32px])
```

**§4.2 Positive gates (10개 → 각 ≥1 hit 요구, 카운트 기재):**

```bash
# 9. surface 토큰 사용
grep -nE 'bg-surface-(page|raised|sunken|active|overlay)' cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: ≥10 hits

# 10. text 토큰 사용
grep -nE 'text-text-(primary|secondary|tertiary|disabled|on-accent|link)' cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: ≥30 hits

# 11. border 토큰 사용
grep -nE 'border-border-(default|strong)' cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: ≥10 hits

# 12. accent 토큰 (캘린더 today / FAB / 저장 버튼)
grep -nE '(bg|text|border)-accent\b' cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: ≥3 hits

# 13. status-safe-bar (엑셀 버튼 + 완료 버튼)
grep -nE '(bg|text|border)-status-safe-bar' cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: ≥2 hits

# 14. status 색 4종 (safe / warning / danger / info)
grep -nE '(text|bg|border)-status-(safe|warning|danger|info)-bar' cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: ≥3 hits

# 15. typography scale 사용
grep -nE 'text-(caption|label|body-sm|body|title|heading|display)' cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: ≥30 hits

# 16. leading-* 룰 적용 (memory: feedback_text_caption_leading_none)
grep -nE 'leading-(none|tight|snug|relaxed)' cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: ≥5 hits

# 17. lucide-react import 6개 (Download / Plus / ChevronLeft / X / CheckCircle2 / AlertCircle)
grep -nE "from 'lucide-react'" cha-bio-safety/src/pages/SchedulePage.tsx
grep -nE '(Download|Plus|ChevronLeft|X|CheckCircle2|AlertCircle)\s*[,}]' cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: import 1 hit + ≥6 별도 사용

# 18. SCHED_CATEGORIES 5 hex 정의 잔존 (NEGATIVE — 변경 금지)
grep -nE "'(inspect|task|event|elevator|fire)'.*#(3b82f6|eab308|e2e8f0|f97316|ef4444)" cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: ≥5 hits (line 82~86)
```

**§4.3 Build gates (2개):**

```bash
# 19. TypeScript check
cd cha-bio-safety && npx tsc --noEmit
# 기대: exit 0 (0 errors)

# 20. Vite build
cd cha-bio-safety && npm run build
# 기대: exit 0
```

**§4.4 비즈 로직 보존 verify (3개 — § 9 와 연결):**

```bash
# 21. useQuery 2 keys + scheduleApi 5 호출 잔존
grep -nE "queryKey:\s*\['(schedule|holidays)'" cha-bio-safety/src/pages/SchedulePage.tsx
grep -nE "scheduleApi\.(getByMonth|create|update|updateStatus|delete)" cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: queryKey 2 hits + scheduleApi 5 hits

# 22. toast.(success|error) 13 hits verbatim (§9.3 baseline)
grep -nE 'toast\.(success|error)' cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: 13 hits (변환 전 13 = 변환 후 13, line list § 2)

# 23. matchesDate + dayCatMap + handlePlanDownload + generateMonthlyPlan + fetchHolidays 함수 시그니처 diff = 0
grep -nE '(matchesDate|dayCatMap|handlePlanDownload|generateMonthlyPlan|fetchHolidays)' cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: ≥10 hits (정의 + 호출)
```

---

## §5. Tailwind class 매핑 cheatsheet (옛 alias → v0.1.1)

**§5.1 색/표면 토큰 1:1 매핑 (≥12 row):**

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
| `var(--safe)` | `text-status-safe-bar` / `bg-status-safe-bar` | `--status-safe-bar` |
| `var(--warn)` | `text-status-warning-bar` / `bg-status-warning-bar` | `--status-warning-bar` |
| `var(--danger)` | `text-status-danger-bar` / `bg-status-danger-bar` | `--status-danger-bar` |
| `var(--info)` | `text-status-info-bar` / `bg-status-info-bar` | `--status-info-bar` |
| `var(--c-day)` | `bg-duty-day` | `--duty-day` |
| `var(--c-night)` | `bg-duty-night` | `--duty-night` |
| `var(--c-off)` | `bg-duty-off` | `--duty-off` |
| `var(--c-leave)` | `bg-duty-leave` | `--duty-leave` |
| inline `fontSize: 9` | `text-caption` (12px) — 노안 격상 | typography |
| inline `fontSize: 10` | `text-caption` (12px) — 노안 격상 | typography |
| inline `fontSize: 11` | `text-caption` (12px) — 노안 격상 | typography |
| inline `fontSize: 12` | `text-caption` (12px) | typography |
| inline `fontSize: 13` | `text-label` (13px) | typography |
| inline `fontSize: 14` | `text-body-sm` (14px) | typography |
| inline `fontSize: 15` | `text-title` (18px) — 노안 격상 | typography |
| inline `fontSize: 16` | `text-body` (16px) | typography |
| inline `fontSize: 18` | `text-title` (18px) | typography |
| `borderRadius: 8` | `rounded-sm` | radius |
| `borderRadius: 10` | `rounded-md` 또는 `rounded-[10px]` | radius (arbitrary 권장) |
| `borderRadius: 12` | `rounded-md` (12px) | radius |
| `borderRadius: 14` | `rounded-[14px]` arbitrary | radius |
| `borderRadius: 16` | `rounded-lg` (16px) | radius |
| `borderRadius: 50%` (dot) | `rounded-full` | radius |

**§5.2 Spacing primitive (4의 배수 직접):**

| 옛 인라인 | Tailwind class | 사용처 |
|---|---|---|
| `padding: 4` | `p-1` (=4px) | 칩 안 |
| `padding: 8` | `p-2` (=8px) | 작은 카드 |
| `padding: 12` | `p-3` (=12px) | 카드 좌우 |
| `padding: 16` | `p-4` (=16px) | 페이지 패딩 (mobile) |
| `padding: 20` | `p-5` (=20px) | BottomSheet 상단 |
| `padding: 24` | `p-6` (=24px) | 데스크톱 페이지 |
| `gap: 2` | `gap-0.5` | dot 사이 |
| `gap: 4` | `gap-1` | flex/grid gap (작은) |
| `gap: 6` | `gap-1.5` | sub picker grid |
| `gap: 8` | `gap-2` | 카드 사이 |
| `gap: 12` | `gap-3` | 데스크톱 컬럼 |
| `gap: 16` | `gap-4` | 모달 내부 row |

**§5.3 Component spacing (자동 분기 — 모바일/데스크톱 token level — 인라인 lg:* 사용 금지):**

| 옛 인라인 | v0.1.1 토큰 | 모바일 / 데스크톱 |
|---|---|---|
| 카드 padding | `--card-padding` | 14 / 10 |
| 카드 내부 gap | `--card-gap` | 8 / 6 |
| 모달 padding | `--modal-padding` | 20 / 24 |
| 섹션 사이 | `--section-gap` | 24 / 32 |
| input height | `--input-height` | 44 / 40 |
| button height | `--button-height` | 44 / 40 |

**§5.4 w-8 h-8 함정 (memory: `feedback_tailwind_w8_h8_is_48px.md`):**

- `cha-bio-safety/tailwind.config.js` 의 `theme.extend.spacing` 에서 `'7': '32px'`, `'8': '48px'` 로 override 됨 (Tailwind 기본 32/40 아님).
- source 의 close X 28×28 (line 774, 1003) — TSX 변환 시 32×32 노안 격상 → `w-7 h-7` 또는 `w-[32px] h-[32px]` (둘 다 32px). `w-8 h-8` 쓰면 48px 사고.
- source 의 백버튼 34×34 (line 1046, iconBtn) → 32×32 노안 통일 → `w-7 h-7`.
- source 의 arrowBtn 32×32 (line 1050) → `w-7 h-7`.
- 변환 wave executor 는 `tailwind.config.js` 의 spacing 정의를 먼저 확인하고 class 선택.

**§5.5 Status / Category / Accent — 절대 섞지 말 것:**

- Status (의미 색): 일정 상태 (예정/진행중/완료/지연), 엑셀 버튼 (안전), 토스트 — `text-status-{safe|warning|danger|info}-bar`.
- Accent (액션 색): 캘린더 today 셀, FAB CTA, 저장 버튼, 데스크톱 `+ 추가` 버튼 — `bg-accent` / `text-accent` / `border-accent`.
- Category (카테고리 색): 5 hex (SCHED_CATEGORIES) — JS 변수 동적 hex (`${cat?.color}22`) → `style` 인라인 잔존 OK (§10).

**§5.6 v0.1.1 Tailwind class 패턴 룰 (memory: `feedback_tailwind_token_class_pattern.md`):**

- status- prefix 없음 — `text-fire-bar` (X 잘못된 가정) / `text-status-fire-bar` (O 정확).
- 정확히는 `text-status-{safe|warning|danger|info|fire}-bar` 가 정확한 v0.1.1 패턴 (위 cheatsheet §5.1 참조).
- 11-div TSX v3 hotfix(4ce707e) 사고 방지 — verify gate §4.1 #3 적용.
- lucide-react 아이콘: `<Icon size={N} />` (className 의 `w-N h-N` 금지) — size prop 만 허용.

---

## §6. Region-별 hand-off (sub-task 분할 권장 — 6 sub-wave)

변환 wave 가 1062 lines atomic 1-shot 으로 끝나기엔 크므로 권장 sub-task (atomic commit 권장):

1. **Sub-task 1 (SW1) — page-shell + 헤더 + 유틸리티 상수 (line 1~135 + 466~496 + 442~464):** import (lucide 6 추가) / localYMD / localYM / fetchHolidays / 19 INSP_CATEGORIES / 19 INSP_DEFAULTS / ELEV_SUBCATS+ELEV_AGENCY / FIRE_SUBCATS+FIRE_AGENCY / SCHED_CATEGORIES / STATUS_LABEL / WEEK_DAYS / PLAN_PREVIEW_ROWS — 100% 그대로. 그 후 모바일 헤더 (line 470~486) + 데스크톱 액션 바 (line 436~442) chrome 통일 (자체 헤더 + 백 버튼 lucide + 엑셀 버튼 `bg-status-safe-bar` solid).
2. **SW2 — 캘린더 grid (line 240~299):** 월 네비 ‹/›/라벨 (W1 OQ #3 — "오늘" 칩 제거), 7×6 grid, dot span (`<span className="w-1 h-1 rounded-full" style={{ background: catInfo(cat)?.color }} />`), 공휴일 라벨 — 라이트 event #94a3b8 hardcode (W1 OQ #1 LOCKED a).
3. **SW3 — 일자 카드 리스트 (line 300~405):** renderCard + scheduleListEl. 상태 칩 색 W2 OQ #1 LOCKED a verbatim, 카테고리 칩 `${cat?.color}22` 인라인 (§10), 액션 3 버튼 (완료/수정/삭제) 토큰화, 멀티데이 시간 자리 텍스트 (W2 OQ #3 LOCKED b), FAB CTA 우하단 56px (W2 OQ #2 LOCKED c).
4. **SW4 — 미리보기 테이블 (line 498~643, desktop-only):** MonthlyPlanPreview 컴포넌트. W3 OQ #1 LOCKED 모바일 미구현, W3 OQ #2 LOCKED b) FAB 없음, W3 OQ #3 LOCKED a) cramped 그대로 (31일 폰트 12px). 31×21 cell — `cell-bg-(sun|sat|hol|safe|today|today-last)` 6 클래스 환원 또는 §10 인라인 잔존.
5. **SW5 — AddModal (line 647~963):** 모달 chrome 통일 (`max-h-[90dvh]` — W4 OQ #1 LOCKED a verbatim) + close X `w-7 h-7` + lucide `<X size={16} />` 노안 격상. 5 cat 분기 grid + 시작/종료일 input + N일 미리보기 텍스트 + CTA grid (‹ / 저장 / ›). 저장 버튼 `bg-accent` solid (W4 OQ #2 LOCKED b — linear-gradient 폐기) + 14→16 노안. INSP_CATEGORIES 19종 native `<select>` (W4 OQ #3 LOCKED a).
6. **SW6 — EditModal (line 966~1042) + 토스트 lucide 도입 + 최종 verify gate + build:** AddModal chrome 100% mirror. 카테고리 lock 메타 row 텍스트 (W5 LOCKED b — `(카테고리는 수정 후에도 변경할 수 없습니다)`). empty title 처리 input `border-status-danger-bar` + 12px 라벨 `'제목을 입력하세요'` (W5 LOCKED b). 저장 버튼 `bg-accent` solid. 마지막 § 4 의 verify gate 23개 모두 PASS + `npx tsc --noEmit` + `npm run build`.

또는 single atomic — 변환 wave executor 의 판단. atomic 시점에 § 4 의 grep gate 23개 모두 PASS 필요.

---

## §7. 비-trivial 변환 케이스

특별 처리 필요한 case (§10 인라인 style 예외 화이트리스트 와 연결):

**§7.1 dot 분기 (line 170~181)** — `dotMap[date]?.slice(0,3)` 의 카테고리 매칭. 모든 5 카테고리에서 발생 가능 → dot span markup:

```tsx
{dots.slice(0, 3).map((cat, ci) => (
  <span
    key={ci}
    className="inline-block w-1 h-1 rounded-full"
    style={{ background: catInfo(cat)?.color ?? 'var(--text-tertiary)' }}
  />
))}
```

라이트 모드 event 카테고리 (color `#e2e8f0`) 은 sketch W1 OQ #1 LOCKED a 에 따라 `#94a3b8` (slate-400) hardcode override — `tailwind.config.js` 또는 sketch CSS 의 light mode override 룰 mirror.

**§7.2 멀티데이 matchesDate (line 154~162)** — 단일 일자 (endDate === date 또는 null) 는 표시 / 멀티데이 범위는 주말+공휴일 표시 제외. 변환 wave executor 는 본 룰을 1 byte 도 바꾸지 않음 (§2 NEGATIVE).

**§7.3 카테고리 selected dynamic alpha hex `${c.color}22`** (line 791, AddModal cat picker) — JS 변수 동적 hex, 정적 Tailwind 불가 → `style` 인라인 잔존 OK (§10 화이트리스트).

**§7.4 INSP_CATEGORIES 19종 native `<select>` 유지 (line 805~808)** — W4 OQ #3 LOCKED a verbatim. grid 칩 변환 안 함 (iOS PWA 키보드 자동 popup 활용).

**§7.5 lucide 도입 위치 (총 6 아이콘):**
- `<Download size={13} />` (line 439, 479 SVG 치환) — 엑셀 다운로드 버튼.
- `<Plus size={14} />` (line 357, 482 텍스트 "+ 추가" 또는 별도 아이콘 — sketch W2 OQ #2 LOCKED c FAB CTA 56px 안에서도 사용).
- `<ChevronLeft size={15} strokeWidth={1.5} />` (line 472 SVG 치환) — 모바일 자체 헤더 백버튼.
- `<X size={16} />` (line 775, 1004 SVG 치환) — AddModal / EditModal close (14→16 노안 격상).
- `<CheckCircle2 size={N} />` / `<AlertCircle size={N} />` — react-hot-toast 가 기본 처리하므로 명시 도입은 선택. 별도 위치에서 일정 카드 상태 칩에 도입 시 (예: 완료 칩) 권장.

**§7.6 31×21 cell-bg-* 6 클래스 환원 (W3 sketch)** — 미리보기 테이블 cell 동적 분기 (line 622~630):
- `cell-bg-sun` (일요일 cell bg)
- `cell-bg-sat` (토요일 cell bg)
- `cell-bg-hol` (공휴일 cell bg)
- `cell-bg-safe` (점검 일자 cell bg = `rgba(34,197,94,0.1)`)
- `cell-bg-today` (오늘 cell 좌우 border)
- `cell-bg-today-last` (오늘 cell 마지막 행 bottom border)

→ 변환 wave executor 는 위 6 클래스를 `tailwind.config.theme.extend.backgroundColor` 추가 또는 인라인 style 잔존 (§10 화이트리스트) 중 선택.

**§7.7 자체 헤더 chrome 통일** — source 와 다름. sketch W1 + W6 + chrome 통일 룰 (`cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md`):
- height: `h-12` (48px) — source 의 `padding:'8px 12px 9px'` 폐기.
- bg: `bg-surface-raised`.
- 백 버튼: `w-7 h-7` rounded `border-border-default bg-surface-sunken` + lucide `<ChevronLeft size={15} strokeWidth={1.5} />`.
- 라벨: `text-title font-bold text-text-primary` (노안 14→18 격상).

**§7.8 dot span 추가** (memory: `feedback_tsx_wave_emoji_dot_gap.md`) — alias sed-replace 만 하지 말고 dot span markup 도 verify. 본 page 는 캘린더 dot (line 283~287) + 미리보기 테이블 cell 의 "." (line 631) 두 위치. § 4 positive gate (rounded-full 카운트) 에서 검증.

**§7.9 leading-none** (memory: `feedback_text_caption_leading_none.md`) — 작은 컨테이너 (h-7 = 32px / 칩 / 일자 셀 등) 안 `text-caption` (lh 1.5 = 18px) 은 시각적 패딩 유발 → `leading-none` 명시. 캘린더 일자 셀 안 dot row / 카드 안 상태 칩 / 카테고리 칩 / 공휴일 라벨에 적용. verify gate § 4.2 #16 에서 ≥5 hits 요구.

**§7.10 planner verbatim quote rule** (memory: `feedback_planner_prompt_sketch_verbatim.md`) — 변환 wave executor 가 sketch 의 CSS 정의를 grep 으로 추출해 그대로 인용. 추측한 토큰명/사이즈는 deviation 유발 (03-qr-scan 6건 사례).

---

## §8. W1~W6 LOCKED 결정 인용표 (16 LOCKED, verbatim)

본 표는 sketch wave 1~6 의 LOCKED 결정 박제. 변환 wave executor 는 1 byte 도 바꾸지 않음.

| Wave | OQ ID | 결정 | 적용 위치 |
|---|---|---|---|
| W1 | #1 LOCKED a) | 라이트 모드 event dot 색 = `#94a3b8` (slate-400). 다크는 `#e2e8f0` verbatim 유지. | 캘린더 dot span (line 283~287) — light theme override |
| W1 | #2 LOCKED 유지 | 멀티데이 범위 표시는 source 그대로 일자 셀당 dot 만 (matchesDate 룰 mirror). band 추가 안 함. | dotMap (line 170~181) + 미리보기 테이블 cell |
| W1 | #3 LOCKED 제거 | "오늘" 칩 자체 제거. 월/연도 네비는 ‹ / 라벨 / › 만 (네비게이션 단순화). | 캘린더 헤더 (line 241~247) — line 351 의 `selDate === today ? '오늘' : ...` "오늘 일정" 라벨 비교 로직만 유지 (칩 0) |
| W2 | #1 LOCKED a) | 상태 칩 색 = SchedulePage.tsx line 89~94 verbatim (예정=`text-tertiary` / 진행중=`accent` / 완료=`safe` / 지연=`danger`). | renderCard 안 status 칩 (line 320) |
| W2 | #2 LOCKED c) | add CTA = FAB (우하단 fixed 56px 원형 `bg-accent`). 헤더 inline + 리스트 위 풀폭 버튼 제거. | 모바일 FAB 추가, 단 source line 482~485 데스크톱 헤더 `+ 추가` 버튼은 유지 (sketch W3 mirror) |
| W2 | #3 LOCKED b) | 멀티데이 범위 표시 = 시간 자리 텍스트 "5/12 ~ 5/15 (4일)". 제목 옆 칩 / 메타 row 칩 제거. | renderCard 안 시간 row (line 325) — source 의 시계 글리프 (U+1F550) + `{item.time}` 위치에 멀티데이 텍스트. 시계 글리프는 lucide `<Clock size={10} />` 또는 텍스트 prefix 로 치환 (executor 판단, OQ #2 lucide 도입 범위 일관) |
| W3 | #1 LOCKED 모바일 미구현 | 미리보기 테이블 = 데스크톱 전용. SchedulePage.tsx 466~496 모바일 render 와 일치 (mobile 은 calendarEl + scheduleListEl 만). | MonthlyPlanPreview (line 446) — `if (isDesktop)` 분기 안 |
| W3 | #2 LOCKED b) | 미리보기 페이지에서 FAB 표시 안 함. 헤더 `+ 추가` 버튼은 유지. | 데스크톱 액션 바 (line 436~442) — 엑셀 버튼만, `+ 추가` 는 일정 리스트 헤더 line 357 |
| W3 | #3 LOCKED a) | 데스크톱 1280px 셀 폭/폰트 = cramped 그대로 (31일 폰트 12px, 1~2글자 노출). 실제 운영 환경 일치. | MonthlyPlanPreview cell `fontSize: 10~11` (line 529~531, 595, 623) |
| W4 | #1 LOCKED a) | 모바일 BottomSheet maxHeight = `90dvh` source verbatim. | AddModal `maxHeight:'90dvh'` (line 766) + EditModal `maxHeight:'90dvh'` (line 997) |
| W4 | #2 LOCKED b) | 저장 버튼 색 = `bg-accent` solid (`var(--accent)`, 디자인 시스템 토큰 일관, 라이트/다크 자동 분기). source `linear-gradient(135deg,#1d4ed8,#2563eb)` 폐기. | AddModal 저장 버튼 (line 946~952) + EditModal 저장 버튼 (line 1031~1037) |
| W4 | #3 LOCKED a) | INSP_CATEGORIES 19종 입력 = `<select>` native source verbatim 유지 (iOS PWA 키보드 자동 popup 활용). | AddModal 점검 분류 select (line 805~808) |
| W5 | (b 채택, OQ #1) | 카테고리 lock 메타 row 텍스트 — "(카테고리는 수정 후에도 변경할 수 없습니다)". | EditModal 카테고리 lock 메타 row (line 1010 이전 row) |
| W5 | (b 채택, OQ #2) | empty title 처리 = `input border-status-danger-bar` + 아래 작은 라벨 12px "제목을 입력하세요" (toast.error line 977 verbatim mirror). | EditModal title input (line 1011~1013) |
| W6 | #1 LOCKED b) | 엑셀 버튼 색 = `bg-status-safe-bar` solid (디자인 토큰 일관, W4 OQ #2 LOCKED b 패턴 mirror). source `linear-gradient(135deg,#15803d,#22c55e)` 폐기. | 데스크톱 엑셀 버튼 (line 437~441) + 모바일 엑셀 버튼 (line 477~481) |
| Aging | 노안 격상 (W4+W5+W6 공통) | 헤더 15→18 (`text-title`) / 저장 14→16 (`text-body`) / close X 28→32 + lucide 14→16 / fire grid 10→12. | source line 772 (헤더 15→18), 949 / 1034 (저장 14→16), 774 / 1003 (close 28→32), 880 (fire 10→12) |

---

## §9. 비즈니스 로직 보존 verify

변환 후 보존 확인 grep (각 명령 → baseline 카운트 일치):

```bash
# §9.1 useQuery 2 keys (각 ≥1)
grep -nE "useQuery\(\{[^}]*queryKey:\s*\['(holidays|schedule)'" cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: 2 hits (line 137~143 holidays / 145~149 schedule)

# §9.2 scheduleApi 5 호출 (각 ≥1)
grep -nE "scheduleApi\.(getByMonth|create|update|updateStatus|delete)" cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: 5 hits

# §9.3 toast.* 13 hits verbatim Korean
grep -nE "toast\.(success|error)\('([^']+)'" cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: 13 hits — 카피 verbatim:
#   '완료 처리됐습니다' / '상태 변경됐습니다' (line 209)
#   '삭제됐습니다' (line 216) / '삭제 중 오류가 발생했습니다' (line 218)
#   '엑셀이 다운로드됐습니다' (line 229) / '생성 중 오류' (line 231)
#   '일정 추가됨' (line 414) / '수정됐습니다' (line 424)
#   '날짜를 입력하세요' (line 713) / '점검 분류를 선택하세요' (line 719) / '제목을 입력하세요' (line 729) / '저장 실패' (line 752)
#   '제목을 입력하세요' (line 977) / '수정 실패' (line 983)
#   = 13 hits 변환 전 = 변환 후

# §9.4 필수 함수 호출 (각 ≥1)
grep -nE "(matchesDate|dotMap|calDays|shiftMonth|handleStatus|handleDelete|handlePlanDownload|catInfo|fetchHolidays|generateMonthlyPlan)" cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: ≥20 references (정의 + 호출)

# §9.5 외부 fetch URL 잔존
grep -nE "https://holidays\.hyunbin\.page/basic\.json" cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: 1 hit (line 22)

# §9.6 핵심 함수/상수 잔존
grep -nE "(HOLIDAYS_FALLBACK|INSP_CATEGORIES|INSP_DEFAULTS|ELEV_SUBCATS|ELEV_AGENCY|FIRE_SUBCATS|FIRE_AGENCY|SCHED_CATEGORIES|STATUS_LABEL|WEEK_DAYS|PLAN_PREVIEW_ROWS)" cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: 모두 잔존

# §9.7 useIsDesktop() 분기
grep -nE "useIsDesktop\(\)|isDesktop" cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: 변환 전과 동일 카운트

# §9.8 hasRange end_date 분기 (AddModal)
grep -nE "hasRange|end_date:\s*endDate" cha-bio-safety/src/pages/SchedulePage.tsx
# 기대: ≥2 hits (line 735~748)
```

---

## §10. 인라인 style 예외 화이트리스트 (≥4 위치)

Tailwind 으로 표현 안 되거나 안 하는 게 나은 case (style 잔존 OK). 각 인스턴스는 line ref + 사유 inline 명시.

| 케이스 | Source line (변환 전 기준) | 사유 |
|---|---|---|
| 캘린더 today cell `borderColor: var(--accent)` 2px | line 273 — `border: isSel ? '2px solid #3b82f6' : '2px solid transparent'` | 동적 border 색 + 두께 — Tailwind 분기 가능하지만 인라인 잔존도 OK (가독성) |
| 카테고리 cat selected 동적 alpha hex | line 791 — `background: cat===c.value ? \`${c.color}22\` : 'var(--bg3)'` | JS 변수 동적 hex (5 카테고리 hex × alpha 22) — 정적 Tailwind 불가 |
| 카테고리 칩 alpha hex (renderCard) | line 311 — `background: \`${cat?.color}22\`` | JS 변수 동적 hex |
| AddModal elevator sub picker | line 852 — `background: elevSub===v ? 'rgba(249,115,22,0.15)' : 'var(--bg3)'` | alpha 0.15 보정 |
| AddModal fire sub picker | line 882 — `background: fireSub===v ? 'rgba(239,68,68,0.13)' : 'var(--bg3)'` | alpha 0.13 보정 |
| 미리보기 테이블 31×21 cell 동적 분기 | line 622~630 — `isWeekend ? (dow===0 \|\| isHol ? 'rgba(239,68,68,0.06)' : 'rgba(59,130,246,0.06)') : text && !row.daily ? 'rgba(34,197,94,0.1)' : 'transparent'` | 8중 분기 + alpha 0.06/0.1 — 정적 Tailwind 불가 또는 `cell-bg-*` 6 클래스 환원 (§7.6) |
| 미리보기 테이블 today border | line 627~629 — `borderLeft / borderRight / borderBottom: isTdy ? '2px solid var(--accent)' : undefined` | 동적 border 분기 — Tailwind 가능하지만 인라인 잔존도 OK |
| 미리보기 테이블 header today bg | line 557 — `background: isTdy ? 'rgba(59,130,246,0.18)' : ...` | alpha 0.18 보정 |
| 캘린더 일자 셀 selected bg | line 272 — `background: isSel ? 'rgba(59,130,246,0.15)' : 'transparent'` | alpha 0.15 보정 |
| 캘린더 일자 셀 today 원형 bg | line 279 — `background: isToday && !isSel ? 'var(--acl)' : 'transparent'` | 동적 분기 |
| dot 색 동적 | line 285 — `background: catInfo(cat)?.color ?? 'var(--t3)'` | JS 변수 동적 hex (5 카테고리) |

**0회 강제 (linear-gradient 완전 폐기):**
- `linear-gradient` 0 hit (verify gate §4.1 #4) — W4 OQ #2 LOCKED b 저장 버튼 + W6 OQ #1 LOCKED b 엑셀 버튼 모두 토큰 solid.
- `style={{ background: 'linear-gradient(...)' }}` 0 hit.

변환 wave executor 는 위 케이스 외 모든 인라인 style 제거. 새 예외 발견 시 본 §10 에 line ref 추가.

---

## §11. 변환 후 사용자 검수 흐름 (워크트리 룰 inherit)

1. TSX 변환 wave executor 가 atomic commit (또는 region 별 commit, §6 권장 sub-task 6 분할).
2. `npx tsc --noEmit` PASS — 0 errors.
3. `npm run build` PASS — exit 0.
4. § 4 의 verify gate 23개 모두 PASS — 출력 capture 후 결과 보고.
5. 사용자 검수:
   - 모바일 (393px frame) — Chrome DevTools 또는 실기기.
   - 데스크톱 (1280px frame).
   - 다크 모드 + 라이트 모드 양 환경.
   - 핵심 region 인터랙션 (캘린더 셀 클릭 / AddModal 5 cat / EditModal lock 메타 row / 엑셀 다운로드 / 미리보기 테이블).
6. 사용자 컨펌 후 main 머지 (memory: `project_redesign_workflow` — `redesign/13-schedule` 브랜치 → main).
7. `cbc7119-preview.pages.dev` 자동 배포 (GitHub Actions).
8. 직원 도메인 (`cbc7119.pages.dev`) 영향 0 — 본 워크트리는 디자인 격리 (memory: `project_cbc7119_design_repo` + `reference_cbc7119_domain`).
9. **wrangler 명령 절대 금지** (memory: `feedback_cbc7119_design_never_wrangler.md`) — 디자인 wave 중 `wrangler --project-name=cbc7119` 시도 0건. `.claude/settings.local.json` deny 로 강제됨.
10. **`npm run deploy` 금지** — 직원 도메인으로 가는 경로.

---

## §12. Open questions (TSX 변환 wave 시작 전 결정 필요)

체크박스 형식. 변환 wave (Wave 8) executor 가 시작 전 사용자에게 컨펌.

- [ ] **OQ #1**: 단일 atomic commit vs 6 sub-wave 분할 commit — 1062 lines 크기 고려. **default: b) 6 sub-wave 분할** (sub-task 별 grep checkpoint § 8 mirror, 사용자 검수 단순). 단일 atomic 도 가능 (executor 판단).
- [ ] **OQ #2**: lucide 도입 범위 — a) 모두 lucide (Download / Plus / ChevronLeft / X / CheckCircle2 / AlertCircle 6개 모두) vs b) SVG 잔존 + lucide 일부 (close X 만 lucide). **default: a) 모두 lucide** (verify gate § 4.2 #17 — lucide import + ≥6 사용).
- [ ] **OQ #3**: 미리보기 desktop-only 분기 implementation — a) source `isDesktop && <MonthlyPlanPreview ... />` verbatim 유지 vs b) MonthlyPlanPreview 컴포넌트 안 `if (!isDesktop) return null` 추가. **default: a) source verbatim** (W3 OQ #1 LOCKED 모바일 미구현 mirror).
- [ ] **OQ #4**: INSP_CATEGORIES native `<select>` vs grid 칩 재확인 — W4 OQ #3 LOCKED a 에서 이미 native `<select>` 결정. **default: W4 LOCKED a 유지** (재확인 불필요, iOS PWA 키보드 자동 popup 활용).

---

**End of W7 checklist.**

> 변환 wave (Wave 8) executor 는 본 checklist + sketch-wave-1~6.html + SchedulePage.tsx (1062 lines) + design-system.md + tokens.css + typography.css 만 input 으로 atomic 변환 가능.
> 12-staff-service W10 (`cha-bio-safety/docs/redesign-context/12-staff-service/sketch/10-tsx-conversion-checklist.md`, 436 lines) 패턴 mirror — 동일 구조, 13-schedule 컨텍스트 재작성.
