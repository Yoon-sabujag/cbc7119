import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { remediationApi } from '../utils/api'
import { useIsDesktop } from '../hooks/useIsDesktop'
import toast from 'react-hot-toast'
import { Inbox, AlertCircle, Download, Camera } from 'lucide-react'

import { fmtKstDate as fmtDate, fmtKstDateTime as fmtDateTime } from '../utils/datetime'

const ZONE_LABEL: Record<string, string> = { office: '사무동', research: '연구동', basement: '지하', common: '지하' }
const zoneLabel = (zone: string) => ZONE_LABEL[zone] ?? zone

// 기록 위치 표시 — 유도등이면 locationDetail/markerLabel 우선
function recordPlace(rec: any): string {
  const zk = zoneLabel(rec.zone ?? '')
  const spot = rec.locationDetail || rec.markerLabel
  if (rec.category === '유도등' && spot) return `${zk} ${rec.floor} ${spot}`
  return `${zk} ${rec.floor}${rec.location ? ' · ' + rec.location : ''}`
}

// ── 사진 다운로드 헬퍼 ────────────────────────────────────
async function downloadPhoto(photoKey: string, filename: string) {
  try {
    const res = await fetch('/api/uploads/' + photoKey)
    if (!res.ok) throw new Error('fetch failed')
    const blob = await res.blob()
    const ext = blob.type.split('/')[1] || 'jpg'
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.${ext}`
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch {
    toast.error('사진 다운로드 실패')
  }
}

async function fetchPhotoAsBase64(photoKey: string): Promise<string | null> {
  try {
    const res = await fetch('/api/uploads/' + photoKey)
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch { return null }
}

// 보고서 HTML 다운로드
async function downloadReport(record: any) {
  try {
    const beforeB64 = record.photoKey ? await fetchPhotoAsBase64(record.photoKey) : null
    const afterB64  = record.resolutionPhotoKey ? await fetchPhotoAsBase64(record.resolutionPhotoKey) : null
    const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>조치 보고서 - ${record.category}</title>
<style>
body{font-family:'Noto Sans KR',sans-serif;max-width:800px;margin:24px auto;padding:0 20px;color:#222}
h1{font-size:20px;border-bottom:2px solid #333;padding-bottom:8px}
table{width:100%;border-collapse:collapse;margin:12px 0}
th,td{border:1px solid #999;padding:8px 10px;font-size:13px;text-align:left;vertical-align:top}
th{background:#f0f0f0;width:120px}
.photos{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}
.photo{border:1px solid #999;padding:8px;background:#fafafa}
.photo h3{margin:0 0 8px 0;font-size:13px}
.photo img{width:100%;height:auto;display:block}
.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:700}
.bad{background:#fee;color:#c33}.cau{background:#fef3c7;color:#b8740b}
.open{background:#fed7aa;color:#c2410c}.done{background:#d1fae5;color:#15803d}
</style></head><body>
<h1>점검 조치 보고서</h1>
<table>
  <tr><th>카테고리</th><td>${record.category}</td></tr>
  <tr><th>위치</th><td>${recordPlace(record)}</td></tr>
  <tr><th>점검일시</th><td>${fmtDateTime(record.checkedAt)}</td></tr>
  <tr><th>점검자</th><td>${record.staffName ?? '-'}</td></tr>
  <tr><th>판정결과</th><td><span class="badge ${record.result === 'bad' ? 'bad' : 'cau'}">${record.result === 'bad' ? '불량' : '주의'}</span></td></tr>
  <tr><th>상태</th><td><span class="badge ${record.status === 'open' ? 'open' : 'done'}">${record.status === 'open' ? '미조치' : '조치완료'}</span></td></tr>
  <tr><th>점검 메모</th><td style="white-space:pre-wrap">${record.memo ?? '메모 없음'}</td></tr>
  ${record.status === 'resolved' ? `
  <tr><th>조치일시</th><td>${fmtDateTime(record.resolvedAt)}</td></tr>
  <tr><th>조치자</th><td>${record.resolvedBy ?? '-'}</td></tr>
  <tr><th>조치 내용</th><td style="white-space:pre-wrap">${record.resolutionMemo ?? '-'}</td></tr>
  <tr><th>소모 자재</th><td style="white-space:pre-wrap">${record.materialsUsed ?? '-'}</td></tr>` : ''}
</table>
<div class="photos">
  ${beforeB64 ? `<div class="photo"><h3>📷 조치 전 (불량)</h3><img src="${beforeB64}"/></div>` : ''}
  ${afterB64 ? `<div class="photo"><h3>📷 조치 후</h3><img src="${afterB64}"/></div>` : ''}
</div>
</body></html>`
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const dateStr = (record.checkedAt ?? '').slice(0, 10).replace(/-/g, '')
    a.download = `조치보고서_${record.category}_${dateStr}.html`
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.success('보고서 다운로드 완료')
  } catch {
    toast.error('보고서 생성 실패')
  }
}

