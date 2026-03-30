-- 일일업무일지 특이사항 테이블 (EXCEL-06 요구사항)
CREATE TABLE IF NOT EXISTS daily_notes (
  id          TEXT PRIMARY KEY,
  date        TEXT NOT NULL UNIQUE,
  content     TEXT NOT NULL DEFAULT '',
  created_by  TEXT NOT NULL REFERENCES staff(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_daily_notes_date ON daily_notes(date);
