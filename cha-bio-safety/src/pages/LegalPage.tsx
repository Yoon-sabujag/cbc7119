import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { legalApi } from '../utils/api'
import type { LegalRound, LegalInspectionResult } from '../types'

// ── 날짜 포매터 ──────────────────────────────────────────────────
function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
}

// ── 좌측 강조 색상 ────────────────────────────────────────────────
function accentColor(result: LegalInspectionResult | null): string {
  if (result === 'pass') return 'var(--safe)'
  if (result === 'fail') return 'var(--danger)'
  if (result === 'conditional') return 'var(--warn)'
  return 'var(--bd2)'
}

// ── 결과 배지 ──────────────────────────────────────────────────────
function ResultBadge({ result }: { result: LegalInspectionResult | null }) {
  if (result === 'pass') {
    return (
      <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '2px 8px', background: 'rgba(34,197,94,.13)', color: 'var(--safe)', flexShrink: 0 }}>
        적합
      </span>
    )
  }
  if (result === 'fail') {
    return (
      <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '2px 8px', background: 'rgba(239,68,68,.15)', color: 'var(--danger)', flexShrink: 0 }}>
        부적합
      </span>
    )
  }
  if (result === 'conditional') {
    return (
      <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '2px 8px', background: 'rgba(245,158,11,.15)', color: 'var(--warn)', flexShrink: 0 }}>
        조건부적합
      </span>
    )
  }
  return (
    <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '2px 8px', color: 'var(--t3)', flexShrink: 0 }}>
      결과 미입력
    </span>
  )
}

// ── 스켈레톤 ──────────────────────────────────────────────────────
const SKELETON_STYLE: React.CSSProperties = {
  background: 'var(--bg3)',
  borderRadius: 12,
  height: 72,
  animation: 'blink 2s ease-in-out infinite',
}

// ── 탭 정의 ───────────────────────────────────────────────────────
type TabKey = '전체' | '미조치' | '완료'
const STATUS_TABS: { key: TabKey; label: string }[] = [
  { key: '전체', label: '전체' },
  { key: '미조치', label: '미조치' },
  { key: '완료', label: '완료' },
]

// ── 연도 목록 생성 ────────────────────────────────────────────────
function genYears(): string[] {
  const current = new Date().getFullYear()
  const years: string[] = []
  for (let y = 2024; y <= current; y++) years.push(String(y))
  return years
}

// ── 탭 필터링 ─────────────────────────────────────────────────────
function filterRounds(rounds: LegalRound[], tab: TabKey): LegalRound[] {
  if (tab === '전체') return rounds
  if (tab === '미조치') return rounds.filter(r => r.findingCount > r.resolvedCount)
  if (tab === '완료') return rounds.filter(r => r.findingCount > 0 && r.findingCount === r.resolvedCount)
  return rounds
}

// ── 메인 페이지 ───────────────────────────────────────────────────
export default function LegalPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get('tab') as TabKey) || '전체'
  const setTab = (t: TabKey) => {
    setSearchParams(prev => { prev.set('tab', t); return prev }, { replace: true })
  }

  const [year, setYear] = useState<string>(new Date().getFullYear().toString())
  const years = genYears()

  const { data: rounds, isLoading, isError } = useQuery({
    queryKey: ['legal-rounds', year],
    queryFn: () => legalApi.list(year),
    staleTime: 30_000,
  })

  const filtered = filterRounds(rounds ?? [], tab)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', height: '100%', overflow: 'hidden' }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }
      `}</style>

      {/* 자체 헤더 */}
      <div style={{
        height: 48,
        background: 'rgba(22,27,34,0.97)',
        borderBottom: '1px solid var(--bd)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
      }}>
        <button
          aria-label="뒤로 가기"
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            left: 12,
            width: 36,
            height: 36,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: 'var(--t1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>법적 점검</span>
      </div>

      {/* 필터 바 (sticky) */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--bd)', flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }}>
        {/* Row 1: 상태 탭 */}
        <div style={{ display: 'flex' }}>
          {STATUS_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1,
                height: 44,
                border: 'none',
                background: tab === t.key ? 'var(--bg4)' : 'transparent',
                color: tab === t.key ? 'var(--t1)' : 'var(--t3)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                borderBottom: tab === t.key ? '2px solid var(--acl)' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Row 2: 연도 필터 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
          <select
            value={year}
            onChange={e => setYear(e.target.value)}
            style={{
              background: 'var(--bg3)',
              border: '1px solid var(--bd2)',
              borderRadius: 8,
              padding: '6px 12px',
              color: 'var(--t1)',
              fontSize: 13,
              cursor: 'pointer',
              appearance: 'none',
            }}
          >
            {years.map(y => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
        </div>
      </div>

      {/* 카드 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* 로딩 */}
        {isLoading && (
          <>
            <div style={SKELETON_STYLE} />
            <div style={SKELETON_STYLE} />
            <div style={SKELETON_STYLE} />
          </>
        )}

        {/* 에러 */}
        {isError && !isLoading && (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--t2)', fontSize: 14 }}>
            목록을 불러오지 못했습니다. 화면을 당겨서 다시 시도하세요.
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoading && !isError && filtered.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '60px 16px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>법적 점검 이력 없음</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', textAlign: 'center' }}>소방 일정 페이지에서 종합정밀 또는 작동기능 점검을 등록하면 여기에 표시됩니다.</div>
          </div>
        )}

        {/* 라운드 카드 */}
        {!isLoading && !isError && filtered.map(round => (
          <div
            key={round.id}
            onClick={() => navigate(`/legal/${round.id}`)}
            style={{
              background: 'var(--bg3)',
              border: '1px solid var(--bd)',
              borderLeft: `3px solid ${accentColor(round.result)}`,
              borderRadius: 12,
              padding: 12,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {/* Line 1: 제목 + 결과 배지 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {round.title}
              </span>
              <ResultBadge result={round.result} />
            </div>

            {/* Line 2: 날짜 + 지적 요약 */}
            <div style={{ fontSize: 12, color: 'var(--t2)' }}>
              {fmtDate(round.date)} · 지적 {round.findingCount}건 · 완료 {round.resolvedCount}건
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
