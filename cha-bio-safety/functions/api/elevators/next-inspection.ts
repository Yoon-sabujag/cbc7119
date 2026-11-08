import type { Env } from '../../_middleware'
import { addMonths, differenceInDays, parseISO } from 'date-fns'

type ElevatorRow = {
  id: string
  number: number
  type: string
  install_year: number | null
  last_date: string | null
  cert_no: string | null
  cert_key: string | null
}

type HistoryRow = {
  elevator_no: string
  inspect_date: string
  valid_end: string | null
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
// Returns per-elevator next inspection dates and status.
// 2소스 우선순위:
// ①공단 공식 이력(elevator_inspect_history)의 최신 레코드 valid_end 가 1순위
// ②없거나 비면 자체점검(elevator_inspections) MAX + cycleMonths 폴백
// ③둘 다 없으면 no_record
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const rows = await env.DB.prepare(`
      SELECT
        e.id,
        e.number,
        e.type,
        e.install_year,
        MAX(i.inspect_date) AS last_date,
        e.cert_no,
        REPLACE(e.cert_no, '-', '') AS cert_key
      FROM elevators e
      LEFT JOIN elevator_inspections i
        ON i.elevator_id = e.id AND i.type = 'annual'
      GROUP BY e.id
      ORDER BY e.number
    `).all<ElevatorRow>()

    const historyRows = await env.DB.prepare(`
      SELECT elevator_no, inspect_date, valid_end
      FROM elevator_inspect_history
      WHERE elevator_no IS NOT NULL AND inspect_date IS NOT NULL
      ORDER BY elevator_no, inspect_date DESC
    `).all<HistoryRow>()

    // elevator_no 별 최신 1건만 = inspect_date DESC 정렬의 첫 등장
    const officialMap = new Map<string, HistoryRow>()
    for (const h of historyRows.results ?? []) {
      if (!officialMap.has(h.elevator_no)) {
        officialMap.set(h.elevator_no, h)
      }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const data = (rows.results ?? []).map(r => {
      const cycleMonths = getCycleMonths(r.type, r.install_year, today)

      const official = r.cert_key ? officialMap.get(r.cert_key) ?? null : null

      let useOfficial = false
      let officialNextDate: Date | null = null
      if (official && official.valid_end) {
        const parsed = parseISO(official.valid_end)
        if (!Number.isNaN(parsed.getTime())) {
          useOfficial = true
          officialNextDate = parsed
        }
      }

      const lastDate: string | null = useOfficial
        ? official!.inspect_date
        : (r.last_date ?? null)

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

      const nextDate = useOfficial
        ? officialNextDate!
        : addMonths(parseISO(lastDate), cycleMonths)
      const days = differenceInDays(nextDate, today)

      let status: 'ok' | 'due_soon' | 'overdue'
      if (days < 0)       status = 'overdue'
      else if (days <= 90) status = 'due_soon'
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
