# Testing Patterns

**Analysis Date:** 2026-03-28

## Test Framework

**Runner:**
- Not detected. No test framework configured.
- No Jest, Vitest, or other runner found in `package.json` or build config

**Assertion Library:**
- Not detected

**Run Commands:**
- Not applicable. No test scripts in `package.json`:
  ```json
  "scripts": {
    "dev:front": "vite",
    "dev:api": "npx wrangler pages dev dist --d1 DB=cha-bio-db --compatibility-date=2024-09-23",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && npx wrangler pages deploy dist",
    "db:seed": "npx wrangler d1 execute cha-bio-db --local --file=migrations/seed.sql"
  }
  ```

## Test File Organization

**Location:**
- No test files found in codebase
- No `.test.*` or `.spec.*` files detected
- No dedicated `tests/` or `__tests__/` directory

**Naming:**
- Not applicable

**Structure:**
- Not applicable

## Test Coverage

**Requirements:**
- No test coverage tracking configured
- No coverage thresholds enforced

**View Coverage:**
- Not applicable. No test infrastructure exists.

## Testing Status

**Current State:**
- **No automated tests present** in codebase
- Testing occurs manually during development
- Reliance on TypeScript type checking (strict mode disabled) for basic correctness
- Integration testing via manual browser/device testing of UI and API endpoints

## Critical Areas Without Tests

**Frontend Components:**
- All React components in `src/pages/`, `src/components/` untested
- Custom hooks (`usePhotoUpload`, `useDateTime`) lack unit tests
- State management via Zustand stores (`authStore`) lacks tests
- File: `src/stores/authStore.ts` - No verification of persist/restore behavior
- File: `src/pages/LoginPage.tsx` - No validation of form submission, error handling, staff selection
- File: `src/pages/InspectionPage.tsx` - Complex photo upload, point-of-interest selection logic untested

**API Endpoints:**
- All Cloudflare Pages Functions in `functions/api/` lack tests
- Authentication handlers untested: `functions/api/auth/login.ts`
  - Password verification logic (`verifyPassword`) untested
  - JWT creation/verification untested
  - Credential validation flow untested
- CRUD operations untested: `functions/api/schedule/index.ts`, `functions/api/inspections/index.ts`
- Middleware authentication in `functions/_middleware.ts` untested
  - JWT parsing and validation untested
  - CORS header handling untested
  - Public/private route logic untested

**Utilities:**
- File: `src/utils/api.ts` - Network request handling, error transformation untested
- File: `src/utils/shiftCalc.ts` - Shift calculation logic (complex date/cycle math) untested
- File: `src/utils/generateExcel.ts` - Excel file generation from templates (300+ lines) untested
  - Cell patching logic untested
  - Style manipulation untested
  - Multiple file format handlers untested
- File: `src/utils/imageUtils.ts` - Image compression untested

**Data Validation:**
- No input validation tests for API payloads
- Type safety relies on TypeScript only (strict mode disabled)

## Recommended Testing Approach

**For Frontend:**
- Vitest + React Testing Library for component and hook tests
- Start with critical user flows: login, inspection data submission, photo upload
- Integration tests for state management persistence

**For API:**
- Vitest for Cloudflare Pages Functions with mocked D1 database
- Test authentication middleware independently
- Test request/response transformation, edge cases

**For Utilities:**
- Pure function tests for shift calculation (deterministic, high complexity)
- Snapshot tests for Excel generation output validation
- Integration tests for image compression pipeline

**Minimum Coverage Goals:**
- API endpoints: 80% line coverage (auth handlers, CRUD operations)
- Critical utilities: 75% coverage (shift calculation, Excel generation, API client)
- React components: Critical user paths only (login, inspection submission)

---

*Testing analysis: 2026-03-28*
