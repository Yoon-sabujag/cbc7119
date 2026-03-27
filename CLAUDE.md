<!-- GSD:project-start source:PROJECT.md -->
## Project

**CHA Bio Complex Fire Safety Management System**

차바이오컴플렉스(경기도 성남시 분당구 판교로 335) 방재팀 4인을 위한 소방안전 통합관리 PWA 시스템. Cloudflare Pages + D1 + R2 기반으로 소방시설 점검, 승강기 관리, 근무표, 연차, 점검일지 출력 등을 하나의 앱에서 처리한다. 1단계(MVP) 95% 완료 상태에서 전체 재점검/버그수정 후 잔여 기능을 구현하고 배포까지 완료하는 것이 목표.

**Core Value:** 현장에서 모바일로 소방시설 점검을 기록하고, 법적 요구사항에 맞는 점검일지를 즉시 출력할 수 있어야 한다.

### Constraints

- **Tech stack:** Cloudflare 생태계 고정 (Pages + D1 + R2 + Workers) — 이미 유료 플랜 구독 중, 추가 비용 $0 목표
- **Users:** 4인 내부 팀 전용 — 트래픽 매우 낮음, 복잡한 스케일링 불필요
- **Compatibility:** PWA, iOS 16.3.1+ / Android 15+ / PC (1920x1080)
- **Data integrity:** 점검 기록 삭제 불가 원칙 (수정 이력 보존)
- **Excel output:** 기존 양식 파일과 호환되는 형태로 출력 필수
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.6.3 - All application code (frontend, backend, migrations)
- JavaScript - Build configuration files (vite.config.ts, tailwind.config.js, postcss.config.js)
- SQL - Database migrations and schema definitions
## Runtime
- Node.js (implied by npm/wrangler tooling)
- Cloudflare Workers + Pages (serverless edge computing)
- npm (v10+)
- Lockfile: `package-lock.json` present
## Frameworks
- React 18.3.1 - UI rendering and component framework
- React Router DOM 6.26.2 - Client-side routing
- Vite 5.4.8 - Build tool and dev server
- Zustand 5.0.0 - Lightweight state management
- Cloudflare Pages Functions (serverless API handlers)
- Cloudflare D1 - SQLite database binding
- Cloudflare R2 - Object storage binding
- Tailwind CSS 3.4.14 - Utility-first CSS framework
- PostCSS 8.4.47 - CSS transformation
- Autoprefixer 10.4.20 - Browser vendor prefixes
- Not detected
- TypeScript 5.6.3 - Type checking
- Vite PWA 0.21.0 - Progressive Web App plugin
- Wrangler 4.75.0 - Cloudflare CLI tool
- Cloudflare Workers Types 4.20260317.1 - Type definitions
## Key Dependencies
- @tanstack/react-query 5.59.0 - Server state management and data synchronization
- jose 5.9.6 - JWT creation and verification for authentication
- date-fns 4.1.0 and date-fns-tz 3.2.0 - Date manipulation with timezone support
- lucide-react 0.454.0 - Icon library
- react-hot-toast 2.4.1 - Toast notification system
- qrcode 1.5.4 - QR code generation
- qrcode.react 4.2.0 - React wrapper for QR code generation
- html5-qrcode 2.3.8 - QR code scanning from camera/images
- jspdf 4.2.1 - PDF generation
- xlsx-js-style 1.2.0 - Excel file generation with styling
## Configuration
- Vite environment variables via `import.meta.env`
- Required: `VITE_API_BASE_URL` (defaults to `/api`)
- Wrangler configuration in `wrangler.toml`
- Cloudflare bindings: `DB` (D1), `STORAGE` (R2), `JWT_SECRET` (env var)
- `vite.config.ts` - Frontend build and PWA configuration
- `tsconfig.json` - TypeScript compiler options (ES2022 target, JSX support)
- `tailwind.config.js` - Tailwind CSS customization with Korean fonts (Noto Sans KR, JetBrains Mono)
- `postcss.config.js` - PostCSS plugins for Tailwind and Autoprefixer
- Strict type checking disabled (`strict: false`)
- Module resolution: "bundler"
- Allows importing `.ts` extensions
- Resolves JSON modules
## Platform Requirements
- Node.js runtime
- npm package manager
- Wrangler CLI for local development (`npm run dev:api`)
- Git for version control
- Cloudflare Workers + Pages platform
- Cloudflare D1 database (SQLite)
- Cloudflare R2 object storage bucket (`cha-bio-storage`)
- Compatibility date: 2024-09-23
- `npm run deploy` builds and deploys to Cloudflare Pages
- Database migrations via `npm run db:seed` using wrangler D1
## Package Scripts
## Notable Stack Characteristics
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- React components: PascalCase (`LoginPage.tsx`, `DutyChip`, `PhotoButton`)
- Utility modules: camelCase (`authStore.ts`, `shiftCalc.ts`, `generateExcel.ts`, `imageUtils.ts`, `api.ts`)
- Type/interface files: `index.ts` in `types/` directory
- React component functions: PascalCase (e.g., `DutyChip`, `LoginPage`, `InspectionPage`)
- Exported utility functions: camelCase (e.g., `usePhotoUpload`, `getShiftType`, `compressImage`)
- Internal helper functions: camelCase (e.g., `verifyPassword`, `createJWT`, `nanoid`, `patchCell`)
- State variables: camelCase with descriptive intent (e.g., `photoBlob`, `photoPreview`, `staffId`, `setLoading`)
- Constants: UPPER_SNAKE_CASE (e.g., `SHIFT_OFFSETS`, `DIV_NAMES`, `BASE`, `SHIFT_STYLE`)
- Short accumulator variables acceptable in loops: single letter (e.g., `a`, `s`, `r`, `i`)
- React Query state: `query*`, `mutation*` naming pattern
- Interface definitions: PascalCase (e.g., `Staff`, `CheckPoint`, `ApiResponse<T>`, `CheckRecord`)
- Union types: PascalCase or lowercase descriptive (e.g., `Role = 'admin' | 'assistant'`, `CheckResult = 'normal'|'caution'|'bad'`)
- Generic type parameters: Single uppercase letters or meaningful names (e.g., `<T>`)
## Code Style
- No explicit formatter (Prettier/ESLint) configured in project
- 2-space indentation (inferred from source)
- Inline styles extensively used for React components with object notation
- Single quotes for strings in most JavaScript code
- Multiple properties inline when reasonable for JSX attributes
- Line breaks after significant logical blocks
- Not detected. TypeScript strict mode disabled (`"strict": false` in tsconfig.json)
- No unused locals or parameters enforced (`"noUnusedLocals": false`, `"noUnusedParameters": false`)
- Type checking present but lenient
## Import Organization
- Relative paths used throughout (`'../stores/authStore'`, `'../utils/api'`, `'../types'`)
- No path aliases configured in tsconfig
## Error Handling
- Custom error classes extend built-in Error (e.g., `class ApiError extends Error`)
- Status codes included in custom errors: `constructor(public status: number, message: string)`
- Try-catch blocks used for async operations in handlers
- User-visible error messages in Korean with toast notifications
- API responses follow consistent shape: `{ success: boolean; data?: T; error?: string }`
- 401 Unauthorized triggers automatic logout and navigation to login page:
- Internationalized to Korean (e.g., `'요청 실패'`, `'사번과 비밀번호를 입력하세요'`)
- Generic fallback when specific error unavailable
## Logging
- `console.error()` for error logging in try-catch blocks
- Minimal logging in production code; focus on errors
- Example from `functions/api/auth/login.ts`:
## Comments
- Section dividers using dashed lines with Korean labels: `// ── 근무자 태블릿 칩 ────────────────────────────────────`
- Algorithm explanations for complex logic (e.g., shift calculation formulas)
- Reference dates and cycle offsets clearly documented
- Minimal use; mostly absent
- Function parameters typed via TypeScript inference
- Example documentation from `src/utils/generateExcel.ts`:
## Function Design
- Functions range from compact (5-20 lines) to substantial (100+ lines for complex utilities)
- Preference for focused helper functions for reusable logic
- Explicit typing required for API/handler functions
- Generic type parameters used for type-safe responses: `req<T>(...)`
- Destructuring common for object parameters: `{ date, floor, zone }`
- Promises for async operations: `Promise<T>`
- Tuples for multiple returns: `[string, number]`
- Union types for conditional results: `string | null`
- Null/undefined for absence of value (not throwing errors for optional results)
## Module Design
- Named exports preferred for utilities and functions
- Default export used for page components (e.g., `export default function LoginPage() {}`)
- Named exports for reusable components and hooks
- `src/components/ui/index.tsx` exports UI primitives (`DutyChip`, `RoleLabel`, `Donut`, `StatusBadge`, `CatBar`)
- `src/types/index.ts` centralizes all type definitions
## React Patterns
- `useState` for local state
- `useRef` for DOM references and mutable containers
- `useEffect` for side effects with cleanup
- `useCallback` for memoized callbacks to prevent rerenders
- `useMemo` for expensive computations
- `useNavigate` from react-router-dom for programmatic navigation
- Custom hooks like `useDateTime` for reusable logic
- Zustand stores with persist middleware for authentication (`useAuthStore`)
- Store accessed via `useAuthStore.getState()` for non-render contexts
- Zustand `create()` with `persist()` middleware for localStorage persistence
- Functional components exclusively
- Inline styles with CSS variables (e.g., `var(--bg)`, `var(--t1)`, `var(--c-day)`)
- Custom hooks defined within component files as helpers
- Props typed inline or with interfaces
## API Endpoint Patterns
- File-based routing in `functions/` directory (e.g., `functions/api/auth/login.ts`)
- Functions export named handlers: `onRequestGet`, `onRequestPost`, `onRequestPut`, `onRequestDelete`
- Middleware in `functions/_middleware.ts` for auth and CORS
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Frontend: Client-side React SPA with local state management
- Backend: Cloudflare Pages Functions (serverless API)
- Data: Single D1 SQLite database accessed from both layers
- Authentication: JWT tokens with HS256 signature
- State: Zustand for client state, token-based auth for API
## Layers
- Purpose: React single-page application for fire safety inspection and facility management
- Location: `src/`
- Contains: Pages, components, hooks, stores, utility functions, types
- Depends on: API utilities for backend communication, Zustand for auth state
- Used by: Browser/client application
- Purpose: Serverless request handlers for all client operations
- Location: `functions/api/`
- Contains: Route handlers using Cloudflare Pages Functions convention
- Depends on: D1 database, R2 storage, JWT middleware
- Used by: Frontend via HTTP calls
- Purpose: Centralized JWT verification and CORS handling
- Location: `functions/_middleware.ts`
- Contains: JWT validation logic, public route exceptions, CORS headers
- Depends on: Cloudflare Workers crypto API
- Used by: All API routes (enforces auth before handler execution)
- Purpose: Persistent storage via D1 SQLite
- Tables: staff, schedule_items, inspection_sessions, check_records, check_points, elevators, etc.
- Accessed from: API handlers and frontend utility functions
- Managed by: Migrations in `migrations/`
## Data Flow
- **Client state:** Zustand store (`authStore`) for JWT, staff info, authentication flag
- **Server state:** D1 database is single source of truth
- **UI state:** React component state for modals, forms, navigation
- **Cache:** React Query manages API response caching with staleTime/refetch strategies
## Key Abstractions
- Purpose: Centralized HTTP request handling with auth injection
- Examples: `api.get()`, `api.post()`, `dashboardApi`, `scheduleApi`, `inspectionApi`
- Pattern: Factory functions return API namespaces with typed methods
- Purpose: Persist authentication state across sessions
- Examples: `useAuthStore.login()`, `useAuthStore.logout()`, `useAuthStore.getState()`
- Pattern: Zustand store with localStorage persistence via `persist` middleware
- Purpose: Centralized TypeScript interfaces for data contracts
- Examples: `Staff`, `CheckPoint`, `CheckRecord`, `ScheduleItem`, `Elevator`
- Pattern: Role-based role types (`'admin' | 'assistant'`), status enums as literal unions
- Purpose: Screen-level containers managing entire view logic
- Examples: `DashboardPage`, `InspectionPage`, `ElevatorPage`
- Pattern: Use React Query hooks for data fetching, local state for UI, route-based code splitting
## Entry Points
- Location: `src/main.tsx`
- Triggers: Browser loads root URL, Vite dev server, or deployed SPA
- Responsibilities: Mounts React app to DOM, initializes Router, QueryClient
- Location: `src/App.tsx`
- Triggers: Every route change
- Responsibilities: Defines all routes with lazy-loaded pages, Auth wrapper for protected routes, Suspense fallbacks
- Location: `functions/_middleware.ts`
- Triggers: Every incoming request to `/api/` (except public routes)
- Responsibilities: Verifies JWT signature, extracts staffId/role/name, passes to handler via `ctx.data`
- Location: `functions/api/dashboard/stats.ts`
- Triggers: GET `/api/dashboard/stats`
- Responsibilities: Calculates statistics from database, builds weekly progress, returns dashboard data
- Location: `functions/api/inspections/index.ts`
- Triggers: GET (list sessions) / POST (create session)
- Responsibilities: Manages inspection sessions for checkpoint checking workflow
## Error Handling
- **API Request Errors** (`src/utils/api.ts`): Throws `ApiError(status, message)` on non-200 responses or `!json.success`
- **Auth Errors**: 401 status triggers automatic logout and redirect to `/login` in API client
- **Database Errors** (API handlers): Caught in try-catch, returns `{ success: false, error: 'message' }` with 500 status
- **Component Errors**: React Suspense boundary shows `Loader` component during async operations
- **Form Validation**: Input validation before API calls (e.g., staffId/password non-empty check)
## Cross-Cutting Concerns
- Frontend: Basic checks on form inputs before submission
- Backend: Parameter validation in request handlers before DB operations
- JWT tokens with 12-hour expiration
- Token stored in localStorage via Zustand persistence
- Middleware enforces Bearer token presence on protected routes
- Public routes: `/api/auth/login`, `/api/health`, `/api/uploads/*`, `/api/public/*`
- HTTP-level: React Query with 30s staleTime on dashboard
- Storage-level: PWA workbox caches API responses (NetworkFirst strategy, 5 min max-age)
- Client-level: Component state for UI interaction state
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
