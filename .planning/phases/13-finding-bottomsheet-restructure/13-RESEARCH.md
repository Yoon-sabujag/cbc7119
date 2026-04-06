# Phase 13: Finding BottomSheet Restructure - Research

**Researched:** 2026-04-06
**Domain:** React inline component modification — BottomSheet form UI, combo dropdown, preset data constants
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** 구역→층→상세위치 3단계 드롭다운 구조. 구역/층은 기존 chip 버튼 유지, 상세위치를 드롭다운으로 추가
- **D-02:** 상세위치 드롭다운은 콤보 방식 — 프리셋 목록 + '직접입력' 옵션. 층별로 다른 프리셋 제공
- **D-03:** 상세위치 프리셋 예시: 복도, 계단실, 화장실, EPS, TPS, 기계실, 전기실, 주차장 등 — 연구자가 건물 구조 기반으로 확정
- **D-04:** 현재 FINDING_ITEMS 스크롤 리스트 + 직접입력 조합 유지 (이미 구현되어 있고 동작 확인됨)
- **D-05:** FINDING_ITEMS 목록 내용은 현재 18개 항목 기준 유지. 방재팀 피드백 시 업데이트
- **D-06:** 기존 문자열 concat 방식 유지 — location은 "구역 층 상세위치" 문자열, description은 "항목 — 내용" 문자열
- **D-07:** DB 스키마 변경 없음 — legal_findings 테이블 그대로 사용

### Claude's Discretion
- 상세위치 프리셋 목록의 정확한 구성 (건물 도면/체크포인트 데이터 참조)
- 드롭다운 UI 스타일 (chip vs select vs custom dropdown)
- BottomSheet 내부 레이아웃 최적화
- 상세위치 직접입력 시 텍스트 필드 표시 방식

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FIND-01 | 지적사항 등록 시 공통 점검 항목 목록에서 선택하거나 직접 입력할 수 있다 | Already implemented: FINDING_ITEMS scrollable list + 직접입력 option in LegalFindingsPage.tsx. D-04/D-05 confirm no change needed. |
| FIND-02 | 지적사항 위치를 구역→층→상세위치 3단계 드롭다운으로 입력할 수 있다 | Currently only 2-stage (zone chip + floor chip) + free-text input. Requires replacing free-text with `<select>` combo + ZONE_FLOOR_DETAILS constant per UI-SPEC. |
</phase_requirements>

---

## Summary

Phase 13 is a focused frontend-only modification of `FindingBottomSheet` inside `LegalFindingsPage.tsx`. The component is already ~352 lines and contains all the UI logic inline — no new files, no API changes, no DB schema changes.

The core delta is **one field change**: the existing free-text `<input>` for "위치 상세" becomes a native `<select>` element with a preset list (ZONE_FLOOR_DETAILS constant) plus a '직접입력' option. When '직접입력' is selected, a text input appears below. FIND-01 (item selection + direct input) is already fully implemented and confirmed working per D-04.

The UI-SPEC (13-UI-SPEC.md) has been approved and fully specifies all visual tokens, interaction states, copy strings, and the preset list. The planner can treat the UI-SPEC as ground truth — no new design decisions remain.

**Primary recommendation:** Modify `FindingBottomSheet` in `LegalFindingsPage.tsx` — replace the free-text 상세위치 input with a `<select>` combo. Add `ZONE_FLOOR_DETAILS` constant (unified flat list, same preset for all zone/floor combos per UI-SPEC). No other files need changes.

---

## Standard Stack

### Core (all already installed — no new installs)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | Component rendering, local state | Project standard |
| TypeScript | 5.6.3 | Type safety | Project standard |
| react-hot-toast | 2.4.1 | Validation error toasts | Project standard |
| @tanstack/react-query | 5.59.0 | useMutation for form submission | Project standard |
| useMultiPhotoUpload | local hook | Photo slots management | Phase 12 output — already integrated in FindingBottomSheet |

### No New Dependencies
This phase requires **zero new package installs**. All required tools are already in the project.

**Installation:**
```bash
# nothing to install
```

---

## Architecture Patterns

