// functions/api/elevators/faults.ts
import type { Env } from '../../_middleware'

function nanoid(n=21){ const c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; const a=crypto.getRandomValues(new Uint8Array(n)); return Array.from(a,b=>c[b%c.length]).join('') }

// GET /api/elevators/faults?elevator_id=xxx&unresolved=1
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url        = new URL(request.url)
  const elevatorId = url.searchParams.get('elevator_id')
  const unresolved = url.searchParams.get('unresolved')

  let sql = `
    SELECT f.*, s.name as reporter_name, e.location as elevator_location, e.number as elevator_number, e.type as elevator_type
    FROM elevator_faults f
    JOIN staff s ON s.id = f.reported_by
    JOIN elevators e ON e.id = f.elevator_id
    WHERE 1=1
  `
  const binds: (string | number)[] = []
  if (elevatorId) { sql += ' AND f.elevator_id=?'; binds.push(elevatorId) }
  if (unresolved === '1') { sql += ' AND f.is_resolved=0' }
  sql += ' ORDER BY f.fault_at DESC LIMIT 50'

  const stmt = binds.length ? env.DB.prepare(sql).bind(...binds) : env.DB.prepare(sql)
  const rows = await stmt.all<Record<string,unknown>>()
  return Response.json({ success: true, data: rows.results ?? [] })
}

// POST /api/elevators/faults — 고장 접수
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId } = data as any
  const body = await request.json<{
    elevatorId: string
    faultAt: string
    symptoms: string
    repairCompany?: string
    repairedAt?: string
    repairDetail?: string
    isResolved?: boolean
  }>()

  const id = nanoid()
  await env.DB.prepare(`
    INSERT INTO elevator_faults
      (id, elevator_id, reported_by, fault_at, symptoms, repair_company, repaired_at, repair_detail, is_resolved)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).bind(
    id, body.elevatorId, staffId, body.faultAt, body.symptoms,
    body.repairCompany ?? null, body.repairedAt ?? null, body.repairDetail ?? null,
    body.isResolved ? 1 : 0
  ).run()

  // 고장 시 승강기 상태 fault로 업데이트
  if (!body.isResolved) {
    await env.DB.prepare(
      `UPDATE elevators SET status='fault', updated_at=datetime('now','+9 hours') WHERE id=?`
    ).bind(body.elevatorId).run()
  }

  return Response.json({ success: true, data: { id } }, { status: 201 })
}

// PATCH /api/elevators/faults — 고장 수리 완료 처리
export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json<{
    id: string
    repairCompany?: string
    repairedAt: string
    repairDetail: string
  }>()

  await env.DB.prepare(`
    UPDATE elevator_faults
    SET is_resolved=1, repair_company=?, repaired_at=?, repair_detail=?
    WHERE id=?
  `).bind(body.repairCompany ?? null, body.repairedAt, body.repairDetail, body.id).run()

  // 해당 승강기의 미해결 고장이 없으면 normal로 복구
  const fault = await env.DB.prepare(
    `SELECT elevator_id FROM elevator_faults WHERE id=?`
  ).bind(body.id).first<{ elevator_id: string }>()

  if (fault) {
    const remaining = await env.DB.prepare(
      `SELECT COUNT(*) as n FROM elevator_faults WHERE elevator_id=? AND is_resolved=0`
    ).bind(fault.elevator_id).first<{ n: number }>()

    if ((remaining?.n ?? 0) === 0) {
      await env.DB.prepare(
        `UPDATE elevators SET status='normal', updated_at=datetime('now','+9 hours') WHERE id=?`
      ).bind(fault.elevator_id).run()
    }
  }

  return Response.json({ success: true })
}
