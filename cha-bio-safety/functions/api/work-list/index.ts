import type { Env } from '../../_middleware'
import { nowKstSql } from '../../utils/kst'

// 업무 관련 리스트 (탭: password | contact) — GET 목록 / POST 신규
//
// GET 파라미터:
//   type        : 'password' | 'contact' (필수)
//   q           : label/value/affiliation/memo LIKE 검색
//   showDeleted : soft-deleted 도 검색 결과에 포함 (회색+삭제됨 라벨)

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx
  try {
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    if (type !== 'password' && type !== 'contact') {
      return Response.json({ success: false, error: 'type=password|contact 필수' }, { status: 400 })
    }
    const q = url.searchParams.get('q')?.trim() ?? ''
    const showDeleted = url.searchParams.get('showDeleted') === 'true'

    const where: string[] = ['w.type = ?']
    const binds: any[] = [type]
    if (!showDeleted) where.push('w.deleted_at IS NULL')
    if (q) {
      where.push('(w.label LIKE ? OR w.value LIKE ? OR w.affiliation LIKE ? OR w.extra LIKE ? OR w.memo LIKE ? OR sc.name LIKE ?)')
      const like = `%${q}%`
      binds.push(like, like, like, like, like, like)
    }

    const rows = await env.DB.prepare(`
      SELECT w.id, w.type, w.label, w.value, w.affiliation, w.extra, w.memo,
             w.created_by, sc.name AS created_by_name,
             w.updated_by, su.name AS updated_by_name,
             w.created_at, w.updated_at, w.deleted_at
      FROM work_list_items w
      JOIN staff sc ON sc.id = w.created_by
      LEFT JOIN staff su ON su.id = w.updated_by
      WHERE ${where.join(' AND ')}
      ORDER BY w.updated_at DESC
    `).bind(...binds).all<Record<string, unknown>>()

    const items = (rows.results ?? []).map(r => ({
      id: r.id, type: r.type, label: r.label, value: r.value,
      affiliation: r.affiliation, extra: r.extra, memo: r.memo,
      createdBy: r.created_by, createdByName: r.created_by_name,
      updatedBy: r.updated_by, updatedByName: r.updated_by_name,
      createdAt: r.created_at, updatedAt: r.updated_at,
      deletedAt: r.deleted_at,
    }))
    return Response.json({ success: true, data: items })
  } catch (e) {
    console.error('work-list list error', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx
  const me = (ctx as any).data
  try {
    const body = await request.json<{
      type?: string; label?: string; value?: string;
      affiliation?: string; extra?: string; memo?: string
    }>()
    if (body.type !== 'password' && body.type !== 'contact') {
      return Response.json({ success: false, error: 'type=password|contact 필수' }, { status: 400 })
    }
    if (!body.label?.trim() || !body.value?.trim()) {
      return Response.json({ success: false, error: '항목명과 값 필수' }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const now = nowKstSql()
    const aff   = body.affiliation?.trim() || null
    const extra = body.extra?.trim() || null
    const memo  = body.memo?.trim() || null

    await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO work_list_items (id, type, label, value, affiliation, extra, memo, created_by, updated_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(id, body.type, body.label.trim(), body.value.trim(),
              aff, extra, memo, me.staffId, me.staffId, now, now),
      env.DB.prepare(`
        INSERT INTO work_list_revisions (id, item_id, staff_id, type, label, value, affiliation, extra, memo, is_deletion, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
      `).bind(crypto.randomUUID(), id, me.staffId, body.type, body.label.trim(), body.value.trim(),
              aff, extra, memo, now),
    ])

    return Response.json({ success: true, data: { id } }, { status: 201 })
  } catch (e) {
    console.error('work-list create error', e)
    return Response.json({ success: false, error: '저장 실패' }, { status: 500 })
  }
}
