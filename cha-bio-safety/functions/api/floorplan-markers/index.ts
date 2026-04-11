import type { Env } from '../../_middleware'

function nanoid(n=21){ const c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; const a=crypto.getRandomValues(new Uint8Array(n)); return Array.from(a,b=>c[b%c.length]).join('') }

// GET /api/floorplan-markers?floor=B5&plan_type=guidelamp
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const floor = url.searchParams.get('floor')
  const planType = url.searchParams.get('plan_type')

  if (!planType) {
    return Response.json({ success: false, error: 'plan_type 필수' }, { status: 400 })
  }

  try {
    // 1) 마커 목록
    const mWhere = floor ? 'WHERE floor = ? AND plan_type = ?' : 'WHERE plan_type = ?'
    const mBinds = floor ? [floor, planType] : [planType]
    const mRows = await env.DB.prepare(
      `SELECT * FROM floor_plan_markers ${mWhere} ORDER BY floor ASC, created_at ASC`
    ).bind(...mBinds).all<Record<string, unknown>>()
    const data = mRows.results ?? []

    // 2) 최근 점검 기록 (marker_id 있는 것만 — 소량)
    const recRows = await env.DB.prepare(`
      SELECT floor_plan_marker_id, result, checked_at, id, status, memo
      FROM check_records
      WHERE floor_plan_marker_id IS NOT NULL
      ORDER BY checked_at DESC
    `).all<Record<string, unknown>>()
    const recMap: Record<string, Record<string, unknown>> = {}
    for (const r of (recRows.results ?? [])) {
      const mid = r.floor_plan_marker_id as string
      if (!recMap[mid]) recMap[mid] = r
    }

    // 3) 합치기
    const merged = data.map(m => ({
      ...m,
      last_result: recMap[m.id as string]?.result ?? null,
      last_inspected_at: recMap[m.id as string]?.checked_at ?? null,
      last_record_id: recMap[m.id as string]?.id ?? null,
      last_status: recMap[m.id as string]?.status ?? null,
      last_memo: recMap[m.id as string]?.memo ?? null,
    }))

    return Response.json({ success: true, data: merged })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message ?? 'unknown error' }, { status: 500 })
  }
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
