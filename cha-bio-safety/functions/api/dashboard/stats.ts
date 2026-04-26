import type { Env } from '../../_middleware'
import { todayKST } from '../../utils/kst'
import { addMonths, differenceInDays, parseISO } from 'date-fns'

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
// 방화문 점검은 피난계단 점검과 동시 수행되므로 기록이 '특별피난계단' 카테고리에 남는다.
// (컴프레셔/DIV 는 카드가 분리돼 있고 카테고리도 독립 → 매핑하지 않는다.)
const CATEGORY_ALIAS: Record<string, string> = {
  '방화문': '특별피난계단',
}

/**
 * 점검 연속 달성일 계산
 * - 오늘부터 과거로 거슬러 올라가며, inspect 일정이 있는 날만 카운트
 * - 해당 날의 모든 inspect 일정이 완료됐으면 streak +1, 하나라도 미완이면 중단
 * - 멀티데이 점검(DIV, 소화기 등): attribution window(현재 일정~다음 같은 카테고리 일정) 내
 *   기록이 있으면 완료로 판정 → 2~3일 기간을 하나의 단위로 취급
 * - inspect 일정이 없는 날(주말/공휴일)은 건너뜀 (streak 끊지 않음)
 * - 최대 90일까지만 확인
 */
async function calcStreakDays(env: { DB: D1Database }, today: string): Promise<number> {
  try {
    // 최근 90일 inspect 일정 가져오기
    const d90 = new Date(today)
    d90.setDate(d90.getDate() - 90)
    const from = d90.toISOString().slice(0, 10)

    const rows = await env.DB.prepare(`
      SELECT date, inspection_category
      FROM schedule_items
      WHERE date BETWEEN ? AND ? AND category = 'inspect' AND inspection_category IS NOT NULL
      ORDER BY date DESC
    `).bind(from, today).all<{ date: string; inspection_category: string }>()

    if (!rows.results?.length) return 0

    // 날짜별 inspect 카테고리 그룹핑
    const dateMap = new Map<string, string[]>()
    for (const r of rows.results) {
      const cats = dateMap.get(r.date) ?? []
      cats.push(r.inspection_category)
      dateMap.set(r.date, cats)
    }

    // 카테고리별 다음 일정 날짜 캐시 (attribution window 계산용)
    const nextSchedCache = new Map<string, Map<string, string | null>>()

    async function getNextSchedDate(cat: string, date: string): Promise<string | null> {
      let catCache = nextSchedCache.get(cat)
      if (!catCache) { catCache = new Map(); nextSchedCache.set(cat, catCache) }
      if (catCache.has(date)) return catCache.get(date)!
      const r = await env.DB.prepare(`
        SELECT date FROM schedule_items
        WHERE date > ? AND category = 'inspect' AND inspection_category = ?
        ORDER BY date ASC LIMIT 1
      `).bind(date, cat).first<{ date: string }>()
      const val = r?.date ?? null
      catCache.set(date, val)
      return val
    }

    // 오늘부터 과거로 — inspect 일정이 있는 날만 체크
    let streak = 0
    const sortedDates = [...dateMap.keys()].sort().reverse() // 최신순

    for (const date of sortedDates) {
      const cats = dateMap.get(date)!
      let allDone = true

      for (const cat of cats) {
        const cpCat = CATEGORY_ALIAS[cat] ?? cat
        const nextDate = await getNextSchedDate(cat, date)

        let rec
        if (nextDate) {
          rec = await env.DB.prepare(`
            SELECT 1 FROM check_records cr
            JOIN check_points cp ON cr.checkpoint_id = cp.id
            WHERE cp.category = ?
              AND date(cr.checked_at) >= ?
              AND date(cr.checked_at) < ?
              -- 260426-f54: 완료 = normal | caution | (bad + resolved)
              AND (cr.result IN ('normal','caution') OR (cr.result='bad' AND cr.status='resolved'))
            LIMIT 1
          `).bind(cpCat, date, nextDate).first()
        } else {
          rec = await env.DB.prepare(`
            SELECT 1 FROM check_records cr
            JOIN check_points cp ON cr.checkpoint_id = cp.id
            WHERE cp.category = ?
              AND date(cr.checked_at) >= ?
              -- 260426-f54: 완료 = normal | caution | (bad + resolved)
              AND (cr.result IN ('normal','caution') OR (cr.result='bad' AND cr.status='resolved'))
            LIMIT 1
          `).bind(cpCat, date).first()
        }

        if (!rec) { allDone = false; break }
      }

      if (allDone) {
        streak++
      } else {
        // 오늘이 미완이면 streak=0, 과거 날짜가 미완이면 거기서 끊김
        break
      }
    }

    return streak
  } catch (e) {
    console.error('calcStreakDays error:', e)
    return 0
  }
}

