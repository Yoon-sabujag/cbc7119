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
  // Bug G 수정: dismiss 기반 억제 정책.
  // 기존 `lastShownCpRef` 는 "한 번 표시한 cp 는 더이상 안 띄움" 이라 층/개소
  // 이동 후 돌아와도 재노출이 안 됐다. 사용자 의도:
  //   - cp 이동으로 팝업이 사라진 건 "보류" → 돌아오면 다시 떠야 함
  //   - 사용자가 명시적으로 닫기/이동 버튼을 눌러야 그 cp 는 이후 억제
  // 따라서 "사용자가 dismiss() 를 호출한 cp" 만 Set 에 기록하고, useEffect 에서
  // 그 Set 에 포함된 cp 는 스킵. 모달 인스턴스가 파괴되면 훅도 재생성되어
  // Set 이 초기화되므로 세션 단위 억제가 된다.
  const dismissedCpsRef = useRef<Set<string>>(new Set())

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
      // cp 해제: popupState 만 정리. dismissedCpsRef 는 유지 (재선택 시 억제 계속).
      setPopupState(null)
      return
    }
    // Bug G: 사용자가 명시적으로 dismiss 한 cp 는 같은 모달 세션 내에서 억제.
    if (dismissedCpsRef.current.has(checkpointId)) {
      // 기존 popup 이 혹시 남아 있다면 닫는다 (방어적).
      setPopupState(null)
      return
    }
    // 그 외에는 매 재방문마다 compute() 결과대로 갱신. 기록/활성창이 있으면 표시,
    // 없으면 명시적으로 null 클리어 (Bug D 회귀 방지 — 이전 cp popup 이 잔류하지
    // 않도록).
    const s = compute()
    setPopupState(s)
  }, [checkpointId, category, cpMetaKey, schedKey, excludeKey]) // eslint-disable-line

  const dismiss = useCallback(() => {
    // 사용자 명시적 dismiss — 현재 cp 를 억제 집합에 추가하고 popup 닫음.
    if (checkpointId) dismissedCpsRef.current.add(checkpointId)
    setPopupState(null)
  }, [checkpointId])

  const evaluate = useCallback(() => {
    // 수동 재평가: 현재 cp 의 억제도 해제하고 compute() 결과대로 갱신.
    if (checkpointId) dismissedCpsRef.current.delete(checkpointId)
    const s = compute()
    setPopupState(s)
  }, [compute, checkpointId])

  return { popupState, dismiss, evaluate }
}
