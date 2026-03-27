# Codebase Concerns

**Analysis Date:** 2026-03-28

## Tech Debt

**Incomplete Error Handling in API Endpoints:**
- Issue: Only 4 out of 24 API files have try-catch blocks (`src/functions/api/auth/login.ts`, `src/functions/api/dashboard/stats.ts`, `src/functions/api/elevators/history.ts`, `src/functions/api/health.ts`). The majority of endpoints lack top-level error handlers, risking unhandled promise rejections and poor error messaging to clients.
- Files: `functions/api/schedule/[id].ts`, `functions/api/schedule/index.ts`, `functions/api/elevators/index.ts`, `functions/api/elevators/faults.ts`, `functions/api/leaves/index.ts`, `functions/api/inspections/index.ts`, `functions/api/inspections/records.ts`, `functions/api/inspections/records/[recordId]/resolve.ts`, and 15+ others
- Impact: Database failures, file upload errors, or unexpected input will crash handlers and return raw error responses to clients instead of standardized error formats. Users see unhelpful error messages.
- Fix approach: Add try-catch blocks to all API handlers (POST/PATCH/DELETE methods especially). Return standardized error responses: `{ success: false, error: 'Human-readable message' }` with appropriate HTTP status codes. Centralize error handling or create a wrapper utility.

**Excessive Use of `any` Type:**
- Issue: TypeScript type safety is compromised throughout. 40+ instances of `any` type casting found in pages and API handlers, including critical data manipulation code.
- Files:
  - `src/pages/InspectionPage.tsx`: Lines 281, 501, 780, 790, 819-876, 925, 949-951, 1351, 1413, 1590, 1809, 2094, 2412, 2604
  - `src/pages/DivPage.tsx`: Lines 79, 84, 237, 246, 375, 384, 390, 437, 459, 465, 469, 501
  - `src/pages/ElevatorPage.tsx`: Line 249
  - `src/pages/LeavePage.tsx`: Lines 265, 477, 560
  - `src/pages/QRScanPage.tsx`: Lines 103, 122, 142, 294
  - `src/pages/ReportsPage.tsx`: Lines 28, 31
  - `functions/_middleware.ts`: Line 54
  - `functions/api/schedule/index.ts`: Line 43
- Impact: Silent bugs at runtime where data shape assumptions are wrong. No compile-time safety for API responses. Refactoring breaks go undetected until hitting production.
- Fix approach: Create strict TypeScript types for all API responses. Define interfaces for database query results. Use discriminated unions for result types. Remove all `any` casts through property type definitions.

**Inconsistent API Response Format:**
- Issue: The application uses `{ success: boolean; data?: T; error?: string }` wrapper, but some utility functions use different patterns. This inconsistency makes response handling fragile.
- Files: `src/utils/api.ts` (lines 14-19), various pages calling `fetch()` directly instead of using the `api` utility
- Impact: Custom fetch calls bypass error handling logic. Hard to track all response formats across codebase.
- Fix approach: Enforce all API calls through `src/utils/api.ts` methods. Update utility to handle all edge cases. Add strict response type checking before accessing `.data` properties.

**Inconsistent Authorization Header Construction:**
- Issue: Authorization headers are constructed in multiple places using different patterns, some with potential race conditions on store access.
- Files:
  - `src/utils/api.ts`: Lines 10, 52, 58 (synchronous token access)
  - `src/pages/InspectionPage.tsx`: Line 43 (async import in handler)
  - `src/pages/DivPage.tsx`, `src/pages/ElevatorPage.tsx`, `src/pages/QRScanPage.tsx`: Direct token access
- Impact: Token updates may not propagate to all ongoing requests. Logout while requests pending could leak tokens to completed requests.
- Fix approach: Create a centralized auth interceptor. Guarantee token is read once per request. Handle 401 responses consistently by forcing re-authentication.

## Security Considerations

**CORS Allows All Origins:**
- Risk: The middleware returns `'Access-Control-Allow-Origin': '*'` which allows any website to make authenticated requests on behalf of users.
- Files: `functions/_middleware.ts` (line 32)
- Current mitigation: JWT token verification provides authentication; still, broad CORS enables CSRF attacks.
- Recommendations: Restrict CORS to known frontend origins. If supporting multiple origins, implement Origin checking. Alternatively, use same-site cookies with credentials instead of Bearer tokens where possible.