### Recommended Change Scope
```
src/pages/LegalFindingsPage.tsx   ← ONLY file that changes
  FindingBottomSheet (inline component, lines 70–352)
    - Add: ZONE_FLOOR_DETAILS constant (above FindingBottomSheet)
    - Change: "위치 상세" section — replace <input> with <select> + conditional <input>
    - Keep: everything else unchanged
```

### Pattern 1: Inline Constant for Preset Data
**What:** Define `ZONE_FLOOR_DETAILS` as a flat string array constant at the top of the file, alongside `ZONES` and `ZONE_FLOORS`.
**When to use:** Data used only in one file, no need for shared module.
**Example:**
```typescript
// [VERIFIED: LegalFindingsPage.tsx lines 40-62 — mirrors ZONES/ZONE_FLOORS pattern]
const ZONE_FLOOR_DETAILS = [
  '직접입력',
  '복도',
  '계단실',
  '화장실',
  'EPS',
  'TPS',
  '기계실',
  '전기실',
  '주차장',
  '로비',
  '회의실',
  '실험실',
  '옥상',
] as const
```

### Pattern 2: Native `<select>` Combo with Conditional Text Input
**What:** Use native `<select>` styled to match inputStyle. When value === '직접입력', render a text `<input>` below.
**When to use:** Small preset list, mobile-friendly native picker, matches existing admin select pattern.
**Example:**
```typescript
// [VERIFIED: LegalFindingsPage.tsx lines 567–583 — existing styled <select> pattern in page]
const selectStyle: React.CSSProperties = {
  background: 'var(--bg3)',
  border: '1px solid var(--bd2)',
  borderRadius: 9,
  padding: '8px 12px',
  color: 'var(--t1)',
  fontSize: 13,
  width: '100%',
  appearance: 'none',
  WebkitAppearance: 'none',
  outline: 'none',
  fontFamily: 'inherit',
}
// In JSX:
<select value={locationDetail} onChange={e => setLocationDetail(e.target.value)} style={selectStyle}>
  {ZONE_FLOOR_DETAILS.map(item => (
    <option key={item} value={item}>{item}</option>
  ))}
</select>
{locationDetail === '직접입력' && (
  <input
    type="text"
    value={customLocationDetail}
    onChange={e => setCustomLocationDetail(e.target.value)}
    placeholder="직접 입력"
    style={{ ...inputStyle, marginTop: 8 }}
  />
)}
```

### Pattern 3: Location String Concat (unchanged)
**What:** Location value assembled at submit time from zone label + floor + resolved detail.
**When to use:** Matches D-06 — no schema change, backward compatible.
**Example:**
```typescript
// [VERIFIED: LegalFindingsPage.tsx lines 82–87 — existing concat in mutationFn]
const detailValue = locationDetail === '직접입력' ? customLocationDetail.trim() : locationDetail
const loc = [
  ZONES.find(z => z.key === zone)?.label,
  floor,
  detailValue,
].filter(Boolean).join(' ')
```

### New State Variable Required
The current `locationDetail` string state doubles as both the selection value and the typed value. With the combo pattern, two state variables are cleaner:
- `locationDetail: string` — selected `<select>` value (preset key or '직접입력')
- `customLocationDetail: string` — typed value when '직접입력' is active

This is a minimal state refactor inside the existing component. No state lifting needed.

### Anti-Patterns to Avoid
- **Custom dropdown overlay:** Building a custom dropdown with absolute positioning introduces scroll/z-index conflicts inside a 90vh BottomSheet. Use native `<select>` — the UI-SPEC confirms this choice.
- **Per-floor/per-zone preset branching:** D-03 and UI-SPEC both specify a unified flat list. Do not implement `Record<zone, Record<floor, string[]>>` — it adds complexity with no data model benefit given D-06 (string concat).
- **Replacing existing FINDING_ITEMS implementation:** D-04 confirms the scrollable list is working. Do not refactor it — only touch 상세위치 field.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Location detail dropdown | Custom floating menu | Native `<select>` | Already used in page (admin subheader), mobile-friendly, no z-index issues |
| Photo upload | Custom uploader | useMultiPhotoUpload hook (Phase 12) | Already integrated in FindingBottomSheet — do not re-implement |
| Toast notifications | Custom toast | react-hot-toast | Project standard |

**Key insight:** This phase is almost entirely a data/constant addition. The heavy lifting (photo upload, chip selection, mutation logic) already exists.

