import type { Env } from '../../../_middleware'

// GET /api/public/panel/latest.jpg (+ alarms/<id>.jpg) — 공개 프레임 프록시 (버킷 비공개 유지 + no-store).
// 미들웨어 PUBLIC_PREFIX '/api/public/' 커버 → JWT 없음.
export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const seg = params.path
  const rel = Array.isArray(seg) ? seg.join('/') : (seg || '')
  if (!rel || rel.includes('..')) return new Response(null, { status: 400 })
  const obj = await env.STORAGE.get(`panel/${rel}`)
  if (!obj) return new Response(null, { status: 204 })
  return new Response(obj.body, {
    headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'no-store' },
  })
}
