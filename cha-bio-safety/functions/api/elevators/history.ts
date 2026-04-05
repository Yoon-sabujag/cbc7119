// functions/api/elevators/history.ts
import type { Env } from '../../_middleware'

// GET /api/elevators/history?elevator_id=EV-04&from=2026-01-01&to=2026-03-19
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const url        = new URL(request.url)
    const elevatorId = url.searchParams.get('elevator_id') ?? ''
    const from       = url.searchParams.get('from') ?? ''
    const to         = url.searchParams.get('to')   ?? ''

    if (!elevatorId) return Response.json({ success:false, error:'elevator_id 필요' }, { status:400 })

    const result: any[] = []

    // ── 1. 고장 이력 ──────────────────────────────────────
    const faultRows = await env.DB.prepare(`
      SELECT id, fault_at as date, symptoms, repair_detail, repaired_at, is_resolved
      FROM elevator_faults
      WHERE elevator_id = ?
        AND date(fault_at) BETWEEN ? AND ?
      ORDER BY fault_at DESC
    `).bind(elevatorId, from, to).all<any>()

    for (const f of (faultRows.results ?? [])) {
      // 발생층 파싱 [7F] 증상
      const floorMatch = f.symptoms?.match(/^\[([^\]]+)\]/)
      const floor      = floorMatch ? floorMatch[1] : undefined
      const summary    = f.symptoms?.replace(/^\[[^\]]+\]\s*/, '').replace(/\[승객탑승\]\s*/, '') ?? ''

      // 고장 항목
      result.push({
        id:          `fault-${f.id}`,
        kind:        'fault',
        date:        f.date,
        floor,
        summary,
        is_resolved: f.is_resolved,
      })

      // 수리 완료된 경우 수리 이력도 추가
      if (f.is_resolved && f.repair_detail) {
        result.push({
          id:      `repair-${f.id}`,
          kind:    'repair',
          date:    f.repaired_at?.slice(0,10) ?? f.date.slice(0,10),
          floor,
          summary: f.repair_detail,
        })
      }
    }

    // ── 2. 점검 이력 (monthly) ────────────────────────────
    const inspectRows = await env.DB.prepare(`
      SELECT id, inspect_date as date, overall, action_needed,
             brake, door, safety_device, lighting, emergency_call
      FROM elevator_inspections
      WHERE elevator_id = ?
        AND type = 'monthly'
        AND date(inspect_date) BETWEEN ? AND ?
      ORDER BY inspect_date DESC
    `).bind(elevatorId, from, to).all<any>()

    for (const i of (inspectRows.results ?? [])) {
      // action_needed에서 층 파싱 [7F] 내용
      const floorMatch = i.action_needed?.match(/^\[([^\]]+)\]/)
      const floor      = floorMatch ? floorMatch[1] : undefined
      const action     = i.action_needed?.replace(/^\[[^\]]+\]\s*/, '') ?? ''

      // 불량 점검항목 추출
      const badItems: string[] = []
      const checkMap: Record<string,string> = {
        brake:'brake', door:'door', safety_device:'safety_device',
        lighting:'lighting', emergency_call:'emergency_call'
      }
      for (const [key] of Object.entries(checkMap)) {
        if (i[key] === 'bad') badItems.push(key)
      }

      // 점검 전체 요약
      const overallLabel = i.overall === 'normal' ? '이상없음'
                         : i.overall === 'caution' ? '주의'
                         : i.overall === 'bad' ? '불량' : i.overall

      if (badItems.length > 0) {
        // 불량항목별로 개별 기록
        for (const item of badItems) {
          result.push({
            id:         `inspect-${i.id}-${item}`,
            kind:       'inspect',
            date:       i.date,
            floor,
            summary:    action || `${overallLabel} - ${item} 불량`,
            check_item: item,
          })
        }
      } else {
        result.push({
          id:      `inspect-${i.id}`,
          kind:    'inspect',
          date:    i.date,
          floor,
          summary: action || overallLabel,
        })
      }
    }

    // ── 3. 검사 이력 (annual) ─────────────────────────────
    const annualRows = await env.DB.prepare(`
      SELECT id, inspect_date as date, overall, action_needed, inspect_type
      FROM elevator_inspections
      WHERE elevator_id = ?
        AND type = 'annual'
        AND date(inspect_date) BETWEEN ? AND ?
      ORDER BY inspect_date DESC
    `).bind(elevatorId, from, to).all<any>()

    const inspTypeLabel: Record<string,string> = { regular:'정기검사', special:'수시검사', detailed:'정밀안전검사' }
    for (const a of (annualRows.results ?? [])) {
      const overallLabel = a.overall === 'pass' ? '합격'
                         : a.overall === 'conditional' ? '조건부합격'
                         : a.overall === 'fail' ? '불합격' : a.overall
      const typeName = a.inspect_type ? (inspTypeLabel[a.inspect_type] ?? a.inspect_type) : '정기검사'
      result.push({
        id:      `annual-${a.id}`,
        kind:    'annual',
        date:    a.date,
        summary: `${typeName} ${overallLabel}`,
        detail:  a.action_needed ?? undefined,
      })
    }

    // 날짜 내림차순 정렬
    result.sort((a,b) => b.date.localeCompare(a.date))

    return Response.json({ success: true, data: result })
  } catch (e) {
    console.error('ev history error:', e)
    return Response.json({ success:false, error:'서버 오류' }, { status:500 })
  }
}
