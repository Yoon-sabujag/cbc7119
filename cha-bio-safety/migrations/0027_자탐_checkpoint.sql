-- 자동화재탐지설비 체크포인트 추가 (EXCEL-02 요구사항)
INSERT INTO check_points (id, qr_code, floor, zone, location, category, description, is_active) VALUES
('cp-fire-detect-01', 'QR-FIRE-DETECT-01', 'B1', 'common', '차바이오컴플렉스 전체', '자동화재탐지설비', '자동화재탐지설비 월간 점검', 1);
