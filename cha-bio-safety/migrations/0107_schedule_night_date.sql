-- 0107: schedule_items.night_date 컬럼 — 소방 상반기 종합정밀점검 / 소방 하반기 작동기능점검이
-- 야간까지 이어지는 특정 날짜(YYYY-MM-DD). nullable, 일정 1건당 날짜 1개.
-- 입력 경로: 월간 점검 계획 > 일정 추가(AddModal)의 소방 2개 제목 전용 "야간 점검일" 필드.
-- 소비처: functions/_lib/maint.ts 의 hasNightEvent() — category='fire' AND night_date=오늘 정확매칭으로
-- 점검모드 자동 OFF 시각을 17:30 → 21:00 으로 연장한다.
-- 경고: 이 파일은 wrangler d1 execute --file 로 1회 수동 적용한다. SQLite 는 ADD COLUMN IF NOT EXISTS 미지원 → 재실행 시
-- 'duplicate column: night_date' 에러가 나는 것이 정상이며, 재적용 금지.
ALTER TABLE schedule_items ADD COLUMN night_date TEXT;
