import type { Env } from '../../_middleware'
import { nowKstSql } from '../../utils/kst'

// ── Staff 목록 조회 / 신규 등록 ──────────────────────────────

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const rows = await env.DB.prepare(
      `SELECT id, name, role, title, phone, email, appointed_at, active, shift_type, created_at
       FROM staff ORDER BY name ASC`
    ).all<Record<string, unknown>>()

    const data = (rows.results ?? []).map(r => ({
      id:          r.id,
      name:        r.name,
      role:        r.role,
      title:       r.title,
      phone:       r.phone ?? null,
      email:       r.email ?? null,
      appointedAt: r.appointed_at ?? null,
      active:      r.active ?? 1,
      shiftType:   r.shift_type ?? null,
      createdAt:   r.created_at,
    }))

    return Response.json({ success: true, data })
  } catch (e) {
    console.error('staff list error:', e)
    return Response.json({ success: false, error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx
  const data = ctx as any

  try {
    if (data.data?.role !== 'admin')
      return Response.json({ success: false, error: '권한이 없습니다' }, { status: 403 })

    const body = await request.json<{
      id: string; name: string; role: string; title: string;
      phone?: string; email?: string; appointedAt?: string
    }>()

    if (!body.id?.trim() || !body.name?.trim() || !body.role || !body.title?.trim())
      return Response.json({ success: false, error: '필수 항목을 모두 입력하세요' }, { status: 400 })

    // 기본 비밀번호: 사번 뒷 4자리 (plain: prefix)
    const passwordHash = 'plain:' + body.id.slice(-4)
    const now = nowKstSql()

    await env.DB.prepare(
      `INSERT INTO staff (id, name, role, title, password_hash, phone, email, appointed_at, active, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 1, ?9, ?9)`
    ).bind(
      body.id.trim(),
      body.name.trim(),
      body.role,
      body.title.trim(),
      passwordHash,
      body.phone ?? null,
      body.email ?? null,
      body.appointedAt ?? null,
      now,
    ).run()

    const created = await env.DB.prepare(
      `SELECT id, name, role, title, phone, email, appointed_at, active, shift_type, created_at FROM staff WHERE id = ?1`
    ).bind(body.id.trim()).first<Record<string, unknown>>()

    return Response.json({
      success: true,
      data: {
        id:          created!.id,
        name:        created!.name,
        role:        created!.role,
        title:       created!.title,
        phone:       created!.phone ?? null,
        email:       created!.email ?? null,
        appointedAt: created!.appointed_at ?? null,
        active:      created!.active ?? 1,
        shiftType:   created!.shift_type ?? null,
        createdAt:   created!.created_at,
      },
    }, { status: 201 })
  } catch (e) {
    console.error('staff create error:', e)
    return Response.json({ success: false, error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
