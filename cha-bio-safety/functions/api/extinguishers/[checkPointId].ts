// GET /api/extinguishers/:checkPointId — 소화기 상세정보 조회
export const onRequestGet: PagesFunction<{ DB: D1Database }> = async ({ params, env }) => {
  const cpId = params.checkPointId as string
  const row = await env.DB.prepare(
    `SELECT mgmt_no, zone, floor, location, type, approval_no, manufactured_at, manufacturer, prefix_code, seal_no, serial_no, note
     FROM extinguishers WHERE check_point_id = ?`
  ).bind(cpId).first()

  if (!row) return Response.json({ success: true, data: null })
  return Response.json({ success: true, data: row })
}
