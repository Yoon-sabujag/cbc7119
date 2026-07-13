---
id: 260714-bia
slug: watchdog-repush
status: in-progress
created: 2026-07-14
---

# cron 워치독 §6 — 반대 방향으로 죽은 워치독 (재알림 0건)

## 배경 — 오늘 실제로 벌어진 일

§1 수정(무한 푸시 제거)은 런타임으로 실증됐다: `watchdog_notified_at` 이 06:40:38 SET 후 **77분(하트비트 77회) 생존**.
구 코드였다면 60초 만에 NULL 로 뒤집혔다. **그런데 반대 방향으로 죽었다.**

```
06:38  SSH 재기동 → macOS TCC 가 캡처보드 차단. ffmpeg 는 에러 없이 뜨고 프레임 0장. agentOnline=true
06:40  cron 워치독 감지 → 관리자 푸시 1회. 설계대로 작동
~08:06 고장 88분 지속. 추가 알림 0건. frame_starved_sec 1,500초 돌파,
       "감지 파이프 정지" 사유까지 추가 발화. 그래도 침묵
08:06  사람이 우연히 D1 을 보고 발견
```

워치독은 한 번 외치고, **설계대로 침묵했고**, 88분간 아무도 몰랐다.

## 결함 3건 (`cbc-cron-worker/src/index.ts`)

- **6-1 쿨다운/재알림 없음** — `:711 if (a.watchdog_notified_at) return` 이 유일한 게이트. 경과시간 비교가 없다.
  고장이 며칠 가도 푸시는 **최초 1회뿐.** 그 한 번을 놓치면(야간·무음·iOS PWA silent drop) 영원히 다시 안 알린다.
- **6-2 푸시 실패해도 "통지함"으로 기록** — `:713-730` 관리자 0명이면 발송을 건너뛰고 바로 SET.
  전원 구독 만료(410)여도 SET. **도달 0건인데 "통지했다"** + 쿨다운 없음 = 완전한 침묵.
- **6-3 사유 에스컬레이션이 삼켜짐** — 억제가 '사유 목록' 이 아니라 '통지 여부' 단일 플래그.
  "캡처보드 신호 없음"으로 SET 된 뒤 "하트비트 3분 초과"(에이전트 완전 사망) 가 추가돼도 :711 에서 return.
  **경미한 고장 통지가 그 뒤의 치명적 고장 통지를 영구히 삼킨다.** 오늘 실제로 그랬다.

## ★ 이 콘솔이 추가로 발견한 함정 2개 (에이전트 콘솔 제안 그대로 짜면 안 고쳐진다)

**(A) `sendPush` 는 실패를 삼킨다 — `push_ok` 가 거짓말을 하게 된다.**
`sendPush` 는 `Promise<void>` 이고 내부 try/catch 로 **모든 오류를 흡수**한다. 410/404/5xx 도 throw 하지 않는다.
→ `Promise.allSettled` 의 fulfilled 개수는 **항상 구독 수와 동일**하다. 제안대로 fulfilled 를 세면
**전원 실패해도 "도달 N건"** 이 되어 6-2 가 그대로 남는다. 거짓말하는 상태 필드를 하나 더 만드는 셈.
→ `sendPush` 가 **실제 도달 여부(boolean)** 를 반환하도록 먼저 고친다. 기존 호출처는 반환값을 무시하므로 안전.

**(B) 사유 문자열에 초 숫자가 박혀 있다 — 텍스트로 집합 비교하면 §1 무한 푸시가 부활한다.**
`캡처보드 신호 없음(1500초)` 은 **5분 틱마다 값이 바뀐다.** 사유 집합을 이 텍스트로 비교하면
매 틱 "사유가 바뀌었다" → 재푸시 → 무한 푸시. **사유는 코드로 정규화**한다(`hb`/`starved`/`detect` 정렬 join).
사람이 읽는 문구는 별도 필드로 만들고, 비교는 코드로만 한다.

## 작업

1. **`cha-bio-safety/migrations/0099_watchdog_repush.sql`**
   - `panel_agent_status` + `watchdog_reasons TEXT` (통지한 **사유 코드 집합**, 정렬·정규화)
   - `panel_agent_status` + `watchdog_push_ok INTEGER` (마지막 통지의 **실제 도달 건수**. 0 = 통지 실패)

2. **`cbc-cron-worker/src/index.ts` `sendPush`** — `Promise<void>` → `Promise<boolean>`.
   `res.status < 400` → true. 4xx/5xx/throw → false. 로깅·410 정리 동작은 그대로.

3. **`handlePanelWatchdog`** — 사유를 `{code, text}` 로. `reasonKey = codes.sort().join(',')`.
   **재푸시 조건(셋 중 하나라도 참):**
   - `reasonKey !== watchdog_reasons` (6-3 사유 에스컬레이션)
   - `(watchdog_push_ok ?? 0) === 0` (6-2 도달 0건 → 재시도)
   - `now - watchdog_notified_at > 6시간` (6-1 쿨다운. 하루 최대 4회)
   `pushOk` = `allSettled` 결과 중 `fulfilled && value === true` 개수.
   재푸시면 body 에 지속시간 표기. 회복(사유 0개) 시 **세 컬럼 전부 NULL.**
   telemetry 에 `pushOk`/`reasonKey`/재푸시 트리거 기록.

4. **`:705` 낡은 주석 삭제** — "heartbeat.ts 도 리셋하지만" 은 **이제 거짓**이다.
   이 주석을 믿은 미래 작업자가 heartbeat 의 NULL 리셋을 '누락' 으로 오인해 되살리면 §1 무한 푸시가 재발한다.
   `:672` 주석도 갱신.

5. **`cha-bio-safety`** — `status.ts` 에 `launchedFromSsh` 노출(cfg 통과) +
   `PanelMonitorPage` 🔴 **SSH 기동 — 캡처보드 차단 가능** 배지. 에이전트 v1.5.0 대기 → 그때까지 null=배지 없음.

6. **배포** — prod D1 0099 → cron worker `wrangler deploy` → pages deploy `--branch production`.

## 검증

- prod D1 에 두 컬럼 존재.
- 회복 상태(사유 0개)이므로 세 컬럼 NULL 유지 = 푸시 0건. **배포만으로 푸시가 나가면 안 된다.**
- 다음 실고장에서: 1회 푸시 → 사유 추가 시 즉시 재푸시 → 도달 0건이면 다음 틱 재시도 → 지속 시 6시간마다.

## 범위 밖

- 에이전트 v1.5.0-selfheal(프레임 기아 60초 시 캡처 파이프 자가 재연결) — 에이전트 콘솔 작업.
- 첫 실경보 prod 실증(§4).
