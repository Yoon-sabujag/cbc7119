import type { Env } from '../../_middleware'

interface NotificationPreferences {
  daily_schedule:       boolean
  incomplete_schedule:  boolean
  unresolved_issue:     boolean
  education_reminder:   boolean
  event_15min:          boolean
  event_5min:           boolean
}

// ── 알림 설정 업데이트 ───────────────────────────────────────
export const onRequestPatch: PagesFunction<Env> = async (ctx) => {
  try {
    const staffId = (ctx as any).data?.staffId as string
    if (!staffId) return Response.json({ success: false, error: '인증이 필요합니다' }, { status: 401 })

    const prefs = await ctx.request.json<NotificationPreferences>()

    // 필드 검증
    const keys: (keyof NotificationPreferences)[] = [
      'daily_schedule', 'incomplete_schedule', 'unresolved_issue',
      'education_reminder', 'event_15min', 'event_5min',
    ]
    for (const k of keys) {
      if (typeof prefs[k] !== 'boolean')
        return Response.json({ success: false, error: `${k}는 boolean이어야 합니다` }, { status: 400 })
    }

    await ctx.env.DB.prepare(
      `UPDATE push_subscriptions
       SET notification_preferences = ?, updated_at = datetime('now','+9 hours')
       WHERE staff_id = ?`
    ).bind(JSON.stringify(prefs), staffId).run()

    return Response.json({ success: true })
  } catch (e) {
    console.error('preferences PATCH error:', e)
    return Response.json({ success: false, error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
