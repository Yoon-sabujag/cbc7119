-- CCTV DVR 체크포인트 12개 추가 (B1F 방재센터)
INSERT INTO check_points (id, qr_code, floor, zone, category, location, location_no, description, is_active) VALUES
  (lower(hex(randomblob(8))), lower(hex(randomblob(8))), 'B1', 'common', 'CCTV', 'DVR 1번 (8F, 7F)',          'DVR-01', '16ch', 1),
  (lower(hex(randomblob(8))), lower(hex(randomblob(8))), 'B1', 'common', 'CCTV', 'DVR 2번 (6F, 5F)',          'DVR-02', '16ch', 1),
  (lower(hex(randomblob(8))), lower(hex(randomblob(8))), 'B1', 'common', 'CCTV', 'DVR 3번 (5F, 2F)',          'DVR-03', '16ch', 1),
  (lower(hex(randomblob(8))), lower(hex(randomblob(8))), 'B1', 'common', 'CCTV', 'DVR 4번 (3F)',              'DVR-04', '16ch', 1),
  (lower(hex(randomblob(8))), lower(hex(randomblob(8))), 'B1', 'common', 'CCTV', 'DVR 5번 (3F, 2F)',          'DVR-05', '14ch', 1),
  (lower(hex(randomblob(8))), lower(hex(randomblob(8))), 'B1', 'common', 'CCTV', 'DVR 6번 (1F, B1F)',         'DVR-06', '15ch', 1),
  (lower(hex(randomblob(8))), lower(hex(randomblob(8))), 'B1', 'common', 'CCTV', 'DVR 7번 (B1F, B2F)',        'DVR-07', '15ch', 1),
  (lower(hex(randomblob(8))), lower(hex(randomblob(8))), 'B1', 'common', 'CCTV', 'DVR 8번 (B2F~B4F)',         'DVR-08', '14ch', 1),
  (lower(hex(randomblob(8))), lower(hex(randomblob(8))), 'B1', 'common', 'CCTV', 'DVR 9번 (B3F 주차장)',       'DVR-09', '14ch', 1),
  (lower(hex(randomblob(8))), lower(hex(randomblob(8))), 'B1', 'common', 'CCTV', 'DVR 10번 (B4F 주차장)',      'DVR-10', '15ch', 1),
  (lower(hex(randomblob(8))), lower(hex(randomblob(8))), 'B1', 'common', 'CCTV', 'DVR 11번 (B5F 주차장)',      'DVR-11', '15ch', 1),
  (lower(hex(randomblob(8))), lower(hex(randomblob(8))), 'B1', 'common', 'CCTV', 'DVR 12번 (리서치프라자, 서버실)', 'DVR-12', '8ch',  1);
