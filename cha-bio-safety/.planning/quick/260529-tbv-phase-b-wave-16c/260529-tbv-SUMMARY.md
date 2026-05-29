---
phase: 260529-tbv-phase-b-wave-16c-xs-components-batch
plan: 01 + 02 (Wave 16c 페어 완결 — Phase B 최종 wave)
subsystem: redesign/phase-b-sweep
status: complete
tags:
  - ui-index
  - photo-grid
  - bottom-nav
  - photo-button
  - settings-panel
  - svg-floor-plan
  - pdf-floor-plan
  - ui-icons
  - side-menu
  - document-upload-form
  - photo-source-modal
  - inline-style-to-tailwind
  - no-op-refactor
  - phase-b-tier-3-wave-16c
  - xs-components-batch
  - module-data-const-preserve
  - z-100-fixed-pattern-preserve
  - dynamic-color-token-via-inline
  - settings-panel-border-danger-cleanup
  - phase-b-final-completion
  - tier-1-tier-2-tier-3-all-complete
provides:
  # Plan 01 (Wave 16c-1 large-group, eb658dd — 이전 atomic)
  - "src/components/ui/index.tsx Phase B Wave 16c-1 atomic 완료 — 16 inline → 10 옵션 N 잔존 (-6, -38%) [Plan 01 Task 1]"
  - "src/components/PhotoGrid.tsx Phase B Wave 16c-1 atomic 완료 — 11 inline → 0 (-11, -100%) [Plan 01 Task 2]"
  - "src/components/BottomNav.tsx Phase B Wave 16c-1 atomic 완료 — 8 inline → 1 옵션 N 잔존 (-7, -88%) [Plan 01 Task 3]"
  - "src/components/PhotoButton.tsx Phase B Wave 16c-1 atomic 완료 — 7 inline → 0 (-7, -100%) [Plan 01 Task 4]"
  # Plan 02 (Wave 16c-2 small-group, 이 atomic)
  - "src/components/SettingsPanel.tsx Phase B Wave 16c-2 비색 cleanup 완료 — L143 `border-danger` → `border-danger-bar` 1건 정리 (화이트리스트 inline 4건 유지) [Plan 02 Task 1]"
  - "src/components/SvgFloorPlan.tsx Phase B Wave 16c-2 atomic 완료 — 3 inline → 0 (-3, -100%) [Plan 02 Task 2]"
  - "src/components/PdfFloorPlan.tsx Phase B Wave 16c-2 atomic 완료 — 3 inline → 0 (-3, -100%) [Plan 02 Task 3]"
  - "src/components/ui/icons.tsx Phase B Wave 16c-2 atomic 완료 — 2 inline → 0 (-2, -100%) spread combo className 분리 패턴 [Plan 02 Task 4]"
  - "src/components/SideMenu.tsx Phase B Wave 16c-2 검증만 완료 — 2 inline 화이트리스트 의도 보존 (open dynamic + cubic-bezier safe-area var) [Plan 02 Task 5]"
  - "src/components/DocumentUploadForm.tsx Phase B Wave 16c-2 atomic 완료 — 2 → 1 옵션 N 잔존 (-1, -50%, file input display:none → hidden) [Plan 02 Task 6]"
  - "src/components/PhotoSourceModal.tsx Phase B Wave 16c-2 검증만 완료 — 1 inline 화이트리스트 의도 보존 (safe-area paddingBottom calc) [Plan 02 Task 7]"
  # Phase B 종결 마커
  - "Tier 3 components batch 27번째 atomic 누적 완결 — tbv-01 26번째 (eb658dd) 다음 tbv-02 27번째 small-group + 비색 cleanup bundle"
  - "Wave 16c 페어 (Plan 01 + Plan 02) 완결 — 59 inline → 19 옵션 N 잔존 (-40, -68%) + 비색 1 → 0"
  - "Phase B 완전 종결 — Tier 1 (11 waves ~570 inline) + Tier 2 (8 waves 387 inline) + Tier 3 (5 atomic 212 inline) 누적 변환 ~88%"
  - "단일 atomic commit (7 컴포넌트 17 inline + 비색 1) 패턴 — Plan 02 small-group 분산 (평균 2.4 inline/file) bundle"
  - "SettingsPanel L143 `border-danger` → `border-danger-bar` (sqk-02 ExcelPreview 같은 bar variant 통일 / 비밀번호 불일치 form validation error 의도 — `feedback_inspection_unresolved_color.md` 미조치/조치 아님)"
  - "ui/icons spread combo `{ flexShrink: 0, ...style }` → `className=\`shrink-0${className ? \\` \\${className}\\` : ''}\`` + `style={style}` 분리 패턴 (옵션 N 0 도달)"
  - "DocumentUploadForm file input `style={{display:'none'}}` → `className=\"hidden\"` (Tailwind core utility 적용 — PhotoGrid 같은 패턴)"
  - "SvgFloorPlan + PdfFloorPlan 컨테이너 div + canvas/object + loading overlay 3건 모두 className 100% (`var(--t3)` → `text-text-tertiary`, `fontSize:13` → `text-label`)"
  - "시각 0 byte (도면 로딩 / 도면 컨테이너 / 커스텀 icon 6종 / 메뉴 / 업로드 파일 input / 사진 선택 모달 모두 픽셀 1:1) — SettingsPanel 비색 1건 제외 (~10% 색 농도 변화 의도)"
  - "비즈 anchor 9 patterns × 7 files = 63 checks 모두 IDENTICAL (onClick precise diff empty + useState/useEffect/useMutation/useQuery/useNavigate/fetch IDENTICAL)"
  - "묶음 D production cherry-pick 후보 진입 가능 — Tier 2 + Tier 3 누적 wave 묶음 검토 (메모리 anchor: feedback_production_sync_protocol.md)"
