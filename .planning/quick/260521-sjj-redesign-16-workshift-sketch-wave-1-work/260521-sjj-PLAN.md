---
phase: quick-260521-sjj
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md
autonomous: true
requirements:
  - REDESIGN-16-WAVE1
must_haves:
  truths:
    - "wave-1-index.md 파일이 cha-bio-safety/docs/redesign-context/16-workshift/ 직속에 생성됨 (sketch/ 서브폴더 X — 13-schedule + 14-reports + 27-login 평면 패턴 mirror)"
    - "7개 필수 섹션(§1~§7) 모두 채워짐"
    - "WorkShiftPage.tsx 인벤토리 표가 (1) 공통 hook/state/handler (2) 헤더 (3) 년/월 select (4) 표 영역 (이름 열 + 날짜 열 가로 스크롤) (5) 범례 5 영역 모두 포함"
    - "4 sub-wave 분배 표가 W2~W5 행을 모두 포함 (WorkShiftPage 가 226 lines 단순 페이지 — 27-login W1 패턴과 동일 4 sub-wave)"
    - "design-system.md §1.1/§1.2/§1.3/§6/§7 인용이 fence 안 verbatim 으로 포함 (§6/§7 은 미적용 1줄 메타 동반)"
    - "메모리 룰 12개가 inline 인용 (10건 + WorkShiftPage 특화 2건 — holidays library gap + dashboard horizontal scroll)"
    - "negative rule 섹션이 sketch HTML 금지 / 코드 수정 금지 / wrangler 금지 / npm run deploy 금지 / 평면 폴더 / App.tsx 미수정 / 비즈 시그니처 변경 금지 7건 포함"
    - "OQ 5건이 §7 에 정리됨 (WorkShiftPage 의 실제 결정 포인트 — 엑셀 버튼 / chrome / 폰트 격상 / 셀 hex+opacity / today border+공휴일 색)"
    - "WorkShiftPage.tsx + shiftCalc.ts + generateExcel.ts 코드 변경 0"
    - "/workshift 가 MOBILE_NO_NAV_PATHS 등재 (BottomNav 모바일 숨김) + DESKTOP_HEADER_HIDE_PATHS 등재 (글로벌 AppHeader 데스크톱 숨김) — App.tsx line 71+77 실측 결과 §4 에 박제"
  artifacts:
    - path: "cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md"
      provides: "W2~W5 진입을 위한 단일 진입점 인덱스 + 룰 verbatim 인용 + sub-wave 분배 매핑 (WorkShiftPage 단순 페이지용 4 sub-wave 분배)"
      contains: "§1. WorkShiftPage.tsx 인벤토리, §2. 4 sub-wave 분배, §3. design-system verbatim, §4. chrome 통일 룰 (출근부 = 점검 시리즈 아님 — 패턴 mirror만 + BottomNav/AppHeader 실측), §5. 메모리 룰 12개 inline, §6. negative rule, §7. open questions"
  key_links:
    - from: "wave-1-index.md"
      to: "cha-bio-safety/src/pages/WorkShiftPage.tsx"
      via: "§1 인벤토리에 line 범위 인용 + §2 sub-wave 분배 표의 element/line 매핑"
      pattern: "line [0-9]+"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/docs/redesign-context/16-workshift/design-system.md"
      via: "§3 fence verbatim 인용 (§1.1/§1.2/§1.3 본문 박제)"
      pattern: "design-system.md §"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md"
      via: "§4 chrome 룰 (출근부 = 점검 시리즈 아님 — chrome 룰 직접 적용 X / 헤더 패턴만 mirror)"
      pattern: "inspection-modal-chrome-rules"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/src/App.tsx"
      via: "§4 BottomNav/AppHeader 숨김 실측 — MOBILE_NO_NAV_PATHS (line 71) + DESKTOP_HEADER_HIDE_PATHS (line 77) 등재"
      pattern: "MOBILE_NO_NAV_PATHS|DESKTOP_HEADER_HIDE_PATHS"
    - from: "wave-1-index.md"
      to: "cha-bio-safety/src/utils/shiftCalc.ts"
      via: "§1 인벤토리 비즈 로직 보존 — SHIFT_COLOR / DOW_KO / getMonthlySchedule export 시그니처 박제"
      pattern: "SHIFT_COLOR|DOW_KO|getMonthlySchedule"
---

<objective>
redesign/16-workshift sketch 작업의 wave 1 — 후속 wave(W2~W5) 의 단일 진입점이 되는 인덱스/룰 정리 문서 1개만 작성한다.

Purpose: WorkShiftPage.tsx (226 라인 — 27-login LoginPage 220 라인 과 유사한 단순 페이지) 의 모든 element 를 **4 sub-wave** 로 분배 (27-login W1 패턴 mirror, 14-reports 6 sub-wave 보다 줄임), 그리고 design-system.md 룰과 메모리 룰 12개 (10 기본 + WorkShiftPage 특화 2건) 를 verbatim 박제해서 후속 sketch wave 작업자가 이 인덱스만 보면 일관되게 작업할 수 있도록 한다.

