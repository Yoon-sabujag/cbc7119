# Phase 20: Document Storage Infrastructure - Verification

**Verified:** 2026-04-08
**Status:** PASSED
**Method:** Goal-backward + production smoke test (10/10 checks)

## Phase Goal
소방 문서를 R2에 안전하게 업로드/다운로드하고 메타데이터를 D1에서 조회할 수 있는 백엔드 인프라가 존재한다.

## Success Criteria

| # | Criterion | Result |
|---|-----------|--------|
| 1 | D1 `documents` 테이블 존재 + 구조 보존 | ✓ Migration 0046 applied, `CHECK(type IN ('plan','drill'))`, `deleted_at` reserved |
| 2 | admin 전용 R2 multipart presigned upload 발급 — 130MB+ Workers 100MB 제한 우회 | ✓ 12MB smoke test 통과, 2 parts (10MB + 2MB), `ReadableStream` 직접 전달 (버퍼링 없음) |
| 3 | 업로드 완료 후 commit API — admin gate, 일반 staff는 401/403 | ✓ create/upload-part/complete/abort 4 endpoints 모두 `requireAdmin` first call |
| 4 | list API — type별/연도별 정렬 + download API R2 스트리밍 | ✓ `list →` 1개 반환 (id=1, uploaded_by_name 포함), download 200 + 12582912 bytes |

## Smoke Test (production)

Executed from DevTools console on https://cbc7119.pages.dev as admin:

```
create → { uploadId, key, partSize: 10485760 }
part 1 → { partNumber: 1, etag }
part 2 → { partNumber: 2, etag }
complete → { id: 1, key }
list → { success: true, data: [1 document] }
found in list: { id:1, type:'plan', year:2026, title:'Phase 20 smoke test', filename:'smoke-test.pdf', uploaded_by_name: ... }
download status: 200
Content-Type: application/pdf
Content-Length: 12582912
Content-Disposition: attachment; filename*=UTF-8''smoke-test.pdf
downloaded bytes: 12582912 expected: 12582912
✅ SMOKE TEST PASSED
```

All 10 checks passed.

## Requirement Coverage

| Req | Description | Backend Status |
|-----|-------------|----------------|
| DOC-01 | 소방계획서 다운로드 (all staff) | Backend ready (list+download) |
| DOC-02 | 소방계획서 업로드 (admin) | Backend ready (multipart flow) |
| DOC-03 | 소방계획서 연도별 이력 | Backend ready (list ?year=) |
| DOC-04 | 소방훈련자료 다운로드 | Backend ready (type=drill) |
| DOC-05 | 소방훈련자료 업로드 130MB | Backend ready (streaming multipart confirmed) |
| DOC-06 | 소방훈련자료 연도별 이력 | Backend ready |
| DOC-07 | D1 metadata + R2 storage | Complete (documents table + R2 keys) |

DOC-01..06 will be exposed via UI in Phase 21.

## Decision Coverage (D-01..D-25)
All 25 locked decisions implemented. Key safety items verified:
- D-05 soft delete reserved (deleted_at column), WHERE deleted_at IS NULL on list/download
- D-13..D-15 streaming download, UTF-8 filename (`filename*=UTF-8''smoke-test.pdf` confirmed)
- D-18 admin gate first call on all 4 multipart endpoints
- D-21..D-23 file type whitelist + 200MB cap
- D-25 R2 cleanup on D1 INSERT failure (both paths)

## Production
- URL: https://cbc7119.pages.dev
- Migration 0046 applied to remote D1
- Commits: 3548d25, 324a366, 2c6fc85, 234c2f6, ca03c41, db05a85, 9692b5b, 74c8d7d, f5c126c

## PHASE VERIFIED
