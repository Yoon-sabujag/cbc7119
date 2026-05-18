---
phase: 260518-mb9
plan: 01
subsystem: redesign/12-staff-service
tags: [sketch, desktop, form, state-matrix]
requires: [StaffServicePage.tsx lines 84~109 + 1041~1223, UI-SPEC §9.2, tokens.css v0.1.1, typography.css]
provides:
  - W7 desktop center panel sketch (휴가신청서 폼 전체)
  - 3-state button matrix (normal / selected / registered) visual lock
  - DOC_LEAVE_GRID 7-row 1-col/3-col branching reference for TSX wave
affects:
  - cha-bio-safety/docs/redesign-context/12-staff-service/sketch/
tech-stack:
  added: []
  patterns: [v0.1.1 token verbatim, .light-frame scoped override, 노안 룰 격상]
key-files:
  created:
    - cha-bio-safety/docs/redesign-context/12-staff-service/sketch/07-desktop-form-sketch.html
  modified: []
decisions:
  - Single-task quick wave — 1 file 1 commit, no SUMMARY needed per plan output spec (overridden by quick orchestrator to produce SUMMARY here)
  - VP5 demonstrates all 3 button states simultaneously (연차 registered + 오전반차 selected + rest normal)
  - VP6 is VP3 mirror in light theme via .light-frame scoped override (avoids data-theme attribute conflict with chrome)
  - 노안 룰 격상: source 11/13px → sketch 12/14/16/18px per typography.css scale
  - U+2713 ✓ used as registered label suffix — not emoji, project precedent W5
  - Reason field label rendered as inline div (not <label>) to match source structural pattern
metrics:
  duration: "~10 min"
  completed: 2026-05-18
---

# Phase 260518-mb9 Plan 01: 12-staff-service Sketch Wave 7 — Desktop Center Form Summary

W7 lockdown of the desktop center panel (휴가신청서 폼) for the 12-staff-service redesign — 6 viewport state matrix (5 dark + 1 light) covering empty / selected / registered button states, conditional reason textarea, conditional 기타특별 종류 input, and the 3 action CTAs (휴가 신청 / PDF 다운로드 / 인쇄).

## Tasks Completed

| Task | Name                                           | Commit  | Files                                                                                   |
| ---- | ---------------------------------------------- | ------- | --------------------------------------------------------------------------------------- |
| 1    | Build 07-desktop-form-sketch.html w/ 6-VP matrix | 9820d81 | cha-bio-safety/docs/redesign-context/12-staff-service/sketch/07-desktop-form-sketch.html |

## What Was Built

**File:** `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/07-desktop-form-sketch.html` (787 lines)

**Structure:**
- Single static HTML5 file, self-contained (no JS, no external CSS except Pretendard CDN)
- `:root` block: tokens.css v0.1.1 dark-theme verbatim
- `.light-frame` scoped block: tokens.css light-theme verbatim (scoped, not `[data-theme="light"]` — avoids cascade conflict with chrome `body` styles)
- Page chrome (body bg `#0f1419`, body text `#e6edf3`, caption `#7d8a9c`) is intentionally raw hex per plan allowlist
- Each VP renders the full 280px-wide center panel inside a `.vp-frame` with VP-specific state

**6-VP State Matrix:**

| VP   | Theme | Selected date | Shift  | Date range          | Days | Selected leave | Reason | 종류  | Notes                                  |
| ---- | ----- | ------------- | ------ | ------------------- | ---- | -------------- | ------ | ----- | -------------------------------------- |
| VP1  | dark  | (none)        | -      | placeholder         | -    | (none)         | hidden | hidden | 휴가 신청 disabled                       |
| VP2  | dark  | 5/18 (월)     | 주간   | 05-18 ~ 05-18       | 1    | 연차 (selected) | hidden (ANNUAL) | hidden | 휴가 신청 active                         |
| VP3  | dark  | 5/18 (월)     | 주간   | 05-18 ~ 05-20       | 3    | 경조휴가 (selected) | empty placeholder | hidden | 사유 textarea visible                  |
| VP4  | dark  | 5/19 (화)     | 당직   | 05-19 ~ 05-19       | 1    | 기타특별 (selected) | "가족돌봄 — 자녀 어린이집 휴원" | "가족돌봄" | 사유 + 종류 동시 표시                       |
| VP5  | dark  | 5/20 (수)     | 비번   | 05-20 ~ 05-20       | 1    | 연차 ✓ (registered) + 오전반차 (selected) | hidden | hidden | 3-state demo (registered + selected + normal) |
| VP6  | light | 5/18 (월)     | 주간   | 05-18 ~ 05-20       | 3    | 경조휴가 (selected) | empty placeholder | hidden | VP3 mirror, light theme via .light-frame |

**Button States (button matrix):**
- `.btn-normal`: bg `--surface-sunken` / color `--text-secondary` / 1px `--border-default`
- `.btn-selected`: bg `--accent` / color `--text-on-accent` / 1px `--accent`
- `.btn-registered`: bg `--status-safe-bg` / color `--status-safe` / 2px `--status-safe-bar` / label " ✓" suffix

