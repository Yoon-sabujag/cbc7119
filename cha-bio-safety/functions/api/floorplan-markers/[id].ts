import type { Env } from '../../_middleware'

// PUT /api/floorplan-markers/:id — 마커 수정 (위치 이동, 라벨 변경 등)
export const onRequestPut: PagesFunction<Env> = async ({ params, request, env, data }) => {
  const { role, staffId } = data as any
  const MARKER_EDITOR_IDS = ['2022051052']
  if (role !== 'admin' && !MARKER_EDITOR_IDS.includes(staffId)) {
    return Response.json({ success: false, error: '권한이 없습니다' }, { status: 403 })
  }

  const id = params.id as string
  const body = await request.json<{
    x_pct?: number
    y_pct?: number
    label?: string
    marker_type?: string
    check_point_id?: string | null
  }>()

  const sets: string[] = []
  const binds: unknown[] = []

  if (body.x_pct != null) { sets.push('x_pct=?'); binds.push(body.x_pct) }
  if (body.y_pct != null) { sets.push('y_pct=?'); binds.push(body.y_pct) }
  if (body.label !== undefined) { sets.push('label=?'); binds.push(body.label) }
  if (body.marker_type !== undefined) { sets.push('marker_type=?'); binds.push(body.marker_type) }
  if (body.check_point_id !== undefined) { sets.push('check_point_id=?'); binds.push(body.check_point_id) }

  if (sets.length === 0) {
    return Response.json({ success: false, error: '수정할 항목이 없습니다' }, { status: 400 })
  }

  sets.push("updated_at=datetime('now')")
  binds.push(id)

  await env.DB.prepare(
    `UPDATE floor_plan_markers SET ${sets.join(', ')} WHERE id=?`
  ).bind(...binds).run()

  return Response.json({ success: true })
}

// DELETE /api/floorplan-markers/:id — 마커 삭제
export const onRequestDelete: PagesFunction<Env> = async ({ params, env, data }) => {
  const { role, staffId } = data as any
  const MARKER_EDITOR_IDS = ['2022051052']
  if (role !== 'admin' && !MARKER_EDITOR_IDS.includes(staffId)) {
    return Response.json({ success: false, error: '권한이 없습니다' }, { status: 403 })
  }

  const id = params.id as string
  await env.DB.prepare('DELETE FROM floor_plan_markers WHERE id=?').bind(id).run()
  return Response.json({ success: true })
}
