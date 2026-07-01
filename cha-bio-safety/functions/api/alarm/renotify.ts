import type { Env } from '../../_middleware'
import { assertAgentKey } from '../../_lib/agent'
import { pushToWorkingStaff, buildPanelPayload, logTelemetry } from '../../_lib/push'
import { LOCATION_LABEL, type AlarmRow } from '../../_lib/alarm'
import { computeMaint } from '../../_lib/maint'
import { nowKST } from '../../utils/kst'

// POST /api/alarm/renotify {alarmId} — 에이전트-티커 재발송 엔진 (Option B, DO 대체).
// 에이전트가 경보 지속(빨강)+미ACK 동안 20초마다 재-POST. 서버가 panel_alarms 상태필드로 authoritative 판정.
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const bad = assertAgentKey(request, env)
  if (bad) return bad
  try {
    const body = await request.json<{ alarmId?: string }>().catch(() => ({}) as { alarmId?: string })
    if (!body.alarmId) return Response.json({ success: false, error: 'alarmId required' }, { status: 400 })

    const row = await env.DB.prepare('SELECT * FROM panel_alarms WHERE id = ?').bind(body.alarmId).first<AlarmRow>()

    // 종료조건(terminal) → done:true (에이전트 티킹 중지). ack/clear/suppress/equip/3회 도달/row 없음.
    const terminal = !row || row.status !== 'active' || row.type !== 'fire' || row.acked_at != null || row.push_count >= 3
    if (terminal) {
      return Response.json({ success: true, data: { pushed: false, pushCount: row?.push_count ?? null, done: true } })
    }

    // 점검모드 ON(경보 중 자동 ON 엣지 포함) → 에스컬레이션 중지 (§1.4). detected_at 시각 기준 평가.
    const detKst = new Date(row.detected_at.replace(' ', 'T') + 'Z')
    const evalDate = Number.isNaN(detKst.getTime()) ? undefined : detKst
    if ((await computeMaint(env, evalDate)).enabled) {
      return Response.json({ success: true, data: { pushed: false, pushCount: row.push_count, done: true } })
    }

    // 타이밍 게이트(20초 미도래 / 에이전트 과속) → done:false (계속 티킹, 20초×3 보장).
    const now = Date.now()
    if (row.next_push_at != null && now < row.next_push_at) {
      return Response.json({ success: true, data: { pushed: false, pushCount: row.push_count, done: false } })
    }

    // 원자 클레임 — 동시 renotify 이중 증가 방지. push_count 는 old 값 기준으로 조건/증가.
    const claim = await env.DB.prepare(
      `UPDATE panel_alarms
       SET push_count = push_count + 1,
           next_push_at = CASE WHEN push_count + 1 < 3 THEN ? ELSE NULL END
       WHERE id = ? AND status = 'active' AND type = 'fire' AND acked_at IS NULL
         AND push_count < 3 AND (next_push_at IS NULL OR next_push_at <= ?)`,
    ).bind(now + 20000, row.id, now).run()
    if (claim.meta.changes !== 1) {
      // 경쟁에서 밀렸거나 그새 부적격 — 현재 상태로 done 판정.
      const cur = await env.DB.prepare('SELECT push_count, status, acked_at FROM panel_alarms WHERE id = ?')
        .bind(row.id).first<{ push_count: number; status: string; acked_at: string | null }>()
      const done = !cur || cur.status !== 'active' || cur.acked_at != null || cur.push_count >= 3
      return Response.json({ success: true, data: { pushed: false, pushCount: cur?.push_count ?? null, done } })
    }

    // 슬롯 확보 → 재발송 (detected_at 시각의 근무자).
    const newCount = row.push_count + 1
    const audienceDate = evalDate ?? nowKST()
    const dateStr = row.detected_at.slice(0, 10)
    const payload = buildPanelPayload({ alarmType: 'fire', alarmId: row.id, location: LOCATION_LABEL, detectedAt: row.detected_at })
    const sent = await pushToWorkingStaff(env, audienceDate, dateStr, payload)
    await logTelemetry(env, 'panel-renotify', { detail: JSON.stringify({ alarmId: row.id, newCount, sent }) })
    return Response.json({ success: true, data: { pushed: true, pushCount: newCount, done: newCount >= 3 } })
  } catch (e) {
    console.error('alarm/renotify error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}
