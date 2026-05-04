import type { Env } from '../../_middleware'
import { nowKstSql } from '../../utils/kst'

export const onRequestPut: PagesFunction<Env> = async (ctx) => {
  const { env } = ctx
  const data = ctx as any
  const staffId = data.data?.staffId

  try {
    if (!staffId)
      return Response.json({ success: false, error: '인증이 필요합니다' }, { status: 401 })

    const body = await ctx.request.json<{ name?: string; phone?: string; email?: string; birthDate?: string | null }>()

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
    if (body.birthDate !== undefined) {
      updates.push('birth_date = ?')
      binds.push(body.birthDate?.trim() || null)
    }

    if (updates.length === 0)
      return Response.json({ success: false, error: '변경할 항목이 없습니다' }, { status: 400 })

    const now = nowKstSql()
    updates.push('updated_at = ?')
    binds.push(now)
    binds.push(staffId)

    const sql = `UPDATE staff SET ${updates.join(', ')} WHERE id = ?`
    // D1 .bind() 는 매개변수를 한 번에 spread 로 전달해야 함 — 루프로 하나씩 부르면
    // 매번 바인딩이 덮어써져 마지막 값만 들어가고 SQL 이 미바인딩 상태로 실행됨
    await env.DB.prepare(sql).bind(...binds).run()

    // 업데이트된 정보 반환
    const row = await env.DB.prepare('SELECT name, phone, email, birth_date FROM staff WHERE id = ?').bind(staffId).first<{ name: string; phone: string | null; email: string | null; birth_date: string | null }>()

    return Response.json({ success: true, data: { name: row?.name ?? '', phone: row?.phone ?? null, email: row?.email ?? null, birthDate: row?.birth_date ?? null } })
  } catch (e) {
    console.error('profile update error:', e)
    return Response.json({ success: false, error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
