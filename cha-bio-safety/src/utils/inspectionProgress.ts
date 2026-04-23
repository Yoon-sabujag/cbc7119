import type { CheckPoint, ScheduleItem } from '../types'
import type { MonthRecordEntry } from '../hooks/useInspectionRevisitPopup'

// 2일 이상 연속 점검이 허용된 카테고리. 일정 기준 attribution window 로 완료 판정.
export const MULTI_DAY_CATEGORIES: ReadonlySet<string> = new Set([
  'DIV',
  '컴프레셔',
  '소화전',
  '비상콘센트',
  '소화기',
])

// [start, end) 형태의 attribution window.
// start = 가장 최근 같은 카테고리 일정 (today 포함 이전). 없으면 today.
// end   = 다음 같은 카테고리 일정 (start 이후). 없으면 먼 미래.
// cross-month edge case: scheduleItems 가 당월만 포함하면 이전 달 일정을 못 찾는다.
//   그 경우 start 가 today 로 fallback 되어 과거 기록이 window 에서 빠질 수 있다.
//   호출자에게 필요하면 더 넓은 범위의 scheduleItems 를 전달해야 한다.
export function getAttributionWindow(
  inspectionCategory: string,
  today: string,
  scheduleItems: ScheduleItem[],
): { start: string; end: string } {
  const dates = scheduleItems
    .filter(s => s.category === 'inspect' && s.inspectionCategory === inspectionCategory)
    .map(s => s.date)
    .sort()
  const prev = [...dates].reverse().find(d => d <= today) ?? today
  const next = dates.find(d => d > prev) ?? '9999-12-31'
  return { start: prev, end: next }
}

// 대시보드 방식 완료 개수 계산 (모바일 일반점검 카드용).
// - 공통: cp.defaultResult 또는 description '[접근불가]' 는 자동 완료
// - 다일 카테고리: attribution window 내 monthRecords 기록 DISTINCT
// - 1일 카테고리: 당일 records 기록 기준
// - 유도등 처리는 이 함수 범위 밖 — 호출자가 scheduleItems.status='done' 바이패스로 처리
export function computeCardCompletion(options: {
  cps: CheckPoint[]
  today: string
  records: Record<string, unknown>
  monthRecords: Record<string, MonthRecordEntry>
  scheduleItems: ScheduleItem[]
}): number {
  const { cps, today, records, monthRecords, scheduleItems } = options
  const completedIds = new Set<string>()

  const windowCache = new Map<string, { start: string; end: string }>()
  const getWindow = (cat: string) => {
    let w = windowCache.get(cat)
    if (!w) { w = getAttributionWindow(cat, today, scheduleItems); windowCache.set(cat, w) }
    return w
  }

  for (const cp of cps) {
    if (cp.defaultResult || cp.description?.includes('[접근불가]')) {
      completedIds.add(cp.id)
      continue
    }

    if (MULTI_DAY_CATEGORIES.has(cp.category)) {
      const entry = monthRecords[cp.id]
      if (entry?.checkedAt) {
        const d = entry.checkedAt.slice(0, 10)
        const w = getWindow(cp.category)
        if (d >= w.start && d < w.end) completedIds.add(cp.id)
      }
    } else {
      if (records[cp.id]) completedIds.add(cp.id)
    }
  }

  return completedIds.size
}
