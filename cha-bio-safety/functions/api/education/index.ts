import type { Env } from '../../_middleware'

// ── 보수교육 기록 목록 조회 / 신규 등록 ──────────────────────────────

// GET /api/education
// Returns all active staff with their education records grouped by staff
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const staffRows = await env.DB.prepare(
      `SELECT id, name, title, appointed_at
       FROM staff
       WHERE active = 1
       ORDER BY name ASC`
    ).all<{ id: string; name: string; title: string; appointed_at: string | null }>()

    const recordRows = await env.DB.prepare(
      `SELECT id, staff_id, education_type, completed_at, created_at
       FROM education_records
       ORDER BY completed_at DESC`
    ).all<{ id: string; staff_id: string; education_type: string; completed_at: string; created_at: string }>()

    // Group records by staff_id
    const recordsByStaff = new Map<string, typeof recordRows.results>()
    for (const rec of recordRows.results ?? []) {
      const arr = recordsByStaff.get(rec.staff_id) ?? []
      arr.push(rec)
      recordsByStaff.set(rec.staff_id, arr)
    }

    const data = (staffRows.results ?? []).map(s => ({
      staff: {
        id: s.id,
        name: s.name,
        title: s.title,
        appointedAt: s.appointed_at ?? null,
      },
      records: (recordsByStaff.get(s.id) ?? []).map(r => ({
        id: r.id,
        staffId: r.staff_id,
        educationType: r.education_type,
        completedAt: r.completed_at,
        createdAt: r.created_at,
      })),
    }))

    return Response.json({ success: true, data })
  } catch (e) {
    console.error('[education GET]', e)
    return Response.json({ success: false, error: '보수교육 기록 조회 실패' }, { status: 500 })
  }
}

// POST /api/education
// Creates a new education record; admin or self only
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId: authStaffId, role } = data as any

  let body: { staffId: string; education_type: string; completed_at: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: '요청 본문 파싱 실패' }, { status: 400 })
  }

  const { staffId, education_type, completed_at } = body

  if (!staffId?.trim()) {
    return Response.json({ success: false, error: 'staffId가 필요합니다' }, { status: 400 })
  }

  if (!education_type || !['initial', 'refresher'].includes(education_type)) {
    return Response.json({ success: false, error: "education_type은 'initial' 또는 'refresher'여야 합니다" }, { status: 400 })
  }

  if (!completed_at || !/^\d{4}-\d{2}-\d{2}$/.test(completed_at)) {
    return Response.json({ success: false, error: 'completed_at 날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)' }, { status: 400 })
  }

  // Permission check: admin OR self
  if (role !== 'admin' && authStaffId !== staffId) {
    return Response.json({ success: false, error: '권한이 없습니다' }, { status: 403 })
  }

  try {
    const id = await env.DB.prepare(
      `INSERT INTO education_records (staff_id, education_type, completed_at)
       VALUES (?, ?, ?)
       RETURNING id, staff_id, education_type, completed_at, created_at`
    ).bind(staffId, education_type, completed_at)
      .first<{ id: string; staff_id: string; education_type: string; completed_at: string; created_at: string }>()

    if (!id) throw new Error('insert returned no row')

    return Response.json({
      success: true,
      data: {
        id: id.id,
        staffId: id.staff_id,
        educationType: id.education_type,
        completedAt: id.completed_at,
        createdAt: id.created_at,
      },
    }, { status: 201 })
  } catch (e) {
    console.error('[education POST]', e)
    return Response.json({ success: false, error: '보수교육 기록 등록 실패' }, { status: 500 })
  }
}
