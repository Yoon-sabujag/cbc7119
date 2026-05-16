---
phase: quick-260516-sxb
plan: 01
subsystem: redesign/06-floorplan
tags: [sketch, html, floorplan, marker-catalog, v0.1.1]
dependency_graph:
  requires: [04-remediation-sketch, 03-qr-scan-sketch]
  provides: [06-floorplan-sketch-task1]
  affects: []
tech_stack:
  added: []
  patterns: [viewport-frame, data-theme, fp- prefix CSS, verbatim-SVG-markers]
key_files:
  created:
    - cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html
  modified: []
decisions:
  - "resolved 색 = --accent (옛 코드 #3b82f6 verbatim 매핑). info-bar 변경은 사용자 컨펌 필요 — NOTE 주석 인라인 추가."
  - "VP4 = 소화기 plan 활성으로 REPLACE_WARNING 3단계 외곽 stroke 시각화 전시."
  - "마커 카탈로그는 data-theme=dark 단일 wrapper — 라이트 분기는 VP3 모바일에서 확인."
metrics:
  duration: "~25min"
  completed: "2026-05-16"
  tasks_completed: 1
  files_created: 1
---

# Quick 260516-sxb Plan 01: 06-floorplan-sketch.html (Task 1) Summary

Task 1 완료: VP1~VP4 메인 화면 4개 viewport + Marker Catalog 4블록 × 19 마커 × 6 상태 = 114 셀 시각화.

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

## Commits

| Hash | Description |
|------|-------------|
| c6a2c34 | feat(260516-sxb): 06-floorplan sketch Task 1 — floorplan-sketch.html |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — sketch HTML은 정적 시안이며 실 데이터 연결 불필요.

## Self-Check: PASSED

- [x] `cha-bio-safety/docs/redesign-context/06-floorplan/sketch/floorplan-sketch.html` 존재
- [x] commit c6a2c34 존재
- [x] VP1~VP4 all rendered
- [x] Marker Catalog 4 blocks complete
- [x] All design rules pass
