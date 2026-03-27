# Codebase Structure

**Analysis Date:** 2026-03-28

## Directory Layout

```
cha-bio-safety/
├── src/                          # Frontend React application
│   ├── pages/                    # Page components (route-level)
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Basic UI primitives
│   │   ├── floors/               # Floor plan visualization
│   │   ├── BottomNav.tsx         # Navigation bar
│   │   ├── SettingsPanel.tsx     # Settings modal
│   │   └── SideMenu.tsx          # Drawer menu
│   ├── stores/                   # Zustand state stores
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Utility functions
│   ├── types/                    # TypeScript type definitions
│   ├── assets/                   # Static images, icons
│   ├── App.tsx                   # Main app component with router
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles
├── functions/                    # Cloudflare Pages Functions (serverless API)
│   ├── api/                      # API route handlers
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── dashboard/            # Dashboard data endpoints
│   │   ├── inspections/          # Inspection workflow endpoints
│   │   ├── schedule/             # Schedule management endpoints
│   │   ├── elevators/            # Elevator status endpoints
│   │   ├── leaves/               # Leave request endpoints
│   │   ├── checkpoints/          # Checkpoint lookup endpoints
│   │   ├── div/                  # DIV inspection endpoints
│   │   ├── uploads/              # File upload handling
│   │   ├── reports/              # Report generation endpoints
│   │   └── public/               # Public-access endpoints
│   └── _middleware.ts            # JWT auth middleware
├── migrations/                   # Database migration files
│   └── seed.sql                  # Initial data seeding
├── public/                       # Static assets served to client
│   ├── templates/                # Report templates
│   └── _routes.json              # Cloudflare Pages routing config
├── workers/                      # Standalone worker scripts (if any)
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite build configuration
├── wrangler.toml                 # Cloudflare Pages/D1 configuration
└── tailwind.config.js            # Tailwind CSS configuration
```

## Directory Purposes

**src/pages/:**
- Purpose: Full-page screen components (one per route)
- Contains: `.tsx` files named like `DashboardPage.tsx`, `InspectionPage.tsx`
- Key files:
  - `DashboardPage.tsx`: Main dashboard showing stats, schedule, staff
  - `InspectionPage.tsx`: Large component handling checkpoint inspection workflow
  - `LoginPage.tsx`: Authentication form
  - `QRScanPage.tsx`: QR code scanner for checkpoint lookup
  - `ElevatorPage.tsx`: Elevator status and maintenance tracking
  - `SchedulePage.tsx`: Calendar-based schedule view
  - `DivPage.tsx`: DIV (Division) inspection records

**src/components/:**
- Purpose: Reusable UI components used across pages
- Contains: Functional components for buttons, cards, dialogs, charts
- Key subdirectories:
  - `ui/`: Basic primitives (`Donut`, `StatusBadge`, `CatBar`, `RoleLabel`)
  - `floors/`: Floor plan visualization components
  - Navigation: `BottomNav.tsx` (mobile bottom tab bar), `SideMenu.tsx`, `SettingsPanel.tsx`

**src/stores/:**
- Purpose: Zustand state management stores
- Contains: `authStore.ts` - authentication state (token, staff info, login/logout methods)
- Persisted to localStorage under key `cha-bio-auth`

**src/hooks/:**
- Purpose: Custom React hooks
- Contains: `useDateTime.ts` - date/time formatting utilities
- Pattern: Name hooks with `use` prefix

**src/utils/:**
- Purpose: Utility functions and helpers
- Key files:
  - `api.ts`: HTTP client with auth injection, API namespaces (dashboardApi, scheduleApi, etc.)
  - `generateExcel.ts`: Excel export functionality
  - `shiftCalc.ts`: Shift schedule calculations
  - `imageUtils.ts`: Image processing helpers

**src/types/index.ts:**
- Purpose: Centralized TypeScript interfaces
- Contains: `Staff`, `CheckPoint`, `CheckRecord`, `ScheduleItem`, `Elevator`, `DashboardStats`, `WeeklyItem`
- Pattern: Types exported at module root, imported as `import type { Staff } from '../types'`

**functions/api/:**
- Purpose: Route handlers for Cloudflare Pages Functions
- Pattern: File path maps to URL path (e.g., `functions/api/auth/login.ts` → POST `/api/auth/login`)
- Dynamic routes: `[id].ts` becomes `/api/{resource}/{id}`, `[[path]].ts` catches remaining segments
- Each handler exports `onRequestGet`, `onRequestPost`, `onRequestPut`, etc.

