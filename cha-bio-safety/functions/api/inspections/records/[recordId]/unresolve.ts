import type { Env } from '../../../../_middleware'

// POST /api/inspections/records/:recordId/unresolve — 조치 취소 (관리자 전용)
export const onRequestPost: PagesFunction<Env> = async ({ params, env, data }) => {
  const { recordId } = params as { recordId: string }
  const { role } = data as any

  if (role !== 'admin') {
    return Response.json({ success: false, error: '관리자만 조치를 취소할 수 있습니다' }, { status: 403 })
  }

  try {
    const rec = await env.DB.prepare(
      'SELECT id FROM check_records WHERE id=? LIMIT 1'
    ).bind(recordId).first<{ id: string }>()
    if (!rec) {
      return Response.json({ success: false, error: '기록 없음' }, { status: 404 })
    }

    await env.DB.prepare(
      `UPDATE check_records
          SET status='open',
              resolution_memo=NULL,
              resolution_photo_key=NULL,
              materials_used=NULL,
              resolved_at=NULL,
              resolved_by=NULL
        WHERE id=?`
    ).bind(recordId).run()

    return Response.json({ success: true, data: { id: recordId } })
  } catch (e: any) {
    console.error('record unresolve error:', e)
    return Response.json({ success: false, error: e.message ?? '조치 취소 실패' }, { status: 500 })
  }
}
