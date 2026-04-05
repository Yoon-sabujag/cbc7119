# Roadmap: CHA Bio Complex Fire Safety Management System

## Milestones

- 🚧 **v1.1 PWA 데스크톱 최적화** - Phases 11-14 (in progress)

## Phases

### v1.1 PWA 데스크톱 최적화 (In Progress)

**Milestone Goal:** 데스크톱 환경(1920x1080)에서 모든 주요 기능을 쾌적하게 사용할 수 있도록 레이아웃, 문서 작업, 파일 저장, 메뉴 업로드, UX 개선을 단계적으로 완성한다.

- [x] **Phase 11: Desktop Layout Foundation** - PC 레이아웃 CSS 기반 정비 및 영구 사이드바 구현 (completed 2026-04-05)
- [ ] **Phase 12: Document Editing & Export** - 데스크톱 화면에서 점검일지/소방계획서 작성·수정·출력
- [ ] **Phase 13: File System Access Auto-Save** - 폴더 한 번 지정 후 엑셀 파일 자동 저장
- [ ] **Phase 14: Menu Upload & Keyboard Polish** - 메뉴표 드래그앤드롭 업로드 및 키보드 단축키

## Phase Details

### Phase 11: Desktop Layout Foundation
**Goal**: PC(1920x1080)에서 모든 페이지가 사이드바 탐색으로 스크롤 가능하게 동작한다
**Depends on**: Nothing (first phase of this milestone)
**Requirements**: LAYOUT-01, LAYOUT-04
**Success Criteria** (what must be TRUE):
  1. 사용자가 PC(1024px 이상)에서 영구 사이드바로 모든 메뉴에 접근할 수 있다
  2. 모바일(767px 이하)에서 기존 BottomNav/헤더/드로어 방식이 기존과 동일하게 동작한다
**Plans:** 2/2 plans complete
Plans:
- [x] 11-01-PLAN.md — CSS overflow 수정 + useIsDesktop 훅 + DesktopSidebar 컴포넌트 생성
- [x] 11-02-PLAN.md — App.tsx Layout 분기 + SettingsPanel 데스크톱 대응 + 시각 검증
**UI hint**: yes

### Phase 12: Document Editing & Export
**Goal**: 사용자가 데스크톱 화면에서 소방계획서와 소방훈련 자료를 작성하고 엑셀/PDF로 즉시 출력할 수 있다
**Depends on**: Phase 11
**Requirements**: LAYOUT-02, LAYOUT-03, DOC-01, DOC-02, DOC-03, DOC-04
**Success Criteria** (what must be TRUE):
  1. 사용자가 자동 생성된 점검일지를 데스크톱에서 조회하고 엑셀/PDF로 즉시 출력할 수 있다
  2. 사용자가 데스크톱 화면에서 소방계획서를 작성하고 편집할 수 있다
  3. 사용자가 데스크톱 화면에서 소방훈련용 자료(PPT 등)를 작성할 수 있다
  4. 사용자가 인쇄 시 사이드바가 숨겨지고 인쇄용 스타일이 적용된 상태로 출력된다
**Plans**: TBD
**UI hint**: yes

### Phase 13: File System Access Auto-Save
**Goal**: 사용자가 저장 폴더를 한 번 지정하면 이후 엑셀 출력이 해당 폴더 내 연도/월 하위 폴더에 자동 저장된다
**Depends on**: Phase 12
**Requirements**: FILE-01, FILE-02, FILE-03
**Success Criteria** (what must be TRUE):
  1. 사용자가 최초 한 번 폴더를 선택하면 이후 엑셀 내보내기가 해당 폴더에 자동 저장된다
  2. 사용자가 설정에서 저장 폴더를 언제든 변경할 수 있다
  3. 저장 시 연도/월 형식(예: 2026/04/) 하위 폴더가 자동으로 생성된다
  4. Chrome/Edge가 아닌 브라우저(Safari, Firefox, 모바일)에서는 기존 방식(브라우저 다운로드)으로 대체되어 오류 없이 동작한다
**Plans**: TBD

### Phase 14: Menu Upload & Keyboard Polish
**Goal**: 사용자가 메뉴표 PDF를 드래그앤드롭으로 업로드할 수 있고, 키보드 단축키로 주요 기능에 빠르게 접근할 수 있다
**Depends on**: Phase 11
**Requirements**: MENU-01, MENU-02, POLISH-01
**Success Criteria** (what must be TRUE):
  1. 사용자가 메뉴표 PDF를 드래그앤드롭으로 업로드 영역에 놓으면 파일이 업로드된다
  2. 드래그앤드롭이 지원되지 않는 환경(iOS 등)에서 기존 버튼 방식 업로드가 정상 동작한다
  3. 사용자가 키보드 단축키(예: Ctrl+P 인쇄, Ctrl+S 내보내기)로 주요 기능을 실행할 수 있다
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 11 → 12 → 13 → 14

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 11. Desktop Layout Foundation | v1.1 | 2/2 | Complete    | 2026-04-05 |
| 12. Document Editing & Export | v1.1 | 0/? | Not started | - |
| 13. File System Access Auto-Save | v1.1 | 0/? | Not started | - |
| 14. Menu Upload & Keyboard Polish | v1.1 | 0/? | Not started | - |
