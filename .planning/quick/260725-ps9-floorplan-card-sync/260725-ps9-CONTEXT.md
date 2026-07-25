# Quick Task 260725-ps9: 도면점검 소화전/비상콘센트/완강기 점검 내용 카드 연동 — Context

**Gathered:** 2026-07-25
**Status:** Ready for planning
**App root:** `cha-bio-safety/` (all `src/...` paths below are under this). Branch = `production`. `.planning` = repo root. worktree OFF.

> ⚠️ file:line 앵커는 조사 시점(2026-07-25) 값. 실제 편집 전 반드시 grep 으로 현재 위치 재확인.

<domain>
## Task Boundary

일반점검(InspectionPage)은 소화전(7항목)/비상콘센트(7항목)/완강기(4항목)를 "점검 내용 카드"로 점검해 `check_records.line_results`(JSON) + `remediation_symbol` 을 저장한다. 그러나 도면점검(FloorPlanPage)은 같은 개소를 **인라인 generic 모달**로 `{result, memo}` 만 저장 → `line_results`/`remediation_symbol` NULL. 두 진입점의 데이터 계약이 발산.

**목표:** 도면점검에서 소화전/비상콘센트/완강기 마커를 점검할 때 일반점검 카드와 **동일한 line_results/remediation_symbol** 을 저장하도록 FloorPlanPage 를 수정한다. DIV 마커가 이미 쓰는 **공용 모달 lockToPoint 라우팅 선례**를 그대로 따른다.

**범위 밖:** 서버/D1 스키마·API 변경(컬럼·수용 이미 존재), 소급 backfill(prod line_results 0건·손상 0), paired BC 저장 원자성 개선(기존 비원자 동작 유지 = 현행과 동일), 방화셔터/DIV/댐퍼 등 다른 카테고리.
</domain>

<mismatch_analysis>
## 근본 원인 & 영향 (조사 완료)

- **일반점검 저장** (`src/pages/InspectionPage.tsx`): `{checkpointId, result, memo, photoKey, line_results(JSON), remediation_symbol?}` (~2652-2674, ~3912-3914). 소화전/비상콘센트/완강기 = 공용 `InspectionModal` + `FamilyACard`(`src/components/inspection/familyCard.tsx`) + 헬퍼(`faWorst`/`faLineResults`/`faAutoMemo`/`faAllResolved`). Family A 대상: `FAMILY_A_CATEGORIES = ['청정소화약제','소방펌프','완강기','소화전','방화셔터']` (~2093).
- **도면점검 저장** (`src/pages/FloorPlanPage.tsx`): generic 인라인 모달(~1808-2088)이 `{checkpointId, result, memo, photoKey, ...extra}`, extra={} (소화전/완강기는 extinguisher plan 이라 extra 변형 미실행). **line_results/remediation_symbol/familyCard 참조 0건** (grep 확인).

**결과:**
1. **엑셀 점검일지 오표기**: `generateExcel.ts:401-404`(소화전 sheet3/비상콘센트 sheet4) — entry 있는데 line_results NULL/빈배열이면 **7행 전부 '○'(양호) 폴백**. `generateExcel.ts:543`(완강기, 피난방화 sheet6 6~9행 secondary) — worst=null 이면 checked?'○':null. → 주의/불량이어도 △/Ｘ 소실, 전부 ○. 법정 일지 신뢰성 훼손이 핵심 위험.
2. **교차 저장 소실(더 위험)**: `functions/api/reports/check-monthly.ts:50-59` fold 가 같은 개소·월에서 worst 행 채택 → 도면 NULL 행이 카드 행을 덮어 그 달 카드 상세 통째 소실.
3. **재진입 빈 카드**: 카드 done 판정은 `line_results` 존재 기반 — `faSaved1 = Array.isArray(monthRecords[cp].line_results) && length>0` (`InspectionPage.tsx:2751-2762`). 도면 저장분(NULL)은 일반점검 재진입 시 done 오버레이 안 뜨고 카드가 미점검처럼 빈 상태. 복원(`~2461-2466` line_results→faMarks)도 불가.
4. **조치 심볼 끊김**: `remediation_symbol` NULL → RemediationDetailPage 역매핑(`~2471-2480`) 불가.
5. **도면 소화전 증상 피커 오류(별개 버그, 이번에 동시 해소)**: `SYMPTOM_OPTIONS_BY_PLAN['extinguisher']=['받침 파손','연한 만료','직접 입력']` (`FloorPlanPage.tsx:63-66`)은 **소화기용**. 소화전 카드의 올바른 피커는 i3(소화전함·호스)=경종/호스걸이/직접입력 + i0(위치표시등) 특례(`src/data/inspectionContent.ts:44-56`).

