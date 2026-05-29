---
phase: 260529-tbv-phase-b-wave-16c-xs-components-batch
plan: 01 + 02 (16c-1 large-group + 16c-2 small-group — Wave 16c 페어 / Phase B 최종)
subsystem: redesign/phase-b-sweep
type: execute
wave: 1
depends_on: [260529-sqk-phase-b-wave-16b (Wave 16b 페어 완결 — 16b-1 InstallPrompt + 16b-2 ExcelPreview+DesktopSidebar)]
files_modified:
  # Plan 01 (large-group)
  - src/components/ui/index.tsx
  - src/components/PhotoGrid.tsx
  - src/components/BottomNav.tsx
  - src/components/PhotoButton.tsx
  # Plan 02 (small-group + 비색 cleanup)
  - src/components/SettingsPanel.tsx
  - src/components/SvgFloorPlan.tsx
  - src/components/PdfFloorPlan.tsx
  - src/components/ui/icons.tsx
  - src/components/SideMenu.tsx
  - src/components/DocumentUploadForm.tsx
  - src/components/PhotoSourceModal.tsx
autonomous: true
requirements:
  - Phase B Tier 3 components batch 종결 (16a + 16b + 16c 누적 11 components)
  - 옵션 X+P+M+색변수N+module/함수 const N 22 wave 승계 (0hr roadmap locked)
  - SettingsPanel L143 `border-danger` 비표준 색 단독 처리 (roadmap §4 §1 명시 1건)
  - 시각 0 byte 보존 (no-op refactor)
  - 비즈 anchor 9 patterns IDENTICAL (11 컴포넌트 전체)
  - module-scope data const (SHIFT_STYLE/LEAVE_COLOR/LEAVE_LABEL/STATUS_STYLE/CAT_STYLE + ITEMS + ALLOWED + EXT_TO_MIME + NAV_H + MENU + ITEM_META + RAW_TO_LABEL + IS_ANDROID + btnClass + baseStrokeProps + MARKER_STATUS_COLOR + TYPE_SYM) 0 byte 보존
  - 함수 스코프 const 보존 (DutyChip 의 hexToRgba helper / capsuleBg/capsuleBorder / Toggle/PermBadge/Row/HalfCircle sub-component / SectionHeader/usePersistedCollapse / typeLabel/findAllowed / urlBase64ToUint8Array 등)
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
  - component-batch
  - xs-components-batch
  - phase-b-final
  - module-data-const-preserve
  - settings-panel-border-danger-cleanup
  - z-100-fixed-pattern-preserve
  - dynamic-color-token-via-inline
  - spread-rest-style-preserve
  - safe-area-css-var-preserve
must_haves:
  truths:
    - "11 컴포넌트 정적 inline 모두 tailwind className 변환 (옵션 N 의도 잔존 제외)"
    - "ui/index.tsx 의 SHIFT_STYLE/STATUS_STYLE/CAT_STYLE/LEAVE_COLOR/LEAVE_LABEL module data const 정의 0 byte 보존"
    - "ui/index.tsx 의 HalfCircle sub-component / DutyChip / RoleLabel / Donut / StatusBadge / CatBar 5 export 함수 시그니처 IDENTICAL"
    - "PhotoGrid.tsx 의 useMultiPhotoUpload hook 연결 / Lightbox plugins / PhotoSourceModal child render 동일"
    - "BottomNav.tsx 의 ITEMS module data const 정의 0 byte 보존 + QR 특수 버튼 차별 처리 보존"
    - "PhotoButton.tsx 의 usePhotoUpload hook 연결 / PhotoSourceModal child render 동일"
    - "SettingsPanel.tsx L143 `border-danger` 비표준 색 단독 처리 — 적절한 `-bar` variant 또는 opacity modifier 로 정리"
    - "SettingsPanel.tsx 의 화이트리스트 inline 4건 (open opacity/pointerEvents × 2 + transform transition × 1 + bg 16% alpha dynamic × 1) 의도 보존"
    - "SvgFloorPlan / PdfFloorPlan 의 dynamic SVG/canvas attribute 코드 0 byte 보존"
    - "ui/icons.tsx 의 `{ flexShrink: 0, ...style }` spread combo 옵션 N 보존 × 2"
    - "SideMenu.tsx 의 open prop dynamic 옵션 N 보존 × 2"
    - "DocumentUploadForm.tsx 의 file input hidden + progress fill width 옵션 N 보존 × 2"
    - "PhotoSourceModal.tsx 의 safe-area css var padding 옵션 N 보존 × 1"
    - "BottomNav z:100 fixed / SideMenu z:190 / PhotoSourceModal z:9999 z-index hierarchy 0 byte 보존"
    - "Phase A 보존 — Lucide imports / emoji (PhotoGrid ✕ + 📷 + PhotoButton ✕ + Camera) / 비표준 색 0 (Plan 02 정리 후)"
    - "TypeScript 변경 파일 + 전체 프로젝트 신규 에러 0"
    - "vite build PWA generation PASS"
  artifacts:
    - path: ".planning/quick/260529-tbv-phase-b-wave-16c/260529-tbv-PLAN.md"
      provides: "Wave 16c 페어 PLAN (Plan 01 large-group + Plan 02 small-group)"
    - path: ".planning/quick/260529-tbv-phase-b-wave-16c/260529-tbv-SUMMARY.md"
      provides: "Wave 16c 페어 완결 unified SUMMARY (Phase B 종결 메트릭 포함)"
      created_after: "Plan 01 + Plan 02 양쪽 commit 후"
  key_links:
    - from: "src/components/ui/index.tsx"
      to: "src/styles/tokens.css"
      via: "var(--c-day) / var(--c-night) / var(--c-off) / var(--c-leave) / var(--t1) / var(--t2) / var(--t3) / var(--acl) / var(--bg4) / var(--danger) / var(--warn) / var(--safe) / var(--fire) inline 보존 또는 className 화"
      pattern: "Donut SVG 의 stroke=\"var(--bg4)\" + 색은 prop 으로 전달 → SVG attribute 는 inline 잔존"
    - from: "src/components/BottomNav.tsx"
      to: "/inspection/qr | /dashboard | /inspection | /remediation | /elevator"
      via: "useNavigate + IS_ANDROID conditional safe-area 보존"
      pattern: "QR 버튼 marginTop:-14 (튀어나옴) + 50x50 gradient circle + 외부 shadow 보존"
    - from: "src/components/SettingsPanel.tsx L143"
      to: "border-border-default | border-danger-bar (정리 후)"
      via: "비밀번호 일치 안 함 시 input border 색 변경 conditional"
      pattern: "`confirm && next !== confirm ? '<정리된 토큰>' : 'border-border-default'`"

