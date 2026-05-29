import type { Env } from '../../../_middleware'
import { nowKstSql } from '../../../utils/kst'

// POST /api/handovers/:id/attachments
// body: { storageKey: string, filename?: string, contentType?: string, sizeBytes?: number }
// 클라이언트가 먼저 /api/uploads 로 파일 업로드 → key 받음 → 이 endpoint 로 글에 연결.
// 누구나 첨부 추가 가능 (글 작성자 가드 X — 협업 가능하도록).

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request, env, params } = ctx
  const me = (ctx as any).data
  const handoverId = String(params.id)
  try {
    const body = await request.json<{
      storageKey?: string; filename?: string; contentType?: string; sizeBytes?: number
    }>()
    if (!body.storageKey?.trim()) {
      return Response.json({ success: false, error: 'storageKey 필수' }, { status: 400 })
    }

    const h = await env.DB.prepare(`SELECT id, deleted_at FROM handovers WHERE id = ?`).bind(handoverId)
      .first<{ id: string; deleted_at: string | null }>()
    if (!h) return Response.json({ success: false, error: '글 없음' }, { status: 404 })
    if (h.deleted_at) return Response.json({ success: false, error: '삭제된 글에는 첨부 불가' }, { status: 410 })

    const id = crypto.randomUUID()
    await env.DB.prepare(`
      INSERT INTO handover_attachments (id, handover_id, storage_key, filename, content_type, size_bytes, uploaded_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, handoverId, body.storageKey.trim(),
      body.filename ?? null, body.contentType ?? null, body.sizeBytes ?? null,
      me.staffId, nowKstSql()
    ).run()

    return Response.json({ success: true, data: { id } }, { status: 201 })
  } catch (e) {
    console.error('handover attachment add error', e)
    return Response.json({ success: false, error: '첨부 실패' }, { status: 500 })
  }
}
