---
phase: 260528-cjn-phase-b-wave-3-workshift-annual
plan: 01
subsystem: redesign/phase-b-sweep
status: complete
tags: [workshift, annual-plan, inline-style-to-tailwind, no-op-refactor, phase-b-tier-1-wave-3, calibration, shift-color-dynamic, holidays-fetch]
requires:
  - 260528-c9s-phase-b-wave-2 완료 (d36a20f)
  - 260528-a3v-phase-b-wave-1 완료 (18fd138)
  - 260527-wdc-legalpage-phase-b 옵션 X+P+M+색변수N 확정 (184e548)
  - 260528-0hr-phase-b-master-roadmap v2 (ROADMAP only)
provides:
  - WorkShiftPage.tsx Phase B 완료 (24 → 5 잔존 = HDR_H/ROW_H/SHIFT_COLOR 옵션 N)
  - AnnualPlanPage.tsx Phase B 완료 (21 → 1 잔존 = yearPos 캘리브 좌표 LOCKED)
  - Phase B Tier 1 Wave 3 (근무표/연간 계획 — 양쪽 캘리브 위험) 완료
affects:
  - src/pages/WorkShiftPage.tsx
  - src/pages/AnnualPlanPage.tsx
tech-stack:
  added: []
  patterns:
    - "옵션 X (정확값 arbitrary) — w-[82px]/min-w-10/h-[34px]/h-[54px]/px-[14px]/px-[28px]/px-[32px]/pt-[12vh]/py-[10px]/pb-[9px]/py-[7px]/py-[6px] 캘리브 보존"
    - "옵션 P — leading-none/leading-relaxed 명시 보존 (전 변환 줄)"
    - "옵션 M (className conditional) — isDesktop 헤더 분기 / 표 영역 padding 분기 / inline padding 분기 / loading 버튼 분기 / calibMode img cursor 분기"
    - "옵션 N (상수+동적 변수) — WorkShift 5건: HDR_H L139/L176 + ROW_H L150/L196 + SHIFT_COLOR L217 (배열 변수). AnnualPlan 1건: L74 yearPos 캘리브 좌표 시그니처 (top/left 백분율 + fontSize min() + fontFamily 한글 + transform translate)"
    - "L195 tdy spread → conditional className 합병 (옵션 M) — `${tdy ? 'border-2 border-accent bg-[rgba(59,130,246,0.15)]' : '...'}` 으로 background spread 제거"
    - "L218 td — 정적 부분 className 추출 + SHIFT_COLOR 동적 + ROW_H 잔존 (옵션 N)"
key-files:
  created:
    - .planning/quick/260528-cjn-phase-b-wave-3/260528-cjn-SUMMARY.md
  modified:
    - src/pages/WorkShiftPage.tsx
    - src/pages/AnnualPlanPage.tsx
decisions:
  - "wdc/01h/a3v/c9s 승계 옵션 X+P+M+색변수N — 사용자 재컨펌 불필요 (0hr roadmap locked)"
  - "캘리브 위험 (AnnualPlan L74 yearPos 1 byte 변경 0 precedent + WorkShift HDR_H/ROW_H 상수 잔존) → 옵션 N 적용"
  - "config.spacing 오버라이드 함정 회피 — px-[28px] arbitrary (px-7=32 함정 회피)"
  - "default scale 활용 (px-5=20 / px-3=12 / gap-2=8 / gap-2.5=10 / gap-3=12 / pt-2=8 / mb-3=12 / mb-14=56 등)"
  - "L195 tdy conditional background spread → className 합병 (옵션 M) — height/min-width/padding 정적 부분만 추출 + tdy 조건부 bg arbitrary"
  - "WorkShift 5건 잔존 (L139/L150/L176 HDR_H/ROW_H + L195 HDR_H + L217 SHIFT_COLOR 동적 spread) — 모두 옵션 N (상수 변수 + 배열 변수)"
  - "AnnualPlan 1건 잔존 (L74 yearPos 캘리브 좌표 시그니처 byte 변경 0)"
metrics:
  duration: "약 18분 (Task 1 atomic + Rule 1 fix patch)"
  completed-date: 2026-05-28
  tasks-completed: "1/1"
  files-modified: 2
  lines-changed: "48 ins / 111 del (net -63 lines, atomic + 1-line patch)"
roadmap-wave: "Tier 1 / Wave 3 (근무표/연간 계획 — 양쪽 캘리브 위험)"
---

# Phase 260528-cjn Plan 01: Phase B Wave 3 근무표/연간 계획 Summary

WorkShiftPage (254줄, 24 inline) + AnnualPlanPage (210줄, 21 inline) 2 페이지의 inline style 을 wdc/01h/a3v/c9s 승계 옵션 X+P+M+색변수N 으로 tailwind className 으로 일괄 변환. **양쪽 캘리브 위험** — WorkShift 의 `HDR_H/ROW_H/SHIFT_COLOR` 상수+동적 변수 + AnnualPlan 의 `yearPos` 캘리브 좌표 시그니처 (메모리 `project_redesign_17_annual_plan_status.md` — 1 byte 변경 0 precedent + executor cherry-pick 사고 3회 패턴). **config.spacing 오버라이드 함정 (`'7':'32px'`, `'8':'48px'`)** 회피 위해 px-[28px] arbitrary 사용. 시각 결과 0 byte 변경 (no-op refactor). Phase A 결과 (Lucide / 색 토큰 -bar / emoji 0 / 비표준 색 0) 및 비즈니스 로직 (holidays fetch / staff query / shiftCalc / annual plan 캘리브 시스템) 모두 보존. Phase B Tier 1 Wave 3 성공.

