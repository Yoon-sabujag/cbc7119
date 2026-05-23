---
quick_id: 260523-fps
slug: floorplan-ext-symptom
date: 2026-05-23
status: complete
---

# Summary: 도면점검 소화기 모달 증상 피커 누락 fix

## Bug

`FloorPlanPage` 의 인라인 점검 모달에서 `needSymptom = planType === 'guidelamp' && ...` 로 유도등만 분기 → 도면에서 소화기 점검 시 주의/불량 선택해도 증상 피커가 안 뜸. `InspectionPage` 와 동작 불일치 (메모리 "점검·조치 자동화 패턴 — 5 카테고리" 룰 어김).

## Fix

`src/pages/FloorPlanPage.tsx`
- `SYMPTOM_OPTIONS_BY_PLAN` 매핑 신설 (guidelamp/extinguisher 옵션) — InspectionPage 측과 동일 라벨
- `needSymptom` 을 `symptomOptions != null` + result≠normal + guidelamp 일 때만 audience_passage 게이트 적용으로 일반화
- 증상 옵션 렌더를 하드코딩 array → `symptomOptions.map` 으로 동적화
- 모달 reset 2곳 (openInspectModal + revisitPopup completed 분기) — `SYMPTOM_OPTIONS_BY_PLAN[planType]?.[0]` 으로 planType 별 첫 옵션 초기값

저장 시 finalMemo 결정 로직 (`inspectSymptomPick === '직접 입력' ? memo : symptomPick`) 은 기존 그대로 — 카테고리 무관하게 동작.

## Verification

- `npx tsc --noEmit` PASS
- `npm run build` PASS, dist 번들에 "받침 파손" 포함 확인
- 사용자가 도면점검 → 소화기 주의/불량 선택 → 받침 파손/연한 만료/직접 입력 3 버튼 노출 확인 필요

## 잔여

- 소화전/방화셔터/전실제연댐퍼는 도면점검 planType 분기에 없어서(메모리 "전실제연댐퍼 ↔ 연결송수관 별개 설비" — 도면 직접 노출 X) 이번 fix 에 포함 안 함. 향후 노출 필요 시 SYMPTOM_OPTIONS_BY_PLAN 에 1줄 추가만으로 확장 가능.
