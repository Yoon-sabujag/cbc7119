// POST /api/database/r2-upload — R2에 파일 업로드 (복원용)
import type { Env } from '../../_middleware'

export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const { role } = data as { role: string }
  if (role !== 'admin') return Response.json({ success: false, error: '관리자만 접근 가능' }, { status: 403 })

  const formData = await request.formData()
  const entries = formData.getAll('files') as File[]
  const keys = formData.getAll('keys') as string[]

  if (entries.length === 0) return Response.json({ success: false, error: '파일 없음' }, { status: 400 })

  let uploaded = 0
  for (let i = 0; i < entries.length; i++) {
    const file = entries[i]
    const key = keys[i] || file.name
    await env.STORAGE.put(key, file.stream(), {
      httpMetadata: { contentType: file.type || 'application/octet-stream' },
    })
    uploaded++
  }

  return Response.json({ success: true, data: { uploaded } })
}
