-- 소화기 개소명 [xxx] 패턴에서 위치번호 추출하여 location_no에 저장
UPDATE check_points
SET location_no = SUBSTR(location, 2, INSTR(location, ']') - 2)
WHERE category = '소화기'
  AND location_no IS NULL
  AND location LIKE '[%]%';
