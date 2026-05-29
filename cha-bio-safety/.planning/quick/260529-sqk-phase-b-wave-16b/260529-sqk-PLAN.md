---
phase: 260529-sqk-phase-b-wave-16b-mid-components-batch
plan: 01 + 02 (16b-1 InstallPrompt + 16b-2 ExcelPreview + DesktopSidebar bundle)
subsystem: redesign/phase-b-sweep
status: planned
tags:
  - install-prompt
  - excel-preview
  - desktop-sidebar
  - inline-style-to-tailwind
  - no-op-refactor
  - phase-b-tier-3-wave-16b
  - component-batch
  - mid-size-batch
  - dynamic-coordinate-overlay-preserve
  - dual-render-pwa-guide
  - 3-state-render-pattern
  - calibration-marker-preserve
  - sidebar-nav-conversion
  - split-b-pair
options:
  X: "정확값 arbitrary `[Npx]` (시각 0 byte) — 22 wave 승계"
  P: "leading-none 명시 — 작은 컨테이너 text-caption/text-label"
  M: "template literal conditional className — 색 변수만 N 보존"
  색변수: "active/hover/conditional bg/color 만 옵션 N (Tailwind ternary 가능 시 className)"
  module-const-N: "module-scope data const (DESKTOP_SECTIONS / PREVIEW_IMAGES / CALIB_STEPS / REPORT_GRID / DL / DR / DY / MATRIX_TYPES / MATRIX_CATEGORIES / FINGER_OFFSET) 0 byte 보존"
  function-const-N: "함수 스코프 helper 함수 (isStandalone / isIOS / fetchKey / loadCalib / saveCalib / calcGrid / buildDivOverlay / buildCheckOverlay / buildPumpOverlay / buildOverlay) 정의 0 byte 보존"
  분할-결정: "B (2분할) 채택 — Plan 01 InstallPrompt 41 단독 + Plan 02 ExcelPreview 18 + DesktopSidebar 17 bundle 35. 16a precedent (77 → 43+34) 비례 적용."
  분할-근거:
    - "InstallPrompt 41 inline 은 16a-1 FindingEditModal 40 변환 사례와 거의 동일 부피 → 단독 atomic 적합"
    - "ExcelPreview 18 + DesktopSidebar 17 = 35 inline 은 16a-2 FindingFormSheet 31 변환과 비례. 두 컴포넌트 codepath 무관 → bundle 안전"
    - "단일 atomic (76) 은 ExcelPreview 동적 좌표 옵션 N 11+건 보존 검증 부담 + InstallPrompt 3-state render 분기 검증 부담이 중첩 → 분할 권장"
    - "3분할 (C) 은 DesktopSidebar 17 만 atomic 너무 작음 (15a/15b atomic 모두 30+) → ExcelPreview 18 과 묶음이 적정"
requires:
  - 260529-s07 완료 (Wave 16a 페어 완결 — Tier 3 components batch 첫 wave 박제, dual-render + 함수 const + module const 보존 룰)
  - 260529-qn3 완료 (Wave 15b ElevatorPage 데스크톱 — Tier 2 종결, 메가 분할 패턴)
  - 260529-q5a 완료 (Wave 14b partial conversion 첫 사례, spread combo 옵션 N)
  - 260528-0hr Phase B 마스터 로드맵 v2 (옵션 X+P+M+색변수N locked)
provides:
  - InstallPrompt.tsx Phase B Wave 16b-1 atomic — 41 inline 중 변환 + 옵션 N 잔존 (dynamic span fontSize × 2 + ⋮/⎋ emoji 보존 verbatim)
  - ExcelPreview.tsx Phase B Wave 16b-2-A atomic — 18 inline 중 정적 부분 변환 + 옵션 N 잔존 (dynamic % position × N + dynamic color × N + calibration overlay × N)
  - DesktopSidebar.tsx Phase B Wave 16b-2-B atomic — 17 inline 중 변환 + 옵션 N 잔존 (NavItem 동적 bg/color/borderLeft + onMouseEnter/Leave opacity spread)
  - **Tier 3 components batch 2번째 wave 페어 완결 마커** — 24번째 + 25번째 atomic 누적 (s07-02 23번째 + sqk-01 + sqk-02)
  - **dynamic coordinate overlay preserve 패턴 첫 박제** — ExcelPreview 의 `style={{ left: `${item.x}%`, top: `${item.y}%`, fontSize: item.fontSize ?? 10 ... }}` 동적 좌표/색/사이즈 inline 보존
  - **PWA 3-state render 패턴 변환** — InstallPrompt 의 (default / Android guide / iOS guide) 3-state 분기 안 IDENTICAL 패턴 (28x28 number circle × 6 + guide 항목 × 6) 일괄 변환 검증
  - 시각 0 byte 변경 (no-op refactor, 모바일/데스크톱/iOS guide/Android guide 모두 픽셀 1:1)
  - Phase A 결과 보존 (Lucide 사용: DesktopSidebar Settings 1건 / emoji: ⋮ + ⎋ + ⚠ 3건 / 비표준 색 0)
  - 비즈 anchor (InstallPrompt 4 onClick / 2 useState / 1 useEffect / ExcelPreview 5 onClick / 2 useState / 1 useRef / 1 useEffect / 9 useCallback / DesktopSidebar 4 onClick / 1 useState / 1 useNavigate) IDENTICAL
  - **Wave 16b 페어 완결 마커** — Wave 16c (소형 components batch) 또는 묶음 D production cherry-pick 결정 진입 가능
affects:
  - src/components/InstallPrompt.tsx
  - src/components/ExcelPreview.tsx
  - src/components/DesktopSidebar.tsx
key-files:
  created:
    - .planning/quick/260529-sqk-phase-b-wave-16b/260529-sqk-PLAN.md
  modified:
    - src/components/InstallPrompt.tsx (Plan 01)
    - src/components/ExcelPreview.tsx (Plan 02 part A)
    - src/components/DesktopSidebar.tsx (Plan 02 part B)
