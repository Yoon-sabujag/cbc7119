---
quick_id: 260505-c9d
slug: stairwell-photo-fix
status: complete
date: 2026-05-04
commit: d5fbf55
---

# 260505-c9d — 특별피난계단 점검 사진 분배 버그 수정

## What changed

`cha-bio-safety/src/pages/InspectionPage.tsx` `StairwellModal.handleSave` 의 photoKey 분배 로직 변경.

기존:
- 한 번 업로드한 photoKey 를 swCPs 루프 안에서 모든 층 CP 의 onSave 에 동일하게 attach
- 결과: DB 상 층마다 별도 record 가 있지만 photoKey 가 동일해 데스크톱 점검 상세에서 전층이 같은 사진을 표시

변경:
- photoKey 가 있을 때만 대표 CP 1개를 선정해 그 CP 의 onSave 에만 attach
- 대표 CP 우선순위: caution/bad 결과가 있는 층 → 그 중 첫 번째 → 없으면 swCPs[0]
- 나머지 CP 는 photoKey 미부여 (undefined)

memo 는 종전대로 모든 CP 에 동일 부여 (현재 동작 유지).

## Verification

- TypeScript noEmit 체크 통과 (`npx tsc --noEmit` exit 0)
- 변경 범위 11라인 추가 / 1라인 수정, handleSave 내부로 한정
- 기존 photoKey 미업로드 케이스(전층 normal + 사진 없음) 동작 동일 — photoKey === '' 일 때 photoTargetCp = null 로 fallback

## Out of scope (follow-up 후보)

같은 batch-save 패턴이 photoKey 를 모든 CP 에 attach 하는 다른 모달:
- ParkingGateModal
- PowerPanelModal
- DamperModal
- CctvModal

확인 필요. 필요 시 별도 quick.

## Commit

`d5fbf55` — fix(inspection): 특별피난계단 사진이 전층 record에 중복 저장되는 버그 수정
