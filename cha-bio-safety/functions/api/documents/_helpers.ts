import type { Env } from '../../_middleware'

export type DocType = 'plan' | 'drill'

// D-21: allowed MIME + extension whitelist
export const ALLOWED_FILE_TYPES: Array<{ ext: string; mimes: string[] }> = [
  { ext: '.pdf',  mimes: ['application/pdf'] },
  { ext: '.xlsx', mimes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] },
  { ext: '.docx', mimes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
  { ext: '.pptx', mimes: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'] },
  { ext: '.hwp',  mimes: ['application/x-hwp', 'application/vnd.hancom.hwp', 'application/haansofthwp'] },
  { ext: '.zip',  mimes: ['application/zip', 'application/x-zip-compressed'] },
]

// D-23: 200MB hard cap
export const MAX_DOC_SIZE = 200 * 1024 * 1024

// nanoid — reused from functions/api/uploads/index.ts
export function nanoid(n = 21): string {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const a = crypto.getRandomValues(new Uint8Array(n))
  return Array.from(a, b => c[b % c.length]).join('')
}

// D-22: both contentType AND filename extension must be in the same whitelist entry
export function validateFileType(contentType: string, filename: string): { ok: true } | { ok: false; error: string } {
  const lower = filename.toLowerCase()
  const entry = ALLOWED_FILE_TYPES.find(e => lower.endsWith(e.ext))
  if (!entry) return { ok: false, error: '허용되지 않은 파일 형식입니다 (pdf, xlsx, docx, pptx, hwp, zip만 가능)' }
  if (!entry.mimes.includes(contentType)) return { ok: false, error: '파일 확장자와 콘텐츠 타입이 일치하지 않습니다' }
  return { ok: true }
}

// D-06: R2 key pattern — documents/{type}/{year}/{nanoid}_{filename}
export function buildR2Key(type: DocType, year: number, filename: string): string {
  // strip path separators from filename defensively
  const safeName = filename.replace(/[\\/]/g, '_')
  return `documents/${type}/${year}/${nanoid()}_${safeName}`
}

// D-18: admin gate — returns Response on denial, null on pass
export function requireAdmin(ctx: { data?: { role?: string } }): Response | null {
  const role = ctx.data?.role
  if (role !== 'admin') {
    return Response.json({ success: false, error: '관리자만 업로드할 수 있습니다' }, { status: 403 })
  }
  return null
}

export function jsonError(status: number, error: string, extra?: Record<string, unknown>): Response {
  return Response.json({ success: false, error, ...(extra || {}) }, { status })
}

export function jsonOk<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data }, { status })
}

export function isDocType(v: unknown): v is DocType {
  return v === 'plan' || v === 'drill'
}

// Re-export Env for convenience
export type { Env }
