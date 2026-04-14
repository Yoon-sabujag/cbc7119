import { buildPushPayload } from '@block65/webcrypto-web-push'

export interface Env {
  DB: D1Database
  VAPID_PUBLIC_KEY: string
  VAPID_PRIVATE_KEY: string
}

interface PushSubRow {
  id: string
  staff_id: string
  endpoint: string
  p256dh: string
  auth: string
  notification_preferences: string
}

interface NotifPrefs {
  daily_schedule: boolean
  incomplete_schedule: boolean
  unresolved_issue: boolean
  education_reminder: boolean
  event_15min: boolean
  event_5min: boolean
}

// ── Send push utility ────────────────────────────────
async function sendPush(
  env: Env,
  sub: PushSubRow,
  payload: { title: string; body: string; type: string }
): Promise<void> {
  try {
    const pushData = await buildPushPayload(
      { data: JSON.stringify(payload) },
      {
        endpoint: sub.endpoint,
        expirationTime: null,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      { subject: 'mailto:admin@chabio.com', publicKey: env.VAPID_PUBLIC_KEY, privateKey: env.VAPID_PRIVATE_KEY }
    )
    const res = await fetch(sub.endpoint, {
      method: pushData.method,
      headers: pushData.headers,
      body: pushData.body,
    })
    if (res.status === 410 || res.status === 404) {
      // Subscription expired — clean up from D1
      await env.DB.prepare('DELETE FROM push_subscriptions WHERE id = ?').bind(sub.id).run()
    }
  } catch (e) {
    console.error(`Push failed for ${sub.staff_id}:`, e)
  }
}

// ── 근무 판정 (DB 기반) ──────────────────────────────
const SHIFT_REF = new Date(2026, 2, 1) // 2026-03-01
const CYCLE = ['당', '비', '주'] as const

function isWeekend(d: Date): boolean {
  const dow = d.getUTCDay()
  return dow === 0 || dow === 6
}

function getShiftRaw(staffId: string, date: Date, shiftMap: Record<string, { offset: number | null; fixed: string | null }>): string {
  const config = shiftMap[staffId]
  if (config?.fixed === 'day') return isWeekend(date) ? '휴' : '주'
  const offset = config?.offset
  if (offset === undefined || offset === null) return isWeekend(date) ? '휴' : '주'
  const diff = Math.round((date.getTime() - SHIFT_REF.getTime()) / 86_400_000)
  const base = CYCLE[(((diff + offset) % 3) + 3) % 3]
  if (base === '주' && isWeekend(date)) return '휴'
  return base
}

async function getWorkingStaffIds(env: Env, kstDate: Date, dateStr: string): Promise<Set<string>> {
  // DB에서 교대 설정 로드
  const staffRows = await env.DB.prepare('SELECT id, shift_offset, shift_fixed FROM staff WHERE active = 1').all<{ id: string; shift_offset: number | null; shift_fixed: string | null }>()
  const shiftMap: Record<string, { offset: number | null; fixed: string | null }> = {}
  for (const r of (staffRows.results ?? [])) shiftMap[r.id] = { offset: r.shift_offset, fixed: r.shift_fixed }

  // 모든 구독자의 staff_id 수집
  const subs = await env.DB.prepare('SELECT DISTINCT staff_id FROM push_subscriptions').all<{ staff_id: string }>()
  const allIds = (subs.results ?? []).map(r => r.staff_id)

  // 근무 패턴으로 비번/휴무 제외
  const working = allIds.filter(id => {
    const shift = getShiftRaw(id, kstDate, shiftMap)
    return shift !== '비' && shift !== '휴'
  })

  // 연차/공가 조회해서 추가 제외
  const ym = dateStr.slice(0, 7)
  const leaves = await env.DB.prepare(
    `SELECT staff_id, type FROM annual_leaves WHERE date = ? AND status != 'rejected'`
  ).bind(dateStr).all<{ staff_id: string; type: string }>()
  const leaveIds = new Set((leaves.results ?? []).map(r => r.staff_id))

  return new Set(working.filter(id => !leaveIds.has(id)))
}

// ── Daily notifications (08:45 KST = 23:45 UTC previous day) ─────
async function handleDailyNotifications(env: Env) {
  // KST date (UTC+9): when cron fires at 23:45 UTC, KST is next day 08:45
  const kstNow = new Date(Date.now() + 9 * 3600 * 1000)
  const today = kstNow.toISOString().slice(0, 10)
  const yesterday = new Date(kstNow.getTime() - 24 * 3600 * 1000).toISOString().slice(0, 10)

  // 근무 중인 직원만 필터
  const workingIds = await getWorkingStaffIds(env, kstNow, today)

  const allDailySubs = await env.DB.prepare(
    'SELECT id, staff_id, endpoint, p256dh, auth, notification_preferences FROM push_subscriptions'
  ).all<PushSubRow>()

  const subs = { results: (allDailySubs.results ?? []).filter(s => workingIds.has(s.staff_id)) }
  if (!subs.results.length) return

  // Batch queries for daily notification types
  const [todaySchedules, yesterdayIncomplete, unresolvedFindings, upcomingEducation] = await Promise.all([
    // 금일 점검 일정 (date range supported via end_date)
    env.DB.prepare(
      `SELECT title FROM schedule_items WHERE date = ? OR (date <= ? AND end_date >= ?)`
    ).bind(today, today, today).all(),
    // 전일 미완료 점검 (status != 'done')
    env.DB.prepare(
      `SELECT title FROM schedule_items WHERE date = ? AND status != 'done'`
    ).bind(yesterday).all(),
    // 미조치 항목 (status = 'bad' AND resolved_at IS NULL)
    env.DB.prepare(
      `SELECT id FROM check_records WHERE status = 'bad' AND resolved_at IS NULL`
    ).all(),
    // 교육 D-30: refresher 주기 2년 가정. completed_at + 2년 - 30일 = today
    // Not all environments compute next_due in DB; derive client-side: we want
    // records where next due date (= completed_at + 2 years) is exactly 30 days from today
    env.DB.prepare(
      `SELECT s.name as staff_name, e.education_type, e.completed_at
       FROM education_records e JOIN staff s ON e.staff_id = s.id
       WHERE date(e.completed_at, '+2 years', '-30 days') = ?`
    ).bind(today).all(),
  ])

  const sends: Promise<void>[] = []

  for (const sub of subs.results) {
    const prefs: NotifPrefs = JSON.parse(sub.notification_preferences)

    // D-02: 금일 점검 일정
    if (prefs.daily_schedule && todaySchedules.results?.length) {
      sends.push(sendPush(env, sub, {
        title: '오늘의 점검 일정',
        body: `${todaySchedules.results.length}건의 점검 일정이 있습니다`,
        type: 'daily_schedule',
      }))
    }

    // D-03: 전일 미완료 점검
    if (prefs.incomplete_schedule && yesterdayIncomplete.results?.length) {
      sends.push(sendPush(env, sub, {
        title: '미완료 점검 알림',
        body: `어제 ${yesterdayIncomplete.results.length}건의 점검이 미완료되었습니다`,
        type: 'incomplete_schedule',
      }))
    }

    // D-04: 미조치 항목
    if (prefs.unresolved_issue && unresolvedFindings.results?.length) {
      sends.push(sendPush(env, sub, {
        title: '미조치 항목 알림',
        body: `${unresolvedFindings.results.length}건의 미조치 항목이 있습니다`,
        type: 'unresolved_issue',
      }))
    }

    // D-05: 교육 D-30 (보수교육 30일 전)
    if (prefs.education_reminder && upcomingEducation.results?.length) {
      sends.push(sendPush(env, sub, {
        title: '보수교육 알림',
        body: `${upcomingEducation.results.length}명의 보수교육이 30일 후 예정입니다`,
        type: 'education_reminder',
      }))
    }
  }

  await Promise.allSettled(sends)
}

// ── Event notifications (every 5 min) ────────────────
async function handleEventNotifications(env: Env) {
  const kstNow = new Date(Date.now() + 9 * 3600 * 1000)
  const today = kstNow.toISOString().slice(0, 10)
  const nowMinutes = kstNow.getUTCHours() * 60 + kstNow.getUTCMinutes()

  // Find events (category = 'event') with a time set, scheduled for today
  const events = await env.DB.prepare(
    `SELECT id, title, time FROM schedule_items
     WHERE date = ? AND time IS NOT NULL AND category = 'event'`
  ).bind(today).all<{ id: string; title: string; time: string }>()

  if (!events.results?.length) return

  // 근무 중인 직원만 필터
  const workingIds = await getWorkingStaffIds(env, kstNow, today)

  const allEventSubs = await env.DB.prepare(
    'SELECT id, staff_id, endpoint, p256dh, auth, notification_preferences FROM push_subscriptions'
  ).all<PushSubRow>()

  const subs = { results: (allEventSubs.results ?? []).filter(s => workingIds.has(s.staff_id)) }
  if (!subs.results.length) return

  const sends: Promise<void>[] = []

  for (const evt of events.results) {
    const timeStr = evt.time // "HH:MM" format
    const [h, m] = timeStr.split(':').map(Number)
    const eventMinutes = h * 60 + m
    const diff = eventMinutes - nowMinutes

    for (const sub of subs.results) {
      const prefs: NotifPrefs = JSON.parse(sub.notification_preferences)

      // D-06: 행사 15분 전 (window 13~17 to absorb 5-min cron jitter)
      if (prefs.event_15min && diff >= 13 && diff <= 17) {
        sends.push(sendPush(env, sub, {
          title: '행사 15분 전',
          body: `${evt.title} 시작까지 약 15분 남았습니다`,
          type: 'event_15min',
        }))
      }

      // D-07: 행사 5분 전 (window 3~7)
      if (prefs.event_5min && diff >= 3 && diff <= 7) {
        sends.push(sendPush(env, sub, {
          title: '행사 5분 전',
          body: `${evt.title}이(가) 곧 시작됩니다`,
          type: 'event_5min',
        }))
      }
    }
  }

  await Promise.allSettled(sends)
}

// ── Main export ──────────────────────────────────────
export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    switch (controller.cron) {
      case '45 23 * * *':
        ctx.waitUntil(handleDailyNotifications(env))
        break
      case '*/5 * * * *':
        ctx.waitUntil(handleEventNotifications(env))
        break
    }
  },
}
