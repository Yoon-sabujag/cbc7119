import type { Env } from '../../_middleware'

function nanoid(n = 21) {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const a = crypto.getRandomValues(new Uint8Array(n))
  return Array.from(a, b => c[b % c.length]).join('')
}

// POST /api/uploads  → 이미지 업로드
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ success: false, error: '파일 없음' }, { status: 400 })

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const key  = `inspections/${date}/${nanoid()}.jpg`

  await env.STORAGE.put(key, file.stream(), {
    httpMetadata: { contentType: 'image/jpeg' },
  })

  return Response.json({ success: true, data: { key, url: `/api/uploads/${key}` } }, { status: 201 })
}
