import type { Env } from '../../_middleware'

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url)
  const date = url.searchParams.get('date')
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ success: false, error: '날짜 형식 오류 (YYYY-MM-DD)' }, { status: 400 })
  }
  try {
    // ── 일정 항목 ────────────────────────────────────────
    const schedules = await ctx.env.DB.prepare(
      `SELECT id, title, date, time, category, status, inspection_category, memo
       FROM schedule_items WHERE date = ?
       ORDER BY CASE WHEN time IS NULL THEN 1 ELSE 0 END, time ASC`
    ).bind(date).all()

    // ── 연차/휴가 ────────────────────────────────────────
    const leaves = await ctx.env.DB.prepare(
      `SELECT id, staff_id, start_date, end_date, leave_type, reason
       FROM annual_leaves WHERE start_date <= ? AND end_date >= ?`
    ).bind(date, date).all()

    // ── 승강기 고장 (해당 날짜에 활성 상태) ──────────────
    const elevatorFaults = await ctx.env.DB.prepare(
      `SELECT id, elevator_id, description, reported_at, resolved_at
       FROM elevator_faults
       WHERE date(reported_at) <= ? AND (resolved_at IS NULL OR date(resolved_at) >= ?)`
    ).bind(date, date).all()

    return Response.json({
      success: true,
      data: {
        schedules: schedules.results ?? [],
        leaves: leaves.results ?? [],
        elevatorFaults: elevatorFaults.results ?? [],
      }
    })
  } catch (e) {
    console.error('daily-report error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}
