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
    // 1) 마커 목록 (description 포함 — 접근불가 판정용 메모)
    const mWhere = floor ? 'WHERE floor = ? AND plan_type = ?' : 'WHERE plan_type = ?'
    const mBinds = floor ? [floor, planType] : [planType]
    const mRows = await env.DB.prepare(
      `SELECT * FROM floor_plan_markers ${mWhere} ORDER BY floor ASC, created_at ASC`
    ).bind(...mBinds).all<Record<string, unknown>>()
    const data = mRows.results ?? []

    // 2) 최근 점검 기록 — 이번 달 것만 (도면 점검 + QR 스캔 양쪽)
    // KST 기준 이번 달 시작일 계산
    const now = new Date(Date.now() + 9 * 3600_000) // UTC+9
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

    // 2a) 도면에서 기록한 것 (floor_plan_marker_id로 매핑)
    const recByMarker = await env.DB.prepare(`
      SELECT floor_plan_marker_id, result, checked_at, id, status, memo, staff_id,
             (SELECT s.name FROM staff s WHERE s.id = check_records.staff_id) AS staff_name
      FROM check_records
      WHERE floor_plan_marker_id IS NOT NULL AND checked_at >= ?
      ORDER BY checked_at DESC
    `).bind(monthStart).all<Record<string, unknown>>()
    const markerRecMap: Record<string, Record<string, unknown>> = {}
    for (const r of (recByMarker.results ?? [])) {
      const mid = r.floor_plan_marker_id as string
      if (!markerRecMap[mid]) markerRecMap[mid] = r
    }

    // 2b) QR스캔/일반점검에서 기록한 것 (checkpoint_id로 매핑)
    const cpIds = data.filter(m => m.check_point_id).map(m => m.check_point_id as string)
    const cpRecMap: Record<string, Record<string, unknown>> = {}
    if (cpIds.length > 0) {
      const placeholders = cpIds.map(() => '?').join(',')
      const recByCp = await env.DB.prepare(`
        SELECT checkpoint_id, result, checked_at, id, status, memo, staff_id,
               (SELECT s.name FROM staff s WHERE s.id = check_records.staff_id) AS staff_name
        FROM check_records
        WHERE checkpoint_id IN (${placeholders}) AND checked_at >= ?
        ORDER BY checked_at DESC
      `).bind(...cpIds, monthStart).all<Record<string, unknown>>()
      for (const r of (recByCp.results ?? [])) {
        const cpid = r.checkpoint_id as string
        if (!cpRecMap[cpid]) cpRecMap[cpid] = r
      }
    }

    // 3) 합치기 — 도면 기록 vs QR 기록 중 더 최신인 것 사용
    const merged = data.map(m => {
      const byMarker = markerRecMap[m.id as string]
      const byCp = m.check_point_id ? cpRecMap[m.check_point_id as string] : null
      // 둘 다 있으면 checked_at이 더 최신인 것 선택
      let best = byMarker ?? null
      if (byCp) {
        if (!best || (byCp.checked_at as string) > (best.checked_at as string)) {
          best = byCp
        }
      }
      return {
        ...m,
        last_result: best?.result ?? null,
        last_inspected_at: best?.checked_at ?? null,
        last_record_id: best?.id ?? null,
        last_status: best?.status ?? null,
        last_memo: best?.memo ?? null,
        // 재진입 팝업에서 '[점검자]에 의해' 로 표시하기 위해 포함.
        last_inspected_by: (best?.staff_name as string | null) ?? null,
        last_inspected_by_id: (best?.staff_id as string | null) ?? null,
      }
    })

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
