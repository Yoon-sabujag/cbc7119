-- 0024: 유도등 B3층 수량 오류 수정 (43개 → 41개)
-- FFI-279~281 기준: 피난구 17 + 통로 5 + 거실 19 = 41개
UPDATE check_points
SET description = '유도등 41개'
WHERE id = 'CP-B3-유도등';
