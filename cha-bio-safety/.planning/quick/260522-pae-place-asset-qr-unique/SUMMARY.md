---
quick_id: 260522-pae
slug: place-asset-qr-unique
date: 2026-05-22
status: complete
---

# Summary: place-asset qr_code UNIQUE 충돌 500 fix

## Bug

`POST /api/floorplan-markers/:id/place-asset` 가 빈 마커에 자산 배치할 때 새 `check_points` 행을 `qr_code = ''` 로 INSERT 했음. `check_points.qr_code` 는 `TEXT NOT NULL UNIQUE`. 5-2 에 "테스트" 라벨로 CP-FE-0450 (qr_code='') 이 한 번 들어가 있었고, 그 이후 빈 마커 배치 시도는 모두 UNIQUE 충돌 → batch throw → try/catch 없어 500 + 비-JSON 응답 → 클라이언트 "응답 파싱 실패 (status 500)".

5-22 사용자가 새 할로겐 소화기 자산 등록 후 빈 개소에 배치 시도하다 처음 신고.

## Fix

`functions/api/floorplan-markers/[id]/place-asset.ts`
- `qr_code = ''` → `qr_code = cpId` (CP-FE-XXXX 는 unique 보장)
- 전체 handler 를 try/catch 로 감싸 향후 다른 throw 도 JSON 에러로 응답 (응답 파싱 실패 toast 방지)

## Verification

- `npx tsc --noEmit` PASS
- `npm run build` PASS
- 같은 시나리오 재현 후 사용자가 정상 배치 확인 필요

## Notes

- 기존 CP-FE-0450 (qr_code='') 은 그대로 둠 — 사용자가 만든 테스트 데이터. 실 QR 발급 전까진 QR 스캔으로 못 찾지만 cp 자체는 정상 동작. 정리 여부는 사용자 결정.
