# Phase 20: Document Storage Infrastructure - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

소방계획서·소방훈련자료를 D1 메타데이터 + R2 객체 저장소에 안전하게 올리고 내려받기 위한 백엔드 인프라(스키마, 업로드 API, 다운로드 API, 권한 게이트)를 구축한다. UI는 Phase 21에서 별도로 다룬다. 이 Phase는 API 계약을 고정하는 것이 목표.

</domain>

<decisions>
## Implementation Decisions

### Schema (D1)
- **D-01:** 새 마이그레이션 `0046_documents.sql` 작성. 테이블 이름 `documents`.
- **D-02:** 컬럼: `id INTEGER PRIMARY KEY AUTOINCREMENT`, `type TEXT NOT NULL CHECK(type IN ('plan','drill'))`, `year INTEGER NOT NULL`, `title TEXT NOT NULL`, `filename TEXT NOT NULL`, `r2_key TEXT NOT NULL UNIQUE`, `size INTEGER NOT NULL`, `content_type TEXT NOT NULL`, `uploaded_by INTEGER NOT NULL REFERENCES staff(id)`, `uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))`, `deleted_at TEXT NULL`.
- **D-03:** type은 고정 enum **plan | drill** (소방계획서 / 소방훈련자료). 추후 다른 문서가 필요하면 별도 마이그레이션. CHECK constraint로 D1 레벨 강제.
- **D-04:** 인덱스: `(type, year DESC, uploaded_at DESC)` 한 개 — list 쿼리 패턴(`type=plan&year=2026`)을 커버.
- **D-05:** soft delete 컬럼(`deleted_at`)은 향후 복구 phase 대비해 미리 추가하지만 v1.4에서는 사용하지 않음 (admin 조차도 삭제 UI 없음). 모든 list/download 쿼리는 `WHERE deleted_at IS NULL` 적용.

### R2 Key Structure
- **D-06:** R2 키 패턴: `documents/{type}/{year}/{nanoid}_{filename}` — 예: `documents/plan/2026/aB3kF9_2026_소방계획서.pdf`. nanoid prefix로 동일 파일명 충돌 방지.
- **D-07:** 디렉토리 분리로 R2 콘솔에서 type/year 별로 시각적 탐색 가능.

### Upload Mechanism (Large Files via R2 Multipart)
- **D-08:** 130MB 소방훈련자료 대응을 위해 **R2 binding의 multipart upload API** 사용. AWS S3 SDK / presigned URL 사용 안 함 (의존성 추가 회피).
- **D-09:** Worker endpoints 3개:
  1. `POST /api/documents/multipart/create` — body: `{ type, year, title, filename, contentType, size }`. admin only. `env.STORAGE.createMultipartUpload(key)` 호출 → `{ uploadId, key, partSize: 10*1024*1024 }` 반환. 임시 D1 행 만들지 않음 (commit 시점에 생성).
  2. `PUT /api/documents/multipart/upload-part?uploadId=...&key=...&partNumber=N` — raw binary body (Content-Type: application/octet-stream). admin only. `multipartUpload.uploadPart(N, request.body)` 호출 → `{ partNumber, etag }` 반환. 한 part는 5MB ~ 10MB.
  3. `POST /api/documents/multipart/complete` — body: `{ uploadId, key, parts: [{partNumber, etag}], type, year, title, filename, size, contentType }`. admin only. `multipartUpload.complete(parts)` 호출 후 D1 `documents` 행 INSERT (트랜잭션). → `{ id, key }` 반환.
- **D-10:** abort endpoint 제공: `POST /api/documents/multipart/abort` — body `{ uploadId, key }` → `multipartUpload.abort()`. 클라이언트가 중도 취소하거나 에러 시 호출. orphan part cleanup.
- **D-11:** ≤10MB 작은 파일도 동일한 multipart 경로 사용 (단일 part로). 별도 small-file 경로 만들지 않아 클라이언트 코드 단순화.
- **D-12:** Part 크기는 클라이언트가 결정 (5MB 권장 ~ 10MB). 마지막 part는 작아도 됨. R2는 5MB 이상이면 multipart를 받음.