Output: `cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md` 단 1개 파일. 코드 변경 0건. sketch HTML 생성 0건 (그건 W2 부터).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md
@./CLAUDE.local.md

# 27-login W1 precedent (이번 wave 가 mirror 할 정확한 7 섹션 구조 + 4 sub-wave 패턴)
@.planning/quick/260521-c6p-redesign-27-login-sketch-wave-1-loginpag/260521-c6p-PLAN.md
@.planning/quick/260521-c6p-redesign-27-login-sketch-wave-1-loginpag/260521-c6p-SUMMARY.md

# 14-reports W1 (또 다른 precedent — 7 섹션 구조 origin)
@.planning/quick/260520-ep5-redesign-14-reports-sketch-wave-1-design/260520-ep5-PLAN.md

# Source files (이 wave 의 분석 대상, 수정 0)
@cha-bio-safety/src/pages/WorkShiftPage.tsx

# Redesign context (이 wave 가 산출할 인덱스가 인용/참조하는 문서들)
@cha-bio-safety/docs/redesign-context/16-workshift/16-workshift.md
@cha-bio-safety/docs/redesign-context/16-workshift/design-system.md
@cha-bio-safety/docs/redesign-context/00-design-context/inspection-modal-chrome-rules.md

# 27-login + 14-reports + 13-schedule 모두 평면 sibling 패턴 (sketch/ 서브폴더 없음). 본 wave 도 동일.
# 실제 경로: cha-bio-safety/docs/redesign-context/27-login/wave-1-index.md (343 lines)
</context>

<interfaces>
<!-- 후속 wave 가 산출할 sketch 파일 명명 규칙 (이 인덱스가 §2 표에서 인용) -->
<!-- 13-schedule + 14-reports + 27-login 평면 패턴 일관 — 16-workshift/ 직속에 위치 -->

W2 → cha-bio-safety/docs/redesign-context/16-workshift/sketch-wave-2-header-select.html
W3 → cha-bio-safety/docs/redesign-context/16-workshift/sketch-wave-3-shift-table.html
W4 → cha-bio-safety/docs/redesign-context/16-workshift/sketch-wave-4-legend.html
W5 → cha-bio-safety/docs/redesign-context/16-workshift/wave-5-tsx-conversion-checklist.md (markdown, sketch 아님)

(주의: planner 가 인벤토리 실측 후 가장 합리적인 4 sub-wave 분배로 결정했음. 위 label 은 권장안이며, 본 wave 작성 시 WorkShiftPage.tsx element 매핑 결과에 맞춰 §2 표에서 최종 확정. label 이 바뀌더라도 4-wave 개수와 sketch-wave-N-{slug}.html (W2~W4) + wave-5-tsx-conversion-checklist.md (W5) 평면 패턴은 유지.)

# 비즈 로직 시그니처 (W5 TSX 보존 checklist 의 anchor — 이 인덱스가 §1 + §6 에서 인용)
- getMonthlySchedule(year: number, month: number, staffForCalc: Staff[]): { daysInMonth: number, staffRows: StaffRow[] }
- SHIFT_COLOR: Record<RawShift, string>  // '당'/'비'/'주'/'휴' → hex color
- DOW_KO: ['일','월','화','수','목','금','토']
- RawShift = '당' | '비' | '주' | '휴'
- generateShiftExcel(year, month, staffForCalc): Promise<void>  // dynamic import
- useQuery(['holidays-dates']) → fetch https://holidays.hyunbin.page/basic.json → string[] (YYYY-MM-DD)
- useStaffList() → { data: Staff[] }
- useIsDesktop() → boolean (≥768px)
- STAFF_ORDER = ['석현민', '김병조', '윤종엽', '박보융']  // 정렬 고정
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: wave-1-index.md 작성</name>
  <files>cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md</files>
  <action>
WorkShiftPage.tsx (226 라인) 와 16-workshift.md / design-system.md / inspection-modal-chrome-rules.md 를 모두 끝까지 읽은 뒤 아래 7개 섹션을 가진 단일 markdown 파일을 작성한다. 파일은 Write 도구로 생성한다 (heredoc/cat 금지).

---

# 파일 헤더

상단에 다음 1블록:
- 제목: `# redesign/16-workshift — sketch wave 1 (index)`
- 1-2줄 설명: 본 문서는 W2~W5 진입의 단일 진입점이며, 이 인덱스만 봐도 후속 wave 가 디자인 룰 / 메모리 룰 / sub-wave 분배 / OQ 를 알 수 있도록 한다.
- 산출일자: 2026-05-21 / Quick ID 260521-sjj / branch redesign/16-workshift
- 1줄 메타: "27-login W1 (260521-c6p) 의 7 섹션 + 4 sub-wave 구조를 정확히 mirror. WorkShiftPage 가 226 lines 단순 페이지라 14-reports 6 sub-wave 가 아닌 4 sub-wave (W2~W5) 채택."