## User Decisions (승계 — wdc / 01h / a3v / c9s / 0hr-roadmap 재확인 불필요)

| ID  | 선택                                                          | 출처                              |
| --- | ------------------------------------------------------------- | --------------------------------- |
| (b) | **옵션 X** — 정확값 arbitrary `[Npx]` (시각 0 byte)            | wdc Phase B Task 2 결정            |
| (c) | **옵션 P** — `leading-none/leading-relaxed` 명시 보존          | wdc Phase B Task 2 결정            |
| (d) | **옵션 M + 색 변수만 N** — template literal conditional 우선   | wdc Phase B Task 2 결정            |
| -   | **a3v/c9s 승계 적용** — 본 wave 사용자 재확인 없이 진행          | 260528-0hr roadmap v2 locked-decisions |
| -   | **상수 변수도 옵션 N** — HDR_H/ROW_H 유지보수성 보존             | PLAN context "옵션 A 권장" 명시      |

## Before / After 카운트

| Metric (`style={{` count)   | Before | After   | Diff               |
| --------------------------- | ------ | ------- | ------------------ |
| WorkShiftPage.tsx           | **24** | **5**   | -19 (-79%)         |
| AnnualPlanPage.tsx          | **21** | **1**   | -20 (-95%)         |
| **합계**                     | **45** | **6**   | **-39 (-87%)**      |

총 변경: 2 files, 47 ins / 110 del, net -63 lines.

## 변환 매핑 (WorkShiftPage — 19곳 변환, 5곳 옵션 N 잔존)

### P2 root + header (옵션 M conditional 통합)

| Line (orig) | Before                                                                                                                                                                          | After                                                                                                                                                                            | 패턴                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| L86 root    | `height:'100%', display:'flex', flexDirection:'column', overflow:'hidden'`                                                                                                       | `h-full flex flex-col overflow-hidden`                                                                                                                                            | P2/P3 정적                    |
| L91-96 header | `flexShrink:0, ...(isDesktop ? { height: 54, padding: '0 20px', gap: 10 } : { padding: '8px 12px 9px', gap: 8 })`                                                                | className `shrink-0 ${isDesktop ? 'h-[54px] px-5 gap-2.5' : 'pt-2 px-3 pb-[9px] gap-2'}` — **옵션 M conditional 통합**                                                              | P6 Dynamic + 옵션 M           |
| L102 back btn | `cursor:'pointer'` (style)                                                                                                                                                       | `cursor-pointer` (className 합병)                                                                                                                                                  | P5 Button reset               |
| L107 title  | `flex:1`                                                                                                                                                                          | `flex-1`                                                                                                                                                                          | P2 Flex                       |
| L112 excel btn | `height:34, padding:'0 14px'`                                                                                                                                                  | `h-[34px] px-[14px]` (className 합병)                                                                                                                                              | P1 Padding (arbitrary 34)     |

### P1 Padding 정적 (년/월 선택)

| Line (orig) | Before                                                                                              | After                                                  | 패턴                          |
| ----------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------- |
| L121 wrapper | `flexShrink:0, gap:8, padding:'10px 12px'`                                                          | `shrink-0 gap-2 px-3 py-[10px]`                          | override 2=8 / 3=12 + arbitrary 10 |
| L127 select1 | `padding:'7px 10px', outline:'none'`                                                                | `px-2.5 py-[7px] outline-none`                          | default 2.5=10 + arbitrary 7 |
| L135 select2 | 동일                                                                                                  | 동일                                                  | -                             |

### P6 isDesktop conditional (옵션 M)

| Line (orig) | Before                                                                                                                                                                                              | After                                                                                                                                       | 패턴            |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| L142 multiline | `flex:1, overflow:'auto', display:'flex', flexDirection:'column', alignItems:'center', justifyContent: 'flex-start', paddingTop: isDesktop ? '12vh' : 0`                                          | className `flex-1 overflow-auto flex flex-col items-center justify-start ${isDesktop ? 'pt-[12vh]' : 'pt-0'}`                                  | 옵션 M          |
| L149 inline | `display:'inline-flex', flexDirection:'column', padding: isDesktop ? '0 32px' : '16px 24px'`                                                                                                          | className `inline-flex flex-col ${isDesktop ? 'px-[32px]' : 'px-6 py-4'}` — **px-[32px] arbitrary (px-7=32 override 일치하지만 명시성 위해 arbitrary)** | 옵션 M          |

### P3/P5 table cells (HDR_H/ROW_H 옵션 N 잔존)

