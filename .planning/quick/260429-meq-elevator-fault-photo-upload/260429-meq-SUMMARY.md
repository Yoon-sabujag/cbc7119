---
phase: quick-260429-meq
plan: 01
subsystem: elevator-fault
tags: [photo-upload, elevator, multi-photo, migration]
requires:
  - elevator_faults 테이블 (기존)
  - MultiPhotoUpload 컴포넌트 (ElevatorPage.tsx 내부, 기존)
  - /api/uploads R2 업로드 핸들러 (기존)
provides:
  - elevator_faults.photo_keys (TEXT, JSON 배열)
  - elevator_faults.repair_photo_keys (TEXT, JSON 배열)
  - 고장 접수 시 증상 사진 5장 첨부 (FaultNewModal + FaultNewFullscreen)
  - 수리 완료 시 수리 사진 5장 첨부 (FaultResolveModal)
affects:
  - cha-bio-safety/migrations/0074_elevator_fault_photos.sql (new)
  - cha-bio-safety/functions/api/elevators/faults.ts
  - cha-bio-safety/src/pages/ElevatorPage.tsx
tech-stack:
  added: []
  patterns:
    - "0043_multi_photo.sql 패턴(ALTER + DEFAULT '[]') 답습"
    - "MultiPhotoUpload 컴포넌트 재사용 (import 불필요, 동일 파일 내부)"
key-files:
  created:
    - cha-bio-safety/migrations/0074_elevator_fault_photos.sql
  modified:
    - cha-bio-safety/functions/api/elevators/faults.ts
    - cha-bio-safety/src/pages/ElevatorPage.tsx
decisions:
  - "사진 표시 UI(상세 페이지, lightbox)는 out of scope — 입력만 구현"
  - "기존 사진 없는 행 백필 없음 — DEFAULT '[]'로 자동 초기화"
  - "MultiPhotoUpload 위치는 증상/수리 내용 텍스트에어리어 바로 다음 (사용자 메모리: 디자인 변경 전 상의 — 본 건은 사용자 직접 요구)"
metrics:
  duration_min: 25
  completed_date: 2026-04-29
  task_count: 3
  file_count: 3
---

# Quick 260429-meq: 승강기 고장/수리 사진 첨부 Summary

**One-liner:** ElevatorPage 고장 접수/수리 완료 모달에 MultiPhotoUpload(최대 5장) 통합 + elevator_faults에 photo_keys/repair_photo_keys 컬럼 추가 (migration 0074, production D1 적용 완료).

## 목적

방재팀이 모바일 PWA로 승강기 고장 접수 시 증상 사진을, 수리 완료 시 수리 결과 사진을 첨부해 추후 분쟁/보고 시 근거로 활용. 사용자 직접 요구 + 운영 관찰 모드 중 현장 UX 개선.

## 변경 파일

| 파일 | 변경 | 비고 |
|---|---|---|
| `cha-bio-safety/migrations/0074_elevator_fault_photos.sql` | 신규 | photo_keys, repair_photo_keys 컬럼 (TEXT NOT NULL DEFAULT '[]') |
| `cha-bio-safety/functions/api/elevators/faults.ts` | +9/-3 | POST는 photoKeys, PATCH는 repairPhotoKeys body 필드 수용 → JSON.stringify 후 INSERT/UPDATE |
| `cha-bio-safety/src/pages/ElevatorPage.tsx` | +16/-6 | interface ElevatorFault 확장 + 3개 모달(FaultNewModal, FaultNewFullscreen, FaultResolveModal) MultiPhotoUpload 통합 |

## 커밋 (per-task)

| Task | 커밋 | 설명 |
|---|---|---|
| 1 | `1375514` | feat(quick-260429-meq): elevator_faults photo_keys/repair_photo_keys 컬럼 추가 (migration 0074) — handler + production D1 apply |
| 2 | `97fd14f` | feat(quick-260429-meq): 고장 접수/수리 완료 모달 사진 첨부 5장 지원 — 3개 모달 + interface + mutate body |

## Production Migration 적용 결과

```
$ npx wrangler d1 execute cha-bio-db --remote --file=migrations/0074_elevator_fault_photos.sql
[result] success: true, rows_written: 2, changed_db: true, finalBookmark: 000014f2-...
```

검증 쿼리:
```sql
SELECT name FROM pragma_table_info('elevator_faults') WHERE name IN ('photo_keys','repair_photo_keys')
```
→ 두 컬럼 모두 존재 확인 (rows_read: 12, success: true).

## 배포

