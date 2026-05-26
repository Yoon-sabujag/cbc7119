---
quick_id: 260526-cyc
slug: revisit-popup-cycle-aware
date: 2026-05-26
status: complete
---

# Summary: revisit 팝업 DIV/컴프레셔 월 2 cycle 분기 적용

## Bug

`useInspectionRevisitPopup` 의 completed 분기가 `monthRecords` entry 1개만 보고 활성 schedule 만 매칭 → DIV/컴프레셔(월 2회 cycle) 의 경우 5/1~15 점검 record 가 5/16~말 진입 시에도 "이미 점검 완료" 팝업으로 떠서 월말 점검 진행 불가. `computeCardCompletion` 은 cycle 룰 적용돼 있는데 팝업 훅에 같은 룰이 누락돼 있던 일관성 깨짐.

## Fix

`src/hooks/useInspectionRevisitPopup.ts`
- `CYCLE_CATEGORIES = new Set(['DIV','컴프레셔'])` + `getCycleHalfRange(today)` 헬퍼 추가 (inspectionProgress.ts 와 동일 룰)
- completed 분기 마지막 단계에서 cycle 카테고리면 `meta.checkedAt` 가 현재 반쪽 윈도우(1~15 또는 16~말) 안인지 검사, 밖이면 `return null` (= 팝업 안 띄움 = 새 cycle 시작이라 점검 진행 가능)
- pending(주의/불량 open) 은 cycle 무관하게 띄우는 기존 정책 보존 (기간 아닌 조치 경고)

## Verification

- `npx tsc --noEmit` PASS
- `npm run build` PASS
- 사용자가 5/26 (월말 cycle) DIV/컴프레셔 점검 진입 시 5/1~15 record 무시되고 팝업 없이 진행 가능 확인 필요

## Notes

- monthRecords 자체는 안 바꿈 (다른 화면에서도 사용). 훅 내부에서만 분기.
- DIV ↔ 컴프레셔 1:1 매핑(메모리 div_compressor_pair) 룰에 따라 두 카테고리 모두 적용.
