---
phase: 260528-jey-phase-b-wave-9-floorplan
plan: 01
subsystem: redesign/phase-b-sweep
status: complete
tags: [floorplan, inline-style-to-tailwind, no-op-refactor, phase-b-tier-1-wave-9, marker-dynamic-coord-option-n, vendor-prefix-as-any-option-n, svg-textshadow-option-n, fontfamily-inherit-option-n, balloon-positioning-option-n, atomic-single-commit, chrome-unified-rule-preserve]
requires:
  - 260528-irl-phase-b-wave-8 완료 (소화기 atomic, de15e07)
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
  - FloorPlanPage.tsx Phase B 완료 (25 → 12 잔존, single atomic — 옵션 X+P+M+색변수N+좌표 N+vendor N+SVG N+fontFamily N 승계)
  - Phase B Tier 1 Wave 9 (도면 — chrome 통일 룰 페이지) 완료
  - **chrome 통일 룰 페이지 첫 사례** — 02 InspectionPage / 06 FloorPlanPage 양쪽 모달 chrome 룰 적용된 페이지. 변환 시 chrome 4종 (backdrop / modal box / textarea / button) 룰 자동 보존
  - **마커 좌표 동적 잔존 패턴 박제** — px/py 동적 + transform scale 동적 + conditional zIndex/outline = 옵션 N 잔존. tailwind arbitrary `[left:${px}px]` 등은 안티 (runtime string interpolation)
  - **SVG `<text style={{ textShadow }}>` 잔존 패턴 박제** — SVG element 의 textShadow 는 tailwind class 안 됨. inline style 유일 수단
  - **fontFamily: 'inherit' 잔존 패턴 박제** — `[font-family:inherit]` arbitrary 가능하나 textarea/input 에 적용 시 시각 byte-exact 보장 어려움 (Wave 5/7 precedent). 옵션 N 유지
affects:
  - src/pages/FloorPlanPage.tsx
tech-stack:
  added: []
  patterns:
    - "옵션 X (정확값 arbitrary) — `bg-[#ef4444]` / `bg-[rgba(59,130,246,0.85)]` / `bg-[rgba(239,68,68,0.9)]` / `bg-[rgba(0,0,0,0.55)]` / `bg-[rgba(0,0,0,0.6)]` / `border-[1.5px]` / `text-[9px]` / `text-[11px]` / `text-[14px]` / `py-[6px]` / `py-[7px]` / `w-[90%]` / `max-w-[320px]` / `min-h-[180px]` / `h-[72px]` / `shadow-[0_-8px_32px_rgba(0,0,0,0.4)]` / `z-[60]` 정확값 보존"
    - "옵션 P — `leading-none` 명시 보존 (marker badge `lineHeight:1`)"
    - "옵션 N 잔존 12건 — 좌표/transform/conditional 동적 (L1041 marker container + L1080 marker badge + L1308 balloon + L1320 arrow) + vendor prefix as any (L1013) + SVG textShadow (L1104) + fontFamily inherit 그룹 (L1846/L1897/L2118/L2137/L2147/L2167)"
    - "**chrome 통일 룰 페이지 무중단 보존** — InspectionPage 와 동일한 모달 chrome 룰 (backdrop `absolute inset-0 z-[50] flex items-center justify-center bg-[rgba(0,0,0,0.6)]` / modal box `relative w-[90%] max-w-[340px] ... bg-surface-raised border border-border-default rounded-md p-5` / textarea `flex-1 rounded-sm bg-surface-page border border-border-default text-text-primary text-label p-2.5 resize-none outline-none box-border` / button `flex-1 h-input rounded-sm ...`) — 본 wave 가 inspection-modal-chrome-rules.md 룰 보존하면서 inline → tailwind 변환 첫 사례"
    - "shadow-[0_-8px_32px_rgba(0,0,0,0.4)] underscore = 공백 패턴 — `boxShadow: '0 -8px 32px rgba(0,0,0,0.4)'` → tailwind shadow- arbitrary. 공백 underscore 치환 / 음수 부호 그대로 / rgba 공백 그대로 (rgb 4-arg)"
    - "h-[72px] arbitrary — `height: 72` 단독 변환. h-72 (=288px tailwind default) 함정 회피. config override 무관 (h-72 자체 안 씀)"
    - "bg-[rgba(...,N)] arbitrary — rgb 의 정확한 alpha 보존 (0.85 / 0.9 / 0.55 / 0.6). underscore 없음 (rgba 콤마 separator)"
    - "marker badge multiline 정적 → className 통합 — `position:absolute, top:-8, right:-8, w:12, h:12, bg:#ef4444, border:1.5px white, radius:50%, flex center, text:9px black white, leading:1, pointer-events:none` 14-prop → `absolute -top-2 -right-2 w-3 h-3 bg-[#ef4444] border-[1.5px] border-white rounded-full flex items-center justify-center text-[9px] font-black text-white leading-none pointer-events-none` 일괄"
    - "modal overlay multiline (재진입 popup) → className 통합 — `fixed inset-0 z-[60] bg-[rgba(0,0,0,0.55)] flex items-center justify-center p-4`. zIndex:60 → `z-[60]` arbitrary (tailwind config z-60 미정의)"
