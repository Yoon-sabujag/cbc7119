# Phase 1: Deployment & Infrastructure - Research

**Researched:** 2026-03-28
**Domain:** Cloudflare Pages + D1 + GitHub Actions CI/CD + Vite bundle optimization
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### 504 진단 및 해결
- **D-01:** 504는 Cloudflare API 장애 시에만 발생 (간헐적, 앱 런타임 이슈 아님)
- **D-02:** 번들 최적화(manualChunks 등) 후 배포 재시도 — 장애 내성을 높이기 위해 번들 크기를 줄인 뒤 재배포
- **D-03:** xlsx-js-style 제거 (~400KB 절감)는 Phase 2(STAB-08)에서 처리하지만, Phase 1에서 번들 분석 시 크기 기여도 확인

#### 배포 파이프라인
- **D-04:** GitHub Actions CI/CD 추가 — PR merge + main push 시 자동 배포
- **D-05:** deploy.sh는 로컬 유틸리티로 유지 (수동 배포 / 로컬 개발용)
- **D-06:** GitHub 원격 저장소 생성 필요 (현재 로컬 전용)

#### DB 마이그레이션 전략
- **D-07:** GitHub Actions CI에 D1 마이그레이션 통합 — 배포 시 자동으로 원격 마이그레이션 실행
- **D-08:** 로컬/원격 마이그레이션 상태 비교 검증 단계 포함

#### PWA 캐시 정책
- **D-09:** 현재 설정 유지 (skipWaiting + clientsClaim = 자동 새로고침)
- **D-10:** `_headers` 파일 추가하여 sw.js에 `Cache-Control: no-cache` 헤더 설정 — 서비스워커 캐시 오염 방지

### Claude's Discretion
- Vite manualChunks 분할 전략 (vendor/react/app 등 구체적 분할 기준)
- GitHub Actions workflow 파일 구체적 구조
- D1 마이그레이션 CI 실행 방식 (wrangler d1 execute vs wrangler d1 migrations)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEPLOY-01 | Cloudflare Pages 504 배포 오류 원인을 진단하고 해결하여 실제 배포가 성공한다 | D-01/D-02 confirm 504 is Cloudflare API-side intermittent; bundle optimization (manualChunks) reduces payload to lower retry surface |
| DEPLOY-02 | 배포 후 프로덕션 환경에서 기본 동작(로그인, 대시보드, 점검 기록)이 정상 작동한다 | GitHub Actions CI deploys on every push; _headers ensures sw.js always fresh; health smoke test validates bindings post-deploy |
| DEPLOY-03 | D1 로컬/프로덕션 마이그레이션 상태가 일치하는지 검증하고 불일치 시 해결한다 | `wrangler d1 migrations list --remote` vs `--local` diff; CI applies migrations via `wrangler d1 migrations apply --remote` before Pages deploy |
</phase_requirements>

---

## Summary

Phase 1 establishes the production deployment pipeline for a Cloudflare Pages + D1 PWA that currently has an intermittent 504 on `wrangler pages deploy`. Research confirms the 504 is a Cloudflare-side API infrastructure issue (not a build or runtime application bug) that was tracked as WC-3692 and resolved by Cloudflare. The mitigation strategy — reducing bundle size via Vite manualChunks so uploads complete faster and the finalization window is narrower — is sound and is the correct approach per locked decision D-02.

The four workstreams for this phase are: (1) Vite bundle splitting via manualChunks, (2) GitHub repository creation + GitHub Actions CI/CD workflow using `cloudflare/wrangler-action@v3`, (3) D1 migration state reconciliation (`wrangler d1 migrations apply` with `--remote` and `--local` comparison), and (4) the `public/_headers` file for `sw.js` cache control. All four are well-understood, have official documentation, and require no new libraries.

The existing `deploy.sh` script uses `wrangler d1 execute --file` (ad-hoc SQL execution per file), while the correct CI approach uses `wrangler d1 migrations apply --remote` (tracked, versioned, with rollback on failure). The planner must distinguish these: `deploy.sh` stays as-is for local use; CI uses `migrations apply`.