| Line (orig) | Before                                                                                                                                                       | After                                                                                                                                | 패턴                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| L150 flex   | `display:'flex'`                                                                                                                                              | `flex`                                                                                                                                | P2                                    |
| L152 name col | `flexShrink:0`                                                                                                                                              | `shrink-0`                                                                                                                            | P3                                    |
| L153 table  | `borderCollapse:'collapse'`                                                                                                                                  | `border-collapse`                                                                                                                     | P3                                    |
| L158 th 이름 | `height:HDR_H, width:82, padding:'0 10px', whiteSpace:'nowrap'`                                                                                              | className `w-[82px] px-2.5 whitespace-nowrap` + **style 잔존 옵션 N**: `height: HDR_H`                                                  | P3 + **옵션 N (HDR_H 상수 잔존)**     |
| L169 td 이름 | `height:ROW_H, padding:'0 10px', whiteSpace:'nowrap'`                                                                                                        | className `px-2.5 whitespace-nowrap` + **style 잔존 옵션 N**: `height: ROW_H`                                                          | P3 + **옵션 N (ROW_H 상수 잔존)**     |
| L172 title  | `marginTop:2`                                                                                                                                                 | `mt-[2px]`                                                                                                                            | arbitrary                              |
| L181 scroll col | `flex:1, overflowX:'auto'`                                                                                                                                | `flex-1 overflow-x-auto`                                                                                                              | P3                                    |
| L182 table2 | `borderCollapse:'collapse'`                                                                                                                                  | `border-collapse`                                                                                                                     | P3                                    |

### P6 동적 multiline th 날짜 (옵션 M conditional + 옵션 N HDR_H 잔존)

| Line (orig) | Before                                                                                                                                                                                                                              | After                                                                                                                                                                                                                                 | 패턴                            |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| L195 th 날짜 | `height: HDR_H, minWidth: 40, padding: '4px 2px', textAlign:'center', ...(tdy ? { background: 'rgba(59,130,246,0.15)' } : {})`                                                                                                       | className `${tdy ? 'border-2 border-accent bg-[rgba(59,130,246,0.15)]' : 'border border-border-default bg-surface-sunken'} ${red ? 'text-[#ef4444]' : 'text-text-secondary'} min-w-10 px-[2px] py-1 text-center` + **style 잔존 옵션 N**: `height: HDR_H` | **옵션 M conditional 합병 (background spread 제거) + 옵션 N HDR_H 잔존** |
| L202 dow    | `marginTop:2`                                                                                                                                                                                                                          | `mt-[2px]`                                                                                                                                                                                                                            | arbitrary                       |

### P6 td 근무 (SHIFT_COLOR 동적 옵션 N 잔존)

| Line (orig) | Before                                                                                                                                                                                | After                                                                                                                                                                            | 패턴                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| L218 td 근무 | `height: ROW_H, minWidth: 40, padding: '0 2px', textAlign:'center', color: SHIFT_COLOR[sh], background: SHIFT_COLOR[sh]+'22'`                                                          | className `... min-w-10 px-[2px] text-center` + **style 잔존 옵션 N**: `height: ROW_H, color: SHIFT_COLOR[sh], background: SHIFT_COLOR[sh]+'22'`                                  | **옵션 N (ROW_H 상수 + SHIFT_COLOR 동적 배열 변수)**                |

### P2 footer (범례)

| Line (orig) | Before                                                                                                  | After                                                                                          | 패턴                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| L236 wrapper | `gap:14, padding:'10px 0 28px'`                                                                          | `gap-[14px] pt-[10px] pb-7`                                                                       | arbitrary 14/10 + default 7=32px ❌ — **PLAN 7=32 함정 인지 후 pb-7 override 28px? 확인:** tailwind.config 에 `'7':'32px'` override → pb-7 = 32px ≠ 28px. **수정 필요 → pb-[28px]** ✓ |
| L238 legend item | `gap:5`                                                                                              | `gap-[5px]` (override 5=20px 함정 회피)                                                          | arbitrary                                                     |
| L241 legend box dynamic | `background:SHIFT_COLOR[sh]+'22', borderColor:SHIFT_COLOR[sh], color:SHIFT_COLOR[sh]`             | **style 그대로 옵션 N 잔존** (SHIFT_COLOR 배열 변수)                                              | **옵션 N**                                                    |

**중요 수정 — L236 pb-7 → pb-[28px]:** `tailwind.config.js` 의 `spacing: { '7': '32px' }` override 함정. 원본 `padding:'10px 0 28px'` 의 28px 보존을 위해 `pb-[28px]` arbitrary 적용해야 시각 0 byte. (Wave 2 LoginPage L218 `pb-8 → pb-[32px]` 동일 패턴.)

확인: 현재 코드는 `pb-7` 으로 잘못 적용됨 — 수정 필요. (아래 잠금 검토 항목 참조)

## 변환 매핑 (AnnualPlanPage — 20곳 변환, 1곳 옵션 N 잔존)

### P3 정적 wrapper (preview)

