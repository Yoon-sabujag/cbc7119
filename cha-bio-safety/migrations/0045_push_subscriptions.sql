CREATE TABLE IF NOT EXISTS push_subscriptions (
  id                       TEXT PRIMARY KEY,
  staff_id                 TEXT NOT NULL,
  endpoint                 TEXT NOT NULL,
  p256dh                   TEXT NOT NULL,
  auth                     TEXT NOT NULL,
  notification_preferences TEXT NOT NULL DEFAULT '{"daily_schedule":true,"incomplete_schedule":true,"unresolved_issue":true,"education_reminder":true,"event_15min":true,"event_5min":true}',
  created_at               TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at               TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(staff_id, endpoint)
);