decisions:
  - "wdc/01h/a3v~qn3/s07 23 wave 승계 옵션 X+P+M+색변수N+module/함수 const N — 사용자 재컨펌 불필요 (0hr roadmap locked, 24/25번째 atomic 자동 도달)"
  - "분할 B 채택 — Plan 01 (InstallPrompt 41) atomic + Plan 02 (ExcelPreview 18 + DesktopSidebar 17 = 35) bundle = 2 commit. 16a precedent 비례 (77 → 43+34 → 본 76 → 41+35)"
  - "ExcelPreview 동적 좌표 옵션 N 보존 룰 박제 — `overlay.map` 안 `left: ${item.x}%` / `top: ${item.y}%` / `fontSize: item.fontSize ?? 10` / `color: item.color ?? '#1a1a1a'` / `fontWeight: item.fontWeight ?? 700` 5-prop dynamic. className 분리 시 의도 불분명 → inline 보존이 깔끔"
  - "CalibMarker 동적 색/크기 옵션 N 보존 — `background: color` (props) + `width: active ? 20 : 16` 등 6+ props 가 모두 동적. className 분리 시 props chain 끊김 → inline 보존"
  - "calibration 안내 바 동적 색 옵션 N 보존 — `background: CALIB_STEPS[calibStep].color` 동적 step color → inline 보존. 나머지 정적 props (`padding: '10px 20px'` 등) 는 className"
  - "InstallPrompt 3-state render 분기 IDENTICAL 패턴 일괄 변환 — Android guide 3 numbered item + iOS guide 3 numbered item (총 6) = 28x28 number circle + label/desc 동일 markup → 양 분기에 IDENTICAL className 적용"
  - "DesktopSidebar NavItem hovered/active dynamic 옵션 M 채택 — `bg = active ? 'var(--bg4)' : hovered ? 'var(--bg3)' : 'transparent'` 3-state → template literal conditional className 변환. `color = soon ? 'var(--t3)' : active ? 'var(--acl)' : 'var(--t1)'` 동일 패턴 변환"
  - "DesktopSidebar Settings 버튼 onMouseEnter/Leave opacity 보존 — `e.currentTarget.style.opacity = '1'` inline DOM 조작은 className 화 불가 → handler 코드 보존. opacity 80→100 transition 효과 유지"
  - "DesktopSidebar svg chevron transform 옵션 N 보존 — `transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'` + `transition: 'transform 0.15s'` dynamic transform → inline 보존 또는 옵션 M (Tailwind arbitrary `rotate-[Ndeg]`). 결정: 옵션 M (`${isCollapsed ? '-rotate-90' : 'rotate-0'} transition-transform duration-150`)"
  - "InstallPrompt span fontSize 옵션 N 보존 — `<span style={{ fontSize: 16 }}>⋮</span>` (L128) + `<span style={{ fontSize: 16, verticalAlign: 'middle' }}>⎋</span>` (L169) emoji 강조용 span. inline 2건 보존 (옵션 X arbitrary `text-[16px]` 도 가능하나 inline 단순)"
  - "InstallPrompt outer fixed backdrop 정적 변환 — `position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24` 전부 className 변환 (`fixed inset-0 z-[9999] bg-[rgba(0,0,0,0.85)] flex items-center justify-center p-6`)"
  - "ExcelPreview 위치 설정 button 동적 bg 옵션 M — `background: hasCalib ? 'rgba(0,0,0,0.6)' : 'rgba(239,68,68,0.9)'` 2-state → template literal conditional className"
metrics:
  estimated-duration: "약 20분 (Plan 01 atomic 약 10분 + Plan 02 atomic 약 10분)"
  estimated-tasks: "2/2 (Plan 01 + Plan 02)"
  estimated-files-modified: 3
  estimated-lines-changed: "InstallPrompt 41 → ~5 옵션 N (-36, -88%) / ExcelPreview 18 → ~10 옵션 N (-8, -44%) / DesktopSidebar 17 → ~2 옵션 N (-15, -88%) / 합 76 → ~17 옵션 N (-59, -78%)"
roadmap-wave: "Tier 3 / Wave 16b 페어 완결 (InstallPrompt + (ExcelPreview + DesktopSidebar) — components batch 2번째 wave, 24번째+25번째 atomic)"
---

# Phase 260529-sqk Wave 16b — 중형 컴포넌트 batch (분할 B, 2 atomic)

InstallPrompt.tsx (239줄, 41 inline) + ExcelPreview.tsx (535줄, 18 inline) + DesktopSidebar.tsx (245줄, 17 inline) = **76 inline 정적 inline style 중 ~59 변환 + ~17 옵션 N 잔존** (-59, -78%) = wdc/01h/a3v~qn3/s07 23 wave 승계 옵션 X+P+M+색변수N+module/함수 const N 으로 tailwind className 변환.

**분할 결정: B (2분할)** — Plan 01 (InstallPrompt 41 atomic) + Plan 02 (ExcelPreview 18 + DesktopSidebar 17 bundle = 35 atomic). 16a precedent (77 → 43+34) 비례 적용.

**근거:**
- InstallPrompt 41 inline 단독 = 16a-1 FindingEditModal 40 변환 사례와 거의 동일 → 단독 atomic
- ExcelPreview 18 + DesktopSidebar 17 = 35 inline = 16a-2 FindingFormSheet 31 변환과 비례. 두 컴포넌트 codepath 무관 → bundle 안전
- 단일 76 atomic 회피: ExcelPreview 동적 좌표 옵션 N 다수 + InstallPrompt 3-state 분기 검증 부담 중첩
- 3분할 회피: DesktopSidebar 17 만 atomic 너무 작음

---

## User Decisions (승계 — wdc / 01h / a3v ~ qn3 / s07 / 0hr-roadmap 재확인 불필요)

| ID  | 선택                                                           | 출처                              |
| --- | -------------------------------------------------------------- | --------------------------------- |
| (b) | **옵션 X** — 정확값 arbitrary `[Npx]` (시각 0 byte)             | wdc Phase B Task 2 결정            |
| (c) | **옵션 P** — `leading-none` 명시 (작은 컨테이너)                  | wdc Phase B Task 2 결정            |
| (d) | **옵션 M + 색 변수만 N** — template literal conditional         | wdc Phase B Task 2 결정            |
| -   | **a3v~s07 23 wave 승계 적용** — 본 plan 재확인 없이              | 260528-0hr roadmap v2 locked-decisions |
| -   | **module-scope const + 모듈 함수 N** — 0 byte 보존              | s07 박제 (FindingFormSheet 첫 사례) |
| -   | **분할 B 채택** — Plan 01 + Plan 02 2 atomic                    | 16a s07 precedent 비례 적용 |
| -   | **dynamic coordinate overlay 옵션 N 보존** — `${item.x}%` 등 동적 좌표 | 신규 박제 (ExcelPreview) |
| -   | **3-state render 분기 IDENTICAL 패턴 일괄 변환** — Android/iOS guide | 신규 박제 (InstallPrompt) |