affects:
  # Plan 01
  - src/components/ui/index.tsx
  - src/components/PhotoGrid.tsx
  - src/components/BottomNav.tsx
  - src/components/PhotoButton.tsx
  # Plan 02
  - src/components/SettingsPanel.tsx
  - src/components/SvgFloorPlan.tsx
  - src/components/PdfFloorPlan.tsx
  - src/components/ui/icons.tsx
  - src/components/SideMenu.tsx
  - src/components/DocumentUploadForm.tsx
  - src/components/PhotoSourceModal.tsx
key-files:
  modified:
    # Plan 01 (eb658dd)
    - src/components/ui/index.tsx (277줄, 16 inline → 10 inline)
    - src/components/PhotoGrid.tsx (157줄 → 137줄, -20줄/-13%, 11 inline → 0 inline)
    - src/components/BottomNav.tsx (121줄 → 102줄, -19줄/-16%, 8 inline → 1 inline)
    - src/components/PhotoButton.tsx (26줄, 7 inline → 0 inline)
    # Plan 02 (이 atomic)
    - src/components/SettingsPanel.tsx (944줄, 4 inline 유지 + L143 비색 1 cleanup)
    - src/components/SvgFloorPlan.tsx (140줄 → 132줄, -8줄/-6%, 3 inline → 0 inline)
    - src/components/PdfFloorPlan.tsx (134줄 → 127줄, -7줄/-5%, 3 inline → 0 inline)
    - src/components/ui/icons.tsx (149줄, 2 inline → 0 inline, spread combo 분리)
    - src/components/SideMenu.tsx (211줄, 2 inline 유지 — 화이트리스트 검증만)
    - src/components/DocumentUploadForm.tsx (291줄, 2 inline → 1 inline)
    - src/components/PhotoSourceModal.tsx (54줄, 1 inline 유지 — 화이트리스트 검증만)
