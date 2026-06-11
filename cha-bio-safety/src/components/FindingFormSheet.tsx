import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { legalApi } from '../utils/api'
import { useMultiPhotoUpload, PhotoUploadFailedError } from '../hooks/useMultiPhotoUpload'
import { PhotoSourceModal } from './PhotoSourceModal'
import type { LegalFinding } from '../types'

// ── 구역/층 매핑 ─────────────────────────────────────────────────
const ZONES = [
  { key: 'research', label: '연구동' },
  { key: 'office',   label: '사무동' },
  { key: 'bridge',   label: '브릿지' },
  { key: 'basement', label: '지하' },
] as const

const ZONE_FLOORS: Record<string, string[]> = {
  research: ['8-1F','8F','7F','6F','5F','3F','2F','1F'],
  office:   ['8-1F','8F','7F','6F','5F','3F','2F','1F'],
  bridge:   ['7F','6F','5F','3F'],
  basement: ['B1','M','B2','B3','B4','B5'],
}

const FINDING_ITEMS = [
  '직접입력',
  '감지기(불꽃)','감지기(열)','감지기(연기)',
  '방화문','방화셔터','비상방송설비','비상콘센트',
  'DIV','소방펌프','소화기','소화전','스프링클러','시각경보기',
  '완강기','유도등','자동화재탐지설비',
  '전실제연댐퍼','청정소화약제',
]

// ── reverse parse helper (edit mode) ─────────────────────────────
// description: ' — ' 첫 토큰이 FINDING_ITEMS 안에 있으면 inspectionItem 으로 분리,
//   그 외 케이스에선 전체를 description 에 유지 (직접입력 강제 X)
// location: '${zoneLabel} ${floor} ${rest...}' 공백 split,
//   첫 토큰 = ZONES.label, 둘째 토큰 = ZONE_FLOORS[zone], 나머지 = locationDetail
function parseFindingForEdit(
  f: LegalFinding,
  zones: typeof ZONES,
  zoneFloors: typeof ZONE_FLOORS,
  findingItems: string[],
): {
  zone: string
  floor: string
  locationDetail: string
  inspectionItem: string
  customItem: string
  description: string
} {
  let inspectionItem = ''
  const customItem = ''
  let description = f.description ?? ''
  const sep = ' — '
  const idx = description.indexOf(sep)
  if (idx > 0) {
    const head = description.slice(0, idx)
    const tail = description.slice(idx + sep.length)
    if (findingItems.includes(head) && head !== '직접입력') {
      inspectionItem = head
      description = tail
    }
    // head 가 리스트에 없으면 전체를 description 에 유지 (직접입력 강제 X)
  }

  let zone = ''
  let floor = ''
  let locationDetail = ''
  const loc = (f.location ?? '').trim()
  if (loc) {
    const parts = loc.split(/\s+/)
    const matchedZone = zones.find(z => z.label === parts[0])
    if (matchedZone) {
      zone = matchedZone.key
      const floors = zoneFloors[matchedZone.key] ?? []
      if (parts[1] && floors.includes(parts[1])) {
        floor = parts[1]
        locationDetail = parts.slice(2).join(' ')
      } else {
        locationDetail = parts.slice(1).join(' ')
      }
    } else {
      locationDetail = loc
    }
  }

  return { zone, floor, locationDetail, inspectionItem, customItem, description }
}

// ── Props ────────────────────────────────────────────────────────
export interface FindingFormSheetProps {
  scheduleItemId: string
  mode: 'create' | 'edit'
  finding?: LegalFinding // mode='edit' 시 필수
  onClose: () => void
}

