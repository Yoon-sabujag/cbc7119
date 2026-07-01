import type { Env } from '../../_middleware'
import { computeMaint, setManualOverride } from '../../_lib/maint'
import { type AlarmRow } from '../../_lib/alarm'
import { nowKstSql } from '../../utils/kst'

// GET /api/panel/maint — 온디맨드 계산 상태. (JWT)
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    return Response.json({ success: true, data: await computeMaint(env) })
  } catch (e) {
    console.error('panel/maint GET error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}

// PUT /api/panel/maint {enabled, reason?, confirmAlarm?} — 수동 override. 경보중 ON 은 confirmAlarm 엣지(§1.5). (JWT)
export const onRequestPut: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx
  const staffId = (ctx as unknown as { data?: { staffId?: string } }).data?.staffId ?? ''
  try {
    const body = await request.json<{ enabled: boolean; reason?: string; confirmAlarm?: boolean }>()
    if (body.enabled === true) {
      const activeRow = await env.DB.prepare(
        `SELECT * FROM panel_alarms WHERE status IN ('active','acked') ORDER BY (type='fire') DESC, detected_at DESC LIMIT 1`,
      ).first<AlarmRow>()
      if (activeRow && !body.confirmAlarm) {
        return Response.json({ success: false, error: 'active_alarm_requires_confirm' }, { status: 409 })
      }
      if (activeRow && body.confirmAlarm) {
        const at = nowKstSql()
        await env.DB.prepare('UPDATE panel_alarms SET next_push_at=NULL WHERE id=?').bind(activeRow.id).run()
        await env.DB.prepare("UPDATE panel_alarms SET status='cleared', cleared_reason='maint', cleared_at=? WHERE id=?").bind(at, activeRow.id).run()
        if (activeRow.draft_record_id) {
          // 미저장 자동초안 폐기 (active 경보 존재 = 초안 미저장).
          await env.DB.prepare("DELETE FROM fire_alarm_records WHERE id=? AND created_by='panel-agent'").bind(activeRow.draft_record_id).run()
          await env.DB.prepare('UPDATE panel_alarms SET draft_record_id=NULL WHERE id=?').bind(activeRow.id).run()
        }
      }
      await setManualOverride(env, { enabled: true, reason: body.reason, staffId })
    } else {
      await setManualOverride(env, { enabled: false, reason: body.reason, staffId })
    }
    return Response.json({ success: true, data: await computeMaint(env) })
  } catch (e) {
    console.error('panel/maint PUT error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}
