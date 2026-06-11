import { useState, useCallback, useRef, useEffect } from 'react'
import { compressImage } from '../utils/imageUtils'
import { useAuthStore } from '../stores/authStore'
import { vaultPut, vaultDelete, vaultList, vaultClaim, vaultRelease, isVaultClaimed } from '../utils/photoVault'
import { photoUploadFailMsg } from './usePhotoUpload'

// ── 다중 사진 업로드 훅 ────────────────────────────────────
const MAX_PHOTOS = 5

export interface PhotoSlot {
  blob: Blob
  preview: string
  uploading: boolean
  key: string | null
  error: string | null
  vaultId: string | null
}

/** uploadAll 부분 실패 — 저장 API 호출 전에 mutation 을 중단시키기 위해 throw 된다. */
export class PhotoUploadFailedError extends Error {
  failedCount: number
  constructor(failedCount: number, vaultBacked = false) {
    super(photoUploadFailMsg(vaultBacked, failedCount))
    this.name = 'PhotoUploadFailedError'
    this.failedCount = failedCount
  }
}

async function uploadBlob(blob: Blob, token: string | null): Promise<string> {
  const form = new FormData()
  form.append('file', blob, 'photo.jpg')
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch('/api/uploads', { method: 'POST', body: form, headers })
  const json = await res.json() as { success: boolean; data?: { key: string } }
  if (!json.success || !json.data?.key) throw new Error('업로드 실패')
  return json.data.key
}

