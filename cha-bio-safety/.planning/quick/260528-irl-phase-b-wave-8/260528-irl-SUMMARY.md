---
phase: 260528-irl-phase-b-wave-8-extinguisher
plan: 01
subsystem: redesign/phase-b-sweep
status: complete
tags: [extinguisher, inline-style-to-tailwind, no-op-refactor, phase-b-tier-1-wave-8, shared-style-obj-option-n, spread-option-n, vendor-prefix-as-any-option-n, public-page-tbl-th-cl-classname-string-const, atomic-single-commit]
requires:
  - 260528-iht-phase-b-wave-7 완료 (직원 서비스 atomic, 316e1eb)
  - 260528-hbv-phase-b-wave-6 완료 (일정/교육 atomic)
  - 260528-h3z-phase-b-wave-5 완료 (db728c0)
  - 260528-gsh-phase-b-wave-4 완료 (05fddf1)
  - 260528-cjn-phase-b-wave-3 완료 (a78963f + 4e99270)
  - 260528-c9s-phase-b-wave-2 완료 (d36a20f)
  - 260528-a3v-phase-b-wave-1 완료 (18fd138)
  - 260527-wdc-legalpage-phase-b 옵션 X+P+M+색변수N 확정 (184e548)
  - 260528-0hr-phase-b-master-roadmap v2 (ROADMAP only)
provides:
  - ExtinguisherPublicPage.tsx Phase B 완료 (44 → 0 잔존, single atomic, tbl/th/cl 정의 → className 문자열 상수 변환 패턴 첫 사례)
  - ExtinguishersListPage.tsx Phase B 완료 (78 → 15 잔존 = 7 shared style 객체 spread 11건 + gridCols 동적 2건 + badgeBg/badgeColor 동적 1건 + modalWrapper spread 1건)
  - Phase B Tier 1 Wave 8 (소화기 묶음 — redesign/09 완결) 완료
  - **tbl/th/cl style obj → className string const 변환 패턴 박제** — 비-locked-list shared style 은 className 문자열 상수로 변환 가능 (spread 처리 회피)
affects:
  - src/pages/ExtinguisherPublicPage.tsx
  - src/pages/ExtinguishersListPage.tsx
tech-stack:
  added: []
  patterns:
    - "옵션 X (정확값 arbitrary) — `text-[#333]`/`text-[#FFD700]`/`text-[#fff]`/`text-[#999]`/`text-[#000]`/`bg-[#c00]`/`bg-[#FFD700]`/`bg-[#f0ede5]`/`border-[#333]`/`border-[#999]`/`border-[#bbb]`/`text-[12px]`/`text-[10px]`/`text-[11px]`/`text-[13px]`/`text-[14px]`/`text-[16px]`/`text-[18px]`/`leading-[1.4]`/`leading-[1.6]`/`leading-[1.8]`/`tracking-[0.15em]`/`h-[32px]`/`h-[35px]`/`h-[36px]`/`h-[42px]`/`h-[245px]`/`w-[6%]`/`w-[10%]`/`w-[13%]`/`w-[14%]`/`min-w-[80px]`/`min-w-[120px]`/`pl-[30px]`/`pb-[calc(var(--sab)+70px)]`/`mb-[14px]`/`gap-y-[3px]`/`px-[10px]`/`border-[1.5px]`/`[transition:border-color_.15s]`/`[font-family:'JetBrains_Mono',monospace]`/`[font-family:inherit]` 정확값 보존"
    - "옵션 P — `leading-none` 명시 보존 (chip lineHeight: 1)"
    - "옵션 M (className conditional) — 11건: List tab active L370 / 3 replace filter chip border weight L455/L470/L485 / Card outer dynamic L605 (isDisposed/expanded 2-차원) / Card warning chip color L668 (danger vs warning) / RegisterModal grid button L800 (type === t) / EditModal header marginBottom L905 (changedCount > 3) / EditModal grid button L920 (isActive + isChanged 3-way) / ConfirmModal primary button L996 (primaryStyle === 'acl' vs 'danger' + loading) / Main content padding L508 (isDesktop)"
    - "옵션 N (잔존 15건) — gridCols 동적 2건 (List L443/L476 `gridTemplateColumns: gridCols` 런타임 string) + badgeBg/badgeColor 동적 1건 (L614 mapping state 3분기 dynamic 변수) + shared style spread 11건 (3 dangerBtnStyle spread L668/L676/L683 + 6 inputStyle dynamic borderColor L922/L926/L930/L934/L938/L942 + 1 inputStyle textTransform spread L812 + 1 infoBannerStyle marginBottom spread L786 + 1 modalWrapperStyle maxWidth spread L979)"
    - "**tbl/th/cl style object → className string const 변환** (Public 첫 사례) — `const tbl: React.CSSProperties = {...}` (5 prop) → `const tbl = \"w-full border-collapse border-2 border-[#333] text-[12px] text-[#000] font-bold\"` className 문자열 상수. 사용처 `style={tbl}` → `className={tbl}`, `style={{ ...th, textAlign:'center' }}` → `className={\\`${th} text-center\\`}` template literal. 비-locked-list shared style 은 이 패턴으로 변환 가능 (locked `page` 만 vendor prefix as any 유지)"
    - "border-r-transparent/border-l-transparent 단일 면 override 패턴 — `<td className={\\`${cl} text-center border-r-transparent\\`}>` (cl 의 `border border-[#bbb]` 위에 우측만 transparent). tailwind shorthand cascade 정상 작동"
    - "**font-mono 대신 [font-family:'JetBrains_Mono',monospace] arbitrary** — tailwind config `font-mono` 는 `'D2 Coding'` 추가 fallback. 시각 0 byte 보장 위해 arbitrary 직접 지정. underscore = 공백 함정 회피"
    - "h-11 = 44px (tailwind default 보존 — config override 무) — tab button `height: 44` 변환 시 안전. spacing.7=32 (override) / 8=48 (override) / 11 (default) 구분"
    - "**w-1.5 h-1.5 = 6px** (tailwind default `1.5 = 0.375rem`) — chip dot 변환. config override 무 → 안전"
    - "**rounded-pill = 99px** (tailwind config) — chip dot borderRadius:99 변환"
    - "**px-2.5/mb-2.5 = 10px** (tailwind default `2.5 = 0.625rem`) — search icon left:10 / ConfirmModal title marginBottom:10 변환"
    - "**FieldLabel/DetailField 헬퍼 함수 inline → className 일괄 변환** — 두 헬퍼 모두 정적 스타일. 옵션 X 단순 변환 가능. 호출 사이트 영향 0"
    - "ModalBackdrop 정적 wrapper inline → className 변환 — position:fixed/inset:0/z-index:40/display:flex/items-center/justify-center/bg-surface-overlay. 자식 모달 spread 보존"
