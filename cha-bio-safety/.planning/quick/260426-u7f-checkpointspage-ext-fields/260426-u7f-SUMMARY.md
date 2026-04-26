---
status: complete
phase: 260426-u7f
plan: 01
subsystem: checkpoints
tags: [checkpoints, extinguishers, modal, ui, react-query]
requires:
  - extinguisherApi.create  # functions/api/extinguishers/create.ts (서버 자동 발급 mgmt_no/cpId/qrCode)
provides:
  - checkpoints-add-modal-extinguisher-routing
affects:
  - src/pages/CheckpointsPage.tsx
tech-stack:
  added: []
  patterns:
    - "분기 mutationFn (isExtCategory ? extinguisherApi.create : checkPointApi.create)"
    - "conditional JSX (<>{isExtCategory && (...)}</>) 7-필드 블록 + locationNo/description 숨김"
    - "zoneMap 영문→한글 변환 (FloorPlanPage 패턴 그대로)"
key-files:
  created: []
  modified:
    - src/pages/CheckpointsPage.tsx
decisions:
  - "extForm 은 카테고리 변경 시 reset 하지 않는다 (이전 입력 유지가 자연스러움; isExtCategory=false 시 자동 무시)"
  - "mode='edit' 에서는 소화기 전용 필드 노출 X — extinguishers update API 가 아직 없어 후속 plan 으로 이연"
  - "위치번호 필드는 소화기일 때 숨김 (서버 mgmt_no 자동 발급)"
metrics:
  duration: "2m 33s"
  completed: "2026-04-26T12:51:33Z"
  tasks_completed: 2
  files_modified: 1
  lines_added: 111
  lines_deleted: 12
---

# Phase 260426-u7f Plan 01: CheckpointsPage 카테고리=소화기 분기 추가 Summary

`/checkpoints` "개소 추가" 모달에서 카테고리="소화기" 선택 시 종류 셀렉트 + 6개 선택 필드를 노출하고 저장 시 `extinguisherApi.create` 로 라우팅하여 `extinguishers` + `check_points` 양쪽 행을 동시에 생성하도록 한다.

## 변경 요약

| 항목                          | 위치                                                  | 내용                                                                                  |
| ----------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| import                        | line 6                                                | `extinguisherApi` 추가                                                                |
| ExtState 타입 + EMPTY_EXT     | ZONE_FLOORS 직후                                      | 7필드(type/manufacturer/manufactured_at/approval_no/prefix_code/seal_no/serial_no)    |
| extForm + isExtCategory       | confirmDeactivate state 직후                          | 소화기 분기 플래그                                                                    |
| createMutation 분기           | `mutationFn: async () => { if (isExtCategory) ... }` | extinguisherApi.create vs checkPointApi.create                                        |
| onSuccess 토스트              | createMutation                                        | `소화기 등록 완료 (${mgmtNo})` 또는 `개소가 추가되었습니다`                           |
| canSave 분기                  | line ~211                                             | 소화기일 때 type/zone/floor 추가 필수                                                 |
| JSX — 소화기 전용 7필드 블록  | 층 셀렉트 직후, 개소명 직전                           | 종류 셀렉트(분말 20kg/분말 3.3kg/할로겐/K급) + 6 input                                 |
| JSX — 위치번호/설명 숨김      | 개소명 직후                                           | `{!isExtCategory && (...)}`                                                            |

## 회귀 가드 통과 항목

- `updateMutation` (mode='edit') — 무수정
- `deactivateMutation` (비활성화 흐름) — 무수정
- `isMarker` 분기 (FPM- 마커) — 무수정
- `handleSave` — 무수정 (분기 로직은 createMutation 내부)
- 자동 기본값 useEffect (125~147 줄) — 무수정 (소화기일 때도 form.locationNo set 되지만 서버 호출에 미사용 → 무해)
- 페이지 레벨 코드 (목록 렌더링/검색/필터/정렬) — 무수정
- mode='edit' 모달 JSX — 무수정 (소화기 전용 필드 노출 X)

git diff --stat: `1 file changed, 111 insertions(+), 12 deletions(-)` — 보호 영역(updateMutation/deactivateMutation/isMarker) diff 라인 0건 확인.

## Deviations from Plan

