// GET /api/extinguishers — 소화기 전체 목록 (필터 지원)
// Phase 24: LEFT JOIN 으로 미배치 자산 포함 + status/mapping 필터 + has_records correlated subquery
import type { Env } from '../../_middleware'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const floor = url.searchParams.get('floor')
  const zone = url.searchParams.get('zone')
  const type = url.searchParams.get('type')
  const search = url.searchParams.get('q')
  const status = url.searchParams.get('status')   // 'active' | '폐기'
  const mapping = url.searchParams.get('mapping') // 'mapped' | 'unmapped' | 'disposed'

  let sql = `SELECT e.*,
    cp.id as cp_id,
    cp.location AS cp_location,
    cp.floor AS cp_floor,
    cp.zone AS cp_zone,
    cp.qr_code AS cp_qr_code,
    (SELECT COUNT(*) FROM check_records cr WHERE cr.extinguisher_id = e.id) > 0 AS has_records
  FROM extinguishers e
  LEFT JOIN check_points cp ON e.check_point_id = cp.id
  WHERE 1=1`
  const params: (string|number)[] = []

  // Phase 24: 매핑된 자산은 cp 가 위치 source — skip_marker 등록 자산은 ext.floor=NULL.
  // COALESCE 로 cp.floor 우선, 없으면 ext.floor (historical, 분리 후 보존) 사용.
  if (floor) { sql += ` AND COALESCE(cp.floor, e.floor) = ?`; params.push(floor) }
  if (zone) {
    // ext.zone 은 한글('연','사','공','지'), cp.zone 은 영문('research','office','common').
    // 사용자 dropdown 은 ext.zone 한글값으로 채움 — cp.zone 을 한글로 매핑해서 비교.
    sql += ` AND COALESCE(
      CASE cp.zone WHEN 'research' THEN '연' WHEN 'office' THEN '사' WHEN 'common' THEN '공' ELSE cp.zone END,
      e.zone
    ) = ?`
    params.push(zone)
  }
  if (type) { sql += ` AND e.type = ?`; params.push(type) }
  if (search) { sql += ` AND (e.serial_no LIKE ? OR e.mgmt_no LIKE ?)`; params.push(`%${search}%`, `%${search}%`) }

  // status 필터 (explicit override)
  if (status) {
    sql += ` AND e.status = ?`; params.push(status)
  }

  // mapping 필터 (exclusive — overrides status if both provided)
  if (mapping === 'mapped') {
    sql += ` AND e.check_point_id IS NOT NULL AND e.status='active'`
  } else if (mapping === 'unmapped') {
    sql += ` AND e.check_point_id IS NULL AND e.status='active'`
  } else if (mapping === 'disposed') {
    sql += ` AND e.status='폐기'`
  }

  sql += ` ORDER BY e.seq_no ASC`

  const { results } = await env.DB.prepare(sql).bind(...params).all()

  // 요약 통계
  const { results: stats } = await env.DB.prepare(
    `SELECT type, COUNT(*) as cnt FROM extinguishers GROUP BY type ORDER BY cnt DESC`
  ).all()

  const { results: zones } = await env.DB.prepare(
    `SELECT DISTINCT zone FROM extinguishers ORDER BY zone`
  ).all()

  const { results: floors } = await env.DB.prepare(
    `SELECT DISTINCT floor FROM extinguishers ORDER BY floor`
  ).all()

  return Response.json({
    success: true,
    data: {
      items: results,
      stats: stats,
      zones: zones.map((z: any) => z.zone),
      floors: floors.map((f: any) => f.floor),
      total: results.length,
    }
  })
}