key-files:
  created:
    - .planning/quick/260528-irl-phase-b-wave-8/260528-irl-SUMMARY.md
  modified:
    - src/pages/ExtinguisherPublicPage.tsx
    - src/pages/ExtinguishersListPage.tsx
decisions:
  - "wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht 승계 옵션 X+P+M+색변수N — 사용자 재컨펌 불필요 (0hr roadmap locked)"
  - "Public `tbl`/`th`/`cl` 정의는 locked 8 shared style list 외 → className 문자열 상수로 변환. `page` 만 locked (vendor prefix + as any) 잔존. 본 wave 가 비-locked shared style obj → className const 변환 첫 사례. 향후 동일 패턴 적용 가능"
  - "Public `<col style={{ width:'N%' }} />` 10건 → `<col className=\"w-[N%]\" />` arbitrary 변환. table column width 는 tailwind arbitrary 정상 작동"
  - "Public 제목 row / 하단 row 정적 multiline → className 통합 (bg-[#c00] + text-[#FFD700/#fff] + 정적 font/padding/border). border:'2px solid #333' → border-2 border-[#333] tailwind shorthand 변환 — `<td>` cellSpacing/cellPadding={0} 보존"
  - "Public 헤더 행 tr `background: '#f0ede5'` 단일 prop → `<tr className=\"bg-[#f0ede5]\">` 변환. 자식 td 들은 `${th} text-center border-r-transparent` 등 spread 회피"
  - "Public rightCell 8건 (i===0/7/8/9/10) → `${cl/th} ...` template literal 변환. img inline → className 변환 (`absolute top-0 left-0 w-full h-full object-fill block`). height:ROW_H*7 → `h-[245px]` arbitrary (ROW_H=35 const 곱셈 결과 정적)"
  - "List 외부 wrapper L316/L360/L362 정적 inline → className 변환 (flex/flex-col/min-h-full/bg-surface-page/text-text-primary/bg-surface-raised/border-b/border-border-default/flex-shrink-0/flex)"
  - "List portal button L325 `height:32 + padding:'0 10px' + var(--accent-fg)` → `h-[32px] px-2.5 ... text-[var(--accent-fg)]` arbitrary. h-8 (config=48px) 함정 회피"
  - "List marker context banner + dismiss button (L337-355) 정적 inline → className 통합. bg-info-bg/border-info-bar/text-info tailwind 토큰 사용"
  - "List tab button (L370) `tab === t.key` 조건 4-prop 일괄 분기 → 옵션 M template literal conditional. h-11 (default 44px) ✓"
  - "List 3 select + 1 input (L389-447) 동일 패턴 4건 → 동일 className 통합 (4 prop 정적). search Lucide icon position 변환 (`absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none`)"
  - "List 3 replace filter chip (L455/L470/L485) 옵션 M conditional border weight (replaceFilter === key ? `border-[1.5px]` : `border`) — bg/text/dot 정적. 3건 동일 패턴"
  - "List Card outer wrapper (L605) **2-차원 conditional** → 옵션 M 2 template literal. isDisposed 분기 (background/opacity/cursor) + expanded&&!isDisposed 분기 (border 색/굵기). transition: 'border-color .15s' → `[transition:border-color_.15s]` arbitrary"
  - "List Card badge L620 (badgeBg/badgeColor 동적 변수) → 옵션 N spread 잔존. style={{ background: badgeBg, color: badgeColor }} 만 inline 으로 분리, 나머지 className 통합 (정적 padding/font/radius)"
  - "List Card warning chip L668 옵션 M warning === 'danger' 3-way (bg/text/border) — danger-bg/text/border-bar vs warning-bg/text/border-bar. memory `inspection_unresolved_color` 의 fire 패턴은 아님 (이건 교체 임박/초과의 별개 분기)"
  - "List 3 action button spread (L668/L676/L683 dangerBtnStyle spread) → 옵션 N 잔존. shared style obj spread 자체가 안티"
  - "List FieldLabel + DetailField + ModalBackdrop 정적 헬퍼 → className 일괄 변환"
  - "List ConfirmModal (L979-1001) → className 통합. modalWrapperStyle spread 1건 (maxWidth: 320) 잔존, 나머지 title/body/cancel button/confirm button 모두 변환. confirm button 옵션 M (primaryStyle + loading 2-차원)"
  - "List EditModal 헤더 옵션 M `changedCount > 3 ? mb-2 : mb-4`, microcopy 정적, grid button 3-way border (isChanged > isActive > inactive), action row 정적. inputStyle dynamic borderColor 7건 (registermodal 1 textTransform + edit modal 6 borderColor) 옵션 N 잔존"
  - "단일 atomic commit 패턴 자동 도달 — 28-splash/27-login/23-education/c9s/cjn/gsh/h3z/hbv/iht 승계 (6번째 자동 도달)"
