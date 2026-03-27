-- 0022_checkpoint_individual.sql
-- 청정소화약제·완강기·전실제연댐퍼·방화셔터 체크포인트 개소별 세분화
-- 기존 층별 체크포인트는 비활성화하고 개소별 신규 데이터 INSERT

UPDATE check_points SET is_active=0 WHERE category='청정소화약제';
UPDATE check_points SET is_active=0 WHERE category='완강기';
UPDATE check_points SET is_active=0 WHERE category='전실제연댐퍼';
UPDATE check_points SET is_active=0 WHERE category='방화셔터';

-- ── 청정소화약제 (5개소) ─────────────────────────────────
-- 원본 엑셀: QR CODE 점검 항목.xlsx / 청정소화약제 설비 시트
-- 주의: B1F-2가 원본에 2회 등장 → 전기사무실을 B1F-3으로 재번호
INSERT INTO check_points (id, qr_code, category, location_no, location, floor, zone, is_active, created_at) VALUES
  ('CP-7F-1-CS',  'CP-7F-1-CS',  '청정소화약제', '7F-1',  '가스소화약제실', '7F', 'common', 1, datetime('now')),
  ('CP-B1F-1-CS', 'CP-B1F-1-CS', '청정소화약제', 'B1F-1', '서버실',        'B1', 'common', 1, datetime('now')),
  ('CP-B1F-2-CS', 'CP-B1F-2-CS', '청정소화약제', 'B1F-2', '방재실',        'B1', 'common', 1, datetime('now')),
  ('CP-B1F-3-CS', 'CP-B1F-3-CS', '청정소화약제', 'B1F-3', '전기사무실',    'B1', 'common', 1, datetime('now')),
  ('CP-B4F-1-CS', 'CP-B4F-1-CS', '청정소화약제', 'B4F-1', '가스소화약제실', 'B4', 'common', 1, datetime('now'));

-- ── 완강기 (13개소) ──────────────────────────────────────
-- 접근불가 9개소: description='접근불가' → QR 스캔 시 자동 정상처리
INSERT INTO check_points (id, qr_code, category, location_no, location, floor, zone, description, is_active, created_at) VALUES
  ('CP-8F-1-WK', 'CP-8F-1-WK', '완강기', '8F-1', '수영장',      '8F', 'common', NULL,    1, datetime('now')),
  ('CP-7F-1-WK', 'CP-7F-1-WK', '완강기', '7F-1', '754호실',     '7F', 'common', '접근불가', 1, datetime('now')),
  ('CP-7F-2-WK', 'CP-7F-2-WK', '완강기', '7F-2', '530호실',     '7F', 'common', '접근불가', 1, datetime('now')),
  ('CP-7F-3-WK', 'CP-7F-3-WK', '완강기', '7F-3', '531호실',     '7F', 'common', '접근불가', 1, datetime('now')),
  ('CP-6F-1-WK', 'CP-6F-1-WK', '완강기', '6F-1', '남측 사무실 내', '6F', 'common', NULL, 1, datetime('now')),
  ('CP-6F-2-WK', 'CP-6F-2-WK', '완강기', '6F-2', '629호실',     '6F', 'common', '접근불가', 1, datetime('now')),
  ('CP-6F-3-WK', 'CP-6F-3-WK', '완강기', '6F-3', '631호실',     '6F', 'common', '접근불가', 1, datetime('now')),
  ('CP-5F-1-WK', 'CP-5F-1-WK', '완강기', '5F-1', '집무실 앞',   '5F', 'common', NULL,    1, datetime('now')),
  ('CP-5F-2-WK', 'CP-5F-2-WK', '완강기', '5F-2', '530호실',     '5F', 'common', '접근불가', 1, datetime('now')),
  ('CP-5F-3-WK', 'CP-5F-3-WK', '완강기', '5F-3', '531호실',     '5F', 'common', '접근불가', 1, datetime('now')),
  ('CP-3F-1-WK', 'CP-3F-1-WK', '완강기', '3F-1', '33회의실 앞', '3F', 'common', NULL,    1, datetime('now')),
  ('CP-3F-2-WK', 'CP-3F-2-WK', '완강기', '3F-2', '329호실',     '3F', 'common', '접근불가', 1, datetime('now')),
  ('CP-3F-3-WK', 'CP-3F-3-WK', '완강기', '3F-3', '331호실',     '3F', 'common', '접근불가', 1, datetime('now'));

