---
quick_id: 260626-7vq
slug: div-prod
date: 2026-06-26
status: complete
commits:
  - f4dcc63c  # feat: DIV 공용 모듈 추출
  - e874bc77  # refactor: InspectionPage 재배선
  - c27bf628  # feat: FloorPlanPage 통합
---

# SUMMARY: 도면 DIV 마커 리치 모달 통일 — prod 재적용

## 결과
staging(260626-5hm) 검증본을 prod 소스 기준으로 재적용. 3 커밋, build precache 통과.

도면(FloorPlanPage) DIV 마커 "점검 기록 입력" → 일반 점검과 동일한 리치 `DivInspectModal`(1/2/세팅압 + 챔버배수 + 컴프레셔 점검 + 트렌드 오버레이) 진입. div_pressures/div logs/comp-inspection/CP-DIV·CP-COMP check_records 동일 기록. lockToPoint=탭한 개소 1곳 고정 + full-screen(도면엔 BottomNav 없음).

## 커밋
1. `f4dcc63c` feat — `src/components/div/DivInspectModal.tsx` 신규(staging 모듈 베이스, 헤더 4줄만 prod 스타일 `h-12 px-3`/`text-title font-semibold` 로 revert → 일반 점검 무동작 변경).
2. `e874bc77` refactor — InspectionPage 인라인 DIV 블록(1029-2316) 삭제 → 모듈 import, 렌더 `<DivModal>`→`<DivInspectModal>`. 무동작 변경.
3. `c27bf628` feat — FloorPlanPage +50/-1: import, `extractDivLocationNo`, `divInspectLoc`, `divSaveAdapter`(check_records 전용), openInspectModal/wasCompleted div_marker early-return, 인라인 모달 가드, lockToPoint 렌더 + invalidate.

## prod↔staging 분기 처리 (핵심)
- prod DivModal 헤더 = `h-12 px-3`/`text-title font-semibold`, staging = `px-4 py-2.5`/`text-body font-bold` (pre-existing 분기, this 작업 무관).
- 검증: prod DivModal 블록 vs staging 모듈 diff = 헤더 4줄 + 의도된 lockToPoint/full-screen 추가뿐. → staging 모듈 채택하되 헤더 4줄만 prod 로 revert (정확히 4줄 차이 diff 확인). 일반 점검 회귀 0.
- staging patch `git apply` 안 함(파일 분기). prod 앵커 기준 수기 이식.

## 검증
- 각 커밋 후 `npm run build`(tsc+vite) 통과. 통합 마커 9/9 grep 확인. FloorPlanPage diff +50/-1.

## 잔여 / 다음
- **prod 배포 대기** — 사용자 컨펌 후 수동 wrangler --branch production (직원 도메인).
- 배포 후: 사용자 prod 도메인 검증(일반 점검 회귀 0 + 도면 DIV 압력/배수/컴프 저장 + full-screen) → production-sync 적용이력 finalize + staging 회신 + HANDOFF md/patch 삭제.
- **별도 후보(범위 밖)**: DIV/컴프 모달 헤더 prod↔staging 스타일 분기는 추후 redesign-sync 시 통일 검토.
