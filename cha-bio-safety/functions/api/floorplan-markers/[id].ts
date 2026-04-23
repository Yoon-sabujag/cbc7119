import type { Env } from '../../_middleware'

// PUT /api/floorplan-markers/:id — 마커 수정 (로그인한 전체 스태프)
export const onRequestPut: PagesFunction<Env> = async ({ params, request, env }) => {
  const id = params.id as string
  const body = await request.json<{
    x_pct?: number
    y_pct?: number
    label?: string
    marker_type?: string
    check_point_id?: string | null
    zone?: string | null
    description?: string | null
  }>()

  const sets: string[] = []
  const binds: unknown[] = []

  if (body.x_pct != null) { sets.push('x_pct=?'); binds.push(body.x_pct) }
  if (body.y_pct != null) { sets.push('y_pct=?'); binds.push(body.y_pct) }
  if (body.label !== undefined) { sets.push('label=?'); binds.push(body.label) }
  if (body.marker_type !== undefined) { sets.push('marker_type=?'); binds.push(body.marker_type) }
  if (body.check_point_id !== undefined) { sets.push('check_point_id=?'); binds.push(body.check_point_id) }
  if (body.zone !== undefined) { sets.push('zone=?'); binds.push(body.zone) }
  // description: check_points 와 대칭 — '[접근불가]' 등 메모 기반 접근불가 판정 용
  if (body.description !== undefined) { sets.push('description=?'); binds.push(body.description) }

  if (sets.length === 0) {
    return Response.json({ success: false, error: '수정할 항목이 없습니다' }, { status: 400 })
  }

  sets.push("updated_at=datetime('now','+9 hours')")
  binds.push(id)

  await env.DB.prepare(
    `UPDATE floor_plan_markers SET ${sets.join(', ')} WHERE id=?`
  ).bind(...binds).run()

  return Response.json({ success: true })
}

// DELETE /api/floorplan-markers/:id — 마커 삭제 (로그인한 전체 스태프)
export const onRequestDelete: PagesFunction<Env> = async ({ params, env }) => {
  const id = params.id as string
  await env.DB.prepare('DELETE FROM floor_plan_markers WHERE id=?').bind(id).run()
  return Response.json({ success: true })
}