---

## CWD 및 토큰 alias 매핑 (전 plan 공통)

```bash
# CWD 필수
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety
```

**tokens.css alias 매핑 (s07 IDENTICAL):**
| inline                              | className                  |
| ----------------------------------- | -------------------------- |
| `background: 'var(--bg2)'`          | `bg-surface-raised`        |
| `background: 'var(--bg3)'`          | `bg-surface-sunken`        |
| `background: 'var(--bg4)'`          | `bg-surface-active`        |
| `borderRight: '1px solid var(--bd)'` | `border-r border-border-default` |
| `borderTop: '1px solid var(--bd)'`   | `border-t border-border-default` |
| `borderBottom: '1px solid var(--bd)'` | `border-b border-border-default` |
| `color: 'var(--t1)'`                | `text-text-primary`        |
| `color: 'var(--t2)'`                | `text-text-secondary`      |
| `color: 'var(--t3)'`                | `text-text-tertiary`       |
| `background: 'var(--acl)'`          | `bg-accent`                |
| `color: 'var(--acl)'`               | `text-accent`              |
| `background: 'var(--danger)'`       | `bg-danger-bar`            |

---

## Context (3 컴포넌트 라인별 매핑 가이드)

### Plan 01 — InstallPrompt.tsx (41 inline)

**비즈 anchor:** 4 onClick / 2 useState / 0 useRef / 1 useEffect / 0 useMutation / 0 useQuery / 0 useNavigate / 0 useParams / 0 fetch / 0 useCallback
**helper 함수 N 보존:** `isStandalone()` / `isIOS()` (module scope)
**module export N 보존:** `shouldShowInstallPrompt()` / `dismissInstallPrompt()` (module scope)

**라인별 변환:**

| 라인 (Before) | 위치                                       | 변환                                                                                                                          |
| ------------: | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
|        L58–62 | outer backdrop (fixed inset bg padding)    | `fixed inset-0 z-[9999] bg-[rgba(0,0,0,0.85)] flex items-center justify-center p-6` (기존 `bg-surface-raised rounded-[20px]` 보존) |
|        L66–71 | 카드 box (padding maxWidth border shadow)  | className 추가: `px-6 pt-7 pb-7 max-w-[340px] w-full text-center border border-[rgba(59,130,246,0.3)] shadow-[0_8px_40px_rgba(0,0,0,0.5)]` |
|        L74–82 | 아이콘 wrap (64x64 bg border center)        | `w-16 h-16 mx-auto mb-4 bg-[rgba(37,99,235,0.2)] border border-[rgba(59,130,246,0.3)] flex items-center justify-center` (기존 `rounded-lg` 보존) |
|         L83   | 아이콘 img (48x48 borderRadius 12)         | `className="w-12 h-12 rounded-xl"` (기존 inline 제거)                                                                            |
|         L86   | h2 margin 0 0 8px                           | className 추가: `mb-2 mt-0` (기존 `text-title font-extrabold text-text-primary` 보존)                                            |
|         L89   | p margin 0 0 20px                           | className 추가: `mb-5 mt-0` (기존 `text-caption leading-relaxed text-text-secondary` 보존)                                       |
|         L94   | 버튼 column flex column gap 10             | `flex flex-col gap-2.5`                                                                                                       |
|        L98–102 | 설치 버튼 (width 100% h 48 none cursor)    | className 추가: `w-full h-12 border-0 cursor-pointer` (기존 `bg-safe-bar text-text-on-accent text-body font-bold rounded-md` 보존) |
|       L109–113 | 취소 버튼 (width 100% h 40 transparent border opacity) | className 추가: `w-full h-10 bg-transparent border border-[rgba(255,255,255,0.1)] cursor-pointer` (기존 `text-caption font-bold leading-none text-text-tertiary rounded-md` 보존) |
|         L120   | Android guide root (textAlign left)         | `text-left`                                                                                                                   |
|         L121   | Android guide 안내 박스 (border padding marginBottom) | className 추가: `border border-warning/25 px-2.5 py-2 mb-3.5` (기존 className 일부 중복 — 정리: `text-caption leading-relaxed text-warning bg-warning-bg border border-warning/25 rounded-sm px-2.5 py-2 mb-3.5`) |
|         L124   | Android guide column wrap (column gap 14)   | `flex flex-col gap-3.5`                                                                                                       |
|       L125,132,139 | Android guide row (flex items-start gap 12) × 3 | `flex items-start gap-3`                                                                                                  |
|       L126,133,140 | Android number circle (28x28 flex center) × 3 | className 추가: `w-[28px] h-[28px] flex-shrink-0 flex items-center justify-center` (기존 `bg-accent/15 text-accent text-label font-extrabold leading-none rounded-sm` 보존) |
|       L128,135,142 | label div (fontWeight 700)                | className 추가: `font-bold` (기존 `text-label leading-none text-text-primary` 보존)                                              |
|         L128   | inner ⋮ span (fontSize 16) — **옵션 N 보존** | `style={{ fontSize: 16 }}` 또는 옵션 X 대안 `text-[16px]`. **결정: 옵션 N 보존** (단순 span 강조용, 1 prop)                       |
|       L129,136,143 | desc div (marginTop 2)                    | className 추가: `mt-0.5` (기존 `text-caption leading-relaxed text-text-secondary` 보존)                                          |
|       L147–150 | Android 확인 btn (width 100% h 44 marginTop 18 border cursor) | className 추가: `w-full h-11 mt-[18px] border border-[rgba(59,130,246,0.3)] cursor-pointer` (기존 `bg-accent/15 text-accent text-label font-bold leading-none rounded-md` 보존) |
|         L157   | iOS guide root (textAlign left)             | `text-left`                                                                                                                   |
|         L158   | iOS guide column wrap (column gap 14)       | `flex flex-col gap-3.5`                                                                                                       |
|       L159,174,189 | iOS row (flex items-start gap 12) × 3     | `flex items-start gap-3`                                                                                                      |
|       L160–163, 175–178, 190–193 | iOS number circle (28x28) × 3 | className 추가: `w-[28px] h-[28px] flex-shrink-0 flex items-center justify-center` (Android IDENTICAL)                       |
|       L165,180,195 | iOS label div (fontWeight 700) × 3        | className 추가: `font-bold`                                                                                                   |
|         L169   | inner ⎋ span (fontSize 16, verticalAlign middle) — **옵션 N 보존** | `style={{ fontSize: 16, verticalAlign: 'middle' }}` 2-prop. **결정: 옵션 N 보존**                                            |
|       L168,183,198 | iOS desc div (marginTop 2) × 3            | className 추가: `mt-0.5`                                                                                                      |
|       L205–212 | iOS 확인 btn (width 100% h 44 marginTop 18 border cursor) | className 추가: `w-full h-11 mt-[18px] border border-[rgba(59,130,246,0.3)] cursor-pointer` (Android IDENTICAL) |

