---
phase: 260518-lr5
plan: 01
subsystem: redesign/12-staff-service
tags: [sketch, wave-6, desktop-3panel, staff-service]
requires:
  - W2 calendar sketch decisions (aspectRatio 1.2 desktop, 7×6 grid, 11 dot legend categories)
  - W3 legend + stat-card §6.3 decisions (4 cards w/ inset 3px box-shadow bar)
  - W4 menu grid + 48px dashed dropzone decisions
  - W5 token-block consistency
provides:
  - W6-DESKTOP-3PANEL (좌 flex / 중앙 280 fixed / 우 flex + GlobalHeader 54px strip)
  - W6-LEFT-PANEL-REUSE (calendar → legend → 4 stat cards → divider → menu wrapper → dropzone, order matches StaffServicePage.tsx lines 1029~1037)
  - W6-CENTER-PLACEHOLDER (휴가신청서 title + Wave 7 dashed callout)
  - W6-RIGHT-PLACEHOLDER (Wave 8 dashed callout w/ A4 595 max-w + lp[0..16] hint)
  - W6-TOKEN-CONTRACT (:root + [data-theme="light"] verbatim, NO alias block, 7 normalized hex set)
  - W6-OQ5-LOCKED (left panel contains zero selCell detail — selection ownership = center panel)
affects:
  - Wave 7 (center panel — 휴가신청서 폼) will populate the placeholder
  - Wave 8 (right panel — A4 PDF 미리보기) will populate the placeholder
tech-stack:
  added: []
  patterns:
    - "Dual-frame sketch (dark+light stacked at 1280px) consistent with W2/W3/W4 reference sketches"
    - "Desktop sizing reuse via @media (min-width: 768px) :root branch — sketch frame 1280px always in desktop mode"
key-files:
  created:
    - cha-bio-safety/docs/redesign-context/12-staff-service/sketch/06-desktop-3panel-sketch.html
  modified: []
decisions:
  - "OQ #5 locked — selCell detail / 휴가기간 / docStartDate / docEndDate are NOT rendered in left panel. Selection state ownership belongs to the center panel (W7)."
  - "Center + right panels are sketched as placeholder callouts only (dashed border on surface-sunken / surface-raised). W7/W8 will populate."
  - "Today (2026-05-18) uses --accent chip; selected cell (e.g., 5/20) uses raw #facc15 outline (locked W2 decision exception)."
  - "Duty cell backgrounds use translucent rgba derived from --duty-* token hexes (not categorical normalized hex set) to keep duty vs leave categorical distinction visually clear."
metrics:
  duration: ~12m
  completed: 2026-05-18
---

# Quick 260518-lr5 Plan 01: 12-staff-service Sketch Wave 6 — Desktop 3-panel

**One-liner:** Wave 6 desktop 3-panel skeleton sketch — fully populated left panel (W2/W3/W4 reuse at desktop sizing) + placeholder center/right panels.

## What Was Built

Single static HTML sketch at `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/06-desktop-3panel-sketch.html` containing 2 stacked 1280px frames:

- **Dark frame** (`data-theme="dark"`, 1280×760)
- **Light frame** (`data-theme="light"`, 1280×760)

Each frame renders:

