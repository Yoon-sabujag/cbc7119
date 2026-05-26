---
phase: 260526-o3f
plan: 01
subsystem: docs
tags: [redesign, 26-staff-manage, tsx-checklist, markdown-only]
dependency_graph:
  requires: [wave-1-index.md, sketch-wave-2-frame-guard-header.html, sketch-wave-3-staff-list.html, sketch-wave-4-modal-form-confirm.html]
  provides: [wave-5-tsx-conversion-checklist.md]
  affects: [StaffManagePage.tsx TSX 변환 wave executor]
tech_stack:
  added: []
  patterns: [12-section-checklist, biz-anchor-table, sketch-grep-verbatim-fence, oq-locked-6]
key_files:
  created:
    - cha-bio-safety/docs/redesign-context/26-staff-manage/wave-5-tsx-conversion-checklist.md
  modified: []
decisions:
  - "3 sketch HTML grep 결과 verbatim 박제 (feedback_planner_prompt_sketch_verbatim 강제)"
  - "§4 비즈 anchor 26 row — wave-1-index §1.3 전체 인용 (project_redesign_15_daily_report_status 패턴)"
  - "OQ LOCKED 6건 verbatim (wave-1-index §7 박제)"
  - "i4b deviation: bg-accent 실측 키명 / bg-accent-primary 추측 금지 (feedback_tailwind_token_class_pattern)"
metrics:
  duration: "~15 min"
  completed: "2026-05-26"
  tasks_completed: 1
  files_created: 1
---

# Phase 260526-o3f Plan 01: 26-staff-manage W5 TSX 변환 checklist 작성 Summary

12 섹션 + 비즈 anchor 26 row + 3 sketch grep verbatim fence + OQ LOCKED 6건 포함 TSX 변환 체크리스트 단일 atomic 생성 (660 lines, StaffManagePage.tsx 530 lines 기반).

## Tasks Completed

| # | Task | Commit | Files |
|---|---|---|---|
| 1 | wave-5-tsx-conversion-checklist.md 작성 (단일 atomic) | 98964bd | cha-bio-safety/docs/redesign-context/26-staff-manage/wave-5-tsx-conversion-checklist.md |

## Verify Gate Results

| gate | 결과 | 기대값 |
|---|---|---|
| §1~§12 헤더 count | 12 | = 12 PASS |
| OQ LOCKED 6건 | 6 | = 6 PASS |
| backtick fence (3 sketch) | 16 | >= 6 PASS |
| memory slug unique | 15 | >= 10 PASS |
| negative gate rows | 31 | >= 17 PASS |
| line range citations | 61 | >= 15 PASS |
| staffApi 4종 | 16 | >= 4 PASS |
| bg-accent count | 6 | >= 2 PASS |
| src/** 변경 | 0 | = 0 PASS |
| status- prefix 0 박제 | 2 | >= 1 PASS |
| w-8 h-8 박제 | 3 | >= 1 PASS |
| ReplaceModal instances | 27 | >= 3 PASS |
| __openReplaceModal | 7 | >= 2 PASS |
| rankOfTitle | 6 | >= 2 PASS |
| shiftOffset/shiftFixed | 16 | >= 4 PASS |
| BottomSheet/DesktopModal | 16 | >= 4 PASS |
| 사번 10자리 정규식 | 5 | >= 2 PASS |
| staff-list | 12 | >= 3 PASS |

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- [x] `cha-bio-safety/docs/redesign-context/26-staff-manage/wave-5-tsx-conversion-checklist.md` 존재 (660 lines)
- [x] commit 98964bd 존재
- [x] src/** 변경 0 byte
- [x] 12 섹션 헤더 완비
- [x] 3 sketch grep 결과 verbatim (실제 실행 결과 박제, 추측 0)
- [x] OQ LOCKED 6건 verbatim
- [x] 비즈 anchor 26 row (≥10 요구 충족)
- [x] negative gate 31건 (≥17 요구 충족)
- [x] verify gate 26건 (≥22 요구 충족)
- [x] memory slug 15 unique (≥10 요구 충족)
