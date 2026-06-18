---
phase: quick-260618-kqk
plan: "01"
status: complete
subsystem: floorplan-markers / div-comp
tags: [staging-sync, checkpoint-name, hydrant, lifeline, div-comp-pairing, trigger-0091, useDivNames]
dependency_graph:
  requires: [project_checkpoint_name_3store_divergence, 260609-ekw-CP-FE-sync-guard]
  provides: [소화전/완강기 마커 개소명 모달 표시·수정, DIV/COMP 단일출처 편집·페어링]
  affects: [FloorPlanPage 마커 모달, marker PUT, DivPage, InspectionPage, DailyReport, check_points.description]
tech_stack:
  added: [migration 0091 trigger sync_comp_description_on_div_update, useDivNames hook]
  patterns: [staging-to-prod-sync, blocklist-not-allowlist, single-source-description, adversarial-workflow-verify]
key_files:
  created:
    - cha-bio-safety/migrations/0091_div_comp_description_pairing.sql
    - cha-bio-safety/src/hooks/useDivNames.ts
  modified:
    - cha-bio-safety/functions/api/floorplan-markers/[id].ts
    - cha-bio-safety/functions/api/floorplan-markers/index.ts
    - cha-bio-safety/src/utils/api.ts
    - cha-bio-safety/src/pages/FloorPlanPage.tsx
    - cha-bio-safety/src/pages/DivPage.tsx
    - cha-bio-safety/src/pages/InspectionPage.tsx
    - cha-bio-safety/src/utils/dailyReportCalc.ts
    - cha-bio-safety/src/pages/DailyReportPage.tsx
    - cha-bio-safety/src/utils/generateExcel.ts
decisions:
  - "소화전/완강기 cpId 는 CP-SH-/CP-WK- 가 아니라 층 기반 → allowlist 불가, DIV/COMP blocklist→그 외 location 방식"
  - "DIV/COMP 개소명 단일출처 = check_points.description (location 은 'B1층 DIV #N' 구조 라벨 보존)"
  - "CP-B2-8-SH 데이터는 SQL 무수정 — 버그 수정 후 사용자가 모달에서 직접 교정"
  - "0091 트리거 코드 배포 전 D1 선적용 (HANDOFF STEP 1 — 코드만 먼저 올리면 COMP 미동기)"
  - "executor worktree 미사용 — main 기준 분기 사고(feedback_worktree_isolation_bases_off_main) 회피, 메인 직접 적용"
metrics:
  duration: "~30분 (RCA→사전점검→patch→trigger→적대검증→배포)"
  completed: "2026-06-18"
---

# Phase quick-260618-kqk: 도면 마커 개소명 수정 동기 확장 (staging fd0f517 → prod sync) Summary

**One-liner:** staging(cbc7119-data) 검증분 11파일 + 0091 트리거를 prod 이관 — 소화전/완강기 마커 개소명 공란·미반영 교정(기능①) + DIV/COMP 개소명 단일출처 편집·컴프 페어링(기능②).

## What Was Built

사용자 신고("CP-B2-8-SH 개소명이 마커 수정 모달에서 공란이고 수정해도 반영 안 됨")에서 출발. RCA 로 **소화전·완강기 마커 전체(119개)의 구조 버그**임이 드러나 staging 에서 두 기능을 묶어 구현·검증 후 prod 이관.

### 기능 ① 소화기/소화전/완강기 마커 개소명 공란·미반영 교정
- **RCA**: 소화전(indoor_hydrant)/완강기(descending_lifeline)는 개소명을 `check_points.location` **단일** 저장하고 `marker.label=null` 이 정상(소화기와 달리 extinguishers 행 없음). prod 실측: indoor 107중 106 null, lifeline 13 전부 null. 모달 init 이 label 기준이라 **공란** + 저장 PUT 동기가 CP-FE- 한정이라 **미반영**.
- **교정**: `markerRealName()` 헬퍼(div_marker→cp_description, 그 외→cp_location) 표시 4곳 + 모달 init / PUT 동기 분기 `isDivLike`(CP-DIV-/CP-COMP-)→description, `else if cpId`→location, extinguishers→CP-FE- 한정 / `editLabel.trim()` 서버 가드 일치.
- **소화전/완강기 cpId 는 CP-SH-/CP-WK- 가 아니라 층 기반**(CP-1F-/CP-B5-/CP-8-1F- 변종) → allowlist 불가, **DIV/COMP blocklist→그 외 location** 방식(D1 실측). 코드만, D1 데이터 무수정(미래 편집부터 동기).

