import type { Env } from '../../_middleware'

function getWeekBounds(today: string) {
  const d   = new Date(today)
  const dow = d.getDay()           // 0=일
  const mon = new Date(d)
  mon.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  const fri = new Date(mon)
  fri.setDate(mon.getDate() + 4)
  return {
    start: mon.toISOString().slice(0,10),
    end:   fri.toISOString().slice(0,10),
  }
}

const DOW_LABELS = ['일','월','화','수','목','금','토']
const DOW_COLORS = ['#52525b','#22c55e','#3b82f6','#f59e0b','#0ea5e9','#8b5cf6','#52525b']

// 일정 카테고리 → 실제 체크포인트 카테고리 매핑
// 방화문 점검은 피난계단 점검과 동시 수행, 컴프레셔는 DIV와 동시 수행
const CATEGORY_ALIAS: Record<string, string> = {
  '방화문': '특별피난계단',
  '컴프레셔': 'DIV',
}

export const onRequestGet: PagesFunction<Env> = async ({ env, data }) => {
  try {
    const today = new Date().toISOString().slice(0,10)
    const { start, end } = getWeekBounds(today)
    const todayDow = new Date(today).getDay() // 1=월…5=금

    // ── 오늘 일정 ───────────────────────────────────────
    const schedRows = await env.DB.prepare(`
      SELECT id, title, date, time, category, status
      FROM schedule_items
      WHERE date = ?
      ORDER BY CASE WHEN time IS NULL THEN 1 ELSE 0 END, time ASC
    `).bind(today).all<Record<string,string>>()

    // ── 통계 ────────────────────────────────────────────
    // 오늘 inspect 일정의 inspection_category 기준 목표 개소
    const inspTot = await env.DB.prepare(`
      SELECT COUNT(*) as n FROM check_points
      WHERE is_active=1
        AND category IN (
          SELECT inspection_category FROM schedule_items
          WHERE date=? AND category='inspect' AND inspection_category IS NOT NULL
        )
    `).bind(today).first<{n:number}>()

    // 점검 기록 + 접근불가(default_result) 항목 합산
    const inspDoneRecords = await env.DB.prepare(`
      SELECT COUNT(DISTINCT cr.checkpoint_id) as n
      FROM check_records cr
      JOIN check_points cp ON cr.checkpoint_id=cp.id
      WHERE date(cr.checked_at)=? AND cr.result IN ('normal','caution')
        AND cp.category IN (
          SELECT inspection_category FROM schedule_items
          WHERE date=? AND category='inspect' AND inspection_category IS NOT NULL
        )
    `).bind(today, today).first<{n:number}>()
    const inspDoneAuto = await env.DB.prepare(`
      SELECT COUNT(*) as n FROM check_points cp
      WHERE cp.is_active=1 AND cp.default_result IS NOT NULL
        AND cp.category IN (
          SELECT inspection_category FROM schedule_items
          WHERE date=? AND category='inspect' AND inspection_category IS NOT NULL
        )
        AND cp.id NOT IN (SELECT checkpoint_id FROM check_records WHERE date(checked_at)=?)
    `).bind(today, today).first<{n:number}>()
    const inspDone = { n: (inspDoneRecords?.n ?? 0) + (inspDoneAuto?.n ?? 0) }

    const unresolved = await env.DB.prepare(`
      SELECT COUNT(*) as n FROM check_records
      WHERE result IN ('bad','caution')
        AND (status IS NULL OR status = 'open')
        AND date(checked_at) >= date('now','-30 days')
    `).first<{n:number}>()

    // ── 승강기 고장/수리중 합산 ──────────────────────────
    const elevatorFault = await env.DB.prepare(`
      SELECT COUNT(*) as n FROM elevators
      WHERE status IN ('fault','maintenance')
    `).first<{n:number}>()

    // ── 이번 달 점검 진척도 ──────────────────────────
    const monthStart = `${today.slice(0,7)}-01`
    const monthEnd   = (() => {
      const d = new Date(today); d.setMonth(d.getMonth() + 1, 0)
      return d.toISOString().slice(0,10)
    })()

    // 이번 달 inspect 일정을 inspection_category 기준으로 고유 항목 추출
    const monthScheds = await env.DB.prepare(`
      SELECT DISTINCT title, inspection_category
      FROM schedule_items
      WHERE date BETWEEN ? AND ? AND category='inspect' AND inspection_category IS NOT NULL
      ORDER BY date ASC, id ASC
    `).bind(monthStart, monthEnd).all<{title:string; inspection_category:string}>()

    const ITEM_COLORS = ['#22c55e','#3b82f6','#f59e0b','#0ea5e9','#8b5cf6','#ec4899','#f97316','#14b8a6','#6366f1','#84cc16','#ef4444','#06b6d4','#a855f7']
    const monthlyItems: {label:string; pct:number; color:string; total:number; done:number}[] = []
    const seen = new Set<string>()

    for (const sched of (monthScheds.results ?? [])) {
      // 방화문→특별피난계단, 컴프레셔→DIV 매핑
      const cpCategory = CATEGORY_ALIAS[sched.inspection_category] ?? sched.inspection_category
      if (seen.has(cpCategory)) continue
      seen.add(cpCategory)

      const t = await env.DB.prepare(
        `SELECT COUNT(*) as n FROM check_points WHERE category=? AND is_active=1`
      ).bind(cpCategory).first<{n:number}>()
      const d = await env.DB.prepare(`
        SELECT COUNT(DISTINCT cr.checkpoint_id) as n
        FROM check_records cr
        JOIN check_points cp ON cr.checkpoint_id=cp.id
        WHERE cp.category=? AND date(cr.checked_at) BETWEEN ? AND ?
          AND cr.result IN ('normal','caution')
      `).bind(cpCategory, monthStart, monthEnd).first<{n:number}>()
      const autoN = await env.DB.prepare(
        `SELECT COUNT(*) as n FROM check_points cp WHERE cp.category=? AND cp.is_active=1 AND cp.default_result IS NOT NULL AND cp.id NOT IN (SELECT checkpoint_id FROM check_records cr JOIN check_points cp2 ON cr.checkpoint_id=cp2.id WHERE cp2.category=? AND date(cr.checked_at) BETWEEN ? AND ?)`
      ).bind(cpCategory, cpCategory, monthStart, monthEnd).first<{n:number}>()

      const total = t?.n ?? 0
      const done = (d?.n ?? 0) + (autoN?.n ?? 0)
      const pct = total > 0 ? Math.min(Math.round((done / total) * 100), 100) : 0
      const label = sched.title.length > 10 ? sched.title.slice(0, 10) + '…' : sched.title

      monthlyItems.push({
        label,
        pct,
        color: pct === 0 ? '#52525b' : ITEM_COLORS[monthlyItems.length % ITEM_COLORS.length],
        total,
        done,
      })
    }

    // ── 근무자 목록 ─────────────────────────────────────
    const staffRows = await env.DB.prepare(
      `SELECT id, name, role, title, shift_type FROM staff ORDER BY role DESC, id ASC`
    ).all<Record<string,string>>()

    // ── 오늘 점검 대상 (오늘 일정 중 inspect 카테고리) ──
    const todayTarget = (() => {
      const inspectItem = (schedRows.results ?? []).find(r => r.category === 'inspect')
      return inspectItem?.title ?? '오늘 점검 일정 없음'
    })()

    return Response.json({
      success: true,
      data: {
        stats: {
          inspectTotal:  inspTot?.n  ?? 0,
          inspectDone:   inspDone?.n ?? 0,
          scheduleCount:  schedRows.results?.length ?? 0,
          unresolved:     unresolved?.n ?? 0,
          elevatorFault:  elevatorFault?.n ?? 0,
          streakDays:     0,   // TODO: 연속 달성일 계산
        },
        todaySchedule: (schedRows.results ?? []).map(r => ({
          id:       r.id,
          title:    r.title,
          date:     r.date,
          time:     r.time ?? undefined,
          category: r.category,
          status:   r.status,
        })),
        onDutyStaff: (staffRows.results ?? []).map(r => ({
          id:        r.id,
          name:      r.name,
          role:      r.role,
          title:     r.title,
          shiftType: r.shift_type ?? undefined,
        })),
        monthlyItems,
        todayTarget,
      },
    })
  } catch (e) {
    console.error('dashboard stats error:', e)
    return Response.json({ success:false, error:'서버 오류' }, { status:500 })
  }
}
