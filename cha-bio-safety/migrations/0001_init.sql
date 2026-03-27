-- migrations/0001_init.sql
-- 차바이오컴플렉스 방재 시스템 초기 스키마
-- NOTE: Cloudflare D1은 PRAGMA를 마이그레이션에서 허용하지 않으므로 제거
--       journal_mode=WAL 은 D1이 자동 적용, foreign_keys는 Workers 코드에서 처리

-- ─── 직원 ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff (
  id         TEXT PRIMARY KEY,   -- 사번 (예: 2018042451)
  name       TEXT NOT NULL,
  role       TEXT NOT NULL CHECK(role IN ('admin','assistant')),
  title      TEXT NOT NULL,
  password_hash TEXT NOT NULL,   -- bcrypt hash
  shift_type TEXT CHECK(shift_type IN ('day','night','off')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── 점검 포인트 ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS check_points (
  id          TEXT PRIMARY KEY,
  qr_code     TEXT NOT NULL UNIQUE,
  floor       TEXT NOT NULL,
  zone        TEXT NOT NULL CHECK(zone IN ('office','research','common')),
  location    TEXT NOT NULL,
  category    TEXT NOT NULL,
  description TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── 점검 세션 ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inspection_sessions (
  id           TEXT PRIMARY KEY,
  date         TEXT NOT NULL,   -- YYYY-MM-DD
  staff_id     TEXT NOT NULL REFERENCES staff(id),
  floor        TEXT,
  zone         TEXT,
  completed_at TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── 점검 기록 ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS check_records (
  id            TEXT PRIMARY KEY,
  session_id    TEXT NOT NULL REFERENCES inspection_sessions(id),
  checkpoint_id TEXT NOT NULL REFERENCES check_points(id),
  staff_id      TEXT NOT NULL REFERENCES staff(id),
  result        TEXT NOT NULL CHECK(result IN ('normal','caution','bad','unresolved','missing')),
  memo          TEXT,
  photo_key     TEXT,           -- R2 object key
  checked_at    TEXT NOT NULL DEFAULT (datetime('now')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── 일정 ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedule_items (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  date        TEXT NOT NULL,   -- YYYY-MM-DD
  time        TEXT,            -- HH:MM
  assignee_id TEXT NOT NULL REFERENCES staff(id),
  category    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK(status IN ('pending','in_progress','done','overdue')),
  repeat_rule TEXT,            -- iCal RRULE 형식
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── DIV 압력 측정 ────────────────────────────────────
CREATE TABLE IF NOT EXISTS div_pressure_records (
  id          TEXT PRIMARY KEY,
  point_id    INTEGER NOT NULL CHECK(point_id BETWEEN 1 AND 34),
  point_name  TEXT NOT NULL,
  pressure    REAL NOT NULL,   -- MPa
  measured_at TEXT NOT NULL,
  staff_id    TEXT NOT NULL REFERENCES staff(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── 승강기 ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS elevators (
  id              TEXT PRIMARY KEY,
  number          INTEGER NOT NULL,
  type            TEXT NOT NULL CHECK(type IN ('passenger','cargo','dumbwaiter','escalator')),
  location        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'normal'
                  CHECK(status IN ('normal','fault','maintenance','out_of_service')),
  last_inspection TEXT,
  next_inspection TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── 인덱스 ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_check_records_session   ON check_records(session_id);
CREATE INDEX IF NOT EXISTS idx_check_records_date      ON check_records(checked_at);
CREATE INDEX IF NOT EXISTS idx_schedule_items_date     ON schedule_items(date);
CREATE INDEX IF NOT EXISTS idx_div_pressure_point      ON div_pressure_records(point_id, measured_at);
CREATE INDEX IF NOT EXISTS idx_inspection_sessions_date ON inspection_sessions(date, staff_id);
