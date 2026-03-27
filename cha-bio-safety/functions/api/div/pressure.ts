import type { Env } from '../../_middleware'

// GET  /api/div/pressure?year=2026                → 해당 연도 전체
// GET  /api/div/pressure?location=8-1             → 특정 측정점 전체 이력
// POST /api/div/pressure                          → 새 측정 기록 추가

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url      = new URL(request.url)
  const year     = url.searchParams.get('year')
  const location = url.searchParams.get('location')

  let query = ''
  let params: (string | number)[] = []

  if (location) {
    query  = 'SELECT * FROM div_pressures WHERE location_no = ? ORDER BY year DESC, month DESC'
    params = [location]
  } else if (year) {
    query  = 'SELECT * FROM div_pressures WHERE year = ? ORDER BY floor DESC, position, month'
    params = [Number(year)]
  } else {
    // 전체 연도
    query  = 'SELECT * FROM div_pressures ORDER BY year DESC, month DESC, floor DESC, position'
    params = []
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
    pressure_1: number
    pressure_2?: number
    pressure_set?: number
    inspector?: string
    result?: string
    drain?: string
    oil?: string
    memo?: string
    photo_key?: string
  }

  const id = `DIV-${body.year}-${String(body.month).padStart(2,'0')}-${body.location_no}`

  await env.DB.prepare(`
    INSERT INTO div_pressures (id, year, month, day, location_no, floor, position, pressure_1, pressure_2, pressure_set, inspector, result, drain, oil, memo, photo_key, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      day          = excluded.day,
      pressure_1   = excluded.pressure_1,
      pressure_2   = excluded.pressure_2,
      pressure_set = excluded.pressure_set,
      inspector    = excluded.inspector,
      result       = excluded.result,
      drain        = excluded.drain,
      oil          = excluded.oil,
      memo         = excluded.memo,
      photo_key    = excluded.photo_key
  `).bind(
    id, body.year, body.month, body.day ?? null, body.location_no, body.floor, body.position,
    body.pressure_1, body.pressure_2 ?? null, body.pressure_set ?? null,
    body.inspector ?? null,
    body.result ?? 'normal', body.drain ?? 'none', body.oil ?? 'sufficient',
    body.memo ?? null, body.photo_key ?? null
  ).run()

  return Response.json({ ok: true, id })
}