key-files:
  created:
    - .planning/quick/260528-jey-phase-b-wave-9/260528-jey-SUMMARY.md
  modified:
    - src/pages/FloorPlanPage.tsx
decisions:
  - "wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl 승계 옵션 X+P+M+색변수N — 사용자 재컨펌 불필요 (0hr roadmap locked)"
  - "L1030 root container `as any` + vendor prefix (WebkitUserSelect/userSelect/WebkitTouchCallout) — 옵션 N 잔존. vendor prefix 는 tailwind class 가 cross-browser 보장 어렵고 `as any` cast 도 필요"
  - "L1058/L1097 marker container + badge `transform: translate(...) scale(...)` 동적 좌표 (px/py 런타임 계산) + conditional zIndex/outline — 옵션 N 잔존. `[left:${px}px]` 패턴 안티 (runtime string interpolation)"
  - "L1121 SVG `<text style={{ textShadow: ... }}>` — SVG element 의 textShadow 는 tailwind class 안 됨. inline 유일. 옵션 N 잔존"
  - "L1325 balloon positioning `Math.max/min` 동적 (containerRef.current?.clientWidth) — 좌표 N 잔존. multiline 5-prop 중 4-prop 동적 + 1-prop boxShadow 정적 (분리 가능했으나 multiline 통째 잔존 — 정적 1-prop 분리 시 spread 안티 발생)"
  - "L1337 arrow conditional spread `...(bp.arrowDir === 'bottom' ? {...} : {...})` — multiline spread + 좌표 동적. 옵션 N 잔존"
  - "L1866/L1917/L2139/L2188/L2158/L2168 fontFamily: 'inherit' 그룹 — Wave 5/7 precedent. `[font-family:inherit]` arbitrary 가능하나 textarea/input 에 적용 시 시각 byte-exact 보장 어려움. 옵션 N 잔존"
  - "L262/L264 danger marker badge multiline → className 일괄 변환 (14-prop). marker SVG 우상단 `!` 배지 정적 디자인 — chrome 통일 룰 외 marker icon 시각"
  - "L1044/L1050 notification banner 2종 (편집모드 안내 + 소화기 배치모드 안내) — 색만 다르고 동일 구조 → className 통합. py-[6px]/py-[7px] arbitrary 1px 차이 보존"
  - "L1078 img full-cover (도면 이미지 본체) → className 통합. objectFit:contain → object-contain / pointerEvents:none + userSelect:none → pointer-events-none + select-none. draggable={false} prop 유지"
  - "L1151 placeholder text `var(--t3)` → text-text-tertiary (tokens.css L186 `--t3: var(--text-tertiary)` alias 확인) tailwind class 사용"
  - "L1373 모바일 바텀시트 boxShadow `0 -8px 32px rgba(0,0,0,0.4)` → shadow-[0_-8px_32px_rgba(0,0,0,0.4)] arbitrary. underscore = 공백 치환 / 음수 부호 보존 / rgba 공백 그대로"
  - "L1694/L1695 재진입 popup overlay+box multiline → className 변환. z-[60] arbitrary + p-4 / max-w-[320px] arbitrary"
  - "L1745/L1760/L2097 backdrop `bg-[rgba(0,0,0,0.6)]` 3건 일괄 변환. 모두 동일 className `absolute inset-0 z-[50] flex items-center justify-center` + bg 추가. inspection-modal-chrome-rules.md 의 표준 backdrop 패턴 보존"
  - "L2151 height:72 standalone → h-[72px] arbitrary. h-72 (default 288px) 함정 회피. className 끝에 추가"
  - "chrome 통일 룰 페이지 (02 InspectionPage / 06 FloorPlanPage) 보존 — 본 wave 변환 후에도 inspection-modal-chrome-rules.md 의 4종 chrome (backdrop / modal box / textarea / button) 패턴 그대로 유지. 모달 chrome 디자인은 inline 변환에 영향 없음"
  - "단일 atomic commit 패턴 자동 도달 — 28-splash/27-login/23-education/c9s/cjn/gsh/h3z/hbv/iht/irl 승계 (7번째 자동 도달)"
