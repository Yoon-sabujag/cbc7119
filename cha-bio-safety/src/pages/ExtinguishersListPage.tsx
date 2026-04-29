import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { extinguisherApi, ExtinguisherDetail, ExtinguisherListResponse } from '../utils/api'
import { getReplaceWarning, REPLACE_WARNING_STROKE } from '../utils/extinguisher'
import { useIsDesktop } from '../hooks/useIsDesktop'

// ── 타입 ─────────────────────────────────────────────────────────────
type MappingTab = 'all' | 'unmapped' | 'mapped' | 'disposed'
type Item = ExtinguisherListResponse['items'][number]

const SKELETON_STYLE: React.CSSProperties = {
  background: 'var(--bg3)',
  borderRadius: 12,
  height: 88,
  animation: 'blink 2s ease-in-out infinite',
}

const EXTINGUISHER_TYPES = ['분말', '이산화탄소', '할로겐']

// ── helpers ──────────────────────────────────────────────────────────
const norm = (v: any) => (v === '' || v === undefined || v === null) ? null : String(v)

function getMappingState(item: Item): 'unmapped-clean' | 'unmapped-inspected' | 'mapped' | 'disposed' {
  if (item.status === '폐기') return 'disposed'
  if (item.cp_id) return 'mapped'
  if (item.has_records) return 'unmapped-inspected'
  return 'unmapped-clean'
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────
export default function ExtinguishersListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const qc = useQueryClient()
  const isDesktop = useIsDesktop()

  // ── 마커 동행 컨텍스트 ──────────────────────────────────────────────
  const fromMarker = searchParams.get('fromMarker')
  const ctxZone    = searchParams.get('zone')
  const ctxFloor   = searchParams.get('floor')
  const hasMarkerContext = !!fromMarker

  // ── 필터 상태 ────────────────────────────────────────────────────────
  const [tab,  setTab]  = useState<MappingTab>(() => {
    const t = searchParams.get('tab')
    return (t === 'unmapped' || t === 'mapped' || t === 'disposed') ? t : 'all'
  })
  const [zone,  setZone]  = useState(ctxZone ?? '')
  const [floor, setFloor] = useState(ctxFloor ?? '')
  const [type,  setType]  = useState('')
  const [q,     setQ]     = useState('')

  // ── 모달 상태 ────────────────────────────────────────────────────────
  const [registerOpen,    setRegisterOpen]    = useState(false)
  const [editTarget,      setEditTarget]      = useState<Item | null>(null)
  const [confirmDelete,   setConfirmDelete]   = useState<Item | null>(null)
  const [confirmDispose,  setConfirmDispose]  = useState<Item | null>(null)
  const [confirmUnassign, setConfirmUnassign] = useState<Item | null>(null)
  const [swapTarget,      setSwapTarget]      = useState<{ from: Item; to: Item } | null>(null)
  const [expandedId,      setExpandedId]      = useState<number | null>(null)

  // ── List query ───────────────────────────────────────────────────────
  const apiParams = useMemo(() => ({
    status:  tab === 'disposed' ? ('폐기' as const) : tab === 'all' ? undefined : ('active' as const),
    mapping: (tab === 'all' || tab === 'disposed') ? undefined : tab as 'mapped' | 'unmapped',
    zone:    zone  || undefined,
    floor:   floor || undefined,
    type:    type  || undefined,
    q:       q     || undefined,
  }), [tab, zone, floor, type, q])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['extinguishers', apiParams],
    queryFn:  () => extinguisherApi.list(apiParams),
    staleTime: 30_000,
  })

  const items  = data?.items ?? []
  const zones  = data?.zones ?? []
  const floors = data?.floors ?? []

  // ── Mutations ────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, fields }: { id: number; fields: Partial<ExtinguisherDetail> }) =>
      extinguisherApi.update(id, fields as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['extinguishers'] })
      toast.success('수정 완료')
      setEditTarget(null)
    },
    onError: (e: any) => toast.error(e?.message ?? '요청 실패'),
  })

  const assignMutation = useMutation({
    mutationFn: ({ id, cpId }: { id: number; cpId: string }) =>
      extinguisherApi.assign(id, cpId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['extinguishers'] })
      qc.invalidateQueries({ queryKey: ['floorplan-markers'] })
    },
    onError: (e: any) => toast.error(e?.message ?? '요청 실패'),
  })

  const unassignMutation = useMutation({
    mutationFn: (id: number) => extinguisherApi.unassign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['extinguishers'] })
      toast.success('분리 완료')
      setConfirmUnassign(null)
    },
    onError: (e: any) => toast.error(e?.message ?? '요청 실패'),
  })

  const swapMutation = useMutation({
    mutationFn: ({ id, otherId }: { id: number; otherId: number }) =>
      extinguisherApi.swap(id, otherId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['extinguishers'] })
      toast.success('스왑 완료')
      setSwapTarget(null)
    },
    onError: (e: any) => toast.error(e?.message ?? '요청 실패'),
  })

  const disposeMutation = useMutation({
    mutationFn: (id: number) => extinguisherApi.dispose(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['extinguishers'] })
      toast.success('폐기 완료')
      setConfirmDispose(null)
    },
    onError: (e: any) => toast.error(e?.message ?? '요청 실패'),
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => extinguisherApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['extinguishers'] })
      toast.success('삭제 완료')
      setConfirmDelete(null)
    },
    onError: (e: any) => toast.error(e?.message ?? '요청 실패'),
  })

  // ── 신규 등록 핸들러 ─────────────────────────────────────────────────
  const handleRegister = async (fields: Partial<ExtinguisherDetail>) => {
    try {
      const created = await extinguisherApi.create({
        ...fields,
        type: fields.type as string,
        skip_marker: true,
      } as any)
      const newId = (created as any).extinguisherId as number | undefined
      if (!newId) throw new Error('등록 결과에 ID 없음')

      if (hasMarkerContext && fromMarker) {
        await assignMutation.mutateAsync({ id: newId, cpId: fromMarker })
        toast.success('등록 완료 — 위치 자동 배치됨')
        setRegisterOpen(false)
        navigate(-1)
      } else {
        toast.success('등록 완료')
        setRegisterOpen(false)
        qc.invalidateQueries({ queryKey: ['extinguishers'] })
      }
    } catch (e: any) {
      toast.error(e?.message ?? '등록 실패')
    }
  }

  // ── 배치(assign) 클릭: 도면 페이지로 이동 ────────────────────────────
  const handleAssignClick = (item: Item) => {
    const qs = new URLSearchParams()
    qs.set('planType', 'extinguisher')
    qs.set('placingExtinguisher', String(item.id))
    if (item.zone) qs.set('zone', item.zone)
    if (item.floor) qs.set('floor', item.floor)
    navigate(`/floorplan?${qs.toString()}`)
  }

  // ── 동행 배너 해제 ───────────────────────────────────────────────────
  const dismissMarkerContext = () => {
    setSearchParams(prev => {
      prev.delete('fromMarker')
      prev.delete('zone')
      prev.delete('floor')
      return prev
    }, { replace: true })
  }

  // ── 반응형 그리드 컬럼 ───────────────────────────────────────────────
  const gridCols = isDesktop ? '1fr 1fr 1fr' :
    (typeof window !== 'undefined' && window.innerWidth >= 768) ? '1fr 1fr' : '1fr'

  // ── 렌더 ─────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100%',
      background: 'var(--bg)', color: 'var(--t1)',
    }}>
      <style>{`@keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }`}</style>

      {/* ─── Page header ──────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: isDesktop ? 56 : 48, padding: '0 16px',
        background: 'var(--bg2)', borderBottom: '1px solid var(--bd)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>소화기 관리</span>
        <button
          onClick={() => setRegisterOpen(true)}
          style={{
            height: 32, padding: '0 12px', borderRadius: 8,
            background: 'var(--acl)', border: 'none',
            color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          + 새로 등록
        </button>
      </div>

      {/* ─── 마커 동행 안내 배너 ────────────────────────────────────── */}
      {hasMarkerContext && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'rgba(14,165,233,.10)',
          borderBottom: '1px solid rgba(14,165,233,.25)',
          fontSize: 11, color: 'var(--info)',
          flexShrink: 0, gap: 8,
        }}>
          <span>ⓘ &nbsp;{ctxZone ? `「${ctxZone} ${ctxFloor ?? ''}」 위치에 자동 매핑됩니다.` : '해당 위치에 자동 매핑됩니다.'}</span>
          <button
            onClick={dismissMarkerContext}
            style={{
              background: 'transparent', border: '1px solid rgba(14,165,233,.35)',
              color: 'var(--info)', fontSize: 11, padding: '2px 8px',
              borderRadius: 6, cursor: 'pointer', flexShrink: 0,
            }}
          >
            동행 해제
          </button>
        </div>
      )}

      {/* ─── Filter bar ─────────────────────────────────────────────── */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--bd)', flexShrink: 0 }}>
        {/* Row 1: Mapping tab chips */}
        <div style={{ display: 'flex' }}>
          {([
            { key: 'all',      label: '전체' },
            { key: 'unmapped', label: '미배치' },
            { key: 'mapped',   label: '매핑' },
            { key: 'disposed', label: '폐기' },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, height: 44, border: 'none',
                background: tab === t.key ? 'var(--bg4)' : 'transparent',
                color: tab === t.key ? 'var(--t1)' : 'var(--t3)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                borderBottom: tab === t.key ? '2px solid var(--acl)' : '2px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Row 2: Zone / Floor / Type selects + Search input */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 12px',
        }}>
          <select
            value={zone}
            onChange={e => setZone(e.target.value)}
            style={{
              flex: 1, minWidth: 80, height: 32, padding: '0 8px',
              background: 'var(--bg3)', border: '1px solid var(--bd2)',
              borderRadius: 8, color: 'var(--t2)', fontSize: 12,
            }}
          >
            <option value="">구역 전체</option>
            {zones.map(z => <option key={z} value={z}>{z}</option>)}
          </select>

          <select
            value={floor}
            onChange={e => setFloor(e.target.value)}
            style={{
              flex: 1, minWidth: 80, height: 32, padding: '0 8px',
              background: 'var(--bg3)', border: '1px solid var(--bd2)',
              borderRadius: 8, color: 'var(--t2)', fontSize: 12,
            }}
          >
            <option value="">층 전체</option>
            {floors.map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          <select
            value={type}
            onChange={e => setType(e.target.value)}
            style={{
              flex: 1, minWidth: 80, height: 32, padding: '0 8px',
              background: 'var(--bg3)', border: '1px solid var(--bd2)',
              borderRadius: 8, color: 'var(--t2)', fontSize: 12,
            }}
          >
            <option value="">종류 전체</option>
            {EXTINGUISHER_TYPES.map(tp => <option key={tp} value={tp}>{tp}</option>)}
          </select>

          <input
            type="text"
            placeholder="🔍 증지번호·제조번호 검색"
            value={q}
            onChange={e => setQ(e.target.value)}
            style={{
              flex: 2, minWidth: 120, height: 32, padding: '0 10px',
              background: 'var(--bg3)', border: '1px solid var(--bd2)',
              borderRadius: 8, color: 'var(--t1)', fontSize: 12,
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* ─── Card grid / states ─────────────────────────────────────── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: 12,
        paddingBottom: isDesktop ? 24 : 'calc(var(--sab) + 70px)',
      }}>
        {/* Loading */}
        {isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 12 }}>
            <div style={SKELETON_STYLE} />
            <div style={SKELETON_STYLE} />
            <div style={SKELETON_STYLE} />
          </div>
        )}

        {/* Error */}
        {!isLoading && isError && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 8, padding: '60px 16px',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>목록을 불러오지 못했습니다</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', textAlign: 'center' }}>네트워크 상태를 확인하고 다시 시도해 주세요.</div>
            <button
              onClick={() => refetch()}
              style={{
                marginTop: 8, height: 36, padding: '0 16px', borderRadius: 8,
                background: 'var(--bg3)', border: '1px solid var(--bd2)',
                color: 'var(--t1)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && items.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 8, padding: '60px 16px',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>해당하는 소화기가 없습니다</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', textAlign: 'center', lineHeight: 1.6 }}>
              필터를 조정하거나 우상단 「+ 새로 등록」 으로 새 자산을 추가해 주세요.
            </div>
          </div>
        )}

        {/* Cards */}
        {!isLoading && !isError && items.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 12 }}>
            {items.map(item => (
              <ExtinguisherCard
                key={item.id}
                item={item}
                expanded={expandedId === item.id}
                onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                onEdit={() => setEditTarget(item)}
                onAssign={() => handleAssignClick(item)}
                onUnassign={() => setConfirmUnassign(item)}
                onDispose={() => setConfirmDispose(item)}
                onDelete={() => setConfirmDelete(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── 신규 등록 모달 ────────────────────────────────────────────── */}
      {registerOpen && (
        <RegisterModal
          hasMarkerContext={hasMarkerContext}
          ctxZone={ctxZone}
          ctxFloor={ctxFloor}
          onClose={() => setRegisterOpen(false)}
          onSubmit={handleRegister}
        />
      )}

      {/* ─── 정보 수정 모달 ────────────────────────────────────────────── */}
      {editTarget && (
        <EditModal
          item={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={fields => updateMutation.mutate({ id: editTarget.id, fields })}
          saving={updateMutation.isPending}
        />
      )}

      {/* ─── Confirm: 분리 ─────────────────────────────────────────────── */}
      {confirmUnassign && (
        <ConfirmModal
          title="소화기 분리"
          body={`「${confirmUnassign.cp_location ?? confirmUnassign.cp_zone ?? '해당 위치'}」 위치에서 분리합니다. 자산은 미배치 상태로 유지됩니다.`}
          primaryLabel="분리"
          primaryStyle="acl"
          onConfirm={() => unassignMutation.mutate(confirmUnassign.id)}
          onCancel={() => setConfirmUnassign(null)}
          loading={unassignMutation.isPending}
        />
      )}

      {/* ─── Confirm: 폐기 ─────────────────────────────────────────────── */}
      {confirmDispose && (
        <ConfirmModal
          title="소화기 폐기"
          body="이 자산은 폐기 처리되어 더 이상 매핑할 수 없습니다. 점검 이력은 보존됩니다."
          primaryLabel="폐기"
          primaryStyle="danger"
          onConfirm={() => disposeMutation.mutate(confirmDispose.id)}
          onCancel={() => setConfirmDispose(null)}
          loading={disposeMutation.isPending}
        />
      )}

      {/* ─── Confirm: 삭제 ─────────────────────────────────────────────── */}
      {confirmDelete && (
        <ConfirmModal
          title="소화기 삭제"
          body="이 자산은 점검 기록이 없어 영구 삭제됩니다. 되돌릴 수 없습니다."
          primaryLabel="삭제"
          primaryStyle="danger"
          onConfirm={() => removeMutation.mutate(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
          loading={removeMutation.isPending}
        />
      )}

      {/* ─── Confirm: 스왑 ─────────────────────────────────────────────── */}
      {swapTarget && (
        <ConfirmModal
          title="위치 스왑"
          body={`「${swapTarget.to.cp_location ?? swapTarget.to.cp_zone ?? '해당 위치'}」 위치 소화기와 서로 바꿉니다. 양쪽 매핑이 동시에 변경됩니다.`}
          primaryLabel="스왑"
          primaryStyle="acl"
          onConfirm={() => swapMutation.mutate({ id: swapTarget.from.id, otherId: swapTarget.to.id })}
          onCancel={() => setSwapTarget(null)}
          loading={swapMutation.isPending}
        />
      )}
    </div>
  )
}

// ── ExtinguisherCard ─────────────────────────────────────────────────

interface CardProps {
  item: Item
  expanded: boolean
  onToggle: () => void
  onEdit: () => void
  onAssign: () => void
  onUnassign: () => void
  onDispose: () => void
  onDelete: () => void
}

function ExtinguisherCard({
  item, expanded,
  onToggle, onEdit, onAssign, onUnassign, onDispose, onDelete,
}: CardProps) {
  const state = getMappingState(item)
  const warning = getReplaceWarning(item.type, item.manufactured_at)

  // Mapping-state badge LOCKED colors per UI-SPEC §Color
  let badgeBg = '', badgeColor = '', badgeLabel = ''
  if (state === 'disposed') {
    badgeBg = 'rgba(245,158,11,.15)'; badgeColor = 'var(--warn)'; badgeLabel = '폐기'
  } else if (item.cp_id) {
    badgeBg = 'rgba(59,130,246,.15)'; badgeColor = 'var(--acl)'; badgeLabel = '매핑됨'
  } else {
    badgeBg = 'rgba(239,68,68,.15)'; badgeColor = 'var(--danger)'; badgeLabel = '미배치'
  }

  const isDisposed = state === 'disposed'

  return (
    <div
      onClick={!isDisposed ? onToggle : undefined}
      style={{
        background: isDisposed ? 'var(--bg3)' : 'var(--bg2)',
        border: expanded && !isDisposed ? '1.5px solid var(--acl)' : '1px solid var(--bd)',
        borderRadius: 12, padding: 12,
        display: 'flex', flexDirection: 'column', gap: 6,
        cursor: isDisposed ? 'default' : 'pointer',
        opacity: isDisposed ? 0.6 : 1,
        transition: 'border-color .15s',
      }}
    >
      {/* Row 1: 종류 + badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', flex: 1 }}>
          {item.type ?? '-'}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700,
          padding: '2px 8px', borderRadius: 5,
          background: badgeBg, color: badgeColor,
          flexShrink: 0,
        }}>
          {badgeLabel}
        </span>
      </div>

      {/* Row 2: 증지번호 · 제조번호 */}
      <div style={{
        fontSize: 13, fontWeight: 400, color: 'var(--t2)',
        fontFamily: "'JetBrains Mono', monospace",
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {[item.seal_no && `증지: ${item.seal_no}`, item.serial_no && `제조: ${item.serial_no}`].filter(Boolean).join(' · ') || item.mgmt_no}
      </div>

      {/* Row 3: location */}
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--t3)' }}>
        {item.cp_id
          ? `📍 ${item.cp_zone ?? ''} ${item.cp_floor ?? ''}${item.cp_location ? ' · ' + item.cp_location : ''}`
          : '위치 미지정'}
      </div>

      {/* Row 4: warning chip */}
      {warning && (
        <div style={{ alignSelf: 'flex-start' }}>
          <span style={{
            fontSize: 11, fontWeight: 700,
            padding: '2px 8px', borderRadius: 5,
            background: warning === 'danger' ? 'rgba(239,68,68,.15)' : 'rgba(245,158,11,.15)',
            color: warning === 'danger' ? 'var(--danger)' : 'var(--warn)',
            border: `1px solid ${warning === 'danger' ? 'rgba(239,68,68,.3)' : 'rgba(245,158,11,.3)'}`,
          }}>
            ⚠️ 교체 {warning === 'warn' ? '도래' : warning === 'imminent' ? '임박' : '초과'}
          </span>
        </div>
      )}

      {/* Expanded detail block */}
      {expanded && !isDisposed && (
        <>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '3px 12px', fontSize: 11,
            marginTop: 4, paddingTop: 8,
            borderTop: '1px solid var(--bd)',
          }}>
            <DetailField label="접두문자" value={item.prefix_code} />
            <DetailField label="형식승인" value={item.approval_no} mono />
            <DetailField label="제조년월" value={item.manufactured_at} mono />
            <DetailField label="제조업체" value={item.manufacturer} />
          </div>

          {/* Action row — state machine driven by has_records + check_point_id + status */}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }} onClick={e => e.stopPropagation()}>
            {state === 'unmapped-clean' && (
              // 미매핑 + 미점검: 정보 수정 / 소화기 배치 / 삭제
              <>
                <button onClick={onEdit}   style={actionBtnStyle}>정보 수정</button>
                <button onClick={onAssign} style={actionBtnStyle}>소화기 배치</button>
                <button onClick={onDelete} style={{ ...actionBtnStyle, ...dangerBtnStyle }}>삭제</button>
              </>
            )}
            {state === 'unmapped-inspected' && (
              // 미매핑 + 점검O: 정보 수정 / 소화기 배치 / 폐기
              <>
                <button onClick={onEdit}    style={actionBtnStyle}>정보 수정</button>
                <button onClick={onAssign}  style={actionBtnStyle}>소화기 배치</button>
                <button onClick={onDispose} style={{ ...actionBtnStyle, ...dangerBtnStyle }}>폐기</button>
              </>
            )}
            {state === 'mapped' && (
              // 매핑됨: 정보 수정 / 소화기 분리
              <>
                <button onClick={onEdit}    style={actionBtnStyle}>정보 수정</button>
                <button onClick={onUnassign} style={{ ...actionBtnStyle, ...dangerBtnStyle }}>소화기 분리</button>
              </>
            )}
          </div>
        </>
      )}

      {/* 폐기 상태: 조회만 */}
      {isDisposed && (
        <div style={{ fontSize: 11, color: 'var(--t3)', textAlign: 'center', padding: '4px 0' }}>
          폐기된 자산입니다.
        </div>
      )}
    </div>
  )
}

const actionBtnStyle: React.CSSProperties = {
  flex: 1, height: 36, borderRadius: 8,
  fontSize: 12, fontWeight: 700, cursor: 'pointer',
  background: 'var(--bg3)', color: 'var(--t1)',
  border: '1px solid var(--bd2)',
}

const dangerBtnStyle: React.CSSProperties = {
  color: 'var(--danger)',
  border: '1px solid rgba(239,68,68,.3)',
  background: 'rgba(239,68,68,.08)',
}

function DetailField({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span style={{ color: 'var(--t3)', fontWeight: 400 }}>{label}</span>
      <span style={{
        color: 'var(--t1)', fontWeight: 700,
        fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit',
      }}>
        {value ?? '-'}
      </span>
    </div>
  )
}

// ── RegisterModal ─────────────────────────────────────────────────────

interface RegisterModalProps {
  hasMarkerContext: boolean
  ctxZone: string | null
  ctxFloor: string | null
  onClose: () => void
  onSubmit: (fields: Partial<ExtinguisherDetail>) => void
}

function RegisterModal({ hasMarkerContext, ctxZone, ctxFloor, onClose, onSubmit }: RegisterModalProps) {
  const [type,          setType]          = useState<string>('분말')
  const [prefixCode,    setPrefixCode]    = useState('')
  const [sealNo,        setSealNo]        = useState('')
  const [serialNo,      setSerialNo]      = useState('')
  const [approvalNo,    setApprovalNo]    = useState('')
  const [manufacturedAt, setManufacturedAt] = useState('')
  const [manufacturer,  setManufacturer]  = useState('')

  const handleSubmit = () => {
    if (!type) { toast.error('종류를 선택해 주세요'); return }
    onSubmit({
      type,
      prefix_code:    prefixCode || null,
      seal_no:        sealNo     || null,
      serial_no:      serialNo   || null,
      approval_no:    approvalNo || null,
      manufactured_at: manufacturedAt || null,
      manufacturer:   manufacturer   || null,
    } as any)
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <div style={modalWrapperStyle} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', marginBottom: 16 }}>
          소화기 등록
        </div>

        {/* Info banner */}
        <div style={infoBannerStyle}>
          등록 후 한 번에 최대 3개 필드만 수정 가능합니다.
        </div>

        {/* 마커 동행 배너 */}
        {hasMarkerContext && (
          <div style={{ ...infoBannerStyle, marginBottom: 14 }}>
            {ctxZone ? `「${ctxZone} ${ctxFloor ?? ''}」 위치에 자동 매핑됩니다.` : '해당 위치에 자동 매핑됩니다.'}
          </div>
        )}

        {/* 종류 3-col grid */}
        <FieldLabel>종류</FieldLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 14 }}>
          {EXTINGUISHER_TYPES.map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: type === t ? 'var(--acl)' : 'var(--bg3)',
              color: type === t ? '#fff' : 'var(--t2)',
              border: type === t ? 'none' : '1px solid var(--bd)',
            }}>{t}</button>
          ))}
        </div>

        <FieldLabel>접두문자</FieldLabel>
        <input style={inputStyle} value={prefixCode} onChange={e => setPrefixCode(e.target.value)} placeholder="예: A" />

        <FieldLabel>증지번호</FieldLabel>
        <input style={inputStyle} value={sealNo} onChange={e => setSealNo(e.target.value)} placeholder="예: 2024-0001" inputMode="numeric" />

        <FieldLabel>제조번호</FieldLabel>
        <input style={inputStyle} value={serialNo} onChange={e => setSerialNo(e.target.value)} placeholder="예: ABC-12345" />

        <FieldLabel>형식승인</FieldLabel>
        <input style={inputStyle} value={approvalNo} onChange={e => setApprovalNo(e.target.value)} placeholder="예: KFI-P-24-0001" />

        <FieldLabel>제조년월</FieldLabel>
        <input style={inputStyle} value={manufacturedAt} onChange={e => setManufacturedAt(e.target.value)} placeholder="YYYY-MM" />

        <FieldLabel>제조업체</FieldLabel>
        <input style={inputStyle} value={manufacturer} onChange={e => setManufacturer(e.target.value)} placeholder="예: 한국소방(주)" />

        {/* Action row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={onClose} style={cancelBtnStyle}>취소</button>
          <button onClick={handleSubmit} style={primaryBtnStyle}>
            {hasMarkerContext ? '등록 후 배치' : '등록'}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  )
}

// ── EditModal ──────────────────────────────────────────────────────────

interface EditModalProps {
  item: Item
  onClose: () => void
  onSubmit: (fields: Partial<ExtinguisherDetail>) => void
  saving: boolean
}

function EditModal({ item, onClose, onSubmit, saving }: EditModalProps) {
  const [type,          setType]          = useState(item.type ?? '')
  const [prefixCode,    setPrefixCode]    = useState(item.prefix_code ?? '')
  const [sealNo,        setSealNo]        = useState(item.seal_no ?? '')
  const [serialNo,      setSerialNo]      = useState(item.serial_no ?? '')
  const [approvalNo,    setApprovalNo]    = useState(item.approval_no ?? '')
  const [manufacturedAt, setManufacturedAt] = useState(item.manufactured_at ?? '')
  const [manufacturer,  setManufacturer]  = useState(item.manufacturer ?? '')

  // 변경 카운터 — norm(v) !== norm(original) 로 판정
  const changedCount = useMemo(() => {
    let n = 0
    if (norm(type) !== norm(item.type)) n++
    if (norm(prefixCode) !== norm(item.prefix_code)) n++
    if (norm(sealNo) !== norm(item.seal_no)) n++
    if (norm(serialNo) !== norm(item.serial_no)) n++
    if (norm(approvalNo) !== norm(item.approval_no)) n++
    if (norm(manufacturedAt) !== norm(item.manufactured_at)) n++
    if (norm(manufacturer) !== norm(item.manufacturer)) n++
    return n
  }, [type, prefixCode, sealNo, serialNo, approvalNo, manufacturedAt, manufacturer,
      item.type, item.prefix_code, item.seal_no, item.serial_no, item.approval_no, item.manufactured_at, item.manufacturer])

  const counterChipStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center',
    padding: '2px 8px', borderRadius: 5,
    fontSize: 11, fontWeight: 700, flexShrink: 0,
    background: changedCount === 0 ? 'var(--bg3)' : changedCount <= 3 ? 'rgba(59,130,246,.15)' : 'rgba(239,68,68,.15)',
    color:      changedCount === 0 ? 'var(--t3)' : changedCount <= 3 ? 'var(--acl)' : 'var(--danger)',
  }

  const saveDisabled = changedCount > 3 || changedCount === 0

  const handleSave = () => {
    if (saveDisabled) return
    const changed: Partial<ExtinguisherDetail> = {}
    if (norm(type) !== norm(item.type)) changed.type = type
    if (norm(prefixCode) !== norm(item.prefix_code)) changed.prefix_code = prefixCode || null
    if (norm(sealNo) !== norm(item.seal_no)) changed.seal_no = sealNo || null
    if (norm(serialNo) !== norm(item.serial_no)) changed.serial_no = serialNo || null
    if (norm(approvalNo) !== norm(item.approval_no)) changed.approval_no = approvalNo || null
    if (norm(manufacturedAt) !== norm(item.manufactured_at)) changed.manufactured_at = manufacturedAt || null
    if (norm(manufacturer) !== norm(item.manufacturer)) changed.manufacturer = manufacturer || null
    onSubmit(changed)
  }

  const borderForField = (original: string | null | undefined, current: string): string =>
    norm(current) !== norm(original) ? 'var(--acl)' : 'var(--bd2)'

  return (
    <ModalBackdrop onClose={onClose}>
      <div style={modalWrapperStyle} onClick={e => e.stopPropagation()}>
        {/* Header with counter chip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: changedCount > 3 ? 8 : 16 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>정보 수정</span>
          <span style={counterChipStyle}>변경: {changedCount} / 3</span>
        </div>

        {/* Microcopy when n>3 */}
        {changedCount > 3 && (
          <div style={{ fontSize: 11, color: 'var(--danger)', marginBottom: 12 }}>
            4개 이상 변경하려면 「폐기 후 재등록」을 사용하세요.
          </div>
        )}

        {/* 종류 */}
        <FieldLabel>종류</FieldLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 14 }}>
          {EXTINGUISHER_TYPES.map(t => {
            const isActive = type === t
            const isChanged = norm(t) !== norm(item.type) && isActive
            return (
              <button key={t} onClick={() => setType(t)} style={{
                padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: isActive ? 'var(--acl)' : 'var(--bg3)',
                color: isActive ? '#fff' : 'var(--t2)',
                border: isChanged ? '1.5px solid var(--acl)' : (isActive ? 'none' : '1px solid var(--bd)'),
              }}>{t}</button>
            )
          })}
        </div>

        <FieldLabel>접두문자</FieldLabel>
        <input style={{ ...inputStyle, borderColor: borderForField(item.prefix_code, prefixCode) }}
          value={prefixCode} onChange={e => setPrefixCode(e.target.value)} />

        <FieldLabel>증지번호</FieldLabel>
        <input style={{ ...inputStyle, borderColor: borderForField(item.seal_no, sealNo) }}
          value={sealNo} onChange={e => setSealNo(e.target.value)} inputMode="numeric" />

        <FieldLabel>제조번호</FieldLabel>
        <input style={{ ...inputStyle, borderColor: borderForField(item.serial_no, serialNo) }}
          value={serialNo} onChange={e => setSerialNo(e.target.value)} />

        <FieldLabel>형식승인</FieldLabel>
        <input style={{ ...inputStyle, borderColor: borderForField(item.approval_no, approvalNo) }}
          value={approvalNo} onChange={e => setApprovalNo(e.target.value)} />

        <FieldLabel>제조년월</FieldLabel>
        <input style={{ ...inputStyle, borderColor: borderForField(item.manufactured_at, manufacturedAt) }}
          value={manufacturedAt} onChange={e => setManufacturedAt(e.target.value)} placeholder="YYYY-MM" />

        <FieldLabel>제조업체</FieldLabel>
        <input style={{ ...inputStyle, borderColor: borderForField(item.manufacturer, manufacturer) }}
          value={manufacturer} onChange={e => setManufacturer(e.target.value)} />

        {/* Action row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={onClose} style={cancelBtnStyle}>취소</button>
          <button
            onClick={handleSave}
            disabled={saveDisabled}
            style={saveDisabled
              ? { ...primaryBtnStyle, background: 'var(--bd2)', color: 'var(--t3)', cursor: 'not-allowed', border: '1px solid rgba(239,68,68,.3)' }
              : primaryBtnStyle
            }
          >
            {saving ? '저장 중…' : '저장'}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  )
}

// ── ConfirmModal ───────────────────────────────────────────────────────

interface ConfirmModalProps {
  title: string
  body: string
  primaryLabel: string
  primaryStyle: 'acl' | 'danger'
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}

function ConfirmModal({ title, body, primaryLabel, primaryStyle, onConfirm, onCancel, loading }: ConfirmModalProps) {
  return (
    <ModalBackdrop onClose={onCancel}>
      <div style={{ ...modalWrapperStyle, maxWidth: 320 }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', marginBottom: 10 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 16 }}>{body}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{
            flex: 1, height: 42, borderRadius: 10,
            background: 'var(--bg3)', border: '1px solid var(--bd)',
            color: 'var(--t2)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>취소</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1, height: 42, borderRadius: 10, border: 'none',
              fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              background: primaryStyle === 'acl' ? 'var(--acl)' : 'var(--danger)',
              color: '#fff', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '처리 중…' : primaryLabel}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  )
}

// ── ModalBackdrop ──────────────────────────────────────────────────────

function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
      }}
      onClick={onClose}
    >
      {children}
    </div>
  )
}

// ── FieldLabel ─────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--t3)', marginBottom: 6 }}>
      {children}
    </div>
  )
}

// ── Shared style objects ───────────────────────────────────────────────

const modalWrapperStyle: React.CSSProperties = {
  width: '90%', maxWidth: 360,
  background: 'var(--bg2)', borderRadius: 16, padding: 20,
  border: '1px solid var(--bd2)', maxHeight: '80vh', overflowY: 'auto',
}

const infoBannerStyle: React.CSSProperties = {
  background: 'rgba(14,165,233,.10)',
  border: '1px solid rgba(14,165,233,.25)',
  color: 'var(--info)',
  padding: '8px 12px', borderRadius: 8,
  fontSize: 11, marginBottom: 14, lineHeight: 1.5,
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 40, padding: '0 12px',
  background: 'var(--bg3)', border: '1px solid var(--bd2)',
  borderRadius: 8, color: 'var(--t1)', fontSize: 13,
  outline: 'none', marginBottom: 14, boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const cancelBtnStyle: React.CSSProperties = {
  padding: '12px 18px',
  background: 'var(--bg)', color: 'var(--t2)',
  border: '1px solid var(--bd2)', borderRadius: 12,
  fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
}

const primaryBtnStyle: React.CSSProperties = {
  flex: 1, padding: '13px 0',
  background: 'var(--acl)', color: '#fff',
  border: 'none', borderRadius: 12,
  fontSize: 13, fontWeight: 700, cursor: 'pointer',
}
