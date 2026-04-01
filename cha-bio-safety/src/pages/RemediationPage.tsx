import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { remediationApi } from '../utils/api'

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
}

const ZONE_LABEL: Record<string, string> = { office: '사무동', research: '연구동', common: '공용' }
const zoneLabel = (zone: string) => ZONE_LABEL[zone] ?? zone

const SKELETON_STYLE: React.CSSProperties = {
  background: 'var(--bg3)',
  borderRadius: 12,
  height: 88,
  animation: 'blink 2s ease-in-out infinite',
}

export default function RemediationPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const statusTab = (searchParams.get('tab') as 'all' | 'open' | 'resolved') || 'all'
  const setStatusTab = (tab: 'all' | 'open' | 'resolved') => {
    setSearchParams(prev => { prev.set('tab', tab); return prev }, { replace: true })
  }
  const [categoryFilter, setCategoryFilter] = useState('')
  const [days, setDays] = useState(30)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['remediation', statusTab, categoryFilter, days],
    queryFn: () => remediationApi.list({
      status: statusTab === 'all' ? undefined : statusTab,
      category: categoryFilter || undefined,
      days,
    }),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })

  const records = data?.records ?? []
  const categories = data?.categories ?? []

  const STATUS_TABS: { key: 'all' | 'open' | 'resolved'; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'open', label: '미조치' },
    { key: 'resolved', label: '완료' },
  ]

  const PERIOD_BUTTONS: { value: number; label: string }[] = [
    { value: 7, label: '7일' },
    { value: 30, label: '30일' },
    { value: 90, label: '90일' },
    { value: 0, label: '전체' },
  ]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', height: '100%', overflow: 'hidden' }}>
      <style>{`@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }`}</style>

      {/* 필터 바 */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--bd)', flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }}>
        {/* Row 1: 상태 탭 */}
        <div style={{ display: 'flex' }}>
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusTab(tab.key)}
              style={{
                flex: 1,
                height: 44,
                border: 'none',
                background: statusTab === tab.key ? 'var(--bg4)' : 'transparent',
                color: statusTab === tab.key ? 'var(--t1)' : 'var(--t3)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                borderBottom: statusTab === tab.key ? '2px solid var(--acl)' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Row 2: 카테고리 드롭다운 + 기간 버튼 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{
              flex: 1,
              height: 36,
              background: 'var(--bg3)',
              border: '1px solid var(--bd2)',
              borderRadius: 8,
              color: 'var(--t1)',
              fontSize: 12,
              padding: '0 8px',
              cursor: 'pointer',
              appearance: 'none',
            }}
          >
            <option value="">전체 카테고리</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: 4 }}>
            {PERIOD_BUTTONS.map(btn => (
              <button
                key={btn.value}
                onClick={() => setDays(btn.value)}
                style={{
                  height: 32,
                  padding: '0 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: days === btn.value ? 'var(--bg4)' : 'var(--bg2)',
                  color: days === btn.value ? 'var(--t1)' : 'var(--t3)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 카드 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isLoading && (
          <>
            <div style={SKELETON_STYLE} />
            <div style={SKELETON_STYLE} />
            <div style={SKELETON_STYLE} />
          </>
        )}

        {isError && !isLoading && (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--t2)', fontSize: 14 }}>
            목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.
          </div>
        )}

        {!isLoading && !isError && records.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '60px 16px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>조치 항목 없음</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', textAlign: 'center' }}>선택한 조건에 해당하는 불량/주의 항목이 없습니다.</div>
          </div>
        )}

        {!isLoading && !isError && records.map(record => (
          <div
            key={record.id}
            onClick={() => navigate('/remediation/' + record.id)}
            style={{
              background: 'var(--bg3)',
              border: '1px solid var(--bd)',
              borderRadius: 12,
              padding: 12,
              cursor: 'pointer',
              display: 'flex',
              gap: 10,
              borderLeft: record.result === 'bad'
                ? '2px solid var(--danger)'
                : '2px solid var(--warn)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Line 1: 카테고리 + 결과 배지 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {record.category}
                </span>
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 5,
                  flexShrink: 0,
                  background: record.result === 'bad' ? 'rgba(239,68,68,.13)' : 'rgba(245,158,11,.13)',
                  color: record.result === 'bad' ? 'var(--danger)' : 'var(--warn)',
                }}>
                  {record.result === 'bad' ? '불량' : '주의'}
                </span>
              </div>

              {/* Line 2: 위치 (동→층) + 개소명 */}
              <div style={{ fontSize: 12, color: 'var(--t2)' }}>
                {zoneLabel(record.zone)} {record.floor}{record.location ? ` · ${record.location}` : ''}
              </div>

              {/* Line 3: 메모 미리보기 */}
              <div style={{
                fontSize: 12,
                color: record.memo ? 'var(--t2)' : 'var(--t3)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {record.memo ? record.memo.split('\n')[0] : '메모 없음'}
              </div>

              {/* Line 4: 날짜 + 상태 칩 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--t3)' }}>
                  {fmtDate(record.checkedAt)}
                </span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 5,
                  flexShrink: 0,
                  background: record.status === 'open' ? 'rgba(249,115,22,.15)' : 'rgba(34,197,94,.13)',
                  color: record.status === 'open' ? 'var(--danger)' : 'var(--safe)',
                }}>
                  {record.status === 'open' ? '미조치' : '완료'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
