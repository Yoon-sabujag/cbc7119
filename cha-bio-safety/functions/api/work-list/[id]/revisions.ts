import type { Env } from '../../../_middleware'

// GET /api/work-list/:id/revisions
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const { env, params } = ctx
  const id = String(params.id)
  const rows = await env.DB.prepare(`
    SELECT r.id, r.item_id, r.staff_id, s.name AS staff_name,
           r.type, r.label, r.value, r.affiliation, r.extra, r.memo,
           r.is_deletion, r.is_revert_from, r.created_at
    FROM work_list_revisions r
    JOIN staff s ON s.id = r.staff_id
    WHERE r.item_id = ?
    ORDER BY r.created_at DESC
  `).bind(id).all<Record<string, unknown>>()

  const items = (rows.results ?? []).map(r => ({
    id: r.id, itemId: r.item_id,
    staffId: r.staff_id, staffName: r.staff_name,
    type: r.type, label: r.label, value: r.value,
    affiliation: r.affiliation, extra: r.extra, memo: r.memo,
    isDeletion: !!r.is_deletion,
    isRevertFrom: r.is_revert_from,
    createdAt: r.created_at,
  }))
  return Response.json({ success: true, data: items })
}
