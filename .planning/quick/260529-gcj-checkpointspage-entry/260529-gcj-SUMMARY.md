---
phase: 260529-gcj-checkpointspage-entry
plan: 01
subsystem: checkpoints
tags: [checkpoints, registry, refactor, fire-shutter]
requires: []
provides:
  - CategoryRegistryEntry interface
  - CATEGORY_REGISTRY['방화셔터'] entry
  - RegistryDrivenForm component
  - AddCheckPointRouter component
  - CheckPointModalContent.initialCategory? prop
affects:
  - CheckpointsPage 의 '개소 추가' 흐름 (mode='add')
tech_stack:
  added: []
  patterns:
    - 카테고리-별 데이터-주도 폼 (registry pattern)
    - 정규식 기반 next-seq 계산 (`(\d+)$` → max+1, 문자열 sort 함정 회피)
key_files:
  created:
    - cha-bio-safety/src/utils/checkpointRegistry.ts
  modified:
    - cha-bio-safety/src/pages/CheckpointsPage.tsx
decisions:
  - "방화셔터 entry 의 floor 리스트는 office (8F/7F/6F/5F/3F/2F), research (+1F), basement (B1~B5) 만. legacy '8-1F', '4F', 'M' 노출 차단."
  - "id 패턴 `CP-{FLOOR}-{SEQ}-FS`, qr_code = id identity, location_no = `{F가-끝나도록-보정된-FLOOR}-{SEQ}`."
  - "next-seq 는 문자열 sort 가 아닌 마지막 숫자만 정규식 추출해 max + 1 (B1F-10 < B1F-2 함정 회피)."
  - "기존 CheckPointModalContent 본체 로직은 무변경. props sig + EMPTY_CP_FORM 초기화 2-line 만 확장하여 18개 다른 카테고리 회귀 0."
  - "AddCheckPointRouter 가 카테고리 select 의 source of truth 가 되어 registry/non-registry 분기."
metrics:
  duration_sec: 208
  tasks_completed: 2
  files_created: 1
  files_modified: 1
  commits: 2
  completed_at: 2026-05-29
---

# 260529-gcj Plan 01: CheckpointsPage 레지스트리 추출 (방화셔터 첫 entry) Summary

CheckpointsPage 의 '개소 추가' 폼을 카테고리별 데이터-주도 폼으로 점진 분리한다. 첫 카테고리로 **방화셔터** 를 레지스트리로 빼냈고, 다른 18개 카테고리는 기존 CheckPointModalContent 가 그대로 처리하여 회귀 0.

## What Was Done

### Task 1 — checkpointRegistry.ts 신설 (commit `ff61eb6`)
- 신규 파일: `cha-bio-safety/src/utils/checkpointRegistry.ts` (72 lines)
- `CategoryRegistryEntry` interface 정의 — zones / floorsByZone / id·qr·locationNo 패턴 / placeholder / requiresMarker / nextSeqStrategy / optional pairCategory·assetSeparated·formFields
- `maxNumericSuffixPlusOne` 공용 헬퍼 — `/(\d+)$/` 정규식으로 마지막 숫자 그룹 추출 후 max+1 (빈 리스트면 1)
- `CATEGORY_REGISTRY['방화셔터']` 1개 entry:
  - office: `['8F', '7F', '6F', '5F', '3F', '2F']` (8-1F / 4F / 1F 없음)
  - research: `['8F', '7F', '6F', '5F', '3F', '2F', '1F']` (8-1F / 4F 없음)
  - basement: `['B1', 'B2', 'B3', 'B4', 'B5']` (M 없음)
  - idPattern: `CP-${floor}-${seq}-FS`
  - locationNoPattern: floor 가 'F' 로 안 끝나면 'F' 추가 후 `-${seq}` (예: 'B1' → 'B1F-1', '8F' → '8F-1')

### Task 2 — CheckpointsPage.tsx 분기 (commit `e5d5e15`, +177/-4)
- `cha-bio-safety/src/pages/CheckpointsPage.tsx` 수정 범위:
  - line 10: `import { CATEGORY_REGISTRY, type CategoryRegistryEntry } from '../utils/checkpointRegistry'`
  - lines 71–197: 새 `RegistryDrivenForm` 컴포넌트 (구역/층/개소명/설명 + 미리보기 ID·위치번호 + 저장 mutation)
  - lines 199–239: 새 `AddCheckPointRouter` 컴포넌트 (카테고리 select source of truth → registry/non-registry 분기 → 비-registry 케이스는 `<CheckPointModalContent ... initialCategory={category} />` 위임)
  - lines 267–273: `CheckPointModalContent` props sig 에 `initialCategory?: string` 추가 + 초기 form state `{ ...EMPTY_CP_FORM, category: initialCategory ?? '' }` (2-line 변경, 나머지 로직 무변경)
  - lines 860–866: modal 렌더 분기 — `modal.mode === 'add'` 면 `<AddCheckPointRouter />`, 그 외 (edit) 면 기존 `<CheckPointModalContent />`

## Build Result

- `cd cha-bio-safety && npm run build` → **PASS** (17.06s)
- TypeScript / Vite 에러 0건
- `dist/assets/CheckpointsPage-B5yhrAOu.js` 28.60 kB (gzip 7.49 kB)
- PWA service worker rebuild OK (precache 82 entries, 7940.14 KiB)
- 새 chunk warning 없음 (기존 vendor 청크만 500 kB 초과)

