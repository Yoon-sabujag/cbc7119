---
title: "redesign/16-workshift — sketch wave 1 (index)"
status: locked
created: 2026-05-21
quick_id: 260521-sjj
branch: redesign/16-workshift
source_tsx: cha-bio-safety/src/pages/WorkShiftPage.tsx
source_tsx_lines: 226
design_system: cha-bio-safety/docs/redesign-context/16-workshift/design-system.md (v0.1.1, c8bfa86)
chrome_rules: cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md (출근부 = 점검 시리즈 아님 — 직접 적용 X, 헤더 패턴만 mirror)
mirror_of: cha-bio-safety/docs/redesign-context/27-login/wave-1-index.md (260521-c6p) — 7 섹션 구조 + 4 sub-wave 패턴 mirror
sub_wave_count: 4 (W2~W5)
memory_rules_inline: 12
open_questions: 5
---

# redesign/16-workshift — sketch wave 1 (index)

본 문서는 W2~W5 후속 wave 의 **단일 진입점**이다. 이 인덱스 1개 파일만 읽으면 후속 wave 작업자(자기 자신이든 다른 세션이든)는 다음을 알 수 있다:

- WorkShiftPage.tsx (226 라인) 의 element 인벤토리 → 4 sub-wave 분배
- design-system.md v0.1.1 §1.1 / §1.2 / §1.3 / §6 / §7 의 verbatim 룰 박제 (§6/§7 은 미적용 1줄 메타 동반, §7.1 Lucide 룰은 적용)
- 02+06 chrome 통일 룰 (`inspection-modal-chrome-rules.md`) 의 16-workshift 적용 여부 (출근부 = 점검 시리즈 아님 — 헤더 패턴만 mirror 검토, BottomNav/AppHeader 실측 박제)
- 메모리 룰 12건 (`feedback_*.md`) inline 인용 — 10건 기본 + WorkShiftPage 특화 2건 (holidays library gap + dashboard horizontal scroll)
- §6 negative rule (이 wave 에서 금지된 것)
- §7 open questions 5건 — W2 진입 직전 사용자 컨펌 (엑셀 버튼 / chrome / 폰트 격상 / 셀 hex+opacity / today border+공휴일 색)

작성일: 2026-05-21 / Quick ID: 260521-sjj / Branch: redesign/16-workshift

> 27-login W1 (260521-c6p) 의 7 섹션 + 4 sub-wave 구조를 정확히 mirror. WorkShiftPage 가 226 lines 단순 페이지 (LoginPage 220 lines 와 유사) 라 14-reports 6 sub-wave 가 아닌 4 sub-wave (W2~W5) 채택. 13-schedule + 14-reports + 27-login 모두 평면(flat sibling) 패턴 — `16-workshift/sketch-wave-N-{slug}.html` 직접 배치, `sketch/` 서브폴더 없음. 본 인덱스도 `16-workshift/wave-1-index.md` (flat) 으로 위치한다.

---

# §1. WorkShiftPage.tsx 인벤토리

본 인벤토리는 WorkShiftPage.tsx (226 lines, 16-workshift.md 메타와 일치 — drift 없음) 의 element 를 (1) 공통 hook/state/handler / (2) 헤더 / (3) 년/월 select / (4) 표 영역 / (5) 범례 5 영역으로 나눠 정리한다. line 범위는 **실측 결과** (PLAN 추정치는 참고만, 본 인덱스는 실제 파일 grep 결과 사용).

**WorkShiftPage 의 구조 특이성** (인벤토리 머리말):

- 모바일/데스크톱 분기 via `useIsDesktop()` (≥768px, line 15)
- 모바일/데스크톱 분기 지점은 chrome 만 다르고 (헤더 padding / 본문 paddingTop / back button 표시 여부), 표/범례는 공통
- 표는 **2-table 구조** (이름 열 고정 table + 날짜 열 가로 스크롤 table) — `flex` 안 nested table — memory `feedback_dashboard_horizontal_scroll` 룰 동일 (flex-wrap 금지, 단일행+overflow-x:auto 가 의도된 디자인)
- `HDR_H = 52` / `ROW_H = 46` 인라인 상수 (line 10~11)
- `SHIFT_COLOR` / `DOW_KO` / `RawShift` 모두 `src/utils/shiftCalc.ts` 에서 import (line 4~5) — export 시그니처 변경 금지 (§6 negative rule)
- 외부 fetch: `https://holidays.hyunbin.page/basic.json` (line 27) — memory `feedback_korean_holidays_library_gap` 의 fallback 패턴 (try/catch → []) 유지
- 모든 인라인 style 사용 (변환 시 Tailwind utility 로 치환 대상 — W5 checklist)
- 별도 컴포넌트 import 없음 (Lucide 미사용 — back button 은 인라인 SVG `M15 19l-7-7 7-7`)

## §1.1 영역별 인벤토리 표

