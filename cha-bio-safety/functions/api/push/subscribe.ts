import type { Env } from '../../_middleware'

// ── 푸시 구독 등록/조회 ─────────────────────────────────────
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  try {
    const staffId = (ctx as any).data?.staffId as string
    if (!staffId) return Response.json({ success: false, error: '인증이 필요합니다' }, { status: 401 })

    const body = await ctx.request.json<{ endpoint: string; keys: { p256dh: string; auth: string } }>()
    const { endpoint, keys } = body || {}

    // 입력 검증 (T-17-03)
    if (!endpoint || typeof endpoint !== 'string' || !endpoint.trim())
      return Response.json({ success: false, error: 'endpoint가 필요합니다' }, { status: 400 })
    if (!keys?.p256dh || typeof keys.p256dh !== 'string' || !keys.p256dh.trim())
      return Response.json({ success: false, error: 'p256dh가 필요합니다' }, { status: 400 })
    if (!keys?.auth || typeof keys.auth !== 'string' || !keys.auth.trim())
      return Response.json({ success: false, error: 'auth가 필요합니다' }, { status: 400 })

    const id = crypto.randomUUID()
    const defaultPrefs = JSON.stringify({
      daily_schedule: true,
      incomplete_schedule: true,
      unresolved_issue: true,
      education_reminder: true,
      event_15min: true,
      event_5min: true,
    })

    await ctx.env.DB.prepare(
      `INSERT INTO push_subscriptions (id, staff_id, endpoint, p256dh, auth, notification_preferences)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(staff_id, endpoint) DO UPDATE SET
         p256dh = excluded.p256dh,
         auth   = excluded.auth,
         updated_at = datetime('now','+9 hours')`
    ).bind(id, staffId, endpoint.trim(), keys.p256dh.trim(), keys.auth.trim(), defaultPrefs).run()

    return Response.json({ success: true })
  } catch (e) {
    console.error('subscribe error:', e)
    return Response.json({ success: false, error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

// ── 현재 구독 상태 및 알림 설정 조회 ────────────────────────
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  try {
    const staffId = (ctx as any).data?.staffId as string
    if (!staffId) return Response.json({ success: false, error: '인증이 필요합니다' }, { status: 401 })

    const row = await ctx.env.DB.prepare(
      'SELECT notification_preferences FROM push_subscriptions WHERE staff_id = ? LIMIT 1'
    ).bind(staffId).first<{ notification_preferences: string }>()

    if (!row) {
      return Response.json({
        success: true,
        data: { subscribed: false, preferences: null }
      })
    }

    let preferences = null
    try { preferences = JSON.parse(row.notification_preferences) } catch { /* ignore */ }

    return Response.json({
      success: true,
      data: { subscribed: true, preferences }
    })
  } catch (e) {
    console.error('subscribe GET error:', e)
    return Response.json({ success: false, error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
