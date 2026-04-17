import type { Env } from '../../_middleware'

// GET /api/elevators/minwon-findings?elevator_id=&year=
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const elevatorId = url.searchParams.get('elevator_id')
  const year = url.searchParams.get('year')

  let w = '1=1'; const b: string[] = []
  if (elevatorId) { w += ' AND f.elevator_id = ?'; b.push(elevatorId) }
  if (year) { w += ' AND f.inspect_year = ?'; b.push(year) }

  const { results } = await env.DB.prepare(`
    SELECT f.*, r.repair_date, r.repair_item, r.repair_detail AS repair_detail_text
    FROM elevator_minwon_findings f
    LEFT JOIN elevator_repairs r ON r.id = f.repair_id
    WHERE ${w} ORDER BY f.created_at DESC
  `).bind(...b).all()

  return Response.json({ success: true, data: results ?? [] })
}

// POST /api/elevators/minwon-findings
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data: ctxData }) => {
  const { staffId } = ctxData as any
  const body = await request.json() as any
  const { elevatorId, inspectYear, inspectOrder, description } = body

  if (!elevatorId || !inspectYear || !description?.trim()) {
    return Response.json({ success: false, error: '필수 항목 누락' }, { status: 400 })
  }

  try {
    const row = await env.DB.prepare(`
      INSERT INTO elevator_minwon_findings (elevator_id, inspect_year, inspect_order, description, created_by)
      VALUES (?, ?, ?, ?, ?)
      RETURNING id
    `).bind(elevatorId, inspectYear, inspectOrder ?? 1, description.trim(), staffId).first()

    return Response.json({ success: true, data: { id: row?.id } })
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) return Response.json({ success: false, error: '이미 등록된 지적사항입니다' }, { status: 409 })
    return Response.json({ success: false, error: '저장 실패' }, { status: 500 })
  }
}

// PUT /api/elevators/minwon-findings?id= — 조치(수리이력) 연결 또는 상태 변경
export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return Response.json({ success: false, error: 'id 필수' }, { status: 400 })

  const body = await request.json() as any

  if (body.repairId !== undefined) {
    // 수리이력 연결 → 상태 resolved로 변경
    await env.DB.prepare(`
      UPDATE elevator_minwon_findings SET repair_id=?, status='resolved', resolved_at=datetime('now','+9 hours') WHERE id=?
    `).bind(body.repairId, id).run()
  } else if (body.status) {
    await env.DB.prepare('UPDATE elevator_minwon_findings SET status=? WHERE id=?').bind(body.status, id).run()
  }

  return Response.json({ success: true })
}

// DELETE /api/elevators/minwon-findings?id=
export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return Response.json({ success: false, error: 'id 필수' }, { status: 400 })

  await env.DB.prepare('DELETE FROM elevator_minwon_findings WHERE id=?').bind(id).run()
  return Response.json({ success: true })
}