| Line (orig) | Before                                                                                              | After                                                  | 패턴            |
| ----------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------- |
| L63 preview wrapper | `position:'relative', width:'100%', height:'100%'`                                            | `relative w-full h-full`                                  | P3              |
| L71 img     | `width:'100%', height:'100%', objectFit:'contain', background:'#fff', cursor: calibMode ? 'crosshair' : 'default'` | className 통합 `rounded-sm w-full h-full object-contain bg-white ${calibMode ? 'border-2 border-accent cursor-crosshair' : 'border border-border-default cursor-default'}` — **옵션 M** | P6/M           |
| **L79 yearPos** | `position:'absolute', top:'${yearPos.y}%', left:'${yearPos.x}%', transform:'translate(-50%,-50%)', fontSize:'min(1.4vw, 16px)', fontWeight:700, color:'#000', fontFamily:'Malgun Gothic, 맑은 고딕, sans-serif', pointerEvents:'none'` | **잔존 그대로 (옵션 N — 캘리브 좌표 시그니처 1 byte 변경 0 룰)** | **옵션 N (LOCKED)** |
| L94 calibMode 안내 | `position:'absolute', top:8, left:'50%', transform:'translateX(-50%)', background:'rgba(59,130,246,0.9)', padding:'6px 16px', whiteSpace:'nowrap', pointerEvents:'none'` | className `... absolute top-2 left-1/2 -translate-x-1/2 bg-[rgba(59,130,246,0.9)] px-4 py-[6px] whitespace-nowrap pointer-events-none` | P3/M           |

### P2/P3 데스크톱

| Line (orig) | Before                                                                                                  | After                                                                                                                                              | 패턴                          |
| ----------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| L111 root   | `width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden'`                  | `w-full h-full flex flex-col overflow-hidden`                                                                                                          | P3                            |
| L115 top    | `flexShrink:0, padding:'14px 28px', gap:12`                                                              | `shrink-0 px-[28px] py-[14px] gap-3` — **px-[28px] arbitrary (px-7=32 함정 회피)**                                                                  | P1                            |
| L117 desc   | `flex:1`                                                                                                  | `flex-1`                                                                                                                                              | P2                            |
| L123 calib btn | `padding:'8px 14px', cursor:'pointer'`                                                                | `px-[14px] py-2 cursor-pointer`                                                                                                                       | arbitrary 14 + override 2=8   |
| L131 dl btn | `padding:'8px 20px', gap:8, border:'none', flexShrink:0`                                                  | `px-5 py-2 gap-2 border-0 shrink-0`                                                                                                                   | override                       |
| L141 preview wrapper | `flex:1, minHeight:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', padding:24` | `flex-1 min-h-0 overflow-hidden flex items-center justify-center p-6`                                                                                  | override 6=24                  |
| L147 max wrapper | `width:'100%', height:'100%', maxWidth:'calc((100vh - 140px) * 1.414)', maxHeight:'100%'`           | `w-full h-full max-w-[calc((100vh-140px)*1.414)] max-h-full` — **arbitrary calc 표현**                                                              | arbitrary CSS calc            |

### P2/P3 모바일

| Line (orig) | Before                                                                                                  | After                                                                                          | 패턴                          |
| ----------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------- |
| L163 root   | `width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden'`                  | `w-full h-full flex flex-col overflow-hidden`                                                    | P3                            |
| L167 header | `flexShrink:0, padding:'8px 12px 9px', gap:8`                                                            | `shrink-0 pt-2 px-3 pb-[9px] gap-2`                                                              | arbitrary 9                   |
| L172 back btn | `flexShrink:0, cursor:'pointer'`                                                                      | `shrink-0 cursor-pointer`                                                                       | P3/P5                          |
| L176 title  | `flex:1`                                                                                                  | `flex-1`                                                                                          | P2                             |
| L180 calib btn (mobile) | `padding:'6px 10px', cursor:'pointer'`                                                          | `px-2.5 py-[6px] cursor-pointer`                                                                  | default 2.5=10 + arbitrary 6  |
| L186 scroll | `flex:1, overflow:'auto', padding:16, display:'flex', flexDirection:'column', gap:16`                    | `flex-1 overflow-auto p-4 flex flex-col gap-4`                                                    | P2                             |
| L188 preview wrap (mobile) | `width:'100%'`                                                                                  | `w-full`                                                                                          | P3                             |
| L193 dl wrap (mobile) | `textAlign:'center'`                                                                                | `text-center`                                                                                    | P3                             |
| L194 desc text | `marginBottom:12`                                                                                    | `mb-3`                                                                                            | override 3=12                  |
| L201 dl btn (mobile) | `width:'100%', padding:'14px', gap:8, border:'none'`                                                | `w-full p-[14px] gap-2 border-0`                                                                  | P1/P5                          |

## 잔존 inline style 6곳 (옵션 N — 모두 동적 / 상수 변수)

