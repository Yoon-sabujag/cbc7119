-- Phase 22: add gas_result, gas_action, etc_result, etc_action columns to work_logs
ALTER TABLE work_logs ADD COLUMN gas_result TEXT NOT NULL DEFAULT '';
ALTER TABLE work_logs ADD COLUMN gas_action TEXT NOT NULL DEFAULT '';
ALTER TABLE work_logs ADD COLUMN etc_result TEXT NOT NULL DEFAULT '';
ALTER TABLE work_logs ADD COLUMN etc_action TEXT NOT NULL DEFAULT '';