metrics:
  duration: "약 30분 (Task 1 atomic — single commit, 122 inline)"
  completed-date: 2026-05-28
  tasks-completed: "1/1"
  files-modified: 2
  lines-changed: "115 ins / 253 del (net -138 lines, atomic single commit)"
roadmap-wave: "Tier 1 / Wave 8 (소화기 묶음 — redesign/09 완결)"
---

# Phase 260528-irl Plan 01: Phase B Wave 8 Extinguisher Summary

ExtinguisherPublicPage.tsx (151줄, 44 inline) + ExtinguishersListPage.tsx (1194줄, 78 inline) 두 파일 합계 122 inline style 을 wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht 승계 옵션 X+P+M+색변수N 으로 tailwind className 으로 일괄 변환. **redesign/09 (소화기) 완결 페이지** — 위험 anchor (좌표 캘리브) 무. **Public 단일 atomic 0 잔존** — `tbl`/`th`/`cl` 정의를 className 문자열 상수로 변환하는 **신규 패턴 첫 사례** 도입으로 모든 spread 해소. `const page` (vendor prefix + as any) 만 locked 잔존. **List 78→15 잔존** = 7 shared style 객체 (modalWrapper/infoBanner/input/cancelBtn/primaryBtn/actionBtn/dangerBtn) spread 11건 + gridCols 동적 2건 + badgeBg/badgeColor 동적 1건 + modalWrapper spread 1건. **옵션 M 11건 활용** — List tab active / 3 replace filter chip border weight / Card outer 2-차원 (isDisposed + expanded) / Card warning chip 색 (danger vs warning) / RegisterModal grid button / EditModal header marginBottom / EditModal grid button 3-way / ConfirmModal primary button (primaryStyle + loading) / Main content paddingBottom (isDesktop). **font-mono 대신 `[font-family:'JetBrains_Mono',monospace]` arbitrary 직접 지정** — tailwind config font-mono fallback (`D2 Coding` 추가)과의 시각 0 byte 보장. **transition:border-color .15s → `[transition:border-color_.15s]` arbitrary** — underscore 공백 함정 회피. 시각 결과 0 byte 변경 (no-op refactor). Phase A 결과 (Lucide / 색 토큰 -bar / emoji 0 / 비표준 색 0) 및 비즈니스 로직 (extinguisherApi/floorPlanMarkerApi + useQuery/useMutation 6건 + handleRegister/handleAssignClick/dismissMarkerContext + getMappingState/getReplaceWarning/zoneLabelKo/floorOrder + EXTINGUISHER_TYPES + cp_id/zone/floor mapping + 28 onClick + 19 useState) 모두 보존. **Phase B Tier 1 Wave 8 성공** — 예상 (Public 44→~5 / List 78→~25-30) 보다 Public 초과 달성 (0 잔존, -5건 초과) + List 예상 범위 내 (15 잔존).

## User Decisions (승계 — wdc / 01h / a3v / c9s / cjn / gsh / h3z / hbv / iht / 0hr-roadmap 재확인 불필요)

| ID  | 선택                                                          | 출처                              |
| --- | ------------------------------------------------------------- | --------------------------------- |
| (b) | **옵션 X** — 정확값 arbitrary `[Npx]` (시각 0 byte)            | wdc Phase B Task 2 결정            |
| (c) | **옵션 P** — `leading-none` 명시 보존                          | wdc Phase B Task 2 결정            |
| (d) | **옵션 M + 색 변수만 N** — template literal conditional 우선   | wdc Phase B Task 2 결정            |
| -   | **a3v/c9s/cjn/gsh/h3z/hbv/iht 승계 적용** — 본 wave 재확인 없이 | 260528-0hr roadmap v2 locked-decisions |

## Before / After 카운트

| Metric (`style={{` count)        | Before | After   | Diff             |
| -------------------------------- | ------ | ------- | ---------------- |
| ExtinguisherPublicPage.tsx       | **44** | **0**   | **-44 (-100%)**  |
| ExtinguishersListPage.tsx        | **78** | **15**  | **-63 (-81%)**   |
| **합계**                          | **122** | **15** | **-107 (-88%)**  |

총 변경: 2 files, 115 ins / 253 del, net -138 lines. PLAN 예상 (Public 44→~5, List 78→~25-30, 합 ~88건 -72%) 초과 달성 (107건 -88%). Public 단일 atomic 0 잔존 달성으로 -44건 초과 기여.

## 변환 매핑 (Public — 44건 모두 변환)

### loading/error 메시지 (2건)

| Line (orig) | Before                                                                                | After                                          | 패턴   |
| ----------- | ------------------------------------------------------------------------------------- | ---------------------------------------------- | ------ |
| L41/L42     | `style={{ textAlign:'center', padding:40, color:'#333', fontSize:14 }}` × 2          | className `text-center p-10 text-[#333] text-[14px]` 통합 (2건) | 옵션 X |

### `<col style={{ width:'N%' }} />` 10건 → `<col className="w-[N%]" />` arbitrary

| Line (orig) | width                                                          | After                |
| ----------- | -------------------------------------------------------------- | -------------------- |
| L52         | 6%                                                             | `w-[6%]`             |
| L53         | 3%                                                             | `w-[3%]`             |
| L54         | 6%                                                             | `w-[6%]`             |
| L55         | 10%                                                            | `w-[10%]`            |
| L56         | 10%                                                            | `w-[10%]`            |
| L57         | 10%                                                            | `w-[10%]`            |
| L58         | 13%                                                            | `w-[13%]`            |
| L59         | 14%                                                            | `w-[14%]`            |
| L60         | 14%                                                            | `w-[14%]`            |
| L61         | 14%                                                            | `w-[14%]`            |

