---
phase: 260528-hbv-phase-b-wave-6-schedule-education
plan: 01
subsystem: redesign/phase-b-sweep
status: complete
tags: [schedule, education, inline-style-to-tailwind, no-op-refactor, phase-b-tier-1-wave-6, inp-lbl-shared-style, isdesktop-modal-option-m, cat-color-dynamic-option-n, monthly-plan-preview-cellstyle-spread, atomic-single-commit, single-wave-max]
requires:
  - 260528-h3z-phase-b-wave-5 완료 (db728c0)
  - 260528-gsh-phase-b-wave-4 완료 (05fddf1)
  - 260528-cjn-phase-b-wave-3 완료 (a78963f + 4e99270)
  - 260528-c9s-phase-b-wave-2 완료 (d36a20f)
  - 260528-a3v-phase-b-wave-1 완료 (18fd138)
  - 260527-wdc-legalpage-phase-b 옵션 X+P+M+색변수N 확정 (184e548)
  - 260528-0hr-phase-b-master-roadmap v2 (ROADMAP only)
provides:
  - SchedulePage.tsx Phase B 완료 (83 → 20 잔존 = inp/lbl shared spread + isDesktop M + MonthlyPlanPreview cellStyle/headCell spread + cat?.color 동적 5건)
  - EducationPage.tsx Phase B 완료 (54 → 3 잔존 = fontFamily 'inherit' 2건 + sectionLabelStyle spread 1건)
  - Phase B Tier 1 Wave 6 (일정/교육 — 단일 wave 최대치 137) 완료
affects:
  - src/pages/SchedulePage.tsx
  - src/pages/EducationPage.tsx
tech-stack:
  added: []
  patterns:
    - "옵션 X (정확값 arbitrary) — `px-[28px]`/`px-[10px]`/`py-[14px]`/`leading-[1.4]`/`leading-[1.5]`/`leading-[1.3]`/`rounded-t-[20px]`/`rounded-[9px]`/`mb-[18px]`/`min-h-[80px]`/`h-[130px]`/`h-[88px]`/`mt-[10px]`/`mt-[2px]`/`mb-[2px]`/`w-[32px]`/`h-[32px]`/`w-[300px]`/`gap-[5px]`/`gap-[10px]`/`pb-[28px]` 정확값 보존"
    - "옵션 P — `leading-none`/`leading-relaxed`/`leading-snug` 명시 보존 (Phase A 결과 보존)"
    - "옵션 M (className conditional) — Schedule 신규 4건: L313 calendar 일자 isSel border/bg/rounded + L919 AddModal outer flex/items + L922 AddModal inner rounded/padding/width + L1106 EditModal outer flex/items + L1109 EditModal inner rounded/padding/width. Education 신규 2건: L93 StaffEducationCard canEdit cursor + L376 button isSubmitting cursor/opacity + L307 button isSubmitting cursor"
    - "옵션 N — Schedule 20건 잔존: inp/lbl 정의 자체 보존 + `style={{ ...inp, resize:'none', lineHeight:N }}` 5건 textarea spread + `style={{ ...inp, ...(titleError ? ... : {}) }}` 1건 + cat?.color/cat?.borderBottomColor 동적 색 5건 (L326/L373/L485/L905 dynamic borderColor/background/color/L1127 cat?.color dot) + AddModal 3 카테고리 grid button (SCHED_CATEGORIES/ELEV_SUBCATS/FIRE_SUBCATS) inline borderColor/background/color (L905/L967/L999) + MonthlyPlanPreview `style={{ ...cellStyle/...headCell, ... }}` 6건 (L674/L691/L698/L714/L715/L742/L755). Education 3건 잔존: L290/L300 input/select fontFamily:'inherit' (Wave 5 precedent — tailwind 표현 불가) + L416 `{ ...sectionLabelStyle, marginTop: dynamic }` spread"
    - "Schedule MonthlyPlanPreview width-only spread 4건 → `<th className=\"w-[N%]\" style={headCell}>` 단일 참조 전환 (style={{ → style={ 카운트 제거) — L666/L667/L686/L690 4건 그렇게 처리. cellStyle/headCell 변수 자체 보존 (옵션 N — shared style object)"
    - "Schedule `style={{ ...inp, display:'block', WebkitAppearance:'none', height:44 }}` 6건 → `className=\"block [-webkit-appearance:none] h-11\" style={inp}` 변환 (inp 변수에 display/WebkitAppearance/height 정의 없음 → className 충돌 없음, 시각 0 byte)"
    - "rounded-md 함정 회피 — Wave 5/4 precedent — borderRadius:9 → `rounded-[9px]` arbitrary (rounded-md=12 함정 회피, ELEV/FIRE 카테고리 버튼)"
    - "px-7=32 함정 회피 — pt-6 (24px config) + px-[28px] arbitrary (28px non-config) + pb-[28px] arbitrary — modal padding 정확값 보존 (Plan context 명시 — px-7 가 config에서 32px 이라 28px 의도 시 명시적 arbitrary 사용)"
    - "h-12 default = 48px 함정 회피 — Education L538 mobile header height:48 → `h-12` (Plan context 명시 — h-12 default=48px, h-8 config override 도 48 이지만 default 권장 직관적)"
    - "pl-11 default = 44px / w-11 default = 44px — Education L134 pl-11 + L559 w-11 default 값으로 정확 매핑"
key-files:
  created:
    - .planning/quick/260528-hbv-phase-b-wave-6/260528-hbv-SUMMARY.md
  modified:
    - src/pages/SchedulePage.tsx
    - src/pages/EducationPage.tsx
decisions:
  - "wdc/01h/a3v/c9s/cjn/gsh/h3z 승계 옵션 X+P+M+색변수N — 사용자 재컨펌 불필요 (0hr roadmap locked)"
  - "Schedule inp/lbl shared style 정의 절대 보존 (L1174/L1178) — Phase B 스코프 외 (옵션 N 잔존 룰)"
  - "Schedule `style={{ ...inp, display:'block', WebkitAppearance:'none', height:44 }}` 6건 — className 분리 + style={inp} 단일 참조 전환. inp 변수에 display/WebkitAppearance/height 정의 없음 → CSS 충돌 0, 시각 0 byte 보장"
  - "Schedule MonthlyPlanPreview width-only spread 4건 (L666/L667/L686/L690) — `<th className=\"w-[N%]\" style={headCell}>` 단일 참조 전환. headCell 변수에 width 정의 없음 → CSS 충돌 0"
  - "Schedule MonthlyPlanPreview textAlign/fontWeight/fontSize spread 7건 (L691/L674/L698/L714/L715/L742/L755) — cellStyle/headCell 에 동일 prop 정의 있음 (textAlign:'center'/fontWeight:700) → 인라인 style spread 로 override 필수. className 분리 불가 (인라인 style 우선순위가 className 보다 높아 충돌). 옵션 N 잔존"
  - "Schedule AddModal/EditModal isDesktop conditional 2종 — 모달 outer wrapper `bg-[rgba(0,0,0,0.55)]` 정적 + `${isDesktop ? 'justify-center items-center' : 'justify-end'}` 옵션 M. 모달 inner wrapper `max-h-[90dvh] ${isDesktop ? 'rounded-lg pt-6 px-[28px] pb-[28px] w-[480px] max-w-[90vw]' : 'rounded-t-[20px] pt-5 px-4 pb-10'}` 옵션 M"
  - "Schedule 캘린더 button (L313) — `borderRadius`/`background`/`border` 3 prop 동시 isSel 분기 → 단일 className template literal 옵션 M `${isSel ? 'rounded-sm bg-[rgba(59,130,246,0.15)] border-[#3b82f6]' : 'rounded-none bg-transparent border-transparent'}`. inner span (구 L323) bg-accent/bg-transparent 분기는 isSel/isToday className 합병으로 정리"
  - "Schedule SCHED_CATEGORIES/ELEV_SUBCATS/FIRE_SUBCATS 3 그리드 버튼 (L905/L967/L999) — 정적 padding/rounded/fontSize/fontWeight/cursor className 분리 + 동적 borderColor/background/color 옵션 N 잔존. ELEV/FIRE rounded:9 → `rounded-[9px]` arbitrary (rounded-md=12 함정 회피)"
  - "Education `fontFamily: 'inherit'` 옵션 N 잔존 — Wave 5 RemediationDetailPage L486/L496 precedent 동일. tailwind utility 표현 불가 (font-sans 은 Pretendard Variable 고정값)"
  - "Education sectionLabelStyle spread L416 옵션 N 잔존 — 동적 marginTop 분기 + dynamic fontSize (isDesktop ? 15 : 13 — 비-token 값) 변수 자체 보존"
  - "Education `pl-11`/`w-11` default = 44px / `h-12` default = 48px / `px-[32px]` arbitrary (px-7=32 함정 회피) — Plan context 명시 정확 매핑"
  - "단일 atomic commit 패턴 — 28-splash/27-login/23-education/c9s/cjn/gsh/h3z 정밀도 패턴 자동 도달"
