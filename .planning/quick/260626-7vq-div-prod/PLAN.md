---
quick_id: 260626-7vq
slug: div-prod
date: 2026-06-26
status: in-progress
---

# Quick Task: 도면 DIV 마커 리치 모달 통일 — prod 재적용

## 목표
도면(FloorPlanPage) DIV 마커 점검 → 일반 점검의 리치 `DivModal`(1/2/세팅압·챔버배수·컴프레셔·트렌드 오버레이·CP-DIV·CP-COMP 페어)로 통일. staging(cbc7119-data)에서 GSD `260626-5hm`로 구현+사용자 검증 완료된 변경을 prod에 재적용.

## 컨텍스트
- 이 콘솔 = production 전용, branch=production (HEAD df432522). worktree 미사용, production 직접 적용.
- prod↔staging 파일 분기됨 → staging patch `git apply` 금지. prod 소스 기준 재실행.
- 핵심 분기: prod DivModal 헤더는 `h-12 px-3`/`text-title font-semibold`, staging은 `px-4 py-2.5`/`text-body font-bold` (pre-existing 분기). → prod 헤더 보존(일반 점검 무동작 변경).
- 검증: prod DivModal 블록(InspectionPage 1030-2315) vs staging 추출 모듈 diff = 헤더 4줄 + 의도된 lockToPoint/full-screen 추가뿐. 그 외 로직 동등.

## 확정 UX (사용자)
- lockToPoint: 도면은 탭한 개소 1곳 고정(네비/자동진행 off).
- 트렌드: 모달 안 오버레이(/div navigate 아님).
- 컴프레셔 점검 도면에서도 도달 유지.
- full-screen 애드덤(§2 PROD handoff): lockToPoint 시 bottom:0 + 푸터 safe-area (도면엔 BottomNav 없음).

## 커밋 계획
1. feat: `src/components/div/DivInspectModal.tsx` 신규 (= staging 모듈, 헤더 4줄만 prod 스타일로 revert). ✅ 빌드 통과
2. refactor: InspectionPage 인라인 DIV 블록 삭제 → 모듈 import (무동작 변경). 렌더 `<DivModal>`→`<DivInspectModal>`.
3. feat: FloorPlanPage 통합 — div_marker → lockToPoint DivInspectModal, extractDivLocationNo, divInspectLoc, divSaveAdapter(check_records 전용), getDetail dead path 제거, invalidate.

## GOTCHA
- ① 이중저장 금지: div_marker 는 lockToPoint 분기로만, generic submitRecord 미진입.
- ② divSaveAdapter 는 check_records 만 (div_pressures/logs/comp-inspection 은 모듈 내부 fetch).
- ③ monthRecords={} → 내부 재점검 팝업 off (FloorPlanPage 자체 evalRevisit 게이트가 처리).
- ④ 각 커밋 후 npm run build.

## 검증/롤아웃
- 빌드 통과 후 사용자 prod 배포 컨펌 → 수동 wrangler --branch production.
- 사용자 prod 도메인 검증(일반 점검 회귀 0 + 도면 DIV 압력/배수/컴프 저장 + full-screen).
- .planning/production-sync.md 게이트 갱신. 완료 후 HANDOFF md/patch 삭제.
