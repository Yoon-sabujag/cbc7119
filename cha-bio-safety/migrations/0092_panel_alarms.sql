-- 화재수신반 원격감시·경보 (Option B: DO/cron 없음 — 에이전트-티커 + 온디맨드 점검모드)
-- 모두 IF NOT EXISTS / OR IGNORE → 재적용 안전 (batch 비원자여도 CREATE/INSERT 전용).

-- panel_alarms: 경보 레코드 겸 이벤트 로그
CREATE TABLE IF NOT EXISTS panel_alarms (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('fire','equip')),
  status TEXT NOT NULL CHECK(status IN ('active','acked','cleared','suppressed')),
  detected_at TEXT NOT NULL,              -- KST 'YYYY-MM-DD HH:MM:SS'
  source TEXT CHECK(source IN ('visual','audio')),
  confidence REAL, red_ratio REAL, green_ratio REAL,
  snapshot_key TEXT,
  acked_by TEXT, acked_at TEXT,
  push_count INTEGER NOT NULL DEFAULT 0,
  next_push_at INTEGER,                   -- UTC epoch ms, null=완료 (에이전트-티커가 이걸로 20초 간격 판정)
  cleared_at TEXT,
  cleared_reason TEXT CHECK(cleared_reason IN ('agent_reset','ack','maint','record_saved')),
  draft_record_id TEXT,                   -- FK fire_alarm_records.id (fire 자동초안)
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_panel_alarms_status ON panel_alarms(status);
CREATE INDEX IF NOT EXISTS idx_panel_alarms_detected ON panel_alarms(detected_at);

-- panel_agent_status: 에이전트 연결/프레임 상태 싱글턴 (연결감시 축소 — status 조회에 lastSeenAt 노출)
CREATE TABLE IF NOT EXISTS panel_agent_status (
  id TEXT PRIMARY KEY DEFAULT 'agent',
  last_seen_at TEXT, frame_updated_at TEXT, agent_version TEXT,
  watchdog_notified_at TEXT               -- 중복 '중단' push 억제용 (프로액티브 push 는 prod cbc-cron-worker 이연)
);
INSERT OR IGNORE INTO panel_agent_status (id) VALUES ('agent');

-- panel_maint_mode: 점검모드 수동 override 만 저장 (자동은 computeMaint 온디맨드 계산 — cron 없음)
CREATE TABLE IF NOT EXISTS panel_maint_mode (
  id TEXT PRIMARY KEY DEFAULT 'maint',
  enabled INTEGER NOT NULL DEFAULT 0,
  source TEXT, reason TEXT, auto_off_at TEXT,
  turned_on_at TEXT, turned_on_by TEXT, updated_at TEXT
);
INSERT OR IGNORE INTO panel_maint_mode (id) VALUES ('maint');
