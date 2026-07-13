-- 0097: 에이전트 v1.4.2 스위치 상태 (FEEDBACK-0328-WATCHDOG.md §5).
--
-- 왜: 기존 heartbeat 에는 에이전트의 **스위치 상태**를 보내는 필드가 없었다.
--     그래서 snapshot_ok=0 이 "스냅샷이 꺼져 있어서 0" 인지 "켜져 있는데 경보가 없어서 0" 인지
--     원격에서 구분할 수 없었다(확인하려면 맥미니 기동 로그를 봐야 했다).
--     = 이 프로젝트가 없애려던 바로 그 사각지대(캡처보드가 죽어도 화면은 초록이던 것과 같은 형태).
--
-- 주의: ALTER TABLE ADD COLUMN 은 IF NOT EXISTS 를 지원하지 않는다 → 정확히 1회만 적용.
--       (0091~0096 과 동일한 `wrangler d1 execute --file` 수동 적용 관행)

-- (1) 시계열 — 스위치가 언제 바뀌었는지 이력으로 남는다.
ALTER TABLE agent_heartbeats ADD COLUMN telemetry_on INTEGER;  -- 0|1|NULL. MONITOR_TELEMETRY 게이트 밖에서 항상 옴
ALTER TABLE agent_heartbeats ADD COLUMN backend_v2 INTEGER;    -- 0|1|NULL. C1 킬스위치
ALTER TABLE agent_heartbeats ADD COLUMN snapshot_on INTEGER;   -- 0|1|NULL. 종속식 반영된 '실제 동작' 값
ALTER TABLE agent_heartbeats ADD COLUMN cfg_json TEXT;         -- cfg 객체 원문(frameInterval/임계값 등)

-- (2) 싱글턴 — 화면 상단 스위치 배지의 근거.
ALTER TABLE panel_agent_status ADD COLUMN telemetry_on INTEGER;
ALTER TABLE panel_agent_status ADD COLUMN backend_v2 INTEGER;
ALTER TABLE panel_agent_status ADD COLUMN snapshot_on INTEGER;
ALTER TABLE panel_agent_status ADD COLUMN cfg_json TEXT;

-- ★ cfg 는 컬럼 8개로 쪼개지 않고 JSON 원문 1컬럼으로 둔다 —
--   설정 항목이 늘 때마다 마이그레이션이 필요해지는 것을 막는다(FEEDBACK §5 명시).
--
-- ★ 화면 규칙: 필드가 NULL 이면 **구 에이전트(v1.4.1 이하)** → 회색. 초록 칠하기 금지.
--   snapshot_ok=0 을 단독으로 초록 칠하지 말 것 — snapshot_on 을 함께 봐야 한다.
