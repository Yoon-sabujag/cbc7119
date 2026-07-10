// 근무자 필터 + 웹푸시 단일 출처 — prod cbc-cron-worker/src/index.ts 로직 추출 (복붙 아님, Pages Env 로 재타입).
// prod 이관 시 cron-worker 의 getWorkingStaffIds/sendPush 와 대칭 유지.
import { buildPushPayload } from '@block65/webcrypto-web-push'

type PushEnv = { DB: D1Database; VAPID_PUBLIC_KEY?: string; VAPID_PRIVATE_KEY?: string }

export interface PushSubRow {
  id: string
  staff_id: string
  endpoint: string
  p256dh: string
  auth: string
}

// 진단용 영구 로깅 (telemetry_events). 실패해도 본 흐름 영향 없게 swallow.
export async function logTelemetry(
  env: PushEnv,
  event_type: string,
  opts: { status?: number | null; staff_id?: string | null; detail?: string | null } = {},
): Promise<void> {
  try {
    await env.DB.prepare(
      `INSERT INTO telemetry_events (ts, event_type, path, status, staff_id, user_agent, detail)
       VALUES (?, ?, NULL, ?, ?, NULL, ?)`,
    )
      .bind(new Date().toISOString(), event_type, opts.status ?? null, opts.staff_id ?? null, opts.detail ?? null)
      .run()
  } catch (e) {
    console.error('[telemetry] insert failed', e)
  }
}

// 단일 구독에 웹푸시 발송. VAPID 미설정 시 스킵. 410/404 만료 구독은 자동 삭제. 발송 성공 여부 반환.
export async function sendPush(
  env: PushEnv,
  sub: PushSubRow,
  payload: Record<string, unknown> & { title: string; body: string; type: string },
): Promise<boolean> {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    await logTelemetry(env, 'panel-push-novapid', { staff_id: sub.staff_id })
    return false
  }
  try {
    const pushData = await buildPushPayload(
      { data: JSON.stringify(payload) },
      { endpoint: sub.endpoint, expirationTime: null, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      { subject: 'mailto:admin@chabio.com', publicKey: env.VAPID_PUBLIC_KEY, privateKey: env.VAPID_PRIVATE_KEY },
    )
    const res = await fetch(sub.endpoint, {
      method: pushData.method,
      headers: pushData.headers,
      // Pages tsconfig(strict:false, lib DOM)에서 buildPushPayload().body 는 캐스트 필요 (push/test.ts:65 미러).
      body: pushData.body as unknown as BodyInit,
    })
    if (res.status === 410 || res.status === 404) {
      await env.DB.prepare('DELETE FROM push_subscriptions WHERE id = ?').bind(sub.id).run()
    }
    return res.status >= 200 && res.status < 300
  } catch (e) {
    console.error(`Push failed for ${sub.staff_id}:`, e)
    await logTelemetry(env, 'panel-push-throw', {
      staff_id: sub.staff_id,
      detail: `${(e as Error)?.message ?? e}`.slice(0, 500),
    })
    return false
  }
}

// ── 근무 판정 (cron-worker 대칭) ──────────────────────────
const SHIFT_REF = new Date(2026, 2, 1) // 2026-03-01
const CYCLE = ['당', '비', '주'] as const

function isWeekend(d: Date): boolean {
  const dow = d.getUTCDay()
  return dow === 0 || dow === 6
}

function getShiftRaw(
  staffId: string,
  date: Date,
  shiftMap: Record<string, { offset: number | null; fixed: string | null }>,
): string {
  const config = shiftMap[staffId]
  if (config?.fixed === 'day') return isWeekend(date) ? '휴' : '주'
  const offset = config?.offset
  if (offset === undefined || offset === null) return isWeekend(date) ? '휴' : '주'
  const diff = Math.round((date.getTime() - SHIFT_REF.getTime()) / 86_400_000)
  const base = CYCLE[(((diff + offset) % 3) + 3) % 3]
  if (base === '주' && isWeekend(date)) return '휴'
  return base
}

