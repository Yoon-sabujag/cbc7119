import type { Env } from '../../_middleware'

// GET /api/remediation — 불량/주의 점검 기록 목록 조회
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const url    = new URL(request.url)
    const status   = url.searchParams.get('status')   // 'open' | 'resolved' | null (전체)
    const category = url.searchParams.get('category') // string | null
    const daysStr  = url.searchParams.get('days')
    const days     = daysStr !== null ? Number(daysStr) : 30  // 기본 30일, 0=전체

    // ── WHERE 절 동적 빌드 ─────────────────────────────
    const conditions: string[] = [`r.result IN ('bad','caution')`]
    const binds: (string | number)[] = []

    if (status === 'open') {
      // Pitfall 4: NULL status는 'open'과 동일 처리
      conditions.push(`(r.status IS NULL OR r.status = 'open')`)
    } else if (status === 'resolved') {
      conditions.push(`r.status = 'resolved'`)
    }

    if (category) {
      conditions.push(`cp.category = ?`)
      binds.push(category)
    }

    if (days > 0) {
      conditions.push(`date(r.checked_at) >= date('now','+9 hours','-${days} days')`)
    }

    const where = conditions.join(' AND ')

    const records = await env.DB.prepare(`
      SELECT r.id, r.result, r.memo, r.photo_key,
             COALESCE(r.status, 'open') as status,
             r.resolution_memo, r.resolution_photo_key, r.materials_used,
             r.resolved_at, r.resolved_by, r.checked_at, r.staff_id,
             cp.category, cp.location, cp.floor, cp.zone,
             s.name AS staff_name
      FROM check_records r
      JOIN check_points cp ON cp.id = r.checkpoint_id
      LEFT JOIN staff s ON s.id = r.staff_id
      WHERE ${where}
      ORDER BY r.checked_at DESC
    `).bind(...binds).all<Record<string, string | null>>()

    // ── 카테고리 목록 (필터 드롭다운용) ──────────────────
    const categoriesResult = await env.DB.prepare(`
      SELECT DISTINCT category FROM check_points WHERE is_active=1 ORDER BY category
    `).all<{ category: string }>()

    // snake_case → camelCase 변환
    const mapped = records.results.map(r => ({
      id:                   r.id,
      result:               r.result,
      memo:                 r.memo,
      photoKey:             r.photo_key,
      status:               r.status,
      resolutionMemo:       r.resolution_memo,
      resolutionPhotoKey:   r.resolution_photo_key,
      materialsUsed:        r.materials_used,
      resolvedAt:           r.resolved_at,
      resolvedBy:           r.resolved_by,
      checkedAt:            r.checked_at,
      staffId:              r.staff_id,
      staffName:            r.staff_name,
      category:             r.category,
      location:             r.location,
      floor:                r.floor,
      zone:                 r.zone,
    }))

    return Response.json({
      success: true,
      data: {
        records:    mapped,
        categories: categoriesResult.results.map(c => c.category),
      },
    })
  } catch (e) {
    console.error('remediation list error', e)
    return Response.json({ success: false, error: '조회 실패' }, { status: 500 })
  }
}