### 기능 ② DIV/COMP 개소명 단일출처(check_points.description) 편집 + 컴프레셔 페어링
- DIV 실명('지) 식당 뒤')을 도면 마커 모달서 편집 → 압력관리·컴프점검·DIV점검·일일보고서·지도마커 반영 + 짝 CP-COMP- 자동 동일.
- **0091 트리거** `sync_comp_description_on_div_update`(DIV description→COMP 미러 단방향, 비재귀) + **useDivNames** 훅(라이브 D1 description 우선 + divPoints.ts 상수 오프라인 fallback) + DivPage/InspectionPage(DivTrend/DivModal/CompressorModal)/DailyReport/dailyReportCalc repoint + div_marker 를 isAccessBlocked 판정서 제외(2곳, description=실명이라 '접근불가' 오인 차단).
- `generateExcel.DIV_NAMES` 는 점검표 Excel 전용 분리(주석만, 편집 무반영 — 사용자 결정).

## 적용 절차 (HANDOFF 따름)

| STEP | 내용 | 결과 |
|------|------|------|
| 사전점검 | non-FE ext / SH-WK prefix / DIV-COMP mismatch / 0078·0091 | 전부 통과(0/0/0=34=34/0, 0078 존재·0091 부재) |
| STEP1 | 0091 트리거 prod cha-bio-db 적용 | trig=1, mismatch=0 (heal no-op) |
| STEP2 | git apply --directory=cha-bio-safety (10파일) + generateExcel 수동 | 11파일, grep 마커 전수 확인 |
| STEP3 | tsc + build | 0 errors, precache 84 |
| 게이트 | 적대검증 workflow 5차원 | **PASS (bug/concern 0)** |
| STEP3 | wrangler 배포 | https://8ba8d790.cbc7119.pages.dev |

## Verify Gate Results

| Gate | Result |
|------|--------|
| prod 사전점검 6종 | PASS |
| git apply dry-run (10파일, generateExcel 제외) | PASS |
| grep 마커 (`[id].ts` isDivLike·index cp_description·FloorPlanPage markerRealName·useDivNames·DivPage/Inspection getDivName) | PASS (대괄호 경로 실적용 확인) |
| 0091 D1 적용 | trig=1, mismatch=0 |
| tsc --noEmit | 0 errors |
| npm run build | precache 84 |
| **적대검증 workflow 5차원** | **PASS** (put-branch/floorplan/divnames/trigger/regression 전부 pass, bug 0) |
| 배포 dist 청크 | FloorPlanPage-DH7F0DmD.js cp_description/check-points/div_marker + useDivNames 청크 |

## 적대검증 5차원 (workflow wf_683e94bf-6d5)

5개 에이전트가 prod D1 실측 + 코드로 반박 시도 → 회귀/손상 근거 0:
- **put-branch** PASS: 마커 451개 라우팅 매트릭스 100% 정합. isDivLike 가 DIV/COMP 만, 소화전/완강기 층 기반이라 안 걸림. 소화기 location+ext 무회귀. DIV location 보존.
- **floorplan-display** PASS: markerRealName 4곳 일관, 공란 fix, div_marker 접근불가 제외가 비-div 판정 무파손, trim 서버 일치.
- **divnames-hook** PASS(low): liveMap 키(location_no) prod 34개 byte-identical, 오프라인 fallback 안전.
- **trigger-migration** PASS(low): 34쌍 슬라이스 정확, 비재귀, idempotent.
- **regression-edge** PASS(low): 유도등/감지기/스프링클러 label fallback 무회귀, 소화기 3원 동기 유지.

## Deviations from Plan

- generateExcel.ts hunk 는 prod DIV_NAMES 양식(260529-vwc/260612-e17)과 컨텍스트 불일치로 git apply reject → 주석 6줄 수동 적용(HANDOFF §4 예견, 기능 영향 0).
- executor worktree 미사용 — 메인 Claude 직접 적용(`feedback_worktree_isolation_bases_off_main` 사고 회피).
- 트리거 왕복(HANDOFF §6 D1 prod 데이터 변경)은 생략 — trig=1 + 적대검증 PASS + SQLite 엔진 발화 보장으로 충분, 실발화는 사용자 UI 검증으로.

## 잔여 (사용자)

- **UI 검증**: 소화전/완강기 모달 개소명 표시·수정→일반점검/QR 일치 / DIV 편집→COMP·압력관리·점검 반영 / 소화기 회귀無.
- **CP-B2-8-SH('B201 강의실 옆')**: 버그 수정됐으니 모달에서 직접 교정(SQL 무수정).
- staging 콘솔에 "prod 적용 완료" 회신 + HANDOFF md/patch 삭제(staging 쪽).

## Self-Check: PASSED

- 11파일 변경 + 0091 트리거 prod 적용 — FOUND
- Commit `06159952` — FOUND
- 배포 https://8ba8d790.cbc7119.pages.dev — DONE
