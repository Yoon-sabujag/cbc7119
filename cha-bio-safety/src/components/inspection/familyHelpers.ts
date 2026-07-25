// ── Family A 공용 헬퍼 (InspectionPage 인라인 정의에서 추출, 260725-ps9) ──
// faAutoMemoFor(소화전 라인별 특례 auto 특이사항) + hydrantRemediationSymbol(소화전 조치 심볼).
// InspectionPage / InspectionCardModal(도면점검) 이 공유 — Family A/소화전 로직 SSOT.
// 순환 import 회피: familyCard.tsx 는 타입만 참조(값 import 없음), inspectionContent.ts 는
// 어떤 컴포넌트도 import 안 함 → familyHelpers → {familyCard, inspectionContent} 단방향, cycle 0.
import { faAutoMemo, type FaMark } from './familyCard'
import { inspectionContent, type InspectionItem } from '../../data/inspectionContent'

// 소화전 라인별 특례를 반영한 auto 특이사항.
//  - special[i].symbol (라인0 위치표시등): caution/bad 무관 고정 문구(C/D 대체)
//  - special[3].picker (소화전함·호스): prefix + 선택값(경종/호스걸이/직접입력 텍스트)
// special 없는 카테고리(청정·펌프·완강기·비상콘센트)는 기존 faAutoMemo 로 위임 → A 회귀 0.
export function faAutoMemoFor(
  category: string,
  items: InspectionItem[],
  marks: Record<number, FaMark>,
  ctx?: { hydrantPick?: string; hydrantCustom?: string },
): string {
  const special = inspectionContent[category]?.special
  if (!special) return faAutoMemo(items, marks)
  return items
    .filter(it => marks[it.i] === 'caution' || marks[it.i] === 'bad')
    .map(it => {
      const sp = special[String(it.i)]
      if (sp?.symbol) return sp.symbol as string
      if (sp?.picker) {
        const prefix = (marks[it.i] === 'bad' ? sp.badPrefix : sp.cautionPrefix) as string
        const suffix = ctx?.hydrantPick === '직접 입력'
          ? (ctx?.hydrantCustom ?? '').trim()
          : (ctx?.hydrantPick ?? (sp.picker as string[])[0])
        return `${prefix.replace(/\s*$/, '')} ${suffix}`.trimEnd()
      }
      return (marks[it.i] === 'bad' ? it.bad : it.caution)
    })
    .join('\n')
}

// 소화전 조치용 remediation_symbol 도출(개소당 단일). 우선순위: 라인3(피커) > 라인0(위치표시등).
// 라인3 우선이라 재방문 시 remediation_symbol 로 피커 선택값 복원 가능(라인0 은 고정문구=무상태).
export function hydrantRemediationSymbol(
  marks: Record<number, FaMark>,
  hydrantPick: string,
  hydrantCustom: string,
): string | undefined {
  const special = inspectionContent['소화전']?.special
  if (!special) return undefined
  if (marks[3] === 'caution' || marks[3] === 'bad') {
    if (hydrantPick === '직접 입력') return hydrantCustom.trim() || undefined
    const symbols = special['3'].symbols as Record<string, string>
    return symbols[hydrantPick] ?? symbols['경종']
  }
  if (marks[0] === 'caution' || marks[0] === 'bad') return special['0'].symbol as string
  return undefined
}

// 재진입 카드 복원 시 개소의 어떤 당월 기록을 쓸지 — InspectionPage monthMap upsert 규칙 미러(SSOT).
// getMonthRecords 는 checked_at DESC → 최신 pending(주의/불량+open) 우선, 없으면 최신([0]).
// (도면점검 InspectionCardModal ↔ 일반점검 InspectionPage 가 같은 기록을 복원하도록 통일.)
export function pickRestoreRecord<T extends { result?: string; status?: string }>(recs: T[]): T | undefined {
  return recs.find(r => (r.result === 'bad' || r.result === 'caution') && (r.status ?? 'open') === 'open') ?? recs[0]
}