### 제목 row / 하단 row / 헤더 행 정적 multiline (3건)

| Line (orig) | Before (요약)                                                                                                       | After                                                                                                                                  | 패턴   |
| ----------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| L65 제목     | `bg:#c00, color:#FFD700, textAlign:center, fontSize:18, fontWeight:900, padding:'10px 0', letterSpacing:'0.15em', border:'2px solid #333'` | className `bg-[#c00] text-[#FFD700] text-center text-[18px] font-black py-[10px] px-0 tracking-[0.15em] border-2 border-[#333]` 통합   | 옵션 X |
| L89 헤더 tr | `background: '#f0ede5'`                                                                                              | className `bg-[#f0ede5]`                                                                                                               | 옵션 X |
| L137 하단    | `bg:#c00, color:#fff, textAlign:center, fontSize:11, fontWeight:700, padding:'8px 6px', lineHeight:1.8, border:'2px solid #333'`            | className `bg-[#c00] text-[#fff] text-center text-[11px] font-bold py-2 px-1.5 leading-[1.8] border-2 border-[#333]` 통합              | 옵션 X |
| L139 sub    | `fontSize:10`                                                                                                        | className `text-[10px]`                                                                                                                | 옵션 X |
| L109 img    | `position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'fill', display:'block'`                | className `absolute top-0 left-0 w-full h-full object-fill block`                                                                      | 옵션 X |

### **`tbl`/`th`/`cl` 정의 → className 문자열 상수 변환 (신규 패턴)**

```ts
// Before:
const tbl: React.CSSProperties = { width:'100%', borderCollapse:'collapse', border:'2px solid #333', fontSize:12, color:'#000', fontWeight:700 }
const th: React.CSSProperties = { background:'#f0ede5', border:'1px solid #999', padding:'5px 4px', fontWeight:700, fontSize:10, whiteSpace:'nowrap', color:'#000' }
const cl: React.CSSProperties = { border:'1px solid #bbb', padding:'5px 4px', fontSize:12, color:'#000', fontWeight:700 }

// After:
const tbl = "w-full border-collapse border-2 border-[#333] text-[12px] text-[#000] font-bold"
const th  = "bg-[#f0ede5] border border-[#999] py-[5px] px-1 font-bold text-[10px] whitespace-nowrap text-[#000]"
const cl  = "border border-[#bbb] py-[5px] px-1 text-[12px] text-[#000] font-bold"
```

사용처 24건 (Row5 6건 + Row6 4건 + 헤더행 6건 + rightCell 5건 + months row 5건 = 26건? 다시 카운트):
- `<table style={tbl}>` → `<table className={tbl}>` 1건
- `style={{ ...th, textAlign:'center' }}` → `className={\`${th} text-center\`}` template literal 패턴 다수 (Row5 4건 + Row6 2건 + 헤더행 6건 + rightCell 4건 = 16건)
- `style={{ ...cl, ... }}` → `className={\`${cl} ...\`}` 패턴 다수 (Row5 2건 + Row6 2건 + rightCell 4건 + months row 6건 = 14건)
- 합계 31건 변환

### border-r-transparent/border-l-transparent 단일 면 override 패턴

`cl` 의 `border border-[#bbb]` 위에 우측만 transparent override:
- `style={{ ...cl, borderRight:'1px solid transparent' }}` → `className={\`${cl} border-r-transparent\`}` (months row 6건 + Row5 2건 = 8건)
- `style={{ ...cl, borderLeft:'1px solid transparent' }}` → `className={\`${cl} border-l-transparent\`}`
- 헤더 행 `style={{ ...th, ..., borderLeft + borderRight transparent }}` → `${th} text-center border-l-transparent border-r-transparent`

tailwind shorthand cascade 정상 작동.

### rightCell 8건 변환 패턴

| i 값 | rightCell                                                                                                                                  | After                                                                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | `style={{ ...cl, padding:0, borderLeft:'2px solid #333', height: ROW_H*7=245, position:'relative' as any, overflow:'hidden' }}`            | `className={\`${cl} p-0 border-l-2 border-l-[#333] h-[245px] relative overflow-hidden\`}`                                                          |
| 7/9  | `style={{ ...th, textAlign:'center', borderLeft:'2px solid #333', fontSize:10, height:ROW_H=35 }}`                                          | `className={\`${th} text-center border-l-2 border-l-[#333] text-[10px] h-[35px]\`}`                                                                 |
| 8    | `style={{ ...cl, textAlign:'center', borderLeft:'2px solid #333', height:ROW_H=35 }}`                                                       | `className={\`${cl} text-center border-l-2 border-l-[#333] h-[35px]\`}`                                                                             |
| 10   | `style={{ ...cl, textAlign:'center', borderLeft:'2px solid #333', fontSize:10, verticalAlign:'middle', lineHeight:1.4 }}`                   | `className={\`${cl} text-center border-l-2 border-l-[#333] text-[10px] align-middle leading-[1.4]\`}`                                               |

## 변환 매핑 (List — 63건 변환, 15건 옵션 N 잔존)

### 외부 wrapper + filter bar (8건)

