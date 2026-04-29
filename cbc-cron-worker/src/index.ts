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
  } catch (e) {
    console.error(`Push failed for ${sub.staff_id}:`, e)
    await logTelemetry(env, 'cron-daily-push-throw', {
      staff_id: sub.staff_id,
      detail: `${(e as Error)?.message ?? e}\n${(e as Error)?.stack ?? ''}`.slice(0, 1000),
    })
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

// ── Diagnostic: send to ALL subs (bypasses working filter) ─────
// ⚠️ 진단용 — Apple Push endpoint 응답까지 telemetry 로 보기 위함.
// 검증 종료 후 본 함수 + */2 cron 라우팅 함께 제거.
async function handleDiagnosticAllSubs(env: Env): Promise<void> {
  await logTelemetry(env, 'cron-diag-enter', { detail: '*/2 diagnostic — bypasses working filter' })
  try {
    const allSubs = await env.DB.prepare(
      'SELECT id, staff_id, endpoint, p256dh, auth, notification_preferences FROM push_subscriptions'
    ).all<PushSubRow>()
    const rows = allSubs.results ?? []
    await logTelemetry(env, 'cron-diag-start', {
      detail: JSON.stringify({
        allSubsCount: rows.length,
        endpoints: rows.map(r => ({
          staff_id: r.staff_id,
          host: (() => { try { return new URL(r.endpoint).host } catch { return null } })(),
        })),
      }),
    })
    const sends: Promise<void>[] = []
    for (const sub of rows) {
      sends.push(sendPush(env, sub, {
        title: '[진단] 자동발송 점검',
        body: '관리자 진단용 임시 푸시입니다',
        type: 'diagnostic',
      }))
    }
    const settled = await Promise.allSettled(sends)
    const fulfilled = settled.filter(s => s.status === 'fulfilled').length
    const rejected = settled.filter(s => s.status === 'rejected').length
    await logTelemetry(env, 'cron-diag-end', {
      detail: JSON.stringify({ sendsCount: sends.length, fulfilled, rejected }),
    })
  } catch (e) {
    await logTelemetry(env, 'cron-diag-error', {
      detail: `${(e as Error)?.message ?? e}
${(e as Error)?.stack ?? ''}`.slice(0, 1500),
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
  if (targets.length === 0) return

  // 2) 카테고리별 처리
  for (const row of targets) {
    const category = row.category
    const assigneeId = row.assignee_id
    if (!assigneeId) {
      console.warn(`[access-blocked-auto] ${category}: assignee_id NULL — skip`)
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
    } catch (e) {
      console.error(`[access-blocked-auto] ${category}: batch failed`, e)
      // 카테고리 단위로만 fail — 다음 카테고리는 계속 진행
    }
  }
}

// ── Main export ──────────────────────────────────────
export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    switch (controller.cron) {
      case '45 23 * * *':
        ctx.waitUntil(handleDailyNotifications(env))
        break
      // 진단용 임시 cron — 검증 종료 후 wrangler.toml 의 "*/2 * * * *" 와 함께 제거.
      case '*/2 * * * *':
        ctx.waitUntil(handleDiagnosticAllSubs(env))
        break
      case '*/5 * * * *':
        ctx.waitUntil(handleEventNotifications(env))
        break
      case '0 6 * * *':
        ctx.waitUntil(handleAccessBlockedAutoComplete(env))
        break
    }
  },
}
