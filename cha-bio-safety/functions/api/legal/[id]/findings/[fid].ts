import type { Env } from '../../../../_middleware'

// ── 지적사항 상세 조회 / 수정 ─────────────────────────────────────

// GET /api/legal/:id/findings/:fid
export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const scheduleItemId = params.id as string
  const fid = params.fid as string

  try {
    const row = await env.DB.prepare(`
      SELECT
        lf.id,
        lf.schedule_item_id,
        lf.description,
        lf.location,
        lf.photo_key,
        lf.resolution_memo,
        lf.resolution_photo_key,
        lf.status,
        lf.resolved_at,
        lf.resolved_by,
        lf.created_by,
        lf.created_at,
        s.name  AS created_by_name,
        s2.name AS resolved_by_name
      FROM legal_findings lf
      LEFT JOIN staff s  ON s.id  = lf.created_by
      LEFT JOIN staff s2 ON s2.id = lf.resolved_by
      WHERE lf.id = ? AND lf.schedule_item_id = ?
    `).bind(fid, scheduleItemId).first<{
      id: string; schedule_item_id: string; description: string; location: string | null;
      photo_key: string | null; resolution_memo: string | null;
      resolution_photo_key: string | null; status: string;
      resolved_at: string | null; resolved_by: string | null;
      created_by: string; created_at: string;
      created_by_name: string | null; resolved_by_name: string | null
    }>()

    if (!row) {
      return Response.json({ success: false, error: '지적사항을 찾을 수 없습니다' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: {
        id: row.id,
        scheduleItemId: row.schedule_item_id,
        description: row.description,
        location: row.location,
        photoKey: row.photo_key,
        resolutionMemo: row.resolution_memo,
        resolutionPhotoKey: row.resolution_photo_key,
        status: row.status,
        resolvedAt: row.resolved_at,
        resolvedBy: row.resolved_by,
        resolvedByName: row.resolved_by_name,
        createdBy: row.created_by,
        createdByName: row.created_by_name,
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
  const scheduleItemId = params.id as string
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
      `SELECT id FROM legal_findings WHERE id = ? AND schedule_item_id = ?`
    ).bind(fid, scheduleItemId).first<{ id: string }>()

    if (!existing) {
      return Response.json({ success: false, error: '지적사항을 찾을 수 없습니다' }, { status: 404 })
    }

    await env.DB.prepare(`
      UPDATE legal_findings
      SET
        description = COALESCE(?, description),
        location    = COALESCE(?, location),
        photo_key   = COALESCE(?, photo_key)
      WHERE id = ? AND schedule_item_id = ?
    `).bind(
      body.description ?? null,
      body.location ?? null,
      body.photo_key ?? null,
      fid,
      scheduleItemId,
    ).run()

    return Response.json({ success: true })
  } catch (e) {
    console.error('[legal/:id/findings/:fid PUT]', e)
    return Response.json({ success: false, error: '지적사항 수정 실패' }, { status: 500 })
  }
}

// DELETE /api/legal/:id/findings/:fid
export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const scheduleItemId = params.id as string
  const fid = params.fid as string

  try {
    const existing = await env.DB.prepare(
      `SELECT id FROM legal_findings WHERE id = ? AND schedule_item_id = ?`
    ).bind(fid, scheduleItemId).first<{ id: string }>()

    if (!existing) {
      return Response.json({ success: false, error: '지적사항을 찾을 수 없습니다' }, { status: 404 })
    }

    await env.DB.prepare(`DELETE FROM legal_findings WHERE id = ? AND schedule_item_id = ?`).bind(fid, scheduleItemId).run()
    return Response.json({ success: true })
  } catch (e) {
    console.error('[legal/:id/findings/:fid DELETE]', e)
    return Response.json({ success: false, error: '지적사항 삭제 실패' }, { status: 500 })
  }
}