| Line (orig) | Before (요약)                                                                                          | After                                                                                                                              | 패턴   |
| ----------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------ |
| L316        | `display:flex, flexDirection:column, minHeight:100%, bg/color var`                                     | className `flex flex-col min-h-full bg-surface-page text-text-primary`                                                            | 옵션 X |
| L325 portal | `height:32, padding:'0 10px', radius:sm, bg:accent, border:none, color:accent-fg, fontSize:12, font:700, cursor:pointer` | className `h-[32px] px-2.5 rounded-sm bg-accent border-none text-[var(--accent-fg)] text-[12px] font-bold cursor-pointer`         | 옵션 X |
| L337 banner | multi 7-prop (flex/items/justify/padding/bg/border/font/color/shrink/gap)                              | className `flex items-center justify-between py-2 px-3 bg-info-bg border-b border-info-bar text-[12px] text-info flex-shrink-0 gap-2` | 옵션 X |
| L347 cancel | banner 내부 dismiss button                                                                              | className `bg-transparent border border-info-bar text-info text-[12px] py-0.5 px-2 rounded-sm cursor-pointer flex-shrink-0`       | 옵션 X |
| L360/L362   | filter bar wrapper / row 1 tabs row                                                                    | className `bg-surface-raised border-b border-border-default flex-shrink-0` / `flex`                                                | 옵션 X |

### 4 tab + 3 select + 1 search (8건)

| Line (orig) | Before (요약)                                                                                          | After                                                                                                                              | 패턴   |
| ----------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------ |
| L370 tab    | `tab === t.key ?` 4-prop conditional (bg/color/borderBottom)                                            | 옵션 M `${tab === t.key ? 'bg-surface-active text-text-primary border-b-2 border-accent' : 'bg-transparent text-text-tertiary border-b-2 border-transparent'}` | 옵션 M |
| L386 row 2  | `flex, flexWrap, gap:6, padding:'8px 12px'`                                                            | className `flex flex-wrap gap-1.5 py-2 px-3`                                                                                       | 옵션 X |
| L389/L402/L415 selects | 동일 7-prop 정적 (flex/min-w-80/h-32/p-0-2/bg-sunken/border-strong/radius-sm/text-sec/12px) | className `flex-1 min-w-[80px] h-[32px] px-2 bg-surface-sunken border border-border-strong rounded-sm text-text-secondary text-[12px]` × 3건 | 옵션 X |
| L428 search wrap | `relative, flex:2, min-w-120, flex, items-center`                                                  | className `relative flex-[2] min-w-[120px] flex items-center`                                                                       | 옵션 X |
| L431 Search icon | `position:absolute, left:10, top:50%, transform:translateY(-50%), color:tertiary, pointerEvents:none` | className `absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none`                                       | 옵션 X |
| L441 input  | 7-prop 정적                                                                                              | className `w-full h-[32px] pl-[30px] pr-2.5 bg-surface-sunken border border-border-strong rounded-sm text-text-primary text-[12px] outline-none` | 옵션 X |

### 3 replace filter chip (옵션 M)

| Line (orig) | Before (요약)                                                                                          | After                                                                                                                              | 패턴   |
| ----------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------ |
| L453 wrap   | `flex, flexWrap, gap:6, padding:'0 12px 8px'`                                                          | className `flex flex-wrap gap-1.5 px-3 pb-2 pt-0`                                                                                  | 옵션 X |
| L455 warn   | `replaceFilter === 'warn' ?` border weight 분기 + bg-warning-bg/text-warning 정적                       | 옵션 M `${... ? 'border-[1.5px] border-warning-bar' : 'border border-warning-bar'}` + 정적 prefix                                   | 옵션 M |
| L470 imm    | 동일 패턴 — fire 토큰                                                                                    | 옵션 M `bg-fire-bg text-fire ...border-fire-bar`                                                                                    | 옵션 M |
| L485 danger | 동일 패턴 — danger 토큰                                                                                  | 옵션 M `bg-danger-bg text-danger ...border-danger-bar`                                                                              | 옵션 M |
| 3 dot       | inline `width:6, height:6, borderRadius:99, background:'currentColor', flexShrink:0`                   | className `inline-block w-1.5 h-1.5 rounded-pill bg-current flex-shrink-0` × 다수                                                  | 옵션 X |

### Card 영역 (옵션 M 2-차원 + 정적 + 동적 잔존)

| Line (orig) | Before (요약)                                                                                          | After                                                                                                                              | 패턴   |
| ----------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------ |
| L605 outer  | **2-차원 conditional** (isDisposed bg/opacity/cursor + expanded&&!isDisposed border)                    | 옵션 M 2 template literal `rounded-md p-3 flex flex-col gap-1.5 [transition:border-color_.15s] ${disposed ? ... : ...} ${expand ? ... : ...}` | 옵션 M |
| L616 row 1  | `flex, items-center, justify-between, gap:8`                                                            | className `flex items-center justify-between gap-2`                                                                                | 옵션 X |
| L617 종류    | `fontSize:14, fontWeight:700, color:text-primary, flex:1`                                              | className `text-[14px] font-bold text-text-primary flex-1`                                                                          | 옵션 X |
| L620 badge  | 정적 (flex/items/gap/leading-none/fontSize/font/padding/radius/shrink) + **동적 (badgeBg/badgeColor)** | className 정적 통합 + **`style={{ background: badgeBg, color: badgeColor }}` 잔존**                                                | 옵션 N (split) |
| L634 row 2  | `fontSize:12, font:500, color:text-secondary, fontFamily:'JetBrains Mono', monospace', white-space, overflow, text-overflow` | className `text-[12px] font-medium text-text-secondary [font-family:'JetBrains_Mono',monospace] whitespace-nowrap overflow-hidden text-ellipsis` | 옵션 X |
| L647 row 3  | `flex, items-center, justify-between, gap:8`                                                            | className `flex items-center justify-between gap-2`                                                                                | 옵션 X |
| L648 loc    | 8-prop 정적                                                                                              | className `text-[12px] font-medium text-text-tertiary flex-1 min-w-0 inline-flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis` | 옵션 X |
| L664 warn chip | **옵션 M warning === 'danger'** 3-prop conditional (bg/text/border)                                  | 옵션 M `${warning === 'danger' ? 'bg-danger-bg text-danger border border-danger-bar' : 'bg-warning-bg text-warning border border-warning-bar'}` + 정적 prefix | 옵션 M |
| L682 expand grid | `grid, gridTemplateColumns:'1fr 1fr', gap:'3px 12px', fontSize:12, marginTop:4, paddingTop:8, borderTop`     | className `grid grid-cols-2 gap-x-3 gap-y-[3px] text-[12px] mt-1 pt-2 border-t border-border-default`                              | 옵션 X |
| L695 action | `flex, gap:8, marginTop:4`                                                                              | className `flex gap-2 mt-1`                                                                                                        | 옵션 X |
| L725 disposed | `fontSize:12, color:text-tertiary, text-center, padding:'4px 0'`                                      | className `text-[12px] text-text-tertiary text-center py-1 px-0`                                                                   | 옵션 X |

