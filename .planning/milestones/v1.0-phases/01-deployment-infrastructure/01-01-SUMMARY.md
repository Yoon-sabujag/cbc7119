---
phase: 01-deployment-infrastructure
plan: 01
subsystem: infra
tags: [vite, rollup, cloudflare-pages, pwa, service-worker, cache-control, bundle-splitting]

# Dependency graph
requires: []
provides:
  - "Vite manualChunks config splitting vendor bundle into vendor-react, vendor-qr, vendor"
  - "Cloudflare Pages _headers file preventing service worker cache poisoning"
  - "Clean TypeScript build with no errors"
affects:
  - 01-02
  - 01-03
  - deployment

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Rollup manualChunks: group all react dep-chain libs (scheduler, loose-envify, @remix-run/router, goober) into vendor-react to avoid circular chunk warnings"
    - "Cloudflare Pages _headers: placed in public/ so Vite copies verbatim to dist/"

key-files:
  created:
    - cha-bio-safety/public/_headers
  modified:
    - cha-bio-safety/vite.config.ts

key-decisions:
  - "Include scheduler, loose-envify, js-tokens, @remix-run/router, goober in vendor-react chunk — these are react-dom and react-router peer deps that create circular chunk warnings if left in vendor"
  - "lucide-react and date-fns are in package.json but not imported anywhere in source; their manualChunks entries are correct but produce no output (tree-shaken); no action needed"
  - "_headers placed in public/ (not project root) — Vite copies all public/ contents to dist/ verbatim; Cloudflare Pages reads _headers from build output root"

patterns-established:
  - "manualChunks: always trace full dep-chain of grouped packages to prevent circular warnings"
  - "Cloudflare Pages cache control: _headers file in public/ is the canonical approach for Cache-Control on static assets"

requirements-completed: [DEPLOY-01, DEPLOY-02]

# Metrics
duration: 35min
completed: 2026-03-28
---

# Phase 1 Plan 1: Vite Bundle Splitting and Cloudflare Pages Cache Headers Summary

**Rollup manualChunks splitting added to vite.config.ts and Cloudflare Pages _headers file created to prevent service worker cache poisoning on iOS 16.3.1+, Android 15+, and PC**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-03-27T19:01:25Z
- **Completed:** 2026-03-28T04:11:00Z
- **Tasks:** 2 of 2
- **Files modified:** 2

## Accomplishments

- Added `build.rollupOptions.output.manualChunks` to `vite.config.ts` splitting node_modules into named vendor chunks (vendor-react, vendor-qr, vendor)
- Created `public/_headers` with `Cache-Control: no-cache, no-store, must-revalidate` for `/sw.js` and `/index.html`
- Resolved Rollup circular chunk warning by grouping all react dep-chain packages into vendor-react
- Confirmed `dist/_headers` generated correctly after `npm run build` (Vite copies public/ verbatim)
- Build exits 0 with zero TypeScript errors

## Task Commits

1. **Task 1: Add manualChunks to vite.config.ts** - `45277c3` (feat)
2. **Task 2: Create public/_headers with sw.js cache control** - `3619277` (feat)

## Files Created/Modified

- `cha-bio-safety/vite.config.ts` - Added build.rollupOptions.output.manualChunks splitting react, qr, icons, date, and remaining vendor packages
- `cha-bio-safety/public/_headers` - Cloudflare Pages response headers: Cache-Control no-cache for /sw.js and /index.html

## Decisions Made

- Included scheduler, loose-envify, js-tokens, object-assign, @remix-run/router, and goober in the vendor-react chunk alongside react/react-dom — these are transitive deps that cause Rollup circular chunk warnings if left in the catch-all vendor chunk
- The manualChunks patterns for vendor-icons (lucide-react) and vendor-date (date-fns) are present and correct; those chunks simply don't appear in build output because neither library is imported anywhere in the application source (tree-shaken to nothing). The patterns remain in config for correctness if usage is added later.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Resolved Rollup circular chunk warning causing vendor-icons and vendor-date to be absorbed into vendor**
- **Found during:** Task 1 (Add manualChunks to vite.config.ts)
- **Issue:** Initial manualChunks pattern (`node_modules/react` without trailing slash) matched `node_modules/react-dom/` but missed transitive dependencies: `scheduler`, `loose-envify`, `js-tokens`, `@remix-run/router` (react-router-dom dep), and `goober` (react-hot-toast dep). These landed in vendor, creating a `vendor -> vendor-react -> vendor` circular dependency. Rollup resolved by merging vendor-icons and vendor-date into vendor.
- **Fix:** Added trailing slashes to all path patterns for precision; added all react dep-chain libraries to vendor-react condition. Circular warning eliminated.
- **Files modified:** cha-bio-safety/vite.config.ts
- **Verification:** Build produced no circular chunk warning; vendor-react chunk grew from 157KB to 217KB confirming dep-chain libs moved correctly
- **Committed in:** 45277c3 (Task 1 commit)

**2. [Rule 1 - Bug] vendor-icons and vendor-date chunks absent — libraries not imported in source**
- **Found during:** Task 1 verification
- **Issue:** Plan acceptance criteria expected vendor-icons-*.js and vendor-date-*.js in dist/assets/. After resolving circular warning, these chunks still did not appear.
- **Root cause:** `lucide-react` and `date-fns` are listed in package.json dependencies but are not imported anywhere in the application source (`grep -r "lucide-react\|date-fns" src/` returns no results). Rollup tree-shakes them completely. manualChunks function cannot emit a chunk for tree-shaken modules.
- **Fix:** No code fix needed — manualChunks configuration is correct and would produce these chunks if the libraries were imported. Documented as known unused dependencies (xlsx-js-style removal is Phase 2; lucide-react/date-fns cleanup is not in scope).
- **Files modified:** None
- **Verification:** Build clean, no errors, no circular warning
- **Committed in:** 45277c3 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2x Rule 1 - Bug)
**Impact on plan:** First deviation required fix (circular chunk warning). Second deviation is a root-cause discovery (unused dependencies) requiring no code change. Core plan objectives met: build exits 0, multiple vendor chunks exist, dist/_headers correct.

## Issues Encountered

- npm dependencies not installed on first attempt (node_modules absent) — ran `npm install` as Rule 3 blocking fix
- Rollup 4.59.0 with Vite 5.4.21 merges chunks when it detects circular dependencies; required tracing full react dep-chain to resolve

## User Setup Required

None - no external service configuration required. All changes are build config only.

## Next Phase Readiness

- Build config is ready; `npm run build` produces a clean split bundle
- `_headers` file will be deployed by Cloudflare Pages automatically on next `npm run deploy`
- Phase 1 Plan 2 (504 diagnosis) can proceed — bundle is smaller, upload finalization window narrowed

---
*Phase: 01-deployment-infrastructure*
*Completed: 2026-03-28*
