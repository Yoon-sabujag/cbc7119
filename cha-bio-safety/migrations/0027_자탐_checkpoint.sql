-- 0027_자탐_checkpoint.sql
-- 자동화재탐지설비 체크포인트 추가 (EXCEL-02 요구사항)
-- 이 카테고리는 건물 전체를 단일 점검 대상으로 취급한다

INSERT INTO check_points (id, qr_code, floor, zone, location, category, description, is_active) VALUES
('cp-fire-detect-01', NULL, '전체', '전체', '차바이오컴플렉스', '자동화재탐지설비', '자동화재탐지설비 월간 점검', 1);