**안전(영향 없음):** 완료 카운팅은 스칼라 `result`+`status` 기반(`isCpCompleted`, `InspectionPage.tsx:52-55`) → 대시보드/층별/피커 done 카운트 정상.
</mismatch_analysis>

<div_precedent>
## 따라야 할 선례 — DIV 마커 (prod 전용, 정확한 template)

FloorPlanPage 는 `div_marker` 클릭 시 generic 모달 대신 **공용 `DivInspectModal`** 로 진입한다:
- 상태 `divInspectLoc`(locationNo) (~376), 마운트 블록 (~1753-1767: `<DivInspectModal lockToPoint=... />`), 라우팅 분기 2곳: openInspectModal (~1314-1319) + 재진입 확인 경로 (~1786-1808).
- generic 모달 게이트가 `selected.marker_type !== 'div_marker'` 로 DIV 를 배제(GOTCHA①: generic submitRecord 경로 미진입).
- **DivInspectModal 은 self-fetch** — 부모는 locationNo + 얇은 저장 어댑터만 주면 되고 모달이 스스로 저장.

→ 소화전/완강기(+paired BC)도 **같은 패턴**: 공용 카드 모달을 만들어 lockToPoint 진입, 모달이 스스로 line_results/remediation_symbol 저장.
</div_precedent>

<design>
## 설계 — 경량 추출 하이브리드 (확정)

**1. 신규 공용 컴포넌트 `src/components/inspection/InspectionCardModal.tsx`** (DivInspectModal 미러):
   - props: 단일 개소 고정(lockToPoint), 대상 checkpointId/category/locationNo, onClose, onSaved.
   - `familyCard.tsx`(이미 공용) 재사용. 소화전7/비상콘센트7/완강기4 카드 렌더.
   - 그 개소의 **월기록만 self-fetch**(재진입 카드 복원용 line_results→faMarks). DivInspectModal 의 self-fetch 방식 참고.
   - line_results 빌드(`faLineResults`) + worst 롤업(`faWorst`) + 자동 특이사항 C/D(`faAutoMemoFor`) + 재점검 복원 + remediation_symbol 도출.
   - **소화전 특례**: i0(위치표시등)→symbol "위치표시등 점등 이상"(고정), i3(소화전함·호스)→증상 피커(경종/호스걸이/직접입력) → symbol "경종 파손"/"호스걸이 파손"/직접. `hydrantRemediationSymbol` 로직 재사용.
   - **저장은 모달이 스스로**(공용 저장 함수 or 얇은 어댑터).

**2. 헬퍼 추출/공유** (InspectionPage.tsx 인라인 비-export → 공용 모듈):
   - `faAutoMemoFor`(~2099), `hydrantRemediationSymbol`(~2126). 순환 import 회피(familyCard.tsx 가 이미 그 목적으로 추출된 선례). 필요 시 `src/components/inspection/` 또는 `src/utils/` 로.
   - InspectionPage 는 추출본을 import 해 쓰게 리팩터(동작 불변 — 회귀 0 이 필수).

**3. FloorPlanPage.tsx 라우팅**:
   - indoor_hydrant/descending_lifeline 마커 → 신규 모달로 라우팅. openInspectModal 분기(~1314-1319) + 재진입 확인 경로(~1786-1808) 두 곳.
   - 마운트 블록 추가(divInspectLoc 블록 ~1753-1767 패턴 복제).
   - generic 모달 게이트에 소화전/완강기 배제 추가(`div_marker` 배제처럼).
   - generic 모달의 잘못된 소화전 증상 피커(`~63-66`) 제거(카드로 대체됐으므로).

