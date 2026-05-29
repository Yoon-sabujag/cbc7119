---
phase: 260529-sqk-phase-b-wave-16b-mid-components-batch
plan: 01 + 02 (16b-1 InstallPrompt + 16b-2 ExcelPreview + DesktopSidebar bundle 완결)
subsystem: redesign/phase-b-sweep
status: complete
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
  - 3-state-render-pattern
  - calibration-marker-preserve
  - sidebar-nav-conversion
  - split-b-pair-complete
  - option-m-conditional-className
provides:
  - InstallPrompt.tsx Phase B Wave 16b-1 atomic 완료 — 41 inline → 2 옵션 N 잔존 (-39, -95%) [Plan 01]
  - ExcelPreview.tsx Phase B Wave 16b-2-A atomic 완료 — 18 inline → 7 옵션 N 잔존 (-11, -61%) [Plan 02 part A]
  - DesktopSidebar.tsx Phase B Wave 16b-2-B atomic 완료 — 17 inline → 0 옵션 N 잔존 (-17, -100%) [Plan 02 part B]
  - **Tier 3 components batch 24번째 + 25번째 atomic 누적 완결** — s07-02 23번째 다음 (sqk-01 24번째 InstallPrompt + sqk-02 25번째 ExcelPreview+DesktopSidebar bundle)
  - **dynamic coordinate overlay preserve 패턴 첫 박제** — ExcelPreview 의 `style={{ left: `${item.x}%`, top: `${item.y}%`, fontSize: item.fontSize ?? 10 ... }}` 동적 좌표/색/사이즈 inline 보존 (overlay map 4 prop + CalibMarker 4 inline 보존)
  - **3-state render IDENTICAL 패턴 변환** — InstallPrompt 의 (default / Android guide / iOS guide) 3-state 분기 안 IDENTICAL 패턴 (28x28 number circle × 6 + guide 항목 × 6) 일괄 변환 검증 통과 [Plan 01]
  - **옵션 M conditional className 첫 multi-state 박제** — DesktopSidebar NavItem 의 3-state bg (active/hovered/transparent) + 3-state color (soon/active/default) + svg chevron rotate 모두 template literal `${cond ? 'class-a' : 'class-b'}` 변환 후 const dead code 제거
  - **rounded-md/rounded-lg 사이드 함정 박제** — Tailwind 설정 override (md=12, lg=16) 가 spec 6/8 과 mismatch 발생 → arbitrary `rounded-[6px]` / `rounded-[8px]` 강제 사용
  - 시각 0 byte (모달 backdrop + 카드 + 아이콘 + 3-state + 오버레이 좌표 + 캘리브레이션 마커 + 사이드바 nav hover/active/soon 픽셀 1:1)
  - module export 함수 N 보존 (InstallPrompt 4건 / ExcelPreview 9 data const + 8 helper 함수 / DesktopSidebar 1 const 정의 0 byte)
  - 비즈 anchor IDENTICAL (전 파일 10 패턴 변경 0)
  - **Wave 16b 페어 완결 마커** — Wave 16c (소형 components batch) 또는 묶음 D production cherry-pick 결정 진입 가능
affects:
  - src/components/InstallPrompt.tsx [Plan 01 — a46d695]
  - src/components/ExcelPreview.tsx [Plan 02]
  - src/components/DesktopSidebar.tsx [Plan 02]
key-files:
  modified:
    - src/components/InstallPrompt.tsx (239줄 → 193줄, -46줄/-19%, 41 inline → 2 inline) [Plan 01]
    - src/components/ExcelPreview.tsx (535줄, 18 inline → 7 inline) [Plan 02]
    - src/components/DesktopSidebar.tsx (245줄, 17 inline → 0 inline) [Plan 02]
