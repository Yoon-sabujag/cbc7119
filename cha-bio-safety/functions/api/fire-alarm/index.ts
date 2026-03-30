import type { Env } from '../../_middleware'

function nanoid(n=16){ const c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; const a=crypto.getRandomValues(new Uint8Array(n)); return Array.from(a,b=>c[b%c.length]).join('') }

// GET /api/fire-alarm?year=YYYY
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const year = url.searchParams.get('year')
  const recent = url.searchParams.get('recent') // recent=1 → 최근 48시간

  try {
    if (recent) {
      const rows = await env.DB.prepare(
        `SELECT * FROM fire_alarm_records
         WHERE datetime(occurred_at) >= datetime('now', '-48 hours')
         ORDER BY occurred_at DESC LIMIT 5`
      ).all()
      return Response.json({ success: true, data: rows.results ?? [] })
    }

    if (!year) {
      return Response.json({ success: false, error: 'year 파라미터가 필요합니다' }, { status: 400 })
    }

    const rows = await env.DB.prepare(
      `SELECT * FROM fire_alarm_records
       WHERE occurred_at LIKE ? ORDER BY occurred_at ASC`
    ).bind(`${year}%`).all()
    return Response.json({ success: true, data: rows.results ?? [] })
  } catch (e) {
    console.error('fire-alarm GET error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}

// POST /api/fire-alarm
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId } = data as any
  try {
    const body = await request.json<{
      type: string; occurred_at: string; location: string; cause: string; action: string
    }>()

    if (!body.type || !['fire', 'non_fire'].includes(body.type)) {
      return Response.json({ success: false, error: '구분을 선택하세요' }, { status: 400 })
    }
    if (!body.occurred_at) {
      return Response.json({ success: false, error: '발생일시를 입력하세요' }, { status: 400 })
    }

    const id = 'FA-' + nanoid(10)
    await env.DB.prepare(
      `INSERT INTO fire_alarm_records (id, type, occurred_at, location, cause, action, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, body.type, body.occurred_at, body.location ?? '', body.cause ?? '오작동', body.action ?? '자동복구, 현장확인', staffId).run()

    return Response.json({ success: true, data: { id } }, { status: 201 })
  } catch (e) {
    console.error('fire-alarm POST error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}
