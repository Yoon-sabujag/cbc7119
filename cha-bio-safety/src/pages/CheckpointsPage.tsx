import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '../stores/authStore'
import { checkPointApi, floorPlanMarkerApi, extinguisherApi } from '../utils/api'
import { useIsDesktop } from '../hooks/useIsDesktop'
import type { CheckPointFull, CheckPointUpdatePayload, BuildingZone } from '../types'
import { Plus, ChevronDown } from 'lucide-react'
import { CATEGORY_REGISTRY, type CategoryRegistryEntry } from '../utils/checkpointRegistry'

// ── 상수 ────────────────────────────────────────────────────
// 카테고리는 DB에서 동적으로 가져옴 (하드코딩 폴백)
const CATEGORIES_FALLBACK = [
  '소화기', '소화전', '스프링클러', '청정소화약제', '소방펌프',
  '자동화재탐지설비', '유도등', '방화셔터', '비상콘센트', '소방용전원공급반',
  '특별피난계단', '전실제연댐퍼', '배연창', '연결송수관', '완강기',
  'DIV', 'CCTV', '주차장비', '회전문',
]
const ZONE_LABEL: Record<string, string> = {
  office: '사무동', research: '연구동', basement: '지하', common: '지하',  // 'common' is legacy (pre-0081)
}

// ── BottomSheet ──────────────────────────────────────────
function BottomSheet({ onClose, title, children }: {
  onClose: () => void; title: string; children: React.ReactNode
}) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'var(--bg2)', borderRadius: '16px 16px 0 0', animation: 'slideUp 0.28s ease-out both', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
          <div style={{ width: 32, height: 4, background: 'var(--bd2)', borderRadius: 2 }} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', padding: '12px 16px 0' }}>{title}</div>
        {children}
      </div>
    </div>
  )
}

// ── Modal (Desktop) ─────────────────────────────────────
function DesktopModal({ onClose, title, children }: {
  onClose: () => void; title: string; children: React.ReactNode
}) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'var(--bg2)', borderRadius: 12, width: 440, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,.18)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', padding: '20px 24px 0' }}>{title}</div>
        {children}
      </div>
    </div>
  )
}

// ── 스타일 상수 ─────────────────────────────────────────
const INPUT_STYLE: React.CSSProperties = {
  height: 44, background: 'var(--bg3)', border: '1px solid var(--bd)',
  borderRadius: 8, padding: '0 12px', fontSize: 14, color: 'var(--t1)',
  width: '100%', boxSizing: 'border-box', outline: 'none',
}
const LABEL_STYLE: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 6, display: 'block',
}

