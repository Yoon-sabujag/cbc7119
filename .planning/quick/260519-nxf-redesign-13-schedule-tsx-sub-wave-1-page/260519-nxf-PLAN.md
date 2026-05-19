---
phase: 260519-nxf
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/pages/SchedulePage.tsx
autonomous: true
requirements:
  - SW1-PAGE-SHELL
  - SW1-MOBILE-HEADER
  - SW1-DESKTOP-ACTION-BAR
  - SW1-LUCIDE-IMPORT-3
  - SW1-AGING-14-TO-18
  - SW1-EXCEL-SOLID-TOKEN
  - SW1-UTILITY-CONSTS

must_haves:
  truths:
    - "src/pages/SchedulePage.tsx 가 sub-wave 1 영역(page-shell + 모바일 헤더 + 데스크톱 액션 바 outer + utility constants iconBtn) 만 v0.1.1 Tailwind 로 변환되어 있다"
    - "lucide-react 에서 ChevronLeft, Download, Plus 3개만 import 되어 있다 (다음 sub-wave 들에서 X / CheckCircle2 / AlertCircle 추가 예정)"
    - "헤더 영역의 모든 인라인 style 이 제거되고 Tailwind class 만 사용된다 (캘린더/카드/모달/미리보기 영역의 인라인 style 은 그대로 유지)"
    - "모바일 헤더 엑셀 다운로드 버튼이 linear-gradient 대신 bg-safe-bar solid 토큰을 쓴다 (W6 OQ #1 LOCKED b)"
    - "데스크톱 액션 바 엑셀 버튼이 linear-gradient 대신 bg-safe-bar solid 토큰을 쓴다 (W6 OQ #1 LOCKED b)"
    - "모바일 헤더 타이틀 폰트가 18px(text-title)로 격상 (source 14px → 18px, W7 §8 노안 격상)"
    - "엑셀/추가 버튼 폰트가 14px(text-body-sm)로 격상 (source 12px → 14px)"
    - "+ 추가 버튼에 lucide Plus(size=14) 아이콘이 도입되어 있다 (W7 OQ #2 LOCKED a 일관)"
    - "iconBtn 인라인 style 상수가 삭제되어 있다 (헤더 백 버튼 인라인화 됨)"
    - "arrowBtn / lbl / inp 3개 utility 상수는 이번 sub-wave 에선 그대로 보존 (다음 sub-wave 의 사용처와 함께 변환됨)"
    - "비즈 로직 0 변경 — handlePlanDownload / setShowAdd / navigate / staff / planLoading 시그니처 전부 그대로"
    - "다른 sub-wave 영역(캘린더 240~299 / 일자 카드 300~405 / 미리보기 498~643 / AddModal 647~963 / EditModal 966~1042) 의 코드는 1 byte 도 변경되지 않는다"
    - "npx tsc --noEmit 가 0 errors 로 PASS"
    - "npm run build 가 exit 0 로 PASS"
  artifacts:
    - path: "cha-bio-safety/src/pages/SchedulePage.tsx"
      provides: "sub-wave 1 변환된 SchedulePage (헤더 + page-shell + lucide 3 import + iconBtn 삭제)"
      contains: "from 'lucide-react'"
  key_links:
    - from: "cha-bio-safety/src/pages/SchedulePage.tsx (line 1~10 area)"
      to: "lucide-react"
      via: "import { ChevronLeft, Download, Plus } from 'lucide-react'"
      pattern: "from 'lucide-react'"
    - from: "모바일 헤더 (variant render after line ~466)"
      to: "bg-safe-bar 토큰"
      via: "엑셀 버튼 className"
      pattern: "bg-safe-bar"
    - from: "데스크톱 액션 바 (variant render after line ~432)"
      to: "bg-safe-bar 토큰"
      via: "엑셀 버튼 className"
      pattern: "bg-safe-bar"
---

<objective>
13-schedule TSX 변환 wave 의 sub-wave 1 — `cha-bio-safety/src/pages/SchedulePage.tsx` 의 **page-shell + 모바일 헤더 + 데스크톱 액션 바 outer + lucide 도입 + utility constants(iconBtn)** 만 v0.1.1 Tailwind 로 변환. 총 6 sub-wave 중 1번째.