### 3 action button spread (옵션 N 잔존)

| Line (orig) | Before                                                                                                  | 사유                                                                                                       | 패턴   |
| ----------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------ |
| L668 삭제    | `style={{ ...actionBtnStyle, ...dangerBtnStyle }}`                                                       | 2 shared style spread — 옵션 N 잔존                                                                         | 옵션 N |
| L676 폐기    | 동일                                                                                                     | 동일                                                                                                       | 옵션 N |
| L683 분리    | 동일                                                                                                     | 동일                                                                                                       | 옵션 N |

### DetailField / FieldLabel / ModalBackdrop 헬퍼 (3 함수)

| 함수            | Before                                                                                          | After                                                                                                                  | 패턴   |
| --------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------ |
| DetailField     | `flex, flexDirection, gap:1` + label `color, fontWeight` + value `color, fontWeight, fontFamily mono ? : 'inherit'` | className `flex flex-col gap-px` + `text-text-tertiary font-normal` + `text-text-primary font-bold ${mono ? "[font-family:'JetBrains_Mono',monospace]" : '[font-family:inherit]'}` | 옵션 X+M |
| FieldLabel      | `fontSize:12, fontWeight:500, color:text-tertiary, marginBottom:6`                              | className `text-[12px] font-medium text-text-tertiary mb-1.5`                                                          | 옵션 X |
| ModalBackdrop   | `position:fixed, inset:0, zIndex:40, display:flex, items, justify, bg:overlay`                  | className `fixed inset-0 z-40 flex items-center justify-center bg-surface-overlay`                                     | 옵션 X |

### RegisterModal (옵션 M 1건 + 옵션 X 4건 + 옵션 N 2건)

| Line (orig) | Before                                                                                          | After                                                                                                                  | 패턴   |
| ----------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------ |
| L775 title  | `fontSize:16, fontWeight:700, color:text-primary, marginBottom:16`                              | className `text-[16px] font-bold text-text-primary mb-4`                                                               | 옵션 X |
| L786 banner | `style={{ ...infoBannerStyle, marginBottom: 14 }}`                                              | **옵션 N spread 잔존**                                                                                                  | 옵션 N |
| L793 grid   | `grid, gridTemplateColumns:'1fr 1fr 1fr', gap:6, marginBottom:14`                              | className `grid grid-cols-3 gap-1.5 mb-[14px]`                                                                         | 옵션 X |
| L800 button | `type === t ?` 3-prop conditional (bg/color/border)                                             | 옵션 M `${type === t ? 'bg-accent text-[var(--accent-fg)] border-none' : 'bg-surface-sunken text-text-secondary border border-border-default'}` + 정적 prefix | 옵션 M |
| L812 prefix | `style={{ ...inputStyle, textTransform: 'uppercase' }}`                                         | **옵션 N spread 잔존**                                                                                                  | 옵션 N |
| L823 action | `flex, gap:8, marginTop:16`                                                                     | className `flex gap-2 mt-4`                                                                                            | 옵션 X |

### EditModal (옵션 M 2건 + 옵션 X 3건 + 옵션 N 6건)

| Line (orig) | Before                                                                                          | After                                                                                                                  | 패턴   |
| ----------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------ |
| L897 header | `marginBottom: changedCount > 3 ? 8 : 16` + 정적 flex/items/justify                              | 옵션 M `flex items-center justify-between ${changedCount > 3 ? 'mb-2' : 'mb-4'}`                                       | 옵션 M |
| L898 title  | `fontSize:16, fontWeight:700, color:text-primary`                                               | className `text-[16px] font-bold text-text-primary`                                                                     | 옵션 X |
| L904 micro  | `fontSize:12, color:status-danger, marginBottom:12`                                             | className `text-[12px] text-danger mb-3`                                                                                | 옵션 X |
| L911 grid   | 동일 (RegisterModal grid)                                                                        | className `grid grid-cols-3 gap-1.5 mb-[14px]`                                                                         | 옵션 X |
| L916 button | **isActive + isChanged 3-way border** + bg/color isActive                                       | 옵션 M `${isActive ? 'bg-accent text-[var(--accent-fg)]' : 'bg-surface-sunken text-text-secondary'} ${isChanged ? 'border-[1.5px] border-accent' : (isActive ? 'border-none' : 'border border-border-default')}` | 옵션 M |
| L927-947 inputs (6건) | `style={{ ...inputStyle, borderColor: borderForField(...) }}` 동적                | **옵션 N spread 잔존** (6건)                                                                                            | 옵션 N |
| L951 action | 동일                                                                                              | className `flex gap-2 mt-4`                                                                                            | 옵션 X |