metrics:
  duration: "약 15분 (Task 1 atomic — single commit, 25 inline)"
  completed-date: 2026-05-28
  tasks-completed: "1/1"
  files-modified: 1
  lines-changed: "13 ins / 34 del (net -21 lines, atomic single commit)"
roadmap-wave: "Tier 1 / Wave 9 (도면 — chrome 통일 룰 페이지)"
---

# Phase 260528-jey Plan 01: Phase B Wave 9 FloorPlan Summary

FloorPlanPage.tsx (2242줄, 25 inline) 의 13건 정적 inline style 을 wdc/01h/a3v/c9s/cjn/gsh/h3z/hbv/iht/irl 승계 옵션 X+P+M+색변수N 으로 tailwind className 변환. **chrome 통일 룰 페이지 첫 변환** — 02 InspectionPage 와 동일한 모달 chrome (backdrop / modal box / textarea / button 4종) 보존하면서 inline → tailwind 변환 진행. **단일 atomic commit** — `7701872`. **25 → 12 잔존** (-13건 -52%). 잔존 = vendor prefix as any (L1013) + marker 좌표 동적 2건 (L1041/L1080) + SVG textShadow (L1104) + balloon positioning 2건 (L1308/L1320) + fontFamily inherit 그룹 6건 (L1846/L1897/L2118/L2137/L2147/L2167). 시각 결과 0 byte 변경 (no-op refactor). Phase A 결과 (Lucide / 색 토큰 -bar / emoji 0 / 비표준 색 0) 및 비즈니스 로직 (floorPlanMarkerApi/extinguisherApi + useQuery 3건 + useMutation 5건 + 19 useState + 10 useRef + 6 useEffect + 11 onMarker* + 48 onClick + handleTap/onTouchStart/onTouchMove/onTouchEnd/onWheel/onCanvasMouseDown/onCanvasMouseMove/onCanvasMouseUp/onCanvasDblClick + revisitPopup/inspectModal/resolveModal/editMarker/addModal flow + extListQuery.data?.items + cpIdToExtType + cpIdToWarning + STATUS_COLOR / REPLACE_WARNING_STROKE / EXT_ASSET_MARKER_TYPES / SYMPTOM_OPTIONS_BY_PLAN / MARKER_TO_GL) 모두 보존. **Phase B Tier 1 Wave 9 성공** — 예상 (25→~12-14) 정확 달성 (12 잔존, 예상 하한). chrome 통일 룰 페이지 (02+06) 의 6번째 페이지 (FloorPlanPage) inline → tailwind 변환 완료. 다음 wave 진행 시 chrome 통일 룰 정상 보존 확인됨.

## User Decisions (승계 — wdc / 01h / a3v / c9s / cjn / gsh / h3z / hbv / iht / irl / 0hr-roadmap 재확인 불필요)

| ID  | 선택                                                          | 출처                              |
| --- | ------------------------------------------------------------- | --------------------------------- |
| (b) | **옵션 X** — 정확값 arbitrary `[Npx]` (시각 0 byte)            | wdc Phase B Task 2 결정            |
| (c) | **옵션 P** — `leading-none` 명시 보존                          | wdc Phase B Task 2 결정            |
| (d) | **옵션 M + 색 변수만 N** — template literal conditional 우선   | wdc Phase B Task 2 결정            |
| -   | **a3v/c9s/cjn/gsh/h3z/hbv/iht/irl 승계 적용** — 본 wave 재확인 없이 | 260528-0hr roadmap v2 locked-decisions |