**옵션 N 잔존 예상 (5건):**
1. L128 `<span style={{ fontSize: 16 }}>⋮</span>` — 단순 emoji 강조 span
2. L169 `<span style={{ fontSize: 16, verticalAlign: 'middle' }}>⎋</span>` — 2-prop emoji 강조
3-5. (필요 시) 0 byte 보존 잔존 마이너 inline (가능성 낮음)

---

### Plan 02 Part A — ExcelPreview.tsx (18 inline)

**비즈 anchor:** 5 onClick / 2 useState / 1 useRef / 1 useEffect / 0 useMutation / 1 useQuery / 0 useNavigate / 0 useParams / 0 fetch / **9 useCallback** (중요 — 변경 0)
**helper 함수 N 보존:** `fetchKey()` / `loadCalib()` / `saveCalib()` / `calcGrid()` / `buildDivOverlay()` / `buildCheckOverlay()` / `buildPumpOverlay()` / `buildOverlay()` (module scope) + 11 useState/useRef/useCallback 함수형 정의 (component scope)
**module data const N 보존:** `PREVIEW_IMAGES` / `REPORT_GRID` / `MATRIX_TYPES` / `MATRIX_CATEGORIES` / `CALIB_STEPS` / `FINGER_OFFSET` / `DL` / `DR` / `DY` (전부 0 byte)

**라인별 변환:**

