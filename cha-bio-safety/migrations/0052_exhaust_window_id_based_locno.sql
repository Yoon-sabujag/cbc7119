-- 배연창 위치번호를 id에서 "CP-" 이후 글자로 통일
UPDATE check_points SET location_no = SUBSTR(id, 4)
WHERE category = '배연창' AND id LIKE 'CP-%';
