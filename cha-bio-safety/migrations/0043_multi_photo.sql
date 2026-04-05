-- Migration 0043: Add multi-photo columns to legal_findings
ALTER TABLE legal_findings ADD COLUMN photo_keys TEXT NOT NULL DEFAULT '[]';
ALTER TABLE legal_findings ADD COLUMN resolution_photo_keys TEXT NOT NULL DEFAULT '[]';

-- Backfill existing photo_key into photo_keys as JSON array
UPDATE legal_findings
SET photo_keys = json_array(photo_key)
WHERE photo_key IS NOT NULL AND photo_keys = '[]';

-- Backfill existing resolution_photo_key into resolution_photo_keys
UPDATE legal_findings
SET resolution_photo_keys = json_array(resolution_photo_key)
WHERE resolution_photo_key IS NOT NULL AND resolution_photo_keys = '[]';
