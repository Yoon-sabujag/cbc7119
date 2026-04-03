import type { Env } from '../../../../../_middleware'

// POST /api/legal/:id/findings/:fid/resolve
// 지적사항 조치완료 처리; all roles
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data, params }) => {
  const { staffId } = data as any
  const fid = params.fid as string
  const scheduleItemId = params.id as string

  let body: { resolution_memo: string; resolution_photo_key?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: '요청 본문 파싱 실패' }, { status: 400 })
  }

  if (!body.resolution_memo?.trim()) {
    return Response.json({ success: false, error: 'resolution_memo가 필요합니다' }, { status: 400 })
  }

  try {
    const finding = await env.DB.prepare(
      `SELECT id, status FROM legal_findings WHERE id = ? AND schedule_item_id = ? LIMIT 1`
    ).bind(fid, scheduleItemId).first<{ id: string; status: string }>()

    if (!finding) {
      return Response.json({ success: false, error: '지적사항을 찾을 수 없습니다' }, { status: 404 })
    }

    if (finding.status === 'resolved') {
      return Response.json({ success: false, error: '이미 조치완료된 지적사항입니다' }, { status: 409 })
    }

    const result = await env.DB.prepare(`
      UPDATE legal_findings
      SET
        resolution_memo      = ?,
        resolution_photo_key = ?,
        status               = 'resolved',
        resolved_at          = datetime('now','+9 hours'),
        resolved_by          = ?
      WHERE id = ? AND schedule_item_id = ?
    `).bind(
      body.resolution_memo,
      body.resolution_photo_key ?? null,
      staffId,
      fid,
      scheduleItemId,
    ).run()

    if (!result.meta.rows_written || result.meta.rows_written < 1) {
      return Response.json({ success: false, error: '지적사항을 찾을 수 없습니다' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (e) {
    console.error('[legal/:id/findings/:fid/resolve POST]', e)
    return Response.json({ success: false, error: '조치완료 처리 실패' }, { status: 500 })
  }
}
