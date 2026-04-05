import type { Env } from '../../../_middleware'

// GET /api/elevators/repairs?elevator_id=&target=&keyword=&from=&to=
export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url)
  const elevatorId = url.searchParams.get('elevator_id')
  const target = url.searchParams.get('target')
  const keyword = url.searchParams.get('keyword')
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')

  try {
    let where = '1=1'
    const binds: string[] = []

    if (elevatorId) { where += ' AND r.elevator_id = ?'; binds.push(elevatorId) }
    if (target) { where += ' AND r.repair_target = ?'; binds.push(target) }
    if (keyword) { where += ' AND (r.repair_item LIKE ? OR r.repair_detail LIKE ?)'; binds.push(`%${keyword}%`, `%${keyword}%`) }
    if (from) { where += ' AND r.repair_date >= ?'; binds.push(from) }
    if (to) { where += ' AND r.repair_date <= ?'; binds.push(to) }

    const rows = await env.DB.prepare(`
      SELECT r.*, e.number AS elevator_number, e.location AS elevator_location, e.type AS elevator_type
      FROM elevator_repairs r
      LEFT JOIN elevators e ON e.id = r.elevator_id
      WHERE ${where}
      ORDER BY r.repair_date DESC
      LIMIT 200
    `).bind(...binds).all<any>()

    const data = (rows.results ?? []).map(r => ({
      id: r.id,
      elevatorId: r.elevator_id,
      elevatorNumber: r.elevator_number,
      elevatorLocation: r.elevator_location,
      elevatorType: r.elevator_type,
      repairDate: r.repair_date,
      repairTarget: r.repair_target,
      hallFloor: r.hall_floor,
      repairItem: r.repair_item,
      repairDetail: r.repair_detail,
      repairCompany: r.repair_company,
      source: r.source,
      sourceId: r.source_id,
      partsArrivalPhotos: r.parts_arrival_photos || null,
      damagedPartsPhotos: r.damaged_parts_photos || null,
      duringRepairPhotos: r.during_repair_photos || null,
      completedPhotos: r.completed_photos || null,
      createdBy: r.created_by,
      createdAt: r.created_at,
    }))

    return Response.json({ success: true, data })
  } catch (e) {
    console.error('[elevators/repairs GET]', e)
    return Response.json({ success: false, error: '수리 목록 조회 실패' }, { status: 500 })
  }
}

// POST /api/elevators/repairs
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data: ctxData }) => {
  const { staffId } = ctxData as any

  let body: any
  try { body = await request.json() } catch {
    return Response.json({ success: false, error: '요청 본문 파싱 실패' }, { status: 400 })
  }

  const { elevatorId, repairDate, repairTarget, hallFloor, repairItem, repairDetail, repairCompany, source, sourceId, partsArrivalPhotos, damagedPartsPhotos, duringRepairPhotos, completedPhotos } = body

  if (!elevatorId || !repairDate || !repairTarget || !repairItem?.trim()) {
    return Response.json({ success: false, error: '필수 항목 누락' }, { status: 400 })
  }

  try {
    const row = await env.DB.prepare(`
      INSERT INTO elevator_repairs (elevator_id, repair_date, repair_target, hall_floor, repair_item, repair_detail, repair_company, source, source_id, parts_arrival_photos, damaged_parts_photos, during_repair_photos, completed_photos, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id
    `).bind(
      elevatorId, repairDate, repairTarget,
      hallFloor ?? null, repairItem.trim(), repairDetail?.trim() ?? null,
      repairCompany?.trim() ?? null,
      source ?? 'standalone', sourceId ?? null,
      partsArrivalPhotos ?? null, damagedPartsPhotos ?? null,
      duringRepairPhotos ?? null, completedPhotos ?? null,
      staffId
    ).first<{ id: string }>()

    return Response.json({ success: true, data: { id: row?.id } }, { status: 201 })
  } catch (e) {
    console.error('[elevators/repairs POST]', e)
    return Response.json({ success: false, error: '수리 기록 저장 실패' }, { status: 500 })
  }
}

// DELETE /api/elevators/repairs?id=
export const onRequestDelete: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return Response.json({ success: false, error: 'id 필수' }, { status: 400 })

  try {
    await env.DB.prepare('DELETE FROM elevator_repairs WHERE id = ?').bind(id).run()
    return Response.json({ success: true })
  } catch (e) {
    console.error('[elevators/repairs DELETE]', e)
    return Response.json({ success: false, error: '삭제 실패' }, { status: 500 })
  }
}
