-- 소화기 개소명에서 "[xxx] " 접두사 제거 (위치번호는 이미 location_no에 저장됨)
UPDATE check_points
SET location = SUBSTR(location, INSTR(location, '] ') + 2)
WHERE category = '소화기'
  AND location LIKE '[%] %';
