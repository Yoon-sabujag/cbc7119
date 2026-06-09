import type { Env } from '../../../_middleware'

// DELETE /api/inspections/records/:recordId — 점검 기록 영구 삭제 (관리자 전용)
// 데이터 무결성 원칙(CLAUDE.md): 점검 기록 삭제는 admin 예외만 허용
export const onRequestDelete: PagesFunction<Env> = async ({ params, env, data }) => {
  const { recordId } = params as { recordId: string }
  const { role } = data as any

  if (role !== 'admin') {
    return Response.json({ success: false, error: '관리자만 점검 기록을 삭제할 수 있습니다' }, { status: 403 })
  }

  try {
    const rec = await env.DB.prepare(
      'SELECT id FROM check_records WHERE id=? LIMIT 1'
    ).bind(recordId).first<{ id: string }>()
    if (!rec) {
      return Response.json({ success: false, error: '기록 없음' }, { status: 404 })
    }

    await env.DB.prepare('DELETE FROM check_records WHERE id=?').bind(recordId).run()

    return Response.json({ success: true })
  } catch (e: any) {
    console.error('record delete error:', e)
    return Response.json({ success: false, error: e.message ?? '삭제 실패' }, { status: 500 })
  }
}