---

# §1. WorkShiftPage.tsx 인벤토리

WorkShiftPage.tsx 의 element 를 5 영역 (공통 hook/state/handler / 헤더 / 년월 select / 표 영역 / 범례) 으로 나눠 표로 정리. 각 행은 (영역 / element / source line 범위 / 역할 / 비즈 로직 연결 / 후속 wave 매핑) 6 컬럼.

**WorkShiftPage 의 구조 특이성** (인벤토리 머리말로 1단락):
- 모바일/데스크톱 분기 via `useIsDesktop()` (≥768px, line 15)
- 모바일/데스크톱 분기 지점은 chrome 만 다르고 (헤더 padding / 본문 paddingTop / back button 표시 여부), 표/범례는 공통
- 표는 2-table 구조 (이름 열 고정 table + 날짜 열 가로 스크롤 table) — `flex` 안 nested table — memory `feedback_dashboard_horizontal_scroll` 룰 동일 (flex-wrap 금지)
- HDR_H=52 / ROW_H=46 인라인 상수 (line 10~11)
- SHIFT_COLOR / DOW_KO / RawShift 모두 `src/utils/shiftCalc.ts` 에서 import (line 4)
- 외부 fetch: holidays.hyunbin.page (line 27) — memory `feedback_korean_holidays_library_gap` 의 fallback 패턴 (try/catch → [])

**영역 1: 공통 hook + state + handler** (line 1~82)
- imports + 상수 (line 1~11): SHIFT_LABEL / HDR_H / ROW_H
- useState 3: year / month / dlLoading (line 17~19)
- useRef 2: scrollRef / todayRef (line 20~21)
- useQuery holidays (line 23~40) — try/catch 외부 fetch fallback
- useStaffList + STAFF_ORDER 정렬 (line 42~48)
- getMonthlySchedule(year, month, staffForCalc) (line 49)
- isToday / isRed helpers (line 51~60)
- useEffect 자동 가운데 스크롤 (line 63~68)
- handleExcel dynamic import (line 70~82)
- 비즈: SHIFT_COLOR / DOW_KO / RawShift / generateShiftExcel
- 후속 wave: **무관** (비즈 로직 전부 보존, W5 checklist 에서 확인)

**영역 2: 헤더** (line 87~111)
- 모바일: padding `8px 12px 9px`, back button (34x34 var(--bg3) + svg ChevronLeft), 타이틀 fontSize 14, "엑셀 저장" 버튼 (var(--acl) 단색)
- 데스크톱: height 54, padding `0 20px`, back button **없음** (App.tsx DESKTOP_HEADER_HIDE_PATHS 에 `/workshift` 등재 — 글로벌 AppHeader 가 데스크톱에서 숨겨지고, WorkShiftPage 가 자체 헤더 렌더링)
- 헤더 배경 `var(--bg2)` (--surface-raised) + borderBottom `1px solid var(--bd)`
- 비즈: navigate(-1) / handleExcel / dlLoading
- 후속 wave: **W2** (헤더 + 년월 select 묶음)

**영역 3: 년/월 선택** (line 113~121)
- 컨테이너: flex gap 8, padding `10px 12px`, bg var(--bg2), borderBottom
- select 2개: year (2025~2027) / month (1~12)
- select 인라인 토큰: padding `7px 10px`, radius 9, bg var(--bg3), border 1px var(--bd2), fontSize 13
- 비즈: setYear / setMonth (자동 스크롤 effect 트리거)
- 후속 wave: **W2** (헤더와 같이 묶음)

**영역 4: 표 영역** (line 123~210)
- 외곽 컨테이너 (line 124~130): flex column, overflow auto, alignItems center, paddingTop `isDesktop ? '12vh' : 0`
- 내곽 wrapper (line 131): inline-flex column, padding `isDesktop ? '0 32px' : '16px 24px'`
- 표 row (line 132): flex (이름 열 + 날짜 열)
- **이름 열** (line 134~154): 고정. table > thead > th (HDR_H=52, width 82, padding `0 10px`, border `1px solid var(--bd)`, bg var(--bg3), fontSize 12 weight 700, "이름"). tbody > tr > td (ROW_H=46, padding `0 10px`, border, bg var(--bg2), staff name fontSize 14 weight 700, title fontSize 10 var(--t3))
- **날짜 열** (line 156~209): scrollRef, overflowX auto. table thead row 의 each th 는 day cell — HDR_H=52, minWidth 40, padding `4px 2px`. today 분기: `2px solid var(--acl) + rgba(59,130,246,0.15)`. red 분기 (공휴일/주말): `color: '#ef4444'`. d 표시 fontSize 13 weight 700, DOW_KO[dow] fontSize 10. tbody td 는 shift cell — ROW_H=46, minWidth 40, today border 분기, `color: SHIFT_COLOR[sh], background: SHIFT_COLOR[sh]+'22'` (hex+22 알파 흉내).
- 비즈: getMonthlySchedule / SHIFT_COLOR / DOW_KO / isToday / isRed / todayRef (자동 스크롤 anchor)
- 후속 wave: **W3** (표 영역 단독)