decisions:
  # Plan 01 decisions (eb658dd 동일)
  - "옵션 X+P+M+색변수N+module/함수const N 22 wave 승계 자동 적용 — 사용자 재컨펌 없이 도달 (0hr roadmap locked)"
  - "분할 B 채택 완결 — Plan 01 (large-group 4 파일 42 inline 단일 atomic) + Plan 02 (small-group 7 파일 17 inline + 비색 cleanup) 진행. 16a/16b precedent (모두 2분할) 일관"
  - "ui/index Donut wrap div `position:relative` + `width:size, height:size` — relative는 className 화 / size는 prop dynamic 이므로 inline 보존 — 옵션 N 패턴 (doubleCycle wrap + single arc wrap × 2건)"
  - "ui/index DutyChip 캡슐 `border` + `background` 동적 (capsuleBorder/capsuleBg) — 정적 props 만 className 추출 + small conditional padding 옵션 M"
  - "ui/index DutyChip padding small conditional — `3px 8px 3px 3px` → `py-[3px] pr-2 pl-[3px]` / `4px 10px 4px 4px` → `py-1 pr-2.5 pl-1`"
  - "ui/index DutyChip 동그라미 div 동적 — circSize prop (28/32) + isFullLeave/isDutyWithLeave/s.circBg background 분기. 정적 props className + dynamic background inline 옵션 N"
  - "ui/index Donut 중앙 텍스트 (doubleCycle / single arc 2건) — `font-mono text-[10px] font-semibold` className + dynamic color inline. `whitespace-nowrap` 은 doubleCycle 에만 있는 정적 prop 보존"
  - "ui/index StatusBadge — `text-[8px] font-bold py-[2px] px-[5px] rounded-[5px] whitespace-nowrap shrink-0` className + dynamic background/color inline"
  - "ui/index CatBar — `w-0.5 rounded-[2px] shrink-0 self-stretch min-h-[20px]` className. `w-0.5` = 2px (Tailwind 0.5 fallback, spacing override 영향 X)"
  - "PhotoGrid `var(--danger)` → `bg-danger-bar` (✕ btn) + `text-danger-bar` (error 텍스트) — sqk-02 precedent. `var(--danger)` = `var(--status-danger-bar)` alias 검증 완료"
  - "PhotoGrid Lightbox `styles={{root: {...} as any}}` prop 의 styles 객체는 `style={{` regex 매치 X (별도 props) — 카운트 0 영향 안 됨"
  - "BottomNav nav root 옵션 N 1건 잔존 — `height` + `paddingBottom` 모두 `IS_ANDROID` conditional + `calc(... + var(--sab, 0px))` safe-area 동적. 정적 props 11건 모두 className"
  - "BottomNav QR 버튼 gradient + shadow — `bg-[linear-gradient(135deg,#1d4ed8,#0ea5e9)]` + `shadow-[0_4px_16px_rgba(37,99,235,0.55)]` arbitrary 채택 (sqk-02 InstallPrompt 같은 패턴)"
  - "BottomNav 일반 버튼 + 아이콘 wrap + 라벨 — 옵션 M template literal `${isActive ? 'text-accent' : 'text-text-tertiary'}` 3건 모두 변환 성공"
  - "PhotoButton `var(--status-danger)` raw 토큰 → `bg-danger` (status- prefix 금지 메모리 anchor 적용). PhotoGrid 의 `var(--danger)` = bar variant 와 다른 색 (raw `--status-danger` = #f87171 dark / #991b1b light). 의도 차이 보존"
  # Plan 02 decisions (이 atomic 신규)
  - "**Phase B 종결 마커** — Wave 16c 페어 완결 = Tier 3 components batch 종결 = Phase B 전체 종결. Tier 1 (11 waves) + Tier 2 (8 waves) + Tier 3 (5 atomic) 누적 ~88% 변환"
  - "**SettingsPanel L143 비색 cleanup** — `border-danger` → `border-danger-bar` (단일 비색 1건 정리 완료). sqk-02 ExcelPreview + sqk-01 InstallPrompt 의 `bg-danger-bar` / `text-danger` 조합 precedent 통일. L148 `text-danger` 텍스트 + L143 `border-danger-bar` border 시각 일관"
  - "SettingsPanel 화이트리스트 inline 4건 보존 (§9.3) — L86 PermBadge 동적 16% alpha bg / L296 type=date native widget appearance / L693-697 overlay dynamic open opacity/pointerEvents / L702-708 패널 isDesktop + transform/transition + safe-area var"
  - "SvgFloorPlan + PdfFloorPlan 100% className — 컨테이너 div (`w-full h-full flex items-center justify-center relative` / `absolute inset-0 flex items-center justify-center`) + object/canvas (`block pointer-events-none select-none`) + loading overlay (`absolute inset-0 flex items-center justify-center text-text-tertiary text-label font-semibold`) 3건 모두 정적"
  - "ui/icons spread combo 분리 패턴 — `style={{ flexShrink: 0, ...style }}` → `className=\`shrink-0${className ? \\` \\${className}\\` : ''}\`` + `style={style}` 분리. spread style prop 보존 + flexShrink 만 className 추출. 옵션 N → 0 도달 (q5a/s07-02 spread combo precedent 진화)"
  - "SideMenu 화이트리스트 inline 2건 보존 (SettingsPanel L693/L702 IDENTICAL 패턴) — L114-118 overlay 동적 open opacity/pointerEvents / L125-131 패널 transform/transition + safe-area var (cubic-bezier)"
  - "DocumentUploadForm file input `style={{display:'none'}}` → `className=\"hidden\"` (Tailwind core utility — PhotoGrid Plan 01 동급 precedent). progress fill `width: \\${percent}%` dynamic value 옵션 N 보존 (q5a dynamic value precedent)"
  - "PhotoSourceModal 화이트리스트 inline 1건 보존 — L31 모달 본체 paddingBottom safe-area calc + var(--sab, env(safe-area-inset-bottom, 0px)) (BottomNav nav root 와 동일 safe-area calc pattern)"
metrics:
  duration: "약 6분 (Plan 02 single atomic 7 file + 비색 1 line)"
  completed: "2026-05-29"
  tasks: "2/2 (Plan 01 완료 / Plan 02 완료)"
  files-modified: 11
  lines-changed: "약 -55 (Plan 01 -40 + Plan 02 -15: SvgFloor -8 + PdfFloor -7 + ui/icons ~0 + DocumentUpload ~0 + SettingsPanel -1 line)"
  inline-reduction-plan01: "42 → 11 (-31, -74%)"
  inline-reduction-plan02: "17 → 8 (-9, -53%)"
  inline-reduction-total: "59 → 19 (-40, -68%) + 비색 1 → 0"
