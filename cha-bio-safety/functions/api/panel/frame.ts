import type { Env } from '../../_middleware'
import { assertAgentKey } from '../../_lib/agent'
import { nowKstSql } from '../../utils/kst'

// POST /api/panel/frame — 에이전트 라이브 프레임 업로드 (raw JPEG) → R2 덮어쓰기 + frame_updated_at.
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const bad = assertAgentKey(request, env)
  if (bad) return bad
  try {
    // path traversal 방지: 허용 문자만 (alarms/<id> 슬래시 허용).
    const frameKey = (request.headers.get('X-Frame-Key') || 'latest').replace(/[^A-Za-z0-9/_-]/g, '')
    if (!frameKey || frameKey.includes('..')) {
      return Response.json({ success: false, error: 'invalid frame key' }, { status: 400 })
    }
    const ts = request.headers.get('X-Frame-Ts') || nowKstSql()
    const body = await request.arrayBuffer()
    await env.STORAGE.put(`panel/${frameKey}.jpg`, body, { httpMetadata: { contentType: 'image/jpeg' } })
    await env.DB.prepare("UPDATE panel_agent_status SET frame_updated_at = ? WHERE id = 'agent'").bind(ts).run()
    return Response.json({ success: true, data: { key: `panel/${frameKey}.jpg`, updatedAt: ts } })
  } catch (e) {
    console.error('panel/frame error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}
