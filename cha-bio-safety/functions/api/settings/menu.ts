import type { Env } from '../../_middleware'

// GET /api/settings/menu — 개인별 메뉴 설정 조회
export const onRequestGet: PagesFunction<Env> = async ({ env, data }) => {
  const { staffId } = data as any
  try {
    const row = await env.DB.prepare(
      "SELECT value FROM app_settings WHERE key = ?"
    ).bind(`menu_config_${staffId}`).first<{ value: string }>()

    return Response.json({ success: true, data: row?.value ? JSON.parse(row.value) : null })
  } catch (e) {
    console.error('[settings/menu GET]', e)
    return Response.json({ success: true, data: null })
  }
}

// PUT /api/settings/menu — 개인별 메뉴 설정 저장 (모든 사용자)
export const onRequestPut: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId } = data as any

  try {
    const body = await request.json() as { config: any }
    const value = JSON.stringify(body.config)
    const key = `menu_config_${staffId}`

    await env.DB.prepare(`
      INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, datetime('now','+9 hours'))
      ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now','+9 hours')
    `).bind(key, value, value).run()

    return Response.json({ success: true })
  } catch (e) {
    console.error('[settings/menu PUT]', e)
    return Response.json({ success: false, error: '설정 저장 실패' }, { status: 500 })
  }
}