## Verification Snapshot

- `grep "RegistryDrivenForm\|AddCheckPointRouter\|CATEGORY_REGISTRY" CheckpointsPage.tsx` → 6 hits (import + 2 함수 정의 + isRegistry 체크 + entry 사용 + JSX 분기)
- `grep -c "function CheckPointModalContent"` → 1 (legacy 컴포넌트 보존)
- 신규 hex 색상 0 — `#fff` 만 2개 추가 (기존 파일에 이미 5회 사용 중인 white-on-accent 패턴 그대로)
- `var(--*)` 토큰 외 신규 색상 토큰 0
- 기존 `INPUT_STYLE` / `LABEL_STYLE` 상수 그대로 재사용

## Deviations from Plan

None — plan 의 Step 1~5 그대로 적용. `RegistryDrivenForm` 의 nextSeq local 변수에 `: number | null` 명시 타입 1건만 plan 의 단순 implicit 추론 대비 안전성 강화 (TS 컴파일 0 warning 도움).

## Known Stubs / Limitations

- `mode='edit'` 는 registry 처리 X — 이번 wave 의도된 out-of-scope. edit 진입 시 카테고리 무관 기존 CheckPointModalContent 가 그대로 렌더됨.
- `formFields` 활용 entry 0건 — 방화셔터엔 추가 필드 없음. 소화기 카테고리를 옮길 때 (자산 테이블 분리, type/manufacturer/approval_no 등 ExtState 필드) 첫 사용 예정.
- `pairCategory` 활용 entry 0건 — DIV ↔ 컴프 pair 룰을 옮길 때 첫 사용 예정.
- `requiresMarker: true` 활용 entry 0건 — 유도등 같이 도면 마커가 먼저 있어야 cp 가 생기는 카테고리를 옮길 때 첫 사용.

## Threat Flags

없음. 이 wave 는 클라이언트 UI 분기 + 신규 utils 파일 1개. API 엔드포인트 / DB 스키마 / 인증 흐름 변경 0. 기존 `functions/api/check-points/index.ts` POST 검증(role==='admin' + id/qrCode/floor/zone/location/category non-empty) 그대로 통과.

## User Visual Verification Guide

데스크톱 브라우저에서 다음 시나리오로 확인 권장:

1. 로그인 (admin 권한 staff) → `/checkpoints` 페이지 진입
2. 우상단 '개소 추가' 버튼 클릭 → 모달 표시
3. 카테고리 select 에서 **방화셔터** 선택 → 모달이 새 폼으로 전환되는지 확인
   - 카테고리 박스가 read-only 'var(--bg2)' 배경
   - 구역 3 버튼 (사무동/연구동/지하) 노출
4. 구역 = '사무동' 선택 → 층 select 에 `8F, 7F, 6F, 5F, 3F, 2F` 만 나오는지 (8-1F, 4F, 1F 없음)
5. 층 = '8F' 선택 → 미리보기 박스에 `ID: CP-8F-{nextSeq}-FS`, `위치번호: 8F-{nextSeq}` 표시 확인
6. 개소명 입력 → 저장 → toast `'개소가 추가되었습니다'` + 목록에 신규 항목 노출
7. 회귀 검증: 카테고리를 **소화기** 로 바꿔 → 기존 폼 (소화기 자산 필드 type/manufacturer 등) 그대로 노출되는지 확인 (initialCategory='소화기' 로 전달되어 자동 선택된 상태로 시작)
8. 회귀 검증: 기존 개소의 '편집' 버튼 클릭 → 기존 CheckPointModalContent 가 그대로 노출 (mode='edit' 경로)

## Commits

| Hash      | Type | Description                                               |
| --------- | ---- | --------------------------------------------------------- |
| `ff61eb6` | feat | checkpointRegistry 신설 + 방화셔터 entry                  |
| `e5d5e15` | feat | CheckpointsPage 에 RegistryDrivenForm + 방화셔터 분기     |

## Next Wave Candidates

사용자가 데스크톱에서 방화셔터 entry 시각 검증 통과 후 후속 wave 진행:

1. **DIV / 컴프 pair entry** — `pairCategory` 필드 첫 사용 사례 (DIV 저장 시 자동으로 컴프 cp 동시 생성)
2. **유도등** — `requiresMarker: true` 첫 사례 (도면 마커 선행 등록 후 cp 자동 생성)
3. **소화기** — `assetSeparated: true` + `formFields` 첫 사례 (extinguishers 테이블 + ExtState 필드들)
4. **소화전 / 완강기 / 자탐 / 스프링클러** — 단순 카테고리, 방화셔터와 유사한 entry 형태

장기 목표: CheckPointModalContent 의 19-카테고리 하드코딩이 모두 registry entry 로 분리되면 CheckPointModalContent 자체를 제거하고 RegistryDrivenForm 단일 경로로 통합.

## Self-Check: PASSED

- FOUND: `cha-bio-safety/src/utils/checkpointRegistry.ts`
- FOUND: `cha-bio-safety/src/pages/CheckpointsPage.tsx` (edited)
- FOUND: `cha-bio-safety/dist/` (빌드 산출물)
- FOUND commit `ff61eb6`
- FOUND commit `e5d5e15`
