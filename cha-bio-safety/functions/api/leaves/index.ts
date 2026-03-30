import type { Env } from '../../_middleware'

function nanoid(n = 21) {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const a = crypto.getRandomValues(new Uint8Array(n))
  return Array.from(a, b => c[b % c.length]).join('')
}

// GET /api/leaves?year=YYYY&month=YYYY-MM
export const onRequestGet: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId } = data as any
  const url   = new URL(request.url)
  const year  = url.searchParams.get('year')
  const month = url.searchParams.get('month')

  if (!year) {
    return Response.json({ success: false, error: 'year 파라미터가 필요합니다' }, { status: 400 })
  }

  let sql = `
    SELECT al.id, al.staff_id, al.date, al.type, al.year, al.created_at, s.name as staff_name
    FROM annual_leaves al
    LEFT JOIN staff s ON s.id = al.staff_id
    WHERE al.year = ?
  `
  const binds: (string | number)[] = [parseInt(year, 10)]

  if (month) {
    sql += ' AND al.date LIKE ?'
    binds.push(`${month}%`)
  }

  sql += ' ORDER BY al.date ASC'

  let stmt = env.DB.prepare(sql)
  if (binds.length === 1) stmt = stmt.bind(binds[0])
  else if (binds.length === 2) stmt = stmt.bind(binds[0], binds[1])

  const result = await stmt.all<Record<string, unknown>>()
  const rows = result.results ?? []

  const myLeaves = rows
    .filter(r => r.staff_id === staffId)
    .map(r => ({
      id:        r.id,
      staffId:   r.staff_id,
      staffName: r.staff_name ?? undefined,
      date:      r.date,
      type:      r.type,
      year:      r.year,
      createdAt: r.created_at,
    }))

  const teamLeaves = rows
    .filter(r => r.staff_id !== staffId)
    .map(r => ({
      id:        r.id,
      staffId:   r.staff_id,
      staffName: r.staff_name ?? undefined,
      date:      r.date,
      type:      r.type,
      year:      r.year,
      createdAt: r.created_at,
    }))

  return Response.json({ success: true, data: { myLeaves, teamLeaves } })
}

// POST /api/leaves
export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const { staffId } = data as any

  const body = await request.json<{ date: string; type: string }>()

  if (!body.date || !body.type || !['full', 'half_am', 'half_pm', 'official_full', 'official_half_am', 'official_half_pm'].includes(body.type)) {
    return Response.json({ success: false, error: '필수 항목 누락 또는 형식 오류' }, { status: 400 })
  }

  // 날짜 형식 검증 YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return Response.json({ success: false, error: '날짜 형식이 올바르지 않습니다' }, { status: 400 })
  }

  const year = parseInt(body.date.slice(0, 4), 10)

  // 1. 내 중복 체크
  const myExisting = await env.DB.prepare(
    'SELECT id FROM annual_leaves WHERE staff_id = ? AND date = ?'
  ).bind(staffId, body.date).first<{ id: string }>()

  if (myExisting) {
    return Response.json({ success: false, error: '이미 해당 날짜에 연차가 등록되어 있습니다' }, { status: 409 })
  }

  // 2. 팀원 연차 충돌 체크 (하루 1명 제한)
  const teamConflict = await env.DB.prepare(`
    SELECT al.staff_id, s.name
    FROM annual_leaves al
    LEFT JOIN staff s ON s.id = al.staff_id
    WHERE al.date = ? AND al.staff_id != ?
    LIMIT 1
  `).bind(body.date, staffId).first<{ staff_id: string; name: string }>()

  if (teamConflict) {
    return Response.json({
      success: false,
      error: `${teamConflict.name ?? teamConflict.staff_id}님이 이미 해당 날짜에 연차를 사용합니다`,
      conflictName: teamConflict.name ?? teamConflict.staff_id,
    }, { status: 409 })
  }

  // 3. 소방 종합정밀/작동기능점검 충돌 체크
  const scheduleConflict = await env.DB.prepare(`
    SELECT id, title, category
    FROM schedule_items
    WHERE date = ? AND category = 'fire'
      AND (title LIKE '%상반기 종합정밀점검%' OR title LIKE '%하반기 작동기능점검%')
    LIMIT 1
  `).bind(body.date).first<{ id: string; title: string; category: string }>()

  if (scheduleConflict) {
    return Response.json({
      success: false,
      error: `해당 날짜에 ${scheduleConflict.title} 일정이 있어 연차 등록이 불가합니다`,
      conflictSchedule: {
        id:       scheduleConflict.id,
        title:    scheduleConflict.title,
        category: scheduleConflict.category,
      },
    }, { status: 409 })
  }

  const id = 'LV-' + nanoid(8)
  await env.DB.prepare(`
    INSERT INTO annual_leaves (id, staff_id, date, type, year)
    VALUES (?, ?, ?, ?, ?)
  `).bind(id, staffId, body.date, body.type, year).run()

  return Response.json({ success: true, data: { id } }, { status: 201 })
}
