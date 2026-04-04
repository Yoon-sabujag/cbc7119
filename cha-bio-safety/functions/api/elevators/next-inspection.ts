import type { Env } from '../../_middleware'
import { addMonths, differenceInDays, parseISO } from 'date-fns'

type ElevatorRow = {
  id: string
  number: number
  type: string
  install_year: number | null
  last_date: string | null
}

/**
 * Determine inspection cycle in months per 승강기안전관리법 시행규칙 제54조.
 * - install_year >= 25 years ago => 6 months
 * - passenger | escalator       => 12 months
 * - cargo | dumbwaiter           => 24 months
 */
function getCycleMonths(type: string, installYear: number | null, today: Date): number {
  if (installYear !== null && (today.getFullYear() - installYear) >= 25) return 6
  if (type === 'passenger' || type === 'escalator') return 12
  return 24  // cargo, dumbwaiter
}

// GET /api/elevators/next-inspection
// Returns per-elevator next inspection dates and status
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const rows = await env.DB.prepare(`
      SELECT
        e.id,
        e.number,
        e.type,
        e.install_year,
        MAX(i.inspect_date) AS last_date
      FROM elevators e
      LEFT JOIN elevator_inspections i
        ON i.elevator_id = e.id AND i.type = 'annual'
      GROUP BY e.id
      ORDER BY e.number
    `).all<ElevatorRow>()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const data = (rows.results ?? []).map(r => {
      const cycleMonths = getCycleMonths(r.type, r.install_year, today)
      const lastDate = r.last_date ?? null

      if (!lastDate) {
        return {
          elevatorId:      r.id,
          elevatorNumber:  r.number,
          elevatorType:    r.type,
          installYear:     r.install_year,
          lastDate:        null,
          nextDate:        null,
          cycleMonths,
          status:          'no_record' as const,
          daysUntil:       null,
        }
      }

      const nextDate = addMonths(parseISO(lastDate), cycleMonths)
      const days = differenceInDays(nextDate, today)

      let status: 'ok' | 'due_soon' | 'overdue'
      if (days < 0)       status = 'overdue'
      else if (days <= 30) status = 'due_soon'
      else                status = 'ok'

      return {
        elevatorId:      r.id,
        elevatorNumber:  r.number,
        elevatorType:    r.type,
        installYear:     r.install_year,
        lastDate:        lastDate,
        nextDate:        nextDate.toISOString().slice(0, 10),
        cycleMonths,
        status,
        daysUntil:       days,
      }
    })

    return Response.json({ success: true, data })
  } catch (e) {
    console.error('[elevators/next-inspection GET]', e)
    return Response.json({ success: false, error: '다음 검사일 조회 실패' }, { status: 500 })
  }
}
