import type { Env } from '../../../_middleware'

function nanoid(n=21){ const c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; const a=crypto.getRandomValues(new Uint8Array(n)); return Array.from(a,b=>c[b%c.length]).join('') }

// line_results(JSON 배열)에서 worst severity(bad>caution>normal, null 무시)를 계산해 스칼라 result 로 롤업.
// 파싱 실패/빈 배열이면 fallback(클라이언트 result) 유지. 클라이언트 result 를 신뢰하지 않음(T-4kf-01).
function rollupResult(lineResults: string | undefined, fallback: string): string {
  if (!lineResults) return fallback
  try {
    const arr = JSON.parse(lineResults)
    if (!Array.isArray(arr) || arr.length === 0) return fallback
    const rank: Record<string, number> = { normal: 0, caution: 1, bad: 2 }
    let worst = -1
    for (const v of arr) {
      if (v == null) continue
      const r = rank[v as string]
      if (r != null && r > worst) worst = r
    }
    if (worst < 0) return fallback
    return (['normal', 'caution', 'bad'] as const)[worst]
  } catch {
    return fallback
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env, data, params }) => {
  const { staffId } = data as any
  const { sessionId } = params as { sessionId: string }
  const { checkpointId, result, memo, photoKey, guide_light_type, floor_plan_marker_id, line_results, remediation_symbol } = await request.json<{ checkpointId:string; result:string; memo?:string; photoKey?:string; guide_light_type?:string; floor_plan_marker_id?:string; line_results?:string; remediation_symbol?:string }>()

  // [접근불가] 자동 정상처리 memo 는 cron 단독 — 클라이언트 경로 차단 (구 번들 잔존 방어)
  if (memo === '접근불가 개소 자동 정상처리') {
    return Response.json({ success:false, error:'접근불가 자동 처리는 서버 cron 으로만 수행됩니다' }, { status:403 })
  }

  // 서버 worst 롤업: line_results 존재 시 스칼라 result 를 재계산해 덮음(클라이언트 result 불신).
  const finalResult = rollupResult(line_results, result)

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
          `UPDATE check_records SET result=?,memo=?,photo_key=COALESCE(?,photo_key),guide_light_type=?,line_results=?,remediation_symbol=?,checked_at=datetime('now','+9 hours') WHERE id=?`
        ).bind(finalResult, memo??null, photoKey??null, guide_light_type??null, line_results??null, remediation_symbol??null, existing.id).run()
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
          `UPDATE check_records SET result=?,memo=?,photo_key=COALESCE(?,photo_key),extinguisher_id=?,line_results=?,remediation_symbol=?,checked_at=datetime('now','+9 hours') WHERE id=?`
        ).bind(finalResult, memo??null, photoKey??null, extIdForUpdate, line_results??null, remediation_symbol??null, existing.id).run()
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
      `INSERT INTO check_records (id,session_id,checkpoint_id,staff_id,result,memo,photo_key,guide_light_type,floor_plan_marker_id,extinguisher_id,line_results,remediation_symbol,checked_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,datetime('now','+9 hours'),datetime('now','+9 hours'))`
    ).bind(id, sessionId, checkpointId, staffId, finalResult, memo??null, photoKey??null, guide_light_type??null, floor_plan_marker_id??null, extinguisherIdSnapshot, line_results??null, remediation_symbol??null).run()
    return Response.json({ success:true, data:{ id, created:true } }, { status:201 })
  } catch (e: any) {
    console.error('check_records save error:', e)
    return Response.json({ success:false, error: e.message ?? '저장 오류' }, { status:500 })
  }
}
