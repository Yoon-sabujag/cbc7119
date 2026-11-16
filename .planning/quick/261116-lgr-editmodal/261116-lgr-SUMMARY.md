---
phase: quick-261116-lgr-editmodal
plan: 01
subsystem: schedule
tags: [schedule, night-inspection, edit-modal, d1]
requires: []
provides: [HANDOFF-1, HANDOFF-2, HANDOFF-3]
affects: [SchedulePage.tsx EditModal, scheduleApi.update, onRequestPut]
tech-stack:
  added: []
  patterns:
    - "조건부 SET 절 조립 (COALESCE + 명시적 null 컬럼 구분)"
    - "payload 스프레드 조건부 키 제외 (date 키 자체를 빼서 미변경 보장)"
key-files:
  created: []
  modified:
    - cha-bio-safety/functions/api/schedule/[id].ts
    - cha-bio-safety/src/utils/api.ts
    - cha-bio-safety/src/pages/SchedulePage.tsx
decisions:
  - "night_date 를 지울 때 COALESCE 패턴은 불가(null 을 '유지'로 해석) — 'night_date' in body 조건부 SET 절로 전환"
  - "기간 일정 EditModal 날짜 필드 기본값을 시작일에서 오늘로 변경 — 시작일 보호를 위해 payload 에서 date 키 자체를 제외"
metrics:
  duration: "~15분"
  completed: "2026-11-16"
---

# Phase quick-261116-lgr-editmodal Plan 01: EditModal 야간 점검일 체크박스 Summary

이미 등록된 기간 일정(소방 상/하반기 점검)을 EditModal 에서 열어 야간 점검일을 나중에 지정/해제할 수 있게 했다. 핵심은 payload 안전장치 2가지: 기간일정이면 `date` 키 자체를 제외해 시작일을 보호하고, 체크 해제 시 `night_date: null` 을 명시 전송해 백엔드 COALESCE 함정을 피한다.

## 수행한 작업

### Task 1 — 백엔드 onRequestPut 조건부 SET 절 + scheduleApi.update 타입 확장
- `cha-bio-safety/functions/api/schedule/[id].ts` 의 `onRequestPut` 을 COALESCE 고정 쿼리에서 `setClauses`/`binds` 조건부 조립 방식으로 교체. `'night_date' in body` 일 때만 `night_date = ?` 절과 바인드값을 추가해, body 에 `night_date: null` 이 명시되면 실제로 NULL 저장되도록 함.
- SET 절 문자열은 전부 리터럴 조합, 사용자 입력은 전부 `?` 바인딩 (threat T-lgr-01 mitigate).
- `cha-bio-safety/src/utils/api.ts` 의 `scheduleApi.update` 시그니처에서 `date` 를 optional 로, `night_date?: string | null` 를 추가.
- `onRequestPatch`/`onRequestDelete` 는 한 글자도 수정하지 않음 (diff 0줄 확인).
- 커밋: `a798e30c`

### Task 2 — EditModal 야간 점검일 체크박스 + 기간일정 시작일 보호
- `cha-bio-safety/src/pages/SchedulePage.tsx` 의 `EditModal` 내부에 `isRangeItem`/`isNightEligibleFire`/`todayStr` 파생 상수와 `isNightDay` state 추가.
- `date` state 초기값을 기간일정이면 `todayStr`(오늘), 아니면 기존대로 `item.date`.
- 날짜 input 에 `min`/`max` 범위 제한 추가 (기간일정일 때만).
- 날짜/시간 row 와 내용 블록 사이에 "이 날짜를 야간 점검일로 표시" 체크박스를 `isNightEligibleFire` 게이트로 삽입.
- 내용 textarea 를 `isNightEligibleFire` 일 때 압축 (`rows=1`, `height:44`).
- `handleSave` payload: 기간일정이면 `...(isRangeItem ? {} : { date })` 로 `date` 키 자체를 제외, `...(isNightEligibleFire ? { night_date: isNightDay ? date : null } : {})` 로 체크 해제 시 `null` 명시 전송.
- 커밋: `b66cc2e6`

### Checkpoint — payload 안전장치 3종 코드 리뷰 (human-verify, 본 실행에서 직접 수행)
배포 전 코드 리뷰 단계이며 대화형 사용자가 없는 실행이라, PLAN.md 와 HANDOFF.md 명세 대비 실제 diff 를 직접 대조해 3가지를 검증했다:

1. **(a) 기간 일정일 때 payload 에 date 키 자체가 없는가** — 확인됨. `...(isRangeItem ? {} : { date })` 는 `isRangeItem === true` 일 때 빈 객체를 스프레드하므로 `date` 프로퍼티 자체가 payload 객체에 존재하지 않는다 (`date: undefined` 형태가 아님 — 키 자체 부재).
2. **(b) 체크 해제 시 night_date 가 null 로 명시 전송되는가** — 확인됨. `...(isNightEligibleFire ? { night_date: isNightDay ? date : null } : {})` 에서 `isNightDay === false` 이면 `night_date: null` 이 리터럴로 들어간다 (`undefined` 아님). 백엔드 `onRequestPut` 은 `'night_date' in body` 로 키 존재 여부만 검사하므로 `null` 값이 정상적으로 SET 절에 바인딩되어 컬럼이 실제로 NULL 로 지워진다.
3. **(c) 단일 날짜 일정 편집 경로가 기존과 100% 동일한가** — 확인됨. `isRangeItem === false` 일 때: `date` state 초기값은 `item.date` 그대로(변경 없음), `isNightEligibleFire` 는 항상 `false`(`isRangeItem` 이 전제조건이므로), 체크박스는 렌더링되지 않고, textarea 는 `rows=4`/압축 스타일 없음(기존과 동일), `handleSave` payload 는 `...(isRangeItem ? {} : { date })` → `{ date }` 포함, `night_date` 스프레드는 빈 객체 → 최종 payload 는 `{ title, date, time, memo }` 로 리팩터 이전과 완전히 동일한 형태.

추가로 `git status --short` 및 커밋별 `git diff` 로 수정 파일이 지정된 3개뿐이고 `onRequestPatch`/`onRequestDelete`/`AddModal`/`migrations/` 에 변경이 전혀 없음을 재확인했다. 3가지 모두 통과하여 체크포인트를 승인 처리하고 다음 단계로 진행했다.

### Task 3 — 커밋
실행 프로토콜(atomic per-task commit)에 따라 Task 1, Task 2 를 각각 개별 커밋으로 이미 완료했으므로, PLAN.md 가 명시한 "3개 파일 단일 커밋" 대신 2개의 atomic 커밋(`a798e30c`, `b66cc2e6`)으로 동일한 효과(지정된 3개 파일만, ASCII 메시지, 명시적 `git add` 경로 지정, `-A` 미사용)를 달성했다. 두 커밋을 합산하면 정확히 3개 파일만 수정되었다.

## Deviations from Plan

### Auto-fixed Issues

없음 — PLAN.md/HANDOFF.md 명세를 그대로 적용했다.

### 커밋 방식 차이 (Rule 외 — 실행 프로토콜 우선순위)

PLAN.md Task 3 은 "3개 파일을 한 번에 커밋"을 지시했으나, 본 실행 프로토콜(execute-plan.md)의 "각 태스크 완료 즉시 atomic 커밋" 규칙을 우선 적용해 Task 1 완료 시점(2파일), Task 2 완료 시점(1파일)에 각각 개별 커밋했다. 최종 결과는 동일(지정 3개 파일만 변경, ASCII 메시지, 명시적 `git add`)하며 기능/안전장치에는 영향 없음.

## Known Stubs

없음.

## Threat Flags

없음 — 본 작업으로 추가된 신규 네트워크 표면이나 신뢰 경계 변경 없음. 위협 모델에 등록된 T-lgr-01(동적 SET 절 보간 방지), T-lgr-02(기간일정 date 덮어쓰기 방지)는 모두 mitigate 적용 확인.

## Self-Check

- `cha-bio-safety/functions/api/schedule/[id].ts` — FOUND, `'night_date' in body` 포함
- `cha-bio-safety/src/utils/api.ts` — FOUND, `night_date?: string | null` 포함
- `cha-bio-safety/src/pages/SchedulePage.tsx` — FOUND, `isNightEligibleFire` 9회 출현
- 커밋 `a798e30c` — FOUND in git log
- 커밋 `b66cc2e6` — FOUND in git log
- `npx tsc --noEmit` — 통과 (exit 0)
- `git status --short` 추적 파일 중 미커밋 변경 — 없음 (이 플랜 범위 내)

## Self-Check: PASSED

## 배포 안내

이 콘솔은 production 전용이며 본 실행에서는 D1 직접 실행(`wrangler d1 execute`)과 Cloudflare Pages 배포(`wrangler pages deploy`)를 **수행하지 않았다**. 코드 수정 + git 커밋까지가 작업 범위이며, 배포는 사용자가 별도로 수행해야 한다. `migrations/` 변경 없음(`night_date` 컬럼은 0107 로 기존 적용됨) — 코드 배포만으로 충분하다.