---

# Phase 260529-tbv Wave 16c — XS 컴포넌트 batch 페어 (Phase B 최종 wave)

> **Phase B 최종 wave** — Wave 16c 페어 완결 = Tier 3 components batch 종결 = Phase B 전체 종결
> **분할 결정: Option B (2분할)** — 16a/16b 두 wave 모두 2분할 precedent 일관 적용
> Plan 01 (large-group 4 파일 42 inline) → Plan 02 (small-group 7 파일 17 inline + 비색 cleanup)
>
> 옵션 X (정확값 arbitrary) + 옵션 P (leading 명시) + 옵션 M (template literal conditional) + 색변수 N (var() dynamic 잔존) + module/함수 const N (정의 0 byte 보존). 22 wave 승계 (사용자 재컨펌 불필요 — 0hr roadmap locked).
>
> **Wave 16c 종결 후 Phase B 누적 메트릭 작성 + 묶음 D production cherry-pick 결정 진입.**

---

## 분할 결정 (Option B 채택)

| 옵션 | 구성 | 장점 | 단점 |
|---|---|---|---|
| A (단일) | 1 plan / 11 files / 59 inline | 1 atomic commit | 11 file 검증 burden / 컨텍스트 부담 (특히 ui/index 의 module data const 5 + SettingsPanel 핵심 비색 cleanup 혼재) |
| **B (2분할 — 채택)** | Plan 01 (4 files 42 inline) + Plan 02 (7 files 17 inline) | 16a/16b precedent 일관 / large-group 집중 / small-group + 비색 cleanup 별도 책임 | 2 commit (precedent 동일) |
| C (3분할) | XL(35) / M(17) / XS(7) | 더 fine-grained | 16a/16b 와 일관성 깨짐 (둘 다 2분할) / 7 inline single-task atomic 은 너무 작음 |

**결정 근거:**
1. **16a precedent (77 → 43 + 34, 2 atomic)** + **16b precedent (76 → 41 + 35, 2 atomic)** → 본 wave 도 **2분할** 일관
2. ui/index 의 module data const 5 (SHIFT_STYLE/LEAVE_COLOR/LEAVE_LABEL/STATUS_STYLE/CAT_STYLE) + HalfCircle sub-component + 5 export 함수 = 단일 plan 으로 집중 처리
3. SettingsPanel 비색 cleanup 단일 책임 = Plan 02 small-group 묶음 (이미 className 화 된 상태에서 1 line 만 정리)
4. Plan 01 = 42 inline / 4 files (16b-2 35 inline / 3 files 비슷한 부담)
5. Plan 02 = 17 inline / 7 files (16b-2 35 inline / 3 files 보다 작지만 7 file 분산 — 평균 2.4 inline/file)

---

## 컴포넌트별 정확 inline 카운트 (확인 결과)

| # | 컴포넌트 | inline | Plan | 특이사항 |
|---|---|---:|---|---|
| 1 | src/components/ui/index.tsx | **16** | 01 | 5 module data const + HalfCircle sub-component + 5 export functions (DutyChip / RoleLabel / Donut / StatusBadge / CatBar) — dynamic color 다수 (옵션 N 예상) |
| 2 | src/components/PhotoGrid.tsx | **11** | 01 | useMultiPhotoUpload hook + Lightbox + PhotoSourceModal child + dynamic url thumbnail |
| 3 | src/components/BottomNav.tsx | **8** | 01 | z:100 fixed + IS_ANDROID conditional safe-area + QR 특수 marginTop:-14 + gradient circle + badge unresolvedCount |
| 4 | src/components/PhotoButton.tsx | **7** | 01 | usePhotoUpload + PhotoSourceModal child + photo preview/upload state |
| 5 | src/components/SettingsPanel.tsx | **4** | 02 | **L143 `border-danger` 비색 1건 정리** + 화이트리스트 inline 4건 (open opacity/pointerEvents + transform transition + bg 16% alpha) |
| 6 | src/components/SvgFloorPlan.tsx | **3** | 02 | SVG `<object>` 컨테이너 + display:block + loading overlay |
| 7 | src/components/PdfFloorPlan.tsx | **3** | 02 | canvas 컨테이너 + display:block + loading overlay |
| 8 | src/components/ui/icons.tsx | **2** | 02 | `{ flexShrink: 0, ...style }` spread combo × 2 (옵션 N 보존) |
| 9 | src/components/SideMenu.tsx | **2** | 02 | open prop dynamic (opacity/pointerEvents + transform/transition) — 이미 SettingsPanel 동일 패턴 화이트리스트 |
| 10 | src/components/DocumentUploadForm.tsx | **2** | 02 | file input `display:none` + progress fill `width: ${percent}%` 동적 |
| 11 | src/components/PhotoSourceModal.tsx | **1** | 02 | safe-area css var padding (calc + var) |
| | **합계** | **59** | | FloorB5.tsx (1 inline) **제외** — planning_context 결정 |

### FloorB5.tsx 제외 결정
- 파일 확인: `src/components/floors/FloorB5.tsx` 실재 (215줄, 1 inline `style={{ cursor: 'pointer' }}` @ L194)
- planning_context: "FloorB5.tsx 는 파일 없음, 11개로 축소" — 사용자 명시 결정 (mode override)
- 본 plan 에서는 제외, 추후 별도 quick 으로 처리 가능 (1 inline → `cursor-pointer` className 단순 변환)

### SettingsPanel 비표준 색 1건 (roadmap §4 명시)
- **위치: L143** — `confirm && next !== confirm ? 'border-danger' : 'border-border-default'`
- **로직:** 비밀번호 확인 input 의 비밀번호 불일치 시 border 색 변경
- **메모리 anchor 확인 — `feedback_inspection_unresolved_color.md`:** 미조치 = fire 색이라는 룰이지만, **이 케이스는 미조치/조치 아님 (form validation error)** → 일치하지 않음 오류는 정확히 danger 의도 유효
- **정리 방법:** `border-danger` 단독은 비표준. tokens.css 의 `--status-danger` 는 텍스트 색 (`#f87171` dark / `#991b1b` light), `--status-danger-bar` 는 bar 색 (`#ef4444` / `#b91c1c`)
- **결정:** **`border-danger-bar`** 로 정리 (border 도 bar variant 통일성). L148 의 `text-danger` 와 함께 비밀번호 불일치 시각 일관 (text + border 모두 같은 의도). roadmap §4 룰: "L143 `border-danger` → `border-danger-bar` (또는 `/25` opacity)" — bar variant 우선 채택
- **검증:** Plan 02 verify gate `비색 = 0` 강제 (단 L934 의 `border border-danger/25` 는 opacity modifier 적법 — false-positive 아님, 카운트는 `border-danger[^-]` regex 로 단독만 매치)

