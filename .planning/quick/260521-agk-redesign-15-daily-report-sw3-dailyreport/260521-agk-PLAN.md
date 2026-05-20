---
phase: quick-260521-agk
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/src/pages/DailyReportPage.tsx
autonomous: true
requirements:
  - SW3-DESKTOP-MAIN
  - SW3-PORTRAIT-WRAPPER
  - SW3-CALIB-MARKER
  - SW3-FONT-PROMO
  - SW3-EMOJI-REPLACE
  - SW3-VERIFY-GATE

must_haves:
  truths:
    - "데스크톱 isDesktop=true 분기가 .desktop-layout / .desktop-edit-panel / .desktop-edit-panel-header / .desktop-portrait-wrapper / .desktop-portrait-print-label class 로 렌더되며, 인쇄 미리보기 라벨이 fontSize 12 로 표시된다 (W5 sketch verbatim)."
    - "DailyPortraitPreview 컴포넌트 외곽 wrapper / img / overlay area / 캘리브 안내 바 / 확인/취소 버튼 / 위치 설정 버튼이 .daily-portrait-* class 9개 이상으로 변환되며, 캘리브 안내 바 좌표 fontSize 가 11 → 14 로 격상된다 (W6 OQ #1 LOCKED)."
    - "DailyCalibMarker 외곽/십자선 H/십자선 V/dot 4건이 .daily-portrait-calib-marker* class 로 변환되며, dot 라벨 fontSize 가 10 → 12 로 격상된다. 단 dynamic color/x/y/active 분기는 inline style 로 잔존한다."
    - "lucide-react import 에 AlertTriangle 이 추가되며, line 737 ⚠ 글리프가 <AlertTriangle size={14} /> JSX 로 교체된다 (OQ W1 #7 LOCKED — feedback_tsx_wave_emoji_dot_gap)."
    - "캘리브 좌표 시스템 (DAILY_CALIB_STEPS / FINGER_OFFSET / DAILY_CALIB_KEY / loadDailyCalib / saveDailyCalib / clientToImgPct / advanceStep / confirmPoint / onCalibTouchStart/Move/End / onCalibClick / measure / useEffect ResizeObserver / overlayItems / LARGE_KEYS / textStyle / props 시그니처 5종) 가 1 byte 도 변경되지 않는다 (feedback_sketch_realistic_data)."
    - "모바일 영역 (line 401~459) / formContent + dateNav (line 310~360) / 상단 imports/hooks/state/handlers (line 1~309) 가 lucide AlertTriangle 추가 1줄을 제외하고 1 byte 도 변경되지 않는다."
    - "9·10·11px fontSize 가 변환 영역 (line 365~767) 안에서 0건이며, 옛 토큰 var(--bg|bg2|bg3|bd|bd2|t1|t2|t3|acl) 가 변환 영역에서 0건이다 (단 DAILY_CALIB_STEPS[].color hex 같은 dynamic 색은 예외)."
  artifacts:
    - path: "cha-bio-safety/src/pages/DailyReportPage.tsx"
      provides: "데스크톱 분기 + DailyPortraitPreview wrapper + DailyCalibMarker className 변환 결과, 약 720 lines"
      contains: "className=\"desktop-layout\""
  key_links:
    - from: "DailyReportPage.tsx line 365~405 (isDesktop 분기)"
      to: "components.css §11 .desktop-layout / .desktop-edit-panel / .desktop-portrait-wrapper / .desktop-portrait-print-label"
      via: "className verbatim 매핑 (W5 sketch line 398~448)"
      pattern: "className=\"desktop-(layout|edit-panel|edit-panel-header|portrait-wrapper|portrait-print-label)\""
    - from: "DailyReportPage.tsx line 461~741 (DailyPortraitPreview)"
      to: "components.css §11 .daily-portrait-* (22 class)"
      via: "className verbatim 매핑 (W6 sketch line 450~652)"
      pattern: "className=\"daily-portrait-(wrapper|image|overlay-area|calib-bar|calib-bar-step|calib-bar-label|calib-bar-coord|calib-confirm|calib-cancel|setup-btn)"
    - from: "DailyReportPage.tsx line 744~767 (DailyCalibMarker)"
      to: "components.css §11 .daily-portrait-calib-marker / -crosshair-h / -crosshair-v / -dot / -dot--active"
      via: "className verbatim 매핑 + dynamic color/size inline style 잔존"
      pattern: "className=\"daily-portrait-calib-marker(-crosshair-h|-crosshair-v|-dot)?\""
    - from: "DailyReportPage.tsx line 11 (lucide import)"
      to: "DailyReportPage.tsx line ~736 (위치 설정 버튼)"
      via: "AlertTriangle import 추가 → JSX <AlertTriangle size={14} /> 사용"
      pattern: "import \\{[^}]*AlertTriangle[^}]*\\} from 'lucide-react'"
---

<objective>
redesign/15-daily-report SW3 변환 wave — DailyReportPage.tsx 의 데스크톱 isDesktop 분기 (line 365~405) + DailyPortraitPreview 외곽 wrapper (line 461~741) + DailyCalibMarker (line 744~767) 3 영역을 SW1 에서 정의된 .desktop-* / .daily-portrait-* class 로 변환한다.

Purpose: 이미지 좌표 캘리브 시스템 (15 step / FINGER_OFFSET / localStorage IO / clientToImgPct / 터치/마우스 핸들러) 의 동작은 1 byte 도 건드리지 않고, "껍데기 (외곽 wrapper / img / overlay area / 안내 바 / 버튼 / 마커) 만" components.css 토큰화. fontSize 9·10·11 격상 + ⚠ → AlertTriangle 교체 + 옛 var(--bg|t1|t2|bd) 폐기까지 동반.

Output: cha-bio-safety/src/pages/DailyReportPage.tsx 1 파일 (797 → ~720 lines 예상). atomic commit 1건.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@./CLAUDE.md
@./CLAUDE.local.md
@cha-bio-safety/docs/redesign-context/15-daily-report/wave-7-tsx-conversion-checklist.md
@cha-bio-safety/docs/redesign-context/15-daily-report/sketch-wave-5-desktop-layout.html
@cha-bio-safety/docs/redesign-context/15-daily-report/sketch-wave-6-portrait-preview-wrapper.html
@cha-bio-safety/src/styles/components.css
@cha-bio-safety/src/pages/DailyReportPage.tsx