1. **GlobalHeader placeholder strip (54px)** — hamburger 32×32 (3 bars), title "연차 및 식사" (15px / 700), cog SVG 18×18 (lucide-style 8-toothed gear).
2. **3-panel body** (flex:1):
   - **Left (flex:1 minWidth:0)**: 5월 2026 calendar (header 18px / weekday 13px / aspectRatio 1.2) showing all cell states — Today (5/18 w/ 오늘 chip), Selected (5/20 outline #facc15), Sun (red), Sat (blue), 공휴일 (5/5 어린이날, 5/25 부처님오신날), 4 duty states (주/당/비/휴 translucent), 5 leave categories (#42d778/#8f42d7/#d78042/#d74242/#d7428c), 점검일 (소검 5/4 + 승검 5/19), Blocked diagonal (5/26), 미N (5/21), 팀원 (5/8 "팀 김"), 오전반차 gradient (5/22). 11-chip legend row → 4 summary cards (연차 잔여 12일 #42d778 / 제공 식수 48끼 #06b6d4 / 미사용 식수 3끼 #d7428c / 주말 식대 22,000원 #8f42d7). Divider. Menu grid (중식 A #06b6d4 / 중식 B #d7428c side-by-side, 석식 #d78042 full width). 48px dashed PDF dropzone.
   - **Center (width:280 flexShrink:0)**: "휴가신청서" title (18px / 700) + Wave 7 dashed placeholder callout on `--surface-sunken`.
   - **Right (flex:1)**: Wave 8 dashed placeholder callout on `--surface-raised`, max-width 595px (A4 width hint), referencing `lp[0..16]` overlay.

Both panels (left + center) have `border-right: 1px solid var(--border-default)` for the 4-match grep gate.

## Decisions Made

- **OQ #5 locked** — The left panel **does not** contain any selCell detail row, 선택된 날짜 label, 휴가기간 input, or docStartDate/docEndDate input. Selection detail is owned by the center panel (휴가신청서). Wave 7 will populate that center panel.
- **Center + Right are placeholders only** — Wave 6 commits the 3-panel skeleton + fully-populated left panel. The center and right panels are explicit dashed-border callouts with "Wave 7 sketch 예정" and "Wave 8 sketch 예정" text. This makes the structure reviewable without leaking unfinalized form decisions.
- **Token contract** — `:root, [data-theme="dark"]` (lines 16~69) + `[data-theme="light"]` (lines 74~119) blocks copied **verbatim** from `tokens.css`. Primitive spacing block (lines 124~146) + desktop `@media (min-width: 768px)` branch (lines 148~162) + radius block (lines 167~172) also verbatim. The alias block (lines 177~197) is intentionally **NOT** included, and zero alias-token references (`var(--bg)`, `var(--bd)`, `var(--t1)`, `var(--c-day)`, etc.) exist in markup.
- **Categorical hex normalization** — All leave categories in markup use the 7-hex normalized set: `#42d778` (연차), `#8f42d7` (공가), `#d78042` (경조), `#d74242` (병가), `#d7428c` (보건), `#4244d7` (기타특별), `#06b6d4` (제공 식수). Duty backgrounds use translucent rgba of `--duty-*` hexes (#f59e0b/#ef4444/#3b82f6/#6b7280 @ 0.20) for visual distinction from category cells. Selected cell uses raw `#facc15` outline (W2 locked exception). Today uses `--accent` chip.
- **No 9/10/11 px font-size anywhere** — all text 12px or larger; 10×10 dot dimensions are `width`/`height` on span blocks (not font-size).

## Verification

All 13 grep verify gates pass:

| Gate | Check                                                       | Result            |
| ---- | ----------------------------------------------------------- | ----------------- |
| G1   | File exists + `<!doctype html>`                             | PASS              |
| G2   | No `font-size: (9\|10\|11)px`                               | PASS (0 matches)  |
| G3   | No emoji (1F300-1FAFF / 2600-27BF)                          | PASS (0 matches)  |
| G4   | No `var(--status-fire*` in markup                           | PASS (0 matches)  |
| G5   | No alias tokens (`--bg`, `--bd`, `--t1`, `--c-day`, ...)    | PASS (0 matches)  |
| G6   | 7 normalized hex each ≥1                                    | PASS (12/7/7/5/9/2/4) |
| G7   | 1280px frame ≥2                                             | PASS (6)          |
| G8   | `width: 280px` ≥2                                           | PASS (2)          |
| G9   | `border-right: 1px solid var(--border-default)` ≥4          | PASS (4)          |
| G10a | "Wave 7 sketch 예정" ≥1                                     | PASS (2)          |
| G10b | "Wave 8 sketch 예정" ≥1                                     | PASS (2)          |
| G11  | "연차 및 식사" title ≥1                                     | PASS (2)          |
| G12  | `:root` + `[data-theme="light"]` both present               | PASS              |
| G13  | OQ #5 negative — no 선택된 날짜/휴가기간/docStartDate/End   | PASS (0 matches)  |

## Deviations from Plan

None — plan executed exactly as written. All 13 grep gates pass on first build.

## Self-Check: PASSED

- File `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/06-desktop-3panel-sketch.html`: FOUND
- Commit `c2d7594`: FOUND
- No src/ touched, no other sketches touched, no wrangler invocation.

## Next Steps

- User reviews rendered sketch in browser (dark + light frames).
- On approval → main 머지 → cbc7119-preview 자동 배포 (per CLAUDE.local.md workflow).
- Wave 7 (next quick task) → sketch center panel 휴가신청서 폼 전체.
- Wave 8 (after) → sketch right panel A4 PDF 미리보기 + lp[0..16] 오버레이.
