-- 0104_panel_watchdog_audience.sql
-- 화재수신반 워치독 수신자 + 오탐 억제 가드 상태.
-- 지시서: panel-agent/FABLE-TASK-WATCHDOG.md v2 §3 (문서의 번호 0100 은 그 사이 다른 마이그레이션이 선점 → 0104).
-- 주의: ALTER TABLE ADD COLUMN 은 IF NOT EXISTS 를 지원하지 않는다 → 정확히 1회만 적용.
-- 주의: DB 복원(restore.ts / 0104 이전 백업)은 백업 시점 스키마로 통째로 되돌린다 —
--       구백업 복원 후에는 이 파일을 재적용해야 워치독이 살아난다 (안 하면 매 틱 no such column → 조용히 전사).

-- 수신자 (데이터 주도 — 사람이 바뀌어도 재배포 불필요)
ALTER TABLE staff ADD COLUMN panel_watchdog INTEGER NOT NULL DEFAULT 0;
UPDATE staff SET panel_watchdog = 1 WHERE id IN ('2022051052', '2018042451');  -- 윤종엽, 석현민

-- 가드 상태 3컬럼 (v1 의 watchdog_last_push_at 은 floor 설계와 함께 폐기됨)
ALTER TABLE panel_agent_status ADD COLUMN watchdog_pending_since TEXT;    -- 사유가 처음 붙은 시각 (CONFIRM 시계)
ALTER TABLE panel_agent_status ADD COLUMN watchdog_clear_since   TEXT;    -- 사유가 처음 사라진 시각 (CLEAR 시계)
ALTER TABLE panel_agent_status ADD COLUMN watchdog_push_fail_n   INTEGER; -- 연속 도달 0건 발송 시도 횟수