Purpose: source 1062 lines 를 atomic 1-shot 으로 변환하면 컨텍스트/리스크 모두 폭발 → §6 권장 sub-task 분할 (W7 OQ #1 LOCKED b). 이번 SW1 은 가장 frame 작은 영역 (헤더/외곽/유틸) 만 손대고 commit 1개로 마무리해 다음 sub-wave 진입 안정성 확보.

Output: SchedulePage.tsx 의 헤더+page-shell 영역만 v0.1.1 토큰화. lucide 3개 import. iconBtn 상수 제거. 비즈 로직 0 변경. atomic commit 1개.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@CLAUDE.local.md
@cha-bio-safety/docs/redesign-context/13-schedule/wave-7-tsx-conversion-checklist.md
@cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-1.html
@cha-bio-safety/docs/redesign-context/13-schedule/sketch-wave-6.html
@cha-bio-safety/docs/redesign-context/13-schedule/design-system.md
@cha-bio-safety/docs/redesign-context/13-schedule/tokens.css
@cha-bio-safety/docs/redesign-context/13-schedule/typography.css
@cha-bio-safety/tailwind.config.js
@cha-bio-safety/src/pages/SchedulePage.tsx

<interfaces>
<!-- 변환 wave 의 SW1 가 손댈 source 영역 + 토큰 매핑 cheatsheet. executor 는 본 블록만 1-pass 로 적용. -->

### Source SW1 영역 (line 매핑, 본 영역 외 0 변경)

A) `import` 블록 (line 1~10) — lucide-react 추가:
```tsx
// 추가할 import (file 상단, 기존 imports 사이 적절한 위치)
import { ChevronLeft, Download, Plus } from 'lucide-react'
```

B) 데스크톱 render outer + 액션 바 (line 432~464):
```tsx
// BEFORE (source verbatim)
if (isDesktop) {
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', background:'var(--bg)' }}>
      {/* 액션 바 — App.tsx 가 이미 페이지 제목 표시. 여기는 액션 버튼만 */}
      <div style={{ padding:'10px 24px', borderBottom:'1px solid var(--bd)', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:8, flexShrink:0, background:'var(--bg2)' }}>
        <button onClick={handlePlanDownload} disabled={planLoading}
          style={{ padding:'6px 12px', borderRadius:8, border:'none', background: planLoading ? 'var(--bg3)' : 'linear-gradient(135deg,#15803d,#22c55e)', color: planLoading ? 'var(--t3)' : '#fff', fontSize:12, fontWeight:700, cursor: planLoading ? 'default' : 'pointer', display:'flex', alignItems:'center', gap:5 }}>
          <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-4-4m4 4l4-4M4 19h16"/></svg>
          {planLoading ? '생성 중...' : '엑셀 다운로드'}
        </button>
      </div>

      {/* 상단: 월간 점검 계획 테이블 */}
      <div style={{ flexShrink:0, overflow:'hidden', borderBottom:'1px solid var(--bd)' }}>
        <MonthlyPlanPreview ... />
      </div>

      {/* 하단: 좌=달력, 우=일정 */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        <div style={{ width:380, flexShrink:0, overflowY:'auto', padding:'16px 20px', borderRight:'1px solid var(--bd)' }}>
          {calendarEl}
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'16px 24px' }}>
          {scheduleListEl}
        </div>
      </div>

      {modalsEl}
    </div>
  )
}
```

