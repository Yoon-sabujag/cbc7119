---
phase: quick-260513-lz1
plan: 01
subsystem: legal-findings
tags: [legal, finding, edit, picker, shared-component, assistant-parity]
dependency_graph:
  requires:
    - legalApi.updateFinding (src/utils/api.ts)
    - useMultiPhotoUpload hook
    - PhotoSourceModal component
  provides:
    - FindingFormSheet shared component (create + edit mode)
    - LegalFinding PUT (admin-free, assistant 가능)
  affects:
    - src/pages/LegalFindingsPage.tsx (모바일 라운드 상세)
    - src/pages/LegalPage.tsx FindingsPanel (데스크톱 중앙 패널)
tech_stack:
  added: []
  patterns:
    - "공유 form sheet 컴포넌트 + mode='create'|'edit' prop"
    - "best-effort reverse parsing (description ' — ' split, location 공백 split)"
    - "existingKeys + new uploadAll() 합계 5장 제한"
key_files:
  created:
    - src/components/FindingFormSheet.tsx
  modified:
    - functions/api/legal/[id]/findings/[fid].ts
    - src/pages/LegalFindingsPage.tsx
    - src/pages/LegalPage.tsx
decisions:
  - "B안 picker UX 재사용 (등록과 동일한 시안) — A안 인라인 textarea 채택 안 함"
  - "backend PUT admin 가드 제거 (DELETE 와 정합)"
  - "수정 버튼은 삭제 버튼 LEFT 에 배치 (모바일·데스크톱)"
  - "사진 5장 제한은 existingKeys + photos.slots 합산 기준"
  - "description reverse parse: ' — ' split, 첫 토큰 FINDING_ITEMS 매칭 시 inspectionItem, 그 외 전체 description (직접입력 강제 X)"
  - "location reverse parse: 공백 split, 첫 토큰 ZONES.label, 둘째 토큰 ZONE_FLOORS[zone], 나머지 locationDetail"
metrics:
  duration_minutes: 5
  completed_date: "2026-05-13"
  task_count: 3
  files_changed: 4
---

# Quick 260513-lz1: 법정 점검 지적사항 수정 기능 Summary

종합정밀/작동기능 라운드의 지적사항 카드에 '수정' 버튼을 추가하여, 등록 시 사용한 picker UX(구역/층/지적항목/위치상세/내용/사진 5장) 를 그대로 재사용한 prefill 시트로 수정할 수 있도록 함. 모바일(LegalFindingsPage) + 데스크톱(LegalPage > FindingsPanel) 양쪽 카드 모두에서 동작하며 assistant 권한도 가능하도록 PUT 핸들러의 admin 가드 제거.

## What Was Built

### 1. 백엔드: PUT admin 가드 제거 (Task 1)

`functions/api/legal/[id]/findings/[fid].ts` 의 `onRequestPut` 에서:
- `if (role !== 'admin')` 블록(80-82) 제거
- 더 이상 사용하지 않는 `data` 구조분해 변수 정리 (시그니처를 `({ request, env, params })` 로 단순화)
- 기존 동작(존재 확인 → COALESCE 부분 업데이트 → photo_keys 0-5 검증) 모두 유지
- DELETE 핸들러에 admin 체크가 없는 것과 정합

### 2. FindingFormSheet 공유 컴포넌트 (Task 2)

새 파일 `src/components/FindingFormSheet.tsx`:
- LegalFindingsPage 인라인 `FindingBottomSheet` (66-322 라인) 를 별도 컴포넌트로 추출
- `mode: 'create' | 'edit'` prop 으로 분기
- **create mode:** 기존 동작과 100% 동일한 페이로드/invalidation/토스트
- **edit mode (신규):**
  - `parseFindingForEdit()` helper 로 description / location reverse parsing → picker prefill
  - `existingKeys` state: 기존 사진을 72×72 미리보기 타일로 렌더, 각 ✕ 버튼으로 개별 제거
  - 사진 첨부 버튼은 `existingKeys.length + photos.slots.length < 5` 조건으로 표시
  - 저장 시 `[...existingKeys, ...newKeys]` 합쳐서 `legalApi.updateFinding(...)` 호출
  - onSuccess invalidate 에 `['legal-finding', scheduleItemId, finding.id]` 추가 (FindingDetailPanel 캐시)
  - 헤더 타이틀 '지적사항 수정', 제출 버튼 '저장', 토스트 '수정되었습니다.'
- ZONES / ZONE_FLOORS / FINDING_ITEMS 상수를 컴포넌트 파일 내부에 보유 (LegalFindingsPage 측에서 제거됨)

