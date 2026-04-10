import type { Env } from '../../../_middleware'
import { jsonOk, jsonError } from '../../documents/_helpers'

const YM_RE = /^\d{4}-(0[1-9]|1[0-2])$/

// GET /api/work-logs/:ym/preview — 자동 집계 미리보기 (remediation + schedule_items 기반)
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const ym = ctx.params.yearMonth as string
  if (!YM_RE.test(ym)) return jsonError(400, '유효하지 않은 월 형식입니다')

  try {
    const [year, month] = ym.split('-').map(Number)

    // KST 월 범위
    const startKST = `${ym}-01T00:00:00+09:00`
    const nextMonth = month === 12
      ? `${year + 1}-01`
      : `${year}-${String(month + 1).padStart(2, '0')}`
    const endKST = `${nextMonth}-01T00:00:00+09:00`

    // D-16: manager_name — role='admin' 중 가장 먼저 임명된 직원
    const managerRow = await ctx.env.DB.prepare(
      `SELECT name FROM staff WHERE role='admin' ORDER BY appointed_at ASC LIMIT 1`
    ).first<{ name: string }>()
    const manager_name = managerRow?.name ?? ''

    // D-17: fire_content — 소화설비 점검 항목 (정적)
    const fire_content =
      '소화기 - 압력, 약제 상태\n소화전 - 호스, 관창 상태, 표시등 상태\nS/P - 밸브 개폐 상태, 압력 상태\n소방 펌프 - 수동 기동 점검'

    // D-17/D-22: fire_action — 소화설비 카테고리 조치 완료 이력
    const fireRows = await ctx.env.DB.prepare(
      `SELECT cp.category, cp.location, r.memo, r.resolution_memo
       FROM check_records r
       JOIN check_points cp ON cp.id = r.checkpoint_id
       WHERE r.status = 'resolved'
         AND r.result IN ('bad', 'caution')
         AND cp.category IN ('소화기', '소화전', '스프링클러헤드', '소방펌프')
         AND r.resolved_at >= ? AND r.resolved_at < ?
       ORDER BY r.resolved_at ASC`
    ).bind(startKST, endKST).all()
    const fire_action = (fireRows.results ?? [])
      .map((r: any) => `${r.location} ${r.category}: ${r.resolution_memo || r.memo}`)
      .join('\n')

    // D-17: fire_result
    const fire_result: 'ok' | 'bad' = fire_action === '' ? 'ok' : 'bad'

    // D-18: escape_content — 피난설비 점검 항목 (정적)
    const escape_content =
      '방화셔터 - 작동 상태 점검\n방화문 - 닫힘상태, 도어 체크 상태\n유도등 - 점등 상태, 전원 상태'

    // D-18/D-22: escape_action — 피난설비 카테고리 조치 완료 이력
    // '방화문' → '특별피난계단' mapping (actual DB category, see RESEARCH D-22)
    const escapeRows = await ctx.env.DB.prepare(
      `SELECT cp.category, cp.location, r.memo, r.resolution_memo
       FROM check_records r
       JOIN check_points cp ON cp.id = r.checkpoint_id
       WHERE r.status = 'resolved'
         AND r.result IN ('bad', 'caution')
         AND cp.category IN ('방화셔터', '특별피난계단', '유도등')
         AND r.resolved_at >= ? AND r.resolved_at < ?
       ORDER BY r.resolved_at ASC`
    ).bind(startKST, endKST).all()
    const escape_action = (escapeRows.results ?? [])
      .map((r: any) => `${r.location} ${r.category}: ${r.resolution_memo || r.memo}`)
      .join('\n')

    // D-18: escape_result
    const escape_result: 'ok' | 'bad' = escape_action === '' ? 'ok' : 'bad'

    // D-19: gas_content — 가스시설 위치 (정적)
    const gas_content = 'B1F - 직원식당\nB4F - 보일러'

    // D-20: etc_content — 해당 월 소방 일정 제목 목록
    const lastDay = String(new Date(year, month, 0).getDate()).padStart(2, '0')
    const scheduleRows = await ctx.env.DB.prepare(
      `SELECT title FROM schedule_items
       WHERE inspection_category = '소방'
         AND date >= ? AND date <= ?
       ORDER BY date ASC`
    ).bind(`${ym}-01`, `${ym}-${lastDay}`).all()
    const etc_content = (scheduleRows.results ?? [])
      .map((r: any) => r.title)
      .join('\n')

    return jsonOk({
      manager_name,
      fire_content,
      fire_result,
      fire_action,
      escape_content,
      escape_result,
      escape_action,
      gas_content,
      etc_content,
    })
  } catch (e) {
    console.error('work-logs preview error:', e)
    return jsonError(500, '서버 오류')
  }
}