// ── Registry-Driven Form (방화셔터 등 카테고리별 데이터-주도 폼) ──
function RegistryDrivenForm({ entry, onClose }: {
  entry: CategoryRegistryEntry; onClose: () => void
}) {
  const qc = useQueryClient()
  const [zone, setZone] = useState<string>('')
  const [floor, setFloor] = useState<string>('')
  const [location, setLocation] = useState<string>('')
  const [description, setDescription] = useState<string>('')

  // 같은 카테고리의 기존 cp 들 로드 → next seq 계산
  const { data: existing } = useQuery({
    queryKey: ['check-points', entry.category],
    queryFn: () => checkPointApi.list(entry.category),
    enabled: !!floor,
    staleTime: 30_000,
  })

  const nextSeq: number | null = (() => {
    if (!floor || !existing) return null
    const locationNos = existing
      .filter(c => c.floor === floor)
      .map(c => c.locationNo ?? '')
      .filter(Boolean)
    return entry.nextSeqStrategy(locationNos)
  })()

  const previewId  = floor && nextSeq !== null ? entry.idPattern(floor, nextSeq) : ''
  const previewLoc = floor && nextSeq !== null ? entry.locationNoPattern(floor, nextSeq) : ''

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!floor || nextSeq === null) throw new Error('floor/seq 미설정')
      const id = entry.idPattern(floor, nextSeq)
      const qrCode = entry.qrPattern(id)
      const locationNo = entry.locationNoPattern(floor, nextSeq)
      return checkPointApi.create({
        id, qrCode, floor, zone: zone as BuildingZone,
        location: location.trim(),
        category: entry.category,
        description: description.trim() || undefined,
        locationNo,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['check-points'] })
      qc.invalidateQueries({ queryKey: ['check-point-categories'] })
      toast.success('개소가 추가되었습니다')
      onClose()
    },
    onError: () => toast.error('저장에 실패했습니다. 입력값을 확인해 주세요'),
  })

  const canSave = location.trim() !== '' && zone !== '' && floor !== '' && nextSeq !== null
  const isBusy = createMutation.isPending

  return (
    <>
      <div className="form-body" style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={LABEL_STYLE}>카테고리</label>
          <div style={{ ...INPUT_STYLE, display: 'flex', alignItems: 'center', background: 'var(--bg2)' }}>
            {entry.category}
          </div>
        </div>
        <div>
          <label style={LABEL_STYLE}>구역 <span style={{ color: 'var(--status-danger)' }}>*</span></label>
          <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-default)' }}>
            {entry.zones.map(z => (
              <button key={z}
                onClick={() => { setZone(prev => prev === z ? '' : z); setFloor('') }}
                style={{ flex: 1, height: 36, border: 'none', cursor: 'pointer',
                  background: zone === z ? 'var(--accent)' : 'var(--surface-active)',
                  color: zone === z ? '#fff' : 'var(--text-tertiary)' }}>
                <span className="text-caption font-bold">{ZONE_LABEL[z] ?? z}</span>
              </button>
            ))}
          </div>
        </div>
        {zone && (
          <div>
            <label style={LABEL_STYLE}>층 <span style={{ color: 'var(--status-danger)' }}>*</span></label>
            <select style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }}
              value={floor} onChange={e => setFloor(e.target.value)}>
              <option value="">층 선택</option>
              {(entry.floorsByZone[zone] ?? []).map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label style={LABEL_STYLE}>개소명 <span style={{ color: 'var(--status-danger)' }}>*</span></label>
          <input style={INPUT_STYLE} value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder={entry.locationPlaceholder} />
        </div>
        <div>
          <label style={LABEL_STYLE}>설명</label>
          <input style={INPUT_STYLE} value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="메모 (선택)" />
        </div>
        {previewId && (
          <div style={{ fontSize: 12, color: 'var(--t2)', padding: '8px 12px', background: 'var(--bg3)', borderRadius: 8 }}>
            <div>ID: <strong style={{ color: 'var(--t1)' }}>{previewId}</strong></div>
            <div>위치번호: <strong style={{ color: 'var(--t1)' }}>{previewLoc}</strong></div>
          </div>
        )}
      </div>
      <div className="action-row" style={{ padding: 16, display: 'flex', gap: 8 }}>
        <button onClick={onClose}
          style={{ flex: 1, height: 44, background: 'var(--surface-active)', color: 'var(--text-secondary)', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          <span className="text-body-sm font-bold">취소</span>
        </button>
        <button onClick={() => canSave && !isBusy && createMutation.mutate()}
          disabled={!canSave || isBusy}
          style={{ flex: 1, height: 44, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8,
            cursor: canSave && !isBusy ? 'pointer' : 'not-allowed',
            opacity: canSave && !isBusy ? 1 : 0.4 }}>
          <span className="text-body-sm font-bold">저장</span>
        </button>
      </div>
    </>
  )
}

// ── Add CheckPoint Router (registry vs legacy 분기) ─────
function AddCheckPointRouter({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState<string>('')
  const isRegistry = !!category && !!CATEGORY_REGISTRY[category]

  if (isRegistry) {
    return (
      <>
        <div style={{ padding: '16px 16px 0' }}>
          <label style={LABEL_STYLE}>카테고리 <span style={{ color: 'var(--status-danger)' }}>*</span></label>
          <select style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }}
            value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">카테고리 선택</option>
            {CATEGORIES_FALLBACK.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <RegistryDrivenForm entry={CATEGORY_REGISTRY[category]} onClose={onClose} />
      </>
    )
  }

  // 비-registry: 초기에는 카테고리 select 만 보여주고,
  // 사용자가 카테고리를 고르면 CheckPointModalContent 로 위임.
  if (!category) {
    return (
      <div style={{ padding: '16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={LABEL_STYLE}>카테고리 <span style={{ color: 'var(--status-danger)' }}>*</span></label>
          <select style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }}
            value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">카테고리 선택</option>
            {CATEGORIES_FALLBACK.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ fontSize: 12, color: 'var(--t2)' }}>카테고리를 먼저 선택하세요.</div>
      </div>
    )
  }

  // 카테고리 선택됨 && registry 없음 → 기존 모달 폼에 initialCategory 전달
  return <CheckPointModalContent mode="add" cp={undefined} onClose={onClose} initialCategory={category} />
}

// ── CheckPoint Modal Content ────────────────────────────
interface CpFormState {
  location: string; category: string; zone: string; floor: string;
  description: string; locationNo: string;
}
const EMPTY_CP_FORM: CpFormState = {
  location: '', category: '', zone: '', floor: '', description: '', locationNo: '',
}
const ZONE_FLOORS: Record<string, string[]> = {
  office: ['8-1F', '8F', '7F', '6F', '5F', '3F', '2F', '1F'],
  research: ['8-1F', '8F', '7F', '6F', '5F', '3F', '2F', '1F'],
  common: ['B1', 'M', 'B2', 'B3', 'B4', 'B5'],
}

