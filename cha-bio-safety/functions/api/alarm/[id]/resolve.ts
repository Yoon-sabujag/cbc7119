import type { Env } from '../../../_middleware'
import { mapAlarm, type AlarmRow } from '../../../_lib/alarm'
import { nowKstSql } from '../../../utils/kst'

// POST /api/alarm/:id/resolve — 자동초안 조치완료+저장 → 칩 소멸(§2.3). (JWT)
// 자동초안(draft_record_id) in-place UPDATE(신규 레코드 X) + panel_alarms cleared/record_saved + 에스컬레이션 중지.
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request, env, params } = ctx
  const staffId = (ctx as unknown as { data?: { staffId?: string } }).data?.staffId
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  try {
    const body = await request.json<{ type?: 'fire' | 'non_fire'; location?: string; cause?: string; action?: string }>()
    if (body.type && !['fire', 'non_fire'].includes(body.type)) {
      return Response.json({ success: false, error: 'type is fire|non_fire' }, { status: 400 })
    }
    const row = await env.DB.prepare('SELECT * FROM panel_alarms WHERE id = ?').bind(id).first<AlarmRow>()
    if (!row) return Response.json({ success: false, error: '경보를 찾을 수 없습니다' }, { status: 404 })
    if (row.status === 'cleared') return Response.json({ success: true, data: mapAlarm(row) }) // 멱등
    if (!row.draft_record_id) return Response.json({ success: false, error: '저장할 자동초안이 없습니다' }, { status: 400 })

    // 자동초안 in-place 확정 (신규 레코드 없음). type 미지정 시 기존값 유지.
    await env.DB.prepare(
      `UPDATE fire_alarm_records SET type=COALESCE(?,type), location=?, cause=?, action=?, created_by=? WHERE id=?`,
    ).bind(body.type ?? null, body.location ?? '', body.cause ?? '오작동', body.action ?? '자동복구, 현장확인', staffId ?? 'panel-agent', row.draft_record_id).run()

    // 경보 종료 + 칩 소멸 (record_saved) + 에스컬레이션 중지.
    await env.DB.prepare(
      "UPDATE panel_alarms SET status='cleared', cleared_reason='record_saved', cleared_at=?, next_push_at=NULL WHERE id=?",
    ).bind(nowKstSql(), id).run()

    const updated = await env.DB.prepare('SELECT * FROM panel_alarms WHERE id = ?').bind(id).first<AlarmRow>()
    return Response.json({ success: true, data: updated ? mapAlarm(updated) : null })
  } catch (e) {
    console.error('alarm/resolve error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}
