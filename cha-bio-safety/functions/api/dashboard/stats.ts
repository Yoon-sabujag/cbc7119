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
      SELECT COUNT(*) as n FROM check_points
      WHERE is_active=1 AND default_result IS NOT NULL
        AND category IN (
          SELECT inspection_category FROM schedule_items
          WHERE date=? AND category='inspect' AND inspection_category IS NOT NULL
        )
    `).bind(today).first<{n:number}>()
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

    // ── 주간 일정 기반 달성률 ──────────────────────────
    // 이번 주 월~금 각 날짜의 실제 스케줄에서 점검 일정을 가져옴
    const weekDates: string[] = []
    const monDate = new Date(start)
    for (let i = 0; i < 5; i++) {
      const d = new Date(monDate)
      d.setDate(monDate.getDate() + i)
      weekDates.push(d.toISOString().slice(0, 10))
    }

    const weeklyItems = []
    for (let i = 0; i < 5; i++) {
      const dateStr = weekDates[i]
      const dow = i + 1 // 1=월 ~ 5=금

      // 해당 날짜의 점검(inspect) 일정 조회
      const daySchedules = await env.DB.prepare(`
        SELECT title, inspection_category FROM schedule_items
        WHERE date=? AND category='inspect' AND inspection_category IS NOT NULL
        ORDER BY id ASC
      `).bind(dateStr).all<{title:string; inspection_category:string}>()

      const schedList = daySchedules.results ?? []
      let label = '일정 없음'
      let pct = 0
      let total = 0
      let done = 0

      if (schedList.length > 0) {
        // 첫 번째 점검 일정의 제목을 라벨로 사용
        const firstTitle = schedList[0].title
        label = firstTitle.length > 8 ? firstTitle.slice(0, 8) + '…' : firstTitle

        // 해당 날짜의 모든 점검 카테고리에 대해 개소 수/완료 수 합산
        const cats = [...new Set(schedList.map(s => s.inspection_category))]
        for (const cat of cats) {
          const t = await env.DB.prepare(
            `SELECT COUNT(*) as n FROM check_points WHERE category=? AND is_active=1`
          ).bind(cat).first<{n:number}>()
          const d = await env.DB.prepare(`
            SELECT COUNT(DISTINCT cr.checkpoint_id) as n
            FROM check_records cr
            JOIN check_points cp ON cr.checkpoint_id=cp.id
            WHERE cp.category=? AND date(cr.checked_at) BETWEEN ? AND ?
              AND cr.result IN ('normal','caution')
          `).bind(cat, start, dateStr).first<{n:number}>()
          // 접근불가 항목도 완료로 카운트
          const autoN = await env.DB.prepare(
            `SELECT COUNT(*) as n FROM check_points WHERE category=? AND is_active=1 AND default_result IS NOT NULL`
          ).bind(cat).first<{n:number}>()
          total += t?.n ?? 0
          done += (d?.n ?? 0) + (autoN?.n ?? 0)
        }
        pct = total > 0 ? Math.round((done / total) * 100) : 0
      }

      weeklyItems.push({
        day:   DOW_LABELS[dow],
        label,
        pct,
        color: pct === 0 ? '#52525b' : DOW_COLORS[dow],
        isToday: todayDow === dow,
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
        weeklyItems,
        todayTarget,
      },
    })
  } catch (e) {
    console.error('dashboard stats error:', e)
    return Response.json({ success:false, error:'서버 오류' }, { status:500 })
  }
}
