-- 0103: panel_alarms.confirmed 컬럼 — 영상+오디오 교차-source 동시확인된 경보 여부(0=미확정, 1=확정).
-- trigger.ts dedupe 단계에서 기존 활성 행(existing.source)과 신규 발신(body.source)이 둘 다 존재하고 서로 다르면 1 로 태깅.
-- 기존 21행은 DEFAULT 0 으로 자동 백필된다.
-- 경고: 이 파일은 wrangler d1 execute --file 로 1회 수동 적용한다. SQLite 는 ADD COLUMN IF NOT EXISTS 미지원 → 재실행 시
-- 'duplicate column: confirmed' 에러가 나는 것이 정상이며, 재적용 금지.
ALTER TABLE panel_alarms ADD COLUMN confirmed INTEGER NOT NULL DEFAULT 0;