export const onRequestGet: PagesFunction<Env> = async ({ env, data }) => {
  try {
    const today = todayKST()
    const { start, end } = getWeekBounds(today)
    const todayDow = new Date(today).getDay() // 1=월…5=금

    // ── 오늘 일정 ───────────────────────────────────────
    const schedRows = await env.DB.prepare(`
      SELECT id, title, date, time, category, status, inspection_category, memo
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

    // 오늘 inspect 일정이 걸린 카테고리마다, 해당 카테고리의 "오늘 포함 연속 일정 블록"
    // 시작일부터 오늘까지의 범위로 완료 개소를 집계한다.
    // 예: 소화전이 4/22·4/23·4/24 세 날짜에 연속 등록돼 있고 오늘이 4/24면
    //     block=[4/22, 4/24] 로 합산 → 월간 카드(97%)와 수치 정합.
    const todayCats = await env.DB.prepare(
      `SELECT DISTINCT inspection_category FROM schedule_items
       WHERE date=? AND category='inspect' AND inspection_category IS NOT NULL`
    ).bind(today).all<{ inspection_category: string }>()

    let inspDoneN = 0
    for (const row of (todayCats.results ?? [])) {
      const cat = row.inspection_category
      // 같은 카테고리의 직전 30일치 일정 날짜 수집 후 오늘로부터 연속 블록 시작일 계산
      const prevDates = await env.DB.prepare(
        `SELECT date FROM schedule_items
         WHERE category='inspect' AND inspection_category=?
           AND date <= ? AND date >= date(?, '-30 days')`
      ).bind(cat, today, today).all<{ date: string }>()
      const dateSet = new Set((prevDates.results ?? []).map(r => r.date))
      let blockStart = today
      // 달력 기준 연속 — 하루 전날 같은 카테고리 일정이 있으면 블록 확장
      while (true) {
        const d = new Date(blockStart + 'T00:00:00Z')
        d.setUTCDate(d.getUTCDate() - 1)
        const prev = d.toISOString().slice(0, 10)
        if (dateSet.has(prev)) blockStart = prev
        else break
      }

      const recQ = await env.DB.prepare(
        `SELECT COUNT(DISTINCT cr.checkpoint_id) as n
         FROM check_records cr
         JOIN check_points cp ON cr.checkpoint_id=cp.id
         -- 260426-f54: 완료 = normal | caution | (bad + resolved)
         WHERE cp.category=? AND (cr.result IN ('normal','caution') OR (cr.result='bad' AND cr.status='resolved'))
           AND date(cr.checked_at) BETWEEN ? AND ?`
      ).bind(cat, blockStart, today).first<{ n: number }>()
      const autoQ = await env.DB.prepare(
        `SELECT COUNT(*) as n FROM check_points cp
         WHERE cp.is_active=1 AND cp.category=?
           AND (cp.default_result IS NOT NULL OR cp.description LIKE '%접근불가%')
           AND cp.id NOT IN (
             SELECT checkpoint_id FROM check_records
             WHERE date(checked_at) BETWEEN ? AND ?
           )`
      ).bind(cat, blockStart, today).first<{ n: number }>()
      inspDoneN += (recQ?.n ?? 0) + (autoQ?.n ?? 0)
    }
    const inspDone = { n: inspDoneN }

    const unresolved = await env.DB.prepare(`
      SELECT COUNT(*) as n FROM check_records
      WHERE result IN ('bad','caution')
        AND (status IS NULL OR status = 'open')
        AND date(checked_at) >= date('now','+9 hours','-30 days')
    `).first<{n:number}>()

    // ── 승강기 고장/수리중 합산 ──────────────────────────
    const elevatorFault = await env.DB.prepare(`
      SELECT COUNT(*) as n FROM elevators
      WHERE status IN ('fault','maintenance')
    `).first<{n:number}>()

    // ── 승강기 검사 도래/초과 건수 ───────────────────────
    const elevInspRows = await env.DB.prepare(`
      SELECT e.id, e.type, e.install_year, MAX(i.inspect_date) AS last_date
      FROM elevators e
      LEFT JOIN elevator_inspections i ON i.elevator_id = e.id AND i.type = 'annual'
      GROUP BY e.id
    `).all<{ id: string; type: string; install_year: number | null; last_date: string | null }>()

    const todayDate = new Date(today)
    todayDate.setHours(0, 0, 0, 0)
    const todayPlus30 = new Date(todayDate)
    todayPlus30.setDate(todayDate.getDate() + 30)

    function getElevCycleMonths(type: string, installYear: number | null): number {
      if (installYear !== null && (todayDate.getFullYear() - installYear) >= 25) return 6
      if (type === 'passenger' || type === 'escalator') return 12
      return 24
    }

    let elevInspDueSoon = 0
    for (const r of (elevInspRows.results ?? [])) {
      if (!r.last_date) { elevInspDueSoon++; continue }
      const cycleMonths = getElevCycleMonths(r.type, r.install_year)
      const nextDate = addMonths(parseISO(r.last_date), cycleMonths)
      const days = differenceInDays(nextDate, todayDate)
      if (days <= 90) elevInspDueSoon++
    }

    // ── 이번 달 점검 진척도 ──────────────────────────
    const monthStart = `${today.slice(0,7)}-01`
    const monthEnd   = (() => {
      const [y, m] = today.split('-').map(Number)
      const lastDay = new Date(y, m, 0).getDate()
      return `${y}-${String(m).padStart(2,'0')}-${String(lastDay).padStart(2,'0')}`
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

    // 유도등: floor_plan_markers에서 총 수 조회
    const glMarkerCount = await env.DB.prepare(
      `SELECT COUNT(*) as n FROM floor_plan_markers WHERE plan_type='guidelamp'`
    ).first<{n:number}>()
    const GL_TOTAL = glMarkerCount?.n ?? 674

    for (const sched of (monthScheds.results ?? [])) {
      const schedKey = sched.inspection_category
      if (seen.has(schedKey)) continue
      seen.add(schedKey)

      const cpCategory = CATEGORY_ALIAS[sched.inspection_category] ?? sched.inspection_category

      // 유도등: 일정 status='done' 기준으로 100% 판정
      if (sched.inspection_category === '유도등') {
        const schedDoneQ = await env.DB.prepare(
          `SELECT COUNT(*) as n FROM schedule_items WHERE date BETWEEN ? AND ? AND category='inspect' AND inspection_category='유도등' AND status='done'`
        ).bind(monthStart, monthEnd).first<{n:number}>()
        const isDone = (schedDoneQ?.n ?? 0) > 0
        const label = sched.title.length > 10 ? sched.title.slice(0, 10) + '…' : sched.title
        monthlyItems.push({
          label,
          pct: isDone ? 100 : 0,
          color: isDone ? ITEM_COLORS[monthlyItems.length % ITEM_COLORS.length] : '#52525b',
          total: GL_TOTAL,
          done: isDone ? GL_TOTAL : 0,
        })
        continue
      }

      // check_points 기반 카테고리
      const t = await env.DB.prepare(
        `SELECT COUNT(*) as n FROM check_points WHERE category=? AND is_active=1`
      ).bind(cpCategory).first<{n:number}>()
      const cpTotal = t?.n ?? 0

      // check_points에 없는 항목 (CCTV, 회전문, 주차장비 등): status='done' 또는 inspection_session 존재 여부
      if (cpTotal === 0) {
        // 방법1: status가 done인지
        const schedDone = await env.DB.prepare(
          `SELECT COUNT(*) as n FROM schedule_items WHERE date BETWEEN ? AND ? AND category='inspect' AND inspection_category=? AND status='done'`
        ).bind(monthStart, monthEnd, sched.inspection_category).first<{n:number}>()
        // 방법2: 해당 카테고리 check_records가 있는지 (inspect 일정은 status가 안 바뀌는 경우 대비)
        const hasRecord = await env.DB.prepare(`
          SELECT 1 FROM check_records cr
          JOIN check_points cp ON cr.checkpoint_id = cp.id
          WHERE cp.category = ?
            AND date(cr.checked_at) BETWEEN ? AND ?
            -- 260426-f54: 완료 = normal | caution | (bad + resolved)
            AND (cr.result IN ('normal','caution') OR (cr.result='bad' AND cr.status='resolved'))
          LIMIT 1
        `).bind(cpCategory, monthStart, monthEnd).first()
        const isDone = (schedDone?.n ?? 0) > 0 || !!hasRecord
        const label = sched.title.length > 10 ? sched.title.slice(0, 10) + '…' : sched.title
        monthlyItems.push({
          label,
          pct: isDone ? 100 : 0,
          color: isDone ? ITEM_COLORS[monthlyItems.length % ITEM_COLORS.length] : '#52525b',
          total: 1,
          done: isDone ? 1 : 0,
        })
        continue
      }

      // check_points 기반 카테고리: 기존 로직
      const d = await env.DB.prepare(`
        SELECT COUNT(DISTINCT cr.checkpoint_id) as n
        FROM check_records cr
        JOIN check_points cp ON cr.checkpoint_id=cp.id
        WHERE cp.category=? AND date(cr.checked_at) BETWEEN ? AND ?
          -- 260426-f54: 완료 = normal | caution | (bad + resolved)
          AND (cr.result IN ('normal','caution') OR (cr.result='bad' AND cr.status='resolved'))
      `).bind(cpCategory, monthStart, monthEnd).first<{n:number}>()
      const autoN = await env.DB.prepare(
        `SELECT COUNT(*) as n FROM check_points cp WHERE cp.category=? AND cp.is_active=1 AND (cp.default_result IS NOT NULL OR cp.description LIKE '%접근불가%') AND cp.id NOT IN (SELECT checkpoint_id FROM check_records cr JOIN check_points cp2 ON cr.checkpoint_id=cp2.id WHERE cp2.category=? AND date(cr.checked_at) BETWEEN ? AND ?)`
      ).bind(cpCategory, cpCategory, monthStart, monthEnd).first<{n:number}>()

      const total = cpTotal
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

    // ── 이번 달 일정 날짜별 카테고리 (캘린더 dot용) ────
    const monthDatesRows = await env.DB.prepare(`
      SELECT date, category FROM schedule_items
      WHERE date BETWEEN ? AND ?
      ORDER BY date ASC
    `).bind(monthStart, monthEnd).all<{date:string; category:string}>()

    const monthScheduleDates: Record<string, string[]> = {}
    for (const r of (monthDatesRows.results ?? [])) {
      const day = r.date.slice(8, 10).replace(/^0/, '') // "01" → "1"
      if (!monthScheduleDates[day]) monthScheduleDates[day] = []
      if (!monthScheduleDates[day].includes(r.category)) monthScheduleDates[day].push(r.category)
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
          streakDays:     await calcStreakDays(env, today),
          elevInspDueSoon,
        },
        todaySchedule: await Promise.all(
          (schedRows.results ?? []).map(async (r: any) => {
            let completed = false

            if (r.category === 'inspect' && r.inspection_category) {
              // Per D-17: date+category auto-matching via check_records JOIN check_points
              // Per D-18: 1+ check records = completed
              // Per D-20: date range = schedule date to day before next same-category schedule date
              const cpCat = CATEGORY_ALIAS[r.inspection_category] ?? r.inspection_category

              // D-20: Find next same-category schedule date to determine attribution window
              const nextSched = await env.DB.prepare(`
                SELECT date FROM schedule_items
                WHERE date > ? AND category = 'inspect' AND inspection_category = ?
                ORDER BY date ASC LIMIT 1
              `).bind(r.date, r.inspection_category).first<{date:string}>()

              let rec
              if (nextSched?.date) {
                // Range: [r.date, nextSched.date) — records on or after schedule date, before next schedule
                rec = await env.DB.prepare(`
                  SELECT 1 FROM check_records cr
                  JOIN check_points cp ON cr.checkpoint_id = cp.id
                  WHERE cp.category = ?
                    AND date(cr.checked_at) >= ?
                    AND date(cr.checked_at) < ?
                    -- 260426-f54: 완료 = normal | caution | (bad + resolved)
                    AND (cr.result IN ('normal','caution') OR (cr.result='bad' AND cr.status='resolved'))
                  LIMIT 1
                `).bind(cpCat, r.date, nextSched.date).first()
              } else {
                // No next schedule: open-ended range from schedule date onward
                rec = await env.DB.prepare(`
                  SELECT 1 FROM check_records cr
                  JOIN check_points cp ON cr.checkpoint_id = cp.id
                  WHERE cp.category = ?
                    AND date(cr.checked_at) >= ?
                    -- 260426-f54: 완료 = normal | caution | (bad + resolved)
                    AND (cr.result IN ('normal','caution') OR (cr.result='bad' AND cr.status='resolved'))
                  LIMIT 1
                `).bind(cpCat, r.date).first()
              }
              completed = !!rec
              // inspect 일정이 완료 판정되면 status도 done으로 동기화
              if (completed && r.status !== 'done') {
                await env.DB.prepare(`UPDATE schedule_items SET status='done' WHERE id=?`).bind(r.id).run()
              }
            } else {
              // Per D-19: non-inspect items use manual status='done'
              completed = r.status === 'done'
            }

            return {
              id:        r.id,
              title:     r.title,
              date:      r.date,
              time:      r.time ?? undefined,
              category:  r.category,
              status:    r.status,
              completed,
              memo:      r.memo ?? undefined,
            }
          })
        ),
        onDutyStaff: (staffRows.results ?? []).map(r => ({
          id:        r.id,
          name:      r.name,
          role:      r.role,
          title:     r.title,
          shiftType: r.shift_type ?? undefined,
        })),
        monthlyItems,
        todayTarget,
        monthScheduleDates,
      },
    })
  } catch (e) {
    console.error('dashboard stats error:', e)
    return Response.json({ success:false, error:'서버 오류' }, { status:500 })
  }
}
