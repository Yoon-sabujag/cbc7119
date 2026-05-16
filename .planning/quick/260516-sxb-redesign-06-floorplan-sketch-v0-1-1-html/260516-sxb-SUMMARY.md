---
phase: quick-260516-sxb
plan: 01
subsystem: redesign/06-floorplan
tags: [sketch, html, floorplan, marker-catalog, modals, v0.1.1]
dependency_graph:
  requires: [04-remediation-sketch, 03-qr-scan-sketch]
  provides: [06-floorplan-sketch-task1, 06-floorplan-sketch-task2]
  affects: []
tech_stack:
  added: []
  patterns: [viewport-frame, data-theme, fp- prefix CSS, verbatim-SVG-markers, modal-overlay-pattern]
key_files:
  created:
    - cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html
    - cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html
  modified: []
decisions:
  - "resolved 색 = --accent (옛 코드 #3b82f6 verbatim 매핑). info-bar 변경은 사용자 컨펌 필요 — NOTE 주석 인라인 추가."
  - "VP4 = 소화기 plan 활성으로 REPLACE_WARNING 3단계 외곽 stroke 시각화 전시."
  - "마커 카탈로그는 data-theme=dark 단일 wrapper — 라이트 분기는 VP3 모바일에서 확인."
  - "마커 추가 옵션 버튼: is-active 상태는 accent bg + border (accent 계열, gradient 없음)."
  - "소화전 VP1 paired BC 분기: modal 안 nested 카드 패턴 (fp-paired-card). 비상콘센트 결과 3택 + textarea+photo 세트 포함."
metrics:
  duration: "~40min total (Task1 ~25min + Task2 ~15min)"
  completed: "2026-05-16"
  tasks_completed: 2
  files_created: 2
---

# Quick 260516-sxb Plan 01: 06-floorplan Sketch HTML (Task 1 + Task 2) Summary

Task 1 + Task 2 완료: 2 파일 분할 — 메인 화면+마커 카탈로그 (Task 1) + 모달 5종+팝업 2종 (Task 2).

## What Was Built

**floorplan-sketch.html** (1,667줄) — 06 FloorPlanPage 재디자인 시안 파일 1.

### Viewports

| VP | 설명 | 특이사항 |
|----|------|---------|
| VP1 | 모바일 / 다크 / 유도등 plan 메인 | 마커 8개 분포 (wall_exit·ceiling_exit·room_corridor·stair·hallway·seat·fire_ext·미배치) |
| VP2 | 모바일 / 다크 / 바텀시트 선택 | indoor_hydrant 불량+미조치 배지 페어, 점검 기록 입력+조치 CTA |
| VP3 | 모바일 / 라이트 / 편집모드 | 편집 인포 배너 + 마커 5개 |
| VP4 | 데스크톱 / 다크 / 소화기 plan | 말풍선 (wall_exit 정상), REPLACE_WARNING 3단계 범례 포함 |

### Marker Catalog

| 블록 | 마커 수 | 비고 |
|------|---------|------|
| 유도등 (Guidelamp) | 6 | ceiling/wall/room/hallway/stair/seat |
| 감지기 (Detector) | 2 | smoke/heat |
| 스프링클러 (Sprinkler) | 4 | closed/open/king/test_valve |
| 소화기·소화전 (Extinguisher) | 7 + RW 3단계 | fire_ext/powder20/halogen/kitchen_k/hydrant/lifeline/div + REPLACE_WARNING warn/imminent/danger rows |

총 114 셀 + REPLACE_WARNING 12 추가 행.

### Design Rule 검증 결과

