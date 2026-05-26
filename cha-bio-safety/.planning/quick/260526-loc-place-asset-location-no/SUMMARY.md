---
quick_id: 260526-loc
slug: place-asset-location-no
date: 2026-05-26
status: complete
---

# Summary: place-asset cp.location_no 누락 fix + 22 cp 정상화

## Bug

PDF 라벨 큰 글씨가 `qr_code` 가 아니라 `cp.locationNo` (DB `location_no`) 컬럼을 사용. 일반 create.ts 경로는 `location_no = mgmt_no` (예: '지-B1-NN') 패턴인데, `place-asset.ts` 가 cp 생성 시 `location_no = location` ('대강당 음향실') 으로 채워서 PDF 에 위치명 그대로 노출. 5/26 1차 fix(qua) 에서 ext.mgmt_no 만 정상화하고 cp.location_no 동기화 누락.

## Fix

### Code (`functions/api/floorplan-markers/[id]/place-asset.ts`)
- ext UPDATE 와 `cp.location_no = mgmt_no` UPDATE 를 batch 로 묶음 (mgmt_no 발급 직후)
- 신규 cp 생성 분기뿐 아니라 재사용 분기에서도 갱신 (재사용 cp 가 옛 패턴일 수 있어 일관성 보장)

### Data (one-shot)
22 cp 의 `location_no` 를 `e.mgmt_no` 로 correlated subquery UPDATE.
- 검증: CP-FE-0451 → location_no '지-B1-51' (= mgmt_no 동일), 외 4 샘플 동일 패턴 확인.

## Verification

- `npx tsc --noEmit` PASS
- `npm run build` PASS
- 사용자가 QR PDF 재다운로드 → 큰 글씨가 '지-B1-NN' 정상 형식으로 나오는지 확인 필요

## Notes

- PDF QR 이미지 자체는 `cp.id` (CP-FE-NNNN) 인코딩이라 변한 적 없음. 사용자의 "qr 그대로" 신고는 라벨 큰 글씨 의미였음.
- 잔여물 `.recovery-260526/` 는 5/26 fix 작업물 (이번 후속도 같이 정리 가능).