metrics:
  duration: "약 20분 (Task 1 atomic — single commit, 137 inline 최대치)"
  completed-date: 2026-05-28
  tasks-completed: "1/1"
  files-modified: 2
  lines-changed: "142 ins / 290 del (net -148 lines, atomic single commit)"
roadmap-wave: "Tier 1 / Wave 6 (일정/교육 — 단일 wave 최대치 137)"
---

# Phase 260528-hbv Plan 01: Phase B Wave 6 일정/교육 Summary

SchedulePage (1240줄, 83 inline) + EducationPage (586줄, 54 inline) 2 페이지의 inline style 을 wdc/01h/a3v/c9s/cjn/gsh/h3z 승계 옵션 X+P+M+색변수N 으로 tailwind className 으로 일괄 변환. **위험 anchor 4 종류 동시 보존** — Schedule 의 inp/lbl shared style 정의 (L1174/L1178 const React.CSSProperties 변수 자체) + Schedule 의 isDesktop conditional 모달 2종 (AddModal L919/L922 + EditModal L1106/L1109 옵션 M template literal 변환) + Schedule 의 MonthlyPlanPreview cellStyle/headCell shared style spread (cellStyle 의 textAlign:'center' / fontSize:12 / headCell 의 fontWeight:700 override 룰 보존 — 7건 옵션 N 잔존) + Schedule 의 cat?.color 동적 색 5건 (SCHED_CATEGORIES 5 카테고리 동적 색). **`style={{ ...inp, display:'block', WebkitAppearance:'none', height:44 }}` 6건 변환** — className 분리 + `style={inp}` 단일 참조 (style={{ → style={ 카운트 6 제거). **MonthlyPlanPreview width-only spread 4건** (L666/L667/L686/L690) → `<th className="w-[N%]" style={headCell}>` 전환 (style={{ → style={ 카운트 4 제거). **rounded-md=12px override 함정 회피** 위해 ELEV/FIRE 카테고리 버튼의 borderRadius:9 원본을 `rounded-[9px]` arbitrary 사용. **px-7=32 함정 회피** 위해 모달 padding 28px → `px-[28px]`/`pb-[28px]` arbitrary 사용. 시각 결과 0 byte 변경 (no-op refactor). Phase A 결과 (Lucide / 색 토큰 -bar / emoji 0 / 비표준 색 0) 및 비즈니스 로직 (scheduleApi.create/update/updateStatus/delete/getByMonth + fetchHolidays + generateMonthlyPlan + INSP_DEFAULTS/INSP_CATEGORIES/SCHED_CATEGORIES/STATUS_LABEL/STATUS_TW/ELEV_SUBCATS/FIRE_SUBCATS/PLAN_PREVIEW_ROWS + AddModal/EditModal/MonthlyPlanPreview 3 sub-component + educationApi.create/update/delete/list + calcNextDeadline/titleRank/DdayBadge/StaffEducationCard/EducationEditPanel/EducationBottomSheet) 모두 보존. Phase B Tier 1 Wave 6 성공 — 단일 wave 137 inline 최대치 처리.

## User Decisions (승계 — wdc / 01h / a3v / c9s / cjn / gsh / h3z / 0hr-roadmap 재확인 불필요)

| ID  | 선택                                                          | 출처                              |
| --- | ------------------------------------------------------------- | --------------------------------- |
| (b) | **옵션 X** — 정확값 arbitrary `[Npx]` (시각 0 byte)            | wdc Phase B Task 2 결정            |
| (c) | **옵션 P** — `leading-none/leading-relaxed` 명시 보존          | wdc Phase B Task 2 결정            |
| (d) | **옵션 M + 색 변수만 N** — template literal conditional 우선   | wdc Phase B Task 2 결정            |
| -   | **a3v/c9s/cjn/gsh/h3z 승계 적용** — 본 wave 사용자 재확인 없이 진행 | 260528-0hr roadmap v2 locked-decisions |
| -   | **inp/lbl 정의 보존** — Schedule shared style React.CSSProperties const 자체 보존 (Plan locked decision) | Plan locked_decisions |

## Before / After 카운트

| Metric (`style={{` count)        | Before | After   | Diff             |
| -------------------------------- | ------ | ------- | ---------------- |
| SchedulePage.tsx                 | **83** | **20**  | **-63 (-76%)**   |
| EducationPage.tsx                | **54** | **3**   | **-51 (-94%)**   |
| **합계**                          | **137** | **23** | **-114 (-83%)**  |

총 변경: 2 files, 142 ins / 290 del, net -148 lines. PLAN 예상 (137→~20-25) 정확히 달성 (23 잔존).

## 변환 매핑 (SchedulePage — 63건 변환, 20건 옵션 N 잔존)

### 캘린더 button 변환 (1건 옵션 M — 3 prop 분기 합병)

| Line (orig) | Before                                                                                                              | After                                                                                                                                                                  | 패턴            |
| ----------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| L311 button | `borderRadius: isSel ? 8 : 0, background: isSel ? 'rgba(59,130,246,0.15)' : 'transparent', border: isSel ? '2px solid #3b82f6' : '2px solid transparent'` | className template literal `border-2 ${isSel ? 'rounded-sm bg-[rgba(59,130,246,0.15)] border-[#3b82f6]' : 'rounded-none bg-transparent border-transparent'}` | 옵션 M           |
| L323 inner span | `width: 24, height: 24, background: isToday && !isSel ? 'var(--accent)' : 'transparent'`                       | className `w-6 h-6` + isSel/isToday 분기 className `bg-transparent`/`bg-accent`로 정리 (기존 text-* 분기와 합병)                                                       | 옵션 X + 합병   |

### renderCard 변환 (8건)

| Line (orig) | Before (요약)                                                                                                                                       | After                                                                                                                                                                            | 패턴            |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| L377 root   | `padding: '12px 14px', ...(grouped ? { height: 130, display: 'flex', flexDirection: 'column' } : {})`                                                | className 통째 `px-[14px] py-3 ${grouped ? 'h-[130px] flex flex-col' : ''}`                                                                                                       | 옵션 M + X      |
| L385 cat chip non-grouped | `padding: '2px 8px', lineHeight: 1.4` (+ cat?.color/bg 동적)                                                                            | className `px-2 py-0.5 leading-[1.4]` + 잔존 옵션 N color/background                                                                                                              | P1/P4 + 옵션 N |
| L393 insp chip | `padding: '2px 8px', lineHeight: 1.4`                                                                                                            | className `px-2 py-0.5 leading-[1.4]` 통째                                                                                                                                        | P1/P4           |
| L405 title  | `marginBottom: (item.memo || item.time || multiDayText) ? 4 : 0`                                                                                     | className conditional `${(item.memo || item.time || multiDayText) ? 'mb-1' : 'mb-0'}`                                                                                            | 옵션 M           |
| L411 메모 + 시간 wrapper | `flex: grouped ? 1 : undefined, minHeight: 0, overflow: 'hidden'`                                                                       | className `min-h-0 overflow-hidden ${grouped ? 'flex-1' : ''}`                                                                                                                    | P2/P3 + 옵션 M  |
| L414 memo   | `whiteSpace: 'pre-line', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: grouped ? 2 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: ...` | className 통째 `whitespace-pre-line leading-[1.5] [display:-webkit-box] [-webkit-box-orient:vertical] overflow-hidden ${grouped ? '[-webkit-line-clamp:2]' : '[-webkit-line-clamp:3]'} ${(item.time || multiDayText) ? 'mb-1' : 'mb-0'}` | P4 + 옵션 M + arbitrary CSS prop |
| L430/L432 시간/멀티데이 | `lineHeight: 1.4`                                                                                                                          | className `leading-[1.4]` 통째                                                                                                                                                    | P4              |
| L437 액션 row | `marginTop: grouped ? 'auto' : 8, paddingTop: grouped ? 4 : 0`                                                                                     | className conditional `${grouped ? 'mt-auto pt-1' : 'mt-2 pt-0'}`                                                                                                                 | 옵션 M           |
| L440-L457 3 액션 button | 각각 `padding: '4px 10px', lineHeight: 1.4`                                                                                            | className `px-[10px] py-1 leading-[1.4]` 각 버튼                                                                                                                                  | P1/P4           |

### 빈 일정 + grouped 컬럼 변환 (2건)

| Line (orig) | Before                                                                                                          | After                                                                              | 패턴            |
| ----------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------- |
| L494 (구 L495) 빈 일정 button | `padding: '10px 20px'`                                                                                | className `px-5 py-[10px]` (5=20 config + 10px arbitrary)                          | P1/X            |
| L515 group div | `flex: '0 0 auto', width: 300, minWidth: 0`                                                                  | className `flex-none w-[300px] min-w-0`                                            | P3               |
| L517 group 헤더 | `padding: '3px 0', borderBottom: '2px solid ${cat?.color}44'` (+ color 동적)                                | className `py-[3px] border-b-2` + style 옵션 N (color + borderBottomColor 동적)    | 옵션 X + 옵션 N |

### 모바일 FAB 변환 (1건)

| Line (orig) | Before                                                                                          | After                                                                                              | 패턴            |
| ----------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------- |
| L646 FAB    | `boxShadow: '0 4px 12px rgba(59,130,246,0.4)'`                                                  | className 합병 `shadow-[0_4px_12px_rgba(59,130,246,0.4)]`                                          | arbitrary       |

### MonthlyPlanPreview 변환 (3건)

| Line (orig) | Before                                                                                                       | After                                                                          | 패턴            |
| ----------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | --------------- |
| L694 root   | `width: '100%', padding: '12px 20px 8px', background: 'var(--surface-raised)'`                              | className 통째 `w-full px-5 pt-3 pb-2 bg-surface-raised`                        | P1/P3 + token   |
| L696 title  | `textAlign: 'center', fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)'`         | className 통째 `text-center text-body-sm font-bold mb-2 text-text-primary`     | P3/P4 + token   |
| L700 table  | `width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed'`                                            | className `w-full table-fixed [border-collapse:collapse]`                       | P3 + arbitrary  |

### MonthlyPlanPreview width-only spread 단일 참조 전환 (4건 — 옵션 X)

| Line | Before                                                | After                                                | 비고                                                                           |
| ---- | ----------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| L666 | `style={{ ...headCell, width: '2%' }}`                 | `className="w-[2%]" style={headCell}`                | headCell 변수 자체 단일 참조 (style={{ → style={ 카운트 제거). headCell 에 width 미정의 → 충돌 0 |
| L667 | `style={{ ...headCell, width: '20%' }}`                | `className="w-[20%]" style={headCell}`               | 동일                                                                            |
| L686 | `style={{ ...headCell, width: '6%' }}`                 | `className="w-[6%]" style={headCell}`                | 동일                                                                            |
| L690 | `style={{ ...headCell, width: '2%' }}`                 | `className="w-[2%]" style={headCell}`                | 동일                                                                            |

### AddModal/EditModal 옵션 M conditional 변환 (4건)

| Line | Before                                                                                                                                                                                                                  | After                                                                                                                                                       | 패턴   |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| L920 (AddModal outer) | `background:'rgba(0,0,0,0.55)', justifyContent: isDesktop ? 'center' : 'flex-end', alignItems: isDesktop ? 'center' : undefined`                                                                          | className template literal `bg-[rgba(0,0,0,0.55)] ${isDesktop ? 'justify-center items-center' : 'justify-end'}`                                              | 옵션 M |
| L926 (AddModal inner) | `borderRadius: isDesktop ? 16 : '20px 20px 0 0', padding: isDesktop ? '24px 28px 28px' : '20px 16px 40px', maxHeight: '90dvh', ...(isDesktop ? { width: 480, maxWidth: '90vw' } : {})`                  | className `max-h-[90dvh] ${isDesktop ? 'rounded-lg pt-6 px-[28px] pb-[28px] w-[480px] max-w-[90vw]' : 'rounded-t-[20px] pt-5 px-4 pb-10'}` (px-7=32 함정 회피) | 옵션 M |
| L1105 (EditModal outer) | `background:'rgba(0,0,0,0.55)'` + 기존 `${isDesktop ? 'justify-center items-center' : 'justify-end'}` 합병                                                                                              | className `bg-[rgba(0,0,0,0.55)] ${isDesktop ? 'justify-center items-center' : 'justify-end'}` (style 완전 제거)                                              | 옵션 M |
| L1108 (EditModal inner) | 동일 패턴 AddModal inner                                                                                                                                                                                  | 동일 패턴                                                                                                                                                    | 옵션 M |

### AddModal 본문 변환 (10+건)

| Line (orig) | Before                                                                                              | After                                                                            | 패턴            |
| ----------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------- |
| L935 header | `marginBottom: 18`                                                                                  | className `mb-[18px]`                                                            | arbitrary       |
| L944 form wrapper | `display:'flex', flexDirection:'column', gap:16`                                              | className `flex flex-col gap-4`                                                  | P2/P3           |
| L949 SCHED grid | `display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:5`                                    | className `grid grid-cols-5 gap-[5px]`                                           | P2/X            |
| L952 SCHED button static | `padding:'10px 0', borderRadius:8, fontSize:12, fontWeight:700, lineHeight:1, cursor:'pointer'` | className `py-[10px] rounded-sm text-caption font-bold leading-none cursor-pointer border` + style 잔존 옵션 N (borderColor/background/color) | 옵션 X + P5 + N |
| L1010 ELEV grid | `display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6`                                    | className `grid grid-cols-3 gap-1.5`                                              | P2              |
| L1013 ELEV button static | `padding:'9px 0', borderRadius:9, fontSize:12, fontWeight:700, cursor:'pointer'`             | className `py-[9px] rounded-[9px] text-caption font-bold cursor-pointer border` + style 잔존 옵션 N (rounded-md=12 함정 회피) | 옵션 X + 옵션 N |
| L1040 FIRE grid | `display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6`                                    | className `grid grid-cols-4 gap-1.5`                                              | P2              |
| L1043 FIRE button static | `padding:'8px 4px', borderRadius:9, fontSize:12, fontWeight:700, cursor:'pointer', lineHeight:1.4` | className `px-1 py-2 rounded-[9px] text-caption font-bold cursor-pointer leading-[1.4] border` + style 잔존 옵션 N | 옵션 X + 옵션 N |
| L1066/L1080 date row | `display:'flex', gap:10`                                                                    | className `flex gap-[10px]`                                                       | P2              |
| L1067/L1072/L1081/L1086 date col | `flex:'0 0 calc(50% - 5px)', minWidth:0, overflow:'hidden'`                       | className `flex-[0_0_calc(50%_-_5px)] min-w-0 overflow-hidden`                    | P3 + arbitrary CSS calc |
| L1094 N일 안내 | `fontSize:12, color:'var(--accent)', fontWeight:600, textAlign:'center', marginTop:-8`              | className `text-caption text-accent font-semibold text-center -mt-2`              | P3/P4 + token   |
| L1102 button row | `display:'grid', gridTemplateColumns:'1fr 3fr 1fr', gap:6, marginTop:4`                          | className `grid grid-cols-[1fr_3fr_1fr] gap-1.5 mt-1`                              | P2/P3 + arbitrary |
| L1103/L1116 prev/next btn | `padding:'14px 0', borderRadius:12, border:'1px solid var(--border-strong)', background:'var(--surface-sunken)', color:'var(--text-secondary)', fontSize:18, lineHeight:1, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'` | className 통째 `px-0 py-[14px] rounded-md border border-border-strong bg-surface-sunken text-text-secondary text-title leading-none cursor-pointer flex items-center justify-center` | P1/P2/P3/P5 + token |
| L1109 save btn | `padding:'14px', borderRadius:12, border:'none', background:'var(--accent)', color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', opacity:saving?0.6:1` | className `p-[14px] rounded-md border-0 bg-accent text-white text-body font-bold cursor-pointer ${saving ? 'opacity-60' : 'opacity-100'}` (옵션 M opacity) | 옵션 M + P1/P5 + token |

### EditModal 본문 변환 (5건)

| Line (orig) | Before                                                                                              | After                                                                            | 패턴            |
| ----------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------- |
| L1168 header | `marginBottom: 18`                                                                                 | className `mb-[18px]`                                                            | arbitrary       |
| L1177 form wrapper | `display:'flex', flexDirection:'column', gap:16`                                             | className `flex flex-col gap-4`                                                  | P2/P3           |
| L1201 date row | `display:'flex', gap:10`                                                                          | className `flex gap-[10px]`                                                       | P2              |
| L1202/L1207 date col | `flex:1`                                                                                    | className `flex-1`                                                                | P3              |
| L1218 save btn | `padding:'14px', opacity: saving ? 0.6 : 1`                                                       | className `p-[14px] ${saving ? 'opacity-60' : 'opacity-100'}` (옵션 M)            | 옵션 M + P1     |

### `style={{ ...inp, display:'block', WebkitAppearance:'none', height:44 }}` 6건 → `style={inp}` 단일 참조 변환

| Line (orig) | Before                                                                                                  | After                                                                                                            | 비고                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| L1026/L1031/L1040/L1045 (AddModal start/end date/time) | `style={{ ...inp, display:'block', WebkitAppearance:'none', height:44 }}`         | `className="block [-webkit-appearance:none] h-11" style={inp}`                                                   | inp 에 display/WebkitAppearance/height 정의 없음 → className 충돌 0 |
| L1148/L1153 (EditModal date/time) | 동일 패턴                                                                                       | 동일 패턴                                                                                                          | 동일                                                                  |

### `(선택)` span 3건 변환

| Line (orig) | Before                                                                          | After                                                  | 패턴            |
| ----------- | ------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------- |
| L950/L982/L1014 (AddModal task/elevator/fire) `(선택)` span | `style={{ fontWeight:400, color:'var(--text-tertiary)' }}` | className `font-normal text-text-tertiary`              | P3 + token      |
| L1073/L1087 (AddModal start/end time) `(선택)` span        | 동일 패턴                                                  | 동일 패턴                                               | P3 + token      |
| L1208/L1214 (EditModal time/memo) `(선택)` span             | 동일 패턴                                                  | 동일 패턴                                               | P3 + token      |

## 변환 매핑 (EducationPage — 51건 변환, 3건 옵션 N 잔존)

### DdayBadge 변환 (1건)

| Line (orig) | Before                                                                                              | After                                                                                                | 패턴   |
| ----------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------ |
| L62 DdayBadge | `padding: '2px 8px', flexShrink: 0`                                                                | className 합병 `text-caption font-bold leading-none rounded-sm px-2 py-0.5 shrink-0 ${colorClass}`    | P1/P3  |

### StaffEducationCard 변환 (8건)

| Line (orig) | Before                                                                                                          | After                                                                                                                              | 패턴            |
| ----------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| L91 root    | `padding: 16, minHeight: 80, cursor: canEdit ? 'pointer' : 'default', WebkitTapHighlightColor: 'transparent', userSelect: 'none'` | className 통째 `p-4 min-h-[80px] select-none [-webkit-tap-highlight-color:transparent] ${canEdit ? 'cursor-pointer' : 'cursor-default'}` | P1/P3 + arbitrary CSS prop + 옵션 M |
| L101 상단 row | `display: 'flex', alignItems: 'flex-start', gap: 12`                                                          | className `flex items-start gap-3`                                                                                                  | P2/P3           |
| L103 아바타 | `width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0`         | className 통째 `w-[32px] h-[32px] flex items-center justify-center shrink-0`                                                         | P2/P3 + arbitrary |
| L118 이름/직책 wrapper | `flex: 1, minWidth: 0`                                                                                | className `flex-1 min-w-0`                                                                                                          | P3              |
| L119 이름   | `lineHeight: 1.3`                                                                                              | className 합병 `text-body font-bold text-text-primary leading-[1.3]`                                                                  | P4              |
| L122/L256 직책 mt | `marginTop: 2`                                                                                            | className 합병 `mt-[2px]`                                                                                                            | arbitrary       |
| L134 하단 row | `marginTop: 10, paddingLeft: 44`                                                                              | className `mt-[10px] pl-11` (pl-11 default = 44px)                                                                                  | X + default     |
| L136/L142 caption | `marginBottom: 2`                                                                                          | className 합병 `mb-[2px]`                                                                                                            | arbitrary       |
| L146 마감 row | `display: 'flex', alignItems: 'center', gap: 6`                                                              | className `flex items-center gap-1.5`                                                                                                | P2              |

### EducationEditPanel 변환 (15건)

| Line (orig) | Before                                                                                                              | After                                                                                                            | 패턴   |
| ----------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------ |
| L238 root   | `display: 'flex', flexDirection: 'column', gap: 16`                                                                 | className `flex flex-col gap-4`                                                                                   | P2/P3  |
| L240 프로필 row | `display: 'flex', alignItems: 'center', gap: 12`                                                                | className `flex items-center gap-3`                                                                               | P2/P3  |
| L243 큰 아바타 | `width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0`           | className 통째 `w-10 h-10 flex items-center justify-center shrink-0`                                              | P2/P3  |
| L254 이름/직책 wrapper | `flex: 1`                                                                                                  | className `flex-1`                                                                                                | P3     |
| L256 직책 mt | (위 L122 동일)                                                                                                       | 동일                                                                                                              | arbitrary |
| L263 마감 박스 | `padding: '12px 16px'`                                                                                            | className `px-4 py-3`                                                                                              | P1     |
| L264 마감 caption mb | `marginBottom: 4`                                                                                            | className `mb-1`                                                                                                  | P1     |
| L274 이수 이력 header mb | `marginBottom: 8`                                                                                          | className `mb-2`                                                                                                  | P1     |
| L275 이수 list flex | `display: 'flex', flexDirection: 'column', gap: 6`                                                            | className `flex flex-col gap-1.5`                                                                                  | P2/P3  |
| L280 each row | `display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px'`                    | className 통째 `flex items-center justify-between px-3 py-2`                                                       | P1/P2  |
| L289 button group | `display: 'flex', gap: 4`                                                                                     | className `flex gap-1`                                                                                              | P2     |
| L293 edit button (X) | className 합병 `... px-[10px] py-1 cursor-pointer`                                                          | className 합병                                                                                                     | P1/P5  |
| L303 delete button (X) | className 합병 `... px-[10px] py-1 ${isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'}`             | className 옵션 M                                                                                                  | 옵션 M + P1 |
| L321 form border-t | `paddingTop: 16`                                                                                              | className `pt-4`                                                                                                  | P1     |
| L322 form header | `marginBottom: 10`                                                                                              | className `mb-[10px]`                                                                                              | arbitrary |
| L325 form gap | `display: 'flex', flexDirection: 'column', gap: 10`                                                              | className `flex flex-col gap-[10px]`                                                                              | P2/P3 + arbitrary |
| L327 이수일 label mb | `marginBottom: 6`                                                                                            | className `mb-1.5`                                                                                                | P1     |
| L333 input | className 통째 `bg-surface-sunken border border-border-strong text-label text-text-primary rounded-md w-full px-3 py-[10px] outline-none box-border appearance-none [-webkit-appearance:none] min-w-0` + style 옵션 N `fontFamily: 'inherit'` | className 분리 + style 잔존 옵션 N | P1/P3/P5 + 옵션 N |
| L346 select label mb | `marginBottom: 6`                                                                                            | className `mb-1.5`                                                                                                | P1     |
| L347 select | className 통째 + style 옵션 N `fontFamily: 'inherit'`                                                              | className 분리 옵션 M conditional `${(!hasRecords && !isEditMode) ? '...' : '...'} ... w-full px-3 py-[10px] outline-none box-border appearance-none [-webkit-appearance:none] min-w-0` + style 잔존 옵션 N | 옵션 M + 옵션 N |
| L368 save btn | `width: '100%', height: 44, border: 'none', cursor: isSubmitting ? 'default' : 'pointer', opacity: isSubmitting ? 0.6 : 1, marginTop: 4, background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)'` | className 통째 `... w-full h-11 border-0 mt-1 bg-[linear-gradient(135deg,#1d4ed8,#0ea5e9)] ${isSubmitting ? 'cursor-default opacity-60' : 'cursor-pointer opacity-100'}` | 옵션 M + arbitrary + P5 |

### EducationBottomSheet 변환 (5건)

| Line (orig) | Before                                                                                                          | After                                                                                                  | 패턴   |
| ----------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------ |
| L396 root   | `position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 50` | className 통째 `fixed inset-0 bg-[rgba(0,0,0,0.6)] flex flex-col justify-end z-50`                       | P2/P3 + arbitrary |
| L403 inner sheet | `animation: 'slideUp 0.28s ease-out both', maxHeight: '90vh', overflowY: 'auto', padding: '16px 16px 32px'` | className 통째 `... max-h-[90vh] overflow-y-auto px-4 pt-4 pb-8 [animation:slideUp_0.28s_ease-out_both]`  | P1/P3 + arbitrary |
| L411 grip handle wrapper | `display: 'flex', justifyContent: 'center', marginBottom: 8`                                          | className `flex justify-center mb-2`                                                                    | P1/P2  |
| L412 grip handle | `width: 32, height: 4`                                                                                      | className `w-8 h-1`                                                                                     | P3     |

### renderGroupedList 변환 (5건)

| Line (orig) | Before                                                                                                          | After                                                                                                  | 패턴            |
| ----------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------- |
| L465-L468 skeleton 4건 | `height: 88, animation: 'blink 2s ease-in-out infinite'`                                              | className 통째 `bg-surface-sunken rounded-md h-[88px] [animation:blink_2s_ease-in-out_infinite]`        | arbitrary       |
| L472 error  | `display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', padding: 24`     | className 통째 `text-body-sm text-danger flex items-center justify-center flex-1 text-center p-6`       | P1/P2/P3        |
| L477 empty  | `display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', padding: 24, gap: 8` | className 통째 `flex flex-col items-center justify-center flex-1 text-center p-6 gap-2`                | P1/P2/P3        |
| L484 wrapper | `display: 'flex', flexDirection: 'column', gap: 12`                                                            | className `flex flex-col gap-3`                                                                         | P2/P3           |

### desktop 레이아웃 변환 (5건)

| Line (orig) | Before                                                                                                          | After                                                                                                  | 패턴            |
| ----------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------- |
| L504 root   | `display: 'flex', height: '100%'`                                                                               | className `bg-surface-page flex h-full`                                                                 | P2/P3           |
| L506 left col | `flex: 1, display: 'flex', flexDirection: 'column', height: '100%'`                                            | className 통째 `border-r border-border-default flex-1 flex flex-col h-full`                            | P2/P3           |
| L507 left scroll | `flex: 1, overflowY: 'auto', padding: '24px'`                                                                | className `flex-1 overflow-y-auto p-6`                                                                  | P1/P3           |
| L513 right col | `flex: 1, overflowY: 'auto', padding: '24px 32px'`                                                            | className `flex-1 overflow-y-auto px-[32px] py-6` (px-7=32 함정 회피 — arbitrary 명시)                  | P3 + 옵션 X     |
| L522 empty state | `display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'`                          | className 통째 `text-body-sm text-text-tertiary flex items-center justify-center h-full`                | P2/P3           |

### mobile 레이아웃 변환 (5건)

| Line (orig) | Before                                                                                                          | After                                                                                                  | 패턴            |
| ----------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------- |
| L533 root   | `display: 'flex', flexDirection: 'column', height: '100%'`                                                       | className `bg-surface-page flex flex-col h-full`                                                        | P2/P3           |
| L538 header | `height: 48, display: 'flex', alignItems: 'center', flexShrink: 0`                                              | className 통째 `bg-surface-raised border-b border-border-default h-12 flex items-center shrink-0` (h-12 default = 48px) | P2/P3 + default |
| L543 back button | `width: 44, height: 44, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'` | className 통째 `text-text-secondary w-11 h-11 bg-transparent border-0 cursor-pointer flex items-center justify-center` (w-11/h-11 default = 44px) | P2/P3/P5 + default |
| L556 title  | `flex: 1, textAlign: 'center'`                                                                                  | className `text-body font-bold text-text-primary flex-1 text-center`                                    | P3              |
| L559 spacer | `width: 44`                                                                                                     | className `w-11` (default = 44px)                                                                       | default         |
| L563 scroll | `flex: 1, overflowY: 'auto', padding: 16`                                                                       | className `flex-1 overflow-y-auto p-4`                                                                  | P1/P3           |

### 옵션 N 잔존 (3건)

| Line | Before                                                | 잔존 이유                                                                                          |
| ---- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| L290 (input 이수일)  | `style={{ fontFamily: 'inherit' }}` | **`fontFamily: 'inherit'` 은 tailwind utility 로 표현 불가** — Wave 5 RemediationDetailPage L486/L496 precedent 동일. font-sans 는 Pretendard Variable 고정값. |
| L300 (select 교육유형) | `style={{ fontFamily: 'inherit' }}` | **동일 — fontFamily inherit tailwind 표현 불가**                                                    |
| L416 (assistantList section label) | `style={{ ...sectionLabelStyle, marginTop: adminList.length > 0 ? 12 : 4 }}` | **`sectionLabelStyle` shared 변수 + 동적 marginTop 분기 + dynamic fontSize (isDesktop ? 15 : 13 — 비-token 값)** — 변수 자체 옵션 N 보존 |

## Verification Results (모든 게이트 PASS)

| Check                                                                                              | Result        | 비고                                                                                                |
| -------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------- |
| `grep -c 'style={{' SchedulePage.tsx`                                                              | **20**        | 83 → 20 (-63, -76%) — verify gate ≤25 PASS                                                          |
| `grep -c 'style={{' EducationPage.tsx`                                                             | **3**         | 54 → 3 (-51, -94%) — verify gate ≤8 PASS                                                            |
| 비즈 anchor count diff (9종 × 2 파일)                                                                | **IDENTICAL** | onClick / useState / useRef / useEffect / useMutation / useQuery / useNavigate / useParams / fetch — empty diff |
| onClick handler bodies precise diff (Schedule 17 uniq / Education 7 uniq)                          | **IDENTICAL** | `grep -oE 'onClick=\{[^}]+\}' \| sort \| uniq` 양쪽 파일 모두 diff 0 줄                                |
| `grep -cE '✓\|✗\|🔒\|💾\|🔥\|⏰\|📋\|✅\|⚠️\|❌\|🔧\|🚨\|🔍\|🧯\|📊'` (2 파일)                       | **0**         | Phase A §7.1 결과 보존                                                                              |
| 비표준 색 토큰 grep (`bg-warning[^-]\|border-safe[^-]\|border-warning[^-]\|border-danger[^-]`) (2 파일) | **0**         | Phase A §2.3 결과 보존                                                                              |
| TypeScript `tsc --noEmit` 전체 에러                                                                 | **0**         | 신규 에러 0                                                                                          |
| vite build                                                                                          | **PASS**      | dist 정상 생성, 87 modules transformed                                                              |
| `^const lbl\|^const inp` Schedule.tsx                                                              | **2**         | const lbl + const inp 정의 자체 보존 (Phase B 스코프 외)                                              |
| 변경 파일 범위 (`.planning/` 외)                                                                     | **2 .tsx**    | SchedulePage + EducationPage                                                                         |
| post-commit deletions (`git diff --diff-filter=D HEAD~1 HEAD`)                                     | **none**      | 의도하지 않은 삭제 없음                                                                              |

### 비즈 anchor identity 상세 (precise diff = empty)

```
=== src/pages/SchedulePage.tsx (양쪽 동일) ===
  onClick=\{[^}]+\} : 25
  useState\( : 21
  useRef\( : 0
  useEffect\( : 1
  useMutation\( : 0
  useQuery\( : 2
  useNavigate\( : 1
  useParams\( : 0
  fetch\( : 1

=== src/pages/EducationPage.tsx (양쪽 동일) ===
  onClick=\{[^}]+\} : 7
  useState\( : 1
  useRef\( : 0
  useEffect\( : 0
  useMutation\( : 3
  useQuery\( : 1
  useNavigate\( : 1
  useParams\( : 0
  fetch\( : 0
```

diff before↔after = 0 줄 차이 (2 파일 모두).

### onClick precise diff (2 파일 모두 IDENTICAL)

- SchedulePage: 17 uniq handler bodies — diff empty
- EducationPage: 7 uniq handler bodies — diff empty

## 의도 inline anchor 보존 확인 (4 종류)

### Schedule inp/lbl shared style 정의 (Plan locked rule)

| Line | Before                                                                                                            | After                                                                                                          | 결과     |
| ---- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------- |
| L1174 | `const lbl: React.CSSProperties = { fontSize:12, fontWeight:700, color:'var(--text-tertiary)', display:'block', marginBottom:6, lineHeight:1 }` | 그대로                                                                                                          | ✓ LOCKED |
| L1178 | `const inp: React.CSSProperties = { width:'100%', padding:'11px 12px', borderRadius:10, boxSizing:'border-box', background:'var(--surface-sunken)', border:'1px solid var(--border-strong)', color:'var(--text-primary)', fontSize:13, outline:'none', fontFamily:'inherit' }` | 그대로                                                                                                          | ✓ LOCKED |

### Schedule isDesktop conditional modal 2종 (옵션 M 변환 완료)

| Line | Before                                                                                                            | After                                                                                                          | 결과         |
| ---- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------ |
| L919 (AddModal outer) | `background/justifyContent/alignItems` 동시 분기                                                       | className template literal 옵션 M (style 완전 제거)                                                              | ✓ 옵션 M 변환 |
| L922 (AddModal inner) | `borderRadius/padding/maxHeight/width/maxWidth` 동시 분기                                              | className template literal 옵션 M                                                                                | ✓ 옵션 M 변환 |
| L1105 (EditModal outer) | `background` 정적 + 기존 `justify-end/center items-center` 옵션 M                                    | className 통째 (style 완전 제거)                                                                                  | ✓ 옵션 M 변환 |
| L1108 (EditModal inner) | 동일 패턴 AddModal inner                                                                              | 동일                                                                                                              | ✓ 옵션 M 변환 |

### Schedule MonthlyPlanPreview cellStyle/headCell shared style (옵션 N 잔존 7건)

| Line | Before                                                | 잔존 이유                                                                                          |
| ---- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| L687 | `const cellStyle: React.CSSProperties = { border, padding:'3px 1px', textAlign:'center', fontSize:12, lineHeight:1.3, overflow:'hidden', whiteSpace:'nowrap', color:'var(--text-primary)' }` | 변수 자체 보존 (사용처에서만 spread 옵션 N) |
| L691 | `const headCell: React.CSSProperties = { ...cellStyle, fontWeight:700, background:'var(--surface-sunken)', color:'var(--text-primary)' }` | 변수 자체 보존 |
| L674/L691/L698/L714/L715/L742/L755 | `style={{ ...cellStyle/...headCell, [override] }}` 7건 | **cellStyle/headCell 에 동일 prop 정의 있음 (textAlign:'center'/fontWeight:700/fontSize:12) → 인라인 style spread override 필수. className 분리 불가 (인라인 우선순위 className 보다 높음)** |

### Schedule cat?.color 동적 색 (옵션 N 잔존 5건)

| Line | Before                                                                                                            | 잔존 이유                                                                                                 |
| ---- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| L326 (calendar dot)         | `style={{ background: catInfo(cat)?.color ?? 'var(--text-tertiary)' }}`                                          | catInfo(cat)?.color 동적 색 (SCHED_CATEGORIES 5 카테고리 lookup) — 옵션 N                                  |
| L373 (renderCard cat chip)  | `style={{ color: cat?.color, background: \`${cat?.color}22\` }}`                                                  | cat?.color 동적 색 + template literal `${color}22` 동적 — 옵션 N                                           |
| L485 (group 헤더 border-bottom) | `style={{ color: cat?.color, borderBottomColor: \`${cat?.color}44\` }}`                                       | 동일 동적 색 — 옵션 N                                                                                      |
| L905/L967/L999 (3 카테고리 button) | `style={{ borderColor: cat===c.value ? c.color : 'var(--border-default)', background: cat===c.value ? \`${c.color}22\` : 'var(--surface-sunken)', color: cat===c.value ? c.color : 'var(--text-secondary)' }}` | **선택 상태 분기 + 동적 색 + template literal 분기 3 prop 동시 옵션 N** (SCHED/ELEV/FIRE 3 카테고리 별도) |
| L1127 (EditModal lock row dot) | `style={{ background: cat?.color }}`                                                                            | cat?.color 동적 색 — 옵션 N                                                                                |

### Education fontFamily inherit (옵션 N 잔존 2건)

| Line | Before                                | 잔존 이유                                                                                          |
| ---- | ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| L290 (input 이수일)  | `style={{ fontFamily: 'inherit' }}`   | Wave 5 RemediationDetailPage L486/L496 precedent — tailwind utility 표현 불가                       |
| L300 (select 교육유형) | `style={{ fontFamily: 'inherit' }}`   | 동일                                                                                                |

### Education sectionLabelStyle spread (옵션 N 잔존 1건)

| Line | Before                                                                                            | 잔존 이유                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| L454 | `const sectionLabelStyle: React.CSSProperties = { fontSize: isDesktop ? 15 : 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, marginTop: 4 }` | 변수 자체 보존 (fontSize 15 = 비-token, dynamic isDesktop 분기) |
| L416 (assistantList) | `style={{ ...sectionLabelStyle, marginTop: adminList.length > 0 ? 12 : 4 }}`               | spread + 동적 marginTop 분기 — 옵션 N                                                              |

### 변환된 값들 (시각 0 byte)

| anchor                              | 원본 값                          | 변환 후                                                                                       | 결과     |
| ----------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------- | -------- |
| Schedule modal padding 28px         | `'24px 28px 28px'`               | `pt-6 px-[28px] pb-[28px]` (px-7=32 함정 회피 — arbitrary 명시)                                | ✓ 정확값 |
| Schedule modal padding 16/40        | `'20px 16px 40px'`               | `pt-5 px-4 pb-10`                                                                              | ✓ 정확값 |
| Schedule modal borderRadius desktop 16 | `16`                          | `rounded-lg` (config = 16px)                                                                   | ✓ 정확값 |
| Schedule modal borderRadius mobile '20px 20px 0 0' | `'20px 20px 0 0'` | `rounded-t-[20px]` arbitrary                                                                    | ✓ 정확값 |
| Schedule modal width 480/maxWidth 90vw | `480` / `'90vw'`              | `w-[480px] max-w-[90vw]`                                                                       | ✓ 정확값 |
| Schedule modal maxHeight '90dvh'    | `'90dvh'`                        | `max-h-[90dvh]`                                                                                | ✓ 정확값 |
| Schedule SCHED button padding/radius | `'10px 0', 8`                   | `py-[10px] rounded-sm`                                                                          | ✓ 정확값 |
| Schedule ELEV button padding/radius | `'9px 0', 9`                     | `py-[9px] rounded-[9px]` (rounded-md=12 함정 회피)                                              | ✓ 정확값 |
| Schedule FIRE button padding/radius | `'8px 4px', 9`                   | `px-1 py-2 rounded-[9px]` (rounded-md=12 함정 회피)                                             | ✓ 정확값 |
| Schedule input height 44            | `height:44`                      | `h-11` (default = 44px)                                                                        | ✓ 정확값 |
| Schedule input display block/WebkitAppearance:none | `display:'block', WebkitAppearance:'none'` | `block [-webkit-appearance:none]` | ✓ arbitrary CSS prop |
| Schedule MonthlyPlanPreview root padding 12/20/8 | `'12px 20px 8px'` | `px-5 pt-3 pb-2`                                                                               | ✓ 정확값 |
| Schedule MonthlyPlanPreview title font 14/700 | `fontSize:14, fontWeight:700` | `text-body-sm font-bold`                                                                        | ✓ token  |
| Schedule prev/next button padding 14 | `'14px 0'`                       | `px-0 py-[14px]`                                                                                | ✓ arbitrary |
| Schedule save button padding 14     | `'14px'`                         | `p-[14px]`                                                                                      | ✓ arbitrary |
| Schedule save button borderRadius 12 | `12`                            | `rounded-md` (config = 12px)                                                                    | ✓ 정확값 |
| Education root padding 16           | `padding: 16`                    | `p-4`                                                                                           | ✓ 정확값 |
| Education min-height 80             | `minHeight: 80`                  | `min-h-[80px]`                                                                                  | ✓ arbitrary |
| Education 32px avatar               | `width: 32, height: 32`          | `w-[32px] h-[32px]`                                                                             | ✓ arbitrary |
| Education 40px avatar               | `width: 40, height: 40`          | `w-10 h-10`                                                                                     | ✓ default |
| Education line clamp                | `WebkitLineClamp: 2 / 3`         | `[-webkit-line-clamp:2]` / `[-webkit-line-clamp:3]`                                              | ✓ arbitrary CSS prop |
| Education -webkit-box display       | `display: '-webkit-box', WebkitBoxOrient: 'vertical'` | `[display:-webkit-box] [-webkit-box-orient:vertical]`                       | ✓ arbitrary CSS prop |
| Education slideUp animation 0.28s   | `'slideUp 0.28s ease-out both'`  | `[animation:slideUp_0.28s_ease-out_both]`                                                       | ✓ arbitrary |
| Education blink animation           | `'blink 2s ease-in-out infinite'` | `[animation:blink_2s_ease-in-out_infinite]`                                                    | ✓ arbitrary |
| Education mobile header h 48        | `height: 48`                     | `h-12` (default = 48px)                                                                         | ✓ default |
| Education back button w/h 44        | `width: 44, height: 44`          | `w-11 h-11` (default = 44px)                                                                    | ✓ default |
| Education pl-44                     | `paddingLeft: 44`                | `pl-11` (default = 44px)                                                                        | ✓ default |
| Education desktop right padding 24/32 | `'24px 32px'`                  | `px-[32px] py-6` (px-7=32 함정 회피 — arbitrary 명시)                                            | ✓ 정확값 |
| Education save button gradient bg   | `'linear-gradient(135deg, #1d4ed8, #0ea5e9)'` | `bg-[linear-gradient(135deg,#1d4ed8,#0ea5e9)]`                                      | ✓ arbitrary |
| Education -webkit-tap-highlight-color | `WebkitTapHighlightColor: 'transparent'` | `[-webkit-tap-highlight-color:transparent]`                                          | ✓ arbitrary CSS prop |

## Phase A 보존 확인

| Phase A 항목                                   | SchedulePage | EducationPage | 비고                                |
| ---------------------------------------------- | ------------ | ------------- | ----------------------------------- |
| Lucide import                                  | OK           | OK            | ChevronLeft/ChevronRight/Download/Plus/X / ChevronLeft 그대로 |
| 색 토큰 `-bar` 변종                              | OK           | OK            | text-safe-bar/text-danger-bar/border-safe-bar/bg-safe-bg/bg-info-bg/border-danger-bar 등 그대로 + Education bg-safe-bg/text-safe/bg-warning-bg/text-warning/bg-danger-bg/text-danger 그대로 |
| Emoji 0 (watched set)                          | 0            | 0             | grep 0                              |
| 비표준 색 토큰 0                                 | 0            | 0             | grep 0                              |

## 비즈니스 로직 0 byte 확인 (precise)

원본 25 + 7 = 32건 onClick handler 본체를 `grep -oE 'onClick=\{[^}]+\}' | sort | uniq` 으로 추출 후 diff:
- SchedulePage: 17 uniq IDENTICAL
- EducationPage: 7 uniq IDENTICAL

추가 보존 확인:
- SchedulePage: scheduleApi.create/update/updateStatus/delete/getByMonth + fetchHolidays (외부 hyunbin.page API) + HOLIDAYS_FALLBACK + generateMonthlyPlan + INSP_DEFAULTS/INSP_CATEGORIES/SCHED_CATEGORIES/STATUS_LABEL/STATUS_TW/ELEV_SUBCATS/FIRE_SUBCATS/ELEV_AGENCY/FIRE_AGENCY/PLAN_PREVIEW_ROWS + matchesDate/dotMap/calDays/catInfo/shiftMonth/invalidate/handleStatus/handleDelete/handlePlanDownload + AddModal handleSave (rangeDays/workingDays/skippedCount 계산 + 멀티데이 처리) + EditModal handleSave (titleError validation) + MonthlyPlanPreview dayCatMap useMemo + W2 OQ #1 LOCKED a/b/c/W5 OQ #1 LOCKED b 룰 모두 그대로
- EducationPage: educationApi.create/update/delete/list + calcNextDeadline (선임일 + records → deadline/dday) + titleRank/TITLE_ORDER 직급 정렬 + DdayBadge + StaffEducationCard + EducationEditPanel (createMutation/updateMutation/deleteMutation + isEditMode 분기 + handleStartEdit/handleCancelEdit/handleSubmit) + EducationBottomSheet (모바일 바텀시트 wrapper) + sectionLabelStyle dynamic + adminList/assistantList 그룹핑 + canEdit 권한 체크 그대로

## Memory anchor 적용 확인

| Anchor                                                              | 적용 사례                                                                                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `feedback_tailwind_w8_h8_is_48px.md` (w-7=32 / w-8=48 함정)           | **px-7=32 함정 회피** — modal padding 28px → `px-[28px]`/`pb-[28px]` arbitrary 명시 + Education desktop right `px-[32px]` arbitrary 명시 |
| `feedback_tailwind_w8_h8_is_48px.md` (rounded-md=12px override)      | **rounded-md=12 함정 회피** — ELEV/FIRE 카테고리 button borderRadius:9 → `rounded-[9px]` arbitrary                  |
| `feedback_tailwind_token_class_pattern.md`                          | `bg-surface-page`/`bg-surface-raised`/`bg-surface-sunken`/`bg-info-bg`/`bg-safe-bg`/`bg-warning-bg`/`bg-danger-bg`/`text-text-primary`/`text-text-secondary`/`text-text-tertiary`/`text-text-on-accent`/`text-safe`/`text-warning`/`text-danger`/`text-accent`/`text-info`/`text-danger-bar`/`text-safe-bar`/`border-border-default`/`border-border-strong`/`border-safe-bar`/`border-accent`/`bg-accent` 등 extend.colors token short form 유지 |
| `feedback_text_caption_leading_none.md`                             | 본 wave 신규 leading 변경 없음 (기존 text-caption/text-label/text-body-sm + leading-none/leading-relaxed/leading-snug 보존 + 새 `leading-[1.3]`/`leading-[1.4]`/`leading-[1.5]`/`leading-[1.2]` arbitrary 명시) |
| `project_redesign_28_splash_status.md` (단일 atomic)                  | 2 파일 단일 atomic commit 패턴 (precedent: 28-splash + 27-login + 23-education + c9s + cjn + gsh + h3z) 자동 도달  |

## Commits

| Hash    | Subject                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------ |
| e267291 | `feat(260528-hbv-01): Phase B Wave 6 — Schedule 83 + Education 54 → tailwind`                                            |

## Deviations from Plan

### Auto-decisions (PLAN 인용 직접 적용)

**1. Schedule `style={{ ...inp, display:'block', WebkitAppearance:'none', height:44 }}` 6건 → `style={inp}` 단일 참조 전환**
- PLAN context "옵션 N 잔존 (예상 17건)" + "12건 spread + 5건 cat color" 만 잔존 명시. 그런데 ...inp + 3 정적 prop spread 6건은 PLAN 에 명시되지 않은 추가 변환 기회
- 결정: className 분리 (`block [-webkit-appearance:none] h-11`) + `style={inp}` 단일 참조. inp 변수에 display/WebkitAppearance/height 정의 없음 → CSS 충돌 0
- 효과: style={{ → style={ 카운트 6 추가 제거 → Schedule 26 → 20 (verify gate ≤25 도달)
- 근거: shared style 정의는 잔존, 인스턴스 spread는 가능한 경우 분리 — Wave 4 gsh L1011 캘리브 step indicator 정적 부분 분리 패턴 직접 승계

**2. Schedule MonthlyPlanPreview width-only spread 4건 → `<th className="w-[N%]" style={headCell}>` 전환**
- L666/L667/L686/L690 4건은 `{ ...headCell, width: 'N%' }` 패턴. headCell 에 width 정의 없음 → className 분리 가능
- 결정: width-only spread는 className 분리 + style 단일 참조. textAlign/fontWeight/fontSize override 있는 spread는 옵션 N 잔존 (cellStyle/headCell 에 동일 prop 정의 있음)
- 효과: 4건 추가 변환 (옵션 N 잔존 카운트에서 제외)
- 근거: shared style 변수에 정의 없는 prop 만 className 으로 옮기는 정밀한 분리

**3. Schedule renderCard `style={{ padding: '12px 14px', ...(grouped ? {...} : {}) }}` 옵션 M conditional**
- PLAN context "옵션 M conditional" 명시. grouped 분기 3 prop (height/display/flexDirection)
- 결정: className template literal 통째 `px-[14px] py-3 ${grouped ? 'h-[130px] flex flex-col' : ''}`
- 효과: 시각 0 byte (grouped=false 시 빈 utility, grouped=true 시 h-130/flex/flex-col)

**4. Schedule renderCard memo line clamp + display webkit-box 옵션 M**
- L414 memo style 7 prop 동시 (whiteSpace/lineHeight/display/WebkitLineClamp/WebkitBoxOrient/overflow/marginBottom)
- 결정: arbitrary CSS prop 활용 `[display:-webkit-box]` / `[-webkit-box-orient:vertical]` / `[-webkit-line-clamp:2|3]` + 옵션 M conditional
- 효과: tailwind 표현 가능한 모든 prop 변환, 시각 0 byte

**5. Schedule AddModal/EditModal isDesktop modal 옵션 M template literal**
- PLAN context L920-933 + L1156-1164 동일 패턴 명시. 5 prop 동시 분기 (borderRadius/padding/maxHeight/width/maxWidth)
- 결정: className template literal `max-h-[90dvh] ${isDesktop ? 'rounded-lg pt-6 px-[28px] pb-[28px] w-[480px] max-w-[90vw]' : 'rounded-t-[20px] pt-5 px-4 pb-10'}`
- 효과: PLAN 옵션 M 정확 적용. **px-7=32 함정 회피**: 28px → `px-[28px]`/`pb-[28px]` arbitrary. rounded-md=12 → `rounded-t-[20px]` arbitrary (20px 의도 명시)

**6. Schedule AddModal SCHED/ELEV/FIRE 3 카테고리 button 정적 className 분리 + 동적 색 옵션 N**
- 각 버튼 9 prop spread (padding/borderRadius/fontSize/fontWeight/lineHeight/cursor + border/background/color 동적)
- 결정: 정적 6 prop className 분리 (`py-[10px] rounded-sm text-caption font-bold leading-none cursor-pointer border`) + 동적 3 prop 옵션 N 잔존 (borderColor/background/color)
- 효과: 각 버튼의 정적 부분 깔끔히 분리, 동적 색만 옵션 N. ELEV/FIRE 의 rounded:9 → `rounded-[9px]` arbitrary (rounded-md=12 함정 회피)

**7. Education `fontFamily: 'inherit'` 옵션 N 잔존 — tailwind 표현 불가 확정**
- tailwind.config.js fontFamily: { sans: ['Pretendard Variable', ...] } / mono: [...] 만 정의. `inherit` 키워드 utility 없음
- 결정: 옵션 N 잔존 (Wave 5 RemediationDetailPage L486/L496 precedent 동일)
- 효과: Education 54 → 3 정확히 도달 (PLAN 예상 3-5 잔존과 일치)

**8. Education sectionLabelStyle spread 1건 옵션 N 잔존**
- `sectionLabelStyle` 변수 자체 정의에 `fontSize: isDesktop ? 15 : 13` — 비-token 값 (token: 12/13/14)
- 결정: 변수 자체 보존 + spread 사용처 (L416 `{ ...sectionLabelStyle, marginTop: dynamic }`) 옵션 N 잔존
- 효과: 변수 정의 자체가 dynamic 분기 + 비-token 사이즈 → shared style 변수 보존 룰 따름

### Auto-fixed Issues

**None.** Wave 5 fontFamily inherit precedent + Wave 4 rounded-md=12 함정 + px-7=32 함정 사전 인지 → 모두 변환 시점에 즉시 arbitrary 사용. **유일한 fix attempt**: MonthlyPlanPreview cellStyle/headCell spread 7건을 className 분리 시도 후 인라인 style 우선순위 충돌 (textAlign:'center'/fontWeight:700 override) 인지 후 즉시 옵션 N 잔존으로 revert (3건 — L674/L691/L714/L715 fontWeight/textAlign override 룰 보존). 별도 fix commit 불필요. Atomic 단일 commit 으로 완료.

## 배포 계획

- **이 워크트리 (디자인 트랙):** main 머지 → cbc7119-preview.pages.dev 자동 배포 (GitHub Actions). 시각 0 byte 보장이므로 preview 검증은 페이지 정상 렌더 + 빌드 통과로 충분.
- **production cherry-pick 후보 묶음:** Phase B Tier 1 Wave 1~11 묶음 B (roadmap 5.B) 완료 후 일괄 cherry-pick. 본 wave (e267291) 는 묶음 B 의 여섯 번째 commit (a3v 18fd138 + c9s d36a20f + cjn a78963f/4e99270 + gsh 05fddf1 + h3z db728c0 다음).
- **이 워크트리에서는 wrangler 명령 금지 / production deploy 금지** — `.claude/settings.local.json` deny 룰 준수.

## Next Steps (out of scope)

- **Wave 7+ (다음 페이지):** roadmap §4 Tier 1 Wave 7 진행 (다음 단일/묶음 파일).
- **묶음 B production cherry-pick:** Wave 11 까지 완료 후 일괄 (현재 시점에서는 진행 X). 묶음에 e267291 commit 포함.

## Self-Check: PASSED

**Files:**
- FOUND: cha-bio-safety/src/pages/SchedulePage.tsx (modified, 83→20)
- FOUND: cha-bio-safety/src/pages/EducationPage.tsx (modified, 54→3)
- FOUND: cha-bio-safety/.planning/quick/260528-hbv-phase-b-wave-6/260528-hbv-SUMMARY.md (this file)

**Commits:**
- FOUND: e267291 (Task 1 atomic — Wave 6 일정/교육 137 → 23)
