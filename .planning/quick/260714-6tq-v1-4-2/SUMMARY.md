---
quick_id: 260714-6tq
status: complete
date: 2026-07-14
branch: production
commits: [790bc726, 6769d3f8]
deploy: https://e2589030.cbc7119.pages.dev
---

# SUMMARY — 에이전트 콘솔 피드백 처리 (FEEDBACK-0328-WATCHDOG.md)

## 🔴 §1 (HIGH) 워치독 억제 버그 — 내가 만든 버그. 최우선 수정·실증 완료 (`790bc726`)

`heartbeat.ts` 싱글턴 UPDATE 가 `watchdog_notified_at = NULL` 을 **무조건** 리셋하고 있었다.
하트비트는 60초마다 온다. 그런데 워치독 사유 2개(`frame_starved_sec ≥ 30` 캡처보드 무신호 /
감지 파이프 정지)는 **에이전트가 살아서 하트비트를 계속 보내는 중에** 발생하는 고장이다.

→ cron 5분 틱 푸시 + SET → **60초 뒤 하트비트가 리셋** → 다음 틱에 또 푸시 →
고장이 지속되는 한 **영원히 5분마다 푸시**(캡처보드 무신호는 며칠 가는 고장 = **하루 288회**).
오탐이 아니라 **정탐의 무한 반복**이지만 결과는 같다 — 알람 피로 → 관리자가 화재수신반 채널을
무음 처리 → **진짜 화재 푸시를 놓친다.**

**수정**: 리셋 제거. 알림 수명주기는 cron 이 단독 소유(푸시 시 SET, 사유 0개=회복 시 NULL).
두 주체가 같은 컬럼을 반대 방향으로 쓰면 억제가 성립하지 않는다.

**prod 실증**: `watchdog_notified_at='2026-07-14 04:00:00'` 을 심고 70초 대기 →
heartbeat 도착(`last_seen_at` 05:04:42 갱신)에도 **표식이 살아남음**. 구 코드였다면 지워졌다.

## §5 v1.4.2 스위치 상태 (마이그 0097 + `790bc726` + `6769d3f8`)

`agent_heartbeats` + `panel_agent_status` 에 `telemetry_on` / `backend_v2` / `snapshot_on` / `cfg_json`.
heartbeat 가 `telemetryOn` + `cfg` optional 파싱(**cfg null 이어도 500 금지** — 옵셔널 체이닝).
`cfg` 는 컬럼으로 쪼개지 않고 JSON 원문 1컬럼(설정 항목이 늘 때마다 마이그레이션이 필요해지는 것 방지).

**화면**: 상단 스위치 배지 3종(계측 꺼짐 🔴 / 증거수집 꺼짐 🟡 / 스냅샷 종속으로 꺼짐 🟡 /
미사용 ⚪ / 필드 null = 구 에이전트 ⚪). 스냅샷 타일이 `snapshotOn` 을 함께 본다 —
`snapshot_ok=0` 을 단독으로 초록 칠하지 않는다("꺼져서 0" 과 "켜졌는데 경보가 없어서 0" 은 정반대).
R2 예산에 **설정 frameInterval 과 실측 간격을 나란히**(차이 = 업로드 왕복).

## §2 카운터 과소집계 (`790bc726` + `6769d3f8`)

`agent-history` 다운샘플이 카운터 델타를 **MAX** 로 집계하는데 프론트 `sumDelta` 가 **합계처럼 더했다**.
24h 조회는 항상 다운샘플을 탄다(60초 주기 → 1,440 > MAXP 1000 → step=2) → 오류 타일 전부 과소집계.
→ **카운터는 SUM, lag/기아만 MAX**(평균은 스파이크를 지운다).
부수 2건: `last1h = slice(-60)` 이 다운샘플 후 실제 **2시간**이었다 → 시각(at) 기준 필터.
R2 예산의 `mins = points.length` 도 "1포인트=60초" 가정이 깨져 있었다 → 첫/마지막 `at` 차로 구간 산출.

## §3 다운타임이 차트에서 사라짐 (`6769d3f8`)

차트 x 가 **배열 인덱스**라 heartbeat 끊긴 구간(= 에이전트가 죽어 있던 시간)의 인접 두 점이
**직선으로 이어졌다**(SPEC §6-③ 명시 위반).
→ x 를 **시각 기준**으로 + gap(>180초)에서 선 끊기 + `gaps[]` **회색 밴드** 렌더.

## ⚠️ §4 보고 정정에 대한 반론 — 내 §6.1 실증은 **prod 가 맞다**

에이전트 콘솔은 "운영 D1 에 `PA-6QUfystLLj` 가 없고 모든 `ocr_*` 가 NULL 이니 staging 검증이었을 것"
이라고 판단했으나, **그 근거는 내 뒤처리 때문에 생긴 착시다.**
- 조작 대상은 `cha-bio-db`(**b12b88e7** = prod). staging 은 `cha-bio-db-staging`(ed74014c) — 별개 DB.
- API 는 `https://cbc7119.pages.dev`(직원 도메인).
- 핸드오프 §6.1 이 **"테스트 경보를 반드시 정리한다"** 고 지시해서 검증 후 **행을 삭제**했다.
  그래서 지금 조회하면 없다. `ocr_*` 가 전부 NULL 인 것도 같은 이유(그 뒤 실경보가 없었다).

**다만 지적의 취지는 타당하다** — 살아있는 prod 증거가 남지 않았다.
→ **영구 증거를 남겼다**: `panel_alarms.id = 'PA-C1PROOF001'` (prod, 삭제하지 않음).
  `location='B1F-2(DIV)'` 인 행에 **location 키 없는** 증거 patch + 빈 `{}` 를 prod API 로 전송 →
  `location` 보존 + `ocr_raw='BIF Z ??'` / `ocr_score=41` / `ocr_confidence='none'` 기록.
  푸시 0(trigger 를 안 거치고 D1 직접 INSERT, `status='cleared'`).

## 🆕 발견 — 맥미니가 v1.4.2 라고 보고하는데 실제 코드는 v1.4.2 가 아니다

`agent_version='1.4.2-telemetry'` 인데 heartbeat `raw` payload 에 **`telemetryOn`/`cfg` 키가 없다**.
→ `raw` 원문 저장(0096)이 이 진단을 가능하게 했다.
**원인**: v1.4.2 코드는 `master` 에만 있고, 맥미니는 (내 안내로) `feat/monitoring-telemetry` 브랜치에 있다.
그 브랜치엔 `cfg`/`telemetryOn` 이 없다. `config.env` 의 `AGENT_VERSION` 만 1.4.2 로 올라가 **버전이 또 거짓말**.
(에이전트 콘솔도 같은 사고를 잡아 `CODE_VERSION` 을 코드에 박는 커밋 `a84ad4a` 을 했다.)
**조치**: 맥미니에서 `git checkout master && git pull` 후 재시작 → 그때부터 스위치 배지가 실제 값으로 바뀐다.
그 전까지 배지가 "구 에이전트"(회색)로 뜨는 것은 **정상 동작**이다.
