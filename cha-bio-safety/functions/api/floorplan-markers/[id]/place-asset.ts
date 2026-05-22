// POST /api/floorplan-markers/:id/place-asset — marker 에 자산 배치 (cp 자동 생성 + ext 매핑 + marker update)
//
// Phase 24 placing flow:
// 1) marker GET (label/floor/zone 가 cp 의 location/floor/zone 으로 사용됨)
// 2) cp 존재 시 재사용, 없으면 새 cp 생성 (CP-FE-XXXX)
// 3) ext UPDATE check_point_id=cpId
// 4) marker UPDATE check_point_id=cpId
//
// 자산-위치 분리 디자인 보존: 빈 마커는 cp 없음 → 점검 대상에 노출 X. 자산 배치 시점에만 cp 생성.
import type { Env } from '../../../_middleware'

export const onRequestPost: PagesFunction<Env> = async ({ request, params, env }) => {
  try {
    const markerId = params.id as string
    const body = await request.json<{ extinguisher_id: number }>()

    if (!body.extinguisher_id) {
      return Response.json({ success: false, error: 'extinguisher_id 필수' }, { status: 400 })
    }

    // 1) marker fetch
    const marker = await env.DB.prepare(
      `SELECT id, floor, zone, label, plan_type, marker_type, check_point_id FROM floor_plan_markers WHERE id = ?`
    ).bind(markerId).first<{
      id: string; floor: string; zone: string | null; label: string | null;
      plan_type: string; marker_type: string | null; check_point_id: string | null;
    }>()

    if (!marker) return Response.json({ success: false, error: '마커를 찾을 수 없습니다' }, { status: 404 })
    if (marker.plan_type !== 'extinguisher') return Response.json({ success: false, error: '소화기 마커가 아닙니다' }, { status: 400 })

    // 2) cp 결정: 기존 cp_id 가 있으면 재사용, 없으면 새 cp 생성.
    let cpId = marker.check_point_id
    if (!cpId) {
      const maxRow = await env.DB.prepare(
        `SELECT id FROM check_points WHERE id LIKE 'CP-FE-%' ORDER BY id DESC LIMIT 1`
      ).first<{ id: string }>()
      const maxSeq = maxRow?.id ? parseInt(maxRow.id.split('-').pop()!, 10) || 0 : 0
      cpId = `CP-FE-${String(maxSeq + 1).padStart(4, '0')}`

      const zoneEnMap: Record<string, string> = { '연': 'research', '사': 'office', '지': 'basement' }
      const zoneEn = marker.zone ? (zoneEnMap[marker.zone] ?? marker.zone) : null
      const location = marker.label ?? cpId
      // qr_code 는 NOT NULL UNIQUE — placeholder 로 cpId 재사용 (실 QR 발급 시 cp 페이지에서 update).
      // 이전엔 '' 으로 INSERT 했으나 두 번째 마커 배치부터 UNIQUE 충돌로 500 발생 (5-22 사고).
      const qrPlaceholder = cpId

      await env.DB.batch([
        env.DB.prepare(
          `INSERT INTO check_points (id, qr_code, floor, zone, location, location_no, category)
           VALUES (?, ?, ?, ?, ?, ?, '소화기')`
        ).bind(cpId, qrPlaceholder, marker.floor, zoneEn, location, location),
        env.DB.prepare(
          `UPDATE floor_plan_markers SET check_point_id = ?, updated_at = datetime('now') WHERE id = ?`
        ).bind(cpId, markerId),
      ])
    }

    // 3) ext UPDATE — check_point_id=cpId. status='active' 강제 (재배치 시 폐기 자산 보호).
    // 충돌 가드: 이미 다른 active 자산이 cp 에 매핑되어 있으면 409.
    const occupant = await env.DB.prepare(
      `SELECT id FROM extinguishers WHERE check_point_id = ? AND status='active' AND id != ?`
    ).bind(cpId, body.extinguisher_id).first<{ id: number }>()
    if (occupant) {
      return Response.json({
        success: false, error: '이미 다른 소화기가 배치된 위치입니다',
        hint: 'swap', occupantId: occupant.id,
      }, { status: 409 })
    }

    await env.DB.prepare(
      `UPDATE extinguishers SET check_point_id = ?, updated_at = datetime('now','+9 hours') WHERE id = ? AND status='active'`
    ).bind(cpId, body.extinguisher_id).run()

    return Response.json({ success: true, data: { check_point_id: cpId } })
  } catch (e: any) {
    console.error('[place-asset POST]', e)
    return Response.json({ success: false, error: e?.message ?? '배치 실패' }, { status: 500 })
  }
}