```tsx
// AFTER (SW1 변환 — outer + 액션 바 까지만, 하단 split 도 outer wrapper 만)
if (isDesktop) {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-surface-page">
      {/* 액션 바 — App.tsx 가 이미 페이지 제목 표시. 여기는 액션 버튼만 */}
      <div className="flex flex-shrink-0 items-center justify-end gap-2 px-6 py-2.5 border-b border-border-default bg-surface-raised">
        <button
          onClick={handlePlanDownload}
          disabled={planLoading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-body-sm font-bold ${
            planLoading
              ? 'bg-surface-sunken text-text-tertiary cursor-default'
              : 'bg-safe-bar text-text-on-accent cursor-pointer'
          }`}
        >
          <Download size={13} />
          {planLoading ? '생성 중...' : '엑셀 다운로드'}
        </button>
      </div>

      {/* 상단: 월간 점검 계획 테이블 */}
      <div className="flex-shrink-0 overflow-hidden border-b border-border-default">
        <MonthlyPlanPreview curMonth={curMonth} items={monthItems} holidays={holidays} todayStr={today} />
      </div>

      {/* 하단: 좌=달력, 우=일정 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 달력 — 내부 인라인은 SW2 에서 변환 */}
        <div className="w-[380px] flex-shrink-0 overflow-y-auto px-5 py-4 border-r border-border-default">
          {calendarEl}
        </div>
        {/* 일정 리스트 — 내부 인라인은 SW3 에서 변환 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {scheduleListEl}
        </div>
      </div>

      {modalsEl}
    </div>
  )
}
```

C) 모바일 render outer + 헤더 (line 466~496):
```tsx
// BEFORE (source verbatim)
return (
  <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg)' }}>

    <header style={{ flexShrink:0, background:'var(--bg2)', borderBottom:'1px solid var(--bd)', padding:'8px 12px 9px', display:'flex', alignItems:'center', gap:8 }}>
      <button onClick={() => navigate(-1)} style={iconBtn}>
        <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="var(--t2)" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <span style={{ flex:1, fontSize:14, fontWeight:700, color:'var(--t1)' }}>월간 점검 계획</span>
      <button onClick={handlePlanDownload} disabled={planLoading}
        style={{ padding:'6px 12px', borderRadius:8, border:'none', background: planLoading ? 'var(--bg3)' : 'linear-gradient(135deg,#15803d,#22c55e)', color: planLoading ? 'var(--t3)' : '#fff', fontSize:12, fontWeight:700, cursor: planLoading ? 'default' : 'pointer', display:'flex', alignItems:'center', gap:5 }}>
        <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-4-4m4 4l4-4M4 19h16"/></svg>
        {planLoading ? '생성 중...' : '엑셀 다운로드'}
      </button>
      <button onClick={() => setShowAdd(true)}
        style={{ padding:'6px 14px', borderRadius:8, border:'none', background:'var(--acl)', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>
        + 추가
      </button>
    </header>

    <div style={{ flex:1, overflowY:'auto', padding:'12px 16px 24px' }}>
      {calendarEl}
      {scheduleListEl}
    </div>

    {modalsEl}
  </div>
)
```

```tsx
// AFTER (SW1 변환)
return (
  <div className="w-full h-full flex flex-col overflow-hidden bg-surface-page">

    <header className="flex flex-shrink-0 items-center gap-2 px-3 pt-2 pb-[9px] bg-surface-raised border-b border-border-default">
      <button
        onClick={() => navigate(-1)}
        className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-sm bg-surface-sunken border border-border-default cursor-pointer"
      >
        <ChevronLeft size={15} strokeWidth={2} className="text-text-secondary" />
      </button>
      <span className="flex-1 text-title font-bold text-text-primary">월간 점검 계획</span>
      <button
        onClick={handlePlanDownload}
        disabled={planLoading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-body-sm font-bold ${
          planLoading
            ? 'bg-surface-sunken text-text-tertiary cursor-default'
            : 'bg-safe-bar text-text-on-accent cursor-pointer'
        }`}
      >
        <Download size={13} />
        {planLoading ? '생성 중...' : '엑셀 다운로드'}
      </button>
      <button
        onClick={() => setShowAdd(true)}
        className="flex items-center gap-1 px-3.5 py-1.5 rounded-sm bg-accent text-text-on-accent text-body-sm font-bold cursor-pointer"
      >
        <Plus size={14} />
        추가
      </button>
    </header>

    {/* 본문 — 내부 인라인은 SW2/SW3 에서 변환 */}
    <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6">
      {calendarEl}
      {scheduleListEl}
    </div>

    {modalsEl}
  </div>
)
```

D) Utility constants (line 1044~1062):
```tsx
// BEFORE
const iconBtn: React.CSSProperties = {
  width:34, height:34, borderRadius:8, flexShrink:0,
  background:'var(--bg3)', border:'1px solid var(--bd)',
  cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
}
const arrowBtn: React.CSSProperties = { ... }   // ← SW2 에서 사용처와 함께 변환. 이번엔 그대로 유지
const lbl: React.CSSProperties = { ... }        // ← SW5/SW6 에서 사용처와 함께 변환. 이번엔 그대로 유지
const inp: React.CSSProperties = { ... }        // ← SW5/SW6 에서 사용처와 함께 변환. 이번엔 그대로 유지
```

```tsx
// AFTER
// iconBtn 삭제 — 위 헤더 백 버튼 className 으로 인라인화 완료
const arrowBtn: React.CSSProperties = { ... }   // unchanged
const lbl: React.CSSProperties = { ... }        // unchanged
const inp: React.CSSProperties = { ... }        // unchanged
```

### v0.1.1 토큰 cheatsheet (SW1 영역만)

| 옛 alias | 새 Tailwind class |
|---|---|
| `var(--bg)` | `bg-surface-page` |
| `var(--bg2)` | `bg-surface-raised` |
| `var(--bg3)` | `bg-surface-sunken` |
| `var(--bd)` | `border-border-default` |
| `var(--t1)` | `text-text-primary` |
| `var(--t2)` | `text-text-secondary` |
| `var(--t3)` | `text-text-tertiary` |
| `var(--acl)` | `bg-accent` |
| 흰색 텍스트 (`color:'#fff'`) | `text-text-on-accent` |
| `linear-gradient(135deg,#15803d,#22c55e)` (엑셀) | `bg-safe-bar` solid (W6 OQ #1 LOCKED b) |
| `fontSize:14, fontWeight:700` (헤더 타이틀) | `text-title font-bold` (노안 14→18) |
| `fontSize:12, fontWeight:700` (엑셀/추가 버튼) | `text-body-sm font-bold` (노안 12→14) |
| `padding:'6px 12px'` (엑셀 버튼) | `px-3 py-1.5` |
| `padding:'6px 14px'` (추가 버튼) | `px-3.5 py-1.5` |
| `borderRadius:8` | `rounded-sm` (= 8px, `tailwind.config.borderRadius.sm`) |

### IMPORTANT: tailwind.config 실제 키 패턴

본 프로젝트 `tailwind.config.js` (line 64~76 verbatim) 의 키 정의:
- `safe-bar: 'var(--status-safe-bar)'` → Tailwind 클래스는 `bg-safe-bar` / `text-safe-bar` / `border-safe-bar`
- W7 checklist §4.2 #13 의 `bg-status-safe-bar` 패턴은 **틀린 표기 (W7 작성자 오류). 실제 정의는 `bg-safe-bar`**. 12-staff-service TSX (line 1049, 1130, 1346, 1430) 도 `bg-safe-bar` / `text-safe` / `border-safe-bar` 패턴 사용.
- 메모리 `feedback_tailwind_token_class_pattern.md` 의 "status- prefix 없음 (text-fire-bar O / text-status-fire-bar X)" 룰 verbatim 적용.
- accent / surface / text / border 토큰은 prefix 그대로 (`bg-accent`, `bg-surface-page`, `text-text-primary`, `border-border-default`).

### w-8 h-8 함정 (메모리 `feedback_tailwind_w8_h8_is_48px.md`)

- `tailwind.config.spacing` 의 `'7': '32px'`, `'8': '48px'` override (Tailwind 기본 32/40 아님).
- 백 버튼 = 32×32 노안 통일 → **`w-7 h-7`** (source iconBtn 의 34×34 → 32×32 통일).
- 추가 버튼 padding `px-3.5 py-1.5` = 14px/6px → semantic 토큰 아닌 primitive 그대로.

### text-caption leading-none (메모리 `feedback_text_caption_leading_none.md`)

- SW1 영역엔 text-caption 사용처 없음 (헤더 타이틀=text-title, 버튼=text-body-sm). leading-* 명시 불필요. SW2~SW6 영역에서 적용.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: SW1 — page-shell + 헤더 + 데스크톱 액션 바 outer + lucide 3 import + iconBtn 삭제</name>
  <files>cha-bio-safety/src/pages/SchedulePage.tsx</files>
  <behavior>
SW1 영역만 변환. 이외 영역(캘린더 / 일자 카드 / 미리보기 / AddModal / EditModal) 은 1 byte 도 손대지 않는다.

Verbatim 적용 룰:
- W6 OQ #1 LOCKED b — 엑셀 버튼 `bg-safe-bar` solid (linear-gradient 폐기).
- W7 OQ #2 LOCKED a — lucide 도입 일관 (이번 SW1 에선 3개 — ChevronLeft, Download, Plus).
- W7 §8 노안 격상 — 헤더 타이틀 14→18 (text-title), 엑셀/추가 버튼 12→14 (text-body-sm), 백 버튼 34→32 (w-7 h-7).
- 메모리 `feedback_tailwind_token_class_pattern.md` — class prefix 패턴: bg-safe-bar (O) / bg-status-safe-bar (X).
- 메모리 `feedback_tailwind_w8_h8_is_48px.md` — w-7=32px / w-8=48px.
- 메모리 `feedback_tsx_wave_stat_card_drift.md` — sketch 새 패턴 누락 검출: (1) bg-safe-bar 적용 여부, (2) 노안 격상 14→18, (3) lucide 3종 적용 여부 — 세 항목 모두 verify.

비즈 로직 보존:
- handlePlanDownload / setShowAdd / setShowAdd(true) / navigate(-1) / planLoading / staff / qc / curMonth / today / selDate 시그니처 1 byte 도 변경 금지.
- handlePlanDownload 호출 시 `planLoading ? '생성 중...' : '엑셀 다운로드'` 텍스트 verbatim.
- "+ 추가" 텍스트 → 본 SW1 에서는 lucide Plus 아이콘 + "추가" 텍스트로 변환 (W7 OQ #2 LOCKED a 일관). 의미/의도 동일, 시각만 아이콘+텍스트.
- "월간 점검 계획" 헤더 타이틀 verbatim.

다른 sub-wave 침범 금지:
- calendarEl / scheduleListEl / modalsEl 변수는 그대로 호출만. 내부 구현(line 237~405, 414~427) 0 변경.
- MonthlyPlanPreview 호출도 그대로 (line 446 prop 시그니처 그대로).
- AddModal / EditModal / utility(arrowBtn / lbl / inp) 도 그대로.
  </behavior>
  <action>
1. **사전 확인** — `cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && ls node_modules/lucide-react/dist 2>/dev/null` 로 lucide-react 설치 여부 확인. 없으면 `npm install` 또는 `npm ci` 먼저 (메모리: 12-staff TSX 변환 wave 동일 사고).

2. **import 블록 수정** (file 상단) — 기존 imports 옆에 lucide-react 추가:
   ```tsx
   import { ChevronLeft, Download, Plus } from 'lucide-react'
   ```
   (`import type { ScheduleItem, ScheduleCategory } from '../types'` 와 같은 group 또는 그 위 적당한 위치)

3. **데스크톱 render outer 변환** (line 432~464 영역) — `<interfaces>` block 의 B) AFTER snippet verbatim 적용:
   - `<div style={{...background:'var(--bg)'}}>` → `<div className="flex flex-col h-full overflow-hidden bg-surface-page">`
   - 액션 바 outer `<div style={{ padding:'10px 24px',...background:'var(--bg2)' }}>` → `<div className="flex flex-shrink-0 items-center justify-end gap-2 px-6 py-2.5 border-b border-border-default bg-surface-raised">`
   - 엑셀 버튼 → conditional className (`bg-safe-bar` solid, lucide `<Download size={13} />`, 노안 14, rounded-sm)
   - "상단" 섹션 wrapper `<div style={{ flexShrink:0, overflow:'hidden', borderBottom:'1px solid var(--bd)' }}>` → `<div className="flex-shrink-0 overflow-hidden border-b border-border-default">`
   - "하단" 섹션 outer `<div style={{ flex:1, display:'flex', overflow:'hidden' }}>` → `<div className="flex flex-1 overflow-hidden">`
   - 달력 컬럼 outer `<div style={{ width:380, ...padding:'16px 20px', borderRight:'1px solid var(--bd)' }}>` → `<div className="w-[380px] flex-shrink-0 overflow-y-auto px-5 py-4 border-r border-border-default">`
   - 일정 컬럼 outer `<div style={{ flex:1, overflowY:'auto', padding:'16px 24px' }}>` → `<div className="flex-1 overflow-y-auto px-6 py-4">`
   - **`{calendarEl}` / `{scheduleListEl}` / `{modalsEl}` / `<MonthlyPlanPreview ...>` 호출 부분은 그대로 — 내부 구현은 SW2~SW6 책임.**

4. **모바일 render outer + 헤더 변환** (line 466~496 영역) — `<interfaces>` block 의 C) AFTER snippet verbatim 적용:
   - outer `<div style={{...background:'var(--bg)'}}>` → `<div className="w-full h-full flex flex-col overflow-hidden bg-surface-page">`
   - `<header style={{...padding:'8px 12px 9px'...}}>` → `<header className="flex flex-shrink-0 items-center gap-2 px-3 pt-2 pb-[9px] bg-surface-raised border-b border-border-default">`
     (source padding `8px 12px 9px` 의 비대칭 padding 보존 — `pt-2 pb-[9px]` arbitrary 사용)
   - 백 버튼 `<button onClick={() => navigate(-1)} style={iconBtn}>` → `<button onClick={() => navigate(-1)} className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-sm bg-surface-sunken border border-border-default cursor-pointer">` (32×32 노안)
   - 백 버튼 SVG → `<ChevronLeft size={15} strokeWidth={2} className="text-text-secondary" />`
   - 타이틀 `<span style={{ flex:1, fontSize:14, fontWeight:700, color:'var(--t1)' }}>` → `<span className="flex-1 text-title font-bold text-text-primary">` (노안 14→18, 텍스트 "월간 점검 계획" verbatim)
   - 엑셀 버튼 → 데스크톱과 동일 패턴 (`bg-safe-bar` solid, lucide `<Download size={13} />`, conditional, 노안 14)
   - "+ 추가" 버튼 → `<button onClick={() => setShowAdd(true)} className="flex items-center gap-1 px-3.5 py-1.5 rounded-sm bg-accent text-text-on-accent text-body-sm font-bold cursor-pointer"><Plus size={14} />추가</button>` (Plus 아이콘 + "추가" 텍스트, "+" 텍스트 제거)
   - 본문 wrapper `<div style={{ flex:1, overflowY:'auto', padding:'12px 16px 24px' }}>` → `<div className="flex-1 overflow-y-auto px-4 pt-3 pb-6">`