### ConfirmModal (옵션 M 1건 + 옵션 X 3건 + 옵션 N 1건)

| Line (orig) | Before                                                                                          | After                                                                                                                  | 패턴   |
| ----------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------ |
| L979 wrap   | `style={{ ...modalWrapperStyle, maxWidth: 320 }}`                                                | **옵션 N spread 잔존**                                                                                                  | 옵션 N |
| L980 title  | `fontSize:16, fontWeight:700, color:text-primary, marginBottom:10`                              | className `text-[16px] font-bold text-text-primary mb-2.5`                                                             | 옵션 X |
| L981 body   | `fontSize:13, color:text-secondary, lineHeight:1.6, marginBottom:16`                            | className `text-[13px] text-text-secondary leading-[1.6] mb-4`                                                          | 옵션 X |
| L987 cancel | `flex:1, height:42, radius:md, bg:sunken, border:default, color:secondary, fontSize:13, font:600, cursor` | className `flex-1 h-[42px] rounded-md bg-surface-sunken border border-border-default text-text-secondary text-[13px] font-semibold cursor-pointer` | 옵션 X |
| L996 confirm | **primaryStyle === 'acl' 2-prop + loading 2-prop = 4-차원**                                     | 옵션 M `${primaryStyle === 'acl' ? 'bg-accent' : 'bg-danger'} ${loading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer opacity-100'}` + 정적 prefix | 옵션 M |

## 옵션 N 잔존 매핑 (15건)

### gridCols 동적 (2건)

| Line (post-edit) | 변수                                                                | 사유                                                                                              | 패턴   |
| ---------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------ |
| L443 loading     | `gridTemplateColumns: gridCols`                                     | gridCols = isDesktop ? '1fr 1fr 1fr' : (window.innerWidth >= 768) ? '1fr 1fr' : '1fr' 런타임 string. `[grid-template-columns:${gridCols}]` 안티 | 옵션 N |
| L476 cards       | 동일                                                                | 동일                                                                                              | 옵션 N |

### badge 동적 색변수 (1건)

| Line (post-edit) | 변수                                                                | 사유                                                                                              | 패턴   |
| ---------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------ |
| L614 badge       | `style={{ background: badgeBg, color: badgeColor }}`                | 3 mapping state 분기 (disposed → warning, mapped → accent, unmapped → danger) — 동적 var lookup. `bg-[${badgeBg}]` 안티 | 옵션 N |

### Shared style spread (11건)

| Line (post-edit) | spread                                                                       | shared obj                  | 패턴   |
| ---------------- | ---------------------------------------------------------------------------- | --------------------------- | ------ |
| L668 / L676 / L683 | `{...actionBtnStyle, ...dangerBtnStyle}`                                  | actionBtnStyle + dangerBtnStyle | 옵션 N (×3) |
| L786 banner      | `{...infoBannerStyle, marginBottom: 14}`                                     | infoBannerStyle             | 옵션 N |
| L812 prefix      | `{...inputStyle, textTransform: 'uppercase'}`                                | inputStyle                  | 옵션 N |
| L922 / L926 / L930 / L934 / L938 / L942 (6건) | `{...inputStyle, borderColor: borderForField(...)}` (L938 만 + textTransform 추가) | inputStyle             | 옵션 N (×6) |
| L979 confirm wrap | `{...modalWrapperStyle, maxWidth: 320}`                                     | modalWrapperStyle           | 옵션 N |

## 비즈 anchor precise diff (PASS)

### ExtinguisherPublicPage

| Anchor                  | Before | After | Diff |
| ----------------------- | ------ | ----- | ---- |
| `onClick={...}`         | 0      | 0     | 0    |
| `useState(`             | 1      | 1     | 0    |
| `useRef(`               | 0      | 0     | 0    |
| `useEffect(`            | 1      | 1     | 0    |
| `useMutation(`          | 0      | 0     | 0    |
| `useQuery(`             | 0      | 0     | 0    |
| `useNavigate(`          | 0      | 0     | 0    |
| `useParams(`            | 0      | 0     | 0    |
| `fetch(`                | 1      | 1     | 0    |

### ExtinguishersListPage

| Anchor                  | Before | After | Diff |
| ----------------------- | ------ | ----- | ---- |
| `onClick={...}`         | 29     | 29    | 0    |
| `useState(`             | 19     | 19    | 0    |
| `useRef(`               | 0      | 0     | 0    |
| `useEffect(`            | 2      | 2     | 0    |
| `useMutation(`          | 6      | 6     | 0    |
| `useQuery(`             | 1      | 1     | 0    |
| `useNavigate(`          | 1      | 1     | 0    |
| `useParams(`            | 0      | 0     | 0    |
| `fetch(`                | 1      | 1     | 0    |

비즈 anchor precise grep IDENTICAL. 모든 onClick handler 본문 unique set (Public 0 / List 20) 100% 일치.

## Phase A 결과 보존 (PASS)

| Metric                                           | Public | List |
| ------------------------------------------------ | ------ | ---- |
| emoji (✓/✗/🔒/💾/🔥/⏰/📋/✅/⚠️/❌/🔧/🚨/🔍/🧯/📊) | 0      | 0    |
| 비표준 색 (bg-warning/border-safe/border-warning/border-danger) | 0      | 0    |

## Shared style 정의 (PASS — 8개 보존)

