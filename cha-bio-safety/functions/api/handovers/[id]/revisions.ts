import type { Env } from '../../../_middleware'

// GET /api/handovers/:id/revisions — 시간순 desc 모든 버전.
// 누구나 조회 가능. revert 시 새 revision 으로 audit.

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const { env, params } = ctx
  const id = String(params.id)
  const rows = await env.DB.prepare(`
    SELECT r.id, r.handover_id, r.staff_id, s.name AS staff_name,
           r.title, r.body, r.status, r.is_deletion, r.is_revert_from, r.created_at
    FROM handover_revisions r
    JOIN staff s ON s.id = r.staff_id
    WHERE r.handover_id = ?
    ORDER BY r.created_at DESC
  `).bind(id).all<Record<string, unknown>>()

  const items = (rows.results ?? []).map(r => ({
    id: r.id, handoverId: r.handover_id,
    staffId: r.staff_id, staffName: r.staff_name,
    title: r.title, body: r.body, status: r.status,
    isDeletion: !!r.is_deletion,
    isRevertFrom: r.is_revert_from,
    createdAt: r.created_at,
  }))
  return Response.json({ success: true, data: items })
}
