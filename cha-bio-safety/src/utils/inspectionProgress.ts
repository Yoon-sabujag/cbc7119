import type { CheckPoint } from '../types'

// 대시보드 월간 카드와 동일 기준의 완료 개수 계산 (모바일 일반점검 카드용).
// - cp.defaultResult 또는 description '[접근불가]' 는 자동 완료
// - 그 외에는 당월 완료된 점검(normal | caution | bad+resolved) 기록이 하나라도 있으면 완료
// - monthRecordDates: cp.id → 당월 완료 기록들의 YYYY-MM-DD 배열
//   (호출자가 InspectionPage 라인 4014 에서 같은 룰로 채워야 정합) (260426-f54)
// - 유도등 처리는 이 함수 범위 밖 — 호출자가 scheduleItems.status='done' 바이패스로 처리
//
// 연속 다일 점검 카테고리(DIV/컴프레셔/소화전/비상콘센트/소화기)도 attribution window
// 구분 없이 월 전체 기록으로 판정한다. 실운영에서 연속 점검 주기가 같은 달 안에서
// 끝나고 일정이 매 일자마다 개별 행으로 등록되는 구조라, 월 단위 집계가 대시보드와
// 정확히 같은 수치를 만든다.
export function computeCardCompletion(options: {
  cps: CheckPoint[]
  monthRecordDates: Record<string, string[]>
}): number {
  const { cps, monthRecordDates } = options
  const completedIds = new Set<string>()

  for (const cp of cps) {
    if (cp.defaultResult || cp.description?.includes('[접근불가]')) {
      completedIds.add(cp.id)
      continue
    }
    if (monthRecordDates[cp.id]?.length) {
      completedIds.add(cp.id)
    }
  }

  return completedIds.size
}
