-- 공휴일 테이블 (공공데이터포털 API 연동)
CREATE TABLE IF NOT EXISTS holidays (
  date      TEXT PRIMARY KEY,  -- YYYY-MM-DD
  name      TEXT NOT NULL,     -- 삼일절, 설날 연휴, 대체공휴일 등
  is_holiday TEXT DEFAULT 'Y', -- Y/N (공공기관 휴일여부)
  created_at TEXT DEFAULT (datetime('now'))
);
