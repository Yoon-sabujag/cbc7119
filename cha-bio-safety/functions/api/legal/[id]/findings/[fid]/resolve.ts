import type { Env } from '../../../../../_middleware'

// POST /api/legal/:id/findings/:fid/resolve
// 지적사항 조치완료 처리; all staff
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data, params }) => {
  const { staffId } = data as any
  const fid = params.fid as string
  const inspectionId = params.id as string

  const { resolution_memo, resolution_photo_key } = await request.json<{
    resolution_memo?: string
    resolution_photo_key?: string
  }>()

  try {
    const finding = await env.DB.prepare(
      `SELECT id, status FROM legal_findings WHERE id = ? AND inspection_id = ? LIMIT 1`
    ).bind(fid, inspectionId).first<{ id: string; status: string }>()

    if (!finding) {
      return Response.json({ success: false, error: '지적사항을 찾을 수 없습니다' }, { status: 404 })
    }

    if (finding.status === 'resolved') {
      return Response.json({ success: false, error: '이미 조치완료된 지적사항입니다' }, { status: 409 })
    }

    await env.DB.prepare(`
      UPDATE legal_findings
      SET status = 'resolved',
          resolution_memo = ?,
          resolution_photo_key = ?,
          resolved_at = datetime('now','+9 hours'),
          resolved_by = ?
      WHERE id = ?
    `).bind(
      resolution_memo ?? null,
      resolution_photo_key ?? null,
      staffId,
      fid,
    ).run()

    return Response.json({ success: true, data: { resolved: true } })
  } catch (e) {
    console.error('[legal/:id/findings/:fid/resolve POST]', e)
    return Response.json({ success: false, error: '조치완료 처리 실패' }, { status: 500 })
  }
}