### Download
- **D-13:** `GET /api/documents/{id}` — id로 메타데이터 조회 후 `env.STORAGE.get(r2_key)` → Response body로 스트리밍. 모든 staff 접근 가능 (auth required, role 무관). 헤더: `Content-Type`, `Content-Length`, `Content-Disposition: attachment; filename="{filename}"` (UTF-8 encoded).
- **D-14:** `Content-Disposition`은 한국어 파일명 지원 위해 `filename*=UTF-8''{encoded}` 형식 사용. iOS PWA 다운로드 호환성 위해 클라이언트는 `window.open` 패턴 사용 (Phase 21에서 처리).
- **D-15:** Workers CPU 30s 제한 내에서 130MB 스트리밍은 R2 → Response 직접 파이프라인이므로 CPU 거의 사용 안 함 (네트워크 바인드). 안전.

### List
- **D-16:** `GET /api/documents?type=plan` — 모든 staff 접근. type별 전체 목록 (deleted_at NULL) 반환. 정렬: `year DESC, uploaded_at DESC`. 필드: `id, type, year, title, filename, size, content_type, uploaded_at, uploaded_by_name`(JOIN staff).
- **D-17:** type 필터는 필수 (전체 조회 없음). year 필터는 선택 — 예: `?type=plan&year=2026`.

### Permissions
- **D-18:** 업로드/multipart 모든 endpoint는 `ctx.data.role === 'admin'` 체크. 비-admin은 `403 { success:false, error: '관리자만 업로드할 수 있습니다' }`.
- **D-19:** list/download는 인증된 모든 staff 허용 (`_middleware.ts` JWT 검증으로 충분).
- **D-20:** 권한 체크는 각 핸들러 내부에서 수행 (middleware는 인증만 담당, 역할 기반 게이트는 핸들러). 기존 `functions/api/admin/*` 패턴과 일치.

