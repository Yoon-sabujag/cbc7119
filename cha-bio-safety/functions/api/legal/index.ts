import type { Env } from '../../_middleware'

// ── 법적 점검 회차 목록 조회 ──────────────────────────────────────────
// GET /api/legal
// Returns schedule_items with category='fire' and legal subcategories,
// with aggregated finding counts. Optional ?year=YYYY filter.
export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url)
  const year = url.searchParams.get('year')

  try {
    const yearFilter = year ? `AND strftime('%Y', si.date) = ?` : ''
    const binds: string[] = year ? [year] : []

    const rows = await env.DB.prepare(`
      SELECT
        si.id,
        si.title,
        si.date,
        si.inspection_category,
        si.status,
        si.result,
        si.report_file_key,
        COUNT(lf.id) AS finding_count,
        SUM(CASE WHEN lf.status = 'resolved' THEN 1 ELSE 0 END) AS resolved_count
      FROM schedule_items si
      LEFT JOIN legal_findings lf ON lf.schedule_item_id = si.id
      WHERE si.category = 'fire'
        AND si.title IN ('소방 상반기 종합정밀점검', '소방 하반기 작동기능점검')
        ${yearFilter}
      GROUP BY si.id
      ORDER BY si.date DESC
    `).bind(...binds).all<{
      id: string; title: string; date: string; inspection_category: string;
      status: string; result: string | null; report_file_key: string | null;
      finding_count: number; resolved_count: number
    }>()

    const data = (rows.results ?? []).map(r => ({
      id: r.id,
      title: r.title,
      date: r.date,
      inspectionCategory: r.inspection_category,
      status: r.status,
      result: r.result ?? null,
      reportFileKey: r.report_file_key ?? null,
      findingCount: Number(r.finding_count ?? 0),
      resolvedCount: Number(r.resolved_count ?? 0),
    }))

    return Response.json({ success: true, data })
  } catch (e) {
    console.error('[legal GET]', e)
    return Response.json({ success: false, error: '법적 점검 목록 조회 실패' }, { status: 500 })
  }
}
