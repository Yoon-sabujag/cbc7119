import { useEffect, useState } from 'react'
import { panelApi } from '../../utils/api'

// Phase 25: 공용 라이브 프레임 이미지.
// - snapshotKey(경보 고정 스냅샷) 있으면 고정 URL, 자체 폴 없음.
// - 없으면(라이브) latest.jpg 를 status 폴과 분리해 자체 타이머로 직접 프리로드(더블버퍼) 폴.
//   status→frameUpdatedAt→이미지 2단 체인 제거로 라이브뷰 지연 단축 (~5-6s → ~3-4s, 260711-39e).
// - 프리로드: new Image() 로 다음 프레임 백그라운드 로드 → onload 성공분만 표시 src 교체 → 깜빡임 0.
// - 로드 실패(204=프레임없음/네트워크) → 이전 프레임 유지 + 다음 폴 재시도. 연속 실패 초과 시 회색 placeholder.
// - LIVE 배지 / 상태 텍스트 / 신선도는 여기서 렌더 X — consumer 가 Surface 별로 오버레이.

const LIVE_POLL_MS = 1200   // 라이브 프레임 자체 폴 주기 (에이전트 업로드 실질 ~2.75s 대비 충분히 조밀)
const MAX_FAIL_HIDE = 5     // 연속 실패 이 횟수 초과 시 placeholder (초기/미연결 degrade). 단발 실패는 이전 프레임 유지.

interface LivePanelImageProps {
  frameUpdatedAt?: string | number | null
  snapshotKey?: string | null
  alt?: string
  className?: string
  imgClassName?: string
  aspectClass?: string   // 프레임 비율/높이 (기본 16:9 aspect-video). 에이전트 크롭 비율 or 고정높이(h-[..]) 로 오버라이드.
  objectClass?: string   // object-fit (기본 cover). object-fill = 짜부(비율 무시하고 박스 채움).
  onClick?: () => void
  // 캡처 죽음 라벨(liveSignalDown 결과). 자체 배지 없는 consumer(모바일 대시보드 등)용 회색 오버레이 —
  // 자체 LIVE 배지가 있는 Surface 는 이 prop 을 쓰지 말고 배지에서 직접 처리한다 (이중 표기 방지).
  signalDownLabel?: string | null
}

export default function LivePanelImage({
  frameUpdatedAt,
  snapshotKey,
  alt = '화재수신반 라이브 화면',
  className = '',
  imgClassName = '',
  aspectClass = 'aspect-video',
  objectClass = 'object-cover',
  onClick,
  signalDownLabel,
}: LivePanelImageProps) {
  const isLive = !snapshotKey

  // 표시 중인 src — 프리로드 성공분만 교체(깜빡임 0). 경보 스냅샷 모드는 고정.
  const [shownSrc, setShownSrc] = useState<string>(() =>
    snapshotKey ? panelApi.snapshotUrl(snapshotKey) : panelApi.latestFrameUrl(frameUpdatedAt ?? 0),
  )
  const [hidden, setHidden] = useState(false)   // 연속 실패 → placeholder

  // 경보 스냅샷 모드: 고정 URL (자체 폴 없음).
  useEffect(() => {
    if (snapshotKey) {
      setShownSrc(panelApi.snapshotUrl(snapshotKey))
      setHidden(false)
    }
  }, [snapshotKey])

  // 라이브 모드: latest.jpg 자체 타이머 프리로드 폴 (status 분리). setTimeout 체인 = 로드 완료 후 다음 예약(겹침 방지).
  useEffect(() => {
    if (!isLive) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    let fails = 0
    const tick = () => {
      const next = panelApi.latestFrameUrl(Date.now())
      const img = new Image()
      img.onload = () => {
        if (cancelled) return
        fails = 0
        setShownSrc(next)
        setHidden(false)
        timer = setTimeout(tick, LIVE_POLL_MS)
      }
      img.onerror = () => {
        if (cancelled) return
        fails += 1
        if (fails > MAX_FAIL_HIDE) setHidden(true)   // 지속 실패(초기 미연결 등) → placeholder
        timer = setTimeout(tick, LIVE_POLL_MS)
      }
      img.src = next
    }
    tick()
    return () => { cancelled = true; clearTimeout(timer) }
  }, [isLive])

  return (
    <div
      className={`relative w-full ${aspectClass} bg-black overflow-hidden ${className}`}
      onClick={onClick}
    >
      {!hidden ? (
        <img
          src={shownSrc}
          alt={alt}
          className={`w-full h-full ${objectClass} ${imgClassName}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-sunken text-text-tertiary text-caption">
          수신반 화면 로딩 · 미연결
        </div>
      )}
      {signalDownLabel && !hidden && (
        <div
          className="absolute bottom-[7px] left-[7px] inline-flex items-center gap-1 rounded-pill px-[7px] py-0.5 text-[10px] font-extrabold text-white pointer-events-none"
          style={{ background: 'rgba(107,114,128,.9)' }}
        >
          <span className="w-[6px] h-[6px] rounded-full bg-white" />
          {signalDownLabel}
        </div>
      )}
    </div>
  )
}
