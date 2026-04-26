import type { CheckPoint } from '../types'

// 260427-1dc: 월 2 cycle 구조 카테고리 (DIV/컴프레셔)
// — computeCardCompletion 에서 월 반반 분할 (1~15 / 16~말) 분기 적용 대상
const CYCLE_CATEGORIES = new Set(['DIV', '컴프레셔'])

// today 가 속한 반쪽 윈도우 반환 (1~15: early / 16~말: late).
function getCycleHalfRange(today: string): [string, string] {
  const ym = today.slice(0, 7)
  const day = Number(today.slice(8, 10))
  const [y, m] = today.split('-').map(Number)
  const lastDay = new Date(y, m, 0).getDate()
  const monthEnd = `${ym}-${String(lastDay).padStart(2,'0')}`
  return day <= 15 ? [`${ym}-01`, `${ym}-15`] : [`${ym}-16`, monthEnd]
}

// 대시보드 월간 카드와 동일 기준의 완료 개수 계산 (모바일 일반점검 카드용).
// - cp.defaultResult 또는 description 에 '접근불가' 포함 시 자동 완료
// - 그 외에는 기록 윈도우 안에 완료 기록(normal | caution | bad+resolved) 이 하나라도 있으면 완료
// - DIV/컴프레셔 카테고리는 today 가 속한 반쪽 윈도우 (1~15 또는 16~말),
//   다른 카테고리는 monthRecordDates 그대로 (월 전체).
// - today 미전달 시 cycle 분기 비활성 (기존 monthly 동작 유지).
// - 유도등 처리는 이 함수 범위 밖 — 호출자가 scheduleItems.status='done' 바이패스로 처리
export function computeCardCompletion(options: {
  cps: CheckPoint[]
  monthRecordDates: Record<string, string[]>
  today?: string
}): number {
  const { cps, monthRecordDates, today } = options
  const completedIds = new Set<string>()

  for (const cp of cps) {
    if (cp.defaultResult || cp.description?.includes('접근불가')) {
      completedIds.add(cp.id)
      continue
    }
    const dates = monthRecordDates[cp.id] ?? []
    if (dates.length === 0) continue

    if (CYCLE_CATEGORIES.has(cp.category) && today) {
      const [s, e] = getCycleHalfRange(today)
      if (dates.some(d => d >= s && d <= e)) completedIds.add(cp.id)
    } else {
      completedIds.add(cp.id)  // 기존 monthly 동작
    }
  }

  return completedIds.size
}
