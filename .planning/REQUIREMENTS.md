# Requirements: CHA Bio Complex Fire Safety System

**Defined:** 2026-03-28
**Core Value:** 현장에서 모바일로 소방시설 점검을 기록하고, 법적 요구사항에 맞는 점검일지를 즉시 출력할 수 있어야 한다.

## v1 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### Deployment & Infrastructure

- [x] **DEPLOY-01**: Cloudflare Pages 504 배포 오류 원인을 진단하고 해결하여 실제 배포가 성공한다
- [x] **DEPLOY-02**: 배포 후 프로덕션 환경에서 기본 동작(로그인, 대시보드, 점검 기록)이 정상 작동한다
- [x] **DEPLOY-03**: D1 로컬/프로덕션 마이그레이션 상태가 일치하는지 검증하고 불일치 시 해결한다

### Stabilization (재점검)

- [ ] **STAB-01**: 인증 기능 전수 테스트 — 로그인, 세션 유지, 권한별 접근 제어가 정상 동작한다
- [ ] **STAB-02**: 대시보드 전수 테스트 — 4개 카드(점검현황, 미조치이슈, 오늘일정, 승강기고장) 데이터가 정확히 표시된다
- [ ] **STAB-03**: 소방 점검 전수 테스트 — 13개 카테고리 점검 플로우(카테고리→구역→층→개소→결과입력→저장)가 정상 동작한다
- [ ] **STAB-04**: QR 기능 전수 테스트 — QR 스캔 점검, QR 출력(점검용/점검확인용), 소화기 공개 점검표가 정상 동작한다
- [ ] **STAB-05**: 점검 계획 전수 테스트 — 캘린더 UI, 일정 CRUD, 대시보드 연동이 정상 동작한다
- [ ] **STAB-06**: 기존 엑셀 출력 4종 전수 테스트 — 유수검지장치, 옥내소화전, 청정소화약제, 비상콘센트 출력이 정상 동작한다
- [ ] **STAB-07**: 운영 기능 전수 테스트 — 근무표, 연차 관리, DIV 압력, 건물 도면, 승강기 고장 기록이 정상 동작한다
- [x] **STAB-08**: 미사용 의존성(xlsx-js-style 등) 제거 및 코드 패턴 일관성 정리

### Excel Reports (점검일지 출력)

- [ ] **EXCEL-01**: 월간 소방펌프 점검일지 엑셀 출력 — 20개 점검항목, 양호/불량, A4 1장 레이아웃
- [ ] **EXCEL-02**: 자동화재탐지설비 점검일지 엑셀 출력 — 10개 항목 × 12개월 매트릭스, ○/△/× 기호
- [ ] **EXCEL-03**: 월간 제연설비 점검일지 엑셀 출력 — 9개 항목 × 12개월 매트릭스, ○/△/× 기호
- [ ] **EXCEL-04**: 월간 방화셔터 점검일지 엑셀 출력 — 9개 항목 × 12개월 매트릭스, ○/△/× 기호
- [ ] **EXCEL-05**: 월간 피난방화시설 점검일지 엑셀 출력 — 9개 항목 × 12개월 매트릭스, ○/△/× 기호
- [ ] **EXCEL-06**: 일일업무일지(방재업무일지) 엑셀 출력 — 근무표/점검일정/승강기이력/소방일정 자동 기재

### Schedule Linkage (일정↔기록 연결)

- [ ] **LINK-01**: 점검 계획 일정과 점검 기록을 자동으로 연결하여 일정별 완료 상태가 추적된다
- [ ] **LINK-02**: 대시보드에서 오늘 일정의 완료/미완료 상태가 점검 기록 기반으로 자동 표시된다

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Legal Inspection

- **LEGAL-01**: 소방시설 법적 점검 연 2회 일정/결과 관리
- **LEGAL-02**: 법적 점검 지적사항 목록 및 조치 완료 추적

### Elevator

- **ELEV-01**: 승강기 법정 검사 기록 (연 1회, 17대)
- **ELEV-02**: 승강기 연간 검사 일정 관리 + 만료 알림

### Admin & Operations

- **ADMIN-01**: 관리자 설정 페이지 (사용자/시스템 설정)
- **TRAIN-01**: 보수교육 일정 등록 및 이수 기록 관리
- **MEAL-01**: 개인별 식사 이용 기록 및 월별 통계

## Out of Scope

| Feature | Reason |
|---------|--------|
| AI 보고서 자동작성 (4단계) | 추후 별도 마일스톤, 현재 법적 필수 기능 우선 |
| 소방계획서 자동생성 | 추후 별도 마일스톤 |
| 모바일 오프라인 점검 | 현재 네트워크 환경 충분 |
| OAuth/소셜 로그인 | 4인 내부 팀, 사원번호 로그인 충분 |
| Web Push 알림 | 4인 팀에 과도, Workers 런타임 호환 이슈 |
| iOS PWA BottomNav 수정 | safe-area-inset 관련, 건드리면 다른 레이아웃 깨짐 |
| 다중 건물 / 멀티테넌트 | 단일 건물 전용 시스템 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DEPLOY-01 | Phase 1 | Complete |
| DEPLOY-02 | Phase 1 | Complete |
| DEPLOY-03 | Phase 1 | Complete |
| STAB-01 | Phase 2 | Pending |
| STAB-02 | Phase 2 | Pending |
| STAB-03 | Phase 2 | Pending |
| STAB-04 | Phase 2 | Pending |
| STAB-05 | Phase 2 | Pending |
| STAB-06 | Phase 2 | Pending |
| STAB-07 | Phase 2 | Pending |
| STAB-08 | Phase 2 | Complete |
| EXCEL-01 | Phase 3 | Pending |
| EXCEL-02 | Phase 3 | Pending |
| EXCEL-03 | Phase 3 | Pending |
| EXCEL-04 | Phase 3 | Pending |
| EXCEL-05 | Phase 3 | Pending |
| EXCEL-06 | Phase 4 | Pending |
| LINK-01 | Phase 4 | Pending |
| LINK-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-28 after roadmap creation*
