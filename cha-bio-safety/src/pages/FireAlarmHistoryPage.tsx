// 화재수신반 이력 페이지 (승인 시안 002-A) — 월 스테퍼 + 날짜 그룹 리스트.
// 병합 헬퍼/행 컴포넌트 재사용(드리프트 0). 백엔드 무변경 — 기존 엔드포인트만 소비.
// 260803-vp9: 사건단위 dedup 으로 출처 구분 필요 없어져 출처 세그먼트 제거 + 세부 열람 모달 배선.
// 260803 소극화 후속: 화재 전용 기록 전환으로 종류(화재/설비/고장) 세그먼트도 제거.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, BellRing } from 'lucide-react'
import { alarmApi, fireAlarmApi, type Alarm } from '../utils/api'
import { mergePanelEvents, kstStr, type PanelEventItem } from '../utils/panelEvents'
import { PanelEventRow } from '../components/PanelEventRow'
import { PanelEventDetailModal } from '../components/PanelEventDetailModal'

// 이력 뷰 본문 (필터존 + 리스트) — 풀페이지 헤더는 포함하지 않음(context별 상이).
// thumb: 데스크톱 in-pane 에서 PanelEventRow 썸네일 노출.
export function FireAlarmHistoryView({ thumb }: { thumb?: boolean }) {
  // 월 상태 (KST 현재연/월 초기값)
  const [ym, setYm] = useState(() => {
    const s = kstStr(new Date())
    return { year: Number(s.slice(0, 4)), month: Number(s.slice(5, 7)) }
  })
  const prevMonth = () => setYm(p => p.month === 1 ? { year: p.year - 1, month: 12 } : { year: p.year, month: p.month - 1 })
  const nextMonth = () => setYm(p => p.month === 12 ? { year: p.year + 1, month: 1 } : { year: p.year, month: p.month + 1 })

  // 세부 열람 모달 선택 행
  const [sel, setSel] = useState<PanelEventItem | null>(null)

  // 자동감지 720h(30일) — 감시 6월 시작이라 현재 자동 전량 커버.
  const { data: auto } = useQuery({
    queryKey: ['alarm-events-720'],
    queryFn: async () => { try { return await alarmApi.getEvents(720) } catch { return [] as Alarm[] } },
    staleTime: 30_000,
  })
  // 수동기록 (Task1 훅과 동일 키 → 캐시 공유)
  const { data: manual } = useQuery({
    queryKey: ['fire-alarm-year', ym.year],
    queryFn: async () => { try { return await fireAlarmApi.getByYear(ym.year) } catch { return [] as any[] } },
    staleTime: 30_000,
  })

  // 병합 → 월 필터 (이미 시간 내림차순)
  const monthKey = `${ym.year}-${String(ym.month).padStart(2, '0')}`
  const filtered = mergePanelEvents(auto ?? [], manual ?? [])
    .filter(e => e.time.slice(0, 7) === monthKey)

  // 날짜 그룹 (KST 오늘/어제)
  const todayYmd = kstStr(new Date()).slice(0, 10)
  const yesterdayYmd = kstStr(new Date(Date.now() - 24 * 3600_000)).slice(0, 10)
  const groups: { key: string; label: string; items: typeof filtered }[] = []
  for (const e of filtered) {
    const dayKey = e.time.slice(0, 10)
    let g = groups[groups.length - 1]
    if (!g || g.key !== dayKey) {
      const mmdd = e.time.slice(5, 10)
      const label = dayKey === todayYmd ? `오늘 · ${mmdd}` : dayKey === yesterdayYmd ? `어제 · ${mmdd}` : mmdd
      g = { key: dayKey, label, items: [] }
      groups.push(g)
    }
    g.items.push(e)
  }

  const stepBtn = 'w-[26px] h-[26px] rounded-[7px] bg-surface-sunken border border-border-default text-text-secondary flex items-center justify-center'

  return (
    <div className="flex flex-col h-full min-h-0 bg-surface-page">
      {/* 필터존 (fz) — 월 스테퍼만 (화재 전용 전환으로 종류 세그먼트 제거) */}
      <div className="shrink-0 flex flex-col gap-[9px] px-3 py-2.5 border-b border-border-default bg-surface-page">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="flex-1" />
          {/* 월 스테퍼 (per) */}
          <div className="inline-flex items-center gap-1">
            <button onClick={prevMonth} className={stepBtn}><ChevronLeft size={14} /></button>
            <span className="text-[13px] font-bold text-text-primary min-w-[88px] text-center tabular-nums">{ym.year}년 {ym.month}월</span>
            <button onClick={nextMonth} className={stepBtn}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* 리스트 */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-3 py-10 text-caption text-text-tertiary text-center">해당 조건의 이력이 없습니다</div>
        ) : (
          groups.map(g => (
            <div key={g.key}>
              <div className="px-3 pt-3 pb-[5px] text-[11px] font-bold text-text-tertiary tracking-wide">{g.label}</div>
              {g.items.map(item => <PanelEventRow key={item.id} item={item} thumb={thumb} onSelect={setSel} />)}
            </div>
          ))
        )}
      </div>
      {sel && <PanelEventDetailModal item={sel} onClose={() => setSel(null)} />}
    </div>
  )
}

// 모바일 route 풀페이지 — h-12 헤더(back) + 이력 뷰(썸네일 없음).
export default function FireAlarmHistoryPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col h-full bg-surface-page">
      {/* 헤더 (gh) */}
      <div className="flex items-center h-12 px-3 bg-surface-page border-b border-border-default shrink-0">
        <button onClick={() => navigate(-1)}
          className="w-7 h-7 flex items-center justify-center rounded-[7px] bg-surface-sunken text-text-secondary shrink-0">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 flex items-center gap-[7px] pl-2.5 text-title font-semibold text-text-primary min-w-0">
          <BellRing size={18} className="text-text-secondary shrink-0" />
          <span className="truncate">화재수신반 이력</span>
        </div>
      </div>
      <FireAlarmHistoryView />
    </div>
  )
}
