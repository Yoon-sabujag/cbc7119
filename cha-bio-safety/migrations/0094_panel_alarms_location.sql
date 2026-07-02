-- 0094: panel_alarms.location 컬럼 — 설비/화재 팝업의 "발생 위치"(예: 'B1F(1계단전실) 배기댐퍼수동SW') 표시용.
-- 고장은 팝업에 위치 표기가 없음 → null → mapAlarm 이 '방재실 화재수신반'(LOCATION_LABEL) 기본값 사용.
-- 라이브 감지의 위치 자동추출(팝업 텍스트 OCR)은 후속 — 현재는 trigger body.location 으로만 채움(수동/데모).
ALTER TABLE panel_alarms ADD COLUMN location TEXT;
