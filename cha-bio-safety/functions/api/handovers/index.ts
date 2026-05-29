import type { Env } from '../../_middleware'
import { nowKstSql } from '../../utils/kst'

// 인수 인계장 — GET 목록 / POST 신규
//
// GET 파라미터:
//   q          : 제목/본문/작성자 LIKE 검색 (있으면 검색 모드)
//   showDeleted: 'true' 면 soft-deleted 글도 결과에 포함 (검색 결과에 회색+삭제됨 라벨 노출용)
//   status     : 'waiting'|'done'|'pinned' 필터 (목록 화면 탭별)
//
// 응답: { items: [{ id, staffId, staffName, title, body, status, createdAt, updatedAt, deletedAt, attachmentCount }] }

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx
  try {
    const url = new URL(request.url)
    const q = url.searchParams.get('q')?.trim() ?? ''
    const showDeleted = url.searchParams.get('showDeleted') === 'true'
    const status = url.searchParams.get('status')

    const where: string[] = []
    const binds: any[] = []
    if (!showDeleted) where.push('h.deleted_at IS NULL')
    if (status) {
      where.push('h.status = ?')
      binds.push(status)
    }
    if (q) {
      where.push('(h.title LIKE ? OR h.body LIKE ? OR s.name LIKE ?)')
      const like = `%${q}%`
      binds.push(like, like, like)
    }

    const sql = `
      SELECT h.id, h.staff_id, s.name AS staff_name, h.title, h.body, h.status, h.pinned,
             h.created_at, h.updated_at, h.deleted_at,
             (SELECT COUNT(*) FROM handover_attachments a WHERE a.handover_id = h.id) AS attachment_count
      FROM handovers h
      JOIN staff s ON s.id = h.staff_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY
        h.pinned DESC,
        h.created_at DESC
    `

    const rows = await env.DB.prepare(sql).bind(...binds).all<Record<string, unknown>>()
    const items = (rows.results ?? []).map(r => ({
      id: r.id,
      staffId: r.staff_id,
      staffName: r.staff_name,
      title: r.title,
      body: r.body,
      status: r.status,
      pinned: !!r.pinned,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      deletedAt: r.deleted_at,
      attachmentCount: r.attachment_count ?? 0,
    }))
    return Response.json({ success: true, data: items })
  } catch (e) {
    console.error('handovers list error', e)
    return Response.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx
  const me = (ctx as any).data
  try {
    const body = await request.json<{ title?: string; body?: string; status?: string; pinned?: boolean }>()
    // title 은 optional (빈 문자열 OK), body 는 필수
    if (!body.body?.trim()) {
      return Response.json({ success: false, error: '본문 필수' }, { status: 400 })
    }
    const title = (body.title ?? '').trim()
    const status = body.status === 'done' ? 'done' : 'waiting'
    const pinned = body.pinned ? 1 : 0
    const id = crypto.randomUUID()
    const revisionId = crypto.randomUUID()
    const now = nowKstSql()

    await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO handovers (id, staff_id, title, body, status, pinned, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(id, me.staffId, title, body.body.trim(), status, pinned, now, now),
      env.DB.prepare(`
        INSERT INTO handover_revisions (id, handover_id, staff_id, title, body, status, is_deletion, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?)
      `).bind(revisionId, id, me.staffId, title, body.body.trim(), status, now),
    ])

    return Response.json({ success: true, data: { id } }, { status: 201 })
  } catch (e) {
    console.error('handover create error', e)
    return Response.json({ success: false, error: '저장 실패' }, { status: 500 })
  }
}
