# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Completion: Bug Fixes, Excel Reports, Schedule Linkage

**Shipped:** 2026-03-31
**Phases:** 4 | **Plans:** 13 | **Timeline:** 4 days (2026-03-28 → 2026-03-31)

### What Was Built
- 프로덕션 배포 파이프라인 (Vite 번들 분할 + GitHub Actions CI/CD + D1 마이그레이션 자동화)
- 전체 기능 전수 테스트 + 16건 버그 수정 (인증, 대시보드, 13개 소방 카테고리, QR, 일정, 엑셀)
- 5종 연간 매트릭스 점검일지 엑셀 출력 (소방펌프, 자탐, 제연, 방화셔터, 피난방화)
- 일일업무일지 자동 생성 (일별/월별 엑셀, 특이사항 저장, 공휴일 반영)
- 대시보드 점검 완료 자동 연동 (D-20 날짜 범위 JOIN + 시각적 표시)

### What Worked
- **전수 테스트 우선 전략:** Phase 2에서 전체 기능을 먼저 검증하고 버그를 한 번에 수정한 후 신규 기능을 추가해서, Phase 3-4 개발이 안정적인 코드베이스 위에서 진행됨
- **fflate 엑셀 패치 방식:** xlsx-js-style 대비 번들 ~400KB 절감, 기존 양식 호환성 확보
- **D1 마이그레이션 수동 관리 → 부트스트랩:** 초기에는 deploy.sh로 빠르게 진행하고, 마일스톤 완료 시 추적 테이블을 부트스트랩하여 CI 자동화 달성

### What Was Inefficient
- **VERIFICATION.md 누락:** Phase 1-3에서 verify-work를 실행하지 않아 마일스톤 감사 시 16/19 요구사항이 "미검증"으로 잡힘 — 2차 감사 필요했음
- **SideMenu 경로 불일치:** 기존 코드의 경로 오타를 Phase 2 전수 테스트에서 놓침 (`/report` vs `/reports`, `/shift` vs `/workshift`)
- **D1 마이그레이션 추적 미비:** 마이그레이션을 수동 적용하면서 프로덕션 상태를 문서화하지 않아, 어떤 마이그레이션이 적용됐는지 확인하는 데 시간 소요

### Patterns Established
- 엑셀 생성: `fflate unzip → XML patch (patchCell) → rezip` 패턴으로 10종 통일
- 매트릭스 엑셀: `MATRIX_CONFIG` lookup map으로 4종 매트릭스를 단일 `generateMatrixExcel` 함수로 처리
- 일일업무일지: `buildDailyReportData` 순수 함수 + `generateDailyExcel` 분리 패턴
- 대시보드 완료 추적: D-20 날짜 범위 JOIN으로 멀티데이 점검 세션 귀속

### Key Lessons
1. **Phase 실행 후 즉시 verify-work 실행할 것** — 마일스톤 감사에서 한꺼번에 하면 3개 Phase 검증을 한 번에 돌려야 해서 비효율적
2. **SideMenu/라우팅 경로는 App.tsx 라우트와 1:1 대응하는지 기계적으로 검증할 것** — 수동 테스트로는 SideMenu 경유 경로를 빠뜨리기 쉬움
3. **D1 마이그레이션은 처음부터 wrangler migrations apply 기반으로 관리할 것** — 수동 execute 방식은 추적이 안 됨

### Cost Observations
- Model mix: opus 주력, sonnet (verifier/integration-checker 에이전트)
- Sessions: 약 10회
- Notable: 마일스톤 감사 + 재감사에 상당 컨텍스트 소요 — verify-work를 Phase별로 실행했으면 절약 가능했음

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Timeline | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 4 days | 4 | 전수 테스트 우선 → 안정화 → 신규 기능 순서 확립 |

### Cumulative Quality

| Milestone | Migrations | Excel Types | Requirements |
|-----------|------------|-------------|-------------|
| v1.0 | 32 | 10 | 19/19 |

### Top Lessons (Verified Across Milestones)

1. Phase 실행 직후 verify-work를 실행하면 마일스톤 감사가 경량화됨
2. 인프라 추적(마이그레이션, 라우팅)은 자동 검증 도구로 보강할 것