### 3. 페이지 연결 (Task 3)

**LegalFindingsPage.tsx:**
- 인라인 `FindingBottomSheet` 정의 + `BottomSheetProps` 인터페이스 + ZONES/ZONE_FLOORS/FINDING_ITEMS 상수 제거
- 미사용 import 정리 (`useMutation`, `useMultiPhotoUpload`, `PhotoSourceModal`)
- `FindingFormSheet` import 추가
- `editingFinding: LegalFinding | null` state 추가
- 카드 메타 row 의 삭제 버튼을 `<div style={{ display: 'flex', gap: 8 }}>` 래퍼로 감싸 '수정'(좌) / '삭제'(우) 두 버튼으로 변경
- 등록 시트 렌더를 `FindingFormSheet mode="create"` 로, 수정 시트는 `mode="edit" finding={editingFinding}` 로 분리 렌더

**LegalPage.tsx (FindingsPanel):**
- `FindingFormSheet` import 추가
- `editingFinding` state 추가 (handleDelete 정의 근처)
- 카드 메타 row 의 삭제 버튼 wrapper 패턴 동일 ('수정' LEFT)
- FindingsPanel 루트 div 끝에 `editingFinding && <FindingFormSheet mode="edit" .../>` 모달 렌더

## Deviations from Plan

None — 계획서 그대로 실행. 단, plan 본문 256번 라인의 `let customItem = ''` 는 reverse parsing 결과로 customItem 을 추론하지 않으므로 `const customItem = ''` 로 작성 (TypeScript no-unused-let 경고 회피, 동작 동일).

## Auth Gates

None — 빌드 + grep 검증으로 충분.

## Verification

```bash
# 자동 검증
grep -q "FindingFormSheet" src/pages/LegalFindingsPage.tsx  # ok
grep -q "FindingFormSheet" src/pages/LegalPage.tsx          # ok
grep -q "setEditingFinding" src/pages/LegalFindingsPage.tsx # ok
grep -q "setEditingFinding" src/pages/LegalPage.tsx         # ok
test $(grep -c "function FindingBottomSheet" src/pages/LegalFindingsPage.tsx) -eq 0  # ok
test $(grep -c "role !== 'admin'" "functions/api/legal/[id]/findings/[fid].ts") -eq 0 # ok
npm run build  # ✓ built in 13.15s, PWA precache 72 entries
```

빌드 출력에서 `FindingFormSheet-D4TG5ybo.js   9.82 kB` 청크가 새로 생성됨을 확인.

## Manual PWA Verification (수동, 사용자 검증 대기)

1. assistant 계정으로 모바일 PWA → 종합정밀 라운드 진입 → 지적사항 카드의 '수정' 버튼 탭
2. 시트가 열리고 description / location / 사진이 prefill 되는지 확인
3. 사진 1장 제거, 새 사진 1장 추가, 텍스트 일부 수정 → 저장
4. 카드 내용 갱신 + '수정되었습니다.' 토스트 표시
5. 데스크톱(1920×1080) 에서 동일 라운드의 카드 '수정' 버튼 탭 후 동일 시나리오 반복

## iOS PWA Cache Caveat

기존 LegalFindingsPage / LegalPage 모듈의 chunk hash 가 변경됐기 때문에 사용자 단말에서 PWA 캐시 invalidation 이 필요할 수 있음 (memo: feedback_pwa_cache_invalidation). 배포 후 "여전히 똑같다" 신고 시 PWA 앱 재설치 안내.

## Commits

- `bf6d55e` fix(quick-260513-lz1): legal finding PUT admin 체크 제거 (DELETE 와 정합)
- `37e83a3` feat(quick-260513-lz1): FindingFormSheet 공유 컴포넌트 추출 (등록/수정 mode)
- `11a5be6` feat(quick-260513-lz1): 지적사항 카드 '수정' 버튼 추가 (모바일+데스크톱)

## Self-Check: PASSED

- FOUND: src/components/FindingFormSheet.tsx
- FOUND: functions/api/legal/[id]/findings/[fid].ts (modified, admin gate removed)
- FOUND: src/pages/LegalFindingsPage.tsx (FindingFormSheet wired)
- FOUND: src/pages/LegalPage.tsx (FindingFormSheet wired in FindingsPanel)
- FOUND commit bf6d55e (Task 1)
- FOUND commit 37e83a3 (Task 2)
- FOUND commit 11a5be6 (Task 3)
- BUILD: npm run build ✓ (Vite + PWA precache)
