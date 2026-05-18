---
title: "12-staff-service — W10 TSX 변환 verify checklist"
status: draft
created: 2026-05-18
source_tsx: cha-bio-safety/src/pages/StaffServicePage.tsx
source_lines: 1552
sketches_referenced: [W1, W2, W3, W4, W5, W6, W7, W8, W9]
verify_gate_count: 22
consumed_by: TSX 변환 wave executor (별도 quick task)
---

# W10 — TSX 변환 verify checklist (12-staff-service)

> 본 파일은 **sketch 아님**. TSX 변환 wave executor 가 1-pass 로 적용할 verify gate + region mapping 박제 markdown.
> source-of-truth: UI-SPEC.md §10 NEGATIVE scope + sketch W1~W9 + tokens.css + typography.css.

---

## §1. 목적 + Scope

**§1.1 본 checklist 의 위치:**
- W10 은 sketch HTML 9개 (W1~W9) 와 같은 wave 시리즈의 마지막 산출물이지만 sketch 가 아닌 markdown checklist.
- TSX 변환 wave executor 가 본 checklist + sketch 9개 + UI-SPEC.md + tokens.css + typography.css 만 input 으로 읽고 atomic 변환 가능해야 함.

**§1.2 변환 대상:**
- `cha-bio-safety/src/pages/StaffServicePage.tsx` — 현재 1552 lines.
- 변환 후 예상: 약 1200~1400 lines (옛 인라인 style 약 60건 제거 + Tailwind class 치환 + dot span 등 markup 추가).

**§1.3 본 checklist 자체 룰 (self-applied negative gate):**
- 이모지 0건 — U+2713 (체크 문자) 도 본 checklist 본문 안에서는 텍스트 표기 `U+2713` 로만 등장 (실제 글리프 사용 금지).
- ≥250 lines (comprehensive).
- 모든 9 region 명시.
- grep 명령 verbatim ≥20.

**§1.4 변환 wave executor 가 따라야 할 메모리 룰 (모두 본 checklist 안에 inline 인용):**
- `feedback_tailwind_token_class_pattern` — status- prefix 없음, lucide size prop.
- `feedback_tailwind_w8_h8_is_48px` — w-8 = 48px 함정 (tailwind.config.js).
- `feedback_planner_prompt_sketch_verbatim` — sketch CSS 정의 grep 추출 후 그대로 인용.
- `feedback_tsx_wave_emoji_dot_gap` — 이모지 0 + dot span 추가 markup 검증.
- `feedback_text_caption_leading_none` — 작은 컨테이너 안 text-caption 은 leading-none 명시.

---

## §2. NEGATIVE scope (변경 금지) — UI-SPEC §10 verbatim 10 items

UI-SPEC.md `§10. Preserved Business Logic (NEGATIVE scope — 변경 금지)` 의 모든 항목은 본 변환에서 1 byte 도 바꾸지 않는다. git diff 에 잡히면 안 됨.

| 항목 | Source / 좌표 | 사유 |
|---|---|---|
| PDF 좌표 `lp[0..16]` 17개 | `src/utils/generateLeaveRequest.ts` 1:1 / `StaffServicePage.tsx` line 159~177 | 회사 양식 정합 — 회사 HWP→PDF 변환된 양식에 좌표 오버레이 |
| `calcLeaveQuota(staffId)` | `StaffServicePage.tsx` line 25~37 | 입사일 기반 quota 룰 |
| `HIRE_DATES` 4명 | line 18~23 | 데이터 그대로 |
| `calcProvidedMeals` / `calcWeekendAllowance` | `src/utils/mealCalc.ts` import | 식대 5500원/끼 + 공휴일직후토요일 보정 (memory: project_meal_calc_rules) |
| `HOLIDAYS_FALLBACK` | `src/utils/holidays.ts` import | 한국 공휴일 라이브러리 누락 보강 (memory: feedback_korean_holidays_library_gap) |
| `isBlocked(ymd)` 차단 룰 | line 484~ | 팀원연차/소방점검/승강기검사 차단 |
| React Query keys 6종 | `['leaves' / 'leaves-year' / 'meals' / 'schedule' / 'holidays' / 'menu']` | staleTime / enabled 흐름 보존 |
| useMutation flows | `leaveApi.create/delete` / `mealApi.upsert` / `menuApi.create` | mutation 흐름 그대로 |
| 모바일/데스크톱 분기 | `useIsDesktop()` 훅 호출 | UX 자체 변경 금지 |
| PDF 식단표 분석 | `handleMenuUpload` 안 pdfjsLib 호출 | 알고리즘 그대로 |

