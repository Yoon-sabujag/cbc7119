import { useEffect, useRef, useState, useCallback } from 'react'
import type { ScheduleItem } from '../types'
import type { RevisitVariant } from '../components/InspectionRevisitPopup'

// ── 재진입 팝업 상태 ─────────────────────────────────────
export interface RevisitPopupState {
  show:          boolean
  variant:       RevisitVariant
  checkedAt:     string
  inspectorName: string
  recordId?:     string
}

// monthRecords 는 cpId → 상세 메타 맵. 호출부에서 조합해서 넘긴다.
export interface MonthRecordEntry {
  result?:    string     // 'normal' | 'caution' | 'bad' | ...
  checkedAt?: string
  staffName?: string
  recordId?:  string
  status?:    'open' | 'resolved'
}

export interface UseRevisitArgs {
  checkpointId:      string | null | undefined
  category:          string | null | undefined          // '소화기', 'DIV' 등
  monthRecords:      Record<string, MonthRecordEntry>   // cpId → 메타
  scheduleItems:     ScheduleItem[]                      // 이번 달 schedule_items
  excludeCategories?: string[]                           // default: ['CCTV', '화재수신반']
}

// 카테고리 alias — schedule_items.inspectionCategory ↔ cp.category
// (기존 InspectionPage 4336: 방화문 → 특별피난계단)
const SCHED_ALIAS: Record<string, string> = { '방화문': '특별피난계단' }

// ── 헬퍼: 날짜 문자열을 YYYY-MM-DD 로 정규화 ─────────────
function toYmd(s: string | undefined | null): string | null {
  if (!s) return null
  // 이미 YYYY-MM-DD
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/)
  if (m) return m[1]
  // ISO → KST
  const d = new Date(s)
  if (isNaN(d.getTime())) return null
  const kst = new Date(d.getTime() + 9 * 3600_000)
  return `${kst.getUTCFullYear()}-${String(kst.getUTCMonth()+1).padStart(2,'0')}-${String(kst.getUTCDate()).padStart(2,'0')}`
}

// ── 훅 본체 ──────────────────────────────────────────────
export function useInspectionRevisitPopup(args: UseRevisitArgs): {
  popupState: RevisitPopupState | null
  dismiss:    () => void
  evaluate:   () => void
} {
  const { checkpointId, category, monthRecords, scheduleItems, excludeCategories } = args
  const [popupState, setPopupState] = useState<RevisitPopupState | null>(null)
  const lastShownCpRef = useRef<string | null>(null)

  // 안정 deps — monthRecords 전체 객체 대신 해당 체크포인트만 직렬화
  const cpMeta = checkpointId ? monthRecords[checkpointId] : undefined
  const cpMetaKey = cpMeta ? JSON.stringify(cpMeta) : ''
  const schedKey = JSON.stringify(
    scheduleItems
      .filter(s => s.category === 'inspect')
      .map(s => [s.id, s.date, s.endDate ?? '', s.inspectionCategory ?? ''])
  )
  const excludeKey = (excludeCategories ?? ['CCTV', '화재수신반']).join('|')

  const compute = useCallback((): RevisitPopupState | null => {
    if (!checkpointId) return null
    const excl = excludeCategories ?? ['CCTV', '화재수신반']
    if (category && excl.includes(category)) return null

    // schedule_items 필터: 'inspect' + inspectionCategory 매칭
    // 방화문→특별피난계단 alias 역매핑 포함
    const matches = scheduleItems.filter(s => {
      if (s.category !== 'inspect') return false
      const ic = s.inspectionCategory ?? ''
      if (ic === category) return true
      if (SCHED_ALIAS[ic] && SCHED_ALIAS[ic] === category) return true
      return false
    })
    if (matches.length === 0) return null

    const meta = monthRecords[checkpointId]
    if (!meta || !meta.result) return null

    const recYmd = toYmd(meta.checkedAt)
    if (!recYmd) return null

    // 기록 날짜가 어떤 일정의 [date, endDate ?? date] 구간에 포함되는지
    const inPeriod = matches.some(s => {
      const start = s.date
      const end   = s.endDate ?? s.date
      return recYmd >= start && recYmd <= end
    })
    if (!inPeriod) return null

    const isPending = (meta.result === 'bad' || meta.result === 'caution') && meta.status === 'open'
    if (isPending) {
      return {
        show:          true,
        variant:       'pending-action',
        checkedAt:     meta.checkedAt ?? '',
        inspectorName: meta.staffName ?? '—',
        recordId:      meta.recordId,
      }
    }

    // normal / resolved → completed
    return {
      show:          true,
      variant:       'completed',
      checkedAt:     meta.checkedAt ?? '',
      inspectorName: meta.staffName ?? '—',
      recordId:      meta.recordId,
    }
  }, [checkpointId, category, monthRecords, scheduleItems, excludeCategories])

  useEffect(() => {
    if (!checkpointId) {
      lastShownCpRef.current = null
      setPopupState(null)
      return
    }
    // 같은 체크포인트에 한 번만 자동 show
    if (lastShownCpRef.current === checkpointId) return
    lastShownCpRef.current = checkpointId
    const s = compute()
    setPopupState(s)
  }, [checkpointId, category, cpMetaKey, schedKey, excludeKey]) // eslint-disable-line

  const dismiss = useCallback(() => {
    setPopupState(null)
  }, [])

  const evaluate = useCallback(() => {
    lastShownCpRef.current = null
    const s = compute()
    setPopupState(s)
    if (s && checkpointId) lastShownCpRef.current = checkpointId
  }, [compute, checkpointId])

  return { popupState, dismiss, evaluate }
}
