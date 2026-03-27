import type { Env } from '../../_middleware'

// GET  /api/div/logs?type=drain|compressor&divId=8-1
// POST /api/div/logs
// DELETE /api/div/logs?id=xxx

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url   = new URL(request.url)
  const type  = url.searchParams.get('type') ?? 'drain'
  const divId = url.searchParams.get('divId')

  const table = type === 'compressor' ? 'div_compressor_log' : 'div_drain_log'

  let query  = `SELECT * FROM ${table} ORDER BY ${type === 'compressor' ? 'action_at' : 'drained_at'} DESC LIMIT 200`
  let params: string[] = []

  if (divId) {
    query  = `SELECT * FROM ${table} WHERE div_id = ? ORDER BY ${type === 'compressor' ? 'action_at' : 'drained_at'} DESC`
    params = [divId]
  }

  const { results } = await env.DB.prepare(query).bind(...params).all()
  return Response.json({ ok: true, logs: results })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json() as {
    type:       'drain' | 'compressor'
    div_id:     string
    date:       string   // YYYY-MM-DD
    action?:    string   // compressor only
    note?:      string
    staff_name?: string
  }

  const id = crypto.randomUUID()

  if (body.type === 'compressor') {
    await env.DB.prepare(`
      INSERT INTO div_compressor_log (id, div_id, action, action_at, note, staff_name, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(id, body.div_id, body.action ?? '오일보충', body.date, body.note ?? null, body.staff_name ?? null).run()
  } else {
    await env.DB.prepare(`
      INSERT INTO div_drain_log (id, div_id, drained_at, note, staff_name, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(id, body.div_id, body.date, body.note ?? null, body.staff_name ?? null).run()
  }

  return Response.json({ ok: true, id })
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const url  = new URL(request.url)
  const id   = url.searchParams.get('id')
  const type = url.searchParams.get('type') ?? 'drain'
  if (!id) return Response.json({ ok: false, error: 'id required' }, { status: 400 })

  const table = type === 'compressor' ? 'div_compressor_log' : 'div_drain_log'
  await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run()
  return Response.json({ ok: true })
}
