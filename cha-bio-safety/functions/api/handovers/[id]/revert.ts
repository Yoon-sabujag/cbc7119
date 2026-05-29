import type { Env } from '../../../_middleware'
import { nowKstSql } from '../../../utils/kst'

// POST /api/handovers/:id/revert
// body: { revisionId: string }
// 누구나 가능. 해당 revision 의 title/body/status 로 현재 글 덮어쓰고 새 revision 으로 audit 기록.
// 삭제된 글도 revert 가능 — deleted_at 클리어.

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request, env, params } = ctx
  const me = (ctx as any).data
  const id = String(params.id)
  try {
    const body = await request.json<{ revisionId?: string }>()
    if (!body.revisionId) return Response.json({ success: false, error: 'revisionId 필수' }, { status: 400 })

    const rev = await env.DB.prepare(`
      SELECT id, handover_id, title, body, status, is_deletion
      FROM handover_revisions WHERE id = ? AND handover_id = ?
    `).bind(body.revisionId, id).first<{
      id: string; handover_id: string; title: string; body: string;
      status: string; is_deletion: number
    }>()
    if (!rev) return Response.json({ success: false, error: 'revision 없음' }, { status: 404 })

    // revert 대상이 삭제 시점이면 = 그 시점 글 자체를 복원하는 것이 아닌 "삭제됨" 상태로 되돌리기.
    // → 통상적이지 않음. 사용자 의도는 보통 "내용을 그 시점으로". 삭제 revision 은 revert 거부.
    if (rev.is_deletion) {
      return Response.json({ success: false, error: '삭제 시점으로는 되돌릴 수 없습니다' }, { status: 400 })
    }

    const now = nowKstSql()
    await env.DB.batch([
      // deleted_at 도 NULL 로 클리어 (삭제된 글도 revert 로 부활)
      env.DB.prepare(`
        UPDATE handovers SET title = ?, body = ?, status = ?, updated_at = ?,
                              deleted_at = NULL, deleted_by = NULL
        WHERE id = ?
      `).bind(rev.title, rev.body, rev.status, now, id),
      env.DB.prepare(`
        INSERT INTO handover_revisions (id, handover_id, staff_id, title, body, status,
                                         is_deletion, is_revert_from, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
      `).bind(crypto.randomUUID(), id, me.staffId, rev.title, rev.body, rev.status, body.revisionId, now),
    ])

    return Response.json({ success: true })
  } catch (e) {
    console.error('handover revert error', e)
    return Response.json({ success: false, error: '복원 실패' }, { status: 500 })
  }
}
