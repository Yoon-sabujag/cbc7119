// POST /api/database/restore — SQL 파일로 D1 데이터베이스 복원
import type { Env } from '../../_middleware'

export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const { role } = data as { role: string }
  if (role !== 'admin') return Response.json({ success: false, error: '관리자만 복원할 수 있습니다' }, { status: 403 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ success: false, error: 'SQL 파일이 없습니다' }, { status: 400 })

  const sql = await file.text()
  if (!sql.includes('CHA Bio Safety DB Backup'))
    return Response.json({ success: false, error: '유효한 백업 파일이 아닙니다' }, { status: 400 })

  // SQL 문 파싱 (세미콜론 기준 분리, 주석/빈줄 제외)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'))

  let executed = 0
  let errors = 0
  for (const stmt of statements) {
    try {
      await env.DB.prepare(stmt).run()
      executed++
    } catch (e: any) {
      errors++
      console.error(`Restore error: ${e.message} — ${stmt.slice(0, 80)}`)
    }
  }

  return Response.json({
    success: true,
    data: { executed, errors, total: statements.length },
  })
}