-- ── 전실제연댐퍼 (17개소) ────────────────────────────────
-- 개소번호 = 층-계단전실번호
INSERT INTO check_points (id, qr_code, category, location_no, location, floor, zone, is_active, created_at) VALUES
  ('CP-1F-5-JD',  'CP-1F-5-JD',  '전실제연댐퍼', '1F-5',  '계단전실 5', '1F', 'common', 1, datetime('now')),
  ('CP-1F-4-JD',  'CP-1F-4-JD',  '전실제연댐퍼', '1F-4',  '계단전실 4', '1F', 'common', 1, datetime('now')),
  ('CP-B1F-5-JD', 'CP-B1F-5-JD', '전실제연댐퍼', 'B1F-5', '계단전실 5', 'B1', 'common', 1, datetime('now')),
  ('CP-B1F-4-JD', 'CP-B1F-4-JD', '전실제연댐퍼', 'B1F-4', '계단전실 4', 'B1', 'common', 1, datetime('now')),
  ('CP-B1F-3-JD', 'CP-B1F-3-JD', '전실제연댐퍼', 'B1F-3', '계단전실 3', 'B1', 'common', 1, datetime('now')),
  ('CP-B1F-2-JD', 'CP-B1F-2-JD', '전실제연댐퍼', 'B1F-2', '계단전실 2', 'B1', 'common', 1, datetime('now')),
  ('CP-B2F-5-JD', 'CP-B2F-5-JD', '전실제연댐퍼', 'B2F-5', '계단전실 5', 'B2', 'common', 1, datetime('now')),
  ('CP-B2F-4-JD', 'CP-B2F-4-JD', '전실제연댐퍼', 'B2F-4', '계단전실 4', 'B2', 'common', 1, datetime('now')),
  ('CP-B2F-2-JD', 'CP-B2F-2-JD', '전실제연댐퍼', 'B2F-2', '계단전실 2', 'B2', 'common', 1, datetime('now')),
  ('CP-B3F-5-JD', 'CP-B3F-5-JD', '전실제연댐퍼', 'B3F-5', '계단전실 5', 'B3', 'common', 1, datetime('now')),
  ('CP-B3F-4-JD', 'CP-B3F-4-JD', '전실제연댐퍼', 'B3F-4', '계단전실 4', 'B3', 'common', 1, datetime('now')),
  ('CP-B3F-2-JD', 'CP-B3F-2-JD', '전실제연댐퍼', 'B3F-2', '계단전실 2', 'B3', 'common', 1, datetime('now')),
  ('CP-B4F-5-JD', 'CP-B4F-5-JD', '전실제연댐퍼', 'B4F-5', '계단전실 5', 'B4', 'common', 1, datetime('now')),
  ('CP-B4F-4-JD', 'CP-B4F-4-JD', '전실제연댐퍼', 'B4F-4', '계단전실 4', 'B4', 'common', 1, datetime('now')),
  ('CP-B4F-2-JD', 'CP-B4F-2-JD', '전실제연댐퍼', 'B4F-2', '계단전실 2', 'B4', 'common', 1, datetime('now')),
  ('CP-B5F-4-JD', 'CP-B5F-4-JD', '전실제연댐퍼', 'B5F-4', '계단전실 4', 'B5', 'common', 1, datetime('now')),
  ('CP-B5F-2-JD', 'CP-B5F-2-JD', '전실제연댐퍼', 'B5F-2', '계단전실 2', 'B5', 'common', 1, datetime('now'));

