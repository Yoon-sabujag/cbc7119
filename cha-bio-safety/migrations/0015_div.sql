-- DIV (드라이 밸브) 압력 관리 3종

-- 1. 압력 측정 기록 (1차압 / 2차압 / 챔버압)
CREATE TABLE IF NOT EXISTS div_pressure_records (
  id               TEXT PRIMARY KEY,
  div_id           TEXT NOT NULL,         -- '8-1', '7-2', '-5-3' 등
  floor            INTEGER NOT NULL,      -- 층 숫자 (9=8-1층, -5=B5층)
  div_num          INTEGER NOT NULL,      -- DIV 그룹 1·2·3
  year             INTEGER NOT NULL,
  month            INTEGER NOT NULL,
  measured_date    TEXT NOT NULL,         -- YYYY-MM-DD (월말 기준)
  pressure_1       REAL,                  -- 1차압 (kgf/cm²)
  pressure_2       REAL,                  -- 2차압 (kgf/cm²)
  pressure_chamber REAL,                  -- 챔버압 (kgf/cm²)
  note             TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(div_id, year, month)
);

-- 2. DIV 배수 기록
CREATE TABLE IF NOT EXISTS div_drain_log (
  id          TEXT PRIMARY KEY,
  div_id      TEXT NOT NULL,
  drained_at  TEXT NOT NULL,             -- YYYY-MM-DD
  note        TEXT,
  staff_name  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. 컴프레셔 오일 보충 기록
CREATE TABLE IF NOT EXISTS div_compressor_log (
  id           TEXT PRIMARY KEY,
  div_id       TEXT NOT NULL,            -- 해당 DIV 그룹 또는 측정점 ID
  action       TEXT NOT NULL DEFAULT '오일보충', -- '오일보충' | '교체'
  action_at    TEXT NOT NULL,            -- YYYY-MM-DD
  note         TEXT,
  staff_name   TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
