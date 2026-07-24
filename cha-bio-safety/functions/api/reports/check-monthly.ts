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
      cr.line_results,
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
    months: Record<number, { day: string; inspector: string; line_results: any[] | null; worst: string | null }>
  }> = {}

  const rank: Record<string, number> = { normal: 0, caution: 1, bad: 2 }

  for (const r of rows.results ?? []) {
    if (!byLocation[r.checkpoint_id]) {
      byLocation[r.checkpoint_id] = {
        checkpoint_id: r.checkpoint_id, location_no: r.location_no, location: r.location, floor: r.floor, months: {}
      }
    }
    if (r.month) {
      // line_results 부재 시 반드시 null (빈배열 [] 은 소비측에서 truthy 라 '○' 폴백을 무력화 → 비-카드 회귀). BL-01
      let parsed: any[] | null = null
      try { if (r.line_results) { const p = JSON.parse(r.line_results); if (Array.isArray(p)) parsed = p } } catch { parsed = null }
      const m = byLocation[r.checkpoint_id].months
      const existing = m[r.month]
      // worst(bad>caution>normal) 는 다중행 fold 로 승격. day/inspector 는 원본대로 last-row-wins 유지(회귀 방지). WR-01
      const curRank = existing?.worst != null ? (rank[existing.worst] ?? -1) : -1
      const newRank = r.result != null ? (rank[r.result] ?? -1) : -1
      const promote = !existing || newRank >= curRank   // 동률/최초는 최신행 채택(last-wins 와 정합)
      m[r.month] = {
        day: r.day,                                       // last-row-wins (원본 동일)
        inspector: r.inspector_name ?? '',                // last-row-wins (원본 동일)
        line_results: promote ? parsed : existing!.line_results,
        worst: promote ? (r.result ?? null) : existing!.worst,
      }
    }
  }

  return Response.json({ success: true, data: Object.values(byLocation) })
}
