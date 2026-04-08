// ── DB 타임스탬프 KST 표시 유틸 ────────────────────────────
// DB는 'YYYY-MM-DD HH:MM:SS' 형식의 KST 시간을 저장 (모든 INSERT/UPDATE가 datetime('now','+9 hours') 사용).
// 표시 로직은 이 문자열의 시간 컴포넌트를 그대로 신뢰해서 KST로 보여줌.

/** DB의 'YYYY-MM-DD HH:MM:SS' 문자열을 파싱 — KST 가정. 시간 컴포넌트를 그대로 사용. */
export function parseDbDate(iso: string | null | undefined): Date | null {
  if (!iso) return null
  // 이미 'Z'나 '+09:00' 등 타임존 마커가 있으면 그대로 (외부 시스템 호환)
  if (/[Zz]|[+-]\d{2}:?\d{2}$/.test(iso)) return new Date(iso)
  // 'YYYY-MM-DD HH:MM:SS' → 컴포넌트별로 직접 파싱 (브라우저 타임존과 무관하게 항상 같은 결과)
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/)
  if (m) {
    const [, y, mo, d, h, mi, s] = m
    return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s ?? '0'))
  }
  // 날짜만 있는 경우
  const dm = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (dm) {
    const [, y, mo, d] = dm
    return new Date(Number(y), Number(mo) - 1, Number(d))
  }
  return new Date(iso)
}

const pad2 = (n: number) => String(n).padStart(2, '0')

/** "YYYY.MM.DD" 형식 (KST 로컬 표시) */
export function fmtKstDate(iso: string | null | undefined): string {
  const d = parseDbDate(iso)
  if (!d) return '-'
  return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`
}

/** "YYYY.MM.DD HH:MM" 형식 (KST 로컬 표시) */
export function fmtKstDateTime(iso: string | null | undefined): string {
  const d = parseDbDate(iso)
  if (!d) return '-'
  return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

/** "HH:MM" 형식 */
export function fmtKstTime(iso: string | null | undefined): string {
  const d = parseDbDate(iso)
  if (!d) return '-'
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

/** "YYYY-MM-DD" 형식 (날짜만, KST 기준) — DB 키나 비교용 */
export function fmtKstYmd(iso: string | null | undefined): string {
  const d = parseDbDate(iso)
  if (!d) return ''
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

/** ko-KR 로케일 문자열 (사용자 표시용) */
export function fmtKstLocaleString(iso: string | null | undefined): string {
  const d = parseDbDate(iso)
  if (!d) return '-'
  return d.toLocaleString('ko-KR')
}

/** 현재 시각을 KST의 'YYYY-MM-DDTHH:MM' 형식으로 반환 (datetime-local input의 기본값용) */
export function nowKstLocal(): string {
  // UTC + 9시간 후 UTC 메서드로 컴포넌트 추출 (브라우저 타임존 무관)
  const k = new Date(Date.now() + 9 * 60 * 60 * 1000)
  return `${k.getUTCFullYear()}-${pad2(k.getUTCMonth() + 1)}-${pad2(k.getUTCDate())}T${pad2(k.getUTCHours())}:${pad2(k.getUTCMinutes())}`
}

/** 현재 시각을 KST 'YYYY-MM-DD' 형식으로 반환 */
export function todayKstYmd(): string {
  const k = new Date(Date.now() + 9 * 60 * 60 * 1000)
  return `${k.getUTCFullYear()}-${pad2(k.getUTCMonth() + 1)}-${pad2(k.getUTCDate())}`
}
