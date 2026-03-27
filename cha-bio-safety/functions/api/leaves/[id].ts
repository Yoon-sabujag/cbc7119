import type { Env } from '../../_middleware'

// DELETE /api/leaves/:id
export const onRequestDelete: PagesFunction<Env> = async ({ params, env, data }) => {
  const { staffId } = data as any
  const id = params.id as string

  if (!id) {
    return Response.json({ success: false, error: 'id가 필요합니다' }, { status: 400 })
  }

  // 존재 여부 및 본인 소유 확인
  const row = await env.DB.prepare(
    'SELECT id, staff_id FROM annual_leaves WHERE id = ?'
  ).bind(id).first<{ id: string; staff_id: string }>()

  if (!row) {
    return Response.json({ success: false, error: '연차 기록을 찾을 수 없습니다' }, { status: 404 })
  }

  if (row.staff_id !== staffId) {
    return Response.json({ success: false, error: '본인의 연차만 삭제할 수 있습니다' }, { status: 403 })
  }

  await env.DB.prepare('DELETE FROM annual_leaves WHERE id = ?').bind(id).run()

  return Response.json({ success: true, data: null })
}
