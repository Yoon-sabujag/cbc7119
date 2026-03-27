-- 0023: 체크포인트 zone 수정 및 청정소화약제 전기사무실 층 이동

-- ① 청정소화약제 전기사무실 B1F → B4F 이동
UPDATE check_points
SET floor='B4', location_no='B4F-2'
WHERE id='CP-B1F-3-CS';

-- ② 방화셔터 연구동 zone='research' 설정
UPDATE check_points SET zone='research' WHERE id IN (
  'CP-8F-1-FS',
  'CP-7F-1-FS','CP-7F-2-FS','CP-7F-3-FS','CP-7F-4-FS','CP-7F-5-FS','CP-7F-9-FS',
  'CP-6F-1-FS','CP-6F-2-FS','CP-6F-3-FS','CP-6F-4-FS',
  'CP-5F-1-FS','CP-5F-2-FS','CP-5F-3-FS','CP-5F-4-FS',
  'CP-3F-1-FS','CP-3F-2-FS','CP-3F-3-FS','CP-3F-4-FS',
  'CP-2F-1-FS','CP-2F-2-FS','CP-2F-3-FS',
  'CP-1F-1-FS','CP-1F-2-FS','CP-1F-3-FS','CP-1F-4-FS'
);

-- ③ 방화셔터 사무동 zone='office' 설정
UPDATE check_points SET zone='office' WHERE id IN (
  'CP-8F-3-FS',
  'CP-7F-10-FS','CP-7F-11-FS','CP-7F-12-FS',
  'CP-6F-5-FS','CP-6F-6-FS',
  'CP-5F-5-FS','CP-5F-6-FS','CP-5F-7-FS','CP-5F-8-FS',
  'CP-3F-5-FS','CP-3F-6-FS',
  'CP-2F-4-FS'
);

-- ④ 방화셔터 연구동 북측/동측 description 설정
UPDATE check_points SET description='북측' WHERE id IN (
  'CP-8F-1-FS',
  'CP-7F-1-FS','CP-7F-2-FS','CP-7F-3-FS',
  'CP-6F-1-FS','CP-6F-2-FS',
  'CP-5F-1-FS','CP-5F-2-FS',
  'CP-3F-1-FS','CP-3F-2-FS',
  'CP-2F-1-FS','CP-2F-2-FS','CP-2F-3-FS',
  'CP-1F-1-FS','CP-1F-2-FS','CP-1F-4-FS'
);
UPDATE check_points SET description='동측' WHERE id IN (
  'CP-7F-4-FS','CP-7F-5-FS','CP-7F-9-FS',
  'CP-6F-3-FS','CP-6F-4-FS',
  'CP-5F-3-FS','CP-5F-4-FS',
  'CP-3F-3-FS','CP-3F-4-FS',
  'CP-1F-3-FS'
);

-- ⑤ 완강기 사무동 zone='office' 설정
UPDATE check_points SET zone='office' WHERE id IN (
  'CP-8F-1-WK',
  'CP-7F-1-WK',
  'CP-6F-1-WK',
  'CP-5F-1-WK',
  'CP-3F-1-WK'
);

-- ⑥ 완강기 연구동 zone='research' 설정
UPDATE check_points SET zone='research' WHERE id IN (
  'CP-7F-2-WK','CP-7F-3-WK',
  'CP-6F-2-WK','CP-6F-3-WK',
  'CP-5F-2-WK','CP-5F-3-WK',
  'CP-3F-2-WK','CP-3F-3-WK'
);

-- ⑦ 청정소화약제 연구동(7F) zone='research' 설정
UPDATE check_points SET zone='research' WHERE id='CP-7F-1-CS';
