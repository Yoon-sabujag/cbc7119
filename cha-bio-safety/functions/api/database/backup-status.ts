// GET/PUT /api/database/backup-status — 마지막 백업 다운로드 날짜 관리
import type { Env } from '../../_middleware'

const KEY = 'last_r2_backup_downloaded'

export const onRequestGet: PagesFunction<Env> = async ({ env, data }) => {
  const { role } = data as { role: string }
  if (role !== 'admin') return Response.json({ success: false, error: '관리자만 접근 가능' }, { status: 403 })

  const row = await env.DB.prepare('SELECT value FROM app_settings WHERE key = ?').bind(KEY).first<{ value: string }>()
  return Response.json({ success: true, data: { lastDate: row?.value ?? '' } })
}

export const onRequestPut: PagesFunction<Env> = async ({ request, env, data }) => {
  const { role } = data as { role: string }
  if (role !== 'admin') return Response.json({ success: false, error: '관리자만 접근 가능' }, { status: 403 })

  const { date } = await request.json<{ date: string }>()
  await env.DB.prepare(
    `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).bind(KEY, date).run()

  return Response.json({ success: true })
}