---

## Common Pitfalls

### Pitfall 1: locationDetail State Collision
**What goes wrong:** Using a single `locationDetail` state for both the `<select>` value and the typed custom value causes the custom text to get overwritten when the user changes the select back.
**Why it happens:** The combo select replaces the free-text input — they now have different roles.
**How to avoid:** Use two separate state variables: `locationDetail` (select value, defaults to '직접입력') and `customLocationDetail` (typed text, defaults to '').
**Warning signs:** Typing custom text then changing select and coming back finds the text gone.

### Pitfall 2: Select Styled Inconsistently with Dark Theme
**What goes wrong:** Native `<select>` on some browsers renders with a light background despite CSS override.
**Why it happens:** Browser UA stylesheet for `<option>` elements can override CSS on some platforms.
**How to avoid:** Apply `appearance: none; WebkitAppearance: none; background: var(--bg3); color: var(--t1)` — this is the exact pattern already used in the admin subheader select (LegalFindingsPage.tsx lines 568–580). Copy that element's style exactly.
**Warning signs:** Select looks white/light on Android Chrome or iOS Safari.

### Pitfall 3: Forgetting to Reset customLocationDetail on Sheet Close
**What goes wrong:** User opens sheet, types custom location, closes without submitting, reopens — custom text persists.
**Why it happens:** `onClose` calls `photos.reset()` but the new state variable needs explicit reset too.
**How to avoid:** Add `setCustomLocationDetail('')` to the `onSuccess` callback in the mutation AND ensure the sheet unmounts on close (it already conditionally renders: `{showSheet && id && <FindingBottomSheet .../>}`). Unmount-on-close means state resets automatically — verify that pattern is preserved.
**Warning signs:** Stale custom location text on second sheet open.

### Pitfall 4: ZONE_FLOOR_DETAILS Constant Position
**What goes wrong:** Placing the constant inside the component function causes a new array reference on every render.
**Why it happens:** `const` inside a function body is recreated each render.
**How to avoid:** Place `ZONE_FLOOR_DETAILS` at module scope alongside `ZONES` and `ZONE_FLOORS` (lines 40–53 area in LegalFindingsPage.tsx).

---

## Code Examples

### Complete 상세위치 Field Replacement

```typescript
// Source: [VERIFIED: LegalFindingsPage.tsx — existing inputStyle + select pattern]
// Replace the current <input type="text"> for 상세위치 with:

{/* 위치 상세 */}
<div>
  <div style={lblStyle}>위치 상세</div>
  <select
    value={locationDetail}
    onChange={e => { setLocationDetail(e.target.value); setCustomLocationDetail('') }}
    style={{
      background: 'var(--bg3)',
      borderRadius: 9,
      padding: '8px 12px',
      border: '1px solid var(--bd2)',
      width: '100%',
      color: 'var(--t1)',
      fontSize: 13,
      boxSizing: 'border-box',
      outline: 'none',
      fontFamily: 'inherit',
      appearance: 'none',
      WebkitAppearance: 'none',
    }}
  >
    {ZONE_FLOOR_DETAILS.map(item => (
      <option key={item} value={item}>{item}</option>
    ))}
  </select>
  {locationDetail === '직접입력' && (
    <input
      type="text"
      value={customLocationDetail}
      onChange={e => setCustomLocationDetail(e.target.value)}
      placeholder="직접 입력"
      style={{ ...inputStyle, marginTop: 8 }}
    />
  )}
</div>
```

### Updated mutationFn Location Assembly

