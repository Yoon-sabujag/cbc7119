// GET /api/database/backup — D1 데이터베이스를 SQL 파일로 내보내기
import type { Env } from '../../_middleware'

export const onRequestGet: PagesFunction<Env> = async ({ env, data }) => {
  const { role } = data as { role: string }
  if (role !== 'admin') return Response.json({ success: false, error: '관리자만 백업할 수 있습니다' }, { status: 403 })

  // 1. 테이블 목록 조회
  const { results: tables } = await env.DB.prepare(
    `SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'd1_%' ORDER BY name`
  ).all<{ name: string; sql: string }>()

  const lines: string[] = []
  lines.push(`-- CHA Bio Safety DB Backup`)
  lines.push(`-- Date: ${new Date().toISOString()}`)
  lines.push(`-- Tables: ${tables.length}`)
  lines.push('')

  for (const table of tables) {
    lines.push(`-- ── ${table.name} ──`)
    lines.push(`DROP TABLE IF EXISTS ${table.name};`)
    lines.push(`${table.sql};`)
    lines.push('')

    // 2. 각 테이블 데이터 조회
    const { results: rows } = await env.DB.prepare(`SELECT * FROM ${table.name}`).all()
    if (rows.length === 0) {
      lines.push(`-- (no data)`)
      lines.push('')
      continue
    }

    const columns = Object.keys(rows[0] as Record<string, unknown>)
    for (const row of rows) {
      const r = row as Record<string, unknown>
      const values = columns.map(c => {
        const v = r[c]
        if (v === null || v === undefined) return 'NULL'
        if (typeof v === 'number') return String(v)
        return `'${String(v).replace(/'/g, "''")}'`
      })
      lines.push(`INSERT INTO ${table.name} (${columns.join(', ')}) VALUES (${values.join(', ')});`)
    }
    lines.push('')
  }

  const sql = lines.join('\n')
  const date = new Date().toISOString().slice(0, 10)
  const filename = `cha-bio-safety_${date}.sql`

  return new Response(sql, {
    headers: {
      'Content-Type': 'application/sql; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Access-Control-Allow-Origin': '*',
    },
  })
}
