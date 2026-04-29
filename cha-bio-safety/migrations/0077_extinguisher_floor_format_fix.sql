-- Migration 0077: extinguishers.floor 형식 통일
-- '01'~'08' (zero-padded) → '1F'~'8F' 로 정정해 floor_plan_markers.floor 와 일치시킨다.
-- 도면 페이지가 floor='1F' 로 extinguisherApi.list 호출 시 매치 0건 → cpIdToWarning 비어있어
-- 분말 소화기 연한 stroke 강조가 안 되던 버그 해결.
-- 4F 는 건물에 없음. 지하 B1~B5 는 이미 일치하여 정정 불필요.

UPDATE extinguishers SET floor = '1F' WHERE floor = '01';
UPDATE extinguishers SET floor = '2F' WHERE floor = '02';
UPDATE extinguishers SET floor = '3F' WHERE floor = '03';
UPDATE extinguishers SET floor = '5F' WHERE floor = '05';
UPDATE extinguishers SET floor = '6F' WHERE floor = '06';
UPDATE extinguishers SET floor = '7F' WHERE floor = '07';
UPDATE extinguishers SET floor = '8F' WHERE floor = '08';
