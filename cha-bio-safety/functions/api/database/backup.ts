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

  // D1 은 statement 당 100KB(byte) 한도 — 이걸 넘는 INSERT 가 들어간 백업은
  // 생성은 되지만 복원이 불가능하다. 그런 행이 보이면 백업을 차단하고 알린다.
  const enc = new TextEncoder()
  const oversized: string[] = []

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
      const stmt = `INSERT INTO ${table.name} (${columns.join(', ')}) VALUES (${values.join(', ')});`
      if (stmt.length > 30000 && enc.encode(stmt).length > 95000)
        oversized.push(`${table.name} (${columns[0]}=${String(r[columns[0]]).slice(0, 40)})`)
      lines.push(stmt)
    }
    lines.push('')
  }

  if (oversized.length > 0)
    return Response.json(
      {
        success: false,
        error: `백업 중단: D1 statement 한도(100KB)를 초과하는 행이 있어 복원 불가능한 백업이 만들어집니다. 해당 행의 텍스트를 줄인 뒤 다시 시도하세요: ${oversized.join(', ')}`,
      },
      { status: 500 }
    )

  // 3. standalone 인덱스/뷰/트리거 — DROP TABLE 이 부속 객체를 함께 지우므로
  //    백업에 없으면 복원 후 전부 소실된다 (인덱스 50여 개 + 개소명 동기화 트리거).
  //    데이터 INSERT 가 모두 끝난 뒤에 생성해야 적재 속도/정합 면에서 안전.
  const { results: objects } = await env.DB.prepare(
    `SELECT type, name, sql FROM sqlite_master
     WHERE type IN ('index','view','trigger') AND sql IS NOT NULL
       AND name NOT LIKE 'sqlite_%' AND tbl_name NOT LIKE '_cf_%' AND tbl_name NOT LIKE 'd1_%'
     ORDER BY CASE type WHEN 'index' THEN 0 WHEN 'view' THEN 1 ELSE 2 END, name`
  ).all<{ type: string; name: string; sql: string }>()

  if (objects.length > 0) {
    lines.push(`-- ── indexes / views / triggers ──`)
    for (const o of objects) {
      lines.push(`DROP ${o.type.toUpperCase()} IF EXISTS ${o.name};`)
      lines.push(`${o.sql};`)
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
