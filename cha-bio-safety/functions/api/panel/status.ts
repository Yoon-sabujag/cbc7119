import type { Env } from '../../_middleware'
import { computeMaint } from '../../_lib/maint'
import { mapAlarmSummary, type AlarmRow } from '../../_lib/alarm'

// KST 벽시계 문자열 → epoch ms.
function parseKstMs(s: string | null): number | null {
  if (!s) return null
  const t = new Date(s.replace(' ', 'T') + '+09:00').getTime()
  return Number.isFinite(t) ? t : null
}

// GET /api/panel/status — 프레시니스+요약+maint+연결감시(lastSeenAt/agentOnline). (JWT)
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const agent = await env.DB.prepare("SELECT * FROM panel_agent_status WHERE id='agent'")
      .first<{ last_seen_at: string | null; frame_updated_at: string | null; agent_version: string | null; watchdog_notified_at: string | null }>()
    const lastSeen = agent?.last_seen_at ?? null
    const lastSeenMs = parseKstMs(lastSeen)
    const agentOnline = lastSeenMs != null && (Date.now() - lastSeenMs) < 180000

    const activeRow = await env.DB.prepare(
      `SELECT * FROM panel_alarms WHERE status IN ('active','acked') ORDER BY (type='fire') DESC, detected_at DESC LIMIT 1`,
    ).first<AlarmRow>()

    const maint = await computeMaint(env)

    return Response.json({
      success: true,
      data: {
        frameUpdatedAt: agent?.frame_updated_at ?? null,
        agentOnline,
        lastHeartbeatAt: lastSeen,
        lastSeenAt: lastSeen,
        activeAlarm: activeRow ? mapAlarmSummary(activeRow) : null,
        maint,
      },
    })
  } catch (e) {
    console.error('panel/status error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}