None — 플랜의 A~F 단계 그대로 실행. 추가 reset useEffect 만들지 않음(플랜 명시).

## 배포 정보

- 빌드: `npm run build` PASS (11.29s, dist/ 생성, sw.js 67 entries 6002 KiB precache)
- 배포: `npx wrangler pages deploy dist --branch production --commit-message "checkpoints add modal: extinguisher fields and routing"`
- 배포 URL: **https://2e9aa607.cbc7119.pages.dev**
- 배포 시각: 2026-04-26T12:51:33Z (KST 21:51)
- 출력 검증: "Deployment complete!" + `2e9aa607.cbc7119.pages.dev` URL — "Preview" 단어 없음 → production 배포 확정

## 사용자 검증 절차

**중요:** PWA 캐시(SW) 때문에 즉시 반영 안 될 수 있음. **홈 화면 아이콘 삭제 후 재추가 필수** (운영 메모리 feedback_pwa_cache_invalidation).

### 실험군 — 카테고리=소화기 신규 등록

1. PWA 재설치 → 로그인 (admin) → `/checkpoints` 진입
2. 우상단 "+" → "개소 추가" 모달 오픈
3. 카테고리 = **소화기** 선택
4. 다음 필드 노출 확인:
   - 종류 셀렉트(4 옵션): 분말 20kg / 분말 3.3kg / 할로겐 / K급
   - 제조업체 / 제조년월 / 형식승인번호 / 접두문자 / 증지번호 / 제조번호 (6 input)
5. 다음 필드 **숨김** 확인: 위치번호, 설명
6. 종류 미선택 상태 → "저장" 비활성화 확인
7. 구역(연/사/공) + 층 + 개소명 + 종류 입력 후 저장
8. 토스트: **"소화기 등록 완료 (연-XX-NN)"** (서버 자동 발급 mgmt_no 노출)
9. **DB 양쪽 행 확인:**
   - `/extinguishers` 페이지에서 새 행 노출 (mgmt_no/제조사 등 입력값 반영)
   - `/checkpoints` 목록(소화기 카테고리)에서 새 개소 노출 (`CP-FE-XXXX` id 패턴)

### 대조군 — 비-소화기 카테고리 (회귀 검증)

1. 모달 재오픈, 카테고리 = **소화전** (또는 자동화재탐지설비/스프링클러 등)
2. 종류/제조업체/… 추가 필드 **노출되지 않음** 확인
3. 위치번호/설명 필드 **노출** 확인
4. 저장 → 토스트: "개소가 추가되었습니다" (변경 전과 동일)

### mode='edit' (회귀 검증)

1. 기존 소화기 개소 클릭 → 편집 모달 오픈
2. 소화기 전용 필드 **노출되지 않음** 확인 (변경 전과 동일)
3. 저장 → 정상 동작 확인

### FPM- 마커 (회귀 검증)

1. 카테고리 = 유도등 → 마커 항목 클릭 → 편집 모달
2. label/description/zone 만 편집 가능, 다른 필드 변경 금지 — 동작 동일 확인

## Self-Check: PASSED

- 파일 존재 확인:
  - `src/pages/CheckpointsPage.tsx` — FOUND
  - `.planning/quick/260426-u7f-checkpointspage-ext-fields/260426-u7f-SUMMARY.md` — FOUND (이 파일)
- 커밋 존재 확인:
  - Task 1: `a539828` feat(260426-u7f-01): add extinguisher fields and routing in CheckpointsPage add modal — FOUND
- TypeScript: `npx tsc --noEmit` 0 에러
- grep 검증:
  - `extinguisherApi` 2회 (import + create call)
  - `isExtCategory` 6회
  - 분말 20kg / 분말 3.3kg / 할로겐 / K급 — 4개 옵션 모두 노출
- 회귀 가드: `updateMutation|deactivateMutation|isMarker` 10회 — diff 라인 0건
- 빌드 + 배포: 성공 (URL 발급)

## Deferred — 본 plan 에서 다루지 않음

- `mode='edit'` 에서도 소화기 전용 필드 편집 가능하게 (서버 update API 추가 필요)
- 종류 옵션 동적화 (현재 4개 하드코딩 — DB 마스터 테이블 연동 검토)
- 카테고리 전환 시 extForm 자동 reset (현재 보존 동작이지만 UX 검토 후 결정)