5. **utility constants 정리** (line 1044~1054 영역):
   - `const iconBtn: React.CSSProperties = {...}` 5줄 **삭제** (사용처 모바일 백 버튼에서 className 으로 인라인화 완료)
   - `const arrowBtn: React.CSSProperties = {...}` — **그대로 유지** (사용처 line 242/246 — SW2 책임)
   - `const lbl: React.CSSProperties = {...}` — **그대로 유지** (SW5/SW6 책임)
   - `const inp: React.CSSProperties = {...}` — **그대로 유지** (SW5/SW6 책임)

6. **검증** (모두 worktree 루트 `/Users/jykevin/Documents/cbc7119-design` 기준):
   - 6a. tsc check:
     ```bash
     cd cha-bio-safety && npx tsc --noEmit
     ```
     → exit 0 / 0 errors. 실패 시 fix 후 재실행.
   - 6b. build check:
     ```bash
     cd cha-bio-safety && npm run build
     ```
     → exit 0. chunk size 출력 캡처.
   - 6c. NEGATIVE grep gates (SW1 영역만 — 헤더+page-shell+iconBtn 라인만 검증; 다른 영역의 잔존은 OK):
     ```bash
     # 헤더 영역에 linear-gradient 0 (전체 file 기준 0 도 만족)
     sed -n '432,496p' cha-bio-safety/src/pages/SchedulePage.tsx | grep -nE 'linear-gradient'
     # 기대: 0 hits

     # 헤더 영역에 옛 alias 0
     sed -n '432,496p' cha-bio-safety/src/pages/SchedulePage.tsx | grep -nE 'var\(--(bg|bg2|bg3|bd|bd2|t1|t2|t3|acl|safe|warn|danger|info|fire)\)'
     # 기대: 0 hits

     # 헤더 영역에 인라인 fontSize 0
     sed -n '432,496p' cha-bio-safety/src/pages/SchedulePage.tsx | grep -nE 'fontSize:'
     # 기대: 0 hits

     # 헤더 영역에 style={{ 0 (Tailwind class only)
     sed -n '432,496p' cha-bio-safety/src/pages/SchedulePage.tsx | grep -nE 'style=\{\{'
     # 기대: 0 hits

     # 헤더 영역에 9·10·11px 0
     sed -n '432,496p' cha-bio-safety/src/pages/SchedulePage.tsx | grep -nE '\b(9|10|11)px\b|fontSize:\s*(9|10|11)\b'
     # 기대: 0 hits

     # status- prefix 잘못된 패턴 (text-status-safe-bar 같은 잘못된 가정) 0
     grep -nE '(text|bg|border)-status-(safe|warning|danger|info|fire)' cha-bio-safety/src/pages/SchedulePage.tsx
     # 기대: 0 hits (실제 클래스는 prefix 없는 bg-safe-bar 패턴)

     # iconBtn 상수 정의 0 (삭제 확인)
     grep -nE '\biconBtn\b' cha-bio-safety/src/pages/SchedulePage.tsx
     # 기대: 0 hits

     # 이모지 0 (헤더 영역)
     sed -n '432,496p' cha-bio-safety/src/pages/SchedulePage.tsx | grep -nP '[\x{1F300}-\x{1FAFF}]|[\x{2600}-\x{27BF}]'
     # 기대: 0 hits
     ```
   - 6d. POSITIVE grep gates (SW1 영역에 새로 도입된 토큰 ≥1 hit):
     ```bash
     # lucide import 1 hit
     grep -nE "from 'lucide-react'" cha-bio-safety/src/pages/SchedulePage.tsx
     # 기대: 1 hit (이번 SW1 도입)

     # ChevronLeft + Download + Plus 사용처 합 ≥3
     grep -nE '<(ChevronLeft|Download|Plus)\b' cha-bio-safety/src/pages/SchedulePage.tsx
     # 기대: ≥3 hits (백 버튼 1, 엑셀 데스크톱+모바일 2, 추가 1 = 4 hits)

     # bg-safe-bar ≥2 (엑셀 데스크톱 + 모바일)
     grep -nE '\bbg-safe-bar\b' cha-bio-safety/src/pages/SchedulePage.tsx
     # 기대: ≥2 hits

     # bg-accent ≥1 (모바일 + 추가 버튼)
     grep -nE '\bbg-accent\b' cha-bio-safety/src/pages/SchedulePage.tsx
     # 기대: ≥1 hit

     # text-title (헤더 타이틀)
     grep -nE '\btext-title\b' cha-bio-safety/src/pages/SchedulePage.tsx
     # 기대: ≥1 hit

     # text-body-sm (엑셀 + 추가 버튼)
     grep -nE '\btext-body-sm\b' cha-bio-safety/src/pages/SchedulePage.tsx
     # 기대: ≥2 hits

     # bg-surface-page (모바일 + 데스크톱 outer)
     grep -nE '\bbg-surface-page\b' cha-bio-safety/src/pages/SchedulePage.tsx
     # 기대: ≥2 hits

     # bg-surface-raised (헤더 / 액션 바)
     grep -nE '\bbg-surface-raised\b' cha-bio-safety/src/pages/SchedulePage.tsx
     # 기대: ≥2 hits

     # border-border-default (헤더 / 액션 바 / 컬럼 등)
     grep -nE '\bborder-border-default\b' cha-bio-safety/src/pages/SchedulePage.tsx
     # 기대: ≥3 hits
     ```
   - 6e. 비즈 로직 보존 verify (전체 file):
     ```bash
     # handlePlanDownload / setShowAdd / navigate / planLoading / staff 시그니처 잔존
     grep -nE '(handlePlanDownload|setShowAdd|navigate\(-1\)|planLoading|staff\.id)' cha-bio-safety/src/pages/SchedulePage.tsx
     # 기대: SW1 변경 영역 카운트 + 다른 영역 카운트 합. 변경 전과 동일 또는 더 많아야 함 (lucide 추가).

     # 다른 sub-wave 영역(calendarEl / scheduleListEl / modalsEl 정의 내부) line 137~427, 498~1042 의 인라인 잔존 — 그대로 유지 확인
     # iconBtn 외 utility 상수 3개(arrowBtn / lbl / inp) 잔존
     grep -nE '^const (arrowBtn|lbl|inp): React\.CSSProperties' cha-bio-safety/src/pages/SchedulePage.tsx
     # 기대: 3 hits (변경 전 4 → SW1 후 3 = iconBtn 만 삭제)

     # toast 카피 13 hit 잔존 (전체 file)
     grep -nE "toast\.(success|error)" cha-bio-safety/src/pages/SchedulePage.tsx
     # 기대: 13 hits (변경 전과 동일)
     ```

