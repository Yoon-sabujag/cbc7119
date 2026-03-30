-- inspection_category, memo 컬럼 마이그레이션 추적
-- 이 컬럼들은 프로덕션 D1에 이미 수동으로 추가되어 있음.
-- 버전 관리 목적으로 마이그레이션에 등록.
-- D1이 "duplicate column name" 오류를 반환하는 경우 해당 컬럼이 이미 존재하는 것으로 무시 가능.
ALTER TABLE schedule_items ADD COLUMN inspection_category TEXT;
ALTER TABLE schedule_items ADD COLUMN memo TEXT;