- **URL:** https://3492677a.cbc7119.pages.dev (production branch deployment)
- **Project:** cbc7119 (사용자 메모리: project name은 `cbc7119`, DB name은 `cha-bio-db`)
- **Build:** `npm run build` 성공, dist 351 files (317 already uploaded), 34 files newly uploaded
- **Deploy command:**
  ```bash
  npx wrangler pages deploy dist \
    --project-name=cbc7119 --branch=production \
    --commit-message="quick-260429-meq elevator fault photo upload" \
    --commit-dirty=true
  ```

## 검증 결과

| 검증 항목 | 결과 |
|---|---|
| `npm run build` 성공 (TypeScript 에러 0건) | ✅ |
| 0074 migration production 적용 | ✅ rows_written 2 |
| pragma_table_info로 2개 컬럼 존재 확인 | ✅ |
| Cloudflare Pages production 배포 | ✅ https://3492677a.cbc7119.pages.dev |
| 사용자 시연 (PWA 재설치 → 고장접수 사진 → 저장 → 수리 완료 사진 → 저장) | ⏳ 대기 (Task 3 checkpoint) |
| D1 쿼리로 photo_keys/repair_photo_keys JSON 배열 저장 확인 | ⏳ 대기 (사용자 시연 후) |

## 구현 디테일

### Backend (faults.ts)

**POST `/api/elevators/faults`:**
- body 타입에 `photoKeys?: string[]` 추가
- INSERT 컬럼 목록에 `photo_keys` 추가, VALUES에 `JSON.stringify(body.photoKeys ?? [])` 바인드

**PATCH `/api/elevators/faults`:**
- body 타입에 `repairPhotoKeys?: string[]` 추가
- UPDATE SET 절에 `repair_photo_keys=?` 추가, `JSON.stringify(body.repairPhotoKeys ?? [])` 바인드

**GET:** SELECT f.* 가 새 컬럼 자동 포함 (변경 불필요).

### Frontend (ElevatorPage.tsx)

3개 모달 모두 동일한 패턴:
1. `useState<string[]>([])` 추가
2. mutate body 객체에 키 추가 (createMutation/resolveFault의 mutationFn은 body 그대로 전달하므로 자동 흐름)
3. `<Field label="증상">`(또는 "수리 내용") 텍스트에어리어 바로 다음에 `<MultiPhotoUpload label="..." keys={...} setKeys={...} />` 삽입

interface ElevatorFault: D1에서 TEXT로 들어오므로 `photo_keys?: string`, `repair_photo_keys?: string` (JSON string). 표시 단계에서 `JSON.parse` 필요 — 본 plan은 입력만 다룸.

## Deviations from Plan

**None — plan executed exactly as written.**

Out-of-scope items 명시 그대로 유지:
- 고장 상세 페이지 사진 표시 UI 미구현
- 기존 데이터 백필 없음
- lightbox/압축 정책 변경 없음

## Out of Scope (후속 작업 후보)

- ElevatorFaultDetailPage 또는 기존 카드 펼침에서 첨부된 photo_keys/repair_photo_keys 표시 (lightbox 포함)
- 기존 사진 누락된 고장 기록 백필 정책 (현재는 그대로 두고 신규부터 적용)
- 서버에서 photo_keys 배열을 JSON.parse로 변환해서 응답 (현재는 클라이언트 책임)

## Self-Check

**Created files:**
- `cha-bio-safety/migrations/0074_elevator_fault_photos.sql` ✅ FOUND

**Modified files:**
- `cha-bio-safety/functions/api/elevators/faults.ts` ✅ FOUND (photoKeys/repairPhotoKeys 흔적 확인)
- `cha-bio-safety/src/pages/ElevatorPage.tsx` ✅ FOUND (3개 MultiPhotoUpload, interface 필드 확인)

**Commits:**
- `1375514` ✅ FOUND in git log
- `97fd14f` ✅ FOUND in git log

**Production:**
- D1 migration 적용 ✅ rows_written 2
- Pages deploy ✅ https://3492677a.cbc7119.pages.dev

## Self-Check: PASSED

## Next Step

Task 3 (`checkpoint:human-verify`) 대기 중.

**사용자 시연 절차:**
1. PWA 재설치 (또는 강제 새로고침) — 사용자 메모리: PWA 캐시
2. 승강기 페이지 → 임의 호기 → "고장 접수" → 증상 입력 → "증상 사진 (0/5)" 영역 사진 1~3장 추가 → 접수
3. 방금 접수한 카드 → "수리 완료" → 수리 내용 입력 → "수리 사진 (0/5)" 영역 사진 1~2장 추가 → 처리
4. (Claude가 D1 쿼리) `SELECT id, symptoms, photo_keys, repair_photo_keys FROM elevator_faults ORDER BY created_at DESC LIMIT 3` — JSON 배열 저장 확인
5. (선택) 사진 6장째 추가 시도 → "사진은 최대 5장까지 가능합니다" 토스트 확인

승인 시그널: "approved" 또는 "잘 된다" 등.
