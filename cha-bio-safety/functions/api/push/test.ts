import type { Env } from '../../_middleware'
import { buildPushPayload } from '@block65/webcrypto-web-push'

// ── admin 전용 테스트 푸시 발송 ─────────────────────────
// POST /api/push/test
// 호출자(admin 본인)의 모든 구독 endpoint에 테스트 페이로드를 발송한다.
// - 비관리자: 403
// - VAPID 키 미설정: 500 (운영자 진단용)
// - 구독 없음: 400
// - 만료 구독(410/404): push_subscriptions에서 자동 삭제
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  try {
    const staffId = (ctx as any).data?.staffId as string | undefined
    const role = (ctx as any).data?.role as string | undefined

    if (!staffId) return Response.json({ success: false, error: '인증이 필요합니다' }, { status: 401 })
    if (role !== 'admin') return Response.json({ success: false, error: '관리자 전용' }, { status: 403 })

    const publicKey = ctx.env.VAPID_PUBLIC_KEY
    const privateKey = ctx.env.VAPID_PRIVATE_KEY
    if (!publicKey || !privateKey) {
      return Response.json(
        { success: false, error: 'VAPID 키가 서버에 설정되지 않았습니다' },
        { status: 500 },
      )
    }

    const subs = await ctx.env.DB.prepare(
      `SELECT id, staff_id, endpoint, p256dh, auth
       FROM push_subscriptions WHERE staff_id = ?`
    ).bind(staffId).all<{
      id: string
      staff_id: string
      endpoint: string
      p256dh: string
      auth: string
    }>()

    const rows = subs.results ?? []
    if (rows.length === 0) {
      return Response.json(
        { success: false, error: '등록된 푸시 구독이 없습니다. 먼저 구독을 켜주세요.' },
        { status: 400 },
      )
    }

    const payload = { title: '테스트 푸시', body: '수신 확인용', type: 'test' }
    const results: { endpoint: string; status: string }[] = []
    let successCount = 0

    for (const sub of rows) {
      try {
        const pushData = await buildPushPayload(
          { data: JSON.stringify(payload) },
          {
            endpoint: sub.endpoint,
            expirationTime: null,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          { subject: 'mailto:admin@chabio.com', publicKey, privateKey },
        )
        const res = await fetch(sub.endpoint, {
          method: pushData.method,
          headers: pushData.headers,
          body: pushData.body as unknown as BodyInit,
        })
        if (res.status >= 200 && res.status < 300) {
          successCount++
          results.push({ endpoint: sub.endpoint, status: 'ok' })
        } else if (res.status === 410 || res.status === 404) {
          await ctx.env.DB.prepare('DELETE FROM push_subscriptions WHERE id = ?').bind(sub.id).run()
          results.push({ endpoint: sub.endpoint, status: '구독 만료 — 삭제됨' })
        } else {
          results.push({ endpoint: sub.endpoint, status: `status ${res.status}` })
        }
      } catch (e) {
        console.error('push test send error:', e)
        results.push({ endpoint: sub.endpoint, status: 'exception' })
      }
    }

    const total = rows.length
    return Response.json({
      success: successCount > 0,
      data: { sent: successCount, total, results },
      ...(successCount === 0 ? { error: '모든 구독에 발송 실패' } : {}),
    })
  } catch (e) {
    console.error('push test error:', e)
    return Response.json({ success: false, error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
