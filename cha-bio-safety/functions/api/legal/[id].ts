import type { Env } from '../../_middleware'

// ── 법적 점검 회차 상세 조회 / 수정 ─────────────────────────────────

// GET /api/legal/:id
export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const id = params.id as string

  try {
    const row = await env.DB.prepare(`
      SELECT id, inspection_type, inspected_at, agency, result, report_file_key, memo, created_by, created_at
      FROM legal_inspections
      WHERE id = ?
    `).bind(id).first<{
      id: string; inspection_type: string; inspected_at: string; agency: string;
      result: string; report_file_key: string | null; memo: string | null;
      created_by: string; created_at: string
    }>()

    if (!row) {
      return Response.json({ success: false, error: '법적 점검 회차를 찾을 수 없습니다' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: {
        id: row.id,
        inspectionType: row.inspection_type,
        inspectedAt: row.inspected_at,
        agency: row.agency,
        result: row.result,
        reportFileKey: row.report_file_key,
        memo: row.memo,
        createdBy: row.created_by,
        createdAt: row.created_at,
      },
    })
  } catch (e) {
    console.error('[legal/:id GET]', e)
    return Response.json({ success: false, error: '법적 점검 조회 실패' }, { status: 500 })
  }
}

// PUT /api/legal/:id
// Partial update; admin only
export const onRequestPut: PagesFunction<Env> = async ({ request, env, data, params }) => {
  const { role } = data as any
  const id = params.id as string

  if (role !== 'admin') {
    return Response.json({ success: false, error: '관리자만 가능합니다' }, { status: 403 })
  }

  let body: Record<string, any>
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: '요청 본문 파싱 실패' }, { status: 400 })
  }

  try {
    const existing = await env.DB.prepare(
      `SELECT id FROM legal_inspections WHERE id = ?`
    ).bind(id).first<{ id: string }>()

    if (!existing) {
      return Response.json({ success: false, error: '법적 점검 회차를 찾을 수 없습니다' }, { status: 404 })
    }

    await env.DB.prepare(`
      UPDATE legal_inspections
      SET
        inspection_type = COALESCE(?, inspection_type),
        inspected_at    = COALESCE(?, inspected_at),
        agency          = COALESCE(?, agency),
        result          = COALESCE(?, result),
        report_file_key = COALESCE(?, report_file_key),
        memo            = COALESCE(?, memo)
      WHERE id = ?
    `).bind(
      body.inspection_type ?? null,
      body.inspected_at ?? null,
      body.agency ?? null,
      body.result ?? null,
      body.report_file_key ?? null,
      body.memo ?? null,
      id,
    ).run()

    return Response.json({ success: true })
  } catch (e) {
    console.error('[legal/:id PUT]', e)
    return Response.json({ success: false, error: '법적 점검 수정 실패' }, { status: 500 })
  }
}
