# Requirements: CHA Bio Complex Fire Safety System

**Defined:** 2026-04-05
**Core Value:** 현장에서 모바일로 소방시설 점검을 기록하고, 법적 요구사항에 맞는 점검일지를 즉시 출력할 수 있어야 한다

## v1.2 Requirements

Requirements for v1.2 release. Each maps to roadmap phases.

### 일정 관리

- [ ] **SCHED-01**: 법적 점검 일정 등록 시 시작일/종료일 범위로 연속일정을 한번에 등록할 수 있다
- [ ] **SCHED-02**: 범위 입력 시 등록될 N일을 미리보기로 확인할 수 있다

### 지적사항 등록

- [ ] **FIND-01**: 지적사항 등록 시 공통 점검 항목 목록에서 선택하거나 직접 입력할 수 있다
- [ ] **FIND-02**: 지적사항 위치를 구역→층→상세위치 3단계 드롭다운으로 입력할 수 있다

### 다중 사진

- [ ] **PHOTO-01**: 지적사항·조치 사진을 최대 5장까지 업로드할 수 있다
- [ ] **PHOTO-02**: 첨부된 사진을 썸네일 그리드로 미리볼 수 있다
- [ ] **PHOTO-03**: 썸네일을 탭하면 라이트박스로 풀스크린 확대보기할 수 있다

### 다운로드

- [ ] **DL-01**: 지적사항 1건의 내용+사진을 건별로 다운로드할 수 있다
- [ ] **DL-02**: 라운드 전체 지적사항을 일괄 ZIP으로 다운로드할 수 있다
- [ ] **DL-03**: iOS PWA에서 window.open + 공유시트 방식으로 다운로드를 지원한다

## Future Requirements

Deferred to future release. Tracked but not in current roadmap.

### 다중 사진 확장

- **PHOTO-04**: 사진 업로드 진행률 표시
- **PHOTO-05**: 드래그로 사진 순서 정렬

## Out of Scope

| Feature | Reason |
|---------|--------|
| 서버 사이드 ZIP 생성 | Worker 128MB 메모리 제한 + 4인 팀 규모에 과도, 클라이언트 fflate로 충분 |
| R2 이미지 변환 (리사이징) | R2 네이티브 미지원, 기존 클라이언트 압축으로 대응 |
| 사진 드래그 정렬 | v1.2 범위 초과, 향후 검토 |
| 법적점검→조치관리 source_type 연동 | v1.1에서 이관됨, 복잡도 vs 가치 불균형 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCHED-01 | TBD | Pending |
| SCHED-02 | TBD | Pending |
| FIND-01 | TBD | Pending |
| FIND-02 | TBD | Pending |
| PHOTO-01 | TBD | Pending |
| PHOTO-02 | TBD | Pending |
| PHOTO-03 | TBD | Pending |
| DL-01 | TBD | Pending |
| DL-02 | TBD | Pending |
| DL-03 | TBD | Pending |

**Coverage:**
- v1.2 requirements: 10 total
- Mapped to phases: 0
- Unmapped: 10 ⚠️

---
*Requirements defined: 2026-04-05*
*Last updated: 2026-04-05 after initial definition*
