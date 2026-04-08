import type { Env } from '../../../_middleware'

function nanoid(n=21){ const c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; const a=crypto.getRandomValues(new Uint8Array(n)); return Array.from(a,b=>c[b%c.length]).join('') }

export const onRequestPost: PagesFunction<Env> = async ({ request, env, data, params }) => {
  const { staffId } = data as any
  const { sessionId } = params as { sessionId: string }
  const { checkpointId, result, memo, photoKey } = await request.json<{ checkpointId:string; result:string; memo?:string; photoKey?:string }>()

  try {
    const exists = await env.DB.prepare('SELECT id FROM inspection_sessions WHERE id=? LIMIT 1').bind(sessionId).first()
    if (!exists) return Response.json({ success:false, error:'세션 없음' }, { status:404 })

    const existing = await env.DB.prepare(
      'SELECT id FROM check_records WHERE session_id=? AND checkpoint_id=? LIMIT 1'
    ).bind(sessionId, checkpointId).first<{id:string}>()

    if (existing) {
      await env.DB.prepare(
        `UPDATE check_records SET result=?,memo=?,photo_key=COALESCE(?,photo_key),checked_at=datetime('now','+9 hours') WHERE id=?`
      ).bind(result, memo??null, photoKey??null, existing.id).run()
      return Response.json({ success:true, data:{ id:existing.id, updated:true } })
    }
    const id = nanoid()
    await env.DB.prepare(
      `INSERT INTO check_records (id,session_id,checkpoint_id,staff_id,result,memo,photo_key,checked_at,created_at) VALUES (?,?,?,?,?,?,?,datetime('now','+9 hours'),datetime('now','+9 hours'))`
    ).bind(id, sessionId, checkpointId, staffId, result, memo??null, photoKey??null).run()
    return Response.json({ success:true, data:{ id, created:true } }, { status:201 })
  } catch (e: any) {
    console.error('check_records save error:', e)
    return Response.json({ success:false, error: e.message ?? '저장 오류' }, { status:500 })
  }
}
