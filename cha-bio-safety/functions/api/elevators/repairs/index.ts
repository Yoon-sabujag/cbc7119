import type { Env } from '../../../_middleware'

// GET /api/elevators/repairs?elevator_id=&target=&keyword=&ev_type=
// 통합 수리 뷰: elevator_repairs(독립수리) + elevator_faults(고장수리) + elevator_inspection_findings(검사 조치)
export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url)
  const elevatorId = url.searchParams.get('elevator_id')
  const keyword = url.searchParams.get('keyword')
  const evType = url.searchParams.get('ev_type') // elevator | escalator

  try {
    const results: any[] = []

    // ── 1. 독립 수리 (elevator_repairs) ──────────────────────
    {
      let w = '1=1'; const b: string[] = []
      if (elevatorId) { w += ' AND r.elevator_id = ?'; b.push(elevatorId) }
      if (keyword) { w += ' AND (r.repair_item LIKE ? OR r.repair_detail LIKE ? OR r.repair_target LIKE ? OR r.hall_floor LIKE ? OR r.repair_company LIKE ? OR CAST(e.number AS TEXT) LIKE ? OR e.location LIKE ?)'; b.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`) }
      if (evType) { w += evType === 'escalator' ? " AND e.type = 'escalator'" : " AND e.type != 'escalator'" }

      const rows = await env.DB.prepare(`
        SELECT r.*, e.number AS ev_num, e.location AS ev_loc, e.type AS ev_type
        FROM elevator_repairs r LEFT JOIN elevators e ON e.id = r.elevator_id
        WHERE ${w} ORDER BY r.repair_date DESC LIMIT 100
      `).bind(...b).all<any>()

      for (const r of rows.results ?? []) {
        results.push({
          id: `repair-${r.id}`, sourceType: 'standalone', sourceId: r.id,
          elevatorId: r.elevator_id, elevatorNumber: r.ev_num, elevatorLocation: r.ev_loc, elevatorType: r.ev_type,
          date: r.repair_date, target: r.repair_target, hallFloor: r.hall_floor,
          title: r.repair_item, detail: r.repair_detail, company: r.repair_company,
          photos: [r.parts_arrival_photos, r.damaged_parts_photos, r.during_repair_photos, r.completed_photos].filter(Boolean).join(','),
          partsArrivalPhotos: r.parts_arrival_photos, damagedPartsPhotos: r.damaged_parts_photos,
          duringRepairPhotos: r.during_repair_photos, completedPhotos: r.completed_photos,
        })
      }
    }

    // ── 2. 고장 수리 (elevator_faults, resolved) ─────────────
    {
      let w = 'f.is_resolved = 1 AND f.repair_detail IS NOT NULL'; const b: string[] = []
      if (elevatorId) { w += ' AND f.elevator_id = ?'; b.push(elevatorId) }
      if (keyword) { w += ' AND (f.repair_detail LIKE ? OR f.symptoms LIKE ? OR f.repair_company LIKE ? OR CAST(e.number AS TEXT) LIKE ? OR e.location LIKE ?)'; b.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`) }
      if (evType) { w += evType === 'escalator' ? " AND e.type = 'escalator'" : " AND e.type != 'escalator'" }

      const rows = await env.DB.prepare(`
        SELECT f.*, e.number AS ev_num, e.location AS ev_loc, e.type AS ev_type
        FROM elevator_faults f LEFT JOIN elevators e ON e.id = f.elevator_id
        WHERE ${w} ORDER BY f.repaired_at DESC LIMIT 100
      `).bind(...b).all<any>()

      for (const f of rows.results ?? []) {
        results.push({
          id: `fault-${f.id}`, sourceType: 'fault', sourceId: f.id,
          elevatorId: f.elevator_id, elevatorNumber: f.ev_num, elevatorLocation: f.ev_loc, elevatorType: f.ev_type,
          date: (f.repaired_at ?? f.fault_at)?.slice(0, 10), target: null, hallFloor: null,
          title: `고장수리: ${f.symptoms?.slice(0, 40) ?? '증상 미기재'}`,
          detail: f.repair_detail, company: f.repair_company,
          photos: null,
          partsArrivalPhotos: null, damagedPartsPhotos: null, duringRepairPhotos: null, completedPhotos: null,
        })
      }
    }

    // ── 3. 검사 조치 (elevator_inspection_findings, resolved) ──
    {
      let w = "eif.status = 'resolved'"; const b: string[] = []
      if (elevatorId) { w += ' AND ei.elevator_id = ?'; b.push(elevatorId) }
      if (keyword) { w += ' AND (eif.description LIKE ? OR eif.resolution_memo LIKE ? OR CAST(e.number AS TEXT) LIKE ? OR e.location LIKE ?)'; b.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`) }
      if (evType) { w += evType === 'escalator' ? " AND e.type = 'escalator'" : " AND e.type != 'escalator'" }

      const rows = await env.DB.prepare(`
        SELECT eif.*, ei.elevator_id, ei.inspect_date, e.number AS ev_num, e.location AS ev_loc, e.type AS ev_type
        FROM elevator_inspection_findings eif
        JOIN elevator_inspections ei ON ei.id = eif.inspection_id
        LEFT JOIN elevators e ON e.id = ei.elevator_id
        WHERE ${w} ORDER BY eif.resolved_at DESC LIMIT 100
      `).bind(...b).all<any>()

      for (const f of rows.results ?? []) {
        results.push({
          id: `finding-${f.id}`, sourceType: 'annual_finding', sourceId: f.id,
          elevatorId: f.elevator_id, elevatorNumber: f.ev_num, elevatorLocation: f.ev_loc, elevatorType: f.ev_type,
          date: (f.resolved_at ?? f.created_at)?.slice(0, 10), target: null, hallFloor: null,
          title: `검사조치: ${f.description?.slice(0, 40) ?? ''}`,
          detail: f.resolution_memo, company: null,
          photos: f.resolution_photo_key || null,
          partsArrivalPhotos: null, damagedPartsPhotos: null, duringRepairPhotos: null,
          completedPhotos: f.resolution_photo_key || null,
        })
      }
    }

    // ── 4. 점검 조치 (elevator_inspections type='monthly', action_needed 있는 건) ──
    {
      let w = "ei.type = 'monthly' AND ei.action_needed IS NOT NULL AND ei.action_needed != ''"; const b: string[] = []
      if (elevatorId) { w += ' AND ei.elevator_id = ?'; b.push(elevatorId) }
      if (keyword) { w += ' AND (ei.action_needed LIKE ? OR ei.memo LIKE ? OR CAST(e.number AS TEXT) LIKE ? OR e.location LIKE ?)'; b.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`) }
      if (evType) { w += evType === 'escalator' ? " AND e.type = 'escalator'" : " AND e.type != 'escalator'" }

      const rows = await env.DB.prepare(`
        SELECT ei.*, e.number AS ev_num, e.location AS ev_loc, e.type AS ev_type
        FROM elevator_inspections ei
        LEFT JOIN elevators e ON e.id = ei.elevator_id
        WHERE ${w} ORDER BY ei.inspect_date DESC LIMIT 100
      `).bind(...b).all<any>()

      for (const r of rows.results ?? []) {
        results.push({
          id: `inspect-${r.id}`, sourceType: 'inspect', sourceId: r.id,
          elevatorId: r.elevator_id, elevatorNumber: r.ev_num, elevatorLocation: r.ev_loc, elevatorType: r.ev_type,
          date: r.inspect_date, target: null, hallFloor: null,
          title: `점검조치: ${r.action_needed?.slice(0, 40) ?? ''}`,
          detail: r.action_needed, company: null,
          photos: null,
          partsArrivalPhotos: null, damagedPartsPhotos: null, duringRepairPhotos: null, completedPhotos: null,
        })
      }
    }

    // 날짜 내림차순 정렬
    results.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))

    return Response.json({ success: true, data: results.slice(0, 200) })
  } catch (e) {
    console.error('[elevators/repairs GET]', e)
    return Response.json({ success: false, error: '수리 목록 조회 실패' }, { status: 500 })
  }
}