decisions:
  - "옵션 X+P+M+색변수N 23 wave 승계 적용 — 사용자 재컨펌 없이 자동 도달 (0hr roadmap locked)"
  - "분할 B 채택 완결 — Plan 01 (InstallPrompt 41 단독) + Plan 02 (ExcelPreview 18 + DesktopSidebar 17 bundle) 2 atomic. 16a precedent (77 → 43+34 → 본 76 → 41+35) 비례 적용 성공"
  - "Plan 01 옵션 N 2건 보존 — `<span style={{ fontSize: 16 }}>⋮</span>` (L97) + `<span style={{ fontSize: 16, verticalAlign: 'middle' }}>⎋</span>` (L138) 단순 emoji 강조 span"
  - "Plan 02 ExcelPreview 옵션 N 7건 보존 — 동적 좌표/색 inline 필수 (overlay 영역 imgRect 4-prop + overlay map 5-prop dynamic + calibration step circle 1-prop dynamic + CalibMarker root 2-prop + 가로 십자선 1-prop + 세로 십자선 1-prop + 중심점 3-prop)"
  - "Plan 02 DesktopSidebar 옵션 N 0건 — 모든 동적 prop 옵션 M template literal conditional className 로 변환 성공 (svg chevron rotate / NavItem bg+borderLeft / NavItem label color)"
  - "NavItem `const bg` / `const color` dead code 제거 — 옵션 M conditional className 직접 적용 후 변수 참조 사라짐. s07 의 `pad` dead code 제거 패턴 동일"
  - "Settings btn onMouseEnter/Leave handler 보존 — `e.currentTarget.style.opacity` DOM 조작은 className 화 불가 → handler 코드 0 byte 보존"
  - "**rounded-md/rounded-lg 함정 박제 (신규)** — Tailwind 설정 override (`md: 12px / lg: 16px`) 가 spec `borderRadius: 6` / `borderRadius: 8` 과 mismatch → `rounded-[6px]` / `rounded-[8px]` arbitrary 강제 사용. ExcelPreview 확인/스킵/취소 btn 3건 + 위치 설정 btn 1건 + DesktopSidebar 로고 img 1건 + NavItem badge 1건 = 총 6건 적용"
  - "**bg-surface-page 매핑 확정** — `background: 'var(--bg)'` → `var(--bg)` = `var(--surface-page)` alias → `bg-surface-page` className. tokens.css L178 alias 검증 완료"
  - "**bg-danger-bar 매핑 확정** — `background: 'var(--danger)'` → `var(--danger)` = `var(--status-danger-bar)` alias → `bg-danger-bar` className. tokens.css L191 alias 검증 완료"
metrics:
  duration: "약 18분 (Plan 01 8분 + Plan 02 10분, 검증 포함)"
  completed: "2026-05-29"
  tasks: "2/2 (양 plan 완료)"
  files-modified: 3
  lines-changed: "-46 (Plan 01) / Plan 02 net ~+5 (옵션 M conditional className 확장 — NavItem dead code 제거로 일부 상쇄)"
  inline-reduction: "76 → 9 (-67, -88% 합산) / Plan 01: 41→2 / Plan 02 part A: 18→7 / Plan 02 part B: 17→0"
roadmap-wave: "Tier 3 / Wave 16b 페어 완결 (Plan 01 + Plan 02 모두 완결, 25번째 atomic 누적)"
---

# Phase 260529-sqk Wave 16b — 중형 컴포넌트 batch 페어 완결 Summary

InstallPrompt.tsx (239줄, 41 inline) + ExcelPreview.tsx (535줄, 18 inline) + DesktopSidebar.tsx (245줄, 17 inline) = **76 inline → 9 옵션 N 잔존** (-67, -88% 합산). Tier 3 components batch 25번째 atomic 누적 완료. dynamic coordinate overlay preserve + 3-state IDENTICAL pattern + 옵션 M multi-state conditional className 3개 신규 패턴 박제.

**Wave 16b 페어 완결 → Wave 16c (소형 components batch) 또는 묶음 D production cherry-pick 결정 진입 가능.**

---

