-- 컴프레셔 탱크 배수 기록 (DIV 배수와 별도)
CREATE TABLE IF NOT EXISTS comp_drain_log (
  id          TEXT PRIMARY KEY,
  div_id      TEXT NOT NULL,
  drained_at  TEXT NOT NULL,             -- YYYY-MM-DD
  note        TEXT,
  staff_name  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 컴프레셔 점검 기록
CREATE TABLE IF NOT EXISTS comp_inspections (
  id           TEXT PRIMARY KEY,
  div_id       TEXT NOT NULL,            -- DIV 측정점 ID (8-1, -5-3 등)
  floor        INTEGER NOT NULL,
  position     INTEGER NOT NULL,
  year         INTEGER NOT NULL,
  month        INTEGER NOT NULL,
  day          INTEGER,
  tank_drain   TEXT NOT NULL DEFAULT 'none',       -- 'none' | 'yes'
  oil          TEXT NOT NULL DEFAULT 'sufficient',  -- 'sufficient' | 'refill'
  result       TEXT NOT NULL DEFAULT 'normal',      -- 'normal' | 'caution' | 'bad'
  memo         TEXT,
  photo_key    TEXT,
  inspector    TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(div_id, year, month)
);

-- 컴프레셔 체크포인트 34개 (DIV와 동일 위치)
INSERT OR IGNORE INTO check_points (id, qr_code, floor, zone, location, category, description, location_no) VALUES
  ('CP-COMP-9-3',  'QR-COMP-9-3',  '8-1F', 'office',   '8-1층 컴프레셔 #3', '컴프레셔', '사) 8층 계단 위',     '9-3'),
  ('CP-COMP-8-1',  'QR-COMP-8-1',  '8F',   'research', '8층 컴프레셔 #1',   '컴프레셔', '연) 8층 공조실',      '8-1'),
  ('CP-COMP-8-2',  'QR-COMP-8-2',  '8F',   'research', '8층 컴프레셔 #2',   '컴프레셔', '연) 8층 PS실',        '8-2'),
  ('CP-COMP-8-3',  'QR-COMP-8-3',  '8F',   'office',   '8층 컴프레셔 #3',   '컴프레셔', '사) 8층 PS실',        '8-3'),
  ('CP-COMP-7-1',  'QR-COMP-7-1',  '7F',   'research', '7층 컴프레셔 #1',   '컴프레셔', '연) 7층 공조실',      '7-1'),
  ('CP-COMP-7-2',  'QR-COMP-7-2',  '7F',   'research', '7층 컴프레셔 #2',   '컴프레셔', '연) 7층 PS실',        '7-2'),
  ('CP-COMP-7-3',  'QR-COMP-7-3',  '7F',   'office',   '7층 컴프레셔 #3',   '컴프레셔', '사) 7층 PS실',        '7-3'),
  ('CP-COMP-6-1',  'QR-COMP-6-1',  '6F',   'research', '6층 컴프레셔 #1',   '컴프레셔', '연) 6층 공조실',      '6-1'),
  ('CP-COMP-6-2',  'QR-COMP-6-2',  '6F',   'research', '6층 컴프레셔 #2',   '컴프레셔', '연) 6층 PS실',        '6-2'),
  ('CP-COMP-6-3',  'QR-COMP-6-3',  '6F',   'office',   '6층 컴프레셔 #3',   '컴프레셔', '사) 6층 PS실',        '6-3'),
  ('CP-COMP-5-1',  'QR-COMP-5-1',  '5F',   'research', '5층 컴프레셔 #1',   '컴프레셔', '연) 5층 공조실',      '5-1'),
  ('CP-COMP-5-2',  'QR-COMP-5-2',  '5F',   'research', '5층 컴프레셔 #2',   '컴프레셔', '연) 5층 PS실',        '5-2'),
  ('CP-COMP-5-3',  'QR-COMP-5-3',  '5F',   'office',   '5층 컴프레셔 #3',   '컴프레셔', '사) 5층 PS실',        '5-3'),
  ('CP-COMP-3-1',  'QR-COMP-3-1',  '3F',   'research', '3층 컴프레셔 #1',   '컴프레셔', '연) 3층 공조실',      '3-1'),
  ('CP-COMP-3-2',  'QR-COMP-3-2',  '3F',   'research', '3층 컴프레셔 #2',   '컴프레셔', '연) 3층 PS실',        '3-2'),
  ('CP-COMP-3-3',  'QR-COMP-3-3',  '3F',   'office',   '3층 컴프레셔 #3',   '컴프레셔', '사) 3층 PS실',        '3-3'),
  ('CP-COMP-2-2',  'QR-COMP-2-2',  '2F',   'research', '2층 컴프레셔 #2',   '컴프레셔', '연) 2층 PS실',        '2-2'),
  ('CP-COMP-2-3',  'QR-COMP-2-3',  '2F',   'office',   '2층 컴프레셔 #3',   '컴프레셔', '사) 2층 PS실',        '2-3'),
  ('CP-COMP-1-1',  'QR-COMP-1-1',  '1F',   'research', '1층 컴프레셔 #1',   '컴프레셔', '연) 1층 공조실',      '1-1'),
  ('CP-COMP-1-2',  'QR-COMP-1-2',  '1F',   'research', '1층 컴프레셔 #2',   '컴프레셔', '연) 1층 PS실',        '1-2'),
  ('CP-COMP-1-3',  'QR-COMP-1-3',  '1F',   'office',   '1층 컴프레셔 #3',   '컴프레셔', '사) 1층 PS실',        '1-3'),
  ('CP-COMP--1-1', 'QR-COMP--1-1', 'B1',   'common',   'B1층 컴프레셔 #1',  '컴프레셔', '지) B1층 공조실',     '-1-1'),
  ('CP-COMP--1-2', 'QR-COMP--1-2', 'B1',   'common',   'B1층 컴프레셔 #2',  '컴프레셔', '지) B1층 화장실',     '-1-2'),
  ('CP-COMP--1-3', 'QR-COMP--1-3', 'B1',   'common',   'B1층 컴프레셔 #3',  '컴프레셔', '지) B1층 식당 뒤',   '-1-3'),
  ('CP-COMP--2-1', 'QR-COMP--2-1', 'B2',   'common',   'B2층 컴프레셔 #1',  '컴프레셔', '지) B2층 공조실',     '-2-1'),
  ('CP-COMP--2-2', 'QR-COMP--2-2', 'B2',   'common',   'B2층 컴프레셔 #2',  '컴프레셔', '지) B2층 CPX실',      '-2-2'),
  ('CP-COMP--2-3', 'QR-COMP--2-3', 'B2',   'common',   'B2층 컴프레셔 #3',  '컴프레셔', '지) B2층 PS실',       '-2-3'),
  ('CP-COMP--3-2', 'QR-COMP--3-2', 'B3',   'common',   'B3층 컴프레셔 #2',  '컴프레셔', '지) B3층 팬룸',       '-3-2'),
  ('CP-COMP--3-3', 'QR-COMP--3-3', 'B3',   'common',   'B3층 컴프레셔 #3',  '컴프레셔', '지) B3층 기사대기실', '-3-3'),
  ('CP-COMP--4-1', 'QR-COMP--4-1', 'B4',   'common',   'B4층 컴프레셔 #1',  '컴프레셔', '지) B4층 팬룸',       '-4-1'),
  ('CP-COMP--4-2', 'QR-COMP--4-2', 'B4',   'common',   'B4층 컴프레셔 #2',  '컴프레셔', '지) B4층 기계실',     '-4-2'),
  ('CP-COMP--4-3', 'QR-COMP--4-3', 'B4',   'common',   'B4층 컴프레셔 #3',  '컴프레셔', '지) B4층 창고',       '-4-3'),
  ('CP-COMP--5-2', 'QR-COMP--5-2', 'B5',   'common',   'B5층 컴프레셔 #2',  '컴프레셔', '지) B5층 2번팬룸',    '-5-2'),
  ('CP-COMP--5-3', 'QR-COMP--5-3', 'B5',   'common',   'B5층 컴프레셔 #3',  '컴프레셔', '지) B5층 1번팬룸',    '-5-3');
