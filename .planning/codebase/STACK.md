# Technology Stack

**Analysis Date:** 2026-03-28

## Languages

**Primary:**
- TypeScript 5.6.3 - All application code (frontend, backend, migrations)

**Secondary:**
- JavaScript - Build configuration files (vite.config.ts, tailwind.config.js, postcss.config.js)
- SQL - Database migrations and schema definitions

## Runtime

**Environment:**
- Node.js (implied by npm/wrangler tooling)

**Platform:**
- Cloudflare Workers + Pages (serverless edge computing)

**Package Manager:**
- npm (v10+)
- Lockfile: `package-lock.json` present

## Frameworks

**Frontend:**
- React 18.3.1 - UI rendering and component framework
- React Router DOM 6.26.2 - Client-side routing
- Vite 5.4.8 - Build tool and dev server
- Zustand 5.0.0 - Lightweight state management

**Backend:**
- Cloudflare Pages Functions (serverless API handlers)
- Cloudflare D1 - SQLite database binding
- Cloudflare R2 - Object storage binding

**Styling:**
- Tailwind CSS 3.4.14 - Utility-first CSS framework
- PostCSS 8.4.47 - CSS transformation
- Autoprefixer 10.4.20 - Browser vendor prefixes

**Testing:**
- Not detected

**Build/Dev:**
- TypeScript 5.6.3 - Type checking
- Vite PWA 0.21.0 - Progressive Web App plugin
- Wrangler 4.75.0 - Cloudflare CLI tool
- Cloudflare Workers Types 4.20260317.1 - Type definitions

## Key Dependencies

**Critical:**
- @tanstack/react-query 5.59.0 - Server state management and data synchronization
- jose 5.9.6 - JWT creation and verification for authentication
- date-fns 4.1.0 and date-fns-tz 3.2.0 - Date manipulation with timezone support

**UI Components:**
- lucide-react 0.454.0 - Icon library
- react-hot-toast 2.4.1 - Toast notification system

**QR Code Handling:**
- qrcode 1.5.4 - QR code generation
- qrcode.react 4.2.0 - React wrapper for QR code generation
- html5-qrcode 2.3.8 - QR code scanning from camera/images

**Document Export:**
- jspdf 4.2.1 - PDF generation
- xlsx-js-style 1.2.0 - Excel file generation with styling

## Configuration

**Environment:**
- Vite environment variables via `import.meta.env`
- Required: `VITE_API_BASE_URL` (defaults to `/api`)
- Wrangler configuration in `wrangler.toml`
- Cloudflare bindings: `DB` (D1), `STORAGE` (R2), `JWT_SECRET` (env var)

**Build:**
- `vite.config.ts` - Frontend build and PWA configuration
- `tsconfig.json` - TypeScript compiler options (ES2022 target, JSX support)
- `tailwind.config.js` - Tailwind CSS customization with Korean fonts (Noto Sans KR, JetBrains Mono)
- `postcss.config.js` - PostCSS plugins for Tailwind and Autoprefixer

**TypeScript:**
- Strict type checking disabled (`strict: false`)
- Module resolution: "bundler"
- Allows importing `.ts` extensions
- Resolves JSON modules

## Platform Requirements

**Development:**
- Node.js runtime
- npm package manager
- Wrangler CLI for local development (`npm run dev:api`)
- Git for version control

**Production:**
- Cloudflare Workers + Pages platform
- Cloudflare D1 database (SQLite)
- Cloudflare R2 object storage bucket (`cha-bio-storage`)
- Compatibility date: 2024-09-23

**Deployment:**
- `npm run deploy` builds and deploys to Cloudflare Pages
- Database migrations via `npm run db:seed` using wrangler D1

## Package Scripts

```bash
npm run dev:front      # Start Vite dev server (port 5173)
npm run dev:api        # Start Wrangler Pages dev with D1 (proxy to :8788)
npm run build          # TypeScript compile + Vite build to dist/
npm run preview        # Preview production build locally
npm run deploy         # Build and deploy to Cloudflare Pages
npm run db:seed        # Execute migrations/seed.sql on local D1
```

## Notable Stack Characteristics

**Edge-first architecture:** All code runs on Cloudflare edge infrastructure, eliminating traditional server operations.

**Integrated PWA support:** Vite PWA plugin with offline caching strategy for GET requests to `/api/*` endpoints (300 second cache TTL, 50 entry limit).

**Custom JWT implementation:** Uses Web Crypto API (HMAC-SHA256) for JWT creation/verification instead of external libraries.

**Custom password hashing:** SHA-256 based with salt in `/functions/api/auth/login.ts`, not bcrypt.

**Internationalization:** UI strings in Korean (차바이오컴플렉스 방재), with Korean-first font stack.

---

*Stack analysis: 2026-03-28*