roadmap-wave: "Tier 3 / Wave 16c 페어 완결 (Plan 01 + Plan 02 모두 atomic 완료) — Phase B 완전 종결"
---

# Phase 260529-tbv Wave 16c — XS 컴포넌트 batch 페어 완결 + Phase B 종결 Summary

Plan 01 (eb658dd, large-group 4 파일 42 inline → 11) + Plan 02 (이 atomic, small-group 7 파일 17 inline + 비색 1 → 8 inline + 0 비색) = **59 inline + 1 비색 → 19 옵션 N + 0 비색** (-40 inline, -68% + -1 비색). Tier 3 components batch 27번째 atomic 누적 완료. **Phase B 최종 wave (16c) 페어 완결 = Phase B 전체 종결**.

---

## Phase B 완전 종결 마커

### Tier 1 모바일 위주 sweep (11 waves) — 완료
~570 inline + 25 emoji 변환 완료 (Wave 1~11)

### Tier 2 데스크톱 분기 큰 페이지 (8 waves) — 완료
- 모바일 zone (12a~15a): 206 inline
- 데스크톱 zone (12b~15b): 181 inline
- **Tier 2 합산: 387 inline 변환 완료**

### Tier 3 컴포넌트 batch (3 waves / 5 atomic) — 완료
| Wave | atomic | 파일 | inline | 상태 |
|---|---|---|---|---|
| 16a-1 (s07-01) | 22번째 | FindingEditModal | 40 → ~2 | 완료 |
| 16a-2 (s07-02) | 23번째 | FindingFormSheet | 31 → ~2 | 완료 |
| 16b-1 (sqk-01) | 24번째 | InstallPrompt | 41 → 2 | 완료 |
| 16b-2 (sqk-02) | 25번째 | ExcelPreview + DesktopSidebar | 35 → 7 | 완료 |
| 16c-1 (tbv-01) | 26번째 | ui/index + PhotoGrid + BottomNav + PhotoButton | 42 → 11 | 완료 (eb658dd) |
| **16c-2 (tbv-02)** | **27번째** | **SettingsPanel + 6 컴포넌트** | **17 → 8 + 비색 1→0** | **완료 (이 atomic)** |
| **Tier 3 합산** | | **11 파일** | **206 → ~32 (-174, -84%) + 비색 cleanup** | |

### Phase B 전체 합산
- **전체 변환: ~1163 inline + 25 emoji + 1 비색 cleanup**
- **변환 적용: ~88%** (옵션 N 의도 잔존 ~12%)
- **commit 누적: 27 atomic** (Phase A + Phase B Tier 1 11 + Tier 2 8 + Tier 3 5 + wdc + 01h 등)

---

## Plan 02 변환 요약 (7 컴포넌트)

### Plan 02 Task 1 — SettingsPanel.tsx (4 inline 유지 + 비색 1 cleanup)

| 영역 | Before | After | 비고 |
|---|---|---|---|
| L86 PermBadge 동적 16% alpha bg | 1-prop inline | (유지) | 화이트리스트 §9.3 (dynamic alpha color) |
| L296 type=date native widget | 4-prop inline | (유지) | 화이트리스트 §9.3 (vendor prefix appearance) |
| L693-697 overlay dynamic | 2-prop inline | (유지) | 화이트리스트 §9.3 (open prop dynamic) |
| L702-708 패널 본체 | 4-prop inline | (유지) | 화이트리스트 §9.3 (cubic-bezier + safe-area var) |
| **L143 비색 cleanup** | `border-danger` | `border-danger-bar` | **bar variant 통일** (L148 `text-danger` 와 시각 일관 / sqk-02 precedent) |

### Plan 02 Task 2 — SvgFloorPlan.tsx (3 → 0, -3, -100%)

| 영역 | Before | After | 비고 |
|---|---|---|---|
| container div | 6-prop inline | `w-full h-full flex items-center justify-center relative` | 정적 |
| `<object>` SVG container | 3-prop inline | `block pointer-events-none select-none` | 정적 |
| loading overlay | 7-prop inline | `absolute inset-0 flex items-center justify-center text-text-tertiary text-label font-semibold` | `var(--t3)` → `text-text-tertiary`, `fontSize:13` → `text-label` (13px) |

### Plan 02 Task 3 — PdfFloorPlan.tsx (3 → 0, -3, -100%)

| 영역 | Before | After | 비고 |
|---|---|---|---|
| container div | 5-prop inline | `absolute inset-0 flex items-center justify-center` | 정적 |
| canvas | 3-prop inline | `block pointer-events-none select-none` | 정적 |
| loading overlay | 7-prop inline | (SvgFloorPlan loading overlay IDENTICAL) `absolute inset-0 flex items-center justify-center text-text-tertiary text-label font-semibold` | 정적 |

