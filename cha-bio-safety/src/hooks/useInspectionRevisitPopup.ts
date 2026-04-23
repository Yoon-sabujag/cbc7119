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

  // ── 진단용 로그 ──────────────────────────────────────
  // Task 5 (2026-04-23): 프로덕션에서 소화기/DIV/댐퍼/연결송수관 등 특정 카테고리에서
  // 팝업이 미발동되는 증상이 리포트됨. 재현이 어려워 훅 동작을 브라우저 콘솔에서 직접
  // 관찰할 수 있도록 진단 로그를 추가. 원인이 파악되면 (또는 플래그가 불필요해지면)
  // 이 로그는 제거할 수 있음. localStorage.setItem('REVISIT_DBG', '1') 로만 활성화.
  const dbgEnabled = typeof window !== 'undefined' && (() => {
    try { return window.localStorage.getItem('REVISIT_DBG') === '1' } catch { return false }
  })()
  const dbg = (reason: string, extra?: Record<string, unknown>) => {
    if (!dbgEnabled) return
    // eslint-disable-next-line no-console
    console.log('[revisit]', category, checkpointId ?? 'none', '→', reason, extra ?? '')
  }

  const compute = useCallback((): RevisitPopupState | null => {
    if (!checkpointId) { dbg('skip: no checkpointId'); return null }
    const excl = excludeCategories ?? ['CCTV', '화재수신반']
    if (category && excl.includes(category)) { dbg('skip: excluded category'); return null }

    // ── 메타(monthRecord) 먼저 확보 ──
    // pending 판정을 활성 창 체크보다 앞에 둬야 하므로, meta 를 여기서 미리 꺼낸다.
    // Task 6.2: 소화기에서 "no monthRecord for cp" 로그가 나오면 원인이
    //   (a) monthRecords 전체가 비어있음 / (b) 특정 cpId 접두사만 빠짐 / (c) 정상인데 해당 cp 만 없음
    // 중 어디인지 즉시 구분 가능하도록 진단 정보를 확장한다.
    const meta = monthRecords[checkpointId]
    if (!meta || !meta.result) {
      const keys = Object.keys(monthRecords)
      dbg('skip: no monthRecord for cp', {
        hasMeta: !!meta,
        meta,
        monthRecordsSize:       keys.length,
        monthRecordsSampleKeys: keys.slice(0, 5),
        cpIdStartsWithFE:       keys.filter(k => k.startsWith('CP-FE')).slice(0, 5),
      })
      return null
    }

    // ── (나) pending-action 분기: 활성 창 무관 ──
    // Task 6 사용자 확정: "조치 대기(주의/불량 + status='open') 상태의 개소는 활성
    // 스케줄 창과 무관하게 팝업이 떠야 한다." 근거는 조치 대기가 "기간"이 아니라
    // "이 개소 점검·조치해야 함" 경고이기 때문. 사용자가 재진입한 것 자체가 조치
    // 확인 의도일 수 있음.
    // 따라서 matches / activeWindow / inPeriod 세 필터 전부 skip.
    const isPending = (meta.result === 'bad' || meta.result === 'caution') && meta.status === 'open'
    if (isPending) {
      dbg('SHOW pending-action (window-agnostic)', { result: meta.result, status: meta.status, checkedAt: meta.checkedAt })
      return {
        show:          true,
        variant:       'pending-action',
        checkedAt:     meta.checkedAt ?? '',
        inspectorName: meta.staffName ?? '—',
        recordId:      meta.recordId,
      }
    }

    // ── (가) completed 분기: 기존 필터 유지 (matches → activeMatch → inPeriod) ──
    const matches = scheduleItems.filter(s => {
      if (s.category !== 'inspect') return false
      const ic = s.inspectionCategory ?? ''
      if (ic === category) return true
      if (SCHED_ALIAS[ic] && SCHED_ALIAS[ic] === category) return true
      return false
    })
    if (matches.length === 0) {
      dbg('skip: no schedule_items matching category', {
        scheduleItemsCount: scheduleItems.length,
        inspectCats: scheduleItems.filter(s => s.category === 'inspect').map(s => s.inspectionCategory),
      })
      return null
    }

    const recYmd = toYmd(meta.checkedAt)
    if (!recYmd) { dbg('skip: unparseable checkedAt', { checkedAt: meta.checkedAt }); return null }

    // ── 기간 체크: 두 조건 모두 만족해야 함 ──
    // (1) 기록 날짜가 일정 구간 안에 포함 (원래 정책)
    // (2) 오늘 날짜가 일정 구간 안에 포함 (Task 5 C2 fix — 현재 활성 점검 기간만)
    //
    // 사용자 의도 재확인: "지금 소화전·비상콘센트 점검 기간이다. 이 외 카테고리에서 팝업이
    // 뜨면 안 된다." → 이번 달 스케줄 item 이어도 이미 끝난 창이면 팝업 미발동.
    const todayYmd = (() => {
      const now = new Date()
      return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
    })()
    const activeMatch = matches.find(s => {
      const start = s.date
      const end   = s.endDate ?? s.date
      return todayYmd >= start && todayYmd <= end
    })
    if (!activeMatch) {
      dbg('skip: no active schedule window today', {
        todayYmd,
        windows: matches.map(s => `${s.date}~${s.endDate ?? s.date}`),
      })
      return null
    }
    // 기록 날짜가 "활성 창" 안에 있는지 확인 (정책: 이번 달 점검 기간 내 기록)
    const inPeriod = recYmd >= activeMatch.date && recYmd <= (activeMatch.endDate ?? activeMatch.date)
    if (!inPeriod) {
      dbg('skip: record not in active window', { recYmd, active: `${activeMatch.date}~${activeMatch.endDate ?? activeMatch.date}` })
      return null
    }

    dbg('SHOW completed', { recYmd, todayYmd, result: meta.result, status: meta.status })
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
