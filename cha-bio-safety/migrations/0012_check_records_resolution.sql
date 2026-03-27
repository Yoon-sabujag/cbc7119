-- 0012_check_records_resolution.sql
-- check_records 테이블에 조치 관련 컬럼 추가
ALTER TABLE check_records ADD COLUMN status TEXT NOT NULL DEFAULT 'open';
ALTER TABLE check_records ADD COLUMN resolution_memo TEXT;
ALTER TABLE check_records ADD COLUMN resolved_at TEXT;
ALTER TABLE check_records ADD COLUMN resolved_by TEXT;

-- 기존 'bad'/'unresolved' 기록은 status='open' (DEFAULT가 처리)
-- 인덱스: 미조치 항목 빠른 조회용
CREATE INDEX IF NOT EXISTS idx_check_records_status ON check_records(result, status);