<memory_anchors>
다음 메모리 룰 7건을 task action 안에서 반드시 준수한다:
- `feedback_planner_prompt_sketch_verbatim` — sketch CSS / source code 인용은 grep 추출 verbatim. 추측 token 금지.
- `feedback_sketch_realistic_data` — 데이터 분기 / 핸들러 / state / 좌표 계산 로직 1 byte 변경 금지. className 만 변환.
- `feedback_tsx_wave_emoji_dot_gap` — alias sed 만으로는 부족. 이모지 0 + JSX 마크업 추가 까지 verify gate 강제.
- `feedback_tsx_wave_stat_card_drift` — source outline 패턴 보존 + sketch 새 패턴 누락 0. plan 안 verbatim 인용 + verify gate 권장.
- `feedback_tailwind_w8_h8_is_48px` — w-8/h-8 = 48px (32 아님). className 채택 시 함정 회피, AlertTriangle 은 size={14} prop 사용.
- `feedback_check_branch_before_edit` — 현재 redesign/15-daily-report 확인 완료. main 단일-trunk 운영 — main 아님 + dirty 아님 확인 후 작업.
- `feedback_cbc7119_design_never_wrangler` — 이 워크트리에서 wrangler 명령 절대 금지. push 후 cbc7119-preview 자동 배포만.
- `feedback_avoid_premature_confirmation` — "거의 일치" 같은 자신감 표현 금지. 결과는 verify gate grep 결과로 사용자가 판단.
</memory_anchors>

<source_truth>
SW1 commit 후 components.css 의 .desktop-* / .daily-portrait-* class 정의는 이미 박제됨. line 310~497 의 30개 class 가 source-of-truth. TSX 의 className 은 본 fence 의 selector 와 verbatim 매칭.

### W5 데스크톱 (5 class — components.css line 310~351 verbatim)

```css
.desktop-layout {
  display: flex; flex-direction: row;
  height: 100%; overflow: hidden;
  background: var(--surface-page);
}
.desktop-edit-panel {
  flex: 1; overflow: auto;
  padding: 24px 32px;
  display: flex; flex-direction: column; gap: 16px;
  background: var(--surface-page);
}
.desktop-edit-panel-header {
  display: flex; align-items: center;
  justify-content: flex-end;
  margin-bottom: 8px;             /* source 20 → 8 (§1.3 spacing 분기 LOCKED) */
}
.desktop-portrait-wrapper {
  aspect-ratio: 210 / 297;
  height: 100%; flex-shrink: 0;
  border-left: 1px solid var(--border-default);
  background: var(--surface-page);
  position: relative;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.desktop-portrait-print-label {
  position: absolute; top: 8px; left: 50%;
  transform: translateX(-50%);
  font-size: 12px;                /* source 11 → 12 격상 */
  color: var(--text-secondary);
  font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.06em;
  line-height: 1;
  pointer-events: none; z-index: 5;
  white-space: nowrap;
}
```

### W6 DailyPortraitPreview wrapper (22 class — components.css line 353~495 verbatim, 핵심 인용)

```css
.daily-portrait-wrapper {
  width: 100%; height: 100%;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface-page);
  position: relative;
}
.daily-portrait-image {
  max-width: 100%; max-height: 100%;
  object-fit: contain;
  box-shadow: 0 4px 24px rgba(0,0,0,0.3);
  border-radius: 4px;
  background: #fff;
  display: block;
}
.daily-portrait-overlay-area {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.daily-portrait-overlay-area--calib {
  pointer-events: auto;
  cursor: crosshair;
  touch-action: none;
}
.daily-portrait-calib-bar {
  position: absolute;
  top: 8px; left: 50%; transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: #fff;
  padding: 10px 20px; border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  display: flex; align-items: center; gap: 16px;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}
.daily-portrait-calib-bar-step  { width: 24px; height: 24px; border-radius: 50%; font-size: 14px; ... } /* source 12 → 14 */
.daily-portrait-calib-bar-label { font-size: 14px; color: #fff; font-weight: 700; line-height: 1; }
.daily-portrait-calib-bar-coord { font-size: 14px; color: #aaa; font-weight: 400; line-height: 1; } /* source 11 → 14 W6 OQ #1 */
.daily-portrait-calib-confirm   { background: var(--status-safe-bar); color: var(--text-on-accent); font-size: 14px; ... } /* source 13 → 14 */
.daily-portrait-calib-cancel    { background: rgba(255,255,255,0.15); color: #fff; font-size: 12px; ... }
.daily-portrait-setup-btn         { position: absolute; bottom: 12px; right: 12px; font-size: 12px; ... display: inline-flex; gap: 6px; }
.daily-portrait-setup-btn--ready  { background: rgba(0, 0, 0, 0.6); }
.daily-portrait-setup-btn--missing{ background: rgba(239, 68, 68, 0.9); }
.daily-portrait-calib-marker            { position: absolute; transform: translate(-50%, -50%); pointer-events: none; z-index: 5; }
.daily-portrait-calib-marker-crosshair-h{ position: absolute; left: -20px; top: -1px; width: 40px; height: 2px; opacity: 0.8; }
.daily-portrait-calib-marker-crosshair-v{ position: absolute; top: -20px; left: -1px; width: 2px; height: 40px; opacity: 0.8; }
.daily-portrait-calib-marker-dot        { width: 16px; height: 16px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.4); font-size: 12px; font-weight: 900; color: #fff; position: absolute; left: 0; top: 0; transform: translate(-50%,-50%); line-height: 1; } /* source 10 → 12 */
.daily-portrait-calib-marker-dot--active{ width: 20px; height: 20px; }
```

### source TSX 현재 inline style (line 367~767, 변환 대상)

핵심 grep 추출:

