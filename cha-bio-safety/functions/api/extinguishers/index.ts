// GET /api/extinguishers — 소화기 전체 목록 (필터 지원)
export const onRequestGet: PagesFunction<{ DB: D1Database }> = async ({ request, env }) => {
  const url = new URL(request.url)
  const floor = url.searchParams.get('floor')
  const zone = url.searchParams.get('zone')
  const type = url.searchParams.get('type')
  const search = url.searchParams.get('q')

  let sql = `SELECT e.*, cp.id as cp_id FROM extinguishers e JOIN check_points cp ON e.check_point_id = cp.id WHERE 1=1`
  const params: string[] = []

  if (floor) { sql += ` AND e.floor = ?`; params.push(floor) }
  if (zone) { sql += ` AND e.zone = ?`; params.push(zone) }
  if (type) { sql += ` AND e.type = ?`; params.push(type) }
  if (search) { sql += ` AND (e.serial_no LIKE ? OR e.mgmt_no LIKE ?)`; params.push(`%${search}%`, `%${search}%`) }

  sql += ` ORDER BY e.seq_no ASC`

  const { results } = await env.DB.prepare(sql).bind(...params).all()

  // 요약 통계
  const { results: stats } = await env.DB.prepare(
    `SELECT type, COUNT(*) as cnt FROM extinguishers GROUP BY type ORDER BY cnt DESC`
  ).all()

  const { results: zones } = await env.DB.prepare(
    `SELECT DISTINCT zone FROM extinguishers ORDER BY zone`
  ).all()

  const { results: floors } = await env.DB.prepare(
    `SELECT DISTINCT floor FROM extinguishers ORDER BY floor`
  ).all()

  return Response.json({
    success: true,
    data: {
      items: results,
      stats: stats,
      zones: zones.map((z: any) => z.zone),
      floors: floors.map((f: any) => f.floor),
      total: results.length,
    }
  })
}
