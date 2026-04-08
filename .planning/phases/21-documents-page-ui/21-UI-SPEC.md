---
phase: 21
slug: documents-page-ui
status: draft
shadcn_initialized: false
preset: none
created: 2026-04-09
---

# Phase 21 — UI Design Contract

> Visual and interaction contract for the Documents page. Mirrors existing CHA Bio Safety visual language (dark theme, inline styles, CSS variables). Korean copy throughout.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (project uses inline styles + CSS variables, no component library) |
| Preset | not applicable |
| Component library | none — hand-rolled primitives in `src/components/ui/index.tsx` |
| Icon library | `lucide-react` 0.454.0 |
| Font | Noto Sans KR (body/UI), JetBrains Mono (numerics: size, speed, ETA) |

Theme tokens (already defined in `src/index.css`, do not redefine):

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#0d1117` | Page background (dominant) |
| `--bg2` | `#161b22` | Card background |
| `--bg3` | `#1c2128` | Raised surface / hover |
| `--bg4` | `#22272e` | Input / elevated control |
| `--bd` | `rgba(255,255,255,0.07)` | Hairline border |
| `--bd2` | `rgba(255,255,255,0.13)` | Emphasized border |
| `--t1` | `#e6edf3` | Primary text |
| `--t2` | `#8b949e` | Secondary text |
| `--t3` | `#6e7681` | Tertiary / disabled |
| `--danger` | `#ef4444` | Destructive / error |

---

## Spacing Scale

All values are multiples of 4. Use these only.

| Token | Value | Usage in this phase |
|-------|-------|---------------------|
| xs | 4px | Icon-to-label gap, badge inner padding |
| sm | 8px | Meta row gaps (연도·크기·업로더 구분) |
| md | 16px | Card inner padding, form field vertical gap |
| lg | 24px | Section padding, hero card inner padding |
| xl | 32px | Between hero card and "과거 이력" section |
| 2xl | 48px | Desktop 2-column gap between plan/drill |
| 3xl | 64px | (unused this phase) |

Exceptions:
- **Tap targets: minimum 44px height** for all interactive rows (mobile-glove friendly). Hero card ≥ 96px. Past-history row = 56px. Tab buttons = 44px.
- BottomSheet handle bar: 40px × 4px (established pattern, not on 4-grid but preserves existing look).

---

## Typography

Exactly 4 sizes, 2 weights. Noto Sans KR unless noted.

| Role | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Body | 14px | 400 | 1.5 | List rows, meta text (크기/업로더/일시), form labels |
| Label | 16px | 600 | 1.4 | Hero card filename, primary form field values, tab labels, primary button |
| Heading | 20px | 600 | 1.3 | Section header ("소방계획서" / "소방훈련자료"), modal/sheet title |
| Display | 28px | 600 | 1.2 | Hero card year badge (e.g. "2026") — JetBrains Mono |

Numerics (file size, MB/s, %, ETA) render in **JetBrains Mono** at body size so digits are tabular.

---

## Color

60 / 30 / 10 split reuses the established theme.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `var(--bg)` `#0d1117` | Page background, BottomSheet/Modal overlay base |
| Secondary (30%) | `var(--bg2)` / `var(--bg3)` | Cards (hero + past-history rows), sheet/modal surface, tab bar, form inputs (`--bg4`) |
| Accent (10%) | `#2f81f7` (existing project blue) | See reserved list below |
| Destructive | `var(--danger)` `#ef4444` | Upload error toast border, retry button border on error, abort/cancel confirm |

**Accent `#2f81f7` reserved exclusively for:**
1. Active tab underline (mobile tab bar)
2. Primary CTA button background ("업로드") — admin only
3. Progress bar fill during active upload
4. Hero card "최신" pill badge background

Accent NEVER used for: past-history rows, meta text, icons in headers, hover states, borders at rest. Hover uses `--bg3`, not accent.