-- ── 방화셔터 (52개소) ────────────────────────────────────
INSERT INTO check_points (id, qr_code, category, location_no, location, floor, zone, is_active, created_at) VALUES
  ('CP-8F-1-FS',  'CP-8F-1-FS',  '방화셔터', '8F-1',  '투명 E/V 앞',      '8F', 'common', 1, datetime('now')),
  ('CP-8F-3-FS',  'CP-8F-3-FS',  '방화셔터', '8F-3',  '게스트 하우스 입구', '8F', 'common', 1, datetime('now')),
  ('CP-7F-1-FS',  'CP-7F-1-FS',  '방화셔터', '7F-1',  '투명 E/V 앞',      '7F', 'common', 1, datetime('now')),
  ('CP-7F-2-FS',  'CP-7F-2-FS',  '방화셔터', '7F-2',  '연구실 복도',       '7F', 'common', 1, datetime('now')),
  ('CP-7F-3-FS',  'CP-7F-3-FS',  '방화셔터', '7F-3',  '연구실 안',         '7F', 'common', 1, datetime('now')),
  ('CP-7F-4-FS',  'CP-7F-4-FS',  '방화셔터', '7F-4',  '로비',              '7F', 'common', 1, datetime('now')),
  ('CP-7F-5-FS',  'CP-7F-5-FS',  '방화셔터', '7F-5',  '연구실 안',         '7F', 'common', 1, datetime('now')),
  ('CP-7F-9-FS',  'CP-7F-9-FS',  '방화셔터', '7F-9',  '복도 끝',           '7F', 'common', 1, datetime('now')),
  ('CP-7F-10-FS', 'CP-7F-10-FS', '방화셔터', '7F-10', '공정실',            '7F', 'common', 1, datetime('now')),
  ('CP-7F-11-FS', 'CP-7F-11-FS', '방화셔터', '7F-11', '화장실 앞 계단',    '7F', 'common', 1, datetime('now')),
  ('CP-7F-12-FS', 'CP-7F-12-FS', '방화셔터', '7F-12', '브릿지',            '7F', 'common', 1, datetime('now')),
  ('CP-6F-1-FS',  'CP-6F-1-FS',  '방화셔터', '6F-1',  '투명 E/V 앞',      '6F', 'common', 1, datetime('now')),
  ('CP-6F-2-FS',  'CP-6F-2-FS',  '방화셔터', '6F-2',  '연구실 복도',       '6F', 'common', 1, datetime('now')),
  ('CP-6F-3-FS',  'CP-6F-3-FS',  '방화셔터', '6F-3',  '로비',              '6F', 'common', 1, datetime('now')),
  ('CP-6F-4-FS',  'CP-6F-4-FS',  '방화셔터', '6F-4',  '복도끝',            '6F', 'common', 1, datetime('now')),
  ('CP-6F-5-FS',  'CP-6F-5-FS',  '방화셔터', '6F-5',  '화장실 앞 계단',    '6F', 'common', 1, datetime('now')),
  ('CP-6F-6-FS',  'CP-6F-6-FS',  '방화셔터', '6F-6',  '브릿지',            '6F', 'common', 1, datetime('now')),
  ('CP-5F-1-FS',  'CP-5F-1-FS',  '방화셔터', '5F-1',  '투명 E/V 앞',      '5F', 'common', 1, datetime('now')),
  ('CP-5F-2-FS',  'CP-5F-2-FS',  '방화셔터', '5F-2',  '연구실 복도',       '5F', 'common', 1, datetime('now')),
  ('CP-5F-3-FS',  'CP-5F-3-FS',  '방화셔터', '5F-3',  '로비',              '5F', 'common', 1, datetime('now')),
  ('CP-5F-4-FS',  'CP-5F-4-FS',  '방화셔터', '5F-4',  '복도끝',            '5F', 'common', 1, datetime('now')),
  ('CP-5F-5-FS',  'CP-5F-5-FS',  '방화셔터', '5F-5',  '화장실 앞 계단',    '5F', 'common', 1, datetime('now')),
  ('CP-5F-6-FS',  'CP-5F-6-FS',  '방화셔터', '5F-6',  '브릿지',            '5F', 'common', 1, datetime('now')),
  ('CP-5F-7-FS',  'CP-5F-7-FS',  '방화셔터', '5F-7',  '집무실 앞',         '5F', 'common', 1, datetime('now')),
  ('CP-5F-8-FS',  'CP-5F-8-FS',  '방화셔터', '5F-8',  '회의실 안',         '5F', 'common', 1, datetime('now')),
  ('CP-3F-1-FS',  'CP-3F-1-FS',  '방화셔터', '3F-1',  '투명 E/V 앞',      '3F', 'common', 1, datetime('now')),
  ('CP-3F-2-FS',  'CP-3F-2-FS',  '방화셔터', '3F-2',  '연구실 복도',       '3F', 'common', 1, datetime('now')),
  ('CP-3F-3-FS',  'CP-3F-3-FS',  '방화셔터', '3F-3',  '로비',              '3F', 'common', 1, datetime('now')),
  ('CP-3F-4-FS',  'CP-3F-4-FS',  '방화셔터', '3F-4',  '복도끝',            '3F', 'common', 1, datetime('now')),
  ('CP-3F-5-FS',  'CP-3F-5-FS',  '방화셔터', '3F-5',  '화장실 앞 계단',    '3F', 'common', 1, datetime('now')),
  ('CP-3F-6-FS',  'CP-3F-6-FS',  '방화셔터', '3F-6',  '브릿지',            '3F', 'common', 1, datetime('now')),
  ('CP-2F-1-FS',  'CP-2F-1-FS',  '방화셔터', '2F-1',  '투명 E/V 앞',      '2F', 'common', 1, datetime('now')),
  ('CP-2F-2-FS',  'CP-2F-2-FS',  '방화셔터', '2F-2',  '게이트 앞',         '2F', 'common', 1, datetime('now')),
  ('CP-2F-3-FS',  'CP-2F-3-FS',  '방화셔터', '2F-3',  '홍보관 앞',         '2F', 'common', 1, datetime('now')),
  ('CP-2F-4-FS',  'CP-2F-4-FS',  '방화셔터', '2F-4',  '화장실 앞 계단',    '2F', 'common', 1, datetime('now')),
  ('CP-1F-1-FS',  'CP-1F-1-FS',  '방화셔터', '1F-1',  '투명 E/V 앞',      '1F', 'common', 1, datetime('now')),
  ('CP-1F-2-FS',  'CP-1F-2-FS',  '방화셔터', '1F-2',  '제대혈 복도',       '1F', 'common', 1, datetime('now')),
  ('CP-1F-3-FS',  'CP-1F-3-FS',  '방화셔터', '1F-3',  '로비',              '1F', 'common', 1, datetime('now')),
  ('CP-1F-4-FS',  'CP-1F-4-FS',  '방화셔터', '1F-4',  '제대혈 탱크실 안',  '1F', 'common', 1, datetime('now')),
  ('CP-B1F-1-FS', 'CP-B1F-1-FS', '방화셔터', 'B1F-1', '투명 E/V 앞',      'B1', 'common', 1, datetime('now')),
  ('CP-B1F-2-FS', 'CP-B1F-2-FS', '방화셔터', 'B1F-2', '에스컬레이터 주변', 'B1', 'common', 1, datetime('now')),
  ('CP-B2F-1-FS', 'CP-B2F-1-FS', '방화셔터', 'B2F-1', '투명 E/V 앞',      'B2', 'common', 1, datetime('now')),
  ('CP-B2F-2-FS', 'CP-B2F-2-FS', '방화셔터', 'B2F-2', '리서치홀 주변',     'B2', 'common', 1, datetime('now')),
  ('CP-B2F-3-FS', 'CP-B2F-3-FS', '방화셔터', 'B2F-3', '대학사무실 앞',     'B2', 'common', 1, datetime('now')),
  ('CP-B2F-4-FS', 'CP-B2F-4-FS', '방화셔터', 'B2F-4', '휴게실 벽',         'B2', 'common', 1, datetime('now')),
  ('CP-B2F-5-FS', 'CP-B2F-5-FS', '방화셔터', 'B2F-5', '남문 쪽 계단',      'B2', 'common', 1, datetime('now')),
  ('CP-B3F-1-FS', 'CP-B3F-1-FS', '방화셔터', 'B3F-1', '램프',              'B3', 'common', 1, datetime('now')),
  ('CP-B3F-2-FS', 'CP-B3F-2-FS', '방화셔터', 'B3F-2', '투명 E/V 앞',      'B3', 'common', 1, datetime('now')),
  ('CP-B4F-1-FS', 'CP-B4F-1-FS', '방화셔터', 'B4F-1', '램프',              'B4', 'common', 1, datetime('now')),
  ('CP-B4F-2-FS', 'CP-B4F-2-FS', '방화셔터', 'B4F-2', '투명 E/V 앞',      'B4', 'common', 1, datetime('now')),
  ('CP-B5F-1-FS', 'CP-B5F-1-FS', '방화셔터', 'B5F-1', '램프',              'B5', 'common', 1, datetime('now')),
  ('CP-B5F-2-FS', 'CP-B5F-2-FS', '방화셔터', 'B5F-2', '투명 E/V 앞',      'B5', 'common', 1, datetime('now'));
