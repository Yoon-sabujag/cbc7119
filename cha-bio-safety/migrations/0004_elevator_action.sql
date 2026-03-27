-- migrations/0004_elevator_action.sql
ALTER TABLE elevator_inspections ADD COLUMN action_needed TEXT;
