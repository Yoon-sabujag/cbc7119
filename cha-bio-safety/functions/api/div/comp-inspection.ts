import type { Env } from '../../_middleware'

// GET  /api/div/comp-inspection?location=8-1  → 특정 측정점 이력
// POST /api/div/comp-inspection               → 새 컴프레셔 점검 기록

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url      = new URL(request.url)
  const location = url.searchParams.get('location')

  let query = 'SELECT * FROM comp_inspections ORDER BY year DESC, month DESC'
  let params: string[] = []

  if (location) {
    query  = 'SELECT * FROM comp_inspections WHERE div_id = ? ORDER BY year DESC, month DESC'
    params = [location]
  }

  const { results } = await env.DB.prepare(query).bind(...params).all()
  return Response.json({ ok: true, records: results })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json() as {
    location_no: string
    floor: number
    position: number
    year: number
    month: number
    day?: number
    tank_drain?: string
    oil?: string
    result?: string
    memo?: string
    photo_key?: string
    inspector?: string
  }

  const id = `COMP-${body.year}-${String(body.month).padStart(2, '0')}-${body.location_no}`

  await env.DB.prepare(`
    INSERT INTO comp_inspections (id, div_id, floor, position, year, month, day, tank_drain, oil, result, memo, photo_key, inspector, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now','+9 hours'))
    ON CONFLICT(div_id, year, month) DO UPDATE SET
      day        = excluded.day,
      tank_drain = excluded.tank_drain,
      oil        = excluded.oil,
      result     = excluded.result,
      memo       = excluded.memo,
      photo_key  = excluded.photo_key,
      inspector  = excluded.inspector
  `).bind(
    id, body.location_no, body.floor, body.position,
    body.year, body.month, body.day ?? null,
    body.tank_drain ?? 'none', body.oil ?? 'sufficient',
    body.result ?? 'normal', body.memo ?? null, body.photo_key ?? null,
    body.inspector ?? null
  ).run()

  return Response.json({ ok: true, id })
}
