# Requirements: CHA Bio Complex Fire Safety System

**Defined:** 2026-04-08
**Milestone:** v1.4 문서 관리
**Core Value:** 현장에서 모바일로 소방시설 점검을 기록하고, 법적 요구사항에 맞는 점검일지를 즉시 출력할 수 있어야 한다.

## v1.4 Requirements

### 문서 중앙 관리 (업로드/다운로드)

- [x] **DOC-01**: 사용자가 문서 관리 페이지에서 소방계획서 최신본을 다운로드할 수 있다 (전체 staff)
- [x] **DOC-02**: 관리자(admin)가 문서 관리 페이지에서 소방계획서 파일을 업로드할 수 있다 (업로드 시 연도/제목 입력)
- [x] **DOC-03**: 사용자가 소방계획서의 과거 연도 버전을 선택해 다운로드할 수 있다 (연도별 이력)
- [x] **DOC-04**: 사용자가 문서 관리 페이지에서 소방훈련자료 최신본을 다운로드할 수 있다 (전체 staff)
- [x] **DOC-05**: 관리자(admin)가 소방훈련자료 파일을 업로드할 수 있다 (대용량 ~130MB 대응 — R2 direct upload presigned URL)
- [x] **DOC-06**: 사용자가 소방훈련자료의 과거 연도 버전을 선택해 다운로드할 수 있다
- [x] **DOC-07**: 업로드된 문서는 R2에 저장되고 D1 `documents` 테이블에 메타데이터(유형, 연도, 파일명, 업로더, 업로드일시, R2 key, 크기)가 기록된다

### 업무수행기록표 작성

- [ ] **WORKLOG-01**: 사용자가 업무수행기록표 작성 폼에 대상 월·작성자·각 필드를 입력할 수 있다
- [ ] **WORKLOG-02**: 사용자가 "엑셀 출력" 버튼을 탭하면 기존 양식 파일과 동일한 레이아웃의 .xlsx 파일이 다운로드된다 (xlsx-js-style 기반)
- [ ] **WORKLOG-03**: 작성한 업무수행기록표 데이터는 D1에 저장되어 이후 월별 조회/재출력이 가능하다 (`work_logs` 테이블)

### 소화기 자산 관리 (Phase 24, 5월 법정점검 준비 예외)

- [ ] **EXT-04**: 도면 마커는 영구 위치, 소화기는 위치에 배치/교체되는 자산으로 분리된다 (`floor_plan_markers`/`check_points` ↔ `extinguishers` 1:N 관계). `extinguishers.status ∈ {'active','폐기'}`, `check_records.extinguisher_id` 컬럼이 추가되고 기존 1:1 매핑은 손실 없이 보존된다 (마이그레이션 + 백필)
- [ ] **EXT-05**: 사용자가 소화기 리스트 페이지(`/extinguishers`)에서 신규 등록·정보 수정(≤3 필드)·매핑(assign)·분리(unassign)·스왑(swap)·폐기(soft, status='폐기')·하드 삭제(미매핑+미점검 한정)를 처리할 수 있고, 도면 페이지의 ❓ 빈 마커는 점검 모드에서 매핑 유도 동선과 연결된다 (양방향 마커 동행)

## Future Requirements

### 관리자 페이지 개선 (다음 마일스톤)

- **ADMIN-RESTORE-01**: 관리자가 삭제된 점검/조치 기록을 복구할 수 있다 (soft delete → 복구 UI)

## Out of Scope

| Feature | Reason |
|---------|--------|
| 소방계획서 프로그램 내 자동 작성 | 문서 용량(20-25MB)과 복잡도로 프로그램 작성 비현실적 — 파일 관리만 제공 |
| 소방훈련자료 프로그램 내 자동 작성 | 문서 용량(120-130MB)과 멀티미디어 포함으로 프로그램 작성 불가 — 파일 관리만 제공 |
| 문서 온라인 미리보기 | 대용량 PDF/xlsx 브라우저 렌더링 성능 부담, 다운로드 우선 |
| 문서 편집 히스토리/diff | 연도별 파일 버전 관리로 충분 |
| 일반 staff의 문서 업로드 | admin 권한으로만 제한 — 무결성 보장 |
| 복구 기능 (삭제 복구) | 다음 마일스톤으로 연기 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DOC-01 | Phase 21 | Complete |
| DOC-02 | Phase 21 | Complete |
| DOC-03 | Phase 21 | Complete |
| DOC-04 | Phase 21 | Complete |
| DOC-05 | Phase 21 | Complete |
| DOC-06 | Phase 21 | Complete |
| DOC-07 | Phase 20 | Complete |
| WORKLOG-01 | Phase 22 | Pending |
| WORKLOG-02 | Phase 22 | Pending |
| WORKLOG-03 | Phase 22 | Pending |
| EXT-04 | Phase 24 | Pending |
| EXT-05 | Phase 24 | Pending |

**Note:** Phase 20 builds the storage/API infrastructure that DOC-01..06 depend on; Phase 21 delivers the user-facing UI that fulfills DOC-01..06. DOC-07 (metadata table) is anchored at Phase 20 since the schema lands there. Phase 24 (EXT-04/EXT-05) is a 5월 법정점검 준비 예외 — 운영 관찰 모드에도 불구하고 데이터 모델 재설계가 필요해 진행.

**Coverage:**
- v1.4 requirements: 12 total
- Mapped to phases: 12 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-08 for v1.4 문서 관리*
*Phase mappings finalized: 2026-04-08*
