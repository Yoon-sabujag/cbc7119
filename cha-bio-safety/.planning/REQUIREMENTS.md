# Requirements: CHA Bio Complex Fire Safety — v1.1

**Defined:** 2026-04-05
**Core Value:** 현장에서 모바일로 소방시설 점검을 기록하고, 법적 요구사항에 맞는 점검일지를 즉시 출력할 수 있어야 한다.

## v1.1 Requirements

Requirements for PWA 데스크톱 최적화. Each maps to roadmap phases.

### 데스크톱 레이아웃

- [ ] **LAYOUT-01**: 사용자가 PC(1920x1080)에서 영구 사이드바로 모든 메뉴에 접근할 수 있다
- [ ] **LAYOUT-02**: 사용자가 PC에서 넓은 테이블/카드 레이아웃으로 데이터를 확인할 수 있다
- [ ] **LAYOUT-03**: 사용자가 도면과 점검 목록을 나란히 볼 수 있다 (멀티 패널)
- [ ] **LAYOUT-04**: 모바일 레이아웃이 기존과 동일하게 유지된다

### 문서 작업

- [ ] **DOC-01**: 사용자가 점검일지를 데스크톱 화면에서 작성/수정할 수 있다
- [ ] **DOC-02**: 사용자가 소방계획서 등 문서를 데스크톱에서 편집할 수 있다
- [ ] **DOC-03**: 사용자가 작성된 문서를 엑셀/PDF로 즉시 출력(다운로드)할 수 있다
- [ ] **DOC-04**: 사용자가 인쇄 시 인쇄용 스타일시트가 적용된 상태로 출력할 수 있다

### 파일 저장

- [ ] **FILE-01**: 사용자가 점검일지 저장 폴더를 한 번 지정하면 이후 자동 저장된다
- [ ] **FILE-02**: 저장 시 연도/월별 하위 폴더(2026/04/)가 자동 생성된다
- [ ] **FILE-03**: Chrome/Edge 미지원 브라우저에서는 기존 다운로드 방식으로 폴백된다

### 메뉴표

- [ ] **MENU-01**: 사용자가 메뉴표 PDF를 드래그 앤 드롭으로 업로드할 수 있다
- [ ] **MENU-02**: 드래그앤드롭 미지원 환경에서 기존 버튼 업로드가 유지된다

### 폴리시

- [ ] **POLISH-01**: 사용자가 키보드 단축키로 주요 기능에 접근할 수 있다

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### 설정 패널

- **SETTINGS-01**: 사용자가 다크/라이트/시스템 테마를 전환할 수 있다
- **SETTINGS-02**: 사용자가 계정 프로필(이름/연락처)을 변경할 수 있다
- **SETTINGS-03**: 사용자가 인앱 알림(점검 미완료, 미조치, 승강기 D-7)을 켜고 끌 수 있다
- **SETTINGS-04**: 사용자가 주간 현황 기준(이번 주/최근 7일)을 선택할 수 있다
- **SETTINGS-05**: 사용자가 결과 즉시 저장 토글을 설정할 수 있다

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| 네이티브 데스크톱 앱 (Electron/Tauri) | PWA 최적화로 충분, 향후 필요시 재검토 |
| Web Push 알림 | CF Workers 호환성 문제 + 4인 팀에 과도한 인프라 |
| 다운로드 폴더 자동 감시 | PWA 기술적 한계 (브라우저 샌드박스) |
| 설정 패널 기능 (테마/알림/프로필 등) | 모바일에서도 미구현, 모바일/데스크톱 통합 설계 후 별도 마일스톤 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAYOUT-01 | — | Pending |
| LAYOUT-02 | — | Pending |
| LAYOUT-03 | — | Pending |
| LAYOUT-04 | — | Pending |
| DOC-01 | — | Pending |
| DOC-02 | — | Pending |
| DOC-03 | — | Pending |
| DOC-04 | — | Pending |
| FILE-01 | — | Pending |
| FILE-02 | — | Pending |
| FILE-03 | — | Pending |
| MENU-01 | — | Pending |
| MENU-02 | — | Pending |
| POLISH-01 | — | Pending |

**Coverage:**
- v1.1 requirements: 14 total
- Mapped to phases: 0
- Unmapped: 14 ⚠️

---
*Requirements defined: 2026-04-05*
*Last updated: 2026-04-05 after initial definition*
