-- 승강기 검사 기록에 인증서/리포트 첨부 컬럼 추가
ALTER TABLE elevator_inspections ADD COLUMN certificate_key TEXT;

-- 주간 식단 메뉴 테이블
CREATE TABLE IF NOT EXISTS weekly_menus (
  id          TEXT PRIMARY KEY,
  date        TEXT NOT NULL,        -- YYYY-MM-DD (해당 날짜)
  lunch_a     TEXT,                 -- 중식 A코너
  lunch_b     TEXT,                 -- 중식 B코너
  dinner      TEXT,                 -- 석식
  pdf_key     TEXT,                 -- R2 원본 PDF key
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by  TEXT
);

CREATE INDEX IF NOT EXISTS idx_weekly_menus_date ON weekly_menus(date);