## 변환 요약 (3 컴포넌트)

### Plan 01 — InstallPrompt.tsx (commit a46d695)

| 영역 | Before | After | 비고 |
|---|---|---|---|
| outer fixed backdrop | 5-prop inline | `fixed inset-0 z-[9999] bg-[rgba(0,0,0,0.85)] flex items-center justify-center p-6` | 정적 |
| 카드 box | 5-prop inline | `px-6 pt-7 pb-7 max-w-[340px] w-full text-center border ...` | 정적 |
| 아이콘 wrap (64x64) | 5-prop inline | `w-16 h-16 mx-auto mb-4 bg-[rgba(37,99,235,0.2)] border ...` | 정적 |
| 아이콘 img (48x48) | 3-prop inline | `w-12 h-12 rounded-xl` | 정적 |
| h2 / p margin | 2-prop inline × 2 | `mb-2 mt-0` / `mb-5 mt-0` | 정적 |
| 기본 버튼 column | 3-prop inline | `flex flex-col gap-2.5` | 정적 |
| 설치 / 취소 btn | 5-prop inline × 2 | `w-full h-12 border-0 cursor-pointer` 등 | 정적 |
| Android 안내 박스 | 3-prop inline | `border border-warning/25 px-2.5 py-2 mb-3.5` | 정적 |
| Android / iOS guide 12× (column / row / circle / label / desc) | 5-prop × 12 | IDENTICAL className 일괄 적용 | **3-state 패턴 박제** |
| Android / iOS 확인 btn | 5-prop inline × 2 | `w-full h-11 mt-[18px] border ...` | 정적 |
| **⋮ span (L97)** | `style={{ fontSize: 16 }}` | **유지** | **옵션 N #1** |
| **⎋ span (L138)** | `style={{ fontSize: 16, verticalAlign: 'middle' }}` | **유지** | **옵션 N #2** |

### Plan 02 part A — ExcelPreview.tsx

| 영역 | Before | After | 비고 |
|---|---|---|---|
| container | 7-prop inline | `w-full h-full flex items-center justify-center overflow-hidden bg-surface-page relative` | 정적 (`--bg` → `bg-surface-page`) |
| 선택 안내 span | 2-prop inline | `text-[14px] text-text-secondary` | 정적 |
| preview img | 5-prop inline | `max-w-full max-h-full object-contain shadow-[0_4px_24px_rgba(0,0,0,0.3)] rounded bg-white` | 정적 |
| **overlay 영역 (imgRect)** | 7-prop inline | **inline 보존** | **옵션 N #1** (4-prop dynamic + 3-prop ternary) |
| **overlay map span (overlay.map)** | 9-prop inline | **inline 보존** | **옵션 N #2** (5-prop dynamic) |
| calibration 안내 바 | 11-prop inline | `absolute top-2 left-1/2 -translate-x-1/2 bg-[rgba(0,0,0,0.9)] text-white px-5 py-2.5 rounded-[10px] text-[14px] font-bold flex items-center gap-4 z-10 shadow-[0_4px_12px_rgba(0,0,0,0.3)]` | 정적 |
| **step circle** | 6-prop inline | className + `style={{ background: CALIB_STEPS[calibStep].color }}` 1-prop 보존 | **옵션 N #3** |
| step 안내 span | 2-prop inline | `text-[11px] text-[#aaa]` | 정적 |
| 확인 btn | 7-prop inline | `bg-[#22c55e] border-0 text-white px-4 py-1.5 rounded-[6px] cursor-pointer text-[13px] font-bold` | 정적 (rounded-[6px] arbitrary) |
| 스킵 btn | 6-prop inline | `bg-white/30 border-0 text-white px-3.5 py-1.5 rounded-[6px] cursor-pointer text-[12px]` | 정적 |
| 취소 btn | 6-prop inline | `bg-white/15 border-0 text-white px-3.5 py-1.5 rounded-[6px] cursor-pointer text-[12px]` | 정적 |
| 위치 설정 btn | 9-prop inline | className template literal `... ${hasCalib ? 'bg-[rgba(0,0,0,0.6)]' : 'bg-[rgba(239,68,68,0.9)]'}` | **옵션 M 변환** |
| loading overlay | 5-prop inline | `absolute inset-0 flex items-center justify-center bg-white/70 rounded` | 정적 |
| loading span | 2-prop inline | `text-[12px] text-[#666]` | 정적 |
| **CalibMarker root** | 4-prop inline | className + `style={{ left: '${x}%', top: '${y}%' }}` 보존 | **옵션 N #4** |
| **CalibMarker 가로 십자선** | 5-prop inline | className + `style={{ background: color }}` 보존 | **옵션 N #5** |
| **CalibMarker 세로 십자선** | 5-prop inline | className + `style={{ background: color }}` 보존 | **옵션 N #6** |
| **CalibMarker 중심점** | 10-prop inline | className + `style={{ width, height, background }}` 3-prop 보존 | **옵션 N #7** |