**Primary recommendation:** Create GitHub remote → set up `cloudflare/wrangler-action@v3` workflow (build → `d1 migrations apply --remote` → `pages deploy dist`) → add Vite manualChunks → add `public/_headers` → verify with production smoke test.

---

## Standard Stack

### Core

| Library / Tool | Version | Purpose | Why Standard |
|----------------|---------|---------|--------------|
| `cloudflare/wrangler-action` | v3 | GitHub Actions Cloudflare deploy step | Official Cloudflare action; `pages-action` is deprecated |
| `wrangler` | 4.69.0 (already installed) | CLI for deploy + D1 migrations | Already in devDependencies |
| `vite` | 5.4.8 (already installed) | Build tool with manualChunks support | Already in project; manualChunks is core Rollup API |
| `vite-plugin-pwa` | 0.21.0 (already installed) | PWA + workbox service worker | Already configured |

### Supporting

| Library / Tool | Version | Purpose | When to Use |
|----------------|---------|---------|-------------|
| `actions/checkout` | v4 | Git checkout in CI | Always first step in workflow |
| `actions/setup-node` | v4 | Node.js setup in CI | Needed before npm install in Actions |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `cloudflare/wrangler-action@v3` | `cloudflare/pages-action` | `pages-action` is deprecated — do not use |
| `wrangler d1 migrations apply` in CI | `wrangler d1 execute --file` per migration | `execute` has no migration tracking, no rollback. `migrations apply` tracks applied state in `d1_migrations` table and supports rollback on failure. Use `migrations apply` in CI. |

**No new npm packages to install.** All tooling already in devDependencies.

---

## Architecture Patterns

### Recommended Project Structure (additions this phase)

```
.github/
└── workflows/
    └── deploy.yml           # New: CI/CD workflow

cha-bio-safety/
├── public/
│   ├── _headers             # New: sw.js Cache-Control rule
│   ├── _routes.json         # Existing
│   └── templates/           # Existing
└── vite.config.ts           # Modified: add manualChunks
```

### Pattern 1: GitHub Actions Deployment Workflow

**What:** Build → D1 migrations → Pages deploy in a single job, triggered on push to main.
**When to use:** Every merge to main branch.

```yaml
# .github/workflows/deploy.yml
# Source: https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: cha-bio-safety/package-lock.json

      - name: Install dependencies
        run: npm ci
        working-directory: cha-bio-safety

      - name: Build
        run: npm run build
        working-directory: cha-bio-safety

      - name: Apply D1 migrations (remote)
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          workingDirectory: cha-bio-safety
          command: d1 migrations apply cha-bio-db --remote

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          workingDirectory: cha-bio-safety
          command: pages deploy dist --project-name=cbc7119
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

**Required GitHub Secrets:**
- `CLOUDFLARE_API_TOKEN` — Cloudflare API token with Pages:Edit + D1:Edit permissions
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID (find in Cloudflare dashboard sidebar)

### Pattern 2: Vite manualChunks Splitting

**What:** Split the vendor bundle into stable, separately-cacheable chunks so the largest libraries (React, lucide-react, date-fns) don't force a full-bundle re-upload on every deploy.
**When to use:** Add to `vite.config.ts` `build.rollupOptions.output.manualChunks`.

```typescript
// vite.config.ts — build section addition
// Source: https://vitejs.dev/config/build-options.html#build-rollupoptions
build: {
  rollupOptions: {
    output: {
      manualChunks: (id) => {
        // React core — changes rarely, largest cache benefit
        if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
          return 'vendor-react';
        }
        // Large icon library
        if (id.includes('node_modules/lucide-react')) {
          return 'vendor-icons';
        }
        // Date utilities
        if (id.includes('node_modules/date-fns')) {
          return 'vendor-date';
        }
        // QR libraries
        if (id.includes('node_modules/qrcode') || id.includes('node_modules/html5-qrcode')) {
          return 'vendor-qr';
        }
        // All remaining node_modules
        if (id.includes('node_modules')) {
          return 'vendor';
        }
      },
    },
  },
},
```

**Note on xlsx-js-style:** The package is in `dependencies` but unused. Phase 2 (STAB-08) removes it. For Phase 1 bundle analysis only: note its contribution (~400KB raw) but do NOT remove it in this phase per D-03.

### Pattern 3: Cloudflare Pages _headers for sw.js

**What:** Plain text file placed in `public/` (Vite copies to `dist/` root). Sets Cache-Control on the service worker so browsers always re-check for updates.
**When to use:** One-time creation before first CI deploy.

```
# public/_headers
# Source: https://developers.cloudflare.com/pages/configuration/headers/

