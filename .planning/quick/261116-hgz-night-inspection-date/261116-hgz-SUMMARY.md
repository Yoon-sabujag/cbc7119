---
phase: quick-261116-hgz
plan: 01
subsystem: schedule / panel-maint-mode
tags: [schedule, fire-inspection, panel, maint-mode, migration]
dependency-graph:
  requires: []
  provides:
    - "schedule_items.night_date column (migration, not yet applied to prod D1)"
    - "ScheduleItem.nightDate / scheduleApi.create body.night_date types"
    - "hasNightEvent() exact-match against night_date"
  affects:
    - "functions/_lib/maint.ts computeMaint() autoOff decision (17:30 vs 21:00)"
tech-stack:
  added: []
  patterns:
    - "Conditional spread for optional POST fields (night_date only sent when non-empty)"
key-files:
  created:
    - cha-bio-safety/migrations/0107_schedule_night_date.sql
  modified:
    - cha-bio-safety/functions/_lib/maint.ts
    - cha-bio-safety/functions/api/schedule/index.ts
    - cha-bio-safety/src/types/index.ts
    - cha-bio-safety/src/utils/api.ts
    - cha-bio-safety/src/pages/SchedulePage.tsx
decisions:
  - "야간 신호를 category='event'(낮 시간 투어/지원으로 실측 확인) 추측에서 사람이 직접 입력하는 night_date 로 교체"
  - "야간 점검일 입력은 AddModal 의 소방 상반기 종합정밀점검 / 소방 하반기 작동기능점검 2개 제목에만 한정, EditModal 은 범위 밖"
metrics:
  duration: "~25분"
  completed: "2026-11-16"
---

# Phase quick-261116-hgz Plan 01: 야간 점검일(night_date) 도입 Summary

화재수신반 점검모드의 야간 연장 판정 소스를 `category='event'`(실측 결과 전부 낮 시간 투어/지원 — 오작동) 에서
사람이 직접 입력하는 `schedule_items.night_date` 정확매칭으로 교체하고, 월간 점검 계획 > 일정 추가의
소방 상반기 종합정밀점검 / 소방 하반기 작동기능점검 2개 제목에만 "야간 점검일" 입력 UI를 추가했다.

## 수행 작업

### Task 1 — 마이그레이션 + 백엔드/타입 체인

- `cha-bio-safety/migrations/0107_schedule_night_date.sql` 신규 생성.
  `ALTER TABLE schedule_items ADD COLUMN night_date TEXT;` (0103 스타일 헤더 + 재적용 금지 경고 포함).
  **미적용 상태** — wrangler d1 execute 는 세션 내 1회도 실행하지 않았다.
- `functions/_lib/maint.ts` 의 `hasNightEvent()` 를 range-aware `category='event'` 쿼리에서
  `SELECT 1 FROM schedule_items WHERE category = 'fire' AND night_date = ?1 LIMIT 1` 정확매칭으로 교체.
  시그니처 `(env, dateStr): Promise<boolean>` 동일 유지 → 호출부(78·101줄) 2곳 무수정.
  `isFireInspectionDay` / `computeMaint` / `setManualOverride` 는 1바이트도 변경하지 않음.
- `functions/api/schedule/index.ts`:
  - GET: `.map` 반환 객체에 `nightDate: r.night_date ?? undefined` 추가(쿼리는 `SELECT *` 이므로 쿼리문 수정 없음).
  - POST: body 인라인 타입에 `night_date?: string` 추가, INSERT 컬럼 목록 끝에 `night_date` 추가(10번째 placeholder),
    `.bind()` 끝에 `body.night_date ?? null` 추가. 컬럼↔바인드 순서 1:1 대응 확인.
- 타입: `src/types/index.ts` `ScheduleItem.nightDate?:string` 추가,
  `src/utils/api.ts` `scheduleApi.create` body 타입에 `night_date?:string` 추가.

### Task 2 — AddModal 소방 2개 제목 전용 야간 점검일 입력 + 내용칸 압축

- `nightDate` state 추가, `handleCat`/`handleFireSub` 리셋에 `setNightDate('')` 연결.
- `isNightEligibleFire = cat === 'fire' && (fireSub === '소방 상반기 종합정밀점검' || fireSub === '소방 하반기 작동기능점검')` 플래그 추가(문자열은 `FIRE_SUBCATS` 와 완전 일치).
- 소방 분기 내용 textarea(1곳)만 `rows={isNightEligibleFire ? 1 : 3}` + 조건부 `height:44` 로 압축.
  다른 2곳(`rows={3}`, 일반점검/업무·행사 분기)은 변경 0 — `grep -c 'rows={3}'` → 2로 확인.
