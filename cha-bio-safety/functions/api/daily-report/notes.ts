import type { Env } from '../../_middleware'

// GET /api/daily-report/notes?date=YYYY-MM-DD
// GET /api/daily-report/notes?year=YYYY&month=MM  (월별 전체)
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url)
  const date = url.searchParams.get('date')
  const year = url.searchParams.get('year')
  const month = url.searchParams.get('month')

  try {
    // 월별 조회
    if (year && month) {
      const prefix = `${year}-${month.padStart(2, '0')}`
      const rows = await ctx.env.DB.prepare(
        `SELECT id, date, today_text, tomorrow_text, content, is_auto, updated_at
         FROM daily_notes WHERE date LIKE ? ORDER BY date ASC`
      ).bind(`${prefix}-%`).all()
      return Response.json({ success: true, data: rows.results ?? [] })
    }

    // 일별 조회
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return Response.json({ success: false, error: '날짜 형식 오류 (YYYY-MM-DD)' }, { status: 400 })
    }
    const row = await ctx.env.DB.prepare(
      `SELECT id, date, today_text, tomorrow_text, content, is_auto, created_by, updated_at
       FROM daily_notes WHERE date = ?`
    ).bind(date).first()
    return Response.json({ success: true, data: row ?? null })
  } catch (e) {
    console.error('daily-report/notes GET error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}

// POST /api/daily-report/notes body: { date, today_text?, tomorrow_text?, content?, is_auto? }
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  try {
    const body = await ctx.request.json() as {
      date?: string; today_text?: string; tomorrow_text?: string; content?: string; is_auto?: number
    }
    const { date, today_text, tomorrow_text, content, is_auto } = body
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return Response.json({ success: false, error: '날짜 형식 오류 (YYYY-MM-DD)' }, { status: 400 })
    }
    const staffId = (ctx as any).data?.staffId
    if (!staffId) {
      return Response.json({ success: false, error: '인증이 필요합니다' }, { status: 401 })
    }
    const id = crypto.randomUUID()
    await ctx.env.DB.prepare(
      `INSERT INTO daily_notes (id, date, today_text, tomorrow_text, content, is_auto, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
       ON CONFLICT(date) DO UPDATE SET
         today_text=COALESCE(excluded.today_text, today_text),
         tomorrow_text=COALESCE(excluded.tomorrow_text, tomorrow_text),
         content=CASE WHEN excluded.content IS NOT NULL THEN excluded.content ELSE content END,
         is_auto=excluded.is_auto,
         updated_at=datetime('now')`
    ).bind(id, date, today_text ?? null, tomorrow_text ?? null, content ?? '', is_auto ?? 0, staffId).run()

    const row = await ctx.env.DB.prepare(
      `SELECT id, date, today_text, tomorrow_text, content, is_auto, updated_at FROM daily_notes WHERE date = ?`
    ).bind(date).first()
    return Response.json({ success: true, data: row })
  } catch (e) {
    console.error('daily-report/notes POST error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}
