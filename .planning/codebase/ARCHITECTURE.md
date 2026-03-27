# Architecture

**Analysis Date:** 2026-03-28

## Pattern Overview

**Overall:** Full-stack monorepo with separated frontend and serverless backend layers

**Key Characteristics:**
- Frontend: Client-side React SPA with local state management
- Backend: Cloudflare Pages Functions (serverless API)
- Data: Single D1 SQLite database accessed from both layers
- Authentication: JWT tokens with HS256 signature
- State: Zustand for client state, token-based auth for API

## Layers

**Frontend (src/):**
- Purpose: React single-page application for fire safety inspection and facility management
- Location: `src/`
- Contains: Pages, components, hooks, stores, utility functions, types
- Depends on: API utilities for backend communication, Zustand for auth state
- Used by: Browser/client application

**API Backend (functions/):**
- Purpose: Serverless request handlers for all client operations
- Location: `functions/api/`
- Contains: Route handlers using Cloudflare Pages Functions convention
- Depends on: D1 database, R2 storage, JWT middleware
- Used by: Frontend via HTTP calls

**Middleware (functions/_middleware.ts):**
- Purpose: Centralized JWT verification and CORS handling
- Location: `functions/_middleware.ts`
- Contains: JWT validation logic, public route exceptions, CORS headers
- Depends on: Cloudflare Workers crypto API
- Used by: All API routes (enforces auth before handler execution)

**Data Layer (database):**
- Purpose: Persistent storage via D1 SQLite
- Tables: staff, schedule_items, inspection_sessions, check_records, check_points, elevators, etc.
- Accessed from: API handlers and frontend utility functions
- Managed by: Migrations in `migrations/`

## Data Flow

**Authentication Flow:**

1. User enters staffId + password on `LoginPage` (`src/pages/LoginPage.tsx`)
2. POST `/api/auth/login` → `functions/api/auth/login.ts`
3. Server verifies password hash against `staff` table
4. Server generates JWT with payload: `{ sub, name, role, title, iat, exp }`
5. Client receives JWT and stores in Zustand store via `authStore.login()`
6. Subsequent requests include `Authorization: Bearer {token}` header

**Dashboard Load Flow:**

1. `DashboardPage` component mounts
2. React Query hook calls `dashboardApi.getStats()`
3. Utility function `api.get()` attaches JWT from store
4. GET `/api/dashboard/stats` → `functions/api/dashboard/stats.ts`
5. Middleware verifies JWT, extracts `staffId`
6. Handler queries database for statistics and schedules
7. Response includes: `{ stats, todaySchedule, weeklyItems, onDutyStaff }`
8. React Query caches response (30s staleTime)
9. Component renders with data or fallback mock data

**Inspection Session Flow:**

1. Inspector navigates to `InspectionPage`
2. Scans QR code on checkpoint via `QRScanPage`
3. QR contains checkpoint ID
4. Creates inspection session: POST `/api/inspections`
5. Session ID stored in component state
6. For each checkpoint, submits record: POST `/api/inspections/{sessionId}/records`
7. Optionally uploads photo: PUT `/api/inspections/{sessionId}/photo`
8. Records stored in `check_records` table
9. Can be resolved later via POST `/api/inspections/records/{recordId}/resolve`

**State Management:**
- **Client state:** Zustand store (`authStore`) for JWT, staff info, authentication flag
- **Server state:** D1 database is single source of truth
- **UI state:** React component state for modals, forms, navigation
- **Cache:** React Query manages API response caching with staleTime/refetch strategies

## Key Abstractions

**API Client (src/utils/api.ts):**
- Purpose: Centralized HTTP request handling with auth injection
- Examples: `api.get()`, `api.post()`, `dashboardApi`, `scheduleApi`, `inspectionApi`
- Pattern: Factory functions return API namespaces with typed methods

**Auth Store (src/stores/authStore.ts):**
- Purpose: Persist authentication state across sessions
- Examples: `useAuthStore.login()`, `useAuthStore.logout()`, `useAuthStore.getState()`
- Pattern: Zustand store with localStorage persistence via `persist` middleware

**Type Definitions (src/types/index.ts):**
- Purpose: Centralized TypeScript interfaces for data contracts
- Examples: `Staff`, `CheckPoint`, `CheckRecord`, `ScheduleItem`, `Elevator`
- Pattern: Role-based role types (`'admin' | 'assistant'`), status enums as literal unions

**Page Components (src/pages/*.tsx):**
- Purpose: Screen-level containers managing entire view logic
- Examples: `DashboardPage`, `InspectionPage`, `ElevatorPage`
- Pattern: Use React Query hooks for data fetching, local state for UI, route-based code splitting

## Entry Points

**Frontend Entry:**
- Location: `src/main.tsx`
- Triggers: Browser loads root URL, Vite dev server, or deployed SPA
- Responsibilities: Mounts React app to DOM, initializes Router, QueryClient

**Frontend App Router:**
- Location: `src/App.tsx`
- Triggers: Every route change
- Responsibilities: Defines all routes with lazy-loaded pages, Auth wrapper for protected routes, Suspense fallbacks

**API Authentication:**
- Location: `functions/_middleware.ts`
- Triggers: Every incoming request to `/api/` (except public routes)
- Responsibilities: Verifies JWT signature, extracts staffId/role/name, passes to handler via `ctx.data`

**API Dashboard Endpoint:**
- Location: `functions/api/dashboard/stats.ts`
- Triggers: GET `/api/dashboard/stats`
- Responsibilities: Calculates statistics from database, builds weekly progress, returns dashboard data

**API Inspection Endpoint:**
- Location: `functions/api/inspections/index.ts`
- Triggers: GET (list sessions) / POST (create session)
- Responsibilities: Manages inspection sessions for checkpoint checking workflow

## Error Handling

**Strategy:** Layered error handling with user-friendly messages and authentication edge cases

**Patterns:**

- **API Request Errors** (`src/utils/api.ts`): Throws `ApiError(status, message)` on non-200 responses or `!json.success`
- **Auth Errors**: 401 status triggers automatic logout and redirect to `/login` in API client
- **Database Errors** (API handlers): Caught in try-catch, returns `{ success: false, error: 'message' }` with 500 status
- **Component Errors**: React Suspense boundary shows `Loader` component during async operations
- **Form Validation**: Input validation before API calls (e.g., staffId/password non-empty check)

## Cross-Cutting Concerns

**Logging:** Console logging in API handlers for error debugging (e.g., `console.error('login error:', e)`)

**Validation:**
- Frontend: Basic checks on form inputs before submission
- Backend: Parameter validation in request handlers before DB operations

**Authentication:**
- JWT tokens with 12-hour expiration
- Token stored in localStorage via Zustand persistence
- Middleware enforces Bearer token presence on protected routes
- Public routes: `/api/auth/login`, `/api/health`, `/api/uploads/*`, `/api/public/*`

**CORS:** Middleware adds permissive CORS headers to all responses (`*` origin, GET/POST/PUT/PATCH/DELETE methods)

**Caching:**
- HTTP-level: React Query with 30s staleTime on dashboard
- Storage-level: PWA workbox caches API responses (NetworkFirst strategy, 5 min max-age)
- Client-level: Component state for UI interaction state

---

*Architecture analysis: 2026-03-28*
