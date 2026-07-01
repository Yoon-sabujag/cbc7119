// 점검모드 온디맨드 계산 (Option B — cron/scheduler 없음).
// enabled = (오늘 소방점검일 && now ∈ [WORK_START ~ (야간 21:00 / 없으면 17:30)]) || 수동 override 유효.
// 수동 override(on/off + 당일 만료)만 panel_maint_mode 에 저장.
import { nowKST, nowKstSql } from '../utils/kst'

type MaintEnv = { DB: D1Database }

// 일과 시작(KST). §3④ 예시 cron '0 23 UTC'=KST 08:00. 튜닝 가능.
const WORK_START = '08:00'

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

// 오늘 소방점검일? schedule_items.inspection_category 가 '소방…' (staging 값 전부 '소방' prefix).
// 정확한 소방 카테고리 집합은 필요 시 `SELECT DISTINCT inspection_category` 확정 후 IN(...) 로 교체.
export async function isFireInspectionDay(env: MaintEnv, dateStr: string): Promise<boolean> {
  const r = await env.DB.prepare(
    `SELECT 1 FROM schedule_items
     WHERE (date = ?1 OR (date <= ?1 AND end_date >= ?1))
       AND inspection_category LIKE '소방%' LIMIT 1`,
  ).bind(dateStr).first()
  return !!r
}

// 오늘 야간 일정? category='event' (§3④). range-aware. 저녁 time 필터는 v1 미적용.
export async function hasNightEvent(env: MaintEnv, dateStr: string): Promise<boolean> {
  const r = await env.DB.prepare(
    `SELECT 1 FROM schedule_items
     WHERE (date = ?1 OR (date <= ?1 AND end_date >= ?1))
       AND category = 'event' LIMIT 1`,
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
