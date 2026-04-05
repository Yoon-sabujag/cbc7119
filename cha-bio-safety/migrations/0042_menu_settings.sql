-- 0042_menu_settings.sql
-- Admin menu configuration (item visibility and order)

CREATE TABLE IF NOT EXISTS app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now','+9 hours'))
);
