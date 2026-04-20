// 공단 공식 검사이력 (ElevatorInspectsafeService) — annual 탭 상단 카드
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { InspectHistoryResponse } from '../utils/inspectHistory'

interface Props {
  certNo: string | null | undefined
  data: InspectHistoryResponse | null | undefined
  isLoading: boolean
  isError: boolean
  isMobile?: boolean
}

// 판정 배지 색 결정
function dispColor(disp: string | null): string {
  if (!disp) return 'var(--t3)'
  const s = disp
  const hasBo = s.includes('보완')
  const hasFail = s.includes('불합격')
  const hasCond = s.includes('조건부')
  const hasBoAfterPass = s.includes('보완후합격')
  const hasPass = s.includes('합격')
  if (hasBoAfterPass || hasCond) return 'var(--warn)'
  if (hasBo || hasFail) return 'var(--danger)'
  if (hasPass) return 'var(--safe)'
  return 'var(--t3)'
}

export function KoelsaHistorySection({ certNo, data, isLoading, isError, isMobile }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const pad = isMobile ? 12 : 16
  const headerFs = isMobile ? 14 : 16
  const dateFs = isMobile ? 13 : 14
  const subFs = isMobile ? 11 : 12

  const boxStyle: React.CSSProperties = {
    border: '1px solid var(--bd)',
    borderRadius: 12,
    padding: pad,
    background: 'var(--bg2)',
  }

  // 1) cert_no 없음
  if (!certNo) {
    return (
      <div style={boxStyle}>
        <div style={{ fontSize: subFs, color: 'var(--t3)', textAlign: 'center', padding: '8px 0' }}>
          공단 고유번호 없음 — 관리자 등록 필요
        </div>
      </div>
    )
  }

  // 2) 로딩 (데이터 없음)
  if (isLoading && !data) {
    return (
      <div style={boxStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ height: 18, background: 'var(--bg3)', borderRadius: 6, width: '60%' }} />
          <div style={{ height: 14, background: 'var(--bg3)', borderRadius: 6, width: '40%' }} />
          <div style={{ height: 48, background: 'var(--bg3)', borderRadius: 8 }} />
        </div>
      </div>
    )
  }

  // 3) 에러
  if (isError) {
    return (
      <div style={boxStyle}>
        <div style={{ fontSize: subFs, color: 'var(--t3)', textAlign: 'center', padding: '8px 0' }}>
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
    <div style={boxStyle}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: headerFs, fontWeight: 700, color: 'var(--t1)' }}>
          공단 공식 검사이력
        </span>
        <span style={{ fontSize: subFs, fontWeight: 600, color: 'var(--t3)' }}>
          · 총 {data.historyCount}건
        </span>
        {syncedAgo && (
          <span style={{ marginLeft: 'auto', fontSize: subFs - 1, color: 'var(--t3)' }}>
            {syncedAgo}
          </span>
        )}
      </div>

      {/* 리스트 */}
      {data.historyCount === 0 ? (
        <div style={{ fontSize: subFs, color: 'var(--t3)', textAlign: 'center', padding: '16px 0' }}>
          공단에 등록된 검사이력이 없습니다
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.history.map(item => {
            const isExp = expanded === item.failCd
            const badge = dispColor(item.dispWords)
            const hasFails = item.fails.length > 0
            return (
              <div key={item.failCd}
                style={{
                  background: 'var(--bg3)',
                  border: '1px solid var(--bd)',
                  borderRadius: 10,
                  overflow: 'hidden',
                }}>
                <div
                  onClick={() => setExpanded(isExp ? null : item.failCd)}
                  style={{ padding: '10px 12px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: dateFs, fontWeight: 700, color: 'var(--t1)' }}>
                      {item.inspectDate ?? '-'}
                    </span>
                    <span style={{ fontSize: subFs - 1, color: 'var(--t3)' }}>
                      · {item.inspectKind ?? '-'}
                    </span>
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: subFs - 1,
                      fontWeight: 700,
                      color: badge,
                      background: `${badge}22`,
                      padding: '2px 8px',
                      borderRadius: 12,
                    }}>
                      {item.dispWords ?? '-'}
                    </span>
                  </div>
                  {(item.validStart || item.validEnd) && (
                    <div style={{ fontSize: subFs, color: 'var(--t2)' }}>
                      유효기간 {item.validStart ?? '-'} ~ {item.validEnd ?? '-'}
                    </div>
                  )}
                  <div style={{ fontSize: subFs - 1, color: 'var(--t3)', marginTop: 2 }}>
                    {[item.inspectInstitution, item.companyName].filter(Boolean).join(' · ') || '기관 정보 없음'}
                  </div>
                </div>
                {isExp && hasFails && (
                  <div style={{ borderTop: '1px solid var(--bd)', padding: '10px 12px' }}>
                    <div style={{ fontSize: subFs, fontWeight: 700, color: 'var(--warn)', marginBottom: 6 }}>
                      부적합 {item.fails.length}건
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {item.fails.map((f, idx) => (
                        <div key={idx} style={{ fontSize: subFs, color: 'var(--t2)', lineHeight: 1.5 }}>
                          <div style={{ fontWeight: 700, color: 'var(--t1)' }}>
                            ▸ {[f.standardArticle, f.standardTitle].filter(Boolean).join(' ') || '조항 정보 없음'}
                          </div>
                          {f.failDesc && (
                            <div style={{ marginTop: 2, paddingLeft: 12 }}>
                              {f.failDesc}
                              {f.failDescInspector && (
                                <span style={{ color: 'var(--t3)' }}> ({f.failDescInspector})</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {isExp && !hasFails && (
                  <div style={{ borderTop: '1px solid var(--bd)', padding: '10px 12px', fontSize: subFs, color: 'var(--t3)' }}>
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
