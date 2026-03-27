import type { Env } from '../../_middleware'

// GET /api/uploads/inspections/{date}/{id}.jpg
export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const key = (params.path as string[]).join('/')
  if (!key) return new Response('Not Found', { status: 404 })

  const obj = await env.STORAGE.get(key)
  if (!obj) return new Response('Not Found', { status: 404 })

  return new Response(obj.body, {
    headers: {
      'Content-Type':  'image/jpeg',
      'Cache-Control': 'private, max-age=31536000',
    },
  })
}