// ── 화재경보 실재실자 (시각 인지) ─────────────────────────
// 근무표(주간 08:30~17:30 / 당직 08:30~익일 08:30 / 비·휴 미근무). 당직 연차는 주간분(08:30~17:30)만
// 비근무, 야간(17:30~익일08:30)은 재실 유지. 화재수신반은 24h → 경보 '시각'의 실재실자로 좁힌다:
//   · 08:30~17:30      주간 재실 → 당직 + 주간 (그 시각 휴가 결근분만 제외)
//   · 17:30~익일 08:30 주간 퇴근 → 그 시간대 당직자만 (당직 연차 무관 · 야간 재실)
// 00:00~08:30 의 당직자는 '전날' 아침 시작분(당직=08:30~익일08:30)이라 전날 근무표로 판정.
const DAY_START_MIN = 8 * 60 + 30 // 08:30 주간 출근
const DAY_END_MIN = 17 * 60 + 30 // 17:30 주간 퇴근
const NOON_MIN = 13 * 60 // 13:00 — 반일(오전/오후) 경계

// 주간 시각(mins)에 이 휴가 유형이 '결근'인가.
//   오전 반차/공가(half_am·official_half_am): 08:30~12:59 결근 → mins < 13:00
//   오후 반차/공가(half_pm·official_half_pm): 13:00~17:30 결근 → mins >= 13:00
//   그 외(full·official_full 전일, half·경조·병가·보건·기타): 주간 전일 결근(기존 동작 유지)
//   휴가 없음: 재실.
function isOffDaytime(leaveType: string | undefined, mins: number): boolean {
  if (!leaveType) return false
  if (leaveType === 'half_am' || leaveType === 'official_half_am') return mins < NOON_MIN
  if (leaveType === 'half_pm' || leaveType === 'official_half_pm') return mins >= NOON_MIN
  return true
}

