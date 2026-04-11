-- div_pressures 테이블에 월초/월말 구분 컬럼 추가
-- 'early' = 월초, 'late' = 월말
ALTER TABLE div_pressures ADD COLUMN timing TEXT DEFAULT 'early';

-- 기존 데이터는 기본값 'early'로 설정됨
-- 실제 월초/월말은 사용자가 점검 시 선택하도록 UI에서 처리
