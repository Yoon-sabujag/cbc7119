import type { Env } from '../../_middleware'
import { assertAgentKey } from '../../_lib/agent'

// POST /api/alarm/heartbeat — 1분 연결 감시. last_seen_at/agent_version 갱신 + watchdog_notified_at 리셋.
// (프로액티브 '모니터링 중단' push 는 prod cbc-cron-worker 이연 — staging 은 status 조회로만 표시.)
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const bad = assertAgentKey(request, env)
  if (bad) return bad
  try {
    const body = await request.json<{ at?: string; agentVersion?: string; frameTs?: string }>().catch(() => ({}) as { at?: string; agentVersion?: string })
    await env.DB.prepare(
      "UPDATE panel_agent_status SET last_seen_at=?, agent_version=?, watchdog_notified_at=NULL WHERE id='agent'",
    ).bind(body.at ?? null, body.agentVersion ?? null).run()
    return Response.json({ success: true })
  } catch (e) {
    console.error('alarm/heartbeat error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}