// sketch verbatim — 스켈레톤 (rem-skeleton): surface-sunken bg + blink keyframe
const SKELETON_STYLE: React.CSSProperties = {
  background: 'var(--surface-sunken)',
  borderRadius: 12,
  height: 88,
  animation: 'blink 2s ease-in-out infinite',
}

export default function RemediationPage() {
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const [searchParams, setSearchParams] = useSearchParams()
  const statusTab = (searchParams.get('tab') as 'all' | 'open' | 'resolved') || 'all'
  const setStatusTab = (tab: 'all' | 'open' | 'resolved') => {
    setSearchParams(prev => { prev.set('tab', tab); return prev }, { replace: true })
  }
  const [categoryFilter, setCategoryFilter] = useState('')
  const [days, setDays] = useState(30)
  const [selectedId, setSelectedId] = useState<string | null>(null)

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

  // 데스크톱: 선택된 항목 상세 조회
  const effectiveSelectedId = selectedId ?? (isDesktop && records.length > 0 ? records[0].id : null)
  const { data: selectedDetail } = useQuery({
    queryKey: ['remediation-detail', effectiveSelectedId],
    queryFn: () => remediationApi.get(effectiveSelectedId!),
    enabled: !!effectiveSelectedId && isDesktop,
    staleTime: 30_000,
  })

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

  // 카드 아이템 렌더 (모바일/데스크톱 공용)
  // sketch .rem-card: bg-surface-sunken border-border-default rounded-md p-3 flex gap-[10px]
  // sketch .rem-card.is-selected: border-2 border-accent
  const renderCard = (record: any) => {
    const isSelected = isDesktop && effectiveSelectedId === record.id
    return (
      <div
        key={record.id}
        onClick={() => isDesktop ? setSelectedId(record.id) : navigate('/remediation/' + record.id)}
        className={[
          'flex gap-[10px] cursor-pointer rounded-md p-3 bg-surface-sunken',
          isSelected
            ? 'border-2 border-accent'
            : 'border border-border-default',
        ].join(' ')}
      >
        {/* 좌측 색바 — sketch .rem-card-bar.fire/.safe: status 기준 (status=open→fire-bar, resolved→safe-bar) */}
        <div
          className="w-1 rounded-[2px] shrink-0"
          style={{
            background: record.status === 'open' ? 'var(--status-fire-bar)' : 'var(--status-safe-bar)',
            alignSelf: 'stretch',
          }}
        />
        {/* 우측 컨텐츠 */}
        <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
          {/* Line 1: 카테고리 + 결과 배지 */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-body-sm font-bold text-text-primary flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
              {record.category}
            </span>
            {/* sketch .rem-badge.danger / .rem-badge.warning — leading-none 필수 (feedback_text_caption_leading_none) */}
            <span
              className={[
                'text-caption font-bold px-1.5 py-0.5 rounded-[5px] leading-none whitespace-nowrap shrink-0 inline-flex items-center',
                record.result === 'bad'
                  ? 'bg-danger-bg text-danger'
                  : 'bg-warning-bg text-warning',
              ].join(' ')}
            >
              {record.result === 'bad' ? '불량' : '주의'}
            </span>
          </div>
          {/* Line 2: 위치 */}
          <div className="text-caption text-text-secondary">
            {recordPlace(record)}
          </div>
          {/* Line 3: 메모 미리보기 */}
          <div
            className={[
              'text-caption overflow-hidden text-ellipsis whitespace-nowrap',
              record.memo ? 'text-text-secondary' : 'text-text-tertiary',
            ].join(' ')}
          >
            {record.memo ? record.memo.split('\n')[0] : '메모 없음'}
          </div>
          {/* Line 4: 날짜 + 상태 배지 */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-caption text-text-tertiary">
              {fmtDate(record.checkedAt)}
            </span>
            {/* sketch .rem-badge.fire / .rem-badge.safe — leading-none 필수 (feedback_text_caption_leading_none) */}
            <span
              className={[
                'text-caption font-bold px-1.5 py-0.5 rounded-[5px] leading-none whitespace-nowrap shrink-0 inline-flex items-center',
                record.status === 'open'
                  ? 'bg-fire-bg text-fire'
                  : 'bg-safe-bg text-safe',
              ].join(' ')}
            >
              {record.status === 'open' ? '미조치' : '완료'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // 필터 바 (모바일/데스크톱 공용)
  // sketch .rem-filter-bar: bg-surface-raised border-b border-border-default shrink-0
  const filterBar = (
    <div
      className="shrink-0 border-b border-border-default"
      style={{ background: 'var(--surface-raised)' }}
    >
      {/* 탭 — sketch .rem-tabs: flex h-[44px] border-b border-border-default */}
      <div className="flex border-b border-border-default">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusTab(tab.key)}
            style={{
              flex: 1,
              height: 44,
              border: 'none',
              // sketch .rem-tab: font-size 13px font-weight 600 (sketch L338-L339)
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'color .13s',
              // sketch .rem-tab.is-active: bg surface-active color text-primary border-bottom 2px accent
              background: statusTab === tab.key ? 'var(--surface-active)' : 'transparent',
              color: statusTab === tab.key ? 'var(--text-primary)' : 'var(--text-tertiary)',
              borderBottom: statusTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* 필터 로우 — sketch .rem-filter-row: flex items-center gap-2 px-4 py-2 */}
      <div className="flex items-center gap-2 px-4 py-2">
        {/* sketch .rem-cat-select: h-9 bg-surface-sunken border border-border-strong rounded-sm text-text-primary text-caption px-2 flex-1 min-w-0 */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          style={{
            flex: 1,
            height: 36,
            background: 'var(--surface-sunken)',
            border: '1px solid var(--border-strong)',
            borderRadius: 8,
            color: 'var(--text-primary)',
            fontSize: 12,
            padding: '0 8px',
            cursor: 'pointer',
            minWidth: 0,
          }}
        >
          <option value="">전체 카테고리</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <div className="flex gap-1">
          {PERIOD_BUTTONS.map(btn => (
            <button
              key={btn.value}
              onClick={() => setDays(btn.value)}
              style={{
                // sketch .rem-period-btn: h-8 px-3 rounded-sm text-caption font-bold border-none cursor-pointer whitespace-nowrap
                height: 32,
                padding: '0 12px',
                borderRadius: 8,
                border: 'none',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                // sketch active: bg surface-active color text-primary / inactive: bg transparent color tertiary
                background: days === btn.value ? 'var(--surface-active)' : 'transparent',
                color: days === btn.value ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // ── 데스크톱: 좌=목록 / 우=상세 보고서 ─────────────────
  if (isDesktop) {
    const detail: any = selectedDetail
    return (
      // sketch: 외부 컨테이너 = flex-1 flex flex-col bg-surface-page min-h-0 overflow-hidden
      <div className="flex-1 flex flex-col bg-surface-page min-h-0 overflow-hidden">
        <style>{`@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }`}</style>

        {/* sketch: 내부 split = flex-1 flex overflow-hidden */}
        <div className="flex-1 flex overflow-hidden">
          {/* 좌측 50% — sketch L964: width:50% border-right flex flex-col h-full */}
          {/* w-1/2 = width:50% — sketch verbatim과 동일하므로 Tailwind 클래스 사용 */}
          <div className="w-1/2 shrink-0 min-w-0 border-r border-border-default flex flex-col h-full">
            {filterBar}
            {/* sketch .rem-list: flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-2 + 스크롤바 숨김 */}
            <div
              className="flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-2"
              style={{ scrollbarWidth: 'none' } as React.CSSProperties}
            >
              {isLoading && (<><div style={SKELETON_STYLE} /><div style={SKELETON_STYLE} /><div style={SKELETON_STYLE} /></>)}
              {isError && !isLoading && (
                // sketch .rem-error: text-center py-10 px-4 flex flex-col items-center gap-2
                <div className="text-center py-10 px-4 flex flex-col items-center gap-2">
                  {/* sketch L940: AlertCircle 28px color status-danger-bar margin-bottom 8px */}
                  <AlertCircle size={28} className="text-danger-bar mb-2 shrink-0" />
                  <span className="text-body-sm text-text-secondary">목록을 불러오지 못했습니다.</span>
                </div>
              )}
              {!isLoading && !isError && records.length === 0 && (
                // sketch .rem-empty: flex-1 flex flex-col items-center justify-center gap-2 py-[60px] px-4
                <div className="flex-1 flex flex-col items-center justify-center gap-2 py-[60px] px-4">
                  {/* sketch L850: Inbox 36px color text-tertiary */}
                  <Inbox size={36} className="text-text-tertiary shrink-0" />
                  <div className="text-body font-bold text-text-primary">조치 항목 없음</div>
                  <div className="text-caption text-text-secondary text-center">선택한 조건에 해당하는 불량/주의 항목이 없습니다.</div>
                </div>
              )}
              {!isLoading && !isError && records.map(record => renderCard(record))}
            </div>
          </div>

          {/* 우측 50% — sketch L1054: width:50% height:100% overflow:hidden (안의 detail-pane이 overflow-y:auto) */}
          <div className="w-1/2 shrink-0 min-w-0 h-full overflow-hidden">
            {!detail ? (
              // sketch .rem-detail-empty: h-full flex items-center justify-center color tertiary font-size 13px
              <div
                className="h-full flex items-center justify-center text-text-tertiary"
                style={{ fontSize: 13 }}
              >
                좌측에서 항목을 선택하세요
              </div>
            ) : (
              // sketch .rem-detail-pane: overflow-y-auto px-7 py-5 h-full box-border + 스크롤바 숨김
              <div
                className="overflow-y-auto h-full"
                style={{ padding: '20px 28px', boxSizing: 'border-box', scrollbarWidth: 'none' } as React.CSSProperties}
              >
                {/* 헤더 — sketch .rem-detail-hd: flex items-start gap-3 mb-4 */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-1">
                    {/* sketch .rem-detail-title: font-size 18px font-weight 700 color text-primary */}
                    <div className="text-title font-bold text-text-primary">{detail.category}</div>
                    {/* sketch .rem-detail-sub: font-size 12px color text-tertiary margin-top 2px */}
                    <div className="text-caption text-text-tertiary mt-0.5">{recordPlace(detail)}</div>
                  </div>
                  {/* sketch .rem-download-btn: 단색 var(--accent) — 그라디언트 폐기 (sketch L515-L530) */}
                  <button
                    onClick={() => downloadReport(detail)}
                    className="px-3.5 py-2 rounded-sm bg-accent text-on-accent text-caption font-bold inline-flex items-center gap-1 shrink-0 whitespace-nowrap cursor-pointer border-0"
                  >
                    <Download size={14} />
                    보고서 다운로드
                  </button>
                </div>

                {/* 보고서 테이블 — sketch .rem-kv-table: w-full border-collapse mb-5 */}
                {/* 인라인 style 화이트리스트 — sketch verbatim, Tailwind 매핑 시 가독성 손상 */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
                  <tbody>
                    {[
                      ['카테고리', detail.category],
                      ['위치', recordPlace(detail)],
                      ['점검일시', fmtDateTime(detail.checkedAt)],
                      ['점검자', detail.staffName ?? '-'],
                      ['판정결과', null],
                      ['상태', null],
                      ['점검 메모', detail.memo ?? '메모 없음'],
                    ].map(([label, value], i) => (
                      <tr key={i}>
                        {/* sketch th: width 110 padding 8/12 bg surface-sunken border border-default font 12/700 color secondary */}
                        <th style={{ width: 110, padding: '8px 12px', background: 'var(--surface-sunken)', border: '1px solid var(--border-default)', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'left', verticalAlign: 'top', lineHeight: 1.5 }}>{label}</th>
                        {/* sketch td: padding 8/12 border border-default font 13 color primary pre-wrap */}
                        <td style={{ padding: '8px 12px', border: '1px solid var(--border-default)', fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', verticalAlign: 'top', lineHeight: 1.6 }}>
                          {label === '판정결과' ? (
                            // sketch .rem-badge.danger / .rem-badge.warning — leading-none 필수
                            <span
                              className={[
                                'text-caption font-bold px-1.5 py-0.5 rounded-[5px] leading-none whitespace-nowrap inline-flex items-center',
                                detail.result === 'bad' ? 'bg-danger-bg text-danger' : 'bg-warning-bg text-warning',
                              ].join(' ')}
                            >
                              {detail.result === 'bad' ? '불량' : '주의'}
                            </span>
                          ) : label === '상태' ? (
                            // sketch .rem-badge.fire / .rem-badge.safe — leading-none 필수
                            <span
                              className={[
                                'text-caption font-bold px-1.5 py-0.5 rounded-[5px] leading-none whitespace-nowrap inline-flex items-center',
                                detail.status === 'open' ? 'bg-fire-bg text-fire' : 'bg-safe-bg text-safe',
                              ].join(' ')}
                            >
                              {detail.status === 'open' ? '미조치' : '조치완료'}
                            </span>
                          ) : value as string}
                        </td>
                      </tr>
                    ))}
                    {detail.status === 'resolved' && (
                      <>
                        <tr>
                          <th style={{ width: 110, padding: '8px 12px', background: 'var(--surface-sunken)', border: '1px solid var(--border-default)', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'left', verticalAlign: 'top', lineHeight: 1.5 }}>조치일시</th>
                          <td style={{ padding: '8px 12px', border: '1px solid var(--border-default)', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{fmtDateTime(detail.resolvedAt)}</td>
                        </tr>
                        <tr>
                          <th style={{ width: 110, padding: '8px 12px', background: 'var(--surface-sunken)', border: '1px solid var(--border-default)', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'left', verticalAlign: 'top', lineHeight: 1.5 }}>조치자</th>
                          <td style={{ padding: '8px 12px', border: '1px solid var(--border-default)', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{detail.resolvedBy ?? '-'}</td>
                        </tr>
                        <tr>
                          <th style={{ width: 110, padding: '8px 12px', background: 'var(--surface-sunken)', border: '1px solid var(--border-default)', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'left', verticalAlign: 'top', lineHeight: 1.5 }}>조치 내용</th>
                          <td style={{ padding: '8px 12px', border: '1px solid var(--border-default)', fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{detail.resolutionMemo ?? '-'}</td>
                        </tr>
                        <tr>
                          <th style={{ width: 110, padding: '8px 12px', background: 'var(--surface-sunken)', border: '1px solid var(--border-default)', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'left', verticalAlign: 'top', lineHeight: 1.5 }}>소모 자재</th>
                          <td style={{ padding: '8px 12px', border: '1px solid var(--border-default)', fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{detail.materialsUsed ?? '-'}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>

                {/* 사진 영역 — sketch .rem-photo-grid: grid grid-cols-2 gap-4 */}
                <div className="grid grid-cols-2 gap-4">
                  {/* 조치 전 (불량 사진) — sketch .rem-photo-card: border border-border-default rounded-[10px] p-3 bg-surface-raised */}
                  <div className="border border-border-default rounded-[10px] p-3 bg-surface-raised">
                    {/* sketch .rem-photo-hd: flex items-center justify-between mb-2 */}
                    <div className="flex items-center justify-between mb-2">
                      {/* sketch .rem-photo-label: text-caption font-bold text-text-secondary inline-flex items-center gap-1 + lucide Camera 12px */}
                      <span className="text-caption font-bold text-text-secondary inline-flex items-center gap-1">
                        <Camera size={12} />
                        조치 전 (불량)
                      </span>
                      {detail.photoKey && (
                        // sketch .rem-photo-dl-btn: px-2.5 py-1 rounded-md border border-border-strong bg-surface-sunken text-text-secondary text-caption font-bold inline-flex items-center gap-[3px] leading-none
                        // font-size: 12px (노안 룰 — sketch L593 주석: 11px → 12px 상향)
                        <button
                          onClick={() => downloadPhoto(detail.photoKey, `조치전_${detail.category}_${(detail.checkedAt ?? '').slice(0,10).replace(/-/g,'')}`)}
                          className="px-2.5 py-1 rounded-md border border-border-strong bg-surface-sunken text-text-secondary text-caption font-bold inline-flex items-center gap-[3px] leading-none cursor-pointer"
                        >
                          <Download size={12} />
                          다운로드
                        </button>
                      )}
                    </div>
                    {detail.photoKey ? (
                      // sketch .rem-photo-img: w-full max-h-[280px] object-contain rounded-md bg-black block
                      <img
                        src={'/api/uploads/' + detail.photoKey}
                        alt="조치 전"
                        className="w-full max-h-[280px] object-contain rounded-md bg-black block"
                      />
                    ) : (
                      // sketch .rem-photo-empty: h-[180px] flex items-center justify-center text-text-tertiary text-caption bg-surface-sunken rounded-md
                      <div className="h-[180px] flex items-center justify-center text-text-tertiary text-caption bg-surface-sunken rounded-md">
                        사진 없음
                      </div>
                    )}
                  </div>
                  {/* 조치 후 사진 */}
                  <div className="border border-border-default rounded-[10px] p-3 bg-surface-raised">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-caption font-bold text-text-secondary inline-flex items-center gap-1">
                        <Camera size={12} />
                        조치 후
                      </span>
                      {detail.resolutionPhotoKey && (
                        <button
                          onClick={() => downloadPhoto(detail.resolutionPhotoKey, `조치후_${detail.category}_${(detail.resolvedAt ?? '').slice(0,10).replace(/-/g,'')}`)}
                          className="px-2.5 py-1 rounded-md border border-border-strong bg-surface-sunken text-text-secondary text-caption font-bold inline-flex items-center gap-[3px] leading-none cursor-pointer"
                        >
                          <Download size={12} />
                          다운로드
                        </button>
                      )}
                    </div>
                    {detail.resolutionPhotoKey ? (
                      <img
                        src={'/api/uploads/' + detail.resolutionPhotoKey}
                        alt="조치 후"
                        className="w-full max-h-[280px] object-contain rounded-md bg-black block"
                      />
                    ) : (
                      <div className="h-[180px] flex items-center justify-center text-text-tertiary text-caption bg-surface-sunken rounded-md">
                        {detail.status === 'open' ? '아직 조치 전' : '사진 없음'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── 모바일 ─────────────────────────────────────────────────
  return (
    // sketch: 모바일 컨테이너 = flex-1 flex flex-col bg-surface-page min-h-0 overflow-hidden
    <div className="flex-1 flex flex-col bg-surface-page min-h-0 overflow-hidden">
      <style>{`@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }`}</style>

      {/* 필터 바 — sketch .rem-filter-bar: position sticky top-0 z-10 */}
      <div
        className="shrink-0 border-b border-border-default"
        style={{ background: 'var(--surface-raised)', position: 'sticky', top: 0, zIndex: 10 }}
      >
        {/* 상태 탭 — sketch .rem-tabs: flex h-[44px] border-b border-border-default */}
        <div className="flex border-b border-border-default">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusTab(tab.key)}
              style={{
                flex: 1,
                height: 44,
                border: 'none',
                // sketch .rem-tab: font-size 13px font-weight 600 (L338-L339)
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'color .13s',
                background: statusTab === tab.key ? 'var(--surface-active)' : 'transparent',
                color: statusTab === tab.key ? 'var(--text-primary)' : 'var(--text-tertiary)',
                borderBottom: statusTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 필터 로우 — sketch .rem-filter-row: flex items-center gap-2 px-4 py-2 */}
        <div className="flex items-center gap-2 px-4 py-2">
          {/* sketch .rem-cat-select: h-9 bg-surface-sunken border border-border-strong rounded-sm text-caption px-2 flex-1 min-w-0 */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{
              flex: 1,
              height: 36,
              background: 'var(--surface-sunken)',
              border: '1px solid var(--border-strong)',
              borderRadius: 8,
              color: 'var(--text-primary)',
              fontSize: 12,
              padding: '0 8px',
              cursor: 'pointer',
              minWidth: 0,
            }}
          >
            <option value="">전체 카테고리</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className="flex gap-1">
            {PERIOD_BUTTONS.map(btn => (
              <button
                key={btn.value}
                onClick={() => setDays(btn.value)}
                style={{
                  height: 32,
                  padding: '0 12px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  background: days === btn.value ? 'var(--surface-active)' : 'transparent',
                  color: days === btn.value ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  transition: 'all 0.15s',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 카드 목록 — sketch .rem-list: flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-2 + 스크롤바 숨김 */}
      <div
        className="flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-2"
        style={{ scrollbarWidth: 'none' } as React.CSSProperties}
      >
        {isLoading && (
          <>
            <div style={SKELETON_STYLE} />
            <div style={SKELETON_STYLE} />
            <div style={SKELETON_STYLE} />
          </>
        )}

        {isError && !isLoading && (
          // sketch .rem-error: text-center py-10 px-4 flex flex-col items-center gap-2
          <div className="text-center py-10 px-4 flex flex-col items-center gap-2">
            {/* sketch L940: AlertCircle 28px color status-danger-bar margin-bottom 8px */}
            <AlertCircle size={28} className="text-danger-bar mb-2 shrink-0" />
            <span className="text-body-sm text-text-secondary">목록을 불러오지 못했습니다.</span>
            <span className="text-caption text-text-tertiary">화면을 당겨서 다시 시도하세요</span>
          </div>
        )}

        {!isLoading && !isError && records.length === 0 && (
          // sketch .rem-empty: flex-1 flex flex-col items-center justify-center gap-2 py-[60px] px-4
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-[60px] px-4">
            {/* sketch L1163: Inbox 36px color text-tertiary */}
            <Inbox size={36} className="text-text-tertiary shrink-0" />
            <div className="text-body font-bold text-text-primary">조치 항목 없음</div>
            <div className="text-caption text-text-secondary text-center">선택한 조건에 해당하는 불량/주의 항목이 없습니다.</div>
          </div>
        )}

        {!isLoading && !isError && records.map(record => (
          <div
            key={record.id}
            onClick={() => navigate('/remediation/' + record.id)}
            className="flex gap-[10px] cursor-pointer rounded-md p-3 bg-surface-sunken border border-border-default"
          >
            {/* 좌측 색바 — status 기준: open→fire-bar, resolved→safe-bar */}
            <div
              className="w-1 rounded-[2px] shrink-0"
              style={{
                background: record.status === 'open' ? 'var(--status-fire-bar)' : 'var(--status-safe-bar)',
                alignSelf: 'stretch',
              }}
            />
            <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
              {/* Line 1: 카테고리 + 결과 배지 */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-body-sm font-bold text-text-primary flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {record.category}
                </span>
                <span
                  className={[
                    'text-caption font-bold px-1.5 py-0.5 rounded-[5px] leading-none whitespace-nowrap shrink-0 inline-flex items-center',
                    record.result === 'bad' ? 'bg-danger-bg text-danger' : 'bg-warning-bg text-warning',
                  ].join(' ')}
                >
                  {record.result === 'bad' ? '불량' : '주의'}
                </span>
              </div>

              {/* Line 2: 위치 */}
              <div className="text-caption text-text-secondary">
                {recordPlace(record)}
              </div>

              {/* Line 3: 메모 미리보기 */}
              <div
                className={[
                  'text-caption overflow-hidden text-ellipsis whitespace-nowrap',
                  record.memo ? 'text-text-secondary' : 'text-text-tertiary',
                ].join(' ')}
              >
                {record.memo ? record.memo.split('\n')[0] : '메모 없음'}
              </div>

              {/* Line 4: 날짜 + 상태 배지 */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-caption text-text-tertiary">
                  {fmtDate(record.checkedAt)}
                </span>
                <span
                  className={[
                    'text-caption font-bold px-1.5 py-0.5 rounded-[5px] leading-none whitespace-nowrap shrink-0 inline-flex items-center',
                    record.status === 'open' ? 'bg-fire-bg text-fire' : 'bg-safe-bg text-safe',
                  ].join(' ')}
                >
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
