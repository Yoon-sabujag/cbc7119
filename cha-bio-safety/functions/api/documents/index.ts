import { jsonError, jsonOk, isDocType, type Env } from './_helpers'

// GET /api/documents?type=plan|drill[&year=YYYY]
// Auth: any authenticated staff (middleware enforces JWT; no role check)
// Response: { success: true, data: Array<{ id, type, year, title, filename, size, content_type, uploaded_at, uploaded_by_name }> }
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url)
  const type = url.searchParams.get('type')
  const yearRaw = url.searchParams.get('year')

  if (!isDocType(type)) {
    return jsonError(400, 'type은 plan 또는 drill이어야 합니다')
  }

  let year: number | null = null
  if (yearRaw !== null) {
    const y = Number(yearRaw)
    if (!Number.isInteger(y) || y < 2000 || y > 2100) {
      return jsonError(400, 'year가 유효하지 않습니다')
    }
    year = y
  }

  try {
    const sql = year === null
      ? `SELECT d.id, d.type, d.year, d.title, d.filename, d.size, d.content_type, d.uploaded_at, s.name AS uploaded_by_name
         FROM documents d
         LEFT JOIN staff s ON s.id = d.uploaded_by
         WHERE d.type = ? AND d.deleted_at IS NULL
         ORDER BY d.year DESC, d.uploaded_at DESC`
      : `SELECT d.id, d.type, d.year, d.title, d.filename, d.size, d.content_type, d.uploaded_at, s.name AS uploaded_by_name
         FROM documents d
         LEFT JOIN staff s ON s.id = d.uploaded_by
         WHERE d.type = ? AND d.year = ? AND d.deleted_at IS NULL
         ORDER BY d.uploaded_at DESC`

    const stmt = year === null
      ? ctx.env.DB.prepare(sql).bind(type)
      : ctx.env.DB.prepare(sql).bind(type, year)

    const { results } = await stmt.all()
    return jsonOk(results || [])
  } catch (e) {
    console.error('DOCUMENTS_LIST_FAILED', e)
    return jsonError(500, '문서 목록 조회에 실패했습니다')
  }
}
