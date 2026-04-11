import type { Env } from '../../_middleware'
import { yearKST } from '../../utils/kst'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url    = new URL(request.url)
  const year   = parseInt(url.searchParams.get('year') ?? String(yearKST()))
  const timing = url.searchParams.get('timing')

  let query = `
    SELECT year, month, day, timing, location_no, floor, position, pressure_1, pressure_2, pressure_set, inspector
    FROM div_pressures
    WHERE year = ?`
  const params: (string | number)[] = [year]

  if (timing) {
    query += ` AND (timing = ? OR timing IS NULL)`
    params.push(timing)
  }

  query += ` ORDER BY location_no, month`

  const rows = await env.DB.prepare(query).bind(...params).all<any>()

  return Response.json({ success: true, data: rows.results ?? [] })
}
