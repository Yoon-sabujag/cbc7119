---
id: 260714-bia
slug: watchdog-repush
status: complete
created: 2026-07-14
completed: 2026-07-14
commit: e3bb8147
deploy_pwa: https://eb879064.cbc7119.pages.dev
deploy_cron: cbc-cron-worker 2560e761-4b7d-4db9-9857-4b1be6073f6c
---

# SUMMARY — 워치독 재알림 (§6 결함 3건)

§1 에서 무한 푸시를 죽였더니 워치독이 **반대 방향으로 죽었다.** 같은 날 그 대가를 치렀다:
06:38 캡처보드 차단(SSH 기동 → macOS TCC) → 06:40 워치독이 정확히 감지하고 푸시 1회 → **88분 침묵**.
`frame_starved_sec` 1,500초 돌파, '감지 파이프 정지' 사유까지 추가 발화했는데도 추가 알림 0건.
사람이 우연히 D1 을 보고 발견했다. **워치독은 한 번 외치고 설계대로 침묵했다.**

## 고친 것

| 결함 | 원인 | 수정 |
|---|---|---|
| **6-1** 재알림 없음 | `if (watchdog_notified_at) return` 이 유일한 게이트. 경과시간 비교 없음 | 쿨다운 6시간 (하루 최대 4회) |
| **6-2** 실패해도 "통지함" | 발송 결과와 무관하게 SET. 전원 410 이어도 SET | `watchdog_push_ok` = **실제 도달 건수**. 0 이면 다음 틱 재시도 |
| **6-3** 사유 삼킴 | 억제가 '사유 목록' 이 아니라 '통지 여부' 단일 플래그 | `watchdog_reasons` = 사유 코드 집합. 바뀌면 즉시 재푸시 |

재푸시 조건 = `first` / `reasons-changed` / `push-failed` / `cooldown` 중 하나. 회복 시 세 컬럼 전부 NULL.

## ★ 에이전트 콘솔 제안대로 짰으면 안 고쳐졌을 함정 2개

**(A) `sendPush` 가 실패를 삼킨다.** 제안은 "`Promise.allSettled` 의 fulfilled 개수를 세면 된다(이미 계산 가능한 값)" 였다.
그런데 `sendPush` 는 `Promise<void>` 에 내부 try/catch 로 **모든 오류를 흡수**한다 — 410/404/5xx 도 throw 하지 않는다.
→ fulfilled 개수는 **항상 구독 수와 동일**. 그대로 세면 **전원 실패해도 "도달 N건"** 이 되어 6-2 가 그대로 남는다.
= 거짓말하는 상태 필드를 하나 더 만드는 셈(이 프로젝트가 없애려던 바로 그 형태).
→ `sendPush` 를 `Promise<boolean>`(2xx 만 true) 으로 바꿨다. 기존 호출처는 반환값을 무시하므로 안전
(`Promise<void>[]` 배열 선언 2곳만 타입 정정).

**(B) 사유 텍스트에 초 숫자가 박혀 있다.** `캡처보드 신호 없음(1500초)` 은 5분 틱마다 값이 바뀐다.
사유 집합을 이 텍스트로 비교하면 매 틱 "사유가 바뀌었다" → 재푸시 → **§1 무한 푸시가 그대로 부활**한다.
→ 비교는 **코드**(`hb`/`starved`/`detect` 정렬 join)로만. 사람이 읽는 문구는 별도.

**(C) 도달 0건이면 `notified_at` 을 갱신하지 않는다.** 갱신하면 쿨다운 시계만 뒤로 밀려 재시도가 늦어진다.
최초 시각을 유지해야 다음 틱에 `push-failed` 로 곧바로 재시도한다.

## 그 외

- `:705` 낡은 주석 삭제 — "heartbeat.ts 도 리셋하지만" 은 **이제 거짓**이다.
  이걸 믿은 미래 작업자가 heartbeat 의 NULL 리셋을 '누락' 으로 오인해 되살리면 §1 무한 푸시가 재발한다.
- 🔴 **SSH 기동 — 캡처보드 차단 가능** 배지 (`cfg.launchedFromSsh`). 에이전트 v1.5.0 대기 → 그때까지 null=배지 없음.

## 검증 (prod)

- 0099 적용(rows_written 2). `watchdog_reasons`/`watchdog_push_ok` 존재 확인.
- 배포 시점 회복 상태(세 컬럼 NULL, `frame_starved_sec=0`, `detect_mode=live`) →
  배포 후 틱에서 **워치독 telemetry 신규 0건 = 오탐 푸시 없음.**
- 마지막 워치독 이벤트는 오늘 06:40 KST 사고 건 그대로.
- 다음 실고장이 진짜 검증: 1회 푸시 → 사유 추가 시 즉시 재푸시 → 도달 0건이면 다음 틱 재시도 → 지속 시 6시간마다.

## 남은 것

- 에이전트 v1.5.0-selfheal (프레임 기아 60초 → 캡처 파이프 자가 재연결) — 에이전트 콘솔 작업.
- 첫 실경보 prod 실증(§4) — `location` 보존 / `ocr_*` / 스냅샷 썸네일.
