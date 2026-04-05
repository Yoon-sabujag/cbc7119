-- 소화기 관리대장 상세 정보
CREATE TABLE IF NOT EXISTS extinguishers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  check_point_id TEXT NOT NULL REFERENCES check_points(id),
  seq_no        INTEGER,            -- 순번
  zone          TEXT,                -- 구역 (연, 차, 복 등)
  floor         TEXT,                -- 층
  mgmt_no       TEXT,                -- 관리번호 (연-08-01 등)
  location      TEXT,                -- 위치
  type          TEXT NOT NULL,       -- 종류 (분말, 할로겐, 이산화탄소, 강화액, K급 등)
  approval_no   TEXT,                -- 형식승인번호
  manufactured_at TEXT,              -- 제조년월 (YYYY-MM)
  manufacturer  TEXT,                -- 제조업체명
  prefix_code   TEXT,                -- 접두문자
  seal_no       TEXT,                -- 증지번호
  serial_no     TEXT,                -- 제조번호
  note          TEXT,                -- 비고 (연장횟수 등)
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_extinguishers_cp ON extinguishers(check_point_id);
CREATE INDEX idx_extinguishers_mgmt ON extinguishers(mgmt_no);
