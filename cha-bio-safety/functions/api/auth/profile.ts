import type { Env } from '../../_middleware'
import { nowKstSql } from '../../utils/kst'

export const onRequestPut: PagesFunction<Env> = async (ctx) => {
  const { env } = ctx
  const data = ctx as any
  const staffId = data.data?.staffId

  try {
    if (!staffId)
      return Response.json({ success: false, error: '인증이 필요합니다' }, { status: 401 })

    const { name } = await ctx.request.json<{ name: string }>()

    if (!name || typeof name !== 'string' || !name.trim())
      return Response.json({ success: false, error: '이름을 입력하세요' }, { status: 400 })

    const trimmedName = name.trim()
    if (trimmedName.length > 20)
      return Response.json({ success: false, error: '이름은 20자 이내로 입력하세요' }, { status: 400 })

    const now = nowKstSql()

    await env.DB.prepare('UPDATE staff SET name = ?1, updated_at = ?2 WHERE id = ?3')
      .bind(trimmedName, now, staffId).run()

    return Response.json({ success: true, data: { name: trimmedName } })
  } catch (e) {
    console.error('profile update error:', e)
    return Response.json({ success: false, error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
