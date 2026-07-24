-- 0100: 점검 내용 카드(증분 A) — 항목별(라인) 결과 + 조치 심볼 컬럼
-- line_results: JSON 배열 ["normal"|"caution"|"bad"|null, ...] 라인 인덱스순
-- remediation_symbol: 소화전/댐퍼 조치 exact-match 심볼 (증분 A 미사용, 후속 증분용 선반영)
-- 라이브 staging check_records 스키마에 두 컬럼 부재 확인됨. SQLite ADD COLUMN NOT NULL 불가 → nullable.
ALTER TABLE check_records ADD COLUMN line_results TEXT;
ALTER TABLE check_records ADD COLUMN remediation_symbol TEXT;
