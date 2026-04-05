import type { Env } from '../../_middleware'

function nanoid(n=21){ const c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; const a=crypto.getRandomValues(new Uint8Array(n)); return Array.from(a,b=>c[b%c.length]).join('') }

// GET /api/floorplan-markers?floor=B5&plan_type=guidelamp
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const floor = url.searchParams.get('floor')
  const planType = url.searchParams.get('plan_type')

  if (!floor || !planType) {
    return Response.json({ success: false, error: 'floor, plan_type 필수' }, { status: 400 })
  }

  // 마커 목록 + 연결된 checkpoint의 최근 점검 결과
  const rows = await env.DB.prepare(`
    SELECT m.*,
      (SELECT cr.result FROM check_records cr WHERE cr.checkpoint_id = m.check_point_id ORDER BY cr.checked_at DESC LIMIT 1) as last_result,
      (SELECT cr.checked_at FROM check_records cr WHERE cr.checkpoint_id = m.check_point_id ORDER BY cr.checked_at DESC LIMIT 1) as last_inspected_at
    FROM floor_plan_markers m
    WHERE m.floor = ? AND m.plan_type = ?
    ORDER BY m.created_at ASC
  `).bind(floor, planType).all<Record<string,unknown>>()

  return Response.json({ success: true, data: rows.results ?? [] })
}

// POST /api/floorplan-markers — 마커 추가 (admin only)
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const { role, staffId } = data as any
  const MARKER_EDITOR_IDS = ['2022051052']
  if (role !== 'admin' && !MARKER_EDITOR_IDS.includes(staffId)) {
    return Response.json({ success: false, error: '권한이 없습니다' }, { status: 403 })
  }

  const body = await request.json<{
    floor: string
    plan_type: string
    marker_type?: string
    x_pct: number
    y_pct: number
    label?: string
    check_point_id?: string
  }>()

  if (!body.floor || !body.plan_type || body.x_pct == null || body.y_pct == null) {
    return Response.json({ success: false, error: 'floor, plan_type, x_pct, y_pct 필수' }, { status: 400 })
  }

  const id = 'FPM-' + nanoid(12)
  await env.DB.prepare(`
    INSERT INTO floor_plan_markers (id, floor, plan_type, marker_type, x_pct, y_pct, label, check_point_id, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, body.floor, body.plan_type, body.marker_type ?? null,
    body.x_pct, body.y_pct, body.label ?? null, body.check_point_id ?? null,
    (data as any).staffName ?? null
  ).run()

  return Response.json({ success: true, data: { id } }, { status: 201 })
}
