---
quick_id: 260513-czc
slug: elevatorpage-next-inspection-d-n-api
description: ElevatorPage 의 의도하지 않았던 next-inspection 기능 (D-N/검사 초과/기록 없음 배지 + 백엔드 API + 타입) 통째 제거. DB 컬럼은 죽은 코드라 그대로 둠.
date: 2026-05-13
status: planned
must_haves:
  truths:
    - elevators.next_inspection 컬럼은 migration 0001 에 선언만 됐고 read/write 0번 (코드 grep 결과 다른 참조 없음)
    - /api/elevators/next-inspection 핸들러는 elevator_inspections 테이블을 조인해 계산. elevators.next_inspection 컬럼은 사용 안 함
    - 사용자가 의도한 적 없는 기능 → 통째 제거
  artifacts:
    - cha-bio-safety/functions/api/elevators/next-inspection.ts (DELETE)
    - cha-bio-safety/src/pages/ElevatorPage.tsx (편집 — useQuery + nextInspMap + 3개 배지 블록 제거)
    - cha-bio-safety/src/utils/api.ts (편집 — getNextInspection 제거)
    - cha-bio-safety/src/types/index.ts (편집 — ElevatorNextInspection 인터페이스 + Elevator.nextInspection? 필드 제거)
  key_links:
    - cha-bio-safety/src/pages/ElevatorPage.tsx:415-424 (nextInspQuery + nextInspMap)
    - cha-bio-safety/src/pages/ElevatorPage.tsx:1051 (const ni = nextInspMap.get)
    - cha-bio-safety/src/pages/ElevatorPage.tsx:1075-1089 (D-N/검사 초과/기록 없음 3 배지)
    - cha-bio-safety/src/utils/api.ts:384-385 (getNextInspection)
    - cha-bio-safety/src/types/index.ts:22 (Elevator.nextInspection 죽은 필드)
    - cha-bio-safety/src/types/index.ts: ElevatorNextInspection 인터페이스
---

# 260513-czc — ElevatorPage next-inspection 기능 제거

## Background

ElevatorPage 호기 카드 우측에 자동으로 표시되던 `D-N` (다음 점검 임박) / `검사 초과` / `기록 없음` 배지 — 사용자가 의도하지 않았던 기능. 함께 백엔드 API 핸들러 + React Query + 타입 인터페이스 통째 제거.

코드 surface 조사 결과 (`grep -rn "next-inspection\|nextInspMap\|next_inspection" cha-bio-safety/src/ cha-bio-safety/functions/ cha-bio-safety/migrations/`):
- Frontend 4곳 (types/api/page에서 사용)
- Backend 1 파일 (next-inspection.ts)
- Migration 1줄 (elevators.next_inspection 컬럼 선언만, 읽기/쓰기 0번)

## Scope

### 제거 (운영 코드)

1. **`functions/api/elevators/next-inspection.ts`** — 파일 통째 삭제 (`git rm`)
2. **`src/pages/ElevatorPage.tsx`**
   - line 415-424: `nextInspQuery` useQuery + `nextInspMap` useMemo 제거
   - line 1051: `const ni = nextInspMap.get(ev.id)` 제거
   - line 1075-1089: D-N / 검사 초과 / 기록 없음 3개 `<span>` 렌더링 블록 제거
3. **`src/utils/api.ts`** — `elevatorInspectionApi.getNextInspection` 메서드 제거 + `ElevatorNextInspection` import 제거
4. **`src/types/index.ts`**
   - `ElevatorNextInspection` 인터페이스 통째 제거
   - `Elevator` 인터페이스의 `nextInspection?: string` 필드 제거 (사용처 0)

### 그대로 두는 것 (out of scope)

- **DB 컬럼 `elevators.next_inspection`** (migration 0001 line 90) — 한 번도 read/write 안 된 죽은 컬럼. 데이터 손실 0. 마이그레이션 추가 비용보다 그냥 두는 게 안전. 향후 elevators 테이블 재정의 시 같이 정리.
- **`Elevator.lastInspection?: string`** — 같은 줄에 있지만 사용처가 다를 수 있어서 이번 범위 X (확인 후 별도 검토)

## Tasks

### Task 1 — types/index.ts 정정

`src/types/index.ts`:
- `ElevatorNextInspection` 인터페이스 (관련 행 전체) 제거
- `Elevator` 인터페이스의 `nextInspection?: string` 필드만 제거 (`lastInspection?` 는 유지 — 별도 검토)

### Task 2 — utils/api.ts 정정

`src/utils/api.ts`:
- `elevatorInspectionApi` 안 `getNextInspection: () => api.get<...ElevatorNextInspection[]>(...)` 메서드 제거
- 같은 파일에서 `ElevatorNextInspection` import / 참조가 더 있으면 같이 정리

### Task 3 — ElevatorPage.tsx 정정

`src/pages/ElevatorPage.tsx`:
- `ElevatorNextInspection` import 제거 (있을 시)
- `nextInspQuery` + `nextInspMap` useQuery/useMemo 블록 제거 (line 415-424)
- 호기 카드 안에서 `const ni = nextInspMap.get(ev.id)` 라인 제거 (line 1051)
- `{ni && ni.status === 'due_soon' ...}` 블록 (D-N 배지) 제거
- `{ni && ni.status === 'overdue' ...}` 블록 (검사 초과 배지) 제거
- `{ni && ni.status === 'no_record' ...}` 블록 (기록 없음 배지) 제거

### Task 4 — 파일 삭제

`git rm cha-bio-safety/functions/api/elevators/next-inspection.ts`

### Task 5 — 빌드 + 배포

```bash
cd cha-bio-safety
npx tsc --noEmit  # 타입 통과 확인
npm run build
npx wrangler pages deploy dist --branch production --commit-message "remove next-inspection feature from ElevatorPage"
```

## Verify

- `npx tsc --noEmit` exit 0
- `grep -rn "next-inspection\|nextInspMap\|nextInspQuery\|ElevatorNextInspection" cha-bio-safety/src/ cha-bio-safety/functions/` → **0 hits**
- 빌드 성공
- 배포 후 /elevator list 탭에서 호기 카드 우측에 D-N / 검사 초과 / 기록 없음 배지 표시 안 됨
- 정상/고장/점검중/운행중지 상태 배지는 그대로 유지

## Out of scope

- DB 마이그레이션으로 elevators.next_inspection 컬럼 drop — 데이터 손실 0이지만 마이그레이션 작업 부담. 향후 통합 정리.
- Elevator.lastInspection 필드 — 사용처 별도 검토 필요. 이번 범위 X.
- ElevatorPage 의 next-inspection 외 다른 미사용 기능 — 별도 sweep.
