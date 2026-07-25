---
phase: quick-260725-eha-2-confirmed
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cha-bio-safety/migrations/0103_panel_alarms_confirmed.sql
  - cha-bio-safety/functions/api/alarm/trigger.ts
  - cha-bio-safety/functions/_lib/alarm.ts
autonomous: true
requirements: [AUDIO-2-CONFIRMED]
must_haves:
  truths:
    - "panel_alarms 테이블에 confirmed 컬럼이 존재하고 기본값 0 (기존 21행은 0으로 백필)"
    - "교차-source 동시발생(기존 활성 visual + 신규 audio, 또는 그 반대)이면 그 활성 경보 행이 confirmed=1 로 업데이트된다"
    - "같은 source 재발신이거나 한쪽 source 가 null 이면 confirmed 를 건드리지 않는다(현행 dedupe 동작 유지)"
    - "API 계약(mapAlarm)에 confirmed 필드가 노출된다(순수 additive, 기존 소비처 무영향)"
  artifacts:
    - path: "cha-bio-safety/migrations/0103_panel_alarms_confirmed.sql"
      provides: "panel_alarms.confirmed 컬럼 추가(수동 1회 적용)"
      contains: "ADD COLUMN confirmed"
    - path: "cha-bio-safety/functions/api/alarm/trigger.ts"
      provides: "dedupe 시 교차-source confirmed=1 태깅"
      contains: "SET confirmed = 1"
    - path: "cha-bio-safety/functions/_lib/alarm.ts"
      provides: "AlarmRow.confirmed + mapAlarm.confirmed 노출"
      contains: "confirmed: r.confirmed"
  key_links:
    - from: "cha-bio-safety/functions/api/alarm/trigger.ts"
      to: "panel_alarms.confirmed"
      via: "UPDATE ... SET confirmed = 1 WHERE id = ? (bind existing.id)"
      pattern: "SET confirmed = 1"
    - from: "cha-bio-safety/functions/_lib/alarm.ts"
      to: "mapAlarm 반환 객체"
      via: "confirmed: r.confirmed ?? 0"
      pattern: "confirmed: r.confirmed"
---

<objective>
화재수신반 오디오 경보 2단계(서버/계약). 영상(visual)과 오디오(audio) 감지가 같은 화재를 거의 동시에 잡으면, 서버 dedupe 단계에서 그 활성 경보를 `confirmed=1` 로 태깅한다. 순수 additive 서버 변경이며, 프론트 뱃지 UI/에이전트 코드/배포는 이 PLAN 범위 밖이다.

Purpose: 단일 source 오탐 대비 "영상+오디오 교차확인된 경보"를 서버 레벨에서 구분 가능하게 하여, 이후 단계(뱃지/통계)의 신뢰 근거를 만든다.
Output: 마이그 1건(0103) + 코드 2파일 수정(trigger.ts, alarm.ts).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
설계는 확정됨. 아래 소스의 현행 형태를 정확히 반영해 수정하라(재설계 금지).

@cha-bio-safety/functions/api/alarm/trigger.ts
@cha-bio-safety/functions/_lib/alarm.ts
@cha-bio-safety/migrations/0092_panel_alarms.sql
@cha-bio-safety/migrations/0094_panel_alarms_location.sql

배경(검증된 사실):
- panel_alarms 에는 이미 `source TEXT CHECK(source IN ('visual','audio'))` + `confidence REAL` 컬럼이 존재한다(0092).
- trigger.ts 2)번 블록은 `type` + `status IN ('active','acked')` 로 기존 활성 행을 찾아 그대로 반환한다. 현재 dedupe 는 source/confidence 를 갱신하지 않는다.
- 최신 마이그는 0102 → 신규는 0103.
- AlarmRow 의 0096 신규 필드 블록(alarm.ts 28~35행 근처)에 confirmed 를 additive 로 붙인다.

