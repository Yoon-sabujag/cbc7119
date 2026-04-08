import type { Env } from '../../_middleware'

function nanoid(n=21){ const c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; const a=crypto.getRandomValues(new Uint8Array(n)); return Array.from(a,b=>c[b%c.length]).join('') }

export const onRequestGet: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId } = data as any
  const date = new URL(request.url).searchParams.get('date') ?? new Date().toISOString().slice(0,10)
  const rows = await env.DB.prepare(
    `SELECT s.*, COUNT(r.id) as record_count FROM inspection_sessions s LEFT JOIN check_records r ON r.session_id=s.id WHERE s.date=? AND s.staff_id=? GROUP BY s.id ORDER BY s.created_at DESC`
  ).bind(date, staffId).all()
  return Response.json({ success:true, data: rows.results ?? [] })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId } = data as any
  const { date, floor, zone } = await request.json<{ date:string; floor?:string; zone?:string }>()
  const id = nanoid()
  await env.DB.prepare(
    `INSERT INTO inspection_sessions (id,date,staff_id,floor,zone,created_at) VALUES (?,?,?,?,?,datetime('now','+9 hours'))`
  ).bind(id, date, staffId, floor??null, zone??null).run()
  return Response.json({ success:true, data:{ id, date, staffId } }, { status:201 })
}
