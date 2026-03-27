import type { Env } from '../../_middleware'

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
