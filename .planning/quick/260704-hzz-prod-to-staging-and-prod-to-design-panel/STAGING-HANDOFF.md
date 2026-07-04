# PROD → STAGING 이관 — 화재수신반 백엔드 260702-p22 델타 (fault 3번째 케이스 + panel_alarms.location)

> **읽는 콘솔**: staging = `~/Documents/cbc7119-data` (`cd ~/Documents/cbc7119-data && claude`).
> **작성 출처**: prod 콘솔(`~/Documents/20260328`), production HEAD `a4e89772`, 2026-07-04.
> staging 은 이 문서만 보고 자기 리포에서 작업. prod 는 직접 안 건드림.
> **⚠️ staging 레이아웃**: 앱이 **리포 루트**에 있음 (prod 처럼 `cha-bio-safety/` 하위 아님).
> 즉 staging 경로 = `functions/...`, `migrations/...`, `src/...` (루트 기준).

---

## 배경 / 왜 이 갭이 생겼나

prod 가 화재수신반 **fault(고장) 경보 3번째 케이스** + **panel_alarms.location 컬럼**을
사용자 명시 승인("이 콘솔에서 예외적으로 전부 구현") 하에 **staging-first 생략, prod 직접** 적용함
(production-sync.md 기록). 그 결과 staging 이 뒤처짐.

이 이관의 목적 = **staging 을 다시 prod 백엔드의 충실한 미러로 복원** → 다음 진짜 staging-first
작업이 올바른 baseline 에서 출발하게. (fault 자체를 지금 staging 에서 재검증하려는 게 아님 —
미러 정합성 복원.)

## 전제 (먼저 확인)

- staging D1 = `cha-bio-db-staging`. 마이그 **0092_panel_alarms.sql 까지 적용됨** (패널 백엔드 본체는
  260701-pnl 때 이미 이식됨: `functions/_lib/alarm.ts`, `functions/_lib/push.ts`, `functions/api/alarm/*`).
- staging functions 백엔드는 prod `0f564d77`(= staging 동기점) 상태와 일치해야 정상. 아래 델타는
  `0f564d77..production` 의 backend diff 그대로라 그 위에 얹으면 됨.
- 만약 0092/패널 백엔드 본체조차 없으면 → 먼저 `260701-pnl-SUMMARY.md` 의 본체 이관부터.

---

## (1) 마이그레이션 2개 — prod 에서 그대로 복사 후 staging D1 적용

```bash
cd ~/Documents/cbc7119-data
cp ~/Documents/20260328/cha-bio-safety/migrations/0093_panel_alarms_fault.sql    migrations/
cp ~/Documents/20260328/cha-bio-safety/migrations/0094_panel_alarms_location.sql migrations/

# staging D1 (cha-bio-db-staging) 에 적용 — 순서대로:
npx wrangler d1 execute cha-bio-db-staging --remote --file=migrations/0093_panel_alarms_fault.sql
npx wrangler d1 execute cha-bio-db-staging --remote --file=migrations/0094_panel_alarms_location.sql
```

- **0093** = `panel_alarms.type` CHECK 에 `'fault'` 추가. SQLite CHECK 는 ALTER 불가 →
  테이블 재생성(`_new` 생성 → `INSERT SELECT` 보존 → RENAME → 인덱스 재생성). staging 도 0행이라 안전,
  `DROP TABLE IF EXISTS panel_alarms_new` 로 재실행 안전.
- **0094** = `ALTER TABLE panel_alarms ADD COLUMN location TEXT;` (발생 위치 라벨, null 이면
  `mapAlarm` 이 `'방재실 화재수신반'` 기본값).
- **적용 순서 중요**: 0093 이 테이블을 재생성하므로 0093 → 0094 순. (0094 를 먼저 하면 0093 재생성
  시 location 컬럼이 `SELECT *` 로 보존되긴 하나, 순서대로 가는 게 안전.)

---

## (2) 백엔드 코드 5파일 — `0f564d77..production` backend diff 적용

### 빠른 경로 (바이트-정확, 권장)

prod git 에서 패치 생성 후 staging 루트에 `-p2`(=`a/cha-bio-safety/` 2단계 strip)로 적용:

```bash
cd ~/Documents/cbc7119-data
git -C ~/Documents/20260328 diff 0f564d77..production -- \
  cha-bio-safety/functions/_lib/alarm.ts \
  cha-bio-safety/functions/_lib/push.ts \
  cha-bio-safety/functions/api/alarm/trigger.ts \
  cha-bio-safety/functions/api/alarm/clear.ts \
  cha-bio-safety/functions/api/alarm/renotify.ts \
  > /tmp/panel-be.patch

git apply -p2 --check /tmp/panel-be.patch && git apply -p2 /tmp/panel-be.patch \
  && echo "APPLIED" || echo "CHECK 실패 → 아래 수기 적용"
```

> `--check` 통과 후에만 적용. staging functions baseline 이 `0f564d77` 와 다르면 실패 →
> 수기 적용으로 전환. (git apply 는 조용히 no-op 날 수 있으니 아래 grep 검증 필수.)

### 수기 fallback — 변경 요지 (5파일)