interface ExtState {
  type: string
  manufacturer: string
  manufactured_at: string
  approval_no: string
  prefix_code: string
  seal_no: string
  serial_no: string
}
const EMPTY_EXT: ExtState = { type: '', manufacturer: '', manufactured_at: '', approval_no: '', prefix_code: '', seal_no: '', serial_no: '' }

function CheckPointModalContent({
  mode, cp, onClose, initialCategory,
}: { mode: 'add' | 'edit'; cp?: CheckPointFull; onClose: () => void; initialCategory?: string }) {
  const qc = useQueryClient()
  const [form, setForm] = useState<CpFormState>(
    mode === 'edit' && cp
      ? { location: cp.location, category: cp.category, zone: cp.zone, floor: cp.floor, description: cp.description ?? '', locationNo: cp.locationNo ?? '' }
      : { ...EMPTY_CP_FORM, category: initialCategory ?? '' }
  )
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)
  const [extForm, setExtForm] = useState<ExtState>(EMPTY_EXT)
  const isExtCategory = form.category === '소화기'

  // 카테고리 선택 시 기존 데이터 기반 기본값 생성
  const { data: catCheckPoints } = useQuery({
    queryKey: ['check-points', form.category],
    queryFn: () => checkPointApi.list(form.category),
    enabled: mode === 'add' && form.category !== '',
    staleTime: 30_000,
  })

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value
    setForm(f => ({ ...f, category: cat }))
  }

  // 카테고리+구역+층 선택 후 기본값 생성
  useEffect(() => {
    if (mode !== 'add' || !catCheckPoints || !form.category) return
    // 선택된 층의 데이터만 필터
    const filtered = form.floor
      ? catCheckPoints.filter(c => c.floor === form.floor)
      : catCheckPoints
    // 위치번호: 해당 층의 마지막 번호 +1
    const nos = filtered.map(c => c.locationNo).filter(Boolean).sort()
    const lastNo = nos[nos.length - 1] ?? ''
    const numMatch = lastNo.match(/(\d+)$/)
    let nextNo = ''
    if (numMatch) {
      const nextNum = String(parseInt(numMatch[1]) + 1).padStart(numMatch[1].length, '0')
      nextNo = lastNo.slice(0, -numMatch[1].length) + nextNum
    } else if (form.floor) {
      nextNo = `${form.floor}-1`
    }
    // 개소명: {층} {카테고리} {N+1}번
    const count = filtered.length + 1
    const floorPrefix = form.floor ? `${form.floor} ` : ''
    const defaultName = `${floorPrefix}${form.category} ${count}번`
    setForm(f => ({ ...f, locationNo: nextNo, location: defaultName }))
  }, [catCheckPoints, form.category, form.floor, mode])

  const setField = (k: keyof CpFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const createMutation = useMutation({
    mutationFn: async () => {
      if (isExtCategory) {
        // zone 영문 → 한글 (연/사/공) — FloorPlanPage 703~710 패턴 동일
        const zoneMap: Record<string, string> = { research: '연', office: '사', common: '공' }
        const zoneChar = zoneMap[form.zone] ?? '연'
        return extinguisherApi.create({
          floor: form.floor,
          zone: zoneChar,
          location: form.location,
          type: extForm.type,
          approval_no: extForm.approval_no || undefined,
          manufactured_at: extForm.manufactured_at || undefined,
          manufacturer: extForm.manufacturer || undefined,
          prefix_code: extForm.prefix_code || undefined,
          seal_no: extForm.seal_no || undefined,
          serial_no: extForm.serial_no || undefined,
        })
      }
      // 비-소화기: 기존 흐름 유지
      const id = `cp_${Date.now()}`
      const qrCode = `QR-${id}`
      return checkPointApi.create({ id, qrCode, floor: form.floor, zone: form.zone as BuildingZone, location: form.location, category: form.category, description: form.description || undefined, locationNo: form.locationNo || undefined })
    },
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ['check-points'] })
      qc.invalidateQueries({ queryKey: ['check-point-categories'] })
      if (isExtCategory && data?.mgmtNo) {
        toast.success(`소화기 등록 완료 (${data.mgmtNo})`)
      } else {
        toast.success('개소가 추가되었습니다')
      }
      onClose()
    },
    onError: () => toast.error('저장에 실패했습니다. 입력값을 확인해 주세요'),
  })

  // FPM- 프리픽스 id 는 floor_plan_markers 테이블 (유도등 전용).
  // check_points 와 스키마가 다르므로 update 라우팅을 분리한다.
  const isMarker = !!cp?.id?.startsWith('FPM-')

  const updateMutation = useMutation({
    mutationFn: async (data: CheckPointUpdatePayload): Promise<void> => {
      if (isMarker) {
        // 마커: label (=개소명), description, zone 만 수정 가능.
        // floor/locationNo/category/isActive 는 마커 스키마에 없거나 의미가 달라 무시.
        await floorPlanMarkerApi.update(cp!.id, {
          label: data.location,
          description: data.description ?? null,
          zone: (data.zone as string) ?? null,
        })
        return
      }
      await checkPointApi.update(cp!.id, data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['check-points'] })
      qc.invalidateQueries({ queryKey: ['floorplan-markers-all'] })
      toast.success('개소 정보가 수정되었습니다')
      onClose()
    },
    onError: () => toast.error('저장에 실패했습니다. 입력값을 확인해 주세요'),
  })

  const deactivateMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (isMarker) {
        // 마커는 isActive 컬럼이 없음 → 비활성화 대신 DELETE (방어적).
        // 현재 UI 는 markers 섹션에서 '비활성화' 버튼을 숨기는 편이 안전하지만,
        // 이 경로로 들어오면 삭제로 처리.
        await floorPlanMarkerApi.delete(cp!.id)
        return
      }
      await checkPointApi.update(cp!.id, { isActive: 0 })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['check-points'] })
      qc.invalidateQueries({ queryKey: ['floorplan-markers-all'] })
      toast.success(isMarker ? '마커가 삭제되었습니다' : '개소가 비활성화되었습니다')
      onClose()
    },
    onError: () => toast.error('비활성화에 실패했습니다'),
  })

  const canSave =
    form.location.trim() !== '' &&
    form.category !== '' &&
    (!isExtCategory || (extForm.type !== '' && form.zone !== '' && form.floor !== ''))
  const isBusy = createMutation.isPending || updateMutation.isPending

  function handleSave() {
    if (!canSave) return
    if (mode === 'add') {
      createMutation.mutate()
    } else {
      updateMutation.mutate({ location: form.location, category: form.category, zone: form.zone as BuildingZone, floor: form.floor, description: form.description || undefined, locationNo: form.locationNo || undefined })
    }
  }

  return (
    <>
      <div className="form-body" style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={LABEL_STYLE}>카테고리 <span className="required-star" style={{ color: 'var(--status-danger)' }}>*</span></label>
          <select style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }} value={form.category} onChange={handleCategoryChange}>
            <option value="">카테고리 선택</option>
            {CATEGORIES_FALLBACK.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={LABEL_STYLE}>구역</label>
          <div className="zone-row" style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-default)' }}>
            {(['office', 'research', 'basement'] as const).map(z => (
              <button key={z} onClick={() => setForm(f => ({ ...f, zone: f.zone === z ? '' : z, floor: '' }))}
                className={form.zone === z ? 'zone-btn active' : 'zone-btn inactive'}
                style={{ flex: 1, height: 36, border: 'none', cursor: 'pointer', transition: 'all 0.15s', background: form.zone === z ? 'var(--accent)' : 'var(--surface-active)', color: form.zone === z ? '#fff' : 'var(--text-tertiary)' }}
              >
                <span className="text-caption font-bold">{ZONE_LABEL[z] ?? z}</span>
              </button>
            ))}
          </div>
        </div>
        {form.zone && (
          <div>
            <label style={LABEL_STYLE}>층</label>
            <select style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }} value={form.floor} onChange={setField('floor')}>
              <option value="">층 선택</option>
              {(ZONE_FLOORS[form.zone] ?? []).map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        )}
        {isExtCategory && (
          <>
            <div>
              <label style={LABEL_STYLE}>종류 <span className="required-star" style={{ color: 'var(--status-danger)' }}>*</span></label>
              <select style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }}
                value={extForm.type}
                onChange={e => setExtForm(p => ({ ...p, type: e.target.value }))}>
                <option value="">종류 선택</option>
                <option value="분말 20kg">분말 20kg</option>
                <option value="분말 3.3kg">분말 3.3kg</option>
                <option value="할로겐">할로겐</option>
                <option value="K급">K급</option>
              </select>
            </div>
            <div>
              <label style={LABEL_STYLE}>제조업체</label>
              <input style={INPUT_STYLE} value={extForm.manufacturer}
                onChange={e => setExtForm(p => ({ ...p, manufacturer: e.target.value }))}
                placeholder="예: 한울방재" />
            </div>
            <div>
              <label style={LABEL_STYLE}>제조년월</label>
              <input style={INPUT_STYLE} value={extForm.manufactured_at}
                onChange={e => setExtForm(p => ({ ...p, manufactured_at: e.target.value }))}
                placeholder="예: 2024-04 (YYYY-MM)" />
            </div>
            <div>
              <label style={LABEL_STYLE}>형식승인번호</label>
              <input style={INPUT_STYLE} value={extForm.approval_no}
                onChange={e => setExtForm(p => ({ ...p, approval_no: e.target.value }))}
                placeholder="예: 수소10-19-11" />
            </div>
            <div>
              <label style={LABEL_STYLE}>접두문자</label>
              <input style={INPUT_STYLE} value={extForm.prefix_code}
                onChange={e => setExtForm(p => ({ ...p, prefix_code: e.target.value }))}
                placeholder="예: BEQV" />
            </div>
            <div>
              <label style={LABEL_STYLE}>증지번호</label>
              <input style={INPUT_STYLE} value={extForm.seal_no}
                onChange={e => setExtForm(p => ({ ...p, seal_no: e.target.value }))}
                placeholder="예: 72605" />
            </div>
            <div>
              <label style={LABEL_STYLE}>제조번호</label>
              <input style={INPUT_STYLE} value={extForm.serial_no}
                onChange={e => setExtForm(p => ({ ...p, serial_no: e.target.value }))}
                placeholder="예: 68605" />
            </div>
          </>
        )}
        <div>
          <label style={LABEL_STYLE}>개소명 <span className="required-star" style={{ color: 'var(--status-danger)' }}>*</span></label>
          <input style={INPUT_STYLE} value={form.location} onChange={setField('location')} placeholder="1층 로비 소화기" />
        </div>
        {!isExtCategory && (
          <>
            <div>
              <label style={LABEL_STYLE}>위치번호</label>
              <input style={INPUT_STYLE} value={form.locationNo} onChange={setField('locationNo')} placeholder="001 (선택)" />
            </div>
            <div>
              <label style={LABEL_STYLE}>설명</label>
              <input style={INPUT_STYLE} value={form.description} onChange={setField('description')} placeholder="메모 (선택)" />
            </div>
          </>
        )}
      </div>

      {!confirmDeactivate ? (
        <div className="action-row" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="action-btns" style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose}
              className="btn-cancel"
              style={{ flex: 1, height: 44, background: 'var(--surface-active)', color: 'var(--text-secondary)', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              <span className="text-body-sm font-bold">취소</span>
            </button>
            <button onClick={handleSave} disabled={!canSave || isBusy}
              className={canSave && !isBusy ? 'btn-save' : 'btn-save disabled'}
              style={{ flex: 1, height: 44, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: canSave && !isBusy ? 'pointer' : 'not-allowed', opacity: canSave && !isBusy ? 1 : 0.4 }}>
              <span className="text-body-sm font-bold">저장</span>
            </button>
          </div>
          {mode === 'edit' && cp?.isActive !== 0 && (
            <button onClick={() => setConfirmDeactivate(true)}
              className="btn-deactivate"
              style={{ width: '100%', height: 40, background: 'rgba(239,68,68,.08)', color: 'var(--status-danger)', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              <span className="text-caption">비활성화</span>
            </button>
          )}
        </div>
      ) : (
        <div className="deactivate-confirm-box" style={{ padding: 16 }}>
          <div style={{ background: 'rgba(239,68,68,.08)', borderRadius: 8, padding: '12px', color: 'var(--text-secondary)', marginBottom: 8 }}>
            <span className="text-caption">이 개소를 비활성화합니다. 기존 점검 기록은 보존됩니다.</span>
          </div>
          <div className="action-btns" style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setConfirmDeactivate(false)}
              className="btn-cancel"
              style={{ flex: 1, height: 44, background: 'var(--surface-active)', color: 'var(--text-secondary)', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              <span className="text-body-sm">취소</span>
            </button>
            <button onClick={() => deactivateMutation.mutate()} disabled={deactivateMutation.isPending}
              className="btn-deactivate-confirm"
              style={{ flex: 1, height: 44, background: 'var(--status-danger)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', opacity: deactivateMutation.isPending ? 0.6 : 1 }}>
              <span className="text-body-sm font-bold">비활성화</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ── CheckPoint Card (Mobile) ────────────────────────────
function CheckPointCard({ cp, onEdit }: { cp: CheckPointFull; onEdit: () => void }) {
  return (
    <div onClick={onEdit}
      className={cp.isActive === 0 ? 'cp-card inactive' : 'cp-card'}
      style={{ background: 'var(--surface-sunken)', borderRadius: 12, padding: '12px 16px', minHeight: 48, display: 'flex', alignItems: 'center', gap: 10, opacity: cp.isActive === 0 ? 0.45 : 1, cursor: 'pointer' }}>
      <span className="cp-dot w-[8px] h-[8px] rounded-full" style={{ flexShrink: 0, background: cp.isActive !== 0 ? 'var(--status-safe-bar)' : 'var(--text-tertiary)' }} />
      <div className="cp-content" style={{ flex: 1, minWidth: 0 }}>
        <div className="cp-top" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span className="cp-location text-body-sm font-bold" style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cp.location}</span>
          <span className="cp-cat-badge text-caption leading-none" style={{ padding: '2px 5px', borderRadius: 4, background: 'rgba(59,130,246,.13)', color: 'var(--accent)', flexShrink: 0 }}>
            {cp.category}
          </span>
        </div>
        <span className="cp-meta text-caption leading-none" style={{ color: 'var(--text-secondary)' }}>
          {ZONE_LABEL[cp.zone] ?? cp.zone} · {cp.floor}
        </span>
      </div>
      <span className="cp-action text-caption leading-none" style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>수정 ▸</span>
    </div>
  )
}

// ── 스켈레톤 ─────────────────────────────────────────────
const SKELETON_STYLE: React.CSSProperties = {
  background: 'var(--bg3)', borderRadius: 12, height: 64,
  animation: 'blink 2s ease-in-out infinite',
}

// ── 메인 페이지 ──────────────────────────────────────────
export default function CheckpointsPage() {
  const navigate = useNavigate()
  const { staff: me } = useAuthStore()
  const isDesktop = useIsDesktop()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [filterZone, setFilterZone] = useState('')
  const [filterFloor, setFilterFloor] = useState('')
  const [modal, setModal] = useState<{ open: boolean; mode: 'add' | 'edit'; target?: CheckPointFull }>({ open: false, mode: 'add' })

  // Role guard
  useEffect(() => {
    if (me?.role !== 'admin') navigate('/dashboard', { replace: true })
  }, [me, navigate])

  const { data: categories = [] } = useQuery({
    queryKey: ['check-point-categories'],
    queryFn: checkPointApi.categories,
    staleTime: 60_000,
  })

  const isGuidelamp = selectedCategory === '유도등'
  const { data: checkPoints, isLoading: cpLoading, isError } = useQuery({
    queryKey: ['check-points', selectedCategory],
    queryFn: () => checkPointApi.list(selectedCategory || undefined),
    enabled: selectedCategory !== '' && !isGuidelamp,
    staleTime: 30_000,
  })
  // 유도등: floor_plan_markers에서 가져와서 CheckPointFull 형태로 변환
  const { data: guidelampMarkers, isLoading: glLoading } = useQuery({
    queryKey: ['floorplan-markers-all', 'guidelamp'],
    queryFn: () => floorPlanMarkerApi.listAll('guidelamp'),
    enabled: isGuidelamp,
    staleTime: 30_000,
  })
  const MARKER_TYPE_LABEL: Record<string, string> = {
    ceiling_exit: '천장피난구', wall_exit: '벽부피난구', room_corridor: '거실통로', hallway_corridor: '복도통로', stair_corridor: '계단통로', seat_corridor: '객석통로',
  }
  const FLOOR_CODE: Record<string, string> = { '8-1F': '9', '8F': '8', '7F': '7', '6F': '6', '5F': '5', '3F': '3', '2F': '2', '1F': '1' }
  const guidelampAsCp = (guidelampMarkers ?? []).map(m => {
    const fc = FLOOR_CODE[m.floor] ?? m.floor
    const x = Math.round((m as any).x_pct ?? 0)
    const y = Math.round((m as any).y_pct ?? 0)
    const locNo = `${fc}-${x}-${y}`
    return {
      id: m.id, qrCode: '', floor: m.floor, zone: (m as any).zone ?? 'basement',
      location: m.label || MARKER_TYPE_LABEL[(m as any).marker_type] || '유도등',
      category: '유도등', description: MARKER_TYPE_LABEL[(m as any).marker_type] ?? '',
      locationNo: locNo, isActive: 1, createdAt: (m as any).created_at ?? '',
    }
  }) as any as CheckPointFull[]
  const isLoading = isGuidelamp ? glLoading : cpLoading
  const cpListRaw = isGuidelamp ? guidelampAsCp : (checkPoints ?? [])
  const cpList = cpListRaw.filter(cp => {
    // 'basement' 와 'common' 은 동일 의미 (0081 마이그레이션 전후 호환).
    if (filterZone) {
      const eq = (a?: string, b?: string) => a === b ||
        ((a === 'basement' || a === 'common') && (b === 'basement' || b === 'common'))
      if (!eq(cp.zone, filterZone)) return false
    }
    if (filterFloor && cp.floor !== filterFloor) return false
    return true
  })

  // 현재 데이터에서 사용 가능한 층 목록 (필터용)
  const FLOOR_ORDER = ['8-1F','8F','7F','6F','5F','3F','2F','1F','LOBBY','M','B1','B1F','B2','B2F','B3','B3F','B4','B4F','B5','B5F']
  const availableFloors = [...new Set(cpListRaw.filter(cp => {
    if (!filterZone) return true
    const eq = (a?: string, b?: string) => a === b ||
      ((a === 'basement' || a === 'common') && (b === 'basement' || b === 'common'))
    return eq(cp.zone, filterZone)
  }).map(cp => cp.floor).filter(Boolean))]
    .sort((a, b) => (FLOOR_ORDER.indexOf(a) === -1 ? 99 : FLOOR_ORDER.indexOf(a)) - (FLOOR_ORDER.indexOf(b) === -1 ? 99 : FLOOR_ORDER.indexOf(b)))

  if (me?.role !== 'admin') return null

  const ModalWrapper = isDesktop ? DesktopModal : BottomSheet
  const categoryOptions = categories.length > 0 ? categories : CATEGORIES_FALLBACK

  return (
    <div className="page-wrapper flex flex-col h-full overflow-hidden bg-surface-page">
      <style>{`
        @keyframes blink { 0%,100%{opacity:.6} 50%{opacity:.3} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        input:focus { border-color: var(--acl) !important; }
        select:focus { border-color: var(--acl) !important; outline: none; }
      `}</style>

      {/* 헤더 */}
      {isDesktop ? (
        <div className="desktop-header hidden lg:flex items-center gap-3 px-6 py-3 border-b border-border-default" style={{ flexShrink: 0 }}>
          <div className="cat-select-wrap" style={{ position: 'relative', width: 220 }}>
            <select
              className="hdr-select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{ ...INPUT_STYLE, height: 36, appearance: 'none', cursor: 'pointer', paddingRight: 32 }}
            >
              <option value="">전체 (카테고리 선택)</option>
              {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="chevron-icon" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <ChevronDown size={16} color="var(--text-secondary)" />
            </div>
          </div>
          <select className="filter-select" value={filterZone} onChange={e => { setFilterZone(e.target.value); setFilterFloor('') }}
            style={{ height: 36, padding: '0 10px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', color: 'var(--text-primary)', cursor: 'pointer', appearance: 'none' as any }}>
            <option value="">전체 구역</option>
            <option value="office">사무동</option>
            <option value="research">연구동</option>
            <option value="basement">지하</option>
          </select>
          <select className="filter-select" value={filterFloor} onChange={e => setFilterFloor(e.target.value)}
            style={{ height: 36, padding: '0 10px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', color: 'var(--text-primary)', cursor: 'pointer', appearance: 'none' as any }}>
            <option value="">전체 층</option>
            {availableFloors.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <span className="count-label text-caption" style={{ flex: 1, color: 'var(--text-tertiary)' }}>
            {selectedCategory && !isLoading ? `${cpList.length}개 개소` : ''}
          </span>
          <button className="add-btn flex items-center gap-2 px-3 py-2 rounded-lg bg-accent text-white text-label font-bold"
            onClick={() => setModal({ open: true, mode: 'add' })}
            style={{ height: 36, border: 'none', cursor: 'pointer' }}>
            <Plus size={16} color="#fff" />
            개소 추가
          </button>
        </div>
      ) : (
        <div className="mobile-header flex flex-col lg:hidden px-4 py-3 gap-2" style={{ flexShrink: 0 }}>
          <div className="mob-cat-wrap" style={{ position: 'relative' }}>
            <select className="mob-cat-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
              style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer', paddingRight: 36 }}>
              <option value="">전체 (카테고리 선택)</option>
              {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="chevron-icon" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <ChevronDown size={16} color="var(--text-secondary)" />
            </div>
          </div>
          {selectedCategory && (
            <div className="mob-filter-row" style={{ display: 'flex', gap: 6 }}>
              <select className="mob-filter-select text-caption" value={filterZone} onChange={e => { setFilterZone(e.target.value); setFilterFloor('') }}
                style={{ flex: 1, height: 36, padding: '0 8px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <option value="">전체 구역</option>
                <option value="office">사무동</option>
                <option value="research">연구동</option>
                <option value="basement">지하</option>
              </select>
              <select className="mob-filter-select text-caption" value={filterFloor} onChange={e => setFilterFloor(e.target.value)}
                style={{ flex: 1, height: 36, padding: '0 8px', borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--surface-sunken)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <option value="">전체 층</option>
                {availableFloors.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <span className="mob-count text-caption leading-none" style={{ color: 'var(--text-tertiary)', alignSelf: 'center', whiteSpace: 'nowrap' }}>{cpList.length}개</span>
            </div>
          )}
        </div>
      )}

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-auto min-h-0">
        {selectedCategory === '' && (
          <div className="state-empty flex items-center justify-center h-full text-text-secondary text-body-sm">
            카테고리를 선택하면 개소 목록이 표시됩니다
          </div>
        )}
        {selectedCategory !== '' && isLoading && (
          <div className="skeleton-wrap" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton-bar" style={SKELETON_STYLE} />
            <div className="skeleton-bar" style={SKELETON_STYLE} />
            <div className="skeleton-bar" style={SKELETON_STYLE} />
          </div>
        )}
        {selectedCategory !== '' && isError && !isLoading && (
          <div className="state-error flex items-center justify-center h-full text-text-secondary text-body-sm">
            데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요
          </div>
        )}

        {/* 데스크톱: 테이블 */}
        {isDesktop && selectedCategory !== '' && !isLoading && !isError && (
          <div className="desktop-content data-table" style={{ padding: '0 24px 24px' }}>
            <div className="desktop-table-wrap">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="border-b-2 border-border-default text-left">
                    <th className="text-caption font-bold" style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>개소명</th>
                    <th className="text-caption font-bold" style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>카테고리</th>
                    <th className="text-caption font-bold" style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>구역</th>
                    <th className="text-caption font-bold" style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>층</th>
                    <th className="text-caption font-bold" style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>위치번호</th>
                    <th className="text-caption font-bold" style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>상태</th>
                    <th className="text-caption font-bold" style={{ padding: '10px 8px', color: 'var(--text-secondary)', width: 60 }}>액션</th>
                  </tr>
                </thead>
                <tbody>
                  {cpList.length === 0 && (
                    <tr><td colSpan={7} className="text-body-sm" style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-tertiary)' }}>해당 카테고리에 개소가 없습니다</td></tr>
                  )}
                  {cpList.map(cp => (
                    <tr key={cp.id}
                      onClick={() => setModal({ open: true, mode: 'edit', target: cp })}
                      className="border-b border-border-default"
                      style={{ cursor: 'pointer', opacity: cp.isActive === 0 ? 0.45 : 1, transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-sunken)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '10px 8px', fontWeight: 600, color: 'var(--text-primary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cp.location}</td>
                      <td className="category-badge" style={{ padding: '10px 8px' }}>
                        <span className="text-caption leading-none" style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(59,130,246,.13)', color: 'var(--accent)' }}>
                          {cp.category}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{ZONE_LABEL[cp.zone] ?? cp.zone}</td>
                      <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{cp.floor}</td>
                      <td className="locationno-cell text-caption font-mono" style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{cp.locationNo || '-'}</td>
                      <td className="status-cell" style={{ padding: '10px 8px' }}>
                        <span className="text-caption leading-none"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: cp.isActive !== 0 ? 'var(--status-safe-bar)' : 'var(--text-tertiary)' }}>
                          <span className="status-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: cp.isActive !== 0 ? 'var(--status-safe-bar)' : 'var(--text-tertiary)' }} />
                          {cp.isActive !== 0 ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="action-cell" style={{ padding: '10px 8px' }}>
                        <span className="text-caption font-bold" style={{ color: 'var(--accent)' }}>수정</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 모바일: 카드 리스트 */}
        {!isDesktop && selectedCategory !== '' && !isLoading && !isError && (
          <div className="card-list" style={{ padding: '0 16px 80px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cpList.length === 0 && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '40px 16px' }}>
                <div className="text-body font-bold" style={{ color: 'var(--text-primary)' }}>해당 카테고리에 개소가 없습니다</div>
                <div className="text-caption" style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>개소 추가 버튼을 눌러 점검 개소를 등록하세요</div>
              </div>
            )}
            {cpList.map(cp => (
              <CheckPointCard key={cp.id} cp={cp} onEdit={() => setModal({ open: true, mode: 'edit', target: cp })} />
            ))}
          </div>
        )}
      </div>

      {/* 모바일 FAB */}
      {!isDesktop && (
        <div className="mobile-fab-wrap" style={{ position: 'sticky', bottom: 0, padding: '0 16px', paddingBottom: 'calc(16px + var(--sab))', background: 'var(--surface-page)' }}>
          <button className="mobile-fab-btn w-full h-[52px] bg-accent text-white rounded-xl flex items-center justify-center gap-2 text-body-sm font-bold"
            onClick={() => setModal({ open: true, mode: 'add' })}
            style={{ border: 'none', cursor: 'pointer' }}>
            <Plus size={18} color="#fff" />
            개소 추가
          </button>
        </div>
      )}

      {/* 모달 */}
      {modal.open && (
        <ModalWrapper onClose={() => setModal({ open: false, mode: 'add' })} title={modal.mode === 'add' ? '개소 추가' : '개소 수정'}>
          {modal.mode === 'add'
            ? <AddCheckPointRouter onClose={() => setModal({ open: false, mode: 'add' })} />
            : <CheckPointModalContent mode={modal.mode} cp={modal.target} onClose={() => setModal({ open: false, mode: 'add' })} />}
        </ModalWrapper>
      )}
    </div>
  )
}