---

## Plan 01 — large-group 4 컴포넌트 (42 inline)

### 대상 파일
- `src/components/ui/index.tsx` (16 inline / 277줄)
- `src/components/PhotoGrid.tsx` (11 inline / 157줄)
- `src/components/BottomNav.tsx` (8 inline / 121줄)
- `src/components/PhotoButton.tsx` (7 inline / 26줄)

### Plan 01 Task 1: ui/index.tsx (16 inline)

**보존 module data const (정의 0 byte):**
- `SHIFT_STYLE` (L4–9) — Record<string, { bg, border, circBg, typeColor, label }> × 4 entries
- `LEAVE_COLOR` (L12–15) — Record<string, string> × 6 entries
- `LEAVE_LABEL` (L16–19) — Record<string, string> × 6 entries
- `STATUS_STYLE` (L251–256) — Record<string, { bg, color, label }> × 4 entries
- `CAT_STYLE` (L257–262) — Record<string, { bg, color }> × 4 entries

**보존 sub-component / helper:**
- `HalfCircle` sub-component (L22–42) — SVG 렌더링 본체. SVG 의 `style={{ flexShrink: 0, display: 'block', overflow: 'hidden', borderRadius: '50%' }}` (L28) — **className 화 시도** (`shrink-0 block overflow-hidden rounded-full`) — SVG 의 className 적용 가능 검증 후 적용
- DutyChip 내부 `hexToRgba` helper (L83–86) 0 byte 보존
- `capsuleBg` / `capsuleBorder` (L88–89) 변수 0 byte 보존 → 옵션 N (dynamic color)

**변환 매핑 (16 inline):**

| # | 라인 | 위치 | 변환 후 |
|---:|---:|---|---|
| 1 | L28 | HalfCircle SVG container | className `shrink-0 block overflow-hidden rounded-full` (SVG className 지원 검증 — 미지원 시 inline 유지 옵션 N) |
| 2 | L94–99 | DutyChip 캡슐 div | **옵션 N** — `display:flex/alignItems/justifyContent/cursor/flexShrink/transition` 등 정적 prop 만 className (`flex items-center cursor-pointer shrink-0 transition-opacity duration-[130ms]`) + dynamic `gap` (small ? 5 : 6 → `gap-1.5 / gap-[5px]` 옵션 M arbitrary) + `padding` (small conditional) + `borderRadius:22` (rounded-[22px]) + `border` + `background` 는 dynamic capsuleBg/capsuleBorder → **inline 잔존 (옵션 N)** |
| 3 | L113–118 | DutyChip 동그라미 div (전체연차) | **옵션 N** — `borderRadius:50%/flexShrink/display:flex/alignItems/justifyContent/fontWeight/color` 정적은 className (`rounded-full shrink-0 flex items-center justify-center font-bold text-white`) + `width/height` dynamic (circSize var: small ? 28 : 32 → 옵션 M `w-7 h-7 / w-8 h-8` 함정 — circSize 가 28/32 인데 w-7=32 / w-8=48 → arbitrary `w-[28px] h-[28px] / w-[32px] h-[32px]`) + `fontSize` (small ? 11 : 12 → 옵션 M `text-[11px] / text-[12px]`) + `background` dynamic → inline 잔존 |
| 4 | L123 | DutyChip 이름 span | **옵션 M** — `font-bold whitespace-nowrap` 정적 className + `text-[11px] / text-[12px]` (small) conditional + `text-text-primary` (var(--t1) alias) |
| 5 | L124 | DutyChip 칩 라벨 span | **옵션 N** — `text-[9px] font-semibold whitespace-nowrap` 정적 + dynamic `color` (typeColor 또는 leaveColor) → inline 잔존 |
| 6 | L122 | DutyChip 이름 column wrap | className `flex flex-col gap-px` |
| 7 | L137 | RoleLabel root | className `flex flex-col items-center shrink-0` |
| 8 | L139 | RoleLabel 각 char span | **옵션 N** — `text-[8px] font-bold block` 정적 + dynamic `color` props → inline 잔존 (leading-[1.45] 명시 옵션 P) |
| 9 | L180 | Donut doubleCycle wrap div | className `relative` + dynamic `w / h` (size prop → `w-[Npx] h-[Npx]` 옵션 M arbitrary 동적 prop) → **옵션 N** (size 가 prop) |
| 10 | L184 | Donut SVG | className `-rotate-90` |
| 11 | L209–212 | Donut doubleCycle 중앙 텍스트 | **옵션 N** — `absolute inset-0 flex items-center justify-center font-mono text-[10px] font-semibold whitespace-nowrap` 정적 + dynamic `color` (allZero ? var(--t3) : var(--t2)) → inline 잔존 |
| 12 | L224 | Donut single arc wrap div | (L180 IDENTICAL) **옵션 N** |
| 13 | L228 | Donut single arc SVG | className `-rotate-90` |
| 14 | L239–243 | Donut single arc 중앙 텍스트 | **옵션 N** — (L209 IDENTICAL 패턴) `color` dynamic |
| 15 | L267 | StatusBadge span | **옵션 N** — `text-[8px] font-bold px-[5px] py-[2px] rounded-[5px] whitespace-nowrap shrink-0` 정적 + dynamic `bg/color` (s.bg / s.color) → inline 잔존 |
| 16 | L275 | CatBar div | **옵션 N** — `w-0.5 rounded-[2px] shrink-0 self-stretch min-h-[20px]` 정적 + dynamic `background` (s.color) → inline 잔존 |

**예상 결과:** 16 → ~10 옵션 N 잔존 (-6, -38%). 동적 색/사이즈가 대부분이라 옵션 N 비율 높음 — q5a partial precedent.

### Plan 01 Task 2: PhotoGrid.tsx (11 inline)

**변환 매핑 (11 inline):**