주의(메모리 룰):
- 브랜치 = production 유지. wrangler 명령/D1 적용/배포는 이 PLAN 범위 밖(오케스트레이터가 별도 처리). 서브에이전트 prod deploy 금지.
- TypeScript strict=false, 2-space indent, 인라인 주석 한국어, 섹션 divider 스타일 유지.
- MONITORING-SPEC.md(별도 리포)와 프론트 '확정' 뱃지 UI 는 건드리지 말 것.
</context>

<tasks>

<task type="auto">
  <name>Task 1: 마이그레이션 0103 — panel_alarms.confirmed 컬럼 추가</name>
  <files>cha-bio-safety/migrations/0103_panel_alarms_confirmed.sql</files>
  <action>
신규 파일을 생성한다. 단일 DDL 문 하나만 두되, 파일 상단에 한국어 주석 헤더를 붙인다.

DDL(정확히 이 한 줄): ALTER TABLE panel_alarms ADD COLUMN confirmed INTEGER NOT NULL DEFAULT 0;

헤더 주석 요건(0094 스타일의 `-- ` 라인 주석):
- 이 컬럼의 의미: 영상+오디오 교차-source 동시확인된 경보 여부(0=미확정, 1=확정). trigger.ts dedupe 단계에서 태깅.
- 기존 21행은 DEFAULT 0 으로 자동 백필됨.
- 반드시 명시할 경고: "이 파일은 wrangler d1 execute --file 로 1회 수동 적용한다. SQLite 는 ADD COLUMN IF NOT EXISTS 미지원 → 재실행 시 'duplicate column: confirmed' 에러가 나는 것이 정상이며, 재적용 금지." (메모리: D1 마이그 idempotency 선례 때문에 idempotent 래핑을 무리하게 시도하지 말 것 — D1 이 지원 안 함.)

DROP/재생성 하지 말 것(0093 처럼 테이블 재생성 방식 아님 — 단순 ADD COLUMN 이면 충분하다). CHECK 제약 변경이 아니므로 ALTER ADD COLUMN 가능.
  </action>
  <verify>
    <automated>cd cha-bio-safety && grep -v '^--' migrations/0103_panel_alarms_confirmed.sql | grep -c 'ALTER TABLE panel_alarms ADD COLUMN confirmed INTEGER NOT NULL DEFAULT 0'</automated>
  </verify>
  <done>0103 파일 존재. 비주석 라인에 정확한 ALTER 문 1개. 주석 헤더에 "1회 수동 적용/재실행 금지/duplicate column 정상" 경고 포함. 테이블 재생성 방식 아님.</done>
</task>

<task type="auto">
  <name>Task 2: 교차-source confirmed 태깅(trigger.ts) + 계약 노출(alarm.ts)</name>
  <files>cha-bio-safety/functions/api/alarm/trigger.ts, cha-bio-safety/functions/_lib/alarm.ts</files>
  <action>
두 파일을 additive 하게 수정한다. 하나의 원자 커밋으로 묶어도 되고 2개로 나눠도 됨(executor 판단).

(A) trigger.ts — 2)번 dedupe 블록(현행 54~63행, `if (existing) { return Response.json(...) }`)을 수정:
  - `return` 직전에 교차-source 판정 추가. 조건: `existing.source` 와 `body.source` 가 둘 다 non-null(둘 다 존재)이고 서로 다를 때(예: 기존=visual, 신규=audio, 또는 그 반대).
  - 조건 충족 시 다음 UPDATE 를 await 실행: `UPDATE panel_alarms SET confirmed = 1 WHERE id = ? AND (confirmed IS NULL OR confirmed = 0)` — bind 는 existing.id 하나. (idempotent: 이미 1이면 no-op.)
  - 그 후 기존과 동일하게 existing 행 정보를 반환한다(alarmId=existing.id / draftRecordId=existing.draft_record_id / escalation=fire 면 {maxCount:3, intervalSec:20} else null). 반환 형태/필드는 변경 금지 — confirmed 태깅은 서버 부작용일 뿐 응답 스키마는 그대로.
  - 같은 source 재발신이거나 한쪽 source 가 null 이면 UPDATE 하지 말 것(현행 동작 유지).
  - 한국어 인라인 주석으로 "영상+오디오 교차확인 → confirmed 태깅" 의도 1줄 명시. try/catch 는 기존 것이 감싸므로 별도 에러처리 불필요(await 누락만 주의).

