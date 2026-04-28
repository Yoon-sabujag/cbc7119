---
phase: quick-260428-lha
plan: 01
subsystem: floorplan-inspection
tags: [paired-inspection, hydrant, bc, modal, floorplan]
provides:
  - "FloorPlanPage hydrant 마커 인라인 점검 모달의 paired BC 입력+저장"
requires:
  - "InspectionPage 페어 모달 패턴 (선행 phase 에서 도입)"
affects:
  - "cha-bio-safety/src/pages/FloorPlanPage.tsx"
key-files:
  modified:
    - cha-bio-safety/src/pages/FloorPlanPage.tsx
decisions:
  - "BC fetch 는 selected 가 hydrant 마커일 때만 inspectionApi.getCheckpoints(selected.floor) 호출 — 기존 checkpoints state 는 편집 모드에서만 채워지므로 비신뢰"
  - "atomic 보장(서버 batch endpoint)은 out-of-scope — SH 성공 후 BC throw 시 SH 만 살아남음, 동일 InspectionPage 페어 모달 동작과 동일"
  - "결과 버튼 인라인 스타일 패턴은 SH 결과 버튼(라인 1499) 과 동일 코드 재사용 — Tailwind/INSPECT_RESULT_OPTIONS import X"
  - "취소/저장 버튼 자체 마크업은 disabled/라벨/style 의 OR 조건에 inspectBcPhoto.uploading 만 추가, 위치/갯수/배경색/라벨 텍스트 그대로"
metrics:
  duration_minutes: ~10
  completed_date: 2026-04-28
  tasks: 2  # executor 가 자율 실행 (Task 3 체크포인트는 사용자 시연 대기)
  files_modified: 1
  lines_added: 94
  lines_removed: 3
---

# Quick Task 260428-lha: FloorPlanPage paired BC modal Summary

**One-liner:** FloorPlanPage 평면도 인라인 점검 모달의 hydrant(소화전) 마커에 InspectionPage 페어 모달과 동일한 비상콘센트(BC) 입력 섹션 + 직렬 저장 로직을 이식해 4-27 박보융 BC 누락 사고 재발 방지.

## Problem

디버그 세션 `hydrant-count-mismatch` 의 fix B-1. 평면도 → 소화기·소화전 plan → SH 마커 탭 → 단독 저장 경로가 InspectionPage 의 페어 저장 패턴을 따르지 않아 같은 location_no 의 BC 가 누락됐다 (B1-6 4-27 사고). InspectionPage 페어 모달 패턴을 평면도에도 도입.

## Solution Overview

InspectionPage:2795/2810/2980/3001/3134/3406 라인의 페어 모달 패턴 그대로 이식.

1. **state 추가** (FloorPlanPage:243-247): `inspectBcPhoto`, `inspectBcResult`, `inspectBcMemo`, `pairedBC`.
2. **pairedBC 식별 useEffect** (FloorPlanPage:295-313): `inspectModal === true && planType === 'extinguisher' && marker_type === 'indoor_hydrant' && check_point_id` 조건일 때 `inspectionApi.getCheckpoints(floor)` 로 같은 층 CP 전수 조회 → SH CP 의 `locationNo` 기준 `category === '비상콘센트'` 매칭 → 결과 set.
3. **모달 close 시 BC reset** (FloorPlanPage:316-323): BC state 자동 초기화.
4. **두 진입점 reset 추가**: `openInspectModal` (line 1010) + 재진입 wasCompleted 분기 (line 1454) 에서 BC state 리셋.
5. **저장 onClick 확장**: SH submitRecord 직후 `if (pairedBC) { upload + submitRecord(BC) }`. SH 가 throw 하면 try/catch 가 BC 호출 자동 스킵.
6. **저장 버튼 disabled/라벨**: `inspectBcPhoto.uploading` 을 OR 로 결합 — 사진 업로드 중 더블탭 방지. 위치/갯수/배경색/라벨 자체는 변경 없음.
7. **모달 본문 BC 섹션 렌더** (line 1578-1614): `{pairedBC && (...)}` 가드 + divider + 카테고리/위치/설명 박스 + 결과 3버튼 + 특이사항 textarea + PhotoButton. 인라인 스타일은 SH 섹션과 동일한 패턴 재사용.

## Files Modified

| File | Lines added | Lines removed | Purpose |
|------|-------------|---------------|---------|
| `cha-bio-safety/src/pages/FloorPlanPage.tsx` | 94 | 3 | paired BC state + 식별 useEffect + reset hooks + 저장 onClick 확장 + 본문 BC 섹션 |

총 1 파일, +94/-3 (commit 합계).

## Commits

