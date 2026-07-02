import type { Env } from '../../_middleware'
import { assertAgentKey } from '../../_lib/agent'
import { nowKstSql } from '../../utils/kst'

// POST /api/alarm/clear — 수신반 리셋(경보→정상). active/acked → cleared+agent_reset, 에스컬레이션 중지(next_push_at=NULL).
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const bad = assertAgentKey(request, env)
  if (bad) return bad
  try {
    const body = await request.json<{ type?: 'fire' | 'equip' | 'fault'; at?: string }>().catch(() => ({}) as { type?: 'fire' | 'equip' | 'fault'; at?: string })
    const at = body.at || nowKstSql()
    const stmt = body.type
      ? env.DB.prepare(
          `UPDATE panel_alarms SET status='cleared', cleared_reason='agent_reset', cleared_at=?, next_push_at=NULL
           WHERE status IN ('active','acked') AND type=?`,
        ).bind(at, body.type)
      : env.DB.prepare(
          `UPDATE panel_alarms SET status='cleared', cleared_reason='agent_reset', cleared_at=?, next_push_at=NULL
           WHERE status IN ('active','acked')`,
        ).bind(at)
    await stmt.run()
    return Response.json({ success: true })
  } catch (e) {
    console.error('alarm/clear error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}
