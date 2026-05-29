import type { Env } from '../../../_middleware'
import { nowKstSql } from '../../../utils/kst'

// POST /api/work-list/:id/revert  body: { revisionId }
// 누구나 가능. 삭제된 항목도 부활 가능. 삭제 시점 revision 으로는 revert 거부.

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request, env, params } = ctx
  const me = (ctx as any).data
  const id = String(params.id)
  try {
    const body = await request.json<{ revisionId?: string }>()
    if (!body.revisionId) return Response.json({ success: false, error: 'revisionId 필수' }, { status: 400 })

    const rev = await env.DB.prepare(`
      SELECT id, item_id, type, label, value, affiliation, extra, memo, is_deletion
      FROM work_list_revisions WHERE id = ? AND item_id = ?
    `).bind(body.revisionId, id).first<{
      id: string; item_id: string; type: string;
      label: string; value: string;
      affiliation: string | null; extra: string | null; memo: string | null;
      is_deletion: number
    }>()
    if (!rev) return Response.json({ success: false, error: 'revision 없음' }, { status: 404 })
    if (rev.is_deletion) {
      return Response.json({ success: false, error: '삭제 시점으로는 되돌릴 수 없습니다' }, { status: 400 })
    }

    const now = nowKstSql()
    await env.DB.batch([
      env.DB.prepare(`
        UPDATE work_list_items SET label = ?, value = ?, affiliation = ?, extra = ?, memo = ?,
                                    updated_by = ?, updated_at = ?,
                                    deleted_at = NULL, deleted_by = NULL
        WHERE id = ?
      `).bind(rev.label, rev.value, rev.affiliation, rev.extra, rev.memo, me.staffId, now, id),
      env.DB.prepare(`
        INSERT INTO work_list_revisions (id, item_id, staff_id, type, label, value, affiliation, extra, memo,
                                          is_deletion, is_revert_from, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      `).bind(crypto.randomUUID(), id, me.staffId, rev.type, rev.label, rev.value,
              rev.affiliation, rev.extra, rev.memo, body.revisionId, now),
    ])

    return Response.json({ success: true })
  } catch (e) {
    console.error('work-list revert error', e)
    return Response.json({ success: false, error: '복원 실패' }, { status: 500 })
  }
}
