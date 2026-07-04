import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Flame, Settings, AlertTriangle } from 'lucide-react'
import { alarmApi, type Alarm } from '../utils/api'
import LivePanelImage from '../components/panel/LivePanelImage'

// Phase 25 Surface 3 — 경보 풀스크린 (/fire-alarm, 푸시 탭 목적지).
// 풀 takeover: fire(빨강, Flame, ACK 시 재발송 중지) / equip(초록, Settings, 단발).
// 백엔드 /api/alarm/* 은 이 디자인 트랙에 미배포 -> getActive try/catch->null,
// ack 낙관적(optimistic) try/catch. 활성 경보 없으면 "상황 종료" 중립 상태.
// 스크롤락 = overflow:hidden + touchmove 차단 (SideMenu 패턴), body:fixed 금지.

export default function FireAlarmPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const idParam = params.get('id')

  // 활성 경보 조회 — 미배포/에러 시 null 로 degrade (크래시 X)
  const { data: alarm, isLoading } = useQuery<Alarm | null>({
    queryKey: ['alarm-active'],
    queryFn: async () => {
      try {
        return await alarmApi.getActive()
      } catch {
        return null
      }
    },
    retry: false,
    refetchInterval: 15_000,
  })

  // 배경 스크롤 잠금 (SideMenu 패턴: overflow:hidden + touchmove 차단)
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const prevent = (e: TouchEvent) => {
      const stage = document.getElementById('fa-stage')
      if (stage && stage.contains(e.target as Node)) return
      e.preventDefault()
    }
    document.addEventListener('touchmove', prevent, { passive: false })
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('touchmove', prevent)
    }
  }, [])

  const kind = alarm?.type // 'fire' | 'equip' | 'fault' | undefined
  const isFire = kind === 'fire'
  const isFault = kind === 'fault'

  // id 파라미터 우선, 없으면 활성 경보 id 사용
  const ackId = idParam || alarm?.id || null

  const onAck = async () => {
    if (ackId) {
      try {
        await alarmApi.ack(ackId) // 낙관적 — 실패해도 화면은 진행
      } catch {
        // 미배포/에러 무시: UI 흐름 유지
      }
    }
    if (isFire) {
      // 화재: ACK 후 화재수신반 페이지(경보중 state)에서 초안 보완
      navigate('/inspection?panel=fire-alarm')
    } else {
      // 설비: 정보성 단발 -> 닫고 대시보드로 (재발송 없음)
      navigate('/dashboard')
    }
  }

  const inlineKeyframes = `
    @keyframes fawash { 0%,100%{opacity:.82} 50%{opacity:1} }
    @keyframes faring { 0%{transform:scale(1);opacity:.7} 70%{transform:scale(1.6);opacity:0} 100%{opacity:0} }
  `

  // 활성 경보 없음 (이미 clear/ACK 되었거나 미배포) -> 중립 상황 종료 상태
  if (!isLoading && !alarm) {
    return (
      <div
        id="fa-stage"
        className="fixed inset-0 bg-surface-page flex flex-col items-center justify-center gap-4 px-6"
        style={{ top: 'var(--sat, 0px)', bottom: 'var(--sab, 0px)' }}
      >
        <div className="w-20 h-20 rounded-full bg-surface-sunken flex items-center justify-center">
          <AlertTriangle size={38} className="text-text-tertiary" />
        </div>
        <div className="text-display text-text-primary">경보 없음</div>
        <div className="text-body text-text-secondary">상황 종료</div>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-2 px-8 py-3 rounded-full bg-surface-sunken text-text-primary font-bold"
        >
          닫기
        </button>
      </div>
    )
  }

  // 로딩 중 (초기 조회) — 빈 배경만
  if (isLoading) {
    return (
      <div
        id="fa-stage"
        className="fixed inset-0 bg-surface-page"
        style={{ top: 'var(--sat, 0px)', bottom: 'var(--sab, 0px)' }}
      />
    )
  }

  // 색 = 고정 의미 (fire danger #ef4444 / fault warning #f59e0b / equip safe #22c55e)
  const washBg = isFire
    ? 'radial-gradient(circle at center, rgba(239,68,68,.5), rgba(110,8,8,.93))'
    : isFault ? 'radial-gradient(circle at center, rgba(245,158,11,.45), rgba(120,72,8,.93))'
    : 'radial-gradient(circle at center, rgba(34,197,94,.32), rgba(7,38,21,.93))'
  const iconBg = isFire ? '#ef4444' : isFault ? '#f59e0b' : '#22c55e'
  const frameFilter = isFire ? 'brightness(.42) saturate(1.2)' : isFault ? 'brightness(.42) saturate(1.15)' : 'brightness(.4)'

  return (
    <div
      id="fa-stage"
      className="fixed inset-0 overflow-hidden bg-surface-page"
      style={{ top: 'var(--sat, 0px)', bottom: 'var(--sab, 0px)' }}
    >
      <style>{inlineKeyframes}</style>

      {/* fa-bg — 수신반 라이브 프레임 (dim) */}
      <div className="absolute inset-0" style={{ filter: frameFilter }}>
        <LivePanelImage
          frameUpdatedAt={null}
          className="w-full h-full"
          imgClassName="h-full"
          alt="화재수신반 경보 화면"
        />
      </div>

      {/* fa-wash — radial 오버레이 (fire blink / equip static) */}
      <div
        className="absolute inset-0"
        style={{ background: washBg, animation: isFire ? 'fawash 1.3s ease-in-out infinite' : undefined }}
      />

      {/* 콘텐츠 */}
      <div className="relative h-full flex flex-col items-center justify-center gap-5 px-7 text-center text-white">
        {/* fa-icon 96px round */}
        <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
          {isFire && (
            <span
              className="absolute inset-0 rounded-full"
              style={{ background: iconBg, animation: 'faring 1.3s ease-out infinite' }}
            />
          )}
          <span
            className="relative rounded-full flex items-center justify-center"
            style={{ width: 96, height: 96, background: iconBg }}
          >
            {isFire ? <Flame size={46} className="text-white" /> : isFault ? <AlertTriangle size={46} className="text-white" /> : <Settings size={44} className="text-white" />}
          </span>
        </div>

        {/* fa-kind — 화재 발생 / 고장 발생 / 설비 동작 */}
        <div className="flex items-center gap-2 text-[30px] font-extrabold">
          {isFire ? <Flame size={28} /> : isFault ? <AlertTriangle size={28} /> : <Settings size={28} />}
          <span>{isFire ? '화재 발생' : isFault ? '고장 발생' : '설비 동작'}</span>
        </div>

        {/* fa-loc */}
        <div className="text-[40px] font-extrabold leading-tight">
          {alarm?.location ?? '장소 확인 필요'}
        </div>

        {/* fa-time */}
        {alarm?.detectedAt && (
          <div className="font-mono tabular-nums text-body opacity-90">{alarm.detectedAt}</div>
        )}

        {/* fa-sub */}
        <div className="text-body opacity-90 max-w-md">
          {isFire
            ? '현장 확인 및 조치 후 화재수신반 페이지에서 초안을 보완하세요'
            : isFault ? '수신반 고장 신호 감지 · 정보성 알림 (단발 · 재발송 없음)'
            : '설비 동작 감지 · 정보성 알림 (단발 · 재발송 없음)'}
        </div>

        {/* fa-ack — 확인 */}
        <button
          onClick={onAck}
          className="mt-2 px-12 py-4 rounded-full bg-white font-extrabold text-[20px]"
          style={{ color: isFire ? '#b91c1c' : isFault ? '#b45309' : '#15803d' }}
        >
          확인
        </button>

        {/* fa-note */}
        <div className="flex items-center gap-1.5 text-caption opacity-85">
          {(isFire || isFault) && <AlertTriangle size={15} />}
          <span>
            {isFire
              ? '확인을 눌러야 추가 푸시가 멈춥니다'
              : '정보성 알림 · 확인 시 닫힘 (재발송 없음)'}
          </span>
        </div>
      </div>
    </div>
  )
}