| source line | source inline style | 변환 후 className |
|-------------|---------------------|-------------------|
| 367 | `<div style={{display:'flex', flexDirection:'row', height:'100%', overflow:'hidden', background:'var(--bg)'}}>` | `<div className="desktop-layout">` |
| 369 | `<div style={{flex:1, overflow:'auto', padding:'24px 32px'}}>` | `<div className="desktop-edit-panel">` |
| 371 | `<div style={{display:'flex', alignItems:'center', justifyContent:'flex-end', marginBottom:20}}>` | `<div className="desktop-edit-panel-header">` |
| 378~386 | `<div style={{aspectRatio:'210/297', height:'100%', flexShrink:0, borderLeft, overflow:'hidden', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative'}}>` | `<div className="desktop-portrait-wrapper">` |
| 387~394 | `<div style={{position:'absolute', top:8, left:0, right:0, textAlign:'center', fontSize:11, color:'var(--t2)', fontWeight:700, textTransform:'uppercase', pointerEvents:'none', zIndex:5}}>인쇄 미리보기</div>` | `<div className="desktop-portrait-print-label">인쇄 미리보기</div>` |
| 609~618 | `<div ref={containerRef} style={{width:'100%', height:'100%', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', position:'relative'}}>` | `<div ref={containerRef} className="daily-portrait-wrapper">` |
| 619~630 | `<img ref={imgRef} src="/templates/preview/daily-1.png" alt="" onLoad={measure} style={{maxWidth:'100%', maxHeight:'100%', objectFit:'contain', boxShadow:'0 4px 24px rgba(0,0,0,0.3)', borderRadius:4, background:'#fff'}} />` | `<img ref={imgRef} src="/templates/preview/daily-1.png" alt="" onLoad={measure} className="daily-portrait-image" />` |
| 634~646 | `<div onClick={calibMode?onCalibClick:undefined} onTouchStart=... onTouchMove=... onTouchEnd=... style={{position:'absolute', left:imgRect.left, top:imgRect.top, width:imgRect.width, height:imgRect.height, pointerEvents:calibMode?'auto':'none', cursor:calibMode?'crosshair':'default', touchAction:calibMode?'none':'auto'}}>` | `<div className={\`daily-portrait-overlay-area ${calibMode ? 'daily-portrait-overlay-area--calib' : ''}\`} style={{ left: imgRect.left, top: imgRect.top, width: imgRect.width, height: imgRect.height }} onClick={...} onTouchStart={...} onTouchMove={...} onTouchEnd={...}>` (좌표 dynamic 이므로 left/top/width/height inline 잔존, 나머지는 class 가 inset:0 / pointer-events / cursor / touch-action 처리) |
| 692~700 | 캘리브 안내 바 외곽 `<div style={{position:absolute, top:8, left:'50%', transform:'translateX(-50%)', background:'rgba(0,0,0,0.9)', color:'#fff', padding:'10px 20px', borderRadius:10, fontSize:14, fontWeight:700, display:'flex', alignItems:'center', gap:16, zIndex:10, boxShadow:'0 4px 12px rgba(0,0,0,0.3)', whiteSpace:'nowrap'}}>` | `<div className="daily-portrait-calib-bar">` |
| 701~706 | step badge `<span style={{width:24, height:24, borderRadius:'50%', background:DAILY_CALIB_STEPS[calibStep].color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0}}>{calibStep+1}</span>` | `<span className="daily-portrait-calib-bar-step" style={{ background: DAILY_CALIB_STEPS[calibStep].color }}>{calibStep + 1}</span>` (dynamic background 만 inline) |
| 707 | step label `<span>{DAILY_CALIB_STEPS[calibStep].label}</span>` | `<span className="daily-portrait-calib-bar-label">{DAILY_CALIB_STEPS[calibStep].label}</span>` |
| 708~710 | 좌표 `<span style={{fontSize:11, color:'#aaa'}}>{activePoint ? \`(${activePoint.x.toFixed(1)}, ${activePoint.y.toFixed(1)})\` : '터치/클릭'}</span>` | `<span className="daily-portrait-calib-bar-coord">{activePoint ? \`(${activePoint.x.toFixed(1)}, ${activePoint.y.toFixed(1)})\` : '터치/클릭'}</span>` |
| 712~715 | 확인 `<button onClick={confirmPoint} style={{background:'#22c55e', border:'none', color:'#fff', padding:'6px 16px', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:700}}>확인</button>` | `<button type="button" onClick={confirmPoint} className="daily-portrait-calib-confirm">확인</button>` |
| 717~720 | 취소 `<button onClick={() => { setCalibMode(false); setCalibStep(0); setCalibPoints([]); setActivePoint(null) }} style={{background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', padding:'6px 14px', borderRadius:6, cursor:'pointer', fontSize:12}}>취소</button>` | `<button type="button" onClick={() => { setCalibMode(false); setCalibStep(0); setCalibPoints([]); setActivePoint(null) }} className="daily-portrait-calib-cancel">취소</button>` |
| 726~737 | 위치 설정 `<button onClick={() => { setCalibMode(true); setCalibStep(0); setCalibPoints([]); setActivePoint(null) }} style={{position:'absolute', bottom:12, right:12, background: hasCalib ? 'rgba(0,0,0,0.6)' : 'rgba(239,68,68,0.9)', color:'#fff', border:'none', padding:'8px 16px', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', zIndex:10}}>{hasCalib ? '위치 재설정' : '⚠ 위치 설정'}</button>` | `<button type="button" onClick={() => { setCalibMode(true); setCalibStep(0); setCalibPoints([]); setActivePoint(null) }} className={\`daily-portrait-setup-btn ${hasCalib ? 'daily-portrait-setup-btn--ready' : 'daily-portrait-setup-btn--missing'}\`}>{hasCalib ? '위치 재설정' : (<><AlertTriangle size={14} /> 위치 설정</>)}</button>` |
| 746~751 | DailyCalibMarker 외곽 `<div style={{position:'absolute', left:\`${x}%\`, top:\`${y}%\`, transform:'translate(-50%, -50%)', pointerEvents:'none'}}>` | `<div className="daily-portrait-calib-marker" style={{ left: \`${x}%\`, top: \`${y}%\` }}>` (transform / pointer-events / position 은 class — left/top dynamic 만 inline) |
| 752 | 가로 십자선 `<div style={{position:'absolute', left:-20, top:0, width:40, height:2, background:color, opacity:0.8}} />` | `<div className="daily-portrait-calib-marker-crosshair-h" style={{ background: color }} />` (color dynamic 만 inline) |
| 753 | 세로 십자선 `<div style={{position:'absolute', top:-20, left:0, width:2, height:40, background:color, opacity:0.8}} />` | `<div className="daily-portrait-calib-marker-crosshair-v" style={{ background: color }} />` |
| 754~764 | dot `<div style={{width:active?20:16, height:active?20:16, borderRadius:'50%', background:color, border:'2px solid #fff', boxShadow:'0 2px 8px rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:900, color:'#fff', transform:'translate(-50%, -50%)', position:'absolute', left:0, top:0}}>{label}</div>` | `<div className={\`daily-portrait-calib-marker-dot ${active ? 'daily-portrait-calib-marker-dot--active' : ''}\`} style={{ background: color }}>{label}</div>` (background dynamic 만 inline, size 는 --active modifier 가 처리) |

