-- CCTV DVR 13번 추가 (국제회의실, 대강당)
INSERT INTO check_points (id, qr_code, floor, zone, category, location, location_no, description, is_active) VALUES
  (lower(hex(randomblob(8))), lower(hex(randomblob(8))), 'B1', 'common', 'CCTV', 'DVR 13번 (국제회의실, 대강당)', 'DVR-13', '7ch', 1);
