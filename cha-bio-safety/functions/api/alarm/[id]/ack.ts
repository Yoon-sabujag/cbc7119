import type { Env } from '../../../_middleware'
import { mapAlarm, type AlarmRow } from '../../../_lib/alarm'
import { nowKstSql } from '../../../utils/kst'

// POST /api/alarm/:id/ack — status→acked, acked_by(JWT staffId), acked_at, 에스컬레이션 즉시 중지(next_push_at=NULL).
// 이미 acked/cleared/suppressed 면 멱등. 근무자 누구나. (JWT)
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { env, params } = ctx
  const staffId = (ctx as unknown as { data?: { staffId?: string } }).data?.staffId
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  try {
    const row = await env.DB.prepare('SELECT * FROM panel_alarms WHERE id = ?').bind(id).first<AlarmRow>()
    if (!row) return Response.json({ success: false, error: '경보를 찾을 수 없습니다' }, { status: 404 })
    if (row.status === 'acked' || row.status === 'cleared' || row.status === 'suppressed') {
      return Response.json({ success: true, data: mapAlarm(row) }) // 멱등
    }
    await env.DB.prepare(
      "UPDATE panel_alarms SET status='acked', acked_by=?, acked_at=?, next_push_at=NULL WHERE id=?",
    ).bind(staffId ?? null, nowKstSql(), id).run()
    const updated = await env.DB.prepare('SELECT * FROM panel_alarms WHERE id = ?').bind(id).first<AlarmRow>()
    return Response.json({ success: true, data: updated ? mapAlarm(updated) : null })
  } catch (e) {
    console.error('alarm/ack error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}