source 가 SW2 commit 이후 line 번호 (797 lines) 기준. 변환 후 inline style 제거로 ~720 lines 예상.
</source_truth>

</context>

<tasks>

<task type="auto">
  <name>Task 1: DailyReportPage.tsx 데스크톱 + DailyPortraitPreview + DailyCalibMarker 변환 (SW3)</name>
  <files>cha-bio-safety/src/pages/DailyReportPage.tsx</files>

  <action>
**선행 게이트 (실행 전 0초)**

1. `git -C /Users/jykevin/Documents/cbc7119-design status --short` — dirty 면 즉시 중단하고 사용자에게 보고.
2. `git -C /Users/jykevin/Documents/cbc7119-design rev-parse --abbrev-ref HEAD` — `redesign/15-daily-report` 가 아니면 중단.
3. `wc -l cha-bio-safety/src/pages/DailyReportPage.tsx` — 797 lines 확인 (SW2 commit 결과). 다른 수면 plan 컨텍스트와 불일치 → 사용자에게 보고.
4. wrangler 명령 / `npm run deploy` 절대 금지 (CLAUDE.local.md).

**변환 영역 A — 데스크톱 메인 렌더 (line 365~405)**

source line 365~405 의 `if (isDesktop) { return (...) }` 분기를 다음 5건으로 변환:

A-1. line 367 wrapper:
```tsx
// BEFORE
<div style={{ display: 'flex', flexDirection: 'row', height: '100%', overflow: 'hidden', background: 'var(--bg)' }}>
// AFTER
<div className="desktop-layout">
```

A-2. line 369 좌측 패널:
```tsx
// BEFORE
<div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
// AFTER
<div className="desktop-edit-panel">
```

A-3. line 371 좌측 dateNav header:
```tsx
// BEFORE
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 20 }}>
// AFTER
<div className="desktop-edit-panel-header">
```
주의: marginBottom 20 → 8 은 components.css 가 처리. inline 제거.

A-4. line 378~386 우측 portrait container:
```tsx
// BEFORE
<div style={{
  aspectRatio: '210 / 297',
  height: '100%', flexShrink: 0,
  borderLeft: '1px solid var(--bd)',
  overflow: 'hidden',
  background: 'var(--bg)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  position: 'relative',
}}>
// AFTER
<div className="desktop-portrait-wrapper">
```

A-5. line 387~394 "인쇄 미리보기" 라벨:
```tsx
// BEFORE
<div style={{
  position: 'absolute', top: 8, left: 0, right: 0,
  textAlign: 'center', fontSize: 11, color: 'var(--t2)',
  fontWeight: 700, textTransform: 'uppercase',
  pointerEvents: 'none', zIndex: 5,
}}>
  인쇄 미리보기
</div>
// AFTER
<div className="desktop-portrait-print-label">인쇄 미리보기</div>
```
fontSize 11 → 12 / color var(--t2) → var(--text-secondary) 은 class 가 처리. 카피 "인쇄 미리보기" verbatim 보존.

A-6. line 395~401 `<DailyPortraitPreview ... />` 호출은 그대로 (props 5종 verbatim).

**변환 영역 B — DailyPortraitPreview 외곽 wrapper (line 461~741)**

B-0. props 시그니처 (line 461~477) verbatim 보존. 1 byte 변경 금지.

B-1. line 609~618 외곽 wrapper:
```tsx
// BEFORE
<div
  ref={containerRef}
  style={{
    width: '100%', height: '100%',
    overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg)', position: 'relative',
  }}
>
// AFTER
<div ref={containerRef} className="daily-portrait-wrapper">
```

B-2. line 619~630 `<img>`:
```tsx
// BEFORE
<img
  ref={imgRef}
  src="/templates/preview/daily-1.png"
  alt=""
  onLoad={measure}
  style={{
    maxWidth: '100%', maxHeight: '100%',
    objectFit: 'contain',
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    borderRadius: 4, background: '#fff',
  }}
/>
// AFTER
<img
  ref={imgRef}
  src="/templates/preview/daily-1.png"
  alt=""
  onLoad={measure}
  className="daily-portrait-image"
/>
```
src `/templates/preview/daily-1.png` 1 byte 도 변경 금지.

B-3. line 633~688 overlay area `{imgRect && imgRect.width > 0 && (<div ...>...)}`:

좌표 (imgRect.left/top/width/height) 는 dynamic 이므로 inline 잔존. 나머지 (inset 가 아닌 좌표라서 inset:0 처리 X — class 의 position:absolute 만 활용하고 left/top/width/height 는 inline 유지) + pointer-events / cursor / touch-action 은 modifier class 가 처리.