export function useMultiPhotoUpload(vaultScope?: string) {
  const [slots, setSlots] = useState<PhotoSlot[]>([])
  const slotsRef = useRef<PhotoSlot[]>([])
  const cameraRef = useRef<HTMLInputElement>(null)
  const albumRef  = useRef<HTMLInputElement>(null)
  const [showPicker, setShowPicker] = useState(false)
  // Mutex: handleFiles/uploadAll/restoreFromVault 를 직렬화해 슬롯 상태 경합 방지
  const processingRef = useRef<Promise<void>>(Promise.resolve())
  // 보관함에 남아 있고 어느 픽커에도 첨부되어 있지 않은(= 복구 가능한) 사진 수
  const [vaultPendingCount, setVaultPendingCount] = useState(0)

  // Cleanup on unmount — preview 해제 + claim 반납 (entry 는 남아 복구 가능)
  useEffect(() => {
    return () => {
      slotsRef.current.forEach(s => {
        URL.revokeObjectURL(s.preview)
        vaultRelease(s.vaultId)
      })
    }
  }, [])

  const refreshVaultCount = useCallback(async () => {
    if (!vaultScope) return
    const entries = await vaultList(vaultScope)
    setVaultPendingCount(entries.filter(e => !isVaultClaimed(e.id)).length)
  }, [vaultScope])

  useEffect(() => { refreshVaultCount() }, [refreshVaultCount])

  const canAdd = slots.length < MAX_PHOTOS

  const openPicker  = useCallback(() => { setShowPicker(true); refreshVaultCount() }, [refreshVaultCount])
  const closePicker = useCallback(() => setShowPicker(false), [])
  const pickCamera  = useCallback(() => cameraRef.current?.click(), [])
  const pickAlbum   = useCallback(() => albumRef.current?.click(), [])

  const handleFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!files.length) return

    // Chain onto previous work to serialize
    processingRef.current = processingRef.current.then(async () => {
      const remaining = MAX_PHOTOS - slotsRef.current.length
      if (remaining <= 0) return

      const newSlots: PhotoSlot[] = []
      for (const file of files.slice(0, remaining)) {
        try {
          const blob = await compressImage(file)
          const preview = URL.createObjectURL(blob)
          // 첨부 즉시 원본을 보관함에 캐싱 — 업로드 실패/이탈에도 디바이스에 보존
          const vaultId = vaultScope ? await vaultPut(vaultScope, blob) : null
          vaultClaim(vaultId)
          newSlots.push({ blob, preview, uploading: false, key: null, error: null, vaultId })
        } catch {
          // skip
        }
      }

      if (newSlots.length > 0) {
        const merged = [...slotsRef.current, ...newSlots].slice(0, MAX_PHOTOS)
        slotsRef.current = merged
        setSlots(merged)
      }
    })
  }, [vaultScope])

  const removeSlot = useCallback((idx: number) => {
    const slot = slotsRef.current[idx]
    if (slot) {
      URL.revokeObjectURL(slot.preview)
      if (slot.vaultId) {
        vaultRelease(slot.vaultId)
        vaultDelete(slot.vaultId).then(refreshVaultCount)
      }
    }
    const next = slotsRef.current.filter((_, i) => i !== idx)
    slotsRef.current = next
    setSlots(next)
  }, [refreshVaultCount])

  /**
   * 전 슬롯 업로드. 성공한 슬롯은 key 를 기록해 재시도 시 재업로드하지 않는다.
   * 하나라도 실패하면 PhotoUploadFailedError 를 throw — 호출부 mutation 이 저장 전에 중단된다.
   * 보관함 entry 는 여기서 지우지 않는다 — 저장 API 성공 후 reset() 에서 정리 (저장 실패 시 보존).
   */
  const uploadAll = useCallback((): Promise<string[]> => {
    const prev = processingRef.current
    const run = (async () => {
      // Wait for any pending handleFiles to finish
      await prev
      const current = slotsRef.current
      if (current.length === 0) return []
      const token = useAuthStore.getState().token
      const updates = new Map<PhotoSlot, PhotoSlot>()

      for (const slot of current) {
        if (slot.key) continue // 이미 업로드된 슬롯 (부분 실패 후 재시도)
        try {
          const key = await uploadBlob(slot.blob, token)
          updates.set(slot, { ...slot, key, error: null })
        } catch {
          updates.set(slot, { ...slot, error: '업로드 실패' })
        }
      }

      // 성공분 key 를 슬롯 상태에 반영 (재시도 시 skip 의 전제).
      // 업로드 중 removeSlot 으로 빠진 슬롯을 덮어쓰지 않도록 라이브 슬롯에 identity 기준 merge.
      const merged = slotsRef.current.map(s => updates.get(s) ?? s)
      slotsRef.current = merged
      setSlots(merged)

      const failedSlots = merged.filter(s => !s.key)
      if (failedSlots.length > 0) {
        // 실패분 중 하나라도 보관함에 백업돼 있으면 '기기에 임시저장됨' 문구
        throw new PhotoUploadFailedError(failedSlots.length, failedSlots.some(s => !!s.vaultId))
      }
      return merged.map(s => s.key as string)
    })()
    // 업로드 동안 들어오는 handleFiles/restore 는 완료 후로 직렬화
    processingRef.current = run.then(() => undefined, () => undefined)
    return run
  }, [])

  /**
   * 보관함의 복구 가능 사진을 다시 첨부. maxToAdd 로 폼 차원의 잔여 한도를 줄 수 있다
   * (예: 서버 기존 사진 + 슬롯 합산 5장 제한). 복구된 장수 반환.
   */
  const restoreFromVault = useCallback((maxToAdd?: number): Promise<number> => {
    const prev = processingRef.current
    const run = (async () => {
      if (!vaultScope) return 0
      await prev
      const entries = await vaultList(vaultScope)
      const remaining = Math.min(
        MAX_PHOTOS - slotsRef.current.length,
        maxToAdd ?? Number.POSITIVE_INFINITY,
      )
      const toRestore = entries.filter(e => !isVaultClaimed(e.id)).slice(0, Math.max(0, remaining))
      if (toRestore.length === 0) return 0
      const restored: PhotoSlot[] = toRestore.map(e => {
        vaultClaim(e.id)
        return {
          blob: e.blob,
          preview: URL.createObjectURL(e.blob),
          uploading: false,
          key: null,
          error: null,
          vaultId: e.id,
        }
      })
      const merged = [...slotsRef.current, ...restored].slice(0, MAX_PHOTOS)
      slotsRef.current = merged
      setSlots(merged)
      refreshVaultCount()
      return restored.length
    })()
    processingRef.current = run.then(() => undefined, () => undefined)
    return run
  }, [vaultScope, refreshVaultCount])

  /** 저장 성공 후 호출 (호출부 onSuccess). 업로드 완료된 슬롯의 보관함 entry 를 이 시점에 정리. */
  const reset = useCallback(() => {
    slotsRef.current.forEach(s => {
      URL.revokeObjectURL(s.preview)
      vaultRelease(s.vaultId)
      // 업로드+저장까지 끝난 슬롯만 보관함에서 제거 — 미업로드분은 복구용 안전망으로 남김
      if (s.key && s.vaultId) vaultDelete(s.vaultId)
    })
    slotsRef.current = []
    setSlots([])
    refreshVaultCount()
  }, [refreshVaultCount])

  const isUploading = slots.some(s => s.uploading)
  const hasPhotos = slots.length > 0

  return {
    cameraRef,
    albumRef,
    showPicker,
    openPicker,
    closePicker,
    pickCamera,
    pickAlbum,
    slots,
    canAdd,
    hasPhotos,
    handleFiles,
    removeSlot,
    uploadAll,
    reset,
    isUploading,
    vaultPendingCount,
    restoreFromVault,
  }
}
