import { buildPushPayload, type PushMessage } from '@block65/webcrypto-web-push'

export interface Env {
  DB: D1Database
  STORAGE: R2Bucket
  VAPID_PUBLIC_KEY: string
  VAPID_PRIVATE_KEY: string
  WATCHDOG_PUSH_ENABLED?: string  // wrangler.toml [vars]. '0' = 워치독 발송만 정지 (상태기계·텔레메트리는 계속)
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

// ── Telemetry helper ─────────────────────────────────
// 진단용 영구 로깅. cron worker 는 console.log 가 wrangler tail 종료 후 사라지므로
// telemetry_events 테이블에 직접 INSERT 하여 사후 분석 가능하게 한다.
async function logTelemetry(
  env: Env,
  event_type: string,
  opts: { status?: number | null; staff_id?: string | null; detail?: string | null } = {}
): Promise<void> {
  try {
    await env.DB.prepare(
      `INSERT INTO telemetry_events (ts, event_type, path, status, staff_id, user_agent, detail)
       VALUES (?, ?, NULL, ?, ?, NULL, ?)`
    )
      .bind(
        new Date().toISOString(),
        event_type,
        opts.status ?? null,
        opts.staff_id ?? null,
        opts.detail ?? null,
      )
      .run()
  } catch (e) {
    // 텔레메트리 자체가 실패해도 본 흐름은 영향 없게 swallow.
    console.error('[telemetry] insert failed', e)
  }
}

// ── Send push utility ────────────────────────────────
// ★ 반환값 = **실제 도달 여부**(2xx). 워치독의 watchdog_push_ok 가 이 값을 센다 (FEEDBACK §6-2).
//   원래는 Promise<void> 였고 모든 실패를 내부에서 삼켰다 → Promise.allSettled 의 fulfilled 개수가
//   **항상 구독 수와 동일**했다. 그걸 '도달 건수' 로 세면 전원 구독 만료(410)여도 "통지했다" 가 되어
//   재시도가 영원히 안 나간다. 삼키는 동작(다른 cron 경로가 의존)은 그대로 두고 결과만 돌려준다.
async function sendPush(
  env: Env,
  sub: PushSubRow,
  payload: { title: string; body: string; type: string; url?: string },
  // options: 워치독 경로 전용 { ttl: 3600, urgency: 'high' }. 라이브러리 기본 TTL 은 60초라
  // 발송 순간 폰이 오프라인(심야 무신호·절전)이면 Apple 이 60초 뒤 폐기한다 — 다른 cron 경로는 기존 기본 유지.
  options?: PushMessage['options']
): Promise<boolean> {
  try {
    const pushData = await buildPushPayload(
      { data: JSON.stringify(payload), ...(options ? { options } : {}) },
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
    // 모든 응답을 telemetry 로 기록 — 410/404 외 swallow 되는 case 도 가시화.
    let bodySnippet: string | null = null
    if (res.status >= 400) {
      try {
        const txt = await res.clone().text()
        bodySnippet = txt.slice(0, 300)
      } catch {
        bodySnippet = '(unreadable body)'
      }
    }
    await logTelemetry(env, 'cron-daily-push', {
      status: res.status,
      staff_id: sub.staff_id,
      detail: JSON.stringify({
        type: payload.type,
        statusText: res.statusText,
        endpoint_host: (() => {
          try { return new URL(sub.endpoint).host } catch { return null }
        })(),
        body: bodySnippet,
      }),
    })
    if (res.status === 410 || res.status === 404) {
      // Subscription expired — clean up from D1
      await env.DB.prepare('DELETE FROM push_subscriptions WHERE id = ?').bind(sub.id).run()
    }
    return res.status < 400
  } catch (e) {
    console.error(`Push failed for ${sub.staff_id}:`, e)
    await logTelemetry(env, 'cron-daily-push-throw', {
      staff_id: sub.staff_id,
      detail: `${(e as Error)?.message ?? e}\n${(e as Error)?.stack ?? ''}`.slice(0, 1000),
    })
    return false
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

  // 연차/공가 조회해서 추가 제외 (annual_leaves 에 status 컬럼 없음 — 등록된 건은 모두 유효)
  const leaves = await env.DB.prepare(
    `SELECT staff_id, type FROM annual_leaves WHERE date = ?`
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

  await logTelemetry(env, 'cron-daily-enter', {
    detail: JSON.stringify({ today, yesterday, kstNow: kstNow.toISOString() }),
  })

  try {
    // 근무 중인 직원만 필터
    const workingIds = await getWorkingStaffIds(env, kstNow, today)

    const allDailySubs = await env.DB.prepare(
      'SELECT id, staff_id, endpoint, p256dh, auth, notification_preferences FROM push_subscriptions'
    ).all<PushSubRow>()

    const subs = { results: (allDailySubs.results ?? []).filter(s => workingIds.has(s.staff_id)) }

    // 소방안전관리자(admin) staff_id 조회
    const adminRows = await env.DB.prepare(
      "SELECT id FROM staff WHERE role = 'admin' AND active = 1"
    ).all<{ id: string }>()
    const adminIds = new Set((adminRows.results ?? []).map(r => r.id))

    if (!subs.results.length && !(allDailySubs.results ?? []).length) {
      await logTelemetry(env, 'cron-daily-end', {
        detail: JSON.stringify({ reason: 'no-subs', workingIds: [...workingIds], allSubsCount: 0 }),
      })
      return
    }

    // Batch queries for daily notification types
    const [
      todaySchedules,
      yesterdayIncomplete,
      unresolvedFindings,
      upcomingEducation,
      elevatorEduExpiring,
      fireInitialDue,
      elevatorInitialDue,
    ] = await Promise.all([
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
      // 소방 실무교육 D-60: 신규교육일 기준 +2년*N 주기로 고정 (화재예방법 실무교육
      // 이수 기한 기준). 매칭은 JS 단에서 수행 — 모든 initial 행을 조회한다.
      env.DB.prepare(
        `SELECT e.staff_id, s.name as staff_name, s.role, e.completed_at
         FROM education_records e JOIN staff s ON e.staff_id = s.id
         WHERE e.education_type = 'initial'`
      ).all<{ staff_id: string; staff_name: string; role: string; completed_at: string }>(),
      // 승강기 실무교육(재교육) D-60: safety_mgr_edu_expire 만료 60일 전
      env.DB.prepare(
        `SELECT id, name FROM staff
         WHERE elevator_safety_manager = 1 AND safety_mgr_edu_expire IS NOT NULL
           AND date(safety_mgr_edu_expire, '-60 days') = ?`
      ).bind(today).all<{ id: string; name: string }>(),
      // 소방 신규교육 D-60: appointed_at + 6개월 - 60일 = 오늘, 그리고
      // education_records 에 initial 이 아직 없는 사람만
      env.DB.prepare(
        `SELECT s.id, s.name, s.role
         FROM staff s
         WHERE s.active = 1
           AND s.appointed_at IS NOT NULL
           AND date(s.appointed_at, '+6 months', '-60 days') = ?
           AND NOT EXISTS (
             SELECT 1 FROM education_records e
             WHERE e.staff_id = s.id AND e.education_type = 'initial'
           )`
      ).bind(today).all<{ id: string; name: string; role: string }>(),
      // 승강기 신규교육 D-60: safety_mgr_appointed_at + 3개월 - 60일 = 오늘,
      // 그리고 safety_mgr_edu_dt 가 아직 비어있는 사람만
      env.DB.prepare(
        `SELECT id, name FROM staff
         WHERE active = 1
           AND elevator_safety_manager = 1
           AND safety_mgr_appointed_at IS NOT NULL
           AND safety_mgr_edu_dt IS NULL
           AND date(safety_mgr_appointed_at, '+3 months', '-60 days') = ?`
      ).bind(today).all<{ id: string; name: string }>(),
    ])

    await logTelemetry(env, 'cron-daily-start', {
      detail: JSON.stringify({
        today,
        yesterday,
        subsCount: subs.results.length,
        allSubsCount: (allDailySubs.results ?? []).length,
        workingIds: [...workingIds],
        adminIds: [...adminIds],
        todaySchedulesCount: todaySchedules.results?.length ?? 0,
        yesterdayIncompleteCount: yesterdayIncomplete.results?.length ?? 0,
        unresolvedFindingsCount: unresolvedFindings.results?.length ?? 0,
        upcomingEducationCount: upcomingEducation.results?.length ?? 0,
        elevatorEduExpiringCount: elevatorEduExpiring.results?.length ?? 0,
        fireInitialDueCount: fireInitialDue.results?.length ?? 0,
        elevatorInitialDueCount: elevatorInitialDue.results?.length ?? 0,
      }),
    })

    const sends: Promise<boolean>[] = []

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

      // D-02 ~ D-04 는 근무자 전원 대상 (위에서 처리)
    }

    // D-05: 교육 D-60 — 당사자 + 소방안전관리자(admin)에게만 발송
    const allSubs = allDailySubs.results ?? []
    const adminSubs = allSubs.filter(s => adminIds.has(s.staff_id))

    // 교육 만기 대상자별 알림 구성
    interface EduTarget { staffId: string; line: string }
    const eduTargets: EduTarget[] = []

    // 소방 실무교육: target(today+60일) 이 신규교육일 + 2N년 과 동일한 사람만 대상
    const [ty, tm, td] = today.split('-').map(Number)
    const targetDate = new Date(Date.UTC(ty, tm - 1, td + 60))
    for (const r of (upcomingEducation.results ?? []) as { staff_id: string; staff_name: string; role: string; completed_at: string }[]) {
      const [iy, im, id] = r.completed_at.split('-').map(Number)
      const initDate = new Date(Date.UTC(iy, im - 1, id))
      const yearDiff = targetDate.getUTCFullYear() - initDate.getUTCFullYear()
      const matches = yearDiff >= 2
        && yearDiff % 2 === 0
        && targetDate.getUTCMonth() === initDate.getUTCMonth()
        && targetDate.getUTCDate() === initDate.getUTCDate()
      if (!matches) continue
      const roleLabel = r.role === 'admin' ? '소방안전관리자' : '소방안전관리 보조자'
      eduTargets.push({ staffId: r.staff_id, line: `${r.staff_name}님 ${roleLabel} 실무교육` })
    }
    for (const r of (elevatorEduExpiring.results ?? []) as { id: string; name: string }[]) {
      eduTargets.push({ staffId: r.id, line: `${r.name}님 승강기안전관리자 재교육` })
    }

    // 소방 신규교육 D-60: 선임 후 6개월 이내 이수 기한. initial 기록 없는 사람만.
    for (const r of (fireInitialDue.results ?? []) as { id: string; name: string; role: string }[]) {
      const roleLabel = r.role === 'admin' ? '소방안전관리자' : '소방안전관리 보조자'
      eduTargets.push({ staffId: r.id, line: `${r.name}님 ${roleLabel} 신규교육` })
    }

    // 승강기 신규교육 D-60: 선임 후 3개월 이내 이수 기한. safety_mgr_edu_dt 미등록자만.
    for (const r of (elevatorInitialDue.results ?? []) as { id: string; name: string }[]) {
      eduTargets.push({ staffId: r.id, line: `${r.name}님 승강기안전관리자 신규교육` })
    }

    if (eduTargets.length > 0) {
      const body = eduTargets.map(t => t.line).join(', ') + '이 60일 후 만기됩니다'
      // 수신 대상: 당사자 + admin (중복 제거)
      const recipientIds = new Set<string>()
      for (const t of eduTargets) recipientIds.add(t.staffId)
      for (const id of adminIds) recipientIds.add(id)

      for (const sub of allSubs) {
        if (!recipientIds.has(sub.staff_id)) continue
        const prefs: NotifPrefs = JSON.parse(sub.notification_preferences)
        if (!prefs.education_reminder) continue
        sends.push(sendPush(env, sub, {
          title: '교육 만기 알림 (D-60)',
          body,
          type: 'education_reminder',
        }))
      }
    }

    await logTelemetry(env, 'cron-daily-dispatch', {
      detail: JSON.stringify({ sendsCount: sends.length, eduTargetsCount: eduTargets.length }),
    })

    const settled = await Promise.allSettled(sends)
    const fulfilled = settled.filter(s => s.status === 'fulfilled').length
    const rejected = settled.filter(s => s.status === 'rejected').length
    await logTelemetry(env, 'cron-daily-end', {
      detail: JSON.stringify({ sendsCount: sends.length, fulfilled, rejected }),
    })
  } catch (e) {
    await logTelemetry(env, 'cron-daily-error', {
      detail: `${(e as Error)?.message ?? e}\n${(e as Error)?.stack ?? ''}`.slice(0, 1500),
    })
    throw e
  }
}

// ── Event notifications (every 5 min) ────────────────
async function handleEventNotifications(env: Env) {
  const kstNow = new Date(Date.now() + 9 * 3600 * 1000)
  const today = kstNow.toISOString().slice(0, 10)
  const nowMinutes = kstNow.getUTCHours() * 60 + kstNow.getUTCMinutes()

  try {
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

    const sends: Promise<boolean>[] = []

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

    if (sends.length > 0) {
      await logTelemetry(env, 'cron-event-dispatch', {
        detail: JSON.stringify({ sendsCount: sends.length, eventsCount: events.results.length }),
      })
    }
    await Promise.allSettled(sends)
  } catch (e) {
    await logTelemetry(env, 'cron-event-error', {
      detail: `${(e as Error)?.message ?? e}\n${(e as Error)?.stack ?? ''}`.slice(0, 1500),
    })
    throw e
  }
}

// ── Access-blocked auto-complete (every day 15:00 KST = 06:00 UTC) ─────
async function handleAccessBlockedAutoComplete(env: Env): Promise<void> {
  // KST 오늘 날짜 (UTC+9). UTC 06:00 발동 → KST 15:00 (같은 날).
  const now = new Date()
  const kstMs = now.getTime() + 9 * 3600_000
  const kst = new Date(kstMs)
  const today = `${kst.getUTCFullYear()}-${String(kst.getUTCMonth() + 1).padStart(2, '0')}-${String(kst.getUTCDate()).padStart(2, '0')}`
  const yyyymm = today.slice(0, 7)

  await logTelemetry(env, 'cron-ab-enter', {
    detail: JSON.stringify({ today, kstNow: kst.toISOString() }),
  })

  try {
    // 1) 이번 달 카테고리별 마지막 점검일 + 그 날의 assignee_id 조회
    //    (같은 카테고리/같은 날에 schedule_items 행이 여러 건이어도 MIN(assignee_id) 로 안정적 1행 보장)
    //    cl.last_date = today 인 카테고리만 추림 → 오늘이 마지막 점검일이 아니면 빈 결과.
    const catRows = await env.DB.prepare(
      `WITH cat_last AS (
         SELECT inspection_category, MAX(date) AS last_date
         FROM schedule_items
         WHERE inspection_category IS NOT NULL
           AND substr(date, 1, 7) = ?
         GROUP BY inspection_category
       )
       SELECT cl.inspection_category AS category,
              MIN(si.assignee_id)    AS assignee_id
       FROM cat_last cl
       JOIN schedule_items si
         ON si.inspection_category = cl.inspection_category
        AND si.date = cl.last_date
       WHERE cl.last_date = ?
       GROUP BY cl.inspection_category`
    ).bind(yyyymm, today).all<{ category: string; assignee_id: string | null }>()

    const targets = (catRows.results ?? []).filter(r => !!r.category)
    if (targets.length === 0) {
      await logTelemetry(env, 'cron-ab-end', {
        detail: JSON.stringify({ today, reason: 'no-last-day-categories', targets: 0 }),
      })
      return
    }

    const summary: { category: string; cp_count: number; session_id?: string; status: string }[] = []

    // 2) 카테고리별 처리
    for (const row of targets) {
      const category = row.category
      const assigneeId = row.assignee_id
      if (!assigneeId) {
        console.warn(`[access-blocked-auto] ${category}: assignee_id NULL — skip`)
        summary.push({ category, cp_count: 0, status: 'skip-no-assignee' })
        continue
      }

      // 2a) 자동완료 대상 cp: description 에 '접근불가' 포함 + active + 이번 달 미기록
      const cpRows = await env.DB.prepare(
        `SELECT id FROM check_points
         WHERE category = ?
           AND description LIKE '%접근불가%'
           AND is_active = 1
           AND id NOT IN (
             SELECT checkpoint_id FROM check_records
             WHERE substr(checked_at, 1, 7) = ?
           )`
      ).bind(category, yyyymm).all<{ id: string }>()

      const cpIds = (cpRows.results ?? []).map(r => r.id)
      if (cpIds.length === 0) {
        console.log(`[access-blocked-auto] ${category}: 0 cps (already complete)`)
        summary.push({ category, cp_count: 0, status: 'noop' })
        continue
      }

      // 2b) 카테고리당 inspection_session 1건 + check_records N건 atomic insert
      const sessionId = crypto.randomUUID()

      const sessionStmt = env.DB.prepare(
        `INSERT INTO inspection_sessions (id, date, floor, zone, staff_id, created_at)
         VALUES (?, ?, NULL, NULL, ?, datetime('now'))`
      ).bind(sessionId, today, assigneeId)

      const recordStmts = cpIds.map(cpId =>
        env.DB.prepare(
          `INSERT INTO check_records (id, session_id, checkpoint_id, staff_id, result, memo, checked_at, created_at, status)
           VALUES (?, ?, ?, ?, 'normal', '접근불가 개소 자동 정상처리', datetime('now'), datetime('now'), 'open')`
        ).bind(crypto.randomUUID(), sessionId, cpId, assigneeId)
      )

      try {
        await env.DB.batch([sessionStmt, ...recordStmts])
        console.log(`[access-blocked-auto] ${category}: ${cpIds.length} cps auto-completed (assignee=${assigneeId}, session=${sessionId})`)
        summary.push({ category, cp_count: cpIds.length, session_id: sessionId, status: 'ok' })
      } catch (e: any) {
        console.error(`[access-blocked-auto] ${category}: batch failed`, e)
        summary.push({ category, cp_count: cpIds.length, status: 'batch-fail' })
        await logTelemetry(env, 'cron-ab-error', {
          detail: JSON.stringify({ today, category, error: String(e?.message ?? e) }),
        })
        // 카테고리 단위로만 fail — 다음 카테고리는 계속 진행
      }
    }

    await logTelemetry(env, 'cron-ab-end', {
      detail: JSON.stringify({ today, targets: targets.length, summary }),
    })

    // 담당자 (윤종엽 2022051052) 에게 결과 푸시 — actual auto-complete 발생 또는 비정상 상태일 때만
    const okItems = summary.filter(s => s.status === 'ok' && s.cp_count > 0)
    const issueItems = summary.filter(s => s.status === 'batch-fail' || s.status === 'skip-no-assignee')
    if (okItems.length > 0 || issueItems.length > 0) {
      const okText = okItems.map(s => `${s.category} ${s.cp_count}건`).join(', ')
      const issueText = issueItems.map(s => `${s.category}(${s.status})`).join(', ')
      const body =
        (okText ? `자동 완료: ${okText}` : '') +
        (okText && issueText ? '\n' : '') +
        (issueText ? `⚠ 문제: ${issueText}` : '')
      await sendPushToOwner(env, '접근불가 자동 처리', body)
    }
  } catch (e: any) {
    await logTelemetry(env, 'cron-ab-error', {
      detail: JSON.stringify({ today, error: String(e?.message ?? e), stack: e?.stack ?? null }),
    })
    await sendPushToOwner(env, '⚠ 접근불가 자동 처리 실패', String(e?.message ?? e).slice(0, 200))
    throw e
  }
}

// 담당자 (윤종엽 2022051052) 에게만 푸시 발송 — cron-ab 진단용
const OWNER_STAFF_ID = '2022051052'
async function sendPushToOwner(env: Env, title: string, body: string): Promise<void> {
  try {
    const subs = await env.DB.prepare(
      'SELECT id, staff_id, endpoint, p256dh, auth, notification_preferences FROM push_subscriptions WHERE staff_id = ?'
    ).bind(OWNER_STAFF_ID).all<PushSubRow>()
    const sends = (subs.results ?? []).map(sub =>
      sendPush(env, sub, { title, body, type: 'cron-ab-result' })
    )
    await Promise.allSettled(sends)
  } catch (e: any) {
    await logTelemetry(env, 'cron-ab-push-throw', {
      detail: String(e?.message ?? e).slice(0, 500),
    })
  }
}

// ── DB 자동 백업 (매일 KST 03:32) ─────────────────────
// 앱의 backup.ts(신버전, 260610-bkr)와 동일 포맷으로 D1 전체를 .sql 직렬화 → R2 backups/db/ 저장.
// 신버전 restore.ts 토크나이저로 복원 가능. 14일 보존(오래된 백업 자동 삭제).
// backups/ 는 uploads 미인증 경로에서 차단됨 — admin r2-download 로만 접근.
function kstDateStr(): string {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10)
}

async function buildDbBackupSql(env: Env): Promise<{ sql: string; oversized: string[] }> {
  const { results: tables } = await env.DB.prepare(
    `SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'd1_%' ORDER BY name`
  ).all<{ name: string; sql: string }>()

  const lines: string[] = []
  lines.push(`-- CHA Bio Safety DB Backup`)
  lines.push(`-- Date: ${new Date().toISOString()}`)
  lines.push(`-- Tables: ${tables.length}`)
  lines.push('')

  const enc = new TextEncoder()
  const oversized: string[] = []

  for (const table of tables) {
    lines.push(`-- ── ${table.name} ──`)
    lines.push(`DROP TABLE IF EXISTS ${table.name};`)
    lines.push(`${table.sql};`)
    lines.push('')

    const { results: rows } = await env.DB.prepare(`SELECT * FROM ${table.name}`).all()
    if (rows.length === 0) {
      lines.push(`-- (no data)`)
      lines.push('')
      continue
    }

    const columns = Object.keys(rows[0] as Record<string, unknown>)
    for (const row of rows) {
      const r = row as Record<string, unknown>
      const values = columns.map(c => {
        const v = r[c]
        if (v === null || v === undefined) return 'NULL'
        if (typeof v === 'number') return String(v)
        return `'${String(v).replace(/'/g, "''")}'`
      })
      const stmt = `INSERT INTO ${table.name} (${columns.join(', ')}) VALUES (${values.join(', ')});`
      if (stmt.length > 30000 && enc.encode(stmt).length > 95000)
        oversized.push(`${table.name} (${columns[0]}=${String(r[columns[0]]).slice(0, 40)})`)
      lines.push(stmt)
    }
    lines.push('')
  }

  // standalone 인덱스/뷰/트리거 — DROP TABLE 이 부속 객체를 지우므로 백업에 없으면 복원 후 소실.
  const { results: objects } = await env.DB.prepare(
    `SELECT type, name, sql FROM sqlite_master
     WHERE type IN ('index','view','trigger') AND sql IS NOT NULL
       AND name NOT LIKE 'sqlite_%' AND tbl_name NOT LIKE '_cf_%' AND tbl_name NOT LIKE 'd1_%'
     ORDER BY CASE type WHEN 'index' THEN 0 WHEN 'view' THEN 1 ELSE 2 END, name`
  ).all<{ type: string; name: string; sql: string }>()

  if (objects.length > 0) {
    lines.push(`-- ── indexes / views / triggers ──`)
    for (const o of objects) {
      lines.push(`DROP ${o.type.toUpperCase()} IF EXISTS ${o.name};`)
      lines.push(`${o.sql};`)
    }
    lines.push('')
  }

  return { sql: lines.join('\n'), oversized }
}

// ── 화재수신반 에이전트 워치독 (5분 틱) ──────────────────────────
// 계약 SSOT: panel-agent/MONITORING-SPEC.md §7 4단계.
// 사각지대 #4 를 처음으로 알린다 — 에이전트는 살아있는데(heartbeat 정상) 캡처보드/HDMI 가 죽어
// 프레임이 안 들어오는 상태. 지금까지는 agentOnline=true 라 화면이 초록이었다.
//
// ★ 억제 규칙 — 이 워치독은 **양방향으로 죽을 수 있다.** 둘 다 결과는 "진짜 화재를 놓친다" 다:
//   (A) 너무 많이 외침 → 알람 피로 → 관리자가 채널을 무음 → 진짜 화재 푸시를 못 본다.  (FEEDBACK §1)
//   (B) 한 번 외치고 침묵 → 고장이 몇 시간 지속돼도 아무도 모른다.                      (FEEDBACK §6)
//   2026-07-14 에 (A) 를 고쳤더니 같은 날 (B) 가 터졌다 — 캡처보드 차단 88분, 알림 1건, 사람이 우연히 발견.
//
// ★ 알림 수명주기는 **cron 이 단독 소유**한다. heartbeat.ts 는 watchdog_notified_at 을 **건드리지 않는다**
//   (§1 수정의 핵심). 두 주체가 같은 컬럼을 반대 방향으로 쓰면 억제가 성립하지 않는다 —
//   하트비트가 60초마다 NULL 로 리셋해서 5분마다 영원히 푸시하던 것이 바로 그 버그다.
//   heartbeat.ts 에 NULL 리셋을 '누락' 으로 오인해 되살리지 마라. 무한 푸시가 그대로 재발한다.
//
// ★ 재푸시 트리거 (v2 — FABLE-TASK-WATCHDOG.md §4, 2026-07-26):
//   - first        → 사유 최초 관측 후 CONFIRM(10분) 경과한 첫 틱 (새벽 transient 2틱 오탐을 거르는 실측 최소값)
//   - escalation   → **이번 사고에서 한 번도 통지한 적 없는 code** 출현 시에만.
//                    watchdog_reasons = "이번 사고에서 이미 통지한 code 들의 누적 합집합" (마지막 발송 사유가 아니다!)
//                    → code 가 4종(hb/starved/detect/blind)뿐이라 사고당 에스컬레이션은 자연히 ≤3회로 유계.
//   - push-failed  → 직전 발송의 실제 도달 0건 (§6-2). 단 연속 실패 WATCHDOG_FAIL_MAX 회로 상한.
//   - cooldown     → 경과 > 6시간 지속 상기 (§6-1). **cooldown 에도 fail_n 상한을 건다** —
//                    안 걸면 전 구독 사망 시 6시간 뒤부터 매 틱 발화(288회/일 재시도 루프).
//   회복은 한 틱 클린이 아니라 **CLEAR(30분) 연속 클린**이어야 확정 — 확정 시 워치독 컬럼 6개 전부 NULL.
//   pending_since 는 사유가 잠깐 사라져도 지우지 않는다(플래핑 기아도 진짜 고장) — 회복 확정에서만 지운다.
//   발송 없는 틱은 DB 무기록 (pending/clear 시계 제외). 미발송 틱에 push_ok=0 을 쓰면 다음 틱
//   push-failed 가 우회 발송한다 (v1 floor 설계가 이 결함으로 폐기됐다).
//
// ★ 사유 비교는 **코드**(hb/starved/detect)로만 한다. 사람이 읽는 문구로 비교하면 안 된다 —
//   '캡처보드 신호 없음(1500초)' 은 5분 틱마다 숫자가 바뀌므로 매 틱 '사유 변경' 으로 읽혀
//   §1 무한 푸시가 그대로 부활한다.
//
// ★ 오탐 금지 규칙 (그대로 유지):
//   - frame_starved_sec 이 NULL 이면 푸시하지 않는다 (M1 — 판정 보류를 고장으로 읽지 말 것.
//     구 에이전트/MONITOR_TELEMETRY=0 이면 이 필드가 없다).
//   - detect_mode='off' 면 감지 정지로 푸시하지 않는다 (S9 — 의도된 설정이지 고장이 아니다).
//
// ★ 청중 = staff.panel_watchdog=1 **만** (0104 신설 → 0105 에서 담당자 단독으로 축소, 2026-07-27 지시).
//   role='admin' 은 발송 대상 아님(화면 열람만). 이관은 D1 플래그 이동만으로 — 재배포 불필요.
//   지시서 B-3 폴백(전 직원 확장)은 담당자 단독 수신 정책으로 폐기 — 담당자 구독 전멸 시 푸시는 침묵하고
//   deaf 텔레메트리 + 화면 회색만 남는다 (담당자가 인지하고 결정한 트레이드오프).
//   구 청중(role='admin' 만)은 유일 admin 의 구독이 410 삭제된 뒤 **평생 도달 0건**이었다 — 이 수정의 존재 이유.
const WATCHDOG_COOLDOWN_MS = 6 * 3600_000   // 고장 지속 시 재알림 간격. 하루 최대 4회 = 알람 피로 없이 상기
const WATCHDOG_CONFIRM_MS  = 10 * 60_000    // 사유 최초 관측 후 이만큼 지나야 첫 푸시 (새벽 transient 실측 지지값)
const WATCHDOG_CLEAR_MS    = 30 * 60_000    // 이만큼 연속 클린이어야 '회복 확정' — 한 틱 클린으로 리셋 금지
const WATCHDOG_FAIL_MAX    = 5              // 도달 0건 발송 시도 상한 (push-failed 와 cooldown 공용)

async function handlePanelWatchdog(env: Env): Promise<void> {
  try {
    const a = await env.DB.prepare(
      `SELECT last_seen_at, frame_starved_sec, last_detect_ok_at, detect_mode,
              watchdog_notified_at, watchdog_reasons, watchdog_push_ok,
              watchdog_pending_since, watchdog_clear_since, watchdog_push_fail_n
         FROM panel_agent_status WHERE id='agent'`,
    ).first<{
      last_seen_at: string | null; frame_starved_sec: number | null; last_detect_ok_at: string | null
      detect_mode: string | null; watchdog_notified_at: string | null
      watchdog_reasons: string | null; watchdog_push_ok: number | null
      watchdog_pending_since: string | null; watchdog_clear_since: string | null
      watchdog_push_fail_n: number | null
    }>()
    if (!a) return

    // 시각 비교는 전부 JS kstMs 로 — 컬럼이 naive KST TEXT 라 SQL datetime('now')(UTC)와 9시간 어긋난다.
    const kstMs = (s: string | null) => (s ? new Date(s.replace(' ', 'T') + '+09:00').getTime() : null)
    const now = Date.now()
    const nowKst = new Date(now + 9 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ')
    const seen = kstMs(a.last_seen_at)
    const detectOk = kstMs(a.last_detect_ok_at)

    // 사유는 {code, text} 쌍이다. **비교는 code 로만** 한다 (text 에는 매 틱 변하는 초 숫자가 들어간다).
    const reasons: { code: string; text: string }[] = []
    // (1) 하트비트 끊김 — 180초 (status.ts 의 온라인 임계와 동일 축)
    if (seen == null || now - seen > 180_000) {
      reasons.push({ code: 'hb', text: '에이전트 응답 없음(하트비트 3분 초과)' })
    }
    // (2) 프레임 기아 30초 — 캡처보드/HDMI 먹통. null 이면 판정 보류(푸시 금지).
    if (a.frame_starved_sec != null && a.frame_starved_sec >= 30) {
      reasons.push({ code: 'starved', text: `캡처보드 신호 없음(${a.frame_starved_sec}초)` })
    }
    // (3) 감지 파이프 정지 180초 — 단 detect_mode='off' 는 의도된 설정이므로 제외
    if (a.detect_mode !== 'off' && detectOk != null && now - detectOk > 180_000) {
      reasons.push({ code: 'detect', text: '감지 파이프 정지(3분 초과)' })
    }
    // (4) 화면 실명(blind) — 프레임은 흐르는데 색평균이 지속 0 = HDMI 입력/수신반 전원 사망.
    //     캡처보드는 HDMI 입력이 없어도 '무신호 검은 프레임'을 합성해 내보낸다(2026-07-26 실측:
    //     HDMI 를 뽑아도 frame_starved_sec 0~2초, analyze_ok 분당 ~26 증가) — 기아(starved)로는
    //     절대 안 잡히고, 화면은 검은데 에이전트는 정상이라 감지가 눈먼 채 침묵하는 사각지대였다.
    //     판정: 최근 6분 하트비트 중 색평균 유효(non-NULL) 행 ≥4 가 전부 (r+g+y)<0.01 이고 기아<30s.
    //     정상 수신반은 전원등 상시 점등이라 g/y 평균이 0 이 될 수 없다(실측 g 0.1~0.4, y 0.3~1.1).
    //     화재 시엔 적색 점등으로 r>0 → 화재를 blind 로 오인하지 않는다. NULL(구 에이전트/미계측)은
    //     판정 보류(M1 원칙). starved 활성이면 프레임 경로 고장이 이미 통지되므로 중복 판정 생략.
    //     detect_mode 와 무관 — 이건 감지가 아니라 캡처 경로(라이브뷰 포함)의 고장이다.
    if (!reasons.some(r => r.code === 'starved')) {
      const hb = await env.DB.prepare(
        `SELECT r_avg, g_avg, y_avg, frame_starved_sec FROM agent_heartbeats
          WHERE datetime(at) >= datetime('now','+9 hours','-6 minutes')
          ORDER BY at DESC LIMIT 6`,
      ).all<{ r_avg: number | null; g_avg: number | null; y_avg: number | null; frame_starved_sec: number | null }>()
      const hbRows = (hb.results ?? []).filter(r => r.r_avg != null && r.g_avg != null && r.y_avg != null)
      if (hbRows.length >= 4 && hbRows.every(r =>
        (r.r_avg! + r.g_avg! + r.y_avg!) < 0.01 && (r.frame_starved_sec ?? 0) < 30)) {
        reasons.push({ code: 'blind', text: '화면 신호 없음(검은 화면 지속 — HDMI 입력/수신반 전원 의심)' })
      }
    }

    // ── 클린 틱 ──
    if (reasons.length === 0) {
      // 워치독 상태가 전부 NULL 이면 아무것도 안 한다. 게이트를 notified_at 만으로 걸면
      // 통지 전에 소멸한 1틱 blip 의 pending_since 가 영구 잔존해, 몇 주 뒤 blip 에 즉시 first 가 나간다.
      if (a.watchdog_notified_at == null && a.watchdog_pending_since == null && a.watchdog_clear_since == null) return
      if (a.watchdog_clear_since == null) {
        await env.DB.prepare(
          `UPDATE panel_agent_status SET watchdog_clear_since=? WHERE id='agent'`,
        ).bind(nowKst).run()
        return
      }
      const clearMs = kstMs(a.watchdog_clear_since)
      if (clearMs != null && now - clearMs >= WATCHDOG_CLEAR_MS) {
        // 회복 확정 — 6컬럼 전부 NULL. fail_n 을 남기면 지난 사고의 5 가 다음 사고의 재시도를 처음부터 막는다.
        await env.DB.prepare(
          `UPDATE panel_agent_status
              SET watchdog_notified_at=NULL, watchdog_reasons=NULL, watchdog_push_ok=NULL,
                  watchdog_pending_since=NULL, watchdog_clear_since=NULL, watchdog_push_fail_n=NULL
            WHERE id='agent'`,
        ).run()
      }
      return
    }

    // ── 사유 있음 — 시계 갱신 ──
    // pending_since 는 사유가 잠깐 사라져도 지우지 않는다(회복 확정에서만). 판정은
    // '10분 연속' 이 아니라 '사유 최초 관측 후 10분 경과 + 이번 틱에 사유 존재' 다 —
    // 플래핑 기아(간헐 캡처 고장)도 진짜 고장이므로 CONFIRM 을 영원히 못 채우게 하면 안 된다.
    const pendingSince = a.watchdog_pending_since ?? nowKst
    if (a.watchdog_clear_since != null || a.watchdog_pending_since == null) {
      await env.DB.prepare(
        `UPDATE panel_agent_status SET watchdog_clear_since=NULL, watchdog_pending_since=? WHERE id='agent'`,
      ).bind(pendingSince).run()
    }
    const pendingMs = kstMs(pendingSince)
    if (a.watchdog_notified_at == null && pendingMs != null && now - pendingMs < WATCHDOG_CONFIRM_MS) return

    // ── 트리거 판정 ──
    // watchdog_reasons = 이번 사고에서 이미 통지한 code 들의 누적 합집합 (발송 틱에서만 갱신).
    const notifiedCodes = new Set((a.watchdog_reasons ?? '').split(',').filter(Boolean))
    const newCodes = reasons.map(r => r.code).filter(c => !notifiedCodes.has(c))
    const reasonKey = reasons.map(r => r.code).sort().join(',')
    const notifiedMs = kstMs(a.watchdog_notified_at)
    const elapsedMs = notifiedMs == null ? null : now - notifiedMs
    const failN = a.watchdog_push_fail_n ?? 0
    let trigger: string | null = null
    if (a.watchdog_notified_at == null) trigger = 'first'
    else if (newCodes.length > 0) trigger = 'escalation'                        // 미통지 code 출현 시에만 — 사고당 ≤3회
    else if ((a.watchdog_push_ok ?? 0) === 0 && failN < WATCHDOG_FAIL_MAX) trigger = 'push-failed'
    else if (elapsedMs != null && elapsedMs > WATCHDOG_COOLDOWN_MS && failN < WATCHDOG_FAIL_MAX) trigger = 'cooldown'
    if (!trigger) return  // 발송 없는 틱은 DB 에 아무것도 쓰지 않는다 (pending/clear 시계 제외)

    // 지속 시간 — 기준은 notified_at 이 아니라 pending_since (사고 시작). 성공 발송마다 notified_at 이
    // 밀리므로 그걸 기준 삼으면 "N시간째 지속" 이 마지막 발송 기준이 되어 거짓말이 된다.
    const durMin = pendingMs == null ? 0 : Math.round((now - pendingMs) / 60_000)
    const durText = durMin >= 60 ? `${Math.floor(durMin / 60)}시간 ${durMin % 60}분` : `${durMin}분`
    const title = trigger === 'first' || trigger === 'escalation'
      ? '⚠ 화재수신반 감시 이상'
      : '⚠ 화재수신반 감시 이상 — 계속됨'
    const body = trigger === 'first'
      ? reasons.map(r => r.text).join(' · ')
      : `${reasons.map(r => r.text).join(' · ')} — ${durText}째 지속`

    // ── 청중: panel_watchdog=1 **만** (0105, 2026-07-27 담당자 지시 — 프로그램 담당자 윤종엽 단독 수신) ──
    // role='admin' 은 발송 대상이 아니다 — 화면 열람(§5 게이트)만 admin 에게 열려 있다.
    // 이관(퇴사 등): D1 에서 staff.panel_watchdog 플래그만 옮기면 끝 — 코드 재배포 불필요.
    // ⚠️ 지시서 B-3 폴백(구독 전멸 시 전 직원 확장 발송)은 같은 지시로 폐기 — 담당자 외 발송 금지.
    //    그 대가로 담당자 구독 전멸 시(iOS 차단 → 410 → 자동삭제) 푸시는 완전 침묵한다.
    //    남는 신호 = cron-panel-watchdog-deaf 텔레메트리 + 앱 화면 회색뿐임을 담당자가 인지하고 결정했다.
    const adminRows = await env.DB.prepare(
      "SELECT id FROM staff WHERE active = 1 AND panel_watchdog = 1",
    ).all<{ id: string }>()
    const adminIds = (adminRows.results ?? []).map(r => r.id)

    let subRows: PushSubRow[] = []
    if (adminIds.length > 0) {
      const ph = adminIds.map(() => '?').join(',')
      const subs = await env.DB.prepare(
        `SELECT id, staff_id, endpoint, p256dh, auth, notification_preferences
           FROM push_subscriptions WHERE staff_id IN (${ph})`,
      ).bind(...adminIds).all<PushSubRow>()
      subRows = subs.results ?? []
    }
    if (subRows.length === 0) {
      // 청각 상실 관측 — 발송 트리거가 선 틱에서만 남는다(평상시 무기록). 원사고(admins:1 오독)의 재발 방지 표식.
      await logTelemetry(env, 'cron-panel-watchdog-deaf', {
        detail: JSON.stringify({ admins: adminIds.length, trigger }),
      })
    }

    // ── 발송 ── 킬스위치('0')는 이 블록만 건너뛴다 — 상태기계·텔레메트리는 계속 (침묵≠성공).
    // ★ pushOk = **실제 도달 건수**. sendPush 가 true(2xx) 를 돌려준 것만 센다.
    //   TTL 3600 + urgency high: 라이브러리 기본 TTL 60초는 심야 오프라인 폰에서 Apple 이 60초 뒤 폐기
    //   — APNs 201 수락은 pushOk 로 집계되므로 TTL 만료는 push-failed 로도 못 잡는다.
    const disabled = env.WATCHDOG_PUSH_ENABLED === '0'
    let pushOk = 0
    if (!disabled && subRows.length > 0) {
      const results = await Promise.allSettled(subRows.map(sub =>
        sendPush(env, sub, { title, body, type: 'panel-watchdog', url: '/panel-monitor' },
                 { ttl: 3600, urgency: 'high' }),
      ))
      pushOk = results.filter(r => r.status === 'fulfilled' && r.value === true).length
    }

    // ── 기록 — 실제 발송을 시도한 틱에서만 갱신 ──
    // 킬스위치 틱에 notified_at 을 쓰면 재가동 후 first 가 영영 안 나간다. 텔레메트리만 남긴다.
    const pushFailN = pushOk > 0 ? 0 : failN + 1
    if (!disabled) {
      // 도달 0건이면 notified_at 을 갱신하지 않는다 — 갱신하면 쿨다운 시계만 뒤로 밀려 재시도가 늦어진다.
      const notifiedAt = pushOk > 0 ? nowKst : (a.watchdog_notified_at ?? nowKst)
      const mergedReasons = Array.from(new Set([...notifiedCodes, ...reasons.map(r => r.code)])).sort().join(',')
      await env.DB.prepare(
        `UPDATE panel_agent_status
            SET watchdog_notified_at=?, watchdog_reasons=?, watchdog_push_ok=?, watchdog_push_fail_n=?
          WHERE id='agent'`,
      ).bind(notifiedAt, mergedReasons, pushOk, pushFailN).run()
    }

    await logTelemetry(env, 'cron-panel-watchdog', {
      detail: JSON.stringify({
        trigger, reasonKey, reasons: reasons.map(r => r.text),
        admins: adminIds.length,
        subs: subRows.length,  // "보낼 사람이 없다" vs "보냈는데 실패" 구분 — admins:1 오독의 재발 방지
        pushOk, pushFailN: disabled ? failN : pushFailN, disabled, durMin,
      }),
    })
  } catch (e: any) {
    await logTelemetry(env, 'cron-panel-watchdog-throw', { detail: String(e?.message ?? e).slice(0, 500) })
  }
}

// agent_heartbeats 14일 보존 정리 (일 1회). 60초 주기 → 1,440행/일 → 14일 ≈ 20,160행.
async function handleHeartbeatCleanup(env: Env): Promise<void> {
  try {
    await env.DB.prepare(
      "DELETE FROM agent_heartbeats WHERE datetime(at) < datetime('now','+9 hours','-14 days')",
    ).run()
  } catch (e: any) {
    await logTelemetry(env, 'cron-hb-cleanup-throw', { detail: String(e?.message ?? e).slice(0, 500) })
  }
}

async function handleDbBackup(env: Env): Promise<void> {
  const date = kstDateStr()
  const key = `backups/db/${date}.sql`
  try {
    const { sql, oversized } = await buildDbBackupSql(env)
    if (oversized.length > 0) {
      // 100KB 초과 행이면 복원 불가능한 백업이라 저장하지 않고 알린다 (앱 backup.ts 와 동일 정책).
      await logTelemetry(env, 'cron-backup-db-oversize', {
        detail: `복원 불가(100KB 초과 행) — 백업 중단: ${oversized.slice(0, 5).join(', ')}`,
      })
      await sendPushToOwner(env, '⚠ DB 자동백업 중단', '100KB 초과 행으로 복원 불가능한 백업 — 해당 행 텍스트 축소 필요')
      return
    }

    await env.STORAGE.put(key, sql, { httpMetadata: { contentType: 'application/sql; charset=utf-8' } })

    // 14일 보존: backups/db/ 중 날짜가 14일보다 오래된 .sql 삭제.
    const cutoff = new Date(Date.now() + 9 * 3600 * 1000 - 14 * 86400 * 1000).toISOString().slice(0, 10)
    const toDelete: string[] = []
    let cursor: string | undefined
    do {
      const listed = await env.STORAGE.list({ prefix: 'backups/db/', cursor, limit: 500 })
      for (const obj of listed.objects) {
        const d = obj.key.replace('backups/db/', '').replace('.sql', '')
        if (d < cutoff) toDelete.push(obj.key)
      }
      cursor = listed.truncated ? listed.cursor : undefined
    } while (cursor)
    for (const k of toDelete) await env.STORAGE.delete(k)

    await logTelemetry(env, 'cron-backup-db-ok', {
      detail: `${key} ${sql.length}B, 보존정리 ${toDelete.length}건 삭제`,
    })
  } catch (e: any) {
    await logTelemetry(env, 'cron-backup-db-error', {
      detail: String(e?.message ?? e).slice(0, 500),
    })
    await sendPushToOwner(env, '⚠ DB 자동백업 실패', String(e?.message ?? e).slice(0, 200))
  }
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
        ctx.waitUntil(handlePanelWatchdog(env))        // 화재수신반 에이전트 워치독 (신규 cron 표현식 추가 없이 기존 틱에 얹음)
        break
      case '0 6 * * *':
        ctx.waitUntil(handleAccessBlockedAutoComplete(env))
        break
      case '32 18 * * *':
        ctx.waitUntil(handleDbBackup(env))
        ctx.waitUntil(handleHeartbeatCleanup(env))     // agent_heartbeats 14일 보존 정리
        break
    }
  },
}
