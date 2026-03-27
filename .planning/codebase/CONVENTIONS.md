# Coding Conventions

**Analysis Date:** 2026-03-28

## Naming Patterns

**Files:**
- React components: PascalCase (`LoginPage.tsx`, `DutyChip`, `PhotoButton`)
- Utility modules: camelCase (`authStore.ts`, `shiftCalc.ts`, `generateExcel.ts`, `imageUtils.ts`, `api.ts`)
- Type/interface files: `index.ts` in `types/` directory

**Functions:**
- React component functions: PascalCase (e.g., `DutyChip`, `LoginPage`, `InspectionPage`)
- Exported utility functions: camelCase (e.g., `usePhotoUpload`, `getShiftType`, `compressImage`)
- Internal helper functions: camelCase (e.g., `verifyPassword`, `createJWT`, `nanoid`, `patchCell`)

**Variables:**
- State variables: camelCase with descriptive intent (e.g., `photoBlob`, `photoPreview`, `staffId`, `setLoading`)
- Constants: UPPER_SNAKE_CASE (e.g., `SHIFT_OFFSETS`, `DIV_NAMES`, `BASE`, `SHIFT_STYLE`)
- Short accumulator variables acceptable in loops: single letter (e.g., `a`, `s`, `r`, `i`)
- React Query state: `query*`, `mutation*` naming pattern

**Types:**
- Interface definitions: PascalCase (e.g., `Staff`, `CheckPoint`, `ApiResponse<T>`, `CheckRecord`)
- Union types: PascalCase or lowercase descriptive (e.g., `Role = 'admin' | 'assistant'`, `CheckResult = 'normal'|'caution'|'bad'`)
- Generic type parameters: Single uppercase letters or meaningful names (e.g., `<T>`)

## Code Style

**Formatting:**
- No explicit formatter (Prettier/ESLint) configured in project
- 2-space indentation (inferred from source)
- Inline styles extensively used for React components with object notation
- Single quotes for strings in most JavaScript code
- Multiple properties inline when reasonable for JSX attributes
- Line breaks after significant logical blocks

**Linting:**
- Not detected. TypeScript strict mode disabled (`"strict": false` in tsconfig.json)
- No unused locals or parameters enforced (`"noUnusedLocals": false`, `"noUnusedParameters": false`)
- Type checking present but lenient

## Import Organization

**Order:**
1. React/framework imports (`import { useState } from 'react'`, `import { create } from 'zustand'`)
2. External library imports (date-fns, react-hot-toast, react-router-dom, jose, jspdf)
3. Type imports (`import type { ... } from '../types'`)
4. Local utility/store imports (`import { useAuthStore } from '../stores/authStore'`)
5. Local component imports (internal UI components)

**Path Aliases:**
- Relative paths used throughout (`'../stores/authStore'`, `'../utils/api'`, `'../types'`)
- No path aliases configured in tsconfig

**Example pattern from `src/pages/LoginPage.tsx`:**
```typescript
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../stores/authStore'
import { authApi, ApiError } from '../utils/api'
```

## Error Handling

**Patterns:**
- Custom error classes extend built-in Error (e.g., `class ApiError extends Error`)
- Status codes included in custom errors: `constructor(public status: number, message: string)`
- Try-catch blocks used for async operations in handlers
- User-visible error messages in Korean with toast notifications
- API responses follow consistent shape: `{ success: boolean; data?: T; error?: string }`
- 401 Unauthorized triggers automatic logout and navigation to login page:
  ```typescript
  if (res.status === 401) { useAuthStore.getState().logout(); window.location.href = '/login' }
  ```

**Error Messages:**
- Internationalized to Korean (e.g., `'요청 실패'`, `'사번과 비밀번호를 입력하세요'`)
- Generic fallback when specific error unavailable

**Example from `src/utils/api.ts`:**
```typescript
export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); this.name = 'ApiError' }
}

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...init, headers })
  const json = await res.json() as { success: boolean; data?: T; error?: string }
  if (!res.ok || !json.success) {
    if (res.status === 401) { useAuthStore.getState().logout(); window.location.href = '/login' }
    throw new ApiError(res.status, json.error ?? '요청 실패')
  }
  return json.data as T
}
```

## Logging

**Framework:** console (native browser console)

**Patterns:**
- `console.error()` for error logging in try-catch blocks
- Minimal logging in production code; focus on errors
- Example from `functions/api/auth/login.ts`:
  ```typescript
  } catch (e) {
    console.error('login error:', e)
    return Response.json({ success:false, error:'서버 오류가 발생했습니다' }, { status:500 })
  }
  ```

## Comments

**When to Comment:**
- Section dividers using dashed lines with Korean labels: `// ── 근무자 태블릿 칩 ────────────────────────────────────`
- Algorithm explanations for complex logic (e.g., shift calculation formulas)
- Reference dates and cycle offsets clearly documented

**JSDoc/TSDoc:**
- Minimal use; mostly absent
- Function parameters typed via TypeScript inference
- Example documentation from `src/utils/generateExcel.ts`:
  ```typescript
  /**
   * styles.xml에 origIdx 스타일을 복제하고 shrinkToFit="1" 을 추가해
   * 새 스타일 인덱스를 반환한다. wrapText는 제거(shrinkToFit과 양립 불가).
   */
  function addShrinkStyle(stylesXml: string, origIdx: number): [string, number]
  ```

