---
phase: 260518-jiu-12-staff-service-sketch-wave-4-menu-card
plan: 01
subsystem: redesign/12-staff-service
tags: [sketch, redesign, W4, staff-service, menu-cards, dropzone]
dependency-graph:
  requires:
    - cha-bio-safety/docs/redesign-context/12-staff-service/tokens.css
    - cha-bio-safety/docs/redesign-context/12-staff-service/typography.css
    - cha-bio-safety/docs/redesign-context/12-staff-service/UI-SPEC.md
    - cha-bio-safety/docs/redesign-context/12-staff-service/StaffServicePage.tsx
    - cha-bio-safety/docs/redesign-context/12-staff-service/sketch/03-legend-summary-sketch.html
  provides:
    - W4-MENU-CARDS-SKETCH
    - W4-PDF-DROPZONE-SKETCH
    - W4-STATE-VARIANTS-SKETCH
    - W4-NORMALIZED-HEX-CONTRACT
  affects:
    - Future TSX 변환 wave (StaffServicePage.tsx line 842~1018)
tech-stack:
  added: []
  patterns:
    - 4-frame matrix (mobile×desktop × dark×light)
    - state-strip mini-grid (dark + light, 9 cell each)
    - NORMALIZED categorical hex (UI-SPEC §3.6)
    - inline SVG (lucide Upload / Check) — no emoji
    - rgba(R, G, B, 0.08) bg + rgba(R, G, B, 0.20) border 카테고리 카드 패턴
key-files:
  created:
    - cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html
  modified: []
decisions:
  - "중식 A코너 hex = #06b6d4 (식단 cyan, §3.6 별도 카테고리)"
  - "중식 B코너 hex = #d7428c (= 정규화 보건 hex 재사용; source 의 OLD 핑크 폐기)"
  - "석식 메뉴 hex = #d78042 (= 정규화 경조 hex 재사용; source 의 OLD 오렌지 폐기)"
  - "label 12px font-bold leading-none (source 10px → 12px 노안 격상)"
  - "body 14px leading-relaxed 1.625 (source 11px → 14px 노안 격상 + UI-SPEC §12 W4 강제)"
  - "dropzone 모바일 = 1px solid 12px padding / 데스크톱 = 2px dashed 48px padding (source line 1005/1007)"
  - "state variant — idle/dragover/uploading/success/error + skeleton/empty + 미운영일 = 8+1 cell × 다크/라이트"
metrics:
  duration: "약 6분"
  completed: 2026-05-18
---

# 260518-jiu Plan 01: 12-staff-service W4 식단 카드 + PDF dropzone sketch 완료

W4 (Wave 4) 의 식단 3종 카드 (중식 A코너 / 중식 B코너 / 석식 메뉴) + PDF 업로드 dropzone 영역 sketch HTML 한 파일을 NORMALIZED 카테고리 hex + leading-relaxed 14px 본문 + 4-frame mobile/desktop × dark/light matrix + 9 state variant mini-strip 으로 시각 고정. TSX 변환 wave 진입 전 visual contract 락.

## Tasks Completed

| Task | Name                                                                             | Commit  | Files                                                                           |
| ---- | -------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------- |
| 1    | Write 04-menu-cards-sketch.html (4-frame matrix + 9 state variants + rules box) | pending | cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html |

## Verification Results

All 9 grep verify gates PASS:

