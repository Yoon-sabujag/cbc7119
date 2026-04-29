-- Migration 0076: Halogen extinguisher marker type fix
-- 청정구역/GMP 4개 cp 의 floor_plan_markers.marker_type 이 fire_extinguisher (분말 3.3kg 원형 ●)
-- 로 잘못 등록되어 있어 ext_halogen (▲ 삼각) 으로 정정.
-- 0075 에서 description 을 '할로겐 [접근불가]' 로 갱신한 4개 cp 와 동일 대상.

UPDATE floor_plan_markers
SET marker_type = 'ext_halogen'
WHERE check_point_id IN ('CP-FE-0416', 'CP-FE-0417', 'CP-FE-0418', 'CP-FE-0419');
