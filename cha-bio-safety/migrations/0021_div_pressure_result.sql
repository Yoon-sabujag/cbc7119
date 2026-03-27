-- div_pressures 테이블에 점검 결과 및 부가 기록 컬럼 추가
ALTER TABLE div_pressures ADD COLUMN result    TEXT DEFAULT 'normal';
ALTER TABLE div_pressures ADD COLUMN drain     TEXT DEFAULT 'none';
ALTER TABLE div_pressures ADD COLUMN oil       TEXT DEFAULT 'sufficient';
ALTER TABLE div_pressures ADD COLUMN memo      TEXT;
ALTER TABLE div_pressures ADD COLUMN photo_key TEXT;