| 영역 | element | line 범위 | 역할 | 비즈 로직 연결 | 후속 wave |
|---|---|---|---|---|---|
| 1. 공통 hook + state + handler | imports + 상수 (`SHIFT_LABEL` / `HDR_H` / `ROW_H`) | 1~11 | 정적 카탈로그 + 표 셀 높이 상수 | `RawShift`, `SHIFT_COLOR`, `DOW_KO` (shiftCalc.ts 1:1) | 무관 (보존만) |
| 1. 공통 hook + state + handler | useNavigate / useIsDesktop / today 변수 | 14~16 | 분기 + 오늘 날짜 anchor | `navigate(-1)`, `isDesktop` ≥768px | 무관 (보존만) |
| 1. 공통 hook + state + handler | useState 3종 (`year` / `month` / `dlLoading`) | 17~19 | 년/월/엑셀 로딩 상태 | setYear / setMonth / setDlLoading | 무관 (보존만) |
| 1. 공통 hook + state + handler | useRef 2종 (`scrollRef` / `todayRef`) | 20~21 | 가로 스크롤 컨테이너 + 오늘 셀 anchor | `todayRef.current?.scrollIntoView({inline:'center', block:'nearest'})` | 무관 (보존만) |
| 1. 공통 hook + state + handler | useQuery `['holidays-dates']` | 23~40 | 외부 공휴일 fetch + fallback | `fetch('https://holidays.hyunbin.page/basic.json')` / try/catch → [] / staleTime 24h | 무관 (보존만) |
| 1. 공통 hook + state + handler | useStaffList + STAFF_ORDER 정렬 | 42~48 | 직원 4명 고정 순서 | `STAFF_ORDER = ['석현민','김병조','윤종엽','박보융']` / sort by indexOf | 무관 (보존만) |
| 1. 공통 hook + state + handler | getMonthlySchedule(year, month, staffForCalc) | 49 | 클라이언트 사이드 shift 계산 | `daysInMonth`, `staffRows: { id, name, title, shifts: RawShift[] }[]` | 무관 (보존만) |
| 1. 공통 hook + state + handler | `isToday(d)` / `isRed(d)` helpers | 51~60 | today border 분기 + 공휴일·주말 색 분기 | `holidays.includes(YYYY-MM-DD)` / dow 0/6 → red | 무관 (보존만) |
| 1. 공통 hook + state + handler | useEffect 자동 가운데 스크롤 | 63~68 | 년/월 변경 시 오늘 열로 가운데 정렬 | `todayRef.scrollIntoView({inline:'center'})` via requestAnimationFrame | 무관 (보존만) |
| 1. 공통 hook + state + handler | handleExcel dynamic import | 70~82 | 엑셀 다운로드 lazy load | `await import('../utils/generateExcel')` / `generateShiftExcel(year, month, staffForCalc)` / toast.error | 무관 (보존만) |
| 2. 헤더 | 헤더 wrapper (모바일/데스크톱 분기) | 87~111 | 페이지 chrome 최상단 | `isDesktop ? {height:54, padding:'0 20px'} : {padding:'8px 12px 9px'}` / `background:var(--bg2)` / `borderBottom:1px solid var(--bd)` | W2 |
| 2. 헤더 | back button (모바일 전용, line 96~102) | 96~102 | 뒤로가기 — 모바일만 표시 | `navigate(-1)` / 34×34 / `var(--bg3)` bg / 인라인 SVG ChevronLeft | W2 |
| 2. 헤더 | 타이틀 span "월간 출근부" | 103 | 페이지 식별 | `fontSize: isDesktop ? 16 : 14, fontWeight:700, color:var(--t1)` | W2 |
| 2. 헤더 | 엑셀 저장 button | 104~110 | CTA — 엑셀 다운로드 | `handleExcel` onClick / `disabled={dlLoading}` / `background:var(--acl)` 단색 / 카피 "엑셀 저장" / "생성중..." | W2 |
| 3. 년/월 select | 컨테이너 | 114 | flex row 2 select wrapper | `flex gap:8 padding:'10px 12px' bg:var(--bg2) borderBottom 1px var(--bd)` | W2 |
| 3. 년/월 select | year select (2025/2026/2027) | 115~117 | 년 선택 | `setYear` / `padding:'7px 10px' radius:9 bg:var(--bg3) border 1px var(--bd2) fontSize:13` | W2 |
| 3. 년/월 select | month select (1~12) | 118~120 | 월 선택 | `setMonth` / 동일 인라인 토큰 / `Array.from({length:12},(_,i) => i+1)` | W2 |
| 4. 표 영역 | 외곽 컨테이너 (flex column overflow auto) | 124~130 | 스크롤 + 가운데 정렬 | `flex:1 overflow:auto display:flex flexDirection:column alignItems:center paddingTop: isDesktop ? '12vh' : 0` | W3 |
| 4. 표 영역 | 내곽 wrapper (inline-flex column) | 131 | 표 + 범례 묶음 | `display:inline-flex flexDirection:column padding: isDesktop ? '0 32px' : '16px 24px'` | W3 |
| 4. 표 영역 | 표 row (flex) | 132 | 이름 열 + 날짜 열 횡 배치 | flex (이름 fixed + 날짜 가로 scroll) | W3 |
| 4. 표 영역 | **이름 열** (고정) — table thead "이름" | 134~142 | 이름 열 헤더 | `height:HDR_H=52 width:82 padding:'0 10px' border:1px solid var(--bd) bg:var(--bg3) color:var(--t2) fontSize:12 fontWeight:700` | W3 |
| 4. 표 영역 | **이름 열** tbody (staff name + title) | 143~152 | 직원별 행 | `height:ROW_H=46 padding:'0 10px' bg:var(--bg2)` / name `fontSize:14 fontWeight:700 var(--t1)` / title `fontSize:10 var(--t3) marginTop:2` | W3 |
| 4. 표 영역 | **날짜 열** scrollRef wrapper | 157 | 가로 스크롤 컨테이너 | `flex:1 overflowX:auto` (memory `feedback_dashboard_horizontal_scroll`) | W3 |
| 4. 표 영역 | **날짜 열** thead (day cell × daysInMonth) | 159~184 | 일자 + 요일 헤더 | `HDR_H=52 minWidth:40 padding:'4px 2px'` / today: `2px solid var(--acl) + rgba(59,130,246,0.15)` / red: `#ef4444` / d `fontSize:13 fontWeight:700` / DOW_KO[dow] `fontSize:10` | W3 |
| 4. 표 영역 | **날짜 열** tbody (shift cell × daysInMonth × staffRows) | 185~207 | 직원×일자 shift 그리드 | `ROW_H=46 minWidth:40 padding:'0 2px'` / today border 분기 / `fontSize:15 fontWeight:700` / `color:SHIFT_COLOR[sh] background:SHIFT_COLOR[sh]+'22'` (hex+22 알파 흉내) | W3 |
| 5. 범례 | 범례 컨테이너 | 213 | 4 shift 범례 row | `flex gap:14 padding:'10px 0 28px' flexWrap:wrap justifyContent:center` | W4 |
| 5. 범례 | 4 shift box (당/비/주/휴) | 214~219 | 카테고리 색 범례 | `width:24 height:24 radius:5 bg:SHIFT_COLOR[sh]+'22' border:1.5px solid SHIFT_COLOR[sh] fontWeight:800 fontSize:13 color:SHIFT_COLOR[sh]` | W4 |
| 5. 범례 | 라벨 (SHIFT_LABEL[sh]) | 217 | 한글 라벨 | `fontSize:12 color:var(--t2)` / `SHIFT_LABEL = {'당':'당직','비':'비번','주':'주간','휴':'휴무'}` | W4 |

## §1.2 line 수 실측 확인

`wc -l cha-bio-safety/src/pages/WorkShiftPage.tsx` 실측 = **226 라인** (PLAN 추정치 + 16-workshift.md 메타 일치, drift 없음).

LoginPage (220 lines) 대비 약 +3% — 거의 동일한 단순도. ReportsPage (405 lines) 대비 약 56% 짧음 — sub-wave 6 → 4 축소가 타당. 별도 컴포넌트 import 없음 (`useStaffList` / `useIsDesktop` hook 만, Lucide 미사용 — back button 인라인 SVG).

## §1.3 비즈 로직 시그니처 (W5 TSX 보존 anchor)

W5 TSX 변환 wave 에서 다음 import/export 시그니처는 **100% 보존**한다 (§6 negative rule):

```
from '../utils/shiftCalc':
  - getMonthlySchedule(year: number, month: number, staffForCalc: Staff[]):
      { daysInMonth: number, staffRows: StaffRow[] }
  - SHIFT_COLOR: Record<RawShift, string>  // '당'/'비'/'주'/'휴' → hex color
  - DOW_KO: ['일','월','화','수','목','금','토']
  - RawShift = '당' | '비' | '주' | '휴'

from '../utils/generateExcel' (dynamic import):
  - generateShiftExcel(year, month, staffForCalc): Promise<void>

useQuery(['holidays-dates']) → fetch https://holidays.hyunbin.page/basic.json → string[] (YYYY-MM-DD)
useStaffList() → { data: Staff[] }
useIsDesktop() → boolean (≥768px)
STAFF_ORDER = ['석현민', '김병조', '윤종엽', '박보융']  // 정렬 고정
SHIFT_LABEL: Record<RawShift, string> = { '당':'당직','비':'비번','주':'주간','휴':'휴무' }  // 페이지 로컬 상수
HDR_H = 52  // 페이지 로컬 상수 (셀 높이 1)
ROW_H = 46  // 페이지 로컬 상수 (셀 높이 2)
```

---

# §2. 4 sub-wave 분배 plan

