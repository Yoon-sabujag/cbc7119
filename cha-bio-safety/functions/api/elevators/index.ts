// functions/api/elevators/index.ts
import type { Env } from '../../_middleware'

function nanoid(n=21){ const c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; const a=crypto.getRandomValues(new Uint8Array(n)); return Array.from(a,b=>c[b%c.length]).join('') }

// GET /api/elevators — 전체 목록
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const rows = await env.DB.prepare(`
    SELECT e.*,
      (SELECT COUNT(*) FROM elevator_faults f WHERE f.elevator_id=e.id AND f.is_resolved=0) as active_faults,
      (SELECT inspect_date FROM elevator_inspections i WHERE i.elevator_id=e.id ORDER BY inspect_date DESC LIMIT 1) as last_inspect_date
    FROM elevators e
    ORDER BY e.type ASC, e.number ASC
  `).all<Record<string,unknown>>()

  return Response.json({ success: true, data: rows.results ?? [] })
}

// PATCH /api/elevators — 상태 업데이트
export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  const { id, status } = await request.json<{ id: string; status: string }>()
  await env.DB.prepare(
    `UPDATE elevators SET status=?, updated_at=datetime('now') WHERE id=?`
  ).bind(status, id).run()
  return Response.json({ success: true })
}