// KST 벽시계 자정 Date — getShiftRaw 의 일 단위 diff 를 정수로(정오 반올림 아티팩트 방지).
function kstMidnight(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00Z`)
}
function shiftDateStr(dateStr: string, deltaDays: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + deltaDays)
  return d.toISOString().slice(0, 10)
}

// 경보 시각(kstDate)·날짜(dateStr, 경보일 C) 기준 실재실 staff_id 집합.
export async function getPanelAudienceIds(env: PushEnv, kstDate: Date, dateStr: string): Promise<Set<string>> {
  const staffRows = await env.DB.prepare(
    'SELECT id, shift_offset, shift_fixed FROM staff WHERE active = 1',
  ).all<{ id: string; shift_offset: number | null; shift_fixed: string | null }>()
  const shiftMap: Record<string, { offset: number | null; fixed: string | null }> = {}
  for (const r of (staffRows.results ?? [])) shiftMap[r.id] = { offset: r.shift_offset, fixed: r.shift_fixed }

  const subs = await env.DB.prepare('SELECT DISTINCT staff_id FROM push_subscriptions').all<{ staff_id: string }>()
  const allIds = (subs.results ?? []).map(r => r.staff_id)

  // KST 벽시계 분 (getUTCHours = KST 시 — nowKST/detected_at+'Z' 규약).
  const mins = kstDate.getUTCHours() * 60 + kstDate.getUTCMinutes()

  if (mins >= DAY_START_MIN && mins < DAY_END_MIN) {
    // 주간 시간대 — 당직 + 주간 재실. 휴가는 그 시각 결근분만 제외(반일=반나절, 그 외=주간 전일).
    const day = kstMidnight(dateStr)
    const candidates = allIds.filter(id => {
      const shift = getShiftRaw(id, day, shiftMap)
      return shift === '당' || shift === '주'
    })
    const leaves = await env.DB.prepare('SELECT staff_id, type FROM annual_leaves WHERE date = ?')
      .bind(dateStr)
      .all<{ staff_id: string; type: string }>()
    const leaveType: Record<string, string> = {}
    for (const r of (leaves.results ?? [])) leaveType[r.staff_id] = r.type
    return new Set(candidates.filter(id => !isOffDaytime(leaveType[id], mins)))
  }

  // 야간 — 그 시간대 당직자만 (당직 야간분은 연차와 무관 → 연차 필터 미적용).
  // 17:30~24:00 → 그날(C) 당직 / 00:00~08:30 → 전날(아침 시작분) 당직.
  const dutyDate = kstMidnight(mins >= DAY_END_MIN ? dateStr : shiftDateStr(dateStr, -1))
  const onDuty = allIds.filter(id => getShiftRaw(id, dutyDate, shiftMap) === '당')
  return new Set(onDuty)
}

// 근무 중(비/휴/연차 제외) staff_id 집합. cron-worker getWorkingStaffIds 와 동일 로직(날짜 단위, prod 대칭 참조용).
// ※ 화재경보 발송은 시각 인지 getPanelAudienceIds 사용 — 이 함수는 시(hour) 미구분이라 야간 경보에 직접 쓰지 말 것.
export async function getWorkingStaffIds(env: PushEnv, kstDate: Date, dateStr: string): Promise<Set<string>> {
  const staffRows = await env.DB.prepare(
    'SELECT id, shift_offset, shift_fixed FROM staff WHERE active = 1',
  ).all<{ id: string; shift_offset: number | null; shift_fixed: string | null }>()
  const shiftMap: Record<string, { offset: number | null; fixed: string | null }> = {}
  for (const r of (staffRows.results ?? [])) shiftMap[r.id] = { offset: r.shift_offset, fixed: r.shift_fixed }

  const subs = await env.DB.prepare('SELECT DISTINCT staff_id FROM push_subscriptions').all<{ staff_id: string }>()
  const allIds = (subs.results ?? []).map(r => r.staff_id)

  const working = allIds.filter(id => {
    const shift = getShiftRaw(id, kstDate, shiftMap)
    return shift !== '비' && shift !== '휴'
  })

  const leaves = await env.DB.prepare('SELECT staff_id FROM annual_leaves WHERE date = ?')
    .bind(dateStr)
    .all<{ staff_id: string }>()
  const leaveIds = new Set((leaves.results ?? []).map(r => r.staff_id))

  return new Set(working.filter(id => !leaveIds.has(id)))
}

// 경보 시각의 실재실자에게 payload push. 발송 성공 수 반환. (trigger 1차 / renotify 재발송 공용.)
export async function pushToWorkingStaff(
  env: PushEnv,
  kstDate: Date,
  dateStr: string,
  payload: Record<string, unknown> & { title: string; body: string; type: string },
): Promise<number> {
  const workingIds = await getPanelAudienceIds(env, kstDate, dateStr)
  if (workingIds.size === 0) return 0
  const subs = await env.DB.prepare(
    'SELECT id, staff_id, endpoint, p256dh, auth FROM push_subscriptions',
  ).all<PushSubRow>()
  const targets = (subs.results ?? []).filter(s => workingIds.has(s.staff_id))
  const results = await Promise.allSettled(targets.map(sub => sendPush(env, sub, payload)))
  return results.filter(r => r.status === 'fulfilled' && r.value === true).length
}

// 패널 경보 push payload — superset: 현재 SW 는 title/body/type 만 읽고, 나머지(kind/alarmId/url…)는
// data 로 실려 forward-compatible (딥링크 실동작은 design 트랙 SW 업데이트).
export function buildPanelPayload(a: {
  alarmType: 'fire' | 'equip' | 'fault'
  alarmId: string
  location: string | null
  detectedAt: string
}): Record<string, unknown> & { title: string; body: string; type: string } {
  const t = a.alarmType
  const loc = a.location ? ` · ${a.location}` : ' · 수신반 확인 필요'
  const title = t === 'fire' ? '🔴 화재수신반 경보' : t === 'fault' ? '🟡 화재수신반 고장' : '설비 동작 감지'
  const bodyHead = t === 'fire' ? '화재 신호 감지' : t === 'fault' ? '고장 신호 감지' : '설비 동작 감지'
  return {
    title,
    body: `${bodyHead} (${a.detectedAt})${loc}`,
    type: 'panel_alarm',
    kind: 'panel_alarm',
    alarmType: a.alarmType,
    alarmId: a.alarmId,
    location: a.location,
    detectedAt: a.detectedAt,
    url: '/fire-alarm',
  }
}