## Before / After 카운트

| Metric (`style={{` count)        | Before | After  | Diff             |
| -------------------------------- | ------ | ------ | ---------------- |
| FloorPlanPage.tsx                | **25** | **12** | **-13 (-52%)**   |

총 변경: 1 file, 13 ins / 34 del, net -21 lines. PLAN 예상 (~12-14 잔존) 정확 달성 (12 잔존, 예상 하한). chrome 통일 룰 페이지 (02+06) 의 6번째 페이지 변환 완료.

## 변환 매핑 (FloorPlan — 13건 변환)

### Marker danger badge (L262/L264, 2건)

| Line (orig) | Before                                                                                                                                                            | After                                                                                                                                                  | 패턴   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| L262 wrap   | `position:relative, display:inline-block, lineHeight:0`                                                                                                            | className `relative inline-block leading-none`                                                                                                          | 옵션 X |
| L264 badge  | `position:absolute, top:-8, right:-8, w:12, h:12, bg:#ef4444, border:1.5px white, borderRadius:50%, flex center, fontSize:9, fontWeight:900, color:#fff, lineHeight:1, pointerEvents:none` 14-prop | className `absolute -top-2 -right-2 w-3 h-3 bg-[#ef4444] border-[1.5px] border-white rounded-full flex items-center justify-center text-[9px] font-black text-white leading-none pointer-events-none` 통합 | 옵션 X |

### Notification banner 2종 (L1044/L1050)

| Line (orig) | Before                                                                                                                                                                                  | After                                                                                                                                              | 패턴   |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| L1044 editmode | `position:absolute, top:0, left:0, right:0, zIndex:20, padding:'6px 12px', bg:'rgba(59,130,246,0.85)', fontSize:11, color:'#fff', fontWeight:600, textAlign:center, pointerEvents:none` | className `absolute top-0 left-0 right-0 z-20 py-[6px] px-3 bg-[rgba(59,130,246,0.85)] text-[11px] text-white font-semibold text-center pointer-events-none` | 옵션 X |
| L1050 placing  | 동일 패턴 (padding:'7px 12px', bg:'rgba(239,68,68,0.9)', fontWeight:700)                                                                                                                | className `absolute top-0 left-0 right-0 z-20 py-[7px] px-3 bg-[rgba(239,68,68,0.9)] text-[11px] text-white font-bold text-center pointer-events-none` | 옵션 X |

### 도면 이미지 본체 img (L1078)

| Line (orig) | Before                                                                                          | After                                                            | 패턴   |
| ----------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------ |
| L1078 img   | `width:'100%', height:'100%', objectFit:contain, display:block, pointerEvents:none, userSelect:none` | className `w-full h-full object-contain block pointer-events-none select-none` | 옵션 X |

### 도면 준비 중 placeholder (L1151)

| Line (orig) | Before                                                                                          | After                                                                | 패턴   |
| ----------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------ |
| L1151       | `display:flex, alignItems:center, justifyContent:center, height:'100%', color:'var(--t3)', fontSize:14, fontWeight:600` | className `flex items-center justify-center h-full text-text-tertiary text-[14px] font-semibold` | 옵션 X |

tokens.css L186 `--t3: var(--text-tertiary)` alias 확인. tailwind config L49 `text-tertiary: var(--text-tertiary)` 매핑. → `text-text-tertiary` tailwind class 사용 (arbitrary `text-[var(--t3)]` 불필요).

### 모바일 바텀시트 shadow (L1373)

| Line (orig) | Before                                                  | After                                              | 패턴   |
| ----------- | ------------------------------------------------------- | -------------------------------------------------- | ------ |
| L1373       | `boxShadow: '0 -8px 32px rgba(0,0,0,0.4)'` standalone (이미 className 있음) | className 추가 `shadow-[0_-8px_32px_rgba(0,0,0,0.4)]` | 옵션 X |

shadow- arbitrary underscore=공백 / 음수 부호 보존 / rgba 콤마 separator 그대로.

### 재진입 popup overlay+box (L1694/L1695, 2건)