```tsx
// BEFORE
<div
  onClick={calibMode ? onCalibClick : undefined}
  onTouchStart={calibMode ? onCalibTouchStart : undefined}
  onTouchMove={calibMode ? onCalibTouchMove : undefined}
  onTouchEnd={calibMode ? onCalibTouchEnd : undefined}
  style={{
    position: 'absolute',
    left: imgRect.left, top: imgRect.top,
    width: imgRect.width, height: imgRect.height,
    pointerEvents: calibMode ? 'auto' : 'none',
    cursor: calibMode ? 'crosshair' : 'default',
    touchAction: calibMode ? 'none' : 'auto',
  }}
>
// AFTER
<div
  className={`daily-portrait-overlay-area ${calibMode ? 'daily-portrait-overlay-area--calib' : ''}`}
  onClick={calibMode ? onCalibClick : undefined}
  onTouchStart={calibMode ? onCalibTouchStart : undefined}
  onTouchMove={calibMode ? onCalibTouchMove : undefined}
  onTouchEnd={calibMode ? onCalibTouchEnd : undefined}
  style={{
    position: 'absolute',                       /* class 의 inset:0 와 충돌 회피용 잔존 */
    left: imgRect.left, top: imgRect.top,
    width: imgRect.width, height: imgRect.height,
  }}
>
```
**주의**: components.css `.daily-portrait-overlay-area` 가 `inset: 0` 으로 정의되어 있으나, 본 영역은 imgRect 기반 dynamic 좌표가 필요하므로 inline left/top/width/height 가 inset:0 을 override 한다. position:absolute 는 class 안에서 이미 `inset:0` 효과로 implicit 이지만 명시적으로 잔존시켜도 무방.

대안 (선호): inline style 에 position:absolute 도 제거 가능. class 의 `inset: 0` 가 position:absolute 를 implicit shorthand 로 줘서 동작. 단 만약 components.css 정의가 inset 만 있고 position 이 없으면 inline 유지 필수.

→ components.css line 370~374 확인: `position: absolute; inset: 0;` 가 모두 박제됨 (W6 sketch verbatim). 따라서 position:absolute 도 inline 제거 가능. left/top/width/height 만 inline 잔존.

**최종 변환**:
```tsx
<div
  className={`daily-portrait-overlay-area ${calibMode ? 'daily-portrait-overlay-area--calib' : ''}`}
  onClick={calibMode ? onCalibClick : undefined}
  onTouchStart={calibMode ? onCalibTouchStart : undefined}
  onTouchMove={calibMode ? onCalibTouchMove : undefined}
  onTouchEnd={calibMode ? onCalibTouchEnd : undefined}
  style={{
    left: imgRect.left, top: imgRect.top,
    width: imgRect.width, height: imgRect.height,
  }}
>
```

B-3a. line 649~675 overlay 데이터 렌더 (오버레이 항목 `{!calibMode && calib && overlayItems.map(...)}`):
- isArea (line 654~663) 분기 `<div style={{position:'absolute', left:..., top:..., width:'75%', ...textStyle(10), fontWeight:700}}>` 와
- single (line 665~674) 분기 `<span style={{position:'absolute', left:..., top:..., transform:'translate(-50%,-50%)', ...textStyle(isLarge?12:10), fontWeight:700, textAlign:'center', whiteSpace:'nowrap'}}>` 는
- **변환 영역 외** (좌표 + fontSize 가 모두 dynamic, calib JSON 의 x/y/key 에 따라 결정). 1 byte 변경 0. inline style verbatim 보존.

B-3b. line 678~681 마커 렌더 `<DailyCalibMarker key={i} x={pt.x} y={pt.y} color={DAILY_CALIB_STEPS[i].color} label={\`${i + 1}\`} />` verbatim 보존.

B-3c. line 683~686 드래그 중 마커 verbatim 보존.

B-4. line 691~722 캘리브 안내 바:

```tsx
// BEFORE
{calibMode && (
  <div style={{
    position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.9)', color: '#fff',
    padding: '10px 20px', borderRadius: 10,
    fontSize: 14, fontWeight: 700,
    display: 'flex', alignItems: 'center', gap: 16, zIndex: 10,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    whiteSpace: 'nowrap',
  }}>
    <span style={{
      width: 24, height: 24, borderRadius: '50%',
      background: DAILY_CALIB_STEPS[calibStep].color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, flexShrink: 0,
    }}>{calibStep + 1}</span>
    <span>{DAILY_CALIB_STEPS[calibStep].label}</span>
    <span style={{ fontSize: 11, color: '#aaa' }}>
      {activePoint ? `(${activePoint.x.toFixed(1)}, ${activePoint.y.toFixed(1)})` : '터치/클릭'}
    </span>
    {activePoint && (
      <button onClick={confirmPoint} style={{
        background: '#22c55e', border: 'none', color: '#fff',
        padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700,
      }}>확인</button>
    )}
    <button onClick={() => { setCalibMode(false); setCalibStep(0); setCalibPoints([]); setActivePoint(null) }} style={{
      background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
      padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
    }}>취소</button>
  </div>
)}

// AFTER
{calibMode && (
  <div className="daily-portrait-calib-bar">
    <span
      className="daily-portrait-calib-bar-step"
      style={{ background: DAILY_CALIB_STEPS[calibStep].color }}
    >{calibStep + 1}</span>
    <span className="daily-portrait-calib-bar-label">{DAILY_CALIB_STEPS[calibStep].label}</span>
    <span className="daily-portrait-calib-bar-coord">
      {activePoint ? `(${activePoint.x.toFixed(1)}, ${activePoint.y.toFixed(1)})` : '터치/클릭'}
    </span>
    {activePoint && (
      <button type="button" onClick={confirmPoint} className="daily-portrait-calib-confirm">확인</button>
    )}
    <button
      type="button"
      onClick={() => { setCalibMode(false); setCalibStep(0); setCalibPoints([]); setActivePoint(null) }}
      className="daily-portrait-calib-cancel"
    >취소</button>
  </div>
)}
```