/sw.js
  Cache-Control: no-cache, no-store, must-revalidate

/index.html
  Cache-Control: no-cache, no-store, must-revalidate
```

**Important:** The `_headers` file must be placed in `public/` (Vite copies it to `dist/`). Cloudflare Pages reads `_headers` from the build output root. Placing it in project root will not work.

### Pattern 4: D1 Migration Verification (Manual Pre-Deploy)

**What:** Before any deploy session, compare local vs remote migration state to detect drift.
**When to use:** Before every manual deploy; automated in CI via `migrations apply --remote` which skips already-applied.

```bash
# Run from cha-bio-safety/
npx wrangler d1 migrations list cha-bio-db --local
npx wrangler d1 migrations list cha-bio-db --remote

# If remote is behind local — apply missing:
npx wrangler d1 migrations apply cha-bio-db --remote
```

**Key difference from deploy.sh approach:**
- `deploy.sh` uses `wrangler d1 execute cha-bio-db --remote --file=<sql>` per file (no migration tracking)
- `wrangler d1 migrations apply` tracks applied migrations in `d1_migrations` table, skips already-applied, rolls back on failure
- For CI: always use `migrations apply`. `deploy.sh` remains as-is for local convenience.

### Anti-Patterns to Avoid

- **Using `cloudflare/pages-action`:** Deprecated — use `wrangler-action@v3` with `command: pages deploy ...`
- **Running `wrangler d1 execute` per file in CI:** No tracking, no rollback, will re-apply all migrations on every CI run. Use `migrations apply` instead.
- **Placing `_headers` in project root:** Must be in `public/` so Vite copies it to `dist/`. Root-level `_headers` is not picked up by Pages.
- **Merging D1 migration apply and Pages deploy into one wrangler-action step:** Separate them so migration failure doesn't silently roll forward to deploy.
- **Editing any `migrations/000X_*.sql` file:** D1 tracks by filename; editing a file that was already applied causes permanent local/remote schema divergence. Create a new `0024_*.sql` instead.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cloudflare Pages CI deployment | Custom curl calls to Cloudflare API | `cloudflare/wrangler-action@v3` | Official action handles auth, branch detection, deployment status |
| D1 migration tracking in CI | Custom shell loop over .sql files | `wrangler d1 migrations apply --remote` | Built-in tracking table, rollback on failure, skip-already-applied logic |
| Service worker cache busting | Custom SW registration code | `public/_headers` with `Cache-Control: no-cache` | Cloudflare Pages serves headers file natively; no code change needed |
| Bundle size analysis | Manual file inspection | `npm run build` output (Vite prints chunk sizes) | Vite reports chunk sizes after build; identify offenders from output |

**Key insight:** Every infrastructure concern in this phase has a first-party Cloudflare or Vite solution. No custom code is needed except the `_headers` file and `vite.config.ts` manualChunks addition.

---

## Common Pitfalls

### Pitfall 1: 504 Is Cloudflare API Transient — Not a Code Bug

**What goes wrong:** Developer spends time debugging application code, bundle size, or D1 queries when the 504 occurs at `wrangler pages deploy` upload finalization.

**Why it happens:** The 504 was tracked as Cloudflare infrastructure issue WC-3692. It occurs after file uploads succeed, during deployment record finalization on projects with many deployments. It is intermittent.

**How to avoid:** Per D-01/D-02 — reduce bundle size first (smaller upload = shorter finalization window), then retry deploy. If 504 persists after bundle optimization, retry 2-3 times before investigating further. Do NOT debug application runtime code for this error.

**Warning signs:** wrangler output shows files uploaded successfully, then 504 appears only during "Deployment complete" confirmation step.

### Pitfall 2: D1 `migrations list` vs `migrations apply` Default Direction Confusion

**What goes wrong:** `wrangler d1 migrations list` defaults to `--local`; `wrangler d1 migrations apply` defaults to `--remote`. Developers accidentally verify against the wrong environment.

**Why it happens:** Inconsistent defaults documented in workers-sdk issue #7657.

**How to avoid:** Always pass the flag explicitly: `--local` or `--remote`. Never rely on the default. In CI, always pass `--remote` explicitly.

**Warning signs:** `migrations list` shows 0 unapplied migrations but production throws `no such table` errors — you checked local, not remote.

### Pitfall 3: `_headers` File Location

**What goes wrong:** `_headers` placed in project root or `cha-bio-safety/` root is not served — Cloudflare Pages only reads from the build output directory (`dist/`).

**Why it happens:** Developer assumes it goes with `wrangler.toml` in the project root.

**How to avoid:** Place in `public/`. Vite copies all `public/` contents to `dist/` verbatim. Verify by checking `dist/_headers` exists after `npm run build`.

**Warning signs:** `sw.js` still cached after deploy; browser DevTools → Application → Service Workers shows "waiting to activate."

### Pitfall 4: workingDirectory Must Match for wrangler-action

**What goes wrong:** CI workflow fails because `wrangler.toml` is inside `cha-bio-safety/` but the working directory in the action step is the repo root.

**Why it happens:** The project has `cha-bio-safety/` as a subdirectory, not the repo root.

**How to avoid:** Set `workingDirectory: cha-bio-safety` on every `wrangler-action` step. Also set `working-directory: cha-bio-safety` on `npm ci` and `npm run build` steps.

**Warning signs:** `✘ [ERROR] Configuration file not found` — wrangler can't locate `wrangler.toml`.

### Pitfall 5: `wrangler d1 migrations apply` Confirmation Prompt in CI

**What goes wrong:** The apply command prompts for confirmation interactively; CI hangs waiting for input.

**Why it happens:** The command shows a list of pending migrations and asks "Are you sure?" before applying.

**How to avoid:** Pass `--yes` flag (or check if wrangler 4.x automatically detects non-interactive CI). Verify in practice: `wrangler d1 migrations apply cha-bio-db --remote --yes`.

**Warning signs:** CI job hangs indefinitely at the migrations step.

---

## Code Examples

### _headers file (complete, ready to create)

```
# cha-bio-safety/public/_headers
# Source: https://developers.cloudflare.com/pages/configuration/headers/

