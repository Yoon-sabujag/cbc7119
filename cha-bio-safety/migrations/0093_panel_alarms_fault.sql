-- 0093: panel_alarms.type CHECK 에 'fault'(고장) 추가 — 화재/설비에 이어 3번째 경보 케이스.
-- SQLite 는 CHECK 제약 ALTER 불가 → 테이블 재생성. panel_alarms 는 실 FOREIGN KEY 없음(draft_record_id 는 논리 참조).
-- 적용 시점 dormant(0행)이나 데이터 보존형(INSERT SELECT). DROP IF EXISTS _new 로 재실행 안전.
DROP TABLE IF EXISTS panel_alarms_new;
CREATE TABLE panel_alarms_new (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('fire','equip','fault')),
  status TEXT NOT NULL CHECK(status IN ('active','acked','cleared','suppressed')),
  detected_at TEXT NOT NULL,              -- KST 'YYYY-MM-DD HH:MM:SS'
  source TEXT CHECK(source IN ('visual','audio')),
  confidence REAL, red_ratio REAL, green_ratio REAL,
  snapshot_key TEXT,
  acked_by TEXT, acked_at TEXT,
  push_count INTEGER NOT NULL DEFAULT 0,
  next_push_at INTEGER,                   -- UTC epoch ms, null=완료
  cleared_at TEXT,
  cleared_reason TEXT CHECK(cleared_reason IN ('agent_reset','ack','maint','record_saved')),
  draft_record_id TEXT,                   -- 논리 FK fire_alarm_records.id (fire 자동초안)
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO panel_alarms_new SELECT * FROM panel_alarms;
DROP TABLE panel_alarms;
ALTER TABLE panel_alarms_new RENAME TO panel_alarms;
CREATE INDEX IF NOT EXISTS idx_panel_alarms_status ON panel_alarms(status);
CREATE INDEX IF NOT EXISTS idx_panel_alarms_detected ON panel_alarms(detected_at);
