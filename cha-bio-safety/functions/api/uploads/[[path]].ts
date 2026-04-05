import type { Env } from '../../_middleware'

// ── 확장자 → Content-Type 매핑 ──────────────────────
const EXT_MIME: Record<string, string> = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.pdf':  'application/pdf',
  '.svg':  'image/svg+xml',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

function contentTypeFromKey(key: string): string {
  const dotIdx = key.lastIndexOf('.')
  if (dotIdx !== -1) {
    const ext = key.slice(dotIdx).toLowerCase()
    if (EXT_MIME[ext]) return EXT_MIME[ext]
  }
  return 'application/octet-stream'
}

// GET /api/uploads/{...path}
export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const key = (params.path as string[]).join('/')
  if (!key) return new Response('Not Found', { status: 404 })

  const obj = await env.STORAGE.get(key)
  if (!obj) return new Response('Not Found', { status: 404 })

  return new Response(obj.body, {
    headers: {
      'Content-Type':  contentTypeFromKey(key),
      'Cache-Control': 'private, max-age=31536000',
    },
  })
}
