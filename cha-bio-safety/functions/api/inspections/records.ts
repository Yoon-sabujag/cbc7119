import type { Env } from '../../_middleware'

// GET /api/inspections/records?date=YYYY-MM-DD   → 해당 날짜
// GET /api/inspections/records?month=YYYY-MM     → 해당 월 전체
// (checkpoint_id / marker_id 기준 최신 1건만)
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url   = new URL(request.url)
  const date  = url.searchParams.get('date')
  const month = url.searchParams.get('month')

  let whereSql = 'WHERE s.date = ?'
  let binds: string[] = []
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    whereSql = "WHERE s.date BETWEEN ? AND ?"
    binds = [`${month}-01`, `${month}-31`]
  } else {
    const d = date ?? new Date().toISOString().slice(0, 10)
    binds = [d]
  }

  const result = await env.DB.prepare(`
    SELECT r.id, r.checkpoint_id, r.result, r.memo, r.photo_key, r.staff_id, r.checked_at,
           r.status, r.resolution_memo, r.resolution_photo_key, r.resolved_at, r.resolved_by,
           r.guide_light_type, r.floor_plan_marker_id,
           (SELECT s2.name FROM staff s2 WHERE s2.id = r.staff_id) AS staff_name
    FROM check_records r
    JOIN inspection_sessions s ON s.id = r.session_id
    ${whereSql}
    ORDER BY r.checked_at DESC
  `).bind(...binds).all<Record<string,unknown>>()

  // 마커가 있으면 marker_id 기준, 없으면 checkpoint_id 기준 최신 1건만 유지
  const seen = new Set<string>()
  const rows = (result.results ?? []).filter(r => {
    const key = (r.floor_plan_marker_id as string | null) ?? ('CP:' + (r.checkpoint_id as string))
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).map(r => ({
    id:                 r.id,
    checkpointId:       r.checkpoint_id,
    floorPlanMarkerId:  r.floor_plan_marker_id,
    guideLightType:     r.guide_light_type,
    result:             r.result,
    memo:               r.memo,
    photoKey:           r.photo_key,
    staffId:            r.staff_id,
    staffName:          r.staff_name ?? null,
    checkedAt:          r.checked_at,
    status:             r.status ?? 'open',
    resolutionMemo:     r.resolution_memo,
    resolutionPhotoKey: r.resolution_photo_key,
    resolvedAt:         r.resolved_at,
    resolvedBy:         r.resolved_by,
  }))

  return Response.json({ success: true, data: rows })
}