### Plan 02 Task 4 — ui/icons.tsx (2 → 0, -2, -100%)

| 영역 | Before | After | 비고 |
|---|---|---|---|
| StrokeSvg `<svg>` (L37) | `style={{ flexShrink: 0, ...style }}` | `className=\`shrink-0${className ? \` ${className}\` : ''}\`` + `style={style}` | spread combo 분리 패턴 (옵션 N 0 도달) |
| StairsIcon `<svg>` (L57) | `style={{ flexShrink: 0, ...style }}` | (StrokeSvg IDENTICAL 패턴) | 정적 |

### Plan 02 Task 5 — SideMenu.tsx (2 유지, 검증만)

| 영역 | Before | After | 비고 |
|---|---|---|---|
| L114-118 overlay 동적 open | 2-prop inline | (유지) | 화이트리스트 (SettingsPanel L693 IDENTICAL 패턴) |
| L125-131 패널 본체 | 4-prop inline | (유지) | 화이트리스트 (SettingsPanel L702 IDENTICAL 패턴 — cubic-bezier + safe-area var) |

### Plan 02 Task 6 — DocumentUploadForm.tsx (2 → 1, -1, -50%)

| 영역 | Before | After | 비고 |
|---|---|---|---|
| L224 file input hidden | `style={{ display: 'none' }}` | `className="hidden"` | Tailwind core utility (PhotoGrid Plan 01 동급 precedent) |
| L247 progress fill width | `style={{ width: \`${percent}%\` }}` | (유지) | 옵션 N (q5a dynamic value precedent) |

### Plan 02 Task 7 — PhotoSourceModal.tsx (1 유지, 검증만)

| 영역 | Before | After | 비고 |
|---|---|---|---|
| L31 모달 paddingBottom | `style={{ paddingBottom: 'calc(54px + var(--sab, env(safe-area-inset-bottom, 0px)) + 12px + 16px)' }}` | (유지) | 화이트리스트 (BottomNav nav root 와 동일 safe-area calc pattern) |

---

## 합산 메트릭 (Wave 16c 페어)

| 항목 | Plan 01 (eb658dd) | Plan 02 (이 atomic) | 합산 |
|---|---:|---:|---:|
| 파일 | 4 | 7 | **11** |
| inline before | 42 | 17 | **59** |
| inline after | 11 | 8 | **19** |
| 감소 | -31 (-74%) | -9 (-53%) | **-40 (-68%)** |
| 옵션 N 잔존 | 11건 | 8건 (SettingsPanel 4 + SideMenu 2 + PhotoSourceModal 1 + DocumentUploadForm 1) | **19건** |
| 비색 정리 | 0 | -1 (L143) | **-1 (border-danger → border-danger-bar)** |
| commits | 1 (eb658dd) | 1 (이 atomic) | **2** |

---

## 자동 검증 결과

### Plan 01 (eb658dd) — 이전 atomic 결과 보존
```
[1] inline count: ui/index 16→10, PhotoGrid 11→0, BottomNav 8→1, PhotoButton 7→0 (PASS)
[2] 비즈 anchor: 9 patterns × 4 files = 36 checks IDENTICAL (PASS)
[3] onClick diff: 4 files empty (PASS)
[4] Phase A: emoji 4건 (✕ + 📷 + ✕ + ✕) + 비색 0 (PASS)
[5] module const: ui/index 5 const + HalfCircle/hexToRgba + 5 export func IDENTICAL / BottomNav 2 const IDENTICAL (PASS)
[6] BottomNav z-[100]: 1 (PASS)
[7] TypeScript: 0 error (PASS)
[8] off-scope: 0 외부 변경 (PASS)
[9] vite build: 14.51s + sw.mjs 25.19kB + PWA 82 entries (PASS)
```