**영역 5: 범례** (line 213~220)
- 컨테이너: flex gap 14, padding `10px 0 28px`, flex-wrap, justifyContent center
- 4 shift box (당/비/주/휴): 24x24 + radius 5 + background `SHIFT_COLOR[sh]+'22'` + border 1.5px SHIFT_COLOR[sh] + 글자 fontSize 13 weight 800 SHIFT_COLOR[sh]
- 라벨 (SHIFT_LABEL[sh]): fontSize 12, color var(--t2)
- 비즈: SHIFT_COLOR / SHIFT_LABEL
- 후속 wave: **W4** (범례 단독)

인벤토리 작성 시 line 추정치는 실측 우선. 226 lines 와 일치 1줄 명시 (불일치 시 차이 보고).

---

# §2. 4 sub-wave 분배 plan

다음 표 그대로 박제 (단, 파일명은 위 <interfaces> 의 통일된 `sketch-wave-N-{slug}.html` 패턴 사용):

| Wave | scope | 대상 element | 산출 파일 |
|---|---|---|---|
| W2 | 헤더 + 년/월 select (chrome 통일 + 단색 CTA 검토) | 영역 2 (헤더 — 모바일/데스크톱 분기) + 영역 3 (년월 select 2개). 모바일/데스크톱 분기 표시 가독 (split panel or annotated). | sketch-wave-2-header-select.html |
| W3 | 표 영역 (이름 열 고정 + 날짜 열 가로 스크롤, today highlight, 공휴일·주말 색) | 영역 4 — 2-table 구조. nested flex. HDR_H=52 / ROW_H=46. today border + 공휴일 색 변종 모두 매트릭스. | sketch-wave-3-shift-table.html |
| W4 | 범례 (4 shift box + 라벨) | 영역 5 — 4 shift box 24x24 + 라벨. 모바일/데스크톱 padding 차이 정리. | sketch-wave-4-legend.html |
| W5 | TSX 변환 verify checklist (sketch 아님, markdown) | W2~W4 sketch + WorkShiftPage.tsx 비즈 로직 보존 룰 + Tailwind cheatsheet | wave-5-tsx-conversion-checklist.md |

각 wave 행 아래에 boldface "보존 / 토큰 / 폰트" 3 미니 섹션:
- **보존**: 변환 후 보존해야 할 비즈 로직 호출 —
  - W2: navigate(-1) / handleExcel / dlLoading 분기 / setYear / setMonth / year-month state lift / select 옵션 2025~2027 + 1~12 verbatim / 모바일/데스크톱 분기 (`useIsDesktop()`) verbatim
  - W3: getMonthlySchedule(year, month, staffForCalc) / SHIFT_COLOR (hex+22 알파 인라인) / DOW_KO / isToday / isRed / todayRef.scrollIntoView({inline:'center'}) / STAFF_ORDER 정렬 / HDR_H=52 / ROW_H=46 / 2-table 구조 (flex-wrap 금지)
  - W4: SHIFT_COLOR / SHIFT_LABEL / 4 shift `['당','비','주','휴']` 순서 verbatim
  - W5: 위 모든 항목의 TSX 보존 checklist + holidays fetch fallback 패턴 verbatim