1. Negative gate 1 (9/10/11px font-size): PASS (0 matches)
2. Negative gate 2 (이모지): PASS (0 matches)
3. Negative gate 3 (fire 변형): PASS (0 matches)
4. Negative gate 4 (alias 토큰): PASS (0 matches)
5. Negative gate 5 (OLD categorical hex outside tokens.css): PASS (0 matches)
6. Positive gate 6 (NORMALIZED hex 3종 each ≥ 1): PASS (#06b6d4 / #d7428c / #d78042)
7. Positive gate 7 (4-frame matrix): PASS (dark×2, light×2, frame-mobile×2, frame-desktop×2)
8. Positive gate 8 (3 menu card classes + 8+ dropzone/state variants): PASS (.menu-lunch-a/b/.menu-dinner + 9 state variants)
9. Positive gate 9 (NORMALIZED Korean labels): PASS (중식 A코너 / 중식 B코너 / 석식 메뉴 / 식단표 PDF 업로드 / 식단표 PDF 드래그앤드롭 / PDF 파일만 업로드 가능합니다)

## Deviations from Plan

**Two textual edits to rules-box wording to avoid self-tripping negative gates:**

1. **[Rule 3 - Blocking] Rules-box typography section was tripping gate 3 (fire 변형)**
   - **Found during:** First verify gate run
   - **Issue:** The negative-gate documentation line literally contained `--status-fire / text-fire / bg-fire`, which the gate 3 regex matched.
   - **Fix:** Rephrased to "긴급 / 조치-대기 토큰 변형 4종 (foreground / -bar / -bg / utility class) 0건" — same meaning without literal token names.
   - **Files modified:** cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html (1 line in rules box).

2. **[Rule 3 - Blocking] Rules-box typography section was tripping gate 4 (alias)**
   - **Found during:** Second verify gate run
   - **Issue:** The negative-gate documentation line literally contained the full alias list `--bg / --bg2 / --bg3 / --bd / --bd2 / --t1 / --t2 / --t3 / --acl / --c-day/...`, matching gate 4's regex.
   - **Fix:** Rephrased to "v0.0.x alias 토큰 (배경 / 보더 / 텍스트 / accent / duty 단축 이름 — tokens.css line 177~197 의 옛 호환 alias 블록) 0건" — same meaning without literal token names.
   - **Files modified:** cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html (1 line in rules box).

Both deviations are documentation rewording inside the rules box — no visual / structural / token change to the sketch itself. Pattern is the same as planner-skill `feedback_planner_prompt_sketch_verbatim.md` which already warns about self-referential gate trips.

## Decisions Made

- **카테고리 hex 3종 (locked decision A in PLAN):** 중식 A #06b6d4 / 중식 B #d7428c / 석식 #d78042. OLD source hex (#ec4899 / #f97316) 폐기.
- **leading-relaxed 1.625 강제 (UI-SPEC §12 W4):** source 의 lineHeight 1.6 → 1.625 (Tailwind text-body-sm leading-relaxed 수치 정확 일치).
- **카드 클래스로 raw rgba 캡슐화 (locked decision B):** Korean alpha hex 표기 (`rgba(R, G, B, 0.08)`) 는 사전 정의된 `.menu-lunch-a/b/.menu-dinner` 클래스 안에만 위치 — inline 사용 0건.
- **dropzone-wrap padding 분리:** source 의 `padding: '14px 12px'` (모바일) + 데스크톱 추정 `padding: '16px 24px'` 을 별도 wrapper 클래스로 분리 — dropzone 자체 padding 은 12px 0 (모바일) / 48px 0 (데스크톱) 만 담당.

## Output

- **Sketch file:** `/Users/jykevin/Documents/20260328/.claude/worktrees/agent-ae5c03bca79f07970/cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html` (856 lines, static HTML5, Pretendard CDN, no JS).
- **Browser preview:** 4 frame side-by-side (VP1 모바일 다크 / VP2 모바일 라이트 / VP3 데스크톱 다크 / VP4 데스크톱 라이트) + state-strip mini-grid (다크 9 cell + 라이트 9 cell) + rules box (7 section).

## Self-Check: PASSED

- File exists: `cha-bio-safety/docs/redesign-context/12-staff-service/sketch/04-menu-cards-sketch.html` — FOUND.
- All 9 verify gates: PASS (full chained run above).
- src/ untouched: confirmed (`git status --short` 만 sketch 1 파일 변경).
- ROADMAP / STATE 미터치 (quick task — orchestrator 책임).