**Password Verification Uses Custom Crypto:**
- Risk: Custom SHA-256 hashing implementation (lines 25-28 in `functions/api/auth/login.ts`) is not using established password hashing libraries (bcrypt, argon2, scrypt). Plain SHA-256 with salt is fast and vulnerable to rainbow table attacks.
- Files: `functions/api/auth/login.ts` (lines 21-29, 44)
- Current mitigation: Salt is present; password_hash field in database suggests some salting happened during initialization.
- Recommendations: Replace custom hash verification with bcrypt or argon2. Update all stored hashes. Implement proper key derivation (PBKDF2 minimum). Add rate limiting to login endpoint.

**Login Endpoint Missing Rate Limiting:**
- Risk: The login endpoint at `functions/api/auth/login.ts` can be brute-forced without request throttling.
- Files: `functions/api/auth/login.ts`
- Current mitigation: None detected.
- Recommendations: Implement per-IP or per-staff-ID rate limiting. Lock account after N failed attempts. Log failed attempts.

**JWT Secret Exposure Risk:**
- Risk: JWT_SECRET is passed through `env.JWT_SECRET` in wrangler config. If environment variable leaks, all tokens are compromised.
- Files: `wrangler.toml` (binding exists), `functions/_middleware.ts` (line 50), `functions/api/auth/login.ts` (line 56)
- Current mitigation: Production secrets should be managed by Cloudflare Workers environment.
- Recommendations: Ensure JWT_SECRET is never logged or exposed in client bundles. Implement token rotation. Add expiration checking on all token verifications.

**Token Expiration Set to 12 Hours:**
- Risk: Line 55 in `functions/api/auth/login.ts` sets `exp: now + 60 * 60 * 12` which is 12 hours—too long for sensitive operations.
- Files: `functions/api/auth/login.ts` (line 55)
- Current mitigation: None.
- Recommendations: Reduce to 1-2 hours. Implement refresh token rotation. Add "last activity" tracking for session timeout.

**Plaintext Password Storage in Seed Data:**
- Risk: Seed data uses `'plain:'` prefix approach for some passwords (line 22 in `functions/api/auth/login.ts`), indicating plaintext passwords exist in migrations or seed files.
- Files: `functions/api/auth/login.ts` (line 22), likely `migrations/seed.sql`
- Current mitigation: Only in development/seed context.
- Recommendations: Remove all plaintext passwords. Use bcrypt to hash seed passwords. Never commit plaintext credentials, even for defaults.

## Performance Bottlenecks

**Polling Dashboard Every 10 Seconds:**
- Problem: The inspection page polls `/api/inspections/records` every 10 seconds (line 2567 in `InspectionPage.tsx`) to sync other staff's records. This creates continuous database queries and network traffic.
- Files: `src/pages/InspectionPage.tsx` (line 2567)
- Cause: Interval-based polling instead of push/WebSocket approach.
- Improvement path: Implement WebSocket connection for real-time updates. If WebSocket unavailable, increase poll interval to 30+ seconds. Add exponential backoff when idle.

**Excel Generation Uses Synchronous String Manipulation:**
- Problem: The `generateDivExcel`, `generateCheckExcel`, and `generateShiftExcel` functions perform extensive string searching and replacement on XML (500+ lines). This happens client-side and blocks the UI during generation.
- Files: `src/utils/generateExcel.ts` (lines 107-504)
- Cause: Direct XML string manipulation via `indexOf`, `slice`, `replace` calls instead of DOM parsing.
- Improvement path: Move Excel generation to a Web Worker to prevent UI blocking. Use a library like `exceljs` which is more efficient than string manipulation. Consider backend generation for large datasets.

**N+1 Query in Dashboard Stats:**
- Problem: Dashboard stats endpoint (`functions/api/dashboard/stats.ts`) loops through 5 week items and runs a database query for each (lines 76-87). This is a classic N+1 pattern.
- Files: `functions/api/dashboard/stats.ts` (lines 76-88)
- Cause: Loop-based queries instead of single aggregation query.
- Improvement path: Rewrite to fetch all weekly data in 2 queries (one for totals, one for done counts with proper JOINs). Cache results for 1-5 minutes since this doesn't change frequently.

**Image Compression Happens on Upload UI Thread:**
- Problem: `compressImage()` from `src/utils/imageUtils.ts` likely uses canvas operations synchronously in InspectionPage (line 22), blocking UI while compressing photos.
- Files: `src/pages/InspectionPage.tsx` (line 22)
- Cause: Image compression runs on main thread.
- Improvement path: Move compression to Web Worker. Implement streaming upload for large batches.

## Fragile Areas