/sw.js
  Cache-Control: no-cache, no-store, must-revalidate

/index.html
  Cache-Control: no-cache, no-store, must-revalidate
```

### wrangler.toml (current state — no changes needed for Phase 1)

```toml
name = "cbc7119"
compatibility_date = "2024-09-23"
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "DB"
database_name = "cha-bio-db"
database_id = "b12b88e7-fc41-4186-8f35-ee9cbaf994c7"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "cha-bio-storage"

[vars]
ENVIRONMENT = "production"
```

**The binding names `DB` and `STORAGE` must match what `env.DB` and `env.STORAGE` reference in `functions/api/**/*.ts`. No changes needed.**

### D1 Migration Drift Check (manual verification command sequence)

```bash
# From cha-bio-safety/ directory
# Step 1: Compare state
npx wrangler d1 migrations list cha-bio-db --local
npx wrangler d1 migrations list cha-bio-db --remote

# Step 2: If remote is behind, apply (will skip already-applied)
npx wrangler d1 migrations apply cha-bio-db --remote --yes

# Step 3: Verify production schema
npx wrangler d1 execute cha-bio-db --remote --command ".schema" > /tmp/remote-schema.sql
```

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build step | Yes | v24.14.0 | — |
| npm | Install | Yes | 11.9.0 | — |
| wrangler | Deploy, D1 migration | Yes | 4.69.0 (via npx in devDeps) | — |
| GitHub remote repo | GitHub Actions CI | No | — | Manual `wrangler pages deploy` via deploy.sh |
| Cloudflare API Token | GitHub Actions secret | Not configured in CI (no .github/ exists) | — | Local deploy.sh (already authenticated) |
| Git remote | Push to GitHub | Not configured | — | Create GitHub repo + push |

**Missing dependencies with no fallback:**
- GitHub remote repository: Must be created before GitHub Actions workflow can run. Local deploy.sh provides interim workaround.
- GitHub Secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`): Must be configured in the new GitHub repo settings before CI works.