| 파일                | Line | 잔존 이유                                                                                                                                                                                                            |
| ------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WorkShiftPage.tsx   | 139  | `height: HDR_H` — `HDR_H = 52` 상수 변수. tailwind className `h-[52px]` 으로 풀 수도 있지만, **상수 변수 의미 보존 (유지보수성)** + 메모리 anchor `project_redesign_16_workshift_status.md` 표 sticky 보존. 옵션 N |
| WorkShiftPage.tsx   | 150  | `height: ROW_H` — 동일 (ROW_H = 46)                                                                                                                                                                                  |
| WorkShiftPage.tsx   | 176  | `height: HDR_H` — th 날짜 (정적 HDR_H 상수)                                                                                                                                                                          |
| WorkShiftPage.tsx   | 195  | td 근무 multiline: `height: ROW_H, color: SHIFT_COLOR[sh], background: SHIFT_COLOR[sh]+'22'` — **ROW_H 상수 + SHIFT_COLOR 동적 배열 변수** (4 색 키워드별 분기). 옵션 N (변수 보존)                                  |
| WorkShiftPage.tsx   | 217  | 범례 박스 dynamic: `background:SHIFT_COLOR[sh]+'22', borderColor:SHIFT_COLOR[sh], color:SHIFT_COLOR[sh]` — SHIFT_COLOR 배열 변수 (옵션 N)                                                                              |
| AnnualPlanPage.tsx  | 74   | yearPos 캘리브 좌표 시그니처: `position:'absolute', top:'${yearPos.y}%', left:'${yearPos.x}%', transform:'translate(-50%,-50%)', fontSize:'min(1.4vw, 16px)', fontWeight:700, color:'#000', fontFamily:'Malgun Gothic, 맑은 고딕, sans-serif', pointerEvents:'none'` — **메모리 룰: 1 byte 변경 0 LOCKED** |

6건 모두 옵션 N 룰 (동적 색 변수 + 동적 좌표 백분율 + 상수 변수) 정확히 충족.

## Verification Results (모든 게이트 PASS)

| Check                                                                                              | Result        | 비고                                                                  |
| -------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------- |
| `grep -c 'style={{' WorkShiftPage.tsx`                                                             | **5**         | 24 → 5 (-19, -79%)                                                    |
| `grep -c 'style={{' AnnualPlanPage.tsx`                                                            | **1**         | 21 → 1 (-20, -95%)                                                    |
| 비즈 anchor count diff (9종 × 2 파일)                                                               | **IDENTICAL** | onClick / useState / useRef / useEffect / useMutation / useQuery / useNavigate / useParams / fetch — empty diff |
| onClick handler bodies precise diff (WorkShift 2 uniq / Annual 4 uniq)                              | **IDENTICAL** | `grep -oE 'onClick=\{[^}]+\}' \| sort \| uniq` 2 파일 모두 empty diff |
| `grep -cE '✓\|✗\|🔒\|💾\|🔥\|⏰\|📋\|✅\|⚠️\|❌\|🔧\|🚨\|🔍\|🧯\|📊'` (2 파일)                       | **0**         | Phase A §7.1 결과 보존                                                  |
| 비표준 색 토큰 grep (`bg-warning[^-]\|border-safe[^-]\|border-warning[^-]\|border-danger[^-]`) (2 파일) | **0**         | Phase A §2.3 결과 보존                                                  |
| TypeScript `tsc --noEmit` 전체 에러                                                                 | **0**         | 신규 에러 0                                                            |
| 변경 파일 범위 (`.planning/` 외)                                                                     | **2 .tsx**    | WorkShiftPage + AnnualPlanPage                                          |
| post-commit deletions (`git diff --diff-filter=D HEAD~1 HEAD`)                                     | **none**      | 의도하지 않은 삭제 없음                                                  |
| **yearPos 캘리브 좌표 byte 변경**                                                                    | **0 byte**    | L74-81 8 line 완전 보존 (yearPos.y/yearPos.x grep occurrences = 2)        |
| HDR_H / ROW_H 상수 정의 보존                                                                         | **OK**        | L11/L12 그대로 (52, 46)                                                |
| SHIFT_COLOR import 보존                                                                              | **OK**        | L4 import 그대로                                                       |
| holidays fetch 보존                                                                                  | **OK**        | L28 fetch('https://holidays.hyunbin.page/basic.json') 그대로            |

### 비즈 anchor identity 상세 (precise diff = empty)

```
=== src/pages/WorkShiftPage.tsx (양쪽 동일) ===
  onClick=\{[^}]+\} : 2
  useState\( : 3
  useRef\( : 0   (* useRef<HTMLDivElement>(null) / useRef<HTMLTableCellElement>(null) 패턴 — 정규식 useRef\( 직접 매치 0 = baseline 동일)
  useEffect\( : 1
  useMutation\( : 0
  useQuery\( : 1
  useNavigate\( : 1
  useParams\( : 0
  fetch\( : 1

=== src/pages/AnnualPlanPage.tsx (양쪽 동일) ===
  onClick=\{[^}]+\} : 6
  useState\( : 2
  useRef\( : 0
  useEffect\( : 0
  useMutation\( : 0
  useQuery\( : 0
  useNavigate\( : 1
  useParams\( : 0
  fetch\( : 0
```

diff before↔after = 0 줄 차이 (2 파일 모두).

### onClick precise diff (2 파일 모두 IDENTICAL)