7. **결과 보고** — verify gate 출력 (6c/6d/6e) 모두 캡처해서 보고. 실패 시 fix 후 재실행.

8. **commit** (atomic, 1개) — sub-wave 1 commit:
   ```bash
   git add cha-bio-safety/src/pages/SchedulePage.tsx
   git commit -m "$(cat <<'EOF'
tsx(13-schedule): SW1 — page-shell + 헤더 + lucide 도입 + utility constants

- 모바일/데스크톱 outer + 모바일 헤더 + 데스크톱 액션 바 outer 만 v0.1.1 Tailwind 변환
- import { ChevronLeft, Download, Plus } from 'lucide-react' 3종 도입
- 엑셀 버튼 linear-gradient(135deg,#15803d,#22c55e) 폐기 → bg-safe-bar solid (W6 OQ #1 LOCKED b)
- 노안 격상 — 헤더 14→18(text-title), 엑셀/추가 12→14(text-body-sm), 백 버튼 34→32(w-7 h-7)
- + 추가 버튼: 텍스트 "+ 추가" → lucide <Plus size={14} /> + "추가" (W7 OQ #2 LOCKED a)
- iconBtn 인라인 style 상수 삭제(사용처 백 버튼 className 인라인화)
- arrowBtn / lbl / inp 3개 utility 상수는 SW2~SW6 사용처와 함께 변환 예정 — 그대로 유지

비즈 로직 0 변경: handlePlanDownload / setShowAdd / navigate / planLoading / staff 시그니처 verbatim
다른 sub-wave 영역(캘린더 / 일자 카드 / 미리보기 / AddModal / EditModal) 0 변경

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
   ```
  </action>
  <verify>
    <automated>cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && npx tsc --noEmit && npm run build</automated>
  </verify>
  <done>