| Line (orig) | Before                                                                                                                            | After                                                                       | 패턴   |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------ |
| L1694 overlay | `position:fixed, inset:0, zIndex:60, bg:'rgba(0,0,0,0.55)', display:flex, alignItems:center, justifyContent:center, padding:16` | className `fixed inset-0 z-[60] bg-[rgba(0,0,0,0.55)] flex items-center justify-center p-4` | 옵션 X |
| L1695 box   | `position:relative, width:'90%', maxWidth:320, minHeight:180`                                                                     | className `relative w-[90%] max-w-[320px] min-h-[180px]`                    | 옵션 X |

z-[60] arbitrary (tailwind config z-60 미정의).

### Backdrop 3종 (L1745/L1760/L2097)

| Line (orig) | Before (모두 동일)                              | After (className 합병)                                                                              | 패턴   |
| ----------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------ |
| L1727 AccessBlocked | `style={{ background: 'rgba(0,0,0,0.6)' }}` | className `absolute inset-0 z-[50] flex items-center justify-center bg-[rgba(0,0,0,0.6)]` 추가      | 옵션 X |
| L1742 InspectModal | 동일                                           | 동일                                                                                                | 옵션 X |
| L2079 ResolveModal | 동일                                           | 동일                                                                                                | 옵션 X |

inspection-modal-chrome-rules.md 표준 backdrop 패턴 보존 (z-[50] / bg-[rgba(0,0,0,0.6)] 정확값).

### Material height standalone (L2151)

| Line (orig) | Before                                                  | After                                              | 패턴   |
| ----------- | ------------------------------------------------------- | -------------------------------------------------- | ------ |
| L2151       | `style={{ height: 72 }}` (className 별도 존재)          | className 끝에 `h-[72px]` 추가 (style 제거)        | 옵션 X |

h-72 (default 288px) 함정 회피 → arbitrary 직접 지정.

## 옵션 N 잔존 매핑 (12건)

### Vendor prefix as any (1건)

| Line (post-edit) | Before                                                                                                                      | 사유                                                                                              | 패턴   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------ |
| L1013 root       | `flex:1, overflow:hidden, position:relative, touchAction:none, background:'#1a1f2b', WebkitUserSelect/userSelect/WebkitTouchCallout:none` + `as any` | vendor prefix (WebkitUserSelect/WebkitTouchCallout) tailwind class 가 cross-browser 보장 어려움 + `as any` cast 도 필요. wdc precedent `const page = {...} as any` | 옵션 N |

### Marker 좌표 동적 (2건)

| Line (post-edit) | 변수                                                                                                                          | 사유                                                                                              | 패턴   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------ |
| L1041 imgRef wrap | `transform: translate3d(${translate.x}px, ${translate.y}px, 0) scale(${scale})` 동적                                          | translate / scale 런타임 계산. tailwind `[transform:translate3d(...)]` arbitrary 안티 (runtime string interpolation) | 옵션 N |
| L1080 marker      | `left:px, top:py, transform:'translate(-50%, -50%) scale(${Math.max(0.5, 1/Math.sqrt(scale))})', zIndex: isDragging?50:..., outline: ...?'2.5px solid #3b82f6':'none'` | px/py 런타임 계산 + transform scale 동적 + conditional 다수. tailwind 변환 안티                    | 옵션 N |

### SVG textShadow (1건)

| Line (post-edit) | 변수                                                                | 사유                                                                                              | 패턴   |
| ---------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------ |
| L1104 SVG text   | `<text style={{ textShadow: '0 1px 2px rgba(0,0,0,0.45)' }}>?</text>` | SVG element 의 textShadow 는 tailwind utility class 안 됨. inline style 만 동작                   | 옵션 N |

### Balloon positioning (2건)

| Line (post-edit) | 변수                                                                                                                                    | 사유                                                                                              | 패턴   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------ |
| L1308 balloon    | `left: Math.max(8, Math.min(bp.left - BALLOON_W/2, ...))`, `top` / `bottom` conditional, `width: BALLOON_W`, `boxShadow` 5-prop 중 4 dynamic | Math.max/min 좌표 동적 + conditional. multiline 통째 잔존 (정적 1-prop boxShadow 만 분리 시 spread 안티) | 옵션 N |
| L1320 arrow      | `left: Math.max(16, Math.min(...))`, `...(bp.arrowDir==='bottom' ? {...} : {...})`, `width:0, height:0, transform:'translateX(-8px)'`    | 좌표 동적 + conditional spread + multiline                                                         | 옵션 N |