### Plan 02 part B — DesktopSidebar.tsx

| 영역 | Before | After | 비고 |
|---|---|---|---|
| root container | 7-prop inline | `w-[280px] flex-shrink-0 h-dvh bg-surface-raised border-r border-border-default flex flex-col` | 정적 |
| 로고 스트립 | 10-prop inline | `h-[54px] box-border px-4 bg-surface-raised border-b border-border-default flex items-center gap-2.5 flex-shrink-0 cursor-pointer` | 정적 |
| 로고 img | 4-prop inline | `w-[30px] h-[30px] rounded-[8px] flex-shrink-0` | 정적 (rounded-[8px] arbitrary 함정 회피) |
| 회사명 div | 3-prop inline | `text-[13px] font-bold text-text-primary` | 정적 |
| 부제 div | 3-prop inline | `text-[9.5px] text-text-tertiary mt-px` | 정적 |
| 스크롤 nav | 4-prop inline | `flex-1 overflow-auto flex flex-col justify-evenly` | 정적 |
| 섹션 라벨 btn | 13-prop inline | `flex items-center w-full text-left text-[11px] font-bold text-text-secondary uppercase pt-2 px-4 pb-1 bg-transparent border-0 cursor-pointer tracking-[0.05em]` | 정적 |
| 라벨 span | 1-prop inline | `flex-1` | 정적 |
| svg chevron | 2-prop inline | className `transition-transform duration-150 ${isCollapsed ? '-rotate-90' : 'rotate-0'}` | **옵션 M 변환** |
| 사용자 카드 | 8-prop inline | `h-14 bg-surface-raised border-t border-border-default px-4 flex items-center justify-between flex-shrink-0` | 정적 |
| 사용자 정보 column | 4-prop inline | `flex flex-col gap-0.5 min-w-0` | 정적 |
| 사용자 이름 span | 6-prop inline | `text-[12px] font-bold text-text-primary overflow-hidden text-ellipsis whitespace-nowrap` | 정적 |
| 역할 span | 3-prop inline | `text-[11px] font-normal text-text-secondary` | 정적 |
| Settings btn | 7-prop inline | `bg-transparent border-0 cursor-pointer p-1 flex items-center opacity-80` (handler 보존) | 정적 + onMouseEnter/Leave handler 0 byte |
| NavItem btn (옵션 M) | 11-prop inline | className 3-state conditional (`active/hovered/transparent` + `cursor-default/pointer` + `pointer-events-none/auto`) | **옵션 M 변환 + `const bg` dead code 제거** |
| NavItem label (옵션 M) | 7-prop inline | className 3-state conditional (`soon/active/default` color) | **옵션 M 변환 + `const color` dead code 제거** |
| NavItem badge | 9-prop inline | `inline-flex items-center justify-center w-4 h-4 rounded-[8px] bg-danger-bar text-white text-[11px] font-bold flex-shrink-0` | 정적 (`--danger` → `bg-danger-bar` 매핑 검증) |

