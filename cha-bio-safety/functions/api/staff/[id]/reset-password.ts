import type { Env } from '../../../_middleware'

// ── 비밀번호 초기화 (admin only) ──────────────────────────

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { env, params } = ctx
  const data = ctx as any

  try {
    if (data.data?.role !== 'admin')
      return Response.json({ success: false, error: '권한이 없습니다' }, { status: 403 })

    const staffId = params.id as string

    const existing = await env.DB.prepare('SELECT id FROM staff WHERE id = ?1').bind(staffId).first()
    if (!existing)
      return Response.json({ success: false, error: '직원을 찾을 수 없습니다' }, { status: 404 })

    // 비밀번호 초기화: 사번 뒷 4자리로 설정
    const newHash = 'plain:' + staffId.slice(-4)
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19)

    await env.DB.prepare(
      'UPDATE staff SET password_hash = ?1, updated_at = ?2 WHERE id = ?3'
    ).bind(newHash, now, staffId).run()

    return Response.json({ success: true })
  } catch (e) {
    console.error('reset-password error:', e)
    return Response.json({ success: false, error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