**Untyped Record Array Handling:**
- Files: `src/pages/InspectionPage.tsx` (line 925: `useState<any[]>([])` for prevRecords)
- Why fragile: Array is typed as `any[]` but code assumes specific shape with `.year`, `.month`, `.day` properties (lines 951, 1351). A single incorrect record shape breaks history display.
- Safe modification: Define strict type for historical records: `interface HistoricalRecord { year: number; month: number; day?: string; ... }`. Validate on fetch.
- Test coverage: No type checking means array shape bugs go undetected until rendering.

**Session Creation Race Condition:**
- Files: `src/pages/InspectionPage.tsx` (lines 2599-2610, ensureSession function)
- Why fragile: If `ensureSession()` is called simultaneously from multiple handlers, it may create duplicate sessions. The check at line 2603 isn't atomic—both parallel calls could enter the try block.
- Safe modification: Use a Promise-based lock pattern. Store the promise itself, not just the ID: `sessionPromise: Promise<string> | null`. Only create new session if promise is null; reuse if already pending.
- Test coverage: No concurrency tests. Race condition silent until viewing duplicate sessions in DB.

**Direct Zustand Store Access in Async Context:**
- Files: `src/pages/InspectionPage.tsx` (line 43, async import inside handler)
- Why fragile: Importing the store module inside an async function is fragile. If module loading fails, handler crashes silently. Store access pattern differs from other pages.
- Safe modification: Import at top of file consistently. Use store callbacks instead of accessing getState() during async operations.
- Test coverage: No error boundary around async store imports.

**Shift Calculation Depends on Global `DOW_KO` Export:**
- Files: `src/utils/generateExcel.ts` (line 2, imports from shiftCalc), `src/utils/shiftCalc.ts` (must export DOW_KO)
- Why fragile: generateExcel assumes DOW_KO is exported from shiftCalc but there's no validation. If shiftCalc changes, Excel generation breaks silently.
- Safe modification: Define the constant in a shared constants file. Import explicitly with type checking.
- Test coverage: No tests for Excel generation with different shift configurations.

## Missing Critical Features

**No Offline Support Despite PWA Setup:**
- Problem: The app declares itself as PWA (vite-plugin-pwa in vite.config.ts, lines 7-34) with workbox caching, but all API calls lack offline fallback. Users can browse cached pages but can't submit inspection records offline.
- Blocks: Mobile users in areas with poor connectivity; temporary network loss causes data entry failures.

**No Undo/Redo for Inspection Records:**
- Problem: Once an inspection record is submitted, there's no way to view or modify it without the resolve workflow. Incorrect quick entries are permanent unless staff manually requests deletion.
- Blocks: User error recovery; no data correction workflow.

**No Batch Operations:**
- Problem: Users must resolve issues one at a time. No bulk mark-as-resolved, bulk status update, or bulk report generation.
- Blocks: Large-scale issue management is manual and slow.

**No Audit Trail:**
- Problem: The system updates records but doesn't log who changed what and when (except resolved_by on issue resolution). No audit trail for compliance.
- Blocks: Regulatory compliance requires change history.

**No Multi-Language Support:**
- Problem: Entire UI is hardcoded in Korean. No i18n setup despite international building codes being used.
- Blocks: International expansion or English-speaking staff usage.

## Test Coverage Gaps

**API Error Scenarios Not Tested:**
- What's not tested: Database failures, malformed request bodies, authorization failures, concurrent requests
- Files: All `functions/api/*` handlers lack error testing
- Risk: Error handling code has never been exercised. Production failures will expose bugs.
- Priority: High

**InspectionPage Component Logic:**
- What's not tested: Session creation race conditions, photo upload retry, record filtering by category/floor, history chart calculations
- Files: `src/pages/InspectionPage.tsx` (2965 lines, largest component)
- Risk: Complex state management with no tests. Refactoring will break unexpectedly.
- Priority: High

**Excel Generation Edge Cases:**
- What's not tested: Missing data fields, special characters in names/locations, year boundary conditions
- Files: `src/utils/generateExcel.ts` (504 lines)
- Risk: Reports generated with missing data go unnoticed until print/review time.
- Priority: Medium

**Authentication Flow:**
- What's not tested: Token expiration, 401 response handling, logout during pending requests
- Files: `src/stores/authStore.ts`, `src/utils/api.ts`, `functions/_middleware.ts`
- Risk: Authentication edge cases cause silent logouts or token leaks.
- Priority: Medium

**Database Migration Integrity:**
- What's not tested: Migration ordering, schema consistency after seed
- Files: `migrations/*.sql` (20+ migration files)
- Risk: Development/production schema drift. New deployments fail silently.
- Priority: Medium

---

*Concerns audit: 2026-03-28*
