import type { Env } from '../../_middleware'
import { assertAgentKey } from '../../_lib/agent'
import { computeMaint } from '../../_lib/maint'
import { pushToWorkingStaff, buildPanelPayload, logTelemetry } from '../../_lib/push'
import { nanoid, LOCATION_LABEL, type AlarmRow } from '../../_lib/alarm'
import { nowKST, nowKstSql } from '../../utils/kst'

interface TriggerBody {
  type: 'fire' | 'equip'
  detectedAt: string
  source?: 'visual' | 'audio'
  snapshotKey?: string
  confidence?: number
  redRatio?: number
  greenRatio?: number
  clientId?: string
}

// POST /api/alarm/trigger — 멱등 dedupe → (fire) 자동초안 → 근무자 1차 push → (fire) 무장.
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const bad = assertAgentKey(request, env)
  if (bad) return bad
  try {
    const body = await request.json<TriggerBody>()
    if (!body.type || !['fire', 'equip'].includes(body.type)) {
      return Response.json({ success: false, error: 'type is fire|equip' }, { status: 400 })
    }
    if (!body.detectedAt) {
      return Response.json({ success: false, error: 'detectedAt required' }, { status: 400 })
    }
    const type = body.type
    // §1.4: 에스컬레이션 대상 = detected_at 시각의 근무자. maint 도 detected_at 기준 평가.
    const parsed = new Date(body.detectedAt.replace(' ', 'T') + 'Z')
    const kst = Number.isNaN(parsed.getTime()) ? nowKST() : parsed
    const dateStr = nowKstSql(kst).slice(0, 10)

    // 1) 점검모드 ON → suppressed 만 기록, 무통지.
    const maint = await computeMaint(env, kst)
    if (maint.enabled) {
      const sid = 'PA-' + nanoid(10)
      await env.DB.prepare(
        `INSERT INTO panel_alarms (id, type, status, detected_at, source, confidence, red_ratio, green_ratio, snapshot_key)
         VALUES (?, ?, 'suppressed', ?, ?, ?, ?, ?, ?)`,
      ).bind(sid, type, body.detectedAt, body.source ?? null, body.confidence ?? null, body.redRatio ?? null, body.greenRatio ?? null, body.snapshotKey ?? null).run()
      return Response.json({ success: true, data: { alarmId: sid, draftRecordId: null, escalation: null, suppressed: true } })
    }

    // 2) 멱등 dedupe — 동일 type active/acked 존재 시 그 행 반환.
    const existing = await env.DB.prepare(
      `SELECT * FROM panel_alarms WHERE type = ? AND status IN ('active','acked') ORDER BY detected_at DESC LIMIT 1`,
    ).bind(type).first<AlarmRow>()
    if (existing) {
      return Response.json({
        success: true,
        data: {
          alarmId: existing.id,
          draftRecordId: existing.draft_record_id,
          escalation: type === 'fire' ? { maxCount: 3, intervalSec: 20 } : null,
        },
      })
    }

    // 3) 신규 active INSERT.
    const alarmId = 'PA-' + nanoid(10)
    await env.DB.prepare(
      `INSERT INTO panel_alarms (id, type, status, detected_at, source, confidence, red_ratio, green_ratio, snapshot_key)
       VALUES (?, ?, 'active', ?, ?, ?, ?, ?, ?)`,
    ).bind(alarmId, type, body.detectedAt, body.source ?? null, body.confidence ?? null, body.redRatio ?? null, body.greenRatio ?? null, body.snapshotKey ?? null).run()

    // fire → 자동초안 (fire_alarm_records, non_fire 기본, created_by='panel-agent').
    let draftRecordId: string | null = null
    if (type === 'fire') {
      draftRecordId = 'FA-' + nanoid(10)
      await env.DB.prepare(
        `INSERT INTO fire_alarm_records (id, type, occurred_at, location, cause, action, created_by)
         VALUES (?, 'non_fire', ?, '', '오작동', '자동복구, 현장확인', 'panel-agent')`,
      ).bind(draftRecordId, body.detectedAt).run()
      await env.DB.prepare('UPDATE panel_alarms SET draft_record_id = ? WHERE id = ?').bind(draftRecordId, alarmId).run()
    }

    // 4) 1차 push (근무자 전원).
    const payload = buildPanelPayload({ alarmType: type, alarmId, location: LOCATION_LABEL, detectedAt: body.detectedAt })
    const sent = await pushToWorkingStaff(env, kst, dateStr, payload)
    await logTelemetry(env, 'panel-trigger', { detail: JSON.stringify({ alarmId, type, sent }) })

    // 5) fire → 무장 (push_count=1, next_push_at=now+20s). equip 은 단발.
    if (type === 'fire') {
      await env.DB.prepare('UPDATE panel_alarms SET push_count = 1, next_push_at = ? WHERE id = ?')
        .bind(Date.now() + 20000, alarmId).run()
    }

    return Response.json({
      success: true,
      data: { alarmId, draftRecordId, escalation: type === 'fire' ? { maxCount: 3, intervalSec: 20 } : null },
    })
  } catch (e) {
    console.error('alarm/trigger error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}
