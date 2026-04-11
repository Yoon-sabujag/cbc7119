import type { Env } from '../../_middleware'
import { requireAdmin, jsonOk, jsonError } from '../documents/_helpers'

const YM_RE = /^\d{4}-(0[1-9]|1[0-2])$/

// GET /api/work-logs/:ym — 단일 월 레코드 조회 (없으면 null)
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const ym = ctx.params.yearMonth as string
  if (!YM_RE.test(ym)) return jsonError(400, '유효하지 않은 월 형식입니다')
  try {
    const row = await ctx.env.DB.prepare(
      `SELECT * FROM work_logs WHERE year_month = ?`
    ).bind(ym).first()
    return jsonOk(row ?? null)
  } catch (e) {
    console.error('work-logs GET error:', e)
    return jsonError(500, '서버 오류')
  }
}

// PUT /api/work-logs/:ym — admin upsert
export const onRequestPut: PagesFunction<Env> = async (ctx) => {
  const denied = requireAdmin(ctx)
  if (denied) return denied

  const ym = ctx.params.yearMonth as string
  if (!YM_RE.test(ym)) return jsonError(400, '유효하지 않은 월 형식입니다')

  try {
    const body = await ctx.request.json() as {
      manager_name?: string
      fire_content?: string
      fire_result?: string
      fire_action?: string
      escape_content?: string
      escape_result?: string
      escape_action?: string
      gas_content?: string
      gas_result?: string
      gas_action?: string
      etc_content?: string
      etc_result?: string
      etc_action?: string
    }

    const {
      manager_name = '',
      fire_content = '',
      fire_result = 'ok',
      fire_action = '',
      escape_content = '',
      escape_result = 'ok',
      escape_action = '',
      gas_content = '',
      gas_result = '',
      gas_action = '',
      etc_content = '',
      etc_result = '',
      etc_action = '',
    } = body

    const [year, month] = ym.split('-').map(Number)
    const staffId = (ctx as any).data?.staffId

    await ctx.env.DB.prepare(
      `INSERT INTO work_logs
        (year_month, year, month, manager_name, fire_content, fire_result, fire_action,
         escape_content, escape_result, escape_action,
         gas_content, gas_result, gas_action,
         etc_content, etc_result, etc_action,
         updated_by, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(year_month) DO UPDATE SET
         manager_name=excluded.manager_name,
         fire_content=excluded.fire_content,
         fire_result=excluded.fire_result,
         fire_action=excluded.fire_action,
         escape_content=excluded.escape_content,
         escape_result=excluded.escape_result,
         escape_action=excluded.escape_action,
         gas_content=excluded.gas_content,
         gas_result=excluded.gas_result,
         gas_action=excluded.gas_action,
         etc_content=excluded.etc_content,
         etc_result=excluded.etc_result,
         etc_action=excluded.etc_action,
         updated_by=excluded.updated_by,
         updated_at=excluded.updated_at`
    ).bind(
      ym, year, month,
      manager_name, fire_content, fire_result, fire_action,
      escape_content, escape_result, escape_action,
      gas_content, gas_result, gas_action,
      etc_content, etc_result, etc_action,
      staffId
    ).run()

    const row = await ctx.env.DB.prepare(
      `SELECT * FROM work_logs WHERE year_month = ?`
    ).bind(ym).first()
    return jsonOk(row)
  } catch (e) {
    console.error('work-logs PUT error:', e)
    return jsonError(500, '서버 오류')
  }
}

// DELETE /api/work-logs/:ym — admin only
export const onRequestDelete: PagesFunction<Env> = async (ctx) => {
  const denied = requireAdmin(ctx)
  if (denied) return denied

  const ym = ctx.params.yearMonth as string
  if (!YM_RE.test(ym)) return jsonError(400, '유효하지 않은 월 형식입니다')

  try {
    await ctx.env.DB.prepare(
      `DELETE FROM work_logs WHERE year_month = ?`
    ).bind(ym).run()
    return jsonOk({ deleted: true })
  } catch (e) {
    console.error('work-logs DELETE error:', e)
    return jsonError(500, '서버 오류')
  }
}
