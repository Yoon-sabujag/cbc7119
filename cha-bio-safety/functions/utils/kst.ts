/** KST(UTC+9) 기준 현재 시각 */
export function nowKST(): Date {
  const utc = new Date()
  return new Date(utc.getTime() + 9 * 60 * 60 * 1000)
}

/** KST 기준 오늘 날짜 (YYYY-MM-DD) */
export function todayKST(): string {
  return nowKST().toISOString().slice(0, 10)
}

/** KST 기준 현재 연도 */
export function yearKST(): number {
  return nowKST().getFullYear()
}

/** KST 기준 현재 월 */
export function monthKST(): number {
  return nowKST().getMonth() + 1
}