**Missing dependencies with fallback:**
- GitHub Actions CI: Local `deploy.sh` (menu option 5) provides full-deploy fallback while GitHub remote is being set up.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no jest.config.*, vitest.config.*, pytest.ini found |
| Config file | None — Wave 0 must address |
| Quick run command | Manual smoke test (see below) |
| Full suite command | Manual production verification flow |

**Note:** This is a TypeScript/React frontend project deployed to Cloudflare Pages. There is no automated test framework configured. Validation for this phase is smoke-test based, not unit-test based. This is appropriate given the infrastructure nature of the phase (deployment pipeline, CI setup).

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | Notes |
|--------|----------|-----------|-------------------|-------|
| DEPLOY-01 | `wrangler pages deploy` completes without 504 | smoke | `npx wrangler pages deploy dist --project-name=cbc7119` (exit 0 = pass) | Run from cha-bio-safety/ after `npm run build` |
| DEPLOY-02 | Production login/dashboard/inspection flow works | manual | Visit https://cbc7119.pages.dev — login → dashboard → inspection | No automation; 4 defined steps |
| DEPLOY-03 | `migrations list --remote` == `migrations list --local` | smoke | `diff <(npx wrangler d1 migrations list cha-bio-db --local) <(npx wrangler d1 migrations list cha-bio-db --remote)` | Output diff must be empty |

### Sampling Rate

- **Per task commit:** `npm run build` — TypeScript must compile clean (zero errors)
- **Per wave merge:** Manual production smoke test against https://cbc7119.pages.dev
- **Phase gate:** All 3 requirement smoke tests green before marking complete

### Wave 0 Gaps

- [ ] No automated test framework — this phase does not require one; smoke tests are sufficient for infrastructure validation
- [ ] `.github/workflows/deploy.yml` — must be created as the primary deliverable

*(No test file gaps that block implementation. Phase 1 is operational/infrastructure, not feature code.)*

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `cloudflare/pages-action` | `cloudflare/wrangler-action@v3` with `pages deploy` | ~2023 | `pages-action` deprecated; use wrangler-action for all Cloudflare CI |
| `wrangler d1 execute --file` per migration | `wrangler d1 migrations apply --remote` | wrangler ~3.x | `apply` tracks applied state, skips already-applied, has rollback |
| Single large vendor bundle (no manualChunks) | Function-based manualChunks splitting | Vite 2.9+ | manualChunks no longer modified by Vite by default; must be explicit |

**Deprecated/outdated:**
- `cloudflare/pages-action`: Deprecated — redirects to wrangler-action in GitHub Marketplace
- Shell loop over migration files in CI: No migration tracking, re-applies everything on every run

---

## Open Questions

1. **Does `wrangler d1 migrations apply --remote --yes` skip already-applied migrations?**
   - What we know: Documentation says it "applies unapplied migrations" and skips already-applied by checking `d1_migrations` table.
   - What's unclear: The exact `--yes` flag behavior for wrangler 4.x in non-interactive CI (some versions auto-detect TTY).
   - Recommendation: Test `wrangler d1 migrations apply cha-bio-db --remote --yes` locally first before adding to CI. If `--yes` isn't supported, try `echo "yes" | wrangler d1 migrations apply cha-bio-db --remote`.

