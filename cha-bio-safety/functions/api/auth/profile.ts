import type { Env } from '../../_middleware'
import { nowKstSql } from '../../utils/kst'

export const onRequestPut: PagesFunction<Env> = async (ctx) => {
  const { env } = ctx
  const data = ctx as any
  const staffId = data.data?.staffId

  try {
    if (!staffId)
      return Response.json({ success: false, error: '인증이 필요합니다' }, { status: 401 })

    const body = await ctx.request.json<{ name?: string; phone?: string; email?: string }>()

    const updates: string[] = []
    const binds: (string | null)[] = []

    if (body.name !== undefined) {
      const trimmed = (body.name ?? '').trim()
      if (!trimmed) return Response.json({ success: false, error: '이름을 입력하세요' }, { status: 400 })
      if (trimmed.length > 20) return Response.json({ success: false, error: '이름은 20자 이내로 입력하세요' }, { status: 400 })
      updates.push('name = ?')
      binds.push(trimmed)
    }
    if (body.phone !== undefined) {
      updates.push('phone = ?')
      binds.push(body.phone?.trim() || null)
    }
    if (body.email !== undefined) {
      updates.push('email = ?')
      binds.push(body.email?.trim() || null)
    }

    if (updates.length === 0)
      return Response.json({ success: false, error: '변경할 항목이 없습니다' }, { status: 400 })

    const now = nowKstSql()
    updates.push('updated_at = ?')
    binds.push(now)
    binds.push(staffId)

    const sql = `UPDATE staff SET ${updates.join(', ')} WHERE id = ?`
    let stmt = env.DB.prepare(sql)
    for (let i = 0; i < binds.length; i++) stmt = stmt.bind(binds[i])
    await stmt.run()

    // 업데이트된 정보 반환
    const row = await env.DB.prepare('SELECT name, phone, email FROM staff WHERE id = ?').bind(staffId).first<{ name: string; phone: string | null; email: string | null }>()

    return Response.json({ success: true, data: { name: row?.name ?? '', phone: row?.phone ?? null, email: row?.email ?? null } })
  } catch (e) {
    console.error('profile update error:', e)
    return Response.json({ success: false, error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
