-- 0096: 화재수신반 에이전트 원격 모니터링 텔레메트리.
-- 계약 SSOT: panel-agent/MONITORING-SPEC.md §4 (개정본 — matcher_loaded/snapshot_ok 포함)
-- 원칙: 컬럼 추가만. 기존 컬럼/CHECK/인덱스 변경 없음. 롤백하지 않는다(추가는 무해, DROP 이 위험).
-- 주의: SQLite/D1 의 ALTER TABLE ADD COLUMN 은 IF NOT EXISTS 를 지원하지 않는다 →
--       이 파일은 정확히 1회만 적용한다. 재실행하면 'duplicate column name' 으로 실패한다.
--       (0091~0095 와 동일한 `wrangler d1 execute --file` 수동 적용 관행)

-- ─────────────────────────────────────────────────────────────
-- (1) agent_heartbeats: append-only 시계열.
--     이력·가동률·재시작 탐지의 유일한 근거.
--     (0092 의 panel_agent_status 는 id='agent' 싱글턴 UPDATE 라 시계열이 원리적으로 불가능하다.)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_heartbeats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL,                  -- KST 'YYYY-MM-DD HH:MM:SS' (payload.at, 없으면 서버 수신시각)
  received_at TEXT NOT NULL,         -- 서버 수신 KST (에이전트 시계 왜곡 교차검증용)
  agent_version TEXT,
  detect_mode TEXT,                  -- off|dryrun|live  ※ 서버는 검증하지 않는다(S7)
  uptime_sec INTEGER,                -- 즉시값. 감소 = 재시작
  frame_ts TEXT,                     -- 마지막 업로드 라이브 프레임 ts (구 에이전트도 이미 보냄 — 지금까지 서버가 버렸다)
  frame_captured_at TEXT,            -- 마지막 프레임이 ffmpeg 리더에 도착한 시각
  frame_lag_ms INTEGER,              -- 즉시값: 업로드시각 - 캡처시각
  frame_lag_max_ms INTEGER,          -- ★ S1. 직전 heartbeat 이후 구간의 lag 최댓값
                                     --   (80초 스파이크는 즉시값으로는 22회 중 1회만 잡힌다)
  frame_starved_sec INTEGER,         -- 즉시값: 새 프레임 없이 경과한 초 (null=판정 보류, M1)
  analyze_ok INTEGER, analyze_fail INTEGER,                  -- 누적(기동 이후 monotonic)
  last_detect_ok_at TEXT,
  upload_ok INTEGER, upload_fail INTEGER,                    -- 누적. ★ 라이브 프레임(latest) 경로 한정(§3.1.1)
  http_401 INTEGER, http_403 INTEGER, http_5xx INTEGER, http_other INTEGER,  -- 누적. 라이브 경로 한정
  snapshot_ok INTEGER,               -- ★ B2. 누적. 경보 스냅샷 업로드 성공.
                                     --   이게 없으면 snapshot_fail=0 이 '시도 없음'인지 '전부 성공'인지 구분 불가.
  snapshot_fail INTEGER,             -- 누적. 경보 스냅샷 업로드 실패(라이브와 분리 계상)
  ocr_ok INTEGER, ocr_fail INTEGER,                          -- 누적
  r_avg REAL, r_max REAL, g_avg REAL, g_max REAL, y_avg REAL, y_max REAL,    -- 롤링 색비율(%, 0..100). 전부 NULL 가능(S4)
  matcher_loaded INTEGER,            -- 0|1|NULL
  raw TEXT                           -- payload 원문 JSON (스키마보다 앞선 신규 필드 유실 방지)
);
CREATE INDEX IF NOT EXISTS idx_agent_hb_at ON agent_heartbeats(at DESC);

-- ─────────────────────────────────────────────────────────────
-- (2) panel_alarms 증거 컬럼 — "왜 그 판정이었나 / 왜 위치가 비었나".
--     ⚠ 0093 이 panel_alarms 를 INSERT SELECT * 로 재생성한 전례가 있다.
--        재생성형 마이그레이션을 또 쓴다면 SELECT * 금지, 컬럼명을 전부 명시할 것.
--     ※ 기존 confidence(색 신뢰도 0..1 실수)와 ocr_confidence(문자열)는 다른 것이다. 혼동 금지.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE panel_alarms ADD COLUMN yellow_ratio REAL;   -- 0..1 (fault 판정 근거. red/green 은 0092 에 이미 있음)
ALTER TABLE panel_alarms ADD COLUMN ocr_raw TEXT;        -- OCR 원문(최고점 후보)
ALTER TABLE panel_alarms ADD COLUMN ocr_score REAL;      -- 0..100 퍼지 점수. legacy 폴백이면 NULL (0 아님 — S6)
ALTER TABLE panel_alarms ADD COLUMN ocr_confidence TEXT; -- high|low|none
ALTER TABLE panel_alarms ADD COLUMN ocr_method TEXT;     -- exact|prefix|fuzzy|legacy|empty (S6)
ALTER TABLE panel_alarms ADD COLUMN ocr_ms INTEGER;      -- OCR 총 소요 ms (Vision 콜드~6000/웜~2700 회귀 감시)
ALTER TABLE panel_alarms ADD COLUMN ocr_lines TEXT;      -- JSON 고정형: {"badge":["..."],"wide":["..."]}  (§4.1/S5)

-- ─────────────────────────────────────────────────────────────
-- (3) panel_agent_status 싱글턴 — 최신 스냅샷(대시보드 1회 조회용). 이력은 (1) 이 담당.
--     ★ 8개 전부 필수. 특히 matcher_loaded 를 빼지 마라(B1) — heartbeat.ts 의 싱글턴 UPDATE 가 쓴다.
--       빠뜨리면 UPDATE 가 D1 에러 → (독립 try/catch 가 없다면) INSERT 까지 죽고 200 OK 가 나가
--       agent_heartbeats 가 영원히 0행이 된다. 그 구조적 방어가 heartbeat.ts 의 독립 try/catch(S10).
-- ─────────────────────────────────────────────────────────────
ALTER TABLE panel_agent_status ADD COLUMN frame_captured_at TEXT;
ALTER TABLE panel_agent_status ADD COLUMN frame_lag_ms INTEGER;
ALTER TABLE panel_agent_status ADD COLUMN frame_lag_max_ms INTEGER;   -- ★ S1
ALTER TABLE panel_agent_status ADD COLUMN frame_starved_sec INTEGER;
ALTER TABLE panel_agent_status ADD COLUMN last_detect_ok_at TEXT;
ALTER TABLE panel_agent_status ADD COLUMN uptime_sec INTEGER;
ALTER TABLE panel_agent_status ADD COLUMN detect_mode TEXT;
ALTER TABLE panel_agent_status ADD COLUMN matcher_loaded INTEGER;     -- ★ B1. 0|1|NULL
