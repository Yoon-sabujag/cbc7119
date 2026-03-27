# External Integrations

**Analysis Date:** 2026-03-28

## APIs & External Services

**None detected** - Application is self-contained with no third-party API integrations (Stripe, Supabase, AWS SDK, etc.).

All external communication is internal to the Cloudflare ecosystem via bindings.

## Data Storage

**Database:**
- Cloudflare D1 (SQLite)
  - Database name: `cha-bio-db`
  - Database ID: `b12b88e7-fc41-4186-8f35-ee9cbaf994c7`
  - Binding: `DB` (accessed via `env.DB` in Workers functions)
  - Schema location: `migrations/` directory with 23 migration files
  - Client: Web Crypto API + SQL direct execution (no ORM)
  - Sample queries in `/functions/api/auth/login.ts` show prepared statements with `.bind()` and `.first()` methods

**File Storage:**
- Cloudflare R2 bucket: `cha-bio-storage`
  - Binding: `STORAGE` (accessed via `env.STORAGE` in Workers functions)
  - Usage: Image storage for inspection photos
  - Storage path structure: `inspections/{YYYYMMDD}/{nanoid}.jpg`
  - Implementation: `/functions/api/uploads/index.ts` handles POST uploads with HTTP metadata
  - Retrieval: `/functions/api/uploads/[[path]].ts` serves files back to clients

**Caching:**
- Browser-based PWA caching only (via Workbox in `vite.config.ts`)
- Cache strategy: NetworkFirst for GET `/api/*` requests
- TTL: 300 seconds, max 50 entries

## Authentication & Identity

**Auth Provider:** Custom JWT implementation

**Implementation:**
- Location: `/functions/api/auth/login.ts`
- Mechanism: Bearer token JWT with HS256 signature
- Token creation: Custom `createJWT()` function using Web Crypto API (HMAC-SHA256)
- Token verification: Custom `verifyJWT()` in `/functions/_middleware.ts`
- JWT payload: `{ sub, name, role, title, iat, exp }`
- Token TTL: 12 hours (43,200 seconds)
- Storage: Client-side in Zustand store (`authStore.ts`) with browser localStorage persistence
- Middleware: `/functions/_middleware.ts` enforces JWT on all `/api/*` routes except whitelist

**Public endpoints (no auth required):**
- `/api/auth/login` - POST login endpoint
- `/api/health` - Health check
- `/api/uploads/*` - File downloads (anyone can fetch if they know the path)
- `/api/public/*` - Public content prefix

**Auth flow:**
1. Client submits `{ staffId, password }` to `/api/auth/login`
2. Server verifies password against SHA-256 hash in `staff` table
3. Server returns JWT token and staff object
4. Client stores token in Zustand store (persisted to localStorage)
5. All subsequent requests include `Authorization: Bearer {token}` header
6. Middleware verifies JWT signature and expiration
7. On 401 response, client clears store and redirects to `/login`

## Monitoring & Observability

**Error Tracking:** Not detected

**Logs:**
- Console logging via `console.error()` in error handlers (e.g., `/functions/api/auth/login.ts`)
- No centralized logging service detected

## CI/CD & Deployment

**Hosting:**
- Cloudflare Pages (with Pages Functions for API)
- Build output directory: `dist/`

**CI Pipeline:**
- Not detected (manual deployment via `npm run deploy`)

**Deployment process:**
```bash
npm run build              # TypeScript + Vite build
npx wrangler pages deploy  # Deploy to Cloudflare Pages
```

## Environment Configuration

**Required environment variables:**
- `JWT_SECRET` - Signing secret for JWT tokens (env var in wrangler.toml)
- `VITE_API_BASE_URL` - Base URL for API calls (frontend, defaults to `/api`)
- `ENVIRONMENT` - Runtime environment string (set to "production" in wrangler.toml)

**Database credentials:**
- Not required - D1 binding handles authentication transparently

**Cloudflare credentials:**
- Managed via `wrangler` CLI with local Cloudflare account (`~/.wrangler/`)

**Secrets location:**
- Wrangler manages secrets via `wrangler secret put` command (not stored in wrangler.toml)
- `JWT_SECRET` must be set via wrangler secret store
- Not detected in version control (correctly excluded)

## Webhooks & Callbacks

**Incoming:** Not detected

**Outgoing:** Not detected

**Note:** Application uses pull-based API calls only. No webhook integrations with external services.

## Service Bindings & Cloudflare Features

**Active bindings:**
- `DB` → Cloudflare D1 (SQLite database)
- `STORAGE` → Cloudflare R2 (object storage)
- `JWT_SECRET` → Environment variable for authentication

**Compatibility date:** 2024-09-23
- Specifies runtime feature set for Cloudflare Workers

**PWA capabilities:**
- Service Worker registration via Workbox
- Offline-first caching for API responses
- Installable web app manifest with Korean app name "차바이오컴플렉스 방재"

## Data Flow & Integration Points

**Authentication flow:**
```
Client (React) → /api/auth/login → D1 (staff table) → JWT token → localStorage
                                    ↓
                         Password hash verification
```

**Inspection data flow:**
```
Client (React) → /api/inspections/* → D1 (check_records table)
                                       ↓
                         /api/uploads/* → R2 (photo storage)
```

**API request pattern:**
```typescript
// src/utils/api.ts - All requests follow this pattern:
1. Get JWT from Zustand store
2. Add Authorization header (Bearer token)
3. Fetch to BASE_URL (defaults to /api)
4. Parse JSON response { success, data, error }
5. On 401: clear auth store, redirect to /login
```

**Middleware verification chain:**
```
Request → /functions/_middleware.ts
         ↓
         Check if public endpoint
         ↓ (no)
         Extract Bearer token
         ↓
         Verify JWT signature + expiration
         ↓ (valid)
         Add staffId/role to context
         ↓
         Pass to specific handler (e.g., /api/auth/login)
```

---

*Integration audit: 2026-03-28*
