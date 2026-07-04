import { useEffect, useState } from 'react'
import { panelApi } from '../../utils/api'

// Phase 25: 공용 라이브 프레임 이미지.
// - snapshotKey 우선, 없으면 latestFrameUrl(frameUpdatedAt) 캐시버스트.
// - ?t= 값이 frameUpdatedAt 에서 파생 -> 같은 프레임엔 URL 안정 -> 리마운트/깜빡임 없음 (risk 9).
// - HTTP 204 / 로드 실패 -> 회색 16:9 placeholder 로 degrade, 절대 크래시 X.
// - LIVE 배지 / 상태 텍스트는 여기서 렌더 X — consumer 가 Surface 별로 오버레이.

interface LivePanelImageProps {
  frameUpdatedAt?: string | number | null
  snapshotKey?: string | null
  alt?: string
  className?: string
  imgClassName?: string
  aspectClass?: string   // 프레임 비율/높이 (기본 16:9 aspect-video). 고정높이(h-[..]) 로 오버라이드.
  objectClass?: string   // object-fit (기본 cover). object-fill = 짜부(비율 무시 박스 채움).
  onClick?: () => void
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
}: LivePanelImageProps) {
  const src = snapshotKey
    ? panelApi.snapshotUrl(snapshotKey)
    : panelApi.latestFrameUrl(frameUpdatedAt ?? 0)

  const [errored, setErrored] = useState(false)
  useEffect(() => { setErrored(false) }, [src])

  return (
    <div
      className={`relative w-full ${aspectClass} bg-black overflow-hidden ${className}`}
      onClick={onClick}
    >
      {!errored ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setErrored(true)}
          className={`w-full h-full ${objectClass} ${imgClassName}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-sunken text-text-tertiary text-caption">
          수신반 화면 로딩 · 미연결
        </div>
      )}
    </div>
  )
}