## Function Design

**Size:**
- Functions range from compact (5-20 lines) to substantial (100+ lines for complex utilities)
- Preference for focused helper functions for reusable logic

**Parameters:**
- Explicit typing required for API/handler functions
- Generic type parameters used for type-safe responses: `req<T>(...)`
- Destructuring common for object parameters: `{ date, floor, zone }`

**Return Values:**
- Promises for async operations: `Promise<T>`
- Tuples for multiple returns: `[string, number]`
- Union types for conditional results: `string | null`
- Null/undefined for absence of value (not throwing errors for optional results)

**Example pattern from `src/utils/api.ts`:**
```typescript
async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { token } = useAuthStore.getState()
  const headers: Record<string,string> = { 'Content-Type':'application/json', ...(init.headers as Record<string,string>) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { ...init, headers })
  const json = await res.json() as { success: boolean; data?: T; error?: string }
  if (!res.ok || !json.success) {
    if (res.status === 401) { useAuthStore.getState().logout(); window.location.href = '/login' }
    throw new ApiError(res.status, json.error ?? '요청 실패')
  }
  return json.data as T
}

export const api = {
  get:    <T>(p: string)             => req<T>(p),
  post:   <T>(p: string, b: unknown) => req<T>(p, { method:'POST',  body: JSON.stringify(b) }),
  put:    <T>(p: string, b: unknown) => req<T>(p, { method:'PUT',   body: JSON.stringify(b) }),
  delete: <T>(p: string)             => req<T>(p, { method:'DELETE' }),
}
```

## Module Design

**Exports:**
- Named exports preferred for utilities and functions
- Default export used for page components (e.g., `export default function LoginPage() {}`)
- Named exports for reusable components and hooks

**Barrel Files:**
- `src/components/ui/index.tsx` exports UI primitives (`DutyChip`, `RoleLabel`, `Donut`, `StatusBadge`, `CatBar`)
- `src/types/index.ts` centralizes all type definitions

**Example barrel from `src/components/ui/index.tsx`:**
```typescript
export function DutyChip({ staff, onClick, small }: DutyChipProps) { ... }
export function RoleLabel({ text, color }: RoleLabelProps) { ... }
export function Donut({ pct, color, size = 40, strokeWidth = 5 }: DonutProps) { ... }
export function StatusBadge({ status }: { status: string }) { ... }
export function CatBar({ category }: { category: string }) { ... }
```

## React Patterns

**Hooks Usage:**
- `useState` for local state
- `useRef` for DOM references and mutable containers
- `useEffect` for side effects with cleanup
- `useCallback` for memoized callbacks to prevent rerenders
- `useMemo` for expensive computations
- `useNavigate` from react-router-dom for programmatic navigation
- Custom hooks like `useDateTime` for reusable logic

**State Management:**
- Zustand stores with persist middleware for authentication (`useAuthStore`)
- Store accessed via `useAuthStore.getState()` for non-render contexts
- Zustand `create()` with `persist()` middleware for localStorage persistence

**Component Structure:**
- Functional components exclusively
- Inline styles with CSS variables (e.g., `var(--bg)`, `var(--t1)`, `var(--c-day)`)
- Custom hooks defined within component files as helpers
- Props typed inline or with interfaces

**Example custom hook from `src/pages/InspectionPage.tsx`:**
```typescript
function usePhotoUpload() {
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(async (): Promise<string | null> => {
    if (!photoBlob) return null
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', photoBlob, 'photo.jpg')
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: form,
        headers: { Authorization: `Bearer ${(await import('../stores/authStore')).useAuthStore.getState().token}` },
      })
      const json = await res.json() as { success: boolean; data?: { key: string } }
      return json.success ? json.data!.key : null
    } finally {
      setUploading(false)
    }
  }, [photoBlob])

  return { inputRef, photoPreview, uploading, pickPhoto, handleFile, removePhoto, upload, reset, hasPhoto: !!photoBlob }
}
```

## API Endpoint Patterns

**Cloudflare Pages Function Routes:**
- File-based routing in `functions/` directory (e.g., `functions/api/auth/login.ts`)
- Functions export named handlers: `onRequestGet`, `onRequestPost`, `onRequestPut`, `onRequestDelete`
- Middleware in `functions/_middleware.ts` for auth and CORS

**Handler Signature:**
```typescript
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  // request: Request object
  // env: Environment with DB, STORAGE, JWT_SECRET
  // data: Middleware-injected context (staffId, staffName, role)
}
```

**Example from `functions/api/schedule/index.ts`:**
```typescript
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const date = url.searchParams.get('date')
  const month = url.searchParams.get('month')

  let sql = 'SELECT * FROM schedule_items WHERE 1=1'
  const binds: string[] = []

  if (date) {
    sql += ' AND date=?'; binds.push(date)
  } else if (month) {
    sql += ' AND date LIKE ?'; binds.push(`${month}%`)
  }

  let stmt = env.DB.prepare(sql)
  if (binds.length === 1) stmt = stmt.bind(binds[0])
  else if (binds.length === 2) stmt = stmt.bind(binds[0], binds[1])

  const result = await stmt.all<Record<string,unknown>>()
  return Response.json({ success: true, data: rows })
}
```

---

*Convention analysis: 2026-03-28*