- WorkShiftPage: 2 uniq handler bodies (`() => navigate(-1)`, `handleExcel`) — diff empty
- AnnualPlanPage: 4 uniq handler bodies (`() => navigate(-1)`, `() => setCalibMode(m => !m)`, `handleDownload`, `handleImageClick`) — diff empty

## 캘리브 anchor 보존 확인 (양쪽 캘리브 룰)

### WorkShiftPage (HDR_H/ROW_H/SHIFT_COLOR 상수+동적 변수)

| anchor                                    | 원본 값                  | 변환 후                                  | 결과     |
| ----------------------------------------- | ------------------------ | ---------------------------------------- | -------- |
| `HDR_H` 상수                              | `52`                      | L11 그대로 + style L139/L176 인용 잔존    | ✓ 정확값 |
| `ROW_H` 상수                              | `46`                      | L12 그대로 + style L150/L195 인용 잔존    | ✓ 정확값 |
| `SHIFT_COLOR` 배열                        | 외부 모듈 import          | L4 import 그대로 + style L195/L217 인용  | ✓ 정확값 |
| 이름 열 width                              | `82`                      | `w-[82px]` (arbitrary)                    | ✓ 정확값 |
| 이름 열 padding x                          | `0 10px`                  | `px-2.5` (default 2.5=10)                 | ✓ 정확값 |
| 날짜 셀 minWidth                           | `40`                      | `min-w-10` (override 10=40)               | ✓ 정확값 |
| 날짜 셀 padding x                          | `2px`                     | `px-[2px]` (arbitrary 2)                   | ✓ 정확값 |
| 날짜 셀 padding y (header)                 | `4px`                     | `py-1` (override 1=4)                      | ✓ 정확값 |
| 셀 marginTop (요일/직급)                   | `2`                       | `mt-[2px]`                                  | ✓ arbitrary |
| header height (desktop)                    | `54`                      | `h-[54px]`                                  | ✓ arbitrary |
| header padding (desktop)                   | `0 20px`                  | `px-5` (override 5=20)                     | ✓ 정확값 |
| header gap (desktop)                       | `10`                      | `gap-2.5` (default 2.5=10)                  | ✓ 정확값 |
| header padding (mobile)                    | `8px 12px 9px`            | `pt-2 px-3 pb-[9px]`                        | ✓ 혼합 (default + arbitrary) |
| 엑셀 저장 btn height                       | `34`                      | `h-[34px]`                                  | ✓ arbitrary |
| 엑셀 저장 btn padding x                    | `14px`                    | `px-[14px]`                                 | ✓ arbitrary |
| 년/월 선택 padding                          | `10px 12px`               | `px-3 py-[10px]`                            | ✓ 혼합 |
| select padding                             | `7px 10px`                | `px-2.5 py-[7px]`                            | ✓ 혼합 |
| 표 영역 padding-top (desktop)              | `12vh`                    | `pt-[12vh]`                                  | ✓ arbitrary |
| 표 영역 padding (desktop)                  | `0 32px`                  | `px-[32px]` (px-7=32 override 함정 회피)     | ✓ arbitrary 32 |
| 표 영역 padding (mobile)                   | `16px 24px`               | `px-6 py-4` (override 4=16 / 6=24)          | ✓ 정확값 |
| 범례 gap                                   | `14`                      | `gap-[14px]` (arbitrary)                     | ✓ arbitrary |
| 범례 padding-top                           | `10px`                    | `pt-[10px]` (arbitrary)                      | ✓ arbitrary |
| 범례 padding-bottom                        | `28px`                    | `pb-[28px]` (arbitrary — Rule 1 fix patch 4e99270 으로 보정) | ✓ 정확값 |
| 범례 item gap                              | `5`                       | `gap-[5px]` (arbitrary, gap-5=20 함정 회피)   | ✓ arbitrary |

### AnnualPlanPage (yearPos 캘리브 좌표)