### File Type Validation
- **D-21:** 허용 확장자/MIME 화이트리스트 (Worker에서 검증):
  - `.pdf` (application/pdf)
  - `.xlsx` (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
  - `.docx` (application/vnd.openxmlformats-officedocument.wordprocessingml.document)
  - `.hwp` (application/x-hwp 또는 application/vnd.hancom.hwp)
  - `.zip` (application/zip)
- **D-22:** create 단계에서 contentType과 filename 확장자를 모두 검증. 둘 다 화이트리스트에 있으면 통과. 불일치 시 400.
- **D-23:** size 상한: 200MB (안전 여유 + 미래 대응). 더 크면 400.

### Error Handling
- **D-24:** R2 multipart 작업 중 에러 발생 시 클라이언트에게 명확한 에러 코드 반환 (`MULTIPART_INIT_FAILED`, `MULTIPART_PART_FAILED`, `MULTIPART_COMMIT_FAILED`). 클라이언트가 abort 호출 가능하도록 uploadId 포함.
- **D-25:** D1 INSERT 실패 시 R2 객체도 정리 (`STORAGE.delete(key)`) — 메타데이터 없는 orphan R2 객체 방지.

### Claude's Discretion
- nanoid 함수 구현 (기존 uploads/index.ts의 패턴 재사용 가능)
- Part size 권장값 클라이언트 가이드 — 10MB 권장하되 5MB도 허용
- 에러 메시지 한글 문구
- D1 트랜잭션 처리 방식 (단순 INSERT 후 실패 시 catch에서 R2 cleanup)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project / Requirements
- `.planning/REQUIREMENTS.md` §문서 중앙 관리 — DOC-01..07
- `.planning/ROADMAP.md` §"Phase 20: Document Storage Infrastructure" — goal + success criteria

### Existing patterns (Cloudflare Pages Functions)
- `cha-bio-safety/functions/_middleware.ts` — JWT 검증 + ctx.data 패턴 (role 추출)
- `cha-bio-safety/functions/api/uploads/index.ts` — 기존 단순 R2 PUT 예제 (참고용, 130MB는 처리 못함). nanoid 패턴 재사용.
- `cha-bio-safety/functions/api/uploads/[[path]].ts` — R2 GET 스트리밍 패턴
- `cha-bio-safety/functions/api/admin/*` — admin role gating 패턴
- `cha-bio-safety/migrations/0045_push_subscriptions.sql` — 가장 최근 마이그레이션 (스타일/네이밍 참고)
- `cha-bio-safety/src/utils/api.ts` — 클라이언트 fetch wrapper (Phase 21에서 사용)

### External (Cloudflare R2 docs)
- Cloudflare R2 Workers API: `R2Bucket.createMultipartUpload(key, options?)` → `R2MultipartUpload`
- `R2MultipartUpload.uploadPart(partNumber, value)` → `R2UploadedPart`
- `R2MultipartUpload.complete(uploadedParts)` → `R2Object`
- `R2MultipartUpload.abort()` → void

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **nanoid()** in `functions/api/uploads/index.ts` — 21자 random ID 생성기, R2 키 충돌 방지용
- **Env type** in `functions/_middleware.ts` — `STORAGE: R2Bucket; DB: D1Database; JWT_SECRET: string`
- **ctx.data** — middleware가 주입하는 `{ staffId, role, name }` — 핸들러에서 권한 체크에 사용
- **api.ts req<T>()** — 클라이언트 fetch 래퍼 (Phase 21에서 multipart 호출용 새 함수 추가 필요)

### Established Patterns
- 파일 라우팅: `functions/api/{resource}/{action}.ts` 또는 `index.ts` for collection
- API 응답 형태: `{ success: true, data: T }` / `{ success: false, error: string }`
- HTTP 메서드: `onRequestGet`, `onRequestPost`, `onRequestPut`, `onRequestDelete`
- D1 쿼리: `env.DB.prepare(sql).bind(...).first()` / `.all()` / `.run()`
- 한국어 에러 메시지 (사용자 노출용)

### Integration Points
- 새 디렉토리: `functions/api/documents/` — `index.ts`(GET list), `[id].ts`(GET download), `multipart/create.ts`, `multipart/upload-part.ts`, `multipart/complete.ts`, `multipart/abort.ts`
- 새 마이그레이션: `migrations/0046_documents.sql`
- middleware의 public routes 목록은 수정 안 함 (모두 인증 필요)

</code_context>

<specifics>
## Specific Ideas

- 4인 내부 팀 + 월 1~2회 업로드 빈도 → 단순함 우선, AWS SDK 의존성 회피
- 소방훈련자료 130MB는 multipart 필수 (Workers 100MB request 제한)
- 한국어 파일명(소방계획서.pdf, 2026_훈련자료.zip) 지원 필수 — Content-Disposition `filename*=UTF-8''` 인코딩
- 향후 admin이 잘못 올린 파일 삭제할 가능성 있어 `deleted_at` 컬럼 미리 추가 (실제 삭제 UI는 v1.5+)

</specifics>

<deferred>
## Deferred Ideas

- 삭제 UI / 복구 UI — v1.5+
- 다른 문서 타입 (작동응급계획서, 도면 PDF 등) — 필요 시 별도 마이그레이션
- 문서 미리보기 (PDF.js 등) — 다운로드만 제공
- 업로드 이력 audit log — 현재 `uploaded_by + uploaded_at`로 충분
- S3 presigned URL / AWS SDK 도입 — multipart binding으로 충분
- 전체 type 조회 (?type 없이) — 명시적 type 필터 강제
- 파일 해시 무결성 검증 — R2가 자체 무결성 보장

</deferred>

---

*Phase: 20-document-storage*
*Context gathered: 2026-04-08*
