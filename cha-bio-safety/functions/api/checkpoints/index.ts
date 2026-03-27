import type { Env } from '../../_middleware'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url      = new URL(request.url)
  const floor    = url.searchParams.get('floor')
  const zone     = url.searchParams.get('zone')
  const qr       = url.searchParams.get('qr')
  const category = url.searchParams.get('category')

  let sql = 'SELECT * FROM check_points WHERE is_active=1'
  const binds: string[] = []
  if (qr) {
    sql += ' AND (qr_code=? OR id=?)'
    binds.push(qr, qr)
  } else {
    if (floor)    { sql += ' AND floor=?';    binds.push(floor) }
    if (zone)     { sql += ' AND zone=?';     binds.push(zone) }
    if (category) { sql += ' AND category=?'; binds.push(category) }
  }
  sql += ' ORDER BY floor ASC, location_no ASC, location ASC'

  let stmt = env.DB.prepare(sql)
  // D1 positional binding
  stmt = env.DB.prepare(sql)
  if      (binds.length === 0) { /* no-op */ }
  else if (binds.length === 1) stmt = env.DB.prepare(sql).bind(binds[0])
  else if (binds.length === 2) stmt = env.DB.prepare(sql).bind(binds[0], binds[1])
  else if (binds.length === 3) stmt = env.DB.prepare(sql).bind(binds[0], binds[1], binds[2])

  const result = await stmt.all<Record<string,unknown>>()
  const rows   = (result.results ?? []).map(r => ({
    id:          r.id,
    qrCode:      r.qr_code,
    floor:       r.floor,
    zone:        r.zone,
    location:    r.location,
    category:    r.category,
    description:   r.description ?? undefined,
    locationNo:    r.location_no ?? undefined,
    defaultResult: r.default_result ?? undefined,
  }))
  return Response.json({ success:true, data:rows })
}
