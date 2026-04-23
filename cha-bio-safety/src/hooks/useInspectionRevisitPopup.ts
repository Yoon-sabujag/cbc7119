import { useEffect, useState, useCallback } from 'react'
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
  // Bug G 재설계 (260423-htx-08): dismiss 기반 억제 정책도 제거.
  //
  // 이전 단계에서 `lastShownCpRef` (한 번 띄운 cp 는 영영 억제) → `dismissedCpsRef`
  // (사용자가 dismiss 호출한 cp 만 억제) 로 옮겼는데, 사용자 재피드백:
  //   "팝업을 다시 띄우는게 맞지 않을까?"
  // — dismiss 는 "잠깐 안 보이게" 하는 일시 액션일 뿐, 이후 재방문에서도 억제까지
  // 할 필요는 없다는 의도.
  //
  // 새 정책: 억제 자체 없음.
  //   - useEffect 는 checkpointId/deps 가 바뀔 때마다 compute() 결과로 setPopupState.
  //   - dismiss() 는 단순히 setPopupState(null). Set 조작 없음.
  //   - 같은 cp 에서 dismiss → popup 사라짐 → 같은 render 사이클 내엔 deps 불변 →
  //     useEffect 재트리거 없음 → 재노출 안 됨 (Set 없이도 OK).
  //   - 다른 cp 이동 후 복귀 → checkpointId 재변경 → useEffect 재트리거 → compute()
  //     결과 있으면 재노출. 이 동작이 사용자 기대에 부합.

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
    // checkpointId 또는 관련 deps 가 바뀔 때마다 compute() 결과대로 setPopupState.
    // - checkpointId=null 이면 compute() 가 즉시 null 반환 → popupState=null.
    // - 유의미 값 반환 시 popup 표시. 억제 Set 없으므로 재방문 시 자연 재노출.
    setPopupState(compute())
  }, [checkpointId, category, cpMetaKey, schedKey, excludeKey]) // eslint-disable-line

  const dismiss = useCallback(() => {
    // 사용자 명시적 dismiss — popup 만 닫음. 억제 없음.
    // 같은 cp 에서 dismiss 후 render: deps 불변 → useEffect 재트리거 없음 → 재노출 안 됨.
    // 다른 cp 로 이동 후 복귀: checkpointId 변경 → useEffect 재트리거 → 재노출.
    setPopupState(null)
  }, [])

  const evaluate = useCallback(() => {
    // 수동 재평가: compute() 재실행하여 현재 상태 기준 갱신.
    setPopupState(compute())
  }, [compute])

  return { popupState, dismiss, evaluate }
}
