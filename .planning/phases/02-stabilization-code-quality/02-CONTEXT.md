# Phase 2: Stabilization & Code Quality - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

기존 완료 기능(인증, 대시보드, 소방점검 13개 카테고리, QR, 점검계획, 엑셀 4종, 근무표, 연차, DIV, 도면, 승강기 고장)을 프로덕션 환경에서 전수 테스트하고, 발견된 버그를 일괄 수정하며, 코드 품질을 적극적으로 정리(미사용 의존성/코드 제거, 리팩토링, 패턴 일관성)한다.

</domain>

<decisions>
## Implementation Decisions

### 테스트 방식
- **D-01:** 프로덕션(cbc7119.pages.dev)에서 직접 전수 테스트 — 로컬이 아닌 실제 환경에서 확인
- **D-02:** 카테고리별 체계적 테스트 — 인증 → 대시보드 → 점검(13종) → QR → 계획 → 엑셀 → 운영기능 순서

### 버그 발견 시 대응
- **D-03:** 전체 테스트 완료 후 버그 목록을 만들어 일괄 수정 — 테스트 중 즉시 수정하지 않음
- **D-04:** 버그 목록에 심각도(critical/major/minor) 태깅

### 코드 정리 범위
- **D-05:** 적극적 정리 — xlsx-js-style 제거 + 미사용 의존성/코드 제거 + 리팩토링 + 패턴 일관성 + 코드 구조 개선
- **D-06:** xlsx-js-style 제거 (Phase 1 D-03에서 이관됨, ~400KB 번들 절감)
- **D-07:** lucide-react, date-fns 등 미사용 패키지 확인 후 제거 (Phase 1 연구에서 발견)

### Claude's Discretion
- 테스트 체크리스트 구체적 항목 구성
- 리팩토링 우선순위 판단 (안전성 vs 코드 개선)
- 패턴 일관성 기준 (기존 코드베이스 컨벤션 기반)
- 버그 수정 순서 (심각도 기반)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Codebase Maps
- `.planning/codebase/CONVENTIONS.md` — 코드 스타일, 패턴, 에러 처리 규칙
- `.planning/codebase/STACK.md` — 기술 스택, 의존성 목록
- `.planning/codebase/CONCERNS.md` — 기술 부채, 알려진 이슈
- `.planning/codebase/ARCHITECTURE.md` — 아키텍처 패턴, 레이어 구조

### Phase 1 Findings
- `.planning/phases/01-deployment-infrastructure/01-01-SUMMARY.md` — lucide-react, date-fns 미사용 발견
- `.planning/research/STACK.md` — xlsx-js-style 미사용 확인, fflate가 실제 Excel 엔진

### Application Source
- `cha-bio-safety/package.json` — 의존성 목록 (제거 대상 확인용)
- `cha-bio-safety/src/utils/generateExcel.ts` — 기존 Excel 생성 패턴
- `cha-bio-safety/src/App.tsx` — 라우팅 구조

### Design Spec
- `cbio_fire_system_design.md` — 전체 시스템 설계서 (기능 명세 참고)
- `cbio_fire_progress_report_20260328.md` — 진행 보고서 (완료 기능 목록)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `generateExcel.ts` — fflate + XML 패칭 패턴 (4종 작동 중)
- `authStore.ts` — Zustand 인증 스토어
- `api.ts` — API 호출 유틸리티

### Established Patterns
- Pages Functions: `onRequestGet`/`onRequestPost` 패턴 (Hono 미사용)
- 상태관리: Zustand
- 데이터 페칭: TanStack Query (일부), fetch 직접 호출 (일부) — 일관성 검토 필요
- 스타일링: Tailwind CSS

### Integration Points
- 프로덕션 환경: https://cbc7119.pages.dev
- D1 바인딩: env.DB
- R2 바인딩: env.STORAGE

</code_context>

<specifics>
## Specific Ideas

- iOS PWA BottomNav 바닥 미접착 이슈는 건드리지 않음 (PROJECT.md Out of Scope)
- 프로덕션 테스트 시 실제 데이터로 확인 (테스트 데이터 생성 불필요)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-stabilization-code-quality*
*Context gathered: 2026-03-28*
