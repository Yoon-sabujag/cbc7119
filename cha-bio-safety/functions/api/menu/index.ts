import type { Env } from '../../_middleware'

function nanoid(n = 12) {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const a = crypto.getRandomValues(new Uint8Array(n))
  return Array.from(a, b => c[b % c.length]).join('')
}

// GET /api/menu?date=2026-04-03  → 특정 날짜 메뉴
// GET /api/menu?week=2026-04-07  → 해당 주 메뉴 (월~토)
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const date = url.searchParams.get('date')
  const week = url.searchParams.get('week')

  try {
    if (week) {
      // 주간 메뉴: week 파라미터(월요일) 부터 6일간 (월~토)
      const dates: string[] = []
      const base = new Date(week + 'T00:00:00+09:00')
      for (let i = 0; i < 6; i++) {
        const d = new Date(base)
        d.setDate(base.getDate() + i)
        dates.push(d.toISOString().slice(0, 10))
      }
      const placeholders = dates.map(() => '?').join(',')
      const { results } = await env.DB.prepare(
        `SELECT id, date, lunch_a, lunch_b, dinner, pdf_key, created_at, updated_by
         FROM weekly_menus WHERE date IN (${placeholders}) ORDER BY date`
      ).bind(...dates).all()

      return Response.json({ success: true, data: results ?? [] })
    }

    // 단일 날짜 메뉴
    const targetDate = date ?? new Date().toISOString().slice(0, 10)
    const row = await env.DB.prepare(
      `SELECT id, date, lunch_a, lunch_b, dinner, pdf_key, created_at, updated_by
       FROM weekly_menus WHERE date = ?`
    ).bind(targetDate).first()

    return Response.json({ success: true, data: row ?? { date: targetDate, lunch_a: null, lunch_b: null, dinner: null } })
  } catch (e: any) {
    console.error('menu GET error:', e)
    return Response.json({ success: false, error: e.message ?? '메뉴 조회 실패' }, { status: 500 })
  }
}

// POST /api/menu  → 주간 메뉴 일괄 등록/수정 (admin only)
// Body: { menus: [{ date, lunch_a, lunch_b, dinner }], pdf_key?: string }
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx
  const { role, staffId } = (ctx as any).data ?? {}

  if (role !== 'admin') {
    return Response.json({ success: false, error: '관리자만 등록 가능합니다' }, { status: 403 })
  }

  try {
    const body = await request.json() as {
      menus: { date: string; lunch_a?: string; lunch_b?: string; dinner?: string }[]
      pdf_key?: string
    }

    if (!body.menus || !Array.isArray(body.menus) || body.menus.length === 0) {
      return Response.json({ success: false, error: 'menus 배열이 필요합니다' }, { status: 400 })
    }

    const results: { date: string; id: string }[] = []

    for (const menu of body.menus) {
      if (!menu.date) continue

      // 기존 레코드 확인
      const existing = await env.DB.prepare(
        'SELECT id FROM weekly_menus WHERE date = ?'
      ).bind(menu.date).first<{ id: string }>()

      if (existing) {
        // UPDATE
        await env.DB.prepare(
          `UPDATE weekly_menus
           SET lunch_a = ?, lunch_b = ?, dinner = ?, pdf_key = COALESCE(?, pdf_key), updated_by = ?
           WHERE id = ?`
        ).bind(
          menu.lunch_a ?? null,
          menu.lunch_b ?? null,
          menu.dinner ?? null,
          body.pdf_key ?? null,
          staffId ?? null,
          existing.id
        ).run()
        results.push({ date: menu.date, id: existing.id })
      } else {
        // INSERT
        const id = nanoid()
        await env.DB.prepare(
          `INSERT INTO weekly_menus (id, date, lunch_a, lunch_b, dinner, pdf_key, updated_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          id,
          menu.date,
          menu.lunch_a ?? null,
          menu.lunch_b ?? null,
          menu.dinner ?? null,
          body.pdf_key ?? null,
          staffId ?? null
        ).run()
        results.push({ date: menu.date, id })
      }
    }

    return Response.json({ success: true, data: results }, { status: 201 })
  } catch (e: any) {
    console.error('menu POST error:', e)
    return Response.json({ success: false, error: e.message ?? '메뉴 등록 실패' }, { status: 500 })
  }
}
