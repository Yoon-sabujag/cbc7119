import type { Env } from '../../_middleware'

// ── 법적 점검 회차 목록 조회 / 생성 ──────────────────────────────────

// GET /api/legal
// Returns all inspection sessions with finding_count and resolved_count aggregated
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const rows = await env.DB.prepare(`
      SELECT li.id, li.inspection_type, li.inspected_at, li.agency, li.result,
             li.report_file_key, li.memo, li.created_by, li.created_at,
             COUNT(lf.id) AS finding_count,
             SUM(CASE WHEN lf.status='resolved' THEN 1 ELSE 0 END) AS resolved_count
      FROM legal_inspections li
      LEFT JOIN legal_findings lf ON lf.inspection_id = li.id
      GROUP BY li.id
      ORDER BY li.inspected_at DESC
    `).all<{
      id: string; inspection_type: string; inspected_at: string; agency: string;
      result: string; report_file_key: string | null; memo: string | null;
      created_by: string; created_at: string; finding_count: number; resolved_count: number
    }>()

    const data = (rows.results ?? []).map(r => ({
      id: r.id,
      inspectionType: r.inspection_type,
      inspectedAt: r.inspected_at,
      agency: r.agency,
      result: r.result,
      reportFileKey: r.report_file_key,
      memo: r.memo,
      createdBy: r.created_by,
      createdAt: r.created_at,
      findingCount: Number(r.finding_count ?? 0),
      resolvedCount: Number(r.resolved_count ?? 0),
    }))

    return Response.json({ success: true, data })
  } catch (e) {
    console.error('[legal GET]', e)
    return Response.json({ success: false, error: '법적 점검 목록 조회 실패' }, { status: 500 })
  }
}

// POST /api/legal
// Creates a new legal inspection session; admin only
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId, role } = data as any

  if (role !== 'admin') {
    return Response.json({ success: false, error: '관리자만 가능합니다' }, { status: 403 })
  }

  let body: { inspection_type: string; inspected_at: string; agency: string; result: string; report_file_key?: string; memo?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: '요청 본문 파싱 실패' }, { status: 400 })
  }

  const { inspection_type, inspected_at, agency, result, report_file_key, memo } = body

  if (!inspection_type || !['comprehensive', 'functional'].includes(inspection_type)) {
    return Response.json({ success: false, error: "inspection_type은 'comprehensive' 또는 'functional'이어야 합니다" }, { status: 400 })
  }
  if (!inspected_at?.trim()) {
    return Response.json({ success: false, error: 'inspected_at이 필요합니다' }, { status: 400 })
  }
  if (!agency?.trim()) {
    return Response.json({ success: false, error: 'agency가 필요합니다' }, { status: 400 })
  }
  if (!result || !['pass', 'fail', 'conditional'].includes(result)) {
    return Response.json({ success: false, error: "result는 'pass', 'fail', 'conditional' 중 하나여야 합니다" }, { status: 400 })
  }

  try {
    const row = await env.DB.prepare(`
      INSERT INTO legal_inspections (inspection_type, inspected_at, agency, result, report_file_key, memo, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING id
    `).bind(inspection_type, inspected_at, agency, result, report_file_key ?? null, memo ?? null, staffId)
      .first<{ id: string }>()

    if (!row) throw new Error('insert returned no row')

    return Response.json({ success: true, data: { id: row.id } }, { status: 201 })
  } catch (e) {
    console.error('[legal POST]', e)
    return Response.json({ success: false, error: '법적 점검 등록 실패' }, { status: 500 })
  }
}