**§2.1 UI-SPEC §10.1 verbatim 추가 보존 (인라인 잔존 OK — §10 화이트리스트):**

- 오버레이 span 의 `font-size: 10` + `color: #111` + `font-family: 'Noto Sans KR'` 인라인.
- 체크박스 사각형 `width: 12, height: 12, background: #000` (= `w-3 h-3 bg-black` 12px 정사각형).
- A4 미리보기 `max-width: 595px`.
- `/templates/leave_request_preview.png` 경로.
- `getCellInfo` 우하단 텍스트 포맷 (`{성+휴가코드} {소검} {승검}`).
- `SHIFT_OFFSETS` / `getRawShift` / `DOW_KO` / `SHIFT_COLOR` 근무 calc.
- 휴가 PDF.js workerSrc, `/api/uploads` 경로.

---

## §3. Region-by-Region 변환 매핑 (sketch → TSX)

9 region — 변환 wave executor 는 region 단위로 sub-task 분할 권장 (§6 참조).

| Region key | Source line (변환 전 기준) | Sketch ref | 변환 핵심 |
|---|---|---|---|
| `region.app-chrome` | 외곽 div (line 1~280 import / 1280~end 최외곽 wrapper) | W1 + W6 | GlobalHeader 54px 자리 + BottomNav 모바일만. 인라인 padding → `p-4` (mobile) / `p-6` (desktop). 페이지 bg → `bg-surface-page`. 카드 → `bg-surface-raised`. |
| `region.calendar` | line 681~798 (calendarGrid JSX) | W2 + W6 | 7×6 grid. aspect-ratio: `aspect-square` (mobile) / `aspect-[1.2]` (desktop). duty color → `bg-duty-{night,off,day,leave}`. 셀 안 텍스트 → `text-caption leading-none`. 휴가 카테고리 hex (LEAVE_BG) 는 동적 → `style` 잔존 OK (§10). |
| `region.legend` | line 800~824 | W3 | 11 dots 가로 (status + duty + 휴가). dot pattern: `<span className="inline-block w-[3px] h-[3px] rounded-full bg-status-{x}-bar" />` (§7.7). text → `text-label leading-none`. |
| `region.summary-cards` | line 826~840 | W3 | 4종 Stat Card. 좌측 3px 색바 → `border-l-[3px] border-status-{safe,warning,danger,info}-bar`. 큰 숫자 → `text-display text-text-primary`. 라벨 → `text-label text-text-secondary`. §6.3 위험 임계치 색 분기 룰 적용 (위험 임계치 아닌 카드는 status 색 금지). |
| `region.menu-cards` | line 842~1018 | W4 | 식단 3종 (중식 A/B/석식). 카테고리 hex (#42d778, #d78042 등) → `style` 인라인 잔존 OR `tailwind.config.theme.extend.colors` 추가 후 class (OQ6). PDF 업로드 dropzone → `region.menu-upload` 분리, 데스크톱 `py-12` / 모바일 `py-3` (§10 예외). |
| `region.bottomsheet` | line 1293~1549 | W5 | overlay → `bg-surface-overlay`. container `max-h-[65vh]` (§10 예외). drag-handle 36×4 (§10 예외). 헤더+휴가폼+팀원+주말식대+닫기. 입력 height `h-11` (mobile 44) / `h-10` (desktop 40 — `useIsDesktop` 토큰 자동 분기). |
| `region.desktop-3panel` | line 1020~1276 | W6 | flex layout: 좌(달력+범례+요약+식단+업로드) / 중(280px 폼) / 우(595px PDF). border-r between. lg:* 는 layout 분기만 허용 (lg:flex, lg:hidden OK / lg:px-, lg:py- 금지). |
| `region.desktop-center-form` | line 1041~1223 | W7 | 휴가신청서 폼 (DOC_LEAVE_GRID 7행). input height 40 (`--input-height` token 자동 분기). 액션 3종 버튼 (휴가 신청 / PDF 다운로드 / 인쇄). 비활성 = `disabled:opacity-50`. |
| `region.desktop-pdf-preview` | line 1225~1273 | W8 | A4 max-w-[595px]. lp[0..16] overlay 17 instance — `style={{ left: %, top: % }}` 잔존 OK (§10). 오버레이 span 의 font-size:10/color:#111 인라인 OK. |

**§3.1 추가 처리:**
- detailPanel dead code (UI-SPEC §14 OQ #2) — 변환 wave 에서 grep 으로 사용처 확인 후 제거 또는 보존 결정 (§12 OQ4).

---

## §4. Verify gates — grep 명령 verbatim (22개)

TSX 변환 wave executor 가 변환 완료 시점에 실행할 grep. 모든 명령 worktree 루트 디렉토리 기준.

**§4.1 Negative gates (각 명령 → 0 hits 요구):**

```bash
# 1. 인라인 style 0건 (예외 §10 화이트리스트 외)
grep -nE 'style=\{\{' cha-bio-safety/src/pages/StaffServicePage.tsx

# 2. 옛 alias 토큰 0건
grep -nE 'var\(--(bg|bg2|bg3|bd|bd2|t1|t2|t3|acl|c-day|c-night|c-off|c-leave)\)' cha-bio-safety/src/pages/StaffServicePage.tsx

# 3. 이모지 0건 (단 U+2713 체크 글리프는 본 grep 의 [2600-27BF] 범위에 포함되므로
#    TSX 안에서 U+2713 plain text 를 쓰려면 본 gate 를 통과시키기 위해 lucide <Check size={N} />
#    아이콘으로 치환 권장 — §12 OQ2)
grep -nP '[\x{1F300}-\x{1FAFF}]|[\x{2600}-\x{27BF}]' cha-bio-safety/src/pages/StaffServicePage.tsx

# 4. lg:* spacing 분기 0건 (layout 분기만 허용, spacing 은 token auto-branch)
grep -nE 'lg:(px|py|p|gap|space|m|mx|my)-' cha-bio-safety/src/pages/StaffServicePage.tsx

# 5. 인라인 fontSize 0건
grep -nE 'fontSize:\s*[0-9]+' cha-bio-safety/src/pages/StaffServicePage.tsx

# 6. 9·10·11px hard-coded 0건 (단 PDF overlay font-size: 10 예외 — line ref 명시)
grep -vE '^\s*//' cha-bio-safety/src/pages/StaffServicePage.tsx | grep -nE '\b(9|10|11)px\b'

# 7. status- prefix 잘못된 패턴 0건 (text-fire-bar O / text-status-fire-bar X — memory)
grep -nE 'text-status-fire|bg-status-fire(?!-)' cha-bio-safety/src/pages/StaffServicePage.tsx

# 8. lucide w-N h-N class 0건 (size prop 만 허용 — memory)
grep -nE '<(Calendar|ChevronLeft|ChevronRight|Check|X|Upload|Plus|Minus|Trash|FileText|Printer|Loader)[^>]*className="[^"]*w-\d' cha-bio-safety/src/pages/StaffServicePage.tsx

# 9. 옛 hex 인라인 0건 (단 PDF 좌표 / 동적 카테고리 hex 예외 — §10 화이트리스트)
grep -nE '#(22c55e|a855f7|f97316|ef4444|ec4899|6366f1|f59e0b|2563eb|3b82f6)' cha-bio-safety/src/pages/StaffServicePage.tsx
```

**§4.2 Positive gates (각 명령 → ≥1 hit 요구):**

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

# 13. status 색 사용 (safe / warning / danger / info)
grep -nE 'text-status-(safe|warning|danger|info)|bg-status-(safe|warning|danger|info)' cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: ≥4 hits

# 14. duty 색 4종 모두 사용 (shift 칩)
grep -nE 'bg-duty-(night|off|day|leave)' cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: ≥4 hits (4 token 각 ≥1)

# 15. typography scale 사용
grep -nE 'text-(caption|label|body-sm|body|title|heading|display)' cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: ≥15 hits

# 16. leading-* 룰 적용 (작은 컨테이너 안 text-caption — memory: feedback_text_caption_leading_none)
grep -nE 'leading-(none|relaxed|snug|tight)' cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: ≥5 hits

# 17. lucide-react import 존재
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

**§4.3 Build gates:**

```bash
# 21. TypeScript check
cd cha-bio-safety && npx tsc --noEmit
# 기대: exit 0

# 22. Vite build
cd cha-bio-safety && npm run build
# 기대: exit 0
```

---

## §5. Tailwind class 매핑 cheatsheet (옛 alias → v0.1.1)

**§5.1 색/표면 토큰 1:1 매핑:**

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
| `var(--info)` | `text-status-info-bar` 또는 `bg-status-info-bar` | 정보 |
| `var(--safe)` | `text-status-safe-bar` 또는 `bg-status-safe-bar` | 안전 |
| `var(--warn)` | `text-status-warning-bar` 또는 `bg-status-warning-bar` | 주의 |
| `var(--danger)` | `text-status-danger-bar` 또는 `bg-status-danger-bar` | 위험 |
| `var(--fire)` | `text-status-fire-bar` 또는 `bg-status-fire-bar` | UI-SPEC §3.4.1 의 사용 없음 룰 — 본 페이지에서 0건 |
| `var(--c-day)` | `bg-duty-day` | 주간 |
| `var(--c-night)` | `bg-duty-night` | 당직 |
| `var(--c-off)` | `bg-duty-off` | 비번 |
| `var(--c-leave)` | `bg-duty-leave` | 휴 |
| `var(--radius-sm)` (8px) | `rounded-sm` | input, button, sub-card |
| `var(--radius-md)` (12px) | `rounded-md` | 표준 카드 |
| `var(--radius-lg)` (16px) | `rounded-lg` | 모달, 큰 panel |
| `var(--radius-pill)` (99px) | `rounded-full` 또는 `rounded-[99px]` | 캡슐 배지, 칩 |

**§5.2 Spacing primitive (4의 배수 직접):**

| 옛 인라인 | Tailwind class | 사용처 |
|---|---|---|
| `padding: 4` | `p-1` (=4px) | 칩 안 |
| `padding: 8` | `p-2` (=8px) | 작은 카드 |
| `padding: 12` | `p-3` (=12px) | 카드 좌우 |
| `padding: 16` | `p-4` (=16px) | 페이지 패딩 (mobile) |
| `padding: 20` | `p-5` (=20px) | BottomSheet 상단 |
| `padding: 24` | `p-6` (=24px) | 데스크톱 페이지 |
| `gap: 4` | `gap-1` | flex/grid gap |
| `gap: 8` | `gap-2` | |
| `gap: 12` | `gap-3` | |
| `gap: 16` | `gap-4` | |
| `gap: 24` | `gap-6` | |

**§5.3 Component spacing (자동 분기 — 모바일/데스크톱 token level — 인라인 lg:* 사용 금지):**

| 옛 인라인 | v0.1.1 토큰 | 모바일 / 데스크톱 |
|---|---|---|
| 카드 padding | `--card-padding` | 14 / 10 |
| 카드 내부 gap | `--card-gap` | 8 / 6 |
| 모달 padding | `--modal-padding` | 20 / 24 |
| 섹션 사이 | `--section-gap` | 24 / 32 |
| input height | `--input-height` | 44 / 40 |
| button height | `--button-height` | 44 / 40 |

**§5.4 w-8 h-8 함정 (memory: `feedback_tailwind_w8_h8_is_48px`):**

- `cha-bio-safety/tailwind.config.js` 의 `theme.extend.spacing` 에서 `'7': '32px'`, `'8': '48px'` 로 override 됨 (Tailwind 기본 32/40 아님).
- 백버튼 32px 원하면 → `w-7 h-7` 또는 명시 arbitrary `w-[32px] h-[32px]`.
- `w-8 h-8` 을 32px 라고 가정하면 1.5배 사고 (참고 사고: 11-div 백버튼 54a1c8d).
- 변환 wave executor 는 `tailwind.config.js` 의 spacing 정의를 먼저 확인하고 class 선택.

**§5.5 Status / Duty / 카테고리 색 — 절대 섞지 말 것:**

- Status (의미 색): 점검 결과 안전/주의/위험, 진행률 임계치, 토스트 — `bg-status-{safe,warning,danger,info}-bar`.
- Duty (근무 색): 주/당/비/휴 shift 칩 전용 — `bg-duty-{day,night,off,leave}`.
- 카테고리 (휴가 11종): 동적 hex (`LEAVE_BG[lt]`) 인라인 style 잔존 (§10 화이트리스트).
- 식단 카테고리 (A/B/석식): `#42d778` 등 카테고리 hex 직접 또는 tailwind config 추가 후 class.

**§5.6 v0.1.1 Tailwind class 패턴 룰 (memory: `feedback_tailwind_token_class_pattern`):**

- status- prefix 없음 — `text-fire-bar` (O) / `text-status-fire-bar` (X)는 잘못된 가정.
- 정확히는 `text-status-{safe|warning|danger|info|fire}-bar` 가 정확한 v0.1.1 패턴 (위 cheatsheet §5.1 참조).
- 11-div TSX v3 hotfix(4ce707e) 사고 방지 — verify gate §4.1 #7 적용.
- lucide-react 아이콘: `<Icon size={N} />` (className 의 `w-N h-N` 금지) — verify gate §4.1 #8 적용.

---

## §6. Region-별 hand-off (sub-task 분할 권장)

변환 wave 가 1552 lines atomic 1-shot 으로 끝나기엔 크므로 권장 sub-task:

1. **Sub-task 1 — 헬퍼/상수 (line 1~250):** import, HIRE_DATES, calcLeaveQuota, localYMD, prevYMD, SHIFT_LABEL, LEAVE_TYPES, SHIFT_BG, LEAVE_BG, LEAVE_LABEL, HALF_TYPES, ANNUAL_TYPES, DOC_LEAVE_GRID, DOC_TO_API_TYPE, lp[0..16] — 100% 그대로.
2. **Sub-task 2 — state hooks (line 250~680):** useState/useEffect/useQuery 6개/useMutation 4개 — 100% 그대로.
3. **Sub-task 3 — calendarGrid JSX (line 681~798):** W2/W6 적용 region.calendar.
4. **Sub-task 4 — legend + summary (line 800~840):** W3 적용 region.legend + region.summary-cards.
5. **Sub-task 5 — menu + upload (line 842~1018):** W4 적용 region.menu-cards + region.menu-upload.
6. **Sub-task 6 — 데스크톱 분기 (line 1020~1278):** W6/W7/W8 적용 region.desktop-3panel + region.desktop-center-form + region.desktop-pdf-preview.
7. **Sub-task 7 — 모바일 BottomSheet (line 1280~1549):** W5 적용 region.bottomsheet.

또는 single atomic — 변환 wave executor 의 판단. atomic 시점에 §4 의 grep gate 22개 모두 PASS 필요.

---

## §7. 비-trivial 변환 케이스

특별 처리 필요한 case (§10 인라인 style 예외 화이트리스트 와 연결):

**§7.1 인라인 동적 분기** — `style={{ background: isToday ? '#3b82f6' : 'var(--bd)' }}` → Tailwind 의 className 분기:

```tsx
className={`${isToday ? 'bg-accent' : 'bg-surface-sunken'}`}
```

**§7.2 계산된 aspect-ratio** — `style={{ aspectRatio: isDesktop ? '1.2' : '1' }}` → 분기 또는 arbitrary:

```tsx
className={isDesktop ? 'aspect-[1.2]' : 'aspect-square'}
```

**§7.3 linear-gradient (반차 셀, half_am/half_pm)** — Tailwind 가 RGBA + 다중 stop 정확히 지원 안 함 → `style` 인라인 잔존 OK (§10 화이트리스트). 또는 `tailwind.config.theme.extend.backgroundImage` 추가.

**§7.4 boxShadow (PDF 미리보기 카드)** — `shadow-md` 또는 arbitrary `shadow-[0_2px_8px_rgba(0,0,0,0.1)]`.

**§7.5 animation (spin, fadeIn, slideUp, shimmer)** — `tailwind.config.theme.extend.animation` + `keyframes` 추가 또는 inline `<style>` jsx 잔존 OK (§12 OQ5).

**§7.6 lucide vs U+2713 (체크 문자) plain text** — 결정 필요 (§12 OQ2 참조).
- U+2713 plain 은 텍스트 노드, lucide `<Check size={16} />` 은 SVG.
- 주의: U+2713 은 verify gate §4.1 #3 의 `[\x{2600}-\x{27BF}]` 범위에 잡힘. 따라서 TSX 안에서 U+2713 글리프 사용 시 §4.1 #3 gate 통과 불가 → lucide `<Check size={N} />` 권장.
- 메모리 룰 (`feedback_tsx_wave_emoji_dot_gap`) 적용: 이모지 0건 grep 통과만 보장.

**§7.7 dot span 추가** (memory: `feedback_tsx_wave_emoji_dot_gap`) — sketch 의 3px 색 동그라미 패턴 (W3 legend region) — 그대로 옮길 markup:

```tsx
<span className="inline-block w-[3px] h-[3px] rounded-full bg-status-safe-bar" />
```

alias sed-replace 만 하지 말고 dot span 추가 markup 도 verify (§4 positive gate 의 rounded-full 카운트).

**§7.8 leading-none** (memory: `feedback_text_caption_leading_none`) — 작은 컨테이너 (h-8 = 48px / h-7 = 32px / 칩 등) 안 `text-caption` (lh 1.5 = 18px) 은 시각적 패딩 유발 → `leading-none` 명시. 헤더 토글/배지/칩에 적용. verify gate §4.2 #16 에서 ≥5 hits 요구.

**§7.9 planner verbatim quote rule** (memory: `feedback_planner_prompt_sketch_verbatim`) — 변환 wave executor 가 sketch 의 CSS 정의를 grep 으로 추출해 그대로 인용. 추측한 토큰명/사이즈는 deviation 유발 (03-qr-scan 6건 사례).

---

## §8. Sub-task 별 verify checkpoint

각 sub-task 완료 시점 grep 결과:

| Sub-task | 완료 시점 grep | 기대 결과 |
|---|---|---|
| Sub-task 1 (헬퍼/상수) | `grep -nE 'lp\[' cha-bio-safety/src/pages/StaffServicePage.tsx` | ≥17 hits (lp[0]~lp[16]) |
| Sub-task 2 (state hooks) | `grep -nE 'useQuery\(\{[^}]*queryKey' cha-bio-safety/src/pages/StaffServicePage.tsx` | ≥6 hits |
| Sub-task 3 (calendarGrid) | `grep -nE 'style=\{\{' cha-bio-safety/src/pages/StaffServicePage.tsx \| sed -n '681,798p'` | calendar region 안 LEAVE_BG 동적 1건 외 0 |
| Sub-task 4 (legend + summary) | `grep -nE 'var\(--' cha-bio-safety/src/pages/StaffServicePage.tsx` line 800~840 | 0건 |
| Sub-task 5 (menu + upload) | menu region 안 인라인 style — 식단 카테고리 hex 외 0건 | 카테고리 hex 동적 잔존만 |
| Sub-task 6 (데스크톱) | `grep -nE 'lg:(px\|py\|p\|gap\|space)-' cha-bio-safety/src/pages/StaffServicePage.tsx` | 0건 (layout `lg:flex` 등만 잔존) |
| Sub-task 7 (BottomSheet) | BottomSheet region 안 인라인 style — drag-handle (§10) 외 0건 | 잔존 = §10 예외 화이트리스트 |
| 최종 atomic | §4 의 verify gate 22개 모두 PASS | 모두 PASS |

---

## §9. 비즈니스 로직 보존 verify

변환 후 보존 확인 grep (각 명령 → baseline 카운트 일치):

```bash
# §9.1 useQuery 6 keys (각 ≥1)
grep -nE "useQuery\(\{[^}]*queryKey: \['(leaves|leaves-year|meals|schedule|holidays|menu)'" cha-bio-safety/src/pages/StaffServicePage.tsx

# §9.2 useMutation 4 (leaveApi.create/delete, mealApi.upsert, menuApi.create)
grep -nE "useMutation\(|leaveApi\.(create|delete)|mealApi\.upsert|menuApi\.create" cha-bio-safety/src/pages/StaffServicePage.tsx

# §9.3 toast.* 카피 카운트 (verbatim Korean)
grep -nE "toast\.(success|error|loading|dismiss)" cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: 변환 전과 동일 카운트 (변환 wave 시작 시 grep 으로 baseline 확보)

# §9.4 필수 함수 호출 (각 ≥1)
grep -nE "calcLeaveQuota|calcProvidedMeals|calcWeekendAllowance|generateLeaveRequest|printLeaveRequest|handleMenuUpload" cha-bio-safety/src/pages/StaffServicePage.tsx

# §9.5 lp[0..16] 좌표 17개
grep -nE 'lp\[(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16)\]' cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: ≥17 references

# §9.6 핵심 함수/상수 잔존
grep -nE "isBlocked|DOC_LEAVE_GRID|DOC_TO_API_TYPE|HOLIDAYS_FALLBACK|HIRE_DATES|SHIFT_OFFSETS|getRawShift|SHIFT_COLOR" cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: 모두 잔존

# §9.7 useIsDesktop() 분기
grep -nE "useIsDesktop\(\)|isDesktop" cha-bio-safety/src/pages/StaffServicePage.tsx
# 기대: 변환 전과 동일 카운트
```

---

## §10. 인라인 style 예외 화이트리스트

Tailwind 으로 표현 안 되거나 안 하는 게 나은 case (style 잔존 OK). 각 인스턴스는 line ref + 사유 inline 명시.

| 케이스 | Source line (변환 전 기준) | 사유 |
|---|---|---|
| PDF preview lp[0..16] overlay | line 1225~1273 (17 instance) | 동적 좌표 `left: {%}, top: {%}` — Tailwind 불가 |
| PDF overlay span `font-size: 10` + `color: #111` + `font-family: 'Noto Sans KR'` | (lp overlay 안 ovAt 헬퍼) | UI-SPEC §10.1 NEGATIVE — 인쇄 정합성 |
| PDF 체크박스 사각형 `width: 12, height: 12, background: #000` | (lp overlay 안) | UI-SPEC §10.1 NEGATIVE — 인쇄 정합성 (= `w-3 h-3 bg-black` 12px) |
| 카테고리 hex 동적 셀 배경 | `background: LEAVE_BG[lt]` (line 681~798 안) | JS 변수 동적 hex — 정적 Tailwind 불가 |
| 식단 카드 카테고리 hex 배경 (#42d778 등) | line 842~1018 | 동적 카테고리 hex — 정적 class 불가능 시 잔존 |
| linear-gradient 반차 셀 (half_am/half_pm) | calendarGrid 안 | RGBA + multi-stop — Tailwind 가 정확히 지원 안 함 |
| spinner / fadeIn / slideUp / shimmer animation | (W9 적용 후) `<style>` jsx 잔존 OR tailwind.config animation | keyframe 정의 location 결정 by executor (§12 OQ5) |
| BottomSheet drag handle width:36 height:4 | line 1280~ 안 (BottomSheet 헤더) | 표준 패턴 픽셀 — token 외 |
| BottomSheet max-h: 65vh | container | UI-SPEC §2.3 예외 — 기존 동작 보존 |
| 데스크톱 중앙 패널 폭 280px | desktop-3panel | UI-SPEC §2.3 예외 — 휴가신청서 폼 컬럼 |
| 데스크톱 우측 패널 max-w 595px | desktop-pdf-preview | A4 폭 — PDF 좌표 정합성 |
| PDF 업로드 라벨 세로 패딩 데스크톱 py-12 / 모바일 py-3 | menu-upload | UI-SPEC §2.3 예외 — 드롭존 vs 컴팩트 |

변환 wave executor 는 위 케이스 외 모든 인라인 style 제거. 새 예외 발견 시 본 §10 에 line ref 추가.

---

## §11. 변환 후 사용자 검수 흐름

1. 변환 wave executor 가 atomic commit (또는 region 별 commit, §6 권장 sub-task 분할).
2. `npx tsc --noEmit` PASS — 0 errors.
3. `npm run build` PASS — exit 0.
4. §4 의 verify gate 22개 모두 PASS — 출력 capture 후 결과 보고.
5. 사용자 검수:
   - 모바일 (393px frame) — Chrome DevTools 또는 실기기.
   - 데스크톱 (1280px frame).
   - 다크 모드 + 라이트 모드 양 환경.
   - 5 region 인터랙션 (달력 셀 클릭 / BottomSheet 열기 / 휴가 신청 폼 / PDF 미리보기 / 식단 업로드).
6. 사용자 컨펌 후 main 머지 (memory: `project_redesign_workflow` — `redesign/12-staff-service` 브랜치 → main).
7. `cbc7119-preview.pages.dev` 자동 배포 (GitHub Actions).
8. 직원 도메인 (`cbc7119.pages.dev`) 영향 0 — 본 워크트리는 디자인 격리 (memory: `project_cbc7119_design_repo` + `reference_cbc7119_domain`).
9. wrangler 명령 절대 금지 (memory: `feedback_cbc7119_design_never_wrangler`) — 디자인 wave 중 `wrangler --project-name=cbc7119` 시도 0건.

---

## §12. Open questions (변환 wave 시작 전 결정 필요)

체크박스 형식. 변환 wave executor 가 시작 전 사용자에게 컨펌.

- [ ] **OQ1**: 단일 atomic commit vs region 별 sub-task 7개 commit 분할 — 1552 lines 크기 고려. default: 단일 atomic 권장 (사용자 검수 단순), 단 sub-task 별 grep checkpoint 는 §8 따라 별도 확인.
- [ ] **OQ2**: U+2713 (체크 문자) plain text 유지 vs `<Check size={16} />` lucide 치환 — W9 sketch 는 U+2713 plain 패턴이지만, verify gate §4.1 #3 의 `[\x{2600}-\x{27BF}]` 범위에 잡히므로 lucide 치환이 default 권장. 변환 wave executor 가 시작 시점에 명시 결정.
- [ ] **OQ3**: ANNUAL_TYPES 별도 정의 유지 vs API type 매핑 simplification — 비즈니스 로직 보존 (§9) 우선. 변경 안 함 권장.
- [ ] **OQ4**: detailPanel dead code 처리 (UI-SPEC §14 OQ #2) — 데스크톱 분기에서 미렌더. grep 으로 사용처 확인 후:
  - 사용처 0 → 삭제 (코드 줄임).
  - 사용처 ≥1 → 보존 + line ref 명시.
- [ ] **OQ5**: `tailwind.config` 에 새 animation keyframe 추가 vs `<style>` jsx 잔존 — W9 의 spin/fadeIn/slideUp/shimmer 4종. default: 새 animation 추가 (`tailwind.config.js` 의 `theme.extend.animation` + `keyframes`).
- [ ] **OQ6**: `tailwind.config` 에 식단 카테고리 hex (#42d778 등) 추가 vs `style` 인라인 잔존 — default: tailwind config 의 colors 추가 후 class 사용. 단 동적 분기는 §10 화이트리스트로 잔존.

---

**End of W10 checklist.**