- 종료일/종료시간 row 뒤, N일 미리보기 주석 앞에 `{isNightEligibleFire && (...)}` 로 감싼
  단독 전폭 "야간 점검일 (선택)" date input 삽입. `min={date}`, `max={endDate || undefined}`,
  종료일 input 과 동일한 `height:44` 스타일.
- `handleSave` payload 에 `...(nightDate ? { night_date: nightDate } : {})` 조건부 스프레드 추가
  (빈 문자열이면 키 자체 미전송 → 서버에서 `?? null` 로 NULL 저장).
- `git diff src/pages/SchedulePage.tsx` 전체 확인: 변경 hunk는 ①handleCat ②상태 선언 ③handleFireSub+isNightEligibleFire
  ④handleSave payload ⑤textarea ⑥신규 night date 블록뿐. EditModal(1146줄~), 공유 시작일/종료일 블록(1075~1101줄),
  다른 두 분기의 `rows={3}` 는 diff 상 변경 0.

### Task 3 — 명시적 스테이징 + ASCII 커밋

- `git status --porcelain` 로 `.claire/`, `cha-bio-safety/.recovery-260526*/` 등 untracked 잔재 존재 확인 후 스테이징 대상에서 배제.
- 6개 경로만 명시적으로 `git add` (migrations/0107, maint.ts, schedule/index.ts, types/index.ts, utils/api.ts, SchedulePage.tsx).
  `-A`/`.` 미사용. 스테이징 후 `git diff --cached --stat` 로 정확히 6개 파일만 포함됨을 확인.
- ASCII 전용 커밋 메시지로 1커밋 생성(`79730b76`). bare `wrangler ` / `git commit` 리터럴 미포함.
  `git log -1 --pretty=%s%n%b | grep -P '^[\x00-\x7F]*$'` → ASCII-OK.
- 커밋 후 `git status --porcelain` 재확인 — `.claude/scheduled_tasks.lock`(기존 수정분, 이번 plan 범위 밖) 과
  기존 untracked 잔재만 남고 혼입 없음.

## 검증 결과

- `cd cha-bio-safety && npx tsc --noEmit` — Task 1·2 양쪽 모두 에러 0으로 통과(프론트+Functions 동시 검증).
- `grep -n "category = 'fire' AND night_date = ?1" functions/_lib/maint.ts` → 1건 매칭.
- 주석 제외 `category = 'event'` 잔존 0 (`EVENT-GONE-OK`).
- `hasNightEvent(env, todayStr)` 호출부 2건 그대로 유지(`CALLSITES-INTACT-OK`).
- `rows={3}` → 2건, `rows={isNightEligibleFire ? 1 : 3}` → 1건(`TEXTAREA-SCOPE-OK`).
- `setNightDate` 참조 4건 이상(`RESET-WIRED-OK`).
- `git diff --cached --stat` → 정확히 6개 파일.
- 세션 내 `wrangler d1 execute` / `wrangler pages deploy` 실행 0회.

## Deviations from Plan

None - plan executed exactly as written.

## 사용자 후속 조치 (순서 중요)

1. **`migrations/0107_schedule_night_date.sql` 을 prod D1(`cha-bio-db`)에 1회 수동 적용**
   (`wrangler d1 execute cha-bio-db --remote --file=cha-bio-safety/migrations/0107_schedule_night_date.sql`).
   재적용 금지 — 두 번째 실행은 `duplicate column: night_date` 로 실패한다(SQLite 는 ADD COLUMN IF NOT EXISTS 미지원).
2. **적용 후에만 production 배포** (`--branch production`). 순서를 뒤집으면(배포를 먼저 하면)
   점검모드 조회 API 가 `no such column: night_date` 로 500 에러가 난다.

이번 세션에서는 `wrangler d1 execute` 와 `wrangler pages deploy`(또는 그 어떤 배포 명령도) **실행하지 않았다** —
코드 수정 + git 커밋까지만 완료했고, D1 마이그레이션 적용과 배포는 전부 사용자가 위 순서대로 직접 수행해야 한다.

추가 참고사항:
- 기존 일정의 야간 점검일 **수정(EditModal) 미구현** — 잘못 입력한 경우 삭제 후 재등록 필요. 후속 과제.
- `category='event'` 기반 야간 연장은 **완전 폐기** — 기존 투어/지원 일정으로 21:00 까지 연장되던
  (오)동작이 사라진다. 이제 야간 연장은 AddModal 에서 명시 입력한 `night_date` 날짜에만 발생한다.
- "폼이 안 바뀐다" 등 보고 시 PWA 서비스워커 캐시 전례 있음 — 앱 재설치 유도.

## Self-Check: PASSED

- 7개 파일 모두 FOUND (migrations/0107, maint.ts, schedule/index.ts, types/index.ts, utils/api.ts, SchedulePage.tsx, SUMMARY.md)
- 커밋 `79730b76` FOUND in `git log --oneline --all`
