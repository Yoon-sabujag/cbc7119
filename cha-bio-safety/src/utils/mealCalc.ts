import type { RawShift } from './shiftCalc'

/**
 * 일별 제공 식수 계산 (D-08 ~ D-14)
 * @param rawShift - 근무 유형 ('당'|'비'|'주'|'휴')
 * @param leaveType - 연차 유형 (undefined = 연차 없음)
 * @param dayOfWeek - 0=일, 6=토
 * @returns 0, 1, or 2
 */
export function calcProvidedMeals(
  rawShift: RawShift,
  leaveType: string | undefined,
  dayOfWeek: number
): number {
  // D-12: 전일 연차/공가 → 0
  if (leaveType === 'full' || leaveType === 'official_full') return 0
  // D-14: 비번 → 0
  if (rawShift === '비') return 0
  // D-11: 일요일 당직 → 0
  if (rawShift === '당' && dayOfWeek === 0) return 0
  // D-10: 토요일 당직 → 1
  if (rawShift === '당' && dayOfWeek === 6) return 1
  // D-09: 평일 당직 → 2
  if (rawShift === '당') return 2
  // D-13: 반차/공가 0.5일 → 1
  if (rawShift === '주' && leaveType && (
    leaveType === 'half' || leaveType === 'half_am' || leaveType === 'half_pm' ||
    leaveType === 'official_half_am' || leaveType === 'official_half_pm'
  )) return 1
  // D-08: 평일 주간 → 1
  if (rawShift === '주') return 1
  // '휴' (공휴일) → 0
  return 0
}

/**
 * 주말 식대 계산 (D-15 ~ D-17)
 * 미식 여부와 무관, 당직 여부만으로 결정
 */
export function calcWeekendAllowance(
  rawShift: RawShift,
  dayOfWeek: number
): number {
  if (rawShift === '당' && dayOfWeek === 6) return 5500   // D-15: 토요일 당직
  if (rawShift === '당' && dayOfWeek === 0) return 11000  // D-16: 일요일 당직
  return 0
}
