import type { Env } from '../../_middleware'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url  = new URL(request.url)
  const year = parseInt(url.searchParams.get('year') ?? String(new Date().getFullYear()))

  const rows = await env.DB.prepare(`
    SELECT year, month, day, location_no, floor, position, pressure_1, pressure_2, pressure_set, inspector
    FROM div_pressures
    WHERE year = ?
    ORDER BY location_no, month
  `).bind(year).all<any>()

  return Response.json({ success: true, data: rows.results ?? [] })
}
