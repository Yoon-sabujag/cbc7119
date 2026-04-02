import type { Env } from '../../_middleware'

async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (hash.startsWith('plain:')) return plain === hash.slice(6)
  const [salt, stored] = hash.split(':')
  if (!salt || !stored) return false
  const data   = new TextEncoder().encode(salt + plain)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const hex    = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,'0')).join('')
  return hex === stored
}

async function hashPassword(plain: string): Promise<string> {
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0')).join('')
  const data   = new TextEncoder().encode(salt + plain)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const hex    = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,'0')).join('')
  return `${salt}:${hex}`
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { env } = ctx
  const data = ctx as any
  const staffId = data.data?.staffId

  try {
    if (!staffId)
      return Response.json({ success: false, error: '인증이 필요합니다' }, { status: 401 })

    const { currentPassword, newPassword } = await ctx.request.json<{ currentPassword: string; newPassword: string }>()

    if (!currentPassword?.trim() || !newPassword?.trim())
      return Response.json({ success: false, error: '현재 비밀번호와 새 비밀번호를 입력하세요' }, { status: 400 })

    if (newPassword.length < 4)
      return Response.json({ success: false, error: '새 비밀번호는 4자 이상이어야 합니다' }, { status: 400 })

    const staff = await env.DB.prepare('SELECT password_hash FROM staff WHERE id = ?1').bind(staffId).first<{ password_hash: string }>()
    if (!staff)
      return Response.json({ success: false, error: '직원을 찾을 수 없습니다' }, { status: 404 })

    const valid = await verifyPassword(currentPassword, staff.password_hash)
    if (!valid)
      return Response.json({ success: false, error: '현재 비밀번호가 올바르지 않습니다' }, { status: 403 })

    const newHash = await hashPassword(newPassword)
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19)

    await env.DB.prepare('UPDATE staff SET password_hash = ?1, updated_at = ?2 WHERE id = ?3')
      .bind(newHash, now, staffId).run()

    return Response.json({ success: true })
  } catch (e) {
    console.error('change-password error:', e)
    return Response.json({ success: false, error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