// ── 지적사항 등록/수정 시트 (공유) ─────────────────────────────────
export function FindingFormSheet(props: FindingFormSheetProps) {
  const { scheduleItemId, mode, finding, onClose } = props
  const queryClient = useQueryClient()

  const initial = mode === 'edit' && finding
    ? parseFindingForEdit(finding, ZONES, ZONE_FLOORS, FINDING_ITEMS)
    : { zone: '', floor: '', locationDetail: '', inspectionItem: '', customItem: '', description: '' }

  const [zone, setZone] = useState(initial.zone)
  const [floor, setFloor] = useState(initial.floor)
  const [locationDetail, setLocationDetail] = useState(initial.locationDetail)
  const [inspectionItem, setInspectionItem] = useState(initial.inspectionItem)
  const [customItem, setCustomItem] = useState(initial.customItem)
  const [description, setDescription] = useState(initial.description)
  const [existingKeys, setExistingKeys] = useState<string[]>(
    mode === 'edit' && finding ? [...finding.photoKeys] : []
  )
  const photos = useMultiPhotoUpload('legal-finding')

  const mutation = useMutation({
    mutationFn: async () => {
      const newKeys = await photos.uploadAll()
      const loc = [
        ZONES.find(z => z.key === zone)?.label,
        floor,
        locationDetail.trim(),
      ].filter(Boolean).join(' ')
      const item = inspectionItem === '직접입력' ? customItem.trim() : inspectionItem
      const desc = [item, description.trim()].filter(Boolean).join(' — ')

      if (mode === 'create') {
        return legalApi.createFinding(scheduleItemId, {
          description: desc,
          location: loc || undefined,
          photo_keys: newKeys.length > 0 ? newKeys : undefined,
        })
      }
      // edit
      const mergedKeys = [...existingKeys, ...newKeys]
      return legalApi.updateFinding(scheduleItemId, finding!.id, {
        description: desc,
        location: loc.length > 0 ? loc : null,
        photo_keys: mergedKeys,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-findings', scheduleItemId] })
      queryClient.invalidateQueries({ queryKey: ['legal-rounds'] })
      queryClient.invalidateQueries({ queryKey: ['legal-round', scheduleItemId] })
      if (mode === 'edit' && finding) {
        queryClient.invalidateQueries({ queryKey: ['legal-finding', scheduleItemId, finding.id] })
      }
      toast.success(mode === 'edit' ? '수정되었습니다.' : '지적사항이 등록되었습니다.')
      photos.reset()
      onClose()
    },
    onError: (err) => {
      // 사진 업로드 부분 실패 — 저장은 차단됐고 성공분은 슬롯에 남아 재시도 시 재업로드되지 않음
      if (err instanceof PhotoUploadFailedError) {
        toast.error(err.message)
        return
      }
      toast.error(mode === 'edit'
        ? '수정에 실패했습니다. 다시 시도해 주세요.'
        : '등록에 실패했습니다. 다시 시도해 주세요.')
    },
  })

  const isSubmitting = mutation.isPending || photos.isUploading

  const handleSubmit = () => {
    if (!description.trim()) {
      toast.error('지적 내용을 입력하세요')
      return
    }
    if (existingKeys.length + photos.slots.length > 5) {
      toast.error('사진은 최대 5장입니다')
      return
    }
    mutation.mutate()
  }

  const floors = zone ? (ZONE_FLOORS[zone] ?? []) : []

  const lblStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 6 }
  const inputStyle: React.CSSProperties = {
    background: 'var(--bg3)',
    borderRadius: 9,
    padding: '10px 12px',
    border: '1px solid var(--bd2)',
    width: '100%',
    color: 'var(--t1)',
    fontSize: 13,
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.5,
    minWidth: 0,
    WebkitAppearance: 'none',
    appearance: 'none',
  }
  const chipStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    minWidth: 0,
    padding: '9px 0',
    borderRadius: 8,
    border: active ? '1.5px solid var(--acl)' : '1px solid var(--bd2)',
    background: active ? 'rgba(59,130,246,.12)' : 'var(--bg3)',
    color: active ? 'var(--acl)' : 'var(--t2)',
    fontSize: 13,
    fontWeight: active ? 700 : 400,
    cursor: 'pointer',
    textAlign: 'center',
  })
  const floorChipStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    minWidth: 0,
    padding: '7px 0',
    borderRadius: 8,
    border: active ? '1.5px solid var(--acl)' : '1px solid var(--bd2)',
    background: active ? 'rgba(59,130,246,.12)' : 'var(--bg3)',
    color: active ? 'var(--acl)' : 'var(--t2)',
    fontSize: 12,
    fontWeight: active ? 700 : 400,
    cursor: 'pointer',
    textAlign: 'center',
  })

  const isDesktopSheet = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  const pad = isDesktopSheet ? '0 24px' : '12px 16px'

  const headerTitle = mode === 'edit' ? '지적사항 수정' : '지적사항 등록'
  const submitLabel = mode === 'edit' ? '저장' : '등록'
  const canAddPhoto = existingKeys.length + photos.slots.length < 5

  const formContent = (
    <>
        <div style={{ padding: pad, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* 구역 선택 */}
          <div>
            <div style={lblStyle}>구역</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ZONES.map(z => (
                <button key={z.key} onClick={() => { setZone(z.key); setFloor('') }} style={chipStyle(zone === z.key)}>{z.label}</button>
              ))}
            </div>
          </div>

          {/* 층 선택 */}
          {floors.length > 0 && (
            <div>
              <div style={lblStyle}>층</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {floors.map(f => (
                  <button key={f} onClick={() => setFloor(f)} style={floorChipStyle(floor === f)}>{f}</button>
                ))}
              </div>
            </div>
          )}

          {/* 상세 위치 */}
          <div>
            <div style={lblStyle}>위치 상세</div>
            <input
              type="text"
              value={locationDetail}
              onChange={e => setLocationDetail(e.target.value)}
              placeholder="예: 복도, 계단실, 전기실"
              style={inputStyle}
            />
          </div>

          {/* 지적 항목 (리스트 선택) */}
          <div>
            <div style={lblStyle}>지적 항목</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--bd2)', borderRadius: 9, overflow: 'hidden', maxHeight: 123, overflowY: 'auto' }}>
              {FINDING_ITEMS.map((item, i) => (
                <button
                  key={item}
                  onClick={() => setInspectionItem(item)}
                  style={{
                    padding: '10px 12px',
                    background: inspectionItem === item ? 'rgba(59,130,246,.1)' : 'var(--bg3)',
                    border: 'none',
                    borderBottom: i < FINDING_ITEMS.length - 1 ? '1px solid var(--bd)' : 'none',
                    color: inspectionItem === item ? 'var(--acl)' : 'var(--t1)',
                    fontSize: 13,
                    fontWeight: inspectionItem === item ? 700 : 400,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
            {inspectionItem === '직접입력' && (
              <input
                type="text"
                value={customItem}
                onChange={e => setCustomItem(e.target.value)}
                placeholder="점검 항목을 직접 입력하세요"
                style={{ ...inputStyle, marginTop: 8 }}
              />
            )}
          </div>

          {/* 지적 내용 */}
          <div>
            <div style={lblStyle}>
              지적 내용 <span style={{ color: 'var(--danger)' }}>*</span>
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="지적 내용을 입력하세요"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* 지적 사진 (최대 5장) */}
          <div>
            <div style={lblStyle}>지적 사진 (최대 5장)</div>
            <input ref={photos.cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={photos.handleFiles} />
            <input ref={photos.albumRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={photos.handleFiles} />
            <PhotoSourceModal open={photos.showPicker} onClose={photos.closePicker} onCamera={photos.pickCamera} onAlbum={photos.pickAlbum} restoreCount={photos.vaultPendingCount} onRestore={() => photos.restoreFromVault(Math.max(0, 5 - existingKeys.length - photos.slots.length))} />
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {/* 기존 사진 (edit mode) */}
              {existingKeys.map((k, i) => (
                <div key={`ex-${k}`} style={{ position: 'relative', flexShrink: 0 }}>
                  <img src={`/api/uploads/${k}`} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--bd)', display: 'block' }} />
                  <button
                    aria-label="기존 사진 제거"
                    onClick={() => setExistingKeys(prev => prev.filter((_, j) => j !== i))}
                    style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                  >✕</button>
                </div>
              ))}
              {/* 새 업로드 사진 */}
              {photos.slots.map((slot, i) => (
                <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                  <img src={slot.preview} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--bd)', display: 'block' }} />
                  <button
                    aria-label="사진 제거"
                    onClick={() => photos.removeSlot(i)}
                    style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                  >✕</button>
                  {slot.uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff' }}>업로드 중</div>}
                </div>
              ))}
              {canAddPhoto && (
                <button onClick={photos.openPicker} style={{ width: 72, height: 72, borderRadius: 10, background: 'var(--bg3)', border: '1px dashed var(--bd2)', color: 'var(--t3)', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 22 }}>📷</span>사진 첨부
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div style={{ padding: isDesktopSheet ? '8px 24px 24px' : '4px 16px 32px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={handleSubmit} disabled={isSubmitting} style={{ width: '100%', height: 48, background: 'var(--acl)', borderRadius: 10, border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1 }}>
            {isSubmitting ? '처리 중...' : submitLabel}
          </button>
          <button onClick={onClose} disabled={isSubmitting} style={{ width: '100%', height: 48, background: 'transparent', border: '1px solid var(--bd2)', borderRadius: 10, color: 'var(--t2)', fontSize: 14, cursor: 'pointer' }}>
            취소
          </button>
        </div>
    </>
  )

  if (isDesktopSheet) {
    return (
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
        <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', borderRadius: 12, width: 520, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,.18)' }}>
          <div style={{ padding: '20px 24px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>{headerTitle}</div>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--bg3)', border: 'none', color: 'var(--t2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>✕</button>
          </div>
          {formContent}
        </div>
      </div>
    )
  }

  return (
    <div onClick={onClose} onTouchMove={e => e.stopPropagation()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 50, overscrollBehavior: 'contain' }}>
      <div onClick={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()} style={{ background: 'var(--bg2)', borderRadius: '16px 16px 0 0', animation: 'slideUp 0.28s ease-out both', maxHeight: '90vh', overflowY: 'auto', overscrollBehavior: 'contain' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
          <div style={{ width: 32, height: 4, background: 'var(--bd2)', borderRadius: 2 }} />
        </div>
        <div style={{ padding: '12px 16px 0' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>{headerTitle}</div>
        </div>
        {formContent}
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>
    </div>
  )
}
