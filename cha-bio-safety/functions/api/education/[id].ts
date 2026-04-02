import type { Env } from '../../_middleware'

// ── 보수교육 기록 수정 ──────────────────────────────────────────
// No DELETE endpoint: 이수 이력 삭제 불가 원칙 (D-09)

// PUT /api/education/:id
// Updates completed_at on an existing record; admin or owner only
export const onRequestPut: PagesFunction<Env> = async ({ request, env, data, params }) => {
  const { staffId: authStaffId, role } = data as any
  const id = params.id as string

  let body: { completed_at: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: '요청 본문 파싱 실패' }, { status: 400 })
  }

  const { completed_at } = body

  if (!completed_at || !/^\d{4}-\d{2}-\d{2}$/.test(completed_at)) {
    return Response.json({ success: false, error: 'completed_at 날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)' }, { status: 400 })
  }

  try {
    // Look up the record to get staff_id for permission check
    const existing = await env.DB.prepare(
      `SELECT staff_id FROM education_records WHERE id = ?`
    ).bind(id).first<{ staff_id: string }>()

    if (!existing) {
      return Response.json({ success: false, error: '기록을 찾을 수 없습니다' }, { status: 404 })
    }

    // Permission check: admin OR owner
    if (role !== 'admin' && authStaffId !== existing.staff_id) {
      return Response.json({ success: false, error: '권한이 없습니다' }, { status: 403 })
    }

    await env.DB.prepare(
      `UPDATE education_records SET completed_at = ? WHERE id = ?`
    ).bind(completed_at, id).run()

    return Response.json({ success: true })
  } catch (e) {
    console.error('[education PUT]', e)
    return Response.json({ success: false, error: '보수교육 기록 수정 실패' }, { status: 500 })
  }
}