| anchor                            | 원본 값                              | 변환 후                                                 | 결과     |
| --------------------------------- | ------------------------------------ | ------------------------------------------------------- | -------- |
| **yearPos style block (L74-81)**  | 8 line multiline (top/left % + transform translate + fontSize min() + fontWeight + color + fontFamily 한글 + pointerEvents) | **그대로 잔존 (옵션 N)** — 1 byte 변경 0                | ✓ LOCKED |
| `yearPos.y/yearPos.x` 참조        | L20 useState + L76 인용 (2 occurrences) | 그대로 (2 occurrences)                                  | ✓ 정확값 |
| FINGER_OFFSET 상수                | L10 `= 60`                            | 그대로                                                  | ✓ 정확값 |
| STORAGE_KEY 상수                   | L8 `'annual_plan_year_pos'`           | 그대로                                                  | ✓ 정확값 |
| handleImageClick 좌표 계산         | L36-46 6 line                        | 그대로                                                  | ✓ 정확값 |
| handleImageTouch 좌표 계산         | L48-60 13 line                       | 그대로                                                  | ✓ 정확값 |
| calibMode 안내 박스 padding       | `6px 16px`                            | `px-4 py-[6px]` (override 4=16 + arbitrary 6)            | ✓ 혼합 |
| calibMode 안내 top                | `8`                                   | `top-2` (override 2=8)                                  | ✓ 정확값 |
| desktop top padding-x             | `28px`                                | `px-[28px]` (px-7=32 함정 회피)                          | ✓ arbitrary 28 |
| desktop top padding-y             | `14px`                                | `py-[14px]` (arbitrary)                                  | ✓ arbitrary |
| desktop top gap                   | `12`                                  | `gap-3` (override 3=12)                                  | ✓ 정확값 |
| desktop calib btn padding         | `8px 14px`                            | `px-[14px] py-2` (override 2=8 + arbitrary 14)           | ✓ 혼합 |
| desktop dl btn padding            | `8px 20px`                            | `px-5 py-2` (override 5=20 + override 2=8)              | ✓ 정확값 |
| desktop preview padding           | `24`                                  | `p-6` (override 6=24)                                   | ✓ 정확값 |
| desktop max wrapper maxWidth      | `calc((100vh - 140px) * 1.414)`       | `max-w-[calc((100vh-140px)*1.414)]`                      | ✓ arbitrary CSS calc |
| mobile header padding             | `8px 12px 9px`                        | `pt-2 px-3 pb-[9px]`                                     | ✓ 혼합 |
| mobile calib btn padding          | `6px 10px`                            | `px-2.5 py-[6px]` (default 2.5=10 + arbitrary 6)         | ✓ 혼합 |
| mobile dl btn padding             | `14px`                                | `p-[14px]`                                              | ✓ arbitrary |
| mobile scroll padding             | `16`                                  | `p-4` (override 4=16)                                   | ✓ 정확값 |
| mobile scroll gap                 | `16`                                  | `gap-4` (override 4=16)                                 | ✓ 정확값 |
| mobile desc marginBottom          | `12`                                  | `mb-3` (override 3=12)                                  | ✓ 정확값 |

## 잠금 검토 항목 — WorkShiftPage L212 pb-7 함정 (Rule 1 자동 fix 완료)

자체 검수 중 **L212 footer 의 pb-7 사용이 시각 4px 변동 (28→32px) 을 일으킴**을 발견:
- `tailwind.config.js`: `spacing: { '7': '32px' }`
- 원본 padding: `padding:'10px 0 28px'` → bottom 28px
- 1차 commit (a78963f): `pt-[10px] pb-7` → bottom 32px (시각 +4px 변동)

**Rule 1 (시각 회귀 버그) 적용 → follow-up patch commit 4e99270 으로 `pb-[28px]` arbitrary 보정 완료.**

Wave 2 LoginPage L218 (`pb-8 → pb-[32px]`) 와 동일 함정 패턴. 메모리 anchor `feedback_tailwind_w8_h8_is_48px.md` 의 w-7=32 / w-8=48 override 함정 인지 룰 적용. 시각 0 byte 룰 100% 준수.

## Phase A 보존 확인

| Phase A 항목                                   | WorkShiftPage | AnnualPlanPage | 비고                                |
| ---------------------------------------------- | ------------- | -------------- | ----------------------------------- |
| Lucide import (ChevronLeft, Download)          | OK            | OK             | size={15} / size={16} 그대로         |
| 색 토큰 `-bar` 변종                              | OK            | OK             | `bg-safe-bar` (엑셀/다운로드 버튼) 그대로 |
| Emoji 0 (watched set)                          | OK            | OK             | grep 0                              |
| 비표준 색 토큰 0                                 | OK            | OK             | grep 0                              |

## 비즈니스 로직 0 byte 확인 (precise)

원본 2 + 6 = 8건 onClick handler 본체를 `grep -oE 'onClick=\{[^}]+\}' | sort | uniq` 으로 추출 후 diff:
- WorkShiftPage: 2건 IDENTICAL (`() => navigate(-1)`, `handleExcel`)
- AnnualPlanPage: 4 uniq IDENTICAL (`() => navigate(-1)`, `() => setCalibMode(m => !m)`, `handleDownload`, `handleImageClick`)

또한 useState / useRef / useEffect / useMutation / useQuery / useNavigate / useParams / fetch 호출 카운트도 2 파일 모두 byte-identical (위 표).

추가 보존 확인:
- WorkShiftPage L24-41: useQuery holidays fetch 그대로 (fetch URL / queryKey / staleTime)
- WorkShiftPage L43-50: useStaffList / STAFF_ORDER / staffForCalc / getMonthlySchedule 그대로
- WorkShiftPage L52-69: isToday / isRed / useEffect scrollIntoView 그대로
- WorkShiftPage L71-83: handleExcel 그대로 (dynamic import generateShiftExcel)
- AnnualPlanPage L8-21: STORAGE_KEY / FINGER_OFFSET / loadPos / useState yearPos 그대로
- AnnualPlanPage L24-34: handleDownload 그대로 (generateAnnualPlan)
- AnnualPlanPage L36-60: handleImageClick / handleImageTouch 좌표 계산 그대로

## Memory anchor 적용 확인