**DOC_LEAVE_GRID 7 rows (verbatim from StaffServicePage.tsx lines 88~104):**
- Row 1 (3-col): 연차 | 오전반차 | 오후반차
- Row 2 (1-col): 경조휴가 (cols:3, span full)
- Row 3 (1-col): 병가(공상)
- Row 4 (1-col): 병가(사상)
- Row 5 (1-col): 보건휴가
- Row 6 (3-col): 공가 | 오전공가 | 오후공가
- Row 7 (1-col): 기타특별휴가

**Typography (격상 from source):**
- title 14 → 18 (`.text-title`)
- sel-date-label 13 → 14 (`.text-body-sm` weight 700)
- shift-chip 11 → 12 (`.text-caption` weight 700)
- field-label / field-help 10~11 → 12 (`.text-caption`)
- date input 11 → 14 (`.text-body-sm`)
- days-display 12 → 14 (kept 700 + `#facc15` yellow)
- leave button 11 → 12 (`.text-caption` weight 600)
- CTA buttons 13 → 16 (`.text-body` weight 700)

**Shift chip variants exercised:**
- 주간 (`--duty-day` orange) → VP2, VP3, VP6
- 당직 (`--duty-night` red) → VP4
- 비번 (`--duty-off` blue) → VP5
- 휴무 (`--duty-leave` gray) → reserved in CSS, not rendered (5 VPs cover 3 of 4 — meets ≥3 gate)

## Verification

All grep gates from plan passed (100%):

**Negative (forbidden):**
- 0 instances of 9/10/11px font sizes
- 0 emoji (✅🔥🚨🟢🟡🔴⚠️🛑) — U+2713 ✓ not classified as emoji per gate
- 0 fire references (status-fire/text-fire/bg-fire)
- 0 alias tokens (--bg3/--t1/--t2/--t3/--acl/--safe/--bd/--c-day/--c-night/--c-off/--c-leave)

**Positive (required):**
- 11/11 leave-type labels present: 연차, 오전반차, 오후반차, 경조휴가, 병가(공상), 병가(사상), 보건휴가, 공가, 오전공가, 오후공가, 기타특별휴가
- CTA counts: 휴가 신청 = 7, PDF 다운로드 = 7, 인쇄 = 7 (≥3 each — 6 VP buttons + 1 comment)
- vp-frame instances: 6 (5 dark + 1 light)
- light-frame class present (VP6)
- All 3 button state classes (btn-normal, btn-selected, btn-registered)
- All 4 duty tokens present in CSS (--duty-day, --duty-night, --duty-off, --duty-leave)
- --status-safe family present
- --accent token present

**Cardinality checks:**
- sel-date-row: 5 instances (hidden in VP1)
- days-display: 5 instances (hidden in VP1)
- reason-textarea: 3 instances (VP3, VP4, VP6 — non-annual types)
- other-input: 1 instance (VP4 only — other_special)
- btn-registered + ✓: 1 (VP5 연차 button)

## Deviations from Plan

None — plan executed exactly as written. Notes:

1. The `.light-frame` scoping pattern (class-based instead of `[data-theme="light"]`) was already locked in the plan's tokens-embed instructions ("via .light-frame :root-equivalent scoping"). VP6 uses `class="vp-frame light-frame"` and tokens cascade down to the .center-panel inside.

2. The plan listed `--duty-leave` as "reserved for a comment-only mention if needed" — it appears in the CSS `:root` block (verbatim from tokens.css) so it counts toward the gate naturally, no separate comment added. 4/4 duty tokens are in the file (CSS), 3/4 used in rendered chips (day/night/off) per spec.

3. CTA count came out to 7 each instead of exactly 6 because the B-7 button has an accompanying HTML comment "<!-- B-7 휴가 신청 (disabled) -->" — kept the comment for orientation since the gate only checks ≥3.

## Self-Check: PASSED

- File `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/07-desktop-form-sketch.html` exists (787 lines, well above 350 min)
- Commit `9820d81` in git log
- All grep gates passed (negative 0, positive all present)
- 6 VP frames rendered with correct state assignment per matrix
- VP5 simultaneously displays all 3 button states (registered + selected + normal)
- VP6 uses .light-frame class for light-theme override

## Follow-ups (out of scope, deferred)

- **TSX conversion wave** (next): Pull verbatim CSS from this sketch into StaffServicePage.tsx desktop center panel JSX (lines 1041~1223). Replace source's alias tokens (`var(--bd)`, `var(--bg3)`, `var(--t1)`, `var(--acl)`, raw `#22c55e`, raw `#facc15`) with v0.1.1 canonical names while preserving the runtime conditional logic (selCell?.date check, ANNUAL_TYPES.has(docLeaveType), docLeaveType === 'other_special').
- **Visual review with user**: confirm 6-VP matrix matches intent before TSX wave.
