import type { Env } from '../../_middleware'

// ── CheckPoint 목록 조회 / 등록 ──────────────────────────────

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const url = new URL(request.url)
    const category  = url.searchParams.get('category')
    const categories = url.searchParams.get('categories')

    // 카테고리 목록만 반환
    if (categories === 'all') {
      const rows = await env.DB.prepare(
        'SELECT DISTINCT category FROM check_points ORDER BY category'
      ).all<{ category: string }>()
      return Response.json({ success: true, data: (rows.results ?? []).map(r => r.category) })
    }

    // 전체 또는 카테고리 필터 목록
    const rows = await env.DB.prepare(
      `SELECT id, qr_code, floor, zone, location, category, description, location_no, is_active, created_at
       FROM check_points
       WHERE (?1 IS NULL OR category = ?1)
       ORDER BY category, floor, location`
    ).bind(category).all<Record<string, unknown>>()

    const data = (rows.results ?? []).map(r => ({
      id:          r.id,
      qrCode:      r.qr_code,
      floor:       r.floor,
      zone:        r.zone,
      location:    r.location,
      category:    r.category,
      description: r.description ?? null,
      locationNo:  r.location_no ?? null,
      isActive:    r.is_active ?? 1,
      createdAt:   r.created_at,
    }))

    return Response.json({ success: true, data })
  } catch (e) {
    console.error('check-points list error:', e)
    return Response.json({ success: false, error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx
  const data = ctx as any

  try {
    if (data.data?.role !== 'admin')
      return Response.json({ success: false, error: '권한이 없습니다' }, { status: 403 })

    const body = await request.json<{
      id: string; qrCode: string; floor: string; zone: string;
      location: string; category: string; description?: string; locationNo?: string
    }>()

    if (!body.id?.trim() || !body.qrCode?.trim() || !body.floor || !body.zone || !body.location?.trim() || !body.category?.trim())
      return Response.json({ success: false, error: '필수 항목을 모두 입력하세요' }, { status: 400 })

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19)

    await env.DB.prepare(
      `INSERT INTO check_points (id, qr_code, floor, zone, location, category, description, location_no, is_active, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 1, ?9)`
    ).bind(
      body.id.trim(),
      body.qrCode.trim(),
      body.floor,
      body.zone,
      body.location.trim(),
      body.category.trim(),
      body.description ?? null,
      body.locationNo  ?? null,
      now,
    ).run()

    const created = await env.DB.prepare(
      `SELECT id, qr_code, floor, zone, location, category, description, location_no, is_active, created_at
       FROM check_points WHERE id = ?1`
    ).bind(body.id.trim()).first<Record<string, unknown>>()

    return Response.json({
      success: true,
      data: {
        id:          created!.id,
        qrCode:      created!.qr_code,
        floor:       created!.floor,
        zone:        created!.zone,
        location:    created!.location,
        category:    created!.category,
        description: created!.description ?? null,
        locationNo:  created!.location_no ?? null,
        isActive:    created!.is_active ?? 1,
        createdAt:   created!.created_at,
      },
    }, { status: 201 })
  } catch (e) {
    console.error('check-point create error:', e)
    return Response.json({ success: false, error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
