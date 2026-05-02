-- Migration 0082: extinguishers.type '분말' → '분말 3.3kg' 표기 통일
--
-- 배경:
--   기존 '분말' 행은 모두 ABC 분말 3.3kg 소화기. 추후 5kg 등 변형 도입 가능성을
--   고려해 명시적 용량 표기로 정규화. 약 416행 영향 (2026-05-02 기준 production).
--
-- 변경:
--   1) extinguishers.type = '분말' → '분말 3.3kg' UPDATE.
--   2) 다른 type 값 (분말 20kg, 이산화탄소, 할로겐, 강화액, K급) 은 그대로 유지.
--
-- 검증 SQL (적용 후):
--   SELECT type, COUNT(*) AS n FROM extinguishers GROUP BY type ORDER BY type;
--   → '분말' 0행, '분말 3.3kg' 약 416행

UPDATE extinguishers
SET type = '분말 3.3kg'
WHERE type = '분말';
