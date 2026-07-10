import type { Env } from '../../../_middleware'
import { assertAgentKey } from '../../../_lib/agent'
import { mapAlarm, type AlarmRow } from '../../../_lib/alarm'

// POST /api/alarm/:id/location — 에이전트 OCR 완료 후 위치 patch (push-first: 트리거 시 location=null → 이후 채움).
// X-Agent-Key 인증 (미들웨어 PUBLIC_PATTERN 로 JWT 예외). body {location}. 빈문자열/누락 = null (fail-safe).
export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const bad = assertAgentKey(request, env)
  if (bad) return bad
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  try {
    const body = await request.json<{ location?: string | null }>()
    const location = typeof body.location === 'string' ? body.location.trim() : null
    const row = await env.DB.prepare('SELECT * FROM panel_alarms WHERE id = ?').bind(id).first<AlarmRow>()
    if (!row) return Response.json({ success: false, error: '경보를 찾을 수 없습니다' }, { status: 404 })
    await env.DB.prepare('UPDATE panel_alarms SET location = ? WHERE id = ?').bind(location || null, id).run()
    const updated = await env.DB.prepare('SELECT * FROM panel_alarms WHERE id = ?').bind(id).first<AlarmRow>()
    return Response.json({ success: true, data: updated ? mapAlarm(updated) : null })
  } catch (e) {
    console.error('alarm/location error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}