| Wave | scope | 대상 element | 산출 파일 |
|---|---|---|---|
| W2 | 헤더 (모바일/데스크톱 분기) + 년/월 select (단색 CTA 검토) | 영역 2 (헤더 line 87~111) + 영역 3 (년월 select line 113~121). 모바일/데스크톱 분기 표시 가독 (split panel or annotated). | sketch-wave-2-header-select.html |
| W3 | 표 영역 (이름 열 고정 + 날짜 열 가로 스크롤 + today highlight + 공휴일·주말 색) | 영역 4 (line 123~210) — 2-table 구조. nested flex. HDR_H=52 / ROW_H=46. today border + 공휴일·주말 색 변종 모두 매트릭스. | sketch-wave-3-shift-table.html |
| W4 | 범례 (4 shift box + 라벨) | 영역 5 (line 213~220) — 4 shift box 24×24 + 라벨. 모바일/데스크톱 padding 차이 정리. | sketch-wave-4-legend.html |
| W5 | TSX 변환 verify checklist (sketch 아님, markdown) | W2~W4 sketch + WorkShiftPage.tsx 비즈 로직 보존 룰 + Tailwind cheatsheet | wave-5-tsx-conversion-checklist.md |

## §2.1 각 wave 행 — 보존 / 토큰 / 폰트

### W2 — 헤더 + 년/월 select

- **보존**: `useIsDesktop()` 분기 verbatim (line 15, 88), `navigate(-1)` (line 97), `handleExcel` (line 105) / `dlLoading` 분기 카피 "엑셀 저장" ↔ "생성중..." (line 109), `setYear` / `setMonth` (line 115, 118), select 옵션 `[2025, 2026, 2027].map(y => <option>{y}년</option>)` + `Array.from({length:12},(_,i) => i+1).map(m => <option>{m}월</option>)` verbatim, 타이틀 카피 "월간 출근부" verbatim (line 103), back button **모바일 전용** 표시 (line 96 `!isDesktop &&`)
- **토큰**: 헤더 wrapper = `bg-surface-raised border-b border-border-default` (`var(--bg2)` → `--surface-raised`, 마이그레이션 §4.1) — chrome 룰 §2.1 의 `bg-surface-page` 적용 여부는 OQ #2 (default raised 유지 — 02 InspectionPage 와 일관) / back button = `bg-surface-sunken border border-border-default` (`var(--bg3)` → `--surface-sunken`) / 엑셀 버튼 = **`bg-safe-bar` solid** (현재 `var(--acl)` 단색 → 그라데이션 없으므로 토큰 치환만, OQ #1 default OK — 27-login OQ #1 + 14-reports W1 OQ #1/#3 일관) / select = `bg-surface-sunken border border-border-strong` (`var(--bd2)` → `--border-strong`) / select radius 9 → `rounded-sm` (8) 또는 `rounded-[9px]` 인라인 — **status- prefix 없음 (memory `feedback_tailwind_token_class_pattern`)**
- **폰트**: 타이틀 모바일 14px → `text-body-sm font-bold` (14) 또는 `text-body font-bold` (16, design-system §1.1 마지노선 준수) / 데스크톱 16px → `text-body font-bold` (16). 엑셀 버튼 12px (fontWeight:600) → `text-caption font-bold leading-none` (memory `feedback_text_caption_leading_none`, h:34 작은 컨테이너) / select 13px → `text-label` (13). back button SVG 15×15 → Lucide `ChevronLeft size={15}` 교체 후보 (OQ §3 §7.1 메타 참조, prop 사용 — `w-N h-N` className 금지, memory `feedback_tailwind_token_class_pattern`).

### W3 — 표 영역