격상 매핑:
- step badge fontSize 12 → 14 (class 가 처리)
- 좌표 fontSize 11 → 14 (class 가 처리, W6 OQ #1 LOCKED)
- 확인 버튼 fontSize 13 → 14, background #22c55e → var(--status-safe-bar) (class 가 처리)
- 취소 fontSize 12 verbatim, type="button" 추가 (form submit 사고 방지)

카피 "확인" / "취소" / "터치/클릭" verbatim 보존.

B-5. line 724~738 위치 설정 버튼:

```tsx
// BEFORE
{!calibMode && (
  <button
    onClick={() => { setCalibMode(true); setCalibStep(0); setCalibPoints([]); setActivePoint(null) }}
    style={{
      position: 'absolute', bottom: 12, right: 12,
      background: hasCalib ? 'rgba(0,0,0,0.6)' : 'rgba(239,68,68,0.9)',
      color: '#fff', border: 'none',
      padding: '8px 16px', borderRadius: 8,
      fontSize: 12, fontWeight: 700, cursor: 'pointer', zIndex: 10,
    }}
  >
    {hasCalib ? '위치 재설정' : '⚠ 위치 설정'}
  </button>
)}

// AFTER
{!calibMode && (
  <button
    type="button"
    onClick={() => { setCalibMode(true); setCalibStep(0); setCalibPoints([]); setActivePoint(null) }}
    className={`daily-portrait-setup-btn ${hasCalib ? 'daily-portrait-setup-btn--ready' : 'daily-portrait-setup-btn--missing'}`}
  >
    {hasCalib ? '위치 재설정' : (<><AlertTriangle size={14} /> 위치 설정</>)}
  </button>
)}
```

핵심 변경:
- ⚠ (U+26A0) 글리프 → `<AlertTriangle size={14} />` lucide JSX (OQ W1 #7 LOCKED)
- "위치 설정" 안 leading space 제거, AlertTriangle 와 텍스트 사이 공백 1칸 보존
- type="button" 추가
- "위치 재설정" / "위치 설정" 카피 verbatim

**변환 영역 C — DailyCalibMarker (line 744~767)**

C-1. line 744 컴포넌트 시그니처 verbatim 보존: `function DailyCalibMarker({ x, y, color, label, active }: { x: number; y: number; color: string; label: string; active?: boolean })`.

C-2. line 746~751 외곽 wrapper:
```tsx
// BEFORE
<div style={{
  position: 'absolute',
  left: `${x}%`, top: `${y}%`,
  transform: 'translate(-50%, -50%)',
  pointerEvents: 'none',
}}>
// AFTER
<div className="daily-portrait-calib-marker" style={{ left: `${x}%`, top: `${y}%` }}>
```
x/y dynamic 이므로 inline 잔존. transform / pointer-events / position 은 class.

C-3. line 752 가로 십자선:
```tsx
// BEFORE
<div style={{ position: 'absolute', left: -20, top: 0, width: 40, height: 2, background: color, opacity: 0.8 }} />
// AFTER
<div className="daily-portrait-calib-marker-crosshair-h" style={{ background: color }} />
```
주의: components.css 정의는 `top: -1px` (visually centered) 인데 source 는 `top: 0` 이다. 본 격차는 W6 sketch verbatim 변환 의도 (1px 시각 보정). 그대로 진행.

C-4. line 753 세로 십자선:
```tsx
// BEFORE
<div style={{ position: 'absolute', top: -20, left: 0, width: 2, height: 40, background: color, opacity: 0.8 }} />
// AFTER
<div className="daily-portrait-calib-marker-crosshair-v" style={{ background: color }} />
```
주의: components.css 정의 `left: -1px`. 동일 시각 보정. 그대로 진행.

C-5. line 754~764 dot:
```tsx
// BEFORE
<div style={{
  width: active ? 20 : 16, height: active ? 20 : 16,
  borderRadius: '50%', background: color,
  border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 10, fontWeight: 900, color: '#fff',
  transform: 'translate(-50%, -50%)',
  position: 'absolute', left: 0, top: 0,
}}>
  {label}
</div>
// AFTER
<div
  className={`daily-portrait-calib-marker-dot ${active ? 'daily-portrait-calib-marker-dot--active' : ''}`}
  style={{ background: color }}
>
  {label}
</div>
```
fontSize 10 → 12 + size 16/20 분기는 class 의 --active modifier 가 처리.

**lucide import 변경**

line 11 변경:
```tsx
// BEFORE
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'
// AFTER
import { ChevronLeft, ChevronRight, Download, AlertTriangle } from 'lucide-react'
```

**보존 (1 byte 변경 0)**

다음 영역 은 1 byte 도 건드리지 않는다:
- line 1~10 imports (단 line 11 lucide 만 AlertTriangle 추가)
- line 12~309 hooks / state / handler 7건 / debouncedSave / queries / useEffect / formContent (formContent 내 모바일 dateNav)
- line 310~360 formContent 본문 + dateNav 정의 (SW2 결과)
- line 401~425 isDesktop=false 분기 (모바일) — SW2 결과 그대로
- line 427~458 DAILY_CALIB_STEPS / FINGER_OFFSET / DAILY_CALIB_KEY / DailyCalibData / loadDailyCalib / saveDailyCalib verbatim
- line 461~477 DailyPortraitPreview props 시그니처 verbatim
- line 478~519 containerRef / imgRef / imgRect / calibMode / calibStep / calibPoints / activePoint / isDragging / measure / useEffect ResizeObserver / calib / hasCalib / clientToImgPct verbatim
- line 521~574 onCalibTouchStart / onCalibTouchMove / onCalibTouchEnd / advanceStep / confirmPoint / onCalibClick verbatim
- line 576~607 dateLabel 계산 / textStyle / LARGE_KEYS / overlayItems verbatim
- line 649~681 overlayItems.map(...) 안 inline style + DailyCalibMarker 호출 verbatim (좌표 dynamic 이라 className 화 불가)
- line 683~686 드래그 중 DailyCalibMarker 렌더 verbatim
- line 769~797 EditableCard 컴포넌트 verbatim (SW2 결과)

**다음 파일 / 디렉토리 diff 0**:
- cha-bio-safety/src/styles/components.css (변경 0)
- cha-bio-safety/src/App.tsx (변경 0)
- functions/ (변경 0)
- migrations/ (변경 0)
- public/templates/ (변경 0)
- cha-bio-safety/docs/redesign-context/15-daily-report/ (sketch / W7 checklist 변경 0)
- 다른 페이지 (cha-bio-safety/src/pages/*Page.tsx 중 DailyReportPage.tsx 외 변경 0)
- 다른 페이지 docs (cha-bio-safety/docs/redesign-context/{01~14,16~30}-*/ 변경 0)

**최종 commit**

```bash
git -C /Users/jykevin/Documents/cbc7119-design add cha-bio-safety/src/pages/DailyReportPage.tsx
git -C /Users/jykevin/Documents/cbc7119-design commit -m "feat(15-daily-report): SW3 DailyReportPage.tsx 데스크톱 + DailyPortraitPreview wrapper 변환 (W5 + W6 sketch, 캘리브 좌표 100% 보존)

- 데스크톱 isDesktop 분기 (line 365~405): desktop-layout / desktop-edit-panel / desktop-edit-panel-header / desktop-portrait-wrapper / desktop-portrait-print-label
- DailyPortraitPreview 외곽 wrapper (line 461~741): daily-portrait-wrapper / -image / -overlay-area / -overlay-area--calib / -calib-bar / -calib-bar-step / -calib-bar-label / -calib-bar-coord / -calib-confirm / -calib-cancel / -setup-btn / -setup-btn--ready / -setup-btn--missing
- DailyCalibMarker (line 744~767): daily-portrait-calib-marker / -crosshair-h / -crosshair-v / -dot / -dot--active (dynamic color/x/y/active 만 inline 잔존)
- lucide-react import: AlertTriangle 추가
- line 737 ⚠ 글리프 → <AlertTriangle size={14} /> JSX (OQ W1 #7 LOCKED)
- 폰트 격상: 인쇄 미리보기 11→12, 캘리브 step 12→14, 좌표 11→14 (W6 OQ #1), 확인 13→14, marker dot 10→12 (전체 9·10·11px 0건)
- 캘리브 좌표 시스템 (DAILY_CALIB_STEPS / FINGER_OFFSET / loadDailyCalib / saveDailyCalib / clientToImgPct / advanceStep / confirmPoint / 터치/마우스 핸들러) 1 byte 변경 0
- 모바일 분기 / formContent / dateNav / hooks / state / handlers 1 byte 변경 0 (단 lucide import 1줄 예외)
- src=/templates/preview/daily-1.png + props 5종 + DailyCalibMarker props 5종 verbatim 보존

memory: feedback_planner_prompt_sketch_verbatim / feedback_sketch_realistic_data / feedback_tsx_wave_emoji_dot_gap / feedback_tsx_wave_stat_card_drift / feedback_tailwind_w8_h8_is_48px / feedback_check_branch_before_edit / feedback_cbc7119_design_never_wrangler"
```
  </action>

  <verify>
    <automated>
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety &amp;&amp; \
echo "=== positive gates ===" &amp;&amp; \
echo "P1 lucide AlertTriangle import (=1):" &amp;&amp; grep -c "^import { ChevronLeft, ChevronRight, Download, AlertTriangle } from 'lucide-react'" src/pages/DailyReportPage.tsx &amp;&amp; \
echo "P2 AlertTriangle JSX 사용 (>=1):" &amp;&amp; grep -c "<AlertTriangle " src/pages/DailyReportPage.tsx &amp;&amp; \
echo "P3 desktop-* className (>=4):" &amp;&amp; grep -oE 'className="desktop-(layout|edit-panel|edit-panel-header|portrait-wrapper|portrait-print-label)"' src/pages/DailyReportPage.tsx | sort -u | wc -l &amp;&amp; \
echo "P4 daily-portrait-* className (>=12):" &amp;&amp; grep -oE 'daily-portrait-(wrapper|image|overlay-area|overlay-area--calib|calib-bar|calib-bar-step|calib-bar-label|calib-bar-coord|calib-confirm|calib-cancel|setup-btn|setup-btn--ready|setup-btn--missing|calib-marker|calib-marker-crosshair-h|calib-marker-crosshair-v|calib-marker-dot|calib-marker-dot--active)' src/pages/DailyReportPage.tsx | sort -u | wc -l &amp;&amp; \
echo "P5 DAILY_CALIB_STEPS 사용 (>=5):" &amp;&amp; grep -c "DAILY_CALIB_STEPS" src/pages/DailyReportPage.tsx &amp;&amp; \
echo "P6 FINGER_OFFSET 사용 (>=3):" &amp;&amp; grep -c "FINGER_OFFSET" src/pages/DailyReportPage.tsx &amp;&amp; \
echo "P7 loadDailyCalib + saveDailyCalib 사용 (>=3):" &amp;&amp; grep -cE "loadDailyCalib|saveDailyCalib" src/pages/DailyReportPage.tsx &amp;&amp; \
echo "P8 daily-1.png src (=1):" &amp;&amp; grep -c '/templates/preview/daily-1.png' src/pages/DailyReportPage.tsx &amp;&amp; \
echo "P9 props 5종 (각 >=1): date / todayText / tomorrowText / notes / personnel:" &amp;&amp; grep -cE "date: string|todayText: string|tomorrowText: string|notes: string|personnel\?:" src/pages/DailyReportPage.tsx &amp;&amp; \
echo "P10 카피 verbatim — 인쇄 미리보기:" &amp;&amp; grep -c "인쇄 미리보기" src/pages/DailyReportPage.tsx &amp;&amp; \
echo "P10 카피 verbatim — 확인 / 취소 / 위치 재설정 / 위치 설정 / 터치/클릭:" &amp;&amp; grep -cE ">확인<|>취소<|위치 재설정|위치 설정|터치/클릭" src/pages/DailyReportPage.tsx &amp;&amp; \
echo "P11 DailyCalibMarker props 5종 (=1 verbatim signature):" &amp;&amp; grep -c "x: number; y: number; color: string; label: string; active?: boolean" src/pages/DailyReportPage.tsx &amp;&amp; \
echo "P12 confirmPoint / advanceStep / clientToImgPct verbatim (>=3):" &amp;&amp; grep -cE "confirmPoint|advanceStep|clientToImgPct" src/pages/DailyReportPage.tsx &amp;&amp; \
echo "" &amp;&amp; \
echo "=== negative gates ===" &amp;&amp; \
echo "N1 ⚠ 글리프 (=0):" &amp;&amp; grep -c "⚠" src/pages/DailyReportPage.tsx &amp;&amp; \
echo "N2 linear-gradient (=0):" &amp;&amp; grep -c "linear-gradient(" src/pages/DailyReportPage.tsx &amp;&amp; \
echo "N3 status- prefix className (=0):" &amp;&amp; grep -cE 'className="[^"]*\\bstatus-[a-z]+' src/pages/DailyReportPage.tsx &amp;&amp; \
echo "N4 w-8 / h-8 className (=0):" &amp;&amp; grep -cE 'className="[^"]*\\b(w-8|h-8)\\b' src/pages/DailyReportPage.tsx &amp;&amp; \
echo "N5 fontSize 9·10·11 in line 365~767 (=0):" &amp;&amp; sed -n '365,767p' src/pages/DailyReportPage.tsx | grep -v '^ *//' | grep -cE 'fontSize: *(9|10|11)\\b' &amp;&amp; \
echo "N6 옛 토큰 var(--bg|t1|t2|t3|bd|bd2|acl|bg2|bg3) in 변환 영역 (line 365~405 + 609~767, =0, dynamic 색 제외):" &amp;&amp; \
( sed -n '365,405p' src/pages/DailyReportPage.tsx; sed -n '609,767p' src/pages/DailyReportPage.tsx ) | grep -v '^ *//' | grep -cE "var\\(--(bg|bg2|bg3|bd|bd2|t1|t2|t3|acl)\\)" &amp;&amp; \
echo "N7 components.css diff (빈 출력):" &amp;&amp; git -C .. diff --name-only -- cha-bio-safety/src/styles/components.css | wc -l &amp;&amp; \
echo "N8 App.tsx / functions / migrations / public/templates diff (빈 출력):" &amp;&amp; git -C .. diff --name-only -- cha-bio-safety/src/App.tsx functions/ migrations/ public/templates/ | wc -l &amp;&amp; \
echo "N9 다른 페이지 diff (=0 changed pages besides DailyReportPage.tsx):" &amp;&amp; git -C .. diff --name-only -- 'cha-bio-safety/src/pages/*Page.tsx' | grep -v "DailyReportPage.tsx" | wc -l &amp;&amp; \
echo "N10 docs diff — 15-daily-report 외 (=0):" &amp;&amp; git -C .. diff --name-only -- 'cha-bio-safety/docs/redesign-context/' | grep -v "15-daily-report/" | wc -l &amp;&amp; \
echo "" &amp;&amp; \
echo "=== build gates ===" &amp;&amp; \
echo "B1 tsc --noEmit:" &amp;&amp; npx tsc --noEmit 2>&amp;1 | tail -5 &amp;&amp; \
echo "B2 npm run build:" &amp;&amp; npm run build 2>&amp;1 | tail -5
    </automated>
  </verify>

  <done>
- P1=1, P2≥1, P3≥4, P4≥12, P5≥5, P6≥3, P7≥3, P8=1, P9≥5, P10 "인쇄 미리보기" ≥1 + 카피 5종 ≥5, P11=1, P12≥3.
- N1=0, N2=0, N3=0, N4=0, N5=0, N6=0, N7=0 (components.css unchanged), N8=0, N9=0 (only DailyReportPage.tsx 변경), N10=0.
- B1 tsc --noEmit error 0건, B2 npm run build success.
- atomic commit 1건 (`feat(15-daily-report): SW3 ...`) — SHA + 메시지 메인 핸들러 텍스트로 출력.
- 캘리브 좌표 시스템 / props 시그니처 / 핸들러 / state / src URL 1 byte 변경 0 (P5/P6/P7/P8/P9/P11/P12 + 보존 영역 git diff 검수로 확인).
- 사용자에게 보고: "거의 일치" 같은 자신감 표현 금지 (feedback_avoid_premature_confirmation). grep 결과 + tsc/build PASS 만 사실 그대로 보고.
- 디자인 작업이므로 wrangler / npm run deploy 절대 호출 금지 (CLAUDE.local.md / feedback_cbc7119_design_never_wrangler). main 머지 / 푸시는 사용자 컨펌 후 (feedback_deploy_test).
  </done>
</task>

</tasks>

<verification>
plan 안 task 1 의 verify gate 모두 PASS 시 SW3 완결. 추가 wave 없음 — SW4 (verify gate / 통합 검수) 는 별도 quick 으로 진행 예정.

핵심 사실 (executor 가 보고할 텍스트):
- DailyReportPage.tsx line count: 797 → ~720 (예상치, ±10 허용)
- atomic commit 1건
- positive gates 12건 + negative gates 10건 + build gates 2건 모두 expected value 일치
- 캘리브 좌표 시스템 1 byte 변경 0 (line 427~458 / 478~574 / 576~607 / 649~681 / 683~686 git diff 빈 출력)
</verification>

<success_criteria>
- cha-bio-safety/src/pages/DailyReportPage.tsx 1 파일 수정.
- W5 + W6 sketch verbatim 변환 완결 — desktop-* 5 class + daily-portrait-* 18 class (overlay-area + setup-btn + calib-marker modifier 포함).
- 폰트 격상 5건 (인쇄 미리보기 12 / step 14 / 좌표 14 / 확인 14 / dot 12) — 변환 영역 9·10·11px 0건.
- ⚠ 글리프 0건 + AlertTriangle JSX ≥1건.
- 캘리브 좌표 시스템 / props / 핸들러 / state / src URL 1 byte 변경 0.
- 모바일 / formContent / hooks 1 byte 변경 0 (단 lucide import 1줄 예외).
- components.css 변경 0 / App.tsx 변경 0 / functions / migrations / public/templates 변경 0 / 다른 페이지 변경 0 / 다른 페이지 docs 변경 0.
- npx tsc --noEmit PASS / npm run build PASS.
- atomic commit 1건 (`feat(15-daily-report): SW3 DailyReportPage.tsx 데스크톱 + DailyPortraitPreview wrapper 변환 (W5 + W6 sketch, 캘리브 좌표 100% 보존)`).
- 사용자 보고 시 "거의 일치" 류 자신감 표현 금지 — grep 결과만 사실 그대로 출력.
</success_criteria>

<output>
After completion, create `.planning/quick/260521-agk-redesign-15-daily-report-sw3-dailyreport/260521-agk-SUMMARY.md` per `$HOME/.claude/get-shit-done/templates/summary.md`.
</output>