**4. 페어 비상콘센트**: 신규 모달이 소화전 개소일 때 같은 location_no 비상콘센트를 pairedBC 로 찾아 **비상콘센트 카드도 함께 렌더·저장**(InspectionPage.tsx:2669-2674 미러). 완강기는 pairedBC 없음.
</design>

<decisions>
## 확정 결정 (사용자 승인)

- **방식 = A안** 공용 카드 모달 lockToPoint 라우팅 (DIV 선례). ✅
- **위치 = prod 직접** (staging 우회 승인 — A안 아키텍처가 prod 전용 발산이라 staging-first 가 포팅을 오히려 어렵게 함. 스키마/API 0, 손상 0, line_results→엑셀 경로는 이미 UAT 승인). ✅
- **검증 = 로컬 dev 헤드리스 CDP** (라우팅·저장 페이로드·재진입 복원·엑셀 △/Ｘ) 후에만 배포. 배포는 **메인+사용자 같은 턴 명시**로만(서브에이전트 자율 배포 금지, --branch production 필수).
- 저장 데이터는 항상 전체 카드(엑셀 매핑 필수). 표시는 일반점검 카드와 동일.
- 소화전 잘못된 증상 피커 → 카드의 올바른 i3 피커로 교체(버그 동시 해소).
- 완강기: pairedBC 없음, 4항목 단일 개소, 피난방화 sheet6 6~9행 렌더 로컬 검증.
- backfill 불필요(prod line_results 0건).
</decisions>

<open_questions_for_planner>
## 계획 중 코드/DB 조회로 확정할 것

1. **도면 전용 UI 병존**: FloorPlanPage generic 모달의 개소 정보수정/소화기 분리 버튼(inspectExtDetail 기반, ~1856-1888)이 소화전/완강기 마커에도 노출·적용되는지 확인. 소화기(fire_extinguisher) 전용이면 무관. 소화전/완강기에도 필요하면 신규 카드 모달에 그 affordance 병존 설계.
2. **비상콘센트 단독 마커**: 지하 등 소화전 마커 없는 층에 비상콘센트 단독 개소를 도면점검이 마커로 접근하는지(전용 마커 존재 여부) — D1/marker 조회. 있으면 단독 라우팅 경로도 필요.
3. **완강기 개소 확인**: 활성 완강기 개소(CP-{3F,5F,6F,7F,8F}-완강기; 8-1F is_active=0) 마커가 도면에 있는지, lockToPoint 로 1개소 고정 저장 경로 확인.

## 회귀 방지 필수 체크 (verify 단계)
- InspectionPage 헬퍼 추출 후 일반점검 소화전/비상콘센트/완강기/방화셔터 동작 **무변경**(추출 리팩터 회귀 0).
- 순환 import 없음(build 통과, tsc 0).
- 완료 카운팅·재방문 팝업(useInspectionRevisitPopup) 무변경.
</open_questions_for_planner>

<key_files>
## 핵심 파일
- `src/pages/FloorPlanPage.tsx` (~2334줄) — 라우팅·마운트·generic 모달 수정
- `src/pages/InspectionPage.tsx` (~5829줄) — 헬퍼 추출(동작 불변)
- `src/components/inspection/familyCard.tsx` (~173줄, 공용) — 재사용
- `src/components/div/DivInspectModal.tsx` — lockToPoint self-fetch **참고 template**
- `src/components/inspection/InspectionCardModal.tsx` — **신규**
- `src/data/inspectionContent.ts` — 소화전/비상콘센트/완강기 항목·피커 정의
- `src/utils/generateExcel.ts` — line_results→○/△/Ｘ (읽기만, 변경 없음 예상)
- `functions/api/inspections/[sessionId]/records.ts` — 저장 API(변경 없음, line_results 수용 확인용)
</key_files>
</content>
</invoke>