**`functions/_lib/alarm.ts`**
- `AlarmRow.type`: `'fire' | 'equip'` → `'fire' | 'equip' | 'fault'`
- `AlarmRow` 에 `location: string | null` 필드 추가 (`snapshot_key` 아래 줄)
- `mapAlarm()`: `location: LOCATION_LABEL` → `location: r.location ?? LOCATION_LABEL`
- `mapAlarmSummary()`: `location: LOCATION_LABEL` → `location: r.location ?? LOCATION_LABEL`

**`functions/_lib/push.ts`** — `buildPanelPayload`
- 인자 `alarmType: 'fire' | 'equip'` → `'fire' | 'equip' | 'fault'`
- title/body 를 3분기로:
  ```
  title = t === 'fire' ? '🔴 화재수신반 경보' : t === 'fault' ? '🟡 화재수신반 고장' : '설비 동작 감지'
  bodyHead = t === 'fire' ? '화재 신호 감지' : t === 'fault' ? '고장 신호 감지' : '설비 동작 감지'
  body = `${bodyHead} (${a.detectedAt})${loc}`
  ```

**`functions/api/alarm/trigger.ts`**
- `TriggerBody.type`: `+'fault'`; `TriggerBody` 에 `location?: string` 추가
- 검증: `['fire','equip'].includes(...)` → `['fire','equip','fault']`, 에러 메시지 `type is fire|equip|fault`
- INSERT 2곳(maint suppressed + 신규 active): 컬럼 목록에 `location` 추가 +
  bind 끝에 `body.location ?? null` 추가
- 1차 push payload: `location: LOCATION_LABEL` → `location: body.location ?? LOCATION_LABEL`

**`functions/api/alarm/clear.ts`**
- request body 타입 `{ type?: 'fire' | 'equip'; at?: string }` → `+ 'fault'` (제네릭·캐스트 2곳 모두)

**`functions/api/alarm/renotify.ts`**
- payload: `location: LOCATION_LABEL` → `location: row.location ?? LOCATION_LABEL`

### 검증

```bash
grep -n "fault" functions/_lib/alarm.ts functions/_lib/push.ts functions/api/alarm/trigger.ts functions/api/alarm/clear.ts
grep -n "location" functions/api/alarm/trigger.ts   # INSERT 2곳 + payload 에 location 나와야 함
```

---

## (3) 빌드 · 배포 · 검증

```bash
cd ~/Documents/cbc7119-data
npm run build
npx wrangler pages deploy dist --project-name=cbc7119-data --branch=main --commit-dirty=true \
  --commit-message="port panel fault 3rd-case + location backend from prod"
```

API 검증 (staging URL):
```bash
# fault 트리거가 200 + panel_alarms 에 type=fault, location 채워짐 확인
POST /api/alarm/trigger  {"type":"fault","detectedAt":"2026-07-04 12:00:00","location":"B1F(1계단전실) 배기댐퍼수동SW"}
# → 200, 그리고:
npx wrangler d1 execute cha-bio-db-staging --remote \
  --command="SELECT id,type,location,status FROM panel_alarms ORDER BY created_at DESC LIMIT 3"
```

git 커밋 (staging 은 별도 로컬 repo, production-sync 게이트 없음):
```bash
git add -A
git commit -m "port: panel fault 3rd-case + location backend (prod 260702-p22 mirror)"
```

---

## ⚠️ 주의 / 함정

- `--project-name` 은 **반드시 `cbc7119-data`**. `cbc7119`(직원 프로그램) 절대 금지 → prod 폭파.
- `wrangler d1 execute` 대상은 **`cha-bio-db-staging`**. prod `cha-bio-db` 금지.
- `E2E-PANEL` 계정은 staging 전용 테스트 계정 — prod 로 넘기지 말 것.
- `wrangler d1 --file` batch 는 atomic 아님. 0093 은 단일 트랜잭션이 아니므로 실패 시 상태 확인 후 재실행
  (`DROP IF EXISTS _new` 라 재실행 안전).

## 프론트(선택 — staging 필수 아님)

이 델타의 **시각** 검증(fault 칩/풀스크린)까지 원하면 프론트도 필요한데, 그건 design 트랙과 동일 작업.
staging 의 목적은 스키마/API 검증이라 **백엔드 + API 트리거로 충분**. 시각 검증까지 원하면 별도 요청 —
`DESIGN-HANDOFF.md` 의 UI 델타를 staging src 에도 얹는 형태가 됨.

## 이번 갭과 별개 — staging 기존 부채 (참고만, 지금 안 해도 됨)

- **`events.ts` 720h(30일) 캡 해제** — 아직 어디에도 미적용. panel_alarms 는 영구저장인데
  `functions/api/alarm/events.ts` 의 `Math.min(..., 720)` 이 조회를 30일로 제한 → 이력 30일 넘어가면
  전체이력 자동감지 누락. **원래 "staging 먼저" 하기로 한 1줄 read-only 항목.** 다음 staging 작업 때 같이.
- **b5v 반쪽 윈도우** (`getMarkerStatus` 반쪽 게이트 + `inspectionProgress` export) — prod 전용,
  staging 미적용. production-sync.md 에 기록된 pre-260701 부채.