**functions/_middleware.ts:**
- Purpose: Cloudflare Pages middleware executed before every request
- Responsibilities: JWT verification, CORS headers, auth context injection
- Exports: `onRequest: PagesFunction<Env>`

**migrations/:**
- Purpose: SQL files for database schema and seed data
- Key file: `seed.sql` - initial staff, checkpoints, elevators, schedules
- Run with: `npm run db:seed`

**public/:**
- Purpose: Static assets served directly (not bundled)
- Contains: Icons, manifest, templates, routing config
- Key file: `_routes.json` - Cloudflare Pages routing rules (SPA fallback to index.html)

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React DOM mount point
- `src/App.tsx`: Router definition and page layout
- `functions/_middleware.ts`: API authentication middleware
- `functions/api/auth/login.ts`: Authentication endpoint

**Configuration:**
- `package.json`: Dependencies, scripts, project metadata
- `tsconfig.json`: TypeScript compiler options (target ES2022, JSX react-jsx)
- `vite.config.ts`: Build configuration (React plugin, PWA plugin, dev proxy)
- `wrangler.toml`: Cloudflare bindings (D1 database, R2 storage)
- `tailwind.config.js`: CSS utility framework setup

**Core Logic:**
- `src/utils/api.ts`: All HTTP requests flow through here
- `src/stores/authStore.ts`: Authentication state and persistence
- `functions/api/dashboard/stats.ts`: Dashboard data aggregation logic
- `functions/api/inspections/index.ts`: Inspection session management
- `src/pages/InspectionPage.tsx`: Complex checkpoint inspection UI state

**Testing:**
- No test files detected (none found in codebase)

## Naming Conventions

**Files:**
- Page components: PascalCase with `Page` suffix (e.g., `DashboardPage.tsx`)
- Utility functions: camelCase (e.g., `api.ts`, `generateExcel.ts`)
- Components: PascalCase (e.g., `BottomNav.tsx`, `SideMenu.tsx`)
- Stores: camelCase with `Store` suffix (e.g., `authStore.ts`)
- Hooks: camelCase with `use` prefix (e.g., `useDateTime.ts`)
- Types: PascalCase interfaces (e.g., `Staff`, `CheckPoint`)
- API handlers: lowercase or PascalCase, matching URL pattern (e.g., `login.ts`, `stats.ts`)

**Directories:**
- Lowercase plural for collections (e.g., `pages/`, `components/`, `functions/`)
- Lowercase singular for feature groups (e.g., `api/`, `ui/`, `stores/`)
- Dynamic segments in brackets (e.g., `[id].ts`, `[sessionId]/`)
- Catch-all segments in double brackets (e.g., `[[path]].ts`)

## Where to Add New Code

**New Feature (e.g., inspection reports):**
- Primary code: Create page in `src/pages/ReportPage.tsx`, add route in `src/App.tsx`
- API handler: Create `functions/api/reports/index.ts` and `[id].ts` as needed
- Types: Add `Report` interface to `src/types/index.ts`
- API client: Add `reportsApi` namespace to `src/utils/api.ts`
- Tests: Not present in current structure (add under `src/__tests__/` if starting tests)

**New Component (UI element or feature block):**
- Implementation: `src/components/ComponentName.tsx`
- Usage: Import and use in pages or other components
- Styling: Tailwind classes inline or in component styles, global styles in `src/index.css`

**Utilities and Helpers:**
- Shared helpers: `src/utils/newUtility.ts`
- Date/time logic: Extend `src/hooks/useDateTime.ts`
- Data transformation: Add to relevant utility file or new `src/utils/transform.ts`

**New API Route:**
- Create file matching URL path: `functions/api/{resource}/{operation}.ts`
- Export handler: `onRequestPost` for POST, `onRequestGet` for GET, etc.
- Access auth context: Destructure `{ data }` from `PagesFunction` context, cast to `any`
- Return response: `Response.json({ success: true, data: {...} })` with appropriate status

## Special Directories

**node_modules/:**
- Purpose: Installed dependencies
- Generated: Yes (via npm install)
- Committed: No (in .gitignore)

**dist/:**
- Purpose: Built output deployed to Cloudflare
- Generated: Yes (via `npm run build` - builds frontend and includes functions)
- Committed: No (build artifact)

**.next/ (if using Next.js - not present):**
- Not applicable; project uses Vite + Cloudflare Pages

**public/templates/:**
- Purpose: HTML/template files for reports
- Generated: No
- Committed: Yes (source files for report generation)

---

*Structure analysis: 2026-03-28*