---

## 합산 메트릭

| 항목 | Plan 01 | Plan 02 A | Plan 02 B | 합산 |
|---|---|---|---|---|
| inline before | 41 | 18 | 17 | **76** |
| inline after | 2 | 7 | 0 | **9** |
| 감소 | -39 (-95%) | -11 (-61%) | -17 (-100%) | **-67 (-88%)** |
| 옵션 N 잔존 | 2건 (emoji span) | 7건 (동적 좌표/색) | 0건 | **9건** |

---

## 자동 검증 결과 (Plan 02 양 파일)

```
[1] inline count
src/components/ExcelPreview.tsx: 18 → 7  (target ≤ 10) PASS
src/components/DesktopSidebar.tsx: 17 → 0  (target ≤ 2) PASS

[2] 비즈 anchor IDENTICAL (10 patterns × 2 파일 = 20 checks)
ExcelPreview: onClick=5 / useState=2 / useRef=1 / useEffect=1 / useMutation=0 / useQuery=0 (regex `<>` separator, 실제 1건 IDENTICAL) / useNavigate=0 / useParams=0 / fetch=0 / useCallback=9  (모두 OK)
DesktopSidebar: onClick=5 / useState=1 / useRef=0 / useEffect=0 / useMutation=0 / useQuery=0 / useNavigate=1 / useParams=0 / fetch=0 / useCallback=0  (모두 OK)

[3] emoji invariant
ExcelPreview ⚠: 1 → 1 (OK)
DesktopSidebar emoji: 0 → 0 (OK)

[4] module 함수/data const 보존
ExcelPreview 9 data const (PREVIEW_IMAGES/REPORT_GRID/MATRIX_TYPES/MATRIX_CATEGORIES/CALIB_STEPS/FINGER_OFFSET/DL/DR/DY) + 8 helper 함수 (fetchKey/loadCalib/saveCalib/calcGrid/buildDivOverlay/buildCheckOverlay/buildPumpOverlay/buildOverlay): 정의 diff = empty (0 byte 보존)
DesktopSidebar DESKTOP_SECTIONS: 정의 diff = empty (0 byte 보존)

[5] 비표준 토큰 (bg-status- / text-status- / border-status-)
ExcelPreview: 0 (PASS)
DesktopSidebar: 0 (PASS)

[6] TypeScript
error TS count: 0 (PASS)

[7] vite build
✓ built in 13.84s + sw 25.19 kB (PWA generation PASS)

[8] off-scope
git diff --stat -- . :!ExcelPreview.tsx :!DesktopSidebar.tsx: empty (PASS)
```

---

## 옵션 N 잔존 (의도된 9건)

### Plan 01 (2건)
1. **L97 — `<span style={{ fontSize: 16 }}>⋮</span>`** (Android Chrome 메뉴 emoji)
2. **L138 — `<span style={{ fontSize: 16, verticalAlign: 'middle' }}>⎋</span>`** (iOS Safari 공유 emoji)

### Plan 02 part A — ExcelPreview (7건)
1. **overlay 영역** — `imgRect.left/top/width/height` 4-prop dynamic + `position/pointerEvents/cursor/touchAction` ternary 도 inline 유지
2. **overlay map span** — `${item.x}%` / `${item.y}%` / `item.fontSize ?? 10` / `item.color ?? '#1a1a1a'` / `item.fontWeight ?? 700` 5-prop dynamic
3. **step circle bg** — `CALIB_STEPS[calibStep].color` 1-prop dynamic
4. **CalibMarker root** — `${x}%` / `${y}%` 2-prop dynamic
5. **CalibMarker 가로 십자선 bg** — `color` props 1-prop dynamic
6. **CalibMarker 세로 십자선 bg** — `color` props 1-prop dynamic
7. **CalibMarker 중심점** — `width: active ? 20 : 16` / `height: active ? 20 : 16` / `background: color` 3-prop dynamic