| # | 라인 | 위치 | 변환 후 |
|---:|---:|---|---|
| 1 | L38 | 사진 grid wrap | `flex flex-row overflow-x-auto gap-2 px-[2px] pt-1.5 pb-1` |
| 2 | L40 | thumbnail wrap | `relative shrink-0` |
| 3 | L44–52 | thumbnail img | `w-[72px] h-[72px] object-cover rounded-[10px] border border-border-default cursor-pointer block` (✕ btn 28x28 함정 회피 — 72 → arbitrary) |
| 4 | L59–76 | ✕ remove btn (20x20) | `absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-danger-bar border-none text-white text-[11px] font-bold cursor-pointer flex items-center justify-center leading-none` (옵션 P leading-none) |
| 5 | L82–92 | uploading overlay | `absolute inset-0 bg-[rgba(0,0,0,0.4)] rounded-[10px] flex items-center justify-center text-[10px] text-white` |
| 6 | L97 | error 텍스트 div | `text-[11px] text-danger text-center mt-0.5` (var(--danger) → text-danger) |
| 7 | L107–123 | add slot btn (72x72 dashed) | `w-[72px] h-[72px] rounded-[10px] bg-surface-raised border border-dashed border-border-strong text-text-tertiary text-[11px] font-semibold cursor-pointer shrink-0 flex flex-col items-center justify-center gap-1` |
| 8 | L125 | 📷 emoji span | `text-[22px]` |
| 9 | L133 | camera input hidden | `hidden` |
| 10 | L134 | album input hidden | `hidden` |
| 11 | L148 | Lightbox 닫기 ✕ span | `text-[18px] font-bold` |
| ★ | L151 | Lightbox styles (`root: { ... } as any`) | **인라인 보존** — 정의가 styles prop 객체 (Tailwind className 적용 대상 아님, `--yarl__*` CSS custom property 설정) → **옵션 N 의도 보존, 카운트 외** |

**예상 결과:** 11 → 0 (잔존 0, L151 styles prop 은 `style={{` 매치 아님 — 별도 prop) — **검증 필요: grep `style={{` 가 L151 styles prop 객체를 catch 하는지 확인. catch 한다면 옵션 N 으로 보존.**

### Plan 01 Task 3: BottomNav.tsx (8 inline)

**보존 module data const:** `IS_ANDROID` (L3) / `ITEMS` (L7–31) 정의 0 byte

**변환 매핑 (8 inline) — Pattern A z:100 fixed 보존:**

| # | 라인 | 위치 | 변환 후 |
|---:|---:|---|---|
| 1 | L40–54 | nav root (z:100 fixed) | **옵션 N** — `fixed bottom-0 left-0 right-0 bg-[rgba(22,27,34,0.97)] border-t border-border-default box-border flex justify-around items-center z-[100]` 정적 + dynamic `height` / `paddingBottom` (IS_ANDROID conditional calc(54px + var(--sab,0px) ...)) → **옵션 N — calc + css var dynamic** (SettingsPanel safe-area var 패턴 동일) |
| 2 | L62–66 | QR 버튼 root | `flex flex-col items-center gap-0.5 py-[3px] border-none bg-none cursor-pointer -mt-[14px]` |
| 3 | L68–73 | QR 50x50 gradient circle | **옵션 N** — `w-[50px] h-[50px] rounded-[14px] flex items-center justify-center` 정적 + dynamic `background: 'linear-gradient(135deg,#1d4ed8,#0ea5e9)'` + `boxShadow: '0 4px 16px rgba(37,99,235,0.55)'` → inline 잔존 (gradient + shadow Tailwind arbitrary 가능하지만 가독성 위해 inline 보존 권장 — 16b precedent `bg-[linear-gradient(135deg,#1d4ed8,#0ea5e9)]` + `shadow-[0_4px_16px_rgba(37,99,235,0.55)]` arbitrary 적용 시 className 화 가능, executor 결정) |
| 4 | L81 | QR 라벨 span | `text-[9.5px] text-accent font-bold` (var(--acl) → text-accent) |
| 5 | L90–94 | 일반 버튼 root | **옵션 M** — `flex flex-col items-center gap-0.5 py-[3px] border-none bg-none cursor-pointer ${isActive ? 'text-accent' : 'text-text-tertiary'}` |
| 6 | L96 | 아이콘 wrap | **옵션 M** — `relative w-[21px] h-[21px] ${isActive ? 'text-accent' : 'text-text-tertiary'}` |
| 7 | L99–106 | 배지 (unresolvedCount) | `absolute top-0 right-0 bg-danger-bar text-white text-[11px] font-bold font-mono px-1 py-0.5 rounded-[9px] min-w-4 text-center leading-none translate-x-1/2 -translate-y-1/2` (var(--danger) → bg-danger-bar — sqk-02 precedent) |
| 8 | L112 | 일반 버튼 라벨 span | **옵션 M** — `text-[9.5px] font-medium ${isActive ? 'text-accent' : 'text-text-tertiary'}` |

**예상 결과:** 8 → 2 옵션 N 잔존 (nav root safe-area dynamic + QR gradient circle 결정 시 1 더 잔존) (-6 ~ -7, -75~88%)

### Plan 01 Task 4: PhotoButton.tsx (7 inline)

**변환 매핑 (7 inline):**