2. **Current remote migration state (0023 applied?)**
   - What we know: Local migrations directory has 0001–0023 SQL files. deploy.sh used `wrangler d1 execute` (no tracking table).
   - What's unclear: Whether `d1_migrations` tracking table exists in the remote DB (execute never creates it).
   - Recommendation: Run `wrangler d1 execute cha-bio-db --remote --command "SELECT * FROM d1_migrations LIMIT 5"` before first CI run to check tracking state. If the table doesn't exist, run `wrangler d1 migrations apply --remote` to create it and mark all 23 as applied (they will re-execute if table is empty — this must be handled carefully to avoid duplicate-column errors).

3. **GitHub repo structure: monorepo root or cha-bio-safety/ as root?**
   - What we know: The current git repo root is `/Users/jykevin/Documents/20260328` containing both `.planning/` and `cha-bio-safety/`.
   - What's unclear: Should the GitHub remote track the full monorepo root (with `working-directory: cha-bio-safety` in CI), or should only `cha-bio-safety/` be pushed as a standalone repo?
   - Recommendation: Push the full monorepo root. CI uses `working-directory: cha-bio-safety`. Planning artifacts in `.planning/` stay in version control.

---

## Project Constraints (from CLAUDE.md)

The following directives from `CLAUDE.md` are actionable for the planner:

| Directive | Impact on Plan |
|-----------|---------------|
| Cloudflare 생태계 고정 (Pages + D1 + R2 + Workers) | No AWS, Vercel, or other hosting. All CI must use wrangler-action targeting Cloudflare. |
| 추가 비용 $0 목표 | No paid CI/CD services beyond GitHub Actions free tier + Cloudflare paid plan already subscribed. |
| PWA: iOS 16.3.1+ / Android 15+ / PC (1920x1080) | PWA cache fix (D-10) is critical — `sw.js` must be fresh on every deploy for all platforms. |
| 점검 기록 삭제 불가 원칙 | Not directly relevant to Phase 1 (no data mutations), but D1 migration drift fix must not DELETE data. |
| GSD Workflow Enforcement | Use `/gsd:execute-phase` for implementation. No direct file edits outside GSD workflow. |
| Excel output stays client-side | Not directly relevant to Phase 1 infrastructure work. |
| No Hono | Not relevant to Phase 1. Existing file-system routing pattern unchanged. |

---

## Sources

### Primary (HIGH confidence)
- Cloudflare Pages Direct Upload / CI docs — https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/
- Cloudflare D1 Wrangler Commands — https://developers.cloudflare.com/d1/wrangler-commands/
- Cloudflare Pages _headers docs — https://developers.cloudflare.com/pages/configuration/headers/
- `cloudflare/wrangler-action` GitHub repo — https://github.com/cloudflare/wrangler-action (v3 current)
- Direct inspection: `cha-bio-safety/wrangler.toml`, `vite.config.ts`, `package.json`, `deploy.sh`, `public/_routes.json`

### Secondary (MEDIUM confidence)
- Cloudflare workers-sdk Issue #9460 — 504 root cause (Cloudflare API infra, WC-3692, resolved) — https://github.com/cloudflare/workers-sdk/issues/9460
- WebSearch: Vite manualChunks strategy 2025 — multiple sources confirm function-based splitting is current pattern
- `.planning/research/PITFALLS.md` — prior project research (MEDIUM: training data through Aug 2025)
- `.planning/research/SUMMARY.md` — prior project research (HIGH for architecture, MEDIUM for runtime limits)

### Tertiary (LOW confidence, needs validation)
- `wrangler d1 migrations list` default direction behavior — workers-sdk issue #7657 — verify with `wrangler d1 migrations list --help` before planning tasks

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all tools already in project devDependencies; CI pattern from official Cloudflare docs
- Architecture patterns: HIGH — wrangler-action and _headers pattern directly from official documentation
- 504 root cause: HIGH — confirmed from workers-sdk GitHub issue with Cloudflare team comment (WC-3692 resolved)
- D1 migration behavior: MEDIUM — documented behavior verified; `--yes` flag and existing tracking table state need local verification (Open Questions 1 & 2)
- Pitfalls: HIGH — derived from official docs + prior project-specific research

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (wrangler-action and D1 APIs are stable; Cloudflare Pages infra status may change)
