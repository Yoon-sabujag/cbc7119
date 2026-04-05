// GET /api/holidays?year=2026 — DB에서 공휴일 조회
export const onRequestGet: PagesFunction<{ DB: D1Database }> = async ({ request, env }) => {
  const url = new URL(request.url)
  const year = url.searchParams.get('year')

  let sql = 'SELECT date, name FROM holidays WHERE is_holiday = ?'
  const params: string[] = ['Y']

  if (year) {
    sql += ' AND date LIKE ?'
    params.push(`${year}-%`)
  }

  sql += ' ORDER BY date ASC'

  const { results } = await env.DB.prepare(sql).bind(...params).all()
  return Response.json({ success: true, data: results })
}
