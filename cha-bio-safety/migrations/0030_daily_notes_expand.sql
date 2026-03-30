-- daily_notes에 금일업무/명일업무 텍스트 + 자동저장 플래그 추가
ALTER TABLE daily_notes ADD COLUMN today_text TEXT;
ALTER TABLE daily_notes ADD COLUMN tomorrow_text TEXT;
ALTER TABLE daily_notes ADD COLUMN is_auto INTEGER DEFAULT 0;