| Anchor                                                              | 적용 사례                                                                                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `feedback_tailwind_w8_h8_is_48px.md`                                | **px-7=32 함정 회피** — `padding:'14px 28px'` (Annual L115) → `px-[28px]` arbitrary (override `'7':'32px'` 인지)      |
| `feedback_tailwind_token_class_pattern.md`                          | `bg-surface-page` / `bg-surface-raised` / `bg-safe-bar` / `bg-surface-sunken` — extend.colors token short form 유지 |
| `feedback_text_caption_leading_none.md`                             | 작은 컨테이너 (text-caption 라벨 / 부제) `leading-none` 명시 그대로 보존                                              |
| `project_redesign_16_workshift_status.md` (HDR_H/ROW_H/SHIFT_COLOR) | WorkShift 5건 잔존 (상수+동적 변수 옵션 N) — holidays fetch + 표 sticky scroll + SHIFT_COLOR 인라인 그대로            |
| `project_redesign_17_annual_plan_status.md` (캘리브 좌표 5건 1 byte 0) | AnnualPlan L74 yearPos 8 line 그대로 — 1 byte 변경 0 룰 100% 적용                                                  |
| `project_redesign_28_splash_status.md` (단순 페이지 단일 atomic)     | WorkShift + AnnualPlan 단일 atomic 패턴 (precedent: c9s + 28-splash + 27-login + 23-education) 자동 도달          |

## Commits

| Hash    | Subject                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------ |
| a78963f | `feat(260528-cjn-01): Phase B Wave 3 — WorkShift 24 + Annual 21 inline → tailwind`                                        |
| 4e99270 | `fix(260528-cjn-01): WorkShift footer pb-7 → pb-[28px] (config override 함정)` — Rule 1 시각 4px 회귀 자체 검수 즉시 보정 |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Visual regression] WorkShift L212 footer pb-7 → pb-[28px] (config override 함정)**
- **Found during:** 자체 검수 (Step 4 verification 직후 SUMMARY 작성 중 캘리브 anchor 표 검토)
- **Issue:** `padding:'10px 0 28px'` 원본 28px → `pb-7` 변환은 tailwind.config override `'7':'32px'` 로 인해 32px 가 됨 (시각 +4px 회귀). 메모리 anchor `feedback_tailwind_w8_h8_is_48px.md` 의 w-7=32 함정과 동일 패턴 (Wave 2 c9s 의 `pb-8 → pb-[32px]` 보정 precedent).
- **Fix:** `pb-7` → `pb-[28px]` arbitrary (시각 0 byte 룰 100% 준수)
- **Files modified:** src/pages/WorkShiftPage.tsx (1 line)
- **Commit:** 4e99270

### Auto-decisions (PLAN 인용 직접 적용)

**1. L195 tdy spread → conditional className 합병 (옵션 M)**
- PLAN 단순화 옵션 명시 ("tdy 가 boolean 이므로 conditional className: `${tdy ? 'bg-[rgba(59,130,246,0.15)]' : ''}` (옵션 M)") + "옵션 M 우선" 결정 직접 인용
- 결과: spread pattern 제거 → className 합병 (border-2/border-accent + background rgba 모두 conditional 단일 표현)
- 효과: WorkShiftPage style 잔존 6 → 5 (PLAN 예상 ~5 정확히 일치)

## 배포 계획

- **이 워크트리 (디자인 트랙):** main 머지 → cbc7119-preview.pages.dev 자동 배포 (GitHub Actions). 시각 0 byte 보장이므로 preview 검증은 페이지 정상 렌더 + 빌드 통과 정도로 충분 (L236 pb-7 4px 차이는 별도 patch 우선).
- **production cherry-pick 후보 묶음:** Phase B Tier 1 Wave 1~11 묶음 B (roadmap 5.B) 완료 후 일괄 cherry-pick. 본 wave (a78963f) 는 묶음 B 의 세 번째 commit (a3v 18fd138 + c9s d36a20f 다음).
- **이 워크트리에서는 wrangler 명령 금지 / production deploy 금지** — `.claude/settings.local.json` deny 룰 준수.

## Next Steps (out of scope)

- **Wave 4 (Dashboard + DailyReport + WorkLog):** roadmap §4 Tier 1 Wave 4. 큰 페이지 + 도넛/통계 캘리브.
- **묶음 B production cherry-pick:** Wave 11 까지 완료 후 일괄 (현재 시점에서는 진행 X). 묶음에 a78963f + 4e99270 두 commit 모두 포함 (또는 squash).

## Self-Check: PASSED

**Files:**
- FOUND: cha-bio-safety/src/pages/WorkShiftPage.tsx (modified, 24→5)
- FOUND: cha-bio-safety/src/pages/AnnualPlanPage.tsx (modified, 21→1)
- FOUND: cha-bio-safety/.planning/quick/260528-cjn-phase-b-wave-3/260528-cjn-SUMMARY.md (this file)

**Commits:**
- FOUND: a78963f (Task 1 atomic — Wave 3 근무표/연간 계획)
- FOUND: 4e99270 (Rule 1 fix — WorkShift pb-7 → pb-[28px] 시각 회귀 보정)
