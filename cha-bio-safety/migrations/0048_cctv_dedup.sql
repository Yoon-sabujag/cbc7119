-- CCTV 중복 데이터 제거 (시드 2회 실행으로 12→24개 중복)
-- 먼저 연결된 점검 기록 삭제
DELETE FROM check_records WHERE checkpoint_id IN (
  '32196b197550b733','5c8d2c47bf9938f1','0a5352cd71a46bc9',
  '0b0dae1484550f81','a85eca11b080f2f7','46c524635acea7fa',
  '85368d1e18954530','061f6471e3e2c6ea','fd72d252d018ae31',
  'a200d5cf758d9230','551cd418eac71b79','54f242d3bfb701a1'
);
-- 중복 개소 삭제
DELETE FROM check_points WHERE id IN (
  '32196b197550b733','5c8d2c47bf9938f1','0a5352cd71a46bc9',
  '0b0dae1484550f81','a85eca11b080f2f7','46c524635acea7fa',
  '85368d1e18954530','061f6471e3e2c6ea','fd72d252d018ae31',
  'a200d5cf758d9230','551cd418eac71b79','54f242d3bfb701a1'
);
