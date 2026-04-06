import type { Env } from '../../_middleware'

// ── VAPID 공개키 반환 (인증 불필요, 미들웨어 PUBLIC 목록에 등록) ──────────────────────
export const onRequestGet: PagesFunction<Env & { VAPID_PUBLIC_KEY: string }> = async (ctx) => {
  return new Response(ctx.env.VAPID_PUBLIC_KEY ?? '', {
    headers: { 'Content-Type': 'text/plain' }
  })
}
