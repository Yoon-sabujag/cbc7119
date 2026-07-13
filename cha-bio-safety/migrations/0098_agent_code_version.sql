-- 0098: 에이전트 v1.4.4 code_version (FEEDBACK-0328-WATCHDOG.md §5).
--
-- 왜: agent_version 은 config.env 에서 온다 = **거짓말을 할 수 있다.**
--     실제 사고(2026-07-14): 맥미니가 feature 브랜치에 머물러 옛 코드로 도는데
--     config.env 의 AGENT_VERSION 만 새 값이라, D1 에는 새 버전으로 보고되고 있었다.
--     원격 진단의 기준점이 거짓이면 나머지 계측이 전부 무의미하다.
--
--     → 에이전트는 CODE_VERSION 을 **코드 상수**로 박아 codeVersion 필드로 보낸다(config 로 못 덮어씀).
--       = 실제로 어느 빌드가 돌고 있는지의 유일한 증거.
--     → agent_version 과 **별도 컬럼**이어야 한다. 같은 칸에 덮어쓰면 어긋남을 영원히 못 본다.
--
-- 화면: code_version <> agent_version → 🔴 "배포 어긋남" (이 화면의 모든 판단을 의심할 것).
--       둘 중 하나라도 NULL = 구 에이전트(v1.4.3 이하) → 배지 없음. 초록 칠하기 금지.
--
-- 주의: ALTER TABLE ADD COLUMN 은 IF NOT EXISTS 를 지원하지 않는다 → 정확히 1회만 적용.
--       (0091~0097 과 동일한 `wrangler d1 execute --file` 수동 적용 관행)

ALTER TABLE agent_heartbeats   ADD COLUMN code_version TEXT;  -- 코드에 박힌 버전(시계열 — 언제 빌드가 바뀌었는지)
ALTER TABLE panel_agent_status ADD COLUMN code_version TEXT;  -- 코드에 박힌 버전(싱글턴 — 배지의 근거)