| # | Hash | Message |
|---|------|---------|
| 1 | `bcb4279` | `fix(quick-260428-lha): FloorPlanPage paired BC state + 직렬 저장 핸들러` |
| 2 | `db7ced6` | `fix(quick-260428-lha): FloorPlanPage paired BC 섹션 모달 본문 렌더` |

## Pattern Source (InspectionPage 라인 매핑)

| 패턴 | InspectionPage | FloorPlanPage 적용 위치 |
|------|---------------|------------------------|
| `bcPhoto = usePhotoUpload()` | 2795 | 243 (`inspectBcPhoto`) |
| `bcResult/bcMemo state` | 2810-2811 | 244-245 |
| `pairedBC useMemo` | 2980-2985 | useEffect (295-313) — FloorPlanPage 는 marker→CP 매핑이 비동기라 useEffect+state 로 대체 |
| selectedCP 변경 시 BC reset | 3001-3003 | 두 진입점 (1003, 1454) + close 시 useEffect (316-323) |
| `handleSave 페어 저장` | 3157-3161 | 저장 onClick 내부 SH submitRecord 직후 (line 1620-1633) |
| paired 렌더 | 3406-3436 | 본문 BC 섹션 (line 1578-1614) |

## Verification

### Automated (executor)
- ✅ `cd cha-bio-safety && npm run build` 통과 (FloorPlanPage chunk 51.65 kB → 53.55 kB)
- ✅ `git diff` 로 FloorPlanPage.tsx 외 다른 파일 변경 0
- ✅ 취소/저장 버튼 자체 마크업: `disabled` 와 라벨 조건식의 OR 항만 확장, 위치/갯수/배경색/라벨 텍스트/onClick handler shape 그대로

### Human (Task 3 체크포인트 — 사용자 배포 후 시연 대기)
1. 사용자 wrangler 프로덕션 배포 (`--branch=production`).
2. PWA 재설치 / 강제 리로드.
3. 평면도 → "소화기·소화전" plan → 임의 층(예: 4F, 8-1F) 의 indoor_hydrant 마커 탭 → 모달 본문에 BC 섹션이 노출되는지 확인.
4. SH 결과 + BC 결과 선택 후 저장 → 토스트 1회, 모달 닫힘.
5. `/inspection` 카드 카운트 또는 D1 직접 조회로 같은 staff_id, 같은 또는 직렬로 10초 이내 timestamp 의 SH+BC 페어 기록 확인.
6. (회귀) 유도등 plan / 매핑 없는 SH → BC 섹션 미표시 확인.

## Out of Scope (재확인)

- ❌ **atomic 보장 (서버 batch endpoint)**: SH 성공 + BC throw 시 SH 만 살아남는 시나리오는 InspectionPage 페어 모달과 동일하게 클라이언트 직렬 호출로 두었음. 별도 phase 에서 `/api/inspections/{sid}/records:batch` 같은 엔드포인트로 트랜잭션 보장.
- ❌ **isCpCompleted 공유 유틸 단일화**: 현재 FloorPlanPage / InspectionPage / Dashboard 가 각자 비슷한 룰을 inline 으로 가짐. 다음 정리 후보.
- ❌ **InspectionPage picker strict 룰 적용**: 별도 phase.
- ❌ **fix B-2 / fix C** (디버그 세션의 다른 fix 항목): 본 quick 의 범위 외.

## Deviations from Plan

**None — plan 그대로 실행.**

플랜에 명시된 두 entry point reset (openInspectModal, 재진입 wasCompleted 분기) 모두 처리. 플랜이 권장한 fetch-on-open 패턴 사용 (checkpoints state 는 편집 모드에서만 채워지므로 비신뢰 — 플랜이 미리 명시).

## Notes / Follow-ups

- (메모) FloorPlanPage 와 InspectionPage 의 페어 로직 (BC fetch + state + reset + 직렬 저장) 이 두 파일에 거의 그대로 중복. 차후 `usePairedBC(selectedCP)` 같은 커스텀 훅으로 추출 가능. 단 InspectionPage 는 동기 `useMemo` (allCheckpoints 가 이미 메모리), FloorPlanPage 는 비동기 fetch 라 시그니처 분기 필요.
- (운영) 5월 법정점검 시 평면도 경로로 SH 점검을 시도하는 방재팀원이 있다면 BC 섹션이 자동 노출되는지 사용 직후 D1 조회로 무결성 확인 권장.

## Self-Check: PASSED

- ✅ `cha-bio-safety/src/pages/FloorPlanPage.tsx` 수정 확인 (commit bcb4279, db7ced6)
- ✅ commit `bcb4279` 존재 (Task 1)
- ✅ commit `db7ced6` 존재 (Task 2)
- ⏳ Task 3 (human-verify checkpoint): 사용자 프로덕션 배포 + 시연 대기
