-- Phase 22: work_logs table — monthly work performance records (별지 제12서식)
CREATE TABLE IF NOT EXISTS work_logs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  year_month      TEXT NOT NULL UNIQUE,
  year            INTEGER NOT NULL,
  month           INTEGER NOT NULL,
  manager_name    TEXT NOT NULL DEFAULT '',
  fire_content    TEXT NOT NULL DEFAULT '',
  fire_result     TEXT NOT NULL DEFAULT 'ok',
  fire_action     TEXT NOT NULL DEFAULT '',
  escape_content  TEXT NOT NULL DEFAULT '',
  escape_result   TEXT NOT NULL DEFAULT 'ok',
  escape_action   TEXT NOT NULL DEFAULT '',
  gas_content     TEXT NOT NULL DEFAULT '',
  etc_content     TEXT NOT NULL DEFAULT '',
  updated_by      INTEGER NOT NULL REFERENCES staff(id),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