// POST /api/elevators/repairs — 독립 수리 기록만
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data: ctxData }) => {
  const { staffId } = ctxData as any

  let body: any
  try { body = await request.json() } catch {
    return Response.json({ success: false, error: '요청 본문 파싱 실패' }, { status: 400 })
  }

  const { elevatorId, repairDate, repairTarget, hallFloor, repairItem, repairDetail, repairCompany, partsArrivalPhotos, damagedPartsPhotos, duringRepairPhotos, completedPhotos } = body

  if (!elevatorId || !repairDate || !repairTarget || !repairItem?.trim()) {
    return Response.json({ success: false, error: '필수 항목 누락' }, { status: 400 })
  }

  try {
    const row = await env.DB.prepare(`
      INSERT INTO elevator_repairs (elevator_id, repair_date, repair_target, hall_floor, repair_item, repair_detail, repair_company, source, parts_arrival_photos, damaged_parts_photos, during_repair_photos, completed_photos, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'standalone', ?, ?, ?, ?, ?)
      RETURNING id
    `).bind(
      elevatorId, repairDate, repairTarget,
      hallFloor ?? null, repairItem.trim(), repairDetail?.trim() ?? null,
      repairCompany?.trim() ?? null,
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

// DELETE /api/elevators/repairs?id= — 독립 수리만 삭제 가능
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
