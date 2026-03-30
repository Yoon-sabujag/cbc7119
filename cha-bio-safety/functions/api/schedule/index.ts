import type { Env } from '../../_middleware'

function nanoid(n=21){ const c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; const a=crypto.getRandomValues(new Uint8Array(n)); return Array.from(a,b=>c[b%c.length]).join('') }

// GET /api/schedule?date=YYYY-MM-DD  또는  ?month=YYYY-MM (월간)
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url   = new URL(request.url)
  const date  = url.searchParams.get('date')
  const month = url.searchParams.get('month')

  let sql   = 'SELECT * FROM schedule_items WHERE 1=1'
  const binds: string[] = []

  if (date) {
    sql += ' AND date=?'; binds.push(date)
  } else if (month) {
    sql += ' AND date LIKE ?'; binds.push(`${month}%`)
  }
  sql += ' ORDER BY date ASC, CASE WHEN time IS NULL THEN 1 ELSE 0 END, time ASC'

  let stmt = env.DB.prepare(sql)
  if (binds.length === 1) stmt = stmt.bind(binds[0])
  else if (binds.length === 2) stmt = stmt.bind(binds[0], binds[1])

  const CATEGORY_ALIAS: Record<string, string> = { '방화문': '특별피난계단', '컴프레셔': 'DIV' }

  const result = await stmt.all<Record<string,unknown>>()
  const rows = await Promise.all((result.results ?? []).map(async (r: any) => {
    let status = r.status as string

    // inspect 카테고리: 점검 기록 기반 완료 판정 (대시보드와 동일 로직)
    if (r.category === 'inspect' && r.inspection_category && status !== 'done') {
      const cpCat = CATEGORY_ALIAS[r.inspection_category] ?? r.inspection_category
      const nextSched = await env.DB.prepare(
        `SELECT date FROM schedule_items WHERE date > ? AND category='inspect' AND inspection_category=? ORDER BY date ASC LIMIT 1`
      ).bind(r.date, r.inspection_category).first<{date:string}>()

      let rec
      if (nextSched?.date) {
        rec = await env.DB.prepare(
          `SELECT 1 FROM check_records cr JOIN check_points cp ON cr.checkpoint_id=cp.id WHERE cp.category=? AND date(cr.checked_at)>=? AND date(cr.checked_at)<? AND cr.result IN ('normal','caution') LIMIT 1`
        ).bind(cpCat, r.date, nextSched.date).first()
      } else {
        rec = await env.DB.prepare(
          `SELECT 1 FROM check_records cr JOIN check_points cp ON cr.checkpoint_id=cp.id WHERE cp.category=? AND date(cr.checked_at)>=? AND cr.result IN ('normal','caution') LIMIT 1`
        ).bind(cpCat, r.date).first()
      }
      if (rec) status = 'done'
    }

    return {
      id:                  r.id,
      title:               r.title,
      date:                r.date,
      time:                r.time ?? undefined,
      assigneeId:          r.assignee_id,
      category:            r.category,
      status,
      repeatRule:          r.repeat_rule ?? undefined,
      inspectionCategory:  r.inspection_category ?? undefined,
      memo:                r.memo ?? undefined,
    }
  }))
  return Response.json({ success: true, data: rows })
}

// POST /api/schedule
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId } = data as any
  const body = await request.json<{
    title: string
    date: string
    time?: string
    category: string
    assigneeId?: string
    inspectionCategory?: string
    memo?: string
  }>()

  if (!body.title?.trim() || !body.date || !body.category) {
    return Response.json({ success: false, error: '필수 항목 누락' }, { status: 400 })
  }

  const id = 'SCH-' + nanoid(8)
  await env.DB.prepare(`
    INSERT INTO schedule_items (id, title, date, time, assignee_id, category, status, inspection_category, memo)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `).bind(
    id,
    body.title.trim(),
    body.date,
    body.time ?? null,
    body.assigneeId ?? staffId,
    body.category,
    body.inspectionCategory ?? null,
    body.memo ?? null,
  ).run()

  return Response.json({ success: true, data: { id } }, { status: 201 })
}