| 라인 (Before) | 위치                                            | 변환                                                                                                                          |
| ------------: | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
|       L358–365 | container (width 100% h 100% flex center bg)    | `w-full h-full flex items-center justify-center overflow-hidden bg-surface-page relative` (기존 ref/onClick 보존)             |
|         L368   | 선택 안내 span (fontSize 14 color)              | `text-[14px] text-text-secondary` (`fontSize: 14`은 `text-[14px]` 채택, t2 token alias)                                       |
|       L378–383 | preview img (maxWidth 100% maxHeight 100% objectFit boxShadow borderRadius bg) | `max-w-full max-h-full object-contain shadow-[0_4px_24px_rgba(0,0,0,0.3)] rounded bg-white`                                  |
|       L393–400 | overlay 영역 (position absolute left top width height pointerEvents cursor touchAction) — **옵션 N 잔존** | `style` 안 `left: imgRect.left` / `top: imgRect.top` / `width: imgRect.width` / `height: imgRect.height` 4-prop 동적 좌표 → **옵션 N 보존 필수**. `position absolute` / `pointerEvents` / `cursor` / `touchAction` 동적 ternary 도 inline 유지가 깔끔. **전체 inline 보존** |
|       L406–415 | overlay map span (position absolute left top transform fontSize color fontWeight whiteSpace lineHeight fontFamily) — **옵션 N 잔존** | `left: ${item.x}%` / `top: ${item.y}%` / `fontSize: item.fontSize ?? 10` / `color: item.color ?? '#1a1a1a'` / `fontWeight: item.fontWeight ?? 700` 5-prop 동적 → **옵션 N 보존 필수**. 정적 prop (`position: 'absolute'`, `transform: 'translate(-50%, -50%)'`, `whiteSpace: 'nowrap'`, `lineHeight: 1`, `fontFamily: ...`) 분리 불가능 (동일 inline) → **전체 inline 보존** |
|       L435–442 | calibration 안내 바 (position top left transform bg color padding borderRadius fontSize fontWeight flex gap zIndex shadow) — **옵션 N 부분 보존** | 정적 부분 className 변환 가능: `absolute top-2 left-1/2 -translate-x-1/2 bg-[rgba(0,0,0,0.9)] text-white px-5 py-2.5 rounded-[10px] text-[14px] font-bold flex items-center gap-4 z-10 shadow-[0_4px_12px_rgba(0,0,0,0.3)]`. **결정: 전체 className 변환** (동적 props 없음) |
|       L443–448 | step circle (width 24 height 24 borderRadius bg flex center fontSize) — **옵션 N 잔존 (color)** | `style={{ background: CALIB_STEPS[calibStep].color }}` 만 inline 보존 + 나머지 className 변환: `w-6 h-6 rounded-full flex items-center justify-center text-[12px]` |
|         L450   | step 안내 span (fontSize 11 color #aaa)         | `text-[11px] text-[#aaa]`                                                                                                     |
|       L452–455 | 확인 btn (bg border color padding borderRadius cursor fontSize fontWeight) | `bg-[#22c55e] border-0 text-white px-4 py-1.5 rounded-md cursor-pointer text-[13px] font-bold`                                |
|       L458–461 | 스킵 btn (bg border color padding borderRadius cursor fontSize) | `bg-white/30 border-0 text-white px-3.5 py-1.5 rounded-md cursor-pointer text-[12px]`                                         |
|       L463–466 | 취소 btn (bg border color padding borderRadius cursor fontSize) | `bg-white/15 border-0 text-white px-3.5 py-1.5 rounded-md cursor-pointer text-[12px]`                                         |
|       L473–480 | 위치 설정 btn (position bottom right padding borderRadius fontSize fontWeight cursor zIndex border color) — **옵션 M 동적 bg** | `style={{ background: hasCalib ? 'rgba(0,0,0,0.6)' : 'rgba(239,68,68,0.9)' }}` 만 inline 보존 + 나머지 className: `absolute bottom-3 right-3 text-white border-0 px-4 py-2 rounded-lg text-[12px] font-bold cursor-pointer z-10` 또는 옵션 M template literal: `${hasCalib ? 'bg-[rgba(0,0,0,0.6)]' : 'bg-[rgba(239,68,68,0.9)]'}` — **결정: 옵션 M 채택** |
|       L487–491 | loading overlay (position absolute inset display flex center bg borderRadius) | `absolute inset-0 flex items-center justify-center bg-white/70 rounded`                                                       |
|         L492   | loading span (fontSize 12 color #666)            | `text-[12px] text-[#666]`                                                                                                     |
|       L504–509 | CalibMarker root (position left top transform pointerEvents) — **옵션 N 잔존** | `left: ${x}%` / `top: ${y}%` 동적 → **옵션 N 보존**                                                                            |
|       L511–514 | CalibMarker 가로 십자선 (position left top width 40 height 2 bg opacity) — **옵션 N 잔존 (bg=color props)** | `background: color` props → **옵션 N 보존**                                                                                    |
|       L515–518 | CalibMarker 세로 십자선 (position top left width 2 height 40 bg opacity) — **옵션 N 잔존 (bg=color props)** | `background: color` props → **옵션 N 보존**                                                                                    |
|       L520–530 | CalibMarker 중심점 (width/height active conditional bg border boxShadow flex center fontSize color transform) — **옵션 N 잔존 (props 다수)** | `width/height: active ? 20 : 16` + `background: color` props 동적 → **옵션 N 보존**                                            |

**옵션 N 잔존 예상 (~10건):**
1. L393–400 overlay 영역 (imgRect 4-prop 동적)
2. L406–415 overlay map span (item 5-prop 동적, transform/whiteSpace/lineHeight/fontFamily 정적 동거)
3. L443–448 step circle (CALIB_STEPS[calibStep].color 동적 1-prop)
4. L473–480 위치 설정 btn (옵션 M conditional — 옵션 M 채택 시 0 prop, 채택 못 하면 1 prop)
5. L504–509 CalibMarker root (x/y 2-prop 동적)
6. L511–514 CalibMarker 가로 십자선 (color props 1-prop)
7. L515–518 CalibMarker 세로 십자선 (color props 1-prop)
8. L520–530 CalibMarker 중심점 (width/height/color 3-prop 동적)
9-10. (필요 시) 잔존 마이너

---

### Plan 02 Part B — DesktopSidebar.tsx (17 inline)

**비즈 anchor:** 4 onClick / 1 useState / 0 useRef / 0 useEffect / 0 useMutation / 0 useQuery / 1 useNavigate / 0 useParams / 0 fetch / 0 useCallback
**module data const N 보존:** `DESKTOP_SECTIONS` (L8-13)
**Lucide:** Settings (1건) — 보존

**라인별 변환:**

| 라인 (Before) | 위치                                       | 변환                                                                                                                          |
| ------------: | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
|        L39–47 | root container (width 280 flexShrink h 100dvh bg border flex column) — `data-no-print` attr 보존 | `w-[280px] flex-shrink-0 h-dvh bg-surface-raised border-r border-border-default flex flex-col`                               |
|        L51–62 | 로고 스트립 (height 54 boxSizing padding bg borderBottom flex items-center gap 10 flexShrink cursor) | `h-[54px] box-border px-4 bg-surface-raised border-b border-border-default flex items-center gap-2.5 flex-shrink-0 cursor-pointer` |
|         L64   | 로고 img (width 30 height 30 borderRadius 8 flexShrink) | `w-[30px] h-[30px] rounded-lg flex-shrink-0`                                                                                  |
|         L66   | 회사명 div (fontSize 13 fontWeight 700 color) | `text-[13px] font-bold text-text-primary`                                                                                     |
|         L67   | 부제 div (fontSize 9.5 color marginTop 1) | `text-[9.5px] text-text-tertiary mt-px`                                                                                       |
|         L72   | 스크롤 nav (flex 1 overflow flex column justify) | `flex-1 overflow-auto flex flex-col justify-evenly`                                                                           |
|        L80–94 | 섹션 라벨 btn (flex items-center w-full textAlign fontSize 11 fontWeight color uppercase padding bg border cursor letterSpacing) | `flex items-center w-full text-left text-[11px] font-bold text-text-secondary uppercase pt-2 px-4 pb-1 bg-transparent border-0 cursor-pointer tracking-[0.05em]` |
|         L96   | 라벨 span (flex 1)                         | `flex-1`                                                                                                                      |
|         L97   | svg chevron (transition transform conditional rotate) — **옵션 M 채택** | className: `transition-transform duration-150 ${isCollapsed ? '-rotate-90' : 'rotate-0'}` + svg attrs (width/height/viewBox/fill/stroke/strokeWidth/strokeLinecap/strokeLinejoin) JSX prop 보존 |
|       L133–142 | 사용자 카드 (height 56 bg borderTop padding flex items-center justify-between flexShrink) | `h-14 bg-surface-raised border-t border-border-default px-4 flex items-center justify-between flex-shrink-0`                  |
|         L143   | 사용자 정보 column (flex column gap 2 minWidth 0) | `flex flex-col gap-0.5 min-w-0`                                                                                               |
|       L144–151 | 사용자 이름 span (fontSize 12 fontWeight 700 color overflow textOverflow whiteSpace) | `text-[12px] font-bold text-text-primary overflow-hidden text-ellipsis whitespace-nowrap`                                     |
|         L154   | 역할 span (fontSize 11 fontWeight 400 color) | `text-[11px] font-normal text-text-secondary`                                                                                 |
|       L161–169 | Settings btn (bg border cursor padding flex items-center opacity 0.8) — **onMouseEnter/Leave handler 보존** | className: `bg-transparent border-0 cursor-pointer p-1 flex items-center opacity-80` + handler 코드 보존 (`onMouseEnter={e => (e.currentTarget.style.opacity = '1')}` / `onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}`) |
|       L200–213 | NavItem btn (display flex items-center w-full h 36 padding bg border borderLeft cursor pointerEvents textAlign gap 4) — **옵션 M 동적 bg/borderLeft/cursor/pointerEvents** | className: `flex items-center w-full h-9 px-4 border-0 text-left gap-1 ${active ? 'bg-surface-active border-l-[3px] border-l-accent' : hovered ? 'bg-surface-sunken border-l-[3px] border-l-transparent' : 'bg-transparent border-l-[3px] border-l-transparent'} ${soon ? 'cursor-default pointer-events-none' : 'cursor-pointer'}` |
|       L215–223 | NavItem label span (flex 1 fontSize 14 fontWeight 400 color overflow textOverflow whiteSpace) — **옵션 M 동적 color** | className: `flex-1 text-[14px] font-normal overflow-hidden text-ellipsis whitespace-nowrap ${soon ? 'text-text-tertiary' : active ? 'text-accent' : 'text-text-primary'}` |
|       L227–238 | NavItem badge span (inline-flex items-center justify-center 16x16 borderRadius bg color fontSize 11 fontWeight 700 flexShrink) | `inline-flex items-center justify-center w-4 h-4 rounded-lg bg-danger-bar text-white text-[11px] font-bold flex-shrink-0`     |

**옵션 N 잔존 예상 (~2건):**
1. svg chevron — 옵션 M 채택 시 0 inline. (가능)
2. (필요 시) 잔존 마이너

**참고:**
- `NavItem` 의 const `bg = active ? ... : hovered ? ... : ...` / `color = soon ? ... : active ? ... : ...` 변수는 옵션 M conditional className 화 후 dead code → 제거. JSX 참조처 사라짐 → 0 byte 시각/비즈 무영향. **NavItem 의 dead code 제거 권장** (s07 의 `pad` dead code 제거 패턴 동일).

---

## Tasks

<tasks>

<task type="auto">
  <name>Plan 01 Task 1: InstallPrompt.tsx 41 inline → tailwind (단일 atomic)</name>
  <files>src/components/InstallPrompt.tsx</files>
  <action>
    1. CWD = `/Users/jykevin/Documents/cbc7119-design/cha-bio-safety` 확인.
    2. `git checkout main` 확인, working tree clean 확인.
    3. `src/components/InstallPrompt.tsx` (239줄, 41 inline) 변환:
       - 위 "Plan 01 라인별 변환" 표 26항목 적용
       - **옵션 X**: 모든 정확값 arbitrary `[Npx]` (28px / 16x16 → 옵션 X)
       - **옵션 P**: 작은 컨테이너 안 text-caption/text-label 은 `leading-none` 명시 (기존 className 에 이미 포함된 경우 그대로)
       - **옵션 M**: 3-state 분기 (`!showIOSGuide && !showAndroidGuide` / `showAndroidGuide` / iOS) 안 IDENTICAL 패턴 (Android guide 3 numbered item + iOS guide 3 numbered item = 28x28 number circle + label/desc × 6) 일괄 IDENTICAL className 적용
       - **옵션 N 보존 (2건)**: L128 `<span style={{ fontSize: 16 }}>⋮</span>` + L169 `<span style={{ fontSize: 16, verticalAlign: 'middle' }}>⎋</span>` — 단순 emoji 강조 span 은 inline 보존
       - **module export 함수 N 보존**: `isStandalone()` / `isIOS()` (module scope) + `shouldShowInstallPrompt()` / `dismissInstallPrompt()` (export) 정의 0 byte
       - **비즈 anchor IDENTICAL**: 4 onClick / 2 useState / 1 useEffect / 0 useRef/useMutation/useQuery/useNavigate/useParams/fetch/useCallback
       - **emoji IDENTICAL**: ⋮ 1건 + ⎋ 1건 = 2건 (변동 0)
    4. 변환 후 verify block 실행 (전 plan 공통 verify 표 — 본 PLAN.md 하단 참조).
    5. 시각 0 byte 변경 확인 (PWA 미설치 시 splash 진입 → InstallPrompt 모달 → default state / Android guide / iOS guide 3-state 모두 픽셀 1:1 비교).
    6. `git add src/components/InstallPrompt.tsx` + commit:
       ```
       refactor(260529-sqk-01): Phase B Wave 16b-1 — InstallPrompt 41 inline → tailwind (Tier 3 components batch, 24번째 atomic)
       ```
    7. push (자동 cbc7119-preview 배포 트리거).
  </action>
  <verify>
    <automated>
      cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && \
      BEFORE=$(git show HEAD~1:src/components/InstallPrompt.tsx | grep -c 'style={{') && \
      AFTER=$(grep -c 'style={{' src/components/InstallPrompt.tsx) && \
      echo "InstallPrompt inline: $BEFORE → $AFTER (target ≤ 5)" && \
      [ "$AFTER" -le 5 ] && echo "PASS" || echo "FAIL"
    </automated>
  </verify>
  <done>
    - InstallPrompt.tsx inline 41 → ≤5 (옵션 N 잔존)
    - 비즈 anchor 9 패턴 IDENTICAL
    - emoji 변동 0 (⋮ 1 + ⎋ 1 = 2)
    - module 함수 4건 (isStandalone/isIOS/shouldShowInstallPrompt/dismissInstallPrompt) 0 byte
    - TypeScript 0 error
    - vite build PWA generation PASS
    - 시각 0 byte (default + Android guide + iOS guide 3-state 픽셀 1:1)
    - commit pushed (cbc7119-preview 자동 배포)
  </done>
</task>

<task type="auto">
  <name>Plan 02 Task 1: ExcelPreview.tsx 18 inline + DesktopSidebar.tsx 17 inline → tailwind (bundle atomic)</name>
  <files>src/components/ExcelPreview.tsx, src/components/DesktopSidebar.tsx</files>
  <action>
    1. CWD = `/Users/jykevin/Documents/cbc7119-design/cha-bio-safety` 확인.
    2. Plan 01 commit 이후 working tree clean 확인.
    3. **Part A: ExcelPreview.tsx (535줄, 18 inline) 변환**:
       - 위 "Plan 02 Part A 라인별 변환" 표 18항목 적용
       - **옵션 N 보존 룰 (~10건)**:
         a. L393–400 overlay 영역 — `imgRect` 4-prop 동적 + `position` / `pointerEvents` / `cursor` / `touchAction` 동적 ternary → **전체 inline 보존**
         b. L406–415 overlay map span — `item.x` / `item.y` / `item.fontSize` / `item.color` / `item.fontWeight` 5-prop 동적 → **전체 inline 보존**
         c. L443–448 step circle — `CALIB_STEPS[calibStep].color` 1-prop 동적 → **bg props 만 inline 보존, 나머지 className**
         d. L473–480 위치 설정 btn — `hasCalib` 2-state → **옵션 M template literal className 채택 (inline 0 prop)**
         e. L504–509 CalibMarker root — `x` / `y` 2-prop 동적 → **전체 inline 보존**
         f. L511–514 가로 십자선 — `color` props 1-prop → **bg props 만 inline 보존, 나머지 className**
         g. L515–518 세로 십자선 — IDENTICAL to f
         h. L520–530 중심점 — `width` / `height` / `color` 3-prop 동적 → **dynamic props 만 inline 보존, 나머지 className**
       - **module data const N 보존**: `PREVIEW_IMAGES` / `REPORT_GRID` / `MATRIX_TYPES` / `MATRIX_CATEGORIES` / `CALIB_STEPS` / `FINGER_OFFSET` / `DL` / `DR` / `DY` 전부 0 byte
       - **module 함수 N 보존**: `fetchKey` / `loadCalib` / `saveCalib` / `calcGrid` / `buildDivOverlay` / `buildCheckOverlay` / `buildPumpOverlay` / `buildOverlay` 정의 0 byte
       - **비즈 anchor IDENTICAL**: 5 onClick / 2 useState / 1 useRef / 1 useEffect / 9 useCallback / 1 useQuery / 0 useMutation/useNavigate/useParams/fetch
       - **emoji IDENTICAL**: ⚠ 1건 (변동 0)
    4. **Part B: DesktopSidebar.tsx (245줄, 17 inline) 변환**:
       - 위 "Plan 02 Part B 라인별 변환" 표 16항목 적용
       - **옵션 M 채택**:
         - svg chevron transform (`transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'`) → template literal `${isCollapsed ? '-rotate-90' : 'rotate-0'} transition-transform duration-150`
         - NavItem btn bg/borderLeft (`active ? var(--bg4) : hovered ? var(--bg3) : transparent`) → template literal conditional
         - NavItem label color (`soon ? var(--t3) : active ? var(--acl) : var(--t1)`) → template literal conditional
       - **dead code 제거**: NavItem 의 `const bg = ...` / `const color = ...` 변수 dead code → 제거 (옵션 M conditional className 직접 적용 후 참조 없음)
       - **onMouseEnter/Leave handler 보존**: Settings btn 의 `e.currentTarget.style.opacity` DOM 조작 코드 보존 (className 화 불가)
       - **Lucide 보존**: Settings size={16} color="var(--t2)" prop 보존
       - **module data const N 보존**: `DESKTOP_SECTIONS` (L8-13) 0 byte
       - **비즈 anchor IDENTICAL**: 4 onClick / 1 useState / 1 useNavigate / 0 useRef/useEffect/useMutation/useQuery/useParams/fetch/useCallback
       - **emoji IDENTICAL**: 0건 (변동 0)
    5. 양 파일 변환 후 verify block 실행 (하단 공통 verify 표).
    6. 시각 0 byte 변경 확인:
       - ExcelPreview: documents 페이지 진입 → 점검일지 선택 → 미리보기 모달 → 오버레이 좌표 정확 + 캘리브레이션 모드 진입 후 마커 정확
       - DesktopSidebar: 데스크톱 (1920x1080) 진입 → 사이드바 nav 항목 hover/active/soon 모두 픽셀 1:1
    7. `git add src/components/ExcelPreview.tsx src/components/DesktopSidebar.tsx` + commit:
       ```
       refactor(260529-sqk-02): Phase B Wave 16b-2 — ExcelPreview + DesktopSidebar bundle 35 inline → tailwind (Wave 16b 페어 완결, 25번째 atomic)
       ```
    8. push (자동 cbc7119-preview 배포 트리거).
  </action>
  <verify>
    <automated>
      cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety && \
      for F in src/components/ExcelPreview.tsx src/components/DesktopSidebar.tsx; do \
        BEFORE=$(git show HEAD~1:$F | grep -c 'style={{'); \
        AFTER=$(grep -c 'style={{' $F); \
        echo "$F inline: $BEFORE → $AFTER"; \
      done && \
      EP=$(grep -c 'style={{' src/components/ExcelPreview.tsx) && \
      DS=$(grep -c 'style={{' src/components/DesktopSidebar.tsx) && \
      [ "$EP" -le 10 ] && [ "$DS" -le 2 ] && echo "PASS" || echo "FAIL"
    </automated>
  </verify>
  <done>
    - ExcelPreview.tsx inline 18 → ≤10 (옵션 N 잔존 — 동적 좌표/색)
    - DesktopSidebar.tsx inline 17 → ≤2 (옵션 N 잔존 — 거의 0)
    - 양 파일 비즈 anchor IDENTICAL
    - emoji 변동 0 (ExcelPreview ⚠ 1 + DesktopSidebar 0)
    - module data const + 모듈 함수 0 byte (ExcelPreview 9 const + 8 함수, DesktopSidebar 1 const)
    - NavItem 의 `bg`/`color` const dead code 제거 완료
    - Settings btn onMouseEnter/Leave handler 보존
    - Lucide Settings icon 보존
    - TypeScript 0 error
    - vite build PWA generation PASS
    - 시각 0 byte (ExcelPreview 오버레이 좌표 정확 + 캘리브레이션 마커 + DesktopSidebar nav hover/active/soon 픽셀 1:1)
    - commit pushed (cbc7119-preview 자동 배포)
    - **Wave 16b 페어 완결 마커**
  </done>
</task>

</tasks>

---

## 자동 검증 block (PLAN.md 필수 — 양 plan 종결 후 실행)

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety

# [1] inline count
for F in src/components/InstallPrompt.tsx src/components/ExcelPreview.tsx src/components/DesktopSidebar.tsx; do
  B=$(git show HEAD~2:$F | grep -c 'style={{')
  A=$(grep -c 'style={{' $F)
  echo "$F: $B → $A"
done

# [2] 비즈 anchor identity (전 파일 9 patterns IDENTICAL)
for F in src/components/InstallPrompt.tsx src/components/ExcelPreview.tsx src/components/DesktopSidebar.tsx; do
  for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\(' 'useCallback\('; do
    B=$(git show HEAD~2:$F | grep -cE "$ANCHOR")
    A=$(grep -cE "$ANCHOR" $F)
    [ "$B" = "$A" ] && echo "$F $ANCHOR: $B (OK)" || echo "$F $ANCHOR: $B→$A MISMATCH ❌"
  done
done

# [3] emoji invariant (변동 0)
for F in src/components/InstallPrompt.tsx src/components/ExcelPreview.tsx src/components/DesktopSidebar.tsx; do
  B=$(git show HEAD~2:$F | grep -cE '⋮|⎋|⚠|✕|✓|✗|🔒|💾|🔥|⏰|📋|✅|⚠️|❌|🔧|🚨|🔍|🧯|📊|📷')
  A=$(grep -cE '⋮|⎋|⚠|✕|✓|✗|🔒|💾|🔥|⏰|📋|✅|⚠️|❌|🔧|🚨|🔍|🧯|📊|📷' $F)
  [ "$B" = "$A" ] && echo "$F emoji: $B (OK)" || echo "$F emoji: $B→$A MISMATCH ❌"
done

# [4] module data const / 함수 N 보존 (정의 IDENTICAL)
echo "=== module const / 함수 N 보존 ==="
git diff HEAD~2 HEAD -- src/components/InstallPrompt.tsx | grep -E '^[-+]function isStandalone|^[-+]function isIOS|^[-+]export function shouldShow|^[-+]export function dismiss' | head -10
git diff HEAD~2 HEAD -- src/components/ExcelPreview.tsx | grep -E '^[-+]const PREVIEW_IMAGES|^[-+]const REPORT_GRID|^[-+]const MATRIX_TYPES|^[-+]const MATRIX_CATEGORIES|^[-+]const CALIB_STEPS|^[-+]const FINGER_OFFSET|^[-+]const DL|^[-+]const DR|^[-+]const DY|^[-+]function fetchKey|^[-+]function loadCalib|^[-+]function saveCalib|^[-+]function calcGrid|^[-+]function buildDivOverlay|^[-+]function buildCheckOverlay|^[-+]function buildPumpOverlay|^[-+]function buildOverlay' | head -10
git diff HEAD~2 HEAD -- src/components/DesktopSidebar.tsx | grep -E '^[-+]const DESKTOP_SECTIONS' | head -10
# (출력 empty = 정의 0 byte 보존 PASS)

# [5] 비표준 색 토큰 = 0 (Tailwind config 외 색 클래스 없음)
for F in src/components/InstallPrompt.tsx src/components/ExcelPreview.tsx src/components/DesktopSidebar.tsx; do
  # 허용된 패턴: bg-surface-* / text-text-* / border-border-* / bg-accent / text-accent / bg-safe-bar / text-warning / bg-warning-bg / border-warning / bg-danger-bar / bg-accent/15 / arbitrary [rgba(...)] 또는 [#hex] 또는 [Npx]
  # 비표준 패턴: bg-status- prefix 사용 (text-status-fire-bar 등은 ❌, text-fire-bar 가 정답)
  NONSTD=$(grep -cE 'bg-status-|text-status-|border-status-' $F)
  echo "$F 비표준 토큰: $NONSTD (0 expected)"
done

# [6] TypeScript 0 error
./node_modules/.bin/tsc --noEmit 2>&1 | grep -E 'error TS' | wc -l
# (0 expected)

# [7] vite build (PWA generation)
npm run build 2>&1 | tail -20
# (built X.Xs + sw 25.19 kB expected)

# [8] off-scope 변경 0 (양 plan 합산)
git diff HEAD~2 HEAD --stat -- . ':!src/components/InstallPrompt.tsx' ':!src/components/ExcelPreview.tsx' ':!src/components/DesktopSidebar.tsx' | head -5
# (출력 empty = off-scope 0)
```

---

## 메모리 anchor 적용 (양 plan 공통)

- `feedback_tailwind_w8_h8_is_48px.md` — w-8=48px 함정 회피. InstallPrompt 28x28 number circle 6건 → `w-[28px] h-[28px]` (w-7=32px 함정 회피). DesktopSidebar w-[30px] h-[30px] 로고 / w-[54px] header / w-4 h-4 badge (16x16 OK, w-4=16) 검증
- `feedback_tailwind_token_class_pattern.md` — `text-danger-bar` (text-status-danger-bar 아님) / `bg-accent` (bg-status-accent 아님) 검증
- `feedback_text_caption_leading_none.md` — InstallPrompt 의 작은 컨테이너 안 text-caption/text-label 은 `leading-none` 명시. number circle 안 `leading-none` 유지
- `feedback_inspection_unresolved_color.md` — N/A (지적사항 색 무관)
- `feedback_design_changes_ask_first.md` — 디자인 변경 0 (no-op refactor 한정)
- `feedback_planner_prompt_sketch_verbatim.md` — 본 plan 의 라인별 변환 표는 grep 으로 추출한 inline 정의 그대로 매핑
- s07 precedent — module-scope data const + 모듈 함수 0 byte 보존 (ExcelPreview 9 const + 8 함수, InstallPrompt 4 함수, DesktopSidebar 1 const)
- q5a precedent — partial conversion (옵션 N 잔존 허용)
- 16a precedent — dual-render IDENTICAL 패턴 (InstallPrompt 3-state 분기 안 IDENTICAL markup 일괄 변환)

---

## 다음 단계

- **Wave 16c** (소형 components batch 후보 — Wave 16 시리즈 종결 가능)
- 또는 **묶음 D production cherry-pick** — Tier 2 + Tier 3 누적 wave 묶음 직원 도메인 production 적용 결정
- 사용자 컨펌 게이트: cbc7119-preview 자동 deploy 후 시각 검증
  - InstallPrompt: PWA 미설치 splash 진입 → 모달 → default/Android/iOS 3-state 픽셀 1:1
  - ExcelPreview: documents 페이지 → 점검일지 선택 → 미리보기 모달 → 오버레이 좌표 정확 + 캘리브레이션 마커
  - DesktopSidebar: 데스크톱 (1920x1080) 진입 → nav hover/active/soon

---

## Self-Check

- [x] src/components/InstallPrompt.tsx FOUND (239줄, 41 inline)
- [x] src/components/ExcelPreview.tsx FOUND (535줄, 18 inline)
- [x] src/components/DesktopSidebar.tsx FOUND (245줄, 17 inline)
- [x] 합산 76 inline 확인
- [x] 분할 결정 명시: **B (2분할)** — Plan 01 InstallPrompt 41 단독 + Plan 02 ExcelPreview + DesktopSidebar 35 bundle
- [x] 16a precedent (77 → 43+34) 비례 적용
- [x] 라인별 변환 매핑 3 파일 모두 작성
- [x] 옵션 N 잔존 정량 추정 (Plan 01: 2건 / Plan 02 Part A: ~10건 / Plan 02 Part B: ~2건)
- [x] 자동 검증 block 작성 (inline count + 비즈 anchor + emoji + module const/함수 N + 비표준 토큰 + TypeScript + vite build + off-scope)
- [x] 메모리 anchor 적용 명시 (w-7/h-7 함정 / token prefix / leading-none / sketch verbatim / s07 module const / q5a partial / 16a IDENTICAL)
- [x] CWD = `/Users/jykevin/Documents/cbc7119-design/cha-bio-safety` 명시
- [x] commit message 양식 명시
- [x] 사용자 컨펌 게이트 (cbc7119-preview 시각 검증 절차) 명시
