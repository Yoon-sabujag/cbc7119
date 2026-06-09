import type { Env } from '../../../../_middleware'

// POST /api/inspections/records/:recordId/resolve — 불량/주의 조치 완료 (로그인 전체 스태프)
export const onRequestPost: PagesFunction<Env> = async ({ params, request, env, data }) => {
  const { recordId } = params as { recordId: string }
  const { staffId } = data as any
  try {
    const body = await request.json<{
      resolution_memo?: string
      resolution_photo_key?: string | null
      materials_used?: string | null
    }>()

    if (!body.resolution_memo || !body.resolution_memo.trim()) {
      return Response.json({ success: false, error: '조치 내용이 필요합니다' }, { status: 400 })
    }

    const rec = await env.DB.prepare(
      'SELECT id FROM check_records WHERE id=? LIMIT 1'
    ).bind(recordId).first<{ id: string }>()
    if (!rec) {
      return Response.json({ success: false, error: '기록 없음' }, { status: 404 })
    }

    await env.DB.prepare(
      `UPDATE check_records
          SET status='resolved',
              resolution_memo=?,
              resolution_photo_key=?,
              materials_used=?,
              resolved_at=datetime('now','+9 hours'),
              resolved_by=?
        WHERE id=?`
    ).bind(
      body.resolution_memo.trim(),
      body.resolution_photo_key ?? null,
      body.materials_used ?? null,
      staffId,
      recordId
    ).run()

    return Response.json({ success: true, data: { id: recordId } })
  } catch (e: any) {
    console.error('record resolve error:', e)
    return Response.json({ success: false, error: e.message ?? '조치 처리 실패' }, { status: 500 })
  }
}
