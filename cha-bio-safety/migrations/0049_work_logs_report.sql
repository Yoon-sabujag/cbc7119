-- Phase 22: 불량사항 개선보고 fields
ALTER TABLE work_logs ADD COLUMN report_year TEXT NOT NULL DEFAULT '';
ALTER TABLE work_logs ADD COLUMN report_month TEXT NOT NULL DEFAULT '';
ALTER TABLE work_logs ADD COLUMN report_day TEXT NOT NULL DEFAULT '';
ALTER TABLE work_logs ADD COLUMN report_method TEXT NOT NULL DEFAULT '';
ALTER TABLE work_logs ADD COLUMN fix_method TEXT NOT NULL DEFAULT '';
