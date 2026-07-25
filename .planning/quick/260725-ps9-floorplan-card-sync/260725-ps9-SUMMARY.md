# Quick Task 260725-ps9: 도면점검 소화전/비상콘센트/완강기 → 공용 카드 모달 라우팅 — Summary

**Executed:** 2026-07-25
**Branch:** production (worktree OFF, 메인 트리 직접 원자 커밋)
**Scope:** Task 1~3 실행 완료. Task 4(로컬 CDP 검증)는 human-verify blocking 게이트 — **미실행, 검증 대기**.

도면점검(FloorPlanPage)의 소화전(indoor_hydrant)/완강기(descending_lifeline) 마커를 일반점검과 동일한 `check_records.line_results` JSON + `remediation_symbol` 계약으로 저장하도록, DIV 마커의 lockToPoint 공용 모달 선례를 미러링한 신규 `InspectionCardModal` 로 재라우팅했다. 서버/D1/스키마 변경 0, backfill 0.

## 커밋 (per-task 원자 커밋)

| Task | Commit | 유형 | 내용 |
|------|--------|------|------|
| 1 | `4325734b` | refactor | faAutoMemoFor + hydrantRemediationSymbol 공용 추출 (동작 불변) |
| 2 | `fbb019b4` | feat | InspectionCardModal.tsx 신규 (lockToPoint 카드 모달) |
| 3 | `a1e627a6` | feat | FloorPlanPage 라우팅 + dead paired-BC generic 경로 제거 |
| 리뷰수정 | `c16b71fb` | fix | 접근불가 가드 재설치 + 복원선택/월KST/사진정리 파리티 (적대적 리뷰 3건 반영) |

## 변경 파일

**신규**
- `cha-bio-safety/src/components/inspection/familyHelpers.ts` — faAutoMemoFor + hydrantRemediationSymbol export (Family A/소화전 SSOT)
- `cha-bio-safety/src/components/inspection/InspectionCardModal.tsx` — 소화전(7+paired BC7)/완강기(4) lockToPoint 카드 모달

**수정**
- `cha-bio-safety/src/pages/InspectionPage.tsx` — 인라인 helper 2종 삭제 → familyHelpers import (import 1줄 추가, 함수 정의 42줄 삭제). damperRemediationSymbol/fireShutterRemediationSymbol 는 잔류(diff 최소).
- `cha-bio-safety/src/pages/FloorPlanPage.tsx` — import+상태(cardInspect)+cardSaveAdapter+라우팅 분기 2곳+마운트 블록+generic 게이트 배제 추가, dead paired-BC generic 경로 제거 (net -62줄).

## 검증 결과

- `cd cha-bio-safety && npx tsc --noEmit` → **0 errors** (Task 1/2/3 각각 통과)
- `cd cha-bio-safety && npm run build` → **성공** (87 modules, 13.42s). 순환 import 0 — familyHelpers → {familyCard(타입만), inspectionContent} 단방향 확인.

## Task 3(g) dead-code 처리 내역

재라우팅으로 indoor_hydrant 가 generic 모달에 도달 불가함을 확인 후 수술적 제거:
- **도달 불가 근거:** openInspectModal 및 revisit onClose 분기가 indoor_hydrant 를 setCardInspect 로 가로채고 early-return → `inspectModal` 이 소화전에는 절대 true 안 됨. 추가로 generic 게이트에 `marker_type !== 'indoor_hydrant'` 배제. pairedBC 식별 effect 도 `inspectModal` 게이트라 상시 null.
- **제거 항목:** (1) pairedBC 식별 effect + 모달 close-reset effect, (2) 상태 5종(pairedBC/pairedBcLoading/inspectBcResult/inspectBcMemo/inspectBcPhoto), (3) generic 모달 paired 비상콘센트 UI 블록, (4) 저장부 BC 서브밋 + bcPhotoKey, (5) 저장버튼 disabled/label 의 pairedBcLoading 분기, (6) openInspectModal 2곳의 inspectBc reset.
- **존치(의도):** `SYMPTOM_OPTIONS_BY_PLAN['extinguisher']` — 소화기 마커 전용으로 자동 정상화(삭제 시 소화기 회귀). lucide CheckCircle2/AlertTriangle/XCircle — generic 모달 주 결과버튼에서 계속 사용.
- **확신 못한 삭제 없음** — 모든 참조 컴파일 클린(grep 잔여 0).

## 회귀 우려점 (Task 4 검증 필요)

