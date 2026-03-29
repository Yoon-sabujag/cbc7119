// functions/api/elevators/inspections.ts
import type { Env } from '../../_middleware'

function nanoid(n=21){ const c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; const a=crypto.getRandomValues(new Uint8Array(n)); return Array.from(a,b=>c[b%c.length]).join('') }

// GET /api/elevators/inspections?type=monthly|annual&elevator_id=xxx
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url        = new URL(request.url)
  const elevatorId = url.searchParams.get('elevator_id')
  const type       = url.searchParams.get('type')

  let sql = `
    SELECT i.*, e.location as elevator_location, e.number as elevator_number, e.type as elevator_type
    FROM elevator_inspections i
    JOIN elevators e ON e.id = i.elevator_id
    WHERE 1=1
  `
  const binds: string[] = []
  if (type)       { sql += ' AND i.type=?';        binds.push(type) }
  if (elevatorId) { sql += ' AND i.elevator_id=?'; binds.push(elevatorId) }
  sql += ' ORDER BY i.inspect_date DESC, i.created_at DESC LIMIT 100'

  const stmt = binds.length ? env.DB.prepare(sql).bind(...binds) : env.DB.prepare(sql)
  const rows = await stmt.all<Record<string,unknown>>()
  return Response.json({ success: true, data: rows.results ?? [] })
}

// POST /api/elevators/inspections
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId } = data as any
  const body = await request.json<{
    elevatorId: string
    inspectDate: string
    type: string
    // 점검용 항목 (monthly - 선택적)
    brake?: string
    door?: string
    safetyDevice?: string
    lighting?: string
    emergencyCall?: string
    overall: string
    actionNeeded?: string
    floorOccurred?: string
    memo?: string
  }>()

  const isAnnual = body.type === 'annual'
  const id = nanoid()

  // annual 타입은 brake 등 점검항목 null, overall은 pass/conditional/fail
  // monthly 타입은 brake 등 normal/bad, overall은 normal/caution/bad
  await env.DB.prepare(`
    INSERT INTO elevator_inspections
      (id, elevator_id, inspector_id, inspect_date, type,
       brake, door, safety_device, lighting, emergency_call,
       overall, action_needed, memo)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    id,
    body.elevatorId,
    staffId,
    body.inspectDate,
    body.type,
    isAnnual ? null : (body.brake ?? 'normal'),
    isAnnual ? null : (body.door ?? 'normal'),
    isAnnual ? null : (body.safetyDevice ?? 'normal'),
    isAnnual ? null : (body.lighting ?? 'normal'),
    isAnnual ? null : (body.emergencyCall ?? 'normal'),
    body.overall || (isAnnual ? 'pass' : 'normal'),
    body.actionNeeded ?? null,
    body.memo ?? null
  ).run()

  // 승강기 last_inspection 업데이트
  await env.DB.prepare(
    `UPDATE elevators SET last_inspection=?, updated_at=datetime('now','+9 hours') WHERE id=?`
  ).bind(body.inspectDate, body.elevatorId).run()

  return Response.json({ success: true, data: { id } }, { status: 201 })
}
