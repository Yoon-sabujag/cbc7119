import type { Env } from '../../_middleware'
import { mapAlarm, type AlarmRow } from '../../_lib/alarm'

// GET /api/alarm/events?hours=48 — detected_at DESC. 점검모드에서도 조회 가능(gate 없음, suppressed 포함). (JWT)
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const url = new URL(request.url)
    const raw = parseInt(url.searchParams.get('hours') || '48', 10)
    const hours = Math.min(Math.max(Number.isFinite(raw) ? raw : 48, 1), 720)
    const rows = await env.DB.prepare(
      // detected_at 은 KST 벽시계 → 임계값도 KST(now+9h)로 계산해야 창이 정확 (status.ts 와 대칭).
      `SELECT * FROM panel_alarms WHERE datetime(detected_at) >= datetime('now', '+9 hours', ?) ORDER BY detected_at DESC`,
    ).bind(`-${hours} hours`).all<AlarmRow>()
    return Response.json({ success: true, data: (rows.results ?? []).map(mapAlarm) })
  } catch (e) {
    console.error('alarm/events error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}
