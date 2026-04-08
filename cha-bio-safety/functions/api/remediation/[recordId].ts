import type { Env } from '../../_middleware'

// GET /api/remediation/:recordId — 단일 조치 기록 조회
export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  try {
    const { recordId } = params as { recordId: string }

    const record = await env.DB.prepare(`
      SELECT r.id, r.result, r.memo, r.photo_key,
             COALESCE(r.status, 'open') as status,
             r.resolution_memo, r.resolution_photo_key, r.materials_used, r.guide_light_type, r.floor_plan_marker_id, r.location_detail,
             r.resolved_at, r.resolved_by, r.checked_at, r.staff_id,
             cp.category, cp.location, cp.floor, cp.zone,
             s.name AS staff_name,
             rs.name AS resolved_by_name,
             fpm.label AS marker_label
      FROM check_records r
      JOIN check_points cp ON cp.id = r.checkpoint_id
      LEFT JOIN staff s ON s.id = r.staff_id
      LEFT JOIN staff rs ON rs.id = r.resolved_by
      LEFT JOIN floor_plan_markers fpm ON fpm.id = r.floor_plan_marker_id
      WHERE r.id = ?
    `).bind(recordId).first<Record<string, string | null>>()

    if (!record) {
      return Response.json({ success: false, error: '기록 없음' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: {
        id:                   record.id,
        result:               record.result,
        memo:                 record.memo,
        photoKey:             record.photo_key,
        status:               record.status,
        resolutionMemo:       record.resolution_memo,
        resolutionPhotoKey:   record.resolution_photo_key,
        materialsUsed:        record.materials_used,
        guideLightType:       record.guide_light_type,
        markerLabel:          record.marker_label,
        locationDetail:       record.location_detail,
        resolvedAt:           record.resolved_at,
        resolvedBy:           record.resolved_by_name ?? record.resolved_by,
        checkedAt:            record.checked_at,
        staffId:              record.staff_id,
        staffName:            record.staff_name,
        category:             record.category,
        location:             record.location,
        floor:                record.floor,
        zone:                 record.zone,
      },
    })
  } catch (e) {
    console.error('remediation detail error', e)
    return Response.json({ success: false, error: '조회 실패' }, { status: 500 })
  }
}