- **보존**: `getMonthlySchedule(year, month, staffForCalc)` 호출 시그니처 + 반환 `{ daysInMonth, staffRows }` 100% (line 49), `SHIFT_COLOR[sh]+'22'` hex+22 알파 흉내 인라인 (line 198 / line 216 — OQ #4 default 인라인 유지), `DOW_KO[dow]` (line 179, shiftCalc.ts line 115 export), `isToday(d)` / `isRed(d)` 분기 (line 51~60), `todayRef.current?.scrollIntoView({inline:'center', block:'nearest'})` (line 65) + `requestAnimationFrame` wrapper (line 64), `STAFF_ORDER` 4명 정렬 (line 43~48), `HDR_H=52` / `ROW_H=46` 셀 높이 (line 10~11, **변경 시 자동 스크롤 vh 계산 영향** — 인라인 유지 권장), **2-table 구조** (이름 열 고정 + 날짜 열 가로 scroll, flex 안 nested table — memory `feedback_dashboard_horizontal_scroll` flex-wrap 금지)
- **토큰**: 외곽 컨테이너 = `flex-1 overflow-auto flex flex-col items-center` (인라인 그대로) / paddingTop `isDesktop ? '12vh' : 0` 인라인 유지 (vh 단위 — 토큰화 무관, memory `feedback_viewport_units_per_platform` 참고) / 내곽 padding `isDesktop ? '0 32px' : '16px 24px'` → `--page-padding` (모바일 16 / 데스크톱 24) 와 다름 → 인라인 유지 또는 `px-6 lg:px-8` (24 / 32) 검토 (sketch 단계 결정) / 이름 열 헤더 = `bg-surface-sunken border border-border-default` (`var(--bg3)` → `--surface-sunken`) / 이름 열 셀 = `bg-surface-raised border border-border-default` (`var(--bg2)` → `--surface-raised`) / today border = `border-2 border-accent` (2px solid `var(--acl)` → `--accent`) / today bg = `rgba(59,130,246,0.15)` → `bg-accent-soft` 토큰화 또는 인라인 (OQ #5 default 토큰 치환 OK — 토큰 없으면 인라인 `bg-[rgba(59,130,246,0.15)]`) / red (공휴일·주말 글자) `#ef4444` → `text-danger` 토큰 치환 (OQ #5 default OK, raw hex 사용 시 W5 verify FAIL, memory `feedback_tailwind_token_class_pattern`) / 셀 배경 `SHIFT_COLOR[sh]+'22'` 인라인 유지 (OQ #4 default — 4 shift × 알파 토큰화 비용 vs 인라인 1줄) — **status- prefix 없음**
- **폰트**: 이름 열 헤더 "이름" 12px (line 138) → `text-caption font-bold leading-none` (12px + leading-none, h:HDR_H=52 작은 컨테이너 안 시각 패딩 방지) / staff name 14px (line 147) → `text-body-sm font-bold` (14) 또는 `text-body font-bold` (16, 마지노선 — 표 dense layout 특성상 14 절충 검토, OQ #3) / staff title 10px (line 148) → `text-caption` (12px) 격상 (§1.1 9·10·11px 금지 룰, 마이그레이션 §4.2 일괄 상향) / day cell d 13px (line 178) → `text-label font-bold` (13) / DOW_KO 10px (line 179) → `text-caption` (12) 격상 (§1.1 위반 후보) / shift cell 글자 15px (line 197) → `text-body-sm font-bold` (14) 또는 `text-body font-bold` (16, 셀 가독성 우선 — 데이터 핵심) — OQ #3 default 절충.

### W4 — 범례

- **보존**: 4 shift 순서 `['당','비','주','휴']` verbatim (line 214, `as RawShift[]`), `SHIFT_COLOR[sh]` 호출 (line 216 — 4 색 모두 hex+22 알파 흉내 `bg`, 1.5px solid `border`, hex `color`), `SHIFT_LABEL[sh]` 한글 라벨 (line 217 — '당직'/'비번'/'주간'/'휴무' verbatim — memory `feedback_sketch_realistic_data`)
- **토큰**: 컨테이너 = `flex flex-wrap gap-[14px] justify-center py-[10px] pb-[28px]` 인라인 또는 `gap-4 py-3 pb-7` 토큰 매핑 / shift box 24×24 → `w-6 h-6` (24px, 토큰에 24 = w-6 / w-7 = 32 함정, memory `feedback_tailwind_w8_h8_is_48px` — 24 는 w-6 안전) / radius 5 → `rounded-[5px]` 인라인 (토큰 없음) / border 1.5px → `border-[1.5px]` 인라인 / SHIFT_COLOR 4 hex+border 1.5px solid 인라인 유지 — **status- prefix 없음**. duty 토큰 (`--duty-day/night/off/leave`) 의 hex 와 SHIFT_COLOR 의 hex 일치 여부 확인 후 (shiftCalc.ts line 109~114 grep) duty 토큰 치환 검토 — sketch 단계 결정 (default SHIFT_COLOR 인라인 유지 — 16-workshift.md 섹션 4 "당/비/주/휴 셀 색은 duty 토큰 사용 — status 토큰과 혼용 금지" 명시이나 코드는 shiftCalc.ts SHIFT_COLOR 단일 source 이므로 일관성 위해 인라인 유지).
- **폰트**: shift box 안 글자 (당/비/주/휴) 13px fontWeight:800 (line 216) → `text-label font-extrabold leading-none` (13 + leading-none, w-6 h-6 작은 컨테이너 안 시각 패딩 방지) / 라벨 (SHIFT_LABEL[sh]) 12px (line 217 → `text-caption` (12) `leading-none` — memory `feedback_text_caption_leading_none`).

### W5 — TSX 변환 verify checklist (markdown)

- **보존**: WorkShiftPage.tsx 의 모든 비즈 로직 (useNavigate / useIsDesktop / useState 3종 / useRef 2종 / useQuery holidays / useStaffList / STAFF_ORDER 정렬 / getMonthlySchedule / isToday / isRed / useEffect 자동 스크롤 / handleExcel dynamic import / generateShiftExcel) 100% 보존. import 시그니처 (SHIFT_COLOR / DOW_KO / RawShift / getMonthlySchedule / generateShiftExcel) 변경 금지. UI markup + 인라인 style 만 재작성.
- **토큰**: W2~W4 sketch 의 모든 Tailwind class / CSS 토큰을 grep 으로 추출 → checklist 안에 verbatim 인용 (memory `feedback_planner_prompt_sketch_verbatim`). status- prefix 없음 룰 (memory `feedback_tailwind_token_class_pattern`) + `w-8/h-8 = 48px` 함정 룰 (memory `feedback_tailwind_w8_h8_is_48px`) verbatim 박제. 엑셀 버튼 `bg-safe-bar` solid 결정 (OQ #1) / today border `border-accent` (OQ #5) / 공휴일·주말 `text-danger` (OQ #5) / 셀 hex+opacity 인라인 (OQ #4) 모두 명시.
- **폰트**: design-system.md §2.7 7단계 cheatsheet + 마이그레이션 룰 §4.2 의 9·10·11px 일괄 상향 룰 verbatim 박제. staff title / DOW_KO 10px / 데이터 셀 15px / shift box 13px 절충 결정 (OQ #3) 명시. holidays fetch fallback 패턴 (try/catch → []) verbatim — memory `feedback_korean_holidays_library_gap` 룰 따라 `@hyunbinseo/holidays-kr` 등 다른 라이브러리 교체 금지.

---

# §3. design-system.md v0.1.1 인용 (verbatim 발췌, fence 안)

본 인용은 `cha-bio-safety/docs/redesign-context/16-workshift/design-system.md` (v0.1.1, c8bfa86) 원문 그대로. 후속 wave 작업자가 design-system.md 를 별도로 열지 않아도 핵심 룰을 본 인덱스에서 직접 확인 가능하도록 박제한다.

## §3.1 design-system §1.1 노안 친화 (verbatim)

```
### 1.1 노안 친화가 모든 결정보다 우선
- 본문 폰트 최소 16px. 9·10·11px 사용 금지.
- 보조 텍스트 명도 대비 AAA(7:1) 도달.
- 터치 타겟 모바일 44px, 데스크톱 40px.
- 1-2px 단위 미세 차이는 의미 없다 — 토큰은 4의 배수로만.
```

> WorkShiftPage 현재 fontSize 위반 후보: 10 (staff title / DOW_KO), 12 (이름 헤더 / 범례 라벨). 표 dense layout 특성상 부분 절충 — OQ #3 default 답 참조.

## §3.2 design-system §1.2 정보 인지 > 미적 정제 (verbatim)

```
### 1.2 정보 인지 > 미적 정제
방재 시스템은 매일 보는 업무 도구다. 트렌디함은 가치가 없다.
- 정보 위계는 폰트 크기/굵기/색이 분명하게 차별화한다.
- 카드 경계는 항상 명확하게 (다크는 명도, 라이트는 보더).
- 인지 부하를 늘리는 장식은 빼고, 빠른 식별을 돕는 색·아이콘을 살린다.
```

> WorkShiftPage 의 SHIFT_COLOR 4종 (당 #ef4444 / 비 #3b82f6 / 주 #f59e0b / 휴 #6b7280 — shiftCalc.ts line 109~114) 은 색·아이콘으로 빠른 식별을 돕는 카테고리 색 — §1.2 룰 부합. status 색 혼용 금지 (16-workshift.md 섹션 4 명시).

## §3.3 design-system §1.3 모바일/데스크톱 동일 폰트 (verbatim)

```
### 1.3 모바일/데스크톱은 같은 시스템, 다른 밀도
- 폰트는 양쪽 동일 — 노안 대응 절대 룰.
- Radius도 양쪽 동일.
- Spacing만 분기 (모바일 14px → 데스크톱 10px 등).
- 데스크톱이 빽빽한 건 spacing보다 **레이아웃**(사이드바, 좌우 분할, 그리드 컬럼 수)이 책임진다.
```

> WorkShiftPage 의 모바일/데스크톱 분기 (line 88, 91~92, 129, 131) 는 모두 **chrome padding + paddingTop**(spacing) 분기. **타이틀 폰트만 예외** (line 103 — 모바일 14, 데스크톱 16) — §1.3 위반 후보. OQ #3 default 답에서 절충 (모바일 14 / 데스크톱 16 유지하되 §1.3 노안 마지노선 16 위반 인지). 표 본문/범례 폰트는 양쪽 공통.

## §3.4 design-system §6.1 Progress Color Rule (verbatim)

```
### 6.1 Progress Color Rule (진척률 색 매핑)

점검 카테고리 도넛, 카테고리 카드 좌측 색바 등 **진척률을 표현할 때** 일관 적용한다.

| 진척률 | 색상 | 토큰 |
|---|---|---|
| 100% (완료) | 녹색 | `--status-safe-bar` |
| 50~99% | 파랑 | `--accent` |
| 1~49% | 노랑 | `--status-warning-bar` |
| 0% (미시작) | 회색 | `--text-tertiary` |

**카테고리별 임의 색 배정 폐지** — 카테고리는 아이콘 모양으로 구분하고, 색은 진척률 기반만 사용한다.
```

> **§6 미적용 — 출근부 페이지에는 진척률 도넛/카테고리 카드 없음.** WorkShiftPage 의 4 shift (당/비/주/휴) 는 status/duty 와 별개 카테고리 색이며 진척률 색 매핑 적용 대상이 아니므로 Progress Color Rule 비적용. SHIFT_COLOR 4종은 `--duty-*` 토큰과 hex 정확히 일치 — duty 시스템의 일부지만 progress 와 무관.

## §3.5 design-system §6.2 Stat Card Number Color (verbatim)

```
### 6.2 Stat Card Number Color

통계 카드(28px display 숫자) 색상 룰:
- 기본 숫자 색: `--text-primary` (흰색/검정)
- 라벨: `--text-secondary`
- 단위: `--text-tertiary`
- **위험 임계치 조건부 처리**: `점검 미완료 > 0`, `미조치 > 0` 등 주의가 필요한 상태일 때 숫자만 `--status-danger`로 변경
- 카드 좌측 3px 색바: 해당 status 토큰의 `bar` 변종 (예: `--status-danger-bar`)
```

> **§7 (= "Stat Card" 룰) 미적용 — 출근부 페이지에는 통계 숫자 카드 없음.** WorkShiftPage 에는 28px display 숫자 카드가 없다 (헤더 + 년월 select + 표 + 범례 뿐). **W5 변환 wave executor 가 Stat Card §6.3 룰 verbatim 인용 누락으로 deviation 잡으면 안 됨** — 실제로 16-workshift 에 적용 대상 element 가 없으므로 (memory `feedback_tsx_wave_stat_card_drift` 룰 따라 본 인덱스에 "미적용" 명시).

## §3.6 design-system §6.4 Backgrounds & Gradients 폐기 룰 (verbatim)

```
### 6.4 Backgrounds & Gradients

- 단색 surface 계층 — 이미지 배경 없음, 풀블리드 없음
- **유일한 그라디언트 2종:**
  - "오늘 점검 대상" 배너: `linear-gradient(135deg, rgba(37,99,235,.10), rgba(14,165,233,.05))`
  - 저장/CTA 버튼: `linear-gradient(135deg, #1d4ed8, #0ea5e9)`
- 그 외 모든 배경은 surface 토큰 단색
```

> WorkShiftPage 의 엑셀 저장 버튼 (line 107) = `background: 'var(--acl)'` **단색** (그라데이션 없음). 27-login OQ #1 (그라데이션 → solid) + 14-reports W1 OQ #1/#3 (그라데이션 → solid) 일관 정책 + design-system §6.4 CTA 폐기 룰 따라 `bg-safe-bar` solid 통일 — 본 페이지는 이미 solid 이므로 토큰 치환만. 이 결정은 §7 OQ #1 에서 사용자 컨펌 (default OK).

## §3.7 design-system §7.1 Iconography — Lucide (verbatim)

```
### 7.1 Icon System: Lucide

- **`lucide-react`** 사용 (MIT, stroke 기반, 24×24 viewBox)
- 사이즈: **16 / 20 / 24 px** 세 종류만
- 색상: 본 문서의 status / accent 토큰만 사용
- 이모지 사용 금지 (대시보드 빠른 도구 카드 + 카테고리 카드 모두 Lucide로 통일)
```

> **§7.1 적용 가능** — WorkShiftPage 모바일 헤더 back button 의 커스텀 인라인 SVG `<svg width={15} height={15} ... path d="M15 19l-7-7 7-7"/>` (line 98~100) → Lucide `ChevronLeft size={15}` 또는 `size={16}` (Lucide 권장 사이즈 16/20/24 중 16 채택) 교체 후보. W2 sketch 진입 시 결정 (default Lucide 교체 OK — design-system §7.4 "뒤로가기: ChevronLeft" 명시). lucide prop `size={N}` 사용 — `w-N h-N` className 금지 (memory `feedback_tailwind_token_class_pattern`). 본 페이지에 이모지 0건 (현재 잘 지켜짐).

---

# §4. 02+06 chrome 통일 룰 적용 여부

16-workshift 페이지는 점검 페이지 시리즈가 아닌 **운영 일정 페이지** (월간 출근부 — 인사/근무 정보) → `inspection-modal-chrome-rules.md` 의 chrome 룰 전체 적용 대상이 **아니다**. zone/category/floor/line wrapper 없음, 점검 모달 없음, editMode 토글 없음.

단, 다음 3가지 패턴은 mirror 검토:

1. **헤더 배경 토큰** — 현재 헤더 = `var(--bg2)` (= `--surface-raised`, line 93). chrome 룰 §2.1 의 `bg-surface-page` 통일 룰 mirror 검토 — §7 OQ #2 후보 (default: 현재 raised 유지 — 02 InspectionPage 도 헤더 raised 유지 패턴이므로 일관). chrome 룰 §1 "3-Layer 배경 계층" 의 헤더 = `bg-surface-page` 룰은 점검 페이지 한정. 출근부는 단순 자체 헤더 — raised 유지가 16-workshift.md 섹션 2 메타와 일관.

2. **back button 패턴** — 현재 모바일만 (line 96~102), 34×34 `var(--bg3)` bg + 인라인 SVG ChevronLeft. chrome 룰 §7.2 의 `w-8 h-8 rounded-sm bg-surface-sunken border border-border-default text-text-secondary` 패턴 + Lucide `ChevronLeft size={15}` 적용 가능. 단 **w-8 = 48px 함정** (memory `feedback_tailwind_w8_h8_is_48px`) — `w-8 h-8` 직접 사용 시 48×48 (1.5배 사고) → `w-[34px] h-[34px]` 인라인 또는 `w-9 h-9` (44px, 4px 확대) 선택. 데스크톱 back button 추가 여부 — 데스크톱은 글로벌 AppHeader 가 hide 되고 (`DESKTOP_HEADER_HIDE_PATHS` 등재) WorkShiftPage 가 자체 헤더 렌더링 → §7 OQ #2 default: **데스크톱 back button 추가 X** (메뉴/탭 진입 — navigated_to 가 아님, 사이드바 BottomNav 로 다른 페이지 이동).

3. **BottomNav 숨김 / AppHeader 숨김** — `cha-bio-safety/src/App.tsx` 실측 결과:

```
line 71: const MOBILE_NO_NAV_PATHS = ['/', '/login', '/schedule', '/reports', '/workshift', '/leave', '/floorplan', '/div', '/qr-print', '/daily-report', '/worklog', '/meal', '/education', '/legal', '/elevator/findings', '/annual-plan']
line 74: const DESKTOP_NO_NAV_PATHS = ['/', '/login']  // /workshift 미등재
line 77: const DESKTOP_HEADER_HIDE_PATHS = ['/elevator', '/div', '/floorplan', '/workshift']
line 89: '/workshift': '월간 출근부'  // PAGE_TITLES 등재
```

**핵심 시사점:**
- **모바일**: `/workshift` ∈ `MOBILE_NO_NAV_PATHS` → BottomNav **숨김**. 자체 헤더만. sketch 시 nav placeholder 그릴 필요 없음.
- **데스크톱**: `/workshift` ∉ `DESKTOP_NO_NAV_PATHS` → BottomNav **표시** (사이드바). 동시에 `/workshift` ∈ `DESKTOP_HEADER_HIDE_PATHS` → 글로벌 AppHeader **숨김** + WorkShiftPage 가 자체 헤더 렌더링 (line 87~111). sketch 시 데스크톱 시안 좌측에 사이드바 표시 영역 예약 필요 (실제 사이드바 그릴 필요는 없으나 paddingTop `12vh` 표 영역 + 사이드바 폭 영향 인지).

본 wave + W2~W5 모두 `App.tsx` 손대지 않음 (§6 negative rule).

---

# §5. 메모리 룰 inline 인용 (verbatim)

본 인덱스에서 후속 wave 작업자가 따라야 할 메모리 룰 12건. 27-login W1 의 10건 + WorkShiftPage 특화 2건 (holidays library gap + dashboard horizontal scroll). 각 룰은 `feedback_*.md` 파일명 + 요약 + Why + How (16-workshift 컨텍스트) 4 항목.

### 룰 1 — feedback_design_sketch_first.md
- **요약**: spacing/sizing 도 sketch HTML 시안 먼저 보여주고 승인 받은 후 인라인 적용.
- **Why**: 변경 후 결과를 두 번 보여주는 것보다 sketch 1회 컨펌이 효율적. 디자인 작업의 핵심 룰.
- **How to apply (16-workshift)**: W3 표 영역 cell 크기 (현재 HDR_H=52 / ROW_H=46 / minWidth=40, line 10~11, 171, 195) 조정도 spacing 손볼 거 있으면 `sketch-wave-3-shift-table.html` 먼저 보여주고 사용자 컨펌. "셀 좀 작게 하자 / 폭 좀 늘리자" 같은 인라인 변경 직행 금지.

### 룰 2 — feedback_redesign_sketch_rule_enforcement.md
- **요약**: §6.2 negative rule (위험 임계치 아닌 카드 status 색 금지) / §6.3 §7.1 일관성, executor + verify gate + 자체 검수 4중 강화.
- **Why**: status 색 (fire/danger/warning) 은 의미 fix — 진척률/위험 임계치 외에 미적 색으로 사용하면 정보 위계 무너짐.
- **How to apply (16-workshift)**: SHIFT_COLOR 4종 (당 빨강 / 비 파랑 / 주 노랑 / 휴 회색) 은 status 임계치 색이 아니라 **카테고리/duty 색** — `bg-status-safe-bg` `bg-status-danger-bg` 같은 위험 색 사용 금지. shift cell 의 `SHIFT_COLOR[sh]+'22'` (line 198) 와 범례 박스 (line 216) 모두 인라인 hex 유지 — status 토큰 치환 금지 (16-workshift.md 섹션 4 "duty 와 status 혼용 금지" 명시).

### 룰 3 — feedback_sketch_realistic_data.md
- **요약**: 표시 분기/라벨 룰은 코드 그대로, 시각 디자인만 손봄.
- **Why**: sketch 작성 시 "월간 출근부" 같은 텍스트나 STAFF_ORDER 4명 이름을 임의 변경하면 코드 변경 wave 가 deviation 으로 잡힘.
- **How to apply (16-workshift)**: 타이틀 "월간 출근부" / 엑셀 버튼 카피 "엑셀 저장" / "생성중..." / SHIFT_LABEL ('당직'/'비번'/'주간'/'휴무') / STAFF_ORDER 4명 verbatim ('석현민', '김병조', '윤종엽', '박보융', line 43) / "이름" 헤더 (line 139) / select 옵션 "2025년" "2026년" "2027년" "1월~12월" 모두 verbatim. 표시 분기 / 카피 변경 금지. 시각 디자인 (셀 색 토큰화 / 폰트 격상 / 엑셀 버튼 토큰화) 만 sketch 에서 처리.

### 룰 4 — feedback_planner_prompt_sketch_verbatim.md
- **요약**: TSX 변환 wave 진입 시 sketch CSS 정의를 grep 으로 추출해 그대로 인용. 추측한 토큰명/사이즈는 deviation 유발 (03-qr-scan 6건 사례).
- **Why**: planner 가 sketch 의 토큰명 (예: `bg-surface-raised`) 을 정확히 알지 못한 상태로 추측하면 executor 가 wave 의 의도와 다른 class 를 적용.
- **How to apply (16-workshift)**: W5 TSX 변환 wave 진입 직전 `sketch-wave-2~4.html` 의 모든 Tailwind class / CSS 토큰을 grep 으로 추출 → `wave-5-tsx-conversion-checklist.md` 안에 verbatim 인용. 특히 today 분기 `2px solid var(--acl) + rgba(59,130,246,0.15)` (line 172~173, 196) / 셀 bg `SHIFT_COLOR[sh]+'22'` (line 198) / 공휴일 색 `#ef4444` (line 174) 같은 인라인 값은 추측 X — sketch 결과 verbatim 인용.

### 룰 5 — feedback_tailwind_token_class_pattern.md
- **요약**: `text-fire-bar` O / `text-status-fire-bar` X (status- prefix 없음) + lucide `<Icon size={N} />` prop (`w-N h-N` className 금지).
- **Why**: 11-div TSX v3 hotfix(4ce707e) 사고 — `status-` prefix 가 tailwind.config 에 없어서 class 안 먹음. `bg-safe-bar` 가 올바른 패턴.
- **How to apply (16-workshift)**: 엑셀 저장 버튼 = `bg-safe-bar text-text-on-accent` (CTA solid). 공휴일·주말 색 `#ef4444` (line 174) → `text-danger` 토큰 (`text-status-danger` 사용 시 W5 verify FAIL). today border `var(--acl)` → `border-accent`. Lucide `ChevronLeft size={15}` 또는 `size={16}` prop 사용 — className 으로 `w-4 h-4` 금지. shift cell SHIFT_COLOR 4 hex 인라인 유지 (status 토큰 X).

### 룰 6 — feedback_tailwind_w8_h8_is_48px.md
- **요약**: tailwind.config spacing override — `w-8 = 48px` (기본 32 아님), `w-7 = 32px`.
- **Why**: 11-div 백버튼 1.5배 사고(54a1c8d) — `w-8 h-8` 로 32px 의도했는데 실제 48px 적용.
- **How to apply (16-workshift)**: 모바일 back button 34×34 (line 97) → `w-8 h-8` 사용 시 **48×48 (1.4배 확대 사고)** — `w-[34px] h-[34px]` 인라인 필수 (토큰에 34 없음) 또는 `w-9 h-9` (44px, 10px 확대 — 모바일 터치 마지노선 §1.1 부합). 엑셀 버튼 height 34 (line 107) → 동일 함정 — `h-[34px]` 인라인 또는 `h-9` (44, 터치 마지노선). 범례 box 24×24 (line 216) → `w-6 h-6` (24, w-6 안전). select height (`padding:'7px 10px' fontSize:13` 자동 계산 ≈ 32px) — `--input-height` 토큰 (모바일 44 / 데스크톱 40) 적용 시 표 above area 가 커짐 → sketch 단계 결정.

### 룰 7 — feedback_text_caption_leading_none.md
- **요약**: `text-caption` lh:1.5 (18px) 가 h-8(32px) 컨테이너 안에서도 시각적 패딩. 헤더 토글/배지/칩 작은 영역은 `leading-none` 명시.
- **Why**: 작은 컨테이너 안 text-caption 이 line-height 1.5 때문에 의도보다 위/아래 시각 패딩 발생.
- **How to apply (16-workshift)**: 이름 열 헤더 "이름" 12px (line 138, height HDR_H=52) → `text-caption font-bold leading-none` (작은 셀 안 시각 패딩 방지) / staff title 10px (line 148, marginTop:2 작은 영역) → `text-caption leading-none text-text-tertiary` / day cell DOW_KO 10px (line 179, padding `4px 2px` 작은 영역) → `text-caption leading-none` / 범례 박스 안 글자 13px (line 216, 24×24 작은 컨테이너) → `text-label font-extrabold leading-none` / 범례 라벨 12px (line 217) → `text-caption leading-none`. 엑셀 버튼 12px (line 107, h:34 작은 컨테이너) → `text-caption font-bold leading-none`.

### 룰 8 — feedback_tsx_wave_emoji_dot_gap.md
- **요약**: alias sed-replace 만 X. sketch negative gate (이모지 0) + dot span 추가 markup 도 verify.
- **Why**: sketch 의 `🎯` `⬇` 같은 이모지/특수문자 글리프가 TSX 변환에서 빠지지 않고 그대로 남는 사고. dot span (`<span>·</span>`) 추가 markup 도 자동 적용 안 됨.
- **How to apply (16-workshift)**: WorkShiftPage 본문에는 이모지 0건 (현재 잘 지켜짐, source grep 결과 emoji 없음). W2~W4 sketch 진입 시 이모지/특수문자 절대 도입 금지 (negative gate). dot span 패턴 적용 대상 — staff title 이 marginTop:2 로 분리 (line 148) 라 dot span 무관. select 옵션 카피 "년" "월" 한자 안 들어가는지 verbatim 확인. day cell 의 `<div>{d}</div>` + `<div>{DOW_KO[dow]}</div>` (line 178~179) 두 div 사이 dot 추가 검토 X (현재 의도된 2줄 layout).

### 룰 9 — feedback_tsx_wave_stat_card_drift.md
- **요약**: executor 가 source outline 패턴 보존, sketch 새 패턴 누락 가능. plan 에 verbatim 인용 + verify gate 권장.
- **Why**: source 의 fontSize/색 패턴이 sketch 의 새 룰 (`bg-surface-raised border-l-[3px] border-accent`) 을 덮어쓰는 사고.
- **How to apply (16-workshift)**: 16-workshift 에는 Stat Card (28px display 숫자) 가 없으므로 §3.5 인용 후 "미적용" 메타 명시 (§3.5 참조). 단, sketch 새 패턴 (예: today 분기 매트릭스 — `border-accent` + `bg-accent-soft` / 공휴일·주말 색 분기 매트릭스 — `text-danger` / SHIFT_COLOR 4 카테고리 색 variant matrix) 은 verbatim 인용해 W5 checklist 박제. source WorkShiftPage.tsx 의 인라인 hex/var() 가 sketch 의 새 토큰 패턴을 덮어쓰지 않도록 명시 필수.

### 룰 10 — feedback_avoid_premature_confirmation.md
- **요약**: "거의 일치" 자신감 표현 금지. 결과 보여주고 사용자 판단.
- **Why**: 시각 작업은 사용자 인지에 의존 — Claude 의 "approved" 자체 판단은 무의미.
- **How to apply (16-workshift)**: 본 인덱스 작성 완료 후 "§7 OQ 5건 컨펌 부탁" 보고만. "wave 1 완벽 / W2 진입 가능" 같은 자신감 표현 금지. W2~W5 진입 시점도 사용자 컨펌 명시 받은 후에만. sketch 산출 후 "거의 일치 / 잘 됐다" 표현 금지.

### 룰 11 — feedback_korean_holidays_library_gap.md (★ WorkShiftPage 특화)
- **요약**: `@hyunbinseo/holidays-kr` 가 근로자의 날 등 비-법정휴일 누락. `utils/holidays.ts` 단일 fallback 으로 보강 패턴.
- **Why**: 라이브러리만 신뢰 시 5/1 같은 누락 케이스 빨강 표시 안 됨. fallback 필수.
- **How to apply (16-workshift)**: useQuery `['holidays-dates']` (line 23~40) 의 try/catch → [] fallback 은 의도된 설계 — fetch 실패 시 외부 의존 없이 빈 배열 반환. 단, 본 페이지는 `shiftCalc.ts isKoreanHolidayOrWeekend` 의 라이브러리+fallback 패턴과는 **별개 경로** (외부 hyunbin.page fetch 만 사용, 라이브러리 미사용). W5 TSX 변환 시 fetch URL `https://holidays.hyunbin.page/basic.json` / 응답 shape `Record<string, Record<string, string[]>>` (line 28) / fallback `return []` (line 36) 보존 필수. `@hyunbinseo/holidays-kr` 같은 다른 라이브러리로 교체 금지 — shiftCalc.ts 와 별개 시스템.

### 룰 12 — feedback_dashboard_horizontal_scroll.md (★ WorkShiftPage 특화)
- **요약**: 월간 도넛은 가로 스크롤. flex-wrap 으로 펼치지 말 것. 단일행+overflow-x:auto 가 의도된 디자인.
- **Why**: dashboard 월간 도넛에서 flex-wrap 으로 줄바꿈하면 정보 위계 무너짐. 단일행 + 가로 스크롤이 의도된 디자인.
- **How to apply (16-workshift)**: 날짜 열 (line 157, scrollRef) `flex:1, overflowX:auto` 가로 스크롤은 의도된 디자인 — daysInMonth 28~31일 모두 단일행 + 가로 scroll. **flex-wrap 으로 펼치거나 줄바꿈 처리 금지** (sketch 단계 표 영역 layout 변경 검토 시 negative gate). minWidth 40 per cell (line 171, 195) + overflowX auto 유지. 단, 범례 영역 (line 213) 은 의도적 `flexWrap:'wrap'` (4 box 모두 단일행 표시되면 OK, 모바일 좁은 폭에서 줄바꿈 허용) — 표 영역과 다른 패턴이라 혼동 금지.

---

# §6. negative rule (이 wave 에서 금지된 것)

본 wave (sketch wave 1 = 인덱스 작성) 에서 절대 하지 않는 것:

- **sketch HTML 생성 금지** — sketch 는 W2 부터. 본 wave 산출물은 markdown 1개 (`wave-1-index.md`) 만.
- **WorkShiftPage.tsx 코드 수정 금지** — `cha-bio-safety/src/pages/WorkShiftPage.tsx` 는 분석 대상이지 수정 대상이 아님. `git diff --name-only HEAD -- cha-bio-safety/src/pages/WorkShiftPage.tsx` 결과 0 줄.
- **shiftCalc.ts / generateExcel.ts 코드 수정 금지** — 비즈 로직 시그니처 (SHIFT_COLOR / DOW_KO / RawShift / getMonthlySchedule / generateShiftExcel / SHIFT_LABEL export) 변경 금지. 본 wave + W2~W5 모두 import/export 동일하게 유지.
- **비즈 로직 무관** — `handleExcel` / `setYear` / `setMonth` / `useStaffList` / `useIsDesktop` / `getMonthlySchedule` / `useQuery holidays` / `isToday` / `isRed` / `todayRef.scrollIntoView` / STAFF_ORDER 정렬 모두 본 wave 와 무관. 본 wave 는 markdown 1개만.
- **다른 페이지 (13-schedule / 14-reports / 27-login / 02 / 06 등) 영향 금지** — `git status` 에 16-workshift/ 외 변경 0.
- **wrangler 명령 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler.md` (디자인 wave 중 `wrangler --project-name=cbc7119` 절대 X). `.claude/settings.local.json` deny 강제. 본 워크트리 (cbc7119-design) 는 `cbc7119-preview.pages.dev` 만 다룸.
- **`npm run deploy` 금지** — `CLAUDE.local.md` 룰 + memory `feedback_cbc7119_design_never_wrangler.md`. `npm run deploy` 는 직원 도메인 (`cbc7119.pages.dev`) 경로. 본 워크트리에서 절대 금지. main push → GitHub Actions 자동 cbc7119-preview 배포만.
- **13-schedule + 14-reports + 27-login 의 평면 sketch-wave-*.html 패턴과 다른 폴더 구조 도입 금지** — 13-schedule 실측 = 평면(flat sibling). 14-reports + 27-login 도 동일. `sketch/` 서브폴더 만들지 않음. 16-workshift 도 동일 평면 배치 (`16-workshift/sketch-wave-N-{slug}.html`).
- **App.tsx 수정 금지** — `MOBILE_NO_NAV_PATHS` (line 71, `/workshift` 등재) + `DESKTOP_HEADER_HIDE_PATHS` (line 77, `/workshift` 등재) + `PAGE_TITLES` (line 89, `/workshift: '월간 출근부'` 등재) 모두 실측 확인됨. 본 wave + W2~W5 모두 `App.tsx` 손대지 않음.

---

# §7. open questions (W2 진입 직전 사용자 컨펌)

본 wave 산출 후 W2 sketch 진입 전 사용자에게 컨펌 받아야 할 항목 5건. 각 OQ 아래 "default 답" 1줄 — 사용자가 별 의견 없으면 이 답으로 진행 (reasonable call). 단, "approved" 받기 전까지 W2 진입 금지 (memory `feedback_avoid_premature_confirmation`).

- **OQ #1**: 엑셀 저장 버튼 `var(--acl)` 단색 (line 107) → `bg-safe-bar` solid 통일 OK?
  - **default 답: OK** — 27-login W1 OQ #1 + 14-reports W1 OQ #1/#3 default OK 일관 + design-system §6.4 CTA solid 룰 + memory `feedback_design_sketch_first` + `feedback_tailwind_token_class_pattern`. 현재 이미 그라데이션 없이 단색이므로 토큰 치환만 (`var(--acl)` → `bg-safe-bar`). disabled 시 = `opacity-60` 유지 또는 `bg-surface-sunken` (`var(--bg3)`) 검토.

- **OQ #2**: header chrome — 헤더 배경 현재 `var(--bg2)` (= `--surface-raised`, line 93). chrome 룰 §2.1 의 `bg-surface-page` 적용 검토. 추가로 데스크톱에도 back button 추가?
  - **default 답: 헤더 배경 raised 유지 / 데스크톱 back button 추가 X** — 02 InspectionPage 헤더와 raised 일관 (출근부도 점검 페이지 시리즈 아닌 운영 페이지로 비슷한 raised 패턴 합리적). 데스크톱 = 메뉴/탭 진입이라 `navigate(-1)` 의미 모호 (어디로 가야 하는지 사이드바가 책임). 모바일만 back button 유지.

- **OQ #3**: 폰트 격상 매핑 — 현재 fontSize:10 (staff title line 148 / DOW_KO line 179), fontSize:12 (이름 헤더 line 138 / 엑셀 버튼 line 107 / 범례 라벨 line 217), fontSize:13 (셀 day line 178 / select line 115,118 / 범례 박스 글자 line 216), fontSize:14 (모바일 헤더 타이틀 line 103 / staff name line 147), fontSize:15 (셀 shift line 197), fontSize:16 (데스크톱 헤더 타이틀 line 103). §1.1 9·10·11px 금지 위반 다수. 어디까지 격상?
  - **default 답: 부분 절충** — fontSize:10 → `text-caption` (12) 격상 (§1.1 위반 일괄 상향, 마이그레이션 §4.2) / fontSize:12 (이름 헤더 / 범례 라벨 / 엑셀 버튼) 는 `text-caption` (12) `leading-none` 명시하고 12px 유지 (표 dense layout 특성, 14-reports W1 footer 절충 패턴 mirror, memory `feedback_text_caption_leading_none`) / fontSize:13~15 본문 영역은 `text-label` (13) / `text-body-sm` (14) / `text-body` (16, 마지노선 — 셀 가독성 우선 데이터 핵심이라 15 → 16 격상 검토) 적용. 모바일 헤더 타이틀 14 → 16 격상 검토 (§1.3 모바일/데스크톱 동일 폰트 룰 부합 — 데스크톱 이미 16).

- **OQ #4**: 셀 배경 hex+opacity `SHIFT_COLOR[sh]+'22'` (line 198, line 216) — hex+22 알파 흉내. 디자인 토큰화 vs 인라인 유지?
  - **default 답: 인라인 유지** — 4 shift 색 (당 #ef4444 / 비 #3b82f6 / 주 #f59e0b / 휴 #6b7280) 은 카테고리/duty 컬러로 status 와 별개. 27-login OQ #2 CARD_COLORS 유사 룰 (인라인 rgba 유지). 토큰화 시 4종 색 × 알파 4종 새로 정의 비용 vs 인라인 1줄. SHIFT_COLOR hex 와 `--duty-day/-night/-off/-leave` 토큰 hex 가 일치하므로 duty 토큰 사용도 가능하지만, shiftCalc.ts 의 SHIFT_COLOR 단일 source 일관성 우선.

- **OQ #5**: today 셀 `2px solid var(--acl) + rgba(59,130,246,0.15)` (line 172~173, 196) 와 공휴일·주말 글자 `#ef4444` (line 174) — 디자인 토큰 치환?
  - **default 답: 토큰 치환 OK** — today border `var(--acl)` → `border-accent` (마이그레이션 §4.1 매핑) + today bg `rgba(59,130,246,0.15)` → `bg-accent-soft` 토큰 신규 정의 검토 또는 인라인 `bg-[rgba(59,130,246,0.15)]` 유지 / 공휴일·주말 색 `#ef4444` → `text-danger` 토큰 치환 (raw hex 사용은 W5 verify FAIL, memory `feedback_tailwind_token_class_pattern`). 16-workshift.md 섹션 4 "공휴일 빨강은 status-danger 가 아닌 캘린더 빨강 (별도 처리)" 명시이나, `#ef4444` 는 design-system §2.4 `--duty-night` (당직 빨강) hex 와 일치 — `text-danger` 토큰의 hex 와도 일치할 가능성 (tokens.css 실측 필요). default 는 `text-danger` 토큰 치환 (status 의미보다 색 hex 일치 우선) — W5 진입 시 tokens.css grep 으로 hex 매핑 정확성 확인 필수.

---

## 자체 verify (작성 완료 후 본 인덱스가 통과해야 할 gate)

본 문서가 후속 wave 진입 자격을 갖췄는지 verify:

| gate | 검증 명령 | 기대값 |
|---|---|---|
| 1. 7 헤더 존재 | `grep -c '^# §[1-7]' wave-1-index.md` | =7 |
| 2. sub-wave 분배 표 ≥4 | `grep -E '^\| W[2-5] \|' wave-1-index.md \| wc -l` | ≥4 |
| 3. 메모리 룰 unique ≥10 | `grep -oE 'feedback_[a-z_]+' wave-1-index.md \| sort -u \| wc -l` | ≥10 |
| 4. negative §6 안 wrangler+npm run deploy | `grep -c 'wrangler' wave-1-index.md` ≥1 & `grep -c 'npm run deploy' wave-1-index.md` ≥1 | 둘 다 ≥1 |
| 5. src/** 변경 0 | `git diff --name-only HEAD -- cha-bio-safety/src/pages/WorkShiftPage.tsx` | 0 lines |
| 6. OQ §7 ≥5 | `grep -cE 'OQ #[1-5]' wave-1-index.md` | ≥5 |
| 7. design-system fence ≥6 (open+close) | `grep -c '^```' wave-1-index.md` | ≥6 |

모두 PASS 시 본 인덱스가 W2 진입의 단일 진입점으로 자격을 갖춘 것으로 본다. 사용자 컨펌은 §7 OQ 5건 답변으로 받는다.

다음 wave 파일명: `sketch-wave-2-header-select.html` (OQ #1 답변 후 `/clear` + 새 `/gsd:quick` 시작 권장 — memory `feedback_gsd_workflow_strict`).
