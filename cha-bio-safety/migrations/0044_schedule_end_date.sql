-- schedule_items에 종료일 컬럼 추가 (법적점검 등 다일간 일정)
ALTER TABLE schedule_items ADD COLUMN end_date TEXT;
