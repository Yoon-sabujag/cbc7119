import type { Env } from '../../_middleware'

// GET /api/meal?month=YYYY-MM
export const onRequestGet: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId } = data as any
  const url   = new URL(request.url)
  const month = url.searchParams.get('month')

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return Response.json({ success: false, error: 'month 파라미터가 필요합니다 (형식: YYYY-MM)' }, { status: 400 })
  }

  try {
    const result = await env.DB.prepare(
      `SELECT date, skipped_meals as skippedMeals
       FROM meal_records
       WHERE staff_id = ? AND date LIKE ?
       ORDER BY date ASC`
    ).bind(staffId, `${month}%`).all<{ date: string; skippedMeals: number }>()

    return Response.json({ success: true, data: { records: result.results ?? [] } })
  } catch (e) {
    console.error('[meal GET]', e)
    return Response.json({ success: false, error: '식사 기록 조회 실패' }, { status: 500 })
  }
}

// POST /api/meal
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId } = data as any

  let body: { date: string; skippedMeals: number }
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: '요청 본문 파싱 실패' }, { status: 400 })
  }

  const { date, skippedMeals } = body

  // 날짜 형식 검증 YYYY-MM-DD
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ success: false, error: '날짜 형식이 올바르지 않습니다' }, { status: 400 })
  }

  // skippedMeals 범위 검증
  if (!Number.isInteger(skippedMeals) || ![0, 1, 2].includes(skippedMeals)) {
    return Response.json({ success: false, error: 'skippedMeals는 0, 1, 2 중 하나여야 합니다' }, { status: 400 })
  }

  try {
    if (skippedMeals === 0) {
      // 미식 0개 = 기록 삭제
      await env.DB.prepare(
        `DELETE FROM meal_records WHERE staff_id = ? AND date = ?`
      ).bind(staffId, date).run()
    } else {
      // 미식 1개 이상 = upsert
      await env.DB.prepare(
        `INSERT INTO meal_records (staff_id, date, skipped_meals)
         VALUES (?, ?, ?)
         ON CONFLICT(staff_id, date) DO UPDATE SET skipped_meals = excluded.skipped_meals, updated_at = datetime('now')`
      ).bind(staffId, date, skippedMeals).run()
    }

    return Response.json({ success: true })
  } catch (e) {
    console.error('[meal POST]', e)
    return Response.json({ success: false, error: '식사 기록 저장 실패' }, { status: 500 })
  }
}
