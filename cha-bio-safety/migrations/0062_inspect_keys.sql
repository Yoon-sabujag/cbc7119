-- 민원24 검사조회 키 (고객안내번호+접수번호) DB 저장
CREATE TABLE IF NOT EXISTS koelsa_inspect_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cstmr TEXT NOT NULL,
  recptn TEXT NOT NULL,
  label TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(cstmr, recptn)
);
