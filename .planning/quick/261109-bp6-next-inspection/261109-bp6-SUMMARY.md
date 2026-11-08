# Quick Task 261109-bp6 Summary: 승강기 다음검사일 2소스 계산

승강기 목록 "검사 초과" 오표시 버그(화물용 2대 EV-09·EV-10, 덤웨이터 EV-11)를
`functions/api/elevators/next-inspection.ts` 단일 파일 수정으로 고쳤다.
공단 공식 검사이력(`elevator_inspect_history`)을 1순위, 자체점검 로그
(`elevator_inspections`)를 폴백으로 강등하는 2소스 계산 구조로 전환.

## 변경 파일

- `cha-bio-safety/functions/api/elevators/next-inspection.ts` (수정, 유일한 변경 파일)

## 변경 내용

1. `ElevatorRow`에 `cert_no` / `cert_key`(정규화 키) 추가, `HistoryRow` 타입 신설.
2. 1차 쿼리 SELECT에 `e.cert_no`, `REPLACE(e.cert_no, '-', '') AS cert_key` 추가.
   기존 JOIN/GROUP BY/ORDER BY는 1바이트도 변경하지 않음.
3. `elevator_inspect_history`에서 `elevator_no`/`inspect_date`/`valid_end`를
   `ORDER BY elevator_no, inspect_date DESC`로 조회 후, first-seen 패턴으로
   호기별 최신 1건만 담는 `officialMap` 구성.
4. `.map()` 분기 재구성:
   - `cycleMonths`는 두 경로 모두에서 항상 `getCycleMonths()`로 채움.
   - `cert_key`로 `officialMap` 조회 → `valid_end`가 truthy이고
     `parseISO` 결과가 `Number.isNaN(...)` false(유효 Date)일 때만 공단 경로 채택.
   - 공단 경로: `lastDate = official.inspect_date`, `nextDate = valid_end` 파싱값.
   - 폴백 경로: `lastDate = r.last_date`, `nextDate = addMonths(parseISO(lastDate), cycleMonths)`.
   - 두 소스 모두 없으면 기존 그대로 `status='no_record'` 조기 return.
5. status 판정(`differenceInDays` → `overdue`/`due_soon`/`ok`)은 파일 전체에서
   단 하나의 블록으로만 존재 — 공단 경로와 폴백 경로는 `lastDate`/`nextDate` 두
   변수만 다르게 채우고 이 공통 블록으로 합류.
6. `getCycleMonths()` 본문·JSDoc, `today` 계산, import 3함수, catch 블록 에러
   메시지, 응답 camelCase 필드 9종(이름·순서·타입) 전부 불변. 디버그 필드
   (`source` 등) 추가 없음.

## 검증 결과

- `npx tsc --noEmit` (cha-bio-safety/에서 실행): 에러 0건, 통과.
- `grep` 기반 쿼리/가드/shape 자동 검증 5종 전부 통과
  (QUERY-OK / SINGLE-STATUS-PATH / GUARDS-OK / SHAPE-PRESERVED / FILESET-CLEAN).
- `.wrangler/` / `dist/` 최근 2시간 내 생성·변경 파일 없음 (NO-DEPLOY-ARTIFACTS).
- **wrangler d1 execute 미실행 / pages deploy 미실행**

## 커밋

- 해시: `adf30340`
- 메시지: `fix(elevators): prioritize official inspect history over self-check log for next-inspection` (ASCII 전용)
- `git show --stat HEAD` 확인 결과 변경 파일 1개(`cha-bio-safety/functions/api/elevators/next-inspection.ts`)만 포함.
- auto-push 훅에 의해 `origin/production`까지 이미 푸시됨
  (`.github/workflows/deploy.yml`은 `main` 전용이라 자동 배포는 발생하지 않음).

## Deviations from Plan

None - plan executed exactly as written.

## 미결 사항 (메인 세션 몫)

**90일 경계 영향 미검증 — 메인 세션 D1 대조 필요**

실측 공단 `valid_end`는 `inspect_date + cycleMonths`보다 9~24일 당겨지는 경향이 있어,
승객용·에스컬레이터 14대 중 자체점검 기준 nextDate가 90일 경계 근처인 호기가 있다면
공단 경로 채택 시 `ok` → `due_soon`으로 뒤집힐 가능성이 있다. executor는 D1 실행이
금지되어 이를 직접 대조할 수 없다. 배포 전 메인 세션에서 14대에 대해 공단 `valid_end`와
기존 계산값을 read-only SELECT로 나란히 뽑아 90일 경계 통과 여부를 확인할 것
(PLAN.md `<handoff_notes>` 1번 참조).

## Self-Check: PASSED

- FOUND: `cha-bio-safety/functions/api/elevators/next-inspection.ts`
- FOUND: commit `adf30340` (git log --oneline -1 확인)
