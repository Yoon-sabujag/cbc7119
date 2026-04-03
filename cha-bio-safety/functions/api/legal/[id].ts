import type { Env } from '../../_middleware'

// ── 법적 점검 회차 상세 조회 / 결과 수정 ─────────────────────────────

// GET /api/legal/:id
export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const id = params.id as string

  try {
    const row = await env.DB.prepare(`
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
      WHERE si.id = ?
      GROUP BY si.id
    `).bind(id).first<{
      id: string; title: string; date: string; inspection_category: string;
      status: string; result: string | null; report_file_key: string | null;
      finding_count: number; resolved_count: number
    }>()

    if (!row) {
      return Response.json({ success: false, error: '법적 점검 회차를 찾을 수 없습니다' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: {
        id: row.id,
        title: row.title,
        date: row.date,
        inspectionCategory: row.inspection_category,
        status: row.status,
        result: row.result ?? null,
        reportFileKey: row.report_file_key ?? null,
        findingCount: Number(row.finding_count ?? 0),
        resolvedCount: Number(row.resolved_count ?? 0),
      },
    })
  } catch (e) {
    console.error('[legal/:id GET]', e)
    return Response.json({ success: false, error: '법적 점검 조회 실패' }, { status: 500 })
  }
}

// PATCH /api/legal/:id
// Update result and/or report_file_key; admin only
export const onRequestPatch: PagesFunction<Env> = async ({ request, env, data, params }) => {
  const { role } = data as any
  const id = params.id as string

  if (role !== 'admin') {
    return Response.json({ success: false, error: '관리자만 가능합니다' }, { status: 403 })
  }

  let body: { result?: string; report_file_key?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: '요청 본문 파싱 실패' }, { status: 400 })
  }

  if (body.result !== undefined && !['pass', 'fail', 'conditional'].includes(body.result)) {
    return Response.json({ success: false, error: "result는 'pass', 'fail', 'conditional' 중 하나여야 합니다" }, { status: 400 })
  }

  try {
    const existing = await env.DB.prepare(
      `SELECT id FROM schedule_items WHERE id = ?`
    ).bind(id).first<{ id: string }>()

    if (!existing) {
      return Response.json({ success: false, error: '법적 점검 회차를 찾을 수 없습니다' }, { status: 404 })
    }

    await env.DB.prepare(`
      UPDATE schedule_items
      SET
        result          = COALESCE(?, result),
        report_file_key = COALESCE(?, report_file_key)
      WHERE id = ?
    `).bind(
      body.result ?? null,
      body.report_file_key ?? null,
      id,
    ).run()

    return Response.json({ success: true })
  } catch (e) {
    console.error('[legal/:id PATCH]', e)
    return Response.json({ success: false, error: '법적 점검 수정 실패' }, { status: 500 })
  }
}
