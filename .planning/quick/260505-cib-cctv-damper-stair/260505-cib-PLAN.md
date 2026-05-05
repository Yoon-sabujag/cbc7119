---
quick_id: 260505-cib
slug: cctv-damper-stair
description: CCTV/Damper stair 모달도 photoKey 전 cp 중복 저장 패턴 — StairwellModal 와 동일 정책 적용
date: 2026-05-05
status: planned
parent: 260505-c9d
must_haves:
  truths:
    - CctvModal.handleSave 와 DamperModal.handleStairSave 가 StairwellModal 와 동일 batch-save 패턴을 가진다
    - 동일 photoKey 가 모든 CP record 에 박혀 데스크톱 상세에서 전 record 같은 사진 표시
  artifacts:
    - cha-bio-safety/src/pages/InspectionPage.tsx (CctvModal.handleSave, DamperModal.handleStairSave)
  key_links:
    - cha-bio-safety/src/pages/InspectionPage.tsx:451-465 (CctvModal.handleSave)
    - cha-bio-safety/src/pages/InspectionPage.tsx:2469-2483 (DamperModal.handleStairSave)
---

# 260505-cib — CCTV / Damper stair 모달 photoKey 분배 버그 수정

## Background

`260505-c9d` 에서 StairwellModal 의 photoKey 가 모든 층 CP 에 동일하게 attach 되어 데스크톱 점검 상세에서 사진이 전층 중복 표시되던 버그를 수정. 코드베이스 sweep 결과 같은 batch-save 패턴이 2군데 더 발견됨:

1. `CctvModal.handleSave` (line 451-465) — DVR 13대 모두 동일 photoKey
2. `DamperModal.handleStairSave` (line 2469-2483) — 전실제연댐퍼 계단전실 stair 모드, 모든 층 CP 동일 photoKey

다른 batch-save 위치는 `grep "for (const cp of"` sweep 결과 없음 (PowerPanelModal/ParkingGateModal/InspectionModal/DamperModal handleSingleSave 는 단일 cpId 저장).

## Decision

StairwellModal 에 적용한 동일 정책 그대로:
- photoKey 가 있을 때만 1개 대표 CP 선정
- 우선순위: caution/bad 결과가 있는 첫 CP → 없으면 [0]번 CP
- 나머지 CP 는 photoKey: undefined

CCTV 의 경우 DVR 13대를 방재센터 한 자리에서 일괄 점검하니 사진 1장이 의도한 시맨틱이라 동일 정책이 자연스러움.
Damper stair 도 한 동의 계단전실 댐퍼를 층별로 일괄 점검하므로 StairwellModal 와 동일.

## Tasks

### Task 1 — CctvModal.handleSave photoKey 분배

**files:** cha-bio-safety/src/pages/InspectionPage.tsx (~line 451-465)
**action:** photoKey 가 있을 때 caution/bad 우선 → cctvCPs[0] fallback 으로 1개 대표 CP 에만 attach
**verify:** tsc --noEmit 통과, handleSave 외 타 영역 영향 없음
**done:** 한 번의 점검 저장 시 photoKey 가 정확히 1개 record 에만 박힘

### Task 2 — DamperModal.handleStairSave photoKey 분배

**files:** cha-bio-safety/src/pages/InspectionPage.tsx (~line 2469-2483)
**action:** Task 1 과 동일 정책. stairCPs 대상.
**verify:** tsc --noEmit 통과, handleSingleSave 동작 무영향
**done:** stair 모드 저장 시 photoKey 가 정확히 1개 record 에만 박힘

## Out of Scope

기존 DB 에 이미 박힌 중복 photoKey record 의 마이그레이션은 하지 않음 (점검 기록 삭제 불가 원칙 + 표시 영향만 있고 데이터 무결성 영향 없음).
