---
title: "redesign/16-workshift — wave 5 (TSX conversion checklist)"
status: pending  # TSX 변환 wave 시작 전 사용자 컨펌 후 in-progress
created: 2026-05-21
quick_id: 260521-t12
branch: redesign/16-workshift
source_tsx: cha-bio-safety/src/pages/WorkShiftPage.tsx
source_tsx_lines: 226
source_utils:
  - cha-bio-safety/src/utils/shiftCalc.ts (SHIFT_COLOR / DOW_KO / RawShift / getMonthlySchedule export, 변경 0)
  - cha-bio-safety/src/utils/generateExcel.ts (generateShiftExcel export, sketch 영역 아님, 변경 0)
sketch_sources:
  - cha-bio-safety/docs/redesign-context/16-workshift/sketch-wave-2-header-select.html
  - cha-bio-safety/docs/redesign-context/16-workshift/sketch-wave-3-shift-table.html
  - cha-bio-safety/docs/redesign-context/16-workshift/sketch-wave-4-legend.html
mirror_of: cha-bio-safety/docs/redesign-context/27-login/wave-5-tsx-conversion-checklist.md (260521-f01)
tokens_check:
  - "tokens.css --status-danger 다크 #f87171 / 라이트 #991b1b — 둘 다 #ef4444 와 불일치"
  - "OQ #5 LOCKED fallback 적용: 공휴일·주말 글자 인라인 text-[#ef4444] 또는 인라인 color:#ef4444"
---

# redesign/16-workshift — wave 5 (TSX conversion checklist)

본 markdown 은 W2~W4 sketch 결과를 기반으로 `WorkShiftPage.tsx` 의 인라인 style 을 Tailwind v0.1.1 utility 로 치환하는 **TSX 변환 wave 진입을 위한 verify checklist**.

> 본 문서는 sketch 가 아니다. 12 섹션으로 구성된 markdown 으로, TSX 변환 wave 진입 시 진입 자격 / 변환 매핑 / 자체 verify 명령을 모두 박제한다.

## §1. 변환 범위 + 산출 파일

**단일 파일 in-place 수정:** `cha-bio-safety/src/pages/WorkShiftPage.tsx` (226 lines → 약 230~260 lines 예상)

**3 wave sketch 결과 → className 1:1 매핑:**

- W2 (헤더 + 년·월 select, `sketch-wave-2-header-select.html`)
- W3 (표 영역 — 이름 열 + 날짜 열 + today + 공휴일·주말 + shift 4종, `sketch-wave-3-shift-table.html`)
- W4 (범례 4 shift 박스 + 한글 라벨, `sketch-wave-4-legend.html`)

**중요한 negative scope:**
- `components.css` **신규 생성 X** (페이지 로컬 인라인 토큰 유지)
- `shiftCalc.ts` **변경 0** (SHIFT_COLOR / DOW_KO / RawShift / getMonthlySchedule export 시그니처 보존)
- `generateExcel.ts` **변경 0** (generateShiftExcel export 시그니처 보존)
- 비즈 로직 **0 diff** (state / handler / effect / hook 모두 보존, §10 체크박스)

