import type { Env } from '../../_middleware'
import { nowKstSql } from '../../utils/kst'

// /api/work-list/:id — GET / PUT / DELETE
// 수정/삭제 = created_by 일치 시만 (본인 가드). 모든 변경은 work_list_revisions snapshot.

interface WorkListRow {
  id: string; type: string; label: string; value: string;
  affiliation: string | null; extra: string | null; memo: string | null;
  created_by: string; updated_by: string | null;
  created_at: string; updated_at: string; deleted_at: string | null
}

async function loadItem(env: Env, id: string): Promise<WorkListRow | null> {
  return await env.DB.prepare(`
    SELECT id, type, label, value, affiliation, extra, memo, created_by, updated_by,
           created_at, updated_at, deleted_at
    FROM work_list_items WHERE id = ?
  `).bind(id).first<WorkListRow>()
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const { env, params } = ctx
  const id = String(params.id)
  const w = await loadItem(env, id)
  if (!w) return Response.json({ success: false, error: '없음' }, { status: 404 })
  return Response.json({ success: true, data: w })
}

export const onRequestPut: PagesFunction<Env> = async (ctx) => {
  const { request, env, params } = ctx
  const me = (ctx as any).data
  const id = String(params.id)
  try {
    const body = await request.json<{
      label?: string; value?: string;
      affiliation?: string | null; extra?: string | null; memo?: string | null
    }>()
    const w = await loadItem(env, id)
    if (!w) return Response.json({ success: false, error: '없음' }, { status: 404 })
    if (w.deleted_at) return Response.json({ success: false, error: '삭제된 항목' }, { status: 410 })
    if (w.created_by !== me.staffId) {
      return Response.json({ success: false, error: '본인이 작성한 항목만 수정할 수 있습니다' }, { status: 403 })
    }

    const newLabel       = body.label?.trim() ?? w.label
    const newValue       = body.value?.trim() ?? w.value
    const newAffiliation = body.affiliation === undefined ? w.affiliation : (body.affiliation?.trim() || null)
    const newExtra       = body.extra === undefined ? w.extra : (body.extra?.trim() || null)
    const newMemo        = body.memo === undefined ? w.memo : (body.memo?.trim() || null)
    const now = nowKstSql()

    await env.DB.batch([
      env.DB.prepare(`
        UPDATE work_list_items SET label = ?, value = ?, affiliation = ?, extra = ?, memo = ?, updated_by = ?, updated_at = ?
        WHERE id = ?
      `).bind(newLabel, newValue, newAffiliation, newExtra, newMemo, me.staffId, now, id),
      env.DB.prepare(`
        INSERT INTO work_list_revisions (id, item_id, staff_id, type, label, value, affiliation, extra, memo, is_deletion, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
      `).bind(crypto.randomUUID(), id, me.staffId, w.type, newLabel, newValue, newAffiliation, newExtra, newMemo, now),
    ])

    return Response.json({ success: true })
  } catch (e) {
    console.error('work-list update error', e)
    return Response.json({ success: false, error: '저장 실패' }, { status: 500 })
  }
}

export const onRequestDelete: PagesFunction<Env> = async (ctx) => {
  const { env, params } = ctx
  const me = (ctx as any).data
  const id = String(params.id)
  try {
    const w = await loadItem(env, id)
    if (!w) return Response.json({ success: false, error: '없음' }, { status: 404 })
    if (w.deleted_at) return Response.json({ success: true })
    if (w.created_by !== me.staffId) {
      return Response.json({ success: false, error: '본인이 작성한 항목만 삭제할 수 있습니다' }, { status: 403 })
    }

    const now = nowKstSql()
    await env.DB.batch([
      env.DB.prepare(`UPDATE work_list_items SET deleted_at = ?, deleted_by = ? WHERE id = ?`)
        .bind(now, me.staffId, id),
      env.DB.prepare(`
        INSERT INTO work_list_revisions (id, item_id, staff_id, type, label, value, affiliation, extra, memo, is_deletion, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      `).bind(crypto.randomUUID(), id, me.staffId, w.type, w.label, w.value, w.affiliation, w.extra, w.memo, now),
    ])
    return Response.json({ success: true })
  } catch (e) {
    console.error('work-list delete error', e)
    return Response.json({ success: false, error: '삭제 실패' }, { status: 500 })
  }
}
