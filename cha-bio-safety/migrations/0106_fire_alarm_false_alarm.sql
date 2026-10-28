-- 0106: fire_alarm_records.false_alarm 컬럼 — 화재수신반 경종이 실제로 울리지 않았는데
-- 마이크가 오디오로 화재를 오인식해 생성된 기록 분류 플래그(0=정상 기록, 1=오감지).
-- 보존 정책: false_alarm=1 인 기록도 DB 에는 그대로 남긴다(점검 기록 삭제 불가 원칙) —
-- 이력 목록(FireAlarmHistoryPage, 대시보드 최근 이벤트)에서만 제외한다.
-- 경고: 이 파일은 사용자가 wrangler d1 execute --file 로 1회 수동 적용한다. SQLite 는
-- ADD COLUMN IF NOT EXISTS 미지원 → 재실행 시 'duplicate column: false_alarm' 에러가 나는 것이
-- 정상이며, 재적용 금지. batch 비원자성 주의: ALTER 가 duplicate 로 실패해도 뒤따르는 UPDATE 는
-- 멱등하게 재실행 가능하므로 별도로 재시도해도 안전하다.
ALTER TABLE fire_alarm_records ADD COLUMN false_alarm INTEGER NOT NULL DEFAULT 0;

-- 기존 4건은 location 에 '오감지' 텍스트로 임시 표기해 온 관례를 플래그로 이관하고 location 은 비운다.
UPDATE fire_alarm_records SET false_alarm = 1, location = '' WHERE id IN ('FA-xPmxCiZVUv', 'FA-FrobXOuHT4', 'FA-g75EkJG4OQ', 'FA-SO4u7nqhCz');