| 규칙 | 결과 |
|------|------|
| 12px 미만 폰트 | PASS (0건) |
| linear-gradient | PASS (0건, repeating-linear-gradient 격자 제외) |
| 구 alias 토큰 (--t1/--bg2 등) | PASS (0건) |
| 인라인 hex fill (마커 색) | PASS (0건, #fff 내부선 허용) |
| 04 인프라 verbatim mirror | PASS |
| 결과 배지 danger/warn 페어 | PASS |
| 상태 배지 fire/safe 페어 | PASS |

---

## Task 2: floorplan-modals-sketch.html — 모달 5종 + 팝업 2종

**floorplan-modals-sketch.html** (1,487줄) — 06 FloorPlanPage 재디자인 시안 파일 2.

### Viewports (Task 2)

| VP | 설명 | 특이사항 |
|----|------|---------|
| VP1 | 모바일 다크 / 점검 기록 입력 / 소화전+paired BC | fp-paired-card 내 비상콘센트 결과3택+textarea+photo 포함 |
| VP2 | 모바일 다크 / 점검 기록 입력 / 유도등+증상피커+불량 | 증상 피커 3 variant (점등이상/예비전원이상/직접입력), 결과배지 미리보기 |
| VP3 | 모바일 다크 / 자산 정보+점검 / 소화기 ext_powder20 | KV 8행×2col + admin 자산 액션 (정보수정/소화기분리 danger outline) |
| VP4 | 모바일 다크 / 마커 추가 / extinguisher 4옵션 | 소화기 빈개소/소화전/완강기/DIV 2×2 grid, 개소명+구역 3택 |
| VP5 | 모바일 다크 / 마커 추가 / guidelamp 6옵션 | 3col 그리드, 구역 3택+마커라벨 input |
| VP6 | 모바일 다크 / confirm 3종 세로 나열 | 미배치info / 배치fire / 분리danger — 색 페어 정합 |
| VP7 | 모바일 다크 / InspectionRevisitPopup 2 variant | completed=safe / pending-action=fire, 결과배지 포함 |
| VP8 | 모바일 다크 / AccessBlockedPopup | 290px height, shield-alert icon, danger 색 |
| VP9 | 모바일 라이트 / VP1 라이트 분기 | 주의 활성, 라이트 토큰 자동 분기 |
| VP10 | 데스크톱 다크 / 점검 기록 입력 오버레이 | 도면 배경(헤더+탭+층칩+캔버스) 위 모달 가운데 노출 |

### Design Rule 검증 결과 (Task 2)

| 규칙 | 결과 |
|------|------|
| 12px 미만 폰트 | PASS (0건, 11px ID 수정 완료) |
| linear-gradient (non-repeating) | PASS (0건) |
| 구 alias 토큰 (--t1/--bg2 등) | PASS (0건) |
| 인라인 hex fill (마커 색) | PASS (0건, #fff 내부선 허용) |
| 04+05 인프라 verbatim mirror | PASS |
| 결과 배지 danger/warn 페어 | PASS |
| 상태 배지 fire/safe 페어 | PASS |
| CTA 단색 (gradient 없음) | PASS |
| leading-none 작은 컨테이너 | PASS |

---

## Commits

| Hash | Description |
|------|-------------|
| c6a2c34 | feat(260516-sxb): 06-floorplan sketch Task 1 — floorplan-sketch.html |
| 1c645c8 | feat(260516-sxb): 06-floorplan sketch Task 2 — floorplan-modals-sketch.html |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] 11px font-size in KV ID field**
- **Found during:** Task 2 design rule check
- **Issue:** `fp-kv-value text-mono style="font-size: 11px;"` — violated 12px minimum rule
- **Fix:** Changed to `font-size: 12px;`
- **Files modified:** floorplan-modals-sketch.html
- **Commit:** 1c645c8 (fixed inline before commit)

## Known Stubs

None — sketch HTML은 정적 시안이며 실 데이터 연결 불필요.

## Next Steps

사용자 시각 검수 후:
- floorplan-sketch.html (VP1~VP4 + Marker Catalog) 컨펌
- floorplan-modals-sketch.html (VP1~VP10) 컨펌
- 컨펌 완료 후 redesign/06-floorplan 브랜치 변환 wave 진행:
  - Wave 1: 메인 페이지 헤더+탭+층+캔버스+범례 TSX
  - Wave 2: 마커 시스템 (MarkerIcon SVG + 상태 토큰 매핑) TSX
  - Wave 3: 바텀시트/말풍선 + 점검 기록 입력 모달 TSX
  - Wave 4: 마커 추가/수정 모달 + confirm/popup 3종 TSX

## Self-Check: PASSED

- [x] `cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html` 존재
- [x] commit c6a2c34 존재
- [x] VP1~VP4 all rendered (Task 1)
- [x] Marker Catalog 4 blocks complete (Task 1)
- [x] `cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-modals-sketch.html` 존재
- [x] commit 1c645c8 존재
- [x] VP1~VP10 all rendered (Task 2)
- [x] 모달 5종 + 팝업 2종 + 접근불가 시각화 (Task 2)
- [x] All design rules pass (both files)
