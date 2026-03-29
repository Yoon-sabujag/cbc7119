import type { Env } from '../../_middleware'
import { yearKST } from '../../utils/kst'

// GET /api/reports/check-monthly?year=YYYY&category=소화전
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url      = new URL(request.url)
  const year     = url.searchParams.get('year') ?? String(yearKST())
  const category = url.searchParams.get('category') ?? ''

  const rows = await env.DB.prepare(`
    SELECT
      cp.id          AS checkpoint_id,
      cp.location_no,
      cp.location,
      cp.floor,
      CAST(strftime('%m', cr.checked_at) AS INTEGER) AS month,
      strftime('%d', cr.checked_at)                  AS day,
      cr.result,
      s.name        AS inspector_name
    FROM check_points cp
    LEFT JOIN check_records cr
      ON cp.id = cr.checkpoint_id
      AND strftime('%Y', cr.checked_at) = ?
    LEFT JOIN staff s ON cr.staff_id = s.id
    WHERE cp.category = ? AND cp.is_active = 1
    ORDER BY cp.floor, month
  `).bind(year, category).all<any>()

  // 개소별 → 월별 그룹
  const byLocation: Record<string, {
    checkpoint_id: string; location_no: string | null; location: string; floor: string;
    months: Record<number, { day: string; inspector: string }>
  }> = {}

  for (const r of rows.results ?? []) {
    if (!byLocation[r.checkpoint_id]) {
      byLocation[r.checkpoint_id] = {
        checkpoint_id: r.checkpoint_id, location_no: r.location_no, location: r.location, floor: r.floor, months: {}
      }
    }
    if (r.month) {
      byLocation[r.checkpoint_id].months[r.month] = { day: r.day, inspector: r.inspector_name ?? '' }
    }
  }

  return Response.json({ success: true, data: Object.values(byLocation) })
}
