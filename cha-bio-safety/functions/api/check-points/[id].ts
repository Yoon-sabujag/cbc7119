import type { Env } from '../../_middleware'

// ── CheckPoint 수정 ───────────────────────────────────────

export const onRequestPut: PagesFunction<Env> = async (ctx) => {
  const { request, env, params } = ctx
  const data = ctx as any

  try {
    if (data.data?.role !== 'admin')
      return Response.json({ success: false, error: '권한이 없습니다' }, { status: 403 })

    const id = params.id as string
    const body = await request.json<{
      location?: string; category?: string; description?: string;
      locationNo?: string; floor?: string; zone?: string; isActive?: number
    }>()

    const existing = await env.DB.prepare('SELECT id FROM check_points WHERE id = ?1').bind(id).first()
    if (!existing)
      return Response.json({ success: false, error: '점검포인트를 찾을 수 없습니다' }, { status: 404 })

    await env.DB.prepare(
      `UPDATE check_points SET
        location    = COALESCE(?1, location),
        category    = COALESCE(?2, category),
        description = ?3,
        location_no = ?4,
        floor       = COALESCE(?5, floor),
        zone        = COALESCE(?6, zone),
        is_active   = COALESCE(?7, is_active)
       WHERE id = ?8`
    ).bind(
      body.location    ?? null,
      body.category    ?? null,
      body.description !== undefined ? body.description : null,
      body.locationNo  !== undefined ? body.locationNo  : null,
      body.floor       ?? null,
      body.zone        ?? null,
      body.isActive    !== undefined ? body.isActive : null,
      id,
    ).run()

    const updated = await env.DB.prepare(
      `SELECT id, qr_code, floor, zone, location, category, description, location_no, is_active, created_at
       FROM check_points WHERE id = ?1`
    ).bind(id).first<Record<string, unknown>>()

    return Response.json({
      success: true,
      data: {
        id:          updated!.id,
        qrCode:      updated!.qr_code,
        floor:       updated!.floor,
        zone:        updated!.zone,
        location:    updated!.location,
        category:    updated!.category,
        description: updated!.description ?? null,
        locationNo:  updated!.location_no ?? null,
        isActive:    updated!.is_active ?? 1,
        createdAt:   updated!.created_at,
      },
    })
  } catch (e) {
    console.error('check-point update error:', e)
    return Response.json({ success: false, error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