### Plan 02 (이 atomic) — 신규 검증 결과
```
[1] inline count drop (Plan 02 7 files)
src/components/SettingsPanel.tsx:        4 → 4  (화이트리스트 유지) PASS
src/components/SvgFloorPlan.tsx:         3 → 0  (target 0) PASS
src/components/PdfFloorPlan.tsx:         3 → 0  (target 0) PASS
src/components/ui/icons.tsx:             2 → 0  (target 0~2, executor 결정 = 0) PASS
src/components/SideMenu.tsx:             2 → 2  (화이트리스트 유지) PASS
src/components/DocumentUploadForm.tsx:   2 → 1  (target 1) PASS
src/components/PhotoSourceModal.tsx:     1 → 1  (화이트리스트 유지) PASS

[2] 비즈 anchor IDENTICAL (9 patterns × 7 files = 63 checks)
SettingsPanel:        onClick=20 / useState=18 / useEffect=4 / useMutation=3 / useNavigate=1 / fetch=9 (OK)
SvgFloorPlan:         onClick=0 / useState=1 / useRef=1 / useEffect=2 (OK)
PdfFloorPlan:         onClick=0 / useState=1 / useRef=1 / useEffect=2 (OK)
ui/icons:             onClick=0 / 모두 0 (OK)
SideMenu:             onClick=3 / useState=1 / useEffect=2 / useQuery=1 / useNavigate=1 (OK)
DocumentUploadForm:   onClick=4 / useState=2 / useEffect=2 (OK)
PhotoSourceModal:     onClick=5 / useEffect=1 (OK)

[3] precise onClick diff (sorted/uniq) — 7 files 모두 empty (OK)

[4] Phase A 보존 (emoji + 비색)
모든 파일 emoji 0 → 0 / 비색(after) 0 (SettingsPanel L143 cleanup 적용 PASS)
주의: SettingsPanel L934 `border border-danger/25` opacity modifier 는 false-positive 아님 (regex `border-danger[^-/]|border-danger$` 으로 검출 0 = 단독 비색 0 확인)

[5] module const + 함수 보존 (Plan 02)
SideMenu const (NAV_H / MENU / ITEM_META / RAW_TO_LABEL): 0 byte OK
DocumentUploadForm const (ALLOWED / EXT_TO_MIME / MAX_SIZE / typeLabel / findAllowed): 0 byte OK
PhotoSourceModal const (btnClass): 0 byte OK
ui/icons const (baseStrokeProps): 0 byte OK

[6] z-index hierarchy 보존
SideMenu z:190/200:        2 (오버레이 z-[190] + 패널 z-[200]) PASS
PhotoSourceModal z:9999:   1 PASS
SettingsPanel z:190/200:   2 (오버레이 z-[190] + 패널 z-[200]) PASS

[7] TypeScript
error TS count: 0 (PASS)

[8] off-scope (Plan 02)
cha-bio-safety/ 외 변경: 0 (PASS)
modified files: cha-bio-safety/src/components/{DocumentUploadForm,PdfFloorPlan,SettingsPanel,SvgFloorPlan,ui/icons}.tsx (5 파일 — SideMenu + PhotoSourceModal 변경 0 의도)

[9] vite build (Plan 02)
✓ built in 14.32s + dist/sw.mjs 25.19 kB + PWA precache 82 entries 7929 KiB (PASS)
```

---

## 옵션 N 잔존 (의도된 19건)

### Plan 01 (11건, eb658dd)
- ui/index.tsx 10건 (dynamic color/size 다수: DutyChip 캡슐/동그라미/칩라벨 + RoleLabel char + Donut wrap×2 + 중앙 텍스트×2 + StatusBadge + CatBar)
- BottomNav.tsx 1건 (nav root safe-area dynamic)

### Plan 02 (8건, 이 atomic)
- **SettingsPanel.tsx 4건** (화이트리스트 유지: L86 PermBadge 16% alpha / L296 type=date appearance / L693 overlay dynamic / L702 패널 본체)
- **SideMenu.tsx 2건** (화이트리스트 유지: L114 overlay dynamic / L125 패널 본체 — SettingsPanel IDENTICAL 패턴)
- **DocumentUploadForm.tsx 1건** (L247 progress fill width dynamic — q5a dynamic value precedent)
- **PhotoSourceModal.tsx 1건** (L31 safe-area calc + env() — BottomNav nav root 와 동일)

**모두 의도된 보존** — 동적 색/사이즈/open prop/safe-area var 등 Tailwind class 한계 영역.

---

## 메모리 anchor 적용 결과

### Plan 01 + Plan 02 공통
- `feedback_tailwind_w8_h8_is_48px.md` ✓ — w-7=32/w-8=48 override 함정 회피. 72x72 / 50x50 / 20x20 / 21x21 / 28x28 / 32x32 모두 arbitrary `w-[Npx] h-[Npx]` 사용
- `feedback_tailwind_token_class_pattern.md` ✓ — status- prefix 0 (PhotoButton `bg-danger` raw alias / SettingsPanel `border-danger-bar` bar variant)
- `feedback_text_caption_leading_none.md` ✓ — 작은 컨테이너 ✕ btn / 배지 모두 `leading-none` 명시
- `feedback_design_changes_ask_first.md` ✓ — 디자인 변경 거의 0 (no-op refactor + SettingsPanel L143 비색 ~10% 색 농도 변화만 의도)
- `feedback_bottomnav_gap_style.md` ✓ — BottomNav `height` + `paddingBottom` IS_ANDROID conditional + safe-area calc 0 byte 보존
- s07/sqk precedent ✓ — module-scope data const + 함수 0 byte 보존 (ui/index 5 const + 5 export func / BottomNav 2 / SideMenu 4 / DocumentUploadForm 5 / PhotoSourceModal 1 / ui/icons 1)
- sqk-02 precedent ✓ — `bg-danger-bar` / `border-danger-bar` 매핑 / 옵션 N 동적 좌표 inline 보존 / 옵션 M 3-state template literal

