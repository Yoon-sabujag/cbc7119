import type { Env } from '../../_middleware'

// ── 푸시 구독 해제 ──────────────────────────────────────────
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  try {
    const staffId = (ctx as any).data?.staffId as string
    if (!staffId) return Response.json({ success: false, error: '인증이 필요합니다' }, { status: 401 })

    const body = await ctx.request.json<{ endpoint: string }>()
    const { endpoint } = body || {}

    if (!endpoint || typeof endpoint !== 'string' || !endpoint.trim())
      return Response.json({ success: false, error: 'endpoint가 필요합니다' }, { status: 400 })

    await ctx.env.DB.prepare(
      'DELETE FROM push_subscriptions WHERE staff_id = ? AND endpoint = ?'
    ).bind(staffId, endpoint.trim()).run()

    return Response.json({ success: true })
  } catch (e) {
    console.error('unsubscribe error:', e)
    return Response.json({ success: false, error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