```typescript
// Source: [VERIFIED: LegalFindingsPage.tsx lines 82-87 — existing concat logic]
const detailValue = locationDetail === '직접입력'
  ? customLocationDetail.trim()
  : locationDetail === '직접입력' ? '' : locationDetail  // simplified:
// Use:
const detailValue = locationDetail === '직접입력' ? customLocationDetail.trim() : locationDetail
const loc = [
  ZONES.find(z => z.key === zone)?.label,
  floor,
  detailValue || undefined,  // filter(Boolean) handles empty string
].filter(Boolean).join(' ')
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Free-text input for 상세위치 | Native `<select>` combo + conditional text input | Phase 13 | Structured location data, reduced typos, faster mobile entry |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Unified flat preset list (same for all zones/floors) is sufficient for first iteration | Architecture Patterns | If building has highly zone-specific locations, some presets may be irrelevant or missing — low risk, can be updated later |

---

## Open Questions

1. **Initial `locationDetail` default value**
   - What we know: Current `locationDetail` state initializes to `''` (empty string).
   - What's unclear: Should the `<select>` default to '직접입력' (first item) or a blank "선택" placeholder option?
   - Recommendation: Default to '직접입력' (first option in ZONE_FLOOR_DETAILS) — consistent with FINDING_ITEMS pattern where nothing is pre-selected. No empty/placeholder `<option value="">` needed since the first real option (직접입력) serves as the neutral starting point and shows the text input immediately, which prompts useful behavior.

---

## Environment Availability

Step 2.6: SKIPPED — this phase is frontend-only code changes with no external tool dependencies. Node.js, npm, and wrangler are already confirmed in use by the project.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no vitest/jest config in project |
| Config file | None |
| Quick run command | `npm run build` (TypeScript compile + Vite build — catches type errors) |
| Full suite command | `npm run build` |

No automated test infrastructure exists in this project. All validation is build-level (TypeScript + Vite) plus manual smoke testing on deployed environment per project memory ("항상 프로덕션 배포 후 테스트").

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FIND-01 | FINDING_ITEMS list renders + 직접입력 shows text input | manual | `npm run build` (compile check) | ❌ no test file — manual only |
| FIND-02 | 상세위치 select renders presets + 직접입력 triggers text input + location assembles correctly | manual | `npm run build` (compile check) | ❌ no test file — manual only |

### Sampling Rate
- **Per task commit:** `npm run build`
- **Per wave merge:** `npm run build` + deploy to production + manual smoke test
- **Phase gate:** Build green + manual verification on production before `/gsd-verify-work`

### Wave 0 Gaps
None — no test files needed. Project has no test infrastructure and follows manual-test-on-production workflow. Build check is the only automated gate.

---

## Security Domain

This phase involves no authentication, no new API endpoints, no new data processing, no external inputs beyond the existing form. The `<select>` preset values are hardcoded constants — not user-controlled data flowing to the backend in a new way. Location string assembly is the existing pattern (D-06, already in production).

ASVS V5 (Input Validation): `description` field validation is already present (`if (!description.trim())`). No new validation surface is introduced.

**Security changes: none required.**

---

## Sources

### Primary (HIGH confidence)
- `[VERIFIED: cha-bio-safety/src/pages/LegalFindingsPage.tsx]` — full source read; ZONES, ZONE_FLOORS, FINDING_ITEMS constants confirmed; FindingBottomSheet component structure confirmed; existing `<select>` style pattern at lines 568–580 confirmed
- `[VERIFIED: .planning/phases/13-finding-bottomsheet-restructure/13-CONTEXT.md]` — all locked decisions read
- `[VERIFIED: .planning/phases/13-finding-bottomsheet-restructure/13-UI-SPEC.md]` — full UI contract read; ZONE_FLOOR_DETAILS preset list confirmed; select element style confirmed
- `[VERIFIED: cha-bio-safety/src/hooks/useMultiPhotoUpload.ts]` — hook interface confirmed; already integrated in FindingBottomSheet
- `[VERIFIED: cha-bio-safety/src/components/PhotoGrid.tsx]` — PhotoGrid component exists and is available but not used in this phase (FindingBottomSheet uses inline photo row, not PhotoGrid component)
- `[VERIFIED: cha-bio-safety/src/types/index.ts lines 91-108]` — LegalFinding interface confirmed; location is string | null, no schema change needed

### Secondary (MEDIUM confidence)
- `[VERIFIED: .planning/REQUIREMENTS.md]` — FIND-01 and FIND-02 requirements confirmed; both marked Complete in traceability table

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all tools already installed, verified from codebase
- Architecture: HIGH — single file modification, existing patterns verified from source
- Pitfalls: HIGH — derived from reading existing code and identifying concrete state/style edge cases
- Preset data: MEDIUM (A1 in Assumptions Log) — flat list is a pragmatic first iteration, not exhaustive

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (stable React/Tailwind stack, no moving dependencies)