### Plan 02 신규
- `feedback_inspection_unresolved_color.md` ✓ — SettingsPanel L143 비색 cleanup 케이스: 미조치/조치 아님 (form validation error) 확인 후 `border-danger-bar` 채택. 메인 칩 fire 룰 적용 외 영역으로 분리

---

## 신규 박제 패턴 후보

### 1. SettingsPanel L143 비색 cleanup 완결 패턴
- **트리거:** 단일 비표준 색 (`border-danger` 단독) 정리 필요
- **해결:** `border-danger` → `border-danger-bar` (sqk-02 `bg-danger-bar` / sqk-01 `text-danger` 와 통일된 bar variant). 미조치 색 룰 아닌 form validation error 케이스 분리
- **검증:** `grep -cE 'border-danger[^-/]|border-danger$'` = 0 (단독 비색 0) 강제. opacity modifier `border-danger/25` 는 false-positive 아님 (`/` 제외 regex)

### 2. spread combo 옵션 N 0 도달 패턴 (ui/icons)
- **트리거:** `style={{ flexShrink: 0, ...style }}` (spread props 와 static prop 혼재)
- **해결:** `className=\`shrink-0${className ? \` ${className}\` : ''}\`` + `style={style}` 분리. spread style prop 그대로 보존 + flexShrink 만 className 으로 추출
- **검증:** spread style prop 유지 + `style={{` 카운트 -1 / className 전파 (caller 의 className) 룰 보존

### 3. SVG <object> + canvas 컨테이너 100% className 패턴
- **트리거:** SVG 도면 또는 PDF canvas 의 컨테이너 div + 동적 element + loading overlay 3건 정적 패턴
- **해결:** 컨테이너 (`w-full h-full flex items-center justify-center relative` / `absolute inset-0 flex items-center justify-center`) + object/canvas (`block pointer-events-none select-none`) + overlay (`absolute inset-0 flex items-center justify-center text-text-tertiary text-label font-semibold`) 모두 정적 — 100% className 도달

---

## Commits

| Plan | Commit | 메시지 | 파일 |
|---|---|---|---|
| Plan 01 (Wave 16c-1) | eb658dd3 | `feat(260529-tbv-01): Phase B Wave 16c-1 — XS large-group (ui/index + PhotoGrid + BottomNav + PhotoButton 42 inline) → tailwind` | ui/index.tsx, PhotoGrid.tsx, BottomNav.tsx, PhotoButton.tsx |
| **Plan 02 (Wave 16c-2)** | **(이 atomic)** | **`feat(260529-tbv-02): Phase B Wave 16c-2 — XS small-group (7 components 17 inline + SettingsPanel L143 비색) → tailwind / Phase B 종결`** | **SettingsPanel.tsx, SvgFloorPlan.tsx, PdfFloorPlan.tsx, ui/icons.tsx, SideMenu.tsx, DocumentUploadForm.tsx, PhotoSourceModal.tsx** |

---

## 사용자 컨펌 게이트 (cbc7119-preview 자동 deploy 후 시각 검증)

### Plan 01 cbc7119-preview 시각 검증 (eb658dd)
- **ui/index.tsx:** 일일 일지 / 일정 페이지 → DutyChip 4종 (day/night/off/leave) + 반차 (half_am/pm) HalfCircle SVG / Donut 도넛 차트 픽셀 1:1 / StatusBadge / CatBar
- **PhotoGrid.tsx:** 점검 모달 사진 첨부 → thumbnail 72x72 / ✕ btn 20x20 / add slot 72x72 dashed / Lightbox 정상 / camera/album input 동작
- **BottomNav.tsx:** 모바일 진입 → 5탭 (대시보드/점검/QR/조치/승강기) / QR 특수 버튼 50x50 gradient / 조치 unresolvedCount 배지 / IS_ANDROID safe-area 정상
- **PhotoButton.tsx:** 단일 사진 첨부 (조치 상세 등) → preview 72x72 / ✕ btn / Camera Lucide / add slot 72x72 dashed