- SchedulePage.tsx 의 line 1~10 import 영역에 `from 'lucide-react'` 1 hit
- 모바일 헤더 (이전 line 466~496 영역) 인라인 style 0, Tailwind class만 사용
- 데스크톱 액션 바 outer (이전 line 432~464 영역) 인라인 style 0, Tailwind class만 사용 (split layout outer 도 변환)
- `bg-safe-bar` ≥2 hits (엑셀 데스크톱 + 모바일)
- `bg-accent` ≥1 hit (+ 추가 버튼)
- `<Plus size={14} />`, `<Download size={13} />`, `<ChevronLeft size={15} ... />` 각 ≥1
- `text-title` ≥1 (헤더 타이틀)
- `text-body-sm` ≥2 (엑셀 + 추가)
- `linear-gradient` 0 (전체 file)
- 옛 alias `var(--bg|bg2|bg3|bd|t1|t2|t3|acl|safe|...)` 0 (헤더 영역만 — 다른 영역 잔존은 SW2~SW6 책임)
- `iconBtn` 식별자 0 hit (삭제 확인)
- `arrowBtn / lbl / inp` 정의 3 hits (보존 확인)
- `toast.(success|error)` 13 hits (비즈 로직 보존)
- `npx tsc --noEmit` exit 0
- `npm run build` exit 0
- atomic commit 1개 (`SchedulePage.tsx` 1 파일만)
  </done>
