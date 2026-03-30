-- 화재/비화재보 수신반 이력 테이블
CREATE TABLE IF NOT EXISTS fire_alarm_records (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL CHECK(type IN ('fire','non_fire')),
  occurred_at TEXT NOT NULL,
  location    TEXT NOT NULL DEFAULT '',
  cause       TEXT NOT NULL DEFAULT '오작동',
  action      TEXT NOT NULL DEFAULT '자동복구, 현장확인',
  created_by  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_fire_alarm_occurred ON fire_alarm_records(occurred_at);
