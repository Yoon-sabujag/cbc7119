// 공단 공식 검사이력 (ElevatorInspectsafeService) — annual 탭 상단 카드
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import type { InspectHistoryResponse } from '../utils/inspectHistory'

interface Props {
  certNo: string | null | undefined
  data: InspectHistoryResponse | null | undefined
  isLoading: boolean
  isError: boolean
  isMobile?: boolean
}

// 판정 배지 색 결정 — Tailwind 시맨틱 className 매핑 (Wave 10, v0.1.1 토큰)
function dispClass(disp: string | null): { text: string; bg: string } {
  if (!disp) return { text: 'text-text-tertiary', bg: 'bg-surface-sunken' }
  const s = disp
  const hasBo = s.includes('보완')
  const hasFail = s.includes('불합격')
  const hasCond = s.includes('조건부')
  const hasBoAfterPass = s.includes('보완후합격')
  const hasPass = s.includes('합격')
  if (hasBoAfterPass || hasCond) return { text: 'text-warning', bg: 'bg-warning-bg' }
  if (hasBo || hasFail) return { text: 'text-danger', bg: 'bg-danger-bg' }
  if (hasPass) return { text: 'text-safe', bg: 'bg-safe-bg' }
  return { text: 'text-text-tertiary', bg: 'bg-surface-sunken' }
}

export function KoelsaHistorySection({ certNo, data, isLoading, isError, isMobile }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  // isMobile 분기 className (코드 데이터 권위 — 보존)
  // pad 12/16 → p-3/p-4
  // headerFs 14/16 → text-body-sm/text-[16px]
  // dateFs 13/14 → text-label/text-body-sm
  // subFs 11/12 → text-caption(12px 격상) — 9·10·11px 격상 룰
  // subFs - 1 도 격상 룰에 따라 text-caption(12) 동일 매핑
  const padCls = isMobile ? 'p-3' : 'p-4'
  const headerCls = isMobile ? 'text-body-sm font-bold' : 'text-[16px] font-bold leading-[1.4]'
  const dateCls = isMobile ? 'text-label font-bold' : 'text-body-sm font-bold'
  const subCls = 'text-caption'

  const boxCls = `${padCls} bg-surface-raised border border-border-default rounded-xl`

  // 1) cert_no 없음
  if (!certNo) {
    return (
      <div className={boxCls}>
        <div className={`${subCls} text-text-tertiary text-center py-2`}>
          공단 고유번호 없음 — 관리자 등록 필요
        </div>
      </div>
    )
  }

  // 2) 로딩 (데이터 없음)
  if (isLoading && !data) {
    return (
      <div className={boxCls}>
        <div className="flex flex-col gap-2">
          <div className="h-[18px] bg-surface-sunken rounded-md w-3/5" />
          <div className="h-[14px] bg-surface-sunken rounded-md w-2/5" />
          <div className="h-12 bg-surface-sunken rounded-lg" />
        </div>
      </div>
    )
  }

  // 3) 에러
  if (isError) {
    return (
      <div className={boxCls}>
        <div className={`${subCls} text-text-tertiary text-center py-2`}>
          공단 API 일시 오류 — 잠시 후 다시 시도해주세요
        </div>
      </div>
    )
  }

  // 4) 데이터 없음 (쿼리 비활성/초기)
  if (!data) {
    return null
  }

  // 5) 정상 렌더
  let syncedAgo: string | null = null
  if (data.lastFetchedAt) {
    try {
      syncedAgo = formatDistanceToNow(new Date(data.lastFetchedAt), { addSuffix: true, locale: ko }) + ' 동기화'
    } catch {
      syncedAgo = null
    }
  }

  return (
    <div className={boxCls}>
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className={`${headerCls} text-text-primary`}>
          공단 공식 검사이력
        </span>
        <span className={`${subCls} font-semibold text-text-tertiary`}>
          · 총 {data.historyCount}건
        </span>
        {syncedAgo && (
          <span className={`ml-auto ${subCls} text-text-tertiary`}>
            {syncedAgo}
          </span>
        )}
      </div>

      {/* 리스트 */}
      {data.historyCount === 0 ? (
        <div className={`${subCls} text-text-tertiary text-center py-4`}>
          공단에 등록된 검사이력이 없습니다
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {data.history.map(item => {
            const isExp = expanded === item.failCd
            const badge = dispClass(item.dispWords)
            const hasFails = item.fails.length > 0
            return (
              <div key={item.failCd}
                className="bg-surface-sunken border border-border-default rounded-lg overflow-hidden">
                <div
                  onClick={() => setExpanded(isExp ? null : item.failCd)}
                  className="px-3 py-2.5 cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`${dateCls} text-text-primary`}>
                      {item.inspectDate ?? '-'}
                    </span>
                    <span className={`${subCls} text-text-tertiary`}>
                      · {item.inspectKind ?? '-'}
                    </span>
                    <span className={`ml-auto ${subCls} font-bold ${badge.text} ${badge.bg} px-2 py-0.5 rounded-xl`}>
                      {item.dispWords ?? '-'}
                    </span>
                    <ChevronRight
                      size={14}
                      className={['flex-shrink-0 text-text-tertiary transition-transform duration-150', isExp ? 'rotate-90' : ''].join(' ')}
                    />
                  </div>
                  {(item.validStart || item.validEnd) && (
                    <div className={`${subCls} text-text-secondary`}>
                      유효기간 {item.validStart ?? '-'} ~ {item.validEnd ?? '-'}
                    </div>
                  )}
                  <div className={`${subCls} text-text-tertiary mt-0.5`}>
                    {[item.inspectInstitution, item.companyName].filter(Boolean).join(' · ') || '기관 정보 없음'}
                  </div>
                </div>
                {isExp && hasFails && (
                  <div className="border-t border-border-default px-3 py-2.5">
                    <div className={`${subCls} font-bold text-warning mb-1.5 flex items-center gap-1.5`}>
                      <AlertTriangle size={12} />
                      부적합 {item.fails.length}건
                    </div>
                    <div className="flex flex-col gap-2">
                      {item.fails.map((f, idx) => (
                        <div key={idx} className={`${subCls} text-text-secondary leading-relaxed`}>
                          <div className="font-bold text-text-primary">
                            ▸ {[f.standardArticle, f.standardTitle].filter(Boolean).join(' ') || '조항 정보 없음'}
                          </div>
                          {f.failDesc && (
                            <div className="mt-0.5 pl-3">
                              {f.failDesc}
                              {f.failDescInspector && (
                                <span className="text-text-tertiary"> ({f.failDescInspector})</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {isExp && !hasFails && (
                  <div className={`border-t border-border-default px-3 py-2.5 ${subCls} text-text-tertiary`}>
                    부적합 내역 없음
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
