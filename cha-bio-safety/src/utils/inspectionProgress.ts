import type { CheckPoint, ScheduleItem } from '../types'

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

// 대시보드 월간 카드와 동일 기준의 완료 개수 계산 (모바일 일반점검 카드용).
// - 공통: cp.defaultResult 또는 description '[접근불가]' 는 자동 완료
// - 다일 카테고리: attribution window 내 기록 하나라도 있으면 완료
// - 비-다일 카테고리: 당월 기록 하나라도 있으면 완료 (대시보드 월간 카드와 일치)
// - monthRecordDates: cp.id → 당월 normal/caution 기록들의 YYYY-MM-DD 배열
// - 유도등 처리는 이 함수 범위 밖 — 호출자가 scheduleItems.status='done' 바이패스로 처리
export function computeCardCompletion(options: {
  cps: CheckPoint[]
  today: string
  monthRecordDates: Record<string, string[]>
  scheduleItems: ScheduleItem[]
}): number {
  const { cps, today, monthRecordDates, scheduleItems } = options
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

    const dates = monthRecordDates[cp.id]
    if (!dates?.length) continue

    if (MULTI_DAY_CATEGORIES.has(cp.category)) {
      const w = getWindow(cp.category)
      if (dates.some(d => d >= w.start && d < w.end)) completedIds.add(cp.id)
    } else {
      // 월간 전체 기록 기반 — 대시보드 월간 카드와 동일
      completedIds.add(cp.id)
    }
  }

  return completedIds.size
}