### Plan 02 cbc7119-preview 시각 검증 (이 atomic)
- **SettingsPanel.tsx**: 설정 패널 열기 / 비밀번호 변경 → 새 비밀번호 + 확인 불일치 시 input border 색 (변경 전 #f87171/#991b1b → 변경 후 #ef4444/#b91c1c, ~10% 색 농도 변화 — **사용자 컨펌 게이트**)
- **SvgFloorPlan.tsx + PdfFloorPlan.tsx**: 도면 페이지 → 도면 로딩 정상 / 로딩 중 텍스트 / 줌 동작
- **ui/icons.tsx**: 커스텀 icon 6종 (Stairs/Shutter/ExitSign/SmokeVent/HoseReel/FireExtinguisherCustom/Elevator) 렌더 픽셀 1:1
- **SideMenu.tsx**: 메뉴 열기 → overlay 페이드 + 패널 translateX(0) transition 정상 / safe-area + cubic-bezier 보존 (검증만, 변경 0)
- **DocumentUploadForm.tsx**: documents 페이지 업로드 → 파일 선택 / progress bar fill width 정상
- **PhotoSourceModal.tsx**: 사진 첨부 → 모달 카메라/앨범 선택 / safe-area paddingBottom 정상 (검증만, 변경 0)

---

## 다음 단계 — 묶음 D production cherry-pick 후보

Phase B 완전 종결 후 진입 가능:
- **Tier 2 + Tier 3 누적 wave 묶음** → 직원 도메인 production 적용 결정
- **메모리 anchor:** `feedback_production_sync_protocol.md` — production 작업 시 `.planning/production-sync.md` 게이트 갱신 필수
- **메모리 anchor:** `feedback_cbc7119_design_never_wrangler.md` — 본 워크트리 (cbc7119-design) 에서는 wrangler 금지. main push 자동 cbc7119-preview 만. 직원 도메인은 20260328 워크트리에서 진행
- **메모리 anchor:** `project_redesign_workflow.md` — 차수별 main 머지 / GSD(/gsd:quick or /gsd:ui-phase)

---

## Self-Check: PASSED

### Plan 01 (eb658dd)
- [x] src/components/ui/index.tsx 변환 완료 (16 → 10 inline, -38%) [Task 1]
- [x] src/components/PhotoGrid.tsx 변환 완료 (11 → 0 inline, -100%) [Task 2]
- [x] src/components/BottomNav.tsx 변환 완료 (8 → 1 inline, -88%) [Task 3]
- [x] src/components/PhotoButton.tsx 변환 완료 (7 → 0 inline, -100%) [Task 4]
- [x] Plan 01 합산 inline 42 → 11 (-31, -74%)
- [x] Plan 01 자동 검증 9 gate 모두 PASS

### Plan 02 (이 atomic)
- [x] src/components/SettingsPanel.tsx 비색 cleanup 완료 (L143 `border-danger` → `border-danger-bar`, 화이트리스트 inline 4건 유지) [Task 1]
- [x] src/components/SvgFloorPlan.tsx 변환 완료 (3 → 0 inline, -100%) [Task 2]
- [x] src/components/PdfFloorPlan.tsx 변환 완료 (3 → 0 inline, -100%) [Task 3]
- [x] src/components/ui/icons.tsx 변환 완료 (2 → 0 inline, -100%, spread combo 분리 패턴) [Task 4]
- [x] src/components/SideMenu.tsx 검증만 완료 (2 화이트리스트 유지) [Task 5]
- [x] src/components/DocumentUploadForm.tsx 변환 완료 (2 → 1 inline, -50%) [Task 6]
- [x] src/components/PhotoSourceModal.tsx 검증만 완료 (1 화이트리스트 유지) [Task 7]
- [x] Plan 02 합산 inline 17 → 8 (-9, -53%) + 비색 1 → 0
- [x] 비즈 anchor 9 patterns × 7 files IDENTICAL (63 checks)
- [x] onClick precise diff 7 files empty
- [x] Phase A emoji + 비색 보존 (모두 0)
- [x] module data const + 함수 0 byte 보존 (SideMenu 4 / DocumentUploadForm 5 / PhotoSourceModal 1 / ui/icons 1)
- [x] z-index hierarchy 보존 (SideMenu z-[190/200] + PhotoSourceModal z-[9999] + SettingsPanel z-[190/200])
- [x] TypeScript 0 error
- [x] vite build PWA generation PASS (14.32s)
- [x] off-scope 변경 0 (Plan 02 = 5 파일 modified + 2 파일 변경 0)
- [x] 옵션 N 8건 의도된 잔존

### Wave 16c 페어 합산 + Phase B 종결
- [x] **Wave 16c 페어 (Plan 01 + Plan 02) 완결** — 59 inline → 19 (-40, -68%) + 비색 1 → 0
- [x] **Tier 3 components batch 종결** — 5 atomic (16a-1/16a-2/16b-1/16b-2/16c-1/16c-2) 누적 206 → ~32 (-174, -84%)
- [x] **Phase B 완전 종결 마커** — Tier 1 (11 waves ~570 inline) + Tier 2 (8 waves 387 inline) + Tier 3 (5 atomic 206 inline) 누적 변환 ~88%
- [x] **다음 단계** — 묶음 D production cherry-pick 직원 도메인 sync 후보 (20260328 워크트리에서)
- [x] 통합 SUMMARY 작성 완료 (Plan 01 + Plan 02 complete)
