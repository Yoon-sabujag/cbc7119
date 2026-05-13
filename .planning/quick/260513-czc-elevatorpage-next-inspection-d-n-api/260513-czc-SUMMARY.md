---
quick_id: 260513-czc
slug: elevatorpage-next-inspection-d-n-api
status: complete
date: 2026-05-13
commit: c377e4b
---

# 260513-czc — ElevatorPage next-inspection 기능 제거

## What changed

사용자가 의도하지 않았던 next-inspection 기능 통째 정리.

**삭제:**
- `cha-bio-safety/functions/api/elevators/next-inspection.ts` (90줄, 통째 삭제)

**편집:**
- `cha-bio-safety/src/pages/ElevatorPage.tsx` — nextInspQuery + nextInspMap useMemo + 호기 카드 안 `const ni = nextInspMap.get(ev.id)` + D-N/검사 초과/기록 없음 3개 배지 렌더링 블록 + import 정리 (총 26줄 제거)
- `cha-bio-safety/src/utils/api.ts` — `elevatorInspectionApi.getNextInspection` 메서드 제거
- `cha-bio-safety/src/types/index.ts` — `ElevatorNextInspection` 인터페이스 통째 + `Elevator.nextInspection?: string` 죽은 타입 필드 제거

**합계:** 4 파일, +2 / -131 (net -129)

## Verify

- `npx tsc --noEmit` exit 0
- `grep -rn "next-inspection\|nextInspMap\|nextInspQuery\|ElevatorNextInspection" cha-bio-safety/src/ cha-bio-safety/functions/` → 0 hits
- 빌드 성공
- 프로덕션 배포: https://f0b5e7dd.cbc7119.pages.dev — /elevator list 탭 호기 카드 우측에 정상/고장/점검중/운행중지 배지만 보이고 D-N / 검사 초과 / 기록 없음 표시 없음

## Out of scope

- DB 컬럼 `elevators.next_inspection` (migration 0001 line 90) — 한 번도 read/write 안 된 죽은 컬럼이라 그대로 둠. drop 마이그레이션은 데이터 손실 0이지만 마이그레이션 작업 비용 vs 효용을 보면 그대로 두는 게 합리적. 향후 elevators 테이블 재정의 시 정리.
- `Elevator.lastInspection?: string` 타입 필드 — 사용처 별도 검토 필요. 이번 범위 X.

## Commit

`c377e4b` — `feat(elevator): remove unintended next-inspection feature`