### fontFamily inherit 그룹 (6건)

| Line (post-edit) | 변수                                          | 사유                                                                                              | 패턴   |
| ---------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------ |
| L1846 textarea   | `height:72, fontFamily:'inherit'`             | Wave 5/7 precedent. textarea 의 `[font-family:inherit]` arbitrary 가능하나 byte-exact 보장 어려움 | 옵션 N |
| L1897 textarea   | 동일 (paired BC)                              | 동일                                                                                              | 옵션 N |
| L2118 textarea   | 동일 (resolve 직접 입력)                       | 동일                                                                                              | 옵션 N |
| L2137 input      | `fontFamily:'inherit'` (자재명)               | 동일                                                                                              | 옵션 N |
| L2147 input      | `fontFamily:'inherit'` (자재 개수)            | 동일                                                                                              | 옵션 N |
| L2167 textarea   | `height:72, fontFamily:'inherit'` (조치 내용) | 동일                                                                                              | 옵션 N |

## 비즈 anchor precise diff (PASS)

| Anchor                  | Before | After | Diff |
| ----------------------- | ------ | ----- | ---- |
| `onClick={...}`         | 48     | 48    | 0    |
| `useState(`             | 19     | 19    | 0    |
| `useRef(`               | 10     | 10    | 0    |
| `useEffect(`            | 6      | 6     | 0    |
| `useMutation(`          | 5      | 5     | 0    |
| `useQuery(`             | 3      | 3     | 0    |
| `useNavigate(`          | 1      | 1     | 0    |
| `useParams(`            | 0      | 0     | 0    |
| `fetch(`                | 0      | 0     | 0    |
| `onMarker`              | 11     | 11    | 0    |

비즈 anchor precise grep IDENTICAL. 모든 onClick handler 본문 unique set (29건) 100% 일치.

## Phase A 결과 보존 (PASS)

| Metric                                           | FloorPlanPage |
| ------------------------------------------------ | ------------- |
| emoji (✓/✗/🔒/💾/🔥/⏰/📋/✅/⚠️/❌/🔧/🚨/🔍/🧯/📊) | 0             |
| 비표준 색 (bg-warning/border-safe/border-warning/border-danger) | 0             |

## Chrome 통일 룰 보존 (PASS)

inspection-modal-chrome-rules.md 의 4종 chrome 패턴 변환 후 유지:

| 패턴               | 변환 전 (이미 className)                                                                          | 변환 후 (변경 없음)                                                                                | 위치        |
| ------------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------- |
| backdrop          | `absolute inset-0 z-[50] flex items-center justify-center` + inline bg-rgba                       | `absolute inset-0 z-[50] flex items-center justify-center bg-[rgba(0,0,0,0.6)]` (className 통합)   | L1726/L1741/L2078 |
| modal box (small) | `relative w-[90%] max-w-[340px] h-[290px] bg-surface-raised border border-border-default rounded-md` | 유지 (변환 없음)                                                                                   | L1731       |
| modal box (full)  | `relative w-[90%] max-w-[340px] max-h-[86vh] overflow-y-auto bg-surface-raised border border-border-default rounded-md p-5` | 유지 (변환 없음)                                                                                   | L1745/L2082 |
| textarea          | `flex-1 rounded-sm bg-surface-page border border-border-default text-text-primary text-label p-2.5 resize-none outline-none box-border` + inline {height:72, fontFamily:'inherit'} | 유지 (옵션 N 잔존)                                                                                  | L1846/L1897/L2118/L2167 |
| button            | `flex-1 h-input rounded-sm bg-surface-sunken border border-border-default text-text-secondary text-label font-semibold cursor-pointer` | 유지 (변환 없음)                                                                                   | 다수        |

→ chrome 룰 100% 보존. backdrop 3건은 inline → className 통합으로 룰 일관성 강화 (변환 전 inline bg 사용 / 변환 후 className 통합).

## TypeScript (PASS)

