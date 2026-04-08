import type { Env } from '../../_middleware'
import { nowKstSql } from '../../utils/kst'

// ── Staff 단건 조회 / 수정 ────────────────────────────────

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  try {
    const id = params.id as string
    const row = await env.DB.prepare(
      `SELECT id, name, role, title, phone, email, appointed_at, active, shift_type, created_at
       FROM staff WHERE id = ?1`
    ).bind(id).first<Record<string, unknown>>()

    if (!row)
      return Response.json({ success: false, error: '직원을 찾을 수 없습니다' }, { status: 404 })

    return Response.json({
      success: true,
      data: {
        id:          row.id,
        name:        row.name,
        role:        row.role,
        title:       row.title,
        phone:       row.phone ?? null,
        email:       row.email ?? null,
        appointedAt: row.appointed_at ?? null,
        active:      row.active ?? 1,
        shiftType:   row.shift_type ?? null,
        createdAt:   row.created_at,
      },
    })
  } catch (e) {
    console.error('staff get error:', e)
    return Response.json({ success: false, error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

export const onRequestPut: PagesFunction<Env> = async (ctx) => {
  const { request, env, params } = ctx
  const data = ctx as any

  try {
    if (data.data?.role !== 'admin')
      return Response.json({ success: false, error: '권한이 없습니다' }, { status: 403 })

    const id = params.id as string
    const body = await request.json<{
      name?: string; role?: string; title?: string;
      phone?: string; email?: string; appointedAt?: string; active?: number
    }>()

    const existing = await env.DB.prepare('SELECT id FROM staff WHERE id = ?1').bind(id).first()
    if (!existing)
      return Response.json({ success: false, error: '직원을 찾을 수 없습니다' }, { status: 404 })

    const now = nowKstSql()

    await env.DB.prepare(
      `UPDATE staff SET
        name        = COALESCE(?1, name),
        role        = COALESCE(?2, role),
        title       = COALESCE(?3, title),
        phone       = ?4,
        email       = ?5,
        appointed_at = ?6,
        active      = COALESCE(?7, active),
        updated_at  = ?8
       WHERE id = ?9`
    ).bind(
      body.name   ?? null,
      body.role   ?? null,
      body.title  ?? null,
      body.phone  !== undefined ? body.phone : null,
      body.email  !== undefined ? body.email : null,
      body.appointedAt !== undefined ? body.appointedAt : null,
      body.active !== undefined ? body.active : null,
      now,
      id,
    ).run()

    const updated = await env.DB.prepare(
      `SELECT id, name, role, title, phone, email, appointed_at, active, shift_type, created_at FROM staff WHERE id = ?1`
    ).bind(id).first<Record<string, unknown>>()

    return Response.json({
      success: true,
      data: {
        id:          updated!.id,
        name:        updated!.name,
        role:        updated!.role,
        title:       updated!.title,
        phone:       updated!.phone ?? null,
        email:       updated!.email ?? null,
        appointedAt: updated!.appointed_at ?? null,
        active:      updated!.active ?? 1,
        shiftType:   updated!.shift_type ?? null,
        createdAt:   updated!.created_at,
      },
    })
  } catch (e) {
    console.error('staff update error:', e)
    return Response.json({ success: false, error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
