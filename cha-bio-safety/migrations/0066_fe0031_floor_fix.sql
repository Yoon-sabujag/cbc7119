-- FE-0031 (사-08-12 체력단련실) 층을 8F → 8-1F로 수정
UPDATE fire_extinguishers SET floor = '8-1F' WHERE id = 'FE-0031';
UPDATE check_points        SET floor = '8-1F' WHERE id = 'CP-FE-0031';
