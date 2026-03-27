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

const WEEK_ITEMS = [
  { day:'월', label:'소화기\n점검',     category:'소화기'          },
  { day:'화', label:'스프링클러\n점검', category:'스프링클러헤드'  },
  { day:'수', label:'DIV\n점검',       category:'DIV'            },
  { day:'목', label:'수신기\n점검',     category:'P형수신기'       },
  { day:'금', label:'승강기\n점검',     category:'승강기'          },
]
const COLORS = ['#22c55e','#3b82f6','#f59e0b','#0ea5e9','#8b5cf6']

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

    const inspDone = await env.DB.prepare(`
      SELECT COUNT(DISTINCT cr.checkpoint_id) as n
      FROM check_records cr
      JOIN check_points cp ON cr.checkpoint_id=cp.id
      WHERE date(cr.checked_at)=? AND cr.result IN ('normal','caution')
        AND cp.category IN (
          SELECT inspection_category FROM schedule_items
          WHERE date=? AND category='inspect' AND inspection_category IS NOT NULL
        )
    `).bind(today, today).first<{n:number}>()

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

    // ── 주간 카테고리별 달성률 ──────────────────────────
    const weeklyMap: Record<string, { total:number; done:number }> = {}
    for (const item of WEEK_ITEMS) {
      const tot = await env.DB.prepare(
        `SELECT COUNT(*) as n FROM check_points WHERE category=? AND is_active=1`
      ).bind(item.category).first<{n:number}>()
      const done = await env.DB.prepare(`
        SELECT COUNT(DISTINCT cr.checkpoint_id) as n
        FROM check_records cr
        JOIN check_points cp ON cr.checkpoint_id=cp.id
        WHERE cp.category=? AND date(cr.checked_at) BETWEEN ? AND ?
          AND cr.result IN ('normal','caution')
      `).bind(item.category, start, end).first<{n:number}>()
      weeklyMap[item.category] = { total: tot?.n ?? 0, done: done?.n ?? 0 }
    }

    const weeklyItems = WEEK_ITEMS.map((item, i) => {
      const { total, done } = weeklyMap[item.category] ?? { total:0, done:0 }
      const pct = total > 0 ? Math.round((done / total) * 100) : 0
      // 오늘이 해당 요일인지 (월=1…금=5)
      const isToday = (todayDow === i + 1)
      return {
        day:     item.day,
        label:   item.label,
        pct,
        color:   pct === 0 ? '#52525b' : COLORS[i],
        isToday,
      }
    })

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
        weeklyItems,
        todayTarget,
      },
    })
  } catch (e) {
    console.error('dashboard stats error:', e)
    return Response.json({ success:false, error:'서버 오류' }, { status:500 })
  }
}
