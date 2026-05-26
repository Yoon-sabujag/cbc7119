---
quick_id: 260526-qua
slug: place-asset-qr-mgmt
date: 2026-05-26
status: complete
---

# Summary: place-asset 의 qr_code/mgmt_no 누락 fix + 영향 데이터 정상화

## Bug

`POST /api/floorplan-markers/:id/place-asset` 두 가지 데이터 누락:
1. cp 생성 분기: `qr_code = cpId` (CP-FE-NNNN) placeholder 만 채웠음 (5-22 UNIQUE 충돌 fix 의 부산물). 일반 등록 경로는 `QR-{zoneKr}-{floor}-{NN}` 발급.
2. ext UPDATE 분기: `check_point_id` 만 set, `mgmt_no/seq_no/zone/floor/location` 은 NULL 그대로. `skip_marker=true` 의 create.ts 가 그 필드들을 비워두기 때문에 마커 배치 단계에서 채워줘야 하는데 안 함.

결과: 사용자가 도면점검에서 새로 추가한 소화기가 UI 에서 mgmt_no 없이 location 이름("대강당 음향실")으로 표시. Phase 24 (5-2 이후) 부터 잠재 — 영향 22개 ext + 1개 cp.

## Fix

### Code (`functions/api/floorplan-markers/[id]/place-asset.ts`)
- cp 생성 분기: `qr_code` 를 `QR-{zoneKr}-{floorRaw}-{NN}` 자동 발급 (max+1)
- ext UPDATE 분기:
  - `mgmt_no` 가 없을 때만 `{zoneKr}-{extFloor}-{NN}` 발급 (existing UNIQUE seq 고려)
  - `seq_no` 가 없을 때만 글로벌 max+1 발급
  - `zone/floor/location` 도 cp/마커 정보로 채움
- 지하층 강제 zoneKr='지' 룰은 create.ts 와 동일 (`/^B\d/i.test(extFloor)`)

### Data (one-shot)
- `CP-FE-0451`: qr_code 'CP-FE-0451' → 'QR-지-B1-45'
- 22 ext 행: 모두 mgmt_no/seq_no/zone/floor/location 정상 시퀀스로 채움 (Node script 가 기존 max 살펴 충돌 없이 발급)
- 사후 검증: cp_placeholder_qr=0, ext_placed_no_mgmt=0

## Verification

- `npx tsc --noEmit` PASS
- `npm run build` PASS
- D1 검증 쿼리 0/0 (placeholder/누락 없음)
- 사용자가 도면점검에서 새 빈 마커 → 자산 등록/배치 → UI 에 정상 mgmt_no 노출 확인 필요

## Notes

- 잔여물 `.recovery-260526/` (build_fix.mjs, fix.sql, summary.json) — 며칠 후 정리.
- 22 ext 영향 대부분 5-2 마이그레이션 batch 시점에 만들어짐 (Phase 24 첫 도입). 그 이후 5-8/5-20/5-22 추가분도 같은 패턴으로 잠복했었음.