| 파일                          | 정의                                                                                                  | 위치        |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- | ----------- |
| ExtinguisherPublicPage.tsx    | `const page: React.CSSProperties = {...vendor prefix...} as any`                                      | L148        |
| ExtinguishersListPage.tsx     | `const actionBtnStyle: React.CSSProperties`                                                            | L735        |
| ExtinguishersListPage.tsx     | `const dangerBtnStyle: React.CSSProperties`                                                            | L742        |
| ExtinguishersListPage.tsx     | `const modalWrapperStyle: React.CSSProperties`                                                         | L1029       |
| ExtinguishersListPage.tsx     | `const infoBannerStyle: React.CSSProperties`                                                           | L1035       |
| ExtinguishersListPage.tsx     | `const inputStyle: React.CSSProperties`                                                                | L1043       |
| ExtinguishersListPage.tsx     | `const cancelBtnStyle: React.CSSProperties`                                                            | L1051       |
| ExtinguishersListPage.tsx     | `const primaryBtnStyle: React.CSSProperties`                                                           | L1058       |

총 8 (Public 1 + List 7). `grep -cE '^const (page|actionBtnStyle|dangerBtnStyle|modalWrapperStyle|infoBannerStyle|inputStyle|cancelBtnStyle|primaryBtnStyle)'` = 8 ✓.

추가로 Public 의 `tbl`/`th`/`cl` 은 locked list 외 → className 문자열 상수로 변환 (`const tbl = "..."`). 본 wave 신규 패턴.

## TypeScript (PASS)

`./node_modules/.bin/tsc --noEmit 2>&1 | grep -c "error TS"` = 0

## Vite build (PASS)

`./node_modules/.bin/vite build` ✓ built in 14.79s. PWA 82 entries 7931.21 KiB.

## 파일 scope (PASS)

`git diff --name-only HEAD` (직전 commit 전) = `cha-bio-safety/src/pages/ExtinguisherPublicPage.tsx` + `cha-bio-safety/src/pages/ExtinguishersListPage.tsx` 2 파일만 변경. 다른 .tsx / .ts / .css / .json 변경 0.

## Commit

| Hash      | Message                                                                              |
| --------- | ------------------------------------------------------------------------------------ |
| `de15e07` | feat(260528-irl-01): Phase B Wave 8 — Extinguisher (Public 44 + List 78) → tailwind |

## 핵심 함정 회피 (자동 도달)

1. **w-7=32 / w-8=48 config override** — 본 wave 신규 추가 없음. portal button `height:32` → `h-[32px]` arbitrary (h-8=48 함정 회피). search input `padding-left:30` → `pl-[30px]` arbitrary.
2. **h-11 = 44px tailwind default 보존** — tab button height:44 변환 시 안전. config override 무.
3. **w-1.5 h-1.5 = 6px (tailwind default)** — chip dot 변환 시 안전. config override 무.
4. **rounded-pill = 99px (tailwind config)** — chip dot borderRadius:99 변환.
5. **px-2.5 / mb-2.5 = 10px (tailwind default)** — search icon left:10 / ConfirmModal title marginBottom:10 변환.
6. **font-mono 함정** — tailwind config 의 `font-mono` 는 `'JetBrains Mono', 'D2 Coding', 'monospace'` 3-fallback 체인. 원본은 `'JetBrains Mono', monospace` 2-fallback. 시각 byte-exact 보장 위해 `[font-family:'JetBrains_Mono',monospace]` arbitrary 직접 지정. underscore = 공백 함정 회피.
7. **transition arbitrary underscore** — `transition: 'border-color .15s'` → `[transition:border-color_.15s]` arbitrary. underscore = 공백.
8. **shorthand cascade border-r-transparent** — `cl` 의 `border border-[#bbb]` 위에 `border-r-transparent` 단일 면 override. tailwind shorthand cascade 정상 작동.
9. **tbl/th/cl style obj → className string const 변환 (신규)** — `const tbl: React.CSSProperties = {...}` 5-prop → `const tbl = "..."` 단순 string. 사용처 `style={tbl}` → `className={tbl}`, `style={{ ...th, textAlign:'center' }}` → `className={\`${th} text-center\`}` template literal. 비-locked-list shared style 은 이 패턴으로 spread 해소 가능.
10. **`bg-danger` (foreground status as background) 의도된 사용** — ConfirmModal primary button `primaryStyle === 'danger'` 시 강한 danger 색을 배경으로. 원본 `background: var(--status-danger)` 보존. memory `inspection_unresolved_color` 의 fire 칩 패턴과 별개 (이건 danger 버튼).

## 메모리 anchors

- `feedback_tailwind_w8_h8_is_48px.md` (config override 함정 회피)
- `feedback_tailwind_token_class_pattern.md` (-bar prefix 룰 / `text-[#hex]` arbitrary)
- `project_redesign_09_extinguishers_status.md` (redesign/09 완결 페이지 컨텍스트 — 본 wave 가 phase b 마지막 정리)
- `feedback_redesign_sketch_rule_enforcement.md` (§6.2 negative rule 위험 임계치 아닌 카드 status 색 금지 — 본 wave 0 위반)
- `feedback_tailwind_token_class_pattern.md` (-bar suffix 룰 / `border-fire-bar` etc.)

## Self-Check: PASSED

- ExtinguisherPublicPage.tsx 변경 확인: FOUND
- ExtinguishersListPage.tsx 변경 확인: FOUND
- Commit `de15e07` 확인: FOUND
- TypeScript 0 error: PASSED
- Vite build: PASSED
- 비즈 anchor precise diff empty: PASSED
- Emoji 0 / 비색 0: PASSED
- 변경 파일 2개 (Public + List 만): PASSED
- Shared style 정의 8개 보존: PASSED
- Public inline ≤10 (실제 0): PASSED
- List inline ≤40 (실제 15): PASSED
