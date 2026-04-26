-- 0073: 클라이언트 측 일시 실패 모니터링용 telemetry 테이블
-- api.ts 의 fetch retry / 비-JSON 응답 발생 시 fire-and-forget POST 로 누적.
-- 콜드 스타트 첫 저장 실패 패턴(SW race / JWT 만료 / Workers 콜드 스타트) 진단용.
-- 누적 후 SELECT … GROUP BY event_type, hour 등으로 패턴 분석.

CREATE TABLE IF NOT EXISTS telemetry_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ts          TEXT    NOT NULL,                  -- ISO 8601 (클라이언트 발생 시각)
  event_type  TEXT    NOT NULL,                  -- 'cold-retry' | 'json-parse-fail'
  path        TEXT,                              -- API 경로 (예: '/inspections')
  status      INTEGER,                           -- HTTP status (응답 받았으면)
  staff_id    TEXT,                              -- 발생 시점 인증된 사용자 (FK 안 걸음)
  user_agent  TEXT,                              -- 모바일/데스크톱/iOS/Android 구분
  detail      TEXT                               -- 추가 컨텍스트 (선택)
);

CREATE INDEX IF NOT EXISTS idx_telemetry_ts ON telemetry_events(ts DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_event ON telemetry_events(event_type, ts DESC);
