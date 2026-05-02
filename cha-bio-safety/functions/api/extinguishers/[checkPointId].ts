// GET /api/extinguishers/:checkPointId — 소화기 상세정보 조회
// Phase 24: cp.location 등을 join 으로 노출 — skip_marker 등록 자산은 ext.location 이 NULL이므로 cp_location fallback 필요.
export const onRequestGet: PagesFunction<{ DB: D1Database }> = async ({ params, env }) => {
  const cpId = params.checkPointId as string
  const row = await env.DB.prepare(
    `SELECT e.id, e.mgmt_no, e.zone, e.floor, e.location, e.type, e.approval_no, e.manufactured_at,
            e.manufacturer, e.prefix_code, e.seal_no, e.serial_no, e.note,
            cp.location AS cp_location, cp.floor AS cp_floor, cp.zone AS cp_zone
     FROM extinguishers e
     LEFT JOIN check_points cp ON cp.id = e.check_point_id
     WHERE e.check_point_id = ? AND e.status='active'`
  ).bind(cpId).first()

  if (!row) return Response.json({ success: true, data: null })
  return Response.json({ success: true, data: row })
}
