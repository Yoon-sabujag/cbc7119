-- 도면 위 마커 테이블: 도면 이미지 위에 점검 개소를 배치하고 관리
CREATE TABLE floor_plan_markers (
  id             TEXT PRIMARY KEY,
  floor          TEXT NOT NULL,          -- 'B5','B4',...,'1F','2F',...,'8F','8-1F'
  plan_type      TEXT NOT NULL,          -- 'guidelamp','detector','sprinkler','extinguisher'
  marker_type    TEXT,                   -- 유도등: 'exit','corridor','room_corridor','seat_corridor'
  x_pct          REAL NOT NULL,          -- 이미지 너비 대비 % (0~100)
  y_pct          REAL NOT NULL,          -- 이미지 높이 대비 % (0~100)
  label          TEXT,                   -- 표시 라벨 (예: '피난구 B5-01')
  check_point_id TEXT REFERENCES check_points(id),
  created_by     TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_fpm_floor_type ON floor_plan_markers(floor, plan_type);
