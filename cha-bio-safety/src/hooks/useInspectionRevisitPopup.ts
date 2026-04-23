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

    // ── 메타(monthRecord) 먼저 확보 ──
    // pending 판정을 활성 창 체크보다 앞에 둬야 하므로, meta 를 여기서 미리 꺼낸다.
    const meta = monthRecords[checkpointId]
    if (!meta || !meta.result) return null

    // ── (나) pending-action 분기: 활성 창 무관 ──
    // Task 6 사용자 확정: "조치 대기(주의/불량 + status='open') 상태의 개소는 활성
    // 스케줄 창과 무관하게 팝업이 떠야 한다." 근거는 조치 대기가 "기간"이 아니라
    // "이 개소 점검·조치해야 함" 경고이기 때문. 사용자가 재진입한 것 자체가 조치
    // 확인 의도일 수 있음.
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

    // ── (가) completed 분기: 오늘 활성 창만 확인, 기록 날짜는 무관 ──
    // Task 7 사용자 확정: "오늘 그 카테고리 활성 창이 존재 + 해당 개소에 기록이 존재"
    // 이면 팝업. 기록 날짜가 창 안일 필요 없음.
    // → matches.length > 0 + activeMatch 존재 체크만 수행. inPeriod 체크 제거.
    const matches = scheduleItems.filter(s => {
      if (s.category !== 'inspect') return false
      const ic = s.inspectionCategory ?? ''
      if (ic === category) return true
      if (SCHED_ALIAS[ic] && SCHED_ALIAS[ic] === category) return true
      return false
    })
    if (matches.length === 0) return null

    const todayYmd = (() => {
      const now = new Date()
      return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
    })()
    const activeMatch = matches.find(s => {
      const start = s.date
      const end   = s.endDate ?? s.date
      return todayYmd >= start && todayYmd <= end
    })
    if (!activeMatch) return null

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
    // 같은 체크포인트에 대해 한 번 "표시"된 뒤에는 다시 뜨지 않도록 가드.
    // 단, scheduleItems / monthRecords 가 비동기 로딩되는 경우 첫 effect run 시점에는
    // compute() 결과가 null 일 수 있다. 이 때 ref 를 미리 세팅해 버리면
    // 데이터가 뒤늦게 도착해도 popup 이 영영 뜨지 않는 버그가 생긴다.
    // → ref 는 "실제로 popup 을 띄운 순간" 에만 세팅한다.
    if (lastShownCpRef.current === checkpointId) return
    const s = compute()
    if (s) {
      lastShownCpRef.current = checkpointId
      setPopupState(s)
    } else {
      // Bug D 수정: 층/개소 이동으로 checkpointId 가 바뀌었는데 새 cp 에는 팝업이
      // 필요 없는 경우(기록 없음/활성창 없음 등), 이전 cp 의 popupState 가 그대로
      // 남아 화면에 잔류하던 문제. 새 cp 기준으로 compute() 가 null 이면 명시적
      // 으로 popupState 도 null 로 클리어한다. lastShownCpRef 는 건드리지 않음
      // (아직 "표시"된 적 없으므로 다음 데이터 도착 시 정상 평가되어야 함).
      setPopupState(null)
    }
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
