import type { Env } from '../../../../_middleware'

// ── 지적사항 목록 조회 / 등록 ─────────────────────────────────────

// GET /api/legal/:id/findings
export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const inspectionId = params.id as string

  try {
    const rows = await env.DB.prepare(`
      SELECT id, inspection_id, description, location, photo_key,
             resolution_memo, resolution_photo_key, status,
             resolved_at, resolved_by, created_by, created_at
      FROM legal_findings
      WHERE inspection_id = ?
      ORDER BY CASE WHEN status='open' THEN 0 ELSE 1 END, created_at DESC
    `).bind(inspectionId).all<{
      id: string; inspection_id: string; description: string; location: string | null;
      photo_key: string | null; resolution_memo: string | null;
      resolution_photo_key: string | null; status: string;
      resolved_at: string | null; resolved_by: string | null;
      created_by: string; created_at: string
    }>()

    const data = (rows.results ?? []).map(r => ({
      id: r.id,
      inspectionId: r.inspection_id,
      description: r.description,
      location: r.location,
      photoKey: r.photo_key,
      resolutionMemo: r.resolution_memo,
      resolutionPhotoKey: r.resolution_photo_key,
      status: r.status,
      resolvedAt: r.resolved_at,
      resolvedBy: r.resolved_by,
      createdBy: r.created_by,
      createdAt: r.created_at,
    }))

    return Response.json({ success: true, data })
  } catch (e) {
    console.error('[legal/:id/findings GET]', e)
    return Response.json({ success: false, error: '지적사항 목록 조회 실패' }, { status: 500 })
  }
}

// POST /api/legal/:id/findings
// All staff can register findings
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data, params }) => {
  const { staffId } = data as any
  const inspectionId = params.id as string

  let body: { description: string; location?: string; photo_key?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: '요청 본문 파싱 실패' }, { status: 400 })
  }

  const { description, location, photo_key } = body

  if (!description?.trim()) {
    return Response.json({ success: false, error: 'description이 필요합니다' }, { status: 400 })
  }

  try {
    // Verify parent inspection exists
    const parent = await env.DB.prepare(
      `SELECT id FROM legal_inspections WHERE id = ?`
    ).bind(inspectionId).first<{ id: string }>()

    if (!parent) {
      return Response.json({ success: false, error: '법적 점검 회차를 찾을 수 없습니다' }, { status: 404 })
    }

    const row = await env.DB.prepare(`
      INSERT INTO legal_findings (inspection_id, description, location, photo_key, created_by)
      VALUES (?, ?, ?, ?, ?)
      RETURNING id
    `).bind(inspectionId, description, location ?? null, photo_key ?? null, staffId)
      .first<{ id: string }>()

    if (!row) throw new Error('insert returned no row')

    return Response.json({ success: true, data: { id: row.id } }, { status: 201 })
  } catch (e) {
    console.error('[legal/:id/findings POST]', e)
    return Response.json({ success: false, error: '지적사항 등록 실패' }, { status: 500 })
  }
}