### Plan 02 part B — DesktopSidebar (0건)
완전 변환 — svg chevron / NavItem bg+borderLeft+cursor+pointer-events / NavItem label color 모두 옵션 M template literal 변환 성공. `const bg` / `const color` dead code 제거.

---

## 메모리 anchor 적용 결과

- `feedback_tailwind_w8_h8_is_48px.md` ✅ — Plan 01 28x28 number circle 6건 `w-[28px] h-[28px]` arbitrary 적용 / Plan 02 DesktopSidebar w-[30px] h-[30px] 로고 / h-[54px] header / w-4 h-4 badge (16x16, w-4=16 OK)
- `feedback_tailwind_token_class_pattern.md` ✅ — `bg-accent` / `text-text-primary` / `text-text-tertiary` / `bg-danger-bar` (status- prefix 0)
- `feedback_text_caption_leading_none.md` ✅ — Plan 01 number circle 안 `leading-none` 유지
- `feedback_design_changes_ask_first.md` ✅ — 디자인 변경 0 (no-op refactor)
- s07 precedent ✅ — module-scope data const + 모듈 함수 0 byte 보존 (ExcelPreview 9+8, DesktopSidebar 1)
- s07 dead code 제거 패턴 ✅ — NavItem `const bg` / `const color` dead code 제거 (s07 `pad` 패턴 동일)
- q5a precedent ✅ — partial conversion (옵션 N 잔존 허용)
- 16a precedent ✅ — dual-render IDENTICAL 패턴 (InstallPrompt 3-state 분기 안 IDENTICAL markup 일괄 변환)
- 14b precedent ✅ — 부분 변환 (ExcelPreview 동적 좌표 overlay map 옵션 N 다수 보존)

---

## 신규 박제 패턴 (다음 wave 참조용)

### 1. dynamic coordinate overlay preserve 패턴 (ExcelPreview)
- **트리거:** `style={{ left: '${x}%', top: '${y}%', ... }}` 처럼 좌표가 데이터 의존
- **해결:** 동적 prop 만 inline 보존, 정적 prop (transform / pointer-events / whiteSpace 등) 은 className 변환
- **예외 — 정적 prop 도 inline 유지하는 경우:** dynamic + static prop 가 의미적으로 강결합 (overlay map span 의 `position absolute + transform translate(-50%,-50%) + whiteSpace nowrap + lineHeight 1 + fontFamily` 전부 좌표 의존 의도) → 전체 inline 보존이 깔끔

### 2. 옵션 M multi-state conditional className 박제 (DesktopSidebar)
- **트리거:** `const bg = active ? X : hovered ? Y : Z` 처럼 3+ state 분기
- **해결:** template literal `${active ? 'class-x' : hovered ? 'class-y' : 'class-z'}` 직접 적용 + const dead code 제거
- **검증:** `const bg` / `const color` 변수 참조처 사라짐 → ESLint no-unused-vars 자동 감지 가능

### 3. rounded-md/rounded-lg 함정 박제 (양 plan)
- **함정:** Tailwind 설정 override (`md: 12px / lg: 16px`) 가 일반 spec (md=6 / lg=8) 과 mismatch
- **검증 룰:** className `rounded-(sm|md|lg|pill)` 사용 전 tailwind.config.js borderRadius 값 확인 필수
  - sm=8px / md=12px / lg=16px / pill=99px (본 프로젝트)
- **해결:** spec mismatch 시 arbitrary `rounded-[Npx]` 강제 사용 (Plan 02 적용 6건: 확인/스킵/취소/위치설정 btn + 로고 img + NavItem badge)

