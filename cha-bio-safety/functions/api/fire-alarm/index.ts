import type { Env } from '../../_middleware'

function nanoid(n=16){ const c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; const a=crypto.getRandomValues(new Uint8Array(n)); return Array.from(a,b=>c[b%c.length]).join('') }

// GET /api/fire-alarm?year=YYYY
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url)
  const year = url.searchParams.get('year')
  const recent = url.searchParams.get('recent') // recent=1 → 최근 48시간
  const drafts = url.searchParams.get('drafts') // drafts=1 → 고아 초안(created_by='panel-agent', 연결경보 active/acked 아님)

  try {
    if (drafts) {
      const rows = await env.DB.prepare(
        `SELECT far.id, far.type, far.occurred_at, far.location, far.cause, far.action,
                pa.id AS alarm_id, pa.location AS alarm_location, pa.snapshot_key AS snapshot_key
         FROM fire_alarm_records far
         LEFT JOIN panel_alarms pa ON pa.draft_record_id = far.id
         WHERE far.created_by = 'panel-agent'
           AND (pa.status IS NULL OR pa.status NOT IN ('active', 'acked'))
         ORDER BY far.occurred_at DESC LIMIT 20`
      ).all<{
        id: string; type: string; occurred_at: string; location: string; cause: string; action: string
        alarm_id: string | null; alarm_location: string | null; snapshot_key: string | null
      }>()
      const data = (rows.results ?? []).map(r => ({
        id: r.id,
        type: r.type,
        occurredAt: r.occurred_at,
        location: r.location,
        cause: r.cause,
        action: r.action,
        alarmId: r.alarm_id,
        ocrLocation: r.alarm_location,
        snapshotKey: r.snapshot_key,
      }))
      return Response.json({ success: true, data })
    }

    if (recent) {
      const rows = await env.DB.prepare(
        `SELECT * FROM fire_alarm_records
         WHERE datetime(occurred_at) >= datetime('now', '-48 hours')
         ORDER BY occurred_at DESC LIMIT 5`
      ).all()
      return Response.json({ success: true, data: rows.results ?? [] })
    }

    if (!year) {
      return Response.json({ success: false, error: 'year 파라미터가 필요합니다' }, { status: 400 })
    }

    const rows = await env.DB.prepare(
      `SELECT * FROM fire_alarm_records
       WHERE occurred_at LIKE ? ORDER BY occurred_at ASC`
    ).bind(`${year}%`).all()
    return Response.json({ success: true, data: rows.results ?? [] })
  } catch (e) {
    console.error('fire-alarm GET error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}

// POST /api/fire-alarm
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId } = data as any
  try {
    const body = await request.json<{
      type: string; occurred_at: string; location: string; cause: string; action: string
    }>()

    if (!body.type || !['fire', 'non_fire'].includes(body.type)) {
      return Response.json({ success: false, error: '구분을 선택하세요' }, { status: 400 })
    }
    if (!body.occurred_at) {
      return Response.json({ success: false, error: '발생일시를 입력하세요' }, { status: 400 })
    }

    const id = 'FA-' + nanoid(10)
    await env.DB.prepare(
      `INSERT INTO fire_alarm_records (id, type, occurred_at, location, cause, action, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, body.type, body.occurred_at, body.location ?? '', body.cause ?? '오작동', body.action ?? '자동복구, 현장확인', staffId).run()

    return Response.json({ success: true, data: { id } }, { status: 201 })
  } catch (e) {
    console.error('fire-alarm POST error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}

// PUT /api/fire-alarm — 고아 초안(created_by='panel-agent') in-place 확정. 신규 INSERT 없음(UPDATE only).
export const onRequestPut: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId } = data as any
  try {
    const body = await request.json<{
      id: string; type: 'fire' | 'non_fire'; occurred_at?: string; location: string; cause: string; action: string
    }>()

    if (!body.id) {
      return Response.json({ success: false, error: 'id가 필요합니다' }, { status: 400 })
    }
    if (!body.type || !['fire', 'non_fire'].includes(body.type)) {
      return Response.json({ success: false, error: '구분을 선택하세요' }, { status: 400 })
    }

    await env.DB.prepare(
      `UPDATE fire_alarm_records
       SET type = ?, occurred_at = COALESCE(?, occurred_at), location = ?, cause = ?, action = ?, created_by = ?
       WHERE id = ? AND created_by = 'panel-agent'`
    ).bind(body.type, body.occurred_at ?? null, body.location ?? '', body.cause ?? '오작동', body.action ?? '자동복구, 현장확인', staffId, body.id).run()

    return Response.json({ success: true, data: { id: body.id } })
  } catch (e) {
    console.error('fire-alarm PUT error:', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}
