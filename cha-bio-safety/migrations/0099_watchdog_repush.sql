-- 0099: 워치독 재알림 (에이전트 콘솔 FEEDBACK §6).
--
-- 왜: §1 에서 "무한 푸시"를 죽였더니 워치독이 **반대 방향으로 죽었다.**
--     2026-07-14 실제 사고: 06:38 캡처보드 차단(macOS TCC) → 06:40 워치독이 정확히 감지하고 푸시 1회.
--     그리고 88분간 침묵. frame_starved_sec 1,500초 돌파, '감지 파이프 정지' 사유까지 추가 발화했는데도
--     추가 알림 0건. 08:06 에 사람이 우연히 D1 을 보고 발견했다.
--     워치독은 한 번 외치고 **설계대로 침묵했다.** 그게 문제다.
--
-- 억제를 '통지 여부' 단일 플래그(watchdog_notified_at)로만 걸면 세 가지가 동시에 깨진다:
--   6-1 고장이 며칠 가도 푸시는 최초 1회뿐 — 그 한 번을 놓치면(야간·무음·iOS silent drop) 영원히 침묵
--   6-2 푸시가 전원 실패(410)해도 "통지함"으로 SET — 도달 0건인데 재시도가 없다
--   6-3 경미한 사유로 SET 된 뒤 '에이전트 완전 사망' 같은 더 심각한 사유가 추가돼도 삼켜진다
--
-- ★ watchdog_reasons 는 **사유 코드**(hb/starved/detect 정렬 join)를 넣는다. 사람이 읽는 문구를 넣지 마라 —
--   '캡처보드 신호 없음(1500초)' 은 5분 틱마다 숫자가 바뀌므로, 그걸로 집합 비교하면
--   매 틱 "사유가 바뀌었다" → 재푸시 → **§1 무한 푸시가 그대로 부활한다.**
--
-- ★ watchdog_push_ok 는 **실제 도달 건수**다. sendPush 가 성공(2xx)을 반환한 개수만 센다.
--   (sendPush 는 원래 모든 실패를 삼켜서 Promise.allSettled 의 fulfilled 가 항상 구독수와 같았다 —
--    그걸 그대로 세면 전원 실패해도 '도달 N건' 이 되어 6-2 가 안 고쳐진다. 같이 수정했다.)
--
-- 주의: ALTER TABLE ADD COLUMN 은 IF NOT EXISTS 를 지원하지 않는다 → 정확히 1회만 적용.

ALTER TABLE panel_agent_status ADD COLUMN watchdog_reasons TEXT;     -- 통지한 사유 코드 집합 (예: 'detect,starved')
ALTER TABLE panel_agent_status ADD COLUMN watchdog_push_ok INTEGER;  -- 마지막 통지의 실제 도달 건수. 0 = 통지 실패 → 다음 틱 재시도
