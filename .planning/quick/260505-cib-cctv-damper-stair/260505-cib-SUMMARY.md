---
quick_id: 260505-cib
slug: cctv-damper-stair
status: complete
date: 2026-05-05
commit: 509b62a
parent: 260505-c9d
---

# 260505-cib — CCTV / Damper stair 모달 photoKey 분배 버그 수정

## What changed

`cha-bio-safety/src/pages/InspectionPage.tsx` 에서 `260505-c9d` 와 동일한 batch-save 패턴 2곳에 동일 정책 적용.

### 1) CctvModal.handleSave (line 451 부근)

DVR 13대를 방재센터 한 자리에서 일괄 점검 → 사진 1장이 의도한 시맨틱.
- 기존: photoKey 가 모든 cctvCPs (13개) record 에 박혀 상세 전 DVR 이 같은 사진 표시
- 변경: caution/bad 결과가 있는 첫 cp → 없으면 cctvCPs[0] 1건에만 photoKey attach

### 2) DamperModal.handleStairSave (line 2469 부근)

전실제연댐퍼 stair 모드 (계단전실 한 동의 층별 댐퍼 일괄 점검).
- 기존: photoKey 가 stairCPs 모든 층 record 에 박힘
- 변경: 동일 정책 (caution/bad 우선 → stairCPs[0] fallback)

`handleSingleSave` (연결송수관/장비 단일 저장) 는 손대지 않음 — 단일 cpId 라 영향 없음.

## Verification

- TypeScript noEmit 체크 통과 (`npx tsc --noEmit` exit 0)
- 변경 22+/2- 라인, 두 함수 내부로만 한정
- photoKey 미업로드 케이스(전 cp normal + 사진 없음) 동작 동일

## Coverage

`grep "for (const cp of" src/`로 코드베이스 전체 sweep.
batch-save 패턴 총 3곳:

| 위치 | 상태 |
|---|---|
| StairwellModal.handleSave | FIXED at 260505-c9d (d5fbf55) |
| CctvModal.handleSave | FIXED at this task (509b62a) |
| DamperModal.handleStairSave | FIXED at this task (509b62a) |

다른 모달 (PowerPanel/ParkingGate/InspectionModal/Damper handleSingleSave) 은 단일 cpId 저장이라 영향 없음. ExcelPreview/ReportsPage 의 `for (const cp of ...)` 는 read-only 순회.

## Out of scope

기존 DB 에 박힌 중복 photoKey record 는 그대로 둠 (점검 기록 삭제 불가 원칙 + 표시 영향만 있음).

## Commit

`509b62a` — fix(inspection): CCTV / Damper stair 모달도 photoKey 1건 대표 부여로 정정