- **토큰**: 적용할 디자인 토큰 — bg-surface-page / bg-surface-raised (현재 var(--bg2)) / bg-surface-sunken (select) / text-text-primary / text-text-secondary / text-text-tertiary / border-border-default / border-border-strong (select var(--bd2)) / bg-safe-bar (엑셀 버튼 OQ #1 default solid) / text-danger (공휴일·주말 #ef4444 OQ #5 default) / border-accent (today border OQ #5 default). **status- prefix 없음** (memory `feedback_tailwind_token_class_pattern`). SHIFT_COLOR 4종 hex+22 알파는 카테고리 색 — 인라인 유지 OK (OQ #4 default).
- **폰트**: 모바일/데스크톱 동일 폰트 룰 (design-system §1.3). 본문 16px 마지노선, 9~11px 금지 (§1.1). 현재 WorkShiftPage 의 fontSize 10 (title / DOW_KO / 행 부제) / fontSize 12 (이름 헤더 / 범례 라벨) / fontSize 13 (셀 day / 범례 박스 글자) / fontSize 14 (모바일 헤더 / staff name) / fontSize 15 (셀 shift) — §1.1 위반 후보 다수 (10/11/12). 단 표 dense layout 특성상 부분 절충 검토 (OQ #3).

---

# §3. design-system.md 인용 (verbatim 발췌, fence 안)

design-system.md (cha-bio-safety/docs/redesign-context/16-workshift/design-system.md) 를 읽고 아래 항목을 각각 별도의 ```fence 블록``` 안에 **원문 그대로** 박제 (불가피한 줄바꿈 제외 정확히 일치):

- §1.1 노안 친화 (본문 16px, 9~11px 금지, 터치 44px)
- §1.2 정보 인지 > 미적 정제
- §1.3 모바일/데스크톱 동일 폰트
- §6 Progress Color Rule → fence 인용 후 1줄 메타: "§6 미적용 — 출근부 페이지에는 진척률 도넛/카테고리 카드 없음. SHIFT_COLOR 4종은 카테고리 색 (status 와 별개)."
- §7 Stat Card → fence 인용 후 1줄 메타: "§7 미적용 — 출근부 페이지에는 통계 숫자 카드 없음."
- §7.1 Iconography (Lucide) — fence 인용 후 1줄 메타: "§7.1 — Lucide 사용 가능. 현재 헤더 back button 의 커스텀 SVG ChevronLeft (line 98~100) 를 Lucide `ChevronLeft` 로 교체 후보. W2 sketch 진입 시 결정."

만약 design-system.md 안 섹션 번호/제목이 실제 다르면 실제 파일 기준 §번호 맞춰 인용하고 1줄 메타에서 차이 명시.

추가:
- 기존 디자인 = 엑셀 저장 버튼 `var(--acl)` 단색 (line 107) → `bg-safe-bar` solid 통일 검토 — **default OK**. 근거: 27-login W1 OQ #1 default OK (그라데이션 → solid) + 14-reports W1 OQ #1/#3 default OK 일관 + design-system §6.4 CTA solid 룰 + memory `feedback_design_sketch_first` + `feedback_tailwind_token_class_pattern`. 이 결정은 §7 OQ #1 에서 사용자 컨펌 받음.

---

# §4. 02+06 chrome 통일 룰 적용 여부

`inspection-modal-chrome-rules.md` 를 읽고 1~2 단락으로 작성:

- 16-workshift 페이지는 점검 페이지 시리즈가 아닌 **운영 일정 페이지** → chrome 룰 자체는 **직접 적용 X**
- 단, 다음 3가지 패턴은 mirror 검토:
  1. **헤더 배경 토큰** — 현재 `var(--bg2)` (--surface-raised). chrome 룰 §2.1 의 `bg-surface-page` 통일 룰 mirror 검토 — §7 OQ #2 후보 (default: 현재 raised 유지가 02 InspectionPage 와 동일하므로 raised 유지)
  2. **back button 패턴** — 현재 모바일만 (line 96~102), 34x34 var(--bg3) + 커스텀 SVG. chrome 룰 §7.2 의 `w-8 h-8 bg-surface-sunken border-border-default` 패턴 + memory `feedback_tailwind_w8_h8_is_48px` 룰 (w-8=48 함정) 적용. 데스크톱 back button 추가 여부 — 데스크톱은 글로벌 AppHeader 가 hide 되고 WorkShiftPage 가 자체 헤더 렌더링 → §7 OQ #2 default: 데스크톱 back button 추가 X (메뉴/탭 진입 — navigated_to 가 아님)
  3. **BottomNav 숨김 / AppHeader 숨김** — App.tsx 실측: `/workshift` 가 `MOBILE_NO_NAV_PATHS` (line 71) 등재 → 모바일 BottomNav **숨김**. `DESKTOP_NO_NAV_PATHS` (line 74) 에는 **미등재** → 데스크톱 BottomNav **표시**. `DESKTOP_HEADER_HIDE_PATHS` (line 77) 에 등재 → 데스크톱 글로벌 AppHeader **숨김**.

**실측 결과 (App.tsx 본문 grep):**
```
line 71: MOBILE_NO_NAV_PATHS = [..., '/workshift', ...]
line 74: DESKTOP_NO_NAV_PATHS = ['/', '/login']  // /workshift 미등재
line 77: DESKTOP_HEADER_HIDE_PATHS = ['/elevator', '/div', '/floorplan', '/workshift']
line 89: '/workshift': '월간 출근부'  // PAGE_TITLES 등재
```

핵심 시사점:
- 모바일: 자체 헤더만, BottomNav 숨김 → sketch 시 nav placeholder 그릴 필요 없음
- 데스크톱: 자체 헤더만 (글로벌 AppHeader 숨김), BottomNav **표시** → sketch 시 데스크톱 시안 하단에 BottomNav 표시 영역 예약 필요 (실제 nav 그릴 필요는 없으나 표 영역 paddingTop `12vh` + BottomNav 하단 영향 인지)

---

# §5. 메모리 룰 inline 인용 (verbatim)

아래 12개 룰을 **각각 별도 미니 카드**로 박제. 각 카드 포맷 (boldface 라벨):

```
### 룰 N — {룰 슬러그}
- **요약**: 1줄
- **Why**: 1줄
- **How to apply (16-workshift)**: 1줄
```

12개 룰 (27-login W1 의 10개 + WorkShiftPage 특화 2개):
1. `feedback_design_sketch_first` — spacing/sizing 도 sketch HTML 시안 먼저
2. `feedback_redesign_sketch_rule_enforcement` — §6.2 negative rule / §6.3 §7.1 일관성
3. `feedback_sketch_realistic_data` — 표시 분기/라벨 룰 verbatim, 시각 디자인만
4. `feedback_planner_prompt_sketch_verbatim` — sketch CSS grep 추출, 추측 X
5. `feedback_tailwind_token_class_pattern` — status- prefix 없음
6. `feedback_tailwind_w8_h8_is_48px` — w-8=48 / w-7=32 함정
7. `feedback_text_caption_leading_none` — 작은 컨테이너 leading-none
8. `feedback_tsx_wave_emoji_dot_gap` — 이모지 제거 + dot span 추가
9. `feedback_tsx_wave_stat_card_drift` — Stat Card §6.3 룰 verbatim
10. `feedback_avoid_premature_confirmation` — "거의 일치" 자신감 표현 금지
11. `feedback_korean_holidays_library_gap` — ★ WorkShiftPage 특화 — holidays.hyunbin.page fetch fallback 룰 (try/catch → []), `@hyunbinseo/holidays-kr` 누락 보강 패턴
12. `feedback_dashboard_horizontal_scroll` — ★ WorkShiftPage 특화 — flex-wrap 으로 펼치지 말 것. 단일행+overflow-x:auto 가 의도된 디자인 (날짜 열 가로 스크롤 영역)

각 룰의 Why/How 는 WorkShiftPage 의 실제 element/상황으로 구체화. 예시 (각 룰 작성 시 참고, 그대로 박제 가능):
- **룰 1** (sketch first) — "W3 표 영역 cell 크기 (현재 HDR_H=52 / ROW_H=46 / minWidth=40) 조정도 spacing 손볼 거 있으면 sketch 먼저 보여주고 컨펌."
- **룰 2** (negative rule) — "SHIFT_COLOR 4종 (당/비/주/휴) 은 status 임계치 색이 아니라 카테고리 색 — `bg-status-safe-bg` 같은 위험 색 사용 금지 (memory `feedback_inspection_unresolved_color` 의 status 칩 룰과 무관)."
- **룰 3** (realistic data) — "STAFF_ORDER 4명 ('석현민', '김병조', '윤종엽', '박보융') verbatim. 시안에서 임의 이름 변경 금지. SHIFT_LABEL ('당직'/'비번'/'주간'/'휴무') 카피 verbatim."
- **룰 4** (verbatim grep) — "W5 TSX 변환 wave 진입 시 sketch HTML 의 CSS 정의 (예: today 분기 `2px solid var(--acl) + rgba(59,130,246,0.15)` / 셀 bg `SHIFT_COLOR[sh]+'22'`) 를 grep 으로 추출해 그대로 인용. 추측 토큰명 사용 시 deviation 유발."
- **룰 5** (token class pattern) — "공휴일·주말 색 `#ef4444` (line 174) → `text-danger` 토큰 치환. `text-status-danger` (status- prefix) 사용 시 W5 verify FAIL."
- **룰 6** (w-8=48px) — "엑셀 저장 버튼 현재 height 34. tailwind config spacing override 로 w-8=48 (1.5배), w-9=44, h-[34px] 명시 또는 w-9(44) 검토. back button 34x34 도 동일 함정."
- **룰 7** (leading-none) — "범례 24x24 박스 안 글자 fontSize 13 (line 216) / 이름 헤더 fontSize 12 (line 138) — text-caption(12px lh:1.5=18) 가 작은 컨테이너에서 시각 패딩 유발. leading-none 명시 검토."
- **룰 8** (dot gap) — "WorkShiftPage 본문에는 이모지 없음 → 적용 무관. 단 W5 진입 시 sketch HTML 에 이모지/dot span 추가/제거 분기 negative gate 유지."
- **룰 9** (Stat Card drift) — "출근부 페이지에 Stat Card 없음 → 미적용. 단 sketch 새 패턴 (예: today 분기 매트릭스) 은 W5 진입 시 verbatim 인용 필수."
- **룰 10** (premature confirmation) — "W2~W4 sketch 산출 후 '거의 일치 / 잘 됐다' 자신감 표현 금지. 결과 보여주고 사용자 판단."
- **룰 11** (holidays library gap) — "useQuery `['holidays-dates']` (line 23~40) 의 try/catch → [] fallback 은 의도된 설계. W5 TSX 변환 시 fetch URL / 응답 shape / fallback 보존 필수. `@hyunbinseo/holidays-kr` 같은 다른 라이브러리로 교체 금지."
- **룰 12** (horizontal scroll) — "날짜 열 (line 157, scrollRef) 가로 스크롤은 의도된 디자인. flex-wrap 으로 펼치거나 줄바꿈 처리 금지. minWidth 40 per cell + overflowX auto 유지."

---

# §6. negative rule (이 wave 에서 금지된 것)

bullet list:
- sketch HTML 생성 금지 (wave 2 부터)
- WorkShiftPage.tsx / shiftCalc.ts / generateExcel.ts 코드 수정 금지 (이 wave 의 산출물은 markdown 1개)
- 비즈 로직 시그니처 변경 금지 — SHIFT_COLOR / DOW_KO / RawShift / getMonthlySchedule / generateShiftExcel / STAFF_ORDER / useStaffList / useIsDesktop 모두 import/export 동일하게 유지
- 다른 페이지 (13-schedule, 14-reports, 27-login 등) 영향 금지
- **wrangler 명령 금지** (CLAUDE.local.md 룰 — `.claude/settings.local.json` deny 강제, memory `feedback_cbc7119_design_never_wrangler`)
- **`npm run deploy` 금지** (CLAUDE.local.md 룰 — 직원 도메인 경로)
- 13-schedule + 14-reports + 27-login 의 평면 sketch-wave-*.html 패턴과 다른 폴더 구조 도입 금지 (sketch/ 서브폴더 X — 16-workshift/ 직속에 평면 배치)
- App.tsx 미수정 — MOBILE_NO_NAV_PATHS / DESKTOP_HEADER_HIDE_PATHS / PAGE_TITLES 등재 상태 유지

---

# §7. open questions (W2 진입 직전 사용자 컨펌)

bullet list 5건:

- **OQ #1**: 엑셀 저장 버튼 `var(--acl)` 단색 (line 107) → `bg-safe-bar` solid 통일 OK?
  - default 답: **OK** (27-login W1 OQ #1 + 14-reports W1 OQ #1/#3 default OK 일관 + design-system §6.4 CTA solid 룰)

- **OQ #2**: header chrome — 헤더 배경 현재 `var(--bg2)` (--surface-raised). chrome 룰 §2.1 의 `bg-surface-page` 적용 검토. 추가로 데스크톱에도 back button 추가?
  - default 답: **헤더 배경 raised 유지 / 데스크톱 back button 추가 X** (02 InspectionPage 와 raised 일관 / 데스크톱 = 메뉴/탭 진입이라 navigated_to 아님)

- **OQ #3**: 폰트 격상 매핑 — 현재 fontSize:10 (title 부제 / DOW_KO), fontSize:11 등 9~11px 위반 후보 다수. 어디까지 격상?
  - default 답: **부분 절충** — fontSize:10 → text-caption(12px) 격상 / fontSize:12 (이름 헤더 / 범례 라벨) 는 leading-none 명시하고 12px 유지 (표 dense layout 특성) / fontSize:13~15 본문 영역은 유지. 14-reports W1 footer 절충 패턴 mirror.

- **OQ #4**: 셀 배경 hex+opacity `SHIFT_COLOR[sh]+'22'` (line 198, line 216) — hex+22 알파 흉내. 디자인 토큰화 vs 인라인 유지?
  - default 답: **인라인 유지** (4 shift 색은 카테고리 컬러로 status/duty 와 별개 — 27-login OQ #2 CARD_COLORS 유사 룰. 토큰화 시 4종 색 × 알파 4종 새로 정의 비용 vs 인라인 1줄)

- **OQ #5**: today 셀 `2px solid var(--acl) + rgba(59,130,246,0.15)` (line 172~173, 196) 와 공휴일·주말 글자 `#ef4444` (line 174) — 디자인 토큰 치환?
  - default 답: **토큰 치환 OK** — today border → `border-accent` (var(--acl)) + bg → `bg-accent-soft` (rgba(59,130,246,0.15) 토큰화 검토) / 공휴일·주말 색 #ef4444 → `text-danger` 토큰 치환 (raw hex 사용은 W5 verify FAIL)

각 OQ 아래에 "default 답" 1줄 (사용자가 별 의견 없으면 이 답으로 진행할 것이라는 reasonable call). 단, "approved" 받기 전까지 W2 진입 금지.

---

작성 완료 후 자체 verify:
1. 7개 섹션 모두 존재 (§1~§7) — grep `^# §[1-7]` 카운트 = 7
2. 메모리 룰 12개 인용 — 각 룰 슬러그 `feedback_*` 가 본문에 등장하는지 unique grep 카운트 ≥ 10
3. sub-wave 분배 표가 W2~W5 4행 — 표 안에 `| W[2-5] |` 카운트 ≥ 4 (정확히 4)
4. design-system 인용 fence 가 최소 3개 (§1.1 / §1.2 / §1.3 필수) — fence 카운트 ≥ 6 (open+close)
5. negative rule 안 `wrangler` + `npm run deploy` 키워드 모두 등장 (≥1 each)
6. OQ 5건 — `OQ #` 카운트 ≥ 5
7. WorkShiftPage.tsx 변경 0 — `git diff --name-only HEAD -- cha-bio-safety/src/pages/WorkShiftPage.tsx` 가 빈 출력
  </action>
  <verify>
    <automated>test -f cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md && \
echo "--- section count (expect 7) ---" && \
grep -c '^# §[1-7]' cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md && \
echo "--- subwave rows W2~W5 (expect 4) ---" && \
grep -E '^\| W[2-5] \|' cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md | wc -l && \
echo "--- memory rules unique (expect >=10) ---" && \
grep -oE 'feedback_[a-z_]+' cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md | sort -u | wc -l && \
echo "--- wrangler keyword in negative rule (expect >=1) ---" && \
grep -c 'wrangler' cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md && \
echo "--- npm run deploy keyword (expect >=1) ---" && \
grep -c 'npm run deploy' cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md && \
echo "--- OQ items #1~#5 (expect >=5) ---" && \
grep -cE 'OQ #[1-5]' cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md && \
echo "--- fence count (expect >=6) ---" && \
grep -c '^```' cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md && \
echo "--- WorkShiftPage.tsx unchanged (expect 0) ---" && \
git diff --name-only HEAD -- cha-bio-safety/src/pages/WorkShiftPage.tsx | wc -l && \
echo "--- shiftCalc.ts unchanged (expect 0) ---" && \
git diff --name-only HEAD -- cha-bio-safety/src/utils/shiftCalc.ts | wc -l</automated>
  </verify>
  <done>
- `cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md` 파일 존재 (sketch/ 서브폴더 X — 16-workshift/ 직속)
- 7개 섹션 (§1~§7) 모두 존재, grep 결과 = 7
- §2 sub-wave 표가 W2~W5 4행 모두 포함 (정확히 4)
- §1 인벤토리에 5 영역 (공통 hook/state/handler / 헤더 / 년월 select / 표 영역 / 범례) 모두 포함
- 메모리 룰 12개 (`feedback_*` 슬러그) 모두 inline 인용, unique count ≥ 10 (실제 12)
- WorkShiftPage 특화 룰 2건 (holidays_library_gap + dashboard_horizontal_scroll) 명시 포함
- design-system.md 인용 fence 최소 3개 (§1.1, §1.2, §1.3 필수)
- §4 에 MOBILE_NO_NAV_PATHS (workshift 등재) + DESKTOP_HEADER_HIDE_PATHS (workshift 등재) + DESKTOP_NO_NAV_PATHS (workshift 미등재) 실측 결과 박제
- §6 negative rule 안 `wrangler` 와 `npm run deploy` 키워드 모두 등장
- §7 OQ 5건 모두 정리, 각각 default 답 1줄 포함
- WorkShiftPage.tsx / shiftCalc.ts / generateExcel.ts 코드 변경 0 — `git diff --name-only` 모두 빈 출력
- 어떠한 sketch-wave-*.html 도 생성하지 않음 (W2 부터)
  </done>
</task>

</tasks>

<verification>
이 wave 의 verify 는 task 1 의 automated block 으로 충분. 추가 phase-level 검증 없음.

자체 검수 흐름:
1. `git status` — wave-1-index.md 1개 신규, 그 외 변경 0
2. `wc -l cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md` — 합리적 길이 (대략 280~380 줄 예상, WorkShiftPage 가 226 lines + WorkShiftPage 특화 룰 2건 추가라 27-login W1 343 lines 와 비슷하거나 약간 길 수 있음. 너무 짧으면 섹션 누락 가능성)
3. 사용자에게 "wave-1-index.md 작성 완료 / §7 OQ 5건 답변 필요" 보고 후 컨펌 대기 (W2 자동 진입 금지, memory `feedback_avoid_premature_confirmation`)
</verification>

<success_criteria>
- wave-1-index.md 7개 섹션 모두 채워짐 (§1 인벤토리 5영역 / §2 sub-wave 분배 4행 / §3 design-system verbatim / §4 chrome 룰 (출근부 = 점검 시리즈 아님, 패턴 mirror만 + App.tsx 실측 박제) / §5 메모리 룰 12개 (10 + WorkShiftPage 특화 2) / §6 negative / §7 OQ 5건)
- 코드 변경 0건 (WorkShiftPage.tsx / shiftCalc.ts / generateExcel.ts untouched)
- sketch HTML 0건 생성 (W2 부터)
- 13-schedule + 14-reports + 27-login 의 평면 sketch-wave-*.html 패턴 mirror — sketch/ 서브폴더 안 만듦
- 사용자 컨펌 받을 OQ 5건 정리됨 (엑셀 버튼 / chrome / 폰트 격상 / 셀 hex+opacity / today border+공휴일 색)
- automated verify 명령이 PASS (section=7 / subwave=4 / rules≥10 / wrangler≥1 / deploy≥1 / OQ≥5 / fence≥6 / src 변경=0)
</success_criteria>

<output>
After completion, return summary to user:
- 생성 파일: `cha-bio-safety/docs/redesign-context/16-workshift/wave-1-index.md`
- §7 OQ 5건 사용자 컨펌 대기
- W2 진입 = OQ #1 답변 후 (`/clear` + 새 `/gsd:quick` 시작 권장 — memory `feedback_gsd_workflow_strict`)
- 다음 wave 파일명 권장: `sketch-wave-2-header-select.html`
</output>