`./node_modules/.bin/tsc --noEmit 2>&1 | grep -c "error TS"` = 0

## Vite build (PASS)

`./node_modules/.bin/vite build` ✓ built in 168ms. PWA 82 entries 7931.51 KiB.

## 파일 scope (PASS)

`git diff --name-only HEAD` (직전 commit 전) = `cha-bio-safety/src/pages/FloorPlanPage.tsx` 1 파일만 변경. 다른 .tsx / .ts / .css / .json 변경 0.

## Commit

| Hash      | Message                                                                              |
| --------- | ------------------------------------------------------------------------------------ |
| `7701872` | feat(260528-jey-01): Phase B Wave 9 — FloorPlanPage 25 inline → tailwind             |

## 핵심 함정 회피 (자동 도달)

1. **w-7=32 / w-8=48 config override** — 본 wave 신규 추가 없음. `width: 12, height: 12` (marker badge) → `w-3 h-3` (default 12px). `width: 0, height: 0` (arrow) → 옵션 N 잔존 (multiline spread).
2. **w-3 h-3 = 12px (tailwind default)** — marker badge 12px 변환 시 안전. config override 무.
3. **-top-2 -right-2 = -8px (tailwind default)** — marker badge top:-8/right:-8 변환 시 안전. config override 무 (spacing.2=8 default).
4. **z-[60] arbitrary** — tailwind config 의 z-index scale 은 0/10/20/30/40/50/auto. z-60 미정의 → arbitrary 직접 지정.
5. **z-20 tailwind default** — notification banner zIndex:20 변환 시 안전. config override 무.
6. **shadow- arbitrary underscore=공백** — `boxShadow: '0 -8px 32px rgba(0,0,0,0.4)'` → `shadow-[0_-8px_32px_rgba(0,0,0,0.4)]`. 음수 부호 보존 / rgba 콤마 separator 그대로.
7. **bg-[rgba(...,N)] arbitrary** — 0.85 / 0.9 / 0.55 / 0.6 alpha 보존. 콤마 separator (rgba 4-arg).
8. **var(--t3) → text-text-tertiary** — tokens.css alias 확인 필수 (L186 `--t3: var(--text-tertiary)`). tailwind config L49 매핑. arbitrary `text-[var(--t3)]` 불필요.
9. **chrome 통일 룰 페이지 변환 시 inline-modal-chrome-rules.md 보존** — 02 InspectionPage / 06 FloorPlanPage 공통 chrome 4종 (backdrop / modal box / textarea / button) 패턴 변환 후 유지. 본 wave 6번째 chrome 룰 페이지 변환 첫 사례.
10. **multiline inline 의 정적-동적 mix 처리** — L1325 balloon 의 5-prop 중 4 dynamic + 1 정적 (boxShadow). 정적 1-prop 만 분리 시 spread 안티 발생 → multiline 통째 옵션 N 잔존.

## 메모리 anchors

- `feedback_tailwind_w8_h8_is_48px.md` (config override 함정 회피 — 본 wave 신규 추가 무)
- `feedback_tailwind_token_class_pattern.md` (-bar prefix 룰 / `text-[#hex]` arbitrary)
- `project_inspection_chrome_unified.md` (chrome 통일 룰 페이지 컨텍스트 — 02 InspectionPage + 06 FloorPlanPage. 본 wave 의 chrome 룰 보존 검증)
- `feedback_redesign_sketch_rule_enforcement.md` (§6.2 negative rule — 위험 임계치 아닌 카드 status 색 금지 룰 위반 0)
- `feedback_planner_prompt_sketch_verbatim.md` (sketch CSS verbatim 인용 — PLAN context 의 변환 매핑 그대로 적용)

## Self-Check: PASSED

- FloorPlanPage.tsx 변경 확인: FOUND
- Commit `7701872` 확인: FOUND
- TypeScript 0 error: PASSED
- Vite build: PASSED
- 비즈 anchor precise diff empty: PASSED
- Emoji 0 / 비색 0: PASSED
- 변경 파일 1개 (FloorPlanPage.tsx 만): PASSED
- chrome 통일 룰 4종 (backdrop / modal box / textarea / button) 보존: PASSED
- FloorPlanPage inline ≤18 (실제 12): PASSED (예상 하한 도달)
