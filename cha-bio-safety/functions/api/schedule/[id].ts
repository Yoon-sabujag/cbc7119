import type { Env } from '../../_middleware'

// PUT /api/schedule/:id  — 내용 수정
export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const id   = params.id as string
  const body = await request.json<{ title?: string; date?: string; time?: string; memo?: string }>()
  if (!body.title && !body.date) return Response.json({ success: false, error: '수정할 내용이 없습니다' }, { status: 400 })

  await env.DB.prepare(
    `UPDATE schedule_items SET
      title      = COALESCE(?, title),
      date       = COALESCE(?, date),
      time       = ?,
      memo       = ?,
      updated_at = datetime('now')
    WHERE id = ?`
  ).bind(body.title ?? null, body.date ?? null, body.time ?? null, body.memo ?? null, id).run()

  return Response.json({ success: true })
}

// PATCH /api/schedule/:id  — 상태 변경
export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  const id   = params.id as string
  const body = await request.json<{ status?: string }>()
  if (!body.status) return Response.json({ success: false, error: 'status 필요' }, { status: 400 })

  const valid = ['pending','in_progress','done','overdue']
  if (!valid.includes(body.status)) return Response.json({ success: false, error: '유효하지 않은 status' }, { status: 400 })

  await env.DB.prepare(
    `UPDATE schedule_items SET status=?, updated_at=datetime('now') WHERE id=?`
  ).bind(body.status, id).run()

  return Response.json({ success: true })
}

// DELETE /api/schedule/:id
export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = params.id as string
  await env.DB.prepare(`DELETE FROM schedule_items WHERE id=?`).bind(id).run()
  return Response.json({ success: true })
}
