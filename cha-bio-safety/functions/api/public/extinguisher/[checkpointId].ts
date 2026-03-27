import type { Env } from '../../../_middleware'

// 공개 API — 인증 불필요 (소화기 점검표 공개 열람용)
export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }

  const checkpointId = params.checkpointId as string

  const cp = await env.DB.prepare(
    'SELECT id, location_no, location, floor, category, description FROM check_points WHERE id=? AND is_active=1'
  ).bind(checkpointId).first<Record<string, unknown>>()

  if (!cp) {
    return Response.json({ success: false, error: '체크포인트를 찾을 수 없습니다' }, { status: 404, headers: cors })
  }

  if (cp.category !== '소화기') {
    return Response.json({ success: false, error: '소화기 체크포인트가 아닙니다' }, { status: 400, headers: cors })
  }

  // 연간 점검 기록 조회 (최근 12개월)
  const records = await env.DB.prepare(`
    SELECT
      cr.id,
      cr.result,
      cr.memo,
      cr.checked_at,
      s.name AS staff_name
    FROM check_records cr
    JOIN inspection_sessions sess ON cr.session_id = sess.id
    JOIN staff s ON cr.staff_id = s.id
    WHERE cr.checkpoint_id = ?
    ORDER BY cr.checked_at DESC
    LIMIT 50
  `).bind(checkpointId).all<Record<string, unknown>>()

  return Response.json({
    success: true,
    data: {
      checkpoint: {
        id: cp.id,
        locationNo: cp.location_no,
        location: cp.location,
        floor: cp.floor,
        description: cp.description,
      },
      records: records.results ?? [],
    }
  }, { headers: cors })
}
