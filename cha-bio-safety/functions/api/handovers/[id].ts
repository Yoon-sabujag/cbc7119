import type { Env } from '../../_middleware'
import { nowKstSql } from '../../utils/kst'

// /api/handovers/:id — GET 상세 / PUT 수정 / DELETE 소프트삭제
// 수정/삭제 = 본인 staff_id 가드. 모든 변경은 handover_revisions 에 snapshot.

interface HandoverRow {
  id: string; staff_id: string; staff_name: string;
  title: string; body: string; status: string; pinned: number;
  created_at: string; updated_at: string; deleted_at: string | null
}

async function loadHandover(env: Env, id: string): Promise<HandoverRow | null> {
  return await env.DB.prepare(`
    SELECT h.id, h.staff_id, s.name AS staff_name, h.title, h.body, h.status, h.pinned,
           h.created_at, h.updated_at, h.deleted_at
    FROM handovers h JOIN staff s ON s.id = h.staff_id
    WHERE h.id = ?
  `).bind(id).first<HandoverRow>()
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const { env, params } = ctx
  const id = String(params.id)
  const h = await loadHandover(env, id)
  if (!h) return Response.json({ success: false, error: '없음' }, { status: 404 })

  const attachments = await env.DB.prepare(`
    SELECT id, storage_key, filename, content_type, size_bytes, uploaded_by, created_at
    FROM handover_attachments WHERE handover_id = ?
    ORDER BY created_at ASC
  `).bind(id).all<Record<string, unknown>>()

  return Response.json({
    success: true,
    data: {
      id: h.id, staffId: h.staff_id, staffName: h.staff_name,
      title: h.title, body: h.body, status: h.status, pinned: !!h.pinned,
      createdAt: h.created_at, updatedAt: h.updated_at, deletedAt: h.deleted_at,
      attachments: (attachments.results ?? []).map(a => ({
        id: a.id, storageKey: a.storage_key, filename: a.filename,
        contentType: a.content_type, sizeBytes: a.size_bytes,
        uploadedBy: a.uploaded_by, createdAt: a.created_at,
      })),
    },
  })
}

export const onRequestPut: PagesFunction<Env> = async (ctx) => {
  const { request, env, params } = ctx
  const me = (ctx as any).data
  const id = String(params.id)
  try {
    const body = await request.json<{
      title?: string; body?: string; status?: string; pinned?: boolean
    }>()
    const h = await loadHandover(env, id)
    if (!h) return Response.json({ success: false, error: '없음' }, { status: 404 })
    if (h.deleted_at) return Response.json({ success: false, error: '삭제된 글' }, { status: 410 })

    // 본인 가드: 본문/제목 수정은 본인만. 단 상태(완료/고정) 토글은 누구나 가능 (협업 핸들링).
    const editsContent = body.title !== undefined || body.body !== undefined
    if (editsContent && h.staff_id !== me.staffId) {
      return Response.json({ success: false, error: '본인이 작성한 글만 수정할 수 있습니다' }, { status: 403 })
    }

    const newTitle  = body.title  === undefined ? h.title  : body.title.trim()
    const newBody   = body.body   === undefined ? h.body   : body.body.trim()
    const newStatus = body.status === 'done' ? 'done' : body.status === 'waiting' ? 'waiting' : h.status
    const newPinned = body.pinned === undefined ? h.pinned : (body.pinned ? 1 : 0)
    const now = nowKstSql()

    await env.DB.batch([
      env.DB.prepare(`UPDATE handovers SET title = ?, body = ?, status = ?, pinned = ?, updated_at = ? WHERE id = ?`)
        .bind(newTitle, newBody, newStatus, newPinned, now, id),
      env.DB.prepare(`
        INSERT INTO handover_revisions (id, handover_id, staff_id, title, body, status, is_deletion, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?)
      `).bind(crypto.randomUUID(), id, me.staffId, newTitle, newBody, newStatus, now),
    ])

    return Response.json({ success: true })
  } catch (e) {
    console.error('handover update error', e)
    return Response.json({ success: false, error: '저장 실패' }, { status: 500 })
  }
}

export const onRequestDelete: PagesFunction<Env> = async (ctx) => {
  const { env, params } = ctx
  const me = (ctx as any).data
  const id = String(params.id)
  try {
    const h = await loadHandover(env, id)
    if (!h) return Response.json({ success: false, error: '없음' }, { status: 404 })
    if (h.deleted_at) return Response.json({ success: true })  // 이미 삭제 — idempotent
    if (h.staff_id !== me.staffId) {
      return Response.json({ success: false, error: '본인이 작성한 글만 삭제할 수 있습니다' }, { status: 403 })
    }

    const now = nowKstSql()
    await env.DB.batch([
      env.DB.prepare(`UPDATE handovers SET deleted_at = ?, deleted_by = ? WHERE id = ?`)
        .bind(now, me.staffId, id),
      env.DB.prepare(`
        INSERT INTO handover_revisions (id, handover_id, staff_id, title, body, status, is_deletion, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?)
      `).bind(crypto.randomUUID(), id, me.staffId, h.title, h.body, h.status, now),
    ])
    return Response.json({ success: true })
  } catch (e) {
    console.error('handover delete error', e)
    return Response.json({ success: false, error: '삭제 실패' }, { status: 500 })
  }
}