(B) alarm.ts — 순수 additive 계약 노출:
  - `AlarmRow` 인터페이스에 `confirmed?: number | null` 추가. 위치는 0096 신규 필드 블록(28~35행) 근처, 인라인 주석 `// 0103 신규` 부착.
  - `mapAlarm` 반환 객체에 `confirmed: r.confirmed ?? 0` 추가(0096 신규 주석 divider 아래 스타일 따를 것).
  - `mapAlarmSummary` 는 절대 건드리지 말 것(칩 요약엔 불필요).
  </action>
  <verify>
    <automated>cd cha-bio-safety && grep -c 'SET confirmed = 1 WHERE id = ?' functions/api/alarm/trigger.ts && grep -c 'confirmed?: number | null' functions/_lib/alarm.ts && grep -c 'confirmed: r.confirmed ?? 0' functions/_lib/alarm.ts && grep -c 'mapAlarmSummary' functions/_lib/alarm.ts</automated>
  </verify>
  <done>trigger.ts: dedupe 반환 직전 교차-source(양쪽 source non-null & 상이) 조건에서만 `UPDATE ... SET confirmed = 1 WHERE id = ? AND (confirmed IS NULL OR confirmed = 0)` await 실행, 응답 스키마 불변. alarm.ts: AlarmRow.confirmed 필드 + mapAlarm.confirmed 노출 추가, mapAlarmSummary 무변경.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| panel-agent → /api/alarm/trigger | 에이전트 키 인증(assertAgentKey) 후 body(source/type) 신뢰 경계 |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-quick-01 | Tampering | trigger.ts confirmed UPDATE | mitigate | UPDATE 는 파라미터 바인드(existing.id)만 사용 — SQL 인젝션 불가. 정적 SQL 문자열 |
| T-quick-02 | Elevation of Privilege | /api/alarm/trigger | accept | 기존 assertAgentKey 게이트 유지 — 이 변경은 신규 엔드포인트/권한 추가 없음 |
| T-quick-03 | Spoofing | body.source 위조로 거짓 confirmed 유발 | accept | 4인 내부 팀 + 에이전트 키 인증. source 위조 위험 낮고, confirmed 는 표시용 신뢰 힌트일 뿐 법적/삭제 권한과 무관 |
</threat_model>

<verification>
- 마이그: 0103 파일이 비주석 정확 ALTER 1개 + 수동적용/재실행금지 경고 헤더 포함.
- trigger.ts: 교차-source(양쪽 non-null & 상이) 경로에서만 confirmed=1 UPDATE, 그 외 경로 무변경, 응답 스키마 불변, await 존재.
- alarm.ts: AlarmRow.confirmed + mapAlarm.confirmed additive, mapAlarmSummary 무변경.
- 범위 밖(수행 금지): wrangler 명령, D1 적용, 배포, 프론트 뱃지, MONITORING-SPEC.md, 에이전트 코드.
</verification>

<success_criteria>
- `cha-bio-safety/migrations/0103_panel_alarms_confirmed.sql` 생성 완료(수동 1회 적용용).
- trigger.ts dedupe 가 교차-source 동시발생 시에만 활성 경보를 confirmed=1 로 태깅하고, 반환 스키마는 그대로.
- alarm.ts 가 confirmed 를 계약에 노출(mapAlarm), 기존 소비처 무영향.
- 브랜치 production 유지, wrangler 미실행.
</success_criteria>

<output>
Create `.planning/quick/260725-eha-2-confirmed/260725-eha-SUMMARY.md` when done.
</output>