- **일반점검 리팩터 회귀 0 여부:** faAutoMemoFor/hydrantRemediationSymbol 는 문자 그대로 이동(로직/시그니처/반환 불변). 소화전 저장·복원·재방문·조치 심볼 왕복 정상 확인 필요.
- **완강기 CP 매핑:** 마커의 selected.check_point_id(CP-{floor}-{n}-WK) 를 그대로 lockToPoint (하드코딩 목록 미사용). 실 마커 13개소 진입·저장·엑셀(피난방화 sheet6 rows 6-9) 확인 필요.
- **paired BC 복원/저장:** 카드 모달 self-fetch 로 getCheckpoints+getMonthRecords 병렬 조회 → sh.locationNo 매칭 BC 식별. 48개소 동반 저장·복원 확인 필요. 비원자 저장 현행 유지(주 저장 성공 후 BC).
- **엑셀 △/Ｘ:** 도면 저장분 line_results 가 소화전 sheet3·비상콘센트 sheet4·완강기 sheet6 에 주의=△/불량=Ｘ 반영(과거 전부 ○ 폴백) 확인 필요.
- **교차 진입점 동기:** 일반점검 ↔ 도면점검 동일 개소 재진입 시 카드 상태 상호 복원 확인 필요.
- **무변경 확인:** 소화기 generic 모달+증상 피커(받침 파손/연한 만료)+정보수정/분리 버튼, DIV 마커, 유도등, 완료 카운팅, 재방문 팝업.

## 적대적 코드리뷰 + 수정 + 최종 검증 (Task 4, 메인 에이전트)

**적대적 리뷰 워크플로(3 다관점 → 발견 적대 검증):** 실질 결함 3건 발견 → 전부 수정(`c16b71fb`).
1. **접근불가 가드 회귀 (medium, 회귀)** — 실 prod 확인: 완강기 마커 13개 중 9개·소화전 107개 중 1개가 `description='접근불가'`(공단 크론 자동정상화, 수동기록 차단 대상). 최초 구현이 이들을 카드 모달로 라우팅해 기록 가능하게 만듦 → InspectionPage(AccessBlockedPopup 차단)와 불일치+정책 위반. **수정:** 라우팅 2곳 `!접근불가` 가드 + generic 게이트 조건화(`!((hydrant||lifeline) && !접근불가)`) → 비-접근불가=카드 / 접근불가=AccessBlockedPopup.
2. **복원 레코드 선택 불일치 (medium)** — 모달=최신 line_results 보유, InspectionPage=최신 pending 우선. 다중 레코드 월 교차진입 시 도면이 미조치 불량 은폐 가능. **수정:** `familyHelpers.pickRestoreRecord`(최신 pending 우선) 공용화, 모달 main+BC 적용. InspectionPage monthMap upsert 규칙과 정확 일치 확인.
3. **저장 후 photo.reset() 누락 (medium)** — 업로드 사진 vault entry 잔존 → 다음 점검 '복구 사진' 오노출. **수정:** 저장 성공 후 photo/bcPhoto reset.
- 부수: 카드 복원 월(month) KST 정정, 저장버튼 라벨 `증상 항목 입력 필요` 케이스 분리.

**수정 재검증(적대적, 5차원):** 전 항목 CONFIRMED-OK — 접근불가 4상태 분기(비-차단→카드/차단→팝업, 양 진입경로)·generic 게이트(타 마커 무변경)·pickRestoreRecord 파리티·photo.reset 계약·회귀 없음(DIV/카운팅/소화기 피커/dangling 0).

**실 prod 데이터 확인:** 접근불가 cp↔marker.description 동기 mismatch **0(양방향)** → 가드가 모든 차단 마커에 확실히 발동. (verify 에이전트가 남긴 유일한 미확인 caveat 해소.)

**최종:** tsc 0 / build 성공(88 precache) / 4커밋. 잔여(미조치, 배포 무관): BC 저장 실패 시 주-사진 reset 스킵 = 기존 비원자 저장 특성(신규 회귀 아님).

## 로컬 런타임(CDP) 판단
헤드리스 CDP 실드라이브는 이 맥에서 확장 미연결 + FloorPlanPage 데이터 파이프라인(도면 PNG·마커·세션) 목킹 취약으로 신뢰도 낮음. 대신 **코드 파리티(동일 헬퍼·FamilyACard·저장 페이로드 미러) + build/tsc + 적대적 리뷰·재검증 + 실 prod 데이터 검증**으로 대체. `line_results→엑셀 △/Ｘ` 경로는 기존 UAT 승인분(변경 없음). 실데이터 UAT(실 마커/엑셀)는 사용자 몫으로 권장.

## Known Stubs

없음. InspectionCardModal 은 실 데이터(getCheckpoints/getMonthRecords/submitRecord)와 완전 배선됨.

## 배포 상태

**미배포 — 사용자 승인 대기.** executor·서브에이전트 배포 금지(feedback_subagent_production_deploy_forbidden). 검증 통과. 사용자 승인 후 메인+사용자 같은 턴에서 수동 배포(`--branch production`, --commit-message ASCII 별도).

## Self-Check: PASSED

- FOUND: cha-bio-safety/src/components/inspection/familyHelpers.ts
- FOUND: cha-bio-safety/src/components/inspection/InspectionCardModal.tsx
- FOUND: commits 4325734b, fbb019b4, a1e627a6
- tsc 0 / build 성공
