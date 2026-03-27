# Phase 1: Deployment & Infrastructure - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Cloudflare Pages 504 배포 오류를 해결하고, GitHub Actions CI/CD 파이프라인을 구축하며, D1 마이그레이션 로컬/프로덕션 동기화를 확인하고, 프로덕션에서 기본 기능이 동작하는지 검증한다.

</domain>

<decisions>
## Implementation Decisions

### 504 진단 및 해결
- **D-01:** 504는 Cloudflare API 장애 시에만 발생 (간헐적, 앱 런타임 이슈 아님)
- **D-02:** 번들 최적화(manualChunks 등) 후 배포 재시도 — 장애 내성을 높이기 위해 번들 크기를 줄인 뒤 재배포
- **D-03:** xlsx-js-style 제거 (~400KB 절감)는 Phase 2(STAB-08)에서 처리하지만, Phase 1에서 번들 분석 시 크기 기여도 확인

### 배포 파이프라인
- **D-04:** GitHub Actions CI/CD 추가 — PR merge + main push 시 자동 배포
- **D-05:** deploy.sh는 로컬 유틸리티로 유지 (수동 배포 / 로컬 개발용)
- **D-06:** GitHub 원격 저장소 생성 필요 (현재 로컬 전용, 89 커밋)

### DB 마이그레이션 전략
- **D-07:** GitHub Actions CI에 D1 마이그레이션 통합 — 배포 시 자동으로 원격 마이그레이션 실행
- **D-08:** 로컬/원격 마이그레이션 상태 비교 검증 단계 포함

### PWA 캐시 정책
- **D-09:** 현재 설정 유지 (skipWaiting + clientsClaim = 자동 새로고침)
- **D-10:** `_headers` 파일 추가하여 sw.js에 `Cache-Control: no-cache` 헤더 설정 — 서비스워커 캐시 오염 방지

### Claude's Discretion
- Vite manualChunks 분할 전략 (vendor/react/app 등 구체적 분할 기준)
- GitHub Actions workflow 파일 구체적 구조
- D1 마이그레이션 CI 실행 방식 (wrangler d1 execute vs wrangler d1 migrations)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Deployment Configuration
- `cha-bio-safety/wrangler.toml` — D1/R2 바인딩, Pages 설정, compatibility_date
- `cha-bio-safety/deploy.sh` — 기존 배포 스크립트 (빌드/배포/마이그레이션 메뉴)
- `cha-bio-safety/vite.config.ts` — Vite 빌드 설정, PWA 설정, 현재 manualChunks 없음

### Build & Bundle
- `cha-bio-safety/package.json` — 의존성 목록, 빌드 스크립트
- `cha-bio-safety/tsconfig.json` — TypeScript 설정

### Database
- `cha-bio-safety/migrations/` — D1 마이그레이션 SQL 파일 (0001~0023)

### Project Context
- `.planning/research/SUMMARY.md` — 연구 결과 요약 (504 진단 권고, 번들 최적화 권고)
- `.planning/research/PITFALLS.md` — D1 마이그레이션 drift, PWA 캐시 오염 등 주의사항

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `deploy.sh` — 빌드/배포/마이그레이션 로직이 이미 구현됨, CI 워크플로우 참고용
- `vite.config.ts` — PWA 설정 이미 있음 (skipWaiting, clientsClaim, workbox)

### Established Patterns
- Pages Functions: `functions/api/**/*.ts` 파일 기반 라우팅 (Hono 미사용, vanilla onRequest* 패턴)
- D1 바인딩: `env.DB` 통해 접근, migration은 SQL 파일 직접 실행
- R2 바인딩: `env.STORAGE` 통해 접근

### Integration Points
- `.github/workflows/` — 새로 생성해야 할 CI/CD 워크플로우 위치
- `public/_headers` — 새로 생성해야 할 Cloudflare Pages 헤더 설정 파일
- `vite.config.ts` build.rollupOptions.output.manualChunks — 번들 분할 설정 추가 위치

</code_context>

<specifics>
## Specific Ideas

- GitHub 원격 저장소가 아직 없음 — Phase 1에서 생성하고 기존 89 커밋 push 필요
- Cloudflare API 장애는 재현이 안 될 수 있으므로, 번들 최적화를 먼저 한 뒤 배포 시도
- 프로덕션 검증은 로그인 → 대시보드 → 점검 기록 기본 플로우로 확인

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-deployment-infrastructure*
*Context gathered: 2026-03-28*
