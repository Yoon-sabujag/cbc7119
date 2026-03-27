-- 0013_photo_keys.sql
-- 세션 대표 사진 + 조치 완료 사진 컬럼 추가
ALTER TABLE inspection_sessions ADD COLUMN photo_key TEXT;
ALTER TABLE check_records ADD COLUMN resolution_photo_key TEXT;
