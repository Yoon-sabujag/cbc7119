// GET /api/database/r2-download?key=xxx — R2 객체 하나 다운로드
import type { Env } from '../../_middleware'

export const onRequestGet: PagesFunction<Env> = async ({ request, env, data }) => {
  const { role } = data as { role: string }
  if (role !== 'admin') return Response.json({ success: false, error: '관리자만 접근 가능' }, { status: 403 })

  const url = new URL(request.url)
  const key = url.searchParams.get('key')
  if (!key) return Response.json({ success: false, error: 'key 필요' }, { status: 400 })

  const obj = await env.STORAGE.get(key)
  if (!obj) return Response.json({ success: false, error: '파일 없음' }, { status: 404 })

  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
      'Content-Length': String(obj.size),
      'Access-Control-Allow-Origin': '*',
    },
  })
}
