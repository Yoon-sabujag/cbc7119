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

/** KST 기준 시각을 'YYYY-MM-DD HH:MM:SS' 문자열로 (DB 저장용). d 미지정 시 현재 KST. */
export function nowKstSql(d: Date = nowKST()): string {
  return d.toISOString().replace('T', ' ').slice(0, 19)
}
