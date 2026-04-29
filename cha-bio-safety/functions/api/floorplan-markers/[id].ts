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
//
// 소화기(plan_type='extinguisher' + check_point_id LIKE 'CP-FE-%')인 경우
// floor_plan_markers / extinguishers / check_points.is_active 3 테이블을 atomic 으로 정리한다.
// 그 외 마커(guidelamp/sprinkler/detector 등)는 기존과 동일하게 단일 DELETE 만 수행한다.
//
// 절대 금지: check_records 는 어떤 분기에서도 삭제하지 않는다 (점검 기록 보존 원칙).
export const onRequestDelete: PagesFunction<Env> = async ({ params, env }) => {
  const id = params.id as string

  const marker = await env.DB
    .prepare('SELECT plan_type, check_point_id FROM floor_plan_markers WHERE id=?')
    .bind(id)
    .first<{ plan_type: string; check_point_id: string | null }>()

  if (!marker) {
    return Response.json({ success: false, error: '마커를 찾을 수 없습니다' }, { status: 404 })
  }

  const cpId = marker.check_point_id
  const isExtCascade = marker.plan_type === 'extinguisher' && !!cpId && cpId.startsWith('CP-FE-')

  if (isExtCascade) {
    // Phase 24: 자산은 *unassign 만* (status='active' 유지). 자산 행 자체는 보존.
    // 사용자가 명시적으로 폐기를 원하면 ExtinguishersListPage 의 「폐기」 버튼 사용.
    // 절대 금지: check_records 는 어떤 분기에서도 DELETE 하지 않는다.
    // D1 batch 는 atomic — 한 statement 실패 시 전체 롤백 (Cloudflare 공식 트랜잭션 의미론).
    await env.DB.batch([
      env.DB.prepare('DELETE FROM floor_plan_markers WHERE id=?').bind(id),
      env.DB.prepare("UPDATE extinguishers SET check_point_id=NULL, updated_at=datetime('now','+9 hours') WHERE check_point_id=?").bind(cpId),
      env.DB.prepare('UPDATE check_points SET is_active=0 WHERE id=?').bind(cpId),
    ])
  } else {
    await env.DB.prepare('DELETE FROM floor_plan_markers WHERE id=?').bind(id).run()
  }

  return Response.json({ success: true })
}
