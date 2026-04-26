import type { CheckPoint, ScheduleItem } from '../types'

// 260427-1dc: 월 2 cycle 구조 카테고리 (DIV/컴프레셔)
// — computeCardCompletion 에서 cycle window 분기 적용 대상
const CYCLE_CATEGORIES = new Set(['DIV', '컴프레셔'])

// 서버 getCycleRange 와 동일 로직의 클라이언트 버전.
// scheduleItems 는 InspectionPage 의 useQuery 로 당월치만 로드된 배열.
// today 가 어떤 블록에도 속하지 않으면 today 이전의 가장 최근 블록 반환.
// 일정이 아예 없으면 null (호출자가 폴백 처리).
function getCycleRangeJS(
  scheduleItems: ScheduleItem[],
  cat: string,
  today: string,
): [string, string] | null {
  const dates = Array.from(new Set(
    scheduleItems
      .filter(s => s.category === 'inspect' && s.inspectionCategory === cat)
      .map(s => s.date)
  )).sort()
  if (dates.length === 0) return null

  const dayDiff = (a: string, b: string) => {
    const da = new Date(a + 'T00:00:00Z').getTime()
    const db = new Date(b + 'T00:00:00Z').getTime()
    return Math.round((db - da) / 86400000)
  }
  const blocks: string[][] = []
  let cur: string[] = []
  for (const d of dates) {
    if (cur.length === 0 || dayDiff(cur[cur.length - 1], d) === 1) cur.push(d)
    else { blocks.push(cur); cur = [d] }
  }
  if (cur.length) blocks.push(cur)

  for (const b of blocks) {
    if (today >= b[0] && today <= b[b.length - 1]) return [b[0], b[b.length - 1]]
  }
  let candidate: string[] | null = null
  for (const b of blocks) {
    if (b[b.length - 1] < today) candidate = b
  }
  if (candidate) return [candidate[0], candidate[candidate.length - 1]]
  return null
}

// 대시보드 월간 카드와 동일 기준의 완료 개수 계산 (모바일 일반점검 카드용).
// - cp.defaultResult 또는 description 에 '접근불가' 포함 시 자동 완료
//   ('[접근불가]' 대괄호 형태와 '접근불가' 단순 형태 모두 인식 — includes 매칭)
// - 그 외에는 기록 윈도우 안에 완료 기록(normal | caution | bad+resolved) 이 하나라도 있으면 완료
// - DIV/컴프레셔 카테고리는 cycle window (현재/직전 연속 블록) 기준,
//   다른 카테고리는 monthRecordDates 그대로 (월 전체).
// - scheduleItems / today 미전달 시 cycle 분기 비활성 (기존 monthly 동작 유지 — backward compat).
// - monthRecordDates: cp.id → 당월 완료 기록들의 YYYY-MM-DD 배열
//   (호출자가 InspectionPage 라인 4014 에서 같은 룰로 채워야 정합) (260426-f54)
// - 유도등 처리는 이 함수 범위 밖 — 호출자가 scheduleItems.status='done' 바이패스로 처리
export function computeCardCompletion(options: {
  cps: CheckPoint[]
  monthRecordDates: Record<string, string[]>
  scheduleItems?: ScheduleItem[]
  today?: string
}): number {
  const { cps, monthRecordDates, scheduleItems, today } = options
  const completedIds = new Set<string>()

  for (const cp of cps) {
    if (cp.defaultResult || cp.description?.includes('접근불가')) {
      completedIds.add(cp.id)
      continue
    }
    const dates = monthRecordDates[cp.id] ?? []
    if (dates.length === 0) continue

    if (CYCLE_CATEGORIES.has(cp.category) && scheduleItems && today) {
      const range = getCycleRangeJS(scheduleItems, cp.category, today)
      if (range) {
        const [s, e] = range
        if (dates.some(d => d >= s && d <= e)) completedIds.add(cp.id)
        // 폴백: cycle 일정 자체가 없으면 (range === null) → monthly 동작
      } else {
        completedIds.add(cp.id)
      }
    } else {
      completedIds.add(cp.id)  // 기존 monthly 동작
    }
  }

  return completedIds.size
}
