import type { Env } from '../../_middleware'

// GET /api/daily-report/notes?date=YYYY-MM-DD
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url)
  const date = url.searchParams.get('date')
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ success: false, error: '날짜 형식 오류 (YYYY-MM-DD)' }, { status: 400 })
  }
  try {
    const row = await ctx.env.DB.prepare(
      `SELECT id, date, content, created_by, created_at, updated_at
       FROM daily_notes WHERE date = ?`
    ).bind(date).first()
    return Response.json({ success: true, data: row ?? null })
  } catch (e) {
    console.error('daily-report/notes GET error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}

// POST /api/daily-report/notes body: { date, content }
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  try {
    const body = await ctx.request.json() as { date?: string; content?: string }
    const { date, content } = body
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return Response.json({ success: false, error: '날짜 형식 오류 (YYYY-MM-DD)' }, { status: 400 })
    }
    if (content === undefined) {
      return Response.json({ success: false, error: 'content 필드가 필요합니다' }, { status: 400 })
    }
    const staffId = (ctx as any).data?.staffId
    if (!staffId) {
      return Response.json({ success: false, error: '인증이 필요합니다' }, { status: 401 })
    }
    const id = crypto.randomUUID()
    await ctx.env.DB.prepare(
      `INSERT INTO daily_notes (id, date, content, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
       ON CONFLICT(date) DO UPDATE SET content=excluded.content, updated_at=datetime('now')`
    ).bind(id, date, content, staffId).run()

    const row = await ctx.env.DB.prepare(
      `SELECT id, date, content, created_by, updated_at FROM daily_notes WHERE date = ?`
    ).bind(date).first()
    return Response.json({ success: true, data: row })
  } catch (e) {
    console.error('daily-report/notes POST error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}