### 4. tokens.css alias chain 추적 (ExcelPreview / DesktopSidebar)
- **트리거:** `background: 'var(--bg)'` / `background: 'var(--danger)'` 처럼 alias 사용
- **해결:** tokens.css 에서 alias 끝점까지 추적 (`--bg` → `--surface-page` → `bg-surface-page` / `--danger` → `--status-danger-bar` → `bg-danger-bar`)
- **반복 사용 예상:** `--bg2/--bg3/--bg4` / `--t1/--t2/--t3` / `--acl` / `--bd` 매핑은 이미 6-7 wave 누적 → reference table 안정화

---

## Commits

| Plan | Commit | 메시지 | 파일 |
|---|---|---|---|
| Plan 01 (Wave 16b-1) | `a46d695` | `feat(260529-sqk-01): Phase B Wave 16b-1 — InstallPrompt 41 inline → tailwind` | InstallPrompt.tsx |
| Plan 02 (Wave 16b-2) | (이 atomic) | `feat(260529-sqk-02): Phase B Wave 16b-2 — ExcelPreview + DesktopSidebar (35 inline bundle) → tailwind` | ExcelPreview.tsx, DesktopSidebar.tsx |

---

## Tier 3 progress

| Wave | atomic | 파일 | inline | 상태 |
|---|---|---|---|---|
| 16a-1 (s07-01) | 23번째 | FindingEditModal | 40 → ~2 | ✅ |
| 16a-2 (s07-02) | 23번째 | FindingFormSheet | 31 → ~2 | ✅ |
| 16b-1 (sqk-01) | 24번째 | InstallPrompt | 41 → 2 | ✅ |
| 16b-2 (sqk-02) | 25번째 | ExcelPreview + DesktopSidebar | 35 → 7 | ✅ (본 wave) |
| **16a + 16b 페어 완결** | 25 atomic | 5 components | 147 → 13 | **완결** |

**다음 후보:**
- **Wave 16c** — 소형 components batch (Wave 16 시리즈 종결)
- **묶음 D production cherry-pick** — Tier 2 + Tier 3 누적 wave 묶음 직원 도메인 production 적용 결정

---

## 사용자 컨펌 게이트 (cbc7119-preview 자동 deploy 후 시각 검증)

- **InstallPrompt** (Plan 01): PWA 미설치 splash 진입 → 모달 → default/Android guide/iOS guide 3-state 픽셀 1:1
- **ExcelPreview** (Plan 02 A): documents 페이지 진입 → 점검일지 선택 → 미리보기 모달 → 오버레이 좌표 정확 + 캘리브레이션 모드 진입 후 마커 정확
- **DesktopSidebar** (Plan 02 B): 데스크톱 (1920x1080) 진입 → 사이드바 nav 항목 hover/active/soon 픽셀 1:1

---

## Self-Check: PASSED

- [x] src/components/InstallPrompt.tsx 변환 완료 (41 → 2 inline, -95%) [Plan 01]
- [x] src/components/ExcelPreview.tsx 변환 완료 (18 → 7 inline, -61%) [Plan 02 A]
- [x] src/components/DesktopSidebar.tsx 변환 완료 (17 → 0 inline, -100%) [Plan 02 B]
- [x] 합산 inline 76 → 9 (-67, -88%)
- [x] 비즈 anchor 10 patterns × 2 파일 IDENTICAL (Plan 02)
- [x] emoji invariant (⚠ 1 + 0 = 1)
- [x] module data const + 함수 0 byte 보존 (9 const + 8 함수 + 1 const)
- [x] NavItem `bg`/`color` const dead code 제거 완료
- [x] Settings btn onMouseEnter/Leave handler 보존
- [x] Lucide Settings icon 보존
- [x] TypeScript 0 error
- [x] vite build PWA generation PASS
- [x] 시각 0 byte (rounded-[6px]/rounded-[8px] arbitrary 함정 회피 + bg-surface-page/bg-danger-bar alias 매핑)
- [x] off-scope 변경 0 (양 plan)
- [x] 옵션 N 9건 의도된 잔존 (Plan 01: 2 / Plan 02 A: 7 / Plan 02 B: 0)
- [x] 통합 complete SUMMARY 작성 완료
