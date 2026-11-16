// 점검모드 온디맨드 계산 (Option B — cron/scheduler 없음).
// enabled = (오늘 소방점검일 && now ∈ [WORK_START ~ (야간 21:00 / 없으면 17:30)]) || 수동 override 유효.
// 수동 override(on/off + 당일 만료)만 panel_maint_mode 에 저장.
import { nowKST, nowKstSql } from '../utils/kst'

type MaintEnv = { DB: D1Database }

// 일과 시작(KST) = 08:30.
const WORK_START = '08:30'

export interface MaintState {
  enabled: boolean
  source: 'auto' | 'manual'
  reason: string | null
  autoOffAt: string | null
  turnedOnAt: string | null
  turnedOnBy: string | null
}

interface MaintRow {
  enabled: number
  source: string | null
  reason: string | null
  auto_off_at: string | null
  turned_on_at: string | null
  turned_on_by: string | null
}

// 오늘 소방점검일? schedule_items.category = 'fire'.
// 실측 확정(2026-11): inspection_category 는 점검대상/업체명(예: '동양소방')이라 '소방' prefix가
// 전혀 없음 — category 컬럼(elevator/task/inspect/event/fire 5종) 중 'fire' 가 소방 작동기능/정밀
// 점검 일정의 정확한 신호. 과거 'inspection_category LIKE 소방%' 가정은 production 데이터와
// 불일치해 자동 전환이 전혀 동작하지 않았다.
export async function isFireInspectionDay(env: MaintEnv, dateStr: string): Promise<boolean> {
  const r = await env.DB.prepare(
    `SELECT 1 FROM schedule_items
     WHERE (date = ?1 OR (date <= ?1 AND end_date >= ?1))
       AND category = 'fire' LIMIT 1`,
  ).bind(dateStr).first()
  return !!r
}

// 오늘 소방점검이 야간까지 연장되는 날? schedule_items.night_date 직접 매칭
// (category='event' 가정은 실측 결과 전부 낮 시간 투어/지원이라 폐기됨).
export async function hasNightEvent(env: MaintEnv, dateStr: string): Promise<boolean> {
  const r = await env.DB.prepare(
    `SELECT 1 FROM schedule_items WHERE category = 'fire' AND night_date = ?1 LIMIT 1`,
  ).bind(dateStr).first()
  return !!r
}

export async function computeMaint(env: MaintEnv, now?: Date): Promise<MaintState> {
  const kst = now ?? nowKST()
  const nowSql = nowKstSql(kst)
  const todayStr = nowSql.slice(0, 10)
  const hhmm = nowSql.slice(11, 16)

  const row = await env.DB.prepare(`SELECT * FROM panel_maint_mode WHERE id = 'maint'`).first<MaintRow>()

  // 수동 override 유효 (당일 만료 전) → override 값 우선.
  if (row && row.source === 'manual' && row.auto_off_at && nowSql < row.auto_off_at) {
    return {
      enabled: row.enabled === 1,
      source: 'manual',
      reason: row.reason,
      autoOffAt: row.auto_off_at,
      turnedOnAt: row.turned_on_at,
      turnedOnBy: row.turned_on_by,
    }
  }

  // 자동 계산.
  const fireDay = await isFireInspectionDay(env, todayStr)
  if (!fireDay) {
    return { enabled: false, source: 'auto', reason: null, autoOffAt: null, turnedOnAt: null, turnedOnBy: null }
  }
  const autoOff = (await hasNightEvent(env, todayStr)) ? '21:00' : '17:30'
  const enabled = WORK_START <= hhmm && hhmm < autoOff
  return {
    enabled,
    source: 'auto',
    reason: null,
    autoOffAt: `${todayStr} ${autoOff}:00`,
    turnedOnAt: null,
    turnedOnBy: null,
  }
}

// 수동 override 저장 — 당일 23:59:59 만료 (다음날 자동 재개, §3④).
export async function setManualOverride(
  env: MaintEnv,
  opts: { enabled: boolean; reason?: string; staffId: string; now?: Date },
): Promise<void> {
  const kst = opts.now ?? nowKST()
  const nowSql = nowKstSql(kst)
  const todayStr = nowSql.slice(0, 10)
  const hhmm = nowSql.slice(11, 16)
  // §1.5: 수동 override 도 자동복구(17:30/21:00) 그대로. 자동 OFF 시각 전이면 그 시각에 만료(→자동값 복귀),
  //       이미 지났으면 당일 종료(다음날 자동 재개). 경보중 confirmAlarm ON 이 밤까지 경보를 삼키지 않게 한다.
  const autoOff = (await hasNightEvent(env, todayStr)) ? '21:00' : '17:30'
  const until = hhmm < autoOff ? `${todayStr} ${autoOff}:00` : `${todayStr} 23:59:59`
  await env.DB.prepare(
    `UPDATE panel_maint_mode
     SET enabled = ?1, source = 'manual', reason = ?2, auto_off_at = ?3,
         turned_on_at = CASE WHEN ?1 = 1 THEN ?4 ELSE turned_on_at END,
         turned_on_by = ?5, updated_at = ?4
     WHERE id = 'maint'`,
  ).bind(opts.enabled ? 1 : 0, opts.reason ?? null, until, nowSql, opts.staffId).run()
}
