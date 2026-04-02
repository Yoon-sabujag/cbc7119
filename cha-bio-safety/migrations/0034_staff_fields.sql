-- staff 테이블 확장 (Phase 7 관리자 설정 기능)
ALTER TABLE staff ADD COLUMN phone TEXT;
ALTER TABLE staff ADD COLUMN email TEXT;
ALTER TABLE staff ADD COLUMN appointed_at TEXT;
ALTER TABLE staff ADD COLUMN active INTEGER NOT NULL DEFAULT 1;
