-- Migration 0078: floor_plan_markers.description 을 check_points.description 과 자동 동기화
--
-- 1) 기존 24개 마커 description 일회 동기화 (cp.description 그대로 복사)
-- 2) AFTER UPDATE 트리거 생성 — 향후 cp.description 변경 시 자동 동기화
--
-- 도면 페이지의 isAccessBlocked 체크가 selected.description (= marker description) 을
-- 보기 때문에, cp.description 의 '접근불가' 라벨이 마커에도 반영되어야 팝업이 뜬다.

-- ── 1) 일회 동기화 ──────────────────────────────────────
UPDATE floor_plan_markers
SET description = (SELECT description FROM check_points WHERE id = floor_plan_markers.check_point_id),
    updated_at = datetime('now')
WHERE check_point_id IS NOT NULL
  AND description IS DISTINCT FROM (SELECT description FROM check_points WHERE id = floor_plan_markers.check_point_id);

-- ── 2) 자동 동기화 트리거 ──────────────────────────────
DROP TRIGGER IF EXISTS sync_marker_description_on_cp_update;

CREATE TRIGGER sync_marker_description_on_cp_update
AFTER UPDATE OF description ON check_points
FOR EACH ROW
WHEN OLD.description IS NOT NEW.description
BEGIN
  UPDATE floor_plan_markers
  SET description = NEW.description,
      updated_at = datetime('now')
  WHERE check_point_id = NEW.id;
END;