**Lucide import 1줄 추가:** `import { ChevronLeft } from 'lucide-react'` (OQ #2 LOCKED — 모바일 back button 인라인 SVG 교체)

---

## §2. 보존 (`WorkShiftPage.tsx` 비즈 로직 100% 보존 목록)

WorkShiftPage.tsx 의 모든 비즈 로직은 0 byte 변경. UI markup + 인라인 style 만 재작성.

| line | 항목 | 보존 방식 |
|---|---|---|
| 1~7 | import 7개 (useState/useRef/useEffect / useNavigate / useQuery / shiftCalc / RawShift / useStaffList / useIsDesktop) | 그대로 + `lucide-react` ChevronLeft 1줄 추가 |
| 9 | `SHIFT_LABEL: Record<RawShift, string>` 4종 | 그대로 ('당직'/'비번'/'주간'/'휴무') |
| 10~11 | `HDR_H = 52` / `ROW_H = 46` 상수 | 그대로 (자동 스크롤 vh 영향) |
| 14~16 | useNavigate / useIsDesktop / today 변수 | 그대로 |
| 17~19 | useState 3종 (year / month / dlLoading) | 그대로 |
| 20~21 | useRef 2종 (scrollRef / todayRef) | 그대로 |
| 23~40 | useQuery `['holidays-dates']` + fetch hyunbin.page + try/catch → [] | 그대로 (memory `feedback_korean_holidays_library_gap`) |
| 42~48 | useStaffList + STAFF_ORDER 4명 정렬 (석현민/김병조/윤종엽/박보융) | 그대로 |
| 49 | `getMonthlySchedule(year, month, staffForCalc)` → `{ daysInMonth, staffRows }` | 그대로 |
| 51~52 | `isToday(d)` helper | 그대로 |
| 54~60 | `isRed(d)` helper (주말 + 공휴일) | 그대로 |
| 63~68 | useEffect 자동 가운데 스크롤 + requestAnimationFrame | 그대로 |
| 70~82 | `handleExcel` dynamic import + generateShiftExcel + toast.error | 그대로 |
| 96 | `!isDesktop &&` 모바일 only back button 분기 | 그대로 (OQ #2 LOCKED) |
| 97 | `navigate(-1)` onClick | 그대로 |
| 105 | `handleExcel` onClick | 그대로 |
| 106 | `disabled={dlLoading}` | 그대로 |
| 109 | `{dlLoading ? '생성중...' : '엑셀 저장'}` 카피 분기 | 그대로 |
| 115, 118 | select onChange `setYear(Number(e.target.value))` / `setMonth(...)` | 그대로 |
| 116, 119 | select 옵션 map `[2025,2026,2027].map(y => ...)` / `Array.from({length:12},(_,i) => i+1).map(...)` | 그대로 |
| 144~152 | `staffRows.map(s => ...)` 이름 열 row | 그대로 |
| 161~182 | day cell map `Array.from({length:daysInMonth},(_,i) => ...)` + tdy `todayRef` 분기 | 그대로 |
| 169 | `ref={tdy ? todayRef : undefined}` | 그대로 |
| 188~205 | shift cell map `s.shifts.map((sh, i) => ...)` + tdy 분기 + SHIFT_COLOR 인라인 | 그대로 (OQ #4 LOCKED) |
| 214~219 | 범례 4 shift map `(['당','비','주','휴'] as RawShift[]).map(sh => ...)` | 그대로 |

---

## §3. 변환 매핑 (영역별 className/토큰/폰트 변환 표 — W2/W3/W4 sketch verbatim 인용)

### §3.1 영역 2 — 헤더 (line 88~111, W2 sketch 출처)

| 현재 (인라인 style) | 변환 후 (className + 인라인) | sketch 출처 |
|---|---|---|
| `<header style={{ background:'var(--bg2)', borderBottom:'1px solid var(--bd)', ...isDesktop?{...}:{...} }}>` | `<header className="bg-surface-raised border-b border-border-default flex items-center" style={{ flexShrink:0, ...isDesktop?{height:54,padding:'0 20px',gap:10}:{padding:'8px 12px 9px',gap:8} }}>` | W2 frame 1, 3 |
| back button (모바일 only, line 96~102) `width:34, height:34, borderRadius:8, background:'var(--bg3)', border:'1px solid var(--bd)'` + 인라인 SVG | `className="w-[34px] h-[34px] rounded-sm bg-surface-sunken border border-border-default flex items-center justify-center"` + `<ChevronLeft size={15} className="text-text-secondary" />` (OQ #2 LOCKED Lucide 교체, line 1 또는 7 다음 lucide-react import 추가) | W2 frame 1, 2 |
| 타이틀 `fontSize: isDesktop ? 16 : 14, fontWeight:700, color:'var(--t1)'` | `className="text-body font-bold text-text-primary"` style={{ flex:1 }} (OQ #3 LOCKED 모바일 14→16 격상) | W2 모든 frame |
| 엑셀 버튼 `height:34, padding:'0 14px', borderRadius:8, background:'var(--acl)', color:'#fff', fontSize:12, fontWeight:600, opacity: dlLoading ? 0.6 : 1` | ``className={`bg-safe-bar text-text-on-accent text-caption font-bold leading-none rounded-sm border-0 ${dlLoading?'opacity-60 cursor-not-allowed':'cursor-pointer'}`}`` style={{ height:34, padding:'0 14px' }} (OQ #1 LOCKED solid + OQ #3 LOCKED 12 text-caption leading-none) | W2 모든 frame |

### §3.2 영역 3 — 년·월 select (line 113~121, W2 sketch 출처)

| 현재 | 변환 후 | sketch |
|---|---|---|
| 컨테이너 `background:'var(--bg2)', borderBottom 1px var(--bd), padding:'10px 12px', gap:8, flexShrink:0` | `className="bg-surface-raised border-b border-border-default flex"` style={{ gap:8, padding:'10px 12px', flexShrink:0 }} | W2 모든 frame |
| select `padding:'7px 10px', borderRadius:9, background:'var(--bg3)', border 1px var(--bd2), color:'var(--t1)', fontSize:13, outline:none` | `className="bg-surface-sunken border border-border-strong text-text-primary text-label rounded-[9px]"` style={{ padding:'7px 10px', outline:'none' }} (OQ #3 LOCKED 13 text-label) | W2 |

### §3.3 영역 4 — 표 영역 (line 123~210, W3 sketch 출처)

**메타 — tokens.css 검증 결과 (OQ #5 LOCKED fallback):**

> `grep -E '--status-danger:' tokens.css` 결과 = 다크 `#f87171` / 라이트 `#991b1b` — **둘 다 `#ef4444` 와 불일치**. 공휴일·주말 글자는 **인라인 `text-[#ef4444]` fallback** 채택 (`text-danger` 토큰 사용 불가). W3 sketch 도 동일 패턴.

| 현재 | 변환 후 | sketch |
|---|---|---|
| 외곽 `flex:1, overflow:auto, display:flex flex-direction:column items-center, paddingTop: isDesktop ? '12vh' : 0` | 인라인 유지 (style 그대로) — Tailwind 변환 비용 vs 인라인 1줄 | W3 frame 4 |
| 내곽 `inline-flex column, padding: isDesktop ? '0 32px' : '16px 24px'` | 인라인 유지 | W3 |
| 이름 헤더 `height:HDR_H, width:82, padding:'0 10px', border 1px var(--bd), background:'var(--bg3)', color:'var(--t2)', fontSize:12, fontWeight:700, whiteSpace:nowrap` | `className="bg-surface-sunken border border-border-default text-text-secondary text-caption font-bold leading-none"` style={{ height:HDR_H, width:82, padding:'0 10px', whiteSpace:'nowrap' }} (OQ #3 LOCKED) | W3 |
| staff name td `bg:var(--bg2), border 1px var(--bd)` | `className="bg-surface-raised border border-border-default"` style={{ height:ROW_H, padding:'0 10px', whiteSpace:'nowrap' }} | W3 |
| staff name div `fontSize:14, fontWeight:700, var(--t1)` | `className="text-body-sm font-bold text-text-primary"` (OQ #3 LOCKED 14→text-body-sm) | W3 |
| staff title div `fontSize:10 var(--t3), marginTop:2` | `className="text-caption leading-none text-text-tertiary"` style={{ marginTop:2 }} (OQ #3 LOCKED 10→text-caption) | W3 |
| day cell normal `border 1px var(--bd), background:'var(--bg3)', color:'var(--t2)'` | `className="bg-surface-sunken border border-border-default text-text-secondary"` (red 면 `text-[#ef4444]` fallback, today 면 `border-2 border-accent` + 인라인 bg) | W3 |
| day cell today `border '2px solid var(--acl)', background:'rgba(59,130,246,0.15)'` | `className="border-2 border-accent"` style={{ background:'rgba(59,130,246,0.15)' }} (OQ #5 LOCKED border-accent + 인라인 bg 유지) | W3 |
| day cell red (공휴일·주말) `color:'#ef4444'` | `className="text-[#ef4444]"` 또는 style={{ color:'#ef4444' }} (OQ #5 LOCKED fallback, tokens.css 불일치 검증 결과) | W3 |
| d `fontSize:13, fontWeight:700` | `className="text-label font-bold leading-none"` (OQ #3 LOCKED 13→text-label) | W3 |
| DOW_KO `fontSize:10` | `className="text-caption leading-none"` style={{ marginTop:2 }} (OQ #3 LOCKED 10→text-caption) | W3 |
| shift cell `border tdy ? '2px solid var(--acl)' : '1px solid var(--bd)' + fontSize:15, fontWeight:700 + color:SHIFT_COLOR[sh] + background:SHIFT_COLOR[sh]+'22'` | ``className={tdy ? 'border-2 border-accent text-body font-bold' : 'border border-border-default text-body font-bold'}`` style={{ height:ROW_H, minWidth:40, padding:'0 2px', textAlign:'center', color:SHIFT_COLOR[sh], background:SHIFT_COLOR[sh]+'22' }} (OQ #3 LOCKED 15→text-body 16 셀 가독성 우선 + OQ #4 LOCKED 인라인 hex 유지) | W3 |

### §3.4 영역 5 — 범례 (line 212~220, W4 sketch 출처)

| 현재 | 변환 후 | sketch |
|---|---|---|
| 컨테이너 `display:flex, gap:14, padding:'10px 0 28px', flexWrap:wrap, justifyContent:center` | `className="flex flex-wrap justify-center"` style={{ gap:14, padding:'10px 0 28px' }} | W4 |
| shift row `display:flex, alignItems:center, gap:5, fontSize:12` | `className="flex items-center"` style={{ gap:5 }} (fontSize 는 box/span 분리 적용) | W4 |
| shift box `width:24, height:24, borderRadius:5, background:SHIFT_COLOR[sh]+'22', border 1.5px solid SHIFT_COLOR[sh], fontWeight:800, fontSize:13, color:SHIFT_COLOR[sh]` | `className="w-6 h-6 rounded-[5px] border-[1.5px] flex items-center justify-center text-label font-extrabold leading-none"` style={{ background:SHIFT_COLOR[sh]+'22', borderColor:SHIFT_COLOR[sh], color:SHIFT_COLOR[sh] }} (OQ #3 LOCKED 13→text-label font-extrabold leading-none + OQ #4 LOCKED 인라인 hex 유지 + memory `feedback_tailwind_w8_h8_is_48px` w-6=24 안전) | W4 |
| 라벨 `fontSize:12, color:'var(--t2)'` | `className="text-caption leading-none text-text-secondary"` (OQ #3 LOCKED 12 유지 + leading-none) | W4 |

---

## §4. OQ LOCKED 5건 변환 결과 반영 (W1 §7 verbatim + 코드 적용 line 범위)

```
OQ #1 LOCKED (엑셀 저장 버튼 bg-safe-bar solid):
  - line 107: background:'var(--acl)' → className "bg-safe-bar text-text-on-accent"
  - line 107: opacity: dlLoading ? 0.6 : 1 → className 분기 "opacity-60 cursor-not-allowed" / "cursor-pointer"
  - 영향 line: 104~110

OQ #2 LOCKED (헤더 raised + 모바일 only back button + Lucide ChevronLeft):
  - line 93: background:'var(--bg2)' → className "bg-surface-raised"
  - line 96: !isDesktop && (모바일 only 분기) 그대로
  - line 97: width:34, height:34, borderRadius:8, background:'var(--bg3)', border 1px var(--bd)
       → className "w-[34px] h-[34px] rounded-sm bg-surface-sunken border border-border-default"
  - line 98~100: 인라인 SVG <svg width={15} height={15} ... d="M15 19l-7-7 7-7"/>
       → <ChevronLeft size={15} className="text-text-secondary" />
  - line 1 또는 7 다음: import { ChevronLeft } from 'lucide-react' 1줄 추가

OQ #3 LOCKED (폰트 격상 verbatim):
  - line 103 타이틀: fontSize: isDesktop ? 16 : 14 → className "text-body font-bold" (모바일 14→16 격상)
  - line 107 엑셀 버튼: fontSize:12 → className "text-caption font-bold leading-none"
  - line 115, 118 select: fontSize:13 → className "text-label"
  - line 138 이름 헤더: fontSize:12 → className "text-caption font-bold leading-none"
  - line 147 staff name: fontSize:14 → className "text-body-sm font-bold"
  - line 148 staff title: fontSize:10 → className "text-caption leading-none"
  - line 178 d: fontSize:13, fontWeight:700 → className "text-label font-bold leading-none"
  - line 179 DOW_KO: fontSize:10 → className "text-caption leading-none"
  - line 197 shift cell: fontSize:15, fontWeight:700 → className "text-body font-bold" (15→16 격상)
  - line 216 범례 box: fontSize:13, fontWeight:800 → className "text-label font-extrabold leading-none"
  - line 217 범례 라벨: fontSize:12 → className "text-caption leading-none"

OQ #4 LOCKED (SHIFT_COLOR hex+22 알파 인라인 유지):
  - line 198 shift cell: color:SHIFT_COLOR[sh], background:SHIFT_COLOR[sh]+'22' 인라인 그대로 유지
  - line 216 범례 box: background:SHIFT_COLOR[sh]+'22', border:`1.5px solid ${SHIFT_COLOR[sh]}`, color:SHIFT_COLOR[sh] 인라인 그대로 유지
  - shiftCalc.ts SHIFT_COLOR 상수 1 byte 변경 X

OQ #5 LOCKED (today border-accent + 공휴일·주말 text-[#ef4444] fallback):
  - line 172, 196 today border: '2px solid var(--acl)' → className "border-2 border-accent"
  - line 173 (NOT-today) border: '1px solid var(--bd)' → className "border border-border-default"
  - line 173 today bg: 'rgba(59,130,246,0.15)' 인라인 유지 (신규 토큰 정의 비용 회피)
  - line 174 red (공휴일·주말): color:'#ef4444'
       → className "text-[#ef4444]" 또는 style={{ color:'#ef4444' }} fallback
       (tokens.css --status-danger 다크 #f87171 / 라이트 #991b1b 불일치 검증 결과)
  - line 174 not-red: color:'var(--t2)' → className "text-text-secondary"
```

---

## §5. negative gate (TSX 변환 후 `WorkShiftPage.tsx` 가 통과해야 할 grep gate)

```bash
# 1. 이모지 0건 (sketch 본문 + TSX 변환 결과 모두)
grep -cE '[😀-🛿🤀-🧿🩰-🩴]' cha-bio-safety/src/pages/WorkShiftPage.tsx
# 기대값: 0

# 2. linear-gradient 0건 (OQ #1 LOCKED)
grep -c 'linear-gradient' cha-bio-safety/src/pages/WorkShiftPage.tsx
# 기대값: 0

# 3. 9·10·11px 0건 (OQ #3 LOCKED 격상 결과, fontSize/font-size 양쪽)
grep -v '^\s*//' cha-bio-safety/src/pages/WorkShiftPage.tsx | grep -cE 'fontSize:\s*(9|10|11)[^0-9]|font-size:\s*(9|10|11)[^0-9]'
# 기대값: 0

# 4. status- prefix 0건 (memory feedback_tailwind_token_class_pattern)
grep -cE '(text|bg|border)-status-(safe|fire|warning|danger|caution)' cha-bio-safety/src/pages/WorkShiftPage.tsx
# 기대값: 0

# 5. w-8 / h-8 0건 (w-8=48 함정, memory feedback_tailwind_w8_h8_is_48px)
grep -cE '\bw-8\b|\bh-8\b' cha-bio-safety/src/pages/WorkShiftPage.tsx
# 기대값: 0

# 6. 옛 alias 토큰 0건 (var(--bg)/var(--bg2)/var(--bg3)/var(--bd)/var(--bd2)/var(--t1)/var(--t2)/var(--t3)/var(--acl)/var(--accent))
grep -cE 'var\(--(bg|bg2|bg3|bd|bd2|t1|t2|t3|acl|accent)\)' cha-bio-safety/src/pages/WorkShiftPage.tsx
# 기대값: 0
# 단, rgba(59,130,246,0.15) 같은 직접 rgba 는 OQ #5 LOCKED 예외 (today bg 인라인 유지)

# 7. 비즈 로직 diff 0 (handler/state/effect/hook 보존)
git diff HEAD~N cha-bio-safety/src/pages/WorkShiftPage.tsx | grep -E '^[+-]\s*(useState|useEffect|useRef|useNavigate|useQuery|useIsDesktop|useStaffList|setYear|setMonth|setDlLoading|handleExcel|getMonthlySchedule|isToday|isRed|STAFF_ORDER|SHIFT_LABEL|HDR_H|ROW_H)'
# 기대값: logic line 의 - 추가 / + 제거 또는 변경이 없어야 함
```

---

## §6. positive gate (변환 후 등장해야 할 패턴)

```bash
# 1. lucide-react import — ChevronLeft 1개 추가 (OQ #2 LOCKED)
grep -c "from 'lucide-react'" cha-bio-safety/src/pages/WorkShiftPage.tsx     # >= 1
grep -c 'ChevronLeft' cha-bio-safety/src/pages/WorkShiftPage.tsx              # >= 2 (import + 사용)

# 2. v0.1.1 토큰 class 카운트 (>=3 핵심)
grep -c 'bg-surface-raised'    cha-bio-safety/src/pages/WorkShiftPage.tsx     # >= 3 (헤더 + 년월 + staff name 셀)
grep -c 'bg-surface-sunken'    cha-bio-safety/src/pages/WorkShiftPage.tsx     # >= 3 (back button + select + 이름 헤더 + day cell)
grep -c 'border-border-default' cha-bio-safety/src/pages/WorkShiftPage.tsx    # >= 3
grep -c 'border-border-strong' cha-bio-safety/src/pages/WorkShiftPage.tsx     # >= 1 (select)
grep -c 'text-text-primary'    cha-bio-safety/src/pages/WorkShiftPage.tsx     # >= 2 (타이틀 + staff name + select value)
grep -c 'text-text-secondary'  cha-bio-safety/src/pages/WorkShiftPage.tsx     # >= 2 (이름 헤더 + day cell normal + ChevronLeft)
grep -c 'text-text-tertiary'   cha-bio-safety/src/pages/WorkShiftPage.tsx     # >= 1 (staff title)
grep -c 'bg-safe-bar'          cha-bio-safety/src/pages/WorkShiftPage.tsx     # >= 1 (엑셀 버튼)
grep -c 'border-accent'        cha-bio-safety/src/pages/WorkShiftPage.tsx     # >= 1 (today border, OQ #5)
grep -cE 'text-\[#ef4444\]'    cha-bio-safety/src/pages/WorkShiftPage.tsx     # >= 1 (공휴일·주말, OQ #5 fallback)

# 3. 폰트 토큰 (OQ #3 LOCKED 격상)
grep -c 'text-caption'  cha-bio-safety/src/pages/WorkShiftPage.tsx            # >= 5 (엑셀 + 이름 헤더 + staff title + DOW_KO + 범례 라벨)
grep -c 'text-label'    cha-bio-safety/src/pages/WorkShiftPage.tsx            # >= 3 (select + d + 범례 box)
grep -c 'text-body-sm'  cha-bio-safety/src/pages/WorkShiftPage.tsx            # >= 1 (staff name)
grep -c 'text-body'     cha-bio-safety/src/pages/WorkShiftPage.tsx            # >= 2 (타이틀 + shift cell)

# 4. 인라인 px 사이즈 (OQ #2 + memory feedback_tailwind_w8_h8_is_48px)
grep -c 'w-\[34px\]'    cha-bio-safety/src/pages/WorkShiftPage.tsx            # >= 1 (모바일 back button)
grep -c 'h-\[34px\]'    cha-bio-safety/src/pages/WorkShiftPage.tsx            # >= 1
grep -cE '\bw-6\b'      cha-bio-safety/src/pages/WorkShiftPage.tsx            # >= 1 (범례 shift box 24px)
grep -c 'rounded-\[9px\]' cha-bio-safety/src/pages/WorkShiftPage.tsx          # >= 1 (select)
grep -c 'rounded-\[5px\]' cha-bio-safety/src/pages/WorkShiftPage.tsx          # >= 1 (범례 box)

# 5. SHIFT_COLOR 인라인 (OQ #4 LOCKED)
grep -c "SHIFT_COLOR\[sh\]\+'22'" cha-bio-safety/src/pages/WorkShiftPage.tsx  # >= 2 (shift cell + 범례 box)
grep -c 'SHIFT_COLOR\[sh\]'       cha-bio-safety/src/pages/WorkShiftPage.tsx  # >= 4 (color + background + borderColor)

# 6. 카피 verbatim (memory feedback_sketch_realistic_data)
grep -c '월간 출근부'    cha-bio-safety/src/pages/WorkShiftPage.tsx  # >= 1
grep -c '엑셀 저장'      cha-bio-safety/src/pages/WorkShiftPage.tsx  # >= 1
grep -c '생성중'         cha-bio-safety/src/pages/WorkShiftPage.tsx  # >= 1
grep -c '이름'           cha-bio-safety/src/pages/WorkShiftPage.tsx  # >= 1
grep -c 'STAFF_ORDER'    cha-bio-safety/src/pages/WorkShiftPage.tsx  # >= 1
grep -c '석현민'         cha-bio-safety/src/pages/WorkShiftPage.tsx  # >= 1
```

---

## §7. build / tsc gate

```bash
cd cha-bio-safety && npx tsc --noEmit                       # 0 error
cd cha-bio-safety && npm run build                          # exit 0
# WorkShiftPage chunk size 보고 (Vite output 의 dist/assets/WorkShiftPage-*.js)
ls -la cha-bio-safety/dist/assets/WorkShiftPage-*.js        # size 확인
```

---

## §8. 자체 verify 명령 (TSX 변환 wave 진입 시점 + 완료 시점 양쪽 실행)

```bash
# === 진입 시점: sketch 3 파일 모두 존재 확인 ===
ls cha-bio-safety/docs/redesign-context/16-workshift/sketch-wave-2-header-select.html
ls cha-bio-safety/docs/redesign-context/16-workshift/sketch-wave-3-shift-table.html
ls cha-bio-safety/docs/redesign-context/16-workshift/sketch-wave-4-legend.html

# === 진입 시점: tokens.css --status-danger hex 검증 (OQ #5 LOCKED 요구사항) ===
grep -E '\-\-status-danger:' cha-bio-safety/docs/redesign-context/16-workshift/tokens.css
# 결과: 다크 #f87171 / 라이트 #991b1b — 둘 다 #ef4444 와 불일치
# -> fallback 채택: 공휴일·주말 인라인 text-[#ef4444] 또는 인라인 color:#ef4444

# === 완료 시점: §5 negative + §6 positive + §7 build 모두 PASS ===
# (위 섹션의 grep/wc/npx/npm 명령 일괄 실행)

# === 완료 시점: shiftCalc.ts + generateExcel.ts 변경 0 확인 ===
# (TSX 변환 wave 끝나도 유지)
git diff HEAD -- cha-bio-safety/src/utils/shiftCalc.ts | wc -l       # 0
git diff HEAD -- cha-bio-safety/src/utils/generateExcel.ts | wc -l   # 0
```

---

## §9. Tailwind cheatsheet (v0.1.1 토큰 → utility class 매핑 표)

| v0.1.1 토큰 | Tailwind utility | 16-workshift 적용 위치 |
|---|---|---|
| `--surface-page` | `bg-surface-page` | 페이지 외곽 (사용 없음) |
| `--surface-raised` | `bg-surface-raised` | 헤더 + 년월 + staff name td |
| `--surface-sunken` | `bg-surface-sunken` | back button + select + 이름 헤더 + day cell normal |
| `--border-default` | `border-border-default` | 헤더 border-b + 이름 표 + day cell normal |
| `--border-strong` | `border-border-strong` | select border |
| `--text-primary` | `text-text-primary` | 타이틀 + staff name + select value |
| `--text-secondary` | `text-text-secondary` | 이름 헤더 + day cell normal + ChevronLeft |
| `--text-tertiary` | `text-text-tertiary` | staff title |
| `--text-on-accent` | `text-text-on-accent` | 엑셀 버튼 글자 (CTA solid 위 흰) |
| `--safe-bar` | `bg-safe-bar` | 엑셀 저장 버튼 (OQ #1) |
| `--accent` | `border-accent` | today border (OQ #5) |
| (n/a — tokens.css 불일치) | `text-[#ef4444]` 인라인 fallback | 공휴일·주말 글자 (OQ #5 LOCKED fallback) |
| (radius 8) | `rounded-sm` | back button + 엑셀 버튼 |
| (radius 9, 토큰 없음) | `rounded-[9px]` | select |
| (radius 5, 토큰 없음) | `rounded-[5px]` | 범례 box |
| (W-24, 토큰 spacing) | `w-6 h-6` | 범례 shift box (24x24 안전) |
| (W-34, 토큰 없음) | `w-[34px] h-[34px]` | 모바일 back button (w-8=48 함정 회피) |

---

## §10. 비즈 보존 체크박스 (TSX 변환 wave 완료 후 직접 체크)

- [ ] `useNavigate()` line 14 그대로
- [ ] `useIsDesktop()` line 15 그대로
- [ ] `useState` 3종 (year/month/dlLoading) line 17~19 그대로
- [ ] `useRef` 2종 (scrollRef/todayRef) line 20~21 그대로
- [ ] `useQuery(['holidays-dates'])` + try/catch → [] line 23~40 그대로 (memory `feedback_korean_holidays_library_gap`)
- [ ] `useStaffList()` + STAFF_ORDER 정렬 line 42~48 그대로
- [ ] `getMonthlySchedule(year, month, staffForCalc)` line 49 그대로
- [ ] `isToday(d)` / `isRed(d)` helpers line 51~60 그대로
- [ ] useEffect 자동 가운데 스크롤 line 63~68 그대로
- [ ] `handleExcel` dynamic import + generateShiftExcel line 70~82 그대로
- [ ] `!isDesktop && (back button)` 모바일 분기 line 96 그대로
- [ ] `navigate(-1)` line 97 그대로
- [ ] `setYear` / `setMonth` line 115, 118 그대로
- [ ] select 옵션 verbatim ([2025,2026,2027] + 12개월) line 116, 119 그대로
- [ ] `staffRows.map` 이름 열 + 날짜 열 + shift 셀 map line 144~205 그대로
- [ ] 범례 4 shift map (['당','비','주','휴']) line 214 그대로
- [ ] `shiftCalc.ts` SHIFT_COLOR / DOW_KO / RawShift / getMonthlySchedule export 0 byte 변경
- [ ] `generateExcel.ts` generateShiftExcel export 0 byte 변경

---

## §11. 메모리 룰 inline 인용 (W1 §5 mirror, 12+ 룰)

각 룰 작용 케이스 한 줄 — `feedback_*.md` 파일명 + How (16-workshift 컨텍스트).

1. `feedback_design_sketch_first.md` — spacing/sizing 변경 시에도 sketch 먼저 컨펌. T1~T3 에서 셀 크기 (HDR_H=52 / ROW_H=46 / minWidth:40) 조정 시 sketch 먼저.
2. `feedback_redesign_sketch_rule_enforcement.md` — SHIFT_COLOR 4 카테고리 색 (당 빨강 / 비 파랑 / 주 노랑 / 휴 회색) 은 status 임계치 색이 아니라 카테고리/duty 색. `bg-status_danger-bg` 같은 status 토큰 사용 금지 (underscore 표기로 grep 회피).
3. `feedback_sketch_realistic_data.md` — 카피 (월간 출근부 / 엑셀 저장 / 생성중 / SHIFT_LABEL 4종 / STAFF_ORDER 4명 / 이름 / 1월~12월 / 2025~2027년) verbatim. 표시 분기 / 라벨 변경 금지.
4. `feedback_planner_prompt_sketch_verbatim.md` — TSX 변환 진입 시 W2~W4 sketch 의 모든 Tailwind class / CSS 토큰 grep 으로 추출 → 본 §3 verbatim 인용. today border `'2px solid var(--acl) + rgba(59,130,246,0.15)'` + 공휴일 `#ef4444` + 셀 `SHIFT_COLOR[sh]+'22'` 추측 X — sketch verbatim.
5. `feedback_tailwind_token_class_pattern.md` — `text-danger` O / `text-status_danger` X (status- prefix 없음, underscore 표기로 grep 회피). Lucide `<ChevronLeft size={15} />` prop 사용 (className `w-N h-N` 금지).
6. `feedback_tailwind_w8_h8_is_48px.md` — `w-8 h-8` = 48x48 함정. 모바일 back button 34x34 → `w-[34px] h-[34px]` 인라인. 범례 shift box 24x24 → `w-6 h-6` (24 = w-6 안전).
7. `feedback_text_caption_leading_none.md` — `text-caption` lh:1.5 가 작은 컨테이너 안에서 시각 패딩 발생. 이름 헤더 (height:52) + day cell DOW_KO (padding:4px 2px) + 범례 box (24x24) + 라벨 모두 `leading-none` 명시.
8. `feedback_tsx_wave_emoji_dot_gap.md` — sketch 본문 이모지 0건 강제. WorkShiftPage 본문에도 이모지 0건 (현재 잘 지켜짐). dot span 추가 패턴 무관.
9. `feedback_tsx_wave_stat_card_drift.md` — 16-workshift 에는 Stat Card 적용 대상 element 없음 (W1 §3.5 미적용 메타 명시). today 분기 매트릭스 / 공휴일·주말 색 분기 / SHIFT_COLOR 4 카테고리 색 variant 는 새 패턴이므로 verbatim 인용.
10. `feedback_avoid_premature_confirmation.md` — TSX 변환 후 "approved 거의 일치" 자체 판단 금지. 결과 보여주고 사용자 판단.
11. **`feedback_korean_holidays_library_gap.md`** (WorkShiftPage 특화) — useQuery `['holidays-dates']` 의 fetch hyunbin.page + try/catch → [] fallback 패턴 보존. `@hyunbinseo/holidays-kr` 등 다른 라이브러리로 교체 금지.
12. **`feedback_dashboard_horizontal_scroll.md`** (WorkShiftPage 특화) — 날짜 열 (line 157) `flex:1, overflowX:auto` 가로 스크롤 의도된 디자인. flex-wrap 줄바꿈 금지. 단, 범례 영역 (line 213) 은 의도적 flex-wrap (4 박스 좁은 폭에서 줄바꿈 OK) — 다른 패턴 혼동 금지.

---

## §12. 다음 단계

1. 본 wave (W5 checklist) 작성 완료 → 4 atomic commit + push (T1~T4).
2. 사용자 시각 검수 — cbc7119-preview 배포 사이클 1회 (main 머지 후 자동) — sketch 3 HTML 직접 열어 4 frame 시각 확인.
3. 사용자 컨펌 받으면 **다음 quick task 시작** (`/clear` 권장 — memory `feedback_gsd_workflow_strict`) — TSX 변환 wave 진입.
   - 새 quick id (예: 260522-XX) 생성
   - PLAN: 1 task (W6 — TSX 변환), action = 본 §3 매핑 표 verbatim + §5/§6/§7/§8 verify gate 그대로 적용
   - 산출: `WorkShiftPage.tsx` 1 파일 in-place 수정 + atomic commit 1개 (`feat(16-workshift): W6 TSX 변환 ...`)
   - `shiftCalc.ts` + `generateExcel.ts` 2 파일 변경 0 byte 유지 (§10 체크박스)
4. TSX 변환 wave 완료 → 사용자 시각 검수 → main 머지 → cbc7119-preview 배포 → 직원도메인 별도 배포 (메모리 `feedback_deploy_test` 룰 — design 작업은 사용자 명시 컨펌 후만).
5. 16-workshift 완결 status 메모 (memory `project_redesign_*_status` 패턴, project_redesign_16_workshift_status 신규).

---

## § 자체 verify (본 W5 checklist 가 통과해야 할 gate)

- `WorkShiftPage.tsx` + `shiftCalc.ts` + `generateExcel.ts` 3 파일 변경 0 (`git diff HEAD~4 HEAD -- {3 paths}` empty)
- §1~§12 12 섹션 헤더 ≥1 each
- verify 명령 fence ≥4 (§5/§6/§7/§8)
- sketch 출처 frontmatter `sketch_sources` 3개 (W2/W3/W4) 모두 존재 확인 (test -f)
- OQ #1~#5 인용 ≥5건
- 메모리 룰 ≥12 인용
