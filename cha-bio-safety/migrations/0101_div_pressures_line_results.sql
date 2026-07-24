-- 0101: DIV 유수검지장치 점검 내용 카드(증분 E-2) — 항목별(라인) 결과
-- line_results: JSON 배열 ["normal"|"caution"|"bad", ...] 4원소
--   [0] 밸브(수동)  [1] 압력상태(detectDivTrend 자동판정)  [2] 압력스위치(수동)  [3] 청소(수동)
-- div_pressures 는 UNIQUE(year,month,timing,location_no) 라 이 컬럼은 native 하게 timing(월초/월말)별로 분리 저장됨.
--   → 엑셀(generateDivExcel)이 월초/월말 각각 ○/△/Ｘ 를, 카드 재방문이 현 timing 마크를 정확히 복원.
-- check_records(CP-DIV) 는 line_results 없이 worst result+memo 만(완료판정·재진입 팝업 마커 전용).
-- SQLite ADD COLUMN 은 NOT NULL 불가 → nullable. 레거시행 NULL = 엑셀 '○' 폴백(회귀 0).
ALTER TABLE div_pressures ADD COLUMN line_results TEXT;