Text on accent (#2f81f7) = `#ffffff` weight 600 (contrast 4.8:1, passes AA for 16px/600).

---

## Copywriting Contract

All Korean. No emojis.

### Page & navigation
| Element | Copy |
|---------|------|
| SideMenu label | `소방계획서/훈련자료` |
| Page title (desktop header) | `문서 관리` |
| Mobile tab 1 | `소방계획서` |
| Mobile tab 2 | `소방훈련자료` |
| Desktop column heading (left) | `소방계획서` |
| Desktop column heading (right) | `소방훈련자료` |

### Hero card (latest document)
| Element | Copy / Pattern |
|---------|----------------|
| Year badge | `{year}` (e.g. `2026`) |
| "Latest" pill | `최신` |
| Meta line pattern | `{filename} · {sizeHuman} · {uploaderName} · {YYYY-MM-DD HH:mm}` |
| Tap hint (screen reader only) | `탭하여 다운로드` |

### Past history section
| Element | Copy |
|---------|------|
| Section header | `과거 이력` |
| Row pattern | `{year}년 · {title} · {sizeHuman}` (메타 2줄: 두 번째 줄 `{uploaderName} · {YYYY-MM-DD}`) |

### Empty state (no documents at all for this type)
| Element | Copy |
|---------|------|
| Heading | `아직 업로드된 문서가 없습니다` |
| Body (admin) | `우측 상단 업로드 버튼으로 {소방계획서/소방훈련자료}를 추가하세요.` |
| Body (assistant) | `관리자가 문서를 업로드하면 이곳에 표시됩니다.` |

### Loading state
| Element | Copy |
|---------|------|
| Skeleton caption (optional) | `문서를 불러오는 중입니다…` |

### Upload form (BottomSheet / Modal)
| Element | Copy |
|---------|------|
| Sheet/modal title | `{소방계획서/소방훈련자료} 업로드` |
| Year field label | `연도` |
| Title field label | `제목` |
| Title placeholder | `예: 2026년 소방계획서` |
| File field label | `파일` |
| File helper | `PDF, XLSX, DOCX, HWP, ZIP · 최대 200MB` |
| File picker button (empty) | `파일 선택` |
| File picker button (selected) | `{filename} · {sizeHuman}` |
| Primary CTA (idle) | `업로드` |
| Primary CTA (uploading) | `업로드 중…` |
| Secondary button (idle) | `취소` |
| Secondary button (uploading) | `취소` (triggers abort confirmation) |
| Retry button (after error) | `다시 시도` |

### Upload progress block
| Element | Copy / Pattern |
|---------|----------------|
| Percent line | `{NN}%` |
| Detail line | `{uploadedMB} / {totalMB} MB · {speed} MB/s · 남은 시간 {mm:ss}` |
| Indeterminate fallback (speed < 0.1 MB/s) | `{uploadedMB} / {totalMB} MB · 속도 계산 중…` |

### Download-in-progress indicator
| Element | Copy |
|---------|------|
| Inline toast | `다운로드 중입니다…` |
| Success toast | `다운로드를 시작했습니다` |

### Error states (toast.error)
| Situation | Copy |
|-----------|------|
| List fetch failure | `문서 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.` |
| Download failure | `다운로드에 실패했습니다. 네트워크를 확인해주세요.` |
| File size exceeded (client) | `파일 크기가 200MB를 초과합니다.` |
| Unsupported extension | `지원하지 않는 파일 형식입니다. (PDF, XLSX, DOCX, HWP, ZIP)` |
| Multipart create failed | `업로드를 시작하지 못했습니다. 다시 시도해주세요.` |
| Part upload failed | `업로드 중 네트워크 오류가 발생했습니다. 다시 시도해주세요.` |
| Complete failed | `업로드 마무리에 실패했습니다. 다시 시도해주세요.` |
| 403 (non-admin attempted) | `관리자만 업로드할 수 있습니다.` |

### Destructive confirmations
| Action | Confirmation copy |
|--------|-------------------|
| Cancel mid-upload (사용자가 '취소' 탭) | `업로드를 취소하시겠습니까? 지금까지 전송된 데이터는 저장되지 않습니다.` — confirm: `취소`, dismiss: `계속 업로드` |
| Page navigation during upload (`beforeunload`) | `업로드 중입니다. 페이지를 나가면 전송이 중단됩니다.` (브라우저 기본 다이얼로그) |

Note: deletion UI deferred (CONTEXT deferred list), so no delete confirmation.

---

## Interaction Contracts

### Responsive breakpoint
- **Mobile layout:** viewport width `< 1024px` → top tab bar, single column, BottomSheet upload.
- **Desktop layout:** viewport width `≥ 1024px` → 2-column (plan | drill), Modal upload. Max content width 1200px, horizontally centered, `lg` (24px) page padding.
- Detection: `window.matchMedia('(min-width: 1024px)')` hook (mirror any existing pattern in InspectionPage if present, else inline `useEffect` listener).

### Mobile tab bar
- Sticky top under app header. Height 44px. Two equal-width buttons.
- Active: label `--t1` weight 600, 2px underline in accent `#2f81f7`.
- Inactive: label `--t2` weight 400, no underline.
- Tap transition: no animation (instant). Tab state lives in component `useState`, not URL.

### Hero card
- Background `var(--bg2)`, border `1px solid var(--bd)`, border-radius 12px, padding `lg` (24px).
- Layout: year display (28px mono) on left in a 64×64 tinted tile (`var(--bg3)`, radius 8px); right column: title (16px/600), meta line (14px/400 `--t2`), "최신" pill top-right (accent bg, 11px white 600, padding 4px 8px, radius 999px).
- Min height 96px. Full-width tap target. Hover (desktop only): background shifts to `var(--bg3)`, no border color change.
- On tap: triggers authenticated Blob download (see Download flow).

### Past history list
- Header: "과거 이력" 16px/600 `--t1`, 24px top margin, 12px bottom margin.
- Rows: `var(--bg2)` background, 1px bottom border `var(--bd)`, padding `md` (16px), min-height 56px. Radius only on first (top) and last (bottom) row of the list container (8px).
- Row content line 1: `{year}년 · {title}` 14px/600 `--t1`. Line 2: `{sizeHuman} · {uploaderName} · {YYYY-MM-DD}` 14px/400 `--t2`.
- Hover (desktop): background `--bg3`. Active (mobile tap): 120ms background flash to `--bg3`.
- Entire row is the tap target for download.

### Empty state
- Centered vertically in the type's content area, min-height 240px.
- Icon: `lucide-react` `FileText` 48px `--t3`. Margin-bottom `md` (16px).
- Heading 16px/600 `--t1`, body 14px/400 `--t2` 8px below heading. Max-width 320px, text-align center.

### Loading state
- 3 skeleton rows: hero card skeleton (96px) + 2 history row skeletons (56px). Background `var(--bg2)`, shimmer via existing pattern if any; otherwise static `--bg3` block.

### Upload entry point (admin only)
- **Mobile:** Top-right of the active tab, 40×40 icon button (`Plus` icon from lucide, `--t1`), background transparent, tap opens BottomSheet.
- **Desktop:** Per-column header has a right-aligned button: icon `Plus` + label `업로드`, 40px height, padding 0 16px, background accent `#2f81f7`, text `#ffffff` weight 600, radius 8px.
- Non-admin: button not rendered at all (no disabled state, no tooltip).

### BottomSheet (mobile upload)
- Slide-up from bottom, backdrop `rgba(0,0,0,0.55)`, tap backdrop = cancel (with confirmation if uploading).
- Sheet: `var(--bg2)` background, top corners radius 16px, max-height 85vh, internal scroll.
- Handle bar: 40×4px, `var(--bd2)`, top 8px margin, centered.
- Inner padding `lg` (24px). Title row + form fields stacked with `md` (16px) vertical gaps.
- Transition: transform 240ms ease-out.

### Modal (desktop upload)
- Backdrop same as above. Centered card: width 480px, background `var(--bg2)`, border `1px solid var(--bd2)`, radius 12px, padding `lg` (24px), max-height 85vh internal scroll.
- Close via backdrop click, Escape key, or 취소 button (with confirmation if uploading).
- Transition: opacity 180ms + translateY(8px → 0).

### Form fields
- Labels 14px/600 `--t1`, field top-margin `xs` (4px).
- Inputs/selects: height 44px, background `var(--bg4)`, border `1px solid var(--bd)`, radius 8px, padding 0 12px, text 16px/400 `--t1`. Focus: border `#2f81f7`, no glow.
- File picker: custom button 44px, background `var(--bg3)`, border `1px dashed var(--bd2)`, radius 8px, text 14px/400. When file selected, text shifts to 14px/600 `--t1` showing filename + size.
- Field-level errors: 12px/400 `--danger` under the field, margin-top 4px.
- Disabled state (during upload): opacity 0.5, pointer-events none.

### Progress bar
- Container 8px tall, background `var(--bg4)`, radius 4px, full width.
- Fill: accent `#2f81f7`, animated width transition 240ms linear.
- Below bar: row with percent (left, 16px/600 mono) and detail line (right, 14px/400 mono `--t2`). Wrap to two lines on narrow widths.
- Rolling-average window: 3 seconds (CONTEXT D-24). Minimum 1s sample before showing speed; before that use "속도 계산 중…".

### Download flow (authenticated Blob pattern)
1. Tap row/card.
2. Row enters "downloading" state: inline 16×16 spinner (lucide `Loader2` spinning) appears at row's right edge; row remains tappable-disabled until complete.
3. Toast `다운로드 중입니다…` (react-hot-toast, no auto-dismiss, dismissed on completion/error).
4. On success: programmatic `<a download>` click, toast dismissed, optional success toast `다운로드를 시작했습니다` (2s).
5. On error: error toast (see copy table), spinner removed, row tappable again.
6. Implementation lives in `src/utils/downloadBlob.ts` (CONTEXT D-13).

### Beforeunload guard
- Attach listener only while an upload is actively in progress (state: uploading). Remove on success, error, or cancel.

### Focus & keyboard
- All interactive rows reachable via Tab. Focus ring: 2px solid `#2f81f7` with 2px offset (outline, not box-shadow, so it doesn't shift layout).
- Escape inside Modal closes (with confirmation if uploading). BottomSheet backdrop tap = same.
- Enter on hero/row = activate download.

### Accessibility
- Minimum tap target 44×44 everywhere.
- All icon-only buttons have `aria-label` (e.g. Plus button: `aria-label="{소방계획서/소방훈련자료} 업로드"`).
- Hero card and history rows rendered as `<button type="button">` so screen readers announce them as actionable.
- Progress bar: `role="progressbar" aria-valuenow aria-valuemin={0} aria-valuemax={100}` + text alternative via the percent line.
- Color is never the sole signal: active tab has both color change AND underline; error state has icon + text.

---

## Component Inventory

New files (CONTEXT D-15, D-17, and research):

| File | Role |
|------|------|
| `src/pages/DocumentsPage.tsx` | Route container, handles responsive layout, tab state, upload sheet/modal state |
| `src/components/DocumentSection.tsx` | Renders one type: hero card, past-history list, empty/loading, upload button |
| `src/components/DocumentUploadForm.tsx` | Form content, progress UI, error/retry — reused inside both BottomSheet and Modal |
| `src/utils/downloadBlob.ts` | Authenticated blob download + programmatic `<a download>` |
| `src/utils/multipartUpload.ts` | Orchestrates create → parts → complete/abort with progress callback |

Reused without modification:
- `react-hot-toast` (`toast.error`, `toast.loading`, `toast.success`, `toast.dismiss`)
- `useAuthStore` for role check
- `api.ts req<T>` wrapper for new `documentsApi` namespace
- Existing BottomSheet / Modal markup pattern from `LegalFindingsPage.tsx` and `InspectionPage.tsx` (no shared component exists; each page inlines its own — this phase inlines similarly)

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none (no shadcn, no third-party UI registry) | none | not applicable |

No external UI packages added by this phase. `lucide-react` is already a project dependency.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
