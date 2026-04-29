-- Migration 0075: Extinguisher inaccessible marks
-- 14개 미점검 소화기 중 13개 cp description 갱신 (CP-FE-0427 은 이미 갱신됨, 제외)
-- 분말 9개 + 할로겐 4개. 자동완료 useEffect 의 includes('[접근불가]') 패턴과 정렬.

-- 분말 9개 — research 7F, 8F
UPDATE check_points SET description = '분말 [접근불가]' WHERE id IN (
  'CP-FE-0044', 'CP-FE-0407', 'CP-FE-0408', 'CP-FE-0005',
  'CP-FE-0010', 'CP-FE-0011', 'CP-FE-0414', 'CP-FE-0012', 'CP-FE-0415'
);

-- 할로겐 4개 — office 7F 청정구역, research 1F GMP
UPDATE check_points SET description = '할로겐 [접근불가]' WHERE id IN (
  'CP-FE-0416', 'CP-FE-0417', 'CP-FE-0418', 'CP-FE-0419'
);
