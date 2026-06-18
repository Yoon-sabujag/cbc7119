-- Migration 0091: DIV ↔ COMP 개소명(check_points.description) 페어링 트리거
--
-- 배경: DIV 측정점과 컴프레셔는 같은 위치를 공유한다 (CP-DIV-{id} ↔ CP-COMP-{id}, 34쌍 1:1).
--   과거엔 두 이름이 컴파일 상수 divPoints.ts 의 단일 loc 를 공유해 항상 같았다.
--   이제 사용자가 도면 마커 모달에서 DIV 실제 이름(check_points.description)을 편집할 수 있게 되면서,
--   DIV 만 바뀌고 COMP 가 옛 이름으로 남는 분기(사고 260612-e17 류)를 구조적으로 막아야 한다.
--
-- 정책: DIV 정본(DIV-canonical) 단방향. CP-DIV-{id}.description 가 바뀌면 CP-COMP-{id} 로 미러.
--   COMP 측 UPDATE 는 NEW.id LIKE 'CP-DIV-%' 가드에 안 걸리므로 재귀하지 않는다.
--   (SQLite recursive_triggers 는 기본 OFF 이며, WHEN 가드가 한 번 더 방어한다.)
--   기존 sync_marker_description_on_cp_update(0078) 가 DIV 변경을 div 마커로 전파한다.
--   COMP 미러 UPDATE 도 그 트리거를 발화시키지만 comp 마커가 0개라 무해하다.
--
-- id 슬라이스: 'CP-DIV-' = 7자 → substr(id,8) = '-1-2' 류 접미사. 'CP-COMP-' = 8자 → substr(id,9).

-- ── 1) 일회 정합: COMP description 을 짝 DIV 값으로 맞춤 (DIV 정본). staging 은 이미 parity(no-op). ──
UPDATE check_points
SET description = (
  SELECT d.description FROM check_points d
  WHERE d.id = 'CP-DIV-' || substr(check_points.id, 9)
)
WHERE id LIKE 'CP-COMP-%'
  AND EXISTS (
    SELECT 1 FROM check_points d
    WHERE d.id = 'CP-DIV-' || substr(check_points.id, 9)
      AND d.description IS NOT check_points.description
  );

-- ── 2) 자동 페어링 트리거 (DIV → COMP description 미러) ──
DROP TRIGGER IF EXISTS sync_comp_description_on_div_update;

CREATE TRIGGER sync_comp_description_on_div_update
AFTER UPDATE OF description ON check_points
FOR EACH ROW
WHEN NEW.id LIKE 'CP-DIV-%' AND OLD.description IS NOT NEW.description
BEGIN
  UPDATE check_points
  SET description = NEW.description
  WHERE id = 'CP-COMP-' || substr(NEW.id, 8);
END;