</task>

</tasks>

<verification>
SW1 검증 4단계:

1. **typescript** — `npx tsc --noEmit` exit 0
2. **build** — `npm run build` exit 0 (chunk size 변동 캡처)
3. **negative grep (SW1 영역)** — 헤더+page-shell 영역만 검증 (line 432~496 + import + iconBtn 라인):
   - linear-gradient 0
   - var(--bg|bg2|bg3|bd|t1|t2|t3|acl) 0
   - inline `fontSize:` 0
   - inline `style={{` 0
   - 9·10·11px 0
   - `(text|bg|border)-status-(safe|warning|danger|info|fire)` 0 (잘못된 prefix 패턴)
   - `iconBtn` 식별자 0
   - 이모지 0 (Python regex)
4. **positive grep (SW1 영역 새 토큰)**:
   - `from 'lucide-react'` 1 hit
   - `<(ChevronLeft|Download|Plus)\b` ≥3 hits (실제 4)
   - `bg-safe-bar` ≥2 hits
   - `bg-accent` ≥1 hit
   - `text-title` ≥1 hit
   - `text-body-sm` ≥2 hits
   - `bg-surface-page` / `bg-surface-raised` / `border-border-default` 각 ≥2
   - `arrowBtn / lbl / inp` 정의 3 hits 잔존
   - `toast.*` 13 hits 잔존 (비즈 보존)

