import type { Env } from '../../_middleware'

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url)
  const date = url.searchParams.get('date')
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ success: false, error: '날짜 형식 오류 (YYYY-MM-DD)' }, { status: 400 })
  }
  try {
    // ── 일정 항목 (오늘 + 내일 — 명일업무 생성용) ─────────
    const nextDate = (() => {
      const [y, m, day] = date.split('-').map(Number)
      const d = new Date(Date.UTC(y, m - 1, day + 1))
      return d.toISOString().slice(0, 10)
    })()
    const schedules = await ctx.env.DB.prepare(
      `SELECT id, title, date, time, category, status, inspection_category, memo
       FROM schedule_items WHERE date IN (?, ?)
       ORDER BY date ASC, CASE WHEN time IS NULL THEN 1 ELSE 0 END, time ASC`
    ).bind(date, nextDate).all()

    // ── 연차/휴가 ────────────────────────────────────────
    const leaves = await ctx.env.DB.prepare(
      `SELECT id, staff_id, date, type
       FROM annual_leaves WHERE date = ?`
    ).bind(date).all()

    // ── 승강기 고장 (해당 날짜에 활성 상태) ──────────────
    const elevatorFaults = await ctx.env.DB.prepare(
      `SELECT id, elevator_id, symptoms, fault_at, repaired_at, repair_detail, is_resolved
       FROM elevator_faults
       WHERE date(fault_at) <= ? AND (is_resolved = 0 OR date(repaired_at) >= ?)`
    ).bind(date, date).all()

    // ── 해당 날짜에 조치 완료된 점검 항목 (불량/주의) ──────
    const remediations = await ctx.env.DB.prepare(
      `SELECT r.id, r.result, r.memo, r.resolution_memo, r.materials_used, r.location_detail, r.resolved_at,
              cp.category, cp.location, cp.floor, cp.zone,
              fpm.label AS marker_label
       FROM check_records r
       JOIN check_points cp ON cp.id = r.checkpoint_id
       LEFT JOIN floor_plan_markers fpm ON fpm.id = r.floor_plan_marker_id
       WHERE r.status = 'resolved'
         AND r.result IN ('bad','caution')
         AND date(r.resolved_at) = ?
       ORDER BY r.resolved_at ASC`
    ).bind(date).all()

    return Response.json({
      success: true,
      data: {
        schedules: schedules.results ?? [],
        leaves: leaves.results ?? [],
        elevatorFaults: elevatorFaults.results ?? [],
        remediations: remediations.results ?? [],
      }
    })
  } catch (e) {
    console.error('daily-report error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}
