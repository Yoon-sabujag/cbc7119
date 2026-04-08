import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { remediationApi } from '../utils/api'
import { useIsDesktop } from '../hooks/useIsDesktop'
import toast from 'react-hot-toast'

import { fmtKstDate as fmtDate, fmtKstDateTime as fmtDateTime } from '../utils/datetime'

const ZONE_LABEL: Record<string, string> = { office: '사무동', research: '연구동', common: '공용' }
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

const SKELETON_STYLE: React.CSSProperties = {
  background: 'var(--bg3)',
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
  const renderCard = (record: any) => (
    <div
      key={record.id}
      onClick={() => isDesktop ? setSelectedId(record.id) : navigate('/remediation/' + record.id)}
      style={{
        background: 'var(--bg3)',
        border: (isDesktop && effectiveSelectedId === record.id) ? '2px solid var(--acl)' : '2px solid var(--bd)',
        borderRadius: 12,
        padding: 12,
        cursor: 'pointer',
        display: 'flex',
        gap: 10,
        borderLeft: (isDesktop && effectiveSelectedId === record.id)
          ? '2px solid var(--acl)'
          : (record.result === 'bad' ? '4px solid var(--danger)' : '4px solid var(--warn)'),
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {record.category}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 6px', borderRadius: 5, flexShrink: 0,
            background: record.result === 'bad' ? 'rgba(239,68,68,.13)' : 'rgba(245,158,11,.13)',
            color: record.result === 'bad' ? 'var(--danger)' : 'var(--warn)' }}>
            {record.result === 'bad' ? '불량' : '주의'}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--t2)' }}>
          {recordPlace(record)}
        </div>
        <div style={{ fontSize: 12, color: record.memo ? 'var(--t2)' : 'var(--t3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {record.memo ? record.memo.split('\n')[0] : '메모 없음'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--t3)' }}>{fmtDate(record.checkedAt)}</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 5, flexShrink: 0,
            background: record.status === 'open' ? 'rgba(249,115,22,.15)' : 'rgba(34,197,94,.13)',
            color: record.status === 'open' ? 'var(--danger)' : 'var(--safe)' }}>
            {record.status === 'open' ? '미조치' : '완료'}
          </span>
        </div>
      </div>
    </div>
  )

  // 필터 바 (모바일/데스크톱 공용)
  const filterBar = (
    <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--bd)', flexShrink: 0 }}>
      <div style={{ display: 'flex' }}>
        {STATUS_TABS.map(tab => (
          <button key={tab.key} onClick={() => setStatusTab(tab.key)}
            style={{ flex: 1, height: 44, border: 'none',
              background: statusTab === tab.key ? 'var(--bg4)' : 'transparent',
              color: statusTab === tab.key ? 'var(--t1)' : 'var(--t3)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              borderBottom: statusTab === tab.key ? '2px solid var(--acl)' : '2px solid transparent' }}>
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          style={{ flex: 1, height: 36, background: 'var(--bg3)', border: '1px solid var(--bd2)', borderRadius: 8, color: 'var(--t1)', fontSize: 12, padding: '0 8px', cursor: 'pointer' }}>
          <option value="">전체 카테고리</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 4 }}>
          {PERIOD_BUTTONS.map(btn => (
            <button key={btn.value} onClick={() => setDays(btn.value)}
              style={{ height: 32, padding: '0 12px', borderRadius: 8, border: 'none',
                background: days === btn.value ? 'var(--bg4)' : 'var(--bg2)',
                color: days === btn.value ? 'var(--t1)' : 'var(--t3)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', minHeight: 0, overflow: 'hidden' }}>
        <style>{`@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }`}</style>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* 좌측: 목록 */}
          <div style={{ width: '50%', flexShrink: 0, minWidth: 0, borderRight: '1px solid var(--bd)', display: 'flex', flexDirection: 'column' }}>
            {filterBar}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {isLoading && (<><div style={SKELETON_STYLE} /><div style={SKELETON_STYLE} /><div style={SKELETON_STYLE} /></>)}
              {isError && !isLoading && (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--t2)', fontSize: 14 }}>목록을 불러오지 못했습니다.</div>
              )}
              {!isLoading && !isError && records.length === 0 && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '60px 16px' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>조치 항목 없음</div>
                  <div style={{ fontSize: 12, color: 'var(--t2)' }}>선택한 조건에 해당하는 불량/주의 항목이 없습니다.</div>
                </div>
              )}
              {!isLoading && !isError && records.map(record => renderCard(record))}
            </div>
          </div>

          {/* 우측: 상세 보고서 */}
          <div style={{ width: '50%', flexShrink: 0, minWidth: 0, overflowY: 'auto' }}>
            {!detail ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', fontSize: 13 }}>
                좌측에서 항목을 선택하세요
              </div>
            ) : (
              <div style={{ padding: '20px 28px' }}>
                {/* 헤더 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>{detail.category}</div>
                    <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{recordPlace(detail)}</div>
                  </div>
                  <button onClick={() => downloadReport(detail)}
                    style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    📄 보고서 다운로드
                  </button>
                </div>

                {/* 보고서 테이블 */}
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
                        <th style={{ width: 110, padding: '8px 12px', background: 'var(--bg3)', border: '1px solid var(--bd)', fontSize: 12, fontWeight: 700, color: 'var(--t2)', textAlign: 'left', verticalAlign: 'top' }}>{label}</th>
                        <td style={{ padding: '8px 12px', border: '1px solid var(--bd)', fontSize: 13, color: 'var(--t1)', whiteSpace: 'pre-wrap', verticalAlign: 'top' }}>
                          {label === '판정결과' ? (
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 5,
                              background: detail.result === 'bad' ? 'rgba(239,68,68,.13)' : 'rgba(245,158,11,.13)',
                              color: detail.result === 'bad' ? 'var(--danger)' : 'var(--warn)' }}>
                              {detail.result === 'bad' ? '불량' : '주의'}
                            </span>
                          ) : label === '상태' ? (
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 5,
                              background: detail.status === 'open' ? 'rgba(249,115,22,.15)' : 'rgba(34,197,94,.13)',
                              color: detail.status === 'open' ? 'var(--danger)' : 'var(--safe)' }}>
                              {detail.status === 'open' ? '미조치' : '조치완료'}
                            </span>
                          ) : value as string}
                        </td>
                      </tr>
                    ))}
                    {detail.status === 'resolved' && (
                      <>
                        <tr>
                          <th style={{ width: 110, padding: '8px 12px', background: 'var(--bg3)', border: '1px solid var(--bd)', fontSize: 12, fontWeight: 700, color: 'var(--t2)', textAlign: 'left', verticalAlign: 'top' }}>조치일시</th>
                          <td style={{ padding: '8px 12px', border: '1px solid var(--bd)', fontSize: 13, color: 'var(--t1)' }}>{fmtDateTime(detail.resolvedAt)}</td>
                        </tr>
                        <tr>
                          <th style={{ width: 110, padding: '8px 12px', background: 'var(--bg3)', border: '1px solid var(--bd)', fontSize: 12, fontWeight: 700, color: 'var(--t2)', textAlign: 'left', verticalAlign: 'top' }}>조치자</th>
                          <td style={{ padding: '8px 12px', border: '1px solid var(--bd)', fontSize: 13, color: 'var(--t1)' }}>{detail.resolvedBy ?? '-'}</td>
                        </tr>
                        <tr>
                          <th style={{ width: 110, padding: '8px 12px', background: 'var(--bg3)', border: '1px solid var(--bd)', fontSize: 12, fontWeight: 700, color: 'var(--t2)', textAlign: 'left', verticalAlign: 'top' }}>조치 내용</th>
                          <td style={{ padding: '8px 12px', border: '1px solid var(--bd)', fontSize: 13, color: 'var(--t1)', whiteSpace: 'pre-wrap' }}>{detail.resolutionMemo ?? '-'}</td>
                        </tr>
                        <tr>
                          <th style={{ width: 110, padding: '8px 12px', background: 'var(--bg3)', border: '1px solid var(--bd)', fontSize: 12, fontWeight: 700, color: 'var(--t2)', textAlign: 'left', verticalAlign: 'top' }}>소모 자재</th>
                          <td style={{ padding: '8px 12px', border: '1px solid var(--bd)', fontSize: 13, color: 'var(--t1)', whiteSpace: 'pre-wrap' }}>{detail.materialsUsed ?? '-'}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>

                {/* 사진 영역 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* 조치 전 (불량 사진) */}
                  <div style={{ border: '1px solid var(--bd)', borderRadius: 10, padding: 12, background: 'var(--bg2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)' }}>📷 조치 전 (불량)</span>
                      {detail.photoKey && (
                        <button onClick={() => downloadPhoto(detail.photoKey, `조치전_${detail.category}_${(detail.checkedAt ?? '').slice(0,10).replace(/-/g,'')}`)}
                          style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--bd2)', background: 'var(--bg3)', color: 'var(--t2)', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                          ⬇ 다운로드
                        </button>
                      )}
                    </div>
                    {detail.photoKey ? (
                      <img src={'/api/uploads/' + detail.photoKey} alt="조치 전" style={{ width: '100%', maxHeight: 280, objectFit: 'contain', borderRadius: 6, background: '#000' }} />
                    ) : (
                      <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', fontSize: 12 }}>사진 없음</div>
                    )}
                  </div>
                  {/* 조치 후 사진 */}
                  <div style={{ border: '1px solid var(--bd)', borderRadius: 10, padding: 12, background: 'var(--bg2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)' }}>📷 조치 후</span>
                      {detail.resolutionPhotoKey && (
                        <button onClick={() => downloadPhoto(detail.resolutionPhotoKey, `조치후_${detail.category}_${(detail.resolvedAt ?? '').slice(0,10).replace(/-/g,'')}`)}
                          style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--bd2)', background: 'var(--bg3)', color: 'var(--t2)', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                          ⬇ 다운로드
                        </button>
                      )}
                    </div>
                    {detail.resolutionPhotoKey ? (
                      <img src={'/api/uploads/' + detail.resolutionPhotoKey} alt="조치 후" style={{ width: '100%', maxHeight: 280, objectFit: 'contain', borderRadius: 6, background: '#000' }} />
                    ) : (
                      <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', fontSize: 12 }}>{detail.status === 'open' ? '아직 조치 전' : '사진 없음'}</div>
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

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', minHeight: 0, overflow: 'hidden' }}>
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
                {recordPlace(record)}
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