| # | 라인 | 위치 | 변환 후 |
|---:|---:|---|---|
| 1 | L9 | camera input hidden | `hidden` |
| 2 | L10 | album input hidden | `hidden` |
| 3 | L13 | preview wrap | `relative inline-block` |
| 4 | L14 | preview img (72x72) | `w-[72px] h-[72px] object-cover rounded-[10px] border border-border-default block` (var(--border-default) → border-border-default) |
| 5 | L15 | ✕ remove btn (20x20) | `absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-status-danger border-none text-white text-[12px] font-bold cursor-pointer flex items-center justify-center leading-none` (**`bg-status-danger` 정정** — var(--status-danger) raw 토큰. 단 status- prefix 금지 메모리 anchor 위반 → `bg-danger` (var(--status-danger) alias) 또는 `bg-danger-bar` (consistency) 확인 — `feedback_tailwind_token_class_pattern.md` 위반 회피 위해 **`bg-danger`** 채택. PhotoGrid L66 의 `var(--danger)` → `bg-danger-bar` 와 PhotoButton L15 의 `var(--status-danger)` raw 는 색이 다름 — `--danger` = `--status-danger-bar` (#ef4444) / `--status-danger` (#f87171). PhotoButton 은 `bg-status-danger` raw 변수 직접 → **executor 가 tokens.css alias 추적 후 정확한 className 선택 (`bg-danger` vs `bg-danger-bar`)**. roadmap §4 `feedback_inspection_unresolved_color.md` 와 별개 — 단순 alias 매핑 문제) |
| 6 | L16 | uploading overlay | `absolute inset-0 bg-[rgba(0,0,0,0.4)] rounded-[10px] flex items-center justify-center text-[12px] text-white` |
| 7 | L19 | add slot btn (72x72 dashed) | `w-[72px] h-[72px] rounded-[10px] bg-surface-raised border border-dashed border-border-strong text-text-secondary text-[12px] font-semibold cursor-pointer flex flex-col items-center justify-center gap-1 shrink-0` |

**예상 결과:** 7 → 0 (-7, -100%)

### Plan 01 합산 예상

| 파일 | before | after (예상) | 감소 |
|---|---:|---:|---|
| ui/index.tsx | 16 | ~10 | -6 (-38%) |
| PhotoGrid.tsx | 11 | 0~1 | -10~11 (-91~100%) |
| BottomNav.tsx | 8 | 1~2 | -6~7 (-75~88%) |
| PhotoButton.tsx | 7 | 0 | -7 (-100%) |
| **합산** | **42** | **~13** | **~-29 (~-69%)** |

옵션 N 잔존이 ui/index 와 BottomNav nav root 위주 — q5a/16a precedent 부분 변환 룰.

---

## Plan 02 — small-group 7 컴포넌트 (17 inline) + 비색 cleanup

### 대상 파일
- `src/components/SettingsPanel.tsx` (4 inline / 944줄 — 거대 파일이지만 4 inline 만 변경) + **L143 `border-danger` 비색 1건 cleanup**
- `src/components/SvgFloorPlan.tsx` (3 inline / 140줄)
- `src/components/PdfFloorPlan.tsx` (3 inline / 134줄)
- `src/components/ui/icons.tsx` (2 inline / 149줄)
- `src/components/SideMenu.tsx` (2 inline / 211줄)
- `src/components/DocumentUploadForm.tsx` (2 inline / 291줄)
- `src/components/PhotoSourceModal.tsx` (1 inline / 54줄)

### Plan 02 Task 1: SettingsPanel.tsx (4 inline + 비색 cleanup)

**현재 상태:** SettingsPanel 은 이미 W3~W11 변환 거의 완료 (대부분 className). 잔존 inline 4건은 **모두 화이트리스트 (§9.3) — 의도된 보존**:

| # | 라인 | 위치 | 현재 inline | 처리 |
|---:|---:|---|---|---|
| 1 | L86 | PermBadge 동적 16% alpha bg | `style={{ background: bg }}` (map 함수 결과) | **유지** — dynamic alpha color |
| 2 | L296 | type=date native widget 보정 | `style={{ WebkitAppearance: 'none', appearance: 'none', minWidth: 0, textAlign: 'left' }}` | **유지** — Tailwind class 한계 (vendor prefix appearance) |
| 3 | L693–697 | overlay 동적 open opacity/pointerEvents | `style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none' }}` | **유지** — dynamic open prop |
| 4 | L702–708 | 패널 본체 isDesktop + transform/transition + safe-area var | `style={{ top, bottom, transform, transition }}` | **유지** — cubic-bezier + safe-area var |

**Plan 02 Task 1 작업 = 비색 cleanup 1건만:**

| # | 라인 | 위치 | Before | After |
|---:|---:|---|---|---|
| ★ | L143 | 비밀번호 확인 input border 색 (conditional) | `confirm && next !== confirm ? 'border-danger' : 'border-border-default'` | `confirm && next !== confirm ? 'border-danger-bar' : 'border-border-default'` |

**근거:**
- roadmap §1 명시 — "SettingsPanel 비색 진짜 1곳 (L143 `'border-danger'` 단독)"
- roadmap §4 cleanup 룰 — "L143 `border-danger` → `border-danger-bar` (또는 `/25` opacity)"
- **`border-danger-bar` 채택 근거:** L148 의 `text-danger` 텍스트 색과 `border-danger-bar` border 색이 시각 일관 (다른 곳에서 사용된 `bg-danger-bar` / `text-danger` 조합과 동일 — sqk-02 ExcelPreview / sqk-01 InstallPrompt precedent)
- **검증:** Plan 02 verify gate `border-danger[^-]` regex 0 으로 강제

**Plan 02 Task 1 예상 결과:** 4 inline → 4 inline (변경 0, 화이트리스트 유지) / 비색 1 → 0 (변경 -1 line)

### Plan 02 Task 2: SvgFloorPlan.tsx (3 inline)

| # | 라인 | 위치 | 변환 후 |
|---:|---:|---|---|
| 1 | L108–112 | container div | `w-full h-full flex items-center justify-center relative` |
| 2 | L120–124 | `<object>` SVG container | `block pointer-events-none select-none` |
| 3 | L129–133 | loading overlay | `absolute inset-0 flex items-center justify-center text-text-tertiary text-label font-semibold` (var(--t3) → text-text-tertiary, fontSize:13 → text-label 13px) |

**예상 결과:** 3 → 0 (-3, -100%)

### Plan 02 Task 3: PdfFloorPlan.tsx (3 inline)

| # | 라인 | 위치 | 변환 후 |
|---:|---:|---|---|
| 1 | L112–115 | container div | `absolute inset-0 flex items-center justify-center` |
| 2 | L119 | canvas | `block pointer-events-none select-none` |
| 3 | L123–127 | loading overlay | (SvgFloorPlan L129 IDENTICAL) `absolute inset-0 flex items-center justify-center text-text-tertiary text-label font-semibold` |

**예상 결과:** 3 → 0 (-3, -100%)

### Plan 02 Task 4: ui/icons.tsx (2 inline)

| # | 라인 | 위치 | 변환 후 |
|---:|---:|---|---|
| 1 | L37 | StrokeSvg `<svg>` | **옵션 N** — `{ flexShrink: 0, ...style }` spread combo → spread 의 외부 `style` prop 보존 필요 → **inline 잔존** (q5a/s07-02 spread combo precedent) |
| 2 | L57 | StairsIcon `<svg>` | **옵션 N** — `{ flexShrink: 0, ...style }` spread combo → **inline 잔존** |

**예상 결과:** 2 → 2 옵션 N 잔존 (0 변환). Plan 02 의 spread combo precedent.
- **대안:** `flex-shrink-0` 을 className 으로 분리하고 spread style 만 보존 → `className={\`shrink-0 ${className ?? ''}\`} style={style}` — **executor 결정** (시각 0 byte 보장 시 채택, 단 className 전파 룰 확인 필요)

### Plan 02 Task 5: SideMenu.tsx (2 inline)

**현재 상태:** SideMenu 도 이미 W11 변환 거의 완료. 잔존 inline 2건은 화이트리스트:

| # | 라인 | 위치 | 현재 inline | 처리 |
|---:|---:|---|---|---|
| 1 | L114–118 | overlay 동적 open opacity/pointerEvents | `style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none' }}` | **유지** — dynamic open prop (SettingsPanel L693 IDENTICAL 패턴) |
| 2 | L125–131 | 패널 본체 transform/transition + safe-area var | `style={{ top, bottom, transform, transition }}` | **유지** — cubic-bezier + safe-area var (SettingsPanel L702 IDENTICAL 패턴) |

**Plan 02 Task 5 작업 = 변경 0 (검증만):**

**예상 결과:** 2 → 2 (변경 0, 의도된 보존). 단 verify gate 에서 카운트 IDENTICAL 확인.

### Plan 02 Task 6: DocumentUploadForm.tsx (2 inline)

| # | 라인 | 위치 | 변환 후 |
|---:|---:|---|---|
| 1 | L224 | file input hidden | `hidden` (Tailwind core utility) |
| 2 | L247 | progress fill width | **옵션 N** — `style={{ width: \`${progress.percent}%\` }}` dynamic value → inline 잔존 (q5a dynamic value precedent) |

**예상 결과:** 2 → 1 옵션 N 잔존 (-1, -50%)

### Plan 02 Task 7: PhotoSourceModal.tsx (1 inline)

| # | 라인 | 위치 | 변환 후 |
|---:|---:|---|---|
| 1 | L31 | 모달 본체 paddingBottom safe-area | **옵션 N** — `style={{ paddingBottom: 'calc(54px + var(--sab, env(safe-area-inset-bottom, 0px)) + 12px + 16px)' }}` → inline 잔존 (BottomNav nav root 와 동일 safe-area calc pattern) |

**예상 결과:** 1 → 1 옵션 N 잔존 (0 변환). 의도된 보존.

### Plan 02 합산 예상

| 파일 | before | after (예상) | 감소 |
|---|---:|---:|---|
| SettingsPanel.tsx | 4 | 4 (화이트리스트) | 0 (비색 1 → 0 별도) |
| SvgFloorPlan.tsx | 3 | 0 | -3 (-100%) |
| PdfFloorPlan.tsx | 3 | 0 | -3 (-100%) |
| ui/icons.tsx | 2 | 0~2 | -0~2 (executor 결정) |
| SideMenu.tsx | 2 | 2 (화이트리스트) | 0 |
| DocumentUploadForm.tsx | 2 | 1 | -1 (-50%) |
| PhotoSourceModal.tsx | 1 | 1 | 0 |
| **합산** | **17** | **8~10** | **~-7~9 (~-41~53%)** |
| **비색** | **1** | **0** | **-1** |

옵션 N 잔존 비율 높음 (small-group 은 이미 변환 거의 완료 / 화이트리스트 dynamic 잔존).

---

## Wave 16c 페어 합산 예상

| 항목 | Plan 01 | Plan 02 | 합산 |
|---|---:|---:|---:|
| inline before | 42 | 17 | **59** |
| inline after (예상) | ~13 | ~8~10 | **~21~23** |
| 감소 | ~-29 (~-69%) | ~-7~9 (~-41~53%) | **~-36~38 (~-61~64%)** |
| 비색 정리 | 0 | -1 (L143) | -1 |
| commits | 1 | 1 | 2 |

---

## 자동 검증 block (Plan 01 + Plan 02 공통, 각 plan 후 실행)

```bash
cd /Users/jykevin/Documents/cbc7119-design/cha-bio-safety

# Plan 별 파일 set
FILES_PLAN01=(
  src/components/ui/index.tsx
  src/components/PhotoGrid.tsx
  src/components/BottomNav.tsx
  src/components/PhotoButton.tsx
)
FILES_PLAN02=(
  src/components/SettingsPanel.tsx
  src/components/SvgFloorPlan.tsx
  src/components/PdfFloorPlan.tsx
  src/components/ui/icons.tsx
  src/components/SideMenu.tsx
  src/components/DocumentUploadForm.tsx
  src/components/PhotoSourceModal.tsx
)
# 본 plan 실행 시 해당 set 선택
FILES=("${FILES_PLAN01[@]}")  # 또는 FILES_PLAN02

# [1] inline count drop
echo "=== [1] inline count drop ==="
for F in "${FILES[@]}"; do
  B=$(git show HEAD:$F | grep -c 'style={{')
  A=$(grep -c 'style={{' $F)
  echo "$F: $B → $A"
done

# [2] 비즈 anchor identity (9 patterns × N files)
echo ""
echo "=== [2] 비즈 anchor identity (9 patterns IDENTICAL) ==="
for F in "${FILES[@]}"; do
  echo "--- $F ---"
  for ANCHOR in 'onClick=\{[^}]+\}' 'useState\(' 'useRef\(' 'useEffect\(' 'useMutation\(' 'useQuery\(' 'useNavigate\(' 'useParams\(' 'fetch\('; do
    B=$(git show HEAD:$F | grep -cE "$ANCHOR")
    A=$(grep -cE "$ANCHOR" $F)
    if [ "$B" = "$A" ]; then
      echo "  $ANCHOR: $B (OK)"
    else
      echo "  $ANCHOR: $B→$A MISMATCH ❌"
    fi
  done
done

# [3] precise onClick diff
echo ""
echo "=== [3] precise onClick diff (sorted/uniq empty) ==="
for F in "${FILES[@]}"; do
  BN=$(basename $F)
  git show HEAD:$F | grep -oE 'onClick=\{[^}]+\}' | sort | uniq > /tmp/before-$BN.txt
  grep -oE 'onClick=\{[^}]+\}' $F | sort | uniq > /tmp/after-$BN.txt
  D=$(diff /tmp/before-$BN.txt /tmp/after-$BN.txt | wc -l)
  if [ "$D" = "0" ]; then
    echo "$F onClick diff: empty (OK)"
  else
    echo "$F onClick diff: $D lines ❌"
    diff /tmp/before-$BN.txt /tmp/after-$BN.txt | head -20
  fi
done

# [4] Phase A 보존 (emoji + 비색)
echo ""
echo "=== [4] Phase A 보존 ==="
for F in "${FILES[@]}"; do
  EB=$(git show HEAD:$F | grep -cE '✓|✗|🔒|💾|🔥|⏰|📋|✅|⚠️|❌|🔧|🚨|🔍|🧯|📊|📷|✕')
  EA=$(grep -cE '✓|✗|🔒|💾|🔥|⏰|📋|✅|⚠️|❌|🔧|🚨|🔍|🧯|📊|📷|✕' $F)
  CB=$(grep -cE 'bg-warning[^-]|border-safe[^-]|border-warning[^-]|border-danger[^-]' $F)
  echo "$F emoji: $EB → $EA / 비색(after): $CB"
done
# Plan 02 SettingsPanel 비색 = 0 강제 (다른 파일도 0 유지)

# [5] module data const + 함수 보존 (정의 0 byte)
echo ""
echo "=== [5] module data const + 함수 정의 보존 ==="
# Plan 01 ui/index.tsx
git show HEAD:src/components/ui/index.tsx | grep -nE 'const SHIFT_STYLE|const LEAVE_COLOR|const LEAVE_LABEL|const STATUS_STYLE|const CAT_STYLE|function HalfCircle|function hexToRgba|export function (DutyChip|RoleLabel|Donut|StatusBadge|CatBar)' > /tmp/ui-before.txt
grep -nE 'const SHIFT_STYLE|const LEAVE_COLOR|const LEAVE_LABEL|const STATUS_STYLE|const CAT_STYLE|function HalfCircle|function hexToRgba|export function (DutyChip|RoleLabel|Donut|StatusBadge|CatBar)' src/components/ui/index.tsx > /tmp/ui-after.txt
diff /tmp/ui-before.txt /tmp/ui-after.txt && echo "ui/index const+func: 0 byte OK" || echo "ui/index const+func: MISMATCH ❌"

# Plan 01 BottomNav.tsx
git show HEAD:src/components/BottomNav.tsx | grep -nE 'const IS_ANDROID|const ITEMS' > /tmp/bn-before.txt
grep -nE 'const IS_ANDROID|const ITEMS' src/components/BottomNav.tsx > /tmp/bn-after.txt
diff /tmp/bn-before.txt /tmp/bn-after.txt && echo "BottomNav const: 0 byte OK" || echo "BottomNav const: MISMATCH ❌"

# Plan 02 SideMenu.tsx + DocumentUploadForm.tsx + PhotoSourceModal.tsx
git show HEAD:src/components/SideMenu.tsx | grep -nE 'const NAV_H|const MENU|const ITEM_META|const RAW_TO_LABEL' > /tmp/sm-before.txt
grep -nE 'const NAV_H|const MENU|const ITEM_META|const RAW_TO_LABEL' src/components/SideMenu.tsx > /tmp/sm-after.txt
diff /tmp/sm-before.txt /tmp/sm-after.txt && echo "SideMenu const: 0 byte OK" || echo "SideMenu const: MISMATCH ❌"

# [6] z-index hierarchy 보존 (zone-aware)
echo ""
echo "=== [6] z-index hierarchy 보존 ==="
echo "BottomNav z:100: $(grep -cE 'z-\[100\]|zIndex.*100' src/components/BottomNav.tsx)"
echo "SideMenu z:190/200: $(grep -cE 'z-\[19[05]\]|z-\[200\]|zIndex.*(190|200)' src/components/SideMenu.tsx)"
echo "PhotoSourceModal z:9999: $(grep -cE 'z-\[9999\]|zIndex.*9999' src/components/PhotoSourceModal.tsx)"
echo "SettingsPanel z:190/200: $(grep -cE 'z-\[19[05]\]|z-\[200\]|zIndex.*(190|200)' src/components/SettingsPanel.tsx)"

# [7] TypeScript
echo ""
echo "=== [7] TypeScript ==="
./node_modules/.bin/tsc --noEmit 2>&1 | grep -E 'error TS' | wc -l
# 신규 에러 0

# [8] off-scope (cha-bio-safety/ 외 변경 0)
echo ""
echo "=== [8] off-scope ==="
cd .. && git diff --name-only HEAD | grep -v 'cha-bio-safety/' | wc -l
# MUST = 0

# [9] vite build (Plan 02 완료 후 한 번만)
cd cha-bio-safety
# npm run build:vite 또는 vite build (실제 명령은 package.json 확인)
```

---

## Plan 별 commit 메시지

### Plan 01
```
feat(260529-tbv-01): Phase B Wave 16c-1 — XS large-group (ui/index + PhotoGrid + BottomNav + PhotoButton 42 inline) → tailwind
```

### Plan 02
```
feat(260529-tbv-02): Phase B Wave 16c-2 — XS small-group (7 components 17 inline + SettingsPanel L143 비색 정리) → tailwind / Phase B 종결
```

---

## Phase B 완결 메트릭 예상 (Wave 16c 종결 후)

### Tier 1 모바일 위주 sweep (11 waves)
- ~570 inline + 25 emoji 변환 완료 (Wave 1~11)

### Tier 2 데스크톱 분기 큰 페이지 (8 waves)
- 모바일 zone (12a~15a): 206 inline
- 데스크톱 zone (12b~15b): 181 inline
- Tier 2 합산: 387 inline 변환 완료

### Tier 3 컴포넌트 batch (3 waves)
- Wave 16a (s07): 77 → 6 (-71, -92%)
- Wave 16b (sqk): 76 → 9 (-67, -88%)
- Wave 16c (tbv, 본 wave): 59 → ~21 (~-38, ~-64%) — 옵션 N 비율 높음 (small-group + ui/index dynamic color)
- **Tier 3 합산: 212 → ~36 (~-176, ~-83%)**

### Phase B 전체 합산 (예상)
- **전체 변환: ~1169 inline + 25 emoji**
- **변환 적용: ~85~88%** (옵션 N 의도 잔존 ~12~15%)
- **commit 누적: ~28 atomic** (Phase B Tier 1 11 + Tier 2 8 + Tier 3 5 + Phase A + wdc + 01h 등)

### 묶음 D production cherry-pick 후보
- Tier 2 + Tier 3 누적 wave 묶음 → 직원 도메인 production 적용 결정
- 메모리 anchor: `feedback_production_sync_protocol.md` — production 작업 시 `.planning/production-sync.md` 게이트 갱신 필수

---

## 메모리 anchor 확인 (Wave 16c 적용)

- `feedback_tailwind_w8_h8_is_48px.md` — w-7=32, w-8=48 override → 72x72 thumbnail / 28x28 / 32x32 / 50x50 / 21x21 / 20x20 / 14x14 모두 arbitrary `w-[Npx] h-[Npx]` 사용
- `feedback_tailwind_token_class_pattern.md` — status- prefix 금지 → PhotoButton L15 `var(--status-danger)` raw 는 alias 추적 후 `bg-danger` 또는 `bg-danger-bar` 선택
- `feedback_text_caption_leading_none.md` — 작은 컨테이너 text-caption → leading-none 명시 (PhotoGrid ✕ btn L66 / PhotoButton ✕ btn L15)
- `feedback_design_changes_ask_first.md` — 시각 0 byte 룰이라 컨펌 부담 낮음 (no-op refactor)
- `feedback_bottomnav_gap_style.md` — BottomNav gap 패턴 보존 (nav 자체 키우는 height + paddingBottom, IS_ANDROID conditional)
- `feedback_inspection_unresolved_color.md` — 미조치 색 fire 룰. **SettingsPanel L143 비색은 form validation error 케이스 — danger 의도 정확** (조치/미조치 아님)
- `feedback_dashboard_grid_1fr.md` / `feedback_dashboard_horizontal_scroll.md` — 본 wave 영향 없음 (Dashboard 아님)
- 16a precedent — dual-render IDENTICAL / module data const + 함수 0 byte 보존 / spread combo 옵션 N / w-7/h-7 함정 회피 / overscroll-contain core utility / dead code 제거 (`pad` 패턴)
- 16b precedent — dynamic coordinate overlay preserve / 옵션 M multi-state conditional className / rounded-md/rounded-lg 함정 / tokens.css alias chain 추적 / 옵션 N emoji span 보존

---

## SettingsPanel 비색 처리 — 자체 검수 룰

본 wave 의 핵심 cleanup 작업이라 별도 자체 검수:

1. **변경 전 상태 확인:** `grep -n 'border-danger' src/components/SettingsPanel.tsx`
   - L143: `confirm && next !== confirm ? 'border-danger' : 'border-border-default'` — **단독 비색 1건**
   - L934: `border border-danger/25` — opacity modifier 적법 (false-positive 아님)

2. **변경 후 검증:**
   ```bash
   # 단독 border-danger 0 강제 (opacity modifier 는 매치 안 함)
   grep -cE 'border-danger[^-/]|border-danger$' src/components/SettingsPanel.tsx
   # 결과 MUST = 0
   ```

3. **시각 동일성 검증 (사용자 컨펌):**
   - 설정 패널 → 비밀번호 변경 → 새 비밀번호 입력 → 확인 다른 값 입력 → input border 색 변경 확인
   - **변경 전 색:** `var(--status-danger)` = #f87171 (dark) / #991b1b (light)
   - **변경 후 색:** `var(--status-danger-bar)` = #ef4444 (dark) / #b91c1c (light)
   - 시각 차이 ~10% 색 농도 변화 (둘 다 빨강 계열, 사용자 인지 가능 — **사용자 컨펌 게이트**)
   - **대안:** `border-danger/25` opacity modifier 채택 시 inactive border 와 시각 통일 → roadmap §4 `(또는 /25 opacity)` 옵션 — executor 가 시각 검수 후 결정 권장

---

## 사용자 컨펌 게이트 (cbc7119-preview 자동 deploy 후 시각 검증)

### Plan 01 cbc7119-preview 시각 검증
- **ui/index.tsx:** 일일 일지 / 일정 페이지 → DutyChip 4종 (day/night/off/leave) + 반차 (half_am/pm) HalfCircle SVG / Donut 도넛 차트 픽셀 1:1 / StatusBadge / CatBar
- **PhotoGrid.tsx:** 점검 모달 사진 첨부 → thumbnail 72x72 / ✕ btn 20x20 / add slot 72x72 dashed / Lightbox 정상 / camera/album input 동작
- **BottomNav.tsx:** 모바일 진입 → 5탭 (대시보드/점검/QR/조치/승강기) / QR 특수 버튼 50x50 gradient / 조치 unresolvedCount 배지 / IS_ANDROID safe-area 정상
- **PhotoButton.tsx:** 단일 사진 첨부 (조치 상세 등) → preview 72x72 / ✕ btn / Camera Lucide / add slot 72x72 dashed

### Plan 02 cbc7119-preview 시각 검증
- **SettingsPanel.tsx:** 설정 패널 열기 / 비밀번호 변경 → 새 비밀번호 + 확인 불일치 시 input border 색 (변경 전후 비교 — 사용자 컨펌 게이트)
- **SvgFloorPlan.tsx + PdfFloorPlan.tsx:** 도면 페이지 → 도면 로딩 정상 / 로딩 중 텍스트 / 줌 동작
- **ui/icons.tsx:** 커스텀 icon 6종 (Stairs/Shutter/ExitSign/SmokeVent/HoseReel/FireExtinguisherCustom/Elevator) 렌더 픽셀 1:1
- **SideMenu.tsx:** 메뉴 열기 → overlay 페이드 + 패널 translateX(0) transition 정상 / safe-area + cubic-bezier 보존
- **DocumentUploadForm.tsx:** documents 페이지 업로드 → 파일 선택 / progress bar fill width 정상
- **PhotoSourceModal.tsx:** 사진 첨부 → 모달 카메라/앨범 선택 / safe-area paddingBottom 정상

---

## Self-Check: PLAN READY

- [x] 11 컴포넌트 정확 inline 카운트 확인 (FloorB5 제외 결정 명시)
- [x] SettingsPanel L143 비색 cleanup 룰 명시 (`border-danger-bar` 또는 `/25` opacity)
- [x] 분할 결정 Option B 채택 + 16a/16b precedent 근거
- [x] Plan 01 (large-group 4 파일 42 inline) + Plan 02 (small-group 7 파일 17 inline + 비색 1) 작업 매핑 완료
- [x] 옵션 X+P+M+색변수N 22 wave 승계 (재컨펌 불필요)
- [x] module data const + 함수 0 byte 보존 룰 명시 (ui/index 5 const + BottomNav 2 const + SideMenu 4 const + 5 export func)
- [x] 화이트리스트 inline (SettingsPanel 4 + SideMenu 2 + PhotoSourceModal 1 + ui/icons 2 spread) 의도 보존 명시
- [x] 자동 검증 block 9 gate (inline / 비즈 anchor / onClick diff / Phase A 보존 / module const / z-index / TypeScript / off-scope / vite build)
- [x] 메모리 anchor 9건 확인 (w-7/h-7 / token pattern / leading-none / design changes / bottomnav gap / unresolved color / 16a + 16b precedent)
- [x] Phase B 완결 메트릭 예상 (Tier 1+2+3 누적 ~85~88% 변환)
- [x] 사용자 컨펌 게이트 12 시각 검증 항목 명시
