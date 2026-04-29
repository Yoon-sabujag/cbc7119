import type { Env } from '../../../_middleware'

function nanoid(n=21){ const c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; const a=crypto.getRandomValues(new Uint8Array(n)); return Array.from(a,b=>c[b%c.length]).join('') }

export const onRequestPost: PagesFunction<Env> = async ({ request, env, data, params }) => {
  const { staffId } = data as any
  const { sessionId } = params as { sessionId: string }
  const { checkpointId, result, memo, photoKey, guide_light_type, floor_plan_marker_id } = await request.json<{ checkpointId:string; result:string; memo?:string; photoKey?:string; guide_light_type?:string; floor_plan_marker_id?:string }>()

  try {
    const exists = await env.DB.prepare('SELECT id FROM inspection_sessions WHERE id=? LIMIT 1').bind(sessionId).first()
    if (!exists) return Response.json({ success:false, error:'세션 없음' }, { status:404 })

    // 유도등은 마커 단위 upsert, 그 외는 checkpoint 단위 upsert
    const cp = await env.DB.prepare(
      'SELECT category FROM check_points WHERE id=? LIMIT 1'
    ).bind(checkpointId).first<{category:string}>()
    const isGuideLight = cp?.category === '유도등'

    if (isGuideLight && floor_plan_marker_id) {
      const existing = await env.DB.prepare(
        'SELECT id FROM check_records WHERE session_id=? AND floor_plan_marker_id=? LIMIT 1'
      ).bind(sessionId, floor_plan_marker_id).first<{id:string}>()
      if (existing) {
        await env.DB.prepare(
          `UPDATE check_records SET result=?,memo=?,photo_key=COALESCE(?,photo_key),guide_light_type=?,checked_at=datetime('now','+9 hours') WHERE id=?`
        ).bind(result, memo??null, photoKey??null, guide_light_type??null, existing.id).run()
        return Response.json({ success:true, data:{ id:existing.id, updated:true } })
      }
    } else if (!isGuideLight) {
      const existing = await env.DB.prepare(
        'SELECT id FROM check_records WHERE session_id=? AND checkpoint_id=? LIMIT 1'
      ).bind(sessionId, checkpointId).first<{id:string}>()

      if (existing) {
        // Phase 24: 소화기 카테고리면 UPDATE 시에도 현재 매핑된 ext_id 스냅샷 갱신
        let extIdForUpdate: number | null = null
        if (cp?.category === '소화기') {
          const currentExt = await env.DB.prepare(
            "SELECT id FROM extinguishers WHERE check_point_id=? AND status='active' LIMIT 1"
          ).bind(checkpointId).first<{id:number}>()
          extIdForUpdate = currentExt?.id ?? null
        }
        await env.DB.prepare(
          `UPDATE check_records SET result=?,memo=?,photo_key=COALESCE(?,photo_key),extinguisher_id=?,checked_at=datetime('now','+9 hours') WHERE id=?`
        ).bind(result, memo??null, photoKey??null, extIdForUpdate, existing.id).run()
        return Response.json({ success:true, data:{ id:existing.id, updated:true } })
      }
    }

    // Phase 24: 소화기 카테고리면 INSERT 직전에 현재 매핑된 active ext_id 를 스냅샷으로 기록.
    // 클라이언트 값은 무시 — race condition 방지를 위해 서버가 직접 SELECT.
    let extinguisherIdSnapshot: number | null = null
    if (cp?.category === '소화기') {
      const currentExt = await env.DB.prepare(
        "SELECT id FROM extinguishers WHERE check_point_id=? AND status='active' LIMIT 1"
      ).bind(checkpointId).first<{id:number}>()
      extinguisherIdSnapshot = currentExt?.id ?? null
    }

    const id = nanoid()
    await env.DB.prepare(
      `INSERT INTO check_records (id,session_id,checkpoint_id,staff_id,result,memo,photo_key,guide_light_type,floor_plan_marker_id,extinguisher_id,checked_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,datetime('now','+9 hours'),datetime('now','+9 hours'))`
    ).bind(id, sessionId, checkpointId, staffId, result, memo??null, photoKey??null, guide_light_type??null, floor_plan_marker_id??null, extinguisherIdSnapshot).run()
    return Response.json({ success:true, data:{ id, created:true } }, { status:201 })
  } catch (e: any) {
    console.error('check_records save error:', e)
    return Response.json({ success:false, error: e.message ?? '저장 오류' }, { status:500 })
  }
}
