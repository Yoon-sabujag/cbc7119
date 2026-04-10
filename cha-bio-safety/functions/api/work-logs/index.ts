import type { Env } from '../../_middleware'
import { jsonOk, jsonError } from '../documents/_helpers'

// GET /api/work-logs — 업무수행기록표 월별 목록
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  try {
    const rows = await ctx.env.DB.prepare(
      `SELECT w.id, w.year_month, w.updated_at, s.name as updated_by_name
       FROM work_logs w
       LEFT JOIN staff s ON s.id = w.updated_by
       ORDER BY w.year_month DESC`
    ).all()
    return jsonOk(rows.results ?? [])
  } catch (e) {
    console.error('work-logs GET list error:', e)
    return jsonError(500, '서버 오류')
  }
}
