import type { Env } from '../../_middleware'
import { mapAlarm, type AlarmRow } from '../../_lib/alarm'

// GET /api/alarm/active — 경보칩/풀스크린용 최신 1건 (fire 우선 서버측 정렬). (JWT)
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const row = await env.DB.prepare(
      `SELECT * FROM panel_alarms WHERE status IN ('active','acked') ORDER BY (type='fire') DESC, detected_at DESC LIMIT 1`,
    ).first<AlarmRow>()
    return Response.json({ success: true, data: row ? mapAlarm(row) : null })
  } catch (e) {
    console.error('alarm/active error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}