5. **scope verify** — 다음 sub-wave 영역 0 변경 확인:
   ```bash
   # line 137~427 (캘린더/카드/modalsEl 정의) 의 인라인 style 잔존 (= 변경 안 함)
   sed -n '137,427p' cha-bio-safety/src/pages/SchedulePage.tsx | grep -cE 'style=\{\{'
   # 기대: 변경 전 카운트와 정확히 동일

   # line 498~1042 (MonthlyPlanPreview + AddModal + EditModal) 의 인라인 style 잔존
   sed -n '498,1042p' cha-bio-safety/src/pages/SchedulePage.tsx | grep -cE 'style=\{\{'
   # 기대: 변경 전 카운트와 정확히 동일
   ```
</verification>

<success_criteria>
SW1 변환 완료 = 아래 모두 PASS:

- `cha-bio-safety/src/pages/SchedulePage.tsx` 의 헤더+page-shell+iconBtn 영역만 v0.1.1 Tailwind 변환됨
- lucide 3종 (ChevronLeft / Download / Plus) import + 사용
- 엑셀 버튼 2곳 (데스크톱 + 모바일) 모두 `bg-safe-bar` solid
- 노안 격상 적용 (헤더 18 / 버튼 14)
- iconBtn 상수 삭제, 다른 utility 3개 보존
- 다른 sub-wave 영역 (캘린더 / 카드 / 미리보기 / 모달) 0 변경
- 비즈 로직 0 변경 (toast 13 / scheduleApi 5 / useQuery 2 / handlers 시그니처 동일)
- tsc 0 errors + build PASS
- atomic commit 1개 (`SchedulePage.tsx` 1 파일만, 메시지 verbatim)
- 다음 sub-wave (SW2 = 캘린더 grid) 진입 안정성 확보
</success_criteria>

<output>
After completion, create `.planning/quick/260519-nxf-redesign-13-schedule-tsx-sub-wave-1-page/260519-nxf-SUMMARY.md` with:
- 변경 line range (변경 전 → 변경 후 line 매핑)
- chunk size diff (npm run build 출력 캡처)
- verify gate 결과 (negative 8 / positive 9 / scope 2 / 비즈 3)
- commit hash + 메시지
- 다음 sub-wave (SW2 캘린더 grid) 권장 진입 시점 + scope
</output>
