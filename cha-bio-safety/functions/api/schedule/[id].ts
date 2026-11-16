import type { Env } from '../../_middleware'

// PUT /api/schedule/:id  — 내용 수정
export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const id   = params.id as string
  const body = await request.json<{ title?: string; date?: string; time?: string; memo?: string; night_date?: string | null }>()
  if (!body.title && !body.date) return Response.json({ success: false, error: '수정할 내용이 없습니다' }, { status: 400 })

  const setClauses = ["title = COALESCE(?, title)", "date = COALESCE(?, date)", "time = ?", "memo = ?"]
  const binds: (string | null)[] = [body.title ?? null, body.date ?? null, body.time ?? null, body.memo ?? null]
  if ('night_date' in body) {
    setClauses.push('night_date = ?')
    binds.push(body.night_date ?? null)
  }
  setClauses.push("updated_at = datetime('now','+9 hours')")
  binds.push(id)

  await env.DB.prepare(
    `UPDATE schedule_items SET ${setClauses.join(', ')} WHERE id = ?`
  ).bind(...binds).run()

  return Response.json({ success: true })
}

// 범위 일정의 날짜별 완료 토글 시, status 자동 동기화에 필요한 "요구 날짜 목록"
// (SchedulePage matchesDate 와 동일 룰: task/event 는 주말 포함, 그 외는 주말·공휴일 제외)
async function requiredWorkdays(env: Env, start: string, end: string, category: string): Promise<string[]> {
  if (start === end) return [start]
  const skipWeekends = category !== 'task' && category !== 'event'
  const holidaySet = new Set<string>()
  if (skipWeekends) {
    const rows = await env.DB.prepare(
      `SELECT date FROM holidays WHERE date BETWEEN ? AND ?`
    ).bind(start, end).all<{ date: string }>()
    for (const r of (rows.results ?? [])) holidaySet.add(r.date)
  }

  const dates: string[] = []
  const cur = new Date(start + 'T00:00:00Z')
  const endD = new Date(end + 'T00:00:00Z')
  while (cur.getTime() <= endD.getTime()) {
    const ymd = cur.toISOString().slice(0, 10)
    if (!skipWeekends) {
      dates.push(ymd)
    } else {
      const dow = cur.getUTCDay()
      if (dow !== 0 && dow !== 6 && !holidaySet.has(ymd)) dates.push(ymd)
    }
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return dates
}

// PATCH /api/schedule/:id  — 상태 변경 (body.date 지정 시: 범위 일정의 해당 날짜만 완료/취소 토글)
export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  const id   = params.id as string
  const body = await request.json<{ status?: string; date?: string }>()

  if (body.date) {
    const row = await env.DB.prepare(
      `SELECT date, end_date, category, completed_dates FROM schedule_items WHERE id=?`
    ).bind(id).first<{ date: string; end_date: string | null; category: string; completed_dates: string | null }>()
    if (!row) return Response.json({ success: false, error: '일정을 찾을 수 없습니다' }, { status: 404 })

    const current: string[] = row.completed_dates ? JSON.parse(row.completed_dates) : []
    const next = current.includes(body.date)
      ? current.filter(d => d !== body.date)
      : [...current, body.date].sort()

    const required = await requiredWorkdays(env, row.date, row.end_date ?? row.date, row.category)
    const allDone  = required.length > 0 && required.every(d => next.includes(d))
    const status   = allDone ? 'done' : (next.length > 0 ? 'in_progress' : 'pending')

    await env.DB.prepare(
      `UPDATE schedule_items SET completed_dates=?, status=?, updated_at=datetime('now','+9 hours') WHERE id=?`
    ).bind(JSON.stringify(next), status, id).run()

    return Response.json({ success: true, data: { completedDates: next, status } })
  }

  if (!body.status) return Response.json({ success: false, error: 'status 필요' }, { status: 400 })

  const valid = ['pending','in_progress','done','overdue']
  if (!valid.includes(body.status)) return Response.json({ success: false, error: '유효하지 않은 status' }, { status: 400 })

  await env.DB.prepare(
    `UPDATE schedule_items SET status=?, updated_at=datetime('now','+9 hours') WHERE id=?`
  ).bind(body.status, id).run()

  return Response.json({ success: true })
}

// DELETE /api/schedule/:id
export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = params.id as string

  // 연관된 지적사항 확인
  const findings = await env.DB.prepare(
    `SELECT COUNT(*) as cnt FROM legal_findings WHERE schedule_item_id = ?`
  ).bind(id).first<{ cnt: number }>()

  if (findings && findings.cnt > 0) {
    return Response.json(
      { success: false, error: `지적사항 ${findings.cnt}건이 등록되어 있어 삭제할 수 없습니다. 지적사항을 먼저 삭제해주세요.` },
      { status: 400 }
    )
  }

  await env.DB.prepare(`DELETE FROM schedule_items WHERE id=?`).bind(id).run()
  return Response.json({ success: true })
}
