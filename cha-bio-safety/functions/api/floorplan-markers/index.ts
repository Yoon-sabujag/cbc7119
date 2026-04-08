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

  // 마커 목록 + 연결된 최근 점검 기록 메타
  const rows = await env.DB.prepare(`
    SELECT m.*,
      latest.result       as last_result,
      latest.checked_at   as last_inspected_at,
      latest.id           as last_record_id,
      latest.status       as last_status,
      latest.memo         as last_memo
    FROM floor_plan_markers m
    LEFT JOIN (
      SELECT cr.*
      FROM check_records cr
      WHERE cr.id = (
        SELECT cr2.id FROM check_records cr2
        WHERE (cr2.floor_plan_marker_id = cr.floor_plan_marker_id)
        ORDER BY cr2.checked_at DESC LIMIT 1
      )
    ) latest ON latest.floor_plan_marker_id = m.id
    WHERE m.floor = ? AND m.plan_type = ?
    ORDER BY m.created_at ASC
  `).bind(floor, planType).all<Record<string,unknown>>()

  return Response.json({ success: true, data: rows.results ?? [] })
}

// POST /api/floorplan-markers — 마커 추가 (로그인한 전체 스태프)
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const body = await request.json<{
    floor: string
    plan_type: string
    marker_type?: string
    x_pct: number
    y_pct: number
    label?: string
    check_point_id?: string
    zone?: string
  }>()

  if (!body.floor || !body.plan_type || body.x_pct == null || body.y_pct == null) {
    return Response.json({ success: false, error: 'floor, plan_type, x_pct, y_pct 필수' }, { status: 400 })
  }

  const id = 'FPM-' + nanoid(12)
  await env.DB.prepare(`
    INSERT INTO floor_plan_markers (id, floor, plan_type, marker_type, x_pct, y_pct, label, check_point_id, zone, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, body.floor, body.plan_type, body.marker_type ?? null,
    body.x_pct, body.y_pct, body.label ?? null, body.check_point_id ?? null,
    body.zone ?? null,
    (data as any).staffName ?? null
  ).run()

  return Response.json({ success: true, data: { id } }, { status: 201 })
}
