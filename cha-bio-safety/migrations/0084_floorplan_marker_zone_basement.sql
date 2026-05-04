-- B층 유도등/기타 plan_type 마커의 zone='common' 을 'basement' 로 정정
-- check_points 는 0081 마이그레이션에서 'common' → 'basement' 로 정정됐으나
-- floor_plan_markers 는 누락됐었음. 도면점검에서 zone 불일치로 CP 조회 실패 (2026-05-04)

UPDATE floor_plan_markers
   SET zone = 'basement'
 WHERE floor IN ('B1','B2','B3','B4','B5')
   AND zone = 'common';
