-- 배연창 위치번호 업데이트: 구역-층-방향
-- 사무동: 사-{층번호}
UPDATE check_points SET location_no = '사-' || REPLACE(floor, 'F', '')
WHERE category = '배연창' AND location = '사무동';

-- 연구동 동측: 연-{층번호}-E
UPDATE check_points SET location_no = '연-' || REPLACE(floor, 'F', '') || '-E'
WHERE category = '배연창' AND location = '연구동 동측';

-- 연구동 북측: 연-{층번호}-N
UPDATE check_points SET location_no = '연-' || REPLACE(floor, 'F', '') || '-N'
WHERE category = '배연창' AND location = '연구동 북측';
