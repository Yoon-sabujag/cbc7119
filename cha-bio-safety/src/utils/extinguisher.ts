// 분말 소화기 교체 연한 경고 (제조 후 10년 만료 기준)
//   - warn:     만료 1년 전 도래 (교체 준비 필요)
//   - imminent: 만료 6개월 전 (교체 시급)
//   - danger:   연한 초과 (즉시 교체 필요)
//   - null:     해당 없음 (분말 아님 / 제조일 없음 / 아직 1년 이상 남음)
//
// InspectionPage 인라인 계산 + getReplaceStatus + FloorPlanPage 마커 강조
// 모두 이 single source 를 사용한다.

export type ReplaceWarning = 'warn' | 'imminent' | 'danger' | null

export function getReplaceWarning(
  type: string | undefined | null,
  manufacturedAt: string | undefined | null,
): ReplaceWarning {
  if (!type?.includes('분말') || !manufacturedAt) return null
  const [y, m] = manufacturedAt.split('-').map(Number)
  if (!y || !m) return null
  const expiry = new Date(y + 10, m - 1)
  const imm = new Date(expiry); imm.setMonth(imm.getMonth() - 6)
  const warn = new Date(expiry); warn.setFullYear(warn.getFullYear() - 1)
  const now = new Date()
  if (now >= expiry) return 'danger'
  if (now >= imm) return 'imminent'
  if (now >= warn) return 'warn'
  return null
}

// 마커 stroke 매핑 (시안 A안 — 사용자 승인됨)
export const REPLACE_WARNING_STROKE: Record<NonNullable<ReplaceWarning>, { color: string; width: number }> = {
  warn:     { color: '#eab308', width: 1.5 },
  imminent: { color: '#f97316', width: 2   },
  danger:   { color: '#ef4444', width: 2.5 },
}
