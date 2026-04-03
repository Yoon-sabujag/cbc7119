import type { Env } from '../../../../_middleware'

// ── 지적사항 상세 조회 / 수정 ─────────────────────────────────────

// GET /api/legal/:id/findings/:fid
export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const inspectionId = params.id as string
  const fid = params.fid as string

  try {
    const row = await env.DB.prepare(`
      SELECT id, inspection_id, description, location, photo_key,
             resolution_memo, resolution_photo_key, status,
             resolved_at, resolved_by, created_by, created_at
      FROM legal_findings
      WHERE id = ? AND inspection_id = ?
    `).bind(fid, inspectionId).first<{
      id: string; inspection_id: string; description: string; location: string | null;
      photo_key: string | null; resolution_memo: string | null;
      resolution_photo_key: string | null; status: string;
      resolved_at: string | null; resolved_by: string | null;
      created_by: string; created_at: string
    }>()

    if (!row) {
      return Response.json({ success: false, error: '지적사항을 찾을 수 없습니다' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: {
        id: row.id,
        inspectionId: row.inspection_id,
        description: row.description,
        location: row.location,
        photoKey: row.photo_key,
        resolutionMemo: row.resolution_memo,
        resolutionPhotoKey: row.resolution_photo_key,
        status: row.status,
        resolvedAt: row.resolved_at,
        resolvedBy: row.resolved_by,
        createdBy: row.created_by,
        createdAt: row.created_at,
      },
    })
  } catch (e) {
    console.error('[legal/:id/findings/:fid GET]', e)
    return Response.json({ success: false, error: '지적사항 조회 실패' }, { status: 500 })
  }
}

// PUT /api/legal/:id/findings/:fid
// Partial update; admin only
export const onRequestPut: PagesFunction<Env> = async ({ request, env, data, params }) => {
  const { role } = data as any
  const inspectionId = params.id as string
  const fid = params.fid as string

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
      `SELECT id FROM legal_findings WHERE id = ? AND inspection_id = ?`
    ).bind(fid, inspectionId).first<{ id: string }>()

    if (!existing) {
      return Response.json({ success: false, error: '지적사항을 찾을 수 없습니다' }, { status: 404 })
    }

    await env.DB.prepare(`
      UPDATE legal_findings
      SET
        description = COALESCE(?, description),
        location    = COALESCE(?, location),
        photo_key   = COALESCE(?, photo_key)
      WHERE id = ? AND inspection_id = ?
    `).bind(
      body.description ?? null,
      body.location ?? null,
      body.photo_key ?? null,
      fid,
      inspectionId,
    ).run()

    return Response.json({ success: true })
  } catch (e) {
    console.error('[legal/:id/findings/:fid PUT]', e)
    return Response.json({ success: false, error: '지적사항 수정 실패' }, { status: 500 })
  }
}
